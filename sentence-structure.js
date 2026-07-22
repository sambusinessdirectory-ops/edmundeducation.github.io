const CONFIG = window.EDMUND_SENTENCE_STRUCTURE_CONFIG || {};
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const CONTENT = window.EDMUND_SENTENCE_STRUCTURE_DATA || { version: "missing", lessons: [] };

const SESSION_KEY = "edmund-sentence-structure-session-v1";
const MAX_BOOKMARKS = 200;
const LESSON_PAGES = 4;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  connection: document.querySelector("[data-connection-status]"),
  userPill: document.querySelector("[data-user-pill]"),
  dashboardButton: document.querySelector("[data-dashboard-button]"),
  adminStudentsButton: document.querySelector("[data-admin-students-button]"),
  logout: document.querySelector("[data-logout]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginButton: document.querySelector("[data-login-button]"),
  loginStatus: document.querySelector("[data-login-status]"),
  username: document.querySelector("#sentence-structure-username"),
  password: document.querySelector("#sentence-structure-password"),
  passwordToggle: document.querySelector("[data-password-toggle]"),
  dashboardWelcome: document.querySelector("[data-dashboard-welcome]"),
  lessonChoiceGrid: document.querySelector("[data-lesson-choice-grid]"),
  historyList: document.querySelector("[data-history-list]"),
  lessonRound: document.querySelector("[data-lesson-round]"),
  lessonKicker: document.querySelector("[data-lesson-kicker]"),
  lessonTitle: document.querySelector("[data-lesson-title]"),
  lessonStepper: document.querySelector("[data-lesson-stepper]"),
  lessonContent: document.querySelector("[data-lesson-content]"),
  bookmarkList: document.querySelector("[data-bookmark-list]"),
  adminSearch: document.querySelector("[data-admin-search]"),
  adminStudentCount: document.querySelector("[data-admin-student-count]"),
  adminStudentList: document.querySelector("[data-admin-student-list]"),
  adminDetail: document.querySelector("[data-admin-detail]"),
  loadingTemplate: document.querySelector("#sentence-structure-loading-template"),
  toast: document.querySelector("[data-toast]")
};

const state = {
  supabase: null,
  user: null,
  authToken: "",
  currentView: "login",
  lessonId: "",
  lessonPage: 1,
  exercise: null,
  exerciseClockStartedAt: 0,
  bookmarks: [],
  attempts: [],
  dashboardLoaded: false,
  saveInFlight: false,
  toastTimer: null,
  adminStudents: [],
  selectedAdminStudentId: ""
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseJsonObject(value, fallback = {}) {
  if (isPlainObject(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isPlainObject(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function lessonList() {
  return Array.isArray(CONTENT.lessons) ? CONTENT.lessons : [];
}

function getLesson(lessonId = state.lessonId) {
  return lessonList().find((lesson) => String(lesson.id) === String(lessonId)) || null;
}

function getQuestion(lessonId, questionId) {
  const lesson = getLesson(lessonId);
  return lesson?.questions?.find((question) => String(question.id) === String(questionId)) || null;
}

function lessonTitle(lesson) {
  return String(lesson?.title || lesson?.titleZh || lesson?.name || "句子結構");
}

function lessonEnglishTitle(lesson) {
  return String(lesson?.titleEn || lesson?.englishTitle || "Sentence Structure");
}

function setConnection(text, status = "checking") {
  if (!elements.connection) return;
  elements.connection.textContent = text;
  elements.connection.dataset.state = status;
}

function setStatus(element, text = "", status = "") {
  if (!element) return;
  element.textContent = text;
  if (status) element.dataset.state = status;
  else delete element.dataset.state;
}

function showToast(message, status = "success") {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = String(message || "");
  elements.toast.dataset.state = status;
  elements.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 3300);
}

function loadingHtml() {
  return elements.loadingTemplate?.innerHTML || '<div class="loading-state"><p>正在載入…</p></div>';
}

function pauseExerciseClock() {
  if (!state.exerciseClockStartedAt || !state.exercise) return;
  state.exercise.durationMs = Math.max(
    0,
    Math.round(Number(state.exercise.durationMs || 0) + (performance.now() - state.exerciseClockStartedAt))
  );
  state.exerciseClockStartedAt = 0;
}

function startExerciseClock() {
  if (!state.exercise || state.exercise.completedAt || state.exerciseClockStartedAt) return;
  state.exerciseClockStartedAt = performance.now();
}

function currentExerciseDuration() {
  const active = state.exerciseClockStartedAt ? performance.now() - state.exerciseClockStartedAt : 0;
  return Math.max(0, Math.round(Number(state.exercise?.durationMs || 0) + active));
}

function showView(name, { preserveScroll = false } = {}) {
  if (state.currentView === "lesson" && (name !== "lesson" || state.lessonPage !== 4)) pauseExerciseClock();
  state.currentView = name;
  for (const view of elements.views) view.hidden = view.dataset.view !== name;

  const loggedIn = Boolean(state.user && state.authToken);
  elements.userPill.hidden = !loggedIn;
  elements.logout.hidden = !loggedIn;
  elements.dashboardButton.hidden = !loggedIn || name === "dashboard" || state.user?.role === "admin";
  elements.adminStudentsButton.hidden = !loggedIn || state.user?.role !== "admin" || name === "admin";
  if (loggedIn) {
    elements.userPill.textContent = state.user.role === "admin"
      ? `${state.user.name} · 管理員`
      : state.user.name;
  }

  if (!preserveScroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

function initialiseSupabaseClient() {
  if (state.supabase) return state.supabase;
  if (!window.supabase?.createClient || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    throw new Error("登入服務暫時未能載入，請重新整理頁面。");
  }
  let authStorage;
  try { authStorage = window.sessionStorage; } catch { authStorage = undefined; }
  state.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      persistSession: Boolean(authStorage),
      ...(authStorage ? { storage: authStorage } : {}),
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
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

function workerBaseUrl() {
  const baseUrl = String(CONFIG.workerBaseUrl || "").trim().replace(/\/+$/, "");
  if (!baseUrl.startsWith("https://")) throw new Error("句子結構服務尚未完成設定。");
  return baseUrl;
}

async function parseApiError(response) {
  let message = `服務回應錯誤（${response.status}）`;
  let code = "";
  try {
    const payload = await response.clone().json();
    message = String(payload?.error || payload?.message || message);
    code = String(payload?.code || "");
  } catch {
    // Keep the status-based fallback.
  }
  const error = new Error(message);
  error.status = response.status;
  error.code = code;
  return error;
}

async function apiJson(path, options = {}, includeAuth = true) {
  const headers = new Headers(options.headers || {});
  if (includeAuth && state.authToken) headers.set("Authorization", `Bearer ${state.authToken}`);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  let response;
  try {
    response = await fetch(`${workerBaseUrl()}/${String(path || "").replace(/^\/+/, "")}`, {
      ...options,
      headers,
      credentials: "omit"
    });
  } catch (error) {
    const connectionError = new Error("暫時未能連接句子結構服務，請檢查網絡後再試。");
    connectionError.cause = error;
    throw connectionError;
  }
  if (!response.ok) {
    const error = await parseApiError(response);
    if (includeAuth && response.status === 401) {
      clearSession();
      setStatus(elements.loginStatus, "登入時段已結束，請重新登入。", "error");
      showView("login");
    }
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

function saveSession() {
  if (!state.user || !state.authToken) return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      token: state.authToken,
      id: state.user.id || "",
      name: state.user.name || "",
      role: state.user.role
    }));
  } catch {
    // The session can remain in memory if storage is unavailable.
  }
}

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function clearSession() {
  pauseExerciseClock();
  state.user = null;
  state.authToken = "";
  state.lessonId = "";
  state.lessonPage = 1;
  state.exercise = null;
  state.bookmarks = [];
  state.attempts = [];
  state.dashboardLoaded = false;
  state.adminStudents = [];
  state.selectedAdminStudentId = "";
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Ignore unavailable storage. */ }
}

async function studentLogin(username, password) {
  const client = await ensureSupabaseSession();
  const { data, error } = await client.rpc(String(CONFIG.studentLoginRpc || "flashcard_student_login"), {
    p_name: username,
    p_password: password
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.session_token) return null;
  return {
    token: String(row.session_token),
    user: {
      id: String(row.id || ""),
      name: String(row.name || username),
      role: "student"
    }
  };
}

async function adminLogin(username, password) {
  const payload = await apiJson("/v1/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  }, false);
  const admin = payload?.admin;
  if (!admin?.adminToken) return null;
  return {
    token: String(admin.adminToken),
    user: {
      id: String(admin.id || "sentence-structure-admin"),
      name: String(admin.name || username),
      role: "admin"
    }
  };
}

async function validateRestoredSession() {
  const saved = readSession();
  if (!saved?.token || !["student", "admin"].includes(saved.role)) return false;
  state.authToken = String(saved.token);
  state.user = {
    id: String(saved.id || ""),
    name: String(saved.name || ""),
    role: saved.role
  };
  try {
    const payload = await apiJson(saved.role === "admin" ? "/v1/admin/me" : "/v1/student/me");
    const profile = saved.role === "admin" ? payload?.admin : payload?.student;
    if (!profile?.id || !profile?.name) throw new Error("Invalid profile");
    state.user = { id: String(profile.id), name: String(profile.name), role: saved.role };
    saveSession();
    return true;
  } catch (error) {
    console.warn("Sentence Structure session restore failed", error);
    clearSession();
    return false;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const username = elements.username.value.trim();
  const password = elements.password.value;
  if (!username || !password) {
    setStatus(elements.loginStatus, "請輸入用戶名稱及密碼。", "error");
    return;
  }

  elements.loginButton.disabled = true;
  setStatus(elements.loginStatus, "正在核對帳戶…");
  try {
    const isAdmin = username.toLocaleLowerCase() === String(CONFIG.adminUsername || "").toLocaleLowerCase();
    const result = isAdmin
      ? await adminLogin(username, password)
      : await studentLogin(username, password);
    if (!result) throw new Error("用戶名稱或密碼不正確。");
    state.authToken = result.token;
    state.user = result.user;
    saveSession();
    elements.loginForm.reset();
    setStatus(elements.loginStatus, "");
    setConnection("已安全連接", "online");
    if (state.user.role === "admin") {
      await openAdminDashboard();
      showToast("管理員登入成功。");
    } else {
      await openDashboard();
      showToast(`你好，${state.user.name}！`);
    }
  } catch (error) {
    console.warn("Sentence Structure login failed", error);
    setStatus(elements.loginStatus, error.message || "登入失敗，請再試一次。", "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function logout() {
  const role = state.user?.role;
  try {
    if (role === "admin" && state.authToken) {
      await apiJson("/v1/admin/logout", { method: "POST" });
    }
  } catch (error) {
    console.warn("Sentence Structure logout cleanup failed", error);
  }
  clearSession();
  try { await state.supabase?.auth.signOut(); } catch { /* Ignore anonymous auth cleanup failures. */ }
  setStatus(elements.loginStatus, "");
  setConnection("可以登入", "online");
  showView("login");
}

function normalizeBookmark(value) {
  if (!isPlainObject(value)) return null;
  const lessonId = String(value.lessonId || value.lesson_id || "");
  const questionId = String(value.questionId || value.question_id || "");
  if (!getQuestion(lessonId, questionId)) return null;
  return {
    lessonId,
    questionId,
    includeAnswer: value.includeAnswer === true || value.include_answer === true,
    createdAt: String(value.createdAt || value.created_at || "")
  };
}

function normalizeAttempt(value) {
  const result = parseJsonObject(value?.result, {});
  return {
    id: String(value?.id || ""),
    lessonId: String(value?.lessonId || value?.lesson_id || ""),
    lessonVersion: String(value?.lessonVersion || value?.lesson_version || ""),
    status: String(value?.status || "in_progress"),
    roundNumber: Number(value?.roundNumber || value?.round_number || result.round || 1),
    correctCount: Number(value?.correctCount ?? value?.correct_count ?? result.correctIds?.length ?? 0),
    totalCount: Number(value?.totalCount || value?.total_count || 50),
    durationMs: Number(value?.durationMs || value?.duration_ms || 0),
    startedAt: String(value?.startedAt || value?.started_at || ""),
    completedAt: String(value?.completedAt || value?.completed_at || ""),
    updatedAt: String(value?.updatedAt || value?.updated_at || ""),
    result
  };
}

async function loadDashboardData({ force = false } = {}) {
  if (state.user?.role !== "student") return;
  if (state.dashboardLoaded && !force) return;
  const [attemptPayload, bookmarkPayload] = await Promise.all([
    apiJson("/v1/attempts?page=1&pageSize=100"),
    apiJson("/v1/bookmarks")
  ]);
  state.attempts = (Array.isArray(attemptPayload?.attempts) ? attemptPayload.attempts : [])
    .map(normalizeAttempt)
    .filter((attempt) => attempt.id && getLesson(attempt.lessonId));
  state.bookmarks = (Array.isArray(bookmarkPayload?.bookmarks) ? bookmarkPayload.bookmarks : [])
    .map(normalizeBookmark)
    .filter(Boolean)
    .slice(0, MAX_BOOKMARKS);
  state.dashboardLoaded = true;
}

async function openDashboard({ force = false } = {}) {
  if (state.user?.role !== "student") return;
  pauseExerciseClock();
  showView("dashboard");
  elements.dashboardWelcome.textContent = `${state.user.name}，選擇一個句型，由概念開始，再完成 50 題分輪練習。`;
  renderLessonChoices();
  if (!state.dashboardLoaded || force) elements.historyList.innerHTML = loadingHtml();
  try {
    await loadDashboardData({ force });
    renderLessonChoices();
    renderAttemptHistory();
  } catch (error) {
    console.warn("Sentence Structure dashboard failed", error);
    elements.historyList.innerHTML = '<p class="empty-state">未能載入練習記錄，請稍後按「重新整理」。</p>';
    showToast("未能同步練習記錄。", "error");
  }
}

function renderLessonChoices() {
  const cards = lessonList().map((lesson, index) => {
    const completed = state.attempts.filter((attempt) => attempt.lessonId === lesson.id && attempt.status === "completed").length;
    const inProgress = state.attempts.find((attempt) => attempt.lessonId === lesson.id && attempt.status !== "completed");
    return `
      <button class="lesson-choice" type="button" data-open-lesson="${escapeHtml(lesson.id)}" data-number="${index + 1}" data-tone="${index % 2 ? "violet" : "blue"}">
        <span class="choice-icon" aria-hidden="true">${index === 0 ? "to" : "A＋N"}</span>
        <h2>${escapeHtml(lessonTitle(lesson))}<span>${escapeHtml(lessonEnglishTitle(lesson))}</span></h2>
        <span class="choice-meta">
          <span>${escapeHtml(lesson.questions?.length || 0)} 題練習</span>
          <span>${inProgress ? `進行中 · 第 ${escapeHtml(inProgress.roundNumber)} 輪` : completed ? `已完成 ${completed} 次` : "由公式開始"}</span>
        </span>
      </button>
    `;
  }).join("");
  elements.lessonChoiceGrid.innerHTML = `${cards}
    <button class="lesson-choice" type="button" data-open-bookmarks-card data-number="★" data-tone="bookmark">
      <span class="choice-icon" aria-hidden="true">★</span>
      <h2>書簽<span>Bookmarks</span></h2>
      <span class="choice-meta"><span>${escapeHtml(state.bookmarks.length)} 個收藏題目</span><span>跟隨帳戶同步</span></span>
    </button>`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-HK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) return `${hours} 小時 ${minutes} 分鐘`;
  return `${minutes} 分 ${String(seconds).padStart(2, "0")} 秒`;
}

function attemptHistoryHtml(attempts, { allowResume = true } = {}) {
  if (!attempts.length) return '<p class="empty-state">暫時未有練習記錄。完成或開始一組句型練習後，記錄會顯示在這裡。</p>';
  return attempts.map((attempt) => {
    const lesson = getLesson(attempt.lessonId);
    const complete = attempt.status === "completed";
    const rounds = Array.isArray(attempt.result?.rounds) ? attempt.result.rounds.length : attempt.roundNumber;
    return `
      <details class="attempt-row">
        <summary>
          <span class="attempt-summary-title">
            <strong>${escapeHtml(lessonTitle(lesson))}</strong>
            <small>${escapeHtml(formatDateTime(attempt.startedAt || attempt.updatedAt))}</small>
          </span>
          <span class="attempt-score ${complete ? "" : "in-progress"}">${complete ? "已完成" : "進行中"} · ${escapeHtml(attempt.correctCount)}/${escapeHtml(attempt.totalCount)}</span>
        </summary>
        <div class="attempt-details">
          <div class="attempt-details-grid">
            <div class="attempt-detail"><span>狀態</span><strong>${complete ? "全部答對" : "尚未完成"}</strong></div>
            <div class="attempt-detail"><span>目前輪次</span><strong>第 ${escapeHtml(attempt.roundNumber)} 輪</strong></div>
            <div class="attempt-detail"><span>提交記錄</span><strong>${escapeHtml(rounds)} 次</strong></div>
            <div class="attempt-detail"><span>練習時間</span><strong>${escapeHtml(formatDuration(attempt.durationMs))}</strong></div>
          </div>
          ${allowResume && !complete ? `<div class="attempt-actions"><button class="small-button" type="button" data-resume-attempt="${escapeHtml(attempt.id)}">繼續這次練習</button></div>` : ""}
        </div>
      </details>`;
  }).join("");
}

function renderAttemptHistory() {
  elements.historyList.innerHTML = attemptHistoryHtml(state.attempts);
}

function openLesson(lessonId, { page = 1, attempt = null, questionId = "" } = {}) {
  const lesson = getLesson(lessonId);
  if (!lesson) return;
  pauseExerciseClock();
  state.lessonId = lesson.id;
  state.lessonPage = Math.max(1, Math.min(LESSON_PAGES, Number(page) || 1));
  state.exercise = attempt ? exerciseFromAttempt(attempt) : null;
  elements.lessonKicker.textContent = lessonEnglishTitle(lesson).toUpperCase();
  elements.lessonTitle.textContent = lessonTitle(lesson);
  showView("lesson");
  renderLessonPage();
  if (questionId) {
    window.setTimeout(() => {
      document.querySelector(`[data-question-id="${CSS.escape(questionId)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }
}

function setLessonPage(page) {
  pauseExerciseClock();
  state.lessonPage = Math.max(1, Math.min(LESSON_PAGES, Number(page) || 1));
  renderLessonPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateLessonStepper() {
  elements.lessonStepper.querySelectorAll("[data-step]").forEach((button) => {
    const step = Number(button.dataset.step);
    button.toggleAttribute("aria-current", step === state.lessonPage);
    if (step === state.lessonPage) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
    button.classList.toggle("is-complete", step < state.lessonPage);
  });
  const exerciseVisible = state.lessonPage === 4 && state.exercise;
  elements.lessonRound.hidden = !exerciseVisible;
  if (exerciseVisible) elements.lessonRound.textContent = `第 ${state.exercise.round} 輪 · ${state.exercise.correctIds.length}/${getLesson()?.questions?.length || 0} 題完成`;
}

function infoPageHeader(number, title, english, description = "") {
  return `<header class="info-page-header">
    <span class="page-label">PAGE ${escapeHtml(number)} · ${escapeHtml(english)}</span>
    <h2>${escapeHtml(title)}</h2>
    ${description ? `<p>${escapeHtml(description)}</p>` : ""}
  </header>`;
}

function navHtml(page) {
  return `<div class="lesson-navigation">
    ${page > 1 ? `<button class="secondary-button" type="button" data-lesson-prev>← 上一頁</button>` : '<button class="secondary-button" type="button" data-back-to-dashboard>← 返回句型選擇</button>'}
    ${page < LESSON_PAGES ? `<button class="primary-button" type="button" data-lesson-next>下一頁 →</button>` : ""}
  </div>`;
}

function renderFormulaPage(lesson) {
  const formulaRows = Array.isArray(lesson.formulas) && lesson.formulas.length
    ? lesson.formulas
    : (Array.isArray(lesson.formula) ? lesson.formula : [lesson.formula]).map((formula) => ({ formula }));
  const examples = Array.isArray(lesson.examples) && lesson.examples.length
    ? lesson.examples
    : [{ english: lesson.example, chinese: lesson.exampleZh }];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${infoPageHeader(1, "公式＋例句", "FORMULA + EXAMPLE", "先掌握句型的固定骨架，再觀察完整例句。")}
    <section class="formula-card">
      <span class="formula-label">FORMULA · 句型公式</span>
      <div class="formula-display">${formulaRows.filter((row) => row?.formula || typeof row === "string").map((row) => {
        const formula = typeof row === "string" ? row : row.formula;
        const label = typeof row === "string" ? "" : (row.labelZh || row.labelEn || "");
        return `<p>${label ? `<small>${escapeHtml(label)}</small>` : ""}${escapeHtml(formula)}</p>`;
      }).join("")}</div>
      ${examples.filter((example) => example?.english || example?.en || example?.answer).map((example) => `
        <div class="example-block">
          <strong>EXAMPLE · 例句</strong>
          <p>${escapeHtml(example.english || example.en || example.answer)}</p>
          <p>${escapeHtml(example.chinese || example.zh || example.answerZh || "")}</p>
        </div>`).join("")}
    </section>
    ${navHtml(1)}
  </article>`;
}

function bilingualItem(item) {
  if (typeof item === "string") return { english: item, chinese: "", examples: [] };
  return {
    english: String(item?.english || item?.en || item?.titleEn || ""),
    chinese: String(item?.chinese || item?.zh || item?.titleZh || item?.text || ""),
    examples: Array.isArray(item?.examples) ? item.examples : []
  };
}

function renderBenefitsPage(lesson) {
  const benefits = Array.isArray(lesson.benefits) ? lesson.benefits : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${infoPageHeader(2, "Benefits 學習好處", "WHY THIS STRUCTURE HELPS", "理解這個句型能為寫作帶來甚麼，練習時會更有方向。")}
    <ol class="benefit-list">
      ${benefits.map((raw, index) => {
        const item = bilingualItem(raw);
        return `<li class="benefit-card"><span>${index + 1}</span><div>${item.english ? `<p class="english">${escapeHtml(item.english)}</p>` : ""}<p class="chinese">${escapeHtml(item.chinese)}</p></div></li>`;
      }).join("")}
    </ol>
    ${navHtml(2)}
  </article>`;
}

function renderRulesPage(lesson) {
  const rules = Array.isArray(lesson.rules) ? lesson.rules : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${infoPageHeader(3, "Important Rules 重要規則", "IMPORTANT REMINDERS", "留意容易出錯的位置，特別是動詞形態、冠詞及題目已提供的資料。")}
    <ol class="rule-list">
      ${rules.map((raw, index) => {
        const item = bilingualItem(raw);
        return `<li class="rule-card"><span>${index + 1}</span><div>${item.english ? `<p class="english">${escapeHtml(item.english)}</p>` : ""}<p class="chinese">${escapeHtml(item.chinese)}</p>${item.examples.length ? `<div class="examples">${item.examples.map((example) => `<code>${escapeHtml(example)}</code>`).join("")}</div>` : ""}</div></li>`;
      }).join("")}
    </ol>
    ${navHtml(3)}
  </article>`;
}

function makeAttemptId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  throw new Error("此瀏覽器未能建立安全練習編號，請更新瀏覽器。");
}

function createExercise(lesson) {
  const startedAt = new Date().toISOString();
  return {
    id: makeAttemptId(),
    lessonId: lesson.id,
    lessonVersion: String(lesson.version || CONTENT.version || "1"),
    round: 1,
    correctIds: [],
    questionState: {},
    drafts: {},
    rounds: [],
    awaitingNextRound: false,
    durationMs: 0,
    startedAt,
    completedAt: ""
  };
}

function exerciseFromAttempt(attempt) {
  const lesson = getLesson(attempt.lessonId);
  const result = parseJsonObject(attempt.result, {});
  const validQuestionIds = new Set((lesson?.questions || []).map((question) => String(question.id)));
  const correctIds = Array.isArray(result.correctIds)
    ? result.correctIds.map(String).filter((id) => validQuestionIds.has(id))
    : [];
  const questionState = {};
  if (isPlainObject(result.questionState)) {
    for (const [id, value] of Object.entries(result.questionState)) {
      if (!validQuestionIds.has(id) || !isPlainObject(value)) continue;
      questionState[id] = {
        status: ["pending", "correct", "wrong"].includes(value.status) ? value.status : "pending",
        lastAnswer: String(value.lastAnswer || ""),
        reveal: value.reveal === true
      };
    }
  }
  return {
    id: attempt.id,
    lessonId: attempt.lessonId,
    lessonVersion: attempt.lessonVersion || String(lesson?.version || CONTENT.version || "1"),
    round: Math.max(1, attempt.roundNumber || Number(result.round || 1)),
    correctIds,
    questionState,
    drafts: {},
    rounds: Array.isArray(result.rounds) ? result.rounds.slice(0, 1000) : [],
    awaitingNextRound: result.awaitingNextRound === true,
    durationMs: Math.max(0, attempt.durationMs),
    startedAt: attempt.startedAt || new Date().toISOString(),
    completedAt: attempt.completedAt || ""
  };
}

function ensureExercise(lesson) {
  if (state.exercise?.lessonId === lesson.id) return state.exercise;
  const resumable = state.attempts.find((attempt) => attempt.lessonId === lesson.id && attempt.status !== "completed");
  state.exercise = resumable ? exerciseFromAttempt(resumable) : createExercise(lesson);
  if (!resumable) persistExercise().catch((error) => console.warn("Initial attempt save failed", error));
  return state.exercise;
}

function questionState(questionId) {
  return state.exercise.questionState[questionId] || { status: "pending", lastAnswer: "", reveal: false };
}

function isBookmarked(lessonId, questionId) {
  return state.bookmarks.some((bookmark) => bookmark.lessonId === lessonId && bookmark.questionId === questionId);
}

function highlightedAnswerHtml(answer, highlight) {
  const full = String(answer || "");
  const target = String(highlight || "");
  if (!target) return escapeHtml(full);
  const index = full.toLocaleLowerCase().indexOf(target.toLocaleLowerCase());
  if (index < 0) return escapeHtml(full);
  return `${escapeHtml(full.slice(0, index))}<span class="target-highlight">${escapeHtml(full.slice(index, index + target.length))}</span>${escapeHtml(full.slice(index + target.length))}`;
}

function questionHtml(question) {
  const qState = questionState(question.id);
  const correct = state.exercise.correctIds.includes(question.id) || qState.status === "correct";
  const wrong = qState.status === "wrong";
  const value = state.exercise.drafts[question.id] ?? qState.lastAnswer ?? "";
  const bookmarked = isBookmarked(state.lessonId, question.id);
  return `<article class="question-card ${correct ? "is-correct" : wrong ? "is-wrong" : ""}" data-question-id="${escapeHtml(question.id)}">
    <div class="question-card-top">
      <span class="question-number">QUESTION ${escapeHtml(question.number || "")}</span>
      <button class="question-bookmark-button" type="button" data-toggle-question-bookmark="${escapeHtml(question.id)}" aria-pressed="${bookmarked}" aria-label="${bookmarked ? "移除書簽" : "加入書簽"}">${bookmarked ? "★" : "☆"}</button>
    </div>
    <div class="question-prompt">
      <p class="english">${escapeHtml(question.prompt || question.english || "")}</p>
      <p class="chinese">${escapeHtml(question.promptZh || question.chinese || question.zh || "")}</p>
      ${question.starter ? `<p class="starter-hint">請以「${escapeHtml(question.starter)}」開始。</p>` : ""}
    </div>
    <input class="answer-input" type="text" data-answer-input="${escapeHtml(question.id)}" value="${escapeHtml(value)}" ${correct ? "disabled" : ""} autocomplete="off" spellcheck="true" aria-label="第 ${escapeHtml(question.number)} 題答案">
    <p class="question-feedback" aria-live="polite">${correct ? "✓ 答案正確，這題已完成。" : wrong ? "答案未完全符合句型；請參考答案，下一輪再試。" : ""}</p>
    ${qState.reveal ? `<div class="answer-reveal"><span>SUGGESTED ANSWER · 參考答案</span><p>${highlightedAnswerHtml(question.answer, question.highlight)}</p><p>${escapeHtml(question.answerZh || "")}</p></div>` : ""}
  </article>`;
}

function activeQuestions(lesson = getLesson()) {
  return (lesson?.questions || []).filter((question) => !state.exercise.correctIds.includes(question.id));
}

function renderExercisePage(lesson, { preserveScroll = false } = {}) {
  ensureExercise(lesson);
  const scrollTop = preserveScroll ? window.scrollY : 0;
  const total = lesson.questions?.length || 0;
  const correct = state.exercise.correctIds.length;
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  const remaining = total - correct;
  const completed = Boolean(state.exercise.completedAt || remaining === 0);
  const active = activeQuestions(lesson);

  elements.lessonContent.innerHTML = `<section class="exercise-page">
    <header class="exercise-header">
      <div class="exercise-header-top">
        <div><p class="eyebrow">PAGE 4 · TYPE THE WHOLE SENTENCE</p><h2>句子改寫練習</h2><p>輸入完整英文句子。部分提交只會檢查已輸入的題目；答對的題目不會在下一輪重複。</p></div>
        <span class="round-badge">第 ${escapeHtml(state.exercise.round)} 輪</span>
      </div>
      <div class="exercise-progress" style="--progress:${percentage}%"><span></span></div>
      <div class="exercise-progress-label"><span>已完成 ${escapeHtml(correct)} / ${escapeHtml(total)} 題</span><span>尚餘 ${escapeHtml(remaining)} 題</span></div>
    </header>

    ${completed ? `<section class="round-summary completion-card">
      <div class="completion-mark" aria-hidden="true">✓</div>
      <h3>恭喜，全部題目已完成！</h3>
      <p>你用了 <strong>${escapeHtml(state.exercise.round)} 輪</strong> 完成這組 ${escapeHtml(total)} 題句子結構練習。</p>
      <div class="round-summary-actions"><button class="secondary-button" type="button" data-review-completed>查看本次答案</button><button class="primary-button" type="button" data-finish-exercise>返回學習首頁</button></div>
    </section>` : state.exercise.awaitingNextRound ? `<section class="round-summary">
      <h3>第 ${escapeHtml(state.exercise.round)} 輪已提交</h3>
      <p>目前已答對 <strong>${escapeHtml(correct)}</strong> 題；尚有 <strong>${escapeHtml(remaining)}</strong> 題會在下一輪再練習。</p>
      <div class="round-summary-actions"><button class="primary-button" type="button" data-next-round>開始第 ${escapeHtml(state.exercise.round + 1)} 輪</button></div>
    </section>` : ""}

    <div class="question-list" data-question-list ${completed && !state.exercise.reviewCompleted ? "hidden" : ""}>
      ${(completed ? lesson.questions : active).map(questionHtml).join("")}
    </div>

    ${!completed && !state.exercise.awaitingNextRound ? `<div class="exercise-actions">
      <span class="exercise-action-copy" data-exercise-action-copy>可提交全部答案，或只檢查已輸入的題目。</span>
      <div class="exercise-action-buttons">
        <button class="partial-button" type="button" data-submit-partial hidden>提交部分答案</button>
        <button class="primary-button" type="button" data-submit-all>提交答案</button>
      </div>
    </div>` : ""}
  </section>`;

  updateLessonStepper();
  if (!completed) startExerciseClock();
  syncExerciseButtons();
  if (preserveScroll) requestAnimationFrame(() => window.scrollTo({ top: scrollTop, behavior: "auto" }));
}

function renderLessonPage() {
  const lesson = getLesson();
  if (!lesson) return openDashboard();
  updateLessonStepper();
  if (state.lessonPage === 1) renderFormulaPage(lesson);
  else if (state.lessonPage === 2) renderBenefitsPage(lesson);
  else if (state.lessonPage === 3) renderRulesPage(lesson);
  else renderExercisePage(lesson);
}

function readExerciseDrafts() {
  document.querySelectorAll("[data-answer-input]").forEach((input) => {
    state.exercise.drafts[input.dataset.answerInput] = input.value;
  });
}

function syncExerciseButtons() {
  const partialButton = document.querySelector("[data-submit-partial]");
  const allButton = document.querySelector("[data-submit-all]");
  const copy = document.querySelector("[data-exercise-action-copy]");
  if (!partialButton || !allButton || !state.exercise) return;
  readExerciseDrafts();
  const active = activeQuestions();
  const filled = active.filter((question) => String(state.exercise.drafts[question.id] || "").trim()).length;
  partialButton.hidden = !(filled > 0 && filled < active.length);
  allButton.textContent = filled === active.length && active.length ? "提交答案" : "提交全部答案";
  if (copy) {
    copy.textContent = filled > 0 && filled < active.length
      ? `已輸入 ${filled} / ${active.length} 題；可先檢查這 ${filled} 題。`
      : filled === active.length && active.length
        ? "所有答案已填寫，現在可以提交。"
        : "尚未輸入答案；提交全部會把空白題目留待下一輪。";
  }
}

function normalizeAnswer(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim()
    .replace(/[.!?]+$/g, "")
    .toLocaleLowerCase();
}

function answersMatch(studentAnswer, question) {
  const accepted = [question?.answer, ...(Array.isArray(question?.acceptedAnswers) ? question.acceptedAnswers : [])]
    .filter(Boolean);
  const normalizedStudentAnswer = normalizeAnswer(studentAnswer);
  return accepted.some((answer) => normalizedStudentAnswer === normalizeAnswer(answer));
}

function serializeExerciseResult() {
  return {
    round: state.exercise.round,
    correctIds: [...state.exercise.correctIds],
    questionState: { ...state.exercise.questionState },
    rounds: state.exercise.rounds.slice(-1000),
    awaitingNextRound: state.exercise.awaitingNextRound,
    contentVersion: String(CONTENT.version || "1")
  };
}

async function persistExercise() {
  if (!state.exercise || state.user?.role !== "student") return;
  pauseExerciseClock();
  const lesson = getLesson(state.exercise.lessonId);
  const payload = {
    lessonId: state.exercise.lessonId,
    lessonVersion: state.exercise.lessonVersion,
    status: state.exercise.completedAt ? "completed" : "in_progress",
    roundNumber: state.exercise.round,
    correctCount: state.exercise.correctIds.length,
    totalCount: lesson?.questions?.length || 0,
    durationMs: state.exercise.durationMs,
    startedAt: state.exercise.startedAt,
    completedAt: state.exercise.completedAt || null,
    result: serializeExerciseResult()
  };
  const response = await apiJson(`/v1/attempts/${encodeURIComponent(state.exercise.id)}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  const saved = normalizeAttempt(response?.attempt || { id: state.exercise.id, ...payload });
  const index = state.attempts.findIndex((attempt) => attempt.id === saved.id);
  if (index >= 0) state.attempts[index] = saved;
  else state.attempts.unshift(saved);
  state.dashboardLoaded = true;
  if (!state.exercise.completedAt && state.currentView === "lesson" && state.lessonPage === 4) {
    startExerciseClock();
  }
}

async function submitExercise(kind) {
  if (state.saveInFlight || !state.exercise || state.exercise.awaitingNextRound) return;
  readExerciseDrafts();
  const lesson = getLesson();
  const active = activeQuestions(lesson);
  const filled = active.filter((question) => String(state.exercise.drafts[question.id] || "").trim());
  const targets = kind === "partial" ? filled : active;
  if (kind === "partial" && !targets.length) {
    showToast("請先輸入至少一題答案。", "error");
    return;
  }

  const checkedAt = new Date().toISOString();
  const correctThisTime = [];
  const incorrectThisTime = [];
  let bookmarkChanged = false;
  for (const question of targets) {
    const answer = String(state.exercise.drafts[question.id] || "").trim();
    const correct = Boolean(answer) && answersMatch(answer, question);
    state.exercise.questionState[question.id] = {
      status: correct ? "correct" : "wrong",
      lastAnswer: answer,
      reveal: true
    };
    if (correct) {
      if (!state.exercise.correctIds.includes(question.id)) state.exercise.correctIds.push(question.id);
      correctThisTime.push(question.id);
    } else {
      incorrectThisTime.push(question.id);
    }
    if (isBookmarked(lesson.id, question.id)) {
      bookmarkChanged = upgradeBookmarkAnswer(lesson.id, question.id) || bookmarkChanged;
    }
  }

  state.exercise.rounds.push({
    round: state.exercise.round,
    kind,
    checkedIds: targets.map((question) => question.id),
    correctIds: correctThisTime,
    incorrectIds: incorrectThisTime,
    submittedAt: checkedAt
  });

  const remaining = activeQuestions(lesson).length;
  if (!remaining) {
    pauseExerciseClock();
    state.exercise.completedAt = checkedAt;
    state.exercise.awaitingNextRound = false;
  } else if (kind === "all") {
    state.exercise.awaitingNextRound = true;
  }

  state.saveInFlight = true;
  renderExercisePage(lesson, { preserveScroll: true });
  try {
    await Promise.all([
      persistExercise(),
      ...(bookmarkChanged ? [saveBookmarks()] : [])
    ]);
    showToast(remaining ? `已檢查 ${targets.length} 題。` : "全部題目完成，記錄已儲存！");
  } catch (error) {
    console.warn("Sentence Structure attempt save failed", error);
    showToast("答案已檢查，但未能同步練習記錄；請稍後再試。", "error");
  } finally {
    state.saveInFlight = false;
  }
}

async function startNextRound() {
  if (!state.exercise?.awaitingNextRound) return;
  const lesson = getLesson();
  state.exercise.round += 1;
  state.exercise.awaitingNextRound = false;
  for (const question of activeQuestions(lesson)) {
    state.exercise.questionState[question.id] = { status: "pending", lastAnswer: "", reveal: false };
    state.exercise.drafts[question.id] = "";
  }
  renderExercisePage(lesson);
  try { await persistExercise(); } catch (error) { console.warn("Next round save failed", error); }
  document.querySelector(".exercise-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveBookmarks() {
  const payload = await apiJson("/v1/bookmarks", {
    method: "PUT",
    body: JSON.stringify({ bookmarks: state.bookmarks.map(({ lessonId, questionId, includeAnswer }) => ({ lessonId, questionId, includeAnswer })) })
  });
  state.bookmarks = (Array.isArray(payload?.bookmarks) ? payload.bookmarks : state.bookmarks)
    .map(normalizeBookmark)
    .filter(Boolean);
}

async function toggleBookmark(lessonId, questionId, includeAnswer = false) {
  const existingIndex = state.bookmarks.findIndex((bookmark) => bookmark.lessonId === lessonId && bookmark.questionId === questionId);
  const previous = state.bookmarks.map((bookmark) => ({ ...bookmark }));
  if (existingIndex >= 0) state.bookmarks.splice(existingIndex, 1);
  else {
    if (state.bookmarks.length >= MAX_BOOKMARKS) {
      showToast(`最多可儲存 ${MAX_BOOKMARKS} 個書簽。`, "error");
      return;
    }
    state.bookmarks.push({ lessonId, questionId, includeAnswer, createdAt: new Date().toISOString() });
  }
  if (state.currentView === "lesson") renderExercisePage(getLesson(), { preserveScroll: true });
  if (state.currentView === "bookmarks") renderBookmarks();
  try {
    await saveBookmarks();
    showToast(existingIndex >= 0 ? "已移除書簽。" : "已加入書簽。");
  } catch (error) {
    state.bookmarks = previous;
    if (state.currentView === "lesson") renderExercisePage(getLesson(), { preserveScroll: true });
    if (state.currentView === "bookmarks") renderBookmarks();
    showToast("未能同步書簽，請稍後再試。", "error");
  }
}

function upgradeBookmarkAnswer(lessonId, questionId) {
  const bookmark = state.bookmarks.find((item) => item.lessonId === lessonId && item.questionId === questionId);
  if (!bookmark || bookmark.includeAnswer) return false;
  bookmark.includeAnswer = true;
  return true;
}

function openBookmarks() {
  pauseExerciseClock();
  showView("bookmarks");
  renderBookmarks();
}

function renderBookmarks() {
  if (!state.bookmarks.length) {
    elements.bookmarkList.innerHTML = '<p class="empty-state">暫時未有書簽。你可以在任何練習題右上角按 ☆ 收藏題目。</p>';
    return;
  }
  elements.bookmarkList.innerHTML = state.bookmarks.map((bookmark) => {
    const lesson = getLesson(bookmark.lessonId);
    const question = getQuestion(bookmark.lessonId, bookmark.questionId);
    if (!lesson || !question) return "";
    return `<article class="bookmark-row">
      <span class="bookmark-row-number">${escapeHtml(question.number)}</span>
      <div>
        <h3>${escapeHtml(lessonTitle(lesson))}</h3>
        <p class="bookmark-prompt">${escapeHtml(question.prompt || question.english || "")}</p>
        <p class="bookmark-zh">${escapeHtml(question.promptZh || question.chinese || question.zh || "")}</p>
        ${bookmark.includeAnswer ? `<div class="bookmark-answer"><p>${highlightedAnswerHtml(question.answer, question.highlight)}</p><p>${escapeHtml(question.answerZh || "")}</p></div>` : ""}
      </div>
      <div class="bookmark-row-actions">
        <button class="icon-button" type="button" data-open-bookmark="${escapeHtml(bookmark.lessonId)}|${escapeHtml(bookmark.questionId)}" aria-label="開啟題目">開啟</button>
        <button class="icon-button danger" type="button" data-remove-bookmark="${escapeHtml(bookmark.lessonId)}|${escapeHtml(bookmark.questionId)}" aria-label="移除書簽">移除</button>
      </div>
    </article>`;
  }).join("");
}

function resumeAttempt(attemptId) {
  const attempt = state.attempts.find((item) => item.id === attemptId);
  if (!attempt) return;
  openLesson(attempt.lessonId, { page: 4, attempt });
}

async function openAdminDashboard() {
  if (state.user?.role !== "admin") return;
  showView("admin");
  elements.adminStudentList.innerHTML = loadingHtml();
  try {
    const payload = await apiJson("/v1/admin/students");
    state.adminStudents = Array.isArray(payload?.students) ? payload.students : [];
    renderAdminStudents();
  } catch (error) {
    console.warn("Sentence Structure admin students failed", error);
    elements.adminStudentList.innerHTML = '<p class="empty-state">未能載入學生帳戶。</p>';
    showToast("未能載入學生記錄。", "error");
  }
}

function renderAdminStudents() {
  const query = String(elements.adminSearch?.value || "").trim().toLocaleLowerCase();
  const rows = state.adminStudents.filter((student) => !query || String(student.name || "").toLocaleLowerCase().includes(query));
  elements.adminStudentCount.textContent = String(rows.length);
  elements.adminStudentList.innerHTML = rows.length ? rows.map((student) => `
    <button class="admin-student-button" type="button" data-admin-student="${escapeHtml(student.id)}" aria-current="${state.selectedAdminStudentId === student.id}">
      <span><strong>${escapeHtml(student.name)}</strong><small>${escapeHtml(student.attemptCount || student.attempt_count || 0)} 次練習 · ${escapeHtml(student.bookmarkCount || student.bookmark_count || 0)} 個書簽</small></span>
      <span>查看 →</span>
    </button>`).join("") : '<p class="empty-state">找不到相符學生。</p>';
}

async function openAdminStudent(studentId) {
  state.selectedAdminStudentId = studentId;
  renderAdminStudents();
  elements.adminDetail.innerHTML = loadingHtml();
  try {
    const payload = await apiJson(`/v1/admin/students/${encodeURIComponent(studentId)}`);
    const student = payload?.student;
    const attempts = (Array.isArray(payload?.attempts) ? payload.attempts : []).map(normalizeAttempt);
    const bookmarks = (Array.isArray(payload?.bookmarks) ? payload.bookmarks : []).map(normalizeBookmark).filter(Boolean);
    if (!student) throw new Error("Student not found");
    const completed = attempts.filter((attempt) => attempt.status === "completed").length;
    elements.adminDetail.innerHTML = `<section class="admin-profile">
      <p class="eyebrow">STUDENT PROGRESS</p>
      <h2>${escapeHtml(student.name)}</h2>
      <p>共用 EdmundEducation 學生帳戶</p>
      <div class="admin-metrics">
        <div class="admin-metric"><strong>${escapeHtml(attempts.length)}</strong><span>練習次數</span></div>
        <div class="admin-metric"><strong>${escapeHtml(completed)}</strong><span>完成次數</span></div>
        <div class="admin-metric"><strong>${escapeHtml(bookmarks.length)}</strong><span>書簽數量</span></div>
      </div>
      <h3 class="admin-subheading">練習記錄</h3>
      <div class="history-list">${attemptHistoryHtml(attempts, { allowResume: false })}</div>
    </section>`;
  } catch (error) {
    console.warn("Sentence Structure admin student detail failed", error);
    elements.adminDetail.innerHTML = '<p class="empty-state">未能載入這位學生的記錄。</p>';
  }
}

function handleClick(event) {
  const openLessonButton = event.target.closest("[data-open-lesson]");
  if (openLessonButton) return openLesson(openLessonButton.dataset.openLesson);
  if (event.target.closest("[data-open-bookmarks-card], [data-open-bookmarks]")) return openBookmarks();
  if (event.target.closest("[data-back-to-dashboard], [data-bookmarks-back], [data-finish-exercise], [data-dashboard-button]")) return openDashboard();
  if (event.target.closest("[data-admin-students-button]")) return openAdminDashboard();

  const step = event.target.closest("[data-step]");
  if (step) return setLessonPage(Number(step.dataset.step));
  if (event.target.closest("[data-lesson-prev]")) return setLessonPage(state.lessonPage - 1);
  if (event.target.closest("[data-lesson-next]")) return setLessonPage(state.lessonPage + 1);
  if (event.target.closest("[data-submit-partial]")) return submitExercise("partial");
  if (event.target.closest("[data-submit-all]")) return submitExercise("all");
  if (event.target.closest("[data-next-round]")) return startNextRound();
  if (event.target.closest("[data-review-completed]")) {
    state.exercise.reviewCompleted = !state.exercise.reviewCompleted;
    return renderExercisePage(getLesson(), { preserveScroll: true });
  }

  const bookmarkButton = event.target.closest("[data-toggle-question-bookmark]");
  if (bookmarkButton) {
    const questionId = bookmarkButton.dataset.toggleQuestionBookmark;
    const reveal = questionState(questionId).reveal === true;
    return toggleBookmark(state.lessonId, questionId, reveal);
  }

  const resume = event.target.closest("[data-resume-attempt]");
  if (resume) return resumeAttempt(resume.dataset.resumeAttempt);

  const openBookmark = event.target.closest("[data-open-bookmark]");
  if (openBookmark) {
    const [lessonId, questionId] = String(openBookmark.dataset.openBookmark || "").split("|");
    return openLesson(lessonId, { page: 4, questionId });
  }
  const removeBookmark = event.target.closest("[data-remove-bookmark]");
  if (removeBookmark) {
    const [lessonId, questionId] = String(removeBookmark.dataset.removeBookmark || "").split("|");
    return toggleBookmark(lessonId, questionId);
  }

  const adminStudent = event.target.closest("[data-admin-student]");
  if (adminStudent) return openAdminStudent(adminStudent.dataset.adminStudent);
  if (event.target.closest("[data-refresh-history]")) return openDashboard({ force: true });
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.passwordToggle.addEventListener("click", () => {
    const showing = elements.password.type === "text";
    elements.password.type = showing ? "password" : "text";
    elements.passwordToggle.textContent = showing ? "顯示" : "隱藏";
    elements.passwordToggle.setAttribute("aria-label", showing ? "顯示密碼" : "隱藏密碼");
    elements.passwordToggle.setAttribute("aria-pressed", String(!showing));
  });
  elements.logout.addEventListener("click", logout);
  document.addEventListener("click", handleClick);
  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-answer-input]")) syncExerciseButtons();
  });
  elements.adminSearch?.addEventListener("input", renderAdminStudents);
  window.addEventListener("pagehide", pauseExerciseClock);
}

async function checkHealth() {
  try {
    const response = await fetch(`${workerBaseUrl()}/v1/health`, { credentials: "omit" });
    if (!response.ok) throw new Error("Health unavailable");
    setConnection("可以登入", "online");
  } catch {
    setConnection("服務連接中", "checking");
  }
}

async function initialise() {
  bindEvents();
  renderLessonChoices();
  if (!lessonList().length) {
    setConnection("教材未載入", "error");
    setStatus(elements.loginStatus, "句子結構教材暫時未能載入，請重新整理頁面。", "error");
    elements.loginButton.disabled = true;
    return;
  }
  checkHealth();
  const restored = await validateRestoredSession();
  if (!restored) {
    showView("login");
    return;
  }
  setConnection("已安全連接", "online");
  if (state.user.role === "admin") await openAdminDashboard();
  else await openDashboard();
}

initialise().catch((error) => {
  console.error("Sentence Structure initialisation failed", error);
  clearSession();
  setConnection("服務暫時離線", "error");
  setStatus(elements.loginStatus, "系統未能完成載入，請重新整理頁面。", "error");
  showView("login");
});
