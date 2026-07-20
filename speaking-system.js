(function initialiseEdmundSpeakingSystem() {
  "use strict";

  const CONFIG = window.EDMUND_SPEAKING_CONFIG || {};
  const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
  const SESSION_KEY = "edmundSpeakingSessionV1";
  const RATE_KEY = "edmundSpeakingAudioRateV1";
  const HIGHLIGHT_KEY = "edmundSpeakingHighlightV1";
  const SEARCH_RESULT_LIMITS = { sections: 8, exercises: 14 };
  const AUDIO_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5];
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
    routeHistory: [],
    selectedRate: restoreRate(),
    highlightEnabled: restoreHighlight(),
    modelAudio: null,
    modelAudioExerciseId: "",
    modelAudioSegmentStart: 0,
    modelAudioSegmentEnd: 0,
    modelAudioSegmentIndex: -1,
    highlightFrame: 0,
    activeWordIndex: -1,
    modelAudioGeneration: 0,
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
    recordingGeneration: 0,
    recordingPermissionPending: false,
    recordingProcessing: false,
    recordedMp3: null,
    recordedMp3Url: "",
    recordedDurationMs: 0,
    recordingSaved: false,
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

  function accessKeysForRoute(route) {
    if (!route || state.user?.role === "admin") return [];
    if (route.view === "bookmarks") return ["bookmarks"];
    if (["exams", "attempts", "admin"].includes(route.view)) return [];
    const exam = String(route.exam || (["parts", "books", "exercises", "exercise"].includes(route.view) ? "ielts" : ""));
    const keys = exam && EXAM_ACCESS_KEYS[exam] ? [EXAM_ACCESS_KEYS[exam]] : [];
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

  function routeAllowed(route) {
    return hasAccess(accessKeysForRoute(route));
  }

  function examAvailable(examId) {
    return examId === "ielts";
  }

  function bookAvailable(part, book) {
    return Boolean(speakingBook(Number(part), Number(book))?.exercises?.length);
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
    try {
      const payload = await response.clone().json();
      message = payload?.error?.message || payload?.error || payload?.message || message;
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
    clearSession();
    state.route = { view: "exams" };
    state.routeHistory = [];
    state.attempts = [];
    state.attemptTotal = 0;
    state.attemptsById.clear();
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
    );
  }

  function confirmRecordingAbandonment() {
    if (!navigationHasUnsavedRecording()) return true;
    return window.confirm("這次錄音尚未儲存。離開後將會捨棄錄音，確定繼續嗎？");
  }

  function navigate(route, options = {}) {
    if (!state.user) return;
    if (!routeAllowed(route)) {
      toast("你的帳戶尚未開放這個練習範圍。", "error");
      return;
    }
    if (!options.skipGuard && !routesEqual(route, state.route) && !confirmRecordingAbandonment()) return;
    stopModelAudio();
    cleanupAttemptAudio();
    if (!routesEqual(route, state.route)) cancelRecorder();

    if (options.reset) {
      state.routeHistory = [];
    } else if (!options.fromBack && state.route?.view && !routesEqual(route, state.route)) {
      state.routeHistory.push({ ...state.route });
    }
    state.route = { ...route };
    renderRoute();
    window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
    document.querySelector("#main-content")?.focus({ preventScroll: true });
  }

  function goBack() {
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
    if (["parts", "books", "exercises", "exercise"].includes(route.view)) {
      crumbs.push({ label: "IELTS", route: { view: "parts", exam: "ielts" } });
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

  function sectionHeader(title, description, chip = "") {
    return `
      <div class="section-heading">
        <div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
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
    return [bookmark.kind, bookmark.exam, bookmark.part || "", bookmark.book || "", bookmark.exerciseId || ""].join("|");
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
    return "Speaking 書簽";
  }

  function bookmarkSubtitle(bookmark) {
    if (bookmark?.kind === "exercise") {
      const exercise = speakingExercises(bookmark.part, bookmark.book).find(item => item.id === bookmark.exerciseId);
      return exercise?.titleZh || `IELTS Part ${bookmark.part} · Book ${bookmark.book}`;
    }
    if (bookmark?.kind === "book") return "練習冊";
    if (bookmark?.kind === "part") return "IELTS Speaking";
    return "練習範疇";
  }

  function routeForBookmark(bookmark) {
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
        return searchMatches(`${exercise.title} ${exercise.titleZh} ${exercise.cueText} ${exercise.themeTitle || ""} ${part3Text} ${part2Text} IELTS Part ${exercise.part} Book ${exercise.book}`, tokens);
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
        ${sectionHeader("選擇練習範疇", "先選擇你想訓練的考試或說話情境。IELTS 說話考試現已開放。", chip)}
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
        ${sectionHeader("IELTS 說話考試", "選擇 Part 1、Part 2 或 Part 3。每個部分均設有 16 本練習冊。")}
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
        </div>
      </section>
    `;
  }

  function renderBooks(part) {
    const validPart = [1, 2, 3].includes(Number(part)) ? Number(part) : 1;
    const availableBooks = speakingBooks().filter(item => Number(item?.part) === validPart);
    const availableExercises = availableBooks.reduce((count, item) => count + Number(item?.exerciseCount || item?.exercises?.length || 0), 0);
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader(`IELTS Speaking · Part ${validPart}`, availableBooks.length ? `選擇練習冊。${availableBooks.length} 本練習冊共有 ${availableExercises} 個完整 Band 9 示範。` : "選擇練習冊。")}
        <div class="book-grid">
          ${Array.from({ length: 16 }, (_, index) => {
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

  function normalizeExercise(raw, fallbackIndex, part = 2, book = 1) {
    const source = raw || {};
    const index = Number(source.index || source.number || fallbackIndex);
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
    return {
      id: String(source.id || source.slug || `ielts-part-${part}-book-${book}-exercise-${pad(index)}`),
      part: Number(part),
      book: Number(book),
      index,
      title: String(source.title || source.topic || source.name || `Exercise ${index}`),
      titleZh: String(source.title_zh || source.titleZh || source.topic_zh || source.cue?.titleZh || source.cue?.title_zh || ""),
      cueText: String(source.cue_raw || source.cueRaw || source.question_raw || source.question || source.cue?.raw || cueObjectText(source.cue, source) || ""),
      responses,
      unavailable: !raw
    };
  }

  function speakingExercises(part = state.route.part, book = state.route.book) {
    const source = rawSpeakingExercises(part, book);
    return source.map((exercise, index) => normalizeExercise(exercise, index + 1, part, book));
  }

  function allSpeakingExercises() {
    return speakingBooks().flatMap(book => speakingExercises(book.part, book.book));
  }

  function currentExercise() {
    const index = Number(state.route.exerciseIndex || 0);
    return speakingExercises().find(item => item.index === index) || speakingExercises()[index - 1] || null;
  }

  function exerciseCardHtml(exercise, part, book) {
    const allowed = routeAllowed({ view: "exercise", exam: "ielts", part, book });
    const bookmark = { kind: "exercise", exam: "ielts", part, book, exerciseId: exercise.id };
    const subtitle = exercise.titleZh
      ? escapeHtml(exercise.titleZh)
      : exercise.unavailable
        ? "資料準備中"
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
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader("書簽", "你收藏的練習範疇、Part、Book 及題目會跟隨帳戶同步。", `${state.bookmarks.length} 個書簽`)}
        ${state.bookmarks.length ? `
          <div class="bookmark-list">
            ${state.bookmarks.map(bookmark => {
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

  function audioManifestCandidates() {
    const manifests = [
      window.EDMUND_SPEAKING_AUDIO || {},
      window.EDMUND_SPEAKING_PART3_AUDIO || {}
    ];
    const candidates = manifests.flatMap(manifest => [manifest, manifest.exercises, manifest.entries, manifest.items]);
    return candidates.filter(Boolean);
  }

  function resolveAudioEntry(exercise) {
    if (!exercise) return null;
    const keys = [
      exercise.id,
      `ielts-part2-book${exercise.book}-exercise-${pad(exercise.index)}`,
      `ielts-part${exercise.part}-book${exercise.book}-exercise-${pad(exercise.index)}`,
      `part${exercise.part}-book${exercise.book}-exercise-${pad(exercise.index)}`,
      `exercise-${pad(exercise.index)}`,
      String(exercise.index)
    ];
    for (const candidate of audioManifestCandidates()) {
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
    const voiceLabel = Number(exercise?.part) === 3
      ? "Edmund Deep RP · 原創英式男聲 · 可按空白鍵暫停／繼續"
      : "Edmund Neural · 可按空白鍵暫停／繼續";
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

  function renderRecorderCard(exercise) {
    if (state.user?.role === "admin") {
      return `
        <section class="notice-card admin-recorder-notice">
          <h2>管理員模式</h2>
          <p>學生錄音及儲存功能只供學生帳戶使用。管理員可從頁首的「my recording attempt」管理所有學生錄音。</p>
        </section>
      `;
    }
    return `
      <section class="recorder-card" aria-labelledby="recording-heading">
        <div>
          <h2 id="recording-heading">輪到你練習</h2>
          <p>允許瀏覽器使用咪高峰，完成後會在你的裝置上轉換成真正的單聲道 MP3，再安全儲存。IELTS Part ${Number(exercise?.part || 2)} 每次最多錄音 2 分 30 秒。</p>
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
          <div><span>01</span><p><strong>Choose a route</strong>先比較兩個 Idea，選一條適合自己的論點。</p></div>
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
    if (exercise.part === 3) {
      renderPart3Exercise(exercise, entry);
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

  function updateHighlight() {
    if (!state.highlightEnabled || !state.modelAudio) {
      clearHighlight();
      return;
    }
    const { entry } = currentAudioContext();
    const rows = timingRows(entry);
    const index = timingIndexAtTime(rows, state.modelAudio.currentTime);
    if (index === state.activeWordIndex) return;
    document.querySelector(".timed-word.is-spoken")?.classList.remove("is-spoken");
    state.activeWordIndex = index;
    if (index < 0) return;
    const word = document.querySelector(`[data-timing-index="${index}"]`);
    if (!word) return;
    word.classList.add("is-spoken");
  }

  function startHighlightLoop() {
    if (state.highlightFrame) cancelAnimationFrame(state.highlightFrame);
    if (!state.highlightEnabled) return;
    const tick = () => {
      if (!state.modelAudio || state.modelAudio.paused || state.modelAudio.ended) {
        state.highlightFrame = 0;
        return;
      }
      updateHighlight();
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
    const playing = Boolean(isCurrent && state.modelAudio && !state.modelAudio.paused && !state.modelAudio.ended);
    const resumable = Boolean(isCurrent && state.modelAudio && state.modelAudio.paused && state.modelAudio.currentTime > 0 && !state.modelAudio.ended);
    const button = document.querySelector("[data-model-audio-toggle]");
    if (button) {
      const isPart3 = Number(exercise?.part) === 3;
      const text = playing
        ? isPart3 ? "❚❚ 暫停目前路線" : "❚❚ 暫停示範"
        : resumable
          ? isPart3 ? "▶ 繼續目前路線" : "▶ 繼續示範"
          : isPart3 ? "▶ 播放目前路線" : "▶ 播放示範";
      const label = button.querySelector("[data-audio-button-label]");
      if (label && !button.disabled) label.textContent = text;
      button.classList.toggle("is-playing", playing);
      button.setAttribute("aria-pressed", String(playing));
    }
    document.querySelectorAll("[data-part3-model-play]").forEach(modelButton => {
      const index = Number(modelButton.dataset.part3ModelPlay);
      const active = isCurrent && state.modelAudioSegmentIndex === index;
      const activePlaying = active && playing;
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
    audio.preload = "metadata";
    audio.src = audioUrl(entry);
    audio.defaultPlaybackRate = state.selectedRate;
    audio.playbackRate = state.selectedRate;
    audio.preservesPitch = true;
    audio.onplay = () => {
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
      audio.currentTime = 0;
      syncAudioControls();
    };
    audio.ontimeupdate = () => {
      if (!state.modelAudioSegmentEnd || audio.currentTime < state.modelAudioSegmentEnd) return;
      stopModelAudio();
    };
    audio.onerror = () => {
      toast("示範音訊未能載入，請檢查連線後再試。", "error");
      stopModelAudio();
    };
    const begin = () => {
      if (generation !== state.modelAudioGeneration || state.modelAudio !== audio || !state.user) return;
      try {
        audio.currentTime = Math.max(0, Number(startAt) || 0);
      } catch {
        // A small number of browsers reject a seek before metadata is ready.
      }
      const result = audio.play();
      if (result?.catch) result.catch(error => {
        if (generation !== state.modelAudioGeneration || state.modelAudio !== audio) return;
        console.warn("Speaking sample playback failed:", error);
        toast("瀏覽器未能開始播放，請再按一次播放鍵。", "error");
        syncAudioControls();
      });
    };
    if (audio.readyState >= 1) begin();
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
    if (Number(exercise.part) === 3) {
      const openModel = document.querySelector("[data-part3-model].is-open");
      playPart3Model(Number(openModel?.dataset.part3Model || 0));
      return;
    }
    if (state.modelAudio && state.modelAudioExerciseId === exercise.id) {
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
    const part3Model = Number(exercise.part) === 3
      ? Number(timedElement?.closest("[data-part3-model]")?.dataset.part3Model)
      : -1;
    const part3Range = part3Model >= 0 ? part3ModelAudioRange(exercise, entry, part3Model) : null;
    if (state.modelAudio && state.modelAudioExerciseId === exercise.id) {
      state.modelAudioSegmentStart = part3Range?.start || 0;
      state.modelAudioSegmentEnd = part3Range?.end || 0;
      state.modelAudioSegmentIndex = part3Range ? part3Model : -1;
      state.modelAudio.currentTime = Math.max(0, row.start);
      updateHighlight();
      if (state.modelAudio.paused) {
        const result = state.modelAudio.play();
        if (result?.catch) result.catch(error => console.warn("Word seek playback failed:", error));
      }
      return;
    }
    startModelAudio(
      exercise,
      entry,
      row.start,
      part3Range?.end || 0,
      part3Range ? part3Model : -1
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
    state.recordingTimer = 0;
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
    const maxSeconds = Math.max(30, Number(CONFIG.maxRecordingSeconds || 600));
    const clock = document.querySelector("[data-recording-clock]");
    if (clock) clock.textContent = `${formatDuration(elapsed)} / ${formatDuration(maxSeconds * 1000)}`;
    if (state.mediaRecorder.state === "recording" && elapsed >= maxSeconds * 1000) finishRecording();
  }

  function syncRecorderControls() {
    const button = document.querySelector("[data-record-toggle]");
    const finish = document.querySelector("[data-finish-recording]");
    if (!button) return;
    const recorderState = state.mediaRecorder?.state || "inactive";
    const busy = Boolean(state.recordingTransition || state.recordingPermissionPending || state.recordingProcessing);
    button.disabled = busy;
    button.classList.toggle("is-recording", recorderState === "recording");
    button.classList.toggle("is-paused", recorderState === "paused");
    if (state.recordingPermissionPending) button.textContent = "正在連接咪高峰…";
    else if (state.recordingProcessing) button.textContent = "正在製作 MP3…";
    else if (state.recordingTransition === "pausing") button.textContent = "正在暫停…";
    else if (state.recordingTransition === "resuming") button.textContent = "正在繼續…";
    else if (state.recordingTransition === "stopping") button.textContent = "正在完成…";
    else if (recorderState === "paused") button.textContent = "● 繼續錄音";
    else if (recorderState === "recording" && state.recordingPauseSupported) button.textContent = "❚❚ 暫停錄音";
    else if (recorderState === "recording") button.textContent = "■ 完成錄音";
    else button.textContent = state.recordedMp3 ? "● 重新錄音" : "● 開始錄音";
    if (finish) {
      finish.hidden = !state.recordingPauseSupported || !["recording", "paused"].includes(recorderState);
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
    discardRecording(false);
    const requestGeneration = ++state.recordingGeneration;
    state.recordingPermissionPending = true;
    state.recordingProcessing = false;
    const authGeneration = state.authGeneration;
    const requestedExerciseId = currentExercise()?.id || "";
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
      || state.route.view !== "exercise"
      || currentExercise()?.id !== requestedExerciseId
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
      state.recordingActiveStartedAt = recordingNow();
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
        clearRecordingTimer();
        state.recordingTimer = window.setInterval(updateRecordingClock, 500);
        updateRecordingClock();
        syncRecorderControls();
      };
      recorder.onstop = () => finaliseRecording(generation, recorder.mimeType || "audio/webm");
      recorder.start(1000);
      clearRecordingTimer();
      recordingStatus(state.recordingPauseSupported
        ? "錄音已開始；需要重聽示範時可先暫停，完成後按「完成並製作 MP3」。"
        : "錄音已開始；此瀏覽器不支援中途暫停，完成後請按停止。", true);
      state.recordingTimer = window.setInterval(updateRecordingClock, 500);
      updateRecordingClock();
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
    state.recordedDurationMs = state.recordingElapsedMs;
    state.recordingProcessing = true;
    state.recordingTransition = "stopping";
    clearRecordingTimer();
    stopModelAudio();
    state.mediaRecorder.stop();
    stopMediaTracks();
    syncRecorderControls();
    recordingStatus("錄音完成，正在轉換成真正的單聲道 MP3…");
  }

  function floatToInt16(float32) {
    const output = new Int16Array(float32.length);
    for (let index = 0; index < float32.length; index += 1) {
      const sample = Math.max(-1, Math.min(1, float32[index]));
      output[index] = sample < 0 ? sample * 32768 : sample * 32767;
    }
    return output;
  }

  async function decodeAudioBlob(blob) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error("AudioContext is unavailable.");
    const context = new AudioContextClass();
    try {
      const bytes = await blob.arrayBuffer();
      return await new Promise((resolve, reject) => {
        context.decodeAudioData(bytes.slice(0), resolve, reject);
      });
    } finally {
      context.close().catch(() => {});
    }
  }

  function downmixToMono(audioBuffer) {
    const mono = new Float32Array(audioBuffer.length);
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
      const samples = audioBuffer.getChannelData(channel);
      for (let index = 0; index < samples.length; index += 1) mono[index] += samples[index] / audioBuffer.numberOfChannels;
    }
    return mono;
  }

  async function encodeGenuineMonoMp3(sourceBlob) {
    if (!window.lamejs?.Mp3Encoder) throw new Error("MP3 encoder did not load.");
    const audioBuffer = await decodeAudioBlob(sourceBlob);
    const sampleRate = audioBuffer.sampleRate;
    const pcm = floatToInt16(downmixToMono(audioBuffer));
    const encoder = new window.lamejs.Mp3Encoder(1, sampleRate, 128);
    const blocks = [];
    const frameSize = 1152;
    for (let offset = 0; offset < pcm.length; offset += frameSize) {
      const encoded = encoder.encodeBuffer(pcm.subarray(offset, Math.min(offset + frameSize, pcm.length)));
      if (encoded.length) blocks.push(new Uint8Array(encoded));
      if (offset && offset % (frameSize * 200) === 0) await new Promise(resolve => window.setTimeout(resolve, 0));
    }
    const flushed = encoder.flush();
    if (flushed.length) blocks.push(new Uint8Array(flushed));
    const mp3 = new Blob(blocks, { type: "audio/mpeg" });
    if (!mp3.size) throw new Error("The MP3 encoder produced an empty file.");
    return {
      mp3,
      durationMs: Math.max(1, Math.round(audioBuffer.duration * 1000))
    };
  }

  async function finaliseRecording(generation, sourceMime) {
    if (generation !== state.recordingGeneration) return;
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
      const encoded = await encodeGenuineMonoMp3(source);
      if (generation !== state.recordingGeneration) return;
      const mp3 = encoded.mp3;
      state.recordedDurationMs = encoded.durationMs;
      state.recordedMp3 = mp3;
      state.recordedMp3Url = URL.createObjectURL(mp3);
      state.recordingSaved = false;
      renderRecordingPreview();
      recordingStatus(`MP3 已準備完成（${formatBytes(mp3.size)}，${formatDuration(state.recordedDurationMs)}）。`, false);
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
    state.recordingTransition = "";
    state.recordingPermissionPending = false;
    button.disabled = false;
    button.classList.remove("is-recording", "is-paused");
    button.textContent = label;
    const finish = document.querySelector("[data-finish-recording]");
    if (finish) finish.hidden = true;
  }

  function renderRecordingPreview() {
    const preview = document.querySelector("[data-recording-preview]");
    if (!preview || !state.recordedMp3Url) return;
    preview.hidden = false;
    preview.innerHTML = `
      <audio controls preload="metadata" src="${escapeHtml(state.recordedMp3Url)}">你的瀏覽器不支援音訊預覽。</audio>
      <div class="recorder-actions">
        <button class="primary-button" type="button" data-save-recording>save the attempt</button>
        <button class="secondary-button" type="button" data-download-current>下載這次 MP3</button>
        <button class="danger-button" type="button" data-discard-recording>捨棄並重錄</button>
      </div>
      <p class="save-note">儲存後可從頁首的「my recording attempt」隨時播放、下載、刪除或匯出全部 MP3 ZIP。</p>
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

  async function saveRecording() {
    if (!state.recordedMp3 || !state.user) return;
    const exercise = currentExercise();
    if (!exercise) return;
    const button = document.querySelector("[data-save-recording]");
    if (button) button.disabled = true;
    recordingStatus("正在安全上載 MP3…");
    try {
      const now = new Date();
      const filename = `${safeFilePart(state.user.name, "student")}-book-${exercise.book}-exercise-${pad(exercise.index)}-${now.toISOString().replace(/[:.]/g, "-")}.mp3`;
      const metadata = {
        exerciseId: exercise.id,
        exerciseIndex: exercise.index,
        exerciseTitle: exercise.title,
        exam: "IELTS",
        part: Number(state.route.part || exercise.part || 2),
        book: Number(state.route.book || exercise.book || 1),
        durationMs: state.recordedDurationMs,
        mimeType: "audio/mpeg"
      };
      const form = new FormData();
      form.append("file", state.recordedMp3, filename);
      Object.entries(metadata).forEach(([key, value]) => form.append(key, String(value)));
      form.append("metadata", JSON.stringify(metadata));
      const maxUploadBytes = Math.max(512, Number(CONFIG.maxUploadBytes || 3 * 1024 * 1024));
      if (state.recordedMp3.size > maxUploadBytes) {
        throw new Error(`錄音超過 ${formatBytes(maxUploadBytes)} 上載上限。IELTS 答案請控制在 2 分 30 秒內，再重新錄音。`);
      }
      const endpoint = CONFIG.endpoints?.recordings || "/v1/recordings";
      await apiJson(endpoint, { method: "POST", body: form });
      state.recordingSaved = true;
      recordingStatus("已儲存！可在「my recording attempt」隨時取回。", false);
      if (button) {
        button.textContent = "✓ 已儲存";
        button.disabled = true;
      }
      toast("錄音已安全儲存。", "info");
    } catch (error) {
      console.warn("Recording upload failed:", error);
      const unavailable = error?.code === "RECORDING_SERVICE_UNREACHABLE"
        || /(?:load failed|failed to fetch|networkerror|error code:\s*1042)/i.test(String(error?.message || ""));
      const message = unavailable
        ? "未能連接錄音儲存服務。這次錄音仍保留在此頁；請先按「下載這次 MP3」備份，再稍後重新儲存。"
        : String(error?.message || "錄音上載失敗，請稍後再試。");
      recordingStatus(message);
      toast(message, "error");
      if (button) button.disabled = false;
    }
  }

  function normaliseAttempt(raw, index) {
    const item = raw || {};
    return {
      id: String(item.id || item.recordingId || item.key || index),
      studentName: String(item.studentName || item.student_name || item.ownerName || item.owner_name || state.user?.name || "Student"),
      exerciseId: String(item.exerciseId || item.exercise_id || item.metadata?.exerciseId || ""),
      exerciseTitle: String(item.exerciseTitle || item.exercise_title || item.metadata?.exerciseTitle || item.title || "Speaking attempt"),
      exerciseIndex: Number(item.exerciseIndex || item.exercise_index || item.metadata?.exerciseIndex || 0),
      part: Number(item.part || item.metadata?.part || 2),
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

  function renderAttemptList() {
    const container = document.querySelector("[data-attempt-list]");
    const summary = document.querySelector("[data-attempts-summary]");
    if (!container) return;
    if (summary) summary.textContent = `共 ${state.attemptTotal || state.attempts.length} 次錄音`;
    if (!state.attempts.length) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon" aria-hidden="true">🎙</span>
          <h2>暫時未有錄音</h2>
          <p>${state.user?.role === "admin" ? "學生儲存錄音後，便會在這裡顯示。" : "完成一個 Speaking 練習並按「save the attempt」，錄音便會在這裡顯示。"}</p>
        </div>
      `;
      return;
    }
    container.innerHTML = state.attempts.map(attempt => `
      <article class="attempt-card" data-attempt-card="${escapeHtml(attempt.id)}">
        <div>
          <h3>${escapeHtml(attempt.exerciseTitle)}</h3>
          <div class="attempt-meta">
            ${state.user?.role === "admin" ? `<strong>${escapeHtml(attempt.studentName)}</strong>` : ""}
            <span>IELTS Part ${attempt.part} · Book ${attempt.book} · Exercise ${attempt.exerciseIndex}</span>
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
      </article>
    `).join("");
  }

  async function renderAttemptsPage() {
    invalidateAttemptRequests();
    state.attempts = [];
    state.attemptTotal = 0;
    state.attemptsById.clear();
    const requestGeneration = state.attemptRequestGeneration;
    const authGeneration = state.authGeneration;
    const controller = createAttemptController();
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader(state.user?.role === "admin" ? "所有錄音嘗試" : "my recording attempt", state.user?.role === "admin" ? "管理、播放、逐一下載或刪除所有學生的 Speaking 錄音。" : "你的錄音會安全同步至帳戶，可隨時播放、下載、匯出或刪除。", state.user?.role === "admin" ? "ADMIN · ALL STUDENTS" : "你的私人錄音庫")}
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
      const result = await listAttempts({ signal: controller.signal });
      if (!attemptRequestIsCurrent(requestGeneration, authGeneration) || state.route.view !== "attempts") return;
      state.attempts = result.attempts;
      state.attemptTotal = result.total;
      state.attemptsById = new Map(state.attempts.map(item => [item.id, item]));
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
        if (state.mediaRecorder?.state === "recording") pauseRecording();
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
          const exerciseNow = currentExercise();
          downloadBlob(state.recordedMp3, `${safeFilePart(state.user?.name, "student")}-${safeFilePart(exerciseNow?.title, "speaking-attempt")}.mp3`);
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
      const timedWord = event.target.closest?.("[data-timing-index]");
      if (timedWord && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        const paragraph = timedWord.closest(".response-en, .part3-step-en");
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
      toggleModelAudio();
    });

    window.addEventListener("beforeunload", event => {
      if (!navigationHasUnsavedRecording() && !state.adminAccessDrafts.size) return;
      event.preventDefault();
      event.returnValue = "";
    });

    window.addEventListener("pagehide", () => {
      stopModelAudio();
      cancelRecorder();
      cleanupAttemptAudio();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "hidden") return;
      stopModelAudio();
      stopAttemptPlayback();
      if (state.recordingPermissionPending) cancelRecorder();
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
        setConnection("Session 已恢復", "live");
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
