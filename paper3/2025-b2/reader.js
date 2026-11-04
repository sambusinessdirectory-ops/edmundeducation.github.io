(() => {
  'use strict';
  const key = 'edmund-paper3-2025-b2-reader-v1';
  const fields = [...document.querySelectorAll('[data-save]')];
  const pages = [...document.querySelectorAll('.page[data-kind]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const translation = document.getElementById('show-translation');
  const saveStatus = document.getElementById('save-status');
  const nav = [...document.querySelectorAll('.page-nav a')];
  let saved = {};
  let timer;
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) saved = value;
  } catch {
    saveStatus.textContent = '未能讀取儲存紀錄；你仍可在本頁練習。';
  }
  for (const field of fields) {
    const value = saved[field.dataset.save];
    if (field.type === 'checkbox') field.checked = value === true;
    else if (typeof value === 'string') field.value = value;
  }
  if (saved.translation === false) translation.checked = false;
  const updateTranslation = () => document.body.classList.toggle('hide-translation', !translation.checked);
  const updateCounts = () => {
    const done = fields.filter(field => field.hasAttribute('data-read-page') && field.checked).length;
    document.getElementById('progress-count').textContent = `${done} / 17`;
    document.getElementById('read-progress').value = done;
    for (const counter of document.querySelectorAll('[data-words]')) {
      const value = document.getElementById(counter.dataset.words)?.value.trim() || '';
      counter.textContent = String(value ? value.split(/\s+/u).length : 0);
    }
  };
  const persist = () => {
    clearTimeout(timer);
    const data = {translation: translation.checked};
    for (const field of fields) data[field.dataset.save] = field.type === 'checkbox' ? field.checked : field.value;
    try {
      localStorage.setItem(key, JSON.stringify(data));
      saveStatus.textContent = '已儲存於此瀏覽器 · 不會自動上傳或交卷。';
    } catch {
      saveStatus.textContent = '瀏覽器未能儲存，請勿關閉頁面；可用列印保留目前內容。';
    }
  };
  for (const field of fields) {
    field.addEventListener('input', () => {
      updateCounts();
      clearTimeout(timer);
      timer = setTimeout(persist, 250);
    });
    field.addEventListener('change', persist);
  }
  translation.addEventListener('change', () => {updateTranslation(); persist();});
  const setFilter = kind => {
    pages.forEach(page => {page.hidden = kind !== 'all' && page.dataset.kind !== kind;});
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === kind)));
  };
  filters.forEach(button => button.addEventListener('click', () => {
    setFilter(button.dataset.filter);
    const first = pages.find(page => !page.hidden);
    if (first) first.scrollIntoView({block:'start'});
  }));
  const revealHash = () => {
    const id = location.hash.slice(1);
    if (!/^(page-\d+|practice)$/.test(id)) return;
    const target = document.getElementById(id);
    if (!target) return;
    if (target.hidden) setFilter(target.dataset.kind);
    nav.forEach(link => {
      if (link.hash === location.hash) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
    requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  };
  window.addEventListener('hashchange', revealHash);
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
    const target = document.getElementById(link.hash.slice(1));
    if (target?.hidden) setFilter(target.dataset.kind);
    if (link.hash === location.hash) revealHash();
  }));
  document.getElementById('page-jump').addEventListener('change', event => {
    if (event.target.value) {
      const hash = `#${event.target.value}`;
      if (hash === location.hash) revealHash();
      else location.hash = hash;
    }
    event.target.value = '';
  });
  document.getElementById('print-reader').addEventListener('click', () => {persist(); window.print();});
  window.addEventListener('pagehide',persist);
  document.addEventListener('visibilitychange', () => {if (document.hidden) persist();});
  updateTranslation();
  updateCounts();
  revealHash();
})();
