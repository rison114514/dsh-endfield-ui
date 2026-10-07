const bridge = window.dshShell
const statusGrid = document.getElementById('statusGrid')
const installButton = document.getElementById('install')
const nodeDownloadButton = document.getElementById('nodeDownload')
const continueButton = document.getElementById('continue')
const versionNotice = document.getElementById('versionNotice')
const versionNoticeText = document.getElementById('versionNoticeText')
const progress = document.getElementById('progress')
const progressTitle = document.getElementById('progressTitle')
const log = document.getElementById('log')
let busy = false

const definitions = [
  ['node', 'Node.js'], ['npm', 'npm'], ['pnpm', 'pnpm'], ['dsh', 'DSH'],
  ['sidebar', '右侧工作台'], ['plugin', '终末地 UI'],
]

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
}

function statusClass(key, item) {
  if (!item.found) return 'bad'
  if (key === 'node' && !item.compatible) return 'warn'
  if (key === 'dsh' && !item.recommended) return 'warn'
  if (key === 'sidebar' && !item.compatible) return 'warn'
  if (key === 'plugin' && !item.compatible) return 'warn'
  return 'ok'
}

function render(data) {
  statusGrid.innerHTML = definitions.map(([key, label]) => {
    const item = data[key]
    const state = statusClass(key, item)
    const version = item.found ? (item.version || '已检测 / 版本未知') : '未检测到'
    return `<article class="status ${state}">
      <div class="status-name"><span>${label}</span><span class="status-dot"></span></div>
      <div class="status-version">${escapeHtml(version)}</div>
      <div class="status-path" title="${escapeHtml(item.path || '')}">${escapeHtml(item.path || data.recommended[key] || '')}</div>
    </article>`
  }).join('')

  const missingNode = !data.node.found || !data.node.compatible
  nodeDownloadButton.classList.toggle('hidden', !missingNode)
  installButton.classList.toggle('hidden', missingNode)
  installButton.disabled = busy || !data.npm.installerReady

  const mismatch = data.dsh.found && !data.dsh.recommended
  versionNotice.classList.toggle('hidden', !mismatch)
  continueButton.classList.toggle('hidden', !mismatch)
  continueButton.disabled = busy || !data.plugin.compatible
  if (mismatch) {
    versionNoticeText.textContent = `当前 ${data.dsh.version || '未知'}，推荐 ${data.recommended.dsh}。继续启动可能遇到插件或侧栏兼容问题。`
  }
}

async function refresh() {
  render(await bridge.getDiagnostics())
}

bridge.onSetupProgress((event) => {
  progress.classList.remove('hidden')
  if (event.type === 'phase' || event.type === 'complete' || event.type === 'error') {
    progressTitle.textContent = event.text
  }
  if (event.type === 'log') {
    log.textContent += event.text
    if (log.textContent.length > 24000) log.textContent = log.textContent.slice(-24000)
    log.scrollTop = log.scrollHeight
  }
  if (event.type === 'error') {
    log.textContent += `\n[ERROR] ${event.text}\n`
    busy = false
    refresh()
  }
})

installButton.addEventListener('click', async () => {
  if (busy || !window.confirm('将使用本机 npm 全局安装固定版本的 DSH 与 pnpm，然后安装内置终末地插件。\n\n现有 .dsh 会话数据不会被移动或清理。是否继续？')) return
  busy = true
  log.textContent = ''
  progress.classList.remove('hidden')
  progressTitle.textContent = '正在开始配置…'
  installButton.disabled = true
  try { await bridge.installRecommended() } catch { /* progress channel renders the error */ }
})

nodeDownloadButton.addEventListener('click', () => bridge.openNodeDownload())
document.getElementById('officialDocs').addEventListener('click', () => bridge.openOfficialDocs())
continueButton.addEventListener('click', () => bridge.continueCurrent())
document.getElementById('pickDsh').addEventListener('click', () => bridge.pickDsh())
document.getElementById('pickRepo').addEventListener('click', () => bridge.pickRepo())
document.getElementById('redetect').addEventListener('click', async () => {
  if (busy) return
  await bridge.redetect()
  await refresh()
})
document.getElementById('copyLog').addEventListener('click', async (event) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(log.textContent)
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = log.textContent
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
  event.currentTarget.textContent = '已复制'
  setTimeout(() => { event.currentTarget.textContent = '复制日志' }, 1400)
})

refresh()
