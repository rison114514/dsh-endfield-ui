const { app, BrowserWindow, dialog, shell } = require('electron')
const { existsSync, readFileSync, readdirSync } = require('node:fs')
const { spawn, spawnSync } = require('node:child_process')
const os = require('node:os')
const path = require('node:path')

app.setName('DSH 终末地工作台')

const pluginDir = app.isPackaged
  ? path.join(process.resourcesPath, 'endfield-ui-plugin')
  : path.resolve(__dirname, '..', 'endfield-ui-plugin')
const pluginPatch = path.join(pluginDir, 'cordis.patch.yml')
const config = JSON.parse(readFileSync(path.join(__dirname, 'app.config.json'), 'utf8'))

let mainWindow
let dshProcess
let quitting = false

function versionedBinDirs(root, suffix = ['bin']) {
  try {
    return readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, entry.name, ...suffix))
      .filter((dir) => existsSync(dir))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
  } catch {
    return []
  }
}

function runtimeBinDirs() {
  const home = process.env.HOME || ''
  const fromPath = (process.env.PATH || '').split(path.delimiter)
    .filter((dir) => dir && !dir.includes(`${path.sep}.workbuddy${path.sep}`))
  const candidates = [
    process.env.DSH_NODE_BIN && path.dirname(process.env.DSH_NODE_BIN),
    process.env.DSH_PNPM_BIN && path.dirname(process.env.DSH_PNPM_BIN),
    ...versionedBinDirs(path.join(home, '.nvm', 'versions', 'node')),
    ...versionedBinDirs(path.join(home, '.local', 'share', 'fnm', 'node-versions'), ['installation', 'bin']),
    path.join(home, '.local', 'bin'),
    path.join(home, '.volta', 'bin'),
    path.join(home, 'Library', 'pnpm'),
    '/opt/homebrew/bin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    ...fromPath,
  ].filter(Boolean)
  return [...new Set(candidates)].filter((dir) => existsSync(dir))
}

function dshCommand() {
  return [
    process.env.DSH_BIN,
    ...runtimeBinDirs().map((dir) => path.join(dir, 'dsh')),
  ].filter(Boolean).find((candidate) => existsSync(candidate))
}

function nodeCommand() {
  return [
    process.env.DSH_NODE_BIN,
    '/opt/homebrew/bin/node',
    '/usr/local/bin/node',
    ...runtimeBinDirs().map((dir) => path.join(dir, 'node')),
  ].filter(Boolean).find((candidate) => existsSync(candidate))
}

function runtimeEnvironment(executable, node) {
  const executableDir = path.dirname(executable)
  const searchPath = [path.dirname(node), executableDir, ...runtimeBinDirs()]
  return {
    ...process.env,
    FORCE_COLOR: '0',
    PATH: [...new Set(searchPath)].join(path.delimiter),
  }
}

function pluginIsInstalled() {
  const dshHome = process.env.DSH_HOME || path.join(process.env.HOME || '', '.dsh')
  const profileDir = path.join(dshHome, 'profiles', 'web')
  try {
    const profile = JSON.parse(readFileSync(path.join(profileDir, 'package.json'), 'utf8'))
    const dependency = profile.dependencies?.['@rison/dsh-endfield-ui']
    const installedManifest = path.join(profileDir, 'node_modules', '@rison', 'dsh-endfield-ui', 'package.json')
    return typeof dependency === 'string'
      && dependency.replace(/^link:/, '') === pluginDir
      && existsSync(installedManifest)
  } catch {
    return false
  }
}

function createWindow() {
  const bounds = config.window || {}
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
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
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

function loadStartupError(message) {
  const escaped = message.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;display:grid;place-items:center;min-height:100vh;background:#090b0d;color:#f5f6f2;font:14px/1.6 -apple-system,BlinkMacSystemFont,sans-serif}
    main{width:min(720px,80vw);border:1px solid #fff44f;border-left:5px solid #fff44f;padding:28px;background:#15191d;box-shadow:8px 8px 0 rgba(255,244,79,.18)}
    h1{margin:0 0 12px;color:#fff44f;font-size:22px}pre{white-space:pre-wrap;color:#aeb4b8}
  </style><main><h1>DSH 启动失败</h1><pre>${escaped}</pre></main>`
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
}

function startDsh() {
  if (!existsSync(pluginPatch)) {
    loadStartupError(`找不到终末地 UI 插件：${pluginPatch}`)
    return
  }

  const executable = dshCommand()
  if (!executable) {
    loadStartupError('找不到本机 dsh 命令。\n请先执行：npm install --global --prefix ~/.local @deepseek-ai/dsh pnpm')
    return
  }
  const node = nodeCommand()
  if (!node) {
    loadStartupError('找不到本机 Node.js。\n请先安装 Node.js 22.19+ 或 24+。')
    return
  }

  const childEnv = runtimeEnvironment(executable, node)
  const dshPrefix = [executable]
  const workspace = config.workspace && existsSync(config.workspace)
    ? config.workspace
    : os.homedir()
  if (!pluginIsInstalled()) {
    const install = spawnSync(node, [
      ...dshPrefix, 'plugin', '--profile', 'web', 'add', pluginDir,
    ], {
      cwd: workspace,
      env: childEnv,
      encoding: 'utf8',
      timeout: 120000,
    })
    if (install.error || install.status !== 0) {
      loadStartupError(`终末地 UI 插件安装失败。\n\n${install.error?.message || install.stderr || install.stdout}`)
      return
    }
  }

  const args = [...dshPrefix, '--profile', 'web', '--patch', pluginPatch, '--port', '0']
  dshProcess = spawn(node, args, {
    cwd: workspace,
    env: childEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let output = ''
  let loaded = false
  const consume = (chunk) => {
    const text = chunk.toString()
    output = `${output}${text}`.slice(-12000)
    const match = text.match(/dsh web:\s+(http:\/\/127\.0\.0\.1:\d+)/)
    if (match && !loaded && mainWindow) {
      loaded = true
      mainWindow.loadURL(match[1])
    }
  }
  dshProcess.stdout.on('data', consume)
  dshProcess.stderr.on('data', consume)
  dshProcess.on('error', (error) => loadStartupError(`${error.message}\n\n${output}`))
  dshProcess.on('exit', (code, signal) => {
    dshProcess = undefined
    if (!quitting && !loaded) {
      loadStartupError(`dsh 提前退出（code=${code}, signal=${signal}）\n\n${output}`)
    }
  })
}

function stopDsh() {
  if (!dshProcess) return
  dshProcess.kill('SIGTERM')
  dshProcess = undefined
}

app.whenReady().then(() => {
  createWindow()
  startDsh()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
    startDsh()
  }
})

app.on('before-quit', () => {
  quitting = true
  stopDsh()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

process.on('uncaughtException', (error) => {
  dialog.showErrorBox('DSH 终末地工作台', error.stack || error.message)
})
