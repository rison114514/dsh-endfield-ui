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
 *   默认 plugin-tgz-or-dir = endfield-ui-plugin/rison-dsh-endfield-ui-0.8.5.tgz
 */

import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TARGET_INPUT = process.argv[2] || join(ROOT, 'endfield-ui-plugin', 'rison-dsh-endfield-ui-0.8.5.tgz')
const TARGET = isAbsolute(TARGET_INPUT) ? TARGET_INPUT : resolve(process.cwd(), TARGET_INPUT)
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
  const add = runDsh(['plugin', '--profile', 'web', 'add', TARGET, '--allow-build=node-pty'], env)
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
  if (!existsSync(pluginPkgPath)) throw new Error(`plugin install did not materialize ${pluginPkgPath}`)
  const pluginPkg = JSON.parse(readFileSync(pluginPkgPath, 'utf8'))
  ok('插件 package.json：dsh.client.immediately = true', pluginPkg.dsh?.client?.immediately === true, JSON.stringify(pluginPkg.dsh?.client))
  ok('插件 package.json：dsh.client.inject 非空', Array.isArray(pluginPkg.dsh?.client?.inject) && pluginPkg.dsh.client.inject.length > 0, JSON.stringify(pluginPkg.dsh?.client?.inject))
  ok('插件 package.json：dsh.bundle.patch = ./cordis.patch.yml', pluginPkg.dsh?.bundle?.patch === './cordis.patch.yml', String(pluginPkg.dsh?.bundle?.patch))
  ok('better-sidebar 精确锁定 0.12.3', pluginPkg.dependencies?.['dsh-better-sidebar'] === '0.12.3', JSON.stringify(pluginPkg.dependencies))
  ok('dsh-shikitor 精确锁定 1.0.2', pluginPkg.dependencies?.['dsh-shikitor'] === '1.0.2', JSON.stringify(pluginPkg.dependencies))

  const pluginRequire = createRequire(pluginPkgPath)
  for (const [name, expected] of [['dsh-better-sidebar', '0.12.3'], ['dsh-shikitor', '1.0.2']]) {
    let actual = null
    try {
      actual = JSON.parse(readFileSync(pluginRequire.resolve(`${name}/package.json`), 'utf8')).version
    } catch {}
    ok(`${name}@${expected} 已作为整合依赖安装`, actual === expected, `actual=${actual}`)
  }

  // 4. cordis.patch.yml 注册 id=endfield-ui
  const patchPath = join(PLUGIN_ROOT, 'cordis.patch.yml')
  let patchOk = false
  if (existsSync(patchPath)) {
    const txt = readFileSync(patchPath, 'utf8')
    const betterAt = txt.indexOf('id: better-sidebar')
    const shikitorAt = txt.indexOf('id: dsh-shikitor')
    const endfieldAt = txt.indexOf('id: endfield-ui')
    patchOk = betterAt >= 0 && shikitorAt > betterAt && endfieldAt > shikitorAt
      && /name:\s*'@rison\/dsh-endfield-ui'/.test(txt)
  }
  ok('cordis.patch.yml 按 better-sidebar → Shikitor → Endfield 顺序注册', patchOk, patchOk ? patchPath : 'missing/order mismatch')

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
    ok('theme.css 含右栏 Ardot 工业网格 + 等高线纹理 + 圆形进度环样式',
      css.ok && css.body.includes('ardot/endfield-industrial-grid.webp') && css.body.includes('contour-texture.png') && css.body.includes('.ef-context-ring'),
      `len=${css.body.length}`)
    ok('Ardot 纹理不再叠加黑色遮罩，开屏期间与右栏一起隐藏',
      css.ok
        && /\[data-dsh-better-sidebar\]::before\s*\{[^}]*mix-blend-mode:\s*screen/s.test(css.body)
        && /\[data-dsh-better-sidebar\]::before\s*\{[^}]*opacity:\s*\.1/s.test(css.body)
        && /body\[data-endfield-booting\] \[data-dsh-better-sidebar\]\s*\{[^}]*visibility:\s*hidden\s*!important/s.test(css.body)
        && css.body.includes('body[data-endfield-booting] [data-dsh-better-sidebar]::before')
        && !/\[data-dsh-better-sidebar\]::before\s*\{[^}]*linear-gradient/s.test(css.body),
      '仅保留低透明度提亮网格，开屏期间完整 portal host 不参与绘制')
    ok('Endfield 适配层不覆盖 better-sidebar 原生 fixed 定位',
      css.ok
        && css.body.includes('width: var(--dsh-sidebar-width, 0px)')
        && !/\[data-dsh-better-sidebar\]\s*>\s*\*\s*\{[^}]*position\s*:/s.test(css.body),
      '右栏几何结构完全交还 better-sidebar 0.12.3')
    ok('Electron 标题拖拽区避让右侧工作台与折叠按钮',
      css.ok
        && /\.ef-titlebar\s*\{[^}]*right:\s*max\(var\(--dsh-sidebar-width, 0px\), 78px\)/s.test(css.body)
        && /\.ef-titlebar\s*\{[^}]*-webkit-app-region:\s*drag/s.test(css.body),
      '展开时避让整个右栏，折叠时保留 78px 交互安全区')
    ok('0.7.x 对话背景旋转圆环已恢复并按右栏宽度裁切',
      css.ok
        && /\.ef-atmosphere-ring\s*\{[^}]*animation:\s*ef-ring-drift 32s linear infinite/s.test(css.body)
        && css.body.includes('clip-path: inset(0 var(--dsh-sidebar-width, 0px) 0 56px)')
        && !/\.ef-atmosphere-ring\s*\{[^}]*display:\s*none/s.test(css.body),
      '旋转层只覆盖 conversation，且保留 reduced-motion 降级')
    ok('theme.css 含命令按钮（aria-label=命令）柠檬黄覆盖',
      css.ok && css.body.includes('aria-label="命令"') && css.body.includes('var(--ef-yellow)'),
      `len=${css.body.length}`)
    ok('左侧栏不创建隔离层，原生设置对话框可越过折叠栏完整显示',
      css.ok
        && !/\[data-slot="sidebar"\]\s*>\s*div\s*\{[^}]*isolation:\s*isolate/s.test(css.body)
        && /\[data-slot="sidebar"\]\s*>\s*div::after\s*\{[^}]*z-index:\s*0/s.test(css.body),
      '避免 fixed Settings dialog 被困在 56px sidebarCol 中')
    ok('Shikitor 本地输入使用原生黑色光标，长文本位置不再依赖合成坐标',
      css.ok
        && /\[data-slot="conversation"\] textarea\.shikitor-input--attached\s*\{[^}]*color:\s*transparent\s*!important[^}]*caret-color:\s*#111417\s*!important/s.test(css.body)
        && /\.shikitor--attached \.shikitor-cursors > \.shikitor-cursor:first-child::after\s*\{[^}]*display:\s*none\s*!important/s.test(css.body)
        && /\.shikitor--attached \.shikitor-cursors > \.shikitor-cursor:not\(:first-child\)::after\s*\{[^}]*background-color:\s*#111417\s*!important/s.test(css.body),
      '原生 caret 跟随真实 selection；仅隐藏本地合成光标，保留远端光标')
    ok('新建会话的 Shikitor 可见输入投影固定使用黑色字形',
      css.ok
        && /\[data-composer-card\] \.shikitor--attached\s*\{[^}]*--shikitor-fg-color:\s*#111417\s*!important/s.test(css.body)
        && /\[data-composer-card\] \.shikitor--attached \.shikitor-output-line,[\s\S]*?-webkit-text-fill-color:\s*#111417\s*!important/s.test(css.body)
        && /\[data-composer-card\] \.shikitor--attached \.shikitor-placeholder\s*\{[^}]*color:\s*#6b7378\s*!important/s.test(css.body),
      '白色 hero composer 中输入为黑色，占位提示保留中灰')
    ok('Shikitor 接管后隐藏原生 textarea 文字，斜杠命令只绘制一层',
      css.ok
        && /\[data-slot="conversation"\] textarea\.shikitor-input--attached\s*\{[^}]*color:\s*transparent\s*!important[^}]*-webkit-text-fill-color:\s*transparent\s*!important[^}]*background:\s*transparent\s*!important/s.test(css.body)
        && /body:has\(textarea\[placeholder="描述你想要构建的内容"\]\) textarea\[placeholder="描述你想要构建的内容"\]:not\(\.shikitor-input--attached\)/.test(css.body)
        && /\[data-slot="conversation"\] textarea:not\(\.shikitor-input--attached\)/.test(css.body),
      '避免 /goal、/compact 双字形，并防止 hero textarea 白色渐变遮住 Shikitor 黑字')
    ok('等待审批浅色卡片使用深色标题、原因、命令与按钮文字',
      css.ok
        && /\[data-approval-key\] > div\s*\{[^}]*--dsw-alias-label-primary:\s*#111417/s.test(css.body)
        && /\[data-approval-key\] \[data-approval-scroll\],[\s\S]*?color:\s*#111417\s*!important/s.test(css.body)
        && /\[data-approval-key\] button\s*\{[^}]*color:\s*#111417\s*!important/s.test(css.body),
      '审批卡片以 data-approval-key 稳定锚点隔离，不修改对话区全局 token')

    // 8. 插件 client 入口经包名路由暴露
    const clientRoute = await get(`${url}/@rison/dsh-endfield-ui/client.js`)
    ok('GET /@rison/dsh-endfield-ui/client.js → 200（harness 加载 client 入口）', clientRoute.status === 200, `status=${clientRoute.status} ct=${clientRoute.ct}`)

    // 9. 已安装 client.js 内容（运行时注入逻辑可加载）
    const clientFile = join(PLUGIN_ROOT, 'client.js')
    let clientOk = false
    if (existsSync(clientFile)) {
      const c = readFileSync(clientFile, 'utf8')
      // 真实数据源：订阅官方 contextPressure 投影（faceOf），而非 DOM 扒取(JObwrW) 或 sin 模拟。
      clientOk = c.includes('@rison/dsh-endfield-ui') && c.includes('overrideTokens') && c.includes("'/endfield-ui/theme.css?v=0.8.5-native-caret-fix3'")
        && c.includes('ContextRing') && c.includes('ef-context-ring')
        && c.includes('connectRing') && c.includes("faceOf('contextPressure')")
        && c.includes("registerTab({") && c.includes("id: 'endfield:objective'")
        && c.includes("faceOf('goal')") && c.includes('ctx.remote.goals.edit')
        && !c.includes('JObwrW_root') && !/Math\.sin/.test(c)
    }
    ok('已安装 client.js 含注入逻辑 + 订阅官方 contextPressure 真实数据源（无 DOM 扒取/模拟）', clientOk, clientFile)
    let bootGateOk = false
    if (existsSync(clientFile)) {
      const c = readFileSync(clientFile, 'utf8')
      bootGateOk = css.ok
        && css.body.includes('html:has(> body[data-endfield-booting])')
        && css.body.includes('--dsh-sidebar-width: 0px !important')
        && css.body.includes('--dsh-sidebar-height: 0px !important')
        && css.body.includes('body[data-endfield-booting] #root')
        && css.body.includes('body[data-endfield-booting] [data-dsh-better-sidebar] > div')
        && c.includes("setAttribute('data-endfield-booting', '')")
        && c.includes("style.setProperty('display', 'none', 'important')")
        && c.includes('div[style*="width"]:has(button[aria-label="新建标签页"])')
        && c.includes("style.position !== 'fixed'")
        && c.includes("new MutationObserver")
        && c.includes("removeProperty('display')")
        && c.includes("dispatchEvent(new Event('resize'))")
        && c.includes('reducedMotion ? 80 : 3650')
        && css.body.includes('div[style*="width"]:has(> div + div button[aria-label="新建标签页"])')
    }
    ok('开屏期间隐藏工作台，结束后释放原生展开状态', bootGateOk,
      '宿主硬隐藏 + 宽高变量归零，不写 better-sidebar Store')
    ok('开屏黄色擦除后直接露出主界面，无黑色接力方框',
      css.ok
        && css.body.includes('animation: ef-boot-dismiss 3.22s')
        && css.body.includes('clip-path: inset(0 0 0 100%)')
        && !css.body.includes('ef-black-wipe')
        && !/\.ef-boot::after\s*\{/s.test(css.body),
      '删除原 #080a0b 全屏 black wipe，改由开屏容器跟随黄色前沿裁切')

    // 10. 全部运行时与保留素材可达
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
      '/endfield-ui/assets/ardot/endfield-industrial-grid.webp',
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

  const remove = runDsh(['plugin', '--profile', 'web', 'remove', PLUGIN_NAME], env)
  ok('卸载整合插件退出码为 0', remove.status === 0, remove.stderr.trim().split('\n').slice(-3).join(' '))
  const removedPkg = JSON.parse(readFileSync(profilePkgPath, 'utf8'))
  const removedDeps = removedPkg.dependencies || {}
  const removedBundles = removedPkg.dsh?.profile?.bundles || []
  ok('卸载后不留 Endfield 依赖或组合层',
    !removedDeps[PLUGIN_NAME] && !removedBundles.includes(PLUGIN_NAME),
    `deps=${JSON.stringify(removedDeps)} bundles=${JSON.stringify(removedBundles)}`)

  rmSync(DSH_HOME, { recursive: true, force: true })

  const failed = results.filter((r) => !r.pass)
  console.log(`\n[verify] 结果：${results.length - failed.length}/${results.length} 通过`)
  process.exit(failed.length === 0 ? 0 : 1)
}

main().catch((e) => { console.error('[verify] 异常：', e); process.exit(1) })
