/* Eddy's welcome appears whenever an untouched exercise opens at its first question. */
(() => {
  'use strict';
  const message = 'Eddy 已準備好 與您一同迎接勇者的試煉！';
  let activeKey = '';
  let overlay = null;
  let previousFocus = null;
  let scheduled = false;

  const visible = (element) => !!element && element.getClientRects().length > 0;
  const number = (value) => Number(String(value || '').match(/\d+/)?.[0]);
  const firstQuestion = (root, selector) => {
    const card = root?.querySelector(selector);
    return card && number(card.textContent) === 1 ? card : null;
  };
  const signature = (kind, root, first) => `${kind}:${root.querySelector('h2')?.textContent?.trim() || ''}:${first?.getAttribute('data-question-id') || first?.textContent?.trim().slice(0, 100) || ''}`;

  function eligible() {
    const path = location.pathname.split('/').pop();
    if (['sentence-structure.html', 'idiom-system.html', 'proverb-system.html', 'phrasal-verb-system.html'].includes(path)) {
      const root = document.querySelector('.exercise-page');
      const progress = root?.querySelector('.exercise-progress-label');
      const first = firstQuestion(root, '.question-card .question-number');
      if (!visible(root) || !first || !/^已完成\s*0\s*\/\s*\d+\s*題/.test(progress?.textContent?.trim() || '')) return null;
      return signature(path, root, first.closest('.question-card'));
    }
    if (path === 'synonyms-system.html') {
      const root = document.querySelector('.syn-play');
      const position = root?.querySelector('.syn-play-nav span')?.textContent || '';
      const progress = document.querySelector('.syn-progress');
      if (!visible(root) || !/^QUESTION\s+0?1\s*\/\s*\d+/i.test(position) || progress?.getAttribute('aria-valuenow') !== '0' || root.querySelector('.syn-feedback')) return null;
      return `${path}:${document.querySelector('.syn-global-nav')?.textContent?.trim()}:${root.querySelector('.syn-original p')?.textContent?.trim()}`;
    }
    if (path === 'polysemy-lab.html') {
      const root = document.querySelector('[data-practice]');
      const toolbar = root?.querySelector('.practice-toolbar p')?.textContent || '';
      const progress = root?.querySelector('#practice-progress');
      if (!visible(root) || !/^第\s*1\s*題/.test(toolbar) || progress?.value !== 0 || root.querySelector('.feedback')) return null;
      return `${path}:${document.querySelector('.module-heading h1')?.textContent?.trim()}:${root.querySelector('.sentence')?.textContent?.trim()}`;
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
        if (current === expectedFirst && selected && firstNumber === expectedFirst && progress?.getAttribute('aria-valuenow') === '0') {
          return `${path}:${kind}:${current}:${root.querySelector('.grammar-question__prompt')?.textContent?.trim()}`;
        }
      }
      return null;
    }
    if (/^reading-logic-exercise-\d+\.html$/.test(path)) {
      const root = document.querySelector('.logic-question-wrap');
      const first = document.querySelector('.logic-map-node[data-question="0"]');
      const progress = document.querySelector('.logic-map-top strong')?.textContent || '';
      if (!visible(root) || first?.getAttribute('aria-current') !== 'true' || !/^已完成\s*0\s*\/\s*\d+/.test(progress)) return null;
      return `${path}:${root.querySelector('.logic-question-en')?.textContent?.trim()}`;
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
  function show() {
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'eddy-first-question-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Eddy 的練習提示');
    overlay.innerHTML = `<button class="eddy-first-question-dismiss" type="button" aria-label="${message} 點擊、輕觸或按鍵繼續"><span class="eddy-first-question-art"><img src="eddy-first-question-dialogue.png" alt="" aria-hidden="true"><span class="eddy-first-question-message" lang="zh-Hant">${message}</span></span></button>`;
    overlay.addEventListener('click', dismiss);
    document.body.append(overlay);
    overlay.querySelector('button').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }
  function check() {
    scheduled = false;
    const key = eligible();
    if (!key) { activeKey = ''; return; }
    if (key !== activeKey) { activeKey = key; dismiss(); show(); }
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(check); }
  }
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'aria-current', 'aria-valuenow'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
})();
