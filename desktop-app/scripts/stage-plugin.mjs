#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const pluginDir = join(appDir, '..', 'endfield-ui-plugin')
const stageDir = join(appDir, '.build-resources', 'endfield-ui-plugin')
const appVersion = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf8')).version
const pluginVersion = JSON.parse(readFileSync(join(pluginDir, 'package.json'), 'utf8')).version
const archiveName = `rison-dsh-endfield-ui-${pluginVersion}.tgz`
const archive = join(pluginDir, archiveName)

if (appVersion !== pluginVersion) {
  throw new Error(`App ${appVersion} 与插件 ${pluginVersion} 版本不一致`)
}
const npmCli = process.env.npm_execpath && existsSync(process.env.npm_execpath)
  ? process.env.npm_execpath
  : null
const pack = spawnSync(npmCli ? process.execPath : (process.platform === 'win32' ? 'npm.cmd' : 'npm'), [
  ...(npmCli ? [npmCli] : []),
  'pack',
], {
  cwd: pluginDir,
  env: { ...process.env, npm_config_cache: join(tmpdir(), 'dsh-endfield-npm-cache') },
  encoding: 'utf8',
  windowsHide: true,
  shell: !npmCli && process.platform === 'win32',
})
if (pack.status !== 0 || !existsSync(archive)) {
  throw new Error(`无法生成当前插件归档：${pack.stderr || pack.stdout || archive}`)
}

rmSync(stageDir, { recursive: true, force: true })
mkdirSync(stageDir, { recursive: true })
copyFileSync(join(pluginDir, 'package.json'), join(stageDir, 'package.json'))
copyFileSync(archive, join(stageDir, archiveName))
console.log(`[stage-plugin] ${archiveName}`)
