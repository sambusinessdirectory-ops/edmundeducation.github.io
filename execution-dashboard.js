(function initialiseExecutionDashboard() {
  "use strict";

  const config = window.EDMUND_EXECUTION_CONFIG;
  const tables = Array.isArray(window.EDMUND_EXECUTION_TABLES) ? window.EDMUND_EXECUTION_TABLES : [];
  const settings = window.EDMUND_SUPABASE;
  const client = window.supabase?.createClient?.(settings?.url, settings?.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
  if (!config || !client) return;
  const $ = (selector) => document.querySelector(selector);
  const elements = {
    loading: $("[data-loading]"), dashboard: $("[data-dashboard]"), connection: $("[data-connection-status]"), user: $("[data-user-pill]"),
    all: $("[data-all-total]"), week: $("[data-week-total]"), month: $("[data-month-total]"), year: $("[data-year-total]"),
    average: $("[data-average-time]"), median: $("[data-median-time]"), rating: $("[data-average-rating]"), completed: $("[data-completed-total]"), chart: $("[data-task-chart]"),
    periods: $("[data-period-controls]"), tools: $("[data-tool-ranking]"), steps: $("[data-step-ranking]"), status: $("[data-status]"),
    completedMonth: $("[data-completed-month]"), completedLog: $("[data-completed-log]"),
    previousMonth: $("[data-previous-month]"), nextMonth: $("[data-next-month]")
  };
  const state = { role: "", token: "", user: null, period: "week", reference: today(), completedMonth: `${today().slice(0, 7)}-01` };

  function today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }
  async function ensureAuth() {
    const { data } = await client.auth.getSession();
    if (data?.session) return;
    const { error } = await client.auth.signInAnonymously();
    if (error) throw error;
  }
  async function rpc(name, params) {
    await ensureAuth();
    const { data, error } = await client.rpc(name, params);
    if (error) throw error;
    return data;
  }
  function readSession() {
    try { return JSON.parse(sessionStorage.getItem(config.sessionKey) || "null"); }
    catch { return null; }
  }
  async function validateSession() {
    const own = readSession();
    const universal = window.EdmundSystemNav?.getStudentSession?.();
    if (own?.role === "admin" && own.token) {
      const rows = await rpc(config.adminMeRpc, { p_admin_token: String(own.token) });
      const row = Array.isArray(rows) ? rows[0] : null;
      if (row?.id) { state.role = "admin"; state.token = String(own.token); state.user = row; return true; }
    }
    const candidate = universal?.role === "student" ? universal : own?.role === "student" ? own : null;
    if (candidate?.token) {
      const rows = await rpc(config.studentProfileRpc, { p_token: String(candidate.token) });
      const row = Array.isArray(rows) ? rows[0] : null;
      if (row?.id && row?.session_token) { state.role = "student"; state.token = String(row.session_token); state.user = row; return true; }
    }
    return false;
  }
  function authParams() {
    return state.role === "admin" ? { p_student_token: null, p_admin_token: state.token } : { p_student_token: state.token, p_admin_token: null };
  }
  function formatDuration(seconds) {
    const value = Math.max(0, Math.round(Number(seconds) || 0));
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const remainder = value % 60;
    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}` : `${minutes}:${String(remainder).padStart(2, "0")}`;
  }
  function shiftMonth(value, amount) {
    const [year, month] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1 + amount, 1));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
  }
  function formatMonth(value) {
    const [year, month] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("zh-HK", { year: "numeric", month: "long" }).format(new Date(Date.UTC(year, month - 1, 1, 12)));
  }
  function tableById(id) { return tables.find((table) => table.id === id); }
  function stepCopy(tableId, index) {
    const table = tableById(tableId);
    const row = table?.groups.flatMap((group) => group.rows)[Number(index)];
    return { table: table?.title || tableId, step: row?.text || `Step ${Number(index) + 1}` };
  }
  function renderRanking(container, rows, type) {
    container.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement("li"); empty.className = "ranking-empty"; empty.textContent = "暫時未有「我做到了」紀錄。"; container.append(empty); return;
    }
    rows.forEach((row) => {
      const copy = type === "table" ? { table: tableById(row.table_id)?.title || row.table_id, step: "工具累積完成次數" } : stepCopy(row.table_id, row.step_index);
      const item = document.createElement("li");
      const text = document.createElement("div");
      const title = document.createElement("strong"); title.textContent = type === "table" ? copy.table : copy.step;
      const meta = document.createElement("small"); meta.textContent = type === "table" ? copy.step : copy.table;
      const count = document.createElement("b"); count.textContent = String(type === "table" ? row.total : row.count);
      text.append(title, meta); item.append(text, count); container.append(item);
    });
  }
  function svgNode(name, attributes = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }
  function renderChart(series) {
    elements.chart.replaceChildren();
    const defs = svgNode("defs");
    const gradient = svgNode("linearGradient", { id: "barGradient", x1: "0", y1: "1", x2: "0", y2: "0" });
    gradient.append(svgNode("stop", { offset: "0%", "stop-color": "#32256f" }), svgNode("stop", { offset: "100%", "stop-color": "#e8b24b" })); defs.append(gradient); elements.chart.append(defs);
    const left = 62, top = 24, width = 805, height = 270;
    const max = Math.max(1, ...series.map((item) => Number(item.value) || 0));
    for (let line = 0; line <= 4; line += 1) {
      const y = top + height - (height * line / 4);
      elements.chart.append(svgNode("line", { x1: left, y1: y, x2: left + width, y2: y, class: "chart-grid" }));
      const label = svgNode("text", { x: left - 12, y: y + 4, "text-anchor": "end", class: "chart-label" }); label.textContent = String(Math.round(max * line / 4)); elements.chart.append(label);
    }
    elements.chart.append(svgNode("line", { x1: left, y1: top, x2: left, y2: top + height, class: "chart-axis" }), svgNode("line", { x1: left, y1: top + height, x2: left + width, y2: top + height, class: "chart-axis" }));
    const gap = width / Math.max(1, series.length);
    const barWidth = Math.max(5, Math.min(52, gap * .62));
    series.forEach((item, index) => {
      const value = Number(item.value) || 0;
      const barHeight = height * value / max;
      const x = left + gap * index + (gap - barWidth) / 2;
      const y = top + height - barHeight;
      elements.chart.append(svgNode("rect", { x, y, width: barWidth, height: Math.max(1, barHeight), rx: Math.min(7, barWidth / 4), class: "chart-bar" }));
      if (value) { const number = svgNode("text", { x: x + barWidth / 2, y: y - 7, "text-anchor": "middle", class: "chart-value" }); number.textContent = String(value); elements.chart.append(number); }
      if (series.length <= 16 || index % Math.ceil(series.length / 12) === 0) { const label = svgNode("text", { x: x + barWidth / 2, y: top + height + 24, "text-anchor": "middle", class: "chart-label" }); label.textContent = item.label; elements.chart.append(label); }
    });
  }
  async function loadAnalytics() {
    elements.status.hidden = true;
    try {
      const data = await rpc(config.plannerAnalyticsRpc, { p_period: state.period, p_reference_date: state.reference, ...authParams() });
      const summary = data?.summary || {};
      elements.all.textContent = String(summary.total_tasks || 0);
      elements.week.textContent = String(summary.week_tasks || 0);
      elements.month.textContent = String(summary.month_tasks || 0);
      elements.year.textContent = String(summary.year_tasks || 0);
      elements.average.textContent = formatDuration(summary.average_seconds);
      elements.median.textContent = formatDuration(summary.median_seconds);
      elements.rating.textContent = Number(summary.average_rating) ? `${Number(summary.average_rating).toFixed(2)} ★` : "—";
      elements.completed.textContent = String(summary.completed_tasks || 0);
      renderChart(Array.isArray(data?.series) ? data.series : []);
      renderRanking(elements.tools, Array.isArray(data?.achievement_tables) ? data.achievement_tables : [], "table");
      renderRanking(elements.steps, Array.isArray(data?.achievement_steps) ? data.achievement_steps : [], "step");
      elements.connection.textContent = "已安全連接"; elements.connection.dataset.state = "online";
    } catch (error) {
      elements.connection.textContent = "連線失敗"; elements.connection.dataset.state = "error";
      elements.status.textContent = error?.message || "未能載入執行數據。"; elements.status.hidden = false;
    }
  }
  function renderCompleted(rows) {
    elements.completedLog.replaceChildren();
    elements.completedMonth.textContent = formatMonth(state.completedMonth);
    elements.nextMonth.disabled = state.completedMonth >= `${today().slice(0, 7)}-01`;
    if (!rows.length) {
      const empty = document.createElement("p");
      empty.className = "completed-empty";
      empty.textContent = "這個月份暫時沒有完成工作。";
      elements.completedLog.append(empty);
      return;
    }
    rows.forEach((row) => {
      const item = document.createElement("a");
      item.className = "completed-item";
      item.href = `execution-task-planner.html?date=${encodeURIComponent(row.task_date)}&task=${encodeURIComponent(row.id)}`;
      const date = document.createElement("time");
      date.textContent = new Intl.DateTimeFormat("zh-HK", { month: "2-digit", day: "2-digit" }).format(new Date(`${row.task_date}T12:00:00+08:00`));
      const copy = document.createElement("div");
      const title = document.createElement("strong"); title.textContent = row.title;
      const meta = document.createElement("small");
      meta.textContent = `Task ${row.slot_number} · 撰寫 ${formatDuration(row.writing_elapsed_seconds)} · 思考 ${formatDuration(row.thinking_elapsed_seconds)} · ${row.difficulty_rating ? `${row.difficulty_rating} 星` : "未評難度"}`;
      const arrow = document.createElement("span"); arrow.textContent = "↗";
      copy.append(title, meta); item.append(date, copy, arrow); elements.completedLog.append(item);
    });
  }
  async function loadCompleted() {
    try {
      const rows = await rpc(config.plannerCompletedTasksRpc, { p_month: state.completedMonth, ...authParams() });
      renderCompleted(Array.isArray(rows) ? rows : []);
    } catch (error) {
      elements.status.textContent = error?.message || "未能載入完成工作紀錄。";
      elements.status.hidden = false;
    }
  }
  elements.periods.addEventListener("click", (event) => {
    const button = event.target.closest("[data-period]");
    if (!button || button.dataset.period === state.period) return;
    state.period = button.dataset.period;
    elements.periods.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    loadAnalytics();
  });
  elements.previousMonth.addEventListener("click", () => { state.completedMonth = shiftMonth(state.completedMonth, -1); loadCompleted(); });
  elements.nextMonth.addEventListener("click", () => { state.completedMonth = shiftMonth(state.completedMonth, 1); loadCompleted(); });
  (async () => {
    try {
      await ensureAuth();
      if (!await validateSession()) { location.replace("execution-system.html"); return; }
      elements.user.hidden = false; elements.user.textContent = state.role === "admin" ? `${state.user.name} · 管理員` : state.user.name;
      elements.loading.hidden = true; elements.dashboard.hidden = false;
      await Promise.all([loadAnalytics(), loadCompleted()]);
    } catch (error) {
      elements.connection.textContent = "連線失敗"; elements.connection.dataset.state = "error";
      elements.loading.querySelector("h1").textContent = "暫時未能開啟數據儀表板";
      elements.loading.querySelector("p").textContent = "請返回執行動力系統重新登入後再試。";
    }
  })();
})();
