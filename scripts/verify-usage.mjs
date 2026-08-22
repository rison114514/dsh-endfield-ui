#!/usr/bin/env node
/**
 * verify-usage.mjs — 标准版插件「真实使用」级可用性校验。
 *
 * 在隔离 DSH_HOME 中覆盖 HANDOFF 阶段 1 的可用性验收：
 *   1. 安装后 profiles/web/package.json：依赖存在 + dsh.profile.bundles 含插件
 *   2. 插件自身 package.json（node_modules）：dsh.client.immediately=true +
 *      dsh.client.inject 非空 + dsh.bundle.patch=./cordis.patch.yml
 *   3. cordis.patch.yml 注册 id=endfield-ui
 *   4. dsh --profile web 启动（标准 bundle，无 --patch）
 *   5. GET / → 200 且为 html
 *   6. GET /endfield-ui/theme.css → 200，内容含终末地标记（#fff44f / .ef-overlay / --ef-yellow）
 *   7. 插件 client 入口由 harness 经包名路由暴露 GET /@rison/dsh-endfield-ui/client.js → 200
 *   8. 已安装 client.js（node_modules）含 overrideTokens 与插件 id（运行时注入可加载）
 *   9. client.js / theme.css 引用的全部素材（10 图 + 4 字体）→ 200
 *
 * 用法：
 *   node scripts/verify-usage.mjs [plugin-tgz-or-dir]
 *   默认 plugin-tgz-or-dir = ../rison-dsh-endfield-ui-0.6.0.tgz
 */

import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = process.argv[2] || join(ROOT, 'rison-dsh-endfield-ui-0.6.0.tgz')
const DSH_BIN = process.env.DSH_BIN || 'dsh'
const PLUGIN_NAME = '@rison/dsh-endfield-ui'
const PORT_TIMEOUT_MS = 30000

const results = []
const ok = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond, detail })
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
}

function runDsh(args, env) {
  const r = spawnSync(DSH_BIN, args, { env, encoding: 'utf8', timeout: 60000, killSignal: 'SIGTERM' })
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' }
}

function startServer(env) {
  return new Promise((resolve) => {
    const child = spawn(DSH_BIN, ['--profile', 'web', '--port', '0'], { env, stdio: ['ignore', 'pipe', 'pipe'] })
    let buf = ''
    let settled = false
    const finish = (url, stderr) => { if (!settled) { settled = true; resolve({ url, child, stderr }) } }
    const onData = (chunk) => {
      buf += chunk.toString()
      const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)/)
      if (m) finish(`http://127.0.0.1:${m[1]}`, '')
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    setTimeout(() => finish(null, 'timeout waiting for port'), PORT_TIMEOUT_MS)
    child.on('error', (e) => finish(null, String(e)))
  })
}

async function get(url) {
  try {
    const res = await fetch(url, { method: 'GET' })
    const text = await res.text()
    return { status: res.status, ct: res.headers.get('content-type') || '', body: text, ok: res.ok }
  } catch (e) {
    return { status: -1, ct: '', body: '', ok: false, error: String(e) }
  }
}

async function main() {
  const DSH_HOME = mkdtempSync(join(tmpdir(), 'dsh-verify-'))
  const env = { ...process.env, DSH_HOME }
  console.log(`[verify] 隔离 DSH_HOME = ${DSH_HOME}`)
  console.log(`[verify] 安装目标      = ${TARGET}`)
  console.log(`[verify] dsh 可执行     = ${DSH_BIN}`)

  const PLUGIN_ROOT = join(DSH_HOME, 'profiles', 'web', 'node_modules', PLUGIN_NAME)

  // 1. 安装
  const add = runDsh(['plugin', '--profile', 'web', 'add', TARGET], env)
  ok('plugin add 退出码为 0', add.status === 0, add.stderr.trim().split('\n').slice(-3).join(' '))

  // 2. profile 清单：依赖 + bundles
  const profilePkgPath = join(DSH_HOME, 'profiles', 'web', 'package.json')
  const pkg = JSON.parse(readFileSync(profilePkgPath, 'utf8'))
  const deps = { ...(pkg.dependencies || {}), ...(pkg.optionalDependencies || {}) }
  ok('插件依赖进入 profiles/web/package.json', !!deps[PLUGIN_NAME], `deps=${JSON.stringify(deps)}`)
  const bundles = pkg.dsh?.profile?.bundles || pkg.profile?.bundles || []
  ok('dsh.profile.bundles 自动包含插件', Array.isArray(bundles) && bundles.includes(PLUGIN_NAME), `bundles=${JSON.stringify(bundles)}`)

  // 3. 插件自身清单（node_modules 下）：client / bundle 声明
  const pluginPkgPath = join(PLUGIN_ROOT, 'package.json')
  const pluginPkg = JSON.parse(readFileSync(pluginPkgPath, 'utf8'))
  ok('插件 package.json：dsh.client.immediately = true', pluginPkg.dsh?.client?.immediately === true, JSON.stringify(pluginPkg.dsh?.client))
  ok('插件 package.json：dsh.client.inject 非空', Array.isArray(pluginPkg.dsh?.client?.inject) && pluginPkg.dsh.client.inject.length > 0, JSON.stringify(pluginPkg.dsh?.client?.inject))
  ok('插件 package.json：dsh.bundle.patch = ./cordis.patch.yml', pluginPkg.dsh?.bundle?.patch === './cordis.patch.yml', String(pluginPkg.dsh?.bundle?.patch))

  // 4. cordis.patch.yml 注册 id=endfield-ui
  const patchPath = join(PLUGIN_ROOT, 'cordis.patch.yml')
  let patchOk = false
  if (existsSync(patchPath)) {
    const txt = readFileSync(patchPath, 'utf8')
    patchOk = /id:\s*endfield-ui/.test(txt) && /name:\s*'@rison\/dsh-endfield-ui'/.test(txt)
  }
  ok('cordis.patch.yml 注册 id=endfield-ui', patchOk, patchOk ? patchPath : 'missing')

  // 5. 启动
  const { url, child, stderr } = await startServer(env)
  ok('dsh --profile web 启动（无 --patch）', !!url, url ? url : stderr.trim().split('\n').slice(-5).join(' '))

  if (url) {
    // 6. 首屏
    const idx = await get(`${url}/`)
    ok('GET / → 200 且为 html', idx.status === 200 && /html/.test(idx.ct), `status=${idx.status} ct=${idx.ct}`)
    ok('首屏 HTML 含 endfield 字样（bundle 已激活）', /endfield/i.test(idx.body), `len=${idx.body.length}`)

    // 7. theme.css 内容
    const css = await get(`${url}/endfield-ui/theme.css`)
    ok('GET /endfield-ui/theme.css → 200', css.status === 200, `status=${css.status}`)
    ok('theme.css 含终末地标记（#fff44f / .ef-overlay / --ef-yellow）',
      css.ok && css.body.includes('#fff44f') && css.body.includes('.ef-overlay') && css.body.includes('--ef-yellow'),
      `len=${css.body.length}`)
    ok('theme.css 含新网格背景 + 等高线纹理 + 圆形进度环样式',
      css.ok && css.body.includes('chat-grid-bg.jpg') && css.body.includes('contour-texture.png') && css.body.includes('.ef-context-ring'),
      `len=${css.body.length}`)
    ok('theme.css 含命令按钮（aria-label=命令）柠檬黄覆盖',
      css.ok && css.body.includes('aria-label="命令"') && css.body.includes('var(--ef-yellow)'),
      `len=${css.body.length}`)

    // 8. 插件 client 入口经包名路由暴露
    const clientRoute = await get(`${url}/@rison/dsh-endfield-ui/client.js`)
    ok('GET /@rison/dsh-endfield-ui/client.js → 200（harness 加载 client 入口）', clientRoute.status === 200, `status=${clientRoute.status} ct=${clientRoute.ct}`)

    // 9. 已安装 client.js 内容（运行时注入逻辑可加载）
    const clientFile = join(PLUGIN_ROOT, 'client.js')
    let clientOk = false
    if (existsSync(clientFile)) {
      const c = readFileSync(clientFile, 'utf8')
      // 真实数据源：订阅官方 contextPressure 投影（faceOf），而非 DOM 扒取(JObwrW) 或 sin 模拟。
      clientOk = c.includes('@rison/dsh-endfield-ui') && c.includes('overrideTokens') && c.includes("'/endfield-ui/theme.css'")
        && c.includes('ContextRing') && c.includes('ef-context-ring')
        && c.includes('connectRing') && c.includes("faceOf('contextPressure')")
        && !c.includes('JObwrW_root') && !/Math\.sin/.test(c)
    }
    ok('已安装 client.js 含注入逻辑 + 订阅官方 contextPressure 真实数据源（无 DOM 扒取/模拟）', clientOk, clientFile)

    // 10. 全部素材可达（12 图 + 4 字体）
    const assets = [
      '/endfield-ui/assets/ring.png',
      '/endfield-ui/assets/operator-xaihi.png',
      '/endfield-ui/assets/triangles.svg',
      '/endfield-ui/assets/endfield-logo.png',
      '/endfield-ui/assets/deepseek-harness-brand.png',
      '/endfield-ui/assets/prof-caster.jpg',
      '/endfield-ui/assets/prof-support.jpg',
      '/endfield-ui/assets/ele-electric.jpg',
      '/endfield-ui/assets/ele-ice.jpg',
      '/endfield-ui/assets/operator-icon.png',
      '/endfield-ui/assets/chat-grid-bg.jpg',
      '/endfield-ui/assets/contour-texture.png',
      '/endfield-ui/assets/endfield-sidebar-texture.png',
      '/endfield-ui/assets/endfield-stripes-texture.svg',
      '/endfield-ui/assets/harmony-regular.woff2',
      '/endfield-ui/assets/harmony-bold.woff2',
      '/endfield-ui/assets/novecento.woff2',
      '/endfield-ui/assets/space-grotesk.woff2',
    ]
    let allAssets = true
    const assetDetail = []
    for (const a of assets) {
      const r = await get(`${url}${a}`)
      const good = r.status === 200 && /image|svg|font/.test(r.ct)
      if (!good) { allAssets = false; assetDetail.push(`${a}=${r.status}/${r.ct}`) }
    }
    ok(`全部 ${assets.length} 个素材（图+字体）→ 200 且为图片/字体`, allAssets, assetDetail.length ? assetDetail.join(' ') : `${assets.length} 个均就绪`)
  }

  if (child && !child.killed) {
    child.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 800))
    if (!child.killed) child.kill('SIGKILL')
  }
  rmSync(DSH_HOME, { recursive: true, force: true })

  const failed = results.filter((r) => !r.pass)
  console.log(`\n[verify] 结果：${results.length - failed.length}/${results.length} 通过`)
  process.exit(failed.length === 0 ? 0 : 1)
}

main().catch((e) => { console.error('[verify] 异常：', e); process.exit(1) })
