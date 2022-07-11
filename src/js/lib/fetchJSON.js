const fetch = require("node-fetch");

async function fetchJSON(url) {
  const responce = await fetch(url);

  return await responce.json();
}

module.exports = fetchJSON;
