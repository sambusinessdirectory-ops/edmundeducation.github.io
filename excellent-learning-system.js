(function initialiseExcellentLearningSystem() {
  "use strict";
  const CONFIG = window.EDMUND_SUPABASE || {};
  const SESSION_KEY = "edmund-excellent-learning-session-v1";
  const login = document.querySelector('[data-view="login"]');
  const content = document.querySelector('[data-view="content"]');
  const form = document.querySelector('[data-login-form]');
  const status = document.querySelector('[data-login-status]');
  const actions = document.querySelector('[data-account-actions]');
  const accountName = document.querySelector('[data-account-name]');
  let client;
  let session;

  function supabaseClient() {
    if (client) return client;
    if (!window.supabase?.createClient || !CONFIG.url || !CONFIG.anonKey) throw new Error("登入服務暫時未能載入。");
    client = window.supabase.createClient(CONFIG.url, CONFIG.anonKey, { auth:{ persistSession:true, storage:sessionStorage, autoRefreshToken:true, detectSessionInUrl:false } });
    return client;
  }
  async function rpc(name, args) {
    const api = supabaseClient();
    const current = await api.auth.getSession();
    if (!current.data?.session) { const anonymous = await api.auth.signInAnonymously(); if (anonymous.error) throw anonymous.error; }
    const result = await api.rpc(name, args);
    if (result.error) throw result.error;
    return result.data;
  }
  function remember(value) {
    session = value;
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(value)); } catch {}
    window.EdmundSystemNav?.rememberStudentSession?.(value);
  }
  async function validate(token) {
    const rows = await rpc("flashcard_student_session_profile", { p_token:token });
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.id || !row?.session_token) return false;
    remember({ token:String(row.session_token), id:String(row.id), name:String(row.name || "Student"), role:"student" });
    return true;
  }
  function showContent() {
    login.hidden = true; content.hidden = false; actions.hidden = false; accountName.textContent = `${session.name} · 學生`;
  }
  function clear() {
    session = null; try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    login.hidden = false; content.hidden = true; actions.hidden = true; form.reset(); status.textContent = "";
  }
  form.addEventListener("submit", async event => {
    event.preventDefault(); status.textContent = "正在登入…";
    const data = new FormData(form);
    try {
      const rows = await rpc("flashcard_student_login", { p_name:String(data.get("username") || "").trim(), p_password:String(data.get("password") || "") });
      const row = Array.isArray(rows) ? rows[0] : null;
      if (!row?.session_token || !await validate(String(row.session_token))) throw new Error("用戶名稱或密碼不正確。");
      showContent();
    } catch (error) { status.textContent = error.message || "未能登入。"; }
  });
  document.querySelector('[data-logout]').addEventListener("click", clear);

  (async () => {
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch {}
    saved ||= window.EdmundSystemNav?.bridgeStudentSession?.() || window.EdmundSystemNav?.getStudentSession?.();
    try { if (saved?.token && await validate(saved.token)) return showContent(); } catch {}
    clear();
  })();
})();
