const { Client } = require("discord-rpc");
const { readFileSync, existsSync } = require("fs");
const { app } = require("electron");
const fetch = require("node-fetch");
let avatarUrl, userNames;
let latestId = "none";
let data = new Date();
let connected = false;
async function getFromUrl(url) {
  const result = await fetch(url);
  const data = result.json();
  return data;
}
async function updateProfile() {
  const id = readFileSync(
    app.getPath("appData") + "\\rblxcord\\robloxId"
  ).toString();
  const user = await getFromUrl("https://users.roblox.com/v1/users/" + id);
  userNames = { nick: user.displayName, name: user.name };
  const avatar = await getFromUrl(
    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=60x60&format=Png`
  );
  avatarUrl = avatar.data[0].imageUrl;
}
if (existsSync(app.getPath("appData") + "\\rblxcord\\robloxId"))
  updateProfile();

let Rblxcord;
class RblxcordCon {
  client;
  isReady = false;
  constructor(clientId) {
    this.client = new Client({ transport: "ipc" });
    this.client.once("ready", () => {
      console.log("[DRP] Connected! Meow!");
      this.isReady = true;
    });
    this.client.login({ clientId }).catch(() => {
      this.destroy();
      setTimeout(() => {
        //! Token steal vulnerability!
        Rblxcord = new RblxcordCon("995025874296504401");
      }, 10e3);
    });
  }
  setActivity(activity) {
    if (!this.isReady) return false;
    this.client.setActivity(activity);
    return true;
  }
  clearActivity() {
    if (!this.isReady) return;
    this.client.clearActivity();
  }
  destroy() {
    try {
      if (this.isReady) {
        this.client.clearActivity();
        this.client.destroy();
      }
      console.log("boom!");
    } catch (e) {}
  }
}
//! Token steal vulnerability!
Rblxcord = new RblxcordCon("995025874296504401");

exports.refreshDiscord = async (placeJson) => {
  if (connected && placeJson == "none") {
    Rblxcord.clearActivity();
    latestId = "none";
    console.log("[DRP] No activity... Meow!");
    connected = false;
    if (Rblxcord?.isReady) {
      return Rblxcord.isReady;
    } else return false;
  } else if (Rblxcord?.isReady && latestId != placeJson.id) {
    console.log("[DRP] Setting activity... Meow!");
    data = new Date();
    let activity;
    if (userNames && placeJson.name) {
      activity = {
        details: placeJson.name,
        state: "by " + (placeJson.owner?.split("@")[1] || placeJson.owner),
        largeImageKey: placeJson.iconUrl,
        largeImageText: placeJson.id,
        smallImageKey: avatarUrl,
        smallImageText: `${userNames?.nick} (@${userNames?.name})`,
        startTimestamp: data,
      };
    } else if (placeJson.name) {
      activity = {
        details: placeJson.name,
        state: "by " + (placeJson.owner.split("@")[1] || placeJson.owner),
        largeImageKey: placeJson.iconUrl,
        largeImageText: placeJson.id,
        startTimestamp: data,
      };
    } else {
      Rblxcord.clearActivity();
      latestId = "none";
      console.log("[DRP] No activity... Meow!");
      connected = false;
      if (Rblxcord?.isReady) {
        return Rblxcord.isReady;
      } else return false;
    }
    const activitySet = Rblxcord.setActivity(activity);
    console.log(`${latestId} != ${placeJson.id}`);
    connected = activitySet;
    if (Rblxcord?.isReady) latestId = placeJson.id;
    return Rblxcord?.isReady;
  } else return false;
};

exports.isConnected = () => {
  if (Rblxcord) {
    return Rblxcord.isReady;
  } else return false;
};
