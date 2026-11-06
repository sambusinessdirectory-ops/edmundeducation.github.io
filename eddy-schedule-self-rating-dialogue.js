/* React to a student's selected daily self-evaluation rating. */
(() => {
  'use strict';
  const greetings = {
    motivation: { ratings: [1, 2], image: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-low-motivation-dialogue.png', lines: [
      { main: '唔～今天怎麼就是提不起勁呢……', sub: '明明有好多事情想做，身體卻一點都不想動……算啦，先從簡單的開始吧！' },
      '奇怪……Eddy 的幹勁跑去哪裡了？明明昨天還在這裡的說……',
      '唔～今天什麼都不太想做呢……要是幹勁也能像點心一樣，吃一口就補滿就好了！',
      '哼……今天好像不太有幹勁呢。不過，總不能一直這樣下去吧……先試試看好了！',
      '嗯……今天好像少了點平常的衝勁呢。偶爾也會有這樣的日子吧。',
      '好！今天也要拿出幹勁！……唔，奇怪？怎麼喊完還是一點力氣都沒有啊？',
      '唉～今天的幹勁好像請假去了……'
    ] },
    'high-motivation': { ratings: [4, 5], image: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-high-motivation-dialogue.png', lines: [
      { main: '好！今天有好多事情想做呢！', sub: '光是想想就興奮得坐不住啦！嘿嘿，該從哪件事開始好呢？' },
      '哼哼！今天的幹勁可是源源不絕喔！有什麼想做的事，就儘管放馬過來吧！',
      '啊！想到啦！今天有好多點子想試試看！嘿嘿，光是坐在這裡可不行！',
      '好！今天想挑戰的事情可多呢！不知道會有什麼新發現，真讓人期待！',
      '唔喔喔！今天不知道為什麼，整個人都充滿幹勁！再不開始做點什麼，可要憋不住啦！',
      '嘿嘿，今天的 Eddy 可是幹勁十足！不管是什麼任務，都想親自試試看呢！',
      '好！今天的幹勁滿到快溢出來啦！'
    ] },
    stress: { ratings: [1, 2], image: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-low-stress-dialogue.png', lines: [
      { main: '呼～最近的日子還挺悠哉的嘛！', sub: '趁現在好好保養一下……嗯～這冰冰涼涼的小黃瓜，真舒服啊！' },
      '嗯哼～偶爾也要享受一下貴賓級的待遇嘛！來，再幫 Eddy 敷兩片小黃瓜～',
      '嗯～小黃瓜敷在臉上真舒服……不過，敷完之後還能拿來吃嗎？',
      '沒什麼煩惱的日子真好呢……啊～真希望時間能停在這一刻！',
      '噓～Eddy 正在進行重要的保養時間！這可是維持帥氣的祕訣喔！',
      '嘿嘿，今天心情這麼好，不好好享受一下怎麼行？唔～真舒服！',
      '嗯～小黃瓜冰冰涼涼的……這才叫享受嘛！'
    ] },
    concentration: { ratings: [1, 2], image: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-low-concentration-dialogue.png', lines: [
      { main: '唔～腦袋怎麼暈呼呼的……', sub: '剛剛明明還在想一件很重要的事……咦？我到底在想什麼來著？' },
      '好！集中精神……集中精神……嗯？說到集中，午餐要吃什麼好呢？',
      '嗚哇～眼前的字怎麼開始轉圈圈啦！不行不行，得先讓腦袋休息一下……',
      '一、二、三……咦？數到哪裡了？算了，從頭再來……一、二……',
      '奇怪……Eddy 的腦袋明明還在這裡，注意力卻不知道跑去哪裡玩了！',
      '嗯！Eddy 正在非常認真地思考……非常認真……呃，剛剛要做什麼來著？',
      '唔～腦袋一片空白……注意力都跑光光啦！'
    ] },
    'attention-span': { ratings: [1, 2], image: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-low-attention-dialogue.png', lines: [
      { main: '好！這次一定要認真做到最後！', sub: '……唔，才過一下下而已，怎麼就想換別的事情做了啦！？' },
      '好！開始吧！……嗯，差不多了！接下來要玩什麼呢？',
      '唔～怎麼才過幾分鐘，就覺得坐不住了呢？好想起來走走喔！',
      '一分鐘、兩分鐘、三分鐘……呼！Eddy 已經很努力了耶！可以休息了嗎？',
      '嗯嗯，這個還挺有意思的嘛！……咦？那邊好像有更好玩的東西耶！',
      '要一直做同一件事，好像有點難呢……不然先做五分鐘，再休息一下？嘿嘿！',
      '咦？才剛開始，Eddy 就想換下一件事了！？'
    ] },
    confidence: { ratings: [4, 5], image: 'https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-high-confidence-dialogue.png', lines: [
      { main: '哼哼！今天總覺得自己特別厲害呢！', sub: '不管遇到什麼挑戰，Eddy 都有信心能漂亮地搞定！來吧，儘管放馬過來！' },
      '嘿嘿，今天的 Eddy 可不一樣喔！總覺得不管做什麼，都能順順利利呢！',
      '好！今天就讓你見識一下 Eddy 的真本事！什麼難關都別想攔住我！',
      '哼哼！今天可是 Eddy 的主場！……咦？你問我哪來的自信？嘿嘿，秘密！',
      '嗯！今天狀態真不錯。感覺不管遇到什麼事，都能好好應付呢！',
      '嘿嘿，今天的 Eddy 可是信心滿滿！說不定連平常做不到的事，都能一口氣完成呢！',
      '哼哼！今天的 Eddy，可是誰都擋不住的喔！'
    ] }
  };
  const queue = [];
  const shown = new Set();
  let overlay = null;
  let previousFocus = null;
  const storagePrefix = 'edmund-eddy-self-rating-v1:';
  function sessionStudentId() {
    try { const session = JSON.parse(sessionStorage.getItem('edmund-schedule-session-v1') || 'null'); return session?.role === 'student' ? String(session.id) : null; }
    catch { return null; }
  }
  function stored(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function remember(key) { shown.add(key); try { localStorage.setItem(key, 'shown'); } catch { /* Memory still deduplicates this page. */ } }
  function setHorsePun(node, value) {
    const at = value.indexOf('放馬過來');
    if (at < 0) { node.textContent = value; return; }
    const horse = document.createElement('span');
    horse.className = 'eddy-horse-pun';
    horse.textContent = '馬';
    node.replaceChildren(value.slice(0, at + 1), horse, value.slice(at + 2));
  }
  function finish() {
    overlay?.remove(); overlay = null;
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected && !previousFocus.inert) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
    requestAnimationFrame(showNext);
  }
  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault(); event.stopImmediatePropagation(); finish();
  }
  function showNext() {
    if (overlay || !queue.length || document.hidden || window.EdmundEddyGlobalDialogue?.isBlocking()
      || document.querySelector('dialog[open], .eddy-first-question-overlay')) return;
    const calendar = document.querySelector('[data-view="calendar"]');
    if (!calendar || calendar.hidden) return;
    while (queue.length) {
      const item = queue.shift();
      if (sessionStudentId() !== item.studentId || shown.has(item.key) || stored(item.key)) continue;
      const greeting = item.metric === 'motivation' && item.rating >= 4 ? greetings['high-motivation'] : greetings[item.metric];
      const copy = greeting.lines[Math.floor(Math.random() * greeting.lines.length)];
      previousFocus = document.activeElement;
      overlay = document.createElement('div');
      overlay.className = 'eddy-first-question-overlay eddy-self-rating-overlay';
      overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', `Eddy 的${item.metric}自評回應`);
      overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button"><span class="eddy-first-question-art"><img src="${greeting.image}" alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-first-question-message--schedule-two-day" lang="zh-Hant"></span></span></button>`;
      const message = overlay.querySelector('.eddy-first-question-message');
      if (typeof copy === 'string') setHorsePun(message, copy);
      else {
        message.classList.add('eddy-first-question-message--schedule-two-day-headline');
        const main = document.createElement('strong'); const sub = document.createElement('span');
        setHorsePun(main, copy.main); setHorsePun(sub, copy.sub); message.replaceChildren(main, sub);
      }
      overlay.querySelector('button').setAttribute('aria-label', `${typeof copy === 'string' ? copy : `${copy.main} ${copy.sub}`} 點擊、輕觸或按鍵關閉`);
      overlay.addEventListener('click', finish);
      document.body.append(overlay); remember(item.key);
      overlay.querySelector('button').focus({ preventScroll: true });
      document.addEventListener('keydown', onKey, true);
      break;
    }
  }
  document.addEventListener('edmund:schedule-self-rating-selected', (event) => {
    const { studentId, date, metric, rating } = event.detail || {};
    if (typeof studentId !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !greetings[metric]) return;
    const key = `${storagePrefix}${studentId}:${date}:${metric}`;
    for (let i = queue.length - 1; i >= 0; i--) if (queue[i].key === key) queue.splice(i, 1);
    const selected = metric === 'motivation' && Number(rating) >= 4 ? greetings['high-motivation'] : greetings[metric];
    if (!selected.ratings.includes(Number(rating))) return;
    queue.push({ studentId, date, metric, rating: Number(rating), key });
    requestAnimationFrame(showNext);
  });
  document.addEventListener('edmund:eddy-global-dialogue-finished', showNext);
  document.addEventListener('visibilitychange', showNext);
  document.addEventListener('close', showNext, true);
  new MutationObserver(showNext).observe(document.body, { childList: true });
})();
