const CONFIG = window.EDMUND_SENTENCE_STRUCTURE_CONFIG || {};
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const CONTENT = window.EDMUND_SENTENCE_STRUCTURE_DATA || { version: "missing", lessons: [] };

const SESSION_KEY = "edmund-sentence-structure-session-v1";
const PROGRESS_PANEL_PREFERENCE_KEY = "edmund-sentence-structure-progress-panel-v1";
const CUMULATIVE_PROGRESS_PREFERENCE_KEY = "edmund-sentence-structure-cumulative-progress-v1";
const SECTION_BOOKMARK_ID = "__section__";
const MAX_BOOKMARKS = 20000;
const LESSON_PAGES = 4;
const ATTEMPT_PAGE_SIZE = 100;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SPELLING_EQUIVALENTS = Object.freeze({
  analyse: "analyze", analysed: "analyzed", analysing: "analyzing",
  apologise: "apologize", apologised: "apologized", apologising: "apologizing",
  behaviour: "behavior", behaviours: "behaviors",
  cancelled: "canceled", cancelling: "canceling",
  catalogue: "catalog", catalogues: "catalogs",
  centre: "center", centres: "centers",
  colour: "color", colours: "colors", coloured: "colored", colouring: "coloring", colourful: "colorful", colourless: "colorless",
  counsellor: "counselor", counsellors: "counselors",
  defence: "defense", defences: "defenses",
  dialogue: "dialog", dialogues: "dialogs",
  favour: "favor", favours: "favors", favourite: "favorite", favourites: "favorites",
  honour: "honor", honours: "honors", honoured: "honored",
  labour: "labor", labours: "labors",
  licence: "license", licences: "licenses",
  neighbour: "neighbor", neighbours: "neighbors", neighbourhood: "neighborhood",
  organise: "organize", organised: "organized", organises: "organizes", organising: "organizing",
  organisation: "organization", organisations: "organizations",
  practise: "practice", practised: "practiced", practises: "practices", practising: "practicing",
  programme: "program", programmes: "programs",
  realise: "realize", realised: "realized", realises: "realizes", realising: "realizing",
  recognise: "recognize", recognised: "recognized", recognises: "recognizes", recognising: "recognizing",
  theatre: "theater", theatres: "theaters",
  travelled: "traveled", travelling: "traveling", traveller: "traveler", travellers: "travelers"
});

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
  lessonCount: document.querySelector("[data-lesson-count]"),
  lessonChoiceGrid: document.querySelector("[data-lesson-choice-grid]"),
  lessonSearchForm: document.querySelector("[data-lesson-search-form]"),
  lessonSearchInput: document.querySelector("[data-lesson-search-input]"),
  lessonSearchSummary: document.querySelector("[data-lesson-search-summary]"),
  lessonSearchResults: document.querySelector("[data-lesson-search-results]"),
  lessonSearchClear: document.querySelector("[data-clear-lesson-search]"),
  historyList: document.querySelector("[data-history-list]"),
  progressToggle: document.querySelector("[data-sentence-progress-toggle]"),
  progressToggleLabel: document.querySelector("[data-sentence-progress-toggle-label]"),
  progressPanel: document.querySelector("[data-sentence-progress-panel]"),
  progressChart: document.querySelector("[data-sentence-progress-chart]"),
  cumulativeProgressToggle: document.querySelector("[data-toggle-sentence-cumulative]"),
  cumulativeProgressLegend: document.querySelector("[data-sentence-cumulative-legend]"),
  progressPeriodTotal: document.querySelector("[data-sentence-progress-period-total]"),
  progressAllTotal: document.querySelector("[data-sentence-progress-all-total]"),
  progressActiveDays: document.querySelector("[data-sentence-progress-active-days]"),
  progressDayPanel: document.querySelector("[data-sentence-progress-day-panel]"),
  progressDayTitle: document.querySelector("[data-sentence-progress-day-title]"),
  progressDayList: document.querySelector("[data-sentence-progress-day-list]"),
  timeProgressChart: document.querySelector("[data-sentence-time-progress-chart]"),
  timeProgressAllTotal: document.querySelector("[data-sentence-time-all-total]"),
  timeProgressPeriodTotal: document.querySelector("[data-sentence-time-period-total]"),
  timeProgressAverage: document.querySelector("[data-sentence-time-average]"),
  timeProgressMedian: document.querySelector("[data-sentence-time-median]"),
  timeProgressMaximum: document.querySelector("[data-sentence-time-maximum]"),
  timeProgressDayPanel: document.querySelector("[data-sentence-time-day-panel]"),
  timeProgressDayTitle: document.querySelector("[data-sentence-time-day-title]"),
  timeProgressDayList: document.querySelector("[data-sentence-time-day-list]"),
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
  syncedBookmarks: [],
  attempts: [],
  dashboardLoaded: false,
  attemptHistoryComplete: true,
  progressPanelExpanded: false,
  progressRange: "month",
  selectedProgressDay: "",
  showCumulativeProgress: false,
  timeProgressRange: "month",
  selectedTimeProgressDay: "",
  bookmarkSaveQueue: Promise.resolve(),
  bookmarkWriteRevision: 0,
  saveInFlight: false,
  exercisePersistTimer: null,
  toastTimer: null,
  adminStudents: [],
  selectedAdminStudentId: "",
  requestedHomeworkLessonOpened: false
};

let lessonSearchIndexCache = null;

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

function progressPanelPreferenceStorageKey() {
  const userId = String(state.user?.id || "").trim();
  return userId ? `${PROGRESS_PANEL_PREFERENCE_KEY}:${userId}` : "";
}

function readProgressPanelPreference() {
  const key = progressPanelPreferenceStorageKey();
  if (!key) return false;
  try { return localStorage.getItem(key) === "expanded"; } catch { return false; }
}

function writeProgressPanelPreference(expanded) {
  const key = progressPanelPreferenceStorageKey();
  if (!key) return;
  try { localStorage.setItem(key, expanded ? "expanded" : "collapsed"); } catch { /* Preference can remain in memory. */ }
}

function cumulativeProgressPreferenceStorageKey() {
  const userId = String(state.user?.id || "").trim();
  return userId ? `${CUMULATIVE_PROGRESS_PREFERENCE_KEY}:${userId}` : "";
}

function readCumulativeProgressPreference() {
  const key = cumulativeProgressPreferenceStorageKey();
  if (!key) return false;
  try { return localStorage.getItem(key) === "visible"; } catch { return false; }
}

function writeCumulativeProgressPreference(visible) {
  const key = cumulativeProgressPreferenceStorageKey();
  if (!key) return;
  try { localStorage.setItem(key, visible ? "visible" : "hidden"); } catch { /* Preference can remain in memory. */ }
}

function toggleCumulativeProgress() {
  state.showCumulativeProgress = !state.showCumulativeProgress;
  writeCumulativeProgressPreference(state.showCumulativeProgress);
  renderProgressDashboard();
}

function renderProgressPanelDisclosure() {
  if (!elements.progressToggle || !elements.progressPanel) return;
  const expanded = state.progressPanelExpanded === true;
  elements.progressToggle.setAttribute("aria-expanded", String(expanded));
  elements.progressPanel.hidden = !expanded;
  if (elements.progressToggleLabel) elements.progressToggleLabel.textContent = expanded ? "收起 −" : "展開 ＋";
}

function toggleProgressPanel() {
  state.progressPanelExpanded = !state.progressPanelExpanded;
  writeProgressPanelPreference(state.progressPanelExpanded);
  renderProgressPanelDisclosure();
  if (state.progressPanelExpanded) renderProgressDashboard();
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

async function apiJson(path, options = {}, includeAuth = true, authToken = state.authToken) {
  const headers = new Headers(options.headers || {});
  if (includeAuth && authToken) headers.set("Authorization", `Bearer ${authToken}`);
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
    if (includeAuth && response.status === 401 && authToken === state.authToken) {
      if (state.user?.role === "student") window.EdmundSystemNav?.forgetStudentSession();
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
  window.clearTimeout(state.exercisePersistTimer);
  state.exercisePersistTimer = null;
  pauseExerciseClock();
  state.user = null;
  state.authToken = "";
  state.lessonId = "";
  state.lessonPage = 1;
  state.exercise = null;
  state.bookmarks = [];
  state.syncedBookmarks = [];
  state.attempts = [];
  state.dashboardLoaded = false;
  state.attemptHistoryComplete = true;
  state.progressPanelExpanded = false;
  state.progressRange = "month";
  state.selectedProgressDay = "";
  state.showCumulativeProgress = false;
  state.timeProgressRange = "month";
  state.selectedTimeProgressDay = "";
  state.bookmarkWriteRevision += 1;
  state.bookmarkSaveQueue = Promise.resolve();
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
    sharedAccess: row.access && typeof row.access === "object" && !Array.isArray(row.access) ? row.access : undefined,
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
    if (!isAdmin) {
      window.EdmundSystemNav?.rememberStudentSession({
        token: result.token,
        id: result.user.id,
        name: result.user.name,
        role: "student",
        access: result.sharedAccess
      });
    }
    saveSession();
    elements.loginForm.reset();
    setStatus(elements.loginStatus, "");
    setConnection("已安全連接", "online");
    if (state.user.role === "admin") {
      await openAdminDashboard();
      showToast("管理員登入成功。");
    } else {
      await openDashboard();
      openRequestedHomeworkLesson();
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
  if (role === "student") window.EdmundSystemNav?.forgetStudentSession();
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
  setConnection("已連線", "online");
  showView("login");
}

function normalizeBookmark(value) {
  if (!isPlainObject(value)) return null;
  const lessonId = String(value.lessonId || value.lesson_id || "");
  const questionId = String(value.questionId || value.question_id || "");
  const sectionBookmark = questionId === SECTION_BOOKMARK_ID;
  if (!getLesson(lessonId) || (!sectionBookmark && !getQuestion(lessonId, questionId))) return null;
  return {
    lessonId,
    questionId,
    includeAnswer: !sectionBookmark && (value.includeAnswer === true || value.include_answer === true),
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

async function loadAllAttempts(authToken = state.authToken) {
  const rows = [];
  const seen = new Set();
  let complete = true;
  for (let page = 1; page <= 100; page += 1) {
    const payload = await apiJson(`/v1/attempts?page=${page}&pageSize=${ATTEMPT_PAGE_SIZE}`, {}, true, authToken);
    const attempts = Array.isArray(payload?.attempts) ? payload.attempts : [];
    for (const attempt of attempts) {
      const id = String(attempt?.id || "");
      if (id && !seen.has(id)) {
        seen.add(id);
        rows.push(attempt);
      }
    }
    if (payload?.hasMore !== true || attempts.length < ATTEMPT_PAGE_SIZE) break;
    if (page === 100) complete = false;
  }
  return { attempts: rows, complete };
}

async function loadDashboardData({ force = false } = {}) {
  if (state.user?.role !== "student") return;
  if (state.dashboardLoaded && !force) return;
  const userId = String(state.user?.id || "");
  const authToken = String(state.authToken || "");
  const [attemptPayload, bookmarkPayload] = await Promise.all([
    loadAllAttempts(authToken),
    apiJson("/v1/bookmarks", {}, true, authToken)
  ]);
  if (String(state.user?.id || "") !== userId || String(state.authToken || "") !== authToken) return;
  state.attempts = (Array.isArray(attemptPayload?.attempts) ? attemptPayload.attempts : [])
    .map(normalizeAttempt)
    .filter((attempt) => attempt.id && getLesson(attempt.lessonId));
  state.attemptHistoryComplete = attemptPayload?.complete !== false;
  state.bookmarks = (Array.isArray(bookmarkPayload?.bookmarks) ? bookmarkPayload.bookmarks : [])
    .map(normalizeBookmark)
    .filter(Boolean)
    .slice(0, MAX_BOOKMARKS);
  state.syncedBookmarks = state.bookmarks.map((bookmark) => ({ ...bookmark }));
  state.dashboardLoaded = true;
}

async function openDashboard({ force = false } = {}) {
  if (state.user?.role !== "student") return;
  const userId = String(state.user?.id || "");
  const authToken = String(state.authToken || "");
  pauseExerciseClock();
  state.progressPanelExpanded = readProgressPanelPreference();
  state.showCumulativeProgress = readCumulativeProgressPreference();
  renderProgressPanelDisclosure();
  showView("dashboard");
  elements.dashboardWelcome.textContent = `${state.user.name}，選擇一個句型，由概念開始，再完成 50 題練習。`;
  renderLessonChoices();
  if (!state.dashboardLoaded || force) elements.historyList.innerHTML = loadingHtml();
  try {
    await loadDashboardData({ force });
    if (String(state.user?.id || "") !== userId || String(state.authToken || "") !== authToken) return;
    renderLessonChoices();
    renderProgressDashboard();
    renderAttemptHistory();
  } catch (error) {
    if (String(state.user?.id || "") !== userId || String(state.authToken || "") !== authToken) return;
    console.warn("Sentence Structure dashboard failed", error);
    elements.historyList.innerHTML = '<p class="empty-state">未能載入練習記錄，請稍後按「重新整理」。</p>';
    renderProgressDashboard();
    showToast("未能同步練習記錄。", "error");
  }
}

function openRequestedHomeworkLesson() {
  if (state.requestedHomeworkLessonOpened || state.user?.role !== "student") return false;
  const lessonId = String(new URLSearchParams(window.location.search).get("lesson") || "").trim();
  if (!lessonId) return false;
  state.requestedHomeworkLessonOpened = true;
  if (lessonId.length > 80 || !getLesson(lessonId)) {
    showToast("這個 Sentence Structure 練習目前不存在。", "error");
    return false;
  }
  openLesson(lessonId, { page: 1 });
  return true;
}

function renderLessonChoices() {
  if (elements.lessonCount) elements.lessonCount.textContent = String(lessonList().length);
  const cards = lessonList().map((lesson, index) => {
    const complete = state.attempts.some((attempt) => (
      attempt.lessonId === lesson.id
      && attempt.status === "completed"
      && attempt.correctCount >= Math.min(50, attempt.totalCount || 50)
    ));
    const bookmarked = isSectionBookmarked(lesson.id);
    return `
      <article class="lesson-choice-card ${complete ? "is-complete" : ""}">
        <button class="lesson-choice ${complete ? "is-complete" : ""}" type="button" data-open-lesson="${escapeHtml(lesson.id)}" data-number="${index + 1}" data-tone="${complete ? "gold" : index % 2 ? "violet" : "blue"}">
          <h2>${escapeHtml(lessonTitle(lesson))}<span>${escapeHtml(lessonEnglishTitle(lesson))}</span></h2>
          ${complete ? '<span class="lesson-choice-complete">✓ 50 / 50 題已完成</span>' : ""}
        </button>
        <button class="lesson-section-bookmark" type="button" data-toggle-section-bookmark="${escapeHtml(lesson.id)}" aria-pressed="${bookmarked}" aria-label="${bookmarked ? "移除句型書簽" : "收藏整個句型"}">${bookmarked ? "★" : "☆"}</button>
      </article>
    `;
  }).join("");
  const sectionBookmarkCount = state.bookmarks.filter((bookmark) => bookmark.questionId === SECTION_BOOKMARK_ID).length;
  const questionBookmarkCount = state.bookmarks.length - sectionBookmarkCount;
  elements.lessonChoiceGrid.innerHTML = `<button class="lesson-choice" type="button" data-open-bookmarks-card data-number="★" data-tone="bookmark">
      <h2>書簽<span>Bookmarks</span></h2>
      <span class="choice-meta"><span>${escapeHtml(sectionBookmarkCount)} 個句型</span><span>${escapeHtml(questionBookmarkCount)} 道題目</span><span>跟隨帳戶同步</span></span>
    </button>${cards}`;
}

function collectLessonSearchStrings(value, output = [], key = "") {
  if (value == null || ["source", "image", "illustration", "src", "file", "sourcePage", "answerSourcePage"].includes(key)) return output;
  if (typeof value === "string") {
    const text = value.replace(/\s+/g, " ").trim();
    if (text) output.push(text);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectLessonSearchStrings(item, output, key));
  } else if (typeof value === "object") {
    Object.entries(value).forEach(([childKey, item]) => collectLessonSearchStrings(item, output, childKey));
  }
  return output;
}

function normalizeLessonSearchText(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}

function lessonSearchIndex() {
  if (lessonSearchIndexCache) return lessonSearchIndexCache;
  const pageFields = [
    ["formula", "formulas", "example", "exampleZh", "examples", "meaning"],
    ["benefits"],
    ["rules"],
    ["instructions"]
  ];
  const entries = [];
  for (const lesson of lessonList()) {
    const titleTexts = [lessonTitle(lesson), lessonEnglishTitle(lesson), lesson.slug].filter(Boolean);
    entries.push({ lessonId: lesson.id, page: 1, kind: "title", title: lessonTitle(lesson), titleEn: lessonEnglishTitle(lesson), texts: titleTexts });
    pageFields.forEach((fields, index) => {
      const texts = fields.flatMap((field) => collectLessonSearchStrings(lesson[field]));
      if (texts.length) entries.push({ lessonId: lesson.id, page: index + 1, kind: "page", title: lessonTitle(lesson), titleEn: lessonEnglishTitle(lesson), texts });
    });
    (lesson.questions || []).forEach((question, index) => {
      const texts = collectLessonSearchStrings(question);
      if (texts.length) entries.push({ lessonId: lesson.id, page: 4, questionId: String(question.id || ""), kind: "question", questionNumber: index + 1, title: lessonTitle(lesson), titleEn: lessonEnglishTitle(lesson), texts });
    });
  }
  lessonSearchIndexCache = entries;
  return entries;
}

function searchLessons(query) {
  const tokens = normalizeLessonSearchText(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  return lessonSearchIndex().filter((entry) => {
    const haystack = normalizeLessonSearchText(entry.texts.join(" "));
    return tokens.every((token) => haystack.includes(token));
  });
}

function renderLessonSearch() {
  if (!elements.lessonSearchResults || !elements.lessonSearchSummary) return;
  const query = String(elements.lessonSearchInput?.value || "").trim();
  if (elements.lessonSearchClear) elements.lessonSearchClear.hidden = !query;
  if (!query) {
    elements.lessonSearchResults.hidden = true;
    elements.lessonSearchResults.innerHTML = "";
    elements.lessonSearchSummary.textContent = "尚未輸入關鍵字。可搜尋全部句子結構的四個學習頁面及練習題。";
    return;
  }
  const matches = searchLessons(query);
  const visibleMatches = matches.slice(0, 80);
  elements.lessonSearchSummary.textContent = matches.length
    ? `找到 ${matches.length} 個相符位置${matches.length > visibleMatches.length ? `，先顯示首 ${visibleMatches.length} 個` : ""}。按結果可直接前往相關頁面或題目。`
    : "找不到相符內容，請嘗試其他中英文關鍵字。";
  elements.lessonSearchResults.hidden = false;
  elements.lessonSearchResults.innerHTML = visibleMatches.map((entry) => {
    const queryTokens = normalizeLessonSearchText(query).split(" ").filter(Boolean);
    const preview = entry.texts.find((text) => queryTokens.some((token) => normalizeLessonSearchText(text).includes(token))) || entry.texts[0] || "";
    const place = entry.kind === "question" ? `第 4 頁 · 第 ${entry.questionNumber} 題` : `第 ${entry.page} 頁`;
    const title = [entry.title, entry.titleEn].filter(Boolean).join(" · ");
    return `<button class="lesson-search-result" type="button" data-lesson-search-result data-search-lesson="${escapeHtml(entry.lessonId)}" data-search-page="${entry.page}" data-search-question="${escapeHtml(entry.questionId || "")}"><span>${escapeHtml(place)}</span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(preview.slice(0, 180))}</small></button>`;
  }).join("") || '<div class="lesson-search-empty"><strong>沒有搜尋結果</strong><span>請縮短關鍵字，或改用另一個中英文詞語。</span></div>';
}

function clearLessonSearch() {
  if (!elements.lessonSearchInput) return;
  elements.lessonSearchInput.value = "";
  renderLessonSearch();
  elements.lessonSearchInput.focus();
}

function localDayKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function questionActivityRows(attempts = state.attempts) {
  const rows = [];
  for (const attempt of attempts) {
    const rounds = Array.isArray(attempt.result?.rounds) ? attempt.result.rounds : [];
    const represented = new Set();
    for (const round of rounds) {
      const time = Date.parse(round?.submittedAt || "");
      if (!Number.isFinite(time)) continue;
      const correctIds = new Set(Array.isArray(round.correctIds) ? round.correctIds.map(String) : []);
      const incorrectIds = new Set(Array.isArray(round.incorrectIds) ? round.incorrectIds.map(String) : []);
      for (const rawQuestionId of new Set(Array.isArray(round.checkedIds) ? round.checkedIds : [])) {
        const questionId = String(rawQuestionId || "");
        const question = getQuestion(attempt.lessonId, questionId);
        if (!question) continue;
        represented.add(questionId);
        rows.push({
          attemptId: attempt.id,
          lessonId: attempt.lessonId,
          questionId,
          round: Number(round.round || 1),
          time,
          status: correctIds.has(questionId) ? "correct" : incorrectIds.has(questionId) ? "wrong" : "checked"
        });
      }
    }

    if (!rounds.length) {
      const time = Date.parse(attempt.completedAt || attempt.updatedAt || attempt.startedAt || "");
      if (!Number.isFinite(time)) continue;
      const correctIds = Array.isArray(attempt.result?.correctIds) ? attempt.result.correctIds : [];
      for (const rawQuestionId of correctIds) {
        const questionId = String(rawQuestionId || "");
        if (represented.has(questionId) || !getQuestion(attempt.lessonId, questionId)) continue;
        rows.push({
          attemptId: attempt.id,
          lessonId: attempt.lessonId,
          questionId,
          round: Number(attempt.roundNumber || 1),
          time,
          status: "correct"
        });
      }
    }
  }
  const ordered = rows.sort((a, b) => a.time - b.time || a.lessonId.localeCompare(b.lessonId) || a.questionId.localeCompare(b.questionId));
  const unique = new Map();
  for (const row of ordered) {
    const key = `${row.lessonId}\u0000${row.questionId}`;
    const first = unique.get(key);
    if (!first) {
      unique.set(key, { ...row });
      continue;
    }
    if (row.status === "correct" && first.status !== "correct") {
      first.status = "correct";
      first.round = row.round;
      first.attemptId = row.attemptId;
      first.correctedAt = row.time;
    }
  }
  return [...unique.values()];
}

function progressRangeStart(rangeKey, rows) {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const addDays = (date, days) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  };
  if (rangeKey === "week") return addDays(end, -6);
  if (rangeKey === "month") return addDays(end, -29);
  if (rangeKey === "half-year") return addDays(end, -181);
  if (rangeKey === "ytd") return new Date(end.getFullYear(), 0, 1);
  if (rangeKey === "year") return addDays(end, -364);
  if (rangeKey === "all" && rows.length) {
    const first = new Date(rows[0].time);
    return new Date(first.getFullYear(), first.getMonth(), first.getDate());
  }
  return addDays(end, -6);
}

function buildQuestionProgressSeries(rangeKey = state.progressRange) {
  const activity = questionActivityRows();
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eligibleActivity = activity.filter((row) => {
    const date = new Date(row.time);
    if (!Number.isFinite(date.getTime())) return false;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()) <= end;
  });
  const start = progressRangeStart(rangeKey, eligibleActivity);
  const buckets = new Map();
  let cumulativeBeforeStart = 0;
  for (const row of eligibleActivity) {
    const date = new Date(row.time);
    const rowDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (rowDate < start) {
      cumulativeBeforeStart += 1;
      continue;
    }
    const key = localDayKey(rowDate);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  const points = [];
  let cumulative = cumulativeBeforeStart;
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = new Date(cursor);
    const key = localDayKey(date);
    const total = buckets.get(key) || 0;
    cumulative += total;
    points.push({ date, key, total, cumulative });
  }
  return {
    activity: eligibleActivity,
    points,
    cumulativeBeforeStart,
    periodTotal: points.reduce((sum, point) => sum + point.total, 0),
    allTotal: eligibleActivity.length,
    activeDays: points.filter((point) => point.total > 0).length
  };
}

function compactProgressDate(date) {
  return date.toLocaleDateString("en-HK", { month: "short", day: "numeric" });
}

function questionProgressChartSvg(series) {
  const width = 900;
  const height = 320;
  const dimensions = { left: 58, right: 28, top: 28, bottom: 52 };
  const chartWidth = width - dimensions.left - dimensions.right;
  const chartHeight = height - dimensions.top - dimensions.bottom;
  const points = series.points;
  const showCumulative = state.showCumulativeProgress === true;
  const maximum = Math.max(5, ...points.flatMap((point) => [
    point.total,
    ...(showCumulative ? [point.cumulative] : [])
  ]));
  const yMax = Math.max(5, Math.ceil(maximum / 5) * 5);
  const xFor = (index) => dimensions.left + (chartWidth * index / Math.max(points.length - 1, 1));
  const yFor = (value) => dimensions.top + chartHeight - (chartHeight * value / yMax);
  const coords = points.map((point, index) => ({ point, x: xFor(index), y: yFor(point.total) }));
  const path = coords.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const cumulativeCoords = points.map((point, index) => ({ point, x: xFor(index), y: yFor(point.cumulative) }));
  const cumulativePath = cumulativeCoords.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const yLabels = [...new Set([0, Math.round(yMax / 2), yMax])];
  const grid = yLabels.map((value) => `
    <line x1="${dimensions.left}" y1="${yFor(value).toFixed(2)}" x2="${width - dimensions.right}" y2="${yFor(value).toFixed(2)}" stroke="rgba(49,95,179,.16)" stroke-width="1" />
    <text x="${dimensions.left - 12}" y="${(yFor(value) + 4).toFixed(2)}" text-anchor="end" fill="#68728a" font-size="13" font-weight="800">${value}</text>
  `).join("");
  const labelIndexes = points.length ? [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])] : [];
  const labels = labelIndexes.map((index) => `
    <text x="${xFor(index).toFixed(2)}" y="${height - 17}" text-anchor="middle" fill="#68728a" font-size="13" font-weight="800">${escapeHtml(compactProgressDate(points[index].date))}</text>
  `).join("");
  const hoverPoints = coords.map(({ point, x, y }) => {
    const boxX = Math.min(Math.max(x - 62, dimensions.left), width - dimensions.right - 124);
    const boxY = Math.max(dimensions.top + 4, y - 54);
    const interactionAttributes = point.total > 0
      ? `tabindex="0" role="button" aria-label="${escapeHtml(point.key)}，完成 ${escapeHtml(point.total)} 題" data-sentence-progress-day="${escapeHtml(point.key)}"`
      : 'aria-hidden="true"';
    return `<g class="sentence-chart-hover" ${interactionAttributes}>
      <circle class="sentence-chart-hit" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="15" />
      <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.5" fill="#315fb3" />
      <g class="sentence-chart-tooltip">
        <line x1="${x.toFixed(2)}" y1="${dimensions.top}" x2="${x.toFixed(2)}" y2="${height - dimensions.bottom}" stroke="rgba(23,33,58,.24)" stroke-width="1" stroke-dasharray="4 5" />
        <rect x="${boxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="124" height="40" rx="8" fill="#17213a" opacity=".94" />
        <text x="${(boxX + 10).toFixed(2)}" y="${(boxY + 17).toFixed(2)}" fill="#fff" font-size="11" font-weight="900">完成：${escapeHtml(point.total)} 題</text>
        <text x="${(boxX + 10).toFixed(2)}" y="${(boxY + 31).toFixed(2)}" fill="#dbe5f6" font-size="10" font-weight="800">${escapeHtml(point.key)}</text>
      </g>
    </g>`;
  }).join("");
  const cumulativeHoverPoints = showCumulative ? cumulativeCoords.map(({ point, x, y }) => {
    const boxX = Math.min(Math.max(x - 62, dimensions.left), width - dimensions.right - 124);
    const boxY = Math.max(dimensions.top + 4, y - 54);
    const interactionAttributes = point.total > 0
      ? `tabindex="0" role="button" aria-label="${escapeHtml(point.key)}，完成 ${escapeHtml(point.total)} 題，累積完成 ${escapeHtml(point.cumulative)} 題" data-sentence-progress-day="${escapeHtml(point.key)}" data-sentence-cumulative-point="${escapeHtml(point.key)}"`
      : point.cumulative > 0
        ? `tabindex="0" role="img" aria-label="${escapeHtml(point.key)}，累積完成 ${escapeHtml(point.cumulative)} 題" data-sentence-cumulative-point="${escapeHtml(point.key)}"`
        : 'aria-hidden="true"';
    return `<g class="sentence-chart-hover sentence-chart-cumulative" ${interactionAttributes}>
      <circle class="sentence-chart-hit" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="15" />
      <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.5" fill="#7e22ce" />
      <g class="sentence-chart-tooltip">
        <line x1="${x.toFixed(2)}" y1="${dimensions.top}" x2="${x.toFixed(2)}" y2="${height - dimensions.bottom}" stroke="rgba(126,34,206,.25)" stroke-width="1" stroke-dasharray="4 5" />
        <rect x="${boxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="124" height="40" rx="8" fill="#3b1465" opacity=".95" />
        <text x="${(boxX + 10).toFixed(2)}" y="${(boxY + 17).toFixed(2)}" fill="#fff" font-size="11" font-weight="900">累積：${escapeHtml(point.cumulative)} 題</text>
        <text x="${(boxX + 10).toFixed(2)}" y="${(boxY + 31).toFixed(2)}" fill="#eadcff" font-size="10" font-weight="800">${escapeHtml(point.key)}</text>
      </g>
    </g>`;
  }).join("") : "";
  const hasVisibleData = series.periodTotal > 0 || (showCumulative && points.some((point) => point.cumulative > 0));
  const empty = hasVisibleData ? "" : `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#68728a" font-size="20" font-weight="900">這個時段暫時未有完成題目</text>`;
  return `<rect x="0" y="0" width="${width}" height="${height}" fill="rgba(255,255,255,.62)" />
    ${grid}
    <line x1="${dimensions.left}" y1="${dimensions.top}" x2="${dimensions.left}" y2="${height - dimensions.bottom}" stroke="rgba(23,33,58,.16)" stroke-width="1.4" />
    <line x1="${dimensions.left}" y1="${height - dimensions.bottom}" x2="${width - dimensions.right}" y2="${height - dimensions.bottom}" stroke="rgba(23,33,58,.16)" stroke-width="1.4" />
    <polyline data-chart-series="daily" points="${path}" fill="none" stroke="#315fb3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    ${showCumulative ? `<polyline data-chart-series="cumulative" points="${cumulativePath}" fill="none" stroke="#7e22ce" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />` : ""}
    ${hoverPoints}${cumulativeHoverPoints}${labels}
    <text x="${dimensions.left}" y="19" fill="#162a5b" font-size="13" font-weight="900">完成題數</text>
    ${empty}`;
}

function renderProgressDayPanel(activity = questionActivityRows()) {
  if (!elements.progressDayPanel || !elements.progressDayList) return;
  const key = state.selectedProgressDay;
  elements.progressDayPanel.hidden = !key;
  if (!key) return;
  const rows = activity.filter((row) => localDayKey(row.time) === key);
  if (elements.progressDayTitle) elements.progressDayTitle.textContent = `${key} 完成題目（${rows.length} 題）`;
  elements.progressDayList.innerHTML = rows.length ? rows.map((row) => {
    const lesson = getLesson(row.lessonId);
    const question = getQuestion(row.lessonId, row.questionId);
    return `<div class="sentence-progress-day-row">
      <strong>${escapeHtml(lessonTitle(lesson))} · Question ${escapeHtml(question?.number || "")}</strong>
      <span>${escapeHtml(question?.prompt || question?.english || "")}</span>
      <em class="${row.status === "correct" ? "is-correct" : ""}">${row.status === "correct" ? "答對" : row.status === "wrong" ? "待改正" : "已提交"}</em>
    </div>`;
  }).join("") : '<p class="empty-state">這一天暫時未有完成題目。</p>';
}

function renderProgressDashboard() {
  document.querySelectorAll("[data-sentence-progress-range]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.sentenceProgressRange === state.progressRange));
  });
  const series = buildQuestionProgressSeries();
  if (elements.cumulativeProgressToggle) {
    elements.cumulativeProgressToggle.textContent = state.showCumulativeProgress ? "隱藏累積總數" : "顯示累積總數";
    elements.cumulativeProgressToggle.setAttribute("aria-pressed", String(state.showCumulativeProgress));
    elements.cumulativeProgressToggle.classList.toggle("is-active", state.showCumulativeProgress);
  }
  if (elements.cumulativeProgressLegend) elements.cumulativeProgressLegend.hidden = !state.showCumulativeProgress;
  if (elements.progressChart) elements.progressChart.innerHTML = questionProgressChartSvg(series);
  if (elements.progressPeriodTotal) elements.progressPeriodTotal.textContent = String(series.periodTotal);
  if (elements.progressAllTotal) elements.progressAllTotal.textContent = String(series.allTotal);
  if (elements.progressActiveDays) elements.progressActiveDays.textContent = String(series.activeDays);
  renderProgressDayPanel(series.activity);
  renderSentenceTimeDashboard();
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

function medianDuration(values) {
  const sorted = values
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function timedSentenceAttempts(attempts = state.attempts) {
  return attempts.map((attempt) => ({
    attempt,
    durationMs: Number(attempt?.durationMs || 0),
    time: Date.parse(attempt?.completedAt || attempt?.updatedAt || attempt?.startedAt || "")
  })).filter((row) => (
    Number.isFinite(row.durationMs)
    && row.durationMs > 0
    && Number.isFinite(row.time)
  )).sort((a, b) => a.time - b.time || a.attempt.id.localeCompare(b.attempt.id));
}

function buildSentenceTimeSeries(rangeKey = state.timeProgressRange) {
  const rows = timedSentenceAttempts();
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const timedRows = rows.filter((row) => {
    const date = new Date(row.time);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()) <= end;
  });
  const start = progressRangeStart(rangeKey, timedRows);
  const buckets = new Map();
  for (const row of timedRows) {
    const date = new Date(row.time);
    const rowDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (rowDate < start) continue;
    const key = localDayKey(rowDate);
    buckets.set(key, (buckets.get(key) || 0) + row.durationMs);
  }
  const points = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = new Date(cursor);
    const key = localDayKey(date);
    const totalMs = buckets.get(key) || 0;
    points.push({ date, key, totalMs, minutes: totalMs / 60000 });
  }
  const allDurations = timedRows.map((row) => row.durationMs);
  const allTotalMs = allDurations.reduce((sum, value) => sum + value, 0);
  return {
    points,
    timedRows,
    stats: {
      allTotalMs,
      periodTotalMs: points.reduce((sum, point) => sum + point.totalMs, 0),
      averageMs: allDurations.length ? allTotalMs / allDurations.length : 0,
      medianMs: medianDuration(allDurations),
      maximumMs: Math.max(0, ...allDurations)
    }
  };
}

function sentenceTimeProgressChartSvg(series) {
  const width = 900;
  const height = 320;
  const dimensions = { left: 58, right: 28, top: 28, bottom: 52 };
  const chartWidth = width - dimensions.left - dimensions.right;
  const chartHeight = height - dimensions.top - dimensions.bottom;
  const points = series.points;
  const maximum = Math.max(5, ...points.map((point) => point.minutes));
  const yMax = Math.max(5, Math.ceil(maximum / 5) * 5);
  const xFor = (index) => dimensions.left + (chartWidth * index / Math.max(points.length - 1, 1));
  const yFor = (value) => dimensions.top + chartHeight - (chartHeight * value / yMax);
  const coords = points.map((point, index) => ({ point, x: xFor(index), y: yFor(point.minutes) }));
  const path = coords.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const yLabels = [...new Set([0, Math.round(yMax / 2), yMax])];
  const grid = yLabels.map((value) => `
    <line x1="${dimensions.left}" y1="${yFor(value).toFixed(2)}" x2="${width - dimensions.right}" y2="${yFor(value).toFixed(2)}" stroke="rgba(255,145,77,.22)" stroke-width="1" />
    <text x="${dimensions.left - 12}" y="${(yFor(value) + 4).toFixed(2)}" text-anchor="end" fill="#68728a" font-size="13" font-weight="800">${value}</text>
  `).join("");
  const labelIndexes = points.length ? [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])] : [];
  const labels = labelIndexes.map((index) => `
    <text x="${xFor(index).toFixed(2)}" y="${height - 17}" text-anchor="middle" fill="#68728a" font-size="13" font-weight="800">${escapeHtml(compactProgressDate(points[index].date))}</text>
  `).join("");
  const hoverPoints = coords.map(({ point, x, y }) => {
    const boxX = Math.min(Math.max(x - 70, dimensions.left), width - dimensions.right - 140);
    const boxY = Math.max(dimensions.top + 4, y - 54);
    const interactionAttributes = point.totalMs > 0
      ? `tabindex="0" role="button" aria-label="${escapeHtml(point.key)}，練習 ${escapeHtml(formatDuration(point.totalMs))}" data-sentence-time-day="${escapeHtml(point.key)}"`
      : 'aria-hidden="true"';
    return `<g class="sentence-chart-hover sentence-time-chart-hover" ${interactionAttributes}>
      <circle class="sentence-chart-hit" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="15" />
      <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.5" fill="#ff914d" />
      <g class="sentence-chart-tooltip">
        <line x1="${x.toFixed(2)}" y1="${dimensions.top}" x2="${x.toFixed(2)}" y2="${height - dimensions.bottom}" stroke="rgba(255,145,77,.34)" stroke-width="1" stroke-dasharray="4 5" />
        <rect x="${boxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="140" height="40" rx="8" fill="#572c16" opacity=".95" />
        <text x="${(boxX + 10).toFixed(2)}" y="${(boxY + 17).toFixed(2)}" fill="#fff" font-size="11" font-weight="900">時間：${escapeHtml(formatDuration(point.totalMs))}</text>
        <text x="${(boxX + 10).toFixed(2)}" y="${(boxY + 31).toFixed(2)}" fill="#ffe3d2" font-size="10" font-weight="800">${escapeHtml(point.key)}</text>
      </g>
    </g>`;
  }).join("");
  const empty = series.stats.periodTotalMs > 0 ? "" : `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#68728a" font-size="20" font-weight="900">這個時段暫時未有練習時間紀錄</text>`;
  return `<rect x="0" y="0" width="${width}" height="${height}" fill="rgba(255,255,255,.62)" />
    ${grid}
    <line x1="${dimensions.left}" y1="${dimensions.top}" x2="${dimensions.left}" y2="${height - dimensions.bottom}" stroke="rgba(23,33,58,.16)" stroke-width="1.4" />
    <line x1="${dimensions.left}" y1="${height - dimensions.bottom}" x2="${width - dimensions.right}" y2="${height - dimensions.bottom}" stroke="rgba(23,33,58,.16)" stroke-width="1.4" />
    <polyline data-chart-series="time" points="${path}" fill="none" stroke="#ff914d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    ${hoverPoints}${labels}
    <text x="${dimensions.left}" y="19" fill="#162a5b" font-size="13" font-weight="900">分鐘</text>
    ${empty}`;
}

function renderSentenceTimeDayPanel(series = buildSentenceTimeSeries()) {
  if (!elements.timeProgressDayPanel || !elements.timeProgressDayList) return;
  const key = state.selectedTimeProgressDay;
  elements.timeProgressDayPanel.hidden = !key;
  if (!key) return;
  const rows = series.timedRows.filter((row) => localDayKey(row.time) === key);
  const totalMs = rows.reduce((sum, row) => sum + row.durationMs, 0);
  if (elements.timeProgressDayTitle) {
    elements.timeProgressDayTitle.textContent = `${key} 練習時間（${formatDuration(totalMs)}）`;
  }
  elements.timeProgressDayList.innerHTML = rows.length ? rows.map((row) => {
    const lesson = getLesson(row.attempt.lessonId);
    const status = row.attempt.status === "completed" ? "已完成" : "進行中";
    return `<div class="sentence-progress-day-row">
      <strong>${escapeHtml(lessonTitle(lesson))}</strong>
      <span>${escapeHtml(formatDateTime(row.time))} · ${escapeHtml(status)} · ${escapeHtml(row.attempt.correctCount)}/${escapeHtml(row.attempt.totalCount)} 題</span>
      <em class="is-time">${escapeHtml(formatDuration(row.durationMs))}</em>
    </div>`;
  }).join("") : '<p class="empty-state">這一天暫時未有練習時間紀錄。</p>';
}

function renderSentenceTimeDashboard() {
  document.querySelectorAll("[data-sentence-time-progress-range]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.sentenceTimeProgressRange === state.timeProgressRange));
  });
  const series = buildSentenceTimeSeries();
  if (elements.timeProgressChart) elements.timeProgressChart.innerHTML = sentenceTimeProgressChartSvg(series);
  if (elements.timeProgressAllTotal) elements.timeProgressAllTotal.textContent = formatDuration(series.stats.allTotalMs);
  if (elements.timeProgressPeriodTotal) elements.timeProgressPeriodTotal.textContent = formatDuration(series.stats.periodTotalMs);
  if (elements.timeProgressAverage) elements.timeProgressAverage.textContent = formatDuration(series.stats.averageMs);
  if (elements.timeProgressMedian) elements.timeProgressMedian.textContent = formatDuration(series.stats.medianMs);
  if (elements.timeProgressMaximum) elements.timeProgressMaximum.textContent = formatDuration(series.stats.maximumMs);
  renderSentenceTimeDayPanel(series);
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
            <div class="attempt-detail"><span>提交記錄</span><strong>${escapeHtml(rounds)} 次</strong></div>
            <div class="attempt-detail"><span>練習時間</span><strong>${escapeHtml(formatDuration(attempt.durationMs))}</strong></div>
          </div>
          ${allowResume && !complete ? `<div class="attempt-actions"><button class="small-button" type="button" data-resume-attempt="${escapeHtml(attempt.id)}">繼續這次練習</button></div>` : ""}
        </div>
      </details>`;
  }).join("");
}

function renderAttemptHistory() {
  const visible = state.attempts.slice(0, ATTEMPT_PAGE_SIZE);
  elements.historyList.innerHTML = `${state.attemptHistoryComplete ? "" : '<p class="history-warning" role="status">練習記錄超過 10,000 次；圖表及下方記錄目前只計算最近 10,000 次。較早記錄仍保留在系統內。</p>'}${attemptHistoryHtml(visible)}${state.attempts.length > visible.length
    ? `<p class="history-note">圖表已計算全部記錄；下方只顯示最近 ${ATTEMPT_PAGE_SIZE} 次練習。</p>`
    : ""}`;
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
  const targetQuestionId = questionId || (state.lessonPage === 4 ? currentProgressQuestionId(lesson) : "");
  if (targetQuestionId) focusExerciseQuestion(targetQuestionId);
}

function setLessonPage(page) {
  pauseExerciseClock();
  state.lessonPage = Math.max(1, Math.min(LESSON_PAGES, Number(page) || 1));
  renderLessonPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (state.lessonPage === 4) {
    const targetQuestionId = currentProgressQuestionId();
    if (targetQuestionId) focusExerciseQuestion(targetQuestionId);
  }
}

function currentProgressQuestionId(lesson = getLesson()) {
  if (!lesson || !state.exercise) return "";
  const questions = state.exercise.correctionMode ? correctionQuestions(lesson) : lesson.questions || [];
  const unresolved = questions.filter((question) => !state.exercise.correctIds.includes(question.id));
  if (state.exercise.correctionMode) return String(unresolved[0]?.id || "");
  const unanswered = unresolved.find((question) => {
    const saved = questionState(question.id);
    const draft = state.exercise.drafts?.[question.id];
    return saved.status === "pending" && !String(draft ?? saved.lastAnswer ?? "").trim();
  });
  const pending = unanswered || unresolved.find((question) => questionState(question.id).status === "pending");
  const next = pending || unresolved.find((question) => questionState(question.id).status === "wrong") || unresolved[0];
  return String(next?.id || "");
}

function focusExerciseQuestion(questionId) {
  if (!questionId) return;
  window.setTimeout(() => {
    const card = document.querySelector(`[data-question-id="${CSS.escape(questionId)}"]`);
    card?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    const input = card?.querySelector?.("[data-answer-input]:not([disabled])");
    input?.focus?.({ preventScroll: true });
  }, 50);
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
  if (exerciseVisible) elements.lessonRound.textContent = `${state.exercise.correctIds.length}/${getLesson()?.questions?.length || 0} 題完成`;
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
  const rawMeaning = lesson.meaning?.zh;
  const meaningLines = (Array.isArray(rawMeaning) ? rawMeaning : rawMeaning ? [rawMeaning] : [])
    .filter((line) => String(line || "").trim());
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
          <strong>${escapeHtml(example.labelEn || "EXAMPLE")} · ${escapeHtml(example.labelZh || "例句")}</strong>
          <p>${highlightedAnswerHtml(example.english || example.en || example.answer, example.highlight)}</p>
          <p>${escapeHtml(example.chinese || example.zh || example.answerZh || "")}</p>
        </div>`).join("")}
      ${meaningLines.length ? `<aside class="meaning-block">
        <strong>MEANING · 句型意思</strong>
        ${meaningLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </aside>` : ""}
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
        return `<li class="benefit-card"><span>${index + 1}</span><div>${item.chinese ? `<p class="chinese">${escapeHtml(item.chinese)}</p>` : ""}${item.english ? `<p class="english">${escapeHtml(item.english)}</p>` : ""}</div></li>`;
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
        return `<li class="rule-card"><span>${index + 1}</span><div>${item.chinese ? `<p class="chinese">${escapeHtml(item.chinese)}</p>` : ""}${item.english ? `<p class="english">${escapeHtml(item.english)}</p>` : ""}${item.examples.length ? `<div class="examples">${item.examples.map((example) => `<code>${escapeHtml(example)}</code>`).join("")}</div>` : ""}</div></li>`;
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
    correctionMode: false,
    correctionIds: [],
    collapsedCorrectIds: [],
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
  const correctionIds = Array.isArray(result.correctionIds)
    ? result.correctionIds.map(String).filter((id) => validQuestionIds.has(id))
    : [];
  const collapsedCorrectIds = Array.isArray(result.collapsedCorrectIds)
    ? result.collapsedCorrectIds.map(String).filter((id) => correctIds.includes(id))
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
    rounds: Array.isArray(result.rounds) ? result.rounds.slice(-250) : [],
    awaitingNextRound: result.awaitingNextRound === true,
    correctionMode: result.correctionMode === true && correctionIds.length > 0,
    correctionIds,
    collapsedCorrectIds,
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

function isSectionBookmarked(lessonId) {
  return isBookmarked(lessonId, SECTION_BOOKMARK_ID);
}

function highlightedAnswerHtml(answer, highlight) {
  const full = String(answer || "");
  const target = String(highlight || "");
  if (!target) return escapeHtml(full);
  const index = full.toLocaleLowerCase().indexOf(target.toLocaleLowerCase());
  if (index < 0) return escapeHtml(full);
  return `${escapeHtml(full.slice(0, index))}<span class="target-highlight">${escapeHtml(full.slice(index, index + target.length))}</span>${escapeHtml(full.slice(index + target.length))}`;
}

function canonicalSpellingToken(value) {
  const token = String(value || "")
    .normalize("NFKC")
    .replace(/[‘’]/g, "'")
    .toLocaleLowerCase();
  return SPELLING_EQUIVALENTS[token] || token;
}

function answerWordSegments(value) {
  const text = String(value || "");
  const words = [];
  const matcher = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
  for (const match of text.matchAll(matcher)) {
    words.push({ text: match[0], start: match.index, end: match.index + match[0].length, comparable: canonicalSpellingToken(match[0]) });
  }
  return { text, words };
}

function missingAnswerMarkup(answer, studentAnswer) {
  const model = answerWordSegments(answer);
  const student = answerWordSegments(studentAnswer);
  const rows = model.words.length;
  const columns = student.words.length;
  const lengths = Array.from({ length: rows + 1 }, () => new Uint16Array(columns + 1));
  for (let row = rows - 1; row >= 0; row -= 1) {
    for (let column = columns - 1; column >= 0; column -= 1) {
      lengths[row][column] = model.words[row].comparable === student.words[column].comparable
        ? lengths[row + 1][column + 1] + 1
        : Math.max(lengths[row + 1][column], lengths[row][column + 1]);
    }
  }
  const matched = new Set();
  const matchedStudent = new Set();
  let row = 0;
  let column = 0;
  while (row < rows && column < columns) {
    if (model.words[row].comparable === student.words[column].comparable) {
      matched.add(row);
      matchedStudent.add(column);
      row += 1;
      column += 1;
    } else if (lengths[row + 1][column] >= lengths[row][column + 1]) {
      row += 1;
    } else {
      column += 1;
    }
  }
  const missing = model.words.map((_, index) => index).filter((index) => !matched.has(index));
  const partialSuffixes = new Map();
  for (const modelIndex of missing) {
    const modelToken = model.words[modelIndex].comparable;
    let best = null;
    for (let studentIndex = 0; studentIndex < student.words.length; studentIndex += 1) {
      if (matchedStudent.has(studentIndex)) continue;
      const studentToken = student.words[studentIndex].comparable;
      const suffixLength = modelToken.endsWith("s") && studentToken === modelToken.slice(0, -1)
        ? 1
        : modelToken.endsWith("es") && studentToken === modelToken.slice(0, -2)
          ? 2
          : 0;
      if (!suffixLength) continue;
      const distance = Math.abs(modelIndex - studentIndex);
      if (!best || distance < best.distance) best = { studentIndex, suffixLength, distance };
    }
    if (best) {
      matchedStudent.add(best.studentIndex);
      partialSuffixes.set(modelIndex, best.suffixLength);
    }
  }
  if (!missing.length) return { html: escapeHtml(model.text), missingCount: 0 };
  let cursor = 0;
  const html = model.words.map((word, index) => {
    const prefix = escapeHtml(model.text.slice(cursor, word.start));
    cursor = word.end;
    const escaped = escapeHtml(word.text);
    const suffixLength = partialSuffixes.get(index) || 0;
    const marked = suffixLength
      ? `${escapeHtml(word.text.slice(0, -suffixLength))}<mark class="missing-answer-highlight">${escapeHtml(word.text.slice(-suffixLength))}</mark>`
      : `<mark class="missing-answer-highlight">${escaped}</mark>`;
    return `${prefix}${matched.has(index) ? escaped : marked}`;
  }).join("") + escapeHtml(model.text.slice(cursor));
  return { html, missingCount: missing.length };
}

function comparedAnswerHtml(answer, studentAnswer, fallbackHighlight = "") {
  const compared = missingAnswerMarkup(answer, studentAnswer);
  return compared.missingCount ? compared.html : highlightedAnswerHtml(answer, fallbackHighlight);
}

function questionAnswerParts(question) {
  return Array.isArray(question?.answerParts)
    ? question.answerParts.filter((part) => isPlainObject(part) && part.label && part.answer)
    : [];
}

function storedAnswerPartValues(question, storedValue) {
  const parts = questionAnswerParts(question);
  if (!parts.length) return [];
  const chunks = String(storedValue || "").split(" || ");
  return parts.map((part, index) => {
    const chunk = String(chunks[index] || "");
    const prefix = `${part.label}:`;
    return chunk.toLocaleLowerCase().startsWith(prefix.toLocaleLowerCase())
      ? chunk.slice(prefix.length).trimStart()
      : chunk.trim();
  });
}

function combinedAnswerPartValue(question, values) {
  const parts = questionAnswerParts(question);
  if (!parts.length || values.every((value) => !String(value || "").trim())) return "";
  return parts
    .map((part, index) => `${part.label}: ${String(values[index] || "").trim()}`)
    .join(" || ");
}

function suggestedAnswerHtml(question, studentAnswer = null) {
  const parts = questionAnswerParts(question);
  if (!parts.length) {
    const answerHtml = studentAnswer === null
      ? highlightedAnswerHtml(question.answer, question.highlight)
      : comparedAnswerHtml(question.answer, studentAnswer, question.highlight);
    return `<p>${answerHtml}</p><p>${escapeHtml(question.answerZh || "")}</p>`;
  }
  const studentParts = studentAnswer === null ? [] : storedAnswerPartValues(question, studentAnswer);
  return `<div class="multi-answer-reveal">${parts.map((part, index) => `
    <div>
      <strong>${escapeHtml(part.label)}</strong>
      <p>${studentAnswer === null ? highlightedAnswerHtml(part.answer, part.highlight || part.answer) : comparedAnswerHtml(part.answer, studentParts[index] || "", part.highlight || part.answer)}</p>
      <p>${escapeHtml(part.answerZh || "")}</p>
    </div>
  `).join("")}</div>`;
}

function questionHtml(question) {
  const qState = questionState(question.id);
  const correct = state.exercise.correctIds.includes(question.id) || qState.status === "correct";
  const wrong = qState.status === "wrong";
  const collapsed = correct && state.exercise.collapsedCorrectIds.includes(question.id);
  const unresolvedCorrection = state.exercise.correctionMode
    && state.exercise.correctionIds.includes(question.id)
    && !correct;
  const revealAnswer = qState.reveal === true;
  const value = state.exercise.drafts[question.id] ?? qState.lastAnswer ?? "";
  const answerParts = questionAnswerParts(question);
  const partValues = storedAnswerPartValues(question, value);
  const bookmarked = isBookmarked(state.lessonId, question.id);
  return `<article class="question-card ${correct ? "is-correct" : wrong ? "is-wrong" : ""} ${collapsed ? "is-collapsed" : ""}" data-question-id="${escapeHtml(question.id)}">
    <div class="question-card-top">
      <span class="question-number">QUESTION ${escapeHtml(question.number || "")}</span>
      <div class="question-card-actions">
        ${correct ? `<button class="question-visibility-button" type="button" data-toggle-correct-card="${escapeHtml(question.id)}" aria-expanded="${!collapsed}">${collapsed ? "顯示已完成題目" : "隱藏已完成題目"}</button>` : ""}
        <button class="question-bookmark-button" type="button" data-toggle-question-bookmark="${escapeHtml(question.id)}" aria-pressed="${bookmarked}" aria-label="${bookmarked ? "移除書簽" : "加入書簽"}">${bookmarked ? "★" : "☆"}</button>
      </div>
    </div>
    <div class="question-card-content" ${collapsed ? "hidden" : ""}>
      <div class="question-prompt">
        <p class="english">${escapeHtml(question.prompt || question.english || "")}</p>
        <p class="chinese">${escapeHtml(question.promptZh || question.chinese || question.zh || "")}</p>
        ${question.cue ? `<p class="question-cue">${escapeHtml(question.cue)}</p>` : ""}
        ${!answerParts.length && question.starter ? `<p class="starter-hint">請以「${escapeHtml(question.starter)}」開始。</p>` : ""}
      </div>
      ${answerParts.length ? `<div class="multi-answer-fields">${answerParts.map((part, index) => `
        <label class="answer-part">
          <span><strong>${escapeHtml(part.label)}</strong> · 請以「${escapeHtml(part.starter)}」開始</span>
          <input class="answer-input" type="text" maxlength="450" data-answer-input="${escapeHtml(question.id)}" data-answer-part-index="${index}" value="${escapeHtml(partValues[index] || "")}" ${correct ? "disabled" : ""} autocomplete="off" spellcheck="true" aria-label="第 ${escapeHtml(question.number)} 題 ${escapeHtml(part.label)} 答案">
        </label>
      `).join("")}</div>` : `<input class="answer-input" type="text" maxlength="1000" data-answer-input="${escapeHtml(question.id)}" value="${escapeHtml(value)}" ${correct ? "disabled" : ""} autocomplete="off" spellcheck="true" aria-label="第 ${escapeHtml(question.number)} 題答案">`}
      ${wrong && !correct ? `<button class="clear-answer-button" type="button" data-clear-question-answer="${escapeHtml(question.id)}">清除答案，重新輸入</button>` : ""}
      <p class="question-feedback" aria-live="polite">${correct ? "✓ 答案正確，這題已完成。" : wrong ? unresolvedCorrection ? "答案未完全符合句型；請再次修改後提交。" : "答案未完全符合句型；請參考答案並修改。" : ""}</p>
      ${revealAnswer ? `<div class="answer-reveal"><span>SUGGESTED ANSWER · 參考答案（黃色為遺漏或需修改部分）</span>${suggestedAnswerHtml(question, value)}</div>` : ""}
    </div>
  </article>`;
}

function activeQuestions(lesson = getLesson()) {
  return (lesson?.questions || []).filter((question) => !state.exercise.correctIds.includes(question.id));
}

function wrongQuestionIds(lesson = getLesson()) {
  return (lesson?.questions || [])
    .filter((question) => !state.exercise.correctIds.includes(question.id) && questionState(question.id).status === "wrong")
    .map((question) => question.id);
}

function correctionQuestions(lesson = getLesson()) {
  const correctionIds = new Set(state.exercise.correctionIds || []);
  return (lesson?.questions || []).filter((question) => correctionIds.has(question.id));
}

function submissionQuestions(lesson = getLesson()) {
  const scoped = state.exercise.correctionMode ? correctionQuestions(lesson) : activeQuestions(lesson);
  return scoped.filter((question) => !state.exercise.correctIds.includes(question.id));
}

function renderExercisePage(lesson, { preserveScroll = false } = {}) {
  ensureExercise(lesson);
  const scrollTop = preserveScroll ? window.scrollY : 0;
  const total = lesson.questions?.length || 0;
  const correct = state.exercise.correctIds.length;
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  const remaining = total - correct;
  const completed = Boolean(state.exercise.completedAt || remaining === 0);
  const wrongIds = wrongQuestionIds(lesson);
  const correctionScope = state.exercise.correctionMode ? correctionQuestions(lesson) : [];
  const correctionRemaining = correctionScope.filter((question) => !state.exercise.correctIds.includes(question.id));
  const correctionAnswerVisible = correctionRemaining.some((question) => questionState(question.id).reveal === true);
  const displayQuestions = completed
    ? lesson.questions
    : state.exercise.correctionMode
      ? correctionScope
      : lesson.questions;
  const visibleCorrectIds = displayQuestions
    .filter((question) => state.exercise.correctIds.includes(question.id))
    .map((question) => question.id);
  const allVisibleCorrectCollapsed = visibleCorrectIds.length > 0
    && visibleCorrectIds.every((id) => state.exercise.collapsedCorrectIds.includes(id));
  const bulkVisibilityLabel = allVisibleCorrectCollapsed
    ? "展開所有已完成題目"
    : "隱藏所有已完成題目";
  const nextRoundActions = state.exercise.awaitingNextRound
    ? `<div class="round-summary-actions">
        ${wrongIds.length ? `<button class="correction-button" type="button" data-start-correction>立即改正錯題（${escapeHtml(wrongIds.length)}）</button>` : ""}
        <button class="primary-button" type="button" data-next-round>繼續練習未完成題目</button>
      </div>`
    : "";

  elements.lessonContent.innerHTML = `<section class="exercise-page">
    <header class="exercise-header">
      <div class="exercise-header-top">
        <div><p class="eyebrow">PAGE 4 · TYPE THE WHOLE SENTENCE</p><h2>句子改寫練習</h2><p>輸入完整英文句子。部分提交只會檢查已輸入的題目；答對的題目不會重複出現。</p></div>
      </div>
      <div class="exercise-progress" style="--progress:${percentage}%"><span></span></div>
      <div class="exercise-progress-label"><span>已完成 ${escapeHtml(correct)} / ${escapeHtml(total)} 題</span><span>尚餘 ${escapeHtml(remaining)} 題</span></div>
    </header>

    ${completed ? `<section class="round-summary completion-card">
      <div class="completion-mark" aria-hidden="true">✓</div>
      <h3>恭喜，全部題目已完成！</h3>
      <p>你已完成這組 <strong>${escapeHtml(total)}</strong> 題句子結構練習。</p>
      <div class="round-summary-actions"><button class="primary-button" type="button" data-finish-exercise>返回學習首頁</button></div>
    </section>` : state.exercise.awaitingNextRound ? `<section class="round-summary">
      <h3>本次提交已檢查</h3>
      <p>目前已答對 <strong>${escapeHtml(correct)}</strong> 題；尚有 <strong>${escapeHtml(remaining)}</strong> 題需要繼續練習。</p>
      ${nextRoundActions}
    </section>` : ""}

    ${!completed && state.exercise.correctionMode ? `<section class="correction-round-banner">
      <div>
        <h3>${correctionRemaining.length ? "錯題改正" : "本次錯題已全部改正"}</h3>
        <p>${correctionRemaining.length ? correctionAnswerVisible ? `仍有 ${escapeHtml(correctionRemaining.length)} 題需要改正；黃色會標示遺漏或需修改部分。` : `集中修正 ${escapeHtml(correctionRemaining.length)} 題；首次提交前會暫時隱藏參考答案，答錯後會顯示提示。` : "你可以查看已完成的綠色題卡，或返回其餘題目繼續練習。"}</p>
      </div>
      <button class="secondary-button" type="button" data-exit-correction>返回其餘題目</button>
    </section>` : ""}

    ${visibleCorrectIds.length ? `<div class="question-list-toolbar">
      <button class="bulk-visibility-button" type="button" data-toggle-all-correct-cards aria-pressed="${allVisibleCorrectCollapsed}" aria-controls="sentence-structure-question-list" aria-label="${bulkVisibilityLabel}（${escapeHtml(visibleCorrectIds.length)} 題）">${bulkVisibilityLabel}</button>
    </div>` : ""}

    <div class="question-list" id="sentence-structure-question-list" data-question-list>
      ${displayQuestions.map(questionHtml).join("")}
    </div>

    ${!completed && state.exercise.awaitingNextRound ? `<section class="round-summary round-summary-bottom" aria-label="完成檢查後的下一步">
      <h3>本次提交已完成檢查</h3>
      <p>最後一題後可直接改正錯題，或繼續練習未完成題目，無需捲回頁頂。</p>
      ${nextRoundActions}
    </section>` : ""}

    ${!completed && !state.exercise.awaitingNextRound && (!state.exercise.correctionMode || correctionRemaining.length) ? `<div class="exercise-actions">
      <span class="exercise-action-copy" data-exercise-action-copy>${state.exercise.correctionMode ? "修改錯題後提交；答對的題卡會留在目前畫面供你核對。" : "可提交全部答案，或只檢查已輸入的題目。"}</span>
      <div class="exercise-action-buttons">
        ${!state.exercise.correctionMode && wrongIds.length ? `<button class="correction-button" type="button" data-start-correction>立即改正錯題（${escapeHtml(wrongIds.length)}）</button>` : ""}
        <button class="partial-button" type="button" data-submit-partial hidden>提交部分答案</button>
        <button class="primary-button" type="button" data-submit-all>${state.exercise.correctionMode ? "提交改正答案" : "提交答案"}</button>
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
  const inputs = [...document.querySelectorAll("[data-answer-input]")];
  const groupedParts = new Map();
  inputs.forEach((input) => {
    const questionId = input.dataset.answerInput;
    if (input.dataset.answerPartIndex === undefined) {
      state.exercise.drafts[questionId] = input.value;
      return;
    }
    const values = groupedParts.get(questionId) || [];
    values[Number(input.dataset.answerPartIndex)] = input.value;
    groupedParts.set(questionId, values);
  });
  groupedParts.forEach((values, questionId) => {
    const question = getQuestion(state.lessonId, questionId);
    state.exercise.drafts[questionId] = combinedAnswerPartValue(question, values);
  });
}

function syncExerciseButtons() {
  const partialButton = document.querySelector("[data-submit-partial]");
  const allButton = document.querySelector("[data-submit-all]");
  const copy = document.querySelector("[data-exercise-action-copy]");
  if (!partialButton || !allButton || !state.exercise) return;
  readExerciseDrafts();
  const targets = submissionQuestions();
  const filled = targets.filter((question) => String(state.exercise.drafts[question.id] || "").trim()).length;
  partialButton.hidden = !(filled > 0 && filled < targets.length);
  allButton.textContent = state.exercise.correctionMode
    ? filled === targets.length && targets.length ? "提交改正答案" : "提交全部改正答案"
    : filled === targets.length && targets.length ? "提交答案" : "提交全部答案";
  if (copy) {
    copy.textContent = filled > 0 && filled < targets.length
      ? `已輸入 ${filled} / ${targets.length} 題；可先檢查這 ${filled} 題。`
      : filled === targets.length && targets.length
        ? "所有答案已填寫，現在可以提交。"
        : "尚未輸入答案；提交全部會把空白題目保留為未完成。";
  }
}

function normalizeAnswer(value) {
  const normalized = String(value || "")
    .normalize("NFKC")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim()
    .replace(/[.!?]+$/g, "")
    .toLocaleLowerCase();
  return normalized.replace(/[a-z]+(?:'[a-z]+)*/g, (token) => canonicalSpellingToken(token));
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
    rounds: state.exercise.rounds.slice(-250),
    awaitingNextRound: state.exercise.awaitingNextRound,
    correctionMode: state.exercise.correctionMode === true,
    correctionIds: [...state.exercise.correctionIds],
    collapsedCorrectIds: [...state.exercise.collapsedCorrectIds],
    contentVersion: String(CONTENT.version || "1")
  };
}

async function persistExercise() {
  if (!state.exercise || state.user?.role !== "student") return;
  window.clearTimeout(state.exercisePersistTimer);
  state.exercisePersistTimer = null;
  const attemptId = state.exercise.id;
  pauseExerciseClock();
  try {
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
  } finally {
    if (
      state.exercise?.id === attemptId
      && !state.exercise.completedAt
      && state.currentView === "lesson"
      && state.lessonPage === 4
    ) {
      startExerciseClock();
    }
  }
}

function scheduleExercisePersistence() {
  window.clearTimeout(state.exercisePersistTimer);
  state.exercisePersistTimer = window.setTimeout(() => {
    state.exercisePersistTimer = null;
    persistExercise().catch((error) => {
      console.warn("Sentence Structure preference save failed", error);
    });
  }, 450);
}

async function submitExercise(kind) {
  if (state.saveInFlight || !state.exercise || state.exercise.awaitingNextRound) return;
  readExerciseDrafts();
  const lesson = getLesson();
  const available = submissionQuestions(lesson);
  const filled = available.filter((question) => String(state.exercise.drafts[question.id] || "").trim());
  const targets = kind === "partial" ? filled : available;
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
    if (correct && isBookmarked(lesson.id, question.id)) {
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
    state.exercise.correctionMode = false;
    state.exercise.correctionIds = [];
  } else if (kind === "all" && !state.exercise.correctionMode) {
    state.exercise.awaitingNextRound = true;
  } else if (state.exercise.correctionMode) {
    const stillWrongInCorrection = correctionQuestions(lesson)
      .some((question) => !state.exercise.correctIds.includes(question.id));
    if (stillWrongInCorrection) state.exercise.round += 1;
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

async function startCorrectionRound() {
  if (state.saveInFlight || !state.exercise) return;
  readExerciseDrafts();
  const lesson = getLesson();
  const ids = wrongQuestionIds(lesson);
  if (!ids.length) {
    showToast("目前沒有需要改正的題目。", "error");
    return;
  }
  state.exercise.round += 1;
  state.exercise.awaitingNextRound = false;
  state.exercise.correctionMode = true;
  state.exercise.correctionIds = ids;
  ids.forEach((id) => {
    if (state.exercise.questionState[id]) state.exercise.questionState[id].reveal = false;
  });
  state.exercise.collapsedCorrectIds = state.exercise.collapsedCorrectIds.filter((id) => !ids.includes(id));
  renderExercisePage(lesson);
  try {
    await persistExercise();
  } catch (error) {
    console.warn("Correction round save failed", error);
    showToast("已進入錯題改正，但暫時未能同步記錄。", "error");
  }
  document.querySelector(".exercise-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function exitCorrectionRound() {
  if (!state.exercise?.correctionMode) return;
  readExerciseDrafts();
  state.exercise.correctionMode = false;
  state.exercise.correctionIds = [];
  renderExercisePage(getLesson(), { preserveScroll: true });
  try {
    await persistExercise();
  } catch (error) {
    console.warn("Correction round exit save failed", error);
    showToast("已返回其餘題目，但暫時未能同步記錄。", "error");
  }
}

async function toggleCorrectCard(questionId) {
  if (!state.exercise?.correctIds.includes(questionId)) return;
  readExerciseDrafts();
  const hidden = state.exercise.collapsedCorrectIds;
  const index = hidden.indexOf(questionId);
  if (index >= 0) hidden.splice(index, 1);
  else hidden.push(questionId);
  renderExercisePage(getLesson(), { preserveScroll: true });
  scheduleExercisePersistence();
  requestAnimationFrame(() => {
    document.querySelector(`[data-toggle-correct-card="${CSS.escape(questionId)}"]`)?.focus?.({ preventScroll: true });
  });
}

async function toggleAllCorrectCards() {
  if (!state.exercise) return;
  readExerciseDrafts();
  const lesson = getLesson();
  const completed = Boolean(state.exercise.completedAt || activeQuestions(lesson).length === 0);
  const visibleQuestions = completed
    ? lesson.questions
    : state.exercise.correctionMode
      ? correctionQuestions(lesson)
      : lesson.questions;
  const visibleCorrectIds = visibleQuestions
    .filter((question) => state.exercise.correctIds.includes(question.id))
    .map((question) => question.id);
  if (!visibleCorrectIds.length) return;

  const hidden = new Set(state.exercise.collapsedCorrectIds);
  const expandAll = visibleCorrectIds.every((id) => hidden.has(id));
  visibleCorrectIds.forEach((id) => expandAll ? hidden.delete(id) : hidden.add(id));
  state.exercise.collapsedCorrectIds = [...hidden]
    .filter((id) => state.exercise.correctIds.includes(id));
  renderExercisePage(lesson, { preserveScroll: true });
  scheduleExercisePersistence();
  requestAnimationFrame(() => {
    document.querySelector("[data-toggle-all-correct-cards]")?.focus?.({ preventScroll: true });
  });
}

function clearQuestionAnswer(questionId) {
  if (!state.exercise || !getQuestion(state.lessonId, questionId)) return;
  state.exercise.drafts[questionId] = "";
  const inputs = [...document.querySelectorAll(`[data-answer-input="${CSS.escape(questionId)}"]`)];
  inputs.forEach((input) => { input.value = ""; });
  syncExerciseButtons();
  inputs[0]?.focus?.();
}

async function startNextRound() {
  if (!state.exercise?.awaitingNextRound) return;
  const lesson = getLesson();
  state.exercise.round += 1;
  state.exercise.awaitingNextRound = false;
  state.exercise.correctionMode = false;
  state.exercise.correctionIds = [];
  for (const question of activeQuestions(lesson)) {
    state.exercise.questionState[question.id] = { status: "pending", lastAnswer: "", reveal: false };
    state.exercise.drafts[question.id] = "";
  }
  renderExercisePage(lesson);
  try { await persistExercise(); } catch (error) { console.warn("Next round save failed", error); }
  document.querySelector(".exercise-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveBookmarks() {
  const revision = ++state.bookmarkWriteRevision;
  const userId = String(state.user?.id || "");
  const authToken = String(state.authToken || "");
  const snapshot = state.bookmarks.map(({ lessonId, questionId, includeAnswer }) => ({ lessonId, questionId, includeAnswer }));
  const write = async () => apiJson("/v1/bookmarks", {
    method: "PUT",
    body: JSON.stringify({ bookmarks: snapshot })
  }, true, authToken);
  const pending = state.bookmarkSaveQueue.then(write, write);
  state.bookmarkSaveQueue = pending.catch(() => undefined);
  try {
    const payload = await pending;
    if (String(state.user?.id || "") === userId) {
      const normalized = (Array.isArray(payload?.bookmarks) ? payload.bookmarks : snapshot)
        .map(normalizeBookmark)
        .filter(Boolean);
      state.syncedBookmarks = normalized.map((bookmark) => ({ ...bookmark }));
      if (revision === state.bookmarkWriteRevision) state.bookmarks = normalized;
    }
    return payload;
  } catch (error) {
    error.bookmarkRevision = revision;
    throw error;
  }
}

async function toggleBookmark(lessonId, questionId, includeAnswer = false) {
  const sectionBookmark = questionId === SECTION_BOOKMARK_ID;
  if (!getLesson(lessonId) || (!sectionBookmark && !getQuestion(lessonId, questionId))) return;
  const operationUserId = String(state.user?.id || "");
  const existingIndex = state.bookmarks.findIndex((bookmark) => bookmark.lessonId === lessonId && bookmark.questionId === questionId);
  if (existingIndex >= 0) state.bookmarks.splice(existingIndex, 1);
  else {
    if (state.bookmarks.length >= MAX_BOOKMARKS) {
      showToast(`最多可儲存 ${MAX_BOOKMARKS} 個書簽。`, "error");
      return;
    }
    state.bookmarks.push({ lessonId, questionId, includeAnswer: sectionBookmark ? false : includeAnswer, createdAt: new Date().toISOString() });
  }
  if (state.currentView === "lesson") renderExercisePage(getLesson(), { preserveScroll: true });
  if (state.currentView === "dashboard") {
    renderLessonChoices();
    if (sectionBookmark) restoreSectionBookmarkFocus(lessonId);
  }
  if (state.currentView === "bookmarks") renderBookmarks();
  try {
    await saveBookmarks();
    if (String(state.user?.id || "") === operationUserId) {
      showToast(existingIndex >= 0
        ? (sectionBookmark ? "已移除句型書簽。" : "已移除題目書簽。")
        : (sectionBookmark ? "已收藏整個句型。" : "已加入題目書簽。"));
    }
  } catch (error) {
    const sameAccount = String(state.user?.id || "") === operationUserId;
    if (!sameAccount) return;
    if (error.bookmarkRevision !== state.bookmarkWriteRevision) return;
    state.bookmarks = state.syncedBookmarks.map((bookmark) => ({ ...bookmark }));
    if (state.currentView === "lesson") renderExercisePage(getLesson(), { preserveScroll: true });
    if (state.currentView === "dashboard") {
      renderLessonChoices();
      if (sectionBookmark) restoreSectionBookmarkFocus(lessonId);
    }
    if (state.currentView === "bookmarks") renderBookmarks();
    console.warn("Sentence Structure bookmark sync failed", error);
    showToast("未能同步書簽，請稍後再試。", "error");
  }
}

function toggleSectionBookmark(lessonId) {
  return toggleBookmark(lessonId, SECTION_BOOKMARK_ID, false);
}

function restoreSectionBookmarkFocus(lessonId) {
  if (!lessonId) return;
  requestAnimationFrame(() => {
    document.querySelector(`[data-toggle-section-bookmark="${CSS.escape(lessonId)}"]`)
      ?.focus?.({ preventScroll: true });
  });
}

function upgradeBookmarkAnswer(lessonId, questionId) {
  const bookmark = state.bookmarks.find((item) => item.lessonId === lessonId && item.questionId === questionId);
  if (!bookmark || bookmark.includeAnswer) return false;
  bookmark.includeAnswer = true;
  return true;
}

function bookmarkAnswerAvailable(bookmark) {
  if (!bookmark?.includeAnswer) return false;
  const lessonId = String(bookmark.lessonId || "");
  const questionId = String(bookmark.questionId || "");
  if (state.exercise?.lessonId === lessonId) {
    if (state.exercise.correctIds.includes(questionId)) return true;
    if (state.exercise.questionState?.[questionId]?.status === "wrong") return false;
  }
  for (const attempt of state.attempts) {
    if (attempt.lessonId !== lessonId) continue;
    const correctIds = Array.isArray(attempt.result?.correctIds) ? attempt.result.correctIds : [];
    if (correctIds.includes(questionId)) return true;
    if (attempt.result?.questionState?.[questionId]?.status === "wrong") return false;
  }
  return true;
}

function openBookmarks() {
  pauseExerciseClock();
  showView("bookmarks");
  renderBookmarks();
}

function renderBookmarks() {
  const sectionBookmarks = state.bookmarks.filter((bookmark) => bookmark.questionId === SECTION_BOOKMARK_ID);
  const questionBookmarks = state.bookmarks.filter((bookmark) => bookmark.questionId !== SECTION_BOOKMARK_ID);
  const sectionRows = sectionBookmarks.map((bookmark) => {
    const lesson = getLesson(bookmark.lessonId);
    if (!lesson) return "";
    return `<article class="bookmark-section-row">
      <span class="bookmark-section-star" aria-hidden="true">★</span>
      <div>
        <h3>${escapeHtml(lessonTitle(lesson))}</h3>
        <p>${escapeHtml(lessonEnglishTitle(lesson))}</p>
      </div>
      <div class="bookmark-row-actions">
        <button class="icon-button" type="button" data-open-section-bookmark="${escapeHtml(bookmark.lessonId)}">開啟</button>
        <button class="icon-button danger" type="button" data-remove-section-bookmark="${escapeHtml(bookmark.lessonId)}">移除</button>
      </div>
    </article>`;
  }).join("");
  const questionRows = questionBookmarks.map((bookmark) => {
    const lesson = getLesson(bookmark.lessonId);
    const question = getQuestion(bookmark.lessonId, bookmark.questionId);
    if (!lesson || !question) return "";
    return `<article class="bookmark-row">
      <span class="bookmark-row-number">${escapeHtml(question.number)}</span>
      <div>
        <h3>${escapeHtml(lessonTitle(lesson))}</h3>
        <p class="bookmark-prompt">${escapeHtml(question.prompt || question.english || "")}</p>
        <p class="bookmark-zh">${escapeHtml(question.promptZh || question.chinese || question.zh || "")}</p>
        ${question.cue ? `<p class="bookmark-cue">${escapeHtml(question.cue)}</p>` : ""}
        ${bookmarkAnswerAvailable(bookmark) ? `<div class="bookmark-answer">${suggestedAnswerHtml(question)}</div>` : ""}
      </div>
      <div class="bookmark-row-actions">
        <button class="icon-button" type="button" data-open-bookmark="${escapeHtml(bookmark.lessonId)}|${escapeHtml(bookmark.questionId)}" aria-label="開啟題目">開啟</button>
        <button class="icon-button danger" type="button" data-remove-bookmark="${escapeHtml(bookmark.lessonId)}|${escapeHtml(bookmark.questionId)}" aria-label="移除書簽">移除</button>
      </div>
    </article>`;
  }).join("");
  elements.bookmarkList.innerHTML = `<div class="bookmark-columns">
    <section class="bookmark-column" aria-labelledby="section-bookmark-heading">
      <header class="bookmark-column-heading">
        <span>01</span>
        <div><h2 id="section-bookmark-heading">收藏句型</h2><p>整個句子結構課題</p></div>
      </header>
      <div class="bookmark-column-list">${sectionRows || '<p class="empty-state">暫時未收藏句型。可在學習首頁的句型卡右上角按 ☆。</p>'}</div>
    </section>
    <section class="bookmark-column" aria-labelledby="question-bookmark-heading">
      <header class="bookmark-column-heading">
        <span>02</span>
        <div><h2 id="question-bookmark-heading">收藏題目</h2><p>各句型內的個別練習題</p></div>
      </header>
      <div class="bookmark-column-list">${questionRows || '<p class="empty-state">暫時未收藏題目。可在任何練習題右上角按 ☆。</p>'}</div>
    </section>
  </div>`;
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
      <p>學生帳戶</p>
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
  const searchResult = event.target.closest("[data-lesson-search-result]");
  if (searchResult) return openLesson(searchResult.dataset.searchLesson, { page: Number(searchResult.dataset.searchPage || 1), questionId: searchResult.dataset.searchQuestion || "" });
  if (event.target.closest("[data-clear-lesson-search]")) return clearLessonSearch();
  if (event.target.closest("[data-sentence-progress-toggle]")) return toggleProgressPanel();
  if (event.target.closest("[data-toggle-sentence-cumulative]")) return toggleCumulativeProgress();

  const sectionBookmarkButton = event.target.closest("[data-toggle-section-bookmark]");
  if (sectionBookmarkButton) return toggleSectionBookmark(sectionBookmarkButton.dataset.toggleSectionBookmark);

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
  if (event.target.closest("[data-start-correction]")) return startCorrectionRound();
  if (event.target.closest("[data-exit-correction]")) return exitCorrectionRound();
  if (event.target.closest("[data-next-round]")) return startNextRound();
  if (event.target.closest("[data-toggle-all-correct-cards]")) return toggleAllCorrectCards();

  const clearAnswerButton = event.target.closest("[data-clear-question-answer]");
  if (clearAnswerButton) return clearQuestionAnswer(clearAnswerButton.dataset.clearQuestionAnswer);

  const progressRange = event.target.closest("[data-sentence-progress-range]");
  if (progressRange) {
    state.progressRange = progressRange.dataset.sentenceProgressRange || "month";
    state.selectedProgressDay = "";
    return renderProgressDashboard();
  }
  const progressDay = event.target.closest("[data-sentence-progress-day]");
  if (progressDay) {
    state.selectedProgressDay = progressDay.dataset.sentenceProgressDay || "";
    return renderProgressDashboard();
  }
  if (event.target.closest("[data-close-sentence-progress-day]")) {
    state.selectedProgressDay = "";
    return renderProgressDayPanel();
  }
  const timeProgressRange = event.target.closest("[data-sentence-time-progress-range]");
  if (timeProgressRange) {
    state.timeProgressRange = timeProgressRange.dataset.sentenceTimeProgressRange || "month";
    state.selectedTimeProgressDay = "";
    return renderSentenceTimeDashboard();
  }
  const timeProgressDay = event.target.closest("[data-sentence-time-day]");
  if (timeProgressDay) {
    state.selectedTimeProgressDay = timeProgressDay.dataset.sentenceTimeDay || "";
    return renderSentenceTimeDashboard();
  }
  if (event.target.closest("[data-close-sentence-time-day]")) {
    state.selectedTimeProgressDay = "";
    return renderSentenceTimeDayPanel();
  }

  const correctCardButton = event.target.closest("[data-toggle-correct-card]");
  if (correctCardButton) return toggleCorrectCard(correctCardButton.dataset.toggleCorrectCard);

  const bookmarkButton = event.target.closest("[data-toggle-question-bookmark]");
  if (bookmarkButton) {
    const questionId = bookmarkButton.dataset.toggleQuestionBookmark;
    const correct = state.exercise?.correctIds.includes(questionId) === true;
    return toggleBookmark(state.lessonId, questionId, correct);
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
  const openSectionBookmark = event.target.closest("[data-open-section-bookmark]");
  if (openSectionBookmark) return openLesson(openSectionBookmark.dataset.openSectionBookmark, { page: 1 });
  const removeSectionBookmark = event.target.closest("[data-remove-section-bookmark]");
  if (removeSectionBookmark) return toggleSectionBookmark(removeSectionBookmark.dataset.removeSectionBookmark);

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
    if (event.target.matches("[data-lesson-search-input]")) renderLessonSearch();
  });
  elements.lessonSearchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    renderLessonSearch();
  });
  document.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const point = event.target.closest?.("[data-sentence-progress-day]");
    const timePoint = event.target.closest?.("[data-sentence-time-day]");
    if (!point && !timePoint) return;
    event.preventDefault();
    if (point) {
      state.selectedProgressDay = point.dataset.sentenceProgressDay || "";
      renderProgressDashboard();
    } else {
      state.selectedTimeProgressDay = timePoint.dataset.sentenceTimeDay || "";
      renderSentenceTimeDashboard();
    }
  });
  elements.adminSearch?.addEventListener("input", renderAdminStudents);
  window.addEventListener("pagehide", pauseExerciseClock);
}

async function checkHealth() {
  try {
    const response = await fetch(`${workerBaseUrl()}/v1/health`, { credentials: "omit" });
    if (!response.ok) throw new Error("Health unavailable");
    setConnection("已連線", "online");
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
  else {
    await openDashboard();
    openRequestedHomeworkLesson();
  }
}

initialise().catch((error) => {
  console.error("Sentence Structure initialisation failed", error);
  clearSession();
  setConnection("服務暫時離線", "error");
  setStatus(elements.loginStatus, "系統未能完成載入，請重新整理頁面。", "error");
  showView("login");
});
