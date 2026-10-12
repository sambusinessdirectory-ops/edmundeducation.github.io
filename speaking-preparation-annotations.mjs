const COLORS = {red:'#ef4444',blue:'#3b82f6',yellow:'#facc15',green:'#22c55e'};
const KEYS = Object.keys(COLORS);
const textNodes = root => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
};
const textLength = root => textNodes(root).reduce((total,node) => total + node.length, 0);
function offsetOf(root, container, offset) {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.setEnd(container, offset);
  return range.toString().length;
}
function rangeAt(root, start, end) {
  const nodes = textNodes(root);
  let index = 0, from = null, to = null;
  for (const node of nodes) {
    const next = index + node.length;
    if (!from && start < next) from = [node, start - index];
    if (end <= next) { to = [node, end - index]; break; }
    index = next;
  }
  if (!from || !to) return null;
  const range = document.createRange();
  range.setStart(...from); range.setEnd(...to);
  return range;
}
export function mountPreparationAnnotations(root, session, save) {
  const surface = root.querySelector('[data-annotation-surface]');
  if (!surface) return;
  let color = null;
  const records = () => Array.isArray(session.preparationAnnotations) ? session.preparationAnnotations : [];
  const layers = {};
  const canHighlight = Boolean(window.CSS?.highlights && window.Highlight);
  const layerPrefix = 'pro-preparation-';
  function clearPaint() {
    if (canHighlight) KEYS.forEach(key => CSS.highlights.delete(layerPrefix + key));
    surface.querySelectorAll('mark[data-preparation-highlight]').forEach(mark => mark.replaceWith(...mark.childNodes));
    surface.normalize();
  }
  function paintFallback(range, key) {
    const fragments = textNodes(surface).filter(node => range.intersectsNode(node));
    for (const node of fragments) {
      const start = node === range.startContainer ? range.startOffset : 0;
      const end = node === range.endContainer ? range.endOffset : node.length;
      if (end <= start) continue;
      const selected = node.splitText(start);
      selected.splitText(end - start);
      const mark = document.createElement('mark');
      mark.dataset.preparationHighlight = key;
      selected.replaceWith(mark);
      mark.append(selected);
    }
  }
  function paint() {
    clearPaint();
    const length = textLength(surface);
    if (canHighlight) KEYS.forEach(key => { layers[key] = new Highlight(); CSS.highlights.set(layerPrefix + key, layers[key]); });
    for (const item of records()) {
      if (!KEYS.includes(item.color) || !Number.isInteger(item.start) || !Number.isInteger(item.end) || item.start < 0 || item.end > length || item.end <= item.start) continue;
      const range = rangeAt(surface, item.start, item.end);
      if (!range) continue;
      if (canHighlight) layers[item.color].add(range);
      else paintFallback(range, item.color);
    }
  }
  function commitSelection() {
    if (!color || session.phase !== 'preparation') return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !surface.contains(selection.anchorNode) || !surface.contains(selection.focusNode)) return;
    const range = selection.getRangeAt(0);
    const start = offsetOf(surface, range.startContainer, range.startOffset);
    const end = offsetOf(surface, range.endContainer, range.endOffset);
    if (end <= start || end > textLength(surface)) return;
    session.preparationAnnotations = [...records().filter(item => Number.isInteger(item.start)), {color,start,end,text:range.toString()}].slice(-500);
    selection.removeAllRanges();
    save(); paint();
  }
  root.querySelectorAll('[data-highlight-color]').forEach(button => button.addEventListener('click', () => {
    color = button.dataset.highlightColor;
    root.querySelectorAll('[data-highlight-color]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
    root.querySelector('[data-highlight-scroll]')?.setAttribute('aria-pressed','false');
  }));
  root.querySelector('[data-highlight-scroll]')?.addEventListener('click', () => {
    color = null;
    root.querySelectorAll('[data-highlight-color]').forEach(item => item.setAttribute('aria-pressed','false'));
    root.querySelector('[data-highlight-scroll]').setAttribute('aria-pressed','true');
  });
  root.querySelector('[data-highlight-undo]')?.addEventListener('click', () => {
    session.preparationAnnotations = records().slice(0,-1);
    save(); paint();
  });
  surface.addEventListener('pointerup', () => requestAnimationFrame(commitSelection));
  surface.addEventListener('keyup', commitSelection);
  paint();
}
