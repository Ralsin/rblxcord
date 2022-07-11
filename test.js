const { Client } = require("discord-rpc");

require("dotenv").config();

// class RblxcordCon {
//   clientId;
//   client;
//   isReady = false;
//   constructor(clientId) {
//     this.clientId = clientId;
//   }
//   async create() {
//     this.client = new Client({ transport: 'ipc' });
//     this.client.once('ready', () => {
//       console.log('[DRP] Connected! Meow!');
//       this.isReady = true;
//     });
//     await this.client.login({ clientId: this.clientId }).catch(() => { this.destroy(); setTimeout(() => { Rblxcord = new RblxcordCon('983406322924023860'); }, 10e3) });
//   }
//   setActivity(activity) {
//     if (!this.isReady) return false;
//     this.client.setActivity(activity);
//     return true;
//   }
//   clearActivity() {
//     this.client.clearActivity()
//   }
//   destroy() {
//     try {
//       if (this.isReady) {
//         this.client.clearActivity();
//         this.client.destroy();
//       }
//       console.log('boom!');
//     } catch (e) { }
//   }
// }
// let Rblxcord = new RblxcordCon('983406322924023860').create();
const client = new Client({ transport: "ipc" });
//! Token steal vulnerability!
client.login({ clientId: process.env.clientId }).catch(console.log);
