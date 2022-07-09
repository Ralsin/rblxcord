const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const createTray = require("./lib/trayMenu");
const { refreshGame } = require("./getGame");

app.disableHardwareAcceleration();

let mainWindow;

function hideWindow(event) {
  if (!mainWindow) return;

  event.preventDefault();
  mainWindow.hide();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,

    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  const tray = createTray(app, mainWindow);

  mainWindow.removeMenu();
  mainWindow.loadFile("../meow.html");
  mainWindow.hide();

  mainWindow.on("minimize", hideWindow);
  mainWindow.on("close", (event) => {
    if (!app.isQuiting) {
      hideWindow(event);
    } else {
      tray.destroy();

      mainWindow = null;
    }
  });

  console.log("Meow.");
}

app.on("ready", createWindow);
app.on("window-all-closed", () => app.quit());

app.on("activate", () => {
  if (!mainWindow) createWindow();
});

ipcMain.handle("refresh", (event, id) => refreshGame(id));
ipcMain.handle("setId", (event, id) => {
  fs.writeFileSync(app.getPath("appData") + "\\rblxcord\\robloxId", id);

  new BrowserWindow({
    width: 400,
    height: 200,
    frame: false,
    resizable: false,
  }).loadFile("../coolPopup.html");
});
