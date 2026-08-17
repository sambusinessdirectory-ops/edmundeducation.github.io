/*
 * Public lesson contract (provided by phrasal-verb-system-data.js):
 * { version, system: "phrasal-verb", lessons: PhrasalVerbLesson[] }.
 *
 * Lesson IDs are permanent `phrasal-verb-NN[N]` identifiers. Every published lesson has
 * a complete, sequential question set named `phrasal-verb-NN[N]-q01` onward. Totals are
 * always read from the lesson data so future units are not constrained to one size.
 * Chinese copy belongs in `*Zh`/`zh`, English copy in `*En`/`en`, and lesson
 * phrases are highlighted only when content explicitly supplies `highlight` or
 * `highlights` metadata.
 */
const CONFIG = window.EDMUND_PHRASAL_VERB_SYSTEM_CONFIG || {};
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const CONTENT = window.EDMUND_PHRASAL_VERB_SYSTEM_DATA || { version: "missing", lessons: [] };

const SESSION_KEY = "edmund-phrasal-verb-system-session-v1";
const PROGRESS_PANEL_PREFERENCE_KEY = "edmund-phrasal-verb-system-progress-panel-v1";
const CUMULATIVE_PROGRESS_PREFERENCE_KEY = "edmund-phrasal-verb-system-cumulative-progress-v1";
const SECTION_BOOKMARK_ID = "__section__";
const MAX_BOOKMARKS = 2005;
const LESSON_PAGES = 8;
const EXERCISE_PAGE = 8;
const ATTEMPT_PAGE_SIZE = 100;
const ATTEMPT_OUTBOX_DB_NAME = "edmund-phrasal-verb-attempt-outbox-v1";
const ATTEMPT_OUTBOX_DB_VERSION = 1;
const ATTEMPT_OUTBOX_STORE = "attempt-mutations";
const ATTEMPT_OUTBOX_LEASE_STORE = "drain-leases";
const ATTEMPT_OUTBOX_SCHEMA_VERSION = 1;
const ATTEMPT_OUTBOX_RETRY_BASE_MS = 1500;
const ATTEMPT_OUTBOX_RETRY_CAP_MS = 5 * 60 * 1000;
const ATTEMPT_OUTBOX_LEASE_MS = 2 * 60 * 1000;
const ATTEMPT_OUTBOX_REQUEST_TIMEOUT_MS = 45 * 1000;
const ATTEMPT_OUTBOX_LOCK_PREFIX = "edmund-phrasal-verb-attempt-outbox::";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEFAULT_PAGE_META = Object.freeze({
  1: Object.freeze({ titleZh: "概覽及例子", titleEn: "Overview + Examples", kicker: "OVERVIEW + EXAMPLES", description: "先掌握本課動詞片語的學習目標、核心意思及例子。" }),
  2: Object.freeze({ titleZh: "意思組別（一）", titleEn: "Meaning Groups I", kicker: "MEANING GROUPS I", description: "按意思整理第一組常用動詞片語，配合中英例句理解。" }),
  3: Object.freeze({ titleZh: "意思組別（二）及位置變化", titleEn: "Meaning Groups II + Placement", kicker: "MEANING GROUPS II + PLACEMENT", description: "掌握第二組意思，並分辨受詞、代名詞及可分動詞片語的位置。" }),
  4: Object.freeze({ titleZh: "完整形式參考", titleEn: "Complete Forms + Reference Bank", kicker: "COMPLETE REFERENCE", description: "集中溫習本課所有形式、意思、搭配及例句。" }),
  5: Object.freeze({ titleZh: "表達好處", titleEn: "Benefits", kicker: "WHY THESE PHRASAL VERBS HELP", description: "理解這些動詞片語能帶出的語意、語氣及溝通效果。" }),
  6: Object.freeze({ titleZh: "實際用途及意思比較", titleEn: "Real-life Uses + Meaning Comparison", kicker: "USES + COMPARISON", description: "比較容易混淆的意思，並了解動詞片語在真實情境中的用途。" }),
  7: Object.freeze({ titleZh: "重要規則", titleEn: "Important Rules", kicker: "IMPORTANT REMINDERS", description: "留意固定字序、搭配、語法、語意及自然使用情境。" })
});
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
  username: document.querySelector("#phrasal-verb-system-username"),
  password: document.querySelector("#phrasal-verb-system-password"),
  passwordToggle: document.querySelector("[data-password-toggle]"),
  dashboardWelcome: document.querySelector("[data-dashboard-welcome]"),
  lessonCount: document.querySelector("[data-lesson-count]"),
  lessonChoiceGrid: document.querySelector("[data-lesson-choice-grid]"),
  lessonSearchForm: document.querySelector("[data-lesson-search-form]"),
  lessonSearchInput: document.querySelector("[data-lesson-search-input]"),
  lessonSearchSummary: document.querySelector("[data-lesson-search-summary]"),
  lessonSearchResults: document.querySelector("[data-lesson-search-results]"),
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
  loadingTemplate: document.querySelector("#phrasal-verb-system-loading-template"),
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
  attemptSyncEpoch: "",
  attemptTokenFingerprint: "",
  attemptSyncAccountKey: "",
  attemptOutboxPending: 0,
  attemptOutboxLastError: "",
  attemptOutboxBlocked: false,
  toastTimer: null,
  visitedLessonPages: new Set(),
  adminStudents: [],
  selectedAdminStudentId: "",
  requestedHomeworkLessonOpened: false
};

let lessonSearchIndexCache = null;
let exerciseClockWasRunningBeforeIdleBreak = false;
let attemptOutboxDatabasePromise = null;
let attemptOutboxDrainPromise = null;
let attemptOutboxDrainRequested = false;
let attemptOutboxRetryTimer = null;
let attemptOutboxRetryAt = 0;
let attemptOutboxWakeupsBound = false;
let attemptOutboxSequence = 0;
const attemptOutboxPersistencePromises = new Set();
const attemptCanonicalPayloads = new Map();
const attemptOutboxInstanceId = globalThis.crypto?.randomUUID?.()
  || `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;

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

function validLessonContract(lesson) {
  if (!isPlainObject(lesson) || !/^phrasal-verb-\d{2,3}$/.test(String(lesson.id || ""))) return false;
  if (!String(lesson.titleZh || lesson.title || "").trim()) return false;
  if (!String(lesson.titleEn || lesson.englishTitle || "").trim()) return false;
  if (!Array.isArray(lesson.questions) || !lesson.questions.length) return false;

  return lesson.questions.every((question, index) => {
    if (!isPlainObject(question)) return false;
    const sequence = String(index + 1).padStart(2, "0");
    return String(question.id || "") === `${lesson.id}-q${sequence}`
      && Number(question.number) === index + 1
      && Boolean(String(question.promptZh || question.chinese || question.zh || "").trim())
      && Boolean(String(question.prompt || question.english || "").trim())
      && Boolean(String(question.starter || "").trim())
      && Boolean(String(question.answer || "").trim())
      && Boolean(String(question.answerZh || "").trim())
      && Boolean(String(question.highlight || "").trim());
  });
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
  if (CONTENT.system !== "phrasal-verb" || !Array.isArray(CONTENT.lessons)) return [];
  const seen = new Set();
  return CONTENT.lessons
    .filter(validLessonContract)
    .filter((lesson) => {
      if (seen.has(lesson.id)) return false;
      seen.add(lesson.id);
      return true;
    })
    .sort((left, right) => Number(left.order || 0) - Number(right.order || 0) || String(left.id).localeCompare(String(right.id)));
}

function getLesson(lessonId = state.lessonId) {
  return lessonList().find((lesson) => String(lesson.id) === String(lessonId)) || null;
}

function getQuestion(lessonId, questionId) {
  const lesson = getLesson(lessonId);
  return lesson?.questions?.find((question) => String(question.id) === String(questionId)) || null;
}

function lessonTitle(lesson) {
  return String(lesson?.title || lesson?.titleZh || lesson?.name || "英文動詞片語");
}

function lessonEnglishTitle(lesson) {
  return String(lesson?.titleEn || lesson?.englishTitle || "English Phrasal Verbs");
}

function lessonQuestionCount(lesson) {
  return Array.isArray(lesson?.questions) ? lesson.questions.length : 0;
}

function lessonIllustration(lesson) {
  const illustration = isPlainObject(lesson?.illustration) ? lesson.illustration : {};
  const width = Number(illustration.width || lesson?.imageWidth || 1536);
  const height = Number(illustration.height || lesson?.imageHeight || 1024);
  return {
    src: String(illustration.src || lesson?.image || ""),
    width: Number.isInteger(width) && width > 0 ? width : 1536,
    height: Number.isInteger(height) && height > 0 ? height : 1024,
    alt: String(illustration.alt || illustration.altEn || lesson?.imageAlt || ""),
    captionZh: String(illustration.captionZh || lesson?.imageCaptionZh || ""),
    captionEn: String(illustration.captionEn || illustration.caption || lesson?.imageCaptionEn || "")
  };
}

function lessonPageMeta(lesson, page) {
  const fallback = DEFAULT_PAGE_META[page] || Object.freeze({ titleZh: "", titleEn: "", kicker: "", description: "" });
  const source = isPlainObject(lesson?.pageMeta) ? lesson.pageMeta : {};
  const supplied = isPlainObject(source[page]) ? source[page] : isPlainObject(source[String(page)]) ? source[String(page)] : {};
  return {
    titleZh: String(supplied.titleZh || fallback.titleZh),
    titleEn: String(supplied.titleEn || fallback.titleEn),
    kicker: String(supplied.kicker || fallback.kicker),
    description: String(supplied.descriptionZh || supplied.description || fallback.description)
  };
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
  document.body.dataset.phrasalVerbView = name;
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
  if (!baseUrl.startsWith("https://")) throw new Error("英文動詞片語服務尚未完成設定。");
  return baseUrl;
}

function retryAfterMilliseconds(value, now = Date.now()) {
  const raw = String(value || "").trim();
  if (!raw) return 0;
  if (/^\d+(?:\.\d+)?$/.test(raw)) return Math.max(0, Math.ceil(Number(raw) * 1000));
  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - Number(now || 0)) : 0;
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
  error.retryAfterMs = retryAfterMilliseconds(response.headers?.get?.("Retry-After"));
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
    const connectionError = new Error("暫時未能連接英文動詞片語服務，請檢查網絡後再試。");
    connectionError.cause = error;
    connectionError.status = 0;
    connectionError.code = "NETWORK_ERROR";
    connectionError.retryAfterMs = 0;
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
      role: state.user.role,
      syncEpoch: state.user.role === "student" ? state.attemptSyncEpoch : ""
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
  deactivateAttemptSyncContext();
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
      id: String(admin.id || "phrasal-verb-system-admin"),
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
  state.attemptSyncEpoch = saved.role === "student"
    ? String(saved.syncEpoch || newAttemptSyncEpoch())
    : "";
  try {
    const payload = await apiJson(saved.role === "admin" ? "/v1/admin/me" : "/v1/student/me");
    const profile = saved.role === "admin" ? payload?.admin : payload?.student;
    if (!profile?.id || !profile?.name) throw new Error("Invalid profile");
    state.user = { id: String(profile.id), name: String(profile.name), role: saved.role };
    saveSession();
    return true;
  } catch (error) {
    console.warn("Phrasal Verb System session restore failed", error);
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
    state.attemptSyncEpoch = isAdmin ? "" : newAttemptSyncEpoch();
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
    if (!isAdmin) {
      try {
        if (!(await activateAttemptSyncContext())) throw new Error("安全待同步記錄未能啟用。");
      } catch (error) {
        window.EdmundSystemNav?.forgetStudentSession();
        clearSession();
        const protectionError = new Error("此瀏覽器未能啟用安全待同步記錄；為保護進度，登入已停止。請勿使用私密瀏覽，並重新整理後再試。");
        protectionError.cause = error;
        throw protectionError;
      }
    }
    elements.loginForm.reset();
    setStatus(elements.loginStatus, "");
    setConnection("已安全連接", "online");
    if (!isAdmin) renderAttemptOutboxStatus();
    if (state.user.role === "admin") {
      await openAdminDashboard();
      showToast("管理員登入成功。");
    } else {
      await openDashboard();
      openRequestedHomeworkLesson();
      showToast(`你好，${state.user.name}！`);
    }
  } catch (error) {
    console.warn("Phrasal Verb System login failed", error);
    setStatus(elements.loginStatus, error.message || "登入失敗，請再試一次。", "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function logout() {
  const role = state.user?.role;
  const finalAttemptSave = role === "student"
    ? pauseExerciseClock({ persist: true })
    : null;
  if (finalAttemptSave) {
    try {
      await finalAttemptSave;
    } catch (error) {
      console.warn("Phrasal Verb System final durable save failed", error);
      showToast("未能建立最後一份安全待同步記錄；請保持此頁開啟並再試一次。", "error");
      return;
    }
  }
  if (role === "student" && attemptOutboxPersistencePromises.size) {
    const results = await Promise.allSettled([...attemptOutboxPersistencePromises]);
    if (results.some((result) => result.status === "rejected")) {
      showToast("仍有一份練習記錄未能寫入安全待同步佇列；請保持此頁開啟並再試一次。", "error");
      return;
    }
  }
  if (role === "student") window.EdmundSystemNav?.forgetStudentSession();
  try {
    if (role === "admin" && state.authToken) {
      await apiJson("/v1/admin/logout", { method: "POST" });
    }
  } catch (error) {
    console.warn("Phrasal Verb System logout cleanup failed", error);
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
  const sourceResult = parseJsonObject(value?.result, {});
  const result = {
    ...sourceResult,
    controlRevision: normalizeAttemptControlRevision(sourceResult.controlRevision)
  };
  const lessonId = String(value?.lessonId || value?.lesson_id || "");
  const expectedTotal = lessonQuestionCount(getLesson(lessonId));
  return {
    id: String(value?.id || ""),
    lessonId,
    lessonVersion: String(value?.lessonVersion || value?.lesson_version || ""),
    status: String(value?.status || "in_progress"),
    roundNumber: Number(value?.roundNumber || value?.round_number || result.round || 1),
    correctCount: Number(value?.correctCount ?? value?.correct_count ?? result.correctIds?.length ?? 0),
    totalCount: Number(value?.totalCount || value?.total_count || expectedTotal),
    durationMs: Number(value?.durationMs || value?.duration_ms || 0),
    startedAt: String(value?.startedAt || value?.started_at || ""),
    completedAt: String(value?.completedAt || value?.completed_at || ""),
    updatedAt: String(value?.updatedAt || value?.updated_at || ""),
    result
  };
}

function newAttemptSyncEpoch() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  throw new Error("此瀏覽器未能建立安全同步時段，請更新瀏覽器。");
}

function cloneAttemptSyncValue(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function attemptSyncAccountKey(user = state.user) {
  const studentId = String(user?.id || "").trim();
  return user?.role === "student" && UUID_RE.test(studentId)
    ? studentId.toLocaleLowerCase()
    : "";
}

async function attemptTokenFingerprint(token) {
  const value = String(token || "");
  if (!value || !globalThis.crypto?.subtle || typeof TextEncoder !== "function") {
    throw new Error("此瀏覽器未能建立安全同步識別碼。");
  }
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function captureAttemptSyncContext() {
  const accountKey = attemptSyncAccountKey();
  if (
    !accountKey
    || !state.authToken
    || !state.attemptSyncEpoch
    || !state.attemptTokenFingerprint
    || state.attemptSyncAccountKey !== accountKey
  ) return null;
  return {
    accountKey,
    ownerKey: `${accountKey}::${state.attemptTokenFingerprint}::${state.attemptSyncEpoch}`,
    studentId: String(state.user.id),
    studentName: String(state.user.name),
    authToken: String(state.authToken),
    tokenFingerprint: state.attemptTokenFingerprint,
    syncEpoch: state.attemptSyncEpoch
  };
}

function isAttemptSyncContextCurrent(context) {
  const active = captureAttemptSyncContext();
  return Boolean(
    context?.ownerKey
    && active?.ownerKey === context.ownerKey
    && active.studentId === context.studentId
    && active.authToken === context.authToken
  );
}

function deactivateAttemptSyncContext() {
  if (attemptOutboxRetryTimer) window.clearTimeout(attemptOutboxRetryTimer);
  attemptOutboxRetryTimer = null;
  attemptOutboxRetryAt = 0;
  attemptOutboxDrainRequested = false;
  state.attemptSyncEpoch = "";
  state.attemptTokenFingerprint = "";
  state.attemptSyncAccountKey = "";
  state.attemptOutboxPending = 0;
  state.attemptOutboxLastError = "";
  state.attemptOutboxBlocked = false;
  attemptCanonicalPayloads.clear();
}

function attemptPayloadFromValue(value) {
  const normalized = normalizeAttempt(value || {});
  return {
    lessonId: normalized.lessonId,
    lessonVersion: normalized.lessonVersion,
    status: normalized.status === "completed" ? "completed" : "in_progress",
    roundNumber: Math.max(1, Number(normalized.roundNumber || normalized.result?.round || 1)),
    correctCount: Math.max(0, Number(normalized.correctCount || 0)),
    totalCount: Math.max(0, Number(normalized.totalCount || 0)),
    durationMs: Math.max(0, Number(normalized.durationMs || 0)),
    startedAt: normalized.startedAt,
    completedAt: normalized.completedAt || null,
    result: cloneAttemptSyncValue(normalized.result || {})
  };
}

function uniqueAttemptIds(...values) {
  const seen = new Set();
  return values.flatMap((value) => Array.isArray(value) ? value : []).map(String).filter((id) => {
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function normalizeAttemptControlRevision(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.min(2147483647, Math.trunc(numeric));
}

function attemptControlState(value) {
  return {
    awaitingNextRound: value?.awaitingNextRound === true,
    correctionMode: value?.correctionMode === true,
    correctionIds: uniqueAttemptIds(value?.correctionIds),
    collapsedCorrectIds: uniqueAttemptIds(value?.collapsedCorrectIds)
  };
}

function attemptControlIdsEqual(left, right) {
  const leftIds = uniqueAttemptIds(left).sort();
  const rightIds = uniqueAttemptIds(right).sort();
  return leftIds.length === rightIds.length
    && leftIds.every((id, index) => id === rightIds[index]);
}

function attemptControlStatesEqual(left, right) {
  const earlier = attemptControlState(left);
  const later = attemptControlState(right);
  return earlier.awaitingNextRound === later.awaitingNextRound
    && earlier.correctionMode === later.correctionMode
    && attemptControlIdsEqual(earlier.correctionIds, later.correctionIds)
    && attemptControlIdsEqual(earlier.collapsedCorrectIds, later.collapsedCorrectIds);
}

function nextAttemptControlRevision(value) {
  const revision = normalizeAttemptControlRevision(value);
  if (revision >= 2147483647) {
    throw new Error("練習顯示狀態修訂號已達安全上限；已停止同步以免覆蓋記錄。");
  }
  return revision + 1;
}

function bumpAttemptControlRevisionIfChanged(exercise, before) {
  if (!exercise || attemptControlStatesEqual(before, exercise)) return false;
  exercise.controlRevision = nextAttemptControlRevision(exercise.controlRevision);
  return true;
}

function normalizedAttemptControls(value, correctIds, questionState, completed) {
  const control = attemptControlState(value);
  const correctSet = new Set(uniqueAttemptIds(correctIds));
  let correctionIds = control.correctionIds
    .filter((id) => !correctSet.has(id) && questionState?.[id]?.status === "wrong");
  const correctionMode = !completed && control.correctionMode && correctionIds.length > 0;
  if (!correctionMode) correctionIds = [];
  return {
    awaitingNextRound: !completed && !correctionMode && control.awaitingNextRound,
    correctionMode,
    correctionIds,
    collapsedCorrectIds: control.collapsedCorrectIds.filter((id) => correctSet.has(id))
  };
}

function attemptQuestionStateRank(value) {
  if (value?.status === "correct") return 3;
  if (value?.status === "wrong") return 2;
  return 1;
}

function mergeAttemptQuestionStates(left, right) {
  const output = {};
  const leftState = isPlainObject(left) ? left : {};
  const rightState = isPlainObject(right) ? right : {};
  const ids = new Set([...Object.keys(leftState), ...Object.keys(rightState)]);
  ids.forEach((id) => {
    const earlier = isPlainObject(leftState[id]) ? leftState[id] : null;
    const later = isPlainObject(rightState[id]) ? rightState[id] : null;
    const chosen = !earlier
      ? later
      : !later
        ? earlier
        : attemptQuestionStateRank(later) >= attemptQuestionStateRank(earlier)
          ? later
          : earlier;
    if (!chosen) return;
    output[id] = {
      status: ["pending", "correct", "wrong"].includes(chosen.status) ? chosen.status : "pending",
      lastAnswer: String(chosen.lastAnswer || ""),
      reveal: Boolean(earlier?.reveal || later?.reveal)
    };
  });
  return output;
}

function attemptRoundFingerprint(round) {
  return JSON.stringify([
    Number(round?.round || 0),
    String(round?.kind || ""),
    String(round?.submittedAt || ""),
    uniqueAttemptIds(round?.checkedIds).sort(),
    uniqueAttemptIds(round?.correctIds).sort(),
    uniqueAttemptIds(round?.incorrectIds).sort()
  ]);
}

function mergeAttemptRounds(left, right) {
  const canonicalRounds = (Array.isArray(left) ? left : [])
    .filter(isPlainObject)
    .map(cloneAttemptSyncValue);
  if (canonicalRounds.length > 250) {
    throw new Error("伺服器練習歷史超出安全合併上限；已停止同步以免遺漏記錄。");
  }
  const rounds = canonicalRounds.slice();
  const seen = new Set(rounds.map(attemptRoundFingerprint));
  const localOnly = [];
  (Array.isArray(right) ? right : []).forEach((round) => {
    if (!isPlainObject(round)) return;
    const fingerprint = attemptRoundFingerprint(round);
    if (seen.has(fingerprint)) return;
    seen.add(fingerprint);
    localOnly.push({ fingerprint, round: cloneAttemptSyncValue(round) });
  });
  localOnly.sort((leftRound, rightRound) => (
    (Date.parse(leftRound.round.submittedAt) || 0) - (Date.parse(rightRound.round.submittedAt) || 0)
    || Number(leftRound.round.round || 0) - Number(rightRound.round.round || 0)
    || String(leftRound.round.kind || "").localeCompare(String(rightRound.round.kind || ""))
    || leftRound.fingerprint.localeCompare(rightRound.fingerprint)
  ));
  if (rounds.length + localOnly.length > 250) {
    throw new Error("合併後的練習歷史超出安全上限；已停止同步以免遺漏記錄。");
  }
  localOnly.forEach((entry) => rounds.push(entry.round));
  return rounds;
}

function earlierAttemptTimestamp(left, right) {
  const values = [left, right].map(String).filter(Boolean);
  if (!values.length) return "";
  return values.sort((first, second) => (Date.parse(first) || Number.MAX_SAFE_INTEGER) - (Date.parse(second) || Number.MAX_SAFE_INTEGER))[0];
}

function laterAttemptTimestamp(left, right) {
  const values = [left, right].map(String).filter(Boolean);
  if (!values.length) return null;
  return values.sort((first, second) => (Date.parse(second) || 0) - (Date.parse(first) || 0))[0];
}

function mergeAttemptPayloadLosslessly(canonicalValue, incomingValue) {
  const canonical = attemptPayloadFromValue(canonicalValue);
  const incoming = attemptPayloadFromValue(incomingValue);
  if (canonical.lessonId && incoming.lessonId && canonical.lessonId !== incoming.lessonId) {
    throw new Error("不能合併屬於不同教材的練習記錄。");
  }
  const canonicalResult = parseJsonObject(canonical.result, {});
  const incomingResult = parseJsonObject(incoming.result, {});
  const correctIds = uniqueAttemptIds(canonicalResult.correctIds, incomingResult.correctIds);
  const questionState = mergeAttemptQuestionStates(canonicalResult.questionState, incomingResult.questionState);
  correctIds.forEach((id) => {
    const canonicalState = canonicalResult.questionState?.[id];
    const incomingState = incomingResult.questionState?.[id];
    const correctState = incomingState?.status === "correct"
      ? incomingState
      : canonicalState?.status === "correct"
        ? canonicalState
        : null;
    if (correctState) questionState[id] = cloneAttemptSyncValue(correctState);
  });
  const roundNumber = Math.max(
    1,
    Number(canonical.roundNumber || canonicalResult.round || 1),
    Number(incoming.roundNumber || incomingResult.round || 1)
  );
  const totalCount = Math.max(Number(canonical.totalCount || 0), Number(incoming.totalCount || 0));
  const completed = (
    canonical.status === "completed"
    || incoming.status === "completed"
    || Boolean(canonical.completedAt)
    || Boolean(incoming.completedAt)
  ) && totalCount > 0 && correctIds.length >= totalCount;
  const canonicalControlRevision = normalizeAttemptControlRevision(canonicalResult.controlRevision);
  const incomingControlRevision = normalizeAttemptControlRevision(incomingResult.controlRevision);
  const incomingControlsAreNewer = incomingControlRevision > canonicalControlRevision;
  const controlResult = incomingControlsAreNewer ? incomingResult : canonicalResult;
  const chosenControls = attemptControlState(controlResult);
  const mergedControls = normalizedAttemptControls(controlResult, correctIds, questionState, completed);
  let controlRevision = Math.max(canonicalControlRevision, incomingControlRevision);
  if (!attemptControlStatesEqual(chosenControls, mergedControls)) {
    controlRevision = nextAttemptControlRevision(controlRevision);
  }
  const result = {
    round: roundNumber,
    correctIds,
    questionState,
    rounds: mergeAttemptRounds(canonicalResult.rounds, incomingResult.rounds),
    awaitingNextRound: mergedControls.awaitingNextRound,
    correctionMode: mergedControls.correctionMode,
    correctionIds: mergedControls.correctionIds,
    collapsedCorrectIds: mergedControls.collapsedCorrectIds,
    controlRevision,
    contentVersion: String(incomingResult.contentVersion || canonicalResult.contentVersion || CONTENT.version || "1")
  };
  return {
    lessonId: incoming.lessonId || canonical.lessonId,
    lessonVersion: incoming.lessonVersion || canonical.lessonVersion,
    status: completed ? "completed" : "in_progress",
    roundNumber,
    correctCount: correctIds.length,
    totalCount,
    durationMs: Math.max(Number(canonical.durationMs || 0), Number(incoming.durationMs || 0)),
    startedAt: earlierAttemptTimestamp(canonical.startedAt, incoming.startedAt),
    completedAt: completed ? laterAttemptTimestamp(canonical.completedAt, incoming.completedAt) : null,
    result
  };
}

function attemptOutboxRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}

function attemptOutboxTransactionComplete(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed"));
  });
}

function trackAttemptOutboxPersistence(promise) {
  attemptOutboxPersistencePromises.add(promise);
  promise.then(
    () => attemptOutboxPersistencePromises.delete(promise),
    () => attemptOutboxPersistencePromises.delete(promise)
  );
  return promise;
}

function openAttemptOutboxDatabase() {
  if (attemptOutboxDatabasePromise) return attemptOutboxDatabasePromise;
  if (!globalThis.indexedDB) return Promise.reject(new Error("此瀏覽器未能使用耐久本機儲存。"));
  attemptOutboxDatabasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(ATTEMPT_OUTBOX_DB_NAME, ATTEMPT_OUTBOX_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      const mutationStore = database.objectStoreNames.contains(ATTEMPT_OUTBOX_STORE)
        ? request.transaction.objectStore(ATTEMPT_OUTBOX_STORE)
        : database.createObjectStore(ATTEMPT_OUTBOX_STORE, { keyPath: "mutationId" });
      if (!mutationStore.indexNames.contains("ownerKey")) mutationStore.createIndex("ownerKey", "ownerKey", { unique: false });
      if (!mutationStore.indexNames.contains("accountKey")) mutationStore.createIndex("accountKey", "accountKey", { unique: false });
      if (!mutationStore.indexNames.contains("attemptId")) mutationStore.createIndex("attemptId", "attemptId", { unique: false });
      if (!database.objectStoreNames.contains(ATTEMPT_OUTBOX_LEASE_STORE)) {
        database.createObjectStore(ATTEMPT_OUTBOX_LEASE_STORE, { keyPath: "accountKey" });
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => {
        database.close();
        attemptOutboxDatabasePromise = null;
      };
      resolve(database);
    };
    request.onerror = () => {
      attemptOutboxDatabasePromise = null;
      reject(request.error || new Error("未能開啟耐久待同步記錄。"));
    };
    request.onblocked = () => {
      attemptOutboxDatabasePromise = null;
      reject(new Error("耐久待同步記錄正由另一個舊版本頁面佔用。"));
    };
  });
  return attemptOutboxDatabasePromise;
}

async function listAttemptOutboxRecords(context, { accountWide = false } = {}) {
  if (!context?.ownerKey || !context?.accountKey) return [];
  const database = await openAttemptOutboxDatabase();
  const transaction = database.transaction(ATTEMPT_OUTBOX_STORE, "readonly");
  const store = transaction.objectStore(ATTEMPT_OUTBOX_STORE);
  const indexName = accountWide ? "accountKey" : "ownerKey";
  const indexValue = accountWide ? context.accountKey : context.ownerKey;
  const rows = await attemptOutboxRequest(store.index(indexName).getAll(indexValue));
  await attemptOutboxTransactionComplete(transaction);
  return (Array.isArray(rows) ? rows : [])
    .filter((record) => (
      record?.schemaVersion === ATTEMPT_OUTBOX_SCHEMA_VERSION
      && record.accountKey === context.accountKey
      && (accountWide || record.ownerKey === context.ownerKey)
    ))
    .sort((left, right) => (
      Number(left.createdAt || 0) - Number(right.createdAt || 0)
      || Number(left.sequence || 0) - Number(right.sequence || 0)
      || String(left.mutationId).localeCompare(String(right.mutationId))
    ));
}

async function updateAttemptOutboxRecord(record) {
  const database = await openAttemptOutboxDatabase();
  const transaction = database.transaction(ATTEMPT_OUTBOX_STORE, "readwrite");
  const store = transaction.objectStore(ATTEMPT_OUTBOX_STORE);
  const existing = await attemptOutboxRequest(store.get(record.mutationId));
  if (existing?.ownerKey === record.ownerKey && existing?.accountKey === record.accountKey) store.put(record);
  await attemptOutboxTransactionComplete(transaction);
  return Boolean(existing);
}

async function deleteAttemptOutboxRecord(record) {
  const database = await openAttemptOutboxDatabase();
  const transaction = database.transaction(ATTEMPT_OUTBOX_STORE, "readwrite");
  const store = transaction.objectStore(ATTEMPT_OUTBOX_STORE);
  const existing = await attemptOutboxRequest(store.get(record.mutationId));
  if (existing?.ownerKey === record.ownerKey && existing?.accountKey === record.accountKey) {
    store.delete(record.mutationId);
  }
  await attemptOutboxTransactionComplete(transaction);
  return Boolean(existing);
}

async function replaceAttemptOutboxRecord(record, replacement) {
  const database = await openAttemptOutboxDatabase();
  const transaction = database.transaction(ATTEMPT_OUTBOX_STORE, "readwrite");
  const store = transaction.objectStore(ATTEMPT_OUTBOX_STORE);
  const existing = await attemptOutboxRequest(store.get(record.mutationId));
  if (
    existing?.ownerKey === record.ownerKey
    && existing?.accountKey === record.accountKey
    && replacement?.ownerKey === record.ownerKey
  ) {
    store.add(replacement);
    store.delete(record.mutationId);
  }
  await attemptOutboxTransactionComplete(transaction);
  return Boolean(existing);
}

function createAttemptOutboxRecord(attemptId, payload, context, source = "exercise") {
  const createdAt = Date.now();
  const mutationId = globalThis.crypto?.randomUUID?.();
  if (!mutationId) throw new Error("此瀏覽器未能建立安全待同步編號。");
  return {
    schemaVersion: ATTEMPT_OUTBOX_SCHEMA_VERSION,
    mutationId,
    logicalMutationId: mutationId,
    ownerKey: context.ownerKey,
    accountKey: context.accountKey,
    studentId: context.studentId,
    studentName: context.studentName,
    tokenFingerprint: context.tokenFingerprint,
    syncEpoch: context.syncEpoch,
    originalOwnerKey: context.ownerKey,
    attemptId: String(attemptId),
    payload: cloneAttemptSyncValue(payload),
    source: String(source || "exercise"),
    createdAt,
    sequence: ++attemptOutboxSequence,
    updatedAt: createdAt,
    status: "queued",
    retries: 0,
    conflicts: 0,
    nextAttemptAt: 0,
    lastAttemptAt: 0,
    lastError: ""
  };
}

async function enqueueAttemptOutboxRecord(record) {
  const database = await openAttemptOutboxDatabase();
  const transaction = database.transaction(ATTEMPT_OUTBOX_STORE, "readwrite");
  const store = transaction.objectStore(ATTEMPT_OUTBOX_STORE);
  const existingRows = await attemptOutboxRequest(store.index("ownerKey").getAll(record.ownerKey));
  const coalescible = (Array.isArray(existingRows) ? existingRows : []).filter((existing) => (
    existing?.accountKey === record.accountKey
    && existing?.attemptId === record.attemptId
    && ["queued", "retry", "auth_required"].includes(existing.status)
  ));
  coalescible.sort((left, right) => Number(left.createdAt || 0) - Number(right.createdAt || 0));
  let retainedRetry = null;
  for (const existing of coalescible) {
    record.payload = mergeAttemptPayloadLosslessly(existing.payload, record.payload);
    record.createdAt = Math.min(Number(record.createdAt), Number(existing.createdAt || record.createdAt));
    record.sequence = Math.min(Number(record.sequence), Number(existing.sequence || record.sequence));
    record.logicalMutationId = existing.logicalMutationId || existing.mutationId;
    if (
      existing.status === "retry"
      && (!retainedRetry || Number(existing.nextAttemptAt || 0) > Number(retainedRetry.nextAttemptAt || 0))
    ) retainedRetry = existing;
    store.delete(existing.mutationId);
  }
  if (retainedRetry) {
    record.status = "retry";
    record.retries = Math.max(Number(record.retries || 0), Number(retainedRetry.retries || 0));
    record.nextAttemptAt = Math.max(Number(record.nextAttemptAt || 0), Number(retainedRetry.nextAttemptAt || 0));
    record.lastError = String(retainedRetry.lastError || "暫時未能同步，系統會自動重試。");
  }
  store.add(record);
  await attemptOutboxTransactionComplete(transaction);
  return record;
}

async function acquireAttemptOutboxLease(context) {
  const database = await openAttemptOutboxDatabase();
  const transaction = database.transaction(ATTEMPT_OUTBOX_LEASE_STORE, "readwrite");
  const store = transaction.objectStore(ATTEMPT_OUTBOX_LEASE_STORE);
  const existing = await attemptOutboxRequest(store.get(context.accountKey));
  const now = Date.now();
  const available = !existing
    || existing.holder === attemptOutboxInstanceId
    || Number(existing.expiresAt || 0) <= now;
  if (available) {
    store.put({
      accountKey: context.accountKey,
      holder: attemptOutboxInstanceId,
      ownerKey: context.ownerKey,
      acquiredAt: now,
      expiresAt: now + ATTEMPT_OUTBOX_LEASE_MS
    });
  }
  await attemptOutboxTransactionComplete(transaction);
  return available;
}

async function releaseAttemptOutboxLease(context) {
  try {
    const database = await openAttemptOutboxDatabase();
    const transaction = database.transaction(ATTEMPT_OUTBOX_LEASE_STORE, "readwrite");
    const store = transaction.objectStore(ATTEMPT_OUTBOX_LEASE_STORE);
    const existing = await attemptOutboxRequest(store.get(context.accountKey));
    if (existing?.holder === attemptOutboxInstanceId) store.delete(context.accountKey);
    await attemptOutboxTransactionComplete(transaction);
  } catch (error) {
    console.warn("Phrasal Verb attempt outbox lease release failed", error);
  }
}

async function withAttemptOutboxAccountLock(context, task) {
  const lockName = `${ATTEMPT_OUTBOX_LOCK_PREFIX}${context.accountKey}`;
  if (navigator.locks?.request) {
    try {
      return await navigator.locks.request(lockName, { ifAvailable: true }, async (lock) => {
        if (!lock) return { lockUnavailable: true };
        return task();
      });
    } catch (error) {
      console.warn("Web Lock unavailable; using the durable attempt lease", error);
    }
  }
  const acquired = await acquireAttemptOutboxLease(context);
  if (!acquired) return { lockUnavailable: true };
  try {
    return await task();
  } finally {
    await releaseAttemptOutboxLease(context);
  }
}

async function adoptAttemptOutboxForContext(context) {
  const database = await openAttemptOutboxDatabase();
  const transaction = database.transaction(ATTEMPT_OUTBOX_STORE, "readwrite");
  const store = transaction.objectStore(ATTEMPT_OUTBOX_STORE);
  const rows = await attemptOutboxRequest(store.index("accountKey").getAll(context.accountKey));
  const now = Date.now();
  for (const record of Array.isArray(rows) ? rows : []) {
    if (
      record?.schemaVersion !== ATTEMPT_OUTBOX_SCHEMA_VERSION
      || String(record.studentId || "") !== context.studentId
      || String(record.accountKey || "") !== context.accountKey
    ) continue;
    const ownerChanged = record.ownerKey !== context.ownerKey;
    const staleInflight = record.status === "inflight"
      && now - Number(record.lastAttemptAt || 0) >= ATTEMPT_OUTBOX_LEASE_MS;
    const updated = {
      ...record,
      ownerKey: context.ownerKey,
      tokenFingerprint: context.tokenFingerprint,
      syncEpoch: context.syncEpoch,
      studentName: context.studentName,
      originalStudentName: record.originalStudentName || record.studentName || context.studentName,
      updatedAt: now,
      ...(ownerChanged ? { adoptedFromOwnerKey: record.ownerKey, adoptedAt: now } : {})
    };
    if ((ownerChanged && record.status !== "blocked") || staleInflight) {
      updated.status = "queued";
      updated.nextAttemptAt = 0;
      updated.lastError = "";
    }
    store.put(updated);
  }
  await attemptOutboxTransactionComplete(transaction);
}

function renderAttemptOutboxStatus() {
  if (state.user?.role !== "student") return;
  const pending = Math.max(0, Number(state.attemptOutboxPending || 0));
  if (pending) {
    setConnection(
      state.attemptOutboxBlocked
        ? `同步保護已暫停 · ${pending} 項變更安全保留，需完成同步核實`
        : state.attemptOutboxLastError
        ? `已安全儲存在此裝置 · ${pending} 項等待自動重試`
        : `已安全儲存在此裝置 · ${pending} 項待同步`,
      state.attemptOutboxBlocked ? "error" : "checking"
    );
  } else if (state.attemptSyncAccountKey) {
    setConnection("已安全連接", "online");
  }
}

async function refreshAttemptOutboxStatus(context = captureAttemptSyncContext()) {
  if (!context || !isAttemptSyncContextCurrent(context)) return 0;
  const rows = await listAttemptOutboxRecords(context);
  if (!isAttemptSyncContextCurrent(context)) return rows.length;
  state.attemptOutboxPending = rows.length;
  const failed = rows.find((record) => record.lastError || ["retry", "blocked", "auth_required"].includes(record.status));
  state.attemptOutboxBlocked = rows.some((record) => record.status === "blocked");
  state.attemptOutboxLastError = failed ? String(failed.lastError || "待同步記錄正在等候重試。") : "";
  renderAttemptOutboxStatus();
  return rows.length;
}

async function activateAttemptSyncContext() {
  if (state.user?.role !== "student" || !state.authToken) return false;
  if (!state.attemptSyncEpoch) state.attemptSyncEpoch = newAttemptSyncEpoch();
  const snapshot = {
    id: String(state.user.id || ""),
    name: String(state.user.name || ""),
    token: String(state.authToken),
    syncEpoch: String(state.attemptSyncEpoch)
  };
  const fingerprint = await attemptTokenFingerprint(snapshot.token);
  if (
    state.user?.role !== "student"
    || String(state.user.id || "") !== snapshot.id
    || String(state.user.name || "") !== snapshot.name
    || String(state.authToken) !== snapshot.token
    || String(state.attemptSyncEpoch) !== snapshot.syncEpoch
  ) return false;
  state.attemptTokenFingerprint = fingerprint;
  state.attemptSyncAccountKey = attemptSyncAccountKey();
  const context = captureAttemptSyncContext();
  if (!context) return false;
  const adoption = await withAttemptOutboxAccountLock(context, () => adoptAttemptOutboxForContext(context));
  if (adoption?.lockUnavailable) scheduleAttemptOutboxDrain("adoption-lock", 750);
  await refreshAttemptOutboxStatus(context);
  setupAttemptOutboxWakeups();
  scheduleAttemptOutboxDrain("activate", 0);
  saveSession();
  return true;
}

function attemptOutboxRetryDelay(retries, retryAfterMs = 0, randomValue = Math.random()) {
  const exponent = Math.max(0, Math.min(12, Number(retries || 0) - 1));
  const baseDelay = Math.min(ATTEMPT_OUTBOX_RETRY_CAP_MS, ATTEMPT_OUTBOX_RETRY_BASE_MS * (2 ** exponent));
  const jitter = 0.8 + (Math.max(0, Math.min(1, Number(randomValue || 0))) * 0.4);
  return Math.min(
    ATTEMPT_OUTBOX_RETRY_CAP_MS,
    Math.max(Math.ceil(Number(retryAfterMs || 0)), Math.round(baseDelay * jitter))
  );
}

function retryableAttemptSyncError(error) {
  const status = Number(error?.status || 0);
  return status === 0
    || [408, 425, 429, 500, 502, 503, 504].includes(status)
    || error?.code === "NETWORK_ERROR";
}

function scheduleAttemptOutboxDrain(reason = "scheduled", delayMs = 0) {
  const delay = Math.max(0, Number(delayMs || 0));
  if (attemptOutboxDrainPromise && delay === 0) {
    attemptOutboxDrainRequested = true;
    return;
  }
  const runAt = Date.now() + delay;
  if (attemptOutboxRetryTimer && attemptOutboxRetryAt <= runAt) return;
  if (attemptOutboxRetryTimer) window.clearTimeout(attemptOutboxRetryTimer);
  attemptOutboxRetryAt = runAt;
  attemptOutboxRetryTimer = window.setTimeout(() => {
    attemptOutboxRetryTimer = null;
    attemptOutboxRetryAt = 0;
    void drainAttemptOutbox({ reason });
  }, delay);
}

function applyAttemptPayloadLocally(attemptId, payload, updatedAt = new Date().toISOString()) {
  const index = state.attempts.findIndex((attempt) => attempt.id === attemptId);
  const current = index >= 0 ? attemptPayloadFromValue(state.attempts[index]) : null;
  const merged = current ? mergeAttemptPayloadLosslessly(current, payload) : attemptPayloadFromValue(payload);
  const normalized = normalizeAttempt({ id: attemptId, ...merged, updatedAt });
  if (index >= 0) state.attempts[index] = normalized;
  else state.attempts.unshift(normalized);
  state.dashboardLoaded = true;
  return normalized;
}

async function overlayPendingAttemptMutations(context = captureAttemptSyncContext()) {
  if (!context || !isAttemptSyncContextCurrent(context)) return [];
  const rows = await listAttemptOutboxRecords(context);
  if (!isAttemptSyncContextCurrent(context)) return rows;
  rows.forEach((record) => {
    if (!UUID_RE.test(String(record.attemptId || "")) || !isPlainObject(record.payload)) return;
    applyAttemptPayloadLocally(record.attemptId, record.payload, new Date(Number(record.updatedAt || Date.now())).toISOString());
  });
  return rows;
}

async function attemptOutboxApiJson(path, options, context) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), ATTEMPT_OUTBOX_REQUEST_TIMEOUT_MS);
  try {
    return await apiJson(path, { ...options, signal: controller.signal }, true, context.authToken);
  } finally {
    window.clearTimeout(timeout);
  }
}

async function replaceAttemptConflictWithFreshMutation(record, context) {
  const response = await attemptOutboxApiJson(
    `/v1/attempts/${encodeURIComponent(record.attemptId)}`,
    {},
    context
  );
  const canonicalAttempt = response?.attempt;
  if (!canonicalAttempt || String(canonicalAttempt.id || "") !== record.attemptId) {
    const error = new Error("伺服器未能提供衝突記錄的核實版本。");
    error.status = 409;
    error.code = "INVALID_CONFLICT_CANONICAL";
    throw error;
  }
  const canonicalPayload = attemptPayloadFromValue(canonicalAttempt);
  const mergedPayload = mergeAttemptPayloadLosslessly(canonicalPayload, record.payload);
  const now = Date.now();
  const conflictNumber = Number(record.conflicts || 0) + 1;
  const replacement = {
    ...record,
    mutationId: globalThis.crypto?.randomUUID?.(),
    logicalMutationId: record.logicalMutationId || record.mutationId,
    payload: mergedPayload,
    status: "retry",
    retries: Number(record.retries || 0) + 1,
    conflicts: conflictNumber,
    nextAttemptAt: now + attemptOutboxRetryDelay(conflictNumber, 0),
    lastAttemptAt: now,
    updatedAt: now,
    lastError: "同步版本已安全合併，正等候重新提交。",
    replacesMutationId: record.mutationId
  };
  if (!replacement.mutationId) throw new Error("此瀏覽器未能建立新的安全衝突重試編號。");
  const replaced = await replaceAttemptOutboxRecord(record, replacement);
  if (!replaced) return null;
  attemptCanonicalPayloads.set(record.attemptId, canonicalPayload);
  if (isAttemptSyncContextCurrent(context)) applyAttemptPayloadLocally(record.attemptId, mergedPayload);
  scheduleAttemptOutboxDrain("conflict-merged", replacement.nextAttemptAt - now);
  return replacement;
}

async function markAttemptOutboxRetry(record, error) {
  const retries = Number(record.retries || 0) + 1;
  const delay = attemptOutboxRetryDelay(retries, Number(error?.retryAfterMs || 0));
  const retryRecord = {
    ...record,
    status: "retry",
    retries,
    nextAttemptAt: Date.now() + delay,
    updatedAt: Date.now(),
    lastError: String(error?.message || "暫時未能同步，系統會自動重試。")
  };
  await updateAttemptOutboxRecord(retryRecord);
  scheduleAttemptOutboxDrain("retry", delay);
  return retryRecord;
}

async function drainAttemptOutboxUnlocked(context) {
  if (!context || !isAttemptSyncContextCurrent(context)) return { acknowledged: 0, pending: 0, blocked: true };
  await adoptAttemptOutboxForContext(context);
  const rows = await listAttemptOutboxRecords(context);
  let acknowledged = 0;
  for (const original of rows) {
    if (!isAttemptSyncContextCurrent(context)) break;
    if (original.status === "blocked") break;
    const now = Date.now();
    if (original.status === "inflight" && now - Number(original.lastAttemptAt || 0) < ATTEMPT_OUTBOX_LEASE_MS) {
      scheduleAttemptOutboxDrain("inflight-lease", ATTEMPT_OUTBOX_LEASE_MS - (now - Number(original.lastAttemptAt || 0)));
      break;
    }
    if (Number(original.nextAttemptAt || 0) > now) {
      scheduleAttemptOutboxDrain("retry-wait", Number(original.nextAttemptAt) - now);
      break;
    }
    let record = original;
    try {
      const canonical = attemptCanonicalPayloads.get(record.attemptId);
      const payload = canonical
        ? mergeAttemptPayloadLosslessly(canonical, record.payload)
        : attemptPayloadFromValue(record.payload);
      record = {
        ...record,
        payload,
        status: "inflight",
        lastAttemptAt: now,
        updatedAt: now,
        lastError: ""
      };
      await updateAttemptOutboxRecord(record);
      const response = await attemptOutboxApiJson(`/v1/attempts/${encodeURIComponent(record.attemptId)}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      }, context);
      const saved = normalizeAttempt(response?.attempt || { id: record.attemptId, ...payload });
      if (saved.id !== record.attemptId || saved.lessonId !== payload.lessonId) {
        throw new Error("伺服器回傳了另一份練習記錄。");
      }
      const savedPayload = attemptPayloadFromValue(saved);
      attemptCanonicalPayloads.set(record.attemptId, savedPayload);
      await deleteAttemptOutboxRecord(record);
      acknowledged += 1;
      if (isAttemptSyncContextCurrent(context)) applyAttemptPayloadLocally(record.attemptId, savedPayload, saved.updatedAt);
    } catch (error) {
      if (Number(error?.status || 0) === 409) {
        try {
          await replaceAttemptConflictWithFreshMutation(record, context);
        } catch (conflictError) {
          await markAttemptOutboxRetry(record, conflictError);
        }
        break;
      }
      if (retryableAttemptSyncError(error)) {
        await markAttemptOutboxRetry(record, error);
        break;
      }
      if (Number(error?.status || 0) === 401) {
        await updateAttemptOutboxRecord({
          ...record,
          status: "auth_required",
          updatedAt: Date.now(),
          lastError: "登入時段已結束；記錄仍安全保留在此裝置，重新登入同一帳戶後會再同步。"
        });
        break;
      }
      await updateAttemptOutboxRecord({
        ...record,
        status: "blocked",
        updatedAt: Date.now(),
        lastError: String(error?.message || "待同步記錄需要檢查。")
      });
      break;
    }
  }
  const pending = isAttemptSyncContextCurrent(context)
    ? await refreshAttemptOutboxStatus(context)
    : rows.length - acknowledged;
  return { acknowledged, pending, blocked: false };
}

async function drainAttemptOutbox(options = {}) {
  if (attemptOutboxDrainPromise) return attemptOutboxDrainPromise;
  const context = options.context || captureAttemptSyncContext();
  if (!context) return { acknowledged: 0, pending: 0, blocked: true };
  attemptOutboxDrainPromise = withAttemptOutboxAccountLock(
    context,
    () => drainAttemptOutboxUnlocked(context)
  ).then((result) => {
    if (result?.lockUnavailable) scheduleAttemptOutboxDrain("single-writer-lock", 750);
    return result;
  }).catch((error) => {
    console.warn("Phrasal Verb attempt outbox drain failed", error);
    if (isAttemptSyncContextCurrent(context)) {
      state.attemptOutboxLastError = String(error?.message || error || "待同步記錄暫時未能處理。");
      renderAttemptOutboxStatus();
      scheduleAttemptOutboxDrain("drain-error", attemptOutboxRetryDelay(1));
    }
    return { acknowledged: 0, pending: state.attemptOutboxPending, blocked: true };
  }).finally(() => {
    attemptOutboxDrainPromise = null;
    if (attemptOutboxDrainRequested) {
      attemptOutboxDrainRequested = false;
      scheduleAttemptOutboxDrain("follow-up", 0);
    }
  });
  return attemptOutboxDrainPromise;
}

function setupAttemptOutboxWakeups() {
  if (attemptOutboxWakeupsBound) return;
  attemptOutboxWakeupsBound = true;
  window.addEventListener("online", () => scheduleAttemptOutboxDrain("online", 0));
  window.addEventListener("focus", () => scheduleAttemptOutboxDrain("focus", 0));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleAttemptOutboxDrain("visibility", 0);
  });
  try { void navigator.storage?.persist?.(); } catch { /* IndexedDB remains the durable source of truth. */ }
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
  attemptCanonicalPayloads.clear();
  state.attempts.forEach((attempt) => attemptCanonicalPayloads.set(attempt.id, attemptPayloadFromValue(attempt)));
  await overlayPendingAttemptMutations();
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
  const firstLessonTotal = lessonQuestionCount(lessonList()[0]);
  elements.dashboardWelcome.textContent = `${state.user.name}，選擇一組動詞片語，由完整概念開始${firstLessonTotal ? `，再完成 ${firstLessonTotal} 題練習` : "並完成句子練習"}。`;
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
    console.warn("Phrasal Verb System dashboard failed", error);
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
    showToast("這個 Phrasal Verb System 練習目前不存在。", "error");
    return false;
  }
  openLesson(lessonId, { page: 1 });
  return true;
}

function renderLessonChoices() {
  if (elements.lessonCount) elements.lessonCount.textContent = String(lessonList().length);
  const cards = lessonList().map((lesson, index) => {
    const questionCount = lessonQuestionCount(lesson);
    const illustration = lessonIllustration(lesson);
    const complete = state.attempts.some((attempt) => (
      attempt.lessonId === lesson.id
      && attempt.status === "completed"
      && questionCount > 0
      && attempt.correctCount >= questionCount
    ));
    const bookmarked = isSectionBookmarked(lesson.id);
    return `
      <article class="lesson-choice-card ${complete ? "is-complete" : ""}">
        <button class="lesson-choice ${complete ? "is-complete" : ""}" type="button" data-open-lesson="${escapeHtml(lesson.id)}" data-number="${index + 1}" data-tone="${complete ? "gold" : index % 2 ? "violet" : "blue"}">
          ${illustration.src ? `<img class="lesson-choice-illustration" src="${escapeHtml(illustration.src)}" alt="" width="${escapeHtml(illustration.width)}" height="${escapeHtml(illustration.height)}" loading="lazy" decoding="async">` : ""}
          <h2>${escapeHtml(lessonTitle(lesson))}<span>${escapeHtml(lessonEnglishTitle(lesson))}</span></h2>
          ${complete ? `<span class="lesson-choice-complete">✓ ${escapeHtml(questionCount)} / ${escapeHtml(questionCount)} 題已完成</span>` : ""}
        </button>
        <button class="lesson-section-bookmark" type="button" data-toggle-section-bookmark="${escapeHtml(lesson.id)}" aria-pressed="${bookmarked}" aria-label="${bookmarked ? "移除動詞片語書簽" : "收藏整組動詞片語"}">${bookmarked ? "★" : "☆"}</button>
      </article>
    `;
  }).join("");
  const sectionBookmarkCount = state.bookmarks.filter((bookmark) => bookmark.questionId === SECTION_BOOKMARK_ID).length;
  const questionBookmarkCount = state.bookmarks.length - sectionBookmarkCount;
  elements.lessonChoiceGrid.innerHTML = `<button class="lesson-choice" type="button" data-open-bookmarks-card data-number="★" data-tone="bookmark">
      <h2>書簽<span>Bookmarks</span></h2>
      <span class="choice-meta"><span>${escapeHtml(sectionBookmarkCount)} 組動詞片語</span><span>${escapeHtml(questionBookmarkCount)} 道題目</span><span>跟隨帳戶同步</span></span>
    </button>${cards}`;
}

function collectLessonSearchStrings(value, output = [], key = "") {
  if (value == null || ["source", "image", "acceptedAnswers", "correctAnswer", "answer"].includes(key)) return output;
  if (typeof value === "string") { const text = value.replace(/\s+/g, " ").trim(); if (text) output.push(text); }
  else if (Array.isArray(value)) value.forEach((item) => collectLessonSearchStrings(item, output, key));
  else if (typeof value === "object") Object.entries(value).forEach(([childKey, item]) => collectLessonSearchStrings(item, output, childKey));
  return output;
}

function normalizeLessonSearchText(value) { return String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim(); }

function lessonSearchIndex() {
  if (lessonSearchIndexCache) return lessonSearchIndexCache;
  const pageFields = [["formulas", "examples", "meaning", "modelExample", "learningObjective"], ["register", "tone", "meaningGroups", "meaningGroups1", "meaningGroupsI"], ["fixedVariable", "meaningGroups2", "meaningGroupsII"], ["specificForms", "forms"], ["benefits"], ["origin", "history", "usageGuide", "realLifeUses", "uses", "realLife", "realLifeContexts", "meaningComparison", "meaningComparisons", "comparisons", "page6Intro", "usageOverview"], ["rules", "importantRules"]];
  const entries = [];
  for (const lesson of lessonList()) {
    const titleTexts = [lessonTitle(lesson), lessonEnglishTitle(lesson), lesson.slug].filter(Boolean);
    entries.push({ lessonId: lesson.id, page: 1, kind: "title", title: lessonTitle(lesson), titleEn: lessonEnglishTitle(lesson), texts: titleTexts });
    pageFields.forEach((fields, index) => { const texts = fields.flatMap((field) => collectLessonSearchStrings(lesson[field])); if (texts.length) entries.push({ lessonId: lesson.id, page: index + 1, kind: "page", title: lessonTitle(lesson), titleEn: lessonEnglishTitle(lesson), texts }); });
    (lesson.questions || []).forEach((question, index) => { const texts = collectLessonSearchStrings(question); if (texts.length) entries.push({ lessonId: lesson.id, page: EXERCISE_PAGE, questionId: String(question.id || ""), kind: "question", questionNumber: index + 1, title: lessonTitle(lesson), titleEn: lessonEnglishTitle(lesson), texts }); });
  }
  lessonSearchIndexCache = entries;
  return entries;
}

function searchLessons(query) {
  const tokens = normalizeLessonSearchText(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  return lessonSearchIndex().filter((entry) => { const haystack = normalizeLessonSearchText(entry.texts.join(" ")); return tokens.every((token) => haystack.includes(token)); });
}

function renderLessonSearch() {
  if (!elements.lessonSearchResults || !elements.lessonSearchSummary) return;
  const query = String(elements.lessonSearchInput?.value || "").trim();
  if (!query) { elements.lessonSearchResults.hidden = true; elements.lessonSearchResults.innerHTML = ""; elements.lessonSearchSummary.textContent = "可搜尋全部動詞片語的標題、八個學習頁面及練習題。"; return; }
  const matches = searchLessons(query);
  elements.lessonSearchSummary.textContent = matches.length ? `找到 ${matches.length} 個相符位置。按結果可直接前往相關頁面或題目。` : "找不到相符內容，請嘗試其他中英文關鍵字。";
  elements.lessonSearchResults.hidden = false;
  elements.lessonSearchResults.innerHTML = matches.slice(0, 80).map((entry) => {
    const queryTokens = normalizeLessonSearchText(query).split(" ").filter(Boolean);
    const preview = entry.texts.find((text) => queryTokens.some((token) => normalizeLessonSearchText(text).includes(token))) || entry.texts[0] || "";
    const place = entry.kind === "question" ? `第 8 頁 · 第 ${entry.questionNumber} 題` : `第 ${entry.page} 頁`;
    return `<button class="lesson-search-result" type="button" data-lesson-search-result data-search-lesson="${escapeHtml(entry.lessonId)}" data-search-page="${entry.page}" data-search-question="${escapeHtml(entry.questionId || "")}"><span>${escapeHtml(place)}</span><strong>${escapeHtml(entry.title)} · ${escapeHtml(entry.titleEn)}</strong><small>${escapeHtml(preview.slice(0, 180))}</small></button>`;
  }).join("");
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
  if (!attempts.length) return '<p class="empty-state">暫時未有練習記錄。完成或開始一組動詞片語練習後，記錄會顯示在這裡。</p>';
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
  pauseExerciseClock({ persist: state.lessonPage === EXERCISE_PAGE });
  if (state.lessonId !== lesson.id) state.visitedLessonPages = new Set();
  state.lessonId = lesson.id;
  state.lessonPage = Math.max(1, Math.min(LESSON_PAGES, Number(page) || 1));
  state.visitedLessonPages.add(state.lessonPage);
  const currentExercise = state.exercise?.lessonId === lesson.id ? state.exercise : null;
  state.exercise = attempt ? exerciseFromAttempt(attempt) : currentExercise;
  if (state.lessonPage === EXERCISE_PAGE && questionId) {
    const exercise = ensureExercise(lesson);
    if (exercise.correctionMode && !exercise.correctionIds.includes(questionId)) {
      const controlsBefore = attemptControlState(exercise);
      exercise.correctionMode = false;
      exercise.correctionIds = [];
      if (bumpAttemptControlRevisionIfChanged(exercise, controlsBefore)) scheduleExercisePersistence();
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
  const nextPage = Math.max(1, Math.min(LESSON_PAGES, Number(page) || 1));
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
    button.classList.toggle("is-complete", step !== state.lessonPage && state.visitedLessonPages.has(step));
  });
  const exerciseVisible = state.lessonPage === EXERCISE_PAGE && state.exercise;
  elements.lessonRound.hidden = !exerciseVisible;
  if (exerciseVisible) elements.lessonRound.textContent = `${state.exercise.correctIds.length}/${getLesson()?.questions?.length || 0} 題完成`;
}

function infoPageHeader(number, titleZh, titleEn, english, description = "") {
  return `<header class="info-page-header">
    <span class="page-label">PAGE ${escapeHtml(number)} · ${escapeHtml(english)}</span>
    <h2>${escapeHtml(titleZh)}<small lang="en">${escapeHtml(titleEn)}</small></h2>
    ${description ? `<p>${escapeHtml(description)}</p>` : ""}
  </header>`;
}

function lessonInfoPageHeader(lesson, page) {
  const meta = lessonPageMeta(lesson, page);
  return infoPageHeader(page, meta.titleZh, meta.titleEn, meta.kicker, meta.description);
}

function bilingualHeadingHtml(chinese, english) {
  return `${escapeHtml(chinese || "")}${english ? `<small lang="en">${escapeHtml(english)}</small>` : ""}`;
}

function bilingualCopyHtml(chinese, english) {
  return `${chinese ? `<p class="chinese-primary" lang="zh-Hant">${escapeHtml(chinese)}</p>` : ""}${english ? `<p class="english-secondary" lang="en">${escapeHtml(english)}</p>` : ""}`;
}

function bilingualListHtml(chineseItems, englishItems) {
  const count = Math.max(chineseItems.length, englishItems.length);
  return `<ul class="bilingual-list">${Array.from({ length: count }, (_, index) => {
    const chinese = chineseItems[index] || "";
    const english = englishItems[index] || "";
    return `<li>${chinese ? `<strong lang="zh-Hant">${escapeHtml(chinese)}</strong>` : ""}${english ? `<small lang="en">${escapeHtml(english)}</small>` : ""}</li>`;
  }).join("")}</ul>`;
}

function relevantExampleHtml(value, explicitHighlight = "") {
  const full = String(value || "");
  const targets = (Array.isArray(explicitHighlight) ? explicitHighlight : [explicitHighlight])
    .map((target) => String(target || "").trim())
    .filter(Boolean);
  if (!targets.length) return escapeHtml(full);
  const folded = full.toLocaleLowerCase();
  const ranges = [];
  targets.forEach((target) => {
    const targetFolded = target.toLocaleLowerCase();
    let from = 0;
    while (from < full.length) {
      const index = folded.indexOf(targetFolded, from);
      if (index < 0) break;
      ranges.push({ start: index, end: index + target.length });
      from = index + target.length;
    }
  });
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);
  const accepted = [];
  ranges.forEach((range) => {
    if (!accepted.length || range.start >= accepted[accepted.length - 1].end) accepted.push(range);
  });
  if (!accepted.length) return escapeHtml(full);
  let cursor = 0;
  return `${accepted.map((range) => {
    const prefix = escapeHtml(full.slice(cursor, range.start));
    const highlighted = `<span class="target-highlight">${escapeHtml(full.slice(range.start, range.end))}</span>`;
    cursor = range.end;
    return `${prefix}${highlighted}`;
  }).join("")}${escapeHtml(full.slice(cursor))}`;
}

function exampleHighlights(item) {
  return item?.highlights || item?.highlight || "";
}

function bilingualLearningNoteHtml(chinese, english) {
  return `${chinese ? `<p class="chinese-primary" lang="zh-Hant">${escapeHtml(chinese)}</p>` : ""}${english ? `<p class="english-secondary" lang="en">${escapeHtml(english)}</p>` : ""}`;
}

function navHtml(page) {
  return `<div class="lesson-navigation">
    ${page > 1 ? `<button class="secondary-button" type="button" data-lesson-prev>← 上一頁</button>` : '<button class="secondary-button" type="button" data-back-to-dashboard>← 返回動詞片語選擇</button>'}
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
  const model = isPlainObject(lesson.modelExample) ? lesson.modelExample : {};
  const objective = isPlainObject(lesson.learningObjective) ? lesson.learningObjective : {};
  const preservedZh = Array.isArray(model.preservedZh) ? model.preservedZh : [];
  const preservedEn = Array.isArray(model.preservedEn) ? model.preservedEn : [];
  const hasModelBreakdown = Boolean(model.sourceZh || model.sourceEn || model.answerZh || model.answerEn);
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${lessonInfoPageHeader(lesson, 1)}
    ${objective.zh || objective.en ? `<section class="lesson-prose-grid learning-objective-grid"><article class="lesson-prose-card is-wide"><h3>學習目標 <small>Learning Objective</small></h3>${bilingualCopyHtml(objective.zh, objective.en)}</article></section>` : ""}
    <section class="formula-card">
      <span class="formula-label">動詞片語形式 · FORM</span>
      <div class="formula-display">${formulaRows.filter((row) => row?.formula || typeof row === "string").map((row) => {
        const formula = typeof row === "string" ? row : row.formula;
        const labelZh = typeof row === "string" ? "" : (row.labelZh || "");
        const labelEn = typeof row === "string" ? "" : (row.labelEn || "");
        const primaryLabel = labelZh || labelEn;
        const secondaryLabel = labelZh && labelEn ? labelEn : "";
        const highlights = typeof row === "string" ? "" : exampleHighlights(row);
        return `<p>${primaryLabel ? `<small>${escapeHtml(primaryLabel)}${secondaryLabel ? `<span lang="en">${escapeHtml(secondaryLabel)}</span>` : ""}</small>` : ""}${relevantExampleHtml(formula, highlights)}</p>`;
      }).join("")}</div>
      ${examples.filter((example) => example?.english || example?.en || example?.answer).map((example) => `
        <div class="example-block">
          <strong>${escapeHtml(example.labelZh || "例句")} · ${escapeHtml(example.labelEn || "EXAMPLE")}</strong>
          ${example.chinese || example.zh || example.answerZh ? `<p class="chinese-primary" lang="zh-Hant">${escapeHtml(example.chinese || example.zh || example.answerZh)}</p>` : ""}
          <p class="english-secondary" lang="en">${relevantExampleHtml(example.english || example.en || example.answer, exampleHighlights(example))}</p>
        </div>`).join("")}
      <aside class="meaning-block">
        <h3>核心意思<small>CORE MEANING</small></h3>
        ${bilingualCopyHtml(meaning.zh, meaning.en)}
        ${naturalMeanings.length ? `<ul class="meaning-list">${naturalMeanings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
        ${meaning.tendencyZh || meaning.tendencyEn ? `<div class="meaning-caveat">${bilingualCopyHtml(meaning.tendencyZh, meaning.tendencyEn)}</div>` : ""}
      </aside>
    </section>
    ${hasModelBreakdown ? `<section class="lesson-detail-section" aria-labelledby="model-example-heading">
      <header class="lesson-detail-heading">
        <p class="eyebrow">MODEL EXAMPLE</p>
        <h3 id="model-example-heading">完整示範<small lang="en">Model Example</small></h3>
      </header>
      <div class="lesson-prose-grid">
        <article class="lesson-prose-card">
          <h3>原句 <small>Source</small></h3>
          ${bilingualCopyHtml(model.sourceZh, model.sourceEn)}
        </article>
        <article class="lesson-prose-card">
          <h3>動詞片語版本 <small>Phrasal Verb Version</small></h3>
          ${model.answerZh ? `<p class="chinese-primary" lang="zh-Hant">${escapeHtml(model.answerZh)}</p>` : ""}
          ${model.answerEn ? `<p class="english-secondary" lang="en">${relevantExampleHtml(model.answerEn, model.highlight || "")}</p>` : ""}
        </article>
        ${preservedZh.length || preservedEn.length ? `<article class="lesson-prose-card is-wide">
          <h3>保留的資料 <small>What Was Preserved</small></h3>
          ${bilingualListHtml(preservedZh, preservedEn)}
        </article>` : ""}
        ${model.compressedZh || model.compressedEn ? `<article class="lesson-prose-card is-wide">
          <h3>被濃縮的意思 <small>What Was Compressed</small></h3>
          ${bilingualCopyHtml(model.compressedZh, model.compressedEn)}
        </article>` : ""}
      </div>
    </section>` : ""}
    ${navHtml(1)}
  </article>`;
}

function bilingualItem(item) {
  if (typeof item === "string") return { english: item, chinese: "", examples: [] };
  return {
    english: String(item?.english || item?.en || item?.descriptionEn || item?.meaningEn || ""),
    chinese: String(item?.chinese || item?.zh || item?.descriptionZh || item?.meaningZh || item?.text || ""),
    examples: Array.isArray(item?.examples) ? item.examples : []
  };
}

function sourceExamples(raw) {
  const examples = Array.isArray(raw?.examples) ? raw.examples.map((example) => {
    if (typeof example === "string") return { en: example, highlight: example };
    const en = String(example?.en || example?.english || "");
    const zh = String(example?.zh || example?.chinese || "");
    return {
      ...example,
      en,
      zh: zh && zh !== en ? zh : ""
    };
  }) : [];
  for (const value of Array.isArray(raw?.examplesEn) ? raw.examplesEn : []) {
    const en = String(value?.en || value?.english || value || "");
    if (en && !examples.some((example) => example.en === en)) examples.push({ en, zh: "", highlight: en });
  }
  return examples;
}

function hasDistinctBilingualHeading(raw, item) {
  const titleZh = String(raw?.titleZh || "").trim();
  const titleEn = String(raw?.titleEn || "").trim();
  if (!titleZh && !titleEn) return false;
  const chineseRepeats = !titleZh || String(item.chinese || "").trim().startsWith(titleZh);
  const englishRepeats = !titleEn || String(item.english || "").trim().startsWith(titleEn);
  return !(chineseRepeats && englishRepeats);
}

function teachingCardsHtml(items) {
  return items.map((raw, index) => {
    const item = bilingualItem(raw);
    const examples = Array.isArray(raw?.examples) ? raw.examples : item.examples;
    const formula = String(raw?.formula || raw?.form || raw?.phrasalVerb || raw?.term || "");
    return `<article class="lesson-prose-card${raw?.wide === false ? "" : " is-wide"}">
      <h3>${bilingualHeadingHtml(raw?.titleZh || raw?.labelZh || `重點 ${index + 1}`, raw?.titleEn || raw?.labelEn || "")}</h3>
      ${formula ? `<code class="teaching-example" lang="en">${relevantExampleHtml(formula, exampleHighlights(raw))}</code>` : ""}
      ${bilingualCopyHtml(item.chinese, item.english)}
      ${examples.length ? `<div class="examples">${examples.map((example) => `${example.zh || example.chinese ? `<span class="chinese-example" lang="zh-Hant">${escapeHtml(example.zh || example.chinese)}</span>` : ""}<code class="english-example" lang="en">${relevantExampleHtml(example.en || example.english || example, exampleHighlights(example))}</code>`).join("")}</div>` : ""}
    </article>`;
  }).join("");
}

function renderRegisterPage(lesson) {
  const register = lesson.register || {};
  const meaningGroups = [lesson.meaningGroups1, lesson.meaningGroups?.slice?.(0, 5), lesson.meaningGroupsI]
    .find((value) => Array.isArray(value) && value.length) || [];
  const contextsEn = Array.isArray(register.contextsEn) ? register.contextsEn : [];
  const contextsZh = Array.isArray(register.contextsZh) ? register.contextsZh : [];
  const tones = Array.isArray(register.tones) ? register.tones : [];
  const sensitiveContextsEn = Array.isArray(register.sensitiveContextsEn) ? register.sensitiveContextsEn : [];
  const sensitiveContextsZh = Array.isArray(register.sensitiveContextsZh) ? register.sensitiveContextsZh : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${lessonInfoPageHeader(lesson, 2)}
    <section class="lesson-prose-grid">
      ${meaningGroups.length ? teachingCardsHtml(meaningGroups) : ""}
      ${meaningGroups.length ? "" : `
      <article class="lesson-prose-card is-wide">
        <h3>${bilingualHeadingHtml(register.labelZh || "非正式至中性", register.labelEn || "Informal to Neutral")}</h3>
        ${bilingualCopyHtml(register.summaryZh, register.summaryEn)}
      </article>
      <article class="lesson-prose-card is-wide">
        <h3>常見自然場合 <small>Especially Natural In</small></h3>
        ${bilingualListHtml(contextsZh, contextsEn)}
      </article>
      ${tones.length ? `<article class="lesson-prose-card is-wide">
        <h3>語氣會隨語境改變 <small>Tone Depends on Context</small></h3>
        <div class="teaching-mini-grid">${tones.map((tone) => `<section>
          <h4>${bilingualHeadingHtml(tone.titleZh, tone.titleEn)}</h4>
          ${bilingualCopyHtml(tone.zh, tone.en)}
        </section>`).join("")}</div>
      </article>` : ""}
      ${register.sensitivityZh || register.sensitivityEn || sensitiveContextsZh.length || sensitiveContextsEn.length ? `<article class="lesson-prose-card is-wide sensitivity-card">
        <h3>使用時的敏感度 <small>Sensitivity Warning</small></h3>
        ${bilingualCopyHtml(register.sensitivityZh, register.sensitivityEn)}
        ${sensitiveContextsZh.length || sensitiveContextsEn.length ? bilingualListHtml(sensitiveContextsZh, sensitiveContextsEn) : ""}
      </article>` : ""}
      <article class="lesson-prose-card is-wide">
        <h3>正式寫作提示 <small>Formal Writing Note</small></h3>
        ${bilingualCopyHtml(register.formalZh, register.formalEn)}
      </article>
      `}
    </section>
    ${navHtml(2)}
  </article>`;
}

function renderFixedVariablePage(lesson) {
  const parts = lesson.fixedVariable || {};
  const meaningGroups = [lesson.meaningGroups2, lesson.meaningGroups?.slice?.(5), lesson.meaningGroupsII]
    .find((value) => Array.isArray(value) && value.length) || [];
  const forms = Array.isArray(parts.forms) ? parts.forms : [];
  const incorrectForms = Array.isArray(parts.incorrectForms) ? parts.incorrectForms : [];
  const capitalisation = Array.isArray(parts.capitalisation) ? parts.capitalisation : [];
  const variableItemsZh = Array.isArray(parts.variableItemsZh) ? parts.variableItemsZh : [];
  const variableItemsEn = Array.isArray(parts.variableItemsEn) ? parts.variableItemsEn : [];
  const beForms = Array.isArray(parts.beForms) ? parts.beForms : [];
  const hasPlacementDetails = Boolean(
    parts.fixed || parts.fixedZh || parts.fixedEn || parts.variableZh || parts.variableEn
    || parts.correct || incorrectForms.length || variableItemsZh.length || variableItemsEn.length || beForms.length
  );
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${lessonInfoPageHeader(lesson, 3)}
    <section class="lesson-prose-grid">
      ${meaningGroups.length ? teachingCardsHtml(meaningGroups) : ""}
      ${hasPlacementDetails ? `
      <article class="lesson-prose-card">
        <h3>固定部分 <small>Fixed Part</small></h3>
        ${parts.fixed ? `<div class="formula-display"><p>${relevantExampleHtml(parts.fixed, parts.fixedHighlights || parts.fixedHighlight || "")}</p></div>` : ""}
        ${bilingualCopyHtml(parts.fixedZh, parts.fixedEn)}
        ${parts.correct || incorrectForms.length ? `<div class="form-status-list">
          ${parts.correct ? `<p><strong aria-hidden="true">✓</strong><span>${relevantExampleHtml(parts.correct, parts.fixedHighlight || "")}</span></p>` : ""}
          ${incorrectForms.map((form) => `<p><strong aria-hidden="true">×</strong><span>${escapeHtml(form)}</span></p>`).join("")}
        </div>` : ""}
      </article>
      <article class="lesson-prose-card">
        <h3>可變部分 <small>Variable Part</small></h3>
        ${bilingualCopyHtml(parts.variableZh, parts.variableEn)}
        ${variableItemsZh.length || variableItemsEn.length ? bilingualListHtml(variableItemsZh, variableItemsEn) : ""}
        ${beForms.length ? `<div class="grammar-token-list" aria-label="可用的 be 動詞形式">${beForms.map((form) => `<code>${escapeHtml(form)}</code>`).join("")}</div>` : ""}
      </article>
      ${capitalisation.length ? `<article class="lesson-prose-card is-wide">
        <h3>大小寫 <small>Capitalisation</small></h3>
        <div class="teaching-mini-grid">${capitalisation.map((item) => `<section>
          <h4>${bilingualHeadingHtml(item.labelZh, item.labelEn)}</h4>
          ${bilingualCopyHtml(item.zh, item.en)}
          ${item.example ? `<code class="teaching-example" lang="en">${relevantExampleHtml(item.example, exampleHighlights(item))}</code>` : ""}
        </section>`).join("")}</div>
      </article>` : ""}
      ` : ""}
    </section>
    ${forms.length ? `<table class="form-table">
      <thead><tr><th>形式<small>Form</small></th><th>例句<small>Example</small></th></tr></thead>
      <tbody>${forms.map((row) => `<tr>
        <td>${row.formZh ? `<span class="chinese-primary" lang="zh-Hant">${escapeHtml(row.formZh)}</span>` : ""}${row.form || row.formEn ? `<span class="english-secondary" lang="en">${escapeHtml(row.formEn || row.form)}</span>` : ""}</td>
        <td>${row.exampleZh ? `<span class="chinese-primary" lang="zh-Hant">${escapeHtml(row.exampleZh)}</span>` : ""}${row.example || row.exampleEn ? `<span class="english-secondary" lang="en">${relevantExampleHtml(row.exampleEn || row.example, exampleHighlights(row))}</span>` : ""}</td>
      </tr>`).join("")}</tbody>
    </table>` : ""}
    ${navHtml(3)}
  </article>`;
}

function renderSpecificFormsPage(lesson) {
  const forms = Array.isArray(lesson.specificForms) ? lesson.specificForms : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${lessonInfoPageHeader(lesson, 4)}
    <div class="specific-form-list">${forms.map((form, index) => `
      <article class="specific-form-card">
        <header>
          <span>${escapeHtml(form.number || index + 1)}</span>
          <h3>${bilingualHeadingHtml(form.titleZh, form.titleEn)}</h3>
        </header>
        <code>${relevantExampleHtml(form.formula || "", exampleHighlights(form))}</code>
        ${bilingualCopyHtml(form.descriptionZh, form.descriptionEn)}
        ${(form.examples || []).map((example) => `<div class="example-block"><strong>例句 · EXAMPLE</strong>${example.zh ? `<p class="chinese-primary" lang="zh-Hant">${escapeHtml(example.zh)}</p>` : ""}<p class="english-secondary" lang="en">${relevantExampleHtml(example.en || "", exampleHighlights(example))}</p></div>`).join("")}
        ${(form.notes || []).map((note) => `<div class="origin-memory">${bilingualLearningNoteHtml(note.zh, note.en)}</div>`).join("")}
      </article>`).join("")}</div>
    ${navHtml(4)}
  </article>`;
}

function renderBenefitsPage(lesson) {
  const benefits = Array.isArray(lesson.benefits) ? lesson.benefits : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${lessonInfoPageHeader(lesson, 5)}
    <ol class="benefit-list">
      ${benefits.map((raw, index) => {
        const item = bilingualItem(raw);
        return `<li class="benefit-card"><span>${index + 1}</span><div>
          ${(raw?.titleEn || raw?.titleZh) ? `<h3>${bilingualHeadingHtml(raw.titleZh, raw.titleEn)}</h3>` : ""}
          ${item.chinese ? `<p class="chinese" lang="zh-Hant">${escapeHtml(item.chinese)}</p>` : ""}
          ${item.english ? `<p class="english" lang="en">${escapeHtml(item.english)}</p>` : ""}
          ${(raw?.examples || []).map((example) => `<div class="examples">${example.zh ? `<span class="chinese-example" lang="zh-Hant">${escapeHtml(example.zh)}</span>` : ""}<code class="english-example" lang="en">${relevantExampleHtml(example.en || example, exampleHighlights(example))}</code></div>`).join("")}
        </div></li>`;
      }).join("")}
    </ol>
    ${navHtml(5)}
  </article>`;
}

function renderOriginPage(lesson) {
  const guide = isPlainObject(lesson.usageGuide) ? lesson.usageGuide : {};
  const contextsZh = Array.isArray(guide.contextsZh) ? guide.contextsZh : [];
  const contextsEn = Array.isArray(guide.contextsEn) ? guide.contextsEn : [];
  const uses = [lesson.realLifeUses, lesson.uses, lesson.realLife, lesson.realLifeContexts]
    .find((value) => Array.isArray(value) && value.length) || [];
  const comparisons = [lesson.meaningComparison, lesson.meaningComparisons, lesson.comparisons, guide.comparisons]
    .find((value) => Array.isArray(value) && value.length) || [];
  const intro = lesson.page6Intro || lesson.usageOverview || {};
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${lessonInfoPageHeader(lesson, 6)}
    <section class="lesson-prose-grid">
      ${intro.zh || intro.chinese || intro.en || intro.english ? `<article class="lesson-prose-card is-wide"><h3>使用總覽 <small>Usage Overview</small></h3>${bilingualCopyHtml(intro.zh || intro.chinese, intro.en || intro.english)}</article>` : ""}
      ${contextsZh.length || contextsEn.length ? `<article class="lesson-prose-card is-wide"><h3>${bilingualHeadingHtml(guide.titleZh || "真實生活中的用途", guide.titleEn || "Real-life Uses")}</h3>${bilingualListHtml(contextsZh, contextsEn)}</article>` : ""}
      ${uses.length ? `<article class="lesson-detail-heading is-wide"><p class="eyebrow">REAL-LIFE USES</p><h3>實際用途<small lang="en">Real-life Uses</small></h3></article>${teachingCardsHtml(uses)}` : ""}
      ${comparisons.length ? `<article class="lesson-detail-heading is-wide"><p class="eyebrow">MEANING COMPARISON</p><h3>意思比較<small lang="en">Meaning Comparison</small></h3></article>${teachingCardsHtml(comparisons)}` : ""}
      ${!uses.length && !comparisons.length && !contextsZh.length && !contextsEn.length ? '<p class="empty-state">本頁內容正在整理。</p>' : ""}
    </section>
    ${navHtml(6)}
  </article>`;
}

function renderRulesPage(lesson) {
  const rules = Array.isArray(lesson.rules) ? lesson.rules : [];
  elements.lessonContent.innerHTML = `<article class="info-page">
    ${lessonInfoPageHeader(lesson, 7)}
    <ol class="rule-list">
      ${rules.map((raw, index) => {
        const item = bilingualItem(raw);
        const examples = sourceExamples(raw);
        return `<li class="rule-card"><span>${index + 1}</span><div>
          ${hasDistinctBilingualHeading(raw, item) ? `<h3>${bilingualHeadingHtml(raw.titleZh, raw.titleEn)}</h3>` : ""}
          ${item.chinese ? `<p class="chinese" lang="zh-Hant">${escapeHtml(item.chinese)}</p>` : ""}
          ${item.english ? `<p class="english" lang="en">${escapeHtml(item.english)}</p>` : ""}
          ${examples.length ? `<div class="examples">${examples.map((example) => `${example.zh ? `<span class="chinese-example" lang="zh-Hant">${escapeHtml(example.zh)}</span>` : ""}<code class="english-example" lang="en">${relevantExampleHtml(example.en || example, exampleHighlights(example))}</code>`).join("")}</div>` : ""}
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
    controlRevision: 0,
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
    controlRevision: normalizeAttemptControlRevision(result.controlRevision),
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
    return `${question.answerZh ? `<p class="chinese-answer" lang="zh-Hant">${escapeHtml(question.answerZh)}</p>` : ""}<p class="english-answer" lang="en">${answerHtml}</p>`;
  }
  const studentParts = studentAnswer === null ? [] : storedAnswerPartValues(question, studentAnswer);
  return `<div class="multi-answer-reveal">${parts.map((part, index) => `
    <div>
      <strong>${escapeHtml(part.label)}</strong>
      ${part.answerZh ? `<p class="chinese-answer" lang="zh-Hant">${escapeHtml(part.answerZh)}</p>` : ""}
      <p class="english-answer" lang="en">${studentAnswer === null ? highlightedAnswerHtml(part.answer, part.highlight || part.answer) : comparedAnswerHtml(part.answer, studentParts[index] || "", part.highlight || part.answer)}</p>
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
        <p class="english" lang="en">${escapeHtml(question.prompt || question.english || "")}</p>
        <p class="chinese" lang="zh-Hant">${escapeHtml(question.promptZh || question.chinese || question.zh || "")}</p>
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
      <p class="question-feedback" aria-live="polite">${correct ? answerComparison(value, question).typoCount === 1 ? "✓ 答案正確；黃色標示一個可留意的拼寫。" : "✓ 答案正確，這題已完成。" : wrong ? unresolvedCorrection ? "答案未完全符合目標動詞片語；請再次修改後提交。" : "答案未完全符合目標動詞片語；請參考答案並修改。" : ""}</p>
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
  const illustration = lessonIllustration(lesson);
  const exerciseMeta = isPlainObject(lesson.exercise) ? lesson.exercise : {};
  const instructions = isPlainObject(lesson.instructions) ? lesson.instructions : {};
  const exerciseKicker = String(exerciseMeta.kicker || "PAGE 8 · TYPE THE WHOLE SENTENCE");
  const exerciseTitleZh = String(exerciseMeta.titleZh || "動詞片語句子改寫練習");
  const exerciseTitleEn = String(exerciseMeta.titleEn || "Phrasal Verb Sentence Practice");
  const instructionsZh = String(exerciseMeta.instructionsZh || exerciseMeta.descriptionZh || instructions.zh || "");
  const instructionsEn = String(exerciseMeta.instructionsEn || exerciseMeta.descriptionEn || instructions.en || "");
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

  elements.lessonContent.innerHTML = `<section class="exercise-page">
    <header class="exercise-header">
      <div class="exercise-header-top">
        <div>
          <p class="eyebrow">${escapeHtml(exerciseKicker)}</p>
          <h2>${escapeHtml(exerciseTitleZh)}<small lang="en">${escapeHtml(exerciseTitleEn)}</small></h2>
          ${instructionsZh ? `<p class="exercise-instruction-primary" lang="zh-Hant">${escapeHtml(instructionsZh)}</p>` : ""}
          ${instructionsEn ? `<p class="exercise-instruction-secondary" lang="en">${escapeHtml(instructionsEn)}</p>` : ""}
          <p class="exercise-mechanics">部分提交只會檢查已輸入的題目；答對的題目不會重複出現。</p>
        </div>
      </div>
      <div class="exercise-progress" style="--progress:${percentage}%"><span></span></div>
      <div class="exercise-progress-label"><span>已完成 ${escapeHtml(correct)} / ${escapeHtml(total)} 題</span><span>尚餘 ${escapeHtml(remaining)} 題</span></div>
    </header>

    ${illustration.src ? `<figure class="exercise-phrasal-verb-illustration">
      <img src="${escapeHtml(illustration.src)}" alt="${escapeHtml(illustration.alt || `${lessonEnglishTitle(lesson)} literal illustration`)}" width="${escapeHtml(illustration.width)}" height="${escapeHtml(illustration.height)}" loading="lazy" decoding="async">
      ${illustration.captionZh || illustration.captionEn ? `<figcaption>${illustration.captionZh ? `<span lang="zh-Hant">${escapeHtml(illustration.captionZh)}</span>` : ""}${illustration.captionEn ? `<small lang="en">${escapeHtml(illustration.captionEn)}</small>` : ""}</figcaption>` : ""}
    </figure>` : ""}

    ${completed ? `<section class="round-summary completion-card">
      <div class="completion-mark" aria-hidden="true">✓</div>
      <h3>恭喜，全部題目已完成！</h3>
      <p>你已完成這組 <strong>${escapeHtml(total)}</strong> 題英文動詞片語練習。</p>
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
      <button class="bulk-visibility-button" type="button" data-toggle-all-correct-cards aria-pressed="${allVisibleCorrectCollapsed}" aria-controls="phrasal-verb-system-question-list" aria-label="${bulkVisibilityLabel}（${escapeHtml(visibleCorrectIds.length)} 題）">${bulkVisibilityLabel}</button>
    </div>` : ""}

    <div class="question-list" id="phrasal-verb-system-question-list" data-question-list>
      ${displayQuestions.map(questionHtml).join("")}
    </div>

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
    controlRevision: normalizeAttemptControlRevision(exercise.controlRevision),
    contentVersion: String(CONTENT.version || "1")
  };
}

async function persistExercise({ keepalive = false } = {}) {
  if (!state.exercise || state.user?.role !== "student") return;
  const operationExercise = state.exercise;
  const operationUserId = String(state.user.id || "");
  const operationAuthToken = String(state.authToken || "");
  if (!state.attemptSyncEpoch) state.attemptSyncEpoch = newAttemptSyncEpoch();
  const operationSyncEpoch = String(state.attemptSyncEpoch);
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
    let context = captureAttemptSyncContext();
    if (!context) {
      const activated = await activateAttemptSyncContext();
      context = activated ? captureAttemptSyncContext() : null;
    }
    if (
      !context
      || context.studentId !== operationUserId
      || context.authToken !== operationAuthToken
      || context.syncEpoch !== operationSyncEpoch
    ) throw new Error("登入帳戶已變更，這次練習記錄沒有被放入另一個帳戶的同步佇列。");
    const canonical = attemptCanonicalPayloads.get(attemptId);
    const safePayload = canonical ? mergeAttemptPayloadLosslessly(canonical, payload) : payload;
    const record = createAttemptOutboxRecord(attemptId, safePayload, context, keepalive ? "page-lifecycle" : "exercise");
    const durableRecord = await trackAttemptOutboxPersistence(enqueueAttemptOutboxRecord(record));
    if (
      String(state.user?.id || "") !== operationUserId
      || String(state.authToken || "") !== operationAuthToken
      || String(state.attemptSyncEpoch || "") !== operationSyncEpoch
    ) return { durable: true, pending: true };
    applyAttemptPayloadLocally(attemptId, durableRecord.payload);
    const pending = await refreshAttemptOutboxStatus(context);
    scheduleAttemptOutboxDrain("exercise-save", 0);
    return { durable: true, pending: pending > 0 };
  } finally {
    if (
      String(state.user?.id || "") === operationUserId
      && String(state.authToken || "") === operationAuthToken
      && state.exercise?.id === attemptId
      && !state.exercise.completedAt
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
      console.warn("Phrasal Verb System preference save failed", error);
    });
  }, 450);
}

async function submitExercise(kind) {
  if (state.saveInFlight || !state.exercise || state.exercise.awaitingNextRound) return;
  const controlsBefore = attemptControlState(state.exercise);
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
    else {
      state.exercise.correctionMode = false;
      state.exercise.correctionIds = [];
    }
  }
  bumpAttemptControlRevisionIfChanged(state.exercise, controlsBefore);

  state.saveInFlight = true;
  renderExercisePage(lesson, { preserveScroll: true });
  try {
    const attemptSave = await persistExercise();
    if (bookmarkChanged) {
      saveBookmarks().catch((error) => console.warn("Phrasal Verb bookmark answer upgrade failed", error));
    }
    const pendingCopy = attemptSave?.pending
      ? "已安全儲存在此裝置，正在同步。"
      : "記錄已安全同步。";
    showToast(remaining
      ? `已檢查 ${targets.length} 題；${pendingCopy}`
      : `全部題目完成；${pendingCopy}`);
  } catch (error) {
    console.warn("Phrasal Verb System attempt save failed", error);
    showToast("答案已檢查，但此裝置未能建立安全待同步記錄；請保持頁面開啟並稍後再試。", "error");
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
  const controlsBefore = attemptControlState(state.exercise);
  state.exercise.round += 1;
  state.exercise.awaitingNextRound = false;
  state.exercise.correctionMode = true;
  state.exercise.correctionIds = ids;
  ids.forEach((id) => {
    if (state.exercise.questionState[id]) state.exercise.questionState[id].reveal = false;
  });
  state.exercise.collapsedCorrectIds = state.exercise.collapsedCorrectIds.filter((id) => !ids.includes(id));
  bumpAttemptControlRevisionIfChanged(state.exercise, controlsBefore);
  renderExercisePage(lesson);
  try {
    await persistExercise();
  } catch (error) {
    console.warn("Correction round save failed", error);
    showToast("已進入錯題改正，但此裝置未能建立安全待同步記錄；請保持頁面開啟並稍後再試。", "error");
  }
  document.querySelector(".exercise-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function exitCorrectionRound() {
  if (!state.exercise?.correctionMode) return;
  const controlsBefore = attemptControlState(state.exercise);
  readExerciseDrafts();
  state.exercise.correctionMode = false;
  state.exercise.correctionIds = [];
  bumpAttemptControlRevisionIfChanged(state.exercise, controlsBefore);
  renderExercisePage(getLesson(), { preserveScroll: true });
  try {
    await persistExercise();
  } catch (error) {
    console.warn("Correction round exit save failed", error);
    showToast("已返回其餘題目，但此裝置未能建立安全待同步記錄；請保持頁面開啟並稍後再試。", "error");
  }
}

async function toggleCorrectCard(questionId) {
  if (!state.exercise?.correctIds.includes(questionId)) return;
  const controlsBefore = attemptControlState(state.exercise);
  readExerciseDrafts();
  const hidden = state.exercise.collapsedCorrectIds;
  const index = hidden.indexOf(questionId);
  if (index >= 0) hidden.splice(index, 1);
  else hidden.push(questionId);
  bumpAttemptControlRevisionIfChanged(state.exercise, controlsBefore);
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

  const controlsBefore = attemptControlState(state.exercise);
  const hidden = new Set(state.exercise.collapsedCorrectIds);
  const expandAll = visibleCorrectIds.every((id) => hidden.has(id));
  visibleCorrectIds.forEach((id) => expandAll ? hidden.delete(id) : hidden.add(id));
  state.exercise.collapsedCorrectIds = [...hidden]
    .filter((id) => state.exercise.correctIds.includes(id));
  bumpAttemptControlRevisionIfChanged(state.exercise, controlsBefore);
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
  const controlsBefore = attemptControlState(state.exercise);
  const lesson = getLesson();
  state.exercise.round += 1;
  state.exercise.awaitingNextRound = false;
  state.exercise.correctionMode = false;
  state.exercise.correctionIds = [];
  for (const question of activeQuestions(lesson)) {
    state.exercise.questionState[question.id] = { status: "pending", lastAnswer: "", reveal: false };
    state.exercise.drafts[question.id] = "";
  }
  bumpAttemptControlRevisionIfChanged(state.exercise, controlsBefore);
  renderExercisePage(lesson);
  try {
    await persistExercise();
  } catch (error) {
    console.warn("Next round save failed", error);
    showToast("已開始下一組題目，但此裝置未能建立安全待同步記錄；請保持頁面開啟並稍後再試。", "error");
  }
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
        ? (sectionBookmark ? "已移除動詞片語書簽。" : "已移除題目書簽。")
        : (sectionBookmark ? "已收藏整組動詞片語。" : "已加入題目書簽。"));
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
    console.warn("Phrasal Verb System bookmark sync failed", error);
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
        <p class="bookmark-prompt" lang="en">${escapeHtml(question.prompt || question.english || "")}</p>
        <p class="bookmark-zh" lang="zh-Hant">${escapeHtml(question.promptZh || question.chinese || question.zh || "")}</p>
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
        <div><h2 id="section-bookmark-heading">收藏動詞片語</h2><p>整組英文動詞片語課題</p></div>
      </header>
      <div class="bookmark-column-list">${sectionRows || '<p class="empty-state">暫時未收藏動詞片語。可在學習首頁的課題卡右上角按 ☆。</p>'}</div>
    </section>
    <section class="bookmark-column" aria-labelledby="question-bookmark-heading">
      <header class="bookmark-column-heading">
        <span>02</span>
        <div><h2 id="question-bookmark-heading">收藏題目</h2><p>各組動詞片語內的個別練習題</p></div>
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
    console.warn("Phrasal Verb System admin students failed", error);
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
    console.warn("Phrasal Verb System admin student detail failed", error);
    elements.adminDetail.innerHTML = '<p class="empty-state">未能載入這位學生的記錄。</p>';
  }
}

function handleClick(event) {
  const searchResult = event.target.closest("[data-lesson-search-result]");
  if (searchResult) return openLesson(searchResult.dataset.searchLesson, { page: Number(searchResult.dataset.searchPage || 1), questionId: searchResult.dataset.searchQuestion || "" });
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
    elements.lessonSearchResults?.querySelector("[data-lesson-search-result]")?.click();
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
    if (state.user?.role === "student" && state.attemptOutboxPending) renderAttemptOutboxStatus();
    else setConnection("已連線", "online");
  } catch {
    if (state.user?.role === "student" && state.attemptOutboxPending) renderAttemptOutboxStatus();
    else setConnection("服務連接中", "checking");
  }
}

async function initialise() {
  bindEvents();
  renderLessonChoices();
  if (!lessonList().length) {
    setConnection("教材未載入", "error");
    setStatus(elements.loginStatus, "英文動詞片語教材暫時未能載入，請重新整理頁面。", "error");
    elements.loginButton.disabled = true;
    return;
  }
  checkHealth();
  const restored = await validateRestoredSession();
  if (!restored) {
    showView("login");
    return;
  }
  if (state.user.role === "student") {
    try {
      if (!(await activateAttemptSyncContext())) throw new Error("安全待同步記錄未能啟用。");
    } catch (error) {
      console.warn("Phrasal Verb durable attempt protection failed", error);
      window.EdmundSystemNav?.forgetStudentSession();
      clearSession();
      setConnection("安全儲存未能啟用", "error");
      setStatus(elements.loginStatus, "此瀏覽器未能啟用安全待同步記錄；為保護進度，請勿使用私密瀏覽，並重新整理後再登入。", "error");
      showView("login");
      return;
    }
  }
  setConnection("已安全連接", "online");
  if (state.user.role === "student") renderAttemptOutboxStatus();
  if (state.user.role === "admin") await openAdminDashboard();
  else {
    await openDashboard();
    openRequestedHomeworkLesson();
  }
}

initialise().catch((error) => {
  console.error("Phrasal Verb System initialisation failed", error);
  clearSession();
  setConnection("服務暫時離線", "error");
  setStatus(elements.loginStatus, "系統未能完成載入，請重新整理頁面。", "error");
  showView("login");
});
