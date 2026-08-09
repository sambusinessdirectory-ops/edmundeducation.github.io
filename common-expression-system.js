const ROOT = document.documentElement;
const BODY = document.body;
const CONFIG = window.EDMUND_COMMON_EXPRESSION_CONFIG || {};
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const CATALOGUE = window.EDMUND_COMMON_EXPRESSION_DATA || { systems: {} };
const SYSTEM_KEY = String(BODY.dataset.commonExpressionSystem || "").trim();
const SYSTEM = CATALOGUE.systems?.[SYSTEM_KEY];

if (!SYSTEM) throw new Error(`Unknown Common Expression system: ${SYSTEM_KEY || "missing"}`);

const SESSION_KEY = `edmund-common-expression-${SYSTEM_KEY}-session-v1`;
const LOCAL_STATE_KEY = `edmund-common-expression-${SYSTEM_KEY}-local-v1`;
const TABS = Object.freeze([
  ["examples", "例句轉換", "Examples"],
  ["benefits", "學習好處", "Benefits"],
  ["reminders", "重要規則", "Reminders"],
  ["usage", "完整用法", "Usage"],
  ["summary", "總結＋練習", "Practice"]
]);

const state = {
  supabase: null,
  user: null,
  token: "",
  currentView: "login",
  lessonId: "",
  lessonTab: "examples",
  questionIndex: 0,
  states: new Map(),
  dirtyLessonIds: new Set(),
  bookmarks: new Set(),
  lessonClockStartedAt: 0,
  saveQueue: Promise.resolve(),
  toastTimer: 0
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeAnswer(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u2018\u2019\u201B\u2032\uFF07]/g, "'")
    .replace(/[\u201C\u201D\u201F\u2033]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim()
    .toLocaleLowerCase("en");
}

function getLesson(lessonId) {
  return SYSTEM.lessons.find((lesson) => lesson.id === lessonId) || null;
}

function normalizeTimestamp(value) {
  if (!value) return "";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function timestampValue(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function blankLessonState(lessonId) {
  return {
    lessonId,
    answers: {},
    durationMs: 0,
    completedAt: "",
    updatedAt: ""
  };
}

function normalizeLessonState(row) {
  const raw = row?.state && typeof row.state === "object" && !Array.isArray(row.state) ? row.state : {};
  const lessonId = String(row?.lesson_id || raw.lessonId || "");
  const lesson = getLesson(lessonId);
  if (!lesson) return null;
  const answers = {};
  for (const question of lesson.questions) {
    const source = raw.answers?.[question.id];
    if (!source || typeof source !== "object") continue;
    answers[question.id] = {
      answer: String(source.answer || "").slice(0, 6000),
      correct: source.correct === true,
      attempts: Math.max(0, Math.min(100, Number(source.attempts) || 0)),
      updatedAt: normalizeTimestamp(source.updatedAt)
    };
  }
  return {
    lessonId,
    answers,
    durationMs: Math.max(0, Number(row?.duration_ms ?? raw.durationMs) || 0),
    completedAt: normalizeTimestamp(row?.completed_at || raw.completedAt),
    updatedAt: normalizeTimestamp(row?.updated_at || raw.updatedAt)
  };
}

function mergeLessonStates(server, local) {
  if (!server) return local;
  if (!local) return server;
  const answers = { ...server.answers };
  for (const [questionId, localAnswer] of Object.entries(local.answers || {})) {
    const serverAnswer = answers[questionId];
    if (!serverAnswer
      || timestampValue(localAnswer.updatedAt) > timestampValue(serverAnswer.updatedAt)
      || (timestampValue(localAnswer.updatedAt) === timestampValue(serverAnswer.updatedAt)
        && Number(localAnswer.attempts || 0) > Number(serverAnswer.attempts || 0))) {
      answers[questionId] = localAnswer;
    }
  }
  return {
    lessonId: server.lessonId,
    answers,
    durationMs: Math.max(server.durationMs, local.durationMs),
    completedAt: server.completedAt || local.completedAt,
    updatedAt: timestampValue(local.updatedAt) > timestampValue(server.updatedAt)
      ? local.updatedAt
      : server.updatedAt
  };
}

function localRecordNeedsSync(server, local) {
  if (!local) return false;
  if (!server) return true;
  if (local.durationMs > server.durationMs || (local.completedAt && !server.completedAt)) return true;
  return Object.entries(local.answers || {}).some(([questionId, localAnswer]) => {
    const serverAnswer = server.answers?.[questionId];
    return !serverAnswer
      || timestampValue(localAnswer.updatedAt) > timestampValue(serverAnswer.updatedAt)
      || (timestampValue(localAnswer.updatedAt) === timestampValue(serverAnswer.updatedAt)
        && Number(localAnswer.attempts || 0) > Number(serverAnswer.attempts || 0));
  });
}

function lessonState(lessonId) {
  if (!state.states.has(lessonId)) state.states.set(lessonId, blankLessonState(lessonId));
  return state.states.get(lessonId);
}

function completedCount(lessonId) {
  return Object.values(lessonState(lessonId).answers).filter((answer) => answer.correct).length;
}

function totalCompletedQuestions() {
  return SYSTEM.lessons.reduce((sum, lesson) => sum + completedCount(lesson.id), 0);
}

function isLessonComplete(lesson) {
  return lesson.questions.length > 0 && completedCount(lesson.id) === lesson.questions.length;
}

function currentDurationMs(lessonId = state.lessonId) {
  const stored = lessonState(lessonId).durationMs;
  if (!state.lessonClockStartedAt || state.lessonId !== lessonId) return stored;
  return stored + Math.max(0, Math.round(performance.now() - state.lessonClockStartedAt));
}

function formatDuration(durationMs) {
  const seconds = Math.max(0, Math.round(Number(durationMs) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes} 分 ${String(seconds % 60).padStart(2, "0")} 秒`;
}

function pauseClock() {
  if (!state.lessonClockStartedAt || !state.lessonId) return;
  const record = lessonState(state.lessonId);
  const nextDuration = currentDurationMs(state.lessonId);
  if (nextDuration > record.durationMs) {
    record.durationMs = nextDuration;
    record.updatedAt = new Date().toISOString();
    markLessonDirty(state.lessonId);
  }
  state.lessonClockStartedAt = 0;
}

function startClock() {
  if (state.lessonId && !state.lessonClockStartedAt) state.lessonClockStartedAt = performance.now();
}

function renderAppShell() {
  document.title = `Common Expression 常用語 · ${SYSTEM.titleZh} ${SYSTEM.titleEn}｜EdmundEducation`;
  const description = `${SYSTEM.descriptionZh} ${SYSTEM.descriptionEn}`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);

  document.querySelector("[data-system-title-small]").textContent = `${SYSTEM.titleEn} System`;
  document.querySelector("[data-edmund-system-switcher]").dataset.system = SYSTEM.navId;

  const app = document.querySelector("[data-common-expression-app]");
  app.innerHTML = `
    <section class="view" data-view="login">
      <div class="login-layout">
        <article class="login-hero glass-panel">
          <div class="hero-copy">
            <p class="eyebrow">${escapeHtml(SYSTEM.eyebrow)}</p>
            <p class="student-label">(學生使用)</p>
            <h1>Common Expression<br><span>常用語</span><br>${escapeHtml(SYSTEM.titleZh)} <span>${escapeHtml(SYSTEM.titleEn)}</span></h1>
            <p>${escapeHtml(SYSTEM.descriptionZh)}<br>${escapeHtml(SYSTEM.descriptionEn)}</p>
          </div>
        </article>
        <section class="login-panel glass-panel" aria-labelledby="common-expression-login-title">
          <div class="login-heading">
            <span class="section-number">01</span>
            <div>
              <p class="eyebrow">STUDENT LOGIN</p>
              <h2 id="common-expression-login-title">登入學習系統</h2>
              <p>使用 Flashcard、寫作練習、Speaking、功課系統或教材下載區的同一個學生帳戶登入。</p>
            </div>
          </div>
          <form class="login-form" data-login-form novalidate>
            <label class="field"><span>用戶名稱</span><input name="username" type="text" autocomplete="username" maxlength="100" required placeholder="輸入用戶名稱"></label>
            <label class="field"><span>密碼</span><span class="password-field"><input name="password" type="password" autocomplete="current-password" maxlength="200" required placeholder="輸入密碼"><button type="button" data-password-toggle aria-pressed="false">顯示</button></span></label>
            <p class="form-status" data-login-status role="status" aria-live="polite"></p>
            <button class="primary-button login-button" type="submit" data-login-button>登入並開始學習</button>
          </form>
          <p class="account-note">學生帳戶由 EdmundEducation 統一管理；本頁不會建立另一組密碼。</p>
        </section>
      </div>
    </section>

    <section class="view" data-view="dashboard" hidden>
      <section class="dashboard-hero glass-panel">
        <div>
          <p class="eyebrow">${escapeHtml(SYSTEM.eyebrow)}</p>
          <h1>Common Expression 常用語<br>${escapeHtml(SYSTEM.titleZh)} ${escapeHtml(SYSTEM.titleEn)}</h1>
          <p data-dashboard-welcome></p>
        </div>
        <div class="dashboard-metrics">
          <article class="metric-card"><strong data-lesson-count>0</strong><span>已開放課題</span></article>
          <article class="metric-card"><strong data-question-total>0</strong><span>已完成題目</span></article>
          <article class="metric-card"><strong data-time-total>0 分 00 秒</strong><span>累計練習時間</span></article>
        </div>
      </section>
      <section class="dashboard-toolbar glass-panel">
        <p>每個課題包括雙語概念、完整用法、重要規則及改寫練習；記錄會跟隨您的共用學生帳戶。</p>
        <button class="secondary-button" type="button" data-open-bookmarks>☆ 我的書簽</button>
      </section>
      <div class="lesson-grid" data-lesson-grid></div>
    </section>

    <section class="view" data-view="lesson" hidden>
      <div class="lesson-shell">
        <section class="lesson-heading glass-panel">
          <div class="lesson-heading-top">
            <div><p class="eyebrow" data-lesson-kicker></p><h1 data-lesson-title></h1><p data-lesson-summary></p><div class="lesson-meta" data-lesson-meta></div></div>
            <div class="lesson-card-actions"><button class="star-button" type="button" data-current-lesson-bookmark aria-label="收藏課題">☆</button><button class="secondary-button" type="button" data-back-dashboard>返回學習首頁</button></div>
          </div>
        </section>
        <nav class="lesson-tabs glass-panel" data-lesson-tabs aria-label="課題內容"></nav>
        <section class="lesson-content glass-panel" data-lesson-content></section>
      </div>
    </section>

    <section class="view" data-view="exercise" hidden>
      <div class="exercise-shell">
        <section class="exercise-heading glass-panel">
          <div class="exercise-heading-top"><div><p class="eyebrow">COMMON EXPRESSION PRACTICE</p><h1 data-exercise-title></h1><p data-exercise-instruction></p></div><button class="secondary-button" type="button" data-back-lesson>返回課題內容</button></div>
          <div class="exercise-progress"><div class="progress-track"><i data-exercise-progress-bar></i></div><strong data-exercise-progress-label></strong></div>
        </section>
        <section class="question-card glass-panel" data-question-card></section>
      </div>
    </section>

    <section class="view" data-view="bookmarks" hidden>
      <section class="bookmark-panel glass-panel">
        <div class="lesson-heading-top"><div><p class="eyebrow">SAVED LESSONS</p><h1>我的書簽</h1><p>收藏的 Common Expression 課題會跟隨您的帳戶同步。</p></div><button class="secondary-button" type="button" data-bookmarks-back>返回學習首頁</button></div>
        <div class="bookmark-list" data-bookmark-list></div>
      </section>
    </section>`;
}

renderAppShell();

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  connection: document.querySelector("[data-connection-status]"),
  userPill: document.querySelector("[data-user-pill]"),
  dashboardButton: document.querySelector("[data-dashboard-button]"),
  logoutButton: document.querySelector("[data-logout]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginStatus: document.querySelector("[data-login-status]"),
  loginButton: document.querySelector("[data-login-button]"),
  passwordToggle: document.querySelector("[data-password-toggle]"),
  dashboardWelcome: document.querySelector("[data-dashboard-welcome]"),
  lessonCount: document.querySelector("[data-lesson-count]"),
  questionTotal: document.querySelector("[data-question-total]"),
  timeTotal: document.querySelector("[data-time-total]"),
  lessonGrid: document.querySelector("[data-lesson-grid]"),
  lessonKicker: document.querySelector("[data-lesson-kicker]"),
  lessonTitle: document.querySelector("[data-lesson-title]"),
  lessonSummary: document.querySelector("[data-lesson-summary]"),
  lessonMeta: document.querySelector("[data-lesson-meta]"),
  lessonTabs: document.querySelector("[data-lesson-tabs]"),
  lessonContent: document.querySelector("[data-lesson-content]"),
  currentBookmark: document.querySelector("[data-current-lesson-bookmark]"),
  exerciseTitle: document.querySelector("[data-exercise-title]"),
  exerciseInstruction: document.querySelector("[data-exercise-instruction]"),
  exerciseProgressBar: document.querySelector("[data-exercise-progress-bar]"),
  exerciseProgressLabel: document.querySelector("[data-exercise-progress-label]"),
  questionCard: document.querySelector("[data-question-card]"),
  bookmarkList: document.querySelector("[data-bookmark-list]"),
  toast: document.querySelector("[data-toast]")
};

function setConnection(label, status) {
  elements.connection.textContent = label;
  elements.connection.dataset.state = status;
}

function setFormStatus(message = "", status = "") {
  elements.loginStatus.textContent = message;
  elements.loginStatus.dataset.state = status;
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 3200);
}

function showView(viewName, { scroll = true } = {}) {
  if (state.currentView === "exercise" && viewName !== "exercise") pauseClock();
  state.currentView = viewName;
  for (const view of elements.views) view.hidden = view.dataset.view !== viewName;
  const loggedIn = Boolean(state.user && state.token);
  elements.userPill.hidden = !loggedIn;
  elements.dashboardButton.hidden = !loggedIn || viewName === "dashboard";
  elements.logoutButton.hidden = !loggedIn;
  if (loggedIn) elements.userPill.textContent = state.user.name;
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

function initialiseSupabaseClient() {
  if (state.supabase) return state.supabase;
  if (!window.supabase?.createClient || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) throw new Error("登入服務暫時未能載入，請重新整理頁面。");
  let storage;
  try { storage = window.sessionStorage; } catch { storage = undefined; }
  state.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: { persistSession: Boolean(storage), ...(storage ? { storage } : {}), autoRefreshToken: true, detectSessionInUrl: false }
  });
  return state.supabase;
}

async function ensureSupabaseSession() {
  const client = initialiseSupabaseClient();
  const current = await client.auth.getSession();
  if (current.error) throw current.error;
  if (current.data?.session?.user?.id) return client;
  const signIn = await client.auth.signInAnonymously();
  if (signIn.error) throw signIn.error;
  if (!signIn.data?.session?.user?.id) throw new Error("未能建立安全登入連線。");
  return client;
}

async function rpc(name, args) {
  const client = await ensureSupabaseSession();
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data;
}

function saveSession() {
  try {
    if (!state.user || !state.token) sessionStorage.removeItem(SESSION_KEY);
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...state.user, token: state.token, role: "student" }));
  } catch { /* Storage is a convenience, not the authority. */ }
}

function readSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

function clearSession() {
  pauseClock();
  state.user = null;
  state.token = "";
  state.lessonId = "";
  state.states.clear();
  state.dirtyLessonIds.clear();
  state.bookmarks.clear();
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Ignore unavailable storage. */ }
}

function localSnapshotKey() {
  return `${LOCAL_STATE_KEY}:${state.user?.id || state.user?.name || "unknown"}`;
}

function writeLocalSnapshot() {
  if (!state.user) return;
  try {
    localStorage.setItem(localSnapshotKey(), JSON.stringify({
      states: [...state.states.values()],
      dirtyLessonIds: [...state.dirtyLessonIds],
      bookmarks: [...state.bookmarks],
      savedAt: new Date().toISOString()
    }));
  } catch { /* Server persistence remains authoritative. */ }
}

function readLocalSnapshot() {
  if (!state.user) return null;
  try { return JSON.parse(localStorage.getItem(localSnapshotKey()) || "null"); } catch { return null; }
}

function markLessonDirty(lessonId) {
  if (getLesson(lessonId)) state.dirtyLessonIds.add(lessonId);
}

function clearLessonDirty(lessonId, expectedUpdatedAt) {
  const current = state.states.get(lessonId);
  if (!current || current.updatedAt === expectedUpdatedAt) state.dirtyLessonIds.delete(lessonId);
}

function applySnapshot(payload) {
  state.states.clear();
  state.dirtyLessonIds.clear();
  state.bookmarks.clear();
  for (const row of Array.isArray(payload?.states) ? payload.states : []) {
    const normalized = normalizeLessonState(row);
    if (normalized) state.states.set(normalized.lessonId, normalized);
  }
  for (const lessonId of Array.isArray(payload?.bookmarks) ? payload.bookmarks : []) {
    if (getLesson(String(lessonId))) state.bookmarks.add(String(lessonId));
  }
  const local = readLocalSnapshot();
  const recoveredDirtyIds = new Set(Array.isArray(local?.dirtyLessonIds) ? local.dirtyLessonIds : []);
  for (const row of Array.isArray(local?.states) ? local.states : []) {
    const normalized = normalizeLessonState({ lesson_id: row.lessonId, state: row, duration_ms: row.durationMs });
    const server = normalized && state.states.get(normalized.lessonId);
    if (!normalized) continue;
    if (recoveredDirtyIds.has(normalized.lessonId) || localRecordNeedsSync(server, normalized)) {
      state.dirtyLessonIds.add(normalized.lessonId);
    }
    state.states.set(normalized.lessonId, mergeLessonStates(server, normalized));
  }
  if (state.dirtyLessonIds.size) retryDirtyLessonStates().catch((error) => console.warn("Common Expression recovery sync failed", error));
}

async function loadSnapshot(token = state.token) {
  const payload = await rpc(String(CONFIG.snapshotRpc), { p_token: token, p_system_key: SYSTEM_KEY });
  if (!payload?.student?.id || !payload?.student?.name) throw new Error("登入時段已失效，請重新登入。");
  state.user = { id: String(payload.student.id), name: String(payload.student.name), role: "student" };
  state.token = String(token);
  applySnapshot(payload);
  saveSession();
  writeLocalSnapshot();
  return payload;
}

async function studentLogin(username, password) {
  const data = await rpc(String(CONFIG.studentLoginRpc || "flashcard_student_login"), { p_name: username, p_password: password });
  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.session_token) return false;
  state.token = String(row.session_token);
  state.user = { id: String(row.id || ""), name: String(row.name || username), role: "student" };
  window.EdmundSystemNav?.rememberStudentSession({ token: state.token, id: state.user.id, name: state.user.name, role: "student" });
  await loadSnapshot(state.token);
  return true;
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(elements.loginForm);
  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");
  if (!username || !password) return setFormStatus("請輸入用戶名稱及密碼。", "error");
  elements.loginButton.disabled = true;
  setFormStatus("正在核對共用學生帳戶…");
  try {
    if (!await studentLogin(username, password)) throw new Error("用戶名稱或密碼不正確。");
    elements.loginForm.reset();
    setFormStatus("");
    setConnection("Supabase 已連接", "online");
    if (!openRequestedLesson()) openDashboard();
    showToast(`您好，${state.user.name}！`);
  } catch (error) {
    console.warn("Common Expression login failed", error);
    setFormStatus(error.message || "登入失敗，請稍後再試。", "error");
    setConnection("連線失敗", "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function restoreSession() {
  const universal = window.EdmundSystemNav?.getStudentSession?.();
  const stored = readSession();
  const candidate = universal?.role === "student" ? universal : stored?.role === "student" ? stored : null;
  if (!candidate?.token) return false;
  try {
    await loadSnapshot(String(candidate.token));
    window.EdmundSystemNav?.rememberStudentSession({ token: state.token, id: state.user.id, name: state.user.name, role: "student" });
    setConnection("Supabase 已連接", "online");
    if (!openRequestedLesson()) openDashboard();
    return true;
  } catch (error) {
    console.warn("Common Expression session restore failed", error);
    clearSession();
    return false;
  }
}

async function logout() {
  try { await flushCurrentState(); } catch { /* Local snapshot already contains the newest answer. */ }
  window.EdmundSystemNav?.forgetStudentSession();
  clearSession();
  try { await state.supabase?.auth.signOut(); } catch { /* Anonymous Auth cleanup is best-effort. */ }
  setConnection("可以登入", "online");
  showView("login");
}

function renderDashboard() {
  const questionCount = totalCompletedQuestions();
  const duration = SYSTEM.lessons.reduce((sum, lesson) => sum + currentDurationMs(lesson.id), 0);
  elements.dashboardWelcome.textContent = `${state.user.name}，請選擇一個課題開始學習。`;
  elements.lessonCount.textContent = String(SYSTEM.lessons.length);
  elements.questionTotal.textContent = String(questionCount);
  elements.timeTotal.textContent = formatDuration(duration);
  if (!SYSTEM.lessons.length) {
    elements.lessonGrid.innerHTML = `<article class="empty-library"><div class="empty-library-inner"><span class="empty-library-mark" aria-hidden="true">✦</span><p class="eyebrow">REVIEWED CONTENT LIBRARY</p><h2>${escapeHtml(SYSTEM.titleZh)}課題庫骨架已完成</h2><p>目前尚未加入課題。新教材完成內容整理及審核後，會使用同一個學習、書簽及 Supabase 進度架構在此顯示。</p></div></article>`;
    return;
  }
  elements.lessonGrid.innerHTML = SYSTEM.lessons.map((lesson) => {
    const completed = completedCount(lesson.id);
    const percent = Math.round((completed / lesson.questions.length) * 100);
    const bookmarked = state.bookmarks.has(lesson.id);
    const complete = isLessonComplete(lesson);
    return `<article class="lesson-card${complete ? " is-complete" : ""}" data-lesson-id="${escapeHtml(lesson.id)}">
      <span class="lesson-card-number">COMMON EXPRESSION ${String(lesson.order).padStart(2, "0")}</span>
      <h2>${escapeHtml(lesson.titleEn)}</h2><h3>${escapeHtml(lesson.titleZh)}</h3>
      <p>${escapeHtml(lesson.summaryZh)}</p>
      <div class="lesson-card-footer"><div class="progress-track" title="${completed} / ${lesson.questions.length}"><i style="--progress:${percent}%"></i></div><strong>${complete ? "已完成" : `${completed}/${lesson.questions.length}`}</strong><div class="lesson-card-actions"><button class="star-button" type="button" data-toggle-bookmark="${escapeHtml(lesson.id)}" aria-pressed="${bookmarked}" aria-label="${bookmarked ? "移除課題書簽" : "收藏課題"}">${bookmarked ? "★" : "☆"}</button><button class="round-button" type="button" data-open-lesson="${escapeHtml(lesson.id)}" aria-label="開啟 ${escapeHtml(lesson.titleEn)}">→</button></div></div>
    </article>`;
  }).join("");
}

function openDashboard() {
  pauseClock();
  renderDashboard();
  const url = new URL(location.href);
  url.searchParams.delete("lesson");
  history.replaceState(null, "", url);
  showView("dashboard");
}

function openRequestedLesson() {
  const lessonId = new URLSearchParams(location.search).get("lesson");
  if (!lessonId || !getLesson(lessonId)) return false;
  openLesson(lessonId);
  return true;
}

function renderLessonHeader(lesson) {
  elements.lessonKicker.textContent = `COMMON EXPRESSION ${String(lesson.order).padStart(2, "0")} · ${lesson.lessonTypeEn}`;
  elements.lessonTitle.textContent = `${lesson.titleEn} · ${lesson.titleZh}`;
  elements.lessonSummary.textContent = lesson.summaryZh;
  elements.lessonMeta.innerHTML = `<span class="tag">${escapeHtml(lesson.level)}</span><span class="tag">${escapeHtml(lesson.lessonTypeZh)}</span><span class="tag">${lesson.questions.length} 題練習</span><span class="tag">來源 ${lesson.source.pageCount} 頁</span>`;
  const bookmarked = state.bookmarks.has(lesson.id);
  elements.currentBookmark.textContent = bookmarked ? "★" : "☆";
  elements.currentBookmark.setAttribute("aria-pressed", String(bookmarked));
  elements.currentBookmark.dataset.lessonId = lesson.id;
}

function renderTabs() {
  elements.lessonTabs.innerHTML = TABS.map(([id, zh, en]) => `<button type="button" role="tab" data-lesson-tab="${id}" aria-selected="${state.lessonTab === id}">${zh}<small>${en}</small></button>`).join("");
}

function renderExamples(lesson) {
  return `<div class="content-intro"><article class="content-card"><p class="eyebrow">MEANING · 意思</p><h3>${escapeHtml(lesson.titleZh)}</h3><p>${escapeHtml(lesson.summaryZh)}</p></article><article class="content-card"><p class="eyebrow">CORE EXPRESSION</p><h3>${escapeHtml(lesson.titleEn)}</h3><p>${escapeHtml(lesson.summaryEn)}</p></article></div><div style="margin-top:18px">${lesson.examples.map((example) => `<div class="example-transform"><div class="example-side"><strong>Original · 原句</strong>${escapeHtml(example.originalEn)}<br><small>${escapeHtml(example.originalZh)}</small></div><span class="example-arrow" aria-hidden="true">→</span><div class="example-side"><strong>Target · 目標句</strong>${escapeHtml(example.targetEn)}<br><small>${escapeHtml(example.targetZh)}</small></div></div>`).join("")}</div>`;
}

function renderBilingualList(rows, label) {
  return `<p class="eyebrow">${escapeHtml(label)}</p><ul class="bilingual-list">${rows.map(([zh, en], index) => `<li><strong>${index + 1}. ${escapeHtml(zh)}</strong><span>${escapeHtml(en)}</span></li>`).join("")}</ul>`;
}

function renderLessonContent() {
  const lesson = getLesson(state.lessonId);
  if (!lesson) return;
  const content = {
    examples: () => renderExamples(lesson),
    benefits: () => renderBilingualList(lesson.benefits, "BENEFITS · 學習好處"),
    reminders: () => renderBilingualList(lesson.reminders, "IMPORTANT REMINDERS · 重要規則"),
    usage: () => `<p class="eyebrow">FULL PRACTICAL USAGE LIST · 完整實用用法</p><div class="usage-list">${lesson.usageGroups.map(([title, example, explanation]) => `<article class="usage-card"><div><h3>${escapeHtml(title)}</h3><p class="usage-example">${escapeHtml(example)}</p><p>${escapeHtml(explanation)}</p></div></article>`).join("")}</div>`,
    summary: () => `<p class="eyebrow">BEST TEACHING SUMMARY · 教學總結</p><ul class="summary-list">${lesson.summaryPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul><div class="exercise-invite" style="margin-top:24px"><div><strong>${completedCount(lesson.id)} / ${lesson.questions.length} 題已完成</strong><p>${escapeHtml(lesson.exerciseInstructionZh)}</p></div><button class="primary-button" type="button" data-start-exercise>${completedCount(lesson.id) ? "繼續練習" : "開始練習"} →</button></div>`
  };
  elements.lessonContent.innerHTML = (content[state.lessonTab] || content.examples)();
}

function openLesson(lessonId, tab = state.lessonTab || "examples") {
  const lesson = getLesson(lessonId);
  if (!lesson) return;
  pauseClock();
  state.lessonId = lesson.id;
  state.lessonTab = TABS.some(([id]) => id === tab) ? tab : "examples";
  renderLessonHeader(lesson);
  renderTabs();
  renderLessonContent();
  const url = new URL(location.href);
  url.searchParams.set("lesson", lesson.id);
  history.replaceState(null, "", url);
  showView("lesson");
}

function firstIncompleteIndex(lesson) {
  const answers = lessonState(lesson.id).answers;
  const index = lesson.questions.findIndex((question) => answers[question.id]?.correct !== true);
  return index < 0 ? 0 : index;
}

function openExercise(index = null) {
  const lesson = getLesson(state.lessonId);
  if (!lesson) return;
  state.questionIndex = Math.max(0, Math.min(lesson.questions.length - 1, index ?? firstIncompleteIndex(lesson)));
  elements.exerciseTitle.textContent = `${lesson.titleEn} · 句子練習`;
  elements.exerciseInstruction.textContent = lesson.exerciseInstructionZh;
  renderQuestion();
  showView("exercise");
  startClock();
}

function renderQuestion() {
  const lesson = getLesson(state.lessonId);
  const question = lesson?.questions[state.questionIndex];
  if (!lesson || !question) return;
  const saved = lessonState(lesson.id).answers[question.id] || {};
  const complete = completedCount(lesson.id);
  const percent = Math.round((complete / lesson.questions.length) * 100);
  elements.exerciseProgressBar.style.setProperty("--progress", `${percent}%`);
  elements.exerciseProgressLabel.textContent = `${complete} / ${lesson.questions.length} 已完成`;
  elements.questionCard.innerHTML = `<div class="question-meta"><span class="question-number">QUESTION ${String(state.questionIndex + 1).padStart(2, "0")} / ${lesson.questions.length}</span><button class="star-button" type="button" data-question-lesson-bookmark aria-pressed="${state.bookmarks.has(lesson.id)}" aria-label="收藏本課題">${state.bookmarks.has(lesson.id) ? "★" : "☆"}</button></div><p class="prompt-en">${escapeHtml(question.promptEn)}</p><p class="prompt-zh">${escapeHtml(question.promptZh)}</p><label class="field"><span>您的改寫答案</span><textarea class="answer-field" data-answer-field spellcheck="true" autocomplete="off" placeholder="輸入完整的改寫句子或對話…">${escapeHtml(saved.answer || "")}</textarea></label><div class="question-actions"><button class="secondary-button" type="button" data-prev-question ${state.questionIndex === 0 ? "disabled" : ""}>← 上一題</button><div class="question-actions-right"><button class="text-button" type="button" data-clear-answer>清除答案</button><button class="primary-button" type="button" data-check-answer>檢查答案</button><button class="secondary-button" type="button" data-next-question>${state.questionIndex === lesson.questions.length - 1 ? "返回課題" : "下一題 →"}</button></div></div><div class="feedback-panel" data-feedback hidden></div>`;
  if (saved.attempts) renderFeedback(saved.correct, question, saved.answer);
}

function renderFeedback(correct, question, answer) {
  const panel = elements.questionCard.querySelector("[data-feedback]");
  if (!panel) return;
  panel.hidden = false;
  panel.dataset.state = correct ? "correct" : "incorrect";
  panel.innerHTML = correct
    ? `<h3>✓ 答案正確</h3><p>您已保留原句意思，並自然使用本課目標表達。</p>`
    : `<h3>請再留意目標句式</h3><p>您的答案：${escapeHtml(answer || "（未輸入）")}</p><p class="answer-key">參考答案：${escapeHtml(question.answerEn)}</p><p>${escapeHtml(question.answerZh)}</p>`;
}

async function checkAnswer() {
  const lesson = getLesson(state.lessonId);
  const question = lesson?.questions[state.questionIndex];
  const field = elements.questionCard.querySelector("[data-answer-field]");
  if (!lesson || !question || !field) return;
  const answer = String(field.value || "").trim();
  if (!answer) return showToast("請先輸入答案。");
  const correct = question.acceptedAnswers.some((expected) => normalizeAnswer(expected) === normalizeAnswer(answer));
  const record = lessonState(lesson.id);
  const existing = record.answers[question.id] || {};
  record.answers[question.id] = { answer, correct, attempts: Math.min(100, Number(existing.attempts || 0) + 1), updatedAt: new Date().toISOString() };
  record.updatedAt = new Date().toISOString();
  if (isLessonComplete(lesson) && !record.completedAt) record.completedAt = new Date().toISOString();
  markLessonDirty(lesson.id);
  writeLocalSnapshot();
  renderFeedback(correct, question, answer);
  elements.exerciseProgressLabel.textContent = `${completedCount(lesson.id)} / ${lesson.questions.length} 已完成`;
  elements.exerciseProgressBar.style.setProperty("--progress", `${Math.round((completedCount(lesson.id) / lesson.questions.length) * 100)}%`);
  try {
    await persistLessonState(lesson.id);
    showToast(correct ? "答案正確，進度已儲存。" : "已儲存這次嘗試；請參考答案再練習。");
  } catch (error) {
    console.warn("Common Expression state save failed", error);
    showToast("答案已保留在此裝置；雲端同步稍後重試。");
  }
}

function persistLessonState(lessonId) {
  const record = lessonState(lessonId);
  const clockIsRunning = state.lessonId === lessonId && Boolean(state.lessonClockStartedAt);
  if (clockIsRunning) {
    record.durationMs = currentDurationMs(lessonId);
    state.lessonClockStartedAt = performance.now();
  }
  markLessonDirty(lessonId);
  writeLocalSnapshot();
  const snapshot = JSON.parse(JSON.stringify(record));
  const expectedUpdatedAt = snapshot.updatedAt;
  const write = () => rpc(String(CONFIG.saveStateRpc), {
    p_token: state.token,
    p_system_key: SYSTEM_KEY,
    p_lesson_id: lessonId,
    p_state: snapshot,
    p_duration_ms: Math.max(0, Math.round(snapshot.durationMs || 0))
  });
  const pending = state.saveQueue.then(write, write);
  state.saveQueue = pending.catch(() => undefined);
  return pending.then((payload) => {
    const normalized = normalizeLessonState(payload?.state_row || payload);
    clearLessonDirty(lessonId, expectedUpdatedAt);
    if (normalized) {
      const current = state.states.get(lessonId);
      state.states.set(lessonId, mergeLessonStates(normalized, current));
    }
    setConnection(state.dirtyLessonIds.size ? "等待同步" : "Supabase 已連接", state.dirtyLessonIds.size ? "checking" : "online");
    writeLocalSnapshot();
    return payload;
  }, (error) => {
    setConnection("等待同步", "checking");
    writeLocalSnapshot();
    throw error;
  });
}

async function retryDirtyLessonStates() {
  if (!state.user || !state.token || !state.dirtyLessonIds.size) return;
  const lessonIds = [...state.dirtyLessonIds].filter((lessonId) => getLesson(lessonId));
  if (!lessonIds.length) return;
  setConnection("正在同步", "checking");
  const results = await Promise.allSettled(lessonIds.map((lessonId) => persistLessonState(lessonId)));
  const failed = results.find((result) => result.status === "rejected");
  if (failed) throw failed.reason;
}

async function flushCurrentState() {
  pauseClock();
  if (!state.lessonId || !state.user || !state.token) return;
  return persistLessonState(state.lessonId);
}

async function toggleBookmark(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson) return;
  const shouldBookmark = !state.bookmarks.has(lessonId);
  if (shouldBookmark) state.bookmarks.add(lessonId); else state.bookmarks.delete(lessonId);
  writeLocalSnapshot();
  if (state.currentView === "dashboard") renderDashboard();
  else if (state.currentView === "lesson") renderLessonHeader(lesson);
  else if (state.currentView === "exercise") renderQuestion();
  try {
    const payload = await rpc(String(CONFIG.setBookmarkRpc), { p_token: state.token, p_system_key: SYSTEM_KEY, p_lesson_id: lessonId, p_bookmarked: shouldBookmark });
    if (payload?.bookmarked === true) state.bookmarks.add(lessonId);
    if (payload?.bookmarked === false) state.bookmarks.delete(lessonId);
    writeLocalSnapshot();
    showToast(shouldBookmark ? "已加入課題書簽。" : "已移除課題書簽。");
  } catch (error) {
    console.warn("Common Expression bookmark sync failed", error);
    if (shouldBookmark) state.bookmarks.delete(lessonId); else state.bookmarks.add(lessonId);
    writeLocalSnapshot();
    if (state.currentView === "dashboard") renderDashboard();
    showToast("未能同步書簽，請稍後再試。");
  }
}

function renderBookmarks() {
  const rows = SYSTEM.lessons.filter((lesson) => state.bookmarks.has(lesson.id));
  elements.bookmarkList.innerHTML = rows.length ? rows.map((lesson) => `<article class="bookmark-row"><div><h3>${escapeHtml(lesson.titleEn)}</h3><p>${escapeHtml(lesson.titleZh)} · ${completedCount(lesson.id)}/${lesson.questions.length} 題完成</p></div><div class="lesson-card-actions"><button class="secondary-button" type="button" data-open-lesson="${escapeHtml(lesson.id)}">開啟</button><button class="danger-button" type="button" data-toggle-bookmark="${escapeHtml(lesson.id)}">移除</button></div></article>`).join("") : `<div class="empty-library-inner"><span class="empty-library-mark" aria-hidden="true">☆</span><h2>尚未收藏課題</h2><p>在課題卡或課題頁按星號即可加入書簽。</p></div>`;
}

function openBookmarks() {
  renderBookmarks();
  showView("bookmarks");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.matches("[data-password-toggle]")) {
    const input = elements.loginForm.elements.password;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    target.textContent = show ? "隱藏" : "顯示";
    target.setAttribute("aria-pressed", String(show));
  } else if (target.matches("[data-dashboard-button], [data-back-dashboard], [data-bookmarks-back]")) {
    retryDirtyLessonStates().catch((error) => console.warn("Common Expression navigation sync failed", error));
    openDashboard();
  } else if (target.matches("[data-logout]")) {
    logout();
  } else if (target.matches("[data-open-bookmarks]")) {
    openBookmarks();
  } else if (target.dataset.openLesson) {
    openLesson(target.dataset.openLesson);
  } else if (target.dataset.toggleBookmark) {
    toggleBookmark(target.dataset.toggleBookmark);
  } else if (target.matches("[data-current-lesson-bookmark], [data-question-lesson-bookmark]")) {
    toggleBookmark(state.lessonId);
  } else if (target.dataset.lessonTab) {
    state.lessonTab = target.dataset.lessonTab;
    renderTabs();
    renderLessonContent();
  } else if (target.matches("[data-start-exercise]")) {
    openExercise();
  } else if (target.matches("[data-back-lesson]")) {
    flushCurrentState().catch(() => undefined);
    openLesson(state.lessonId, "summary");
  } else if (target.matches("[data-check-answer]")) {
    checkAnswer();
  } else if (target.matches("[data-clear-answer]")) {
    const field = elements.questionCard.querySelector("[data-answer-field]");
    if (field) { field.value = ""; field.focus(); }
  } else if (target.matches("[data-prev-question]")) {
    state.questionIndex = Math.max(0, state.questionIndex - 1);
    renderQuestion();
  } else if (target.matches("[data-next-question]")) {
    const lesson = getLesson(state.lessonId);
    if (state.questionIndex >= lesson.questions.length - 1) openLesson(state.lessonId, "summary");
    else { state.questionIndex += 1; renderQuestion(); }
  }
});

elements.loginForm.addEventListener("submit", handleLogin);
window.addEventListener("pagehide", () => {
  pauseClock();
  writeLocalSnapshot();
  retryDirtyLessonStates().catch(() => undefined);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseClock();
    writeLocalSnapshot();
    retryDirtyLessonStates().catch(() => undefined);
  } else {
    retryDirtyLessonStates().catch(() => undefined);
    if (state.currentView === "exercise") startClock();
  }
});

async function initialise() {
  setConnection("正在連接", "checking");
  try {
    await ensureSupabaseSession();
    setConnection("可以登入", "online");
  } catch (error) {
    console.warn("Common Expression Supabase initialization failed", error);
    setConnection("連線失敗", "error");
  }
  if (!await restoreSession()) showView("login", { scroll: false });
}

initialise();
