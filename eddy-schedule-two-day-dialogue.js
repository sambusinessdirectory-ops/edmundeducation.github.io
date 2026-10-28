/* Greet a student at the second through sixth Hong Kong learning-day milestones. */
(() => {
  'use strict';

  const twoDayVariants = [
    [{ main: '嘿嘿，今天也見到您啦！', sub: '連續兩天一起冒險，感覺還真不錯呢！明天又會發生什麼有趣的事呢？' }],
    ['咦？今天也來啦！嘿嘿，看來您已經開始喜歡上這裡了嘛！'],
    ['連續兩天都沒缺席呢！', '好！這就算是我們的小小紀念日吧！'],
    ['昨天一起努力，今天也一起出發！', '這種感覺，還挺讓人期待的呢！'],
    ['兩天連續報到！', '嘿嘿，我們還真有默契呢！']
  ];
  const threeDayVariants = [
    [{ main: '哎呀！連續三天都見到您了呢！', sub: '嘿嘿，該不會每天來找 Eddy，已經變成您的習慣了吧？' }],
    ['嗯？昨天也來，今天也來……嘿嘿！看來您真的很喜歡這裡嘛！'],
    ['咦？已經連續三天了嗎！？怎麼感覺才剛認識您，就變得這麼熟啦！'],
    ['一連三天都能見到您，感覺真不錯！嘿嘿，Eddy 都開始期待每天的見面了呢！'],
    ['嘿嘿，三天都沒缺席！看來 Eddy 的魅力還真不小呢！'],
    ['第一天是巧合，第二天是緣分……第三天嘛，嘿嘿！這下可算是老朋友了吧！'],
    ['三天連續報到！嘿嘿，我們還真有默契呢！']
  ];
  const fourDayVariants = [
    ['哎呀，已經四天都來報到啦！這顆愛心，是 Eddy 給您的獎勵喔！♡'],
    ['連續四天都沒缺席呢！嘿嘿，Eddy 要送您一個愛心～♡'],
    ['第四天也來了呢！能天天見到您，Eddy 很開心喔！♡'],
    ['哼哼，連續四天都來找 Eddy 呢！那就送您一個愛心吧！♡'],
    ['四天連續報到！這顆愛心送給您♡']
  ];
  const fiveDayVariants = [
    [{ main: '鏘鏘！這是 Eddy 特地為你準備的喔！', sub: '嘿嘿，連續五天都來找我，當然要送你一點甜甜的獎勵啦！快打開看看吧！' }],
    ['那、那個……這盒巧克力是送你的！畢竟都連續見面五天了嘛……嘿嘿，收下吧！'],
    ['嘿嘿，猜猜 Eddy 藏了什麼好東西？提示是……甜甜的，而且一口就能讓人心情變好！'],
    ['連續五天都來報到啦！這盒巧克力就送給你吧！……不過，分 Eddy 一顆也可以喔？'],
    ['不知不覺，已經連續五天見面了呢！能每天和你一起度過，Eddy 真的很開心。這是給你的小禮物！'],
    ['這盒巧克力可是 Eddy 精挑細選的喔！本來想先試吃一顆……結果差點就停不下來啦！'],
    ['五天的小小紀念禮！嘿嘿，這盒巧克力就送給你啦！']
  ];
  const sixDayVariants = [
    [{ main: '哼哼～連續六天都來見我了呢！', sub: '看來今天得帥氣一點才行！怎麼樣？Eddy 這個造型是不是很迷人啊？🌹' }],
    ['呵呵，連續六天就讓你見識一下 Eddy 帥氣的一面吧！……咦？你怎麼笑出來了啦！'],
    ['鏘鏘！第六天的特別驚喜！這朵玫瑰，就獻給最特別的你吧！'],
    ['那個……今天第六天想換個方式跟你打招呼！這、這朵玫瑰送你啦！別一直盯著 Eddy 看嘛！'],
    ['六天連續報到！這朵玫瑰，就讓 Eddy 帥氣地送給你吧！'],
    ['連續六天都來冒險的你，當然值得這朵玫瑰啦！', '唔唔！唔唔唔！……啊，差點忘了嘴裡還咬著玫瑰！']
  ];
  const milestones = {
    2: { variants: twoDayVariants, image: 'eddy-schedule-two-day-dialogue.png' },
    3: { variants: threeDayVariants, image: 'eddy-schedule-three-day-dialogue.png' },
    4: { variants: fourDayVariants, image: 'eddy-schedule-four-day-dialogue.png' },
    5: { variants: fiveDayVariants, image: 'eddy-schedule-five-day-dialogue.png' },
    6: { variants: sixDayVariants, image: 'eddy-schedule-six-day-dialogue.png' }
  };
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
    const { streak } = pending;
    const milestone = milestones[streak];
    const key = `${storagePrefix}${streak === 2 ? '' : `${streak}:`}${pending.studentId}:${pending.date}`;
    pending = null;
    if (shown.has(key) || stored(key)) return;

    pages = milestone.variants[Math.floor(Math.random() * milestone.variants.length)];
    pageIndex = 0;
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay eddy-schedule-two-day-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `Eddy 的連續${streak}天學習提示`);
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button"><span class="eddy-first-question-art"><img src="${milestone.image}" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-first-question-message--schedule-two-day" lang="zh-Hant"></span></span></button>`;
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
    if (!milestones[streak] || latestDay !== date) return;
    pending = { studentId, date, streak };
    requestAnimationFrame(showIfReady);
  });
  document.addEventListener('edmund:eddy-global-dialogue-finished', showIfReady);
  document.addEventListener('visibilitychange', showIfReady);
  document.addEventListener('close', showIfReady, true);
  new MutationObserver(showIfReady).observe(document.body, { childList: true });
})();
