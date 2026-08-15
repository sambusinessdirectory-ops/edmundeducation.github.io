(function initialiseSongAppreciation() {
  "use strict";

  const CONFIG = window.EDMUND_SONG_APPRECIATION_CONFIG || {};
  const SUPABASE = window.EDMUND_SUPABASE || {};
  const CHART_RANGES = [7, 30, 90, 0];
  const PAGE_SIZE = 500;
  const MODE_ACCENTS = Object.freeze({ standard: "STANDARD", medium: "MEDIUM", hard: "HARD", hell: "HELL" });
  const state = {
    client: null,
    session: null,
    songs: [],
    activeSong: null,
    activeRoute: "library",
    activeTab: "description",
    bookmarks: [],
    attempts: [],
    bookmarkFilter: "all",
    questionRange: 30,
    timeRange: 30,
    selectedPhrase: null,
    exercise: null,
    player: null,
    playerReady: false,
    playerState: null,
    countdownTimer: 0,
    exerciseTimer: 0,
    adminSongs: [],
    adminSong: null,
    adminStudents: []
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const views = Object.fromEntries($$("[data-view]").map(node => [node.dataset.view, node]));
  const pages = Object.fromEntries($$("[data-page]").map(node => [node.dataset.page, node]));

  function text(value) { return String(value == null ? "" : value); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function firstRow(value) { return Array.isArray(value) ? (value[0] || null) : (value || null); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value) || 0)); }
  function normalizeSpace(value) { return text(value).replace(/\s+/g, " ").trim(); }
  function safeDate(value) { const date = new Date(value); return Number.isNaN(date.valueOf()) ? null : date; }
  function localDayKey(value) {
    const date = safeDate(value);
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function displayDate(value) {
    const date = safeDate(value);
    return date ? new Intl.DateTimeFormat("zh-HK", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date) : "—";
  }
  function formatDuration(seconds) {
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const rest = total % 60;
    if (hours) return `${hours} 小時 ${minutes} 分`;
    if (minutes) return `${minutes} 分 ${rest} 秒`;
    return `${rest} 秒`;
  }
  function median(values) {
    const sorted = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
    if (!sorted.length) return 0;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function showView(name) {
    Object.entries(views).forEach(([key, node]) => { node.hidden = key !== name; });
  }

  function setConnection(status, label) {
    const pill = $("[data-connection-state]");
    if (!pill) return;
    pill.dataset.state = status;
    pill.textContent = label;
  }

  function toast(message, kind = "success") {
    const node = document.createElement("div");
    node.className = `toast${kind === "error" ? " is-error" : ""}`;
    node.textContent = text(message);
    $("[data-toast-region]")?.append(node);
    window.setTimeout(() => node.remove(), 3600);
  }

  function readSession() {
    try {
      const value = JSON.parse(sessionStorage.getItem(CONFIG.sessionKey) || "null");
      return value && ["student", "admin"].includes(value.role) && value.token ? value : null;
    } catch { return null; }
  }

  function saveSession(value) {
    state.session = value;
    try { sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify(value)); } catch { /* Private browsing may reject storage. */ }
    if (value?.role === "student") window.EdmundSystemNav?.rememberStudentSession?.(value);
  }

  function clearSession() {
    if (state.session?.role === "student") window.EdmundSystemNav?.forgetStudentSession?.();
    state.session = null;
    try { sessionStorage.removeItem(CONFIG.sessionKey); } catch { /* Best effort. */ }
  }

  async function rpc(name, args = {}) {
    if (!state.client || !name) throw new Error("資料服務尚未連接。");
    const { data, error } = await state.client.rpc(name, args);
    if (error) throw error;
    return data;
  }

  async function fetchAllPages(name, args = {}) {
    const rows = [];
    for (let page = 0; page <= 200; page += 1) {
      const batch = asArray(await rpc(name, { ...args, p_offset: page * PAGE_SIZE, p_limit: PAGE_SIZE }));
      rows.push(...batch);
      if (batch.length < PAGE_SIZE) return rows;
    }
    throw new Error("資料量超過可安全載入的上限。");
  }

  function normalizeTranslationRows(value) {
    return asArray(value).map((row, index) => {
      if (row?.break === true || row?.intentionalBreak === true || row?.intentional_break === true) return { break: true, lineId: `break-${index}` };
      return {
        lineId: text(row?.lineId || row?.line_id || `line-${index + 1}`),
        english: text(row?.english),
        chinese: text(row?.chinese)
      };
    });
  }

  function normalizeQuestion(question, index, includeAnswers) {
    const options = asArray(question?.options).map(text);
    return {
      number: Number(question?.number) || index + 1,
      prompt: text(question?.prompt || "{{blank}}"),
      options,
      answer: includeAnswers ? text(question?.answer) : ""
    };
  }

  function normalizeMode(mode, index, includeAnswers) {
    const id = text(mode?.id || mode?.key || `mode-${index + 1}`).toLowerCase();
    const questions = asArray(mode?.questions).map((question, questionIndex) => normalizeQuestion(question, questionIndex, includeAnswers));
    return {
      id,
      label: text(mode?.label || mode?.title || id),
      title: text(mode?.title || mode?.label || id),
      questionCount: Number(mode?.questionCount || mode?.question_count) || questions.length,
      version: Number(mode?.version) || 1,
      questions
    };
  }

  function normalizeSong(raw, { includeAnswers = true } = {}) {
    const translations = raw?.translations || raw?.translationRows || raw?.translation_rows || raw?.translation || [];
    const modes = raw?.modes || raw?.exercises || [];
    return {
      id: text(raw?.id || raw?.slug),
      slug: text(raw?.slug || raw?.id),
      title: text(raw?.title),
      singer: text(raw?.singer || raw?.artist),
      exerciseName: text(raw?.exerciseName || raw?.exercise_name || `${raw?.title || "Song"} Listening Practice`),
      description: text(raw?.description),
      youtubeUrl: text(raw?.youtubeUrl || raw?.youtube_url),
      tags: asArray(raw?.tags).map(text).filter(Boolean),
      translations: normalizeTranslationRows(translations),
      modes: asArray(modes).map((mode, index) => normalizeMode(mode, index, includeAnswers)),
      published: raw?.published !== false,
      sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 0),
      createdAt: raw?.createdAt || raw?.created_at || "",
      updatedAt: raw?.updatedAt || raw?.updated_at || ""
    };
  }

  function validateSong(song, { requireAnswers = false } = {}) {
    if (!song.id || !song.title || !song.singer) throw new Error("歌曲資料缺少 ID、歌名或歌手。");
    song.modes.forEach(mode => {
      if (mode.questionCount !== mode.questions.length) throw new Error(`${song.title} ${mode.label} 題目數量不一致。`);
      mode.questions.forEach(question => {
        if (question.options.length !== 3 || (requireAnswers && !question.options.includes(question.answer))) throw new Error(`${song.title} ${mode.label} Q${question.number} 選項或答案無效。`);
      });
    });
    return song;
  }

  function youtubeVideoId(value) {
    let source = text(value).trim();
    if (!source) return "";
    if (/^(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(source)) source = `https://${source}`;
    try {
      const url = new URL(source);
      const host = url.hostname.toLowerCase().replace(/^www\./, "");
      let id = "";
      if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || "";
      else if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com" || host.endsWith(".youtube-nocookie.com")) {
        const parts = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live", "v"].includes(parts[0])) id = parts[1] || "";
        else id = url.searchParams.get("v") || "";
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
    } catch { return ""; }
  }

  function thumbnailUrl(song) {
    const id = youtubeVideoId(song?.youtubeUrl);
    return id ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : "";
  }

  function tagElements(tags, container) {
    container.replaceChildren();
    asArray(tags).forEach(tag => {
      const node = document.createElement("span");
      node.textContent = tag;
      container.append(node);
    });
  }

  function songHaystack(song) {
    return normalizeSpace([song.title, song.singer, song.exerciseName, ...song.tags].join(" ")).toLocaleLowerCase("en");
  }

  function showAuthenticatedHeader(session) {
    const user = $("[data-signed-in-user]");
    user.textContent = session.name;
    user.hidden = false;
    $("[data-logout]").hidden = false;
    $("[data-student-nav]").hidden = session.role !== "student";
  }

  async function studentLogin(username, password) {
    const rows = await rpc(CONFIG.studentLoginRpc, { p_name: username, p_password: password });
    const row = firstRow(rows);
    if (!row?.session_token) throw new Error("用戶名稱或密碼不正確。");
    return { role: "student", token: text(row.session_token), id: text(row.id), name: text(row.name) };
  }

  async function adminLogin(username, password) {
    const rows = await rpc(CONFIG.rpc.adminLogin, { p_name: username, p_password: password });
    const row = firstRow(rows);
    if (!row?.admin_token) throw new Error("管理員名稱或密碼不正確。");
    return { role: "admin", token: text(row.admin_token), id: text(row.admin_id), name: text(row.name || username) };
  }

  async function validateSession(session) {
    if (!session?.token) return null;
    const name = session.role === "admin" ? CONFIG.rpc.adminMe : CONFIG.rpc.studentMe;
    const args = session.role === "admin" ? { p_admin_token: session.token } : { p_student_token: session.token };
    const row = firstRow(await rpc(name, args));
    if (!row?.name) return null;
    return { ...session, id: text(row.id || session.id), name: text(row.name), role: session.role };
  }

  function loginTabs() {
    $$("[data-login-tab]").forEach(button => {
      button.addEventListener("click", () => {
        const role = button.dataset.loginTab;
        $$("[data-login-tab]").forEach(tab => {
          const active = tab === button;
          tab.setAttribute("aria-selected", String(active));
          tab.tabIndex = active ? 0 : -1;
        });
        $$("[data-login-panel]").forEach(panel => { panel.hidden = panel.dataset.loginPanel !== role; });
      });
    });
    $$("[data-password-toggle]").forEach(button => button.addEventListener("click", () => {
      const input = button.closest(".password-field")?.querySelector("input");
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      button.textContent = input.type === "password" ? "顯示" : "隱藏";
      button.setAttribute("aria-label", input.type === "password" ? "顯示密碼" : "隱藏密碼");
    }));
  }

  function offerUniversalSession() {
    const candidate = window.EdmundSystemNav?.getStudentSession?.();
    const panel = $("[data-universal-session]");
    if (!panel || !candidate?.token || !candidate?.name) return;
    panel.hidden = false;
    $("[data-universal-name]", panel).textContent = candidate.name;
    $("[data-use-universal-session]", panel).onclick = async () => {
      try {
        const session = await validateSession({ role: "student", token: candidate.token, id: candidate.id, name: candidate.name });
        if (!session) throw new Error("這個登入已過期，請重新登入。");
        saveSession(session);
        await enterStudent();
      } catch (error) { toast(error.message, "error"); }
    };
  }

  function bindLoginForms() {
    $$("[data-login-form]").forEach(form => form.addEventListener("submit", async event => {
      event.preventDefault();
      const role = form.dataset.loginForm;
      const status = $(`[data-login-status="${role}"]`);
      const submit = $("button[type=submit]", form);
      const username = normalizeSpace(form.elements.username.value);
      const password = text(form.elements.password.value);
      status.textContent = "";
      if (!username || !password) { status.textContent = "請輸入用戶名稱及密碼。"; return; }
      submit.disabled = true;
      status.textContent = "正在驗證⋯";
      try {
        const session = role === "admin" ? await adminLogin(username, password) : await studentLogin(username, password);
        saveSession(session);
        form.reset();
        if (role === "admin") await enterAdmin(); else await enterStudent();
      } catch (error) {
        status.textContent = text(error?.message || "登入失敗，請再試一次。");
      } finally { submit.disabled = false; }
    }));
  }

  async function logout() {
    if (state.session?.role === "admin") {
      try { await rpc(CONFIG.rpc.adminLogout, { p_admin_token: state.session.token }); } catch { /* Local logout still applies. */ }
    }
    stopExerciseTimers();
    destroyPlayer();
    clearSession();
    state.songs = [];
    state.activeSong = null;
    state.bookmarks = [];
    state.attempts = [];
    $("[data-signed-in-user]").hidden = true;
    $("[data-logout]").hidden = true;
    $("[data-student-nav]").hidden = true;
    showView("login");
    offerUniversalSession();
  }

  async function loadStudentData() {
    const token = state.session.token;
    const [songRows, bookmarkRows, attemptRows] = await Promise.all([
      rpc(CONFIG.rpc.listSongs, { p_student_token: token }),
      fetchAllPages(CONFIG.rpc.listBookmarks, { p_student_token: token, p_song_id: null }),
      fetchAllPages(CONFIG.rpc.listAttempts, { p_student_token: token, p_song_id: null })
    ]);
    state.songs = asArray(songRows)
      .map(row => normalizeSong(row.song || row, { includeAnswers: false }))
      .map(song => validateSong(song, { requireAnswers: false }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    state.bookmarks = asArray(bookmarkRows).map(normalizeBookmark);
    state.attempts = asArray(attemptRows).map(normalizeAttempt);
  }

  async function enterStudent() {
    showAuthenticatedHeader(state.session);
    showView("student");
    setConnection("online", "已連接");
    $("[data-library-state]").hidden = false;
    $("[data-song-grid]").hidden = true;
    try {
      await loadStudentData();
      renderLibrary();
      renderBookmarks();
      renderAttempts();
      renderDashboard();
      setDashboardExpanded(readDashboardExpanded());
      routeStudent("library");
    } catch (error) {
      setConnection("offline", "未能載入");
      $("[data-library-state] p").textContent = text(error?.message || "未能載入歌曲庫。");
      toast(error?.message || "未能載入歌曲庫。", "error");
    }
  }

  function routeStudent(route) {
    if (state.session?.role !== "student") return;
    const valid = pages[route] ? route : "library";
    state.activeRoute = valid;
    Object.entries(pages).forEach(([key, node]) => { node.hidden = key !== valid; });
    $$("[data-route]").forEach(button => {
      if (!button.closest(".student-nav")) return;
      if (button.dataset.route === valid) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (valid !== "song") { cancelReadCountdown(); pausePlayer(); pauseExerciseClock(); }
    else if (state.activeTab === "exercise") startExerciseClock();
    if (valid === "bookmarks") renderBookmarks();
    if (valid === "progress") renderAttempts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderLibrary() {
    const query = normalizeSpace($("[data-song-search]")?.value).toLocaleLowerCase("en");
    const songs = state.songs.filter(song => !query || songHaystack(song).includes(query));
    const grid = $("[data-song-grid]");
    grid.replaceChildren();
    songs.forEach((song, index) => grid.append(createSongCard(song, index)));
    $("[data-library-count]").textContent = String(state.songs.length);
    $("[data-search-status]").textContent = query ? `找到 ${songs.length} 首歌曲。` : `共 ${state.songs.length} 首歌曲。`;
    $("[data-library-state]").hidden = true;
    grid.hidden = false;
  }

  function createSongCard(song, index) {
    const article = document.createElement("article");
    article.className = "song-card";
    const thumb = document.createElement("div");
    thumb.className = "song-card__thumb";
    const fallback = document.createElement("span");
    fallback.textContent = "♪";
    thumb.append(fallback);
    const source = thumbnailUrl(song);
    if (source) {
      const image = new Image();
      image.src = source;
      image.alt = `${song.title} YouTube 縮圖`;
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      thumb.prepend(image);
    }
    const body = document.createElement("div");
    body.className = "song-card__body";
    const lesson = document.createElement("span");
    lesson.textContent = `SONG ${String(index + 1).padStart(2, "0")}`;
    const title = document.createElement("h3"); title.textContent = song.title;
    const singer = document.createElement("p"); singer.textContent = song.singer;
    const tags = document.createElement("div"); tags.className = "tag-row"; tagElements(song.tags.slice(0, 4), tags);
    body.append(lesson, title, singer, tags);
    const open = document.createElement("button");
    open.type = "button";
    open.textContent = "開始賞析 →";
    open.addEventListener("click", () => openSong(song.id));
    article.append(thumb, body, open);
    return article;
  }

  async function openSong(songId, tab = "description") {
    if (state.session?.role !== "student" || !state.session.token) {
      toast("請先登入學生帳戶。", "error");
      return;
    }
    if (!state.songs.some(item => item.id === songId)) return;
    try {
      // Always re-authorize and fetch protected translations/questions from the
      // server. The public catalogue and shipped JavaScript contain metadata only.
      const row = firstRow(await rpc(CONFIG.rpc.getSong, { p_student_token: state.session.token, p_song_id: songId }));
      if (!row) throw new Error("你目前未獲授權開啟這首歌。");
      const song = validateSong(normalizeSong(row.song || row, { includeAnswers: false }), { requireAnswers: false });
      if (!song.translations.length || !song.modes.some(mode => mode.questions.length)) throw new Error("這首歌的練習資料尚未完成。");
      state.activeSong = song;
      renderSong(song);
      routeStudent("song");
      switchSongTab(tab);
    } catch (error) { toast(error.message || "未能開啟這首歌。", "error"); }
  }

  function renderSong(song) {
    $("[data-song-title]").textContent = song.title;
    $("[data-song-singer]").textContent = song.singer;
    $("[data-exercise-name]").textContent = song.exerciseName;
    $("[data-song-description]").textContent = song.description;
    tagElements(song.tags, $("[data-song-tags]"));
    const cover = $("[data-song-cover]");
    $("img", cover)?.remove();
    const source = thumbnailUrl(song);
    if (source) {
      const image = new Image(); image.src = source; image.alt = `${song.title} YouTube 縮圖`; image.referrerPolicy = "no-referrer";
      cover.prepend(image);
    }
    $("[data-cover-fallback]", cover).hidden = Boolean(source);
    renderTranslations(song);
    renderModes(song);
    resetExercise();
  }

  function switchSongTab(tab) {
    const valid = ["description", "translation", "exercise"].includes(tab) ? tab : "description";
    state.activeTab = valid;
    $$("[data-song-tab]").forEach(button => {
      const active = button.dataset.songTab === valid;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    $$("[data-tab-panel]").forEach(panel => { panel.hidden = panel.dataset.tabPanel !== valid; });
    if (valid !== "exercise") { cancelReadCountdown(); pausePlayer(); pauseExerciseClock(); }
    else {
      if (state.exercise?.locked && youtubeVideoId(state.activeSong?.youtubeUrl) && !state.countdownTimer) startReadCountdown();
      startExerciseClock();
    }
  }

  function splitTranslationRows(rows) {
    if (!rows.length) return [[], []];
    const middle = Math.ceil(rows.length / 2);
    let cut = middle;
    for (let offset = 0; offset < 5; offset += 1) {
      if (rows[middle + offset]?.break) { cut = middle + offset + 1; break; }
      if (rows[middle - offset]?.break) { cut = middle - offset + 1; break; }
    }
    return [rows.slice(0, cut), rows.slice(cut)];
  }

  function tokenizeEnglish(value, lineId) {
    const fragment = document.createDocumentFragment();
    const pieces = text(value).split(/(\s+|(?=[,?.!;:()'’—-])|(?<=[,?.!;:()'’—-]))/u).filter(Boolean);
    let wordIndex = 0;
    pieces.forEach(piece => {
      if (/^[\p{L}\p{N}'’“-]+$/u.test(piece) && /[\p{L}\p{N}]/u.test(piece)) {
        const span = document.createElement("span");
        span.className = "lyric-word";
        span.dataset.word = piece;
        span.dataset.lineId = lineId;
        span.dataset.wordIndex = String(wordIndex++);
        span.tabIndex = 0;
        span.setAttribute("role", "button");
        span.setAttribute("aria-label", `收藏單字 ${piece}`);
        span.textContent = piece;
        if (state.bookmarks.some(item => item.songId === state.activeSong?.id && item.kind === "word" && item.normalizedText === normalizeSpace(piece).toLocaleLowerCase("en"))) span.classList.add("is-bookmarked");
        span.addEventListener("click", () => addBookmark({ kind: "word", excerpt: piece, lineId }));
        span.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); addBookmark({ kind: "word", excerpt: piece, lineId }); }
        });
        fragment.append(span);
      } else fragment.append(document.createTextNode(piece));
    });
    return fragment;
  }

  function translationTable(rows, tableIndex) {
    const table = document.createElement("table");
    table.className = "translation-table";
    table.setAttribute("aria-label", `歌詞及翻譯第 ${tableIndex + 1} 部分`);
    const head = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["English", "繁體中文"].forEach(label => { const th = document.createElement("th"); th.scope = "col"; th.textContent = label; headerRow.append(th); });
    head.append(headerRow);
    const body = document.createElement("tbody");
    rows.forEach(row => {
      const tr = document.createElement("tr");
      if (row.break) {
        tr.className = "is-break";
        const td = document.createElement("td"); td.colSpan = 2; td.setAttribute("aria-label", "段落分隔"); tr.append(td);
      } else {
        const english = document.createElement("td");
        english.dataset.translationEnglish = "";
        english.dataset.lineId = row.lineId;
        english.append(tokenizeEnglish(row.english, row.lineId));
        const chinese = document.createElement("td"); chinese.textContent = row.chinese;
        tr.append(english, chinese);
      }
      body.append(tr);
    });
    table.append(head, body);
    return table;
  }

  function renderTranslations(song) {
    const columns = $("[data-translation-columns]");
    columns.replaceChildren();
    splitTranslationRows(song.translations).forEach((rows, index) => columns.append(translationTable(rows, index)));
    $("[data-bookmark-selection]").disabled = true;
    $("[data-selection-status]").textContent = "";
    state.selectedPhrase = null;
  }

  function selectedPhrase() {
    const selection = window.getSelection?.();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return null;
    const phrase = normalizeSpace(selection.toString());
    if (!phrase || phrase.length > 240) return null;
    const range = selection.getRangeAt(0);
    const startCell = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
    const endCell = range.endContainer.nodeType === Node.ELEMENT_NODE ? range.endContainer : range.endContainer.parentElement;
    const start = startCell?.closest?.("[data-translation-english]");
    const end = endCell?.closest?.("[data-translation-english]");
    if (!start || start !== end || !$("[data-tab-panel=translation]")?.contains(start)) return null;
    return { excerpt: phrase, lineId: text(start.dataset.lineId) };
  }

  function updateSelectedPhrase() {
    const phrase = selectedPhrase();
    state.selectedPhrase = phrase;
    const button = $("[data-bookmark-selection]");
    button.disabled = !phrase;
    $("[data-selection-status]").textContent = phrase ? `已選取：「${phrase}」` : "";
  }

  function normalizeBookmark(row) {
    return {
      id: text(row?.id),
      songId: text(row?.song_id || row?.songId),
      songTitle: text(row?.song_title || row?.songTitle),
      singer: text(row?.singer),
      lineId: text(row?.line_id || row?.lineId || row?.source_locator?.lineId || row?.source_locator?.line_id),
      kind: row?.kind === "phrase" ? "phrase" : "word",
      excerpt: text(row?.excerpt || row?.selected_text || row?.bookmark_text),
      normalizedText: text(row?.normalized_text || normalizeSpace(row?.excerpt || row?.selected_text || row?.bookmark_text).toLocaleLowerCase("en")),
      createdAt: row?.created_at || new Date().toISOString()
    };
  }

  async function addBookmark(input) {
    const song = state.activeSong;
    const excerpt = normalizeSpace(input.excerpt);
    if (!song || !excerpt) return;
    const normalized = excerpt.toLocaleLowerCase("en");
    if (state.bookmarks.some(item => item.songId === song.id && item.kind === input.kind && item.normalizedText === normalized)) {
      toast("這項內容已在你的書籤內。", "error");
      return;
    }
    try {
      const sourceText = song.translations.find(row => !row.break && row.lineId === text(input.lineId))?.english || "";
      const row = firstRow(await rpc(CONFIG.rpc.addBookmark, {
        p_student_token: state.session.token,
        p_song_id: song.id,
        p_kind: input.kind,
        p_bookmark_text: excerpt,
        p_source_text: sourceText,
        p_source_locator: { lineId: text(input.lineId) }
      }));
      if (!row?.id || text(row.song_id) !== song.id) throw new Error("資料服務未確認書籤已儲存。");
      state.bookmarks.unshift(normalizeBookmark({ ...row, song_title: song.title, singer: song.singer }));
      renderTranslations(song);
      renderBookmarks();
      window.getSelection?.().removeAllRanges?.();
      toast(input.kind === "phrase" ? "片語已加入書籤。" : "單字已加入書籤。");
    } catch (error) { toast(error.message || "未能儲存書籤。", "error"); }
  }

  async function deleteBookmark(id) {
    try {
      const deleted = await rpc(CONFIG.rpc.deleteBookmark, { p_student_token: state.session.token, p_bookmark_id: id });
      if (deleted !== true) throw new Error("資料服務未確認書籤已移除。");
      state.bookmarks = state.bookmarks.filter(item => item.id !== id);
      renderBookmarks();
      if (state.activeSong) renderTranslations(state.activeSong);
      toast("書籤已移除。");
    } catch (error) { toast(error.message || "未能移除書籤。", "error"); }
  }

  function renderBookmarks() {
    const list = state.bookmarks.filter(item => state.bookmarkFilter === "all" || item.kind === state.bookmarkFilter);
    const grid = $("[data-bookmark-grid]");
    grid.replaceChildren();
    list.forEach(item => {
      const card = document.createElement("article"); card.className = "bookmark-card";
      const kind = document.createElement("span"); kind.textContent = item.kind === "phrase" ? "PHRASE · 片語" : "WORD · 單字";
      const excerpt = document.createElement("strong"); excerpt.textContent = item.excerpt;
      const source = document.createElement("p"); source.textContent = `來源：${item.songTitle || state.songs.find(song => song.id === item.songId)?.title || "歌曲"}${item.singer ? ` · ${item.singer}` : ""}`;
      const footer = document.createElement("footer");
      const open = document.createElement("button"); open.type = "button"; open.textContent = "查看原文"; open.onclick = () => openSong(item.songId, "translation");
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "移除"; remove.onclick = () => deleteBookmark(item.id);
      footer.append(open, remove); card.append(kind, excerpt, source, footer); grid.append(card);
    });
    $("[data-bookmark-empty]").hidden = Boolean(list.length);
  }

  function normalizeAttempt(row) {
    return {
      id: text(row?.id),
      songId: text(row?.song_id || row?.songId),
      songTitle: text(row?.song_title || row?.songTitle),
      mode: text(row?.mode_id || row?.mode || row?.difficulty),
      exerciseVersion: Number(row?.exercise_version || row?.exerciseVersion || 1),
      answers: row?.answers && typeof row.answers === "object" ? row.answers : {},
      results: (row?.results || row?.result) && typeof (row?.results || row?.result) === "object" ? (row.results || row.result) : {},
      correctCount: Number(row?.correct_count || row?.correctCount || 0),
      totalQuestions: Number(row?.total_questions || row?.totalQuestions || row?.total_count || 0),
      durationSeconds: Number(row?.duration_seconds || row?.durationSeconds || 0) || (Number(row?.duration_ms) || 0) / 1000,
      startedAt: row?.started_at || row?.startedAt || "",
      completedAt: row?.completed_at || row?.completedAt || row?.created_at || ""
    };
  }

  function renderAttempts() {
    const list = $("[data-attempt-list]");
    list.replaceChildren();
    state.attempts.slice().sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).forEach(attempt => {
      const details = document.createElement("details"); details.className = "attempt-card";
      const summary = document.createElement("summary");
      const title = document.createElement("strong"); title.textContent = attempt.songTitle || state.songs.find(song => song.id === attempt.songId)?.title || "歌曲練習";
      const date = document.createElement("span"); date.textContent = displayDate(attempt.completedAt);
      const score = document.createElement("b"); score.textContent = `${attempt.correctCount} / ${attempt.totalQuestions}`;
      summary.append(title, date, score);
      const body = document.createElement("div"); body.className = "attempt-card__detail";
      body.textContent = `${MODE_ACCENTS[attempt.mode] || attempt.mode} · 練習時間 ${formatDuration(attempt.durationSeconds)} · 正確率 ${attempt.totalQuestions ? Math.round(attempt.correctCount / attempt.totalQuestions * 100) : 0}%`;
      details.append(summary, body); list.append(details);
    });
    $("[data-attempt-empty]").hidden = Boolean(state.attempts.length);
  }

  function dateRangeStart(days) {
    if (!days) return null;
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - days + 1); return date;
  }

  function dailyAttemptSeries(days, field) {
    const start = dateRangeStart(days);
    const grouped = new Map();
    state.attempts.forEach(attempt => {
      const date = safeDate(attempt.completedAt);
      if (!date || (start && date < start)) return;
      const key = localDayKey(date);
      const amount = field === "questions" ? attempt.totalQuestions : attempt.durationSeconds;
      grouped.set(key, (grouped.get(key) || 0) + amount);
    });
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, value]) => ({ day, value }));
  }

  function renderRangePills(container, current, handler) {
    container.replaceChildren();
    CHART_RANGES.forEach(days => {
      const button = document.createElement("button"); button.type = "button"; button.textContent = days ? `${days}日` : "全部";
      button.classList.toggle("is-active", current === days);
      button.addEventListener("click", () => handler(days));
      container.append(button);
    });
  }

  function renderLineChart(container, series, field, detail) {
    container.replaceChildren();
    if (!series.length) {
      const empty = document.createElement("div"); empty.className = "chart-empty"; empty.textContent = "完成練習後，圖表會顯示在這裡。"; container.append(empty); return;
    }
    const width = 600, height = 150, left = 28, right = 12, top = 12, bottom = 28;
    const max = Math.max(...series.map(item => item.value), 1);
    const x = index => left + (series.length === 1 ? (width - left - right) / 2 : index * (width - left - right) / (series.length - 1));
    const y = value => top + (height - top - bottom) * (1 - value / max);
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg"); svg.setAttribute("viewBox", `0 0 ${width} ${height}`); svg.setAttribute("role", "img");
    [0, .5, 1].forEach(ratio => { const line = document.createElementNS(ns, "line"); line.setAttribute("x1", left); line.setAttribute("x2", width - right); line.setAttribute("y1", top + (height - top - bottom) * ratio); line.setAttribute("y2", top + (height - top - bottom) * ratio); line.setAttribute("class", "chart-grid"); svg.append(line); });
    const points = series.map((item, index) => `${x(index)},${y(item.value)}`).join(" ");
    const area = document.createElementNS(ns, "path"); area.setAttribute("class", "chart-area"); area.setAttribute("d", `M ${x(0)} ${height - bottom} L ${points.replaceAll(" ", " L ")} L ${x(series.length - 1)} ${height - bottom} Z`); svg.append(area);
    const path = document.createElementNS(ns, "polyline"); path.setAttribute("class", "chart-line"); path.setAttribute("points", points); svg.append(path);
    series.forEach((item, index) => {
      const circle = document.createElementNS(ns, "circle"); circle.setAttribute("class", "chart-point"); circle.setAttribute("cx", x(index)); circle.setAttribute("cy", y(item.value)); circle.setAttribute("r", "5"); circle.setAttribute("tabindex", "0"); circle.setAttribute("role", "button"); circle.setAttribute("aria-label", `${item.day}：${field === "questions" ? `${item.value} 題` : formatDuration(item.value)}`);
      const activate = () => { detail.textContent = `${item.day} · ${field === "questions" ? `完成 ${item.value} 題` : `練習 ${formatDuration(item.value)}`}`; };
      circle.addEventListener("click", activate); circle.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } }); svg.append(circle);
      if (index === 0 || index === series.length - 1) { const label = document.createElementNS(ns, "text"); label.setAttribute("class", "chart-label"); label.setAttribute("x", x(index)); label.setAttribute("y", height - 7); label.setAttribute("text-anchor", index === 0 ? "start" : "end"); label.textContent = item.day.slice(5); svg.append(label); }
    });
    container.append(svg);
  }

  function renderDashboard() {
    renderRangePills($("[data-question-ranges]"), state.questionRange, days => { state.questionRange = days; renderDashboard(); });
    renderRangePills($("[data-time-ranges]"), state.timeRange, days => { state.timeRange = days; renderDashboard(); });
    renderLineChart($("[data-question-chart]"), dailyAttemptSeries(state.questionRange, "questions"), "questions", $("[data-question-detail]"));
    const timeSeries = dailyAttemptSeries(state.timeRange, "time");
    renderLineChart($("[data-time-chart]"), timeSeries, "time", $("[data-time-detail]"));
    const values = timeSeries.map(item => item.value);
    const stats = [
      [formatDuration(values.reduce((sum, value) => sum + value, 0)), "範圍總時間"],
      [formatDuration(values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0), "每日平均"],
      [formatDuration(median(values)), "每日中位數"],
      [formatDuration(Math.max(0, ...values)), "單日最多"]
    ];
    const holder = $("[data-time-stats]"); holder.replaceChildren();
    stats.forEach(([value, label]) => { const node = document.createElement("div"); const strong = document.createElement("strong"); strong.textContent = value; const span = document.createElement("span"); span.textContent = label; node.append(strong, span); holder.append(node); });
  }

  function dashboardPreferenceKey() { return `${CONFIG.dashboardPreferenceKey}:${state.session?.id || state.session?.name || "guest"}`; }
  function readDashboardExpanded() { try { return localStorage.getItem(dashboardPreferenceKey()) === "expanded"; } catch { return false; } }
  function setDashboardExpanded(expanded) {
    const body = $("[data-dashboard-body]"); const button = $("[data-dashboard-toggle]");
    body.hidden = !expanded; button.setAttribute("aria-expanded", String(expanded)); $("[data-dashboard-toggle-label]").textContent = expanded ? "收合" : "展開";
    try { localStorage.setItem(dashboardPreferenceKey(), expanded ? "expanded" : "collapsed"); } catch { /* Best effort. */ }
  }

  function renderModes(song) {
    const grid = $("[data-mode-grid]"); grid.replaceChildren();
    song.modes.forEach(mode => {
      const button = document.createElement("button"); button.type = "button"; button.className = "mode-card";
      const eyebrow = document.createElement("span"); eyebrow.textContent = MODE_ACCENTS[mode.id] || mode.id.toUpperCase();
      const title = document.createElement("strong"); title.textContent = mode.label;
      const count = document.createElement("small"); count.textContent = `${mode.questionCount} 題 · 三選一`;
      button.append(eyebrow, title, count); button.addEventListener("click", () => startExercise(mode.id)); grid.append(button);
    });
  }

  function promptParts(prompt) {
    const parts = text(prompt).split("{{blank}}");
    return parts.length === 2 ? parts : [text(prompt), ""];
  }

  function renderExerciseQuestions() {
    const holder = $("[data-lyrics-exercise]"); holder.replaceChildren();
    const exercise = state.exercise;
    if (!exercise) return;
    exercise.mode.questions.forEach(question => {
      const card = document.createElement("article"); card.className = "exercise-line"; card.dataset.question = String(question.number);
      if (Object.prototype.hasOwnProperty.call(exercise.answers, question.number)) card.classList.add("is-answered");
      const prompt = document.createElement("div"); prompt.className = "exercise-prompt";
      const [before, after] = promptParts(question.prompt); prompt.append(document.createTextNode(before));
      const blank = document.createElement("span"); blank.className = "blank-number"; blank.textContent = String(question.number); prompt.append(blank, document.createTextNode(after));
      const choices = document.createElement("div"); choices.className = "choice-grid"; choices.setAttribute("role", "radiogroup"); choices.setAttribute("aria-label", `第 ${question.number} 題`);
      question.options.forEach((option, index) => {
        const selected = exercise.answers[question.number] === option;
        const button = document.createElement("button"); button.type = "button"; button.className = "choice-button"; button.classList.toggle("is-selected", selected); button.dataset.option = option; button.setAttribute("role", "radio"); button.setAttribute("aria-checked", String(selected)); button.disabled = exercise.locked;
        const letter = document.createElement("b"); letter.textContent = String.fromCharCode(65 + index); const label = document.createElement("span"); label.textContent = option; button.append(letter, label);
        button.addEventListener("click", () => chooseAnswer(question.number, option)); choices.append(button);
      });
      card.append(prompt, choices); holder.append(card);
    });
    updateExerciseProgress();
  }

  function startExercise(modeId) {
    const song = state.activeSong;
    const mode = song?.modes.find(item => item.id === modeId);
    if (!song || !mode) return;
    resetExercise();
    state.exercise = { mode, answers: {}, locked: Boolean(youtubeVideoId(song.youtubeUrl)), submitted: false, startedAt: new Date().toISOString(), activeSeconds: 0, clockStarted: performance.now() };
    $("[data-mode-grid]").hidden = true;
    $("[data-exercise-stage]").hidden = false;
    $("[data-mode-title]").textContent = `${mode.label} · ${mode.questionCount} 題`;
    $("[data-relisten]").hidden = false;
    renderExerciseQuestions();
    startExerciseClock();
    if (youtubeVideoId(song.youtubeUrl)) {
      mountPlayer(song.youtubeUrl);
      startReadCountdown();
    } else {
      state.exercise.locked = false;
      renderExerciseQuestions();
    }
    $("[data-exercise-stage]").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetExercise() {
    stopExerciseTimers();
    destroyPlayer();
    state.exercise = null;
    $("[data-mode-grid]").hidden = false;
    $("[data-exercise-stage]").hidden = true;
    $("[data-result-card]").hidden = true;
    $("[data-autoplay-note]").hidden = true;
    $("[data-countdown]").hidden = true;
    $("[data-relisten]").hidden = true;
  }

  function stopExerciseTimers() {
    window.clearInterval(state.countdownTimer); state.countdownTimer = 0;
    window.clearInterval(state.exerciseTimer); state.exerciseTimer = 0;
    if (state.exercise?.clockStarted) {
      state.exercise.activeSeconds += Math.max(0, (performance.now() - state.exercise.clockStarted) / 1000);
      state.exercise.clockStarted = 0;
    }
  }

  function startExerciseClock() {
    if (!state.exercise || state.exercise.submitted || state.exercise.clockStarted) return;
    state.exercise.clockStarted = performance.now();
    state.exerciseTimer = window.setInterval(() => updateExerciseProgress(), 1000);
  }

  function pauseExerciseClock() {
    if (!state.exercise?.clockStarted) return;
    state.exercise.activeSeconds += Math.max(0, (performance.now() - state.exercise.clockStarted) / 1000);
    state.exercise.clockStarted = 0;
    window.clearInterval(state.exerciseTimer); state.exerciseTimer = 0;
  }

  function startReadCountdown() {
    window.clearInterval(state.countdownTimer);
    const overlay = $("[data-countdown]"); overlay.hidden = false;
    let remaining = 30; $("[data-countdown-value]").textContent = String(remaining);
    state.countdownTimer = window.setInterval(() => {
      remaining -= 1; $("[data-countdown-value]").textContent = String(Math.max(0, remaining));
      if (remaining <= 0) finishReadCountdown();
    }, 1000);
  }

  function cancelReadCountdown() {
    const wasRunning = Boolean(state.countdownTimer);
    window.clearInterval(state.countdownTimer); state.countdownTimer = 0;
    $("[data-countdown]").hidden = true;
    if (wasRunning && state.exercise && !state.exercise.submitted) {
      state.exercise.locked = Boolean(youtubeVideoId(state.activeSong?.youtubeUrl));
      renderExerciseQuestions();
    }
  }

  function finishReadCountdown() {
    window.clearInterval(state.countdownTimer); state.countdownTimer = 0;
    $("[data-countdown]").hidden = true;
    if (state.activeRoute !== "song" || state.activeTab !== "exercise") return;
    if (state.exercise) state.exercise.locked = false;
    renderExerciseQuestions();
    playPlayer(true);
  }

  function chooseAnswer(number, option) {
    const exercise = state.exercise;
    if (!exercise || exercise.locked || exercise.submitted) return;
    exercise.answers[number] = option;
    const card = $(`[data-question="${number}"]`);
    card?.classList.add("is-answered");
    $$("[data-option]", card).forEach(button => {
      const selected = button.dataset.option === option;
      button.classList.toggle("is-selected", selected); button.setAttribute("aria-checked", String(selected));
    });
    updateExerciseProgress();
  }

  function updateExerciseProgress() {
    const exercise = state.exercise;
    if (!exercise) return;
    const answered = Object.keys(exercise.answers).length;
    $("[data-answer-progress]").textContent = `已選 ${answered} / ${exercise.mode.questionCount}`;
    $("[data-submit-exercise]").disabled = exercise.submitted || exercise.submitting || answered !== exercise.mode.questionCount;
    $("[data-submit-summary]").textContent = exercise.submitting ? "正在安全核對答案及儲存成績…" : answered === exercise.mode.questionCount ? "所有題目已作答，可以提交" : `尚餘 ${exercise.mode.questionCount - answered} 題`;
  }

  function serverResultForQuestion(results, number) {
    const value = results?.[String(number)] ?? results?.[number];
    return value && typeof value === "object" ? value : null;
  }

  function validateSavedAttempt(row, expected) {
    const attempt = normalizeAttempt(row);
    if (!attempt.id || attempt.id !== expected.attemptId || attempt.songId !== expected.songId) throw new Error("資料服務未確認成績已儲存。");
    if (attempt.mode !== expected.modeId || attempt.exerciseVersion !== expected.exerciseVersion || attempt.totalQuestions !== expected.questionCount) throw new Error("資料服務回傳的練習版本不一致。");
    let verifiedCorrect = 0;
    expected.questions.forEach(question => {
      const result = serverResultForQuestion(attempt.results, question.number);
      const submitted = text(expected.answers[question.number]);
      if (!result || text(result.selected) !== submitted || !question.options.includes(text(result.answer)) || typeof result.correct !== "boolean" || result.correct !== (text(result.selected) === text(result.answer))) {
        throw new Error("資料服務回傳的核對結果不完整。");
      }
      if (result.correct) verifiedCorrect += 1;
    });
    if (attempt.correctCount !== verifiedCorrect) throw new Error("資料服務回傳的分數不一致。");
    return attempt;
  }

  function revealServerResult(exercise, attempt) {
    exercise.mode.questions.forEach(question => {
      const result = serverResultForQuestion(attempt.results, question.number);
      const selected = text(result.selected);
      const answer = text(result.answer);
      const ok = result.correct === true;
      const card = $(`[data-question="${question.number}"]`);
      card?.classList.add(ok ? "is-correct" : "is-incorrect");
      $$("[data-option]", card).forEach(button => {
        button.disabled = true;
        if (button.dataset.option === answer) button.classList.add("is-correct");
        else if (button.dataset.option === selected && !ok) button.classList.add("is-wrong");
      });
      const feedback = document.createElement("span");
      feedback.className = "answer-feedback";
      feedback.textContent = ok ? "✓ 正確" : `答案：${answer}`;
      card?.append(feedback);
    });
    $("[data-result-score]").textContent = `${attempt.correctCount} / ${attempt.totalQuestions}`;
    const percent = Math.round(attempt.correctCount / attempt.totalQuestions * 100);
    $("[data-result-message]").textContent = percent >= 90 ? `出色！${percent}% 正確。` : percent >= 70 ? `很好！${percent}% 正確，再聽一次會更穩固。` : `${percent}% 正確；核對答案後再聽一次。`;
    $("[data-result-card]").hidden = false;
  }

  async function submitExercise() {
    const exercise = state.exercise;
    const song = state.activeSong;
    if (!exercise || !song || exercise.submitted || exercise.submitting || Object.keys(exercise.answers).length !== exercise.mode.questionCount) return;
    if (state.session?.role !== "student" || !state.session.token) { toast("請重新登入後再提交。", "error"); return; }
    pauseExerciseClock();
    exercise.submitting = true;
    exercise.pendingSubmission ||= {
      attemptId: crypto.randomUUID(),
      songId: song.id,
      modeId: exercise.mode.id,
      exerciseVersion: exercise.mode.version,
      answers: { ...exercise.answers },
      durationMs: clamp(Math.round(exercise.activeSeconds), 0, 14400) * 1000,
      startedAt: exercise.startedAt,
      completedAt: new Date().toISOString(),
      questionCount: exercise.mode.questionCount,
      questions: exercise.mode.questions
    };
    const pending = exercise.pendingSubmission;
    $$("[data-option]", $("[data-lyrics-exercise]")).forEach(button => { button.disabled = true; });
    updateExerciseProgress();
    try {
      const row = firstRow(await rpc(CONFIG.rpc.saveAttempt, {
        p_student_token: state.session.token,
        p_attempt_id: pending.attemptId,
        p_song_id: pending.songId,
        p_mode_id: pending.modeId,
        p_exercise_version: pending.exerciseVersion,
        p_answers: pending.answers,
        p_duration_ms: pending.durationMs,
        p_started_at: pending.startedAt,
        p_completed_at: pending.completedAt
      }));
      if (!row) throw new Error("資料服務未回傳成績。");
      const attempt = validateSavedAttempt(row, pending);
      exercise.submitting = false;
      exercise.submitted = true;
      revealServerResult(exercise, attempt);
      state.attempts.unshift(normalizeAttempt({ ...row, song_title: song.title }));
      renderAttempts(); renderDashboard(); toast("成績已安全儲存。");
      $("[data-result-card]").scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      exercise.submitting = false;
      // Keep the frozen idempotent payload and choices intact: a network error
      // can occur after the database commit, so retrying must use the same UUID.
      updateExerciseProgress();
      toast(error.message || "未能儲存成績，請稍後再試。", "error");
    }
  }

  let youtubeApiPromise = null;
  function loadYouTubeApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (youtubeApiPromise) return youtubeApiPromise;
    youtubeApiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      const timeout = window.setTimeout(() => reject(new Error("YouTube 播放器載入逾時。")), 15000);
      window.onYouTubeIframeAPIReady = () => { window.clearTimeout(timeout); previous?.(); resolve(window.YT); };
      const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; script.async = true; script.onerror = () => reject(new Error("未能載入 YouTube 播放器。")); document.head.append(script);
    });
    return youtubeApiPromise;
  }

  async function mountPlayer(url) {
    const id = youtubeVideoId(url); if (!id) return;
    const shell = $("[data-youtube-shell]"); shell.replaceChildren();
    const mount = document.createElement("div"); mount.id = `song-youtube-${Date.now()}`; shell.append(mount);
    try {
      const YT = await loadYouTubeApi();
      state.player = new YT.Player(mount, {
        host: "https://www.youtube-nocookie.com", videoId: id,
        playerVars: { autoplay: 0, controls: 0, rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady() { state.playerReady = true; $("[data-player-controls]").hidden = false; },
          onStateChange(event) { state.playerState = event.data; $("[data-player-toggle]").textContent = event.data === YT.PlayerState.PLAYING ? "Ⅱ" : "▶"; }
        }
      });
    } catch (error) { toast(error.message, "error"); }
  }

  function destroyPlayer() {
    try { state.player?.destroy?.(); } catch { /* Best effort. */ }
    state.player = null; state.playerReady = false; state.playerState = null;
    const shell = $("[data-youtube-shell]");
    if (shell && !$(".youtube-placeholder", shell)) {
      const placeholder = document.createElement("div"); placeholder.className = "youtube-placeholder";
      const icon = document.createElement("span"); icon.textContent = "♪"; const title = document.createElement("strong"); title.textContent = "等待管理員加入 YouTube 連結"; const note = document.createElement("small"); note.textContent = "題目仍可先行練習及核對。"; placeholder.append(icon, title, note); shell.replaceChildren(placeholder);
    }
    $("[data-player-controls]").hidden = true;
  }

  function playPlayer(fromCountdown = false) {
    if (!state.playerReady || !state.player?.playVideo) {
      if (fromCountdown) $("[data-autoplay-note]").hidden = false;
      return;
    }
    try {
      state.player.playVideo();
      if (fromCountdown) window.setTimeout(() => { if (state.playerState !== window.YT?.PlayerState?.PLAYING) $("[data-autoplay-note]").hidden = false; }, 1200);
    } catch { $("[data-autoplay-note]").hidden = false; }
  }

  function pausePlayer() { try { state.player?.pauseVideo?.(); } catch { /* Best effort. */ } }
  function togglePlayer() {
    if (!state.playerReady) return;
    if (state.playerState === window.YT?.PlayerState?.PLAYING) pausePlayer(); else playPlayer();
  }
  function seekPlayer(delta) {
    if (!state.playerReady) return;
    try { const current = Number(state.player.getCurrentTime()) || 0; const duration = Number(state.player.getDuration()) || Infinity; state.player.seekTo(clamp(current + delta, 0, duration), true); } catch { /* Player may be transitioning. */ }
  }
  function relisten() { if (!state.playerReady) return; try { state.player.seekTo(0, true); state.player.playVideo(); $("[data-autoplay-note]").hidden = true; } catch { /* Best effort. */ } }

  async function enterAdmin() {
    showAuthenticatedHeader(state.session);
    showView("admin");
    setConnection("online", "管理模式");
    try {
      const rows = await rpc(CONFIG.rpc.adminListSongs, { p_admin_token: state.session.token });
      state.adminSongs = asArray(rows)
        .map(row => normalizeSong(row.song || row, { includeAnswers: true }))
        .map(song => validateSong(song, { requireAnswers: true }))
        .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
      renderAdminSongList();
      if (state.adminSongs.length) selectAdminSong(state.adminSongs[0].id); else newAdminSong();
    } catch (error) { toast(error.message || "未能載入管理資料。", "error"); }
  }

  function renderAdminSongList() {
    const query = normalizeSpace($("[data-admin-song-search]")?.value).toLocaleLowerCase("en");
    const holder = $("[data-admin-song-list]"); holder.replaceChildren();
    state.adminSongs.filter(song => !query || songHaystack(song).includes(query)).forEach(song => {
      const button = document.createElement("button"); button.type = "button"; button.className = "admin-song-button"; button.classList.toggle("is-active", state.adminSong?.id === song.id);
      const title = document.createElement("strong"); title.textContent = song.title; const meta = document.createElement("span"); meta.textContent = `${song.singer} · ${song.published ? "已發佈" : "未發佈"}`; button.append(title, meta); button.onclick = () => selectAdminSong(song.id); holder.append(button);
    });
  }

  function fillAdminForm(song) {
    const form = $("[data-song-form]");
    form.elements.id.value = song.id || "";
    form.elements.title.value = song.title || "";
    form.elements.singer.value = song.singer || "";
    form.elements.exerciseName.value = song.exerciseName || "";
    form.elements.youtubeUrl.value = song.youtubeUrl || "";
    form.elements.tags.value = song.tags.join(", ");
    form.elements.description.value = song.description || "";
    form.elements.published.checked = song.published !== false;
    form.elements.sortOrder.value = String(song.sortOrder || 0);
    $("[data-admin-form-title]").textContent = song.id ? `編輯：${song.title}` : "新增歌曲";
    updateAdminYouTubePreview();
  }

  async function selectAdminSong(id) {
    const song = state.adminSongs.find(item => item.id === id); if (!song) return;
    state.adminSong = song; fillAdminForm(song); renderAdminSongList();
    $("[data-access-editor]").hidden = false;
    try {
      const rows = await rpc(CONFIG.rpc.adminListStudents, { p_admin_token: state.session.token, p_song_id: song.id });
      state.adminStudents = asArray(rows).map(row => ({ id: text(row.id || row.student_id), name: text(row.name || row.student_name), allowed: row.effective_allowed !== false }));
      renderStudentAccess();
    } catch (error) { toast(error.message || "未能載入學生權限。", "error"); }
  }

  function newAdminSong() {
    state.adminSong = null; state.adminStudents = [];
    fillAdminForm({ id: "", title: "", singer: "", exerciseName: "", youtubeUrl: "", tags: [], description: "", published: false, sortOrder: state.adminSongs.length + 1 });
    $("[data-access-editor]").hidden = true; renderAdminSongList();
  }

  function updateAdminYouTubePreview() {
    const input = $("[data-song-form]").elements.youtubeUrl;
    const id = youtubeVideoId(input.value);
    const status = $("[data-youtube-validation]"); const preview = $("[data-youtube-preview]");
    input.setCustomValidity(input.value.trim() && !id ? "請貼上有效的 YouTube 連結。" : "");
    status.textContent = input.value.trim() && !id ? "未能辨認這個 YouTube 連結。" : id ? "已辨認影片；縮圖會自動顯示。" : "留空亦可，稍後再加入。";
    preview.replaceChildren(); preview.hidden = !id;
    if (id) { const image = new Image(); image.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; image.alt = "YouTube 影片縮圖預覽"; image.referrerPolicy = "no-referrer"; preview.append(image); }
  }

  async function saveAdminSong(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const existing = state.adminSong;
    const id = normalizeSpace(form.elements.id.value) || null;
    const slug = existing?.slug || `${normalizeSpace(form.elements.title.value).toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "song"}-${Date.now()}`;
    const payload = {
      id, slug,
      title: normalizeSpace(form.elements.title.value),
      singer: normalizeSpace(form.elements.singer.value),
      exerciseName: normalizeSpace(form.elements.exerciseName.value),
      description: text(form.elements.description.value).trim(),
      youtubeUrl: text(form.elements.youtubeUrl.value).trim(),
      tags: text(form.elements.tags.value).split(",").map(normalizeSpace).filter(Boolean),
      published: form.elements.published.checked,
      sortOrder: Number(form.elements.sortOrder.value) || 0,
      translations: existing?.translations || [],
      modes: existing?.modes || []
    };
    const status = $("[data-admin-save-status]"); status.textContent = "正在儲存⋯";
    try {
      const row = firstRow(await rpc(CONFIG.rpc.adminUpsertSong, {
        p_admin_token: state.session.token,
        p_id: payload.id,
        p_slug: payload.slug,
        p_title: payload.title,
        p_singer: payload.singer,
        p_exercise_name: payload.exerciseName,
        p_description: payload.description,
        p_youtube_url: payload.youtubeUrl || null,
        p_tags: payload.tags,
        p_translations: payload.translations,
        p_exercises: payload.modes,
        p_published: payload.published,
        p_sort_order: payload.sortOrder
      }));
      if (!row?.id) throw new Error("資料服務未確認歌曲已儲存。");
      const saved = validateSong(normalizeSong(row.song || row, { includeAnswers: true }), { requireAnswers: true });
      state.adminSongs = state.adminSongs.some(item => item.id === saved.id) ? state.adminSongs.map(item => item.id === saved.id ? saved : item) : [...state.adminSongs, saved];
      state.adminSong = saved; renderAdminSongList(); fillAdminForm(saved); status.textContent = "已儲存"; toast("歌曲資料已儲存。");
      if (saved.id) await selectAdminSong(saved.id);
    } catch (error) { status.textContent = "儲存失敗"; toast(error.message || "未能儲存歌曲。", "error"); }
  }

  function renderStudentAccess() {
    const query = normalizeSpace($("[data-student-access-search]")?.value).toLocaleLowerCase("en");
    const holder = $("[data-student-access-list]"); holder.replaceChildren();
    state.adminStudents.filter(student => !query || student.name.toLocaleLowerCase("en").includes(query)).forEach(student => {
      const row = document.createElement("div"); row.className = "student-access-row";
      const copy = document.createElement("div"); const name = document.createElement("strong"); name.textContent = student.name; const note = document.createElement("small"); note.textContent = student.allowed ? "可開啟此歌曲" : "此歌曲已被移除"; copy.append(name, note);
      const label = document.createElement("label"); label.className = "access-switch"; label.setAttribute("aria-label", `${student.name} 歌曲存取權`);
      const input = document.createElement("input"); input.type = "checkbox"; input.checked = student.allowed;
      const visual = document.createElement("span"); label.append(input, visual);
      input.addEventListener("change", async () => {
        input.disabled = true;
        try {
          const saved = firstRow(await rpc(CONFIG.rpc.adminSetAccess, { p_admin_token: state.session.token, p_song_id: state.adminSong.id, p_student_id: student.id, p_allowed: input.checked }));
          if (!saved || text(saved.student_id) !== student.id || text(saved.song_id) !== state.adminSong.id || saved.effective_allowed !== input.checked) throw new Error("資料服務未確認學生權限已更新。");
          student.allowed = input.checked; note.textContent = student.allowed ? "可開啟此歌曲" : "此歌曲已被移除"; toast(`${student.name} 的權限已更新。`);
        } catch (error) { input.checked = student.allowed; toast(error.message || "未能更新權限。", "error"); }
        finally { input.disabled = false; }
      });
      row.append(copy, label); holder.append(row);
    });
  }

  function bindInteractions() {
    $("[data-logout]").addEventListener("click", logout);
    $$("[data-route]").forEach(button => button.addEventListener("click", () => routeStudent(button.dataset.route)));
    $$("[data-song-tab]").forEach(button => button.addEventListener("click", () => switchSongTab(button.dataset.songTab)));
    $$("[data-open-tab]").forEach(button => button.addEventListener("click", () => switchSongTab(button.dataset.openTab)));
    $("[data-song-search]").addEventListener("input", event => { $("[data-clear-search]").hidden = !event.target.value; renderLibrary(); });
    $("[data-clear-search]").addEventListener("click", () => { $("[data-song-search]").value = ""; $("[data-clear-search]").hidden = true; renderLibrary(); $("[data-song-search]").focus(); });
    $("[data-dashboard-toggle]").addEventListener("click", () => setDashboardExpanded($("[data-dashboard-toggle]").getAttribute("aria-expanded") !== "true"));
    document.addEventListener("selectionchange", () => { if (state.activeTab === "translation") updateSelectedPhrase(); });
    $("[data-bookmark-selection]").addEventListener("click", () => { const phrase = state.selectedPhrase || selectedPhrase(); if (phrase) addBookmark({ ...phrase, kind: "phrase" }); });
    $$("[data-bookmark-filter]").forEach(button => button.addEventListener("click", () => { state.bookmarkFilter = button.dataset.bookmarkFilter; $$("[data-bookmark-filter]").forEach(item => item.classList.toggle("is-active", item === button)); renderBookmarks(); }));
    $("[data-player-toggle]").addEventListener("click", togglePlayer);
    $$("[data-seek]").forEach(button => button.addEventListener("click", () => seekPlayer(Number(button.dataset.seek))));
    $("[data-relisten]").addEventListener("click", relisten);
    $("[data-result-relisten]").addEventListener("click", relisten);
    $("[data-change-mode]").addEventListener("click", resetExercise);
    $("[data-try-again]").addEventListener("click", () => startExercise(state.exercise?.mode.id));
    $("[data-submit-exercise]").addEventListener("click", submitExercise);
    $("[data-new-song]").addEventListener("click", newAdminSong);
    $("[data-admin-song-search]").addEventListener("input", renderAdminSongList);
    $("[data-song-form]").addEventListener("submit", saveAdminSong);
    $("[data-song-form]").elements.youtubeUrl.addEventListener("input", updateAdminYouTubePreview);
    $("[data-archive-song]").addEventListener("click", () => { const form = $("[data-song-form]"); form.elements.published.checked = false; form.requestSubmit(); });
    $("[data-student-access-search]").addEventListener("input", renderStudentAccess);
    document.addEventListener("visibilitychange", () => { if (!state.exercise || state.exercise.submitted) return; if (document.hidden) pauseExerciseClock(); else if (state.activeRoute === "song" && state.activeTab === "exercise") startExerciseClock(); });
    window.addEventListener("pagehide", pauseExerciseClock);
  }

  async function boot() {
    loginTabs(); bindLoginForms(); bindInteractions();
    try {
      if (!window.supabase?.createClient || !SUPABASE.url || !SUPABASE.anonKey) throw new Error("Supabase 設定未完成。");
      state.client = window.supabase.createClient(SUPABASE.url, SUPABASE.anonKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { headers: { "X-Client-Info": "edmund-song-appreciation/1.0" } } });
      setConnection("online", "已連接");
      const stored = readSession();
      if (stored) {
        const session = await validateSession(stored);
        if (session) {
          saveSession(session);
          if (session.role === "admin") await enterAdmin(); else await enterStudent();
          setDashboardExpanded(readDashboardExpanded());
          return;
        }
        clearSession();
      }
      showView("login"); offerUniversalSession();
    } catch (error) {
      setConnection("offline", "未能連接");
      showView("login");
      const status = $("[data-login-status=student]"); status.textContent = text(error?.message || "未能連接資料服務。");
      offerUniversalSession();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  window.EdmundSongAppreciation = Object.freeze({
    youtubeVideoId,
    normalizeSong,
    validateSong,
    dailyAttemptSeries,
    formatDuration
  });
})();
