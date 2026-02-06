import { app, BrowserWindow } from 'electron';
import path from 'path';
import { ClaudeClient } from './services/claude-client';
import { StorageService } from './services/storage';
import { getApiKey, getBaseUrl, getModel, hasApiKey, migrateConfig } from './services/config';
import { registerIpcHandlers } from './ipc-handlers';
import * as log from './services/logger';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 480,
    minHeight: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(app.getAppPath(), 'src', 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  log.initLogger();
  log.info('main', 'App starting');

  migrateConfig();

  const storage = new StorageService();
  const claudeClient = hasApiKey()
    ? new ClaudeClient(getApiKey()!, getModel(), getBaseUrl())
    : null;

  log.info('main', `API key configured: ${hasApiKey()}`);
  log.info('main', `Model: ${getModel()}`);

  registerIpcHandlers({ claudeClient, storage });
  createWindow();

  log.info('main', 'App ready');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
