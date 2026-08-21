const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const CATALOGUE = window.EDMUND_LISTENING_CATALOG || { practices: [] };
const SESSION_KEY = "edmund-listening-session-v1";
const AUDIO_CATALOGUE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev/v1/listening/catalog";
const SPEEDS = Object.freeze([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
const PRACTICE_ONE = window.EDMUND_IELTS_LISTENING_PRACTICE_1 || null;
const PRACTICE_ONE_TRANSCRIPT = window.EDMUND_IELTS_LISTENING_PRACTICE_1_TRANSCRIPT || {};

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
  listeningBookmarks: new Set()
};

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

function bookmarkHref(part) {
  return `listening-system.html?section=ielts&practice=1&part=${part}`;
}

async function setListeningWordBookmark(button) {
  if (!state.token) return showToast("請先登入才可收藏單字。");
  const word = String(button.dataset.bookmarkWord || "");
  const source = String(button.dataset.bookmarkSource || "");
  const context = String(button.dataset.bookmarkContext || "");
  const itemKey = `practice1:${source}:${normaliseAnswer(word)}`.slice(0, 180);
  const bookmarked = !state.listeningBookmarks.has(itemKey);
  button.disabled = true;
  try {
    await rpc("learning_portal_set_bookmark", {
      p_token: state.token, p_system_key: "listening", p_item_key: itemKey,
      p_title: word, p_detail: `IELTS Listening Practice 1 · ${context}`,
      p_href: bookmarkHref(state.practicePart), p_bookmarked: bookmarked
    });
    if (bookmarked) state.listeningBookmarks.add(itemKey); else state.listeningBookmarks.delete(itemKey);
    document.querySelectorAll(`[data-bookmark-source="${CSS.escape(source)}"]`).forEach((item) => item.dataset.bookmarked = String(bookmarked));
    showToast(bookmarked ? `已收藏「${word}」` : `已移除「${word}」書簽`);
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
  updateRoute();
  showView("dashboard");
}

function openSection(section, options = {}) {
  pauseAllAudio();
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
    });
  });
}

function answerInput(number, compact = false) {
  return `<label class="listening-gap${compact ? " listening-gap--table" : ""}"><span class="sr-only">第 ${number} 題答案</span><b>${number}</b><input data-answer-q="${number}" autocomplete="off" spellcheck="false" aria-label="第 ${number} 題答案"></label>`;
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
  if (question.type === "choice") return `<article class="listening-question-card" data-question-card="${question.number}"><div class="listening-question-card__number">${question.number}</div><div class="listening-question-card__body"><p>${wordButtons(question.prompt, `p${question.part}:q${question.number}`, `Part ${question.part} · Question ${question.number}: ${question.prompt}`)}</p><p class="listening-question-zh" data-zh hidden>${escapeHtml(question.translation)}</p><div class="listening-options">${question.options.map((item) => `<label><input type="radio" name="q${question.number}" value="${item.key}"><strong>${item.key}</strong><span>${wordButtons(item.en, `p${question.part}:q${question.number}:${item.key}`, `Part ${question.part} · Question ${question.number}: ${item.en}`)}<small data-zh hidden>${escapeHtml(item.zh)}</small></span></label>`).join("")}</div></div><p class="listening-result" data-result-q="${question.number}" hidden></p></article>`;
  const label = question.numbers.join(" & ");
  return `<article class="listening-question-card listening-question-card--multi" data-question-card="${label}"><div class="listening-question-card__number">${label}</div><div class="listening-question-card__body"><p>${wordButtons(question.prompt, `p${question.part}:q${label}`, `Part ${question.part} · Questions ${label}: ${question.prompt}`)}</p><p class="listening-question-zh" data-zh hidden>${escapeHtml(question.translation)}</p><p class="listening-select-count">請選擇兩項</p><div class="listening-options">${question.options.map((item) => `<label><input type="checkbox" data-multi-group="${label}" value="${item.key}"><strong>${item.key}</strong><span>${wordButtons(item.en, `p${question.part}:q${label}:${item.key}`, `Part ${question.part} · Questions ${label}: ${item.en}`)}<small data-zh hidden>${escapeHtml(item.zh)}</small></span></label>`).join("")}</div></div><p class="listening-result" data-result-q="${label}" hidden></p></article>`;
}

function renderTranscript(partNumber) {
  const rows = Array.isArray(PRACTICE_ONE_TRANSCRIPT[String(partNumber)]) ? PRACTICE_ONE_TRANSCRIPT[String(partNumber)] : [];
  return `<section class="listening-transcript" aria-labelledby="transcript-title-${partNumber}"><div class="listening-transcript__head"><div><p class="eyebrow">SYNCHRONISED TRANSCRIPT</p><h3 id="transcript-title-${partNumber}">Part ${partNumber} 錄音稿</h3></div><p>播放錄音時，相應句子會自動高亮。點擊一行可跳至大約位置。</p></div><div class="transcript-lines" data-transcript-part="${partNumber}">${rows.map((row, index) => `<div class="transcript-line" role="button" tabindex="0" data-transcript-line="${index}"><span>${wordButtons(row.en, `p${partNumber}:t${index}`, `Part ${partNumber} transcript: ${row.en}`)}</span><small data-zh hidden>${escapeHtml(row.zh)}</small></div>`).join("")}</div></section>`;
}

function renderPracticePart(partNumber) {
  const part = PRACTICE_ONE.parts.find((item) => item.part === partNumber);
  if (!part) return;
  state.practicePart = partNumber;
  elements.workspace.querySelectorAll("[data-part-tab]").forEach((button) => button.setAttribute("aria-selected", String(Number(button.dataset.partTab) === partNumber)));
  const host = elements.workspace.querySelector("[data-practice-part-host]");
  host.innerHTML = `<section class="listening-part"><div class="listening-part__head"><div><p class="eyebrow">QUESTIONS ${partNumber === 1 ? "1–10" : partNumber === 2 ? "11–20" : partNumber === 3 ? "21–30" : "31–40"}</p><h2>Part ${partNumber}</h2><p>${wordButtons(part.instruction, `p${partNumber}:instruction`, `Part ${partNumber}: ${part.instruction}`)}</p><p data-zh hidden>${escapeHtml(part.instructionZh)}</p></div><div class="listening-part__actions"><button class="secondary-button" type="button" data-toggle-translation aria-pressed="false">顯示中文翻譯</button><button class="secondary-button" type="button" data-show-part-answers>顯示答案</button><button class="primary-button" type="button" data-check-part>檢查答案</button></div></div>${part.table ? renderPartOneTable(part) : ""}<div class="listening-question-list">${part.table ? "" : part.questions.map(renderQuestion).join("")}</div><div class="listening-part-score" data-part-score hidden></div>${renderTranscript(partNumber)}</section>`;
  bindTranscriptSync(partNumber);
}

function renderPracticeWorkspace() {
  if (!PRACTICE_ONE || state.practice !== 1) {
    elements.workspace.hidden = true;
    elements.workspace.replaceChildren();
    return;
  }
  elements.workspace.hidden = false;
  elements.workspace.innerHTML = `<div class="practice-workspace__head"><div><p class="eyebrow">INTERACTIVE PRACTICE</p><h2 id="practice-workspace-title">作答系統、答案與同步錄音稿</h2><p>作答後可立即檢查或顯示答案。點擊題目或錄音稿內的英文單字即可加入書簽。</p></div></div><div class="listening-part-tabs" role="tablist" aria-label="選擇錄音部分">${[1,2,3,4].map((part) => `<button type="button" role="tab" data-part-tab="${part}" aria-selected="${part === state.practicePart}">Part ${part}</button>`).join("")}</div><div data-practice-part-host></div>`;
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

function markPartAnswers(showOnly = false) {
  const part = PRACTICE_ONE.parts.find((item) => item.part === state.practicePart);
  let correct = 0;
  part.questions.forEach((question) => {
    const ok = questionCorrect(question);
    if (ok) correct += question.type === "multi" ? question.numbers.length : 1;
    const key = question.type === "multi" ? question.numbers.join(" & ") : question.number;
    const card = elements.workspace.querySelector(`[data-question-card="${CSS.escape(String(key))}"]`);
    const result = elements.workspace.querySelector(`[data-result-q="${CSS.escape(String(key))}"]`);
    if (card) card.dataset.state = showOnly ? "answer" : ok ? "correct" : "wrong";
    if (result) {
      const answer = question.type === "multi" ? question.answers.join(" & ") : question.answer;
      result.textContent = showOnly ? `答案：${answer}` : ok ? `✓ 正確！答案：${answer}` : `✗ 需要再試。正確答案：${answer}`;
      result.hidden = false;
    }
    if (showOnly && question.type === "gap") {
      const input = elements.workspace.querySelector(`[data-answer-q="${question.number}"]`);
      if (input && !input.value) input.value = question.answer;
    }
    if (question.type === "gap") {
      const input = elements.workspace.querySelector(`[data-answer-q="${question.number}"]`);
      if (input) input.dataset.state = showOnly ? "answer" : ok ? "correct" : "wrong";
    }
  });
  const score = elements.workspace.querySelector("[data-part-score]");
  const total = part.questions.reduce((sum, question) => sum + (question.type === "multi" ? question.numbers.length : 1), 0);
  score.textContent = showOnly ? `Part ${part.part} 答案已顯示。` : `Part ${part.part}：${correct} / ${total} 題正確`;
  score.hidden = false;
}

function bindTranscriptSync(partNumber) {
  const audio = document.querySelector(`audio[data-audio-part="${partNumber}"]`);
  const host = elements.workspace.querySelector(`[data-transcript-part="${partNumber}"]`);
  if (!audio || !host) return;
  const lines = [...host.querySelectorAll("[data-transcript-line]")];
  const weights = lines.map((line) => Math.max(3, (line.querySelector("span")?.textContent.match(/[A-Za-z]+/g) || []).length));
  const cumulative = weights.reduce((list, weight) => [...list, (list.at(-1) || 0) + weight], []);
  const total = cumulative.at(-1) || 1;
  const activate = () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const progress = audio.currentTime / audio.duration * total;
    const index = Math.max(0, cumulative.findIndex((end) => progress <= end));
    lines.forEach((line, lineIndex) => line.classList.toggle("is-current", lineIndex === index));
    const current = lines[index];
    if (current && audio.currentTime > 0 && !document.hidden) current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  audio.addEventListener("timeupdate", activate);
  host.addEventListener("click", (event) => {
    const line = event.target.closest("[data-transcript-line]");
    if (!line || event.target.closest("[data-bookmark-word]")) return;
    const index = Number(line.dataset.transcriptLine);
    const startWeight = index ? cumulative[index - 1] : 0;
    if (Number.isFinite(audio.duration)) audio.currentTime = startWeight / total * audio.duration;
    audio.play().catch(() => {});
  });
  host.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-transcript-line]")) {
      event.preventDefault();
      event.target.click();
    }
  });
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
  const word = event.target.closest("[data-bookmark-word]");
  if (word) {
    event.preventDefault();
    event.stopPropagation();
    void setListeningWordBookmark(word);
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
  else if (button.matches("[data-check-part]")) markPartAnswers(false);
  else if (button.matches("[data-show-part-answers]")) markPartAnswers(true);
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
  }
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
