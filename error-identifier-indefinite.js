(() => {
  'use strict';
  const passages = window.EDMUND_INDEFINITE_PRONOUNS?.passages;
  const dashboard = document.querySelector('[data-view="dashboard"]');
  const modes = dashboard?.querySelector('[data-error-id-modes]');
  const moduleList = modes?.querySelector('.error-id-module-list') || modes?.querySelector('.error-id-mode-grid');
  if (!dashboard || !moduleList || passages?.length !== 10) return;
  const questions = passages.flatMap(passage => passage.questions.map(question => ({ ...question, passage })));
  if (questions.length !== 200) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const storage = window.EDMUND_DURABLE_STUDENT_PROGRESS;
  if (!storage) return;
  const anchor = moduleList.querySelector('[data-open-jayden]') || moduleList.querySelector('.error-id-mode-card--jayden');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'error-id-module-card error-id-mode-card error-id-module-card--two error-id-mode-card--indefinite';
  button.dataset.module = '2';
  button.innerHTML = '<span class="error-id-module-card__number" aria-hidden="true">02</span><span class="error-id-module-card__copy"><span>MODULE 2 · INDEFINITE PRONOUNS</span><strong>Module 2</strong><small>不定代名詞單句校對</small></span><span class="error-id-module-card__action"><b>共 200 題</b><span>繼續目前進度 ↗</span></span>';
  moduleList.insertBefore(button, anchor);

  const view = document.createElement('section');
  view.className = 'error-id-workspace error-indefinite-workspace';
  view.hidden = true;
  view.innerHTML = '<button type="button" class="error-id-back" data-back>← 返回模式選擇</button><div class="error-id-intro"><div><p class="eyebrow">MODULE 2 · INDEFINITE PRONOUNS</p><h2>Module 2 · 單句校對</h2><p>每次集中處理一句。選擇 ✓ 或 ✕；若有錯，寫出確切錯誤字詞及改法。原檔為學生版，未附答案，本練習不作自動評分。</p></div><strong data-progress></strong></div><label class="jayden-paper">選擇題組 <select data-passage></select></label><div class="error-indefinite-context" data-context></div><nav class="jayden-numbers" aria-label="本組題目" data-numbers></nav><div data-question></div><div class="error-id-navigation"><button type="button" data-prev>← 上一題</button><button type="button" data-next>下一題 →</button></div><p role="status" aria-live="polite" data-status>正在載入作答…</p><button type="button" class="error-id-back" data-backup hidden>下載作答備份</button>';
  dashboard.append(view);
  const get = selector => view.querySelector(selector);
  const status = get('[data-status]');
  for (const passage of passages) {
    const option = document.createElement('option'); option.value = passage.number;
    option.textContent = `題組 ${String(passage.number).padStart(2,'0')} · ${passage.title}`;
    get('[data-passage]').append(option);
  }
  let account = 'guest';
  let loadVersion = 0;
  let writeQueue = Promise.resolve();
  let ready = Promise.resolve();
  const state = { current: 1, answers: {} };
  const key = (owner = account) => `edmund-error-indefinite-200-v1:${owner}`;
  async function load() {
    const version = ++loadVersion, owner = account;
    const saved = await storage.read(key(owner));
    if (version !== loadVersion || owner !== account) return;
    state.current = Number.isInteger(saved?.current) && saved.current >= 1 && saved.current <= 200 ? saved.current : 1;
    state.answers = saved?.answers && typeof saved.answers === 'object' ? saved.answers : {};
    render();
    status.textContent = '作答會保存在此裝置。';
  }
  function save() {
    const owner = account, snapshot = JSON.parse(JSON.stringify(state));
    status.textContent = '正在儲存作答…';
    writeQueue = writeQueue.catch(() => {}).then(() => storage.write(key(owner), snapshot)).then(result => {
      if (owner !== account) return;
      status.textContent = result === 'unavailable' ? '此瀏覽器封鎖了儲存。請下載作答備份，避免遺失。' : '已儲存在此裝置。';
      get('[data-backup]').hidden = result !== 'unavailable';
    });
  }
  function done(answer) { return answer?.mark === 'tick' || (answer?.mark === 'cross' && String(answer.wrong || '').trim() && String(answer.fix || '').trim()); }
  function firstIncomplete() {
    for (let number = 1; number <= questions.length; number++) if (!done(state.answers[number])) return number;
    return 1;
  }
  function requestedMode() { return new URLSearchParams(location.search).get('mode'); }
  function setRoute(mode) {
    const route = new URL(location.href);
    if (mode) route.searchParams.set('mode', mode); else route.searchParams.delete('mode');
    route.searchParams.delete('question'); route.searchParams.delete('passage');
    history.replaceState(null, '', route);
  }
  function render() {
    const q = questions[state.current - 1];
    const answer = state.answers[q.number] || {};
    const submitted = questions.filter(item => done(state.answers[item.number])).length;
    get('[data-progress]').textContent = `${submitted} / 200 已作答`;
    get('[data-passage]').value = String(q.passage.number);
    get('[data-context]').innerHTML = `<strong>題組 ${String(q.passage.number).padStart(2,'0')} · ${esc(q.passage.title)}</strong><span>${esc(q.passage.subtitle)}</span>`;
    get('[data-numbers]').innerHTML = q.passage.questions.map(item => `<button type="button" data-go="${item.number}" ${item.number === q.number ? 'aria-current="step"' : ''}>${item.number}${done(state.answers[item.number]) ? ' ✓' : ''}</button>`).join('');
    get('[data-question]').innerHTML = `<article class="error-id-question"><p class="eyebrow">第 ${q.number} / 200 題</p><p class="error-indefinite-sentence" lang="en">${esc(q.sentence)}</p><div class="jayden-judgments"><button type="button" data-mark="tick" aria-pressed="${answer.mark === 'tick'}">✓ 正確</button><button type="button" data-mark="cross" aria-pressed="${answer.mark === 'cross'}">✕ 有錯</button></div><div class="jayden-fields" data-fields ${answer.mark === 'cross' ? '' : 'hidden'}><label>錯誤字／片語<input data-field="wrong" value="${esc(answer.wrong)}" maxlength="180" autocomplete="off"></label><label>應改為<input data-field="fix" value="${esc(answer.fix)}" maxlength="180" autocomplete="off"></label></div><p class="error-indefinite-note">本題保留你的判斷與修改；可隨時返回更改。</p></article>`;
    get('[data-prev]').disabled = q.number === 1;
    get('[data-next]').disabled = q.number === 200;
  }
  async function open(resume = false) {
    await ready;
    if (resume) state.current = firstIncomplete();
    setRoute('indefinite');
    modes.hidden = true; view.hidden = false;
    for (const selector of ['[data-error-id-single]','[data-error-id-passage]','[data-error-id-bar]','.jayden-workspace']) {
      const other = dashboard.querySelector(selector); if (other) other.hidden = true;
    }
    render(); view.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  function applyHomeworkRoute() { if (requestedMode() === 'indefinite') void open(true); }
  button.addEventListener('click', () => open(true));
  get('[data-back]').addEventListener('click', () => { setRoute(''); view.hidden = true; modes.hidden = false; });
  get('[data-passage]').addEventListener('change', event => { state.current = (Number(event.target.value) - 1) * 20 + 1; render(); save(); });
  get('[data-numbers]').addEventListener('click', event => { const button = event.target.closest('[data-go]'); if (button) { state.current = Number(button.dataset.go); render(); save(); } });
  get('[data-prev]').addEventListener('click', () => { state.current--; render(); save(); });
  get('[data-next]').addEventListener('click', () => { state.current++; render(); save(); });
  get('[data-question]').addEventListener('click', event => {
    const button = event.target.closest('[data-mark]'); if (!button) return;
    state.answers[state.current] = { ...state.answers[state.current], mark: button.dataset.mark };
    render(); save();
  });
  get('[data-question]').addEventListener('input', event => {
    const field = event.target.dataset.field; if (!field) return;
    state.answers[state.current] = { ...state.answers[state.current], [field]: event.target.value };
    save(); get('[data-progress]').textContent = `${questions.filter(item => done(state.answers[item.number])).length} / 200 已作答`;
  });
  get('[data-backup]').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], {type:'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'error-indefinite-pronouns-answers.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  window.addEventListener('edmund:learning-portal-session', event => {
    if (event.detail?.portalId !== 'error-identifier') return;
    account = event.detail.user?.id || 'guest'; ready = load(); void ready.then(applyHomeworkRoute);
  });
  account = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.()?.user?.id || 'guest'; ready = load(); void ready.then(applyHomeworkRoute);
})();
