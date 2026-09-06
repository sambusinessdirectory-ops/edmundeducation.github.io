const workbench = document.querySelector('.reading-workbench');
const button = document.querySelector('[data-teaching-highlight]');
let enabled = false;
const ranges = new Set();
function clear() {
  ranges.clear();
  globalThis.CSS?.highlights?.delete('teaching');
  workbench.querySelectorAll('mark.teaching-highlight').forEach(mark => mark.replaceWith(...mark.childNodes));
}
button.addEventListener('click', () => {
  enabled = !enabled;
  if (!enabled) clear();
  button.setAttribute('aria-pressed', String(enabled));
  button.textContent = enabled ? '清除暫時螢光筆' : '🖍 暫時螢光筆';
});
function highlightSelection() {
  if (!enabled) return;
  const selection = getSelection();
  if (!selection?.rangeCount || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  if (!workbench.contains(range.startContainer) || !workbench.contains(range.endContainer)) return;
  if (globalThis.CSS?.highlights && globalThis.Highlight) {
    ranges.add(range.cloneRange());
    CSS.highlights.set('teaching', new Highlight(...ranges));
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
      const mark = document.createElement('mark'); mark.className = 'teaching-highlight'; fragment.surroundContents(mark);
    }
  }
  selection.removeAllRanges();
}
workbench.addEventListener('pointerup', () => setTimeout(highlightSelection, 0));
workbench.addEventListener('keyup', highlightSelection);
new MutationObserver(() => { if ([...ranges].some(range => !range.startContainer.isConnected)) clear(); }).observe(workbench, { childList: true, subtree: true });
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
