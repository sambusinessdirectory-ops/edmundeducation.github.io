(function initialiseLearningPortalScaffold() {
  "use strict";

  const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
  const portalId = String(document.body?.dataset.learningPortal || "");
  const portal = (window.EDMUND_LEARNING_PORTALS || []).find((item) => item.id === portalId);
  const root = document.querySelector("[data-learning-portal-root]");

  if (!portal || !root) throw new Error("Learning portal configuration is missing.");

  const RANGE_OPTIONS = Object.freeze([
    ["week", "Week"],
    ["month", "Month"],
    ["half-year", "Half a Year"],
    ["ytd", "Year to Date"],
    ["year", "1 Year"],
    ["all", "All Time"]
  ]);
  const state = { supabase: null, user: null, token: "", activityRange: "month", timeRange: "month" };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function titleHtml() {
    return portal.lines.map((line) => escapeHtml(line)).join("<br>");
  }

  function rangeButtons(kind) {
    return RANGE_OPTIONS.map(([value, label]) => (
      `<button type="button" data-${kind}-range="${value}" aria-pressed="${value === "month"}">${label}</button>`
    )).join("");
  }

  function emptyChart(label) {
    return `<svg class="learning-portal-chart" viewBox="0 0 900 300" role="img" aria-label="${escapeHtml(label)}">
      <g class="learning-portal-chart__grid" aria-hidden="true">
        <line x1="76" y1="52" x2="860" y2="52"></line>
        <line x1="76" y1="104" x2="860" y2="104"></line>
        <line x1="76" y1="156" x2="860" y2="156"></line>
        <line x1="76" y1="208" x2="860" y2="208"></line>
        <line x1="76" y1="260" x2="860" y2="260"></line>
        <line class="axis" x1="76" y1="30" x2="76" y2="260"></line>
        <line class="axis" x1="76" y1="260" x2="860" y2="260"></line>
      </g>
      <text x="468" y="150" text-anchor="middle">${escapeHtml(label)}</text>
      <text class="learning-portal-chart__hint" x="468" y="179" text-anchor="middle">完成學習活動後，紀錄會按日期顯示。</text>
    </svg>`;
  }

  function progressMarkup() {
    if (!portal.dashboard) return "";
    const panelId = `${portal.id}-progress-panel`;
    return `<button class="learning-portal-disclosure panel" type="button" data-progress-toggle aria-expanded="false" aria-controls="${panelId}">
      <span><strong>查看學習進展</strong><small>活動日期、每日詳情及學習時間紀錄</small></span>
      <span data-progress-toggle-label>展開 ＋</span>
    </button>
    <section class="learning-portal-progress panel" id="${panelId}" data-progress-panel hidden>
      <section class="learning-portal-progress__section" aria-labelledby="${portal.id}-activity-heading">
        <div class="learning-portal-progress__toolbar">
          <div><p class="eyebrow">ACTIVITY BY DATE</p><h2 id="${portal.id}-activity-heading">學習活動（按日期）</h2><p>按日期查看完成的學習活動及每日詳情。</p></div>
          <div class="learning-portal-ranges" data-activity-ranges aria-label="選擇學習活動統計時段">${rangeButtons("activity")}</div>
        </div>
        <div class="learning-portal-chart-shell">${emptyChart("這個時段暫時未有學習活動")}</div>
        <div class="learning-portal-stats" aria-label="學習活動統計">
          <div><strong>0</strong><span>所選時段活動</span></div>
          <div><strong>0</strong><span>累計活動</span></div>
          <div><strong>0</strong><span>學習日數</span></div>
        </div>
      </section>
      <section class="learning-portal-progress__section learning-portal-time" aria-labelledby="${portal.id}-time-heading">
        <div class="learning-portal-progress__toolbar">
          <div><p class="eyebrow">TIME SPENT BY DATE</p><h2 id="${portal.id}-time-heading">學習時間（按日期）</h2><p>按日期查看每天在這個系統的學習時間。</p></div>
          <div class="learning-portal-ranges" data-time-ranges aria-label="選擇學習時間統計時段">${rangeButtons("time")}</div>
        </div>
        <div class="learning-portal-chart-shell">${emptyChart("這個時段暫時未有學習時間紀錄")}</div>
        <div class="learning-portal-stats learning-portal-stats--time" aria-label="學習時間統計">
          <div><strong>0 分 00 秒</strong><span>累計學習時間</span></div>
          <div><strong>0 分 00 秒</strong><span>所選時段時間</span></div>
          <div><strong>0 分 00 秒</strong><span>平均每次時間</span></div>
        </div>
      </section>
    </section>`;
  }

  function renderScaffold() {
    document.documentElement.style.setProperty("--portal-hue", String(portal.hue));
    root.dataset.portalDashboard = String(portal.dashboard);
    root.dataset.portalBlankAfterLogin = String(portal.blankAfterLogin === true);
    root.innerHTML = `<section class="learning-portal-view learning-portal-login" data-view="login">
      <div class="learning-portal-login__layout">
        <article class="learning-portal-hero panel">
          <span class="learning-portal-hero__ordinal" aria-hidden="true">${portal.ordinal}</span>
          <p class="eyebrow">EDMUND LEARNING PORTAL</p>
          <h1>${titleHtml()}</h1>
          <p>登入後進入專屬學習空間，新的課題會按次序整理在這裡。</p>
          <div class="learning-portal-hero__motif" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        </article>
        <section class="learning-portal-login__panel panel" aria-labelledby="${portal.id}-login-title">
          <div class="learning-portal-login__heading">
            <span>01</span>
            <div><p class="eyebrow">STUDENT LOGIN</p><h2 id="${portal.id}-login-title">登入學習系統</h2><p>請輸入您的學生帳戶資料。</p></div>
          </div>
          <form class="learning-portal-login__form" data-login-form novalidate>
            <label><span>用戶名稱</span><input id="${portal.id}-username" name="username" type="text" autocomplete="username" maxlength="100" required placeholder="輸入用戶名稱"></label>
            <label><span>密碼</span><span class="learning-portal-password"><input id="${portal.id}-password" name="password" type="password" autocomplete="current-password" maxlength="200" required placeholder="輸入密碼"><button type="button" data-password-toggle aria-label="顯示密碼" aria-pressed="false">顯示</button></span></label>
            <p class="learning-portal-login__status" data-login-status role="status" aria-live="polite"></p>
            <button class="learning-portal-primary" type="submit" data-login-button>登入並進入學習空間</button>
          </form>
        </section>
      </div>
    </section>
    <section class="learning-portal-view learning-portal-dashboard" data-view="dashboard" hidden>
      <section class="learning-portal-dashboard__hero panel">
        <div><p class="eyebrow">STUDENT LEARNING SPACE</p><h1>${titleHtml()}</h1><p data-welcome></p></div>
        <span class="learning-portal-dashboard__ordinal" aria-hidden="true">${portal.ordinal}</span>
      </section>
      ${progressMarkup()}
      <section class="learning-portal-empty panel" aria-labelledby="${portal.id}-content-heading">
        <span aria-hidden="true">00</span>
        <div><p class="eyebrow">LEARNING CONTENT</p><h2 id="${portal.id}-content-heading">學習內容</h2><p>這裡暫時未有學習內容。新增的課題會按次序顯示在這裡。</p></div>
      </section>
    </section>`;
    if (portal.blankAfterLogin) {
      const dashboard = root.querySelector('[data-view="dashboard"]');
      dashboard?.replaceChildren();
    }
  }

  renderScaffold();

  const elements = {
    views: [...root.querySelectorAll("[data-view]")],
    connection: document.querySelector("[data-connection-status]"),
    user: document.querySelector("[data-user-pill]"),
    logout: document.querySelector("[data-logout]"),
    loginForm: root.querySelector("[data-login-form]"),
    loginButton: root.querySelector("[data-login-button]"),
    loginStatus: root.querySelector("[data-login-status]"),
    password: root.querySelector(`#${CSS.escape(portal.id)}-password`),
    passwordToggle: root.querySelector("[data-password-toggle]"),
    welcome: root.querySelector("[data-welcome]"),
    progressToggle: root.querySelector("[data-progress-toggle]"),
    progressToggleLabel: root.querySelector("[data-progress-toggle-label]"),
    progressPanel: root.querySelector("[data-progress-panel]")
  };

  function setConnection(label, status = "checking") {
    if (!elements.connection) return;
    elements.connection.textContent = label;
    elements.connection.dataset.state = status;
  }

  function setLoginStatus(message = "", status = "") {
    elements.loginStatus.textContent = message;
    if (status) elements.loginStatus.dataset.state = status;
    else delete elements.loginStatus.dataset.state;
  }

  function showView(name) {
    elements.views.forEach((view) => { view.hidden = view.dataset.view !== name; });
    const signedIn = Boolean(state.user && state.token);
    elements.user.hidden = !signedIn;
    elements.logout.hidden = !signedIn;
    if (signedIn) {
      elements.user.textContent = `${state.user.name} · 學生`;
      if (elements.welcome) elements.welcome.textContent = `${state.user.name}，歡迎回來。`;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initialiseSupabase() {
    if (state.supabase) return state.supabase;
    if (!window.supabase?.createClient || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
      throw new Error("登入服務暫時未能載入，請重新整理頁面。");
    }
    let storage;
    try { storage = window.sessionStorage; } catch { storage = undefined; }
    state.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        persistSession: Boolean(storage),
        ...(storage ? { storage } : {}),
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
    return state.supabase;
  }

  async function ensureSupabaseSession() {
    const client = initialiseSupabase();
    const current = await client.auth.getSession();
    if (current.error) throw current.error;
    if (current.data?.session?.user?.id) return client;
    const signIn = await client.auth.signInAnonymously();
    if (signIn.error) throw signIn.error;
    if (!signIn.data?.session?.user?.id) throw new Error("未能建立安全登入連線。");
    return client;
  }

  async function rpc(name, args) {
    const client = await ensureSupabaseSession();
    const { data, error } = await client.rpc(name, args);
    if (error) throw error;
    return data;
  }

  function saveSession() {
    try {
      if (!state.user || !state.token) sessionStorage.removeItem(portal.sessionKey);
      else sessionStorage.setItem(portal.sessionKey, JSON.stringify({ ...state.user, token: state.token, role: "student" }));
    } catch { /* The validated session remains in memory when storage is unavailable. */ }
  }

  function readSession() {
    try { return JSON.parse(sessionStorage.getItem(portal.sessionKey) || "null"); } catch { return null; }
  }

  function clearSession() {
    state.user = null;
    state.token = "";
    try { sessionStorage.removeItem(portal.sessionKey); } catch { /* Ignore unavailable storage. */ }
  }

  async function validateToken(token) {
    const rows = await rpc("flashcard_student_session_profile", { p_token: String(token) });
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.id || !row?.name || !row?.session_token) return false;
    state.token = String(row.session_token);
    state.user = { id: String(row.id), name: String(row.name), role: "student" };
    saveSession();
    window.EdmundSystemNav?.rememberStudentSession({
      token: state.token,
      id: state.user.id,
      name: state.user.name,
      role: "student"
    });
    return true;
  }

  async function login(username, password) {
    const rows = await rpc("flashcard_student_login", { p_name: username, p_password: password });
    const row = Array.isArray(rows) ? rows[0] : null;
    return row?.session_token ? validateToken(String(row.session_token)) : false;
  }

  async function restoreSession() {
    const universal = window.EdmundSystemNav?.getStudentSession?.();
    const own = readSession();
    const candidate = universal?.role === "student" ? universal : own?.role === "student" ? own : null;
    if (!candidate?.token) return false;
    try { return await validateToken(String(candidate.token)); }
    catch (error) {
      console.warn(`${portal.titleEn} session restore failed`, error);
      clearSession();
      window.EdmundSystemNav?.forgetStudentSession?.();
      return false;
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(elements.loginForm);
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    if (!username || !password) return setLoginStatus("請輸入用戶名稱及密碼。", "error");
    elements.loginButton.disabled = true;
    setLoginStatus("正在核對帳戶…");
    try {
      if (!await login(username, password)) throw new Error("用戶名稱或密碼不正確。");
      elements.loginForm.reset();
      setLoginStatus();
      setConnection("已安全連接", "online");
      showView("dashboard");
      restoreProgressPreference();
    } catch (error) {
      console.warn(`${portal.titleEn} login failed`, error);
      setLoginStatus(error?.message || "登入失敗，請稍後再試。", "error");
      setConnection("連線失敗", "error");
    } finally {
      elements.loginButton.disabled = false;
    }
  }

  function progressPreferenceKey() {
    return `edmund-learning-portal-progress:${portal.id}:${state.user?.id || "student"}`;
  }

  function setProgressExpanded(expanded) {
    if (!elements.progressToggle || !elements.progressPanel) return;
    elements.progressToggle.setAttribute("aria-expanded", String(expanded));
    elements.progressPanel.hidden = !expanded;
    elements.progressToggleLabel.textContent = expanded ? "收起 −" : "展開 ＋";
    try { localStorage.setItem(progressPreferenceKey(), expanded ? "expanded" : "collapsed"); } catch { /* Preference is optional. */ }
  }

  function restoreProgressPreference() {
    if (!elements.progressToggle) return;
    let expanded = false;
    try { expanded = localStorage.getItem(progressPreferenceKey()) === "expanded"; } catch { /* Keep collapsed. */ }
    setProgressExpanded(expanded);
  }

  function selectRange(kind, value) {
    if (!RANGE_OPTIONS.some(([candidate]) => candidate === value)) return;
    state[`${kind}Range`] = value;
    root.querySelectorAll(`[data-${kind}-range]`).forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset[`${kind}Range`] === value));
    });
  }

  async function logout() {
    window.EdmundSystemNav?.forgetStudentSession?.();
    clearSession();
    try { await state.supabase?.auth.signOut(); } catch { /* Anonymous Auth cleanup is best-effort. */ }
    setConnection("準備就緒", "online");
    showView("login");
  }

  function bindEvents() {
    elements.loginForm.addEventListener("submit", handleLogin);
    elements.logout?.addEventListener("click", logout);
    elements.passwordToggle.addEventListener("click", () => {
      const reveal = elements.password.type === "password";
      elements.password.type = reveal ? "text" : "password";
      elements.passwordToggle.textContent = reveal ? "隱藏" : "顯示";
      elements.passwordToggle.setAttribute("aria-label", reveal ? "隱藏密碼" : "顯示密碼");
      elements.passwordToggle.setAttribute("aria-pressed", String(reveal));
    });
    elements.progressToggle?.addEventListener("click", () => {
      setProgressExpanded(elements.progressToggle.getAttribute("aria-expanded") !== "true");
    });
    root.addEventListener("click", (event) => {
      const activity = event.target.closest("[data-activity-range]");
      if (activity) selectRange("activity", activity.dataset.activityRange);
      const time = event.target.closest("[data-time-range]");
      if (time) selectRange("time", time.dataset.timeRange);
    });
  }

  async function initialise() {
    bindEvents();
    setConnection("正在核對登入", "checking");
    if (await restoreSession()) {
      setConnection("已安全連接", "online");
      showView("dashboard");
      restoreProgressPreference();
      return;
    }
    setConnection("準備就緒", "online");
    showView("login");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
  else initialise();
})();
