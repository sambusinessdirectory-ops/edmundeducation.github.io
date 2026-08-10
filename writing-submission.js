import {
  completedWritingSegments,
  completedWritingSegmentsAffectedByEdit,
  completedWritingSegmentsOverlappingRange,
  countEnglishWords,
  formatSubmissionDate,
  grammarOccurrenceIdentity,
  insertedRange,
  isLiveCompletedWritingSegment,
  newlyCompletedWritingSegments
} from "./writing-submission-core.js?v=20260803-grammar-history1";
import {
  classifyRemoteGrammarFailure,
  hasWritingGrammarIssuesForSentence,
  isBlockedInverseWritingGrammarIssue,
  mergeWritingGrammarIssues,
  normalizeWritingAiResponse,
  REMOTE_GRAMMAR_FAILURE_KINDS,
  REMOTE_GRAMMAR_REQUEST_TIMEOUT_MS,
  rebaseWritingGrammarIssuesAfterAppliedCorrection,
  remoteGrammarRetryDelayMs,
  writingGrammarReviewNotice
} from "./writing-submission-ai.js?v=20260803-grammar-progress1";
import {
  emptyWritingTimer,
  expireWritingTimer,
  formatWritingTimer,
  normalizeWritingTimer,
  pauseWritingTimer,
  resumeWritingTimer,
  startWritingTimer,
  timerInputSeconds,
  writingTimerRemaining
} from "./writing-submission-timer.js?v=20260810-timer-export1";

const CONFIG = window.EDMUND_WRITING_SUBMISSION_CONFIG || {};
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const SESSION_KEY = "edmund-writing-submission-session-v1";
const DRAFT_KEY_PREFIX = "edmund-writing-submission-draft-v1";
const ISSUE_QUEUE_KEY_PREFIX = "edmund-writing-submission-issue-queue-v1";
const TOPIC_CATALOG_VERSION = "20260807-phrasal1";
const WRITING_IDLE_LIMIT_MS = 3 * 60 * 1000;
const HARPER_VERSION = "2.7.0";
const ESL_RULESET_VERSION = "2.0.0";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  connection: document.querySelector("[data-connection-status]"),
  userPill: document.querySelector("[data-user-pill]"),
  workspaceButton: document.querySelector("[data-workspace-button]"),
  submissionsButton: document.querySelector("[data-submissions-button]"),
  grammarLogButton: document.querySelector("[data-grammar-log-button]"),
  adminButton: document.querySelector("[data-admin-button]"),
  adminReviewButton: document.querySelector("[data-admin-review-button]"),
  logout: document.querySelector("[data-logout]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginButton: document.querySelector("[data-login-button]"),
  loginStatus: document.querySelector("[data-login-status]"),
  username: document.querySelector("#writing-submission-username"),
  password: document.querySelector("#writing-submission-password"),
  passwordToggle: document.querySelector("[data-password-toggle]"),
  workspaceWelcome: document.querySelector("[data-workspace-welcome]"),
  harperStatus: document.querySelector("[data-harper-status]"),
  writingForm: document.querySelector("[data-writing-form]"),
  topicInput: document.querySelector("[data-topic-input]"),
  topicPickerOpen: document.querySelector("[data-topic-picker-open]"),
  topicPicker: document.querySelector("[data-topic-picker]"),
  topicPickerClose: document.querySelector("[data-topic-picker-close]"),
  topicPickerSearch: document.querySelector("[data-topic-picker-search]"),
  topicPickerResults: document.querySelector("[data-topic-picker-results]"),
  selectedTopicPreview: document.querySelector("[data-selected-topic-preview]"),
  writingInput: document.querySelector("[data-writing-input]"),
  wordCount: document.querySelector("[data-word-count]"),
  writingTimerToggle: document.querySelector("[data-writing-timer-toggle]"),
  writingTimerToggleDisplay: document.querySelector("[data-writing-timer-toggle-display]"),
  writingTimerPanel: document.querySelector("[data-writing-timer-panel]"),
  writingTimerDisplay: document.querySelector("[data-writing-timer-display]"),
  writingTimerHours: document.querySelector("[data-writing-timer-hours]"),
  writingTimerMinutes: document.querySelector("[data-writing-timer-minutes]"),
  writingTimerSeconds: document.querySelector("[data-writing-timer-seconds]"),
  writingTimerForce: document.querySelector("[data-writing-timer-force]"),
  writingTimerStart: document.querySelector("[data-writing-timer-start]"),
  writingTimerPause: document.querySelector("[data-writing-timer-pause]"),
  writingTimerReset: document.querySelector("[data-writing-timer-reset]"),
  writingTimerRetry: document.querySelector("[data-writing-timer-retry]"),
  writingTimerStatus: document.querySelector("[data-writing-timer-status]"),
  draftState: document.querySelector("[data-draft-state]"),
  submissionStatus: document.querySelector("[data-submission-status]"),
  submitWriting: document.querySelector("[data-submit-writing]"),
  grammarList: document.querySelector("[data-grammar-list]"),
  issueCount: document.querySelector("[data-issue-count]"),
  grammarPanel: document.querySelector(".grammar-panel"),
  grammarToggle: document.querySelector("[data-grammar-toggle]"),
  grammarToggleLabel: document.querySelector("[data-grammar-toggle-label]"),
  newWriting: document.querySelector("[data-new-writing]"),
  refreshSubmissions: document.querySelector("[data-refresh-submissions]"),
  refreshWritingProgress: document.querySelector("[data-refresh-writing-progress]"),
  writingArticleTotal: document.querySelector("[data-writing-article-total]"),
  writingTimeTotal: document.querySelector("[data-writing-time-total]"),
  writingAverageTime: document.querySelector("[data-writing-average-time]"),
  writingArticlesChart: document.querySelector("[data-writing-articles-chart]"),
  writingTimeChart: document.querySelector("[data-writing-time-chart]"),
  writingAverageChart: document.querySelector("[data-writing-average-chart]"),
  submissionList: document.querySelector("[data-submission-list]"),
  submissionDetail: document.querySelector("[data-submission-detail]"),
  exportSelectAll: document.querySelector("[data-export-select-all]"),
  exportSelectedCount: document.querySelector("[data-export-selected-count]"),
  exportSelectedSubmissions: document.querySelector("[data-export-selected-submissions]"),
  exportAllSubmissions: document.querySelector("[data-export-all-submissions]"),
  refreshGrammarLog: document.querySelector("[data-refresh-grammar-log]"),
  uniqueRuleCount: document.querySelector("[data-unique-rule-count]"),
  totalIssueCount: document.querySelector("[data-total-issue-count]"),
  grammarSummaryList: document.querySelector("[data-grammar-summary-list]"),
  adminSearch: document.querySelector("[data-admin-search]"),
  adminCount: document.querySelector("[data-admin-count]"),
  adminList: document.querySelector("[data-admin-list]"),
  adminDetail: document.querySelector("[data-admin-detail]"),
  refreshAdminReview: document.querySelector("[data-refresh-admin-review]"),
  adminReviewCount: document.querySelector("[data-admin-review-count]"),
  adminReviewList: document.querySelector("[data-admin-review-list]"),
  adminReviewMore: document.querySelector("[data-admin-review-more]"),
  toast: document.querySelector("[data-toast]")
};

const state = {
  supabase: null,
  user: null,
  authToken: "",
  studentAccess: {},
  currentView: "login",
  grammarDetectionEnabled: true,
  preferenceSavePromise: null,
  checker: null,
  checkerState: "idle",
  checkerPromise: null,
  checkQueue: Promise.resolve(),
  pendingChecks: 0,
  checkGeneration: 0,
  segmentChecks: new Map(),
  latestSegmentRecords: new Map(),
  nextSegmentRevision: 0,
  remoteGrammarQueue: [],
  remoteGrammarInFlight: 0,
  remoteGrammarControllers: new Set(),
  remoteGrammarPromises: new Set(),
  remoteGrammarBackoffUntil: 0,
  remoteGrammarBackoffFailure: null,
  remoteGrammarWarnings: new Map(),
  activeIssues: [],
  appliedCorrections: [],
  dismissedIssueIds: new Set(),
  documentId: "",
  previousWriting: "",
  pendingOccurrences: new Map(),
  reportedFingerprints: new Set(),
  occurrenceFlushTimer: null,
  occurrenceFlushPromise: null,
  draftSaveTimer: null,
  draftDurationSeconds: 0,
  submissionDurationSeconds: null,
  writingClockLastAt: 0,
  lastWritingActivityAt: 0,
  writingClockTimer: null,
  selectedTopicResource: null,
  writingTimer: emptyWritingTimer(),
  writingTimerPanelOpen: false,
  writingTimerClock: null,
  timerAutoSubmitLock: false,
  submissionPromise: null,
  topicCatalog: [],
  topicCatalogPromise: null,
  manualRecheckTimer: null,
  toastTimer: null,
  submissions: [],
  selectedExportSubmissionIds: new Set(),
  exportInFlight: false,
  writingProgress: [],
  selectedSubmissionId: "",
  grammarProblems: [],
  adminSubmissions: [],
  selectedAdminSubmissionId: "",
  adminExplanationReviews: [],
  adminExplanationReviewPage: 0,
  adminExplanationReviewHasMore: false
};

function createElement(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== "") node.textContent = String(text);
  return node;
}

function loadingState(label = "正在載入…") {
  const wrapper = createElement("div", "loading-state");
  wrapper.append(createElement("span", "loading-spinner"), createElement("p", "", label));
  return wrapper;
}

function emptyState(label) {
  return createElement("p", "empty-state", label);
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
  state.toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 3400);
}

function writingClockEligible(now = Date.now()) {
  return Boolean(
    state.user?.role === "student"
    && state.currentView === "workspace"
    && document.visibilityState !== "hidden"
    && state.documentId
    && now - state.lastWritingActivityAt <= WRITING_IDLE_LIMIT_MS
  );
}

function accrueWritingTime(now = Date.now()) {
  if (!state.writingClockLastAt) {
    state.writingClockLastAt = now;
    return;
  }
  const elapsedMs = Math.max(0, Math.min(15000, now - state.writingClockLastAt));
  if (writingClockEligible(now)) state.draftDurationSeconds += elapsedMs / 1000;
  state.writingClockLastAt = now;
}

function markWritingActivity() {
  const now = Date.now();
  accrueWritingTime(now);
  state.lastWritingActivityAt = now;
  state.writingClockLastAt = now;
}

function startWritingClock() {
  if (state.writingClockTimer) return;
  state.writingClockLastAt = Date.now();
  state.writingClockTimer = window.setInterval(() => {
    accrueWritingTime();
    if (state.currentView === "workspace") persistDraft();
  }, 5000);
}

function formatCompactDuration(secondsValue) {
  const seconds = Math.max(0, Number(secondsValue || 0));
  if (seconds < 60) return `${Math.round(seconds)} 秒`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes < 10 ? minutes.toFixed(1) : Math.round(minutes)} 分鐘`;
  const hours = minutes / 60;
  return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)} 小時`;
}

function showView(name) {
  accrueWritingTime();
  state.currentView = name;
  state.writingClockLastAt = Date.now();
  if (name === "workspace" && state.user?.role === "student") markWritingActivity();
  for (const view of elements.views) view.hidden = view.dataset.view !== name;
  const loggedIn = Boolean(state.user && state.authToken);
  const admin = state.user?.role === "admin";
  elements.userPill.hidden = !loggedIn;
  elements.logout.hidden = !loggedIn;
  elements.workspaceButton.hidden = !loggedIn || admin || name === "workspace";
  elements.submissionsButton.hidden = !loggedIn || admin || name === "submissions";
  elements.grammarLogButton.hidden = !loggedIn || admin || name === "grammar-log";
  elements.adminButton.hidden = !loggedIn || !admin || name === "admin";
  elements.adminReviewButton.hidden = !loggedIn || !admin || name === "admin-review";
  if (loggedIn) {
    elements.userPill.textContent = admin
      ? `${state.user.name} · 管理員`
      : state.user.name;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function workerBaseUrl() {
  const value = String(CONFIG.workerBaseUrl || "").trim().replace(/\/+$/u, "");
  if (!value.startsWith("https://")) throw new Error("交文服務尚未完成設定。");
  return value;
}

async function parseApiError(response) {
  let message = `服務回應錯誤（${response.status}）`;
  let code = "";
  try {
    const payload = await response.clone().json();
    message = String(payload?.error || payload?.message || message);
    code = String(payload?.code || "");
  } catch {
    // Keep the status fallback when the service did not return JSON.
  }
  const error = new Error(message);
  error.status = response.status;
  error.code = code;
  const retryAfter = String(response.headers.get("Retry-After") || "").trim();
  if (retryAfter) {
    const seconds = Number(retryAfter);
    const retryAt = Number.isFinite(seconds)
      ? Date.now() + (Math.max(0, seconds) * 1000)
      : Date.parse(retryAfter);
    if (Number.isFinite(retryAt)) error.retryAfterMs = Math.max(0, retryAt - Date.now());
  }
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
  } catch (cause) {
    if (cause?.name === "AbortError") throw cause;
    const error = new Error("暫時未能連接交文服務，請檢查網絡後再試。");
    error.cause = cause;
    throw error;
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

function saveSession() {
  if (!state.user || !state.authToken) return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      token: state.authToken,
      id: state.user.id || "",
      name: state.user.name || "",
      role: state.user.role,
      access: state.user.role === "student" ? state.studentAccess : undefined
    }));
  } catch {
    // The authenticated session can continue in memory.
  }
}

function readSession() {
  try {
    const own = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (own?.token && own?.role) return own;
  } catch {
    // Continue to the shared student session candidate.
  }
  const shared = window.EdmundSystemNav?.getStudentSession?.();
  return shared?.token && shared?.role === "student" ? shared : null;
}

function clearSession() {
  window.clearTimeout(state.occurrenceFlushTimer);
  window.clearTimeout(state.draftSaveTimer);
  window.clearTimeout(state.manualRecheckTimer);
  state.occurrenceFlushTimer = null;
  state.occurrenceFlushPromise = null;
  state.draftSaveTimer = null;
  state.manualRecheckTimer = null;
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  state.user = null;
  state.authToken = "";
  state.studentAccess = {};
  state.grammarDetectionEnabled = true;
  state.activeIssues = [];
  state.appliedCorrections = [];
  state.dismissedIssueIds.clear();
  state.pendingOccurrences.clear();
  state.reportedFingerprints.clear();
  state.submissions = [];
  state.writingProgress = [];
  state.grammarProblems = [];
  state.adminSubmissions = [];
  state.adminExplanationReviews = [];
  state.adminExplanationReviewPage = 0;
  state.adminExplanationReviewHasMore = false;
  state.selectedTopicResource = null;
  state.writingTimer = emptyWritingTimer();
  state.writingTimerPanelOpen = false;
  state.timerAutoSubmitLock = false;
  state.submissionPromise = null;
  state.selectedExportSubmissionIds.clear();
  state.exportInFlight = false;
  state.draftDurationSeconds = 0;
  state.submissionDurationSeconds = null;
  state.writingClockLastAt = 0;
  state.lastWritingActivityAt = 0;
  syncWritingTimerUi();
  syncSubmissionExportControls();
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage may be unavailable. */ }
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
    access: row.access && typeof row.access === "object" && !Array.isArray(row.access) ? row.access : undefined,
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
      id: String(admin.id || "writing-submission-admin"),
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
  state.studentAccess = saved.role === "student" && saved.access && typeof saved.access === "object"
    ? saved.access
    : {};
  try {
    const payload = await apiJson(saved.role === "admin" ? "/v1/admin/me" : "/v1/student/me");
    const profile = saved.role === "admin" ? payload?.admin : payload?.student;
    if (!profile?.id || !profile?.name) throw new Error("Invalid restored profile");
    state.user = { id: String(profile.id), name: String(profile.name), role: saved.role };
    saveSession();
    if (saved.role === "student") {
      window.EdmundSystemNav?.rememberStudentSession({
        token: state.authToken,
        id: state.user.id,
        name: state.user.name,
        role: "student"
      });
    }
    return true;
  } catch (error) {
    console.warn("Writing Submission session restore failed", error);
    clearSession();
    return false;
  }
}

function draftStorageKey() {
  return state.user?.id ? `${DRAFT_KEY_PREFIX}:${state.user.id}` : "";
}

function newDocumentId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  if (typeof crypto.getRandomValues !== "function") {
    throw new Error("這個瀏覽器未能建立安全文件編號，請更新瀏覽器後再試。");
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join("")
  ].join("-");
}

function safeWritingPromptImage(value) {
  const source = String(value || "").trim();
  if (
    !source
    || source.length > 500
    || source.includes("://")
    || source.startsWith("//")
    || source.includes("\\")
    || source.startsWith("data:")
  ) return "";
  if (source.startsWith("/") || source.startsWith("./") || /^[a-z0-9][a-z0-9_./%()' -]*$/i.test(source)) {
    return source;
  }
  return "";
}

function normalizeWritingTopicResource(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const id = String(value.id || "").slice(0, 240);
  const label = String(value.label || "").trim().slice(0, 500);
  if (!id || !label || (value.type && value.type !== "fill-blanks")) return null;
  const questionPrompt = (Array.isArray(value.questionPrompt) ? value.questionPrompt : [])
    .map(line => String(line || "").trim().slice(0, 4000))
    .filter(Boolean)
    .slice(0, 30);
  const questionImages = (Array.isArray(value.questionImages) ? value.questionImages : [])
    .map((image) => {
      const source = safeWritingPromptImage(typeof image === "string" ? image : image?.src);
      if (!source) return null;
      return {
        src: source,
        alt: String(typeof image === "string" ? "Writing question image" : image?.alt || "Writing question image").slice(0, 300)
      };
    })
    .filter(Boolean)
    .slice(0, 8);
  return {
    id,
    type: "fill-blanks",
    label,
    detail: String(value.detail || "Writing Practice").slice(0, 300),
    sectionKey: String(value.sectionKey || "").slice(0, 100),
    questionPrompt,
    questionImages
  };
}

function writingTopicSearchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[’]/g, "'")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, " ")
    .trim();
}

function writingTopicSearchTokens(value) {
  return writingTopicSearchText(value).split(/\s+/u).filter(Boolean);
}

function canAccessWritingTopic(resource) {
  return !resource.sectionKey || state.studentAccess?.[resource.sectionKey] !== false;
}

async function loadWritingTopicCatalog() {
  if (state.topicCatalog.length) return state.topicCatalog;
  if (!state.topicCatalogPromise) {
    state.topicCatalogPromise = import(`./homework-resource-catalog.mjs?v=${TOPIC_CATALOG_VERSION}`)
      .then((module) => {
        const source = Array.isArray(module.HOMEWORK_RESOURCE_CATALOG)
          ? module.HOMEWORK_RESOURCE_CATALOG
          : [];
        state.topicCatalog = source
          .filter(resource => resource?.type === "fill-blanks")
          .map(normalizeWritingTopicResource)
          .filter(Boolean);
        return state.topicCatalog;
      })
      .finally(() => { state.topicCatalogPromise = null; });
  }
  return state.topicCatalogPromise;
}

function renderSelectedTopicPreview() {
  const resource = normalizeWritingTopicResource(state.selectedTopicResource);
  state.selectedTopicResource = resource;
  if (!elements.selectedTopicPreview) return;
  if (!resource?.questionImages.length) {
    elements.selectedTopicPreview.hidden = true;
    elements.selectedTopicPreview.replaceChildren();
    return;
  }
  const head = createElement("div", "selected-topic-preview-head");
  head.append(createElement("strong", "", resource.label));
  const remove = createElement("button", "", "移除附圖");
  remove.type = "button";
  remove.dataset.removeTopicPreview = "true";
  head.append(remove);
  const images = createElement("div", "selected-topic-images");
  for (const image of resource.questionImages) {
    const node = document.createElement("img");
    node.src = image.src;
    node.alt = image.alt;
    node.loading = "lazy";
    node.decoding = "async";
    images.append(node);
  }
  elements.selectedTopicPreview.replaceChildren(head, images);
  elements.selectedTopicPreview.hidden = false;
}

function writingTopicResultHaystack(resource) {
  return writingTopicSearchText([
    resource.label,
    resource.detail,
    resource.sectionKey,
    ...resource.questionPrompt
  ].join(" "));
}

function renderWritingTopicResults(query = "") {
  if (!elements.topicPickerResults) return;
  const tokens = writingTopicSearchTokens(query);
  const matches = state.topicCatalog
    .filter(canAccessWritingTopic)
    .filter((resource) => {
      if (!tokens.length) return true;
      const haystack = writingTopicResultHaystack(resource);
      return tokens.every(token => haystack.includes(token));
    })
    .slice(0, 30);
  if (!matches.length) {
    elements.topicPickerResults.replaceChildren(emptyState("找不到符合關鍵字而且已開放的寫作題目。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const resource of matches) {
    const button = createElement("button", "topic-picker-result");
    button.type = "button";
    button.dataset.selectWritingTopic = resource.id;
    button.append(
      createElement("strong", "", resource.label),
      createElement("small", "", resource.detail || "Writing Practice"),
      createElement("em", "", "選擇")
    );
    if (resource.questionPrompt.length || resource.questionImages.length) {
      const preview = createElement("div", "topic-picker-result-preview");
      for (const line of resource.questionPrompt.slice(0, 3)) preview.append(createElement("p", "", line));
      if (resource.questionImages.length) {
        const images = createElement("div", "topic-picker-result-images");
        for (const image of resource.questionImages.slice(0, 3)) {
          const node = document.createElement("img");
          node.src = image.src;
          node.alt = image.alt;
          node.loading = "lazy";
          node.decoding = "async";
          images.append(node);
        }
        preview.append(images);
      }
      button.append(preview);
    }
    fragment.append(button);
  }
  elements.topicPickerResults.replaceChildren(fragment);
}

async function openWritingTopicPicker() {
  elements.topicPickerResults.replaceChildren(loadingState("正在載入寫作練習題目…"));
  if (typeof elements.topicPicker.showModal === "function") elements.topicPicker.showModal();
  else elements.topicPicker.setAttribute("open", "");
  try {
    await loadWritingTopicCatalog();
    renderWritingTopicResults(elements.topicPickerSearch.value);
    window.setTimeout(() => elements.topicPickerSearch.focus(), 0);
  } catch (error) {
    console.warn("Writing topic catalog failed", error);
    elements.topicPickerResults.replaceChildren(emptyState("暫時未能載入寫作練習題目。您仍可自行輸入題目。"));
  }
}

function closeWritingTopicPicker() {
  if (typeof elements.topicPicker.close === "function") elements.topicPicker.close();
  else elements.topicPicker.removeAttribute("open");
}

function selectWritingTopic(resourceId) {
  const resource = state.topicCatalog.find(item => item.id === resourceId && canAccessWritingTopic(item));
  if (!resource) return;
  const topic = resource.questionPrompt.length
    ? resource.questionPrompt.join("\n\n")
    : resource.label;
  elements.topicInput.value = topic.slice(0, 4000);
  state.selectedTopicResource = resource;
  renderSelectedTopicPreview();
  markWritingActivity();
  updateEditorMetrics();
  persistDraft();
  closeWritingTopicPicker();
  showToast("已貼上寫作練習題目；您仍可自行修改。", "success");
}

function readDraft() {
  const key = draftStorageKey();
  if (!key) return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(key) || "null");
    if (!UUID_RE.test(String(value?.documentId || ""))) return null;
    const rawSubmissionDuration = value?.submissionDurationSeconds;
    const submissionDurationSeconds = rawSubmissionDuration === null || rawSubmissionDuration === undefined
      ? Number.NaN
      : Number(rawSubmissionDuration);
    return {
      documentId: String(value.documentId),
      topic: String(value.topic || ""),
      answer: String(value.answer || ""),
      durationSeconds: Math.max(0, Math.min(31536000, Number(value.durationSeconds || 0))),
      submissionDurationSeconds: Number.isSafeInteger(submissionDurationSeconds)
        && submissionDurationSeconds >= 0
        && submissionDurationSeconds <= 31536000
        ? submissionDurationSeconds
        : null,
      writingTimer: normalizeWritingTimer(value.writingTimer),
      selectedTopicResource: normalizeWritingTopicResource(value.selectedTopicResource)
    };
  } catch {
    return null;
  }
}

function persistDraft() {
  const key = draftStorageKey();
  if (!key || !state.documentId) return;
  try {
    accrueWritingTime();
    sessionStorage.setItem(key, JSON.stringify({
      documentId: state.documentId,
      topic: elements.topicInput.value,
      answer: elements.writingInput.value,
      durationSeconds: Math.round(state.draftDurationSeconds),
      submissionDurationSeconds: state.submissionDurationSeconds,
      writingTimer: normalizeWritingTimer(state.writingTimer),
      selectedTopicResource: state.selectedTopicResource,
      savedAt: new Date().toISOString()
    }));
  } catch {
    // Draft persistence is a convenience; submission remains available.
  }
}

function scheduleDraftSave() {
  window.clearTimeout(state.draftSaveTimer);
  state.draftSaveTimer = window.setTimeout(persistDraft, 280);
}

function clearStoredDraft() {
  const key = draftStorageKey();
  if (!key) return;
  try { sessionStorage.removeItem(key); } catch { /* Ignore unavailable storage. */ }
}

function issueQueueStorageKey(userId = state.user?.id) {
  return userId ? `${ISSUE_QUEUE_KEY_PREFIX}:${userId}` : "";
}

function persistIssueQueue() {
  const key = issueQueueStorageKey();
  if (!key) return;
  try {
    const values = [...state.pendingOccurrences.values()].slice(-100);
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // The live queue still retries during this page session.
  }
}

function restoreIssueQueue() {
  const key = issueQueueStorageKey();
  state.pendingOccurrences.clear();
  if (!key) return;
  try {
    const values = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(values)) return;
    for (const value of values.slice(-100)) {
      const occurrence = value?.occurrence;
      if (
        !UUID_RE.test(String(value?.documentId || ""))
        || !/^[0-9a-f]{64}$/u.test(String(occurrence?.fingerprint || ""))
        || !UUID_RE.test(String(occurrence?.id || ""))
      ) continue;
      state.pendingOccurrences.set(String(occurrence.fingerprint), {
        documentId: String(value.documentId),
        occurrence
      });
    }
    if (state.pendingOccurrences.size) scheduleOccurrenceFlush();
  } catch {
    // Ignore a corrupt convenience queue; the server remains authoritative.
  }
}

function autosizeTextarea(textarea, minimum = 0) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${Math.max(minimum, textarea.scrollHeight)}px`;
}

function updateEditorMetrics() {
  elements.wordCount.textContent = String(countEnglishWords(elements.writingInput.value));
  const changed = Boolean(elements.topicInput.value.trim() || elements.writingInput.value.trim());
  elements.draftState.textContent = changed ? "正在編輯" : "尚未提交";
  autosizeTextarea(elements.topicInput, 108);
  autosizeTextarea(elements.writingInput, 480);
}

function setWritingTimerInputs(durationSeconds) {
  const seconds = Math.max(0, Math.round(Number(durationSeconds || 0)));
  elements.writingTimerHours.value = String(Math.floor(seconds / 3600));
  elements.writingTimerMinutes.value = String(Math.floor((seconds % 3600) / 60));
  elements.writingTimerSeconds.value = String(seconds % 60);
}

function writingTimerStatusText(timer) {
  if (timer.status === "running") {
    return timer.forceSubmit
      ? "倒數進行中；時間到後會自動提交目前文章。"
      : "倒數進行中；時間到後只會提示，不會自動提交。";
  }
  if (timer.status === "paused") return "倒數已暫停；按「繼續倒數」即可恢復。";
  if (timer.status === "expired") {
    if (state.timerAutoSubmitLock || state.submissionPromise) return "時間已到，正在安全提交文章……";
    if (timer.autoSubmitError) return timer.autoSubmitError;
    if (timer.forceSubmit && timer.autoSubmitAttemptedAt) return "上次自動提交的結果未能確認；如文章仍在，請按「重試自動提交」。";
    return timer.forceSubmit ? "時間已到，正準備自動提交。" : "時間已到；文章不會自動提交。";
  }
  return "尚未開始倒數。";
}

function syncWritingTimerUi() {
  if (!elements.writingTimerPanel) return;
  const previousStatus = state.writingTimer.status;
  const timer = normalizeWritingTimer(state.writingTimer);
  state.writingTimer = timer;
  const remaining = writingTimerRemaining(timer);
  const display = formatWritingTimer(remaining);
  elements.writingTimerPanel.hidden = !state.writingTimerPanelOpen;
  elements.writingTimerToggle.setAttribute("aria-expanded", String(state.writingTimerPanelOpen));
  elements.writingTimerPanel.dataset.status = timer.status;
  elements.writingTimerDisplay.textContent = display;
  elements.writingTimerToggleDisplay.textContent = display;
  elements.writingTimerForce.checked = timer.forceSubmit;
  elements.writingTimerForce.disabled = state.timerAutoSubmitLock || Boolean(state.submissionPromise);
  elements.writingTimerStart.textContent = timer.status === "paused"
    ? "繼續倒數"
    : timer.status === "expired"
      ? "重新開始"
      : timer.status === "running"
        ? "倒數中"
        : "開始倒數";
  elements.writingTimerStart.disabled = timer.status === "running" || Boolean(state.submissionPromise);
  elements.writingTimerPause.disabled = timer.status !== "running" || Boolean(state.submissionPromise);
  elements.writingTimerReset.disabled = timer.status === "idle" || Boolean(state.submissionPromise);
  elements.writingTimerRetry.hidden = !(
    timer.status === "expired"
    && timer.forceSubmit
    && !state.timerAutoSubmitLock
    && (timer.autoSubmitError || timer.autoSubmitAttemptedAt)
  );
  elements.writingTimerRetry.disabled = state.timerAutoSubmitLock || Boolean(state.submissionPromise);
  const durationLocked = timer.status !== "idle";
  elements.writingTimerHours.disabled = durationLocked;
  elements.writingTimerMinutes.disabled = durationLocked;
  elements.writingTimerSeconds.disabled = durationLocked;
  elements.writingTimerStatus.textContent = writingTimerStatusText(timer);
  if (previousStatus === "running" && timer.status === "expired") {
    persistDraft();
    if (timer.forceSubmit) window.setTimeout(() => attemptTimerForceSubmission(), 0);
    else showToast("寫作時間已到。", "error");
  }
}

function handleWritingTimerExpiry() {
  if (state.writingTimer.status === "expired") return;
  state.writingTimer = expireWritingTimer(state.writingTimer);
  persistDraft();
  syncWritingTimerUi();
  if (state.writingTimer.forceSubmit) {
    window.setTimeout(() => attemptTimerForceSubmission(), 0);
  } else {
    showToast("寫作時間已到。", "error");
  }
}

function tickWritingTimer() {
  if (state.writingTimer.status !== "running") return;
  const remaining = writingTimerRemaining(state.writingTimer);
  if (remaining <= 0) {
    handleWritingTimerExpiry();
    return;
  }
  state.writingTimer.remainingSeconds = remaining;
  elements.writingTimerDisplay.textContent = formatWritingTimer(remaining);
  elements.writingTimerToggleDisplay.textContent = formatWritingTimer(remaining);
}

function startWritingTimerClock() {
  if (state.writingTimerClock) return;
  state.writingTimerClock = window.setInterval(tickWritingTimer, 250);
}

function openWritingTimerPanel(open = !state.writingTimerPanelOpen) {
  state.writingTimerPanelOpen = Boolean(open);
  syncWritingTimerUi();
  if (state.writingTimerPanelOpen) {
    window.setTimeout(() => elements.writingTimerPanel.scrollIntoView({ block: "nearest", behavior: "smooth" }), 0);
  }
}

function handleWritingTimerStart() {
  try {
    state.writingTimer = state.writingTimer.status === "paused"
      ? resumeWritingTimer(state.writingTimer)
      : startWritingTimer(
        timerInputSeconds(
          elements.writingTimerHours.value,
          elements.writingTimerMinutes.value,
          elements.writingTimerSeconds.value
        ),
        elements.writingTimerForce.checked
      );
    state.writingTimer.autoSubmitAttemptedAt = 0;
    state.writingTimer.autoSubmitError = "";
    persistDraft();
    syncWritingTimerUi();
  } catch {
    elements.writingTimerStatus.textContent = "請設定最少 1 秒的倒數時間。";
    elements.writingTimerSeconds.focus();
  }
}

function handleWritingTimerPause() {
  state.writingTimer = pauseWritingTimer(state.writingTimer);
  persistDraft();
  syncWritingTimerUi();
}

function handleWritingTimerReset() {
  state.writingTimer = emptyWritingTimer();
  state.timerAutoSubmitLock = false;
  setWritingTimerInputs(40 * 60);
  persistDraft();
  syncWritingTimerUi();
}

function handleWritingTimerForceChange() {
  state.writingTimer.forceSubmit = elements.writingTimerForce.checked;
  state.writingTimer.autoSubmitError = "";
  state.writingTimer.autoSubmitAttemptedAt = 0;
  persistDraft();
  syncWritingTimerUi();
  if (state.writingTimer.status === "expired" && state.writingTimer.forceSubmit) {
    attemptTimerForceSubmission();
  }
}

async function attemptTimerForceSubmission({ retry = false } = {}) {
  if (
    state.user?.role !== "student"
    || state.writingTimer.status !== "expired"
    || !state.writingTimer.forceSubmit
    || state.timerAutoSubmitLock
    || state.submissionPromise
  ) return false;
  if (state.writingTimer.autoSubmitAttemptedAt && !retry) {
    syncWritingTimerUi();
    return false;
  }
  if (!navigator.onLine) {
    state.writingTimer.autoSubmitError = "時間已到，但目前沒有網絡。文章草稿仍安全保留；連線後可重試自動提交。";
    persistDraft();
    syncWritingTimerUi();
    return false;
  }
  if (!elements.topicInput.value.trim() || !elements.writingInput.value.trim()) {
    state.writingTimer.autoSubmitError = "時間已到，但寫作題目或文章內容仍未填寫，因此未能自動提交。補充內容後請按「重試自動提交」。";
    persistDraft();
    syncWritingTimerUi();
    return false;
  }
  state.timerAutoSubmitLock = true;
  state.writingTimer.autoSubmitAttemptedAt = Date.now();
  state.writingTimer.autoSubmitError = "";
  persistDraft();
  syncWritingTimerUi();
  try {
    await submitCurrentWriting({ source: "timer" });
    return true;
  } catch (error) {
    state.writingTimer.autoSubmitError = `時間已到，但自動提交未成功：${error.message || "請稍後重試。"}`;
    persistDraft();
    syncWritingTimerUi();
    return false;
  } finally {
    state.timerAutoSubmitLock = false;
    syncWritingTimerUi();
  }
}

function startNewDraft({ preserveView = false } = {}) {
  window.clearTimeout(state.manualRecheckTimer);
  state.manualRecheckTimer = null;
  clearStoredDraft();
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  state.documentId = newDocumentId();
  state.draftDurationSeconds = 0;
  state.submissionDurationSeconds = null;
  state.writingTimer = emptyWritingTimer();
  state.timerAutoSubmitLock = false;
  state.writingClockLastAt = Date.now();
  state.lastWritingActivityAt = Date.now();
  state.previousWriting = "";
  state.activeIssues = [];
  state.appliedCorrections = [];
  state.dismissedIssueIds.clear();
  elements.topicInput.value = "";
  elements.writingInput.value = "";
  state.selectedTopicResource = null;
  renderSelectedTopicPreview();
  setStatus(elements.submissionStatus, "");
  renderGrammarIssues();
  updateEditorMetrics();
  setWritingTimerInputs(40 * 60);
  syncWritingTimerUi();
  persistDraft();
  if (!preserveView) showView("workspace");
  window.setTimeout(() => elements.topicInput.focus(), 0);
}

function restoreDraft() {
  window.clearTimeout(state.manualRecheckTimer);
  state.manualRecheckTimer = null;
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  restoreIssueQueue();
  const draft = readDraft();
  state.documentId = draft?.documentId || newDocumentId();
  state.draftDurationSeconds = draft?.durationSeconds || 0;
  state.submissionDurationSeconds = draft?.submissionDurationSeconds ?? null;
  state.writingTimer = normalizeWritingTimer(draft?.writingTimer);
  state.timerAutoSubmitLock = false;
  state.writingClockLastAt = Date.now();
  state.lastWritingActivityAt = Date.now();
  state.appliedCorrections = [];
  elements.topicInput.value = draft?.topic || "";
  elements.writingInput.value = draft?.answer || "";
  state.selectedTopicResource = draft?.selectedTopicResource || null;
  renderSelectedTopicPreview();
  state.previousWriting = elements.writingInput.value;
  updateEditorMetrics();
  if (state.writingTimer.durationSeconds) setWritingTimerInputs(state.writingTimer.durationSeconds);
  else setWritingTimerInputs(40 * 60);
  syncWritingTimerUi();
  renderGrammarIssues();
  persistDraft();
  const completedSegments = completedWritingSegments(elements.writingInput.value);
  if (state.grammarDetectionEnabled && completedSegments.length) {
    enqueueSegmentsForCheck(completedSegments, { remote: false });
  }
  if (
    state.writingTimer.status === "expired"
    && state.writingTimer.forceSubmit
    && !state.writingTimer.autoSubmitAttemptedAt
  ) {
    window.setTimeout(() => attemptTimerForceSubmission(), 0);
  }
}

function updateHarperStatus(status, title, detail) {
  state.checkerState = status;
  elements.harperStatus.dataset.state = status;
  const strong = elements.harperStatus.querySelector("strong");
  const small = elements.harperStatus.querySelector("small");
  if (strong) strong.textContent = title;
  if (small) small.textContent = detail;
}

async function prepareGrammarChecker() {
  if (!state.grammarDetectionEnabled) return null;
  if (state.checkerPromise) return state.checkerPromise;
  updateHarperStatus("loading", "正在準備文法偵測", "本機後備檢查首次載入約需數秒");
  state.checkerPromise = (async () => {
    const module = await import("./writing-submission-harper.js?v=20260803-grammar6");
    const checker = module.createWritingGrammarChecker();
    state.checker = checker;
    try {
      await checker.setup();
      const corpusRuleCount = Number(module.CORPUS_COMPILED_RULE_COUNT) || 0;
      const executableFamilyCount = Number(module.EXECUTABLE_COMPILED_FAMILY_COUNT) || 0;
      updateHarperStatus(
        "ready",
        "文法偵測已準備",
        `${corpusRuleCount} 條語料規則 + ${executableFamilyCount} 個可執行規則家族 + 通用文法 ${ESL_RULESET_VERSION} + Harper ${HARPER_VERSION} 後備校對`
      );
    } catch (error) {
      console.warn("Local Harper setup failed", error);
      updateHarperStatus("ready", "文法偵測已準備", "Edmund 本機規則仍可使用；Harper 暫時不可用");
    }
    return checker;
  })();
  return state.checkerPromise;
}

function syncGrammarDetectionControls() {
  if (elements.grammarToggle) elements.grammarToggle.checked = state.grammarDetectionEnabled;
  if (elements.grammarToggleLabel) {
    elements.grammarToggleLabel.textContent = state.grammarDetectionEnabled ? "開啟" : "關閉";
  }
  if (elements.grammarPanel) {
    elements.grammarPanel.dataset.detectionEnabled = String(state.grammarDetectionEnabled);
  }
}

function stopGrammarDetection() {
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  state.activeIssues = [];
  state.dismissedIssueIds.clear();
  window.clearTimeout(state.manualRecheckTimer);
  state.manualRecheckTimer = null;
  updateHarperStatus("ready", "文法偵測已關閉", "不會把句子傳送至文法服務；重新開啟後會由文章開首重新檢查");
  renderGrammarIssues();
}

function startGrammarDetection({ scanCurrentWriting = false } = {}) {
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  state.activeIssues = [];
  state.dismissedIssueIds.clear();
  prepareGrammarChecker()
    .then(() => {
      if (state.grammarDetectionEnabled) {
        updateHarperStatus("ready", "文法偵測已準備", `文法偵測 + 本機 ESL ${ESL_RULESET_VERSION} + Harper ${HARPER_VERSION} 後備校對`);
      }
    })
    .catch((error) => console.warn("Grammar checker setup failed", error));
  if (scanCurrentWriting) {
    const segments = completedWritingSegments(elements.writingInput.value);
    if (segments.length) enqueueSegmentsForCheck(segments, { remote: true });
  }
  renderGrammarIssues();
}

function setGrammarDetectionEnabled(enabled, { scanCurrentWriting = false } = {}) {
  const next = enabled !== false;
  const changed = state.grammarDetectionEnabled !== next;
  state.grammarDetectionEnabled = next;
  syncGrammarDetectionControls();
  if (!changed) {
    renderGrammarIssues();
    return;
  }
  if (next) startGrammarDetection({ scanCurrentWriting });
  else stopGrammarDetection();
}

async function loadWritingPreferences() {
  state.grammarDetectionEnabled = true;
  syncGrammarDetectionControls();
  try {
    const payload = await apiJson("/v1/preferences");
    setGrammarDetectionEnabled(payload?.preferences?.grammarDetectionEnabled !== false);
  } catch (error) {
    console.warn("Writing preferences could not be loaded", error);
    setGrammarDetectionEnabled(true);
  }
}

async function persistGrammarDetectionPreference(enabled) {
  const payload = await apiJson("/v1/preferences", {
    method: "PUT",
    body: JSON.stringify({ grammarDetectionEnabled: enabled })
  });
  return payload?.preferences?.grammarDetectionEnabled !== false;
}

async function handleGrammarDetectionToggle() {
  const enabled = Boolean(elements.grammarToggle?.checked);
  setGrammarDetectionEnabled(enabled, { scanCurrentWriting: enabled });
  elements.grammarToggle.disabled = true;
  try {
    const savedEnabled = await persistGrammarDetectionPreference(enabled);
    if (savedEnabled !== enabled) setGrammarDetectionEnabled(savedEnabled, { scanCurrentWriting: savedEnabled });
    showToast(enabled ? "文法偵測已開啟，正由文章開首檢查。" : "文法偵測已關閉並已保存。", "success");
  } catch (error) {
    console.warn("Writing preference save failed", error);
    showToast("偏好暫時未能同步；本頁仍會使用目前設定。", "error");
  } finally {
    elements.grammarToggle.disabled = false;
  }
}

function rebaseActiveIssues(previousValue, nextValue) {
  if (!state.activeIssues.length || previousValue === nextValue) return;
  const change = insertedRange(previousValue, nextValue);
  const suffixLength = nextValue.length - change.end;
  const previousEnd = previousValue.length - suffixLength;
  const delta = (change.end - change.start) - (previousEnd - change.start);
  const liveSegments = completedWritingSegments(nextValue);
  const rebased = [];
  for (const issue of state.activeIssues) {
    if (issue.sentenceEnd <= change.start) {
      rebased.push(issue);
      continue;
    }
    if (issue.sentenceStart >= previousEnd) {
      const shifted = {
        ...issue,
        sentenceStart: issue.sentenceStart + delta,
        sentenceEnd: issue.sentenceEnd + delta,
        absoluteStart: issue.absoluteStart + delta,
        absoluteEnd: issue.absoluteEnd + delta
      };
      const liveSegment = liveSegments.find((segment) => (
        segment.start === shifted.sentenceStart
        && segment.end === shifted.sentenceEnd
        && segment.text === shifted.sentenceText
      ));
      if (liveSegment && isLiveCompletedWritingSegment(nextValue, liveSegment)) {
        rebased.push({
          ...shifted,
          id: `${shifted.fingerprint}:${liveSegment.ordinal}:${shifted.start}:${shifted.end}`,
          segmentOrdinal: liveSegment.ordinal
        });
      }
    }
    // A change inside the checked sentence invalidates that suggestion.
  }
  state.activeIssues = rebased;
}

function rebaseAppliedCorrections(previousValue, nextValue) {
  if (!state.appliedCorrections.length || previousValue === nextValue) return;
  const change = insertedRange(previousValue, nextValue);
  const suffixLength = nextValue.length - change.end;
  const previousEnd = previousValue.length - suffixLength;
  const delta = (change.end - change.start) - (previousEnd - change.start);
  const rebased = [];
  for (const correction of state.appliedCorrections) {
    if (correction.absoluteEnd <= change.start) {
      rebased.push(correction);
      continue;
    }
    if (correction.absoluteStart >= previousEnd) {
      rebased.push({
        ...correction,
        absoluteStart: correction.absoluteStart + delta,
        absoluteEnd: correction.absoluteEnd + delta
      });
    }
    // A manual or accepted edit touching this exact correction clears the
    // lock so that a genuinely stronger correction may be considered later.
  }
  state.appliedCorrections = rebased;
}

function rememberAppliedCorrection(issue) {
  const before = String(issue.originalText || "");
  const after = String(issue.suggestedText || "");
  if (!before || !after || before === after) return;
  state.appliedCorrections.push({
    generation: state.checkGeneration,
    documentId: state.documentId,
    absoluteStart: issue.absoluteStart,
    absoluteEnd: issue.absoluteStart + after.length,
    before,
    after,
    categoryId: String(issue.categoryId || issue.category || ""),
    engineId: String(issue.engineId || issue.engine?.name || "")
  });
  if (state.appliedCorrections.length > 100) state.appliedCorrections.shift();
}

async function sha256Hex(value) {
  if (crypto.subtle) {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value)));
    return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  throw new Error("這個瀏覽器未能安全記錄文法問題，請更新瀏覽器後再試。");
}

function captureCheckContext() {
  return Object.freeze({
    generation: state.checkGeneration,
    userId: String(state.user?.id || ""),
    documentId: state.documentId
  });
}

function isCurrentCheckContext(context) {
  return Boolean(
    context
    && context.generation === state.checkGeneration
    && context.userId === String(state.user?.id || "")
    && context.documentId === state.documentId
    && state.user?.role === "student"
  );
}

async function decorateIssue(rawIssue, segment, context) {
  const rawStart = Number(rawIssue.start || 0);
  const rawEnd = Number(rawIssue.end || rawStart);
  const start = Math.max(0, Math.min(segment.text.length, Number.isFinite(rawStart) ? rawStart : 0));
  const end = Math.max(start, Math.min(segment.text.length, Number.isFinite(rawEnd) ? rawEnd : start));
  const ruleId = String(rawIssue.ruleId || "UnknownRule").slice(0, 120) || "UnknownRule";
  const engineIdentity = `${rawIssue.engine?.name || "harper.js"}@${rawIssue.engine?.version || HARPER_VERSION}`;
  const originalText = String(rawIssue.originalText || segment.text.slice(start, end)).slice(0, 2000);
  const suggestedText = String(rawIssue.suggestedText || "").slice(0, 2000);
  const correctedSentence = String(rawIssue.correctedSentence || segment.text).slice(0, 10000);
  // The identity represents one concrete card, not merely one rule. An
  // unchanged rescan remains idempotent, while two errors of the same rule in
  // the same composition retain separate records.
  const fingerprint = await sha256Hex(grammarOccurrenceIdentity({
    engineIdentity,
    documentId: context.documentId,
    ruleId,
    segmentOrdinal: segment.ordinal,
    sentenceText: segment.text,
    start,
    end,
    originalText,
    suggestedText,
    correctedSentence
  }));
  return {
    ...rawIssue,
    id: `${fingerprint}:${segment.ordinal}:${start}:${end}`,
    fingerprint,
    ruleId,
    title: String(rawIssue.title || rawIssue.category || ruleId).slice(0, 200),
    message: String(rawIssue.message || "請檢查這部分的文法。").slice(0, 2000),
    originalText,
    suggestedText,
    correctedSentence,
    start,
    end,
    documentId: context.documentId,
    userId: context.userId,
    generation: context.generation,
    sentenceText: segment.text,
    sentenceStart: segment.start,
    sentenceEnd: segment.end,
    segmentOrdinal: segment.ordinal,
    absoluteStart: segment.start + start,
    absoluteEnd: segment.start + end
  };
}

function scheduleOccurrenceFlush() {
  window.clearTimeout(state.occurrenceFlushTimer);
  state.occurrenceFlushTimer = window.setTimeout(() => {
    flushGrammarOccurrences().catch((error) => console.warn("Grammar occurrence flush failed", error));
  }, 900);
}

function queueOccurrence(issue) {
  if (
    !isCurrentCheckContext(issue)
    || issue.sentenceText.length > 10000
    || state.reportedFingerprints.has(issue.fingerprint)
    || state.pendingOccurrences.has(issue.fingerprint)
  ) return;
  state.pendingOccurrences.set(issue.fingerprint, {
    documentId: issue.documentId,
    occurrence: {
      id: newDocumentId(),
      fingerprint: issue.fingerprint,
      ruleId: issue.ruleId,
      title: issue.title,
      message: issue.message,
      originalText: issue.originalText,
      suggestedText: issue.suggestedText,
      sentenceText: issue.sentenceText,
      correctedSentence: issue.correctedSentence,
      detectedAt: new Date().toISOString()
    }
  });
  persistIssueQueue();
  scheduleOccurrenceFlush();
}

async function performGrammarOccurrenceFlush({ keepalive = false } = {}) {
  window.clearTimeout(state.occurrenceFlushTimer);
  state.occurrenceFlushTimer = null;
  if (state.user?.role !== "student" || !state.pendingOccurrences.size) return;
  const groups = new Map();
  for (const entry of state.pendingOccurrences.values()) {
    if (!groups.has(entry.documentId)) groups.set(entry.documentId, []);
    groups.get(entry.documentId).push(entry.occurrence);
  }
  const maximumBodyBytes = keepalive ? 52 * 1024 : 500000;
  for (const [documentId, occurrences] of groups) {
    const batches = [];
    let batch = [];
    for (const occurrence of occurrences) {
      const candidate = [...batch, occurrence];
      const candidateBody = JSON.stringify({ documentId, occurrences: candidate });
      const candidateBytes = new TextEncoder().encode(candidateBody).byteLength;
      if (batch.length && (candidate.length > 50 || candidateBytes > maximumBodyBytes)) {
        batches.push(batch);
        batch = [occurrence];
      } else {
        batch = candidate;
      }
    }
    if (batch.length) batches.push(batch);

    for (const currentBatch of batches) {
      const body = JSON.stringify({ documentId, occurrences: currentBatch });
      const bodyBytes = new TextEncoder().encode(body).byteLength;
      if (bodyBytes > maximumBodyBytes) {
        // A very large diagnostic remains in durable local storage and the
        // normal synchronization path will retry it after the page opens.
        if (keepalive) continue;
        throw new Error("文法記錄超出同步限制。");
      }
      await apiJson("/v1/grammar-occurrences/batch", { method: "POST", body, keepalive });
      for (const occurrence of currentBatch) {
        state.pendingOccurrences.delete(occurrence.fingerprint);
        state.reportedFingerprints.add(occurrence.fingerprint);
      }
      persistIssueQueue();
    }
  }
}

async function flushGrammarOccurrences(options = {}) {
  if (state.occurrenceFlushPromise) return state.occurrenceFlushPromise;
  state.occurrenceFlushPromise = performGrammarOccurrenceFlush(options)
    .finally(() => { state.occurrenceFlushPromise = null; });
  return state.occurrenceFlushPromise;
}

function cancelRemoteGrammarChecks() {
  for (const record of state.latestSegmentRecords.values()) record.superseded = true;
  for (const controller of state.remoteGrammarControllers) controller.abort();
  state.remoteGrammarControllers.clear();
  const cancelled = remoteGrammarFailureResult(
    classifyRemoteGrammarFailure({ name: "AbortError" })
  );
  for (const job of state.remoteGrammarQueue.splice(0)) job.resolve(cancelled);
  state.segmentChecks.clear();
  state.latestSegmentRecords.clear();
  state.remoteGrammarWarnings.clear();
  state.remoteGrammarBackoffUntil = 0;
  state.remoteGrammarBackoffFailure = null;
}

function segmentSlotKey(segment, context) {
  return [context.generation, context.documentId, segment.start].join("|");
}

function segmentCheckKey(segment, context, revision) {
  return [context.generation, context.documentId, segment.start, segment.end, revision, segment.text].join("|");
}

function isLatestSegmentRecord(record) {
  return Boolean(
    record
    && !record.superseded
    && isCurrentCheckContext(record.context)
    && state.latestSegmentRecords.get(record.slotKey) === record
  );
}

function supersedeSegmentRecordsAffectedByEdit(previousValue, nextValue) {
  if (previousValue === nextValue || !state.latestSegmentRecords.size) return;
  const change = insertedRange(previousValue, nextValue);
  const suffixLength = nextValue.length - change.end;
  const previousEnd = previousValue.length - suffixLength;
  const delta = (change.end - change.start) - (previousEnd - change.start);
  const liveSegments = completedWritingSegments(nextValue);
  for (const [slotKey, record] of [...state.latestSegmentRecords.entries()]) {
    if (record.segment.end <= change.start) continue;

    // An edit strictly before an unchanged sentence only shifts its offsets.
    // Keep its in-flight analysis and move the slot identity with the text.
    // Mutate the segment object in place: decorateIssue may be awaiting
    // WebCrypto with this same reference, and replacing it would let stale
    // absolute offsets publish after the await.
    if (record.segment.start >= previousEnd) {
      const shiftedStart = record.segment.start + delta;
      const liveSegment = liveSegments.find((segment) => (
        segment.start === shiftedStart && segment.text === record.segment.text
      ));
      if (!liveSegment) {
        record.superseded = true;
        record.remoteController?.abort();
        if (state.latestSegmentRecords.get(slotKey) === record) state.latestSegmentRecords.delete(slotKey);
        if (state.segmentChecks.get(record.key) === record) state.segmentChecks.delete(record.key);
        continue;
      }
      const existingAtNewSlot = state.latestSegmentRecords.get(
        segmentSlotKey(liveSegment, record.context)
      );
      if (existingAtNewSlot && existingAtNewSlot !== record) {
        record.superseded = true;
        record.remoteController?.abort();
        if (state.latestSegmentRecords.get(slotKey) === record) state.latestSegmentRecords.delete(slotKey);
        if (state.segmentChecks.get(record.key) === record) state.segmentChecks.delete(record.key);
        continue;
      }
      const nextSlotKey = segmentSlotKey(liveSegment, record.context);
      if (state.latestSegmentRecords.get(slotKey) === record) state.latestSegmentRecords.delete(slotKey);
      Object.assign(record.segment, liveSegment);
      record.slotKey = nextSlotKey;
      state.latestSegmentRecords.set(nextSlotKey, record);
      continue;
    }

    // An edit inside the sentence invalidates its exact analysis, even if the
    // student later restores the same text (the A-B-A race).
    record.superseded = true;
    record.remoteController?.abort();
    if (state.latestSegmentRecords.get(slotKey) === record) {
      state.latestSegmentRecords.delete(slotKey);
    }
    if (state.segmentChecks.get(record.key) === record) {
      state.segmentChecks.delete(record.key);
    }
  }
}

function remoteGrammarSuccessResult(issues) {
  return { issues, failure: null, skipped: false };
}

function remoteGrammarFailureResult(failure, { skipped = false } = {}) {
  return { issues: null, failure, skipped };
}

function cancelledRemoteGrammarResult() {
  return remoteGrammarFailureResult(
    classifyRemoteGrammarFailure({ name: "AbortError" })
  );
}

function inconclusiveRemoteGrammarResult() {
  return remoteGrammarFailureResult(classifyRemoteGrammarFailure({
    status: 502,
    code: "GRAMMAR_CHECK_INCONCLUSIVE"
  }));
}

async function performRemoteGrammarRequest(record) {
  if (!state.grammarDetectionEnabled) return cancelledRemoteGrammarResult();
  if (!isLatestSegmentRecord(record)) return cancelledRemoteGrammarResult();
  const controller = new AbortController();
  record.remoteController = controller;
  state.remoteGrammarControllers.add(controller);
  let timedOut = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REMOTE_GRAMMAR_REQUEST_TIMEOUT_MS);
  try {
    const response = await apiJson("/v1/grammar-check", {
      method: "POST",
      body: JSON.stringify({ sentence: record.segment.text }),
      signal: controller.signal
    });
    const issues = normalizeWritingAiResponse(record.segment.text, response);
    if (!isLatestSegmentRecord(record)) return cancelledRemoteGrammarResult();
    return remoteGrammarSuccessResult(issues);
  } catch (error) {
    if (!isLatestSegmentRecord(record)) return cancelledRemoteGrammarResult();
    const failure = classifyRemoteGrammarFailure(error, { timedOut });
    if (failure.kind !== REMOTE_GRAMMAR_FAILURE_KINDS.cancelled) {
      console.warn(
        "Advanced grammar check did not complete",
        error?.code || error?.status || failure.kind
      );
    }
    return remoteGrammarFailureResult(failure);
  } finally {
    window.clearTimeout(timeout);
    state.remoteGrammarControllers.delete(controller);
    if (record.remoteController === controller) record.remoteController = null;
  }
}

async function requestRemoteGrammarIssues(record) {
  if (!state.grammarDetectionEnabled) return cancelledRemoteGrammarResult();
  if (!isLatestSegmentRecord(record)) return cancelledRemoteGrammarResult();
  if (record.segment.text.length > 2000) return inconclusiveRemoteGrammarResult();
  if (Date.now() < state.remoteGrammarBackoffUntil) {
    return remoteGrammarFailureResult(
      state.remoteGrammarBackoffFailure || classifyRemoteGrammarFailure(new TypeError("Network backoff")),
      { skipped: true }
    );
  }

  let completedRetries = 0;
  while (true) {
    const result = await performRemoteGrammarRequest(record);
    if (!result?.failure || !isLatestSegmentRecord(record)) return result;
    const retryDelayMs = remoteGrammarRetryDelayMs(result.failure, completedRetries);
    if (retryDelayMs === null) return result;
    completedRetries += 1;
    await new Promise((resolve) => window.setTimeout(resolve, retryDelayMs));
    if (!isLatestSegmentRecord(record)) return cancelledRemoteGrammarResult();
  }
}

function drainRemoteGrammarQueue() {
  while (state.remoteGrammarInFlight < 2 && state.remoteGrammarQueue.length) {
    const job = state.remoteGrammarQueue.shift();
    if (!isLatestSegmentRecord(job.record)) {
      job.resolve(cancelledRemoteGrammarResult());
      continue;
    }
    state.remoteGrammarInFlight += 1;
    requestRemoteGrammarIssues(job.record)
      .then(job.resolve, (error) => job.resolve(remoteGrammarFailureResult(
        classifyRemoteGrammarFailure(error)
      )))
      .finally(() => {
        state.remoteGrammarInFlight = Math.max(0, state.remoteGrammarInFlight - 1);
        drainRemoteGrammarQueue();
      });
  }
}

function scheduleRemoteGrammarCheck(record) {
  const promise = new Promise((resolve) => {
    state.remoteGrammarQueue.push({ record, resolve });
    drainRemoteGrammarQueue();
  });
  state.remoteGrammarPromises.add(promise);
  promise.finally(() => state.remoteGrammarPromises.delete(promise));
  return promise;
}

function publishSegmentRecord(record) {
  record.publishQueue = record.publishQueue.then(async () => {
    if (
      !record.localDone
      || !isLatestSegmentRecord(record)
      || !isLiveCompletedWritingSegment(elements.writingInput.value, record.segment)
    ) return;
    let rawIssues;
    try {
      rawIssues = mergeWritingGrammarIssues(
        record.segment.text,
        record.localIssues,
        record.remoteDone && Array.isArray(record.remoteIssues) ? record.remoteIssues : []
      );
    } catch (error) {
      console.warn("Grammar issue merge failed", error?.name || "unknown");
      rawIssues = mergeWritingGrammarIssues(record.segment.text, record.localIssues, []);
    }
    rawIssues = rawIssues.filter((issue) => !isBlockedInverseWritingGrammarIssue(
      issue,
      record.segment,
      record.context,
      state.appliedCorrections
    ));
    const issues = await Promise.all(rawIssues.map((issue) => (
      decorateIssue(issue, record.segment, record.context)
    )));
    if (
      !isLatestSegmentRecord(record)
      || !isLiveCompletedWritingSegment(elements.writingInput.value, record.segment)
    ) return;
    // A completed analysis is authoritative for this exact sentence revision.
    // Never carry cards forward from an older revision merely because their
    // ranges do not overlap: those cards may depend on grammar that an accepted
    // sibling correction has already changed.
    state.activeIssues = state.activeIssues.filter((issue) => !(
      issue.sentenceStart === record.segment.start && issue.sentenceEnd === record.segment.end
    ));
    state.activeIssues.push(...issues);
    state.activeIssues.sort((left, right) => (
      left.absoluteStart - right.absoluteStart || left.ruleId.localeCompare(right.ruleId)
    ));
    for (const issue of issues) queueOccurrence(issue);
    renderGrammarIssues();
  }).catch((error) => {
    console.warn("Grammar suggestions could not be displayed", error?.name || "unknown");
  });
  return record.publishQueue;
}

function finishSegmentRecord(record) {
  if (!record.localDone || !record.remoteDone || record.finished) return;
  record.finished = true;
  record.publishQueue.finally(() => {
    if (state.segmentChecks.get(record.key) === record) state.segmentChecks.delete(record.key);
    if (state.latestSegmentRecords.get(record.slotKey) === record) {
      state.latestSegmentRecords.delete(record.slotKey);
    }
    if (record.context.generation !== state.checkGeneration) return;
    state.pendingChecks = Math.max(0, state.pendingChecks - 1);
    renderGrammarIssues();
  });
}

async function runLocalSegmentCheck(record) {
  let localIssues = [];
  try {
    const checker = isLatestSegmentRecord(record) ? await prepareGrammarChecker() : null;
    if (checker && isLatestSegmentRecord(record)) {
      localIssues = await checker.check(record.segment.text);
    }
  } catch (error) {
    console.warn("Local sentence check failed", error?.name || "unknown");
  }
  record.localIssues = Array.isArray(localIssues) ? localIssues : [];
  record.localDone = true;
  await publishSegmentRecord(record);
  finishSegmentRecord(record);
}

function applyRemoteGrammarOutcome(record, result) {
  if (!isLatestSegmentRecord(record)) return;
  const failure = result?.failure;
  if (!failure) {
    state.remoteGrammarWarnings.delete(record.slotKey);
    state.remoteGrammarBackoffUntil = 0;
    state.remoteGrammarBackoffFailure = null;
    updateHarperStatus(
      "ready",
      "文法偵測已連線",
      "只傳送已完成的單句；題目、整篇草稿及學生身份不會送出"
    );
    return;
  }
  if (failure.kind === REMOTE_GRAMMAR_FAILURE_KINDS.cancelled) return;

  if (failure.shouldWarn) {
    state.remoteGrammarWarnings.set(record.slotKey, {
      kind: failure.kind,
      segment: {
        start: record.segment.start,
        end: record.segment.end,
        text: record.segment.text
      }
    });
  }
  if (failure.backoffMs > 0 && !result?.skipped) {
    state.remoteGrammarBackoffUntil = Date.now() + failure.backoffMs;
    state.remoteGrammarBackoffFailure = failure;
  }

  if (failure.globalStatus === "network") {
    updateHarperStatus(
      "error",
      "文法偵測暫時未能連線",
      "本機 ESL 規則及 Harper 後備檢查仍可使用"
    );
  } else if (failure.globalStatus === "timeout") {
    updateHarperStatus(
      "error",
      "文法偵測回應逾時",
      "為免重複計算，本次不會自動重試；本機後備檢查仍可使用"
    );
  } else if (failure.globalStatus === "provider_failure") {
    updateHarperStatus(
      "error",
      "文法偵測服務暫時故障",
      "系統只會在安全情況下重試一次；本機 ESL 規則及 Harper 後備檢查仍可使用"
    );
  } else if (failure.globalStatus === "rate_limited") {
    updateHarperStatus(
      "ready",
      "文法偵測稍後重試",
      "本機提示仍可使用；請稍候再完成下一次進階檢查"
    );
  } else if (failure.globalStatus === "quota_exhausted") {
    updateHarperStatus(
      "error",
      "文法偵測今日額度已用完",
      "額度會於香港時間 08:00 重設；本機 ESL 規則及 Harper 後備檢查仍可使用"
    );
  } else if (failure.globalStatus === "inconclusive") {
    updateHarperStatus(
      "ready",
      "未能安全判定這句文法",
      "沒有把未能確認的結果當作正確；本機提示仍然會保留"
    );
  }
}

async function runRemoteSegmentCheck(record) {
  const result = await scheduleRemoteGrammarCheck(record);
  record.remoteIssues = Array.isArray(result?.issues) ? result.issues : null;
  record.remoteFailure = result?.failure || null;
  record.remoteDone = true;
  applyRemoteGrammarOutcome(record, result);
  await publishSegmentRecord(record);
  finishSegmentRecord(record);
}

function enqueueSegmentsForCheck(segments, { remote = true } = {}) {
  if (!state.grammarDetectionEnabled) return;
  const validSegments = Array.isArray(segments) ? segments.filter(Boolean) : [];
  if (!validSegments.length) return;
  const context = captureCheckContext();
  for (const segment of validSegments) {
    if (segment.text.length > 10000) continue;
    const slotKey = segmentSlotKey(segment, context);
    const previousRecord = state.latestSegmentRecords.get(slotKey);
    if (
      previousRecord
      && !previousRecord.finished
      && previousRecord.segment.end === segment.end
      && previousRecord.segment.text === segment.text
    ) continue;
    if (previousRecord) {
      previousRecord.superseded = true;
      previousRecord.remoteController?.abort();
      if (state.segmentChecks.get(previousRecord.key) === previousRecord) {
        state.segmentChecks.delete(previousRecord.key);
      }
    }
    const revision = ++state.nextSegmentRevision;
    const key = segmentCheckKey(segment, context, revision);
    const record = {
      key,
      slotKey,
      revision,
      context,
      segment,
      superseded: false,
      remoteController: null,
      localDone: false,
      localIssues: [],
      remoteDone: !remote,
      remoteIssues: null,
      remoteFailure: null,
      publishQueue: Promise.resolve(),
      finished: false
    };
    state.segmentChecks.set(key, record);
    state.latestSegmentRecords.set(slotKey, record);
    state.pendingChecks += 1;
    state.checkQueue = state.checkQueue
      .then(() => runLocalSegmentCheck(record))
      .catch((error) => {
        console.warn("Queued local grammar check failed", error?.name || "unknown");
        record.localDone = true;
        finishSegmentRecord(record);
      });
    if (remote) runRemoteSegmentCheck(record).catch(() => {
      record.remoteDone = true;
      finishSegmentRecord(record);
    });
  }
  renderGrammarIssues();
}

function currentRemoteGrammarWarnings() {
  for (const [key, warning] of state.remoteGrammarWarnings) {
    if (!isLiveCompletedWritingSegment(elements.writingInput.value, warning.segment)) {
      state.remoteGrammarWarnings.delete(key);
    }
  }
  return [...state.remoteGrammarWarnings.values()];
}

function grammarReviewWarningContent(warnings, hasVisibleIssues) {
  const notice = writingGrammarReviewNotice(
    warnings.map((warning) => warning.kind),
    hasVisibleIssues ? 1 : 0
  );
  const wrapper = createElement("div", "grammar-empty");
  wrapper.dataset.state = notice.state;
  wrapper.append(createElement("span", "", "!"));
  wrapper.append(createElement("strong", "", notice.title));
  wrapper.append(createElement("p", "", notice.detail));
  return wrapper;
}

function grammarEmptyContent() {
  const wrapper = createElement("div", "grammar-empty");
  if (!state.grammarDetectionEnabled) {
    wrapper.append(createElement("span", "", "○"));
    wrapper.append(createElement("strong", "", "文法偵測已關閉"));
    wrapper.append(createElement("p", "", "不會傳送或檢查句子。重新開啟後，系統會由目前文章的第一句開始掃描。"));
    return wrapper;
  }
  const icon = state.pendingChecks > 0 || state.checkerState === "loading"
    ? "…"
    : state.checkerState === "error" ? "!" : "i";
  wrapper.append(createElement("span", "", icon));
  if (state.pendingChecks > 0) {
    wrapper.append(createElement("strong", "", "正在檢查完整句子"));
    wrapper.append(createElement("p", "", "文法偵測及本機後備規則正在整理建議，請稍候。"));
  } else if (state.checkerState === "loading") {
    wrapper.append(createElement("strong", "", "正在準備文法偵測"));
    wrapper.append(createElement("p", "", "您可以先開始寫作；完整句子會排隊檢查。"));
  } else if (state.checkerState === "error") {
    wrapper.append(createElement("strong", "", "文法偵測暫時未能連線"));
    wrapper.append(createElement("p", "", "本機後備檢查、寫作及提交功能不受影響。"));
  } else {
    wrapper.append(createElement("strong", "", "暫未偵測到高信心文法問題"));
    wrapper.append(createElement("p", "", "這不代表句子完全正確；文法偵測可能遺漏問題。"));
  }
  return wrapper;
}

function grammarIssueSourceLabel(issue) {
  if (issue.reviewRequired) return "需老師覆核";
  if (issue.engine?.name === "edmund-approved-grammar-corpus") return "Edmund Sir 已審核文法庫";
  if (issue.engine?.name === "cloudflare-workers-ai") return "Edmund 文法偵測";
  if (issue.engine?.name === "edmund-esl-basics") return "Edmund 本機規則";
  if (issue.engine?.name === "harper.js") return "Harper 額外校對";
  return "文法偵測";
}

function renderGrammarIssues() {
  syncGrammarDetectionControls();
  const visible = state.activeIssues.filter((issue) => !state.dismissedIssueIds.has(issue.id));
  const warnings = currentRemoteGrammarWarnings();
  elements.issueCount.textContent = String(visible.length);
  if (!visible.length) {
    elements.grammarList.replaceChildren(
      warnings.length && state.pendingChecks === 0
        ? grammarReviewWarningContent(warnings, false)
        : grammarEmptyContent()
    );
    return;
  }
  const fragment = document.createDocumentFragment();
  if (warnings.length) fragment.append(grammarReviewWarningContent(warnings, true));
  for (const issue of visible) {
    const card = createElement("article", "grammar-card");
    if (issue.reviewRequired) card.dataset.review = "true";
    const head = createElement("div", "grammar-card-head");
    const sourceLabel = grammarIssueSourceLabel(issue);
    head.append(createElement("strong", "", issue.title), createElement("span", "", sourceLabel));
    const body = createElement("div", "grammar-card-body");

    const problem = createElement("p", "grammar-fragment");
    problem.append(document.createTextNode(issue.sentenceText.slice(0, issue.start)));
    problem.append(createElement("mark", "", issue.sentenceText.slice(issue.start, issue.end) || issue.originalText));
    problem.append(document.createTextNode(issue.sentenceText.slice(issue.end)));

    const replacement = createElement("div", "grammar-replacement");
    if (issue.reviewRequired) {
      replacement.append(
        createElement("small", "", "需要人工覆核"),
        createElement("p", "", "此句不適合自動改寫，請交由老師確認。")
      );
    } else {
      replacement.append(
        createElement("small", "", "此項局部修正後（句內仍可能有其他問題）"),
        createElement("p", "", issue.correctedSentence)
      );
    }
    const explanation = createElement("div", "grammar-explanation");
    explanation.append(createElement("small", "", "Explanation"), createElement("p", "", issue.message));
    const actions = createElement("div", "grammar-actions");
    const apply = createElement("button", "apply-suggestion", "套用建議");
    apply.type = "button";
    apply.dataset.applyIssue = issue.id;
    if (!issue.suggestedText || issue.correctedSentence === issue.sentenceText) apply.disabled = true;
    const dismiss = createElement("button", "dismiss-suggestion", "暫時略過");
    dismiss.type = "button";
    dismiss.dataset.dismissIssue = issue.id;
    actions.append(apply, dismiss);
    body.append(problem, replacement, explanation, actions);
    card.append(head, body);
    fragment.append(card);
  }
  elements.grammarList.replaceChildren(fragment);
}

function scheduleManualGrammarRecheck(previousValue, nextValue) {
  if (!state.grammarDetectionEnabled) return;
  window.clearTimeout(state.manualRecheckTimer);
  state.manualRecheckTimer = null;
  const change = insertedRange(previousValue, nextValue);
  const rangeEnd = Math.min(nextValue.length, Math.max(change.end, change.start + 1));
  const affected = completedWritingSegmentsOverlappingRange(nextValue, change.start, rangeEnd);
  if (!affected.length) return;
  const context = captureCheckContext();
  state.manualRecheckTimer = window.setTimeout(() => {
    state.manualRecheckTimer = null;
    if (!isCurrentCheckContext(context)) return;
    const live = affected.filter((segment) => (
      isLiveCompletedWritingSegment(elements.writingInput.value, segment)
    ));
    if (live.length) enqueueSegmentsForCheck(live);
  }, 650);
}

function handleWritingInput() {
  const nextValue = elements.writingInput.value;
  const previousValue = state.previousWriting;
  markWritingActivity();
  if (!state.grammarDetectionEnabled) {
    state.previousWriting = nextValue;
    updateEditorMetrics();
    scheduleDraftSave();
    renderGrammarIssues();
    return;
  }
  supersedeSegmentRecordsAffectedByEdit(previousValue, nextValue);
  rebaseAppliedCorrections(previousValue, nextValue);
  rebaseActiveIssues(previousValue, nextValue);
  const segments = newlyCompletedWritingSegments(previousValue, nextValue);
  const immediateSegments = segments.length
    ? [...new Map([
      ...segments,
      ...completedWritingSegmentsAffectedByEdit(previousValue, nextValue)
    ].map((segment) => [`${segment.start}:${segment.end}:${segment.text}`, segment])).values()]
    : [];
  state.previousWriting = nextValue;
  updateEditorMetrics();
  scheduleDraftSave();
  renderGrammarIssues();
  if (immediateSegments.length) {
    window.clearTimeout(state.manualRecheckTimer);
    state.manualRecheckTimer = null;
    enqueueSegmentsForCheck(immediateSegments);
  } else {
    scheduleManualGrammarRecheck(previousValue, nextValue);
  }
}

function applyGrammarIssue(issueId) {
  const issue = state.activeIssues.find((candidate) => candidate.id === issueId);
  if (!issue) return;
  const current = elements.writingInput.value;
  if (current.slice(issue.sentenceStart, issue.sentenceEnd) !== issue.sentenceText) {
    showToast("文章已經改動；請在句尾再輸入句號或分號重新檢查。", "error");
    state.activeIssues = state.activeIssues.filter((candidate) => candidate.id !== issueId);
    renderGrammarIssues();
    return;
  }
  const next = `${current.slice(0, issue.sentenceStart)}${issue.correctedSentence}${current.slice(issue.sentenceEnd)}`;
  supersedeSegmentRecordsAffectedByEdit(current, next);
  rebaseAppliedCorrections(current, next);
  rememberAppliedCorrection(issue);
  state.activeIssues = rebaseWritingGrammarIssuesAfterAppliedCorrection(state.activeIssues, issue);
  const hasRemainingSentenceIssues = hasWritingGrammarIssuesForSentence(
    state.activeIssues,
    issue.sentenceStart,
    issue.correctedSentence
  );
  state.dismissedIssueIds.clear();
  elements.writingInput.value = next;
  state.previousWriting = next;
  updateEditorMetrics();
  scheduleDraftSave();
  renderGrammarIssues();
  // The remote grammar checker returns one coherent correction batch. Let the student finish that
  // batch before checking the resulting sentence again; otherwise responses
  // for intermediate sentence versions can mix with the still-visible cards.
  if (!hasRemainingSentenceIssues) {
    const replacementEnd = issue.sentenceStart + issue.correctedSentence.length;
    const updatedSegments = completedWritingSegmentsOverlappingRange(next, issue.sentenceStart, replacementEnd);
    if (updatedSegments.length) enqueueSegmentsForCheck(updatedSegments);
  }
  showToast("已套用建議；原有問題種類已保留在您的記錄。", "success");
}

function dismissGrammarIssue(issueId) {
  state.dismissedIssueIds.add(issueId);
  renderGrammarIssues();
}

function normalizeSubmission(value) {
  return {
    id: String(value?.id || value?.submissionId || ""),
    studentId: String(value?.studentId || value?.student_id || ""),
    studentName: String(value?.studentName || value?.student_name || ""),
    topic: String(value?.topic || "未命名題目"),
    answer: String(value?.answer || value?.content || ""),
    wordCount: Number(value?.wordCount ?? value?.word_count ?? countEnglishWords(value?.answer || value?.content || "")),
    durationSeconds: Number(value?.durationSeconds ?? value?.duration_seconds ?? 0),
    submittedAt: String(value?.submittedAt || value?.submitted_at || value?.createdAt || value?.created_at || ""),
    occurrenceCount: Number(value?.occurrenceCount ?? value?.occurrence_count ?? 0),
    deletedAt: value?.deletedAt || value?.deleted_at ? String(value.deletedAt || value.deleted_at) : ""
  };
}

function submissionArray(payload) {
  const source = Array.isArray(payload) ? payload : payload?.submissions;
  return Array.isArray(source) ? source.map(normalizeSubmission).filter((item) => item.id) : [];
}

function normalizeWritingProgressRow(value) {
  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(value?.date || "")) ? String(value.date) : "",
    articlesWritten: Math.max(0, Number(value?.articlesWritten || 0)),
    timeSpentSeconds: Math.max(0, Number(value?.timeSpentSeconds || 0)),
    averageSeconds: Math.max(0, Number(value?.averageSeconds || 0)),
    cumulativeArticles: Math.max(0, Number(value?.cumulativeArticles || 0)),
    cumulativeTimeSeconds: Math.max(0, Number(value?.cumulativeTimeSeconds || 0))
  };
}

function createSvgElement(tag, attributes = {}, text = "") {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
  if (text !== "") node.textContent = String(text);
  return node;
}

function renderWritingProgressChart(container, rows, valueKey, formatValue) {
  if (!container) return;
  if (!rows.length) {
    container.replaceChildren(createElement("p", "submission-progress-empty", "提交第一篇文章後，進度會在這裡出現。"));
    return;
  }
  const width = 720;
  const height = 180;
  const left = 48;
  const right = 18;
  const top = 14;
  const bottom = 32;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const values = rows.map(row => Math.max(0, Number(row[valueKey] || 0)));
  const maximum = Math.max(1, ...values);
  const x = index => left + (rows.length === 1 ? plotWidth / 2 : (index / (rows.length - 1)) * plotWidth);
  const y = value => top + plotHeight - (value / maximum) * plotHeight;
  const svg = createSvgElement("svg", { viewBox: `0 0 ${width} ${height}`, role: "img" });
  const title = createSvgElement("title", {}, `${rows[0].date} 至 ${rows.at(-1).date} 的進度`);
  svg.append(title);
  for (let step = 0; step <= 4; step += 1) {
    const value = maximum * (step / 4);
    const yPosition = y(value);
    svg.append(
      createSvgElement("line", { x1: left, y1: yPosition, x2: width - right, y2: yPosition, class: "chart-grid" }),
      createSvgElement("text", { x: left - 7, y: yPosition + 3, "text-anchor": "end" }, formatValue(value))
    );
  }
  const points = values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const areaPoints = `${left},${top + plotHeight} ${points} ${width - right},${top + plotHeight}`;
  svg.append(
    createSvgElement("polygon", { points: areaPoints, class: "chart-area" }),
    createSvgElement("polyline", { points, class: "chart-line" })
  );
  values.forEach((value, index) => {
    const point = createSvgElement("circle", { cx: x(index), cy: y(value), r: 4, class: "chart-point", tabindex: 0 });
    point.append(createSvgElement("title", {}, `${rows[index].date}：${formatValue(value)}`));
    svg.append(point);
  });
  const labelIndexes = [...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])];
  for (const index of labelIndexes) {
    svg.append(createSvgElement("text", {
      x: x(index),
      y: height - 8,
      "text-anchor": index === 0 ? "start" : index === rows.length - 1 ? "end" : "middle"
    }, rows[index].date.slice(5)));
  }
  container.replaceChildren(svg);
}

function renderWritingProgress() {
  const rows = state.writingProgress;
  const latest = rows.at(-1);
  const totalArticles = latest?.cumulativeArticles || 0;
  const totalSeconds = latest?.cumulativeTimeSeconds || 0;
  elements.writingArticleTotal.textContent = String(totalArticles);
  elements.writingTimeTotal.textContent = formatCompactDuration(totalSeconds);
  elements.writingAverageTime.textContent = formatCompactDuration(totalArticles ? totalSeconds / totalArticles : 0);
  renderWritingProgressChart(elements.writingArticlesChart, rows, "cumulativeArticles", value => String(Math.round(value)));
  renderWritingProgressChart(elements.writingTimeChart, rows, "cumulativeTimeSeconds", formatCompactDuration);
  renderWritingProgressChart(elements.writingAverageChart, rows, "averageSeconds", formatCompactDuration);
}

async function loadWritingProgress() {
  const payload = await apiJson("/v1/progress");
  const source = Array.isArray(payload) ? payload : payload?.progress;
  state.writingProgress = Array.isArray(source)
    ? source.map(normalizeWritingProgressRow).filter(row => row.date)
    : [];
  renderWritingProgress();
}

async function fetchAllSubmissionPages(path, { pageSize = 100, maximumPages = 20 } = {}) {
  const submissions = [];
  for (let page = 1; page <= maximumPages; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const payload = await apiJson(`${path}${separator}page=${page}&pageSize=${pageSize}`);
    submissions.push(...submissionArray(payload));
    if (!payload?.hasMore) return submissions;
  }
  showToast("文章記錄很多；目前先顯示最近一批。", "error");
  return submissions;
}

function syncSubmissionExportControls() {
  if (!elements.exportSelectAll) return;
  const availableIds = new Set(state.submissions.map(item => item.id));
  for (const id of state.selectedExportSubmissionIds) {
    if (!availableIds.has(id)) state.selectedExportSubmissionIds.delete(id);
  }
  const selectedCount = state.selectedExportSubmissionIds.size;
  elements.exportSelectedCount.textContent = `已選 ${selectedCount} 篇`;
  elements.exportSelectAll.checked = Boolean(state.submissions.length && selectedCount === state.submissions.length);
  elements.exportSelectAll.indeterminate = selectedCount > 0 && selectedCount < state.submissions.length;
  elements.exportSelectAll.disabled = state.exportInFlight || !state.submissions.length;
  elements.exportSelectedSubmissions.disabled = state.exportInFlight || selectedCount < 1;
  elements.exportAllSubmissions.disabled = state.exportInFlight || !state.submissions.length;
}

function escapePrintHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

async function fetchOwnSubmissionDetail(id) {
  const normalizedId = String(id || "");
  if (!UUID_RE.test(normalizedId) || !state.submissions.some(item => item.id === normalizedId)) {
    throw new Error("文章不屬於目前登入帳戶。");
  }
  const payload = await apiJson(`/v1/submissions/${encodeURIComponent(normalizedId)}`);
  return normalizeSubmission(payload?.submission || payload);
}

async function mapWithConcurrency(values, mapper, concurrency = 4) {
  const results = new Array(values.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = { status: "fulfilled", value: await mapper(values[index], index) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

function writingExportHtml(submissions, { failedCount = 0 } = {}) {
  const generatedAt = new Intl.DateTimeFormat("zh-HK", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Hong_Kong"
  }).format(new Date());
  const articles = submissions.map((submission, index) => `
    <article class="composition">
      <header>
        <p class="sequence">ARTICLE ${index + 1} / ${submissions.length}</p>
        <h1>我的文章 ${index + 1}</h1>
        <div class="meta">
          <span>${escapePrintHtml(formatSubmissionDate(submission.submittedAt))}</span>
          <span>${escapePrintHtml(`${submission.wordCount} words`)}</span>
          <span>${escapePrintHtml(`寫作用時：${formatCompactDuration(submission.durationSeconds)}`)}</span>
        </div>
      </header>
      <section class="topic"><strong>寫作題目</strong><p>${escapePrintHtml(submission.topic)}</p></section>
      <section class="answer"><strong>文章內容</strong><div>${escapePrintHtml(submission.answer || "（文章內容為空）")}</div></section>
    </article>`).join("");
  return `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>EdmundEducation－我的文章</title>
<style>
  *{box-sizing:border-box} body{margin:0;color:#242342;background:#eee;font-family:Georgia,"Times New Roman","Noto Serif TC",serif}
  .print-toolbar{position:sticky;top:0;z-index:5;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#fff;background:#272757;font-family:system-ui,sans-serif}
  .print-toolbar p{margin:0;font-size:13px}.print-toolbar button{border:0;border-radius:999px;padding:10px 16px;color:#272757;background:#fff;cursor:pointer;font-weight:800}
  main{width:min(900px,calc(100% - 28px));margin:26px auto}.composition{margin:0 0 28px;padding:44px 48px;background:#fff;box-shadow:0 12px 38px rgba(20,20,50,.12);break-after:page}
  .composition:last-child{break-after:auto}.sequence{margin:0 0 8px;color:#bd571b;font:800 11px system-ui,sans-serif;letter-spacing:.13em}
  h1{margin:0 0 14px;font-size:27px;line-height:1.35}.meta{display:flex;flex-wrap:wrap;gap:7px 14px;color:#66637c;font:12px system-ui,sans-serif}
  section{margin-top:26px}.topic{border-left:5px solid #e87b2c;padding:14px 18px;background:#fff6e8}.topic strong,.answer>strong{display:block;margin-bottom:8px;color:#bd571b;font:800 11px system-ui,sans-serif;letter-spacing:.08em}
  .topic p{margin:0;font-size:16px;line-height:1.65;white-space:pre-wrap}.answer div{font-size:17px;line-height:1.85;white-space:pre-wrap;overflow-wrap:anywhere}
  @media(max-width:600px){.composition{padding:27px 22px}h1{font-size:22px}}
  @media print{@page{size:A4;margin:16mm}.print-toolbar{display:none!important}body{background:#fff}main{width:auto;margin:0}.composition{margin:0;padding:0;box-shadow:none}.composition header{padding-bottom:12px;border-bottom:1px solid #ddd}}
</style></head><body>
<div class="print-toolbar"><p>已準備 ${submissions.length} 篇文章${failedCount ? `；${failedCount} 篇未能載入` : ""} · ${escapePrintHtml(generatedAt)}</p><button type="button" id="print-compositions">列印／儲存為 PDF</button></div>
<main>${articles}</main></body></html>`;
}

async function exportStudentSubmissions(ids) {
  if (state.user?.role !== "student" || state.exportInFlight) return;
  const availableIds = new Set(state.submissions.map(item => item.id));
  const requestedIds = [...new Set(ids.map(id => String(id || "")))]
    .filter(id => UUID_RE.test(id) && availableIds.has(id));
  if (!requestedIds.length) {
    showToast("請先選擇最少一篇文章。", "error");
    return;
  }
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("瀏覽器已封鎖匯出視窗；請允許彈出式視窗後再試。", "error");
    return;
  }
  try { printWindow.opener = null; } catch { /* Some browsers make opener read-only. */ }
  printWindow.document.open();
  printWindow.document.write("<!doctype html><html lang=\"zh-Hant\"><meta charset=\"utf-8\"><title>正在準備文章</title><body style=\"font-family:system-ui;padding:32px\">正在安全載入您的文章……</body></html>");
  printWindow.document.close();
  state.exportInFlight = true;
  syncSubmissionExportControls();
  try {
    const results = await mapWithConcurrency(requestedIds, fetchOwnSubmissionDetail, 4);
    const submissions = results.filter(result => result.status === "fulfilled").map(result => result.value);
    const failedCount = results.length - submissions.length;
    if (!submissions.length) throw new Error("未能載入所選文章。");
    if (printWindow.closed) throw new Error("匯出視窗已關閉。");
    printWindow.document.open();
    printWindow.document.write(writingExportHtml(submissions, { failedCount }));
    printWindow.document.close();
    const printButton = printWindow.document.querySelector("#print-compositions");
    printButton?.addEventListener("click", () => printWindow.print());
    window.setTimeout(() => {
      try { printWindow.focus(); printWindow.print(); } catch { /* The visible print button remains available. */ }
    }, 350);
    showToast(failedCount
      ? `已準備 ${submissions.length} 篇文章；${failedCount} 篇暫時未能載入。`
      : `已準備 ${submissions.length} 篇文章供列印或儲存 PDF。`, failedCount ? "error" : "success");
  } catch (error) {
    console.warn("Writing submission export failed", error);
    if (!printWindow.closed) {
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;padding:32px"><h1>暫時未能匯出文章</h1><p>${escapePrintHtml(error.message || "請稍後再試。")}</p></body>`);
      printWindow.document.close();
    }
    showToast(error.message || "暫時未能匯出文章。", "error");
  } finally {
    state.exportInFlight = false;
    syncSubmissionExportControls();
  }
}

function renderSubmissionList() {
  if (!state.submissions.length) {
    elements.submissionList.replaceChildren(emptyState("尚未有已提交文章。"));
    syncSubmissionExportControls();
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const submission of state.submissions) {
    const row = createElement("article", "submission-list-item");
    if (state.selectedSubmissionId === submission.id) row.classList.add("is-current");
    const selection = createElement("label", "submission-export-checkbox");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.exportSubmissionId = submission.id;
    checkbox.checked = state.selectedExportSubmissionIds.has(submission.id);
    const selectionLabel = createElement("span", "sr-only", `選取文章：${submission.topic}`);
    selection.append(checkbox, selectionLabel);
    const button = createElement("button", "submission-row");
    button.type = "button";
    button.dataset.submissionId = submission.id;
    button.setAttribute("aria-current", String(state.selectedSubmissionId === submission.id));
    button.append(
      createElement("strong", "", submission.topic),
      createElement("span", "", `${formatSubmissionDate(submission.submittedAt)} · ${submission.wordCount} words · ${formatCompactDuration(submission.durationSeconds)}`)
    );
    row.append(selection, button);
    fragment.append(row);
  }
  elements.submissionList.replaceChildren(fragment);
  syncSubmissionExportControls();
}

function renderSubmissionDetail(submission, container = elements.submissionDetail, admin = false) {
  const header = createElement("header", "submission-detail-head");
  header.append(createElement("h2", "", submission.topic));
  const meta = createElement("div", "submission-meta");
  if (admin && submission.studentName) meta.append(createElement("span", "", `學生：${submission.studentName}`));
  meta.append(
    createElement("span", "", formatSubmissionDate(submission.submittedAt)),
    createElement("span", "", `${submission.wordCount} words`),
    createElement("span", "", `寫作用時：${formatCompactDuration(submission.durationSeconds)}`)
  );
  if (submission.occurrenceCount) meta.append(createElement("span", "", `${submission.occurrenceCount} 個文法偵測結果`));
  if (admin && submission.deletedAt) meta.append(createElement("span", "deleted-submission-badge", "學生已從個人文章列表刪除"));
  header.append(meta);
  if (!admin) {
    const actions = createElement("div", "submission-detail-actions");
    const exportButton = createElement("button", "export-submission-button", "匯出這篇文章");
    exportButton.type = "button";
    exportButton.dataset.exportSubmission = submission.id;
    const remove = createElement("button", "delete-submission-button", "刪除這篇文章");
    remove.type = "button";
    remove.dataset.deleteSubmission = submission.id;
    actions.append(exportButton, remove);
    header.append(actions);
  }
  const content = createElement("div", "submission-content", submission.answer || "（文章內容為空）");
  container.replaceChildren(header, content);
}

async function loadSubmissions({ selectId = "" } = {}) {
  elements.submissionList.replaceChildren(loadingState("正在載入文章…"));
  state.submissions = await fetchAllSubmissionPages("/v1/submissions");
  const availableIds = new Set(state.submissions.map(item => item.id));
  for (const id of state.selectedExportSubmissionIds) {
    if (!availableIds.has(id)) state.selectedExportSubmissionIds.delete(id);
  }
  renderSubmissionList();
  if (selectId) await openSubmission(selectId);
}

async function openSubmission(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  state.selectedSubmissionId = String(id);
  renderSubmissionList();
  elements.submissionDetail.replaceChildren(loadingState("正在載入文章內容…"));
  try {
    const payload = await apiJson(`/v1/submissions/${encodeURIComponent(id)}`);
    const submission = normalizeSubmission(payload?.submission || payload);
    if (Array.isArray(payload?.grammarOccurrences)) submission.occurrenceCount = payload.grammarOccurrences.length;
    renderSubmissionDetail(submission);
  } catch (error) {
    elements.submissionDetail.replaceChildren(emptyState(error.message || "未能載入文章。"));
  }
}

async function openSubmissions() {
  showView("submissions");
  await Promise.all([loadSubmissions(), loadWritingProgress()]);
}

async function openGrammarSourceSubmission(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  showView("submissions");
  await Promise.all([loadSubmissions({ selectId: id }), loadWritingProgress()]);
}

async function deleteStudentSubmission(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  const submission = state.submissions.find(item => item.id === id);
  const confirmed = window.confirm(`確定要從「我的文章」刪除「${submission?.topic || "這篇文章"}」嗎？文法問題記錄仍會保留給管理員。`);
  if (!confirmed) return;
  try {
    await apiJson(`/v1/submissions/${encodeURIComponent(id)}`, { method: "DELETE" });
    state.selectedExportSubmissionIds.delete(id);
    state.selectedSubmissionId = "";
    elements.submissionDetail.replaceChildren(emptyState("文章已從您的個人列表刪除；管理員仍可查看保存記錄。"));
    await Promise.all([loadSubmissions(), loadWritingProgress()]);
    showToast("文章已從您的個人列表刪除。", "success");
  } catch (error) {
    console.warn("Writing submission deletion failed", error);
    showToast(error.message || "暫時未能刪除文章。", "error");
  }
}

async function submitCurrentWriting({ source = "manual" } = {}) {
  if (state.submissionPromise) return state.submissionPromise;
  const topic = elements.topicInput.value.trim();
  const answer = elements.writingInput.value.trim();
  if (!topic || !answer) throw new Error("請先輸入寫作題目及文章內容。");
  accrueWritingTime();
  if (!UUID_RE.test(state.documentId)) state.documentId = newDocumentId();
  const submittedDocumentId = state.documentId;
  if (!Number.isSafeInteger(state.submissionDurationSeconds)) {
    state.submissionDurationSeconds = Math.max(0, Math.round(state.draftDurationSeconds));
    persistDraft();
  }
  const submittedDurationSeconds = state.submissionDurationSeconds;
  const submissionTask = (async () => {
    if (source === "timer") {
      setStatus(elements.submissionStatus, "時間已到，正在自動提交文章…");
      await Promise.race([
        state.checkQueue,
        new Promise((resolve) => window.setTimeout(resolve, 2000))
      ]);
    } else {
      setStatus(elements.submissionStatus, "正在安全保存文章…");
      await state.checkQueue;
    }
    const remoteChecks = [...state.remoteGrammarPromises];
    if (remoteChecks.length) {
      await Promise.race([
        Promise.allSettled(remoteChecks),
        new Promise((resolve) => window.setTimeout(resolve, source === "timer" ? 900 : 1500))
      ]);
    }
    const payload = await apiJson(`/v1/submissions/${encodeURIComponent(submittedDocumentId)}`, {
      method: "PUT",
      body: JSON.stringify({
        topic,
        answer,
        durationSeconds: submittedDurationSeconds
      })
    });
    const saved = normalizeSubmission(payload?.submission || payload);
    const submittedId = saved.id || submittedDocumentId;
    clearStoredDraft();
    setStatus(elements.submissionStatus, source === "timer" ? "時間已到；文章已自動提交及保存。" : "文章已提交及保存。", "success");
    showToast(source === "timer" ? "時間已到，文章已自動提交。" : "文章已成功提交。", "success");
    flushGrammarOccurrences().catch((error) => {
      console.warn("Grammar history will retry after submission", error);
      scheduleOccurrenceFlush();
    });
    startNewDraft({ preserveView: true });
    await openSubmissions();
    await openSubmission(submittedId);
    return submittedId;
  })();
  state.submissionPromise = submissionTask;
  elements.submitWriting.disabled = true;
  syncWritingTimerUi();
  try {
    return await submissionTask;
  } finally {
    state.submissionPromise = null;
    elements.submitWriting.disabled = false;
    syncWritingTimerUi();
    if (
      state.writingTimer.status === "expired"
      && state.writingTimer.forceSubmit
      && !state.writingTimer.autoSubmitAttemptedAt
    ) {
      window.setTimeout(() => attemptTimerForceSubmission(), 0);
    }
  }
}

async function submitWriting(event) {
  event.preventDefault();
  try {
    await submitCurrentWriting({ source: "manual" });
  } catch (error) {
    console.warn("Writing submission failed", error);
    setStatus(elements.submissionStatus, error.message || "未能保存文章，請再試一次。", "error");
  }
}

function normalizeGrammarProblem(value) {
  return {
    ruleId: String(value?.ruleId || value?.rule_id || "UnknownRule"),
    title: String(value?.title || value?.ruleTitle || value?.rule_title || value?.ruleId || value?.rule_id || "文法問題"),
    message: String(value?.message || value?.lastMessage || value?.last_message || ""),
    count: Number(value?.count ?? value?.occurrenceCount ?? value?.occurrence_count ?? 0),
    firstSeenAt: String(value?.firstSeenAt || value?.first_seen_at || ""),
    lastSeenAt: String(value?.lastSeenAt || value?.last_seen_at || ""),
    occurrences: [],
    occurrencePage: 0,
    occurrenceHasMore: false,
    occurrencesLoaded: false,
    occurrencesLoading: false,
    open: false
  };
}

function correctedHistorySentence(value) {
  const explicit = String(value?.correctedSentence || value?.corrected_sentence || "");
  if (explicit) return explicit;
  const sentence = String(value?.sentenceText || value?.sentence_text || "");
  const original = String(value?.originalText || value?.original_text || "");
  const suggested = String(value?.suggestedText || value?.suggested_text || "");
  const index = original ? sentence.indexOf(original) : -1;
  if (index < 0) return sentence;
  return `${sentence.slice(0, index)}${suggested}${sentence.slice(index + original.length)}`;
}

function normalizeGrammarOccurrence(value) {
  return {
    id: String(value?.id || ""),
    documentId: String(value?.documentId || value?.document_id || ""),
    submissionId: String(value?.submissionId || value?.submission_id || ""),
    ruleId: String(value?.ruleId || value?.rule_id || "UnknownRule"),
    title: String(value?.title || value?.ruleTitle || value?.rule_title || "文法問題"),
    message: String(value?.message || ""),
    originalText: String(value?.originalText || value?.original_text || ""),
    suggestedText: String(value?.suggestedText || value?.suggested_text || ""),
    sentenceText: String(value?.sentenceText || value?.sentence_text || ""),
    correctedSentence: correctedHistorySentence(value),
    detectedAt: String(value?.detectedAt || value?.detected_at || ""),
    sourceTopic: String(value?.sourceTopic || value?.source_topic || ""),
    sourceSubmittedAt: String(value?.sourceSubmittedAt || value?.source_submitted_at || ""),
    sourceDeletedAt: String(value?.sourceDeletedAt || value?.source_deleted_at || ""),
    studentId: String(value?.studentId || value?.student_id || ""),
    studentName: String(value?.studentName || value?.student_name || "")
  };
}

function appendHighlightedOccurrenceSentence(container, sentence, fragment) {
  const fullSentence = String(sentence || "");
  const issueFragment = String(fragment || "");
  const index = issueFragment ? fullSentence.indexOf(issueFragment) : -1;
  if (index < 0) {
    container.textContent = fullSentence;
    return;
  }
  container.append(
    document.createTextNode(fullSentence.slice(0, index)),
    createElement("mark", "", issueFragment),
    document.createTextNode(fullSentence.slice(index + issueFragment.length))
  );
}

function createGrammarHistoryCard(occurrence, { admin = false } = {}) {
  const card = createElement("article", "grammar-history-card");
  const head = createElement("header", "grammar-history-card-head");
  head.append(
    createElement("strong", "", occurrence.title),
    createElement("time", "", formatSubmissionDate(occurrence.detectedAt))
  );
  if (admin && occurrence.studentName) {
    head.append(createElement("span", "grammar-history-student", occurrence.studentName));
  }
  if (admin && occurrence.ruleId) {
    head.append(createElement("span", "grammar-history-rule", occurrence.ruleId));
  }

  const original = createElement("p", "grammar-history-original");
  appendHighlightedOccurrenceSentence(original, occurrence.sentenceText, occurrence.originalText);

  const replacement = createElement("div", "grammar-history-replacement");
  replacement.append(
    createElement("small", "", "此項局部修正後（句內仍可能有其他問題）"),
    createElement("p", "", occurrence.correctedSentence || occurrence.sentenceText)
  );

  const explanation = createElement("div", "grammar-history-explanation");
  explanation.append(
    createElement("small", "", "Explanation"),
    createElement("p", "", occurrence.message || "（未有解釋）")
  );

  const source = createElement("footer", "grammar-history-source");
  const sourceLabel = occurrence.sourceTopic
    ? `來源文章：${occurrence.sourceTopic}${occurrence.sourceDeletedAt ? "（已從我的文章刪除）" : ""}`
    : "來源：尚未提交的寫作草稿";
  const sourceMeta = createElement("span", "", occurrence.sourceSubmittedAt
    ? `${sourceLabel} · ${formatSubmissionDate(occurrence.sourceSubmittedAt)}`
    : sourceLabel);
  source.append(sourceMeta);
  if (occurrence.submissionId && (admin || !occurrence.sourceDeletedAt)) {
    const sourceButton = createElement("button", "grammar-history-source-button", "開啟來源文章");
    sourceButton.type = "button";
    if (admin) sourceButton.dataset.adminGrammarSourceSubmission = occurrence.submissionId;
    else sourceButton.dataset.grammarSourceSubmission = occurrence.submissionId;
    source.append(sourceButton);
  }

  card.append(head, original, replacement, explanation, source);
  return card;
}

function grammarProblemOccurrenceContainer(index) {
  return document.querySelector(`[data-grammar-problem-occurrences="${index}"]`);
}

function renderGrammarProblemOccurrences(problem, index) {
  const container = grammarProblemOccurrenceContainer(index);
  if (!container) return;
  if (problem.occurrencesLoading && !problem.occurrences.length) {
    container.replaceChildren(loadingState("正在載入每次問題的完整記錄…"));
    return;
  }
  if (!problem.occurrences.length) {
    container.replaceChildren(emptyState("這個舊有分類暫時只有總數，未有可顯示的完整句子記錄。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const occurrence of problem.occurrences) {
    fragment.append(createGrammarHistoryCard(occurrence));
  }
  if (problem.occurrenceHasMore) {
    const more = createElement("button", "secondary-button grammar-history-more", "顯示更多記錄");
    more.type = "button";
    more.dataset.loadGrammarProblem = String(index);
    more.disabled = problem.occurrencesLoading;
    fragment.append(more);
  }
  container.replaceChildren(fragment);
}

async function loadGrammarProblemOccurrences(index, { reset = false } = {}) {
  const problem = state.grammarProblems[index];
  if (!problem || problem.occurrencesLoading) return;
  problem.occurrencesLoading = true;
  if (reset) {
    problem.occurrences = [];
    problem.occurrencePage = 0;
    problem.occurrenceHasMore = false;
  }
  renderGrammarProblemOccurrences(problem, index);
  try {
    const page = problem.occurrencePage + 1;
    const query = new URLSearchParams({
      ruleId: problem.ruleId,
      page: String(page),
      pageSize: "25"
    });
    const payload = await apiJson(`/v1/grammar-problem-occurrences?${query}`);
    const source = Array.isArray(payload) ? payload : payload?.grammarOccurrences;
    const next = Array.isArray(source) ? source.map(normalizeGrammarOccurrence) : [];
    const known = new Set(problem.occurrences.map(item => item.id));
    problem.occurrences.push(...next.filter(item => item.id && !known.has(item.id)));
    problem.occurrencePage = page;
    problem.occurrenceHasMore = Boolean(payload?.hasMore);
    problem.occurrencesLoaded = true;
  } finally {
    problem.occurrencesLoading = false;
    renderGrammarProblemOccurrences(problem, index);
  }
}

function renderGrammarSummary() {
  const total = state.grammarProblems.reduce((sum, problem) => sum + problem.count, 0);
  elements.uniqueRuleCount.textContent = String(state.grammarProblems.length);
  elements.totalIssueCount.textContent = String(total);
  if (!state.grammarProblems.length) {
    elements.grammarSummaryList.replaceChildren(emptyState("尚未有文法問題記錄。完成句子後，本機檢查結果會在這裡累積。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  state.grammarProblems.forEach((problem, index) => {
    const row = createElement("details", "grammar-summary-row");
    row.dataset.grammarProblemIndex = String(index);
    row.open = problem.open;
    const summary = createElement("summary", "grammar-summary-head");
    const copy = createElement("span", "grammar-summary-copy");
    copy.append(
      createElement("h3", "", problem.title),
      createElement("p", "", problem.message || problem.ruleId),
      createElement("small", "", `規則：${problem.ruleId} · 最近：${formatSubmissionDate(problem.lastSeenAt)}`)
    );
    summary.append(copy, createElement("strong", "", `${problem.count} 次`));
    const occurrences = createElement("div", "grammar-history-list");
    occurrences.dataset.grammarProblemOccurrences = String(index);
    row.append(summary, occurrences);
    fragment.append(row);
  });
  elements.grammarSummaryList.replaceChildren(fragment);
  state.grammarProblems.forEach((problem, index) => {
    if (problem.open) renderGrammarProblemOccurrences(problem, index);
  });
}

async function openGrammarLog() {
  showView("grammar-log");
  elements.grammarSummaryList.replaceChildren(loadingState("正在整理文法問題…"));
  const payload = await apiJson("/v1/grammar-problems");
  const source = Array.isArray(payload) ? payload : payload?.grammarProblems;
  state.grammarProblems = Array.isArray(source)
    ? source.map(normalizeGrammarProblem).sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
    : [];
  renderGrammarSummary();
}

function filteredAdminSubmissions() {
  const query = String(elements.adminSearch.value || "").trim().toLocaleLowerCase();
  if (!query) return state.adminSubmissions;
  return state.adminSubmissions.filter((item) => (
    item.studentName.toLocaleLowerCase().includes(query)
    || item.topic.toLocaleLowerCase().includes(query)
  ));
}

function renderAdminSubmissions() {
  const submissions = filteredAdminSubmissions();
  elements.adminCount.textContent = String(submissions.length);
  if (!submissions.length) {
    elements.adminList.replaceChildren(emptyState("找不到符合條件的學生文章。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const submission of submissions) {
    const button = createElement("button", "submission-row");
    button.type = "button";
    button.dataset.adminSubmissionId = submission.id;
    button.setAttribute("aria-current", String(state.selectedAdminSubmissionId === submission.id));
    button.append(
      createElement("strong", "", submission.topic),
      createElement("span", "", `${submission.studentName || "學生"} · ${formatSubmissionDate(submission.submittedAt)}${submission.deletedAt ? " · 學生已刪除" : ""}`)
    );
    fragment.append(button);
  }
  elements.adminList.replaceChildren(fragment);
}

async function openAdminSubmission(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  state.selectedAdminSubmissionId = String(id);
  renderAdminSubmissions();
  elements.adminDetail.replaceChildren(loadingState("正在載入學生文章…"));
  try {
    const payload = await apiJson(`/v1/admin/submissions/${encodeURIComponent(id)}`);
    const submission = normalizeSubmission(payload?.submission || payload);
    if (Array.isArray(payload?.grammarOccurrences)) submission.occurrenceCount = payload.grammarOccurrences.length;
    renderSubmissionDetail(submission, elements.adminDetail, true);
  } catch (error) {
    elements.adminDetail.replaceChildren(emptyState(error.message || "未能載入學生文章。"));
  }
}

async function openAdminDashboard() {
  showView("admin");
  elements.adminList.replaceChildren(loadingState("正在載入學生文章…"));
  state.adminSubmissions = await fetchAllSubmissionPages("/v1/admin/submissions", { maximumPages: 100 });
  renderAdminSubmissions();
}

async function openAdminGrammarSourceSubmission(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  if (!state.adminSubmissions.length) {
    await openAdminDashboard();
  } else {
    showView("admin");
    renderAdminSubmissions();
  }
  await openAdminSubmission(id);
}

function renderAdminExplanationReviews() {
  elements.adminReviewCount.textContent = state.adminExplanationReviewHasMore
    ? `${state.adminExplanationReviews.length}+`
    : String(state.adminExplanationReviews.length);
  elements.adminReviewMore.hidden = !state.adminExplanationReviewHasMore;
  if (!state.adminExplanationReviews.length) {
    elements.adminReviewList.replaceChildren(emptyState("目前沒有使用通用說明、需要補充專屬解釋的記錄。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const occurrence of state.adminExplanationReviews) {
    fragment.append(createGrammarHistoryCard(occurrence, { admin: true }));
  }
  elements.adminReviewList.replaceChildren(fragment);
}

async function loadAdminExplanationReviews({ reset = false } = {}) {
  if (reset) {
    state.adminExplanationReviews = [];
    state.adminExplanationReviewPage = 0;
    state.adminExplanationReviewHasMore = false;
  }
  const page = state.adminExplanationReviewPage + 1;
  elements.adminReviewMore.disabled = true;
  if (!state.adminExplanationReviews.length) {
    elements.adminReviewList.replaceChildren(loadingState("正在整理待補解釋的實際句子…"));
  }
  try {
    const payload = await apiJson(`/v1/admin/explanation-review?page=${page}&pageSize=50`);
    const source = Array.isArray(payload) ? payload : payload?.grammarOccurrences;
    const next = Array.isArray(source) ? source.map(normalizeGrammarOccurrence) : [];
    const known = new Set(state.adminExplanationReviews.map(item => item.id));
    state.adminExplanationReviews.push(...next.filter(item => item.id && !known.has(item.id)));
    state.adminExplanationReviewPage = page;
    state.adminExplanationReviewHasMore = Boolean(payload?.hasMore);
    renderAdminExplanationReviews();
  } finally {
    elements.adminReviewMore.disabled = false;
  }
}

async function openAdminExplanationReview() {
  showView("admin-review");
  await loadAdminExplanationReviews({ reset: true });
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
    const result = isAdmin ? await adminLogin(username, password) : await studentLogin(username, password);
    if (!result) throw new Error("用戶名稱或密碼不正確。");
    state.authToken = result.token;
    state.user = result.user;
    state.studentAccess = !isAdmin && result.access && typeof result.access === "object"
      ? result.access
      : {};
    if (!isAdmin) {
      window.EdmundSystemNav?.rememberStudentSession({
        token: result.token,
        id: result.user.id,
        name: result.user.name,
        role: "student",
        access: result.access
      });
    }
    saveSession();
    elements.loginForm.reset();
    setStatus(elements.loginStatus, "");
    setConnection("已安全連接", "online");
    if (isAdmin) {
      await openAdminDashboard();
      showToast("管理員登入成功。", "success");
    } else {
      await loadWritingPreferences();
      restoreDraft();
      elements.workspaceWelcome.textContent = `您好，${state.user.name}！先輸入寫作題目，再專心完成文章。`;
      showView("workspace");
      if (state.grammarDetectionEnabled) prepareGrammarChecker();
      showToast(`您好，${state.user.name}！`, "success");
    }
  } catch (error) {
    console.warn("Writing Submission login failed", error);
    setStatus(elements.loginStatus, error.message || "登入失敗，請再試一次。", "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function logout() {
  const role = state.user?.role;
  persistDraft();
  try { await flushGrammarOccurrences(); } catch { /* Retry is unnecessary after explicit logout. */ }
  if (role === "student") window.EdmundSystemNav?.forgetStudentSession();
  try {
    if (role === "admin" && state.authToken) await apiJson("/v1/admin/logout", { method: "POST" });
  } catch (error) {
    console.warn("Writing Submission logout cleanup failed", error);
  }
  clearSession();
  try { await state.supabase?.auth.signOut(); } catch { /* Ignore anonymous auth cleanup failures. */ }
  setStatus(elements.loginStatus, "");
  setConnection("可以登入", "online");
  showView("login");
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
  elements.workspaceButton.addEventListener("click", () => showView("workspace"));
  elements.submissionsButton.addEventListener("click", () => openSubmissions().catch(handleViewError));
  elements.grammarLogButton.addEventListener("click", () => openGrammarLog().catch(handleViewError));
  elements.adminButton.addEventListener("click", () => openAdminDashboard().catch(handleViewError));
  elements.adminReviewButton.addEventListener("click", () => openAdminExplanationReview().catch(handleViewError));
  elements.newWriting.addEventListener("click", () => startNewDraft());
  elements.refreshSubmissions.addEventListener("click", () => loadSubmissions().catch(handleViewError));
  elements.refreshWritingProgress.addEventListener("click", () => loadWritingProgress().catch(handleViewError));
  elements.refreshGrammarLog.addEventListener("click", () => openGrammarLog().catch(handleViewError));
  elements.refreshAdminReview.addEventListener("click", () => openAdminExplanationReview().catch(handleViewError));
  elements.adminReviewMore.addEventListener("click", () => loadAdminExplanationReviews().catch(handleViewError));
  elements.writingForm.addEventListener("submit", submitWriting);
  elements.writingTimerToggle.addEventListener("click", () => openWritingTimerPanel());
  elements.writingTimerStart.addEventListener("click", handleWritingTimerStart);
  elements.writingTimerPause.addEventListener("click", handleWritingTimerPause);
  elements.writingTimerReset.addEventListener("click", handleWritingTimerReset);
  elements.writingTimerRetry.addEventListener("click", () => attemptTimerForceSubmission({ retry: true }));
  elements.writingTimerForce.addEventListener("change", handleWritingTimerForceChange);
  elements.exportSelectAll.addEventListener("change", () => {
    state.selectedExportSubmissionIds.clear();
    if (elements.exportSelectAll.checked) {
      for (const submission of state.submissions) state.selectedExportSubmissionIds.add(submission.id);
    }
    renderSubmissionList();
  });
  elements.exportSelectedSubmissions.addEventListener("click", () => {
    const ids = state.submissions
      .map(submission => submission.id)
      .filter(id => state.selectedExportSubmissionIds.has(id));
    exportStudentSubmissions(ids);
  });
  elements.exportAllSubmissions.addEventListener("click", () => {
    exportStudentSubmissions(state.submissions.map(submission => submission.id));
  });
  elements.submissionList.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-export-submission-id]");
    if (!checkbox) return;
    const id = String(checkbox.dataset.exportSubmissionId || "");
    if (!UUID_RE.test(id)) return;
    if (checkbox.checked) state.selectedExportSubmissionIds.add(id);
    else state.selectedExportSubmissionIds.delete(id);
    syncSubmissionExportControls();
  });
  elements.topicInput.addEventListener("input", () => {
    markWritingActivity();
    updateEditorMetrics();
    scheduleDraftSave();
  });
  elements.topicPickerOpen.addEventListener("click", () => openWritingTopicPicker());
  elements.topicPickerClose.addEventListener("click", closeWritingTopicPicker);
  elements.topicPickerSearch.addEventListener("input", () => renderWritingTopicResults(elements.topicPickerSearch.value));
  elements.topicPicker.addEventListener("click", (event) => {
    if (event.target === elements.topicPicker) closeWritingTopicPicker();
  });
  elements.grammarToggle.addEventListener("change", () => handleGrammarDetectionToggle());
  elements.writingInput.addEventListener("input", handleWritingInput);
  elements.writingInput.addEventListener("focus", markWritingActivity);
  elements.topicInput.addEventListener("focus", markWritingActivity);
  elements.adminSearch.addEventListener("input", renderAdminSubmissions);
  document.addEventListener("toggle", (event) => {
    const details = event.target.closest?.("[data-grammar-problem-index]");
    if (!details) return;
    const index = Number(details.dataset.grammarProblemIndex);
    const problem = state.grammarProblems[index];
    if (!problem) return;
    problem.open = details.open;
    if (details.open && !problem.occurrencesLoaded) {
      loadGrammarProblemOccurrences(index, { reset: true }).catch(handleViewError);
    }
  }, true);
  document.addEventListener("click", (event) => {
    const apply = event.target.closest("[data-apply-issue]");
    if (apply) return applyGrammarIssue(apply.dataset.applyIssue);
    const dismiss = event.target.closest("[data-dismiss-issue]");
    if (dismiss) return dismissGrammarIssue(dismiss.dataset.dismissIssue);
    const submission = event.target.closest("[data-submission-id]");
    if (submission) return openSubmission(submission.dataset.submissionId);
    const deleteSubmission = event.target.closest("[data-delete-submission]");
    if (deleteSubmission) return deleteStudentSubmission(deleteSubmission.dataset.deleteSubmission);
    const exportSubmission = event.target.closest("[data-export-submission]");
    if (exportSubmission) return exportStudentSubmissions([exportSubmission.dataset.exportSubmission]);
    const writingTopic = event.target.closest("[data-select-writing-topic]");
    if (writingTopic) return selectWritingTopic(writingTopic.dataset.selectWritingTopic);
    if (event.target.closest("[data-remove-topic-preview]")) {
      state.selectedTopicResource = null;
      renderSelectedTopicPreview();
      scheduleDraftSave();
      return;
    }
    const adminSubmission = event.target.closest("[data-admin-submission-id]");
    if (adminSubmission) return openAdminSubmission(adminSubmission.dataset.adminSubmissionId);
    const moreGrammar = event.target.closest("[data-load-grammar-problem]");
    if (moreGrammar) {
      return loadGrammarProblemOccurrences(Number(moreGrammar.dataset.loadGrammarProblem)).catch(handleViewError);
    }
    const grammarSource = event.target.closest("[data-grammar-source-submission]");
    if (grammarSource) {
      return openGrammarSourceSubmission(grammarSource.dataset.grammarSourceSubmission).catch(handleViewError);
    }
    const adminGrammarSource = event.target.closest("[data-admin-grammar-source-submission]");
    if (adminGrammarSource) {
      return openAdminGrammarSourceSubmission(adminGrammarSource.dataset.adminGrammarSourceSubmission).catch(handleViewError);
    }
  });
  window.addEventListener("pagehide", () => {
    accrueWritingTime();
    persistDraft();
    if (state.pendingOccurrences.size) {
      flushGrammarOccurrences({ keepalive: true }).catch(() => {});
    }
  });
  document.addEventListener("visibilitychange", () => {
    accrueWritingTime();
    state.writingClockLastAt = Date.now();
    if (document.visibilityState === "visible") tickWritingTimer();
    if (document.visibilityState === "visible" && state.currentView === "workspace") markWritingActivity();
  });
  window.addEventListener("online", () => {
    if (state.writingTimer.status === "expired" && state.writingTimer.forceSubmit && state.writingTimer.autoSubmitError) {
      attemptTimerForceSubmission({ retry: true });
    }
  });
}

function handleViewError(error) {
  console.warn("Writing Submission view failed", error);
  showToast(error.message || "暫時未能載入資料。", "error");
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
  startWritingClock();
  startWritingTimerClock();
  setWritingTimerInputs(40 * 60);
  syncWritingTimerUi();
  syncSubmissionExportControls();
  syncGrammarDetectionControls();
  updateEditorMetrics();
  renderGrammarIssues();
  checkHealth();
  const restored = await validateRestoredSession();
  if (!restored) {
    showView("login");
    return;
  }
  setConnection("已安全連接", "online");
  if (state.user.role === "admin") {
    await openAdminDashboard();
  } else {
    await loadWritingPreferences();
    restoreDraft();
    elements.workspaceWelcome.textContent = `您好，${state.user.name}！先輸入寫作題目，再專心完成文章。`;
    showView("workspace");
    if (state.grammarDetectionEnabled) prepareGrammarChecker();
  }
}

initialise().catch((error) => {
  console.error("Writing Submission initialisation failed", error);
  clearSession();
  setConnection("服務暫時離線", "error");
  setStatus(elements.loginStatus, "系統未能完成載入，請重新整理頁面。", "error");
  showView("login");
});
