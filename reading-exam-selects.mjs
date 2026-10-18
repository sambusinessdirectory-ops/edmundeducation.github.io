// Keep the native selects as the source of truth and enhance only their visible controls.
const selects = [...document.querySelectorAll('[data-dse-exam-mode], [data-dse-exam-year], [data-dse-exam-path]')];
let openMenu = null;

function closeMenu(restoreFocus = false) {
  if (!openMenu) return;
  const { trigger, menu } = openMenu;
  menu.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
  if (restoreFocus) trigger.focus();
  openMenu = null;
}

for (const select of selects) {
  const shell = document.createElement('span');
  shell.className = 'reading-glass-select';
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'reading-glass-select__trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', select.closest('label')?.childNodes[0]?.textContent?.trim() || '選擇');
  const menu = document.createElement('div');
  menu.className = 'reading-glass-select__menu';
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', trigger.getAttribute('aria-label'));
  menu.hidden = true;
  select.after(shell);
  shell.append(trigger, menu);
  select.classList.add('reading-glass-select__native');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  const sync = () => {
    const selected = select.selectedOptions[0];
    const text = document.createElement('span'); text.textContent = selected?.textContent || '請選擇';
    const chevron = document.createElement('span'); chevron.className = 'reading-glass-select__chevron'; chevron.setAttribute('aria-hidden', 'true');
    trigger.replaceChildren(text, chevron);
    trigger.disabled = select.disabled || !select.options.length;
  };
  const focusOption = (offset) => {
    const buttons = [...menu.querySelectorAll('[role="option"]')];
    if (!buttons.length) return;
    const focused = buttons.indexOf(document.activeElement);
    const current = focused < 0 ? Math.max(0, select.selectedIndex) : focused;
    buttons[Math.max(0, Math.min(buttons.length - 1, current + offset))].focus();
  };
  const open = () => {
    if (trigger.disabled) return;
    closeMenu();
    menu.replaceChildren();
    [...select.options].forEach((option) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'reading-glass-select__option';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(option.selected));
      item.textContent = option.textContent;
      item.disabled = option.disabled;
      item.addEventListener('click', () => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        sync(); closeMenu(true);
      });
      menu.append(item);
    });
    menu.hidden = false;
    const availableBelow = innerHeight - trigger.getBoundingClientRect().bottom;
    shell.classList.toggle('opens-up', availableBelow < Math.min(310, menu.scrollHeight + 18) && trigger.getBoundingClientRect().top > availableBelow);
    trigger.setAttribute('aria-expanded', 'true');
    openMenu = { trigger, menu };
    (menu.querySelector('[aria-selected="true"]') || menu.querySelector('[role="option"]'))?.focus();
  };
  trigger.addEventListener('click', () => openMenu?.trigger === trigger ? closeMenu() : open());
  trigger.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
    event.preventDefault(); open();
    if (event.key === 'ArrowUp') focusOption(-1);
  });
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); focusOption(event.key === 'ArrowDown' ? 1 : -1); }
    else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const options = menu.querySelectorAll('[role="option"]');
      (event.key === 'Home' ? options[0] : options[options.length - 1])?.focus();
    }
  });
  select.addEventListener('change', sync);
  new MutationObserver(sync).observe(select, { childList: true, subtree: true, attributes: true });
  sync();
}
document.addEventListener('pointerdown', (event) => {
  if (openMenu && !openMenu.trigger.parentElement.contains(event.target)) closeMenu();
});
