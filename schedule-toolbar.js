// Native details keeps settings usable with keyboard and without JavaScript.
(() => {
  const settings = document.querySelector('.schedule-display-settings');
  if (!settings) return;
  document.addEventListener('click', (event) => {
    if (settings.open && !settings.contains(event.target)) settings.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && settings.open) {
      settings.open = false;
      settings.querySelector('summary').focus();
      event.preventDefault();
    }
  });
  settings.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!settings.contains(document.activeElement)) settings.open = false;
    });
  });
})();
