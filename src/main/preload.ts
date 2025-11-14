import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveReport: (data: any) => ipcRenderer.invoke('save-report', data),
  loadReport: () => ipcRenderer.invoke('load-report'),
  
  // Export operations
  exportExcel: (data: { data: string; wellName: string; date: string }) => 
    ipcRenderer.invoke('export-excel', data),
  exportPdfRequest: (data: { wellName: string; date: string }) => 
    ipcRenderer.invoke('export-pdf-request', data),
  
  // Menu event listeners
  onMenuNewReport: (callback: () => void) => {
    ipcRenderer.on('menu-new-report', callback);
    return () => ipcRenderer.removeListener('menu-new-report', callback);
  },
  onMenuOpenReport: (callback: () => void) => {
    ipcRenderer.on('menu-open-report', callback);
    return () => ipcRenderer.removeListener('menu-open-report', callback);
  },
  onMenuSaveDraft: (callback: () => void) => {
    ipcRenderer.on('menu-save-draft', callback);
    return () => ipcRenderer.removeListener('menu-save-draft', callback);
  },
  onMenuExportExcel: (callback: () => void) => {
    ipcRenderer.on('menu-export-excel', callback);
    return () => ipcRenderer.removeListener('menu-export-excel', callback);
  },
  onMenuExportPdf: (callback: () => void) => {
    ipcRenderer.on('menu-export-pdf', callback);
    return () => ipcRenderer.removeListener('menu-export-pdf', callback);
  },
  onMenuToggleDarkMode: (callback: () => void) => {
    ipcRenderer.on('menu-toggle-dark-mode', callback);
    return () => ipcRenderer.removeListener('menu-toggle-dark-mode', callback);
  },
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      saveReport: (data: any) => Promise<{ success: boolean; path?: string; message?: string }>;
      loadReport: () => Promise<{ success: boolean; data?: any; path?: string; message?: string }>;
      exportExcel: (data: { data: string; wellName: string; date: string }) => Promise<{ success: boolean; path?: string; message?: string }>;
      exportPdfRequest: (data: { wellName: string; date: string }) => Promise<{ success: boolean; path?: string; message?: string }>;
      onMenuNewReport: (callback: () => void) => () => void;
      onMenuOpenReport: (callback: () => void) => () => void;
      onMenuSaveDraft: (callback: () => void) => () => void;
      onMenuExportExcel: (callback: () => void) => () => void;
      onMenuExportPdf: (callback: () => void) => () => void;
      onMenuToggleDarkMode: (callback: () => void) => () => void;
    };
  }
}
