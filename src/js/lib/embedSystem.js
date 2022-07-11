const { Client } = require("discord-rpc");
const { readFileSync, existsSync } = require("fs");
const path = require("path");
const { app } = require("electron");

const fetchJSON = require("./fetchJSON");

const robloxIdPath = path.resolve(app.getPath("appData"), "rblxcord/robloxId");

let avatarUrl;
let userNames;

async function updateProfile() {
  const id = readFileSync(robloxIdPath, "utf-8");

  const { displayName, name } = await fetchJSON(
    `https://users.roblox.com/v1/users/${id}`
  );

  const avatar = await fetchJSON(
    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=60x60&format=Png`
  );

  userNames = { nick: displayName, name };
  avatarUrl = avatar.data[0].imageUrl;
}

if (existsSync(robloxIdPath)) updateProfile();

let Rblxcord;

class RblxcordCon {
  client;

  isReady = false;

  constructor(clientId) {
    const client = new Client({ transport: "ipc" });

    client.once("ready", () => {
      console.log("[DRP] Connected! Meow!");
      this.isReady = true;
    });

    client.login({ clientId }).catch(() => {
      this.destroy();

      setTimeout(() => {
        Rblxcord = new RblxcordCon(process.env.clientId);
      }, 10e3);
    });

    this.client = client;
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
    } catch (e) {
      return false;
    }

    return false;
  }
}

function createActivity(placeInfo) {
  const startTimestamp = new Date();

  let activity;

  if (placeInfo.name) {
    activity = {
      details: placeInfo.name,
      state: `by ${placeInfo.owner.split("@")[1] || placeInfo.owner}`,
      largeImageKey: placeInfo.iconUrl,
      largeImageText: placeInfo.name,
      startTimestamp,
    };

    if (userNames) {
      activity = {
        ...activity,
        smallImageKey: avatarUrl,
        smallImageText: `${userNames?.nick} (@${userNames?.name})`,
      };
    }
  }

  return activity;
}

function isConnected() {
  return Rblxcord && Rblxcord.isReady;
}

Rblxcord = new RblxcordCon(process.env.clientId);

let connected = false;
let latestId = "none";

function clearActivity() {
  Rblxcord.clearActivity();

  latestId = "none";
  connected = false;

  console.log("[DRP] No activity... Meow!");

  return isConnected();
}

async function refreshDiscord(placeInfo) {
  if (connected && placeInfo === "none") return clearActivity();

  if (Rblxcord && Rblxcord.isReady && latestId !== placeInfo.id) {
    console.log("[DRP] Setting activity... Meow!");

    const activity = createActivity(placeInfo);

    if (!activity) return clearActivity();

    connected = Rblxcord.setActivity(activity);

    console.log(`${latestId} != ${placeInfo.id}`);

    if (isConnected()) {
      latestId = placeInfo.id;

      return true;
    }
  }

  return undefined;
}

module.exports = { isConnected, refreshDiscord };
