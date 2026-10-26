/* Sitewide Eddy moments: Hong Kong weekends, afternoon tea and Pomodoro breaks. */
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
  const saturdayLines = [
    ['呼啊～終於到星期六啦！', '今天就別把行程排得太滿，悠哉悠哉地過一天吧！'],
    ['星期六的早晨，連空氣都感覺特別舒服呢！今天想做點什麼好呢？', ''],
    ['嘿嘿，今天可是星期六耶！偶爾什麼都不做，也是一種享受嘛！', ''],
    ['好耶！星期六到了！今天就隨心所欲，看看會遇上什麼有趣的事吧！', ''],
    ['今天的計畫？嗯……先發個呆，再想想要做什麼！完美！', ''],
    ['星期六就該悠閒一點嘛！今天也慢慢來吧！', '']
  ];
  const sundayLines = [
    ['今天可是星期天呢！要不要試試平常沒做過的事？搞不好會有意想不到的收穫喔！', ''],
    ['嗯～今天要做什麼好呢？畫畫？烘焙？還是學點新花樣？光用想的就覺得有趣！', ''],
    ['嘿嘿，Eddy 最近想培養一個新興趣！不過嘛……現在還在煩惱要選哪個呢！', ''],
    ['難得的星期天，何不做點自己感興趣的事呢？不用太擅長，玩得開心最重要！', ''],
    ['說不定您還有連自己都不知道的拿手絕活呢！今天就來找找看吧！', ''],
    ['星期天就是探索新興趣的好日子！今天想試試什麼呢？', '']
  ];
  const teaStorageKey = 'edmund-eddy-afternoon-tea-day-v1';
  const weekendStorageKey = 'edmund-eddy-weekend-day-v1';
  const breakStoragePrefix = 'edmund-eddy-pomodoro-break-v1:';
  const queue = [];
  const queuedBreaks = new Set();
  let active = null;
  let overlay = null;
  let previousFocus = null;
  let shownTeaDay = '';
  let shownWeekendDay = '';
  let audioContext = null;



  function hongKongNow() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'long'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return { day: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour), weekday: values.weekday };
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
      } else if (next.kind === 'weekend') {
        const now = hongKongNow();
        if (now.day !== next.day || now.weekday !== next.weekday || shownWeekendDay === now.day || stored(weekendStorageKey) === now.day) continue;
        shownWeekendDay = now.day;
        remember(weekendStorageKey, now.day);
      } else if (Date.now() >= next.endsAt || stored(breakStoragePrefix + next.owner) === String(next.endsAt)) {
        continue;
      } else {
        remember(breakStoragePrefix + next.owner, String(next.endsAt));
      }
      active = next;
      previousFocus = document.activeElement;
      const lines = next.kind === 'tea' ? teaLines : next.kind === 'weekend'
        ? (next.weekday === 'Saturday' ? saturdayLines : sundayLines) : tomatoLines;
      const [main, sub] = pick(lines);
      overlay = document.createElement('div');
      overlay.className = 'eddy-global-overlay';
      overlay.dataset.eddyGlobalDialogue = '';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', next.kind === 'tea' ? 'Eddy 的下午茶時間'
        : next.kind === 'weekend' ? `Eddy 的${next.weekday === 'Saturday' ? '星期六' : '星期天'}問候` : 'Eddy 的番茄鐘休息時間');
      overlay.innerHTML = `<button type="button"><span class="eddy-global-art"><img alt="" aria-hidden="true"><span class="eddy-global-copy" lang="zh-Hant"><strong></strong><span></span></span></span></button>`;
      overlay.querySelector('img').src = next.kind === 'tea' ? '/eddy-afternoon-tea-dialogue.png'
        : next.kind === 'weekend' ? (next.weekday === 'Saturday' ? '/eddy-saturday-plant-dialogue.png' : '/eddy-sunday-hobbies-dialogue.png')
          : '/eddy-pomodoro-tomato-dialogue.png';
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

  function checkWeekend() {
    if (document.hidden) return;
    const { day, weekday } = hongKongNow();
    if (!['Saturday', 'Sunday'].includes(weekday) || shownWeekendDay === day || stored(weekendStorageKey) === day
      || queue.some((item) => item.kind === 'weekend' && item.day === day)) return;
    queue.push({ kind: 'weekend', day, weekday });
    showNext();
  }

  function queuePomodoroBreak(owner, endsAt) {
    const id = `${owner}:${endsAt}`;
    if (!owner || !Number.isFinite(endsAt) || endsAt <= Date.now() || queuedBreaks.has(id) || stored(breakStoragePrefix + owner) === String(endsAt)) return;
    checkTea();
    checkWeekend();
    queuedBreaks.add(id);
    queue.push({ kind: 'tomato', owner, endsAt });
    showNext();
  }

  function checkTimedGreetings() { checkTea(); checkWeekend(); }

  window.EdmundEddyGlobalDialogue = Object.freeze({ isBlocking, isShowing: () => Boolean(active), queuePomodoroBreak, checkTea, checkWeekend });
  if (document.body) checkTimedGreetings();
  else document.addEventListener('DOMContentLoaded', checkTimedGreetings, { once: true });
  document.addEventListener('visibilitychange', checkTimedGreetings);
  document.addEventListener('close', showNext, true);
  window.addEventListener('focus', checkTimedGreetings);
  window.setInterval(checkTimedGreetings, 30000);
})();
