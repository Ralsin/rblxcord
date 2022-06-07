// const client = new (require("easy-presence").EasyPresence)("983406322924023860");
// let latestId = 'none';
// let data = new Date();
// let connected = false;

// exports.refreshDiscord = async (placeJson) => {
//   if (placeJson == 'none' && latestId != placeJson) {
//     await client.setActivity(undefined);
//     latestId = 'none';
//     console.log('No activity... Meow!')
//     return connected = false;
//   } else if (!connected || latestId != placeJson.id && placeJson != 'none') {
//     console.log('Setting activity... Meow!')
//     data = new Date();
//     await client.setActivity({
//       details: placeJson.name,
//       state: 'by ' + placeJson.owner.split('@')[1],
//       assets: {
//         large_image: placeJson.iconUrl,
//         large_text: placeJson.id,
//         //small_image: "small_image",
//         //small_text: "small_text"
//       },
//       instance: true,
//       timestamps: { start: data }
//     });
//     console.log(`${latestId} != ${placeJson.id}`)
//     latestId = placeJson.id;
//     connected = true;
//   }
//   return { connected: true }
// }

const RPC = require('discord-rpc');
const client = new RPC.Client({ transport: 'ipc' });

let latestId = 'none';
let data = new Date();
let connected = false;

exports.refreshDiscord = async (placeJson) => {
  if (placeJson == 'none' && connected) {
    await client.clearActivity();
    latestId = 'none';
    console.log('No activity... Meow!')
    return connected = false;
  } else if (!connected || (latestId != placeJson.id && placeJson != 'none')) {
    console.log('Setting activity... Meow!')
    data = new Date();
    await client.setActivity({
      details: placeJson.name,
      state: 'by ' + (placeJson.owner.split('@')[1] || placeJson.owner),
      largeImageKey: placeJson.iconUrl,
      largeImageText: placeJson.id,
      //small_image: "small_image",
      //small_text: "small_text"
      //instance: true,
      startTimestamp: data
    });
    console.log(`${latestId} != ${placeJson.id}`)
    latestId = placeJson.id;
    connected = true;
  }
  return { connected: true }
}

client.on('ready', () => {
  console.log('[DRP] Connected! Meow!')
});

client.login({ clientId: "983406322924023860" });