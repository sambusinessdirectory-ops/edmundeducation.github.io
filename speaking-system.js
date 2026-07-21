(function initialiseEdmundSpeakingSystem() {
  "use strict";

  const CONFIG = window.EDMUND_SPEAKING_CONFIG || {};
  const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
  const EXAM_MODE = window.EDMUND_SPEAKING_EXAM || {};
  const SESSION_KEY = "edmundSpeakingSessionV1";
  const RATE_KEY = "edmundSpeakingAudioRateV1";
  const HIGHLIGHT_KEY = "edmundSpeakingHighlightV1";
  const NATURAL_EXCHANGE_KEY = "edmundSpeakingNaturalExchangeV1";
  const SEARCH_RESULT_LIMITS = { sections: 8, exercises: 14 };
  const VISIBLE_BOOK_LIMITS = { 1: 14, 2: 16, 3: 16 };
  const AUDIO_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5];
  const PART1_POP_DURATION_SECONDS = 0.5;
  const PART1_POP_SAFETY_SECONDS = 0.08;
  const PART1_SEGMENT_TAIL_SECONDS = 0.2;
  const EXAM_PART2_SETTLE_MS = 2000;
  const EXAM_PART2_PREP_MS = 60 * 1000;
  const EXAM_PART2_RECORDING_SECONDS = 120;
  const EXAM_MESSAGE_GAP_MS = 900;
  const EXAM_OPENING_GAP_MS = 2000;
  const WORD_PATTERN = /[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*|[^\p{L}\p{N}]+/gu;
  const IS_WORD_PATTERN = /^[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*$/u;

  const EXAMS = [
    { id: "dse", title: "DSE 說話考試", description: "香港中學文憑考試說話訓練" },
    { id: "ielts", title: "IELTS 說話考試", description: "Part 1、Part 2 及 Part 3 高分示範" },
    { id: "business", title: "商務英語會話", description: "會議、簡報及職場溝通" },
    { id: "interview", title: "升學／見工面試", description: "升學與求職面試實戰" },
    { id: "civil-service", title: "公務員說話面試", description: "公務員面試表達訓練" }
  ];

  const EXAM_ACCESS_KEYS = {
    dse: "exam.dse",
    ielts: "exam.ielts",
    business: "exam.business",
    interview: "exam.interview",
    "civil-service": "exam.civil-service"
  };

  const ACCESS_SECTIONS = [
    { key: "exam.dse", label: "DSE 說話考試" },
    {
      key: "exam.ielts",
      label: "IELTS 說話考試",
      children: [1, 2, 3].map(part => ({
        key: `ielts.part.${part}`,
        label: `Part ${part}`,
        children: Array.from({ length: 16 }, (_, index) => ({
          key: `ielts.part.${part}.book.${index + 1}`,
          label: `Book ${index + 1}`
        }))
      }))
    },
    { key: "exam.business", label: "商務英語會話" },
    { key: "exam.interview", label: "升學／見工面試" },
    { key: "exam.civil-service", label: "公務員說話面試" },
    { key: "bookmarks", label: "書簽" }
  ];

  const dom = {
    loginView: document.querySelector('[data-view="login"]'),
    portalView: document.querySelector('[data-view="portal"]'),
    content: document.querySelector("[data-view-content]"),
    breadcrumbs: document.querySelector("[data-breadcrumbs]"),
    loginForm: document.querySelector("[data-login-form]"),
    loginStatus: document.querySelector("[data-login-status]"),
    authActions: document.querySelector("[data-auth-actions]"),
    connectionPill: document.querySelector("[data-connection-pill]"),
    backButton: document.querySelector("[data-back]"),
    headerBookmarkButton: document.querySelector("[data-toggle-route-bookmark]"),
    adminButton: document.querySelector('[data-go="admin"]'),
    toastRegion: document.querySelector("[data-toast-region]"),
    loadingTemplate: document.querySelector("#loading-template")
  };

  const state = {
    user: null,
    authToken: "",
    access: {},
    bookmarks: [],
    bookmarksLoaded: false,
    bookmarksSaving: false,
    adminStudents: [],
    adminStudentsLoaded: false,
    adminStudentsLoading: false,
    adminAccessSaving: false,
    adminAccessDrafts: new Map(),
    adminStudentQuery: "",
    selectedAdminStudentId: "",
    adminRequestGeneration: 0,
    supabase: null,
    supabaseReady: false,
    route: { view: "exams" },
    routeGeneration: 0,
    routeHistory: [],
    selectedRate: restoreRate(),
    highlightEnabled: restoreHighlight(),
    examNaturalExchange: restoreNaturalExchange(),
    modelAudio: null,
    modelAudioExerciseId: "",
    modelAudioSegmentStart: 0,
    modelAudioSegmentEnd: 0,
    modelAudioSegmentIndex: -1,
    highlightFrame: 0,
    activeWordIndex: -1,
    modelAudioGeneration: 0,
    modelAudioPendingStart: false,
    part1RevealMessages: [],
    part1RevealNextIndex: 0,
    part1RevealFrame: 0,
    part1RevealScrollHandler: null,
    part1RevealResizeHandler: null,
    part1RevealAll: false,
    part1AnimationDisabled: false,
    authGeneration: 0,
    mediaRecorder: null,
    mediaStream: null,
    recordingChunks: [],
    recordingActiveStartedAt: 0,
    recordingElapsedMs: 0,
    recordingTransition: "",
    recordingPauseSupported: false,
    recordingBackgroundPaused: false,
    recordingTimer: 0,
    recordingDeadlineTimer: 0,
    recordingGeneration: 0,
    recordingPermissionPending: false,
    recordingProcessing: false,
    recordedMp3: null,
    recordedMp3Url: "",
    recordedDurationMs: 0,
    recordingSaved: false,
    recordingContextKey: "",
    examSession: null,
    examPhaseTimer: 0,
    examMessageTimer: 0,
    examMessageFinish: null,
    examFlowGeneration: 0,
    examSpeechGeneration: 0,
    examSpeechUtterance: null,
    examSpeechFinish: null,
    examSpeechTimeout: 0,
    examStarting: false,
    examStartGeneration: 0,
    examSaving: false,
    examRatingSaving: false,
    examAttempts: [],
    examAttemptsById: new Map(),
    attempts: [],
    attemptsById: new Map(),
    attemptBlobCache: new Map(),
    attemptObjectUrls: new Map(),
    activeAttemptAudioId: "",
    attemptRequestGeneration: 0,
    attemptPlaybackGeneration: 0,
    attemptPlaybackController: null,
    attemptAbortControllers: new Set(),
    attemptTotal: 0
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeFilePart(value, fallback = "recording") {
    const cleaned = String(value || "")
      .normalize("NFKC")
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 90);
    return cleaned || fallback;
  }

  function pad(value, length = 2) {
    return String(value).padStart(length, "0");
  }

  function normalizeAccess(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const allowed = new Set(ACCESS_SECTIONS.flatMap(section => [
      section.key,
      ...(section.children || []).flatMap(child => [child.key, ...(child.children || []).map(item => item.key)])
    ]));
    return Object.fromEntries(Object.entries(value)
      .filter(([key, enabled]) => allowed.has(key) && typeof enabled === "boolean"));
  }

  function examModeDefinition(modeId) {
    return typeof EXAM_MODE.modeForId === "function" ? EXAM_MODE.modeForId(modeId) : null;
  }

  function accessKeysForRoute(route) {
    if (!route || state.user?.role === "admin") return [];
    if (route.view === "bookmarks") return ["bookmarks"];
    if (["exams", "attempts", "admin"].includes(route.view)) return [];
    const ieltsViews = ["parts", "books", "exercises", "exercise", "exam-modes", "exam-practice"];
    const exam = String(route.exam || (ieltsViews.includes(route.view) ? "ielts" : ""));
    const keys = exam && EXAM_ACCESS_KEYS[exam] ? [EXAM_ACCESS_KEYS[exam]] : [];
    if (route.view === "exam-practice") {
      const mode = examModeDefinition(route.modeId);
      mode?.parts?.forEach(part => keys.push(`ielts.part.${part}`));
      return keys;
    }
    const part = Number(route.part || 0);
    const book = Number(route.book || 0);
    if (exam === "ielts" && part >= 1 && part <= 3) keys.push(`ielts.part.${part}`);
    if (exam === "ielts" && part >= 1 && part <= 3 && book >= 1 && book <= 16) {
      keys.push(`ielts.part.${part}.book.${book}`);
    }
    return keys;
  }

  function hasAccess(keys) {
    return state.user?.role === "admin" || keys.every(key => state.access[key] !== false);
  }

  function visibleBookLimit(part) {
    return VISIBLE_BOOK_LIMITS[Number(part)] || 16;
  }

  function bookIsVisible(book, part) {
    const number = Number(book);
    return Number.isInteger(number) && number >= 1 && number <= visibleBookLimit(part);
  }

  function routeIsVisible(route) {
    if (!route || !["exercises", "exercise"].includes(route.view)) return true;
    return bookIsVisible(route.book, route.part);
  }

  function routeAllowed(route) {
    return routeIsVisible(route) && hasAccess(accessKeysForRoute(route));
  }

  function examAvailable(examId) {
    return examId === "ielts";
  }

  function bookAvailable(part, book) {
    return bookIsVisible(book, part) && Boolean(speakingBook(Number(part), Number(book))?.exercises?.length);
  }

  function preferredScrollBehavior() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  function toast(message, type = "info") {
    if (!dom.toastRegion) return;
    const item = document.createElement("div");
    item.className = `toast${type === "error" ? " error" : ""}`;
    item.textContent = String(message || "");
    dom.toastRegion.append(item);
    window.setTimeout(() => item.remove(), 4400);
  }

  function setConnection(label, mode = "connecting") {
    if (!dom.connectionPill) return;
    dom.connectionPill.textContent = label;
    dom.connectionPill.dataset.connectionState = mode;
  }

  function setLoginStatus(message, success = false) {
    if (!dom.loginStatus) return;
    dom.loginStatus.textContent = message || "";
    dom.loginStatus.classList.toggle("success", success);
  }

  function restoreRate() {
    try {
      const stored = Number(localStorage.getItem(RATE_KEY));
      return AUDIO_RATES.includes(stored) ? stored : 1;
    } catch {
      return 1;
    }
  }

  function restoreHighlight() {
    try {
      return localStorage.getItem(HIGHLIGHT_KEY) !== "false";
    } catch {
      return true;
    }
  }

  function restoreNaturalExchange() {
    try {
      return localStorage.getItem(NATURAL_EXCHANGE_KEY) !== "false";
    } catch {
      return true;
    }
  }

  function setNaturalExchange(enabled) {
    state.examNaturalExchange = Boolean(enabled);
    try {
      localStorage.setItem(NATURAL_EXCHANGE_KEY, String(state.examNaturalExchange));
    } catch {
      // The preference remains active for this page when storage is unavailable.
    }
    if (state.route.view === "exam-modes") renderExamModes();
  }

  function setRate(value) {
    const rate = Number(value);
    if (!AUDIO_RATES.includes(rate)) return;
    state.selectedRate = rate;
    try {
      localStorage.setItem(RATE_KEY, String(rate));
    } catch {
      // Preferences remain available for this page when storage is unavailable.
    }
    if (state.modelAudio) {
      state.modelAudio.defaultPlaybackRate = rate;
      state.modelAudio.playbackRate = rate;
    }
    syncAudioControls();
  }

  function setHighlight(enabled) {
    state.highlightEnabled = Boolean(enabled);
    try {
      localStorage.setItem(HIGHLIGHT_KEY, String(state.highlightEnabled));
    } catch {
      // Preferences remain available for this page when storage is unavailable.
    }
    if (!state.highlightEnabled) {
      clearHighlight();
      if (Number(currentExercise()?.part) === 1 && state.modelAudio && !state.modelAudio.paused && !state.modelAudio.ended) {
        startHighlightLoop();
      }
    } else if (state.modelAudio && !state.modelAudio.paused && !state.modelAudio.ended) {
      updateHighlight();
      startHighlightLoop();
    }
    syncAudioControls();
  }

  function saveSession() {
    if (!state.user || !state.authToken) return;
    const session = {
      token: state.authToken,
      role: state.user.role,
      id: state.user.id || "",
      name: state.user.name || ""
    };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // The authenticated session still works for this page when storage is unavailable.
    }
  }

  function restoreSession() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (!saved?.token || !["student", "admin"].includes(saved.role)) return false;
      state.authToken = String(saved.token);
      state.user = {
        id: String(saved.id || ""),
        name: String(saved.name || (saved.role === "admin" ? CONFIG.adminUsername : "Student")),
        role: saved.role
      };
      return true;
    } catch {
      try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage is unavailable. */ }
      return false;
    }
  }

  function clearSession() {
    state.authGeneration += 1;
    state.user = null;
    state.authToken = "";
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage is unavailable. */ }
  }

  function initialiseSupabaseClient() {
    if (state.supabase) return state.supabase;
    if (!window.supabase?.createClient || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
      throw new Error("Supabase 設定未能載入，請稍後再試。");
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
    const sessionResult = await client.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    let session = sessionResult.data?.session || null;
    if (!session) {
      const signInResult = await client.auth.signInAnonymously();
      if (signInResult.error) throw signInResult.error;
      session = signInResult.data?.session || null;
    }
    if (!session?.user?.id) throw new Error("Supabase anonymous session is unavailable.");
    state.supabaseReady = true;
    return client;
  }

  async function studentLogin(username, password) {
    const client = await ensureSupabaseSession();
    const rpcName = String(CONFIG.studentLoginRpc || "flashcard_student_login");
    const { data, error } = await client.rpc(rpcName, {
      p_name: username,
      p_password: password
    });
    if (error) throw error;
    if (!Array.isArray(data) || !data.length || !data[0]?.session_token) return null;
    const row = data[0];
    return {
      token: String(row.session_token),
      access: normalizeAccess(row.access),
      user: {
        id: String(row.id || ""),
        name: String(row.name || username),
        role: "student"
      }
    };
  }

  function workerBaseUrl() {
    const base = String(CONFIG.workerBaseUrl || "").trim().replace(/\/+$/, "");
    if (!base) {
      throw new Error("錄音服務尚未完成連接。請先在 speaking-system-config.js 設定 Worker 網址。");
    }
    return base;
  }

  function workerEndpoint(path) {
    const value = String(path || "");
    if (/^https?:\/\//i.test(value)) return value;
    return `${workerBaseUrl()}/${value.replace(/^\/+/, "")}`;
  }

  async function parseApiError(response) {
    let message = `服務回應錯誤（${response.status}）`;
    let code = "";
    try {
      const payload = await response.clone().json();
      message = payload?.error?.message || payload?.error || payload?.message || message;
      code = String(payload?.code || payload?.error?.code || "");
    } catch {
      try {
        const text = await response.text();
        if (text.trim()) message = text.trim().slice(0, 240);
      } catch {
        // Keep the status-based message.
      }
    }
    const error = new Error(message);
    error.status = response.status;
    if (code) error.code = code;
    return error;
  }

  async function apiRaw(path, options = {}, includeAuth = true) {
    const headers = new Headers(options.headers || {});
    if (includeAuth && state.authToken) headers.set("Authorization", `Bearer ${state.authToken}`);
    let response;
    try {
      response = await fetch(workerEndpoint(path), {
        ...options,
        headers,
        credentials: "omit"
      });
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      const connectionError = new Error("暫時未能連接錄音服務。請檢查網絡後再試。");
      connectionError.code = "RECORDING_SERVICE_UNREACHABLE";
      connectionError.cause = error;
      throw connectionError;
    }
    if (!response.ok) {
      const error = await parseApiError(response);
      if (includeAuth && response.status === 401) handleSessionExpired();
      throw error;
    }
    return response;
  }

  async function apiJson(path, options = {}, includeAuth = true) {
    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    const response = await apiRaw(path, { ...options, headers }, includeAuth);
    if (response.status === 204) return null;
    return response.json();
  }

  async function adminLogin(username, password) {
    const endpoint = CONFIG.endpoints?.adminLogin || "/v1/admin/login";
    const payload = await apiJson(endpoint, {
      method: "POST",
      body: JSON.stringify({ username, password })
    }, false);
    const token = payload?.admin?.adminToken
      || payload?.admin?.token
      || payload?.token
      || payload?.accessToken
      || payload?.access_token;
    if (!token) return null;
    return {
      token: String(token),
      user: {
        id: String(payload?.admin?.id || payload?.user?.id || payload?.id || "speaking-admin"),
        name: String(payload?.admin?.name || payload?.user?.name || payload?.name || username),
        role: "admin"
      }
    };
  }

  async function validateRestoredSession() {
    if (!state.user || !state.authToken) throw new Error("Missing restored session.");
    const isAdmin = state.user.role === "admin";
    const endpoint = isAdmin
      ? (CONFIG.endpoints?.adminMe || "/v1/admin/me")
      : (CONFIG.endpoints?.studentMe || "/v1/student/me");
    const payload = await apiJson(endpoint);
    const profile = isAdmin ? payload?.admin : payload?.student;
    if (!profile?.id || !profile?.name) throw new Error("登入時段未能通過驗證。");
    state.user = {
      id: String(profile.id),
      name: String(profile.name),
      role: isAdmin ? "admin" : "student"
    };
    state.access = isAdmin ? {} : normalizeAccess(payload?.access || profile?.access);
    saveSession();
  }

  async function handleLogin(form) {
    const submit = form.querySelector('[type="submit"]');
    const usernameInput = form.elements.username;
    const passwordInput = form.elements.password;
    const username = String(usernameInput.value || "").trim();
    let password = String(passwordInput.value || "");
    if (!username || !password) {
      setLoginStatus("請輸入用戶名稱及密碼。");
      (!username ? usernameInput : passwordInput).focus();
      return;
    }

    submit.disabled = true;
    submit.querySelector("span:first-child").textContent = "Signing in…";
    setLoginStatus("正在安全登入…", true);
    setConnection("登入中", "connecting");

    try {
      const isAdmin = username.toLocaleLowerCase("en")
        === String(CONFIG.adminUsername || "Sam Admin Speaking").trim().toLocaleLowerCase("en");
      const result = isAdmin
        ? await adminLogin(username, password)
        : await studentLogin(username, password);
      if (!result) throw new Error("用戶名稱或密碼不正確。");
      state.authGeneration += 1;
      state.user = result.user;
      state.authToken = result.token;
      state.access = normalizeAccess(result.access);
      if (!isAdmin) {
        await validateRestoredSession();
        await loadBookmarks({ quiet: true });
        if (!state.user) return;
      }
      saveSession();
      form.reset();
      showPortal();
      setConnection(isAdmin ? "Admin 已連接" : "Supabase 已連接", "live");
      navigate({ view: isAdmin ? "admin" : "exams" }, { reset: true });
    } catch (error) {
      console.warn("Speaking System login failed:", error);
      const message = /Failed to fetch|NetworkError/i.test(String(error?.message))
        ? "網絡連線失敗，請檢查連線後再試。"
        : String(error?.message || "登入失敗，請再試一次。");
      setLoginStatus(message);
      setConnection("連接失敗", "error");
      passwordInput.value = "";
      passwordInput.focus();
    } finally {
      submit.disabled = false;
      submit.querySelector("span:first-child").textContent = "Enter Speaking System";
      password = "";
    }
  }

  function showLogin() {
    stopModelAudio();
    clearExamSession();
    cancelRecorder();
    cleanupAttemptAudio();
    dom.loginView.hidden = false;
    dom.portalView.hidden = true;
    dom.authActions.hidden = true;
    dom.backButton.hidden = true;
    document.body.classList.remove("portal-active");
    setConnection("等待登入", "connecting");
    window.setTimeout(() => dom.loginForm?.elements?.username?.focus(), 0);
  }

  function showPortal() {
    dom.loginView.hidden = true;
    dom.portalView.hidden = false;
    dom.authActions.hidden = false;
    if (dom.adminButton) dom.adminButton.hidden = state.user?.role !== "admin";
    document.body.classList.add("portal-active");
  }

  function resetAuthenticatedState(message) {
    cleanupPart1Reveal();
    clearSession();
    state.route = { view: "exams" };
    state.routeHistory = [];
    state.attempts = [];
    state.attemptTotal = 0;
    state.attemptsById.clear();
    state.examAttempts = [];
    state.examAttemptsById.clear();
    state.access = {};
    state.bookmarks = [];
    state.bookmarksLoaded = false;
    state.bookmarksSaving = false;
    state.adminStudents = [];
    state.adminStudentsLoaded = false;
    state.adminStudentsLoading = false;
    state.adminAccessSaving = false;
    state.adminAccessDrafts.clear();
    state.adminStudentQuery = "";
    state.selectedAdminStudentId = "";
    showLogin();
    state.attemptBlobCache.clear();
    if (dom.content) dom.content.replaceChildren();
    if (dom.breadcrumbs) dom.breadcrumbs.replaceChildren();
    setLoginStatus(message, true);
  }

  function handleSessionExpired() {
    if (!state.user) return;
    resetAuthenticatedState("登入時段已過期，請重新登入。");
    setConnection("登入時段已過期", "error");
  }

  async function handleLogout() {
    if (!confirmRecordingAbandonment()) return;
    if (state.adminAccessDrafts.size && !window.confirm("尚有未儲存的學生權限改動。登出會捨棄這些改動，確定繼續嗎？")) return;
    const role = state.user?.role;
    const token = state.authToken;
    let revokePromise = null;
    if (role === "admin" && token) {
      try {
        const endpoint = CONFIG.endpoints?.adminLogout || "/v1/admin/logout";
        revokePromise = fetch(workerEndpoint(endpoint), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "omit",
          keepalive: true
        });
      } catch (error) {
        console.warn("Could not start admin session revocation:", error);
      }
    }

    resetAuthenticatedState("你已安全登出。");
    if (!revokePromise) return;
    try {
      const response = await revokePromise;
      if (!response.ok && response.status !== 401) throw new Error(`Admin logout returned ${response.status}`);
    } catch (error) {
      console.warn("Admin session revocation failed:", error);
      toast("本機已登出，但伺服器未能確認管理員時段已撤銷。請檢查網絡。", "error");
    }
  }

  function routeLabel(route) {
    switch (route?.view) {
      case "parts": return "IELTS 說話考試";
      case "exam-modes": return "考試練習模式";
      case "exam-practice": return examModeDefinition(route.modeId)?.shortLabel || "考試練習";
      case "books": return `Part ${route.part}`;
      case "exercises": return `Book ${route.book}`;
      case "exercise": return `Exercise ${route.exerciseIndex}`;
      case "attempts": return state.user?.role === "admin" ? "所有錄音" : "我的錄音";
      case "bookmarks": return "書簽";
      case "admin": return "Admin 控制台";
      default: return "選擇考試";
    }
  }

  function routesEqual(left, right) {
    return JSON.stringify(left || {}) === JSON.stringify(right || {});
  }

  function navigationHasUnsavedRecording() {
    return Boolean(
      ["recording", "paused"].includes(state.mediaRecorder?.state)
      || state.recordingProcessing
      || (state.recordedMp3 && !state.recordingSaved)
      || (state.route.view === "exam-practice" && state.examSession && !state.examSession.completed)
    );
  }

  function confirmRecordingAbandonment() {
    if (!navigationHasUnsavedRecording()) return true;
    if (
      !["recording", "paused"].includes(state.mediaRecorder?.state)
      && !state.recordingProcessing
      && !(state.recordedMp3 && !state.recordingSaved)
      && state.route.view === "exam-practice"
      && state.examSession
      && !state.examSession.completed
    ) {
      return window.confirm("考試練習仍在進行中。離開後不能繼續本次進度；已儲存的錄音仍會保留在錄音庫。確定離開嗎？");
    }
    return window.confirm("這次錄音尚未儲存。離開後將會捨棄錄音，確定繼續嗎？");
  }

  function navigate(route, options = {}) {
    if (!state.user) return;
    if (!routeAllowed(route)) {
      toast("你的帳戶尚未開放這個練習範圍。", "error");
      return;
    }
    if (!routesEqual(route, state.route) && (state.examSaving || state.recordingProcessing)) {
      toast("錄音正在處理或上載，完成後才可離開。", "info");
      return;
    }
    if (!options.skipGuard && !routesEqual(route, state.route) && !confirmRecordingAbandonment()) return;
    const abandoningExam = !routesEqual(route, state.route)
      && state.route.view === "exam-practice"
      && state.examSession
      && !state.examSession.completed;
    stopModelAudio();
    clearExamPhaseTimer();
    cancelExamSpeech();
    cleanupPart1Reveal();
    cleanupAttemptAudio();
    if (!routesEqual(route, state.route)) cancelRecorder();
    if (abandoningExam) clearExamSession();

    if (options.reset) {
      state.routeHistory = [];
    } else if (!options.fromBack && state.route?.view && !routesEqual(route, state.route)) {
      state.routeHistory.push({ ...state.route });
    }
    if (!routesEqual(route, state.route)) state.routeGeneration += 1;
    state.route = { ...route };
    renderRoute();
    window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
    document.querySelector("#main-content")?.focus({ preventScroll: true });
  }

  function goBack() {
    if (state.examSaving || state.recordingProcessing) {
      toast("錄音正在處理或上載，完成後才可離開。", "info");
      return;
    }
    if (!confirmRecordingAbandonment()) return;
    const previous = state.routeHistory.pop();
    if (previous) {
      navigate(previous, { fromBack: true, skipGuard: true });
      return;
    }
    navigate({ view: "exams" }, { reset: true, skipGuard: true });
  }

  function directRoute(route) {
    navigate(route);
  }

  function renderBreadcrumbs() {
    const route = state.route;
    const crumbs = [{ label: "Speaking System", route: { view: "exams" } }];
    if (["parts", "books", "exercises", "exercise", "exam-modes", "exam-practice"].includes(route.view)) {
      crumbs.push({ label: "IELTS", route: { view: "parts", exam: "ielts" } });
    }
    if (["exam-modes", "exam-practice"].includes(route.view)) {
      crumbs.push({ label: "考試練習模式", route: route.view === "exam-modes" ? null : { view: "exam-modes", exam: "ielts" } });
    }
    if (route.view === "exam-practice") {
      crumbs.push({ label: examModeDefinition(route.modeId)?.shortLabel || "考試練習", route: null });
    }
    if (["books", "exercises", "exercise"].includes(route.view)) {
      crumbs.push({ label: `Part ${route.part}`, route: { view: "books", exam: "ielts", part: route.part } });
    }
    if (["exercises", "exercise"].includes(route.view)) {
      crumbs.push({ label: `Book ${route.book}`, route: { view: "exercises", exam: "ielts", part: route.part, book: route.book } });
    }
    if (route.view === "exercise") {
      crumbs.push({ label: `Exercise ${route.exerciseIndex}`, route: null });
    }
    if (route.view === "attempts") {
      crumbs.push({ label: state.user?.role === "admin" ? "所有錄音" : "我的錄音", route: null });
    }
    if (route.view === "bookmarks") crumbs.push({ label: "書簽", route: null });
    if (route.view === "admin") crumbs.push({ label: "Admin 控制台", route: null });

    dom.breadcrumbs.innerHTML = crumbs.map((crumb, index) => {
      const isLast = index === crumbs.length - 1;
      const content = isLast || !crumb.route
        ? `<span class="breadcrumb-current" aria-current="page">${escapeHtml(crumb.label)}</span>`
        : `<button class="breadcrumb-button" type="button" data-breadcrumb-index="${index}">${escapeHtml(crumb.label)}</button>`;
      return `${index ? '<span class="breadcrumb-separator" aria-hidden="true">/</span>' : ""}${content}`;
    }).join("");
    dom.breadcrumbs._routes = crumbs.map(item => item.route);
    dom.backButton.hidden = state.routeHistory.length === 0 && state.route.view === "exams";
    syncHeaderBookmark();
  }

  function renderRoute() {
    renderBreadcrumbs();
    switch (state.route.view) {
      case "parts":
        renderParts();
        break;
      case "books":
        renderBooks(state.route.part);
        break;
      case "exercises":
        renderExercises();
        break;
      case "exercise":
        renderExercise();
        break;
      case "exam-modes":
        renderExamModes();
        break;
      case "exam-practice":
        renderExamPractice();
        break;
      case "attempts":
        renderAttemptsPage();
        break;
      case "bookmarks":
        renderBookmarks();
        break;
      case "admin":
        renderAdminPanel();
        break;
      default:
        renderExams();
    }
  }

  function sectionHeader(title, description = "", chip = "") {
    return `
      <div class="section-heading">
        <div>
          <h1>${escapeHtml(title)}</h1>
          ${description ? `<p>${escapeHtml(description)}</p>` : ""}
        </div>
        ${chip ? `<span class="${state.user?.role === "admin" ? "admin-chip" : "welcome-chip"}">${escapeHtml(chip)}</span>` : ""}
      </div>
    `;
  }

  function normalizeSearchText(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[’]/g, "'")
      .toLocaleLowerCase("en")
      .replace(/[^a-z0-9一-鿿]+/g, " ")
      .trim();
  }

  function searchTokens(value) {
    return normalizeSearchText(value).split(/\s+/).filter(Boolean);
  }

  function searchMatches(haystack, tokens) {
    if (!tokens.length) return false;
    const normalized = normalizeSearchText(haystack);
    return tokens.every(token => normalized.includes(token));
  }

  function bookmarkKey(bookmark) {
    if (!bookmark || typeof bookmark !== "object") return "";
    return [bookmark.kind, bookmark.exam, bookmark.part || "", bookmark.book || "", bookmark.exerciseId || "", bookmark.questionNumber || ""].join("|");
  }

  function normalizeBookmarks(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    return value.filter(item => {
      const key = bookmarkKey(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 200);
  }

  function bookmarkIsVisible(bookmark) {
    return !["book", "exercise", "question"].includes(bookmark?.kind) || bookIsVisible(bookmark.book, bookmark.part);
  }

  function isBookmarked(bookmark) {
    const key = bookmarkKey(bookmark);
    return Boolean(key && state.bookmarks.some(item => bookmarkKey(item) === key));
  }

  function currentRouteBookmark() {
    const route = state.route;
    if (route.view === "parts") return { kind: "exam", exam: "ielts" };
    if (route.view === "books") return { kind: "part", exam: "ielts", part: Number(route.part) };
    if (route.view === "exercises") {
      return { kind: "book", exam: "ielts", part: Number(route.part), book: Number(route.book) };
    }
    if (route.view === "exercise") {
      const exercise = currentExercise();
      if (!exercise) return null;
      return {
        kind: "exercise",
        exam: "ielts",
        part: Number(route.part),
        book: Number(route.book),
        exerciseId: exercise.id
      };
    }
    return null;
  }

  function bookmarkTitle(bookmark) {
    if (bookmark?.kind === "exam") return EXAMS.find(exam => exam.id === bookmark.exam)?.title || bookmark.exam;
    if (bookmark?.kind === "part") return `IELTS 說話考試 · Part ${bookmark.part}`;
    if (bookmark?.kind === "book") return `IELTS Part ${bookmark.part} · Book ${bookmark.book}`;
    if (bookmark?.kind === "exercise") {
      const exercise = speakingExercises(bookmark.part, bookmark.book).find(item => item.id === bookmark.exerciseId);
      return exercise?.title || "Speaking exercise";
    }
    if (bookmark?.kind === "question") {
      const exercise = speakingExercises(bookmark.part, bookmark.book).find(item => item.id === bookmark.exerciseId);
      if (Number(bookmark.part) === 1) {
        const question = exercise?.questions?.find(item => Number(item.number) === Number(bookmark.questionNumber));
        return question?.questionEn || exercise?.title || "IELTS Speaking question";
      }
      return exercise?.title || "IELTS Speaking question";
    }
    return "Speaking 書簽";
  }

  function bookmarkSubtitle(bookmark) {
    if (bookmark?.kind === "question") {
      const exercise = speakingExercises(bookmark.part, bookmark.book).find(item => item.id === bookmark.exerciseId);
      if (Number(bookmark.part) === 1) {
        const question = exercise?.questions?.find(item => Number(item.number) === Number(bookmark.questionNumber));
        return question?.questionZh || `IELTS Part 1 · Book ${bookmark.book} · Q${bookmark.questionNumber}`;
      }
      return exercise?.titleZh || `IELTS Part ${bookmark.part} · Book ${bookmark.book}`;
    }
    if (bookmark?.kind === "exercise") {
      const exercise = speakingExercises(bookmark.part, bookmark.book).find(item => item.id === bookmark.exerciseId);
      return exercise?.titleZh || `IELTS Part ${bookmark.part} · Book ${bookmark.book}`;
    }
    if (bookmark?.kind === "book") return "練習冊";
    if (bookmark?.kind === "part") return "IELTS Speaking";
    return "練習範疇";
  }

  function routeForBookmark(bookmark) {
    if (!bookmarkIsVisible(bookmark)) return null;
    if (bookmark?.kind === "exam" && bookmark.exam === "ielts") return { view: "parts", exam: "ielts" };
    if (bookmark?.kind === "part") return { view: "books", exam: "ielts", part: Number(bookmark.part) };
    if (bookmark?.kind === "book") {
      return { view: "exercises", exam: "ielts", part: Number(bookmark.part), book: Number(bookmark.book) };
    }
    if (bookmark?.kind === "exercise") {
      const exercise = speakingExercises(bookmark.part, bookmark.book).find(item => item.id === bookmark.exerciseId);
      return exercise ? {
        view: "exercise",
        exam: "ielts",
        part: Number(bookmark.part),
        book: Number(bookmark.book),
        exerciseIndex: exercise.index
      } : null;
    }
    if (bookmark?.kind === "question") {
      const exercise = speakingExercises(bookmark.part, bookmark.book).find(item => item.id === bookmark.exerciseId);
      return exercise ? {
        view: "exercise",
        exam: "ielts",
        part: Number(bookmark.part),
        book: Number(bookmark.book),
        exerciseIndex: exercise.index,
        questionNumber: Number(bookmark.questionNumber)
      } : null;
    }
    return null;
  }

  function bookmarkButtonHtml(bookmark, extraClass = "") {
    if (state.user?.role === "admin" || !hasAccess(["bookmarks"])) return "";
    const active = isBookmarked(bookmark);
    const encoded = encodeURIComponent(JSON.stringify(bookmark));
    return `
      <button class="selection-bookmark-button${extraClass ? ` ${extraClass}` : ""}${active ? " active" : ""}" type="button"
        data-bookmark="${escapeHtml(encoded)}" aria-pressed="${active}" aria-label="${active ? "移除書簽" : "加入書簽"}" title="${active ? "移除書簽" : "加入書簽"}">
        <span aria-hidden="true">${active ? "★" : "☆"}</span>
      </button>
    `;
  }

  function bookmarkFromElement(element) {
    try {
      return JSON.parse(decodeURIComponent(element?.dataset?.bookmark || ""));
    } catch {
      return null;
    }
  }

  function syncBookmarkButtons() {
    document.querySelectorAll("[data-bookmark]").forEach(button => {
      const active = isBookmarked(bookmarkFromElement(button));
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", active ? "移除書簽" : "加入書簽");
      button.setAttribute("title", active ? "移除書簽" : "加入書簽");
      const icon = button.querySelector("span");
      if (icon) icon.textContent = active ? "★" : "☆";
      button.disabled = state.bookmarksSaving;
    });
    syncHeaderBookmark();
  }

  function syncHeaderBookmark() {
    const button = dom.headerBookmarkButton;
    if (!button) return;
    const bookmark = currentRouteBookmark();
    const visible = state.user?.role === "student" && hasAccess(["bookmarks"]) && Boolean(bookmark);
    button.hidden = !visible;
    button.disabled = state.bookmarksSaving;
    if (!visible) return;
    const active = isBookmarked(bookmark);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    button.querySelector("span:first-child").textContent = active ? "★" : "☆";
    const label = button.querySelector("[data-header-bookmark-label]");
    if (label) label.textContent = active ? "已加入書簽" : "加入書簽";
  }

  async function loadBookmarks(options = {}) {
    if (state.user?.role !== "student" || !hasAccess(["bookmarks"])) {
      state.bookmarks = [];
      state.bookmarksLoaded = true;
      return;
    }
    try {
      const payload = await apiJson(CONFIG.endpoints?.bookmarks || "/v1/bookmarks");
      state.bookmarks = normalizeBookmarks(payload?.bookmarks);
      state.bookmarksLoaded = true;
      syncBookmarkButtons();
    } catch (error) {
      if (options.quiet) {
        state.bookmarks = [];
        state.bookmarksLoaded = false;
        return;
      }
      toast(String(error?.message || "未能載入書簽。"), "error");
      throw error;
    }
  }

  async function toggleBookmark(bookmark) {
    if (!bookmark || state.user?.role !== "student" || state.bookmarksSaving || !hasAccess(["bookmarks"])) return;
    if (!state.bookmarksLoaded) {
      state.bookmarksSaving = true;
      syncBookmarkButtons();
      try {
        await loadBookmarks();
      } catch {
        return;
      } finally {
        state.bookmarksSaving = false;
        syncBookmarkButtons();
      }
    }
    const previous = [...state.bookmarks];
    const key = bookmarkKey(bookmark);
    state.bookmarks = isBookmarked(bookmark)
      ? state.bookmarks.filter(item => bookmarkKey(item) !== key)
      : [...state.bookmarks, bookmark];
    state.bookmarksSaving = true;
    syncBookmarkButtons();
    try {
      const payload = await apiJson(CONFIG.endpoints?.bookmarks || "/v1/bookmarks", {
        method: "PUT",
        body: JSON.stringify({ bookmarks: state.bookmarks })
      });
      state.bookmarks = normalizeBookmarks(payload?.bookmarks);
      if (state.route.view === "bookmarks") renderBookmarks();
      toast(isBookmarked(bookmark) ? "已加入書簽。" : "已移除書簽。", "info");
    } catch (error) {
      state.bookmarks = previous;
      toast(String(error?.message || "未能儲存書簽。"), "error");
    } finally {
      state.bookmarksSaving = false;
      syncBookmarkButtons();
    }
  }

  function renderSpeakingSearchResults(query = "") {
    const list = document.querySelector("[data-speaking-search-results]");
    if (!list) return;
    const tokens = searchTokens(query);
    if (!tokens.length) {
      list.innerHTML = "";
      return;
    }
    const sections = EXAMS
      .filter(exam => examAvailable(exam.id) && hasAccess([EXAM_ACCESS_KEYS[exam.id]]))
      .filter(exam => searchMatches(`${exam.title} ${exam.description} ${exam.id}`, tokens))
      .slice(0, SEARCH_RESULT_LIMITS.sections);
    const exercises = allSpeakingExercises()
      .filter(exercise => routeAllowed({ view: "exercise", exam: "ielts", part: exercise.part, book: exercise.book }))
      .filter(exercise => !exercise.unavailable)
      .filter(exercise => {
        const part3Text = (exercise.responseModels || []).flatMap(model => (
          model.steps.flatMap(step => [step.labelEn, step.labelZh, step.textEn, step.textZh])
        )).join(" ");
        const part2Text = (exercise.responses || []).flatMap(response => (
          [response.headingEn, response.headingZh, response.textEn, response.textZh]
        )).join(" ");
        const part1Text = (exercise.questions || []).flatMap(question => (
          [question.questionEn, question.questionZh, question.answerEn, question.answerZh]
        )).join(" ");
        return searchMatches(`${exercise.title} ${exercise.titleZh} ${exercise.cueText} ${exercise.themeTitle || ""} ${part1Text} ${part3Text} ${part2Text} IELTS Part ${exercise.part} Book ${exercise.book}`, tokens);
      })
      .slice(0, SEARCH_RESULT_LIMITS.exercises);
    if (!sections.length && !exercises.length) {
      list.innerHTML = '<p class="search-empty">找不到已開放練習內的相關範疇或題目。</p>';
      return;
    }
    list.innerHTML = `
      ${sections.length ? `<div class="search-section-label">練習範疇</div>${sections.map(exam => `
        <button class="speaking-search-result" type="button" data-search-exam="${escapeHtml(exam.id)}">
          <span><strong>${escapeHtml(exam.title)}</strong><small>${escapeHtml(exam.description)}</small></span><em>進入</em>
        </button>`).join("")}` : ""}
      ${exercises.length ? `<div class="search-section-label">題目</div>${exercises.map(exercise => `
        <button class="speaking-search-result" type="button" data-search-exercise="${exercise.index}" data-search-part="${exercise.part}" data-search-book="${exercise.book}">
          <span><strong>${escapeHtml(exercise.title)}</strong><small>${escapeHtml(exercise.titleZh ? `${exercise.titleZh} · IELTS Part ${exercise.part} · Book ${exercise.book}` : `IELTS Part ${exercise.part} · Book ${exercise.book}`)}</small></span><em>練習</em>
        </button>`).join("")}` : ""}
    `;
  }

  function renderExams() {
    const chip = state.user?.role === "admin"
      ? `Admin · ${state.user.name}`
      : `Welcome, ${state.user?.name || "Student"}`;
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader("選擇練習範疇", "先選擇你想訓練的考試或說話情境。", chip)}
        <div class="portal-search-area">
          <form class="portal-search" data-speaking-search-form>
            <label for="speaking-search-input">搜尋練習 / 題目</label>
            <input id="speaking-search-input" type="search" data-speaking-search-input placeholder="輸入字眼，即可搜尋已開放練習">
          </form>
          <div class="speaking-search-results" data-speaking-search-results></div>
        </div>
        <div class="choice-grid">
          ${EXAMS.map((exam, index) => {
            const available = examAvailable(exam.id);
            const allowed = hasAccess([EXAM_ACCESS_KEYS[exam.id]]);
            const bookmark = { kind: "exam", exam: exam.id };
            return `
              <div class="selection-card-wrap choice-card-wrap">
                <button class="choice-card${available ? "" : " coming-soon"}${allowed ? "" : " access-locked"}" type="button" data-exam="${escapeHtml(exam.id)}" ${allowed ? "" : 'aria-disabled="true"'}>
                  <span class="card-number">0${index + 1} · SPEAKING</span>
                  <strong>${escapeHtml(exam.title)}</strong>
                  <small>${escapeHtml(exam.description)}</small>
                  ${allowed ? "" : '<span class="availability">尚未開放</span>'}
                </button>
                ${allowed ? bookmarkButtonHtml(bookmark) : ""}
              </div>`;
          }).join("")}
          ${hasAccess(["bookmarks"]) && state.user?.role === "student" ? `
            <div class="selection-card-wrap choice-card-wrap">
              <button class="choice-card bookmarks-choice-card" type="button" data-go="bookmarks">
                <span class="card-number">06 · SPEAKING</span>
                <strong>書簽</strong>
                <small>已收藏的練習範疇、練習冊及題目</small>
              </button>
            </div>` : ""}
        </div>
      </section>
    `;
    renderSpeakingSearchResults("");
  }

  function renderParts() {
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader("IELTS 說話考試")}
        <div class="choice-grid parts-grid">
          ${[1, 2, 3].map(part => {
            const allowed = hasAccess(["exam.ielts", `ielts.part.${part}`]);
            const bookmark = { kind: "part", exam: "ielts", part };
            return `
              <div class="selection-card-wrap choice-card-wrap">
                <button class="choice-card${allowed ? "" : " access-locked"}" type="button" data-part="${part}" ${allowed ? "" : 'aria-disabled="true"'}>
                  <span class="card-number">IELTS SPEAKING</span>
                  <strong>Part ${part}</strong>
                  <small>${part === 2 ? "Cue card 長答示範與錄音練習" : part === 1 ? "日常主題短答練習" : "延伸討論及分析練習"}</small>
                  ${allowed ? "" : '<span class="availability">尚未開放</span>'}
                </button>
                ${allowed ? bookmarkButtonHtml(bookmark) : ""}
              </div>`;
          }).join("")}
          <div class="selection-card-wrap choice-card-wrap exam-practice-card-wrap">
            <button class="choice-card exam-practice-choice${hasAccess(["exam.ielts"]) ? "" : " access-locked"}" type="button" data-exam-practice-modes ${hasAccess(["exam.ielts"]) ? "" : 'aria-disabled="true"'}>
              <span class="card-number">IELTS SPEAKING · EXAM MODE</span>
              <strong>考試練習模式</strong>
              <small>隨機抽題、限時準備及完整錄音流程</small>
              ${hasAccess(["exam.ielts"]) ? "" : '<span class="availability">尚未開放</span>'}
            </button>
          </div>
        </div>
      </section>
    `;
  }

  function clearExamPhaseTimer() {
    if (state.examPhaseTimer) window.clearInterval(state.examPhaseTimer);
    state.examPhaseTimer = 0;
    if (state.examMessageTimer) window.clearTimeout(state.examMessageTimer);
    state.examMessageTimer = 0;
    const finish = state.examMessageFinish;
    state.examMessageFinish = null;
    if (typeof finish === "function") finish(false);
  }

  function clearExamSession() {
    clearExamPhaseTimer();
    cancelExamSpeech();
    state.examFlowGeneration += 1;
    state.examSession = null;
    state.examStartGeneration += 1;
    state.examStarting = false;
    state.examSaving = false;
    state.examRatingSaving = false;
  }

  function uniqueExamExercises(exercises, part) {
    const seenTitles = new Set();
    const seenQuestionSets = new Set();
    return exercises.filter(exercise => {
      const titleKey = normalizeSearchText(exercise.title);
      const questionSetKey = Number(part) === 1
        ? (exercise.questions || []).map(question => normalizeSearchText(question.questionEn)).join("|")
        : "";
      if (seenTitles.has(titleKey) || (questionSetKey && seenQuestionSets.has(questionSetKey))) return false;
      seenTitles.add(titleKey);
      if (questionSetKey) seenQuestionSets.add(questionSetKey);
      return true;
    });
  }

  function examQuestionPools() {
    const pools = { 1: [], 2: [], 3: [] };
    speakingBooks().forEach(book => {
      const part = Number(book?.part || 0);
      const bookNumber = Number(book?.book || 0);
      if (![1, 2, 3].includes(part) || !bookIsVisible(bookNumber, part)) return;
      if (!hasAccess(["exam.ielts", `ielts.part.${part}`, `ielts.part.${part}.book.${bookNumber}`])) return;
      pools[part].push(...speakingExercises(part, bookNumber).filter(exercise => !exercise.unavailable));
    });
    pools[1] = uniqueExamExercises(pools[1], 1);
    pools[3] = uniqueExamExercises(pools[3], 3);
    return pools;
  }

  function examCoverHtml() {
    return `
      <figure class="exam-practice-cover">
        <img src="assets/speaking-system/ielts-exam-practice-mode.png" width="1672" height="941" alt="IELTS Exam Mode Speaking：戴著耳機在咪高峰前練習的 Edmund 馬仔">
      </figure>`;
  }

  function renderExamModes() {
    const pools = examQuestionPools();
    const modes = Array.isArray(EXAM_MODE.modes) ? EXAM_MODE.modes : [];
    dom.content.innerHTML = `
      <section class="content-panel exam-mode-panel">
        ${sectionHeader("考試練習模式", "選擇要模擬的 IELTS Speaking 部分。每次開始都會從已開放的題庫重新隨機抽題。", "7 種模式")}
        ${examCoverHtml()}
        <button class="exam-natural-toggle${state.examNaturalExchange ? " is-on" : ""}" type="button"
          data-natural-exchange-toggle aria-pressed="${state.examNaturalExchange}" ${state.examStarting ? "disabled" : ""}>
          <span>考官自然交流 Mode</span>
          <strong>${state.examNaturalExchange ? "on" : "off"}</strong>
          <small>${state.examNaturalExchange ? "加入考官開場、姓名回答及各部分自然過場" : "直接顯示考題，不加入考官交流訊息"}</small>
        </button>
        <div class="exam-mode-grid">
          ${modes.map((mode, index) => {
            const available = typeof EXAM_MODE.modeIsFeasible === "function" && EXAM_MODE.modeIsFeasible(mode.id, pools);
            const count = mode.parts.reduce((total, part) => total + (part === 1 ? 12 : part === 2 ? 1 : 6), 0);
            return `
              <button class="exam-mode-card${available ? "" : " access-locked"}" type="button" data-exam-mode="${escapeHtml(mode.id)}" ${available && !state.examStarting ? "" : 'aria-disabled="true"'}>
                <span>${pad(index + 1)} · EXAM PRACTICE</span>
                <strong>${escapeHtml(mode.label)}</strong>
                <small>${available ? `${count + (state.examNaturalExchange ? 1 : 0)} 條錄音 · 雙語題目${state.examNaturalExchange ? " · 自然交流" : ""}` : "可用題目或帳戶權限不足"}</small>
              </button>`;
          }).join("")}
        </div>
      </section>`;
  }

  function examAttemptsEndpoint(suffix = "") {
    const base = String(CONFIG.endpoints?.examAttempts || "/v1/exam-attempts").replace(/\/+$/, "");
    return `${base}${suffix}`;
  }

  function examManifestFromItems(items) {
    return (Array.isArray(items) ? items : []).map(item => ({
      order: Number(item.globalOrder),
      part: Number(item.part),
      sourceId: String(item.sourceId || ""),
      sourceBook: Number(item.sourceBook),
      sourceIndex: Number(item.sourceIndex),
      questionNumber: Number(item.part) === 1 ? Number(item.questionNumber) : null,
      promptEn: String(item.title || ""),
      promptZh: String(item.titleZh || "")
    }));
  }

  function examIntroItem(sessionId, mode, items) {
    const first = items[0] || {};
    return {
      kind: "intro",
      part: Number(mode.parts[0]),
      sourceBook: Number(first.sourceBook || 1),
      sourceIndex: Number(first.sourceIndex || 1),
      globalOrder: 0,
      title: "Could you tell me your full name please?",
      titleZh: "可否告訴我你的全名？",
      attemptId: sessionId,
      saved: false
    };
  }

  async function createPersistedExamAttempt(mode, pools, naturalExchange) {
    let latest = null;
    for (let retry = 0; retry < 3; retry += 1) {
      const latestPayload = await apiJson(examAttemptsEndpoint("/latest"));
      latest = latestPayload?.attempt || null;
      const previousQuestions = Array.isArray(latest?.questions) ? latest.questions : [];
      const options = {
        excludedSourceKeys: previousQuestions.map(item => String(item?.sourceKey || "")).filter(Boolean),
        excludedContentKeys: previousQuestions.map(item => String(item?.contentKey || "")).filter(Boolean)
      };
      const items = EXAM_MODE.buildExamItems(mode.id, pools, options);
      const id = EXAM_MODE.createAttemptId();
      try {
        const payload = await apiJson(examAttemptsEndpoint(`/${id}`), {
          method: "PUT",
          body: JSON.stringify({
            modeId: mode.id,
            naturalExchange,
            questions: examManifestFromItems(items)
          })
        });
        return { id, items, persisted: payload?.attempt || null };
      } catch (error) {
        if (error?.code !== "EXAM_COOLDOWN_CONFLICT" || retry >= 2) throw error;
      }
    }
    throw new Error("未能鎖定這次考試題目，請再試一次。");
  }

  async function startExamPractice(modeId) {
    if (state.user?.role === "admin") {
      toast("考試錄音流程只供學生帳戶使用。", "error");
      return;
    }
    if (state.examStarting) return;
    const mode = examModeDefinition(modeId);
    if (!mode || typeof EXAM_MODE.buildExamItems !== "function" || typeof EXAM_MODE.createAttemptId !== "function") {
      toast("考試練習模組未能載入，請重新整理後再試。", "error");
      return;
    }
    const pools = examQuestionPools();
    const naturalExchange = state.examNaturalExchange;
    const startGeneration = ++state.examStartGeneration;
    const authGeneration = state.authGeneration;
    const routeGeneration = state.routeGeneration;
    state.examStarting = true;
    renderExamModes();
    try {
      const created = await createPersistedExamAttempt(mode, pools, naturalExchange);
      if (
        startGeneration !== state.examStartGeneration
        || authGeneration !== state.authGeneration
        || routeGeneration !== state.routeGeneration
        || state.route.view !== "exam-modes"
        || !state.user
      ) return;
      const items = created.items;
      state.examSession = {
        id: created.id,
        modeId: mode.id,
        mode,
        items,
        introItem: naturalExchange ? examIntroItem(created.id, mode, items) : null,
        currentIndex: 0,
        phase: naturalExchange ? "opening" : "question",
        naturalExchange,
        selectedNervousness: null,
        nervousness: null,
        completed: false,
        startedAt: String(created.persisted?.startedAt || new Date().toISOString())
      };
      state.examFlowGeneration += 1;
      state.examSaving = false;
      navigate({ view: "exam-practice", exam: "ielts", modeId: mode.id });
    } catch (error) {
      if (startGeneration !== state.examStartGeneration || authGeneration !== state.authGeneration) return;
      console.warn("Could not create speaking exam:", error);
      toast(String(error?.message || "未能建立考試練習。"), "error");
    } finally {
      if (startGeneration === state.examStartGeneration) {
        state.examStarting = false;
        if (state.route.view === "exam-modes") renderExamModes();
      }
    }
  }

  function currentExamItem() {
    const session = state.examSession;
    if (!session || session.phase !== "question") return null;
    return session.items[Number(session.currentIndex || 0)] || null;
  }

  function currentExamRecordingItem() {
    const session = state.examSession;
    if (!session) return null;
    if (session.phase === "intro-answer") return session.introItem || null;
    return currentExamItem();
  }

  function examItemKey(item = currentExamRecordingItem()) {
    return item && state.examSession ? `${state.examSession.id}:${item.kind === "intro" ? "intro" : item.globalOrder}` : "";
  }

  function examPartPosition(item) {
    const samePart = state.examSession?.items?.filter(entry => entry.part === item.part) || [];
    return {
      position: samePart.findIndex(entry => entry.globalOrder === item.globalOrder) + 1,
      total: samePart.length
    };
  }

  function renderExamProgress(item) {
    const session = state.examSession;
    const complete = Math.max(0, Number(session?.currentIndex || 0));
    const total = session?.items?.length || 1;
    const part = examPartPosition(item);
    return `
      <header class="exam-progress-card">
        <div>
          <span>${escapeHtml(session?.mode?.label || "考試練習")}</span>
          <strong>Part ${item.part} · 第 ${part.position} / ${part.total} 題</strong>
        </div>
        <progress class="exam-progress-meter" max="${total}" value="${complete}" aria-label="考試整體進度">${complete} / ${total}</progress>
        <small>整體 ${complete} / ${total}</small>
      </header>`;
  }

  function examFlowIsCurrent(sessionId, generation = state.examFlowGeneration) {
    return Boolean(
      state.examSession?.id === sessionId
      && state.route.view === "exam-practice"
      && generation === state.examFlowGeneration
    );
  }

  function waitForExamDelay(milliseconds, sessionId, generation = state.examFlowGeneration) {
    return new Promise(resolve => {
      if (!examFlowIsCurrent(sessionId, generation)) {
        resolve(false);
        return;
      }
      if (state.examMessageTimer) window.clearTimeout(state.examMessageTimer);
      if (typeof state.examMessageFinish === "function") state.examMessageFinish(false);
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        if (state.examMessageFinish === finish) state.examMessageFinish = null;
        resolve(Boolean(value));
      };
      state.examMessageFinish = finish;
      state.examMessageTimer = window.setTimeout(() => {
        state.examMessageTimer = 0;
        finish(examFlowIsCurrent(sessionId, generation));
      }, Math.max(0, Number(milliseconds || 0)));
    });
  }

  function preferredBritishVoice() {
    if (!window.speechSynthesis?.getVoices) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    const british = voices.filter(voice => /^en[-_]gb$/i.test(String(voice.lang || "")));
    const preferredNames = [
      /google uk english male/i,
      /microsoft ryan/i,
      /microsoft george/i,
      /daniel/i,
      /arthur/i,
      /oliver/i,
      /jamie/i
    ];
    for (const pattern of preferredNames) {
      const match = british.find(voice => pattern.test(String(voice.name || "")));
      if (match) return match;
    }
    return british.find(voice => voice.localService) || british[0] || null;
  }

  function cancelExamSpeech() {
    state.examSpeechGeneration += 1;
    if (state.examSpeechTimeout) window.clearTimeout(state.examSpeechTimeout);
    state.examSpeechTimeout = 0;
    const finish = state.examSpeechFinish;
    state.examSpeechFinish = null;
    state.examSpeechUtterance = null;
    try { window.speechSynthesis?.cancel(); } catch { /* Speech is optional. */ }
    if (typeof finish === "function") finish(false);
  }

  function finishExamSpeechNow() {
    const finish = state.examSpeechFinish;
    if (typeof finish !== "function") return;
    try { window.speechSynthesis?.cancel(); } catch { /* Speech is optional. */ }
    finish(true);
  }

  function speakExamText(text) {
    cancelExamSpeech();
    const value = String(text || "").trim();
    const generation = state.examSpeechGeneration;
    if (!value || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      return new Promise(resolve => {
        state.examSpeechTimeout = window.setTimeout(() => {
          state.examSpeechTimeout = 0;
          resolve(generation === state.examSpeechGeneration);
        }, 250);
      });
    }
    return new Promise(resolve => {
      let settled = false;
      const finish = forced => {
        if (settled) return;
        settled = true;
        if (state.examSpeechTimeout) window.clearTimeout(state.examSpeechTimeout);
        state.examSpeechTimeout = 0;
        if (state.examSpeechFinish === finish) state.examSpeechFinish = null;
        state.examSpeechUtterance = null;
        resolve(Boolean(forced || generation === state.examSpeechGeneration));
      };
      const utterance = new window.SpeechSynthesisUtterance(value);
      utterance.lang = "en-GB";
      utterance.rate = 0.93;
      utterance.pitch = 1.04;
      utterance.volume = 1;
      const voice = preferredBritishVoice();
      if (voice) utterance.voice = voice;
      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(true);
      state.examSpeechUtterance = utterance;
      state.examSpeechFinish = finish;
      const timeoutMs = Math.min(30000, Math.max(5000, 2500 + value.length * 85));
      state.examSpeechTimeout = window.setTimeout(() => {
        try { window.speechSynthesis.cancel(); } catch { /* Speech is optional. */ }
        finish(true);
      }, timeoutMs);
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch {
        finish(true);
      }
    });
  }

  function examinerBubbleHtml(text, extraClass = "") {
    return `
      <article class="examiner-message${extraClass ? ` ${extraClass}` : ""}">
        <span class="examiner-avatar" aria-hidden="true">E</span>
        <p lang="en">${escapeHtml(text)}</p>
      </article>`;
  }

  function examVoiceControlHtml() {
    return `
      <div class="exam-voice-status">
        <span>British examiner voice · 英國英語考官語音</span>
        <button type="button" data-stop-exam-voice>停止語音並繼續</button>
      </div>`;
  }

  function enableCurrentExamRecorder(message = "考官已讀完題目，請按「開始回答」。") {
    const button = document.querySelector("[data-record-toggle]");
    if (button) {
      button.hidden = false;
      button.disabled = false;
      button.textContent = "● 開始回答";
    }
    recordingStatus(message, false);
  }

  function examQuestionSpeechText(item) {
    if (Number(item?.part) !== 2) return String(item?.title || "");
    const hints = Array.isArray(item?.hints) ? item.hints.map(hint => String(hint?.en || "").trim()).filter(Boolean) : [];
    return [String(item?.title || ""), hints.length ? `You should say: ${hints.join(". ")}.` : ""].filter(Boolean).join(". ");
  }

  async function speakCurrentExamQuestion(item) {
    if (!item || item.questionSpeechStarted) return;
    const session = state.examSession;
    if (!session) return;
    item.questionSpeechStarted = true;
    const sessionId = session.id;
    const itemKey = examItemKey(item);
    const generation = state.examFlowGeneration;
    recordingStatus("考官正以英國英語讀出題目…");
    await speakExamText(examQuestionSpeechText(item));
    if (!examFlowIsCurrent(sessionId, generation) || examItemKey() !== itemKey) return;
    item.questionSpeechDone = true;
    if (item.part === 2) {
      if (!item.settleEndsAt || !item.prepEndsAt) {
        const now = Date.now();
        item.prepPhase = "settling";
        item.settleEndsAt = now + EXAM_PART2_SETTLE_MS;
        item.prepEndsAt = item.settleEndsAt + EXAM_PART2_PREP_MS;
      }
      startExamPart2Timer(item);
      return;
    }
    enableCurrentExamRecorder();
  }

  async function startExamOpeningSequence() {
    const session = state.examSession;
    if (!session || session.phase !== "opening" || session.openingStarted) return;
    session.openingStarted = true;
    const sessionId = session.id;
    const generation = state.examFlowGeneration;
    await speakExamText("Okay, let's begin.");
    if (!await waitForExamDelay(EXAM_OPENING_GAP_MS, sessionId, generation)) return;
    const second = document.querySelector("[data-exam-opening-name]");
    if (second) {
      second.hidden = false;
      second.classList.add("is-entering");
    }
    await speakExamText("Could you tell me your full name please?");
    if (!examFlowIsCurrent(sessionId, generation) || state.examSession?.phase !== "opening") return;
    session.phase = "intro-answer";
    const answer = document.querySelector("[data-exam-intro-answer]");
    if (answer) answer.hidden = false;
    enableCurrentExamRecorder("考官已問完姓名，請錄下你的回答。");
  }

  async function runExamExchange() {
    const session = state.examSession;
    const exchange = session?.exchange;
    if (!session || session.phase !== "exchange" || !exchange || exchange.started) return;
    exchange.started = true;
    const sessionId = session.id;
    const generation = state.examFlowGeneration;
    for (let index = 0; index < exchange.messages.length; index += 1) {
      if (!examFlowIsCurrent(sessionId, generation) || state.examSession?.exchange !== exchange) return;
      const bubble = document.querySelector(`[data-exam-exchange-message="${index}"]`);
      if (bubble) {
        bubble.hidden = false;
        bubble.querySelector(".examiner-message")?.classList.add("is-entering");
      }
      await speakExamText(exchange.messages[index]);
      if (index < exchange.messages.length - 1 && !await waitForExamDelay(EXAM_MESSAGE_GAP_MS, sessionId, generation)) return;
    }
    if (!examFlowIsCurrent(sessionId, generation) || state.examSession?.exchange !== exchange) return;
    session.exchange = null;
    if (exchange.completeAfter) {
      session.phase = "rating";
    } else {
      session.currentIndex = exchange.nextIndex;
      session.phase = "question";
    }
    renderExamPractice();
    window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
  }

  async function startExamPart2Opening(item) {
    const session = state.examSession;
    if (!session || !item || item.part2OpeningStarted) return;
    item.part2OpeningStarted = true;
    const sessionId = session.id;
    const generation = state.examFlowGeneration;
    await speakExamText("So here is your question. I'll give you a pencil there as well. I'll give you one minute to take some notes. Okay?");
    if (!examFlowIsCurrent(sessionId, generation) || currentExamItem() !== item) return;
    item.part2OpeningDone = true;
    renderExamPractice();
  }

  function renderExamRecorder(item, ready = true) {
    if (item.saved) {
      return `
        <section class="exam-answer-recorder is-saved">
          <div><span class="cue-label">ANSWER SAVED · 答案已儲存</span><p>本題 MP3 已加入這次考試練習錄音。</p></div>
          <div data-exam-proceed-slot>${examProceedButtonHtml()}</div>
        </section>`;
    }
    const waitingMessage = item.kind === "intro"
      ? "考官問完姓名後便可開始錄音。"
      : item.part === 2
        ? "完成 1 分鐘準備並聽到「Okay, you can begin」後才可開始。"
        : "考官讀完題目後便可開始錄音。";
    return `
      <section class="exam-answer-recorder" aria-labelledby="exam-recording-heading">
        <div>
          <span class="cue-label" id="exam-recording-heading">YOUR ANSWER · 你的回答</span>
          <p>${item.part === 2 && item.kind !== "intro" ? "錄音開始後有 2 分鐘；時間到會自動停止並儲存。" : "按開始回答後錄音；每題最長 5 分鐘，完成後按停止。"}</p>
          <div class="recording-status" data-recording-status><span role="status" aria-live="polite">${ready ? "準備好便按「開始回答」。" : waitingMessage}</span></div>
        </div>
        <div class="recorder-controls">
          <button class="record-button exam-record-button" type="button" data-record-toggle ${ready ? "" : "hidden disabled"}>● 開始回答</button>
          <button class="secondary-button finish-recording-button" type="button" data-finish-recording hidden>■ 完成回答</button>
        </div>
        <div class="recording-preview" data-recording-preview hidden></div>
        <div data-exam-proceed-slot></div>
      </section>`;
  }

  function renderExamPart1(item) {
    return `
      <section class="exam-question-card exam-part1-question is-entering">
        <div class="exam-question-meta">
          <span>THEME ${item.themeSlot} · ${escapeHtml(item.themeTitle)}</span>
          <small>題庫原題 Q${item.questionInTheme} · Book ${item.sourceBook}</small>
        </div>
        <h1 lang="en" tabindex="-1" data-exam-focus>${escapeHtml(item.title)}</h1>
        <p lang="zh-Hant">${escapeHtml(item.titleZh)}</p>
      </section>
      ${renderExamRecorder(item, Boolean(item.questionSpeechDone))}`;
  }

  function renderExamPart2(item) {
    const ready = item.prepPhase === "ready" && (!state.examSession?.naturalExchange || item.readyPromptSpoken);
    const timerLabel = !item.questionSpeechDone
      ? "考官正在讀題 · EXAMINER READING"
      : item.prepPhase === "ready"
        ? ready ? "準備時間完成" : "考官正在提示開始"
        : item.prepPhase === "preparing"
          ? "準備時間 · PREPARATION"
          : "題目已顯示 · 倒數即將開始";
    const timerClock = !item.questionSpeechDone
      ? "--:--"
      : item.prepPhase === "ready"
        ? "0:00"
        : item.prepPhase === "preparing"
          ? "1:00"
          : "0:02";
    return `
      <section class="exam-prep-timer" data-exam-prep-timer>
        <span data-exam-prep-label>${timerLabel}</span>
        <strong data-exam-prep-clock role="timer" aria-live="off">${timerClock}</strong>
        <span class="visually-hidden" role="status" aria-live="polite" data-exam-phase-status></span>
      </section>
      <section class="exam-question-card exam-cue-card is-entering">
        <div class="exam-question-meta"><span>IELTS SPEAKING · PART 2</span><small>Book ${item.sourceBook}</small></div>
        ${item.cueTitle ? `<p class="exam-cue-topic">${escapeHtml(item.cueTitle)}${item.cueTitleZh ? `<span>${escapeHtml(item.cueTitleZh)}</span>` : ""}</p>` : ""}
        <h1 lang="en" tabindex="-1" data-exam-focus>${escapeHtml(item.title)}</h1>
        <p class="exam-cue-prompt-zh" lang="zh-Hant">${escapeHtml(item.titleZh)}</p>
        <div class="exam-cue-hints">
          <strong>You should say: <span>你應該說明：</span></strong>
          <ul>${item.hints.map(hint => `<li><span lang="en">${escapeHtml(hint.en)}</span>${hint.zh ? `<small lang="zh-Hant">${escapeHtml(hint.zh)}</small>` : ""}</li>`).join("")}</ul>
        </div>
        ${item.ppf ? `
          <aside class="exam-ppf-hint">
            <strong>PPF IDEA · 過去／現在／未來提示</strong>
            ${item.ppf.en ? `<p>${escapeHtml(item.ppf.en)}</p>` : ""}
            ${item.ppf.zh ? `<p lang="zh-Hant">${escapeHtml(item.ppf.zh)}</p>` : ""}
          </aside>` : ""}
      </section>
      <div class="examiner-conversation exam-part2-ready-message" data-exam-part2-ready-message ${item.readyPromptSpoken ? "" : "hidden"}>
        ${item.readyPromptSpoken ? examinerBubbleHtml("Okay, you can begin.") : ""}
      </div>
      ${renderExamRecorder(item, ready)}`;
  }

  function renderExamPart3(item) {
    return `
      <section class="exam-question-card exam-part3-question is-entering">
        <div class="exam-question-meta"><span>IELTS SPEAKING · PART 3</span><small>${escapeHtml(item.themeTitle)} · Book ${item.sourceBook}</small></div>
        <h1 lang="en" tabindex="-1" data-exam-focus>${escapeHtml(item.title)}</h1>
        <p lang="zh-Hant">${escapeHtml(item.titleZh)}</p>
      </section>
      ${renderExamRecorder(item, Boolean(item.questionSpeechDone))}`;
  }

  function renderExamOpening() {
    const session = state.examSession;
    const ready = session?.phase === "intro-answer";
    const intro = session?.introItem;
    dom.content.innerHTML = `
      <article class="exam-practice-view exam-opening-view">
        ${examCoverHtml()}
        <section class="exam-examiner-panel" aria-labelledby="exam-opening-heading">
          <p class="eyebrow">IELTS SPEAKING · NATURAL EXAMINER EXCHANGE</p>
          <h1 id="exam-opening-heading" tabindex="-1" data-exam-focus>考官開場</h1>
          <div class="examiner-conversation">
            ${examinerBubbleHtml("Okay, let's begin.", "is-entering")}
            <article class="examiner-message${ready ? "" : " is-waiting"}" data-exam-opening-name ${ready ? "" : "hidden"}>
              <span class="examiner-avatar" aria-hidden="true">E</span>
              <p lang="en"><strong>Could you tell me your full name please?</strong></p>
            </article>
          </div>
          ${examVoiceControlHtml()}
        </section>
        <section class="exam-intro-answer" data-exam-intro-answer ${ready ? "" : "hidden"}>
          <div class="exam-candidate-tip">
            <span>回答提示 · ANSWER TIP</span>
            <strong lang="en">My full name is XXX.</strong>
            <p lang="zh-Hant">練習時毋須使用真實姓名。</p>
          </div>
          ${renderExamRecorder(intro, ready)}
        </section>
      </article>`;
    syncRecorderControls();
    renderExamProceedAction();
    if (!ready) startExamOpeningSequence();
    window.requestAnimationFrame(() => document.querySelector("[data-exam-focus]")?.focus({ preventScroll: true }));
  }

  function renderExamExchange() {
    const session = state.examSession;
    const exchange = session?.exchange;
    if (!exchange) return;
    dom.content.innerHTML = `
      <article class="exam-practice-view exam-exchange-view">
        ${examCoverHtml()}
        <section class="exam-examiner-panel">
          <p class="eyebrow">IELTS SPEAKING · EXAMINER</p>
          <h1 tabindex="-1" data-exam-focus>考官自然過場</h1>
          <div class="examiner-conversation">
            ${exchange.messages.map((message, index) => `
              <div data-exam-exchange-message="${index}" hidden>${examinerBubbleHtml(message)}</div>
            `).join("")}
          </div>
          ${examVoiceControlHtml()}
        </section>
      </article>`;
    runExamExchange();
    window.requestAnimationFrame(() => document.querySelector("[data-exam-focus]")?.focus({ preventScroll: true }));
  }

  function renderExamPart2Opening(item) {
    dom.content.innerHTML = `
      <article class="exam-practice-view exam-exchange-view">
        ${examCoverHtml()}
        ${renderExamProgress(item)}
        <section class="exam-examiner-panel">
          <p class="eyebrow">IELTS SPEAKING · PART 2</p>
          <h1 tabindex="-1" data-exam-focus>考官正在交代準備方式</h1>
          <div class="examiner-conversation">
            ${examinerBubbleHtml("So here is your question. I'll give you a pencil there as well. I'll give you one minute to take some notes. Okay?", "is-entering")}
          </div>
          ${examVoiceControlHtml()}
        </section>
      </article>`;
    startExamPart2Opening(item);
    window.requestAnimationFrame(() => document.querySelector("[data-exam-focus]")?.focus({ preventScroll: true }));
  }

  function examQuestionBookmark(item) {
    return {
      kind: "question",
      exam: "ielts",
      part: Number(item.part),
      book: Number(item.sourceBook),
      exerciseId: String(item.sourceId || ""),
      questionNumber: Number(item.part) === 1 ? Number(item.questionNumber) : 1
    };
  }

  function examQuestionSourceRoute(item) {
    const liveExercise = speakingExercises(Number(item.part), Number(item.sourceBook))
      .find(exercise => String(exercise?.id || "") === String(item.sourceId || ""));
    return {
      view: "exercise",
      exam: "ielts",
      part: Number(item.part),
      book: Number(item.sourceBook),
      exerciseIndex: Number(liveExercise?.index || item.sourceIndex),
      questionNumber: Number(item.part) === 1 ? Number(item.questionNumber) : 1
    };
  }

  function renderExamReviewQuestion(item) {
    const bookmark = examQuestionBookmark(item);
    const sourceRoute = examQuestionSourceRoute(item);
    const sourceAllowed = routeAllowed(sourceRoute);
    const route = encodeURIComponent(JSON.stringify(sourceRoute));
    return `
      <article class="exam-review-question">
        <div class="exam-review-order"><span>Q</span><strong>${pad(item.globalOrder)}</strong></div>
        <div class="exam-review-copy">
          <span>Part ${item.part} · Book ${item.sourceBook}${item.part === 1 ? ` · 題庫 Q${item.questionNumber}` : ""}</span>
          <h3 lang="en">${escapeHtml(item.title)}</h3>
          ${item.titleZh ? `<p lang="zh-Hant">${escapeHtml(item.titleZh)}</p>` : ""}
          ${item.part === 2 && Array.isArray(item.hints) && item.hints.length ? `
            <ul>${item.hints.map(hint => `<li>${escapeHtml(hint.en)}${hint.zh ? `<small>${escapeHtml(hint.zh)}</small>` : ""}</li>`).join("")}</ul>` : ""}
        </div>
        <div class="exam-review-actions">
          <button class="exam-review-source-link" type="button" data-open-exam-source="${escapeHtml(route)}" ${sourceAllowed ? "" : "disabled"}>Book ${item.sourceBook} · ${sourceAllowed ? "查看 Band 9 答案 →" : "來源目前未開放"}</button>
          ${sourceAllowed ? bookmarkButtonHtml(bookmark, "exam-review-bookmark") : ""}
        </div>
      </article>`;
  }

  function renderExamRating() {
    const session = state.examSession;
    const selected = Number(session?.selectedNervousness || 0);
    dom.content.innerHTML = `
      <article class="exam-practice-view exam-rating-view">
        ${examCoverHtml()}
        <section class="exam-rating-card">
          <p class="eyebrow">SELF-EVALUATION · 自我評估</p>
          <h1 tabindex="-1" data-exam-focus>How nervous were you in the whole process?</h1>
          <p lang="zh-Hant">回想整個練習過程，選擇最符合你當時緊張程度的數字。</p>
          <div class="exam-nervousness-scale" role="radiogroup" aria-label="Nervousness from 1 to 7">
            ${Array.from({ length: 7 }, (_, index) => index + 1).map(value => `
              <button class="exam-rating-circle${selected === value ? " is-selected" : ""}" type="button"
                role="radio" aria-checked="${selected === value}" tabindex="${selected ? selected === value ? 0 : -1 : value === 1 ? 0 : -1}"
                data-exam-rating="${value}" ${state.examRatingSaving ? "disabled" : ""}>${value}</button>
            `).join("")}
          </div>
          <p class="exam-rating-status" role="status" aria-live="polite" data-exam-rating-status>${state.examRatingSaving ? "正在儲存自我評估…" : session?.ratingError ? escapeHtml(session.ratingError) : selected ? `你選擇了 ${selected} / 7。` : "請選擇 1 至 7。"}</p>
          <button class="primary-button" type="button" data-submit-exam-rating ${selected && !state.examRatingSaving ? "" : "disabled"}>儲存並查看今次題目 →</button>
        </section>
      </article>`;
    window.requestAnimationFrame(() => document.querySelector("[data-exam-focus]")?.focus({ preventScroll: true }));
  }

  function selectExamRating(value, options = {}) {
    const rating = Number(value);
    const session = state.examSession;
    if (!session || session.phase !== "rating" || state.examRatingSaving || !Number.isInteger(rating) || rating < 1 || rating > 7) return;
    session.selectedNervousness = rating;
    session.ratingError = "";
    document.querySelectorAll("[data-exam-rating]").forEach(button => {
      const selected = Number(button.dataset.examRating) === rating;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-checked", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    const status = document.querySelector("[data-exam-rating-status]");
    if (status) status.textContent = `你選擇了 ${rating} / 7。`;
    const submit = document.querySelector("[data-submit-exam-rating]");
    if (submit) submit.disabled = false;
    if (options.focus) document.querySelector(`[data-exam-rating="${rating}"]`)?.focus();
  }

  function renderExamCompletion() {
    const session = state.examSession;
    const groups = session?.mode?.parts || [];
    dom.content.innerHTML = `
      <article class="exam-practice-view exam-review-view">
        ${examCoverHtml()}
        <section class="exam-complete-card exam-review-heading">
          <span aria-hidden="true">✓</span>
          <p class="eyebrow">IELTS SPEAKING · EXAM COMPLETE</p>
          <h1 tabindex="-1" data-exam-focus>考試練習完成</h1>
          <p>${escapeHtml(session?.mode?.label || "考試練習")} 已完成。你的緊張程度自評是 <strong>${Number(session?.nervousness || 0)} / 7</strong>。</p>
        </section>
        <section class="exam-review-list" aria-labelledby="exam-review-list-heading">
          <div class="exam-review-list-heading">
            <div><span>RANDOM QUESTION REVIEW</span><h2 id="exam-review-list-heading">今次隨機抽到的題目</h2></div>
            <p>可直接返回來源練習閱讀 Band 9 示範，或把原題加入書簽。</p>
          </div>
          ${groups.map(part => `
            <section class="exam-review-part" aria-labelledby="exam-review-part-${part}">
              <h2 id="exam-review-part-${part}">Part ${part}</h2>
              <div>${session.items.filter(item => item.part === part).map(renderExamReviewQuestion).join("")}</div>
            </section>
          `).join("")}
        </section>
        <div class="exam-complete-actions">
          <button class="primary-button" type="button" data-go="attempts">查看考試練習錄音</button>
          <button class="secondary-button" type="button" data-new-exam>再做一次</button>
        </div>
      </article>`;
    window.requestAnimationFrame(() => document.querySelector("[data-exam-focus]")?.focus({ preventScroll: true }));
  }

  async function submitExamRating() {
    const session = state.examSession;
    const rating = Number(session?.selectedNervousness || 0);
    if (!session || session.phase !== "rating" || state.examRatingSaving || !Number.isInteger(rating) || rating < 1 || rating > 7) return;
    session.ratingError = "";
    state.examRatingSaving = true;
    renderExamRating();
    try {
      const payload = await apiJson(examAttemptsEndpoint(`/${session.id}`), {
        method: "PATCH",
        body: JSON.stringify({ nervousness: rating })
      });
      if (state.examSession?.id !== session.id) return;
      session.nervousness = Number(payload?.attempt?.nervousness || rating);
      session.phase = "review";
      session.completed = true;
      renderExamCompletion();
      toast("自我評估已儲存。", "info");
    } catch (error) {
      console.warn("Could not save exam self-evaluation:", error);
      session.ratingError = String(error?.message || "未能儲存自我評估，請再試一次。");
      toast(String(error?.message || "未能儲存自我評估。"), "error");
    } finally {
      state.examRatingSaving = false;
      if (state.examSession?.id === session.id && session.phase === "rating") renderExamRating();
    }
  }

  function renderExamPractice() {
    const modeId = state.route.modeId;
    const session = state.examSession;
    if (!session || session.modeId !== modeId) {
      dom.content.innerHTML = `
        <section class="notice-card">
          <h2>這次考試尚未開始</h2>
          <p>返回考試練習模式，選擇一個模式後便會重新隨機抽題。</p>
          <button class="primary-button" type="button" data-open-exam-modes>選擇考試模式</button>
        </section>`;
      return;
    }
    if (["opening", "intro-answer"].includes(session.phase)) {
      renderExamOpening();
      return;
    }
    if (session.phase === "exchange") {
      renderExamExchange();
      return;
    }
    if (session.phase === "rating") {
      renderExamRating();
      return;
    }
    if (session.phase === "review" || session.completed) {
      renderExamCompletion();
      return;
    }
    const item = currentExamItem();
    if (!item) {
      session.phase = "rating";
      renderExamRating();
      return;
    }
    if (item.part === 2 && session.naturalExchange && !item.part2OpeningDone) {
      renderExamPart2Opening(item);
      return;
    }
    if (item.part === 2 && (!item.settleEndsAt || !item.prepEndsAt)) {
      const now = Date.now();
      item.cueDisplayedAt = now;
      item.prepPhase = "settling";
      item.settleEndsAt = now + EXAM_PART2_SETTLE_MS;
      item.prepEndsAt = item.settleEndsAt + EXAM_PART2_PREP_MS;
    }
    dom.content.innerHTML = `
      <article class="exam-practice-view">
        ${examCoverHtml()}
        ${renderExamProgress(item)}
        <div class="exam-question-stage">
          ${examVoiceControlHtml()}
          ${item.part === 1 ? renderExamPart1(item) : item.part === 2 ? renderExamPart2(item) : renderExamPart3(item)}
        </div>
      </article>`;
    if (item.part === 2 && item.prepPhase !== "ready") startExamPart2Timer(item);
    if (!item.questionSpeechStarted) speakCurrentExamQuestion(item);
    syncRecorderControls();
    renderExamProceedAction();
    window.requestAnimationFrame(() => document.querySelector("[data-exam-focus]")?.focus({ preventScroll: true }));
  }

  function startExamPart2Timer(item) {
    clearExamPhaseTimer();
    const key = examItemKey(item);
    const update = () => {
      if (state.route.view !== "exam-practice" || examItemKey() !== key) {
        clearExamPhaseTimer();
        return;
      }
      const now = Date.now();
      const label = document.querySelector("[data-exam-prep-label]");
      const clock = document.querySelector("[data-exam-prep-clock]");
      const phaseStatus = document.querySelector("[data-exam-phase-status]");
      if (now < item.settleEndsAt) {
        const seconds = Math.max(1, Math.ceil((item.settleEndsAt - now) / 1000));
        if (label) label.textContent = "題目已顯示 · 準備倒數即將開始";
        if (clock) clock.textContent = `0:0${seconds}`;
        return;
      }
      if (now < item.prepEndsAt) {
        item.prepPhase = "preparing";
        if (item.announcedPrepPhase !== "preparing") {
          item.announcedPrepPhase = "preparing";
          if (phaseStatus) phaseStatus.textContent = "一分鐘準備時間已開始。";
        }
        const seconds = Math.max(0, Math.ceil((item.prepEndsAt - now) / 1000));
        if (label) label.textContent = "準備時間 · PREPARATION";
        if (clock) clock.textContent = `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
        return;
      }
      item.prepPhase = "ready";
      item.announcedPrepPhase = "ready";
      clearExamPhaseTimer();
      if (label) label.textContent = state.examSession?.naturalExchange ? "準備時間完成 · 考官正在提示開始" : "準備時間完成 · 可以開始回答";
      if (clock) clock.textContent = "0:00";
      if (phaseStatus) phaseStatus.textContent = "準備時間完成。";
      if (state.examSession?.naturalExchange) announceExamPart2Ready(item);
      else enableCurrentExamRecorder("準備時間完成，請按「開始回答」。");
    };
    update();
    if (item.prepPhase !== "ready") state.examPhaseTimer = window.setInterval(update, 250);
  }

  async function announceExamPart2Ready(item) {
    if (!item || item.readyPromptStarted) return;
    const session = state.examSession;
    if (!session) return;
    item.readyPromptStarted = true;
    const sessionId = session.id;
    const generation = state.examFlowGeneration;
    const slot = document.querySelector("[data-exam-part2-ready-message]");
    if (slot) {
      slot.hidden = false;
      slot.innerHTML = examinerBubbleHtml("Okay, you can begin.", "is-entering");
    }
    await speakExamText("Okay, you can begin.");
    if (!examFlowIsCurrent(sessionId, generation) || currentExamItem() !== item) return;
    item.readyPromptSpoken = true;
    const label = document.querySelector("[data-exam-prep-label]");
    if (label) label.textContent = "準備時間完成 · 可以開始回答";
    enableCurrentExamRecorder("考官已提示開始，請按「開始回答」。");
  }

  function examProceedButtonHtml() {
    const session = state.examSession;
    const item = currentExamRecordingItem();
    if (!session || !item?.saved) return "";
    if (item.kind === "intro") {
      return '<button class="primary-button exam-proceed-button" type="button" data-exam-proceed>開始正式考試 →</button>';
    }
    const next = session.items[session.currentIndex + 1] || null;
    const label = !next ? "完成考試 →" : next.part !== item.part ? `前往 Part ${next.part} →` : "下一題 →";
    return `<button class="primary-button exam-proceed-button" type="button" data-exam-proceed>${label}</button>`;
  }

  function renderExamProceedAction() {
    const slot = document.querySelector("[data-exam-proceed-slot]");
    if (slot) slot.innerHTML = examProceedButtonHtml();
  }

  function naturalMessagesAfterItem(item, next) {
    if (!state.examSession?.naturalExchange || !item || item.kind === "intro") return [];
    if (typeof EXAM_MODE.naturalTransitionMessages !== "function") return [];
    return EXAM_MODE.naturalTransitionMessages(state.examSession.modeId, item.part, next?.part ?? null);
  }

  function advanceExamItem() {
    const session = state.examSession;
    const item = currentExamRecordingItem();
    if (!session || !item?.saved || state.examSaving) return;
    cancelRecorder();
    clearExamPhaseTimer();
    cancelExamSpeech();
    if (item.kind === "intro") {
      session.phase = "question";
      session.currentIndex = 0;
      renderExamPractice();
      window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
      return;
    }
    const nextIndex = session.currentIndex + 1;
    const next = session.items[nextIndex] || null;
    const messages = naturalMessagesAfterItem(item, next);
    if (messages.length) {
      session.phase = "exchange";
      session.exchange = {
        messages,
        nextIndex,
        completeAfter: !next,
        started: false
      };
      renderExamPractice();
      window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
      return;
    }
    if (!next) session.phase = "rating";
    else {
      session.currentIndex = nextIndex;
      session.phase = "question";
    }
    renderExamPractice();
    window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
  }

  function renderBooks(part) {
    const validPart = [1, 2, 3].includes(Number(part)) ? Number(part) : 1;
    const availableBooks = speakingBooks().filter(item => (
      Number(item?.part) === validPart && bookIsVisible(item?.book, item?.part)
    ));
    const availableExercises = availableBooks.reduce((count, item) => count + Number(item?.exerciseCount || item?.exercises?.length || 0), 0);
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader(`IELTS Speaking · Part ${validPart}`, availableBooks.length ? `選擇練習冊。${availableBooks.length} 本練習冊共有 ${availableExercises} 個完整 Band 9 示範。` : "選擇練習冊。")}
        <div class="book-grid">
          ${Array.from({ length: visibleBookLimit(validPart) }, (_, index) => {
            const book = index + 1;
            const available = bookAvailable(validPart, book);
            const allowed = hasAccess(["exam.ielts", `ielts.part.${validPart}`, `ielts.part.${validPart}.book.${book}`]);
            const bookmark = { kind: "book", exam: "ielts", part: validPart, book };
            return `
              <div class="selection-card-wrap book-card-wrap">
                <button class="book-card${available ? " available" : ""}${allowed ? "" : " access-locked"}" type="button" data-book="${book}" data-part="${validPart}" ${allowed ? "" : 'aria-disabled="true"'}>
                  <strong>Book ${book}</strong>
                  <span>${available ? `Book ${book} of Part ${validPart} · ${speakingBook(validPart, book)?.exerciseCount || speakingBook(validPart, book)?.exercises?.length || 0} exercises` : allowed ? "內容準備中" : "尚未開放"}</span>
                </button>
                ${allowed ? bookmarkButtonHtml(bookmark) : ""}
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function booksFromSpeakingPayload(data) {
    if (!data) return [];
    if (Array.isArray(data.books)) return data.books;
    if (Array.isArray(data)) return [{ part: 2, book: 1, exerciseCount: data.length, exercises: data }];
    if (Array.isArray(data.exercises)) {
      return [{ part: Number(data.metadata?.part || 2), book: Number(data.metadata?.book || 1), exerciseCount: data.exercises.length, exercises: data.exercises }];
    }
    const nested = data.ielts?.parts?.[2]?.books?.[1]
      || data.ielts?.part2?.book1
      || data.part2?.book1
      || data.book1;
    return Array.isArray(nested?.exercises) ? [{ part: 2, book: 1, exerciseCount: nested.exercises.length, exercises: nested.exercises }] : [];
  }

  function speakingBooks() {
    const books = [
      ...booksFromSpeakingPayload(window.EDMUND_SPEAKING_PART1_DATA || {}),
      ...booksFromSpeakingPayload(window.EDMUND_SPEAKING_DATA || {}),
      ...booksFromSpeakingPayload(window.EDMUND_SPEAKING_PART3_DATA || {})
    ];
    const unique = new Map();
    books.forEach(book => unique.set(`${Number(book?.part)}:${Number(book?.book)}`, book));
    return [...unique.values()].sort((left, right) => (
      Number(left?.part) - Number(right?.part) || Number(left?.book) - Number(right?.book)
    ));
  }

  function speakingBook(part = state.route.part, book = state.route.book) {
    return speakingBooks().find(item => Number(item?.part) === Number(part) && Number(item?.book) === Number(book)) || null;
  }

  function rawSpeakingExercises(part = state.route.part, book = state.route.book) {
    const selected = speakingBook(part, book);
    return Array.isArray(selected?.exercises) ? selected.exercises : [];
  }

  function normalizeResponse(section, index) {
    const source = section || {};
    return {
      number: Number(source.number || source.index || index + 1),
      headingEn: String(source.heading_en || source.headingEn || source.heading || source.title_en || source.title || `Response ${index + 1}`).replace(/^\s*\d+[.)]?\s*/, ""),
      headingZh: String(source.heading_zh || source.headingZh || source.title_zh || source.subtitle || ""),
      textEn: String(source.english_text || source.text_en || source.textEn || source.english || source.en || source.response_en || ""),
      textZh: String(source.chinese_text || source.text_zh || source.textZh || source.chinese || source.zh || source.response_zh || "")
    };
  }

  function normalizePart3Step(step, index) {
    const source = step || {};
    const fallbackStages = ["idea", "explanation", "example", "conclusion"];
    const stage = String(source.stage || fallbackStages[index] || `step-${index + 1}`).toLocaleLowerCase("en");
    const stageLabels = {
      idea: ["Idea", "觀點"],
      explanation: ["Explanation", "解釋"],
      example: ["Example", "例子"],
      conclusion: ["Conclusion", "總結"]
    };
    const labels = stageLabels[stage] || [`Step ${index + 1}`, `步驟 ${index + 1}`];
    return {
      stage,
      labelEn: String(source.labelEn || source.label_en || source.sourceLabel || source.source_label || source.label || labels[0]).replace(/\s+2$/, ""),
      labelZh: String(source.labelZh || source.label_zh || labels[1]),
      textEn: String(source.textEn || source.text_en || source.english || source.english_text || source.response_en || ""),
      textZh: String(source.textZh || source.text_zh || source.chinese || source.chinese_text || source.response_zh || "")
    };
  }

  function normalizePart3Model(model, index) {
    const source = model || {};
    const steps = source.steps || source.components || source.sections || [];
    return {
      number: Number(source.number || source.modelNumber || source.model_number || index + 1),
      steps: Array.isArray(steps) ? steps.map(normalizePart3Step) : []
    };
  }

  function normalizePart1Question(question, index) {
    const source = question || {};
    return {
      number: Number(source.number || index + 1),
      questionEn: String(source.questionEn || source.question_en || source.english || ""),
      questionZh: String(source.questionZh || source.question_zh || source.chinese || ""),
      answerEn: String(source.answerEn || source.answer_en || source.responseEn || source.response_en || ""),
      answerZh: String(source.answerZh || source.answer_zh || source.responseZh || source.response_zh || "")
    };
  }

  function cueObjectText(cue, exercise) {
    if (!cue || typeof cue !== "object") return "";
    const lines = [];
    const addPair = (en, zh) => {
      if (en) lines.push(String(en));
      if (zh) lines.push(String(zh));
    };
    addPair(cue.titleEn || cue.title_en || exercise.title, cue.titleZh || cue.title_zh);
    addPair(cue.promptEn || cue.prompt_en || cue.questionEn || cue.question_en || cue.prompt, cue.promptZh || cue.prompt_zh || cue.questionZh || cue.question_zh);
    addPair(cue.instructionEn || cue.instruction_en || "You should say:", cue.instructionZh || cue.instruction_zh || "你應該說明：");
    const hints = cue.hints || cue.bullets || cue.points || [];
    if (Array.isArray(hints)) {
      hints.forEach(hint => {
        if (typeof hint === "string") lines.push(`• ${hint}`);
        else {
          if (hint?.en || hint?.english || hint?.textEn) lines.push(`• ${hint.en || hint.english || hint.textEn}`);
          if (hint?.zh || hint?.chinese || hint?.textZh) lines.push(`  ${hint.zh || hint.chinese || hint.textZh}`);
        }
      });
    }
    if (cue.noteEn || cue.note_en || cue.noteZh || cue.note_zh) {
      addPair(cue.noteEn || cue.note_en, cue.noteZh || cue.note_zh);
    }
    return lines.filter(Boolean).join("\n");
  }

  function normalizeCueCard(source) {
    const cue = source?.cue && typeof source.cue === "object" ? source.cue : {};
    let cueTitle = String(cue.titleEn || cue.title_en || source?.title || "").trim();
    let cueTitleZh = String(cue.titleZh || cue.title_zh || source?.titleZh || source?.title_zh || "").trim();
    let promptEn = String(cue.promptEn || cue.prompt_en || cue.questionEn || cue.question_en || source?.title || "").trim();
    let promptZh = String(cue.promptZh || cue.prompt_zh || cue.questionZh || cue.question_zh || source?.titleZh || source?.title_zh || "").trim();
    let hints = Array.isArray(cue.hints) ? cue.hints.map(hint => ({
      en: String(hint?.en || hint?.english || hint?.textEn || "").trim(),
      zh: String(hint?.zh || hint?.chinese || hint?.textZh || "").trim()
    })) : [];
    const labelOnly = /^(?:please\s+(?:say|tell me)|you should\s+(?:say|mention))\s*:?[\s.]*$/i;
    hints = hints.filter(hint => (hint.en || hint.zh) && !labelOnly.test(hint.en));

    if (/^(?:describe|talk about|tell me about)\b/i.test(cueTitle) && !/^(?:describe|talk about|tell me about)\b/i.test(promptEn)) {
      if (promptEn || promptZh) hints.unshift({ en: promptEn, zh: promptZh });
      promptEn = cueTitle;
      promptZh = cueTitleZh || promptZh;
      cueTitle = "";
      cueTitleZh = "";
    } else if (normalizeSearchText(cueTitle) === normalizeSearchText(promptEn)) {
      cueTitle = "";
      cueTitleZh = "";
    }

    const ppfSource = cue.ppf && typeof cue.ppf === "object" ? cue.ppf : null;
    const ppf = ppfSource ? {
      en: String(ppfSource.en || ppfSource.english || "").trim(),
      zh: String(ppfSource.zh || ppfSource.chinese || "").trim()
    } : null;
    return {
      titleEn: cueTitle,
      titleZh: cueTitleZh,
      promptEn,
      promptZh,
      hints,
      ppf: ppf?.en || ppf?.zh ? ppf : null
    };
  }

  function normalizeExercise(raw, fallbackIndex, part = 2, book = 1) {
    const source = raw || {};
    const index = Number(source.index || source.number || fallbackIndex);
    if (Number(part) === 1) {
      const questionSource = source.questions || source.items || [];
      const questions = Array.isArray(questionSource)
        ? questionSource.map(normalizePart1Question).filter(question => question.questionEn && question.answerEn)
        : [];
      return {
        id: String(source.id || source.slug || `ielts-part-1-book-${book}-module-${pad(index)}`),
        part: 1,
        book: Number(book),
        index,
        title: String(source.title || source.topic || source.name || `Module ${index}`),
        titleZh: String(source.titleZh || source.title_zh || source.topicZh || source.topic_zh || ""),
        cueText: "",
        questions,
        questionCount: questions.length,
        responseModels: [],
        responses: [],
        unavailable: !raw || !questions.length
      };
    }
    if (Number(part) === 3) {
      const question = source.question && typeof source.question === "object" ? source.question : {};
      const modelSource = source.responseModels || source.response_models || source.responsePaths || source.models || [];
      const responseModels = Array.isArray(modelSource)
        ? modelSource.map(normalizePart3Model).filter(model => model.steps.length)
        : [];
      const title = String(source.title || source.topic || question.english || question.en || source.question_en || `Exercise ${index}`);
      const titleZh = String(source.titleZh || source.title_zh || question.chinese || question.zh || source.question_zh || "");
      return {
        id: String(source.id || source.slug || `ielts-part-3-book-${book}-exercise-${pad(index)}`),
        part: 3,
        book: Number(book),
        index,
        title,
        titleZh,
        cueText: String(source.cueText || source.cue_text || `${title}${titleZh ? `\n${titleZh}` : ""}`),
        themeId: String(source.themeId || source.theme_id || source.categoryId || source.category_id || "discussion"),
        themeTitle: String(source.themeTitle || source.theme_title || source.categoryTitle || source.category_title || "Discussion"),
        responseModels,
        responses: [],
        unavailable: !raw || !responseModels.length
      };
    }
    const sections = source.sections || source.responses || source.responseCards || source.answers || [];
    const responses = Array.isArray(sections)
      ? sections.slice(0, 4).map(normalizeResponse)
      : [];
    while (responses.length < 4) responses.push(normalizeResponse(null, responses.length));
    const cueCard = normalizeCueCard(source);
    return {
      id: String(source.id || source.slug || `ielts-part-${part}-book-${book}-exercise-${pad(index)}`),
      part: Number(part),
      book: Number(book),
      index,
      title: String(source.title || source.topic || source.name || `Exercise ${index}`),
      titleZh: String(source.title_zh || source.titleZh || source.topic_zh || source.cue?.titleZh || source.cue?.title_zh || ""),
      cueText: String(source.cue_raw || source.cueRaw || source.question_raw || source.question || source.cue?.raw || cueObjectText(source.cue, source) || ""),
      cueCard,
      responses,
      unavailable: !raw
    };
  }

  function speakingExercises(part = state.route.part, book = state.route.book) {
    const source = rawSpeakingExercises(part, book);
    return source.map((exercise, index) => normalizeExercise(exercise, index + 1, part, book));
  }

  function allSpeakingExercises() {
    return speakingBooks()
      .filter(book => bookIsVisible(book?.book, book?.part))
      .flatMap(book => speakingExercises(book.part, book.book));
  }

  function currentExercise() {
    const index = Number(state.route.exerciseIndex || 0);
    return speakingExercises().find(item => item.index === index) || speakingExercises()[index - 1] || null;
  }

  function exerciseCardHtml(exercise, part, book) {
    const allowed = routeAllowed({ view: "exercise", exam: "ielts", part, book });
    const bookmark = { kind: "exercise", exam: "ielts", part, book, exerciseId: exercise.id };
    const subtitle = exercise.titleZh
      ? escapeHtml(part === 1 ? `${exercise.titleZh} · ${exercise.questionCount || exercise.questions?.length || 0} questions` : exercise.titleZh)
      : exercise.unavailable
        ? "資料準備中"
        : part === 1
          ? `${exercise.questionCount || exercise.questions?.length || 0} question conversation`
        : part === 3
          ? "Two Band 9 response routes"
          : "Cue card · Band 9 sample";
    return `
      <div class="selection-card-wrap exercise-card-wrap">
        <button class="exercise-card${allowed ? "" : " access-locked"}" type="button" data-exercise-index="${exercise.index}"${exercise.unavailable || !allowed ? " disabled" : ""}>
          <span class="exercise-index">${pad(exercise.index)}</span>
          <span>
            ${part === 3 ? `<em class="exercise-theme">${escapeHtml(exercise.themeTitle || "Discussion")}</em>` : ""}
            <strong>${escapeHtml(exercise.title)}</strong>
            <small>${subtitle}</small>
          </span>
          <span class="arrow" aria-hidden="true">→</span>
        </button>
        ${allowed ? bookmarkButtonHtml(bookmark) : ""}
      </div>`;
  }

  function renderExercises() {
    const exercises = speakingExercises();
    const part = Number(state.route.part || 2);
    const book = Number(state.route.book || 1);
    const description = part === 3
      ? `選擇 ${exercises.length} 條討論題。每題以兩條清晰的 Idea → Explanation → Example → Conclusion 路線呈現。`
      : part === 1
        ? `選擇對話主題。每組以 Examiner 問題與 Band 9 答案交替呈現，並提供雙語字幕及錄音練習。`
        : `選擇 ${exercises.length} 個題目之一，閱讀雙語 cue card 及四部分 Band 9 示範，然後錄下自己的答案。`;
    const exerciseContent = part === 3
      ? [...new Map(exercises.map(exercise => [exercise.themeId, exercise.themeTitle || "Discussion"])).entries()].map(([themeId, themeTitle]) => `
          <section class="part3-theme-group" aria-labelledby="theme-${escapeHtml(themeId)}">
            <div class="part3-theme-heading" id="theme-${escapeHtml(themeId)}">
              <span>${escapeHtml(themeTitle)}</span>
              <small>${exercises.filter(exercise => exercise.themeId === themeId).length} questions</small>
            </div>
            <div class="exercise-grid">
              ${exercises.filter(exercise => exercise.themeId === themeId).map(exercise => exerciseCardHtml(exercise, part, book)).join("")}
            </div>
          </section>`).join("")
      : `<div class="exercise-grid">${exercises.map(exercise => exerciseCardHtml(exercise, part, book)).join("")}</div>`;
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader(`Book ${book} of Part ${part}`, description)}
        ${exerciseContent}
      </section>
    `;
  }

  function renderBookmarks() {
    if (state.user?.role !== "student" || !hasAccess(["bookmarks"])) {
      dom.content.innerHTML = '<section class="notice-card"><h2>書簽尚未開放</h2><p>請聯絡管理員開放這個範圍。</p></section>';
      return;
    }
    if (!state.bookmarksLoaded) {
      dom.content.innerHTML = `<section class="content-panel">${sectionHeader("書簽", "正在同步你的 Speaking 書簽。")}${dom.loadingTemplate?.innerHTML || '<div class="loading-state">載入中…</div>'}</section>`;
      loadBookmarks().then(() => {
        if (state.route.view === "bookmarks") renderBookmarks();
      }).catch(() => {
        if (state.route.view !== "bookmarks") return;
        dom.content.innerHTML = '<section class="notice-card"><h2>未能載入書簽</h2><p>請檢查網絡後再試。</p><button class="secondary-button" type="button" data-retry-bookmarks>重新載入</button></section>';
      });
      return;
    }
    const visibleBookmarks = state.bookmarks.filter(bookmarkIsVisible);
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader("書簽", "你收藏的練習範疇、Part、Book 及題目會跟隨帳戶同步。", `${visibleBookmarks.length} 個書簽`)}
        ${visibleBookmarks.length ? `
          <div class="bookmark-list">
            ${visibleBookmarks.map(bookmark => {
              const route = routeForBookmark(bookmark);
              const available = Boolean(route) && routeAllowed(route)
                && (bookmark.kind !== "book" || bookAvailable(bookmark.part, bookmark.book));
              const encoded = encodeURIComponent(JSON.stringify(bookmark));
              return `
                <div class="bookmark-list-row">
                  <button class="bookmark-open-button" type="button" data-open-saved-bookmark="${escapeHtml(encoded)}" ${available ? "" : "disabled"}>
                    <span><strong>${escapeHtml(bookmarkTitle(bookmark))}</strong><small>${escapeHtml(bookmarkSubtitle(bookmark))}</small></span>
                    <em>${available ? "進入" : "內容準備中"}</em>
                  </button>
                  ${bookmarkButtonHtml(bookmark, "bookmark-list-remove")}
                </div>`;
            }).join("")}
          </div>` : `
          <div class="empty-state">
            <span class="empty-icon" aria-hidden="true">☆</span>
            <h2>暫時未有書簽</h2>
            <p>在任何選擇方塊右邊或練習頁首按 ☆，便可把它收藏到這裡。</p>
          </div>`}
      </section>
    `;
    syncBookmarkButtons();
  }

  function allAccessKeys() {
    return ACCESS_SECTIONS.flatMap(section => [
      section.key,
      ...(section.children || []).flatMap(child => [child.key, ...(child.children || []).map(item => item.key)])
    ]);
  }

  function canonicalAccess(value) {
    const normalized = normalizeAccess(value);
    return Object.fromEntries(allAccessKeys()
      .filter(key => normalized[key] === false)
      .map(key => [key, false]));
  }

  function accessValuesEqual(left, right) {
    const leftValue = canonicalAccess(left);
    const rightValue = canonicalAccess(right);
    return allAccessKeys().every(key => leftValue[key] === rightValue[key]);
  }

  function effectiveAdminAccess(student) {
    if (!student) return {};
    return state.adminAccessDrafts.get(student.id) || student.access || {};
  }

  function setAdminAccessDraft(student, nextAccess) {
    if (!student) return;
    const draft = canonicalAccess(nextAccess);
    if (accessValuesEqual(draft, student.access)) state.adminAccessDrafts.delete(student.id);
    else state.adminAccessDrafts.set(student.id, draft);
  }

  function syncAdminDraftControls() {
    const student = state.adminStudents.find(row => row.id === state.selectedAdminStudentId);
    const dirty = Boolean(student && state.adminAccessDrafts.has(student.id));
    const save = document.querySelector("[data-admin-save-access]");
    const discard = document.querySelector("[data-admin-discard-access]");
    if (save) save.disabled = state.adminAccessSaving || !dirty;
    if (discard) discard.disabled = state.adminAccessSaving || !dirty;
    const saveBar = document.querySelector(".admin-save-bar");
    if (saveBar) saveBar.classList.toggle("is-dirty", dirty && !state.adminAccessSaving);
    const status = document.querySelector("[data-admin-save-status]");
    if (status) {
      status.textContent = state.adminAccessSaving
        ? "正在一次過儲存這位學生的全部權限改動…"
        : dirty
          ? "改動只保存在這個畫面，尚未寫入資料庫。確認後請按「儲存全部改動」。"
          : "目前沒有未儲存的改動。開關不會自動寫入資料庫。";
      status.classList.toggle("is-dirty", dirty && !state.adminAccessSaving);
    }
    document.querySelectorAll("[data-admin-unsaved-student]").forEach(badge => {
      badge.hidden = !state.adminAccessDrafts.has(badge.dataset.adminUnsavedStudent);
    });
  }

  function adminAccessBranchHtml(item, depth = 0) {
    const student = state.adminStudents.find(row => row.id === state.selectedAdminStudentId);
    const checked = effectiveAdminAccess(student)?.[item.key] !== false;
    const children = item.children || [];
    return `
      <div class="admin-access-branch depth-${depth}">
        <label class="admin-access-toggle">
          <span>${escapeHtml(item.label)}</span>
          <input type="checkbox" data-admin-access-key="${escapeHtml(item.key)}" ${checked ? "checked" : ""} ${state.adminAccessSaving ? "disabled" : ""}>
        </label>
        ${children.length ? `<details class="admin-access-children" ${depth === 0 && item.key === "exam.ielts" ? "open" : ""}>
          <summary>細項（${children.length}）</summary>
          <div>${children.map(child => adminAccessBranchHtml(child, depth + 1)).join("")}</div>
        </details>` : ""}
      </div>
    `;
  }

  function filteredAdminStudents() {
    const tokens = searchTokens(state.adminStudentQuery);
    if (!tokens.length) return state.adminStudents;
    return state.adminStudents.filter(student => searchMatches(student.name, tokens));
  }

  function renderAdminPanel() {
    if (state.user?.role !== "admin") {
      dom.content.innerHTML = '<section class="notice-card"><h2>管理員登入所需</h2></section>';
      return;
    }
    if (!state.adminStudentsLoaded) {
      dom.content.innerHTML = `<section class="content-panel">${sectionHeader("Admin 控制台", "讀取學生帳戶及 Speaking 權限。", "ADMIN")}${dom.loadingTemplate?.innerHTML || '<div class="loading-state">載入中…</div>'}</section>`;
      if (!state.adminStudentsLoading) loadAdminStudents();
      return;
    }
    const students = filteredAdminStudents();
    const selected = state.adminStudents.find(student => student.id === state.selectedAdminStudentId) || null;
    const selectedDirty = Boolean(selected && state.adminAccessDrafts.has(selected.id));
    dom.content.innerHTML = `
      <section class="content-panel admin-panel">
        ${sectionHeader("Admin 控制台", "按學生開關 Speaking 範疇、IELTS Part 及每一本練習冊。帳戶及密碼繼續與其他 Edmund 系統共用。", "ADMIN · ACCESS")}
        <div class="admin-layout">
          <aside class="admin-student-panel">
            <label class="admin-student-search">
              <span>搜尋學生</span>
              <input type="search" data-admin-student-search value="${escapeHtml(state.adminStudentQuery)}" placeholder="輸入學生名稱">
            </label>
            <div class="admin-student-list">
              ${students.length ? students.map(student => `
                <button class="admin-student-row${student.id === state.selectedAdminStudentId ? " active" : ""}" type="button" data-admin-student-id="${escapeHtml(student.id)}">
                  <strong>${escapeHtml(student.name)}</strong>
                  <small>${student.accessUpdatedAt ? `權限更新：${escapeHtml(formatDate(student.accessUpdatedAt))}` : escapeHtml(formatDate(student.accountUpdatedAt || student.createdAt))}</small>
                  <em class="admin-unsaved-badge" data-admin-unsaved-student="${escapeHtml(student.id)}" ${state.adminAccessDrafts.has(student.id) ? "" : "hidden"}>未儲存</em>
                </button>`).join("") : '<p class="search-empty">找不到學生帳戶。</p>'}
            </div>
          </aside>
          <div class="admin-access-panel">
            ${selected ? `
              <div class="admin-access-heading">
                <div><h2>${escapeHtml(selected.name)}</h2><p>父層關閉後，其下所有 Part／Book 都會停止開放。</p></div>
                <div class="admin-access-actions">
                  <button class="secondary-button" type="button" data-admin-set-all="true" ${state.adminAccessSaving ? "disabled" : ""}>全部開啟</button>
                  <button class="secondary-button" type="button" data-admin-set-all="false" ${state.adminAccessSaving ? "disabled" : ""}>全部關閉</button>
                </div>
              </div>
              <div class="admin-access-tree">${ACCESS_SECTIONS.map(item => adminAccessBranchHtml(item)).join("")}</div>
              <div class="admin-save-bar${selectedDirty ? " is-dirty" : ""}">
                <p class="admin-save-status${selectedDirty ? " is-dirty" : ""}" data-admin-save-status role="status" aria-live="polite">${state.adminAccessSaving ? "正在一次過儲存這位學生的全部權限改動…" : selectedDirty ? "改動只保存在這個畫面，尚未寫入資料庫。確認後請按「儲存全部改動」。" : "目前沒有未儲存的改動。開關不會自動寫入資料庫。"}</p>
                <div class="admin-save-actions">
                  <button class="secondary-button" type="button" data-admin-discard-access ${state.adminAccessSaving || !selectedDirty ? "disabled" : ""}>取消改動</button>
                  <button class="primary-button admin-save-button" type="button" data-admin-save-access ${state.adminAccessSaving || !selectedDirty ? "disabled" : ""}>${state.adminAccessSaving ? "正在儲存…" : "儲存全部改動"}</button>
                </div>
              </div>
            ` : '<div class="empty-state"><h2>請選擇學生</h2><p>從左邊選擇帳戶以管理 Speaking 權限。</p></div>'}
          </div>
        </div>
      </section>
    `;
  }

  async function loadAdminStudents() {
    if (state.user?.role !== "admin" || state.adminStudentsLoading) return;
    const generation = ++state.adminRequestGeneration;
    state.adminStudentsLoading = true;
    try {
      const payload = await apiJson(CONFIG.endpoints?.adminStudents || "/v1/admin/students");
      if (generation !== state.adminRequestGeneration || state.user?.role !== "admin") return;
      state.adminStudents = (Array.isArray(payload?.students) ? payload.students : []).map(student => ({
        id: String(student.id || ""),
        name: String(student.name || "Student"),
        createdAt: String(student.createdAt || ""),
        accountUpdatedAt: String(student.updatedAt || ""),
        accessUpdatedAt: String(student.accessUpdatedAt || ""),
        access: normalizeAccess(student.access)
      })).filter(student => student.id);
      state.adminStudentsLoaded = true;
      if (!state.adminStudents.some(student => student.id === state.selectedAdminStudentId)) {
        state.selectedAdminStudentId = state.adminStudents[0]?.id || "";
      }
      if (state.route.view === "admin") renderAdminPanel();
    } catch (error) {
      if (generation !== state.adminRequestGeneration) return;
      console.warn("Could not load Speaking students:", error);
      dom.content.innerHTML = `<section class="notice-card"><h2>未能載入學生</h2><p>${escapeHtml(error?.message || "請檢查網絡後再試。")}</p><button class="secondary-button" type="button" data-retry-admin-students>重新載入</button></section>`;
    } finally {
      if (generation === state.adminRequestGeneration) state.adminStudentsLoading = false;
    }
  }

  async function saveAdminStudentAccess() {
    const student = state.adminStudents.find(row => row.id === state.selectedAdminStudentId);
    const draft = student ? state.adminAccessDrafts.get(student.id) : null;
    if (!student || !draft || state.adminAccessSaving) return;
    const studentId = student.id;
    const snapshot = canonicalAccess(draft);
    state.adminAccessSaving = true;
    renderAdminPanel();
    try {
      const base = String(CONFIG.endpoints?.adminStudents || "/v1/admin/students").replace(/\/+$/, "");
      const payload = await apiJson(`${base}/${encodeURIComponent(studentId)}/access`, {
        method: "PUT",
        body: JSON.stringify({ access: snapshot })
      });
      const savedStudent = state.adminStudents.find(row => row.id === studentId);
      if (savedStudent) {
        savedStudent.access = normalizeAccess(payload?.student?.access || payload?.access || snapshot);
        savedStudent.accessUpdatedAt = String(payload?.updatedAt || new Date().toISOString());
      }
      if (accessValuesEqual(state.adminAccessDrafts.get(studentId), snapshot)) state.adminAccessDrafts.delete(studentId);
      toast("學生 Speaking 權限已一次過儲存。", "info");
    } catch (error) {
      toast(String(error?.message || "未能儲存學生權限；你的改動仍保留在畫面內。"), "error");
    } finally {
      state.adminAccessSaving = false;
      if (state.route.view === "admin") renderAdminPanel();
    }
  }

  function audioManifestCandidates(part) {
    const manifests = {
      1: window.EDMUND_SPEAKING_PART1_AUDIO || {},
      2: window.EDMUND_SPEAKING_AUDIO || {},
      3: window.EDMUND_SPEAKING_PART3_AUDIO || {}
    };
    const manifest = manifests[Number(part)] || {};
    const candidates = [manifest, manifest.exercises, manifest.entries, manifest.items];
    return candidates.filter(Boolean);
  }

  function resolveAudioEntry(exercise) {
    if (!exercise) return null;
    const part = Number(exercise.part);
    const keys = [exercise.id];
    if (part === 2) keys.push(
      `ielts-part2-book${exercise.book}-exercise-${pad(exercise.index)}`,
      `ielts-part-${part}-book-${exercise.book}-exercise-${pad(exercise.index)}`,
      `ielts-part${part}-book${exercise.book}-exercise-${pad(exercise.index)}`,
      `part${part}-book${exercise.book}-exercise-${pad(exercise.index)}`,
      `exercise-${pad(exercise.index)}`,
      String(exercise.index)
    );
    for (const candidate of audioManifestCandidates(part)) {
      if (Array.isArray(candidate)) {
        const match = candidate.find(entry => keys.includes(String(entry?.id || entry?.exerciseId || entry?.index)));
        if (match && audioPath(match)) return match;
      } else if (typeof candidate === "object") {
        for (const key of keys) {
          if (candidate[key] && audioPath(candidate[key])) return candidate[key];
        }
      }
    }
    return null;
  }

  function audioPath(entry) {
    return String(entry?.path || entry?.src || entry?.audio || entry?.file || entry?.url || "");
  }

  function audioUrl(entry) {
    const path = audioPath(entry);
    if (!path || /^(?:https?:)?\/\//i.test(path)) return path;
    if (typeof window.EDMUND_AUDIO_URL === "function") return window.EDMUND_AUDIO_URL(path);
    const base = String(window.EDMUND_SPEAKING_AUDIO_META?.baseUrl || "").replace(/\/+$/, "");
    return base ? `${base}/${path.replace(/^\/+/, "")}` : path;
  }

  function timingRows(entry) {
    const raw = entry?.words || entry?.timings || entry?.wordTimings || [];
    if (!Array.isArray(raw)) return [];
    return raw.map(row => {
      if (Array.isArray(row)) return { word: String(row[0] || ""), start: Number(row[1]), end: Number(row[2]) };
      return {
        word: String(row?.word || row?.text || row?.token || ""),
        start: Number(row?.start ?? row?.startTime ?? row?.from),
        end: Number(row?.end ?? row?.endTime ?? row?.to)
      };
    }).filter(row => row.word && Number.isFinite(row.start) && Number.isFinite(row.end));
  }

  function normalizeWord(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLocaleLowerCase("en")
      .replace(/[’]/g, "'")
      .replace(/[^\p{L}\p{N}']/gu, "");
  }

  function renderTimedEnglish(text, matcher) {
    const tokens = String(text || "").match(WORD_PATTERN) || [];
    let firstFocusableWord = true;
    return tokens.map(token => {
      if (!IS_WORD_PATTERN.test(token) || !matcher.rows.length) return escapeHtml(token);
      const wanted = normalizeWord(token);
      let matchedIndex = -1;
      for (let index = matcher.cursor; index < matcher.rows.length; index += 1) {
        if (normalizeWord(matcher.rows[index].word) === wanted) {
          matchedIndex = index;
          break;
        }
      }
      if (matchedIndex < 0) return escapeHtml(token);
      matcher.cursor = matchedIndex + 1;
      const tabIndex = firstFocusableWord ? 0 : -1;
      firstFocusableWord = false;
      return `<span class="timed-word" role="button" tabindex="${tabIndex}" data-timing-index="${matchedIndex}" title="Enter／空白鍵播放；左右鍵選字">${escapeHtml(token)}</span>`;
    }).join("");
  }

  function renderAudioPanel(entry, exercise = currentExercise()) {
    const available = Boolean(entry && audioPath(entry));
    const voiceLabel = "可按空白鍵暫停／繼續";
    return `
      <section class="audio-panel" aria-label="示範錄音控制">
        <div class="audio-main-controls">
          <button class="audio-button" type="button" data-model-audio-toggle${available ? "" : " disabled"} aria-pressed="false">
            <span data-audio-button-label>${available ? Number(exercise?.part) === 3 ? "▶ 播放目前路線" : "▶ 播放示範" : "音訊準備中"}</span>
          </button>
          <span class="audio-note">${voiceLabel}</span>
        </div>
        <div class="audio-options">
          <div class="rate-selector" role="group" aria-label="播放速度">
            ${AUDIO_RATES.map(rate => `<button class="rate-button${rate === state.selectedRate ? " active" : ""}" type="button" data-audio-rate="${rate}" aria-pressed="${rate === state.selectedRate}">${rate}X</button>`).join("")}
          </div>
          <button class="highlight-toggle${state.highlightEnabled ? " active" : ""}" type="button" data-highlight-toggle aria-pressed="${state.highlightEnabled}">
            同步標示 <strong data-highlight-state>${state.highlightEnabled ? "ON" : "OFF"}</strong>
          </button>
        </div>
      </section>
    `;
  }

  function currentRecordingContext() {
    if (state.route.view === "exam-practice") {
      const item = currentExamRecordingItem();
      const session = state.examSession;
      if (!item || !session || typeof EXAM_MODE.recordingExerciseId !== "function") return null;
      const intro = item.kind === "intro";
      return {
        key: examItemKey(item),
        isExam: true,
        item,
        id: intro && typeof EXAM_MODE.recordingIntroId === "function"
          ? EXAM_MODE.recordingIntroId(session.modeId, session.id, item.part)
          : EXAM_MODE.recordingExerciseId(session.modeId, session.id, item.part, item.globalOrder),
        title: String(item.title || `IELTS Part ${item.part} question`).slice(0, 240),
        part: Number(item.part),
        book: Number(item.sourceBook || 1),
        index: Number(item.sourceIndex || item.globalOrder || 1),
        globalOrder: Number(item.globalOrder),
        intro,
        modeId: session.modeId,
        attemptId: session.id
      };
    }
    const exercise = currentExercise();
    if (!exercise || state.route.view !== "exercise") return null;
    return {
      key: `exercise:${exercise.id}`,
      isExam: false,
      item: exercise,
      id: exercise.id,
      title: exercise.title,
      part: Number(state.route.part || exercise.part || 2),
      book: Number(state.route.book || exercise.book || 1),
      index: Number(exercise.index || 1)
    };
  }

  function activeRecordingLimitSeconds() {
    const context = currentRecordingContext();
    if (context?.isExam && !context.intro && context.part === 2) return EXAM_PART2_RECORDING_SECONDS;
    return Math.min(300, Math.max(30, Number(CONFIG.maxRecordingSeconds || 300)));
  }

  function renderRecorderCard(exercise) {
    if (state.user?.role === "admin") {
      return `
        <section class="notice-card admin-recorder-notice">
          <h2>管理員模式</h2>
          <p>學生錄音及儲存功能只供學生帳戶使用。管理員可從頁首的「我的錄音」管理所有學生錄音。</p>
        </section>
      `;
    }
    return `
      <section class="recorder-card" aria-labelledby="recording-heading">
        <div>
          <h2 id="recording-heading">輪到你練習</h2>
          <p>允許瀏覽器使用咪高峰，完成後會在你的裝置上轉換成真正的單聲道 MP3，再安全儲存。IELTS Part ${Number(exercise?.part || 2)} 每次最多錄音 5 分鐘。</p>
          <div class="recording-status" data-recording-status><span role="status" aria-live="polite">準備好便按「開始錄音」。</span></div>
        </div>
        <div class="recorder-controls">
          <button class="record-button" type="button" data-record-toggle>● 開始錄音</button>
          <button class="secondary-button finish-recording-button" type="button" data-finish-recording hidden>■ 完成並製作 MP3</button>
        </div>
        <div class="recording-preview" data-recording-preview hidden></div>
      </section>
    `;
  }

  function part1TurnRanges(entry) {
    return Array.isArray(entry?.turnWordRanges) ? entry.turnWordRanges : [];
  }

  function renderPart1AudioPanel(entry) {
    const available = Boolean(entry && audioPath(entry));
    return `
      <section class="audio-panel part1-audio-panel" aria-label="Part 1 對話錄音控制">
        <div class="audio-main-controls">
          <button class="audio-button part1-play-all" type="button" data-model-audio-toggle${available ? "" : " disabled"} aria-pressed="false">
            <span data-audio-button-label>${available ? "▶ 播放完整 Q&A" : "音訊準備中"}</span>
          </button>
          <span class="audio-note">Examiner：女聲 · Answer：British boy</span>
        </div>
        <div class="audio-options">
          <div class="rate-selector" role="group" aria-label="播放速度">
            ${AUDIO_RATES.map(rate => `<button class="rate-button${rate === state.selectedRate ? " active" : ""}" type="button" data-audio-rate="${rate}" aria-pressed="${rate === state.selectedRate}">${rate}X</button>`).join("")}
          </div>
          <button class="highlight-toggle${state.highlightEnabled ? " active" : ""}" type="button" data-highlight-toggle aria-pressed="${state.highlightEnabled}">
            同步標示 <strong data-highlight-state>${state.highlightEnabled ? "ON" : "OFF"}</strong>
          </button>
        </div>
      </section>`;
  }

  function renderPart1Message(question, role, turnIndex, matcher, available) {
    const isQuestion = role === "question";
    const number = Number(question.number || Math.floor(turnIndex / 2) + 1);
    const english = isQuestion ? question.questionEn : question.answerEn;
    const chinese = isQuestion ? question.questionZh : question.answerZh;
    const speaker = isQuestion ? "EXAMINER QUESTION" : "BAND 9 ANSWER";
    const label = isQuestion ? `Q${number}` : `A${number}`;
    return `
      <li class="part1-row ${isQuestion ? "part1-question-row" : "part1-answer-row"}" id="part1-${isQuestion ? "question" : "answer"}-${pad(number)}" data-part1-turn="${turnIndex}" tabindex="-1">
        <article class="part1-message ${isQuestion ? "part1-question-message" : "part1-answer-message"}" aria-label="${escapeHtml(`${label} ${speaker}`)}">
          <header class="part1-message-header">
            <span>${escapeHtml(label)} · ${escapeHtml(speaker)}</span>
            <button class="part1-message-audio" type="button" data-part1-turn-play="${turnIndex}" data-audio-available="${available}" ${available ? "" : "disabled"} aria-label="播放 ${escapeHtml(label)}">
              <span data-part1-turn-label>▶ 聆聽</span>
            </button>
          </header>
          <p class="part1-message-en" lang="en">${renderTimedEnglish(english, matcher)}</p>
          <p class="part1-message-zh" lang="zh-Hant">${escapeHtml(chinese)}</p>
        </article>
      </li>`;
  }

  function stopPart1RevealListeners() {
    if (state.part1RevealFrame) cancelAnimationFrame(state.part1RevealFrame);
    state.part1RevealFrame = 0;
    if (state.part1RevealScrollHandler) window.removeEventListener("scroll", state.part1RevealScrollHandler);
    if (state.part1RevealResizeHandler) window.removeEventListener("resize", state.part1RevealResizeHandler);
    state.part1RevealScrollHandler = null;
    state.part1RevealResizeHandler = null;
  }

  function cleanupPart1Reveal() {
    stopPart1RevealListeners();
    state.part1RevealMessages = [];
    state.part1RevealNextIndex = 0;
    state.part1RevealAll = false;
    state.part1AnimationDisabled = false;
  }

  function setPart1MessageAvailable(message, available) {
    if (!message) return;
    message.inert = !available;
    message.toggleAttribute("inert", !available);
    const listen = message.querySelector("[data-part1-turn-play]");
    if (listen) listen.disabled = !available || listen.dataset.audioAvailable !== "true";
    const words = [...message.querySelectorAll("[data-timing-index]")];
    words.forEach((word, index) => { word.tabIndex = available && index === 0 ? 0 : -1; });
  }

  function setPart1MessageRevealed(message) {
    if (!message || message.classList.contains("is-revealed")) return;
    message.classList.add("is-revealed");
    setPart1MessageAvailable(message, true);
    if (!state.part1AnimationDisabled && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      message.classList.add("is-entering");
      window.setTimeout(() => message.classList.remove("is-entering"), 620);
    }
  }

  function revealPart1Through(turnIndex) {
    const messages = state.part1RevealMessages.length
      ? state.part1RevealMessages
      : [...document.querySelectorAll("[data-part1-turn]")];
    const targetIndex = Math.min(messages.length - 1, Math.max(0, Number(turnIndex) || 0));
    for (let index = state.part1RevealNextIndex; index <= targetIndex; index += 1) {
      setPart1MessageRevealed(messages[index]);
    }
    state.part1RevealNextIndex = Math.max(state.part1RevealNextIndex, targetIndex + 1);
    if (state.part1RevealNextIndex >= messages.length) stopPart1RevealListeners();
  }

  function revealAllPart1Messages() {
    const messages = state.part1RevealMessages.length
      ? state.part1RevealMessages
      : [...document.querySelectorAll("[data-part1-turn]")];
    messages.forEach(setPart1MessageRevealed);
    state.part1RevealNextIndex = messages.length;
    state.part1RevealAll = true;
    stopPart1RevealListeners();
  }

  function syncPart1AnimationControl() {
    const button = document.querySelector("[data-part1-disable-animation]");
    if (!button) return;
    const reducedMotion = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    const enabled = !state.part1AnimationDisabled && !reducedMotion;
    button.setAttribute("aria-checked", String(enabled));
    button.setAttribute("aria-disabled", String(reducedMotion));
    button.innerHTML = enabled
      ? "動畫 <strong>ON</strong><span>Disable animation</span>"
      : `動畫 <strong>OFF</strong><span>${reducedMotion ? "Reduced motion" : "Enable animation"}</span>`;
  }

  function setPart1AnimationDisabled(disabled, { announce = true } = {}) {
    const nextDisabled = Boolean(disabled);
    const reducedMotion = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    if (!nextDisabled && reducedMotion) {
      if (announce) toast("你的裝置已啟用減少動態效果，因此會保持顯示全部訊息。", "info");
      syncPart1AnimationControl();
      return;
    }
    const conversation = document.querySelector("[data-part1-conversation]");
    const messages = state.part1RevealMessages.length
      ? state.part1RevealMessages
      : [...document.querySelectorAll("[data-part1-turn]")];
    if (!conversation || !messages.length || state.part1AnimationDisabled === nextDisabled) {
      syncPart1AnimationControl();
      return;
    }

    if (nextDisabled) {
      state.part1AnimationDisabled = true;
      conversation.classList.add("part1-animation-disabled");
      messages.forEach(message => {
        message.classList.remove("is-entering");
        setPart1MessageAvailable(message, true);
      });
    } else {
      checkPart1RevealPosition();
      if (Number(currentExercise()?.part) === 1 && state.modelAudio && state.modelAudioExerciseId === currentExercise()?.id) {
        const { entry } = currentAudioContext();
        revealPart1AudioTime(entry, state.modelAudio.currentTime);
      }
      const activeRow = document.activeElement?.closest?.("[data-part1-turn]");
      if (activeRow && Number(activeRow.dataset.part1Turn) >= state.part1RevealNextIndex) {
        document.querySelector("[data-part1-disable-animation]")?.focus({ preventScroll: true });
      }
      messages.forEach((message, index) => {
        message.classList.remove("is-entering");
        message.classList.toggle("is-revealed", index < state.part1RevealNextIndex);
        setPart1MessageAvailable(message, index < state.part1RevealNextIndex);
      });
      state.part1AnimationDisabled = false;
      conversation.classList.remove("part1-animation-disabled");
      if (state.part1RevealNextIndex < messages.length) {
        stopPart1RevealListeners();
        state.part1RevealScrollHandler = schedulePart1RevealCheck;
        state.part1RevealResizeHandler = schedulePart1RevealCheck;
        window.addEventListener("scroll", state.part1RevealScrollHandler, { passive: true });
        window.addEventListener("resize", state.part1RevealResizeHandler, { passive: true });
        schedulePart1RevealCheck();
      }
    }
    syncPart1AnimationControl();
    if (announce) {
      toast(nextDisabled
        ? `動畫已關閉；全部 ${messages.length} 則訊息暫時顯示。`
        : "動畫已開啟；未到達的訊息會再次等待你捲動或播放音訊。", "info");
    }
  }

  function togglePart1Animation() {
    setPart1AnimationDisabled(!state.part1AnimationDisabled);
  }

  function checkPart1RevealPosition() {
    state.part1RevealFrame = 0;
    const messages = state.part1RevealMessages;
    const revealLine = window.innerHeight * .82;
    while (
      state.part1RevealNextIndex < messages.length
      && messages[state.part1RevealNextIndex].getBoundingClientRect().top <= revealLine
    ) {
      revealPart1Through(state.part1RevealNextIndex);
    }
  }

  function schedulePart1RevealCheck() {
    if (state.part1RevealFrame || state.part1RevealAll) return;
    state.part1RevealFrame = requestAnimationFrame(checkPart1RevealPosition);
  }

  function setupPart1Reveal() {
    stopPart1RevealListeners();
    state.part1RevealMessages = [...document.querySelectorAll("[data-part1-turn]")];
    state.part1RevealNextIndex = 0;
    state.part1RevealAll = false;
    const conversation = document.querySelector("[data-part1-conversation]");
    if (!conversation || !state.part1RevealMessages.length) return;
    conversation.classList.add("part1-reveal-ready");
    conversation.classList.remove("part1-animation-disabled");
    state.part1RevealMessages.forEach(message => {
      message.classList.remove("is-revealed", "is-entering");
      setPart1MessageAvailable(message, false);
    });
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPart1AnimationDisabled(true, { announce: false });
      return;
    }
    state.part1RevealScrollHandler = schedulePart1RevealCheck;
    state.part1RevealResizeHandler = schedulePart1RevealCheck;
    window.addEventListener("scroll", state.part1RevealScrollHandler, { passive: true });
    window.addEventListener("resize", state.part1RevealResizeHandler, { passive: true });
    syncPart1AnimationControl();
    schedulePart1RevealCheck();
  }

  function renderPart1Exercise(exercise, entry) {
    const matcher = { rows: timingRows(entry), cursor: 0 };
    const available = Boolean(entry && audioPath(entry));
    const questions = exercise.questions || [];
    cleanupPart1Reveal();
    dom.content.innerHTML = `
      <article class="exercise-view part1-exercise">
        <header class="exercise-hero part1-exercise-hero" data-exercise-number="${pad(exercise.index)}">
          <div class="part1-hero-meta">
            <p class="eyebrow">IELTS SPEAKING · PART 1 · BOOK ${exercise.book}</p>
            <span>${questions.length} QUESTIONS · Q&amp;A</span>
          </div>
          <h1>${escapeHtml(exercise.title)}</h1>
          ${exercise.titleZh ? `<p>${escapeHtml(exercise.titleZh)}</p>` : ""}
        </header>

        <section class="part1-directory" aria-labelledby="part1-directory-heading">
          <div class="part1-directory-heading">
            <div><span class="cue-label">QUESTION DIRECTORY · 題目目錄</span><h2 id="part1-directory-heading">先看本組全部問題</h2></div>
            <button class="part1-animation-toggle" type="button" role="switch" data-part1-disable-animation aria-controls="part1-conversation" aria-checked="true" aria-disabled="false">動畫 <strong>ON</strong><span>Disable animation</span></button>
          </div>
          <ol class="part1-question-index">
            ${questions.map((question, index) => `
              <li><a href="#part1-question-${pad(question.number)}" data-part1-question-link="${index * 2}"><span>Q${pad(question.number)}</span>${escapeHtml(question.questionEn)}</a></li>
            `).join("")}
          </ol>
        </section>

        ${renderPart1AudioPanel(entry)}

        <section class="part1-dialogue-stage" aria-labelledby="part1-dialogue-heading">
          <header class="part1-dialogue-heading">
            <div><span class="cue-label">SCROLL TO POP · 向下捲動</span><h2 id="part1-dialogue-heading">Examiner 與你的 Band 9 對話</h2></div>
            <p>問題從右、答案從左逐一彈出；你可隨時關閉或重新開啟動畫。</p>
          </header>
          <ol class="part1-conversation" id="part1-conversation" data-part1-conversation>
            ${questions.map((question, index) => (
              renderPart1Message(question, "question", index * 2, matcher, available)
              + renderPart1Message(question, "answer", index * 2 + 1, matcher, available)
            )).join("")}
          </ol>
        </section>

        ${renderRecorderCard(exercise)}
      </article>
    `;
    setupPart1Reveal();
    syncAudioControls();
  }

  function renderPart3Model(model, index, matcher, entry) {
    const letter = String.fromCharCode(65 + index);
    const firstIdea = model.steps.find(step => step.stage === "idea") || model.steps[0];
    const available = Boolean(entry && audioPath(entry));
    return `
      <section class="part3-model-card${index === 0 ? " is-open" : ""}" data-part3-model="${index}">
        <button class="part3-model-toggle" type="button" data-part3-model-toggle="${index}" aria-expanded="${index === 0}" aria-controls="part3-model-panel-${index}">
          <span class="part3-model-letter">${letter}</span>
          <span class="part3-model-title">
            <small>RESPONSE ROUTE ${letter} · 回答路線 ${index + 1}</small>
            <strong>${escapeHtml(firstIdea?.textEn || `Band 9 response ${index + 1}`)}</strong>
            <em>${model.steps.length} steps · Idea → Explanation → Example → Conclusion</em>
          </span>
          <span class="part3-model-chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="part3-model-panel" id="part3-model-panel-${index}" ${index === 0 ? "" : "hidden"}>
          <div class="part3-model-toolbar">
            <button class="part3-listen-button" type="button" data-part3-model-play="${index}" ${available ? "" : "disabled"}>
              <span data-part3-model-play-label>${available ? `▶ 聆聽路線 ${letter}` : "音訊準備中"}</span>
            </button>
            <span>每一步逐層建立論點；按任何英文字可從該處播放。</span>
          </div>
          <ol class="part3-step-list">
            ${model.steps.map((step, stepIndex) => {
              const stageClass = String(step.stage || "step").replace(/[^a-z0-9-]/g, "");
              return `
                <li class="part3-step stage-${stageClass}">
                  <div class="part3-step-marker"><span>${stepIndex + 1}</span></div>
                  <div class="part3-step-copy">
                    <div class="part3-step-heading"><strong>${escapeHtml(step.labelEn)}</strong><span>${escapeHtml(step.labelZh)}</span></div>
                    <p class="part3-step-en" lang="en">${renderTimedEnglish(step.textEn, matcher)}</p>
                    <details class="part3-translation">
                      <summary>查看中文翻譯</summary>
                      <p lang="zh-Hant">${escapeHtml(step.textZh)}</p>
                    </details>
                  </div>
                </li>`;
            }).join("")}
          </ol>
        </div>
      </section>`;
  }

  function renderPart3Exercise(exercise, entry) {
    const matcher = { rows: timingRows(entry), cursor: 0 };
    const exercises = speakingExercises(exercise.part, exercise.book);
    const position = exercises.findIndex(item => item.id === exercise.id);
    const previous = position > 0 ? exercises[position - 1] : null;
    const next = position >= 0 && position < exercises.length - 1 ? exercises[position + 1] : null;
    dom.content.innerHTML = `
      <article class="exercise-view part3-exercise">
        <header class="exercise-hero part3-exercise-hero" data-exercise-number="${pad(exercise.index)}">
          <div class="part3-hero-meta">
            <p class="eyebrow">IELTS SPEAKING · PART 3 · BOOK ${exercise.book}</p>
            <span>${escapeHtml(exercise.themeTitle || "Discussion")}</span>
          </div>
          <h1>${escapeHtml(exercise.title)}</h1>
          ${exercise.titleZh ? `<p>${escapeHtml(exercise.titleZh)}</p>` : ""}
        </header>

        <section class="part3-reading-guide" aria-label="練習方法">
          <div><span>01</span><p><strong>Compare both ideas</strong>先比較兩個 Idea。</p></div>
          <div><span>02</span><p><strong>Follow the logic</strong>沿著解釋、例子及總結逐步建立完整答案。</p></div>
          <div><span>03</span><p><strong>Listen and speak</strong>聆聽示範後，錄下自己的 Part 3 回答。</p></div>
        </section>

        ${renderAudioPanel(entry, exercise)}

        <section class="part3-response-section" aria-labelledby="part3-response-heading">
          <div class="part3-response-heading">
            <div><span class="cue-label">BAND 9 ANSWER MAP</span><h2 id="part3-response-heading">兩條回答路線，逐步閱讀</h2></div>
            <p>一次只展開一條長答，減少視覺疲勞。中文翻譯亦可按需要逐段開啟。</p>
          </div>
          <div class="part3-model-list">
            ${exercise.responseModels.map((model, index) => renderPart3Model(model, index, matcher, entry)).join("")}
          </div>
        </section>

        ${renderRecorderCard(exercise)}

        <nav class="part3-exercise-nav" aria-label="Part 3 題目導覽">
          <button class="secondary-button" type="button" data-part3-previous ${previous ? "" : "disabled"}>← 上一題</button>
          <button class="secondary-button" type="button" data-part3-book>返回 Book ${exercise.book}</button>
          <button class="primary-button" type="button" data-part3-next ${next ? "" : "disabled"}>下一題 →</button>
        </nav>
      </article>
    `;
    syncAudioControls();
  }

  function focusRoutedQuestion() {
    const questionNumber = Number(state.route.questionNumber || 0);
    if (!questionNumber) return;
    window.requestAnimationFrame(() => {
      const isPart1 = Number(state.route.part) === 1;
      if (isPart1) {
        const questionIndex = currentExercise()?.questions?.findIndex(question => Number(question.number) === questionNumber) ?? -1;
        if (questionIndex >= 0) revealPart1Through(questionIndex * 2);
      }
      const target = isPart1
        ? document.querySelector(`#part1-question-${pad(questionNumber)}`)
        : document.querySelector(".exercise-hero h1");
      if (!target) return;
      target.setAttribute("tabindex", "-1");
      target.scrollIntoView({ behavior: preferredScrollBehavior(), block: "center" });
      target.focus({ preventScroll: true });
    });
  }

  function renderExercise() {
    const exercise = currentExercise();
    if (!exercise || exercise.unavailable) {
      dom.content.innerHTML = `
        <section class="notice-card">
          <h2>練習內容準備中</h2>
          <p>這個練習的資料檔尚未載入，請返回後稍後再試。</p>
        </section>
      `;
      return;
    }
    const entry = resolveAudioEntry(exercise);
    if (exercise.part === 1) {
      renderPart1Exercise(exercise, entry);
      focusRoutedQuestion();
      return;
    }
    if (exercise.part === 3) {
      renderPart3Exercise(exercise, entry);
      focusRoutedQuestion();
      return;
    }
    const matcher = { rows: timingRows(entry), cursor: 0 };
    dom.content.innerHTML = `
      <article class="exercise-view">
        <header class="exercise-hero" data-exercise-number="${pad(exercise.index)}">
          <p class="eyebrow">IELTS SPEAKING · PART ${exercise.part} · BOOK ${exercise.book}</p>
          <h1>${escapeHtml(exercise.title)}</h1>
          ${exercise.titleZh ? `<p>${escapeHtml(exercise.titleZh)}</p>` : ""}
        </header>

        <section class="cue-card" aria-labelledby="cue-heading">
          <span class="cue-label" id="cue-heading">QUESTION · 題目與提示</span>
          <p class="cue-copy">${escapeHtml(exercise.cueText || "題目內容準備中")}</p>
        </section>

        ${renderAudioPanel(entry, exercise)}

        <div class="response-grid" aria-label="Band 9 四部分示範答案">
          ${exercise.responses.slice(0, 4).map((response, index) => `
            <section class="response-card">
              <span class="response-number">PART ${index + 1} · 第 ${index + 1} 部分</span>
              <h2>${escapeHtml(response.headingEn || `Response ${index + 1}`)}</h2>
              ${response.headingZh ? `<p class="heading-zh">${escapeHtml(response.headingZh)}</p>` : '<p class="heading-zh">高分示範答案</p>'}
              <p class="response-en" lang="en">${renderTimedEnglish(response.textEn, matcher)}</p>
              <p class="response-zh" lang="zh-Hant">${escapeHtml(response.textZh)}</p>
            </section>
          `).join("")}
        </div>

        ${renderRecorderCard(exercise)}
      </article>
    `;
    syncAudioControls();
    focusRoutedQuestion();
  }

  function currentAudioContext() {
    const exercise = currentExercise();
    return { exercise, entry: resolveAudioEntry(exercise) };
  }

  function clearHighlight() {
    if (state.highlightFrame) cancelAnimationFrame(state.highlightFrame);
    state.highlightFrame = 0;
    document.querySelector(".timed-word.is-spoken")?.classList.remove("is-spoken");
    state.activeWordIndex = -1;
  }

  function timingIndexAtTime(rows, currentTime) {
    let low = 0;
    let high = rows.length - 1;
    let result = -1;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if (rows[middle].start <= currentTime) {
        result = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
    if (result < 0) return -1;
    return currentTime > rows[result].end + .08 ? -1 : result;
  }

  function part1TrailingTimingIndex(entry, currentTime) {
    const ranges = part1TurnRanges(entry);
    for (const range of ranges) {
      const audioEnd = Number(range?.audioEnd);
      const playbackEnd = Number(range?.playbackEnd);
      const wordEnd = Number(range?.wordEnd);
      if (
        Number.isFinite(audioEnd)
        && Number.isFinite(playbackEnd)
        && Number.isInteger(wordEnd)
        && currentTime > audioEnd
        && currentTime <= playbackEnd
      ) return Math.max(0, wordEnd - 1);
    }
    return -1;
  }

  function updateHighlight() {
    if (!state.highlightEnabled || !state.modelAudio) {
      clearHighlight();
      return;
    }
    const { entry } = currentAudioContext();
    const rows = timingRows(entry);
    let index = timingIndexAtTime(rows, state.modelAudio.currentTime);
    if (index < 0 && Number(currentExercise()?.part) === 1) {
      index = part1TrailingTimingIndex(entry, state.modelAudio.currentTime);
    }
    if (index === state.activeWordIndex) return;
    document.querySelector(".timed-word.is-spoken")?.classList.remove("is-spoken");
    state.activeWordIndex = index;
    if (index < 0) return;
    const word = document.querySelector(`[data-timing-index="${index}"]`);
    if (!word) return;
    word.classList.add("is-spoken");
    const part1Turn = word.closest("[data-part1-turn]");
    if (part1Turn) revealPart1Through(Number(part1Turn.dataset.part1Turn));
  }

  function startHighlightLoop() {
    if (state.highlightFrame) cancelAnimationFrame(state.highlightFrame);
    const part1AudioActive = Number(currentExercise()?.part) === 1;
    if (!state.highlightEnabled && !part1AudioActive) return;
    const tick = () => {
      if (!state.modelAudio || state.modelAudio.paused || state.modelAudio.ended) {
        state.highlightFrame = 0;
        return;
      }
      if (
        state.modelAudioSegmentIndex >= 0
        && state.modelAudioSegmentEnd
        && state.modelAudio.currentTime >= state.modelAudioSegmentEnd
      ) {
        stopModelAudio();
        return;
      }
      if (Number(currentExercise()?.part) === 1) {
        const { entry } = currentAudioContext();
        revealPart1AudioTime(entry, state.modelAudio.currentTime);
      }
      if (state.highlightEnabled) updateHighlight();
      state.highlightFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  function syncAudioControls() {
    document.querySelectorAll("[data-audio-rate]").forEach(button => {
      const active = Number(button.dataset.audioRate) === state.selectedRate;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const toggle = document.querySelector("[data-highlight-toggle]");
    if (toggle) {
      toggle.classList.toggle("active", state.highlightEnabled);
      toggle.setAttribute("aria-pressed", String(state.highlightEnabled));
      const label = toggle.querySelector("[data-highlight-state]");
      if (label) label.textContent = state.highlightEnabled ? "ON" : "OFF";
    }
    const exercise = currentExercise();
    const isCurrent = state.modelAudioExerciseId === exercise?.id;
    const pendingStart = Boolean(isCurrent && state.modelAudio && state.modelAudioPendingStart);
    const playing = Boolean(isCurrent && state.modelAudio && !state.modelAudio.paused && !state.modelAudio.ended);
    const resumable = Boolean(isCurrent && state.modelAudio && state.modelAudio.paused && state.modelAudio.currentTime > 0 && !state.modelAudio.ended);
    const button = document.querySelector("[data-model-audio-toggle]");
    if (button) {
      const isPart1 = Number(exercise?.part) === 1;
      const isPart3 = Number(exercise?.part) === 3;
      const wholePart1 = isPart1 && state.modelAudioSegmentIndex < 0;
      const buttonPlaying = isPart1 ? (playing || pendingStart) && wholePart1 : playing || pendingStart;
      const buttonResumable = isPart1 ? resumable && wholePart1 : resumable;
      const text = buttonPlaying
        ? isPart1 ? "❚❚ 暫停完整 Q&A" : isPart3 ? "❚❚ 暫停目前路線" : "❚❚ 暫停示範"
        : buttonResumable
          ? isPart1 ? "▶ 繼續完整 Q&A" : isPart3 ? "▶ 繼續目前路線" : "▶ 繼續示範"
          : isPart1 ? "▶ 播放完整 Q&A" : isPart3 ? "▶ 播放目前路線" : "▶ 播放示範";
      const label = button.querySelector("[data-audio-button-label]");
      if (label && !button.disabled) label.textContent = text;
      button.classList.toggle("is-playing", buttonPlaying);
      button.setAttribute("aria-pressed", String(buttonPlaying));
    }
    document.querySelectorAll("[data-part1-turn-play]").forEach(turnButton => {
      const index = Number(turnButton.dataset.part1TurnPlay);
      const active = Number(exercise?.part) === 1 && isCurrent && state.modelAudioSegmentIndex === index;
      const activePlaying = active && (playing || pendingStart);
      const label = turnButton.querySelector("[data-part1-turn-label]");
      if (label && turnButton.dataset.audioAvailable === "true") {
        label.textContent = activePlaying ? "❚❚ 暫停" : active && resumable ? "▶ 繼續" : "▶ 聆聽";
      }
      turnButton.classList.toggle("is-playing", activePlaying);
      turnButton.setAttribute("aria-pressed", String(activePlaying));
    });
    document.querySelectorAll("[data-part3-model-play]").forEach(modelButton => {
      const index = Number(modelButton.dataset.part3ModelPlay);
      const active = isCurrent && state.modelAudioSegmentIndex === index;
      const activePlaying = active && (playing || pendingStart);
      const label = modelButton.querySelector("[data-part3-model-play-label]");
      const letter = String.fromCharCode(65 + index);
      if (label && !modelButton.disabled) label.textContent = activePlaying
        ? `❚❚ 暫停路線 ${letter}`
        : active && resumable
          ? `▶ 繼續路線 ${letter}`
          : `▶ 聆聽路線 ${letter}`;
      modelButton.classList.toggle("is-playing", activePlaying);
      modelButton.setAttribute("aria-pressed", String(activePlaying));
    });
  }

  function stopModelAudio() {
    state.modelAudioGeneration += 1;
    clearHighlight();
    if (state.modelAudio) {
      state.modelAudio.onloadedmetadata = null;
      state.modelAudio.onplay = null;
      state.modelAudio.onpause = null;
      state.modelAudio.onended = null;
      state.modelAudio.ontimeupdate = null;
      state.modelAudio.onerror = null;
      state.modelAudio.pause();
      state.modelAudio.removeAttribute("src");
      state.modelAudio.load();
    }
    state.modelAudio = null;
    state.modelAudioExerciseId = "";
    state.modelAudioSegmentStart = 0;
    state.modelAudioSegmentEnd = 0;
    state.modelAudioSegmentIndex = -1;
    state.modelAudioPendingStart = false;
    syncAudioControls();
  }

  function startModelAudio(exercise, entry, startAt = 0, stopAt = 0, segmentIndex = -1) {
    if (!exercise || !entry || !audioPath(entry)) return;
    stopAttemptPlayback();
    stopModelAudio();
    const generation = state.modelAudioGeneration;
    const audio = new Audio();
    state.modelAudio = audio;
    state.modelAudioExerciseId = exercise.id;
    state.modelAudioSegmentStart = Math.max(0, Number(startAt) || 0);
    state.modelAudioSegmentEnd = Math.max(0, Number(stopAt) || 0);
    state.modelAudioSegmentIndex = Number.isInteger(segmentIndex) ? segmentIndex : -1;
    state.modelAudioPendingStart = true;
    audio.preload = "metadata";
    audio.src = audioUrl(entry);
    audio.defaultPlaybackRate = state.selectedRate;
    audio.playbackRate = state.selectedRate;
    audio.preservesPitch = true;
    audio.onplay = () => {
      state.modelAudioPendingStart = false;
      syncAudioControls();
      startHighlightLoop();
    };
    audio.onpause = () => {
      if (state.highlightFrame) cancelAnimationFrame(state.highlightFrame);
      state.highlightFrame = 0;
      syncAudioControls();
    };
    audio.onended = () => {
      clearHighlight();
      if (state.modelAudioSegmentIndex >= 0) {
        stopModelAudio();
        return;
      }
      if (Number(exercise.part) === 1) revealAllPart1Messages();
      audio.currentTime = 0;
      syncAudioControls();
    };
    audio.ontimeupdate = () => {
      if (Number(exercise.part) === 1) revealPart1AudioTime(entry, audio.currentTime);
      if (
        state.modelAudioSegmentIndex < 0
        || !state.modelAudioSegmentEnd
        || audio.currentTime < state.modelAudioSegmentEnd
      ) return;
      stopModelAudio();
    };
    audio.onerror = () => {
      toast("示範音訊未能載入，請檢查連線後再試。", "error");
      stopModelAudio();
    };
    const play = () => {
      if (generation !== state.modelAudioGeneration || state.modelAudio !== audio || !state.user) return;
      const result = audio.play();
      if (result?.catch) result.catch(error => {
        if (generation !== state.modelAudioGeneration || state.modelAudio !== audio) return;
        state.modelAudioPendingStart = false;
        console.warn("Speaking sample playback failed:", error);
        toast("瀏覽器未能開始播放，請再按一次播放鍵。", "error");
        syncAudioControls();
      });
    };
    const begin = () => {
      if (generation !== state.modelAudioGeneration || state.modelAudio !== audio || !state.user) return;
      if (Number(exercise.part) === 1) revealPart1Through(state.modelAudioSegmentIndex >= 0 ? state.modelAudioSegmentIndex : 0);
      try {
        audio.currentTime = Math.max(0, Number(startAt) || 0);
      } catch {
        // A small number of browsers reject a seek before metadata is ready.
      }
      play();
    };
    const eagerPart1Conversation = Number(exercise.part) === 1
      && state.modelAudioSegmentIndex < 0
      && Math.max(0, Number(startAt) || 0) < .01;
    if (eagerPart1Conversation) {
      revealPart1Through(0);
      play();
    } else if (audio.readyState >= 1) begin();
    else audio.onloadedmetadata = begin;
    syncAudioControls();
  }

  function toggleModelAudio() {
    if (state.recordingPermissionPending || state.recordingTransition || state.mediaRecorder?.state === "recording") {
      toast("請先暫停錄音，才播放示範音訊。", "error");
      return;
    }
    const { exercise, entry } = currentAudioContext();
    if (!exercise || !entry) return;
    if (Number(exercise.part) === 1) {
      if (state.modelAudio && state.modelAudioExerciseId === exercise.id && state.modelAudioSegmentIndex < 0) {
        if (state.modelAudioPendingStart) {
          stopModelAudio();
          return;
        }
        if (!state.modelAudio.paused && !state.modelAudio.ended) state.modelAudio.pause();
        else {
          const result = state.modelAudio.play();
          if (result?.catch) result.catch(error => console.warn("Part 1 conversation resume failed:", error));
        }
        return;
      }
      revealPart1Through(0);
      startModelAudio(exercise, entry, 0, 0, -1);
      return;
    }
    if (Number(exercise.part) === 3) {
      const openModel = document.querySelector("[data-part3-model].is-open");
      playPart3Model(Number(openModel?.dataset.part3Model || 0));
      return;
    }
    if (state.modelAudio && state.modelAudioExerciseId === exercise.id) {
      if (state.modelAudioPendingStart) {
        stopModelAudio();
        return;
      }
      if (!state.modelAudio.paused && !state.modelAudio.ended) {
        state.modelAudio.pause();
        return;
      }
      const result = state.modelAudio.play();
      if (result?.catch) result.catch(error => console.warn("Speaking sample resume failed:", error));
      return;
    }
    startModelAudio(exercise, entry, 0, 0, -1);
  }

  function part1TurnAudioRange(entry, turnIndex) {
    const ranges = part1TurnRanges(entry);
    const index = Number(turnIndex);
    const range = ranges[index];
    if (!range) return null;
    const audioStart = Number(range.audioStart);
    const revealAt = Number(range.revealAt);
    const playbackEnd = Number(range.playbackEnd);
    if (!Number.isFinite(audioStart) || !Number.isFinite(playbackEnd) || playbackEnd <= audioStart) return null;
    const start = Number.isFinite(revealAt) && revealAt <= audioStart
      ? Math.max(0, revealAt)
      : Math.max(0, audioStart - .28);
    const nextReveal = Number(ranges[index + 1]?.revealAt);
    const end = Number.isFinite(nextReveal)
      ? Math.min(playbackEnd + PART1_SEGMENT_TAIL_SECONDS, nextReveal - .08)
      : 0;
    return { start, end };
  }

  function revealPart1AudioTime(entry, currentTime) {
    const ranges = part1TurnRanges(entry);
    const segmentIndex = Number(state.modelAudioSegmentIndex);
    const maximumIndex = segmentIndex >= 0 ? Math.min(segmentIndex, ranges.length - 1) : ranges.length - 1;
    const playbackRate = Math.max(0.25, Number(state.modelAudio?.playbackRate || state.selectedRate || 1));
    const animationLead = (PART1_POP_DURATION_SECONDS + PART1_POP_SAFETY_SECONDS) * playbackRate;
    for (let index = state.part1RevealNextIndex; index <= maximumIndex; index += 1) {
      const range = ranges[index] || {};
      const revealAt = Number(range.revealAt);
      const audioStart = Number(range.audioStart);
      const audioTrigger = Number.isFinite(audioStart) ? audioStart - animationLead : revealAt;
      const trigger = Number.isFinite(revealAt) ? Math.min(revealAt, audioTrigger) : audioTrigger;
      if (!Number.isFinite(trigger) || trigger > Number(currentTime) + .03) break;
      revealPart1Through(index);
    }
  }

  function playPart1Turn(turnIndex) {
    if (state.recordingPermissionPending || state.recordingTransition || state.mediaRecorder?.state === "recording") {
      toast("請先暫停錄音，才播放示範音訊。", "error");
      return;
    }
    const { exercise, entry } = currentAudioContext();
    const index = Number(turnIndex);
    const range = part1TurnAudioRange(entry, index);
    if (!exercise || Number(exercise.part) !== 1 || !entry || !range) return;
    revealPart1Through(index);
    if (state.modelAudio && state.modelAudioExerciseId === exercise.id && state.modelAudioSegmentIndex === index) {
      if (state.modelAudioPendingStart) {
        stopModelAudio();
        return;
      }
      if (!state.modelAudio.paused) state.modelAudio.pause();
      else {
        const result = state.modelAudio.play();
        if (result?.catch) result.catch(error => console.warn("Part 1 turn resume failed:", error));
      }
      return;
    }
    startModelAudio(exercise, entry, range.start, range.end, index);
  }

  function part3ModelAudioRange(exercise, entry, modelIndex) {
    const ranges = Array.isArray(entry?.sectionWordRanges) ? entry.sectionWordRanges : [];
    const rows = timingRows(entry);
    const models = exercise?.responseModels || [];
    const startSection = models.slice(0, modelIndex).reduce((count, model) => count + model.steps.length, 0);
    const sectionCount = models[modelIndex]?.steps?.length || 0;
    const first = ranges[startSection];
    const last = ranges[startSection + sectionCount - 1];
    if (!first || !last || !sectionCount) return null;
    const firstWord = rows[Number(first.wordStart)];
    const lastWord = rows[Math.max(0, Number(last.wordEnd) - 1)];
    if (!firstWord || !lastWord) return null;
    return { start: firstWord.start, end: lastWord.end + 0.08 };
  }

  function openPart3Model(modelIndex) {
    document.querySelectorAll("[data-part3-model]").forEach(card => {
      const open = Number(card.dataset.part3Model) === Number(modelIndex);
      card.classList.toggle("is-open", open);
      const toggle = card.querySelector("[data-part3-model-toggle]");
      const panel = card.querySelector(".part3-model-panel");
      if (toggle) toggle.setAttribute("aria-expanded", String(open));
      if (panel) panel.hidden = !open;
    });
  }

  function togglePart3Model(modelIndex) {
    const card = document.querySelector(`[data-part3-model="${Number(modelIndex)}"]`);
    if (!card) return;
    const opening = !card.classList.contains("is-open");
    if (state.modelAudio && state.modelAudioSegmentIndex >= 0) stopModelAudio();
    if (opening) openPart3Model(modelIndex);
    else {
      card.classList.remove("is-open");
      card.querySelector("[data-part3-model-toggle]")?.setAttribute("aria-expanded", "false");
      const panel = card.querySelector(".part3-model-panel");
      if (panel) panel.hidden = true;
    }
  }

  function playPart3Model(modelIndex) {
    if (state.recordingPermissionPending || state.recordingTransition || state.mediaRecorder?.state === "recording") {
      toast("請先暫停錄音，才播放示範音訊。", "error");
      return;
    }
    const { exercise, entry } = currentAudioContext();
    const range = part3ModelAudioRange(exercise, entry, Number(modelIndex));
    if (!exercise || !entry || !range) return;
    openPart3Model(modelIndex);
    if (state.modelAudio && state.modelAudioExerciseId === exercise.id && state.modelAudioSegmentIndex === Number(modelIndex)) {
      if (state.modelAudioPendingStart) {
        stopModelAudio();
        return;
      }
      if (!state.modelAudio.paused) state.modelAudio.pause();
      else {
        const result = state.modelAudio.play();
        if (result?.catch) result.catch(error => console.warn("Part 3 response playback failed:", error));
      }
      return;
    }
    startModelAudio(exercise, entry, range.start, range.end, Number(modelIndex));
  }

  function playFromTiming(index) {
    if (state.recordingPermissionPending || state.recordingTransition || state.mediaRecorder?.state === "recording") {
      toast("請先暫停錄音，才從指定文字播放。", "error");
      return;
    }
    const { exercise, entry } = currentAudioContext();
    const row = timingRows(entry)[Number(index)];
    if (!exercise || !entry || !row) return;
    const timedElement = document.querySelector(`[data-timing-index="${Number(index)}"]`);
    const part1TurnElement = Number(exercise.part) === 1 ? timedElement?.closest("[data-part1-turn]") : null;
    const part1Turn = part1TurnElement ? Number(part1TurnElement.dataset.part1Turn) : -1;
    const part1Range = part1Turn >= 0 ? part1TurnAudioRange(entry, part1Turn) : null;
    const part3Model = Number(exercise.part) === 3
      ? Number(timedElement?.closest("[data-part3-model]")?.dataset.part3Model)
      : -1;
    const part3Range = part3Model >= 0 ? part3ModelAudioRange(exercise, entry, part3Model) : null;
    if (state.modelAudio && state.modelAudioExerciseId === exercise.id) {
      const preserveFullPart1 = Number(exercise.part) === 1 && state.modelAudioSegmentIndex < 0;
      const nextSegmentStart = preserveFullPart1 ? 0 : part1Range?.start || part3Range?.start || 0;
      const nextSegmentEnd = preserveFullPart1 ? 0 : part1Range?.end || part3Range?.end || 0;
      const nextSegmentIndex = preserveFullPart1 ? -1 : part1Range ? part1Turn : part3Range ? part3Model : -1;
      if (state.modelAudioPendingStart && state.modelAudio.readyState < 1) {
        if (part1Range) revealPart1Through(part1Turn);
        startModelAudio(exercise, entry, row.start, nextSegmentEnd, nextSegmentIndex);
        return;
      }
      state.modelAudioSegmentStart = nextSegmentStart;
      state.modelAudioSegmentEnd = nextSegmentEnd;
      state.modelAudioSegmentIndex = nextSegmentIndex;
      if (part1Range) revealPart1Through(part1Turn);
      state.modelAudio.currentTime = Math.max(0, row.start);
      updateHighlight();
      syncAudioControls();
      if (state.modelAudio.paused) {
        state.modelAudioPendingStart = true;
        syncAudioControls();
        const result = state.modelAudio.play();
        if (result?.catch) result.catch(error => {
          state.modelAudioPendingStart = false;
          console.warn("Word seek playback failed:", error);
          syncAudioControls();
        });
      }
      return;
    }
    startModelAudio(
      exercise,
      entry,
      row.start,
      part1Range?.end || part3Range?.end || 0,
      part1Range ? part1Turn : part3Range ? part3Model : -1
    );
  }

  function recorderMimeTypes() {
    const choices = [
      "audio/webm;codecs=opus",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/mp4",
      "audio/webm",
      "audio/ogg;codecs=opus"
    ];
    return choices.filter(type => window.MediaRecorder?.isTypeSupported?.(type));
  }

  function createMediaRecorder(stream) {
    let lastError = null;
    for (const mimeType of recorderMimeTypes()) {
      try {
        return new MediaRecorder(stream, { mimeType });
      } catch (error) {
        lastError = error;
      }
    }
    try {
      return new MediaRecorder(stream);
    } catch (error) {
      throw lastError || error;
    }
  }

  async function requestMicrophoneStream() {
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: { ideal: 1 },
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true }
        },
        video: false
      });
    } catch (error) {
      const name = String(error?.name || "");
      if (name !== "OverconstrainedError" && name !== "ConstraintNotSatisfiedError") throw error;
      return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    }
  }

  function microphoneErrorMessage(error) {
    const name = String(error?.name || "");
    const firefox = /Firefox\//i.test(navigator.userAgent || "");
    const macFirefoxHelp = "請在 Firefox 網址列左邊的權限圖示清除已封鎖設定，再到 macOS「系統設定 → 私隱與保安 → 咪高峰」開啟 Firefox，然後重新啟動 Firefox。";
    if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") {
      return firefox
        ? `Firefox 未允許使用咪高峰。${macFirefoxHelp}`
        : "咪高峰權限被拒絕。請在瀏覽器及裝置設定允許咪高峰，再重新嘗試。";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return firefox
        ? `找不到可用咪高峰。請確認 Mac 已連接或啟用輸入裝置。${macFirefoxHelp}`
        : "找不到可用咪高峰。請接駁或啟用咪高峰，再重新嘗試。";
    }
    if (name === "NotReadableError" || name === "AbortError" || name === "TrackStartError") {
      return firefox
        ? `Firefox 暫時無法讀取咪高峰。請關閉其他正在使用咪高峰的程式。${macFirefoxHelp}`
        : "咪高峰正被其他程式使用或暫時無法讀取。請關閉其他錄音程式，再重新嘗試。";
    }
    if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
      return "目前的咪高峰不支援所需錄音設定。請改用另一個輸入裝置，再重新嘗試。";
    }
    if (name === "InvalidStateError") {
      return "網頁目前未能啟動咪高峰。請重新載入此頁，再按「開始錄音」。";
    }
    return firefox
      ? `未能啟動咪高峰。${macFirefoxHelp}`
      : "未能啟動咪高峰，請檢查裝置及瀏覽器權限後再試。";
  }

  function stopMediaTracks() {
    state.mediaStream?.getTracks().forEach(track => track.stop());
    state.mediaStream = null;
  }

  function clearRecordingTimer() {
    if (state.recordingTimer) window.clearInterval(state.recordingTimer);
    if (state.recordingDeadlineTimer) window.clearTimeout(state.recordingDeadlineTimer);
    state.recordingTimer = 0;
    state.recordingDeadlineTimer = 0;
  }

  function scheduleRecordingTimers() {
    clearRecordingTimer();
    const recorder = state.mediaRecorder;
    const generation = state.recordingGeneration;
    const remaining = Math.max(0, activeRecordingLimitSeconds() * 1000 - activeRecordingDuration());
    const deadline = recordingNow() + remaining;
    let deadlineTimer = 0;
    const stopAtDeadline = () => {
      if (state.recordingDeadlineTimer !== deadlineTimer) return;
      if (generation !== state.recordingGeneration || state.mediaRecorder !== recorder || recorder?.state !== "recording") return;
      const retryIn = Math.ceil(deadline - recordingNow());
      if (retryIn > 0) {
        deadlineTimer = window.setTimeout(stopAtDeadline, retryIn);
        state.recordingDeadlineTimer = deadlineTimer;
        return;
      }
      state.recordingDeadlineTimer = 0;
      finishRecording();
    };
    state.recordingTimer = window.setInterval(updateRecordingClock, 500);
    deadlineTimer = window.setTimeout(stopAtDeadline, remaining);
    state.recordingDeadlineTimer = deadlineTimer;
    updateRecordingClock();
  }

  function recordingStatus(message, mode = "") {
    const status = document.querySelector("[data-recording-status]");
    if (!status) return;
    const recording = mode === true || mode === "recording";
    const paused = mode === "paused";
    status.innerHTML = `
      ${recording || paused ? `<span class="recording-dot${paused ? " paused" : ""}" aria-hidden="true"></span>` : ""}
      <span role="status" aria-live="polite">${escapeHtml(message)}</span>
      ${recording || paused ? '<span class="recording-clock" aria-hidden="true" data-recording-clock></span>' : ""}
    `;
  }

  function formatDuration(milliseconds) {
    const seconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${pad(seconds % 60)}`;
  }

  function recordingNow() {
    return typeof window.performance?.now === "function" ? window.performance.now() : Date.now();
  }

  function activeRecordingDuration() {
    const activeSegment = state.mediaRecorder?.state === "recording" && state.recordingActiveStartedAt
      ? Math.max(0, recordingNow() - state.recordingActiveStartedAt)
      : 0;
    return Math.max(0, state.recordingElapsedMs + activeSegment);
  }

  function commitActiveRecordingDuration() {
    const activeSegment = state.recordingActiveStartedAt
      ? Math.max(0, recordingNow() - state.recordingActiveStartedAt)
      : 0;
    state.recordingElapsedMs = Math.max(0, state.recordingElapsedMs + activeSegment);
    state.recordingActiveStartedAt = 0;
    return state.recordingElapsedMs;
  }

  function updateRecordingClock() {
    if (!state.mediaRecorder || !["recording", "paused"].includes(state.mediaRecorder.state)) return;
    const elapsed = activeRecordingDuration();
    const maxSeconds = activeRecordingLimitSeconds();
    const clock = document.querySelector("[data-recording-clock]");
    const context = currentRecordingContext();
    const remaining = Math.max(0, maxSeconds * 1000 - elapsed);
    if (clock) clock.textContent = context?.isExam && !context.intro && context.part === 2
      ? `剩餘 ${formatDuration(remaining)}`
      : `${formatDuration(elapsed)} / ${formatDuration(maxSeconds * 1000)}`;
    if (context?.isExam && !context.intro && context.part === 2) {
      const examClock = document.querySelector("[data-exam-prep-clock]");
      const examLabel = document.querySelector("[data-exam-prep-label]");
      if (examClock) examClock.textContent = formatDuration(remaining);
      if (examLabel) examLabel.textContent = "回答時間 · SPEAKING TIME";
    }
    if (state.mediaRecorder.state === "recording" && elapsed >= maxSeconds * 1000) finishRecording();
  }

  function syncRecorderControls() {
    const button = document.querySelector("[data-record-toggle]");
    const finish = document.querySelector("[data-finish-recording]");
    if (!button) return;
    const recorderState = state.mediaRecorder?.state || "inactive";
    const examRecording = Boolean(currentRecordingContext()?.isExam);
    const busy = Boolean(state.recordingTransition || state.recordingPermissionPending || state.recordingProcessing);
    button.disabled = busy;
    button.classList.toggle("is-recording", recorderState === "recording");
    button.classList.toggle("is-paused", recorderState === "paused");
    if (state.recordingPermissionPending) button.textContent = "正在連接咪高峰…";
    else if (state.recordingProcessing) button.textContent = "正在製作 MP3…";
    else if (state.recordingTransition === "pausing") button.textContent = "正在暫停…";
    else if (state.recordingTransition === "resuming") button.textContent = "正在繼續…";
    else if (state.recordingTransition === "stopping") button.textContent = "正在完成…";
    else if (recorderState === "paused" && examRecording) button.textContent = "■ 完成回答";
    else if (recorderState === "paused") button.textContent = "● 繼續錄音";
    else if (recorderState === "recording" && examRecording) button.textContent = "■ 完成回答";
    else if (recorderState === "recording" && state.recordingPauseSupported) button.textContent = "❚❚ 暫停錄音";
    else if (recorderState === "recording") button.textContent = "■ 完成錄音";
    else if (examRecording) button.textContent = state.recordedMp3 ? "● 重新回答" : "● 開始回答";
    else button.textContent = state.recordedMp3 ? "● 重新錄音" : "● 開始錄音";
    if (finish) {
      finish.hidden = examRecording || !state.recordingPauseSupported || !["recording", "paused"].includes(recorderState);
      finish.disabled = busy;
    }
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      recordingStatus("這個瀏覽器不支援咪高峰錄音。請使用最新版本 Safari、Chrome、Firefox 或 Edge。");
      return;
    }
    if (!window.isSecureContext && location.hostname !== "localhost") {
      recordingStatus("咪高峰只可在 HTTPS 安全網頁上使用。");
      return;
    }
    stopModelAudio();
    finishExamSpeechNow();
    discardRecording(false);
    const requestedContext = currentRecordingContext();
    if (!requestedContext) {
      recordingStatus("未能辨認目前的錄音題目，請重新載入後再試。");
      return;
    }
    const requestGeneration = ++state.recordingGeneration;
    state.recordingPermissionPending = true;
    state.recordingProcessing = false;
    const authGeneration = state.authGeneration;
    const requestedContextKey = requestedContext.key;
    state.recordingContextKey = requestedContextKey;
    syncRecorderControls();
    recordingStatus("正在請求咪高峰權限…");
    let stream;
    try {
      stream = await requestMicrophoneStream();
    } catch (error) {
      if (requestGeneration !== state.recordingGeneration) return;
      state.recordingPermissionPending = false;
      console.warn("Microphone permission failed:", error);
      recordingStatus(microphoneErrorMessage(error));
      clearRecordingTimer();
      stopMediaTracks();
      state.mediaRecorder = null;
      state.recordingActiveStartedAt = 0;
      state.recordingElapsedMs = 0;
      syncRecorderControls();
      return;
    }
    if (
      requestGeneration !== state.recordingGeneration
      || authGeneration !== state.authGeneration
      || !state.user
      || currentRecordingContext()?.key !== requestedContextKey
    ) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    state.recordingPermissionPending = false;
    state.mediaStream = stream;
    try {
      const recorder = createMediaRecorder(stream);
      state.mediaRecorder = recorder;
      state.recordingChunks = [];
      state.recordingElapsedMs = 0;
      state.recordingActiveStartedAt = 0;
      state.recordingTransition = "";
      state.recordingPauseSupported = typeof recorder.pause === "function" && typeof recorder.resume === "function";
      state.recordingBackgroundPaused = false;
      const generation = requestGeneration;
      recorder.ondataavailable = event => {
        if (event.data?.size) state.recordingChunks.push(event.data);
      };
      recorder.onerror = event => {
        if (generation !== state.recordingGeneration) return;
        console.warn("MediaRecorder error:", event.error || event);
        state.recordingGeneration += 1;
        clearRecordingTimer();
        recorder.ondataavailable = null;
        recorder.onstop = null;
        try {
          if (recorder.state !== "inactive") recorder.stop();
        } catch {
          // The recorder has already stopped after reporting the error.
        }
        recordingStatus("錄音時發生錯誤，請重新嘗試。");
        stopMediaTracks();
        state.mediaRecorder = null;
        state.recordingChunks = [];
        state.recordingActiveStartedAt = 0;
        state.recordingElapsedMs = 0;
        state.recordingTransition = "";
        state.recordedDurationMs = 0;
        state.recordingProcessing = false;
        resetRecordButton();
      };
      recorder.onpause = () => {
        if (generation !== state.recordingGeneration || state.mediaRecorder !== recorder) return;
        commitActiveRecordingDuration();
        state.recordingTransition = "";
        clearRecordingTimer();
        state.mediaStream?.getAudioTracks().forEach(track => { track.enabled = false; });
        recordingStatus("錄音已暫停；現在可播放示範或按文字重聽，準備好後按「繼續錄音」。", "paused");
        updateRecordingClock();
        syncRecorderControls();
      };
      recorder.onresume = () => {
        if (generation !== state.recordingGeneration || state.mediaRecorder !== recorder) return;
        state.recordingActiveStartedAt = recordingNow();
        state.recordingTransition = "";
        state.recordingBackgroundPaused = false;
        recordingStatus("錄音已繼續，完成後請按「完成並製作 MP3」。", "recording");
        scheduleRecordingTimers();
        syncRecorderControls();
      };
      recorder.onstop = () => finaliseRecording(generation, recorder.mimeType || "audio/webm");
      recorder.start(1000);
      state.recordingActiveStartedAt = recordingNow();
      recordingStatus(state.recordingPauseSupported
        ? (requestedContext.isExam ? "錄音已開始；完成回答後請按「完成回答」。" : "錄音已開始；需要重聽示範時可先暫停，完成後按「完成並製作 MP3」。")
        : "錄音已開始；此瀏覽器不支援中途暫停，完成後請按停止。", true);
      scheduleRecordingTimers();
      syncRecorderControls();
    } catch (error) {
      if (requestGeneration !== state.recordingGeneration) return;
      console.warn("MediaRecorder startup failed:", error);
      recordingStatus("咪高峰已連接，但瀏覽器未能開始錄音。請更新瀏覽器或改用另一個瀏覽器後再試。");
      clearRecordingTimer();
      stopMediaTracks();
      state.mediaRecorder = null;
      state.recordingChunks = [];
      state.recordingActiveStartedAt = 0;
      state.recordingElapsedMs = 0;
      state.recordingTransition = "";
      syncRecorderControls();
    }
  }

  function pauseRecording(options = {}) {
    const recorder = state.mediaRecorder;
    if (!recorder || recorder.state !== "recording" || state.recordingTransition) return;
    if (!state.recordingPauseSupported) {
      finishRecording();
      return;
    }
    state.recordingTransition = "pausing";
    state.recordingBackgroundPaused = Boolean(options.background);
    syncRecorderControls();
    try {
      recorder.pause();
    } catch (error) {
      state.recordingTransition = "";
      state.recordingBackgroundPaused = false;
      syncRecorderControls();
      toast("瀏覽器未能暫停錄音，請按完成後重新嘗試。", "error");
    }
  }

  function resumeRecording() {
    const recorder = state.mediaRecorder;
    if (!recorder || recorder.state !== "paused" || state.recordingTransition) return;
    stopModelAudio();
    state.recordingTransition = "resuming";
    state.mediaStream?.getAudioTracks().forEach(track => { track.enabled = true; });
    syncRecorderControls();
    try {
      recorder.resume();
    } catch (error) {
      state.recordingTransition = "";
      state.mediaStream?.getAudioTracks().forEach(track => { track.enabled = false; });
      syncRecorderControls();
      toast("瀏覽器未能繼續錄音，請先完成並保留現有內容。", "error");
    }
  }

  function finishRecording() {
    if (!state.mediaRecorder || !["recording", "paused"].includes(state.mediaRecorder.state) || state.recordingTransition) return;
    if (state.mediaRecorder.state === "recording") commitActiveRecordingDuration();
    state.recordedDurationMs = Math.min(state.recordingElapsedMs, activeRecordingLimitSeconds() * 1000);
    state.recordingProcessing = true;
    state.recordingTransition = "stopping";
    clearRecordingTimer();
    stopModelAudio();
    state.mediaRecorder.stop();
    stopMediaTracks();
    syncRecorderControls();
    recordingStatus("錄音完成，正在轉換成真正的單聲道 MP3…");
  }

  function sampleToInt16(value) {
    const sample = Math.max(-1, Math.min(1, value));
    return sample < 0 ? sample * 32768 : sample * 32767;
  }

  async function decodeAudioBlob(blob) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error("AudioContext is unavailable.");
    const context = new AudioContextClass();
    try {
      const bytes = await blob.arrayBuffer();
      return await new Promise((resolve, reject) => {
        context.decodeAudioData(bytes, resolve, reject);
      });
    } finally {
      context.close().catch(() => {});
    }
  }

  async function encodeGenuineMonoMp3(sourceBlob, maxDurationMs) {
    if (!window.lamejs?.Mp3Encoder) throw new Error("MP3 encoder did not load.");
    const audioBuffer = await decodeAudioBlob(sourceBlob);
    const sampleRate = audioBuffer.sampleRate;
    const durationLimitMs = Math.max(1, Number(maxDurationMs || 300000));
    const sampleLimit = Math.min(audioBuffer.length, Math.floor(sampleRate * durationLimitMs / 1000));
    const channels = Array.from({ length: audioBuffer.numberOfChannels }, (_, channel) => audioBuffer.getChannelData(channel));
    const encoder = new window.lamejs.Mp3Encoder(1, sampleRate, 64);
    const blocks = [];
    const frameSize = 1152;
    const pcm = new Int16Array(frameSize);
    for (let offset = 0; offset < sampleLimit; offset += frameSize) {
      const blockLength = Math.min(frameSize, sampleLimit - offset);
      for (let index = 0; index < blockLength; index += 1) {
        let sample = 0;
        for (const channel of channels) sample = Math.fround(sample + channel[offset + index] / channels.length);
        pcm[index] = sampleToInt16(sample);
      }
      const encoded = encoder.encodeBuffer(blockLength === frameSize ? pcm : pcm.subarray(0, blockLength));
      if (encoded.length) blocks.push(new Uint8Array(encoded));
      if (offset && offset % (frameSize * 200) === 0) await new Promise(resolve => window.setTimeout(resolve, 0));
    }
    const flushed = encoder.flush();
    if (flushed.length) blocks.push(new Uint8Array(flushed));
    const mp3 = new Blob(blocks, { type: "audio/mpeg" });
    if (!mp3.size) throw new Error("The MP3 encoder produced an empty file.");
    return {
      mp3,
      durationMs: Math.max(1, Math.min(durationLimitMs, Math.round(sampleLimit / sampleRate * 1000)))
    };
  }

  async function finaliseRecording(generation, sourceMime) {
    if (generation !== state.recordingGeneration) return;
    const durationLimitMs = activeRecordingLimitSeconds() * 1000;
    const source = new Blob(state.recordingChunks, { type: sourceMime });
    state.recordingChunks = [];
    state.mediaRecorder = null;
    state.recordingActiveStartedAt = 0;
    state.recordingTransition = "";
    if (!source.size) {
      state.recordingProcessing = false;
      recordingStatus("未有錄到聲音，請重新嘗試。");
      resetRecordButton();
      return;
    }
    state.recordingProcessing = true;
    try {
      const encoded = await encodeGenuineMonoMp3(source, durationLimitMs);
      if (generation !== state.recordingGeneration) return;
      const mp3 = encoded.mp3;
      state.recordedDurationMs = encoded.durationMs;
      state.recordedMp3 = mp3;
      state.recordedMp3Url = URL.createObjectURL(mp3);
      state.recordingSaved = false;
      renderRecordingPreview();
      recordingStatus(`MP3 已準備完成（${formatBytes(mp3.size)}，${formatDuration(state.recordedDurationMs)}）。`, false);
      if (currentRecordingContext()?.isExam) await saveRecording({ automatic: true });
    } catch (error) {
      if (generation !== state.recordingGeneration) return;
      console.warn("MP3 conversion failed:", error);
      recordingStatus("未能轉換成 MP3。錄音不會以其他格式冒充 MP3，請更新瀏覽器後再試。");
      toast("MP3 轉換失敗；原始 WebM／MP4 不會被錯誤改名上載。", "error");
    } finally {
      if (generation === state.recordingGeneration) {
        state.recordingProcessing = false;
        resetRecordButton();
      }
    }
  }

  function resetRecordButton(label = "● 重新錄音") {
    const button = document.querySelector("[data-record-toggle]");
    if (!button) return;
    const context = currentRecordingContext();
    state.recordingTransition = "";
    state.recordingPermissionPending = false;
    button.disabled = Boolean(context?.isExam && context.item?.saved);
    button.hidden = Boolean(context?.isExam && context.item?.saved);
    button.classList.remove("is-recording", "is-paused");
    button.textContent = context?.isExam ? "● 重新回答" : label;
    const finish = document.querySelector("[data-finish-recording]");
    if (finish) finish.hidden = true;
  }

  function renderRecordingPreview() {
    const preview = document.querySelector("[data-recording-preview]");
    if (!preview || !state.recordedMp3Url) return;
    const context = currentRecordingContext();
    preview.hidden = false;
    preview.innerHTML = context?.isExam ? `
      <audio controls preload="metadata" src="${escapeHtml(state.recordedMp3Url)}">你的瀏覽器不支援音訊預覽。</audio>
      <div class="recorder-actions">
        <button class="primary-button" type="button" data-save-recording disabled>正在儲存本題…</button>
        <button class="secondary-button" type="button" data-download-current>下載這次 MP3</button>
      </div>
      <p class="save-note">本題儲存完成後才可前往下一題，避免遺失考試錄音。</p>
    ` : `
      <audio controls preload="metadata" src="${escapeHtml(state.recordedMp3Url)}">你的瀏覽器不支援音訊預覽。</audio>
      <div class="recorder-actions">
        <button class="primary-button" type="button" data-save-recording>save the attempt</button>
        <button class="secondary-button" type="button" data-download-current>下載這次 MP3</button>
        <button class="danger-button" type="button" data-discard-recording>捨棄並重錄</button>
      </div>
      <p class="save-note">儲存後可從頁首的「我的錄音」隨時播放、下載、刪除或匯出全部 MP3 ZIP。</p>
    `;
  }

  function discardRecording(showMessage = true) {
    if (state.recordedMp3Url) URL.revokeObjectURL(state.recordedMp3Url);
    state.recordedMp3 = null;
    state.recordedMp3Url = "";
    state.recordedDurationMs = 0;
    state.recordingSaved = false;
    const preview = document.querySelector("[data-recording-preview]");
    if (preview) {
      preview.hidden = true;
      preview.innerHTML = "";
    }
    if (showMessage) recordingStatus("錄音已捨棄，可以重新錄音。");
  }

  function cancelRecorder() {
    const hadPendingPermission = state.recordingPermissionPending;
    state.recordingGeneration += 1;
    state.recordingPermissionPending = false;
    state.recordingProcessing = false;
    state.recordingTransition = "";
    clearRecordingTimer();
    if (state.mediaRecorder && ["recording", "paused"].includes(state.mediaRecorder.state)) {
      state.mediaRecorder.ondataavailable = null;
      state.mediaRecorder.onstop = null;
      try { state.mediaRecorder.stop(); } catch { /* Recorder already stopped. */ }
    }
    state.mediaRecorder = null;
    state.recordingChunks = [];
    state.recordingActiveStartedAt = 0;
    state.recordingElapsedMs = 0;
    state.recordingPauseSupported = false;
    state.recordingBackgroundPaused = false;
    state.recordingContextKey = "";
    stopMediaTracks();
    discardRecording(false);
    if (document.querySelector("[data-record-toggle]")) {
      resetRecordButton(hadPendingPermission ? "● 開始錄音" : "● 重新錄音");
      if (hadPendingPermission) recordingStatus("咪高峰請求已取消，可以重新錄音。");
    }
  }

  function formatBytes(value) {
    const bytes = Math.max(0, Number(value || 0));
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function markExamItemSaved(context, recording = null) {
    if (!context?.isExam || currentRecordingContext()?.key !== context.key) return false;
    context.item.saved = true;
    context.item.uploadAttempted = false;
    context.item.recordingId = String(recording?.id || "");
    state.recordingSaved = true;
    renderExamProceedAction();
    return true;
  }

  async function findExistingExamRecording(exerciseId) {
    const result = await listAttempts();
    return result.attempts.find(attempt => attempt.exerciseId === exerciseId) || null;
  }

  async function saveRecording(options = {}) {
    if (!state.recordedMp3 || !state.user) return false;
    const context = currentRecordingContext();
    if (!context) return false;
    if (context.isExam && state.examSaving) return false;
    const contextKey = context.key;
    let autoAdvancePart2 = false;
    const button = document.querySelector("[data-save-recording]");
    if (button) button.disabled = true;
    if (context.isExam) state.examSaving = true;
    recordingStatus("正在安全上載 MP3…");
    try {
      if (context.isExam && context.item.uploadAttempted) {
        recordingStatus("正在確認本題是否已經儲存…");
        const existing = await findExistingExamRecording(context.id);
        if (currentRecordingContext()?.key !== contextKey) return false;
        if (existing) {
          markExamItemSaved(context, existing);
          autoAdvancePart2 = Boolean(context.item.part === 2 && context.item.kind !== "intro" && state.examSession?.naturalExchange);
          recordingStatus("已確認本題早前已成功儲存。", false);
          if (button) {
            button.textContent = "✓ 本題已儲存";
            button.disabled = true;
          }
          toast("本題錄音已在錄音庫中確認。", "info");
          return true;
        }
      }
      const now = new Date();
      const filename = context.isExam
        ? `${safeFilePart(state.user.name, "student")}-exam-${context.modeId}-${context.intro ? "name-introduction" : `part-${context.part}-question-${pad(context.globalOrder)}`}-${now.toISOString().replace(/[:.]/g, "-")}.mp3`
        : `${safeFilePart(state.user.name, "student")}-book-${context.book}-exercise-${pad(context.index)}-${now.toISOString().replace(/[:.]/g, "-")}.mp3`;
      const metadata = {
        exerciseId: context.id,
        exerciseIndex: context.index,
        exerciseTitle: context.title,
        exam: "IELTS",
        part: context.part,
        book: context.book,
        durationMs: state.recordedDurationMs,
        mimeType: "audio/mpeg"
      };
      const form = new FormData();
      form.append("file", state.recordedMp3, filename);
      Object.entries(metadata).forEach(([key, value]) => form.append(key, String(value)));
      form.append("metadata", JSON.stringify(metadata));
      const maxUploadBytes = Math.max(512, Number(CONFIG.maxUploadBytes || 3 * 1024 * 1024));
      if (state.recordedMp3.size > maxUploadBytes) {
        throw new Error(`錄音超過 ${formatBytes(maxUploadBytes)} 上載上限。答案請控制在 ${formatDuration(activeRecordingLimitSeconds() * 1000)} 內，再重新錄音。`);
      }
      const endpoint = CONFIG.endpoints?.recordings || "/v1/recordings";
      if (context.isExam) context.item.uploadAttempted = true;
      const response = await apiJson(endpoint, { method: "POST", body: form });
      if (!state.user || currentRecordingContext()?.key !== contextKey) return false;
      state.recordingSaved = true;
      if (context.isExam) markExamItemSaved(context, response?.recording);
      autoAdvancePart2 = Boolean(context.isExam && context.item.part === 2 && context.item.kind !== "intro" && state.examSession?.naturalExchange);
      recordingStatus(context.isExam ? "本題已儲存，可以前往下一題。" : "已儲存！可在「我的錄音」隨時取回。", false);
      if (button) {
        button.textContent = context.isExam ? "✓ 本題已儲存" : "✓ 已儲存";
        button.disabled = true;
      }
      toast(context.isExam ? "本題已加入考試練習錄音。" : "錄音已安全儲存。", "info");
      return true;
    } catch (error) {
      console.warn("Recording upload failed:", error);
      const unavailable = error?.code === "RECORDING_SERVICE_UNREACHABLE"
        || /(?:load failed|failed to fetch|networkerror|error code:\s*1042)/i.test(String(error?.message || ""));
      const message = error?.code === "RECORDING_UPLOAD_IN_PROGRESS"
        ? "本題前一次上載仍在處理中，請稍後按「重新檢查並儲存本題」。若 10 分鐘後仍未完成，請聯絡管理員整理錄音狀態。"
        : unavailable
        ? "未能連接錄音儲存服務。這次錄音仍保留在此頁；請先按「下載這次 MP3」備份，再稍後重新儲存。"
        : String(error?.message || "錄音上載失敗，請稍後再試。");
      recordingStatus(message);
      toast(message, "error");
      if (button) {
        button.disabled = false;
        if (context.isExam) button.textContent = "重新檢查並儲存本題";
      }
      return false;
    } finally {
      if (context.isExam) state.examSaving = false;
      if (autoAdvancePart2 && currentRecordingContext()?.key === contextKey) {
        window.setTimeout(() => {
          if (currentRecordingContext()?.key === contextKey && context.item.saved) advanceExamItem();
        }, 350);
      }
    }
  }

  function normaliseAttempt(raw, index) {
    const item = raw || {};
    const exerciseId = String(item.exerciseId || item.exercise_id || item.metadata?.exerciseId || "");
    const part = Number(item.part || item.metadata?.part || 2);
    const parsedExamRecording = typeof EXAM_MODE.parseRecordingExerciseId === "function"
      ? EXAM_MODE.parseRecordingExerciseId(exerciseId)
      : null;
    return {
      id: String(item.id || item.recordingId || item.key || index),
      studentId: String(item.studentId || item.student_id || ""),
      studentName: String(item.studentName || item.student_name || item.ownerName || item.owner_name || state.user?.name || "Student"),
      exerciseId,
      examRecording: parsedExamRecording?.part === part ? parsedExamRecording : null,
      exerciseTitle: String(item.exerciseTitle || item.exercise_title || item.metadata?.exerciseTitle || item.title || "Speaking attempt"),
      exerciseIndex: Number(item.exerciseIndex || item.exercise_index || item.metadata?.exerciseIndex || 0),
      part,
      book: Number(item.book || item.metadata?.book || 1),
      createdAt: String(item.createdAt || item.created_at || item.uploadedAt || item.uploaded_at || ""),
      durationMs: Number(item.durationMs || item.duration_ms || item.metadata?.durationMs || 0),
      size: Number(item.size || item.sizeBytes || item.size_bytes || 0),
      downloadUrl: String(item.downloadUrl || item.download_url || item.fileUrl || item.file_url || item.signedUrl || item.signed_url || ""),
      filename: String(item.filename || item.fileName || item.file_name || item.originalFilename || item.original_filename || "")
    };
  }

  function invalidateAttemptRequests() {
    state.attemptRequestGeneration += 1;
    state.attemptPlaybackGeneration += 1;
    for (const controller of state.attemptAbortControllers) controller.abort();
    state.attemptAbortControllers.clear();
    state.attemptPlaybackController = null;
  }

  function createAttemptController() {
    const controller = new AbortController();
    state.attemptAbortControllers.add(controller);
    return controller;
  }

  function releaseAttemptController(controller) {
    if (!controller) return;
    state.attemptAbortControllers.delete(controller);
    if (state.attemptPlaybackController === controller) state.attemptPlaybackController = null;
  }

  function isAbortError(error) {
    return error?.name === "AbortError" || /abort/i.test(String(error?.message || ""));
  }

  function attemptRequestIsCurrent(generation, authGeneration) {
    return generation === state.attemptRequestGeneration
      && authGeneration === state.authGeneration
      && Boolean(state.user);
  }

  async function listAttempts(options = {}) {
    const endpoint = CONFIG.endpoints?.recordings || "/v1/recordings";
    const scope = state.user?.role === "admin" ? "all" : "mine";
    const pageSize = 200;
    const collected = [];
    let total = null;
    let page = 1;
    while (true) {
      const separator = endpoint.includes("?") ? "&" : "?";
      const payload = await apiJson(
        `${endpoint}${separator}scope=${scope}&page=${page}&pageSize=${pageSize}`,
        { signal: options.signal }
      );
      const rows = Array.isArray(payload)
        ? payload
        : payload?.recordings || payload?.items || payload?.data || [];
      const pageRows = Array.isArray(rows) ? rows : [];
      collected.push(...pageRows);
      const reportedTotal = Number(payload?.total);
      if (Number.isSafeInteger(reportedTotal) && reportedTotal >= 0) total = reportedTotal;
      if (!pageRows.length || pageRows.length < pageSize || (total !== null && collected.length >= total)) break;
      page += 1;
      if (page > 100) throw new Error("錄音數量太多，未能一次載入。請聯絡管理員。");
    }
    const attempts = collected
      .map(normaliseAttempt)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return { attempts, total: total === null ? attempts.length : total };
  }

  function normaliseExamAttempt(raw) {
    const item = raw || {};
    const id = String(item.id || "").toLowerCase();
    const modeId = String(item.modeId || item.mode_id || "");
    if (!id || !examModeDefinition(modeId)) return null;
    const questions = (Array.isArray(item.questions) ? item.questions : item.question_manifest || [])
      .map(question => ({
        globalOrder: Number(question.order || question.globalOrder),
        part: Number(question.part),
        sourceKey: String(question.sourceKey || ""),
        contentKey: String(question.contentKey || ""),
        sourceId: String(question.sourceId || ""),
        sourceBook: Number(question.sourceBook),
        sourceIndex: Number(question.sourceIndex),
        questionNumber: question.questionNumber === null ? null : Number(question.questionNumber),
        title: String(question.promptEn || question.title || ""),
        titleZh: String(question.promptZh || question.titleZh || "")
      }))
      .filter(question => question.globalOrder >= 1 && [1, 2, 3].includes(question.part) && question.sourceId && question.title);
    return {
      id,
      modeId,
      attemptNumber: Number(item.attemptNumber || item.attempt_number || 0),
      naturalExchange: item.naturalExchange === true || item.natural_exchange === true,
      questions,
      nervousness: item.nervousness === null || item.nervousness === undefined ? null : Number(item.nervousness),
      startedAt: String(item.startedAt || item.started_at || ""),
      completedAt: String(item.completedAt || item.completed_at || ""),
      updatedAt: String(item.updatedAt || item.updated_at || "")
    };
  }

  async function listExamAttemptMetadata(options = {}) {
    if (state.user?.role !== "student") return { attempts: [], total: 0 };
    const endpoint = examAttemptsEndpoint();
    const pageSize = 200;
    const collected = [];
    let total = null;
    let page = 1;
    while (true) {
      const separator = endpoint.includes("?") ? "&" : "?";
      const payload = await apiJson(`${endpoint}${separator}page=${page}&pageSize=${pageSize}`, { signal: options.signal });
      const rows = Array.isArray(payload?.attempts) ? payload.attempts : [];
      collected.push(...rows);
      const reportedTotal = Number(payload?.total);
      if (Number.isSafeInteger(reportedTotal) && reportedTotal >= 0) total = reportedTotal;
      if (!rows.length || rows.length < pageSize || (total !== null && collected.length >= total)) break;
      page += 1;
      if (page > 100) throw new Error("考試練習次數太多，未能一次載入。");
    }
    const attempts = collected.map(normaliseExamAttempt).filter(Boolean);
    return { attempts, total: total === null ? attempts.length : total };
  }

  function formatDate(value) {
    if (!value) return "日期未提供";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("zh-HK", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function formatExamAttemptDate(value) {
    if (!value) return "日期未提供";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "日期未提供";
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  }

  function expectedExamRecordingCount(modeId) {
    if (typeof EXAM_MODE.expectedRecordingCount === "function") {
      return EXAM_MODE.expectedRecordingCount(modeId);
    }
    const mode = examModeDefinition(modeId);
    return mode?.parts?.reduce((total, part) => total + (part === 1 ? 12 : part === 2 ? 1 : 6), 0) || 0;
  }

  function renderAttemptCard(attempt) {
    const exam = attempt.examRecording;
    return `
      <article class="attempt-card${exam ? " exam-recording-card" : ""}" data-attempt-card="${escapeHtml(attempt.id)}">
        <div>
          <h3>${escapeHtml(attempt.exerciseTitle)}</h3>
          <div class="attempt-meta">
            ${state.user?.role === "admin" ? `<strong>${escapeHtml(attempt.studentName)}</strong>` : ""}
            <span>${exam ? exam.intro ? "考試開場 · 姓名回答" : `IELTS Part ${attempt.part} · Book ${attempt.book} · 第 ${exam.globalOrder} 段` : `IELTS Part ${attempt.part} · Book ${attempt.book}${attempt.exerciseIndex ? ` · Exercise ${attempt.exerciseIndex}` : ""}`}</span>
            <span>${escapeHtml(formatDate(attempt.createdAt))}</span>
            ${attempt.durationMs ? `<span>${escapeHtml(formatDuration(attempt.durationMs))}</span>` : ""}
            ${attempt.size ? `<span>${escapeHtml(formatBytes(attempt.size))}</span>` : ""}
          </div>
        </div>
        <div class="attempt-actions">
          <button class="attempt-action" type="button" data-attempt-play="${escapeHtml(attempt.id)}">播放</button>
          <button class="attempt-action" type="button" data-attempt-download="${escapeHtml(attempt.id)}">下載 MP3</button>
          <button class="attempt-action danger" type="button" data-attempt-delete="${escapeHtml(attempt.id)}">刪除</button>
        </div>
        <div data-attempt-audio-slot></div>
      </article>`;
  }

  function examAttemptGroups(attempts) {
    const groups = new Map();
    if (state.user?.role === "student") {
      state.examAttempts.forEach(examAttempt => {
        const key = `mine:${examAttempt.modeId}:${examAttempt.id}`;
        groups.set(key, {
          key,
          modeId: examAttempt.modeId,
          owner: "mine",
          examAttempt,
          attempts: []
        });
      });
    }
    attempts.forEach(attempt => {
      const exam = attempt.examRecording;
      if (!exam) return;
      const owner = state.user?.role === "admin" ? (attempt.studentId || attempt.studentName) : "mine";
      const key = `${owner}:${exam.modeId}:${exam.attemptId}`;
      if (!groups.has(key)) groups.set(key, { key, modeId: exam.modeId, owner, attempts: [] });
      groups.get(key).attempts.push(attempt);
    });
    return [...groups.values()].map(group => {
      group.attempts.sort((left, right) => (
        Number(left.examRecording?.globalOrder || 0) - Number(right.examRecording?.globalOrder || 0)
        || new Date(left.createdAt || 0) - new Date(right.createdAt || 0)
      ));
      const firstRecordingAt = group.attempts.reduce((earliest, attempt) => {
        const time = Date.parse(attempt.createdAt || "");
        return !Number.isFinite(time) ? earliest : Math.min(earliest, time);
      }, Number.POSITIVE_INFINITY);
      const metadataStartedAt = Date.parse(group.examAttempt?.startedAt || "");
      group.startedAt = Number.isFinite(metadataStartedAt) ? metadataStartedAt : firstRecordingAt;
      const hasIntro = group.examAttempt?.naturalExchange === true || group.attempts.some(attempt => attempt.examRecording?.intro === true);
      group.expected = typeof EXAM_MODE.expectedStoredRecordingCount === "function"
        ? EXAM_MODE.expectedStoredRecordingCount(group.modeId, hasIntro)
        : expectedExamRecordingCount(group.modeId) + (hasIntro ? 1 : 0);
      const actualExpected = expectedExamRecordingCount(group.modeId);
      const slots = new Set(group.attempts
        .map(attempt => attempt.examRecording?.globalOrder)
        .filter(order => Number.isInteger(order) && order >= 1 && order <= actualExpected));
      group.introSaved = group.attempts.some(attempt => attempt.examRecording?.intro === true);
      group.saved = slots.size + (group.introSaved ? 1 : 0);
      group.duplicateCount = Math.max(0, group.attempts.length - group.saved);
      return group;
    }).sort((left, right) => right.startedAt - left.startedAt);
  }

  function renderSavedExamReflection(examAttempt) {
    if (!examAttempt) return "";
    const rating = Number(examAttempt.nervousness || 0);
    return `
      <section class="saved-exam-reflection">
        <div class="saved-exam-rating">
          <span>SELF-EVALUATION · 自我評估</span>
          <strong>${rating ? `緊張程度 ${rating} / 7` : "尚未完成緊張程度自評"}</strong>
        </div>
        ${examAttempt.questions.length ? `
          <details class="saved-exam-questions">
            <summary>查看今次隨機題目及來源</summary>
            <div class="exam-review-question-stack">${examAttempt.questions.map(renderExamReviewQuestion).join("")}</div>
          </details>` : ""}
      </section>`;
  }

  function renderExamRecordingBox(groups) {
    return `
      <section class="recording-library-box exam-recording-library" aria-labelledby="exam-recordings-heading">
        <div class="recording-library-heading">
          <div><span class="cue-label">EXAM PRACTICE RECORDINGS</span><h2 id="exam-recordings-heading">考試練習錄音</h2></div>
          <span>${groups.length} 次考試練習</span>
        </div>
        ${groups.length ? `<div class="exam-attempt-groups">${groups.map(group => {
          const mode = examModeDefinition(group.modeId);
          const dateValue = Number.isFinite(group.startedAt) ? group.startedAt : "";
          const complete = Boolean(group.examAttempt?.completedAt) || (group.expected > 0 && group.saved >= group.expected);
          const first = group.attempts[0];
          const attemptNumber = Number(group.examAttempt?.attemptNumber || 0);
          return `
            <details class="exam-attempt-group">
              <summary>
                <span><strong>${attemptNumber ? `第 ${attemptNumber} 次 · ` : ""}${escapeHtml(formatExamAttemptDate(dateValue))} · ${escapeHtml(mode?.label || "考試練習")}</strong><small>${state.user?.role === "admin" ? `${escapeHtml(first?.studentName || "Student")} · ` : ""}${complete ? "完整" : "進行中"} · ${group.saved}/${group.expected || group.saved} 段${group.examAttempt?.nervousness ? ` · 緊張程度 ${group.examAttempt.nervousness}/7` : ""}${group.duplicateCount ? ` · ${group.duplicateCount} 個重複上載` : ""}</small></span>
                <em>查看錄音</em>
              </summary>
              ${renderSavedExamReflection(group.examAttempt)}
              <div class="exam-attempt-recordings">${group.attempts.length ? group.attempts.map(renderAttemptCard).join("") : '<p class="recording-library-empty">這次練習尚未有已儲存錄音。</p>'}</div>
            </details>`;
        }).join("")}</div>` : `
          <div class="recording-library-empty"><span aria-hidden="true">🎧</span><p>完成考試練習後，整套錄音會按日期及模式顯示在這裡。</p></div>`}
      </section>`;
  }

  function renderRegularRecordingBox(attempts) {
    return `
      <section class="recording-library-box" aria-labelledby="regular-recordings-heading">
        <div class="recording-library-heading">
          <div><span class="cue-label">REGULAR PRACTICE RECORDINGS</span><h2 id="regular-recordings-heading">一般練習錄音</h2></div>
          <span>${attempts.length} 段錄音</span>
        </div>
        ${attempts.length ? `<div class="regular-attempt-list">${attempts.map(renderAttemptCard).join("")}</div>` : `
          <div class="recording-library-empty"><span aria-hidden="true">🎙</span><p>Part 1、2 或 3 的一般練習錄音會顯示在這裡。</p></div>`}
      </section>`;
  }

  function renderAttemptList() {
    const container = document.querySelector("[data-attempt-list]");
    const summary = document.querySelector("[data-attempts-summary]");
    if (!container) return;
    if (summary) summary.textContent = `共 ${state.attemptTotal || state.attempts.length} 次錄音`;
    const groups = examAttemptGroups(state.attempts);
    const regular = state.attempts.filter(attempt => !attempt.examRecording);
    container.innerHTML = `${renderExamRecordingBox(groups)}${renderRegularRecordingBox(regular)}`;
  }

  async function renderAttemptsPage() {
    invalidateAttemptRequests();
    state.attempts = [];
    state.attemptTotal = 0;
    state.attemptsById.clear();
    state.examAttempts = [];
    state.examAttemptsById.clear();
    const requestGeneration = state.attemptRequestGeneration;
    const authGeneration = state.authGeneration;
    const controller = createAttemptController();
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader(state.user?.role === "admin" ? "所有錄音嘗試" : "我的錄音", state.user?.role === "admin" ? "管理、播放、逐一下載或刪除所有學生的 Speaking 錄音。" : "你的錄音會安全同步至帳戶，可隨時播放、下載、匯出或刪除。", state.user?.role === "admin" ? "ADMIN · ALL STUDENTS" : "你的私人錄音庫")}
        <div class="attempts-toolbar">
          <span class="attempts-summary" data-attempts-summary>正在讀取錄音…</span>
          ${state.user?.role === "admin" ? "" : '<button class="primary-button" type="button" data-export-zip>匯出全部 MP3（ZIP）</button>'}
        </div>
        <div class="attempt-list" data-attempt-list>
          ${dom.loadingTemplate?.innerHTML || '<div class="loading-state">載入中…</div>'}
        </div>
      </section>
    `;
    try {
      const [recordingResult, examMetadataResult] = await Promise.allSettled([
        listAttempts({ signal: controller.signal }),
        listExamAttemptMetadata({ signal: controller.signal })
      ]);
      if (recordingResult.status === "rejected") throw recordingResult.reason;
      if (!attemptRequestIsCurrent(requestGeneration, authGeneration) || state.route.view !== "attempts") return;
      const result = recordingResult.value;
      state.attempts = result.attempts;
      state.attemptTotal = result.total;
      state.attemptsById = new Map(state.attempts.map(item => [item.id, item]));
      if (examMetadataResult.status === "fulfilled") {
        state.examAttempts = examMetadataResult.value.attempts;
        state.examAttemptsById = new Map(state.examAttempts.map(item => [item.id, item]));
      } else if (!isAbortError(examMetadataResult.reason)) {
        console.warn("Could not load exam-attempt reflections:", examMetadataResult.reason);
        toast("錄音已載入，但考試題目清單及自評暫時未能同步。", "error");
      }
      renderAttemptList();
      setConnection("錄音庫已同步", "live");
    } catch (error) {
      if (isAbortError(error) || !attemptRequestIsCurrent(requestGeneration, authGeneration)) return;
      console.warn("Could not list recordings:", error);
      const container = document.querySelector("[data-attempt-list]");
      if (container) {
        container.innerHTML = `
          <div class="notice-card">
            <h2>未能載入錄音</h2>
            <p>${escapeHtml(error?.message || "請檢查網絡後再試。")}</p>
            <button class="secondary-button" type="button" data-retry-attempts>重新載入</button>
          </div>
        `;
      }
      setConnection("錄音庫連接失敗", "error");
    } finally {
      releaseAttemptController(controller);
    }
  }

  function recordingFilePath(attempt) {
    const endpoint = String(CONFIG.endpoints?.recordings || "/v1/recordings").replace(/\/+$/, "");
    const suffix = String(CONFIG.endpoints?.recordingFileSuffix || "");
    const normalizedSuffix = suffix ? (suffix.startsWith("/") ? suffix : `/${suffix}`) : "";
    return `${endpoint}/${encodeURIComponent(attempt.id)}${normalizedSuffix}`;
  }

  async function looksLikeMp3(blob) {
    if (!blob?.size) return false;
    const bytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
    const id3 = bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
    const frame = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
    return id3 || frame;
  }

  async function fetchAttemptBlob(attempt, options = {}) {
    if (state.attemptBlobCache.has(attempt.id)) return state.attemptBlobCache.get(attempt.id);
    let response;
    if (attempt.downloadUrl) {
      try {
        const headers = new Headers();
        const target = new URL(
          /^https?:\/\//i.test(attempt.downloadUrl) ? attempt.downloadUrl : workerEndpoint(attempt.downloadUrl)
        );
        const workerOrigin = new URL(workerBaseUrl()).origin;
        if (target.protocol !== "https:") throw new Error("Recording download URL must use HTTPS.");
        if (target.origin === workerOrigin) headers.set("Authorization", `Bearer ${state.authToken}`);
        response = await fetch(target, { credentials: "omit", headers, signal: options.signal });
        if (!response.ok) response = null;
      } catch (error) {
        if (isAbortError(error)) throw error;
        response = null;
      }
    }
    if (!response) response = await apiRaw(recordingFilePath(attempt), { signal: options.signal });
    const rawBlob = await response.blob();
    if (!(await looksLikeMp3(rawBlob))) throw new Error("伺服器回傳的檔案不是有效 MP3，下載已停止。");
    const blob = rawBlob.type === "audio/mpeg" ? rawBlob : new Blob([rawBlob], { type: "audio/mpeg" });
    return blob;
  }

  function attemptFilename(attempt, ordinal = 0) {
    if (attempt.filename && /\.mp3$/i.test(attempt.filename)) return safeFilePart(attempt.filename).replace(/\.mp3$/i, "") + ".mp3";
    const date = attempt.createdAt ? new Date(attempt.createdAt) : new Date();
    const datePart = Number.isNaN(date.getTime()) ? pad(ordinal + 1, 3) : date.toISOString().replace(/[:.]/g, "-");
    return `${safeFilePart(attempt.studentName, "student")}-${safeFilePart(attempt.exerciseTitle, "speaking")}-${datePart}.mp3`;
  }

  function stopAttemptPlayback() {
    state.attemptPlaybackGeneration += 1;
    if (state.attemptPlaybackController) state.attemptPlaybackController.abort();
    state.attemptPlaybackController = null;
    document.querySelectorAll("[data-attempt-audio-slot] audio").forEach(audio => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    });
    document.querySelectorAll("[data-attempt-audio-slot]").forEach(slot => { slot.innerHTML = ""; });
    state.activeAttemptAudioId = "";
  }

  async function playAttempt(id) {
    const attempt = state.attemptsById.get(String(id));
    if (!attempt) return;
    if (state.activeAttemptAudioId === attempt.id) {
      stopAttemptPlayback();
      return;
    }
    stopModelAudio();
    stopAttemptPlayback();
    const requestGeneration = state.attemptRequestGeneration;
    const playbackGeneration = state.attemptPlaybackGeneration;
    const authGeneration = state.authGeneration;
    const controller = createAttemptController();
    state.attemptPlaybackController = controller;
    const card = document.querySelector(`[data-attempt-card="${CSS.escape(attempt.id)}"]`);
    const slot = card?.querySelector("[data-attempt-audio-slot]");
    if (!slot) {
      releaseAttemptController(controller);
      return;
    }
    slot.textContent = "正在載入 MP3…";
    try {
      const blob = await fetchAttemptBlob(attempt, { signal: controller.signal });
      if (
        !attemptRequestIsCurrent(requestGeneration, authGeneration)
        || playbackGeneration !== state.attemptPlaybackGeneration
        || state.route.view !== "attempts"
        || !slot.isConnected
        || !state.attemptsById.has(attempt.id)
      ) return;
      state.attemptBlobCache.set(attempt.id, blob);
      const url = state.attemptObjectUrls.get(attempt.id) || URL.createObjectURL(blob);
      state.attemptObjectUrls.set(attempt.id, url);
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.preload = "metadata";
      audio.src = url;
      audio.textContent = "你的瀏覽器不支援音訊播放。";
      slot.replaceChildren(audio);
      state.activeAttemptAudioId = attempt.id;
      audio.addEventListener("ended", () => { state.activeAttemptAudioId = ""; }, { once: true });
      const result = audio.play();
      if (result?.catch) result.catch(() => {
        if (slot.isConnected) toast("錄音已載入，請按播放器的播放鍵。", "info");
      });
    } catch (error) {
      if (isAbortError(error) || !attemptRequestIsCurrent(requestGeneration, authGeneration)) return;
      if (slot.isConnected) slot.textContent = "";
      toast(String(error?.message || "錄音未能載入。"), "error");
    } finally {
      releaseAttemptController(controller);
    }
  }

  async function downloadAttempt(id) {
    const attempt = state.attemptsById.get(String(id));
    if (!attempt) return;
    const requestGeneration = state.attemptRequestGeneration;
    const authGeneration = state.authGeneration;
    const controller = createAttemptController();
    try {
      const blob = await fetchAttemptBlob(attempt, { signal: controller.signal });
      if (!attemptRequestIsCurrent(requestGeneration, authGeneration)) return;
      downloadBlob(blob, attemptFilename(attempt));
    } catch (error) {
      if (isAbortError(error) || !attemptRequestIsCurrent(requestGeneration, authGeneration)) return;
      toast(String(error?.message || "錄音未能下載。"), "error");
    } finally {
      releaseAttemptController(controller);
    }
  }

  async function deleteAttempt(id) {
    const attempt = state.attemptsById.get(String(id));
    if (!attempt) return;
    if (!window.confirm(`確定永久刪除「${attempt.exerciseTitle}」的錄音嗎？刪除後不能復原。`)) return;
    const requestGeneration = state.attemptRequestGeneration;
    const authGeneration = state.authGeneration;
    const controller = createAttemptController();
    try {
      const endpoint = String(CONFIG.endpoints?.recordings || "/v1/recordings").replace(/\/+$/, "");
      await apiRaw(`${endpoint}/${encodeURIComponent(attempt.id)}`, { method: "DELETE", signal: controller.signal });
      if (!attemptRequestIsCurrent(requestGeneration, authGeneration)) return;
      stopAttemptPlayback();
      state.attempts = state.attempts.filter(item => item.id !== attempt.id);
      state.attemptTotal = Math.max(0, state.attemptTotal - 1);
      state.attemptsById.delete(attempt.id);
      state.attemptBlobCache.delete(attempt.id);
      const objectUrl = state.attemptObjectUrls.get(attempt.id);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      state.attemptObjectUrls.delete(attempt.id);
      renderAttemptList();
      toast("錄音已永久刪除。", "info");
    } catch (error) {
      if (isAbortError(error) || !attemptRequestIsCurrent(requestGeneration, authGeneration)) return;
      toast(String(error?.message || "未能刪除錄音。"), "error");
    } finally {
      releaseAttemptController(controller);
    }
  }

  function exportFilename(response, page, totalPages) {
    const disposition = response.headers.get("Content-Disposition") || "";
    const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    if (encoded) {
      try {
        const decoded = decodeURIComponent(encoded);
        if (/\.zip$/i.test(decoded)) return safeFilePart(decoded, `Speaking-Recordings-Batch-${page}-of-${totalPages}.zip`);
      } catch {
        // Use the deterministic fallback name.
      }
    }
    return `My-Edmund-Speaking-Attempts-Batch-${page}-of-${totalPages}.zip`;
  }

  async function tryServerZip(page = 1, pageSize = 10, options = {}) {
    if (state.user?.role === "admin") return null;
    const endpoint = CONFIG.endpoints?.recordingsZip;
    if (!endpoint) return null;
    const separator = String(endpoint).includes("?") ? "&" : "?";
    try {
      const response = await apiRaw(
        `${endpoint}${separator}scope=mine&page=${page}&pageSize=${pageSize}`,
        { signal: options.signal }
      );
      const responsePage = Number(response.headers.get("X-Export-Page"));
      const responsePageSize = Number(response.headers.get("X-Export-Page-Size"));
      const totalPages = Number(response.headers.get("X-Export-Total-Pages"));
      const fileCount = Number(response.headers.get("X-Export-File-Count"));
      const totalFiles = Number(response.headers.get("X-Export-Total-Files"));
      const hasMore = response.headers.get("X-Export-Has-More");
      if (
        !Number.isSafeInteger(responsePage)
        || responsePage !== page
        || !Number.isSafeInteger(responsePageSize)
        || responsePageSize < 1
        || responsePageSize > pageSize
        || !Number.isSafeInteger(totalPages)
        || totalPages < page
        || totalPages > 500
        || !Number.isSafeInteger(fileCount)
        || fileCount < 1
        || fileCount > pageSize
        || !Number.isSafeInteger(totalFiles)
        || totalFiles < fileCount
        || !["true", "false"].includes(hasMore)
        || (hasMore === "true") !== (page < totalPages)
      ) {
        throw new Error("錄音服務回傳了無效的 ZIP 批次資料。");
      }
      const blob = await response.blob();
      if (blob.size && /zip|octet-stream/i.test(blob.type || response.headers.get("content-type") || "")) {
        return {
          blob,
          page: responsePage,
          totalPages,
          fileCount,
          totalFiles,
          filename: exportFilename(response, responsePage, totalPages)
        };
      }
      return null;
    } catch (error) {
      if (page === 1 && [404, 405, 501].includes(Number(error?.status))) return null;
      throw error;
    }
  }

  async function exportZip() {
    if (!state.attempts.length) {
      toast("暫時未有錄音可以匯出。", "error");
      return;
    }
    const button = document.querySelector("[data-export-zip]");
    const requestGeneration = state.attemptRequestGeneration;
    const authGeneration = state.authGeneration;
    const controller = createAttemptController();
    if (button) {
      button.disabled = true;
      button.textContent = "正在準備 ZIP…";
    }
    try {
      let serverBatch = await tryServerZip(1, 10, { signal: controller.signal });
      if (serverBatch) {
        const totalPages = serverBatch.totalPages;
        for (let page = 1; page <= totalPages; page += 1) {
          if (!attemptRequestIsCurrent(requestGeneration, authGeneration) || state.route.view !== "attempts") return;
          if (page > 1) serverBatch = await tryServerZip(page, 10, { signal: controller.signal });
          if (!attemptRequestIsCurrent(requestGeneration, authGeneration) || state.route.view !== "attempts") return;
          if (!serverBatch || serverBatch.totalPages !== totalPages) {
            throw new Error("匯出期間錄音批次有所變更，請重新整理後再試。");
          }
          if (button) button.textContent = `下載 ZIP ${page}/${totalPages}…`;
          downloadBlob(serverBatch.blob, serverBatch.filename);
          if (page < totalPages) await new Promise(resolve => window.setTimeout(resolve, 250));
        }
        toast(totalPages === 1 ? "ZIP 已準備完成。" : `${totalPages} 個 ZIP 批次已準備完成。`, "info");
        return;
      }
      if (!window.JSZip) throw new Error("ZIP 工具未能載入，請重新整理頁面後再試。");
      const fallbackMaxFiles = Math.min(100, Math.max(1, Number(CONFIG.clientZipMaxFiles || 40)));
      const fallbackMaxBytes = Math.min(64 * 1024 * 1024, Math.max(1024 * 1024, Number(CONFIG.clientZipMaxBytes || 32 * 1024 * 1024)));
      if (state.attempts.length > fallbackMaxFiles) {
        throw new Error(`瀏覽器後備匯出每次最多 ${fallbackMaxFiles} 個檔案；請稍後再試伺服器 ZIP。`);
      }
      const zip = new window.JSZip();
      let fallbackBytes = 0;
      for (let index = 0; index < state.attempts.length; index += 1) {
        if (!attemptRequestIsCurrent(requestGeneration, authGeneration) || state.route.view !== "attempts") return;
        const attempt = state.attempts[index];
        if (button) button.textContent = `讀取 MP3 ${index + 1}/${state.attempts.length}…`;
        const blob = await fetchAttemptBlob(attempt, { signal: controller.signal });
        fallbackBytes += blob.size;
        if (fallbackBytes > fallbackMaxBytes) {
          throw new Error("瀏覽器後備 ZIP 超過安全記憶體上限；請稍後再試伺服器 ZIP。");
        }
        zip.file(attemptFilename(attempt, index), blob, { binary: true });
      }
      if (button) button.textContent = "正在壓縮 ZIP…";
      const blob = await zip.generateAsync({ type: "blob", compression: "STORE", mimeType: "application/zip" });
      if (!attemptRequestIsCurrent(requestGeneration, authGeneration) || state.route.view !== "attempts") return;
      downloadBlob(blob, state.user?.role === "admin" ? "Edmund-Speaking-All-Recordings.zip" : "My-Edmund-Speaking-Attempts.zip");
      toast("全部 MP3 已匯出為 ZIP。", "info");
    } catch (error) {
      if (isAbortError(error) || !attemptRequestIsCurrent(requestGeneration, authGeneration)) return;
      console.warn("ZIP export failed:", error);
      toast(String(error?.message || "未能匯出 ZIP。"), "error");
    } finally {
      releaseAttemptController(controller);
      if (button?.isConnected) {
        button.disabled = false;
        button.textContent = "匯出全部 MP3（ZIP）";
      }
    }
  }

  function cleanupAttemptAudio() {
    invalidateAttemptRequests();
    stopAttemptPlayback();
    for (const url of state.attemptObjectUrls.values()) URL.revokeObjectURL(url);
    state.attemptObjectUrls.clear();
    state.attemptBlobCache.clear();
  }

  function setupEvents() {
    dom.loginForm?.addEventListener("submit", event => {
      event.preventDefault();
      handleLogin(event.currentTarget);
    });

    document.addEventListener("click", event => {
      const passwordToggle = event.target.closest("[data-toggle-password]");
      if (passwordToggle) {
        const input = dom.loginForm?.elements?.password;
        if (!input) return;
        const opening = input.type === "password";
        input.type = opening ? "text" : "password";
        passwordToggle.textContent = opening ? "Close Eye" : "Open Eye";
        passwordToggle.setAttribute("aria-label", opening ? "隱藏密碼" : "顯示密碼");
        return;
      }

      if (event.target.closest("[data-logout]")) {
        handleLogout();
        return;
      }

      if (event.target.closest("[data-back]")) {
        goBack();
        return;
      }

      const go = event.target.closest("[data-go]");
      if (go?.dataset.go === "attempts") {
        navigate({ view: "attempts" });
        return;
      }
      if (go?.dataset.go === "bookmarks") {
        navigate({ view: "bookmarks" });
        return;
      }
      if (go?.dataset.go === "admin" && state.user?.role === "admin") {
        navigate({ view: "admin" });
        return;
      }

      const bookmarkButton = event.target.closest("[data-bookmark]");
      if (bookmarkButton) {
        toggleBookmark(bookmarkFromElement(bookmarkButton));
        return;
      }

      if (event.target.closest("[data-toggle-route-bookmark]")) {
        toggleBookmark(currentRouteBookmark());
        return;
      }

      const savedBookmark = event.target.closest("[data-open-saved-bookmark]");
      if (savedBookmark) {
        let bookmark = null;
        try { bookmark = JSON.parse(decodeURIComponent(savedBookmark.dataset.openSavedBookmark || "")); } catch { /* Ignore malformed DOM data. */ }
        const route = routeForBookmark(bookmark);
        if (route) navigate(route);
        return;
      }

      const searchExam = event.target.closest("[data-search-exam]");
      if (searchExam) {
        navigate({ view: "parts", exam: searchExam.dataset.searchExam });
        return;
      }

      const searchExercise = event.target.closest("[data-search-exercise]");
      if (searchExercise) {
        navigate({ view: "exercise", exam: "ielts", part: Number(searchExercise.dataset.searchPart || 2), book: Number(searchExercise.dataset.searchBook || 1), exerciseIndex: Number(searchExercise.dataset.searchExercise) });
        return;
      }

      const crumb = event.target.closest("[data-breadcrumb-index]");
      if (crumb) {
        const route = dom.breadcrumbs._routes?.[Number(crumb.dataset.breadcrumbIndex)];
        if (route) directRoute(route);
        return;
      }

      const exam = event.target.closest("[data-exam]");
      if (exam) {
        if (exam.getAttribute("aria-disabled") === "true") {
          toast("你的帳戶尚未開放這個練習範圍。", "error");
        } else if (!examAvailable(exam.dataset.exam)) {
          toast("這個練習範疇正在準備中。", "info");
        } else navigate({ view: "parts", exam: "ielts" });
        return;
      }

      if (event.target.closest("[data-exam-practice-modes], [data-open-exam-modes], [data-new-exam]")) {
        if (!hasAccess(["exam.ielts"])) toast("你的帳戶尚未開放 IELTS 考試練習。", "error");
        else {
          if (event.target.closest("[data-new-exam]")) clearExamSession();
          navigate({ view: "exam-modes", exam: "ielts" });
        }
        return;
      }

      if (event.target.closest("[data-natural-exchange-toggle]")) {
        setNaturalExchange(!state.examNaturalExchange);
        return;
      }

      if (event.target.closest("[data-stop-exam-voice]")) {
        finishExamSpeechNow();
        return;
      }

      const examMode = event.target.closest("[data-exam-mode]");
      if (examMode) {
        if (examMode.getAttribute("aria-disabled") === "true") toast("這個模式目前沒有足夠已開放題目。", "error");
        else startExamPractice(examMode.dataset.examMode);
        return;
      }

      const examRating = event.target.closest("[data-exam-rating]");
      if (examRating && state.examSession?.phase === "rating" && !state.examRatingSaving) {
        selectExamRating(examRating.dataset.examRating);
        return;
      }

      if (event.target.closest("[data-submit-exam-rating]")) {
        submitExamRating();
        return;
      }

      const examSource = event.target.closest("[data-open-exam-source]");
      if (examSource) {
        let route = null;
        try { route = JSON.parse(decodeURIComponent(examSource.dataset.openExamSource || "")); } catch { /* Ignore malformed DOM data. */ }
        if (route && routeAllowed(route)) navigate(route);
        else toast("這條題目的來源目前未開放。", "error");
        return;
      }

      if (event.target.closest("[data-exam-proceed]")) {
        advanceExamItem();
        return;
      }

      const part = event.target.closest("[data-part]:not([data-book])");
      if (part) {
        if (part.getAttribute("aria-disabled") === "true") {
          toast("你的帳戶尚未開放這個 IELTS Part。", "error");
          return;
        }
        navigate({ view: "books", exam: "ielts", part: Number(part.dataset.part) });
        return;
      }

      const book = event.target.closest("[data-book]");
      if (book) {
        const partNumber = Number(book.dataset.part);
        const bookNumber = Number(book.dataset.book);
        if (book.getAttribute("aria-disabled") === "true") {
          toast("你的帳戶尚未開放這本練習冊。", "error");
          return;
        }
        if (!bookAvailable(partNumber, bookNumber)) {
          toast(`Part ${partNumber} · Book ${bookNumber} 的內容正在準備中。`, "info");
          return;
        }
        navigate({ view: "exercises", exam: "ielts", part: partNumber, book: bookNumber });
        return;
      }

      const exercise = event.target.closest("[data-exercise-index]");
      if (exercise && !exercise.disabled) {
        navigate({ view: "exercise", exam: "ielts", part: Number(state.route.part || 2), book: Number(state.route.book || 1), exerciseIndex: Number(exercise.dataset.exerciseIndex) });
        return;
      }

      const part3ModelToggle = event.target.closest("[data-part3-model-toggle]");
      if (part3ModelToggle) {
        togglePart3Model(Number(part3ModelToggle.dataset.part3ModelToggle));
        return;
      }

      const part3ModelPlay = event.target.closest("[data-part3-model-play]");
      if (part3ModelPlay) {
        playPart3Model(Number(part3ModelPlay.dataset.part3ModelPlay));
        return;
      }

      if (event.target.closest("[data-part3-book]")) {
        navigate({ view: "exercises", exam: "ielts", part: 3, book: Number(state.route.book || 1) });
        return;
      }

      if (event.target.closest("[data-part3-previous], [data-part3-next]")) {
        const direction = event.target.closest("[data-part3-previous]") ? -1 : 1;
        const exercises = speakingExercises();
        const currentIndex = exercises.findIndex(item => item.id === currentExercise()?.id);
        const target = exercises[currentIndex + direction];
        if (target) navigate({ view: "exercise", exam: "ielts", part: 3, book: Number(state.route.book || 1), exerciseIndex: target.index });
        return;
      }

      if (event.target.closest("[data-part1-disable-animation]")) {
        togglePart1Animation();
        return;
      }

      const part1QuestionLink = event.target.closest("[data-part1-question-link]");
      if (part1QuestionLink) {
        event.preventDefault();
        const turnIndex = Number(part1QuestionLink.dataset.part1QuestionLink);
        revealPart1Through(turnIndex);
        const href = part1QuestionLink.getAttribute("href");
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "auto", block: "start" });
          target.focus({ preventScroll: true });
          window.history.replaceState(window.history.state, "", href);
        }
        return;
      }

      const part1TurnPlay = event.target.closest("[data-part1-turn-play]");
      if (part1TurnPlay) {
        playPart1Turn(Number(part1TurnPlay.dataset.part1TurnPlay));
        return;
      }

      if (event.target.closest("[data-model-audio-toggle]")) {
        toggleModelAudio();
        return;
      }

      const rate = event.target.closest("[data-audio-rate]");
      if (rate) {
        setRate(rate.dataset.audioRate);
        return;
      }

      if (event.target.closest("[data-highlight-toggle]")) {
        setHighlight(!state.highlightEnabled);
        return;
      }

      const timedWord = event.target.closest("[data-timing-index]");
      if (timedWord) {
        playFromTiming(timedWord.dataset.timingIndex);
        return;
      }

      if (event.target.closest("[data-record-toggle]")) {
        const examRecording = Boolean(currentRecordingContext()?.isExam);
        if (examRecording && ["recording", "paused"].includes(state.mediaRecorder?.state)) finishRecording();
        else if (state.mediaRecorder?.state === "recording") pauseRecording();
        else if (state.mediaRecorder?.state === "paused") resumeRecording();
        else startRecording();
        return;
      }

      if (event.target.closest("[data-finish-recording]")) {
        finishRecording();
        return;
      }

      if (event.target.closest("[data-discard-recording]")) {
        discardRecording();
        resetRecordButton();
        return;
      }

      if (event.target.closest("[data-download-current]")) {
        if (state.recordedMp3) {
          const context = currentRecordingContext();
          downloadBlob(state.recordedMp3, `${safeFilePart(state.user?.name, "student")}-${safeFilePart(context?.title, "speaking-attempt")}.mp3`);
        }
        return;
      }

      if (event.target.closest("[data-save-recording]")) {
        saveRecording();
        return;
      }

      const attemptPlay = event.target.closest("[data-attempt-play]");
      if (attemptPlay) {
        playAttempt(attemptPlay.dataset.attemptPlay);
        return;
      }

      const attemptDownload = event.target.closest("[data-attempt-download]");
      if (attemptDownload) {
        downloadAttempt(attemptDownload.dataset.attemptDownload);
        return;
      }

      const attemptDelete = event.target.closest("[data-attempt-delete]");
      if (attemptDelete) {
        deleteAttempt(attemptDelete.dataset.attemptDelete);
        return;
      }

      if (event.target.closest("[data-export-zip]")) {
        exportZip();
        return;
      }

      if (event.target.closest("[data-retry-attempts]")) {
        renderAttemptsPage();
        return;
      }

      if (event.target.closest("[data-retry-bookmarks]")) {
        state.bookmarksLoaded = false;
        renderBookmarks();
        return;
      }

      if (event.target.closest("[data-retry-admin-students]")) {
        state.adminStudentsLoaded = false;
        state.adminStudentsLoading = false;
        renderAdminPanel();
        return;
      }

      const adminStudent = event.target.closest("[data-admin-student-id]");
      if (adminStudent) {
        state.selectedAdminStudentId = adminStudent.dataset.adminStudentId;
        renderAdminPanel();
        return;
      }

      const setAllAccess = event.target.closest("[data-admin-set-all]");
      if (setAllAccess) {
        const student = state.adminStudents.find(row => row.id === state.selectedAdminStudentId);
        if (!student) return;
        const enabled = setAllAccess.dataset.adminSetAll === "true";
        const next = enabled ? {} : Object.fromEntries(allAccessKeys().map(key => [key, false]));
        setAdminAccessDraft(student, next);
        document.querySelectorAll("[data-admin-access-key]").forEach(input => { input.checked = enabled; });
        syncAdminDraftControls();
        return;
      }

      if (event.target.closest("[data-admin-save-access]")) {
        saveAdminStudentAccess();
        return;
      }

      if (event.target.closest("[data-admin-discard-access]")) {
        state.adminAccessDrafts.delete(state.selectedAdminStudentId);
        renderAdminPanel();
        return;
      }
    });

    document.addEventListener("submit", event => {
      const searchForm = event.target.closest("[data-speaking-search-form]");
      if (!searchForm) return;
      event.preventDefault();
      document.querySelector("[data-speaking-search-results] button")?.click();
    });

    document.addEventListener("input", event => {
      const speakingSearch = event.target.closest("[data-speaking-search-input]");
      if (speakingSearch) {
        renderSpeakingSearchResults(speakingSearch.value);
        return;
      }
      const adminSearch = event.target.closest("[data-admin-student-search]");
      if (adminSearch) {
        state.adminStudentQuery = adminSearch.value;
        renderAdminPanel();
        const replacement = document.querySelector("[data-admin-student-search]");
        if (replacement) {
          replacement.focus({ preventScroll: true });
          replacement.setSelectionRange(replacement.value.length, replacement.value.length);
        }
      }
    });

    document.addEventListener("change", event => {
      const accessToggle = event.target.closest("[data-admin-access-key]");
      if (!accessToggle) return;
      const student = state.adminStudents.find(row => row.id === state.selectedAdminStudentId);
      if (!student) return;
      const next = { ...effectiveAdminAccess(student) };
      if (accessToggle.checked) delete next[accessToggle.dataset.adminAccessKey];
      else next[accessToggle.dataset.adminAccessKey] = false;
      setAdminAccessDraft(student, next);
      syncAdminDraftControls();
    });

    document.addEventListener("keydown", event => {
      const ratingButton = event.target.closest?.("[data-exam-rating]");
      if (ratingButton && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const current = Number(ratingButton.dataset.examRating || 1);
        const next = event.key === "Home"
          ? 1
          : event.key === "End"
            ? 7
            : Math.min(7, Math.max(1, current + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1)));
        selectExamRating(next, { focus: true });
        return;
      }
      const timedWord = event.target.closest?.("[data-timing-index]");
      if (timedWord && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        const paragraph = timedWord.closest(".response-en, .part3-step-en, .part1-message-en");
        const words = [...(paragraph?.querySelectorAll("[data-timing-index]") || [])];
        const currentIndex = words.indexOf(timedWord);
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const target = words[currentIndex + direction];
        if (target) {
          timedWord.tabIndex = -1;
          target.tabIndex = 0;
          target.focus();
        }
        return;
      }
      if (timedWord && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        playFromTiming(timedWord.dataset.timingIndex);
        return;
      }
      if (event.code !== "Space" || event.repeat || !state.modelAudio) return;
      if (event.target.closest?.("input, textarea, select, button, a, [contenteditable='true'], audio")) return;
      event.preventDefault();
      if (Number(currentExercise()?.part) === 1 && state.modelAudioSegmentIndex >= 0) {
        playPart1Turn(state.modelAudioSegmentIndex);
      } else toggleModelAudio();
    });

    window.addEventListener("beforeunload", event => {
      if (!navigationHasUnsavedRecording() && !state.adminAccessDrafts.size) return;
      event.preventDefault();
      event.returnValue = "";
    });

    window.addEventListener("pagehide", () => {
      stopModelAudio();
      clearExamPhaseTimer();
      cancelExamSpeech();
      cleanupPart1Reveal();
      cancelRecorder();
      cleanupAttemptAudio();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "hidden") return;
      stopModelAudio();
      stopAttemptPlayback();
      if (state.recordingPermissionPending) cancelRecorder();
      else if (state.mediaRecorder?.state === "recording" && currentRecordingContext()?.isExam) finishRecording();
      else if (state.mediaRecorder?.state === "recording") pauseRecording({ background: true });
    });
  }

  async function init() {
    setupEvents();
    const restored = restoreSession();
    if (restored) {
      showLogin();
      setLoginStatus("正在驗證已儲存的登入時段…", true);
      setConnection("驗證登入時段", "connecting");
      try {
        await validateRestoredSession();
        if (!state.user) return;
        if (state.user.role === "student") await loadBookmarks({ quiet: true });
        if (!state.user) return;
        showPortal();
        setConnection(state.user.role === "admin" ? "Admin 已連接" : "Supabase 已連接", "live");
        navigate({ view: state.user.role === "admin" ? "admin" : "exams" }, { reset: true, skipGuard: true });
      } catch (error) {
        if (state.user) resetAuthenticatedState("未能驗證登入時段，請重新登入。");
        console.warn("Speaking session restoration failed:", error);
      }
    } else {
      showLogin();
    }

    try {
      await ensureSupabaseSession();
      if (!state.user) setConnection("Supabase 已準備", "live");
    } catch (error) {
      console.warn("Supabase startup failed:", error);
      if (!state.user) setConnection("Supabase 連接失敗", "error");
    }
  }

  init();
})();
