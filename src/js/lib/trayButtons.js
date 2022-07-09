const createDevToolWindow = require("./createDevToolWindow");

function ShowButton(mainWindow) {
  return {
    label: "Show",
    click: () => mainWindow.show(),
  };
}

function QuitButton(app) {
  return {
    label: "Quit",
    click: () => {
      app.isQuiting = true;
      app.quit();
    },
  };
}

function AuthorizeButton(callback) {
  return {
    label: "Authorize",
    click: () => {
      const authWindow = new BrowserWindow({
        autoHideMenuBar: true,
        webPreferences: {
          preload: path.resolve(__dirname, "./authorizeRoblox.js"),
        },
      });

      authWindow.loadURL("https://roblox.com");

      if (callback) callback(authWindow);
    },
  };
}

function DevToolsButton(window) {
  return {
    label: "DevTools",
    click: () => createDevToolWindow(window),
  };
}

module.exports = { ShowButton, QuitButton, AuthorizeButton, DevToolsButton };
