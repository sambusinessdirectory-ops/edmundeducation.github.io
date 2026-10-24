/* Celebrate exact answer streak milestones and a lost streak in student activities. */
(() => {
  'use strict';

  const milestones = new Map([
    [5, { art: 'eddy-five-streak-dialogue.png', lines: ['這股氣勢真不得了！Eddy 也開始熱血沸騰了呢！'] }],
    [10, { art: 'eddy-ten-streak-dialogue.png', lines: [
      '什、什麼！？竟然達成 10 連勝了！？',
      '這也太厲害了吧！看來 Eddy 得重新研究一下您的實力才行了！'
    ] }],
    [15, { art: 'eddy-fifteen-streak-dialogue.png', lines: [
      '等、等一下！15 連勝！？這個數據也太誇張了吧！',
      'Eddy 的計算機都快冒煙了啦！'
    ] }],
    [20, { art: 'eddy-twenty-streak-dialogue.png', lines: [
      '哇！已經連勝 20 次了呢！',
      '一路努力到現在，真的很不簡單！繼續保持下去吧！'
    ] }],
    [25, { art: 'eddy-twenty-five-streak-dialogue.png', lines: [
      '25 連勝.... 難道……您真的是傳說中的天才！？'
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
    if (!pending.length || overlay || document.hidden) return;
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
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button" aria-label="${copy} 點擊、輕觸或按鍵繼續"><span class="eddy-first-question-art"><img src="${active.art}" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-first-question-message--five-streak" lang="zh-Hant">${copy}</span></span></button>`;
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

  document.addEventListener('edmund:eddy-streak-answer', (event) => {
    const { scope, correct, streak, previousStreak } = event.detail || {};
    if (typeof scope !== 'string' || !scope || typeof correct !== 'boolean') return;
    const previous = Number.isInteger(previousStreak) && previousStreak >= 0 ? previousStreak : countFor(scope);
    const next = Number.isInteger(streak) && streak >= 0 ? streak : correct ? previous + 1 : 0;
    remember(scope, next);
    if (correct && milestones.has(next)) {
      pending.push(milestones.get(next));
      schedule();
    } else if (!correct && previous >= 10) {
      pending.push({ art: 'eddy-lost-streak-dialogue.png', lines: [lostStreakLines[Math.floor(Math.random() * lostStreakLines.length)]] });
      schedule();
    }
  });

  new MutationObserver(() => { if (pending.length) schedule(); })
    .observe(document.documentElement, { subtree: true, childList: true });
  document.addEventListener('visibilitychange', schedule);
})();
