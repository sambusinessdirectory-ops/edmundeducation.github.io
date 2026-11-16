import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const deckSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("../flashcards-jayden-test-november-2026-data.js", import.meta.url), "utf8"), deckSandbox);
globalThis.window = deckSandbox.window;

const {
  VOCABULARY,
  characterLabel,
  createMask,
  isAnswerCorrect,
  letterPositions,
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
assert.equal(requiredCorrectTotal(10, 2), 20);
assert.equal(isAnswerCorrect("alien", { 0: "A", 2: "i", 4: "n" }), true, "Checking must be case-insensitive.");
assert.equal(isAnswerCorrect("alien", { 0: "e", 2: "i", 4: "n" }), false);

const masks = new Set(Array.from({ length: 60 }, () => createMask("alien", 50).join(",")));
assert.ok(masks.size > 1, "Repeated presentations must support randomized masks.");

console.log(`PASS: ${VOCABULARY.length} unique words and phrases, character splitting, randomized masking, upward rounding and correct-only totals.`);
