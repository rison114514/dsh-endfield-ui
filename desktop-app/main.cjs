const { app, BrowserWindow, dialog, shell, ipcMain } = require('electron')
const { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, realpathSync } = require('node:fs')
const { spawn, spawnSync } = require('node:child_process')
const os = require('node:os')
const path = require('node:path')
const { fileURLToPath } = require('node:url')

app.setName('DSH 终末地工作台')

const PLUGIN_NAME = '@rison/dsh-endfield-ui'
const RECOMMENDED_DSH_VERSION = '0.1.2-alpha.5'
const RECOMMENDED_PNPM_VERSION = '11.7.0'
const MINIMUM_NODE_VERSION = '22.19.0'
// Electron still needs DSH's local HTTP backend, but it must be private to the
// desktop window.  `--no-open` prevents DSH from creating a second browser UI
// (and therefore a second session writer) while the random loopback port keeps
// the service local to this machine.
const DSH_START_ARGS = [
  '--profile', 'web',
  '--host', '127.0.0.1',
  '--no-open',
  '--port', '0',
]

const pluginDir = app.isPackaged
  ? path.join(process.resourcesPath, 'endfield-ui-plugin')
  : path.resolve(__dirname, '..', 'endfield-ui-plugin')

const appConfig = (() => {
  try {
    return JSON.parse(readFileSync(path.join(__dirname, 'app.config.json'), 'utf8'))
  } catch {
    return {}
  }
})()

const userDataConfigPath = path.join(app.getPath('userData'), 'dsh-launch.json')
function loadUserConfig() {
  try {
    return JSON.parse(readFileSync(userDataConfigPath, 'utf8'))
  } catch {
    return {}
  }
}
function saveUserConfig(patch) {
  const next = { ...loadUserConfig(), ...patch }
  try {
    mkdirSync(path.dirname(userDataConfigPath), { recursive: true })
    writeFileSync(userDataConfigPath, JSON.stringify(next, null, 2))
  } catch { /* 忽略写入失败 */ }
  return next
}

let mainWindow
let dshProcess
let startupTimer
let quitting = false
let setupPromise
let setupProcess

// 单实例锁：第二次双击聚焦已有窗口，不启动第二个服务。
if (!app.requestSingleInstanceLock()) {
  app.quit()
  return
}

function commonBinDirs() {
  const home = os.homedir()
  const childBinDirs = (root, suffix) => {
    try {
      return readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(root, entry.name, ...suffix))
    } catch {
      return []
    }
  }
  const candidates = process.platform === 'win32'
    ? [
        process.env.APPDATA && path.join(process.env.APPDATA, 'npm'),
        process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'pnpm'),
        process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'nodejs'),
        process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'nodejs'),
        path.join(home, '.local', 'bin'),
        path.join(home, '.volta', 'bin'),
      ]
    : [
        path.join(home, '.local', 'bin'),
        path.join(home, '.volta', 'bin'),
        ...childBinDirs(path.join(home, '.nvm', 'versions', 'node'), ['bin']),
        ...childBinDirs(path.join(home, '.fnm', 'node-versions'), ['installation', 'bin']),
        path.join(home, 'Library', 'pnpm'),
        '/opt/homebrew/bin',
        '/usr/local/bin',
        '/usr/bin',
        '/bin',
      ]
  const fromPath = (process.env.PATH || '')
    .split(path.delimiter)
    .filter((dir) => dir && !dir.toLowerCase().includes(`${path.sep}.workbuddy${path.sep}`.toLowerCase()))
  return [...new Set([...candidates, ...fromPath])].filter((dir) => existsSync(dir))
}

function dshCandidatesIn(dir) {
  if (process.platform === 'win32') {
    return ['dsh.cmd', 'dsh.exe', 'dsh.bat', 'dsh'].map((name) => path.join(dir, name))
  }
  return [path.join(dir, 'dsh')]
}

function commandCandidatesIn(dir, name) {
  if (process.platform === 'win32') {
    return [`${name}.exe`, `${name}.cmd`, `${name}.bat`, name].map((entry) => path.join(dir, entry))
  }
  return [path.join(dir, name)]
}

function findCommand(name) {
  return commonBinDirs().flatMap((dir) => commandCandidatesIn(dir, name)).find((candidate) => existsSync(candidate)) || null
}

function findNode() {
  return findCommand('node')
}

function findNpmCommand() {
  return findCommand('npm')
}

function findNpmCli(nodeBin) {
  if (!nodeBin) return null
  let resolvedNode = nodeBin
  try { resolvedNode = realpathSync(nodeBin) } catch { /* use unresolved path */ }
  const home = os.homedir()
  const roots = [...new Set([path.dirname(nodeBin), path.dirname(resolvedNode)])]
  const candidates = roots.flatMap((binDir) => [
    path.join(binDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(binDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ])
  candidates.push(
    path.join(home, '.local', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    '/opt/homebrew/lib/node_modules/npm/bin/npm-cli.js',
    '/usr/local/lib/node_modules/npm/bin/npm-cli.js',
  )
  return candidates.find((candidate) => existsSync(candidate)) || null
}

function npmGlobalBin(nodeBin, npmCli) {
  if (!nodeBin || !npmCli) return null
  const result = spawnSync(nodeBin, [npmCli, 'prefix', '--global'], {
    encoding: 'utf8', timeout: 8000, windowsHide: true,
  })
  if (result.error || result.status !== 0) return null
  const prefix = result.stdout.trim()
  if (!prefix) return null
  return process.platform === 'win32' ? prefix : path.join(prefix, 'bin')
}

// 按优先级解析 dsh 可执行文件（HANDOFF 4.3）。
function dshCandidateList() {
  const userCfg = loadUserConfig()
  return [...new Set([
    process.env.DSH_BIN,
    userCfg.dshBin,
    ...(process.platform === 'win32' ? [] : [
      '/opt/homebrew/bin/dsh',
      '/usr/local/bin/dsh',
      '/usr/bin/dsh',
    ]),
    ...commonBinDirs().flatMap(dshCandidatesIn),
  ].filter(Boolean))].filter((candidate) => existsSync(candidate))
}

function findDsh() {
  return dshCandidateList()[0] || null
}

function findRecommendedDsh() {
  return dshCandidateList().find((candidate) => runVersion(candidate) === RECOMMENDED_DSH_VERSION) || null
}

// 开发模式才读取 app.config.json.dshRepo，并在源码目录运行 pnpm dsh。
function findRepoDsh() {
  const repo = process.env.DSH_REPO || appConfig.dshRepo
  if (!repo || !existsSync(repo)) return null
  const binDir = path.join(repo, 'node_modules', '.bin')
  return dshCandidatesIn(binDir).find((candidate) => existsSync(candidate)) || null
}

function isWindowsCommand(executable) {
  return process.platform === 'win32' && /\.(?:cmd|bat)$/i.test(executable)
}

function spawnDshSync(executable, args, options) {
  return spawnSync(executable, args, {
    ...options,
    shell: isWindowsCommand(executable),
    windowsHide: true,
  })
}

function spawnDsh(executable, args, options) {
  return spawn(executable, args, {
    ...options,
    shell: isWindowsCommand(executable),
    windowsHide: true,
  })
}

function runVersion(executable, args = ['--version']) {
  if (!executable) return null
  const result = spawnSync(executable, args, {
    encoding: 'utf8',
    timeout: 8000,
    windowsHide: true,
    shell: isWindowsCommand(executable),
  })
  if (result.error || result.status !== 0) return null
  const match = `${result.stdout || ''}\n${result.stderr || ''}`.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/)
  return match?.[0] || null
}

function installedPluginInfo() {
  const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  const manifest = path.join(dshHome, 'profiles', 'web', 'node_modules', '@rison', 'dsh-endfield-ui', 'package.json')
  try {
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
    return { found: true, version: pkg.version || null, path: manifest }
  } catch {
    return { found: false, version: null, path: null }
  }
}

function diagnoseEnvironment() {
  const nodeBin = findNode()
  const npmBin = findNpmCommand()
  const npmCli = findNpmCli(nodeBin)
  const pnpmBin = findCommand('pnpm')
  const dshBin = findDsh() || findRepoDsh()
  const nodeVersion = runVersion(nodeBin)
  const dshVersion = runVersion(dshBin)
  const plugin = installedPluginInfo()
  return {
    platform: process.platform,
    recommended: {
      node: `>=${MINIMUM_NODE_VERSION}`,
      dsh: RECOMMENDED_DSH_VERSION,
      pnpm: RECOMMENDED_PNPM_VERSION,
      plugin: bundledPluginVersion() || '1.0.1',
    },
    node: {
      found: Boolean(nodeBin), path: nodeBin, version: nodeVersion,
      compatible: Boolean(nodeVersion && versionAtLeast(nodeVersion, MINIMUM_NODE_VERSION)),
    },
    npm: {
      found: Boolean(npmBin || npmCli), path: npmCli || npmBin, version: runVersion(npmBin),
      installerReady: Boolean(nodeBin && npmCli),
    },
    pnpm: { found: Boolean(pnpmBin), path: pnpmBin, version: runVersion(pnpmBin) },
    dsh: {
      found: Boolean(dshBin), path: dshBin, version: dshVersion,
      recommended: dshVersion === RECOMMENDED_DSH_VERSION,
    },
    plugin: {
      ...plugin,
      compatible: pluginIsInstalled(),
      recommended: plugin.version === bundledPluginVersion(),
    },
  }
}

function childEnv(executable) {
  const searchPath = [
    path.dirname(executable),
    ...commonBinDirs(),
  ]
  return {
    ...process.env,
    FORCE_COLOR: '0',
    PATH: [...new Set(searchPath)].join(path.delimiter),
  }
}

// DSH 0.1.2 authenticates the Web surface with a one-time process token.
// The printed `dsh web:` URL must be loaded intact so Electron can exchange
// that token for the signed session cookie before DSH redirects to `/`.
function authenticatedWebUrlFrom(output) {
  // Wait for the newline. stdout is a byte stream and may split immediately
  // after the slash; accepting an unterminated match would load the clean URL
  // before the following `?token=...` bytes arrive.
  const match = output.match(/(?:^|\n)dsh web:\s+([^\r\n]+)\r?\n/)
  if (!match) return null
  try {
    const candidate = match[1].split(/\s+\(LAN:/, 1)[0].trim()
    const parsed = new URL(candidate)
    return parsed.protocol === 'http:' && parsed.hostname === '127.0.0.1'
      ? parsed.href
      : null
  } catch {
    return null
  }
}

function bundledPluginVersion() {
  try {
    const pkg = JSON.parse(readFileSync(path.join(pluginDir, 'package.json'), 'utf8'))
    return pkg.version
  } catch {
    return null
  }
}

function bundledPluginInstallTarget() {
  const version = bundledPluginVersion()
  if (!version) return null
  const archive = path.join(pluginDir, `rison-dsh-endfield-ui-${version}.tgz`)
  // A packaged App must install from an archive. Adding pluginDir directly
  // creates a pnpm link whose transitive dependencies are not materialized in
  // the web profile, so DSH later fails to import better-sidebar/Shikitor.
  if (existsSync(archive)) return archive
  return app.isPackaged ? null : pluginDir
}

function versionTuple(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version)
  return match ? match.slice(1).map(Number) : null
}

function versionAtLeast(installed, bundled) {
  if (installed === bundled) return true
  const installedTuple = versionTuple(installed)
  const bundledTuple = versionTuple(bundled)
  // 对无法比较的自定义版本保守处理：不用 App 内置包覆盖现有安装。
  if (!installedTuple || !bundledTuple) return true
  for (let index = 0; index < installedTuple.length; index += 1) {
    if (installedTuple[index] !== bundledTuple[index]) {
      return installedTuple[index] > bundledTuple[index]
    }
  }
  return true
}

function pluginIsInstalled() {
  const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  const profileDir = path.join(dshHome, 'profiles', 'web')
  try {
    const profile = JSON.parse(readFileSync(path.join(profileDir, 'package.json'), 'utf8'))
    const dependency = profile.dependencies?.[PLUGIN_NAME]
    if (typeof dependency !== 'string' || dependency.startsWith('link:')) return false
    const manifest = path.join(profileDir, 'node_modules', '@rison', 'dsh-endfield-ui', 'package.json')
    if (!existsSync(manifest)) return false
    const manifestVersion = JSON.parse(readFileSync(manifest, 'utf8')).version
    const bundledVersion = bundledPluginVersion()
    if (typeof manifestVersion !== 'string' || typeof bundledVersion !== 'string') return false
    // 已安装版本更新时也视为满足，禁止旧 App 将插件降级。
    if (manifestVersion !== bundledVersion) return versionAtLeast(manifestVersion, bundledVersion)

    // 主插件存在不代表组合层完整。DSH 从 profile 根目录解析这些包；
    // 任一依赖缺失都会让整个 plugin tree 在 UI 加载前退出。
    for (const name of ['dsh-better-sidebar', 'dsh-shikitor']) {
      const expected = JSON.parse(readFileSync(manifest, 'utf8')).dependencies?.[name]
      if (typeof expected !== 'string') return false
      const dependencyManifest = path.join(profileDir, 'node_modules', ...name.split('/'), 'package.json')
      if (!existsSync(dependencyManifest)) return false
      const actual = JSON.parse(readFileSync(dependencyManifest, 'utf8')).version
      if (actual !== expected) return false
    }
    return true
  } catch {
    return false
  }
}

function createWindow() {
  const bounds = appConfig.window || {}
  mainWindow = new BrowserWindow({
    width: bounds.width || 1440,
    height: bounds.height || 900,
    minWidth: bounds.minWidth || 980,
    minHeight: bounds.minHeight || 640,
    show: false,
    backgroundColor: '#090b0d',
    title: 'DSH 终末地工作台',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 只允许加载本地 dsh 地址，禁止导航到不可信远程页面。
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isLocalDsh = /^https?:\/\/127\.0\.0\.1(:\d+)?(\/|$)/.test(url)
    let isBundledPage = false
    try {
      const localPath = fileURLToPath(url)
      isBundledPage = localPath === path.join(__dirname, 'onboarding.html')
    } catch { /* not a file URL */ }
    if (!isLocalDsh && !isBundledPage) {
      event.preventDefault()
    }
  })

  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault()
    mainWindow.setTitle('DSH 终末地工作台')
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => {
    mainWindow = undefined
    stopDsh()
  })
}

function escapeHtml(message) {
  return message.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
}

function loadDiagnostic(title, message) {
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;display:grid;place-items:center;min-height:100vh;background:#090b0d;color:#f5f6f2;font:14px/1.6 -apple-system,BlinkMacSystemFont,sans-serif}
    main{width:min(760px,84vw);border:1px solid #fff44f;border-left:5px solid #fff44f;padding:28px;background:#15191d;box-shadow:8px 8px 0 rgba(255,244,79,.18)}
    h1{margin:0 0 12px;color:#fff44f;font-size:22px;letter-spacing:.04em}
    pre{white-space:pre-wrap;color:#aeb4b8;max-height:46vh;overflow:auto}
    .row{margin-top:18px;display:flex;gap:12px}
    button{font:13px/1 inherit;color:#090b0d;background:#fff44f;border:0;padding:10px 16px;cursor:pointer;letter-spacing:.04em}
    button.ghost{background:transparent;color:#fff44f;border:1px solid #fff44f}
  </style><main>
    <h1>${escapeHtml(title)}</h1>
    <pre id="diag">${escapeHtml(message)}</pre>
    <div class="row"><button id="copy">复制诊断信息</button></div>
  </main>
  <script>
    document.getElementById('copy').addEventListener('click', () => {
      const t = document.getElementById('diag').innerText
      if (navigator.clipboard) navigator.clipboard.writeText(t)
      else { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove() }
      const b = document.getElementById('copy'); b.textContent = '已复制'; setTimeout(() => (b.textContent = '复制诊断信息'), 1500)
    })
  </script>`
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
}

function loadOnboarding() {
  mainWindow.loadFile(path.join(__dirname, 'onboarding.html'))
}

function startDsh(executable) {
  // 若上一次实例仍在运行（如用户多次点“重新检测”），先回收，避免进程泄漏与计时器串扰。
  stopDsh()

  const workspace = (appConfig.workspace && existsSync(appConfig.workspace))
    ? appConfig.workspace
    : os.homedir()
  const env = childEnv(executable)

  // 标准插件方式：先确保插件以 bundle 形式加入 web profile（幂等）。
  if (!pluginIsInstalled()) {
    const pluginTarget = bundledPluginInstallTarget()
    if (!pluginTarget) {
      loadDiagnostic('终末地 UI 插件归档缺失',
        `App 内未找到与版本 ${bundledPluginVersion() || 'unknown'} 匹配的插件安装包。\n\n请重新构建或下载完整 App。`)
      return
    }
    const install = spawnDshSync(executable, [
      'plugin', '--profile', 'web', 'add', pluginTarget, '--allow-build=node-pty',
    ], {
      cwd: workspace,
      env,
      encoding: 'utf8',
      timeout: 120000,
    })
    if (install.error || install.status !== 0) {
      loadDiagnostic('终末地 UI 插件安装失败',
        `${install.error?.message || install.stderr || install.stdout || '未知错误'}\n\n请确认 dsh 版本与本插件兼容。`)
      return
    }
  }

  // 不再附加 --patch；bundle 已在安装时自动进入启动层。必须保留
  // --no-open，否则新版 DSH 会额外打开默认浏览器，产生第二个前端写入者。
  const proc = spawnDsh(executable, DSH_START_ARGS, {
    cwd: workspace,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  dshProcess = proc

  let output = ''
  let loaded = false
  // 启动超时：30 秒未输出本地 URL 时显示诊断页。计时器绑定本实例，避免与上一次实例串扰。
  const timer = setTimeout(() => {
    if (!loaded) {
      loadDiagnostic('dsh 启动超时',
        '30 秒内未检测到本地 dsh 服务地址。\n常见原因：dsh 版本不兼容、端口被占用或依赖缺失。\n\n最近输出：\n' + (output || '（无输出）'))
    }
  }, 30000)
  startupTimer = timer
  const settle = () => {
    if (startupTimer === timer) {
      clearTimeout(timer)
      startupTimer = undefined
    }
  }

  const consume = (chunk) => {
    const text = chunk.toString()
    output = `${output}${text}`.slice(-12000)
    // 从累积输出的 `dsh web:` 就绪行提取完整认证 URL。不能退回只取
    // host:port；DSH 0.1.2 会拒绝缺少一次性 process token 的首屏请求。
    if (!loaded && mainWindow) {
      const authenticatedUrl = authenticatedWebUrlFrom(output)
      if (authenticatedUrl) {
        loaded = true
        settle()
        mainWindow.loadURL(authenticatedUrl)
      }
    }
  }
  dshProcess.stdout.on('data', consume)
  dshProcess.stderr.on('data', consume)
  dshProcess.on('error', (error) => {
    settle()
    loadDiagnostic('dsh 启动异常', `${error.message}\n\n${output}`)
  })
  dshProcess.on('exit', (code, signal) => {
    // 只清理本实例的引用：若已被重新启动的新实例覆盖，则不动，避免误清新进程句柄。
    if (dshProcess === proc) dshProcess = undefined
    settle()
    if (!quitting && !loaded) {
      loadDiagnostic('dsh 提前退出', `dsh 在加载前退出（code=${code}, signal=${signal}）\n\n${output}`)
    }
  })
}

function stopDsh() {
  if (startupTimer) clearTimeout(startupTimer)
  if (!dshProcess) return
  const proc = dshProcess
  dshProcess = undefined
  const terminate = (force) => {
    if (process.platform === 'win32' && proc.pid) {
      spawnSync('taskkill.exe', [
        '/pid', String(proc.pid), '/t', ...(force ? ['/f'] : []),
      ], { windowsHide: true, stdio: 'ignore' })
      return
    }
    proc.kill(force ? 'SIGKILL' : 'SIGTERM')
  }
  terminate(false)
  // 限定时间内未退出则强杀，避免残留监听端口。
  const killer = setTimeout(() => { try { terminate(true) } catch { /* noop */ } }, 5000)
  proc.on('exit', () => clearTimeout(killer))
}

function sendSetupProgress(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('dsh:setup-progress', payload)
  }
}

function runStreaming(executable, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(executable, args, {
      ...options,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    setupProcess = proc
    let output = ''
    const consume = (chunk) => {
      const text = chunk.toString()
      output = `${output}${text}`.slice(-24000)
      sendSetupProgress({ type: 'log', text })
    }
    proc.stdout.on('data', consume)
    proc.stderr.on('data', consume)
    proc.once('error', (error) => {
      if (setupProcess === proc) setupProcess = undefined
      reject(error)
    })
    proc.once('exit', (code, signal) => {
      if (setupProcess === proc) setupProcess = undefined
      if (code === 0) resolve(output)
      else reject(new Error(`进程退出（code=${code}, signal=${signal}）\n${output}`))
    })
  })
}

function stopSetup() {
  if (!setupProcess) return
  const proc = setupProcess
  setupProcess = undefined
  try {
    if (process.platform === 'win32' && proc.pid) {
      spawnSync('taskkill.exe', ['/pid', String(proc.pid), '/t', '/f'], {
        windowsHide: true,
        stdio: 'ignore',
      })
    } else {
      proc.kill('SIGTERM')
    }
  } catch { /* process already exited */ }
}

async function installRecommendedEnvironment() {
  if (setupPromise) return setupPromise
  setupPromise = (async () => {
    const before = diagnoseEnvironment()
    if (!before.node.found || !before.node.compatible) {
      throw new Error(`需要 Node.js ${before.recommended.node}。请先安装官方 Node.js，再返回重新检测。`)
    }
    const npmCli = findNpmCli(before.node.path)
    if (!npmCli) {
      throw new Error('已找到 Node.js，但无法定位 npm-cli.js。请使用 Node.js 官方安装器修复 npm，或手动选择 DSH 可执行文件。')
    }

    if (!before.dsh.recommended || before.pnpm.version !== RECOMMENDED_PNPM_VERSION) {
      sendSetupProgress({ type: 'phase', phase: 'runtime', text: '正在安装推荐版本的 DSH 与 pnpm…' })
      // 用 Node 直接执行 npm CLI，避免将安装参数拼接到 shell 字符串。
      await runStreaming(before.node.path, [
        npmCli,
        'install', '--global', '--no-fund', '--no-audit',
        `@deepseek-ai/dsh@${RECOMMENDED_DSH_VERSION}`,
        `pnpm@${RECOMMENDED_PNPM_VERSION}`,
      ], { cwd: os.homedir(), env: childEnv(before.node.path) })
    } else {
      sendSetupProgress({ type: 'phase', phase: 'runtime', text: 'DSH 与 pnpm 已是推荐版本。' })
    }

    const npmBinDir = npmGlobalBin(before.node.path, npmCli)
    const installedCandidates = npmBinDir ? dshCandidatesIn(npmBinDir) : []
    const dshBin = installedCandidates.find((candidate) => (
      existsSync(candidate) && runVersion(candidate) === RECOMMENDED_DSH_VERSION
    )) || findRecommendedDsh() || findDsh()
    if (!dshBin) {
      throw new Error('npm 安装已完成，但未在常用全局目录中找到 dsh。请点击“选择 DSH”指定它的可执行文件。')
    }
    saveUserConfig({ dshBin, allowedDshVersion: null })

    if (!pluginIsInstalled()) {
      const pluginTarget = bundledPluginInstallTarget()
      if (!pluginTarget) throw new Error('App 内置的终末地插件安装包缺失。')
      sendSetupProgress({ type: 'phase', phase: 'plugin', text: '正在启用终末地工作台插件…' })
      await runStreaming(dshBin, [
        'plugin', '--profile', 'web', 'add', pluginTarget, '--allow-build=node-pty',
      ], {
        cwd: (appConfig.workspace && existsSync(appConfig.workspace)) ? appConfig.workspace : os.homedir(),
        env: childEnv(dshBin),
        shell: isWindowsCommand(dshBin),
      })
    }

    const after = diagnoseEnvironment()
    if (!after.dsh.found || !after.plugin.compatible) {
      throw new Error('安装命令已完成，但环境复检未通过。请复制日志后重试。')
    }
    sendSetupProgress({ type: 'complete', text: '环境已就绪，正在启动工作台…' })
    startDsh(after.dsh.path)
    return after
  })().catch((error) => {
    sendSetupProgress({ type: 'error', text: error.message || String(error) })
    throw error
  }).finally(() => {
    setupPromise = undefined
  })
  return setupPromise
}

function boot() {
  const diagnostic = diagnoseEnvironment()
  if (!diagnostic.dsh.found) {
    loadOnboarding()
    return
  }
  const userCfg = loadUserConfig()
  const detectedVersion = diagnostic.dsh.version || 'unknown'
  const acceptedMismatch = userCfg.allowedDshVersion === detectedVersion
  const needsVersionChoice = !diagnostic.dsh.recommended
    && !acceptedMismatch
  const needsInstaller = !diagnostic.plugin.compatible && !diagnostic.pnpm.found
  if (needsVersionChoice || needsInstaller) {
    loadOnboarding()
    return
  }
  startDsh(diagnostic.dsh.path)
}

// 引导页 IPC（HANDOFF 4.3）。
ipcMain.handle('dsh:pick-dsh', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择 dsh 可执行文件',
    properties: ['openFile'],
    filters: process.platform === 'win32'
      ? [{ name: 'DSH executable', extensions: ['cmd', 'exe', 'bat'] }, { name: 'All files', extensions: ['*'] }]
      : [{ name: 'Executable', extensions: [''] }],
  })
  if (result.canceled || !result.filePaths[0]) return null
  const picked = result.filePaths[0]
  saveUserConfig({ dshBin: picked, allowedDshVersion: null })
  boot()
  return picked
})
ipcMain.handle('dsh:pick-repo', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择 deepseek-harness 源码目录',
    properties: ['openDirectory'],
  })
  if (result.canceled || !result.filePaths[0]) return null
  const picked = result.filePaths[0]
  saveUserConfig({ dshRepo: picked })
  boot()
  return picked
})
ipcMain.handle('dsh:get-diagnostics', () => diagnoseEnvironment())
ipcMain.handle('dsh:install-recommended', () => installRecommendedEnvironment())
ipcMain.handle('dsh:continue-current', () => {
  const diagnostic = diagnoseEnvironment()
  if (!diagnostic.dsh.found) return false
  saveUserConfig({ allowedDshVersion: diagnostic.dsh.version || 'unknown' })
  startDsh(diagnostic.dsh.path)
  return true
})
ipcMain.handle('dsh:open-node-download', () => shell.openExternal('https://nodejs.org/en/download'))
ipcMain.handle('dsh:open-official-docs', () => shell.openExternal('https://github.com/deepseek-ai/deepseek-harness'))
ipcMain.handle('dsh:redetect', () => {
  boot()
  return diagnoseEnvironment()
})

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.whenReady().then(() => {
  createWindow()
  boot()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
    boot()
  }
})

app.on('before-quit', () => {
  quitting = true
  stopSetup()
  stopDsh()
})

app.on('quit', () => {
  stopDsh()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

process.on('uncaughtException', (error) => {
  dialog.showErrorBox('DSH 终末地工作台', error.stack || error.message)
})
