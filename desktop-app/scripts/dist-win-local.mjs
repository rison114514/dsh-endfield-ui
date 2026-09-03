#!/usr/bin/env node
/**
 * Windows 正式产物编排。推荐在 GitHub Actions windows-latest 运行，
 * 同时生成 NSIS Setup.exe 和保留完整目录结构的 portable ZIP。
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const pluginDir = join(appDir, '..', 'endfield-ui-plugin')
const outDir = join(appDir, 'release')
const appVersion = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf8')).version
const pluginVersion = JSON.parse(readFileSync(join(pluginDir, 'package.json'), 'utf8')).version
const archiveName = `rison-dsh-endfield-ui-${pluginVersion}.tgz`
const setupPath = join(outDir, `DSH-Endfield-Workbench-Setup-${appVersion}-x64.exe`)
const portablePath = join(outDir, `DSH-Endfield-Workbench-Portable-${appVersion}-x64.zip`)
const buildEnv = { ...process.env, npm_config_cache: join(tmpdir(), 'dsh-endfield-npm-cache') }
const results = []

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: appDir,
    env: buildEnv,
    encoding: 'utf8',
    windowsHide: true,
    ...options,
  })
}

function runNpm(args, options = {}) {
  const npmCli = process.env.npm_execpath && existsSync(process.env.npm_execpath)
    ? process.env.npm_execpath
    : null
  return run(
    npmCli ? process.execPath : (process.platform === 'win32' ? 'npm.cmd' : 'npm'),
    [...(npmCli ? [npmCli] : []), ...args],
    { shell: !npmCli && process.platform === 'win32', ...options },
  )
}

function ok(name, condition, detail = '') {
  results.push({ name, pass: Boolean(condition) })
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`)
}

for (const file of ['main.cjs', 'preload.cjs', 'onboarding.js']) {
  const check = run(process.platform === 'win32' ? 'node.exe' : 'node', ['--check', join(appDir, file)])
  ok(`语法检查 ${basename(file)}`, check.status === 0, check.stderr.trim())
}

const mainSource = readFileSync(join(appDir, 'main.cjs'), 'utf8')
const preloadSource = readFileSync(join(appDir, 'preload.cjs'), 'utf8')
ok('Windows 引导与安全安装链路',
  mainSource.includes('RECOMMENDED_DSH_VERSION')
    && mainSource.includes('findNpmCli')
    && mainSource.includes("'install', '--global'")
    && mainSource.includes("'--no-open'")
    && preloadSource.includes('installRecommended')
    && preloadSource.includes('onSetupProgress'))

const pack = runNpm(['pack'], { cwd: pluginDir })
ok('生成当前插件归档', pack.status === 0 && existsSync(join(pluginDir, archiveName)), archiveName)

const stage = runNpm(['run', 'prepare:embedded-plugin'])
const stagedArchive = join(appDir, '.build-resources', 'endfield-ui-plugin', archiveName)
ok('只暂存当前插件', stage.status === 0 && existsSync(stagedArchive), stagedArchive)

rmSync(setupPath, { force: true })
rmSync(portablePath, { force: true })
const build = runNpm(['run', 'build:win'])
ok('NSIS Setup.exe', build.status === 0 && existsSync(setupPath), setupPath)
ok('便携版 ZIP', build.status === 0 && existsSync(portablePath), portablePath)

const failed = results.filter((result) => !result.pass)
console.log(`\n[dist:win] 结果：${results.length - failed.length}/${results.length} 通过`)
if (!failed.length) {
  console.log(`[dist:win] Setup: ${setupPath}`)
  console.log(`[dist:win] Portable: ${portablePath}`)
}
process.exit(failed.length ? 1 : 0)
