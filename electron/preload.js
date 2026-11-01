const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('canvasAPI', {
  saveFile: (opts) => ipcRenderer.invoke('save-file', opts),
  platform: process.platform,
  versions: process.versions,
});
