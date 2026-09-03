#!/usr/bin/env node

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const main = readFileSync(join(appDir, 'main.cjs'), 'utf8')
const preload = readFileSync(join(appDir, 'preload.cjs'), 'utf8')
const onboarding = readFileSync(join(appDir, 'onboarding.js'), 'utf8')
const builder = readFileSync(join(appDir, 'electron-builder.yml'), 'utf8')

assert.match(main, /const RECOMMENDED_DSH_VERSION = '0\.1\.2-alpha\.5'/)
assert.match(main, /const RECOMMENDED_PNPM_VERSION = '11\.7\.0'/)
assert.match(main, /const MINIMUM_NODE_VERSION = '22\.19\.0'/)
assert.match(main, /npmCli,\s*'install', '--global'/)
assert.doesNotMatch(main, /\bsudo\b|\bwinget\b|\bbrew\b/)
assert.match(main, /shell\.openExternal\('https:\/\/nodejs\.org\/en\/download'\)/)
assert.match(main, /github\.com\/deepseek-ai\/deepseek-harness/)
assert.match(main, /allowedDshVersion/)
assert.match(main, /app\.requestSingleInstanceLock\(\)/)
assert.match(main, /'--host', '127\.0\.0\.1',[\s\S]*'--no-open',[\s\S]*'--port', '0'/)
assert.match(preload, /getDiagnostics/)
assert.match(preload, /installRecommended/)
assert.match(preload, /onSetupProgress/)
assert.match(onboarding, /window\.confirm/)
assert.match(onboarding, /\.dsh/)
assert.match(builder, /target: nsis/)
assert.match(builder, /target: zip/)
assert.match(builder, /DSH-Endfield-Workbench-Setup-/)
assert.match(builder, /DSH-Endfield-Workbench-Portable-/)

console.log('[verify-bootstrap] 19/19 passed')
