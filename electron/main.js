const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    frame: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC for saving files (legacy string path)
ipcMain.handle('save-file', async (event, { defaultName, data, extension }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
  });
  return result;
});

// IPC for saving a binary buffer to disk
ipcMain.handle('save-buffer', async (event, { defaultName, buffer, extension }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  await fs.promises.writeFile(result.filePath, Buffer.from(buffer));
  return { canceled: false, filePath: result.filePath };
});
