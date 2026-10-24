/* Eddy welcomes untouched first questions and encourages students at question ten. */
(() => {
  'use strict';
  const message = 'Eddy 已準備好 與您一同迎接勇者的試煉！';
  const milestoneTitle = '不知不覺已經來到第 10 關了呢！';
  const milestoneSubtitle = 'Eddy 也越來越有幹勁了！一起繼續前進吧！';
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
          ? { key: signature(path, root, first.closest('.question-card')), milestone: false } : null;
      }
      if (completed === 9) {
        const tenth = question(root, '.question-card .question-number', 10)?.closest('.question-card');
        return tenth && !tenth.classList.contains('is-correct')
          ? { key: `ten:${signature(path, root, tenth)}`, milestone: true } : null;
      }
      return null;
    }
    if (path === 'synonyms-system.html') {
      const root = document.querySelector('.syn-play');
      const position = root?.querySelector('.syn-play-nav span')?.textContent || '';
      const progress = document.querySelector('.syn-progress');
      const current = Number(position.match(/^QUESTION\s+(\d+)\s*\/\s*\d+/i)?.[1]);
      if (!visible(root) || ![1, 10].includes(current) || root.querySelector('.syn-feedback')) return null;
      if (current === 1 && progress?.getAttribute('aria-valuenow') !== '0') return null;
      return { key: `${path}:${current}:${document.querySelector('.syn-global-nav')?.textContent?.trim()}:${root.querySelector('.syn-original p')?.textContent?.trim()}`, milestone: current === 10 };
    }
    if (path === 'polysemy-lab.html') {
      const root = document.querySelector('[data-practice]');
      const toolbar = root?.querySelector('.practice-toolbar p')?.textContent || '';
      const progress = root?.querySelector('#practice-progress');
      const current = Number(toolbar.match(/^第\s*(\d+)\s*題/)?.[1]);
      if (!visible(root) || ![1, 10].includes(current) || root.querySelector('.feedback')) return null;
      if (current === 1 && progress?.value !== 0) return null;
      return { key: `${path}:${current}:${document.querySelector('.module-heading h1')?.textContent?.trim()}:${root.querySelector('.sentence')?.textContent?.trim()}`, milestone: current === 10 };
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
        const progress = root.querySelector('.grammar-progress');
        if ((current === expectedFirst || current === expectedFirst + 9) && selected && firstNumber === expectedFirst
            && (current !== expectedFirst || progress?.getAttribute('aria-valuenow') === '0')
            && (current === expectedFirst || selected.dataset.state !== 'correct')) {
          return { key: `${path}:${kind}:${current}:${root.querySelector('.grammar-question__prompt')?.textContent?.trim()}`, milestone: current !== expectedFirst };
        }
      }
      return null;
    }
    if (/^reading-logic-exercise-\d+\.html$/.test(path)) {
      const root = document.querySelector('.logic-question-wrap');
      const first = document.querySelector('.logic-map-node[data-question="0"]');
      const tenth = document.querySelector('.logic-map-node[data-question="9"]');
      const progress = document.querySelector('.logic-map-top strong')?.textContent || '';
      if (!visible(root)) return null;
      if (first?.getAttribute('aria-current') === 'true' && /^已完成\s*0\s*\/\s*\d+/.test(progress))
        return { key: `${path}:1:${root.querySelector('.logic-question-en')?.textContent?.trim()}`, milestone: false };
      if (tenth?.getAttribute('aria-current') === 'true' && !tenth.classList.contains('is-solved'))
        return { key: `${path}:10:${root.querySelector('.logic-question-en')?.textContent?.trim()}`, milestone: true };
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
  function show(milestone) {
    const spokenMessage = milestone ? `${milestoneTitle} ${milestoneSubtitle}` : message;
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 的練習提示');
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button" aria-label="${spokenMessage} 點擊、輕觸或按鍵繼續"><span class="eddy-first-question-art"><img src="${milestone ? 'eddy-tenth-question-dialogue.png' : 'eddy-first-question-dialogue.png'}" alt="" aria-hidden="true"><span class="eddy-first-question-message${milestone ? ' eddy-first-question-message--milestone' : ''}" lang="zh-Hant">${milestone ? `<strong>${milestoneTitle}</strong><span>${milestoneSubtitle}</span>` : message}</span></span></button>`;
    overlay.addEventListener('click', dismiss);
    document.body.append(overlay);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }
  function check() {
    scheduled = false;
    const match = eligible();
    if (!match) { activeKey = ''; return; }
    if (match.key !== activeKey) { activeKey = match.key; dismiss(); show(match.milestone); }
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(check); }
  }
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'aria-current', 'aria-valuenow'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
})();
