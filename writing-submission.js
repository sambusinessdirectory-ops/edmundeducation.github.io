import {
  completedWritingSegments,
  completedWritingSegmentsAffectedByEdit,
  completedWritingSegmentsOverlappingRange,
  countEnglishWords,
  formatSubmissionDate,
  insertedRange,
  isLiveCompletedWritingSegment,
  newlyCompletedWritingSegments
} from "./writing-submission-core.js?v=20260801-loop1";
import {
  classifyRemoteGrammarFailure,
  hasWritingGrammarIssuesForSentence,
  isBlockedInverseWritingGrammarIssue,
  mergeWritingGrammarIssues,
  normalizeWritingAiResponse,
  REMOTE_GRAMMAR_FAILURE_KINDS,
  rebaseWritingGrammarIssuesAfterAppliedCorrection,
  writingGrammarReviewNotice
} from "./writing-submission-ai.js?v=20260801-grammar4";

const CONFIG = window.EDMUND_WRITING_SUBMISSION_CONFIG || {};
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const SESSION_KEY = "edmund-writing-submission-session-v1";
const DRAFT_KEY_PREFIX = "edmund-writing-submission-draft-v1";
const ISSUE_QUEUE_KEY_PREFIX = "edmund-writing-submission-issue-queue-v1";
const HARPER_VERSION = "2.7.0";
const ESL_RULESET_VERSION = "1.2.0";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  connection: document.querySelector("[data-connection-status]"),
  userPill: document.querySelector("[data-user-pill]"),
  workspaceButton: document.querySelector("[data-workspace-button]"),
  submissionsButton: document.querySelector("[data-submissions-button]"),
  grammarLogButton: document.querySelector("[data-grammar-log-button]"),
  adminButton: document.querySelector("[data-admin-button]"),
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
  writingInput: document.querySelector("[data-writing-input]"),
  wordCount: document.querySelector("[data-word-count]"),
  draftState: document.querySelector("[data-draft-state]"),
  submissionStatus: document.querySelector("[data-submission-status]"),
  submitWriting: document.querySelector("[data-submit-writing]"),
  grammarList: document.querySelector("[data-grammar-list]"),
  issueCount: document.querySelector("[data-issue-count]"),
  newWriting: document.querySelector("[data-new-writing]"),
  refreshSubmissions: document.querySelector("[data-refresh-submissions]"),
  submissionList: document.querySelector("[data-submission-list]"),
  submissionDetail: document.querySelector("[data-submission-detail]"),
  refreshGrammarLog: document.querySelector("[data-refresh-grammar-log]"),
  uniqueRuleCount: document.querySelector("[data-unique-rule-count]"),
  totalIssueCount: document.querySelector("[data-total-issue-count]"),
  grammarSummaryList: document.querySelector("[data-grammar-summary-list]"),
  adminSearch: document.querySelector("[data-admin-search]"),
  adminCount: document.querySelector("[data-admin-count]"),
  adminList: document.querySelector("[data-admin-list]"),
  adminDetail: document.querySelector("[data-admin-detail]"),
  toast: document.querySelector("[data-toast]")
};

const state = {
  supabase: null,
  user: null,
  authToken: "",
  currentView: "login",
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
  manualRecheckTimer: null,
  toastTimer: null,
  submissions: [],
  selectedSubmissionId: "",
  grammarProblems: [],
  adminSubmissions: [],
  selectedAdminSubmissionId: ""
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

function showView(name) {
  state.currentView = name;
  for (const view of elements.views) view.hidden = view.dataset.view !== name;
  const loggedIn = Boolean(state.user && state.authToken);
  const admin = state.user?.role === "admin";
  elements.userPill.hidden = !loggedIn;
  elements.logout.hidden = !loggedIn;
  elements.workspaceButton.hidden = !loggedIn || admin || name === "workspace";
  elements.submissionsButton.hidden = !loggedIn || admin || name === "submissions";
  elements.grammarLogButton.hidden = !loggedIn || admin || name === "grammar-log";
  elements.adminButton.hidden = !loggedIn || !admin || name === "admin";
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
      role: state.user.role
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
  state.activeIssues = [];
  state.appliedCorrections = [];
  state.dismissedIssueIds.clear();
  state.pendingOccurrences.clear();
  state.reportedFingerprints.clear();
  state.submissions = [];
  state.adminSubmissions = [];
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

function readDraft() {
  const key = draftStorageKey();
  if (!key) return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(key) || "null");
    if (!UUID_RE.test(String(value?.documentId || ""))) return null;
    return {
      documentId: String(value.documentId),
      topic: String(value.topic || ""),
      answer: String(value.answer || "")
    };
  } catch {
    return null;
  }
}

function persistDraft() {
  const key = draftStorageKey();
  if (!key || !state.documentId) return;
  try {
    sessionStorage.setItem(key, JSON.stringify({
      documentId: state.documentId,
      topic: elements.topicInput.value,
      answer: elements.writingInput.value,
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

function startNewDraft({ preserveView = false } = {}) {
  window.clearTimeout(state.manualRecheckTimer);
  state.manualRecheckTimer = null;
  clearStoredDraft();
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  state.documentId = newDocumentId();
  state.previousWriting = "";
  state.activeIssues = [];
  state.appliedCorrections = [];
  state.dismissedIssueIds.clear();
  elements.topicInput.value = "";
  elements.writingInput.value = "";
  setStatus(elements.submissionStatus, "");
  renderGrammarIssues();
  updateEditorMetrics();
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
  state.appliedCorrections = [];
  elements.topicInput.value = draft?.topic || "";
  elements.writingInput.value = draft?.answer || "";
  state.previousWriting = elements.writingInput.value;
  updateEditorMetrics();
  renderGrammarIssues();
  persistDraft();
  const completedSegments = completedWritingSegments(elements.writingInput.value);
  if (completedSegments.length) enqueueSegmentsForCheck(completedSegments, { remote: false });
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
  if (state.checkerPromise) return state.checkerPromise;
  updateHarperStatus("loading", "正在準備進階文法檢查", "本機後備檢查首次載入約需數秒");
  state.checkerPromise = (async () => {
    const module = await import("./writing-submission-harper.js?v=20260801-grammar2");
    const checker = module.createWritingGrammarChecker();
    state.checker = checker;
    try {
      await checker.setup();
      updateHarperStatus("ready", "文法檢查已準備", `AI 進階檢查 + 本機 ESL ${ESL_RULESET_VERSION} + Harper ${HARPER_VERSION} 後備校對`);
    } catch (error) {
      console.warn("Local Harper setup failed", error);
      updateHarperStatus("ready", "AI 文法檢查已準備", "Edmund 本機規則仍可使用；Harper 暫時不可用");
    }
    return checker;
  })();
  return state.checkerPromise;
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
  // Stage one records each unique local rule once per article. This identity
  // survives sentence edits, offset changes and accepted suggestions.
  const engineIdentity = `${rawIssue.engine?.name || "harper.js"}@${rawIssue.engine?.version || HARPER_VERSION}`;
  const fingerprint = await sha256Hex([engineIdentity, context.documentId, ruleId].join("|"));
  return {
    ...rawIssue,
    id: `${fingerprint}:${segment.ordinal}:${start}:${end}`,
    fingerprint,
    ruleId,
    title: String(rawIssue.title || rawIssue.category || ruleId).slice(0, 200),
    message: String(rawIssue.message || "請檢查這部分的文法。").slice(0, 2000),
    originalText: String(rawIssue.originalText || segment.text.slice(start, end)).slice(0, 2000),
    suggestedText: String(rawIssue.suggestedText || "").slice(0, 2000),
    correctedSentence: String(rawIssue.correctedSentence || segment.text),
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

async function requestRemoteGrammarIssues(record) {
  if (!isLatestSegmentRecord(record)) return cancelledRemoteGrammarResult();
  if (record.segment.text.length > 2000) return inconclusiveRemoteGrammarResult();
  if (Date.now() < state.remoteGrammarBackoffUntil) {
    return remoteGrammarFailureResult(
      state.remoteGrammarBackoffFailure || classifyRemoteGrammarFailure(new TypeError("Network backoff")),
      { skipped: true }
    );
  }
  const controller = new AbortController();
  record.remoteController = controller;
  state.remoteGrammarControllers.add(controller);
  let timedOut = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 12000);
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
      "AI 進階文法檢查已連線",
      "只傳送已完成的單句；題目、整篇草稿及學生身份不會交給模型"
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

  if (failure.globalStatus === "error") {
    updateHarperStatus(
      "error",
      "進階 AI 暫時未能連線",
      "本機 ESL 規則及 Harper 後備檢查仍可使用"
    );
  } else if (failure.globalStatus === "rate_limited") {
    updateHarperStatus(
      "ready",
      "AI 進階檢查稍後重試",
      "本機提示仍可使用；請稍候再完成下一次進階檢查"
    );
  } else if (failure.globalStatus === "quota_exhausted") {
    updateHarperStatus(
      "error",
      "Workers AI 每日額度已用完",
      "額度會於香港時間 08:00 重設；本機 ESL 規則及 Harper 後備檢查仍可使用"
    );
  } else if (failure.kind === REMOTE_GRAMMAR_FAILURE_KINDS.inconclusive) {
    updateHarperStatus(
      "ready",
      "文法檢查已準備",
      "AI 未能完成個別句子時，本機提示仍然會保留"
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
  const icon = state.pendingChecks > 0 || state.checkerState === "loading"
    ? "…"
    : state.checkerState === "error" ? "!" : "i";
  wrapper.append(createElement("span", "", icon));
  if (state.pendingChecks > 0) {
    wrapper.append(createElement("strong", "", "正在檢查完整句子"));
    wrapper.append(createElement("p", "", "AI 文法助手及本機後備規則正在整理建議，請稍候。"));
  } else if (state.checkerState === "loading") {
    wrapper.append(createElement("strong", "", "正在準備文法檢查"));
    wrapper.append(createElement("p", "", "您可以先開始寫作；完整句子會排隊檢查。"));
  } else if (state.checkerState === "error") {
    wrapper.append(createElement("strong", "", "進階 AI 暫時未能連線"));
    wrapper.append(createElement("p", "", "本機後備檢查、寫作及提交功能不受影響。"));
  } else {
    wrapper.append(createElement("strong", "", "暫未偵測到高信心文法問題"));
    wrapper.append(createElement("p", "", "這不代表句子完全正確；AI 及本機工具都可能遺漏問題。"));
  }
  return wrapper;
}

function grammarIssueSourceLabel(issue) {
  if (issue.reviewRequired) return "需老師覆核";
  if (issue.engine?.name === "cloudflare-workers-ai") return "Edmund AI 進階檢查";
  if (issue.engine?.name === "edmund-esl-basics") return "Edmund 本機規則";
  if (issue.engine?.name === "harper.js") return "Harper 額外校對";
  return "文法提示";
}

function renderGrammarIssues() {
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
  // The AI returns one coherent correction batch. Let the student finish that
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
    submittedAt: String(value?.submittedAt || value?.submitted_at || value?.createdAt || value?.created_at || ""),
    occurrenceCount: Number(value?.occurrenceCount ?? value?.occurrence_count ?? 0)
  };
}

function submissionArray(payload) {
  const source = Array.isArray(payload) ? payload : payload?.submissions;
  return Array.isArray(source) ? source.map(normalizeSubmission).filter((item) => item.id) : [];
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

function renderSubmissionList() {
  if (!state.submissions.length) {
    elements.submissionList.replaceChildren(emptyState("尚未有已提交文章。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const submission of state.submissions) {
    const button = createElement("button", "submission-row");
    button.type = "button";
    button.dataset.submissionId = submission.id;
    button.setAttribute("aria-current", String(state.selectedSubmissionId === submission.id));
    button.append(
      createElement("strong", "", submission.topic),
      createElement("span", "", `${formatSubmissionDate(submission.submittedAt)} · ${submission.wordCount} words`)
    );
    fragment.append(button);
  }
  elements.submissionList.replaceChildren(fragment);
}

function renderSubmissionDetail(submission, container = elements.submissionDetail, admin = false) {
  const header = createElement("header", "submission-detail-head");
  header.append(createElement("h2", "", submission.topic));
  const meta = createElement("div", "submission-meta");
  if (admin && submission.studentName) meta.append(createElement("span", "", `學生：${submission.studentName}`));
  meta.append(
    createElement("span", "", formatSubmissionDate(submission.submittedAt)),
    createElement("span", "", `${submission.wordCount} words`)
  );
  if (submission.occurrenceCount) meta.append(createElement("span", "", `${submission.occurrenceCount} 個文法提示`));
  header.append(meta);
  const content = createElement("div", "submission-content", submission.answer || "（文章內容為空）");
  container.replaceChildren(header, content);
}

async function loadSubmissions({ selectId = "" } = {}) {
  elements.submissionList.replaceChildren(loadingState("正在載入文章…"));
  state.submissions = await fetchAllSubmissionPages("/v1/submissions");
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
  await loadSubmissions();
}

async function submitWriting(event) {
  event.preventDefault();
  const topic = elements.topicInput.value.trim();
  const answer = elements.writingInput.value.trim();
  if (!topic || !answer) {
    setStatus(elements.submissionStatus, "請先輸入寫作題目及文章內容。", "error");
    return;
  }
  if (!UUID_RE.test(state.documentId)) state.documentId = newDocumentId();
  const submittedDocumentId = state.documentId;
  elements.submitWriting.disabled = true;
  setStatus(elements.submissionStatus, "正在安全保存文章…");
  try {
    await state.checkQueue;
    const remoteChecks = [...state.remoteGrammarPromises];
    if (remoteChecks.length) {
      await Promise.race([
        Promise.allSettled(remoteChecks),
        new Promise((resolve) => window.setTimeout(resolve, 1500))
      ]);
    }
    const payload = await apiJson(`/v1/submissions/${encodeURIComponent(submittedDocumentId)}`, {
      method: "PUT",
      body: JSON.stringify({ topic, answer })
    });
    const saved = normalizeSubmission(payload?.submission || payload);
    const submittedId = saved.id || submittedDocumentId;
    clearStoredDraft();
    setStatus(elements.submissionStatus, "文章已提交及保存。", "success");
    showToast("文章已成功提交。", "success");
    flushGrammarOccurrences().catch((error) => {
      console.warn("Grammar history will retry after submission", error);
      scheduleOccurrenceFlush();
    });
    startNewDraft({ preserveView: true });
    await openSubmissions();
    await openSubmission(submittedId);
  } catch (error) {
    console.warn("Writing submission failed", error);
    setStatus(elements.submissionStatus, error.message || "未能保存文章，請再試一次。", "error");
  } finally {
    elements.submitWriting.disabled = false;
  }
}

function normalizeGrammarProblem(value) {
  return {
    ruleId: String(value?.ruleId || value?.rule_id || "UnknownRule"),
    title: String(value?.title || value?.ruleTitle || value?.rule_title || value?.ruleId || value?.rule_id || "文法問題"),
    message: String(value?.message || value?.lastMessage || value?.last_message || ""),
    count: Number(value?.count ?? value?.occurrenceCount ?? value?.occurrence_count ?? 0),
    firstSeenAt: String(value?.firstSeenAt || value?.first_seen_at || ""),
    lastSeenAt: String(value?.lastSeenAt || value?.last_seen_at || "")
  };
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
  for (const problem of state.grammarProblems) {
    const row = createElement("article", "grammar-summary-row");
    row.append(
      createElement("h3", "", problem.title),
      createElement("p", "", problem.message || problem.ruleId),
      createElement("strong", "", `${problem.count} 次`),
      createElement("small", "", `規則：${problem.ruleId} · 最近：${formatSubmissionDate(problem.lastSeenAt)}`)
    );
    fragment.append(row);
  }
  elements.grammarSummaryList.replaceChildren(fragment);
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
      createElement("span", "", `${submission.studentName || "學生"} · ${formatSubmissionDate(submission.submittedAt)}`)
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
      restoreDraft();
      elements.workspaceWelcome.textContent = `您好，${state.user.name}！先輸入寫作題目，再專心完成文章。`;
      showView("workspace");
      prepareGrammarChecker();
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
  elements.newWriting.addEventListener("click", () => startNewDraft());
  elements.refreshSubmissions.addEventListener("click", () => loadSubmissions().catch(handleViewError));
  elements.refreshGrammarLog.addEventListener("click", () => openGrammarLog().catch(handleViewError));
  elements.writingForm.addEventListener("submit", submitWriting);
  elements.topicInput.addEventListener("input", () => {
    updateEditorMetrics();
    scheduleDraftSave();
  });
  elements.writingInput.addEventListener("input", handleWritingInput);
  elements.adminSearch.addEventListener("input", renderAdminSubmissions);
  document.addEventListener("click", (event) => {
    const apply = event.target.closest("[data-apply-issue]");
    if (apply) return applyGrammarIssue(apply.dataset.applyIssue);
    const dismiss = event.target.closest("[data-dismiss-issue]");
    if (dismiss) return dismissGrammarIssue(dismiss.dataset.dismissIssue);
    const submission = event.target.closest("[data-submission-id]");
    if (submission) return openSubmission(submission.dataset.submissionId);
    const adminSubmission = event.target.closest("[data-admin-submission-id]");
    if (adminSubmission) return openAdminSubmission(adminSubmission.dataset.adminSubmissionId);
  });
  window.addEventListener("pagehide", () => {
    persistDraft();
    if (state.pendingOccurrences.size) {
      flushGrammarOccurrences({ keepalive: true }).catch(() => {});
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
    restoreDraft();
    elements.workspaceWelcome.textContent = `您好，${state.user.name}！先輸入寫作題目，再專心完成文章。`;
    showView("workspace");
    prepareGrammarChecker();
  }
}

initialise().catch((error) => {
  console.error("Writing Submission initialisation failed", error);
  clearSession();
  setConnection("服務暫時離線", "error");
  setStatus(elements.loginStatus, "系統未能完成載入，請重新整理頁面。", "error");
  showView("login");
});
