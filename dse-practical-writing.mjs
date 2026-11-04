const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const config = window.EDMUND_SUPABASE || {};
const rawExercises = window.EDMUND_DSE_WRITING_PART_A_EXERCISES || {};
const sessionKey = 'edmund-dse-practical-writing-session-v1';
const draftPrefix = 'edmund-dse-practical-writing-draft-v1';
const authMemory = new Map();
const resilientStorage = {
  getItem(key) { if (authMemory.has(key)) return authMemory.get(key); try { return sessionStorage.getItem(key); } catch { return null; } },
  setItem(key, value) { authMemory.set(key, value); try { sessionStorage.setItem(key, value); } catch { /* Keep authentication in memory. */ } },
  removeItem(key) { authMemory.delete(key); try { sessionStorage.removeItem(key); } catch { /* Continue in memory. */ } }
};
const client = window.supabase?.createClient?.(config.url, config.anonKey, {
  auth: { persistSession: true, storage: resilientStorage, autoRefreshToken: true, detectSessionInUrl: false }
});
const state = {
  user: null,
  exercises: Object.values(rawExercises).map((exercise, index) => ({
    id: String(exercise.id || `task-${index + 1}`),
    title: String(exercise.title || 'Untitled task'),
    exam: String(exercise.exam || 'DSE Writing Part A'),
    taskType: String(exercise.taskType || 'Part A'),
    prompt: Array.isArray(exercise.questionPrompt) ? exercise.questionPrompt.map(String) : [],
    images: Array.isArray(exercise.questionImages) ? exercise.questionImages : [],
    year: Number(String(exercise.exam || '').match(/20\d{2}/)?.[0] || 0)
  })).sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)),
  activeId: '',
  search: '',
  saveTimer: 0,
  toastTimer: 0
};

async function rpc(name, args = {}) {
  if (!client) throw new Error('登入服務暫時未能載入，請重新整理頁面。');
  const current = await client.auth.getSession();
  if (current.error || !current.data.session?.user?.id) {
    const result = await client.auth.signInAnonymously();
    if (result.error) throw result.error;
  }
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function draftKey(id) {
  const owner = state.user?.id || state.user?.name || 'student';
  return `${draftPrefix}:${owner}:${id}`;
}

function readDraft(id) {
  try { return localStorage.getItem(draftKey(id)) || ''; } catch { return ''; }
}

function writeDraft(id, value) {
  try { localStorage.setItem(draftKey(id), value); return true; } catch { return false; }
}

function deleteDraft(id) {
  try { localStorage.removeItem(draftKey(id)); return true; } catch { return false; }
}

function wordCount(value) {
  return String(value || '').trim().match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length || 0;
}

function draftCount() {
  return state.exercises.filter(exercise => readDraft(exercise.id).trim()).length;
}

function updateProgress() {
  $('[data-task-count]').textContent = String(state.exercises.length);
  $('[data-draft-count]').textContent = String(draftCount());
}

function filteredExercises() {
  const query = state.search.trim().toLocaleLowerCase('en');
  if (!query) return state.exercises;
  return state.exercises.filter(exercise => [exercise.year, exercise.title, exercise.exam, exercise.taskType, ...exercise.prompt].join(' ').toLocaleLowerCase('en').includes(query));
}

function renderLibrary() {
  const exercises = filteredExercises();
  $('[data-library-count]').textContent = `${exercises.length} 題`;
  const list = $('[data-task-list]');
  if (!exercises.length) {
    list.innerHTML = '<p class="no-results">找不到相符題目。</p>';
    return;
  }
  list.innerHTML = exercises.map(exercise => `
    <button class="task-card ${state.activeId === exercise.id ? 'is-active' : ''}" type="button" data-task-id="${escapeHtml(exercise.id)}" aria-pressed="${state.activeId === exercise.id}">
      <span class="task-year">${escapeHtml(exercise.year || 'DSE')}</span>
      <span class="task-copy"><strong>${escapeHtml(exercise.title)}</strong><small>${escapeHtml(exercise.taskType)}</small></span>
      ${readDraft(exercise.id).trim() ? '<span class="draft-dot" aria-label="已有草稿"></span>' : '<span></span>'}
    </button>`).join('');
}

function imageMarkup(images) {
  if (!images.length) return '';
  return `<div class="question-images">${images.map((image, index) => `
    <figure class="question-image"><img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt || `題目圖片 ${index + 1}`)}" loading="lazy" decoding="async"><figcaption>題目圖片 ${index + 1}</figcaption></figure>`).join('')}</div>`;
}

function renderWorkspace() {
  const exercise = state.exercises.find(item => item.id === state.activeId);
  if (!exercise) return;
  const draft = readDraft(exercise.id);
  $('[data-workspace]').innerHTML = `
    <header class="workspace-head">
      <div class="workspace-meta"><span>${escapeHtml(exercise.exam)}</span><span>${escapeHtml(exercise.taskType)}</span></div>
      <h2>${escapeHtml(exercise.title)}</h2>
    </header>
    <section class="question-block" aria-labelledby="prompt-title">
      <p class="section-label" id="prompt-title">ORIGINAL QUESTION · 題目</p>
      <ol class="prompt-lines">${exercise.prompt.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ol>
      ${imageMarkup(exercise.images)}
    </section>
    <section class="editor-block" aria-labelledby="editor-title">
      <div class="editor-toolbar"><p class="section-label" id="editor-title">MY WRITING · 我的文章</p><div class="editor-stats"><strong data-word-count>${wordCount(draft)}</strong> words</div></div>
      <textarea class="writing-editor" data-editor spellcheck="true" autocomplete="off" placeholder="在這裡開始寫作…">${escapeHtml(draft)}</textarea>
      <div class="save-row"><span class="save-indicator" data-save-indicator>${draft ? '已載入已儲存草稿' : '輸入後自動儲存'}</span><button class="clear-draft" type="button" data-clear-draft ${draft ? '' : 'hidden'}>清除本題草稿</button></div>
    </section>`;
  requestAnimationFrame(() => $('[data-editor]')?.focus({ preventScroll: true }));
}

function showToast(message) {
  const toast = $('[data-save-toast]');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => { toast.hidden = true; }, 1800);
}

function saveActiveDraft() {
  const editor = $('[data-editor]');
  if (!editor || !state.activeId) return;
  const success = writeDraft(state.activeId, editor.value);
  const indicator = $('[data-save-indicator]');
  indicator.textContent = success ? '草稿已儲存於此裝置' : '此瀏覽器未能儲存，請先複製文章';
  indicator.style.color = success ? '' : '#9f3f35';
  $('[data-clear-draft]').hidden = !editor.value.trim();
  renderLibrary();
  updateProgress();
  if (success) showToast('草稿已儲存');
}

function showApp() {
  $('[data-view="login"]').hidden = true;
  $('[data-view="app"]').hidden = false;
  $('[data-account-actions]').hidden = false;
  $('[data-account-name]').textContent = `${state.user.name} · 學生`;
  renderLibrary();
  updateProgress();
  if (!state.activeId && state.exercises.length) {
    state.activeId = state.exercises[0].id;
    renderLibrary();
    renderWorkspace();
  }
}

function showLogin() {
  state.user = null;
  state.activeId = '';
  $('[data-view="login"]').hidden = false;
  $('[data-view="app"]').hidden = true;
  $('[data-account-actions]').hidden = true;
  $('[data-login-status]').textContent = '';
}

function remember(user) {
  state.user = { token: String(user.token), id: String(user.id || ''), name: String(user.name || 'Student'), role: 'student' };
  try { sessionStorage.setItem(sessionKey, JSON.stringify(state.user)); } catch { /* Current session stays in memory. */ }
  try { window.EdmundSystemNav?.rememberStudentSession?.(state.user); } catch { /* Login remains valid in this system. */ }
}

async function validate(token) {
  const rows = await rpc('flashcard_student_session_profile', { p_token: String(token) });
  const profile = Array.isArray(rows) ? rows[0] : null;
  if (!profile?.id) return false;
  remember({ token: profile.session_token || token, id: profile.id, name: profile.name });
  return true;
}

async function login(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $('button[type="submit"]', form);
  const status = $('[data-login-status]');
  const values = new FormData(form);
  const username = String(values.get('username') || '').trim();
  const password = String(values.get('password') || '');
  if (!username || !password) { status.textContent = '請輸入用戶名稱及密碼。'; return; }
  button.disabled = true;
  status.textContent = '正在核對學生帳戶…';
  try {
    const rows = await rpc('flashcard_student_login', { p_name: username, p_password: password });
    const token = Array.isArray(rows) ? rows[0]?.session_token : null;
    if (!token || !await validate(token)) throw new Error('用戶名稱或密碼不正確。');
    form.reset();
    showApp();
  } catch (error) {
    status.textContent = error.message || '登入暫時失敗，請稍後重試。';
  } finally { button.disabled = false; }
}

async function restore() {
  let own = null;
  try { own = JSON.parse(sessionStorage.getItem(sessionKey) || 'null'); } catch { own = null; }
  let universal = null;
  try {
    universal = window.EdmundSystemNav?.getStudentSession?.() || null;
    if (!universal) {
      window.EdmundSystemNav?.bridgeStudentSession?.();
      universal = window.EdmundSystemNav?.getStudentSession?.() || null;
    }
  } catch { universal = null; }
  const candidate = universal?.role === 'student' ? universal : own;
  if (!candidate?.token) { showLogin(); return; }
  try {
    if (await validate(candidate.token)) { showApp(); return; }
  } catch { /* Stale sessions return to the login form. */ }
  showLogin();
}

$('[data-login-form]').addEventListener('submit', login);
$('[data-logout]').addEventListener('click', () => {
  clearTimeout(state.saveTimer);
  saveActiveDraft();
  try { sessionStorage.removeItem(sessionKey); } catch { /* Continue to the login screen. */ }
  try { window.EdmundSystemNav?.forgetStudentSession?.(); } catch { /* The local screen still logs out. */ }
  showLogin();
});
$('[data-search]').addEventListener('input', event => { state.search = event.currentTarget.value; renderLibrary(); });
$('[data-task-list]').addEventListener('click', event => {
  const button = event.target.closest('[data-task-id]');
  if (!button) return;
  clearTimeout(state.saveTimer);
  saveActiveDraft();
  state.activeId = button.dataset.taskId;
  renderLibrary();
  renderWorkspace();
  if (matchMedia('(max-width: 900px)').matches) $('[data-workspace]').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('[data-workspace]').addEventListener('input', event => {
  if (!event.target.matches('[data-editor]')) return;
  $('[data-word-count]').textContent = String(wordCount(event.target.value));
  $('[data-save-indicator]').textContent = '正在儲存…';
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(saveActiveDraft, 500);
});
$('[data-workspace]').addEventListener('click', event => {
  if (!event.target.closest('[data-clear-draft]')) return;
  if (!confirm('確定清除這一道題目的草稿？')) return;
  deleteDraft(state.activeId);
  renderLibrary();
  renderWorkspace();
  updateProgress();
  showToast('草稿已清除');
});
window.addEventListener('pagehide', saveActiveDraft);

restore();
