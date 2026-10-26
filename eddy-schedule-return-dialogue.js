/* Welcome a student back after at least one complete Hong Kong calendar day away. */
(() => {
  'use strict';

  const opening = [
    { main: '哎呀！原來您在這裡啊！', sub: '已經有 {days} 天沒見到您了呢！最近都跑去哪裡冒險啦？' },
    '哼哼，消失了 {days} 天，終於捨得回來啦？',
    '這 {days} 天都沒見到您，Eddy 差點就要組成搜查隊了！\n……隊員只有我一個就是了',
    '哎呀，好久不見！這 {days} 天跑去哪裡玩啦？'
  ];
  const welcome = [
    '開玩笑的！見到您真開心！',
    '歡迎回來！能再次見到您，真是太好了！',
    'Eddy 正好有好多有趣的事想跟您分享呢！',
    '終於等到您啦！歡迎回來！'
  ];
  const onward = [
    '今天也一起大展身手吧！',
    'Eddy 今天可是幹勁滿滿喔！您也準備好大顯身手了嗎？',
    '今天也有好多事情等著我們呢！不用著急，一件一件慢慢來吧！',
    '好！打起精神來！今天也要和您一起努力，讓每件事都順順利利！',
    '伸個懶腰，活動一下筋骨！好啦，今天也要開始努力囉！',
    '準備好了嗎？今天也一起加把勁吧！'
  ];
  const storagePrefix = 'edmund-eddy-schedule-return-v1:';
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
    try { localStorage.setItem(key, 'shown'); } catch { /* In-page deduplication remains available. */ }
  }

  function hongKongToday() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function randomIndex(length) {
    return Math.floor(Math.random() * length);
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
    const page = pages[pageIndex];
    const message = overlay.querySelector('.eddy-first-question-message');
    overlay.querySelector('img').src = `eddy-schedule-return-${pageIndex + 1}.png`;
    message.classList.toggle('eddy-schedule-return-headline', typeof page !== 'string');
    if (typeof page === 'string') message.textContent = page;
    else {
      const headline = document.createElement('strong');
      const detail = document.createElement('span');
      headline.textContent = page.main;
      detail.textContent = page.sub;
      message.replaceChildren(headline, detail);
    }
    const spokenCopy = typeof page === 'string' ? page : `${page.main} ${page.sub}`;
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
    const days = pending.gapDays;
    pending = null;
    if (shown.has(key) || stored(key)) return;

    const openingIndex = randomIndex(opening.length);
    const first = opening[openingIndex];
    const second = openingIndex === 1 ? welcome[0] : welcome[1 + randomIndex(welcome.length - 1)];
    pages = [typeof first === 'string'
      ? first.replaceAll('{days}', String(days))
      : { main: first.main, sub: first.sub.replaceAll('{days}', String(days)) },
      second, onward[randomIndex(onward.length)]];
    pageIndex = 0;
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay eddy-schedule-return-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 歡迎您回來');
    overlay.innerHTML = '<button class="eddy-first-question-dismiss" type="button"><span class="eddy-first-question-art"><img src="eddy-schedule-return-1.png" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-schedule-return-message" lang="zh-Hant"></span></span></button>';
    overlay.addEventListener('click', advance);
    document.body.append(overlay);
    renderPage();
    remember(key);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }

  document.addEventListener('edmund:schedule-student-return-gap', (event) => {
    const { studentId, date, gapDays } = event.detail || {};
    if (typeof studentId !== 'string' || !studentId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    if (!Number.isInteger(gapDays) || gapDays < 2) return;
    pending = { studentId, date, gapDays };
    requestAnimationFrame(showIfReady);
  });
  document.addEventListener('edmund:eddy-global-dialogue-finished', showIfReady);
  document.addEventListener('visibilitychange', showIfReady);
  document.addEventListener('close', showIfReady, true);
  new MutationObserver(showIfReady).observe(document.body, { childList: true });
})();
