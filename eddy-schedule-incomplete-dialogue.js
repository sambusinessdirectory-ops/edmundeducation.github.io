/* Greet a student once after two Hong Kong days with assigned, unfinished homework. */
(() => {
  'use strict';

  const variants = [
    [{ main: '唉……已經兩天沒完成任務了呢……', sub: 'Eddy 還以為能一起大展身手的說……唔，今天會不會有機會呢？' }],
    ['唔……任務清單已經兩天沒動靜了……明明還有好多事想一起完成的說……'],
    ['哼……這兩天都沒機會一起解任務呢……Eddy 可是期待了好久的說……'],
    ['唉……這兩天好像都沒什麼進展呢。不過，偶爾也會有這樣的日子吧……'],
    ['唔～這兩天一個任務都沒完成呢……好啦，沒關係！下次再一起努力吧！'],
    ['唉唷……Eddy 都快忘記完成任務是什麼感覺了啦……'],
    ['唔……兩天都沒完成任務了……有點不甘心呢。']
  ];
  const threeDayVariants = [
    { main: '你看看你！都三天沒做任務了！', sub: 'Eddy 不是要唸你啦……可是事情放著不做，也不會自己完成啊！來，今天先做一件就好！' },
    '唉唷！三天了耶！整整三天！你說說看，這些任務是打算留到過年才做嗎？',
    '來來來，你自己看看！三天一個任務都沒動！這樣下去怎麼行呢？嗯？',
    'Eddy 不是生氣，是擔心你啊！你看看，三天都沒做任務了！這樣要怎麼進步呢？',
    '你看看隔壁的冒險家……啊，算了算了！不跟別人比！先把自己的任務做好就行！',
    '唉～～三天了，任務清單連一筆都沒劃掉……Eddy 這顆心啊，真是操不完！',
    '三天沒做任務啦！你說說看，這樣像話嗎？嗯？'
  ];
  const storagePrefix = 'edmund-eddy-schedule-incomplete-two-days-v1:';
  const shown = new Set();
  let pending = null;
  let overlay = null;
  let learningSummaryReceived = false;
  let fallbackTimer = null;
  let previousFocus = null;

  function stored(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function remember(key) {
    shown.add(key);
    try { localStorage.setItem(key, 'shown'); } catch { /* Keep this page deduplicated. */ }
  }
  function hongKongToday() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }
  function sessionStudentId() {
    try {
      const session = JSON.parse(sessionStorage.getItem('edmund-schedule-session-v1') || 'null');
      return session?.role === 'student' ? String(session.id) : null;
    } catch { return null; }
  }
  function finish() {
    overlay?.remove();
    overlay = null;
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected && !previousFocus.inert) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  }
  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    finish();
  }
  function showIfReady() {
    if (!pending || overlay || document.hidden || !learningSummaryReceived
      || window.EdmundEddyGlobalDialogue?.isBlocking()) return;
    if (pending.date !== hongKongToday() || sessionStudentId() !== pending.studentId) {
      pending = null;
      return;
    }
    const calendar = document.querySelector('[data-view="calendar"]');
    if (!calendar || calendar.hidden || document.querySelector('dialog[open], .eddy-first-question-overlay')) return;
    const days = pending.days === 3 ? 3 : 2;
    const key = `${days === 3 ? 'edmund-eddy-schedule-incomplete-three-days-v1:' : storagePrefix}${pending.studentId}:${pending.date}`;
    pending = null;
    if (shown.has(key) || stored(key)) return;
    const pool = days === 3 ? threeDayVariants : variants;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const copy = days === 3 ? picked : picked[0];
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay eddy-schedule-incomplete-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `Eddy 的${days === 3 ? '三' : '兩'}天未完成功課提醒`);
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button"><span class="eddy-first-question-art"><img src="${days === 3 ? 'eddy-schedule-three-day-incomplete-dialogue.png' : 'eddy-schedule-two-day-incomplete-dialogue.png'}" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-first-question-message--schedule-two-day" lang="zh-Hant"></span></span></button>`;
    const message = overlay.querySelector('.eddy-first-question-message');
    if (typeof copy === 'string') message.textContent = copy;
    else {
      message.classList.add('eddy-first-question-message--schedule-two-day-headline');
      const headline = document.createElement('strong');
      const detail = document.createElement('span');
      headline.textContent = copy.main;
      detail.textContent = copy.sub;
      message.replaceChildren(headline, detail);
    }
    overlay.querySelector('button').setAttribute('aria-label', `${typeof copy === 'string' ? copy : `${copy.main} ${copy.sub}`} 點擊、輕觸或按鍵關閉`);
    overlay.addEventListener('click', finish);
    document.body.append(overlay);
    remember(key);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }
  document.addEventListener('edmund:schedule-two-day-incomplete-homework', (event) => {
    const { studentId, date, days } = event.detail || {};
    if (typeof studentId !== 'string' || !studentId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    pending = { studentId, date, days: days === 3 ? 3 : 2 };
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => { learningSummaryReceived = true; showIfReady(); }, 5000);
    requestAnimationFrame(showIfReady);
  });
  document.addEventListener('edmund:schedule-learning-day-summary', () => {
    learningSummaryReceived = true;
    requestAnimationFrame(showIfReady);
  });
  document.addEventListener('edmund:eddy-global-dialogue-finished', showIfReady);
  document.addEventListener('visibilitychange', showIfReady);
  document.addEventListener('close', showIfReady, true);
  new MutationObserver(showIfReady).observe(document.body, { childList: true });
})();
