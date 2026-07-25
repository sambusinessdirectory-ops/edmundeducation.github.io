import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "flashcards.html"), "utf8");

for (const [index, match] of [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries()) {
  if (match[1].trim()) new vm.Script(match[1], { filename: `flashcards-inline-${index}.js` });
}

function sourceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

assert.match(source, /data-toggle-cumulative-progress aria-pressed="false">顯示累積總數/);
assert.match(source, /data-cumulative-legend hidden><i class="legend-dot legend-cumulative"><\/i>/);
assert.match(source, /let showCumulativeProgress = false;/, "the cumulative line must be off for its first release");
assert.match(source, /flashcardShowCumulativeProgress: Boolean\(nextVisible\)/);
assert.match(source, /showCumulativeProgress = preferences\.flashcardShowCumulativeProgress === true/);
assert.match(source, /chartKeys = showCumulativeProgress[\s\S]*?"cumulative"/);
assert.match(source, /stroke="#7e22ce"/);

const cumulativeSource = sourceBetween(
  "function appendCumulativeProgress(",
  "function compactDateLabel("
);
const appendCumulativeProgress = Function(`${cumulativeSource}; return appendCumulativeProgress;`)();
assert.deepEqual(
  appendCumulativeProgress([{ total: 300 }, { total: 0 }, { total: 250 }], 3_400).map(point => point.cumulative),
  [3_700, 3_700, 3_950],
  "the visible cumulative series must include totals from before the selected range"
);

const progressSeriesSource = sourceBetween(
  "function buildProgressSeries(",
  "function compactDateLabel("
);
const today = new Date();
today.setHours(12, 0, 0, 0);
const relativeDay = offset => {
  const value = new Date(today);
  value.setDate(value.getDate() + offset);
  return value.getTime();
};
const progressRows = [
  { time: relativeDay(-1), total: 2, green: 2, red: 0 },
  { time: relativeDay(0), total: 3, green: 1, red: 2 },
  { time: relativeDay(1), total: 999, green: 999, red: 0 }
];
const buildProgressSeries = Function("progressRows", `
  let selectedProgressRange = "all";
  const currentUser = { name: "Student" };
  const progressRowsForStudent = () => progressRows;
  const progressRangeStart = (_range, rows) => {
    const first = new Date(Math.min(...rows.map(row => row.time)));
    return new Date(first.getFullYear(), first.getMonth(), first.getDate());
  };
  const dayKey = value => {
    const date = new Date(value);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  };
  ${progressSeriesSource}
  return buildProgressSeries;
`)(progressRows);
const allRangeSeries = buildProgressSeries("all", "Student");
assert.equal(allRangeSeries.allTime.total, 5, "future-dated activity must not inflate the all-time total");
assert.equal(allRangeSeries.points.at(-1).cumulative, 5, "the cumulative endpoint must agree with the all-time total");

assert.match(source, /data-toggle-year-sort hidden aria-pressed="false">年份：由舊至新/);
assert.match(source, /flashcardYearSortDirection: normalizedDirection/);
assert.match(source, /yearSortDirection = preferences\.flashcardYearSortDirection === "desc" \? "desc" : "asc"/);
assert.match(source, /grid\.innerHTML = lastOptions\.htmlFactory\(\);\s*applyYearSortToOptions\(\);/s);

const sortSource = sourceBetween(
  "function optionYearSortValue(",
  "function applyYearSortToOptions("
);
const sortHelpers = Function(`let yearSortDirection = "asc"; ${sortSource}; return { optionYearSortValue, sortYearOptionRows };`)();
assert.equal(sortHelpers.optionYearSortValue("2025 DSE Paper 3"), 2025);
assert.equal(sortHelpers.optionYearSortValue("DSE Speaking · 2014 passage"), 2014);
assert.equal(sortHelpers.optionYearSortValue("Book 20251"), null, "a year must be a standalone four-digit number");
assert.equal(sortHelpers.optionYearSortValue("No year here"), null);

const rows = [
  { dataset: { optionLabel: "2025 DSE Paper 3" } },
  { dataset: { optionLabel: "General revision" } },
  { dataset: { optionLabel: "2012 Sample" } },
  { dataset: { optionLabel: "2014" } },
  { dataset: { optionLabel: "Teacher notes" } }
];
assert.deepEqual(
  sortHelpers.sortYearOptionRows(rows, "asc").map(row => row.dataset.optionLabel),
  ["2012 Sample", "General revision", "2014", "2025 DSE Paper 3", "Teacher notes"],
  "non-year rows must retain their original positions in a mixed column"
);
assert.deepEqual(
  sortHelpers.sortYearOptionRows(rows, "desc").map(row => row.dataset.optionLabel),
  ["2025 DSE Paper 3", "General revision", "2014", "2012 Sample", "Teacher notes"]
);

const questionRows = Array.from({ length: 20 }, (_, index) => ({
  dataset: { optionLabel: index < 3 ? `Essay question about ${2022 + index}` : `Essay question ${index + 1}` }
}));
assert.equal(
  sortHelpers.sortYearOptionRows(questionRows, "asc"),
  null,
  "a few incidental years in a long question list must not turn it into a year-sorted deck list"
);

console.log("Flashcard cumulative progress and year sorting checks passed.");
