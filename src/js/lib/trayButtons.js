const { BrowserWindow } = require("electron");
const path = require("path");

const createDevToolWindow = require("./createDevToolWindow");

function createButton(label, callback) {
  return { label, click: callback };
}

function ShowButton(mainWindow) {
  return createButton("Show", () => mainWindow.show());
}

function QuitButton(app) {
  return createButton("Quit", () => {
    app.isQuiting = true;
    app.quit();
  });
}

function AuthorizeButton(callback) {
  return createButton("Authorize", () => {
    const authWindow = new BrowserWindow({
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.resolve(__dirname, "../frontend/authorizeRoblox.js"),
      },
    });

    authWindow.loadURL("https://roblox.com");

    if (callback) callback(authWindow);
  });
}

function DevToolsButton(window) {
  return createButton("DevTools", () => createDevToolWindow(window));
}

module.exports = { ShowButton, QuitButton, AuthorizeButton, DevToolsButton };
