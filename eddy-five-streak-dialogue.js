/* Celebrate exact answer streak milestones and a lost streak in student activities. */
(() => {
  'use strict';

  const milestones = new Map([
    [5, { art: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-five-streak-dialogue.png', lines: ['這股氣勢真不得了！Eddy 也開始熱血沸騰了呢！'] }],
    [10, { art: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-ten-streak-dialogue.png', lines: [
      '什、什麼！？竟然達成 10 連勝了！？',
      '這也太厲害了吧！看來 Eddy 得重新研究一下您的實力才行了！'
    ] }],
    [15, { art: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-fifteen-streak-dialogue.png', lines: [
      '等、等一下！15 連勝！？這個數據也太誇張了吧！',
      'Eddy 的計算機都快冒煙了啦！'
    ] }],
    [20, { art: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-twenty-streak-dialogue.png', lines: [
      '哇！已經連勝 20 次了呢！',
      '一路努力到現在，真的很不簡單！繼續保持下去吧！'
    ] }],
    [25, { art: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-twenty-five-streak-dialogue.png', lines: [
      '25 連勝.... 難道……您真的是傳說中的天才！？'
    ] }],
    [30, { art: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-thirty-streak-alien.png', random: true, lines: [
      '哇啊！竟然連對 30 題！？\n你該不會偷偷得到了宇宙來的神祕力量吧？連 Eddy 都開始懷疑你是不是外星來的了！',
      '30 題連續答對！？太誇張了吧！\n快老實說，你是不是偷偷跟外星人借了腦袋呀？',
      '咦！？連對 30 題！？這已經不是普通人的等級了吧……\n難道你身上真的藏著宇宙的力量！？',
      '嘿嘿，這隻小傢伙是不是偷偷把外星人的超能力借給你了呀？不然怎麼可能一口氣答對 30 題！',
      '哇！30 題連勝耶！這種實力，簡直像從星星另一頭飛來的一樣厲害呢！',
      '連對 30 題！？這根本是外星級的實力吧！',
      '等等等等！30 題都答對了！？Eddy 得先摸摸這隻外星小傢伙確認一下……你該不會真的獲得宇宙之力了吧！？'
    ] }],
    [35, { art: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-thirty-five-streak-gentleman.png', random: true, lines: [
      '哦呀……竟然已經連對 35 題了呢。\n看來，你已經不是當初那個初出茅廬的新手了。呵呵，真是讓 Eddy 感到驕傲啊。',
      '呵呵，35 題連續答對……真是了不起！\n看著你一路進步到現在，連 Eddy 都忍不住想舉杯為你喝采了～',
      '不知不覺，已經連對 35 題了呢。現在的你，已經成長得讓人另眼相看了～～\n真不愧是 Eddy 所看好的冒險家～～',
      '哼哼……35 題連勝。這可不是隨隨便便就能辦到的成就呢～\n來，讓 Eddy 敬你一杯，為你的成長乾杯吧～',
      '看到你連對 35 題，Eddy 真的很感慨呢～\n從前的你，和現在的你，已經完全不一樣了～',
      '呵呵，看來你已經成為一位相當可靠的人了呢～\n35 題連續答對，這份實力可不是裝得出來的～'
    ] }]
  ]);
  const lostStreakLines = [
    '奇、奇怪了！明明照 Eddy 的計算，應該會贏才對啊……總之，先收下這座努力獎吧！',
    '呃……雖然沒能獲勝，但至少我們很努力了！來，這是 Eddy 特製的『我盡力了獎』！',
    '連敗也是一種紀錄嘛！嘿嘿……這座『努力獎』就當作紀念吧！',
    '唔……這次好像不太順利呢。不過，努力過也很了不起喔！這座獎盃就送給您吧！',
    '這座「努力獎」獎盃就送給您吧！下次一定會更順利的……大概啦！'
  ];
  const keyPrefix = 'edmund-eddy-five-streak-v1:';
  const minimumMilestone = Number(document.currentScript?.dataset?.eddyMinStreak) || 0;
  const counts = new Map();
  const pending = [];
  let overlay = null;
  let active = null;
  let step = 0;
  let previousFocus = null;
  let scheduled = false;
  let dialogueAudio = null;

  function countFor(scope) {
    if (counts.has(scope)) return counts.get(scope);
    let count = 0;
    try { count = Number(localStorage.getItem(keyPrefix + scope)) || 0; }
    catch { /* Keep counting in this page when storage is unavailable. */ }
    counts.set(scope, Math.max(0, count));
    return counts.get(scope);
  }

  function remember(scope, count) {
    counts.set(scope, count);
    try { localStorage.setItem(keyPrefix + scope, String(count)); }
    catch { /* In-memory count still works for this visit. */ }
  }

  function dismiss() {
    overlay?.remove();
    overlay = null;
    active = null;
    step = 0;
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
    if (pending.length) schedule();
  }

  function playDialogueSound() {
    try {
      if (localStorage.getItem('edmund-answer-sounds-v1') === 'off') return;
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      dialogueAudio ??= new Audio();
      if (dialogueAudio.state === 'suspended') dialogueAudio.resume();
      const now = dialogueAudio.currentTime;
      for (const [pitch, delay, duration, volume] of [[783.99, 0, .1, .03], [1046.5, .075, .16, .025]]) {
        const gain = dialogueAudio.createGain();
        gain.gain.setValueAtTime(.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(volume, now + delay + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, now + delay + duration);
        gain.connect(dialogueAudio.destination);
        const tone = dialogueAudio.createOscillator();
        tone.type = 'triangle';
        tone.frequency.setValueAtTime(pitch, now + delay);
        tone.connect(gain);
        tone.start(now + delay);
        tone.stop(now + delay + duration + .03);
      }
    } catch { /* Audio is optional when browser playback is unavailable. */ }
  }

  function advance() {
    if (active && step < active.lines.length - 1) {
      step += 1;
      playDialogueSound();
      const copy = active.lines[step];
      overlay.querySelector('.eddy-first-question-message').textContent = copy;
      overlay.querySelector('button').setAttribute('aria-label', `${copy} 點擊、輕觸或按鍵繼續`);
      return;
    }
    dismiss();
  }

  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Escape') dismiss();
    else advance();
  }

  function showWhenPrimaryFinishes() {
    scheduled = false;
    if (!pending.length || overlay || document.hidden || window.EdmundEddyGlobalDialogue?.isBlocking()) return;
    if (document.querySelector('.eddy-first-question-overlay:not(.eddy-five-streak-overlay)')) return;
    active = pending.shift();
    step = 0;
    const copy = active.lines[step];
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay eddy-five-streak-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 的連勝鼓勵');
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button"><span class="eddy-first-question-art"><img src="${active.art}" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-first-question-message--five-streak" lang="zh-Hant"></span></span></button>`;
    overlay.querySelector('.eddy-first-question-message').textContent = copy;
    overlay.querySelector('button').setAttribute('aria-label', `${copy.replace(/\n/g, ' ')} 點擊、輕觸或按鍵繼續`);
    overlay.addEventListener('click', advance);
    document.body.append(overlay);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }

  function schedule() {
    if (!scheduled) {
      scheduled = true;
      // The primary dialogue also runs from a mutation observer and an animation
      // frame. Give it the first frame before checking for the streak dialogue.
      requestAnimationFrame(() => requestAnimationFrame(showWhenPrimaryFinishes));
    }
  }

  document.addEventListener('edmund:eddy-global-dialogue-finished', schedule);
  document.addEventListener('edmund:eddy-streak-answer', (event) => {
    const { scope, correct, streak, previousStreak } = event.detail || {};
    if (typeof scope !== 'string' || !scope || typeof correct !== 'boolean') return;
    const previous = Number.isInteger(previousStreak) && previousStreak >= 0 ? previousStreak : countFor(scope);
    const next = Number.isInteger(streak) && streak >= 0 ? streak : correct ? previous + 1 : 0;
    remember(scope, next);
    if (correct && next >= minimumMilestone && milestones.has(next)) {
      const milestone = milestones.get(next);
      pending.push(milestone.random
        ? { art: milestone.art, lines: [milestone.lines[Math.floor(Math.random() * milestone.lines.length)]] }
        : milestone);
      schedule();
    } else if (!correct && minimumMilestone === 0 && previous >= 10) {
      pending.push({ art: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-lost-streak-dialogue.png', lines: [lostStreakLines[Math.floor(Math.random() * lostStreakLines.length)]] });
      schedule();
    }
  });

  new MutationObserver(() => { if (pending.length) schedule(); })
    .observe(document.documentElement, { subtree: true, childList: true });
  document.addEventListener('visibilitychange', schedule);
})();
