const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();

function refreshStats(id) {
  const place = require('./src/js/getGame.js').refreshGame(id);
  return place;
}
app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, './src/js/preload.js'),
      nodeIntegration: false,
      nodeIntegrationInWorker: false
    }
  });
  let trayMenu = [];
  let cmp = '.';
  if (!app.isPackaged) {
    trayMenu = [
      { label: 'Show', click: () => { mainWindow.show() } },
      {
        label: 'DevTools', click: () => {
          const devtools = new BrowserWindow();
          mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
          mainWindow.webContents.openDevTools({ mode: 'detach' });
        }
      },
      { label: 'Quit', click: () => { app.isQuiting = true; app.quit() } }
    ]
  } else {
    trayMenu = [
      { label: 'Show', click: () => { mainWindow.show() } },
      { label: 'Quit', click: () => { app.isQuiting = true; app.quit() } }
    ]
    cmp = './resources/app.asar'
  }
  mainWindow.removeMenu();
  mainWindow.loadFile('./src/meow.html');
  mainWindow.hide();
  const tray = new Tray(cmp + '/src/media/rblxcord.png');
  tray.setToolTip('Rblxcord');
  tray.setContextMenu(Menu.buildFromTemplate(trayMenu));
  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });
  mainWindow.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
  tray.on('click', () => { mainWindow.show() })

  ipcMain.handle('refresh', refreshStats);

  console.log('Meow.');
})