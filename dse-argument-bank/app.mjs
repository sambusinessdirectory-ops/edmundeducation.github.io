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
const starIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.7 2.86 5.8 6.4.93-4.63 4.52 1.09 6.38L12 17.32l-5.72 3.01 1.09-6.38L2.74 9.43l6.4-.93L12 2.7Z"/></svg>';
const speakerIcon = '<img src="dse-argument-bank/speaker.svg" width="19" height="19" alt="" aria-hidden="true">';
const micIcon = '<img src="dse-argument-bank/microphone.svg" width="19" height="19" alt="" aria-hidden="true">';
const audioBase = 'https://edmund-neural-audio.edmundeducation.workers.dev/';
const state = { token: '', name: '', role: 'student', modules: [], moduleIndex: 0, data: null, progress: {}, audio: null, recorder: null, recordingStream: null, recordingTimer: null, recordingOffset: 0, view: 'home', prompt: null, response: null, structureOpen: false, structurePosition: null, pick: null, selectedYear: 2025, yearOrder: 'newest', searchQuery: '', searchIndex: [], searchMatches: [], searchLimit: 40, selectedGlossary: new Set(), selectedSynonyms: new Set() };
let toastTimer;
let modeTransitionTimer;

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

function account(name, token, id, role = 'student') {
  state.name = name;
  state.token = token;
  state.role = role;
  $('#account-name').textContent = `${name} · ${role === 'admin' ? '管理員' : '學生'}`;
  $('#account-name').hidden = false;
  $('#logout').hidden = false;
  $('#login-view').hidden = true;
  $('#app-view').hidden = false;
  if (role === 'student') {
    try { sessionStorage.setItem(sessionKey, JSON.stringify({ name, token, id })); } catch { /* A full browser store cannot block study. */ }
    try { window.EdmundSystemNav?.rememberStudentSession?.({ token, id, name, role: 'student' }); } catch { /* The current login remains usable if the browser store is full. */ }
  }
}

async function start() {
  app.innerHTML = '<div class="loading" role="status"><span></span>正在整理 DSE 論點…</div>';
  try {
    const catalogue = await fetch('dse-argument-bank/import-manifest.json?v=20261021-speaking1');
    if (!catalogue.ok) throw new Error('新增教材目錄暫時未能載入。');
    const newFiles = (await catalogue.json()).map(item => item.file);
    const responses = await Promise.all(['data.json', 'driving-data.json', 'self-care-data.json', 'mario-data.json', 'subtitles-data.json', ...newFiles].map(file => fetch(`dse-argument-bank/${file}?v=20261021-speaking1`)));
    if (responses.some(response => !response.ok)) throw new Error('教材暫時未能載入。');
    state.modules = await Promise.all(responses.map(response => response.json()));
    buildSearchIndex();
    state.moduleIndex = 0;
    state.data = state.modules[0];
    state.progress = await rpc('dse_argument_state', { p_student_token: state.token, p_module_id: state.data.id }) || {};
    state.view = 'home';
    render();
  } catch (error) {
    app.innerHTML = `<div class="error-card" role="alert">${esc(error.message)} <button type="button" data-retry>重試</button></div>`;
  }
}

async function selectModule(index, destination = null) {
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
    state.selectedGlossary.clear();
    state.selectedSynonyms.clear();
    if (!destination || destination.view === 'module') { navigate('module'); return; }
    state.prompt = destination.view === 'group' ? destination.sectionId : null;
    state.response = destination.view === 'response' ? destination.sectionId : null;
    navigate(destination.view);
    if (destination.view === 'group' && destination.structureNumber) {
      state.structureOpen = true;
      renderGroup();
      setTimeout(() => $(`#structure-item-${destination.structureNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } else if (destination.argumentId) {
      const card = [...app.querySelectorAll('.dse-argument')].find(node => node.id === `item-${destination.argumentId}`);
      card?.querySelector('[data-argument]')?.click();
      setTimeout(() => card?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } else if (destination.synonymIndex != null) {
      setTimeout(() => $(`#syn-item-${destination.synonymIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
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
  if (new URLSearchParams(location.search).get('view') === 'recordings') {
    try {
      const saved = JSON.parse(sessionStorage.getItem('edmundSpeakingSessionV1') || 'null');
      if (saved?.role === 'admin' && saved.token) {
        await rpc('dse_argument_recording', { p_token: saved.token, p_action: 'list', p_payload: {} });
        account(saved.name || 'Speaking Admin', saved.token, saved.id, 'admin');
        await renderRecordings(); return;
      }
    } catch { /* The admin can sign in again through Speaking System. */ }
    $('#login-status').innerHTML = '管理員請先在 <a href="speaking-system.html?admin=1">Speaking System 登入</a>，然後返回此頁。';
    return;
  }
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
  return `<span class="item-tools"><label class="check-tool" title="標記已學習"><input type="checkbox" data-check="${esc(id)}" ${value.checked ? 'checked' : ''} aria-label="標記已學習：${esc(label)}"><span aria-hidden="true"></span></label><button class="star-tool ${value.bookmarked ? 'is-on' : ''}" type="button" data-star="${esc(id)}" data-label="${esc(label)}" aria-label="${value.bookmarked ? '移除書籤' : '加入書籤'}：${esc(label)}" aria-pressed="${value.bookmarked}">${starIcon}</button></span>`;
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
    node.classList.toggle('is-on', value.bookmarked);
    node.setAttribute('aria-pressed', String(value.bookmarked));
    node.setAttribute('aria-label', `${value.bookmarked ? '移除書籤' : '加入書籤'}：${node.dataset.label || ''}`);
  });
}

function voiceFor(type) { return type === 'response' ? 'bm_fable' : type === 'synonym' ? 'bf_isabella' : 'af_heart'; }
async function playAudio(text, voice, button) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${voice}\u0000${text}`));
  const hash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2,'0')).join('');
  const path = `assets/dse-argument-bank/audio/v1/${hash.slice(0,2)}/${hash}.mp3`;
  if (state.audio) { state.audio.pause(); state.audio.currentTime = 0; }
  const audio = new Audio(new URL(path, audioBase).href);
  state.audio = audio;
  button.classList.add('is-playing');
  audio.addEventListener('ended', () => button.classList.remove('is-playing'), { once: true });
  audio.addEventListener('error', () => { button.classList.remove('is-playing'); toast('語音暫時無法播放，請稍後再試。', true); }, { once: true });
  try { await audio.play(); } catch { button.classList.remove('is-playing'); toast('請再按一次播放語音。', true); }
}
async function saveRecording(blob, type, label, moduleId) {
  if (blob.size > 3145728) throw new Error('錄音超過 3 MB，請錄短一點再試。');
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  await rpc('dse_argument_recording', { p_token: state.token, p_action: 'save', p_payload: {
    id: crypto.randomUUID(), moduleId, itemType: type, label: label.slice(0, 300),
    mime: blob.type.split(';')[0], audio: base64
  } });
  toast('錄音已儲存到「我的錄音」。');
}
async function toggleRecording(button) {
  if (state.recorder?.state === 'recording') { state.recorder.stop(); return; }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { toast('這個瀏覽器未提供麥克風錄音。', true); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    const mime = ['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(value => MediaRecorder.isTypeSupported(value));
    if (!mime) { stream.getTracks().forEach(track => track.stop()); throw new Error('這個瀏覽器未提供支援的錄音格式。'); }
    const chunks = [];
    const moduleId = state.data.id;
    const recordType = button.dataset.recordType;
    const recordLabel = button.dataset.recordLabel;
    const recorder = new MediaRecorder(stream, {mimeType:mime});
    state.recorder = recorder; state.recordingStream = stream;
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      clearTimeout(state.recordingTimer);
      stream.getTracks().forEach(track => track.stop());
      button.classList.remove('is-recording');
      button.setAttribute('aria-label', `錄下自己朗讀：${button.dataset.recordLabel}`);
      state.recorder = null; state.recordingStream = null;
      try { await saveRecording(new Blob(chunks,{type:mime.split(';')[0]}), recordType, recordLabel, moduleId); }
      catch (error) { toast(`錄音未能儲存：${error.message}`, true); }
    };
    recorder.start();
    button.classList.add('is-recording');
    button.setAttribute('aria-label', '停止錄音並儲存');
    state.recordingTimer = setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 120000);
    toast('正在錄音；再按咪高峰按鈕可停止並儲存。');
  } catch (error) { toast(error.message || '未能使用麥克風。', true); }
}
function audioControls(text, type, label = text, recordType = type) {
  const plain = String(text || '').replace(/\*\*/g, '').trim();
  if (!plain) return '';
  const play = `<button type="button" class="mini-audio" data-play-text="${esc(plain)}" data-play-voice="${voiceFor(type)}" aria-label="聆聽：${esc(label)}" title="聆聽 Kokoro 發音">${speakerIcon}</button>`;
  const record = `<button type="button" class="mini-audio mini-record" data-record-type="${esc(recordType)}" data-record-label="${esc(label)}" aria-label="錄下自己朗讀：${esc(label)}" title="錄音並儲存到我的錄音">${micIcon}</button>`;
  return `<span class="audio-actions">${play}${record}</span>`;
}

function englishDemo(markdown, type = 'group', id = '') {
  if (!markdown) return '';
  const marked = String(markdown).split(/(\*\*.*?\*\*)/g).map(part => part.startsWith('**') && part.endsWith('**') ? `<strong>${esc(part.slice(2, -2))}</strong>` : esc(part)).join('');
  const preview = String(markdown).replace(/\*\*/g, '').trim().slice(0, 100);
  return `<div class="english-demo"><span>ENGLISH DEMONSTRATION · 英語示範</span>${audioControls(markdown, type, `English demonstration · ${id}: ${preview}`, 'demonstration')}<p lang="en">${marked}</p></div>`;
}
function glossaryRow(term, id) {
  const selected = state.selectedGlossary.has(id);
  const type = id.startsWith('gloss:B') ? 'response' : 'group';
  return `<li class="${selected ? 'is-selected' : ''}"><button type="button" class="glossary-copy" data-glossary-select="${esc(id)}" aria-pressed="${selected}"><strong lang="en">${esc(term.english)}</strong><span>${esc(term.chinese)}</span></button>${audioControls(term.english, type, term.english, 'glossary')}${tools(id, term.english)}</li>`;
}

function argumentCard(argument, picker = false, selected = false) {
  const id = `arg:${argument.id}`;
  const detail = `<div class="argument-detail" hidden><p>${esc(argument.description)}</p><h4>Glossary · 關鍵詞彙</h4><ul class="glossary">${argument.glossary.map((g, i) => glossaryRow(g, `gloss:${argument.id}:${i}`)).join('')}</ul>${englishDemo(argument.englishDemo, argument.id.startsWith('B') ? 'response' : 'group', argument.id)}</div>`;
  return `<article class="argument dse-argument ${selected ? 'is-picked' : ''}" id="item-${esc(argument.id)}"><div class="argument-head"><button type="button" data-argument="${esc(argument.id)}" aria-expanded="false"><small>${esc(argument.id)} · ${esc(argument.angle)}</small><strong>${esc(argument.title)}</strong><span class="disclosure" aria-hidden="true">+</span></button>${picker ? `<button type="button" class="pick-toggle ${selected ? 'is-picked' : ''}" data-pick="${esc(argument.id)}" aria-pressed="${selected}">${selected ? '✓ 已選' : '＋ 選取'}</button>` : ''}${tools(id, argument.title)}</div>${detail}</article>`;
}
function angleSections(section, picker = false) {
  return section.angles.map((angle, index) => {
    const argumentsForAngle = section.arguments.filter(argument => argument.angle === angle);
    const selected = state.pick?.selected[state.pick.phase - 1] || new Set();
    const tone = angle.includes('反向視角') ? 'tone-against' : state.data.id === '2025-1-2-photo-taking-visitors' && section.id === 'A3' ? ['tone-support', 'tone-against', 'tone-middle'][index] || '' : '';
    return `<section class="angle-section ${tone}"><header><span class="eyebrow">ANGLE ${String(index + 1).padStart(2, '0')}</span><h3>${esc(angle)}</h3><small>${argumentsForAngle.length} 個論點</small></header><div class="angle-arguments">${argumentsForAngle.map(argument => argumentCard(argument, picker, selected.has(argument.id))).join('')}</div></section>`;
  }).join('');
}

function top() {
  return `<div class="dse-top"><button class="back-button" type="button" data-home><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg> 返回主頁</button><button class="outline-button" type="button" data-bookmarks>☆ 我的書籤</button><button class="outline-button" type="button" data-recordings>我的錄音</button></div>`;
}
function hero() {
  return `<div class="dse-hero"><h1>${esc(state.data.heroTitle || moduleDisplayTitle(state.data))}</h1></div>`;
}
function moduleYear(module) {
  const year = Number(module.year || String(module.title).match(/\b20\d{2}\b/)?.[0]);
  return year >= 2012 && year <= 2026 ? year : null;
}
function moduleDisplayTitle(module) {
  return String(module.title).replace(/^\s*20\d{2}\s*(?:[·.]\s*)?/, '');
}
function normalizeSearch(value) { return String(value ?? '').normalize('NFKC').toLocaleLowerCase(); }
function buildSearchIndex() {
  const records = [];
  const add = (moduleIndex, type, label, preview, view, destination = {}, more = '') => {
    records.push({ moduleIndex, type, label, preview, view, ...destination, text: normalizeSearch([label, preview, more].join(' ')) });
  };
  state.modules.forEach((module, moduleIndex) => {
    const moduleLabel = moduleDisplayTitle(module);
    add(moduleIndex, '模組', moduleLabel, module.heroTitle || '', 'module', {}, module.title);
    for (const [view, sections] of [['group', module.groups], ['response', module.responses]]) {
      for (const section of sections) {
        add(moduleIndex, view === 'group' ? '小組討論' : '個人回應', section.question, moduleLabel, view, { sectionId: section.id }, section.angles.join(' '));
        for (const argument of section.arguments) {
          const glossary = argument.glossary.map(term => `${term.english} ${term.chinese}`).join(' ');
          add(moduleIndex, '論點與詞彙', argument.title, `${section.question} · ${argument.angle}`, view,
            { sectionId: section.id, argumentId: argument.id }, `${argument.description} ${glossary} ${argument.englishDemo || ''}`);
        }
        for (const sample of section.samples || []) {
          add(moduleIndex, '示範回應', section.question, sample.text, view, { sectionId: section.id }, sample.label);
        }
      }
    }
    for (const structure of module.structures) {
      add(moduleIndex, '討論句式', structure.english, structure.purpose, 'group',
        { sectionId: module.groups[0].id, structureNumber: structure.number });
    }
    module.synonyms.forEach((entry, synonymIndex) => {
      add(moduleIndex, '同義詞', entry.keyword, `${entry.chinese} · ${entry.alternatives.join(' · ')}`, 'synonym',
        { synonymIndex }, entry.category);
    });
  });
  state.searchIndex = records;
}
function renderSearchResults() {
  const browser = $('#year-browser');
  const panel = $('#search-results');
  if (!browser || !panel) return;
  const query = normalizeSearch(state.searchQuery).trim();
  browser.hidden = Boolean(query);
  panel.hidden = !query;
  if (!query) { state.searchMatches = []; return; }
  const tokens = query.split(/\s+/).filter(Boolean);
  state.searchMatches = state.searchIndex.filter(record => tokens.every(token => record.text.includes(token)));
  const shown = state.searchMatches.slice(0, state.searchLimit);
  panel.innerHTML = `<div class="search-results__head"><span class="eyebrow">SEARCH RESULTS</span><strong>${state.searchMatches.length} 項結果</strong></div>${shown.length ? `<div class="search-results__list">${shown.map((record, index) => `<button type="button" class="search-result" data-search-result="${index}"><span class="search-result__meta">${esc(moduleDisplayTitle(state.modules[record.moduleIndex]))} · ${esc(record.type)}</span><strong>${esc(record.label)}</strong><small>${esc(record.preview.slice(0, 132))}</small></button>`).join('')}</div>` : '<p class="search-empty">沒有找到相符內容。請試試其他英文或中文關鍵詞。</p>'}${state.searchMatches.length > shown.length ? `<button class="search-more" type="button" data-search-more>顯示更多結果（尚有 ${state.searchMatches.length - shown.length} 項）</button>` : ''}`;
}
function renderHome() {
  const years = Array.from({ length: 15 }, (_, index) => state.yearOrder === 'newest' ? 2026 - index : 2012 + index);
  if (state.modules.some(module => moduleYear(module) === null)) years.push(0);
  const modules = state.modules.map((module, index) => ({ module, index })).filter(({ module }) => (moduleYear(module) || 0) === state.selectedYear);
  app.innerHTML = `<div class="library-shell"><div class="section-head library-head"><div><h1>DSE 論點大全</h1><label class="library-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><span class="visually-hidden">搜尋所有模組內容</span><input id="global-search" type="search" value="${esc(state.searchQuery)}" placeholder="搜尋所有模組、論點、詞彙、句式…" autocomplete="off"></label></div><button class="outline-button" type="button" data-bookmarks>☆ 我的書籤</button><button class="outline-button" type="button" data-recordings>我的錄音</button></div><section class="search-results" id="search-results" aria-live="polite" hidden></section><div id="year-browser"><div class="year-toolbar"><div><h2>按年份選擇</h2></div><button class="year-order" type="button" data-year-order aria-label="切換年份排序">${state.yearOrder === 'newest' ? '2026 → 2012' : '2012 → 2026'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h12l-3-3m3 3-3 3M17 17H5l3-3m-3 3 3 3"/></svg></button></div><nav class="year-filter" aria-label="選擇 DSE 年份">${years.map(year => { const count = state.modules.filter(module => (moduleYear(module) || 0) === year).length; return `<button type="button" data-year="${year}" aria-pressed="${year === state.selectedYear}" class="year-button ${year === state.selectedYear ? 'is-active' : ''}"><strong>${year || '年份未註明'}</strong>${count ? `<small>${count} 個模組</small>` : '<small>—</small>'}</button>`; }).join('')}</nav><section class="year-results" aria-labelledby="selected-year-title"><div class="year-results__head"><div><span class="eyebrow">SELECTED YEAR</span><h2 id="selected-year-title">${state.selectedYear || '年份未註明'}</h2></div><span>${modules.length} 個模組</span></div>${modules.length ? `<div class="module-list">${modules.map(({ module, index }) => `<button class="module-card" type="button" data-module="${index}" aria-label="開啟 ${esc(module.title)}"><strong>${esc(moduleDisplayTitle(module))}</strong><span class="module-card__arrow">${arrow}</span></button>`).join('')}</div>` : '<p class="year-empty">此年份暫未加入練習模組。</p>'}</section></div></div>`;
  renderSearchResults();
}
function renderModule() {
  app.innerHTML = `${top()}${hero()}<div class="mode-grid"><button type="button" data-mode="group"><span>01 · PART A</span><strong>Group Discussion</strong></button><button type="button" data-mode="response"><span>02 · PART B</span><strong>Individual Response</strong></button><button type="button" data-mode="synonym"><span>03 · LANGUAGE</span><strong>Synonym</strong></button></div>`;
}
function modeNav(active) {
  return `<nav class="mode-nav active-${['group', 'response', 'synonym'].indexOf(active)}" aria-label="模組練習選單"><button type="button" data-mode="group" ${active === 'group' ? 'aria-current="page"' : ''}>Group Discussion</button><button type="button" data-mode="response" ${active === 'response' ? 'aria-current="page"' : ''}>Individual Response</button><button type="button" data-mode="synonym" ${active === 'synonym' ? 'aria-current="page"' : ''}>Synonym</button></nav>`;
}
function groupPrompt(section, index) {
  const open = state.prompt === section.id;
  return `<section class="prompt-section ${open ? 'is-open' : ''}"><button type="button" class="prompt-trigger" data-prompt="${section.id}" aria-expanded="${open}"><span>${String(index + 1).padStart(2, '0')}</span><span><strong lang="en">${esc(section.question)}</strong><small>${section.arguments.length} 個論點 · ${section.angles.length} 個角度</small></span><b aria-hidden="true">${open ? '−' : '+'}</b></button>${open ? `<div class="prompt-body"><div class="prompt-actions"><div><button class="outline-button" type="button" data-structures>句式表</button><button class="outline-button" type="button" data-start-pick="solo">Pick Mode · 單人練習</button><button class="primary-button" type="button" data-start-pick="pair">Pick Mode · 雙人選論點</button></div></div><div class="angle-grid">${angleSections(section)}</div></div>` : ''}</section>`;
}
function renderGroup() {
  app.innerHTML = `${top()}${modeNav('group')}<div class="section-head dse-section-head"><div><span class="eyebrow">PART A · GROUP INTERACTION</span><h1>Group Discussion</h1><p>三個可展開的指定方向。每個角度都附有獨立論點、解釋及五項英中詞彙。</p></div><button type="button" class="outline-button" data-structures>20 個討論句式</button></div><div class="prompt-list">${state.data.groups.map(groupPrompt).join('')}</div>${structureWindow()}`;
}
function responseQuestion(section, index) {
  const open = state.response === section.id;
  return `<section class="prompt-section ${open ? 'is-open' : ''}"><button type="button" class="prompt-trigger" data-response="${section.id}" aria-expanded="${open}"><span>${String(index + 1).padStart(2, '0')}</span><span><strong lang="en">${esc(section.question)}</strong><small>${section.arguments.length} 個論點 · ${section.angles.length} 個角度</small></span><b aria-hidden="true">${open ? '−' : '+'}</b></button>${open ? `<div class="prompt-body"><p class="response-reminder">示範答覆只供練習；如涉及個人經歷，請按自己的真實情況修改。</p><div class="angle-grid">${angleSections(section)}</div><section class="sample-section"><span class="eyebrow">PRACTISE · ADAPT TO YOUR EXPERIENCE</span><h3>英文示範回應</h3>${section.samples.map(sample => `<div class="sample-card"><small>${esc(sample.label)}</small><p lang="en">${esc(sample.text.replace(/\*\*/g, ''))}</p>${audioControls(sample.text, 'response', `${section.id} · ${sample.label}`, 'response')}</div>`).join('')}</section></div>` : ''}</section>`;
}
function renderResponse() {
  app.innerHTML = `${top()}${modeNav('response')}<div class="section-head dse-section-head"><div><span class="eyebrow">PART B · INDIVIDUAL RESPONSE</span><h1>Individual Response</h1></div></div><div class="prompt-list">${state.data.responses.map(responseQuestion).join('')}</div>`;
}
function renderSynonym() {
  const sections = [...new Set(state.data.synonyms.map(item => item.category))];
  app.innerHTML = `${top()}${modeNav('synonym')}<div class="section-head dse-section-head"><div><span class="eyebrow">LANGUAGE BANK · ${state.data.synonyms.length} GROUPS</span><h1>Synonym</h1><p>每組有五個可在本題語境中使用的同義詞、近義詞或改寫方式。</p></div></div><div class="synonym-search"><label for="syn-search">搜尋關鍵詞、中文或替代表達</label><input id="syn-search" type="search" placeholder="Search keywords or alternatives…" autocomplete="off"></div><p class="synonym-warning">${esc(state.data.synonymWarning)}</p><div class="synonym-categories">${sections.map(category => `<section class="synonym-category"><h2>${esc(category)}</h2><div class="synonym-rows">${state.data.synonyms.map((entry, index) => entry.category === category ? `<article class="synonym-row ${state.selectedSynonyms.has(index) ? 'is-selected' : ''}" id="syn-item-${index}" data-search-text="${esc(`${entry.keyword} ${entry.chinese} ${entry.alternatives.join(' ')}`.toLowerCase())}"><button class="synonym-row__select" type="button" data-synonym-select="${index}" aria-pressed="${state.selectedSynonyms.has(index)}"><span class="synonym-term"><strong lang="en">${esc(entry.keyword)}</strong><span>${esc(entry.chinese)}</span></span><span class="synonym-alternatives" lang="en">${entry.alternatives.map(word => `<span>${esc(word)}</span>`).join('')}</span></button><div class="synonym-audio-list">${audioControls(entry.keyword, 'synonym')}${entry.alternatives.map(word => `<span class="synonym-audio-item"><small>${esc(word)}</small>${audioControls(word, 'synonym')}</span>`).join('')}</div>${tools(`syn:${index}`, entry.keyword)}</article>` : '').join('')}</div></section>`).join('')}</div><p class="empty-state" id="syn-empty" hidden>沒有找到相符的詞組。</p>`;
}
function structureWindow() {
  if (!state.structureOpen) return '';
  requestAnimationFrame(() => {
    const panel = $('#structure-float');
    const position = state.structurePosition;
    if (!panel || !position) return;
    panel.style.left = `${position.x}px`;
    panel.style.top = `${position.y}px`;
    panel.style.width = `${position.width}px`;
    panel.style.height = `${position.height}px`;
    panel.style.right = 'auto';
  });
  return `<aside class="structure-float" id="structure-float" aria-label="小組討論句式浮動視窗"><button type="button" class="structure-resize structure-resize--nw" data-resize-corner="nw" aria-label="拖動左上角調整視窗大小"></button><button type="button" class="structure-resize structure-resize--ne" data-resize-corner="ne" aria-label="拖動右上角調整視窗大小"></button><div class="structure-handle" data-drag-handle><div><span class="eyebrow">SENTENCE STRUCTURE</span><h3>小組討論句式 · 20</h3></div><button type="button" data-close-structures aria-label="關閉句式表">×</button></div><div class="structure-content">${state.data.structures.map(item => `<div class="structure-row" id="structure-item-${item.number}"><div class="structure-row__copy"><small>${String(item.number).padStart(2, '0')}</small><strong lang="en">${esc(item.english)}</strong><span>${esc(item.purpose)}</span></div>${tools(`structure:${item.number}`, item.english)}</div>`).join('')}</div><div class="resize-note">拖動標題列移動 · 拖動任意一角調整大小</div><button type="button" class="structure-resize structure-resize--sw" data-resize-corner="sw" aria-label="拖動左下角調整視窗大小"></button><button type="button" class="structure-resize structure-resize--se" data-resize-corner="se" aria-label="拖動右下角調整視窗大小"></button></aside>`;
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
    return chosen.length ? `<div class="comparison-angle"><h3>${esc(angle)}</h3>${chosen.map(item => `<article class="comparison-entry ${state.pick.collapsed[index].has(item.id) ? '' : 'is-open'}"><div class="comparison-entry__head"><button type="button" data-compare-toggle="${esc(item.id)}" data-picker-index="${index}" aria-expanded="${!state.pick.collapsed[index].has(item.id)}"><span>${esc(item.id)}</span><strong>${esc(item.title)}</strong><b aria-hidden="true">${state.pick.collapsed[index].has(item.id) ? '+' : '−'}</b></button>${tools(`arg:${item.id}`, item.title)}</div>${state.pick.collapsed[index].has(item.id) ? '' : `<div class="comparison-entry__detail"><p>${esc(item.description)}</p><h4>Glossary · 關鍵詞彙</h4><ul class="glossary">${item.glossary.map((term, i) => glossaryRow(term, `gloss:${item.id}:${i}`)).join('')}</ul>${englishDemo(item.englishDemo, item.id.startsWith('B') ? 'response' : 'group', item.id)}</div>`}</article>`).join('')}</div>` : '';
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
async function renderRecordings() {
  state.view = 'recordings';
  state.recordingOffset = 0;
  app.innerHTML = `<div class="recording-page"><div class="dse-top">${state.role === 'admin' ? '<a class="back-button" href="speaking-system.html?admin=1">← 管理員首頁</a>' : '<button class="back-button" data-home>← 返回主頁</button>'}</div><h1>${state.role === 'admin' ? 'DSE 學生錄音' : '我的錄音'}</h1><p>小組討論、個人發言及同義詞朗讀錄音。</p><div data-recording-list role="status">正在載入錄音…</div><button type="button" class="outline-button" data-more-recordings hidden>載入更多錄音</button></div>`;
  await loadMoreRecordings();
}
async function loadMoreRecordings() {
  const list = app.querySelector('[data-recording-list]');
  const more = app.querySelector('[data-more-recordings]');
  if (!list || !more || more.disabled) return;
  more.disabled = true;
  try {
    const records = await rpc('dse_argument_recording', {p_token:state.token,p_action:'list',p_payload:{offset:state.recordingOffset}});
    if (!list.isConnected) return;
    const html = records.map(item => `<article class="saved-recording"><div><strong>${esc(item.label)}</strong><small>${esc(item.studentName)} · ${esc(item.moduleId)} · ${esc(new Date(item.createdAt).toLocaleString('zh-HK'))}</small></div><button type="button" class="mini-audio" data-listen-recording="${esc(item.id)}" aria-label="播放錄音：${esc(item.label)}">${speakerIcon}</button><audio controls hidden></audio></article>`).join('');
    if (!state.recordingOffset) list.innerHTML = html || '<p>暫時沒有錄音。</p>';
    else list.insertAdjacentHTML('beforeend', html);
    state.recordingOffset += records.length;
    more.hidden = records.length < 100;
  } catch (error) { if (list.isConnected) list.insertAdjacentHTML('beforeend', `<p role="alert">錄音未能載入：${esc(error.message)}</p>`); }
  finally { if (more.isConnected) more.disabled = false; }
}
async function listenRecording(button) {
  const row = button.closest('.saved-recording');
  const player = row.querySelector('audio');
  if (!player.src) {
    const data = await rpc('dse_argument_recording',{p_token:state.token,p_action:'get',p_payload:{id:button.dataset.listenRecording}});
    const bytes = Uint8Array.from(atob(data.audio), character => character.charCodeAt(0));
    player.src = URL.createObjectURL(new Blob([bytes],{type:data.mime}));
  }
  player.hidden = false; await player.play();
}
function render() {
  if (state.view === 'recordings') { renderRecordings(); return; }
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
function navigate(view) { clearTimeout(modeTransitionTimer); state.view = view; state.structureOpen = false; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

app.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-play-text')) { playAudio(button.dataset.playText, button.dataset.playVoice, button); return; }
  if (button.hasAttribute('data-record-type')) { toggleRecording(button); return; }
  if (button.hasAttribute('data-recordings')) { navigate('recordings'); return; }
  if (button.hasAttribute('data-listen-recording')) { listenRecording(button).catch(error => toast(`未能播放錄音：${error.message}`, true)); return; }
  if (button.hasAttribute('data-more-recordings')) { loadMoreRecordings(); return; }
  if (button.hasAttribute('data-retry')) { start(); return; }
  if (button.hasAttribute('data-home')) { state.pick = null; navigate('home'); return; }
  if (button.hasAttribute('data-search-more')) { state.searchLimit += 40; renderSearchResults(); return; }
  if (button.hasAttribute('data-search-result')) { const result = state.searchMatches[Number(button.dataset.searchResult)]; if (result) selectModule(result.moduleIndex, result); return; }
  if (button.hasAttribute('data-year-order')) { state.yearOrder = state.yearOrder === 'newest' ? 'oldest' : 'newest'; renderHome(); return; }
  if (button.hasAttribute('data-year')) { state.selectedYear = Number(button.dataset.year); renderHome(); return; }
  if (button.hasAttribute('data-module')) { selectModule(Number(button.dataset.module)); return; }
  if (button.hasAttribute('data-bookmarks')) { navigate('bookmarks'); return; }
  if (button.dataset.mode) {
    const nav = button.closest('.mode-nav');
    if (nav && button.getAttribute('aria-current') !== 'page' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clearTimeout(modeTransitionTimer);
      nav.classList.remove('active-0', 'active-1', 'active-2');
      nav.classList.add(`active-${['group', 'response', 'synonym'].indexOf(button.dataset.mode)}`);
      nav.querySelectorAll('[data-mode]').forEach(item => item.removeAttribute('aria-current'));
      button.setAttribute('aria-current', 'page');
      modeTransitionTimer = setTimeout(() => { state.pick = null; navigate(button.dataset.mode); }, 350);
      return;
    }
    state.pick = null; navigate(button.dataset.mode); return;
  }
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
  if (button.dataset.glossarySelect) {
    const id = button.dataset.glossarySelect;
    state.selectedGlossary.has(id) ? state.selectedGlossary.delete(id) : state.selectedGlossary.add(id);
    app.querySelectorAll('[data-glossary-select]').forEach(item => {
      if (item.dataset.glossarySelect !== id) return;
      item.setAttribute('aria-pressed', String(state.selectedGlossary.has(id)));
      item.closest('li').classList.toggle('is-selected', state.selectedGlossary.has(id));
    });
    return;
  }
  if (button.dataset.synonymSelect) {
    const index = Number(button.dataset.synonymSelect);
    state.selectedSynonyms.has(index) ? state.selectedSynonyms.delete(index) : state.selectedSynonyms.add(index);
    button.setAttribute('aria-pressed', String(state.selectedSynonyms.has(index)));
    button.closest('.synonym-row').classList.toggle('is-selected', state.selectedSynonyms.has(index));
    return;
  }
  if (button.dataset.star) {
    const turnOn = !itemState(button.dataset.star).bookmarked;
    save(button.dataset.star, { bookmarked: turnOn });
    if (turnOn) {
      button.classList.remove('sparkle');
      void button.offsetWidth;
      button.classList.add('sparkle');
      setTimeout(() => button.classList.remove('sparkle'), 720);
    }
    return;
  }
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
  if (event.target?.id === 'global-search') {
    state.searchQuery = event.target.value;
    state.searchLimit = 40;
    renderSearchResults();
    return;
  }
  if (event.target?.id !== 'syn-search') return;
  const query = event.target.value.trim().toLocaleLowerCase();
  let count = 0;
  app.querySelectorAll('.synonym-row').forEach(row => { row.hidden = !row.dataset.searchText.includes(query); if (!row.hidden) count++; });
  app.querySelectorAll('.synonym-category').forEach(section => { section.hidden = !section.querySelector('.synonym-row:not([hidden])'); });
  $('#syn-empty').hidden = count > 0;
});
app.addEventListener('keydown', event => {
  if (event.target?.id === 'global-search' && event.key === 'Enter') {
    event.preventDefault();
    const first = state.searchMatches[0];
    if (first) selectModule(first.moduleIndex, first);
  }
});

app.addEventListener('pointerdown', event => {
  const corner = event.target.closest('[data-resize-corner]');
  const handle = event.target.closest('[data-drag-handle]');
  if (!corner && (!handle || event.target.closest('button'))) return;
  const panel = $('#structure-float');
  if (!panel) return;
  const rect = panel.getBoundingClientRect();
  const control = corner || handle;
  const clamp = (value, low, high) => Math.min(Math.max(value, low), Math.max(low, high));
  const minWidth = Math.min(330, window.innerWidth - 16);
  const minHeight = Math.min(220, window.innerHeight - 90);
  const startX = event.clientX;
  const startY = event.clientY;
  event.preventDefault();
  control.setPointerCapture(event.pointerId);
  const move = moveEvent => {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;
    let left = rect.left;
    let right = rect.right;
    let top = rect.top;
    let bottom = rect.bottom;
    if (corner) {
      const direction = corner.dataset.resizeCorner;
      if (direction.includes('w')) left = clamp(rect.left + dx, 8, rect.right - minWidth);
      else right = clamp(rect.right + dx, rect.left + minWidth, window.innerWidth - 8);
      if (direction.includes('n')) top = clamp(rect.top + dy, 72, rect.bottom - minHeight);
      else bottom = clamp(rect.bottom + dy, rect.top + minHeight, window.innerHeight - 8);
    } else {
      left = clamp(rect.left + dx, 8, window.innerWidth - rect.width - 8);
      top = clamp(rect.top + dy, 72, window.innerHeight - rect.height - 8);
      right = left + rect.width;
      bottom = top + rect.height;
    }
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.width = `${right - left}px`;
    panel.style.height = `${bottom - top}px`;
    panel.style.right = 'auto';
    state.structurePosition = { x: left, y: top, width: right - left, height: bottom - top };
  };
  const stop = () => { control.removeEventListener('pointermove', move); control.removeEventListener('pointerup', stop); control.removeEventListener('pointercancel', stop); };
  control.addEventListener('pointermove', move); control.addEventListener('pointerup', stop); control.addEventListener('pointercancel', stop);
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
