/* Sitewide Eddy moments: Hong Kong time greetings, weekends and Pomodoro breaks. */
(() => {
  'use strict';

  const teaLines = [
    ['哎呀，差不多該喝下午茶了呢！', '香噴噴的紅茶，配上甜滋滋的點心……嘿嘿，這才是享受人生嘛！'],
    ['忙碌了一整天，偶爾也得優雅一下嘛！', '來，今天就一起享受英式下午茶吧！'],
    ['下午茶時間到囉！', ''],
    ['午後的陽光暖洋洋的，再來杯熱騰騰的紅茶……', '嗯～真希望時間能過得慢一點呢！']
  ];
  const lunchLines = [
    ['唔～吃飽了就不想動了呢……', '可是下午還有事情要做……唉，好想再休息五分鐘喔……'],
    ['呼啊～肚子飽飽的，整個人都懶洋洋的……工作什麼的，能不能晚點再說啊？', ''],
    ['奇怪……剛才吃飯的時候明明還很有精神啊？怎麼一想到工作，力氣就全跑光了……', ''],
    ['好啦……該回去工作了……嘿咻！……唔，果然還是提不起勁呢。', ''],
    ['再休息五分鐘……不，十分鐘就好！……咦？已經到時間了嗎？', ''],
    ['午休結束了啊……唔～真想跟椅子黏在一起……', '']
  ];
  const coffeeLines = [
    ['呼～這個時間來杯咖啡，真是再幸福不過了！', '嗯～光是聞到香味，就覺得整個人都活過來了呢！'],
    ['啊～咖啡真香！要是能一直坐在這裡，什麼都不做就好了……', ''],
    ['先聞聞香氣，再慢慢喝上一口……嗯！這才是下午最棒的享受嘛！', ''],
    ['嘿嘿，Eddy 可不是在偷懶喔！這是在進行重要的咖啡研究！', ''],
    ['午後的陽光，配上一杯香醇的咖啡……嗯～感覺時間都慢下來了呢。', ''],
    ['呼～先喝口咖啡，讓腦袋休息一下吧！', '']
  ];
  const finishingWorkLines = [
    ['嘿嘿……再一下下就能下班啦！', '今天晚餐要吃什麼好呢？……啊！不行不行，手邊的工作得先做完才行！'],
    ['嗯……還有十分鐘……九分鐘……八分鐘……咦？怎麼覺得時間過得特別慢啊？', ''],
    ['好！今天的工作也快告一段落了！呼～下班後要做什麼呢？光想就覺得開心！', ''],
    ['唔～明明都快下班了，怎麼還有事情沒做完啊！再加把勁吧……就一下下！', ''],
    ['水壺收好了，公事包也準備好了……嘿嘿，Eddy 可是隨時都能出發喔！', ''],
    ['夕陽都染紅窗邊了呢……嗯！今天也過得很充實，差不多該準備收工啦！', ''],
    ['再撐一下下！下班後的快樂時光就在眼前啦！', '']
  ];
  const gamingLines = [
    ['終於到了最期待的遊戲時間！', '今天一定要突破昨天卡住的那一關！好，這次絕對沒問題！'],
    ['好！手把準備就緒！今晚一定要一口氣破關！……咦？怎麼才開始就輸了！？', ''],
    ['往左！不對，往右！啊啊啊！差一點就過關了啦！再來一次！', ''],
    ['哼哼，今晚的 Eddy 可是認真的喔！要不要來比比看誰比較厲害？', ''],
    ['好耶！遊戲時間到！Eddy 要開玩囉！', ''],
    ['等這一刻等好久啦！好！今晚要玩個痛快！……啊，差點忘了先存檔！', ''],
    ['點心準備好了，遊戲也準備好了……嗯！今晚真是完美！', '']
  ];
  const midnightSnackLines = [
    ['咦！？你、你怎麼這個時間還醒著！？', 'Eddy 只、只是來拿一片小餅乾而已喔！……真的只有一片啦！'],
    ['啊，原來是你啊……嘿嘿。這麼晚了，Eddy 當然只是路過點心櫃而已……', ''],
    ['唔哇！被、被發現了！？這、這不是偷吃，只是午夜補充能量而已啦！', ''],
    ['呼啊……睡前吃一塊小餅乾，應該不算犯規吧？……咦？你什麼時候來的！？', ''],
    ['噓——小聲一點喔！Eddy 正在執行深夜餅乾作戰……現在可是最關鍵的時刻呢！', ''],
    ['嘿嘿……晚上偷偷吃的餅乾，果然特別好吃呢。……啊！Eddy 什麼都沒說喔！', ''],
    ['咦！？被你看到了……這塊餅乾、這塊餅乾是意外啦！', '']
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
  const sleepyLines = [
    ['嗯～怎麼眼皮開始有點沉沉的了……', '不過，Eddy 還精神得很呢！再陪您玩一下也沒問題！'],
    ['咦？您說 Eddy 看起來想睡了？\n才、才沒有呢！只是稍微放空了一下啦！', ''],
    ['嗯～不知道為什麼，突然有點想窩在軟綿綿的被子裡呢……', ''],
    ['呼啊……咦？Eddy 剛才是不是打了個呵欠？一定是您的錯覺啦！', ''],
    ['奇怪……今天的枕頭怎麼感覺特別有吸引力呢？嘿嘿，難道是它在叫我嗎？', ''],
    ['嗯～好像開始有點睏了呢。不過，現在就睡覺還太早了一點吧？', ''],
    ['唔……有點想睡，又還不想睡呢！', '']
  ];
  const bedtimeLines = [
    ['呼啊～～不行了，眼睛快睜不開啦……', '今天就先到這裡吧……剩下的冒險，等睡飽了再……呼……💤'],
    ['唔……Eddy 還可以再撐一下……不對，果然還是先睡覺好了……晚安……', ''],
    ['呼啊～～好睏喔……感覺只要一碰到枕頭，就能立刻睡著呢……', ''],
    ['本來還想再玩一下的……可是被窩好像一直在叫我……唔，晚安啦！', ''],
    ['今天也過得很充實呢……Eddy 要先去睡覺啦！您也別太晚睡喔，晚安！', ''],
    ['再、再五分鐘就好……咦？不是要起床嗎？啊……原來是該睡覺了……', ''],
    ['呼啊～真的撐不住啦……Eddy 先去夢裡冒險囉！', '']
  ];
  const teaStorageKey = 'edmund-eddy-afternoon-tea-day-v1';
  const lunchStorageKey = 'edmund-eddy-after-lunch-day-v1';
  const weekendStorageKey = 'edmund-eddy-weekend-day-v1';
  const sleepyStorageKey = 'edmund-eddy-sleepy-evening-day-v1';
  const bedtimeStorageKey = 'edmund-eddy-bedtime-night-v1';
  const timedMoments = Object.freeze({
    midnightSnack: { startMinute: 120, endMinute: 350, lines: midnightSnackLines, image: '/eddy-midnight-snack-dialogue.png', label: 'Eddy 的深夜餅乾時間', storageKey: 'edmund-eddy-midnight-snack-day-v1' },
    coffee: { hour: 16, lines: coffeeLines, image: '/eddy-coffee-break-dialogue.png', label: 'Eddy 的午後咖啡時間', storageKey: 'edmund-eddy-coffee-break-day-v1' },
    finishingWork: { hour: 18, lines: finishingWorkLines, image: '/eddy-finishing-work-dialogue.png', label: 'Eddy 的下班前問候', storageKey: 'edmund-eddy-finishing-work-day-v1' },
    gaming: { hour: 20, lines: gamingLines, image: '/eddy-gaming-time-dialogue.png', label: 'Eddy 的遊戲時間', storageKey: 'edmund-eddy-gaming-time-day-v1' }
  });
  const breakStoragePrefix = 'edmund-eddy-pomodoro-break-v1:';
  const queue = [];
  const queuedBreaks = new Set();
  let active = null;
  let overlay = null;
  let previousFocus = null;
  let shownTeaDay = '';
  let shownLunchDay = '';
  let shownWeekendDay = '';
  let shownSleepyDay = '';
  let shownBedtimeNight = '';
  const shownMomentDays = Object.create(null);
  let audioContext = null;



  function hongKongNow() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'long'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return { day: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour), minute: Number(values.minute), weekday: values.weekday };
  }

  function momentIsActive(moment, now) {
    const minuteOfDay = now.hour * 60 + now.minute;
    return moment.startMinute === undefined ? now.hour === moment.hour
      : minuteOfDay >= moment.startMinute && minuteOfDay < moment.endMinute;
  }

  function stored(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function remember(key, value) {
    try { localStorage.setItem(key, value); } catch { /* This page still deduplicates in memory. */ }
  }
  function pick(lines) { return lines[Math.floor(Math.random() * lines.length)]; }

  function nightKey({ day, hour }) {
    if (hour >= 22) return day;
    const previous = new Date(`${day}T00:00:00Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    return previous.toISOString().slice(0, 10);
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
      const timedMoment = timedMoments[next.kind];
      if (timedMoment) {
        const now = hongKongNow();
        if (!momentIsActive(timedMoment, now) || now.day !== next.day || shownMomentDays[next.kind] === now.day
          || stored(timedMoment.storageKey) === now.day) continue;
        shownMomentDays[next.kind] = now.day;
        remember(timedMoment.storageKey, now.day);
      } else if (next.kind === 'lunch') {
        const now = hongKongNow();
        if (now.hour !== 13 || now.day !== next.day || shownLunchDay === now.day || stored(lunchStorageKey) === now.day) continue;
        shownLunchDay = now.day;
        remember(lunchStorageKey, now.day);
      } else if (next.kind === 'tea') {
        const now = hongKongNow();
        if (now.hour !== 15 || now.day !== next.day || shownTeaDay === now.day || stored(teaStorageKey) === now.day) continue;
        shownTeaDay = now.day;
        remember(teaStorageKey, now.day);
      } else if (next.kind === 'weekend') {
        const now = hongKongNow();
        if (now.day !== next.day || now.weekday !== next.weekday || shownWeekendDay === now.day || stored(weekendStorageKey) === now.day) continue;
        shownWeekendDay = now.day;
        remember(weekendStorageKey, now.day);
      } else if (next.kind === 'sleepy') {
        const now = hongKongNow();
        if (now.hour !== 21 || now.day !== next.day || shownSleepyDay === now.day || stored(sleepyStorageKey) === now.day) continue;
        shownSleepyDay = now.day;
        remember(sleepyStorageKey, now.day);
      } else if (next.kind === 'bedtime') {
        const now = hongKongNow();
        if (![22, 23, 0, 1].includes(now.hour) || nightKey(now) !== next.night
          || shownBedtimeNight === next.night || stored(bedtimeStorageKey) === next.night) continue;
        shownBedtimeNight = next.night;
        remember(bedtimeStorageKey, next.night);
      } else if (Date.now() >= next.endsAt || stored(breakStoragePrefix + next.owner) === String(next.endsAt)) {
        continue;
      } else {
        remember(breakStoragePrefix + next.owner, String(next.endsAt));
      }
      active = next;
      previousFocus = document.activeElement;
      const lines = timedMoment ? timedMoment.lines : next.kind === 'lunch' ? lunchLines : next.kind === 'tea' ? teaLines : next.kind === 'weekend'
        ? (next.weekday === 'Saturday' ? saturdayLines : sundayLines)
        : next.kind === 'sleepy' ? sleepyLines : next.kind === 'bedtime' ? bedtimeLines : tomatoLines;
      const [main, sub] = pick(lines);
      overlay = document.createElement('div');
      overlay.className = 'eddy-global-overlay';
      overlay.dataset.eddyGlobalDialogue = '';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', timedMoment ? timedMoment.label : next.kind === 'lunch' ? 'Eddy 的午飯後問候' : next.kind === 'tea' ? 'Eddy 的下午茶時間'
        : next.kind === 'weekend' ? `Eddy 的${next.weekday === 'Saturday' ? '星期六' : '星期天'}問候`
          : next.kind === 'sleepy' ? 'Eddy 的晚間問候' : next.kind === 'bedtime' ? 'Eddy 的晚安問候' : 'Eddy 的番茄鐘休息時間');
      overlay.innerHTML = `<button type="button"><span class="eddy-global-art"><img alt="" aria-hidden="true"><span class="eddy-global-copy" lang="zh-Hant"><strong></strong><span></span></span></span></button>`;
      overlay.querySelector('img').src = timedMoment ? timedMoment.image : next.kind === 'lunch' ? '/eddy-after-lunch-dialogue.png' : next.kind === 'tea' ? '/eddy-afternoon-tea-dialogue.png'
        : next.kind === 'weekend' ? (next.weekday === 'Saturday' ? '/eddy-saturday-plant-dialogue.png' : '/eddy-sunday-hobbies-dialogue.png')
          : next.kind === 'sleepy' ? '/eddy-evening-teddy-dialogue.png'
            : next.kind === 'bedtime' ? '/eddy-bedtime-pyjamas-dialogue.png' : '/eddy-pomodoro-tomato-dialogue.png';
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

  function checkLunch() {
    if (document.hidden) return;
    const { day, hour } = hongKongNow();
    if (hour !== 13 || shownLunchDay === day || stored(lunchStorageKey) === day
      || queue.some((item) => item.kind === 'lunch' && item.day === day)) return;
    queue.unshift({ kind: 'lunch', day });
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

  function checkNewTimedMoments() {
    if (document.hidden) return;
    const now = hongKongNow();
    const { day } = now;
    const entry = Object.entries(timedMoments).find(([, moment]) => momentIsActive(moment, now));
    if (!entry) return;
    const [kind, moment] = entry;
    if (shownMomentDays[kind] === day || stored(moment.storageKey) === day
      || queue.some((item) => item.kind === kind && item.day === day)) return;
    queue.unshift({ kind, day });
    showNext();
  }

  function checkEvening() {
    if (document.hidden) return;
    const now = hongKongNow();
    if (now.hour === 21) {
      if (shownSleepyDay === now.day || stored(sleepyStorageKey) === now.day
        || queue.some((item) => item.kind === 'sleepy' && item.day === now.day)) return;
      queue.push({ kind: 'sleepy', day: now.day });
    } else if ([22, 23, 0, 1].includes(now.hour)) {
      const night = nightKey(now);
      if (shownBedtimeNight === night || stored(bedtimeStorageKey) === night
        || queue.some((item) => item.kind === 'bedtime' && item.night === night)) return;
      queue.push({ kind: 'bedtime', night });
    } else return;
    showNext();
  }

  function queuePomodoroBreak(owner, endsAt) {
    const id = `${owner}:${endsAt}`;
    if (!owner || !Number.isFinite(endsAt) || endsAt <= Date.now() || queuedBreaks.has(id) || stored(breakStoragePrefix + owner) === String(endsAt)) return;
    checkLunch();
    checkTea();
    checkNewTimedMoments();
    checkWeekend();
    checkEvening();
    queuedBreaks.add(id);
    queue.push({ kind: 'tomato', owner, endsAt });
    showNext();
  }

  function checkTimedGreetings() { checkLunch(); checkTea(); checkNewTimedMoments(); checkWeekend(); checkEvening(); }

  window.EdmundEddyGlobalDialogue = Object.freeze({ isBlocking, isShowing: () => Boolean(active), queuePomodoroBreak, checkLunch, checkTea, checkNewTimedMoments, checkWeekend, checkEvening });
  if (document.body) checkTimedGreetings();
  else document.addEventListener('DOMContentLoaded', checkTimedGreetings, { once: true });
  document.addEventListener('visibilitychange', checkTimedGreetings);
  document.addEventListener('close', showNext, true);
  window.addEventListener('focus', checkTimedGreetings);
  window.setInterval(checkTimedGreetings, 30000);
})();
