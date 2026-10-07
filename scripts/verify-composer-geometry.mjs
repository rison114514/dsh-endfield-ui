#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const clientPath = join(ROOT, 'endfield-ui-plugin', 'client.js')
const cssPath = join(ROOT, 'endfield-ui-plugin', 'theme.css')
const packagePath = join(ROOT, 'endfield-ui-plugin', 'package.json')
const client = readFileSync(clientPath, 'utf8')
const css = readFileSync(cssPath, 'utf8')
const manifest = JSON.parse(readFileSync(packagePath, 'utf8'))

let failed = false
function check(name, pass, detail = '') {
  failed ||= !pass
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`)
}

check('Endfield release is 1.0.2', manifest.version === '1.0.2', manifest.version)
check('Incompatible Shikitor is no longer an automatic dependency', !manifest.dependencies?.['dsh-shikitor'], manifest.dependencies?.['dsh-shikitor'])
check('better-sidebar is an optional exact peer, not a transitive startup row',
  manifest.peerDependencies?.['dsh-better-sidebar'] === '0.18.0-alpha.0'
  && manifest.peerDependenciesMeta?.['dsh-better-sidebar']?.optional === true,
  manifest.peerDependencies?.['dsh-better-sidebar'])
check('Endfield does not inject or fork the Shikitor geometry service',
  !/const inject = \[[^\]]*['"]shikitor['"]/.test(client)
  && !client.includes("ctx.shikitor.register('sender'"))
check('Endfield has no duplicate character-boundary scanner',
  !client.includes('collectProjectedBoundaries')
  && !client.includes('collapsedBoundaryRect')
  && !client.includes('projectedCaretPosition')
  && !client.includes("style.setProperty('--shikitor-cursor-t'")
  && !client.includes("style.setProperty('--shikitor-cursor-l'"))
check('Reflow hook invalidates native Shikitor geometry after rendered line resize',
  client.includes('function connectComposerReflowSync()')
  && client.includes("resizeObserver.observe(lineStack)")
  && client.includes('const layoutSignature = () =>')
  && client.includes('if (nextLayout === previousLayout) return')
  && client.includes("output.dispatchEvent(new view.Event('scroll'))")
  && client.includes('mutationObserver.observe(lineStack, {')
  && client.includes('subtree: true')
  && client.includes("root.closest('.shikitor--attached')")
  && client.includes("root.querySelectorAll('.shikitor--attached').forEach(attach)"))
check('Endfield has no duplicate selection DOM layer',
  !client.includes('ef-shikitor-selection-layer')
  && !client.includes('renderProjectedSelection')
  && !css.includes('.ef-shikitor-selection-layer'))

check('Attached textarea glyphs and native caret stay transparent',
  /textarea\.shikitor-input--attached\s*\{[^}]*color:\s*transparent\s*!important[^}]*caret-color:\s*transparent\s*!important/s.test(css))
check('Plain-text selection remains visible without revealing duplicate glyphs',
  /textarea\.shikitor-input--attached::selection\s*\{[^}]*color:\s*transparent\s*!important[^}]*background:\s*var\(--ef-selection-fill\)\s*!important/s.test(css))
check('Inline atom selection uses the native Shikitor layer',
  /\.shikitor--attached \.dsh-shikitor-selection\s*\{[^}]*background:\s*var\(--ef-selection-fill\)\s*!important/s.test(css))
check('Projected caret stays dark on the paper composer',
  /\.shikitor--attached\s*\{[^}]*--shikitor-caret-color:\s*var\(--ef-composer-ink\)\s*!important/s.test(css))
check('Projected text stays dark on the paper composer',
  /\[data-composer-card\] \.shikitor--attached\s*\{[^}]*--shikitor-fg-color:\s*var\(--ef-composer-ink\)\s*!important/s.test(css)
  && /data-dsh-shikitor-source-kind="text"\]:not\(\.dsh-shikitor-token-icon\)[\s\S]*?-webkit-text-fill-color:\s*var\(--ef-composer-ink\)\s*!important/s.test(css))
check('Command icons remain semantic dark grey',
  /\.dsh-shikitor-token-icon > svg\s*\{[^}]*color:\s*var\(--ef-composer-ink-secondary\)\s*!important/s.test(css))
check('File and session atoms retain readable Endfield styling',
  /\.dsh-shikitor-file-reference, \.dsh-shikitor-session-reference\)[\s\S]*?background:\s*var\(--ef-composer-surface-muted\)\s*!important/s.test(css)
  && /dsh-shikitor-file-reference__label[\s\S]*?color:\s*var\(--ef-composer-ink\)\s*!important/s.test(css))
check('Completion menu keeps its separate dark palette',
  /\.shikitor--attached \.shikitor-popup-completions-board\s*\{[\s\S]*?background:[\s\S]*?rgba\(27,31,35,\.98\)/s.test(css)
  && /\.shikitor--attached \.shikitor-completion-item\s*\{[^}]*color:\s*#eef0ed\s*!important/s.test(css))

const installedCandidates = [
  process.env.DSH_SHIKITOR_CLIENT,
  join(homedir(), '.dsh', 'profiles', 'web', 'node_modules', 'dsh-shikitor', 'dist', 'client.js'),
].filter(Boolean)
const installedPath = installedCandidates.find(existsSync)
if (installedPath) {
  const installed = readFileSync(installedPath, 'utf8')
  check('Installed Shikitor supplies the sole sender token projection',
    installed.includes('name: "dsh-sender-inline-tokens"')
    && installed.includes('plugins: [')
    && installed.includes('tokenPlugin'),
    installedPath)
  check('Installed Shikitor owns scroll and cursor variables',
    installed.includes('target.style.setProperty(cssvar("scroll-t")')
    && installed.includes('target.style.setProperty("--shikitor-cursor-t"'),
    installedPath)
} else {
  console.log('SKIP  Installed Shikitor ownership inspection  set DSH_SHIKITOR_CLIENT to enable')
}

if (failed) process.exitCode = 1
