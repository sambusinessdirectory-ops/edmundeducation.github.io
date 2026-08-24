const CONFIG = window.EDMUND_SUPABASE || {};
const SESSION_KEY = "edmund-reading-comprehension-session-v1";
const ARTICLE_ID = "p1-069-albert-einstein";
const DATA_URL = `reading-comprehension-data/${ARTICLE_ID}.json`;
const ANALYSIS_URL = `ielts-reading-analysis-data/${ARTICLE_ID}.json`;
const AUDIO_MANIFEST = window.EDMUND_READING_AUDIO || {};

const state = {
  supabase: null, token: "", user: null, view: "login", data: null, analysis: null,
  attemptId: null, answers: {}, results: {}, bookmarks: new Set(), activeAnalysis: 0,
  timerRunning: false, durationMs: 0, timerStartedAt: 0, timerHandle: 0, autosaveHandle: 0,
  timerMode: "stopwatch", countdownMinutes: 20, forceSubmit: false, submitting: false,
  wordIndex: 0, toastHandle: 0, dashboard: null
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

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function setConnection(text, status) { el.connection.textContent = text; el.connection.dataset.state = status; }
function setStatus(text = "", status = "") { el.loginStatus.textContent = text; el.loginStatus.dataset.state = status; }
function showToast(message) { clearTimeout(state.toastHandle); el.toast.textContent = message; el.toast.hidden = false; state.toastHandle = setTimeout(() => { el.toast.hidden = true; }, 3600); }
function showView(view) {
  state.view = view; el.views.forEach((node) => { node.hidden = node.dataset.view !== view; });
  const signedIn = Boolean(state.user && state.token); el.user.hidden = !signedIn; el.logout.hidden = !signedIn; el.home.hidden = !signedIn || view === "dashboard";
  if (signedIn) el.user.textContent = `${state.user.name} · 學生`;
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
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
function clearSession() { state.token = ""; state.user = null; try { sessionStorage.removeItem(SESSION_KEY); } catch {} }
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
  try { const rows = await rpc("learning_portal_list_bookmarks", { p_token: state.token, p_system_key: "reading-comprehension" }); state.bookmarks = new Set((Array.isArray(rows) ? rows : []).map((row) => String(row.item_key))); }
  catch (error) { console.warn("Reading bookmarks unavailable", error); }
}

async function handleLogin(event) {
  event.preventDefault(); const form = new FormData(el.loginForm); const username = String(form.get("username") || "").trim(); const password = String(form.get("password") || "");
  if (!username || !password) return setStatus("請輸入用戶名稱及密碼。", "error");
  el.loginButton.disabled = true; setStatus("正在核對帳戶…");
  try { if (!await login(username, password)) throw new Error("用戶名稱或密碼不正確。"); await Promise.all([loadArticleData(), loadBookmarks()]); el.loginForm.reset(); setStatus(); setConnection("已安全連接", "online"); await openDashboard(); showToast(`您好，${state.user.name}！`); }
  catch (error) { console.warn(error); setStatus(error.message || "登入失敗，請稍後再試。", "error"); setConnection("連線失敗", "error"); }
  finally { el.loginButton.disabled = false; }
}
async function restoreSession() {
  const universal = window.EdmundSystemNav?.getStudentSession?.(); const local = readSession(); const candidate = universal?.role === "student" ? universal : local?.role === "student" ? local : null;
  if (!candidate?.token) return false; try { return await validateToken(String(candidate.token)); } catch { clearSession(); return false; }
}
async function logout() { pauseTimer(); el.audio.pause(); await saveAttempt(false, false, true); window.EdmundSystemNav?.forgetStudentSession(); clearSession(); try { await state.supabase?.auth.signOut(); } catch {} setConnection("已連線", "online"); showView("login"); }

function formatDuration(ms) { const seconds = Math.max(0, Math.floor(Number(ms || 0) / 1000)); return `${Math.floor(seconds / 60)} 分 ${String(seconds % 60).padStart(2, "0")} 秒`; }
function formatClock(ms) { const seconds = Math.max(0, Math.floor(ms / 1000)); return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
function currentDuration() { return state.durationMs + (state.timerRunning ? Date.now() - state.timerStartedAt : 0); }
function updateTimer() {
  const elapsed = currentDuration(); const limit = state.countdownMinutes * 60000; const shown = state.timerMode === "countdown" ? Math.max(0, limit - elapsed) : elapsed; el.timer.textContent = formatClock(shown);
  if (state.timerMode === "countdown" && elapsed >= limit && state.timerRunning) { pauseTimer(); if (state.forceSubmit) { showToast("時間已到，系統正在自動提交答案。"); submitAnswers(true, true); } else showToast("時間已到；你仍可繼續完成或自行提交。"); }
}
function startTimer() { if (state.timerRunning || state.results.finalized) return; state.timerRunning = true; state.timerStartedAt = Date.now(); el.timerToggle.textContent = "暫停"; updateTimer(); }
function pauseTimer() { if (!state.timerRunning) return; state.durationMs += Date.now() - state.timerStartedAt; state.timerRunning = false; state.timerStartedAt = 0; el.timerToggle.textContent = "繼續"; updateTimer(); }
function resetAttemptState() { state.attemptId = null; state.answers = {}; state.results = {}; state.durationMs = 0; state.timerStartedAt = 0; state.timerRunning = false; clearInterval(state.timerHandle); clearInterval(state.autosaveHandle); }

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
async function openDashboard() { pauseTimer(); if (state.attemptId && !state.results.finalized) await saveAttempt(false, false, true); showView("dashboard"); el.welcome.textContent = `您好，${state.user.name}！請選擇閱讀練習。`; await loadDashboard(); }

function renderWords(text) {
  let html = ""; let last = 0; const regex = /[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu; let match;
  while ((match = regex.exec(text))) { html += escapeHtml(text.slice(last, match.index)); html += `<span class="spoken-word" data-word-index="${state.wordIndex++}">${escapeHtml(match[0])}</span>`; last = regex.lastIndex; }
  return html + escapeHtml(text.slice(last));
}
function renderPassage() {
  state.wordIndex = 0; el.passage.innerHTML = state.data.paragraphs.map((paragraph) => `<section class="passage-paragraph" id="paragraph-${paragraph.number}"><span class="paragraph-label">PARAGRAPH ${paragraph.number}</span><div class="passage-text-block">${renderWords(paragraph.text)}</div><div class="translation-copy" data-translation-copy="${paragraph.number}" hidden lang="zh-Hant">${escapeHtml(paragraph.translation)}</div><button class="skimming-button" type="button" data-skimming="${paragraph.number}">Skimming Tips · 第 ${paragraph.number} 段</button></section>`).join("");
}
function normalizedOption(option) { return typeof option === "string" ? { value: option, label: option, translation: "" } : option; }
function renderQuestions() {
  const groupLabels = { trueFalse: state.data.instructions.trueFalse, completion: state.data.instructions.completion, multipleChoice: state.data.instructions.multipleChoice }; let group = "";
  el.questions.innerHTML = state.data.questions.map((question) => {
    const heading = group !== question.group ? `<p class="question-group-heading">${escapeHtml(groupLabels[question.group])}</p>` : ""; group = question.group;
    const options = question.type === "choice" ? `<div class="choice-list">${question.options.map((entry) => { const option = normalizedOption(entry); return `<label><input type="radio" name="q${question.number}" value="${escapeHtml(option.value)}"><span><strong>${escapeHtml(option.label)}</strong>${option.translation ? `<small class="option-translation" data-question-translation hidden><br>${escapeHtml(option.translation)}</small>` : ""}</span></label>`; }).join("")}</div>` : `<input class="answer-input" name="q${question.number}" autocomplete="off" maxlength="100" placeholder="${escapeHtml(question.placeholder || "輸入答案")}">`;
    return `${heading}<section class="question-card" id="question-${question.number}" data-question="${question.number}"><p class="question-prompt"><span class="question-number">${question.number}</span>${escapeHtml(question.prompt)}</p><p class="question-translation" data-question-translation hidden>${escapeHtml(question.translation)}</p>${options}<div class="question-actions"><button class="reveal-button" type="button" data-reveal="${question.number}">顯示答案及分析</button><span class="question-result" data-question-result="${question.number}"></span></div></section>`;
  }).join("");
}
function collectAnswers() { const form = new FormData(el.questionForm); state.data.questions.forEach((question) => { const value = String(form.get(`q${question.number}`) || "").trim(); if (value) state.answers[`q${question.number}`] = value; else delete state.answers[`q${question.number}`]; }); return state.answers; }
function restoreAnswers() { Object.entries(state.answers).forEach(([key, value]) => { const nodes = $$(`[name="${CSS.escape(key)}"]`); nodes.forEach((node) => { if (node.type === "radio") node.checked = node.value === value; else node.value = value; }); }); }
function lockQuestionForm(locked) { $$('input[name^="q"]', el.questionForm).forEach((node) => { node.disabled = locked; }); $('[data-submit-partial]').disabled = locked; $('[type="submit"]', el.questionForm).disabled = locked; }
function applyResults(payload) {
  const list = payload?.question_results || payload?.results || []; const mapped = Array.isArray(list) ? Object.fromEntries(list.map((row) => [Number(row.question_number), row])) : {};
  Object.entries(mapped).forEach(([number, row]) => { const target = $(`[data-question-result="${number}"]`); if (!target) return; target.textContent = row.correct ? `✓ 正確 · ${row.correct_answer}` : `✗ 答案：${row.correct_answer}`; target.className = `question-result ${row.correct ? "is-correct" : "is-wrong"}`; });
  if (payload?.status && payload.status !== "in_progress") { state.results.finalized = true; pauseTimer(); lockQuestionForm(true); el.submissionStatus.textContent = `已提交：${payload.correct_count || 0} / ${payload.answered_count || 0} 題正確。`; }
}
async function saveAttempt(submit = false, force = false, silent = false) {
  if (!state.token || !state.data || state.submitting || state.results.finalized) return null; collectAnswers(); state.submitting = true;
  try {
    const payload = await rpc("reading_comprehension_save_attempt", { p_token: state.token, p_attempt_id: state.attemptId, p_article_id: ARTICLE_ID, p_answers: state.answers, p_duration_ms: Math.round(currentDuration()), p_submit: submit, p_force_submit: force });
    if (payload?.attempt_id) state.attemptId = String(payload.attempt_id); applyResults(payload); if (!silent) showToast(submit ? "答案已安全提交。" : "進度已儲存。"); return payload;
  } catch (error) { console.warn("Attempt save failed", error); if (!silent) showToast("暫時未能儲存，請檢查連線後再試。"); return null; }
  finally { state.submitting = false; }
}
async function submitAnswers(partial = false, force = false) {
  collectAnswers(); const count = Object.keys(state.answers).length;
  if (!count) return showToast("請先作答至少一題。"); if (!partial && !force && count < state.data.questions.length) return showToast(`尚有 ${state.data.questions.length - count} 題未作答；可先提交已作答題目。`);
  el.submissionStatus.textContent = "正在提交答案…"; const payload = await saveAttempt(true, force); if (payload && payload.status === "in_progress") el.submissionStatus.textContent = `已批改 ${payload.answered_count || count} 題；可繼續完成其餘題目。`;
}

function openSkimming(number) {
  const overview = state.analysis?.paragraphOverview?.paragraphs?.find((item) => Number(item.number) === number); $('[data-skimming-kicker]').textContent = `PARAGRAPH ${number}`; $('[data-skimming-title]').textContent = `Skimming Tips · 第 ${number} 段`; $('[data-skimming-content]').innerHTML = `<p>${escapeHtml(overview?.summary || "暫未有段落提示。")}</p>`; el.skimmingDialog.showModal();
}
function renderAnalysisBlocks(sections) {
  return (sections || []).map((section) => `<section class="analysis-section"><h3>${escapeHtml(section.title)}</h3>${(section.blocks || []).map((block) => block.kind === "quote" ? `<blockquote class="analysis-quote">${escapeHtml(block.text)}</blockquote>` : block.kind === "label" ? `<strong>${escapeHtml(block.text)}</strong>` : `<p>${escapeHtml(block.text)}</p>`).join("")}</section>`).join("");
}
function openAnalysis(number) {
  const question = state.analysis.questions.find((item) => Number(item.number) === number); if (!question) return;
  state.activeAnalysis = number; $('[data-analysis-kicker]').textContent = `QUESTION ${number}`; $('[data-analysis-title]').textContent = `第 ${number} 題答案解析`; $('[data-analysis-answer]').textContent = `正確答案：${question.answer}`; $('[data-analysis-content]').innerHTML = renderAnalysisBlocks(question.sections);
  el.analysisDialog.querySelector('[data-analysis-bookmark]').textContent = state.bookmarks.has(`${ARTICLE_ID}:q${number}`) ? "★ 已收藏這題解析" : "☆ 收藏這題解析"; el.analysisDialog.showModal();
}
async function toggleAnalysisBookmark() {
  const number = state.activeAnalysis; const question = state.analysis.questions.find((item) => Number(item.number) === number); if (!question) return; const key = `${ARTICLE_ID}:q${number}`; const bookmarked = !state.bookmarks.has(key); const button = $('[data-analysis-bookmark]'); button.disabled = true;
  try { await rpc("learning_portal_set_bookmark", { p_token: state.token, p_system_key: "reading-comprehension", p_item_key: key, p_title: `Albert Einstein · 第 ${number} 題解析`, p_detail: `正確答案：${question.answer}。${question.sections?.[0]?.blocks?.map((block) => block.text).join(" ").slice(0, 260) || ""}`, p_href: `reading-comprehension.html?article=${ARTICLE_ID}#question-${number}`, p_bookmarked: bookmarked }); if (bookmarked) state.bookmarks.add(key); else state.bookmarks.delete(key); button.textContent = bookmarked ? "★ 已收藏這題解析" : "☆ 收藏這題解析"; showToast(bookmarked ? "已收藏這題解析。" : "已移除這題解析書簽。"); }
  catch (error) { console.warn(error); showToast("書簽暫時未能儲存。"); } finally { button.disabled = false; }
}

function setupAudio() {
  const item = AUDIO_MANIFEST[ARTICLE_ID] || AUDIO_MANIFEST.items?.[ARTICLE_ID]; if (!item?.src) return;
  el.audio.src = item.src; el.audioToggle.disabled = false; el.audioBack.disabled = false; el.audioSeek.disabled = false;
  el.audio.addEventListener("loadedmetadata", () => { el.audioSeek.max = String(el.audio.duration || 1); updateAudioDisplay(); });
  el.audio.addEventListener("timeupdate", () => { el.audioSeek.value = String(el.audio.currentTime); updateAudioDisplay(); syncWord(item); });
  el.audio.addEventListener("play", () => { el.audioToggle.textContent = "❚❚ 暫停朗讀"; }); el.audio.addEventListener("pause", () => { el.audioToggle.textContent = "▶ 朗讀全文"; });
  el.audio.addEventListener("ended", () => { $$('.spoken-word.is-active').forEach((node) => node.classList.remove('is-active')); });
}
function updateAudioDisplay() { el.audioTime.textContent = `${formatClock(el.audio.currentTime * 1000)} / ${formatClock((el.audio.duration || 0) * 1000)}`; }
function syncWord(item) { if (!el.sync.checked) return; const words = item.words || []; const time = el.audio.currentTime; let index = words.findIndex((word) => time >= Number(word.start) && time < Number(word.end)); if (index < 0) return; const current = $('.spoken-word.is-active'); const target = $(`[data-word-index="${index}"]`); if (current !== target) { current?.classList.remove('is-active'); target?.classList.add('is-active'); target?.scrollIntoView({ block: "center", behavior: "smooth" }); } }

async function openExercise() {
  await loadArticleData(); resetAttemptState(); renderPassage(); renderQuestions(); setupAudio(); showView("exercise"); startTimer(); state.timerHandle = setInterval(updateTimer, 250); state.autosaveHandle = setInterval(() => saveAttempt(false, false, true), 15000);
  const hashQuestion = Number(location.hash.match(/question-(\d+)/)?.[1]); if (hashQuestion) setTimeout(() => $(`#question-${hashQuestion}`)?.scrollIntoView({ behavior: "smooth" }), 200);
}

el.loginForm.addEventListener("submit", handleLogin); el.logout.addEventListener("click", logout); el.home.addEventListener("click", openDashboard); $('[data-open-exercise]').addEventListener("click", openExercise); $('[data-back-dashboard]').addEventListener("click", openDashboard); $('[data-refresh-dashboard]').addEventListener("click", loadDashboard);
$('[data-password-toggle]').addEventListener("click", (event) => { const input = $('input[name="password"]', el.loginForm); const shown = input.type === "text"; input.type = shown ? "password" : "text"; event.currentTarget.textContent = shown ? "顯示" : "隱藏"; event.currentTarget.setAttribute("aria-pressed", String(!shown)); });
el.progressToggle.addEventListener("click", () => { const open = el.progressToggle.getAttribute("aria-expanded") === "true"; el.progressToggle.setAttribute("aria-expanded", String(!open)); el.progressPanel.hidden = open; el.progressLabel.textContent = open ? "展開 ＋" : "收合 −"; });
el.translationButton.addEventListener("click", () => { const open = el.translationButton.getAttribute("aria-expanded") === "true"; el.translationButton.setAttribute("aria-expanded", String(!open)); el.translationPanel.hidden = open; });
function updateTranslations() { const all = el.translationAll.checked; $$('[data-translation-paragraph]').forEach((checkbox) => { if (all) checkbox.checked = true; checkbox.disabled = all; }); $$('[data-translation-copy]').forEach((copy) => { const selected = $(`[data-translation-paragraph="${copy.dataset.translationCopy}"]`).checked; copy.hidden = !(all || selected); }); }
el.translationAll.addEventListener("change", updateTranslations); $$('[data-translation-paragraph]').forEach((node) => node.addEventListener("change", updateTranslations));
$('[data-question-translations]').addEventListener("change", (event) => { $$('[data-question-translation]').forEach((node) => { node.hidden = !event.currentTarget.checked; }); });
el.passage.addEventListener("click", (event) => { const button = event.target.closest('[data-skimming]'); if (button) openSkimming(Number(button.dataset.skimming)); });
el.questions.addEventListener("click", (event) => { const button = event.target.closest('[data-reveal]'); if (button) openAnalysis(Number(button.dataset.reveal)); });
el.questionForm.addEventListener("submit", (event) => { event.preventDefault(); submitAnswers(false, false); }); $('[data-submit-partial]').addEventListener("click", () => submitAnswers(true, false)); $('[data-analysis-bookmark]').addEventListener("click", toggleAnalysisBookmark);
el.timerToggle.addEventListener("click", () => state.timerRunning ? pauseTimer() : startTimer());
el.timerMode.addEventListener("change", () => { state.timerMode = el.timerMode.value; const countdown = state.timerMode === "countdown"; el.countdownLabel.hidden = !countdown; el.forceLabel.hidden = !countdown; el.timerModeLabel.textContent = countdown ? "倒數計時" : "正計時"; updateTimer(); });
el.countdownMinutes.addEventListener("change", () => { state.countdownMinutes = Math.max(1, Math.min(180, Number(el.countdownMinutes.value) || 20)); el.countdownMinutes.value = String(state.countdownMinutes); updateTimer(); }); el.forceSubmit.addEventListener("change", () => { state.forceSubmit = el.forceSubmit.checked; });
el.audioToggle.addEventListener("click", () => el.audio.paused ? el.audio.play().catch(() => showToast("瀏覽器未能開始播放，請再按一次。")) : el.audio.pause()); el.audioBack.addEventListener("click", () => { el.audio.currentTime = Math.max(0, el.audio.currentTime - 5); }); el.audioSeek.addEventListener("input", () => { el.audio.currentTime = Number(el.audioSeek.value); }); el.audioRate.addEventListener("change", () => { el.audio.playbackRate = Number(el.audioRate.value); });
document.addEventListener("visibilitychange", () => { if (document.hidden) { pauseTimer(); saveAttempt(false, false, true); } }); window.addEventListener("pagehide", () => { pauseTimer(); saveAttempt(false, false, true); });

(async function init() {
  setConnection("正在連接", "checking");
  try { await ensureSession(); setConnection("已連線", "online"); if (await restoreSession()) { await Promise.all([loadArticleData(), loadBookmarks()]); await openDashboard(); } else showView("login"); }
  catch (error) { console.warn(error); setConnection("連線失敗", "error"); setStatus("登入服務暫時未能連線，請稍後再試。", "error"); }
})();
