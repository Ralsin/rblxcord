const { execSync } = require("child_process");
const fetch = require("node-fetch");
const { refreshDiscord, isConnected } = require("./discord.js");

function getPlaceId() {
  const cmd = execSync(
    "C:\\Windows\\System32\\wbem\\wmic.exe process where \"Name='RobloxPlayerBeta.exe'\" get CommandLine /format:csv"
  ).toString();
  if (!cmd?.split("\n")[2]) return "none";
  return cmd?.split("\n")[2].split("placeId=")[1].split("&")[0];
}
async function getGameInfo(id, prevId) {
  if (id == prevId) return { meow: true };
  if (id == "none") return { id: "none", connected: isConnected() };
  const gaem = await fetch(
    `https://www.roblox.com/places/api-get-details?assetId=${id}`
  );
  const info = await gaem.json();
  const iconGaem = await fetch(
    `https://thumbnails.roblox.com/v1/assets?assetIds=${id}&size=250x250&format=Png`
  );
  const icon = await iconGaem.json();
  const json = {
    id,
    name: info.Name,
    owner: info.Builder,
    iconUrl: icon.data[0].imageUrl,
    connected: isConnected(),
  };
  return json;
}

module.exports.refreshGame = async (prevId) => {
  const placeJson = await getGameInfo(getPlaceId(), prevId);
  await refreshDiscord(placeJson);
  return placeJson;
};
