const host = document.createElement('section');
host.className = 'iv-app';
host.setAttribute('aria-label', '不規則動詞練習');
document.querySelector('[data-view="dashboard"]')?.append(host);

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modeLabels = {
  v1: '遮住 V1', v2: '遮住 V2', v3: '遮住 V3',
  v23: '遮住 V2 + V3', all: '只看中文'
};
const hiddenIndexes = {v1:[0], v2:[1], v3:[2], v23:[1,2], all:[0,1,2]};
const audio = new Audio();
let owner = null;
let data = null;
let view = 'table';
let memoryMode = 'v2';
let exampleMode = 'hint';
let showChinese = true;
let search = '';
let order = [];
let page = 0;
let memoryAnswers = {};
let questionAnswers = {};
let checked = {};
let loading = false;
const PAGE_SIZE = 20;

function randomIndex(max) {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] % max;
}
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
function shuffledQuestions() {
  const ids = data.entries.flatMap(entry => [1, 2, 3].map(form => ({id: entry.id, form})));
  // Preserve a genuinely mixed order while making adjacent examples of the same verb impossible.
  for (let attempt = 0; attempt < 1000; attempt++) {
    shuffle(ids);
    if (ids.every((item, i) => !i || item.id !== ids[i - 1].id)) return ids;
  }
  throw new Error('Could not generate a spaced random question order.');
}
function storageKey(suffix) { return `edmund-irregular-verbs:${owner}:${suffix}`; }
function readSaved(suffix) {
  try { return JSON.parse(localStorage.getItem(storageKey(suffix)) || '{}'); }
  catch { return {}; }
}
function save(suffix, value) {
  try { localStorage.setItem(storageKey(suffix), JSON.stringify(value)); }
  catch { /* Practice remains available without local storage. */ }
}
function showStatus(message, kind = '') {
  const status = host.querySelector('[data-status]');
  if (status) { status.textContent = message; status.dataset.kind = kind; }
}
function play(path, button) {
  audio.pause();
  audio.src = `./irregular-verbs/audio/${path}`;
  audio.playbackRate = 1;
  audio.play().catch(() => showStatus('暫時未能播放語音，請再按一次。', 'error'));
  host.querySelectorAll('[data-play]').forEach(node => node.classList.remove('is-playing'));
  button?.classList.add('is-playing');
  audio.onended = () => button?.classList.remove('is-playing');
}
function toolbar() {
  return `<header class="iv-head"><div><span class="iv-kicker">IRREGULAR VERBS · 220 WORDS</span><h2>不規則動詞練習</h2><p>先看四欄總表，再按需要遮住詞形練習。例句會打散排列，讓你從語境判斷正確形式。</p></div><div class="iv-count"><strong>220</strong><span>動詞 · 660 例句</span></div></header>
    <nav class="iv-tabs" aria-label="練習模式"><button type="button" data-view-tab="table" aria-current="${view === 'table' ? 'page' : 'false'}">四欄總表</button><button type="button" data-view-tab="memory" aria-current="${view === 'memory' ? 'page' : 'false'}">01 · 詞形記憶</button><button type="button" data-view-tab="examples" aria-current="${view === 'examples' ? 'page' : 'false'}">02 · 例句填空</button></nav>`;
}
function formTable(practice = false) {
  const entries = data.entries.filter(entry => !search || `${entry.lemma} ${entry.meaning} ${entry.forms.join(' ')}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const hidden = practice ? hiddenIndexes[memoryMode] : [];
  const rows = entries.map(entry => {
    const controls = `<span class="iv-row-actions"><button type="button" class="iv-play" data-play="v${String(entry.id).padStart(3,'0')}.mp3" aria-label="聆聽 ${escapeHtml(entry.lemma)} 三個詞形">▶<span class="sr-only">聆聽</span></button>${practice ? `<button type="button" class="iv-check" data-check-row="${entry.id}">檢查</button><span class="iv-row-result" data-row-result="${entry.id}" role="status"></span>` : ''}</span>`;
    const forms = entry.forms.map((form, index) => hidden.includes(index)
      ? `<td><input class="iv-form-input" data-memory="${entry.id}:${index}" aria-label="第 ${entry.id} 行的 V${index + 1}" type="text" spellcheck="false" autocomplete="off" value="${escapeHtml(memoryAnswers[`${entry.id}:${index}`] || '')}" placeholder="輸入 V${index + 1}"></td>`
      : `<td lang="en">${escapeHtml(form)}</td>`).join('');
    return `<tr data-row="${entry.id}"><th scope="row"><span>${escapeHtml(entry.meaning)}</span>${controls}</th>${forms}</tr>`;
  }).join('');
  return `<div class="iv-table-tools"><label>尋找動詞 <input type="search" data-search value="${escapeHtml(search)}" placeholder="搜尋中文、V1、V2 或 V3" autocomplete="off"></label><span>${entries.length} / 220 個動詞</span></div>
    <p class="iv-swipe-hint">← 左右滑動表格，查看 V1、V2、V3 →</p><div class="iv-table-scroll"><table class="iv-table"><thead><tr><th scope="col">中文意思</th><th scope="col">V1 原形</th><th scope="col">V2 過去式</th><th scope="col">V3 過去分詞</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function renderTable() {
  view = 'table';
  host.innerHTML = toolbar() + `<section class="iv-panel"><div class="iv-section-head"><div><span class="iv-kicker">REFERENCE TABLE</span><h3>中文意思 · V1 · V2 · V3</h3><p>每列可聆聽英式男聲朗讀三個詞形；逗號分隔的是可接受的變體。</p></div></div>${formTable()}</section><p class="iv-status" data-status role="status" aria-live="polite"></p>`;
}
function renderMemory() {
  view = 'memory';
  host.innerHTML = toolbar() + `<section class="iv-panel"><div class="iv-section-head"><div><span class="iv-kicker">01 · MEMORIZATION</span><h3>選擇要遮住的欄位</h3><p>看見其餘欄位，填寫隱藏的詞形，逐列檢查。可接受表內列出的任何變體。</p></div><button type="button" class="iv-soft" data-reset-memory>清空本次輸入</button></div><div class="iv-mode-options" role="group" aria-label="詞形記憶模式">${Object.entries(modeLabels).map(([key,label]) => `<button type="button" data-memory-mode="${key}" aria-pressed="${key === memoryMode}">${label}</button>`).join('')}</div>${formTable(true)}</section><p class="iv-status" data-status role="status" aria-live="polite"></p>`;
}
function questionCard(item, index) {
  const entry = data.entries[item.id - 1];
  const sample = entry.sentences[item.form - 1];
  const number = page * PAGE_SIZE + index + 1;
  const key = `${item.id}:${item.form}`;
  const blanks = sample.parts.map((part, i) => `${escapeHtml(part)}${i < sample.answers.length ? `<input class="iv-blank" data-answer="${key}:${i}" aria-label="第 ${number} 題，第 ${i + 1} 個空格" type="text" spellcheck="false" autocomplete="off" value="${escapeHtml(questionAnswers[`${key}:${i}`] || '')}" placeholder="_______">` : ''}`).join('');
  return `<article class="iv-question" data-question="${key}"><div class="iv-question-top"><span class="iv-question-number">${String(number).padStart(3,'0')}</span><span class="iv-form-badge">V${item.form}</span><button type="button" class="iv-play" data-play="q${String(item.id).padStart(3,'0')}-${item.form}.mp3" aria-label="聆聽第 ${number} 題，不含答案">▶ 聆聽</button></div><p class="iv-english" lang="en">${blanks}${exampleMode === 'hint' ? ` <span class="iv-hint">(${escapeHtml(entry.lemma.replace(' (recline)', ''))})</span>` : ''}</p><p class="iv-chinese" lang="zh-Hant" ${showChinese ? '' : 'hidden'}>${escapeHtml(sample.chinese)}</p><div class="iv-question-foot"><button type="button" class="iv-check" data-check-question="${key}">檢查答案</button><span data-question-result="${key}" role="status">${checked[key] === true ? '✓ 正確' : checked[key] === false ? '再試一次' : ''}</span></div></article>`;
}
function renderExamples() {
  view = 'examples';
  const start = page * PAGE_SIZE;
  const totalPages = Math.ceil(order.length / PAGE_SIZE);
  host.innerHTML = toolbar() + `<section class="iv-panel"><div class="iv-section-head"><div><span class="iv-kicker">02 · SENTENCE PRACTICE</span><h3>在句子中填出正確詞形</h3><p>660 句已混合洗牌；聆聽時不會讀出答案。V1／V2／V3 標籤指出要練習的欄位。</p></div><button type="button" class="iv-soft" data-reshuffle>重新洗牌</button></div><div class="iv-example-controls"><div class="iv-mode-options" role="group" aria-label="例句提示模式"><button type="button" data-example-mode="hint" aria-pressed="${exampleMode === 'hint'}">附原形提示</button><button type="button" data-example-mode="nohint" aria-pressed="${exampleMode === 'nohint'}">不附提示</button></div><button type="button" class="iv-soft" data-toggle-chinese aria-pressed="${showChinese}">${showChinese ? '隱藏中文翻譯' : '顯示中文翻譯'}</button></div><div class="iv-page-info">第 ${start + 1}–${Math.min(start + PAGE_SIZE, order.length)} / ${order.length} 句</div><div class="iv-questions">${order.slice(start, start + PAGE_SIZE).map(questionCard).join('')}</div><div class="iv-pagination"><button type="button" data-page="prev" ${page === 0 ? 'disabled' : ''}>← 上一頁</button><span>${page + 1} / ${totalPages} 頁</span><button type="button" data-page="next" ${page >= totalPages - 1 ? 'disabled' : ''}>下一頁 →</button></div></section><p class="iv-status" data-status role="status" aria-live="polite"></p>`;
}
function render() {
  if (!owner) { host.innerHTML = ''; return; }
  if (!data) { host.innerHTML = '<div class="iv-loading"><span class="iv-loader"></span><p>正在載入 220 個動詞及 660 句例句…</p></div>'; return; }
  if (view === 'memory') renderMemory();
  else if (view === 'examples') renderExamples();
  else renderTable();
}
async function load() {
  if (data || loading) return;
  loading = true;
  render();
  try {
    const response = await fetch('./irregular-verbs/data.json?v=20261014-1');
    if (!response.ok) throw new Error('資料暫時未能載入。');
    const parsed = await response.json();
    if (parsed.entries?.length !== 220 || parsed.entries.some(entry => entry.sentences?.length !== 3)) throw new Error('教材完整性檢查失敗。');
    data = parsed;
    order = shuffledQuestions();
    memoryAnswers = readSaved('memory');
    questionAnswers = readSaved('examples');
    render();
  } catch (error) {
    host.innerHTML = `<div class="iv-error" role="alert"><p>${escapeHtml(error.message)}</p><button type="button" data-retry>重新載入</button></div>`;
  } finally { loading = false; }
}
function checkRow(id) {
  const entry = data.entries[id - 1];
  const indexes = hiddenIndexes[memoryMode];
  const correct = indexes.every(index => {
    const answer = String(memoryAnswers[`${id}:${index}`] || '').trim().toLocaleLowerCase();
    return answer && entry.forms[index].split(',').some(form => answer === form.trim().toLocaleLowerCase().replace(' (recline)', ''));
  });
  const result = host.querySelector(`[data-row-result="${id}"]`);
  if (result) { result.textContent = correct ? '✓ 正確' : '請再試一次'; result.dataset.correct = String(correct); }
}
function checkQuestion(key) {
  const [id, form] = key.split(':').map(Number);
  const sample = data.entries[id - 1].sentences[form - 1];
  const correct = sample.answers.every((answer, index) => String(questionAnswers[`${key}:${index}`] || '').trim().toLocaleLowerCase() === answer.toLocaleLowerCase());
  checked[key] = correct;
  const result = host.querySelector(`[data-question-result="${key}"]`);
  if (result) { result.textContent = correct ? '✓ 正確' : '請再試一次'; result.dataset.correct = String(correct); }
}

host.addEventListener('input', event => {
  const target = event.target;
  if (target.matches('[data-search]')) {
    const selection = target.selectionStart;
    search = target.value;
    if (view === 'memory') renderMemory(); else renderTable();
    const next = host.querySelector('[data-search]');
    next?.focus(); next?.setSelectionRange(selection, selection);
  } else if (target.matches('[data-memory]')) {
    memoryAnswers[target.dataset.memory] = target.value;
    save('memory', memoryAnswers);
    const row = target.closest('[data-row]');
    const result = row?.querySelector('[data-row-result]');
    if (result) { result.textContent = ''; delete result.dataset.correct; }
  } else if (target.matches('[data-answer]')) {
    questionAnswers[target.dataset.answer] = target.value;
    save('examples', questionAnswers);
    const key = target.dataset.answer.split(':').slice(0,2).join(':');
    delete checked[key];
    const result = target.closest('[data-question]')?.querySelector('[data-question-result]');
    if (result) { result.textContent = ''; delete result.dataset.correct; }
  }
});
host.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.retry !== undefined) { load(); return; }
  if (button.dataset.play) { play(button.dataset.play, button); return; }
  if (button.dataset.viewTab) { audio.pause(); view = button.dataset.viewTab; search = ''; render(); return; }
  if (button.dataset.memoryMode) { memoryMode = button.dataset.memoryMode; renderMemory(); return; }
  if (button.dataset.exampleMode) { exampleMode = button.dataset.exampleMode; renderExamples(); return; }
  if (button.dataset.toggleChinese !== undefined) { showChinese = !showChinese; renderExamples(); return; }
  if (button.dataset.checkRow) { checkRow(Number(button.dataset.checkRow)); return; }
  if (button.dataset.checkQuestion) { checkQuestion(button.dataset.checkQuestion); return; }
  if (button.dataset.resetMemory !== undefined) { memoryAnswers = {}; save('memory', memoryAnswers); renderMemory(); return; }
  if (button.dataset.reshuffle !== undefined) { audio.pause(); order = shuffledQuestions(); page = 0; renderExamples(); return; }
  if (button.dataset.page) { audio.pause(); page += button.dataset.page === 'next' ? 1 : -1; renderExamples(); host.scrollIntoView({behavior:'smooth',block:'start'}); }
});

window.addEventListener('edmund:learning-portal-session', event => {
  if (event.detail?.portalId !== 'irregular-verb') return;
  const nextOwner = event.detail.user?.id || null;
  audio.pause();
  if (nextOwner !== owner) {
    owner = nextOwner;
    memoryAnswers = {};
    questionAnswers = {};
    checked = {};
    view = 'table';
    page = 0;
    search = '';
    if (owner && data) {
      memoryAnswers = readSaved('memory');
      questionAnswers = readSaved('examples');
      order = shuffledQuestions();
    }
  }
  if (owner && !data) load(); else render();
});
const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession();
if (session?.user?.id) { owner = session.user.id; load(); }
