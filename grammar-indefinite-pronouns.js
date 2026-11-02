(() => {
  'use strict';
  const data = window.EDMUND_INDEFINITE_PRONOUNS;
  const dashboard = document.querySelector('[data-learning-portal-root] [data-view="dashboard"]');
  const library = dashboard?.querySelector('[data-grammar-library]');
  if (!data || !dashboard || !library || data.exercises?.length !== 250) return;
  const slug = data.guide.slug;
  const card = [...library.querySelectorAll('.grammar-lesson-card--new-curation')].find(el => el.textContent.includes(data.guide.english));
  const guide = dashboard.querySelector(`[data-new-grammar-curation="${slug}"]`);
  if (!card || !guide) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let account = 'guest';
  const state = { question: 1, drafts: {}, done: {} };
  const key = () => `edmund-grammar-indefinite-250-v1:${account}`;
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(key()) || '{}');
      state.question = Number.isInteger(saved.question) && saved.question >= 1 && saved.question <= 250 ? saved.question : 1;
      state.drafts = saved.drafts && typeof saved.drafts === 'object' ? saved.drafts : {};
      state.done = saved.done && typeof saved.done === 'object' ? saved.done : {};
    } catch { state.question = 1; state.drafts = {}; state.done = {}; }
  }
  function save() {
    try { localStorage.setItem(key(), JSON.stringify(state)); }
    catch { status.textContent = '此瀏覽器未能儲存答案，請勿關閉分頁。'; }
  }
  const practiceButton = document.createElement('button');
  practiceButton.className = 'grammar-button grammar-lesson-card__secondary';
  practiceButton.type = 'button';
  practiceButton.textContent = '開始 250 題練習';
  card.querySelector('.grammar-lesson-card__stats').append(practiceButton);
  const guideButton = document.createElement('button');
  guideButton.className = 'grammar-button grammar-button--primary';
  guideButton.type = 'button';
  guideButton.textContent = '開始 250 題練習';
  guide.querySelector('.grammar-articles-curation__finish').prepend(guideButton);

  const view = document.createElement('section');
  view.className = 'panel grammar-practice grammar-indefinite-practice';
  view.dataset.newGrammarPractice = slug;
  view.hidden = true;
  view.innerHTML = `<div class="grammar-practice__head"><div><button type="button" class="grammar-button--ghost" data-back-guide>← 返回導讀</button><button type="button" class="grammar-button--ghost" data-back-library>返回語法目錄</button><p class="eyebrow">MODULE 07 · INDEFINITE PRONOUNS</p><h2>逐題練習 · 250 題</h2><p>依題目指示選詞、改寫、解釋或寫作。原檔為學生版，未附答案；此處保存作答，不作自動評分。</p></div><div class="grammar-practice__summary"><strong data-count>0</strong><span>/ 250<br>已完成</span></div></div><div class="grammar-progress" role="progressbar" aria-label="已完成進度" aria-valuemin="0" aria-valuemax="250" aria-valuenow="0"><span data-progress></span></div><div class="grammar-navigator"><div class="grammar-navigator__bar"><label>題目範圍 <select class="grammar-range-select" data-range></select></label><span>可隨時返回修改答案。</span></div><div class="grammar-number-grid" data-numbers></div></div><article class="grammar-question"><div class="grammar-question__meta"><span class="grammar-question__number" data-number></span><span data-section></span></div><p class="grammar-question__prompt" lang="en" data-prompt></p><p class="grammar-question__translation" lang="zh-Hant" data-translation></p><label class="grammar-indefinite-answer">我的答案<textarea rows="5" data-answer spellcheck="true"></textarea></label><div class="grammar-indefinite-actions"><button type="button" class="grammar-button grammar-button--primary" data-finish>標記完成</button><button type="button" class="grammar-button--ghost" data-unfinish>取消完成</button></div><p class="grammar-save-status" role="status" aria-live="polite" data-status>答案即時保存在此裝置的帳戶記錄中。</p></article><nav class="grammar-nav" aria-label="題目導覽"><button type="button" data-prev>← 上一題</button><button type="button" data-next>下一題 →</button></nav>`;
  dashboard.append(view);
  const get = selector => view.querySelector(selector);
  const status = get('[data-status]');
  for (let first = 1; first <= 250; first += 25) {
    const option = document.createElement('option'); option.value = first;
    option.textContent = `第 ${first}–${first + 24} 題`;
    get('[data-range]').append(option);
  }
  function setRoute(show) {
    const url = new URL(location.href);
    if (show) { url.searchParams.set('lesson', slug); url.searchParams.set('view', 'practice'); url.searchParams.set('question', String(state.question)); }
    else { for (const field of ['lesson','view','question']) url.searchParams.delete(field); }
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }
  function render() {
    const q = data.exercises[state.question - 1];
    const count = Object.keys(state.done).filter(n => state.done[n]).length;
    get('[data-number]').textContent = `第 ${q.number} / 250 題`;
    get('[data-section]').textContent = q.section;
    get('[data-prompt]').textContent = q.prompt;
    get('[data-translation]').textContent = `【${q.translation}】`;
    get('[data-answer]').value = state.drafts[q.number] || '';
    get('[data-count]').textContent = count;
    get('.grammar-progress').setAttribute('aria-valuenow', count);
    get('[data-progress]').style.width = `${count / 250 * 100}%`;
    get('[data-range]').value = String(Math.floor((q.number - 1) / 25) * 25 + 1);
    const first = Number(get('[data-range]').value);
    get('[data-numbers]').innerHTML = data.exercises.slice(first - 1, first + 24).map(item => `<button type="button" data-go="${item.number}" data-state="${state.done[item.number] ? 'correct' : ''}" aria-current="${item.number === q.number}">${item.number}</button>`).join('');
    get('[data-prev]').disabled = q.number === 1;
    get('[data-next]').disabled = q.number === 250;
    get('[data-unfinish]').hidden = !state.done[q.number];
    get('[data-finish]').hidden = Boolean(state.done[q.number]);
    if (!view.hidden) setRoute(true);
    save();
  }
  function open(number = state.question) {
    dashboard.querySelectorAll('[data-tense-curation], [data-grammar-practice], [data-articles-curation], [data-articles-practice], [data-advanced-articles-curation], [data-advanced-articles-practice], [data-new-grammar-curation], [data-new-grammar-practice]').forEach(section => { section.hidden = true; });
    library.hidden = true; view.hidden = false;
    state.question = Math.min(250, Math.max(1, Number(number) || 1)); render();
    view.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  practiceButton.addEventListener('click', () => open());
  guideButton.addEventListener('click', () => open());
  get('[data-answer]').addEventListener('input', event => { state.drafts[state.question] = event.target.value; save(); status.textContent = '已儲存在此裝置。'; });
  get('[data-finish]').addEventListener('click', () => { if (!String(state.drafts[state.question] || '').trim()) { status.textContent = '請先寫下答案。'; return; } state.done[state.question] = true; status.textContent = '已標記完成，可隨時修改。'; render(); });
  get('[data-unfinish]').addEventListener('click', () => { delete state.done[state.question]; render(); });
  get('[data-numbers]').addEventListener('click', event => { const button = event.target.closest('[data-go]'); if (button) { state.question = Number(button.dataset.go); render(); } });
  get('[data-range]').addEventListener('change', event => { state.question = Number(event.target.value); render(); });
  get('[data-prev]').addEventListener('click', () => { state.question--; render(); });
  get('[data-next]').addEventListener('click', () => { state.question++; render(); });
  get('[data-back-guide]').addEventListener('click', () => { view.hidden = true; card.querySelector('.grammar-lesson-card__stats button').click(); });
  get('[data-back-library]').addEventListener('click', () => { view.hidden = true; library.hidden = false; setRoute(false); library.scrollIntoView({ behavior: 'instant', block: 'start' }); });
  window.addEventListener('edmund:learning-portal-session', event => { if (event.detail?.portalId !== 'grammar') return; account = event.detail.user?.id || 'guest'; load(); if (!view.hidden) render(); });
  account = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.()?.user?.id || 'guest'; load(); render();
  const requested = new URLSearchParams(location.search);
  if (requested.get('lesson') === slug && requested.get('view') === 'practice') open(requested.get('question'));
})();
