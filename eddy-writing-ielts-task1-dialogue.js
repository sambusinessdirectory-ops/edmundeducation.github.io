/* React to an explicitly selected IELTS Task 1 process diagram or map question. */
(() => {
  'use strict';

  const workspace = document.querySelector('[data-view="workspace"]');
  if (!workspace) return;

  const moments = {
    process: {
      image: 'eddy-writing-ielts-process-dialogue.png',
      label: 'Eddy 的 IELTS 流程圖寫作提示',
      variants: [
        { main: '嗯嗯……先這樣，再那樣……', sub: '咦！？等等！這個箭頭怎麼又繞回去了啊！？' },
        '好，先從這裡開始……然後往右……再往左……咦？我剛剛看到哪裡了？',
        '從這裡開始，然後走到這裡……嗯？怎麼又回到起點了！？',
        '嗯，原來如此……一切都很合理……等等！這條線到底是從哪裡冒出來的！？',
        '一個箭頭、兩個箭頭、三個箭頭……哇啊！眼睛都快看花啦！',
        '奇怪……這張流程圖明明是用來幫助理解的，怎麼越看越糊塗啊？'
      ]
    },
    maps: {
      image: 'eddy-writing-ielts-maps-dialogue.png',
      label: 'Eddy 的 IELTS 地圖寫作提示',
      variants: [
        { main: '嗯嗯……只要沿著這條路走，就能到達目的地了！', sub: '……奇怪？可是我們現在到底在哪裡啊？' },
        '奇怪……這座山怎麼跑到南邊去了？……啊！原來是地圖拿反了！',
        '往東走有森林，往西走有湖泊……嘿嘿，光看地圖就讓人興奮起來了呢！',
        '放心放心！這附近的路 Eddy 可熟了！……呃，這條小路是哪時候冒出來的？',
        '咦？地圖上這個小小的記號是什麼？難道……是還沒被發現的祕密地點！？',
        '先往右，再直走……嗯？等等！這附近居然有一家甜點店！？',
        '方向沒錯！……大概啦。等等，指南針呢？'
      ]
    }
  };
  let pending = null;
  let overlay = null;
  let previousFocus = null;

  function selectedKind({ sectionKey, detail } = {}) {
    if (sectionKey !== 'ielts-writing' || !/\bTask 1\b/i.test(detail || '')) return null;
    if (/\bProcess Diagram\b/i.test(detail)) return 'process';
    if (/\bMaps?\b/i.test(detail)) return 'maps';
    return null;
  }

  function dismiss() {
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
    dismiss();
  }

  function showIfReady() {
    if (!pending || overlay || workspace.hidden || document.hidden
      || window.EdmundEddyGlobalDialogue?.isBlocking()
      || window.EdmundEddyWritingDailyDialogue?.isBlocking()
      || document.querySelector('dialog[open], .eddy-first-question-overlay')) return;

    const moment = moments[pending];
    pending = null;
    const copy = moment.variants[Math.floor(Math.random() * moment.variants.length)];
    const spoken = typeof copy === 'string' ? copy : `${copy.main} ${copy.sub}`;
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay eddy-writing-ielts-task1-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', moment.label);
    const button = document.createElement('button');
    button.className = 'eddy-first-question-dismiss';
    button.type = 'button';
    button.setAttribute('aria-label', `${spoken} 點擊、輕觸或按鍵繼續`);
    const art = document.createElement('span');
    art.className = 'eddy-first-question-art';
    const image = document.createElement('img');
    image.src = moment.image;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    const message = document.createElement('span');
    message.className = 'eddy-first-question-message eddy-first-question-message--writing eddy-first-question-message--writing-topic';
    message.lang = 'zh-Hant';
    if (typeof copy === 'string') message.textContent = copy;
    else {
      message.classList.add('eddy-first-question-message--writing-topic-headline');
      const headline = document.createElement('strong');
      const detail = document.createElement('span');
      headline.textContent = copy.main;
      detail.textContent = copy.sub;
      message.append(headline, detail);
    }
    art.append(image, message);
    button.append(art);
    overlay.append(button);
    overlay.addEventListener('click', dismiss);
    document.body.append(overlay);
    button.focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }

  document.addEventListener('edmund:writing-topic-selected', (event) => {
    pending = selectedKind(event.detail);
    if (pending) requestAnimationFrame(showIfReady);
  });
  document.addEventListener('edmund:writing-daily-dialogue-finished', showIfReady);
  document.addEventListener('edmund:eddy-global-dialogue-finished', showIfReady);
  document.addEventListener('visibilitychange', showIfReady);
  document.addEventListener('close', showIfReady, true);
})();
