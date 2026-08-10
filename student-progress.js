import {
  STUDENT_PROGRESS_RANGES,
  STUDENT_PROGRESS_SOURCES,
  addLocalDays,
  buildActivitySeries,
  buildMasterTimeSeries,
  buildSourceTimeSeries,
  buildWritingAverageSeries,
  formatProgressDuration,
  localDayKey,
  niceProgressMaximum,
  normalizeProgressSnapshot,
  progressPolyline,
  resolveProgressRange
} from "./student-progress-core.js";

const CONFIG = window.EDMUND_STUDENT_PROGRESS_CONFIG || {};
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const SCHEDULE_CONFIG = window.EDMUND_SCHEDULE_CONFIG || {};
const PARENT_MODE = document.body?.dataset.progressPortal === "parent";
const SESSION_KEY = PARENT_MODE
  ? "edmund-parent-communication-session-v1"
  : "edmund-student-progress-session-v1";

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  connection: document.querySelector("[data-connection-status]"),
  userPill: document.querySelector("[data-user-pill]"),
  refresh: document.querySelector("[data-refresh]"),
  logout: document.querySelector("[data-logout]"),
  changePassword: document.querySelector("[data-change-password]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginButton: document.querySelector("[data-login-button]"),
  loginStatus: document.querySelector("[data-login-status]"),
  username: document.querySelector("#student-progress-username"),
  password: document.querySelector("#student-progress-password"),
  passwordToggle: document.querySelector("[data-password-toggle]"),
  dashboardWelcome: document.querySelector("[data-dashboard-welcome]"),
  dashboardStatus: document.querySelector("[data-dashboard-status]"),
  dashboardGroups: document.querySelector("[data-dashboard-groups]"),
  sourceGroups: document.querySelector("[data-source-groups]"),
  rangeButtons: document.querySelector("[data-range-buttons]"),
  customRangeForm: document.querySelector("[data-custom-range-form]"),
  customRangeStart: document.querySelector("[data-custom-range-start]"),
  customRangeEnd: document.querySelector("[data-custom-range-end]"),
  customRangeStatus: document.querySelector("[data-custom-range-status]"),
  masterTotal: document.querySelector("[data-master-total]"),
  masterSummary: document.querySelector("[data-master-summary]"),
  generatedAt: document.querySelector("[data-generated-at]"),
  masterCumulativeTotal: document.querySelector("[data-master-cumulative-total]"),
  masterDailyTotal: document.querySelector("[data-master-daily-total]"),
  masterCumulativeChart: document.querySelector("[data-master-cumulative-chart]"),
  masterDailyChart: document.querySelector("[data-master-daily-chart]"),
  masterCumulativeLegend: document.querySelector("[data-master-cumulative-legend]"),
  masterDailyLegend: document.querySelector("[data-master-daily-legend]"),
  adminPicker: document.querySelector("[data-admin-picker]"),
  adminStudentSelect: document.querySelector("[data-admin-student-select]"),
  scheduleSnapshot: document.querySelector("[data-schedule-snapshot]"),
  scheduleSummary: document.querySelector("[data-schedule-summary]"),
  scheduleWeekLabel: document.querySelector("[data-schedule-week-label]"),
  scheduleStatus: document.querySelector("[data-schedule-status]"),
  scheduleGrid: document.querySelector("[data-schedule-week-grid]"),
  schedulePrevious: document.querySelector("[data-schedule-previous]"),
  scheduleCurrent: document.querySelector("[data-schedule-current]"),
  scheduleNext: document.querySelector("[data-schedule-next]"),
  passwordDialog: document.querySelector("[data-password-dialog]"),
  passwordForm: document.querySelector("[data-password-form]"),
  passwordCurrent: document.querySelector("[data-password-current]"),
  passwordNew: document.querySelector("[data-password-new]"),
  passwordConfirm: document.querySelector("[data-password-confirm]"),
  passwordStatus: document.querySelector("[data-password-status]"),
  toast: document.querySelector("[data-toast]")
};

const state = {
  supabase: null,
  user: null,
  authToken: "",
  range: "month",
  customRange: { start: "", end: "" },
  snapshot: null,
  adminStudents: [],
  selectedAdminStudentId: "",
  requestRevision: 0,
  scheduleRevision: 0,
  scheduleWeekStart: "",
  toastTimer: 0
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function activeRangeValue() {
  return state.range === "custom"
    ? { id: "custom", start: state.customRange.start, end: state.customRange.end }
    : state.range;
}

function currentHongKongWeekStart() {
  const todayKey = localDayKey(new Date());
  const today = new Date(`${todayKey}T12:00:00Z`);
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  return localDayKey(addLocalDays(today, -mondayOffset));
}

function formatDayLabel(dayKey, options = {}) {
  const date = new Date(`${dayKey}T12:00:00Z`);
  if (!Number.isFinite(date.getTime())) return dayKey;
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    month: "numeric",
    day: "numeric",
    ...options
  }).format(date);
}

function setStatus(element, message = "", status = "") {
  if (!element) return;
  element.textContent = message;
  element.dataset.state = status;
}

function setConnection(message, status = "checking") {
  if (!elements.connection) return;
  elements.connection.textContent = message;
  elements.connection.dataset.state = status;
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 2800);
}

function showView(name) {
  for (const view of elements.views) view.hidden = view.dataset.view !== name;
  const loggedIn = Boolean(state.user && state.authToken);
  elements.userPill.hidden = !loggedIn;
  elements.refresh.hidden = !loggedIn || name !== "dashboard";
  elements.logout.hidden = !loggedIn;
  if (elements.changePassword) elements.changePassword.hidden = !loggedIn || !PARENT_MODE;
  if (loggedIn) {
    elements.userPill.textContent = state.user.role === "admin"
      ? `${state.user.name} · 管理員`
      : state.user.role === "parent"
        ? `${state.user.name} · 家長`
      : state.user.name;
  }
  if (name === "login") elements.dashboardGroups.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function workerBaseUrl() {
  const value = String(PARENT_MODE ? SCHEDULE_CONFIG.workerBaseUrl : CONFIG.workerBaseUrl || "").trim().replace(/\/+$/, "");
  if (!value.startsWith("https://")) throw new Error("進度服務尚未完成設定。");
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
    // Keep the status fallback.
  }
  const error = new Error(message);
  error.status = response.status;
  error.code = code;
  return error;
}

async function apiJson(path, options = {}, includeAuth = true, token = state.authToken) {
  const headers = new Headers(options.headers || {});
  if (includeAuth && token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  let response;
  try {
    response = await fetch(`${workerBaseUrl()}/${String(path || "").replace(/^\/+/, "")}`, {
      ...options,
      headers,
      credentials: "omit"
    });
  } catch (cause) {
    const error = new Error("暫時未能連接進度服務，請檢查網絡後再試。");
    error.cause = cause;
    throw error;
  }
  if (!response.ok) {
    const error = await parseApiError(response);
    if (includeAuth && error.status === 401 && token === state.authToken) {
      const wasStudent = state.user?.role === "student";
      clearSession();
      if (wasStudent) window.EdmundSystemNav?.forgetStudentSession();
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
  const client = initialiseSupabaseClient();
  const current = await client.auth.getSession();
  if (current.error) throw current.error;
  if (current.data?.session?.user?.id) return client;
  const signIn = await client.auth.signInAnonymously();
  if (signIn.error) throw signIn.error;
  if (!signIn.data?.session?.user?.id) throw new Error("未能建立安全登入連線。");
  return client;
}

function readStoredSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
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
    // Authentication remains valid in memory if storage is unavailable.
  }
}

function clearSession() {
  state.requestRevision += 1;
  state.scheduleRevision += 1;
  state.user = null;
  state.authToken = "";
  state.snapshot = null;
  state.adminStudents = [];
  state.selectedAdminStudentId = "";
  state.scheduleWeekStart = "";
  elements.adminPicker.hidden = true;
  elements.dashboardGroups.hidden = true;
  if (elements.scheduleSnapshot) elements.scheduleSnapshot.hidden = true;
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Best effort. */ }
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
    user: { id: String(row.id || ""), name: String(row.name || username), role: "student" }
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
    user: { id: String(admin.id || "student-progress-admin"), name: String(admin.name || username), role: "admin" }
  };
}

async function parentRpc(functionName, args = {}) {
  const client = await ensureSupabaseSession();
  const { data, error } = await client.rpc(functionName, args);
  if (error) throw error;
  return data;
}

async function parentLogin(username, password) {
  const payload = await apiJson("/v1/parent/login", {
    method: "POST",
    body: JSON.stringify({ name: username, password })
  }, false);
  const parent = payload?.parent;
  if (!parent?.parent_token) return null;
  return {
    token: String(parent.parent_token),
    user: { id: String(parent.parent_id || ""), name: String(parent.name || username), role: "parent" }
  };
}

function sharedStudentSession() {
  const shared = window.EdmundSystemNav?.getStudentSession?.();
  return shared?.role === "student" && shared.token && shared.name ? shared : null;
}

async function restoreSession() {
  const stored = readStoredSession();
  const allowedRoles = PARENT_MODE ? ["parent"] : ["student", "admin"];
  const candidate = stored?.token && allowedRoles.includes(stored.role)
    ? stored
    : PARENT_MODE ? null : sharedStudentSession();
  if (!candidate?.token) return false;
  state.authToken = String(candidate.token);
  state.user = {
    id: String(candidate.id || ""),
    name: String(candidate.name || ""),
    role: PARENT_MODE ? "parent" : candidate.role === "admin" ? "admin" : "student"
  };
  try {
    if (PARENT_MODE) {
      const rows = await parentRpc("parent_communication_me", { p_parent_token: state.authToken });
      const profile = Array.isArray(rows) ? rows[0] : null;
      if (!profile?.id || !profile?.name) throw new Error("Invalid parent profile");
      state.user = { id: String(profile.id), name: String(profile.name), role: "parent" };
      saveSession();
      return true;
    }
    const payload = await apiJson(state.user.role === "admin" ? "/v1/admin/me" : "/v1/student/me");
    const profile = state.user.role === "admin" ? payload?.admin : payload?.student;
    if (!profile?.id || !profile?.name) throw new Error("Invalid profile");
    state.user = { id: String(profile.id), name: String(profile.name), role: state.user.role };
    if (state.user.role === "student") {
      window.EdmundSystemNav?.rememberStudentSession({
        token: state.authToken,
        id: state.user.id,
        name: state.user.name,
        role: "student"
      });
    }
    saveSession();
    return true;
  } catch (error) {
    console.warn("Student Progress session restore failed", error);
    clearSession();
    return false;
  }
}

function formatDateTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "尚未更新";
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(date);
}

function axisDuration(milliseconds) {
  const ms = Math.max(0, Number(milliseconds || 0));
  if (ms >= 3600000) return `${Number((ms / 3600000).toFixed(ms >= 36000000 ? 0 : 1))}h`;
  if (ms >= 60000) return `${Math.round(ms / 60000)}m`;
  return `${Math.round(ms / 1000)}s`;
}

function compactNumber(value) {
  return new Intl.NumberFormat("zh-HK", { notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function chartLegend(element, series) {
  element.innerHTML = series.map((item) => `
    <span class="legend-item"><i class="legend-dot" style="--legend-color:${escapeHtml(item.color)}"></i>${escapeHtml(item.label)}</span>
  `).join("");
}

function renderLineChart(svg, {
  points,
  series,
  time = false,
  yTitle = time ? "學習時間" : "完成數量"
}) {
  const width = 960;
  const height = 350;
  const dimensions = { width, height, left: 68, right: 26, top: 30, bottom: 54 };
  const plotWidth = width - dimensions.left - dimensions.right;
  const plotHeight = height - dimensions.top - dimensions.bottom;
  const values = points.flatMap((point) => series.map((item) => Math.max(0, Number(item.value(point) || 0))));
  const rawMaximum = Math.max(0, ...values);
  const maximum = niceProgressMaximum(rawMaximum);
  const gridRows = 5;
  const grid = Array.from({ length: gridRows + 1 }, (_, index) => {
    const ratio = index / gridRows;
    const y = dimensions.top + plotHeight * ratio;
    const value = maximum * (1 - ratio);
    return `<line x1="${dimensions.left}" y1="${y}" x2="${width - dimensions.right}" y2="${y}" stroke="rgba(26,65,91,.11)" stroke-width="1" />
      <text x="${dimensions.left - 10}" y="${y + 4}" text-anchor="end" fill="#6b7e8e" font-size="11">${escapeHtml(time ? axisDuration(value) : compactNumber(value))}</text>`;
  }).join("");
  const labelStep = Math.max(1, Math.ceil(points.length / 7));
  const xLabels = points.map((point, index) => {
    if (index % labelStep !== 0 && index !== points.length - 1) return "";
    const x = dimensions.left + plotWidth * index / Math.max(points.length - 1, 1);
    const label = String(point.key || "").slice(5).replace("-", "/");
    return `<text x="${x}" y="${height - 23}" text-anchor="middle" fill="#6b7e8e" font-size="11">${escapeHtml(label)}</text>`;
  }).join("");
  const lines = series.map((item) => {
    const polyline = progressPolyline(points, item.value, dimensions, maximum);
    return `<polyline points="${polyline}" fill="none" stroke="${escapeHtml(item.color)}" stroke-width="${item.emphasis ? 5 : 3}" stroke-linecap="round" stroke-linejoin="round" opacity="${item.emphasis ? 1 : .88}" />`;
  }).join("");
  const pointStep = Math.max(1, Math.ceil(points.length / 90));
  const hoverWidth = Math.max(5, plotWidth / Math.max(points.length, 1) * pointStep);
  const hoverPoints = points.map((point, index) => {
    if (index % pointStep !== 0 && index !== points.length - 1) return "";
    const x = dimensions.left + plotWidth * index / Math.max(points.length - 1, 1);
    const labels = series.map((item) => {
      const value = Math.max(0, Number(item.value(point) || 0));
      return `${item.label}: ${time ? formatProgressDuration(value, { compact: true }) : compactNumber(value)}`;
    }).join(" · ");
    const hoverX = Math.max(dimensions.left, Math.min(width - dimensions.right - hoverWidth, x - hoverWidth / 2));
    return `<rect x="${hoverX}" y="${dimensions.top}" width="${hoverWidth}" height="${plotHeight}" fill="transparent" tabindex="0"><title>${escapeHtml(point.key)} · ${escapeHtml(labels)}</title></rect>`;
  }).join("");
  const empty = rawMaximum > 0 ? "" : `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#748696" font-size="18" font-weight="800">此時段暫未有紀錄</text>`;
  svg.innerHTML = `
    <rect width="${width}" height="${height}" rx="14" fill="#fbfdfe" />
    ${grid}
    <line x1="${dimensions.left}" y1="${dimensions.top}" x2="${dimensions.left}" y2="${height - dimensions.bottom}" stroke="rgba(26,65,91,.22)" />
    <line x1="${dimensions.left}" y1="${height - dimensions.bottom}" x2="${width - dimensions.right}" y2="${height - dimensions.bottom}" stroke="rgba(26,65,91,.22)" />
    ${lines}${xLabels}${hoverPoints}${empty}
    <text x="${dimensions.left}" y="18" fill="#264e68" font-size="12" font-weight="900">${escapeHtml(yTitle)}</text>
  `;
}

function renderRangeButtons() {
  elements.rangeButtons.innerHTML = STUDENT_PROGRESS_RANGES.map((range) => `
    <button type="button" data-range="${escapeHtml(range.id)}" aria-pressed="${range.id === state.range}">${escapeHtml(range.label)}</button>
  `).join("");
  if (!elements.customRangeForm) return;
  const todayKey = localDayKey(new Date());
  if (!state.customRange.end) state.customRange.end = todayKey;
  if (!state.customRange.start) state.customRange.start = localDayKey(addLocalDays(todayKey, -29));
  elements.customRangeStart.max = todayKey;
  elements.customRangeEnd.max = todayKey;
  elements.customRangeStart.value = state.customRange.start;
  elements.customRangeEnd.value = state.customRange.end;
  elements.customRangeForm.hidden = state.range !== "custom";
}

function sourceGroupHtml(source, index) {
  const activityDescription = source.id === "flashcards"
    ? "沿用 Flashcard 原有的綠勾、紅叉及完成卡片計算方式。"
    : source.id === "writingPractice"
      ? "沿用寫作練習原有的完成題數及練習紀錄計算方式。"
      : source.id === "speaking"
        ? "只計算已成功儲存並可供學生使用的錄音。"
        : source.id === "writingSubmission"
          ? "每篇已提交文章計算一次；學生隱藏文章後仍保留歷史進度。"
          : "每道題目只按唯一課題及題目編號計算；重試或改正不會重複增加題數。";
  const writingAverage = source.id === "writingSubmission" ? `
    <article class="chart-card chart-card-wide">
      <div class="chart-heading">
        <div><p class="eyebrow">AVERAGE TIME</p><h3>每篇文章平均寫作時間</h3></div>
        <strong data-source-average-total>0 秒</strong>
      </div>
      <p class="chart-description">以每篇已提交文章的寫作時間計算；學生隱藏文章後，歷史進度仍會保留。</p>
      <div class="chart-scroll"><svg class="progress-chart" data-source-average-chart viewBox="0 0 960 350" role="img" aria-label="每篇文章平均寫作時間圖表"></svg></div>
      <div class="chart-legend"><span class="legend-item"><i class="legend-dot" style="--legend-color:${source.color}"></i>每日平均時間</span></div>
    </article>` : "";
  const sourceNavigation = PARENT_MODE
    ? `<span class="system-link" aria-disabled="true">家長帳戶只可查看進度</span>`
    : `<a class="system-link" href="${escapeHtml(source.href)}">前往 ${escapeHtml(source.labelZh)} →</a>`;
  return `
    <details class="dashboard-group source-group" open data-source-group="${escapeHtml(source.id)}" style="--source-color:${escapeHtml(source.color)}">
      <summary>
        <span class="group-index">${String(index + 2).padStart(2, "0")}</span>
        <span><strong>${escapeHtml(source.labelZh)}</strong><small>${escapeHtml(source.labelEn)}</small></span>
        <span class="summary-value" data-source-summary>0</span>
      </summary>
      <div class="group-body source-chart-grid">
        <article class="chart-card">
          <div class="chart-heading">
            <div><p class="eyebrow">ACTIVITY</p><h3>${escapeHtml(source.activityTitle)}</h3></div>
            <span class="chart-heading-metrics">
              <span><strong data-source-activity-period>0</strong><small>所選時段</small></span>
              <span><strong data-source-activity-all>0</strong><small>全部時間</small></span>
            </span>
          </div>
          <p class="chart-description">${escapeHtml(activityDescription)}</p>
          <div class="chart-scroll"><svg class="progress-chart" data-source-activity-chart viewBox="0 0 960 350" role="img" aria-label="${escapeHtml(source.activityTitle)}圖表"></svg></div>
          <div class="chart-legend" data-source-activity-legend></div>
        </article>
        <article class="chart-card">
          <div class="chart-heading">
            <div><p class="eyebrow">TIME SPENT</p><h3>每日學習時間</h3></div>
            <span class="chart-heading-metrics">
              <span><strong data-source-time-period>0 秒</strong><small>所選時段</small></span>
              <span><strong data-source-time-all>0 秒</strong><small>全部時間</small></span>
            </span>
          </div>
          <p class="chart-description">顯示所選時段內，每日由此系統記錄的實際學習時間。</p>
          <div class="chart-scroll"><svg class="progress-chart" data-source-time-chart viewBox="0 0 960 350" role="img" aria-label="${escapeHtml(source.labelZh)}每日學習時間圖表"></svg></div>
          <div class="chart-legend"><span class="legend-item"><i class="legend-dot" style="--legend-color:${escapeHtml(source.color)}"></i>每日學習時間</span></div>
        </article>
        ${writingAverage}
        ${sourceNavigation}
      </div>
    </details>`;
}

function buildDashboardShell() {
  renderRangeButtons();
  elements.sourceGroups.innerHTML = STUDENT_PROGRESS_SOURCES.map(sourceGroupHtml).join("");
}

function renderMaster(snapshot) {
  const master = buildMasterTimeSeries(snapshot, activeRangeValue());
  elements.masterTotal.textContent = formatProgressDuration(master.allTimeTotalMs);
  elements.masterSummary.textContent = formatProgressDuration(master.allTimeTotalMs, { compact: true });
  elements.masterCumulativeTotal.textContent = formatProgressDuration(master.allTimeTotalMs);
  elements.masterDailyTotal.textContent = formatProgressDuration(master.periodTotalMs);
  const totalSeries = { label: "全部系統總和", color: "#102a43", emphasis: true };
  const sources = STUDENT_PROGRESS_SOURCES.map((source) => ({
    label: source.labelEn,
    color: source.color,
    sourceId: source.id
  }));
  const cumulativeSeries = [
    { ...totalSeries, value: (point) => point.cumulativeTotalMs },
    ...sources.map((source) => ({ ...source, value: (point) => point.cumulativeSystems[source.sourceId] || 0 }))
  ];
  const dailySeries = [
    { ...totalSeries, value: (point) => point.totalMs },
    ...sources.map((source) => ({ ...source, value: (point) => point.systems[source.sourceId] || 0 }))
  ];
  renderLineChart(elements.masterCumulativeChart, {
    points: master.points,
    series: cumulativeSeries,
    time: true,
    yTitle: "累積時間"
  });
  renderLineChart(elements.masterDailyChart, {
    points: master.points,
    series: dailySeries,
    time: true,
    yTitle: "每日時間"
  });
  chartLegend(elements.masterCumulativeLegend, cumulativeSeries);
  chartLegend(elements.masterDailyLegend, dailySeries);
}

function renderSource(snapshot, definition) {
  const group = elements.sourceGroups.querySelector(`[data-source-group="${definition.id}"]`);
  if (!group) return;
  const range = activeRangeValue();
  const activity = buildActivitySeries(snapshot, definition.id, range);
  const time = buildSourceTimeSeries(snapshot, definition.id, range);
  const activityTotal = activity.allTimeTotals[definition.primaryMetric] || 0;
  const activityPeriodTotal = activity.totals[definition.primaryMetric] || 0;
  group.querySelector("[data-source-summary]").textContent = `${compactNumber(activityTotal)} ${definition.activityUnit} · ${formatProgressDuration(time.allTimeMs, { compact: true })}`;
  group.querySelector("[data-source-activity-period]").textContent = `${compactNumber(activityPeriodTotal)} ${definition.activityUnit}`;
  group.querySelector("[data-source-activity-all]").textContent = `${compactNumber(activityTotal)} ${definition.activityUnit}`;
  group.querySelector("[data-source-time-period]").textContent = formatProgressDuration(time.periodTotalMs);
  group.querySelector("[data-source-time-all]").textContent = formatProgressDuration(time.allTimeMs);
  const activitySeries = definition.activitySeries.map((series) => ({
    ...series,
    value: (point) => point[series.key] || 0
  }));
  renderLineChart(group.querySelector("[data-source-activity-chart]"), {
    points: activity.points,
    series: activitySeries,
    yTitle: definition.activityUnit
  });
  chartLegend(group.querySelector("[data-source-activity-legend]"), activitySeries);
  renderLineChart(group.querySelector("[data-source-time-chart]"), {
    points: time.points,
    series: [{ label: "每日學習時間", color: definition.color, value: (point) => point.totalMs }],
    time: true,
    yTitle: "每日時間"
  });
  if (definition.id === "writingSubmission") {
    const average = buildWritingAverageSeries(snapshot, range);
    group.querySelector("[data-source-average-total]").textContent = formatProgressDuration(average.allTimeAverageMs);
    renderLineChart(group.querySelector("[data-source-average-chart]"), {
      points: average.points,
      series: [{ label: "每日平均時間", color: definition.color, value: (point) => point.averageMs }],
      time: true,
      yTitle: "每篇平均時間"
    });
  }
}

const SCHEDULE_FIRST_WEEK = "2025-12-29";
const SCHEDULE_LAST_WEEK = "2050-12-26";
const SCHEDULE_DAY_NAMES = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];

function scheduleIsOwnStudentView(snapshot = state.snapshot) {
  return !PARENT_MODE
    && state.user?.role === "student"
    && Boolean(state.user.id)
    && String(snapshot?.student?.id || "") === String(state.user.id);
}

function scheduleDurationLabel(value) {
  const minutes = Math.max(0, Math.round(Number(value || 0)));
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${minutes} 分鐘`;
  return remainder ? `${hours} 小時 ${remainder} 分鐘` : `${hours} 小時`;
}

function scheduleEntryState(entry) {
  if (entry?.isCompleted) return { key: "completed", label: "已完成" };
  if (entry?.isInProgress) return { key: "in-progress", label: "進行中" };
  if (entry?.isPreviousIncomplete) return { key: "previous", label: "上週未完成" };
  return { key: "pending", label: "未完成" };
}

function renderScheduleWeek(payload = {}) {
  if (!elements.scheduleGrid) return;
  const weekStart = String(payload.weekStart || state.scheduleWeekStart || "");
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  const weekEnd = localDayKey(addLocalDays(weekStart, 6));
  elements.scheduleWeekLabel.textContent = `${formatDayLabel(weekStart, { year: "numeric" })} — ${formatDayLabel(weekEnd, { year: "numeric" })}`;
  elements.scheduleSummary.textContent = `${entries.length} 項安排`;
  elements.schedulePrevious.disabled = weekStart <= SCHEDULE_FIRST_WEEK;
  elements.scheduleNext.disabled = weekStart >= SCHEDULE_LAST_WEEK;
  elements.scheduleGrid.innerHTML = Array.from({ length: 7 }, (_, index) => {
    const dayKey = localDayKey(addLocalDays(weekStart, index));
    const dayEntries = entries
      .filter((entry) => String(entry?.scheduleDate || "") === dayKey && String(entry?.message || "").trim())
      .sort((a, b) => Number(a.slotIndex || 0) - Number(b.slotIndex || 0));
    const tasks = dayEntries.length ? dayEntries.map((entry) => {
      const status = scheduleEntryState(entry);
      const duration = scheduleDurationLabel(entry.estimatedMinutes);
      const source = entry.source === "teacher" ? "老師安排" : "學生安排";
      return `<article class="schedule-task" data-source="${entry.source === "teacher" ? "teacher" : "student"}" data-state="${status.key}">
        <strong>${escapeHtml(entry.message)}</strong>
        <span class="schedule-task-meta"><span>Slot ${String(Number(entry.slotIndex || 0)).padStart(2, "0")}</span><span>${source}</span><span>${status.label}</span>${duration ? `<span>預計 ${escapeHtml(duration)}</span>` : ""}</span>
      </article>`;
    }).join("") : `<p class="schedule-empty-day">本日未有已儲存安排。</p>`;
    return `<section class="schedule-day"><header><strong>${SCHEDULE_DAY_NAMES[index]}</strong><small>${escapeHtml(formatDayLabel(dayKey))}</small></header><div class="schedule-day-list">${tasks}</div></section>`;
  }).join("");
}

async function loadScheduleWeek({ announce = false } = {}) {
  if (!elements.scheduleSnapshot || !scheduleIsOwnStudentView()) {
    if (elements.scheduleSnapshot) elements.scheduleSnapshot.hidden = true;
    return;
  }
  if (!state.scheduleWeekStart) state.scheduleWeekStart = currentHongKongWeekStart();
  const revision = ++state.scheduleRevision;
  elements.scheduleSnapshot.hidden = false;
  elements.scheduleGrid.innerHTML = "";
  setStatus(elements.scheduleStatus, "正在讀取本週功課…");
  try {
    const client = await ensureSupabaseSession();
    const { data, error } = await client.rpc("schedule_student_get_week", {
      p_token: state.authToken,
      p_week_start: state.scheduleWeekStart
    });
    if (error) throw error;
    if (revision !== state.scheduleRevision || !scheduleIsOwnStudentView()) return;
    if (!data || typeof data !== "object" || String(data.weekStart || "") !== state.scheduleWeekStart) {
      throw new Error("未能讀取這一週的功課安排。");
    }
    renderScheduleWeek(data);
    setStatus(elements.scheduleStatus, "");
    if (announce) showToast("本週功課快照已更新。");
  } catch (error) {
    if (revision !== state.scheduleRevision) return;
    console.warn("Student Progress schedule snapshot failed", error);
    setStatus(elements.scheduleStatus, error.message || "暫時未能讀取功課安排。", "error");
  }
}

function renderDashboard() {
  if (!state.snapshot) return;
  const snapshot = normalizeProgressSnapshot(state.snapshot);
  renderRangeButtons();
  renderMaster(snapshot);
  STUDENT_PROGRESS_SOURCES.forEach((source) => renderSource(snapshot, source));
  elements.generatedAt.textContent = `更新：${formatDateTime(snapshot.generatedAt)}`;
  elements.dashboardWelcome.textContent = state.user?.role === "admin"
    ? `現正查看 ${snapshot.student.name} 的全部學習紀錄。`
    : state.user?.role === "parent"
      ? `現正查看 ${snapshot.student.name} 的全面英文能力發展進度；家長帳戶不能進入其練習內容。`
    : `${snapshot.student.name}，以下數據直接來自各個學習系統的正式紀錄。`;
  elements.dashboardGroups.hidden = false;
  if (!scheduleIsOwnStudentView(snapshot)) {
    state.scheduleRevision += 1;
    if (elements.scheduleSnapshot) elements.scheduleSnapshot.hidden = true;
  }
  setStatus(elements.dashboardStatus, "");
}

function renderAdminStudents() {
  elements.adminStudentSelect.innerHTML = state.adminStudents.map((student) => `
    <option value="${escapeHtml(student.id)}"${student.id === state.selectedAdminStudentId ? " selected" : ""}>${escapeHtml(student.name)}</option>
  `).join("");
  elements.adminPicker.hidden = false;
}

async function loadSnapshot({ announce = false } = {}) {
  const revision = ++state.requestRevision;
  elements.dashboardGroups.hidden = true;
  setStatus(elements.dashboardStatus, "正在同步所有學習系統的最新紀錄…");
  try {
    const payload = state.user.role === "parent"
      ? await parentRpc("parent_communication_snapshot", {
          p_parent_token: state.authToken,
          p_student_id: state.selectedAdminStudentId
        }).then((rows) => ({ snapshot: Array.isArray(rows) ? rows[0]?.snapshot : null }))
      : await apiJson(state.user.role === "admin"
        ? `/v1/admin/students/${encodeURIComponent(state.selectedAdminStudentId)}/progress`
        : "/v1/progress");
    if (revision !== state.requestRevision) return;
    if (!payload?.snapshot?.student?.id) throw new Error("未能讀取完整進度資料。");
    state.snapshot = payload.snapshot;
    renderDashboard();
    if (scheduleIsOwnStudentView(payload.snapshot)) await loadScheduleWeek();
    setConnection("已同步", "online");
    if (announce) showToast("所有進度已更新。");
  } catch (error) {
    if (revision !== state.requestRevision) return;
    console.warn("Student Progress snapshot failed", error);
    setStatus(elements.dashboardStatus, error.message || "未能讀取進度，請稍後再試。", "error");
    elements.dashboardGroups.hidden = true;
  }
}

async function openDashboard() {
  showView("dashboard");
  if (state.user.role === "admin" || state.user.role === "parent") {
    setStatus(elements.dashboardStatus, "正在讀取學生名單…");
    const payload = state.user.role === "parent"
      ? { students: await parentRpc("parent_communication_students", { p_parent_token: state.authToken }) }
      : await apiJson("/v1/admin/students");
    state.adminStudents = Array.isArray(payload?.students) ? payload.students.map((student) => ({
      id: String(student.id || ""), name: String(student.name || "")
    })).filter((student) => student.id && student.name) : [];
    if (!state.adminStudents.length) {
      renderAdminStudents();
      setStatus(elements.dashboardStatus, state.user.role === "parent"
        ? "此家長帳戶尚未獲指派任何學生，請聯絡 Edmund Sir。"
        : "暫時沒有學生帳戶。", "error");
      return;
    }
    if (!state.adminStudents.some((student) => student.id === state.selectedAdminStudentId)) {
      state.selectedAdminStudentId = state.adminStudents[0].id;
    }
    renderAdminStudents();
  } else {
    elements.adminPicker.hidden = true;
  }
  await loadSnapshot();
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
    const isAdmin = !PARENT_MODE
      && username.toLocaleLowerCase() === String(CONFIG.adminUsername || "").toLocaleLowerCase();
    const result = PARENT_MODE
      ? await parentLogin(username, password)
      : isAdmin ? await adminLogin(username, password) : await studentLogin(username, password);
    if (!result) throw new Error("用戶名稱或密碼不正確。");
    state.authToken = result.token;
    state.user = result.user;
    if (!PARENT_MODE && !isAdmin) {
      window.EdmundSystemNav?.rememberStudentSession({
        token: result.token,
        id: result.user.id,
        name: result.user.name,
        role: "student"
      });
    }
    saveSession();
    elements.loginForm.reset();
    setStatus(elements.loginStatus, "");
    setConnection("已安全連接", "online");
    await openDashboard();
    showToast(state.user.role === "admin"
      ? "管理員登入成功。"
      : state.user.role === "parent"
        ? `歡迎，${state.user.name}。`
        : `你好，${state.user.name}！`);
  } catch (error) {
    console.warn("Student Progress login failed", error);
    setStatus(elements.loginStatus, error.message || "登入失敗，請再試一次。", "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function logout() {
  const role = state.user?.role;
  if (role === "student") window.EdmundSystemNav?.forgetStudentSession();
  try {
    if (role === "admin" && state.authToken) await apiJson("/v1/admin/logout", { method: "POST" });
    if (role === "parent" && state.authToken) {
      await parentRpc("parent_communication_logout", { p_parent_token: state.authToken });
    }
  } catch (error) {
    console.warn("Student Progress logout cleanup failed", error);
  }
  clearSession();
  try { await state.supabase?.auth.signOut(); } catch { /* Anonymous auth cleanup is best effort. */ }
  setStatus(elements.loginStatus, "");
  setConnection("已連線", "online");
  showView("login");
}

function openParentPasswordDialog() {
  if (!PARENT_MODE || !elements.passwordDialog || !state.authToken) return;
  elements.passwordForm?.reset();
  setStatus(elements.passwordStatus, "");
  elements.passwordDialog.showModal();
  window.setTimeout(() => elements.passwordCurrent?.focus(), 0);
}

async function changeParentPassword(event) {
  event.preventDefault();
  const currentPassword = elements.passwordCurrent?.value || "";
  const newPassword = elements.passwordNew?.value || "";
  const confirmation = elements.passwordConfirm?.value || "";
  if (newPassword.length < 8) {
    setStatus(elements.passwordStatus, "新密碼最少需要 8 個字元。", "error");
    return;
  }
  if (newPassword !== confirmation) {
    setStatus(elements.passwordStatus, "兩次輸入的新密碼不相同。", "error");
    return;
  }
  const submit = elements.passwordForm?.querySelector('[type="submit"]');
  if (submit) submit.disabled = true;
  setStatus(elements.passwordStatus, "正在安全更新密碼…");
  try {
    const rows = await parentRpc("parent_communication_change_password", {
      p_parent_token: state.authToken,
      p_current_password: currentPassword,
      p_new_password: newPassword
    });
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.parent_token) throw new Error("未能更新登入憑證。");
    state.authToken = String(row.parent_token);
    state.user = { ...state.user, name: String(row.name || state.user.name) };
    saveSession();
    elements.passwordDialog.close();
    showToast("密碼已更改；其他登入時段已安全登出。");
  } catch (error) {
    console.warn("Parent password change failed", error);
    setStatus(elements.passwordStatus, error.message || "未能更改密碼，請再試一次。", "error");
  } finally {
    if (submit) submit.disabled = false;
  }
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.passwordToggle.addEventListener("click", () => {
    const visible = elements.password.type === "text";
    elements.password.type = visible ? "password" : "text";
    elements.passwordToggle.textContent = visible ? "顯示" : "隱藏";
    elements.passwordToggle.setAttribute("aria-pressed", String(!visible));
    elements.passwordToggle.setAttribute("aria-label", visible ? "顯示密碼" : "隱藏密碼");
  });
  elements.logout.addEventListener("click", logout);
  elements.changePassword?.addEventListener("click", openParentPasswordDialog);
  elements.passwordForm?.addEventListener("submit", changeParentPassword);
  elements.passwordDialog?.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-password-close]");
    if (closeButton) elements.passwordDialog.close();
  });
  elements.refresh.addEventListener("click", () => loadSnapshot({ announce: true }));
  elements.rangeButtons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-range]");
    if (!button || !STUDENT_PROGRESS_RANGES.some((range) => range.id === button.dataset.range)) return;
    state.range = button.dataset.range;
    setStatus(elements.customRangeStatus, "");
    renderDashboard();
  });
  elements.customRangeForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const candidate = {
      id: "custom",
      start: elements.customRangeStart?.value || "",
      end: elements.customRangeEnd?.value || ""
    };
    try {
      resolveProgressRange(candidate, [], new Date());
      state.customRange = { start: candidate.start, end: candidate.end };
      state.range = "custom";
      setStatus(elements.customRangeStatus, "");
      renderDashboard();
    } catch {
      setStatus(elements.customRangeStatus, "請選擇有效日期；開始日期不可遲於結束日期，結束日期亦不可超過香港今天。", "error");
    }
  });
  const changeScheduleWeek = async (amount) => {
    const next = localDayKey(addLocalDays(state.scheduleWeekStart || currentHongKongWeekStart(), amount));
    if (next < SCHEDULE_FIRST_WEEK || next > SCHEDULE_LAST_WEEK) return;
    state.scheduleWeekStart = next;
    await loadScheduleWeek();
  };
  elements.schedulePrevious?.addEventListener("click", () => changeScheduleWeek(-7));
  elements.scheduleNext?.addEventListener("click", () => changeScheduleWeek(7));
  elements.scheduleCurrent?.addEventListener("click", async () => {
    state.scheduleWeekStart = currentHongKongWeekStart();
    await loadScheduleWeek();
  });
  elements.adminStudentSelect.addEventListener("change", async () => {
    state.selectedAdminStudentId = elements.adminStudentSelect.value;
    await loadSnapshot();
  });
}

async function checkHealth() {
  try {
    const response = await fetch(`${workerBaseUrl()}/v1/health`, { credentials: "omit" });
    if (!response.ok) throw new Error("Health unavailable");
    setConnection("已連線", "online");
  } catch {
    setConnection("服務連接中", "checking");
  }
}

async function initialise() {
  buildDashboardShell();
  bindEvents();
  checkHealth();
  const restored = await restoreSession();
  if (!restored) {
    showView("login");
    return;
  }
  setConnection("已安全連接", "online");
  await openDashboard();
}

initialise().catch((error) => {
  console.error("Student Progress initialisation failed", error);
  clearSession();
  setConnection("服務暫時離線", "error");
  setStatus(elements.loginStatus, "系統未能完成載入，請重新整理頁面。", "error");
  showView("login");
});
