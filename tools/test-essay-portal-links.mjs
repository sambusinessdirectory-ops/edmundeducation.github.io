import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const context = {
  window: { location: { search: "?essay=advantage-disadvantage%3A2" } },
  URLSearchParams
};
vm.createContext(context);
vm.runInContext(read("essay-portal-links.js"), context, { filename: "essay-portal-links.js" });
const portals = context.window.EDMUND_ESSAY_PORTALS;

assert.equal(portals.requestedKey(), "advantage-disadvantage:2");
assert.equal(
  portals.flashDeckId("advantage-disadvantage:2"),
  "ielts/writing/task-2/advantage-and-disadvantage/EdmundBd9AdDisAd-Q2"
);
assert.equal(
  portals.writingExerciseId("advantage-disadvantage:2"),
  "model-essay-2-ielts-advantage-disadvantage"
);
assert.equal(
  portals.fromFlashDeckId("ielts/writing/task-2/opinions/EdmundBd9OP-Q106"),
  "opinion:106"
);
assert.equal(portals.fromWritingExerciseId("model-essay-43-ielts-discuss-both-views"), "discuss-both-views:43");
assert.equal(portals.hasWritingPractice("opinion:102"), false);
assert.equal(portals.hasWritingPractice("opinion:103"), true);
assert.equal(portals.hasFlashcards("opinion:55"), false);
assert.equal(portals.hasFlashcards("direct-question:26"), false);
assert.equal(portals.hasFlashcards("advantage-disadvantage:2"), true);

const writingFiles = fs.readdirSync(root).filter(file => /^writing-practice-model-essay.*-data\.js$/.test(file));
const writingKeys = new Set(writingFiles.flatMap(file => [
  ...read(file).matchAll(/"id":\s*"(model-essay-\d+-ielts-(?:advantage-disadvantage|opinion|discuss-both-views|cause-solution|direct-question))"/g)
].map(match => portals.fromWritingExerciseId(match[1])).filter(Boolean)));

for (const category of Object.keys(portals.categories)) {
  for (let number = 1; number <= 120; number += 1) {
    const key = portals.key(category, number);
    assert.equal(portals.hasWritingPractice(key), writingKeys.has(key), `Writing availability mismatch for ${key}`);
  }
}

const catalogContext = { window: {} };
vm.createContext(catalogContext);
vm.runInContext(read("ielts-task2-model-essays.js"), catalogContext, { filename: "ielts-task2-model-essays.js" });
const essays = catalogContext.window.EDMUND_MODEL_ESSAYS;
assert.equal(essays.length, 238);
assert.equal(new Set(essays.map(item => portals.fromDownloadItem(item))).size, 238);

const flashDataContext = { window: {} };
vm.createContext(flashDataContext);
vm.runInContext(read("flashcards-ielts-writing-data.js"), flashDataContext, { filename: "flashcards-ielts-writing-data.js" });
const flashCatalog = flashDataContext.window.EDMUND_IELTS_WRITING_TASK2;
for (const essay of essays) {
  const essayKey = portals.fromDownloadItem(essay);
  const target = portals.parts(essayKey);
  const expectedRef = `${target.definition.flashRef}-Q${target.number}`;
  assert.ok(
    flashCatalog[target.definition.flashType]?.some(item => item.ref === expectedRef),
    `Missing Flash Cards deck for ${essayKey}`
  );
}

const flashHtml = read("flashcards.html");
const seedStart = flashHtml.indexOf("window.EDMUND_FLASHCARD_SEED = {");
const seedEnd = flashHtml.indexOf("\n};\n  </script>", seedStart);
assert.ok(seedStart >= 0 && seedEnd > seedStart, "Inline Flash Cards seed not found");
const seedContext = { window: {} };
vm.createContext(seedContext);
vm.runInContext(flashHtml.slice(seedStart, seedEnd + 3), seedContext, { filename: "flashcards-inline-seed.js" });
for (const file of [
  "flashcards-ielts-writing-advantage-cause-direct-data.js",
  "flashcards-ielts-writing-express-4-31-data.js",
  "flashcards-ielts-writing-opinions-3-38-express-32-43-data.js",
  "flashcards-ielts-writing-opinions-39-82-data.js"
]) {
  vm.runInContext(read(file), seedContext, { filename: file });
}
const realSeed = seedContext.window.EDMUND_FLASHCARD_SEED || {};
const availableFlashKeys = new Set(Object.entries(realSeed)
  .filter(([deckId, cards]) => deckId.startsWith("ielts/writing/task-2/") && Array.isArray(cards) && cards.length > 0)
  .map(([deckId]) => portals.fromFlashDeckId(deckId))
  .filter(Boolean));
for (const essay of essays) {
  const essayKey = portals.fromDownloadItem(essay);
  assert.equal(
    portals.hasFlashcards(essayKey),
    availableFlashKeys.has(essayKey),
    `Flash Cards availability mismatch for ${essayKey}`
  );
}

const flashcards = read("flashcards.html");
const writing = read("writing-practice.html");
const downloads = read("model-essay-downloads.js");
assert.match(flashcards, /data-deck-essay-portals/);
assert.match(flashcards, /openRequestedFlashcardEssay/);
assert.match(writing, /openRequestedWritingEssay/);
assert.match(writing, /writingEssayPortalLinksHtml/);
assert.match(downloads, /openRequestedEssay/);
assert.match(downloads, /data-essay-portal-link/);

console.log(`Essay portal checks passed: ${essays.length} downloads, ${availableFlashKeys.size} non-empty Flash Cards decks, ${writingKeys.size} writing exercises, exact deep links enabled.`);
