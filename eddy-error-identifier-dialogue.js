/* Greet students when they enter the Error Identifier portal. */
(() => {
  'use strict';

  const comments = [
    { main: '錯字、漏字、標點符號……一個都不能放過！', sub: '好！Eddy 的火眼金睛要大顯身手啦！……等等，怎麼還有這麼多份啊！？' },
    '哼哼……再怎麼不起眼的錯字，也逃不過 Eddy 的眼睛！……啊！這裡就抓到一個！',
    '改完這份，再看下一份……嗯？怎麼感覺文件越改越多啊！？',
    '嗯！這裡少了一個逗號！那裡多了一個空格！嘿嘿，差點就讓你們溜過去了吧！',
    '第一頁，沒問題！第二頁，也沒問題！第三頁……唔，我剛剛看到哪裡了？',
    '奇怪……明明都檢查三遍了，怎麼每次還是能找到新的錯字啊？',
    '嘿嘿，今天的錯字可別想從 Eddy 眼皮底下溜走！'
  ];
  const portal = window.EDMUND_LEARNING_PORTAL_CONTEXT;
  if (portal?.portalId !== 'error-identifier') return;

  let pendingStudentId = '';
  let shownStudentId = '';
  let overlay = null;
  let previousFocus = null;

  function finish() {
    overlay?.remove();
    overlay = null;
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected && !previousFocus.inert) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  }

  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    finish();
  }

  function showIfReady() {
    if (!pendingStudentId || overlay || document.hidden || window.EdmundEddyGlobalDialogue?.isBlocking()) return;
    const session = portal.getSession();
    if (session.user?.role !== 'student' || !session.token || String(session.user.id) !== pendingStudentId) {
      pendingStudentId = '';
      return;
    }
    const dashboard = document.querySelector('[data-view="dashboard"]');
    if (!dashboard || dashboard.hidden || document.querySelector('dialog[open], .eddy-first-question-overlay')) return;

    shownStudentId = pendingStudentId;
    pendingStudentId = '';
    const comment = comments[Math.floor(Math.random() * comments.length)];
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay eddy-error-identifier-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 一起找錯字');
    overlay.innerHTML = '<button class="eddy-first-question-dismiss" type="button"><span class="eddy-first-question-art"><img src="eddy-error-identifier-dialogue.png" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-error-identifier-message" lang="zh-Hant"></span></span></button>';
    const message = overlay.querySelector('.eddy-error-identifier-message');
    if (typeof comment === 'string') message.textContent = comment;
    else {
      message.classList.add('eddy-error-identifier-headline');
      const headline = document.createElement('strong');
      const detail = document.createElement('span');
      headline.textContent = comment.main;
      detail.textContent = comment.sub;
      message.replaceChildren(headline, detail);
    }
    const spokenCopy = typeof comment === 'string' ? comment : `${comment.main} ${comment.sub}`;
    overlay.querySelector('button').setAttribute('aria-label', `${spokenCopy} 點擊、輕觸或按鍵繼續`);
    overlay.addEventListener('click', finish);
    document.body.append(overlay);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }

  window.addEventListener('edmund:learning-portal-session', (event) => {
    if (event.detail?.portalId !== 'error-identifier') return;
    const studentId = event.detail.user?.role === 'student' ? String(event.detail.user.id || '') : '';
    if (!studentId) {
      pendingStudentId = '';
      shownStudentId = '';
      finish();
      return;
    }
    if (studentId === shownStudentId) return;
    pendingStudentId = studentId;
    requestAnimationFrame(showIfReady);
  });
  document.addEventListener('edmund:eddy-global-dialogue-finished', showIfReady);
  document.addEventListener('visibilitychange', showIfReady);
  document.addEventListener('close', showIfReady, true);
  new MutationObserver(showIfReady).observe(document.body, { childList: true });
})();
