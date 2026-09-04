const DATA = window.EDMUND_DSE_PAPER3_DATA;
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const SESSION_KEY = "edmund-dse-paper3-analysis-session-v1";
const SORT_KEY = "edmund-dse-paper3-year-sort-v1";
const DSE_CONTENT = new Map([
  [2012, window.EDMUND_DSE_LISTENING_2012 || null],
  [2013, window.EDMUND_DSE_LISTENING_2013 || null],
  [2014, window.EDMUND_DSE_LISTENING_2014 || null],
  [2015, window.EDMUND_DSE_LISTENING_2015 || null],
  [2016, window.EDMUND_DSE_LISTENING_2016 || null],
  [2017, window.EDMUND_DSE_LISTENING_2017 || null],
  [2018, window.EDMUND_DSE_LISTENING_2018 || null],
  [2019, window.EDMUND_DSE_LISTENING_2019 || null],
  [2020, window.EDMUND_DSE_LISTENING_2020 || null],
  [2021, window.EDMUND_DSE_LISTENING_2021 || null],
  [2023, window.EDMUND_DSE_LISTENING_2023 || null]
].filter(([, content]) => Boolean(content)));
const AUDIO_CATALOGUE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev/v1/listening/catalog";
const AUDIO_SPEEDS = Object.freeze([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);

if (!DATA?.years?.length || !DATA?.levels?.length || !DATA?.materialTypes?.length) {
  throw new Error("DSE Paper 3 analysis data is unavailable.");
}

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  connection: document.querySelector("[data-connection-status]"),
  userPill: document.querySelector("[data-user-pill]"),
  libraryHome: document.querySelector("[data-library-home]"),
  logout: document.querySelector("[data-logout]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginButton: document.querySelector("[data-login-button]"),
  loginStatus: document.querySelector("[data-login-status]"),
  password: document.querySelector("#paper3-password"),
  passwordToggle: document.querySelector("[data-password-toggle]"),
  welcome: document.querySelector("[data-welcome-message]"),
  back: document.querySelector("[data-back]"),
  breadcrumbs: document.querySelector("[data-breadcrumbs]"),
  toolbarActions: document.querySelector("[data-toolbar-actions]"),
  fastNavigation: document.querySelector("[data-fast-navigation]"),
  screen: document.querySelector("[data-library-screen]"),
  navigationStatus: document.querySelector("[data-navigation-status]"),
  toast: document.querySelector("[data-toast]")
};

const state = {
  supabase: null,
  user: null,
  token: "",
  access: {},
  screen: "years",
  year: null,
  level: "",
  material: "",
  sort: readSortPreference(),
  toastTimer: 0,
  headerObserver: null,
  partBTracks: new Map(),
  partBSpeed: 1,
  audioCataloguePromise: null
};

class AccessDeniedError extends Error {}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readSortPreference() {
  try {
    return localStorage.getItem(SORT_KEY) === "asc" ? "asc" : "desc";
  } catch {
    return "desc";
  }
}

function persistSortPreference() {
  try { localStorage.setItem(SORT_KEY, state.sort); } catch { /* Preference storage is optional. */ }
}

function setConnection(label, status = "checking") {
  elements.connection.textContent = label;
  elements.connection.dataset.state = status;
}

function setLoginStatus(message = "", status = "") {
  elements.loginStatus.textContent = message;
  if (status) elements.loginStatus.dataset.state = status;
  else delete elements.loginStatus.dataset.state;
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 3200);
}

function showView(viewName) {
  for (const view of elements.views) view.hidden = view.dataset.view !== viewName;
  const loggedIn = Boolean(state.user && state.token);
  elements.userPill.hidden = !loggedIn;
  elements.libraryHome.hidden = !loggedIn;
  elements.logout.hidden = !loggedIn;
  if (loggedIn) {
    elements.userPill.textContent = state.user.name;
    elements.welcome.textContent = `您好，${state.user.name}。請選擇年份開始。`;
  }
}

function initialiseSupabaseClient() {
  if (state.supabase) return state.supabase;
  if (!window.supabase?.createClient || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    throw new Error("登入服務暫時未能載入，請重新整理頁面。");
  }
  let storage;
  try { storage = window.sessionStorage; } catch { storage = undefined; }
  state.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      persistSession: Boolean(storage),
      ...(storage ? { storage } : {}),
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
  return state.supabase;
}

async function ensureSupabaseSession() {
  const client = initialiseSupabaseClient();
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

function normalizeAccess(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function assertPaper3Access(access) {
  if (access.dse !== true || access["dse-paper3"] === false) {
    throw new AccessDeniedError("此帳戶未獲開放 DSE 卷3權限，請聯絡 Edmund Sir。");
  }
}

function setStudent(row, token) {
  const access = normalizeAccess(row?.access);
  assertPaper3Access(access);
  state.token = String(token || row?.session_token || "");
  state.user = {
    id: String(row?.id || ""),
    name: String(row?.name || "Student"),
    role: "student"
  };
  state.access = access;
  saveSession();
  window.EdmundSystemNav?.rememberStudentSession({
    token: state.token,
    id: state.user.id,
    name: state.user.name,
    role: "student"
  });
}

function saveSession() {
  try {
    if (!state.user || !state.token) sessionStorage.removeItem(SESSION_KEY);
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...state.user, token: state.token, role: "student" }));
  } catch { /* Session storage is a convenience; the server remains authoritative. */ }
}

function readOwnSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

function clearOwnSession() {
  state.user = null;
  state.token = "";
  state.access = {};
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Ignore unavailable storage. */ }
}

async function loginStudent(username, password) {
  const data = await rpc("flashcard_student_login", { p_name: username, p_password: password });
  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.session_token) return false;
  setStudent(row, row.session_token);
  return true;
}

async function restoreStudent() {
  const shared = window.EdmundSystemNav?.getStudentSession?.();
  const own = readOwnSession();
  const candidate = shared?.role === "student" ? shared : own?.role === "student" ? own : null;
  if (!candidate?.token) return false;
  try {
    const data = await rpc("flashcard_student_session_profile", { p_token: String(candidate.token) });
    const row = Array.isArray(data) ? data[0] : null;
    if (!row?.session_token || !row?.name) throw new Error("登入時段已失效，請重新登入。");
    setStudent(row, row.session_token);
    return true;
  } catch (error) {
    clearOwnSession();
    if (!(error instanceof AccessDeniedError)) window.EdmundSystemNav?.forgetStudentSession?.();
    throw error;
  }
}

function resourceFor(year = state.year, level = state.level) {
  return DATA.resources?.[`${year}-${String(level).toLowerCase()}`] || null;
}

function hasYearResource(year) {
  return Number(year) === 2025 || DSE_CONTENT.has(Number(year)) || DATA.levels.some((level) => Boolean(resourceFor(year, level.id)));
}

function hasMaterial(resource, material) {
  if (!resource) return false;
  if (material === "model-essay") return Boolean(resource.modelEssays?.length);
  if (material === "data-file-analysis") return Boolean(resource.analysisSections?.length);
  return false;
}

function resetToYears({ announce = true } = {}) {
  state.screen = "years";
  state.year = null;
  state.level = "";
  state.material = "";
  renderLibrary();
  if (announce) announceNavigation("已返回年份選擇。");
}

function goBack() {
  if (state.screen === "resource") {
    state.screen = "materials";
    state.material = "";
  } else if (state.screen === "materials") {
    state.screen = "levels";
    state.level = "";
  } else if (state.screen === "levels") {
    state.screen = "years";
    state.year = null;
  }
  renderLibrary();
  announceNavigation("已返回上一層。");
}

function announceNavigation(message) {
  elements.navigationStatus.textContent = "";
  window.requestAnimationFrame(() => { elements.navigationStatus.textContent = message; });
}

function selectionCard({ kicker, title, subtitle, status, available, attributes }) {
  return `<button class="selection-card${available ? " is-available" : ""}" type="button" ${attributes}>
    <span class="card-kicker">${escapeHtml(kicker)}</span>
    <strong>${escapeHtml(title)}</strong>
    <small>${escapeHtml(subtitle)}</small>
    <span class="card-status">${escapeHtml(status)}</span>
    <span class="card-arrow" aria-hidden="true">→</span>
  </button>`;
}

function renderYears() {
  const years = [...DATA.years].sort((a, b) => state.sort === "asc" ? a - b : b - a);
  elements.screen.innerHTML = `<section class="screen-section" aria-labelledby="years-title">
    <header class="screen-heading">
      <div><p class="eyebrow">STEP 01 · YEAR</p><h2 id="years-title">選擇年份</h2><p>由 2012 至 2026，您可按年份排列方向瀏覽。已有教材或錄音的年份會以綠色狀態顯示。</p></div>
      <div class="screen-counter"><strong>${years.length}</strong><span>個年份</span></div>
    </header>
    <div class="selection-grid">${years.map((year) => selectionCard({
      kicker: "DSE PAPER 3",
      title: year,
      subtitle: "B1 / B2 · 實用文範文與 Data File 分析",
      status: DSE_CONTENT.has(year) ? "已有 Part B 錄音稿" : hasYearResource(year) ? "已有教材" : "內容尚未加入",
      available: hasYearResource(year),
      attributes: `data-select-year="${year}" aria-label="選擇 ${year} 年"`
    })).join("")}</div>
  </section>`;
}

async function loadPartBAudio(year = state.year) {
  const selectedYear = Number(year);
  if (state.partBTracks.has(selectedYear)) return state.partBTracks.get(selectedYear);
  if (!state.audioCataloguePromise) state.audioCataloguePromise = (async () => {
    const response = await fetch(AUDIO_CATALOGUE_URL, { mode: "cors", credentials: "omit", cache: "no-cache" });
    if (!response.ok) throw new Error(`錄音庫回應錯誤（${response.status}）`);
    return response.json();
  })().catch((error) => {
    state.audioCataloguePromise = null;
    throw error;
  });
  const payload = await state.audioCataloguePromise;
  const track = (Array.isArray(payload?.dseTracks) ? payload.dseTracks : []).find((item) => Number(item.year) === selectedYear && item.section === "part-b");
  if (!track?.url || !/^https:\/\//i.test(track.url)) throw new Error(`暫時未能找到 ${selectedYear} Part B 錄音。`);
  state.partBTracks.set(selectedYear, String(track.url));
  return state.partBTracks.get(selectedYear);
}

function renderPartBPanel() {
  const content = DSE_CONTENT.get(state.year);
  const rows = content?.transcript?.partB || [];
  const track = state.partBTracks.get(state.year) || "";
  return `<section class="partb-listening-panel" aria-labelledby="partb-listening-title">
    <header><div><p class="eyebrow">${state.year} · PART B RECORDING</p><h3 id="partb-listening-title">Part B 完整錄音及角色錄音稿</h3><p>${escapeHtml(content?.partBDescriptionZh || content?.partBDescription || "錄音包括熟習題目時間及完整對話。")}按錄音稿任何一行可跳到該句。</p></div><span>${escapeHtml(content?.partBDuration || "")}</span></header>
    ${track ? `<div class="partb-audio-row"><audio controls preload="metadata" data-partb-audio src="${escapeHtml(track)}">您的瀏覽器不支援音訊播放器。</audio><label>播放速度<select data-partb-speed>${AUDIO_SPEEDS.map((speed) => `<option value="${speed}"${speed === state.partBSpeed ? " selected" : ""}>${speed}×</option>`).join("")}</select></label></div>` : `<p class="partb-audio-status" data-partb-audio-status>正在載入 Part B 錄音…</p>`}
    <details class="partb-transcript" open><summary>顯示／收起角色錄音稿 <small>${rows.length} 段</small></summary><div class="partb-transcript-lines" data-partb-transcript>${rows.map((row, index) => `<button type="button" data-partb-line="${index}" data-start="${row.start}"><strong>${escapeHtml(row.speaker)}</strong><span>${escapeHtml(row.text)}</span></button>`).join("")}</div></details>
  </section>`;
}

function bindPartBPlayer() {
  const audio = elements.screen.querySelector("[data-partb-audio]");
  const transcript = elements.screen.querySelector("[data-partb-transcript]");
  if (!audio || !transcript) return;
  const lines = [...transcript.querySelectorAll("[data-partb-line]")];
  const activate = () => {
    const time = Number(audio.currentTime) || 0;
    let current = -1;
    lines.forEach((line, index) => { if (time >= Number(line.dataset.start)) current = index; });
    lines.forEach((line, index) => line.classList.toggle("is-current", index === current));
  };
  audio.playbackRate = state.partBSpeed;
  audio.addEventListener("timeupdate", activate);
  transcript.addEventListener("click", (event) => {
    const line = event.target.closest("[data-partb-line]");
    if (!line) return;
    audio.currentTime = Number(line.dataset.start) || 0;
    audio.play().catch(() => showToast("請先在頁面中按一下，再開始播放。"));
  });
}

function renderLevels() {
  elements.screen.innerHTML = `<section class="screen-section" aria-labelledby="levels-title">
    <header class="screen-heading">
      <div><p class="eyebrow">STEP 02 · PAPER</p><h2 id="levels-title">${escapeHtml(state.year)} · 選擇卷別</h2><p>分別查看 B1 或 B2 的實用文範文及 Data File 解卷分析。</p></div>
      <div class="screen-counter"><strong>2</strong><span>個卷別</span></div>
    </header>
    ${DSE_CONTENT.has(state.year) ? renderPartBPanel() : ""}
    <div class="selection-grid level-grid">${DATA.levels.map((level) => {
      const available = (state.year === 2025 && level.id === "b1") || Boolean(resourceFor(state.year, level.id));
      return selectionCard({
        kicker: `${state.year} · PAPER 3`,
        title: level.label,
        subtitle: "Integrated Skills · 綜合能力",
        status: available ? "已有教材" : "內容尚未加入",
        available,
        attributes: `data-select-level="${escapeHtml(level.id)}" aria-label="選擇 ${escapeHtml(level.label)}"`
      });
    }).join("")}</div>
  </section>`;
  if (state.year === 2025) elements.screen.querySelector('.screen-section').insertAdjacentHTML('beforeend', b1FullLink());
  if (DSE_CONTENT.has(state.year)) bindPartBPlayer();
}

function b1FullLink() {
  return '<a class="selection-card is-available" href="dse-paper3-2025-b1-data-file.html" style="display:block;text-decoration:none;margin:18px 0;border:2px solid #16727c;background:#e8f3ec"><span class="card-kicker">2025 B1 · COMPLETE DATA FILE + QUESTION-ANSWER BOOK</span><strong style="font-size:clamp(24px,3vw,38px)">Data File 分析 + PP</strong><small>14 頁完整原文 · 原卷圖表 · 電郵及聊天版面 · 中英對照 · 可輸入答案</small><span class="card-status">開啟完整資料檔及問答冊</span><span class="card-arrow" aria-hidden="true">→</span></a>';
}

function renderMaterials() {
  const resource = resourceFor();
  const hasFullB1 = state.year === 2025 && state.level === "b1";
  elements.screen.innerHTML = `<section class="screen-section" aria-labelledby="materials-title">
    <header class="screen-heading">
      <div><p class="eyebrow">STEP 03 · RESOURCE</p><h2 id="materials-title">${escapeHtml(state.year)} ${escapeHtml(state.level.toUpperCase())}</h2><p>先讀三篇實用文範文，或逐份展開 Data File，理解如何選取、比較和整合資料。</p></div>
      <div class="screen-counter"><strong>${hasFullB1 ? 3 : 2}</strong><span>類教材</span></div>
    </header>
    ${hasFullB1 ? b1FullLink() : ""}
    <div class="selection-grid material-grid">${DATA.materialTypes.map((material) => {
      const available = hasMaterial(resource, material.id);
      const count = material.id === "model-essay" ? resource?.modelEssays?.length : resource?.analysisSections?.length;
      return selectionCard({
        kicker: material.titleEn,
        title: material.titleZh,
        subtitle: available ? `${count} 個可展開部分` : "此組合暫未有已整理內容",
        status: available ? "開啟教材" : "內容尚未加入",
        available,
        attributes: `data-select-material="${escapeHtml(material.id)}" aria-label="開啟 ${escapeHtml(material.titleZh)}"`
      });
    }).join("")}</div>
  </section>`;
}

function renderEmptyResource() {
  const material = DATA.materialTypes.find((item) => item.id === state.material);
  elements.screen.innerHTML = `<section class="empty-state" aria-labelledby="empty-title"><div class="empty-state-inner">
    <span class="empty-mark" aria-hidden="true">—</span>
    <p class="eyebrow">${escapeHtml(state.year)} · ${escapeHtml(state.level.toUpperCase())}</p>
    <h2 id="empty-title">內容尚未加入</h2>
    <p>${escapeHtml(material?.titleZh || "所選教材")}尚未完成整理。您仍可返回選擇其他年份、卷別或教材類型。</p>
    <button class="secondary-button" type="button" data-empty-back>返回教材選擇</button>
  </div></section>`;
}

function essayBody(essay) {
  const subheadings = new Set(["Three Returning Highlights", "What Students Said Last Year", "Introduction", "Suggested Activities", "Venue", "Conclusion"]);
  return essay.blocks.map((block, index) => {
    if (index === 0) return `<p class="essay-document__task">${escapeHtml(block)}</p>`;
    if (index === 1 && !/^Dear\b/i.test(block)) return `<h3>${escapeHtml(block)}</h3>`;
    if (subheadings.has(block)) return `<h4>${escapeHtml(block)}</h4>`;
    return `<p>${escapeHtml(block)}</p>`;
  }).join("");
}

function renderModelEssays(resource) {
  const essays = resource.modelEssays || [];
  elements.screen.innerHTML = `<section class="screen-section" aria-labelledby="essay-resource-title">
    <header class="resource-heading">
      <div><p class="eyebrow">${state.year} · ${escapeHtml(state.level.toUpperCase())} · MODEL ESSAYS</p><h2 id="essay-resource-title">實用文範文</h2><p>按次序展開三項任務，先掌握格式，再留意每段如何選用 Data File 資料。</p></div>
      <div class="resource-count"><strong>${essays.length}</strong><span>篇範文</span></div>
    </header>
    <div class="resource-list">${essays.map((essay, index) => `<details class="essay-card" id="essay-${escapeHtml(essay.id)}">
      <summary><span class="essay-index">${String(index + 1).padStart(2, "0")}</span><span class="essay-summary-copy"><small>${escapeHtml(essay.task)} · ${escapeHtml(essay.format)}</small><strong>${escapeHtml(essay.title)}</strong></span><span class="essay-page">PDF p.${essay.page}</span></summary>
      <div class="essay-body"><article class="essay-document">${essayBody(essay)}</article></div>
    </details>`).join("")}</div>
  </section>`;
}

function classifyBlock(block) {
  if (/^類型\s*\d*[:：]/.test(block)) return "is-marker";
  if (/^[●•]/.test(block)) return "is-bullet";
  if (/^(?:分析|重點)[:：]?$/.test(block) || (/[:：]$/.test(block) && block.length < 58)) return "is-heading";
  if (/^["[]/.test(block)) return "is-quote";
  return "";
}

function renderAnalysisPages(section) {
  return section.pages.map((page) => `<article class="analysis-page">
    <header><span>SOURCE ANALYSIS</span><strong>PDF p.${page.pageNumber}</strong></header>
    <div class="page-blocks">${page.blocks.map((block) => `<p class="page-block ${classifyBlock(block)}">${escapeHtml(block)}</p>`).join("")}</div>
  </article>`).join("");
}

function renderAnalysis(resource) {
  const sections = resource.analysisSections || [];
  const pageCount = sections.reduce((total, section) => total + section.pages.length, 0);
  elements.screen.innerHTML = `<section class="screen-section" aria-labelledby="analysis-resource-title">
    <header class="resource-heading">
      <div><p class="eyebrow">${state.year} · ${escapeHtml(state.level.toUpperCase())} · DATA FILE</p><h2 id="analysis-resource-title">Data File 分析</h2><p>由分析方法開始，再按原卷次序逐份閱讀資料。每一部分均可獨立展開，避免一次顯示過多文字。</p></div>
      <div class="resource-count"><strong>${pageCount}</strong><span>頁分析</span></div>
    </header>
    <div class="analysis-list">${sections.map((section) => `<details class="analysis-accordion" id="section-${escapeHtml(section.id)}">
      <summary><span class="analysis-index">${String(section.order).padStart(2, "0")}</span><span class="analysis-summary-copy"><small>SECTION ${String(section.order).padStart(2, "0")}</small><strong>${escapeHtml(section.title)}</strong><p>${escapeHtml(section.summary)}</p></span><span class="analysis-page-count">${section.pageCount} 頁</span></summary>
      <div class="analysis-body"><div class="analysis-pages">${renderAnalysisPages(section)}</div></div>
    </details>`).join("")}</div>
  </section>`;
}

function renderResource() {
  const resource = resourceFor();
  if (!hasMaterial(resource, state.material)) return renderEmptyResource();
  if (state.material === "model-essay") renderModelEssays(resource);
  else renderAnalysis(resource);
}

function crumb(label, target, current = false) {
  if (current) return `<span class="crumb-current" aria-current="page">${escapeHtml(label)}</span>`;
  return `<button class="crumb-button" type="button" data-crumb-target="${escapeHtml(target)}">${escapeHtml(label)}</button>`;
}

function renderBreadcrumbs() {
  const crumbs = [crumb("DSE 卷3", "years", state.screen === "years")];
  if (state.year) crumbs.push(crumb(String(state.year), "levels", state.screen === "levels"));
  if (state.level) crumbs.push(crumb(state.level.toUpperCase(), "materials", state.screen === "materials"));
  if (state.material) {
    const label = DATA.materialTypes.find((item) => item.id === state.material)?.titleZh || "教材";
    crumbs.push(crumb(label, "resource", true));
  }
  elements.breadcrumbs.innerHTML = crumbs.join('<span class="crumb-separator" aria-hidden="true">/</span>');
}

function renderToolbar() {
  elements.back.hidden = state.screen === "years";
  elements.toolbarActions.innerHTML = "";
  elements.fastNavigation.hidden = true;
  elements.fastNavigation.innerHTML = "";

  if (state.screen === "years") {
    elements.toolbarActions.innerHTML = `<button class="toolbar-button" type="button" data-sort-toggle aria-pressed="${state.sort === "asc"}">${state.sort === "desc" ? "年份：新至舊" : "年份：舊至新"}</button>`;
  }
  if (state.screen !== "resource") return;
  const resource = resourceFor();
  if (!hasMaterial(resource, state.material)) return;
  elements.toolbarActions.innerHTML = `<button class="toolbar-button" type="button" data-details-action="expand">全部展開</button><button class="toolbar-button" type="button" data-details-action="collapse">全部收起</button>`;
  const items = state.material === "model-essay"
    ? resource.modelEssays.map((essay, index) => ({ id: `essay-${essay.id}`, label: `${index + 1}. ${essay.task} · ${essay.title}` }))
    : resource.analysisSections.map((section) => ({ id: `section-${section.id}`, label: `${section.order}. ${section.title}` }));
  elements.fastNavigation.hidden = false;
  elements.fastNavigation.innerHTML = `<div class="fast-navigation__controls"><span class="fast-navigation__label">快速前往</span><select class="fast-navigation__select" data-fast-select aria-label="選擇要前往的部分"><option value="">選擇部分…</option>${items.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`).join("")}</select></div><div class="fast-navigation__list">${items.map((item) => `<button class="fast-jump-button" type="button" data-jump-id="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button>`).join("")}</div>`;
}

function renderLibrary() {
  renderBreadcrumbs();
  renderToolbar();
  if (state.screen === "years") renderYears();
  else if (state.screen === "levels") renderLevels();
  else if (state.screen === "materials") renderMaterials();
  else renderResource();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function navigateTo(target) {
  if (target === "years") return resetToYears();
  if (target === "levels" && state.year) {
    state.screen = "levels";
    state.level = "";
    state.material = "";
  } else if (target === "materials" && state.year && state.level) {
    state.screen = "materials";
    state.material = "";
  }
  renderLibrary();
}

function jumpTo(id) {
  const target = document.getElementById(id);
  if (!target) return;
  if (target instanceof HTMLDetailsElement) target.open = true;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  announceNavigation(`已前往 ${target.querySelector("strong")?.textContent || "所選部分"}。`);
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(elements.loginForm);
  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");
  if (!username || !password) return setLoginStatus("請輸入用戶名稱及密碼。", "error");
  elements.loginButton.disabled = true;
  setLoginStatus("正在核對帳戶…");
  setConnection("正在連接", "checking");
  try {
    if (!await loginStudent(username, password)) throw new Error("用戶名稱或密碼不正確。");
    elements.loginForm.reset();
    setLoginStatus();
    setConnection("已安全連接", "online");
    showView("library");
    resetToYears({ announce: false });
    if (location.hash === "#2025-b1") { state.year = 2025; state.level = "b1"; state.screen = "materials"; renderLibrary(); }
    showToast(`您好，${state.user.name}！`);
  } catch (error) {
    console.warn("DSE Paper 3 login failed", error);
    clearOwnSession();
    setLoginStatus(error.message || "登入失敗，請稍後再試。", "error");
    setConnection("登入未完成", "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function logout() {
  window.EdmundSystemNav?.forgetStudentSession?.();
  clearOwnSession();
  try { await state.supabase?.auth.signOut(); } catch { /* Anonymous Auth cleanup is best-effort. */ }
  showView("login");
  setConnection("已連線", "online");
  setLoginStatus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleScreenClick(event) {
  const year = event.target.closest("[data-select-year]");
  if (year) {
    state.year = Number(year.dataset.selectYear);
    state.level = "";
    state.material = "";
    state.screen = "levels";
    renderLibrary();
    if (DSE_CONTENT.has(state.year) && !state.partBTracks.has(state.year)) {
      const selectedYear = state.year;
      void loadPartBAudio(selectedYear).then(() => {
        if (state.screen === "levels" && state.year === selectedYear) renderLibrary();
      }).catch((error) => {
        console.warn("DSE Part B audio catalogue failed", error);
        const status = elements.screen.querySelector("[data-partb-audio-status]");
        if (status) status.textContent = error?.message || "暫時未能載入 Part B 錄音。";
      });
    }
    return;
  }
  const level = event.target.closest("[data-select-level]");
  if (level) {
    state.level = String(level.dataset.selectLevel);
    state.material = "";
    state.screen = "materials";
    renderLibrary();
    return;
  }
  const material = event.target.closest("[data-select-material]");
  if (material) {
    state.material = String(material.dataset.selectMaterial);
    state.screen = "resource";
    renderLibrary();
    return;
  }
  if (event.target.closest("[data-empty-back]")) {
    state.screen = "materials";
    state.material = "";
    renderLibrary();
  }
}

function handleToolbarClick(event) {
  const crumbTarget = event.target.closest("[data-crumb-target]")?.dataset.crumbTarget;
  if (crumbTarget) return navigateTo(crumbTarget);
  if (event.target.closest("[data-sort-toggle]")) {
    state.sort = state.sort === "desc" ? "asc" : "desc";
    persistSortPreference();
    renderLibrary();
    announceNavigation(state.sort === "desc" ? "年份已改為由新至舊。" : "年份已改為由舊至新。");
    return;
  }
  const detailAction = event.target.closest("[data-details-action]")?.dataset.detailsAction;
  if (detailAction) {
    elements.screen.querySelectorAll("details").forEach((detail) => { detail.open = detailAction === "expand"; });
    announceNavigation(detailAction === "expand" ? "已展開全部部分。" : "已收起全部部分。");
    return;
  }
  const jumpId = event.target.closest("[data-jump-id]")?.dataset.jumpId;
  if (jumpId) jumpTo(jumpId);
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.passwordToggle.addEventListener("click", () => {
    const show = elements.password.type === "password";
    elements.password.type = show ? "text" : "password";
    elements.passwordToggle.textContent = show ? "隱藏" : "顯示";
    elements.passwordToggle.setAttribute("aria-label", show ? "隱藏密碼" : "顯示密碼");
    elements.passwordToggle.setAttribute("aria-pressed", String(show));
  });
  elements.libraryHome.addEventListener("click", () => resetToYears());
  elements.logout.addEventListener("click", logout);
  elements.back.addEventListener("click", goBack);
  elements.screen.addEventListener("click", handleScreenClick);
  document.querySelector("[data-local-toolbar]").addEventListener("click", handleToolbarClick);
  elements.fastNavigation.addEventListener("change", (event) => {
    if (event.target.matches("[data-fast-select]") && event.target.value) jumpTo(event.target.value);
  });
  elements.screen.addEventListener("change", (event) => {
    if (!event.target.matches("[data-partb-speed]")) return;
    const value = Number(event.target.value);
    state.partBSpeed = AUDIO_SPEEDS.includes(value) ? value : 1;
    const audio = elements.screen.querySelector("[data-partb-audio]");
    if (audio) audio.playbackRate = state.partBSpeed;
    showToast(`Part B 播放速度已設為 ${state.partBSpeed}×`);
  });

  const siteHeader = document.querySelector(".paper3-site-header");
  const localToolbar = document.querySelector("[data-local-toolbar]");
  const updateLayoutMetrics = () => {
    if (siteHeader) document.documentElement.style.setProperty("--shared-header-height", `${Math.ceil(siteHeader.getBoundingClientRect().height)}px`);
    if (localToolbar) document.documentElement.style.setProperty("--local-toolbar-height", `${Math.ceil(localToolbar.getBoundingClientRect().height)}px`);
  };
  updateLayoutMetrics();
  if ("ResizeObserver" in window) {
    state.headerObserver = new ResizeObserver(updateLayoutMetrics);
    if (siteHeader) state.headerObserver.observe(siteHeader);
    if (localToolbar) state.headerObserver.observe(localToolbar);
  }
}

async function initialise() {
  bindEvents();
  showView("login");
  setConnection("正在核對登入", "checking");
  try {
    if (await restoreStudent()) {
      setConnection("已安全連接", "online");
      showView("library");
      resetToYears({ announce: false });
    if (location.hash === "#2025-b1") { state.year = 2025; state.level = "b1"; state.screen = "materials"; renderLibrary(); }
      return;
    }
    setConnection("已連線", "online");
  } catch (error) {
    console.warn("DSE Paper 3 session restore failed", error);
    setLoginStatus(error.message || "登入時段未能恢復，請重新登入。", "error");
    setConnection(error instanceof AccessDeniedError ? "權限未開放" : "可以重新登入", error instanceof AccessDeniedError ? "error" : "online");
  }
}

initialise();
