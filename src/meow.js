window.addEventListener('DOMContentLoaded', () => {
  let timer = 1;
  let latestId = 'none';
  async function tick() {
    timer -= 1;
    text2.innerText = `Updates in ${timer} sec`;
    if (timer < 1) {
      timer = 21;
      const place = await window.api.refresh(true, latestId);
      if (place.meow) return console.log('Meow! Id\'s were the same so no changes was made!')
      if (!place.connected) {
        text0.innerText = 'Connected: no';
        text1.innerText = 'Game: offline';
        icon.setAttribute('style', 'display:none');
        return latestId = 'disconnected';
      }
      text0.innerText = 'Connected: yes';
      text1.innerText = `Game: "${place.name}" (${place.id})\nby ${place.owner}`;
      latestId = place.id;
      icon.setAttribute('src', place.iconUrl);
      icon.removeAttribute('style')
    }
  }
  tick()
  setInterval(async () => {
    tick()
  }, 1000)
})