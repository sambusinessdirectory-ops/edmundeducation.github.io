import { calculateAnswerProgress, scanningSections, BOOKMARK_LABELS, bookmarkTarget, readingBookmarkLink, validateReadingAudioTimings } from './reading-comprehension-features.mjs?v=20260904-dse-audio1';

import { DEEP_ANALYSIS_ARTICLES, createDeepAnalysisReader } from './dse-deep-analysis.mjs?v=20260904-admin-source1';
let deepReader;

const CONFIG = window.EDMUND_SUPABASE || {};
const SESSION_KEY = "edmund-reading-comprehension-session-v1";
let ARTICLE_ID = "p1-069-albert-einstein";
const CATALOGUE_VERSION = '20260829-audio1';
const DSE_CATALOGUE_VERSION = '20260905-dse-2024-b2';
const AUDIO_MANIFEST = window.EDMUND_READING_AUDIO || {};
const QUESTION_TYPE_INDEX = window.EDMUND_IELTS_READING_QUESTION_TYPES || { taxonomy: [], articles: [] };
const audioTimingCache = new Map();

const state = {
  supabase: null, token: "", user: null, view: "login", data: null, analysis: null,
  system: 'ielts', dseCatalogue: [], dseCataloguePromise: null, dseSort: 'desc',
  attemptId: null, answers: {}, results: {}, bookmarks: new Set(), bookmarkItems: new Map(), pendingBookmarks: new Set(), bookmarkError: false, activeAnalysis: 0, activeSkimming: 0, analysisMode: 'analysis',
  timerRunning: false, durationMs: 0, timerStartedAt: 0, timerHandle: 0, autosaveHandle: 0,
  timerMode: "stopwatch", countdownMinutes: 20, forceSubmit: false, submitting: false,
  answerTimings: {}, scanAssignments: {}, wordIndex: 0, toastHandle: 0, dashboard: null,
  audioItem: null, audioSetup: false, audioStopAt: null, passageTab: 1, exerciseReady: false,
  catalogue: [], cataloguePage: 0, cataloguePromise: null, opening: false, savePromise: null,
  questionType: "", questionTypeQuery: ""
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const el = {
  views: $$('[data-view]'), connection: $('[data-connection]'), user: $('[data-user]'), logout: $('[data-logout]'), home: $('[data-home]'),
  loginForm: $('[data-login-form]'), loginStatus: $('[data-login-status]'), loginButton: $('[data-login-button]'), welcome: $('[data-welcome]'),
  progressToggle: $('[data-progress-toggle]'), progressPanel: $('[data-progress-panel]'), progressLabel: $('[data-progress-label]'),
  questionChart: $('[data-question-chart]'), timeChart: $('[data-time-chart]'), questionTotal: $('[data-question-total]'), timeTotal: $('[data-time-total]'), history: $('[data-history-list]'),
  passage: $('[data-passage]'), questions: $('[data-questions]'), questionForm: $('[data-question-form]'), submissionStatus: $('[data-submission-status]'),
  timer: $('[data-timer]'), timerToggle: $('[data-timer-toggle]'), timerMode: $('[data-timer-mode]'), timerModeLabel: $('[data-timer-mode-label]'), countdownLabel: $('[data-countdown-label]'), countdownMinutes: $('[data-countdown-minutes]'), forceLabel: $('[data-force-label]'), forceSubmit: $('[data-force-submit]'),
  translationButton: $('[data-translation-menu]'), translationPanel: $('[data-translation-panel]'), translationAll: $('[data-translation-all]'),
  audio: $('[data-reading-audio]'), audioToggle: $('[data-audio-toggle]'), audioBack: $('[data-audio-back]'), audioSeek: $('[data-audio-seek]'), audioTime: $('[data-audio-time]'), audioRate: $('[data-audio-rate]'), sync: $('[data-sync-highlight]'),
  skimmingDialog: $('[data-skimming-dialog]'), analysisDialog: $('[data-analysis-dialog]'), toast: $('[data-toast]'),
  questionTypeSearch: $('[data-question-type-search]'), questionTypeResultCount: $('[data-question-type-result-count]'),
  questionTypeChips: $('[data-question-type-chips]'), questionTypeSelection: $('[data-question-type-selection]'),
  questionTypeResults: $('[data-question-type-results]'), questionTypeEmpty: $('[data-question-type-empty]'),
  dseYearGrid: $('[data-dse-year-grid]'), dseCatalogueStatus: $('[data-dse-catalogue-status]')
};

function escapeHtml(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
function listFrom(value) { if (Array.isArray(value)) return value; if (typeof value === 'string' && value.trim()) return [value]; if (value && typeof value === 'object') return Object.values(value); return []; }
function normaliseSearch(value) { return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘`]/g, "'").replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase(); }
function createNode(tagName, className = '', text = '') { const node = document.createElement(tagName); if (className) node.className = className; if (text) node.textContent = text; return node; }

const questionTypes = listFrom(QUESTION_TYPE_INDEX.types || QUESTION_TYPE_INDEX.taxonomy).map((type) => ({
  key: String(type?.key || type?.id || '').trim(),
  en: String(type?.en || type?.nameEn || type?.titleEn || type?.title || '').trim(),
  zh: String(type?.zh || type?.nameZh || type?.titleZh || type?.translation || '').trim(),
  aliases: listFrom(type?.aliases).map((alias) => String(alias || '').trim()).filter(Boolean)
})).filter((type) => type.key && type.en && type.zh);
const questionTypesByKey = new Map(questionTypes.map((type) => [type.key, type]));
const questionTypeUmbrellas = listFrom(QUESTION_TYPE_INDEX.umbrellaAliases).map((umbrella) => ({
  key: String(umbrella?.key || umbrella?.id || '').trim(),
  en: String(umbrella?.en || umbrella?.nameEn || '').trim(),
  zh: String(umbrella?.zh || umbrella?.nameZh || '').trim(),
  aliases: listFrom(umbrella?.aliases).map((alias) => String(alias || '').trim()).filter(Boolean),
  typeKeys: listFrom(umbrella?.typeKeys || umbrella?.typeIds).map((key) => String(key || '').trim())
})).filter((umbrella) => umbrella.key && umbrella.typeKeys.length);
const questionTypeArticles = listFrom(Array.isArray(QUESTION_TYPE_INDEX.articles) ? QUESTION_TYPE_INDEX.articles : QUESTION_TYPE_INDEX.articlesById || QUESTION_TYPE_INDEX.articles).filter((article) => article && typeof article === 'object');

function questionTypeKeysForArticle(article) {
  let raw = article?.types || article?.questionTypes || article?.typeKeys || [];
  if (!listFrom(raw).length && article?.questionsByType && typeof article.questionsByType === 'object') raw = Object.keys(article.questionsByType);
  return listFrom(raw).map((entry) => String(entry?.key || entry?.id || entry || '').trim()).filter((key, index, keys) => questionTypesByKey.has(key) && keys.indexOf(key) === index);
}
function matchingQuestionTypes(query) {
  const needle = normaliseSearch(query); if (!needle) return questionTypes;
  const compactNeedle = needle.replace(/\s+/g, ''); const matchingKeys = new Set();
  questionTypes.forEach((type) => {
    const haystack = normaliseSearch([type.key, type.en, type.zh, ...type.aliases].join(' ')); const compactHaystack = haystack.replace(/\s+/g, '');
    if (haystack.includes(needle) || needle.includes(haystack) || compactHaystack.includes(compactNeedle) || compactNeedle.includes(compactHaystack)) matchingKeys.add(type.key);
  });
  questionTypeUmbrellas.forEach((umbrella) => {
    const haystack = normaliseSearch([umbrella.key, umbrella.en, umbrella.zh, ...umbrella.aliases].join(' ')); const compactHaystack = haystack.replace(/\s+/g, '');
    if (haystack.includes(needle) || needle.includes(haystack) || compactHaystack.includes(compactNeedle) || compactNeedle.includes(compactHaystack)) umbrella.typeKeys.forEach((key) => matchingKeys.add(key));
  });
  return questionTypes.filter((type) => matchingKeys.has(type.key));
}
function numericQuestions(value) {
  if (Array.isArray(value)) return value.flatMap(numericQuestions).filter((number, index, numbers) => numbers.indexOf(number) === index).sort((a, b) => a - b);
  if (Number.isInteger(value)) return [value]; const numbers = [];
  for (const match of String(value || '').matchAll(/(\d{1,2})(?:\s*[–—-]\s*(\d{1,2}))?/g)) { const from = Number(match[1]); const to = Number(match[2] || match[1]); if (from < 1 || to < from || to > 99) continue; for (let number = from; number <= to; number++) numbers.push(number); }
  return numbers.filter((number, index) => numbers.indexOf(number) === index).sort((a, b) => a - b);
}
function compactQuestionRanges(value) {
  const numbers = numericQuestions(value); if (!numbers.length) return ''; const ranges = []; let start = numbers[0]; let end = start;
  for (const number of numbers.slice(1)) { if (number === end + 1) end = number; else { ranges.push(start === end ? String(start) : `${start}–${end}`); start = number; end = number; } }
  ranges.push(start === end ? String(start) : `${start}–${end}`); return ranges.join('、');
}
function articleQuestionsForType(article, typeKey) {
  const articleType = listFrom(article?.types).find((entry) => String(entry?.key || entry?.id || '').trim() === typeKey);
  return compactQuestionRanges(article?.questionsByType?.[typeKey] ?? article?.questionRanges?.[typeKey] ?? article?.rangesByType?.[typeKey] ?? articleType?.questionNumbers ?? articleType?.ranges);
}
function articleHasQuestionType(article, typeKey) { return questionTypeKeysForArticle(article).includes(typeKey); }
function questionTypeArticleCount(typeKey) { return questionTypeArticles.reduce((count, article) => count + (articleHasQuestionType(article, typeKey) ? 1 : 0), 0); }
function setConnection(text, status) { el.connection.textContent = text; el.connection.dataset.state = status; }
function setStatus(text = "", status = "") { el.loginStatus.textContent = text; el.loginStatus.dataset.state = status; }
function showToast(message) { clearTimeout(state.toastHandle); el.toast.textContent = message; el.toast.hidden = false; state.toastHandle = setTimeout(() => { el.toast.hidden = true; }, 3600); }
function showView(view) {
  deepReader?.close();
  state.view = view; el.views.forEach((node) => { node.hidden = node.dataset.view !== view; });
  const signedIn = Boolean(state.user && state.token); el.user.hidden = !signedIn; el.logout.hidden = !signedIn; el.home.hidden = !signedIn || view === "login" || view === "reading-home";
  if (signedIn) el.user.textContent = `${state.user.name} · 學生`;
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  requestAnimationFrame(() => {
    updateFloatingOffsets();
    const heading = el.views.find((node) => node.dataset.view === view)?.querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true });
      heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
    }
  });
}

function initialiseSupabase() {
  if (state.supabase) return state.supabase;
  if (!window.supabase?.createClient || !CONFIG.url || !CONFIG.anonKey) throw new Error("登入服務暫時未能載入，請重新整理頁面。");
  let storage; try { storage = sessionStorage; } catch { storage = undefined; }
  state.supabase = window.supabase.createClient(CONFIG.url, CONFIG.anonKey, { auth: { persistSession: Boolean(storage), ...(storage ? { storage } : {}), autoRefreshToken: true, detectSessionInUrl: false } });
  return state.supabase;
}
async function ensureSession() {
  const client = initialiseSupabase(); const current = await client.auth.getSession(); if (current.error) throw current.error;
  if (current.data?.session?.user?.id) return client;
  const created = await client.auth.signInAnonymously(); if (created.error) throw created.error;
  if (!created.data?.session?.user?.id) throw new Error("未能建立安全登入連線。"); return client;
}
async function rpc(name, args) { const client = await ensureSession(); const { data, error } = await client.rpc(name, args); if (error) throw error; return data; }
function saveSession() { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...state.user, token: state.token, role: "student" })); } catch {} }
function clearSession() { state.token = ""; state.user = null; state.bookmarks.clear(); state.bookmarkItems.clear(); state.exerciseReady = false; state.bookmarkError = false; closePopovers(); clearInterval(state.timerHandle); clearInterval(state.autosaveHandle); setBookmarkLibraryOpen(false); updateBookmarkControls(); try { sessionStorage.removeItem(SESSION_KEY); } catch {} }
function readSession() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } }
async function validateToken(token) {
  const rows = await rpc("flashcard_student_session_profile", { p_token: token }); const row = Array.isArray(rows) ? rows[0] : null;
  if (!row?.id || !row?.name || !row?.session_token) return false;
  state.token = String(row.session_token); state.user = { id: String(row.id), name: String(row.name), role: "student" }; saveSession();
  window.EdmundSystemNav?.rememberStudentSession({ token: state.token, id: state.user.id, name: state.user.name, role: "student" }); return true;
}
async function login(username, password) { const rows = await rpc("flashcard_student_login", { p_name: username, p_password: password }); const row = Array.isArray(rows) ? rows[0] : null; return row?.session_token ? validateToken(String(row.session_token)) : false; }
async function loadCatalogue() {
  if (state.catalogue.length) return state.catalogue;
  if (!state.cataloguePromise) state.cataloguePromise = (async () => {
    const response = await fetch(`reading-comprehension-catalogue.json?v=${CATALOGUE_VERSION}`);
    if (!response.ok) throw new Error('未能載入文章目錄。');
    const payload = await response.json();
    if (!Array.isArray(payload.articles) || !payload.articles.length) throw new Error('文章目錄資料有誤。');
    state.catalogue = payload.articles; $('[data-catalogue-count]').textContent = String(state.catalogue.length); return state.catalogue;
  })().finally(() => { state.cataloguePromise = null; });
  return state.cataloguePromise;
}
async function loadDseCatalogue() {
  if (state.dseCatalogue.length) return state.dseCatalogue;
  if (!state.dseCataloguePromise) state.dseCataloguePromise = (async () => {
    const response = await fetch(`dse-reading-catalogue.json?v=${DSE_CATALOGUE_VERSION}`);
    if (!response.ok) throw new Error('未能載入 DSE 年份目錄。');
    const payload = await response.json();
    if (!Array.isArray(payload.years) || payload.years.length !== 15) throw new Error('DSE 年份目錄資料有誤。');
    state.dseCatalogue = payload.years;
    return state.dseCatalogue;
  })().finally(() => { state.dseCataloguePromise = null; });
  return state.dseCataloguePromise;
}
async function loadArticleData(id = ARTICLE_ID) {
  await loadCatalogue();
  const entry = state.catalogue.find((item) => item.id === id);
  if (!entry) throw new Error('這篇練習暫未開放。');
  if (state.data?.id === id && state.analysis) return;
  const analysisFile = entry.analysisId.startsWith('analysis-') || ['mungo-man','if-you-can-get-used-to-the-taste'].includes(entry.analysisId)
    ? `reading-comprehension-data/${entry.analysisId.startsWith('analysis-') ? entry.analysisId : `analysis-${entry.analysisId}`}.json`
    : `ielts-reading-analysis-data/${entry.analysisId}.json`;
  const [dataResponse, analysisResponse] = await Promise.all([fetch(`reading-comprehension-data/${id}.json?v=${entry.version}`), fetch(`${analysisFile}?v=${entry.version}`)]);
  if (!dataResponse.ok || !analysisResponse.ok) throw new Error("未能載入閱讀練習資料。");
  const [data, analysis] = await Promise.all([dataResponse.json(), analysisResponse.json()]);
  if (data.id !== id || !Array.isArray(data.questions) || !data.paragraphs?.length) throw new Error('文章資料不符。');
  if (state.token && !data.paragraphs.every((p) => p.translation)) {
    try {
      const translation = await rpc('reading_comprehension_article_translation', { p_token: state.token, p_article_id: id });
      applyArticleTranslation(data, translation);
    } catch (error) {
      // Optional support must never prevent the English exercise from opening.
      data.translationLoadFailed = true;
      console.warn('Reading translation unavailable', error);
    }
  }
  ARTICLE_ID = id; state.data = data; state.analysis = analysis;
  state.activeAnalysis = 0; state.activeSkimming = 0;
}
async function loadDseArticleData(id) {
  const years = await loadDseCatalogue();
  const entry = years.flatMap((year) => Object.values(year.sections || {}).filter(Boolean)).find((item) => item.id === id);
  if (!entry) throw new Error('這份 DSE 練習尚未加入。');
  if (state.data?.id === id && state.system === 'dse') return entry;
  const response = await fetch(`dse-reading-data/${id}.json?v=${entry.version}`);
  if (!response.ok) throw new Error('未能載入 DSE 閱讀練習資料。');
  const data = await response.json();
  if (data.id !== id || !Array.isArray(data.questions) || !data.paragraphs?.length || data.displayMode) throw new Error('DSE 閱讀練習資料不符。');
  if (state.token) {
    try {
      const translation = await rpc('dse_reading_article_translation', { p_token: state.token, p_article_id: id });
      if (translation && !window.DseReadingTranslations?.apply(data, translation)) throw new Error('Translation source mismatch');
    } catch (error) {
      data.translationLoadFailed = true;
      console.warn('DSE translation unavailable', error);
    }
  }
  ARTICLE_ID = id; state.data = data; state.analysis = null;
  state.activeAnalysis = 0; state.activeSkimming = 0;
  return entry;
}
function applyArticleTranslation(data, translation) {
  if (!translation || translation.articleId !== data.id || translation.locale !== 'zh-Hant'
      || translation.sourceTitle !== data.title || translation.sourceHeading !== (data.sourceHeading || '')
      || typeof translation.title !== 'string' || !translation.title.trim()
      || typeof translation.heading !== 'string'
      || !Array.isArray(translation.paragraphs) || translation.paragraphs.length !== data.paragraphs.length) return false;
  // Reject the entire payload on source drift: never attach Chinese to a
  // different English paragraph or silently show an incomplete translation.
  if (!data.paragraphs.every((paragraph, index) => {
    const copy = translation.paragraphs[index];
    return copy?.number === paragraph.number && copy.source === paragraph.text
      && typeof copy.translation === 'string' && copy.translation.trim();
  })) return false;
  data.paragraphs.forEach((paragraph, index) => { paragraph.translation = translation.paragraphs[index].translation; });
  data.titleTranslation = translation.title; data.headingTranslation = translation.heading;
  return true;
}
async function loadBookmarks() {
  const token = state.token;
  try {
    const rows = await rpc("learning_portal_list_bookmarks", { p_token: token, p_system_key: "reading-comprehension" });
    if (token !== state.token) return;
    state.bookmarkItems = new Map((Array.isArray(rows) ? rows : []).map((row) => [String(row.item_key), { ...row, key: String(row.item_key) }]));
    state.bookmarks = new Set(state.bookmarkItems.keys()); state.bookmarkError = false; updateBookmarkControls();
  } catch (error) { if (token !== state.token) return; console.warn("Reading bookmarks unavailable", error); state.bookmarkError = true; renderBookmarkLibrary(); }
}
async function handleLogin(event) {
  event.preventDefault(); const form = new FormData(el.loginForm); const username = String(form.get("username") || "").trim(); const password = String(form.get("password") || "");
  if (!username || !password) return setStatus("請輸入用戶名稱及密碼。", "error");
  el.loginButton.disabled = true; setStatus("正在核對帳戶…");
  try { if (!await login(username, password)) throw new Error("用戶名稱或密碼不正確。"); await Promise.all([loadCatalogue(), loadBookmarks()]); el.loginForm.reset(); setStatus(); setConnection("已安全連接", "online"); await openInitialView({ afterLogin: true }); showToast(`您好，${state.user.name}！`); }
  catch (error) { console.warn(error); setStatus(error.message || "登入失敗，請稍後再試。", "error"); setConnection("連線失敗", "error"); }
  finally { el.loginButton.disabled = false; }
}
async function restoreSession() {
  const universal = window.EdmundSystemNav?.getStudentSession?.(); const local = readSession(); const candidate = universal?.role === "student" ? universal : local?.role === "student" ? local : null;
  if (!candidate?.token) return false; try { return await validateToken(String(candidate.token)); } catch { clearSession(); return false; }
}
async function logout() { pauseTimer(); el.audio.pause(); await saveAttempt(false, false, true); window.EdmundSystemNav?.forgetStudentSession(); clearSession(); try { await state.supabase?.auth.signOut(); } catch {} const url = clearReadingRoute(new URL(location.href)); history.replaceState({}, '', url); document.title = '閱讀理解學習系統｜EdmundEducation'; setConnection("已連線", "online"); showView("login"); }

function formatDuration(ms) { const seconds = Math.max(0, Math.floor(Number(ms || 0) / 1000)); return `${Math.floor(seconds / 60)} 分 ${String(seconds % 60).padStart(2, "0")} 秒`; }
function formatClock(ms) { const seconds = Math.max(0, Math.floor(Number(ms || 0) / 1000)); return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
function currentDuration() { return state.durationMs + (state.timerRunning ? Date.now() - state.timerStartedAt : 0); }
function updateTimer() {
  const elapsed = currentDuration(); const limit = state.countdownMinutes * 60000; const shown = state.timerMode === "countdown" ? Math.max(0, limit - elapsed) : elapsed; el.timer.textContent = formatClock(shown);
  if (state.timerMode === "countdown" && elapsed >= limit && state.timerRunning) { pauseTimer(); if (state.forceSubmit) { showToast("時間已到，系統正在自動提交答案。"); submitAnswers(true, true); } else showToast("時間已到；你仍可繼續完成或自行提交。"); }
}
function startTimer() { if (state.timerRunning || state.results.finalized) return; state.timerRunning = true; state.timerStartedAt = Date.now(); el.timerToggle.textContent = "❚❚ 暫停"; el.timerToggle.classList.add("is-running"); updateTimer(); }
function pauseTimer() { if (!state.timerRunning) { el.timerToggle.textContent = state.durationMs ? "▶ 繼續" : "▶ 開始"; return; } state.durationMs += Date.now() - state.timerStartedAt; state.timerRunning = false; state.timerStartedAt = 0; el.timerToggle.textContent = state.durationMs ? "▶ 繼續" : "▶ 開始"; el.timerToggle.classList.remove("is-running"); updateTimer(); }
function resetAttemptState() { state.attemptId = null; state.answers = {}; state.results = {}; state.answerTimings = {}; state.durationMs = 0; state.timerStartedAt = 0; state.timerRunning = false; state.audioStopAt = null; el.timerToggle.textContent = "▶ 開始"; el.timerToggle.classList.remove("is-running"); clearInterval(state.timerHandle); clearInterval(state.autosaveHandle); }
function recordAnswerTime(number, value) {
  if (!state.timerRunning || state.answerTimings[number] || !String(value || "").trim()) return;
  const timestamp = Math.round(currentDuration()); const previous = state.answerTimings[number - 1]?.timestamp || 0;
  state.answerTimings[number] = { timestamp, questionMs: Math.max(0, timestamp - previous) }; renderAnswerTime(number);
}
function renderAnswerTime(number) { const row = state.answerTimings[number]; const node = $(`[data-answer-time="${number}"]`); if (node && row) { node.hidden = false; node.textContent = `作答時間 ${formatClock(row.timestamp)} · 本題用時 ${formatClock(row.questionMs)}`; } }

function renderChart(container, days, metric, formatter) {
  const rows = Array.isArray(days) ? days.slice(-31) : []; if (!rows.length) { container.innerHTML = '<p class="empty-state">暫未有記錄。</p>'; return; }
  const max = Math.max(...rows.map((row) => Number(row[metric] || 0)), 1);
  container.innerHTML = rows.map((row) => { const value = Number(row[metric] || 0); const date = String(row.date || row.activity_date || "").slice(5); return `<span class="chart-bar" title="${escapeHtml(String(row.date || ""))} · ${escapeHtml(formatter(value))}"><i style="--height:${Math.max(value ? 6 : 0, Math.round(value / max * 155))}px"></i><small>${escapeHtml(date)}</small></span>`; }).join("");
}
async function loadDashboard() {
  try { state.dashboard = await rpc("reading_comprehension_student_dashboard", { p_token: state.token }); }
  catch (error) { console.warn("Reading dashboard unavailable", error); state.dashboard = { attempts: [], activityDays: [], timeDays: [], totals: {} }; }
  const snapshot = state.dashboard || {}; const activity = snapshot.activityDays || snapshot.activity_days || []; const time = snapshot.timeDays || snapshot.time_days || [];
  renderChart(el.questionChart, activity, "questions", (v) => `${v} 題`); renderChart(el.timeChart, time, "duration_ms", formatDuration);
  el.questionTotal.textContent = String(snapshot.totals?.questions || activity.reduce((sum, row) => sum + Number(row.questions || 0), 0));
  el.timeTotal.textContent = formatDuration(snapshot.totals?.duration_ms || time.reduce((sum, row) => sum + Number(row.duration_ms || 0), 0));
  const attempts = Array.isArray(snapshot.attempts) ? snapshot.attempts : [];
  el.history.innerHTML = attempts.length ? attempts.map((row) => `<article class="history-row"><span><strong>${escapeHtml(row.title || "Albert Einstein")}</strong><br><small>${escapeHtml(new Date(row.started_at).toLocaleString("zh-HK"))}</small></span><span>${Number(row.correct_count || 0)} / ${Number(row.answered_count || 0)} 題正確<br><small>${escapeHtml(formatDuration(row.duration_ms))} · ${row.status === "in_progress" ? "進行中" : "已提交"}</small></span></article>`).join("") : '<p class="empty-state">尚未有練習記錄。</p>';
}
function selectPassageTab(number, updateUrl = true) {
  if (state.passageTab !== number) state.cataloguePage = 0;
  state.passageTab = number; $$('[data-passage-tab]').forEach((button) => button.setAttribute("aria-selected", String(Number(button.dataset.passageTab) === number))); renderCatalogue();
  if (updateUrl) { const url = new URL(location.href); url.searchParams.set("passage", String(number)); history.replaceState({}, "", url); }
}
function catalogueBookmark(entry) {
  return { key: `${entry.id}:passage`, title: `[文章] ${entry.title}`, detail: `IELTS Reading · Passage ${entry.passage} · Practice ${entry.practice} · 閱讀文章及 ${entry.questionCount} 題練習`, href: readingBookmarkLink({ article: entry.id, kind: 'passage' }) };
}
function renderCatalogue() {
  if (!state.catalogue.length) return;
  const query = $('[data-catalogue-search]').value.trim().toLocaleLowerCase();
  const matches = state.catalogue.filter((entry) => entry.passage === state.passageTab && (!query || `${entry.title} practice ${entry.practice}`.toLocaleLowerCase().includes(query)));
  const pages = Math.max(1, Math.ceil(matches.length / 18)); state.cataloguePage = Math.max(0, Math.min(state.cataloguePage, pages - 1));
  $('[data-exercise-catalogue]').innerHTML = matches.slice(state.cataloguePage * 18, (state.cataloguePage + 1) * 18).map((entry) => {
    const saved = state.bookmarks.has(`${entry.id}:passage`);
    return `<section class="exercise-list panel"><div><p class="eyebrow">IELTS READING · PASSAGE ${entry.passage}</p><h2>${escapeHtml(entry.title)}</h2><p>Practice ${entry.practice} · ${entry.paragraphCount} 個段落 · ${entry.questionCount} 題</p></div><div class="exercise-actions"><button class="secondary-button" type="button" data-catalogue-bookmark="${escapeHtml(entry.id)}" aria-pressed="${saved}">${saved ? '★ 已收藏文章與題目組' : '☆ 收藏文章與題目組'}</button><a class="secondary-button button-link" href="flashcards.html?deck=${encodeURIComponent(`ielts/reading/passage-${entry.passage}/Practice ${entry.practice}`)}">溫習 Flash Cards</a>${entry.downloadId ? `<a class="secondary-button button-link" href="model-essay-downloads.html?catalog=reading-passage-${entry.passage}&amp;item=${encodeURIComponent(entry.downloadId)}">下載練習 PDF</a>` : ''}<button class="primary-button" type="button" data-open-exercise="${escapeHtml(entry.id)}">開始閱讀練習</button></div></section>`;
  }).join('') || '<p class="panel empty-state">找不到符合的文章，請試試其他名稱或編號。</p>';
  $('[data-catalogue-status]').textContent = `Passage ${state.passageTab} · ${matches.length} 篇文章`;
  $('[data-catalogue-page]').textContent = `${state.cataloguePage + 1} / ${pages}`;
  $('[data-catalogue-previous]').disabled = state.cataloguePage === 0; $('[data-catalogue-next]').disabled = state.cataloguePage >= pages - 1;
}
function questionTypeUrl(type = state.questionType, query = state.questionTypeQuery) {
  const url = new URL(location.href); ['article', 'question', 'paragraph', 'section'].forEach((key) => url.searchParams.delete(key)); url.hash = ''; url.searchParams.set('passage', String([1, 2, 3].includes(state.passageTab) ? state.passageTab : 1)); url.searchParams.set('view', 'question-types');
  if (type) url.searchParams.set('type', type); else url.searchParams.delete('type'); if (query) url.searchParams.set('q', query); else url.searchParams.delete('q'); return url;
}
function renderQuestionTypeChip(type) {
  const button = createNode('button', 'question-type-chip'); button.type = 'button'; button.dataset.questionType = type.key; button.setAttribute('aria-pressed', state.questionType === type.key ? 'true' : 'false'); button.setAttribute('aria-label', `${type.en}，${type.zh}，${questionTypeArticleCount(type.key)} 篇練習`);
  button.append(createNode('strong', '', type.en), createNode('span', '', type.zh), createNode('small', '', `${questionTypeArticleCount(type.key)} 篇`)); button.addEventListener('click', () => openQuestionTypeDirectory(type.key, '', true)); return button;
}
function sortedQuestionTypeArticles(articles) { return [...articles].sort((left, right) => (Number(left.passage) || 99) - (Number(right.passage) || 99) || (Number(left.practice) || 999) - (Number(right.practice) || 999) || String(left.title || '').localeCompare(String(right.title || ''), 'en', { numeric: true, sensitivity: 'base' })); }
function renderQuestionTypeTag(article, type, matchedKeys) { const range = articleQuestionsForType(article, type.key); const tag = createNode('span', `question-type-result-tag${matchedKeys.has(type.key) ? ' is-match' : ''}`); tag.append(createNode('strong', '', type.en), createNode('span', '', type.zh)); if (range) tag.append(createNode('small', '', `Q${range}`)); return tag; }
function renderQuestionTypeResult(article, matchedKeys) {
  const card = createNode('article', 'question-type-result-card'); card.setAttribute('role', 'listitem'); const passage = Number(article.passage); const practice = Number(article.practice); const title = String(article.title || `IELTS Reading Practice ${practice || ''}`).trim(); const meta = [1, 2, 3].includes(passage) ? [`Passage ${passage}`] : []; if (Number.isFinite(practice) && practice > 0) meta.push(`Practice ${practice}`);
  const tags = createNode('div', 'question-type-result-tags'); tags.setAttribute('aria-label', '本篇練習題型及題號'); tags.append(...questionTypeKeysForArticle(article).map((key) => questionTypesByKey.get(key)).filter(Boolean).map((type) => renderQuestionTypeTag(article, type, matchedKeys)));
  const action = createNode('div', 'question-type-result-action'); const articleId = String(article.id || article.articleId || '').trim(); if (articleId && [1, 2, 3].includes(passage)) { const button = createNode('button', 'question-type-practice-button', '開始閱讀練習'); button.type = 'button'; button.dataset.openExercise = articleId; button.setAttribute('aria-label', `開始 ${title} 閱讀練習`); action.append(button); }
  card.append(createNode('p', 'question-type-result-meta', meta.join(' · ')), createNode('h2', '', title), tags, action); return card;
}
function setQuestionTypeEmpty(title, message, visible) { $('strong', el.questionTypeEmpty).textContent = title; $('p', el.questionTypeEmpty).textContent = message; el.questionTypeEmpty.hidden = !visible; }
function renderQuestionTypeSelection(types, articleCount) {
  el.questionTypeSelection.hidden = false;
  if (state.questionType && types.length === 1) { const type = types[0]; el.questionTypeSelection.replaceChildren(createNode('h2', '', `${type.en} · ${type.zh}`), createNode('p', '', `找到 ${articleCount} 篇含有這種題型的完整閱讀練習。`)); return; }
  if (normaliseSearch(state.questionTypeQuery)) { el.questionTypeSelection.replaceChildren(createNode('h2', '', `找到 ${types.length} 種相符題型`), createNode('p', '', types.length ? types.map((type) => `${type.en}（${type.zh}）`).join('、') : '請嘗試英文題型、中文名稱或較短的關鍵字。')); return; }
  el.questionTypeSelection.replaceChildren(createNode('h2', '', '選擇一種題型'), createNode('p', '', '點選下方題型，或輸入英文／中文名稱，即可找到對應的完整閱讀練習。'));
}
function renderQuestionTypeView() {
  const requestedType = questionTypesByKey.get(state.questionType); const hasQuery = Boolean(normaliseSearch(state.questionTypeQuery)); const matchedTypes = requestedType ? [requestedType] : matchingQuestionTypes(state.questionTypeQuery); const matchedKeys = new Set(matchedTypes.map((type) => type.key)); const shouldShowResults = Boolean(requestedType || hasQuery); const matches = shouldShowResults && matchedKeys.size ? sortedQuestionTypeArticles(questionTypeArticles.filter((article) => questionTypeKeysForArticle(article).some((key) => matchedKeys.has(key)))) : [];
  el.questionTypeSearch.value = state.questionTypeQuery; el.questionTypeChips.replaceChildren(...(hasQuery ? matchedTypes : questionTypes).map(renderQuestionTypeChip)); el.questionTypeResults.setAttribute('role', 'list'); el.questionTypeResults.replaceChildren(...matches.map((article) => renderQuestionTypeResult(article, matchedKeys))); renderQuestionTypeSelection(matchedTypes, matches.length);
  if (!questionTypes.length || !questionTypeArticles.length) { el.questionTypeResultCount.textContent = '題型索引暫時未能載入'; setQuestionTypeEmpty('題型索引暫時未能載入', '請重新整理頁面；Passage 文章目錄仍可正常使用。', true); return; }
  if (!shouldShowResults) { el.questionTypeResultCount.textContent = `共 ${questionTypes.length} 種題型，涵蓋 ${questionTypeArticles.length} 篇閱讀練習`; setQuestionTypeEmpty('', '', false); return; }
  el.questionTypeResultCount.textContent = matchedTypes.length ? `找到 ${matchedTypes.length} 種相符題型、${matches.length} 篇閱讀練習` : '找不到相符題型'; setQuestionTypeEmpty('找不到相符題型', '請嘗試英文題型、中文名稱或較短的關鍵字。', matchedTypes.length === 0);
}
function openQuestionTypeDirectory(type = '', query = '', push = false) { state.questionType = questionTypesByKey.has(type) ? type : ''; state.questionTypeQuery = state.questionType ? '' : String(query || ''); renderQuestionTypeView(); showView('question-types'); document.title = 'By Question Type｜閱讀理解學習系統'; history[push ? 'pushState' : 'replaceState']({}, '', questionTypeUrl()); }
async function prepareForReadingNavigation() {
  pauseTimer(); el.audio.pause();
  if (state.system === 'dse' && state.view === 'exercise') saveDseDraft();
  if (state.system === 'ielts' && state.view === 'exercise' && state.exerciseReady && !state.results.finalized) {
    collectAnswers();
    const needsSave = state.attemptId || Object.keys(state.answers).length || currentDuration();
    if (needsSave && !await saveAttempt(false, false, true)) {
      showToast('未能儲存目前的練習，請檢查連線後再切換頁面。');
      return false;
    }
  }
  closePopovers();
  return true;
}
function clearReadingRoute(url, { keepPassage = false } = {}) {
  ['article', 'view', 'type', 'q', 'question', 'paragraph', 'section', 'year'].forEach((key) => url.searchParams.delete(key));
  if (!keepPassage) url.searchParams.delete('passage');
  url.hash = '';
  return url;
}
async function openReadingHome() {
  if (!await prepareForReadingNavigation()) return;
  const url = clearReadingRoute(new URL(location.href));
  history.replaceState({}, '', url);
  document.title = '選擇閱讀理解系統｜EdmundEducation';
  showView('reading-home');
}
function renderDseCatalogue() {
  const years = [...state.dseCatalogue].sort((left, right) => state.dseSort === 'asc' ? left.year - right.year : right.year - left.year);
  el.dseYearGrid.innerHTML = years.map((year) => {
    const readyCount = Object.values(year.sections || {}).filter(Boolean).length;
    const sections = ['A', 'B1', 'B2'].map((section) => {
      const entry = year.sections?.[section];
      const label = entry ? `${year.year} Part ${section}：${entry.title}` : `${year.year} Part ${section} 尚未加入`;
      return `<button class="dse-section-button${entry ? ' is-ready' : ''}" type="button" data-open-dse-exercise="${escapeHtml(entry?.id || '')}" aria-label="${escapeHtml(label)}"${entry ? '' : ' disabled'}>${section}</button>`;
    }).join('');
    return `<section class="dse-year-card${readyCount ? ' is-ready' : ''}"><div class="dse-year-card-header"><h2>${year.year}</h2><span class="dse-year-card-badge">${readyCount ? `${readyCount} 份已加入` : '稍後加入'}</span></div><div class="dse-section-buttons">${sections}</div></section>`;
  }).join('');
  const readyParts = years.reduce((total, year) => total + Object.values(year.sections || {}).filter(Boolean).length, 0);
  el.dseCatalogueStatus.textContent = `2012–2026 · 共 ${years.length} 個年份 · ${readyParts} 份試卷現已開放`;
  $$('[data-dse-sort]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.dseSort === state.dseSort)));
}
async function openDseDashboard() {
  if (!await prepareForReadingNavigation()) return;
  state.system = 'dse';
  await loadDseCatalogue();
  const url = clearReadingRoute(new URL(location.href));
  url.searchParams.set('view', 'dse');
  history.replaceState({}, '', url);
  renderDseCatalogue();
  document.title = 'DSE 閱讀理解｜EdmundEducation';
  showView('dse-dashboard');
}
async function enterIeltsReading() {
  state.system = 'ielts';
  const url = clearReadingRoute(new URL(location.href));
  url.searchParams.set('passage', '1');
  history.replaceState({}, '', url);
  state.passageTab = 1;
  await openDashboard();
}
async function openDashboard() {
  if (!await prepareForReadingNavigation()) return;
  state.system = 'ielts';
  await loadCatalogue(); showView("dashboard"); el.welcome.textContent = `您好，${state.user.name}！請選擇 IELTS 閱讀練習。`;
  selectPassageTab(Math.max(1, Math.min(3, Number(new URLSearchParams(location.search).get("passage")) || state.passageTab)), false);
  const url = new URL(location.href); ['article', 'view', 'type', 'q', 'question', 'paragraph', 'section'].forEach((key) => url.searchParams.delete(key)); url.hash = ''; history.replaceState({}, '', url);
  document.title = 'IELTS 閱讀理解｜EdmundEducation';
  await Promise.all([loadDashboard(), loadBookmarks()]); updateBookmarkControls();
}

function setExerciseSystem(system) {
  const dse = system === 'dse'; state.system = system;
  $('[data-view="exercise"]').classList.toggle('dse-exercise', dse);
  $$('[data-ielts-only]').forEach((node) => { node.hidden = dse; });
  $('[data-dse-tools-notice]').hidden = !dse;
  $('[data-dse-draft-note]').hidden = !dse;
  if (dse) { el.forceSubmit.checked = false; state.forceSubmit = false; el.forceLabel.hidden = true; }
}

function updateAnswerProgress() {
  const controls = $$('[data-answer-part]', el.questionForm).map((input) => ({ part: input.dataset.answerPart, name: input.name, type: input.type, value: input.value, checked: input.checked, slots: input.dataset.answerSlots }));
  const progress = calculateAnswerProgress(controls);
  const text = `${progress.answered} / ${progress.total} 個作答部分 · ${progress.percent}%`;
  $('[data-answer-progress]').value = progress.percent;
  $('[data-answer-progress]').textContent = `${progress.percent}%`;
  $('[data-answer-progress]').setAttribute('aria-valuetext', text);
  if ($('[data-answer-progress-text]').textContent !== text) $('[data-answer-progress-text]').textContent = text;
  return progress;
}
function setAnswerProgressVisible(visible, remember = false) {
  $('[data-answer-progress-content]').hidden = !visible;
  $('[data-answer-progress-dock]').classList.toggle('is-collapsed', !visible);
  const button = $('[data-answer-progress-toggle]'); button.textContent = visible ? '隱藏進度' : '顯示答題進度'; button.setAttribute('aria-expanded', String(visible));
  if (remember) { try { localStorage.setItem('edmund-reading-progress-hidden', String(!visible)); } catch {} }
  requestAnimationFrame(updateFloatingOffsets);
}
function updateFloatingOffsets() {
  const headerHeight = $('.edmund-system-header')?.offsetHeight || 76;
  const progressHeight = state.view === 'exercise' ? $('[data-answer-progress-dock]').offsetHeight + 10 : 0;
  const toolbar = $('.study-toolbar');
  const toolbarHeight = state.view === 'exercise' && getComputedStyle(toolbar).position === 'sticky' ? toolbar.offsetHeight + 12 : 0;
  document.documentElement.style.setProperty('--reading-header-height', `${headerHeight + 8}px`);
  document.documentElement.style.setProperty('--reading-progress-height', `${progressHeight}px`);
  document.documentElement.style.setProperty('--reading-tools-height', `${toolbarHeight}px`);
}

function interactiveWords(text, context, spoken = false) {
  let html = ""; let last = 0; let localIndex = 0; const regex = /[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu; let match;
  while ((match = regex.exec(text))) {
    if (state.system === 'dse' && spoken) {
      html += escapeHtml(text.slice(last, match.index)) + `<span class="spoken-word" data-word-index="${state.wordIndex++}">${escapeHtml(match[0])}</span>`;
      last = regex.lastIndex; continue;
    }
    const key = `word:${ARTICLE_ID}:${context}:w${localIndex++}`; const classes = ["interactive-word", spoken ? "spoken-word" : "", state.bookmarks.has(key) ? "is-bookmarked" : ""].filter(Boolean).join(" ");
    html += escapeHtml(text.slice(last, match.index)); html += `<span class="${classes}" data-word-key="${escapeHtml(key)}" data-word-context="${escapeHtml(context)}"${spoken ? ` data-word-index="${state.wordIndex++}"` : ""}>${escapeHtml(match[0])}</span>`; last = regex.lastIndex;
  }
  return html + escapeHtml(text.slice(last));
}
function dseTranslationCopy(object, key, scope = 'question', paragraphNumber = null) {
  if (state.system !== 'dse') return '';
  const text = window.DseReadingTranslations?.get(object, key);
  if (!text) return '';
  const attribute = scope === 'question' ? 'data-question-translation' : paragraphNumber == null ? 'data-translation-heading' : `data-translation-copy="${paragraphNumber}"`;
  return `<span class="dse-translation-copy" ${attribute} hidden lang="zh-Hant">${escapeHtml(text)}</span>`;
}
function renderContentFigures(figures, className, scope = 'question', paragraphNumber = null) {
  return (figures || []).map((figure) => `<figure class="${className}${figure.wide ? ' is-wide' : ''}${figure.small ? ' is-small' : ''}"><img src="${escapeHtml(figure.src)}" alt="${escapeHtml(figure.alt || '')}" loading="lazy">${figure.caption ? `<figcaption>${escapeHtml(figure.caption)}${dseTranslationCopy(figure, 'caption', scope, paragraphNumber)}</figcaption>` : ''}${figure.alt !== figure.caption ? dseTranslationCopy(figure, 'alt', scope, paragraphNumber) : ''}</figure>`).join('');
}
function renderPassage() {
  const dse = state.system === 'dse';
  const sourceImage = state.data.sourceImage ? `<figure class="dse-passage-figure"><img src="${escapeHtml(state.data.sourceImage.src)}" alt="${escapeHtml(state.data.sourceImage.alt || '')}" loading="eager">${dseTranslationCopy(state.data.sourceImage, 'alt', 'passage')}</figure>` : '';
  const sourceHeader = `${state.data.sourceLabel ? `<p class="eyebrow">${escapeHtml(state.data.sourceLabel)}</p>` : ''}${state.data.sourceHeading ? `<p class="source-heading">${escapeHtml(state.data.sourceHeading)}</p>${state.data.headingTranslation ? `<p class="translation-copy" data-translation-heading hidden lang="zh-Hant">${escapeHtml(state.data.headingTranslation)}</p>` : ''}` : ''}${sourceImage}${state.data.titleTranslation && !state.data.headingTranslation ? `<p class="translation-copy" data-translation-heading hidden lang="zh-Hant">${escapeHtml(state.data.titleTranslation)}</p>` : ''}${state.data.sourceNote ? `<p class="dse-source-note">${escapeHtml(state.data.sourceNote)}</p>` : ''}`;
  const sourceNotes = state.data.passageNotes?.length ? `<section class="dse-source-note"><strong>Notes</strong><br>${state.data.passageNotes.map((note, index) => escapeHtml(note) + dseTranslationCopy(state.data.passageNotes, index, 'passage')).join('<br>')}</section>` : '';
  const headerKeys = ['title', 'sourceLabel', 'sourceHeading', 'sourceNote'];
  const translatedHeader = headerKeys.filter((key, index) => !headerKeys.slice(0, index).some(previous => state.data[previous] === state.data[key])).map(key => dseTranslationCopy(state.data, key, 'passage')).join('');
  state.wordIndex = 0; el.passage.innerHTML = sourceHeader + translatedHeader + state.data.paragraphs.map((paragraph) => { const paragraphImage = renderContentFigures(paragraph.images || (paragraph.image ? [paragraph.image] : []), 'dse-paragraph-figure', 'passage', paragraph.number); return `<section class="passage-paragraph" id="paragraph-${paragraph.number}"><div class="paragraph-heading"><span class="paragraph-label">${dse ? '' : 'PARAGRAPH '}${escapeHtml(paragraph.label || paragraph.number)}${dseTranslationCopy(paragraph, 'label', 'passage', paragraph.number)}</span>${dse ? '' : `<span class="scan-tags" data-scan-tags="${paragraph.number}" aria-label="已選擇此段的題目"></span>`}<button class="paragraph-audio-button" type="button" data-play-paragraph="${paragraph.number}" aria-label="朗讀第 ${paragraph.number} 段">▶ 朗讀本段</button>${dse ? '' : readingBookmarkButton('paragraph', paragraph.number)}</div>${paragraphImage}<div class="passage-text-block">${interactiveWords(paragraph.text, `p${paragraph.number}`, true)}${dse && paragraph.table ? renderSourceTable(paragraph.table, null, 'passage', paragraph.number) : ''}</div>${paragraph.translation ? `<div class="translation-copy" data-translation-copy="${paragraph.number}" hidden lang="zh-Hant">${escapeHtml(paragraph.translation)}</div>` : ''}${dse ? '' : `<button class="skimming-button" type="button" data-skimming="${paragraph.number}">Skimming Tips · ${escapeHtml(paragraph.label || paragraph.number)}</button>`}</section>`; }).join("") + sourceNotes;
  $('[data-translation-options]').innerHTML = '<legend>或選擇指定段落</legend>' + state.data.paragraphs.filter((p) => p.translation).map((p) => `<label><input type="checkbox" data-translation-paragraph="${p.number}"> ${dse ? escapeHtml(window.DseReadingTranslations?.get(p, 'label') || p.label || `第 ${p.number} 段`) : `第 ${escapeHtml(p.label || p.number)} 段`}</label>`).join('');
  const translated = state.data.paragraphs.some((p) => p.translation); el.translationAll.disabled = !translated; el.translationAll.checked = false; $('[data-translation-availability]').hidden = translated;
  $('[data-translation-availability]').textContent = state.data.translationLoadFailed ? '中文翻譯暫時未能載入；你仍可閱讀英文及作答，請稍後重新整理。' : '這篇文章的完整中文翻譯正在逐篇整理中。';
  renderScanTags();
}
function normalizedOption(option) { return typeof option === "string" ? { value: option, label: option, translation: "" } : option; }
function renderAnswerControl(control, name, partId) {
  const type = control.type || 'text'; const options = control.options || [];
  if (['choice', 'multiple'].includes(type)) return `<div class="choice-list">${options.map((entry, index) => { const option = normalizedOption(entry); return `<label><input type="${type === 'multiple' ? 'checkbox' : 'radio'}" name="${escapeHtml(name)}" data-answer-part="${escapeHtml(partId)}" data-answer-slots="${control.slots || 1}" value="${escapeHtml(option.value)}"><span><strong>${escapeHtml(option.label)}</strong>${option.translation ? `<small class="option-translation" data-question-translation hidden><br>${escapeHtml(option.translation)}</small>` : ''}${typeof entry === 'string' ? dseTranslationCopy(options, index) : dseTranslationCopy(entry, 'label')}</span></label>`; }).join('')}</div>${type === 'multiple' && control.selectionLimit !== false ? `<small>請選擇 ${control.slots || 1} 項。</small>` : ''}`;
  if (type === 'select') return `<select class="answer-input" name="${escapeHtml(name)}" data-answer-part="${escapeHtml(partId)}" aria-label="${escapeHtml(control.label || '選擇答案')}"><option value="">選擇答案</option>${options.map((entry, index) => { const option = normalizedOption(entry); const chinese = state.system === 'dse' ? window.DseReadingTranslations?.get(typeof entry === 'string' ? options : entry, typeof entry === 'string' ? index : 'label') : ''; return `<option value="${escapeHtml(option.value)}"${chinese ? ` data-english-label="${escapeHtml(option.label)}" data-chinese-label="${escapeHtml(chinese)}"` : ''}>${escapeHtml(option.label)}</option>`; }).join('')}</select>`;
  if (type === 'textarea') return `<textarea class="answer-input" name="${escapeHtml(name)}" data-answer-part="${escapeHtml(partId)}" aria-label="${escapeHtml(control.label || '輸入答案')}" autocomplete="off" maxlength="1200" placeholder="${escapeHtml(control.placeholder || '輸入答案')}"></textarea>${dseTranslationCopy(control, 'placeholder')}`;
  return `<input class="answer-input" name="${escapeHtml(name)}" data-answer-part="${escapeHtml(partId)}" aria-label="${escapeHtml(control.label || '輸入答案')}" autocomplete="off" maxlength="300" placeholder="${escapeHtml(control.placeholder || '輸入答案')}">${dseTranslationCopy(control, 'placeholder')}`;
}
function renderQuestionControls(question) {
  if (question.tables?.length) {
    const remainingParts = question.parts?.filter((part) => !part.inTable);
    const remainingControls = !question.parts?.length || remainingParts?.length ? renderQuestionControls({ ...question, tables: undefined, parts: remainingParts }) : '';
    return question.tables.map((table) => renderSourceTable(table, question)).join('') + remainingControls;
  }
  if (question.parts?.length) return `<div class="question-parts">${question.parts.map((part) => { const name = `q${question.number}_${part.key}`; return `<div class="question-part"><span>${escapeHtml(part.label)}${dseTranslationCopy(part, 'label')}</span>${renderAnswerControl(part, name, name)}</div>`; }).join('')}</div>`;
  return renderAnswerControl(question, `q${question.number}`, `q${question.number}`);
}
function renderSourceTable(table, question = null, scope = 'question', paragraphNumber = null) {
  const columns = Math.max(...table.rows.map(row => row.reduce((count, cell) => count + (cell.colSpan || 1), 0)));
  const renderText = text => scope === 'passage' ? interactiveWords(text, `p${paragraphNumber}-table`, true) : escapeHtml(text);
  return `<div class="source-table-scroll" role="region" aria-label="${escapeHtml(table.caption || 'Source table')}" tabindex="0"><table class="source-table${table.compact ? ' is-compact' : ''}${table.flow ? ' is-flow' : ''}${columns > 2 ? ' is-wide' : ''}">${table.caption ? `<caption>${renderText(table.caption)}${dseTranslationCopy(table, 'caption', scope, paragraphNumber)}</caption>` : ''}<tbody>${table.rows.map((row) => `<tr>${row.map((cell, cellIndex) => {
    const item = typeof cell === 'string' ? { text: cell } : cell;
    const tag = item.header ? 'th' : 'td';
    const fields = (item.parts || (item.part ? [item.part] : [])).map((key) => question?.parts?.find((entry) => entry.key === key)).filter(Boolean);
    const controls = fields.map((part) => { const name = `q${question.number}_${part.key}`; const control = renderAnswerControl(part, name, name); return fields.length > 1 ? `<div class="table-answer-field"><span>${escapeHtml(part.label)}${dseTranslationCopy(part, 'label')}</span>${control}</div>` : dseTranslationCopy(part, 'label') + control; }).join('');
    return `<${tag}${item.colSpan > 1 ? ` colspan="${item.colSpan}"` : ''}${item.rowSpan > 1 ? ` rowspan="${item.rowSpan}"` : ''}>${renderText(item.text || '')}${typeof cell === 'string' ? dseTranslationCopy(row, cellIndex, scope, paragraphNumber) : dseTranslationCopy(cell, 'text', scope, paragraphNumber)}${controls}</${tag}>`;
  }).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function updateQuestionTranslations() {
  const visible = $('[data-question-translations]').checked;
  $$('[data-question-translation]').forEach(node => { node.hidden = !visible; });
  $$('option[data-chinese-label]').forEach(option => { option.textContent = visible ? `${option.dataset.englishLabel} · ${option.dataset.chineseLabel}` : option.dataset.englishLabel; });
}
function renderQuestions() {
  const groupLabels = state.data.instructions || {}; let group = "";
  el.questions.innerHTML = state.data.questions.map((question) => {
    const sourceGroup = state.data.questionGroups?.find((item) => item.id === question.group);
    const heading = group !== question.group ? `<p class="question-group-heading">${escapeHtml(groupLabels[question.group])}${dseTranslationCopy(groupLabels, question.group)}</p>${sourceGroup ? `<div class="original-question-group">${state.system === 'dse' ? escapeHtml(sourceGroup.text) : interactiveWords(sourceGroup.text, `g${sourceGroup.start}`)}${dseTranslationCopy(sourceGroup, 'text')}</div>` : ''}` : ""; group = question.group;
    const controls = renderQuestionControls(question);
    const scanButtons = state.data.paragraphs.map((p) => `<button type="button" data-scan-choice="${question.number}:${p.number}">P${escapeHtml(p.label || p.number)}</button>`).join("");
    const figure = renderContentFigures(question.figures || (question.figure ? [question.figure] : []), 'question-figure');
    const marks = question.marks ? `<p class="question-meta">${question.marks} marks</p>` : '';
    const context = question.context ? `<div class="original-question-group">${state.system === 'dse' ? escapeHtml(question.context) : interactiveWords(question.context, `q${question.number}`)}${dseTranslationCopy(question, 'context')}</div>` : '';
    const optionBank = question.optionBank ? `<div class="question-option-bank">${Array.isArray(question.optionBank) ? question.optionBank.map((option, index) => `<div>${escapeHtml(option)}${dseTranslationCopy(question.optionBank, index)}</div>`).join('') : escapeHtml(question.optionBank) + dseTranslationCopy(question, 'optionBank')}</div>` : '';
    const translation = (question.translation ? `<p class="question-translation" data-question-translation hidden>${escapeHtml(question.translation)}</p>` : '') + dseTranslationCopy(question, 'prompt');
    const actions = state.system === 'dse' ? (DEEP_ANALYSIS_ARTICLES.has(ARTICLE_ID) ? `<div class="deep-entry"><button type="button" data-deep-analysis="${question.number}">查看答案 · 深度研讀 ↗</button><small>完成本題後，逐步拆解證據、推理與陷阱；原書內容完整保留。</small></div>` : '') : `<div class="question-actions"><button class="scan-button" type="button" data-scan-question="${question.number}">Scan：選擇段落</button><button class="scanning-tip-button" type="button" data-scanning-tip="${question.number}">Scanning 提示</button><button class="reveal-button" type="button" data-reveal="${question.number}">顯示答案及分析</button><span class="question-result" data-question-result="${question.number}"></span></div><div class="scan-chooser" data-scan-chooser="${question.number}" hidden><span>答案最可能在哪一段？</span>${scanButtons}</div><small class="answer-timestamp" data-answer-time="${question.number}" hidden></small>`;
    const bookmark = state.system === 'dse' ? '' : `<div class="question-bookmark-row">${readingBookmarkButton('question', question.number)}</div>`;
    return `${heading}<section class="question-card" id="question-${question.number}" data-question="${question.number}">${bookmark}<p class="question-prompt"><span class="question-number">${question.number}</span>${state.system === 'dse' ? escapeHtml(question.prompt) : interactiveWords(question.prompt, `q${question.number}`)}</p>${marks}${translation}${context}${question.figuresAfterControls ? '' : figure}${optionBank}${controls}${question.figuresAfterControls ? figure : ''}${actions}</section>`;
  }).join("");
  if (state.system !== 'dse' && state.data.questionPages?.length) el.questions.insertAdjacentHTML('afterbegin', `<details class="original-pages"><summary>查看原題完整排版、圖表及選項</summary>${state.data.questionPages.map((src) => `<a href="${escapeHtml(src)}" target="_blank" rel="noopener"><img src="${escapeHtml(src)}" alt="原題頁面（可開啟放大）" loading="lazy"></a>`).join('')}</details>`);
  state.data.questions.filter((q) => q.requiresReview).forEach((q) => $(`[data-question="${q.number}"]`).insertAdjacentHTML('afterbegin','<p class="review-notice">原題或答案需教師核對；本題可儲存，但暫不自動計分。</p>'));
  if (state.system === 'ielts') updateScanControls();
  const questionTranslationsAvailable = state.system !== 'dse' || Boolean(state.data.dseTranslation);
  $('[data-question-translations]').disabled = !questionTranslationsAvailable;
  $('[data-question-translation-availability]').hidden = questionTranslationsAvailable;
  $('[data-question-translation-availability]').textContent = state.data.translationLoadFailed ? '題目中文翻譯暫時未能載入，請稍後重新整理。' : '這份試卷的題目中文翻譯尚未加入。';
  updateQuestionTranslations();
  updateAnswerProgress();
}
function collectAnswers() {
  const form = new FormData(el.questionForm);
  const names = new Set(state.data.questions.flatMap((question) => question.parts?.length
    ? question.parts.map((part) => `q${question.number}_${part.key}`)
    : [`q${question.number}`]));
  $$('[data-answer-part]', el.questionForm).forEach((control) => names.add(control.name));
  names.forEach((name) => { const value = form.getAll(name).map(String).map((entry) => entry.trim()).filter(Boolean).sort().join(', '); if (value) state.answers[name] = value; else delete state.answers[name]; });
  return state.answers;
}
function dseDraftKey() {
  const base = `edmund-dse-reading-draft-v1:${state.user?.id || 'student'}:${ARTICLE_ID}`;
  return state.data?.questionRevision ? `${base}:${state.data.questionRevision}` : base;
}
function saveDseDraft() { if (state.system !== 'dse') return; collectAnswers(); try { localStorage.setItem(dseDraftKey(), JSON.stringify(state.answers)); } catch {} }
async function verifyDeepAnalysisSourceAdmin() {
  // A local role flag alone is not proof of administrator identity.
  // Revalidate the existing Flashcard admin credentials; never store new ones.
  try {
    const saved = JSON.parse(sessionStorage.getItem('edmundFlashcardSession') || 'null');
    if (saved?.role !== 'admin' && saved?.impersonatedByAdmin !== true) return false;
    const password = sessionStorage.getItem('edmundFlashcardAdminPassword');
    if (!password) return false;
    const name = saved.role === 'admin' ? saved.name : 'Sam';
    const rows = await rpc('flashcard_admin_login', { p_name: name, p_password: password });
    return Array.isArray(rows) && rows.some(row => row.role === 'admin' && row.name === name);
  } catch { return false; }
}
function openDseDeepAnalysis(number, trigger) {
  if (state.system !== 'dse' || !DEEP_ANALYSIS_ARTICLES.has(ARTICLE_ID)) return;
  const question = state.data.questions.find(q => q.number === number);
  const panel = $(`[data-question="${number}"]`, el.questionForm);
  if (!question || !panel) return;
  const inputs = $$('[data-answer-part]', panel);
  const progress = calculateAnswerProgress(inputs.map(input => ({ part: input.dataset.answerPart, name: input.name, type: input.type, value: input.value, checked: input.checked, slots: input.dataset.answerSlots })));
  if (progress.answered < progress.total) {
    showToast('請先完成本題各部分，再查看答案及完整解說。');
    inputs.find(input => !input.value || ((input.type === 'radio' || input.type === 'checkbox') && !inputs.some(other => other.name === input.name && other.checked)))?.focus();
    return;
  }
  saveDseDraft(); pauseTimer(); el.audio.pause(); closePopovers();
  const names = [...new Set(inputs.map(input => input.name))];
  const answer = names.map(name => {
    const part = question.parts?.find(part => name === `q${number}_${part.key}`);
    return `${part?.label ? part.label + ': ' : ''}${state.answers[name] || ''}`;
  }).join('\n');
  deepReader ||= createDeepAnalysisReader({ verifySourceAdmin: verifyDeepAnalysisSourceAdmin });
  deepReader.open(state.data, number, state.user.id, answer, trigger);
}
function restoreDseDraft() {
  if (state.system !== 'dse') return;
  try { state.answers = JSON.parse(localStorage.getItem(dseDraftKey()) || '{}') || {}; } catch { state.answers = {}; }
  $$('[data-answer-part]', el.questionForm).forEach((control) => { const value = state.answers[control.name] || ''; if (control.type === 'radio' || control.type === 'checkbox') control.checked = value.split(',').map((entry) => entry.trim()).includes(control.value); else control.value = value; });
}
function lockQuestionForm(locked) { $$('[name^="q"]', el.questionForm).forEach((node) => { node.disabled = locked; }); $('[data-submit-partial]').disabled = locked; $('[type="submit"]', el.questionForm).disabled = locked; }
function applyResults(payload) {
  const list = payload?.question_results || payload?.results || []; const mapped = Array.isArray(list) ? Object.fromEntries(list.map((row) => [Number(row.question_number), row])) : {};
  $$('[data-question-result]').forEach((target) => { target.textContent = ''; target.className = 'question-result'; });
  Object.entries(mapped).forEach(([number, row]) => { const target = $(`[data-question-result="${number}"]`); if (!target) return; target.textContent = row.correct ? `✓ 正確 · ${row.correct_answer}` : `✗ 答案：${row.correct_answer}`; target.className = `question-result ${row.correct ? "is-correct" : "is-wrong"}`; });
  if (payload?.status && payload.status !== "in_progress") { state.results.finalized = true; pauseTimer(); lockQuestionForm(true); el.submissionStatus.textContent = `已提交：${payload.correct_count || 0} / ${payload.answered_count || 0} 題正確。${payload.review_count ? `另有 ${payload.review_count} 題待教師核對，不列入評分。` : ''}`; }
}
async function saveAttempt(submit = false, force = false, silent = false, retry = true) {
  if (state.system !== 'ielts') { saveDseDraft(); return null; }
  if (state.savePromise) { try { await state.savePromise; } catch { return null; } return saveAttempt(submit, force, silent, retry); }
  if (!state.token || !state.data || state.submitting || state.results.finalized) return null; collectAnswers(); if (!submit && !state.attemptId && !Object.keys(state.answers).length && currentDuration() === 0) return null; state.submitting = true;
  const article = ARTICLE_ID; const token = state.token;
  const request = { p_token: token, p_attempt_id: state.attemptId, p_article_id: article, p_answers: { ...state.answers }, p_duration_ms: Math.round(currentDuration()), p_submit: submit, p_force_submit: force };
  try {
    state.savePromise = rpc("reading_comprehension_save_attempt", request);
    const payload = await state.savePromise;
    if (token !== state.token || article !== ARTICLE_ID) return payload;
    if (payload?.attempt_id) state.attemptId = String(payload.attempt_id); applyResults(payload); if (!silent) showToast(submit ? "答案已安全提交。" : "進度已儲存。"); return payload;
  } catch (error) {
    if (retry && state.attemptId && error?.code === "P0002") { state.attemptId = null; state.submitting = false; state.savePromise = null; return saveAttempt(submit, force, silent, false); }
    console.warn("Attempt save failed", error); if (!silent) showToast("暫時未能儲存，請檢查連線後再試。"); return null;
  } finally { state.submitting = false; state.savePromise = null; }
}
async function submitAnswers(partial = false, force = false) {
  collectAnswers(); const count = Object.keys(state.answers).length;
  const incompleteMultiple = state.data.questions.find((q) => q.type === 'multiple' && q.selectionLimit !== false && state.answers[`q${q.number}`] && state.answers[`q${q.number}`].split(',').length !== q.slots);
  if (incompleteMultiple && !force) return showToast(`第 ${incompleteMultiple.number} 題需要選擇 ${incompleteMultiple.slots} 項。`);
  if (!count) return showToast("請先作答至少一題。"); if (!partial && !force && count < state.data.questions.length) return showToast(`尚有 ${state.data.questions.length - count} 題未作答；可先提交已作答題目。`);
  el.submissionStatus.textContent = "正在提交答案…"; const payload = await saveAttempt(true, force); if (payload && payload.status === "in_progress") el.submissionStatus.textContent = `已批改 ${payload.answered_count ?? count} 題；可繼續完成其餘題目。${payload.review_count ? `另有 ${payload.review_count} 題待教師核對。` : ''}`;
  if (!payload) el.submissionStatus.textContent = '未能提交；目前答案仍保留在此頁，請稍後再試。';
}

function showPopover(node) { closePopovers(node); node.hidden = false; requestAnimationFrame(() => node.classList.add("is-visible")); }
function closePopover(node) { if (!node || node.hidden) return; node.classList.remove("is-visible"); node.hidden = true; }
function closePopovers(except = null) { [el.skimmingDialog, el.analysisDialog].forEach((node) => { if (node !== except) closePopover(node); }); }
function overviewForParagraph(number) {
  const paragraph = state.data?.paragraphs.find((p) => p.number === number);
  return state.analysis?.paragraphOverview?.paragraphs?.find((item) => String(item.number) === String(paragraph?.label || number));
}
function analysisForQuestion(number) { return state.analysis?.questions.find((item) => (item.numbers || [item.number]).includes(number)); }
function openSkimming(number) {
  if (!state.data?.paragraphs.some((p) => p.number === number)) return;
  state.activeSkimming = number; const overview = overviewForParagraph(number); $('[data-skimming-kicker]').textContent = `PARAGRAPH ${state.data.paragraphs.find((p) => p.number === number)?.label || number}`; $('[data-skimming-title]').textContent = `Skimming Tips · 第 ${number} 段`; $('[data-skimming-content]').innerHTML = `<p>${escapeHtml(overview?.summary || "這段暫未有獨立 Skimming 提示；可開啟相關題目的 Scanning 及完整分析。")}</p>`; $('[data-skimming-bookmark]').textContent = state.bookmarks.has(`${ARTICLE_ID}:skimming:${number}`) ? "★ 已收藏這段提示" : "☆ 收藏這段提示"; showPopover(el.skimmingDialog);
}
function renderAnalysisBlocks(sections) { return (sections || []).map((section) => `<section class="analysis-section"><div class="analysis-section-heading"><h3>${escapeHtml(section.title)}</h3>${section.id ? readingBookmarkButton('section', state.activeAnalysis, section.id) : ''}</div>${(section.blocks || []).map((block) => block.kind === "quote" ? `<blockquote class="analysis-quote">${escapeHtml(block.text)}</blockquote>` : block.kind === "label" ? `<strong>${escapeHtml(block.text)}</strong>` : `<p>${escapeHtml(block.text)}</p>`).join("")}</section>`).join(""); }
function openAnalysis(number, mode = 'analysis', sectionId = '') {
  const question = analysisForQuestion(number); if (!question) return;
  state.activeAnalysis = number; state.analysisMode = mode === 'scanning' ? 'scanning' : sectionId ? 'section' : 'analysis'; state.analysisSection = sectionId;
  const sections = mode === 'scanning' ? scanningSections(question) : sectionId ? question.sections.filter((section) => section.id === sectionId) : question.sections;
  $('[data-analysis-kicker]').textContent = `QUESTION ${number}`;
  $('[data-analysis-title]').textContent = `第 ${number} 題 · ${mode === 'scanning' ? 'Scanning 提示' : sectionId ? sections[0]?.title || '分析小節' : '答案解析'}`;
  const answerBanner = $('[data-analysis-answer]'); answerBanner.hidden = state.analysisMode !== 'analysis'; answerBanner.textContent = answerBanner.hidden ? '' : `正確答案：${question.answer}`;
  $('[data-analysis-content]').innerHTML = sections.length ? renderAnalysisBlocks(sections) : '<p class="empty-state">這題暫未提供此部分提示。</p>';
  updateBookmarkControls(); showPopover(el.analysisDialog);
}
async function setBookmark(item, bookmarked) {
  const token = state.token;
  await rpc("learning_portal_set_bookmark", { p_token: token, p_system_key: "reading-comprehension", p_item_key: item.key, p_title: item.title, p_detail: item.detail, p_href: item.href, p_bookmarked: bookmarked });
  if (token !== state.token) return;
  if (bookmarked) { state.bookmarks.add(item.key); state.bookmarkItems.set(item.key, { ...item, created_at: state.bookmarkItems.get(item.key)?.created_at || new Date().toISOString() }); }
  else { state.bookmarks.delete(item.key); state.bookmarkItems.delete(item.key); }
  updateBookmarkControls();
}
function readingBookmarkItem(kind, number = 0, sectionId = '') {
  if (kind === 'section' && /^(scan|scanning)$/i.test(sectionId)) kind = 'scanning';
  const title = state.data?.title || 'Albert Einstein';
  const paragraph = state.data?.paragraphs.find((item) => Number(item.number) === number);
  const question = state.data?.questions.find((item) => Number(item.number) === number);
  const analysis = analysisForQuestion(number);
  const section = analysis?.sections.find((item) => item.id === sectionId);
  const overview = overviewForParagraph(number);
  const blocksText = (sections) => (sections || []).flatMap((item) => (item.blocks || []).map((block) => block.text)).join(' ');
  const keys = { passage: 'passage', questions: 'questions', paragraph: `paragraph:${number}`, question: `question:${number}`, skimming: `skimming:${number}`, scanning: `scanning:${number}`, analysis: `q${number}`, section: `analysis:${number}:${sectionId}` };
  const labels = { passage: '文章與題目組', questions: '整組題目', paragraph: `第 ${number} 段`, question: `第 ${number} 題`, skimming: `Skimming · 第 ${number} 段`, scanning: `Scanning · 第 ${number} 題`, analysis: `第 ${number} 題解析`, section: `第 ${number} 題 · ${section?.title || '分析小節'}` };
  const prefixes = { passage: '文章', questions: '題目組', paragraph: '段落', question: '題目', skimming: 'Skimming', scanning: 'Scanning', analysis: '答案解析', section: '分析小節' };
  const entry = state.catalogue.find((item) => item.id === ARTICLE_ID);
  const details = { passage: `IELTS Reading · Passage ${entry?.passage || 1} · Practice ${entry?.practice || 69} · 閱讀文章及 ${state.data?.questions.length || 13} 題練習`, questions: `${title} · 完整題目組`, paragraph: paragraph?.text, question: question?.prompt, skimming: overview?.summary, scanning: blocksText(scanningSections(analysis)), analysis: `參考答案：${analysis?.answer || ''}。${blocksText(analysis?.sections.slice(0, 1))}`, section: blocksText(section ? [section] : []) };
  return { key: `${ARTICLE_ID}:${keys[kind]}`, title: `[${prefixes[kind]}] ${title}${number ? ` · ${labels[kind]}` : ''}`, detail: String(details[kind] || '').slice(0, 2800), href: readingBookmarkLink({ article: ARTICLE_ID, kind, number, section: kind === 'section' ? sectionId : '' }), label: labels[kind] };
}
function readingBookmarkButton(kind, number, sectionId = '') {
  const item = readingBookmarkItem(kind, number, sectionId); const saved = state.bookmarks.has(item.key);
  const label = kind === 'paragraph' ? '本段' : kind === 'question' ? '本題' : '此小節';
  return `<button class="reading-bookmark-button" type="button" data-bookmark-kind="${kind}" data-bookmark-number="${number}" data-bookmark-section="${escapeHtml(sectionId)}" aria-label="${escapeHtml(`收藏${item.label}`)}" aria-pressed="${saved}">${saved ? '★ 已收藏' : `☆ 收藏${label}`}</button>`;
}
function updateBookmarkControls() {
  const update = (button, item, label) => {
    const saved = state.bookmarks.has(item.key); button.textContent = saved ? `★ 已收藏${label}` : `☆ 收藏${label}`; button.setAttribute('aria-pressed', String(saved)); button.disabled = state.pendingBookmarks.has(item.key);
    button.setAttribute('aria-label', `${saved ? '移除' : '收藏'}${item.label || label}書簽`);
  };
  $$('[data-passage-bookmark]').forEach((button) => update(button, readingBookmarkItem('passage'), '文章與題目組'));
  $$('[data-catalogue-bookmark]').forEach((button) => {
    const entry = state.catalogue.find((item) => item.id === button.dataset.catalogueBookmark);
    if (entry) update(button, catalogueBookmark(entry), '文章與題目組');
  });
  $$('[data-bookmark-kind]').forEach((button) => {
    const kind = button.dataset.bookmarkKind;
    update(button, readingBookmarkItem(kind, Number(button.dataset.bookmarkNumber || 0), button.dataset.bookmarkSection || ''), { paragraph: '本段', question: '本題', questions: '整組題目', section: '此小節' }[kind] || '提示');
  });
  if (state.activeAnalysis) update($('[data-analysis-bookmark]'), readingBookmarkItem(state.analysisMode, state.activeAnalysis, state.analysisSection), state.analysisMode === 'scanning' ? 'Scanning 提示' : state.analysisMode === 'section' ? '此小節' : '這題解析');
  if (state.activeSkimming) update($('[data-skimming-bookmark]'), readingBookmarkItem('skimming', state.activeSkimming), '這段提示');
  $$('[data-word-key]').forEach((word) => word.classList.toggle('is-bookmarked', state.bookmarks.has(word.dataset.wordKey)));
  renderBookmarkLibrary();
}
async function toggleReadingBookmark(item, forceRemove = false) {
  if (!item || state.pendingBookmarks.has(item.key)) return;
  const bookmarked = !forceRemove && !state.bookmarks.has(item.key);
  state.pendingBookmarks.add(item.key); updateBookmarkControls();
  try { await setBookmark(item, bookmarked); showToast(bookmarked ? '已收藏，書簽會跟隨學生帳戶同步。' : '已移除書簽。'); }
  catch (error) { console.warn(error); showToast('書簽暫時未能儲存，請稍後再試。'); }
  finally { state.pendingBookmarks.delete(item.key); updateBookmarkControls(); }
}
function togglePassageBookmark() { return toggleReadingBookmark(readingBookmarkItem('passage')); }
function toggleSkimmingBookmark() { return toggleReadingBookmark(readingBookmarkItem('skimming', state.activeSkimming)); }
function toggleAnalysisBookmark() { return toggleReadingBookmark(readingBookmarkItem(state.analysisMode, state.activeAnalysis, state.analysisSection)); }

function setBookmarkLibraryOpen(open) {
  $('[data-bookmark-library]').hidden = !open;
  $('[data-bookmark-library-toggle]').setAttribute('aria-expanded', String(open));
  $('[data-bookmark-library-label]').textContent = open ? '收合 −' : '展開 ＋';
}
function renderBookmarkLibrary() {
  $('[data-bookmark-count]').textContent = String(state.bookmarkItems.size);
  $('[data-bookmark-status]').textContent = state.bookmarkError ? '未能同步最新書簽，請按「重新整理書簽」再試。' : '全部 Passage 的書簽 · 按收藏日期排列';
  const filter = $('[data-bookmark-filter]').value;
  const items = [...state.bookmarkItems.values()].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))).filter((item) => {
    const kind = bookmarkTarget(item.key)?.kind; return filter === 'all' || kind === filter || (filter === 'analysis' && kind === 'section');
  });
  $('[data-reading-bookmark-list]').innerHTML = items.length ? items.map((item) => {
    const target = bookmarkTarget(item.key); const pending = state.pendingBookmarks.has(item.key);
    return `<article class="reading-bookmark-card"><div><span class="reading-bookmark-type">${escapeHtml(BOOKMARK_LABELS[target?.kind] || '閱讀書簽')}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.detail)}</p></div><div class="reading-bookmark-actions"><button type="button" class="primary-button" data-open-reading-bookmark="${escapeHtml(item.key)}"${target ? '' : ' disabled'}>開啟書簽 →</button><button type="button" class="secondary-button" data-remove-reading-bookmark="${escapeHtml(item.key)}"${pending ? ' disabled' : ''}>${pending ? '儲存中…' : '移除'}</button></div></article>`;
  }).join('') : `<p class="empty-state">${state.bookmarkError ? '連線恢復後即可顯示已收藏的內容。' : state.bookmarkItems.size ? '此類型暫未有書簽。' : '尚未有閱讀書簽。在文章、段落、題目或提示旁按 ☆ 即可收藏。'}</p>`;
}
async function openReadingBookmark(key) {
  const target = bookmarkTarget(key); if (!target || !state.catalogue.some((item) => item.id === target.article)) return showToast('這篇練習暫未開放。');
  history.replaceState({}, '', readingBookmarkLink(target));
  await openExercise(target.article);
}
async function toggleWordBookmark(word) {
  if (word.classList.contains('is-pending')) return;
  const key = word.dataset.wordKey; const bookmarked = !state.bookmarks.has(key); const context = word.dataset.wordContext; const label = word.textContent.trim(); word.classList.toggle("is-pending", true);
  const paragraphNumber = context.startsWith("p") ? Number(context.slice(1)) : 0;
  const questionNumber = context.startsWith("q") ? Number(context.slice(1)) : 0;
  const paragraph = state.data.paragraphs.find(item => Number(item.number) === paragraphNumber);
  const question = state.data.questions.find(item => Number(item.number) === questionNumber);
  const href = `reading-comprehension.html?article=${ARTICLE_ID}#${paragraphNumber ? `paragraph-${paragraphNumber}` : `question-${questionNumber || 1}`}`;
  try {
    await window.EdmundWordBookmarks.setWordBookmark({
      rpc,
      token: state.token,
      systemKey: "reading-comprehension",
      itemKey: key,
      phrase: label,
      contextEn: paragraph?.text || question?.prompt || "",
      contextZh: paragraph?.translation || question?.translation || "",
      href,
      bookmarked
    });
    await setBookmark({ key, title: `[閱讀重點] ${label}`, detail: `${state.data.title} · ${paragraphNumber ? `第 ${paragraphNumber} 段` : `第 ${questionNumber} 題`} · 點選字詞`, href }, bookmarked);
    word.classList.toggle("is-bookmarked", bookmarked);
    showToast(bookmarked ? `已收藏「${label}」，並加入「寫作系統生字」。` : `已移除重點字詞「${label}」。`);
  } catch (error) { console.warn(error); showToast("字詞書簽暫時未能儲存。"); }
  finally { word.classList.remove("is-pending"); }
}

function initializeReadingWordBrush() {
  const helper = window.EdmundWordBookmarks;
  if (!helper?.createSelectionBrush) return;
  helper.createSelectionBrush({
    systemKey: "reading-comprehension",
    root: () => document.querySelector('[data-view="exercise"]'),
    getToken: () => state.token,
    rpc,
    describe({ element, phrase }) {
      if (state.view !== "exercise" || !state.token) return false;
      const source = element.closest(".passage-text-block,.question-prompt,.original-question-group,.choice-list span");
      if (!source) return false;
      const paragraphNode = source.closest(".passage-paragraph");
      const questionNode = source.closest(".question-card");
      const paragraphNumber = Number(paragraphNode?.id?.replace("paragraph-", "") || 0);
      const questionNumber = Number(questionNode?.dataset.question || 0);
      const paragraph = state.data?.paragraphs.find(item => Number(item.number) === paragraphNumber);
      const question = state.data?.questions.find(item => Number(item.number) === questionNumber);
      return {
        scope: `${ARTICLE_ID}:${paragraphNumber ? `p${paragraphNumber}` : `q${questionNumber || "group"}`}`,
        phrase,
        contextEn: paragraph?.text || question?.prompt || String(source.textContent || ""),
        contextZh: paragraph?.translation || question?.translation || "",
        href: `reading-comprehension.html?article=${encodeURIComponent(ARTICLE_ID)}#${paragraphNumber ? `paragraph-${paragraphNumber}` : `question-${questionNumber || 1}`}`
      };
    },
    onSaved({ phrase }) { showToast(`已收藏「${phrase}」，並加入「寫作系統生字」。`); },
    onError(error) { console.warn(error); showToast("字詞暫時未能收藏，請稍後再試。"); }
  });
}

function paragraphAudioRange(number) {
  if (!state.audioItem) return null; const explicit = state.audioItem.paragraphs?.find((row) => Number(row.number) === number); if (explicit) return explicit;
  const counts = state.data.paragraphs.map((p) => (p.text.match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu) || []).length); const from = counts.slice(0, number - 1).reduce((a, b) => a + b, 0); const to = from + counts[number - 1] - 1; const words = state.audioItem.words || []; return words[from] && words[to] ? { number, start: words[from].start, end: words[to].end } : null;
}
function playParagraph(number) { const range = paragraphAudioRange(number); if (!range) return showToast("本段朗讀暫時未能載入。"); state.audioStopAt = Number(range.end); el.audio.currentTime = Number(range.start); el.audio.play().catch(() => showToast("瀏覽器未能開始播放，請再按一次。")); }
async function loadAudioTimings(item, article) {
  const key = item.timingsSrc;
  if (!audioTimingCache.has(key)) audioTimingCache.set(key, (async () => {
    const response = await fetch(key);
    if (!response.ok) throw new Error(`Reading word timings: HTTP ${response.status}`);
    return response.json();
  })().catch((error) => { audioTimingCache.delete(key); throw error; }));
  const payload = await audioTimingCache.get(key);
  if (!validateReadingAudioTimings(payload, item, article)) {
    audioTimingCache.delete(key);
    throw new Error('Reading word timings do not match this article');
  }
  if (state.audioItem !== item || state.data !== article) return;
  item.words = payload.words;
  el.sync.disabled = false;
  syncWord(item);
}
function setupAudio() {
  const manifest = state.system === 'dse' ? window.EDMUND_DSE_READING_AUDIO || {} : AUDIO_MANIFEST;
  const item = manifest[ARTICLE_ID] || manifest.items?.[ARTICLE_ID];
  state.audioItem = item ? { ...item } : null; el.audio.pause(); el.audio.currentTime = 0;
  $$('.spoken-word.is-active').forEach((node) => node.classList.remove('is-active'));
  [el.audioToggle,el.audioBack,el.audioSeek,el.audioRate,el.sync].forEach((node) => { node.disabled = !item?.src; });
  $$('[data-play-paragraph]').forEach((node) => { node.hidden = !item?.src; });
  $('[data-audio-availability]').hidden = Boolean(item?.src);
  if (!item?.src) { el.audio.removeAttribute('src'); el.audio.load(); updateAudioDisplay(); return; }
  el.audio.src = item.src; el.audioToggle.textContent = '▶ 朗讀全文';
  if (item.timingsSrc && !item.words) {
    el.sync.disabled = true;
    const pendingItem = state.audioItem;
    loadAudioTimings(pendingItem, state.data).catch((error) => {
      console.warn('Reading word highlighting unavailable', error);
      if (state.audioItem === pendingItem) showToast('逐字標示暫時未能載入；全文及分段朗讀仍可使用。');
    });
  }
  if (state.audioSetup) return; state.audioSetup = true;
  el.audio.addEventListener("loadedmetadata", () => { el.audioSeek.max = String(el.audio.duration || 1); updateAudioDisplay(); });
  el.audio.addEventListener("timeupdate", () => { if (state.audioStopAt !== null && el.audio.currentTime >= state.audioStopAt) { state.audioStopAt = null; el.audio.pause(); } el.audioSeek.value = String(el.audio.currentTime); updateAudioDisplay(); if (state.audioItem) syncWord(state.audioItem); });
  el.audio.addEventListener("play", () => { el.audioToggle.textContent = "❚❚ 暫停朗讀"; }); el.audio.addEventListener("pause", () => { el.audioToggle.textContent = "▶ 朗讀全文"; });
  el.audio.addEventListener("ended", () => { state.audioStopAt = null; $$('.spoken-word.is-active').forEach((node) => node.classList.remove("is-active")); });
}
function updateAudioDisplay() { el.audioTime.textContent = `${formatClock(el.audio.currentTime * 1000)} / ${formatClock((el.audio.duration || 0) * 1000)}`; }
function syncWord(item) { if (!el.sync.checked) return; const words = item.words || []; const time = el.audio.currentTime; const index = words.findIndex((word) => time >= Number(word.start) && time < Number(word.end)); if (index < 0) return; const current = $('.spoken-word.is-active'); const target = $(`[data-word-index="${index}"]`); if (current !== target) { current?.classList.remove("is-active"); target?.classList.add("is-active"); } }

function scanStorageKey() { return `edmund-reading-scan-v1:${state.user?.id || "student"}:${ARTICLE_ID}`; }
function loadScanAssignments() { try { state.scanAssignments = JSON.parse(localStorage.getItem(scanStorageKey()) || "{}") || {}; } catch { state.scanAssignments = {}; } }
function saveScanAssignments() { try { localStorage.setItem(scanStorageKey(), JSON.stringify(state.scanAssignments)); } catch {} }
function assignScan(question, paragraph) { state.scanAssignments[question] = paragraph; saveScanAssignments(); updateScanControls(); renderScanTags(); }
function updateScanControls() { $$('[data-scan-question]').forEach((button) => { const p = state.scanAssignments[button.dataset.scanQuestion]; button.textContent = p ? `Scan：P${p}` : "Scan：選擇段落"; button.classList.toggle("has-scan", Boolean(p)); }); $$('[data-scan-choice]').forEach((button) => { const [q, p] = button.dataset.scanChoice.split(":"); button.classList.toggle("is-selected", Number(state.scanAssignments[q]) === Number(p)); }); }
function renderScanTags() { $$('[data-scan-tags]').forEach((container) => { const paragraph = Number(container.dataset.scanTags); const questions = Object.entries(state.scanAssignments).filter(([, p]) => Number(p) === paragraph).map(([q]) => Number(q)).sort((a, b) => a - b); container.innerHTML = questions.map((q) => `<span class="scan-question-tag" title="第 ${q} 題的 Scan 段落">${q}</span>`).join(""); }); }

async function openDseExercise(id) {
  if (state.opening) return; state.opening = true;
  try {
    if (state.system === 'dse' && state.view === 'exercise') saveDseDraft();
    setExerciseSystem('dse');
    const entry = await loadDseArticleData(id);
    $('[data-dse-tools-notice]').textContent = DEEP_ANALYSIS_ARTICLES.has(id)
      ? '完成每題後，可查看參考答案及完整深度解析。'
      : '答案及分析會稍後加入。';
    resetAttemptState(); renderPassage(); renderQuestions(); setupAudio(); restoreDseDraft(); updateAnswerProgress();
    state.exerciseReady = true;
    state.timerHandle = setInterval(updateTimer, 250);
    $('[data-exercise-title]').textContent = entry.title; $('#passage-title').textContent = entry.title;
    $('[data-exercise-kicker]').textContent = `${state.data.year} DSE · PAPER 1 · PART ${state.data.section}`;
    $('.questions-panel .pane-heading > .eyebrow').textContent = `QUESTIONS ${entry.questionStart}–${entry.questionEnd}`;
    el.submissionStatus.textContent = '';
    const url = clearReadingRoute(new URL(location.href));
    url.searchParams.set('view', 'dse'); url.searchParams.set('year', String(state.data.year)); url.searchParams.set('section', state.data.section); url.searchParams.set('article', id);
    history.replaceState({}, '', url); document.title = `${entry.title}｜DSE 閱讀理解`;
    showView('exercise'); updateTimer(); updateFloatingOffsets();
  } catch (error) {
    console.warn('Could not open DSE Reading exercise', error); showToast(error.message || '未能載入 DSE 練習，請稍後再試。');
    await openDseDashboard();
  } finally { state.opening = false; }
}

async function openExercise(id = ARTICLE_ID) {
  if (state.opening) return; state.opening = true;
  try {
  const currentIsIelts = state.system === 'ielts' && !String(state.data?.id || '').startsWith('dse-');
  setExerciseSystem('ielts');
  await loadCatalogue();
  if (!state.catalogue.some((item) => item.id === id)) throw new Error('這篇練習暫未開放。');
  const changing = id !== ARTICLE_ID;
  if (changing && state.exerciseReady && currentIsIelts) {
    pauseTimer(); el.audio.pause();
    if (!state.results.finalized) {
      collectAnswers(); const needsSave = state.attemptId || Object.keys(state.answers).length || currentDuration();
      if (needsSave && !await saveAttempt(false, false, true)) throw new Error('未能儲存目前的練習，請稍後再切換文章。');
    }
  }
  await loadArticleData(id);
  // Opening another saved item in the same unfinished exercise must not erase answers.
  if (changing || !state.exerciseReady || state.results.finalized) {
    state.exerciseReady = false; resetAttemptState(); loadScanAssignments(); renderPassage(); renderQuestions(); setupAudio(); lockQuestionForm(false);
    const draft = await rpc('reading_comprehension_current_attempt', { p_token: state.token, p_article_id: ARTICLE_ID });
    if (draft?.attempt_id) {
      state.attemptId = draft.attempt_id; state.answers = draft.answers || {}; state.durationMs = Number(draft.duration_ms || 0);
      $$('input[name^="q"]', el.questionForm).forEach((input) => { const value = state.answers[input.name] || ''; if (input.type === 'radio') input.checked = input.value === value; else if (input.type === 'checkbox') input.checked = value.split(',').map((v) => v.trim()).includes(input.value); else input.value = value; });
      applyResults(draft);
    }
    state.exerciseReady = true;
    updateTranslations(); updateQuestionTranslations(); el.submissionStatus.textContent = '';
    state.timerHandle = setInterval(updateTimer, 250); state.autosaveHandle = setInterval(() => { if (state.view === 'exercise') saveAttempt(false, false, true); }, 15000);
  }
  const entry = state.catalogue.find((item) => item.id === ARTICLE_ID);
  $('[data-exercise-title]').textContent = entry.title; $('#passage-title').textContent = entry.title;
  $('[data-exercise-kicker]').textContent = `PRACTICE ${entry.practice} · IELTS READING · PASSAGE ${entry.passage}`;
  $('.questions-panel .pane-heading > .eyebrow').textContent = `QUESTIONS ${entry.questionStart}–${entry.questionEnd}`;
  document.title = `${entry.title}｜閱讀理解學習系統`;
  const params = new URLSearchParams(location.search); const requestedView = params.get('view');
  const url = new URL(location.href); ['type', 'q'].forEach((key) => url.searchParams.delete(key));
  if (!['skimming', 'scanning', 'analysis'].includes(requestedView)) url.searchParams.delete('view');
  url.searchParams.set('article',ARTICLE_ID); url.searchParams.set('passage',String(entry.passage)); history.replaceState({},'',url);
  updateBookmarkControls(); showView("exercise"); updateTimer(); updateAnswerProgress();
  if (requestedView === 'skimming') openSkimming(Number(params.get('paragraph')));
  else if (requestedView === 'scanning' || requestedView === 'analysis') openAnalysis(Number(params.get('question')), requestedView, params.get('section') || '');
  const hashTarget = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  if (hashTarget) setTimeout(() => {
    hashTarget.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    hashTarget.setAttribute('tabindex', '-1'); hashTarget.focus({ preventScroll: true });
  }, 200);
  } catch (error) { console.warn('Could not open Reading exercise',error); if (state.view === 'login' && state.user) await openDashboard(); showToast(error.message || '未能載入練習，請稍後再試。'); }
  finally { state.opening = false; }
}
async function openInitialView({ afterLogin = false } = {}) {
  const params = new URLSearchParams(location.search); const id = params.get('article');
  if (id?.startsWith('dse-')) await openDseExercise(id);
  else if (state.catalogue.some((item) => item.id === id)) await openExercise(id);
  else if (params.get('view') === 'question-types') { if (await prepareForReadingNavigation()) openQuestionTypeDirectory(params.get('type') || '', params.get('q') || '', false); }
  else if (params.get('view') === 'dse') await openDseDashboard();
  else if (!afterLogin && [1, 2, 3].includes(Number(params.get('passage')))) await openDashboard();
  else await openReadingHome();
}

el.loginForm.addEventListener("submit", handleLogin); el.logout.addEventListener("click", logout); el.home.addEventListener("click", openReadingHome); $('[data-back-dashboard]').addEventListener("click", () => state.system === 'dse' ? openDseDashboard() : openDashboard()); $('[data-refresh-dashboard]').addEventListener("click", loadDashboard);
$('[data-enter-ielts]').addEventListener('click', enterIeltsReading);
$('[data-enter-dse]').addEventListener('click', openDseDashboard);
$$('[data-back-reading-home]').forEach((button) => button.addEventListener('click', openReadingHome));
$$('[data-dse-sort]').forEach((button) => button.addEventListener('click', () => { state.dseSort = button.dataset.dseSort === 'asc' ? 'asc' : 'desc'; renderDseCatalogue(); }));
$('[data-password-toggle]').addEventListener("click", (event) => { const input = $('input[name="password"]', el.loginForm); const shown = input.type === "text"; input.type = shown ? "password" : "text"; event.currentTarget.textContent = shown ? "顯示" : "隱藏"; event.currentTarget.setAttribute("aria-pressed", String(!shown)); });
el.progressToggle.addEventListener("click", () => { const open = el.progressToggle.getAttribute("aria-expanded") === "true"; el.progressToggle.setAttribute("aria-expanded", String(!open)); el.progressPanel.hidden = open; el.progressLabel.textContent = open ? "展開 ＋" : "收合 −"; });
$('[data-open-question-types]').addEventListener('click', () => openQuestionTypeDirectory('', '', true));
$('[data-question-types-back]').addEventListener('click', openDashboard);
el.questionTypeSearch.addEventListener('input', (event) => { state.questionType = ''; state.questionTypeQuery = event.target.value; history.replaceState({}, '', questionTypeUrl()); renderQuestionTypeView(); });
$('[data-clear-question-type-search]').addEventListener('click', () => { state.questionType = ''; state.questionTypeQuery = ''; history.replaceState({}, '', questionTypeUrl()); renderQuestionTypeView(); el.questionTypeSearch.focus(); });
$$('[data-passage-tab]').forEach((button) => button.addEventListener("click", () => selectPassageTab(Number(button.dataset.passageTab))));
document.addEventListener("click", (event) => {
  const deepButton = event.target.closest('[data-deep-analysis]'); if (deepButton) return openDseDeepAnalysis(Number(deepButton.dataset.deepAnalysis), deepButton);
  const dseExerciseButton = event.target.closest('[data-open-dse-exercise]'); if (dseExerciseButton?.dataset.openDseExercise) return openDseExercise(dseExerciseButton.dataset.openDseExercise);
  const exerciseButton = event.target.closest('[data-open-exercise]'); if (exerciseButton) return openExercise(exerciseButton.dataset.openExercise || ARTICLE_ID);
  const catalogueButton = event.target.closest('[data-catalogue-bookmark]'); if (catalogueButton) { const entry = state.catalogue.find((item) => item.id === catalogueButton.dataset.catalogueBookmark); if (entry) return toggleReadingBookmark(catalogueBookmark(entry)).then(renderCatalogue); }
  const passageButton = event.target.closest('[data-passage-bookmark]'); if (passageButton) return togglePassageBookmark();
  const button = event.target.closest('[data-bookmark-kind]'); if (button) return toggleReadingBookmark(readingBookmarkItem(button.dataset.bookmarkKind, Number(button.dataset.bookmarkNumber || 0), button.dataset.bookmarkSection || ''));
  const openButton = event.target.closest('[data-open-reading-bookmark]'); if (openButton) return openReadingBookmark(openButton.dataset.openReadingBookmark);
  const removeButton = event.target.closest('[data-remove-reading-bookmark]'); if (removeButton) return toggleReadingBookmark(state.bookmarkItems.get(removeButton.dataset.removeReadingBookmark), true);
});
$('[data-catalogue-search]').addEventListener('input', () => { state.cataloguePage = 0; renderCatalogue(); });
$('[data-catalogue-previous]').addEventListener('click', () => { state.cataloguePage--; renderCatalogue(); });
$('[data-catalogue-next]').addEventListener('click', () => { state.cataloguePage++; renderCatalogue(); });
$('[data-bookmark-library-toggle]').addEventListener('click', () => setBookmarkLibraryOpen($('[data-bookmark-library]').hidden));
$('[data-bookmark-filter]').addEventListener('change', renderBookmarkLibrary);
$('[data-refresh-bookmarks]').addEventListener('click', async (event) => { const button = event.currentTarget; button.disabled = true; try { await loadBookmarks(); } finally { button.disabled = false; } });
$('[data-answer-progress-toggle]').addEventListener('click', () => setAnswerProgressVisible($('[data-answer-progress-content]').hidden, true));
el.translationButton.addEventListener("click", () => { const open = el.translationButton.getAttribute("aria-expanded") === "true"; el.translationButton.setAttribute("aria-expanded", String(!open)); el.translationPanel.hidden = open; });
function updateTranslations() { const all = el.translationAll.checked; $$('[data-translation-paragraph]').forEach((checkbox) => { if (all) checkbox.checked = true; checkbox.disabled = all; }); $$('[data-translation-copy]').forEach((copy) => { const selected = $(`[data-translation-paragraph="${copy.dataset.translationCopy}"]`)?.checked; copy.hidden = !(all || selected); }); $$('[data-translation-heading]').forEach((copy) => { copy.hidden = !(all || $$('[data-translation-paragraph]').some((checkbox) => checkbox.checked)); }); }
el.translationAll.addEventListener("change", updateTranslations); $('[data-translation-options]').addEventListener('change', updateTranslations);
$('[data-hide-translations]').addEventListener("click", () => { el.translationAll.checked = false; $$('[data-translation-paragraph]').forEach((checkbox) => { checkbox.checked = false; checkbox.disabled = false; }); updateTranslations(); showToast("已隱藏所有文章翻譯。"); });
$('[data-question-translations]').addEventListener('change', updateQuestionTranslations);
el.passage.addEventListener("click", (event) => { const paragraphAudio = event.target.closest('[data-play-paragraph]'); if (paragraphAudio) return playParagraph(Number(paragraphAudio.dataset.playParagraph)); const button = event.target.closest('[data-skimming]'); if (button) return openSkimming(Number(button.dataset.skimming)); const word = event.target.closest('[data-word-key]'); if (word) toggleWordBookmark(word); });
el.questions.addEventListener("click", (event) => {
  const word = event.target.closest('[data-word-key]'); if (word) return toggleWordBookmark(word);
  const choice = event.target.closest('[data-scan-choice]'); if (choice) { const [q, p] = choice.dataset.scanChoice.split(":").map(Number); assignScan(q, p); return; }
  const scan = event.target.closest('[data-scan-question]'); if (scan) { const chooser = $(`[data-scan-chooser="${scan.dataset.scanQuestion}"]`); chooser.hidden = !chooser.hidden; return; }
  const scanning = event.target.closest('[data-scanning-tip]'); if (scanning) return openAnalysis(Number(scanning.dataset.scanningTip), 'scanning');
  const reveal = event.target.closest('[data-reveal]'); if (reveal) return openAnalysis(Number(reveal.dataset.reveal));
  const row = event.target.closest('.choice-list label'); if (row) { const radio = $('input[type="radio"]', row); if (radio && !radio.disabled && !radio.checked) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); } }
});
function handleAnswerInput(event) {
  if (!event.target.matches('[data-answer-part]')) return;
  const match = event.target.name?.match(/^q(\d+)/);
  if (event.target.type === 'checkbox' && event.target.checked) {
    const question = state.data.questions.find((item) => item.number === Number(match?.[1]));
    const control = question?.parts?.find((part) => `q${question.number}_${part.key}` === event.target.name) || question;
    const slots = control?.slots || 1;
    if (control?.selectionLimit !== false && $$(`input[name="${event.target.name}"]:checked`, el.questionForm).length > slots) {
      event.target.checked = false;
      showToast(`本題最多選擇 ${slots} 項。`);
    }
  }
  if (match) recordAnswerTime(Number(match[1]), event.target.value);
  if (state.system === 'dse') saveDseDraft();
  updateAnswerProgress();
}
el.questionForm.addEventListener("input", handleAnswerInput);
el.questionForm.addEventListener("change", handleAnswerInput);
el.questionForm.addEventListener("submit", (event) => { event.preventDefault(); if (state.system === 'dse') { saveDseDraft(); showToast('作答內容已暫存在這部裝置。'); return; } submitAnswers(false, false); }); $('[data-submit-partial]').addEventListener("click", () => submitAnswers(true, false)); $('[data-analysis-bookmark]').addEventListener("click", toggleAnalysisBookmark); $('[data-skimming-bookmark]').addEventListener("click", toggleSkimmingBookmark);
el.timerToggle.addEventListener("click", () => state.timerRunning ? pauseTimer() : startTimer());
el.timerMode.addEventListener("change", () => { state.timerMode = el.timerMode.value; const countdown = state.timerMode === "countdown"; el.countdownLabel.hidden = !countdown; el.forceLabel.hidden = !countdown || state.system === 'dse'; el.timerModeLabel.textContent = countdown ? "倒數計時（選用）" : "計時（選用）"; updateTimer(); });
el.countdownMinutes.addEventListener("change", () => { state.countdownMinutes = Math.max(1, Math.min(180, Number(el.countdownMinutes.value) || 20)); el.countdownMinutes.value = String(state.countdownMinutes); updateTimer(); }); el.forceSubmit.addEventListener("change", () => { state.forceSubmit = el.forceSubmit.checked; });
el.audioToggle.addEventListener("click", () => { state.audioStopAt = null; if (el.audio.ended) el.audio.currentTime = 0; return el.audio.paused ? el.audio.play().catch(() => showToast("瀏覽器未能開始播放，請再按一次。")) : el.audio.pause(); }); el.audioBack.addEventListener("click", () => { state.audioStopAt = null; el.audio.currentTime = Math.max(0, el.audio.currentTime - 5); }); el.audioSeek.addEventListener("input", () => { state.audioStopAt = null; el.audio.currentTime = Number(el.audioSeek.value); }); el.audioRate.addEventListener("change", () => { el.audio.playbackRate = Number(el.audioRate.value); });
$$('[data-close-popover]').forEach((button) => button.addEventListener("click", () => closePopover(button.closest('[role="dialog"]'))));
document.addEventListener("pointerdown", (event) => { [el.skimmingDialog, el.analysisDialog].forEach((popover) => { if (!popover.hidden && !popover.contains(event.target) && !event.target.closest('[data-skimming],[data-reveal],[data-scanning-tip]')) closePopover(popover); }); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closePopovers(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) { pauseTimer(); saveAttempt(false, false, true); } }); window.addEventListener("pagehide", () => { pauseTimer(); saveAttempt(false, false, true); });
window.addEventListener('popstate', () => { if (state.user && state.token) void openInitialView(); });

(async function init() {
  initializeReadingWordBrush();
  let progressVisible = true; try { progressVisible = localStorage.getItem('edmund-reading-progress-hidden') !== 'true'; } catch {}
  setAnswerProgressVisible(progressVisible);
  if (typeof ResizeObserver !== 'undefined') { const observer = new ResizeObserver(updateFloatingOffsets); ['.edmund-system-header', '[data-answer-progress-dock]', '.study-toolbar'].forEach((selector) => observer.observe($(selector))); }
  window.addEventListener('resize', updateFloatingOffsets);
  setConnection("正在連接", "checking");
  try { await ensureSession(); setConnection("已連線", "online"); if (await restoreSession()) { await Promise.all([loadCatalogue(), loadBookmarks()]); await openInitialView(); } else showView("login"); }
  catch (error) { console.warn(error); setConnection("連線失敗", "error"); setStatus("登入服務暫時未能連線，請稍後再試。", "error"); }
})();
