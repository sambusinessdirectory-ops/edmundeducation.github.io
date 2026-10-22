(() => {
  const button = document.querySelector('[data-noir-polysemy-toggle]');
  if (!button) return;
  const image = button.querySelector('img');
  const gif = 'polysemy-noir/noir-polysemy.gif?v=20261022-2';
  const stills = Array.from({ length: 5 }, (_, index) =>
    `polysemy-noir/stills/noir-${String(index + 1).padStart(2, '0')}.png?v=20261022-2`
  );
  const storageKey = 'edmund-polysemy-noir-playing';
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previousStill = -1;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) playing = saved === 'true';
  } catch { /* Playback remains usable when storage is unavailable. */ }

  function chooseStill() {
    const choices = stills.map((_, index) => index).filter(index => index !== previousStill);
    previousStill = choices[Math.floor(Math.random() * choices.length)];
    return stills[previousStill];
  }

  function render() {
    button.dataset.playing = String(playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? '暫停 Noir 一詞多義動畫' : '繼續 Noir 一詞多義動畫');
    button.title = playing ? '點擊暫停 Noir 動畫' : '點擊繼續 Noir 動畫';
    image.src = playing ? gif : chooseStill();
  }

  button.addEventListener('click', () => {
    playing = !playing;
    try { localStorage.setItem(storageKey, String(playing)); } catch { /* Optional. */ }
    render();
  });
  render();
})();
