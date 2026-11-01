/* Show Eddy after two to four incorrect MC answers and when a student recovers. */
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
    },
    4: {
      image: '/eddy-four-wrong-mc-surrender.png',
      lines: [
        { main: '好啦好啦！Eddy 投降啦！', sub: '連錯四題，這次算你們厲害！不過，下次我可不會這麼輕易認輸喔！' },
        '停、停戰！Eddy 認輸啦！再這樣下去，連最後一點自信都要輸光啦！',
        '等一下！白旗都舉起來了，就先放過 Eddy 吧！讓我休息一下再挑戰嘛！',
        '好！這回就先舉白旗啦！不過，等 Eddy 把錯的地方都弄懂了，一定會再回來挑戰！',
        '嗚～居然連錯四題！好啦，這次是我輸了……可是還是有點不甘心啊！',
        '四連錯！？Eddy 舉白旗啦！先休兵、先休兵！'
      ]
    },
    recovery: {
      image: '/eddy-mc-recovery-thank-you.png',
      lines: [
        { main: '嗚嗚……終於答對了！', sub: '多虧有你，我們才能順利度過這次難關呢！嘿嘿……謝謝你！Eddy 就知道你一定辦得到！' },
        '嗚哇～得救了！真的得救了！多虧你沒有放棄……Eddy 都快感動得哭出來了啦！',
        '嗚……還以為這次真的沒救了呢！幸好有你在……嘿嘿，能和你一起努力真是太好了！',
        '終於……終於成功了呢！剛才還以為 Eddy 要一直輸下去了……謝謝你願意陪 Eddy 堅持到最後！',
        '哇啊！終於答對啦！Eddy 的白旗總算可以收起來了！嘿嘿，這次真的多虧你了！',
        '太、太好了……！咦？Eddy 怎麼哭了？才不是難過呢！只是……真的很謝謝你啦！',
        '嗚嗚……終於成功了！謝謝你救了 Eddy！有你在真是太好了！'
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
    overlay.setAttribute('aria-label', milestone === 'recovery' ? 'Eddy 感謝你的堅持' : `Eddy 的連錯 ${milestone} 題提示`);
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
    const previous = countFor(scope);
    const next = correct ? 0 : previous + 1;
    remember(scope, next);
    if (correct && previous >= 2) { pending.push('recovery'); schedule(); }
    else if (next === 2 || next === 3 || next === 4) { pending.push(next); schedule(); }
  });
  document.addEventListener('edmund:eddy-global-dialogue-finished', schedule);
  document.addEventListener('visibilitychange', schedule);
  document.addEventListener('close', schedule, true);
  new MutationObserver(() => { if (pending.length) schedule(); }).observe(document.documentElement, { childList: true, subtree: true });
})();
