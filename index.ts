import { app, Menu, Tray, MenuItemConstructorOptions, MenuItem, Notification, nativeImage } from 'electron';
import { execSync } from 'child_process';
import { Client, Presence } from 'discord-rpc';
import fetch from 'node-fetch';
import os from 'os';
import { readFileSync, existsSync, writeFileSync } from 'fs';

let resourcesPoint = app.isPackaged === true ? './resources/app.asar' : '.';
let optionsPoint = app.getPath('appData') + '\\rblxcord\\options.json';
const icon = nativeImage.createFromPath(resourcesPoint + '/build/icon.ico');
const cmdVersion = (+os.release().slice(0, 2)) > 7 ? 'powershell' : 'cmd';
const installed = app.isPackaged === true ? existsSync('./resources/elevate.exe') : true;

// Activity info, Game / Developer
let ActivityDetails: string, ActivityState: string;
// Game Image / Game Id / User Avatar Image / Nickname (@Username)
let LargeImage: string | undefined, LargeText: string | undefined, SmallImage: string | undefined, SmallText: string | undefined;

async function updateProfile() {
  const id = readFileSync(app.getPath('appData') + '\\rblxcord\\robloxId', { encoding: 'utf8' });
  const user = await getJsonFromUrl('https://users.roblox.com/v1/users/' + id);
  SmallText = `${user.displayName} (@${user.name})`;
  const avatar = await getJsonFromUrl(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=48x48&format=Png`);
  SmallImage = avatar.data[0].imageUrl;
}
if (existsSync(app.getPath('appData') + '\\rblxcord\\robloxId')) updateProfile();

// Silly functions
let latestPlaceId: string | undefined = "none";
function getPlaceId() {
  try {
    let placeId;
    if (cmdVersion == 'powershell') {
      const cmd = execSync('Get-CimInstance -ClassName Win32_Process -Filter \'Name like "RobloxPlayerBeta.exe"\' | Select CommandLine | ConvertTo-JSON', { shell: "powershell.exe" }).toString();
      const output = cmd;
      if (!output) {
        latestPlaceId = "none";
        return { message: "empty" };
      }
      const parsed = JSON.parse(output)
      const susThing = Object.prototype.toString.call(parsed) === '[object Array]' ? parsed : [parsed]
      placeId = susThing[0]["CommandLine"].length > 128 ? susThing[0]["CommandLine"].split("placeId=")[1]?.split("&")[0] : susThing[1]["CommandLine"].split("placeId=")[1]?.split("&")[0];
    } else if (cmdVersion == 'cmd') {
      const cmd = execSync('2>nul wmic process where "Name=\'RobloxPlayerBeta.exe\'" get /format:csv').toString();
      placeId = cmd?.split("placeId=")[1]?.split("&")[0];
    } else throw new Error("Unsupported OS"); // ik its silly
    if (!placeId) {
      latestPlaceId = "none";
      return { message: "empty" };
    }
    if (placeId == latestPlaceId && Rblxcord.hasActivity) return { message: "keep" };
    return {
      message: "update",
      id: placeId
    };
  } catch (e) {
    Notify({ dependOnOption: "showErrorToasts", body: "Failed to get place id, failsafe was applied." });
    return { message: "keep" };
  }
}

async function getJsonFromUrl(url: string, body?: any) {
  try {
    const result = await fetch(url, { body });
    const data = result.json();
    return data as any;
  } catch (e) {
    const error = "Failed to get result from the following url:\n" + url;
    Notify({ dependOnOption: "showErrorToasts", body: error });
    return { ErrorMessage: error };
  }
}

function Notify(notificationOptions: { dependOnOption?: string, title?: string, body?: string, silent?: boolean }) {
  if (!installed) return;
  if (notificationOptions.dependOnOption) {
    const option = options.get(notificationOptions.dependOnOption)?.at(1);
    option && new Notification({ title: notificationOptions.title, body: notificationOptions.body, silent: notificationOptions.silent || true, icon }).show();
  } else new Notification({ title: notificationOptions.title, body: notificationOptions.body, silent: notificationOptions.silent || true, icon }).show();
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
      Notify({ dependOnOption: "showStatusToasts", body: "Connected!" });
      this.isReady = true;
    });
    this.client.once('disconnected', () => {
      console.log('[DRPC] Disconnected! Meow!');
      Notify({ dependOnOption: "showStatusToasts", body: "Disconnected!" });
      this.destroy();
    });
    this.client.login({ clientId: '983406322924023860' }).catch((e) => {
      this.destroy();
      console.log(e);
    });
  }
  updateActivity() {
    if (!this.isReady) return false;
    const showIcon = options.get("showAvatar")?.at(1)
    const activity: Presence = {
      details: ActivityDetails,
      state: ActivityState,
      largeImageKey: LargeImage,
      largeImageText: LargeText,
      smallImageKey: showIcon === true ? SmallImage : undefined,
      smallImageText: showIcon === true ? SmallText : undefined,
      startTimestamp: new Date()
    };
    this.client.setActivity(activity);
    this.hasActivity = true;
    latestPlaceId = LargeText;
    console.log("[DRPC] Updated status!");
    Notify({ dependOnOption: "showStatusToasts", body: "Updated status!" });
    return true;
  }
  clearActivity() {
    if (!this.isReady || !this.hasActivity) return;
    this.client.clearActivity()
    this.hasActivity = false;
    console.log("[DRPC] Cleared status!");
    Notify({ dependOnOption: "showStatusToasts", body: "Cleared status!" });
  }
  destroy() {
    try {
      if (this.isReady) {
        this.isReady = false;
        this.client.clearActivity();
        this.client.destroy();
      }
      console.log('boom!');
      clearTimeout(dumbLoop);
      dumbLoop = setTimeout(() => { Rblxcord = new RblxcordCon(); }, 5000);
    } catch (e) { }
  }
}

/* Options stuff
  "optionName": [
    "Display Name",
    defaultState,
    appShouldBeInstalled
  ]
*/
const defaultOptionsObj = {
  "showStatusToasts": [
    "Show Status Toasts",
    false,
    true
  ],
  "showErrorToasts": [
    "Show Error Toasts",
    true,
    true
  ],
  "showAvatar": [
    "Avatar Icon",
    true,
    false
  ]
}
let optionsObj: Object = defaultOptionsObj;
const defaultOptions = new Map(Object.entries(defaultOptionsObj))
let options: typeof defaultOptions = defaultOptions

function toggleSetting(MenuItem: MenuItem) {
  const id = MenuItem.id, newValue = MenuItem.checked;
  const old = options.get(id) || [MenuItem.label, !newValue];
  options.set(id, [old[0], newValue]);
  saveSettings();
}
function saveSettings() {
  optionsObj = Object.fromEntries([...options])
  writeFileSync(optionsPoint, JSON.stringify(optionsObj));
}
function initSettingsMenu() {
  let optionsMenu: (MenuItemConstructorOptions)[] = []
  options.forEach((v, k) => {
    optionsMenu.push({ label: v[0] as string, id: k, type: 'checkbox', checked: v[1] as boolean, click: (mi) => toggleSetting(mi), visible: v[2] as boolean === true ? installed : true })
  })
  return Menu.buildFromTemplate(optionsMenu)
}
function ContextMenuTemplate(): (MenuItemConstructorOptions)[] {
  const visible = Rblxcord.hasActivity
  return [
    { label: ActivityDetails, id: "detailsLabel", visible },
    { label: ActivityState, id: "stateLabel", visible },
    { label: "", id: "separator", visible, type: "separator" },
    { label: "Options", submenu: initSettingsMenu() },
    { label: "Quit", role: "quit" }
  ]
}
let ContextMenu: Menu, tray: Tray;
function refreshMenu(){
  ContextMenu = Menu.buildFromTemplate(ContextMenuTemplate());
  tray.setContextMenu(ContextMenu);
}

if (existsSync(optionsPoint)) {
  optionsObj = JSON.parse(readFileSync(optionsPoint, { encoding: 'utf8' }));
  options = new Map(Object.entries(optionsObj));
  const initSize = options.size;
  defaultOptions.forEach((v, k) => {
    options.get(k) === undefined && options.set(k, v);
  });
  initSize !== options.size && saveSettings();
} else {
  writeFileSync(optionsPoint, JSON.stringify(defaultOptionsObj));
  optionsObj = defaultOptionsObj;
}
options = new Map(Object.entries(optionsObj));

app.disableHardwareAcceleration();

app.once('ready', () => {
  Rblxcord = new RblxcordCon();
  if (cmdVersion === "powershell")
    app.setAppUserModelId("electron.app.rblxcord"); // used for notifications/toasts in Win 10

  // silly tray icon
  tray = new Tray(icon);
  tray.setToolTip("rblxcord");

  // Game check and activity menu update
  refreshMenu();

  setInterval(async () => {
    const info = getPlaceId();
    switch (info.message) {
      case "update":
        if (Rblxcord.hasActivity) break;
        const placeData = await getJsonFromUrl(`https://www.roblox.com/places/api-get-details?assetId=${info.id}`);
        const iconData = await getJsonFromUrl(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${info.id}&size=150x150&format=Png`);
        ActivityDetails = placeData.Name;
        ActivityState = 'by ' + (placeData.Builder.split('@')[1] || placeData.Builder);
        LargeImage = iconData.data[0].imageUrl;
        LargeText = info.id;
        Rblxcord.updateActivity();
        refreshMenu();
        break;
      case "empty":
        if (!Rblxcord.hasActivity) break;
        Rblxcord.clearActivity();
        refreshMenu();
        break;
    }
  }, 5000);
});