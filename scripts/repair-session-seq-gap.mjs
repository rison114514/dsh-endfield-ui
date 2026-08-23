#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { constants, zstdCompressSync } from 'node:zlib'
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

function argument(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

const input = argument('--input')
const output = argument('--output')
const write = process.argv.includes('--write')
const verifyOnly = process.argv.includes('--verify')

if (!input) {
  throw new Error('usage: repair-session-seq-gap.mjs --input <session.jsonl.zstd> [--output <file> --write]')
}
if (write && !output) throw new Error('--write requires --output')
if (write && existsSync(output)) throw new Error(`refusing to overwrite existing output: ${output}`)

const dshBin = realpathSync('/Users/rison/.local/bin/dsh')
const dshRoot = dirname(dirname(dshBin))
const dshRequire = createRequire(join(dshRoot, 'package.json'))
const sessionModule = await import(pathToFileURL(dshRequire.resolve('@deepseek-ai/dsh-session')).href)
const { decodeStorageRecord, packChunkRuns } = sessionModule

function decompress(path) {
  return execFileSync('/opt/homebrew/bin/zstdcat', [path], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
}

function scan(content, { repair = false } = {}) {
  const lines = content.split('\n')
  if (lines.at(-1) === '') lines.pop()
  if (lines.length === 0) throw new Error('empty session log')

  const header = JSON.parse(lines[0])
  if (header.type !== 'session') throw new Error('first line is not a session header')

  const events = []
  const stale = []
  let firstGapLine

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const record = JSON.parse(lines[lineIndex])
    const decoded = decodeStorageRecord(record)
    for (const event of decoded) {
      const expected = events.length
      if (event.seq === expected) {
        events.push(event)
        continue
      }
      if (repair && event.seq < expected) {
        firstGapLine ??= lineIndex + 1
        stale.push({ line: lineIndex + 1, seq: event.seq, expected, type: event.type })
        continue
      }
      throw new Error(
        `sequence discontinuity at physical line ${lineIndex + 1}: expected ${expected}, got ${event.seq} (${event.type})`,
      )
    }
  }

  return { header, events, stale, firstGapLine, physicalLines: lines.length }
}

const originalText = decompress(input)
if (verifyOnly) {
  const verified = scan(originalText)
  console.log(JSON.stringify({
    input,
    sessionId: verified.header.id,
    physicalLines: verified.physicalLines,
    events: verified.events.length,
    finalSeq: verified.events.at(-1)?.seq,
    contiguous: true,
  }, null, 2))
  process.exit(0)
}

const repaired = scan(originalText, { repair: true })
if (repaired.stale.length === 0) throw new Error('no stale sequence events found; refusing to produce a changed file')

// Post-gap aggregate events can refer to stale streamed chunks by their reused
// sequence numbers. Those references must be removed; otherwise they would point
// at the older, unrelated lifecycle events that legitimately own those numbers.
const staleSeqs = new Set(repaired.stale.map(({ seq }) => seq))
let filteredSourceRefs = 0
for (const event of repaired.events) {
  if (event.seq < repaired.stale[0].expected || !Array.isArray(event.sourceEventSeqs)) continue
  const kept = event.sourceEventSeqs.filter((seq) => !staleSeqs.has(seq))
  filteredSourceRefs += event.sourceEventSeqs.length - kept.length
  if (kept.length !== event.sourceEventSeqs.length) event.sourceEventSeqs = kept
}

const summary = {
  input,
  sessionId: repaired.header.id,
  physicalLines: repaired.physicalLines,
  retainedEvents: repaired.events.length,
  firstGapLine: repaired.firstGapLine,
  staleEventsSkipped: repaired.stale.length,
  staleEvents: repaired.stale,
  filteredSourceRefs,
  finalSeq: repaired.events.at(-1)?.seq,
}

if (write) {
  const headerBytes = Buffer.from(`${JSON.stringify(repaired.header)}\n`)
  const storageRecords = packChunkRuns(repaired.events)
  const eventBytes = Buffer.from(`${storageRecords.map((record) => JSON.stringify(record)).join('\n')}\n`)
  const checksumOptions = { params: { [constants.ZSTD_c_checksumFlag]: 1 } }
  const encoded = Buffer.concat([
    zstdCompressSync(headerBytes, checksumOptions),
    zstdCompressSync(eventBytes, checksumOptions),
  ])
  writeFileSync(output, encoded, { flag: 'wx', mode: 0o600 })

  const verified = scan(decompress(output))
  if (verified.header.id !== repaired.header.id) throw new Error('output header identity changed')
  if (verified.events.length !== repaired.events.length) throw new Error('output event count changed during round trip')
  if (verified.events.at(-1)?.seq !== repaired.events.at(-1)?.seq) throw new Error('output final sequence changed')
  summary.output = output
  summary.outputBytes = readFileSync(output).length
  summary.roundTripVerified = true
}

console.log(JSON.stringify(summary, null, 2))
