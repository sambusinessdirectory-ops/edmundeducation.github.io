/* Eddy welcomes untouched first questions and encourages students at milestones. */
(() => {
  'use strict';
  const message = 'Eddy 已準備好 與您一同迎接勇者的試煉！';
  const milestoneTitle = '不知不覺已經來到第 10 關了呢！';
  const milestoneSubtitle = 'Eddy 也越來越有幹勁了！一起繼續前進吧！';
  const twentiethTitle = '好！第 20 關！Eddy 已經做好準備了！';
  const twentiethSubtitle = '不管遇到什麼挑戰，都儘管放馬過來吧！';
  const thirtiethLineOne = '終於來到第 30 關了呢！';
  const thirtiethLineTwo = '總覺得前方還有更厲害的挑戰在等著我們……真讓人期待啊！';
  let activeKey = '';
  let overlay = null;
  let previousFocus = null;
  let scheduled = false;

  const visible = (element) => !!element && element.getClientRects().length > 0;
  const number = (value) => Number(String(value || '').match(/\d+/)?.[0]);
  const question = (root, selector, target) => [...(root?.querySelectorAll(selector) || [])].find((item) => number(item.textContent) === target);
  const signature = (kind, root, first) => `${kind}:${root.querySelector('h2')?.textContent?.trim() || ''}:${first?.getAttribute('data-question-id') || first?.textContent?.trim().slice(0, 100) || ''}`;

  function eligible() {
    const path = location.pathname.split('/').pop();
    if (['sentence-structure.html', 'idiom-system.html', 'proverb-system.html', 'phrasal-verb-system.html'].includes(path)) {
      const root = document.querySelector('.exercise-page');
      const progress = root?.querySelector('.exercise-progress-label');
      if (!visible(root)) return null;
      const completed = number(progress?.textContent);
      if (completed === 0) {
        const first = root.querySelector('.question-card .question-number');
        return number(first?.textContent) === 1
          ? { key: signature(path, root, first.closest('.question-card')), stage: 1 } : null;
      }
      if ([9, 19, 29].includes(completed)) {
        const stage = completed + 1;
        const card = question(root, '.question-card .question-number', stage)?.closest('.question-card');
        return card && !card.classList.contains('is-correct')
          ? { key: `${stage}:${signature(path, root, card)}`, stage } : null;
      }
      return null;
    }
    if (path === 'synonyms-system.html') {
      const root = document.querySelector('.syn-play');
      const position = root?.querySelector('.syn-play-nav span')?.textContent || '';
      const progress = document.querySelector('.syn-progress');
      const current = Number(position.match(/^QUESTION\s+(\d+)\s*\/\s*\d+/i)?.[1]);
      if (!visible(root) || ![1, 10, 20, 30].includes(current) || root.querySelector('.syn-feedback')) return null;
      if (current === 1 && progress?.getAttribute('aria-valuenow') !== '0') return null;
      return { key: `${path}:${current}:${document.querySelector('.syn-global-nav')?.textContent?.trim()}:${root.querySelector('.syn-original p')?.textContent?.trim()}`, stage: current };
    }
    if (path === 'polysemy-lab.html') {
      const root = document.querySelector('[data-practice]');
      const toolbar = root?.querySelector('.practice-toolbar p')?.textContent || '';
      const progress = root?.querySelector('#practice-progress');
      const current = Number(toolbar.match(/^第\s*(\d+)\s*題/)?.[1]);
      if (!visible(root) || ![1, 10, 20, 30].includes(current) || root.querySelector('.feedback')) return null;
      if (current === 1 && progress?.value !== 0) return null;
      return { key: `${path}:${current}:${document.querySelector('.module-heading h1')?.textContent?.trim()}:${root.querySelector('.sentence')?.textContent?.trim()}`, stage: current };
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
        if ([expectedFirst, expectedFirst + 9, expectedFirst + 19, expectedFirst + 29].includes(current) && selected && firstNumber === expectedRange
            && (current !== expectedFirst || progress?.getAttribute('aria-valuenow') === '0')
            && (current === expectedFirst || selected.dataset.state !== 'correct')) {
          return { key: `${path}:${kind}:${current}:${root.querySelector('.grammar-question__prompt')?.textContent?.trim()}`, stage: current - expectedFirst + 1 };
        }
      }
      return null;
    }
    if (/^reading-logic-exercise-\d+\.html$/.test(path)) {
      const root = document.querySelector('.logic-question-wrap');
      const first = document.querySelector('.logic-map-node[data-question="0"]');
      const tenth = document.querySelector('.logic-map-node[data-question="9"]');
      const twentieth = document.querySelector('.logic-map-node[data-question="19"]');
      const thirtieth = document.querySelector('.logic-map-node[data-question="29"]');
      const progress = document.querySelector('.logic-map-top strong')?.textContent || '';
      if (!visible(root)) return null;
      if (first?.getAttribute('aria-current') === 'true' && /^已完成\s*0\s*\/\s*\d+/.test(progress))
        return { key: `${path}:1:${root.querySelector('.logic-question-en')?.textContent?.trim()}`, stage: 1 };
      if (tenth?.getAttribute('aria-current') === 'true' && !tenth.classList.contains('is-solved'))
        return { key: `${path}:10:${root.querySelector('.logic-question-en')?.textContent?.trim()}`, stage: 10 };
      if (twentieth?.getAttribute('aria-current') === 'true' && !twentieth.classList.contains('is-solved'))
        return { key: `${path}:20:${root.querySelector('.logic-question-en')?.textContent?.trim()}`, stage: 20 };
      if (thirtieth?.getAttribute('aria-current') === 'true' && !thirtieth.classList.contains('is-solved'))
        return { key: `${path}:30:${root.querySelector('.logic-question-en')?.textContent?.trim()}`, stage: 30 };
    }
    return null;
  }

  function dismiss() {
    overlay?.remove();
    overlay = null;
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  }
  function onKey(event) {
    if (!['Enter', ' ', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    dismiss();
  }
  function show(stage) {
    const title = stage === 30 ? thirtiethLineOne : stage === 20 ? twentiethTitle : milestoneTitle;
    const subtitle = stage === 30 ? thirtiethLineTwo : stage === 20 ? twentiethSubtitle : milestoneSubtitle;
    const spokenMessage = stage === 1 ? message : `${title} ${subtitle}`;
    const art = stage === 30 ? 'eddy-thirtieth-question-dialogue.png' : stage === 20 ? 'eddy-twentieth-question-dialogue.png' : stage === 10 ? 'eddy-tenth-question-dialogue.png' : 'eddy-first-question-dialogue.png';
    const dialogue = stage === 30 ? `<span>${title}</span><span>${subtitle}</span>`
      : stage === 20 ? `<strong>${title}</strong><span>不管遇到什麼挑戰，都儘管放<span class="eddy-horse-pun">馬</span>過來吧！</span>`
      : stage === 10 ? `<strong>${title}</strong><span>${subtitle}</span>` : message;
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 的練習提示');
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button" aria-label="${spokenMessage} 點擊、輕觸或按鍵繼續"><span class="eddy-first-question-art"><img src="${art}" alt="" aria-hidden="true"><span class="eddy-first-question-message${stage !== 1 ? ' eddy-first-question-message--milestone' : ''}${stage === 30 ? ' eddy-first-question-message--uniform' : ''}" lang="zh-Hant">${dialogue}</span></span></button>`;
    overlay.addEventListener('click', dismiss);
    document.body.append(overlay);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }
  function check() {
    scheduled = false;
    const match = eligible();
    if (!match) { activeKey = ''; return; }
    if (match.key !== activeKey) { activeKey = match.key; dismiss(); show(match.stage); }
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(check); }
  }
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'aria-current', 'aria-valuenow'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
})();
