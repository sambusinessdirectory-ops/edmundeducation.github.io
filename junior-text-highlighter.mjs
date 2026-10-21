// Shared, account-scoped study highlighter. Text offsets survive exercise DOM redraws.
const COLORS = ['yellow', 'green', 'blue', 'purple', 'red'];
const COLOR_LABELS = ['黃色', '綠色', '藍色', '紫色', '紅色'];

export function juniorHighlightToolbar() {
  return `<div class="junior-highlight-toolbar" role="group" aria-label="螢光筆工具列"><button type="button" data-junior-highlight-toggle aria-pressed="false">螢光筆</button><div class="junior-highlight-colors" role="group" aria-label="標記顏色">${COLORS.map((name, index) => `<button type="button" class="junior-highlight-swatch is-${name}" data-junior-highlight-color="${name}" aria-label="${COLOR_LABELS[index]}螢光筆" aria-pressed="${index === 0}"></button>`).join('')}</div><button type="button" data-junior-highlight-clear>清除全部標記</button><span class="junior-highlight-status" data-junior-highlight-status role="status" aria-live="polite">選擇顏色後拖選文字。</span></div>`;
}

export function mountJuniorHighlighter(root, eligibleSelector, namespace, options = {}) {
  const scopeSelector = options.scopeSelector || eligibleSelector;
  const scopeKey = options.scopeKey || (scope => scope.dataset.highlightKey || scope.id);
  const supportsCssHighlights = Boolean(globalThis.CSS?.highlights && globalThis.Highlight);
  const nameFor = color => `junior-${namespace}-${color}`;
  let enabled = false;
  let color = 'yellow';
  let owner = '';
  let records = [];
  let scheduled = false;
  let repainting = false;
  const status = message => {
    const node = root.querySelector('[data-junior-highlight-status]');
    if (node) node.textContent = message;
  };
  const currentOwner = () => globalThis.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.()?.user?.id || '';
  const storageKey = id => `edmund-study-highlights-v2:${location.pathname}:${namespace}:${id}`;
  function syncOwner() {
    const next = currentOwner();
    if (next === owner) return;
    owner = next;
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey(owner)) || '[]');
      records = Array.isArray(stored) ? stored.filter(item => item && COLORS.includes(item.color) && typeof item.key === 'string' && typeof item.text === 'string' && Number.isSafeInteger(item.start) && Number.isSafeInteger(item.end)) : [];
    } catch { records = []; }
  }
  function persist() {
    try { if (owner) localStorage.setItem(storageKey(owner), JSON.stringify(records)); } catch { /* The current page still keeps the marks. */ }
  }
  function syncToolbar() {
    const toggle = root.querySelector('[data-junior-highlight-toggle]');
    if (toggle) { toggle.setAttribute('aria-pressed', String(enabled)); toggle.textContent = enabled ? '停用螢光筆' : '螢光筆'; }
    root.querySelectorAll('[data-junior-highlight-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.juniorHighlightColor === color)));
  }
  function textNodes(scope) {
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest('script, style, .junior-highlight-toolbar')) continue;
      nodes.push(node);
    }
    return nodes;
  }
  function textOf(nodes) { return nodes.map(node => node.data).join(''); }
  function position(scope, container, offset) {
    const before = document.createRange();
    before.setStart(scope, 0);
    before.setEnd(container, offset);
    return before.toString().length;
  }
  function rangeFrom(nodes, start, end) {
    const range = document.createRange();
    let cursor = 0, first = null, last = null;
    for (const node of nodes) {
      const next = cursor + node.length;
      if (!first && start < next) first = [node, start - cursor];
      if (end <= next) { last = [node, Math.max(0, end - cursor)]; break; }
      cursor = next;
    }
    if (!first || !last || end <= start) return null;
    range.setStart(...first);
    range.setEnd(...last);
    return range;
  }
  function removeFallbackMarks() {
    root.querySelectorAll('mark.junior-highlight-mark').forEach(mark => mark.replaceWith(...mark.childNodes));
  }
  function repaint() {
    scheduled = false;
    if (repainting) return;
    repainting = true;
    observer.disconnect();
    syncOwner();
    if (supportsCssHighlights) COLORS.forEach(name => CSS.highlights.delete(nameFor(name)));
    else removeFallbackMarks();
    const colorRanges = new Map(COLORS.map(name => [name, []]));
    const scopes = new Map([...root.querySelectorAll(scopeSelector)].map(scope => [scopeKey(scope), scope]));
    const scopeText = new Map();
    for (const record of records) {
      const scope = scopes.get(record.key);
      if (!scope) continue;
      const cached = supportsCssHighlights ? scopeText.get(record.key) : null;
      const nodes = cached?.nodes || textNodes(scope);
      const content = cached?.content || textOf(nodes);
      if (supportsCssHighlights && !cached) scopeText.set(record.key, {nodes, content});
      if (!content) continue;
      let start = record.start;
      if (content.slice(start, record.end) !== record.text) {
        const candidates = [];
        let at = content.indexOf(record.text);
        while (at !== -1) { candidates.push(at); at = content.indexOf(record.text, at + 1); }
        if (!candidates.length) continue;
        start = candidates.sort((a, b) => Math.abs(a - record.start) - Math.abs(b - record.start))[0];
      }
      const range = rangeFrom(nodes, start, start + record.text.length);
      if (!range) continue;
      if (supportsCssHighlights) colorRanges.get(record.color).push(range);
      else {
        let cursor = 0;
        const pieces = [];
        for (const node of nodes) {
          const from = Math.max(0, start - cursor);
          const to = Math.min(node.length, start + record.text.length - cursor);
          if (to > from) pieces.push({node, from, to});
          cursor += node.length;
        }
        for (const {node, from, to} of pieces.reverse()) {
          const part = document.createRange();
          part.setStart(node, from); part.setEnd(node, to);
          const mark = document.createElement('mark');
          mark.className = 'junior-highlight-mark';
          mark.dataset.color = record.color;
          part.surroundContents(mark);
        }
      }
    }
    if (supportsCssHighlights) COLORS.forEach(name => {
      const ranges = colorRanges.get(name);
      if (ranges.length) CSS.highlights.set(nameFor(name), new Highlight(...ranges));
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    repainting = false;
  }
  function scheduleRepaint() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(repaint);
  }
  const observer = new MutationObserver(scheduleRepaint);
  observer.observe(root, { childList: true, subtree: true, characterData: true });
  function clear() {
    syncOwner();
    records = [];
    persist();
    scheduleRepaint();
    status('已清除全部標記。');
  }
  function highlightSelection() {
    if (!enabled) return;
    syncOwner();
    const selection = globalThis.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed || !selection.toString().trim()) return;
    const range = selection.getRangeAt(0);
    const startElement = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
    const endElement = range.endContainer.nodeType === Node.ELEMENT_NODE ? range.endContainer : range.endContainer.parentElement;
    if (!startElement?.closest(eligibleSelector) || !endElement?.closest(eligibleSelector)) return;
    const scope = startElement.closest(scopeSelector);
    if (!scope || scope !== endElement.closest(scopeSelector) || !root.contains(scope)) return;
    const key = scopeKey(scope);
    if (!key) return;
    const nodes = textNodes(scope);
    const start = position(scope, range.startContainer, range.startOffset);
    const end = position(scope, range.endContainer, range.endOffset);
    const selected = textOf(nodes).slice(start, end);
    if (!selected.trim() || end <= start) return;
    records.push({ key, color, start, end, text: selected });
    persist();
    selection.removeAllRanges();
    scheduleRepaint();
    status('已標記所選文字。');
  }
  root.addEventListener('click', event => {
    const toggle = event.target.closest('[data-junior-highlight-toggle]');
    const choice = event.target.closest('[data-junior-highlight-color]');
    const reset = event.target.closest('[data-junior-highlight-clear]');
    if (toggle) { enabled = !enabled; syncToolbar(); status(enabled ? '拖選文字即可標記。' : '螢光筆已停用；現有標記仍保留。'); }
    if (choice && COLORS.includes(choice.dataset.juniorHighlightColor)) { color = choice.dataset.juniorHighlightColor; enabled = true; syncToolbar(); status('已切換螢光筆顏色。'); }
    if (reset && globalThis.confirm('清除這個系統的全部螢光筆標記？')) clear();
  });
  root.addEventListener('pointerup', event => {
    if (event.pointerType === 'touch') setTimeout(highlightSelection, 250);
    else highlightSelection();
  });
  root.addEventListener('keyup', highlightSelection);
  document.addEventListener('selectionchange', () => { if (enabled) setTimeout(highlightSelection, 350); });
  globalThis.addEventListener('edmund:learning-portal-session', scheduleRepaint);
  syncOwner();
  return { clear, syncToolbar, repaint: scheduleRepaint };
}
