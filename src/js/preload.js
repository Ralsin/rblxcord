const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  refresh: (arg) => ipcRenderer.invoke('refresh', arg)
})