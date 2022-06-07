const { execSync } = require('child_process')
const fetch = require('node-fetch')
const { refreshDiscord } = require('./discord.js')

function getPlaceId() {
  const cmd = execSync("C:\\Windows\\System32\\wbem\\wmic.exe process where \"Name='RobloxPlayerBeta.exe'\" get CommandLine /format:csv").toString();
  if (!cmd?.split("\n")[2]) return 'none';
  return cmd?.split("\n")[2].split("placeId=")[1].split("&")[0];
}
async function getGameInfo(id, prevId) {
  if (id == prevId) return { "meow": true }
  const gaem = await fetch(`https://www.roblox.com/places/api-get-details?assetId=${id}`);
  const info = await gaem.json();
  const iconGaem = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${id}&size=250x250&format=Png&isCircular=false`);
  const icon = await iconGaem.json();
  const json = {
    id,
    name: info.Name,
    owner: info.Builder || "error",
    iconUrl: icon.data[0].imageUrl,
    connected: null
  }
  return json;
}

module.exports.refreshGame = async (prevId) => {
  const placeId = getPlaceId();
  if (placeId == 'none') {
    refreshDiscord(placeId);
    return { connected: false };
  }
  const placeJson = await getGameInfo(placeId, prevId);
  placeJson.connected = await refreshDiscord(placeJson);
  return placeJson;
}