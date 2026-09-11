// Shared mouse, pen, touch and keyboard geometry for floating learning tools.
export function resizeBounds(rect, corner, dx, dy, viewport, minimum = {}) {
  const gap = 8;
  const minWidth = Math.min(minimum.width || 280, viewport.width - gap * 2);
  const minHeight = Math.min(minimum.height || 160, viewport.height - gap * 2);
  const left = corner.includes('w') ? Math.min(rect.right - minWidth, Math.max(gap, rect.left + dx)) : rect.left;
  const right = corner.includes('e') ? Math.max(rect.left + minWidth, Math.min(viewport.width - gap, rect.right + dx)) : rect.right;
  const top = corner.includes('n') ? Math.min(rect.bottom - minHeight, Math.max(gap, rect.top + dy)) : rect.top;
  const bottom = corner.includes('s') ? Math.max(rect.top + minHeight, Math.min(viewport.height - gap, rect.bottom + dy)) : rect.bottom;
  return { left, top, width: right - left, height: bottom - top };
}

export function mountFloatingWindow(panel, { dragHandle, minWidth = 280, minHeight = 160 } = {}) {
  if (!panel || panel.dataset.cornerResize) return;
  panel.dataset.cornerResize = 'true';
  if (!document.querySelector('[data-floating-window-styles]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = new URL('./floating-window.css?v=20260911', import.meta.url).href;
    css.dataset.floatingWindowStyles = ''; document.head.append(css);
  }
  const viewport = () => ({ width: innerWidth, height: innerHeight });
  const disabled = () => panel.classList.contains('is-collapsed') || panel.classList.contains('is-expanded') || (panel.matches('.listening-transcript') && !panel.classList.contains('transcript-floating'));
  const apply = rect => {
    Object.assign(panel.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, right: 'auto', bottom: 'auto', transform: 'none' });
  };
  const contain = () => {
    if (panel.hidden || !panel.getClientRects().length || disabled()) return;
    const rect = panel.getBoundingClientRect();
    const width = Math.min(rect.width, innerWidth - 16), height = Math.min(rect.height, innerHeight - 16);
    apply({ width, height, left: Math.max(8, Math.min(rect.left, innerWidth - width - 8)), top: Math.max(8, Math.min(rect.top, innerHeight - height - 8)) });
  };
  for (const [corner, label] of [['nw','左上'], ['ne','右上'], ['sw','左下'], ['se','右下']]) {
    const handle = document.createElement('button'); handle.type = 'button';
    handle.className = 'floating-window-corner'; handle.dataset.resizeCorner = corner;
    handle.setAttribute('aria-label', `從${label}角調整視窗大小`);
    handle.title = '拖曳調整大小；方向鍵微調 · Drag to resize; arrow keys to adjust';
    panel.append(handle);
    handle.addEventListener('pointerdown', event => {
      if (disabled() || event.button !== 0) return;
      event.preventDefault(); event.stopPropagation(); contain();
      const rect = panel.getBoundingClientRect(), x = event.clientX, y = event.clientY;
      handle.setPointerCapture(event.pointerId); panel.classList.add('is-resizing');
      const move = e => apply(resizeBounds(rect, corner, e.clientX - x, e.clientY - y, viewport(), { width: minWidth, height: minHeight }));
      const stop = () => {
        handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', stop); handle.removeEventListener('pointercancel', stop); handle.removeEventListener('lostpointercapture', stop);
        panel.classList.remove('is-resizing');
      };
      handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', stop); handle.addEventListener('pointercancel', stop); handle.addEventListener('lostpointercapture', stop);
    });
    handle.addEventListener('keydown', e => {
      if (disabled() || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
      e.preventDefault(); contain(); const step = e.shiftKey ? 40 : 10;
      apply(resizeBounds(panel.getBoundingClientRect(), corner, e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0, e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0, viewport(), { width:minWidth, height:minHeight }));
    });
  }
  if (dragHandle) {
    dragHandle.classList.add('floating-window-drag');
    dragHandle.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button,input,select,a') || (disabled() && !panel.classList.contains('is-collapsed'))) return;
      e.preventDefault(); contain(); const rect = panel.getBoundingClientRect(), x = e.clientX, y = e.clientY;
      dragHandle.setPointerCapture(e.pointerId);
      const move = event => Object.assign(panel.style, { left:`${Math.max(8,Math.min(innerWidth-rect.width-8,rect.left+event.clientX-x))}px`, top:`${Math.max(8,Math.min(innerHeight-rect.height-8,rect.top+event.clientY-y))}px`, right:'auto', bottom:'auto', transform:'none' });
      const stop = () => { dragHandle.removeEventListener('pointermove',move); dragHandle.removeEventListener('pointerup',stop); dragHandle.removeEventListener('pointercancel',stop); dragHandle.removeEventListener('lostpointercapture',stop); };
      dragHandle.addEventListener('pointermove',move); dragHandle.addEventListener('pointerup',stop); dragHandle.addEventListener('pointercancel',stop); dragHandle.addEventListener('lostpointercapture',stop);
    });
  }
  window.addEventListener('resize', contain);
}
