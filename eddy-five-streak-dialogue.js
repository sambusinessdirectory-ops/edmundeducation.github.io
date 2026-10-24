/* Celebrate the fifth consecutive correct answer in each student activity. */
(() => {
  'use strict';

  const copy = '這股氣勢真不得了！Eddy 也開始熱血沸騰了呢！';
  const keyPrefix = 'edmund-eddy-five-streak-v1:';
  const counts = new Map();
  let pending = false;
  let overlay = null;
  let previousFocus = null;
  let scheduled = false;

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
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
    if (pending) schedule();
  }

  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    dismiss();
  }

  function showWhenPrimaryFinishes() {
    scheduled = false;
    if (!pending || overlay || document.hidden) return;
    if (document.querySelector('.eddy-first-question-overlay:not(.eddy-five-streak-overlay)')) return;
    pending = false;
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay eddy-five-streak-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 的連勝鼓勵');
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button" aria-label="${copy} 點擊、輕觸或按鍵繼續"><span class="eddy-first-question-art"><img src="eddy-five-streak-dialogue.png" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-first-question-message--five-streak" lang="zh-Hant">${copy}</span></span></button>`;
    overlay.addEventListener('click', dismiss);
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
    const { scope, correct, streak } = event.detail || {};
    if (typeof scope !== 'string' || !scope || typeof correct !== 'boolean') return;
    const next = Number.isInteger(streak) && streak >= 0 ? streak : correct ? countFor(scope) + 1 : 0;
    remember(scope, next);
    if (correct && next === 5) {
      pending = true;
      schedule();
    }
  });

  new MutationObserver(() => { if (pending) schedule(); })
    .observe(document.documentElement, { subtree: true, childList: true });
  document.addEventListener('visibilitychange', schedule);
})();
