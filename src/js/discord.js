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
  client;
  isReady = false;
  constructor(clientId) {
    this.client = new Client({ transport: 'ipc' })
    this.client.once('ready', () => {
      console.log('[DRP] Connected! Meow!');
      this.isReady = true;
    });
    this.client.login({ clientId }).catch(() => { this.destroy() })
  }
  async setActivity(activity) {
    if (!this.isReady) return false;
    await this.client.setActivity(activity);
    return true;
  }
  async clearActivity() {
    await this.client.clearActivity()
  }
  async destroy() {
    try {
      console.log('boom!');
      if (this.isReady) {
        this.client.clearActivity();
        this.client.destroy();
      }
    } catch (err) { }
  }
}

exports.refreshDiscord = async (placeJson) => {
  if (!Rblxcord?.isReady) {
    Rblxcord?.destroy()
    Rblxcord = new RblxcordCon('983406322924023860');
  }
  if (placeJson == 'none' && connected) {
    await Rblxcord.clearActivity();
    latestId = placeJson.id;
    console.log('[DRP] No activity... Meow!');
    connected = false;
    return false;
  } else if (!connected || (latestId != placeJson.id && latestId != undefined && placeJson != 'none')) {
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
    const activitySet = await Rblxcord.setActivity(activity);
    console.log(`${latestId} != ${placeJson.id}`);
    connected = activitySet;
    if (connected) latestId = placeJson.id;
    return connected;
  }
}