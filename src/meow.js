window.addEventListener('DOMContentLoaded', () => {
  let setTimer;
  let timer = 1;
  let latestId = 'none';
  async function tick() {
    timer -= 1;
    text2.innerText = `Updates in ${timer} sec`;
    if (timer < 1) {
      clearInterval(setTimer);
      text2.innerText = 'Updating...';
      const place = await window.api.refresh(true, latestId);
      if (place.meow) return console.log('Meow! Id\'s were the same so no changes was made!');
      text0.innerText = 'Connected: ' + place.connected;
      if (!place.id || place.id == 'none' || !place.name || !place.owner) {
        text1.innerText = "Game: none";
        icon.setAttribute('style', 'display:none');
        latestId = 'disconnected';
      } else {
        text1.innerText = `Game: "${place.name}" (${place.id})\nby ${place.owner}`;
        icon.setAttribute('src', place.iconUrl);
        icon.removeAttribute('style');
        latestId = place.id;
      }
      timer = 11;
      setTimer = setInterval(() => {
        tick()
      }, 1005)
    }
  }
  tick()
})