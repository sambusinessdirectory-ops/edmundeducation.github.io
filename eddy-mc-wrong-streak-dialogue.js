/* Show Eddy after two and three consecutive incorrect multiple-choice answers. */
(() => {
  'use strict';
  const copy = {
    2: {
      image: '/eddy-two-wrong-mc-dialogue.png',
      lines: [
        { main: '什、什麼！？竟然連錯兩題！？', sub: '明明覺得自己答對了啊……唔！看來得重新動動腦筋了！' },
        '唔……連續兩題都答錯了啊。看來這部分，Eddy 還得多學一點呢！',
        '咦！？怎麼又錯了？一、一定是剛剛看太快啦！再來一次！',
        '不對啊……第一題選這個，第二題選那個……難道 Eddy 從一開始就想錯了！？'
      ]
    },
    3: {
      image: '/eddy-three-wrong-mc-dialogue.png',
      lines: [
        '不過，這下至少知道哪裡需要加強了！好，下次一定要答對！',
        '唔～又差了一點！不過沒關係，Eddy 可不是會輕易放棄的人喔！',
        '先整理一下思緒，再來試試看吧！',
        '唔！這些題目還真有兩下子嘛！不過，Eddy 可不打算就這樣認輸喔！',
        '下一題一定會更順利的！'
      ]
    }
  };
  const prefix = 'edmund-eddy-mc-wrong-streak-v1:';
  const counts = new Map();
  const pending = [];
  let overlay = null;
  let previousFocus = null;
  let scheduled = false;
  function countFor(scope) {
    if (counts.has(scope)) return counts.get(scope);
    let count = 0;
    try { count = Number(localStorage.getItem(prefix + scope)) || 0; } catch { /* Memory still works. */ }
    count = Number.isSafeInteger(count) ? Math.max(0, count) : 0;
    counts.set(scope, count);
    return count;
  }
  function remember(scope, count) {
    counts.set(scope, count);
    try { localStorage.setItem(prefix + scope, String(count)); } catch { /* Memory still works. */ }
  }
  function dismiss() {
    overlay?.remove();
    overlay = null;
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
    if (pending.length) schedule();
  }
  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    dismiss();
  }
  function showNext() {
    scheduled = false;
    if (!pending.length || overlay || document.hidden || window.EdmundEddyGlobalDialogue?.isBlocking()
      || document.querySelector('dialog[open], .eddy-first-question-overlay')) return;
    const milestone = pending.shift();
    const greeting = copy[milestone];
    const line = greeting.lines[Math.floor(Math.random() * greeting.lines.length)];
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay eddy-mc-wrong-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `Eddy 的連錯 ${milestone} 題提示`);
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button"><span class="eddy-first-question-art"><img src="${greeting.image}" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-mc-wrong-message" lang="zh-Hant"></span></span></button>`;
    const message = overlay.querySelector('.eddy-mc-wrong-message');
    if (typeof line === 'string') message.textContent = line;
    else {
      const main = document.createElement('strong');
      const sub = document.createElement('span');
      main.textContent = line.main;
      sub.textContent = line.sub;
      message.replaceChildren(main, sub);
    }
    overlay.querySelector('button').setAttribute('aria-label', `${typeof line === 'string' ? line : `${line.main} ${line.sub}`} 點擊、輕觸或按鍵關閉`);
    overlay.addEventListener('click', dismiss);
    document.body.append(overlay);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }
  function schedule() {
    if (scheduled || !pending.length) return;
    scheduled = true;
    requestAnimationFrame(() => requestAnimationFrame(showNext));
  }
  document.addEventListener('edmund:eddy-streak-answer', event => {
    const { scope, correct, mc } = event.detail || {};
    if (mc !== true || typeof scope !== 'string' || !scope || typeof correct !== 'boolean') return;
    const next = correct ? 0 : countFor(scope) + 1;
    remember(scope, next);
    if (next === 2 || next === 3) { pending.push(next); schedule(); }
  });
  document.addEventListener('edmund:eddy-global-dialogue-finished', schedule);
  document.addEventListener('visibilitychange', schedule);
  document.addEventListener('close', schedule, true);
  new MutationObserver(() => { if (pending.length) schedule(); }).observe(document.documentElement, { childList: true, subtree: true });
})();
