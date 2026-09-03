const { contextBridge, ipcRenderer } = require('electron')

// 引导页与主进程之间的安全桥接。保持 contextIsolation 与 sandbox。
contextBridge.exposeInMainWorld('dshShell', {
  pickDsh: () => ipcRenderer.invoke('dsh:pick-dsh'),
  pickRepo: () => ipcRenderer.invoke('dsh:pick-repo'),
  redetect: () => ipcRenderer.invoke('dsh:redetect'),
  getDiagnostics: () => ipcRenderer.invoke('dsh:get-diagnostics'),
  installRecommended: () => ipcRenderer.invoke('dsh:install-recommended'),
  continueCurrent: () => ipcRenderer.invoke('dsh:continue-current'),
  openNodeDownload: () => ipcRenderer.invoke('dsh:open-node-download'),
  openOfficialDocs: () => ipcRenderer.invoke('dsh:open-official-docs'),
  onSetupProgress: (listener) => {
    const wrapped = (_event, payload) => listener(payload)
    ipcRenderer.on('dsh:setup-progress', wrapped)
    return () => ipcRenderer.removeListener('dsh:setup-progress', wrapped)
  },
})
