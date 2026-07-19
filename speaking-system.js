(function initialiseEdmundSpeakingSystem() {
  "use strict";

  const CONFIG = window.EDMUND_SPEAKING_CONFIG || {};
  const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
  const SESSION_KEY = "edmundSpeakingSessionV1";
  const RATE_KEY = "edmundSpeakingAudioRateV1";
  const HIGHLIGHT_KEY = "edmundSpeakingHighlightV1";
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
    toastRegion: document.querySelector("[data-toast-region]"),
    loadingTemplate: document.querySelector("#loading-template")
  };

  const state = {
    user: null,
    authToken: "",
    supabase: null,
    supabaseReady: false,
    route: { view: "exams" },
    routeHistory: [],
    selectedRate: restoreRate(),
    highlightEnabled: restoreHighlight(),
    modelAudio: null,
    modelAudioExerciseId: "",
    highlightFrame: 0,
    activeWordIndex: -1,
    modelAudioGeneration: 0,
    authGeneration: 0,
    mediaRecorder: null,
    mediaStream: null,
    recordingChunks: [],
    recordingStartedAt: 0,
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
      saveSession();
      form.reset();
      showPortal();
      setConnection(isAdmin ? "Admin 已連接" : "Supabase 已連接", "live");
      navigate({ view: "exams" }, { reset: true });
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
    document.body.classList.add("portal-active");
  }

  function resetAuthenticatedState(message) {
    clearSession();
    state.route = { view: "exams" };
    state.routeHistory = [];
    state.attempts = [];
    state.attemptTotal = 0;
    state.attemptsById.clear();
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
      default: return "選擇考試";
    }
  }

  function routesEqual(left, right) {
    return JSON.stringify(left || {}) === JSON.stringify(right || {});
  }

  function navigationHasUnsavedRecording() {
    return Boolean(
      state.mediaRecorder?.state === "recording"
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

    dom.breadcrumbs.innerHTML = crumbs.map((crumb, index) => {
      const isLast = index === crumbs.length - 1;
      const content = isLast || !crumb.route
        ? `<span class="breadcrumb-current" aria-current="page">${escapeHtml(crumb.label)}</span>`
        : `<button class="breadcrumb-button" type="button" data-breadcrumb-index="${index}">${escapeHtml(crumb.label)}</button>`;
      return `${index ? '<span class="breadcrumb-separator" aria-hidden="true">/</span>' : ""}${content}`;
    }).join("");
    dom.breadcrumbs._routes = crumbs.map(item => item.route);
    dom.backButton.hidden = state.routeHistory.length === 0 && state.route.view === "exams";
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

  function renderExams() {
    const chip = state.user?.role === "admin"
      ? `Admin · ${state.user.name}`
      : `Welcome, ${state.user?.name || "Student"}`;
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader("選擇練習範疇", "先選擇你想訓練的考試或說話情境。IELTS 說話考試現已開放。", chip)}
        <div class="choice-grid">
          ${EXAMS.map((exam, index) => `
            <button class="choice-card${exam.id === "ielts" ? "" : " coming-soon"}" type="button" data-exam="${escapeHtml(exam.id)}">
              <span class="card-number">0${index + 1} · SPEAKING</span>
              <strong>${escapeHtml(exam.title)}</strong>
              <small>${escapeHtml(exam.description)}</small>
              ${exam.id === "ielts" ? "" : '<span class="availability">即將推出</span>'}
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderParts() {
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader("IELTS 說話考試", "選擇 Part 1、Part 2 或 Part 3。每個部分均設有 16 本練習冊。")}
        <div class="choice-grid parts-grid">
          ${[1, 2, 3].map(part => `
            <button class="choice-card" type="button" data-part="${part}">
              <span class="card-number">IELTS SPEAKING</span>
              <strong>Part ${part}</strong>
              <small>${part === 2 ? "Cue card 長答示範與錄音練習" : part === 1 ? "日常主題短答練習" : "延伸討論及分析練習"}</small>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderBooks(part) {
    const validPart = [1, 2, 3].includes(Number(part)) ? Number(part) : 1;
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader(`IELTS Speaking · Part ${validPart}`, `選擇練習冊。Part 2 的 Book 1 已加入 10 個完整 Band 9 示範。`)}
        <div class="book-grid">
          ${Array.from({ length: 16 }, (_, index) => {
            const book = index + 1;
            const available = validPart === 2 && book === 1;
            return `
              <button class="book-card${available ? " available" : ""}" type="button" data-book="${book}" data-part="${validPart}">
                <strong>Book ${book}</strong>
                <span>${available ? "Book 1 of Part 2 · 10 exercises" : "Coming soon · 即將推出"}</span>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function rawSpeakingExercises() {
    const data = window.EDMUND_SPEAKING_DATA || {};
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.exercises)) return data.exercises;
    if (Array.isArray(data.books)) {
      const book = data.books.find(item => Number(item?.part) === 2 && Number(item?.book) === 1);
      if (Array.isArray(book?.exercises)) return book.exercises;
    }
    const nested = data.ielts?.parts?.[2]?.books?.[1]
      || data.ielts?.part2?.book1
      || data.part2?.book1
      || data.book1;
    return Array.isArray(nested?.exercises) ? nested.exercises : [];
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

  function normalizeExercise(raw, fallbackIndex) {
    const source = raw || {};
    const index = Number(source.index || source.number || fallbackIndex);
    const sections = source.sections || source.responses || source.responseCards || source.answers || [];
    const responses = Array.isArray(sections)
      ? sections.slice(0, 4).map(normalizeResponse)
      : [];
    while (responses.length < 4) responses.push(normalizeResponse(null, responses.length));
    return {
      id: String(source.id || source.slug || `ielts-part2-book1-exercise-${pad(index)}`),
      index,
      title: String(source.title || source.topic || source.name || `Exercise ${index}`),
      titleZh: String(source.title_zh || source.titleZh || source.topic_zh || source.cue?.titleZh || source.cue?.title_zh || ""),
      cueText: String(source.cue_raw || source.cueRaw || source.question_raw || source.question || source.cue?.raw || cueObjectText(source.cue, source) || ""),
      responses,
      unavailable: !raw
    };
  }

  function speakingExercises() {
    const source = rawSpeakingExercises();
    return Array.from({ length: 10 }, (_, index) => normalizeExercise(source[index], index + 1));
  }

  function currentExercise() {
    const index = Number(state.route.exerciseIndex || 0);
    return speakingExercises().find(item => item.index === index) || speakingExercises()[index - 1] || null;
  }

  function renderExercises() {
    const exercises = speakingExercises();
    dom.content.innerHTML = `
      <section class="content-panel">
        ${sectionHeader("Book 1 of Part 2", "選擇題目，閱讀雙語 cue card 及四部分 Band 9 示範，然後錄下自己的答案。")}
        <div class="exercise-grid">
          ${exercises.map(exercise => `
            <button class="exercise-card" type="button" data-exercise-index="${exercise.index}"${exercise.unavailable ? " disabled" : ""}>
              <span class="exercise-index">${pad(exercise.index)}</span>
              <span>
                <strong>${escapeHtml(exercise.title)}</strong>
                <small>${exercise.titleZh ? escapeHtml(exercise.titleZh) : exercise.unavailable ? "資料準備中" : "Cue card · Band 9 sample"}</small>
              </span>
              <span class="arrow" aria-hidden="true">→</span>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function audioManifestCandidates() {
    const manifest = window.EDMUND_SPEAKING_AUDIO || {};
    const candidates = [manifest, manifest.exercises, manifest.entries, manifest.items];
    return candidates.filter(Boolean);
  }

  function resolveAudioEntry(exercise) {
    if (!exercise) return null;
    const keys = [
      exercise.id,
      `ielts-part2-book1-exercise-${pad(exercise.index)}`,
      `part2-book1-exercise-${pad(exercise.index)}`,
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
      return `<span class="timed-word" data-timing-index="${matchedIndex}" title="按此字開始播放">${escapeHtml(token)}</span>`;
    }).join("");
  }

  function renderAudioPanel(entry) {
    const available = Boolean(entry && audioPath(entry));
    return `
      <section class="audio-panel" aria-label="示範錄音控制">
        <div class="audio-main-controls">
          <button class="audio-button" type="button" data-model-audio-toggle${available ? "" : " disabled"} aria-pressed="false">
            <span data-audio-button-label>${available ? "▶ 播放示範" : "音訊準備中"}</span>
          </button>
          <span class="audio-note">Edmund Neural · 可按空白鍵暫停／繼續</span>
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
          <p>允許瀏覽器使用咪高峰，完成後會在你的裝置上轉換成真正的單聲道 MP3，再安全儲存。IELTS Part 2 每次最多錄音 2 分 30 秒。</p>
          <div class="recording-status" data-recording-status><span role="status" aria-live="polite">準備好便按「開始錄音」。</span></div>
        </div>
        <button class="record-button" type="button" data-record-toggle>● 開始錄音</button>
        <div class="recording-preview" data-recording-preview hidden></div>
      </section>
    `;
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
    const matcher = { rows: timingRows(entry), cursor: 0 };
    dom.content.innerHTML = `
      <article class="exercise-view">
        <header class="exercise-hero" data-exercise-number="${pad(exercise.index)}">
          <p class="eyebrow">IELTS SPEAKING · PART 2 · BOOK 1</p>
          <h1>${escapeHtml(exercise.title)}</h1>
          ${exercise.titleZh ? `<p>${escapeHtml(exercise.titleZh)}</p>` : ""}
        </header>

        <section class="cue-card" aria-labelledby="cue-heading">
          <span class="cue-label" id="cue-heading">QUESTION · 題目與提示</span>
          <p class="cue-copy">${escapeHtml(exercise.cueText || "題目內容準備中")}</p>
        </section>

        ${renderAudioPanel(entry)}

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
    const bounds = word.getBoundingClientRect();
    if (bounds.top < 125 || bounds.bottom > window.innerHeight - 60) {
      word.scrollIntoView({ block: "center", behavior: preferredScrollBehavior() });
    }
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
    const button = document.querySelector("[data-model-audio-toggle]");
    if (!button) return;
    const exercise = currentExercise();
    const isCurrent = state.modelAudioExerciseId === exercise?.id;
    const playing = Boolean(isCurrent && state.modelAudio && !state.modelAudio.paused && !state.modelAudio.ended);
    const resumable = Boolean(isCurrent && state.modelAudio && state.modelAudio.paused && state.modelAudio.currentTime > 0 && !state.modelAudio.ended);
    const text = playing ? "❚❚ 暫停示範" : resumable ? "▶ 繼續示範" : "▶ 播放示範";
    const label = button.querySelector("[data-audio-button-label]");
    if (label && !button.disabled) label.textContent = text;
    button.classList.toggle("is-playing", playing);
    button.setAttribute("aria-pressed", String(playing));
  }

  function stopModelAudio() {
    state.modelAudioGeneration += 1;
    clearHighlight();
    if (state.modelAudio) {
      state.modelAudio.onloadedmetadata = null;
      state.modelAudio.onplay = null;
      state.modelAudio.onpause = null;
      state.modelAudio.onended = null;
      state.modelAudio.onerror = null;
      state.modelAudio.pause();
      state.modelAudio.removeAttribute("src");
      state.modelAudio.load();
    }
    state.modelAudio = null;
    state.modelAudioExerciseId = "";
    syncAudioControls();
  }

  function startModelAudio(exercise, entry, startAt = 0) {
    if (!exercise || !entry || !audioPath(entry)) return;
    stopAttemptPlayback();
    stopModelAudio();
    const generation = state.modelAudioGeneration;
    const audio = new Audio();
    state.modelAudio = audio;
    state.modelAudioExerciseId = exercise.id;
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
    if (state.recordingPermissionPending || state.mediaRecorder?.state === "recording") {
      toast("請先停止錄音，才播放示範音訊。", "error");
      return;
    }
    const { exercise, entry } = currentAudioContext();
    if (!exercise || !entry) return;
    if (state.modelAudio && state.modelAudioExerciseId === exercise.id) {
      if (!state.modelAudio.paused && !state.modelAudio.ended) {
        state.modelAudio.pause();
        return;
      }
      const result = state.modelAudio.play();
      if (result?.catch) result.catch(error => console.warn("Speaking sample resume failed:", error));
      return;
    }
    startModelAudio(exercise, entry, 0);
  }

  function playFromTiming(index) {
    if (state.recordingPermissionPending || state.mediaRecorder?.state === "recording") {
      toast("請先停止錄音，才從指定文字播放。", "error");
      return;
    }
    const { exercise, entry } = currentAudioContext();
    const row = timingRows(entry)[Number(index)];
    if (!exercise || !entry || !row) return;
    if (state.modelAudio && state.modelAudioExerciseId === exercise.id) {
      state.modelAudio.currentTime = Math.max(0, row.start);
      updateHighlight();
      if (state.modelAudio.paused) {
        const result = state.modelAudio.play();
        if (result?.catch) result.catch(error => console.warn("Word seek playback failed:", error));
      }
      return;
    }
    startModelAudio(exercise, entry, row.start);
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

  function recordingStatus(message, recording = false) {
    const status = document.querySelector("[data-recording-status]");
    if (!status) return;
    status.innerHTML = `
      ${recording ? '<span class="recording-dot" aria-hidden="true"></span>' : ""}
      <span role="status" aria-live="polite">${escapeHtml(message)}</span>
      ${recording ? '<span class="recording-clock" aria-hidden="true" data-recording-clock></span>' : ""}
    `;
  }

  function formatDuration(milliseconds) {
    const seconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${pad(seconds % 60)}`;
  }

  function updateRecordingClock() {
    if (!state.recordingStartedAt) return;
    const elapsed = Date.now() - state.recordingStartedAt;
    const maxSeconds = Math.max(30, Number(CONFIG.maxRecordingSeconds || 600));
    const clock = document.querySelector("[data-recording-clock]");
    if (clock) clock.textContent = `${formatDuration(elapsed)} / ${formatDuration(maxSeconds * 1000)}`;
    if (elapsed >= maxSeconds * 1000) stopRecording();
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
    const button = document.querySelector("[data-record-toggle]");
    if (button) button.disabled = true;
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
      state.recordingStartedAt = 0;
      if (button) button.disabled = false;
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
      state.recordingStartedAt = Date.now();
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
        state.recordingStartedAt = 0;
        state.recordedDurationMs = 0;
        state.recordingProcessing = false;
        resetRecordButton();
      };
      recorder.onstop = () => finaliseRecording(generation, recorder.mimeType || "audio/webm");
      recorder.start(1000);
      clearRecordingTimer();
      recordingStatus("錄音已開始，完成後請按停止。", true);
      state.recordingTimer = window.setInterval(updateRecordingClock, 1000);
      updateRecordingClock();
      if (button) {
        button.disabled = false;
        button.classList.add("is-recording");
        button.textContent = "■ 停止錄音";
      }
    } catch (error) {
      if (requestGeneration !== state.recordingGeneration) return;
      console.warn("MediaRecorder startup failed:", error);
      recordingStatus("咪高峰已連接，但瀏覽器未能開始錄音。請更新瀏覽器或改用另一個瀏覽器後再試。");
      clearRecordingTimer();
      stopMediaTracks();
      state.mediaRecorder = null;
      state.recordingChunks = [];
      state.recordingStartedAt = 0;
      if (button) button.disabled = false;
    }
  }

  function stopRecording() {
    if (!state.mediaRecorder || state.mediaRecorder.state !== "recording") return;
    state.recordedDurationMs = Date.now() - state.recordingStartedAt;
    state.recordingProcessing = true;
    clearRecordingTimer();
    state.mediaRecorder.stop();
    stopMediaTracks();
    const button = document.querySelector("[data-record-toggle]");
    if (button) {
      button.disabled = true;
      button.classList.remove("is-recording");
      button.textContent = "正在製作 MP3…";
    }
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
    return mp3;
  }

  async function finaliseRecording(generation, sourceMime) {
    if (generation !== state.recordingGeneration) return;
    const source = new Blob(state.recordingChunks, { type: sourceMime });
    state.recordingChunks = [];
    state.mediaRecorder = null;
    state.recordingStartedAt = 0;
    if (!source.size) {
      state.recordingProcessing = false;
      recordingStatus("未有錄到聲音，請重新嘗試。");
      resetRecordButton();
      return;
    }
    state.recordingProcessing = true;
    try {
      const mp3 = await encodeGenuineMonoMp3(source);
      if (generation !== state.recordingGeneration) return;
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
    button.disabled = false;
    button.classList.remove("is-recording");
    button.textContent = label;
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
    clearRecordingTimer();
    if (state.mediaRecorder && state.mediaRecorder.state === "recording") {
      state.mediaRecorder.ondataavailable = null;
      state.mediaRecorder.onstop = null;
      try { state.mediaRecorder.stop(); } catch { /* Recorder already stopped. */ }
    }
    state.mediaRecorder = null;
    state.recordingChunks = [];
    state.recordingStartedAt = 0;
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
      const filename = `${safeFilePart(state.user.name, "student")}-${pad(exercise.index)}-${now.toISOString().replace(/[:.]/g, "-")}.mp3`;
      const metadata = {
        exerciseId: exercise.id,
        exerciseIndex: exercise.index,
        exerciseTitle: exercise.title,
        exam: "IELTS",
        part: 2,
        book: 1,
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

      const crumb = event.target.closest("[data-breadcrumb-index]");
      if (crumb) {
        const route = dom.breadcrumbs._routes?.[Number(crumb.dataset.breadcrumbIndex)];
        if (route) directRoute(route);
        return;
      }

      const exam = event.target.closest("[data-exam]");
      if (exam) {
        if (exam.dataset.exam !== "ielts") toast("這個練習範疇即將推出，敬請期待。", "info");
        else navigate({ view: "parts", exam: "ielts" });
        return;
      }

      const part = event.target.closest("[data-part]:not([data-book])");
      if (part) {
        navigate({ view: "books", exam: "ielts", part: Number(part.dataset.part) });
        return;
      }

      const book = event.target.closest("[data-book]");
      if (book) {
        const partNumber = Number(book.dataset.part);
        const bookNumber = Number(book.dataset.book);
        if (partNumber !== 2 || bookNumber !== 1) {
          toast(`Part ${partNumber} · Book ${bookNumber} 即將推出。`, "info");
          return;
        }
        navigate({ view: "exercises", exam: "ielts", part: 2, book: 1 });
        return;
      }

      const exercise = event.target.closest("[data-exercise-index]");
      if (exercise && !exercise.disabled) {
        navigate({ view: "exercise", exam: "ielts", part: 2, book: 1, exerciseIndex: Number(exercise.dataset.exerciseIndex) });
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
        if (state.mediaRecorder?.state === "recording") stopRecording();
        else startRecording();
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
      }
    });

    document.addEventListener("keydown", event => {
      if (event.code !== "Space" || event.repeat || !state.modelAudio) return;
      if (event.target.closest?.("input, textarea, select, button, a, [contenteditable='true'], audio")) return;
      event.preventDefault();
      toggleModelAudio();
    });

    window.addEventListener("beforeunload", event => {
      if (!navigationHasUnsavedRecording()) return;
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
      else if (state.mediaRecorder?.state === "recording") stopRecording();
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
        showPortal();
        setConnection("Session 已恢復", "live");
        navigate({ view: "exams" }, { reset: true, skipGuard: true });
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
