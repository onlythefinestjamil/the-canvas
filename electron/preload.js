const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('canvasAPI', {
  saveFile: (opts) => ipcRenderer.invoke('save-file', opts),
  saveBuffer: (opts) => ipcRenderer.invoke('save-buffer', opts),
  platform: process.platform,
  versions: process.versions,
});
