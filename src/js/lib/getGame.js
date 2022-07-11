const { execSync } = require("child_process");

const { refreshDiscord, isConnected } = require("./embedSystem");
const fetchJSON = require("./fetchJSON");

function getPlaceId() {
  const cmd = execSync(
    "C:\\Windows\\System32\\wbem\\wmic.exe process where \"Name='RobloxPlayerBeta.exe'\" get CommandLine /format:csv"
  ).toString();

  if (!cmd || !cmd.split("\n")[2]) return "none";

  return cmd.split("\n")[2].split("placeId=")[1].split("&")[0];
}

async function getGameInfo(id, prevId) {
  if (id === prevId) return { meow: true };
  if (id === "none") return { id: "none", connected: isConnected() };

  const { Name, Builder } = await fetchJSON(
    `https://www.roblox.com/places/api-get-details?assetId=${id}`
  );

  const {
    data: [{ imageUrl }],
  } = await fetchJSON(
    `https://thumbnails.roblox.com/v1/assets?assetIds=${id}&size=250x250&format=Png`
  );

  return {
    id,
    name: Name,
    owner: Builder,
    iconUrl: imageUrl,
    connected: isConnected(),
  };
}

async function refreshGame(prevId) {
  const placeJson = await getGameInfo(getPlaceId(), prevId);

  await refreshDiscord(placeJson);

  return placeJson;
}

module.exports = { refreshGame };
