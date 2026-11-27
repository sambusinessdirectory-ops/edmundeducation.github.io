(() => {
  'use strict';

  const music = new Audio('/assets/sfx/homepage-morning-music.mp3');
  const targetVolume = 0.32;
  const fadeDuration = 2000;
  let dialoguesFinished = false;
  let fadeFrame = 0;

  music.loop = true;
  music.preload = 'auto';
  music.volume = 0;

  function hongKongHour() {
    return Number(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Hong_Kong', hour: '2-digit', hourCycle: 'h23'
    }).format(new Date()));
  }

  function soundsEnabled() {
    try { return localStorage.getItem('edmund-answer-sounds-v1') !== 'off'; } catch { return true; }
  }

  function morningIsActive() {
    const hour = hongKongHour();
    return hour >= 8 && hour < 12;
  }

  function dialogueIsOpen() {
    return Boolean(document.querySelector('[data-eddy-global-dialogue], .eddy-first-question-overlay, dialog[open]'));
  }

  function fadeTo(volume, then) {
    cancelAnimationFrame(fadeFrame);
    const from = music.volume;
    const started = performance.now();
    const step = now => {
      const progress = Math.min(1, (now - started) / fadeDuration);
      music.volume = from + (volume - from) * progress;
      if (progress < 1) fadeFrame = requestAnimationFrame(step);
      else then?.();
    };
    fadeFrame = requestAnimationFrame(step);
  }

  function start() {
    if (!dialoguesFinished || !morningIsActive() || !soundsEnabled() || document.hidden
      || document.body.classList.contains('is-homepage-loading')
      || dialogueIsOpen() || window.EdmundEddyGlobalDialogue?.isBlocking()) return;
    music.play().then(() => fadeTo(targetVolume)).catch(() => {});
  }

  function stop() {
    if (music.paused) return;
    fadeTo(0, () => music.pause());
  }

  function update() {
    if (dialoguesFinished && morningIsActive() && soundsEnabled() && !document.hidden
      && !dialogueIsOpen() && !window.EdmundEddyGlobalDialogue?.isBlocking()) start();
    else stop();
  }

  document.addEventListener('edmund:eddy-global-dialogue-finished', () => {
    dialoguesFinished = true;
    update();
  });
  document.addEventListener('visibilitychange', update);
  for (const type of ['pointerdown', 'keydown']) document.addEventListener(type, start, { capture: true });
  window.addEventListener('storage', update);
  new MutationObserver(update).observe(document.body, { childList: true, subtree: true });
  window.setInterval(update, 15000);
})();
