import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "flashcards.html"), "utf8");

function sourceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

const modesMarkup = sourceBetween('<section class="deck-card hidden" data-deck-start>', '<section class="deck-card hidden" data-deck-view>');
const fortyCardPosition = modesMarkup.indexOf('data-card-limit="40"');
const redOnlyPosition = modesMarkup.indexOf('data-start-mode="red-only"');
const firstRangePosition = modesMarkup.indexOf('data-start-mode="range"');
assert.ok(fortyCardPosition >= 0 && redOnlyPosition > fortyCardPosition && redOnlyPosition < firstRangePosition);
assert.match(modesMarkup, /data-start-mode="red-only">\s*只練習紅卡\s*<span>只練習這個卡組內目前標記為紅叉的卡片。<\/span>/s);

const rangePattern = /data-start-mode="range" data-range-start="(\d+)"(?: data-range-end="(\d+)")? data-range-label="([^"]+)"/g;
const actualRanges = [...modesMarkup.matchAll(rangePattern)].map(match => ({
  start: Number(match[1]),
  end: match[2] ? Number(match[2]) : 0,
  label: match[3]
}));
const expectedRanges = [
  { start: 1, end: 30, label: "1-30 張卡" },
  { start: 31, end: 60, label: "31-60 張卡" },
  { start: 61, end: 90, label: "61-90 張卡" },
  { start: 91, end: 120, label: "91-120 張卡" },
  { start: 121, end: 150, label: "121-150 張卡" },
  { start: 151, end: 180, label: "151-180 張卡" },
  { start: 181, end: 210, label: "181-210 張卡" },
  { start: 211, end: 240, label: "211-240 張卡" },
  { start: 241, end: 270, label: "241-270 張卡" },
  { start: 271, end: 300, label: "271-300 張卡" },
  { start: 301, end: 0, label: "餘下卡片" }
];
assert.deepEqual(actualRanges, expectedRanges);
for (let index = 1; index < actualRanges.length; index += 1) {
  assert.equal(actualRanges[index].start, actualRanges[index - 1].end + 1, "Card ranges must not overlap or leave gaps");
}
assert.doesNotMatch(modesMarkup, /data-range-start="21"|21-60 張卡/);

const modeLabel = sourceBetween("function modeLabel(", "function hideReviewPanel()");
assert.match(modeLabel, /if \(mode === "red-only"\) return "只練習紅卡";/);

const filterHelperSource = sourceBetween("function cardIndexesWithStatus(", "function modeLabel(");
const cardIndexesWithStatus = Function(`${filterHelperSource}; return cardIndexesWithStatus;`)();
assert.deepEqual(cardIndexesWithStatus([0, 1, 2, 3, 4, 5, 6], [5, "1", 5, 99]), [1, 5]);
assert.deepEqual(cardIndexesWithStatus([0, 1, 2], []), []);
assert.deepEqual(cardIndexesWithStatus([0, 1, 2], null), []);

const startDeckSession = sourceBetween("function startDeckSession(", "function startRedCrossSession(");
assert.match(startDeckSession, /if \(mode === "red-only"\) \{/);
assert.match(startDeckSession, /cardIndexesWithStatus\(allIndexes, getDeckFamiliarity\(currentDeckId\)\.red\)/);
assert.match(startDeckSession, /這個卡組目前未有紅叉卡片。/);
assert.match(startDeckSession, /if \(!order\.length\) \{[\s\S]*?return;[\s\S]*?\}/);

const saveContextSource = sourceBetween("function captureSupabaseStateSaveContext(", "function queueSupabaseStateSave(");
assert.match(saveContextSource, /type: "student"[\s\S]*?token: studentSessionToken/);
assert.match(saveContextSource, /type: "admin"[\s\S]*?adminPassword: adminPasswordForSession/);
assert.match(saveContextSource, /function supabaseStateSaveTimerKey\(key, context\)/);
const timerKeyHelper = Function(`${saveContextSource}; return supabaseStateSaveTimerKey;`)();
assert.notEqual(
  timerKeyHelper("edmundFlashcardFamiliarity", { owner: "student:a" }),
  timerKeyHelper("edmundFlashcardFamiliarity", { owner: "student:b" }),
  "different accounts must never share a debounce timer"
);

const queueSaveSource = sourceBetween("function queueSupabaseStateSave(", "async function saveSupabaseState(");
assert.match(queueSaveSource, /const context = captureSupabaseStateSaveContext\(\)/);
assert.match(queueSaveSource, /const timerKey = supabaseStateSaveTimerKey\(key, context\)/);
assert.match(queueSaveSource, /saveSupabaseState\(key, value, \{ context \}\)/);

const saveStateSource = sourceBetween("async function saveSupabaseState(", "function displayPreferenceOwner(");
assert.match(saveStateSource, /const context = options\.context \|\| captureSupabaseStateSaveContext\(\)/);
assert.match(saveStateSource, /p_token: context\.token/);
assert.match(saveStateSource, /p_student_name: context\.studentName/);
assert.doesNotMatch(saveStateSource, /p_token: studentSessionToken/);
assert.doesNotMatch(saveStateSource, /p_student_name: currentUser\.name/);

console.log("Flashcard deck range and red-card mode checks passed.");
