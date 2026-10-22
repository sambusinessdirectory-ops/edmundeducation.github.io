(() => {
  const button = document.querySelector('[data-elsie-listening-toggle]');
  if (!button) return;

  const image = button.querySelector('img');
  const reducedMotionSource = button.querySelector('source[media="(prefers-reduced-motion: reduce)"]');
  const gifSrc = image.getAttribute('src');
  const stillSources = Array.from({ length: 7 }, (_, index) =>
    `listening-elsie/stills/elsie-${String(index + 1).padStart(2, '0')}.png?v=20261022-listening2`
  );
  const storageKey = 'edmund-listening-elsie-playing';
  let playing = true;
  let lastStillIndex = -1;
  let lastPausedStillIndex = -1;
  try { playing = localStorage.getItem(storageKey) !== 'false'; } catch { /* Optional preference. */ }

  const chooseStill = () => {
    const choices = stillSources.map((_, index) => index).filter((index) =>
      index !== lastStillIndex && (playing || index !== lastPausedStillIndex)
    );
    lastStillIndex = choices[Math.floor(Math.random() * choices.length)];
    if (!playing) lastPausedStillIndex = lastStillIndex;
    return stillSources[lastStillIndex];
  };

  const render = () => {
    const stillSrc = chooseStill();
    button.dataset.playing = String(playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? '暫停 Elsie 聆聽動畫' : '繼續 Elsie 聆聽動畫');
    button.title = playing ? '點擊暫停 Elsie 聆聽動畫' : '點擊繼續 Elsie 聆聽動畫';
    reducedMotionSource?.setAttribute('srcset', stillSrc);
    image.setAttribute('src', playing ? gifSrc : stillSrc);
    image.alt = playing
      ? 'Elsie 在粉紅色書房戴著耳機，一邊聽平板錄音一邊在筆記簿上寫字'
      : 'Elsie 暫停聆聽動畫，仍在筆記簿前';
  };

  button.addEventListener('click', () => {
    playing = !playing;
    try { localStorage.setItem(storageKey, String(playing)); } catch { /* Button remains usable. */ }
    render();
  });

  const preloadStills = () => stillSources.forEach((src) => { const still = new Image(); still.src = src; });
  if ('requestIdleCallback' in window) window.requestIdleCallback(preloadStills);
  else window.setTimeout(preloadStills, 2000);
  render();
})();
