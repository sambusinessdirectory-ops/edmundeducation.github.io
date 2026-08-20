const SESSION_KEY = "edmund-schedule-session-v1";
const PAGE_SIZE = 100;
const settings = window.EDMUND_SUPABASE || {};
const client = window.supabase?.createClient && settings.url && settings.anonKey
  ? window.supabase.createClient(settings.url, settings.anonKey)
  : null;
const elements = {
  gate: document.querySelector("[data-auth-gate]"),
  gateMessage: document.querySelector("[data-gate-message]"),
  directory: document.querySelector("[data-directory]"),
  form: document.querySelector("[data-filter-form]"),
  status: document.querySelector("[data-status]"),
  results: document.querySelector("[data-results]"),
  empty: document.querySelector("[data-empty]"),
  previous: document.querySelector("[data-previous]"),
  next: document.querySelector("[data-next]"),
  pageLabel: document.querySelector("[data-page-label]")
};
const state = { adminToken:"", page:1, total:0, rows:[], query:"", loading:false };
let authPromise = null;

function readAdminSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    return saved?.role === "admin" && saved?.adminToken ? saved : null;
  } catch { return null; }
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

async function rpc(name,args) {
  await ensureSupabaseAuth();
  const { data,error } = await client.rpc(name,args);
  if (error) throw error;
  return data;
}

function setStatus(message,error=false) {
  elements.status.textContent = message;
  elements.status.dataset.state = error ? "error" : "";
}

function displayTimestamp(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("zh-HK", { timeZone:"Asia/Hong_Kong", hour12:false });
}

function render() {
  elements.results.replaceChildren();
  for (const row of state.rows) {
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = row.student_name || "—";
    const email = document.createElement("td");
    email.className = row.email ? "email" : "not-provided";
    email.textContent = row.email || "尚未提供";
    const updated = document.createElement("td");
    updated.textContent = displayTimestamp(row.updated_at);
    tr.append(name,email,updated);
    elements.results.append(tr);
  }
  elements.empty.hidden = state.rows.length > 0;
  const pages = Math.max(1,Math.ceil(state.total / PAGE_SIZE));
  elements.pageLabel.textContent = `第 ${state.page} / ${pages} 頁 · 共 ${state.total} 個帳戶`;
  elements.previous.disabled = state.loading || state.page <= 1;
  elements.next.disabled = state.loading || state.page >= pages;
}

async function loadPage(page=1) {
  if (state.loading) return;
  state.loading = true;
  state.page = Math.max(1,page);
  setStatus("正在安全地載入學生目錄…");
  render();
  try {
    const rows = await rpc("schedule_admin_list_reminder_emails", {
      p_admin_token:state.adminToken,
      p_student_query:state.query,
      p_limit:PAGE_SIZE,
      p_offset:(state.page - 1) * PAGE_SIZE
    });
    state.rows = Array.isArray(rows) ? rows : [];
    state.total = Number(state.rows[0]?.total_count) || 0;
    setStatus(state.total ? `已載入 ${state.total} 個學生帳戶。` : "未有符合的學生帳戶。");
  } catch (error) {
    state.rows = [];
    state.total = 0;
    setStatus(error.message || "未能載入提醒電郵目錄。",true);
  } finally {
    state.loading = false;
    render();
  }
}

elements.form.addEventListener("submit",(event) => {
  event.preventDefault();
  state.query = String(elements.form.elements.studentQuery.value || "").trim();
  loadPage(1);
});
elements.previous.addEventListener("click",() => loadPage(state.page - 1));
elements.next.addEventListener("click",() => loadPage(state.page + 1));

async function initialise() {
  const session = readAdminSession();
  if (!session) {
    elements.gateMessage.textContent = "請先在功課系統以管理員身分登入。";
    return;
  }
  try {
    const valid = await rpc("schedule_admin_me", { p_admin_token:session.adminToken });
    if (!Array.isArray(valid) || !valid[0]?.name) throw new Error("管理員登入已失效。");
    state.adminToken = session.adminToken;
    elements.gate.hidden = true;
    elements.directory.hidden = false;
    await loadPage(1);
  } catch (error) {
    elements.gateMessage.textContent = error.message || "未能驗證管理員登入。";
  }
}

initialise();
