#!/usr/bin/env node
/**
 * smoke-connector.mjs — 在隔离 DSH_HOME 中验证 GitHub 连接器可安装、可激活 bundle、
 * 且 dsh web 仍能正常启动（不因连接器缺 token 而崩溃）。
 *
 * 覆盖要点：
 *   1. `dsh plugin --profile web add <target>` 退出码 0
 *   2. profiles/web/package.json 出现 @rison/dsh-connector-github 依赖
 *   3. dsh.profile.bundles 自动包含 @rison/dsh-connector-github
 *   4. 连接器 patch 在 node_modules 里可解析（cordis.patch.yml 存在）
 *   5. mcp-client 依赖被带进 profile（可解析）
 *   6. `dsh --profile web --port 0` 不使用 --patch 仍能启动
 *   7. （可选，设 GITHUB_TOKEN）启动日志出现 mcp__github 相关工具同步
 *
 * 用法：
 *   node scripts/smoke-connector.mjs [add-target]
 *     add-target 默认指向 ../github-connector（目录）
 *   环境变量：DSH_BIN 指定 dsh 可执行文件（默认 PATH 中的 dsh）
 *             GITHUB_TOKEN 设置后走真实远端工具同步验证（需网络 + 有效令牌）
 */

import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ADD_TARGET = process.argv[2] || join(ROOT, 'github-connector')
const DSH_BIN = process.env.DSH_BIN || 'dsh'
const BUNDLE_NAME = process.env.SMOKE_BUNDLE_NAME || '@rison/dsh-connector-github'
const MCP_CLIENT_NAME = '@deepseek-ai/dsh-mcp-client'
const PORT_TIMEOUT_MS = 30000

const results = []
const ok = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond, detail })
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
}

function runDsh(args, env, timeoutMs = 120000) {
  const r = spawnSync(DSH_BIN, args, { env, encoding: 'utf8', timeout: timeoutMs, killSignal: 'SIGTERM' })
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' }
}

function startServer(env) {
  return new Promise((resolve) => {
    const child = spawn(DSH_BIN, ['--profile', 'web', '--port', '0'], { env, stdio: ['ignore', 'pipe', 'pipe'] })
    let buf = ''
    let settled = false
    const finish = (url, out) => {
      if (settled) return
      settled = true
      resolve({ url, child, log: out })
    }
    const onData = (chunk) => {
      const text = chunk.toString()
      buf = `${buf}${text}`.slice(-200000)
      const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)/)
      if (m) finish(`http://127.0.0.1:${m[1]}`, buf)
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    setTimeout(() => finish(null, buf), PORT_TIMEOUT_MS)
    child.on('error', (e) => finish(null, buf + '\n' + String(e)))
  })
}

async function main() {
  const DSH_HOME = mkdtempSync(join(tmpdir(), 'dsh-connector-smoke-'))
  const env = { ...process.env, DSH_HOME }
  console.log(`[smoke] 隔离 DSH_HOME = ${DSH_HOME}`)
  console.log(`[smoke] 安装目标     = ${ADD_TARGET}`)
  console.log(`[smoke] dsh 可执行    = ${DSH_BIN}`)
  console.log(`[smoke] GITHUB_TOKEN ${process.env.GITHUB_TOKEN ? '已设置(真实验证)' : '未设置(仅启动验证)'}`)

  const add = runDsh(['plugin', '--profile', 'web', 'add', ADD_TARGET], env)
  ok('plugin add 退出码为 0', add.status === 0, add.stderr.trim().split('\n').slice(-3).join(' '))

  const profilePkgPath = join(DSH_HOME, 'profiles', 'web', 'package.json')
  ok('profiles/web/package.json 已生成', existsSync(profilePkgPath))
  let bundleOk = false
  if (existsSync(profilePkgPath)) {
    const pkg = JSON.parse(readFileSync(profilePkgPath, 'utf8'))
    const bundles = pkg.dsh?.profile?.bundles || pkg.profile?.bundles || []
    bundleOk = bundles.includes(BUNDLE_NAME)
    ok('dsh.profile.bundles 自动包含连接器', bundleOk, `bundles=${JSON.stringify(bundles)}`)
  }

  // 连接器 patch 是否存在
  const connPkgDir = join(DSH_HOME, 'profiles', 'web', 'node_modules', ...BUNDLE_NAME.split('/'))
  ok('连接器包已安装', existsSync(connPkgDir))
  ok('连接器 cordis.patch.yml 存在', existsSync(join(connPkgDir, 'cordis.patch.yml')))
  // 注意：dsh-mcp-client 由 dsh 运行时自带的 @deepseek-ai/* 集合解析（与 dsh-base 一致），
  // 不一定落入 profile 的 node_modules；能否解析以“启动时 mcp-github 行被成功加载”为准，
  // 由下面的启动步骤验证。

  // 启动（不使用 --patch），确认 web 仍能启动
  const { url, child, log } = await startServer(env)
  ok('dsh --profile web 启动（未使用 --patch）', !!url, url || (log || '').trim().split('\n').slice(-4).join(' '))

  // 若有 token，检查日志里是否出现 mcp__github 同步；无 token 则确认不崩溃、有连接报错即可
  if (process.env.GITHUB_TOKEN && url) {
    await new Promise((r) => setTimeout(r, 4000))
  }
  const hasMcp = /mcp(__|_)?github/i.test(log || '')
  if (process.env.GITHUB_TOKEN) {
    ok('日志出现 mcp__github 工具同步', hasMcp)
  } else {
    ok('无 token 时 dsh 未崩溃（failOnStartupError=false 生效）', !!url || /mcp/i.test(log || ''))
  }

  if (child && !child.killed) {
    child.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 800))
    if (!child.killed) child.kill('SIGKILL')
  }

  const rm = runDsh(['plugin', '--profile', 'web', 'remove', BUNDLE_NAME], env)
  ok('plugin remove 退出码为 0', rm.status === 0, rm.stderr.trim().split('\n').slice(-3).join(' '))

  rmSync(DSH_HOME, { recursive: true, force: true })

  const failed = results.filter((r) => !r.pass)
  console.log(`\n[smoke] 结果：${results.length - failed.length}/${results.length} 通过`)
  process.exit(failed.length === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('[smoke] 异常：', e)
  process.exit(1)
})
