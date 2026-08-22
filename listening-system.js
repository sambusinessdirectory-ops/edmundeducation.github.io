const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const CATALOGUE = window.EDMUND_LISTENING_CATALOG || { practices: [] };
const SESSION_KEY = "edmund-listening-session-v1";
const AUDIO_CATALOGUE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev/v1/listening/catalog";
const SPEEDS = Object.freeze([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
const TEXT_SCALES = Object.freeze([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3]);
const PRACTICE_ONE = window.EDMUND_IELTS_LISTENING_PRACTICE_1 || null;
const PRACTICE_ONE_TRANSCRIPT = window.EDMUND_IELTS_LISTENING_PRACTICE_1_TRANSCRIPT || {};
const PRACTICE_ONE_ANALYSIS = window.EDMUND_IELTS_LISTENING_PRACTICE_1_ANALYSIS || {};
const PRACTICE_ONE_TIMINGS = window.EDMUND_IELTS_LISTENING_PRACTICE_1_TIMINGS || { parts: {}, questions: {} };

const state = {
  supabase: null,
  user: null,
  token: "",
  view: "login",
  practice: 0,
  requestedPart: 0,
  sort: restorePreference("edmund-listening-sort", "asc") === "desc" ? "desc" : "asc",
  speed: normalizeSpeed(restorePreference("edmund-listening-speed", "1")),
  tracks: new Map(),
  cataloguePromise: null,
  toastTimer: 0,
  practicePart: 1,
  listeningBookmarks: new Set(),
  visibleAnswerParts: new Set(),
  visibleAnswerQuestions: new Set(),
  syncHighlights: true,
  textScale: normalizeTextScale(restorePreference("edmund-listening-text-scale", "1"))
};

let analysisHideTimer = 0;

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  connection: document.querySelector("[data-connection]"),
  user: document.querySelector("[data-user]"),
  logout: document.querySelector("[data-logout]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginStatus: document.querySelector("[data-login-status]"),
  loginButton: document.querySelector("[data-login-button]"),
  sort: document.querySelector("[data-sort]"),
  practiceGrid: document.querySelector("[data-practice-grid]"),
  practiceTitle: document.querySelector("[data-practice-title]"),
  catalogueStatus: document.querySelector("[data-catalogue-status]"),
  trackGrid: document.querySelector("[data-track-grid]"),
  welcome: document.querySelector("[data-welcome]"),
  toast: document.querySelector("[data-toast]"),
  workspace: document.querySelector("[data-practice-workspace]")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function restorePreference(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function savePreference(key, value) {
  try { localStorage.setItem(key, String(value)); } catch { /* Preferences are optional. */ }
}

function normalizeSpeed(value) {
  const number = Number(value);
  return SPEEDS.includes(number) ? number : 1;
}

function normalizeTextScale(value) {
  const number = Number(value);
  return TEXT_SCALES.includes(number) ? number : 1;
}

function normaliseAnswer(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/[.?!]+$/g, "").replace(/\s+/g, " ").toLocaleLowerCase("en");
}

function wordButtons(text, sourceKey, context) {
  let index = 0;
  return escapeHtml(text).replace(/([A-Za-z]+(?:['’-][A-Za-z]+)*)/g, (word) => {
    index += 1;
    const source = `${sourceKey}:${index}`;
    const active = state.listeningBookmarks.has(`practice1:${source}:${normaliseAnswer(word)}`);
    return `<button class="bookmark-word" type="button" data-bookmark-word="${escapeHtml(word)}" data-bookmark-source="${escapeHtml(source)}" data-bookmark-context="${escapeHtml(context)}" data-bookmarked="${active}" title="收藏 ${escapeHtml(word)}">${word}</button>`;
  });
}

function bookmarkHref(part, anchor = "") {
  return `listening-system.html?section=ielts&practice=1&part=${part}${anchor ? `#${anchor}` : ""}`;
}

async function setListeningBookmark(button) {
  if (!state.token) return showToast("請先登入才可收藏內容。");
  const word = String(button.dataset.bookmarkWord || "");
  const source = String(button.dataset.bookmarkSource || "");
  const context = String(button.dataset.bookmarkContext || "");
  const itemKey = String(button.dataset.bookmarkItem || `practice1:${source}:${normaliseAnswer(word)}`).slice(0, 180);
  const title = String(button.dataset.bookmarkTitle || word).slice(0, 300);
  const detail = String(button.dataset.bookmarkDetail || `IELTS Listening Practice 1 · ${context}`).slice(0, 3000);
  const part = Number(button.dataset.bookmarkPart) || state.practicePart;
  const anchor = String(button.dataset.bookmarkAnchor || "");
  const bookmarked = !state.listeningBookmarks.has(itemKey);
  button.disabled = true;
  try {
    await rpc("learning_portal_set_bookmark", {
      p_token: state.token, p_system_key: "listening", p_item_key: itemKey,
      p_title: title, p_detail: detail,
      p_href: bookmarkHref(part, anchor), p_bookmarked: bookmarked
    });
    if (bookmarked) state.listeningBookmarks.add(itemKey); else state.listeningBookmarks.delete(itemKey);
    if (source) document.querySelectorAll(`[data-bookmark-source="${CSS.escape(source)}"]`).forEach((item) => item.dataset.bookmarked = String(bookmarked));
    document.querySelectorAll(`[data-bookmark-item="${CSS.escape(itemKey)}"]`).forEach((item) => item.dataset.bookmarked = String(bookmarked));
    document.querySelectorAll(`[data-analysis-dialog-bookmark][data-bookmark-item="${CSS.escape(itemKey)}"]`).forEach((item) => { item.textContent = bookmarked ? "★ 已收藏解析" : "☆ 收藏解析"; });
    showToast(bookmarked ? `已收藏「${title}」` : `已移除「${title}」書簽`);
  } catch (error) {
    console.warn("Listening bookmark save failed", error);
    showToast("書簽暫時未能儲存。");
  } finally { button.disabled = false; }
}

async function loadListeningBookmarks() {
  if (!state.token) return;
  try {
    const rows = await rpc("learning_portal_list_bookmarks", { p_token: state.token, p_system_key: "listening" });
    state.listeningBookmarks = new Set((Array.isArray(rows) ? rows : []).map((row) => String(row.item_key)));
  } catch (error) { console.warn("Listening bookmarks load failed", error); }
}

function setConnection(label, status) {
  elements.connection.textContent = label;
  elements.connection.dataset.state = status;
}

function setLoginStatus(message = "", status = "") {
  elements.loginStatus.textContent = message;
  elements.loginStatus.dataset.state = status;
}

function setCatalogueStatus(message, status = "") {
  elements.catalogueStatus.textContent = message;
  elements.catalogueStatus.dataset.state = status;
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 3500);
}

function showView(name, { scroll = true } = {}) {
  state.view = name;
  elements.views.forEach((view) => { view.hidden = view.dataset.view !== name; });
  const signedIn = Boolean(state.user && state.token);
  elements.user.hidden = !signedIn;
  elements.logout.hidden = !signedIn;
  document.querySelectorAll("[data-home]").forEach((button) => { button.hidden = !signedIn || name === "dashboard"; });
  if (signedIn) elements.user.textContent = `${state.user.name} · 學生`;
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

function initialiseSupabase() {
  if (state.supabase) return state.supabase;
  if (!window.supabase?.createClient || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    throw new Error("登入服務暫時未能載入，請重新整理頁面。");
  }
  let storage;
  try { storage = window.sessionStorage; } catch { storage = undefined; }
  state.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: { persistSession: Boolean(storage), ...(storage ? { storage } : {}), autoRefreshToken: true, detectSessionInUrl: false }
  });
  return state.supabase;
}

async function ensureSupabaseSession() {
  const client = initialiseSupabase();
  const current = await client.auth.getSession();
  if (current.error) throw current.error;
  if (current.data?.session?.user?.id) return client;
  const signIn = await client.auth.signInAnonymously();
  if (signIn.error) throw signIn.error;
  if (!signIn.data?.session?.user?.id) throw new Error("未能建立安全登入連線。");
  return client;
}

async function rpc(name, args) {
  const client = await ensureSupabaseSession();
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data;
}

function saveSession() {
  try {
    if (!state.user || !state.token) sessionStorage.removeItem(SESSION_KEY);
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...state.user, token: state.token, role: "student" }));
  } catch { /* The server session remains authoritative. */ }
}

function readSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

function clearSession() {
  state.user = null;
  state.token = "";
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Ignore unavailable storage. */ }
}

async function validateToken(token) {
  const rows = await rpc("flashcard_student_session_profile", { p_token: token });
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row?.id || !row?.name || !row?.session_token) return false;
  state.token = String(row.session_token);
  state.user = { id: String(row.id), name: String(row.name), role: "student" };
  saveSession();
  window.EdmundSystemNav?.rememberStudentSession({ token: state.token, id: state.user.id, name: state.user.name, role: "student" });
  return true;
}

async function login(username, password) {
  const rows = await rpc("flashcard_student_login", { p_name: username, p_password: password });
  const row = Array.isArray(rows) ? rows[0] : null;
  return row?.session_token ? validateToken(String(row.session_token)) : false;
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(elements.loginForm);
  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");
  if (!username || !password) return setLoginStatus("請輸入用戶名稱及密碼。", "error");
  elements.loginButton.disabled = true;
  setLoginStatus("正在核對帳戶…");
  try {
    if (!await login(username, password)) throw new Error("用戶名稱或密碼不正確。");
    elements.loginForm.reset();
    setLoginStatus();
    setConnection("已安全連接", "online");
    await loadListeningBookmarks();
    openRequestedRoute();
    showToast(`您好，${state.user.name}！`);
  } catch (error) {
    console.warn("Listening login failed", error);
    setLoginStatus(error?.message || "登入失敗，請稍後再試。", "error");
    setConnection("連線失敗", "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function restoreSession() {
  const universal = window.EdmundSystemNav?.getStudentSession?.();
  const local = readSession();
  const candidate = universal?.role === "student" ? universal : local?.role === "student" ? local : null;
  if (!candidate?.token) return false;
  try { return await validateToken(String(candidate.token)); }
  catch (error) {
    console.warn("Listening session restore failed", error);
    clearSession();
    return false;
  }
}

async function logout() {
  pauseAllAudio();
  const floating = document.querySelector("[data-floating-audio]");
  if (floating) floating.hidden = true;
  window.EdmundSystemNav?.forgetStudentSession();
  clearSession();
  try { await state.supabase?.auth.signOut(); } catch { /* Best effort for anonymous Auth. */ }
  setConnection("已連線", "online");
  showView("login");
}

function routeParams() {
  const params = new URLSearchParams(location.search);
  const section = params.get("section") === "dse" ? "dse" : params.get("section") === "ielts" ? "ielts" : "";
  const practice = Number(params.get("practice"));
  const part = Number(params.get("part"));
  return {
    section,
    practice: Number.isInteger(practice) && practice >= 1 && practice <= 20 ? practice : 0,
    part: Number.isInteger(part) && part >= 1 && part <= 4 ? part : 0
  };
}

function updateRoute(section = "", practice = 0, part = 0) {
  const url = new URL(location.href);
  url.search = "";
  if (section) url.searchParams.set("section", section);
  if (practice) url.searchParams.set("practice", String(practice));
  if (part) url.searchParams.set("part", String(part));
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function openRequestedRoute() {
  const requested = routeParams();
  elements.welcome.textContent = `您好，${state.user.name}！請選擇聆聽練習。`;
  if (requested.section === "dse") return openSection("dse", { update: false });
  if (requested.section === "ielts" && requested.practice) return openPractice(requested.practice, requested.part, { update: false });
  if (requested.section === "ielts") return openSection("ielts", { update: false });
  openDashboard();
}

function openDashboard() {
  pauseAllAudio();
  const floating = document.querySelector("[data-floating-audio]");
  if (floating) floating.hidden = true;
  updateRoute();
  showView("dashboard");
}

function openSection(section, options = {}) {
  pauseAllAudio();
  const floating = document.querySelector("[data-floating-audio]");
  if (floating) floating.hidden = true;
  if (options.update !== false) updateRoute(section);
  if (section === "ielts") {
    renderPracticeGrid();
    showView("ielts");
  } else {
    showView("dse");
  }
}

function renderPracticeGrid() {
  elements.sort.value = state.sort;
  const practices = [...CATALOGUE.practices].sort((left, right) => state.sort === "desc" ? right.practice - left.practice : left.practice - right.practice);
  elements.practiceGrid.innerHTML = practices.map((item) => `
    <button class="practice-card" type="button" data-open-practice="${item.practice}">
      <span>${String(item.practice).padStart(2, "0")}</span>
      <strong>Practice ${item.practice}</strong>
      <small>Part 1 · Part 2 · Part 3 · Part 4</small>
    </button>`).join("");
}

async function loadAudioCatalogue() {
  if (state.cataloguePromise) return state.cataloguePromise;
  state.cataloguePromise = (async () => {
    const response = await fetch(AUDIO_CATALOGUE_URL, { mode: "cors", credentials: "omit", cache: "no-cache" });
    if (!response.ok) throw new Error(`錄音庫回應錯誤（${response.status}）`);
    const payload = await response.json();
    if (!Array.isArray(payload?.tracks)) throw new Error("錄音庫資料格式不正確。");
    state.tracks.clear();
    for (const raw of payload.tracks) {
      const practice = Number(raw?.practice);
      const part = Number(raw?.part);
      const url = String(raw?.url || "");
      if (practice >= 1 && practice <= 20 && part >= 1 && part <= 4 && /^https:\/\//i.test(url)) {
        state.tracks.set(`${practice}:${part}`, { practice, part, url });
      }
    }
    return payload;
  })().catch((error) => {
    state.cataloguePromise = null;
    throw error;
  });
  return state.cataloguePromise;
}

function renderTrackCards() {
  elements.trackGrid.innerHTML = [1, 2, 3, 4].map((part) => {
    const track = state.tracks.get(`${state.practice}:${part}`);
    const requested = state.requestedPart === part ? " is-requested" : "";
    return `<article class="track-card${requested}" id="part-${part}" data-track-part="${part}">
      <div class="track-heading"><div><p class="eyebrow">RECORDING ${part}</p><h2>Part ${part}</h2></div><span>0${part}</span></div>
      ${track ? `<audio controls preload="metadata" data-audio-part="${part}" src="${escapeHtml(track.url)}">您的瀏覽器不支援音訊播放器。</audio>
        <div class="speed-row"><label>播放速度<select data-speed-part="${part}">${SPEEDS.map((speed) => `<option value="${speed}"${speed === state.speed ? " selected" : ""}>${speed}×</option>`).join("")}</select></label></div>`
        : `<div class="track-unavailable"><strong>暫時未能找到 Part ${part} 錄音。</strong><br>請稍後再試，或通知老師檢查 Practice ${state.practice} 的 Part ${part}。</div>`}
    </article>`;
  }).join("");
  document.querySelectorAll("audio[data-audio-part]").forEach((audio) => {
    audio.defaultPlaybackRate = state.speed;
    audio.playbackRate = state.speed;
    audio.addEventListener("play", () => {
      document.querySelectorAll("audio[data-audio-part]").forEach((other) => { if (other !== audio) other.pause(); });
      updateFloatingAudio(audio);
    });
    ["pause", "timeupdate", "durationchange", "ended"].forEach((eventName) => audio.addEventListener(eventName, () => updateFloatingAudio(audio)));
  });
}

function analysisFor(number) {
  return PRACTICE_ONE_ANALYSIS[String(number)] || PRACTICE_ONE_ANALYSIS[number] || { answer: "", explanation: "解析整理中。" };
}

function officialAnswer(number) {
  const analysis = analysisFor(number);
  return `<span class="single-answer-tools"><button class="single-answer-reveal" type="button" data-reveal-answer-q="${number}" aria-pressed="false">看答案</button><button class="listening-official-answer" type="button" data-official-answer data-analysis-q="${number}" hidden aria-label="查看第 ${number} 題解析">正確答案：<strong>${escapeHtml(analysis.answer)}</strong><span>移至此處查看解析</span></button></span>`;
}

function answerInput(number, compact = false) {
  return `<span class="listening-gap-unit${compact ? " listening-gap-unit--table" : ""}"><label class="listening-gap${compact ? " listening-gap--table" : ""}"><b>${number}</b><input data-answer-q="${number}" autocomplete="off" spellcheck="false" aria-label="答案 ${number}"></label>${officialAnswer(number)}</span>`;
}

function renderPartOneTable(part) {
  const replaceTokens = (text, rowIndex, cellIndex) => {
    const rawText = String(text ?? "");
    const bookmarkContext = rawText.replace(/\{\{\d+\}\}/g, "____");
    return rawText.split(/(\{\{\d+\}\})/g).map((segment, segmentIndex) => {
      const token = segment.match(/^\{\{(\d+)\}\}$/);
      if (token) return answerInput(token[1], true);
      return wordButtons(segment, `p1:table:r${rowIndex}:c${cellIndex}:s${segmentIndex}`, bookmarkContext);
    }).join("");
  };
  const translateTokens = (text) => escapeHtml(text).replace(/\{\{(\d+)\}\}/g, (_, number) => `<span class="listening-translated-blank">第 ${number} 題</span>`);
  return `<div class="listening-table-wrap"><table class="listening-question-table"><caption>${escapeHtml(part.table.caption)}</caption><thead><tr>${part.table.headers.map((header, index) => `<th>${wordButtons(header, `p1:header:${index}`, header)}<small data-zh hidden>${escapeHtml(part.table.headersZh[index])}</small></th>`).join("")}</tr></thead><tbody>${part.table.rows.map((row, rowIndex) => `<tr>${row.map((cell, cellIndex) => `<td>${replaceTokens(cell, rowIndex, cellIndex)}<small data-zh hidden>${translateTokens(part.table.rowsZh[rowIndex][cellIndex])}</small></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function renderQuestion(question) {
  if (question.type === "gap") return `<article class="listening-question-card" data-question-card="${question.number}"><div class="listening-question-card__number">${question.number}</div><div class="listening-question-card__body"><p>${wordButtons(question.prompt, `p${question.part}:q${question.number}`, `Part ${question.part} · Question ${question.number}: ${question.prompt}`)}</p><p class="listening-question-zh" data-zh hidden>${escapeHtml(question.translation)}</p>${answerInput(question.number)}</div><p class="listening-result" data-result-q="${question.number}" hidden></p></article>`;
  if (question.type === "choice") return `<article class="listening-question-card" data-question-card="${question.number}"><div class="listening-question-card__number">${question.number}</div><div class="listening-question-card__body"><p>${wordButtons(question.prompt, `p${question.part}:q${question.number}`, `Part ${question.part} · Question ${question.number}: ${question.prompt}`)}</p><p class="listening-question-zh" data-zh hidden>${escapeHtml(question.translation)}</p><div class="listening-options">${question.options.map((item) => `<label><input type="radio" name="q${question.number}" value="${item.key}"><strong>${item.key}</strong><span>${wordButtons(item.en, `p${question.part}:q${question.number}:${item.key}`, `Part ${question.part} · Question ${question.number}: ${item.en}`)}<small data-zh hidden>${escapeHtml(item.zh)}</small></span></label>`).join("")}</div>${officialAnswer(question.number)}</div><p class="listening-result" data-result-q="${question.number}" hidden></p></article>`;
  const label = question.numbers.join(" & ");
  return `<article class="listening-question-card listening-question-card--multi" data-question-card="${label}"><div class="listening-question-card__number">${label}</div><div class="listening-question-card__body"><p>${wordButtons(question.prompt, `p${question.part}:q${label}`, `Part ${question.part} · Questions ${label}: ${question.prompt}`)}</p><p class="listening-question-zh" data-zh hidden>${escapeHtml(question.translation)}</p><p class="listening-select-count">請選擇兩項</p><div class="listening-options">${question.options.map((item) => `<label><input type="checkbox" data-multi-group="${label}" value="${item.key}"><strong>${item.key}</strong><span>${wordButtons(item.en, `p${question.part}:q${label}:${item.key}`, `Part ${question.part} · Questions ${label}: ${item.en}`)}<small data-zh hidden>${escapeHtml(item.zh)}</small></span></label>`).join("")}</div><div class="listening-official-answer-list">${question.numbers.map(officialAnswer).join("")}</div></div><p class="listening-result" data-result-q="${label}" hidden></p></article>`;
}

function renderTranscript(partNumber) {
  const rows = Array.isArray(PRACTICE_ONE_TRANSCRIPT[String(partNumber)]) ? PRACTICE_ONE_TRANSCRIPT[String(partNumber)] : [];
  return `<section class="listening-transcript" aria-labelledby="transcript-title-${partNumber}"><div class="listening-transcript__head"><div><p class="eyebrow">AUTHORED-TIMESTAMP TRANSCRIPT</p><div class="transcript-title-row"><h3 id="transcript-title-${partNumber}">Part ${partNumber} 錄音稿</h3><button class="transcript-sync-toggle" type="button" data-toggle-transcript-sync aria-pressed="${state.syncHighlights}">同步高亮：${state.syncHighlights ? "開" : "關"}</button></div></div><p>高亮位置由錄音逐字時間校準。點擊一行可跳到該句開頭；畫面不會被強制捲動。</p></div><div class="transcript-lines" data-transcript-part="${partNumber}">${rows.map((row, index) => { const itemKey = `practice1:transcript:p${partNumber}:line:${index}`; const active = state.listeningBookmarks.has(itemKey); return `<div class="transcript-line" role="button" tabindex="0" data-transcript-line="${index}"><div class="transcript-line__top"><span>${wordButtons(row.en, `p${partNumber}:t${index}`, `Part ${partNumber} transcript: ${row.en}`)}</span><button class="bookmark-entry" type="button" data-bookmark-item="${itemKey}" data-bookmark-title="Part ${partNumber} 錄音稿第 ${index + 1} 行" data-bookmark-detail="${escapeHtml(`${row.en}\n${row.zh}`)}" data-bookmark-part="${partNumber}" data-bookmark-anchor="transcript-title-${partNumber}" data-bookmarked="${active}" aria-label="收藏此行">☆ 收藏此行</button></div><small data-zh hidden>${escapeHtml(row.zh)}</small></div>`; }).join("")}</div></section>`;
}

function renderAnalysisSection(partNumber) {
  const part = PRACTICE_ONE.parts.find((item) => item.part === partNumber);
  const numbers = part.questions.flatMap((question) => question.type === "multi" ? question.numbers : [question.number]);
  return `<section class="listening-analysis" aria-labelledby="analysis-title-${partNumber}"><div class="listening-analysis__head"><p class="eyebrow">ANSWER ANALYSIS</p><h3 id="analysis-title-${partNumber}">Part ${partNumber} 完整答案解析</h3><p>以下解析按 PDF 原文逐題整理；每題均可獨立收藏。</p></div><div class="listening-analysis__grid">${numbers.map((number) => { const analysis = analysisFor(number); const itemKey = `practice1:analysis:q${number}`; return `<article class="listening-analysis-card" id="analysis-q${number}"><div class="listening-analysis-card__head"><span>${number}</span><div><small>正確答案</small><strong>${escapeHtml(analysis.answer)}</strong></div><button class="bookmark-entry" type="button" data-bookmark-item="${itemKey}" data-bookmark-title="IELTS Listening Practice 1 · 第 ${number} 題解析" data-bookmark-detail="${escapeHtml(analysis.explanation)}" data-bookmark-part="${partNumber}" data-bookmark-anchor="analysis-q${number}" data-bookmarked="${state.listeningBookmarks.has(itemKey)}" aria-label="收藏第 ${number} 題解析">☆ 收藏解析</button></div><p>${escapeHtml(analysis.explanation)}</p></article>`; }).join("")}</div></section>`;
}

function renderPracticePart(partNumber) {
  const part = PRACTICE_ONE.parts.find((item) => item.part === partNumber);
  if (!part) return;
  state.practicePart = partNumber;
  elements.workspace.querySelectorAll("[data-part-tab]").forEach((button) => button.setAttribute("aria-selected", String(Number(button.dataset.partTab) === partNumber)));
  const host = elements.workspace.querySelector("[data-practice-part-host]");
  host.innerHTML = `<section class="listening-part"><div class="listening-part__head"><div><p class="eyebrow">QUESTIONS ${partNumber === 1 ? "1–10" : partNumber === 2 ? "11–20" : partNumber === 3 ? "21–30" : "31–40"}</p><h2>Part ${partNumber}</h2><p>${wordButtons(part.instruction, `p${partNumber}:instruction`, `Part ${partNumber}: ${part.instruction}`)}</p><p data-zh hidden>${escapeHtml(part.instructionZh)}</p></div><div class="listening-part__actions"><button class="secondary-button" type="button" data-toggle-translation aria-pressed="false">顯示中文翻譯</button><button class="secondary-button" type="button" data-show-part-answers aria-pressed="false">顯示答案</button><button class="primary-button" type="button" data-check-part>檢查答案</button></div></div>${part.table ? renderPartOneTable(part) : ""}<div class="listening-question-list">${part.table ? "" : part.questions.map(renderQuestion).join("")}</div><div class="listening-part-score" data-part-score hidden></div>${renderTranscript(partNumber)}${renderAnalysisSection(partNumber)}</section>`;
  refreshAnswerVisibility();
  bindTranscriptSync(partNumber);
  bindAnswerAnalysisDialogs();
  setFloatingAudioPart(partNumber);
}

function renderPracticeWorkspace() {
  if (!PRACTICE_ONE || state.practice !== 1) {
    elements.workspace.hidden = true;
    elements.workspace.replaceChildren();
    return;
  }
  elements.workspace.hidden = false;
  elements.workspace.style.setProperty("--listening-text-scale", String(state.textScale));
  elements.workspace.innerHTML = `<div class="practice-workspace__head"><div><p class="eyebrow">INTERACTIVE PRACTICE</p><h2 id="practice-workspace-title">作答系統、答案與同步錄音稿</h2><p>作答後可立即檢查或顯示答案。單字、錄音稿每一行及逐題解析均可加入書簽。</p></div><label class="text-scale-control">文字大小<select data-text-scale aria-label="練習文字大小">${TEXT_SCALES.map((scale) => `<option value="${scale}"${scale === state.textScale ? " selected" : ""}>${scale}×</option>`).join("")}</select></label></div><div class="listening-part-tabs" role="tablist" aria-label="選擇錄音部分">${[1,2,3,4].map((part) => `<button type="button" role="tab" data-part-tab="${part}" aria-selected="${part === state.practicePart}">Part ${part}</button>`).join("")}</div><div data-practice-part-host></div>`;
  renderPracticePart(state.requestedPart || state.practicePart || 1);
}

function questionValue(question) {
  if (question.type === "gap") return elements.workspace.querySelector(`[data-answer-q="${question.number}"]`)?.value || "";
  if (question.type === "choice") return elements.workspace.querySelector(`input[name="q${question.number}"]:checked`)?.value || "";
  return [...elements.workspace.querySelectorAll(`[data-multi-group="${question.numbers.join(" & ")}"]:checked`)].map((input) => input.value).sort();
}

function questionCorrect(question) {
  const value = questionValue(question);
  if (question.type === "multi") return value.join("") === [...question.answers].sort().join("");
  const accepted = [question.answer, ...(question.alternatives || [])].map(normaliseAnswer);
  return accepted.includes(normaliseAnswer(value));
}

function partQuestionNumbers(partNumber = state.practicePart) {
  const part = PRACTICE_ONE.parts.find((item) => item.part === partNumber);
  return part ? part.questions.flatMap((question) => question.type === "multi" ? question.numbers : [question.number]) : [];
}

function refreshAnswerVisibility() {
  const showAll = state.visibleAnswerParts.has(state.practicePart);
  const button = elements.workspace.querySelector("[data-show-part-answers]");
  elements.workspace.querySelectorAll("[data-official-answer]").forEach((answer) => {
    const number = Number(answer.dataset.analysisQ);
    answer.hidden = !(showAll || state.visibleAnswerQuestions.has(number));
  });
  elements.workspace.querySelectorAll("[data-reveal-answer-q]").forEach((reveal) => {
    const number = Number(reveal.dataset.revealAnswerQ);
    const showing = showAll || state.visibleAnswerQuestions.has(number);
    reveal.setAttribute("aria-pressed", String(showing));
    reveal.textContent = showing ? "收起答案" : "看答案";
  });
  if (button) {
    button.setAttribute("aria-pressed", String(showAll));
    button.textContent = showAll ? "隱藏全部答案" : "顯示全部答案";
  }
}

function setPartAnswersVisibility(show) {
  if (show) state.visibleAnswerParts.add(state.practicePart);
  else {
    state.visibleAnswerParts.delete(state.practicePart);
    partQuestionNumbers().forEach((number) => state.visibleAnswerQuestions.delete(number));
  }
  refreshAnswerVisibility();
}

function toggleQuestionAnswer(number) {
  if (state.visibleAnswerQuestions.has(number)) state.visibleAnswerQuestions.delete(number);
  else state.visibleAnswerQuestions.add(number);
  refreshAnswerVisibility();
}

function togglePartAnswers() {
  setPartAnswersVisibility(!state.visibleAnswerParts.has(state.practicePart));
}

function markPartAnswers() {
  const part = PRACTICE_ONE.parts.find((item) => item.part === state.practicePart);
  let correct = 0;
  part.questions.forEach((question) => {
    const ok = questionCorrect(question);
    if (ok) correct += question.type === "multi" ? question.numbers.length : 1;
    const key = question.type === "multi" ? question.numbers.join(" & ") : question.number;
    const card = elements.workspace.querySelector(`[data-question-card="${CSS.escape(String(key))}"]`);
    const result = elements.workspace.querySelector(`[data-result-q="${CSS.escape(String(key))}"]`);
    if (card) card.dataset.state = ok ? "correct" : "wrong";
    if (result) {
      result.textContent = ok ? "✓ 正確！" : "✗ 需要再試。您可修改答案後再次檢查，或使用「顯示答案」。";
      result.hidden = false;
    }
    if (question.type === "gap") {
      const input = elements.workspace.querySelector(`[data-answer-q="${question.number}"]`);
      if (input) input.dataset.state = ok ? "correct" : "wrong";
    }
  });
  const score = elements.workspace.querySelector("[data-part-score]");
  const total = part.questions.reduce((sum, question) => sum + (question.type === "multi" ? question.numbers.length : 1), 0);
  score.textContent = `Part ${part.part}：${correct} / ${total} 題正確`;
  score.hidden = false;
}

function showAnswerAnalysis(number, anchor) {
  const dialog = document.querySelector("[data-answer-analysis-dialog]");
  if (!dialog) return;
  window.clearTimeout(analysisHideTimer);
  const analysis = analysisFor(number);
  const timing = PRACTICE_ONE_TIMINGS.questions[String(number)] || PRACTICE_ONE_TIMINGS.questions[number] || {};
  dialog.querySelector("[data-analysis-dialog-number]").textContent = `第 ${number} 題`;
  dialog.querySelector("[data-analysis-dialog-answer]").textContent = analysis.answer;
  dialog.querySelector("[data-analysis-dialog-copy]").textContent = analysis.explanation;
  const audioButton = dialog.querySelector("[data-analysis-dialog-audio]");
  if (audioButton) {
    audioButton.dataset.analysisDialogAudio = String(number);
    audioButton.disabled = !Number.isFinite(Number(timing.time));
  }
  const bookmarkButton = dialog.querySelector("[data-analysis-dialog-bookmark]");
  if (bookmarkButton) {
    const itemKey = `practice1:analysis:q${number}`;
    bookmarkButton.dataset.bookmarkItem = itemKey;
    bookmarkButton.dataset.bookmarkTitle = `IELTS Listening Practice 1 · 第 ${number} 題解析`;
    bookmarkButton.dataset.bookmarkDetail = analysis.explanation;
    bookmarkButton.dataset.bookmarkPart = String(timing.part || state.practicePart);
    bookmarkButton.dataset.bookmarkAnchor = `analysis-q${number}`;
    bookmarkButton.dataset.bookmarked = String(state.listeningBookmarks.has(itemKey));
    bookmarkButton.textContent = state.listeningBookmarks.has(itemKey) ? "★ 已收藏解析" : "☆ 收藏解析";
  }
  dialog.hidden = false;
  const rect = anchor.getBoundingClientRect();
  const width = Math.min(480, window.innerWidth - 24);
  dialog.style.width = `${width}px`;
  dialog.style.left = `${Math.max(12, Math.min(window.innerWidth - width - 12, rect.left))}px`;
  dialog.style.top = `${Math.max(12, Math.min(window.innerHeight - dialog.offsetHeight - 12, rect.bottom + 8))}px`;
}

function hideAnswerAnalysis() {
  window.clearTimeout(analysisHideTimer);
  const dialog = document.querySelector("[data-answer-analysis-dialog]");
  if (dialog) dialog.hidden = true;
}

function scheduleAnswerAnalysisHide() {
  window.clearTimeout(analysisHideTimer);
  analysisHideTimer = window.setTimeout(hideAnswerAnalysis, 140);
}

function bindAnswerAnalysisDialogs() {
  const dialog = document.querySelector("[data-answer-analysis-dialog]");
  elements.workspace.querySelectorAll("[data-official-answer]").forEach((button) => {
    button.addEventListener("mouseenter", () => showAnswerAnalysis(Number(button.dataset.analysisQ), button));
    button.addEventListener("focus", () => showAnswerAnalysis(Number(button.dataset.analysisQ), button));
    button.addEventListener("mouseleave", scheduleAnswerAnalysisHide);
    button.addEventListener("blur", scheduleAnswerAnalysisHide);
  });
  if (dialog) {
    dialog.onmouseenter = () => window.clearTimeout(analysisHideTimer);
    dialog.onmouseleave = hideAnswerAnalysis;
  }
}

function bindTranscriptSync(partNumber) {
  const audio = document.querySelector(`audio[data-audio-part="${partNumber}"]`);
  const host = elements.workspace.querySelector(`[data-transcript-part="${partNumber}"]`);
  if (!audio || !host) return;
  const lines = [...host.querySelectorAll("[data-transcript-line]")];
  const timingPart = PRACTICE_ONE_TIMINGS.parts[String(partNumber)] || PRACTICE_ONE_TIMINGS.parts[partNumber] || {};
  const authoredLines = Array.isArray(timingPart.lines) && timingPart.lines.length === lines.length ? timingPart.lines : [];
  const activate = () => {
    if (!state.syncHighlights || !authoredLines.length) {
      lines.forEach((line) => line.classList.remove("is-current"));
      return;
    }
    const time = Number(audio.currentTime) || 0;
    const index = authoredLines.findIndex((range) => time >= Number(range.start) && time <= Number(range.end));
    lines.forEach((line, lineIndex) => line.classList.toggle("is-current", lineIndex === index));
  };
  audio.addEventListener("timeupdate", activate);
  host.addEventListener("click", (event) => {
    const line = event.target.closest("[data-transcript-line]");
    if (!line || event.target.closest("[data-bookmark-word], [data-bookmark-item]")) return;
    const index = Number(line.dataset.transcriptLine);
    const startTime = Number(authoredLines[index]?.start);
    if (Number.isFinite(startTime)) audio.currentTime = startTime;
    audio.play().catch(() => {});
  });
  host.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-transcript-line]")) {
      event.preventDefault();
      event.target.click();
    }
  });
}

function updateTranscriptSyncControls() {
  elements.workspace.querySelectorAll("[data-toggle-transcript-sync]").forEach((button) => {
    button.setAttribute("aria-pressed", String(state.syncHighlights));
    button.textContent = `同步高亮：${state.syncHighlights ? "開" : "關"}`;
  });
  if (!state.syncHighlights) elements.workspace.querySelectorAll("[data-transcript-line]").forEach((line) => line.classList.remove("is-current"));
}

function playQuestionCue(number) {
  const timing = PRACTICE_ONE_TIMINGS.questions[String(number)] || PRACTICE_ONE_TIMINGS.questions[number];
  if (!timing) return showToast("這題的錄音時間仍在整理中。");
  const partNumber = Number(timing.part);
  if (partNumber !== state.practicePart) renderPracticePart(partNumber);
  const audio = document.querySelector(`audio[data-audio-part="${partNumber}"]`);
  if (!audio) return showToast("暫時未能載入這一段錄音。");
  audio.currentTime = Math.max(0, Number(timing.time) - 15);
  audio.playbackRate = state.speed;
  audio.play().catch(() => showToast("請先在頁面中按一下，再開始播放。"));
  updateFloatingAudio(audio);
}

function formatAudioTime(value) {
  const seconds = Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function selectedAudio() {
  return document.querySelector(`audio[data-audio-part="${state.practicePart}"]`);
}

function setFloatingAudioPart(partNumber) {
  const player = document.querySelector("[data-floating-audio]");
  if (!player) return;
  player.hidden = !(state.practice === 1 && Number(partNumber) >= 1 && Number(partNumber) <= 4);
  player.querySelector("[data-floating-part]").textContent = `Part ${partNumber}`;
  const audio = selectedAudio();
  player.querySelectorAll("button, input").forEach((control) => { control.disabled = !audio; });
  updateFloatingAudio(audio);
}

function updateFloatingAudio(audio = selectedAudio()) {
  const player = document.querySelector("[data-floating-audio]");
  if (!player || !audio || Number(audio.dataset.audioPart) !== state.practicePart) return;
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  const range = player.querySelector("[data-floating-seek]");
  range.max = String(duration || 1);
  if (!range.matches(":active")) range.value = String(current);
  player.querySelector("[data-floating-toggle]").textContent = audio.paused ? "▶ 播放" : "❚❚ 暫停";
  player.querySelector("[data-floating-time]").textContent = `${formatAudioTime(current)} / ${formatAudioTime(duration)}`;
}

async function openPractice(practice, part = 0, options = {}) {
  const number = Number(practice);
  if (!Number.isInteger(number) || number < 1 || number > 20) return;
  pauseAllAudio();
  state.practice = number;
  state.requestedPart = Number(part) >= 1 && Number(part) <= 4 ? Number(part) : 0;
  if (options.update !== false) updateRoute("ielts", state.practice, state.requestedPart);
  elements.practiceTitle.textContent = `Practice ${state.practice}`;
  elements.trackGrid.innerHTML = "";
  setCatalogueStatus("正在載入錄音…");
  showView("practice");
  try {
    await loadAudioCatalogue();
    const available = [1, 2, 3, 4].filter((partNumber) => state.tracks.has(`${state.practice}:${partNumber}`)).length;
    renderTrackCards();
    renderPracticeWorkspace();
    if (available === 4) setCatalogueStatus("四段錄音已準備好。", "ready");
    else setCatalogueStatus(`已找到 ${available}/4 段錄音；缺少的 Part 已在下方清楚標示。`, "warning");
    if (state.requestedPart) window.setTimeout(() => document.querySelector(`[data-track-part="${state.requestedPart}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  } catch (error) {
    console.warn("Listening catalogue failed", error);
    setCatalogueStatus(error?.message || "暫時未能載入錄音。", "error");
    renderTrackCards();
    renderPracticeWorkspace();
  }
}

function pauseAllAudio() {
  document.querySelectorAll("audio").forEach((audio) => audio.pause());
}

document.addEventListener("click", (event) => {
  const bookmark = event.target.closest("[data-bookmark-word], [data-bookmark-item]");
  if (bookmark) {
    event.preventDefault();
    event.stopPropagation();
    void setListeningBookmark(bookmark);
    return;
  }
  const button = event.target.closest("button");
  if (!button) return;
  if (button.matches("[data-password-toggle]")) {
    const input = elements.loginForm.elements.password;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    button.textContent = show ? "隱藏" : "顯示";
    button.setAttribute("aria-pressed", String(show));
  } else if (button.matches("[data-logout]")) logout();
  else if (button.matches("[data-home]")) openDashboard();
  else if (button.matches("[data-back-ielts]")) openSection("ielts");
  else if (button.matches("[data-part-tab]")) renderPracticePart(Number(button.dataset.partTab));
  else if (button.matches("[data-toggle-translation]")) {
    const showing = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(showing));
    button.textContent = showing ? "隱藏中文翻譯" : "顯示中文翻譯";
    elements.workspace.querySelectorAll("[data-zh]").forEach((item) => { item.hidden = !showing; });
  }
  else if (button.matches("[data-check-part]")) markPartAnswers();
  else if (button.matches("[data-show-part-answers]")) togglePartAnswers();
  else if (button.matches("[data-reveal-answer-q]")) toggleQuestionAnswer(Number(button.dataset.revealAnswerQ));
  else if (button.matches("[data-toggle-transcript-sync]")) {
    state.syncHighlights = !state.syncHighlights;
    updateTranscriptSyncControls();
    selectedAudio()?.dispatchEvent(new Event("timeupdate"));
    showToast(`錄音稿同步高亮已${state.syncHighlights ? "開啟" : "關閉"}。`);
  }
  else if (button.matches("[data-analysis-dialog-close]")) hideAnswerAnalysis();
  else if (button.matches("[data-analysis-dialog-audio]")) playQuestionCue(Number(button.dataset.analysisDialogAudio));
  else if (button.matches("[data-floating-toggle]")) {
    const audio = selectedAudio();
    if (audio?.paused) audio.play().catch(() => showToast("請先在頁面中按一下，再開始播放。")); else audio?.pause();
  }
  else if (button.matches("[data-floating-back]")) {
    const audio = selectedAudio();
    if (audio) audio.currentTime = Math.max(0, audio.currentTime - 5);
  }
  else if (button.matches("[data-floating-forward]")) {
    const audio = selectedAudio();
    if (audio) audio.currentTime = Math.min(Number.isFinite(audio.duration) ? audio.duration : audio.currentTime + 5, audio.currentTime + 5);
  }
  else if (button.dataset.openSection) openSection(button.dataset.openSection);
  else if (button.dataset.openPractice) openPractice(Number(button.dataset.openPractice));
});

document.addEventListener("change", (event) => {
  const select = event.target;
  if (select.matches("[data-multi-group]") && select.checked) {
    const selected = [...document.querySelectorAll(`[data-multi-group="${CSS.escape(select.dataset.multiGroup)}"]:checked`)];
    if (selected.length > 2) {
      select.checked = false;
      showToast("這組題目只可選擇兩項。");
    }
    return;
  }
  if (select.matches("[data-sort]")) {
    state.sort = select.value === "desc" ? "desc" : "asc";
    savePreference("edmund-listening-sort", state.sort);
    renderPracticeGrid();
  } else if (select.matches("[data-speed-part]")) {
    state.speed = normalizeSpeed(select.value);
    savePreference("edmund-listening-speed", state.speed);
    document.querySelectorAll("audio[data-audio-part]").forEach((audio) => {
      audio.defaultPlaybackRate = state.speed;
      audio.playbackRate = state.speed;
    });
    document.querySelectorAll("[data-speed-part]").forEach((control) => { control.value = String(state.speed); });
    showToast(`播放速度已設為 ${state.speed}×`);
  } else if (select.matches("[data-text-scale]")) {
    state.textScale = normalizeTextScale(select.value);
    savePreference("edmund-listening-text-scale", state.textScale);
    elements.workspace.style.setProperty("--listening-text-scale", String(state.textScale));
    showToast(`練習文字已調整為 ${state.textScale}×`);
  }
});

document.addEventListener("input", (event) => {
  if (!event.target.matches("[data-floating-seek]")) return;
  const audio = selectedAudio();
  if (audio) audio.currentTime = Number(event.target.value) || 0;
});

elements.loginForm.addEventListener("submit", handleLogin);

async function initialise() {
  setConnection("正在連接", "checking");
  try {
    await ensureSupabaseSession();
    setConnection("已連線", "online");
  } catch (error) {
    console.warn("Listening data initialization failed", error);
    setConnection("連線失敗", "error");
  }
  if (await restoreSession()) {
    setConnection("已安全連接", "online");
    await loadListeningBookmarks();
    openRequestedRoute();
  } else {
    showView("login", { scroll: false });
  }
}

initialise();
