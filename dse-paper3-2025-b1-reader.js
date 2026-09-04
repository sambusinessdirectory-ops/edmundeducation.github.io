(() => {
  'use strict';
  const key = 'edmund-paper3-2025-b1-full-v1';
  let saved = {};
  const status = document.getElementById('save-status');
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) saved = parsed;
  } catch { status.textContent = '瀏覽器暫時不能還原筆記；仍可作答。'; }
  const fields = [...document.querySelectorAll('[data-save]')];
  for (const field of fields) {
    const value = saved[field.dataset.save];
    if (field.type === 'checkbox') field.checked = value === true;
    else if (typeof value === 'string') field.value = value;
  }
  function counts() {
    const completed = document.querySelectorAll('[data-complete]:checked').length;
    document.getElementById('progress').value = completed;
    document.getElementById('progress-text').textContent = `已讀 ${completed} / 14 頁`;
    for (const task of [6, 7]) {
      const text = [...document.querySelectorAll(`[data-word-task="${task}"]`)].map(x => x.value).join(' ').trim();
      const total = text ? text.split(/\s+/u).length : 0;
      document.querySelectorAll(`[data-word-count="${task}"]`).forEach(x => { x.textContent = `Task ${task}: ${total} words · 題目要求約 120 個英文單字`; });
    }
  }
  let timer;
  function persist() {
    try {
      localStorage.setItem(key, JSON.stringify(saved));
      status.textContent = '已儲存到此瀏覽器';
    } catch { status.textContent = '無法儲存；請先列印保留作答內容。'; }
  }
  function change(event) {
    const field = event.target.closest('[data-save]');
    if (!field) return;
    saved[field.dataset.save] = field.type === 'checkbox' ? field.checked : field.value;
    counts();
    clearTimeout(timer);
    timer = setTimeout(persist, 200);
  }
  document.addEventListener('input', change);
  document.addEventListener('change', change);
  window.addEventListener('pagehide', () => { clearTimeout(timer); persist(); });
  const toggle = document.getElementById('translation-toggle');
  toggle.checked = saved.bilingual === true;
  document.body.classList.toggle('bilingual', toggle.checked);
  toggle.addEventListener('change', () => {
    document.body.classList.toggle('bilingual', toggle.checked);
    saved.bilingual = toggle.checked;
    persist();
  });
  function mode(value) {
    const selected = ['all', 'df', 'pp'].includes(value) ? value : 'all';
    document.body.classList.remove('mode-all', 'mode-df', 'mode-pp');
    document.body.classList.add('mode-' + selected);
    document.querySelectorAll('.page-section').forEach(x => { x.hidden = selected !== 'all' && x.dataset.kind !== selected; });
    document.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.mode === selected)));
    saved.mode = selected;
  }
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { mode(button.dataset.mode); persist(); }));
  function revealHash() {
    if (!location.hash || location.hash === '#') return;
    const target = document.getElementById(location.hash.slice(1));
    if (!target) return;
    const page = target.closest('.page-section');
    if (page?.hidden) mode('all');
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => {
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (target?.closest('.page-section')?.hidden) mode('all');
  }));
  window.addEventListener('hashchange', revealHash);
  document.getElementById('print-button').addEventListener('click', () => window.print());
  mode(saved.mode);
  counts();
  revealHash();
})();
