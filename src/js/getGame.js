const { execSync } = require('child_process')
const fetch = require('node-fetch')
const { refreshDiscord, isConnected } = require('./discord.js')

function getPlaceId() {
  const cmd = execSync('wmic process where "Name=\'RobloxPlayerBeta.exe\'" get /format:csv').toString();
  if (!cmd?.split("\n")[2]) return 'none';
  return cmd?.split("\n")[2].split("placeId=")[1].split("&")[0];
}
async function getGameInfo(id, prevId) {
  try {
    if (id == prevId) return { "meow": true }
    if (id == 'none') return { id: 'none', connected: isConnected() }
    const gaem = await fetch(`https://www.roblox.com/places/api-get-details?assetId=${id}`);
    const info = await gaem.json();
    const iconGaem = await fetch(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${id}&size=150x150&format=Png`);
    const icon = await iconGaem.json();
    return {
      id,
      name: info.Name,
      owner: info.Builder,
      iconUrl: icon.data[0].imageUrl,
      connected: isConnected()
    }
  } catch (e) {
    console.warn(e)
    console.log('Failsafe to none')
    return { id: 'none', connected: isConnected() }
  }
}

module.exports.refreshGame = async (prevId) => {
  const placeJson = await getGameInfo(getPlaceId(), prevId);
  await refreshDiscord(placeJson);
  return placeJson;
}