/* Greet a student when the established Hong Kong learning-day streak reaches two. */
(() => {
  'use strict';

  const variants = [
    [{ main: '嘿嘿，今天也見到您啦！', sub: '連續兩天一起冒險，感覺還真不錯呢！明天又會發生什麼有趣的事呢？' }],
    ['咦？今天也來啦！嘿嘿，看來您已經開始喜歡上這裡了嘛！'],
    ['連續兩天都沒缺席呢！', '好！這就算是我們的小小紀念日吧！'],
    ['昨天一起努力，今天也一起出發！', '這種感覺，還挺讓人期待的呢！'],
    ['兩天連續報到！', '嘿嘿，我們還真有默契呢！']
  ];
  const storagePrefix = 'edmund-eddy-schedule-two-day-v1:';
  const shown = new Set();
  let pending = null;
  let overlay = null;
  let pages = [];
  let pageIndex = 0;
  let previousFocus = null;
  let audioContext = null;

  function stored(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function remember(key) {
    shown.add(key);
    try { localStorage.setItem(key, 'shown'); } catch { /* Deduplicate in this page when storage is unavailable. */ }
  }

  function hongKongToday() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

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
    } catch { /* Sound is optional when the browser blocks playback. */ }
  }

  function renderPage() {
    const copy = pages[pageIndex];
    const message = overlay.querySelector('.eddy-first-question-message');
    message.classList.toggle('eddy-first-question-message--schedule-two-day-headline', typeof copy !== 'string');
    if (typeof copy === 'string') message.textContent = copy;
    else {
      const headline = document.createElement('strong');
      const detail = document.createElement('span');
      headline.textContent = copy.main;
      detail.textContent = copy.sub;
      message.replaceChildren(headline, detail);
    }
    const spokenCopy = typeof copy === 'string' ? copy : `${copy.main} ${copy.sub}`;
    overlay.querySelector('button').setAttribute('aria-label', `${spokenCopy} 點擊、輕觸或按鍵繼續`);
  }

  function finish() {
    overlay?.remove();
    overlay = null;
    pages = [];
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected && !previousFocus.inert) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  }

  function advance() {
    if (!overlay) return;
    if (pageIndex >= pages.length - 1) return finish();
    pageIndex += 1;
    playDialogueSound();
    renderPage();
  }

  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.key === 'Escape') finish();
    else advance();
  }

  function showIfReady() {
    if (!pending || overlay || document.hidden || window.EdmundEddyGlobalDialogue?.isBlocking()) return;
    if (pending.date !== hongKongToday()) {
      pending = null;
      return;
    }
    let session;
    try { session = JSON.parse(sessionStorage.getItem('edmund-schedule-session-v1') || 'null'); } catch { session = null; }
    if (session?.role !== 'student' || String(session.id) !== pending.studentId) {
      pending = null;
      return;
    }
    if (document.querySelector('dialog[open], .eddy-first-question-overlay')) return;
    const calendar = document.querySelector('[data-view="calendar"]');
    if (!calendar || calendar.hidden) return;
    const key = `${storagePrefix}${pending.studentId}:${pending.date}`;
    pending = null;
    if (shown.has(key) || stored(key)) return;

    pages = variants[Math.floor(Math.random() * variants.length)];
    pageIndex = 0;
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay eddy-schedule-two-day-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 的連續兩天學習提示');
    overlay.innerHTML = '<button class="eddy-first-question-dismiss" type="button"><span class="eddy-first-question-art"><img src="eddy-schedule-two-day-dialogue.png" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-first-question-message--schedule-two-day" lang="zh-Hant"></span></span></button>';
    overlay.addEventListener('click', advance);
    document.body.append(overlay);
    renderPage();
    remember(key);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }

  document.addEventListener('edmund:schedule-learning-day-summary', (event) => {
    const { studentId, date, streak, latestDay } = event.detail || {};
    if (typeof studentId !== 'string' || !studentId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    if (streak !== 2 || latestDay !== date) return;
    pending = { studentId, date };
    requestAnimationFrame(showIfReady);
  });
  document.addEventListener('edmund:eddy-global-dialogue-finished', showIfReady);
  document.addEventListener('visibilitychange', showIfReady);
  document.addEventListener('close', showIfReady, true);
  new MutationObserver(showIfReady).observe(document.body, { childList: true });
})();
