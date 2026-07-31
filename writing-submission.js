import {
  completedWritingSegments,
  countEnglishWords,
  formatSubmissionDate,
  insertedRange,
  newlyCompletedWritingSegments
} from "./writing-submission-core.js?v=20260731-1";

const CONFIG = window.EDMUND_WRITING_SUBMISSION_CONFIG || {};
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const SESSION_KEY = "edmund-writing-submission-session-v1";
const DRAFT_KEY_PREFIX = "edmund-writing-submission-draft-v1";
const ISSUE_QUEUE_KEY_PREFIX = "edmund-writing-submission-issue-queue-v1";
const HARPER_VERSION = "2.7.0";
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
  checkGeneration: 0,
  activeIssues: [],
  dismissedIssueIds: new Set(),
  documentId: "",
  previousWriting: "",
  pendingOccurrences: new Map(),
  reportedFingerprints: new Set(),
  occurrenceFlushTimer: null,
  occurrenceFlushPromise: null,
  draftSaveTimer: null,
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
  state.occurrenceFlushTimer = null;
  state.occurrenceFlushPromise = null;
  state.draftSaveTimer = null;
  state.checkGeneration += 1;
  state.checkQueue = Promise.resolve();
  state.user = null;
  state.authToken = "";
  state.activeIssues = [];
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
  clearStoredDraft();
  state.checkGeneration += 1;
  state.checkQueue = Promise.resolve();
  state.documentId = newDocumentId();
  state.previousWriting = "";
  state.activeIssues = [];
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
  state.checkGeneration += 1;
  state.checkQueue = Promise.resolve();
  restoreIssueQueue();
  const draft = readDraft();
  state.documentId = draft?.documentId || newDocumentId();
  elements.topicInput.value = draft?.topic || "";
  elements.writingInput.value = draft?.answer || "";
  state.previousWriting = elements.writingInput.value;
  updateEditorMetrics();
  renderGrammarIssues();
  persistDraft();
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
  updateHarperStatus("loading", "正在準備本機文法檢查", "首次載入約需數秒；文章不會傳送到外部 AI");
  state.checkerPromise = (async () => {
    try {
      const module = await import("./writing-submission-harper.js?v=20260731-1");
      const checker = module.createWritingGrammarChecker();
      await checker.setup();
      state.checker = checker;
      updateHarperStatus("ready", "本機文法檢查已準備", `Harper ${HARPER_VERSION} · 只檢查已完成句子`);
      return checker;
    } catch (error) {
      console.warn("Local Harper setup failed", error);
      try { await state.checker?.dispose?.(); } catch { /* Ignore failed cleanup. */ }
      state.checker = null;
      state.checkerPromise = null;
      updateHarperStatus("error", "本機文法檢查暫時不可用", "您仍可正常寫作及提交文章");
      return null;
    }
  })();
  return state.checkerPromise;
}

function rebaseActiveIssues(previousValue, nextValue) {
  if (!state.activeIssues.length || previousValue === nextValue) return;
  const change = insertedRange(previousValue, nextValue);
  const suffixLength = nextValue.length - change.end;
  const previousEnd = previousValue.length - suffixLength;
  const delta = (change.end - change.start) - (previousEnd - change.start);
  const rebased = [];
  for (const issue of state.activeIssues) {
    if (issue.sentenceEnd <= change.start) {
      rebased.push(issue);
      continue;
    }
    if (issue.sentenceStart >= previousEnd) {
      rebased.push({
        ...issue,
        sentenceStart: issue.sentenceStart + delta,
        sentenceEnd: issue.sentenceEnd + delta,
        absoluteStart: issue.absoluteStart + delta,
        absoluteEnd: issue.absoluteEnd + delta
      });
    }
    // A change inside the checked sentence invalidates that suggestion.
  }
  state.activeIssues = rebased;
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
  // Stage one records each unique Harper rule once per article. This identity
  // survives sentence edits, offset changes and accepted suggestions.
  const fingerprint = await sha256Hex([HARPER_VERSION, context.documentId, ruleId].join("|"));
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

async function checkCompletedSegment(segment, context) {
  const checker = await prepareGrammarChecker();
  if (!checker || !isCurrentCheckContext(context) || segment.text.length > 10000) return;
  const current = elements.writingInput.value.slice(segment.start, segment.end);
  if (current !== segment.text) return;
  let rawIssues;
  try {
    rawIssues = await checker.check(segment.text);
  } catch (error) {
    console.warn("Local sentence check failed", error);
    updateHarperStatus("error", "這一句暫時未能檢查", "您仍可繼續寫作及提交文章");
    return;
  }
  if (!isCurrentCheckContext(context) || elements.writingInput.value.slice(segment.start, segment.end) !== segment.text) return;
  const issues = await Promise.all((Array.isArray(rawIssues) ? rawIssues : []).map((issue) => decorateIssue(issue, segment, context)));
  if (!isCurrentCheckContext(context)) return;
  state.activeIssues = state.activeIssues.filter((issue) => !(
    issue.sentenceStart === segment.start && issue.sentenceEnd === segment.end
  ));
  state.activeIssues.push(...issues);
  state.activeIssues.sort((a, b) => a.absoluteStart - b.absoluteStart || a.ruleId.localeCompare(b.ruleId));
  for (const issue of issues) queueOccurrence(issue);
  renderGrammarIssues();
}

function enqueueSegmentsForCheck(segments) {
  const context = captureCheckContext();
  for (const segment of segments) {
    state.checkQueue = state.checkQueue
      .then(() => checkCompletedSegment(segment, context))
      .catch((error) => console.warn("Queued grammar check failed", error));
  }
}

function grammarEmptyContent() {
  const wrapper = createElement("div", "grammar-empty");
  wrapper.append(createElement("span", "", "✓"));
  if (state.checkerState === "loading") {
    wrapper.append(createElement("strong", "", "正在準備文法檢查"));
    wrapper.append(createElement("p", "", "您可以先開始寫作；完整句子會排隊檢查。"));
  } else if (state.checkerState === "error") {
    wrapper.append(createElement("strong", "", "文法檢查暫時不可用"));
    wrapper.append(createElement("p", "", "寫作及提交功能不受影響。"));
  } else {
    wrapper.append(createElement("strong", "", "未發現基本文法問題"));
    wrapper.append(createElement("p", "", "只會檢查已用句號或分號完成的句子。"));
  }
  return wrapper;
}

function renderGrammarIssues() {
  const visible = state.activeIssues.filter((issue) => !state.dismissedIssueIds.has(issue.id));
  elements.issueCount.textContent = String(visible.length);
  if (!visible.length) {
    elements.grammarList.replaceChildren(grammarEmptyContent());
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const issue of visible) {
    const card = createElement("article", "grammar-card");
    const head = createElement("div", "grammar-card-head");
    head.append(createElement("strong", "", issue.title), createElement("span", "", issue.ruleId));
    const body = createElement("div", "grammar-card-body");

    const problem = createElement("p", "grammar-fragment");
    problem.append(document.createTextNode(issue.sentenceText.slice(0, issue.start)));
    problem.append(createElement("mark", "", issue.sentenceText.slice(issue.start, issue.end) || issue.originalText));
    problem.append(document.createTextNode(issue.sentenceText.slice(issue.end)));

    const replacement = createElement("div", "grammar-replacement");
    replacement.append(createElement("small", "", "建議修正"), createElement("p", "", issue.correctedSentence));
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

function handleWritingInput() {
  const nextValue = elements.writingInput.value;
  const previousValue = state.previousWriting;
  rebaseActiveIssues(previousValue, nextValue);
  const segments = newlyCompletedWritingSegments(previousValue, nextValue);
  state.previousWriting = nextValue;
  updateEditorMetrics();
  scheduleDraftSave();
  renderGrammarIssues();
  if (segments.length) enqueueSegmentsForCheck(segments);
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
  state.activeIssues = state.activeIssues.filter((candidate) => candidate.sentenceText !== issue.sentenceText || candidate.sentenceStart !== issue.sentenceStart);
  rebaseActiveIssues(current, next);
  elements.writingInput.value = next;
  state.previousWriting = next;
  updateEditorMetrics();
  scheduleDraftSave();
  renderGrammarIssues();
  const updatedSegment = completedWritingSegments(next).find((segment) => (
    segment.start === issue.sentenceStart && segment.text === issue.correctedSentence
  ));
  if (updatedSegment) enqueueSegmentsForCheck([updatedSegment]);
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
