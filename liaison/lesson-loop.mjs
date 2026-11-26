window.__EDMUND_LIAISON_LOOP_V2__ = true;

const { questions, LESSON_STEPS } = await import("./liaison.mjs?bank=20261126-simple1");
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const SESSION_KEY = "edmund-liaison-session-v1";
const PROGRESS_PREFIX = "edmund-liaison-simple-progress-v1:";
const localPreview = ["127.0.0.1", "localhost"].includes(location.hostname) && new URLSearchParams(location.search).get("preview") === "1";
let authGeneration = 0;

const state = { user: null, token: "", completed: new Set(), lessons: new Map(), recording: null, module: null };
const views = Object.fromEntries($$("[data-view]").map(view => [view.dataset.view, view]));

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
}

function normalize(value) { return String(value || "").toLowerCase().replace(/[’]/g, "'").replace(/[^a-z']/g, ""); }
function focusParts(value) { return String(value || "").split("+").map(normalize).filter(Boolean); }

function showView(name) {
  Object.entries(views).forEach(([id, view]) => { view.hidden = id !== name; });
  const loggedIn = Boolean(state.user && state.token);
  $("[data-student]").hidden = !loggedIn;
  $("[data-logout]").hidden = !loggedIn;
  $("[data-account-status]").textContent = loggedIn ? "已登入" : "學生帳戶";
  if (loggedIn) $("[data-student]").textContent = state.user.name;
}

function showModuleChooser() {
  state.module = null;
  $("[data-module-chooser]").hidden = false;
  $("[data-question-section]").hidden = true;
  $("[data-progress-dock]").hidden = true;
  $("[data-completion]").hidden = true;
  $("[data-question-list]").replaceChildren();
  scrollTo({ top: 0, behavior: "smooth" });
}

async function rpc(name, args) {
  const config = window.EDMUND_SUPABASE || {};
  if (!config.url || !config.anonKey) throw Error("登入服務暫時未能載入，請重新整理頁面。");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, { method: "POST", headers: { apikey: config.anonKey, "Content-Type": "application/json" }, body: JSON.stringify(args), cache: "no-store", credentials: "omit", signal: controller.signal });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw Error(data?.message || "登入服務暫時未能連接。");
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    if (error?.name === "AbortError") throw Error("登入服務回應逾時，請再試一次。");
    throw error;
  } finally { clearTimeout(timeout); }
}

function progressKey() { return `${PROGRESS_PREFIX}${state.user?.id || "student"}`; }

function lessonState(question) {
  if (!state.lessons.has(question.id)) state.lessons.set(question.id, { step: 0, highest: 0, done: new Set(), selected: new Set(), heard: false, imitates: new Set(), recorded: false, recordingUrl: "", transferSelected: new Set() });
  return state.lessons.get(question.id);
}

function saveProgress() {
  if (!state.user) return;
  const lessons = [...state.lessons].map(([id, item]) => [id, { step: item.step, highest: item.highest, done: [...item.done], selected: [...item.selected], heard: item.heard, imitates: [...item.imitates], recorded: item.recorded, transferSelected: [...item.transferSelected] }]);
  try { localStorage.setItem(progressKey(), JSON.stringify({ completed: [...state.completed], lessons })); } catch {}
}

function loadProgress() {
  state.completed.clear(); state.lessons.clear();
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey()) || "null");
    for (const id of saved?.completed || []) state.completed.add(Number(id));
    for (const [id, item] of saved?.lessons || []) state.lessons.set(Number(id), { step: Math.min(5, Number(item.step) || 0), highest: Math.min(5, Number(item.highest) || 0), done: new Set(item.done || []), selected: new Set(item.selected || []), heard: Boolean(item.heard), imitates: new Set(item.imitates || []), recorded: Boolean(item.recorded), recordingUrl: "", transferSelected: new Set(item.transferSelected || []) });
  } catch {}
}

function remember(row, token) {
  state.user = { id: String(row.id || ""), name: String(row.name || "Student"), role: "student" };
  state.token = String(token || row.session_token || "");
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...state.user, token: state.token })); } catch {}
  try { window.EdmundSystemNav?.rememberStudentSession?.({ ...state.user, token: state.token }); } catch {}
  loadProgress(); showModuleChooser();
}

function stopRecording({ discard = false } = {}) {
  const active = state.recording;
  if (!active) return;
  clearTimeout(active.timeout);
  if (active.recorder?.state === "recording") active.recorder.stop();
  active.stream?.getTracks().forEach(track => track.stop());
  if (discard) state.recording = null;
}

function forget() {
  authGeneration += 1; stopRecording({ discard: true });
  state.user = null; state.token = ""; state.completed.clear(); state.lessons.clear();
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  try { window.EdmundSystemNav?.forgetStudentSession?.(); } catch {}
  showView("login");
}

async function restore() {
  const generation = authGeneration;
  let shared = null; let own = null;
  try { shared = window.EdmundSystemNav?.getStudentSession?.(); } catch {}
  try { own = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch {}
  const candidate = shared?.role === "student" ? shared : own?.role === "student" ? own : null;
  if (!candidate?.token) return false;
  const row = await rpc("flashcard_student_session_profile", { p_token: String(candidate.token) });
  if (generation !== authGeneration) return false;
  if (!row?.session_token || !row?.name) throw Error("登入時段已失效，請重新登入。");
  remember(row, row.session_token); showView("practice"); return true;
}

function speak(text, rate = 1) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(String(text));
  utterance.lang = "en-GB"; utterance.rate = rate;
  const voices = speechSynthesis.getVoices();
  utterance.voice = voices.find(voice => voice.lang.toLowerCase() === "en-gb") || voices.find(voice => /^en-/i.test(voice.lang)) || null;
  speechSynthesis.speak(utterance);
}

function tokenSpans(text) {
  return [...String(text).matchAll(/[A-Za-z]+(?:[’'][A-Za-z]+)?/g)].map(match => ({ word: normalize(match[0]), start: match.index, end: match.index + match[0].length }));
}

function targetLetters(text, focus) {
  const tokens = tokenSpans(text); const parts = focusParts(focus);
  if (parts.length === 1) {
    const token = tokens.find(item => item.word === parts[0]);
    return token ? Array.from({ length: token.end - token.start }, (_, index) => token.start + index) : [];
  }
  const index = tokens.findIndex((token, i) => token.word === parts[0] && tokens[i + 1]?.word === parts[1]);
  if (index < 0) return [];
  return [tokens[index].end - 1, tokens[index + 1].start];
}

function sameSet(a, b) { return a.size === b.size && [...a].every(value => b.has(value)); }

function letterPicker(text, focus, selected, onCorrect) {
  const wrap = document.createElement("div"); wrap.className = "letter-picker"; wrap.setAttribute("aria-label", text);
  const expected = new Set(targetLetters(text, focus));
  [...text].forEach((character, index) => {
    if (!/[A-Za-z]/.test(character)) { const span = document.createElement("span"); span.textContent = character; wrap.append(span); return; }
    const button = document.createElement("button"); button.type = "button"; button.className = "letter-key"; button.textContent = character; button.dataset.selected = String(selected.has(index)); button.setAttribute("aria-pressed", String(selected.has(index)));
    button.addEventListener("click", () => { selected.has(index) ? selected.delete(index) : selected.add(index); wrap.querySelectorAll(".letter-key").forEach(key => { const keyIndex = Number(key.dataset.index); key.dataset.selected = String(selected.has(keyIndex)); key.setAttribute("aria-pressed", String(selected.has(keyIndex))); }); if (sameSet(selected, expected)) onCorrect(); });
    button.dataset.index = String(index); wrap.append(button);
  });
  return { wrap, expected };
}

function stageIntro(index, title, text) { return `<header class="stage-intro"><span>STEP ${index + 1} / ${LESSON_STEPS.length}</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(text)}</p></header>`; }

function completeStage(card, question) {
  const progress = lessonState(question); progress.done.add(progress.step); progress.highest = Math.max(progress.highest, Math.min(5, progress.step + 1)); saveProgress(); renderLesson(card, question);
}

function nextButton(root, card, question, label) {
  const button = document.createElement("button"); button.type = "button"; button.className = "stage-next"; button.textContent = label;
  button.addEventListener("click", () => { const progress = lessonState(question); progress.step = Math.min(5, progress.step + 1); progress.highest = Math.max(progress.highest, progress.step); renderLesson(card, question); }); root.append(button);
}

function renderMeaning(root, card, question, progress) {
  root.innerHTML = `${stageIntro(0, "先理解整句意思", "知道句子在說什麼，再開始聽和說。")}<div class="context-card"><small>情境</small><p>${escapeHtml(question.context)}</p><blockquote lang="en">${escapeHtml(question.phrase)}</blockquote><p class="translation">${escapeHtml(question.meaning)}</p></div>`;
  if (!progress.done.has(0)) { const button = document.createElement("button"); button.type = "button"; button.className = "stage-next"; button.textContent = "我明白句意"; button.addEventListener("click", () => completeStage(card, question)); root.append(button); }
  else nextButton(root, card, question, "下一步：點選連音字母");
}

function renderTap(root, card, question, progress) {
  root.innerHTML = `${stageIntro(1, "用手指或滑鼠點選字母", "點選前一個目標字的字尾，再點選下一個目標字的字首。")}<p class="stage-question">哪兩個字母在自然語流中相連？</p><div data-picker></div><p class="stage-status" role="status"></p>`;
  const picker = letterPicker(question.phrase, question.focus, progress.selected, () => { progress.done.add(1); progress.highest = Math.max(progress.highest, 2); saveProgress(); renderLesson(card, question); }); root.querySelector("[data-picker]").append(picker.wrap);
  if (progress.done.has(1)) { root.querySelector(".stage-status").textContent = `✓ 已找到 ${question.focus.replace("+", "→")} 的連音位置。`; nextButton(root, card, question, "下一步：聆聽"); }
  else { const clear = document.createElement("button"); clear.type = "button"; clear.className = "clear-selection"; clear.textContent = "重新選擇"; clear.addEventListener("click", () => { progress.selected.clear(); renderLesson(card, question); }); root.append(clear); }
}

function renderListen(root, card, question, progress) {
  root.innerHTML = `${stageIntro(2, "聆聽自然語流", "選擇正常速度或 0.5× 慢速。播放後即可繼續。")}<div class="speed-controls"><button type="button" data-rate="1">▶ 正常速度</button><button type="button" data-rate="0.5">▶ 0.5×</button></div><p class="stage-status" role="status">${progress.heard ? "✓ 已聆聽。" : "請選擇一個速度。"}</p>`;
  root.querySelectorAll("[data-rate]").forEach(button => button.addEventListener("click", () => { speak(question.phrase, Number(button.dataset.rate)); progress.heard = true; progress.done.add(2); progress.highest = Math.max(progress.highest, 3); saveProgress(); renderLesson(card, question); }));
  if (progress.done.has(2)) nextButton(root, card, question, "下一步：分段模仿");
}

function renderImitate(root, card, question, progress) {
  const parts = focusParts(question.focus); const chunks = [parts.join(" "), question.phrase];
  root.innerHTML = `${stageIntro(3, "分段模仿", "先聽連音位置，然後跟讀完整句子。")}<div class="chunk-ladder" data-chunks></div><p class="stage-status">已跟讀 ${progress.imitates.size} / ${chunks.length}</p>`;
  chunks.forEach((chunk, index) => { const row = document.createElement("article"); row.className = "chunk-row"; row.dataset.complete = String(progress.imitates.has(index)); row.innerHTML = `<span>${index + 1}</span><div><small>${index ? "完整句子" : "連音位置"}</small><strong lang="en">${escapeHtml(chunk)}</strong></div><button type="button" class="play-control">▶ 播放</button><button type="button" class="shadow-confirm">${progress.imitates.has(index) ? "✓ 已跟讀" : "我已跟讀"}</button>`; row.querySelector(".play-control").addEventListener("click", () => speak(chunk, index ? 0.85 : 0.65)); row.querySelector(".shadow-confirm").addEventListener("click", () => { progress.imitates.add(index); if (progress.imitates.size === chunks.length) { progress.done.add(3); progress.highest = Math.max(progress.highest, 4); } saveProgress(); renderLesson(card, question); }); root.querySelector("[data-chunks]").append(row); });
  if (progress.done.has(3)) nextButton(root, card, question, "下一步：錄音");
}

async function beginRecording(card, question, progress) {
  if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) { progress.recorded = true; progress.done.add(4); progress.highest = 5; renderLesson(card, question); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const recorder = new MediaRecorder(stream); const chunks = [];
    recorder.addEventListener("dataavailable", event => { if (event.data.size) chunks.push(event.data); });
    recorder.addEventListener("stop", () => { stream.getTracks().forEach(track => track.stop()); const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" }); if (progress.recordingUrl) URL.revokeObjectURL(progress.recordingUrl); progress.recordingUrl = URL.createObjectURL(blob); progress.recorded = true; progress.done.add(4); progress.highest = 5; state.recording = null; saveProgress(); renderLesson(card, question); });
    recorder.start(); state.recording = { id: question.id, recorder, stream, timeout: setTimeout(() => stopRecording(), 8000) }; renderLesson(card, question);
  } catch { progress.recorded = true; progress.done.add(4); progress.highest = 5; renderLesson(card, question); }
}

function renderRecord(root, card, question, progress) {
  const active = state.recording?.id === question.id;
  root.innerHTML = `${stageIntro(4, "錄下自己的語音", "先聽示範，再錄下完整句子。錄音只留在這個裝置。")}<div class="record-target"><strong lang="en">${escapeHtml(question.phrase)}</strong><button class="play-control" type="button" data-demo>▶ 聽示範</button></div><div class="record-console"><button class="record-button" type="button" data-record>${active ? "■ 停止錄音" : progress.recorded ? "● 重新錄音" : "● 開始錄音"}</button><span>${active ? "正在錄音…" : "最長 8 秒"}</span></div>${progress.recordingUrl ? `<audio controls src="${escapeHtml(progress.recordingUrl)}"></audio>` : ""}`;
  root.querySelector("[data-demo]").addEventListener("click", () => speak(question.phrase, 0.8)); root.querySelector("[data-record]").addEventListener("click", () => active ? stopRecording() : void beginRecording(card, question, progress));
  if (progress.done.has(4)) nextButton(root, card, question, "下一步：新句轉移");
}

function finishLesson(card, question) {
  const progress = lessonState(question); progress.done.add(5); state.completed.add(question.id); saveProgress(); updateProgress(); renderLesson(card, question);
}

function renderTransfer(root, card, question, progress) {
  root.innerHTML = `${stageIntro(5, "在新句中找出同一連音位置", "點選相連的字母。這不是選擇題。")}<div class="transfer-card"><small>UNSEEN SENTENCE</small><strong lang="en">${escapeHtml(question.transferPhrase)}</strong><p>${escapeHtml(question.transferMeaning)}</p><div class="speed-controls"><button type="button" data-transfer-rate="1">▶ 正常速度</button><button type="button" data-transfer-rate="0.5">▶ 0.5×</button></div></div><p class="stage-question">點選需要連音的字母。</p><div data-transfer-picker></div><p class="stage-status" role="status"></p>`;
  root.querySelectorAll("[data-transfer-rate]").forEach(button => button.addEventListener("click", () => speak(question.transferPhrase, Number(button.dataset.transferRate))));
  const picker = letterPicker(question.transferPhrase, question.transferFocus, progress.transferSelected, () => finishLesson(card, question)); root.querySelector("[data-transfer-picker]").append(picker.wrap);
  if (state.completed.has(question.id)) { root.querySelector(".stage-status").textContent = `✓ 已找到 ${question.transferFocus.replace("+", "→")} 的連音位置。`; const next = questions[question.id]; if (next) { const button = document.createElement("button"); button.className = "stage-next"; button.type = "button"; button.textContent = "下一句"; button.addEventListener("click", () => document.querySelector(`#liaison-question-${next.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })); root.append(button); } }
  else { const clear = document.createElement("button"); clear.type = "button"; clear.className = "clear-selection"; clear.textContent = "重新選擇"; clear.addEventListener("click", () => { progress.transferSelected.clear(); renderLesson(card, question); }); root.append(clear); }
}

const renderers = [renderMeaning, renderTap, renderListen, renderImitate, renderRecord, renderTransfer];

function renderLesson(card, question) {
  const progress = lessonState(question); card.classList.toggle("is-complete", state.completed.has(question.id)); card.querySelector("[data-lesson-status]").textContent = state.completed.has(question.id) ? "已完成" : "進行中";
  const stepper = card.querySelector("[data-stepper]"); stepper.replaceChildren();
  LESSON_STEPS.forEach(([zh, en], index) => { const button = document.createElement("button"); button.type = "button"; button.className = "step-pill"; button.dataset.current = String(index === progress.step); button.dataset.complete = String(progress.done.has(index)); button.disabled = index > progress.highest; button.innerHTML = `<span>${progress.done.has(index) ? "✓" : index + 1}</span><strong>${escapeHtml(zh)}</strong><small>${escapeHtml(en)}</small>`; button.addEventListener("click", () => { progress.step = index; renderLesson(card, question); }); stepper.append(button); });
  const root = card.querySelector("[data-stage-root]"); root.replaceChildren(); renderers[progress.step](root, card, question, progress); saveProgress();
}

function renderQuestion(question) {
  const card = document.createElement("article"); card.className = "question-card lesson-card"; card.id = `liaison-question-${question.id}`;
  card.innerHTML = `<div class="question-meta"><span>LESSON ${String(question.id).padStart(2, "0")} · ${escapeHtml(question.group)}</span></div><div class="phrase-row"><h3 lang="en">${escapeHtml(question.phrase)}</h3><span class="lesson-status" data-lesson-status>${state.completed.has(question.id) ? "已完成" : "進行中"}</span></div><nav class="lesson-stepper" data-stepper aria-label="六個練習步驟"></nav><section class="lesson-stage" data-stage-root></section>`;
  renderLesson(card, question); return card;
}

function updateProgress() {
  const count = state.completed.size; const percent = Math.round(count / questions.length * 100);
  $("[data-progress-label]").textContent = `已完成 ${count} / ${questions.length}`; $("[data-progress-percent]").textContent = `${percent}%`; $("[data-progress-bar]").style.width = `${percent}%`; $("[data-completion]").hidden = state.module !== "sentence" || count !== questions.length;
}

const paragraphs = [
  { title: "早上的小意外", text: "An egg fell. Pick it up and take it home. Turn it on when you arrive.", meaning: "一隻蛋掉了下來。把它拿起來並帶回家，到達後把它打開。" },
  { title: "朋友到了", text: "Come in, please. Ann needs help, and our old friend called.", meaning: "請進來。Ann 需要幫助，而我們的老朋友打電話來了。" },
  { title: "現在出發", text: "Read it aloud, then send it today. We have to go now.", meaning: "大聲讀出來，然後今天把它寄出。我們現在必須走了。" }
];

function renderParagraphs() {
  const root = $("[data-question-list]"); root.replaceChildren(...paragraphs.map((paragraph, index) => { const card = document.createElement("article"); card.className = "question-card paragraph-card"; card.innerHTML = `<div class="question-meta"><span>PARAGRAPH ${String(index + 1).padStart(2, "0")}</span></div><h3>${escapeHtml(paragraph.title)}</h3><blockquote lang="en">${escapeHtml(paragraph.text)}</blockquote><p>${escapeHtml(paragraph.meaning)}</p><div class="speed-controls"><button type="button" data-rate="1">▶ 正常速度</button><button type="button" data-rate="0.5">▶ 0.5×</button></div>`; card.querySelectorAll("[data-rate]").forEach(button => button.addEventListener("click", () => speak(paragraph.text, Number(button.dataset.rate)))); return card; }));
}

function chooseModule(module) {
  state.module = module; $("[data-module-chooser]").hidden = true; $("[data-question-section]").hidden = false; $("[data-progress-dock]").hidden = module !== "sentence"; $("[data-module-title]").textContent = module === "sentence" ? "單句練習" : "段落練習";
  if (module === "sentence") { $("[data-question-list]").replaceChildren(...questions.map(renderQuestion)); updateProgress(); } else { $("[data-completion]").hidden = true; renderParagraphs(); }
  $("[data-question-section]").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("[data-login-form]").addEventListener("submit", async event => {
  event.preventDefault(); const form = event.currentTarget; const status = $("[data-login-status]"); const button = $("[data-login-button]"); const values = new FormData(form); const username = String(values.get("username") || "").trim(); const password = String(values.get("password") || "");
  if (!username || !password) { status.textContent = "請輸入學生名稱及密碼。"; status.dataset.state = "error"; return; }
  const generation = ++authGeneration; const label = button.textContent; button.disabled = true; button.textContent = "正在登入…"; status.textContent = "正在驗證學生帳戶…";
  try { const row = await rpc("flashcard_student_login", { p_name: username, p_password: password }); if (generation !== authGeneration) return; if (!row?.session_token) throw Error("學生帳戶或密碼不正確。"); remember(row, row.session_token); form.reset(); showView("practice"); }
  catch (error) { status.textContent = error?.message || "登入失敗，請再試一次。"; status.dataset.state = "error"; }
  finally { button.disabled = false; button.textContent = label; }
});

$("[data-password-toggle]").addEventListener("click", event => { const input = $("[name='password']"); const show = input.type === "password"; input.type = show ? "text" : "password"; event.currentTarget.textContent = show ? "隱藏" : "顯示"; event.currentTarget.setAttribute("aria-pressed", String(show)); });
$$('[data-module]').forEach(button => button.addEventListener("click", () => chooseModule(button.dataset.module)));
$("[data-back-modules]").addEventListener("click", showModuleChooser);
$("[data-review-from-start]").addEventListener("click", () => $("#liaison-question-1")?.scrollIntoView({ behavior: "smooth", block: "start" }));
$("[data-logout]").addEventListener("click", forget);
window.addEventListener("beforeunload", () => { stopRecording({ discard: true }); for (const item of state.lessons.values()) if (item.recordingUrl) URL.revokeObjectURL(item.recordingUrl); });

if (localPreview) { state.user = { id: "local-preview", name: "Preview Student", role: "student" }; state.token = "local-preview-only"; loadProgress(); showView("practice"); showModuleChooser(); }
else restore().catch(error => { forget(); $("[data-login-status]").textContent = error?.message || "登入時段已失效，請重新登入。"; $("[data-login-status]").dataset.state = "error"; });
