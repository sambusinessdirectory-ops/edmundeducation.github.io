(() => {
  const button = document.querySelector('[data-homework-campfire-toggle]');
  if (!button) return;
  const image = button.querySelector('img');
  const gif = 'homework-eddy/eddy-campfire.gif?v=20261028-camp1';
  const stills = Array.from({ length: 5 }, (_, index) =>
    `homework-eddy/stills/eddy-${String(index + 1).padStart(2, '0')}.png?v=20261028-camp1`
  );
  const key = 'edmund-homework-eddy-playing';
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previousStill = -1;
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) playing = saved === 'true';
  } catch { /* Storage is optional. */ }

  function chooseStill() {
    const choices = stills.map((_, index) => index).filter(index => index !== previousStill);
    previousStill = choices[Math.floor(Math.random() * choices.length)];
    return stills[previousStill];
  }

  function render() {
    button.dataset.playing = String(playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? '暫停 Eddie 營火動畫' : '繼續 Eddie 營火動畫');
    button.title = playing ? '點擊暫停 Eddie 營火動畫' : '點擊繼續 Eddie 營火動畫';
    image.src = playing ? gif : chooseStill();
  }

  button.addEventListener('click', () => {
    playing = !playing;
    try { localStorage.setItem(key, String(playing)); } catch { /* Button remains usable. */ }
    render();
  });
  render();
})();
