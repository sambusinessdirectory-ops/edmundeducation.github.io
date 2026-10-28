(() => {
  const cards = document.querySelectorAll('.category-strip a.category');
  if (!cards.length) return;

  const chooseFrame = card => {
    const { width, height } = card.getBoundingClientRect();
    if (!width || !height) return;
    card.dataset.fantasyFrame = height > width * 1.05 ? 'tall' : 'wide';
  };

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(entries => {
      for (const { target } of entries) chooseFrame(target);
    });
    cards.forEach(card => observer.observe(card));
  } else {
    const update = () => cards.forEach(chooseFrame);
    update();
    window.addEventListener('resize', update, { passive: true });
  }
})();
