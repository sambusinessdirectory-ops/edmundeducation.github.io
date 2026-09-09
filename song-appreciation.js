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
    playbackDaily: [],
    drafts: {},
    textSizes: {translation:1,exercise:1},
    showChinese: false,
    favoritesOnly: false,
    draftSaveTimer: 0,
    playerGeneration: 0,
    bookmarkFilter: "all",
    questionRange: 30,
    timeRange: 30,
    selectedPhrase: null,
    exercise: null,
    player: null,
    playerReady: false,
    playerState: null,
    playerSyncTimer: 0,
    playbackStarted: 0,
    playbackPending: 0,
    playbackSave: null,
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
      promptZh: text(question?.promptZh || question?.prompt_zh),
      optionsZh: asArray(question?.optionsZh || question?.options_zh).map(text),
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

  function normalizePlayback(row) {
    return { day: text(row?.activity_date || row?.day), seconds: Number(row?.seconds || row?.duration_seconds || 0) };
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
    if (state.exercise && !state.exercise.submitted) { pauseExerciseClock(); storeLocalDraft(); try { await flushDraft(); } catch { /* Scoped local backup retries on return. */ } }
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
    state.drafts = {};
    state.exercise = null;
    state.selectedPhrase = null;
    clearTimeout(state.draftSaveTimer);
    updateFloatingPlayer();
    $("[data-signed-in-user]").hidden = true;
    $("[data-logout]").hidden = true;
    $("[data-student-nav]").hidden = true;
    showView("login");
    offerUniversalSession();
  }

  async function loadStudentData() {
    const token = state.session.token;
    const [songRows, bookmarkRows, attemptRows, draftRows, playbackRows] = await Promise.all([
      rpc(CONFIG.rpc.listSongs, { p_student_token: token }),
      fetchAllPages(CONFIG.rpc.listBookmarks, { p_student_token: token, p_song_id: null }),
      fetchAllPages(CONFIG.rpc.listAttempts, { p_student_token: token, p_song_id: null }),
      rpc(CONFIG.rpc.listDrafts, {p_student_token:token}),
      rpc(CONFIG.rpc.listPlayback, {p_student_token:token})
    ]);
    if (state.session?.token !== token) return;
    state.drafts = Object.fromEntries(asArray(draftRows).map(row=>[draftIdentity(row.song_id,row.mode_id),row]));
    state.songs = asArray(songRows)
      .map(row => normalizeSong(row.song || row, { includeAnswers: false }))
      .map(song => validateSong(song, { requireAnswers: false }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    state.bookmarks = asArray(bookmarkRows).map(normalizeBookmark);
    state.attempts = asArray(attemptRows).map(normalizeAttempt);
    state.playbackDaily = asArray(playbackRows).map(normalizePlayback);
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
    if (valid !== "song") { cancelReadCountdown(); pausePlayer(); pauseExerciseClock(); storeLocalDraft(); void flushDraft().catch(()=>{}); }
    else if (state.activeTab === "exercise") startExerciseClock();
    if (valid === "bookmarks") renderBookmarks();
    if (valid === "progress") renderAttempts();
    if (valid === "library") renderLibrary();
    updateFloatingPlayer();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderLibrary() {
    const query = normalizeSpace($("[data-song-search]")?.value).toLocaleLowerCase("en");
    const songs = state.songs.filter(song => (!query || songHaystack(song).includes(query)) && (!state.favoritesOnly || songIsFavorite(song.id)));
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
    article.tabIndex = 0;
    article.setAttribute("role", "link");
    article.setAttribute("aria-label", `開啟 ${song.title}`);
    article.addEventListener("click", event => { if (!event.target.closest("button")) openSong(song.id); });
    article.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openSong(song.id); } });
    const progress=songProgress(song.id); if(progress)article.classList.add(`is-${progress}`);
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
    if(progress){const status=document.createElement("small");status.className="song-card__status";status.textContent=progress==="completed"?"✓ 已完成練習":"◷ 練習進行中";body.append(status);}
    const favorite=document.createElement("button");favorite.type="button";favorite.className="song-favorite";favorite.textContent=songIsFavorite(song.id)?"★ 已收藏":"☆ 收藏歌曲";favorite.setAttribute("aria-pressed",String(songIsFavorite(song.id)));favorite.addEventListener("click",event=>{event.stopPropagation();toggleFavorite(song);});
    const open = document.createElement("button");
    open.type = "button";
    open.textContent = "開始賞析 →";
    open.addEventListener("click", event => { event.stopPropagation(); openSong(song.id); });
    article.append(thumb, favorite, body, open);
    return article;
  }

  async function openSong(songId, tab = "description") {
    const requestId=state.songOpenGeneration=(state.songOpenGeneration||0)+1;
    if (state.session?.role !== "student" || !state.session.token) {
      toast("請先登入學生帳戶。", "error");
      return;
    }
    if (!state.songs.some(item => item.id === songId)) return;
    try {
      if(state.exercise && !state.exercise.submitted) await flushDraft();
      const token=state.session.token;
      // Always re-authorize and fetch protected translations/questions from the
      // server. The public catalogue and shipped JavaScript contain metadata only.
      const row = firstRow(await rpc(CONFIG.rpc.getSong, { p_student_token: state.session.token, p_song_id: songId }));
      if(state.session?.token!==token || state.songOpenGeneration!==requestId)return;
      if (!row) throw new Error("你目前未獲授權開啟這首歌。");
      const song = validateSong(normalizeSong(row.song || row, { includeAnswers: false }), { requireAnswers: false });
      if (!song.translations.length || !song.modes.some(mode => mode.questions.length)) throw new Error("這首歌的練習資料尚未完成。");
      pausePlayer();
      await flushPlayback();
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
    destroyPlayer();
    if (youtubeVideoId(song.youtubeUrl)) mountPlayer(song.youtubeUrl);
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
    $("[data-song-player]").hidden = valid === "description";
    if (valid === "description") { cancelReadCountdown(); pausePlayer(); pauseExerciseClock(); storeLocalDraft(); void flushDraft().catch(()=>{}); }
    else if (valid === "translation") { cancelReadCountdown(); pauseExerciseClock(); storeLocalDraft(); void flushDraft().catch(()=>{}); }
    else {
      if (state.exercise?.locked && youtubeVideoId(state.activeSong?.youtubeUrl) && !state.countdownTimer) startReadCountdown();
      startExerciseClock();
    }
    updateFloatingPlayer();
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
        span.addEventListener("click", () => { if(window.getSelection?.()?.toString().trim()) {updateSelectedPhrase();return;} addBookmark({kind:"word",excerpt:piece,lineId}); });
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
        tr.dataset.lineId = row.lineId;
        tr.dataset.syncIndex = String(body.querySelectorAll("tr:not(.is-break)").length);
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
    columns.append(translationTable(song.translations, 0));
    $("[data-bookmark-selection]").disabled = true;
    $("[data-bookmark-selection]").hidden = true;
    $("[data-selection-status]").textContent = "";
    state.selectedPhrase = null;
  }

  function selectedPhrase() {
    const selection=window.getSelection?.();
    if(!selection || selection.isCollapsed || !selection.rangeCount)return null;
    const range=selection.getRangeAt(0), panel=$('[data-translation-columns]');
    if(!panel.contains(range.startContainer)||!panel.contains(range.endContainer))return null;
    const parts=[],lineIds=[];
    $$('[data-translation-english]',panel).forEach(cell=>{
      if(!range.intersectsNode(cell))return;
      const words=$$('.lyric-word',cell).filter(word=>range.intersectsNode(word));
      const part=normalizeSpace(words.map(word=>word.dataset.word).join(' '));if(part){parts.push(part);lineIds.push(cell.dataset.lineId);}
    });
    const excerpt=parts.join(' ');return excerpt && excerpt.length<=20000?{excerpt,lineId:lineIds[0],lineIds}:null;
  }

  function updateSelectedPhrase(point) {
    const phrase = selectedPhrase();
    state.selectedPhrase = phrase;
    const button = $("[data-bookmark-selection]");
    button.disabled = !phrase;
    button.hidden = !phrase;
    if (phrase) {
      const range=window.getSelection().getRangeAt(0),rect=range.getBoundingClientRect();
      const x=point?.clientX ?? rect.right, y=point?.clientY ?? rect.bottom;
      button.style.left=`${clamp(x,70,window.innerWidth-70)}px`;
      button.style.top=`${clamp(y+14,18,window.innerHeight-50)}px`;
    }
    $("[data-selection-status]").textContent = phrase ? `已選取：「${phrase.excerpt}」` : "";
  }

  function normalizeBookmark(row) {
    return {
      id: text(row?.id),
      songId: text(row?.song_id || row?.songId),
      songTitle: text(row?.song_title || row?.songTitle),
      singer: text(row?.singer),
      lineId: text(row?.line_id || row?.lineId || row?.source_locator?.lineId || row?.source_locator?.line_id),
      kind: ["phrase","song"].includes(row?.kind) ? row.kind : "word",
      excerpt: text(row?.excerpt || row?.selected_text || row?.bookmark_text),
      normalizedText: text(row?.normalized_text || normalizeSpace(row?.excerpt || row?.selected_text || row?.bookmark_text).toLocaleLowerCase("en")),
      createdAt: row?.created_at || new Date().toISOString()
    };
  }

  async function addBookmark(input) {
    const song = input.song || state.activeSong;
    const token=state.session?.token;
    const excerpt = normalizeSpace(input.excerpt);
    if (!song || !excerpt) return;
    const normalized = excerpt.toLocaleLowerCase("en");
    if (state.bookmarks.some(item => item.songId === song.id && item.kind === input.kind && item.normalizedText === normalized)) {
      toast("這項內容已在你的書籤內。", "error");
      return;
    }
    try {
      const sourceText = (song.translations.find(row => !row.break && row.lineId === text(input.lineId))?.english || "").slice(0,1500);
      const row = firstRow(await rpc(CONFIG.rpc.addBookmark, {
        p_student_token: state.session.token,
        p_song_id: song.id,
        p_kind: input.kind,
        p_bookmark_text: excerpt,
        p_source_text: sourceText,
        p_source_locator: { lineId: text(input.lineId), lineIds:input.lineIds||[] }
      }));
      if (!row?.id || text(row.song_id) !== song.id) throw new Error("資料服務未確認書籤已儲存。");
      if(state.session?.token!==token)return;
      state.bookmarks=state.bookmarks.filter(b=>b.id!==text(row.id));
      state.bookmarks.unshift(normalizeBookmark({ ...row, song_title: song.title, singer: song.singer }));
      if(state.activeSong?.id===song.id)renderTranslations(song);
      renderBookmarks(); renderLibrary();
      window.getSelection?.().removeAllRanges?.();
      toast(input.kind === "song" ? "歌曲已加入收藏。" : input.kind === "phrase" ? "片語已加入書籤。" : "單字已加入書籤。");
    } catch (error) { toast(error.message || "未能儲存書籤。", "error"); }
  }

  async function deleteBookmark(id) {
    const token=state.session?.token;
    try {
      const deleted = await rpc(CONFIG.rpc.deleteBookmark, { p_student_token: state.session.token, p_bookmark_id: id });
      if (deleted !== true) throw new Error("資料服務未確認書籤已移除。");
      if(state.session?.token!==token)return;
      state.bookmarks = state.bookmarks.filter(item => item.id !== id);
      renderLibrary();
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
      const kind = document.createElement("span"); kind.textContent = item.kind === "song" ? "SONG · 歌曲" : item.kind === "phrase" ? "PHRASE · 片語" : "WORD · 單字";
      const excerpt = document.createElement("strong"); excerpt.textContent = item.excerpt;
      const source = document.createElement("p"); source.textContent = `來源：${item.songTitle || state.songs.find(song => song.id === item.songId)?.title || "歌曲"}${item.singer ? ` · ${item.singer}` : ""}`;
      const footer = document.createElement("footer");
      const open = document.createElement("button"); open.type = "button"; open.textContent = "查看原文"; open.onclick = () => openSong(item.songId, item.kind === "song" ? "exercise" : "translation");
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
    if (field === "time") {
      state.playbackDaily.forEach(item => {
        const date = safeDate(`${item.day}T12:00:00`);
        if (!date || (start && date < start)) return;
        grouped.set(item.day, (grouped.get(item.day) || 0) + item.seconds);
      });
    } else state.attempts.forEach(attempt => {
      const date = safeDate(attempt.completedAt);
      if (!date || (start && date < start)) return;
      const key = localDayKey(date);
      grouped.set(key, (grouped.get(key) || 0) + attempt.totalQuestions);
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
    exercise.mode.questions.forEach((question, questionIndex) => {
      const card = document.createElement("article"); card.className = "exercise-line"; card.dataset.question = String(question.number);
      card.dataset.syncIndex = String(questionIndex);
      if (Object.prototype.hasOwnProperty.call(exercise.answers, question.number)) card.classList.add("is-answered");
      const prompt = document.createElement("div"); prompt.className = "exercise-prompt";
      const [before, after] = promptParts(question.prompt); prompt.append(document.createTextNode(before));
      const blank = document.createElement("span"); blank.className = "blank-number"; blank.textContent = String(question.number); prompt.append(blank, document.createTextNode(after));
      const choices = document.createElement("div"); choices.className = "choice-grid"; choices.setAttribute("role", "radiogroup"); choices.setAttribute("aria-label", `第 ${question.number} 題`);
      question.options.forEach((option, index) => {
        const selected = exercise.answers[question.number] === option;
        const button = document.createElement("button"); button.type = "button"; button.className = "choice-button"; button.classList.toggle("is-selected", selected); button.dataset.option = option; button.setAttribute("role", "radio"); button.setAttribute("aria-checked", String(selected)); button.disabled = exercise.locked || exercise.submitted || exercise.submitting || exercise.checking || Boolean(exercise.pendingSubmission) || exercise.conflict || Boolean(exercise.results?.[question.number]);
        const letter = document.createElement("b"); letter.textContent = String.fromCharCode(65 + index); const label = document.createElement("span"); label.textContent = option; button.append(letter, label);
        if(state.showChinese && question.optionsZh[index]){const zh=document.createElement("small");zh.className="choice-translation";zh.textContent=question.optionsZh[index];label.append(zh);}
        button.addEventListener("click", () => chooseAnswer(question.number, option)); choices.append(button);
      });
      card.append(prompt);
      if(state.showChinese && question.promptZh){const zh=document.createElement("p");zh.className="question-translation";zh.textContent=question.promptZh;card.append(zh);}
      card.append(choices); holder.append(card);
    });
    applyCheckedResults();
    updateExerciseProgress();
  }

  async function startExercise(modeId) {
    const startGeneration=state.exerciseStartGeneration=(state.exerciseStartGeneration||0)+1;
    const song = state.activeSong;
    const mode = song?.modes.find(item => item.id === modeId);
    if (!song || !mode) return;
    if(state.exercise && !state.exercise.submitted){try{await flushDraft();}catch(error){toast("請先同步或載入雲端進度，再切換難度。","error");return;}}
    if(state.activeSong!==song || state.exerciseStartGeneration!==startGeneration)return;
    resetExercise();
    const draft=draftForMode(song.id,mode);
    state.exercise = { songId:song.id,ownerId:state.session.id,mode, answers: {...(draft?.answers||{})},results:draft?.result||{},revision:Number(draft?.revision||0),dirty:Boolean(draft?.dirty),pendingDraft:draft?.pending||null,pendingSubmission:draft?.pendingSubmission||null,editSequence:draft?.editSequence||0,conflict:Boolean(draft?.conflict), locked: Boolean(youtubeVideoId(song.youtubeUrl)), submitted: false, startedAt: draft?.started_at||new Date().toISOString(), activeSeconds: Number(draft?.duration_ms||0)/1000, clockStarted: 0 };
    $("[data-mode-grid]").hidden = true;
    $("[data-exercise-stage]").hidden = false;
    $("[data-mode-title]").textContent = `${mode.label} · ${mode.questionCount} 題`;
    $("[data-relisten]").hidden = false;
    renderExerciseQuestions();
    if(draft?.needsReset){state.exercise.dirty=true;try{await flushDraft("reset");}catch{toast("請連線後重設已完成的練習。","error");return;}}
    startExerciseClock();
    setDraftStatus(draft?"已恢復上次的練習進度":"選擇答案後會自動儲存。");
    if(state.exercise.dirty || state.exercise.pendingDraft)void flushDraft().catch(()=>{});
    if (youtubeVideoId(song.youtubeUrl)) {
      startReadCountdown();
    } else {
      state.exercise.locked = false;
      renderExerciseQuestions();
    }
    $("[data-exercise-stage]").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetExercise() {
    storeLocalDraft(); clearTimeout(state.draftSaveTimer);
    stopExerciseTimers();
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
    state.exerciseTimer = window.setInterval(() => { updateExerciseProgress();const e=state.exercise;if(e && Object.keys(e.answers).length && Date.now()-(e.lastDraftTick||0)>15000){e.lastDraftTick=Date.now();queueDraftSave();}}, 1000);
  }

  function pauseExerciseClock() {
    if (!state.exercise?.clockStarted) return;
    state.exercise.activeSeconds += Math.max(0, (performance.now() - state.exercise.clockStarted) / 1000);
    state.exercise.clockStarted = 0;
    window.clearInterval(state.exerciseTimer); state.exerciseTimer = 0;
    if(Object.keys(state.exercise.answers).length && !state.exercise.submitted)queueDraftSave();
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
    if (!exercise || exercise.locked || exercise.submitted || exercise.submitting || exercise.checking || exercise.pendingSubmission || exercise.results?.[number] || exercise.conflict) return;
    exercise.answers[number] = option;
    queueDraftSave();
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
    $("[data-submit-exercise]").disabled = exercise.submitted || exercise.submitting || exercise.checking || exercise.conflict || answered !== exercise.mode.questionCount;
    $("[data-check-partial]").disabled=exercise.locked||exercise.submitted||exercise.submitting||exercise.checking||exercise.conflict||Boolean(exercise.pendingSubmission)||answered<=Object.keys(exercise.results||{}).length;
    $("[data-reset-answers]").disabled=exercise.submitted||exercise.submitting||exercise.checking||Boolean(exercise.pendingSubmission);
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
    try{await flushDraft();}catch{toast("請先同步進度後再提交。","error");return;}
    if(state.exercise!==exercise || exercise.submitting || exercise.submitted)return;
    const token=state.session.token;
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
    storeLocalDraft(exercise);
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
      if(state.session?.token!==token || state.exercise!==exercise)return;
      const attempt = validateSavedAttempt(row, pending);
      exercise.submitting = false;
      exercise.submitted = true;
      exercise.results=attempt.results;
      const backups=readLocalDrafts();delete backups[draftIdentity(song.id,exercise.mode.id)];try{localStorage.setItem(studyStorageKey(),JSON.stringify(backups));}catch{}
      revealServerResult(exercise, attempt);
      state.attempts.unshift(normalizeAttempt({ ...row, song_title: song.title }));
      renderAttempts(); renderDashboard(); renderLibrary(); toast("成績已安全儲存。");
      $("[data-result-card]").scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      if(state.session?.token!==token || state.exercise!==exercise)return;
      exercise.submitting = false;
      // Keep the frozen idempotent payload and choices intact: a network error
      // can occur after the database commit, so retrying must use the same UUID.
      updateExerciseProgress();
      toast(error.message || "未能儲存成績，請稍後再試。", "error");
    }
  }

  function studyStorageKey() { return `edmund-song-drafts-v1:${state.session?.id || ''}`; }
  function draftIdentity(songId, modeId) { return `${songId}/${modeId}`; }
  function readLocalDrafts() { try { return JSON.parse(localStorage.getItem(studyStorageKey()) || '{}'); } catch { return {}; } }
  function storeLocalDraft(exercise = state.exercise) {
    if (!exercise || exercise.submitted || !state.session?.id || exercise.ownerId !== state.session.id) return;
    const drafts = readLocalDrafts();
    drafts[draftIdentity(exercise.songId, exercise.mode.id)] = {
      song_id: exercise.songId, mode_id: exercise.mode.id, exercise_version: exercise.mode.version,
      answers: exercise.answers, result: exercise.results, revision: exercise.revision,
      duration_ms: Math.round(elapsedExerciseSeconds(exercise) * 1000), started_at: exercise.startedAt,
      dirty: exercise.dirty, pending: exercise.pendingDraft ? {...exercise.pendingDraft,args:{...exercise.pendingDraft.args,p_student_token:undefined}} : null, pendingSubmission: exercise.pendingSubmission,
      editSequence: exercise.editSequence
    };
    try { localStorage.setItem(studyStorageKey(), JSON.stringify(drafts)); }
    catch { setDraftStatus('此瀏覽器無法保留離線備份；請保持連線並確認已儲存。', true); }
  }
  function elapsedExerciseSeconds(exercise) { return Math.min(14400, exercise.activeSeconds + (exercise.clockStarted ? Math.max(0,(performance.now()-exercise.clockStarted)/1000) : 0)); }
  function setDraftStatus(message, error = false) { const el=$('[data-draft-status]'); if(el) {el.textContent=message;el.dataset.state=error?'error':'saved';const reload=$('[data-reload-draft]');if(reload)reload.hidden=!state.exercise?.conflict;} }
  function draftForMode(songId, mode) {
    const id=draftIdentity(songId,mode.id), remote=state.drafts[id], local=readLocalDrafts()[id];
    if (local?.exercise_version===mode.version && (local.dirty || local.pending || local.pendingSubmission)) {
      // A newer remote revision must be reconciled explicitly, never silently overwritten.
      return {...local, conflict: Boolean(remote && remote.revision>local.revision && remote.mutation_id!==local.pending?.args?.p_mutation_id)};
    }
    if(remote?.exercise_version!==mode.version)return null;
    if(state.attempts.some(a=>a.songId===songId && a.mode===mode.id && new Date(a.startedAt).valueOf()===new Date(remote.started_at).valueOf()))
      return {...remote,answers:{},result:{},duration_ms:0,started_at:new Date().toISOString(),needsReset:true};
    return remote;
  }
  function queueDraftSave() {
    const exercise=state.exercise;
    if(!exercise || exercise.submitted) return;
    exercise.dirty=true; exercise.editSequence+=1; storeLocalDraft(exercise);
    setDraftStatus('正在儲存…'); clearTimeout(state.draftSaveTimer);
    state.draftSaveTimer=setTimeout(()=>flushDraft().catch(()=>{}),350);
  }
  async function flushDraft(action='save') {
    const exercise=state.exercise, session=state.session;
    if(!exercise || exercise.submitted || session?.role!=='student')return;
    while(exercise.savePromise) { await exercise.savePromise; if(state.exercise!==exercise)return; }
    if(exercise.conflict) {setDraftStatus('其他裝置有較新的進度。請重新載入雲端進度後再繼續。',true);throw new Error('Draft conflict');}
    const current=()=>state.session?.id===session.id && state.session?.token===session.token && state.exercise===exercise;
    const send=async pending=>{
      const row=firstRow(await rpc(CONFIG.rpc.saveDraft,{...pending.args,p_student_token:session.token}));
      if(!row || row.song_id!==exercise.songId || row.mode_id!==exercise.mode.id || row.mutation_id!==pending.args.p_mutation_id || !Number.isFinite(Number(row.revision)))throw new Error('資料服務未確認進度已儲存。');
      if(Object.keys(row.answers||{}).length!==Object.keys(pending.args.p_answers).length || Object.entries(pending.args.p_answers).some(([k,v])=>row.answers?.[k]!==v))throw new Error('儲存回應的答案不一致。');
      for(const [k,result] of Object.entries(row.result||{})) {const q=exercise.mode.questions.find(q=>String(q.number)===k);if(!q||result.selected!==pending.args.p_answers[k]||!q.options.includes(result.answer)||typeof result.correct!=='boolean'||result.correct!==(result.selected===result.answer))throw new Error('核對回應無效。');}
      if(!current())return;
      exercise.revision=Number(row.revision);exercise.results=row.result||{};exercise.pendingDraft=null;
      exercise.dirty=exercise.editSequence!==pending.sequence;
      state.drafts[draftIdentity(exercise.songId,exercise.mode.id)]=row;
      storeLocalDraft(exercise);
      setDraftStatus(exercise.dirty?'正在儲存最新選擇…':'✓ 進度已儲存，可登出後繼續');
    };
    const run=async()=>{
      if(exercise.pendingDraft) await send(exercise.pendingDraft);
      if(!current())return;
      if(!exercise.dirty && action==='save')return;
      const pending={sequence:exercise.editSequence,args:{
        p_student_token:session.token,p_song_id:exercise.songId,p_mode_id:exercise.mode.id,
        p_exercise_version:exercise.mode.version,p_answers:{...exercise.answers},
        p_duration_ms:Math.round(elapsedExerciseSeconds(exercise)*1000),p_started_at:exercise.startedAt,
        p_expected_revision:exercise.revision,p_mutation_id:crypto.randomUUID(),p_action:action
      }};
      exercise.pendingDraft=pending;storeLocalDraft(exercise);await send(pending);
    };
    exercise.savePromise=run().catch(error=>{
      if(current()) { if(error.code==='40001')exercise.conflict=true;storeLocalDraft(exercise);setDraftStatus(error.code==='40001'?'另一裝置已更新進度；請載入雲端版本。':'尚未同步；答案已保留在此裝置，連線後會重試。',true); }
      throw error;
    }).finally(()=>{exercise.savePromise=null;if(current() && exercise.dirty && !exercise.pendingDraft && !exercise.conflict) {clearTimeout(state.draftSaveTimer);state.draftSaveTimer=setTimeout(()=>flushDraft().catch(()=>{}),350);}});
    return exercise.savePromise;
  }
  function applyCheckedResults() {
    const exercise=state.exercise;if(!exercise)return;
    exercise.mode.questions.forEach(question=>{
      const result=exercise.results?.[question.number];if(!result)return;
      const card=$(`[data-question="${question.number}"]`);if(!card)return;
      card.classList.add(result.correct?'is-correct':'is-incorrect');
      $$('[data-option]',card).forEach(button=>{button.disabled=true;button.classList.toggle('is-correct',button.dataset.option===result.answer);button.classList.toggle('is-wrong',button.dataset.option===result.selected&&!result.correct);});
      $('.answer-feedback',card)?.remove();const feedback=document.createElement('span');feedback.className='answer-feedback';feedback.textContent=result.correct?'✓ 正確':`答案：${result.answer}`;card.append(feedback);
    });
  }
  async function checkPartialAnswers() {
    const exercise=state.exercise;if(!exercise || exercise.submitted || exercise.checking || exercise.locked)return;
    exercise.checking=true;renderExerciseQuestions();
    try {await flushDraft('check');if(state.exercise===exercise){renderExerciseQuestions();toast('已核對已作答題目；其餘題目可繼續。');}}
    catch(error){toast(error.message||'未能核對答案，請重試。','error');}
    finally{exercise.checking=false;if(state.exercise===exercise){renderExerciseQuestions();updateExerciseProgress();}}
  }
  async function resetDraftAnswers() {
    const exercise=state.exercise;if(!exercise || exercise.submitted || exercise.checking || exercise.submitting)return;
    if(!window.confirm('重設這次尚未完成的答案及核對結果？已完成的練習紀錄會保留。'))return;
    try {
      await flushDraft();
      exercise.checking=true;exercise.answers={};exercise.results={};exercise.pendingSubmission=null;exercise.editSequence+=1;exercise.dirty=true;exercise.activeSeconds=0;exercise.startedAt=new Date().toISOString();exercise.clockStarted=performance.now();
      storeLocalDraft(exercise);await flushDraft('reset');toast('未完成答案已重設。');
    } catch(error){toast(error.message||'未能重設，請連線後重試。','error');}
    finally{exercise.checking=false;if(state.exercise===exercise)renderExerciseQuestions();}
  }
  async function reloadCloudDraft() {
    const exercise=state.exercise;if(!exercise)return;
    if(!window.confirm('載入雲端版本？此裝置尚未同步的選擇將被雲端進度取代。'))return;
    try{const rows=await rpc(CONFIG.rpc.listDrafts,{p_student_token:state.session.token});state.drafts=Object.fromEntries(asArray(rows).map(row=>[draftIdentity(row.song_id,row.mode_id),row]));const saved=readLocalDrafts();delete saved[draftIdentity(exercise.songId,exercise.mode.id)];localStorage.setItem(studyStorageKey(),JSON.stringify(saved));exercise.submitted=true;startExercise(exercise.mode.id);}catch(error){toast(error.message,'error');}
  }
  function songIsFavorite(songId) { return state.bookmarks.some(b=>b.kind==='song' && b.songId===songId); }
  async function toggleFavorite(song) {
    const existing=state.bookmarks.find(b=>b.kind==='song'&&b.songId===song.id);
    if(existing){await deleteBookmark(existing.id);return;}
    await addBookmark({kind:'song',excerpt:song.title,lineId:'',song});
  }
  function songProgress(songId) {
    if(state.attempts.some(a=>a.songId===songId))return 'completed';
    const rows=[...Object.values(state.drafts),...Object.values(readLocalDrafts())];
    return rows.some(d=>d.song_id===songId&&Object.keys(d.answers||{}).length)?'in-progress':'';
  }
  function setTextSize(scope, selected) {
    const value=clamp(Number(selected)||1,.75,3);
    state.textSizes[scope]=value;document.documentElement.style.setProperty(`--${scope}-scale`,String(value));
  }
  function clockLabel(seconds) { const total=Math.max(0,Math.floor(Number(seconds)||0));return `${Math.floor(total/60)}:${String(total%60).padStart(2,'0')}`; }
  function syncLyricsToPlayback() {
    if(!state.playerReady)return;
    let current=0,duration=0;
    try{current=Number(state.player.getCurrentTime())||0;duration=Number(state.player.getDuration())||0;}catch{return;}
    $$('[data-player-current]').forEach(node=>node.textContent=clockLabel(current));
    $$('[data-player-duration]').forEach(node=>node.textContent=clockLabel(duration));
    $$('[data-player-timeline]').forEach(input=>{if(document.activeElement!==input){input.max=String(Math.max(duration,1));input.value=String(clamp(current,0,Math.max(duration,1)));}});
    const progress=duration>0?clamp(current/duration,0,.999999):0;
    const rows=$$('.translation-table tr[data-sync-index]');
    rows.forEach(row=>row.classList.remove('is-current-line'));
    $$('.lyric-word.is-current-word').forEach(word=>word.classList.remove('is-current-word'));
    if(rows.length){
      const rowIndex=Math.min(rows.length-1,Math.floor(progress*rows.length)),row=rows[rowIndex];row.classList.add('is-current-line');
      const words=$$('.lyric-word',row);if(words.length){const lineProgress=(progress*rows.length)-rowIndex;words[Math.min(words.length-1,Math.floor(lineProgress*words.length))]?.classList.add('is-current-word');}
    }
    const questions=$$('.exercise-line[data-sync-index]');questions.forEach(row=>row.classList.remove('is-current-line'));
    if(questions.length)questions[Math.min(questions.length-1,Math.floor(progress*questions.length))]?.classList.add('is-current-line');
  }
  function addLocalPlayback(seconds) {
    const day=localDayKey(new Date());let row=state.playbackDaily.find(item=>item.day===day);
    if(!row){row={day,seconds:0};state.playbackDaily.push(row);}row.seconds+=seconds;renderDashboard();
  }
  function capturePlaybackChunk() {
    if(!state.playbackStarted)return;
    state.playbackPending+=Math.max(0,(performance.now()-state.playbackStarted)/1000);state.playbackStarted=performance.now();
  }
  function flushPlayback() {
    capturePlaybackChunk();
    const seconds=Math.floor(state.playbackPending);if(seconds<1||state.session?.role!=='student'||!state.activeSong)return state.playbackSave;
    state.playbackPending-=seconds;addLocalPlayback(seconds);
    const args={p_student_token:state.session.token,p_song_id:state.activeSong.id,p_seconds:seconds,p_played_at:new Date().toISOString()};
    const send=()=>rpc(CONFIG.rpc.addPlayback,args).catch(()=>{state.playbackPending+=seconds;addLocalPlayback(-seconds);});
    state.playbackSave=(state.playbackSave||Promise.resolve()).then(send).finally(()=>{state.playbackSave=null;});return state.playbackSave;
  }
  function beginPlaybackTracking() {
    if(!state.playbackStarted)state.playbackStarted=performance.now();
    window.clearInterval(state.playerSyncTimer);state.playerSyncTimer=window.setInterval(()=>{syncLyricsToPlayback();if(state.playbackStarted&&(performance.now()-state.playbackStarted)>10000)void flushPlayback();},200);
  }
  function endPlaybackTracking() { capturePlaybackChunk();state.playbackStarted=0;window.clearInterval(state.playerSyncTimer);state.playerSyncTimer=0;syncLyricsToPlayback();void flushPlayback(); }
  function syncPlaybackControls() {
    const rates=state.playerReady ? (state.player.getAvailablePlaybackRates?.()||[1]) : [1];
    const rate=state.playerReady ? Number(state.player.getPlaybackRate?.()||1) : 1;
    $$('[data-playback-rate]').forEach(select=>{select.replaceChildren(...rates.map(value=>{const option=document.createElement('option');option.value=String(value);option.textContent=`${value}×`;return option;}));select.value=String(rate);select.disabled=!state.playerReady;});
    $$('[data-player-toggle]').forEach(button=>{const playing=state.playerState===1;button.textContent=playing?'Ⅱ':'▶';button.setAttribute('aria-label',playing?'暫停':'播放');});
    syncLyricsToPlayback();
    updateFloatingPlayer();
  }
  function updateFloatingPlayer() {
    const bar=$('[data-floating-player]');if(!bar)return;
    const header=$('.site-header')||$('header');
    const top=header?Math.max(0,header.getBoundingClientRect().bottom):0;
    document.documentElement.style.setProperty('--song-header-height',`${top}px`);
    const original=$('[data-player-controls]');
    bar.hidden=!(state.playerReady&&state.activeRoute==='song'&&['translation','exercise'].includes(state.activeTab)&&original.getBoundingClientRect().bottom<=top);
  }
  function setPlaybackRate(value) {if(!state.playerReady)return;const rates=state.player.getAvailablePlaybackRates?.()||[1];if(rates.includes(Number(value)))state.player.setPlaybackRate(Number(value));}

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
    const generation=++state.playerGeneration;
    const id = youtubeVideoId(url); if (!id) return;
    const shell = $("[data-youtube-shell]"); shell.replaceChildren();
    const mount = document.createElement("div"); mount.id = `song-youtube-${Date.now()}`; shell.append(mount);
    try {
      const YT = await loadYouTubeApi();
      if(generation!==state.playerGeneration)return;
      state.player = new YT.Player(mount, {
        host: "https://www.youtube-nocookie.com", videoId: id,
        playerVars: { autoplay: 0, controls: 0, rel: 0, playsinline: 1, modestbranding: 1, origin:location.origin },
        events: {
          onReady() { if(generation!==state.playerGeneration)return;state.playerReady = true; $("[data-player-controls]").hidden = false;syncPlaybackControls(); },
          onStateChange(event) { if(generation!==state.playerGeneration)return;state.playerState = event.data;if(event.data===1)beginPlaybackTracking();else endPlaybackTracking();syncPlaybackControls(); },
          onPlaybackRateChange(){syncPlaybackControls();}
        }
      });
    } catch (error) { toast(error.message, "error"); }
  }

  function destroyPlayer() {
    endPlaybackTracking();
    state.playerGeneration+=1;
    try { state.player?.destroy?.(); } catch { /* Best effort. */ }
    state.player = null; state.playerReady = false; state.playerState = null;
    const shell = $("[data-youtube-shell]");
    if (shell && !$(".youtube-placeholder", shell)) {
      const placeholder = document.createElement("div"); placeholder.className = "youtube-placeholder";
      const icon = document.createElement("span"); icon.textContent = "♪"; const title = document.createElement("strong"); title.textContent = "等待管理員加入 YouTube 連結"; const note = document.createElement("small"); note.textContent = "題目仍可先行練習及核對。"; placeholder.append(icon, title, note); shell.replaceChildren(placeholder);
    }
    $("[data-player-controls]").hidden = true;
    updateFloatingPlayer();
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
  function seekPlayerTo(value) { if(!state.playerReady)return;try{state.player.seekTo(clamp(Number(value),0,Number(state.player.getDuration())||0),true);syncLyricsToPlayback();}catch{/* Player may be transitioning. */} }
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
    $('[data-translation-columns]').addEventListener('pointerup',event=>{window.setTimeout(()=>updateSelectedPhrase(event),0);});
    $("[data-bookmark-selection]").addEventListener("click", () => { const phrase = state.selectedPhrase || selectedPhrase(); if (phrase) addBookmark({ ...phrase, kind: "phrase" }); });
    $$("[data-bookmark-filter]").forEach(button => button.addEventListener("click", () => { state.bookmarkFilter = button.dataset.bookmarkFilter; $$("[data-bookmark-filter]").forEach(item => item.classList.toggle("is-active", item === button)); renderBookmarks(); }));
    const floating=$('[data-player-controls]').cloneNode(true);floating.removeAttribute('data-player-controls');floating.dataset.floatingPlayer='';floating.classList.add('floating-song-controls');floating.hidden=true;document.body.append(floating);
    $$('[data-player-toggle]').forEach(button=>button.addEventListener('click',togglePlayer));
    $$('[data-restart-song]').forEach(button=>button.addEventListener('click',relisten));
    $$('[data-playback-rate]').forEach(select=>select.addEventListener('change',()=>setPlaybackRate(select.value)));
    $$('[data-player-timeline]').forEach(input=>input.addEventListener('input',()=>seekPlayerTo(input.value)));
    window.addEventListener('scroll',updateFloatingPlayer,{passive:true});window.addEventListener('resize',updateFloatingPlayer);
    $('[data-skip-preparation]').addEventListener('click',finishReadCountdown);
    $('[data-check-partial]').addEventListener('click',checkPartialAnswers);
    $('[data-reset-answers]').addEventListener('click',resetDraftAnswers);
    $('[data-reload-draft]').addEventListener('click',reloadCloudDraft);
    $('[data-favorites-only]').addEventListener('click',event=>{state.favoritesOnly=!state.favoritesOnly;event.currentTarget.setAttribute('aria-pressed',String(state.favoritesOnly));renderLibrary();});
    $$('[data-font-size]').forEach(select=>select.addEventListener('change',()=>setTextSize(select.dataset.fontSize,select.value)));
    $('[data-toggle-chinese]').addEventListener('click',event=>{state.showChinese=!state.showChinese;event.currentTarget.setAttribute('aria-pressed',String(state.showChinese));event.currentTarget.textContent=state.showChinese?'隱藏中文翻譯':'顯示中文翻譯';renderExerciseQuestions();});
    $('[data-bookmark-selection]').addEventListener('pointerdown',event=>event.preventDefault());
    window.addEventListener('online',()=>flushDraft().catch(()=>{}));
    $$("[data-seek]").forEach(button => button.addEventListener("click", () => seekPlayer(Number(button.dataset.seek))));
    $("[data-relisten]").addEventListener("click", relisten);
    $("[data-result-relisten]").addEventListener("click", relisten);
    $("[data-change-mode]").addEventListener("click", async()=>{try{await flushDraft();resetExercise();}catch{toast("請先同步進度後再切換。","error");}});
    $("[data-try-again]").addEventListener("click", () => startExercise(state.exercise?.mode.id));
    $("[data-submit-exercise]").addEventListener("click", submitExercise);
    $("[data-new-song]").addEventListener("click", newAdminSong);
    $("[data-admin-song-search]").addEventListener("input", renderAdminSongList);
    $("[data-song-form]").addEventListener("submit", saveAdminSong);
    $("[data-song-form]").elements.youtubeUrl.addEventListener("input", updateAdminYouTubePreview);
    $("[data-archive-song]").addEventListener("click", () => { const form = $("[data-song-form]"); form.elements.published.checked = false; form.requestSubmit(); });
    $("[data-student-access-search]").addEventListener("input", renderStudentAccess);
    document.addEventListener("visibilitychange", () => { if(document.hidden){pausePlayer();void flushPlayback();} if (!state.exercise || state.exercise.submitted) return; if (document.hidden) {pauseExerciseClock();storeLocalDraft();void flushDraft().catch(()=>{});} else if (state.activeRoute === "song" && state.activeTab === "exercise") startExerciseClock(); });
    window.addEventListener("pagehide",()=>{pausePlayer();void flushPlayback();pauseExerciseClock();storeLocalDraft();});
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
