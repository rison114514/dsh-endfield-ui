#!/usr/bin/env node
/**
 * dist-mac-local.mjs — 本地自用构建编排（HANDOFF 4.5）。
 *
 * 依次完成：插件语法检查 → npm pack 资源完整性 → 清理并生成 .app →
 * ad-hoc 签名 → codesign --verify --deep --strict。
 *
 * 用法：
 *   node scripts/dist-mac-local.mjs [arm64|x64]
 *   默认 arm64。x64 在有无 Intel 实机/CI 验证前仅作构建练习，不宣称可用。
 */

import { spawnSync } from 'node:child_process'
import { rmSync, existsSync, readFileSync, readdirSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')
const PLUGIN_DIR = join(APP_DIR, '..', 'endfield-ui-plugin')
const ARCH = process.argv[2] || 'arm64'
const APP_NAME = 'DSH 终末地工作台'
const OUT_DIR = join(APP_DIR, 'release')
const APP_PATH = join(OUT_DIR, `${APP_NAME}-darwin-${ARCH}`, `${APP_NAME}.app`)
const PLUGIN_VERSION = JSON.parse(readFileSync(join(PLUGIN_DIR, 'package.json'), 'utf8')).version
const PLUGIN_ARCHIVE = `rison-dsh-endfield-ui-${PLUGIN_VERSION}.tgz`
const ELECTRON_VERSION = JSON.parse(readFileSync(join(APP_DIR, 'node_modules', 'electron', 'package.json'), 'utf8')).version
const npmCache = join(tmpdir(), 'dsh-endfield-npm-cache')
const buildEnv = { ...process.env, npm_config_cache: npmCache }

function findCachedElectronZipDir() {
  const filename = `electron-v${ELECTRON_VERSION}-darwin-${ARCH}.zip`
  const cacheRoot = join(homedir(), 'Library', 'Caches', 'electron')
  if (!existsSync(cacheRoot)) return null
  if (existsSync(join(cacheRoot, filename))) return cacheRoot
  for (const entry of readdirSync(cacheRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && existsSync(join(cacheRoot, entry.name, filename))) {
      return join(cacheRoot, entry.name)
    }
  }
  return null
}

const results = []
const ok = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond })
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
}
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, {
  cwd: APP_DIR,
  env: buildEnv,
  encoding: 'utf8',
  ...opts,
})

console.log(`[dist] 目标架构 = ${ARCH}`)

// 1. 插件语法检查
for (const f of ['index.js', 'client.js']) {
  const r = run(process.platform === 'win32' ? 'node.exe' : 'node', ['--check', join(PLUGIN_DIR, f)])
  ok(`插件语法检查 ${f}`, r.status === 0, r.stderr.trim())
}

// 桌面入口必须以 no-open + loopback 模式启动 DSH。没有 --no-open 时，
// DSH 会在 Electron 窗口之外再打开默认浏览器，形成第二个会话写入者。
const mainFile = join(APP_DIR, 'main.cjs')
const mainSyntax = run(process.platform === 'win32' ? 'node.exe' : 'node', ['--check', mainFile])
const mainSource = readFileSync(mainFile, 'utf8')
ok('桌面入口仅启动私有 no-open 服务',
  mainSyntax.status === 0
    && /const DSH_START_ARGS = \[[\s\S]*'--host', '127\.0\.0\.1'[\s\S]*'--no-open'[\s\S]*'--port', '0'[\s\S]*\]/.test(mainSource)
    && /spawnDsh\(executable, DSH_START_ARGS,/.test(mainSource)
    && /function authenticatedWebUrlFrom\(output\)/.test(mainSource)
    && /mainWindow\.loadURL\(authenticatedUrl\)/.test(mainSource)
    && /bundledPluginInstallTarget\(\)/.test(mainSource)
    && /\['dsh-better-sidebar', 'dsh-shikitor'\]/.test(mainSource),
  mainSyntax.stderr.trim())

// 2. npm pack 资源完整性
const pack = run('npm', ['pack', '--dry-run'], { cwd: PLUGIN_DIR })
const packOut = `${pack.stdout}\n${pack.stderr}`
const totalMatch = packOut.match(/total files:\s*(\d+)/)
const totalFiles = totalMatch ? Number(totalMatch[1]) : 0
const hasKeyFiles = /cordis\.patch\.yml/.test(packOut)
  && /theme\.css/.test(packOut)
  && /index\.js/.test(packOut)
  && /client\.js/.test(packOut)
ok('npm pack 资源完整', pack.status === 0 && totalFiles >= 25 && hasKeyFiles, `totalFiles=${totalFiles}`)

// 真实生成当前版本 tarball。桌面 App 必须安装归档而不是 link 源目录，
// 否则 pnpm 不会在 profile 根目录物化插件的组合依赖。
const materialize = run('npm', ['pack'], { cwd: PLUGIN_DIR })
ok('生成当前版本插件归档',
  materialize.status === 0 && existsSync(join(PLUGIN_DIR, PLUGIN_ARCHIVE)),
  PLUGIN_ARCHIVE)

const stage = run('npm', ['run', 'prepare:embedded-plugin'])
ok('桌面包仅暂存当前插件归档',
  stage.status === 0
    && existsSync(join(APP_DIR, '.build-resources', 'endfield-ui-plugin', PLUGIN_ARCHIVE)),
  stage.stderr.trim())

// 3. 清理并生成 .app
rmSync(join(OUT_DIR, `${APP_NAME}-darwin-${ARCH}`), { recursive: true, force: true })
const packCmd = ARCH === 'x64' ? 'pack:mac:x64' : 'pack:mac'
const electronZipDir = findCachedElectronZipDir()
const buildArgs = ['run', packCmd]
if (electronZipDir) buildArgs.push('--', `--electron-zip-dir=${electronZipDir}`)
const build = run('npm', buildArgs)
ok('electron-packager 构建 .app', build.status === 0 && existsSync(APP_PATH), build.stderr.trim().split('\n').slice(-3).join(' '))
ok('App 内含当前版本插件归档',
  existsSync(join(APP_PATH, 'Contents', 'Resources', 'endfield-ui-plugin', PLUGIN_ARCHIVE)),
  PLUGIN_ARCHIVE)

// 4. ad-hoc 签名 + 校验
if (existsSync(APP_PATH)) {
  const sign = run('bash', ['-c',
    `codesign --force --deep --sign - ${JSON.stringify(APP_PATH)} ` +
    `&& codesign --verify --deep --strict ${JSON.stringify(APP_PATH)}`])
  ok('codesign ad-hoc 签名与校验', sign.status === 0, sign.stderr.trim().split('\n').slice(-3).join(' '))
}

const failed = results.filter((r) => !r.pass)
console.log(`\n[dist] 结果：${results.length - failed.length}/${results.length} 通过`)
if (failed.length === 0) {
  console.log(`[dist] 产物：${APP_PATH}`)
}
process.exit(failed.length === 0 ? 0 : 1)
