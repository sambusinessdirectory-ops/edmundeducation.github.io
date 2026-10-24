/* Show Eddy's writing welcome once per browser-local calendar day. */
(() => {
  'use strict';

  const workspace = document.querySelector('[data-view="workspace"]');
  if (!workspace) return;

  const storageKey = 'edmund-writing-eddy-dialogue-day-v1';
  const copy = '準備好了嗎？接下來可要全神貫注囉';
  let shownInThisPage = '';
  let overlay = null;
  let previousFocus = null;

  function localDay() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }

  function storedDay() {
    try { return localStorage.getItem(storageKey); }
    catch { return shownInThisPage; }
  }

  function remember(day) {
    shownInThisPage = day;
    try { localStorage.setItem(storageKey, day); }
    catch { /* Continue for this page when browser storage is unavailable. */ }
  }

  function dismiss() {
    overlay?.remove();
    overlay = null;
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  }

  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    dismiss();
  }

  function showIfDue() {
    if (workspace.hidden || document.hidden || overlay || window.EdmundEddyGlobalDialogue?.isBlocking()) return;
    const today = localDay();
    if (storedDay() === today || shownInThisPage === today) return;

    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 的寫作提示');
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button" aria-label="${copy}。點擊、輕觸或按鍵繼續"><span class="eddy-first-question-art"><img src="eddy-writing-submission-dialogue.png" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-first-question-message--writing" lang="zh-Hant">${copy}</span></span></button>`;
    overlay.addEventListener('click', dismiss);
    document.body.append(overlay);
    remember(today);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }

  new MutationObserver(showIfDue).observe(workspace, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('edmund:eddy-global-dialogue-finished', showIfDue);
  document.addEventListener('visibilitychange', showIfDue);
  showIfDue();
})();
