const workbench = document.querySelector('.reading-workbench');
const button = document.querySelector('[data-teaching-highlight]');
let enabled = false;
let color = 'yellow';
const colors = ['yellow', 'green', 'blue', 'purple', 'red'];
const ranges = new Map(colors.map(name => [name, new Set()]));
const dialog = document.querySelector('[data-teaching-clear-dialog]');
const status = document.querySelector('[data-teaching-status]');
function paintRanges(name) {
  if (globalThis.CSS?.highlights && globalThis.Highlight) {
    CSS.highlights.set(`teaching-${name}`, new Highlight(...ranges.get(name)));
  }
}
function clear() {
  for (const name of colors) {
    ranges.get(name).clear();
    globalThis.CSS?.highlights?.delete(`teaching-${name}`);
  }
  workbench.querySelectorAll('mark.teaching-highlight').forEach(mark => mark.replaceWith(...mark.childNodes));
  workbench.querySelectorAll('.reading-hidden-words').forEach(span => span.replaceWith(...span.childNodes));
  workbench.normalize();
}
button.addEventListener('click', () => {
  enabled = !enabled;
  button.setAttribute('aria-pressed', String(enabled));
  button.textContent = enabled ? '停用暫時螢光筆' : '🖍 暫時螢光筆';
  status.textContent = enabled ? '已啟用螢光筆。拖選文字即可標記。' : '螢光筆已停用；現有標記仍保留。';
});
document.querySelectorAll('[data-teaching-color]').forEach(choice => choice.addEventListener('click', () => {
  color = choice.dataset.teachingColor;
  document.querySelectorAll('[data-teaching-color]').forEach(item => item.setAttribute('aria-pressed', String(item === choice)));
  if (!enabled) { enabled = true; button.setAttribute('aria-pressed', 'true'); button.textContent = '停用暫時螢光筆'; }
  status.textContent = color === 'hide' ? '已啟用隱藏文字。拖選文字即可隱藏；點按遮蓋處可重新顯示。' : `已選擇${choice.title}螢光筆。`;
}));
document.querySelector('[data-teaching-clear]').addEventListener('click', () => {
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
});
function closeDialog() { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); }
dialog.querySelector('[data-teaching-clear-cancel]').addEventListener('click', closeDialog);
dialog.querySelector('[data-teaching-clear-confirm]').addEventListener('click', () => { clear(); closeDialog(); status.textContent = '已清除全部暫時標記。'; });
dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
function revealHiddenGroup(group) {
  workbench.querySelectorAll('.reading-hidden-words').forEach(span => {
    if (span.dataset.hiddenGroup === group) span.replaceWith(...span.childNodes);
  });
  status.textContent = '已顯示所選文字。';
}
function hideSelection(range) {
  const group = `hidden-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const nodes = [];
  const walker = document.createTreeWalker(workbench, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) if (range.intersectsNode(walker.currentNode)) nodes.push(walker.currentNode);
  let hidden = 0;
  for (const node of nodes.reverse()) {
    if (!node.textContent.trim() || node.parentElement.closest('button, input, textarea, select, .reading-hidden-words, .study-toolbar')) continue;
    const end = node === range.endContainer ? range.endOffset : node.length;
    const start = node === range.startContainer ? range.startOffset : 0;
    if (end <= start || !node.textContent.slice(start, end).trim()) continue;
    const fragment = document.createRange(); fragment.setStart(node, start); fragment.setEnd(node, end);
    const cover = document.createElement('span');
    cover.className = 'reading-hidden-words'; cover.dataset.hiddenGroup = group;
    cover.setAttribute('role', 'button'); cover.tabIndex = 0;
    cover.setAttribute('aria-label', '顯示隱藏文字'); cover.title = '點按顯示文字';
    fragment.surroundContents(cover); hidden++;
  }
  if (hidden) status.textContent = '文字已隱藏。點按遮蓋處可重新顯示。';
}
workbench.addEventListener('click', event => {
  const cover = event.target.closest('.reading-hidden-words');
  if (!cover) return;
  event.preventDefault(); event.stopImmediatePropagation(); revealHiddenGroup(cover.dataset.hiddenGroup);
}, true);
workbench.addEventListener('keydown', event => {
  if (!['Enter', ' '].includes(event.key) || !event.target.matches('.reading-hidden-words')) return;
  event.preventDefault(); event.stopImmediatePropagation(); revealHiddenGroup(event.target.dataset.hiddenGroup);
}, true);
function highlightSelection() {
  if (!enabled) return;
  const selection = getSelection();
  if (!selection?.rangeCount || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  if (!workbench.contains(range.startContainer) || !workbench.contains(range.endContainer)) return;
  if (color === 'hide') hideSelection(range);
  else if (globalThis.CSS?.highlights && globalThis.Highlight) {
    ranges.get(color).add(range.cloneRange());
    paintRanges(color);
  } else {
    const nodes = [];
    const walker = document.createTreeWalker(workbench, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) if (range.intersectsNode(walker.currentNode)) nodes.push(walker.currentNode);
    for (const node of nodes.reverse()) {
      if (!node.textContent.trim() || node.parentElement.closest('button, input, textarea, select, mark.teaching-highlight')) continue;
      const end = node === range.endContainer ? range.endOffset : node.length;
      const start = node === range.startContainer ? range.startOffset : 0;
      if (end <= start) continue;
      const fragment = document.createRange(); fragment.setStart(node, start); fragment.setEnd(node, end);
      const mark = document.createElement('mark'); mark.className = 'teaching-highlight'; mark.dataset.highlightColor = color; fragment.surroundContents(mark);
    }
  }
  selection.removeAllRanges();
}
workbench.addEventListener('pointerup', () => setTimeout(highlightSelection, 0));
workbench.addEventListener('keyup', highlightSelection);
new MutationObserver(() => {
  let changed = false;
  for (const selected of ranges.values()) for (const range of selected) if (!range.startContainer.isConnected) { selected.delete(range); changed = true; }
  if (changed) colors.forEach(paintRanges);
}).observe(workbench, { childList: true, subtree: true });
const divider = document.createElement('div');
divider.className = 'reading-divider'; divider.tabIndex = 0;
divider.setAttribute('role', 'separator'); divider.setAttribute('aria-orientation', 'vertical');
divider.setAttribute('aria-label', '調整文章與題目寬度；Home 或按兩下回到中間');
divider.setAttribute('aria-valuemin', '20'); divider.setAttribute('aria-valuemax', '80');
workbench.children[0].after(divider);
let ratio = 50;
function setRatio(value) {
  ratio = Math.max(20, Math.min(80, Math.abs(value - 50) < 2.5 ? 50 : value));
  workbench.style.setProperty('--passage-width', ratio + 'fr');
  workbench.style.setProperty('--question-width', (100 - ratio) + 'fr');
  divider.setAttribute('aria-valuenow', String(Math.round(ratio)));
  divider.classList.toggle('is-centered', ratio === 50);
}
setRatio(50);
divider.addEventListener('pointerdown', event => {
  event.preventDefault(); divider.setPointerCapture(event.pointerId); divider.classList.add('is-dragging');
});
divider.addEventListener('pointermove', event => {
  if (!divider.hasPointerCapture(event.pointerId)) return;
  const rect = workbench.getBoundingClientRect(); setRatio((event.clientX - rect.left) / rect.width * 100);
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) divider.addEventListener(type, event => {
  if (divider.hasPointerCapture(event.pointerId)) divider.releasePointerCapture(event.pointerId);
  divider.classList.remove('is-dragging');
});
divider.addEventListener('dblclick', () => setRatio(50));
divider.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
  event.preventDefault(); setRatio(event.key === 'Home' ? 50 : ratio + (event.key === 'ArrowLeft' ? -5 : 5));
});
