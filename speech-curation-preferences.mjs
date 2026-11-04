const SCALE_KEY = 'edmund-speech-text-scale-v1';
const SCALES = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4];

export function initSpeechPreferences() {
  const root = document.querySelector('[data-text-scale]');
  if (!root) return;
  const trigger = root.querySelector('[data-text-scale-trigger]');
  const menu = root.querySelector('[data-text-scale-menu]');
  const options = root.querySelector('[data-text-scale-options]');
  const current = root.querySelector('[data-text-scale-current]');
  let scale = 1;
  try { scale = Number(localStorage.getItem(SCALE_KEY)) || 1; } catch { /* Optional preference. */ }
  if (!SCALES.includes(scale)) scale = 1;
  function apply(next) {
    scale = next;
    document.documentElement.style.setProperty('--speech-text-scale', String(next));
    document.documentElement.style.setProperty('--speech-inverse-scale', String(1 / next));
    document.documentElement.classList.toggle('speech-large-text', next >= 2);
    current.textContent = `${next}×`;
    options.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(Number(button.value) === next)));
    try { localStorage.setItem(SCALE_KEY, String(next)); } catch { /* Optional preference. */ }
    window.dispatchEvent(new Event('resize'));
  }
  function close() { menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); }
  SCALES.forEach(value => {
    const button = document.createElement('button');
    button.type = 'button'; button.value = String(value); button.textContent = `${value}×`;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => { apply(value); close(); trigger.focus(); });
    options.append(button);
  });
  trigger.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    trigger.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', event => { if (!root.contains(event.target)) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  apply(scale);
}

export function setSpeechStudentNavigation(isStudent) {
  document.documentElement.classList.toggle('speech-nonstudent', !isStudent);
}
