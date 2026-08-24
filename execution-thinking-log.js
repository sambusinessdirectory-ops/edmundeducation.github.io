(function initialiseExecutionThinkingLog() {
  "use strict";
  const config = window.EDMUND_EXECUTION_CONFIG;
  const sourceTables = Array.isArray(window.EDMUND_EXECUTION_TABLES) ? window.EDMUND_EXECUTION_TABLES : [];
  const questions = sourceTables.find((table) => table.id === "before-each-item")?.groups.flatMap((group) => group.rows) || [];
  const settings = window.EDMUND_SUPABASE;
  const client = window.supabase?.createClient?.(settings?.url, settings?.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
  if (!config || !client || questions.length !== 27) return;
  const $ = (selector) => document.querySelector(selector);
  const elements = { loading: $("[data-loading]"), app: $("[data-thinking-app]"), connection: $("[data-connection-status]"), user: $("[data-user-pill]"), from: $("[data-from-date]"), to: $("[data-to-date]"), load: $("[data-load-log]"), total: $("[data-total-time]"), sessions: $("[data-session-total]"), tasks: $("[data-task-total]"), top: $("[data-top-question]"), topCopy: $("[data-top-question-copy]"), bars: $("[data-question-bars]"), log: $("[data-session-log]"), status: $("[data-status]") };
  const state = { role: "", token: "", user: null };
  function localDate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
  function shiftDays(value, amount) { const [y, m, d] = value.split("-").map(Number); const date = new Date(y, m - 1, d + amount); return localDate(date); }
  function formatDuration(seconds) { const n = Math.max(0, Math.floor(Number(seconds) || 0)); return `${String(Math.floor(n / 3600)).padStart(2, "0")}:${String(Math.floor(n % 3600 / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`; }
  async function ensureAuth() { const { data } = await client.auth.getSession(); if (data?.session) return; const { error } = await client.auth.signInAnonymously(); if (error) throw error; }
  async function rpc(name, params) { await ensureAuth(); const { data, error } = await client.rpc(name, params); if (error) throw error; return data; }
  function readSession() { try { return JSON.parse(sessionStorage.getItem(config.sessionKey) || "null"); } catch { return null; } }
  async function validateSession() {
    const own = readSession(); const universal = window.EdmundSystemNav?.getStudentSession?.();
    if (own?.role === "admin" && own.token) { const rows = await rpc(config.adminMeRpc, { p_admin_token: String(own.token) }); const row = Array.isArray(rows) ? rows[0] : null; if (row?.id) { state.role = "admin"; state.token = String(own.token); state.user = row; return true; } }
    const candidate = universal?.role === "student" ? universal : own?.role === "student" ? own : null;
    if (candidate?.token) { const rows = await rpc(config.studentProfileRpc, { p_token: String(candidate.token) }); const row = Array.isArray(rows) ? rows[0] : null; if (row?.id && row?.session_token) { state.role = "student"; state.token = String(row.session_token); state.user = row; return true; } }
    return false;
  }
  function authParams() { return state.role === "admin" ? { p_student_token: null, p_admin_token: state.token } : { p_student_token: state.token, p_admin_token: null }; }
  function render(rows) {
    const totals = Array.from({ length: 27 }, () => 0); const taskIds = new Set(); let total = 0;
    rows.forEach((row) => { const elapsed = Math.max(0, Number(row.elapsed_seconds) || 0); total += elapsed; taskIds.add(row.task_id); if (row.question_number >= 1 && row.question_number <= 27) totals[row.question_number - 1] += elapsed; });
    elements.total.textContent = formatDuration(total); elements.sessions.textContent = String(rows.length); elements.tasks.textContent = String(taskIds.size);
    const max = Math.max(1, ...totals); const topIndex = totals.indexOf(Math.max(...totals));
    elements.top.textContent = total ? `Q${topIndex + 1}` : "—"; elements.topCopy.textContent = total ? questions[topIndex].text : "尚未有紀錄";
    elements.bars.replaceChildren();
    totals.forEach((seconds, index) => { const item = document.createElement("article"); item.className = "question-bar"; const number = document.createElement("b"); number.textContent = String(index + 1); const copy = document.createElement("div"); copy.className = "question-bar-copy"; const title = document.createElement("strong"); title.textContent = questions[index].text; title.title = questions[index].text; const track = document.createElement("div"); track.className = "bar-track"; const fill = document.createElement("i"); fill.style.width = `${seconds / max * 100}%`; track.append(fill); copy.append(title, track); const time = document.createElement("span"); time.textContent = formatDuration(seconds); item.append(number, copy, time); elements.bars.append(item); });
    elements.log.replaceChildren();
    if (!rows.length) { const empty = document.createElement("p"); empty.className = "empty-log"; empty.textContent = "所選日期內暫時沒有思考時間紀錄。"; elements.log.append(empty); return; }
    rows.forEach((row) => { const item = document.createElement("a"); item.className = "session-item"; item.href = `execution-task-planner.html?date=${encodeURIComponent(row.task_date)}&task=${encodeURIComponent(row.task_id)}`; const number = document.createElement("b"); number.textContent = `Q${row.question_number}`; const copy = document.createElement("div"); const title = document.createElement("strong"); title.textContent = row.task_title; const meta = document.createElement("small"); meta.textContent = `${row.task_date} · Task ${row.slot_number} · ${new Intl.DateTimeFormat("zh-HK", { dateStyle: "short", timeStyle: "medium" }).format(new Date(row.ended_at))}`; copy.append(title, meta); const time = document.createElement("span"); time.textContent = formatDuration(row.elapsed_seconds); item.append(number, copy, time); elements.log.append(item); });
  }
  async function loadLog() {
    elements.load.disabled = true; elements.status.hidden = true;
    try { const rows = await rpc(config.plannerThinkingLogsRpc, { p_from_date: elements.from.value, p_to_date: elements.to.value, ...authParams() }); render(Array.isArray(rows) ? rows : []); elements.connection.textContent = "已安全連接"; elements.connection.dataset.state = "online"; }
    catch (error) { elements.connection.textContent = "連線失敗"; elements.connection.dataset.state = "error"; elements.status.textContent = error?.message || "未能載入思考時間紀錄。"; elements.status.hidden = false; }
    finally { elements.load.disabled = false; }
  }
  elements.load.addEventListener("click", loadLog);
  (async () => { try { await ensureAuth(); if (!await validateSession()) { location.replace("execution-system.html"); return; } const today = localDate(new Date()); elements.to.value = today; elements.from.value = shiftDays(today, -29); elements.user.hidden = false; elements.user.textContent = state.role === "admin" ? `${state.user.name} · 管理員` : state.user.name; elements.loading.hidden = true; elements.app.hidden = false; await loadLog(); } catch { elements.connection.textContent = "連線失敗"; elements.connection.dataset.state = "error"; elements.loading.querySelector("h1").textContent = "暫時未能開啟思考時間紀錄"; elements.loading.querySelector("p").textContent = "請返回執行動力系統重新登入後再試。"; } })();
})();
