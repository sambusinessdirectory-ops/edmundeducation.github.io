import { HK_DISTRICTS, HK_GROUPS, MTR_STATIONS, WORLD_COUNTRIES, WORLD_REGIONS } from "./country-name-spelling-data.mjs";

const CONFIG = window.EDMUND_SUPABASE || {};
const SESSION_KEY = "edmund-country-name-spelling-session-v1";
const PROGRESS_KEY = "edmund-country-name-spelling-progress-v2";
const SVG_NS = "http://www.w3.org/2000/svg";
const LINE_COLOURS = Object.freeze({
  "Island line": "#1683c5",
  "Tsuen Wan line": "#e54b4d",
  "Kwun Tong line": "#39ac5b",
  "East Rail line": "#64bee8",
  "Tseung Kwan O line": "#825eaa",
  "Tuen Ma line": "#a46c43",
  "Tung Chung line": "#e88a31",
  "Disneyland Resort line": "#e69abb",
  "Airport Express": "#258e91"
});

const elements = {
  login: document.querySelector('[data-view="login"]'),
  content: document.querySelector('[data-view="content"]'),
  form: document.querySelector("[data-login-form]"),
  loginStatus: document.querySelector("[data-login-status]"),
  actions: document.querySelector("[data-account-actions]"),
  accountName: document.querySelector("[data-account-name]"),
  logout: document.querySelector("[data-logout]"),
  editionButtons: [...document.querySelectorAll("[data-edition]")],
  filters: document.querySelector("[data-map-filters]"),
  worldMap: document.querySelector("[data-world-map]"),
  hongKongMap: document.querySelector("[data-hong-kong-map]"),
  mtrNetwork: document.querySelector("[data-mtr-network]"),
  viewport: document.querySelector("[data-map-viewport]"),
  plane: document.querySelector("[data-map-plane]"),
  markers: document.querySelector("[data-map-markers]"),
  reticle: document.querySelector("[data-target-reticle]"),
  mapSequence: document.querySelector("[data-map-sequence]"),
  mapHeading: document.querySelector("[data-map-heading]"),
  targetName: document.querySelector("[data-target-name]"),
  targetZone: document.querySelector("[data-target-zone]"),
  progressCopy: document.querySelector("[data-progress-copy]"),
  progressBar: document.querySelector("[data-progress-bar]"),
  accuracy: document.querySelector("[data-accuracy]"),
  streak: document.querySelector("[data-streak]"),
  mastered: document.querySelector("[data-mastered]"),
  missionNumber: document.querySelector("[data-mission-number]"),
  flagFrame: document.querySelector("[data-flag-frame]"),
  flag: document.querySelector("[data-flag]"),
  itemType: document.querySelector("[data-item-type]"),
  itemZh: document.querySelector("[data-item-zh]"),
  itemZone: document.querySelector("[data-item-zone]"),
  letterGrid: document.querySelector("[data-letter-grid]"),
  answer: document.querySelector("[data-answer]"),
  speak: document.querySelector("[data-speak]"),
  hint: document.querySelector("[data-hint]"),
  check: document.querySelector("[data-check]"),
  feedback: document.querySelector("[data-feedback]"),
  trap: document.querySelector("[data-trap]"),
  previous: document.querySelector("[data-previous]"),
  random: document.querySelector("[data-random]"),
  next: document.querySelector("[data-next]")
};

let client;
let session;
let gameReady = false;
let state = loadProgress();

function loadProgress() {
  const fallback = { edition:"world", filters:{ world:"All", "hong-kong":"Districts" }, current:{}, attempts:0, correct:0, streak:0, mastered:[], hints:0 };
  try {
    const value = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null");
    if (!value || typeof value !== "object") return fallback;
    return {
      ...fallback,
      ...value,
      filters: { ...fallback.filters, ...(value.filters || {}) },
      current: { ...(value.current || {}) },
      mastered: Array.isArray(value.mastered) ? value.mastered.filter((id) => typeof id === "string") : []
    };
  } catch {
    return fallback;
  }
}

function saveProgress() {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(state)); } catch {}
}

function supabaseClient() {
  if (client) return client;
  if (!window.supabase?.createClient || !CONFIG.url || !CONFIG.anonKey) throw new Error("登入服務暫時未能載入。");
  client = window.supabase.createClient(CONFIG.url, CONFIG.anonKey, {
    auth:{ persistSession:true, storage:sessionStorage, autoRefreshToken:true, detectSessionInUrl:false }
  });
  return client;
}

async function rpc(name, args) {
  const api = supabaseClient();
  const current = await api.auth.getSession();
  if (!current.data?.session) {
    const anonymous = await api.auth.signInAnonymously();
    if (anonymous.error) throw anonymous.error;
  }
  const result = await api.rpc(name, args);
  if (result.error) throw result.error;
  return result.data;
}

function remember(value) {
  session = value;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(value)); } catch {}
  window.EdmundSystemNav?.rememberStudentSession?.(value);
}

async function validate(token) {
  const rows = await rpc("flashcard_student_session_profile", { p_token:token });
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row?.id || !row?.session_token) return false;
  remember({ token:String(row.session_token), id:String(row.id), name:String(row.name || "Student"), role:"student" });
  return true;
}

function showContent() {
  elements.login.hidden = true;
  elements.content.hidden = false;
  elements.actions.hidden = false;
  elements.accountName.textContent = `${session.name} · 學生`;
  if (!gameReady) initialiseGame();
}

function clearSession() {
  session = null;
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  elements.login.hidden = false;
  elements.content.hidden = true;
  elements.actions.hidden = true;
  elements.form.reset();
  elements.loginStatus.textContent = "";
}

function currentFilter() {
  return state.filters[state.edition];
}

function fullEditionPool() {
  return state.edition === "world" ? WORLD_COUNTRIES : [...HK_DISTRICTS, ...MTR_STATIONS];
}

function activePool() {
  if (state.edition === "world") {
    const filter = currentFilter();
    return filter === "All" ? [...WORLD_COUNTRIES] : WORLD_COUNTRIES.filter((item) => item.region === filter);
  }
  return currentFilter() === "Districts" ? [...HK_DISTRICTS] : [...MTR_STATIONS];
}

function currentItem() {
  const pool = activePool();
  const id = state.current[`${state.edition}:${currentFilter()}`];
  return pool.find((item) => item.id === id) || pool.find((item) => !state.mastered.includes(progressId(item))) || pool[0];
}

function progressId(item) {
  return `${state.edition}:${item.id}`;
}

function itemZone(item) {
  return state.edition === "world" ? item.region : item.group || item.line;
}

function itemType(item) {
  if (state.edition === "world") return "COUNTRY / 國家";
  return currentFilter() === "Districts" ? "DISTRICT / 香港地區" : "MTR STATION / 港鐵站";
}

function markerPosition(item) {
  if (state.edition === "world") {
    return { x: ((item.lon + 180) / 360) * 100, y: ((90 - item.lat) / 180) * 100 };
  }
  return { x:item.x, y:item.y };
}

function normaliseAnswer(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLocaleLowerCase("en");
}

function isCorrectAnswer(item, value) {
  const answer = normaliseAnswer(value);
  return [item.name, ...(item.aliases || [])].some((candidate) => normaliseAnswer(candidate) === answer);
}

function setCurrent(item) {
  if (!item) return;
  state.current[`${state.edition}:${currentFilter()}`] = item.id;
  state.solved = false;
  state.revealed = [];
  state.trapVisible = false;
  saveProgress();
  render();
  requestAnimationFrame(() => elements.answer.focus({ preventScroll:true }));
}

function buildFilters() {
  const filters = state.edition === "world" ? WORLD_REGIONS : HK_GROUPS;
  elements.filters.replaceChildren(...filters.map((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = state.edition === "world"
      ? filter.toUpperCase()
      : filter === "Districts" ? "DISTRICTS / 18 區" : "MTR STATIONS / 港鐵站";
    button.classList.toggle("is-active", currentFilter() === filter);
    button.addEventListener("click", () => {
      state.filters[state.edition] = filter;
      setCurrent(currentItem());
    });
    return button;
  }));
}

function renderMtrNetwork() {
  elements.mtrNetwork.replaceChildren();
  if (state.edition !== "hong-kong" || currentFilter() !== "MTR stations") return;
  for (const [line, colour] of Object.entries(LINE_COLOURS)) {
    const stations = MTR_STATIONS.filter((station) => station.line === line);
    if (stations.length < 2) continue;
    const polyline = document.createElementNS(SVG_NS, "polyline");
    polyline.setAttribute("points", stations.map((station) => `${station.x * 10},${station.y * 5}`).join(" "));
    polyline.setAttribute("stroke", colour);
    polyline.style.color = colour;
    elements.mtrNetwork.append(polyline);
  }
}

function renderMarkers(item) {
  const pool = activePool();
  const nodes = [];
  if (state.edition === "hong-kong" && currentFilter() === "MTR stations") {
    for (const [line, colour] of Object.entries(LINE_COLOURS)) {
      const stations = MTR_STATIONS.filter((station) => station.line === line);
      for (let index = 1; index < stations.length; index += 1) {
        const start = stations[index - 1];
        const end = stations[index];
        const distance = Math.hypot(end.x - start.x, end.y - start.y);
        const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
        const segment = document.createElement("i");
        segment.className = "mtr-segment";
        segment.style.left = `${start.x}%`;
        segment.style.top = `${start.y}%`;
        segment.style.width = `${distance}%`;
        segment.style.setProperty("--segment-angle", `${angle}deg`);
        segment.style.setProperty("--segment-colour", colour);
        nodes.push(segment);
      }
    }
  }
  nodes.push(...pool.map((candidate, index) => {
    const position = markerPosition(candidate);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "map-marker";
    button.style.left = `${position.x}%`;
    button.style.top = `${position.y}%`;
    button.dataset.label = `${String(index + 1).padStart(2, "0")} · ${candidate.zh}`;
    button.setAttribute("aria-label", `選擇 ${candidate.zh}`);
    button.classList.toggle("is-selected", candidate.id === item.id);
    button.classList.toggle("is-mastered", state.mastered.includes(progressId(candidate)));
    button.addEventListener("click", () => setCurrent(candidate));
    return button;
  }));
  elements.markers.replaceChildren(...nodes);
  const position = markerPosition(item);
  elements.reticle.style.left = `${position.x}%`;
  elements.reticle.style.top = `${position.y}%`;
}

function renderLetterGrid(item) {
  const typed = elements.answer.value.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const revealed = new Set(state.revealed || []);
  let letterIndex = 0;
  const cells = [];
  for (const character of item.name) {
    const cell = document.createElement("span");
    if (!/[a-z0-9]/i.test(character)) {
      cell.className = "is-separator";
      cell.textContent = character === "-" ? "-" : "·";
    } else {
      const shouldReveal = state.solved || revealed.has(letterIndex);
      cell.textContent = shouldReveal ? character.toUpperCase() : (typed[letterIndex] || "");
      cell.classList.toggle("is-revealed", !state.solved && revealed.has(letterIndex));
      letterIndex += 1;
    }
    cells.push(cell);
  }
  elements.letterGrid.replaceChildren(...cells);
}

function renderStats(item) {
  const total = fullEditionPool().length;
  const mastered = fullEditionPool().filter((candidate) => state.mastered.includes(progressId(candidate))).length;
  const percent = total ? Math.round((mastered / total) * 100) : 0;
  elements.accuracy.textContent = state.attempts ? `${Math.round((state.correct / state.attempts) * 100)}%` : "—";
  elements.streak.textContent = String(state.streak || 0).padStart(2, "0");
  elements.mastered.textContent = `${mastered}/${total}`;
  elements.progressCopy.textContent = `${mastered} / ${total} MASTERED`;
  elements.progressBar.style.width = `${percent}%`;
  elements.targetName.textContent = state.solved ? item.name.toUpperCase() : "SPELL TO IDENTIFY";
  elements.targetZone.textContent = itemZone(item).toUpperCase();
}

function renderIdentity(item) {
  const pool = activePool();
  const index = Math.max(0, pool.findIndex((candidate) => candidate.id === item.id));
  elements.missionNumber.textContent = `${state.edition === "world" ? "WORLD" : "HK"} ${String(index + 1).padStart(2, "0")}`;
  elements.itemType.textContent = itemType(item);
  elements.itemZh.textContent = item.zh;
  elements.itemZone.textContent = itemZone(item);
  elements.trap.textContent = state.trapVisible || state.solved ? item.trap : "首次嘗試後顯示常見錯法，避免未作答便看到答案。";
  elements.flagFrame.classList.add("is-switching");
  elements.flag.src = `country-name-spelling-flags/${state.edition === "world" ? item.code : "hk"}.svg`;
  elements.flag.alt = state.edition === "world" ? `${item.zh}國旗` : "香港區旗";
  const finishFlagSwitch = () => elements.flagFrame.classList.remove("is-switching");
  if (elements.flag.complete) requestAnimationFrame(finishFlagSwitch);
  else elements.flag.addEventListener("load", finishFlagSwitch, { once:true });
  elements.answer.value = "";
  elements.answer.classList.remove("is-correct", "is-wrong");
  elements.feedback.className = "answer-feedback";
  elements.feedback.textContent = state.edition === "world"
    ? "辨認國旗及地圖位置，再輸入完整英文國名。"
    : currentFilter() === "Districts"
      ? "根據中文及香港地圖位置，輸入完整英文地區名稱。"
      : "根據中文及港鐵網絡位置，輸入完整英文站名。";
  elements.check.innerHTML = state.solved ? "NEXT TARGET <span aria-hidden=\"true\">›</span>" : "CHECK ANSWER <span aria-hidden=\"true\">›</span>";
  renderLetterGrid(item);
}

function render() {
  const item = currentItem();
  if (!item) return;
  state.current[`${state.edition}:${currentFilter()}`] = item.id;
  elements.editionButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.edition === state.edition));
  elements.worldMap.hidden = state.edition !== "world";
  elements.hongKongMap.hidden = state.edition !== "hong-kong";
  elements.mapSequence.textContent = state.edition === "world" ? "// WORLD MAP 01" : "// HONG KONG GRID 02";
  elements.mapHeading.textContent = state.edition === "world"
    ? "Essential DSE & IELTS countries"
    : currentFilter() === "Districts" ? "Hong Kong 18 districts" : "Familiar MTR station names";
  buildFilters();
  renderMtrNetwork();
  renderMarkers(item);
  renderIdentity(item);
  renderStats(item);
  saveProgress();
}

function checkAnswer() {
  const item = currentItem();
  if (!item) return;
  if (state.solved) return move(1);
  const value = elements.answer.value.trim();
  if (!value) {
    elements.feedback.textContent = "請先輸入英文名稱。";
    elements.feedback.className = "answer-feedback is-wrong";
    elements.answer.focus();
    return;
  }
  state.attempts += 1;
  if (isCorrectAnswer(item, value)) {
    state.correct += 1;
    state.streak = (state.streak || 0) + 1;
    const id = progressId(item);
    if (!state.mastered.includes(id)) state.mastered.push(id);
    state.solved = true;
    state.trapVisible = true;
    elements.answer.classList.remove("is-wrong");
    elements.answer.classList.add("is-correct");
    elements.feedback.textContent = `正確：${item.name}。再按一次即可前往下一個目標。`;
    elements.feedback.className = "answer-feedback is-correct";
    elements.check.innerHTML = "NEXT TARGET <span aria-hidden=\"true\">›</span>";
    renderLetterGrid(item);
    renderMarkers(item);
    renderStats(item);
  } else {
    state.streak = 0;
    state.trapVisible = true;
    elements.answer.classList.remove("is-correct");
    elements.answer.classList.add("is-wrong");
    elements.feedback.textContent = "未正確。核對字母數目及下方常見錯法，再試一次。";
    elements.feedback.className = "answer-feedback is-wrong";
    elements.trap.textContent = item.trap;
    renderStats(item);
  }
  saveProgress();
}

function revealLetter() {
  const item = currentItem();
  if (!item || state.solved) return;
  const answerLetters = [...item.name].filter((character) => /[a-z0-9]/i.test(character));
  const revealed = new Set(state.revealed || []);
  const typedLength = elements.answer.value.replace(/[^a-z0-9]/gi, "").length;
  const preferred = [...answerLetters.keys()].find((index) => index >= typedLength && !revealed.has(index));
  const next = preferred ?? [...answerLetters.keys()].find((index) => !revealed.has(index));
  if (next === undefined) return;
  revealed.add(next);
  state.revealed = [...revealed];
  state.hints = (state.hints || 0) + 1;
  state.trapVisible = true;
  elements.trap.textContent = item.trap;
  elements.feedback.textContent = `已顯示第 ${next + 1} 個英文字母；請自行完成其餘拼寫。`;
  elements.feedback.className = "answer-feedback";
  renderLetterGrid(item);
  saveProgress();
}

function move(delta) {
  const pool = activePool();
  const item = currentItem();
  const index = Math.max(0, pool.findIndex((candidate) => candidate.id === item?.id));
  setCurrent(pool[(index + delta + pool.length) % pool.length]);
}

function randomTarget() {
  const pool = activePool();
  const item = currentItem();
  const candidates = pool.filter((candidate) => candidate.id !== item?.id && !state.mastered.includes(progressId(candidate)));
  const source = candidates.length ? candidates : pool.filter((candidate) => candidate.id !== item?.id);
  setCurrent(source[Math.floor(Math.random() * source.length)] || pool[0]);
}

function speakCurrent() {
  const item = currentItem();
  if (!item || !("speechSynthesis" in window)) {
    elements.feedback.textContent = "此瀏覽器暫不支援讀音播放。";
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(item.name.replace(/^the /i, ""));
  utterance.lang = "en-GB";
  utterance.rate = .82;
  window.speechSynthesis.speak(utterance);
}

function initialiseMapTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  elements.viewport.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const bounds = elements.viewport.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    elements.plane.style.setProperty("--map-ry", `${x * 10 - 3}deg`);
    elements.plane.style.setProperty("--map-rx", `${8 - y * 6}deg`);
  });
  elements.viewport.addEventListener("pointerleave", () => {
    elements.plane.style.setProperty("--map-ry", "-4deg");
    elements.plane.style.setProperty("--map-rx", "7deg");
  });
}

function initialiseGame() {
  gameReady = true;
  elements.editionButtons.forEach((button) => button.addEventListener("click", () => {
    state.edition = button.dataset.edition;
    state.solved = false;
    state.revealed = [];
    state.trapVisible = false;
    render();
  }));
  elements.answer.addEventListener("input", () => {
    elements.answer.classList.remove("is-correct", "is-wrong");
    renderLetterGrid(currentItem());
  });
  elements.answer.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      checkAnswer();
    }
  });
  elements.check.addEventListener("click", checkAnswer);
  elements.hint.addEventListener("click", revealLetter);
  elements.speak.addEventListener("click", speakCurrent);
  elements.previous.addEventListener("click", () => move(-1));
  elements.next.addEventListener("click", () => move(1));
  elements.random.addEventListener("click", randomTarget);
  document.addEventListener("keydown", (event) => {
    if (!elements.content.hidden && event.altKey && event.key === "ArrowRight") move(1);
    if (!elements.content.hidden && event.altKey && event.key === "ArrowLeft") move(-1);
  });
  initialiseMapTilt();
  render();
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  elements.loginStatus.textContent = "正在登入…";
  const data = new FormData(elements.form);
  try {
    const rows = await rpc("flashcard_student_login", {
      p_name:String(data.get("username") || "").trim(),
      p_password:String(data.get("password") || "")
    });
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.session_token || !await validate(String(row.session_token))) throw new Error("用戶名稱或密碼不正確。");
    showContent();
  } catch (error) {
    elements.loginStatus.textContent = error.message || "未能登入。";
  }
});

elements.logout.addEventListener("click", clearSession);

(async () => {
  const previewParameters = new URLSearchParams(location.search);
  const localPreview = ["localhost", "127.0.0.1"].includes(location.hostname)
    && previewParameters.has("preview");
  if (localPreview) {
    if (previewParameters.get("edition") === "hong-kong") state.edition = "hong-kong";
    if (previewParameters.get("filter") === "mtr") state.filters["hong-kong"] = "MTR stations";
    session = { token:"local-preview", id:"preview", name:"Preview", role:"student" };
    return showContent();
  }
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch {}
  saved ||= window.EdmundSystemNav?.bridgeStudentSession?.() || window.EdmundSystemNav?.getStudentSession?.();
  try {
    if (saved?.token && await validate(saved.token)) return showContent();
  } catch {}
  clearSession();
})();
