import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "speaking-system.js"), "utf8");
const css = readFileSync(path.join(siteDir, "speaking-system.css"), "utf8");
const worker = readFileSync(path.join(siteDir, "workers/speaking-system/src/index.js"), "utf8");

function sourceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

assert.match(source, /const PROGRESS_PREFERENCES_KEY = "edmundSpeakingProgressPreferencesV1";/);
assert.match(source, /progressShowCumulative: false/);
assert.match(source, /showCumulative: state\.progressShowCumulative/);
assert.match(source, /preferences\.showCumulative === true/);
assert.match(source, /data-speaking-progress-dashboard aria-label="\$\{state\.user\?\.role === "admin" \? "所有學生錄音進展" : "我的錄音進展"\}"/);
assert.match(source, /data-toggle-speaking-cumulative/);
assert.match(source, /stroke="#7e22ce"/);
assert.match(source, /data-speaking-progress-day=/);
assert.match(source, /data-close-speaking-progress-day/);
assert.match(source, /loadSpeakingProgressDashboard\(\);/);
assert.match(source, /state\.progressController\?\.abort\(\);\s*state\.progressController = null;\s*state\.progressRequestGeneration \+= 1;\s*state\.progressOwner = owner;/s);
assert.match(source, /if \(!point\.daily\) return "";/, "zero-activity dates must not add thousands of keyboard tab stops to an all-time chart");
assert.match(source, /role="group" aria-label="每日 Speaking 錄音進度圖/);
assert.match(source, /data-speaking-progress-range="\$\{value\}" aria-pressed="\$\{state\.progressRange === value\}"/);
assert.match(source, /rawTotal === null \|\| rawTotal === undefined \|\| rawTotal === ""/, "a null total must not be coerced to zero and truncate pagination");
assert.match(source, /const attemptsById = new Map\(\)/, "overlapping pages must not double-count a recording");

const seriesSource = sourceBetween(
  "function speakingProgressDayKey(",
  "function speakingProgressNiceMaximum("
);
const helpers = Function(`
  const state = { progressRange: "month" };
  const pad = (value, length = 2) => String(value).padStart(length, "0");
  ${seriesSource}
  return { speakingProgressDayKey, buildSpeakingProgressSeries };
`)();
const localIso = (year, month, day) => new Date(year, month - 1, day, 12, 0, 0).toISOString();
const now = new Date(2026, 6, 26, 12, 0, 0);
const attempts = [
  { createdAt: localIso(2026, 7, 1) },
  { createdAt: localIso(2026, 7, 1) },
  { createdAt: localIso(2026, 7, 25) },
  { createdAt: localIso(2026, 7, 25) },
  { createdAt: localIso(2026, 7, 26) },
  { createdAt: "" },
  { createdAt: localIso(2026, 8, 1) }
];
const series = helpers.buildSpeakingProgressSeries(attempts, "week", now);
assert.equal(series.points.length, 7);
assert.equal(series.visibleTotal, 3);
assert.equal(series.allTime, 5, "invalid and future recordings must not be counted");
assert.equal(series.cumulativeBeforeStart, 2);
assert.equal(series.points.at(-2).daily, 2);
assert.equal(series.points.at(-1).daily, 1);
assert.equal(series.points.at(-1).cumulative, 5);

const paginationSource = sourceBetween(
  "async function listAttempts(",
  "function normaliseExamAttempt("
);
const pageCalls = [];
const pages = new Map([
  [1, { recordings: Array.from({ length: 200 }, (_, index) => ({ id: `id-${index}` })), total: null }],
  [2, { recordings: [{ id: "id-199" }, { id: "id-200" }], total: null }]
]);
const listAttempts = Function(
  "CONFIG", "state", "apiJson", "normaliseAttempt",
  `${paginationSource}; return listAttempts;`
)(
  { endpoints: { recordings: "/v1/recordings" } },
  { user: { role: "student" } },
  async url => {
    const page = Number(new URL(url, "https://example.test").searchParams.get("page"));
    pageCalls.push(page);
    return pages.get(page) || { recordings: [], total: null };
  },
  (row, index) => ({ id: String(row.id || index), createdAt: "2026-07-26T00:00:00Z" })
);
const paginated = await listAttempts();
assert.deepEqual(pageCalls, [1, 2], "a null total must continue until a short page is received");
assert.equal(paginated.attempts.length, 201, "a duplicate row at a page boundary must be counted once");

assert.match(worker, /storage_state: "eq\.ready"/, "the dashboard source endpoint must exclude uploading, failed, deleting, and deleted recordings");
assert.match(css, /\.speaking-progress-dashboard/);
assert.match(css, /\.speaking-chart-hover:hover \.speaking-chart-tooltip/);
assert.match(css, /\.speaking-progress-tab\.cumulative/);

console.log("Speaking recording progress dashboard checks passed.");
