// renderer/src/utils/api.js
// Small wrapper to use preload-exposed API when available, otherwise
// fall back to ipcRenderer.invoke when running in dev with nodeIntegration.
const hasWindowApi = typeof window !== 'undefined' && !!window.api;
let ipc = null;
try {
  if (typeof window !== 'undefined' && window.require) {
    // In dev mode the renderer is served by Vite and main enables
    // nodeIntegration so window.require('electron').ipcRenderer is available.
    ipc = window.require('electron').ipcRenderer;
  }
} catch (e) {
  ipc = null;
}

const channelMap = {
  customerList: 'get-clients',
  customerAdd: 'add-client',
  customerUpdate: 'update-client',
  customerDelete: 'delete-client',
  customerGet: 'get-client',
  paymentAdd: 'payments:create',
  paymentList: 'payments:list',
  paymentUpdate: 'payments:update',
  paymentDelete: 'payments:delete',
  getPaymentsByClientId: 'payments:byClientId',
  backupExport: 'backup:export',
  backupImport: 'backup:import',
  exportCsv: 'export:csv',
};

async function invokeFallback(name, ...args) {
  if (hasWindowApi && typeof window.api[name] === 'function') {
    return window.api[name](...args);
  }
  const channel = channelMap[name];
  if (ipc && channel) {
    return ipc.invoke(channel, ...args);
  }
  throw new Error('No API available: ' + name);
}

export default {
  customerList: (...a) => invokeFallback('customerList', ...a),
  customerAdd: (...a) => invokeFallback('customerAdd', ...a),
  customerUpdate: (...a) => invokeFallback('customerUpdate', ...a),
  customerDelete: (...a) => invokeFallback('customerDelete', ...a),
  customerGet: (...a) => invokeFallback('customerGet', ...a),
  paymentAdd: (...a) => invokeFallback('paymentAdd', ...a),
  paymentList: (...a) => invokeFallback('paymentList', ...a),
  paymentUpdate: (...a) => invokeFallback('paymentUpdate', ...a),
  paymentDelete: (...a) => invokeFallback('paymentDelete', ...a),
  getPaymentsByClientId: (...a) => invokeFallback('getPaymentsByClientId', ...a),
  backupExport: (...a) => invokeFallback('backupExport', ...a),
  backupImport: (...a) => invokeFallback('backupImport', ...a),
  exportCsv: (...a) => invokeFallback('exportCsv', ...a),
  invoke: (...a) => {
    if (ipc) return ipc.invoke(...a);
    throw new Error('No ipc available');
  },
};
