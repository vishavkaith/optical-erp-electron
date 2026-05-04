const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // --- Clients (Customers) ---
  customerAdd: (data) => ipcRenderer.invoke('add-client', data),
  customerList: () => ipcRenderer.invoke('get-clients'),
  customerGet: (id) => ipcRenderer.invoke('get-client', id),
  customerUpdate: (data) => ipcRenderer.invoke('update-client', data),
  customerDelete: (id) => ipcRenderer.invoke('delete-client', id),

  // --- Payments ---
  paymentAdd: (data) => ipcRenderer.invoke('payments:create', data),
  paymentList: () => ipcRenderer.invoke('payments:list'),
  paymentUpdate: (data) => ipcRenderer.invoke('payments:update', data),
  paymentDelete: (id) => ipcRenderer.invoke('payments:delete', id),
  getPaymentsByClientId: (clientId) =>
    ipcRenderer.invoke('payments:byClientId', clientId),

  // --- Backup ---
  backupExport: () => ipcRenderer.invoke('backup:export'),
  backupImport: () => ipcRenderer.invoke('backup:import'),

  // Aliases so both pages work
  exportDatabase: () => ipcRenderer.invoke('backup:export'),
  importDatabase: () => ipcRenderer.invoke('backup:import'),

  exportCsv: () => ipcRenderer.invoke('export:csv'),

  // 🟢 Focus Restore Support
  onRestoreFocus: (callback) => {
    const handler = () => {
      try {
        callback(); // Call provided function safely
      } catch (err) {
        console.error('restore-focus callback error:', err);
      }
    };
    ipcRenderer.on('restore-focus', handler);

    // Return cleanup function so React can call it in useEffect cleanup
    return () => {
      ipcRenderer.removeListener('restore-focus', handler);
    };
  },
});
