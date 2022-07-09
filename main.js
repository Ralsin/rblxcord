const { app, BrowserWindow, Menu, Tray, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "./src/js/preload.js"),
    },
    show: false,
  });
  let trayMenu = [];
  let cmp = ".";
  if (!app.isPackaged) {
    trayMenu = [
      {
        label: "Show",
        click: () => {
          mainWindow.show();
        },
      },
      {
        label: "Authorize",
        click: () => {
          const roblo = new BrowserWindow({
            autoHideMenuBar: true,
            webPreferences: {
              preload: path.join(__dirname, "./src/js/authorizeRoblox.js"),
            },
          });
          roblo.loadURL("https://roblox.com");
          const devtools2 = new BrowserWindow();
          roblo.webContents.setDevToolsWebContents(devtools2.webContents);
          roblo.webContents.openDevTools({ mode: "detach" });
        },
      },
      {
        label: "DevTools",
        click: () => {
          const devtools = new BrowserWindow();
          mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
          mainWindow.webContents.openDevTools({ mode: "detach" });
        },
      },
      {
        label: "Quit",
        click: () => {
          app.isQuiting = true;
          app.quit();
        },
      },
    ];
  } else {
    trayMenu = [
      {
        label: "Show",
        click: () => {
          mainWindow.show();
        },
      },
      {
        label: "Quit",
        click: () => {
          app.isQuiting = true;
          app.quit();
        },
      },
    ];
    if (
      !require("fs").existsSync(app.getPath("appData") + "\\rblxcord\\robloxId")
    ) {
      trayMenu = [
        {
          label: "Show",
          click: () => {
            mainWindow.show();
          },
        },
        {
          label: "Authorize",
          click: () => {
            new BrowserWindow({
              autoHideMenuBar: true,
              webPreferences: {
                preload: path.join(__dirname, "./src/js/authorizeRoblox.js"),
              },
            }).loadURL("https://roblox.com");
          },
        },
        {
          label: "Quit",
          click: () => {
            app.isQuiting = true;
            app.quit();
          },
        },
      ];
    }
    cmp = "./resources/app.asar";
  }

  mainWindow.removeMenu();
  mainWindow.loadFile("./src/meow.html");
  mainWindow.hide();
  const tray = new Tray(cmp + "/src/media/rblxcord.png");
  tray.setToolTip("Rblxcord");
  tray.setContextMenu(Menu.buildFromTemplate(trayMenu));
  mainWindow.on("minimize", function (event) {
    event.preventDefault();
    mainWindow.hide();
  });
  mainWindow.on("close", function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
  tray.on("click", () => {
    mainWindow.show();
  });

  ipcMain.handle("refresh", (event, id) => {
    const place = require("./src/js/getGame.js").refreshGame(id);
    return place;
  });
  ipcMain.handle("setId", (event, id) => {
    fs.writeFileSync(app.getPath("appData") + "\\rblxcord\\robloxId", id);
    new BrowserWindow({
      width: 400,
      height: 200,
      frame: false,
      resizable: false,
    }).loadFile("./src/coolPopup.html");
  });

  console.log("Meow.");
});
