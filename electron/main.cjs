// Electron main process. Serves the bundled web app from dist-app/ over a custom
// app:// protocol and blocks every network request so the app stays fully offline.
const { app, BrowserWindow, dialog, ipcMain, Menu, net, nativeTheme, protocol, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createStore } = require('./packs.cjs');

const DIST = path.join(__dirname, '..', 'dist-app');
const isMac = process.platform === 'darwin';
// Extra themes installed by the user live here, one .devtheme file each (see packs.cjs).
let packs;

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

function registerAppProtocol() {
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url);
    // Theme packs are served from memory: /packs/<id>/theme.js and /packs/<id>/fonts.css.
    const packMatch = /^\/packs\/([a-z][a-z0-9-]*)\/(theme\.js|fonts\.css)$/.exec(pathname);
    if (packMatch) {
      const pack = packs.read(packMatch[1]);
      if (!pack) return new Response('Not found', { status: 404 });
      const isJs = packMatch[2] === 'theme.js';
      return new Response(isJs ? pack.js : pack.css, { headers: { 'content-type': isJs ? 'text/javascript' : 'text/css', 'cache-control': 'no-store' } });
    }
    const relative = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
    const file = path.normalize(path.join(DIST, relative));
    if (!file.startsWith(DIST + path.sep)) return new Response('Forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
}

function blockNetwork() {
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] }, (_details, callback) => callback({ cancel: true }));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: 'Dev Tools',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1a1b1e' : '#ffffff',
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      devTools: !app.isPackaged,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });
  win.once('ready-to-show', () => win.show());
  // Never navigate away from the app or open new windows.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('app://')) event.preventDefault();
  });
  win.loadURL('app://dev-tools/index.html');
  return win;
}

function notifyPacksChanged() {
  for (const w of BrowserWindow.getAllWindows()) w.webContents.send('theme-packs:changed');
  buildMenu();
}

async function installPacksFromDialog(win) {
  const { canceled, filePaths } = await dialog.showOpenDialog(win ?? undefined, {
    title: 'Install theme pack',
    filters: [{ name: 'Dev Tools theme pack', extensions: ['devtheme'] }],
    properties: ['openFile', 'multiSelections'],
  });
  if (canceled || filePaths.length === 0) return;
  const { installed, errors } = packs.install(filePaths);
  if (installed.length) notifyPacksChanged();
  if (errors.length || installed.length) {
    await dialog.showMessageBox(win ?? undefined, {
      type: errors.length ? 'warning' : 'info',
      message: installed.length ? `Installed: ${installed.join(', ')}` : 'No themes were installed.',
      detail: errors.join('\n') || 'Pick it from the Theme menu in the sidebar.',
    });
  }
}

function buildMenu() {
  const installedPacks = packs.list();
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { role: 'editMenu' },
    {
      label: 'Themes',
      submenu: [
        { label: 'Install Theme Pack…', click: () => installPacksFromDialog(BrowserWindow.getFocusedWindow()) },
        {
          label: 'Remove Theme Pack',
          submenu: installedPacks.length
            ? installedPacks.map((p) => ({ label: p.label, click: () => { packs.remove(p.id); notifyPacksChanged(); } }))
            : [{ label: 'No theme packs installed', enabled: false }],
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(app.isPackaged ? [] : [{ type: 'separator' }, { role: 'reload' }, { role: 'toggleDevTools' }]),
      ],
    },
    { role: 'windowMenu' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  packs = createStore(path.join(app.getPath('userData'), 'theme-packs'));
  ipcMain.handle('theme-packs:list', () => packs.list());
  ipcMain.handle('theme-packs:install', (event) => installPacksFromDialog(BrowserWindow.fromWebContents(event.sender)));
  ipcMain.handle('theme-packs:remove', (_event, id) => { packs.remove(id); notifyPacksChanged(); });
  registerAppProtocol();
  blockNetwork();
  buildMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});
