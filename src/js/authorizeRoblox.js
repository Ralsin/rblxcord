window.onload = async () => {
  if (document.title == "Home - Roblox") {
    await require("electron").ipcRenderer.invoke(
      "setId",
      document
        .getElementsByClassName("text-link dynamic-overflow-container")[0]
        .href.split("/")[4]
        .toString()
    );
    window.close();
  }
};
