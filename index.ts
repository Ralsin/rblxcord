import { app, Menu, Tray, MenuItemConstructorOptions, MenuItem } from 'electron';
import { execSync } from 'child_process';
import { Client } from 'discord-rpc';
import fetch from 'node-fetch';

// Activity info, Game / Developer
let ActivityDetails: string, ActivityState: string;
// Game Image / Game Id / User Avatar Image / Nickname (@Username)
let LargeImage: string | undefined, LargeText: string | undefined, SmallImage: string | undefined, SmallText: string | undefined;

function Quit() { app.quit() } // TypeScript is dumb

// Silly functions
let latestPlaceId: string | undefined = "none";
function getPlaceId() {
  try {
    const cmd = execSync('wmic process where "Name=\'RobloxPlayerBeta.exe\'" get /format:csv').toString();
    const placeId = cmd?.split("placeId=")[1]?.split("&")[0];
    if (!placeId) {
      latestPlaceId = "none";
      return { message: "empty" };
    }
    if (placeId == latestPlaceId) return { message: "keep" };
    return {
      message: "update",
      id: placeId
    }
  } catch (e) {
    console.log(e)
    console.log('===== Failed to get place id, failsafe message to keep. =====')
    return { message: "keep" }
  }
}

async function getJsonFromUrl(url: string) {
  try {
    const result = await fetch(url)
    const data = result.json();
    return data as any;
  } catch (e) {
    console.log(e);
    return { ErrorMessage: "Failed to get result from the following url:\n" + url }
  }
}

// Discord stuff
let Rblxcord: RblxcordCon;
let dumbLoop: any;
class RblxcordCon {
  client;
  isReady = false;
  hasActivity = false;
  constructor() {
    this.client = new Client({ transport: 'ipc' });
    this.client.once('ready', () => {
      console.log('[DRPC] Connected! Meow!');
      this.isReady = true;
    });
    this.client.once('disconnected', () => {
      console.log('[DRPC] Disconnected! Meow!');
      this.destroy();
    });
    this.client.login({ clientId: '983406322924023860' }).catch(() => { this.destroy(); });
  }
  updateActivity() {
    if (!this.isReady) return false;
    const activity = {
      details: ActivityDetails,
      state: ActivityState,
      largeImageKey: LargeImage,
      largeImageText: LargeText,
      startTimestamp: new Date()
    };
    this.client.setActivity(activity);
    this.hasActivity = true;
    latestPlaceId = LargeText;
    console.log("[DRPC] Updated status!");
    return true;
  }
  clearActivity() {
    if (!this.isReady || !this.hasActivity) return;
    this.client.clearActivity()
    this.hasActivity = false;
    console.log("[DRPC] Cleared status!");
  }
  destroy() {
    try {
      if (this.isReady) {
        this.client.clearActivity();
        this.client.destroy();
      }
      console.log('boom!');
      clearTimeout(dumbLoop);
      dumbLoop = setTimeout(() => { Rblxcord = new RblxcordCon(); }, 5000);
    } catch (e) { }
  }
}
Rblxcord = new RblxcordCon();

// Electron JS stuff to make Tray Menu
// and update info

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  let ContextMenuItems: (MenuItemConstructorOptions | MenuItem)[] = [];
  const resourcesPoint = app.isPackaged ? './resources/app.asar' : '.'
  ContextMenuItems = [{ label: 'Quit', click: Quit }]
  const tray = new Tray(resourcesPoint + '/build/icon.ico');
  tray.setToolTip("Rblxcord");

  // Context menu updating
  setInterval(() => {
    ContextMenuItems = Rblxcord.hasActivity ? [
      { label: ActivityDetails },
      { label: ActivityState },
      { type: 'separator' },
      { label: 'Quit', click: Quit }
    ] : [{ label: 'Quit', click: Quit }]
    tray.setContextMenu(Menu.buildFromTemplate(ContextMenuItems));
  }, 1000);

  // Game check and activity update
  setInterval(async () => {
    const info = getPlaceId();
    switch (info.message) {
      case "update":
        const placeData = await getJsonFromUrl(`https://www.roblox.com/places/api-get-details?assetId=${info.id}`);
        const iconData = await getJsonFromUrl(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${info.id}&size=150x150&format=Png`);
        ActivityDetails = placeData.Name;
        ActivityState = 'by ' + (placeData.Builder.split('@')[1] || placeData.Builder);
        LargeImage = iconData.data[0].imageUrl;
        LargeText = info.id;
        Rblxcord.updateActivity();
        break;
      case "empty":
        Rblxcord.clearActivity();
        break;
      default:
        break;
    }
  }, 5000);
});