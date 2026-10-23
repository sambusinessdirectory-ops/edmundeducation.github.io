import { createHorseyTrophies } from './horsey-trophies.mjs?v=20260915-phoebe2';
import { installQuestionOrder, orderQuestions } from "./question-order.mjs?v=20260908-loading1";
const CONFIG = window.EDMUND_IDIOM_SYSTEM_CONFIG || {};
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const CONTENT = window.EDMUND_IDIOM_SYSTEM_DATA || { version: "missing", lessons: [] };
const IDIOM_COMPASS = window.EDMUND_IDIOM_COMPASS || {};

const SESSION_KEY = "edmund-idiom-system-session-v1";
const PROGRESS_PANEL_PREFERENCE_KEY = "edmund-idiom-system-progress-panel-v1";
const CUMULATIVE_PROGRESS_PREFERENCE_KEY = "edmund-idiom-system-cumulative-progress-v1";
const SECTION_BOOKMARK_ID = "__section__";
const MAX_BOOKMARKS = 7038;
const LESSON_PAGES = 8;
const EXERCISE_PAGE = 8;
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
  username: document.querySelector("#idiom-system-username"),
  password: document.querySelector("#idiom-system-password"),
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
  loadingTemplate: document.querySelector("#idiom-system-loading-template"),
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
  visitedLessonPages: new Set(),
  adminStudents: [],
  selectedAdminStudentId: "",
  requestedHomeworkLessonOpened: false,
  pilotSelections: {},
  pilotOpenModels: new Set()
};

let lessonSearchIndexCache = null;
let exerciseClockWasRunningBeforeIdleBreak = false;
let idiomMap = null;
let idiomMapLoad = null;

function idleBreakIsPaused() {
  return window.EdmundIdleBreak?.isPaused?.() === true;
}

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

function compassFor(lesson = getLesson()) {
  return lesson ? IDIOM_COMPASS[lesson.id] || null : null;
}

function compassPracticeQuestions(lesson = getLesson()) {
  const bonus = compassFor(lesson)?.bonusPractice || [];
  return [...(lesson?.questions || []), ...bonus];
}

function compassBonusCorrectIds(lesson = getLesson()) {
  if (!lesson || !state.user?.id) return new Set();
  const key = `idiom-compass-bonus:v1:${state.user.id}:${lesson.id}`;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    const valid = new Set((compassFor(lesson)?.bonusPractice || []).map((question) => question.id));
    return new Set(Array.isArray(saved) ? saved.filter((id) => valid.has(id)) : []);
  } catch { return new Set(); }
}

function saveCompassBonusCorrect(lesson, questionId) {
  const correct = compassBonusCorrectIds(lesson);
  correct.add(questionId);
  try { localStorage.setItem(`idiom-compass-bonus:v1:${state.user.id}:${lesson.id}`, JSON.stringify([...correct])); }
  catch { showToast("此裝置未能儲存加題進度。", "error"); }
}

function compassReviewedIds(lesson, _questionState, correctIds = []) {
  return new Set([...correctIds, ...compassBonusCorrectIds(lesson)]);
}

function compassReviewedCount(lesson = getLesson(), exercise = state.exercise) {
  return compassReviewedIds(lesson, exercise?.questionState, exercise?.correctIds).size;
}

function attemptReviewedCount(lesson, attempt) {
  const result = parseJsonObject(attempt?.result, {});
  return compassReviewedIds(lesson, null, Array.isArray(result.correctIds) ? result.correctIds : []).size;
}

function displayAttemptProgress(lesson, attempt) {
  if (!compassFor(lesson)) return { count: attempt.correctCount, complete: attempt.status === "completed", label: attempt.status === "completed" ? "已完成" : "進行中" };
  const count = attemptReviewedCount(lesson, attempt);
  const total = compassPracticeQuestions(lesson).length;
  return { count, complete: count >= total, label: count >= total ? "已完成" : "練習中" };
}

function progressAttempts() {
  return state.attempts.map((attempt) => {
    const lesson = getLesson(attempt.lessonId);
    if (!compassFor(lesson)) return attempt;
    const progress = displayAttemptProgress(lesson, attempt);
    return { ...attempt, correctCount: progress.count, totalCount: compassPracticeQuestions(lesson).length, status: progress.complete ? "completed" : "in_progress" };
  });
}

function getQuestion(lessonId, questionId) {
  const lesson = getLesson(lessonId);
  return lesson?.questions?.find((question) => String(question.id) === String(questionId)) || null;
}

function lessonTitle(lesson) {
  return String(lesson?.title || lesson?.titleZh || lesson?.name || "英文慣用語");
}

function lessonEnglishTitle(lesson) {
  return String(lesson?.titleEn || lesson?.englishTitle || "English Idiom");
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

function pauseExerciseClock({ persist = false, keepalive = false } = {}) {
  if (!state.exerciseClockStartedAt || !state.exercise) return null;
  state.exercise.durationMs = Math.max(
    0,
    Math.round(Number(state.exercise.durationMs || 0) + (performance.now() - state.exerciseClockStartedAt))
  );
  state.exerciseClockStartedAt = 0;
  if (persist && state.user?.role === "student" && state.authToken && !state.exercise.completedAt) {
    const save = persistExercise({ keepalive });
    save.catch((error) => console.warn("Exercise time save failed", error));
    return save;
  }
  return null;
}

function startExerciseClock() {
  if (!state.exercise || state.exercise.completedAt || state.exerciseClockStartedAt || idleBreakIsPaused()) return;
  state.exerciseClockStartedAt = performance.now();
}

function currentExerciseDuration() {
  const active = state.exerciseClockStartedAt && !idleBreakIsPaused()
    ? performance.now() - state.exerciseClockStartedAt
    : 0;
  return Math.max(0, Math.round(Number(state.exercise?.durationMs || 0) + active));
}

function showView(name, { preserveScroll = false } = {}) {
  if (state.currentView === "lesson" && (name !== "lesson" || state.lessonPage !== EXERCISE_PAGE)) {
    pauseExerciseClock({ persist: name !== "lesson" && state.lessonPage === EXERCISE_PAGE });
  }
  state.currentView = name;
  idiomMap?.setActive(name === "dashboard");
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
  if (!baseUrl.startsWith("https://")) throw new Error("英文慣用語服務尚未完成設定。");
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
    const connectionError = new Error("暫時未能連接英文慣用語服務，請檢查網絡後再試。");
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
  idiomMap?.reset();
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
  state.visitedLessonPages = new Set();
  state.pilotSelections = {};
  state.pilotOpenModels = new Set();
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
      id: String(admin.id || "idiom-system-admin"),
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
    if(state.user.role==='student')window.EdmundSystemNav?.rememberStudentSession({...state.user,token:state.authToken});
    return true;
  } catch (error) {
    console.warn("Idiom System session restore failed", error);
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
    console.warn("Idiom System login failed", error);
    setStatus(elements.loginStatus, error.message || "登入失敗，請再試一次。", "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function logout() {
  const role = state.user?.role;
  if (role === "student") pauseExerciseClock({ persist: true });
  if (role === "student") window.EdmundSystemNav?.forgetStudentSession();
  try {
    if (role === "admin" && state.authToken) {
      await apiJson("/v1/admin/logout", { method: "POST" });
    }
  } catch (error) {
    console.warn("Idiom System logout cleanup failed", error);
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
  const timeSave = pauseExerciseClock({ persist: true });
  state.progressPanelExpanded = readProgressPanelPreference();
  state.showCumulativeProgress = readCumulativeProgressPreference();
  renderProgressPanelDisclosure();
  showView("dashboard");
  elements.dashboardWelcome.textContent = `${state.user.name}，選擇一個慣用語，先掌握意思與情境，再按自己的步伐練習。`;
  renderLessonChoices();
  if (!state.dashboardLoaded || force) elements.historyList.innerHTML = loadingHtml();
  if (timeSave) {
    try { await timeSave; } catch { /* Dashboard remains available if this best-effort save fails. */ }
  }
  try {
    await loadDashboardData({ force });
    if (String(state.user?.id || "") !== userId || String(state.authToken || "") !== authToken) return;
    renderLessonChoices();
    renderProgressDashboard();
    renderAttemptHistory();
  } catch (error) {
    if (String(state.user?.id || "") !== userId || String(state.authToken || "") !== authToken) return;
    console.warn("Idiom System dashboard failed", error);
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
    showToast("這個 Idiom System 練習目前不存在。", "error");
    return false;
  }
  openLesson(lessonId, { page: 1 });
  return true;
}

let horseyTrophies = null;
function syncHorseyTrophies() {
  const root = document.querySelector('[data-idiom-map]');
  if (!root) return;
  horseyTrophies ||= createHorseyTrophies({systemKey:'idiom',root,getLessons:lessonList,getMapLessons:() => lessonList().slice(0, 30),getOwner:()=>state.user?.id,getAttempts:progressAttempts,openLesson:id=>openLesson(id,{page:1})});
  horseyTrophies.sync();
}

function renderLessonChoices() {
  syncHorseyTrophies();
  if (elements.lessonCount) elements.lessonCount.textContent = String(lessonList().length);
  const cards = lessonList().map((lesson, index) => {
    const totalQuestions = compassFor(lesson) ? compassPracticeQuestions(lesson).length : Array.isArray(lesson.questions) ? lesson.questions.length : 0;
    const complete = state.attempts.some((attempt) => (
      attempt.lessonId === lesson.id
      && totalQuestions > 0
      && attempt.totalCount === (lesson.questions?.length || 0)
      && displayAttemptProgress(lesson, attempt).complete
    ));
    const bookmarked = isSectionBookmarked(lesson.id);
    return `
      <article class="lesson-choice-card ${complete ? "is-complete" : ""}">
        <button class="lesson-choice ${complete ? "is-complete" : ""}" type="button" data-open-lesson="${escapeHtml(lesson.id)}" data-number="${index + 1}" data-tone="${complete ? "gold" : index % 2 ? "violet" : "blue"}">
          ${lesson.image ? `<img class="lesson-choice-illustration" src="${escapeHtml(lesson.image)}" alt="" width="1535" height="1024" loading="lazy" decoding="async">` : ""}
          <h2>${escapeHtml(lessonTitle(lesson))}<span>${escapeHtml(lessonEnglishTitle(lesson))}</span></h2>
          ${complete ? `<span class="lesson-choice-complete">✓ ${totalQuestions} / ${totalQuestions} 題已完成</span>` : ""}
        </button>
        <button class="lesson-section-bookmark" type="button" data-toggle-section-bookmark="${escapeHtml(lesson.id)}" aria-pressed="${bookmarked}" aria-label="${bookmarked ? "移除慣用語書簽" : "收藏整個慣用語"}">${bookmarked ? "★" : "☆"}</button>
      </article>
    `;
  });
  const sectionBookmarkCount = state.bookmarks.filter((bookmark) => bookmark.questionId === SECTION_BOOKMARK_ID).length;
  const questionBookmarkCount = state.bookmarks.length - sectionBookmarkCount;
  elements.lessonChoiceGrid.innerHTML = `<button class="lesson-choice" type="button" data-open-bookmarks-card data-number="★" data-tone="bookmark">
      <h2>書簽<span>Bookmarks</span></h2>
      <span class="choice-meta"><span>${escapeHtml(sectionBookmarkCount)} 個慣用語</span><span>${escapeHtml(questionBookmarkCount)} 道題目</span><span>跟隨帳戶同步</span></span>
    </button>${cards.join("")}`;
  const remaining = document.querySelector('[data-remaining-lesson-grid]');
  if (remaining) remaining.innerHTML = cards.slice(30).join("");
  const remainingCount = document.querySelector('[data-remaining-count]');
  if (remainingCount) remainingCount.textContent = `（${Math.max(0, cards.length - 30)} 個慣用語）`;
  const bookmarkCount = document.querySelector('[data-map-bookmark-count]');
  if (bookmarkCount) {
    bookmarkCount.textContent = `(${state.bookmarks.length})`;
    bookmarkCount.title = `${sectionBookmarkCount} 個慣用語 · ${questionBookmarkCount} 道題目`;
  }
  syncIdiomMap();
}

function syncIdiomMap() {
  const root = document.querySelector('[data-idiom-map]');
  const toggle = document.querySelector('[data-idiom-map-toggle]');
  if (!root || !toggle || !state.user || !lessonList().length) return;
  if (idiomMap) {
    idiomMap.update(String(state.user.id));
    idiomMap.setActive(state.currentView === 'dashboard');
    return;
  }
  // The list remains available while the decorative map loads or if it fails.
  if (!idiomMapLoad) idiomMapLoad = import('./idiom-paper-map.mjs?v=20261017-r2-maps1')
    .then(({mountIdiomMap}) => {
      if (!state.user) { idiomMapLoad = null; return; }
      toggle.hidden = false;
      idiomMap = mountIdiomMap({root,toggle,grid:elements.lessonChoiceGrid,
        remaining:document.querySelector('[data-idiom-remaining]'),
        lessons:lessonList(),getAttempts:progressAttempts,
        openLesson:id=>openLesson(id,{page:1})});
      syncIdiomMap();
    }).catch(() => {
      idiomMapLoad = null;
      root.hidden = true;
      toggle.hidden = true;
      elements.lessonChoiceGrid.hidden = false;
    });
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
    ["formulas", "examples", "meaning", "modelExample", "learningObjective"],
    ["register", "tone", "meaningGroups", "meaningGroups1", "meaningGroupsI"],
    ["fixedVariable", "meaningGroups2", "meaningGroupsII"],
    ["specificForms", "forms"],
    ["benefits"],
    ["origin", "history", "usageGuide", "realLifeUses", "uses", "realLife", "realLifeContexts", "meaningComparison", "meaningComparisons", "comparisons", "page6Intro", "usageOverview"],
    ["rules", "importantRules"]
  ];
  const entries = [];
  for (const lesson of lessonList()) {
    const titleTexts = [lessonTitle(lesson), lessonEnglishTitle(lesson), lesson.slug].filter(Boolean);
    entries.push({ lessonId: lesson.id, page: 1, kind: "title", title: lessonTitle(lesson), titleEn: lessonEnglishTitle(lesson), texts: titleTexts });
    const compass = compassFor(lesson);
    if (compass) {
      for (let page = 1; page <= 7; page += 1) {
        const texts = collectLessonSearchStrings(page === 1 ? [compass.meaningZh, compass.meaningEn, compass.picture] : page === 4 ? [compass.fixed, compass.moving, compass.forms] : page === 7 ? compass.checks : page === 2 || page === 3 || page === 5 || page === 6 ? compass.choices[page] : []);
        entries.push({ lessonId: lesson.id, page, kind: "page", title: lessonTitle(lesson), titleEn: lessonEnglishTitle(lesson), texts });
      }
    } else {
      pageFields.forEach((fields, index) => {
        const texts = fields.flatMap((field) => collectLessonSearchStrings(lesson[field]));
        if (texts.length) entries.push({ lessonId: lesson.id, page: index + 1, kind: "page", title: lessonTitle(lesson), titleEn: lessonEnglishTitle(lesson), texts });
      });
    }
    (lesson.questions || []).forEach((question, index) => {
      const texts = collectLessonSearchStrings(question);
      if (texts.length) entries.push({ lessonId: lesson.id, page: EXERCISE_PAGE, questionId: String(question.id || ""), kind: "question", questionNumber: index + 1, title: lessonTitle(lesson), titleEn: lessonEnglishTitle(lesson), texts });
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
    elements.lessonSearchSummary.textContent = "尚未輸入關鍵字。可搜尋全部慣用語的八個學習頁面及練習題。";
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
    const place = entry.kind === "question" ? `第 8 頁 · 第 ${entry.questionNumber} 題` : `第 ${entry.page} 頁`;
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
    <line x1="${dimensions.left}" y1="${yFor(value).toFixed(2)}" x2="${width - dimensions.right}" y2="${yFor(value).toFixed(2)}" stroke="rgba(232,74,27,.16)" stroke-width="1" />
    <text x="${dimensions.left - 12}" y="${(yFor(value) + 4).toFixed(2)}" text-anchor="end" fill="#786358" font-size="13" font-weight="800">${value}</text>
  `).join("");
  const labelIndexes = points.length ? [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])] : [];
  const labels = labelIndexes.map((index) => `
    <text x="${xFor(index).toFixed(2)}" y="${height - 17}" text-anchor="middle" fill="#786358" font-size="13" font-weight="800">${escapeHtml(compactProgressDate(points[index].date))}</text>
  `).join("");
  const hoverPoints = coords.map(({ point, x, y }) => {
    const boxX = Math.min(Math.max(x - 62, dimensions.left), width - dimensions.right - 124);
    const boxY = Math.max(dimensions.top + 4, y - 54);
    const interactionAttributes = point.total > 0
      ? `tabindex="0" role="button" aria-label="${escapeHtml(point.key)}，完成 ${escapeHtml(point.total)} 題" data-sentence-progress-day="${escapeHtml(point.key)}"`
      : 'aria-hidden="true"';
    return `<g class="sentence-chart-hover" ${interactionAttributes}>
      <circle class="sentence-chart-hit" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="15" />
      <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.5" fill="#e84a1b" />
      <g class="sentence-chart-tooltip">
        <line x1="${x.toFixed(2)}" y1="${dimensions.top}" x2="${x.toFixed(2)}" y2="${height - dimensions.bottom}" stroke="rgba(63,38,30,.24)" stroke-width="1" stroke-dasharray="4 5" />
        <rect x="${boxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="124" height="40" rx="8" fill="#3f261e" opacity=".94" />
        <text x="${(boxX + 10).toFixed(2)}" y="${(boxY + 17).toFixed(2)}" fill="#fff" font-size="11" font-weight="900">完成：${escapeHtml(point.total)} 題</text>
        <text x="${(boxX + 10).toFixed(2)}" y="${(boxY + 31).toFixed(2)}" fill="#ffe9cf" font-size="10" font-weight="800">${escapeHtml(point.key)}</text>
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
      <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.5" fill="#cc2a15" />
      <g class="sentence-chart-tooltip">
        <line x1="${x.toFixed(2)}" y1="${dimensions.top}" x2="${x.toFixed(2)}" y2="${height - dimensions.bottom}" stroke="rgba(204,42,21,.25)" stroke-width="1" stroke-dasharray="4 5" />
        <rect x="${boxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="124" height="40" rx="8" fill="#8f2514" opacity=".95" />
        <text x="${(boxX + 10).toFixed(2)}" y="${(boxY + 17).toFixed(2)}" fill="#fff" font-size="11" font-weight="900">累積：${escapeHtml(point.cumulative)} 題</text>
        <text x="${(boxX + 10).toFixed(2)}" y="${(boxY + 31).toFixed(2)}" fill="#ffe3c2" font-size="10" font-weight="800">${escapeHtml(point.key)}</text>
      </g>
    </g>`;
  }).join("") : "";
  const hasVisibleData = series.periodTotal > 0 || (showCumulative && points.some((point) => point.cumulative > 0));
  const empty = hasVisibleData ? "" : `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#786358" font-size="20" font-weight="900">這個時段暫時未有完成題目</text>`;
  return `<rect x="0" y="0" width="${width}" height="${height}" fill="rgba(255,255,255,.62)" />
    ${grid}
    <line x1="${dimensions.left}" y1="${dimensions.top}" x2="${dimensions.left}" y2="${height - dimensions.bottom}" stroke="rgba(63,38,30,.16)" stroke-width="1.4" />
    <line x1="${dimensions.left}" y1="${height - dimensions.bottom}" x2="${width - dimensions.right}" y2="${height - dimensions.bottom}" stroke="rgba(63,38,30,.16)" stroke-width="1.4" />
    <polyline data-chart-series="daily" points="${path}" fill="none" stroke="#e84a1b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    ${showCumulative ? `<polyline data-chart-series="cumulative" points="${cumulativePath}" fill="none" stroke="#cc2a15" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />` : ""}
    ${hoverPoints}${cumulativeHoverPoints}${labels}
    <text x="${dimensions.left}" y="19" fill="#8f2514" font-size="13" font-weight="900">完成題數</text>
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
    const outcome = row.correctedAt ? "已改正" : row.status === "correct" ? "答對" : row.status === "wrong" ? "待改正" : "已提交";
    return `<div class="sentence-progress-day-row">
      <strong>${escapeHtml(lessonTitle(lesson))} · Question ${escapeHtml(question?.number || "")}</strong>
      <span>${escapeHtml(question?.prompt || question?.english || "")}</span>
      <em class="${row.status === "correct" ? "is-correct" : ""}">${outcome}</em>
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
    <text x="${dimensions.left - 12}" y="${(yFor(value) + 4).toFixed(2)}" text-anchor="end" fill="#786358" font-size="13" font-weight="800">${value}</text>
  `).join("");
  const labelIndexes = points.length ? [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])] : [];
  const labels = labelIndexes.map((index) => `
    <text x="${xFor(index).toFixed(2)}" y="${height - 17}" text-anchor="middle" fill="#786358" font-size="13" font-weight="800">${escapeHtml(compactProgressDate(points[index].date))}</text>
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
  const empty = series.stats.periodTotalMs > 0 ? "" : `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#786358" font-size="20" font-weight="900">這個時段暫時未有練習時間紀錄</text>`;
  return `<rect x="0" y="0" width="${width}" height="${height}" fill="rgba(255,255,255,.62)" />
    ${grid}
    <line x1="${dimensions.left}" y1="${dimensions.top}" x2="${dimensions.left}" y2="${height - dimensions.bottom}" stroke="rgba(63,38,30,.16)" stroke-width="1.4" />
    <line x1="${dimensions.left}" y1="${height - dimensions.bottom}" x2="${width - dimensions.right}" y2="${height - dimensions.bottom}" stroke="rgba(63,38,30,.16)" stroke-width="1.4" />
    <polyline data-chart-series="time" points="${path}" fill="none" stroke="#ff914d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    ${hoverPoints}${labels}
    <text x="${dimensions.left}" y="19" fill="#8f2514" font-size="13" font-weight="900">分鐘</text>
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
    const progress = displayAttemptProgress(lesson, row.attempt);
    return `<div class="sentence-progress-day-row">
      <strong>${escapeHtml(lessonTitle(lesson))}</strong>
      <span>${escapeHtml(formatDateTime(row.time))} · ${escapeHtml(progress.label)} · ${escapeHtml(progress.count)}/${escapeHtml(row.attempt.totalCount)} 題</span>
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
  if (!attempts.length) return '<p class="empty-state">暫時未有練習記錄。完成或開始一組慣用語練習後，記錄會顯示在這裡。</p>';
  return attempts.map((attempt) => {
    const lesson = getLesson(attempt.lessonId);
    const progress = displayAttemptProgress(lesson, attempt);
    const complete = progress.complete;
    const rounds = Array.isArray(attempt.result?.rounds) ? attempt.result.rounds.length : attempt.roundNumber;
    return `
      <details class="attempt-row">
        <summary>
          <span class="attempt-summary-title">
            <strong>${escapeHtml(lessonTitle(lesson))}</strong>
            <small>${escapeHtml(formatDateTime(attempt.startedAt || attempt.updatedAt))}</small>
          </span>
          <span class="attempt-score ${complete ? "" : "in-progress"}">${escapeHtml(progress.label)} · ${escapeHtml(progress.count)}/${escapeHtml(attempt.totalCount)}</span>
        </summary>
        <div class="attempt-details">
          <div class="attempt-details-grid">
            <div class="attempt-detail"><span>狀態</span><strong>${compassFor(lesson) ? progress.label : complete ? "全部答對" : "尚未完成"}</strong></div>
            <div class="attempt-detail"><span>${compassFor(lesson) ? "已核對題目" : "提交記錄"}</span><strong>${escapeHtml(compassFor(lesson) ? progress.count : rounds)} ${compassFor(lesson) ? "題" : "次"}</strong></div>
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
  pauseExerciseClock({ persist: state.lessonPage === EXERCISE_PAGE });
  if (state.lessonId !== lesson.id) {
    state.visitedLessonPages = new Set();
  }
  if (state.lessonId !== lesson.id || (attempt && state.exercise?.id !== attempt.id)) state.pilotOpenModels = new Set();
  state.lessonId = lesson.id;
  state.lessonPage = Math.max(1, Math.min(LESSON_PAGES, Number(page) || 1));
  if (compassFor(lesson) && state.lessonPage === 4) state.lessonPage = 5;
  state.visitedLessonPages.add(state.lessonPage);
  const currentExercise = state.exercise?.lessonId === lesson.id ? state.exercise : null;
  state.exercise = attempt ? exerciseFromAttempt(attempt) : currentExercise;
  if (state.exercise && compassFor(lesson)) {
    state.exercise.awaitingNextRound = false;
    state.exercise.correctionMode = false;
    state.exercise.correctionIds = [];
  }
  if (questionId && compassFor(lesson)) {
    ensureExercise(lesson);
  }
  if (state.lessonPage === EXERCISE_PAGE && questionId) {
    const exercise = ensureExercise(lesson);
    if (exercise.correctionMode && !exercise.correctionIds.includes(questionId)) {
      exercise.correctionMode = false;
      exercise.correctionIds = [];
    }
  }
  elements.lessonKicker.textContent = lessonEnglishTitle(lesson).toUpperCase();
  elements.lessonTitle.textContent = lessonTitle(lesson);
  showView("lesson");
  renderLessonPage();
  const targetQuestionId = questionId || (state.lessonPage === EXERCISE_PAGE ? currentProgressQuestionId(lesson) : "");
  if (targetQuestionId) focusExerciseQuestion(targetQuestionId);
}

function setLessonPage(page) {
  let nextPage = Math.max(1, Math.min(LESSON_PAGES, Number(page) || 1));
  if (compassFor() && nextPage === 4) nextPage = state.lessonPage > 4 ? 3 : 5;
  pauseExerciseClock({ persist: state.lessonPage === EXERCISE_PAGE && nextPage !== EXERCISE_PAGE });
  state.lessonPage = nextPage;
  state.visitedLessonPages.add(nextPage);
  renderLessonPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (state.lessonPage === EXERCISE_PAGE) {
    const targetQuestionId = currentProgressQuestionId();
    if (targetQuestionId) focusExerciseQuestion(targetQuestionId);
  }
}

function currentProgressQuestionId(lesson = getLesson()) {
  if (!lesson || !state.exercise) return "";
  if (compassFor(lesson) && !state.exercise.correctionMode) {
    const batch = pilotBatchQuestions(lesson);
    const reviewed = compassReviewedIds(lesson, state.exercise.questionState, state.exercise.correctIds);
    return String(batch.find((question) => !reviewed.has(question.id))?.id || batch[0]?.id || "");
  }
  const questions = orderQuestions(state.exercise.correctionMode ? correctionQuestions(lesson) : lesson.questions || [],{system:'idiom-system',owner:state.user?.id,lessonId:state.lessonId});
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
  const compass = compassFor();
  elements.lessonStepper.classList.toggle("is-compass", Boolean(compass));
  const pilotLabels = [
    ["一眼懂", "Meaning"], ["找線索", "Scene"], ["選語氣", "Tone"], ["", ""],
    ["用慣用語回應", "Say it"], ["避開誤用", "Boundary"], ["出手檢查", "Ready"], ["全部練習", "Practice"]
  ];
  elements.lessonStepper.querySelectorAll("[data-step]").forEach((button) => {
    const step = Number(button.dataset.step);
    button.hidden = Boolean(compass && step === 4);
    const ordinal = button.querySelector("span");
    if (ordinal) ordinal.textContent = String(compass && step > 4 ? step - 1 : step);
    if (compass) {
      const label = pilotLabels[step - 1];
      const title = button.querySelector("strong");
      const subtitle = button.querySelector("small");
      if (title) title.textContent = label[0];
      if (subtitle) subtitle.textContent = label[1];
    } else {
      const originalLabels = [["公式＋例句", "Formula + Example"], ["語域及語氣", "Register + Tone"], ["固定及可變部分", "Fixed + Variable"], ["所有特定句式", "All Forms"], ["表達好處", "Benefits"], ["歷史及來源", "History + Origin"], ["重要規則", "Important Rules"], ["句子練習", "Exercise"]];
      const label = originalLabels[step - 1];
      const title = button.querySelector("strong");
      const subtitle = button.querySelector("small");
      if (title) title.textContent = label[0];
      if (subtitle) subtitle.textContent = label[1];
    }
    button.toggleAttribute("aria-current", step === state.lessonPage);
    if (step === state.lessonPage) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
    button.classList.toggle("is-complete", step !== state.lessonPage && state.visitedLessonPages.has(step));
  });
  const exerciseVisible = state.lessonPage === EXERCISE_PAGE && state.exercise;
  elements.lessonRound.hidden = !exerciseVisible;
  if (exerciseVisible) elements.lessonRound.textContent = `${compass ? compassReviewedCount() : state.exercise.correctIds.length}/${compass ? compassPracticeQuestions().length : getLesson()?.questions?.length || 0} 題完成`;
}

function pilotBatchQuestions(lesson = getLesson()) {
  return compassPracticeQuestions(lesson);
}

function infoPageHeader(number, titleZh, titleEn, english, description = "") {
  return `<header class="info-page-header">
    <span class="page-label">PAGE ${escapeHtml(number)} · ${escapeHtml(english)}</span>
    <h2>${escapeHtml(titleZh)}<small>${escapeHtml(titleEn)}</small></h2>
    ${description ? `<p>${escapeHtml(description)}</p>` : ""}
  </header>`;
}

function renderCompassPage(lesson, page) {
  if (page === 4) page = 5; // Retain old bookmark keys without exposing the retired stage.
  const guide = compassFor(lesson);
  const names = [
    ["一眼懂", "Meaning at a glance", "01 · THE IDEA"],
    ["找線索", "Spot the clue", "02 · SITUATION"],
    ["選語氣", "Choose the tone", "03 · SOCIAL SIGNAL"],
    ["", "", ""],
    ["用慣用語回應", "Say it naturally", "04 · USE THE IDIOM"],
    ["避開誤用", "Know the boundary", "05 · USE WITH CARE"],
    ["出手檢查", "Ready to use", "06 · POCKET CHECK"]
  ];
  const [titleZh, titleEn, eyebrow] = names[page - 1];
  const choice = guide.choices[page];
  const choiceKey = `${lesson.id}:${page}`;
  const selected = state.pilotSelections[choiceKey];
  const rotation = choice ? (Number(lesson.order || 0) + page) % choice.options.length : 0;
  const options = choice ? choice.options.map((_, index) => {
    const sourceIndex = (index - rotation + choice.options.length) % choice.options.length;
    return { en: choice.optionsEn[sourceIndex], zh: choice.optionsZh?.[sourceIndex] || "" };
  }) : [];
  const correctOption = choice ? (choice.correct + rotation) % choice.options.length : -1;
  const answeredCorrectly = selected === correctOption;
  const selectedSourceIndex = choice && selected !== undefined
    ? (selected - rotation + choice.options.length) % choice.options.length : -1;
  let body = "";
  const guideLabel = (label) => {
    const parts = label.split(" · ");
    const zh = parts.find(part => /[\u3400-\u9fff]/.test(part)) || "";
    const en = parts.find(part => !/[\u3400-\u9fff]/.test(part)) || "";
    return `<span class="compass-section-label" lang="zh-Hant">${escapeHtml(zh)}<small lang="en">${escapeHtml(en)}</small></span>`;
  };
  const note = (label, en, zh, extra = "") => `<div class="compass-note ${extra}">${guideLabel(label)}<p class="compass-chinese" lang="zh-Hant">${escapeHtml(zh)}</p><p class="compass-english" lang="en">${escapeHtml(en)}</p></div>`;
  if (page === 1) body = `<div class="compass-intro"><div class="compass-meaning"><span>MEANING · 意思</span><strong>${escapeHtml(guide.meaningEn)}</strong><p>${escapeHtml(guide.meaningZh)}</p></div>${lesson.image ? `<img class="compass-art" src="${escapeHtml(lesson.image)}" alt="${escapeHtml(lesson.imageAlt || lessonEnglishTitle(lesson))}" loading="lazy">` : ""}</div>
    <div class="compass-usage"><span>HEAR IT IN USE · 實際用法</span><strong>${escapeHtml(guide.modelEn)}</strong><small>${escapeHtml(guide.modelZh)}</small></div>
    <div class="compass-two">${note("MENTAL PICTURE · 畫面記憶", guide.pictureEn, guide.picture)}${note("USE WITH CARE · 別用錯", guide.boundaryEn, guide.boundary)}</div>`;
  else if (page === 7) body = `<div class="compass-ready"><p>Before you use it, ask yourself:<small>使用前，問自己：</small></p><ol>${guide.checksEn.map((check, index) => `<li><strong>${escapeHtml(check)}</strong><small>${escapeHtml(guide.checks[index])}</small></li>`).join("")}</ol></div>
    <section class="question-card compass-read-aloud" data-edmund-prompt-text="${escapeHtml(guide.readAloudEn)}" data-edmund-record-id="${escapeHtml(`${lesson.id}-pocket-read-aloud`)}" data-edmund-record-title="${escapeHtml(`英文慣用語 · Pocket Check · ${lessonEnglishTitle(lesson)}`)}">
      <span class="compass-read-aloud__label">READ ALOUD · 跟讀練習</span>
      <p class="compass-read-aloud__instruction">先聽示範，再讀出這句英文並錄下自己的聲音。<small>Listen, then read and record this sentence.</small></p>
      <div class="question-prompt"><p class="english">${escapeHtml(guide.readAloudEn)}</p><p class="chinese">${escapeHtml(guide.readAloudZh)}</p></div>
    </section>
    ${note("PRACTICE · 練習方式", "All questions are on the next page. Start with any five and continue later.", "下一頁會列出所有題目；可先完成任意五題，稍後再繼續。")}`;
  else body = `${page === 3 ? `<div class="compass-two">${note("自然場合 · WHERE IT FITS", guide.whereEn, guide.where)}${note("語氣提示 · TONE", guide.toneEn, guide.tone)}</div>` : ""}
    ${page === 6 ? note("使用界線 · USE WITH CARE", guide.boundaryEn, guide.boundary, "compass-boundary") : ""}
    <section class="compass-decision" aria-labelledby="compass-prompt">${guideLabel("作個判斷 · YOUR CALL")}<h3 id="compass-prompt">${escapeHtml(choice.promptZh)}<small lang="en">${escapeHtml(choice.promptEn)}</small></h3>
      <div class="compass-options">${options.map((option, index) => `<button class="compass-option ${selected !== undefined && index === correctOption && answeredCorrectly ? "is-right" : selected === index && !answeredCorrectly ? "is-wrong" : ""}" type="button" data-compass-choice="${index}" data-compass-page="${page}" aria-pressed="${selected === index}"><span>${index + 1}</span><span class="compass-option-copy"><strong lang="zh-Hant">${escapeHtml(option.zh)}</strong><small lang="en">${escapeHtml(option.en)}</small></span></button>`).join("")}</div>
      ${selected !== undefined ? `<div class="compass-feedback ${answeredCorrectly ? "is-right" : "is-wrong"}" role="status"><strong lang="zh-Hant">${answeredCorrectly ? "✓ 判斷正確。" + escapeHtml(choice.feedback) : "請再試一次。" + escapeHtml(choice.options[selectedSourceIndex] || "請再看一次題目的關鍵線索。")}</strong><small lang="en">${answeredCorrectly ? "✓ Good call. " + escapeHtml(choice.feedbackEn) : "Try again. Check the meaning and the evidence in the situation."}</small></div>` : ""}</section>
    `;
  elements.lessonContent.innerHTML = `<article class="info-page compass-page">
    <header class="compass-header"><span class="page-label">慣用語指南 · ${String(page > 4 ? page - 1 : page).padStart(2, "0")}<small lang="en">IDIOM COMPASS · ${eyebrow}</small></span><h2 lang="zh-Hant">${escapeHtml(titleZh)}<small lang="en">${escapeHtml(titleEn)}</small></h2><p>${escapeHtml(lesson.titleZh || guide.meaningZh)}<small lang="en">${escapeHtml(lessonEnglishTitle(lesson))}</small></p></header>
    ${body}${navHtml(page)}
  </article>`;
}

function bilingualHeadingHtml(chinese, english) {
  return `${escapeHtml(chinese || "")}${english ? `<small>${escapeHtml(english)}</small>` : ""}`;
}

function bilingualCopyHtml(chinese, english) {
  return `${chinese ? `<p class="chinese-primary">${escapeHtml(chinese)}</p>` : ""}${english ? `<p class="english-secondary">${escapeHtml(english)}</p>` : ""}`;
}

function bilingualListHtml(chineseItems, englishItems) {
  const count = Math.max(chineseItems.length, englishItems.length);
  return `<ul class="bilingual-list">${Array.from({ length: count }, (_, index) => {
    const chinese = chineseItems[index] || "";
    const english = englishItems[index] || "";
    return `<li>${chinese ? `<strong>${escapeHtml(chinese)}</strong>` : ""}${english ? `<small>${escapeHtml(english)}</small>` : ""}</li>`;
  }).join("")}</ul>`;
}

const highlightCandidateCache = new WeakMap();

function lessonHighlightCandidates(lesson = getLesson()) {
  if (!lesson || typeof lesson !== "object") return [];
  const cached = highlightCandidateCache.get(lesson);
  if (cached) return cached;
  const candidates = new Set();
  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, item] of Object.entries(value)) {
      if (key === "highlight" && typeof item === "string" && item.trim()) candidates.add(item.trim());
      else if (key !== "questions") visit(item);
    }
  };
  visit(lesson);
  (lesson.questions || []).forEach((question) => {
    if (typeof question?.highlight === "string" && question.highlight.trim()) {
      candidates.add(question.highlight.trim());
    }
  });
  const result = [...candidates].sort((left, right) => right.length - left.length);
  highlightCandidateCache.set(lesson, result);
  return result;
}

function relevantExampleHtml(value, explicitHighlight = "", lesson = getLesson()) {
  const full = String(value || "");
  if (explicitHighlight) return highlightedAnswerHtml(full, explicitHighlight);
  if (/^\s*Literal:/i.test(full)) return escapeHtml(full);
  const lower = full.toLocaleLowerCase();
  const candidates = lessonHighlightCandidates(lesson);
  if (!candidates.length) return escapeHtml(full);
  let cursor = 0;
  let html = "";
  while (cursor < full.length) {
    let selected = "";
    let index = -1;
    for (const candidate of candidates) {
      const found = lower.indexOf(candidate.toLocaleLowerCase(), cursor);
      if (found >= 0 && (index < 0 || found < index || (found === index && candidate.length > selected.length))) {
        index = found;
        selected = candidate;
      }
    }
    if (index < 0) break;
    html += escapeHtml(full.slice(cursor, index));
    html += `<span class="target-highlight">${escapeHtml(full.slice(index, index + selected.length))}</span>`;
    cursor = index + selected.length;
  }
  return `${html}${escapeHtml(full.slice(cursor))}`;
}

function bilingualLearningNoteHtml(chinese, english) {
  return `${chinese ? `<p class="chinese-primary">${escapeHtml(chinese)}</p>` : ""}${english ? `<p class="english-secondary">${relevantExampleHtml(english)}</p>` : ""}`;
}

function navHtml(page) {
  return `<div class="lesson-navigation">
    ${page > 1 ? `<button class="secondary-button" type="button" data-lesson-prev>← 上一頁</button>` : '<button class="secondary-button" type="button" data-back-to-dashboard>← 返回慣用語選擇</button>'}
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
  const meaning = lesson.meaning || {};
  const naturalMeanings = Array.isArray(meaning.naturalZh) ? meaning.naturalZh : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${infoPageHeader(1, "句式及例子", "Formula(s) + Example(s)", "CORE MEANING + FORMULA", "先掌握慣用語的核心意思及固定骨架。")}
    <section class="formula-card">
      <span class="formula-label">慣用語句式 · FORMULA</span>
      <div class="formula-display">${formulaRows.filter((row) => row?.formula || typeof row === "string").map((row) => {
        const formula = typeof row === "string" ? row : row.formula;
        const labelZh = typeof row === "string" ? "" : (row.labelZh || "");
        const labelEn = typeof row === "string" ? "" : (row.labelEn || "");
        const primaryLabel = labelZh || labelEn;
        const secondaryLabel = labelZh && labelEn ? labelEn : "";
        return `<p>${primaryLabel ? `<small>${escapeHtml(primaryLabel)}${secondaryLabel ? `<span>${escapeHtml(secondaryLabel)}</span>` : ""}</small>` : ""}${escapeHtml(formula)}</p>`;
      }).join("")}</div>
      ${examples.filter((example) => example?.english || example?.en || example?.answer).map((example) => `
        <div class="example-block">
          <strong>${escapeHtml(example.labelZh || "例句")} · ${escapeHtml(example.labelEn || "EXAMPLE")}</strong>
          <p>${relevantExampleHtml(example.english || example.en || example.answer, example.highlight)}</p>
          <p>${escapeHtml(example.chinese || example.zh || example.answerZh || "")}</p>
        </div>`).join("")}
      <aside class="meaning-block">
        <h3>核心意思<small>CORE MEANING</small></h3>
        ${bilingualCopyHtml(meaning.zh, meaning.en)}
        ${naturalMeanings.length ? `<ul class="meaning-list">${naturalMeanings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      </aside>
    </section>
    ${navHtml(1)}
  </article>`;
}

function bilingualItem(item) {
  if (typeof item === "string") return { english: item, chinese: "", examples: [] };
  return {
    english: String(item?.english || item?.en || ""),
    chinese: String(item?.chinese || item?.zh || item?.text || ""),
    examples: Array.isArray(item?.examples) ? item.examples : []
  };
}

function renderRegisterPage(lesson) {
  const register = lesson.register || {};
  const contextsEn = Array.isArray(register.contextsEn) ? register.contextsEn : [];
  const contextsZh = Array.isArray(register.contextsZh) ? register.contextsZh : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${infoPageHeader(2, "語域及語氣", "Register and Tone", "REGISTER + TONE", "了解這個慣用語最自然的場合，以及何時應改用較正式的字詞。")}
    <section class="lesson-prose-grid">
      <article class="lesson-prose-card is-wide">
        <h3>${bilingualHeadingHtml(register.labelZh || "非正式至中性", register.labelEn || "Informal to Neutral")}</h3>
        ${bilingualCopyHtml(register.summaryZh, register.summaryEn)}
      </article>
      <article class="lesson-prose-card is-wide">
        <h3>常見自然場合 <small>Especially Natural In</small></h3>
        ${bilingualListHtml(contextsZh, contextsEn)}
      </article>
      <article class="lesson-prose-card is-wide">
        <h3>較正式的替代字詞 <small>More Formal Alternatives</small></h3>
        ${bilingualCopyHtml(register.formalZh, register.formalEn)}
      </article>
    </section>
    ${navHtml(2)}
  </article>`;
}

function renderFixedVariablePage(lesson) {
  const parts = lesson.fixedVariable || {};
  const forms = Array.isArray(parts.forms) ? parts.forms : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${infoPageHeader(3, "固定部分及可變部分", "Fixed and Variable Parts", "WHAT STAYS + WHAT CHANGES", "分辨必須保留的固定字詞，以及可按主語、時態或情境改變的部分。")}
    <section class="lesson-prose-grid">
      <article class="lesson-prose-card">
        <h3>固定部分 <small>Fixed Part</small></h3>
        <div class="formula-display"><p>${escapeHtml(parts.fixed || "—")}</p></div>
        ${bilingualCopyHtml(parts.fixedZh, parts.fixedEn)}
      </article>
      <article class="lesson-prose-card">
        <h3>可變部分 <small>Variable Part</small></h3>
        ${bilingualCopyHtml(parts.variableZh, parts.variableEn)}
      </article>
    </section>
    <table class="form-table">
      <thead><tr><th>形式<small>Form</small></th><th>例句<small>Example</small></th></tr></thead>
      <tbody>${forms.map((row) => `<tr><td>${escapeHtml(row.form)}</td><td>${relevantExampleHtml(row.example, row.highlight)}</td></tr>`).join("")}</tbody>
    </table>
    ${navHtml(3)}
  </article>`;
}

function renderSpecificFormsPage(lesson) {
  const forms = Array.isArray(lesson.specificForms) ? lesson.specificForms : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${infoPageHeader(4, "所有特定句式", "Formulas and All Specific Forms", `${forms.length || "ALL"} USEFUL FORMULAS`, "由基本形式開始，逐一掌握這個慣用語的常用句式及自然用法。")}
    <div class="specific-form-list">${forms.map((form, index) => `
      <article class="specific-form-card">
        <header>
          <span>${escapeHtml(form.number || index + 1)}</span>
          <h3>${bilingualHeadingHtml(form.titleZh, form.titleEn)}</h3>
        </header>
        <code>${escapeHtml(form.formula || "")}</code>
        ${bilingualCopyHtml(form.descriptionZh, form.descriptionEn)}
        ${(form.examples || []).map((example) => `<div class="example-block"><strong>例句 · EXAMPLE</strong><p>${relevantExampleHtml(example.en || "", example.highlight)}</p><p>${escapeHtml(example.zh || "")}</p></div>`).join("")}
        ${(form.notes || []).map((note) => `<div class="origin-memory">${note.zh ? `<p class="chinese-primary">${escapeHtml(note.zh)}</p>` : ""}${note.en ? `<p class="english-secondary">${relevantExampleHtml(note.en, note.highlight)}</p>` : ""}</div>`).join("")}
      </article>`).join("")}</div>
    ${navHtml(4)}
  </article>`;
}

function renderBenefitsPage(lesson) {
  const benefits = Array.isArray(lesson.benefits) ? lesson.benefits : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${infoPageHeader(5, "表達好處", "Benefits", "WHY THIS IDIOM HELPS", "理解這個慣用語能帶來的表達效果，並在合適情境中自然運用。")}
    <ol class="benefit-list">
      ${benefits.map((raw, index) => {
        const item = bilingualItem(raw);
        return `<li class="benefit-card"><span>${index + 1}</span><div>
          ${(raw?.titleEn || raw?.titleZh) ? `<h3>${bilingualHeadingHtml(raw.titleZh, raw.titleEn)}</h3>` : ""}
          ${item.chinese ? `<p class="chinese">${escapeHtml(item.chinese)}</p>` : ""}
          ${item.english ? `<p class="english">${relevantExampleHtml(item.english, raw?.highlight)}</p>` : ""}
          ${(raw?.examples || []).map((example) => `<div class="examples"><code>${relevantExampleHtml(example.en || example, example.highlight)}</code>${example.zh ? `<span>${escapeHtml(example.zh)}</span>` : ""}</div>`).join("")}
        </div></li>`;
      }).join("")}
    </ol>
    ${navHtml(5)}
  </article>`;
}

function renderOriginPage(lesson) {
  const origin = lesson.origin || {};
  const history = Array.isArray(origin.history) ? origin.history : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${infoPageHeader(6, "歷史及來源", "History and Origin", "HISTORY + ORIGIN", "從歷史背景、來源線索及記憶提示，理解這個慣用語的發展。")}
    <section class="lesson-prose-grid">
      <article class="origin-card">
        <h3>來源可信度 <small>Origin Status</small></h3>
        ${bilingualCopyHtml(origin.statusZh, origin.statusEn)}
      </article>
      ${history.map((item) => `<article class="origin-card is-wide"><h3>${bilingualHeadingHtml(item.titleZh, item.titleEn)}</h3>${bilingualCopyHtml(item.zh, item.en)}</article>`).join("")}
      <article class="origin-card is-wide">
        <h3>記憶提示 <small>Memory Link</small></h3>
        <div class="origin-memory">${bilingualCopyHtml(origin.memoryZh, origin.memoryEn)}</div>
      </article>
    </section>
    ${navHtml(6)}
  </article>`;
}

function renderRulesPage(lesson) {
  const rules = Array.isArray(lesson.rules) ? lesson.rules : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${infoPageHeader(7, "重要規則", "Important Rules", `${rules.length || "KEY"} IMPORTANT REMINDERS`, "留意固定字序、文法變化、搭配、字面意思及自然使用情境。")}
    <ol class="rule-list">
      ${rules.map((raw, index) => {
        const item = bilingualItem(raw);
        const examples = Array.isArray(raw?.examples) ? raw.examples : item.examples;
        return `<li class="rule-card"><span>${index + 1}</span><div>
          ${(raw?.titleEn || raw?.titleZh) ? `<h3>${bilingualHeadingHtml(raw.titleZh, raw.titleEn)}</h3>` : ""}
          ${item.chinese ? `<p class="chinese">${escapeHtml(item.chinese)}</p>` : ""}
          ${item.english ? `<p class="english">${relevantExampleHtml(item.english, raw?.highlight)}</p>` : ""}
          ${examples.length ? `<div class="examples">${examples.map((example) => `<code>${relevantExampleHtml(example.en || example, example.highlight)}</code>${example.zh ? `<span>${escapeHtml(example.zh)}</span>` : ""}`).join("")}</div>` : ""}
        </div></li>`;
      }).join("")}
    </ol>
    ${navHtml(7)}
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
    completedAt: "",
    pilotBatchIndex: 0
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
    ? result.correctionIds.map(String).filter((id) => validQuestionIds.has(id) && !correctIds.includes(id))
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
  const reviewed = compassReviewedIds(lesson, questionState, correctIds);
  const allPracticeQuestions = compassPracticeQuestions(lesson);
  const firstUnreviewedIndex = allPracticeQuestions.findIndex((question) => !reviewed.has(question.id));
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
    pilotBatchIndex: firstUnreviewedIndex < 0 ? Math.ceil(allPracticeQuestions.length / 5) - 1 : Math.floor(firstUnreviewedIndex / 5),
    durationMs: Math.max(0, attempt.durationMs),
    startedAt: attempt.startedAt || new Date().toISOString(),
    completedAt: attempt.completedAt || ""
  };
}

function ensureExercise(lesson) {
  if (state.exercise?.lessonId === lesson.id) return state.exercise;
  const resumable = state.attempts.find((attempt) => attempt.lessonId === lesson.id && (compassFor(lesson) || attempt.status !== "completed"));
  state.exercise = resumable ? exerciseFromAttempt(resumable) : createExercise(lesson);
  if (compassFor(lesson)) {
    state.exercise.awaitingNextRound = false;
    state.exercise.correctionMode = false;
    state.exercise.correctionIds = [];
  }
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
  return window.EdmundAnswerComparison.expectedMarkup(answer, studentAnswer, escapeHtml, {
    canonicalizeToken: canonicalSpellingToken
  });
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
    const selectedAnswer = studentAnswer === null
      ? question.answer
      : answerComparison(studentAnswer, question).expectedAnswer || question.answer;
    const answerHtml = studentAnswer === null
      ? highlightedAnswerHtml(selectedAnswer, question.highlight)
      : comparedAnswerHtml(selectedAnswer, studentAnswer, question.highlight);
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
  const voiceAnswer = answerParts.length ? answerParts.map((part) => part.answer).join(" ") : String(question.answer || "");
  return `<article class="question-card ${correct ? "is-correct" : wrong ? "is-wrong" : ""} ${collapsed ? "is-collapsed" : ""}" data-question-id="${escapeHtml(question.id)}" data-edmund-prompt-text="${escapeHtml(question.prompt || question.english || "")}"${revealAnswer ? ` data-edmund-answer-text="${escapeHtml(voiceAnswer)}"` : ""} data-edmund-record-id="${escapeHtml(question.id)}" data-edmund-record-title="${escapeHtml(`英文慣用語 · 第 ${question.number || ""} 題`)}">
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
      <p class="question-feedback" aria-live="polite">${correct ? answerComparison(value, question).typoCount === 1 ? "✓ 答案正確；黃色標示一個可留意的拼寫。" : "✓ 答案正確，這題已完成。" : wrong ? unresolvedCorrection ? "答案未完全符合目標慣用語；請再次修改後提交。" : "答案未完全符合目標慣用語；請參考答案並修改。" : ""}</p>
      ${revealAnswer ? `<div class="answer-reveal"><span>SUGGESTED ANSWER · 參考答案（黃色為遺漏或需修改部分）</span>${suggestedAnswerHtml(question, value)}</div>` : ""}
    </div>
  </article>`;
}

const COMPASS_DETAIL_SWAPS = {
  "idiom-01": [
    [/\bfirst\b/i, "last"], [/\bmeeting\b/i, "rehearsal"], [/\bclass\b/i, "club"],
    [/\bdiscussion\b/i, "presentation"], [/\bschool\b/i, "office"],
    [/\bintroduction\b/i, "conclusion"], [/\bidea\b/i, "objection"], [/\btask\b/i, "game"],
    [/\bproject\b/i, "campaign"], [/\bdebate\b/i, "performance"], [/\bemail\b/i, "letter"],
    [/\bbeach\b/i, "park"], [/\bclean-up\b/i, "festival"], [/\bbook\b/i, "film"],
    [/\bjob\b/i, "course"], [/\bapplication\b/i, "interview"], [/\bwebsite\b/i, "brochure"],
    [/\bfair\b/i, "concert"], [/\bshop\b/i, "library"], [/\bteam\b/i, "class"],
    [/\bfamily\b/i, "club"], [/\bplans\b/i, "budgets"], [/\bplan\b/i, "budget"], [/\bnew\b/i, "old"],
    [/\bday\b/i, "week"], [/\bshort\b/i, "lengthy"], [/\bhome\b/i, "school"],
    [/\bdelivery\b/i, "collection"], [/\btesting\b/i, "announcing"], [/\bten\b/i, "two"],
    [/\bcustomers\b/i, "workers"], [/\blift\b/i, "roof"], [/\brepair\b/i, "inspection"],
    [/\bsimple\b/i, "lengthy"], [/\bvote\b/i, "speech"], [/\bfans\b/i, "staff"],
    [/\b1,000\b/i, "100"], [/\bworkshop\b/i, "performance"], [/\bscene\b/i, "poster"],
    [/\btravel\b/i, "school"], [/\bdates\b/i, "prices"], [/\bdance floor\b/i, "stage"],
    [/\bbirthday\b/i, "retirement"], [/\bdinner\b/i, "breakfast"], [/\beasy\b/i, "difficult"],
    [/\bmedicines\b/i, "drugs"], [/\bhospital\b/i, "office"],
    [/\bwellbeing\b/i, "sports"], [/\boffering\b/i, "renting"]
  ],
  "idiom-02": [
    [/\bone minute\b/i, "one hour"], [/\bminutes\b/i, "hours"], [/\bfive\b/i, "fifty"],
    [/\btwo\b/i, "twenty"], [/\bten\b/i, "thirty"], [/\bsix\b/i, "nine"],
    [/\bschool bus\b/i, "city bus"], [/\bmiss\b/i, "catch"],
    [/\bbus\b/i, "train"], [/\btrain\b/i, "flight"], [/\btaxi\b/i, "bus"],
    [/\bfilm\b/i, "play"], [/\bclass\b/i, "meeting"], [/\bshop\b/i, "museum"],
    [/\bmatch\b/i, "practice"], [/\btest\b/i, "lesson"], [/\binterview\b/i, "appointment"],
    [/\blate\b/i, "early"], [/\bstarts\b/i, "ends"],
    [/\bstart\b/i, "end"], [/\bcloses\b/i, "opens"], [/\bleaves\b/i, "arrives"],
    [/\beveryone is waiting for us\b/i, "everyone has gone without us"],
    [/\bwaiting for us\b/i, "already inside"], [/\bwaiting\b/i, "looking"],
    [/\balready\b/i, "rarely"], [/\bsoon\b/i, "tomorrow"],
    [/\bready\b/i, "unprepared"], [/\btoday\b/i, "tomorrow"], [/\bnoon\b/i, "midnight"],
    [/\bschool\b/i, "office"], [/\bteam\b/i, "audience"], [/\bnext\b/i, "last"],
    [/\bhome\b/i, "school"], [/\bclouds\b/i, "sunshine"], [/\bfood\b/i, "drinks"],
    [/\bgate\b/i, "café"], [/\bprinter\b/i, "scanner"], [/\bpapers\b/i, "posters"],
    [/\bflight\b/i, "concert"], [/\bgates\b/i, "shops"], [/\bpacking\b/i, "unpacking"],
    [/\blibrary\b/i, "classroom"], [/\bcake\b/i, "soup"], [/\boven\b/i, "fridge"],
    [/\bguests\b/i, "neighbours"], [/\bchairs\b/i, "tables"], [/\brain\b/i, "wind"],
    [/\bbooks\b/i, "games"], [/\bcurtain\b/i, "rehearsal"], [/\bnow\b/i, "tomorrow"],
    [/\bmeeting\b/i, "rehearsal"], [/\bthirty\b/i, "forty"], [/\blunch\b/i, "dinner"],
    [/\barrive\b/i, "leave"], [/\bfinish\b/i, "start"], [/\bclose\b/i, "open"]
  ],
  "idiom-03": [
    [/\bfirst day\b/i, "final day"], [/\bday one\b/i, "week ten"], [/\bfirst week\b/i, "last week"],
    [/\buseful changes\b/i, "minor notes"], [/\bready\b/i, "unprepared"],
    [/\bfirst\b/i, "last"], [/\bimmediately\b/i, "gradually"], [/\balready\b/i, "eventually"],
    [/\btomorrow\b/i, "next month"], [/\byesterday\b/i, "next month"], [/\bMonday\b/i, "Friday"],
    [/\bmorning\b/i, "evening"], [/\bweek\b/i, "month"], [/\bday\b/i, "month"],
    [/\bnew\b/i, "former"], [/\bjob\b/i, "course"], [/\bproject\b/i, "campaign"],
    [/\bcourse\b/i, "project"], [/\bteam\b/i, "class"], [/\bplan\b/i, "report"],
    [/\btraining\b/i, "interview"], [/\bresults\b/i, "plans"], [/\bchanges\b/i, "notes"],
    [/\bimproved\b/i, "reviewed"], [/\bfixing\b/i, "reviewing"], [/\bproduced\b/i, "discussed"],
    [/\bstart\b/i, "finish"], [/\bbeginning\b/i, "end"], [/\blaunch\b/i, "closing"],
    [/\bmeeting\b/i, "interview"], [/\bschool\b/i, "office"], [/\bclub\b/i, "team"],
    [/\bhospital\b/i, "clinic"], [/\broutine\b/i, "budget"], [/\bfunding\b/i, "report"],
    [/\blive event\b/i, "practice session"], [/\bevent\b/i, "meeting"],
    [/\bsupport\b/i, "supervision"], [/\bdetails\b/i, "figures"], [/\bmistakes\b/i, "delays"],
    [/\baccount\b/i, "project"], [/\bdata\b/i, "equipment"], [/\barticle\b/i, "proposal"],
    [/\btraining\b/i, "interview"], [/\bafternoon\b/i, "evening"],
    [/\bsteps\b/i, "plans"], [/\bconfidence\b/i, "permission"], [/\bbrief\b/i, "contract"],
    [/\bapproved\b/i, "rejected"],
    [/\bunclear\b/i, "clear"], [/\binstructions\b/i, "warnings"],
    [/\bprepared\b/i, "unprepared"], [/\bexperienced\b/i, "new"],
    [/\brisks\b/i, "benefits"], [/\bwill not\b/i, "will"],
    [/\bdid not\b/i, "did"], [/\bcannot\b/i, "can"], [/\bNo\b/i, "Yes"]
  ],
  "idiom-04": [
    [/\bthis weekend\b/i, "next weekend"], [/\bweekend\b/i, "holiday"],
    [/\bMonday\b/i, "Tuesday"], [/\bFriday\b/i, "Thursday"],
    [/\bblue\b/i, "red"], [/\bgreen\b/i, "yellow"],
    [/\bItalian\b/i, "Indian"], [/\bChinese\b/i, "Thai"],
    [/\bsix\b/i, "eight"], [/\bseven\b/i, "nine"],
    [/\bconcert\b/i, "play"], [/\bdate\b/i, "venue"], [/\bhotel\b/i, "restaurant"],
    [/\bphone\b/i, "laptop"], [/\bcourse\b/i, "job"], [/\brestaurant\b/i, "café"],
    [/\bpicnic\b/i, "party"], [/\bposter\b/i, "website"], [/\bdesign\b/i, "schedule"],
    [/\bstudy plans\b/i, "revision topics"], [/\bplans\b/i, "schedules"],
    [/\bplan\b/i, "budget"], [/\bchoice\b/i, "answer"], [/\bproject\b/i, "holiday"],
    [/\bteam\b/i, "class"], [/\bopening\b/i, "closing"], [/\bhours\b/i, "prices"],
    [/\bmonth\b/i, "week"], [/\bevery\b/i, "one"], [/\btwo\b/i, "three"],
    [/\bthree\b/i, "four"], [/\bday\b/i, "week"], [/\btime\b/i, "place"],
    [/\broom\b/i, "garden"], [/\broute\b/i, "stop"], [/\bweek\b/i, "month"],
    [/\bbuy\b/i, "sell"], [/\bmorning\b/i, "afternoon"], [/\bevening\b/i, "night"],
    [/\bhome\b/i, "school"], [/\boffice\b/i, "studio"], [/\bflats\b/i, "houses"],
    [/\brules\b/i, "teams"], [/\bgame\b/i, "meeting"], [/\bmenu\b/i, "sign"],
    [/\bguests\b/i, "staff"], [/\bnumber\b/i, "names"], [/\bactivities\b/i, "lessons"],
    [/\bSaturday\b/i, "Friday"], [/\bSunday\b/i, "Monday"],
    [/\bchildren\b/i, "adults"], [/\badults\b/i, "staff"], [/\bline-up\b/i, "schedule"],
    [/\bending\b/i, "opening"], [/\blesson\b/i, "holiday"],
    [/\btimetable\b/i, "menu"], [/\bvenue\b/i, "date"], [/\breunion\b/i, "concert"],
    [/\bdifferent\b/i, "identical"], [/\bclear\b/i, "vague"],
    [/\bjob\b/i, "course"], [/\bbefore\b/i, "after"], [/\bcolour\b/i, "size"],
    [/\bwalls\b/i, "curtains"], [/\bideas\b/i, "venues"],
    [/\bchoose one\b/i, "choose three"]
  ],
  "idiom-05": [
    [/\bacross Hong Kong\b/i, "within one school"], [/\bthe whole school\b/i, "just one class"],
    [/\bwhole town\b/i, "one street"], [/\banother country\b/i, "the same town"],
    [/\bcity championship\b/i, "local friendly match"], [/\bnext match\b/i, "training session"],
    [/\bthree branches\b/i, "one branch"], [/\b2,000\b/i, "20"], [/\b100\b/i, "10"],
    [/\bevery\b/i, "one"], [/\bworld\b/i, "town"],
    [/\binternational\b/i, "local"], [/\bregional\b/i, "school-wide"],
    [/\babroad\b/i, "near home"], [/\bcity-wide\b/i, "street-wide"],
    [/\bcity\b/i, "school"], [/\btown\b/i, "school"], [/\bcommunity\b/i, "family"],
    [/\bbranches\b/i, "tables"], [/\bthree\b/i, "one"], [/\bchildren\b/i, "adults"], [/\bstudents\b/i, "teachers"],
    [/\bschool\b/i, "club"], [/\bclass\b/i, "team"], [/\bwebsite\b/i, "noticeboard"],
    [/\bapp\b/i, "poster"], [/\blibrary\b/i, "shelf"], [/\bshow\b/i, "meeting"],
    [/\bplan\b/i, "trial"], [/\bproject\b/i, "task"], [/\bprogramme\b/i, "session"],
    [/\bregion\b/i, "school"], [/\bpeople\b/i, "friends"], [/\bonline\b/i, "in-person"],
    [/\btheatres\b/i, "classrooms"], [/\bmusic\b/i, "sport"], [/\bafford\b/i, "finish"],
    [/\bclub\b/i, "team"], [/\bbusiness\b/i, "hobby"], [/\bcustomers\b/i, "workers"],
    [/\brooms\b/i, "desks"], [/\bguests\b/i, "staff"], [/\bservice\b/i, "menu"],
    [/\bfilter\b/i, "poster"], [/\bvillages\b/i, "offices"],
    [/\baccessible\b/i, "private"], [/\btours\b/i, "meetings"], [/\bcities\b/i, "schools"],
    [/\bchampionship\b/i, "qualifier"], [/\bwin\b/i, "enter"],
    [/\bnext year\b/i, "next month"], [/\btowns\b/i, "schools"],
    [/\bone room\b/i, "one desk"], [/\blearning centre\b/i, "café"]
  ]
};

// Short source-bound rewrites for answers whose relevant detail falls before
// the idiom. They keep the actor and the sentence length close to the answer.
const COMPASS_CURATED_DETAIL_SWAPS = {
  "idiom-01-q18": [["a new price", "an old price"], ["company that sells us paper", "company that sells us ink"]],
  "idiom-01-q43": [["reading projects", "sports events"], ["other schools", "local museums"]],
  "idiom-02-q36": [["the classroom", "the library"], ["get into the classroom", "wait outside the classroom"]],
  "idiom-02-q37": [["last bus", "first bus"], ["last bus", "last train"]],
  "idiom-02-q40": [["meeting starts", "meeting ends"], ["two thirty", "three thirty"]],
  "idiom-02-q41": [["still on time", "already cancelled"], ["still packing", "already seated"]],
  "idiom-02-q43": [["the cake", "the bread"], ["before the guests arrive", "after the guests leave"]],
  "idiom-03-q14": [["expects its new sales director", "doesn't expect its new sales director"]],
  "idiom-03-q36": [["already tested", "not tested"], ["doors opened", "doors closed"]],
  "idiom-03-q45": [["final training", "initial interview"], ["Not if", "Yes, if"]],
  "idiom-05-q20": [["grow across the city", "grow within one school"], ["from the beginning", "at the very end"]],
  "idiom-05-q48": [["transport", "housing"], ["across the whole area", "on one street"]],
  "idiom-05-bonus-06": [["an international tour", "a local tour"], ["an international tour", "an international show"]]
};

function compassMcDetailFoils(answer, lessonId, questionId = "") {
  const curated = COMPASS_CURATED_DETAIL_SWAPS[questionId];
  if (curated) return curated.map(([original, replacement]) => ({
    text: answer.replace(original, replacement),
    reason: `這句把原題的「${original}」改成「${replacement}」，與原來的情境不符。`
  }));
  const idiomPattern = {
    "idiom-01": /\b(?:start(?:ed|s|ing)?|keep(?:s|ing|t)?) the ball rolling\b/i,
    "idiom-02": /shake a leg/i,
    "idiom-03": /hit(?:ting)? the ground running/i,
    "idiom-04": /chop(?:p(?:ing|ed)|s)? and chang(?:ing|ed|es|e)?/i,
    "idiom-05": /\b(?:think(?:ing|s)?|thought) big\b/i
  }[lessonId];
  const idiom = idiomPattern?.exec(answer);
  if (!idiom) return [];
  const before = answer.slice(0, idiom.index + idiom[0].length);
  const after = answer.slice(idiom.index + idiom[0].length);
  const prefix = answer.slice(0, idiom.index);
  const variants = [];
  for (const [pattern, replacement] of COMPASS_DETAIL_SWAPS[lessonId] || []) {
    const useAfter = pattern.test(after);
    const target = useAfter ? after : prefix;
    const match = pattern.exec(target);
    if (!match) continue;
    // Earlier words may describe the actor. Only alter a pre-idiom stance or
    // readiness cue; otherwise keep that actor and its role identical.
    if (!useAfter && !/^(?:Yes|No|ready|unprepared|prepared|unclear|clear|did not|will not|cannot)$/i.test(match[0])) continue;
    const changed = useAfter
      ? `${before}${after.slice(0, match.index)}${replacement}${after.slice(match.index + match[0].length)}`
      : `${prefix.slice(0, match.index)}${replacement}${prefix.slice(match.index + match[0].length)}${answer.slice(idiom.index)}`;
    if (changed === answer || variants.some((variant) => variant.text === changed)) continue;
    variants.push({ text: changed, reason: `這句把原題的「${match[0]}」改成「${replacement}」，與原來的情境不符。` });
    if (variants.length === 2) break;
  }
  return variants;
}

function compassMcFoils(question, lesson) {
  const answer = String(question.answer || "");
  const lessonId = String(lesson?.id || "");
  if (Number(lessonId.slice(-2)) >= 6 && Number(lessonId.slice(-2)) <= 30) {
    return window.EDMUND_IDIOM_COMPASS_FOILS?.(question, lesson) || [];
  }
  const formFoil = {
    "idiom-01": () => answer.replace(/\b(started|starts|start|starting) the ball rolling\b/i, (_, verb) => {
      const replacement = { started: "kept", starts: "keeps", start: "keep", starting: "keeping" }[verb.toLowerCase()];
      return `${verb[0] === verb[0].toUpperCase() ? replacement[0].toUpperCase() + replacement.slice(1) : replacement} the ball rolling`;
    }),
    "idiom-02": () => answer.replace(/shake a leg/i, (phrase) => phrase[0] === "S" ? "Slow down" : "slow down"),
    "idiom-03": () => answer.replace(/the ground running/i, "the ground walking"),
    "idiom-04": () => answer.replace(/chop(?:p(?:ing|ed)|s)? and chang(?:ing|ed|es|e)?/i, (phrase) => phrase.replace(/ and /i, " or ")),
    "idiom-05": () => answer.replace(/\b(thinking|thinks|think|thought) big\b/i, (_, verb) => `${verb} small`)
  }[lessonId]?.() || "";
  const alternateForm = {
    "idiom-01": () => answer.replace(/the ball rolling/i, "the ball moving"),
    "idiom-02": () => answer.replace(/shake a leg/i, (phrase) => phrase[0] === "S" ? "Shake both legs" : "shake both legs"),
    "idiom-03": () => answer.replace(/the ground running/i, "the ground racing"),
    "idiom-04": () => answer.replace(/chop(?:p(?:ing|ed)|s)? and chang(?:ing|ed|es|e)?/i, (phrase) => phrase.replace(/ and /i, " then ")),
    "idiom-05": () => answer.replace(/\b(thinking|thinks|think|thought) big\b/i, (_, verb) => `${verb} large`)
  }[lessonId]?.() || "";
  const details = compassMcDetailFoils(answer, lessonId, question.id);
  const anotherForm = {
    "idiom-01": () => answer.replace(/the ball rolling/i, "the ball turning"),
    "idiom-02": () => answer.replace(/shake a leg/i, (phrase) => phrase[0] === "S" ? "Shake both feet" : "shake both feet"),
    "idiom-03": () => answer.replace(/the ground running/i, "the ground sprinting"),
    "idiom-04": () => answer.replace(/ and /i, " but "),
    "idiom-05": () => answer.replace(/\b(thinking|thinks|think|thought) big\b/i, (_, verb) => `${verb} huge`)
  }[lessonId]?.() || "";
  const foils = [{ text: formFoil, kind: "form" }, ...details];
  for (const text of [alternateForm, anotherForm]) {
    if (foils.length === 3) break;
    if (text && text !== answer && !foils.some((foil) => foil.text === text)) {
      foils.push({ text, reason: "此選項改動了慣用語的固定說法，未能自然表達原意。" });
    }
  }
  return foils;
}

function compassMcOptions(question, lesson = getLesson()) {
  const curated = window.EDMUND_IDIOM_COMPASS_ITEMS?.[question.id];
  if (curated) return curated;
  const correctAt = (Number(question.number || 1) + Number(String(lesson?.id || "").slice(-2))) % 4;
  const foils = compassMcFoils(question, lesson);
  const lessonId = String(lesson?.id || "");
  if (Number(lessonId.slice(-2)) >= 6 && Number(lessonId.slice(-2)) <= 30) {
    const entries = foils.map(({ text, reason }) => ({ text, reason }));
    entries.splice(correctAt, 0, {
      text: question.answer,
      reason: `這句保留原題所述情境，並自然使用「${question.highlight}」表達本課意思。`
    });
    return { options: entries.map((entry) => entry.text), rationales: entries.map((entry) => entry.reason), correctAt };
  }
  const reasons = {
    "idiom-01": {
      correct: "“start the ball rolling” 表示率先採取行動，讓事情開始推進；這符合原句。",
      form: "“keep the ball rolling” 表示讓已開始的事情繼續進行；原句強調的是「開始」，不是「延續」。",
      alternate: "“start the ball moving” 不是這個慣用語的固定說法；應用 “start the ball rolling”。",
      contradiction: "此選項加上了與原句不符的時間或結果細節；原句描述的是有人率先帶動活動。"
    },
    "idiom-02": {
      correct: "“shake a leg” 是催促別人快點行動的口語說法，符合原句的語境。",
      form: "“slow down” 是叫人放慢，與原句需要趕快行動的意思相反。",
      alternate: "“shake both legs” 變成字面上的「搖動雙腿」；慣用語的固定說法是 “shake a leg”。",
      contradiction: "此選項說沒有趕時間的必要；原句卻是在催促對方加快行動。"
    },
    "idiom-03": {
      correct: "“hit the ground running” 表示一開始便迅速投入，並立即取得實際進展。",
      form: "固定說法是 “hit the ground running”，不是 “hit the ground walking”。",
      alternate: "這個慣用語固定用 “running”，不能改成 “racing”。",
      contradiction: "此選項說起初沒有做出實際成果；原句強調的是一開始便有效投入。"
    },
    "idiom-04": {
      correct: "“chop and change” 表示反覆改變主意或計劃，與原句描述的情況一致。",
      form: "固定慣用語是 “chop and change”；把 “and” 改成 “or” 就不再是這個說法。",
      alternate: "這個慣用語固定用 “and”，不能改成 “then”。",
      contradiction: "此選項聲稱計劃幾乎沒有改變，甚至一直沒變；原句描述的卻是反覆更改。"
    },
    "idiom-05": {
      correct: "“think big” 表示有雄心、敢於構想更大規模的目標，符合原句。",
      form: "“think small” 偏向保守或只想小目標，與原句的宏大構想相反。",
      alternate: "這裡的自然說法是 “think big”；“think large” 不是這個慣用語。",
      contradiction: "此選項把宏大的目標變成小事，或把 “big” 誤解為物件的實際大小。"
    }
  }[lessonId] || {};
  const entries = foils.map((foil) => ({ text: foil.text, reason: foil.reason || reasons[foil.kind] || "此選項改變了原句的重要細節。" }));
  entries.splice(correctAt, 0, { text: question.answer, reason: reasons.correct || "此選項保留原意，並自然地用上慣用語。" });
  return { options: entries.map((entry) => entry.text), rationales: entries.map((entry) => entry.reason), correctAt };
}

function compassMcHighlightedOptions(options, questionId = "") {
  const texts = options.map((option) => String(option || ""));
  const words = texts.map((value) => [...value.matchAll(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)]
    .map((match) => ({ value: match[0].toLocaleLowerCase("en"), start: match.index, end: match.index + match[0].length })));
  const renderRanges = (text, ranges) => {
    let cursor = 0;
    let result = "";
    for (const { start, end } of ranges) {
      result += `${escapeHtml(text.slice(cursor, start))}<mark class="compass-mc-diff">${escapeHtml(text.slice(start, end))}</mark>`;
      cursor = end;
    }
    return result + escapeHtml(text.slice(cursor));
  };

  // Progressively align the words shared by every option. A pairwise LCS keeps
  // the work quadratic as the number of choices grows.
  const commonWords = words.slice(1).reduce((shared, next) => {
    const lengths = Array.from({ length: shared.length + 1 }, () => new Uint16Array(next.length + 1));
    for (let i = shared.length - 1; i >= 0; i -= 1) {
      for (let j = next.length - 1; j >= 0; j -= 1) {
        lengths[i][j] = shared[i] === next[j].value
          ? 1 + lengths[i + 1][j + 1]
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
      }
    }
    const result = [];
    let i = 0;
    let j = 0;
    while (i < shared.length && j < next.length) {
      if (shared[i] === next[j].value) {
        result.push(shared[i]);
        i += 1; j += 1;
      } else if (lengths[i + 1][j] >= lengths[i][j + 1]) i += 1;
      else j += 1;
    }
    return result;
  }, words[0].map((word) => word.value));
  const shared = words.map(() => new Set());
  words.forEach((optionWords, optionIndex) => {
    let commonIndex = 0;
    optionWords.forEach((word, wordIndex) => {
      if (word.value === commonWords[commonIndex]) {
        shared[optionIndex].add(wordIndex);
        commonIndex += 1;
      }
    });
  });
  return texts.map((value, optionIndex) => {
    const ranges = [];
    words[optionIndex].forEach((word, wordIndex) => {
      if (shared[optionIndex].has(wordIndex)) return;
      const previous = ranges.at(-1);
      if (previous && previous.lastWordIndex === wordIndex - 1) {
        previous.end = word.end;
        previous.lastWordIndex = wordIndex;
      } else ranges.push({ start: word.start, end: word.end, lastWordIndex: wordIndex });
    });
    return renderRanges(value, ranges);
  });
}

function compassQuestionHtml(question) {
  const lesson = getLesson();
  const complete = compassReviewedIds(lesson, state.exercise.questionState, state.exercise.correctIds).has(question.id);
  const selection = state.pilotSelections[`mc:${lesson.id}:${question.id}`];
  const { options, rationales, correctAt } = compassMcOptions(question, lesson);
  const highlightedOptions = compassMcHighlightedOptions(options, question.id);
  const bookmarked = !question.bonus && isBookmarked(state.lessonId, question.id);
  return `<article class="question-card compass-question ${complete ? "is-correct" : ""}" data-question-id="${escapeHtml(question.id)}" data-edmund-prompt-text="${escapeHtml(question.prompt || "")}" data-edmund-record-id="${escapeHtml(question.id)}" data-edmund-record-title="${escapeHtml(`英文慣用語 · 第 ${question.number || ""} 題`)}">
    <div class="question-card-top"><span class="question-number">QUESTION ${escapeHtml(question.number || "")}${question.theme ? ` · ${escapeHtml(question.theme)}` : ""}${complete ? " · 答對 ✓" : ""}</span>${question.bonus ? '<span class="compass-bonus-label">EXTRA PRACTICE</span>' : `<button class="question-bookmark-button" type="button" data-toggle-question-bookmark="${escapeHtml(question.id)}" aria-pressed="${bookmarked}" aria-label="${bookmarked ? "移除書簽" : "加入書簽"}">${bookmarked ? "★" : "☆"}</button>`}</div>
    <div class="question-prompt"><p class="english">${escapeHtml(question.prompt || "")}</p>${question.promptZh ? `<p class="chinese">${escapeHtml(question.promptZh)}</p>` : ""}<p class="compass-choice-hint" lang="zh-Hant">哪一句既保留原意，也自然地用上本課的英語慣用語？</p></div>
    <div class="compass-mc-options" role="group" aria-label="第 ${escapeHtml(question.number)} 題：選出符合原意的英語句子">${options.map((option, index) => `<button class="compass-mc-option ${complete && index === correctAt ? "is-correct" : selection === index ? "is-wrong" : ""}" type="button" data-compass-mc-choice="${escapeHtml(question.id)}" data-compass-mc-index="${index}" aria-pressed="${complete ? index === correctAt : selection === index}" ${complete ? "disabled" : ""}><span>${String.fromCharCode(65 + index)}</span><strong>${highlightedOptions[index]}</strong></button>`).join("")}</div>
    <div class="compass-mc-feedback" lang="zh-Hant" aria-live="polite">${compassMcFeedbackHtml(complete, selection, rationales)}</div>
  </article>`;
}

function compassMcFeedbackHtml(complete, selection, rationales) {
  if (complete) return `<strong>✓ 答對！逐項看看原因：</strong><ul>${rationales.map((reason, index) => `<li><b>${String.fromCharCode(65 + index)}：</b> ${escapeHtml(reason)}</li>`).join("")}</ul>`;
  if (Number.isInteger(selection)) return `<strong>再想想。</strong> ${escapeHtml(rationales[selection] || "請對照原句和慣用語，再選一次。")} 請再選一次。`;
  return "";
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
  const scoped = state.exercise.correctionMode ? correctionQuestions(lesson) : compassFor(lesson) ? pilotBatchQuestions(lesson) : activeQuestions(lesson);
  const reviewed = compassFor(lesson) ? compassReviewedIds(lesson, state.exercise.questionState, state.exercise.correctIds) : null;
  return scoped.filter((question) => reviewed ? !reviewed.has(question.id) : !state.exercise.correctIds.includes(question.id));
}

function renderExercisePage(lesson, { preserveScroll = false } = {}) {
  ensureExercise(lesson);
  const isCompass = Boolean(compassFor(lesson));
  const scrollTop = preserveScroll ? window.scrollY : 0;
  const total = isCompass ? compassPracticeQuestions(lesson).length : lesson.questions?.length || 0;
  const correct = isCompass ? compassReviewedCount(lesson) : state.exercise.correctIds.length;
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  const remaining = total - correct;
  const completed = Boolean((!isCompass && state.exercise.completedAt) || remaining === 0);
  const wrongIds = wrongQuestionIds(lesson);
  const correctionScope = state.exercise.correctionMode ? correctionQuestions(lesson) : [];
  const correctionRemaining = correctionScope.filter((question) => !state.exercise.correctIds.includes(question.id));
  const correctionAnswerVisible = correctionRemaining.some((question) => questionState(question.id).reveal === true);
  const displayQuestions = completed
    ? isCompass ? pilotBatchQuestions(lesson) : lesson.questions
    : state.exercise.correctionMode
      ? correctionScope
      : isCompass ? pilotBatchQuestions(lesson) : lesson.questions;
  const visibleCorrectIds = (isCompass ? [] : displayQuestions)
    .filter((question) => state.exercise.correctIds.includes(question.id))
    .map((question) => question.id);
  const allVisibleCorrectCollapsed = visibleCorrectIds.length > 0
    && visibleCorrectIds.every((id) => state.exercise.collapsedCorrectIds.includes(id));
  const bulkVisibilityLabel = allVisibleCorrectCollapsed
    ? "展開所有已完成題目"
    : "隱藏所有已完成題目";
  const instructionZh = isCompass ? "原有 50 題及 10 題延伸練習全數列在下方；每題四個選項。選出唯一符合原意的英文句子。答錯可再試；延伸題進度儲存在此裝置。" : String(lesson.instructions?.zh || "請按照題目要求，以完整英文句子作答。部分提交只會檢查已輸入的題目；答對的題目不會重複出現。");
  const instructionEn = isCompass ? "Choose one natural English sentence for each situation." : String(lesson.instructions?.en || "Answer each item with a complete English sentence. Correct questions will not be repeated in the next round.");
  const illustrationAlt = String(lesson.imageAlt || `${lessonEnglishTitle(lesson)} illustration`);
  const illustrationCaptionZh = String(lesson.imageCaptionZh || lessonTitle(lesson));
  const illustrationCaptionEn = String(lesson.imageCaptionEn || lessonEnglishTitle(lesson));

  elements.lessonContent.innerHTML = `<section class="exercise-page ${isCompass ? "is-compass" : ""}">
    <header class="exercise-header">
      <div class="exercise-header-top">
        <div><p class="eyebrow">${isCompass ? "IDIOM COMPASS · CHOOSE THE RIGHT SENTENCE" : "PAGE 8 · TYPE THE WHOLE SENTENCE"}</p><h2>${isCompass ? "全部題目 · 英文選擇題" : "慣用語句子改寫練習"}</h2><p>${escapeHtml(instructionZh)} <small>${escapeHtml(instructionEn)}</small></p></div>
      </div>
      <div class="exercise-progress" style="--progress:${percentage}%"><span></span></div>
      <div class="exercise-progress-label"><span>已完成 ${escapeHtml(correct)} / ${escapeHtml(total)} 題</span><span>尚餘 ${escapeHtml(remaining)} 題</span></div>
    </header>

    ${lesson.image && !isCompass ? `<figure class="exercise-idiom-illustration">
      <img src="${escapeHtml(lesson.image)}" alt="${escapeHtml(illustrationAlt)}" loading="lazy" decoding="async">
      <figcaption>${escapeHtml(illustrationCaptionZh)}<small>${escapeHtml(illustrationCaptionEn)}</small></figcaption>
    </figure>` : ""}

    ${completed ? `<section class="round-summary completion-card">
      <div class="completion-mark" aria-hidden="true">✓</div>
      <h3>${isCompass ? "全部選擇題已答對！" : "恭喜，全部題目已完成！"}</h3>
      <p>${isCompass ? `你已答對 <strong>${escapeHtml(total)}</strong> 題，並練習在不同情境使用這個慣用語。` : `你已完成這組 <strong>${escapeHtml(total)}</strong> 題英文慣用語練習。`}</p>
      <div class="round-summary-actions"><button class="primary-button" type="button" data-finish-exercise>返回學習首頁</button></div>
    </section>` : state.exercise.awaitingNextRound ? `<section class="round-summary">
      <h3>本次提交已檢查</h3>
      <p>目前已答對 <strong>${escapeHtml(correct)}</strong> 題；尚有 <strong>${escapeHtml(remaining)}</strong> 題需要繼續練習。</p>
      <div class="round-summary-actions">
        ${wrongIds.length ? `<button class="correction-button" type="button" data-start-correction>立即改正錯題（${escapeHtml(wrongIds.length)}）</button>` : ""}
        <button class="primary-button" type="button" data-next-round>繼續練習未完成題目</button>
      </div>
    </section>` : ""}

    ${!completed && state.exercise.correctionMode ? `<section class="correction-round-banner">
      <div>
        <h3>${correctionRemaining.length ? "錯題改正" : "本次錯題已全部改正"}</h3>
        <p>${correctionRemaining.length ? correctionAnswerVisible ? `仍有 ${escapeHtml(correctionRemaining.length)} 題需要改正；黃色會標示遺漏或需修改部分。` : `集中修正 ${escapeHtml(correctionRemaining.length)} 題；首次提交前會暫時隱藏參考答案，答錯後會顯示提示。` : "你可以查看已完成的綠色題卡，或返回其餘題目繼續練習。"}</p>
      </div>
      <button class="secondary-button" type="button" data-exit-correction>返回其餘題目</button>
    </section>` : ""}

    ${visibleCorrectIds.length ? `<div class="question-list-toolbar">
      <button class="bulk-visibility-button" type="button" data-toggle-all-correct-cards aria-pressed="${allVisibleCorrectCollapsed}" aria-controls="idiom-system-question-list" aria-label="${bulkVisibilityLabel}（${escapeHtml(visibleCorrectIds.length)} 題）">${bulkVisibilityLabel}</button>
    </div>` : ""}

    <div class="question-list" id="idiom-system-question-list" data-question-list>
      ${displayQuestions.map(isCompass ? compassQuestionHtml : questionHtml).join("")}
    </div>

    ${!isCompass && !completed && !state.exercise.awaitingNextRound && (!state.exercise.correctionMode || correctionRemaining.length) ? `<div class="exercise-actions">
      <span class="exercise-action-copy" data-exercise-action-copy>${state.exercise.correctionMode ? "修改錯題後提交；答對的題卡會留在目前畫面供你核對。" : "可提交全部答案，或只檢查已輸入的題目。"}</span>
      <div class="exercise-action-buttons">
        ${!isCompass && !state.exercise.correctionMode && wrongIds.length ? `<button class="correction-button" type="button" data-start-correction>立即改正錯題（${escapeHtml(wrongIds.length)}）</button>` : ""}
        <button class="partial-button" type="button" data-submit-partial hidden>提交部分答案</button>
        <button class="primary-button" type="button" data-submit-all>${state.exercise.correctionMode ? "提交改正答案" : "提交答案"}</button>
      </div>
    </div>` : ""}
  </section>`;

  syncHorseyTrophies();
  horseyTrophies?.celebrate(elements.lessonContent, lesson, state.exercise.correctIds);
  updateLessonStepper();
  if (!completed) startExerciseClock();
  syncExerciseButtons();
  if (preserveScroll) requestAnimationFrame(() => window.scrollTo({ top: scrollTop, behavior: "auto" }));
}

function renderLessonPage() {
  const lesson = getLesson();
  if (!lesson) return openDashboard();
  updateLessonStepper();
  if (compassFor(lesson) && state.lessonPage < EXERCISE_PAGE) renderCompassPage(lesson, state.lessonPage);
  else if (state.lessonPage === 1) renderFormulaPage(lesson);
  else if (state.lessonPage === 2) renderRegisterPage(lesson);
  else if (state.lessonPage === 3) renderFixedVariablePage(lesson);
  else if (state.lessonPage === 4) renderSpecificFormsPage(lesson);
  else if (state.lessonPage === 5) renderBenefitsPage(lesson);
  else if (state.lessonPage === 6) renderOriginPage(lesson);
  else if (state.lessonPage === 7) renderRulesPage(lesson);
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

function updateCompassMcQuestion(lesson, question) {
  const card = document.querySelector(`[data-question-id="${CSS.escape(question.id)}"]`);
  const buttons = [...(card?.querySelectorAll?.("[data-compass-mc-index]") || [])];
  const feedback = card?.querySelector?.(".compass-mc-feedback");
  if (!card || buttons.length !== 4 || !feedback) return false;

  const complete = compassReviewedIds(lesson, state.exercise.questionState, state.exercise.correctIds).has(question.id);
  const selection = state.pilotSelections[`mc:${lesson.id}:${question.id}`];
  const { rationales, correctAt } = compassMcOptions(question, lesson);
  card.classList.toggle("is-correct", complete);
  const number = card.querySelector(".question-number");
  if (number) number.textContent = `QUESTION ${question.number || ""}${question.theme ? ` · ${question.theme}` : ""}${complete ? " · 答對 ✓" : ""}`;
  buttons.forEach((button, index) => {
    button.classList.toggle("is-correct", complete && index === correctAt);
    button.classList.toggle("is-wrong", !complete && selection === index);
    button.setAttribute("aria-pressed", String(complete ? index === correctAt : selection === index));
    button.disabled = complete;
  });
  feedback.innerHTML = compassMcFeedbackHtml(complete, selection, rationales);

  const total = compassPracticeQuestions(lesson).length;
  const correct = compassReviewedCount(lesson);
  const progress = elements.lessonContent.querySelector(".exercise-progress");
  progress?.style?.setProperty("--progress", `${Math.round((correct / total) * 100)}%`);
  const labels = elements.lessonContent.querySelectorAll(".exercise-progress-label span");
  if (labels[0]) labels[0].textContent = `已完成 ${correct} / ${total} 題`;
  if (labels[1]) labels[1].textContent = `尚餘 ${total - correct} 題`;
  updateLessonStepper();

  if (correct === total && !elements.lessonContent.querySelector(".completion-card")) {
    elements.lessonContent.querySelector("[data-question-list]")?.insertAdjacentHTML("afterend", `<section class="round-summary completion-card">
      <div class="completion-mark" aria-hidden="true">✓</div>
      <h3>全部選擇題已答對！</h3>
      <p>你已答對 <strong>${escapeHtml(total)}</strong> 題，並練習在不同情境使用這個慣用語。</p>
      <div class="round-summary-actions"><button class="primary-button" type="button" data-finish-exercise>返回學習首頁</button></div>
    </section>`);
  }
  return true;
}

async function answerCompassMcQuestion(questionId, selectedIndex) {
  const lesson = getLesson();
  if (!compassFor(lesson) || !state.exercise || !Number.isInteger(selectedIndex)) return;
  const question = compassPracticeQuestions(lesson).find((item) => item.id === questionId);
  if (!question || compassReviewedIds(lesson, state.exercise.questionState, state.exercise.correctIds).has(questionId)) return;
  const { correctAt, options } = compassMcOptions(question, lesson);
  if (selectedIndex !== correctAt) {
    state.pilotSelections[`mc:${lesson.id}:${questionId}`] = selectedIndex;
    if (!updateCompassMcQuestion(lesson, question)) renderExercisePage(lesson, { preserveScroll: true });
    return;
  }
  delete state.pilotSelections[`mc:${lesson.id}:${questionId}`];
  if (question.bonus) saveCompassBonusCorrect(lesson, questionId);
  else {
    state.exercise.correctIds.push(questionId);
    state.exercise.questionState[questionId] = { status: "correct", lastAnswer: options[correctAt], reveal: true };
  }
  if (compassReviewedCount(lesson) === compassPracticeQuestions(lesson).length) pauseExerciseClock();
  if (!updateCompassMcQuestion(lesson, question)) renderExercisePage(lesson, { preserveScroll: true });
  syncHorseyTrophies();
  horseyTrophies?.celebrate(elements.lessonContent, lesson, state.exercise.correctIds);
  if (!question.bonus) {
    try { await persistExercise(); }
    catch (error) { console.warn("Idiom choice save failed", error); showToast("答案已記錄，但帳戶同步失敗；請稍後再試。", "error"); }
  }
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
  return window.EdmundAnswerComparison.normalize(value, { canonicalizeToken: canonicalSpellingToken });
}

function answerComparison(studentAnswer, question) {
  const accepted = [question?.answer, ...(Array.isArray(question?.acceptedAnswers) ? question.acceptedAnswers : [])]
    .filter(Boolean);
  return window.EdmundAnswerComparison.best(studentAnswer, accepted, {
    canonicalizeToken: canonicalSpellingToken
  });
}

function answersMatch(studentAnswer, question) {
  return answerComparison(studentAnswer, question).correct;
}

function serializeExerciseResult(exercise = state.exercise) {
  return {
    round: exercise.round,
    correctIds: [...exercise.correctIds],
    questionState: { ...exercise.questionState },
    rounds: exercise.rounds.slice(-250),
    awaitingNextRound: exercise.awaitingNextRound,
    correctionMode: exercise.correctionMode === true,
    correctionIds: [...exercise.correctionIds],
    collapsedCorrectIds: [...exercise.collapsedCorrectIds],
    contentVersion: String(CONTENT.version || "1")
  };
}

async function persistExercise({ keepalive = false } = {}) {
  if (!state.exercise || state.user?.role !== "student") return;
  const operationExercise = state.exercise;
  const operationUserId = String(state.user.id || "");
  const operationAuthToken = String(state.authToken || "");
  window.clearTimeout(state.exercisePersistTimer);
  state.exercisePersistTimer = null;
  const attemptId = operationExercise.id;
  pauseExerciseClock();
  try {
    const lesson = getLesson(operationExercise.lessonId);
    const payload = {
      lessonId: operationExercise.lessonId,
      lessonVersion: operationExercise.lessonVersion,
      status: operationExercise.completedAt ? "completed" : "in_progress",
      roundNumber: operationExercise.round,
      correctCount: operationExercise.correctIds.length,
      totalCount: lesson?.questions?.length || 0,
      durationMs: operationExercise.durationMs,
      startedAt: operationExercise.startedAt,
      completedAt: operationExercise.completedAt || null,
      result: serializeExerciseResult(operationExercise)
    };
    const response = await apiJson(`/v1/attempts/${encodeURIComponent(attemptId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      keepalive
    }, true, operationAuthToken);
    const saved = normalizeAttempt(response?.attempt || { id: attemptId, ...payload });
    if (
      String(state.user?.id || "") !== operationUserId
      || String(state.authToken || "") !== operationAuthToken
    ) return;
    const index = state.attempts.findIndex((attempt) => attempt.id === saved.id);
    if (index >= 0) state.attempts[index] = saved;
    else state.attempts.unshift(saved);
    state.dashboardLoaded = true;
  } finally {
    if (
      String(state.user?.id || "") === operationUserId
      && String(state.authToken || "") === operationAuthToken
      && state.exercise?.id === attemptId
      && !state.exercise.completedAt
      && (!compassFor(getLesson(operationExercise.lessonId)) || compassReviewedCount(getLesson(operationExercise.lessonId), operationExercise) < compassPracticeQuestions(getLesson(operationExercise.lessonId)).length)
      && state.currentView === "lesson"
      && state.lessonPage === EXERCISE_PAGE
      && document.visibilityState !== "hidden"
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
      console.warn("Idiom System preference save failed", error);
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

  window.EdmundAnswerSound?.play(incorrectThisTime.length === 0);
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
  } else if (kind === "all" && !state.exercise.correctionMode && !compassFor(lesson)) {
    state.exercise.awaitingNextRound = true;
  } else if (state.exercise.correctionMode) {
    const stillWrongInCorrection = correctionQuestions(lesson)
      .some((question) => !state.exercise.correctIds.includes(question.id));
    if (stillWrongInCorrection) state.exercise.round += 1;
    else {
      state.exercise.correctionMode = false;
      state.exercise.correctionIds = [];
    }
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
    console.warn("Idiom System attempt save failed", error);
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
        ? (sectionBookmark ? "已移除慣用語書簽。" : "已移除題目書簽。")
        : (sectionBookmark ? "已收藏整個慣用語。" : "已加入題目書簽。"));
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
    console.warn("Idiom System bookmark sync failed", error);
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
  pauseExerciseClock({ persist: true });
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
        <div><h2 id="section-bookmark-heading">收藏慣用語</h2><p>整個英文慣用語課題</p></div>
      </header>
      <div class="bookmark-column-list">${sectionRows || '<p class="empty-state">暫時未收藏慣用語。可在學習首頁的慣用語卡右上角按 ☆。</p>'}</div>
    </section>
    <section class="bookmark-column" aria-labelledby="question-bookmark-heading">
      <header class="bookmark-column-heading">
        <span>02</span>
        <div><h2 id="question-bookmark-heading">收藏題目</h2><p>各慣用語內的個別練習題</p></div>
      </header>
      <div class="bookmark-column-list">${questionRows || '<p class="empty-state">暫時未收藏題目。可在任何練習題右上角按 ☆。</p>'}</div>
    </section>
  </div>`;
}

function resumeAttempt(attemptId) {
  const attempt = state.attempts.find((item) => item.id === attemptId);
  if (!attempt) return;
  openLesson(attempt.lessonId, { page: EXERCISE_PAGE, attempt });
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
    console.warn("Idiom System admin students failed", error);
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
  const operationAdminId = String(state.user?.id || "");
  const operationAuthToken = String(state.authToken || "");
  state.selectedAdminStudentId = studentId;
  renderAdminStudents();
  elements.adminDetail.innerHTML = loadingHtml();
  try {
    const payload = await apiJson(
      `/v1/admin/students/${encodeURIComponent(studentId)}`,
      {},
      true,
      operationAuthToken
    );
    if (
      state.selectedAdminStudentId !== studentId
      || String(state.user?.id || "") !== operationAdminId
      || String(state.authToken || "") !== operationAuthToken
    ) return;
    const student = payload?.student;
    const attempts = (Array.isArray(payload?.attempts) ? payload.attempts : []).map(normalizeAttempt);
    const bookmarks = (Array.isArray(payload?.bookmarks) ? payload.bookmarks : []).map(normalizeBookmark).filter(Boolean);
    if (!student) throw new Error("Student not found");
    const summary = state.adminStudents.find((row) => String(row.id) === String(studentId));
    const attemptTotal = Number(summary?.attemptCount ?? summary?.attempt_count ?? attempts.length);
    const completedTotal = Number(
      summary?.completedCount
      ?? summary?.completed_count
      ?? attempts.filter((attempt) => attempt.status === "completed").length
    );
    const bookmarkTotal = Number(summary?.bookmarkCount ?? summary?.bookmark_count ?? bookmarks.length);
    const historyHeading = attemptTotal > attempts.length
      ? `練習記錄（最近 ${attempts.length} 次）`
      : "練習記錄";
    elements.adminDetail.innerHTML = `<section class="admin-profile">
      <p class="eyebrow">STUDENT PROGRESS</p>
      <h2>${escapeHtml(student.name)}</h2>
      <p>學生帳戶</p>
      <div class="admin-metrics">
        <div class="admin-metric"><strong>${escapeHtml(attemptTotal)}</strong><span>練習次數</span></div>
        <div class="admin-metric"><strong>${escapeHtml(completedTotal)}</strong><span>完成次數</span></div>
        <div class="admin-metric"><strong>${escapeHtml(bookmarkTotal)}</strong><span>書簽數量</span></div>
      </div>
      <h3 class="admin-subheading">${escapeHtml(historyHeading)}</h3>
      <div class="history-list">${attemptHistoryHtml(attempts, { allowResume: false })}</div>
    </section>`;
  } catch (error) {
    if (
      state.selectedAdminStudentId !== studentId
      || String(state.user?.id || "") !== operationAdminId
      || String(state.authToken || "") !== operationAuthToken
    ) return;
    console.warn("Idiom System admin student detail failed", error);
    elements.adminDetail.innerHTML = '<p class="empty-state">未能載入這位學生的記錄。</p>';
  }
}

function handleClick(event) {
  const compassMcChoice = event.target.closest("[data-compass-mc-choice]");
  if (compassMcChoice) return answerCompassMcQuestion(compassMcChoice.dataset.compassMcChoice, Number(compassMcChoice.dataset.compassMcIndex));
  const compassChoice = event.target.closest("[data-compass-choice]");
  if (compassChoice && compassFor()) {
    const page = Number(compassChoice.dataset.compassPage);
    state.pilotSelections[`${state.lessonId}:${page}`] = Number(compassChoice.dataset.compassChoice);
    renderCompassPage(getLesson(), page);
    return;
  }
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
  if (event.target.closest("[data-jump-to-exercise]")) return setLessonPage(EXERCISE_PAGE);
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
    return openLesson(lessonId, { page: EXERCISE_PAGE, questionId });
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
  document.addEventListener("edmund:idle-break-start", () => {
    exerciseClockWasRunningBeforeIdleBreak = Boolean(state.exerciseClockStartedAt) || Boolean(
      state.currentView === "lesson"
      && state.lessonPage === EXERCISE_PAGE
      && state.exercise
      && !state.exercise.completedAt
    );
    pauseExerciseClock({ persist: true });
  });
  document.addEventListener("edmund:idle-break-resume", () => {
    const shouldResume = exerciseClockWasRunningBeforeIdleBreak;
    exerciseClockWasRunningBeforeIdleBreak = false;
    if (
      shouldResume
      && state.currentView === "lesson"
      && state.lessonPage === EXERCISE_PAGE
      && !state.exercise?.completedAt
    ) startExerciseClock();
  });
  document.addEventListener("edmund:idle-break-logout", () => {
    exerciseClockWasRunningBeforeIdleBreak = false;
    pauseExerciseClock();
  });
  window.addEventListener("pagehide", () => pauseExerciseClock({ persist: true, keepalive: true }));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") pauseExerciseClock({ persist: true });
    else if (state.currentView === "lesson" && state.lessonPage === EXERCISE_PAGE) startExerciseClock();
  });
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
    setStatus(elements.loginStatus, "英文慣用語教材暫時未能載入，請重新整理頁面。", "error");
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
  console.error("Idiom System initialisation failed", error);
  clearSession();
  setConnection("服務暫時離線", "error");
  setStatus(elements.loginStatus, "系統未能完成載入，請重新整理頁面。", "error");
  showView("login");
});

installQuestionOrder({system:'idiom-system',owner:()=>state.user?.id,lessonId:()=>state.lessonId});
