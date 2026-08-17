#!/usr/bin/env node
/**
 * smoke-install.mjs — 在隔离 DSH_HOME 中验证插件“一条命令安装并自动生效”。
 *
 * 覆盖 HANDOFF 3.5 / 3.6 的关键验收点：
 *   1. 插件依赖进入 profiles/web/package.json
 *   2. dsh.profile.bundles 自动出现 @rison/dsh-endfield-ui
 *   3. 启动不使用 --patch
 *   4. GET /endfield-ui/theme.css 返回 200
 *   5. 卸载后依赖移除
 *
 * 用法：
 *   node scripts/smoke-install.mjs [plugin-add-target]
 *     plugin-add-target 默认指向 ../endfield-ui-plugin（目录）
 *     也可传本地 .tgz 或 github:owner/repo#tag
 *   环境变量：DSH_BIN 指定 dsh 可执行文件（默认 PATH 中的 dsh）
 */

import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PLUGIN_DIR = join(ROOT, 'endfield-ui-plugin')
const ADD_TARGET = process.argv[2] || PLUGIN_DIR
const DSH_BIN = process.env.DSH_BIN || 'dsh'
const PLUGIN_NAME = '@rison/dsh-endfield-ui'
const PORT_TIMEOUT_MS = 30000

const results = []
const ok = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond, detail })
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
}

function runDsh(args, env, timeoutMs = 60000) {
  const r = spawnSync(DSH_BIN, args, {
    env,
    encoding: 'utf8',
    timeout: timeoutMs,
    killSignal: 'SIGTERM',
  })
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' }
}

// 启动 dsh web 服务，捕获 127.0.0.1 端口，返回 { url, child, stdout, stderr }
function startServer(env) {
  return new Promise((resolve) => {
    const child = spawn(DSH_BIN, ['--profile', 'web', '--port', '0'], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let buf = ''
    let settled = false
    const finish = (url, stdout, stderr) => {
      if (settled) return
      settled = true
      resolve({ url, child, stdout, stderr })
    }
    const onData = (chunk) => {
      buf += chunk.toString()
      const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)/)
      if (m) finish(`http://127.0.0.1:${m[1]}`, buf, '')
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    setTimeout(() => finish(null, buf, 'timeout waiting for port'), PORT_TIMEOUT_MS)
    child.on('error', (e) => finish(null, buf, String(e)))
  })
}

async function fetchHead(urlPath) {
  try {
    const res = await fetch(urlPath, { method: 'GET' })
    return res.status
  } catch {
    return -1
  }
}

async function main() {
  const DSH_HOME = mkdtempSync(join(tmpdir(), 'dsh-smoke-'))
  const env = { ...process.env, DSH_HOME }
  console.log(`[smoke] 隔离 DSH_HOME = ${DSH_HOME}`)
  console.log(`[smoke] 安装目标     = ${ADD_TARGET}`)
  console.log(`[smoke] dsh 可执行    = ${DSH_BIN}`)

  const add = runDsh(['plugin', '--profile', 'web', 'add', ADD_TARGET], env)
  ok('plugin add 退出码为 0', add.status === 0, add.stderr.trim().split('\n').slice(-3).join(' '))

  const profilePkgPath = join(DSH_HOME, 'profiles', 'web', 'package.json')
  const profilePkgExists = existsSync(profilePkgPath)
  ok('profiles/web/package.json 已生成', profilePkgExists)
  let depPresent = false
  let bundlesHasPlugin = false
  if (profilePkgExists) {
    const pkg = JSON.parse(readFileSync(profilePkgPath, 'utf8'))
    const deps = { ...(pkg.dependencies || {}), ...(pkg.optionalDependencies || {}), ...(pkg.devDependencies || {}) }
    depPresent = Object.keys(deps).some((d) => d === PLUGIN_NAME)
    ok('插件依赖进入 profiles/web/package.json', depPresent, JSON.stringify(deps))
    const bundles = pkg.dsh?.profile?.bundles || pkg.profile?.bundles || []
    bundlesHasPlugin = Array.isArray(bundles) && bundles.includes(PLUGIN_NAME)
    ok('dsh.profile.bundles 自动包含插件', bundlesHasPlugin, `bundles=${JSON.stringify(bundles)}`)
  }

  // 启动（不使用 --patch），验证素材路由自动 200
  const { url, child, stdout, stderr } = await startServer(env)
  ok('dsh --profile web 启动且未使用 --patch', !!url, url ? url : (stderr || stdout).trim().split('\n').slice(-5).join(' '))
  if (url) {
    const cssStatus = await fetchHead(`${url}/endfield-ui/theme.css`)
    ok('GET /endfield-ui/theme.css 返回 200（bundle 自动生效）', cssStatus === 200, `status=${cssStatus}`)
  }
  // 回收子进程
  if (child && !child.killed) {
    child.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 800))
    if (!child.killed) child.kill('SIGKILL')
  }

  // 卸载回流检查
  const rm = runDsh(['plugin', '--profile', 'web', 'remove', PLUGIN_NAME], env)
  ok('plugin remove 退出码为 0', rm.status === 0, rm.stderr.trim().split('\n').slice(-3).join(' '))
  let depRemoved = true
  if (existsSync(profilePkgPath)) {
    const pkg = JSON.parse(readFileSync(profilePkgPath, 'utf8'))
    const deps = { ...(pkg.dependencies || {}), ...(pkg.optionalDependencies || {}) }
    depRemoved = !Object.keys(deps).some((d) => d === PLUGIN_NAME)
  }
  ok('卸载后依赖已从 profiles/web/package.json 移除', depRemoved)

  // 清理
  rmSync(DSH_HOME, { recursive: true, force: true })

  const failed = results.filter((r) => !r.pass)
  console.log(`\n[smoke] 结果：${results.length - failed.length}/${results.length} 通过`)
  process.exit(failed.length === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('[smoke] 异常：', e)
  process.exit(1)
})
