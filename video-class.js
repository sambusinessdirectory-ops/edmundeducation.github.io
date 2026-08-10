(function initialiseVideoClassPortal() {
  "use strict";

  const configuration = window.EDMUND_VIDEO_CLASS || {};
  const apiBase = String(configuration.apiBase || "").replace(/\/+$/, "");
  const requestTimeoutMs = Number(configuration.requestTimeoutMs) || 20000;
  const heartbeatIntervalMs = Math.max(10000, Number(configuration.heartbeatIntervalMs) || 15000);
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
    universalSession: document.querySelector("[data-universal-session]"),
    universalName: document.querySelector("[data-universal-name]"),
    useUniversal: document.querySelector("[data-use-universal-session]"),
    toast: document.querySelector("[data-toast]"),
    studentGreeting: document.querySelector("[data-student-greeting]"),
    studentKey: document.querySelector("[data-student-key]"),
    lessonsState: document.querySelector("[data-lessons-state]"),
    lessonList: document.querySelector("[data-lesson-list]"),
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
    refreshStudents: document.querySelector("[data-refresh-students]"),
    studentsState: document.querySelector("[data-students-state]"),
    studentTable: document.querySelector("[data-student-table]"),
    studentRows: document.querySelector("[data-student-rows]"),
    studentSearch: document.querySelector("[data-student-search]"),
    keyFilter: document.querySelector("[data-key-filter]"),
    resultCount: document.querySelector("[data-result-count]"),
    statTotal: document.querySelector("[data-stat-total]"),
    statKeyed: document.querySelector("[data-stat-keyed]"),
    statEnabled: document.querySelector("[data-stat-enabled]")
  };

  const state = {
    role: null,
    studentSession: null,
    adminSession: null,
    universalSession: null,
    lessons: [],
    students: [],
    activeLesson: null,
    playback: null,
    heartbeatTimer: 0,
    watermarkTimer: 0,
    watermarkClock: 0,
    controlsTimer: 0,
    toastTimer: 0,
    heartbeatInFlight: false,
    seeking: false
  };

  class ApiError extends Error {
    constructor(message, status = 0, code = "") {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.code = code;
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
        const code = String(payload?.error?.code || payload?.code || "");
        throw new ApiError(getErrorMessage(payload, response.status === 401 ? "登入已失效，請重新登入。" : "服務暫時未能完成要求。"), response.status, code);
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
    if (!submit) return;
    const label = submit.querySelector("span:first-child");
    if (label) label.textContent = busy ? "正在驗證⋯" : (form.dataset.loginForm === "admin" ? "進入管理面板" : "進入我的課堂");
  }

  function normalizedProfile(value, role) {
    const profile = value && typeof value === "object" ? value : {};
    return {
      id: String(profile.id || profile.studentId || profile.student_id || ""),
      name: String(profile.name || profile.username || profile.displayName || profile.display_name || (role === "admin" ? "管理員" : "學生")),
      videoKey: String(profile.videoKey || profile.video_key || ""),
      enabled: profile.enabled !== false && profile.accessEnabled !== false && profile.access_enabled !== false,
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
  }

  function clearHeaderIdentity() {
    state.role = null;
    elements.signedInUser.hidden = true;
    elements.signedInUser.textContent = "";
    elements.logout.hidden = true;
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
  }

  function refreshUniversalSessionOffer() {
    let candidate = null;
    try { candidate = window.EdmundSystemNav?.getStudentSession?.() || null; } catch { candidate = null; }
    state.universalSession = candidate?.role === "student" && candidate.token ? candidate : null;
    if (!elements.universalSession) return;
    elements.universalSession.hidden = !state.universalSession;
    if (state.universalSession) elements.universalName.textContent = state.universalSession.name || "已登入學生";
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

    setFormBusy(form, true);
    setFormStatus(role, "正在安全地驗證帳戶⋯", "success");
    try {
      const payload = await apiRequest(`/v1/${role}/login`, {
        method: "POST",
        body: { username, password }
      });
      const session = extractSession(payload, role);
      saveSession(role, session);
      form.reset();
      if (role === "student") {
        rememberSharedStudentSession(session);
        await enterStudentPortal(session);
      } else {
        await enterAdminPortal(session);
      }
    } catch (error) {
      const message = error.status === 401 ? "用戶名稱或密碼不正確。" : error.message;
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
    setHeaderIdentity("student", session.profile);
    elements.studentGreeting.textContent = session.profile.name || "你好";
    elements.studentKey.textContent = session.profile.videoKey || "尚未派發";
    showView("student");
    await loadLessons();
  }

  async function enterAdminPortal(session) {
    state.adminSession = session;
    setHeaderIdentity("admin", session.profile);
    showView("admin");
    await loadStudents();
  }

  async function logout() {
    const role = state.role;
    const session = role === "student" ? state.studentSession : state.adminSession;
    if (!role || !session) return;
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
    showToast("你已安全登出。", "success");
  }

  function handleExpiredSession(role) {
    if (state.role !== role) return;
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
      posterUrl: safeMediaUrl(lesson.posterUrl || lesson.poster_url || ""),
      order: Number(lesson.order || lesson.position || index + 1)
    };
  }

  function safeMediaUrl(value) {
    if (!value) return "";
    try {
      const parsed = new URL(String(value), apiBase || window.location.origin);
      if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) return "";
      return parsed.href;
    } catch {
      return "";
    }
  }

  async function loadLessons() {
    if (!state.studentSession?.token) return;
    elements.lessonList.hidden = true;
    showInlineState(elements.lessonsState, "正在載入你的課堂⋯");
    try {
      const payload = await apiRequest("/v1/lessons", { token: state.studentSession.token });
      const value = unwrap(payload);
      const rows = Array.isArray(value) ? value : (value?.lessons || value?.items || []);
      state.lessons = rows.map(normalizeLesson).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-Hant"));
      renderLessons();
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      elements.lessonList.hidden = true;
      showInlineState(elements.lessonsState, error.message, "error", loadLessons);
    }
  }

  function renderLessons() {
    elements.lessonList.replaceChildren();
    if (!state.lessons.length) {
      elements.lessonList.hidden = true;
      showInlineState(elements.lessonsState, "你的帳戶目前未有已發布課堂。新課堂上架後會在這裡顯示。", "empty");
      return;
    }

    state.lessons.forEach((lesson, index) => elements.lessonList.append(createLessonCard(lesson, index)));
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

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = lesson.completed ? "再次觀看 →" : lesson.progressPercent ? "繼續播放 →" : "開始播放 →";
    button.addEventListener("click", () => startPlayback(lesson));
    body.append(kicker, title, description, progress, button);
    article.append(art, body);
    return article;
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
    return {
      playbackToken,
      sessionId,
      videoUrl,
      expiresAt: String(grant.expiresAt || grant.expires_at || ""),
      resumeAt: lesson.completed ? 0 : Number(grant.resumeAt || grant.resume_at || grant.positionSeconds || grant.position_seconds || lesson.positionSeconds || 0),
      videoKey: String(watermark.videoKey || watermark.video_key || grant.videoKey || grant.video_key || state.studentSession?.profile?.videoKey || "已驗證學生"),
      sessionCode: String(watermark.sessionCode || watermark.session_code || grant.sessionCode || grant.session_code || sessionId.slice(-10)).toUpperCase()
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
    window.clearInterval(state.watermarkTimer);
    window.clearInterval(state.watermarkClock);
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
    window.clearInterval(state.watermarkTimer);
    window.clearInterval(state.watermarkClock);
    window.clearTimeout(state.controlsTimer);
    state.heartbeatTimer = 0;
    state.watermarkTimer = 0;
    state.watermarkClock = 0;
    state.controlsTimer = 0;
    if (elements.video) {
      elements.video.pause();
      elements.video.removeAttribute("src");
      elements.video.load();
    }
    state.playback = null;
    state.activeLesson = null;
    elements.player.removeAttribute("data-controls-hidden");
    elements.playerError.hidden = true;
    if (hideSection) {
      elements.playerSection.hidden = true;
      if (state.role === "student") void loadLessons();
    }
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
      beginHeartbeat();
      void sendHeartbeat("play");
      showControlsTemporarily();
    });
    elements.video.addEventListener("pause", () => {
      updatePlayButtons();
      window.clearInterval(state.heartbeatTimer);
      elements.player.dataset.controlsHidden = "false";
      if (state.playback && !elements.video.ended) void sendHeartbeat("pause");
    });
    elements.video.addEventListener("ended", () => {
      updatePlayButtons();
      window.clearInterval(state.heartbeatTimer);
      void sendHeartbeat("ended");
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
    return {
      id: String(student.id || student.studentId || student.student_id || ""),
      name: String(student.name || student.username || "未命名學生"),
      videoKey,
      enabled: Boolean(videoKey) && (student.enabled === true || student.accessEnabled === true || student.access_enabled === true),
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
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      showInlineState(elements.studentsState, error.message, "error", loadStudents);
    } finally {
      if (elements.refreshStudents) elements.refreshStudents.disabled = false;
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
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && state.playback) void sendHeartbeat("hidden", true);
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
