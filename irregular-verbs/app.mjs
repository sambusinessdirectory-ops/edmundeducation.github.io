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
let priority = null;
let view = 'table';
let sortMode = 'alphabetical';
let memoryMode = 'v2';
let exampleMode = 'hint';
let showChinese = true;
let search = '';
let order = [];
let page = 0;
let memoryAnswers = {};
let questionAnswers = {};
let checked = {};
let memoryChecked = {};
let challenge = null;
let loading = false;
const PAGE_SIZE = 20;
const letters = 'ABCDEF';
function matchesForm(answer, listed) {
  const normalized = String(answer || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
  return !!normalized && (normalized === listed.toLocaleLowerCase() || listed.split(',').some(form => normalized === form.trim().toLocaleLowerCase().replace(/ \(recline\)$/, '')));
}
function orderedEntries() {
  return sortMode === 'priority' && priority ? priority.order.map(id => data.entries[id - 1]) : data.entries;
}

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
    <nav class="iv-tabs" aria-label="練習模式"><button type="button" data-view-tab="table" aria-current="${view === 'table' ? 'page' : 'false'}">四欄總表</button><button type="button" data-view-tab="memory" aria-current="${view === 'memory' ? 'page' : 'false'}">01 · 詞形記憶</button><button type="button" data-view-tab="examples" aria-current="${view === 'examples' ? 'page' : 'false'}">02 · 例句填空</button><button type="button" data-view-tab="challenge" aria-current="${view === 'challenge' ? 'page' : 'false'}">03 · 無限挑戰</button></nav>`;
}
function formTable(practice = false) {
  const entries = orderedEntries().filter(entry => !search || `${entry.lemma} ${entry.meaning} ${entry.forms.join(' ')}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const hidden = practice ? hiddenIndexes[memoryMode] : [];
  const rows = entries.map(entry => {
    const controls = `<span class="iv-row-actions"><button type="button" class="iv-play" data-play="v${String(entry.id).padStart(3,'0')}.mp3" aria-label="聆聽 ${escapeHtml(entry.lemma)} 三個詞形">▶<span class="sr-only">聆聽</span></button>${practice ? `<button type="button" class="iv-check" data-check-row="${entry.id}">檢查</button>` : ''}</span>`;
    const forms = entry.forms.map((form, index) => hidden.includes(index)
      ? `<td><input class="iv-form-input" data-memory="${entry.id}:${index}" aria-label="第 ${entry.id} 行的 V${index + 1}" type="text" spellcheck="false" autocomplete="off" value="${escapeHtml(memoryAnswers[`${entry.id}:${index}`] || '')}" placeholder="輸入 V${index + 1}">${memoryChecked[`${entry.id}:${index}`] === true ? '<small class="iv-cell-feedback is-correct">✓ 正確</small>' : memoryChecked[`${entry.id}:${index}`] === false ? `<small class="iv-cell-feedback is-wrong">正解：${escapeHtml(form)}</small>` : ''}</td>`
      : `<td lang="en">${escapeHtml(form)}</td>`).join('');
    return `<tr data-row="${entry.id}"><th scope="row"><span>${escapeHtml(entry.meaning)}</span>${controls}</th>${forms}</tr>`;
  }).join('');
  return `<div class="iv-table-tools"><label>尋找動詞 <input type="search" data-search value="${escapeHtml(search)}" placeholder="搜尋中文、V1、V2 或 V3" autocomplete="off"></label><span>${entries.length} / 220 個動詞</span></div>
    <p class="iv-swipe-hint">← 左右滑動表格，查看 V1、V2、V3 →</p><div class="iv-table-scroll"><table class="iv-table"><thead><tr><th scope="col">中文意思</th><th scope="col">V1 原形</th><th scope="col">V2 過去式</th><th scope="col">V3 過去分詞</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function renderTable() {
  view = 'table';
  const pdf = sortMode === 'priority' ? 'learning-priority' : 'alphabetical';
  host.innerHTML = toolbar() + `<section class="iv-panel"><div class="iv-section-head"><div><span class="iv-kicker">REFERENCE TABLE</span><h3>中文意思 · V1 · V2 · V3</h3><p>每列可聆聽英式男聲朗讀三個詞形；逗號分隔的是可接受的變體。</p></div><a class="iv-export" href="./output/pdf/irregular-verbs-${pdf}.pdf" download>匯出此排序 PDF ↓</a></div><div class="iv-sort" role="group" aria-label="參考表排序"><button type="button" data-sort="alphabetical" aria-pressed="${sortMode === 'alphabetical'}">字母順序</button><button type="button" data-sort="priority" aria-pressed="${sortMode === 'priority'}">常用優先</button></div>${sortMode === 'priority' ? '<p class="iv-source-note">常用優先按英國國家語料庫動詞詞元頻率排列；be、awake 按教學需要先列。未收錄的詞按字母排序。資料：<a href="https://ucrel.lancs.ac.uk/bncfreq/" target="_blank" rel="noopener">UCREL / BNC（CC BY-SA 2.0 UK）↗</a></p>' : ''}${formTable()}</section><p class="iv-status" data-status role="status" aria-live="polite"></p>`;
}
function renderMemory() {
  view = 'memory';
  host.innerHTML = toolbar() + `<section class="iv-panel"><div class="iv-section-head"><div><span class="iv-kicker">01 · MEMORIZATION</span><h3>選擇要遮住的欄位</h3><p>填好多少就提交多少；核對正解後可重做錯題。逗號分隔的變體均可接受。</p></div><button type="button" class="iv-soft" data-reset-memory>清空本次輸入</button></div><div class="iv-mode-options" role="group" aria-label="詞形記憶模式">${Object.entries(modeLabels).map(([key,label]) => `<button type="button" data-memory-mode="${key}" aria-pressed="${key === memoryMode}">${label}</button>`).join('')}</div>${formTable(true)}</section><p class="iv-status" data-status role="status" aria-live="polite"></p>${submissionBar('memory')}`;
}
function memoryCounts() {
  const keys = data.entries.flatMap(entry => hiddenIndexes[memoryMode].map(index => `${entry.id}:${index}`));
  return {filled:keys.filter(key => String(memoryAnswers[key] || '').trim()).length,total:keys.length,correct:keys.filter(key => memoryChecked[key] === true).length,wrong:keys.filter(key => memoryChecked[key] === false).length};
}
function exampleCounts() {
  const keys = data.entries.flatMap(entry => [1,2,3].map(form => `${entry.id}:${form}`));
  return {filled:keys.filter(key => { const sample = sampleFor(key); return sample.answers.every((_,i) => String(questionAnswers[`${key}:${i}`] || '').trim()); }).length,total:keys.length,correct:keys.filter(key => checked[key] === true).length,wrong:keys.filter(key => checked[key] === false).length};
}
function submissionBar(kind) {
  const counts = kind === 'memory' ? memoryCounts() : exampleCounts();
  return `<aside class="iv-submit-bar" aria-label="${kind === 'memory' ? '詞形記憶' : '例句填空'}提交欄"><div class="iv-submit-info"><strong>已填 <span data-filled>${counts.filled}</span> / ${counts.total}</strong><span>答對 <b data-correct>${counts.correct}</b> · 待重做 <b data-wrong>${counts.wrong}</b></span></div><div class="iv-submit-actions"><button type="button" data-batch-submit="${kind}">提交已填答案</button><button type="button" class="iv-redo" data-batch-redo="${kind}" ${counts.wrong ? '' : 'disabled'}>重做錯題</button></div></aside>`;
}
function refreshSubmissionBar() {
  const counts = view === 'memory' ? memoryCounts() : view === 'examples' ? exampleCounts() : null;
  if (!counts) return;
  for (const [attribute,value] of Object.entries({filled:counts.filled,correct:counts.correct,wrong:counts.wrong})) {
    const el = host.querySelector(`[data-${attribute}]`); if (el) el.textContent = value;
  }
  const redo = host.querySelector('[data-batch-redo]'); if (redo) redo.disabled = !counts.wrong;
}
function sampleFor(key) {
  const [id,form] = key.split(':').map(Number);
  return data.entries[id - 1].sentences[form - 1];
}
function questionCard(item, index) {
  const entry = data.entries[item.id - 1];
  const sample = entry.sentences[item.form - 1];
  const number = page * PAGE_SIZE + index + 1;
  const key = `${item.id}:${item.form}`;
  const blanks = sample.parts.map((part, i) => `${escapeHtml(part)}${i < sample.answers.length ? `<input class="iv-blank" data-answer="${key}:${i}" aria-label="第 ${number} 題，第 ${i + 1} 個空格" type="text" spellcheck="false" autocomplete="off" value="${escapeHtml(questionAnswers[`${key}:${i}`] || '')}" placeholder="_______">` : ''}`).join('');
  return `<article class="iv-question" data-question="${key}"><div class="iv-question-top"><span class="iv-question-number">${String(number).padStart(3,'0')}</span><span class="iv-form-badge">V${item.form}</span><button type="button" class="iv-play" data-play="q${String(item.id).padStart(3,'0')}-${item.form}.mp3" aria-label="聆聽第 ${number} 題，不含答案">▶ 聆聽</button></div><p class="iv-english" lang="en">${blanks}${exampleMode === 'hint' ? ` <span class="iv-hint">(${escapeHtml(entry.lemma.replace(' (recline)', ''))})</span>` : ''}</p><p class="iv-chinese" lang="zh-Hant" ${showChinese ? '' : 'hidden'}>${escapeHtml(sample.chinese)}</p><div class="iv-question-foot"><button type="button" class="iv-check" data-check-question="${key}">檢查答案</button><span data-question-result="${key}" role="status">${checked[key] === true ? '✓ 正確' : checked[key] === false ? `正解：${escapeHtml(sample.answers.join('、'))}` : ''}</span></div></article>`;
}
function renderExamples() {
  view = 'examples';
  const start = page * PAGE_SIZE;
  const totalPages = Math.ceil(order.length / PAGE_SIZE);
  host.innerHTML = toolbar() + `<section class="iv-panel"><div class="iv-section-head"><div><span class="iv-kicker">02 · SENTENCE PRACTICE</span><h3>在句子中填出正確詞形</h3><p>660 句已混合洗牌；可隨時提交已完成的句子，核對正解及重做錯題。</p></div><button type="button" class="iv-soft" data-reshuffle>重新洗牌</button></div><div class="iv-example-controls"><div class="iv-mode-options" role="group" aria-label="例句提示模式"><button type="button" data-example-mode="hint" aria-pressed="${exampleMode === 'hint'}">附原形提示</button><button type="button" data-example-mode="nohint" aria-pressed="${exampleMode === 'nohint'}">不附提示</button></div><button type="button" class="iv-soft" data-toggle-chinese aria-pressed="${showChinese}">${showChinese ? '隱藏中文翻譯' : '顯示中文翻譯'}</button></div><div class="iv-page-info">第 ${start + 1}–${Math.min(start + PAGE_SIZE, order.length)} / ${order.length} 句</div><div class="iv-questions">${order.slice(start, start + PAGE_SIZE).map(questionCard).join('')}</div><div class="iv-pagination"><button type="button" data-page="prev" ${page === 0 ? 'disabled' : ''}>← 上一頁</button><span>${page + 1} / ${totalPages} 頁</span><button type="button" data-page="next" ${page >= totalPages - 1 ? 'disabled' : ''}>下一頁 →</button></div></section><p class="iv-status" data-status role="status" aria-live="polite"></p>${submissionBar('examples')}`;
}
function newChallengeState() { return {attempts:0,correct:0,streak:0,pending:[],bag:shuffle(data.entries.map(entry => entry.id)),current:null}; }
function challengeItem(id, formIndex, retry = false) {
  const entry = data.entries[id - 1];
  const distractors = shuffle(data.entries.filter(other => other.id !== id && other.meaning !== entry.meaning).map(other => other.id));
  const used = new Set([entry.meaning]);
  const options = [id];
  for (const otherId of distractors) {
    const meaning = data.entries[otherId - 1].meaning;
    if (!used.has(meaning)) { options.push(otherId); used.add(meaning); }
    if (options.length === 6) break;
  }
  return {id,formIndex,retry,options:shuffle(options),choice:null,inputs:{},result:null};
}
function nextChallenge() {
  const turn = challenge.attempts + 1;
  const dueIndex = challenge.pending.findIndex(item => item.dueAt <= turn);
  if (dueIndex >= 0) {
    const [due] = challenge.pending.splice(dueIndex, 1);
    challenge.current = challengeItem(due.id, due.formIndex, true);
  } else {
    if (!challenge.bag.length) challenge.bag = shuffle(data.entries.map(entry => entry.id));
    const id = challenge.bag.pop();
    challenge.current = challengeItem(id, randomIndex(3));
  }
  save('challenge', challenge);
}
function renderChallenge() {
  view = 'challenge';
  if (!challenge?.current) { challenge = newChallengeState(); nextChallenge(); }
  const item = challenge.current;
  const entry = data.entries[item.id - 1];
  const sample = entry.sentences[item.formIndex];
  const inputs = entry.forms.map((form,index) => index === item.formIndex
    ? `<div class="iv-form-given"><small>V${index + 1}</small><strong>${escapeHtml(form)}</strong></div>`
    : `<label class="iv-challenge-input"><span>V${index + 1}</span><input type="text" data-challenge-input="${index}" value="${escapeHtml(item.inputs[index] || '')}" spellcheck="false" autocomplete="off" placeholder="填寫 V${index + 1}" ${item.result ? 'disabled' : ''}><small class="${item.result?.forms[index] === false ? 'is-wrong' : 'is-correct'}">${item.result ? item.result.forms[index] ? '✓ 正確' : `正解：${escapeHtml(form)}` : ''}</small></label>`).join('');
  host.innerHTML = toolbar() + `<section class="iv-panel iv-challenge"><div class="iv-section-head"><div><span class="iv-kicker">03 · ENDLESS CHALLENGE</span><h3>無限挑戰</h3><p>先辨認中文意思，再補上另外兩個詞形。答錯的動詞會在約 5–7 題後重現。</p></div></div><div class="iv-scoreboard"><div><strong data-attempt-count>${challenge.attempts}</strong><span>累計嘗試</span></div><div><strong>${challenge.correct}</strong><span>答對次數</span></div><div><strong>${challenge.streak}</strong><span>連續答對</span></div></div><article class="iv-challenge-card" data-challenge-id="${item.id}" data-form-index="${item.formIndex}"><div class="iv-challenge-word"><span>${item.retry ? '再挑戰' : '隨機詞形'} · V${item.formIndex + 1}</span><strong lang="en">${escapeHtml(entry.forms[item.formIndex])}</strong></div><p class="iv-challenge-example" lang="en">${escapeHtml(sample.english)}</p><fieldset class="iv-choices"><legend>這個動詞的意思是甚麼？</legend>${item.options.map((id,index) => `<button type="button" data-choice="${id}" aria-pressed="${item.choice === id}" ${item.result ? 'disabled' : ''}><span>${letters[index]}</span>${escapeHtml(data.entries[id - 1].meaning)}</button>`).join('')}</fieldset><div class="iv-form-challenge"><p>補上另外兩個詞形</p><div class="iv-form-trio">${inputs}</div></div>${item.result ? `<div class="iv-challenge-result ${item.result.all ? 'is-correct' : 'is-wrong'}" role="status">${item.result.all ? '全部正確，繼續挑戰！' : `再練幾題後，這個動詞會再出現。正確意思：${escapeHtml(entry.meaning)}。`}</div><button type="button" class="iv-challenge-next" data-challenge-next>下一題 →</button>` : '<button type="button" class="iv-challenge-submit" data-challenge-submit>提交本題</button>'}</article></section><p class="iv-status" data-status role="status" aria-live="polite"></p>`;
}
function submitChallenge() {
  const item = challenge.current;
  const entry = data.entries[item.id - 1];
  const missing = [0,1,2].filter(index => index !== item.formIndex);
  if (!item.choice || missing.some(index => !String(item.inputs[index] || '').trim())) { showStatus('請先選擇中文意思，並填寫另外兩個詞形。', 'error'); return; }
  const forms = Object.fromEntries(missing.map(index => [index,matchesForm(item.inputs[index],entry.forms[index])]));
  const all = item.choice === item.id && missing.every(index => forms[index]);
  item.result = {all,forms};
  challenge.attempts++;
  if (all) { challenge.correct++; challenge.streak++; }
  else { challenge.streak = 0; challenge.pending.push({id:item.id,formIndex:item.formIndex,dueAt:challenge.attempts+6+randomIndex(3)}); }
  save('challenge',challenge);
  renderChallenge();
}
function render() {
  if (!owner) { host.innerHTML = ''; return; }
  if (!data) { host.innerHTML = '<div class="iv-loading"><span class="iv-loader"></span><p>正在載入 220 個動詞及 660 句例句…</p></div>'; return; }
  if (view === 'memory') renderMemory();
  else if (view === 'examples') renderExamples();
  else if (view === 'challenge') renderChallenge();
  else renderTable();
}
async function load() {
  if (data || loading) return;
  loading = true;
  render();
  try {
    const [response, priorityResponse] = await Promise.all([fetch('./irregular-verbs/data.json?v=20261014-2'),fetch('./irregular-verbs/priority.json?v=20261014-2')]);
    if (!response.ok || !priorityResponse.ok) throw new Error('資料暫時未能載入。');
    const [parsed, parsedPriority] = await Promise.all([response.json(), priorityResponse.json()]);
    if (parsed.entries?.length !== 220 || parsed.entries.some(entry => entry.sentences?.length !== 3)) throw new Error('教材完整性檢查失敗。');
    if (parsedPriority.order?.length !== 220 || new Set(parsedPriority.order).size !== 220 || parsedPriority.order.some(id => !parsed.entries[id - 1])) throw new Error('排序資料完整性檢查失敗。');
    data = parsed;
    priority = parsedPriority;
    order = shuffledQuestions();
    memoryAnswers = readSaved('memory');
    questionAnswers = readSaved('examples');
    const savedChallenge = readSaved('challenge');
    challenge = Number.isInteger(savedChallenge.attempts) && Array.isArray(savedChallenge.pending) && Array.isArray(savedChallenge.bag) && savedChallenge.current?.id ? savedChallenge : null;
    render();
  } catch (error) {
    host.innerHTML = `<div class="iv-error" role="alert"><p>${escapeHtml(error.message)}</p><button type="button" data-retry>重新載入</button></div>`;
  } finally { loading = false; }
}
function checkRow(id) {
  const entry = data.entries[id - 1];
  const indexes = hiddenIndexes[memoryMode];
  let counted = 0;
  for (const index of indexes) {
    const key = `${id}:${index}`;
    if (String(memoryAnswers[key] || '').trim()) { memoryChecked[key] = matchesForm(memoryAnswers[key],entry.forms[index]); counted++; }
  }
  if (!counted) { showStatus('請先填寫至少一個詞形。', 'error'); return; }
  renderMemory();
}
function checkQuestion(key) {
  const sample = sampleFor(key);
  if (!sample.answers.every((_,i) => String(questionAnswers[`${key}:${i}`] || '').trim())) { showStatus('請先填妥這一句的所有空格。', 'error'); return; }
  const correct = sample.answers.every((answer, index) => String(questionAnswers[`${key}:${index}`] || '').trim().toLocaleLowerCase() === answer.toLocaleLowerCase());
  checked[key] = correct;
  const result = host.querySelector(`[data-question-result="${key}"]`);
  if (result) { result.textContent = correct ? '✓ 正確' : `正解：${sample.answers.join('、')}`; result.dataset.correct = String(correct); }
  refreshSubmissionBar();
}
function submitMemory() {
  let count = 0;
  for (const entry of data.entries) for (const index of hiddenIndexes[memoryMode]) {
    const key = `${entry.id}:${index}`;
    if (String(memoryAnswers[key] || '').trim()) { memoryChecked[key] = matchesForm(memoryAnswers[key],entry.forms[index]); count++; }
  }
  if (!count) { showStatus('請先填寫至少一個詞形。', 'error'); return; }
  renderMemory(); showStatus(`已核對 ${count} 個已填詞形；錯題下方顯示正解。`);
}
function submitExamples() {
  let count = 0;
  for (const entry of data.entries) for (const form of [1,2,3]) {
    const key = `${entry.id}:${form}`;
    const sample = sampleFor(key);
    if (!sample.answers.every((_,i) => String(questionAnswers[`${key}:${i}`] || '').trim())) continue;
    checked[key] = sample.answers.every((answer,i) => String(questionAnswers[`${key}:${i}`]).trim().toLocaleLowerCase() === answer.toLocaleLowerCase());
    count++;
  }
  if (!count) { showStatus('請先完成至少一句例句。', 'error'); return; }
  renderExamples(); showStatus(`已核對 ${count} 句已填例句；錯題會顯示正解。`);
}
function redoWrong(kind) {
  if (kind === 'memory') {
    const wrong = Object.keys(memoryChecked).filter(key => memoryChecked[key] === false && hiddenIndexes[memoryMode].includes(Number(key.split(':')[1])));
    for (const key of wrong) { delete memoryAnswers[key]; delete memoryChecked[key]; }
    if (wrong.length) search = '';
    save('memory', memoryAnswers); renderMemory(); showStatus(`已清空 ${wrong.length} 個錯誤詞形，可重新作答。`);
    if (wrong.length) host.querySelector(`[data-memory="${wrong[0]}"]`)?.focus();
  } else {
    const wrong = Object.keys(checked).filter(key => checked[key] === false);
    for (const key of wrong) { const sample = sampleFor(key); sample.answers.forEach((_,i) => delete questionAnswers[`${key}:${i}`]); delete checked[key]; }
    save('examples', questionAnswers);
    if (wrong.length) { const index = order.findIndex(item => `${item.id}:${item.form}` === wrong[0]); if (index >= 0) page = Math.floor(index / PAGE_SIZE); }
    renderExamples(); showStatus(`已清空 ${wrong.length} 句錯題，可重新作答。`);
    if (wrong.length) host.querySelector(`[data-question="${wrong[0]}"] .iv-blank`)?.focus();
  }
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
    delete memoryChecked[target.dataset.memory];
    save('memory', memoryAnswers);
    target.parentElement.querySelector('.iv-cell-feedback')?.remove();
    refreshSubmissionBar();
  } else if (target.matches('[data-answer]')) {
    questionAnswers[target.dataset.answer] = target.value;
    save('examples', questionAnswers);
    const key = target.dataset.answer.split(':').slice(0,2).join(':');
    delete checked[key];
    const result = target.closest('[data-question]')?.querySelector('[data-question-result]');
    if (result) { result.textContent = ''; delete result.dataset.correct; }
    refreshSubmissionBar();
  } else if (target.matches('[data-challenge-input]')) {
    challenge.current.inputs[target.dataset.challengeInput] = target.value;
    save('challenge', challenge);
  }
});
host.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.retry !== undefined) { load(); return; }
  if (button.dataset.play) { play(button.dataset.play, button); return; }
  if (button.dataset.viewTab) { audio.pause(); view = button.dataset.viewTab; search = ''; render(); return; }
  if (button.dataset.sort) { sortMode = button.dataset.sort; renderTable(); return; }
  if (button.dataset.memoryMode) { memoryMode = button.dataset.memoryMode; renderMemory(); return; }
  if (button.dataset.exampleMode) { exampleMode = button.dataset.exampleMode; renderExamples(); return; }
  if (button.dataset.toggleChinese !== undefined) { showChinese = !showChinese; renderExamples(); return; }
  if (button.dataset.checkRow) { checkRow(Number(button.dataset.checkRow)); return; }
  if (button.dataset.checkQuestion) { checkQuestion(button.dataset.checkQuestion); return; }
  if (button.dataset.batchSubmit) { button.dataset.batchSubmit === 'memory' ? submitMemory() : submitExamples(); return; }
  if (button.dataset.batchRedo) { redoWrong(button.dataset.batchRedo); return; }
  if (button.dataset.choice) { challenge.current.choice = Number(button.dataset.choice); save('challenge',challenge); host.querySelectorAll('[data-choice]').forEach(node => node.setAttribute('aria-pressed',String(node === button))); return; }
  if (button.dataset.challengeSubmit !== undefined) { submitChallenge(); return; }
  if (button.dataset.challengeNext !== undefined) { nextChallenge(); renderChallenge(); return; }
  if (button.dataset.resetMemory !== undefined) { memoryAnswers = {}; memoryChecked = {}; save('memory', memoryAnswers); renderMemory(); return; }
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
    memoryChecked = {};
    challenge = null;
    view = 'table';
    page = 0;
    search = '';
    if (owner && data) {
      memoryAnswers = readSaved('memory');
      questionAnswers = readSaved('examples');
      const savedChallenge = readSaved('challenge');
      challenge = Number.isInteger(savedChallenge.attempts) && Array.isArray(savedChallenge.pending) && Array.isArray(savedChallenge.bag) && savedChallenge.current?.id ? savedChallenge : null;
      order = shuffledQuestions();
    }
  }
  if (owner && !data) load(); else render();
});
const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession();
if (session?.user?.id) { owner = session.user.id; load(); }
