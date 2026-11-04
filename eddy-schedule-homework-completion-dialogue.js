/* Eddy celebrates the first five completed, filled homework slots per calendar date. */
(() => {
  'use strict';

  const pagesByCount = {
    1: [
      ['eddy-schedule-homework-one.png', [
        '接下來嘛……先讓 Eddy 偷個懶吧！',
        '才完成第一個任務，就有點累了呢！',
        '嘿嘿，先休息一下吧！',
        '第一個任務順利完成了呢！辛苦啦！',
        '稍微休息一下，再一起出發吧！',
        '第一個任務完成！呼～先喘口氣吧！'
      ]]
    ],
    2: [
      ['eddy-schedule-homework-two.png', [
        '看來今天的狀態很不錯呢！就保持這股幹勁，繼續前進吧！',
        '哇！已經完成兩個任務了！看來今天也是幹勁十足的一天呢！',
        '第二個任務也順利完成啦！和您一起努力，果然很開心呢！',
        '好！第二個任務也成功突破了！這股氣勢可不能停下來呢！'
      ]],
      ['eddy-schedule-homework-two-break.png', [
        '今天這麼努力，當然要好好犒賞自己啦！去做點喜歡的事，開心一下吧！',
        '第二個任務完成！冒險也要懂得勞逸結合嘛！趁現在去做點喜歡的事吧！',
        '接下來是快樂的休息時間！想做什麼就做什麼吧！',
        '這麼努力，當然要給自己一點獎勵囉！'
      ]]
    ],
    3: [
      ['eddy-schedule-homework-three.png', [
        '太棒了！第三個任務也順利完成啦！\nEddy 都忍不住想為您歡呼了！',
        '看來今天的您特別有幹勁呢！',
        '等等！您該不會偷偷練習過吧？怎麼做起任務來這麼得心應手啊！',
        '這麼順利可不行啊！Eddy 都還沒來得及幫您加油呢！'
      ]],
      ['eddy-schedule-homework-three-celebrate.png', [
        '努力了這麼久，總該好好慶祝一下吧？今天想怎麼玩就怎麼玩！',
        '現在開始，誰也不准打擾我們慶祝！',
        '好好犒賞自己，開心地慶祝一番吧！'
      ]]
    ],
    4: [
      ['eddy-schedule-homework-four.png', [
        { main: '等、等一下！又完成一個了！？', sub: 'Eddy 的慶祝花樣都快用光啦！看來得趕快想點新招才行！' },
        '哎呀呀！照這個速度下去，Eddy 的掌聲都快不夠用了啦！',
        '鏘鏘鏘！第四個任務也搞定啦！\n這次就來個……超級豪華的空氣煙火秀！',
        '您是不是偷偷掌握了什麼祕訣啊？\n這麼厲害，Eddy 可得向您請教一下了！',
        '好！今天的任務清單又少了一項！嗯～這種一個個劃掉的感覺，真是太痛快了！'
      ]],
      ['eddy-schedule-homework-four-celebrate.png', [
        { main: '哇！這漢堡也太大了吧！', sub: '嘿嘿，努力了這麼久，就是要好好犒賞自己嘛！那麼……我開動啦！' },
        '第四個任務順利收工！接下來的挑戰是……一口氣吃掉這個超大漢堡！',
        '嘿嘿，這麼大一個漢堡，應該夠我們分著吃了吧？……咦？Eddy 已經吃掉一半了！？',
        '啊嗚！嗯～～！果然努力過後吃的漢堡，就是特別好吃呢！',
        '辛苦過後的大漢堡，才是最棒的獎勵！啊嗚！'
      ]]
    ],
    5: [
      ['eddy-schedule-homework-five.png', [
        { main: '今天還真是大豐收呢！', sub: '一口氣搞定了五個任務！看來剛才那個大漢堡，真的讓我們充滿幹勁了！' },
        '一、二、三、四、五……嗯！沒數錯！今天居然完成了整整五個任務！',
        '呼哇～總算搞定第五個任務了！今天的精彩程度，簡直可以寫成一本冒險日記呢！',
        '第五個任務也完成啦！……咦？怎麼覺得 Eddy 比您還興奮啊？'
      ]],
      ['eddy-schedule-homework-five-celebrate.png', [
        '嘿嘿，今天就用這座三明治塔來慶祝吧！……話說回來，這到底要從哪裡開始吃啊？',
        '哼哼！區區一座三明治塔，Eddy 當然吃得下！……喂喂喂！怎麼開始搖晃了！？',
        '好！今天要大吃一頓啦！一層、兩層、三層……哇啊啊！三明治要倒下來了！',
        '這麼高的三明治，可是 Eddy 的得意之作喔！……咦？怎麼有種不祥的預感？',
        '超豪華三明治塔，開動！……哇啊！等一下！別倒啊啊啊！'
      ]]
    ]
  };

  const queue = [];
  let overlay = null;
  let currentPages = [];
  let pageIndex = 0;
  let previousFocus = null;
  let dialogueAudio = null;

  function pick(options) {
    return options[Math.floor(Math.random() * options.length)];
  }

  function playDialogueSound() {
    try {
      if (localStorage.getItem('edmund-answer-sounds-v1') === 'off') return;
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      dialogueAudio ??= new Audio();
      if (dialogueAudio.state === 'suspended') dialogueAudio.resume();
      const now = dialogueAudio.currentTime;
      for (const [pitch, delay, duration, volume] of [[783.99, 0, .1, .03], [1046.5, .075, .16, .025]]) {
        const gain = dialogueAudio.createGain();
        gain.gain.setValueAtTime(.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(volume, now + delay + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, now + delay + duration);
        gain.connect(dialogueAudio.destination);
        const tone = dialogueAudio.createOscillator();
        tone.type = 'triangle';
        tone.frequency.setValueAtTime(pitch, now + delay);
        tone.connect(gain);
        tone.start(now + delay);
        tone.stop(now + delay + duration + .03);
      }
    } catch { /* Sound is optional when the browser blocks playback. */ }
  }

  function renderPage() {
    const [art, copy] = currentPages[pageIndex];
    overlay.querySelector('img').src = art;
    const message = overlay.querySelector('.eddy-first-question-message');
    message.classList.toggle('eddy-first-question-message--homework-headline', typeof copy !== 'string');
    if (typeof copy === 'string') message.textContent = copy;
    else {
      const headline = document.createElement('strong');
      const detail = document.createElement('span');
      headline.textContent = copy.main;
      detail.textContent = copy.sub;
      message.replaceChildren(headline, detail);
    }
    const spokenCopy = typeof copy === 'string' ? copy : `${copy.main} ${copy.sub}`;
    overlay.querySelector('button').setAttribute('aria-label', `${spokenCopy.replace(/\n/g, ' ')} 點擊、輕觸或按鍵繼續`);
  }

  function finish() {
    overlay?.remove();
    overlay = null;
    currentPages = [];
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
    if (queue.length) requestAnimationFrame(showNext);
    else document.dispatchEvent(new CustomEvent('edmund:schedule-homework-dialogues-finished'));
  }

  function advance() {
    if (!overlay) return;
    if (pageIndex < currentPages.length - 1) {
      pageIndex += 1;
      playDialogueSound();
      renderPage();
    } else {
      finish();
    }
  }

  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Escape') finish();
    else advance();
  }

  function showNext() {
    if (overlay || !queue.length || document.hidden || window.EdmundEddyGlobalDialogue?.isBlocking() || document.querySelector('dialog[open]')) return;
    const milestone = queue.shift();
    currentPages = pagesByCount[milestone.count].map(([art, options]) => [art, pick(options)]);
    pageIndex = 0;
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `Eddy 的第 ${milestone.count} 項功課完成提示`);
    overlay.innerHTML = '<button class="eddy-first-question-dismiss" type="button"><span class="eddy-first-question-art"><img alt="" aria-hidden="true"><span class="eddy-first-question-message eddy-first-question-message--homework-completed" lang="zh-Hant"></span></span></button>';
    overlay.addEventListener('click', advance);
    document.body.append(overlay);
    renderPage();
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }

  document.addEventListener('edmund:schedule-homework-completed', (event) => {
    const { studentId, milestones } = event.detail || {};
    if (typeof studentId !== 'string' || !studentId || !Array.isArray(milestones)) return;
    for (const milestone of milestones) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(milestone?.date) && pagesByCount[milestone.count]) {
        queue.push({ date: milestone.date, count: milestone.count });
      }
    }
    requestAnimationFrame(showNext);
  });
  document.addEventListener('edmund:eddy-global-dialogue-finished', showNext);
  document.addEventListener('visibilitychange', showNext);
  document.addEventListener('close', showNext, true);
})();
