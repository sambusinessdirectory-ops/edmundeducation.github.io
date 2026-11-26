import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const deckSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("../flashcards-jayden-test-november-2026-data.js", import.meta.url), "utf8"), deckSandbox);
globalThis.window = deckSandbox.window;

const {
  VOCABULARY,
  characterLabel,
  compactDeckLabel,
  createMask,
  isAnswerCorrect,
  letterPositions,
  searchMatches,
  searchTokens,
  selectRandomIds,
  selectRangeIds,
  summarizeAttempts,
  requiredCorrectTotal,
  testedPositionCount
} = await import("../spelling-practice-core.mjs?jayden-deck");

assert.equal(VOCABULARY.length, 183, "The spelling bank must contain every unique Jayden deck entry.");
assert.equal(new Set(VOCABULARY.map((entry) => entry.word)).size, VOCABULARY.length, "Spelling entries must be unique.");
assert.ok(VOCABULARY.every((entry) => entry.word && entry.meaning && entry.characters.length === [...entry.word].length), "Every word needs a meaning and character array.");
assert.equal(characterLabel("alien"), "a · l · i · e · n");
assert.equal(characterLabel("graphic novel"), "g · r · a · p · h · i · c · / · n · o · v · e · l");
assert.deepEqual(letterPositions("a b"), [0, 2], "Spaces must never become tested positions.");
assert.equal(testedPositionCount("alien", 50), 3, "Odd letter counts must round upward.");
assert.equal(testedPositionCount("ghosts", 50), 3);
assert.equal(testedPositionCount("alien", 100), 5);
assert.equal(createMask("alien", 50, () => 0).length, 3);
assert.ok(createMask("supernatural being", 100, () => 0).every((position) => position !== 12), "The phrase space must remain visible.");
assert.ok(VOCABULARY.some((entry) => entry.word === "landmines everywhere"), "Multi-word vocabulary must be available.");
assert.ok(VOCABULARY.some((entry) => entry.word === "it is important to note that…"), "Long phrase entries must be available.");
const audioSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("../spelling-jayden-audio-manifest.js", import.meta.url), "utf8"), audioSandbox);
assert.ok(VOCABULARY.every((entry) => audioSandbox.window.EDMUND_SPELLING_AUDIO[entry.word]), "Every spelling entry needs a mapped recording.");

const commonTrapSandbox = { window: { SPELLING_SELECTION_CATALOG: { libraries: [], decks: [], entries: [] } } };
vm.runInNewContext(fs.readFileSync(new URL("../spelling-common-traps-catalog.js", import.meta.url), "utf8"), commonTrapSandbox);
vm.runInNewContext(fs.readFileSync(new URL("../spelling-common-traps-audio-manifest.js", import.meta.url), "utf8"), commonTrapSandbox);
const commonTrapWords = new Set(commonTrapSandbox.window.SPELLING_SELECTION_CATALOG.entries.map((entry) => entry.word));
assert.equal(commonTrapWords.size, 494, "Common Spelling Traps must retain all unique terms.");
assert.ok([...commonTrapWords].every((word) => commonTrapSandbox.window.EDMUND_COMMON_TRAPS_AUDIO[word]), "Every Common Spelling Traps term needs a mapped recording.");
assert.equal(commonTrapSandbox.window.EDMUND_COMMON_TRAPS_AUDIO_META.voice, "af_heart", "Common traps must use the American female Kokoro voice.");
assert.equal(requiredCorrectTotal(10, 2), 20);
assert.equal(isAnswerCorrect("alien", { 0: "A", 2: "i", 4: "n" }), true, "Checking must be case-insensitive.");
assert.equal(isAnswerCorrect("alien", { 0: "e", 2: "i", 4: "n" }), false);
assert.equal(compactDeckLabel("Model Essay 20 - IELTS - Cause _ Solution Type - (Band 9 示範) - Task 2"), "Model Essay 20");
assert.equal(searchMatches("Model Essay 20 - Problem and Cause 問題與成因題", searchTokens("essay 20 成因")), true);
assert.deepEqual(selectRangeIds(["a", "b", "c", "d"], 2, 2), ["b", "c"]);
const randomSelection = selectRandomIds(["a", "b", "c", "d"], 3, () => 0);
assert.equal(randomSelection.length, 3);
assert.equal(new Set(randomSelection).size, 3);
const attemptRecords = summarizeAttempts([
  { at: 10, wordId: "sp-001", word: "alien", answer: "alein", correct: false },
  { at: 20, wordId: "sp-001", word: "alien", answer: "alien", correct: true },
  { at: 30, wordId: "sp-002", word: "ghost", answer: "gost", correct: false }
]);
assert.deepEqual({ correct: attemptRecords.get("sp-001").correctCount, wrong: attemptRecords.get("sp-001").wrongCount }, { correct: 1, wrong: 1 });
assert.ok(attemptRecords.get("sp-001").lastCorrectAt > attemptRecords.get("sp-001").lastWrongAt, "A later correct answer must resolve a wrong record.");

const masks = new Set(Array.from({ length: 60 }, () => createMask("alien", 50).join(",")));
assert.ok(masks.size > 1, "Repeated presentations must support randomized masks.");

console.log(`PASS: ${VOCABULARY.length} unique words and phrases, character splitting, randomized masking, upward rounding and correct-only totals.`);
