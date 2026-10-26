/* Celebrate a genuine day off after the student's current week has loaded. */
(() => {
  'use strict';

  const copy = '奇怪……今天的任務清單竟然是空的！？\n算啦！偶爾休息一下也挺好的！';
  const shown = new Set();
  let pending = null;
  let overlay = null;
  let previousFocus = null;

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

  function showIfReady() {
    if (!pending || overlay || document.hidden || window.EdmundEddyGlobalDialogue?.isBlocking()) return;
    const calendar = document.querySelector('[data-view="calendar"]');
    const todayColumn = calendar?.querySelector(`.day-column.is-today[data-column-date="${pending.date}"]`);
    if (calendar?.hidden || !todayColumn || document.querySelector('dialog[open], .eddy-first-question-overlay')) return;
    const key = `${pending.studentId}:${pending.date}`;
    pending = null;
    if (shown.has(key)) return;

    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 的今日功課提示');
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button" aria-label="${copy.replace(/\n/g, ' ')} 點擊、輕觸或按鍵繼續"><span class="eddy-first-question-art"><img src="eddy-schedule-empty-day-dialogue.png" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-first-question-message--schedule-empty" lang="zh-Hant">${copy}</span></span></button>`;
    overlay.addEventListener('click', dismiss);
    document.body.append(overlay);
    shown.add(key);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }

  document.addEventListener('edmund:schedule-today-homework', (event) => {
    const { studentId, date, homeworkCount } = event.detail || {};
    if (typeof studentId !== 'string' || !studentId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    pending = homeworkCount === 0 ? { studentId, date } : null;
    requestAnimationFrame(showIfReady);
  });
  document.addEventListener('edmund:eddy-global-dialogue-finished', showIfReady);
  document.addEventListener('visibilitychange', showIfReady);
  document.addEventListener('close', showIfReady, true);
  new MutationObserver(showIfReady).observe(document.body, { childList: true });
})();
