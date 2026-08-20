import {
  SELF_EVALUATION_DEFINITIONS,
  selfEvaluationDefinition,
  selfEvaluationRatingsCsv
} from "./schedule-wellbeing.mjs?v=20260820-gradient-labels1";

const SESSION_KEY = "edmund-schedule-session-v1";
const PAGE_SIZE = 100;
const settings = window.EDMUND_SUPABASE || {};
const client = window.supabase?.createClient && settings.url && settings.anonKey
  ? window.supabase.createClient(settings.url, settings.anonKey)
  : null;
const elements = {
  gate: document.querySelector("[data-auth-gate]"),
  gateMessage: document.querySelector("[data-gate-message]"),
  report: document.querySelector("[data-report]"),
  form: document.querySelector("[data-filter-form]"),
  metricSelector: document.querySelector("[data-metric-selector]"),
  reportEyebrow: document.querySelector("[data-report-eyebrow]"),
  reportTitle: document.querySelector("[data-report-title]"),
  reportDescription: document.querySelector("[data-report-description]"),
  ratingHeading: document.querySelector("[data-rating-heading]"),
  status: document.querySelector("[data-status]"),
  results: document.querySelector("[data-results]"),
  empty: document.querySelector("[data-empty]"),
  previous: document.querySelector("[data-previous]"),
  next: document.querySelector("[data-next]"),
  pageLabel: document.querySelector("[data-page-label]"),
  exportCsv: document.querySelector("[data-export-csv]")
};
const state = {
  adminToken: "",
  page: 1,
  total: 0,
  rows: [],
  loading: false,
  committedFilters: null
};
let authPromise = null;

const METRIC_KEYS = new Set(SELF_EVALUATION_DEFINITIONS.map((definition) => definition.key));

function readAdminSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    return saved?.role === "admin" && saved?.adminToken ? saved : null;
  } catch {
    return null;
  }
}

async function ensureSupabaseAuth() {
  if (!client) throw new Error("管理員資料服務暫時未能載入。");
  if (!authPromise) {
    authPromise = (async () => {
      const current = await client.auth.getSession();
      if (current.error) throw current.error;
      if (current.data?.session?.user?.id) return current.data.session;
      const signIn = await client.auth.signInAnonymously();
      if (signIn.error) throw signIn.error;
      if (!signIn.data?.session?.user?.id) throw new Error("未能建立安全連線。");
      return signIn.data.session;
    })().catch((error) => { authPromise = null; throw error; });
  }
  return authPromise;
}

async function rpc(name, args) {
  await ensureSupabaseAuth();
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data;
}

function isoDate(date) {
  const year = date.getFullYear();
  return `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateDefaults() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  elements.form.elements.dateFrom.value = isoDate(from < new Date(2026, 0, 1) ? new Date(2026, 0, 1) : from);
  elements.form.elements.dateTo.value = isoDate(to);
}

function readFilters() {
  const requestedMetric = elements.form.elements.metric.value;
  return {
    p_metric: METRIC_KEYS.has(requestedMetric) ? requestedMetric : "motivation",
    p_date_from: elements.form.elements.dateFrom.value,
    p_date_to: elements.form.elements.dateTo.value,
    p_student_query: elements.form.elements.studentQuery.value.trim()
  };
}

function currentDefinition() {
  const filters = state.committedFilters || readFilters();
  return selfEvaluationDefinition(filters.p_metric) || selfEvaluationDefinition("motivation");
}

function applyMetricPresentation(metric) {
  const definition = selfEvaluationDefinition(metric) || selfEvaluationDefinition("motivation");
  document.body.dataset.selfEvaluationMetric = definition.key;
  elements.metricSelector.value = definition.key;
  elements.reportEyebrow.textContent = `DAILY ${definition.key.replaceAll("-", " ").toUpperCase()} RECORDS`;
  elements.reportTitle.textContent = `${definition.label}結果`;
  elements.reportDescription.textContent = `按學生名稱及日期範圍搜尋每天的${definition.shortLabel}自評紀錄，並可匯出目前篩選結果。`;
  elements.ratingHeading.textContent = definition.label;
  elements.empty.textContent = `此篩選範圍未有${definition.shortLabel}紀錄。`;
  document.title = `${definition.label}結果 | EdmundEducation`;
}

function committedRpcFilters() {
  return {
    p_admin_token: state.adminToken,
    ...(state.committedFilters || readFilters())
  };
}

function setStatus(message, error = false) {
  elements.status.textContent = message;
  elements.status.dataset.state = error ? "error" : "";
}

function displayDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[1]} 年 ${Number(match[2])} 月 ${Number(match[3])} 日` : value || "—";
}

function displayTimestamp(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("zh-HK", { timeZone: "Asia/Hong_Kong", hour12: false });
}

function render() {
  elements.results.replaceChildren();
  for (const row of state.rows) {
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = row.student_name || "—";
    const date = document.createElement("td");
    date.textContent = displayDate(row.schedule_date);
    const ratingCell = document.createElement("td");
    const rating = document.createElement("span");
    rating.className = "rating";
    rating.textContent = String(row.rating);
    ratingCell.append(rating);
    const updated = document.createElement("td");
    updated.textContent = displayTimestamp(row.updated_at);
    tr.append(name, date, ratingCell, updated);
    elements.results.append(tr);
  }
  elements.empty.hidden = state.rows.length > 0;
  const pageCount = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
  elements.pageLabel.textContent = `第 ${state.page} / ${pageCount} 頁 · 共 ${state.total} 項`;
  elements.previous.disabled = state.loading || state.page <= 1;
  elements.next.disabled = state.loading || state.page >= pageCount;
  elements.exportCsv.disabled = state.loading || state.total === 0;
  elements.metricSelector.disabled = state.loading;
}

async function loadPage(page = 1) {
  if (state.loading) return;
  state.loading = true;
  state.page = Math.max(1, page);
  setStatus("正在載入紀錄…");
  render();
  try {
    const rows = await rpc("schedule_admin_list_self_evaluation_ratings", {
      ...committedRpcFilters(), p_limit: PAGE_SIZE, p_offset: (state.page - 1) * PAGE_SIZE
    });
    state.rows = Array.isArray(rows) ? rows : [];
    state.total = Number(state.rows[0]?.total_count) || 0;
    const definition = currentDefinition();
    setStatus(state.total
      ? `已載入 ${state.total} 項符合的${definition.shortLabel}紀錄。`
      : `未有符合的${definition.shortLabel}紀錄。`);
  } catch (error) {
    state.rows = [];
    state.total = 0;
    setStatus(error.message || "未能載入紀錄。", true);
  } finally {
    state.loading = false;
    render();
  }
}

async function exportCsv() {
  if (state.loading || !state.total) return;
  state.loading = true;
  setStatus("正在準備完整 CSV…");
  render();
  try {
    const allRows = [];
    for (let offset = 0; offset < state.total; offset += 1000) {
      const rows = await rpc("schedule_admin_list_self_evaluation_ratings", {
        ...committedRpcFilters(), p_limit: 1000, p_offset: offset
      });
      if (!Array.isArray(rows) || !rows.length) break;
      allRows.push(...rows);
    }
    const blob = new Blob([selfEvaluationRatingsCsv(allRows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const exportFilters = state.committedFilters || readFilters();
    link.download = `daily-self-evaluation-${exportFilters.p_metric}-${exportFilters.p_date_from}-${exportFilters.p_date_to}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus(`已匯出 ${allRows.length} 項紀錄。`);
  } catch (error) {
    setStatus(error.message || "未能匯出 CSV。", true);
  } finally {
    state.loading = false;
    render();
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  state.committedFilters = readFilters();
  applyMetricPresentation(state.committedFilters.p_metric);
  loadPage(1);
});
elements.metricSelector.addEventListener("change", () => {
  state.committedFilters = readFilters();
  applyMetricPresentation(state.committedFilters.p_metric);
  loadPage(1);
});
elements.previous.addEventListener("click", () => loadPage(state.page - 1));
elements.next.addEventListener("click", () => loadPage(state.page + 1));
elements.exportCsv.addEventListener("click", exportCsv);

async function initialise() {
  dateDefaults();
  applyMetricPresentation(elements.metricSelector.value);
  const session = readAdminSession();
  if (!session) {
    elements.gateMessage.innerHTML = '請先以管理員身分登入<a href="schedule-system.html">功課系統</a>。';
    return;
  }
  try {
    const rows = await rpc("schedule_admin_me", { p_admin_token: session.adminToken });
    if (!Array.isArray(rows) || !rows.length) throw new Error("管理員登入已失效。");
    state.adminToken = session.adminToken;
    state.committedFilters = readFilters();
    elements.gate.hidden = true;
    elements.report.hidden = false;
    await loadPage(1);
  } catch (error) {
    elements.gateMessage.textContent = `${error.message || "管理員登入已失效。"} 請返回功課系統重新登入。`;
  }
}

initialise();
