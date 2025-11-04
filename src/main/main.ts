import { app, BrowserWindow, ipcMain, Menu, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

// --- Configuration Constants ---
const IS_DEV = process.env.NODE_ENV === 'development';
const MIN_WIDTH = 1280;
const MIN_HEIGHT = 720;

// Define data paths (Simulated for Windows environment)
const USER_DOCUMENTS = path.join(os.homedir(), 'Documents', 'MudlogReports');
const APP_DATA_TEMP = path.join(app.getPath('userData'), 'temp');
const APP_DATA_BACKUPS = path.join(app.getPath('userData'), 'backups');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(USER_DOCUMENTS, { recursive: true });
  await fs.mkdir(APP_DATA_TEMP, { recursive: true });
  await fs.mkdir(APP_DATA_BACKUPS, { recursive: true });
}

// --- IPC Handlers ---
function setupIpc(mainWindow: BrowserWindow) {
  ipcMain.handle('save-report', async (event, data) => {
    // Logic to save data to JSON file in USER_DOCUMENTS
    console.log('Saving report draft to:', USER_DOCUMENTS);
    // Placeholder implementation
    return { success: true, path: path.join(USER_DOCUMENTS, 'mudlog-draft.json') };
  });

  ipcMain.handle('export-excel', async (event, data) => {
    // In a real app, we would generate the XLSX buffer here using SheetJS
    const defaultFilename = `Daily-Mud-Logging-Report-${data.wellName || 'Untitled'}-${data.date || 'N/A'}.xls`;
    
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Report to Excel',
      defaultPath: path.join(USER_DOCUMENTS, defaultFilename),
      filters: [{ name: 'Excel Workbook', extensions: ['xls'] }],
    });

    if (canceled || !filePath) {
      return { success: false, message: 'Export cancelled' };
    }

    // Simulate file write success
    console.log('Generating Excel file at:', filePath);
    return { success: true, path: filePath };
  });
  
  // ... other IPC handlers (load-report, export-pdf, etc.)
}

// --- Menu Bar Setup ---
function createMenu(mainWindow: BrowserWindow) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'New Report', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('menu-new-report') },
        { label: 'Open Report', accelerator: 'CmdOrCtrl+O', click: () => mainWindow.webContents.send('menu-open-report') },
        { label: 'Save Draft', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('menu-save-draft') },
        { type: 'separator' },
        { label: 'Export to Excel', accelerator: 'CmdOrCtrl+E', click: () => mainWindow.webContents.send('menu-export-excel') },
        { label: 'Export to PDF', accelerator: 'CmdOrCtrl+P', click: () => mainWindow.webContents.send('menu-export-pdf') },
        { type: 'separator' },
        { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Dark Mode', click: () => mainWindow.webContents.send('menu-toggle-dark-mode') },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'toggleDevTools', visible: IS_DEV },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About', click: () => dialog.showMessageBox(mainWindow, { title: 'About NIDC Mudlog Reporter', message: 'Version 1.0.0' }) },
        { label: 'Check for Updates' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// --- Main Window Creation ---
function createWindow() {
  ensureDirectories();
  
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    frame: true,
    icon: path.join(__dirname, 'icon.ico'), // Assuming icon is in build folder
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Preload script for secure IPC
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  setupIpc(mainWindow);
  createMenu(mainWindow);

  if (IS_DEV) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode: Load bundled index.html
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});