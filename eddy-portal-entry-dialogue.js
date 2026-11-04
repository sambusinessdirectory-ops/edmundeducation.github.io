/* Eddy's song and grammar entry greetings. */
(() => {
  'use strict';

  const grammar = location.pathname.endsWith('/grammar-system.html');
  const song = location.pathname.endsWith('/song-appreciation.html');
  if (!grammar && !song) return;

  const config = grammar ? {
    label: 'Eddy 的英文語法挑戰',
    image: '/eddy-grammar-daily-dialogue.png',
    comments: [
      { main: '呵呵呵……你終於來了啊。', sub: 'Eddy 已經用這股力量，準備好一場前所未有的試煉了。來吧——讓我看看，你究竟能不能撐到最後！' },
      '哼哼……感受到這股力量了嗎？這可是 Eddy 特地為你準備的高難度挑戰。準備好了，就放馬過來吧！',
      '黑暗的力量已經覺醒……而你，即將面對 Eddy 親手打造的終極試煉。可別讓我失望啊。',
      '來得正好。Eddy 已經完成了全新的高階任務——這一次可不是隨隨便便就能過關的喔！',
      '呵呵呵……普通的挑戰，已經滿足不了我了。現在，就來試試 Eddy 精心設計的進階任務吧！',
      '這次的任務，可是 Eddy 動用了真正的力量才完成的。想挑戰的話，就拿出你的全部實力來吧！'
    ]
  } : {
    label: 'Eddy 一起欣賞歌曲',
    image: '/eddy-song-appreciation-dialogue.png',
    comments: [
      { main: '♪ 哼哼哼～啦啦啦～♪', sub: '咦？你什麼時候來的！？糟糕……Eddy 剛才該不會唱得很大聲吧！？' },
      '哦哦！這節奏也太帶勁了吧！嘿嘿，腳都忍不住跟著打拍子啦！',
      '♪ 啦啦啦～♪ 各位觀眾，準備好迎接 Eddy 的演唱會了嗎？……咦？原來只有你在啊！',
      '啊！是 Eddy 最喜歡的那首歌！不行不行，這首一定要從頭聽到尾！',
      '咦？你剛剛有說話嗎？抱歉抱歉！Eddy 聽得太入迷，完全沒注意到啦！',
      '嗯～配上喜歡的音樂，連平凡的一天都變得有趣起來了呢！',
      '嘿嘿，這段旋律真好聽！……等等，怎麼連肩膀都自己跳起舞來了！？'
    ]
  };

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
  function setDialogueText(node, value) {
    node.textContent = value;
  }

  function showIfReady() {
    if (!pendingStudentId || overlay || document.hidden || window.EdmundEddyGlobalDialogue?.isBlocking()) return;
    const studentId = pendingStudentId;
    if (grammar) {
      const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession();
      if (session?.user?.role !== 'student' || !session.token || String(session.user.id) !== studentId) {
        pendingStudentId = '';
        return;
      }
    }
    const view = document.querySelector(grammar ? '[data-view="dashboard"]' : '[data-view="student"]');
    if (!view || view.hidden || document.querySelector('dialog[open], .eddy-first-question-overlay')) return;

    pendingStudentId = '';
    shownStudentId = studentId;
    const comment = config.comments[Math.floor(Math.random() * config.comments.length)];
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay eddy-portal-entry-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', config.label);
    overlay.innerHTML = '<button class="eddy-first-question-dismiss" type="button"><span class="eddy-first-question-art"><img alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-portal-entry-message" lang="zh-Hant"></span></span></button>';
    overlay.querySelector('img').src = config.image;
    const message = overlay.querySelector('.eddy-portal-entry-message');
    if (typeof comment === 'string') setDialogueText(message, comment);
    else {
      message.classList.add('is-headline');
      const headline = document.createElement('strong');
      const detail = document.createElement('span');
      setDialogueText(headline, comment.main);
      setDialogueText(detail, comment.sub);
      message.replaceChildren(headline, detail);
    }
    const spoken = typeof comment === 'string' ? comment : `${comment.main} ${comment.sub}`;
    overlay.querySelector('button').setAttribute('aria-label', `${spoken} 點擊、輕觸或按鍵繼續`);
    overlay.addEventListener('click', finish);
    document.body.append(overlay);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }

  if (grammar) {
    window.addEventListener('edmund:learning-portal-session', event => {
      if (event.detail?.portalId !== 'grammar') return;
      const studentId = event.detail.user?.role === 'student' ? String(event.detail.user.id || '') : '';
      if (!studentId) { pendingStudentId = ''; shownStudentId = ''; finish(); return; }
      if (studentId !== shownStudentId) pendingStudentId = studentId;
      requestAnimationFrame(showIfReady);
    });
    const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession();
    if (session?.user?.role === 'student') pendingStudentId = String(session.user.id || '');
  } else {
    window.addEventListener('edmund:song-appreciation-student-closed', () => {
      pendingStudentId = '';
      shownStudentId = '';
      finish();
    });
    window.addEventListener('edmund:song-appreciation-student-opened', event => {
      const studentId = String(event.detail?.studentId || '');
      if (studentId && studentId !== shownStudentId) pendingStudentId = studentId;
      requestAnimationFrame(showIfReady);
    });
  }
  document.addEventListener('edmund:eddy-global-dialogue-finished', showIfReady);
  document.addEventListener('visibilitychange', showIfReady);
  document.addEventListener('close', showIfReady, true);
  new MutationObserver(showIfReady).observe(document.body, { childList: true });
  requestAnimationFrame(showIfReady);
})();
