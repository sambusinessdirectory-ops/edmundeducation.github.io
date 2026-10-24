/* Sitewide Eddy moments: Hong Kong afternoon tea and Pomodoro breaks. */
(() => {
  'use strict';

  const teaLines = [
    ['哎呀，差不多該喝下午茶了呢！', '香噴噴的紅茶，配上甜滋滋的點心……嘿嘿，這才是享受人生嘛！'],
    ['忙碌了一整天，偶爾也得優雅一下嘛！', '來，今天就一起享受英式下午茶吧！'],
    ['下午茶時間到囉！', ''],
    ['午後的陽光暖洋洋的，再來杯熱騰騰的紅茶……', '嗯～真希望時間能過得慢一點呢！']
  ];
  const tomatoLines = [
    ['嗯～休息時間的番茄真好吃！', '（咦？番茄工作法不是這樣用的嗎？）'],
    ['工作要專心，休息要開心！', '至於番茄嘛……當然要吃進肚子裡啦！'],
    ['啊嗚！這顆番茄真甜！', '……咦？您說番茄工作法不是拿來吃的？'],
    ['番茄時間到！', '……等等，原來不是吃番茄的時間嗎？'],
    ['嘿嘿，認真工作完，當然要來顆番茄犒賞自己啦！', '這就是所謂的番茄工作法吧？'],
    ['呼～終於能休息啦！', '先來顆番茄補充元氣！啊嗚！']
  ];
  const teaStorageKey = 'edmund-eddy-afternoon-tea-day-v1';
  const breakStoragePrefix = 'edmund-eddy-pomodoro-break-v1:';
  const queue = [];
  const queuedBreaks = new Set();
  let active = null;
  let overlay = null;
  let previousFocus = null;
  let shownTeaDay = '';
  let audioContext = null;



  function hongKongNow() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return { day: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour) };
  }

  function stored(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function remember(key, value) {
    try { localStorage.setItem(key, value); } catch { /* This page still deduplicates in memory. */ }
  }
  function pick(lines) { return lines[Math.floor(Math.random() * lines.length)]; }

  function playDialogueSound() {
    try {
      if (stored('edmund-answer-sounds-v1') === 'off') return;
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audioContext ??= new Audio();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      for (const [pitch, delay, duration, volume] of [[783.99, 0, .1, .03], [1046.5, .075, .16, .025]]) {
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(volume, now + delay + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, now + delay + duration);
        gain.connect(audioContext.destination);
        const tone = audioContext.createOscillator();
        tone.type = 'triangle';
        tone.frequency.setValueAtTime(pitch, now + delay);
        tone.connect(gain);
        tone.start(now + delay);
        tone.stop(now + delay + duration + .03);
      }
    } catch { /* Sound is optional. */ }
  }

  function isBlocking() {
    return Boolean(active || document.documentElement.classList.contains('edmund-pomodoro-page-locked'));
  }

  function dismiss() {
    if (!active) return;
    overlay?.remove();
    overlay = null;
    active = null;
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected && !previousFocus.inert) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
    playDialogueSound();
    showNext();
    if (!active && !queue.length && !isBlocking()) document.dispatchEvent(new Event('edmund:eddy-global-dialogue-finished'));
  }

  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    dismiss();
  }

  function showNext() {
    if (active || !document.body || document.hidden || document.querySelector('dialog[open]')) return;
    while (queue.length) {
      const next = queue.shift();
      if (next.kind === 'tea') {
        const now = hongKongNow();
        if (now.hour !== 15 || now.day !== next.day || shownTeaDay === now.day || stored(teaStorageKey) === now.day) continue;
        shownTeaDay = now.day;
        remember(teaStorageKey, now.day);
      } else if (Date.now() >= next.endsAt || stored(breakStoragePrefix + next.owner) === String(next.endsAt)) {
        continue;
      } else {
        remember(breakStoragePrefix + next.owner, String(next.endsAt));
      }
      active = next;
      previousFocus = document.activeElement;
      const [main, sub] = pick(next.kind === 'tea' ? teaLines : tomatoLines);
      overlay = document.createElement('div');
      overlay.className = 'eddy-global-overlay';
      overlay.dataset.eddyGlobalDialogue = '';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', next.kind === 'tea' ? 'Eddy 的下午茶時間' : 'Eddy 的番茄鐘休息時間');
      overlay.innerHTML = `<button type="button"><span class="eddy-global-art"><img alt="" aria-hidden="true"><span class="eddy-global-copy" lang="zh-Hant"><strong></strong><span></span></span></span></button>`;
      overlay.querySelector('img').src = next.kind === 'tea' ? '/eddy-afternoon-tea-dialogue.png' : '/eddy-pomodoro-tomato-dialogue.png';
      overlay.querySelector('strong').textContent = main;
      overlay.querySelector('.eddy-global-copy span').textContent = sub;
      overlay.querySelector('.eddy-global-copy span').hidden = !sub;
      overlay.querySelector('button').setAttribute('aria-label', `${main} ${sub} 點擊、輕觸或按鍵繼續`);
      overlay.addEventListener('click', dismiss);
      document.body.append(overlay);
      overlay.querySelector('button').focus({ preventScroll: true });
      document.addEventListener('keydown', onKey, true);
      return;
    }
  }

  function checkTea() {
    if (document.hidden) return;
    const { day, hour } = hongKongNow();
    if (hour !== 15 || shownTeaDay === day || stored(teaStorageKey) === day || queue.some((item) => item.kind === 'tea' && item.day === day)) return;
    queue.unshift({ kind: 'tea', day });
    showNext();
  }

  function queuePomodoroBreak(owner, endsAt) {
    const id = `${owner}:${endsAt}`;
    if (!owner || !Number.isFinite(endsAt) || endsAt <= Date.now() || queuedBreaks.has(id) || stored(breakStoragePrefix + owner) === String(endsAt)) return;
    checkTea();
    queuedBreaks.add(id);
    queue.push({ kind: 'tomato', owner, endsAt });
    showNext();
  }

  window.EdmundEddyGlobalDialogue = Object.freeze({ isBlocking, isShowing: () => Boolean(active), queuePomodoroBreak, checkTea });
  if (document.body) checkTea();
  else document.addEventListener('DOMContentLoaded', checkTea, { once: true });
  document.addEventListener('visibilitychange', checkTea);
  document.addEventListener('close', showNext, true);
  window.addEventListener('focus', checkTea);
  window.setInterval(checkTea, 30000);
})();
