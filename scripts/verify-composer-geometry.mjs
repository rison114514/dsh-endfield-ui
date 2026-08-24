#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CLIENT_URL = pathToFileURL(join(ROOT, 'endfield-ui-plugin', 'client.js')).href
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const work = mkdtempSync(join(tmpdir(), 'endfield-composer-geometry-'))
const fixture = join(work, 'fixture.html')

const html = `<!doctype html>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font: 20px/28px Arial, sans-serif; }
  .fixture { position: relative; width: 280px; height: 170px; margin: 20px; }
  .shikitor { position: absolute; inset: 0; padding: 8px; font: inherit; }
  .shikitor-container { position: relative; width: 100%; height: 100%; }
  .shikitor-output { position: absolute; inset: 0; overflow: auto; }
  .shikitor-output-line { position: relative; width: 100%; min-height: 28px; white-space: pre-wrap; overflow-wrap: break-word; }
  .dsh-shikitor-token-icon { display: inline-block; position: relative; width: 1em; height: 1em; color: transparent; }
  .dsh-shikitor-token-icon svg { position: absolute; inset: 2px; }
  .dsh-shikitor-session-reference { display: inline-flex; width: 96px; height: 24px; vertical-align: middle; }
  textarea { position: absolute; inset: 8px; width: 264px; height: 154px; padding: 0; border: 0; font: inherit; line-height: 28px; }
</style>
<div id="fixture" class="fixture">
  <div id="target" class="shikitor">
    <div id="container" class="shikitor-container">
      <div id="output" class="shikitor-output"><div id="line" class="shikitor-output-line"></div></div>
      <div class="shikitor-cursors"><div class="shikitor-cursor"></div></div>
    </div>
  </div>
  <textarea id="input"></textarea>
</div>
<pre id="result">pending</pre>
<script>
  window.__ModuleLoader__ = {
    load(definition) {
      window.endfieldClient = definition.factory((id) => id === 'react' ? { Component: class {} } : {})
    }
  }
</script>
<script src="${CLIENT_URL}"></script>
<script>
  const api = window.endfieldClient.__testing
  const target = document.getElementById('target')
  const container = document.getElementById('container')
  const output = document.getElementById('output')
  const line = document.getElementById('line')
  const input = document.getElementById('input')
  const results = []
  const add = (name, actual, expected) => {
    const dx = Math.abs(actual.x - expected.x)
    const dy = Math.abs(actual.y - expected.y)
    results.push({ name, pass: dx <= 1 && dy <= 1, dx, dy, actual, expected })
  }
  const sourceSpan = (text, start, end, className = '') => {
    const span = document.createElement('span')
    span.dataset.dshShikitorSourceStart = String(start)
    span.dataset.dshShikitorSourceEnd = String(end)
    span.dataset.dshShikitorSourceKind = 'text'
    span.className = className
    span.append(text)
    return span
  }
  const rangePoint = (node, offset) => {
    const range = document.createRange()
    range.setStart(node, offset)
    range.collapse(true)
    const rect = range.getBoundingClientRect()
    const base = container.getBoundingClientRect()
    const lineRect = node.parentElement.closest('.shikitor-output-line').getBoundingClientRect()
    const row = Math.max(0, Math.round((rect.top - lineRect.top) / 28))
    return {
      x: rect.left - base.left + output.scrollLeft,
      y: lineRect.top + row * 28 - base.top + output.scrollTop,
    }
  }
  const setCaret = (value, offset) => {
    input.value = value
    input.setSelectionRange(offset, offset)
  }

  // Slash/skill tokens: the projected slash occupies a fixed icon cell while
  // the raw textarea slash does not. The projected caret must use the former.
  line.replaceChildren()
  const slash = sourceSpan('/', 0, 1, 'dsh-shikitor-token-icon')
  slash.append(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
  const skill = sourceSpan('director-skill', 1, 15)
  line.append(slash, skill)
  setCaret('/director-skill', 15)
  add('slash skill end', api.projectedCaretPosition(target, input, output), rangePoint(skill.firstChild, 14))
  setCaret('/director-skill', 1)
  const slashRect = slash.getBoundingClientRect()
  const baseRect = container.getBoundingClientRect()
  add('slash icon boundary', api.projectedCaretPosition(target, input, output), {
    x: slashRect.right - baseRect.left + output.scrollLeft,
    y: slashRect.top - baseRect.top + output.scrollTop,
  })

  // A protected session/file projection is atomic. Raw offsets inside it snap
  // to the nearest projected edge rather than measuring the hidden source.
  line.replaceChildren()
  const reference = document.createElement('span')
  reference.className = 'dsh-shikitor-session-reference'
  reference.dataset.dshShikitorSourceStart = '0'
  reference.dataset.dshShikitorSourceEnd = '30'
  reference.dataset.dshShikitorSourceKind = 'session'
  reference.textContent = '历史会话'
  line.append(reference)
  const refRect = reference.getBoundingClientRect()
  setCaret('x'.repeat(30), 8)
  add('atomic reference start', api.projectedCaretPosition(target, input, output), {
    x: refRect.left - baseRect.left + output.scrollLeft,
    y: line.getBoundingClientRect().top - baseRect.top + output.scrollTop,
  })
  setCaret('x'.repeat(30), 24)
  add('atomic reference end', api.projectedCaretPosition(target, input, output), {
    x: refRect.right - baseRect.left + output.scrollLeft,
    y: line.getBoundingClientRect().top - baseRect.top + output.scrollTop,
  })

  // Mixed CJK text is long enough to wrap several times in the 264px field.
  line.replaceChildren()
  const mixedText = Array.from({ length: 20 }, (_, index) => '第' + index + '行中文 English，标点。').join(' ')
  const mixed = sourceSpan(mixedText, 0, mixedText.length)
  line.append(mixed)
  setCaret(mixedText, mixedText.length)
  add('multiline cjk soft wrap', api.projectedCaretPosition(target, input, output), rangePoint(mixed.firstChild, mixedText.length))

  // Reflow after width changes must be measured from the new projection.
  document.getElementById('fixture').style.width = '220px'
  input.style.width = '204px'
  setCaret(mixedText, Math.floor(mixedText.length * 0.72))
  add('resize reflow', api.projectedCaretPosition(target, input, output), rangePoint(mixed.firstChild, input.selectionEnd))

  // Internal projection scrolling must not change the published content-space
  // coordinate (CSS subtracts --shikitor-scroll-t when drawing the caret).
  output.scrollTop = 70
  setCaret(mixedText, mixedText.length)
  add('internal scroll', api.projectedCaretPosition(target, input, output), rangePoint(mixed.firstChild, mixedText.length))

  // Selection geometry must be derived from the same visible projection. A
  // protected reference is selected as one atom, while wrapped text produces
  // one or more rectangles per visual row without exposing textarea glyphs.
  line.replaceChildren(reference)
  input.value = 'x'.repeat(30)
  input.setSelectionRange(8, 24)
  const atomicSelection = api.projectedSelectionRects(target, input, output)
  results.push({
    name: 'atomic projected selection',
    pass: atomicSelection.length === 1 && Math.abs(atomicSelection[0].width - reference.getBoundingClientRect().width) <= 1,
    count: atomicSelection.length,
    width: atomicSelection[0] && atomicSelection[0].width,
  })

  output.scrollTop = 0
  line.replaceChildren(mixed)
  input.value = mixedText
  input.setSelectionRange(4, mixedText.length - 4)
  const wrappedSelection = api.projectedSelectionRects(target, input, output)
  const selectionLayer = document.createElement('div')
  container.appendChild(selectionLayer)
  const renderedSelection = api.renderProjectedSelection(target, input, output, selectionLayer)
  results.push({
    name: 'wrapped projected selection',
    pass: wrappedSelection.length > 1
      && renderedSelection.length === wrappedSelection.length
      && selectionLayer.children.length === wrappedSelection.length,
    count: wrappedSelection.length,
    rendered: selectionLayer.children.length,
  })

  api.publishProjectedCaret(target, input, output)
  const rootTop = target.style.getPropertyValue('--shikitor-cursor-t')
  const layerTop = target.querySelector('.shikitor-cursors').style.getPropertyValue('--shikitor-cursor-t')
  results.push({ name: 'dual scope publication', pass: rootTop !== '' && rootTop === layerTop, rootTop, layerTop })
  document.getElementById('result').textContent = JSON.stringify(results)
</script>`

try {
  writeFileSync(fixture, html)
  const run = spawnSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--allow-file-access-from-files',
    '--dump-dom',
    pathToFileURL(fixture).href,
  ], { encoding: 'utf8', timeout: 30000 })
  if (run.status !== 0) {
    throw new Error(run.stderr || `Chrome exited with ${run.status}`)
  }
  const match = run.stdout.match(/<pre id="result">([^<]+)<\/pre>/)
  if (!match) throw new Error('geometry fixture did not return results')
  const results = JSON.parse(match[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&'))
  let failed = false
  for (const result of results) {
    failed ||= !result.pass
    console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${result.name}  ${JSON.stringify(result)}`)
  }
  if (failed) process.exitCode = 1
} finally {
  rmSync(work, { recursive: true, force: true })
}
