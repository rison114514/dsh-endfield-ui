const { app, BrowserWindow, dialog, shell, ipcMain } = require('electron')
const { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } = require('node:fs')
const { spawn, spawnSync } = require('node:child_process')
const os = require('node:os')
const path = require('node:path')

app.setName('DSH 终末地工作台')

const PLUGIN_NAME = '@rison/dsh-endfield-ui'
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

// 单实例锁：第二次双击聚焦已有窗口，不启动第二个服务。
if (!app.requestSingleInstanceLock()) {
  app.quit()
  return
}

function commonBinDirs() {
  const home = process.env.HOME || ''
  const candidates = [
    path.join(home, '.local', 'bin'),
    path.join(home, '.volta', 'bin'),
    path.join(home, 'Library', 'pnpm'),
    '/opt/homebrew/bin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
  ]
  const fromPath = (process.env.PATH || '')
    .split(path.delimiter)
    .filter((dir) => dir && !dir.includes(`${path.sep}.workbuddy${path.sep}`))
  return [...new Set([...candidates, ...fromPath])].filter((dir) => existsSync(dir))
}

// 按优先级解析 dsh 可执行文件（HANDOFF 4.3）。
function findDsh() {
  const userCfg = loadUserConfig()
  const candidates = [
    process.env.DSH_BIN,
    userCfg.dshBin,
    '/opt/homebrew/bin/dsh',
    '/usr/local/bin/dsh',
    '/usr/bin/dsh',
    ...commonBinDirs().map((dir) => path.join(dir, 'dsh')),
  ].filter(Boolean)
  return candidates.find((c) => existsSync(c))
}

// 开发模式才读取 app.config.json.dshRepo，并在源码目录运行 pnpm dsh。
function findRepoDsh() {
  const repo = process.env.DSH_REPO || appConfig.dshRepo
  if (!repo || !existsSync(repo)) return null
  const bin = path.join(repo, 'node_modules', '.bin', 'dsh')
  return existsSync(bin) ? bin : null
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
  const dshHome = process.env.DSH_HOME || path.join(process.env.HOME || '', '.dsh')
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
    if (!/^https?:\/\/127\.0\.0\.1(:\d+)?(\/|$)/.test(url)) {
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
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;display:grid;place-items:center;min-height:100vh;background:#090b0d;color:#f5f6f2;font:14px/1.6 -apple-system,BlinkMacSystemFont,sans-serif}
    main{width:min(680px,84vw);border:1px solid #fff44f;border-left:5px solid #fff44f;padding:32px;background:#15191d;box-shadow:8px 8px 0 rgba(255,244,79,.18)}
    h1{margin:0 0 6px;color:#fff44f;font-size:24px;letter-spacing:.04em}
    p{color:#aeb4b8;margin:0 0 22px}
    .row{display:flex;flex-direction:column;gap:12px}
    button{font:14px/1 inherit;color:#090b0d;background:#fff44f;border:0;padding:13px 16px;cursor:pointer;text-align:left;letter-spacing:.04em}
    button.ghost{background:transparent;color:#fff44f;border:1px solid #fff44f}
    small{display:block;color:#6f777d;margin-top:4px;letter-spacing:0}
  </style><main>
    <h1>DSH 启动器</h1>
    <p>未在本机检测到 dsh。请选择 dsh 可执行文件，或指向 deepseek-harness 源码目录（开发模式）。选择结果仅保存在本机用户数据，不会写入项目。</p>
    <div class="row">
      <button id="pickDsh">选择 dsh 可执行文件<small>用于已安装 dsh 的用户（推荐）</small></button>
      <button id="pickRepo" class="ghost">选择 deepseek-harness 源码目录<small>开发模式：将运行 pnpm dsh</small></button>
      <button id="redetect" class="ghost">重新检测</button>
    </div>
  </main>
  <script>
    const bridge = window.dshShell
    document.getElementById('pickDsh').addEventListener('click', () => bridge.pickDsh())
    document.getElementById('pickRepo').addEventListener('click', () => bridge.pickRepo())
    document.getElementById('redetect').addEventListener('click', () => bridge.redetect())
  </script>`
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
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
    const install = spawnSync(executable, [
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
  const proc = spawn(executable, DSH_START_ARGS, {
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
    // 从累积输出里提取本地 URL（抗 stdout 分块），捕获组取完整地址。
    if (!loaded && mainWindow) {
      const match = output.match(/(https?:\/\/127\.0\.0\.1:\d+)/)
      if (match) {
        loaded = true
        settle()
        mainWindow.loadURL(match[1])
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
  proc.kill('SIGTERM')
  // 限定时间内未退出则强杀，避免残留监听端口。
  const killer = setTimeout(() => { try { proc.kill('SIGKILL') } catch { /* noop */ } }, 5000)
  proc.on('exit', () => clearTimeout(killer))
}

function boot() {
  const executable = findDsh() || findRepoDsh()
  if (!executable) {
    loadOnboarding()
    return
  }
  startDsh(executable)
}

// 引导页 IPC（HANDOFF 4.3）。
ipcMain.handle('dsh:pick-dsh', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择 dsh 可执行文件',
    properties: ['openFile'],
    filters: [{ name: 'Executable', extensions: [''] }],
  })
  if (result.canceled || !result.filePaths[0]) return null
  const picked = result.filePaths[0]
  saveUserConfig({ dshBin: picked })
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
  return picked
})
ipcMain.handle('dsh:redetect', () => {
  const executable = findDsh() || findRepoDsh()
  if (executable) startDsh(executable)
  else loadOnboarding()
  return !!executable
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
