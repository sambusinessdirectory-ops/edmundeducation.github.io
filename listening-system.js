const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const CATALOGUE = window.EDMUND_LISTENING_CATALOG || { practices: [] };
const SESSION_KEY = "edmund-listening-session-v1";
const AUDIO_CATALOGUE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev/v1/listening/catalog";
const SPEEDS = Object.freeze([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);

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
  toastTimer: 0
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
  toast: document.querySelector("[data-toast]")
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
  setLoginStatus("正在核對共用學生帳戶…");
  try {
    if (!await login(username, password)) throw new Error("用戶名稱或密碼不正確。");
    elements.loginForm.reset();
    setLoginStatus();
    setConnection("Supabase 已連接", "online");
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
  setConnection("可以登入", "online");
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
        state.tracks.set(`${practice}:${part}`, { practice, part, url, key: String(raw.key || ""), size: Number(raw.size || 0) });
      }
    }
    return payload;
  })().catch((error) => {
    state.cataloguePromise = null;
    throw error;
  });
  return state.cataloguePromise;
}

function formatMegabytes(bytes) {
  return bytes > 0 ? `${(bytes / 1048576).toFixed(1)} MB` : "MP3";
}

function renderTrackCards() {
  elements.trackGrid.innerHTML = [1, 2, 3, 4].map((part) => {
    const track = state.tracks.get(`${state.practice}:${part}`);
    const requested = state.requestedPart === part ? " is-requested" : "";
    return `<article class="track-card${requested}" id="part-${part}" data-track-part="${part}">
      <div class="track-heading"><div><p class="eyebrow">RECORDING ${part}</p><h2>Part ${part}</h2></div><span>0${part}</span></div>
      ${track ? `<audio controls preload="metadata" data-audio-part="${part}" src="${escapeHtml(track.url)}">您的瀏覽器不支援音訊播放器。</audio>
        <div class="speed-row"><label>播放速度<select data-speed-part="${part}">${SPEEDS.map((speed) => `<option value="${speed}"${speed === state.speed ? " selected" : ""}>${speed}×</option>`).join("")}</select></label><p>${escapeHtml(formatMegabytes(track.size))} · Cloudflare R2</p></div>`
        : `<div class="track-unavailable"><strong>暫時未能找到 Part ${part} 錄音。</strong><br>系統已直接檢查 Cloudflare 資產目錄；請確認檔名同時包含 Practice ${state.practice} 和 Part ${part}。</div>`}
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

async function openPractice(practice, part = 0, options = {}) {
  const number = Number(practice);
  if (!Number.isInteger(number) || number < 1 || number > 20) return;
  pauseAllAudio();
  state.practice = number;
  state.requestedPart = Number(part) >= 1 && Number(part) <= 4 ? Number(part) : 0;
  if (options.update !== false) updateRoute("ielts", state.practice, state.requestedPart);
  elements.practiceTitle.textContent = `Practice ${state.practice}`;
  elements.trackGrid.innerHTML = "";
  setCatalogueStatus("正在連接 Cloudflare 錄音庫…");
  showView("practice");
  try {
    const payload = await loadAudioCatalogue();
    const available = [1, 2, 3, 4].filter((partNumber) => state.tracks.has(`${state.practice}:${partNumber}`)).length;
    renderTrackCards();
    if (available === 4) setCatalogueStatus("四段錄音已連接 Cloudflare R2。", "ready");
    else setCatalogueStatus(`已找到 ${available}/4 段錄音；缺少的 Part 已在下方清楚標示。`, "warning");
    if (Array.isArray(payload?.unmapped) && payload.unmapped.length) console.info("Unmapped listening objects", payload.unmapped);
    if (state.requestedPart) window.setTimeout(() => document.querySelector(`[data-track-part="${state.requestedPart}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  } catch (error) {
    console.warn("Listening catalogue failed", error);
    setCatalogueStatus(error?.message || "暫時未能連接 Cloudflare 錄音庫。", "error");
    renderTrackCards();
  }
}

function pauseAllAudio() {
  document.querySelectorAll("audio").forEach((audio) => audio.pause());
}

document.addEventListener("click", (event) => {
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
  else if (button.dataset.openSection) openSection(button.dataset.openSection);
  else if (button.dataset.openPractice) openPractice(Number(button.dataset.openPractice));
});

document.addEventListener("change", (event) => {
  const select = event.target;
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
    setConnection("可以登入", "online");
  } catch (error) {
    console.warn("Listening Supabase initialization failed", error);
    setConnection("連線失敗", "error");
  }
  if (await restoreSession()) {
    setConnection("Supabase 已連接", "online");
    openRequestedRoute();
  } else {
    showView("login", { scroll: false });
  }
}

initialise();
