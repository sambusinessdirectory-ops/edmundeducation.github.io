(() => {
  "use strict";

  const SESSION_KEY = "edmundModelEssayDownloadSession";
  const PAGE_SIZE = 20;
  const ADMIN_PAGE_SIZE = 20;
  const task2Essays = Array.isArray(window.EDMUND_MODEL_ESSAYS) ? window.EDMUND_MODEL_ESSAYS : [];
  const speakingFiles = Array.isArray(window.EDMUND_IELTS_SPEAKING_DOWNLOADS)
    ? window.EDMUND_IELTS_SPEAKING_DOWNLOADS
    : [];
  const readingFiles = Array.isArray(window.EDMUND_IELTS_READING_DOWNLOADS)
    ? window.EDMUND_IELTS_READING_DOWNLOADS
    : [];
  const questionData = window.EDMUND_MODEL_ESSAY_QUESTION_DATA || {};
  const task2Meta = window.EDMUND_MODEL_ESSAY_META || {};
  const speakingMeta = window.EDMUND_IELTS_SPEAKING_META || {};
  const readingMeta = window.EDMUND_IELTS_READING_META || {};
  const supabaseConfig = window.EDMUND_SUPABASE || {};
  const apiBase = String(window.EDMUND_DOWNLOAD_API_BASE || "").replace(/\/+$/, "");
  const supabaseClient = window.supabase?.createClient && supabaseConfig.url && supabaseConfig.anonKey
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
    : null;

  const task2Filters = [
    { key: "all", label: "全部" },
    { key: "advantage-disadvantage", label: "Advantage and Disadvantage" },
    { key: "opinion", label: "Opinions" },
    { key: "discuss-both-views", label: "Express Both Views + Your Opinion" },
    { key: "cause-solution", label: "Cause and Solution" },
    { key: "direct-question", label: "Direct Question" }
  ];

  const speakingFilters = [
    { key: "all", label: "全部" },
    { key: "part-1", label: "Speaking Part 1" },
    { key: "part-2", label: "Speaking Part 2" },
    { key: "part-3", label: "Speaking Part 3" }
  ];

  const readingFilters = [{ key: "all", label: "全部" }];
  const readingItems = passage => readingFiles.filter(item => item.passage === passage);
  const readingCatalogMeta = passage => {
    const category = `passage-${passage}`;
    return Object.freeze({
      total: Number(readingMeta.categoryCounts?.[category]) || readingItems(passage).length,
      totalBytes: Number(readingMeta.passageBytes?.[category]) || 0,
      totalPages: Number(readingMeta.passagePages?.[category]) || 0,
      categoryCounts: { [category]: Number(readingMeta.categoryCounts?.[category]) || 0 }
    });
  };

  const catalogs = Object.freeze({
    task2: Object.freeze({
      key: "task2",
      items: task2Essays,
      meta: task2Meta,
      filters: task2Filters,
      initialSort: "number-asc",
      endpointPrefix: "",
      breadcrumb: "Task 2",
      eyebrow: "IELTS WRITING TASK 2",
      titleHtml: "Band 9 Model Essays<br>範文下載庫",
      totalUnit: "份 PDF 範文",
      itemNoun: "範文",
      filterLabel: "題型篩選",
      searchLabel: "搜尋檔案名稱或 Model Essay 編號",
      searchPlaceholder: "搜尋檔案名稱或 Model Essay 編號...",
      categorySortLabel: "按題型分類",
      emptyTitle: "找不到符合條件的範文",
      emptyCopy: "請嘗試另一個關鍵字或題型篩選。",
      allTitle: "確定下載全部範文？",
      allCopy: "系統會把全部 IELTS Task 2 範文整理成一個 ZIP 檔案。檔案較大，下載可能需要一些時間。",
      allZipName: "Edmund-IELTS-Task-2-All-Model-Essays.zip",
      selectedZipPrefix: "Edmund-IELTS-Task-2-Selected",
      kicker: item => `MODEL ESSAY ${item.number}`,
      detailFallback: "題目資料暫時未能顯示。"
    }),
    speaking: Object.freeze({
      key: "speaking",
      items: speakingFiles,
      meta: speakingMeta,
      filters: speakingFilters,
      initialSort: "category",
      endpointPrefix: "/speaking",
      breadcrumb: "Speaking",
      eyebrow: "IELTS SPEAKING · PART 1 / 2 / 3",
      titleHtml: "Band 9 Speaking Samples<br>口試教材下載庫",
      totalUnit: "份 PDF 教材",
      itemNoun: "教材",
      filterLabel: "Speaking Part 篩選",
      searchLabel: "搜尋 Book 編號或檔案名稱",
      searchPlaceholder: "搜尋 Book 編號或檔案名稱...",
      categorySortLabel: "按 Speaking Part 分類",
      emptyTitle: "找不到符合條件的 Speaking 教材",
      emptyCopy: "請嘗試另一個 Book 編號、關鍵字或 Part 篩選。",
      allTitle: "確定下載全部 Speaking 教材？",
      allCopy: "系統會把 IELTS Speaking Part 1、Part 2 及 Part 3 的全部 46 份教材整理成一個 ZIP 檔案。檔案約 101 MB，下載可能需要一些時間。",
      allZipName: "Edmund-IELTS-Speaking-All-Parts.zip",
      selectedZipPrefix: "Edmund-IELTS-Speaking-Selected",
      kicker: item => `SPEAKING PART ${item.part} · BOOK ${item.book}`,
      detailFallback: "IELTS Speaking Band 9 sample PDF。"
    }),
    "reading-passage-1": Object.freeze({
      key: "reading-passage-1",
      isReading: true,
      items: readingItems(1),
      meta: readingCatalogMeta(1),
      filters: readingFilters,
      initialSort: "number-asc",
      endpointPrefix: "/reading/passage-1",
      breadcrumb: "閱讀 Passage 1",
      eyebrow: "IELTS READING · PASSAGE 1",
      titleHtml: "IELTS Reading Passage 1<br>閱讀練習下載庫",
      totalUnit: "份 PDF 閱讀練習",
      itemNoun: "閱讀練習",
      filterLabel: "Reading Passage 篩選",
      searchLabel: "搜尋篇章標題或 Practice 編號",
      searchPlaceholder: "搜尋篇章標題或 Practice 編號...",
      categorySortLabel: "按 Passage 分類",
      emptyTitle: "找不到符合條件的 Passage 1 練習",
      emptyCopy: "請嘗試另一個篇章標題或 Practice 編號。",
      allTitle: "確定下載全部 Passage 1 練習？",
      allCopy: "系統會把 163 份 IELTS Reading Passage 1 練習整理成一個 ZIP 檔案。檔案較大，下載可能需要一些時間。",
      allZipName: "Edmund-IELTS-Reading-Passage-1.zip",
      selectedZipPrefix: "Edmund-IELTS-Reading-Passage-1-Selected",
      kicker: item => `PRACTICE ${item.number} · PASSAGE ${item.passage}`,
      detailFallback: "IELTS Reading Passage 1 練習 PDF。"
    }),
    "reading-passage-2": Object.freeze({
      key: "reading-passage-2",
      isReading: true,
      items: readingItems(2),
      meta: readingCatalogMeta(2),
      filters: readingFilters,
      initialSort: "number-asc",
      endpointPrefix: "/reading/passage-2",
      breadcrumb: "閱讀 Passage 2",
      eyebrow: "IELTS READING · PASSAGE 2",
      titleHtml: "IELTS Reading Passage 2<br>閱讀練習下載庫",
      totalUnit: "份 PDF 閱讀練習",
      itemNoun: "閱讀練習",
      filterLabel: "Reading Passage 篩選",
      searchLabel: "搜尋篇章標題或 Practice 編號",
      searchPlaceholder: "搜尋篇章標題或 Practice 編號...",
      categorySortLabel: "按 Passage 分類",
      emptyTitle: "找不到符合條件的 Passage 2 練習",
      emptyCopy: "請嘗試另一個篇章標題或 Practice 編號。",
      allTitle: "確定下載全部 Passage 2 練習？",
      allCopy: "系統會把 149 份 IELTS Reading Passage 2 練習整理成一個 ZIP 檔案。檔案較大，下載可能需要一些時間。",
      allZipName: "Edmund-IELTS-Reading-Passage-2.zip",
      selectedZipPrefix: "Edmund-IELTS-Reading-Passage-2-Selected",
      kicker: item => `PRACTICE ${item.number} · PASSAGE ${item.passage}`,
      detailFallback: "IELTS Reading Passage 2 練習 PDF。"
    }),
    "reading-passage-3": Object.freeze({
      key: "reading-passage-3",
      isReading: true,
      items: readingItems(3),
      meta: readingCatalogMeta(3),
      filters: readingFilters,
      initialSort: "number-asc",
      endpointPrefix: "/reading/passage-3",
      breadcrumb: "閱讀 Passage 3",
      eyebrow: "IELTS READING · PASSAGE 3",
      titleHtml: "IELTS Reading Passage 3<br>閱讀練習下載庫",
      totalUnit: "份 PDF 閱讀練習",
      itemNoun: "閱讀練習",
      filterLabel: "Reading Passage 篩選",
      searchLabel: "搜尋篇章標題或 Practice 編號",
      searchPlaceholder: "搜尋篇章標題或 Practice 編號...",
      categorySortLabel: "按 Passage 分類",
      emptyTitle: "找不到符合條件的 Passage 3 練習",
      emptyCopy: "請嘗試另一個篇章標題或 Practice 編號。",
      allTitle: "確定下載全部 Passage 3 練習？",
      allCopy: "系統會把 165 份 IELTS Reading Passage 3 練習整理成一個 ZIP 檔案。檔案較大，下載可能需要一些時間。",
      allZipName: "Edmund-IELTS-Reading-Passage-3.zip",
      selectedZipPrefix: "Edmund-IELTS-Reading-Passage-3-Selected",
      kicker: item => `PRACTICE ${item.number} · PASSAGE ${item.passage}`,
      detailFallback: "IELTS Reading Passage 3 練習 PDF。"
    })
  });

  let activeCatalog = catalogs.task2;
  let essays = activeCatalog.items;
  let meta = activeCatalog.meta;
  let filters = activeCatalog.filters;
  let byId = new Map(essays.map(item => [item.id, item]));
  const allItemsById = new Map([...task2Essays, ...speakingFiles, ...readingFiles].map(item => [item.id, item]));

  const exams = [
    { key: "dse", label: "DSE", subline: "英文文憑試範文", contentAvailable: false },
    { key: "ielts", label: "IELTS", subline: "雅思寫作及口試教材", contentAvailable: true, featured: true },
    { key: "toeic", label: "TOEIC", subline: "職場英語寫作範文", contentAvailable: false },
    { key: "toefl", label: "TOEFL", subline: "托福寫作範文", contentAvailable: false },
    { key: "pte", label: "PTE", subline: "培生英語寫作範文", contentAvailable: false },
    { key: "government", label: "公務員寫作", subline: "政府職位英文寫作", contentAvailable: false }
  ];

  const defaultAccess = () => ({
    dse: false,
    ielts: true,
    toeic: false,
    toefl: false,
    pte: false,
    government: false
  });

  const state = {
    currentUser: null,
    catalogKey: "task2",
    filter: "all",
    query: "",
    sort: "number-asc",
    page: 1,
    selected: new Set(),
    apiHealthy: false,
    downloadToken: "",
    downloadTokenExpiresAt: 0,
    modalReturnFocus: null,
    detailReturnFocus: null,
    detailEssay: null,
    adminPage: 1,
    adminPageCount: 1,
    adminStudentFilter: "",
    adminStudents: [],
    adminTotals: new Map(),
    adminLoading: false
  };

  const views = [...document.querySelectorAll("[data-view]")];
  const connectionStatus = document.querySelector("[data-connection-status]");
  const loginForm = document.querySelector("[data-login-form]");
  const loginButton = document.querySelector("[data-login-button]");
  const loginStatus = document.querySelector("[data-login-status]");
  const userPill = document.querySelector("[data-user-pill]");
  const logoutButton = document.querySelector("[data-logout]");
  const examGrid = document.querySelector("[data-exam-grid]");
  const filterChips = document.querySelector("[data-filter-chips]");
  const searchInput = document.querySelector("[data-search]");
  const sortSelect = document.querySelector("[data-sort]");
  const catalogList = document.querySelector("[data-catalog-list]");
  const resultSummary = document.querySelector("[data-result-summary]");
  const pageSummary = document.querySelector("[data-page-summary]");
  const prevButton = document.querySelector("[data-page-prev]");
  const nextButton = document.querySelector("[data-page-next]");
  const selectVisible = document.querySelector("[data-select-visible]");
  const selectedCount = document.querySelector("[data-selected-count]");
  const clearSelectionButton = document.querySelector("[data-clear-selection]");
  const downloadSelectedButton = document.querySelector("[data-download-selected]");
  const downloadAllModal = document.querySelector("[data-download-all-modal]");
  const detailModal = document.querySelector("[data-detail-modal]");
  const adminStudentsBody = document.querySelector("[data-admin-students]");
  const adminLogsBody = document.querySelector("[data-admin-logs]");
  const adminStatus = document.querySelector("[data-admin-status]");
  const adminLogFilter = document.querySelector("[data-admin-log-filter]");
  const adminLogPageSummary = document.querySelector("[data-admin-log-page-summary]");
  const adminLogPrev = document.querySelector("[data-admin-log-prev]");
  const adminLogNext = document.querySelector("[data-admin-log-next]");
  const toastRegion = document.querySelector("[data-toast-region]");
  const catalogBreadcrumb = document.querySelector("[data-catalog-breadcrumb]");
  const catalogEyebrow = document.querySelector("[data-catalog-eyebrow]");
  const catalogTitle = document.querySelector("[data-catalog-title]");
  const totalCount = document.querySelector("[data-total-count]");
  const totalUnit = document.querySelector("[data-total-unit]");
  const searchLabel = document.querySelector("[data-search-label]");
  const categorySortOption = document.querySelector("[data-category-sort-option]");
  const allDownloadTitle = document.querySelector("[data-all-download-title]");
  const allDownloadCopy = document.querySelector("[data-all-download-copy]");

  function essayQuestion(essay) {
    if (activeCatalog.isReading) {
      return {
        question: `IELTS Reading Passage ${essay?.passage} · Practice ${essay?.number} · 檔案：${essay?.filename}`,
        tags: []
      };
    }
    if (state.catalogKey === "speaking") {
      return {
        question: `IELTS Speaking Part ${essay?.part} · Book ${essay?.book}，Band 9 sample PDF。`,
        tags: []
      };
    }
    return questionData[essay?.category + ":" + essay?.number] || { question: "", tags: [] };
  }

  function itemDisplayTitle(item) {
    return activeCatalog.isReading && item?.title ? item.title : item?.filename || "PDF";
  }

  function configureCatalogUi() {
    if (catalogBreadcrumb) catalogBreadcrumb.textContent = activeCatalog.breadcrumb;
    if (catalogEyebrow) catalogEyebrow.textContent = activeCatalog.eyebrow;
    if (catalogTitle) catalogTitle.innerHTML = activeCatalog.titleHtml;
    if (totalCount) totalCount.textContent = String(essays.length);
    if (totalUnit) totalUnit.textContent = activeCatalog.totalUnit;
    if (searchLabel) searchLabel.textContent = activeCatalog.searchLabel;
    if (searchInput) {
      searchInput.value = state.query;
      searchInput.placeholder = activeCatalog.searchPlaceholder;
    }
    if (sortSelect) sortSelect.value = state.sort;
    if (categorySortOption) categorySortOption.textContent = activeCatalog.categorySortLabel;
    if (filterChips) filterChips.setAttribute("aria-label", activeCatalog.filterLabel);
    if (allDownloadTitle) allDownloadTitle.textContent = activeCatalog.allTitle;
    if (allDownloadCopy) allDownloadCopy.textContent = activeCatalog.allCopy;
  }

  function activateCatalog(key) {
    const next = catalogs[key];
    if (!next) return;
    activeCatalog = next;
    essays = next.items;
    meta = next.meta;
    filters = next.filters;
    byId = new Map(essays.map(item => [item.id, item]));
    state.catalogKey = next.key;
    state.filter = "all";
    state.query = "";
    state.sort = next.initialSort;
    state.page = 1;
    state.selected.clear();
    configureCatalogUi();
    showView("catalog");
  }

  function normalizeAccess(access) {
    const defaults = defaultAccess();
    if (!access || typeof access !== "object") return defaults;
    for (const exam of exams) defaults[exam.key] = access[exam.key] === true;
    return defaults;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatBytes(bytes) {
    const size = Number(bytes) || 0;
    if (size < 1024) return `${size} B`;
    const units = ["KB", "MB", "GB"];
    let value = size / 1024;
    let unit = units[0];
    for (let index = 1; index < units.length && value >= 1024; index += 1) {
      value /= 1024;
      unit = units[index];
    }
    return `${value.toFixed(value >= 100 ? 0 : 1)} ${unit}`;
  }

  function setConnection(text, stateName = "connecting") {
    if (!connectionStatus) return;
    connectionStatus.textContent = text;
    connectionStatus.dataset.state = stateName;
  }

  function showToast(message, tone = "default", duration = 4800) {
    if (!toastRegion) return;
    const toast = document.createElement("div");
    toast.className = `toast${tone === "default" ? "" : ` ${tone}`}`;
    toast.textContent = message;
    toastRegion.append(toast);
    window.setTimeout(() => toast.remove(), duration);
  }

  function setLoginStatus(message = "", tone = "error") {
    if (!loginStatus) return;
    loginStatus.textContent = message;
    loginStatus.classList.toggle("success", tone === "success");
  }

  function setSession(user) {
    state.currentUser = user;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    if (user?.role === "student" && user.sessionToken) {
      window.EdmundSystemNav?.rememberStudentSession({
        token: user.sessionToken,
        id: user.id || "",
        name: user.name,
        role: "student",
        access: user.sharedAccess
      });
    }
    updateAccountUi();
    renderExamGrid();
  }

  function clearSession() {
    if (state.currentUser?.role === "student") window.EdmundSystemNav?.forgetStudentSession();
    state.currentUser = null;
    state.downloadToken = "";
    state.downloadTokenExpiresAt = 0;
    state.detailEssay = null;
    state.adminStudents = [];
    state.adminTotals = new Map();
    sessionStorage.removeItem(SESSION_KEY);
    updateAccountUi();
    renderExamGrid();
  }

  function restoreSession() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (saved?.role === "admin" && saved?.name && saved?.adminToken) {
        state.currentUser = saved;
      } else if (saved?.id && saved?.name && saved?.sessionToken) {
        saved.access = normalizeAccess(saved.access);
        state.currentUser = saved;
      }
    } catch (error) {
      sessionStorage.removeItem(SESSION_KEY);
    }
    updateAccountUi();
  }

  function updateAccountUi() {
    const signedIn = Boolean(state.currentUser);
    if (userPill) {
      userPill.hidden = !signedIn;
      userPill.textContent = signedIn ? `${state.currentUser.name} · ${state.currentUser.role === "admin" ? "管理員" : "學生"}` : "";
    }
    if (logoutButton) logoutButton.hidden = !signedIn;
    document.querySelectorAll("[data-welcome-name]").forEach(node => {
      node.textContent = state.currentUser?.name || "同學";
    });
  }

  function showView(name, options = {}) {
    if (name !== "login" && !state.currentUser) name = "login";
    if (state.currentUser?.role === "admin" && name !== "login" && name !== "admin") name = "admin";
    if (name === "admin" && state.currentUser?.role !== "admin") name = state.currentUser ? "dashboard" : "login";
    if ((name === "ielts" || name === "catalog") && state.currentUser?.access?.ielts !== true) name = "dashboard";
    views.forEach(view => { view.hidden = view.dataset.view !== name; });
    document.body.dataset.currentView = name;
    if (name === "catalog") renderCatalog();
    if (name === "admin") void loadAdminConsole();
    if (options.scroll !== false) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function ensureSupabaseSession() {
    if (!supabaseClient) throw new Error("Supabase client is unavailable.");
    const current = await supabaseClient.auth.getSession();
    if (current.error) throw current.error;
    if (current.data?.session?.user?.id) return current.data.session;
    const created = await supabaseClient.auth.signInAnonymously();
    if (created.error) throw created.error;
    if (!created.data?.session?.user?.id) throw new Error("Anonymous session was not created.");
    return created.data.session;
  }

  async function callRpc(name, args) {
    if (!supabaseClient) throw new Error("Supabase client is unavailable.");
    const { data, error } = await supabaseClient.rpc(name, args);
    if (error) throw error;
    return data;
  }

  async function callAdminLogin(name, password) {
    if (!apiBase || !/^https:\/\//i.test(apiBase)) throw new Error("MODEL_ADMIN_LOGIN_UNAVAILABLE");
    const response = await fetch(`${apiBase}/v1/admin/login`, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password })
    });
    if (response.status === 429) throw new Error("MODEL_ADMIN_RATE_LIMITED");
    if (!response.ok) throw new Error("MODEL_ADMIN_LOGIN_UNAVAILABLE");
    const payload = await response.json();
    return payload?.admin || null;
  }

  async function login(username, password) {
    const authSession = await ensureSupabaseSession();
    const trimmedName = username.trim();
    if (trimmedName.toLocaleLowerCase() === "sam admin") {
      const admin = await callAdminLogin(trimmedName, password);
      if (!admin) return null;
      return {
        id: "model-essay-admin",
        name: admin.name || "Sam Admin",
        role: "admin",
        adminToken: admin.admin_token,
        expiresAt: admin.expires_at || null
      };
    }

    const rows = await callRpc("flashcard_student_login", {
      p_name: username.trim(),
      p_password: password
    });
    if (!Array.isArray(rows) || !rows.length) return null;
    const student = rows[0];
    const profiles = await callRpc("model_essay_student_profile", {
      p_token: student.session_token
    });
    if (!Array.isArray(profiles) || !profiles.length) return null;
    const profile = profiles[0];
    return {
      id: student.id,
      name: student.name,
      role: "student",
      access: normalizeAccess(profile),
      sharedAccess: student.access && typeof student.access === "object" ? student.access : undefined,
      createdAt: student.created_at || null,
      sessionToken: student.session_token,
      authAccessToken: authSession.access_token
    };
  }

  let lastPermissionRefreshAt = 0;
  let permissionRefreshPromise = null;

  async function refreshStudentProfile(options = {}) {
    if (state.currentUser?.role !== "student" || !state.currentUser.sessionToken) return;
    const now = Date.now();
    if (!options.force && now - lastPermissionRefreshAt < 15000) return;
    if (permissionRefreshPromise) return permissionRefreshPromise;
    permissionRefreshPromise = (async () => {
      const profiles = await callRpc("model_essay_student_profile", {
        p_token: state.currentUser.sessionToken
      });
      if (!Array.isArray(profiles) || !profiles.length) {
        clearSession();
        showView("login", { scroll: false });
        setLoginStatus("登入時限已過，請重新登入。", "error");
        return;
      }
      const previousIelts = state.currentUser.access?.ielts === true;
      state.currentUser.access = normalizeAccess(profiles[0]);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.currentUser));
      renderExamGrid();
      lastPermissionRefreshAt = Date.now();
      if (previousIelts && !state.currentUser.access.ielts
        && ["ielts", "catalog"].includes(document.body.dataset.currentView)) {
        showView("dashboard", { scroll: false });
        showToast("IELTS 教材權限已更新。", "default", 4500);
      }
    })().finally(() => { permissionRefreshPromise = null; });
    return permissionRefreshPromise;
  }

  function healthUrl() {
    return apiBase ? `${apiBase}/v1/health` : "";
  }

  async function checkDownloadApi(timeout = 3500) {
    if (!apiBase || !/^https:\/\//i.test(apiBase)) return false;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(healthUrl(), {
        method: "GET",
        mode: "cors",
        credentials: "include",
        signal: controller.signal,
        cache: "no-store"
      });
      state.apiHealthy = response.ok;
      return response.ok;
    } catch (error) {
      state.apiHealthy = false;
      return false;
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function openDownloadSession() {
    if (state.downloadToken && Date.now() < state.downloadTokenExpiresAt - 30_000) return true;
    if (state.currentUser?.role !== "student" || !state.currentUser?.sessionToken || !apiBase) return false;
    if (!state.apiHealthy && !(await checkDownloadApi())) return false;

    try {
      const authSession = await ensureSupabaseSession();
      state.currentUser.authAccessToken = authSession.access_token;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.currentUser));
      const response = await fetch(`${apiBase}/v1/session`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: state.currentUser.sessionToken,
          accessToken: state.currentUser.authAccessToken
        })
      });
      if (response.status === 401) {
        clearSession();
        showView("login");
        setLoginStatus("登入時限已過，請重新登入。", "error");
        return false;
      }
      if (response.status === 403) {
        state.downloadToken = "";
        state.downloadTokenExpiresAt = 0;
        showToast("此帳戶未獲授權下載 IELTS 教材。", "error", 5600);
        return false;
      }
      if (!response.ok) return false;
      const session = await response.json();
      if (!session?.token || !Number.isFinite(Number(session.expiresAt))) return false;
      state.downloadToken = session.token;
      state.downloadTokenExpiresAt = Number(session.expiresAt) * 1000;
      return true;
    } catch (error) {
      return false;
    }
  }

  async function closeDownloadSession() {
    state.downloadToken = "";
    state.downloadTokenExpiresAt = 0;
    if (!apiBase || !state.apiHealthy) return;
    try {
      await fetch(`${apiBase}/v1/session`, {
        method: "DELETE",
        mode: "cors",
        credentials: "include"
      });
    } catch (error) {
      // The local session is cleared even if the download service is unavailable.
    }
  }

  function renderExamGrid() {
    if (!examGrid) return;
    const access = normalizeAccess(state.currentUser?.access);
    examGrid.innerHTML = exams.map(exam => {
      const allowed = access[exam.key] === true;
      const tag = !allowed ? "未獲授權" : exam.contentAvailable ? "進入下載區" : "已獲授權";
      return `
      <button class="exam-card${exam.featured && allowed ? " featured" : ""}" type="button"
        data-exam-key="${escapeHtml(exam.key)}" ${allowed ? "" : "disabled"}>
        <strong>${escapeHtml(exam.label)}</strong>
        <span>${escapeHtml(exam.subline)}</span>
        <span class="card-tag">${tag}</span>
      </button>
    `;
    }).join("");
  }

  function categoryCount(key) {
    if (key === "all") return essays.length;
    return Number(meta.categoryCounts?.[key]) || essays.filter(essay => essay.category === key).length;
  }

  function renderFilterChips() {
    if (!filterChips) return;
    filterChips.innerHTML = filters.map(filter => `
      <button class="filter-chip${state.filter === filter.key ? " active" : ""}" type="button"
        data-filter="${escapeHtml(filter.key)}" aria-pressed="${state.filter === filter.key}">
        ${escapeHtml(filter.label)}<small>${categoryCount(filter.key)}</small>
      </button>
    `).join("");
  }

  function filteredEssays() {
    const query = state.query.trim().toLocaleLowerCase();
    const rows = essays.filter(essay => {
      if (state.filter !== "all" && essay.category !== state.filter) return false;
      if (!query) return true;
      const detail = essayQuestion(essay);
      return essay.filename.toLocaleLowerCase().includes(query)
        || String(essay.title || "").toLocaleLowerCase().includes(query)
        || essay.categoryLabel.toLocaleLowerCase().includes(query)
        || detail.question.toLocaleLowerCase().includes(query)
        || detail.tags.some(tag => tag.toLocaleLowerCase().includes(query))
        || String(essay.number).includes(query);
    });

    const sorted = [...rows];
    if (state.sort === "number-desc") {
      sorted.sort((a, b) => b.number - a.number || a.categoryOrder - b.categoryOrder || a.filename.localeCompare(b.filename));
    } else if (state.sort === "name-asc") {
      sorted.sort((a, b) => a.filename.localeCompare(b.filename, "en", { numeric: true }));
    } else if (state.sort === "category") {
      sorted.sort((a, b) => a.categoryOrder - b.categoryOrder || a.number - b.number || a.filename.localeCompare(b.filename));
    } else {
      sorted.sort((a, b) => a.number - b.number || a.categoryOrder - b.categoryOrder || a.filename.localeCompare(b.filename));
    }
    return sorted;
  }

  function pageRows(rows) {
    const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    state.page = Math.min(Math.max(1, state.page), pageCount);
    const start = (state.page - 1) * PAGE_SIZE;
    return { rows: rows.slice(start, start + PAGE_SIZE), pageCount, start };
  }

  function rowHtml(essay) {
    const selected = state.selected.has(essay.id);
    const detail = essayQuestion(essay);
    const tags = detail.tags.map(tag => `<span class="topic-tag">${escapeHtml(tag)}</span>`).join("");
    return `
      <article class="essay-row${selected ? " selected" : ""}" data-essay-row="${escapeHtml(essay.id)}">
        <input class="row-checkbox" type="checkbox" data-select-id="${escapeHtml(essay.id)}"
          aria-label="選取 ${escapeHtml(essay.filename)}" ${selected ? "checked" : ""}>
        <img class="essay-thumb" src="${escapeHtml(essay.thumbnail)}" alt="${escapeHtml(essay.filename)} 第一頁縮圖" loading="lazy" width="84" height="109">
        <div class="essay-main">
          <div class="essay-kicker">
            <span class="essay-number">${escapeHtml(activeCatalog.kicker(essay))}</span>
            ${tags}
            ${essay.problem ? '<span class="problem-badge">需留意</span>' : ""}
          </div>
          <button class="essay-title-button" type="button" data-open-detail-id="${escapeHtml(essay.id)}">${escapeHtml(itemDisplayTitle(essay))}</button>
          <div class="essay-detail">${activeCatalog.isReading ? `Practice ${essay.number} · ` : ""}PDF · ${essay.pages} 頁 · ${formatBytes(essay.bytes)}</div>
        </div>
        <div class="essay-category">
          <span class="category-pill" data-category="${escapeHtml(essay.category)}">${escapeHtml(essay.categoryLabel)}</span>
        </div>
        <div class="essay-action">
          <button class="row-download" type="button" data-download-id="${escapeHtml(essay.id)}">下載 PDF</button>
        </div>
      </article>
    `;
  }

  function updateSelectionControls(visibleRows = []) {
    const count = state.selected.size;
    if (selectedCount) selectedCount.textContent = `已選 ${count} 份`;
    if (clearSelectionButton) clearSelectionButton.disabled = count === 0;
    if (downloadSelectedButton) {
      downloadSelectedButton.disabled = count === 0;
      downloadSelectedButton.textContent = count > 10 ? `下載已選檔案（ZIP · ${count}）` : `下載已選檔案${count ? `（${count}）` : ""}`;
    }
    if (selectVisible) {
      const selectedVisible = visibleRows.filter(essay => state.selected.has(essay.id)).length;
      selectVisible.checked = Boolean(visibleRows.length) && selectedVisible === visibleRows.length;
      selectVisible.indeterminate = selectedVisible > 0 && selectedVisible < visibleRows.length;
      selectVisible.disabled = visibleRows.length === 0;
    }
  }

  function renderCatalog() {
    renderFilterChips();
    const rows = filteredEssays();
    const page = pageRows(rows);

    if (resultSummary) {
      const filterLabel = filters.find(filter => filter.key === state.filter)?.label || "全部";
      resultSummary.textContent = `顯示 ${rows.length} 份${activeCatalog.itemNoun} · ${filterLabel}${state.query ? ` · 搜尋「${state.query}」` : ""}`;
    }

    if (catalogList) {
      catalogList.innerHTML = page.rows.length
        ? page.rows.map(rowHtml).join("")
        : `<div class="empty-state"><strong>${escapeHtml(activeCatalog.emptyTitle)}</strong><span>${escapeHtml(activeCatalog.emptyCopy)}</span></div>`;
    }

    if (pageSummary) {
      const first = rows.length ? page.start + 1 : 0;
      const last = Math.min(page.start + PAGE_SIZE, rows.length);
      pageSummary.textContent = `${first}–${last} / ${rows.length} · 第 ${state.page} / ${page.pageCount} 頁`;
    }
    if (prevButton) prevButton.disabled = state.page <= 1;
    if (nextButton) nextButton.disabled = state.page >= page.pageCount;
    updateSelectionControls(page.rows);
  }

  async function downloadOne(essay) {
    if (!essay) return;
    const catalog = activeCatalog;
    const ready = await openDownloadSession();
    if (!ready) {
      showToast("下載服務暫時未能連線，請稍後再試。", "error", 5200);
      return false;
    }

    const frame = document.createElement("iframe");
    frame.name = `edmund-file-download-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    frame.className = "sr-only";
    frame.title = "下載 PDF";
    document.body.append(frame);

    const form = document.createElement("form");
    form.method = "post";
    form.action = `${apiBase}/v1${catalog.endpointPrefix}/files/${encodeURIComponent(essay.id)}`;
    form.target = frame.name;
    form.hidden = true;
    const token = document.createElement("input");
    token.type = "hidden";
    token.name = "downloadToken";
    token.value = state.downloadToken;
    form.append(token);
    document.body.append(form);
    form.submit();
    window.setTimeout(() => { form.remove(); frame.remove(); }, 120_000);
    return true;
  }

  function submitZip(items, options = {}) {
    const catalog = options.catalog || activeCatalog;
    const form = document.createElement("form");
    form.method = "post";
    form.action = `${apiBase}/v1${catalog.endpointPrefix}/zip`;
    form.target = "edmund-download-frame";
    form.hidden = true;

    const fields = {
      ids: JSON.stringify(items.map(item => item.id)),
      filename: options.filename || catalog.allZipName,
      all: options.all ? "1" : "0",
      confirmAll: options.all ? "1" : "0",
      downloadToken: state.downloadToken
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.append(input);
    });

    document.body.append(form);
    form.submit();
    window.setTimeout(() => form.remove(), 1500);
  }

  async function downloadZip(items, options = {}) {
    const catalog = activeCatalog;
    if (!(await openDownloadSession())) {
      showToast("ZIP 下載服務暫時未能連線，請稍後再試。", "error", 6500);
      return false;
    }
    submitZip(items, { ...options, catalog });
    showToast(`正在準備 ${items.length} 份${catalog.itemNoun}的 ZIP 下載…`, "success", 6500);
    return true;
  }

  async function downloadSelected() {
    const items = [...state.selected].map(id => byId.get(id)).filter(Boolean);
    if (!items.length) return;
    if (items.length === essays.length) {
      openDownloadAllModal(downloadSelectedButton);
      return;
    }
    if (items.length > 10) {
      await downloadZip(items, { filename: `${activeCatalog.selectedZipPrefix}-${items.length}.zip` });
      return;
    }

    showToast(`即將下載 ${items.length} 份 PDF；瀏覽器可能會詢問是否允許多個下載。`, "success", 6000);
    for (const [index, item] of items.entries()) {
      window.setTimeout(() => { void downloadOne(item); }, index * 500);
    }
  }

  function openDownloadAllModal(trigger) {
    if (!downloadAllModal) return;
    state.modalReturnFocus = trigger || document.activeElement;
    const summary = downloadAllModal.querySelector("[data-all-download-summary]");
    if (summary) summary.textContent = `${essays.length} 份 PDF · 約 ${formatBytes(meta.totalBytes || essays.reduce((sum, item) => sum + item.bytes, 0))}`;
    downloadAllModal.hidden = false;
    downloadAllModal.querySelector("[data-modal-cancel]")?.focus();
  }

  function closeDownloadAllModal() {
    if (!downloadAllModal) return;
    downloadAllModal.hidden = true;
    state.modalReturnFocus?.focus?.();
    state.modalReturnFocus = null;
  }

  async function confirmDownloadAll() {
    closeDownloadAllModal();
    await downloadZip(essays, { all: true, filename: activeCatalog.allZipName });
  }

  function openDetailModal(essay, trigger) {
    if (!detailModal || !essay) return;
    const detail = essayQuestion(essay);
    state.detailEssay = essay;
    state.detailReturnFocus = trigger || document.activeElement;
    detailModal.querySelector("[data-detail-number]").textContent = `${activeCatalog.kicker(essay)} · ${essay.categoryLabel}`;
    detailModal.querySelector("[data-detail-tags]").innerHTML = detail.tags
      .map(tag => `<span class="topic-tag">${escapeHtml(tag)}</span>`)
      .join("");
    detailModal.querySelector("[data-detail-title]").textContent = itemDisplayTitle(essay);
    detailModal.querySelector("[data-detail-question]").textContent = detail.question || activeCatalog.detailFallback;
    detailModal.querySelector("[data-detail-meta]").textContent = `PDF · ${essay.pages} 頁 · ${formatBytes(essay.bytes)}`;
    const thumbnail = detailModal.querySelector("[data-detail-thumbnail]");
    thumbnail.src = essay.thumbnail;
    thumbnail.alt = `${essay.filename} 第一頁縮圖`;
    detailModal.hidden = false;
    detailModal.querySelector("[data-detail-close]")?.focus();
  }

  function closeDetailModal() {
    if (!detailModal) return;
    detailModal.hidden = true;
    state.detailEssay = null;
    state.detailReturnFocus?.focus?.();
    state.detailReturnFocus = null;
  }

  function setAdminStatus(message = "", tone = "default") {
    if (!adminStatus) return;
    adminStatus.textContent = message;
    adminStatus.classList.toggle("error", tone === "error");
  }

  function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("zh-HK", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Hong_Kong"
    }).format(date);
  }

  function adminToken() {
    return state.currentUser?.role === "admin" ? state.currentUser.adminToken : "";
  }

  function renderAdminStudents() {
    if (!adminStudentsBody) return;
    if (!state.adminStudents.length) {
      adminStudentsBody.innerHTML = '<tr><td class="admin-empty" colspan="8">沒有可顯示的學生帳戶。</td></tr>';
      return;
    }
    adminStudentsBody.innerHTML = state.adminStudents.map(student => {
      const access = normalizeAccess(student);
      const total = state.adminTotals.get(student.id)?.essayCount || 0;
      const toggles = exams.map(exam => `
        <td>
          <label class="access-toggle" title="${escapeHtml(exam.label)}">
            <input type="checkbox" data-admin-access-student="${escapeHtml(student.id)}"
              data-admin-access-key="${escapeHtml(exam.key)}" ${access[exam.key] ? "checked" : ""}
              aria-label="${escapeHtml(student.name)}：${escapeHtml(exam.label)}">
          </label>
        </td>
      `).join("");
      return `
        <tr data-admin-student-row="${escapeHtml(student.id)}">
          <td class="student-name">${escapeHtml(student.name)}</td>
          ${toggles}
          <td><span class="download-total">${Number(total).toLocaleString("en-HK")}</span> 份</td>
        </tr>
      `;
    }).join("");
  }

  function updateAdminFilterOptions() {
    if (!adminLogFilter) return;
    const selected = state.adminStudentFilter;
    adminLogFilter.innerHTML = [
      '<option value="">所有學生</option>',
      ...state.adminStudents.map(student => `<option value="${escapeHtml(student.id)}">${escapeHtml(student.name)}</option>`)
    ].join("");
    adminLogFilter.value = selected;
  }

  function logEssayLabel(event) {
    const ids = Array.isArray(event.essay_ids) ? event.essay_ids : [];
    const isSpeaking = event.task === "speaking";
    const isReading = String(event.task || "").startsWith("reading-passage-");
    if (event.event_type === "all_bundle") {
      const label = isSpeaking
        ? "All IELTS Speaking bundle"
        : isReading
          ? `All IELTS Reading Passage ${String(event.task).slice(-1)} bundle`
          : "All Task 2 essay bundle";
      return `<strong>${label}</strong>`;
    }
    const names = ids.map(id => {
      const item = allItemsById.get(id);
      return item?.title || item?.filename || id;
    });
    if (event.event_type === "single_pdf") return escapeHtml(names[0] || "PDF");
    const items = names.map(name => `<li>${escapeHtml(name)}</li>`).join("");
    const noun = isSpeaking ? "Speaking 教材" : isReading ? "閱讀練習" : "範文";
    return `<details><summary>${names.length} 份已選${noun}</summary><ul>${items}</ul></details>`;
  }

  function renderAdminLogs(rows, totalCount) {
    if (!adminLogsBody) return;
    if (!rows.length) {
      adminLogsBody.innerHTML = '<tr><td class="admin-empty" colspan="6">尚未有下載紀錄。</td></tr>';
    } else {
      const kindLabels = {
        single_pdf: "單份 PDF",
        selected_zip: "已選 ZIP",
        all_bundle: "全部 ZIP"
      };
      const statusLabels = {
        started: "處理中",
        completed: "已完成",
        failed: "未完成"
      };
      adminLogsBody.innerHTML = rows.map(event => `
        <tr>
          <td>${escapeHtml(formatDateTime(event.completed_at || event.requested_at))}</td>
          <td class="student-name">${escapeHtml(event.student_name)}</td>
          <td>${logEssayLabel(event)}</td>
          <td><span class="log-kind">${escapeHtml(kindLabels[event.event_type] || event.event_type)}</span></td>
          <td><span class="download-total">${Number(event.file_count || 0).toLocaleString("en-HK")}</span> 份</td>
          <td><span class="log-status ${event.status === "completed" ? "completed" : event.status === "failed" ? "failed" : ""}">${escapeHtml(statusLabels[event.status] || "處理中")}</span></td>
        </tr>
      `).join("");
    }

    state.adminPageCount = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE));
    state.adminPage = Math.min(state.adminPage, state.adminPageCount);
    const first = totalCount ? (state.adminPage - 1) * ADMIN_PAGE_SIZE + 1 : 0;
    const last = Math.min(state.adminPage * ADMIN_PAGE_SIZE, totalCount);
    if (adminLogPageSummary) {
      adminLogPageSummary.textContent = `${first}–${last} / ${totalCount} · 第 ${state.adminPage} / ${state.adminPageCount} 頁`;
    }
    if (adminLogPrev) adminLogPrev.disabled = state.adminPage <= 1;
    if (adminLogNext) adminLogNext.disabled = state.adminPage >= state.adminPageCount;
  }

  async function loadAdminLogs() {
    if (!adminToken()) return;
    const rows = await callRpc("model_essay_admin_list_download_events", {
      p_admin_token: adminToken(),
      p_page: state.adminPage,
      p_page_size: ADMIN_PAGE_SIZE,
      p_student_id: state.adminStudentFilter || null
    });
    const safeRows = Array.isArray(rows) ? rows : [];
    const total = safeRows.length ? Number(safeRows[0].total_count) || 0 : 0;
    renderAdminLogs(safeRows, total);
  }

  async function loadAdminConsole(options = {}) {
    if (!adminToken() || state.adminLoading) return;
    state.adminLoading = true;
    setAdminStatus("正在載入學生權限及下載紀錄…");
    try {
      if (options.force || !state.adminStudents.length) {
        const [students, totals] = await Promise.all([
          callRpc("model_essay_admin_list_students", { p_admin_token: adminToken() }),
          callRpc("model_essay_admin_student_download_totals", { p_admin_token: adminToken() })
        ]);
        state.adminStudents = Array.isArray(students) ? students : [];
        state.adminTotals = new Map((Array.isArray(totals) ? totals : []).map(row => [
          row.student_id,
          { essayCount: Number(row.essay_count) || 0, lastDownloadAt: row.last_download_at || null }
        ]));
        renderAdminStudents();
        updateAdminFilterOptions();
      }
      await loadAdminLogs();
      setAdminStatus(`已載入 ${state.adminStudents.length} 個學生帳戶。`);
    } catch (error) {
      console.warn("Could not load model essay admin console:", error);
      setAdminStatus("管理員登入時限可能已過，請登出後重新登入。", "error");
    } finally {
      state.adminLoading = false;
    }
  }

  async function saveStudentAccess(studentId, key, checked) {
    const student = state.adminStudents.find(item => item.id === studentId);
    if (!student || !exams.some(exam => exam.key === key) || !adminToken()) return;
    const previous = student[key] === true;
    student[key] = checked;
    const row = adminStudentsBody?.querySelector(`[data-admin-student-row="${CSS.escape(studentId)}"]`);
    row?.querySelectorAll("input").forEach(input => { input.disabled = true; });
    setAdminStatus(`正在儲存 ${student.name} 的權限…`);
    try {
      const rows = await callRpc("model_essay_admin_set_student_access", {
        p_admin_token: adminToken(),
        p_student_id: studentId,
        p_access: normalizeAccess(student)
      });
      if (!Array.isArray(rows) || !rows.length) throw new Error("Permission update was not returned.");
      Object.assign(student, rows[0]);
      renderAdminStudents();
      setAdminStatus(`${student.name} 的權限已更新。`);
    } catch (error) {
      student[key] = previous;
      renderAdminStudents();
      console.warn("Could not save model essay access:", error);
      setAdminStatus("權限未能儲存，請重新登入後再試。", "error");
    }
  }

  loginForm?.addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    if (!username || !password) {
      setLoginStatus("請輸入用戶名稱及密碼。", "error");
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "正在核對帳戶…";
    setLoginStatus("");
    try {
      const user = await login(username, password);
      if (!user) {
        setLoginStatus("用戶名稱或密碼不正確。", "error");
        return;
      }
      setSession(user);
      setConnection("帳戶已連線", "live");
      setLoginStatus("登入成功。", "success");
      loginForm.reset();
      if (user.role === "admin") {
        showView("admin");
      } else {
        showView("dashboard");
        void openDownloadSession();
      }
    } catch (error) {
      console.warn("Download library login failed:", error);
      if (error?.message === "MODEL_ADMIN_RATE_LIMITED") {
        setLoginStatus("登入嘗試次數過多，請於一分鐘後再試。", "error");
      } else {
        setConnection("登入服務離線", "offline");
        setLoginStatus("登入服務暫時未能連線，請稍後再試。", "error");
      }
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "進入教材下載區";
    }
  });

  document.querySelector("[data-password-toggle]")?.addEventListener("click", event => {
    const input = document.querySelector("#student-password");
    if (!input) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    event.currentTarget.textContent = show ? "隱藏" : "顯示";
    event.currentTarget.setAttribute("aria-pressed", String(show));
  });

  logoutButton?.addEventListener("click", async () => {
    if (state.currentUser?.role === "admin" && adminToken()) {
      try {
        await callRpc("model_essay_admin_logout", { p_admin_token: adminToken() });
      } catch (error) {
        // Local logout still completes if the remote admin session is already gone.
      }
    } else {
      await closeDownloadSession();
    }
    clearSession();
    state.selected.clear();
    setLoginStatus("");
    showView("login");
  });

  examGrid?.addEventListener("click", event => {
    const button = event.target.closest("[data-exam-key]");
    if (!button || button.disabled) return;
    if (button.dataset.examKey === "ielts") {
      showView("ielts");
    } else {
      showToast("此教材區暫未有可下載內容。", "default", 4200);
    }
  });

  document.querySelectorAll("[data-open-catalog]").forEach(button => {
    button.addEventListener("click", () => activateCatalog(button.dataset.openCatalog || "task2"));
  });

  document.addEventListener("click", event => {
    const go = event.target.closest("[data-go]");
    if (go) showView(go.dataset.go);
  });

  filterChips?.addEventListener("click", event => {
    const chip = event.target.closest("[data-filter]");
    if (!chip) return;
    state.filter = chip.dataset.filter;
    state.page = 1;
    renderCatalog();
  });

  searchInput?.addEventListener("input", event => {
    state.query = event.target.value;
    state.page = 1;
    renderCatalog();
  });

  sortSelect?.addEventListener("change", event => {
    state.sort = event.target.value;
    state.page = 1;
    renderCatalog();
  });

  prevButton?.addEventListener("click", () => {
    state.page = Math.max(1, state.page - 1);
    renderCatalog();
    document.querySelector(".catalog-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  nextButton?.addEventListener("click", () => {
    state.page += 1;
    renderCatalog();
    document.querySelector(".catalog-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  catalogList?.addEventListener("change", event => {
    const checkbox = event.target.closest("[data-select-id]");
    if (!checkbox) return;
    const id = checkbox.dataset.selectId;
    if (checkbox.checked) state.selected.add(id);
    else state.selected.delete(id);
    renderCatalog();
  });

  catalogList?.addEventListener("click", event => {
    const download = event.target.closest("[data-download-id]");
    if (download) {
      event.preventDefault();
      void downloadOne(byId.get(download.dataset.downloadId));
      return;
    }
    if (event.target.closest("[data-select-id]")) return;
    const detailTrigger = event.target.closest("[data-open-detail-id]");
    const row = event.target.closest("[data-essay-row]");
    const id = detailTrigger?.dataset.openDetailId || row?.dataset.essayRow;
    if (id) openDetailModal(byId.get(id), detailTrigger || row);
  });

  selectVisible?.addEventListener("change", () => {
    const visible = pageRows(filteredEssays()).rows;
    visible.forEach(essay => {
      if (selectVisible.checked) state.selected.add(essay.id);
      else state.selected.delete(essay.id);
    });
    renderCatalog();
  });

  clearSelectionButton?.addEventListener("click", () => {
    state.selected.clear();
    renderCatalog();
  });

  downloadSelectedButton?.addEventListener("click", () => { void downloadSelected(); });
  document.querySelector("[data-download-all]")?.addEventListener("click", event => openDownloadAllModal(event.currentTarget));
  document.querySelector("[data-modal-cancel]")?.addEventListener("click", closeDownloadAllModal);
  document.querySelector("[data-modal-confirm]")?.addEventListener("click", () => { void confirmDownloadAll(); });
  document.querySelector("[data-detail-close]")?.addEventListener("click", closeDetailModal);
  document.querySelector("[data-detail-download]")?.addEventListener("click", () => {
    if (state.detailEssay) void downloadOne(state.detailEssay);
  });
  document.querySelector("[data-admin-refresh]")?.addEventListener("click", () => { void loadAdminConsole({ force: true }); });

  adminStudentsBody?.addEventListener("change", event => {
    const toggle = event.target.closest("[data-admin-access-student]");
    if (!toggle) return;
    void saveStudentAccess(toggle.dataset.adminAccessStudent, toggle.dataset.adminAccessKey, toggle.checked);
  });

  adminLogFilter?.addEventListener("change", event => {
    state.adminStudentFilter = event.target.value;
    state.adminPage = 1;
    void loadAdminLogs().catch(error => {
      console.warn("Could not filter model essay download logs:", error);
      setAdminStatus("下載紀錄未能載入。", "error");
    });
  });

  adminLogPrev?.addEventListener("click", () => {
    state.adminPage = Math.max(1, state.adminPage - 1);
    void loadAdminLogs();
  });

  adminLogNext?.addEventListener("click", () => {
    state.adminPage = Math.min(state.adminPageCount, state.adminPage + 1);
    void loadAdminLogs();
  });

  downloadAllModal?.addEventListener("click", event => {
    if (event.target === downloadAllModal) closeDownloadAllModal();
  });

  detailModal?.addEventListener("click", event => {
    if (event.target === detailModal) closeDetailModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && downloadAllModal && !downloadAllModal.hidden) closeDownloadAllModal();
    if (event.key === "Escape" && detailModal && !detailModal.hidden) closeDetailModal();
  });

  window.addEventListener("focus", () => {
    void refreshStudentProfile().catch(() => {});
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void refreshStudentProfile().catch(() => {});
  });
  window.setInterval(() => {
    void refreshStudentProfile({ force: true }).catch(() => {});
  }, 60000);

  async function initialize() {
    renderExamGrid();
    configureCatalogUi();
    renderFilterChips();
    restoreSession();
    setConnection("正在連接", "connecting");
    try {
      await ensureSupabaseSession();
      setConnection("帳戶已連線", "live");
    } catch (error) {
      console.warn("Supabase connection failed:", error);
      setConnection("帳戶服務離線", "offline");
    }
    await checkDownloadApi();
    if (state.currentUser?.role === "admin") {
      try {
        const rows = await callRpc("model_essay_admin_me", { p_admin_token: adminToken() });
        if (!Array.isArray(rows) || !rows.length) throw new Error("Expired admin session");
        showView("admin", { scroll: false });
      } catch (error) {
        clearSession();
        showView("login", { scroll: false });
        setLoginStatus("管理員登入時限已過，請重新登入。", "error");
      }
    } else if (state.currentUser) {
      try {
        await refreshStudentProfile({ force: true });
      } catch (error) {
        console.warn("Could not refresh model essay permissions:", error);
      }
      if (!state.currentUser) return;
      showView("dashboard", { scroll: false });
      void openDownloadSession();
    } else {
      showView("login", { scroll: false });
    }
  }

  void initialize();
})();
