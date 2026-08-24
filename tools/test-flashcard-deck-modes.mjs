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
const greenOnlyPosition = modesMarkup.indexOf('data-start-mode="green-only"');
const firstRangePosition = modesMarkup.indexOf('data-start-mode="range"');
assert.ok(fortyCardPosition >= 0 && redOnlyPosition > fortyCardPosition && greenOnlyPosition > redOnlyPosition && greenOnlyPosition < firstRangePosition);
assert.match(modesMarkup, /class="mode-card status-mode-red"[^>]*data-start-mode="red-only">\s*只練習紅卡\s*<span>只練習這個卡組內目前標記為紅叉的卡片。<\/span>/s);
assert.match(modesMarkup, /class="mode-card status-mode-green"[^>]*data-start-mode="green-only">\s*只練習綠卡\s*<span>只練習這個卡組內目前標記為綠勾的卡片；答錯後會轉為紅叉。<\/span>/s);
assert.match(source, /\.mode-card\.status-mode-red[\s\S]*?#fff1f2[\s\S]*?#fecdd3/);
assert.match(source, /\.mode-card\.status-mode-green[\s\S]*?#f0fdf4[\s\S]*?#bbf7d0/);

const rangePattern = /data-start-mode="range" data-range-start="(\d+)"(?: data-range-end="(\d+)")? data-range-label="([^"]+)"/g;
function rangesFromMarkup(markup) {
  return [...markup.matchAll(rangePattern)].map(match => ({
    start: Number(match[1]),
    end: match[2] ? Number(match[2]) : 0,
    label: match[3]
  }));
}

function assertContiguousRanges(ranges, message) {
  for (let index = 1; index < ranges.length; index += 1) {
    assert.equal(ranges[index].start, ranges[index - 1].end + 1, message);
  }
}

const thirtyRangeMarkup = sourceBetween(
  '<div class="mode-block" data-range-section="30">',
  '<div class="mode-block" data-range-section="10">'
);
const tenRangeMarkup = sourceBetween(
  '<div class="mode-block" data-range-section="10">',
  '<section class="deck-card hidden" data-deck-view>'
);
const actualThirtyRanges = rangesFromMarkup(thirtyRangeMarkup);
const expectedThirtyRanges = [
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
assert.deepEqual(actualThirtyRanges, expectedThirtyRanges);
assertContiguousRanges(actualThirtyRanges, "30-card ranges must not overlap or leave gaps");
assert.doesNotMatch(thirtyRangeMarkup, /data-range-start="21"|21-60 張卡/);

const expectedTenRanges = Array.from({ length: 20 }, (_, index) => {
  const start = (index * 10) + 1;
  const end = start + 9;
  return { start, end, label: `第 ${start}–${end} 項` };
}).concat({ start: 201, end: 0, label: "其餘項目" });
const actualTenRanges = rangesFromMarkup(tenRangeMarkup);
assert.deepEqual(actualTenRanges, expectedTenRanges);
assertContiguousRanges(actualTenRanges, "10-item ranges must not overlap or leave gaps");
actualTenRanges.slice(0, -1).forEach(range => {
  assert.equal(range.end - range.start + 1, 10, `${range.label} must contain exactly 10 items`);
});
const visibleTenRangeLabels = [...tenRangeMarkup.matchAll(/data-range-label="([^"]+)">\s*([^<]+)\s*<span>/g)]
  .map(match => match[2].trim());
assert.deepEqual(visibleTenRangeLabels, expectedTenRanges.map(range => range.label));
assert.equal((tenRangeMarkup.match(/class="mode-card range-card"/g) || []).length, 21);
assert.match(source, /\[data-range-section="10"\] \.mode-card\.range-card:not\(:disabled\) \{[\s\S]*?#fde047[\s\S]*?#facc15[\s\S]*?#eab308/);
assert.match(source, /\[data-range-section="10"\] \.mode-card\.range-card:not\(:disabled\) span \{\s*color: #713f12;/);
assert.match(source, /\.mode-card:disabled,\s*\.mode-card\.range-card:disabled \{[\s\S]*?#d7dde6[\s\S]*?#b7c1cf/);

const refreshDeckStartPanel = sourceBetween("function refreshDeckStartPanel()", "function openDeckStart(");
assert.match(refreshDeckStartPanel, /querySelectorAll\("\[data-deck-start\] \[data-start-mode='range'\]"\)/);
assert.match(refreshDeckStartPanel, /button\.disabled = count === 0 \|\| rangeStart > count;/);
const rangeHelperSource = sourceBetween("function cardIndexesForRange(", "function isDeckRangeFullyGreen(");
const cardIndexesForRange = Function(`${rangeHelperSource}; return cardIndexesForRange;`)();
assert.deepEqual(cardIndexesForRange(7, 1, 10), [0, 1, 2, 3, 4, 5, 6]);
assert.deepEqual(cardIndexesForRange(15, 11, 20), [10, 11, 12, 13, 14]);
assert.deepEqual(cardIndexesForRange(200, 191, 200), Array.from({ length: 10 }, (_, index) => index + 190));
assert.deepEqual(cardIndexesForRange(200, 201, 0), []);
assert.deepEqual(cardIndexesForRange(201, 201, 0), [200]);
assert.deepEqual(cardIndexesForRange(205, 201, 0), [200, 201, 202, 203, 204]);
assert.deepEqual(cardIndexesForRange(237, 201, 0), Array.from({ length: 37 }, (_, index) => index + 200));
assert.deepEqual(cardIndexesForRange(30, 31, 40), []);
const rangeCompletionSource = sourceBetween("function isDeckRangeFullyGreen(", "function setSession(");
assert.match(rangeCompletionSource, /cardIndexesForRange\(cards\.length, rangeStart, rangeEnd\)/);
const startDeckSessionRange = sourceBetween("function startDeckSession(", "function startRedCrossSession(");
assert.match(startDeckSessionRange, /order = cardIndexesForRange\(cards\.length, rangeStart, rangeEnd\);/);

const modeLabel = sourceBetween("function modeLabel(", "function hideReviewPanel()");
assert.match(modeLabel, /if \(mode === "red-only"\) return "只練習紅卡";/);
assert.match(modeLabel, /if \(mode === "green-only"\) return "只練習綠卡";/);

const filterHelperSource = sourceBetween("function cardIndexesWithStatus(", "function modeLabel(");
const cardIndexesWithStatus = Function(`${filterHelperSource}; return cardIndexesWithStatus;`)();
assert.deepEqual(cardIndexesWithStatus([0, 1, 2, 3, 4, 5, 6], [5, "1", 5, 99]), [1, 5]);
assert.deepEqual(cardIndexesWithStatus([0, 1, 2], []), []);
assert.deepEqual(cardIndexesWithStatus([0, 1, 2], null), []);

const startDeckSession = sourceBetween("function startDeckSession(", "function startRedCrossSession(");
assert.match(startDeckSession, /if \(mode === "red-only"\) \{/);
assert.match(startDeckSession, /cardIndexesWithStatus\(allIndexes, getDeckFamiliarity\(currentDeckId\)\.red\)/);
assert.match(startDeckSession, /這個卡組目前未有紅叉卡片。/);
assert.match(startDeckSession, /if \(mode === "green-only"\) \{/);
assert.match(startDeckSession, /cardIndexesWithStatus\(allIndexes, getDeckFamiliarity\(currentDeckId\)\.green\)/);
assert.match(startDeckSession, /這個卡組目前未有綠勾卡片。/);
assert.match(startDeckSession, /if \(!order\.length\) \{[\s\S]*?return;[\s\S]*?\}/);

const markCard = sourceBetween("function markCard(result)", "function handleCardPrimaryAction");
assert.match(markCard, /setCardFamiliarity\(sourceIndex, result, sourceDeckId\)/, "green-only answers must use the normal durable familiarity path");
const familiaritySetter = sourceBetween("function setCardFamiliarity(", "function cardNoteStorageKey(");
assert.match(familiaritySetter, /familiarity\.green = familiarity\.green\.filter\(index => index !== key\)/);
assert.match(familiaritySetter, /familiarity\.red = familiarity\.red\.filter\(index => index !== key\)/);
assert.match(familiaritySetter, /familiarity\[status\]\.push\(key\)/);
assert.match(familiaritySetter, /saveDeckFamiliarity\(deckId, familiarity\)/, "a wrong green-only answer must replace green with red and persist it");
let savedFamiliarity = null;
const setCardFamiliarity = Function("getDeckFamiliarity", "saveDeckFamiliarity", `
  const currentUser = { name: "Student" };
  let currentDeckId = "deck-a";
  ${familiaritySetter}
  return setCardFamiliarity;
`)(
  () => ({ green: ["1", "2"], red: ["3"] }),
  (_deckId, value) => { savedFamiliarity = value; }
);
setCardFamiliarity(1, "red", "deck-a");
assert.deepEqual(savedFamiliarity, { green: ["2"], red: ["3", "1"] }, "a failed answer in green-only mode must immediately downgrade the card to red");
const familiarityPersistence = sourceBetween("function saveFamiliarityStore(", "function getCardNotesStore(");
assert.match(familiarityPersistence, /writeJson\(FAMILIARITY_KEY, store\)/, "familiarity changes must enter the synchronized state writer");
const familiarityDeckWriter = sourceBetween("function saveDeckFamiliarity(", "function setCardFamiliarity(");
assert.match(familiarityDeckWriter, /cachePendingFamiliarityDeck\(deckKey, normalized\)/, "familiarity changes need an account-scoped local recovery copy before the durable outbox write");

const stateCacheIsolation = sourceBetween("function clearFlashcardSyncedStateCache(", "function familiarityPendingLocalKey(");
assert.match(stateCacheIsolation, /if \(!legacySyncQuarantineReady\)/, "identity transitions must fail closed until legacy state is quarantined");
assert.match(stateCacheIsolation, /flashcardStagedValues\.clear\(\)/);
assert.match(stateCacheIsolation, /flashcardStateVersions\.clear\(\)/);
assert.match(stateCacheIsolation, /flashcardStateChecksums\.clear\(\)/);
assert.match(stateCacheIsolation, /supabaseState\.hydratedOwner = ""/);
assert.match(stateCacheIsolation, /delete remoteStore\[key\]/);
assert.match(stateCacheIsolation, /localStorage\.removeItem\(key\)/);
const sessionSetter = sourceBetween("function setSession(user)", "function clearSession()");
assert.match(sessionSetter, /clearFlashcardSyncedStateCache\(\)/, "every identity transition must discard the previous account cache");
const sessionClearer = sourceBetween("function clearSession()", "function restoreSession()");
assert.match(sessionClearer, /clearFlashcardSyncedStateCache\(\)/, "logout must discard synchronized account state");

const pendingOutbox = sourceBetween("function familiarityPendingLocalKey(", "function readJson(");
assert.match(pendingOutbox, /FAMILIARITY_PENDING_LOCAL_PREFIX/);
assert.match(pendingOutbox, /function cachePendingFamiliarityDeck/);
assert.match(pendingOutbox, /function clearSyncedPendingFamiliarity/);
assert.match(pendingOutbox, /function restorePendingFamiliarity/);

const saveContextSource = sourceBetween("function captureSupabaseStateSaveContext(", "function isSupabaseStateHydrated(");
assert.match(saveContextSource, /type: "student"[\s\S]*?token: studentSessionToken/);
assert.match(saveContextSource, /type: "admin"[\s\S]*?adminPassword: adminPasswordForSession/);
assert.match(saveContextSource, /epoch: supabaseState\.epoch/, "save ownership must be bound to the current synchronization epoch");

const mutationWriter = sourceBetween("async function writeJson(", "function advanceFlashcardSyncEpoch(");
assert.match(mutationWriter, /if \(!flashcardMutationAllowed\(context, key\)\)/);
assert.match(mutationWriter, /flashcardStagedValues\.set/);
assert.match(mutationWriter, /await enqueueFlashcardOutboxMutation\(mutation\)/);
assert.ok(
  mutationWriter.indexOf("await enqueueFlashcardOutboxMutation(mutation)") < mutationWriter.indexOf("remoteStore[key] = payload", mutationWriter.indexOf("await enqueueFlashcardOutboxMutation(mutation)")),
  "a synchronized value must reach the durable IndexedDB outbox before becoming canonical browser state"
);

const saveStateSource = sourceBetween("async function saveSupabaseState(", "function displayPreferenceOwner(");
assert.match(saveStateSource, /const context = options\.context \|\| captureSupabaseStateSaveContext\(\)/);
assert.match(saveStateSource, /flashcardMutationAllowed\(context, key\)/);
assert.match(saveStateSource, /isSupabaseStateContextCurrent\(context\)/);
assert.match(saveStateSource, /createFlashcardOutboxMutation\(key, value, context\)/);
assert.match(saveStateSource, /await enqueueFlashcardOutboxMutation\(mutation\)/);
assert.match(saveStateSource, /await drainFlashcardOutbox/);

assert.match(
  source,
  /@supabase\/supabase-js@2\.110\.8\/dist\/umd\/supabase\.js" integrity="sha384-[^"]+" crossorigin="anonymous"/,
  "the integrity-sensitive client must not load a floating Supabase JavaScript release"
);

console.log("Flashcard deck range, red-card, green-card and durable persistence checks passed.");
