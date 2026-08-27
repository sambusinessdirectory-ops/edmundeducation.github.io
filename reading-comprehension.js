import { calculateAnswerProgress, scanningSections, BOOKMARK_LABELS, bookmarkTarget, readingBookmarkLink } from './reading-comprehension-features.mjs?v=20260827-reading3';

const CONFIG = window.EDMUND_SUPABASE || {};
const SESSION_KEY = "edmund-reading-comprehension-session-v1";
const ARTICLE_ID = "p1-069-albert-einstein";
const DATA_URL = `reading-comprehension-data/${ARTICLE_ID}.json`;
const ANALYSIS_URL = `ielts-reading-analysis-data/${ARTICLE_ID}.json`;
const AUDIO_MANIFEST = window.EDMUND_READING_AUDIO || {};

const state = {
  supabase: null, token: "", user: null, view: "login", data: null, analysis: null,
  attemptId: null, answers: {}, results: {}, bookmarks: new Set(), bookmarkItems: new Map(), pendingBookmarks: new Set(), bookmarkError: false, activeAnalysis: 0, activeSkimming: 0, analysisMode: 'analysis',
  timerRunning: false, durationMs: 0, timerStartedAt: 0, timerHandle: 0, autosaveHandle: 0,
  timerMode: "stopwatch", countdownMinutes: 20, forceSubmit: false, submitting: false,
  answerTimings: {}, scanAssignments: {}, wordIndex: 0, toastHandle: 0, dashboard: null,
  audioItem: null, audioSetup: false, audioStopAt: null, passageTab: 1, exerciseReady: false
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
  skimmingDialog: $('[data-skimming-dialog]'), analysisDialog: $('[data-analysis-dialog]'), toast: $('[data-toast]')
};

function escapeHtml(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
function setConnection(text, status) { el.connection.textContent = text; el.connection.dataset.state = status; }
function setStatus(text = "", status = "") { el.loginStatus.textContent = text; el.loginStatus.dataset.state = status; }
function showToast(message) { clearTimeout(state.toastHandle); el.toast.textContent = message; el.toast.hidden = false; state.toastHandle = setTimeout(() => { el.toast.hidden = true; }, 3600); }
function showView(view) {
  state.view = view; el.views.forEach((node) => { node.hidden = node.dataset.view !== view; });
  const signedIn = Boolean(state.user && state.token); el.user.hidden = !signedIn; el.logout.hidden = !signedIn; el.home.hidden = !signedIn || view === "dashboard";
  if (signedIn) el.user.textContent = `${state.user.name} · 學生`;
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  requestAnimationFrame(updateFloatingOffsets);
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
async function loadArticleData() {
  if (state.data && state.analysis) return;
  const [dataResponse, analysisResponse] = await Promise.all([fetch(DATA_URL, { cache: "no-store" }), fetch(ANALYSIS_URL, { cache: "no-store" })]);
  if (!dataResponse.ok || !analysisResponse.ok) throw new Error("未能載入閱讀練習資料。");
  [state.data, state.analysis] = await Promise.all([dataResponse.json(), analysisResponse.json()]);
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
  try { if (!await login(username, password)) throw new Error("用戶名稱或密碼不正確。"); await Promise.all([loadArticleData(), loadBookmarks()]); el.loginForm.reset(); setStatus(); setConnection("已安全連接", "online"); await openInitialView(); showToast(`您好，${state.user.name}！`); }
  catch (error) { console.warn(error); setStatus(error.message || "登入失敗，請稍後再試。", "error"); setConnection("連線失敗", "error"); }
  finally { el.loginButton.disabled = false; }
}
async function restoreSession() {
  const universal = window.EdmundSystemNav?.getStudentSession?.(); const local = readSession(); const candidate = universal?.role === "student" ? universal : local?.role === "student" ? local : null;
  if (!candidate?.token) return false; try { return await validateToken(String(candidate.token)); } catch { clearSession(); return false; }
}
async function logout() { pauseTimer(); el.audio.pause(); await saveAttempt(false, false, true); window.EdmundSystemNav?.forgetStudentSession(); clearSession(); try { await state.supabase?.auth.signOut(); } catch {} setConnection("已連線", "online"); showView("login"); }

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
  state.passageTab = number; $$('[data-passage-tab]').forEach((button) => button.setAttribute("aria-selected", String(Number(button.dataset.passageTab) === number))); $$('[data-passage-page]').forEach((page) => { page.hidden = Number(page.dataset.passagePage) !== number; });
  if (updateUrl) { const url = new URL(location.href); url.searchParams.set("passage", String(number)); history.replaceState({}, "", url); }
}
async function openDashboard() {
  pauseTimer(); el.audio.pause();
  if (state.exerciseReady && !state.results.finalized) await saveAttempt(false, false, true);
  closePopovers(); showView("dashboard"); el.welcome.textContent = `您好，${state.user.name}！請選擇閱讀練習。`;
  selectPassageTab(Math.max(1, Math.min(3, Number(new URLSearchParams(location.search).get("passage")) || state.passageTab)), false);
  const url = new URL(location.href); ['article', 'view', 'question', 'paragraph', 'section'].forEach((key) => url.searchParams.delete(key)); url.hash = ''; history.replaceState({}, '', url);
  await Promise.all([loadDashboard(), loadBookmarks()]); updateBookmarkControls();
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
    const key = `word:${ARTICLE_ID}:${context}:w${localIndex++}`; const classes = ["interactive-word", spoken ? "spoken-word" : "", state.bookmarks.has(key) ? "is-bookmarked" : ""].filter(Boolean).join(" ");
    html += escapeHtml(text.slice(last, match.index)); html += `<span class="${classes}" data-word-key="${escapeHtml(key)}" data-word-context="${escapeHtml(context)}"${spoken ? ` data-word-index="${state.wordIndex++}"` : ""}>${escapeHtml(match[0])}</span>`; last = regex.lastIndex;
  }
  return html + escapeHtml(text.slice(last));
}
function renderPassage() {
  state.wordIndex = 0; el.passage.innerHTML = state.data.paragraphs.map((paragraph) => `<section class="passage-paragraph" id="paragraph-${paragraph.number}"><div class="paragraph-heading"><span class="paragraph-label">PARAGRAPH ${paragraph.number}</span><span class="scan-tags" data-scan-tags="${paragraph.number}" aria-label="已選擇此段的題目"></span><button class="paragraph-audio-button" type="button" data-play-paragraph="${paragraph.number}" aria-label="朗讀第 ${paragraph.number} 段">▶ 朗讀本段</button>${readingBookmarkButton('paragraph', paragraph.number)}</div><div class="passage-text-block">${interactiveWords(paragraph.text, `p${paragraph.number}`, true)}</div><div class="translation-copy" data-translation-copy="${paragraph.number}" hidden lang="zh-Hant">${escapeHtml(paragraph.translation)}</div><button class="skimming-button" type="button" data-skimming="${paragraph.number}">Skimming Tips · 第 ${paragraph.number} 段</button></section>`).join("");
  renderScanTags();
}
function normalizedOption(option) { return typeof option === "string" ? { value: option, label: option, translation: "" } : option; }
function renderQuestions() {
  const groupLabels = { trueFalse: state.data.instructions.trueFalse, completion: state.data.instructions.completion, multipleChoice: state.data.instructions.multipleChoice }; let group = "";
  el.questions.innerHTML = state.data.questions.map((question) => {
    const heading = group !== question.group ? `<p class="question-group-heading">${escapeHtml(groupLabels[question.group])}</p>` : ""; group = question.group;
    const options = question.type === "choice" ? `<div class="choice-list">${question.options.map((entry) => { const option = normalizedOption(entry); return `<label><input type="radio" name="q${question.number}" data-answer-part="q${question.number}" value="${escapeHtml(option.value)}"><span><strong>${escapeHtml(option.label)}</strong>${option.translation ? `<small class="option-translation" data-question-translation hidden><br>${escapeHtml(option.translation)}</small>` : ""}</span></label>`; }).join("")}</div>` : `<input class="answer-input" name="q${question.number}" data-answer-part="q${question.number}" aria-label="第 ${question.number} 題答案" autocomplete="off" maxlength="100" placeholder="${escapeHtml(question.placeholder || "輸入答案")}">`;
    const scanButtons = state.data.paragraphs.map((p) => `<button type="button" data-scan-choice="${question.number}:${p.number}">P${p.number}</button>`).join("");
    return `${heading}<section class="question-card" id="question-${question.number}" data-question="${question.number}"><div class="question-bookmark-row">${readingBookmarkButton('question', question.number)}</div><p class="question-prompt"><span class="question-number">${question.number}</span>${interactiveWords(question.prompt, `q${question.number}`)}</p><p class="question-translation" data-question-translation hidden>${escapeHtml(question.translation)}</p>${options}<div class="question-actions"><button class="scan-button" type="button" data-scan-question="${question.number}">Scan：選擇段落</button><button class="scanning-tip-button" type="button" data-scanning-tip="${question.number}">Scanning 提示</button><button class="reveal-button" type="button" data-reveal="${question.number}">顯示答案及分析</button><span class="question-result" data-question-result="${question.number}"></span></div><div class="scan-chooser" data-scan-chooser="${question.number}" hidden><span>答案最可能在哪一段？</span>${scanButtons}</div><small class="answer-timestamp" data-answer-time="${question.number}" hidden></small></section>`;
  }).join(""); updateScanControls(); updateAnswerProgress();
}
function collectAnswers() { const form = new FormData(el.questionForm); state.data.questions.forEach((question) => { const value = String(form.get(`q${question.number}`) || "").trim(); if (value) state.answers[`q${question.number}`] = value; else delete state.answers[`q${question.number}`]; }); return state.answers; }
function lockQuestionForm(locked) { $$('input[name^="q"]', el.questionForm).forEach((node) => { node.disabled = locked; }); $('[data-submit-partial]').disabled = locked; $('[type="submit"]', el.questionForm).disabled = locked; }
function applyResults(payload) {
  const list = payload?.question_results || payload?.results || []; const mapped = Array.isArray(list) ? Object.fromEntries(list.map((row) => [Number(row.question_number), row])) : {};
  Object.entries(mapped).forEach(([number, row]) => { const target = $(`[data-question-result="${number}"]`); if (!target) return; target.textContent = row.correct ? `✓ 正確 · ${row.correct_answer}` : `✗ 答案：${row.correct_answer}`; target.className = `question-result ${row.correct ? "is-correct" : "is-wrong"}`; });
  if (payload?.status && payload.status !== "in_progress") { state.results.finalized = true; pauseTimer(); lockQuestionForm(true); el.submissionStatus.textContent = `已提交：${payload.correct_count || 0} / ${payload.answered_count || 0} 題正確。`; }
}
async function saveAttempt(submit = false, force = false, silent = false, retry = true) {
  if (!state.token || !state.data || state.submitting || state.results.finalized) return null; collectAnswers(); if (!submit && !Object.keys(state.answers).length && currentDuration() === 0) return null; state.submitting = true;
  try {
    const payload = await rpc("reading_comprehension_save_attempt", { p_token: state.token, p_attempt_id: state.attemptId, p_article_id: ARTICLE_ID, p_answers: state.answers, p_duration_ms: Math.round(currentDuration()), p_submit: submit, p_force_submit: force });
    if (payload?.attempt_id) state.attemptId = String(payload.attempt_id); applyResults(payload); if (!silent) showToast(submit ? "答案已安全提交。" : "進度已儲存。"); return payload;
  } catch (error) {
    if (retry && state.attemptId && (error?.code === "P0002" || error?.code === "42883")) { state.attemptId = null; state.submitting = false; return saveAttempt(submit, force, silent, false); }
    console.warn("Attempt save failed", error); if (!silent) showToast("暫時未能儲存，請檢查連線後再試。"); return null;
  } finally { state.submitting = false; }
}
async function submitAnswers(partial = false, force = false) {
  collectAnswers(); const count = Object.keys(state.answers).length;
  if (!count) return showToast("請先作答至少一題。"); if (!partial && !force && count < state.data.questions.length) return showToast(`尚有 ${state.data.questions.length - count} 題未作答；可先提交已作答題目。`);
  el.submissionStatus.textContent = "正在提交答案…"; const payload = await saveAttempt(true, force); if (payload && payload.status === "in_progress") el.submissionStatus.textContent = `已批改 ${payload.answered_count || count} 題；可繼續完成其餘題目。`;
}

function showPopover(node) { closePopovers(node); node.hidden = false; requestAnimationFrame(() => node.classList.add("is-visible")); }
function closePopover(node) { if (!node || node.hidden) return; node.classList.remove("is-visible"); node.hidden = true; }
function closePopovers(except = null) { [el.skimmingDialog, el.analysisDialog].forEach((node) => { if (node !== except) closePopover(node); }); }
function openSkimming(number) {
  state.activeSkimming = number; const overview = state.analysis?.paragraphOverview?.paragraphs?.find((item) => Number(item.number) === number); $('[data-skimming-kicker]').textContent = `PARAGRAPH ${number}`; $('[data-skimming-title]').textContent = `Skimming Tips · 第 ${number} 段`; $('[data-skimming-content]').innerHTML = `<p>${escapeHtml(overview?.summary || "暫未有段落提示。")}</p>`; $('[data-skimming-bookmark]').textContent = state.bookmarks.has(`${ARTICLE_ID}:skimming:${number}`) ? "★ 已收藏這段提示" : "☆ 收藏這段提示"; showPopover(el.skimmingDialog);
}
function renderAnalysisBlocks(sections) { return (sections || []).map((section) => `<section class="analysis-section"><div class="analysis-section-heading"><h3>${escapeHtml(section.title)}</h3>${section.id ? readingBookmarkButton('section', state.activeAnalysis, section.id) : ''}</div>${(section.blocks || []).map((block) => block.kind === "quote" ? `<blockquote class="analysis-quote">${escapeHtml(block.text)}</blockquote>` : block.kind === "label" ? `<strong>${escapeHtml(block.text)}</strong>` : `<p>${escapeHtml(block.text)}</p>`).join("")}</section>`).join(""); }
function openAnalysis(number, mode = 'analysis', sectionId = '') {
  const question = state.analysis.questions.find((item) => Number(item.number) === number); if (!question) return;
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
  const analysis = state.analysis?.questions.find((item) => Number(item.number) === number);
  const section = analysis?.sections.find((item) => item.id === sectionId);
  const overview = state.analysis?.paragraphOverview?.paragraphs.find((item) => Number(item.number) === number);
  const blocksText = (sections) => (sections || []).flatMap((item) => (item.blocks || []).map((block) => block.text)).join(' ');
  const keys = { passage: 'passage', questions: 'questions', paragraph: `paragraph:${number}`, question: `question:${number}`, skimming: `skimming:${number}`, scanning: `scanning:${number}`, analysis: `q${number}`, section: `analysis:${number}:${sectionId}` };
  const labels = { passage: '文章與題目組', questions: '整組題目', paragraph: `第 ${number} 段`, question: `第 ${number} 題`, skimming: `Skimming · 第 ${number} 段`, scanning: `Scanning · 第 ${number} 題`, analysis: `第 ${number} 題解析`, section: `第 ${number} 題 · ${section?.title || '分析小節'}` };
  const prefixes = { passage: '文章', questions: '題目組', paragraph: '段落', question: '題目', skimming: 'Skimming', scanning: 'Scanning', analysis: '答案解析', section: '分析小節' };
  const details = { passage: `IELTS Reading · Passage 1 · Practice 69 · 閱讀文章及 ${state.data?.questions.length || 13} 題練習`, questions: 'Albert Einstein · Practice 69 · 完整題目組', paragraph: paragraph?.text, question: question?.prompt, skimming: overview?.summary, scanning: blocksText(scanningSections(analysis)), analysis: `正確答案：${analysis?.answer || ''}。${blocksText(analysis?.sections.slice(0, 1))}`, section: blocksText(section ? [section] : []) };
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
  const target = bookmarkTarget(key); if (!target || target.article !== ARTICLE_ID) return showToast('這篇練習暫未開放。');
  history.replaceState({}, '', readingBookmarkLink(target));
  await openExercise();
}
async function toggleWordBookmark(word) {
  if (word.classList.contains('is-pending')) return;
  const key = word.dataset.wordKey; const bookmarked = !state.bookmarks.has(key); const context = word.dataset.wordContext; const label = word.textContent.trim(); word.classList.toggle("is-pending", true);
  try { await setBookmark({ key, title: `[閱讀重點] ${label}`, detail: `Albert Einstein · ${context.startsWith("p") ? `第 ${context.slice(1)} 段` : `第 ${context.slice(1)} 題`} · 點選字詞`, href: `reading-comprehension.html?article=${ARTICLE_ID}#${context.startsWith("p") ? `paragraph-${context.slice(1)}` : `question-${context.slice(1)}`}` }, bookmarked); word.classList.toggle("is-bookmarked", bookmarked); showToast(bookmarked ? `已收藏重點字詞「${label}」。` : `已移除重點字詞「${label}」。`); } catch (error) { console.warn(error); showToast("字詞書簽暫時未能儲存。"); } finally { word.classList.remove("is-pending"); }
}

function paragraphAudioRange(number) {
  if (!state.audioItem) return null; const explicit = state.audioItem.paragraphs?.find((row) => Number(row.number) === number); if (explicit) return explicit;
  const counts = state.data.paragraphs.map((p) => (p.text.match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu) || []).length); const from = counts.slice(0, number - 1).reduce((a, b) => a + b, 0); const to = from + counts[number - 1] - 1; const words = state.audioItem.words || []; return words[from] && words[to] ? { number, start: words[from].start, end: words[to].end } : null;
}
function playParagraph(number) { const range = paragraphAudioRange(number); if (!range) return showToast("本段朗讀暫時未能載入。"); state.audioStopAt = Number(range.end); el.audio.currentTime = Number(range.start); el.audio.play().catch(() => showToast("瀏覽器未能開始播放，請再按一次。")); }
function setupAudio() {
  const item = AUDIO_MANIFEST[ARTICLE_ID] || AUDIO_MANIFEST.items?.[ARTICLE_ID]; if (!item?.src) return; state.audioItem = item; el.audio.src = item.src; el.audioToggle.disabled = false; el.audioBack.disabled = false; el.audioSeek.disabled = false; if (state.audioSetup) return; state.audioSetup = true;
  el.audio.addEventListener("loadedmetadata", () => { el.audioSeek.max = String(el.audio.duration || 1); updateAudioDisplay(); });
  el.audio.addEventListener("timeupdate", () => { if (state.audioStopAt !== null && el.audio.currentTime >= state.audioStopAt) { state.audioStopAt = null; el.audio.pause(); } el.audioSeek.value = String(el.audio.currentTime); updateAudioDisplay(); syncWord(item); });
  el.audio.addEventListener("play", () => { el.audioToggle.textContent = "❚❚ 暫停朗讀"; }); el.audio.addEventListener("pause", () => { el.audioToggle.textContent = "▶ 朗讀全文"; });
  el.audio.addEventListener("ended", () => { state.audioStopAt = null; $$('.spoken-word.is-active').forEach((node) => node.classList.remove("is-active")); });
}
function updateAudioDisplay() { el.audioTime.textContent = `${formatClock(el.audio.currentTime * 1000)} / ${formatClock((el.audio.duration || 0) * 1000)}`; }
function syncWord(item) { if (!el.sync.checked) return; const words = item.words || []; const time = el.audio.currentTime; const index = words.findIndex((word) => time >= Number(word.start) && time < Number(word.end)); if (index < 0) return; const current = $('.spoken-word.is-active'); const target = $(`[data-word-index="${index}"]`); if (current !== target) { current?.classList.remove("is-active"); target?.classList.add("is-active"); target?.scrollIntoView({ block: "center", behavior: "smooth" }); } }

function scanStorageKey() { return `edmund-reading-scan-v1:${state.user?.id || "student"}:${ARTICLE_ID}`; }
function loadScanAssignments() { try { state.scanAssignments = JSON.parse(localStorage.getItem(scanStorageKey()) || "{}") || {}; } catch { state.scanAssignments = {}; } }
function saveScanAssignments() { try { localStorage.setItem(scanStorageKey(), JSON.stringify(state.scanAssignments)); } catch {} }
function assignScan(question, paragraph) { state.scanAssignments[question] = paragraph; saveScanAssignments(); updateScanControls(); renderScanTags(); }
function updateScanControls() { $$('[data-scan-question]').forEach((button) => { const p = state.scanAssignments[button.dataset.scanQuestion]; button.textContent = p ? `Scan：P${p}` : "Scan：選擇段落"; button.classList.toggle("has-scan", Boolean(p)); }); $$('[data-scan-choice]').forEach((button) => { const [q, p] = button.dataset.scanChoice.split(":"); button.classList.toggle("is-selected", Number(state.scanAssignments[q]) === Number(p)); }); }
function renderScanTags() { $$('[data-scan-tags]').forEach((container) => { const paragraph = Number(container.dataset.scanTags); const questions = Object.entries(state.scanAssignments).filter(([, p]) => Number(p) === paragraph).map(([q]) => Number(q)).sort((a, b) => a - b); container.innerHTML = questions.map((q) => `<span class="scan-question-tag" title="第 ${q} 題的 Scan 段落">${q}</span>`).join(""); }); }

async function openExercise() {
  await loadArticleData();
  // Opening another saved item in the same unfinished exercise must not erase answers.
  if (!state.exerciseReady || state.results.finalized) {
    resetAttemptState(); loadScanAssignments(); renderPassage(); renderQuestions(); setupAudio(); lockQuestionForm(false); state.exerciseReady = true;
    updateTranslations(); $$('[data-question-translation]').forEach((node) => { node.hidden = !$('[data-question-translations]').checked; }); el.submissionStatus.textContent = '';
    state.timerHandle = setInterval(updateTimer, 250); state.autosaveHandle = setInterval(() => { if (state.view === 'exercise') saveAttempt(false, false, true); }, 15000);
  }
  updateBookmarkControls(); showView("exercise"); updateTimer(); updateAnswerProgress();
  const params = new URLSearchParams(location.search);
  const requestedView = params.get('view');
  if (requestedView === 'skimming') openSkimming(Number(params.get('paragraph')));
  else if (requestedView === 'scanning' || requestedView === 'analysis') openAnalysis(Number(params.get('question')), requestedView, params.get('section') || '');
  const hashTarget = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  if (hashTarget) setTimeout(() => {
    hashTarget.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    hashTarget.setAttribute('tabindex', '-1'); hashTarget.focus({ preventScroll: true });
  }, 200);
}
async function openInitialView() {
  if (new URLSearchParams(location.search).get('article') === ARTICLE_ID) await openExercise();
  else await openDashboard();
}

el.loginForm.addEventListener("submit", handleLogin); el.logout.addEventListener("click", logout); el.home.addEventListener("click", openDashboard); $('[data-open-exercise]').addEventListener("click", openExercise); $('[data-back-dashboard]').addEventListener("click", openDashboard); $('[data-refresh-dashboard]').addEventListener("click", loadDashboard);
$('[data-password-toggle]').addEventListener("click", (event) => { const input = $('input[name="password"]', el.loginForm); const shown = input.type === "text"; input.type = shown ? "password" : "text"; event.currentTarget.textContent = shown ? "顯示" : "隱藏"; event.currentTarget.setAttribute("aria-pressed", String(!shown)); });
el.progressToggle.addEventListener("click", () => { const open = el.progressToggle.getAttribute("aria-expanded") === "true"; el.progressToggle.setAttribute("aria-expanded", String(!open)); el.progressPanel.hidden = open; el.progressLabel.textContent = open ? "展開 ＋" : "收合 −"; });
$$('[data-passage-tab]').forEach((button) => button.addEventListener("click", () => selectPassageTab(Number(button.dataset.passageTab))));
document.addEventListener("click", (event) => {
  const passageButton = event.target.closest('[data-passage-bookmark]'); if (passageButton) return togglePassageBookmark();
  const button = event.target.closest('[data-bookmark-kind]'); if (button) return toggleReadingBookmark(readingBookmarkItem(button.dataset.bookmarkKind, Number(button.dataset.bookmarkNumber || 0), button.dataset.bookmarkSection || ''));
  const openButton = event.target.closest('[data-open-reading-bookmark]'); if (openButton) return openReadingBookmark(openButton.dataset.openReadingBookmark);
  const removeButton = event.target.closest('[data-remove-reading-bookmark]'); if (removeButton) return toggleReadingBookmark(state.bookmarkItems.get(removeButton.dataset.removeReadingBookmark), true);
});
$('[data-bookmark-library-toggle]').addEventListener('click', () => setBookmarkLibraryOpen($('[data-bookmark-library]').hidden));
$('[data-bookmark-filter]').addEventListener('change', renderBookmarkLibrary);
$('[data-refresh-bookmarks]').addEventListener('click', async (event) => { const button = event.currentTarget; button.disabled = true; try { await loadBookmarks(); } finally { button.disabled = false; } });
$('[data-answer-progress-toggle]').addEventListener('click', () => setAnswerProgressVisible($('[data-answer-progress-content]').hidden, true));
el.translationButton.addEventListener("click", () => { const open = el.translationButton.getAttribute("aria-expanded") === "true"; el.translationButton.setAttribute("aria-expanded", String(!open)); el.translationPanel.hidden = open; });
function updateTranslations() { const all = el.translationAll.checked; $$('[data-translation-paragraph]').forEach((checkbox) => { if (all) checkbox.checked = true; checkbox.disabled = all; }); $$('[data-translation-copy]').forEach((copy) => { const selected = $(`[data-translation-paragraph="${copy.dataset.translationCopy}"]`).checked; copy.hidden = !(all || selected); }); }
el.translationAll.addEventListener("change", updateTranslations); $$('[data-translation-paragraph]').forEach((node) => node.addEventListener("change", updateTranslations));
$('[data-hide-translations]').addEventListener("click", () => { el.translationAll.checked = false; $$('[data-translation-paragraph]').forEach((checkbox) => { checkbox.checked = false; checkbox.disabled = false; }); updateTranslations(); showToast("已隱藏所有文章翻譯。"); });
$('[data-question-translations]').addEventListener("change", (event) => { $$('[data-question-translation]').forEach((node) => { node.hidden = !event.currentTarget.checked; }); });
el.passage.addEventListener("click", (event) => { const paragraphAudio = event.target.closest('[data-play-paragraph]'); if (paragraphAudio) return playParagraph(Number(paragraphAudio.dataset.playParagraph)); const button = event.target.closest('[data-skimming]'); if (button) return openSkimming(Number(button.dataset.skimming)); const word = event.target.closest('[data-word-key]'); if (word) toggleWordBookmark(word); });
el.questions.addEventListener("click", (event) => {
  const word = event.target.closest('[data-word-key]'); if (word) return toggleWordBookmark(word);
  const choice = event.target.closest('[data-scan-choice]'); if (choice) { const [q, p] = choice.dataset.scanChoice.split(":").map(Number); assignScan(q, p); return; }
  const scan = event.target.closest('[data-scan-question]'); if (scan) { const chooser = $(`[data-scan-chooser="${scan.dataset.scanQuestion}"]`); chooser.hidden = !chooser.hidden; return; }
  const scanning = event.target.closest('[data-scanning-tip]'); if (scanning) return openAnalysis(Number(scanning.dataset.scanningTip), 'scanning');
  const reveal = event.target.closest('[data-reveal]'); if (reveal) return openAnalysis(Number(reveal.dataset.reveal));
  const row = event.target.closest('.choice-list label'); if (row) { const radio = $('input[type="radio"]', row); if (radio && !radio.disabled && !radio.checked) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); } }
});
function handleAnswerInput(event) { if (!event.target.matches('[data-answer-part]')) return; const match = event.target.name?.match(/^q(\d+)/); if (match) recordAnswerTime(Number(match[1]), event.target.value); updateAnswerProgress(); }
el.questionForm.addEventListener("input", handleAnswerInput);
el.questionForm.addEventListener("change", handleAnswerInput);
el.questionForm.addEventListener("submit", (event) => { event.preventDefault(); submitAnswers(false, false); }); $('[data-submit-partial]').addEventListener("click", () => submitAnswers(true, false)); $('[data-analysis-bookmark]').addEventListener("click", toggleAnalysisBookmark); $('[data-skimming-bookmark]').addEventListener("click", toggleSkimmingBookmark);
el.timerToggle.addEventListener("click", () => state.timerRunning ? pauseTimer() : startTimer());
el.timerMode.addEventListener("change", () => { state.timerMode = el.timerMode.value; const countdown = state.timerMode === "countdown"; el.countdownLabel.hidden = !countdown; el.forceLabel.hidden = !countdown; el.timerModeLabel.textContent = countdown ? "倒數計時（選用）" : "計時（選用）"; updateTimer(); });
el.countdownMinutes.addEventListener("change", () => { state.countdownMinutes = Math.max(1, Math.min(180, Number(el.countdownMinutes.value) || 20)); el.countdownMinutes.value = String(state.countdownMinutes); updateTimer(); }); el.forceSubmit.addEventListener("change", () => { state.forceSubmit = el.forceSubmit.checked; });
el.audioToggle.addEventListener("click", () => { state.audioStopAt = null; if (el.audio.ended) el.audio.currentTime = 0; return el.audio.paused ? el.audio.play().catch(() => showToast("瀏覽器未能開始播放，請再按一次。")) : el.audio.pause(); }); el.audioBack.addEventListener("click", () => { state.audioStopAt = null; el.audio.currentTime = Math.max(0, el.audio.currentTime - 5); }); el.audioSeek.addEventListener("input", () => { state.audioStopAt = null; el.audio.currentTime = Number(el.audioSeek.value); }); el.audioRate.addEventListener("change", () => { el.audio.playbackRate = Number(el.audioRate.value); });
$$('[data-close-popover]').forEach((button) => button.addEventListener("click", () => closePopover(button.closest('[role="dialog"]'))));
document.addEventListener("pointerdown", (event) => { [el.skimmingDialog, el.analysisDialog].forEach((popover) => { if (!popover.hidden && !popover.contains(event.target) && !event.target.closest('[data-skimming],[data-reveal],[data-scanning-tip]')) closePopover(popover); }); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closePopovers(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) { pauseTimer(); saveAttempt(false, false, true); } }); window.addEventListener("pagehide", () => { pauseTimer(); saveAttempt(false, false, true); });

(async function init() {
  let progressVisible = true; try { progressVisible = localStorage.getItem('edmund-reading-progress-hidden') !== 'true'; } catch {}
  setAnswerProgressVisible(progressVisible);
  if (typeof ResizeObserver !== 'undefined') { const observer = new ResizeObserver(updateFloatingOffsets); ['.edmund-system-header', '[data-answer-progress-dock]', '.study-toolbar'].forEach((selector) => observer.observe($(selector))); }
  window.addEventListener('resize', updateFloatingOffsets);
  setConnection("正在連接", "checking");
  try { await ensureSession(); setConnection("已連線", "online"); if (await restoreSession()) { await Promise.all([loadArticleData(), loadBookmarks()]); await openInitialView(); } else showView("login"); }
  catch (error) { console.warn(error); setConnection("連線失敗", "error"); setStatus("登入服務暫時未能連線，請稍後再試。", "error"); }
})();
