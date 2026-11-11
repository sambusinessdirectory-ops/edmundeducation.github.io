(function initialiseHomepageStudentLogin() {
  "use strict";
  const trigger = document.querySelector("[data-homepage-student-login]");
  const access = document.querySelector("[data-homepage-student-access]");
  const greeting = document.querySelector("[data-homepage-student-greeting]");
  const logoutButton = document.querySelector("[data-homepage-student-logout]");
  const dialog = document.querySelector("[data-homepage-login-dialog]");
  const form = dialog?.querySelector("[data-homepage-login-form]");
  const status = dialog?.querySelector("[data-homepage-login-status]");
  const submit = dialog?.querySelector("[data-homepage-login-submit]");
  const password = dialog?.querySelector("[name=password]");
  const passwordToggle = dialog?.querySelector("[data-homepage-password-toggle]");
  let client = null;
  if (!trigger || !access || !greeting || !logoutButton || !dialog || !form || !status || !submit) return;
  function greetingWord() {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Hong_Kong", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const hour = Number(parts.find(part => part.type === "hour")?.value || 0);
    if (hour >= 5 && hour < 12) return "早晨";
    if (hour >= 12 && hour < 18) return "午安";
    return "晚安";
  }
  function renderSession() {
    const session = window.EdmundSystemNav?.getStudentSession?.();
    const loggedIn = Boolean(session?.role === "student" && session?.token && session?.name);
    trigger.hidden = loggedIn; greeting.hidden = !loggedIn; logoutButton.hidden = !loggedIn;
    if (loggedIn) greeting.textContent = `${greetingWord()}, ${session.name}!`;
    access.dataset.loggedIn = String(loggedIn);
  }
  function setStatus(message, state = "") { status.textContent = message; status.dataset.state = state; }
  function ensureClient() {
    if (client) return client;
    const configuration = window.EDMUND_SUPABASE || {};
    if (!window.supabase?.createClient || !configuration.url || !configuration.anonKey) throw new Error("登入服務暫時未能載入，請重新整理頁面。");
    client = window.supabase.createClient(configuration.url, configuration.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
    return client;
  }
  async function authenticated({ create = true } = {}) {
    const supabaseClient = ensureClient();
    let current = await supabaseClient.auth.getSession();
    if (current.error) throw current.error;
    if (!current.data?.session?.user?.id && create) {
      const signIn = await supabaseClient.auth.signInAnonymously();
      if (signIn.error) throw signIn.error;
      current = { data: { session: signIn.data?.session || null } };
    }
    return { client: supabaseClient, session: current.data?.session || null };
  }
  async function restore() {
    try {
      const auth = await authenticated({ create: false });
      if (!auth.session?.user?.id) return;
      const { data, error } = await auth.client.rpc("homepage_student_resume");
      if (error) throw error;
      const student = Array.isArray(data) ? data[0] : null;
      if (student?.session_token && student?.name) window.EdmundSystemNav?.rememberStudentSession?.({ token: student.session_token, id: student.id, name: student.name, role: "student", access: student.access });
    } catch (error) { console.warn("Homepage student session restore failed", error); }
    finally { renderSession(); }
  }
  trigger.addEventListener("click", () => { form.reset(); setStatus(""); password.type = "password"; passwordToggle.textContent = "顯示"; dialog.showModal(); setTimeout(() => form.elements.username.focus(), 0); });
  dialog.querySelector("[data-homepage-login-cancel]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  passwordToggle.addEventListener("click", () => { const show = password.type === "password"; password.type = show ? "text" : "password"; passwordToggle.textContent = show ? "隱藏" : "顯示"; password.focus(); });
  form.addEventListener("submit", async event => {
    event.preventDefault(); const username = String(form.elements.username.value || "").trim(); const passwordValue = String(form.elements.password.value || "");
    if (!username || !passwordValue) { setStatus("請輸入學生名稱及密碼。", "error"); return; }
    submit.disabled = true; setStatus("正在核對學生帳戶…");
    try {
      const auth = await authenticated();
      const { data, error } = await auth.client.rpc("homepage_student_login", { p_name: username, p_password: passwordValue });
      if (error) throw error;
      const student = Array.isArray(data) ? data[0] : null;
      if (!student?.session_token || !student?.name) throw new Error("學生名稱或密碼不正確。");
      if (!window.EdmundSystemNav?.rememberStudentSession?.({ token: student.session_token, id: student.id, name: student.name, role: "student", access: student.access })) throw new Error("瀏覽器未能儲存登入，請檢查私隱設定後再試。");
      form.reset(); dialog.close(); renderSession();
    } catch (error) { console.warn("Homepage student login failed", error); setStatus(/password|credentials|學生名稱/i.test(String(error?.message || "")) ? "學生名稱或密碼不正確。" : String(error?.message || "登入失敗，請稍後再試。"), "error"); }
    finally { submit.disabled = false; }
  });
  logoutButton.addEventListener("click", async () => {
    try { const auth = await authenticated({ create: false }); if (auth.session?.user?.id) await auth.client.rpc("homepage_student_forget_device"); await auth.client.auth.signOut({ scope: "local" }); }
    catch (error) { console.warn("Homepage device logout failed", error); }
    finally { window.EdmundSystemNav?.forgetStudentSession?.(); renderSession(); }
  });
  window.addEventListener("edmund-student-session-change", renderSession);
  renderSession(); void restore(); setInterval(renderSession, 60000);
})();
