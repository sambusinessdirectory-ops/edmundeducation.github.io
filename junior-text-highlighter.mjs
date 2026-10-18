const COLORS = ['yellow', 'green', 'blue', 'purple', 'red'];

export function juniorHighlightToolbar() {
  return `<div class="junior-highlight-toolbar" role="group" aria-label="暫時螢光筆"><button type="button" data-junior-highlight-toggle aria-pressed="false">螢光筆</button><div class="junior-highlight-colors" role="group" aria-label="標記顏色">${COLORS.map((name, index) => `<button type="button" class="junior-highlight-swatch is-${name}" data-junior-highlight-color="${name}" aria-label="${['黃色', '綠色', '藍色', '紫色', '紅色'][index]}螢光筆" aria-pressed="${index === 0}"></button>`).join('')}</div><button type="button" data-junior-highlight-clear>清除標記</button><span class="junior-highlight-status" data-junior-highlight-status role="status" aria-live="polite">開啟後拖選文章文字。</span></div>`;
}

export function mountJuniorHighlighter(root, eligibleSelector, namespace) {
  let enabled = false;
  let color = 'yellow';
  const ranges = new Map(COLORS.map(name => [name, new Set()]));
  const supportsCssHighlights = Boolean(globalThis.CSS?.highlights && globalThis.Highlight);
  const nameFor = name => `junior-${namespace}-${name}`;
  const status = message => { const node = root.querySelector('[data-junior-highlight-status]'); if (node) node.textContent = message; };
  function syncToolbar() {
    const toggle = root.querySelector('[data-junior-highlight-toggle]');
    if (toggle) { toggle.setAttribute('aria-pressed', String(enabled)); toggle.textContent = enabled ? '停用螢光筆' : '螢光筆'; }
    root.querySelectorAll('[data-junior-highlight-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.juniorHighlightColor === color)));
  }
  function repaint(name) {
    if (supportsCssHighlights) CSS.highlights.set(nameFor(name), new Highlight(...ranges.get(name)));
  }
  function clear() {
    for (const name of COLORS) { ranges.get(name).clear(); if (supportsCssHighlights) CSS.highlights.delete(nameFor(name)); }
    root.querySelectorAll('mark.junior-highlight-mark').forEach(mark => mark.replaceWith(...mark.childNodes));
    root.normalize();
    status('已清除全部暫時標記。');
  }
  root.addEventListener('click', event => {
    const toggle = event.target.closest('[data-junior-highlight-toggle]');
    const choice = event.target.closest('[data-junior-highlight-color]');
    const reset = event.target.closest('[data-junior-highlight-clear]');
    if (toggle) { enabled = !enabled; syncToolbar(); status(enabled ? '拖選文章文字即可標記。' : '螢光筆已停用；現有標記仍保留。'); }
    if (choice && COLORS.includes(choice.dataset.juniorHighlightColor)) { color = choice.dataset.juniorHighlightColor; enabled = true; syncToolbar(); status('已切換螢光筆顏色。'); }
    if (reset && globalThis.confirm('清除這一頁的全部暫時螢光筆標記？')) clear();
  });
  function highlightSelection() {
    if (!enabled) return;
    const selection = globalThis.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const start = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
    const end = range.endContainer.nodeType === Node.ELEMENT_NODE ? range.endContainer : range.endContainer.parentElement;
    if (!start?.closest(eligibleSelector) || !end?.closest(eligibleSelector) || !root.contains(start) || !root.contains(end)) return;
    if (supportsCssHighlights) {
      ranges.get(color).add(range.cloneRange());
      repaint(color);
    } else {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (range.intersectsNode(node) && node.parentElement?.closest(eligibleSelector) && !node.parentElement.closest('mark.junior-highlight-mark, button, input, textarea')) nodes.push(node);
      }
      for (const node of nodes.reverse()) {
        const from = node === range.startContainer ? range.startOffset : 0;
        const to = node === range.endContainer ? range.endOffset : node.length;
        if (to <= from) continue;
        const part = document.createRange(); part.setStart(node, from); part.setEnd(node, to);
        const mark = document.createElement('mark'); mark.className = 'junior-highlight-mark'; mark.dataset.color = color;
        part.surroundContents(mark);
      }
    }
    selection.removeAllRanges();
    status('已標記所選文字。');
  }
  root.addEventListener('pointerup', () => setTimeout(highlightSelection, 0));
  root.addEventListener('keyup', highlightSelection);
  new MutationObserver(() => {
    if (!supportsCssHighlights) return;
    for (const name of COLORS) {
      let changed = false;
      for (const range of ranges.get(name)) if (!range.startContainer.isConnected || !root.contains(range.startContainer)) { ranges.get(name).delete(range); changed = true; }
      if (changed) repaint(name);
    }
  }).observe(root, {childList: true, subtree: true});
  return {clear, syncToolbar};
}
