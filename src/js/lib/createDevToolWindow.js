function createDevToolWindow(window) {
  const devtools = new BrowserWindow();

  window.webContents.setDevToolsWebContents(devtools.webContents);
  window.webContents.openDevTools({ mode: "detach" });
}

module.exports = createDevToolWindow;
