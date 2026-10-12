// Exposes the theme pack API to the app. Everything else stays out of reach of the page.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('devtools', {
  themePacks: {
    list: () => ipcRenderer.invoke('theme-packs:list'),
    install: () => ipcRenderer.invoke('theme-packs:install'),
    remove: (id) => ipcRenderer.invoke('theme-packs:remove', String(id)),
    /** Calls `cb` whenever packs are installed or removed. Returns an unsubscribe function. */
    onChanged: (cb) => {
      const handler = () => cb();
      ipcRenderer.on('theme-packs:changed', handler);
      return () => ipcRenderer.removeListener('theme-packs:changed', handler);
    },
  },
});
