(() => {
  'use strict';
  const KEY = 'edmund-paper3-2024-b2-reader-v1';
  const total = 16;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  let state = { read: [], notes: {}, drafts: {}, translation: false };
  try { state = { ...state, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (_) {}
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));

  function updateProgress() {
    const count = state.read.length;
    $('#progress-text').textContent = `${count} / ${total}`;
    $('#progress-bar').style.width = `${(count / total) * 100}%`;
  }
  $$('.paper-page').forEach(page => {
    const n = Number(page.dataset.page);
    const check = $('.read-check', page);
    check.checked = state.read.includes(n);
    check.addEventListener('change', () => {
      state.read = check.checked ? [...new Set([...state.read, n])].sort((a,b) => a-b) : state.read.filter(x => x !== n);
      save(); updateProgress();
    });
  });
  updateProgress();

  const transToggle = $('#translation-toggle');
  function applyTranslation() {
    $$('.translation').forEach(el => el.classList.toggle('is-visible', state.translation));
    transToggle.checked = state.translation;
  }
  transToggle.addEventListener('change', () => { state.translation = transToggle.checked; save(); applyTranslation(); });
  applyTranslation();

  $$('.filter').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('.filter').forEach(b => { const on = b === button; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    $$('[data-kind]').forEach(el => el.classList.toggle('is-hidden', filter !== 'all' && el.dataset.kind !== filter));
    if (filter === 'practice') $('#practice')?.scrollIntoView({behavior:'smooth', block:'start'});
  }));

  $$('textarea[data-note]').forEach(area => {
    area.value = state.notes[area.dataset.note] || '';
    area.addEventListener('input', () => { state.notes[area.dataset.note] = area.value; save(); });
  });
  const countWords = text => (text.trim().match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length;
  $$('textarea[data-draft]').forEach(area => {
    const id = area.dataset.draft;
    const counter = $(`[data-count-for="${id}"]`);
    area.value = state.drafts[id] || '';
    const update = () => { counter.textContent = `${countWords(area.value)} words`; };
    update();
    area.addEventListener('input', () => { state.drafts[id] = area.value; save(); update(); });
  });
  $('#print-button').addEventListener('click', () => window.print());

  if ('IntersectionObserver' in window) {
    const links = new Map($$('#page-nav a').map(a => [a.getAttribute('href').slice(1), a]));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(a => a.classList.remove('is-current'));
      links.get(visible.target.id)?.classList.add('is-current');
    }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, .1, .5] });
    $$('.paper-page').forEach(page => observer.observe(page));
  }
})();
