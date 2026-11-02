(() => {
  'use strict';
  const passages = window.EDMUND_INDEFINITE_PRONOUNS?.passages;
  const dashboard = document.querySelector('[data-view="dashboard"]');
  const modes = dashboard?.querySelector('[data-error-id-modes]');
  const grid = modes?.querySelector('.error-id-mode-grid');
  if (!dashboard || !grid || passages?.length !== 10) return;
  const questions = passages.flatMap(passage => passage.questions.map(question => ({ ...question, passage })));
  if (questions.length !== 200) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const anchor = grid.querySelector('.error-id-mode-card--jayden');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'error-id-mode-card error-id-mode-card--indefinite';
  button.innerHTML = '<span class="error-id-mode-card__icon">Aa</span><span class="error-id-mode-card__eyebrow">MODE 03 · INDEFINITE PRONOUNS</span><strong>200 題文章校對</strong><span>10 篇 × 20 題 · 閱讀語境後判斷及改正</span><span class="error-id-mode-card__foot"><b>共 200 題</b><span>開始練習 ↗</span></span>';
  grid.insertBefore(button, anchor);

  const view = document.createElement('section');
  view.className = 'error-id-workspace error-indefinite-workspace';
  view.hidden = true;
  view.innerHTML = '<button type="button" class="error-id-back" data-back>← 返回模式選擇</button><div class="error-id-intro"><div><p class="eyebrow">MODE 03 · INDEFINITE PRONOUNS</p><h2>200 題文章校對</h2><p>先讀完整篇短文。每題可選 ✓ 或 ✕；若有錯，寫出確切錯誤字詞及改法。原檔為學生版，未附答案，本練習不作自動評分。</p></div><strong data-progress></strong></div><label class="jayden-paper">選擇短文 <select data-passage></select></label><div class="error-indefinite-context" data-context></div><nav class="jayden-numbers" aria-label="本篇題目" data-numbers></nav><div data-question></div><div class="error-id-navigation"><button type="button" data-prev>← 上一題</button><button type="button" data-next>下一題 →</button></div><p role="status" aria-live="polite" data-status>答案即時保存在此裝置的帳戶記錄中。</p>';
  dashboard.append(view);
  const get = selector => view.querySelector(selector);
  const status = get('[data-status]');
  for (const passage of passages) {
    const option = document.createElement('option'); option.value = passage.number;
    option.textContent = `短文 ${String(passage.number).padStart(2,'0')} · ${passage.title}`;
    get('[data-passage]').append(option);
  }
  let account = 'guest';
  const state = { current: 1, answers: {} };
  const key = () => `edmund-error-indefinite-200-v1:${account}`;
  function load() {
    try { const saved = JSON.parse(localStorage.getItem(key()) || '{}'); state.current = Number.isInteger(saved.current) && saved.current >= 1 && saved.current <= 200 ? saved.current : 1; state.answers = saved.answers && typeof saved.answers === 'object' ? saved.answers : {}; }
    catch { state.current = 1; state.answers = {}; }
  }
  function save() {
    try { localStorage.setItem(key(), JSON.stringify(state)); }
    catch { status.textContent = '此瀏覽器未能儲存作答，請勿關閉分頁。'; }
  }
  function done(answer) { return answer?.mark === 'tick' || (answer?.mark === 'cross' && String(answer.wrong || '').trim() && String(answer.fix || '').trim()); }
  function render() {
    const q = questions[state.current - 1];
    const answer = state.answers[q.number] || {};
    const submitted = questions.filter(item => done(state.answers[item.number])).length;
    get('[data-progress]').textContent = `${submitted} / 200 已作答`;
    get('[data-passage]').value = String(q.passage.number);
    get('[data-context]').innerHTML = `<strong>短文 ${String(q.passage.number).padStart(2,'0')} · ${esc(q.passage.title)}</strong><span>${esc(q.passage.subtitle)}</span>`;
    get('[data-numbers]').innerHTML = q.passage.questions.map(item => `<button type="button" data-go="${item.number}" ${item.number === q.number ? 'aria-current="step"' : ''}>${item.number}${done(state.answers[item.number]) ? ' ✓' : ''}</button>`).join('');
    get('[data-question]').innerHTML = `<article class="error-id-question"><p class="eyebrow">第 ${q.number} / 200 題</p><p class="error-indefinite-sentence" lang="en">${esc(q.sentence)}</p><div class="jayden-judgments"><button type="button" data-mark="tick" aria-pressed="${answer.mark === 'tick'}">✓ 正確</button><button type="button" data-mark="cross" aria-pressed="${answer.mark === 'cross'}">✕ 有錯</button></div><div class="jayden-fields" data-fields ${answer.mark === 'cross' ? '' : 'hidden'}><label>錯誤字／片語<input data-field="wrong" value="${esc(answer.wrong)}" maxlength="180" autocomplete="off"></label><label>應改為<input data-field="fix" value="${esc(answer.fix)}" maxlength="180" autocomplete="off"></label></div><p class="error-indefinite-note">本題保留你的判斷與修改；可隨時返回更改。</p></article>`;
    get('[data-prev]').disabled = q.number === 1;
    get('[data-next]').disabled = q.number === 200;
    save();
  }
  function open() {
    modes.hidden = true; view.hidden = false;
    for (const selector of ['[data-error-id-single]','[data-error-id-passage]','[data-error-id-bar]','.jayden-workspace']) {
      const other = dashboard.querySelector(selector); if (other) other.hidden = true;
    }
    render(); view.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  button.addEventListener('click', open);
  get('[data-back]').addEventListener('click', () => { view.hidden = true; modes.hidden = false; });
  get('[data-passage]').addEventListener('change', event => { state.current = (Number(event.target.value) - 1) * 20 + 1; render(); });
  get('[data-numbers]').addEventListener('click', event => { const button = event.target.closest('[data-go]'); if (button) { state.current = Number(button.dataset.go); render(); } });
  get('[data-prev]').addEventListener('click', () => { state.current--; render(); });
  get('[data-next]').addEventListener('click', () => { state.current++; render(); });
  get('[data-question]').addEventListener('click', event => {
    const button = event.target.closest('[data-mark]'); if (!button) return;
    state.answers[state.current] = { ...state.answers[state.current], mark: button.dataset.mark };
    render(); status.textContent = '已儲存在此裝置。';
  });
  get('[data-question]').addEventListener('input', event => {
    const field = event.target.dataset.field; if (!field) return;
    state.answers[state.current] = { ...state.answers[state.current], [field]: event.target.value };
    save(); get('[data-progress]').textContent = `${questions.filter(item => done(state.answers[item.number])).length} / 200 已作答`;
    status.textContent = '已儲存在此裝置。';
  });
  window.addEventListener('edmund:learning-portal-session', event => {
    if (event.detail?.portalId !== 'error-identifier') return;
    account = event.detail.user?.id || 'guest'; load(); if (!view.hidden) render();
  });
  account = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.()?.user?.id || 'guest'; load(); render();
})();
