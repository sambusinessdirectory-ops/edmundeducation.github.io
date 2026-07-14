(() => {
  "use strict";

  const SESSION_KEY = "edmundModelEssayDownloadSession";
  const PAGE_SIZE = 20;
  const essays = Array.isArray(window.EDMUND_MODEL_ESSAYS) ? window.EDMUND_MODEL_ESSAYS : [];
  const meta = window.EDMUND_MODEL_ESSAY_META || {};
  const supabaseConfig = window.EDMUND_SUPABASE || {};
  const apiBase = String(window.EDMUND_DOWNLOAD_API_BASE || "").replace(/\/+$/, "");
  const supabaseClient = window.supabase?.createClient && supabaseConfig.url && supabaseConfig.anonKey
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
    : null;

  const filters = [
    { key: "all", label: "全部" },
    { key: "advantage-disadvantage", label: "Advantage and Disadvantage" },
    { key: "opinion", label: "Opinions" },
    { key: "discuss-both-views", label: "Express Both Views + Your Opinion" },
    { key: "cause-solution", label: "Cause and Solution" },
    { key: "direct-question", label: "Direct Question" }
  ];

  const exams = [
    { key: "dse", label: "DSE", subline: "英文文憑試範文", enabled: false },
    { key: "ielts", label: "IELTS", subline: "雅思寫作範文", enabled: true, featured: true },
    { key: "toeic", label: "TOEIC", subline: "職場英語寫作範文", enabled: false },
    { key: "toefl", label: "TOEFL", subline: "托福寫作範文", enabled: false },
    { key: "pte", label: "PTE", subline: "培生英語寫作範文", enabled: false },
    { key: "government", label: "公務員寫作", subline: "政府職位英文寫作", enabled: false }
  ];

  const state = {
    currentUser: null,
    filter: "all",
    query: "",
    sort: "number-asc",
    page: 1,
    selected: new Set(),
    apiHealthy: false,
    downloadToken: "",
    downloadTokenExpiresAt: 0,
    modalReturnFocus: null
  };

  const byId = new Map(essays.map(essay => [essay.id, essay]));
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
  const toastRegion = document.querySelector("[data-toast-region]");

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
    updateAccountUi();
  }

  function clearSession() {
    state.currentUser = null;
    state.downloadToken = "";
    state.downloadTokenExpiresAt = 0;
    sessionStorage.removeItem(SESSION_KEY);
    updateAccountUi();
  }

  function restoreSession() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (saved?.id && saved?.name && saved?.sessionToken) state.currentUser = saved;
    } catch (error) {
      sessionStorage.removeItem(SESSION_KEY);
    }
    updateAccountUi();
  }

  function updateAccountUi() {
    const signedIn = Boolean(state.currentUser);
    if (userPill) {
      userPill.hidden = !signedIn;
      userPill.textContent = signedIn ? `${state.currentUser.name} · 學生` : "";
    }
    if (logoutButton) logoutButton.hidden = !signedIn;
    document.querySelectorAll("[data-welcome-name]").forEach(node => {
      node.textContent = state.currentUser?.name || "同學";
    });
  }

  function showView(name, options = {}) {
    if (name !== "login" && !state.currentUser) name = "login";
    views.forEach(view => { view.hidden = view.dataset.view !== name; });
    document.body.dataset.currentView = name;
    if (name === "catalog") renderCatalog();
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

  async function login(username, password) {
    const authSession = await ensureSupabaseSession();
    const { data: rows, error } = await supabaseClient.rpc("flashcard_student_login", {
      p_name: username.trim(),
      p_password: password
    });
    if (error) throw error;
    if (!Array.isArray(rows) || !rows.length) return null;
    const student = rows[0];
    return {
      id: student.id,
      name: student.name,
      role: "student",
      access: student.access || {},
      createdAt: student.created_at || null,
      sessionToken: student.session_token,
      authAccessToken: authSession.access_token
    };
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
    if (!state.currentUser?.sessionToken || !apiBase) return false;
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
    examGrid.innerHTML = exams.map(exam => `
      <button class="exam-card${exam.featured ? " featured" : ""}" type="button"
        data-exam-key="${escapeHtml(exam.key)}" ${exam.enabled ? "" : "disabled"}>
        <strong>${escapeHtml(exam.label)}</strong>
        <span>${escapeHtml(exam.subline)}</span>
        <span class="card-tag">${exam.enabled ? "進入下載區" : "即將推出"}</span>
      </button>
    `).join("");
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
      return essay.filename.toLocaleLowerCase().includes(query)
        || essay.categoryLabel.toLocaleLowerCase().includes(query)
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

  function fileDownloadUrl(essay) {
    return `#download-${encodeURIComponent(essay.id)}`;
  }

  function rowHtml(essay) {
    const selected = state.selected.has(essay.id);
    return `
      <article class="essay-row${selected ? " selected" : ""}" data-essay-row="${escapeHtml(essay.id)}">
        <input class="row-checkbox" type="checkbox" data-select-id="${escapeHtml(essay.id)}"
          aria-label="選取 ${escapeHtml(essay.filename)}" ${selected ? "checked" : ""}>
        <img class="essay-thumb" src="${escapeHtml(essay.thumbnail)}" alt="${escapeHtml(essay.filename)} 第一頁縮圖" loading="lazy" width="84" height="109">
        <div class="essay-main">
          <div class="essay-kicker">
            <span class="essay-number">MODEL ESSAY ${essay.number}</span>
            ${essay.problem ? '<span class="problem-badge">需留意</span>' : ""}
          </div>
          <a class="essay-title-link" href="${escapeHtml(fileDownloadUrl(essay))}" data-download-id="${escapeHtml(essay.id)}">${escapeHtml(essay.filename)}</a>
          <div class="essay-detail">PDF · ${essay.pages} 頁 · ${formatBytes(essay.bytes)}</div>
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
      resultSummary.textContent = `顯示 ${rows.length} 份範文 · ${filterLabel}${state.query ? ` · 搜尋「${state.query}」` : ""}`;
    }

    if (catalogList) {
      catalogList.innerHTML = page.rows.length
        ? page.rows.map(rowHtml).join("")
        : '<div class="empty-state"><strong>找不到符合條件的範文</strong><span>請嘗試另一個關鍵字或題型篩選。</span></div>';
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
    form.action = `${apiBase}/v1/files/${encodeURIComponent(essay.id)}`;
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
    const form = document.createElement("form");
    form.method = "post";
    form.action = `${apiBase}/v1/zip`;
    form.target = "edmund-download-frame";
    form.hidden = true;

    const fields = {
      ids: JSON.stringify(items.map(item => item.id)),
      filename: options.filename || "Edmund-IELTS-Task-2-Model-Essays.zip",
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
    if (!(await openDownloadSession())) {
      showToast("ZIP 下載服務暫時未能連線，請稍後再試。", "error", 6500);
      return false;
    }
    submitZip(items, options);
    showToast(`正在準備 ${items.length} 份範文的 ZIP 下載…`, "success", 6500);
    return true;
  }

  async function downloadSelected() {
    const items = [...state.selected].map(id => byId.get(id)).filter(Boolean);
    if (!items.length) return;
    if (items.length > 10) {
      await downloadZip(items, { filename: `Edmund-IELTS-Task-2-Selected-${items.length}.zip` });
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
    await downloadZip(essays, { all: true, filename: "Edmund-IELTS-Task-2-All-Model-Essays.zip" });
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
      showView("dashboard");
      void openDownloadSession();
    } catch (error) {
      console.warn("Download library login failed:", error);
      setConnection("登入服務離線", "offline");
      setLoginStatus("登入服務暫時未能連線，請稍後再試。", "error");
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "進入範文下載區";
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
    await closeDownloadSession();
    clearSession();
    state.selected.clear();
    setLoginStatus("");
    showView("login");
  });

  examGrid?.addEventListener("click", event => {
    const button = event.target.closest("[data-exam-key]");
    if (button?.dataset.examKey === "ielts") showView("ielts");
  });

  document.querySelector("[data-open-catalog]")?.addEventListener("click", () => showView("catalog"));

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
    if (!download) return;
    event.preventDefault();
    void downloadOne(byId.get(download.dataset.downloadId));
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

  downloadAllModal?.addEventListener("click", event => {
    if (event.target === downloadAllModal) closeDownloadAllModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && downloadAllModal && !downloadAllModal.hidden) closeDownloadAllModal();
  });

  async function initialize() {
    renderExamGrid();
    renderFilterChips();
    document.querySelector("[data-total-count]").textContent = String(essays.length);
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
    if (state.currentUser) {
      showView("dashboard", { scroll: false });
      void openDownloadSession();
    } else {
      showView("login", { scroll: false });
    }
  }

  void initialize();
})();
