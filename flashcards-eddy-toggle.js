(() => {
  const buttons = [...document.querySelectorAll('[data-eddy-flashcards-toggle]')];
  if (!buttons.length) return;

  const gif = 'flashcards-eddy/eddy-flashcards.gif?v=20261022-1';
  const stills = Array.from({ length: 7 }, (_, index) =>
    `flashcards-eddy/stills/eddy-${String(index + 1).padStart(2, '0')}.png?v=20261022-1`
  );
  const key = 'edmund-flashcards-eddy-playing';
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastStill = -1;
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) playing = saved === 'true';
  } catch { /* Optional preference. */ }

  function chooseStill() {
    const choices = stills.map((_, i) => i).filter(i => i !== lastStill);
    lastStill = choices[Math.floor(Math.random() * choices.length)];
    return stills[lastStill];
  }

  function render() {
    const still = chooseStill();
    for (const button of buttons) {
      button.dataset.playing = String(playing);
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', playing ? '暫停 Eddy 翻卡動畫' : '繼續 Eddy 翻卡動畫');
      button.title = playing ? '點擊暫停 Eddy 翻卡動畫' : '點擊繼續 Eddy 翻卡動畫';
      button.querySelector('img').src = playing ? gif : still;
    }
  }

  for (const button of buttons) button.addEventListener('click', () => {
    playing = !playing;
    try { localStorage.setItem(key, String(playing)); } catch { /* Button remains usable. */ }
    render();
  });
  render();
})();
