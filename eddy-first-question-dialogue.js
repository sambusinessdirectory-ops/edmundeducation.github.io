/* Eddy welcomes untouched first questions and encourages students at milestones. */
(() => {
  'use strict';
  const message = 'Eddy 已準備好 與您一同迎接勇者的試煉！';
  const milestoneSubtitle = 'Eddy 也越來越有幹勁了！一起繼續前進吧！';
  const twentiethSubtitle = '不管遇到什麼挑戰，都儘管放馬過來吧！';
  const thirtiethLineTwo = '總覺得前方還有更厲害的挑戰在等著我們……真讓人期待啊！';
  const fortiethLineTwo = 'Eddy 可還有滿滿的幹勁呢！';
  const finalIntro = (total) => [
    ['eddy-fiftieth-face-1.png', '哼哼哼……\n實驗終於進行到最後階段了！'],
    ['eddy-fiftieth-face-2.png', `沒錯！這 ${total} 關全都是 Eddy 的心血結晶！`],
    ['eddy-fiftieth-face-3.png', '那麼，就讓我看看您的最終成果吧！']
  ];
  const fiftiethVictory = [
    ['eddy-fiftieth-face-4.png', '什麼——！？居然有人突破了我設計的全部關卡！'],
    ['eddy-fiftieth-face-5.png', '哼哼……好吧！這次就算您贏了！\n這座獎盃可是 Eddy 特別準備的喔！好好珍惜吧！']
  ];
  let activeKey = '';
  let overlay = null;
  let previousFocus = null;
  let scheduled = false;
  let activeStage = 0;
  let dialogueStep = 0;
  let dialogueAudio = null;
  const completedScopes = new Set();
  const observedProgress = new Map();
  let activeOrdinal = 0;
  let activeTotal = 0;

  const visible = (element) => !!element && element.getClientRects().length > 0;
  const number = (value) => Number(String(value || '').match(/\d+/)?.[0]);
  const question = (root, selector, target) => [...(root?.querySelectorAll(selector) || [])].find((item) => number(item.textContent) === target);
  const signature = (kind, root, first) => `${kind}:${root.querySelector('h2')?.textContent?.trim() || ''}:${first?.getAttribute('data-question-id') || first?.textContent?.trim().slice(0, 100) || ''}`;
  const progressCounts = (value) => {
    const match = String(value || '').match(/已完成\s*(\d+)\s*\/\s*(\d+)/);
    return match ? { completed: Number(match[1]), total: Number(match[2]) } : null;
  };
  // Round fractional checkpoints up; for short exercises, the first question wins ties,
  // followed by the latest percentage checkpoint at each remaining question.
  function milestone(ordinal, total) {
    if (!Number.isInteger(ordinal) || !Number.isInteger(total) || ordinal < 1 || total < 1 || ordinal > total) return 0;
    if (ordinal === 1) return 1;
    return [100, 80, 60, 40, 20].find((percent) => ordinal === Math.ceil(total * percent / 100)) || 0;
  }
  function currentFinalScope() {
    const path = location.pathname.split('/').pop();
    if (['sentence-structure.html', 'idiom-system.html', 'proverb-system.html', 'phrasal-verb-system.html'].includes(path))
      return `${path}:${document.querySelector('.exercise-page .question-card')?.dataset.questionId || ''}`;
    if (path === 'synonyms-system.html') return `${path}:${document.querySelector('.syn-global-nav')?.textContent?.trim() || ''}`;
    if (path === 'polysemy-lab.html') return `${path}:${document.querySelector('.module-heading h1')?.textContent?.trim() || ''}`;
    if (path === 'grammar-system.html') {
      const kind = ['[data-grammar-practice]', '[data-articles-practice]', '[data-advanced-articles-practice]'].find((selector) => visible(document.querySelector(selector)));
      return `${path}:${kind || ''}`;
    }
    return path;
  }

  function eligible() {
    const path = location.pathname.split('/').pop();
    if (['sentence-structure.html', 'idiom-system.html', 'proverb-system.html', 'phrasal-verb-system.html'].includes(path)) {
      const root = document.querySelector('.exercise-page');
      const progress = root?.querySelector('.exercise-progress-label');
      if (!visible(root)) return null;
      const counts = progressCounts(progress?.textContent);
      if (!counts?.total) return null;
      const ordinal = counts.completed + 1;
      const stage = milestone(ordinal, counts.total);
      if (stage === 1) {
        const first = root.querySelector('.question-card');
        return first ? { key: signature(path, root, first), stage, ordinal, total: counts.total } : null;
      }
      if (stage) {
        const card = question(root, '.question-card .question-number', ordinal)?.closest('.question-card')
          || root.querySelectorAll('.question-card')[ordinal - 1];
        return card && !card.classList.contains('is-correct')
          ? { key: `${stage}:${signature(path, root, card)}`, stage, ordinal, total: counts.total } : null;
      }
      return null;
    }
    if (path === 'synonyms-system.html') {
      const root = document.querySelector('.syn-play');
      const position = root?.querySelector('.syn-play-nav span')?.textContent || '';
      const progress = document.querySelector('.syn-progress');
      const current = Number(position.match(/^QUESTION\s+(\d+)\s*\/\s*\d+/i)?.[1]);
      const total = Number(progress?.getAttribute('aria-valuemax'));
      const stage = milestone(current, total);
      if (!visible(root) || !stage || root.querySelector('.syn-feedback')) return null;
      if (current === 1 && progress?.getAttribute('aria-valuenow') !== '0') return null;
      return { key: `${path}:${current}:${document.querySelector('.syn-global-nav')?.textContent?.trim()}:${root.querySelector('.syn-original p')?.textContent?.trim()}`, stage, ordinal: current, total };
    }
    if (path === 'polysemy-lab.html') {
      const root = document.querySelector('[data-practice]');
      const toolbar = root?.querySelector('.practice-toolbar p')?.textContent || '';
      const progress = root?.querySelector('#practice-progress');
      const current = Number(toolbar.match(/^第\s*(\d+)\s*題/)?.[1]);
      const total = progress?.max;
      const stage = milestone(current, total);
      if (!visible(root) || !stage || root.querySelector('.feedback')) return null;
      if (current === 1 && progress?.value !== 0) return null;
      return { key: `${path}:${current}:${document.querySelector('.module-heading h1')?.textContent?.trim()}:${root.querySelector('.sentence')?.textContent?.trim()}`, stage, ordinal: current, total };
    }
    if (path === 'grammar-system.html') {
      const types = [
        ['tense', '[data-grammar-practice]', '[data-question-number]', '[data-question-grid]'],
        ['articles', '[data-articles-practice]', '[data-articles-number]', '[data-articles-grid]'],
        ['advanced-articles', '[data-advanced-articles-practice]', '[data-advanced-articles-number]', '[data-advanced-articles-grid]']
      ];
      for (const [kind, rootSelector, numberSelector, gridSelector] of types) {
        const root = document.querySelector(rootSelector);
        if (!visible(root)) continue;
        const current = number(root.querySelector(numberSelector)?.textContent);
        const selected = root.querySelector(`${gridSelector} [aria-current="true"]`);
        const first = root.querySelector(`${gridSelector} button`);
        const firstNumber = number(first?.textContent);
        const expectedFirst = kind === 'advanced-articles' ? 151 : 1;
        const expectedRange = expectedFirst + Math.floor((current - expectedFirst) / 25) * 25;
        const progress = root.querySelector('.grammar-progress');
        const ordinal = current - expectedFirst + 1;
        const total = Number(progress?.getAttribute('aria-valuemax'));
        const stage = milestone(ordinal, total);
        if (stage && selected && firstNumber === expectedRange
            && (ordinal !== 1 || progress?.getAttribute('aria-valuenow') === '0')
            && (ordinal === 1 || selected.dataset.state !== 'correct')) {
          return { key: `${path}:${kind}:${current}:${root.querySelector('.grammar-question__prompt')?.textContent?.trim()}`, stage, ordinal, total };
        }
      }
      return null;
    }
    if (/^reading-logic-exercise-\d+\.html$/.test(path)) {
      const root = document.querySelector('.logic-question-wrap');
      const progress = document.querySelector('.logic-map-top strong')?.textContent || '';
      if (!visible(root)) return null;
      const total = progressCounts(progress)?.total;
      const selected = document.querySelector('.logic-map-node[aria-current="true"]');
      const ordinal = Number(selected?.dataset.question) + 1;
      const stage = milestone(ordinal, total);
      if (stage && !selected.classList.contains('is-solved') && (stage !== 1 || progressCounts(progress)?.completed === 0))
        return { key: `${path}:${ordinal}:${root.querySelector('.logic-question-en')?.textContent?.trim()}`, stage, ordinal, total };
    }
    return null;
  }

  function dismiss() {
    overlay?.remove();
    overlay = null;
    activeStage = 0;
    dialogueStep = 0;
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
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
    } catch { /* Audio is optional when the browser blocks playback. */ }
  }
  function advance() {
    if (activeStage === 100 || activeStage === 'victory') {
      const pages = activeStage === 100 ? finalIntro(activeTotal) : fiftiethVictory;
      if (dialogueStep < pages.length - 1) {
        dialogueStep += 1;
        playDialogueSound();
        const [art, copy] = pages[dialogueStep];
        const button = overlay?.querySelector('button');
        const image = overlay?.querySelector('img');
        const message = overlay?.querySelector('.eddy-first-question-message');
        if (image) image.src = art;
        if (message) message.textContent = copy;
        if (button) button.setAttribute('aria-label', `${copy.replace(/\n/g, ' ')} 點擊、輕觸或按鍵繼續`);
        return;
      }
    }
    if (activeStage === 80 && dialogueStep === 0) {
      dialogueStep = 1;
      playDialogueSound();
      const button = overlay?.querySelector('button');
      const copy = overlay?.querySelector('.eddy-first-question-message');
      if (copy) copy.textContent = fortiethLineTwo;
      if (button) button.setAttribute('aria-label', `${fortiethLineTwo} 點擊、輕觸或按鍵繼續`);
      return;
    }
    dismiss();
  }
  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Escape') dismiss();
    else advance();
  }
  function show(stage, ordinal = activeOrdinal, total = activeTotal) {
    const sequence = stage === 100 ? finalIntro(total) : stage === 'victory' ? fiftiethVictory : null;
    const title = stage === 60 ? `終於來到第 ${ordinal} 關了呢！` : stage === 40 ? `好！第 ${ordinal} 關！Eddy 已經做好準備了！` : `不知不覺已經來到第 ${ordinal} 關了呢！`;
    const subtitle = stage === 60 ? thirtiethLineTwo : stage === 40 ? twentiethSubtitle : milestoneSubtitle;
    const fortiethLineOne = `什麼！？已經第 ${ordinal} 關了嗎！離終點只剩 ${total - ordinal} 關了！`;
    const spokenMessage = sequence ? sequence[0][1] : stage === 80 ? fortiethLineOne : stage === 1 ? message : `${title} ${subtitle}`;
    const art = sequence ? sequence[0][0] : stage === 80 ? 'eddy-fortieth-question-dialogue.png' : stage === 60 ? 'eddy-thirtieth-question-dialogue.png' : stage === 40 ? 'eddy-twentieth-question-dialogue.png' : stage === 20 ? 'eddy-tenth-question-dialogue.png' : 'eddy-first-question-dialogue.png';
    const dialogue = sequence ? sequence[0][1] : stage === 80 ? fortiethLineOne : stage === 60 ? `<span>${title}</span><span>${subtitle}</span>`
      : stage === 40 ? `<strong>${title}</strong><span>不管遇到什麼挑戰，都儘管放<span class="eddy-horse-pun">馬</span>過來吧！</span>`
      : stage === 20 ? `<strong>${title}</strong><span>${subtitle}</span>` : message;
    activeStage = stage;
    activeOrdinal = ordinal;
    activeTotal = total;
    if (stage === 'victory') completedScopes.add(currentFinalScope());
    dialogueStep = 0;
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 的練習提示');
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button" aria-label="${spokenMessage.replace(/\n/g, ' ')} 點擊、輕觸或按鍵繼續"><span class="eddy-first-question-art"><img src="${art}" alt="" aria-hidden="true"><span class="eddy-first-question-message${[20, 40, 60].includes(stage) ? ' eddy-first-question-message--milestone' : ''}${stage === 60 ? ' eddy-first-question-message--uniform' : ''}${stage === 80 ? ' eddy-first-question-message--fortieth' : ''}${sequence ? ' eddy-first-question-message--fiftieth' : ''}" lang="zh-Hant"${stage === 80 || sequence ? ' role="status" aria-live="polite"' : ''}>${dialogue}</span></span></button>`;
    overlay.addEventListener('click', advance);
    document.body.append(overlay);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }
  function check() {
    scheduled = false;
    const snapshot = completionSnapshot();
    if (snapshot) {
      const previous = observedProgress.get(snapshot.scope);
      observedProgress.set(snapshot.scope, snapshot);
      if (snapshot.completed < snapshot.total) completedScopes.delete(snapshot.scope);
      if (previous && previous.total === snapshot.total && previous.completed < snapshot.total
          && snapshot.completed === snapshot.total && snapshot.verified && !completedScopes.has(snapshot.scope) && activeStage === 0) {
        activeKey = '';
        show('victory', snapshot.total, snapshot.total);
        return;
      }
    }
    const match = eligible();
    if (!match) { activeKey = ''; return; }
    if (match.key !== activeKey) { activeKey = match.key; dismiss(); show(match.stage, match.ordinal, match.total); }
  }
  function completionSnapshot() {
    const path = location.pathname.split('/').pop();
    if (['sentence-structure.html', 'idiom-system.html', 'proverb-system.html', 'phrasal-verb-system.html'].includes(path)) {
      const root = document.querySelector('.exercise-page');
      const counts = progressCounts(root?.querySelector('.exercise-progress-label')?.textContent);
      return visible(root) && counts?.total ? { ...counts, scope: currentFinalScope(), verified: true } : null;
    }
    if (/^reading-logic-exercise-\d+\.html$/.test(path)) {
      if (!visible(document.querySelector('.logic-question-wrap'))) return null;
      const counts = progressCounts(document.querySelector('.logic-map-top strong')?.textContent);
      return counts?.total ? { ...counts, scope: currentFinalScope(), verified: true } : null;
    }
    if (path === 'polysemy-lab.html') {
      const root = document.querySelector('[data-practice]');
      const progress = root?.querySelector('#practice-progress');
      return visible(root) && progress?.max ? { completed: progress.value, total: progress.max, scope: currentFinalScope(), verified: !!root.querySelector('.feedback:not(.wrong)') } : null;
    }
    return null;
  }
  document.addEventListener('edmund:eddy-module-complete', () => {
    if (completedScopes.has(currentFinalScope())) return;
    dismiss();
    show('victory');
  });
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(check); }
  }
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'aria-current', 'aria-valuenow'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
})();
