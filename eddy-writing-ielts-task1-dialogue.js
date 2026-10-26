/* React to an explicitly selected IELTS Task 1 visual question. */
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
    },
    bars: {
      image: 'eddy-writing-ielts-bars-dialogue.png',
      label: 'Eddy 的 IELTS 柱狀圖寫作提示',
      variants: [
        { main: '嗯嗯……這邊高一點，那邊低一點……', sub: '咦！？等等！這根柱子怎麼特別高啊！？到底發生了什麼事？' },
        '哦哦！原來是這麼一回事！……咦？不對，這個數字怎麼怪怪的？',
        '嘿嘿，這根柱子一路領先呢！不知道其他幾根有沒有機會追上它啊？',
        '哇！高高低低的，看起來就像一座座山峰呢！……啊，差點忘了這是統計圖！',
        '光看數字還沒什麼感覺，畫成圖之後，差別一下子就看出來了呢！',
        '原來如此……從這張圖來看，結果已經很明顯了！……呃，X-axis 是什麼意思來著？'
      ]
    },
    tables: {
      image: 'eddy-writing-ielts-tables-dialogue.png',
      label: 'Eddy 的 IELTS 表格寫作提示',
      variants: [
        { main: '嗯嗯……這一欄是這個，那一列是那個……', sub: '咦？等等！這個數字怎麼跟其他的不太一樣？該不會發現什麼祕密了吧！' },
        '好，先看這一列，再往右邊……咦？我剛剛看到第幾行了？',
        '哼哼……只要仔細比對，一定能找出線索！……啊！原來只是看錯欄了！',
        '交給 Eddy 吧！這種表格，三兩下就能看懂！……呃，這裡的空格是什麼意思？',
        '一格、兩格、三格……嗯？這麼多小格子，簡直像一座迷宮嘛！',
        '等等……這一格的數字是不是偷偷跑錯地方了？',
        '哦哦！把資料排得整整齊齊的，果然一下子就看出差別了呢！'
      ]
    },
    pies: {
      image: 'eddy-writing-ielts-pies-dialogue.png',
      label: 'Eddy 的 IELTS 圓餅圖寫作提示',
      variants: [
        { main: '嗯嗯……這一塊占了最大比例……', sub: '……等等！盯著這張圖看久了，怎麼突然好想吃披薩啊！？' },
        '一塊、兩塊、三塊……咦？這麼大一塊，是誰偷偷切走的啊？',
        '嘿嘿，這塊占的比例最大呢！如果是蛋糕的話，Eddy 一定要選這塊！',
        '哦哦！原來只要把圓切成幾塊，就能看出各自占了多少呢！真有意思！',
        '要是這張圓餅圖真的能吃就好了……嘿嘿，Eddy 已經想好要先吃哪一塊了！',
        '嗯？全部加起來剛好是百分之百……那 Eddy 想再多吃一塊，該怎麼辦啊？'
      ]
    },
    lines: {
      image: 'eddy-writing-ielts-lines-dialogue.png',
      label: 'Eddy 的 IELTS 折線圖寫作提示',
      variants: [
        { main: '哦哦！這條線一路往上衝耶！', sub: '咻——！哇啊！怎麼突然又掉下來了！？簡直像在坐雲霄飛車嘛！' },
        '加油、加油！再往上一點！……啊啊！怎麼偏偏在這裡掉下來啦！',
        '先爬上這座山，再越過那個山谷……嘿嘿，這張圖根本就是冒險路線嘛！',
        '嗯嗯，走勢一直很穩定呢……咦！？最後這個急轉彎是怎麼回事！？',
        '原來如此……雖然中間有起有落，不過整體還是在慢慢往上爬呢！',
        '喂喂！別在這裡停下來啊！再往上一點嘛！……咦？我怎麼開始幫線條加油了？'
      ]
    },
    mixed: {
      image: 'eddy-writing-ielts-mixed-dialogue.png',
      label: 'Eddy 的 IELTS 混合圖表寫作提示',
      variants: [
        '這邊的柱子越來越高，那邊的線卻往下跑……咦？你們兩個到底有沒有商量好啊！？',
        { main: '哦哦！柱子跟線條竟然一起出現了！', sub: '等等……所以我該先看哪一邊啊！？眼睛都快忙不過來啦！' },
        '哼哼……把兩種圖放在一起，一定藏著什麼重要的線索！讓 Eddy 仔細瞧瞧……',
        '原來圖表還能這樣搭配啊！嘿嘿，那再加一張圓餅圖進去會怎麼樣呢？',
        '原來如此！把不同的資料放在一起比較，就能發現平常沒注意到的事情呢！',
        '柱子隊和線條隊都登場啦！究竟哪一邊的表現比較亮眼呢？真讓人期待！',
        '柱子跟線條一起上場！？這張圖也太熱鬧了吧！'
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
    if (/\bBar Charts?\b/i.test(detail)) return 'bars';
    if (/\bTables?\b/i.test(detail)) return 'tables';
    if (/\bPie Charts?\b/i.test(detail)) return 'pies';
    if (/\bLine Graph\b/i.test(detail)) return 'lines';
    if (/\bMixed Charts?\b/i.test(detail)) return 'mixed';
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
