(function initialiseExecutionSystem() {
  "use strict";

  const config = window.EDMUND_EXECUTION_CONFIG;
  const tables = Array.isArray(window.EDMUND_EXECUTION_TABLES) ? window.EDMUND_EXECUTION_TABLES : [];
  const supabaseSettings = window.EDMUND_SUPABASE;
  const client = window.supabase?.createClient?.(supabaseSettings?.url, supabaseSettings?.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
  if (!config || !client || tables.length !== 8) return;

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    loginView: $("[data-login-view]"), appView: $("[data-app-view]"), loginForm: $("[data-login-form]"),
    loginButton: $("[data-login-button]"), loginError: $("[data-login-error]"), nameLabel: $("[data-name-label]"),
    roleTabs: [...document.querySelectorAll("[data-role-tab]")], connection: $("[data-connection-status]"),
    userPill: $("[data-user-pill]"), logout: $("[data-logout]"), selector: $("[data-table-selector]"),
    toolNumber: $("[data-tool-number]"), toolTitle: $("[data-tool-title]"), toolSubtitle: $("[data-tool-subtitle]"),
    checklist: $("[data-checklist]"), progressCopy: $("[data-progress-copy]"), progressPercent: $("[data-progress-percent]"),
    progressTrack: $("[data-progress-track]"), progressBar: $("[data-progress-bar]"), overallPercent: $("[data-overall-percent]"),
    reset: $("[data-reset]"), completion: $("[data-completion]"), resetDialog: $("[data-reset-dialog]"),
    cancelReset: $("[data-cancel-reset]"), confirmReset: $("[data-confirm-reset]")
  };
  const state = { role: "student", user: null, token: "", tableId: tables[0].id };

  function setConnection(text, mode) {
    elements.connection.textContent = text;
    elements.connection.dataset.state = mode;
  }

  function setError(message = "") {
    elements.loginError.textContent = message;
    elements.loginError.hidden = !message;
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

  function saveSession() {
    try {
      sessionStorage.setItem(config.sessionKey, JSON.stringify({ role: state.role, token: state.token, user: state.user }));
    } catch { /* Session remains in memory. */ }
  }

  function readSession() {
    try { return JSON.parse(sessionStorage.getItem(config.sessionKey) || "null"); }
    catch { return null; }
  }

  function clearSession() {
    state.user = null;
    state.token = "";
    try { sessionStorage.removeItem(config.sessionKey); } catch { /* Ignore unavailable storage. */ }
  }

  function progressKey() {
    const identity = state.user?.id || state.user?.name || "guest";
    return `${config.progressPrefix}:${state.role}:${identity}`;
  }

  function readProgress() {
    try {
      const value = JSON.parse(localStorage.getItem(progressKey()) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch { return {}; }
  }

  function writeProgress(progress) {
    try { localStorage.setItem(progressKey(), JSON.stringify(progress)); }
    catch { /* Progress remains usable for the current render. */ }
  }

  function flattened(table) {
    const rows = [];
    table.groups.forEach((section, groupIndex) => section.rows.forEach((row, rowIndex) => rows.push({ ...row, groupIndex, rowIndex })));
    return rows;
  }

  function tableState(tableId) {
    const progress = readProgress();
    const saved = progress[tableId] || {};
    const table = tables.find((item) => item.id === tableId);
    const total = flattened(table).length;
    return { completed: Math.max(0, Math.min(total, Number(saved.completed) || 0)), notes: saved.notes || {} };
  }

  function saveTableState(tableId, value) {
    const progress = readProgress();
    progress[tableId] = value;
    writeProgress(progress);
  }

  function totalProgress() {
    let complete = 0;
    let total = 0;
    tables.forEach((table) => {
      const rows = flattened(table);
      total += rows.length;
      complete += tableState(table.id).completed;
    });
    return { complete, total, percent: total ? Math.round(complete / total * 100) : 0 };
  }

  function makeSelector() {
    elements.selector.replaceChildren();
    tables.forEach((table) => {
      const total = flattened(table).length;
      const complete = tableState(table.id).completed;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.tableId = table.id;
      button.setAttribute("aria-current", String(table.id === state.tableId));
      const number = document.createElement("small"); number.textContent = `TOOL ${table.number}`;
      const title = document.createElement("strong"); title.textContent = table.title;
      const percent = document.createElement("i"); percent.textContent = `${Math.round(complete / total * 100)}%`;
      button.append(number, title, percent);
      button.addEventListener("click", () => { state.tableId = table.id; render(); window.scrollTo({ top: elements.selector.offsetTop - 90, behavior: "smooth" }); });
      elements.selector.append(button);
    });
  }

  function renderChecklist(table, saved) {
    elements.checklist.replaceChildren();
    const allRows = flattened(table);
    let globalIndex = 0;
    table.groups.forEach((section) => {
      const sectionStart = globalIndex;
      const sectionEnd = sectionStart + section.rows.length;
      const sectionVisible = saved.completed >= sectionStart || sectionStart === 0;
      const wrapper = document.createElement("section");
      wrapper.className = "checklist-section";
      wrapper.hidden = !sectionVisible;
      const heading = document.createElement("h3"); heading.textContent = section.title;
      const list = document.createElement("div"); list.className = "step-list";
      section.rows.forEach((row) => {
        const index = globalIndex++;
        const status = index < saved.completed ? "done" : index === saved.completed ? "next" : "locked";
        const item = document.createElement("article");
        item.className = "step-row";
        item.dataset.state = status;
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "step-toggle";
        toggle.textContent = "✓";
        toggle.setAttribute("aria-label", status === "done" ? `取消完成：${row.text}` : `完成：${row.text}`);
        toggle.disabled = status === "locked";
        toggle.addEventListener("click", () => {
          const current = tableState(table.id);
          current.completed = index < current.completed ? index : Math.min(allRows.length, index + 1);
          saveTableState(table.id, current);
          render();
        });
        const copy = document.createElement("div"); copy.className = "step-copy";
        const label = document.createElement("small"); label.textContent = row.label || `步驟 ${index + 1}`;
        const text = document.createElement("p"); text.textContent = row.text;
        copy.append(label, text);
        if (row.note) {
          const note = document.createElement("textarea");
          note.className = "step-note";
          note.placeholder = "在這裏寫下您的答案或想法…";
          note.value = saved.notes[index] || "";
          note.addEventListener("input", () => {
            const current = tableState(table.id);
            current.notes[index] = note.value;
            saveTableState(table.id, current);
          });
          copy.append(note);
        }
        item.append(toggle, copy);
        list.append(item);
      });
      wrapper.append(heading, list);
      elements.checklist.append(wrapper);
      if (saved.completed < sectionStart && sectionEnd > saved.completed) wrapper.hidden = false;
    });
  }

  function render() {
    const table = tables.find((item) => item.id === state.tableId) || tables[0];
    const saved = tableState(table.id);
    const total = flattened(table).length;
    const percent = total ? Math.round(saved.completed / total * 100) : 0;
    elements.toolNumber.textContent = table.number;
    elements.toolTitle.textContent = table.title;
    elements.toolSubtitle.textContent = table.subtitle;
    elements.progressCopy.textContent = `${saved.completed} / ${total} 個步驟`;
    elements.progressPercent.textContent = `${percent}%`;
    elements.progressTrack.setAttribute("aria-valuenow", String(percent));
    elements.progressBar.style.width = `${percent}%`;
    elements.completion.hidden = saved.completed !== total;
    elements.overallPercent.textContent = `${totalProgress().percent}%`;
    makeSelector();
    renderChecklist(table, saved);
  }

  function showApp() {
    elements.loginView.hidden = true;
    elements.appView.hidden = false;
    elements.userPill.hidden = false;
    elements.userPill.textContent = state.role === "admin" ? `${state.user.name} · 管理員` : state.user.name;
    elements.logout.hidden = false;
    setConnection("已安全連接", "online");
    render();
  }

  async function validateStudent(token) {
    const rows = await rpc(config.studentProfileRpc, { p_token: String(token) });
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.id || !row?.name || !row?.session_token) return false;
    state.role = "student";
    state.token = String(row.session_token);
    state.user = { id: String(row.id), name: String(row.name) };
    saveSession();
    window.EdmundSystemNav?.rememberStudentSession?.({ token: state.token, id: state.user.id, name: state.user.name, role: "student" });
    return true;
  }

  async function validateAdmin(token) {
    const rows = await rpc(config.adminMeRpc, { p_admin_token: String(token) });
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.id || !row?.name) return false;
    state.role = "admin";
    state.token = String(token);
    state.user = { id: String(row.id), name: String(row.name) };
    saveSession();
    return true;
  }

  async function restore() {
    const own = readSession();
    const universal = window.EdmundSystemNav?.getStudentSession?.();
    try {
      if (own?.role === "admin" && own.token && await validateAdmin(own.token)) return true;
      const candidate = universal?.role === "student" ? universal : own?.role === "student" ? own : null;
      if (candidate?.token && await validateStudent(candidate.token)) return true;
    } catch (error) { console.warn("Execution system session restore failed", error); }
    clearSession();
    return false;
  }

  async function submitLogin(event) {
    event.preventDefault();
    setError();
    const form = new FormData(elements.loginForm);
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    if (!username || !password) return setError("請輸入名稱及密碼。");
    elements.loginButton.disabled = true;
    elements.loginButton.firstChild.textContent = "正在核對… ";
    try {
      if (state.role === "admin") {
        const rows = await rpc(config.adminLoginRpc, { p_name: username, p_password: password });
        const row = Array.isArray(rows) ? rows[0] : null;
        if (!row?.admin_token || !await validateAdmin(row.admin_token)) throw new Error("管理員名稱或密碼不正確。");
      } else {
        const rows = await rpc(config.studentLoginRpc, { p_name: username, p_password: password });
        const row = Array.isArray(rows) ? rows[0] : null;
        if (!row?.session_token || !await validateStudent(row.session_token)) throw new Error("學生名稱或密碼不正確。");
      }
      elements.loginForm.reset();
      showApp();
    } catch (error) {
      console.warn("Execution system login failed", error);
      setError(error?.message || "登入失敗，請稍後再試。");
      setConnection("連線失敗", "error");
    } finally {
      elements.loginButton.disabled = false;
      elements.loginButton.firstChild.textContent = "進入系統 ";
    }
  }

  async function logout() {
    if (state.role === "admin" && state.token) {
      try { await rpc(config.adminLogoutRpc, { p_admin_token: state.token }); } catch { /* Local logout still proceeds. */ }
    }
    if (state.role === "student") window.EdmundSystemNav?.forgetStudentSession?.();
    clearSession();
    location.reload();
  }

  function chooseRole(role) {
    state.role = role;
    elements.roleTabs.forEach((button) => button.setAttribute("aria-selected", String(button.dataset.roleTab === role)));
    elements.nameLabel.textContent = role === "admin" ? "管理員名稱" : "學生名稱";
    const username = elements.loginForm.elements.username;
    username.value = role === "admin" ? config.adminUsername : "";
    elements.loginForm.elements.password.value = "";
    setError();
  }

  elements.roleTabs.forEach((button) => button.addEventListener("click", () => chooseRole(button.dataset.roleTab)));
  elements.loginForm.addEventListener("submit", submitLogin);
  elements.logout.addEventListener("click", logout);
  elements.reset.addEventListener("click", () => { elements.resetDialog.hidden = false; elements.cancelReset.focus(); });
  elements.cancelReset.addEventListener("click", () => { elements.resetDialog.hidden = true; elements.reset.focus(); });
  elements.confirmReset.addEventListener("click", () => {
    saveTableState(state.tableId, { completed: 0, notes: {} });
    elements.resetDialog.hidden = true;
    render();
    elements.reset.focus();
  });
  elements.resetDialog.addEventListener("click", (event) => { if (event.target === elements.resetDialog) elements.cancelReset.click(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !elements.resetDialog.hidden) elements.cancelReset.click(); });

  (async () => {
    setConnection("正在連接", "checking");
    try {
      await ensureAuth();
      if (await restore()) showApp();
      else setConnection("已連線", "online");
    } catch (error) {
      console.warn("Execution system initialization failed", error);
      setConnection("連線失敗", "error");
      setError("暫時未能連接帳戶系統，請重新整理後再試。");
    }
  })();
})();
