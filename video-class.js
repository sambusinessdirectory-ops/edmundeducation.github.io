(function initialiseVideoClassPortal() {
  "use strict";

  const configuration = window.EDMUND_VIDEO_CLASS || {};
  const apiBase = String(configuration.apiBase || "").replace(/\/+$/, "");
  const turnstileSiteKey = String(configuration.turnstileSiteKey || "").trim();
  const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  const requestTimeoutMs = Number(configuration.requestTimeoutMs) || 20000;
  const heartbeatIntervalMs = Math.max(10000, Number(configuration.heartbeatIntervalMs) || 15000);
  const STUDENT_INACTIVITY_MS = 30 * 60 * 1000;
  const PLAYBACK_RATES = Object.freeze([0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]);
  const PLAYBACK_RATE_STORAGE_KEY = "edmund-video-class-playback-rate-v1";
  const COURSE_CATALOG = Object.freeze([
    { id: "dse", slug: "dse", title: "DSE 中學文憑試", description: "香港中學文憑試英文課程" },
    { id: "ielts", slug: "ielts", title: "IELTS 國際英文課程", description: "IELTS 應試技巧及英語能力訓練" },
    { id: "toefl", slug: "toefl", title: "TOEFL 託福", description: "TOEFL 國際英語能力考試課程" },
    { id: "toeic", slug: "toeic", title: "TOEIC 多益", description: "TOEIC 職場英語及考試訓練" },
    { id: "pte", slug: "pte", title: "Pearson Test of English (PTE)", description: "PTE Academic 電腦化英語考試課程" },
    { id: "igcse", slug: "igcse", title: "IGCSE", description: "IGCSE 英文課程及考試準備" },
    { id: "sat", slug: "sat", title: "SAT", description: "SAT Reading and Writing 應試課程" },
    { id: "ib", slug: "ib", title: "IB 課程", description: "IB English 課程及評核準備" },
    { id: "grammar", slug: "grammar", title: "Grammar", description: "英文語法課程" }
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
    lessonSearch: document.querySelector("[data-lesson-search]"),
    clearLessonSearch: document.querySelector("[data-clear-lesson-search]"),
    lessonSearchStatus: document.querySelector("[data-lesson-search-status]"),
    lessonSummary: document.querySelector("[data-lesson-summary]"),
    bookmarksState: document.querySelector("[data-bookmarks-state]"),
    bookmarkList: document.querySelector("[data-bookmark-list]"),
    notesState: document.querySelector("[data-notes-state]"),
    notesList: document.querySelector("[data-notes-list]"),
    analyticsDashboards: Array.from(document.querySelectorAll("[data-learning-dashboard]")),
    dashboardToggles: Array.from(document.querySelectorAll("[data-dashboard-toggle]")),
    dashboardBodies: Array.from(document.querySelectorAll("[data-dashboard-body]")),
    analyticsStates: Array.from(document.querySelectorAll("[data-analytics-state]")),
    dashboardContents: Array.from(document.querySelectorAll("[data-dashboard-content]")),
    dailyWatchCharts: Array.from(document.querySelectorAll("[data-daily-watch-chart]")),
    totalWatchMinutes: Array.from(document.querySelectorAll("[data-total-watch-minutes]")),
    totalLessonsWatched: Array.from(document.querySelectorAll("[data-total-lessons-watched]")),
    exportWatchHistory: document.querySelector("[data-export-watch-history]"),
    unfinishedState: document.querySelector("[data-unfinished-state]"),
    unfinishedLessons: document.querySelector("[data-unfinished-lessons]"),
    unfinishedCount: document.querySelector("[data-unfinished-count]"),
    historyState: document.querySelector("[data-history-state]"),
    watchHistoryList: document.querySelector("[data-watch-history-list]"),
    historyCount: document.querySelector("[data-history-count]"),
    playlistsState: document.querySelector("[data-playlists-state]"),
    playlistList: document.querySelector("[data-playlist-list]"),
    playlistDetail: document.querySelector("[data-playlist-detail]"),
    playlistTitle: document.querySelector("[data-playlist-title]"),
    playlistDescription: document.querySelector("[data-playlist-description]"),
    playlistSummary: document.querySelector("[data-playlist-summary]"),
    playlistLessonsState: document.querySelector("[data-playlist-lessons-state]"),
    playlistLessonList: document.querySelector("[data-playlist-lesson-list]"),
    playlistSelectToggle: document.querySelector("[data-playlist-select-toggle]"),
    playlistRemoveSelected: document.querySelector("[data-playlist-remove-selected]"),
    createPlaylist: document.querySelector("[data-create-playlist]"),
    deletePlaylist: document.querySelector("[data-delete-playlist]"),
    playlistDialog: document.querySelector("[data-playlist-dialog]"),
    playlistChooserForm: document.querySelector("[data-playlist-chooser-form]"),
    playlistDialogLessonTitle: document.querySelector("[data-playlist-lesson-title]"),
    playlistOptions: document.querySelector("[data-playlist-options]"),
    playlistOptionsEmpty: document.querySelector("[data-playlist-options-empty]"),
    newPlaylistName: document.querySelector("[data-new-playlist-name]"),
    createPlaylistInline: document.querySelector("[data-create-playlist-inline]"),
    playlistStatus: document.querySelector("[data-playlist-status]"),
    printNotes: document.querySelector("[data-print-notes]"),
    notePanel: document.querySelector("[data-note-panel]"),
    noteForm: document.querySelector("[data-note-form]"),
    noteLessonTitle: document.querySelector("[data-note-lesson-title]"),
    noteContent: document.querySelector("[data-note-content]"),
    noteCount: document.querySelector("[data-note-count]"),
    noteStatus: document.querySelector("[data-note-status]"),
    openNote: document.querySelector("[data-open-note]"),
    noteToggleIcon: document.querySelector("[data-note-toggle-icon]"),
    refreshLessons: document.querySelector("[data-refresh-lessons]"),
    playerSection: document.querySelector("[data-player-section]"),
    playerWorkspace: document.querySelector("[data-player-workspace]"),
    player: document.querySelector("[data-player]"),
    video: document.querySelector("[data-video]"),
    playerTitle: document.querySelector("[data-player-title]"),
    playerDescription: document.querySelector("[data-player-description]"),
    playerPlaceholder: document.querySelector("[data-player-placeholder]"),
    playerControls: document.querySelector("[data-player-controls]"),
    centrePlay: document.querySelector("[data-centre-play]"),
    endedOverlay: document.querySelector("[data-ended-overlay]"),
    replayVideo: document.querySelector("[data-replay-video]"),
    openFeedback: document.querySelector("[data-open-feedback]"),
    closeFeedback: document.querySelector("[data-close-feedback]"),
    feedbackForm: document.querySelector("[data-feedback-form]"),
    feedbackRatings: Array.from(document.querySelectorAll("[data-feedback-rating]")),
    feedbackStatus: document.querySelector("[data-feedback-status]"),
    previousVideo: document.querySelector("[data-previous-video]"),
    playToggle: document.querySelector("[data-play-toggle]"),
    nextVideo: document.querySelector("[data-next-video]"),
    muteToggle: document.querySelector("[data-mute-toggle]"),
    seek: document.querySelector("[data-seek]"),
    seekMarkers: document.querySelector("[data-seek-markers]"),
    pinClip: document.querySelector("[data-pin-clip]"),
    clipRail: document.querySelector("[data-clip-rail]"),
    clipRailToggle: document.querySelector("[data-clip-rail-toggle]"),
    clipRailPanel: document.querySelector("[data-clip-rail-panel]"),
    clipList: document.querySelector("[data-clip-list]"),
    clipCount: document.querySelector("[data-clip-count]"),
    clipsEmpty: document.querySelector("[data-clips-empty]"),
    clipEditor: document.querySelector("[data-clip-editor]"),
    clipSelectedTime: document.querySelector("[data-clip-selected-time]"),
    clipTitle: document.querySelector("[data-clip-title]"),
    clipStatus: document.querySelector("[data-clip-status]"),
    volume: document.querySelector("[data-volume]"),
    currentTime: document.querySelector("[data-current-time]"),
    duration: document.querySelector("[data-duration]"),
    fullscreen: document.querySelector("[data-fullscreen]"),
    playbackSpeed: document.querySelector("[data-playback-speed]"),
    playbackQuality: document.querySelector("[data-playback-quality]"),
    closePlayer: document.querySelector("[data-close-player]"),
    playerViewCount: document.querySelector("[data-player-view-count]"),
    playerError: document.querySelector("[data-player-error]"),
    mobileSeekZones: Array.from(document.querySelectorAll("[data-mobile-seek-zone]")),
    seekFeedback: document.querySelector("[data-seek-feedback]"),
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
    entitlementsFormStatus: document.querySelector("[data-entitlements-form-status]"),
    refreshFeedback: document.querySelector("[data-refresh-feedback]"),
    feedbackSearch: document.querySelector("[data-feedback-search]"),
    feedbackCourseFilter: document.querySelector("[data-feedback-course-filter]"),
    adminFeedbackState: document.querySelector("[data-feedback-state]"),
    adminFeedbackTable: document.querySelector("[data-feedback-table]"),
    feedbackRows: document.querySelector("[data-feedback-rows]"),
    feedbackResultCount: document.querySelector("[data-feedback-result-count]"),
    exportFeedback: document.querySelector("[data-export-feedback]"),
    adminLessonsRefresh: document.querySelector("[data-admin-lessons-refresh]"),
    adminLessonsState: document.querySelector("[data-admin-lessons-state]"),
    adminLessonsTable: document.querySelector("[data-admin-lessons-table]"),
    adminLessonsRows: document.querySelector("[data-admin-lessons-rows]"),
    r2Refresh: document.querySelector("[data-r2-refresh]"),
    r2Search: document.querySelector("[data-r2-search]"),
    r2State: document.querySelector("[data-r2-state]"),
    r2List: document.querySelector("[data-r2-list]"),
    r2LoadMore: document.querySelector("[data-r2-load-more]"),
    r2UploadForm: document.querySelector("[data-r2-upload-form]"),
    r2UploadFile: document.querySelector("[data-r2-upload-file]"),
    r2UploadMeta: document.querySelector("[data-r2-upload-meta]"),
    r2UploadStart: document.querySelector("[data-r2-upload-start]"),
    r2UploadCancel: document.querySelector("[data-r2-upload-cancel]"),
    r2UploadProgress: document.querySelector("[data-r2-upload-progress]"),
    r2UploadProgressLabel: document.querySelector("[data-r2-upload-progress-label]"),
    r2UploadProgressPercent: document.querySelector("[data-r2-upload-progress-percent]"),
    r2UploadProgressBar: document.querySelector("[data-r2-upload-progress-bar]"),
    r2UploadStatus: document.querySelector("[data-r2-upload-status]"),
    r2PublishDialog: document.querySelector("[data-r2-publish-dialog]"),
    r2PublishForm: document.querySelector("[data-r2-publish-form]"),
    r2PublishObject: document.querySelector("[data-r2-publish-object]"),
    r2PublishTitle: document.querySelector("[data-r2-publish-title]"),
    r2PublishCourse: document.querySelector("[data-r2-publish-course]"),
    r2PublishDescription: document.querySelector("[data-r2-publish-description]"),
    r2PublishDuration: document.querySelector("[data-r2-publish-duration]"),
    r2PublishTags: document.querySelector("[data-r2-publish-tags]"),
    r2PublishStatus: document.querySelector("[data-r2-publish-status]"),
    r2PublishSubmit: document.querySelector("[data-r2-publish-submit]"),
    availableStudentsRefresh: document.querySelector("[data-available-students-refresh]"),
    availableStudentsSearch: document.querySelector("[data-available-students-search]"),
    availableStudentsState: document.querySelector("[data-available-students-state]"),
    availableStudentsList: document.querySelector("[data-available-students-list]")
  };

  const state = {
    role: null,
    studentSession: null,
    adminSession: null,
    universalSession: null,
    courses: COURSE_CATALOG.map(course => ({ ...course, entitled: false, lessonCount: 0 })),
    adminCourses: COURSE_CATALOG.map((course, index) => ({ ...course, order: index + 1 })),
    lessons: [],
    analytics: {
      summary: { totalWatchedSeconds: 0, totalLessonsWatched: 0 },
      daily: [],
      unfinished: [],
      history: []
    },
    analyticsLoaded: false,
    analyticsGeneration: 0,
    dashboardExpanded: { library: true, progress: true },
    playlists: [],
    officialPlaylists: [],
    students: [],
    adminFeedback: [],
    adminLessons: [],
    adminR2Items: [],
    adminR2Cursor: "",
    adminR2Truncated: false,
    adminR2Query: "",
    adminR2SearchTimer: 0,
    adminR2FileDuration: 0,
    adminR2Upload: null,
    adminR2PublishItem: null,
    selectedCourseId: "",
    selectedPlaylistId: "",
    playlistSelectionMode: false,
    playlistSelectionPlaylistId: "",
    playlistSelectedLessonIds: new Set(),
    playlistLesson: null,
    libraryQuery: "",
    noteLesson: null,
    thumbnailUrls: new Map(),
    lessonLoadGeneration: 0,
    selectedEntitlementStudentId: "",
    activeLesson: null,
    playbackSequenceLessonIds: [],
    playbackSequenceType: "course",
    playbackSequencePlaylistId: "",
    playback: null,
    playbackRate: readPlaybackRate(),
    qualitySwitch: null,
    clipMode: false,
    clipPosition: null,
    clipWasPlaying: false,
    feedbackSaveGeneration: 0,
    feedbackSaveTimer: 0,
    feedbackWasPlaying: false,
    feedbackReturnFocus: null,
    heartbeatTimer: 0,
    watermarkTimer: 0,
    watermarkClock: 0,
    companyWatermarkTimer: 0,
    companyWatermarkHideTimer: 0,
    companyWatermarkCornerIndex: 0,
    inactivityTimer: 0,
    controlsTimer: 0,
    mobileTapTimer: 0,
    mobileTapSide: "",
    mobileTapAt: 0,
    seekFeedbackTimer: 0,
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

  function readPlaybackRate() {
    try {
      const rate = Number(window.localStorage.getItem(PLAYBACK_RATE_STORAGE_KEY));
      return PLAYBACK_RATES.includes(rate) ? rate : 1;
    } catch {
      return 1;
    }
  }

  function savePlaybackRate(rate) {
    try { window.localStorage.setItem(PLAYBACK_RATE_STORAGE_KEY, String(rate)); } catch { /* Preference storage is optional. */ }
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
    if (options.body !== undefined && options.rawBody !== undefined) throw new ApiError("要求內容格式無效。", 0, "INVALID_REQUEST_BODY");
    const controller = new AbortController();
    const abortFromExternalSignal = () => controller.abort(options.signal?.reason);
    if (options.signal?.aborted) abortFromExternalSignal();
    else options.signal?.addEventListener("abort", abortFromExternalSignal, { once: true });
    const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs || requestTimeoutMs);
    const headers = new Headers({ Accept: "application/json" });
    if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
    if (options.body !== undefined) headers.set("Content-Type", "application/json");
    if (options.headers && typeof options.headers === "object") {
      new Headers(options.headers).forEach((value, name) => headers.set(name, value));
    }

    try {
      const response = await fetch(`${apiBase}${path}`, {
        method: options.method || "GET",
        headers,
        body: options.rawBody !== undefined
          ? options.rawBody
          : (options.body === undefined ? undefined : JSON.stringify(options.body)),
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
      options.signal?.removeEventListener("abort", abortFromExternalSignal);
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
    if (role === "student") {
      revokeThumbnailUrls();
      state.studentSession = null;
      state.lessons = [];
      state.playlists = [];
      state.officialPlaylists = [];
    }
    else {
      state.adminR2Upload?.controller?.abort();
      window.clearTimeout(state.adminR2SearchTimer);
      state.adminR2SearchTimer = 0;
      state.adminR2Upload = null;
      state.adminR2PublishItem = null;
      state.adminSession = null;
    }
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
      if (turnstile.generation === generation && !turnstile.token) {
        setTurnstileStatus(role, "請完成安全驗證。", "");
      }
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
    state.analytics = {
      summary: { totalWatchedSeconds: 0, totalLessonsWatched: 0 },
      daily: [],
      unfinished: [],
      history: []
    };
    state.analyticsLoaded = false;
    state.playbackSequenceLessonIds = [];
    state.playbackSequenceType = "course";
    state.playbackSequencePlaylistId = "";
    state.courses = COURSE_CATALOG.map(course => ({ ...course, entitled: false, lessonCount: 0 }));
    resetDashboardExpansion();
    setHeaderIdentity("student", session.profile);
    elements.studentGreeting.textContent = session.profile.name || "你好";
    elements.studentKey.textContent = session.profile.videoKey || "尚未派發";
    showView("student");
    resetStudentInactivity();
    await loadLessons();
    void loadAnalytics();
    showStudentPage("courses");
    resetStudentInactivity();
  }

  async function enterAdminPortal(session) {
    state.adminSession = session;
    state.selectedEntitlementStudentId = "";
    state.students = [];
    state.adminLessons = [];
    state.adminR2Items = [];
    state.adminR2Cursor = "";
    state.adminR2Truncated = false;
    state.adminR2Query = "";
    state.adminR2SearchTimer = 0;
    state.adminR2FileDuration = 0;
    state.adminR2Upload = null;
    state.adminR2PublishItem = null;
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
    if (name !== "library" && state.activeLesson && !closePlayer({ saveProgress: true })) return;
    elements.studentPages.forEach(page => { page.hidden = page.dataset.studentPage !== name; });
    elements.studentRoutes.forEach(button => {
      if (button.dataset.studentRoute === name) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (name === "courses") renderCourses();
    if (name === "library") renderLessons();
    if (name === "bookmarks") renderBookmarks();
    if (name === "playlists") renderPlaylists();
    if (name === "notes") renderNotes();
    if (name === "progress") {
      if (state.analyticsLoaded) {
        renderAnalyticsDashboards();
        renderAnalyticsProgress();
      }
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function showAdminPanel(name) {
    elements.adminPanels.forEach(panel => { panel.hidden = panel.dataset.adminPanel !== name; });
    elements.adminPanelTabs.forEach(button => {
      if (button.dataset.adminPanelTab === name) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (name === "feedback") void loadAdminFeedback();
    if (name === "lessons") void loadAdminLessons();
    if (name === "r2") void loadAdminR2Objects();
    if (name === "add-student") renderAvailableStudents();
  }

  async function logout({ automatic = false } = {}) {
    const role = state.role;
    const session = role === "student" ? state.studentSession : state.adminSession;
    if (!role || !session) return;
    state.isLoggingOut = true;
    suspendStudentInactivity();
    elements.logout.disabled = true;
    if (role === "student" && !closePlayer({ saveProgress: true, confirmUnsavedNote: !automatic })) {
      elements.logout.disabled = false;
      state.isLoggingOut = false;
      resetStudentInactivity();
      return;
    }
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
    if (role === "student") closePlayer({ saveProgress: false, confirmUnsavedNote: false });
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
    const rawTags = Array.isArray(lesson.tags) ? lesson.tags : (Array.isArray(lesson.tagLabels || lesson.tag_labels) ? (lesson.tagLabels || lesson.tag_labels) : []);
    const tags = rawTags.map(tag => String(typeof tag === "object" ? (tag.label || tag.name || "") : tag).trim()).filter(Boolean);
    const officialPlaylistNames = (Array.isArray(lesson.officialPlaylistNames || lesson.official_playlist_names) ? (lesson.officialPlaylistNames || lesson.official_playlist_names) : []).map(String);
    const playlistIds = (Array.isArray(lesson.playlistIds || lesson.playlist_ids) ? (lesson.playlistIds || lesson.playlist_ids) : []).map(String);
    const clips = (Array.isArray(lesson.clips) ? lesson.clips : []).map(normalizeClip).filter(clip => clip.id).sort((a, b) => a.positionSeconds - b.positionSeconds);
    const renditions = (Array.isArray(lesson.renditions) ? lesson.renditions : []).map(normalizeRendition).filter(rendition => rendition.qualityCode);
    const rawFeedback = lesson.feedback && typeof lesson.feedback === "object" ? lesson.feedback : lesson;
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
      hasThumbnail: lesson.hasThumbnail === true || lesson.has_thumbnail === true,
      isPrivate: lesson.isPrivate === true || lesson.is_private === true,
      order: Number(lesson.order || lesson.position || index + 1),
      courseId: String(lesson.courseCode || lesson.course_code || lesson.courseId || lesson.course_id || course.code || course.id || "dse").toLowerCase(),
      courseTitle: String(lesson.courseTitle || lesson.course_title || course.title || ""),
      bookmarked: lesson.bookmarked === true || lesson.isBookmarked === true || lesson.is_bookmarked === true,
      tags,
      officialPlaylistNames,
      playlistIds,
      clips,
      renditions,
      viewCount: Math.max(0, Number(lesson.viewCount || lesson.view_count || 0)),
      feedback: normalizeLessonFeedback(rawFeedback),
      note: String(noteValue || ""),
      noteUpdatedAt: String(lesson.noteUpdatedAt || lesson.note_updated_at || (typeof lesson.note === "object" ? (lesson.note.updatedAt || lesson.note.updated_at || "") : ""))
    };
  }

  function normalizeClip(value) {
    const clip = value && typeof value === "object" ? value : {};
    return {
      id: String(clip.id || clip.clipId || clip.clip_id || ""),
      lessonId: String(clip.lessonId || clip.lesson_id || ""),
      title: String(clip.title || clip.displayTitle || clip.display_title || ""),
      positionSeconds: Math.max(0, Number(clip.positionSeconds || clip.position_seconds || 0)),
      clipNumber: Math.max(0, Number(clip.clipNumber || clip.clip_number || 0)),
      createdAt: String(clip.createdAt || clip.created_at || "")
    };
  }

  function normalizeRendition(value) {
    const rendition = value && typeof value === "object" ? value : {};
    const qualityCode = String(rendition.qualityCode || rendition.quality_code || rendition.code || "");
    return {
      qualityCode: ["480p", "720p", "1080p", "max"].includes(qualityCode) ? qualityCode : "",
      label: String(rendition.label || rendition.displayLabel || rendition.display_label || qualityCode),
      height: Math.max(0, Number(rendition.height || rendition.heightPixels || rendition.height_pixels || 0)),
      isDefault: rendition.isDefault === true || rendition.is_default === true,
      url: safePlaybackUrl(rendition.url || "")
    };
  }

  function normalizeLessonFeedback(value) {
    const feedback = value && typeof value === "object" ? value : {};
    const rating = input => {
      const number = Number(input);
      return Number.isInteger(number) && number >= 1 && number <= 5 ? number : null;
    };
    return {
      pictureQuality: rating(feedback.pictureQuality ?? feedback.picture_quality ?? feedback.videoQuality ?? feedback.video_quality),
      explanationQuality: rating(feedback.explanationQuality ?? feedback.explanation_quality ?? feedback.explanation),
      audioQuality: rating(feedback.audioQuality ?? feedback.audio_quality ?? feedback.soundQuality ?? feedback.sound_quality),
      updatedAt: String(feedback.updatedAt || feedback.updated_at || feedback.feedbackUpdatedAt || feedback.feedback_updated_at || "")
    };
  }

  function normalizePlaylist(value) {
    const playlist = value && typeof value === "object" ? value : {};
    return {
      id: String(playlist.id || playlist.playlistId || playlist.playlist_id || ""),
      name: String(playlist.name || playlist.title || "未命名播放列表"),
      lessonIds: (Array.isArray(playlist.lessonIds || playlist.lesson_ids) ? (playlist.lessonIds || playlist.lesson_ids) : []).map(String),
      lessonCount: Math.max(0, Number(playlist.lessonCount || playlist.lesson_count || 0)),
      createdAt: String(playlist.createdAt || playlist.created_at || ""),
      updatedAt: String(playlist.updatedAt || playlist.updated_at || "")
    };
  }

  function normalizeOfficialPlaylist(value) {
    const playlist = value && typeof value === "object" ? value : {};
    return {
      id: String(playlist.id || playlist.playlistId || playlist.playlist_id || ""),
      name: String(playlist.name || playlist.title || ""),
      description: String(playlist.description || ""),
      courseId: String(playlist.courseCode || playlist.course_code || ""),
      lessonIds: (Array.isArray(playlist.lessonIds || playlist.lesson_ids) ? (playlist.lessonIds || playlist.lesson_ids) : []).map(String)
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

  function normalizeAnalyticsLesson(value, index = 0) {
    const item = value && typeof value === "object" ? value : {};
    const lesson = item.lesson && typeof item.lesson === "object" ? item.lesson : item;
    const progress = item.progress && typeof item.progress === "object" ? item.progress : item;
    const durationSeconds = Math.max(0, Number(item.durationSeconds ?? item.duration_seconds ?? lesson.durationSeconds ?? lesson.duration_seconds ?? 0) || 0);
    const positionSeconds = Math.max(0, Number(item.positionSeconds ?? item.position_seconds ?? progress.positionSeconds ?? progress.position_seconds ?? 0) || 0);
    const completed = item.completed === true || progress.completed === true;
    const explicitPercent = Number(item.progressPercent ?? item.progress_percent ?? progress.progressPercent ?? progress.progress_percent);
    const progressPercent = completed
      ? 100
      : Number.isFinite(explicitPercent)
        ? Math.min(100, Math.max(0, Math.round(explicitPercent)))
        : durationSeconds > 0
          ? Math.min(100, Math.max(0, Math.round((positionSeconds / durationSeconds) * 100)))
          : 0;
    return {
      id: String(item.lessonId || item.lesson_id || lesson.id || lesson.lessonId || lesson.lesson_id || ""),
      title: String(item.title || lesson.title || lesson.name || `課堂 ${index + 1}`),
      description: String(item.description || lesson.description || lesson.summary || ""),
      courseId: String(item.courseCode || item.course_code || item.courseId || item.course_id || lesson.courseCode || lesson.course_code || lesson.courseId || lesson.course_id || "dse").toLowerCase(),
      courseTitle: String(item.courseTitle || item.course_title || lesson.courseTitle || lesson.course_title || ""),
      durationSeconds,
      positionSeconds,
      watchedSeconds: Math.max(0, Number(item.watchedSeconds ?? item.watched_seconds ?? progress.watchedSeconds ?? progress.watched_seconds ?? positionSeconds) || 0),
      completed,
      progressPercent,
      viewCount: Math.max(0, Number(item.viewCount ?? item.view_count ?? progress.viewCount ?? progress.view_count ?? 0) || 0),
      lastWatchedAt: String(item.lastWatchedAt || item.last_watched_at || item.lastViewedAt || item.last_viewed_at || item.updatedAt || item.updated_at || progress.lastWatchedAt || progress.last_watched_at || progress.lastViewedAt || progress.last_viewed_at || progress.updatedAt || progress.updated_at || ""),
      isPrivate: item.isPrivate === true || item.is_private === true || lesson.isPrivate === true || lesson.is_private === true
    };
  }

  function normalizeAnalytics(value) {
    const analytics = value && typeof value === "object" ? value : {};
    const summary = analytics.summary && typeof analytics.summary === "object" ? analytics.summary : {};
    const rawDaily = analytics.daily || analytics.dailyCounts || analytics.daily_counts;
    const dailyRows = Array.isArray(rawDaily) ? rawDaily : [];
    const daily = dailyRows.map(item => ({
      date: String(item?.date || item?.watchDate || item?.watch_date || ""),
      videosWatched: Math.max(0, Number(item?.videosWatched ?? item?.videos_watched ?? item?.lessonCount ?? item?.lesson_count ?? 0) || 0),
      watchedSeconds: Math.max(0, Number(item?.watchedSeconds ?? item?.watched_seconds ?? 0) || 0)
    })).filter(item => item.date).sort((a, b) => a.date.localeCompare(b.date));
    const unfinishedRows = Array.isArray(analytics.unfinished) ? analytics.unfinished : [];
    const historyRows = Array.isArray(analytics.history) ? analytics.history : [];
    const unfinished = unfinishedRows.map(normalizeAnalyticsLesson).filter(item => item.id && !item.completed);
    const history = historyRows.map(normalizeAnalyticsLesson).filter(item => item.id).sort((a, b) => Date.parse(b.lastWatchedAt || 0) - Date.parse(a.lastWatchedAt || 0));
    const inferredSeconds = daily.reduce((total, item) => total + item.watchedSeconds, 0);
    const inferredLessons = new Set(history.map(item => item.id)).size;
    return {
      summary: {
        totalWatchedSeconds: Math.max(0, Number(summary.totalWatchedSeconds ?? summary.total_watched_seconds ?? inferredSeconds) || 0),
        totalLessonsWatched: Math.max(0, Number(summary.totalLessonsWatched ?? summary.total_lessons_watched ?? summary.watchedVideoCount ?? summary.watched_video_count ?? inferredLessons) || 0)
      },
      daily,
      unfinished,
      history
    };
  }

  function formatWatchMinutes(seconds) {
    const minutes = Math.max(0, Number(seconds) || 0) / 60;
    if (minutes > 0 && minutes < 1) return "<1";
    if (minutes < 10 && !Number.isInteger(minutes)) return minutes.toFixed(1);
    return Math.round(minutes).toLocaleString("zh-HK");
  }

  function formatWatchDate(value, { includeTime = false } = {}) {
    const raw = String(value || "");
    if (!raw) return "日期未記錄";
    const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return new Intl.DateTimeFormat("zh-HK", includeTime
      ? { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }
      : { month: "2-digit", day: "2-digit" }
    ).format(date);
  }

  function setDashboardExpanded(scope, expanded) {
    if (!Object.prototype.hasOwnProperty.call(state.dashboardExpanded, scope)) return;
    state.dashboardExpanded[scope] = expanded;
    const toggle = elements.dashboardToggles.find(item => item.dataset.dashboardToggle === scope);
    const body = elements.dashboardBodies.find(item => item.dataset.dashboardBody === scope);
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(expanded));
      const label = toggle.querySelector("[data-dashboard-toggle-label]");
      if (label) label.textContent = expanded ? "收合" : "展開";
    }
    if (body) body.hidden = !expanded;
  }

  function resetDashboardExpansion() {
    state.dashboardExpanded = { library: true, progress: true };
    Object.entries(state.dashboardExpanded).forEach(([scope, expanded]) => setDashboardExpanded(scope, expanded));
  }

  function renderDailyWatchChart(chart, rows) {
    chart.replaceChildren();
    const recentRows = rows.slice(-7);
    if (!recentRows.length) {
      const empty = document.createElement("p");
      empty.className = "daily-watch-chart__empty";
      empty.textContent = "開始觀看課堂後，日期記錄會顯示在這裡。";
      chart.append(empty);
      return;
    }
    const maximum = Math.max(1, ...recentRows.map(item => item.videosWatched));
    recentRows.forEach(item => {
      const row = document.createElement("div");
      row.className = "daily-watch-row";
      const date = document.createElement("time");
      date.dateTime = item.date;
      date.textContent = formatWatchDate(item.date);
      const track = document.createElement("span");
      track.className = "daily-watch-row__track";
      const fill = document.createElement("span");
      fill.style.setProperty("--daily-width", `${Math.max(4, (item.videosWatched / maximum) * 100)}%`);
      track.append(fill);
      const value = document.createElement("strong");
      value.textContent = `${item.videosWatched} 部`;
      row.title = `${formatWatchDate(item.date)}：觀看 ${item.videosWatched} 部影片，共 ${formatWatchMinutes(item.watchedSeconds)} 分鐘`;
      row.append(date, track, value);
      chart.append(row);
    });
  }

  function renderAnalyticsDashboards() {
    elements.dailyWatchCharts.forEach(chart => renderDailyWatchChart(chart, state.analytics.daily));
    elements.totalWatchMinutes.forEach(element => { element.textContent = formatWatchMinutes(state.analytics.summary.totalWatchedSeconds); });
    elements.totalLessonsWatched.forEach(element => { element.textContent = state.analytics.summary.totalLessonsWatched.toLocaleString("zh-HK"); });
    elements.analyticsStates.forEach(element => { element.hidden = true; });
    elements.dashboardContents.forEach(element => { element.hidden = false; });
  }

  function analyticsCourseLabel(item) {
    return item.courseTitle || state.courses.find(course => course.id === item.courseId)?.title || item.courseId.toUpperCase();
  }

  function openAnalyticsLesson(item) {
    const lesson = state.lessons.find(candidate => candidate.id === item.id) || normalizeLesson({
      id: item.id,
      title: item.title,
      description: item.description,
      courseCode: item.courseId,
      courseTitle: item.courseTitle,
      durationSeconds: item.durationSeconds,
      positionSeconds: item.positionSeconds,
      completed: item.completed,
      isPrivate: item.isPrivate,
      viewCount: item.viewCount
    }, 0);
    openLesson(lesson, { type: "course" });
  }

  function renderAnalyticsProgress() {
    const unfinished = state.analytics.unfinished;
    elements.unfinishedCount.textContent = `${unfinished.length} 部待完成`;
    elements.unfinishedLessons.replaceChildren();
    if (!unfinished.length) {
      elements.unfinishedLessons.hidden = true;
      showInlineState(elements.unfinishedState, "目前沒有未完成影片。完成新課堂後，觀看記錄仍會保留在下方。", "empty");
    } else {
      unfinished.forEach(item => {
        const article = document.createElement("article");
        article.className = "unfinished-card";
        const progress = document.createElement("div");
        progress.className = "unfinished-card__progress";
        progress.style.setProperty("--progress", `${item.progressPercent}%`);
        const percent = document.createElement("strong");
        percent.textContent = `${item.progressPercent}%`;
        progress.append(percent);
        const body = document.createElement("div");
        body.className = "unfinished-card__body";
        const course = document.createElement("span");
        course.textContent = analyticsCourseLabel(item);
        const title = document.createElement("h3");
        title.textContent = item.title;
        const position = document.createElement("p");
        position.textContent = `${formatDuration(item.positionSeconds)} / ${item.durationSeconds ? formatDuration(item.durationSeconds) : "—"}`;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = item.isPrivate ? "影片為私人" : "繼續播放 →";
        button.addEventListener("click", () => openAnalyticsLesson(item));
        body.append(course, title, position, button);
        article.append(progress, body);
        elements.unfinishedLessons.append(article);
      });
      elements.unfinishedState.hidden = true;
      elements.unfinishedLessons.hidden = false;
    }

    const history = state.analytics.history;
    elements.historyCount.textContent = `${history.length} 項記錄`;
    elements.watchHistoryList.replaceChildren();
    if (!history.length) {
      elements.watchHistoryList.hidden = true;
      showInlineState(elements.historyState, "你尚未有觀看記錄。選擇一堂影片開始學習吧。", "empty");
    } else {
      history.forEach(item => {
        const row = document.createElement("li");
        row.className = "watch-history-item";
        const date = document.createElement("time");
        date.dateTime = item.lastWatchedAt;
        date.textContent = formatWatchDate(item.lastWatchedAt, { includeTime: true });
        const lesson = document.createElement("div");
        lesson.className = "watch-history-item__lesson";
        const title = document.createElement("strong");
        title.textContent = item.title;
        const course = document.createElement("small");
        course.textContent = `${analyticsCourseLabel(item)} · 累積 ${formatWatchMinutes(item.watchedSeconds)} 分鐘`;
        lesson.append(title, course);
        const progress = document.createElement("div");
        progress.className = "watch-history-item__progress";
        const meta = document.createElement("span");
        const status = document.createElement("span");
        status.textContent = item.completed ? "已完成" : "觀看進度";
        const percent = document.createElement("strong");
        percent.textContent = `${item.progressPercent}%`;
        meta.append(status, percent);
        const track = document.createElement("div");
        track.className = "watch-history-item__track";
        const fill = document.createElement("span");
        fill.style.setProperty("--progress", `${item.progressPercent}%`);
        track.append(fill);
        progress.append(meta, track);
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = item.isPrivate ? "查看狀態" : item.completed ? "再次觀看 →" : "繼續播放 →";
        button.addEventListener("click", () => openAnalyticsLesson(item));
        row.append(date, lesson, progress, button);
        elements.watchHistoryList.append(row);
      });
      elements.historyState.hidden = true;
      elements.watchHistoryList.hidden = false;
    }
    elements.exportWatchHistory.disabled = history.length === 0;
  }

  async function loadAnalytics() {
    if (!state.studentSession?.token) return;
    const token = state.studentSession.token;
    const generation = ++state.analyticsGeneration;
    state.analyticsLoaded = false;
    elements.analyticsStates.forEach(element => showInlineState(element, "正在整理你的學習記錄⋯"));
    elements.dashboardContents.forEach(element => { element.hidden = true; });
    showInlineState(elements.unfinishedState, "正在載入未完成影片⋯");
    showInlineState(elements.historyState, "正在載入觀看記錄⋯");
    try {
      const payload = await apiRequest("/v1/analytics", { token });
      if (generation !== state.analyticsGeneration || token !== state.studentSession?.token) return;
      state.analytics = normalizeAnalytics(unwrap(payload));
      state.analyticsLoaded = true;
      renderAnalyticsDashboards();
      renderAnalyticsProgress();
    } catch (error) {
      if (generation !== state.analyticsGeneration || token !== state.studentSession?.token) return;
      if (error.status === 401) return handleExpiredSession("student");
      state.analyticsLoaded = false;
      elements.analyticsStates.forEach(element => showInlineState(element, error.message, "error", loadAnalytics));
      showInlineState(elements.unfinishedState, error.message, "error", loadAnalytics);
      showInlineState(elements.historyState, error.message, "error", loadAnalytics);
      elements.unfinishedLessons.hidden = true;
      elements.watchHistoryList.hidden = true;
      elements.exportWatchHistory.disabled = true;
    }
  }

  function csvCell(value) {
    let text = String(value ?? "");
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }

  function exportWatchHistoryCsv() {
    if (!state.analytics.history.length) return;
    const headings = ["觀看日期", "課程", "影片標題", "觀看進度 (%)", "累積觀看分鐘", "目前位置", "影片長度", "狀態"];
    const rows = state.analytics.history.map(item => [
      formatWatchDate(item.lastWatchedAt, { includeTime: true }),
      analyticsCourseLabel(item),
      item.title,
      item.progressPercent,
      (item.watchedSeconds / 60).toFixed(2),
      formatDuration(item.positionSeconds),
      item.durationSeconds ? formatDuration(item.durationSeconds) : "",
      item.completed ? "已完成" : "未完成"
    ]);
    const csv = `\ufeff${[headings, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `EdmundEducation-觀看記錄-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    const token = state.studentSession.token;
    const generation = ++state.lessonLoadGeneration;
    elements.lessonList.hidden = true;
    elements.courseList.hidden = true;
    showInlineState(elements.lessonsState, "正在載入你的課堂⋯");
    showInlineState(elements.coursesState, "正在載入你的課程⋯");
    try {
      const payload = await apiRequest("/v1/lessons", { token });
      if (generation !== state.lessonLoadGeneration || token !== state.studentSession?.token) return;
      const value = unwrap(payload);
      const rows = Array.isArray(value) ? value : (value?.lessons || value?.items || []);
      state.lessons = rows.map(normalizeLesson).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-Hant"));
      state.playlists = (Array.isArray(value?.playlists) ? value.playlists : []).map(normalizePlaylist).filter(playlist => playlist.id);
      state.officialPlaylists = (Array.isArray(value?.officialPlaylists || value?.official_playlists) ? (value.officialPlaylists || value.official_playlists) : []).map(normalizeOfficialPlaylist).filter(playlist => playlist.id);
      state.playlists.forEach(playlist => playlist.lessonIds.forEach(lessonId => {
        const lesson = state.lessons.find(item => item.id === lessonId);
        if (lesson && !lesson.playlistIds.includes(playlist.id)) lesson.playlistIds.push(playlist.id);
      }));
      state.officialPlaylists.forEach(playlist => playlist.lessonIds.forEach(lessonId => {
        const lesson = state.lessons.find(item => item.id === lessonId);
        if (lesson && playlist.name && !lesson.officialPlaylistNames.includes(playlist.name)) lesson.officialPlaylistNames.push(playlist.name);
      }));
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
      renderPlaylists();
      renderNotes();
      void loadLessonThumbnails(token, generation);
    } catch (error) {
      if (generation !== state.lessonLoadGeneration || token !== state.studentSession?.token) return;
      if (error.status === 401) return handleExpiredSession("student");
      elements.lessonList.hidden = true;
      showInlineState(elements.lessonsState, error.message, "error", loadLessons);
      showInlineState(elements.coursesState, error.message, "error", loadLessons);
    }
  }

  function revokeThumbnailUrls() {
    state.lessons.forEach(lesson => {
      if (state.thumbnailUrls.get(lesson.id) === lesson.posterUrl) lesson.posterUrl = "";
    });
    state.thumbnailUrls.forEach(url => {
      try { URL.revokeObjectURL(url); } catch { /* Object URL may already be gone. */ }
    });
    state.thumbnailUrls.clear();
  }

  async function loadLessonThumbnails(token, generation) {
    if (!token || token !== state.studentSession?.token || generation !== state.lessonLoadGeneration) return;
    revokeThumbnailUrls();
    const lessons = state.lessons.filter(lesson => lesson.hasThumbnail && !lesson.isPrivate && lesson.id);
    await Promise.all(lessons.map(async lesson => {
      try {
        const response = await fetch(`${apiBase}/v1/lessons/${encodeURIComponent(lesson.id)}/thumbnail`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "image/avif,image/webp,image/jpeg,image/png" },
          cache: "no-store",
          credentials: "omit",
          referrerPolicy: "no-referrer"
        });
        if (!response.ok || token !== state.studentSession?.token || generation !== state.lessonLoadGeneration) return;
        const contentType = String(response.headers.get("Content-Type") || "").toLowerCase();
        if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(contentType)) return;
        const blob = await response.blob();
        if (!blob.size || blob.size > 10 * 1024 * 1024 || token !== state.studentSession?.token || generation !== state.lessonLoadGeneration) return;
        const objectUrl = URL.createObjectURL(blob);
        if (generation !== state.lessonLoadGeneration || token !== state.studentSession?.token || !state.lessons.includes(lesson)) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        state.thumbnailUrls.set(lesson.id, objectUrl);
        lesson.posterUrl = objectUrl;
      } catch { /* A missing thumbnail must not block the lesson library. */ }
    }));
    if (token !== state.studentSession?.token || generation !== state.lessonLoadGeneration) return;
    renderLessons();
    renderBookmarks();
    renderPlaylists();
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
    state.libraryQuery = "";
    if (elements.lessonSearch) elements.lessonSearch.value = "";
    if (elements.clearLessonSearch) elements.clearLessonSearch.hidden = true;
    elements.selectedCourseTitle.textContent = course.title;
    elements.selectedCourseDescription.textContent = course.description;
    showStudentPage("library");
  }

  function renderLessons() {
    elements.lessonList.replaceChildren();
    const courseLessons = state.selectedCourseId ? state.lessons.filter(lesson => lesson.courseId === state.selectedCourseId) : [];
    const knownSeconds = courseLessons.reduce((total, lesson) => total + Math.max(0, lesson.durationSeconds || 0), 0);
    const missingDurations = courseLessons.filter(lesson => !lesson.durationSeconds).length;
    if (elements.lessonSummary) {
      const minuteText = knownSeconds ? `${Math.ceil(knownSeconds / 60)} 分鐘` : "暫未有時長資料";
      elements.lessonSummary.textContent = `共 ${courseLessons.length} 部影片 · ${minuteText}${missingDurations ? `（${missingDurations} 部待補時長）` : ""}`;
    }
    const query = normalizeSearchText(state.libraryQuery);
    const lessons = query ? courseLessons.filter(lesson => lessonSearchText(lesson).includes(query)) : courseLessons;
    if (elements.lessonSearchStatus) {
      elements.lessonSearchStatus.textContent = query ? `找到 ${lessons.length} / ${courseLessons.length} 部影片。` : "";
    }
    if (!courseLessons.length) {
      elements.lessonList.hidden = true;
      showInlineState(elements.lessonsState, state.selectedCourseId ? "這個課程目前未有已發布課堂。新課堂上架後會在這裡顯示。" : "請先從課程總覽選擇一個課程。", "empty");
      return;
    }

    if (!lessons.length) {
      elements.lessonList.hidden = true;
      showInlineState(elements.lessonsState, "沒有符合搜尋條件的課堂影片。你可以搜尋標題、簡介、標籤或播放列表名稱。", "empty");
      return;
    }

    lessons.forEach((lesson, index) => elements.lessonList.append(createLessonCard(lesson, index)));
    elements.lessonsState.hidden = true;
    elements.lessonList.hidden = false;
  }

  function normalizeSearchText(value) {
    return String(value || "").normalize("NFKC").trim().toLocaleLowerCase("zh-Hant");
  }

  function lessonSearchText(lesson) {
    const studentPlaylistNames = state.playlists.filter(playlist => lesson.playlistIds.includes(playlist.id)).map(playlist => playlist.name);
    return normalizeSearchText([
      lesson.title,
      lesson.description,
      ...lesson.tags,
      ...lesson.officialPlaylistNames,
      ...studentPlaylistNames
    ].join(" "));
  }

  function createLessonCard(lesson, index, { playlistSelection = false, playbackContext = null } = {}) {
    const article = document.createElement("article");
    article.className = `lesson-card${lesson.isPrivate ? " is-private" : ""}${playlistSelection ? " is-selectable" : ""}`;
    article.dataset.private = String(lesson.isPrivate);
    article.dataset.lessonId = lesson.id;

    let selection = null;
    if (playlistSelection) {
      selection = document.createElement("label");
      selection.className = "playlist-lesson-select";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = lesson.id;
      checkbox.checked = state.playlistSelectedLessonIds.has(lesson.id);
      checkbox.setAttribute("aria-label", `選取 ${lesson.title}`);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) state.playlistSelectedLessonIds.add(lesson.id);
        else state.playlistSelectedLessonIds.delete(lesson.id);
        article.classList.toggle("is-selected", checkbox.checked);
        updatePlaylistSelectionControls();
      });
      selection.append(checkbox);
      article.classList.toggle("is-selected", checkbox.checked);
    }

    const art = document.createElement("div");
    art.className = `lesson-art${lesson.isPrivate ? " lesson-art--private" : ""}`;
    if (lesson.posterUrl && !lesson.isPrivate) {
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
    number.hidden = Boolean(lesson.posterUrl) && !lesson.isPrivate;
    const image = art.querySelector("img");
    image?.addEventListener("error", () => {
      image.remove();
      number.hidden = false;
    }, { once: true });
    const duration = document.createElement("span");
    duration.className = "lesson-duration";
    duration.textContent = lesson.durationSeconds ? formatDuration(lesson.durationSeconds) : "錄影課堂";
    art.append(number, duration);
    if (lesson.isPrivate) {
      const privateLabel = document.createElement("span");
      privateLabel.className = "lesson-private-badge";
      privateLabel.textContent = "私人影片";
      art.append(privateLabel);
    }

    const body = document.createElement("div");
    body.className = "lesson-card__body";
    const kicker = document.createElement("span");
    kicker.textContent = `LESSON ${String(index + 1).padStart(2, "0")}`;
    const title = document.createElement("h3");
    title.textContent = lesson.title;
    const description = document.createElement("p");
    description.textContent = lesson.description || "按下方按鈕開始這一節課堂。";

    const tags = document.createElement("ul");
    tags.className = "lesson-tags";
    tags.setAttribute("aria-label", "課堂標籤");
    lesson.tags.forEach(tag => {
      const item = document.createElement("li");
      item.className = "lesson-tag";
      item.textContent = tag;
      tags.append(item);
    });
    const playlistNames = [
      ...lesson.officialPlaylistNames,
      ...state.playlists.filter(playlist => lesson.playlistIds.includes(playlist.id)).map(playlist => playlist.name)
    ];
    const playlistMeta = document.createElement("p");
    playlistMeta.className = "lesson-playlist-names";
    playlistMeta.textContent = playlistNames.length ? `播放列表：${playlistNames.join(" · ")}` : "";

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
    button.textContent = lesson.isPrivate ? "影片為私人 →" : lesson.completed ? "再次觀看 →" : lesson.progressPercent ? "繼續播放 →" : "開始播放 →";
    button.addEventListener("click", () => openLesson(lesson, playbackContext));
    const bookmark = document.createElement("button");
    bookmark.type = "button";
    bookmark.className = `bookmark-button${lesson.bookmarked ? " is-bookmarked" : ""}`;
    bookmark.setAttribute("aria-pressed", String(lesson.bookmarked));
    bookmark.setAttribute("aria-label", `${lesson.bookmarked ? "移除" : "加入"}${lesson.title}書籤`);
    bookmark.textContent = lesson.bookmarked ? "★ 已收藏" : "☆ 加入書籤";
    bookmark.addEventListener("click", () => void toggleBookmark(lesson, bookmark));
    const playlist = document.createElement("button");
    playlist.type = "button";
    playlist.className = "playlist-button";
    playlist.dataset.playlistForLesson = lesson.id;
    playlist.textContent = "＋ 加入播放列表";
    playlist.setAttribute("aria-label", `把 ${lesson.title} 加入播放列表`);
    playlist.addEventListener("click", () => openPlaylistDialog(lesson));
    actions.append(button, bookmark, playlist);
    body.append(kicker, title, description);
    if (lesson.tags.length) body.append(tags);
    if (playlistNames.length) body.append(playlistMeta);
    body.append(progress, actions);
    if (selection) article.append(selection);
    article.append(art, body);
    return article;
  }

  function configurePlaybackSequence(lesson, context = null) {
    const playlist = context?.type === "playlist"
      ? state.playlists.find(item => item.id === context.playlistId)
      : null;
    const playlistIds = playlist?.lessonIds.filter(id => state.lessons.some(candidate => candidate.id === id)) || [];
    if (playlist && playlistIds.includes(lesson.id)) {
      state.playbackSequenceLessonIds = playlistIds;
      state.playbackSequenceType = "playlist";
      state.playbackSequencePlaylistId = playlist.id;
    } else {
      state.playbackSequenceLessonIds = state.lessons.filter(item => item.courseId === lesson.courseId).map(item => item.id);
      state.playbackSequenceType = "course";
      state.playbackSequencePlaylistId = "";
    }
    if (!state.playbackSequenceLessonIds.includes(lesson.id)) state.playbackSequenceLessonIds.push(lesson.id);
    updateSequenceControls();
  }

  function updateSelectedCourseForLesson(lesson) {
    const course = state.courses.find(item => item.id === lesson.courseId);
    state.selectedCourseId = lesson.courseId;
    if (course) {
      elements.selectedCourseTitle.textContent = course.title;
      elements.selectedCourseDescription.textContent = course.description;
    }
  }

  function openLesson(lesson, context = null) {
    if (state.activeLesson && !closeNoteDialog(false, { restoreFocus: false })) return;
    configurePlaybackSequence(lesson, context);
    updateSelectedCourseForLesson(lesson);
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

  function resetPlaylistSelection({ keepMode = false } = {}) {
    state.playlistSelectedLessonIds.clear();
    state.playlistSelectionPlaylistId = state.selectedPlaylistId;
    if (!keepMode) state.playlistSelectionMode = false;
  }

  function updatePlaylistSelectionControls() {
    if (!elements.playlistSelectToggle || !elements.playlistRemoveSelected) return;
    const selectedCount = state.playlistSelectedLessonIds.size;
    elements.playlistSelectToggle.setAttribute("aria-pressed", String(state.playlistSelectionMode));
    elements.playlistSelectToggle.textContent = state.playlistSelectionMode ? "完成選取" : "選取多項";
    elements.playlistRemoveSelected.hidden = !state.playlistSelectionMode;
    elements.playlistRemoveSelected.disabled = selectedCount === 0;
    elements.playlistRemoveSelected.textContent = selectedCount ? `移除已選影片（${selectedCount}）` : "移除已選影片";
  }

  function playlistProgressSummary(lessons) {
    const totalSeconds = lessons.reduce((sum, lesson) => sum + Math.max(0, lesson.durationSeconds || 0), 0);
    const watchedSeconds = lessons.reduce((sum, lesson) => {
      const duration = Math.max(0, lesson.durationSeconds || 0);
      if (!duration) return sum;
      return sum + (lesson.completed ? duration : Math.min(duration, Math.max(0, lesson.positionSeconds || 0)));
    }, 0);
    const percent = totalSeconds ? Math.min(100, Math.round((watchedSeconds / totalSeconds) * 100)) : 0;
    return { totalSeconds, watchedSeconds, percent };
  }

  function renderPlaylists() {
    if (!elements.playlistList || !elements.playlistsState) return;
    elements.playlistList.replaceChildren();
    if (!state.playlists.length) {
      resetPlaylistSelection();
      updatePlaylistSelectionControls();
      elements.playlistList.hidden = true;
      elements.playlistDetail.hidden = true;
      showInlineState(elements.playlistsState, "你尚未建立播放列表。按「建立播放列表」開始整理自己的溫習次序。", "empty");
      return;
    }
    if (!state.playlists.some(playlist => playlist.id === state.selectedPlaylistId)) state.selectedPlaylistId = state.playlists[0].id;
    if (state.playlistSelectionPlaylistId !== state.selectedPlaylistId) resetPlaylistSelection();
    state.playlists.forEach(playlist => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.playlistId = playlist.id;
      button.setAttribute("aria-current", playlist.id === state.selectedPlaylistId ? "page" : "false");
      const name = document.createElement("span");
      name.className = "playlist-list__name";
      name.textContent = playlist.name;
      const count = document.createElement("span");
      count.className = "playlist-list__count";
      count.textContent = `${playlist.lessonIds.length} 部`;
      button.append(name, count);
      button.addEventListener("click", () => {
        state.selectedPlaylistId = playlist.id;
        resetPlaylistSelection();
        renderPlaylists();
        elements.playlistList.querySelector(`[data-playlist-id="${playlist.id}"]`)?.focus({ preventScroll: true });
      });
      elements.playlistList.append(button);
    });
    elements.playlistsState.hidden = true;
    elements.playlistList.hidden = false;

    const selected = state.playlists.find(playlist => playlist.id === state.selectedPlaylistId);
    if (!selected) {
      elements.playlistDetail.hidden = true;
      return;
    }
    elements.playlistTitle.textContent = selected.name;
    const lessons = selected.lessonIds.map(id => state.lessons.find(lesson => lesson.id === id)).filter(Boolean);
    elements.playlistDescription.textContent = `${lessons.length} 部課堂影片`;
    const summary = playlistProgressSummary(lessons);
    if (elements.playlistSummary) {
      elements.playlistSummary.textContent = `共 ${lessons.length} 部影片 · 總長度 ${formatDuration(summary.totalSeconds)} · 已觀看 ${formatDuration(summary.watchedSeconds)}（${summary.percent}%）`;
    }
    updatePlaylistSelectionControls();
    elements.playlistLessonList.replaceChildren();
    if (!lessons.length) {
      elements.playlistLessonList.hidden = true;
      showInlineState(elements.playlistLessonsState, "這個播放列表目前未有影片。你可從課堂卡按「＋ 加入播放列表」加入。", "empty");
    } else {
      lessons.forEach((lesson, index) => elements.playlistLessonList.append(createLessonCard(lesson, index, {
        playlistSelection: state.playlistSelectionMode,
        playbackContext: { type: "playlist", playlistId: selected.id }
      })));
      elements.playlistLessonsState.hidden = true;
      elements.playlistLessonList.hidden = false;
    }
    elements.playlistDetail.hidden = false;
  }

  function openPlaylistDialog(lesson = null) {
    if (!elements.playlistDialog) return;
    state.playlistLesson = lesson;
    elements.playlistDialogLessonTitle.textContent = lesson ? lesson.title : "建立新的播放列表";
    elements.playlistStatus.textContent = "";
    elements.newPlaylistName.value = "";
    renderPlaylistDialogOptions();
    if (typeof elements.playlistDialog.showModal === "function") elements.playlistDialog.showModal();
    else elements.playlistDialog.setAttribute("open", "");
    window.setTimeout(() => {
      const firstOption = elements.playlistOptions.querySelector("input");
      (lesson && firstOption ? firstOption : elements.newPlaylistName)?.focus();
    }, 0);
  }

  function closePlaylistDialog() {
    state.playlistLesson = null;
    if (typeof elements.playlistDialog?.close === "function") elements.playlistDialog.close();
    else elements.playlistDialog?.removeAttribute("open");
  }

  function renderPlaylistDialogOptions() {
    if (!elements.playlistOptions) return;
    elements.playlistOptions.replaceChildren();
    const selected = new Set(state.playlistLesson?.playlistIds || []);
    state.playlists.forEach(playlist => {
      const label = document.createElement("label");
      label.className = "playlist-dialog__option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = playlist.id;
      input.checked = selected.has(playlist.id);
      const text = document.createElement("span");
      text.textContent = `${playlist.name}（${playlist.lessonIds.length} 部）`;
      label.append(input, text);
      elements.playlistOptions.append(label);
    });
    elements.playlistOptionsEmpty.hidden = state.playlists.length > 0;
  }

  async function createPlaylistFromInput() {
    if (!state.studentSession?.token) return;
    const name = elements.newPlaylistName.value.trim();
    if (!name) {
      elements.playlistStatus.textContent = "請輸入播放列表名稱。";
      elements.playlistStatus.dataset.state = "error";
      return;
    }
    elements.createPlaylistInline.disabled = true;
    elements.playlistStatus.textContent = "正在建立播放列表⋯";
    try {
      const payload = await apiRequest("/v1/playlists", {
        method: "POST",
        token: state.studentSession.token,
        body: { name }
      });
      const playlist = normalizePlaylist(unwrap(payload)?.playlist || unwrap(payload));
      if (!playlist.id) throw new ApiError("未能建立播放列表。", 0, "INVALID_PLAYLIST");
      state.playlists.push(playlist);
      state.selectedPlaylistId = playlist.id;
      elements.newPlaylistName.value = "";
      renderPlaylists();
      renderPlaylistDialogOptions();
      const option = elements.playlistOptions.querySelector(`input[value="${playlist.id}"]`);
      if (option && state.playlistLesson) option.checked = true;
      elements.playlistStatus.textContent = `已建立「${playlist.name}」。`;
      elements.playlistStatus.dataset.state = "success";
      showToast("播放列表已建立。", "success");
      if (!state.playlistLesson) closePlaylistDialog();
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      elements.playlistStatus.textContent = error.message;
      elements.playlistStatus.dataset.state = "error";
    } finally {
      elements.createPlaylistInline.disabled = false;
    }
  }

  async function savePlaylistSelection() {
    const lesson = state.playlistLesson;
    if (!lesson?.id || !state.studentSession?.token) return closePlaylistDialog();
    const desired = new Set(Array.from(elements.playlistOptions.querySelectorAll("input:checked"), input => input.value));
    const current = new Set(lesson.playlistIds);
    const changes = state.playlists.filter(playlist => desired.has(playlist.id) !== current.has(playlist.id));
    if (!changes.length) return closePlaylistDialog();
    elements.playlistChooserForm.querySelectorAll("input, button").forEach(control => { control.disabled = true; });
    elements.playlistStatus.textContent = "正在儲存播放列表⋯";
    try {
      await Promise.all(changes.map(playlist => apiRequest(`/v1/playlists/${encodeURIComponent(playlist.id)}/lessons/${encodeURIComponent(lesson.id)}`, {
        method: desired.has(playlist.id) ? "PUT" : "DELETE",
        token: state.studentSession.token
      })));
      lesson.playlistIds = Array.from(desired);
      state.playlists.forEach(playlist => {
        playlist.lessonIds = playlist.lessonIds.filter(id => id !== lesson.id);
        if (desired.has(playlist.id)) playlist.lessonIds.push(lesson.id);
      });
      closePlaylistDialog();
      renderLessons();
      renderPlaylists();
      elements.lessonList.querySelector(`[data-playlist-for-lesson="${lesson.id}"]`)?.focus({ preventScroll: true });
      showToast("播放列表已更新。", "success");
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      elements.playlistStatus.textContent = error.message;
      elements.playlistStatus.dataset.state = "error";
    } finally {
      elements.playlistChooserForm.querySelectorAll("input, button").forEach(control => { control.disabled = false; });
    }
  }

  async function deleteSelectedPlaylist() {
    const playlist = state.playlists.find(item => item.id === state.selectedPlaylistId);
    if (!playlist || !state.studentSession?.token) return;
    if (!window.confirm(`確定刪除播放列表「${playlist.name}」？影片本身及觀看進度不會被刪除。`)) return;
    elements.deletePlaylist.disabled = true;
    try {
      await apiRequest(`/v1/playlists/${encodeURIComponent(playlist.id)}`, {
        method: "DELETE",
        token: state.studentSession.token
      });
      state.playlists = state.playlists.filter(item => item.id !== playlist.id);
      state.lessons.forEach(lesson => { lesson.playlistIds = lesson.playlistIds.filter(id => id !== playlist.id); });
      state.selectedPlaylistId = state.playlists[0]?.id || "";
      renderLessons();
      renderPlaylists();
      showToast("播放列表已刪除。", "success");
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      showToast(error.message, "error");
    } finally {
      elements.deletePlaylist.disabled = false;
    }
  }

  async function removeSelectedPlaylistLessons() {
    const playlist = state.playlists.find(item => item.id === state.selectedPlaylistId);
    const lessonIds = Array.from(state.playlistSelectedLessonIds).filter(id => playlist?.lessonIds.includes(id));
    if (!playlist || !lessonIds.length || !state.studentSession?.token) return;
    if (!window.confirm(`確定從「${playlist.name}」移除已選取的 ${lessonIds.length} 部影片？影片及觀看進度不會被刪除。`)) return;
    elements.playlistRemoveSelected.disabled = true;
    elements.playlistSelectToggle.disabled = true;
    try {
      await Promise.all(lessonIds.map(lessonId => apiRequest(`/v1/playlists/${encodeURIComponent(playlist.id)}/lessons/${encodeURIComponent(lessonId)}`, {
        method: "DELETE",
        token: state.studentSession.token
      })));
      const removed = new Set(lessonIds);
      playlist.lessonIds = playlist.lessonIds.filter(id => !removed.has(id));
      state.lessons.forEach(lesson => {
        if (removed.has(lesson.id)) lesson.playlistIds = lesson.playlistIds.filter(id => id !== playlist.id);
      });
      resetPlaylistSelection();
      renderLessons();
      renderBookmarks();
      renderPlaylists();
      showToast(`已從播放列表移除 ${lessonIds.length} 部影片。`, "success");
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      showToast(`${error.message} 請重新載入播放列表確認結果。`, "error");
      elements.playlistRemoveSelected.disabled = false;
      elements.playlistSelectToggle.disabled = false;
    }
  }

  function updateNoteCount() {
    if (!elements.noteCount || !elements.noteContent) return;
    elements.noteCount.textContent = `${elements.noteContent.value.length.toLocaleString("en-US")} / 5,000`;
  }

  function openNoteDialog(lesson) {
    if (!lesson || !elements.notePanel) return;
    state.noteLesson = lesson;
    elements.noteLessonTitle.textContent = lesson.title;
    elements.noteContent.value = lesson.note || "";
    elements.noteStatus.textContent = "";
    updateNoteCount();
    elements.notePanel.hidden = false;
    elements.openNote?.setAttribute("aria-expanded", "true");
    if (elements.noteToggleIcon) elements.noteToggleIcon.textContent = "−";
    window.setTimeout(() => elements.noteContent.focus(), 0);
  }

  function closeNoteDialog(force = false, { restoreFocus = true } = {}) {
    if (!force && state.noteLesson && elements.noteContent.value.trim() !== state.noteLesson.note.trim()) {
      if (!window.confirm("這堂課的筆記尚未儲存，確定先收合嗎？")) return false;
    }
    const shouldRestoreFocus = restoreFocus && elements.notePanel?.contains(document.activeElement);
    state.noteLesson = null;
    if (elements.notePanel) elements.notePanel.hidden = true;
    elements.openNote?.setAttribute("aria-expanded", "false");
    if (elements.noteToggleIcon) elements.noteToggleIcon.textContent = "＋";
    if (shouldRestoreFocus) elements.openNote?.focus({ preventScroll: true });
    return true;
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
      closeNoteDialog(true, { restoreFocus: false });
      elements.openNote?.focus({ preventScroll: true });
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
      edit.addEventListener("click", () => {
        openLesson(lesson);
        openNoteDialog(lesson);
      });
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
    const sources = (Array.isArray(grant.sources) ? grant.sources : []).map(normalizeRendition).filter(source => source.qualityCode && source.url);
    if (!sources.length) sources.push({ qualityCode: "max", label: "Max（最高畫質）", height: 0, isDefault: true, url: videoUrl });
    const requestedDefault = String(grant.defaultQuality || grant.default_quality || "");
    const defaultSource = sources.find(source => source.qualityCode === requestedDefault)
      || sources.find(source => source.isDefault)
      || sources.find(source => source.qualityCode === "max")
      || sources[sources.length - 1];
    return {
      playbackToken,
      sessionId,
      videoUrl: defaultSource.url,
      sources,
      activeQuality: defaultSource.qualityCode,
      expiresAt: String(grant.expiresAt || grant.expires_at || ""),
      resumeAt: lesson.completed ? 0 : Number(grant.resumeAt || grant.resume_at || grant.positionSeconds || grant.position_seconds || lesson.positionSeconds || 0),
      videoKey: String(watermark.videoKey || watermark.video_key || grant.videoKey || grant.video_key || state.studentSession?.profile?.videoKey || "已驗證學生"),
      sessionCode: String(watermark.sessionCode || watermark.session_code || grant.sessionCode || grant.session_code || sessionId.slice(-10)).toUpperCase(),
      watermarkEnabled: !watermarksDisabled && watermark.enabled !== false && grant.watermarkEnabled !== false && grant.watermark_enabled !== false && state.studentSession?.profile?.watermarkEnabled !== false
    };
  }

  function safePlaybackUrl(value) {
    if (!value) return "";
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

  function applyPlaybackRate(value) {
    const rate = Number(value);
    if (!PLAYBACK_RATES.includes(rate)) return;
    state.playbackRate = rate;
    elements.video.defaultPlaybackRate = rate;
    elements.video.playbackRate = rate;
    elements.video.preservesPitch = true;
    if (elements.playbackSpeed) elements.playbackSpeed.value = String(rate);
    savePlaybackRate(rate);
  }

  function configureQualitySelector() {
    if (!elements.playbackQuality || !state.playback) return;
    const sources = new Map(state.playback.sources.map(source => [source.qualityCode, source]));
    const baseLabels = { "480p": "480p", "720p": "720p", "1080p": "1080p", max: "Max（最高畫質）" };
    Array.from(elements.playbackQuality.options).forEach(option => {
      const source = sources.get(option.value);
      option.disabled = !source;
      option.textContent = source
        ? (option.value === "max" && source.height ? `Max（${source.height}p）` : (source.label || baseLabels[option.value]))
        : `${baseLabels[option.value]}（不支援）`;
    });
    elements.playbackQuality.value = state.playback.activeQuality;
    elements.playbackQuality.disabled = sources.size <= 1;
    elements.playbackQuality.title = sources.has("1080p") ? "選擇影片畫質" : "原片最高為 720p，因此不會虛假放大至 1080p";
  }

  function switchPlaybackQuality(qualityCode) {
    if (!state.playback || state.qualitySwitch) return;
    const source = state.playback.sources.find(item => item.qualityCode === qualityCode);
    if (!source || source.qualityCode === state.playback.activeQuality) return;
    const duration = Number.isFinite(elements.video.duration) ? elements.video.duration : Infinity;
    state.qualitySwitch = {
      position: Math.min(Math.max(0, elements.video.currentTime || 0), duration),
      wasPlaying: !elements.video.paused && !elements.video.ended,
      volume: elements.video.volume,
      muted: elements.video.muted,
      rate: state.playbackRate
    };
    elements.video.pause();
    state.playback.activeQuality = source.qualityCode;
    state.playback.videoUrl = source.url;
    elements.playbackQuality.value = source.qualityCode;
    elements.playbackQuality.disabled = true;
    elements.video.src = source.url;
    elements.video.load();
    showToast(`正在切換至 ${source.label || source.qualityCode}⋯`);
  }

  function setClipRailOpen(open, { restoreFocus = true } = {}) {
    if (!elements.clipRail) return;
    const shouldRestoreFocus = !open && restoreFocus && !elements.clipRail.hidden && elements.clipRailPanel?.contains(document.activeElement);
    elements.clipRail.dataset.open = String(open);
    elements.clipRailToggle?.setAttribute("aria-expanded", String(open));
    if (shouldRestoreFocus) elements.clipRailToggle?.focus({ preventScroll: true });
  }

  function renderClips() {
    if (!elements.clipList || !elements.seekMarkers) return;
    const clips = (state.activeLesson?.clips || []).slice().sort((a, b) => a.positionSeconds - b.positionSeconds);
    const duration = Number.isFinite(elements.video.duration) && elements.video.duration > 0
      ? elements.video.duration
      : Math.max(0, state.activeLesson?.durationSeconds || 0);
    elements.clipList.replaceChildren();
    elements.seekMarkers.replaceChildren();
    elements.clipCount.textContent = String(clips.length);
    elements.clipsEmpty.hidden = clips.length > 0;
    elements.clipRail.hidden = clips.length === 0;
    if (!clips.length) {
      setClipRailOpen(false);
      return;
    }

    clips.forEach((clip, index) => {
      const label = clip.title ? `精彩回顧：${clip.title}` : `Clip ${clip.clipNumber || index + 1}`;
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "clip-item";
      button.dataset.clipId = clip.id;
      button.setAttribute("aria-label", `跳到 ${formatDuration(clip.positionSeconds)}：${label}`);
      const title = document.createElement("span");
      title.className = "clip-item__title";
      title.textContent = label;
      const time = document.createElement("span");
      time.className = "clip-item__time";
      time.textContent = formatDuration(clip.positionSeconds);
      button.append(title, time);
      button.addEventListener("pointerdown", event => { item.dataset.pointerType = event.pointerType || ""; });
      button.addEventListener("click", event => {
        const touchLike = item.dataset.pointerType === "touch" || item.dataset.pointerType === "pen";
        if (touchLike && !item.classList.contains("is-actions-visible")) {
          event.preventDefault();
          elements.clipList.querySelectorAll("li.is-actions-visible").forEach(row => {
            if (row !== item) row.classList.remove("is-actions-visible");
          });
          item.classList.add("is-actions-visible");
          return;
        }
        seekToClip(clip);
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "clip-item__delete";
      remove.textContent = "刪除";
      remove.setAttribute("aria-label", `刪除 ${label}`);
      remove.addEventListener("click", event => {
        event.stopPropagation();
        void deleteClip(clip, remove);
      });
      item.append(button, remove);
      elements.clipList.append(item);

      if (duration > 0) {
        const marker = document.createElement("button");
        marker.type = "button";
        marker.className = "seek-marker";
        marker.style.left = `${Math.min(100, Math.max(0, (clip.positionSeconds / duration) * 100))}%`;
        marker.title = `${label} · ${formatDuration(clip.positionSeconds)}`;
        marker.setAttribute("aria-label", `跳到 ${label}，${formatDuration(clip.positionSeconds)}`);
        marker.addEventListener("click", event => {
          event.stopPropagation();
          seekToClip(clip);
        });
        elements.seekMarkers.append(marker);
      }
    });
  }

  function seekToClip(clip) {
    if (!state.playback || !Number.isFinite(clip?.positionSeconds)) return;
    elements.video.currentTime = Math.min(Math.max(0, clip.positionSeconds), elements.video.duration || clip.positionSeconds);
    updatePlayerControls();
    void elements.video.play().catch(() => showToast("已跳到精彩片段，按播放繼續。"));
  }

  async function deleteClip(clip, button) {
    const lesson = state.activeLesson;
    if (!clip?.id || !lesson?.id || !state.studentSession?.token) return;
    const label = clip.title ? `精彩回顧：${clip.title}` : `Clip ${clip.clipNumber || ""}`.trim();
    if (!window.confirm(`確定刪除「${label}」？`)) return;
    button.disabled = true;
    try {
      await apiRequest(`/v1/clips/${encodeURIComponent(clip.id)}`, {
        method: "DELETE",
        token: state.studentSession.token
      });
      if (state.activeLesson?.id !== lesson.id) return;
      lesson.clips = lesson.clips.filter(item => item.id !== clip.id);
      renderClips();
      showToast("精彩片段已刪除。", "success");
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      button.disabled = false;
      showToast(error.message, "error");
    }
  }

  function beginClipCreation() {
    if (!state.playback || !state.activeLesson) return;
    if (state.clipMode || !elements.clipEditor.hidden) {
      cancelClipCreation({ resume: true });
      return;
    }
    state.clipWasPlaying = !elements.video.paused && !elements.video.ended;
    state.clipMode = true;
    elements.player.dataset.clipMode = "true";
    state.clipPosition = null;
    elements.video.pause();
    elements.pinClip.setAttribute("aria-pressed", "true");
    elements.pinClip.setAttribute("aria-label", "取消選擇精彩片段位置");
    showControlsTemporarily();
    showToast("請拖動影片進度列；放開時便可儲存這個時間點。", "info");
    elements.seek.focus({ preventScroll: true });
  }

  function openClipEditor(positionSeconds) {
    if (!state.activeLesson || !state.studentSession?.token) return;
    const maximum = Number.isFinite(elements.video.duration) ? elements.video.duration : 86400;
    state.clipPosition = Math.min(Math.max(0, Number(positionSeconds) || 0), maximum);
    state.clipMode = false;
    elements.player.removeAttribute("data-clip-mode");
    elements.pinClip.setAttribute("aria-pressed", "false");
    elements.pinClip.setAttribute("aria-label", "在影片進度列選擇精彩片段位置");
    elements.clipSelectedTime.textContent = formatDuration(state.clipPosition);
    elements.clipTitle.value = "";
    elements.clipStatus.textContent = "";
    elements.clipEditor.hidden = false;
    syncPlayerOverlayState();
    window.setTimeout(() => elements.clipTitle.focus(), 0);
  }

  function syncPlayerOverlayState() {
    const controlsBlocked = !elements.endedOverlay.hidden || !elements.clipEditor.hidden;
    elements.playerControls?.toggleAttribute("inert", controlsBlocked);
  }

  function cancelClipCreation({ resume = false, restoreFocus = true } = {}) {
    const shouldResume = resume && state.clipWasPlaying && state.playback;
    const editorWasOpen = elements.clipEditor && !elements.clipEditor.hidden;
    state.clipMode = false;
    elements.player?.removeAttribute("data-clip-mode");
    state.clipPosition = null;
    state.clipWasPlaying = false;
    elements.pinClip?.setAttribute("aria-pressed", "false");
    elements.pinClip?.setAttribute("aria-label", "在影片進度列選擇精彩片段位置");
    if (elements.clipEditor) elements.clipEditor.hidden = true;
    if (elements.clipStatus) elements.clipStatus.textContent = "";
    syncPlayerOverlayState();
    if (restoreFocus && editorWasOpen && state.playback) elements.pinClip?.focus({ preventScroll: true });
    if (shouldResume) void elements.video.play().catch(() => {});
  }

  async function saveClip(title = "") {
    const lesson = state.activeLesson;
    if (!lesson?.id || !state.studentSession?.token || !Number.isFinite(state.clipPosition)) return;
    const controls = elements.clipEditor.querySelectorAll("input, button");
    controls.forEach(control => { control.disabled = true; });
    elements.clipStatus.textContent = "正在儲存精彩片段⋯";
    elements.clipStatus.dataset.state = "success";
    try {
      const payload = await apiRequest(`/v1/lessons/${encodeURIComponent(lesson.id)}/clips`, {
        method: "POST",
        token: state.studentSession.token,
        body: { positionSeconds: state.clipPosition, title: String(title || "").trim() }
      });
      const clip = normalizeClip(unwrap(payload)?.clip || unwrap(payload));
      if (!clip.id) throw new ApiError("未能儲存精彩片段。", 0, "INVALID_CLIP");
      lesson.clips = [...lesson.clips.filter(item => item.id !== clip.id), clip].sort((a, b) => a.positionSeconds - b.positionSeconds);
      renderClips();
      cancelClipCreation({ resume: true });
      showToast(`已儲存「${clip.title || `Clip ${clip.clipNumber || lesson.clips.length}`}」。`, "success");
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      elements.clipStatus.textContent = error.message;
      elements.clipStatus.dataset.state = "error";
    } finally {
      controls.forEach(control => { control.disabled = false; });
    }
  }

  function configureFeedbackForm(lesson) {
    window.clearTimeout(state.feedbackSaveTimer);
    state.feedbackSaveTimer = 0;
    const feedback = lesson?.feedback || {};
    const values = {
      videoQuality: feedback.pictureQuality,
      explanation: feedback.explanationQuality,
      audioQuality: feedback.audioQuality
    };
    elements.feedbackRatings.forEach(input => {
      input.checked = Number(input.value) === values[input.dataset.feedbackRating];
      input.disabled = false;
    });
    elements.feedbackStatus.textContent = "";
    elements.feedbackStatus.dataset.state = "";
  }

  function currentFeedbackValues() {
    const selected = key => {
      const input = elements.feedbackForm.querySelector(`[data-feedback-rating="${key}"]:checked`);
      return input ? Number(input.value) : null;
    };
    return {
      videoQuality: selected("videoQuality"),
      explanation: selected("explanation"),
      audioQuality: selected("audioQuality")
    };
  }

  function scheduleLessonFeedbackSave() {
    window.clearTimeout(state.feedbackSaveTimer);
    state.feedbackSaveTimer = 0;
    const values = currentFeedbackValues();
    const selectedCount = Object.values(values).filter(value => value != null).length;
    if (!selectedCount) return;
    if (selectedCount === 3) {
      void saveLessonFeedback();
      return;
    }
    elements.feedbackStatus.textContent = "等待其餘評分；如沒有再選擇，將於 2 秒後儲存⋯";
    elements.feedbackStatus.dataset.state = "";
    state.feedbackSaveTimer = window.setTimeout(() => {
      state.feedbackSaveTimer = 0;
      void saveLessonFeedback();
    }, 2000);
  }

  function flushScheduledFeedbackSave() {
    if (!state.feedbackSaveTimer) return;
    window.clearTimeout(state.feedbackSaveTimer);
    state.feedbackSaveTimer = 0;
    void saveLessonFeedback();
  }

  function showFeedbackOverlay({ pause = true } = {}) {
    if (!state.activeLesson || !state.playback) return;
    state.feedbackReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : elements.openFeedback;
    state.feedbackWasPlaying = pause && !elements.video.paused && !elements.video.ended;
    if (pause) elements.video.pause();
    configureFeedbackForm(state.activeLesson);
    elements.endedOverlay.hidden = false;
    elements.player.dataset.ended = String(elements.video.ended);
    elements.closeFeedback.hidden = elements.video.ended;
    elements.centrePlay.hidden = true;
    syncPlayerOverlayState();
    window.setTimeout(() => elements.feedbackForm.querySelector("input:checked, input")?.focus({ preventScroll: true }), 0);
  }

  function closeFeedbackOverlay({ resume = true, restoreFocus = true } = {}) {
    flushScheduledFeedbackSave();
    const shouldResume = resume && state.feedbackWasPlaying && state.playback;
    const returnFocus = state.feedbackReturnFocus;
    state.feedbackWasPlaying = false;
    state.feedbackReturnFocus = null;
    elements.endedOverlay.hidden = true;
    elements.player.removeAttribute("data-ended");
    syncPlayerOverlayState();
    updatePlayButtons();
    if (restoreFocus) {
      const target = returnFocus?.isConnected && !returnFocus.closest("[hidden]") ? returnFocus : elements.playToggle;
      target?.focus({ preventScroll: true });
    }
    if (shouldResume) void elements.video.play().catch(() => {});
  }

  async function saveLessonFeedback() {
    window.clearTimeout(state.feedbackSaveTimer);
    state.feedbackSaveTimer = 0;
    const lesson = state.activeLesson;
    if (!lesson?.id || !state.studentSession?.token) return;
    const values = currentFeedbackValues();
    if (Object.values(values).every(value => value == null)) return;
    const activeRating = document.activeElement;
    const generation = ++state.feedbackSaveGeneration;
    elements.feedbackRatings.forEach(input => { input.disabled = true; });
    elements.feedbackStatus.textContent = "正在儲存評分⋯";
    elements.feedbackStatus.dataset.state = "";
    try {
      const payload = await apiRequest(`/v1/lessons/${encodeURIComponent(lesson.id)}/feedback`, {
        method: "PUT",
        token: state.studentSession.token,
        body: values
      });
      if (generation !== state.feedbackSaveGeneration || state.activeLesson?.id !== lesson.id) return;
      lesson.feedback = normalizeLessonFeedback(unwrap(payload)?.feedback || unwrap(payload));
      configureFeedbackForm(lesson);
      elements.feedbackStatus.textContent = "評分已儲存；你可隨時更改。";
      elements.feedbackStatus.dataset.state = "success";
    } catch (error) {
      if (generation !== state.feedbackSaveGeneration) return;
      if (error.status === 401) return handleExpiredSession("student");
      elements.feedbackStatus.textContent = error.message;
      elements.feedbackStatus.dataset.state = "error";
    } finally {
      if (generation === state.feedbackSaveGeneration) {
        elements.feedbackRatings.forEach(input => { input.disabled = false; });
        if (!elements.endedOverlay.hidden && activeRating instanceof HTMLElement && activeRating.isConnected) {
          activeRating.focus({ preventScroll: true });
        }
      }
    }
  }

  async function startPlayback(lesson) {
    if (!state.studentSession?.token || !lesson?.id) return;
    if (!closePlayer({ saveProgress: true, hideSection: false, preservePlaybackSequence: true })) return;
    state.activeLesson = lesson;
    state.qualitySwitch = null;
    elements.playerTitle.textContent = lesson.title;
    elements.playerDescription.textContent = lesson.description || "";
    elements.playerViewCount.textContent = `觀看次數：${lesson.viewCount.toLocaleString("zh-HK")}`;
    elements.playerSection.hidden = false;
    elements.playerError.hidden = true;
    elements.playerError.classList.remove("private-video-message");
    elements.player.removeAttribute("data-playback-ready");
    resetPlayerPlaceholder();
    elements.playerControls.hidden = true;
    elements.centrePlay.hidden = true;
    elements.endedOverlay.hidden = true;
    elements.player.removeAttribute("data-ended");
    configureFeedbackForm(lesson);
    renderClips();
    updateSequenceControls();
    elements.playerSection.scrollIntoView({ behavior: "smooth", block: "start" });

    if (lesson.isPrivate) {
      showPlayerError("影片目前為私人。", { privateVideo: true });
      return;
    }

    try {
      const payload = await apiRequest("/v1/playback/grant", {
        method: "POST",
        token: state.studentSession.token,
        body: { lessonId: lesson.id }
      });
      if (state.activeLesson?.id !== lesson.id) return;
      state.playback = { ...extractPlaybackGrant(payload, lesson), viewCountRecorded: false };
      configureWatermark();
      configureQualitySelector();
      applyPlaybackRate(state.playbackRate);
      elements.video.src = state.playback.videoUrl;
      elements.video.load();
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("student");
      const privateVideo = error.code === "LESSON_PRIVATE" || /private|私人/i.test(error.message || "");
      showPlayerError(privateVideo ? "影片目前為私人。" : error.status === 403 ? "你的帳戶目前未能播放這個課堂，請聯絡 Edmund Sir。" : error.message, { privateVideo });
    }
  }

  function showPlayerError(message, { privateVideo = false } = {}) {
    elements.player.removeAttribute("data-playback-ready");
    if (privateVideo) {
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "🔒";
      const title = document.createElement("strong");
      title.textContent = "影片目前為私人。";
      elements.playerPlaceholder.replaceChildren(icon, title);
      elements.playerPlaceholder.setAttribute("role", "alert");
      elements.playerPlaceholder.hidden = false;
    } else {
      elements.playerPlaceholder.hidden = true;
    }
    elements.playerControls.hidden = true;
    elements.centrePlay.hidden = true;
    elements.playerError.textContent = message;
    elements.playerError.classList.toggle("private-video-message", privateVideo);
    elements.playerError.hidden = false;
  }

  function resetPlayerPlaceholder() {
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    spinner.setAttribute("aria-hidden", "true");
    const title = document.createElement("strong");
    title.textContent = "正在準備安全播放⋯";
    elements.playerPlaceholder.replaceChildren(spinner, title);
    elements.playerPlaceholder.removeAttribute("role");
    elements.playerPlaceholder.hidden = false;
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
    const lesson = state.activeLesson;
    const playback = state.playback;
    const positionSeconds = Number.isFinite(elements.video.currentTime) ? Math.round(elements.video.currentTime * 10) / 10 : 0;
    const durationSeconds = Number.isFinite(elements.video.duration) ? Math.round(elements.video.duration * 10) / 10 : 0;
    state.heartbeatInFlight = true;
    try {
      await apiRequest("/v1/playback/heartbeat", {
        method: "POST",
        token: state.studentSession.token,
        keepalive,
        timeoutMs: keepalive ? 4000 : requestTimeoutMs,
        body: {
          lessonId: lesson.id,
          playbackSessionId: playback.sessionId,
          positionSeconds,
          durationSeconds,
          event: eventType
        }
      });
      const qualifiesAsView = durationSeconds > 0 && (positionSeconds >= 3 || positionSeconds / durationSeconds >= 0.1);
      if (qualifiesAsView && !playback.viewCountRecorded && state.playback === playback && state.activeLesson === lesson) {
        playback.viewCountRecorded = true;
        lesson.viewCount += 1;
        elements.playerViewCount.textContent = `觀看次數：${lesson.viewCount.toLocaleString("zh-HK")}`;
      }
    } catch (error) {
      if (error.status === 401) handleExpiredSession("student");
    } finally {
      state.heartbeatInFlight = false;
    }
  }

  function closePlayer({ saveProgress = true, hideSection = true, confirmUnsavedNote = true, preservePlaybackSequence = false } = {}) {
    if (confirmUnsavedNote) {
      if (!closeNoteDialog(false, { restoreFocus: false })) return false;
    } else {
      closeNoteDialog(true, { restoreFocus: false });
    }
    const progressSave = saveProgress && state.playback ? sendHeartbeat("close", true) : null;
    flushScheduledFeedbackSave();
    window.clearInterval(state.heartbeatTimer);
    clearWatermarkTimers();
    window.clearTimeout(state.controlsTimer);
    state.heartbeatTimer = 0;
    state.controlsTimer = 0;
    state.feedbackSaveGeneration += 1;
    state.feedbackWasPlaying = false;
    state.feedbackReturnFocus = null;
    state.qualitySwitch = null;
    cancelClipCreation({ restoreFocus: false });
    setClipRailOpen(false, { restoreFocus: false });
    elements.endedOverlay.hidden = true;
    syncPlayerOverlayState();
    elements.player.removeAttribute("data-ended");
    elements.seekMarkers?.replaceChildren();
    if (elements.playbackQuality) {
      elements.playbackQuality.disabled = true;
      elements.playbackQuality.value = "max";
    }
    if (elements.video) {
      elements.video.pause();
      elements.video.removeAttribute("src");
      elements.video.load();
    }
    state.playback = null;
    state.activeLesson = null;
    elements.player.removeAttribute("data-playback-ready");
    window.clearTimeout(state.mobileTapTimer);
    window.clearTimeout(state.seekFeedbackTimer);
    state.mobileTapTimer = 0;
    state.mobileTapAt = 0;
    state.mobileTapSide = "";
    elements.seekFeedback?.classList.remove("is-visible");
    if (!preservePlaybackSequence) {
      state.playbackSequenceLessonIds = [];
      state.playbackSequenceType = "course";
      state.playbackSequencePlaylistId = "";
    }
    updateSequenceControls();
    elements.watermarkLayer.hidden = false;
    elements.player.removeAttribute("data-controls-hidden");
    elements.playerError.hidden = true;
    elements.playerError.classList.remove("private-video-message");
    if (hideSection) {
      elements.playerSection.hidden = true;
      if (state.role === "student" && saveProgress && !state.isLoggingOut) {
        void loadLessons();
        if (progressSave) void Promise.resolve(progressSave).finally(() => loadAnalytics());
        else void loadAnalytics();
      }
    }
    resetStudentInactivity();
    return true;
  }

  function updateSequenceControls() {
    if (!elements.previousVideo || !elements.nextVideo) return;
    const activeId = state.activeLesson?.id || "";
    const index = state.playbackSequenceLessonIds.indexOf(activeId);
    const previousLesson = index > 0 ? state.lessons.find(lesson => lesson.id === state.playbackSequenceLessonIds[index - 1]) : null;
    const nextLesson = index >= 0 && index < state.playbackSequenceLessonIds.length - 1
      ? state.lessons.find(lesson => lesson.id === state.playbackSequenceLessonIds[index + 1])
      : null;
    const busy = elements.player?.dataset.navigationBusy === "true";
    elements.previousVideo.disabled = busy || !previousLesson;
    elements.nextVideo.disabled = busy || !nextLesson;
    elements.previousVideo.setAttribute("aria-label", previousLesson ? `上一部影片：${previousLesson.title}` : "已是第一部影片");
    elements.nextVideo.setAttribute("aria-label", nextLesson ? `下一部影片：${nextLesson.title}` : "已是最後一部影片");
    elements.previousVideo.title = previousLesson ? `上一部：${previousLesson.title}` : "已是第一部影片";
    elements.nextVideo.title = nextLesson ? `下一部：${nextLesson.title}` : "已是最後一部影片";
  }

  async function navigatePlaybackSequence(offset) {
    if (!state.activeLesson || elements.player?.dataset.navigationBusy === "true") return;
    const currentIndex = state.playbackSequenceLessonIds.indexOf(state.activeLesson.id);
    const lessonId = state.playbackSequenceLessonIds[currentIndex + offset];
    const lesson = state.lessons.find(item => item.id === lessonId);
    if (!lesson) return;
    if (!closeNoteDialog(false, { restoreFocus: false })) return;
    elements.player.dataset.navigationBusy = "true";
    updateSequenceControls();
    try {
      updateSelectedCourseForLesson(lesson);
      renderLessons();
      await startPlayback(lesson);
    } finally {
      delete elements.player.dataset.navigationBusy;
      updateSequenceControls();
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
    const clips = state.activeLesson?.clips || [];
    const visitedClips = clips.filter(clip => clip.positionSeconds <= current + 0.25);
    const active = visitedClips[visitedClips.length - 1];
    elements.clipList?.querySelectorAll("[data-clip-id]").forEach(button => {
      button.setAttribute("aria-current", String(button.dataset.clipId === active?.id));
    });
  }

  function updatePlayButtons() {
    const paused = elements.video.paused;
    elements.playToggle.querySelector("span").textContent = paused ? "▶" : "❚❚";
    elements.playToggle.setAttribute("aria-label", paused ? "播放影片" : "暫停影片");
    elements.centrePlay.hidden = true;
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

  function showSeekFeedback(seconds) {
    if (!elements.seekFeedback) return;
    window.clearTimeout(state.seekFeedbackTimer);
    const backward = seconds < 0;
    elements.seekFeedback.dataset.direction = backward ? "backward" : "forward";
    elements.seekFeedback.textContent = backward ? "↶ 5 秒" : "5 秒 ↷";
    elements.seekFeedback.classList.remove("is-visible");
    window.requestAnimationFrame(() => elements.seekFeedback?.classList.add("is-visible"));
    state.seekFeedbackTimer = window.setTimeout(() => elements.seekFeedback?.classList.remove("is-visible"), 650);
  }

  function seekBy(seconds) {
    if (!state.playback || elements.playerPlaceholder.hidden === false) return;
    const current = Number.isFinite(elements.video.currentTime) ? elements.video.currentTime : 0;
    const duration = Number.isFinite(elements.video.duration) && elements.video.duration > 0 ? elements.video.duration : Infinity;
    elements.video.currentTime = Math.max(0, Math.min(duration, current + seconds));
    updatePlayerControls();
    showSeekFeedback(seconds);
    showControlsTemporarily();
  }

  function handleMobileSeekPointer(event) {
    if (!state.playback || elements.playerPlaceholder.hidden === false) return;
    event.preventDefault();
    event.stopPropagation();
    const side = event.currentTarget.dataset.mobileSeekZone;
    if (event.pointerType === "mouse") {
      void togglePlayback();
      showControlsTemporarily();
      return;
    }
    if (!['touch', 'pen'].includes(event.pointerType)) return;
    const now = window.performance.now();
    const isDoubleTap = state.mobileTapSide === side && now - state.mobileTapAt <= 340;
    if (isDoubleTap) {
      window.clearTimeout(state.mobileTapTimer);
      state.mobileTapTimer = 0;
      state.mobileTapAt = 0;
      state.mobileTapSide = "";
      seekBy(side === "backward" ? -5 : 5);
      return;
    }
    window.clearTimeout(state.mobileTapTimer);
    state.mobileTapSide = side;
    state.mobileTapAt = now;
    state.mobileTapTimer = window.setTimeout(() => {
      state.mobileTapTimer = 0;
      state.mobileTapAt = 0;
      state.mobileTapSide = "";
      void togglePlayback();
      showControlsTemporarily();
    }, 360);
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
    if (!state.playback || ["INPUT", "BUTTON", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
    const key = event.key.toLowerCase();
    if (key === "k") {
      event.preventDefault();
      void togglePlayback();
    } else if (key === "m") {
      elements.video.muted = !elements.video.muted;
      updateMuteControl();
    } else if (key === "f") {
      event.preventDefault();
      void toggleFullscreen();
    }
    showControlsTemporarily();
  }

  function handlePlaybackSpacebar(event) {
    if (event.code !== "Space" && event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const isSpace = event.code === "Space";
    const isArrow = event.key === "ArrowLeft" || event.key === "ArrowRight";
    if ((!isSpace && !isArrow) || !state.playback || elements.playerSection.hidden) return;
    if (isSpace && event.repeat) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (!elements.endedOverlay.hidden || !elements.clipEditor.hidden) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.matches("input, textarea, select, button, a[href], [contenteditable='true']")
      || target?.closest("input, textarea, select, button, a[href], [contenteditable='true'], dialog[open], [role='dialog']:not([hidden])")) return;
    event.preventDefault();
    event.stopPropagation();
    if (isSpace) {
      void togglePlayback();
      showControlsTemporarily();
    } else {
      seekBy(event.key === "ArrowLeft" ? -5 : 5);
    }
  }

  function trapOverlayFocus(event, container) {
    if (event.key !== "Tab" || !container) return;
    const focusable = Array.from(container.querySelectorAll("button:not([disabled]):not([hidden]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"))
      .filter(element => !element.closest("[hidden]"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
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
      const qualitySwitch = state.qualitySwitch;
      const requestedPosition = qualitySwitch ? qualitySwitch.position : state.playback.resumeAt;
      const maximumPosition = qualitySwitch
        ? Math.max(0, elements.video.duration || 0)
        : Math.max(0, (elements.video.duration || 0) - 3);
      const resumeAt = Math.min(Math.max(0, requestedPosition), maximumPosition);
      if ((qualitySwitch && resumeAt > 0) || (!qualitySwitch && resumeAt > 2)) elements.video.currentTime = resumeAt;
      if (qualitySwitch) {
        elements.video.volume = qualitySwitch.volume;
        elements.video.muted = qualitySwitch.muted;
        applyPlaybackRate(qualitySwitch.rate);
        state.qualitySwitch = null;
        configureQualitySelector();
      } else {
        state.playback.resumeAt = 0;
        applyPlaybackRate(state.playbackRate);
      }
      elements.playerPlaceholder.hidden = true;
      elements.playerControls.hidden = false;
      elements.player.dataset.playbackReady = "true";
      elements.centrePlay.hidden = true;
      if (!qualitySwitch && elements.notePanel.hidden) elements.player.focus({ preventScroll: true });
      updatePlayerControls();
      renderClips();
      updatePlayButtons();
      showControlsTemporarily();
      if (qualitySwitch?.wasPlaying) void elements.video.play().catch(() => showToast("畫質已切換，請按播放繼續。"));
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
      showFeedbackOverlay({ pause: false });
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
      if (!elements.video.paused && !elements.player.contains(document.activeElement)) elements.player.dataset.controlsHidden = "true";
    });
    elements.player.addEventListener("keydown", handlePlayerKeydown);
    elements.video.addEventListener("click", () => void togglePlayback());
    elements.mobileSeekZones.forEach(zone => {
      zone.addEventListener("pointerup", handleMobileSeekPointer);
      zone.addEventListener("click", event => event.preventDefault());
    });
    elements.centrePlay.addEventListener("click", () => void togglePlayback());
    elements.previousVideo?.addEventListener("click", () => void navigatePlaybackSequence(-1));
    elements.playToggle.addEventListener("click", () => void togglePlayback());
    elements.nextVideo?.addEventListener("click", () => void navigatePlaybackSequence(1));
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
      if (state.clipMode) openClipEditor(Number(elements.seek.value));
    });
    elements.seek.addEventListener("pointerup", () => { state.seeking = false; });
    elements.playbackSpeed?.addEventListener("change", () => applyPlaybackRate(elements.playbackSpeed.value));
    elements.video.addEventListener("ratechange", () => {
      if (PLAYBACK_RATES.includes(elements.video.playbackRate) && elements.playbackSpeed) elements.playbackSpeed.value = String(elements.video.playbackRate);
    });
    elements.playbackQuality?.addEventListener("change", () => switchPlaybackQuality(elements.playbackQuality.value));
    elements.pinClip?.addEventListener("click", beginClipCreation);
    elements.clipEditor?.addEventListener("submit", event => {
      event.preventDefault();
      void saveClip(elements.clipTitle.value);
    });
    document.querySelector("[data-skip-clip-title]")?.addEventListener("click", () => void saveClip(""));
    document.querySelector("[data-cancel-clip]")?.addEventListener("click", () => cancelClipCreation({ resume: true }));
    elements.clipRailToggle?.addEventListener("click", () => setClipRailOpen(elements.clipRailToggle.getAttribute("aria-expanded") !== "true"));
    document.querySelector("[data-clip-rail-close]")?.addEventListener("click", () => setClipRailOpen(false));
    elements.feedbackRatings.forEach(input => input.addEventListener("change", scheduleLessonFeedbackSave));
    elements.openFeedback?.addEventListener("click", () => showFeedbackOverlay({ pause: true }));
    elements.closeFeedback?.addEventListener("click", () => closeFeedbackOverlay({ resume: true }));
    elements.endedOverlay?.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFeedbackOverlay({ resume: !elements.video.ended });
        return;
      }
      trapOverlayFocus(event, elements.endedOverlay);
    });
    elements.clipEditor?.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelClipCreation({ resume: true });
        return;
      }
      trapOverlayFocus(event, elements.clipEditor);
    });
    elements.replayVideo?.addEventListener("click", () => {
      closeFeedbackOverlay({ resume: false, restoreFocus: false });
      elements.video.currentTime = 0;
      void elements.video.play().then(() => elements.video.focus({ preventScroll: true })).catch(() => {
        elements.playToggle.focus({ preventScroll: true });
        showToast("請按播放開始重看。");
      });
    });
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
      renderAvailableStudents();
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
      populateR2CourseOptions(elements.r2PublishCourse?.value || "");
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
    state.students.filter(student => student.videoKey).forEach(student => elements.entitlementStudent.append(new Option(`${student.name} · ${student.videoKey}`, student.id)));
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
    return state.students.filter(student => student.videoKey).filter(student => {
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
    const activatedStudents = state.students.filter(student => student.videoKey);
    elements.studentRows.replaceChildren();
    elements.studentsState.hidden = true;
    elements.studentTable.hidden = false;
    elements.resultCount.hidden = false;
    elements.resultCount.textContent = `顯示 ${students.length} / ${activatedStudents.length} 位已啟用學生`;

    if (!students.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.textContent = activatedStudents.length ? "沒有符合搜尋條件的學生。" : "目前未有已啟用的錄影班學生。請到「新增學生」啟用帳戶。";
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

  function normalizeAdminFeedback(value) {
    const row = value && typeof value === "object" ? value : {};
    const feedback = normalizeLessonFeedback(row);
    return {
      studentId: String(row.studentId || row.student_id || ""),
      studentName: String(row.studentName || row.student_name || "未命名學生"),
      videoKey: String(row.videoKey || row.video_key || ""),
      lessonId: String(row.lessonId || row.lesson_id || ""),
      lessonTitle: String(row.lessonTitle || row.lesson_title || "未命名課堂"),
      courseCode: String(row.courseCode || row.course_code || "").toLowerCase(),
      ...feedback
    };
  }

  async function loadAdminFeedback() {
    if (!state.adminSession?.token || !elements.adminFeedbackState) return;
    elements.adminFeedbackTable.hidden = true;
    elements.feedbackResultCount.hidden = true;
    showInlineState(elements.adminFeedbackState, "正在載入影片評分⋯");
    if (elements.refreshFeedback) elements.refreshFeedback.disabled = true;
    try {
      const payload = await apiRequest("/v1/admin/feedback", { token: state.adminSession.token });
      const value = unwrap(payload);
      const rows = Array.isArray(value) ? value : (value?.feedback || value?.items || []);
      state.adminFeedback = rows.map(normalizeAdminFeedback).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      const selected = elements.feedbackCourseFilter.value || "all";
      const codes = Array.from(new Set(state.adminFeedback.map(item => item.courseCode).filter(Boolean)));
      elements.feedbackCourseFilter.replaceChildren(new Option("所有課程", "all"));
      codes.forEach(code => {
        const course = state.adminCourses.find(item => item.id === code) || COURSE_CATALOG.find(item => item.id === code);
        elements.feedbackCourseFilter.append(new Option(course?.title || code.toUpperCase(), code));
      });
      if (selected === "all" || codes.includes(selected)) elements.feedbackCourseFilter.value = selected;
      renderAdminFeedback();
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      showInlineState(elements.adminFeedbackState, error.message, "error", loadAdminFeedback);
    } finally {
      if (elements.refreshFeedback) elements.refreshFeedback.disabled = false;
    }
  }

  function renderAdminFeedback() {
    if (!elements.feedbackRows) return;
    const query = normalizeSearchText(elements.feedbackSearch?.value || "");
    const courseCode = String(elements.feedbackCourseFilter?.value || "all");
    const rows = state.adminFeedback.filter(item => {
      if (courseCode !== "all" && item.courseCode !== courseCode) return false;
      if (query && !normalizeSearchText(`${item.studentName} ${item.studentId} ${item.lessonTitle}`).includes(query)) return false;
      return true;
    });
    elements.feedbackRows.replaceChildren();
    elements.adminFeedbackState.hidden = true;
    elements.adminFeedbackTable.hidden = false;
    elements.feedbackResultCount.hidden = false;
    elements.feedbackResultCount.textContent = `顯示 ${rows.length} / ${state.adminFeedback.length} 份評分`;

    if (!rows.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.textContent = state.adminFeedback.length ? "沒有符合搜尋條件的評分。" : "學生尚未提交影片評分。";
      cell.style.padding = "42px";
      cell.style.textAlign = "center";
      cell.style.color = "#85868d";
      row.append(cell);
      elements.feedbackRows.append(row);
      return;
    }

    const scoreCell = value => {
      const cell = document.createElement("td");
      if (value == null) cell.textContent = "—";
      else {
        const score = document.createElement("span");
        score.className = "feedback-score";
        score.textContent = String(value);
        score.setAttribute("aria-label", `${value} / 5`);
        cell.append(score);
      }
      return cell;
    };

    rows.forEach(item => {
      const row = document.createElement("tr");
      const student = document.createElement("td");
      const studentWrap = document.createElement("span");
      studentWrap.className = "student-name";
      const studentName = document.createElement("strong");
      studentName.textContent = item.studentName;
      const studentId = document.createElement("small");
      studentId.textContent = item.studentId;
      studentWrap.append(studentName, studentId);
      student.append(studentWrap);
      const lesson = document.createElement("td");
      const lessonWrap = document.createElement("span");
      lessonWrap.className = "student-name";
      const lessonTitle = document.createElement("strong");
      lessonTitle.textContent = item.lessonTitle;
      const course = document.createElement("small");
      course.textContent = state.adminCourses.find(value => value.id === item.courseCode)?.title || item.courseCode.toUpperCase();
      lessonWrap.append(lessonTitle, course);
      lesson.append(lessonWrap);
      const updated = document.createElement("td");
      const parsed = new Date(item.updatedAt);
      updated.textContent = Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString("zh-HK", { dateStyle: "medium", timeStyle: "short" });
      row.append(student, lesson, scoreCell(item.pictureQuality), scoreCell(item.explanationQuality), scoreCell(item.audioQuality), updated);
      elements.feedbackRows.append(row);
    });
  }

  function csvCell(value) {
    let content = String(value ?? "");
    if (/^[=+\-@]/.test(content)) content = `'${content}`;
    return `"${content.replace(/"/g, '""')}"`;
  }

  function exportAdminFeedbackCsv() {
    if (!state.adminFeedback.length) {
      showToast("目前沒有可匯出的影片評分。", "error");
      return;
    }
    const exportedAt = new Date().toISOString();
    const headers = ["Student name", "UUID", "Video class key", "Video title", "Rate 1", "Rate 2", "Rate 3", "Update time", "Exported date"];
    const lines = [headers.map(csvCell).join(",")];
    state.adminFeedback.forEach(item => {
      const updated = new Date(item.updatedAt);
      lines.push([
        item.studentName,
        item.studentId,
        item.videoKey,
        item.lessonTitle,
        item.pictureQuality ?? "",
        item.explanationQuality ?? "",
        item.audioQuality ?? "",
        Number.isNaN(updated.getTime()) ? item.updatedAt : updated.toISOString(),
        exportedAt
      ].map(csvCell).join(","));
    });
    const blob = new Blob(["\ufeff", lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `video-class-feedback-${exportedAt.slice(0, 10)}.csv`;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`已匯出 ${state.adminFeedback.length} 份評分。`, "success");
  }

  function normalizeAdminLesson(value, index) {
    const lesson = value && typeof value === "object" ? value : {};
    const renditions = (Array.isArray(lesson.renditions) ? lesson.renditions : []).map(normalizeRendition).filter(item => item.qualityCode);
    return {
      id: String(lesson.id || lesson.lessonId || lesson.lesson_id || ""),
      slug: String(lesson.slug || ""),
      title: String(lesson.title || lesson.name || `課堂 ${index + 1}`),
      description: String(lesson.description || ""),
      courseCode: String(lesson.courseCode || lesson.course_code || "").toLowerCase(),
      courseTitle: String(lesson.courseTitle || lesson.course_title || lesson.courseLabel || lesson.course_label || ""),
      durationSeconds: Math.max(0, Number(lesson.durationSeconds || lesson.duration_seconds || 0)),
      order: Number(lesson.sortOrder || lesson.sort_order || lesson.order || index + 1),
      published: lesson.published !== false,
      isPrivate: lesson.isPrivate === true || lesson.is_private === true,
      hasThumbnail: lesson.hasThumbnail === true || lesson.has_thumbnail === true,
      totalViewCount: Math.max(0, Number(lesson.totalViewCount ?? lesson.total_view_count ?? lesson.viewCount ?? lesson.view_count ?? 0) || 0),
      renditions,
      createdAt: String(lesson.createdAt || lesson.created_at || ""),
      updatedAt: String(lesson.updatedAt || lesson.updated_at || "")
    };
  }

  async function loadAdminLessons() {
    if (!state.adminSession?.token || !elements.adminLessonsState) return;
    elements.adminLessonsTable.hidden = true;
    showInlineState(elements.adminLessonsState, "正在載入影片名單⋯");
    if (elements.adminLessonsRefresh) elements.adminLessonsRefresh.disabled = true;
    try {
      const payload = await apiRequest("/v1/admin/lessons", { token: state.adminSession.token });
      const value = unwrap(payload);
      const rows = Array.isArray(value) ? value : (value?.lessons || value?.items || []);
      state.adminLessons = rows.map(normalizeAdminLesson).filter(lesson => lesson.id).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-Hant"));
      renderAdminLessons();
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      showInlineState(elements.adminLessonsState, error.message, "error", loadAdminLessons);
    } finally {
      if (elements.adminLessonsRefresh) elements.adminLessonsRefresh.disabled = false;
    }
  }

  function renderAdminLessons() {
    if (!elements.adminLessonsRows || !elements.adminLessonsState || !elements.adminLessonsTable) return;
    elements.adminLessonsRows.replaceChildren();
    if (!state.adminLessons.length) {
      elements.adminLessonsTable.hidden = true;
      showInlineState(elements.adminLessonsState, "目前未有錄影班影片。", "empty");
      return;
    }
    state.adminLessons.forEach(lesson => {
      const row = document.createElement("tr");
      row.dataset.lessonId = lesson.id;
      const thumbnailCell = document.createElement("td");
      const thumbnail = document.createElement("div");
      thumbnail.className = `admin-lesson-thumbnail${lesson.isPrivate ? " is-private" : ""}`;
      thumbnail.textContent = lesson.hasThumbnail ? "THUMBNAIL" : "VIDEO";
      thumbnailCell.append(thumbnail);

      const titleCell = document.createElement("td");
      const titleWrap = document.createElement("span");
      titleWrap.className = "student-name";
      const title = document.createElement("strong");
      title.textContent = lesson.title;
      const course = document.createElement("small");
      course.textContent = lesson.courseTitle || state.adminCourses.find(item => item.id === lesson.courseCode)?.title || lesson.courseCode.toUpperCase() || "未分類";
      titleWrap.append(title, course);
      titleCell.append(titleWrap);

      const duration = document.createElement("td");
      duration.textContent = lesson.durationSeconds ? formatDuration(lesson.durationSeconds) : "—";
      const views = document.createElement("td");
      views.className = "admin-lesson-view-count";
      views.textContent = lesson.totalViewCount.toLocaleString("zh-HK");
      views.title = `所有學生合共觀看 ${lesson.totalViewCount.toLocaleString("zh-HK")} 次`;
      const statusCell = document.createElement("td");
      const status = document.createElement("span");
      status.className = `lesson-privacy-status${lesson.isPrivate ? " is-private" : ""}`;
      status.textContent = lesson.isPrivate ? "私人" : lesson.published ? "可觀看" : "未發布";
      statusCell.append(status);
      const actionCell = document.createElement("td");
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "privacy-toggle-button";
      toggle.setAttribute("aria-pressed", String(lesson.isPrivate));
      toggle.textContent = lesson.isPrivate ? "恢復觀看" : "設為私人";
      toggle.addEventListener("click", () => void setAdminLessonPrivacy(lesson, !lesson.isPrivate, toggle));
      actionCell.append(toggle);
      row.append(thumbnailCell, titleCell, duration, views, statusCell, actionCell);
      elements.adminLessonsRows.append(row);
    });
    elements.adminLessonsState.hidden = true;
    elements.adminLessonsTable.hidden = false;
  }

  async function setAdminLessonPrivacy(lesson, isPrivate, button) {
    if (!state.adminSession?.token || !lesson?.id) return;
    if (isPrivate && !window.confirm(`確定把「${lesson.title}」設為私人？正在播放的授權會立即失效。`)) return;
    button.disabled = true;
    try {
      const payload = await apiRequest(`/v1/admin/lessons/${encodeURIComponent(lesson.id)}/privacy`, {
        method: "PATCH",
        token: state.adminSession.token,
        body: { private: isPrivate }
      });
      const value = unwrap(payload)?.lesson || unwrap(payload) || {};
      lesson.isPrivate = value.isPrivate === true || value.is_private === true || isPrivate;
      lesson.updatedAt = String(value.updatedAt || value.updated_at || lesson.updatedAt);
      renderAdminLessons();
      showToast(isPrivate ? "影片已設為私人；R2 檔案仍然保留。" : "影片已恢復給獲授權學生觀看。", "success");
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      button.disabled = false;
      showToast(error.message, "error");
    }
  }

  function formatByteSize(bytes) {
    const amount = Math.max(0, Number(bytes) || 0);
    if (amount < 1024) return `${Math.round(amount)} B`;
    const units = ["KB", "MB", "GB", "TB"];
    let value = amount / 1024;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }
    return `${value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2)} ${units[index]}`;
  }

  function r2ObjectFileName(item) {
    const custom = item?.customMetadata && typeof item.customMetadata === "object" ? item.customMetadata : {};
    const original = String(custom.originalFilename || custom.originalFileName || custom.original_filename || custom.fileName || custom.file_name || "").trim();
    if (original) return original;
    const pieces = String(item?.key || "").split("/");
    return pieces.at(-1) || String(item?.key || "未命名影片");
  }

  function normalizeAdminR2Object(value) {
    const item = value && typeof value === "object" ? value : {};
    const customMetadata = item.customMetadata && typeof item.customMetadata === "object"
      ? item.customMetadata
      : (item.custom_metadata && typeof item.custom_metadata === "object" ? item.custom_metadata : {});
    const httpMetadata = item.httpMetadata && typeof item.httpMetadata === "object"
      ? item.httpMetadata
      : (item.http_metadata && typeof item.http_metadata === "object" ? item.http_metadata : {});
    const durationSeconds = Number(item.durationSeconds ?? item.duration_seconds ?? customMetadata.durationSeconds ?? customMetadata.duration_seconds ?? 0);
    return {
      key: String(item.key || item.objectKey || item.object_key || ""),
      size: Math.max(0, Number(item.size || item.byteLength || item.byte_length || 0)),
      uploaded: String(item.uploaded || item.uploadedAt || item.uploaded_at || ""),
      etag: String(item.etag || ""),
      contentType: String(item.contentType || item.content_type || httpMetadata.contentType || httpMetadata.content_type || "video/mp4"),
      customMetadata,
      httpMetadata,
      durationSeconds: Number.isFinite(durationSeconds) && durationSeconds > 0 ? Math.round(durationSeconds) : 0,
      assigned: item.assigned === true || item.published === true,
      published: item.published === true,
      lessonId: String(item.lessonId || item.lesson_id || ""),
      lessonSlug: String(item.lessonSlug || item.lesson_slug || ""),
      lessonTitle: String(item.lessonTitle || item.lesson_title || ""),
      isPrivate: item.isPrivate === true || item.is_private === true,
      isSource: item.isSource === true || item.is_source === true,
      isThumbnail: item.isThumbnail === true || item.is_thumbnail === true,
      renditionQualityCodes: Array.isArray(item.renditionQualityCodes || item.rendition_quality_codes)
        ? (item.renditionQualityCodes || item.rendition_quality_codes).map(String)
        : []
    };
  }

  async function loadAdminR2Objects({ append = false } = {}) {
    if (!state.adminSession?.token || !elements.r2State || !elements.r2List) return;
    if (!append) {
      state.adminR2Items = [];
      state.adminR2Cursor = "";
      elements.r2List.hidden = true;
      showInlineState(elements.r2State, "正在讀取私人 R2 影片庫⋯");
    }
    if (elements.r2Refresh) elements.r2Refresh.disabled = true;
    if (elements.r2LoadMore) elements.r2LoadMore.disabled = true;
    try {
      const parameters = new URLSearchParams({ limit: "50" });
      const query = String(elements.r2Search?.value || state.adminR2Query || "").trim();
      state.adminR2Query = query;
      if (query) parameters.set("q", query);
      if (append && state.adminR2Cursor) parameters.set("cursor", state.adminR2Cursor);
      const payload = await apiRequest(`/v1/admin/r2/objects?${parameters}`, { token: state.adminSession.token, timeoutMs: 45000 });
      const value = unwrap(payload) || {};
      const rows = Array.isArray(value) ? value : (value.items || value.objects || []);
      const normalized = rows.map(normalizeAdminR2Object).filter(item => item.key);
      const byKey = new Map((append ? state.adminR2Items : []).map(item => [item.key, item]));
      normalized.forEach(item => byKey.set(item.key, item));
      state.adminR2Items = [...byKey.values()];
      state.adminR2Cursor = String(value.cursor || value.nextCursor || value.next_cursor || "");
      state.adminR2Truncated = value.truncated === true && Boolean(state.adminR2Cursor);
      renderAdminR2Objects();
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      showInlineState(elements.r2State, error.message, "error", () => loadAdminR2Objects({ append: false }));
    } finally {
      if (elements.r2Refresh) elements.r2Refresh.disabled = false;
      if (elements.r2LoadMore) elements.r2LoadMore.disabled = false;
    }
  }

  function renderAdminR2Objects() {
    if (!elements.r2List || !elements.r2State || !elements.r2LoadMore) return;
    elements.r2List.replaceChildren();
    if (!state.adminR2Items.length) {
      elements.r2List.hidden = true;
      elements.r2LoadMore.hidden = !state.adminR2Truncated;
      showInlineState(elements.r2State, state.adminR2Query ? "沒有符合搜尋條件的 R2 影片。" : "私人 R2 Bucket 目前沒有可發佈的影片。", "empty");
      return;
    }
    state.adminR2Items.forEach(item => {
      const card = document.createElement("article");
      card.className = "r2-object-card";
      card.setAttribute("role", "listitem");
      const details = document.createElement("div");
      details.className = "r2-object-card__details";
      const heading = document.createElement("div");
      heading.className = "r2-object-card__heading";
      const name = document.createElement("strong");
      name.textContent = r2ObjectFileName(item);
      const badge = document.createElement("span");
      badge.className = `r2-object-card__badge${item.assigned ? " is-published" : ""}`;
      badge.textContent = item.assigned ? (item.published ? (item.isPrivate ? "已發佈 · 私人" : "已發佈") : "已建立課堂") : "未發佈";
      heading.append(name, badge);
      const path = document.createElement("small");
      path.className = "r2-object-card__path";
      path.textContent = item.key;
      const meta = document.createElement("div");
      meta.className = "r2-object-card__meta";
      const uploaded = item.uploaded ? new Date(item.uploaded).toLocaleString("zh-HK") : "上載時間不詳";
      [formatByteSize(item.size), item.contentType, uploaded, item.durationSeconds ? formatDuration(item.durationSeconds) : "未有片長資料"]
        .forEach(value => {
          const span = document.createElement("span");
          span.textContent = value;
          meta.append(span);
        });
      if (item.lessonTitle) {
        const lesson = document.createElement("span");
        lesson.textContent = `課堂：${item.lessonTitle}`;
        meta.append(lesson);
      }
      details.append(heading, path, meta);
      const actions = document.createElement("div");
      actions.className = "r2-object-card__actions";
      const publish = document.createElement("button");
      publish.type = "button";
      publish.disabled = item.assigned;
      publish.textContent = item.assigned ? "已建立課堂" : "填寫資料並發佈";
      publish.addEventListener("click", () => openR2PublishDialog(item));
      actions.append(publish);
      card.append(details, actions);
      elements.r2List.append(card);
    });
    elements.r2State.hidden = true;
    elements.r2List.hidden = false;
    elements.r2LoadMore.hidden = !state.adminR2Truncated;
  }

  async function readLocalVideoDuration(file) {
    if (!(file instanceof File) || !file.size) return 0;
    const objectUrl = URL.createObjectURL(file);
    try {
      return await new Promise(resolve => {
        const video = document.createElement("video");
        let settled = false;
        const finish = value => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          video.removeAttribute("src");
          video.load();
          resolve(Number.isFinite(value) && value > 0 ? Math.round(value) : 0);
        };
        const timer = window.setTimeout(() => finish(0), 12000);
        video.preload = "metadata";
        video.onloadedmetadata = () => finish(video.duration);
        video.onerror = () => finish(0);
        video.src = objectUrl;
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function inspectR2UploadFile() {
    const file = elements.r2UploadFile?.files?.[0];
    state.adminR2FileDuration = 0;
    if (!file || !elements.r2UploadMeta) {
      if (elements.r2UploadMeta) elements.r2UploadMeta.hidden = true;
      return;
    }
    elements.r2UploadMeta.hidden = false;
    elements.r2UploadMeta.textContent = `${file.name} · ${formatByteSize(file.size)} · 正在讀取片長⋯`;
    const duration = await readLocalVideoDuration(file);
    if (elements.r2UploadFile?.files?.[0] !== file) return;
    state.adminR2FileDuration = duration;
    elements.r2UploadMeta.textContent = `${file.name} · ${formatByteSize(file.size)} · ${duration ? `片長 ${formatDuration(duration)}` : "未能自動讀取片長（發佈時可手動填寫）"}`;
  }

  function setR2UploadProgress(completedBytes, totalBytes, label) {
    const percent = totalBytes ? Math.min(100, Math.round((completedBytes / totalBytes) * 100)) : 0;
    if (elements.r2UploadProgress) elements.r2UploadProgress.hidden = false;
    if (elements.r2UploadProgressLabel) elements.r2UploadProgressLabel.textContent = label;
    if (elements.r2UploadProgressPercent) elements.r2UploadProgressPercent.textContent = `${percent}%`;
    if (elements.r2UploadProgressBar) {
      elements.r2UploadProgressBar.value = percent;
      elements.r2UploadProgressBar.textContent = `${percent}%`;
    }
  }

  async function abortAdminR2Multipart(upload) {
    if (!upload?.uploadId || !upload?.uploadToken || !state.adminSession?.token) return;
    try {
      await apiRequest(`/v1/admin/r2/uploads/${encodeURIComponent(upload.uploadId)}`, {
        method: "DELETE",
        token: state.adminSession.token,
        headers: { "X-Video-Upload-Token": upload.uploadToken },
        timeoutMs: 30000
      });
    } catch { /* R2 also expires unfinished multipart uploads automatically. */ }
  }

  async function cancelAdminR2Upload() {
    const upload = state.adminR2Upload;
    if (!upload) return;
    upload.cancelled = true;
    upload.controller.abort();
    if (elements.r2UploadStatus) {
      elements.r2UploadStatus.dataset.state = "";
      elements.r2UploadStatus.textContent = "正在取消上載⋯";
    }
    await abortAdminR2Multipart(upload);
  }

  async function startAdminR2Upload() {
    const file = elements.r2UploadFile?.files?.[0];
    if (!state.adminSession?.token || !file || state.adminR2Upload) return;
    const controller = new AbortController();
    const upload = { controller, cancelled: false, uploadId: "", uploadToken: "", key: "" };
    state.adminR2Upload = upload;
    elements.r2UploadStart.disabled = true;
    elements.r2UploadFile.disabled = true;
    elements.r2UploadCancel.hidden = false;
    if (elements.r2UploadStatus) {
      elements.r2UploadStatus.dataset.state = "";
      elements.r2UploadStatus.textContent = "正在建立私人 R2 上載⋯";
    }
    setR2UploadProgress(0, file.size, "準備分段上載⋯");
    try {
      const initPayload = await apiRequest("/v1/admin/r2/uploads", {
        method: "POST",
        token: state.adminSession.token,
        body: {
          fileName: file.name,
          sizeBytes: file.size,
          contentType: file.type || undefined,
          durationSeconds: state.adminR2FileDuration || undefined
        },
        timeoutMs: 45000,
        signal: controller.signal
      });
      const init = unwrap(initPayload)?.upload || unwrap(initPayload) || {};
      upload.uploadId = String(init.uploadId || init.upload_id || "");
      upload.uploadToken = String(init.uploadToken || init.upload_token || "");
      upload.key = String(init.key || init.objectKey || init.object_key || "");
      const partSize = Math.max(5 * 1024 * 1024, Number(init.partSize || init.part_size || 0));
      const partCount = Number(init.partCount || init.part_count || Math.ceil(file.size / partSize));
      if (!upload.uploadId || !upload.uploadToken || !upload.key || !Number.isInteger(partCount) || partCount < 1) {
        throw new ApiError("R2 沒有傳回有效的分段上載資料。", 0, "INVALID_UPLOAD_SESSION");
      }
      const parts = new Array(partCount);
      let nextPart = 0;
      let completedBytes = 0;
      const uploadWorker = async () => {
        while (nextPart < partCount && !upload.cancelled) {
          const index = nextPart;
          nextPart += 1;
          const partNumber = index + 1;
          const start = index * partSize;
          const chunk = file.slice(start, Math.min(file.size, start + partSize));
          const payload = await apiRequest(`/v1/admin/r2/uploads/${encodeURIComponent(upload.uploadId)}/parts/${partNumber}`, {
            method: "PUT",
            token: state.adminSession.token,
            headers: {
              "Content-Type": "application/octet-stream",
              "X-Video-Upload-Token": upload.uploadToken
            },
            rawBody: chunk,
            timeoutMs: 20 * 60 * 1000,
            signal: controller.signal
          });
          const part = unwrap(payload)?.part || unwrap(payload) || {};
          const etag = String(part.etag || "");
          if (!etag) throw new ApiError(`第 ${partNumber} 部分沒有有效 ETag。`, 0, "INVALID_UPLOAD_PART");
          parts[index] = { partNumber, etag };
          completedBytes += chunk.size;
          setR2UploadProgress(completedBytes, file.size, `已上載 ${partNumber} / ${partCount} 部分`);
        }
      };
      await Promise.all(Array.from({ length: Math.min(3, partCount) }, () => uploadWorker()));
      if (upload.cancelled) throw new ApiError("上載已取消。", 0, "UPLOAD_CANCELLED");
      setR2UploadProgress(file.size, file.size, "正在完成及核對 R2 影片⋯");
      const completedPayload = await apiRequest(`/v1/admin/r2/uploads/${encodeURIComponent(upload.uploadId)}/complete`, {
        method: "POST",
        token: state.adminSession.token,
        headers: { "X-Video-Upload-Token": upload.uploadToken },
        body: { uploadToken: upload.uploadToken, parts },
        timeoutMs: 2 * 60 * 1000,
        signal: controller.signal
      });
      const object = normalizeAdminR2Object({ ...(unwrap(completedPayload)?.object || unwrap(completedPayload) || {}), key: upload.key, durationSeconds: state.adminR2FileDuration });
      if (elements.r2UploadStatus) {
        elements.r2UploadStatus.dataset.state = "success";
        elements.r2UploadStatus.textContent = "影片已安全上載到私人 R2。現在可以填寫資料並發佈。";
      }
      showToast("影片已上載到私人 R2；尚未向學生發佈。", "success");
      await loadAdminR2Objects();
      const listed = state.adminR2Items.find(item => item.key === upload.key);
      openR2PublishDialog(listed || { ...object, key: upload.key, size: file.size, contentType: file.type, customMetadata: { originalFileName: file.name }, published: false });
      elements.r2UploadForm.reset();
      if (elements.r2UploadMeta) elements.r2UploadMeta.hidden = true;
    } catch (error) {
      if (!upload.cancelled) await abortAdminR2Multipart(upload);
      if (error.status === 401) return handleExpiredSession("admin");
      if (elements.r2UploadStatus) {
        elements.r2UploadStatus.dataset.state = upload.cancelled ? "" : "error";
        elements.r2UploadStatus.textContent = upload.cancelled ? "上載已取消，未完成的 R2 分段已清理。" : error.message;
      }
    } finally {
      if (state.adminR2Upload === upload) state.adminR2Upload = null;
      elements.r2UploadStart.disabled = false;
      elements.r2UploadFile.disabled = false;
      elements.r2UploadCancel.hidden = true;
    }
  }

  function populateR2CourseOptions(selectedCode = "") {
    if (!elements.r2PublishCourse) return;
    elements.r2PublishCourse.replaceChildren(new Option("請選擇課程", ""));
    state.adminCourses.filter(course => course.published !== false).forEach(course => {
      elements.r2PublishCourse.append(new Option(course.title || course.id.toUpperCase(), course.id));
    });
    if (selectedCode && state.adminCourses.some(course => course.id === selectedCode)) elements.r2PublishCourse.value = selectedCode;
  }

  function openR2PublishDialog(item) {
    if (!item?.key || item.assigned || !elements.r2PublishDialog) return;
    state.adminR2PublishItem = item;
    const fileName = r2ObjectFileName(item);
    const suggestedTitle = fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
    elements.r2PublishObject.textContent = item.key;
    elements.r2PublishTitle.value = suggestedTitle;
    elements.r2PublishDescription.value = "";
    elements.r2PublishDuration.value = item.durationSeconds || "";
    elements.r2PublishTags.value = "";
    elements.r2PublishStatus.textContent = "";
    elements.r2PublishStatus.dataset.state = "";
    populateR2CourseOptions(state.adminCourses.find(course => course.id === "dse")?.id || "");
    if (typeof elements.r2PublishDialog.showModal === "function") elements.r2PublishDialog.showModal();
    else elements.r2PublishDialog.setAttribute("open", "");
    window.setTimeout(() => elements.r2PublishTitle.focus({ preventScroll: true }), 0);
  }

  function closeR2PublishDialog() {
    state.adminR2PublishItem = null;
    if (!elements.r2PublishDialog) return;
    if (elements.r2PublishDialog.open && typeof elements.r2PublishDialog.close === "function") elements.r2PublishDialog.close();
    else elements.r2PublishDialog.removeAttribute("open");
  }

  async function publishAdminR2Object() {
    const item = state.adminR2PublishItem;
    if (!state.adminSession?.token || !item?.key) return;
    const title = elements.r2PublishTitle.value.trim();
    const courseCode = elements.r2PublishCourse.value;
    const durationSeconds = Math.round(Number(elements.r2PublishDuration.value));
    if (!title || !courseCode || !Number.isFinite(durationSeconds) || durationSeconds < 1 || durationSeconds > 86400) {
      elements.r2PublishStatus.dataset.state = "error";
      elements.r2PublishStatus.textContent = "請填寫影片標題、課程及正確片長。";
      return;
    }
    const tags = [...new Set(elements.r2PublishTags.value.split(/[,，\n]/).map(value => value.trim()).filter(Boolean))].slice(0, 20);
    const course = state.adminCourses.find(value => value.id === courseCode);
    const nextOrder = state.adminLessons.reduce((maximum, lesson) => Math.max(maximum, Number(lesson.order) || 0), 0) + 10;
    elements.r2PublishSubmit.disabled = true;
    elements.r2PublishStatus.dataset.state = "";
    elements.r2PublishStatus.textContent = "正在建立課堂及核對私人 R2 影片⋯";
    try {
      await apiRequest("/v1/admin/r2/publish", {
        method: "POST",
        token: state.adminSession.token,
        body: {
          objectKey: item.key,
          title,
          description: elements.r2PublishDescription.value.trim(),
          courseCode,
          courseLabel: course?.title || "錄影班",
          durationSeconds,
          sortOrder: nextOrder,
          tags
        },
        timeoutMs: 60000
      });
      item.assigned = true;
      item.published = true;
      closeR2PublishDialog();
      showToast(`「${title}」已發佈到錄影班。`, "success");
      await Promise.all([loadAdminR2Objects(), loadAdminLessons()]);
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      elements.r2PublishStatus.dataset.state = "error";
      elements.r2PublishStatus.textContent = error.message;
    } finally {
      elements.r2PublishSubmit.disabled = false;
    }
  }

  function renderAvailableStudents() {
    if (!elements.availableStudentsList || !elements.availableStudentsState) return;
    const query = normalizeSearchText(elements.availableStudentsSearch?.value || "");
    const available = state.students.filter(student => !student.videoKey).filter(student => !query || normalizeSearchText(`${student.name} ${student.id}`).includes(query));
    elements.availableStudentsList.replaceChildren();
    if (!available.length) {
      elements.availableStudentsList.hidden = true;
      showInlineState(elements.availableStudentsState, query ? "沒有符合搜尋條件的未啟用學生。" : "所有現有學生都已啟用錄影班，或目前未有學生帳戶。", "empty");
      return;
    }
    available.forEach(student => {
      const card = document.createElement("article");
      card.className = "available-student-card";
      const details = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = student.name;
      const id = document.createElement("small");
      id.textContent = student.id;
      details.append(name, id);
      const activate = document.createElement("button");
      activate.type = "button";
      activate.textContent = "產生 Key 並啟用";
      activate.addEventListener("click", () => void activateVideoStudent(student, activate));
      card.append(details, activate);
      elements.availableStudentsList.append(card);
    });
    elements.availableStudentsState.hidden = true;
    elements.availableStudentsList.hidden = false;
  }

  async function activateVideoStudent(student, button) {
    if (!state.adminSession?.token || !student?.id) return;
    button.disabled = true;
    button.textContent = "正在啟用⋯";
    try {
      await apiRequest(`/v1/admin/students/${encodeURIComponent(student.id)}/key`, {
        method: "POST",
        token: state.adminSession.token,
        body: { rotate: false }
      });
      showToast(`已為 ${student.name} 產生隨機 Key 並啟用錄影班。`, "success");
      await loadStudents();
    } catch (error) {
      if (error.status === 401) return handleExpiredSession("admin");
      button.disabled = false;
      button.textContent = "產生 Key 並啟用";
      showToast(error.message, "error");
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
    elements.dashboardToggles.forEach(button => button.addEventListener("click", () => {
      const scope = button.dataset.dashboardToggle;
      setDashboardExpanded(scope, !state.dashboardExpanded[scope]);
    }));
    elements.exportWatchHistory?.addEventListener("click", exportWatchHistoryCsv);
    elements.lessonSearch?.addEventListener("input", () => {
      state.libraryQuery = elements.lessonSearch.value;
      elements.clearLessonSearch.hidden = !state.libraryQuery;
      renderLessons();
    });
    elements.clearLessonSearch?.addEventListener("click", () => {
      state.libraryQuery = "";
      elements.lessonSearch.value = "";
      elements.clearLessonSearch.hidden = true;
      renderLessons();
      elements.lessonSearch.focus();
    });
    elements.openNote?.addEventListener("click", () => {
      if (elements.notePanel.hidden) openNoteDialog(state.activeLesson);
      else closeNoteDialog();
    });
    document.querySelectorAll("[data-note-collapse]").forEach(button => button.addEventListener("click", () => closeNoteDialog()));
    elements.noteContent?.addEventListener("input", updateNoteCount);
    elements.noteForm?.addEventListener("submit", event => {
      event.preventDefault();
      void saveLessonNote();
    });
    elements.printNotes?.addEventListener("click", () => window.print());
    elements.createPlaylist?.addEventListener("click", () => openPlaylistDialog(null));
    elements.createPlaylistInline?.addEventListener("click", () => void createPlaylistFromInput());
    elements.playlistChooserForm?.addEventListener("submit", event => {
      event.preventDefault();
      if (state.playlistLesson) void savePlaylistSelection();
      else void createPlaylistFromInput();
    });
    document.querySelectorAll("[data-close-playlist-dialog]").forEach(button => button.addEventListener("click", closePlaylistDialog));
    elements.playlistDialog?.addEventListener("cancel", event => {
      event.preventDefault();
      closePlaylistDialog();
    });
    elements.deletePlaylist?.addEventListener("click", () => void deleteSelectedPlaylist());
    elements.playlistSelectToggle?.addEventListener("click", () => {
      state.playlistSelectionMode = !state.playlistSelectionMode;
      state.playlistSelectionPlaylistId = state.selectedPlaylistId;
      state.playlistSelectedLessonIds.clear();
      renderPlaylists();
      elements.playlistSelectToggle.focus({ preventScroll: true });
    });
    elements.playlistRemoveSelected?.addEventListener("click", () => void removeSelectedPlaylistLessons());
    elements.adminPanelTabs.forEach(button => button.addEventListener("click", () => showAdminPanel(button.dataset.adminPanelTab)));
    elements.refreshFeedback?.addEventListener("click", () => void loadAdminFeedback());
    elements.exportFeedback?.addEventListener("click", exportAdminFeedbackCsv);
    elements.feedbackSearch?.addEventListener("input", renderAdminFeedback);
    elements.feedbackCourseFilter?.addEventListener("change", renderAdminFeedback);
    elements.adminLessonsRefresh?.addEventListener("click", () => void loadAdminLessons());
    elements.r2Refresh?.addEventListener("click", () => void loadAdminR2Objects());
    elements.r2LoadMore?.addEventListener("click", () => void loadAdminR2Objects({ append: true }));
    elements.r2Search?.addEventListener("input", () => {
      window.clearTimeout(state.adminR2SearchTimer);
      state.adminR2SearchTimer = window.setTimeout(() => void loadAdminR2Objects(), 280);
    });
    elements.r2UploadFile?.addEventListener("change", () => void inspectR2UploadFile());
    elements.r2UploadForm?.addEventListener("submit", event => {
      event.preventDefault();
      void startAdminR2Upload();
    });
    elements.r2UploadCancel?.addEventListener("click", () => void cancelAdminR2Upload());
    elements.r2PublishForm?.addEventListener("submit", event => {
      event.preventDefault();
      void publishAdminR2Object();
    });
    document.querySelectorAll("[data-close-r2-publish]").forEach(button => button.addEventListener("click", closeR2PublishDialog));
    elements.r2PublishDialog?.addEventListener("cancel", event => {
      event.preventDefault();
      closeR2PublishDialog();
    });
    elements.availableStudentsRefresh?.addEventListener("click", () => void loadStudents());
    elements.availableStudentsSearch?.addEventListener("input", renderAvailableStudents);
    elements.entitlementStudent?.addEventListener("change", () => showEntitlementEditor(elements.entitlementStudent.value));
    elements.entitlementsForm?.addEventListener("submit", event => {
      event.preventDefault();
      void saveStudentEntitlements();
    });
    const markStudentActivity = () => resetStudentInactivity();
    document.addEventListener("pointerdown", markStudentActivity, { passive: true });
    document.addEventListener("keydown", handlePlaybackSpacebar, true);
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
