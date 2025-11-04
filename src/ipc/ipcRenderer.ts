// This file simulates the Electron preload script's context bridge exposure.
// In a real Electron app, this would be defined in the preload script.

const isElectron = typeof window !== 'undefined' && (window as any).process?.type === 'renderer';

const electronApi = {
  invoke: async (channel: string, ...args: any[]) => {
    console.log(`[IPC Invoke] Channel: ${channel}, Args:`, args);
    
    // Simulate responses for specific channels if needed for initial setup
    if (channel === 'get-system-info') {
      return { appVersion: '1.0.0', os: 'Windows 10 (Simulated)' };
    }
    if (channel === 'list-recent-reports') {
      return [
        { name: 'AHVAZ#31 - 1404.08.12', path: '/path/to/report1.json' },
        { name: 'MARUN#10 - 1404.08.11', path: '/path/to/report2.json' },
      ];
    }
    
    // Simulate file dialogs returning success
    if (channel === 'export-excel' || channel === 'export-pdf' || channel === 'save-report' || channel === 'load-report') {
        // In a real app, the main process handles the file operation and returns success/failure.
        return { success: true, path: `/simulated/path/${channel}.file` };
    }

    return null;
  },
  on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
    console.log(`[IPC Listener] Registered for channel: ${channel}`);
    // No actual events to listen to in this simulation
  },
  send: (channel: string, ...args: any[]) => {
    console.log(`[IPC Send] Channel: ${channel}, Args:`, args);
  },
};

// Expose the API globally if not running in Electron (for development testing)
if (!isElectron) {
  (window as any).electron = electronApi;
}

export const ipcRenderer = isElectron ? window.electron : electronApi;