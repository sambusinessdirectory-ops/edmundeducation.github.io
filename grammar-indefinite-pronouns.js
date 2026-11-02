(() => {
  'use strict';
  const data = window.EDMUND_INDEFINITE_PRONOUNS;
  const references = window.EDMUND_INDEFINITE_ANSWERS;
  const dashboard = document.querySelector('[data-learning-portal-root] [data-view="dashboard"]');
  const library = dashboard?.querySelector('[data-grammar-library]');
  if (!data || !dashboard || !library || data.exercises?.length !== 250 || references?.length !== 250 || references.some((item, index) => item.number !== index + 1 || !item.answer || !item.explanation)) return;
  const slug = data.guide.slug;
  const card = [...library.querySelectorAll('.grammar-lesson-card--new-curation')].find(el => el.textContent.includes(data.guide.english));
  const guide = dashboard.querySelector(`[data-new-grammar-curation="${slug}"]`);
  if (!card || !guide) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storage = window.EDMUND_DURABLE_STUDENT_PROGRESS;
  if (!storage) return;
  let account = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.()?.user?.id || 'guest';
  let loadVersion = 0;
  let writeQueue = Promise.resolve();
  let ready = Promise.resolve();
  const state = { question: 1, drafts: {}, done: {} };
  const key = (owner = account) => `edmund-grammar-indefinite-250-v1:${owner}`;
  async function load() {
    const version = ++loadVersion, owner = account;
    const saved = await storage.read(key(owner));
    if (version !== loadVersion || owner !== account) return;
    state.question = Number.isInteger(saved?.question) && saved.question >= 1 && saved.question <= 250 ? saved.question : 1;
    state.drafts = saved?.drafts && typeof saved.drafts === 'object' ? saved.drafts : {};
    state.done = saved?.done && typeof saved.done === 'object' ? saved.done : {};
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
  view.innerHTML = `<div class="grammar-practice__head"><div><button type="button" class="grammar-button--ghost" data-back-guide>← 返回導讀</button><button type="button" class="grammar-button--ghost" data-back-library>返回語法目錄</button><p class="eyebrow">MODULE 07 · INDEFINITE PRONOUNS</p><h2>逐題練習 · 250 題</h2><p>依題目指示選詞、改寫、解釋或寫作。原學生版未附答案；提交後可查看本頁編寫的參考答案與解析，不作自動評分。</p></div><div class="grammar-practice__summary"><strong data-count>0</strong><span>/ 250<br>已完成</span></div></div><div class="grammar-progress" role="progressbar" aria-label="已完成進度" aria-valuemin="0" aria-valuemax="250" aria-valuenow="0"><span data-progress></span></div><div class="grammar-navigator"><div class="grammar-navigator__bar"><label>題目範圍 <select class="grammar-range-select" data-range></select></label><span>可隨時返回修改答案。</span></div><div class="grammar-number-grid" data-numbers></div></div><article class="grammar-question"><div class="grammar-question__meta"><span class="grammar-question__number" data-number></span><span data-section></span></div><p class="grammar-question__prompt" lang="en" data-prompt></p><p class="grammar-question__translation" lang="zh-Hant" data-translation></p><label class="grammar-indefinite-answer">我的答案<textarea rows="5" data-answer spellcheck="true"></textarea></label><div class="grammar-indefinite-actions"><button type="button" class="grammar-button grammar-button--primary" data-finish>完成並查看參考答案與解析</button><button type="button" class="grammar-button--ghost" data-unfinish>重新作答</button><button type="button" class="grammar-button--ghost" data-backup hidden>下載作答備份</button></div><section class="grammar-indefinite-reveal" data-reveal hidden aria-labelledby="grammar-indefinite-reveal-heading"><p class="grammar-indefinite-reveal__eyebrow">REVIEW · 對照學習</p><h3 id="grammar-indefinite-reveal-heading">參考答案與解析</h3><p class="grammar-indefinite-reveal__provenance">原學生版未附答案。以下是本頁編寫的參考作答；開放式題目可以有其他正確答案。</p><div class="grammar-indefinite-reveal__answer"><span>參考答案</span><p lang="en" data-model-answer></p></div><div class="grammar-indefinite-reveal__explanation"><span>解析</span><p lang="zh-Hant" data-model-explanation></p></div><button type="button" class="grammar-button--ghost" data-related-topic>閱讀對應語法導讀 ↗</button></section><p class="grammar-save-status" role="status" aria-live="polite" data-status>正在載入作答…</p></article><nav class="grammar-nav" aria-label="題目導覽"><button type="button" data-prev>← 上一題</button><button type="button" data-next>下一題 →</button></nav>`;
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
    const reference = references[state.question - 1];
    const count = Object.keys(state.done).filter(n => state.done[n]).length;
    get('[data-number]').textContent = `第 ${q.number} / 250 題`;
    get('[data-section]').textContent = q.section;
    const split = q.prompt.match(/^(.{1,140}?:)\s+(.+)$/);
    const instruction = split && /^(Choose|Complete|Use|Correct|Rewrite|Replace|Write|Put|Expand|Fill|Change|Join|Explain|Compare|Select|Make|Turn|Add|Decide|Identify|Answer|Pick|Insert|Form|Finish|Combine|Start|Give|Supply|Express|Show|Say|Read|Keep|Front|Omit|For|Both|Name|Six|Twenty)\b/i.test(split[1]);
    if (instruction) get('[data-prompt]').innerHTML = `<span class="grammar-indefinite-direction">${esc(split[1])}</span><span class="grammar-indefinite-sentence">${esc(split[2])}</span>`;
    else get('[data-prompt]').textContent = q.prompt;
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
    get('[data-reveal]').hidden = !state.done[q.number];
    get('[data-model-answer]').textContent = reference.answer;
    get('[data-model-explanation]').textContent = reference.explanation;
    get('[data-related-topic]').dataset.topic = reference.topic;
    if (!view.hidden) setRoute(true);
  }
  async function open(number = state.question) {
    await ready;
    dashboard.querySelectorAll('[data-tense-curation], [data-grammar-practice], [data-articles-curation], [data-articles-practice], [data-advanced-articles-curation], [data-advanced-articles-practice], [data-new-grammar-curation], [data-new-grammar-practice]').forEach(section => { section.hidden = true; });
    library.hidden = true; view.hidden = false;
    state.question = Math.min(250, Math.max(1, Number(number) || 1)); render();
    view.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  practiceButton.addEventListener('click', () => open());
  guideButton.addEventListener('click', () => open());
  get('[data-answer]').addEventListener('input', event => { state.drafts[state.question] = event.target.value; save(); });
  get('[data-finish]').addEventListener('click', () => { if (!String(state.drafts[state.question] || '').trim()) { status.textContent = '請先寫下答案。'; return; } state.done[state.question] = true; render(); save(); get('[data-reveal]').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  get('[data-unfinish]').addEventListener('click', () => { delete state.done[state.question]; render(); save(); });
  get('[data-numbers]').addEventListener('click', event => { const button = event.target.closest('[data-go]'); if (button) { state.question = Number(button.dataset.go); render(); save(); } });
  get('[data-range]').addEventListener('change', event => { state.question = Number(event.target.value); render(); save(); });
  get('[data-prev]').addEventListener('click', () => { state.question--; render(); save(); });
  get('[data-next]').addEventListener('click', () => { state.question++; render(); save(); });
  get('[data-backup]').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], {type:'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'grammar-indefinite-pronouns-answers.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  get('[data-back-guide]').addEventListener('click', () => { view.hidden = true; card.querySelector('.grammar-lesson-card__stats button').click(); });
  get('[data-related-topic]').addEventListener('click', event => {
    const target = guide.querySelector(`#${slug}-topic-${event.currentTarget.dataset.topic}`);
    view.hidden = true;
    card.querySelector('.grammar-lesson-card__stats button').click();
    (target || guide).scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  get('[data-back-library]').addEventListener('click', () => { view.hidden = true; library.hidden = false; setRoute(false); library.scrollIntoView({ behavior: 'instant', block: 'start' }); });
  window.addEventListener('edmund:learning-portal-session', event => { if (event.detail?.portalId !== 'grammar') return; account = event.detail.user?.id || 'guest'; ready = load(); });
  ready = load();
  const requested = new URLSearchParams(location.search);
  if (requested.get('lesson') === slug && requested.get('view') === 'practice') open(requested.get('question'));
})();
