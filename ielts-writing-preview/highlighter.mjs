// Temporary question annotations, following the reading comprehension controls.
const rows = document.getElementById('task2-rows');
const toggle = document.getElementById('highlight-toggle');
const status = document.getElementById('highlight-status');
const dialog = document.getElementById('highlight-clear-dialog');
const colors = ['yellow', 'green', 'blue', 'purple', 'red'];
const ranges = new Map(colors.map((name) => [name, new Set()]));
let enabled = false;
let color = 'yellow';

function paint(name) {
  if (globalThis.CSS?.highlights && globalThis.Highlight) {
    CSS.highlights.set(`preview-${name}`, new Highlight(...ranges.get(name)));
  }
}

function clear() {
  for (const name of colors) {
    ranges.get(name).clear();
    globalThis.CSS?.highlights?.delete(`preview-${name}`);
  }
  rows.querySelectorAll('mark.preview-highlight, .preview-hidden-words').forEach((element) => element.replaceWith(...element.childNodes));
  rows.normalize();
}

function setEnabled(value) {
  enabled = value;
  toggle.setAttribute('aria-pressed', String(enabled));
  toggle.textContent = enabled ? '停用暫時螢光筆' : '🖍 暫時螢光筆';
  status.textContent = enabled ? '已啟用螢光筆。拖選題目文字即可標記。' : '螢光筆已停用；現有標記仍保留。';
}

toggle.addEventListener('click', () => setEnabled(!enabled));
document.querySelectorAll('[data-preview-color]').forEach((choice) => choice.addEventListener('click', () => {
  color = choice.dataset.previewColor;
  document.querySelectorAll('[data-preview-color]').forEach((item) => item.setAttribute('aria-pressed', String(item === choice)));
  if (!enabled) setEnabled(true);
  status.textContent = color === 'hide' ? '拖選題目文字即可隱藏；點按遮蓋處可重新顯示。' : `已選擇${choice.title}螢光筆。`;
}));

function closeDialog() { dialog.close(); }
document.getElementById('highlight-clear').addEventListener('click', () => dialog.showModal());
document.getElementById('highlight-clear-cancel').addEventListener('click', closeDialog);
document.getElementById('highlight-clear-confirm').addEventListener('click', () => {
  clear();
  closeDialog();
  status.textContent = '已清除全部暫時標記。';
});
dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });

function questionFor(node) {
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  const question = element?.closest('#task2-rows .question');
  return question && rows.contains(question) ? question : null;
}

function selectedTextNodes(question, range) {
  const nodes = [];
  const walker = document.createTreeWalker(question, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) if (range.intersectsNode(walker.currentNode)) nodes.push(walker.currentNode);
  return nodes;
}

function wrapSelection(question, range, tag, className) {
  let wrapped = 0;
  for (const textNode of selectedTextNodes(question, range).reverse()) {
    if (textNode.parentElement.closest('.preview-hidden-words, mark.preview-highlight')) continue;
    const start = textNode === range.startContainer ? range.startOffset : 0;
    const end = textNode === range.endContainer ? range.endOffset : textNode.length;
    if (end <= start || !textNode.textContent.slice(start, end).trim()) continue;
    const part = document.createRange();
    part.setStart(textNode, start);
    part.setEnd(textNode, end);
    const wrapper = document.createElement(tag);
    wrapper.className = className;
    if (tag === 'mark') wrapper.dataset.previewHighlight = color;
    else {
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'button');
      wrapper.setAttribute('aria-label', '顯示隱藏文字');
      wrapper.title = '點按顯示文字';
    }
    part.surroundContents(wrapper);
    wrapped++;
  }
  return wrapped;
}

function applySelection() {
  if (!enabled) return;
  const selection = getSelection();
  if (!selection?.rangeCount || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  const question = questionFor(range.startContainer);
  if (!question || questionFor(range.endContainer) !== question || !range.toString().trim()) return;
  if (color === 'hide') {
    if (wrapSelection(question, range, 'span', 'preview-hidden-words')) status.textContent = '文字已隱藏。點按遮蓋處可重新顯示。';
  } else if (globalThis.CSS?.highlights && globalThis.Highlight) {
    ranges.get(color).add(range.cloneRange());
    paint(color);
    status.textContent = '已標記所選文字。';
  } else if (wrapSelection(question, range, 'mark', 'preview-highlight')) {
    status.textContent = '已標記所選文字。';
  }
  selection.removeAllRanges();
}

rows.addEventListener('pointerup', () => setTimeout(applySelection, 60));
rows.addEventListener('keyup', applySelection);
rows.addEventListener('click', (event) => {
  const cover = event.target.closest('.preview-hidden-words');
  if (!cover) return;
  cover.replaceWith(...cover.childNodes);
  status.textContent = '已顯示所選文字。';
}, true);
rows.addEventListener('keydown', (event) => {
  if (!['Enter', ' '].includes(event.key) || !event.target.matches('.preview-hidden-words')) return;
  event.preventDefault();
  event.target.click();
});
new MutationObserver(() => {
  let changed = false;
  for (const selected of ranges.values()) for (const range of selected) {
    if (!range.startContainer.isConnected || !range.endContainer.isConnected) { selected.delete(range); changed = true; }
  }
  if (changed) colors.forEach(paint);
}).observe(rows, { childList: true, subtree: true });
