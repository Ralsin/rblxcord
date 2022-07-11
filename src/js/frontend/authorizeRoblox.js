const { ipcRenderer } = require("electron");

async function onLoad() {
  const { pathname } = window.location;

  if (pathname === "/home") {
    const [profile] = document.getElementsByClassName(
      "text-link dynamic-overflow-container"
    );

    const [userId] = profile.href.match(/\d{8}/);

    await ipcRenderer.invoke("setId", userId);

    window.close();
  }
}

window.onload = onLoad;
