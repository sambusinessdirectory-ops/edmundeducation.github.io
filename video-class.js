(function initialiseVideoClassPortal() {
  "use strict";

  const configuration = window.EDMUND_VIDEO_CLASS || {};
  const apiBase = String(configuration.apiBase || "").replace(/\/+$/, "");
  const turnstileSiteKey = String(configuration.turnstileSiteKey || "").trim();
  const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  const requestTimeoutMs = Number(configuration.requestTimeoutMs) || 20000;
  const heartbeatIntervalMs = Math.max(10000, Number(configuration.heartbeatIntervalMs) || 15000);
  const STUDENT_INACTIVITY_MS = 30 * 60 * 1000;
  const COURSE_CATALOG = Object.freeze([
    { id: "dse", slug: "dse", title: "DSE 中學文憑試", description: "香港中學文憑試英文課程" },
    { id: "ielts", slug: "ielts", title: "IELTS 國際英文課程", description: "IELTS 應試技巧及英語能力訓練" },
    { id: "toefl", slug: "toefl", title: "TOEFL 託福", description: "TOEFL 國際英語能力考試課程" },
    { id: "toeic", slug: "toeic", title: "TOEIC 多益", description: "TOEIC 職場英語及考試訓練" },
    { id: "pte", slug: "pte", title: "Pearson Test of English (PTE)", description: "PTE Academic 電腦化英語考試課程" },
    { id: "igcse", slug: "igcse", title: "IGCSE", description: "IGCSE 英文課程及考試準備" },
    { id: "sat", slug: "sat", title: "SAT", description: "SAT Reading and Writing 應試課程" },
    { id: "ib", slug: "ib", title: "IB 課程", description: "IB English 課程及評核準備" }
  ]);
  const STORAGE_KEYS = Object.freeze({
    student: "edmund-video-class-student-session-v1",
    admin: "edmund-video-class-admin-session-v1",
    lastRole: "edmund-video-class-last-role-v1"
  });

  const elements = {
    views: Array.from(document.querySelectorAll("[data-view]")),
    connection: document.querySelector("[data-connection-status]"),
    signedInUser: document.querySelector("[data-signed-in-user]"),
    logout: document.querySelector("[data-logout]"),
    roleTabs: Array.from(document.querySelectorAll("[data-role-tab]")),
    loginPanels: Array.from(document.querySelectorAll("[data-login-panel]")),
    loginForms: Array.from(document.querySelectorAll("[data-login-form]")),
    turnstileChallenges: Array.from(document.querySelectorAll("[data-turnstile-challenge]")),
    turnstileWidgets: Array.from(document.querySelectorAll("[data-turnstile-widget]")),
    turnstileStatuses: Array.from(document.querySelectorAll("[data-turnstile-status]")),
    turnstileRetries: Array.from(document.querySelectorAll("[data-turnstile-retry]")),
    universalSession: document.querySelector("[data-universal-session]"),
    universalName: document.querySelector("[data-universal-name]"),
    useUniversal: document.querySelector("[data-use-universal-session]"),
    toast: document.querySelector("[data-toast]"),
    studentNav: document.querySelector("[data-student-nav]"),
    studentRoutes: Array.from(document.querySelectorAll("[data-student-route]")),
    studentPages: Array.from(document.querySelectorAll("[data-student-page]")),
    studentGreeting: document.querySelector("[data-student-greeting]"),
    studentKey: document.querySelector("[data-student-key]"),
    coursesState: document.querySelector("[data-courses-state]"),
    courseList: document.querySelector("[data-course-list]"),
    selectedCourseTitle: document.querySelector("[data-selected-course-title]"),
    selectedCourseDescription: document.querySelector("[data-selected-course-description]"),
    lessonsState: document.querySelector("[data-lessons-state]"),
    lessonList: document.querySelector("[data-lesson-list]"),
    bookmarksState: document.querySelector("[data-bookmarks-state]"),
    bookmarkList: document.querySelector("[data-bookmark-list]"),
    notesState: document.querySelector("[data-notes-state]"),
    notesList: document.querySelector("[data-notes-list]"),
    printNotes: document.querySelector("[data-print-notes]"),
    noteDialog: document.querySelector("[data-note-dialog]"),
    noteForm: document.querySelector("[data-note-form]"),
    noteLessonTitle: document.querySelector("[data-note-lesson-title]"),
    noteContent: document.querySelector("[data-note-content]"),
    noteCount: document.querySelector("[data-note-count]"),
    noteStatus: document.querySelector("[data-note-status]"),
    openNote: document.querySelector("[data-open-note]"),
    refreshLessons: document.querySelector("[data-refresh-lessons]"),
    playerSection: document.querySelector("[data-player-section]"),
    player: document.querySelector("[data-player]"),
    video: document.querySelector("[data-video]"),
    playerTitle: document.querySelector("[data-player-title]"),
    playerDescription: document.querySelector("[data-player-description]"),
    playerPlaceholder: document.querySelector("[data-player-placeholder]"),
    playerControls: document.querySelector("[data-player-controls]"),
    centrePlay: document.querySelector("[data-centre-play]"),
    playToggle: document.querySelector("[data-play-toggle]"),
    muteToggle: document.querySelector("[data-mute-toggle]"),
    seek: document.querySelector("[data-seek]"),
    volume: document.querySelector("[data-volume]"),
    currentTime: document.querySelector("[data-current-time]"),
    duration: document.querySelector("[data-duration]"),
    fullscreen: document.querySelector("[data-fullscreen]"),
    closePlayer: document.querySelector("[data-close-player]"),
    playerError: document.querySelector("[data-player-error]"),
    watermarkMain: document.querySelector("[data-watermark-main]"),
    watermarkRepeats: Array.from(document.querySelectorAll("[data-watermark-repeat]")),
    watermarkLayer: document.querySelector("[data-watermark-layer]"),
    companyWatermarkCorner: document.querySelector("[data-company-watermark-corner]"),
    companyWatermarkBottom: document.querySelector("[data-company-watermark-bottom]"),
    adminPanelTabs: Array.from(document.querySelectorAll("[data-admin-panel-tab]")),
    adminPanels: Array.from(document.querySelectorAll("[data-admin-panel]")),
    refreshStudents: document.querySelector("[data-refresh-students]"),
    studentsState: document.querySelector("[data-students-state]"),
    studentTable: document.querySelector("[data-student-table]"),
    studentRows: document.querySelector("[data-student-rows]"),
    studentSearch: document.querySelector("[data-student-search]"),
    keyFilter: document.querySelector("[data-key-filter]"),
    resultCount: document.querySelector("[data-result-count]"),
    statTotal: document.querySelector("[data-stat-total]"),
    statKeyed: document.querySelector("[data-stat-keyed]"),
    statEnabled: document.querySelector("[data-stat-enabled]"),
    entitlementStudent: document.querySelector("[data-entitlement-student]"),
    entitlementsState: document.querySelector("[data-entitlements-state]"),
    entitlementsForm: document.querySelector("[data-entitlements-form]"),
    entitlementCourseList: document.querySelector("[data-entitlement-course-list]"),
    disableWatermarks: document.querySelector("[data-disable-watermarks]"),
    entitlementsFormStatus: document.querySelector("[data-entitlements-form-status]")
  };

  const state = {
    role: null,
    studentSession: null,
    adminSession: null,
    universalSession: null,
    courses: COURSE_CATALOG.map(course => ({ ...course, entitled: false, lessonCount: 0 })),
    adminCourses: COURSE_CATALOG.map((course, index) => ({ ...course, order: index + 1 })),
    lessons: [],
    students: [],
    selectedCourseId: "",
    noteLesson: null,
    selectedEntitlementStudentId: "",
    activeLesson: null,
    playback: null,
    heartbeatTimer: 0,
    watermarkTimer: 0,
    watermarkClock: 0,
    companyWatermarkTimer: 0,
    companyWatermarkHideTimer: 0,
    companyWatermarkCornerIndex: 0,
    inactivityTimer: 0,
    controlsTimer: 0,
    toastTimer: 0,
    heartbeatInFlight: false,
    isLoggingOut: false,
    seeking: false,
    turnstile: {
      student: { required: false, token: "", widgetId: null, identifier: "", cooldownUntil: 0, cooldownTimer: 0, rendering: false, generation: 0 },
      admin: { required: false, token: "", widgetId: null, identifier: "", cooldownUntil: 0, cooldownTimer: 0, rendering: false, generation: 0 }
    }
  };

  let turnstileScriptPromise = null;

  class ApiError extends Error {
    constructor(message, status = 0, code = "", options = {}) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.code = code;
      this.challengeRequired = options.challengeRequired === true;
      this.retryAfterSeconds = Number.isFinite(Number(options.retryAfterSeconds))
        ? Math.max(0, Math.ceil(Number(options.retryAfterSeconds)))
        : 0;
    }
  }

  function isApiConfigurationSafe() {
    if (!apiBase) return false;
    try {
      const parsed = new URL(apiBase);
      return parsed.protocol === "https:" || (parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname));
    } catch {
      return false;
    }
  }

  function readStorage(key) {
    try {
      return JSON.parse(window.sessionStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function removeStorage(key) {
    try { window.sessionStorage.removeItem(key); } catch { /* Browser storage can be unavailable. */ }
  }

  function getErrorMessage(payload, fallback) {
    if (!payload || typeof payload !== "object") return fallback;
    const nested = payload.error && typeof payload.error === "object" ? payload.error : null;
    return String(nested?.message || payload.message || (typeof payload.error === "string" ? payload.error : "") || fallback);
  }

  function unwrap(payload) {
    if (payload && typeof payload === "object" && payload.data !== undefined) return payload.data;
    return payload;
  }

  async function apiRequest(path, options = {}) {
    if (!isApiConfigurationSafe()) throw new ApiError("錄影班服務尚未完成設定。", 0, "API_NOT_CONFIGURED");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs || requestTimeoutMs);
    const headers = new Headers({ Accept: "application/json" });
    if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
    if (options.body !== undefined) headers.set("Content-Type", "application/json");

    try {
      const response = await fetch(`${apiBase}${path}`, {
        method: options.method || "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        keepalive: options.keepalive === true,
        signal: controller.signal
      });
      let payload = null;
      const contentType = response.headers.get("content-type") || "";
      if (response.status !== 204 && contentType.includes("application/json")) {
        payload = await response.json().catch(() => null);
      }
      setConnection("online", "服務已連接");
      if (!response.ok) {
        const nestedError = payload?.error && typeof payload.error === "object" ? payload.error : {};
        const code = String(nestedError.code || payload?.code || "");
        const headerRetryAfter = Number(response.headers.get("Retry-After") || 0);
        const payloadRetryAfter = Number(nestedError.retryAfterSeconds || payload?.retryAfterSeconds || 0);
        throw new ApiError(
          getErrorMessage(payload, response.status === 401 ? "登入已失效，請重新登入。" : "服務暫時未能完成要求。"),
          response.status,
          code,
          {
            challengeRequired: nestedError.challengeRequired === true || payload?.challengeRequired === true,
            retryAfterSeconds: Number.isFinite(payloadRetryAfter) && payloadRetryAfter > 0
              ? payloadRetryAfter
              : headerRetryAfter
          }
        );
      }
      return payload;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error?.name === "AbortError") throw new ApiError("連線逾時，請檢查網絡後再試。", 0, "TIMEOUT");
      setConnection("offline", "連線中斷");
      throw new ApiError("未能連接錄影班服務，請檢查網絡後再試。", 0, "NETWORK_ERROR");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function setConnection(status, label) {
    if (!elements.connection) return;
    elements.connection.dataset.state = status;
    elements.connection.textContent = label;
  }

  function showView(name) {
    elements.views.forEach(view => { view.hidden = view.dataset.view !== name; });
    document.body.dataset.portalView = name;
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function showToast(message, type = "info") {
    if (!elements.toast) return;
    window.clearTimeout(state.toastTimer);
    elements.toast.textContent = message;
    elements.toast.dataset.state = type;
    elements.toast.hidden = false;
    state.toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 4200);
  }

  function setFormStatus(role, message = "", type = "error") {
    const status = document.querySelector(`[data-form-status="${role}"]`);
    if (!status) return;
    status.textContent = message;
    status.dataset.state = type;
  }

  function setFormBusy(form, busy) {
    Array.from(form.elements).forEach(control => { control.disabled = busy; });
    form.setAttribute("aria-busy", String(busy));
    const submit = form.querySelector("[data-login-submit]");
    if (submit) {
      const label = submit.querySelector("span:first-child");
      if (label) label.textContent = busy ? "正在驗證⋯" : (form.dataset.loginForm === "admin" ? "進入管理面板" : "進入我的課堂");
    }
    updateLoginSubmitState(form.dataset.loginForm);
  }

  function normalizedProfile(value, role) {
    const profile = value && typeof value === "object" ? value : {};
    const courseCodes = Array.isArray(profile.courseCodes || profile.course_codes) ? (profile.courseCodes || profile.course_codes) : [];
    return {
      id: String(profile.id || profile.studentId || profile.student_id || ""),
      name: String(profile.name || profile.username || profile.displayName || profile.display_name || (role === "admin" ? "管理員" : "學生")),
      videoKey: String(profile.videoKey || profile.video_key || ""),
      enabled: profile.enabled !== false && profile.accessEnabled !== false && profile.access_enabled !== false,
      courseCodes: courseCodes.map(String),
      watermarkEnabled: profile.watermarkEnabled !== false && profile.watermark_enabled !== false && profile.disableAllWatermarks !== true && profile.disable_all_watermarks !== true,
      role
    };
  }

  function extractSession(payload, role, fallbackToken = "") {
    const value = unwrap(payload) || {};
    const session = value.session && typeof value.session === "object" ? value.session : {};
    const merged = { ...value, ...session };
    const person = merged[role] || merged.user || merged.profile || (role === "student" ? merged.student : merged.admin) || merged;
    const token = String(merged.token || merged.sessionToken || merged.session_token || merged.accessToken || merged.access_token || fallbackToken || "");
    if (!token) throw new ApiError("登入服務沒有傳回有效的安全階段。", 0, "INVALID_SESSION");
    return {
      token,
      expiresAt: String(merged.expiresAt || merged.expires_at || ""),
      profile: normalizedProfile(person, role),
      flashcardToken: String(merged.flashcardToken || merged.flashcard_token || "")
    };
  }

  function saveSession(role, session) {
    const stored = {
      token: session.token,
      expiresAt: session.expiresAt,
      profile: session.profile
    };
    writeStorage(STORAGE_KEYS[role], stored);
    writeStorage(STORAGE_KEYS.lastRole, role);
    if (role === "student") state.studentSession = stored;
    else state.adminSession = stored;
  }

  function clearSession(role) {
    removeStorage(STORAGE_KEYS[role]);
    if (role === "student") state.studentSession = null;
    else state.adminSession = null;
    if (readStorage(STORAGE_KEYS.lastRole) === role) removeStorage(STORAGE_KEYS.lastRole);
  }

  function setHeaderIdentity(role, profile) {
    state.role = role;
    elements.signedInUser.textContent = role === "admin" ? `管理員 · ${profile.name}` : profile.name;
    elements.signedInUser.hidden = false;
    elements.logout.hidden = false;
    if (elements.studentNav) elements.studentNav.hidden = role !== "student";
  }

  function clearHeaderIdentity() {
    state.role = null;
    elements.signedInUser.hidden = true;
    elements.signedInUser.textContent = "";
    elements.logout.hidden = true;
    if (elements.studentNav) elements.studentNav.hidden = true;
  }

  function rememberSharedStudentSession(session) {
    if (!session.flashcardToken || !window.EdmundSystemNav?.rememberStudentSession) return;
    window.EdmundSystemNav.rememberStudentSession({
      token: session.flashcardToken,
      id: session.profile.id,
      name: session.profile.name,
      role: "student"
    });
  }

  function selectRoleTab(role, moveFocus = false) {
    elements.roleTabs.forEach(tab => {
      const selected = tab.dataset.roleTab === role;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) tab.focus();
    });
    elements.loginPanels.forEach(panel => { panel.hidden = panel.dataset.loginPanel !== role; });
    setFormStatus(role, "");
    if (state.turnstile[role]?.required && !isTurnstileCooldownActive(role)) void renderTurnstile(role);
  }

  function refreshUniversalSessionOffer() {
    let candidate = null;
    try { candidate = window.EdmundSystemNav?.getStudentSession?.() || null; } catch { candidate = null; }
    state.universalSession = candidate?.role === "student" && candidate.token ? candidate : null;
    if (!elements.universalSession) return;
    elements.universalSession.hidden = !state.universalSession;
    if (state.universalSession) elements.universalName.textContent = state.universalSession.name || "已登入學生";
  }

  function normalizeLoginIdentifier(value) {
    return String(value || "").trim().toLocaleLowerCase();
  }

  function getTurnstileElements(role) {
    return {
      form: elements.loginForms.find(item => item.dataset.loginForm === role),
      challenge: elements.turnstileChallenges.find(item => item.dataset.turnstileChallenge === role),
      widget: elements.turnstileWidgets.find(item => item.dataset.turnstileWidget === role),
      status: elements.turnstileStatuses.find(item => item.dataset.turnstileStatus === role),
      retry: elements.turnstileRetries.find(item => item.dataset.turnstileRetry === role)
    };
  }

  function setTurnstileStatus(role, message, type = "") {
    const { status } = getTurnstileElements(role);
    if (!status) return;
    status.textContent = message;
    if (type) status.dataset.state = type;
    else delete status.dataset.state;
  }

  function isTurnstileCooldownActive(role) {
    return Number(state.turnstile[role]?.cooldownUntil || 0) > Date.now();
  }

  function updateLoginSubmitState(role) {
    const turnstile = state.turnstile[role];
    const { form } = getTurnstileElements(role);
    const submit = form?.querySelector("[data-login-submit]");
    if (!turnstile || !form || !submit) return;
    const busy = form.getAttribute("aria-busy") === "true";
    submit.disabled = busy
      || isTurnstileCooldownActive(role)
      || (turnstile.required && !turnstile.token);
  }

  function loadTurnstileScript() {
    if (window.turnstile?.render) return Promise.resolve(window.turnstile);
    if (!turnstileSiteKey) return Promise.reject(new Error("Turnstile site key is missing"));
    if (turnstileScriptPromise) return turnstileScriptPromise;

    turnstileScriptPromise = new Promise((resolve, reject) => {
      let script = document.querySelector("script[data-edmund-turnstile]");
      let settled = false;
      let timeoutId = 0;
      const cleanup = () => {
        window.clearTimeout(timeoutId);
        script?.removeEventListener("load", loaded);
        script?.removeEventListener("error", failed);
      };
      const resolveApi = () => {
        if (settled) return;
        if (!window.turnstile?.render) {
          failed();
          return;
        }
        settled = true;
        cleanup();
        resolve(window.turnstile);
      };
      const loaded = () => {
        if (script) script.dataset.edmundTurnstileLoaded = "true";
        resolveApi();
      };
      const failed = () => {
        if (settled) return;
        settled = true;
        cleanup();
        script?.remove();
        turnstileScriptPromise = null;
        reject(new Error("Turnstile script failed to load"));
      };

      if (script?.dataset.edmundTurnstileLoaded === "true" && !window.turnstile?.render) {
        script.remove();
        script = null;
      }
      if (script) {
        script.addEventListener("load", loaded, { once: true });
        script.addEventListener("error", failed, { once: true });
        timeoutId = window.setTimeout(failed, 12000);
        return;
      }

      script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.dataset.edmundTurnstile = "true";
      script.addEventListener("load", loaded, { once: true });
      script.addEventListener("error", failed, { once: true });
      timeoutId = window.setTimeout(failed, 12000);
      document.head.append(script);
    });

    return turnstileScriptPromise;
  }

  function destroyTurnstileWidget(role) {
    const turnstile = state.turnstile[role];
    const { widget } = getTurnstileElements(role);
    turnstile.generation += 1;
    turnstile.token = "";
    if (turnstile.widgetId !== null && window.turnstile?.remove) {
      try { window.turnstile.remove(turnstile.widgetId); } catch { /* Widget may already be gone. */ }
    }
    turnstile.widgetId = null;
    turnstile.rendering = false;
    widget?.replaceChildren();
  }

  async function renderTurnstile(role, replaceExisting = false) {
    const turnstile = state.turnstile[role];
    const { form, challenge, widget, retry } = getTurnstileElements(role);
    if (!turnstile?.required || !challenge || !widget || isTurnstileCooldownActive(role)) return;
    if (form?.closest("[data-login-panel]")?.hidden) return;
    if (turnstile.rendering) return;
    if (turnstile.widgetId !== null && !replaceExisting) return;

    if (replaceExisting) destroyTurnstileWidget(role);
    const generation = turnstile.generation + 1;
    turnstile.generation = generation;
    turnstile.rendering = true;
    challenge.hidden = false;
    if (retry) retry.hidden = true;
    setTurnstileStatus(role, "正在載入安全驗證⋯");

    try {
      const api = await loadTurnstileScript();
      if (turnstile.generation !== generation
        || !turnstile.required
        || isTurnstileCooldownActive(role)
        || form?.closest("[data-login-panel]")?.hidden) return;
      const size = widget.clientWidth < 300 ? "compact" : "flexible";
      turnstile.widgetId = api.render(widget, {
        sitekey: turnstileSiteKey,
        action: role === "admin" ? "admin_login" : "student_login",
        appearance: "interaction-only",
        theme: "auto",
        language: "auto",
        size,
        tabindex: 0,
        retry: "auto",
        "refresh-expired": "auto",
        "response-field": false,
        callback(token) {
          if (turnstile.generation !== generation) return;
          turnstile.token = String(token || "");
          if (retry) retry.hidden = true;
          setTurnstileStatus(role, "安全驗證完成，現在可以再次登入。", "success");
          updateLoginSubmitState(role);
        },
        "expired-callback"() {
          if (turnstile.generation !== generation) return;
          turnstile.token = "";
          setTurnstileStatus(role, "安全驗證已過期，請重新完成驗證。", "error");
          if (retry) retry.hidden = false;
          updateLoginSubmitState(role);
        },
        "timeout-callback"() {
          if (turnstile.generation !== generation) return;
          turnstile.token = "";
          setTurnstileStatus(role, "安全驗證逾時，請重新完成驗證。", "error");
          if (retry) retry.hidden = false;
          updateLoginSubmitState(role);
        },
        "error-callback"() {
          if (turnstile.generation !== generation) return;
          turnstile.token = "";
          setTurnstileStatus(role, "暫時無法完成安全驗證，請重試。", "error");
          if (retry) retry.hidden = false;
          updateLoginSubmitState(role);
        },
        "unsupported-callback"() {
          if (turnstile.generation !== generation) return;
          turnstile.token = "";
          setTurnstileStatus(role, "此瀏覽器未能使用安全驗證，請更新瀏覽器或改用其他瀏覽器。", "error");
          if (retry) retry.hidden = false;
          updateLoginSubmitState(role);
        }
      });
    } catch {
      if (turnstile.generation !== generation) return;
      setTurnstileStatus(role, "暫時無法載入安全驗證。請檢查網絡或內容攔截器後重試。", "error");
      if (retry) retry.hidden = false;
    } finally {
      if (turnstile.generation === generation) {
        turnstile.rendering = false;
        updateLoginSubmitState(role);
      }
    }
  }

  function requireTurnstile(role, username, moveFocus = false) {
    const turnstile = state.turnstile[role];
    const { challenge } = getTurnstileElements(role);
    if (!turnstile || !challenge) return;
    const wasRequired = turnstile.required;
    turnstile.required = true;
    turnstile.identifier = normalizeLoginIdentifier(username);
    challenge.hidden = false;
    if (moveFocus && !wasRequired) challenge.querySelector("legend")?.focus();
    updateLoginSubmitState(role);
    void renderTurnstile(role);
  }

  function clearTurnstile(role) {
    const turnstile = state.turnstile[role];
    const { challenge, status, retry } = getTurnstileElements(role);
    if (!turnstile) return;
    window.clearInterval(turnstile.cooldownTimer);
    turnstile.cooldownTimer = 0;
    turnstile.cooldownUntil = 0;
    turnstile.required = false;
    turnstile.identifier = "";
    destroyTurnstileWidget(role);
    if (challenge) challenge.hidden = true;
    if (retry) retry.hidden = true;
    status?.setAttribute("aria-live", "polite");
    document.querySelector(`[data-form-status="${role}"]`)?.setAttribute("aria-live", "polite");
    setTurnstileStatus(role, "");
    updateLoginSubmitState(role);
  }

  function formatCooldown(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function startLoginCooldown(role, username, seconds, challengeRequired = false) {
    const turnstile = state.turnstile[role];
    const { challenge, status, retry } = getTurnstileElements(role);
    if (!turnstile || !challenge) return;
    window.clearInterval(turnstile.cooldownTimer);
    turnstile.required = turnstile.required || challengeRequired;
    turnstile.identifier = turnstile.required ? normalizeLoginIdentifier(username) : "";
    turnstile.cooldownUntil = Date.now() + Math.max(1, seconds) * 1000;
    challenge.hidden = !turnstile.required;
    if (retry) retry.hidden = true;
    if (turnstile.required) destroyTurnstileWidget(role);

    const formStatus = document.querySelector(`[data-form-status="${role}"]`);
    const countdownTarget = turnstile.required ? status : formStatus;
    countdownTarget?.setAttribute("aria-live", "off");

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((turnstile.cooldownUntil - Date.now()) / 1000));
      if (remaining > 0) {
        if (turnstile.required) {
          setTurnstileStatus(role, `登入暫停，請在 ${formatCooldown(remaining)} 後再試。`, "error");
        } else if (formStatus) {
          formStatus.textContent = `登入請求過多，請在 ${formatCooldown(remaining)} 後再試。`;
          formStatus.dataset.state = "error";
        }
        updateLoginSubmitState(role);
        return;
      }
      window.clearInterval(turnstile.cooldownTimer);
      turnstile.cooldownTimer = 0;
      turnstile.cooldownUntil = 0;
      countdownTarget?.setAttribute("aria-live", "polite");
      if (turnstile.required) {
        setTurnstileStatus(role, "暫停已結束，請重新完成安全驗證。", "success");
      } else {
        setFormStatus(role, "暫停已結束，現在可以重新登入。", "success");
      }
      updateLoginSubmitState(role);
      if (turnstile.required) void renderTurnstile(role, true);
    };

    tick();
    turnstile.cooldownTimer = window.setInterval(tick, 1000);
  }

  function resetTurnstileAfterAttempt(role) {
    const turnstile = state.turnstile[role];
    if (!turnstile?.required || isTurnstileCooldownActive(role)) return;
    destroyTurnstileWidget(role);
    void renderTurnstile(role, true);
  }

  async function handleLogin(form) {
    const role = form.dataset.loginForm;
    const formData = new FormData(form);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    if (!username || !password) {
      setFormStatus(role, "請輸入用戶名稱及密碼。");
      form.querySelector(!username ? "[name='username']" : "[name='password']")?.focus();
      return;
    }

    const existingTurnstile = state.turnstile[role];
    if (existingTurnstile.required
      && existingTurnstile.identifier
      && existingTurnstile.identifier !== normalizeLoginIdentifier(username)) {
      clearTurnstile(role);
    }

    const loginProtection = state.turnstile[role];
    if (isTurnstileCooldownActive(role)) {
      setFormStatus(role, "為保護帳戶，登入暫時停用；倒數完成後可再試。");
      return;
    }
    if (loginProtection.required && !loginProtection.token) {
      requireTurnstile(role, username, true);
      setFormStatus(role, "請先完成安全驗證。", "error");
      return;
    }

    const turnstileToken = loginProtection.required ? loginProtection.token : "";
    if (turnstileToken) {
      loginProtection.token = "";
      updateLoginSubmitState(role);
    }

    setFormBusy(form, true);
    setFormStatus(role, "正在安全地驗證帳戶⋯", "success");
    try {
      const payload = await apiRequest(`/v1/${role}/login`, {
        method: "POST",
        body: turnstileToken ? { username, password, turnstileToken } : { username, password }
      });
      const session = extractSession(payload, role);
      saveSession(role, session);
      clearTurnstile(role);
      form.reset();
      if (role === "student") {
        rememberSharedStudentSession(session);
        await enterStudentPortal(session);
      } else {
        await enterAdminPortal(session);
      }
    } catch (error) {
      if (error.challengeRequired) requireTurnstile(role, username, true);
      if (error.status === 429 && error.retryAfterSeconds > 0) {
        startLoginCooldown(role, username, error.retryAfterSeconds, error.challengeRequired);
      } else if (turnstileToken) {
        resetTurnstileAfterAttempt(role);
      }

      let message = error.message;
      if (error.status === 401) message = "用戶名稱或密碼不正確。";
      else if (["TURNSTILE_REQUIRED", "TURNSTILE_INVALID"].includes(error.code)) message = "請完成安全驗證後再登入。";
      else if (error.code === "LOGIN_DELAYED") message = "為保護帳戶，登入已暫停一段短時間。";
      else if (error.code === "IP_RATE_LIMITED") message = "此網絡的登入請求過多，請稍後再試。";
      else if (error.code === "TURNSTILE_UNAVAILABLE") message = "安全驗證服務暫時未能連接，請稍後重試。";
      setFormStatus(role, message);
    } finally {
      setFormBusy(form, false);
    }
  }

  async function exchangeUniversalSession() {
    if (!state.universalSession?.token || !elements.useUniversal) return;
    elements.useUniversal.disabled = true;
    elements.useUniversal.textContent = "正在進入⋯";
    setFormStatus("student", "正在確認你的錄影班權限⋯", "success");
    try {
      const payload = await apiRequest("/v1/student/exchange", {
        method: "POST",
        body: { token: state.universalSession.token }
      });
      const session = extractSession(payload, "student");
      saveSession("student", session);
      clearTurnstile("student");
      await enterStudentPortal(session);
    } catch (error) {
      setFormStatus("student", error.status === 403 ? "你的帳戶尚未獲錄影班權限，請聯絡 Edmund Sir。" : error.message);
    } finally {
      elements.useUniversal.disabled = false;
      elements.useUniversal.textContent = "直接進入";
    }
  }

  async function validateStoredSession(role, stored) {
    if (!stored?.token) return null;
    if (stored.expiresAt && Date.parse(stored.expiresAt) <= Date.now()) {
      clearSession(role);
      return null;
    }
    try {
      const payload = await apiRequest(`/v1/${role}/session`, { token: stored.token });
      const session = extractSession(payload, role, stored.token);
      saveSession(role, session);
      return session;
    } catch (error) {
      if (error.status === 401 || error.status === 403) clearSession(role);
      return null;
    }
  }

  async function restoreSession() {
    const storedStudent = readStorage(STORAGE_KEYS.student);
    const storedAdmin = readStorage(STORAGE_KEYS.admin);
    const lastRole = readStorage(STORAGE_KEYS.lastRole);
    const order = lastRole === "admin" ? [["admin", storedAdmin], ["student", storedStudent]] : [["student", storedStudent], ["admin", storedAdmin]];
    for (const [role, stored] of order) {
      const session = await validateStoredSession(role, stored);
      if (!session) continue;
      if (role === "student") await enterStudentPortal(session);
      else await enterAdminPortal(session);
      return true;
    }
    return false;
  }

  async function enterStudentPortal(session) {
    state.studentSession = session;
    state.selectedCourseId = "";
    state.noteLesson = null;
    state.lessons = [];
    state.courses = COURSE_CATALOG.map(course => ({ ...course, entitled: false, lessonCount: 0 }));
    setHeaderIdentity("student", session.profile);
    elements.studentGreeting.textContent = session.profile.name || "你好";
    elements.studentKey.textContent = session.profile.videoKey || "尚未派發";
    showView("student");
    resetStudentInactivity();
    await loadLessons();
    showStudentPage("courses");
    resetStudentInactivity();
  }

  async function enterAdminPortal(session) {
    state.adminSession = session;
    state.selectedEntitlementStudentId = "";
    state.students = [];
    setHeaderIdentity("admin", session.profile);
    showView("admin");
    showAdminPanel("students");
    await loadStudents();
    await loadAdminCourses();
  }

  function suspendStudentInactivity() {
    window.clearTimeout(state.inactivityTimer);
    state.inactivityTimer = 0;
  }

  function resetStudentInactivity() {
    if (state.role !== "student" || !state.studentSession?.token || state.isLoggingOut) return;
    suspendStudentInactivity();
    if (state.playback && !elements.video.paused && !elements.video.ended) return;
    state.inactivityTimer = window.setTimeout(() => {
      if (state.role === "student" && (elements.video.paused || elements.video.ended)) void logout({ automatic: true });
    }, STUDENT_INACTIVITY_MS);
  }

  function showStudentPage(name) {
    if (!elements.studentPages.some(page => page.dataset.studentPage === name)) return;
    if (name === "library" && !state.courses.some(course => course.id === state.selectedCourseId && course.entitled)) {
      const firstCourse = state.courses.find(course => course.entitled);
      if (!firstCourse) name = "courses";
      else {
        state.selectedCourseId = firstCourse.id;
        elements.selectedCourseTitle.textContent = firstCourse.title;
        elements.selectedCourseDescription.textContent = firstCourse.description;
      }
    }
    if (name !== "library" && state.activeLesson) closePlayer({ saveProgress: true });
    elements.studentPages.forEach(page => { page.hidden = page.dataset.studentPage !== name; });
    elements.studentRoutes.forEach(button => {
      if (button.dataset.studentRoute === name) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (name === "courses") renderCourses();
    if (name === "library") renderLessons();
    if (name === "bookmarks") renderBookmarks();
    if (name === "notes") renderNotes();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function showAdminPanel(name) {
    elements.adminPanels.forEach(panel => { panel.hidden = panel.dataset.adminPanel !== name; });
    elements.adminPanelTabs.forEach(button => {
      if (button.dataset.adminPanelTab === name) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  async function logout({ automatic = false } = {}) {
    const role = state.role;
    const session = role === "student" ? state.studentSession : state.adminSession;
    if (!role || !session) return;
    state.isLoggingOut = true;
    suspendStudentInactivity();
    elements.logout.disabled = true;
    if (role === "student") closePlayer({ saveProgress: true });
    try {
      await apiRequest(`/v1/${role}/session`, { method: "DELETE", token: session.token });
    } catch (error) {
      if (![404, 405].includes(error.status)) {
        // Logout is completed locally even if the network is unavailable.
      } else {
        try { await apiRequest(`/v1/${role}/session`, { method: "POST", token: session.token, body: { action: "logout" } }); } catch { /* Best effort. */ }
      }
    }
    clearSession(role);
    if (role === "student") {
      try { window.EdmundSystemNav?.forgetStudentSession?.(); } catch { /* Shared logout is best effort. */ }
    }
    clearHeaderIdentity();
    selectRoleTab(role);
    showView("login");
    refreshUniversalSessionOffer();
    elements.logout.disabled = false;
    state.isLoggingOut = false;
    showToast(automatic ? "因 30 分鐘沒有操作，你已自動登出。" : "你已安全登出。", "success");
  }

  function handleExpiredSession(role) {
    if (state.role !== role) return;
    suspendStudentInactivity();
    if (role === "student") closePlayer({ saveProgress: false });
    clearSession(role);
    clearHeaderIdentity();
    selectRoleTab(role);
    showView("login");
    refreshUniversalSessionOffer();
    setFormStatus(role, "登入階段已失效，請重新登入。");
  }

  function showInlineState(element, message, type = "loading", retry) {
    if (!element) return;
    element.replaceChildren();
    element.dataset.state = type;
    if (type === "loading") {
      const spinner = document.createElement("span");
      spinner.className = "spinner";
      spinner.setAttribute("aria-hidden", "true");
      element.append(spinner);
    }
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    element.append(paragraph);
    if (typeof retry === "function") {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "再試一次";
      button.addEventListener("click", retry, { once: true });
      element.append(button);
    }
    element.hidden = false;
  }

  function formatDuration(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${minutes}:${String(secs).padStart(2, "0")}`;
  }

  function normalizeLesson(value, index) {
    const lesson = value && typeof value === "object" ? value : {};
    const progress = lesson.progress && typeof lesson.progress === "object" ? lesson.progress : {};
    const course = lesson.course && typeof lesson.course === "object" ? lesson.course : {};
    const noteValue = lesson.note && typeof lesson.note === "object" ? (lesson.note.text ?? lesson.note.note ?? lesson.note.content ?? "") : (lesson.note ?? lesson.noteText ?? lesson.note_text ?? "");
    const durationSeconds = Number(lesson.durationSeconds || lesson.duration_seconds || 0);
    const positionSeconds = Number(progress.positionSeconds || progress.position_seconds || lesson.positionSeconds || lesson.position_seconds || lesson.resumeAt || lesson.resume_at || 0);
    const completed = progress.completed === true || lesson.completed === true;
    const calculated = durationSeconds > 0 ? Math.min(100, Math.round((positionSeconds / durationSeconds) * 100)) : 0;
    return {
      id: String(lesson.id || lesson.lessonId || lesson.lesson_id || ""),
      slug: String(lesson.slug || lesson.videoSlug || lesson.video_slug || lesson.id || ""),
      title: String(lesson.title || lesson.name || `課堂 ${index + 1}`),
      description: String(lesson.description || lesson.summary || ""),
      durationSeconds,
      positionSeconds,
      completed,
      progressPercent: completed ? 100 : calculated,
      posterUrl: safeMediaUrl(lesson.posterUrl || lesson.poster_url || lesson.thumbnailUrl || lesson.thumbnail_url || ""),
      order: Number(lesson.order || lesson.position || index + 1),
      courseId: String(lesson.courseCode || lesson.course_code || lesson.courseId || lesson.course_id || course.code || course.id || "dse").toLowerCase(),
      courseTitle: String(lesson.courseTitle || lesson.course_title || course.title || ""),
      bookmarked: lesson.bookmarked === true || lesson.isBookmarked === true || lesson.is_bookmarked === true,
      note: String(noteValue || ""),
      noteUpdatedAt: String(lesson.noteUpdatedAt || lesson.note_updated_at || (typeof lesson.note === "object" ? (lesson.note.updatedAt || lesson.note.updated_at || "") : ""))
    };
  }

  function normalizeCourse(value) {
    const course = value && typeof value === "object" ? value : {};
    const id = String(course.code || course.courseCode || course.course_code || course.slug || course.id || "").toLowerCase();
    const fallback = COURSE_CATALOG.find(item => item.id === id);
    const explicitEntitlement = course.entitled ?? course.enabled ?? course.hasAccess ?? course.has_access ?? course.accessEnabled ?? course.access_enabled;
    return {
      id,
      slug: id,
      title: String(course.title || course.name || fallback?.title || id.toUpperCase()),
      description: String(course.description || fallback?.description || "錄影班課程"),
      lessonCount: Number(course.lessonCount || course.lesson_count || 0),
      entitled: explicitEntitlement === undefined ? true : explicitEntitlement === true,
      order: Number(course.sortOrder || course.sort_order || (COURSE_CATALOG.findIndex(item => item.id === id) + 1) || 999)
    };
  }

  function safeMediaUrl(value) {
    if (!value) return "";
    try {
      const parsed = new URL(String(value), apiBase || window.location.origin);
      const apiOrigin = new URL(apiBase).origin;
      if (parsed.origin !== apiOrigin) return "";
      if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) return "";
      return parsed.href;
    } catch {
      return "";
    }
  }

  async function loadLessons() {
    if (!state.studentSession?.token) return;
    elements.lessonList.hidden = true;
    elements.courseList.hidden = true;
    showInlineState(elements.lessonsState, "正在載入你的課堂⋯");
    showInlineState(elements.coursesState, "正在載入你的課程⋯");
    try {
      const payload = await apiRequest("/v1/lessons", { token: state.studentSession.token });
      const value = unwrap(payload);
      const rows = Array.isArray(value) ? value : (value?.lessons || value?.items || []);
      state.lessons = rows.map(normalizeLesson).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-Hant"));
      const returnedCourses = Array.isArray(value?.courses) ? value.courses.map(normalizeCourse) : [];
      const byId = new Map(returnedCourses.map(course => [course.id, course]));
      const profileCodes = new Set((state.studentSession.profile.courseCodes || []).map(code => String(code).toLowerCase()));
      state.courses = COURSE_CATALOG.map((catalogCourse, index) => {
        const returned = byId.get(catalogCourse.id);
        const lessonCount = state.lessons.filter(lesson => lesson.courseId === catalogCourse.id).length;
        return {
          ...catalogCourse,
          ...(returned || {}),
          order: index + 1,
          lessonCount: returned?.lessonCount || lessonCount,
          entitled: returned ? returned.entitled : (profileCodes.has(catalogCourse.id) || lessonCount > 0)
        };
      });
      renderCourses();
      renderLessons();
      renderBookmarks();
      renderNotes();
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      elements.lessonList.hidden = true;
      showInlineState(elements.lessonsState, error.message, "error", loadLessons);
      showInlineState(elements.coursesState, error.message, "error", loadLessons);
    }
  }

  function renderCourses() {
    if (!elements.courseList) return;
    elements.courseList.replaceChildren();
    state.courses.forEach((course, index) => {
      const article = document.createElement("article");
      article.className = `course-card${course.entitled ? "" : " course-card--locked"}`;
      const ordinal = document.createElement("span");
      ordinal.className = "course-card__number";
      ordinal.textContent = String(index + 1).padStart(2, "0");
      const status = document.createElement("span");
      status.className = "course-card__status";
      status.textContent = course.entitled ? `${course.lessonCount} 節課堂` : "尚未開放";
      const title = document.createElement("h2");
      title.textContent = course.title;
      const description = document.createElement("p");
      description.textContent = course.description;
      const button = document.createElement("button");
      button.type = "button";
      button.disabled = !course.entitled;
      button.textContent = course.entitled ? "進入課程 →" : "未獲授權";
      button.addEventListener("click", () => selectCourse(course.id));
      article.append(ordinal, status, title, description, button);
      elements.courseList.append(article);
    });
    elements.coursesState.hidden = true;
    elements.courseList.hidden = false;
  }

  function selectCourse(courseId) {
    const course = state.courses.find(item => item.id === courseId && item.entitled);
    if (!course) return;
    state.selectedCourseId = course.id;
    elements.selectedCourseTitle.textContent = course.title;
    elements.selectedCourseDescription.textContent = course.description;
    showStudentPage("library");
  }

  function renderLessons() {
    elements.lessonList.replaceChildren();
    const lessons = state.selectedCourseId ? state.lessons.filter(lesson => lesson.courseId === state.selectedCourseId) : [];
    if (!lessons.length) {
      elements.lessonList.hidden = true;
      showInlineState(elements.lessonsState, state.selectedCourseId ? "這個課程目前未有已發布課堂。新課堂上架後會在這裡顯示。" : "請先從課程總覽選擇一個課程。", "empty");
      return;
    }

    lessons.forEach((lesson, index) => elements.lessonList.append(createLessonCard(lesson, index)));
    elements.lessonsState.hidden = true;
    elements.lessonList.hidden = false;
  }

  function createLessonCard(lesson, index) {
    const article = document.createElement("article");
    article.className = "lesson-card";

    const art = document.createElement("div");
    art.className = "lesson-art";
    if (lesson.posterUrl) {
      const image = document.createElement("img");
      image.src = lesson.posterUrl;
      image.alt = "";
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      art.append(image);
    }
    const number = document.createElement("span");
    number.className = "lesson-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const duration = document.createElement("span");
    duration.className = "lesson-duration";
    duration.textContent = lesson.durationSeconds ? formatDuration(lesson.durationSeconds) : "錄影課堂";
    art.append(number, duration);

    const body = document.createElement("div");
    body.className = "lesson-card__body";
    const kicker = document.createElement("span");
    kicker.textContent = `LESSON ${String(index + 1).padStart(2, "0")}`;
    const title = document.createElement("h3");
    title.textContent = lesson.title;
    const description = document.createElement("p");
    description.textContent = lesson.description || "按下方按鈕開始這一節課堂。";

    const progress = document.createElement("div");
    progress.className = "lesson-progress";
    const progressMeta = document.createElement("div");
    progressMeta.className = "lesson-progress__meta";
    const progressLabel = document.createElement("span");
    progressLabel.textContent = lesson.completed ? "已完成" : lesson.progressPercent ? "觀看進度" : "尚未開始";
    const progressValue = document.createElement("span");
    progressValue.textContent = `${lesson.progressPercent}%`;
    progressMeta.append(progressLabel, progressValue);
    const track = document.createElement("div");
    track.className = "lesson-progress__track";
    const fill = document.createElement("span");
    fill.style.setProperty("--progress", `${lesson.progressPercent}%`);
    track.append(fill);
    progress.append(progressMeta, track);

    const actions = document.createElement("div");
    actions.className = "lesson-card__actions";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = lesson.completed ? "再次觀看 →" : lesson.progressPercent ? "繼續播放 →" : "開始播放 →";
    button.addEventListener("click", () => openLesson(lesson));
    const bookmark = document.createElement("button");
    bookmark.type = "button";
    bookmark.className = `bookmark-button${lesson.bookmarked ? " is-bookmarked" : ""}`;
    bookmark.setAttribute("aria-pressed", String(lesson.bookmarked));
    bookmark.setAttribute("aria-label", `${lesson.bookmarked ? "移除" : "加入"}${lesson.title}書籤`);
    bookmark.textContent = lesson.bookmarked ? "★ 已收藏" : "☆ 加入書籤";
    bookmark.addEventListener("click", () => void toggleBookmark(lesson, bookmark));
    actions.append(button, bookmark);
    body.append(kicker, title, description, progress, actions);
    article.append(art, body);
    return article;
  }

  function openLesson(lesson) {
    const course = state.courses.find(item => item.id === lesson.courseId);
    state.selectedCourseId = lesson.courseId;
    if (course) {
      elements.selectedCourseTitle.textContent = course.title;
      elements.selectedCourseDescription.textContent = course.description;
    }
    showStudentPage("library");
    void startPlayback(lesson);
  }

  async function toggleBookmark(lesson, button) {
    if (!state.studentSession?.token || !lesson.id) return;
    const bookmarked = !lesson.bookmarked;
    button.disabled = true;
    try {
      await apiRequest(`/v1/lessons/${encodeURIComponent(lesson.id)}/bookmark`, {
        method: "PATCH",
        token: state.studentSession.token,
        body: { bookmarked }
      });
      lesson.bookmarked = bookmarked;
      renderLessons();
      renderBookmarks();
      showToast(bookmarked ? "已加入我的書籤。" : "已從書籤移除。", "success");
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      showToast(error.message, "error");
      button.disabled = false;
    }
  }

  function renderBookmarks() {
    if (!elements.bookmarkList) return;
    const lessons = state.lessons.filter(lesson => lesson.bookmarked);
    elements.bookmarkList.replaceChildren();
    if (!lessons.length) {
      elements.bookmarkList.hidden = true;
      showInlineState(elements.bookmarksState, "你尚未收藏任何課堂。按課堂卡上的「加入書籤」即可收藏。", "empty");
      return;
    }
    lessons.forEach((lesson, index) => elements.bookmarkList.append(createLessonCard(lesson, index)));
    elements.bookmarksState.hidden = true;
    elements.bookmarkList.hidden = false;
  }

  function updateNoteCount() {
    if (!elements.noteCount || !elements.noteContent) return;
    elements.noteCount.textContent = `${elements.noteContent.value.length.toLocaleString("en-US")} / 5,000`;
  }

  function openNoteDialog(lesson) {
    if (!lesson || !elements.noteDialog) return;
    state.noteLesson = lesson;
    elements.noteLessonTitle.textContent = lesson.title;
    elements.noteContent.value = lesson.note || "";
    elements.noteStatus.textContent = "";
    updateNoteCount();
    if (typeof elements.noteDialog.showModal === "function") elements.noteDialog.showModal();
    else elements.noteDialog.setAttribute("open", "");
    window.setTimeout(() => elements.noteContent.focus(), 0);
  }

  function closeNoteDialog() {
    state.noteLesson = null;
    if (typeof elements.noteDialog?.close === "function") elements.noteDialog.close();
    else elements.noteDialog?.removeAttribute("open");
  }

  async function saveLessonNote() {
    const lesson = state.noteLesson;
    if (!lesson?.id || !state.studentSession?.token) return;
    const text = elements.noteContent.value.trim();
    elements.noteStatus.textContent = "正在儲存⋯";
    elements.noteStatus.dataset.state = "success";
    elements.noteContent.disabled = true;
    const saveButton = elements.noteForm.querySelector("[data-save-note]");
    if (saveButton) saveButton.disabled = true;
    try {
      const payload = await apiRequest(`/v1/lessons/${encodeURIComponent(lesson.id)}/note`, {
        method: "PUT",
        token: state.studentSession.token,
        body: { note: text }
      });
      const value = unwrap(payload) || {};
      const returnedNote = value.note && typeof value.note === "object" ? (value.note.text ?? value.note.note ?? value.note.content) : (value.text ?? value.note);
      lesson.note = String(returnedNote ?? text);
      lesson.noteUpdatedAt = String(value.updatedAt || value.updated_at || value.note?.updatedAt || value.note?.updated_at || new Date().toISOString());
      renderNotes();
      closeNoteDialog();
      showToast(text ? "筆記已儲存。" : "筆記已清除。", "success");
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      elements.noteStatus.textContent = error.message;
      elements.noteStatus.dataset.state = "error";
    } finally {
      elements.noteContent.disabled = false;
      if (saveButton) saveButton.disabled = false;
    }
  }

  function renderNotes() {
    if (!elements.notesList) return;
    const lessons = state.lessons.filter(lesson => lesson.note.trim());
    elements.notesList.replaceChildren();
    if (!lessons.length) {
      elements.notesList.hidden = true;
      showInlineState(elements.notesState, "你尚未儲存任何筆記。播放課堂後，可在安全提示下方開啟「我的筆記」。", "empty");
      return;
    }
    lessons.forEach(lesson => {
      const article = document.createElement("article");
      article.className = "note-card";
      const heading = document.createElement("div");
      heading.className = "note-card__heading";
      const titleWrap = document.createElement("div");
      const course = state.courses.find(item => item.id === lesson.courseId);
      const courseName = document.createElement("span");
      courseName.textContent = course?.title || lesson.courseTitle || "錄影班課堂";
      const title = document.createElement("h2");
      title.textContent = lesson.title;
      titleWrap.append(courseName, title);
      const updated = document.createElement("time");
      if (lesson.noteUpdatedAt) {
        updated.dateTime = lesson.noteUpdatedAt;
        const parsed = new Date(lesson.noteUpdatedAt);
        updated.textContent = Number.isNaN(parsed.getTime()) ? "已儲存" : `更新：${parsed.toLocaleString("zh-HK", { dateStyle: "medium", timeStyle: "short" })}`;
      } else updated.textContent = "已儲存";
      heading.append(titleWrap, updated);
      const content = document.createElement("p");
      content.className = "note-card__content";
      content.textContent = lesson.note;
      const actions = document.createElement("div");
      actions.className = "note-card__actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.textContent = "編輯筆記";
      edit.addEventListener("click", () => openNoteDialog(lesson));
      const watch = document.createElement("button");
      watch.type = "button";
      watch.textContent = "前往課堂 →";
      watch.addEventListener("click", () => openLesson(lesson));
      actions.append(edit, watch);
      article.append(heading, content, actions);
      elements.notesList.append(article);
    });
    elements.notesState.hidden = true;
    elements.notesList.hidden = false;
  }

  function extractPlaybackGrant(payload, lesson) {
    const value = unwrap(payload) || {};
    const grant = value.grant && typeof value.grant === "object" ? { ...value, ...value.grant } : value;
    const playbackToken = String(grant.playbackToken || grant.playback_token || grant.token || "");
    const sessionId = String(grant.playbackSessionId || grant.playback_session_id || grant.sessionCode || grant.session_code || "");
    if (!playbackToken || !sessionId) throw new ApiError("未能建立安全播放階段，請再試一次。", 0, "INVALID_PLAYBACK_GRANT");
    const suppliedUrl = grant.videoUrl || grant.video_url || "";
    const fallbackUrl = `${apiBase}/v1/video/${encodeURIComponent(lesson.slug || lesson.id)}?token=${encodeURIComponent(playbackToken)}`;
    const videoUrl = safePlaybackUrl(suppliedUrl || fallbackUrl);
    if (!videoUrl) throw new ApiError("安全播放連結無效，請重新載入課堂。", 0, "INVALID_PLAYBACK_URL");
    const watermark = grant.watermark && typeof grant.watermark === "object" ? grant.watermark : {};
    const watermarksDisabled = watermark.disabled === true || watermark.disableAll === true || watermark.disable_all === true || grant.disableAllWatermarks === true || grant.disable_all_watermarks === true || grant.watermarksDisabled === true || grant.watermarks_disabled === true || grant.trustedStudent === true || grant.trusted_student === true;
    return {
      playbackToken,
      sessionId,
      videoUrl,
      expiresAt: String(grant.expiresAt || grant.expires_at || ""),
      resumeAt: lesson.completed ? 0 : Number(grant.resumeAt || grant.resume_at || grant.positionSeconds || grant.position_seconds || lesson.positionSeconds || 0),
      videoKey: String(watermark.videoKey || watermark.video_key || grant.videoKey || grant.video_key || state.studentSession?.profile?.videoKey || "已驗證學生"),
      sessionCode: String(watermark.sessionCode || watermark.session_code || grant.sessionCode || grant.session_code || sessionId.slice(-10)).toUpperCase(),
      watermarkEnabled: !watermarksDisabled && watermark.enabled !== false && grant.watermarkEnabled !== false && grant.watermark_enabled !== false && state.studentSession?.profile?.watermarkEnabled !== false
    };
  }

  function safePlaybackUrl(value) {
    try {
      const parsed = new URL(String(value), apiBase);
      const apiOrigin = new URL(apiBase).origin;
      if (parsed.origin !== apiOrigin) return "";
      if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) return "";
      return parsed.href;
    } catch {
      return "";
    }
  }

  async function startPlayback(lesson) {
    if (!state.studentSession?.token || !lesson?.id) return;
    closePlayer({ saveProgress: true, hideSection: false });
    state.activeLesson = lesson;
    elements.playerTitle.textContent = lesson.title;
    elements.playerDescription.textContent = lesson.description || "";
    elements.playerSection.hidden = false;
    elements.playerError.hidden = true;
    elements.playerPlaceholder.hidden = false;
    elements.playerControls.hidden = true;
    elements.centrePlay.hidden = true;
    elements.playerSection.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const payload = await apiRequest("/v1/playback/grant", {
        method: "POST",
        token: state.studentSession.token,
        body: { lessonId: lesson.id }
      });
      if (state.activeLesson?.id !== lesson.id) return;
      state.playback = extractPlaybackGrant(payload, lesson);
      configureWatermark();
      elements.video.src = state.playback.videoUrl;
      elements.video.load();
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      showPlayerError(error.status === 403 ? "你的帳戶目前未能播放這個課堂，請聯絡 Edmund Sir。" : error.message);
    }
  }

  function showPlayerError(message) {
    elements.playerPlaceholder.hidden = true;
    elements.playerControls.hidden = true;
    elements.centrePlay.hidden = true;
    elements.playerError.textContent = message;
    elements.playerError.hidden = false;
  }

  function configureWatermark() {
    clearWatermarkTimers();
    const enabled = state.playback?.watermarkEnabled !== false;
    elements.watermarkLayer.hidden = !enabled;
    if (!enabled) {
      elements.watermarkMain.textContent = "";
      elements.watermarkRepeats.forEach(item => { item.textContent = ""; });
      return;
    }
    const updateText = () => {
      if (!state.playback) return;
      const timestamp = new Intl.DateTimeFormat("zh-HK", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(new Date());
      elements.watermarkMain.textContent = `${state.playback.videoKey} · ${state.playback.sessionCode} · ${timestamp}`;
      const repeatText = `${state.playback.videoKey} · ${state.playback.sessionCode}`;
      elements.watermarkRepeats.forEach(item => { item.textContent = repeatText; });
    };
    updateText();
    moveWatermark();
    state.watermarkClock = window.setInterval(updateText, 1000);
    state.watermarkTimer = window.setInterval(moveWatermark, 23000);
    showCompanyWatermarks();
    state.companyWatermarkTimer = window.setInterval(showCompanyWatermarks, 30000);
  }

  function clearWatermarkTimers() {
    window.clearInterval(state.watermarkTimer);
    window.clearInterval(state.watermarkClock);
    window.clearInterval(state.companyWatermarkTimer);
    window.clearTimeout(state.companyWatermarkHideTimer);
    state.watermarkTimer = 0;
    state.watermarkClock = 0;
    state.companyWatermarkTimer = 0;
    state.companyWatermarkHideTimer = 0;
    elements.companyWatermarkCorner?.classList.remove("is-visible");
    elements.companyWatermarkBottom?.classList.remove("is-visible");
  }

  function showCompanyWatermarks() {
    if (!state.playback || state.playback.watermarkEnabled === false) return;
    const positions = ["top-left", "top-right", "bottom-right", "bottom-left"];
    const position = positions[state.companyWatermarkCornerIndex % positions.length];
    state.companyWatermarkCornerIndex += 1;
    elements.companyWatermarkCorner.dataset.position = position;
    elements.companyWatermarkCorner.classList.add("is-visible");
    elements.companyWatermarkBottom.classList.add("is-visible");
    window.clearTimeout(state.companyWatermarkHideTimer);
    state.companyWatermarkHideTimer = window.setTimeout(() => {
      elements.companyWatermarkCorner?.classList.remove("is-visible");
      elements.companyWatermarkBottom?.classList.remove("is-visible");
    }, 5000);
  }

  function randomBetween(min, max) {
    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return min + (values[0] / 4294967295) * (max - min);
    }
    return min + Math.random() * (max - min);
  }

  function moveWatermark() {
    elements.player.style.setProperty("--wm-x", `${randomBetween(17, 83).toFixed(1)}%`);
    elements.player.style.setProperty("--wm-y", `${randomBetween(15, 70).toFixed(1)}%`);
  }

  function beginHeartbeat() {
    window.clearInterval(state.heartbeatTimer);
    state.heartbeatTimer = window.setInterval(() => sendHeartbeat("heartbeat"), heartbeatIntervalMs);
  }

  async function sendHeartbeat(eventType = "heartbeat", keepalive = false) {
    if (!state.studentSession?.token || !state.activeLesson || !state.playback || state.heartbeatInFlight) return;
    state.heartbeatInFlight = true;
    try {
      await apiRequest("/v1/playback/heartbeat", {
        method: "POST",
        token: state.studentSession.token,
        keepalive,
        timeoutMs: keepalive ? 4000 : requestTimeoutMs,
        body: {
          lessonId: state.activeLesson.id,
          playbackSessionId: state.playback.sessionId,
          positionSeconds: Number.isFinite(elements.video.currentTime) ? Math.round(elements.video.currentTime * 10) / 10 : 0,
          durationSeconds: Number.isFinite(elements.video.duration) ? Math.round(elements.video.duration * 10) / 10 : 0,
          event: eventType
        }
      });
    } catch (error) {
      if (error.status === 401) handleExpiredSession("student");
    } finally {
      state.heartbeatInFlight = false;
    }
  }

  function closePlayer({ saveProgress = true, hideSection = true } = {}) {
    if (saveProgress && state.playback) void sendHeartbeat("close", true);
    window.clearInterval(state.heartbeatTimer);
    clearWatermarkTimers();
    window.clearTimeout(state.controlsTimer);
    state.heartbeatTimer = 0;
    state.controlsTimer = 0;
    if (elements.video) {
      elements.video.pause();
      elements.video.removeAttribute("src");
      elements.video.load();
    }
    state.playback = null;
    state.activeLesson = null;
    elements.watermarkLayer.hidden = false;
    elements.player.removeAttribute("data-controls-hidden");
    elements.playerError.hidden = true;
    if (hideSection) {
      elements.playerSection.hidden = true;
      if (state.role === "student") void loadLessons();
    }
    resetStudentInactivity();
  }

  function updatePlayerControls() {
    const current = Number.isFinite(elements.video.currentTime) ? elements.video.currentTime : 0;
    const duration = Number.isFinite(elements.video.duration) ? elements.video.duration : 0;
    elements.currentTime.textContent = formatDuration(current);
    elements.duration.textContent = formatDuration(duration);
    if (!state.seeking) {
      elements.seek.max = String(duration || 100);
      elements.seek.value = String(duration ? Math.min(current, duration) : 0);
    }
  }

  function updatePlayButtons() {
    const paused = elements.video.paused;
    elements.playToggle.querySelector("span").textContent = paused ? "▶" : "❚❚";
    elements.playToggle.setAttribute("aria-label", paused ? "播放影片" : "暫停影片");
    elements.centrePlay.hidden = !paused || elements.playerPlaceholder.hidden === false;
  }

  async function togglePlayback() {
    if (!state.playback || elements.playerPlaceholder.hidden === false) return;
    try {
      if (elements.video.paused) await elements.video.play();
      else elements.video.pause();
    } catch {
      showToast("瀏覽器未能開始播放，請再按一次播放。", "error");
    }
  }

  function showControlsTemporarily() {
    elements.player.dataset.controlsHidden = "false";
    window.clearTimeout(state.controlsTimer);
    if (!elements.video.paused) {
      state.controlsTimer = window.setTimeout(() => {
        if (!elements.player.contains(document.activeElement)) elements.player.dataset.controlsHidden = "true";
      }, 2600);
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === elements.player) await document.exitFullscreen();
      else if (elements.player.requestFullscreen) await elements.player.requestFullscreen();
      else throw new Error("FULLSCREEN_UNAVAILABLE");
    } catch {
      showToast("此瀏覽器不支援安全全螢幕模式。", "error");
    }
  }

  function handlePlayerKeydown(event) {
    if (!state.playback || ["INPUT", "BUTTON"].includes(event.target.tagName)) return;
    const key = event.key.toLowerCase();
    if ([" ", "k"].includes(key)) {
      event.preventDefault();
      void togglePlayback();
    } else if (key === "arrowleft") {
      event.preventDefault();
      elements.video.currentTime = Math.max(0, elements.video.currentTime - 10);
    } else if (key === "arrowright") {
      event.preventDefault();
      elements.video.currentTime = Math.min(elements.video.duration || Infinity, elements.video.currentTime + 10);
    } else if (key === "m") {
      elements.video.muted = !elements.video.muted;
      updateMuteControl();
    } else if (key === "f") {
      event.preventDefault();
      void toggleFullscreen();
    }
    showControlsTemporarily();
  }

  function updateMuteControl() {
    const muted = elements.video.muted || elements.video.volume === 0;
    elements.muteToggle.querySelector("span").textContent = muted ? "靜音" : "聲音";
    elements.muteToggle.setAttribute("aria-label", muted ? "開啟聲音" : "靜音");
    elements.volume.value = String(elements.video.muted ? 0 : elements.video.volume);
  }

  function bindPlayerEvents() {
    elements.video.disablePictureInPicture = true;
    elements.video.disableRemotePlayback = true;
    elements.video.addEventListener("loadedmetadata", () => {
      if (!state.playback) return;
      const latestStart = Math.max(0, (elements.video.duration || 0) - 3);
      const resumeAt = Math.min(Math.max(0, state.playback.resumeAt), latestStart);
      if (resumeAt > 2) elements.video.currentTime = resumeAt;
      elements.playerPlaceholder.hidden = true;
      elements.playerControls.hidden = false;
      elements.centrePlay.hidden = false;
      elements.player.focus({ preventScroll: true });
      updatePlayerControls();
      updatePlayButtons();
      showControlsTemporarily();
    });
    elements.video.addEventListener("timeupdate", updatePlayerControls);
    elements.video.addEventListener("durationchange", updatePlayerControls);
    elements.video.addEventListener("play", () => {
      updatePlayButtons();
      suspendStudentInactivity();
      beginHeartbeat();
      void sendHeartbeat("play");
      showControlsTemporarily();
    });
    elements.video.addEventListener("pause", () => {
      updatePlayButtons();
      window.clearInterval(state.heartbeatTimer);
      elements.player.dataset.controlsHidden = "false";
      if (state.playback && !elements.video.ended) void sendHeartbeat("pause");
      resetStudentInactivity();
    });
    elements.video.addEventListener("ended", () => {
      updatePlayButtons();
      window.clearInterval(state.heartbeatTimer);
      void sendHeartbeat("ended");
      resetStudentInactivity();
      showToast("課堂播放完畢，進度已儲存。", "success");
    });
    elements.video.addEventListener("volumechange", updateMuteControl);
    elements.video.addEventListener("error", () => {
      if (!state.playback) return;
      showPlayerError("影片未能載入。安全播放連結可能已過期，請關閉後重新開啟課堂。");
    });
    elements.video.addEventListener("contextmenu", event => {
      event.preventDefault();
      showToast("課堂影片只供平台內觀看。");
    });
    elements.video.addEventListener("enterpictureinpicture", () => {
      try { document.exitPictureInPicture?.(); } catch { /* Picture-in-picture remains browser controlled. */ }
    });
    elements.player.addEventListener("contextmenu", event => {
      event.preventDefault();
      showToast("課堂影片只供獲授權學生觀看。");
    });
    elements.player.addEventListener("pointermove", showControlsTemporarily);
    elements.player.addEventListener("pointerleave", () => {
      if (!elements.video.paused) elements.player.dataset.controlsHidden = "true";
    });
    elements.player.addEventListener("keydown", handlePlayerKeydown);
    elements.video.addEventListener("click", () => void togglePlayback());
    elements.centrePlay.addEventListener("click", () => void togglePlayback());
    elements.playToggle.addEventListener("click", () => void togglePlayback());
    elements.fullscreen.addEventListener("click", () => void toggleFullscreen());
    elements.muteToggle.addEventListener("click", () => {
      elements.video.muted = !elements.video.muted;
      updateMuteControl();
    });
    elements.volume.addEventListener("input", () => {
      elements.video.volume = Number(elements.volume.value);
      elements.video.muted = Number(elements.volume.value) === 0;
    });
    elements.seek.addEventListener("pointerdown", () => { state.seeking = true; });
    elements.seek.addEventListener("input", () => { elements.currentTime.textContent = formatDuration(Number(elements.seek.value)); });
    elements.seek.addEventListener("change", () => {
      elements.video.currentTime = Number(elements.seek.value);
      state.seeking = false;
      updatePlayerControls();
    });
    elements.seek.addEventListener("pointerup", () => { state.seeking = false; });
    elements.closePlayer.addEventListener("click", () => closePlayer({ saveProgress: true }));
  }

  function normalizeStudent(value) {
    const student = value && typeof value === "object" ? value : {};
    const videoKey = String(student.videoKey || student.video_key || "");
    const courseCodes = Array.isArray(student.courseCodes || student.course_codes) ? (student.courseCodes || student.course_codes) : [];
    return {
      id: String(student.id || student.studentId || student.student_id || ""),
      name: String(student.name || student.username || "未命名學生"),
      videoKey,
      enabled: Boolean(videoKey) && (student.enabled === true || student.accessEnabled === true || student.access_enabled === true),
      courseCodes: courseCodes.map(code => String(code).toLowerCase()),
      watermarkEnabled: student.watermarkEnabled !== false && student.watermark_enabled !== false,
      createdAt: String(student.createdAt || student.created_at || "")
    };
  }

  async function loadStudents() {
    if (!state.adminSession?.token) return;
    elements.studentTable.hidden = true;
    elements.resultCount.hidden = true;
    showInlineState(elements.studentsState, "正在載入學生名單⋯");
    if (elements.refreshStudents) elements.refreshStudents.disabled = true;
    try {
      const payload = await apiRequest("/v1/admin/students", { token: state.adminSession.token });
      const value = unwrap(payload);
      const rows = Array.isArray(value) ? value : (value?.students || value?.items || []);
      state.students = rows.map(normalizeStudent).sort((a, b) => a.name.localeCompare(b.name, "zh-Hant", { numeric: true }));
      renderStudentSummary();
      renderStudents();
      renderEntitlementStudentOptions();
      if (state.selectedEntitlementStudentId) showEntitlementEditor(state.selectedEntitlementStudentId);
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      showInlineState(elements.studentsState, error.message, "error", loadStudents);
    } finally {
      if (elements.refreshStudents) elements.refreshStudents.disabled = false;
    }
  }

  async function loadAdminCourses() {
    if (!state.adminSession?.token) return;
    showInlineState(elements.entitlementsState, "正在載入課程設定⋯");
    try {
      const payload = await apiRequest("/v1/admin/courses", { token: state.adminSession.token });
      const value = unwrap(payload);
      const rows = Array.isArray(value) ? value : (value?.courses || value?.items || []);
      const returned = new Map(rows.map(normalizeCourse).map(course => [course.id, course]));
      state.adminCourses = COURSE_CATALOG.map((course, index) => ({ ...course, ...(returned.get(course.id) || {}), order: index + 1 }));
      if (state.selectedEntitlementStudentId) showEntitlementEditor(state.selectedEntitlementStudentId);
      else showInlineState(elements.entitlementsState, "請先選擇一位學生。", "empty");
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      showInlineState(elements.entitlementsState, error.message, "error", loadAdminCourses);
    }
  }

  function renderEntitlementStudentOptions() {
    if (!elements.entitlementStudent) return;
    const selectedId = state.selectedEntitlementStudentId;
    elements.entitlementStudent.replaceChildren(new Option("請選擇學生", ""));
    state.students.forEach(student => elements.entitlementStudent.append(new Option(`${student.name} · ${student.videoKey || "未有 Key"}`, student.id)));
    if (state.students.some(student => student.id === selectedId)) elements.entitlementStudent.value = selectedId;
    else {
      state.selectedEntitlementStudentId = "";
      elements.entitlementsForm.hidden = true;
    }
  }

  function showEntitlementEditor(studentId) {
    const student = state.students.find(item => item.id === studentId);
    state.selectedEntitlementStudentId = student?.id || "";
    if (!student) {
      elements.entitlementsForm.hidden = true;
      showInlineState(elements.entitlementsState, "請先選擇一位學生。", "empty");
      return;
    }
    elements.entitlementCourseList.replaceChildren();
    const enabled = new Set(student.courseCodes);
    state.adminCourses.forEach(course => {
      const label = document.createElement("label");
      label.className = "entitlement-course-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "courseCodes";
      input.value = course.id;
      input.checked = enabled.has(course.id);
      const text = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = course.title;
      const description = document.createElement("small");
      description.textContent = course.description;
      text.append(title, description);
      label.append(input, text);
      elements.entitlementCourseList.append(label);
    });
    elements.disableWatermarks.checked = !student.watermarkEnabled;
    elements.disableWatermarks.disabled = !student.videoKey;
    elements.entitlementsFormStatus.textContent = "";
    elements.entitlementsState.hidden = true;
    elements.entitlementsForm.hidden = false;
  }

  async function saveStudentEntitlements() {
    const student = state.students.find(item => item.id === state.selectedEntitlementStudentId);
    if (!student || !state.adminSession?.token) return;
    const desiredCodes = new Set(Array.from(elements.entitlementCourseList.querySelectorAll("input[name='courseCodes']:checked"), input => input.value));
    const currentCodes = new Set(student.courseCodes);
    const watermarkEnabled = !elements.disableWatermarks.checked;
    const operations = state.adminCourses
      .filter(course => desiredCodes.has(course.id) !== currentCodes.has(course.id))
      .map(course => apiRequest(`/v1/admin/students/${encodeURIComponent(student.id)}/courses/${encodeURIComponent(course.id)}`, {
        method: "PATCH",
        token: state.adminSession.token,
        body: { enabled: desiredCodes.has(course.id) }
      }));
    if (watermarkEnabled !== student.watermarkEnabled) {
      operations.push(apiRequest(`/v1/admin/students/${encodeURIComponent(student.id)}/watermark`, {
        method: "PATCH",
        token: state.adminSession.token,
        body: { enabled: watermarkEnabled }
      }));
    }
    if (!operations.length) {
      elements.entitlementsFormStatus.textContent = "設定沒有變更。";
      elements.entitlementsFormStatus.dataset.state = "success";
      return;
    }
    elements.entitlementsForm.querySelectorAll("input, button").forEach(control => { control.disabled = true; });
    elements.entitlementsFormStatus.textContent = "正在儲存課程權限⋯";
    elements.entitlementsFormStatus.dataset.state = "success";
    try {
      await Promise.all(operations);
      student.courseCodes = Array.from(desiredCodes);
      student.watermarkEnabled = watermarkEnabled;
      elements.entitlementsFormStatus.textContent = "設定已儲存。";
      showToast(`已更新 ${student.name} 的課程及水印設定。`, "success");
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      elements.entitlementsFormStatus.textContent = `${error.message} 請重新載入學生資料確認已套用的設定。`;
      elements.entitlementsFormStatus.dataset.state = "error";
    } finally {
      elements.entitlementsForm.querySelectorAll("input, button").forEach(control => { control.disabled = false; });
      elements.disableWatermarks.disabled = !student.videoKey;
    }
  }

  function renderStudentSummary() {
    elements.statTotal.textContent = String(state.students.length);
    elements.statKeyed.textContent = String(state.students.filter(student => student.videoKey).length);
    elements.statEnabled.textContent = String(state.students.filter(student => student.enabled).length);
  }

  function filteredStudents() {
    const query = String(elements.studentSearch?.value || "").trim().toLocaleLowerCase("zh-Hant");
    const filter = String(elements.keyFilter?.value || "all");
    return state.students.filter(student => {
      const haystack = `${student.name} ${student.id} ${student.videoKey}`.toLocaleLowerCase("zh-Hant");
      if (query && !haystack.includes(query)) return false;
      if (filter === "missing" && student.videoKey) return false;
      if (filter === "keyed" && !student.videoKey) return false;
      if (filter === "enabled" && !student.enabled) return false;
      if (filter === "disabled" && student.enabled) return false;
      return true;
    });
  }

  function renderStudents() {
    const students = filteredStudents();
    elements.studentRows.replaceChildren();
    elements.studentsState.hidden = true;
    elements.studentTable.hidden = false;
    elements.resultCount.hidden = false;
    elements.resultCount.textContent = `顯示 ${students.length} / ${state.students.length} 位學生`;

    if (!students.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.textContent = state.students.length ? "沒有符合搜尋條件的學生。" : "目前未有學生帳戶。";
      cell.style.padding = "42px";
      cell.style.textAlign = "center";
      cell.style.color = "#85868d";
      row.append(cell);
      elements.studentRows.append(row);
      return;
    }

    students.forEach(student => elements.studentRows.append(createStudentRow(student)));
  }

  function createStudentRow(student) {
    const row = document.createElement("tr");
    row.dataset.studentId = student.id;

    const nameCell = document.createElement("td");
    const nameWrap = document.createElement("span");
    nameWrap.className = "student-name";
    const name = document.createElement("strong");
    name.textContent = student.name;
    const account = document.createElement("small");
    account.textContent = "現有學生帳戶";
    nameWrap.append(name, account);
    nameCell.append(nameWrap);

    const idCell = document.createElement("td");
    const id = document.createElement("code");
    id.className = "uuid";
    id.textContent = student.id || "—";
    idCell.append(id);

    const keyCell = document.createElement("td");
    const key = document.createElement("code");
    key.className = `video-key${student.videoKey ? "" : " video-key--missing"}`;
    key.textContent = student.videoKey || "尚未派發 Key";
    keyCell.append(key);

    const accessCell = document.createElement("td");
    const toggleLabel = document.createElement("label");
    toggleLabel.className = "access-toggle";
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = student.enabled;
    toggle.disabled = !student.videoKey;
    toggle.setAttribute("aria-label", `${student.name} 觀看權限`);
    const track = document.createElement("span");
    track.className = "toggle-track";
    track.setAttribute("aria-hidden", "true");
    const toggleText = document.createElement("span");
    toggleText.textContent = !student.videoKey ? "未派發" : student.enabled ? "可觀看" : "已停用";
    toggle.addEventListener("change", () => updateStudentAccess(student, toggle, toggleText));
    toggleLabel.append(toggle, track, toggleText);
    accessCell.append(toggleLabel);

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "row-actions";
    const issue = document.createElement("button");
    issue.type = "button";
    issue.dataset.action = student.videoKey ? "rotate" : "issue";
    issue.textContent = student.videoKey ? "更換 Key" : "派發 Key";
    issue.addEventListener("click", () => changeStudentKey(student, student.videoKey ? "rotate" : "issue", row));
    actions.append(issue);
    const courses = document.createElement("button");
    courses.type = "button";
    courses.dataset.action = "courses";
    courses.textContent = "課程權限";
    courses.addEventListener("click", () => {
      showAdminPanel("entitlements");
      elements.entitlementStudent.value = student.id;
      showEntitlementEditor(student.id);
      elements.entitlementStudent.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    actions.append(courses);
    if (student.videoKey) {
      const clear = document.createElement("button");
      clear.type = "button";
      clear.dataset.action = "clear";
      clear.textContent = "清除";
      clear.addEventListener("click", () => changeStudentKey(student, "clear", row));
      actions.append(clear);
    }
    actionsCell.append(actions);

    row.append(nameCell, idCell, keyCell, accessCell, actionsCell);
    return row;
  }

  function setRowBusy(row, busy) {
    row.setAttribute("aria-busy", String(busy));
    row.querySelectorAll("button, input").forEach(control => { control.disabled = busy || (control.type === "checkbox" && !row.querySelector(".video-key:not(.video-key--missing)")); });
  }

  async function changeStudentKey(student, action, row) {
    if (!state.adminSession?.token || !student.id) return;
    if (action === "rotate" && !window.confirm(`確定要更換 ${student.name} 的 Video Class Key？舊 Key 會立即失效。`)) return;
    if (action === "clear" && !window.confirm(`確定要清除 ${student.name} 的 Video Class Key？該學生將不能觀看錄影班。`)) return;
    setRowBusy(row, true);
    try {
      const path = `/v1/admin/students/${encodeURIComponent(student.id)}/key`;
      if (action === "clear") {
        await apiRequest(path, { method: "DELETE", token: state.adminSession.token });
      } else {
        await apiRequest(path, {
          method: "POST",
          token: state.adminSession.token,
          body: { rotate: action === "rotate" }
        });
      }
      showToast(action === "clear" ? `已清除 ${student.name} 的 Key。` : `已${action === "rotate" ? "更換" : "派發"} ${student.name} 的 Key。`, "success");
      await loadStudents();
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      showToast(error.message, "error");
      setRowBusy(row, false);
    }
  }

  async function updateStudentAccess(student, input, label) {
    if (!state.adminSession?.token || !student.id || !student.videoKey) return;
    const enabled = input.checked;
    input.disabled = true;
    label.textContent = "更新中⋯";
    try {
      await apiRequest(`/v1/admin/students/${encodeURIComponent(student.id)}/access`, {
        method: "PATCH",
        token: state.adminSession.token,
        body: { enabled }
      });
      student.enabled = enabled;
      label.textContent = enabled ? "可觀看" : "已停用";
      renderStudentSummary();
      showToast(`已${enabled ? "啟用" : "停用"} ${student.name} 的觀看權限。`, "success");
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      input.checked = !enabled;
      label.textContent = !enabled ? "可觀看" : "已停用";
      showToast(error.message, "error");
    } finally {
      input.disabled = false;
    }
  }

  function bindLoginEvents() {
    elements.roleTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectRoleTab(tab.dataset.roleTab));
      tab.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowLeft") next = (index - 1 + elements.roleTabs.length) % elements.roleTabs.length;
        if (event.key === "ArrowRight") next = (index + 1) % elements.roleTabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = elements.roleTabs.length - 1;
        selectRoleTab(elements.roleTabs[next].dataset.roleTab, true);
      });
    });
    elements.loginForms.forEach(form => form.addEventListener("submit", event => {
      event.preventDefault();
      void handleLogin(form);
    }));
    elements.loginForms.forEach(form => {
      const role = form.dataset.loginForm;
      form.querySelector("[name='username']")?.addEventListener("input", event => {
        const turnstile = state.turnstile[role];
        if (turnstile.identifier
          && turnstile.identifier !== normalizeLoginIdentifier(event.currentTarget.value)) {
          clearTurnstile(role);
          setFormStatus(role, "");
        }
      });
    });
    elements.turnstileRetries.forEach(button => {
      button.addEventListener("click", () => {
        const role = button.dataset.turnstileRetry;
        button.hidden = true;
        destroyTurnstileWidget(role);
        void renderTurnstile(role, true);
      });
    });
    document.querySelectorAll("[data-password-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        const input = button.closest(".password-field")?.querySelector("input");
        if (!input) return;
        const showing = input.type === "text";
        input.type = showing ? "password" : "text";
        button.textContent = showing ? "顯示" : "隱藏";
        button.setAttribute("aria-label", showing ? "顯示密碼" : "隱藏密碼");
        button.setAttribute("aria-pressed", String(!showing));
      });
    });
    elements.useUniversal?.addEventListener("click", () => void exchangeUniversalSession());
  }

  function bindPortalEvents() {
    elements.logout?.addEventListener("click", () => void logout());
    elements.refreshLessons?.addEventListener("click", () => void loadLessons());
    elements.refreshStudents?.addEventListener("click", () => void loadStudents());
    elements.studentSearch?.addEventListener("input", renderStudents);
    elements.keyFilter?.addEventListener("change", renderStudents);
    elements.studentRoutes.forEach(button => button.addEventListener("click", () => showStudentPage(button.dataset.studentRoute)));
    elements.openNote?.addEventListener("click", () => openNoteDialog(state.activeLesson));
    document.querySelectorAll("[data-close-note]").forEach(button => button.addEventListener("click", closeNoteDialog));
    elements.noteDialog?.addEventListener("close", () => { state.noteLesson = null; });
    elements.noteContent?.addEventListener("input", updateNoteCount);
    elements.noteForm?.addEventListener("submit", event => {
      event.preventDefault();
      void saveLessonNote();
    });
    elements.printNotes?.addEventListener("click", () => window.print());
    elements.adminPanelTabs.forEach(button => button.addEventListener("click", () => showAdminPanel(button.dataset.adminPanelTab)));
    elements.entitlementStudent?.addEventListener("change", () => showEntitlementEditor(elements.entitlementStudent.value));
    elements.entitlementsForm?.addEventListener("submit", event => {
      event.preventDefault();
      void saveStudentEntitlements();
    });
    const markStudentActivity = () => resetStudentInactivity();
    document.addEventListener("pointerdown", markStudentActivity, { passive: true });
    document.addEventListener("keydown", markStudentActivity);
    document.addEventListener("touchstart", markStudentActivity, { passive: true });
    document.addEventListener("wheel", markStudentActivity, { passive: true });
    window.addEventListener("scroll", markStudentActivity, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && state.playback) void sendHeartbeat("hidden", true);
      if (document.visibilityState === "visible") resetStudentInactivity();
    });
    window.addEventListener("pagehide", () => {
      if (state.playback) void sendHeartbeat("pagehide", true);
    });
    document.addEventListener("fullscreenchange", () => {
      elements.fullscreen?.setAttribute("aria-label", document.fullscreenElement === elements.player ? "離開全螢幕" : "全螢幕播放");
    });
  }

  async function checkHealth() {
    if (!isApiConfigurationSafe()) {
      setConnection("offline", "服務未設定");
      return;
    }
    try {
      await apiRequest("/v1/health", { timeoutMs: 8000 });
    } catch {
      setConnection("offline", "暫時離線");
    }
  }

  async function initialise() {
    bindLoginEvents();
    bindPlayerEvents();
    bindPortalEvents();
    setConnection("checking", "正在連接");
    void checkHealth();

    const restored = await restoreSession();
    if (restored) return;
    clearHeaderIdentity();
    selectRoleTab("student");
    showView("login");
    refreshUniversalSessionOffer();
  }

  void initialise();
})();
