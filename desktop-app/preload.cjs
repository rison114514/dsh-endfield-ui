const { contextBridge, ipcRenderer } = require('electron')

// 引导页与主进程之间的安全桥接。保持 contextIsolation 与 sandbox。
contextBridge.exposeInMainWorld('dshShell', {
  pickDsh: () => ipcRenderer.invoke('dsh:pick-dsh'),
  pickRepo: () => ipcRenderer.invoke('dsh:pick-repo'),
  redetect: () => ipcRenderer.invoke('dsh:redetect'),
})
