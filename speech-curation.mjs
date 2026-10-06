import { initSpeechPreferences, setSpeechStudentNavigation } from '/speech-curation-preferences.mjs';
initSpeechPreferences();
const $ = selector => document.querySelector(selector);
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const SESSION_KEY = 'edmund-speech-curation-session-v1';
const LESSON_ROUTES = [
  { slug: 'churchill-1949', path: '/speech-curation-churchill.html' },
  { slug: 'churchill-victory-europe-1945', path: '/speech-curation-victory-europe.html' },
  { slug: 'churchill-invasion-france-1944', path: '/speech-curation-invasion-france.html' }
];
const el = {
  entry: $('[data-entry-stage]'), login: $('[data-login-panel]'), library: $('[data-library]'), loginForm: $('[data-login-form]'),
  loginButton: $('[data-login-button]'), loginStatus: $('[data-login-status]'),
  accountName: $('[data-account-name]'), logout: $('[data-logout]'),
  list: $('[data-speech-list]'), libraryStatus: $('[data-library-status]'),
  savedList: $('[data-saved-list]'), savedStatus: $('[data-saved-status]'), savedCount: $('[data-saved-count]'),
  search: $('[data-search]'), textResults: $('[data-text-results]'), editor: $('[data-editor]'), editorForm: $('[data-editor-form]'),
  editorTitle: $('#editor-title'), editorStatus: $('[data-editor-status]'),
  save: $('[data-save]'), cancelEdit: $('[data-cancel-edit]'),
  accountPanel: $('[data-account-panel]'), accountForm: $('[data-account-form]'),
  accountTitle: $('#account-title'), accountStatus: $('[data-account-status]'),
  accountList: $('[data-account-list]'), accountCount: $('[data-account-count]'),
  accountSave: $('[data-save-account]'), accountCancel: $('[data-cancel-account]'),
  passwordHint: $('[data-password-hint]')
};
let client, role = 'account', session = null, speeches = [], accounts = [], savedMarks = [];
const savedLessons = new Map();
let searchMatches = [], searchRevision = 0, searchTimer = 0;

function status(node, message) { node.textContent = message || ''; }
function storedSession() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
function saveSession() { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* Session remains in memory. */ } }
function clearSession() { session = null; try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Optional storage. */ } }

async function ensureClient() {
  if (!window.supabase?.createClient || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    throw new Error('登入服務暫時未能載入，請重新整理頁面。');
  }
  let storage;
  try { storage = sessionStorage; } catch { storage = undefined; }
  client ||= window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: { persistSession: Boolean(storage), ...(storage ? { storage } : {}), autoRefreshToken: true, detectSessionInUrl: false }
  });
  const current = await client.auth.getSession();
  if (current.error) throw current.error;
  if (!current.data?.session?.user?.id) {
    const signedIn = await client.auth.signInAnonymously();
    if (signedIn.error) throw signedIn.error;
  }
  return client;
}

async function rpc(name, args) {
  const db = await ensureClient();
  const { data, error } = await db.rpc(name, args);
  if (error) throw error;
  return data;
}

async function validAccount(token) {
  const rows = await rpc('speech_curation_account_profile', { p_token: token });
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row?.id || !row?.session_token) return null;
  return { role: 'account', token: row.session_token, id: row.id, name: row.name };
}

async function exchangeStudentSession(token) {
  const rows = await rpc('speech_curation_account_from_student_session', { p_student_token: token });
  const row = Array.isArray(rows) ? rows[0] : null;
  return row?.session_token ? { role: 'account', token: row.session_token, id: row.id, name: row.name } : null;
}

async function validAdmin(token) {
  const rows = await rpc('speech_curation_admin_profile', { p_token: token });
  const row = Array.isArray(rows) ? rows[0] : null;
  return row?.session_token ? { role: 'admin', token: row.session_token, name: row.name } : null;
}

function showSignedIn() {
  const next = new URLSearchParams(location.search).get('next');
  const destination = LESSON_ROUTES.find(route => route.slug === next || (next === 'churchill' && route.slug === 'churchill-1949'));
  if (destination) {
    saveSession();
    location.replace(destination.path);
    return;
  }
  el.entry.hidden = true;
  el.login.hidden = true;
  el.library.hidden = false;
  el.logout.hidden = false;
  el.accountName.hidden = false;
  el.accountName.textContent = session.name;
  el.editor.hidden = session.role !== 'admin';
  el.accountPanel.hidden = session.role !== 'admin';
  if (session.role === 'admin') setSpeechStudentNavigation(false);
  saveSession();
  const requestedSearch = new URLSearchParams(location.search).get('search');
  if (requestedSearch) el.search.value = requestedSearch;
  void loadSpeeches();
  void loadSavedLibrary();
  if (session.role === 'admin') void loadAccounts();
}

function showLogin() {
  ++searchRevision;
  clearTimeout(searchTimer);
  el.entry.hidden = false;
  el.login.hidden = false;
  el.library.hidden = true;
  el.logout.hidden = true;
  el.accountName.hidden = true;
  el.editor.hidden = true;
  el.accountPanel.hidden = true;
  el.list.replaceChildren();
  el.accountList.replaceChildren();
  speeches = []; accounts = [];
  savedMarks = []; savedLessons.clear();
  searchMatches = []; el.textResults.replaceChildren(); el.textResults.hidden = true;
  el.savedList.replaceChildren();
  setSpeechStudentNavigation(true);
}

async function restore() {
  const own = storedSession();
  const universal = window.EdmundSystemNav?.getStudentSession?.();
  try {
    if (own?.role === 'admin' && own.token) session = await validAdmin(own.token);
    else {
      if (own?.role === 'account' && own.token) session = await validAccount(own.token);
      const token = own?.role === 'student' ? own.token : universal?.role === 'student' ? universal.token : null;
      if (!session && token) session = await exchangeStudentSession(token);
    }
  } catch (error) { console.warn('Speech curation session restore failed', error); }
  if (session) showSignedIn();
  else { clearSession(); showLogin(); }
}

function changeRole(next) {
  role = next;
  document.querySelectorAll('[data-role]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.role === role)));
  status(el.loginStatus, '');
}

el.loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(el.loginForm);
  const name = String(data.get('username') || '').trim();
  const password = String(data.get('password') || '');
  if (!name || !password) return status(el.loginStatus, '請輸入使用者名稱及密碼。');
  el.loginButton.disabled = true;
  status(el.loginStatus, '正在登入…');
  try {
    if (role === 'admin') {
      const rows = await rpc('speech_curation_admin_login', { p_name: name, p_password: password });
      const row = Array.isArray(rows) ? rows[0] : null;
      session = row?.session_token ? { role: 'admin', token: row.session_token, name: row.name } : null;
    } else {
      const rows = await rpc('speech_curation_account_login', { p_name: name, p_password: password });
      const row = Array.isArray(rows) ? rows[0] : null;
      session = row?.session_token ? { role: 'account', token: row.session_token, id: row.id, name: row.name } : null;
    }
    if (!session) throw new Error('使用者名稱或密碼不正確。');
    el.loginForm.reset();
    status(el.loginStatus, '');
    showSignedIn();
  } catch (error) {
    console.warn('Speech curation login failed', error);
    status(el.loginStatus, error?.message === '使用者名稱或密碼不正確。' ? error.message : '登入暫時未能完成，請稍後再試。');
  } finally { el.loginButton.disabled = false; }
});

document.querySelectorAll('[data-role]').forEach(button => button.addEventListener('click', () => changeRole(button.dataset.role)));
el.logout.addEventListener('click', async () => {
  const previous = session;
  clearSession();
  if (previous?.role === 'admin') {
    try { await rpc('speech_curation_admin_logout', { p_token: previous.token }); } catch { /* Local logout still applies. */ }
  } else {
    try { await rpc('speech_curation_account_logout', { p_token: previous.token }); } catch { /* Local logout still applies. */ }
    window.EdmundSystemNav?.forgetStudentSession?.();
  }
  showLogin();
});

function safeLink(value) {
  try { const parsed = new URL(value); return parsed.protocol === 'https:' ? parsed.href : null; }
  catch { return null; }
}
function text(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value;
  return node;
}
function readerTokens() {
  return {
    p_account_token: session.role === 'admin' ? null : session.token,
    p_admin_token: session.role === 'admin' ? session.token : null
  };
}
function ideaTitle(raw) {
  if (raw && typeof raw === 'object') return `${raw.title_en || 'Language note'}（${raw.title_zh || '語言觀察'}）`;
  const clean = String(raw || '').replace(/^\d+\.\s*/, '');
  const colon = clean.search(/[:：]/);
  return colon > 0 && colon < 105 ? clean.slice(0, colon).trim() : '語言觀察';
}
function renderSavedLibrary() {
  el.savedList.replaceChildren();
  const bookmarks = savedMarks.filter(mark => mark.kind === 'line' || mark.kind === 'idea');
  el.savedCount.textContent = String(bookmarks.length);
  if (!bookmarks.length) {
    el.savedList.append(text('p', 'saved-empty', '暫無書籤。閱讀演說時可收藏句子或個別導讀。'));
    return;
  }
  bookmarks.forEach(mark => {
    const lesson = savedLessons.get(mark.slug);
    const line = lesson?.lines?.[mark.line_index];
    if (!line) return;
    const item = text('article', 'saved-item', '');
    const header = text('div', 'saved-item-head', '');
    const kind = mark.kind === 'idea' ? `導讀 ${String(mark.idea_index + 1).padStart(2, '0')}` : '演說句子';
    header.append(text('span', 'saved-kicker', `${lesson.title} · ${String(mark.line_index + 1).padStart(3, '0')} · ${kind}`));
    const remove = text('button', 'saved-remove', '移除');
    remove.type = 'button'; remove.dataset.removeMark = `${mark.slug}:${mark.line_index}:${mark.kind}:${mark.idea_index}`;
    remove.setAttribute('aria-label', `移除第 ${mark.line_index + 1} 句${mark.kind === 'idea' ? '導讀' : ''}書籤`);
    header.append(remove);
    item.append(header);
    if (mark.kind === 'idea') item.append(text('h4', 'saved-idea-title', ideaTitle(line.notes?.[mark.idea_index])));
    item.append(text('p', 'saved-english', line.english), text('p', 'saved-chinese', line.chinese));
    const link = text('a', 'saved-link', '返回這段導讀 →');
    const route = LESSON_ROUTES.find(route => route.slug === mark.slug);
    link.href = `${route.path}?line=${mark.line_index + 1}${mark.kind === 'idea' ? `&idea=${mark.idea_index + 1}` : ''}#transcript`;
    item.append(link);
    el.savedList.append(item);
  });
}
async function loadSavedLibrary() {
  status(el.savedStatus, '正在整理書籤…');
  try {
    const results = await Promise.all(LESSON_ROUTES.map(async route => {
      const state = await rpc('speech_curation_reader_state', { p_slug: route.slug, ...readerTokens() });
      const marks = Array.isArray(state?.marks) ? state.marks.map(mark => ({ ...mark, slug: route.slug })) : [];
      if (marks.some(mark => mark.kind === 'line' || mark.kind === 'idea')) {
        savedLessons.set(route.slug, await rpc('speech_curation_lesson', { p_slug: route.slug, ...readerTokens() }));
      }
      return { state, marks };
    }));
    setSpeechStudentNavigation(results.some(result => result.state?.is_student));
    savedMarks = results.flatMap(result => result.marks);
    status(el.savedStatus, ''); renderSavedLibrary();
  } catch (error) {
    console.warn('Speech bookmarks unavailable', error);
    status(el.savedStatus, '書籤暫時未能載入，請稍後重新整理。');
  }
}
el.savedList.addEventListener('click', async event => {
  const button = event.target.closest('[data-remove-mark]');
  if (!button || !session) return;
  const [slug, line, kind, idea] = button.dataset.removeMark.split(':');
  button.disabled = true;
  try {
    await rpc('speech_curation_reader_mark', {
      p_slug: slug, p_line_index: Number(line), p_kind: kind,
      p_idea_index: Number(idea), p_active: false, ...readerTokens()
    });
    savedMarks = savedMarks.filter(mark => !(mark.slug === slug && mark.line_index === Number(line) && mark.kind === kind && mark.idea_index === Number(idea)));
    renderSavedLibrary();
  } catch (error) {
    console.warn('Speech bookmark removal failed', error);
    status(el.savedStatus, '移除書籤失敗，請稍後再試。');
    button.disabled = false;
  }
});
function renderSpeeches() {
  const query = el.search.value.trim().toLocaleLowerCase();
  const visible = speeches.filter(row => `${row.title} ${row.speaker} ${row.description}`.toLocaleLowerCase().includes(query) || searchMatches.some(match => row.url?.includes(match.route.path)));
  el.list.replaceChildren();
  if (!visible.length) {
    const empty = text('div', 'empty-state', '');
    empty.append(text('h3', '', query ? '找不到相符的演講' : '演講精選即將開始'), text('p', '', query ? '試試其他講者、標題或原文詞句。' : '管理員加入第一則演講後，這裡便會顯示內容。'));
    el.list.append(empty);
    return;
  }
  const bySpeaker = new Map();
  visible.forEach(row => {
    if (!bySpeaker.has(row.speaker)) bySpeaker.set(row.speaker, []);
    bySpeaker.get(row.speaker).push(row);
  });
  for (const [speaker, rows] of bySpeaker) {
    const group = document.createElement('details');
    group.className = 'speaker-group';
    group.open = Boolean(query);
    const heading = document.createElement('summary');
    const speakerName = text('span', 'speaker-group-name', speaker);
    const count = text('span', 'speaker-group-count', `${rows.length} 篇演講`);
    heading.append(speakerName, count, text('span', 'speaker-group-arrow', '⌄'));
    group.append(heading);
    const contents = text('div', 'speaker-speeches', '');
    rows.forEach(row => {
    const card = text('article', 'speech-card', '');
    card.append(text('p', 'eyebrow', 'FEATURED SPEECH'), text('h3', '', row.title));
    if (row.description) card.append(text('p', 'description', row.description));
    const actions = text('div', 'speech-actions', '');
    const href = safeLink(row.url);
    if (href) {
      const local = new URL(href).origin === location.origin;
      const link = text('a', 'speech-link', local ? '逐句閱讀 →' : '開啟演講 ↗');
      link.href = href;
      if (!local) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      actions.append(link);
    }
    if (session?.role === 'admin') {
      for (const [action, label] of [['edit', '編輯'], ['delete', '刪除']]) {
        const button = text('button', '', label);
        button.type = 'button';
        button.dataset.action = action;
        button.dataset.id = row.id;
        actions.append(button);
      }
    }
    card.append(actions);
    contents.append(card);
    });
    group.append(contents);
    el.list.append(group);
  }
}

async function searchSpeechText() {
  const query = el.search.value.trim().toLocaleLowerCase();
  const revision = ++searchRevision;
  searchMatches = [];
  el.textResults.replaceChildren();
  el.textResults.hidden = !query;
  renderSpeeches();
  if (!query) return;
  el.textResults.append(text('p', '', '正在搜尋演說原文…'));
  try {
    const lessons = await Promise.all(LESSON_ROUTES.map(async route => {
      if (!savedLessons.has(route.slug)) savedLessons.set(route.slug, await rpc('speech_curation_lesson', { p_slug: route.slug, ...readerTokens() }));
      return { route, lesson: savedLessons.get(route.slug) };
    }));
    if (revision !== searchRevision) return;
    searchMatches = lessons.flatMap(({ route, lesson }) => (lesson?.lines || []).map((line, index) => ({ route, lesson, line, index })))
      .filter(({ line }) => `${line.english} ${line.chinese} ${(line.notes || []).map(note => typeof note === 'string' ? note : `${note.title_en} ${note.title_zh} ${note.description_zh}`).join(' ')}`.toLocaleLowerCase().includes(query));
    el.textResults.replaceChildren();
    el.textResults.append(text('p', 'library-text-count', searchMatches.length ? `${searchMatches.length} 句符合` : '演說原文沒有相符詞句'));
    searchMatches.slice(0, 10).forEach(({ route, lesson, line, index }) => {
      const link = text('a', 'library-text-hit', '');
      link.href = `${route.path}?line=${index + 1}#transcript`;
      link.append(text('strong', '', `${lesson.title} · 第 ${index + 1} 句`), text('span', '', line.english));
      el.textResults.append(link);
    });
    if (searchMatches.length > 10) el.textResults.append(text('p', 'library-text-count', `另有 ${searchMatches.length - 10} 句；請縮小搜尋詞。`));
    renderSpeeches();
  } catch (error) {
    if (revision !== searchRevision) return;
    console.warn('Speech text search failed', error);
    el.textResults.replaceChildren(text('p', '', '原文搜尋暫時未能使用，仍可搜尋講者與標題。'));
  }
}

async function loadSpeeches() {
  status(el.libraryStatus, '正在更新演講資料…');
  try {
    const rows = await rpc('speech_curation_list', {
      p_student_token: session.role === 'account' ? session.token : null,
      p_admin_token: session.role === 'admin' ? session.token : null
    });
    speeches = Array.isArray(rows) ? rows : [];
    status(el.libraryStatus, '');
    renderSpeeches();
  } catch (error) {
    console.warn('Speech curation load failed', error);
    status(el.libraryStatus, '暫時未能載入演講，請重新整理頁面。');
  }
}

function resetEditor() {
  el.editorForm.reset();
  el.editorTitle.textContent = '新增演講';
  el.cancelEdit.hidden = true;
  status(el.editorStatus, '');
}
el.cancelEdit.addEventListener('click', resetEditor);
el.editorForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (session?.role !== 'admin') return;
  const data = new FormData(el.editorForm);
  const url = String(data.get('url') || '').trim();
  if (!safeLink(url)) return status(el.editorStatus, '請輸入 HTTPS 演講連結。');
  el.save.disabled = true;
  status(el.editorStatus, '正在儲存…');
  try {
    await rpc('speech_curation_save', {
      p_token: session.token, p_id: data.get('id') || null,
      p_title: String(data.get('title') || ''), p_speaker: String(data.get('speaker') || ''),
      p_url: url, p_description: String(data.get('description') || '')
    });
    resetEditor();
    await loadSpeeches();
    status(el.editorStatus, '已儲存，演講帳戶現在可以看到。');
  } catch (error) {
    console.warn('Speech curation save failed', error);
    status(el.editorStatus, '儲存失敗，請檢查資料或重新登入。');
  } finally { el.save.disabled = false; }
});
el.list.addEventListener('click', async event => {
  const button = event.target.closest('button[data-action]');
  if (!button || session?.role !== 'admin') return;
  const row = speeches.find(item => item.id === button.dataset.id);
  if (!row) return;
  if (button.dataset.action === 'edit') {
    for (const key of ['id', 'title', 'speaker', 'url', 'description']) el.editorForm.elements.namedItem(key).value = row[key] || '';
    el.editorTitle.textContent = '編輯演講';
    el.cancelEdit.hidden = false;
    el.editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.editorForm.elements.namedItem('title').focus({ preventScroll: true });
    return;
  }
  if (!confirm(`刪除「${row.title}」？`)) return;
  button.disabled = true;
  try {
    await rpc('speech_curation_delete', { p_token: session.token, p_id: row.id });
    await loadSpeeches();
  } catch (error) {
    console.warn('Speech curation delete failed', error);
    status(el.libraryStatus, '刪除失敗，請稍後重試。');
    button.disabled = false;
  }
});

function renderAccounts() {
  el.accountList.replaceChildren();
  el.accountCount.textContent = `${accounts.length} 個帳戶`;
  for (const account of accounts) {
    const row = text('div', 'account-row', '');
    const details = text('div', '', '');
    details.append(
      text('strong', '', account.name),
      text('small', '', `${account.source_student_id ? '原有學生帳戶副本' : '演講專屬帳戶'} · ${account.active ? '可登入' : '已停用'}`)
    );
    const button = text('button', '', '管理');
    button.type = 'button';
    button.dataset.accountId = account.id;
    row.append(details, button);
    el.accountList.append(row);
  }
}

async function loadAccounts() {
  status(el.accountStatus, '正在更新帳戶名單…');
  try {
    const rows = await rpc('speech_curation_accounts', { p_admin_token: session.token });
    accounts = Array.isArray(rows) ? rows : [];
    renderAccounts();
    status(el.accountStatus, '');
  } catch (error) {
    console.warn('Speech account list failed', error);
    status(el.accountStatus, '暫時未能讀取帳戶名單，請重新整理頁面。');
  }
}

function resetAccountForm() {
  el.accountForm.reset();
  el.accountTitle.textContent = '開設演講帳戶';
  el.accountSave.textContent = '建立帳戶';
  el.accountCancel.hidden = true;
  el.accountForm.elements.namedItem('password').required = true;
  el.passwordHint.textContent = '至少 12 個字元';
  status(el.accountStatus, '');
}
el.accountCancel.addEventListener('click', resetAccountForm);
el.accountList.addEventListener('click', event => {
  const button = event.target.closest('button[data-account-id]');
  if (!button || session?.role !== 'admin') return;
  const account = accounts.find(row => row.id === button.dataset.accountId);
  if (!account) return;
  el.accountForm.elements.namedItem('id').value = account.id;
  el.accountForm.elements.namedItem('name').value = account.name;
  el.accountForm.elements.namedItem('password').value = '';
  el.accountForm.elements.namedItem('password').required = false;
  el.accountForm.elements.namedItem('active').checked = account.active;
  el.accountTitle.textContent = `管理帳戶 · ${account.name}`;
  el.accountSave.textContent = '儲存帳戶變更';
  el.accountCancel.hidden = false;
  el.passwordHint.textContent = '留空即保留原有密碼；輸入至少 12 個字元可重設';
  status(el.accountStatus, '');
  el.accountPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.accountForm.elements.namedItem('name').focus({ preventScroll: true });
});
el.accountForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (session?.role !== 'admin') return;
  const data = new FormData(el.accountForm);
  const id = String(data.get('id') || '');
  const password = String(data.get('password') || '');
  if (!id && password.length < 12) return status(el.accountStatus, '新帳戶密碼至少需要 12 個字元。');
  if (password && password.length < 12) return status(el.accountStatus, '新密碼至少需要 12 個字元。');
  el.accountSave.disabled = true;
  status(el.accountStatus, '正在儲存帳戶…');
  try {
    await rpc('speech_curation_account_save', {
      p_admin_token: session.token,
      p_id: id || null,
      p_name: String(data.get('name') || '').trim(),
      p_password: password,
      p_active: data.has('active')
    });
    resetAccountForm();
    await loadAccounts();
    status(el.accountStatus, id ? '帳戶已更新。' : '演講帳戶已建立；請將登入資料交給該用戶。');
  } catch (error) {
    console.warn('Speech account save failed', error);
    status(el.accountStatus, error?.code === '23505' ? '此使用者名稱已存在。' : '儲存帳戶失敗，請檢查資料或重新登入。');
  } finally { el.accountSave.disabled = false; }
});

el.search.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(searchSpeechText, 180);
});
void restore();
