const { Client } = require('discord-rpc')
const { readFileSync, existsSync } = require('fs');
const { app } = require('electron');
const fetch = require('node-fetch')
const { execSync } = require('child_process');
let avatarUrl, userNames;
let latestId;
let data = new Date();
let connected = false;
async function updateProfile() {
  const id = readFileSync(app.getPath('appData') + '\\rblxcord\\robloxId').toString();
  const userFetch = await fetch('https://users.roblox.com/v1/users/' + id);
  const user = await userFetch.json();
  userNames = { nick: user.displayName, name: user.name };
  const avatarFetch = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=60x60&format=Png`);
  const avatar = await avatarFetch.json();
  avatarUrl = avatar.data[0].imageUrl;
}
if (existsSync(app.getPath('appData') + '\\rblxcord\\robloxId')) updateProfile();

let Rblxcord;
class RblxcordCon {
  clientId;
  client;
  isReady = false;
  constructor(clientId) {
    this.clientId = clientId;
    this.client = new Client({ transport: 'ipc' });
    this.client.once('ready', () => {
      console.log('[DRP] Connected! Meow!');
      this.isReady = true;
    });
    this.client.connect(this.clientId).catch(console.log);
    this.client.login({ clientId: this.clientId }).catch(() => { this.destroy(); setTimeout(() => { Rblxcord = new RblxcordCon('983406322924023860'); }, 10e3) });
  }
  setActivity(activity) {
    if (!this.isReady) return false;
    this.client.setActivity(activity);
    return true;
  }
  clearActivity() {
    this.client.clearActivity()
  }
  destroy() {
    try {
      if (this.isReady) {
        this.client.clearActivity();
        this.client.destroy();
      }
      console.log('boom!');
    } catch (e) { }
  }
}
Rblxcord = new RblxcordCon('983406322924023860');

exports.refreshDiscord = async (placeJson) => {
  if (placeJson == 'none' && connected) {
    Rblxcord.clearActivity();
    latestId = placeJson.id;
    console.log('[DRP] No activity... Meow!');
    connected = false;
    return false;
  } else if (!connected && Rblxcord?.isReady || (latestId != placeJson.id && latestId != undefined && placeJson != 'none')) {
    console.log('[DRP] Setting activity... Meow!');
    data = new Date();
    let activity;
    if (userNames) {
      activity = {
        details: placeJson.name,
        state: 'by ' + (placeJson.owner?.split('@')[1] || placeJson.owner),
        largeImageKey: placeJson.iconUrl,
        largeImageText: placeJson.id,
        smallImageKey: avatarUrl,
        smallImageText: `${userNames?.nick} (@${userNames?.name})`,
        startTimestamp: data
      }
    } else {
      activity = {
        details: placeJson.name,
        state: 'by ' + (placeJson.owner.split('@')[1] || placeJson.owner),
        largeImageKey: placeJson.iconUrl,
        largeImageText: placeJson.id,
        startTimestamp: data
      }
    }
    const activitySet = Rblxcord.setActivity(activity);
    console.log(`${latestId} != ${placeJson.id}`);
    connected = activitySet;
    if (connected) latestId = placeJson.id;
    return connected;
  } else return false;
}