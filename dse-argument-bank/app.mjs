const $ = (selector, root = document) => root.querySelector(selector);
const app = $('#app');
const config = window.EDMUND_SUPABASE || {};
const authMemory = new Map();
const resilientStorage = {
  getItem(key) { if (authMemory.has(key)) return authMemory.get(key); try { return sessionStorage.getItem(key); } catch { return null; } },
  setItem(key, value) {
    authMemory.set(key, value);
    try { sessionStorage.setItem(key, value); }
    catch { try { sessionStorage.removeItem(key); } catch { /* Keep the current session in memory. */ } }
  },
  removeItem(key) { authMemory.delete(key); try { sessionStorage.removeItem(key); } catch { /* Continue in memory. */ } }
};
const client = window.supabase?.createClient?.(config.url, config.anonKey, {
  auth: { persistSession: true, storage: resilientStorage, autoRefreshToken: true, detectSessionInUrl: false }
});
const sessionKey = 'edmund-dse-argument-bank-student-v1';
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const arrow = '<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11"/></svg>';
const state = { token: '', name: '', modules: [], moduleIndex: 0, data: null, progress: {}, view: 'home', prompt: null, response: null, structureOpen: false, structurePosition: null, pick: null };
let toastTimer;

async function rpc(name, args = {}) {
  if (!client) throw new Error('登入服務暫時無法載入，請重新整理頁面。');
  const current = await client.auth.getSession();
  if (current.error || !current.data.session?.user?.id) {
    const result = await client.auth.signInAnonymously();
    if (result.error) throw result.error;
  }
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data;
}

function toast(message, error = false) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.toggle('is-error', error);
  node.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.hidden = true; }, 4300);
}

function account(name, token, id) {
  state.name = name;
  state.token = token;
  $('#account-name').textContent = `${name} · 學生`;
  $('#account-name').hidden = false;
  $('#logout').hidden = false;
  $('#login-view').hidden = true;
  $('#app-view').hidden = false;
  try { sessionStorage.setItem(sessionKey, JSON.stringify({ name, token, id })); } catch { /* A full browser store cannot block study. */ }
  try { window.EdmundSystemNav?.rememberStudentSession?.({ token, id, name, role: 'student' }); } catch { /* The current login remains usable if the browser store is full. */ }
}

async function start() {
  app.innerHTML = '<div class="loading" role="status"><span></span>正在整理 DSE 論點…</div>';
  try {
    const responses = await Promise.all(['data.json', 'driving-data.json', 'self-care-data.json', 'mario-data.json', 'subtitles-data.json'].map(file => fetch(`dse-argument-bank/${file}?v=20261018b`)));
    if (responses.some(response => !response.ok)) throw new Error('教材暫時未能載入。');
    state.modules = await Promise.all(responses.map(response => response.json()));
    state.moduleIndex = 0;
    state.data = state.modules[0];
    state.progress = await rpc('dse_argument_state', { p_student_token: state.token, p_module_id: state.data.id }) || {};
    state.view = 'home';
    render();
  } catch (error) {
    app.innerHTML = `<div class="error-card" role="alert">${esc(error.message)} <button type="button" data-retry>重試</button></div>`;
  }
}

async function selectModule(index) {
  const module = state.modules[index];
  if (!module) return;
  app.innerHTML = '<div class="loading" role="status"><span></span>正在載入模組…</div>';
  try {
    const progress = await rpc('dse_argument_state', { p_student_token: state.token, p_module_id: module.id }) || {};
    state.moduleIndex = index;
    state.data = module;
    state.progress = progress;
    state.prompt = null;
    state.response = null;
    state.pick = null;
    navigate('module');
  } catch (error) {
    renderHome();
    toast(error.message || '暫時無法載入模組，請重試。', true);
  }
}

async function login(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $('button[type=submit]', form);
  if (button.disabled) return;
  const values = new FormData(form);
  const name = String(values.get('username') || '').trim();
  const password = String(values.get('password') || '');
  if (!name || !password) return;
  button.disabled = true;
  $('#login-status').textContent = '正在核對帳戶…';
  try {
    const rows = await rpc('flashcard_student_login', { p_name: name, p_password: password });
    const token = Array.isArray(rows) ? rows[0]?.session_token : null;
    if (!token) throw new Error('用戶名稱或密碼不正確。');
    const profile = await rpc('flashcard_student_session_profile', { p_token: token });
    const student = Array.isArray(profile) ? profile[0] : null;
    if (!student?.id) throw new Error('學生登入已失效，請重試。');
    account(student.name, token, student.id);
    form.reset();
    await start();
  } catch (error) {
    $('#login-status').textContent = error.message || '登入暫時失敗。';
  } finally { button.disabled = false; }
}

async function restore() {
  let own;
  try { own = JSON.parse(sessionStorage.getItem(sessionKey) || 'null'); } catch { own = null; }
  let universal;
  try { universal = window.EdmundSystemNav?.getStudentSession?.(); } catch { universal = null; }
  const candidate = universal?.role === 'student' ? universal : own;
  if (!candidate?.token) return;
  try {
    const profile = await rpc('flashcard_student_session_profile', { p_token: candidate.token });
    const student = Array.isArray(profile) ? profile[0] : null;
    if (!student?.id) return;
    account(student.name, candidate.token, student.id);
    await start();
  } catch { /* A stale session simply returns to the login form. */ }
}

function itemState(id) { return state.progress[id] || { checked: false, bookmarked: false }; }
function tools(id, label) {
  const value = itemState(id);
  return `<span class="item-tools"><label class="check-tool" title="標記已學習"><input type="checkbox" data-check="${esc(id)}" ${value.checked ? 'checked' : ''} aria-label="標記已學習：${esc(label)}"><span aria-hidden="true"></span></label><button class="star-tool ${value.bookmarked ? 'is-on' : ''}" type="button" data-star="${esc(id)}" data-label="${esc(label)}" aria-label="${value.bookmarked ? '移除書籤' : '加入書籤'}：${esc(label)}" aria-pressed="${value.bookmarked}">${value.bookmarked ? '★' : '☆'}</button></span>`;
}
async function save(id, patch) {
  const before = itemState(id);
  const after = { ...before, ...patch };
  state.progress[id] = after;
  syncItem(id);
  try {
    await rpc('dse_argument_save_state', { p_student_token: state.token, p_module_id: state.data.id, p_item_id: id, p_checked: after.checked, p_bookmarked: after.bookmarked });
  } catch (error) {
    state.progress[id] = before;
    syncItem(id);
    toast(`未能儲存：${error.message || '請稍後重試。'}`, true);
  }
}
function syncItem(id) {
  const value = itemState(id);
  app.querySelectorAll('[data-check]').forEach(node => { if (node.dataset.check === id) node.checked = value.checked; });
  app.querySelectorAll('[data-star]').forEach(node => {
    if (node.dataset.star !== id) return;
    node.textContent = value.bookmarked ? '★' : '☆';
    node.classList.toggle('is-on', value.bookmarked);
    node.setAttribute('aria-pressed', String(value.bookmarked));
    node.setAttribute('aria-label', `${value.bookmarked ? '移除書籤' : '加入書籤'}：${node.dataset.label || ''}`);
  });
}

function englishDemo(markdown) {
  if (!markdown) return '';
  const marked = String(markdown).split(/(\*\*.*?\*\*)/g).map(part => part.startsWith('**') && part.endsWith('**') ? `<strong>${esc(part.slice(2, -2))}</strong>` : esc(part)).join('');
  return `<div class="english-demo"><span>ENGLISH DEMONSTRATION · 英語示範</span><p lang="en">${marked}</p></div>`;
}

function argumentCard(argument, picker = false, selected = false) {
  const id = `arg:${argument.id}`;
  const detail = `<div class="argument-detail" hidden><p>${esc(argument.description)}</p><h4>Glossary · 關鍵詞彙</h4><ul class="glossary">${argument.glossary.map((g, i) => `<li><div class="glossary-copy"><strong lang="en">${esc(g.english)}</strong><span>${esc(g.chinese)}</span></div>${tools(`gloss:${argument.id}:${i}`, g.english)}</li>`).join('')}</ul>${englishDemo(argument.englishDemo)}</div>`;
  return `<article class="argument dse-argument ${selected ? 'is-picked' : ''}" id="item-${esc(argument.id)}"><div class="argument-head"><button type="button" data-argument="${esc(argument.id)}" aria-expanded="false"><small>${esc(argument.id)} · ${esc(argument.angle)}</small><strong>${esc(argument.title)}</strong><span class="disclosure" aria-hidden="true">+</span></button>${picker ? `<button type="button" class="pick-toggle ${selected ? 'is-picked' : ''}" data-pick="${esc(argument.id)}" aria-pressed="${selected}">${selected ? '✓ 已選' : '＋ 選取'}</button>` : ''}${tools(id, argument.title)}</div>${detail}</article>`;
}
function angleSections(section, picker = false) {
  return section.angles.map((angle, index) => {
    const argumentsForAngle = section.arguments.filter(argument => argument.angle === angle);
    const selected = state.pick?.selected[state.pick.phase - 1] || new Set();
    return `<section class="angle-section ${state.data.id === '2025-1-2-photo-taking-visitors' && section.id === 'A3' ? ['tone-support','tone-against','tone-middle'][index] : ''}"><header><span class="eyebrow">ANGLE ${String(index + 1).padStart(2, '0')}</span><h3>${esc(angle)}</h3><small>${argumentsForAngle.length} 個論點</small></header><div class="angle-arguments">${argumentsForAngle.map(argument => argumentCard(argument, picker, selected.has(argument.id))).join('')}</div></section>`;
  }).join('');
}

function top() {
  return `<div class="dse-top"><button class="back-button" type="button" data-home><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg> 返回主頁</button><button class="outline-button" type="button" data-bookmarks>☆ 我的書籤</button></div>`;
}
function hero() {
  return `<div class="dse-hero"><span class="eyebrow">2025 · HKDSE ENGLISH LANGUAGE PAPER 4</span><h1>${esc(state.data.heroTitle || state.data.title)}</h1></div>`;
}
function renderHome() {
  app.innerHTML = `<div class="section-head"><div><span class="eyebrow">DSE SPEAKING · CARD 76</span><h1>DSE 論點大全</h1><p>按模組進入，選擇適合你的練習入口。</p></div><button class="outline-button" type="button" data-bookmarks>☆ 我的書籤</button></div><div class="module-list">${state.modules.map((module, index) => `<button class="module-card" type="button" data-module="${index}"><span class="module-card__number">MODULE ${String(index + 1).padStart(2, '0')} · 2025 PAPER 4</span><strong>${esc(module.title)}</strong><span>Group Discussion · Individual Response · Synonym</span><span class="module-card__foot">進入模組 ${arrow}</span></button>`).join('')}</div>`;
}
function renderModule() {
  const groupCount = state.data.groups.reduce((count, group) => count + group.arguments.length, 0);
  const responseCount = state.data.responses.reduce((count, response) => count + response.arguments.length, 0);
  app.innerHTML = `${top()}${hero()}<div class="mode-grid"><button type="button" data-mode="group"><span>01 · PART A</span><strong>Group Discussion</strong><em>小組討論</em><small>${state.data.groups.length} 條指定討論方向 · ${groupCount} 個論點 · 句式表與單人／雙人選論點</small><b>${arrow}</b></button><button type="button" data-mode="response"><span>02 · PART B</span><strong>Individual Response</strong><em>個人回應</em><small>${state.data.responses.length} 題考官提問 · ${responseCount} 個論點 · 可改寫示範回應</small><b>${arrow}</b></button><button type="button" data-mode="synonym"><span>03 · LANGUAGE</span><strong>Synonym</strong><em>主題同義詞</em><small>${state.data.synonyms.length} 組主題關鍵詞 · ${state.data.synonyms.length * 5} 個語境替代表達</small><b>${arrow}</b></button></div><section class="context-panel"><span class="eyebrow">THE SOURCE SCENARIO · 題目背景</span><h2>${esc(state.data.contextTitle || '三個材料案例')}</h2><div class="context-grid">${state.data.context.map(item => `<article><strong>${esc(item.place)}</strong><p>${esc(item.point)}</p></article>`).join('')}</div><p class="context-caveat">${esc(state.data.contextCaveat || '以下論點是供課堂辯論的分析與建議；政策主張並非香港已實施的法律。')}</p></section>`;
}
function modeNav(active) {
  return `<nav class="mode-nav" aria-label="模組練習選單"><button type="button" data-mode="group" ${active === 'group' ? 'aria-current="page"' : ''}>Group Discussion</button><button type="button" data-mode="response" ${active === 'response' ? 'aria-current="page"' : ''}>Individual Response</button><button type="button" data-mode="synonym" ${active === 'synonym' ? 'aria-current="page"' : ''}>Synonym</button></nav>`;
}
function groupPrompt(section, index) {
  const open = state.prompt === section.id;
  return `<section class="prompt-section ${open ? 'is-open' : ''}"><button type="button" class="prompt-trigger" data-prompt="${section.id}" aria-expanded="${open}"><span>${String(index + 1).padStart(2, '0')}</span><span><strong lang="en">${esc(section.question)}</strong><small>${section.arguments.length} 個論點 · ${section.angles.length} 個角度</small></span><b aria-hidden="true">${open ? '−' : '+'}</b></button>${open ? `<div class="prompt-body"><div class="prompt-actions"><p>點開論點閱讀解釋與五項英中詞彙。展開不會自動勾選。</p><div><button class="outline-button" type="button" data-structures>句式表</button><button class="outline-button" type="button" data-start-pick="solo">Pick Mode · 單人練習</button><button class="primary-button" type="button" data-start-pick="pair">Pick Mode · 雙人選論點</button></div></div><div class="angle-grid">${angleSections(section)}</div></div>` : ''}</section>`;
}
function renderGroup() {
  const plan = state.data.studyPlan?.length ? `<details class="study-plan"><summary>四星期 Self-Care Month 活動示例 <span>展開參考方案</span></summary><p>以下是供小組討論的教學方案，並非試題已安排的活動。實際安排須視乎學校資源、安全及學生意願。</p><div class="study-plan__grid">${state.data.studyPlan.map(week => `<article><small>${esc(week.week)}</small><h3>${esc(week.theme)}</h3><p><strong>建議活動</strong>${esc(week.activity)}</p><p><strong>鼓勵參與</strong>${esc(week.participation)}</p><p><strong>顧及需要</strong>${esc(week.care)}</p></article>`).join('')}</div></details>` : '';
  const project = state.data.projectPlan?.outline?.length ? `<details class="study-plan"><summary>班級專題 · 展示大綱與互動方案 <span>展開參考方案</span></summary><p>以下是原創教學示例，並非試題規定的研究格式。使用遊戲畫面時須取得授權並標明來源；班內投票不應被寫成全港統計。</p><div class="study-plan__grid">${state.data.projectPlan.outline.map(item => `<article><small>PART ${esc(item.part)}</small><h3>${esc(item.theme)}</h3><p><strong>可用素材</strong>${esc(item.material)}</p><p><strong>關鍵問題</strong>${esc(item.question)}</p></article>`).join('')}</div><h3>互動展示方案</h3><div class="study-plan__grid">${state.data.projectPlan.activities.map(item => `<article><h3>${esc(item.idea)}</h3><p><strong>用途</strong>${esc(item.benefit)}</p><p><strong>操作與注意事項</strong>${esc(item.care)}</p></article>`).join('')}</div><h3>建議分工</h3><div class="study-plan__grid">${state.data.projectPlan.roles.map(item => `<article><h3>${esc(item.role)}</h3><p>${esc(item.task)}</p></article>`).join('')}</div></details>` : '';
  const campus = state.data.campusPlan?.programmes?.length ? `<details class="study-plan"><summary>Campus TV · 字幕試行方案 <span>展開參考方案</span></summary><p>${esc(state.data.campusPlan.policy)}</p><div class="study-plan__grid">${state.data.campusPlan.programmes.map(item => `<article><h3>${esc(item.type)}</h3><p><strong>優先做法</strong>${esc(item.approach)}</p><p><strong>避免的問題</strong>${esc(item.avoid)}</p><p><strong>例外／替代</strong>${esc(item.alternative)}</p></article>`).join('')}</div><h3>四週試行</h3><div class="study-plan__grid">${state.data.campusPlan.timeline.map(item => `<article><small>${esc(item.week)}</small><p><strong>工作</strong>${esc(item.task)}</p><p><strong>可觀察結果</strong>${esc(item.result)}</p></article>`).join('')}</div><h3>組員分工</h3><div class="study-plan__grid">${state.data.campusPlan.roles.map(item => `<article><h3>${esc(item.role)}</h3><p>${esc(item.task)}</p></article>`).join('')}</div><p><strong>可達成的共識：</strong>${esc(state.data.campusPlan.consensus)}</p></details>` : '';
  app.innerHTML = `${top()}${modeNav('group')}<div class="section-head dse-section-head"><div><span class="eyebrow">PART A · GROUP INTERACTION</span><h1>Group Discussion</h1><p>三個可展開的指定方向。每個角度都附有獨立論點、解釋及五項英中詞彙。</p></div><button type="button" class="outline-button" data-structures>20 個討論句式</button></div>${plan}${project}${campus}<div class="prompt-list">${state.data.groups.map(groupPrompt).join('')}</div>${structureWindow()}`;
}
function responseQuestion(section, index) {
  const open = state.response === section.id;
  return `<section class="prompt-section ${open ? 'is-open' : ''}"><button type="button" class="prompt-trigger" data-response="${section.id}" aria-expanded="${open}"><span>${String(index + 1).padStart(2, '0')}</span><span><strong lang="en">${esc(section.question)}</strong><small>${section.arguments.length} 個論點 · ${section.angles.length} 個角度</small></span><b aria-hidden="true">${open ? '−' : '+'}</b></button>${open ? `<div class="prompt-body"><p class="response-reminder">示範答覆只供練習；如涉及個人經歷，請按自己的真實情況修改。</p><div class="angle-grid">${angleSections(section)}</div><section class="sample-section"><span class="eyebrow">PRACTISE · ADAPT TO YOUR EXPERIENCE</span><h3>英文示範回應</h3>${section.samples.map(sample => `<div class="sample-card"><small>${esc(sample.label)}</small><p lang="en">${esc(sample.text)}</p></div>`).join('')}</section></div>` : ''}</section>`;
}
function renderResponse() {
  app.innerHTML = `${top()}${modeNav('response')}<div class="section-head dse-section-head"><div><span class="eyebrow">PART B · INDIVIDUAL RESPONSE</span><h1>Individual Response</h1><p>八條考官提問。先選你真正認同的方向，再組織直接回答、理由、例子和簡短收結。</p></div></div><div class="prompt-list">${state.data.responses.map(responseQuestion).join('')}</div>`;
}
function renderSynonym() {
  const sections = [...new Set(state.data.synonyms.map(item => item.category))];
  app.innerHTML = `${top()}${modeNav('synonym')}<div class="section-head dse-section-head"><div><span class="eyebrow">LANGUAGE BANK · ${state.data.synonyms.length} GROUPS</span><h1>Synonym</h1><p>每組有五個可在本題語境中使用的同義詞、近義詞或改寫方式。</p></div></div><div class="synonym-search"><label for="syn-search">搜尋關鍵詞、中文或替代表達</label><input id="syn-search" type="search" placeholder="Search keywords or alternatives…" autocomplete="off"></div><p class="synonym-warning">${esc(state.data.synonymWarning)}</p><div class="synonym-categories">${sections.map(category => `<section class="synonym-category"><h2>${esc(category)}</h2><div class="synonym-rows">${state.data.synonyms.map((entry, index) => entry.category === category ? `<article class="synonym-row" id="syn-item-${index}" data-search-text="${esc(`${entry.keyword} ${entry.chinese} ${entry.alternatives.join(' ')}`.toLowerCase())}"><div><strong lang="en">${esc(entry.keyword)}</strong><span>${esc(entry.chinese)}</span></div><ol lang="en">${entry.alternatives.map(word => `<li>${esc(word)}</li>`).join('')}</ol>${tools(`syn:${index}`, entry.keyword)}</article>` : '').join('')}</div></section>`).join('')}</div><p class="empty-state" id="syn-empty" hidden>沒有找到相符的詞組。</p>`;
}
function structureWindow() {
  if (!state.structureOpen) return '';
  const position = state.structurePosition ? `style="left:${state.structurePosition.x}px;top:${state.structurePosition.y}px"` : '';
  return `<aside class="structure-float" id="structure-float" ${position} aria-label="小組討論句式浮動視窗"><div class="structure-handle" data-drag-handle><div><span class="eyebrow">SENTENCE STRUCTURE</span><h3>小組討論句式 · 20</h3></div><button type="button" data-close-structures aria-label="關閉句式表">×</button></div><div class="structure-content">${state.data.structures.map(item => `<div class="structure-row" id="structure-item-${item.number}"><div class="structure-row__copy"><small>${String(item.number).padStart(2, '0')}</small><strong lang="en">${esc(item.english)}</strong><span>${esc(item.purpose)}</span></div>${tools(`structure:${item.number}`, item.english)}</div>`).join('')}</div><div class="resize-note">拖動標題列移動 · 拖動右下角調整大小</div></aside>`;
}

function currentGroup() { return state.data.groups.find(group => group.id === state.prompt); }
function pickBar() {
  const index = state.pick.phase - 1;
  const count = state.pick.selected[index].size;
  const solo = state.pick.mode === 'solo';
  const next = solo ? '查看我的論點' : state.pick.phase === 1 ? '下一頁 · Picker 2' : '查看雙人比較';
  return `<div class="pick-bottom-bar" role="navigation" aria-label="選論點步驟"><div><strong>${solo ? '單人練習' : `Picker ${state.pick.phase}`}</strong><span>已選 ${count} 個論點</span></div><div class="pick-bottom-bar__actions"><button class="outline-button" type="button" data-structures>句式表</button><button class="outline-button" type="button" data-pick-back>${state.pick.phase === 1 ? '退出選取' : '返回 Picker 1'}</button><button class="primary-button" type="button" data-pick-next ${count ? '' : 'disabled'}>${next}</button></div></div>`;
}
function renderPick() {
  const section = currentGroup();
  if (!section) return;
  const solo = state.pick.mode === 'solo';
  app.innerHTML = `<div class="pick-page"><div class="pick-intro"><span class="eyebrow">PICK MODE · ${solo ? '單人練習 · 1 / 2' : `${state.pick.phase} / 3`}</span><h1>${solo ? '選擇我的論點' : `選論點 · Picker ${state.pick.phase}`}</h1><p lang="en">${esc(section.question)}</p><p class="pick-instruction">${solo ? '從各角度選擇想練習的論點，完成後檢視自己的選擇。' : '從各角度選擇想討論的論點。兩位 Picker 可以選相同論點；'}勾選學習紀錄與選論點是兩個獨立動作。</p></div><div class="angle-grid">${angleSections(section, true)}</div></div>${pickBar()}${structureWindow()}`;
}
function pickedColumn(index, heading) {
  const section = currentGroup();
  return `<section class="comparison-picker"><h2>${heading}</h2>${section.angles.map(angle => {
    const chosen = section.arguments.filter(item => item.angle === angle && state.pick.selected[index].has(item.id));
    return chosen.length ? `<div class="comparison-angle"><h3>${esc(angle)}</h3>${chosen.map(item => `<article class="comparison-entry"><div class="comparison-entry__head"><button type="button" data-compare-toggle="${esc(item.id)}" data-picker-index="${index}" aria-expanded="${!state.pick.collapsed[index].has(item.id)}"><span>${esc(item.id)}</span><strong>${esc(item.title)}</strong><b aria-hidden="true">${state.pick.collapsed[index].has(item.id) ? '+' : '−'}</b></button>${tools(`arg:${item.id}`, item.title)}</div>${state.pick.collapsed[index].has(item.id) ? '' : `<div class="comparison-entry__detail"><p>${esc(item.description)}</p><h4>Glossary · 關鍵詞彙</h4><ul class="glossary">${item.glossary.map((term, i) => `<li><div class="glossary-copy"><strong>${esc(term.english)}</strong><span>${esc(term.chinese)}</span></div>${tools(`gloss:${item.id}:${i}`, term.english)}</li>`).join('')}</ul>${englishDemo(item.englishDemo)}</div>`}</article>`).join('')}</div>` : '';
  }).join('') || '<p>沒有選取論點。</p>'}</section>`;
}
function renderCompare() {
  const section = currentGroup();
  app.innerHTML = `<div class="comparison-page"><div class="pick-top-bar"><div><span class="eyebrow">PICK MODE · 3 / 3</span><strong>雙人論點比較</strong></div><button class="outline-button" type="button" data-structures>句式表</button><button class="outline-button" type="button" data-pick-back>返回選取</button><button class="primary-button" type="button" data-pick-end>結束練習</button></div><div class="comparison-intro"><h1>雙人論點比較</h1><p lang="en">${esc(section.question)}</p></div><div class="comparison-grid">${pickedColumn(0, 'Picker 1')}${pickedColumn(1, 'Picker 2')}</div></div>${structureWindow()}`;
}
function renderSingleReview() {
  const section = currentGroup();
  app.innerHTML = `<div class="comparison-page single-review"><div class="pick-top-bar"><div><span class="eyebrow">PICK MODE · 單人練習 · 2 / 2</span><strong>我的論點</strong></div><button class="outline-button" type="button" data-structures>句式表</button><button class="outline-button" type="button" data-pick-back>返回選取</button><button class="primary-button" type="button" data-pick-end>結束練習</button></div><div class="comparison-intro"><h1>我的論點</h1><p lang="en">${esc(section.question)}</p></div><div class="single-review__content">${pickedColumn(0, '已選論點')}</div></div>${structureWindow()}`;
}

function bookmarkIndex() {
  const items = new Map();
  for (const section of [...state.data.groups, ...state.data.responses]) {
    for (const argument of section.arguments) {
      items.set(`arg:${argument.id}`, { type: '論點', label: argument.title, section: section.id, argument: argument.id });
      argument.glossary.forEach((term, i) => items.set(`gloss:${argument.id}:${i}`, { type: '詞彙', label: `${term.english} · ${term.chinese}`, section: section.id, argument: argument.id }));
    }
  }
  state.data.structures.forEach(s => items.set(`structure:${s.number}`, { type: '句式', label: s.english, section: 'A1' }));
  state.data.synonyms.forEach((s, i) => items.set(`syn:${i}`, { type: '同義詞', label: `${s.keyword} · ${s.chinese}`, section: 'synonym' }));
  return items;
}
function renderBookmarks() {
  const index = bookmarkIndex();
  const saved = Object.entries(state.progress).filter(([, value]) => value.bookmarked).map(([id]) => ({ id, ...index.get(id) })).filter(item => item.label);
  app.innerHTML = `${top()}<div class="bookmark-page"><span class="eyebrow">PERSONAL RECORD</span><h1>我的書籤</h1><p>收藏的論點、詞彙、句式與同義詞，按你的學生帳戶保存。</p><div class="bookmark-list">${saved.map(item => `<button type="button" data-bookmark-open="${esc(item.id)}"><small>${esc(item.type)}</small><strong>${esc(item.label)}</strong><span>查看 ${arrow}</span></button>`).join('') || '<div class="empty-state">尚未加入書籤。閱讀時按 ☆ 即可收藏。</div>'}</div></div>`;
}
function render() {
  if (!state.data) return;
  switch (state.view) {
    case 'module': renderModule(); break;
    case 'group': renderGroup(); break;
    case 'response': renderResponse(); break;
    case 'synonym': renderSynonym(); break;
    case 'pick': renderPick(); break;
    case 'compare': renderCompare(); break;
    case 'single-review': renderSingleReview(); break;
    case 'bookmarks': renderBookmarks(); break;
    default: renderHome();
  }
}
function navigate(view) { state.view = view; state.structureOpen = false; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

app.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-retry')) { start(); return; }
  if (button.hasAttribute('data-home')) { state.pick = null; navigate('home'); return; }
  if (button.hasAttribute('data-module')) { selectModule(Number(button.dataset.module)); return; }
  if (button.hasAttribute('data-bookmarks')) { navigate('bookmarks'); return; }
  if (button.dataset.mode) { state.pick = null; navigate(button.dataset.mode); return; }
  if (button.dataset.prompt) {
    state.prompt = state.prompt === button.dataset.prompt ? null : button.dataset.prompt;
    renderGroup(); buttonScroll('data-prompt', state.prompt);
    return;
  }
  if (button.dataset.response) {
    state.response = state.response === button.dataset.response ? null : button.dataset.response;
    renderResponse(); buttonScroll('data-response', state.response);
    return;
  }
  if (button.dataset.argument) {
    const card = button.closest('.argument');
    const detail = $('.argument-detail', card);
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    card.classList.toggle('is-open', open);
    detail.hidden = !open;
    $('.disclosure', button).textContent = open ? '−' : '+';
    return;
  }
  if (button.dataset.star) { save(button.dataset.star, { bookmarked: !itemState(button.dataset.star).bookmarked }); return; }
  if (button.hasAttribute('data-structures')) {
    if (!state.structureOpen) {
      state.structureOpen = true;
      app.insertAdjacentHTML('beforeend', structureWindow());
    }
    return;
  }
  if (button.hasAttribute('data-close-structures')) { state.structureOpen = false; $('#structure-float')?.remove(); return; }
  if (button.hasAttribute('data-start-pick')) {
    state.pick = { mode: button.dataset.startPick === 'solo' ? 'solo' : 'pair', phase: 1, selected: [new Set(), new Set()], collapsed: [new Set(), new Set()] };
    state.structureOpen = false;
    navigate('pick'); return;
  }
  if (button.dataset.pick) {
    const selected = state.pick.selected[state.pick.phase - 1];
    selected.has(button.dataset.pick) ? selected.delete(button.dataset.pick) : selected.add(button.dataset.pick);
    button.classList.toggle('is-picked', selected.has(button.dataset.pick));
    button.setAttribute('aria-pressed', String(selected.has(button.dataset.pick)));
    button.textContent = selected.has(button.dataset.pick) ? '✓ 已選' : '＋ 選取';
    button.closest('.argument').classList.toggle('is-picked', selected.has(button.dataset.pick));
    const count = selected.size;
    $('.pick-bottom-bar span').textContent = `已選 ${count} 個論點`;
    $('[data-pick-next]').disabled = !count;
    return;
  }
  if (button.hasAttribute('data-pick-back')) {
    if (state.view === 'single-review') { navigate('pick'); }
    else if (state.view === 'compare') { state.pick.phase = 2; navigate('pick'); }
    else if (state.pick.phase === 2) { state.pick.phase = 1; navigate('pick'); }
    else { state.pick = null; navigate('group'); }
    return;
  }
  if (button.hasAttribute('data-pick-next')) {
    if (state.pick.mode === 'solo') { navigate('single-review'); }
    else if (state.pick.phase === 1) { state.pick.phase = 2; navigate('pick'); }
    else navigate('compare');
    return;
  }
  if (button.hasAttribute('data-pick-end')) { state.pick = null; navigate('group'); return; }
  if (button.dataset.compareToggle) {
    const index = Number(button.dataset.pickerIndex);
    const collapsed = state.pick.collapsed[index];
    collapsed.has(button.dataset.compareToggle) ? collapsed.delete(button.dataset.compareToggle) : collapsed.add(button.dataset.compareToggle);
    const previous = window.scrollY;
    if (state.view === 'single-review') renderSingleReview(); else renderCompare();
    window.scrollTo({ top: previous, behavior: 'instant' });
    return;
  }
  if (button.dataset.bookmarkOpen) { openBookmark(button.dataset.bookmarkOpen); }
});

function buttonScroll(attribute, value) {
  if (!value) return;
  const target = [...app.querySelectorAll(`[${attribute}]`)].find(node => node.getAttribute(attribute) === value);
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function openBookmark(id) {
  const location = bookmarkIndex().get(id);
  if (!location) return;
  if (location.section === 'synonym') {
    navigate('synonym');
    setTimeout(() => $(`#syn-item-${id.split(':')[1]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    return;
  }
  if (location.section.startsWith('A')) { state.prompt = location.section; navigate('group'); }
  else { state.response = location.section; navigate('response'); }
  if (location.argument) {
    const card = [...app.querySelectorAll('.dse-argument')].find(node => node.id === `item-${location.argument}`);
    if (card) {
      const trigger = $('[data-argument]', card);
      if (trigger?.getAttribute('aria-expanded') !== 'true') trigger?.click();
      setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    }
  } else if (id.startsWith('structure:')) {
    state.structureOpen = true;
    renderGroup();
    setTimeout(() => $(`#structure-item-${id.split(':')[1]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  }
}
app.addEventListener('change', event => {
  if (event.target?.dataset.check) save(event.target.dataset.check, { checked: event.target.checked });
});
app.addEventListener('input', event => {
  if (event.target?.id !== 'syn-search') return;
  const query = event.target.value.trim().toLocaleLowerCase();
  let count = 0;
  app.querySelectorAll('.synonym-row').forEach(row => { row.hidden = !row.dataset.searchText.includes(query); if (!row.hidden) count++; });
  app.querySelectorAll('.synonym-category').forEach(section => { section.hidden = !section.querySelector('.synonym-row:not([hidden])'); });
  $('#syn-empty').hidden = count > 0;
});

app.addEventListener('pointerdown', event => {
  const handle = event.target.closest('[data-drag-handle]');
  if (!handle || event.target.closest('button')) return;
  const panel = $('#structure-float');
  if (!panel) return;
  const rect = panel.getBoundingClientRect();
  const origin = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
  handle.setPointerCapture(event.pointerId);
  const move = moveEvent => {
    const left = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, origin.left + moveEvent.clientX - origin.x));
    const top = Math.max(65, Math.min(window.innerHeight - 75, origin.top + moveEvent.clientY - origin.y));
    panel.style.left = `${left}px`; panel.style.top = `${top}px`; panel.style.right = 'auto';
    state.structurePosition = { x: left, y: top };
  };
  const stop = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', stop); handle.removeEventListener('pointercancel', stop); };
  handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', stop); handle.addEventListener('pointercancel', stop);
});

$('#login-form').addEventListener('submit', login);
$('#logout').addEventListener('click', () => {
  state.token = ''; state.name = ''; state.modules = []; state.moduleIndex = 0; state.data = null; state.progress = {}; state.pick = null;
  try { sessionStorage.removeItem(sessionKey); } catch { /* Ignore full or blocked storage. */ }
  try { window.EdmundSystemNav?.forgetStudentSession?.(); } catch { /* Full storage must not prevent logout. */ }
  $('#account-name').hidden = true; $('#logout').hidden = true;
  $('#app-view').hidden = true; $('#login-view').hidden = false;
  app.replaceChildren();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
restore();
