const fetch = require("node-fetch");

async function fetchJSON(url) {
  const responce = await fetch(url);
  const result = await responce.json();

  return result;
}

module.exports = fetchJSON;
