/* Welcome students to their progress dashboard once per browser session. */
(() => {
  'use strict';
  const variants = [
    { main: '啊，對了……還有一件事。', sub: 'Eddy 差點忘了告訴你！有了全新的「進度追蹤」功能，你的每一步成長，都能看得一清二楚！' },
    '「還有一件事……」\n「Eddy 想讓你親眼看見，自己究竟進步了多少。」',
    '「今天的發表就到這裡……」\n「……喔，差點忘了。還有一件事！」\n「隆重介紹——全新的『進度追蹤』功能！」',
    '「對了，還有一件事……」\n「如果科技能讓每一分努力都留下足跡，那麼，成長就是看得見的改變！」'
  ];
  const shown = new Set();
  let pending = null;
  let overlay = null;
  let previousFocus = null;
  function key(id) { return `edmund-eddy-student-progress-v1:${id}`; }
  function seen(id) {
    if (shown.has(id)) return true;
    try { return sessionStorage.getItem(key(id)) === 'shown'; } catch { return false; }
  }
  function remember(id) {
    shown.add(id);
    try { sessionStorage.setItem(key(id), 'shown'); } catch { /* Page memory still works. */ }
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
    event.stopImmediatePropagation();
    dismiss();
  }
  function showIfReady() {
    if (!pending || overlay || document.hidden || seen(pending)
      || window.EdmundEddyGlobalDialogue?.isBlocking()
      || document.querySelector('dialog[open], .eddy-first-question-overlay')) return;
    const dashboard = document.querySelector('[data-view="dashboard"]');
    if (!dashboard || dashboard.hidden) return;
    const id = pending;
    pending = null;
    const line = variants[Math.floor(Math.random() * variants.length)];
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay eddy-student-progress-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 介紹進度追蹤');
    overlay.innerHTML = '<button class="eddy-first-question-dismiss" type="button"><span class="eddy-first-question-art"><img src="https://edmund-public-media.edmundeducation.workers.dev/eddy-student-progress-dialogue.png" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-student-progress-message" lang="zh-Hant"></span></span></button>';
    const message = overlay.querySelector('.eddy-student-progress-message');
    if (typeof line === 'string') message.textContent = line;
    else {
      const main = document.createElement('strong');
      const sub = document.createElement('span');
      main.textContent = line.main;
      sub.textContent = line.sub;
      message.replaceChildren(main, sub);
    }
    overlay.querySelector('button').setAttribute('aria-label', `${typeof line === 'string' ? line.replace(/\n/g, ' ') : `${line.main} ${line.sub}`} 點擊、輕觸或按鍵關閉`);
    overlay.addEventListener('click', dismiss);
    document.body.append(overlay);
    remember(id);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }
  document.addEventListener('edmund:student-progress-opened', event => {
    const id = event.detail?.studentId;
    if (typeof id !== 'string' || !id || seen(id)) return;
    pending = id;
    requestAnimationFrame(showIfReady);
  });
  document.addEventListener('edmund:eddy-global-dialogue-finished', showIfReady);
  document.addEventListener('visibilitychange', showIfReady);
  document.addEventListener('close', showIfReady, true);
  new MutationObserver(showIfReady).observe(document.documentElement, { childList: true, subtree: true });
})();
