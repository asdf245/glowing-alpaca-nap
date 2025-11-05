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
    const defaultFilename = `Draft-Mud-Logging-Report-${data.wellName || 'Untitled'}-${data.date || 'N/A'}.json`;
    
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Report Draft',
      defaultPath: path.join(USER_DOCUMENTS, defaultFilename),
      filters: [{ name: 'JSON Report File', extensions: ['json'] }],
    });

    if (canceled || !filePath) {
      return { success: false, message: 'Save cancelled' };
    }

    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log('Saved JSON draft successfully at:', filePath);
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Failed to write JSON file:', error);
      return { success: false, message: `Failed to write file: ${error}` };
    }
  });

  ipcMain.handle('load-report', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Report File',
      defaultPath: USER_DOCUMENTS,
      properties: ['openFile'],
      filters: [{ name: 'JSON Report File', extensions: ['json'] }],
    });

    if (canceled || filePaths.length === 0) {
      return { success: false, message: 'Open cancelled' };
    }

    const filePath = filePaths[0];
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      console.log('Loaded JSON report successfully from:', filePath);
      return { success: true, data: data, path: filePath };
    } catch (error) {
      console.error('Failed to read or parse JSON file:', error);
      return { success: false, message: `Failed to read file: ${error}` };
    }
  });
  
  ipcMain.handle('export-excel', async (event, { data: base64Data, wellName, date }) => {
    // 1. Convert Base64 data back to a Buffer
    const excelBuffer = Buffer.from(base64Data, 'base64');
    
    const defaultFilename = `Daily-Mud-Logging-Report-${wellName || 'Untitled'}-${date || 'N/A'}.xls`;
    
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Report to Excel',
      defaultPath: path.join(USER_DOCUMENTS, defaultFilename),
      filters: [{ name: 'Excel Workbook', extensions: ['xls'] }],
    });

    if (canceled || !filePath) {
      return { success: false, message: 'Export cancelled' };
    }

    try {
      // 2. Write the buffer to the selected file path
      await fs.writeFile(filePath, excelBuffer);
      console.log('Generated Excel file successfully at:', filePath);
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Failed to write Excel file:', error);
      return { success: false, message: `Failed to write file: ${error}` };
    }
  });
  
  ipcMain.handle('export-pdf-request', async (event, { wellName, date }) => {
    const webContents = event.sender;
    const defaultFilename = `Daily-Mud-Logging-Report-${wellName || 'Untitled'}-${date || 'N/A'}.pdf`;

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Report to PDF',
      defaultPath: path.join(USER_DOCUMENTS, defaultFilename),
      filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
    });

    if (canceled || !filePath) {
      return { success: false, message: 'Export cancelled' };
    }

    try {
      // Use Electron's built-in PDF generation
      const pdfBuffer = await webContents.printToPDF({
        pageSize: 'A4',
        printBackground: true,
        landscape: false,
        margins: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        },
      });

      await fs.writeFile(filePath, pdfBuffer);
      console.log('Generated PDF file successfully at:', filePath);
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Failed to generate or write PDF file:', error);
      return { success: false, message: `Failed to generate PDF: ${error}` };
    }
  });
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