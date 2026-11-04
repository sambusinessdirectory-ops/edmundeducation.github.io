const WORLD_EDITIONS = new Set(["world", "hong-kong"]);
const WORLD_MODES = new Set(["Country names", "Country adjectives"]);
const WORLD_FILTERS = new Set(["All", "Europe", "Asia", "Americas", "Africa", "Oceania", "Challenge!", "Oceans"]);
const HONG_KONG_FILTERS = new Set(["Districts", "MTR stations"]);

export const COUNTRY_SPELLING_PROGRESS_SCHEMA = 3;

export function createDefaultCountrySpellingProgress() {
  return {
    schemaVersion: COUNTRY_SPELLING_PROGRESS_SCHEMA,
    edition: "world",
    worldMode: "Country names",
    filters: { world: "All", "hong-kong": "Districts" },
    current: {},
    attempts: 0,
    correct: 0,
    streak: 0,
    mastered: [],
    hints: 0,
    failures: {},
    solved: false,
    revealed: [],
    usedFullReveal: false,
    trapVisible: false,
    showMasteredMap: true,
    updatedAt: 0
  };
}

function safeInteger(value, fallback = 0, maximum = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) return fallback;
  return Math.min(number, maximum);
}

function safeStringMap(value, maximumKeys = 700) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  for (const [key, entry] of Object.entries(value).slice(0, maximumKeys)) {
    if (typeof key !== "string" || key.length > 180 || typeof entry !== "string" || entry.length > 180) continue;
    result[key] = entry;
  }
  return result;
}

function safeFailureMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  for (const [key, entry] of Object.entries(value).slice(0, 700)) {
    if (typeof key !== "string" || key.length > 180) continue;
    result[key] = safeInteger(entry, 0, 10000);
  }
  return result;
}

function uniqueStrings(value, maximum = 700) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((entry) => typeof entry === "string" && entry.length <= 180))].slice(0, maximum);
}

export function normaliseCountrySpellingProgress(value) {
  const fallback = createDefaultCountrySpellingProgress();
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const worldFilter = WORLD_FILTERS.has(source.filters?.world) ? source.filters.world : fallback.filters.world;
  const hongKongFilter = HONG_KONG_FILTERS.has(source.filters?.["hong-kong"])
    ? source.filters["hong-kong"]
    : fallback.filters["hong-kong"];
  const revealed = Array.isArray(source.revealed)
    ? [...new Set(source.revealed.map((entry) => safeInteger(entry, -1, 200)).filter((entry) => entry >= 0))]
    : [];
  return {
    schemaVersion: COUNTRY_SPELLING_PROGRESS_SCHEMA,
    edition: WORLD_EDITIONS.has(source.edition) ? source.edition : fallback.edition,
    worldMode: WORLD_MODES.has(source.worldMode) ? source.worldMode : fallback.worldMode,
    filters: { world: worldFilter, "hong-kong": hongKongFilter },
    current: safeStringMap(source.current),
    attempts: safeInteger(source.attempts),
    correct: safeInteger(source.correct),
    streak: safeInteger(source.streak),
    mastered: uniqueStrings(source.mastered),
    hints: safeInteger(source.hints),
    failures: safeFailureMap(source.failures),
    solved: source.solved === true,
    revealed,
    usedFullReveal: source.usedFullReveal === true,
    trapVisible: source.trapVisible === true,
    showMasteredMap: source.showMasteredMap !== false,
    updatedAt: safeInteger(source.updatedAt)
  };
}

export function mergeCountrySpellingProgress(serverValue, localValue) {
  const server = normaliseCountrySpellingProgress(serverValue);
  const local = normaliseCountrySpellingProgress(localValue);
  const newest = local.updatedAt >= server.updatedAt ? local : server;
  const failures = { ...server.failures };
  for (const [key, count] of Object.entries(local.failures)) {
    failures[key] = Math.max(failures[key] || 0, count);
  }
  return normaliseCountrySpellingProgress({
    ...newest,
    current: { ...server.current, ...local.current },
    attempts: Math.max(server.attempts, local.attempts),
    correct: Math.max(server.correct, local.correct),
    streak: newest.streak,
    hints: Math.max(server.hints, local.hints),
    mastered: [...server.mastered, ...local.mastered],
    failures,
    updatedAt: Math.max(server.updatedAt, local.updatedAt)
  });
}

export function countrySpellingLocalKey(studentId) {
  const safeId = String(studentId || "").trim().replace(/[^a-z0-9-]/gi, "").slice(0, 80);
  return safeId ? `edmund-country-name-spelling-progress-v3:${safeId}` : "";
}

export function countrySpellingStatesEqual(left, right) {
  return JSON.stringify(normaliseCountrySpellingProgress(left)) === JSON.stringify(normaliseCountrySpellingProgress(right));
}
