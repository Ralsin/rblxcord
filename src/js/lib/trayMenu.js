const { Tray, Menu } = require("electron");
const path = require("path");

const createDevToolWindow = require("./createDevToolWindow");
const {
  ShowButton,
  QuitButton,
  AuthorizeButton,
  DevToolsButton,
} = require("./trayButtons");

function resolveIcon(dir) {
  return path.resolve(dir, "./src/media/rblxcord.png");
}

function createMenu(app, mainWindow) {
  function menuFromDefault(buttons = []) {
    return [ShowButton(mainWindow), ...buttons, QuitButton(app)];
  }

  const robloxIdPath = path.resolve(
    app.getPath("appData"),
    "rblxcord/robloxId"
  );

  console.log("RESOLVE", robloxIdPath);

  if (!app.isPackaged) {
    return {
      menuButtons: menuFromDefault([
        AuthorizeButton(createDevToolWindow),
        DevToolsButton(mainWindow),
      ]),

      icon: resolveIcon("."),
    };
  } else if (!existsSync(robloxIdPath)) {
    return {
      menuButtons: menuFromDefault([AuthorizeButton()]),
      icon: resolveIcon("./resources/app.asar"),
    };
  } else {
    return {
      menuButtons: menuFromDefault(),
      icon: resolveIcon("./resources/app.asar"),
    };
  }
}

function createTray(app, mainWindow) {
  const { menuButtons, icon } = createMenu(app, mainWindow);

  const tray = new Tray(path.resolve(icon, "./src/media/rblxcord.png"));
  const menu = Menu.buildFromTemplate(menuButtons);

  tray.setToolTip("Rblxcord");
  tray.setContextMenu(menu);

  tray.on("click", () => mainWindow.show());

  return tray;
}

module.exports = createTray;
