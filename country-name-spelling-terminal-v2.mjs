import { HK_DISTRICTS, HK_GROUPS, MTR_STATIONS, WORLD_COUNTRIES, WORLD_REGIONS } from "./country-name-spelling-data.mjs";
import { HK_GEOMETRY, HK_VIEWBOX, MTR_COORDINATES, WORLD_GEOMETRY, WORLD_VIEWBOX } from "./country-name-spelling-map/map-geometry.mjs";

const CONFIG = window.EDMUND_SUPABASE || {};
const SESSION_KEY = "edmund-country-name-spelling-session-v1";
const PROGRESS_KEY = "edmund-country-name-spelling-progress-v2";
const WORLD_RELIEF = "country-name-spelling-map/world-relief.jpg";
const HK_RELIEF = "country-name-spelling-map/hong-kong-relief.png?v=20261104-coastline2";
const SVG_NS = "http://www.w3.org/2000/svg";
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");
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
const WORLD_CAMERAS = Object.freeze({
  Europe:{ x:655, y:42, width:455, height:320 },
  Asia:{ x:820, y:65, width:610, height:455 },
  Americas:{ x:85, y:45, width:580, height:690 },
  Africa:{ x:625, y:245, width:420, height:485 },
  Oceania:{ x:1030, y:380, width:500, height:345 }
});
const HK_BY_ID = new Map(HK_GEOMETRY.map((district) => [district.id, district]));

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
  terrainMap: document.querySelector("[data-terrain-map]"),
  terrainScan: document.querySelector("[data-terrain-scan]"),
  terrainClip: document.querySelector("[data-terrain-clip]"),
  reliefImage: document.querySelector("[data-relief-image]"),
  regions: document.querySelector("[data-map-regions]"),
  mtrNetwork: document.querySelector("[data-mtr-network]"),
  annotations: document.querySelector("[data-map-annotations]"),
  viewport: document.querySelector("[data-map-viewport]"),
  mobileRelief: document.querySelector("[data-mobile-relief]"),
  plane: document.querySelector("[data-map-plane]"),
  markers: document.querySelector("[data-map-markers]"),
  reticle: document.querySelector("[data-target-reticle]"),
  mobileTarget: document.querySelector("[data-mobile-map-target]"),
  coordinateReadout: document.querySelector("[data-coordinate-readout]"),
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
  visualFrame: document.querySelector("[data-visual-frame]"),
  worldVisual: document.querySelector("[data-world-visual]"),
  locationInset: document.querySelector("[data-location-inset]"),
  hkBadge: document.querySelector("[data-hk-badge]"),
  visualLabel: document.querySelector("[data-visual-label]"),
  flag: document.querySelector("[data-flag]"),
  itemType: document.querySelector("[data-item-type]"),
  itemZh: document.querySelector("[data-item-zh]"),
  itemZone: document.querySelector("[data-item-zone]"),
  missionContext: document.querySelector("[data-mission-context]"),
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
let mapCamera = null;
let cameraAnimation = 0;
let state = loadProgress();

function svgNode(tag, attributes = {}, text = "") {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  if (text) node.textContent = text;
  return node;
}

function loadProgress() {
  const fallback = { edition:"world", filters:{ world:"All", "hong-kong":"Districts" }, current:{}, attempts:0, correct:0, streak:0, mastered:[], hints:0, failures:{}, solved:false, revealed:[], usedFullReveal:false, trapVisible:false };
  try {
    const value = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null");
    if (!value || typeof value !== "object") return fallback;
    return {
      ...fallback,
      ...value,
      filters: { ...fallback.filters, ...(value.filters || {}) },
      current: { ...(value.current || {}) },
      failures: { ...(value.failures || {}) },
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

function worldPoint(item) {
  return { x:((item.lon + 180) / 360) * WORLD_VIEWBOX.width, y:((90 - item.lat) / 180) * WORLD_VIEWBOX.height };
}

function stationPoint(item) {
  return MTR_COORDINATES[normaliseAnswer(item.name)] || { x:(item.x / 100) * HK_VIEWBOX.width, y:(item.y / 100) * HK_VIEWBOX.height };
}

function itemPoint(item) {
  if (state.edition === "world") return worldPoint(item);
  if (currentFilter() === "Districts") {
    const district = HK_BY_ID.get(item.id);
    return district ? { x:district.x, y:district.y } : { x:HK_VIEWBOX.width / 2, y:HK_VIEWBOX.height / 2 };
  }
  return stationPoint(item);
}

function expandBoxToAspect(box, aspect, limits) {
  let { x, y, width, height } = box;
  if (width / height < aspect) {
    const nextWidth = height * aspect;
    x -= (nextWidth - width) / 2;
    width = nextWidth;
  } else {
    const nextHeight = width / aspect;
    y -= (nextHeight - height) / 2;
    height = nextHeight;
  }
  width = Math.min(width, limits.width);
  height = Math.min(height, limits.height);
  x = Math.max(0, Math.min(limits.width - width, x));
  y = Math.max(0, Math.min(limits.height - height, y));
  return { x, y, width, height };
}

function cameraFor(item) {
  const aspect = 1.82;
  if (state.edition === "world") {
    const point = itemPoint(item);
    const sizes = {
      Europe:{ width:530, height:360 }, Asia:{ width:660, height:440 },
      Americas:{ width:650, height:540 }, Africa:{ width:535, height:500 }, Oceania:{ width:555, height:390 }
    };
    const size = sizes[item.region] || WORLD_CAMERAS[item.region] || { width:720, height:500 };
    return expandBoxToAspect({
      x:point.x - size.width / 2,
      y:point.y - size.height / 2,
      width:size.width,
      height:size.height
    }, aspect, WORLD_VIEWBOX);
  }
  if (currentFilter() === "Districts") {
    return { x:0, y:0, width:HK_VIEWBOX.width, height:HK_VIEWBOX.height };
  }
  return { x:0, y:0, width:HK_VIEWBOX.width, height:HK_VIEWBOX.height };
}

function viewBoxString(box) {
  return `${box.x.toFixed(2)} ${box.y.toFixed(2)} ${box.width.toFixed(2)} ${box.height.toFixed(2)}`;
}

function pathBounds(path) {
  const values = String(path).match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
  const xs = values.filter((_, index) => index % 2 === 0);
  const ys = values.filter((_, index) => index % 2 === 1);
  if (!xs.length || !ys.length) return { x:0, y:0, width:HK_VIEWBOX.width, height:HK_VIEWBOX.height };
  const minX = Math.min(...xs); const maxX = Math.max(...xs);
  const minY = Math.min(...ys); const maxY = Math.max(...ys);
  const padding = Math.max(18, Math.max(maxX - minX, maxY - minY) * .12);
  return { x:minX - padding, y:minY - padding, width:maxX - minX + padding * 2, height:maxY - minY + padding * 2 };
}

function pointBounds(points, padding = 45) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  if (!points.length) return { x:0, y:0, width:HK_VIEWBOX.width, height:HK_VIEWBOX.height };
  return {
    x:Math.min(...xs) - padding,
    y:Math.min(...ys) - padding,
    width:Math.max(120, Math.max(...xs) - Math.min(...xs) + padding * 2),
    height:Math.max(90, Math.max(...ys) - Math.min(...ys) + padding * 2)
  };
}

function animateCamera(target) {
  cancelAnimationFrame(cameraAnimation);
  if (!mapCamera || REDUCED_MOTION.matches) {
    mapCamera = target;
    elements.terrainMap.setAttribute("viewBox", viewBoxString(target));
    return;
  }
  const start = mapCamera;
  const started = performance.now();
  const frame = (time) => {
    const raw = Math.min(1, (time - started) / 560);
    const eased = 1 - Math.pow(1 - raw, 3);
    const current = {};
    for (const key of ["x", "y", "width", "height"]) current[key] = start[key] + (target[key] - start[key]) * eased;
    elements.terrainMap.setAttribute("viewBox", viewBoxString(current));
    if (raw < 1) cameraAnimation = requestAnimationFrame(frame);
    else mapCamera = target;
  };
  cameraAnimation = requestAnimationFrame(frame);
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
  state.usedFullReveal = false;
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

function terrainPaths(collection, selectedKey, key = "code") {
  return collection.map((shape) => svgNode("path", {
    d:shape.path,
    class:`map-region${shape[key] === selectedKey ? " is-target" : ""}`,
    "data-region":shape[key],
    "vector-effect":"non-scaling-stroke"
  }));
}

function hongKongLandMask(id) {
  const definitions = svgNode("defs");
  const mask = svgNode("mask", {
    id,
    x:0,
    y:0,
    width:HK_VIEWBOX.width,
    height:HK_VIEWBOX.height,
    maskUnits:"userSpaceOnUse",
    style:"mask-type:alpha"
  });
  mask.append(svgNode("image", {
    href:HK_RELIEF,
    width:HK_VIEWBOX.width,
    height:HK_VIEWBOX.height,
    preserveAspectRatio:"none"
  }));
  definitions.append(mask);
  return definitions;
}

function renderMtrNetwork(item, destination = elements.mtrNetwork, inset = false) {
  if (!inset) destination.replaceChildren();
  if (state.edition !== "hong-kong" || currentFilter() !== "MTR stations") return;
  for (const [line, colour] of Object.entries(LINE_COLOURS)) {
    const stations = MTR_STATIONS.filter((station) => station.line === line);
    if (stations.length < 2) continue;
    const active = line === item.line;
    if (inset && !active) continue;
    const points = stations.map(stationPoint);
    destination.append(svgNode("polyline", {
      points:points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" "),
      class:`rail-line${active ? " is-active" : ""}`,
      stroke:colour,
      "vector-effect":"non-scaling-stroke"
    }));
    if (active || inset) {
      for (const station of stations) {
        const point = stationPoint(station);
        destination.append(svgNode("circle", {
          cx:point.x, cy:point.y, r:station.id === item.id ? 7 : 3.5,
          class:`rail-station${station.id === item.id ? " is-target" : ""}`,
          "vector-effect":"non-scaling-stroke"
        }));
      }
    }
  }
}

function mapCandidates(item) {
  const pool = activePool();
  const point = itemPoint(item);
  return pool
    .map((candidate) => ({ candidate, point:itemPoint(candidate) }))
    .sort((a, b) => Math.hypot(a.point.x - point.x, a.point.y - point.y) - Math.hypot(b.point.x - point.x, b.point.y - point.y))
    .slice(0, state.edition === "world" ? 11 : 16);
}

function renderAnnotations(item) {
  const pool = activePool();
  const camera = cameraFor(item);
  const targetIndex = Math.max(0, pool.findIndex((candidate) => candidate.id === item.id));
  const nodes = [];
  for (const { candidate, point } of mapCandidates(item)) {
    const target = candidate.id === item.id;
    const mastered = state.mastered.includes(progressId(candidate));
    const group = svgNode("g", {
      class:`map-point${target ? " is-target" : ""}${mastered ? " is-mastered" : ""}`,
      transform:`translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`,
      role:"button", tabindex:"0", "aria-label":`選擇 ${candidate.zh}`
    });
    group.append(svgNode("circle", { r:target ? 12 : 4.5, class:"map-point__hit" }));
    group.append(svgNode("circle", { r:target ? 4.2 : 2.3, class:"map-point__core", "vector-effect":"non-scaling-stroke" }));
    if (target) {
      group.append(svgNode("circle", { r:22, class:"map-point__ring", "vector-effect":"non-scaling-stroke" }));
      const horizontal = (point.x - camera.x) / camera.width;
      const vertical = (point.y - camera.y) / camera.height;
      const calloutX = horizontal > .78 ? -133 : 15;
      const calloutY = vertical < .16 ? 12 : -30;
      const callout = svgNode("g", { class:"map-target__label", transform:`translate(${calloutX} ${calloutY})` });
      callout.append(svgNode("rect", { x:0, y:0, width:118, height:28, rx:1 }));
      callout.append(svgNode("text", { x:9, y:18 }, `TARGET ${String(targetIndex + 1).padStart(2, "0")} · ${candidate.zh}`));
      group.append(callout);
    }
    group.addEventListener("click", () => setCurrent(candidate));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setCurrent(candidate); }
    });
    nodes.push(group);
  }
  elements.annotations.replaceChildren(...nodes);
}

function coordinateCopy(item) {
  if (state.edition === "world") {
    const lat = Math.abs(item.lat).toFixed(2);
    const lon = Math.abs(item.lon).toFixed(2);
    return `${lat}° ${item.lat >= 0 ? "N" : "S"} / ${lon}° ${item.lon >= 0 ? "E" : "W"}`;
  }
  const point = itemPoint(item);
  const lon = 113.82 + (point.x / HK_VIEWBOX.width) * .64;
  const lat = 22.58 - (point.y / HK_VIEWBOX.height) * .44;
  return `${lat.toFixed(4)}° N / ${lon.toFixed(4)}° E`;
}

function renderMap(item) {
  const isWorld = state.edition === "world";
  const geometry = isWorld ? WORLD_GEOMETRY : HK_GEOMETRY;
  const viewbox = isWorld ? WORLD_VIEWBOX : HK_VIEWBOX;
  const selectedKey = isWorld ? item.code : (currentFilter() === "Districts" ? item.id : "");
  elements.viewport.classList.toggle("is-hong-kong", !isWorld);
  elements.terrainMap.classList.toggle("is-hong-kong", !isWorld);
  if (isWorld) elements.terrainScan.removeAttribute("mask");
  else elements.terrainScan.setAttribute("mask", "url(#hong-kong-land-mask)");
  elements.terrainMap.setAttribute("aria-label", isWorld ? "世界國家地形圖" : "香港十八區地形圖");
  elements.terrainClip.replaceChildren(...terrainPaths(geometry, selectedKey, isWorld ? "code" : "id"));
  elements.regions.replaceChildren(...terrainPaths(geometry, selectedKey, isWorld ? "code" : "id"));
  const relief = isWorld ? WORLD_RELIEF : HK_RELIEF;
  elements.reliefImage.setAttribute("href", relief);
  elements.reliefImage.setAttribute("width", viewbox.width);
  elements.reliefImage.setAttribute("height", viewbox.height);
  elements.reliefImage.setAttribute("preserveAspectRatio", "none");
  elements.terrainMap.querySelectorAll(".map-water-surface,.map-harbour-light,.map-base-grid,.map-base-micro-grid").forEach((rect) => {
    rect.setAttribute("width", viewbox.width); rect.setAttribute("height", viewbox.height);
  });
  const point = itemPoint(item);
  elements.viewport.style.setProperty("--mobile-relief", `url(\"${relief}\")`);
  elements.mobileRelief.src = relief;
  elements.viewport.style.setProperty("--mobile-map-aspect", `${viewbox.width} / ${viewbox.height}`);
  elements.mobileTarget.style.left = `${(point.x / viewbox.width) * 100}%`;
  elements.mobileTarget.style.top = `${(point.y / viewbox.height) * 100}%`;
  elements.mobileTarget.querySelector("span").textContent = item.zh;
  elements.mobileTarget.setAttribute("aria-label", `目前目標：${item.zh}`);
  renderMtrNetwork(item);
  renderAnnotations(item);
  elements.coordinateReadout.textContent = coordinateCopy(item);
  elements.viewport.classList.remove("is-acquiring");
  requestAnimationFrame(() => elements.viewport.classList.add("is-acquiring"));
  animateCamera(cameraFor(item));
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
      const shouldReveal = state.solved || state.usedFullReveal || revealed.has(letterIndex);
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
  elements.missionContext.textContent = state.edition === "world"
    ? "先由國旗和精確地圖位置辨認國家，再完成英文拼寫。"
    : currentFilter() === "Districts"
      ? "根據香港正式十八區邊界與地形位置，完成地區英文名稱。"
      : `沿 ${item.line} 的實際走線與車站位置，完成英文站名。`;
  elements.trap.textContent = state.trapVisible || state.solved ? item.trap : "首次嘗試後顯示常見錯法，避免未作答便看到答案。";
  elements.visualFrame.classList.add("is-switching");
  const world = state.edition === "world";
  elements.worldVisual.hidden = !world;
  elements.locationInset.toggleAttribute("hidden", world);
  elements.hkBadge.hidden = world;
  if (world) {
    elements.flag.src = `country-name-spelling-flags/${item.code}.svg`;
    elements.flag.alt = `${item.zh}國旗`;
    elements.visualLabel.textContent = "VISUAL IDENTIFICATION / 國旗辨認";
  } else {
    elements.locationInset.replaceChildren();
    elements.locationInset.setAttribute("viewBox", `0 0 ${HK_VIEWBOX.width} ${HK_VIEWBOX.height}`);
    if (currentFilter() === "Districts") {
      const shape = HK_BY_ID.get(item.id);
      const maskId = "mission-district-land-mask";
      const land = svgNode("g", { mask:`url(#${maskId})` });
      land.append(...terrainPaths(shape ? [shape] : HK_GEOMETRY, item.id, "id"));
      elements.locationInset.replaceChildren(hongKongLandMask(maskId), land);
      if (shape) elements.locationInset.setAttribute("viewBox", viewBoxString(pathBounds(shape.path)));
      elements.visualLabel.textContent = "DISTRICT SILHOUETTE / 區界辨認";
    } else {
      const context = svgNode("g", { class:"inset-districts" });
      context.append(...terrainPaths(HK_GEOMETRY, "", "id"));
      elements.locationInset.append(context);
      const linePoints = MTR_STATIONS.filter((station) => station.line === item.line).map(stationPoint);
      elements.locationInset.setAttribute("viewBox", viewBoxString(pointBounds(linePoints)));
      renderMtrNetwork(item, elements.locationInset, true);
      elements.visualLabel.textContent = "ROUTE INSET / 路線位置";
    }
  }
  requestAnimationFrame(() => elements.visualFrame.classList.remove("is-switching"));
  elements.answer.value = "";
  elements.answer.classList.remove("is-correct", "is-wrong");
  elements.feedback.className = "answer-feedback";
  elements.feedback.textContent = state.edition === "world"
    ? "辨認國旗及地圖位置，再輸入完整英文國名。"
    : currentFilter() === "Districts"
      ? "根據中文及香港地圖位置，輸入完整英文地區名稱。"
      : "根據中文及港鐵網絡位置，輸入完整英文站名。";
  elements.check.innerHTML = state.solved ? "NEXT TARGET <span aria-hidden=\"true\">›</span>" : "CHECK ANSWER <span aria-hidden=\"true\">›</span>";
  const failures = state.failures[progressId(item)] || 0;
  elements.hint.textContent = failures >= 3 ? "REVEAL FULL NAME" : "REVEAL ONE LETTER";
  renderLetterGrid(item);
}

function render() {
  const item = currentItem();
  if (!item) return;
  state.current[`${state.edition}:${currentFilter()}`] = item.id;
  elements.editionButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.edition === state.edition));
  elements.mapSequence.textContent = state.edition === "world" ? "// WORLD MAP 01" : "// HONG KONG GRID 02";
  elements.mapHeading.textContent = state.edition === "world"
    ? "Essential DSE & IELTS countries"
    : currentFilter() === "Districts" ? "Hong Kong 18 districts" : "Familiar MTR station names";
  buildFilters();
  renderMap(item);
  renderIdentity(item);
  renderStats(item);
  saveProgress();
}

function editDistance(left, right) {
  const a = normaliseAnswer(left);
  const b = normaliseAnswer(right);
  const row = Array.from({ length:b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const previous = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = previous;
    }
  }
  return row[b.length];
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
    state.failures[id] = 0;
    state.trapVisible = true;
    elements.answer.classList.remove("is-wrong");
    elements.answer.classList.add("is-correct");
    elements.feedback.textContent = `正確：${item.name}。再按一次即可前往下一個目標。`;
    elements.feedback.className = "answer-feedback is-correct";
    elements.check.innerHTML = "NEXT TARGET <span aria-hidden=\"true\">›</span>";
    renderLetterGrid(item);
    renderMap(item);
    renderStats(item);
  } else {
    state.streak = 0;
    state.trapVisible = true;
    const id = progressId(item);
    state.failures[id] = (state.failures[id] || 0) + 1;
    const nearest = [item.name, ...(item.aliases || [])].reduce((best, candidate) => Math.min(best, editDistance(value, candidate)), Infinity);
    elements.answer.classList.remove("is-correct");
    elements.answer.classList.add("is-wrong");
    elements.feedback.textContent = nearest <= 2
      ? "很接近。請檢查一至兩個字母、空格或詞尾，再試一次。"
      : "未正確。核對字母數目、地圖位置及下方常見錯法，再試一次。";
    elements.feedback.className = "answer-feedback is-wrong";
    elements.trap.textContent = item.trap;
    if (state.failures[id] >= 3) elements.hint.textContent = "REVEAL FULL NAME";
    renderStats(item);
  }
  saveProgress();
}

function revealLetter() {
  const item = currentItem();
  if (!item || state.solved) return;
  const answerLetters = [...item.name].filter((character) => /[a-z0-9]/i.test(character));
  const id = progressId(item);
  if ((state.failures[id] || 0) >= 3) {
    state.usedFullReveal = true;
    state.hints = (state.hints || 0) + 1;
    state.trapVisible = true;
    elements.trap.textContent = item.trap;
    elements.feedback.textContent = "已顯示完整名稱作為支援；本題仍須由你重新輸入，答對後才會計入掌握。";
    elements.feedback.className = "answer-feedback";
    renderLetterGrid(item);
    saveProgress();
    return;
  }
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
    elements.plane.style.setProperty("--map-ry", `${x * 2.2 - 1}deg`);
    elements.plane.style.setProperty("--map-rx", `${1.15 - y * 1.6}deg`);
  });
  elements.viewport.addEventListener("pointerleave", () => {
    elements.plane.style.setProperty("--map-ry", "-1deg");
    elements.plane.style.setProperty("--map-rx", "1.15deg");
  });
}

function initialiseGame() {
  gameReady = true;
  elements.editionButtons.forEach((button) => button.addEventListener("click", () => {
    state.edition = button.dataset.edition;
    mapCamera = null;
    state.solved = false;
    state.revealed = [];
    state.usedFullReveal = false;
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
