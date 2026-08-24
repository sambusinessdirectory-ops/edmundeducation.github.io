(function initialiseBookmarkDirectory() {
  "use strict";

  const SESSION_KEY = "edmund-bookmark-directory-session-v1";
  const config = window.EDMUND_SUPABASE || {};
  const state = { client: null, token: "", user: null, items: [] };
  const el = {
    views: [...document.querySelectorAll("[data-view]")],
    connection: document.querySelector("[data-connection]"),
    user: document.querySelector("[data-user]"),
    logout: document.querySelector("[data-logout]"),
    loginForm: document.querySelector("[data-login-form]"),
    loginStatus: document.querySelector("[data-login-status]"),
    summary: document.querySelector("[data-summary]"),
    search: document.querySelector("[data-search]"),
    filter: document.querySelector("[data-filter]"),
    typeFilter: document.querySelector("[data-type-filter]"),
    list: document.querySelector("[data-list]")
  };

  function client() {
    if (state.client) return state.client;
    if (!window.supabase?.createClient || !config.url || !config.anonKey) throw new Error("登入服務暫時未能載入。");
    state.client = window.supabase.createClient(config.url, config.anonKey, {
      auth: { persistSession: true, storage: sessionStorage, detectSessionInUrl: false }
    });
    return state.client;
  }

  async function rpc(name, args) {
    const current = client();
    const existing = await current.auth.getSession();
    if (!existing.data?.session) {
      const login = await current.auth.signInAnonymously();
      if (login.error) throw login.error;
    }
    const result = await current.rpc(name, args);
    if (result.error) throw result.error;
    return result.data;
  }

  function save() {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...state.user, token: state.token, role: "student" }));
    window.EdmundSystemNav?.rememberStudentSession({ ...state.user, token: state.token, role: "student" });
  }

  function clear() {
    state.token = "";
    state.user = null;
    sessionStorage.removeItem(SESSION_KEY);
    window.EdmundSystemNav?.forgetStudentSession?.();
  }

  function show(name) {
    el.views.forEach((view) => { view.hidden = view.dataset.view !== name; });
    const signed = Boolean(state.user);
    el.user.hidden = !signed;
    el.logout.hidden = !signed;
    if (signed) el.user.textContent = `${state.user.name} · 學生`;
  }

  async function validate(token) {
    const data = await rpc("flashcard_student_session_profile", { p_token: token });
    const row = Array.isArray(data) ? data[0] : null;
    if (!row?.session_token) return false;
    state.token = String(row.session_token);
    state.user = { id: String(row.id), name: String(row.name) };
    save();
    return true;
  }

  function formatDate(value) {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat("zh-HK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
    } catch { return ""; }
  }

  function safeOriginalHref(value) {
    try {
      const url = new URL(String(value || ""), window.location.href);
      if (url.origin !== window.location.origin || !/\.html(?:$|[?#])/iu.test(url.href)) return "";
      return url.href;
    } catch { return ""; }
  }

  function filters() {
    const systems = [...new Map(state.items.map((item) => [item.systemKey, item.systemLabel])).entries()]
      .sort((a, b) => a[1].localeCompare(b[1]));
    el.filter.replaceChildren(
      new Option("全部系統", "all"),
      ...systems.map(([key, label]) => new Option(label, key))
    );
  }

  function bookmarkType(item) {
    if (item.systemKey !== "reading-comprehension") return "other";
    const title = String(item.title || "");
    if (/^\[Skimming\]/i.test(title)) return "skimming";
    if (/^\[答案解析\]/.test(title) || /第\s*\d+\s*題解析/.test(title)) return "analysis";
    return "reading-content";
  }

  function bookmarkTypeLabel(item) {
    return { "reading-content": "文章與重點字詞", skimming: "Skimming Tips", analysis: "答案解析" }[bookmarkType(item)] || "學習書簽";
  }

  function openInlineReader(card, reader, button, href, title) {
    const opening = reader.hidden;
    document.querySelectorAll(".bookmark-card.is-reading").forEach((otherCard) => {
      if (otherCard === card) return;
      otherCard.classList.remove("is-reading");
      const otherReader = otherCard.querySelector(".bookmark-inline-reader");
      const otherButton = otherCard.querySelector("[data-read-bookmark]");
      if (otherReader) otherReader.hidden = true;
      if (otherButton) {
        otherButton.setAttribute("aria-expanded", "false");
        otherButton.textContent = "在目錄中閱讀";
      }
    });
    reader.hidden = !opening;
    card.classList.toggle("is-reading", opening);
    button.setAttribute("aria-expanded", String(opening));
    button.textContent = opening ? "收起原文" : "在目錄中閱讀";
    if (opening && !reader.firstElementChild) {
      const iframe = document.createElement("iframe");
      iframe.src = href;
      iframe.title = `原系統內容：${title}`;
      iframe.loading = "lazy";
      reader.append(iframe);
    }
    if (opening) reader.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function bookmarkCard(item) {
    const card = document.createElement("article");
    card.className = "bookmark-card";
    const systemLabel = document.createElement("em");
    systemLabel.textContent = item.systemLabel || "EdmundEducation";
    const typeLabel = document.createElement("span");
    typeLabel.className = "bookmark-type-badge";
    typeLabel.textContent = bookmarkTypeLabel(item);
    const title = document.createElement("h2");
    title.textContent = item.title || "私人書簽";
    const content = document.createElement("section");
    content.className = "bookmark-card-content";
    const contentLabel = document.createElement("strong");
    contentLabel.textContent = "書簽內容";
    const detail = document.createElement("p");
    detail.textContent = item.detail || item.title || "此書簽已安全儲存。";
    content.append(contentLabel, detail);
    const time = document.createElement("time");
    time.dateTime = item.createdAt || "";
    time.textContent = formatDate(item.createdAt);
    const actions = document.createElement("div");
    actions.className = "bookmark-card-actions";
    const href = safeOriginalHref(item.href);
    const reader = document.createElement("div");
    reader.className = "bookmark-inline-reader";
    reader.hidden = true;
    if (href) {
      const read = document.createElement("button");
      read.type = "button";
      read.dataset.readBookmark = "";
      read.setAttribute("aria-expanded", "false");
      read.textContent = "在目錄中閱讀";
      read.addEventListener("click", () => openInlineReader(card, reader, read, href, title.textContent));
      const original = document.createElement("a");
      original.href = href;
      original.textContent = "前往原系統位置 ↗";
      actions.append(read, original);
    }
    card.append(systemLabel, typeLabel, title, content, time, actions, reader);
    return card;
  }

  function render() {
    const query = el.search.value.trim().toLocaleLowerCase();
    const system = el.filter.value;
    const type = el.typeFilter.value;
    const rows = state.items.filter((item) => (
      (system === "all" || item.systemKey === system)
      && (type === "all" || bookmarkType(item) === type)
      && (!query || `${item.systemLabel} ${item.title} ${item.detail}`.toLocaleLowerCase().includes(query))
    ));
    el.summary.textContent = `共 ${state.items.length} 個私人書簽 · 顯示 ${rows.length} 個`;
    el.list.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement("p");
      empty.className = "bookmark-empty";
      empty.textContent = state.items.length
        ? "找不到符合的書簽。"
        : "您暫時未有任何書簽；在各學習系統加入書簽後，會自動集中顯示在這裡。";
      el.list.append(empty);
      return;
    }
    el.list.append(...rows.map(bookmarkCard));
  }

  async function load() {
    const data = await rpc("student_unified_bookmark_directory", { p_student_token: state.token });
    state.items = Array.isArray(data?.items) ? data.items : [];
    filters();
    render();
  }

  async function enter() {
    show("directory");
    el.connection.textContent = "已安全連接";
    el.connection.dataset.state = "online";
    await load();
  }

  el.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    el.loginStatus.textContent = "正在登入…";
    const form = new FormData(el.loginForm);
    try {
      const data = await rpc("flashcard_student_login", {
        p_name: String(form.get("username") || "").trim(),
        p_password: String(form.get("password") || "")
      });
      const row = Array.isArray(data) ? data[0] : null;
      if (!row?.session_token || !await validate(row.session_token)) throw new Error("名稱或密碼不正確。");
      await enter();
    } catch (error) { el.loginStatus.textContent = error.message || "未能登入。"; }
  });
  el.logout.addEventListener("click", () => { clear(); state.items = []; show("login"); });
  el.search.addEventListener("input", render);
  el.filter.addEventListener("change", render);
  el.typeFilter.addEventListener("change", render);

  (async () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null")
        || window.EdmundSystemNav?.bridgeStudentSession?.();
      if (saved?.token && await validate(saved.token)) await enter();
      else {
        show("login");
        el.connection.textContent = "等待登入";
        el.connection.dataset.state = "online";
      }
    } catch {
      clear();
      show("login");
      el.connection.textContent = "等待登入";
      el.connection.dataset.state = "online";
    }
  })();
})();
