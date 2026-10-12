(() => {
  const cursor = document.querySelector('.junior-eddy-cursor');
  if (!cursor || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  window.addEventListener('pointermove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.style.opacity = event.target.closest('input, textarea, select, [contenteditable="true"]') ? '0' : '1';
  }, {passive: true});
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
})();
