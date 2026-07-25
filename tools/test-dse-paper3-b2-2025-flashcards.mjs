import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const dataFile = "flashcards-dse-paper3-b2-2025-data.js";
const deckId = "dse/paper-3/part-b-data-file-b2/2025";
const dataSource = fs.readFileSync(path.join(siteDir, dataFile), "utf8");
const html = fs.readFileSync(path.join(siteDir, "flashcards.html"), "utf8");
const sandbox = { window: {} };

vm.runInNewContext(dataSource, sandbox, { filename: dataFile });
const seed = sandbox.window.EDMUND_FLASHCARD_SEED;
assert.ok(seed && typeof seed === "object", "The flashcard seed must be created");
assert.deepEqual(Object.keys(seed), [deckId], "The file must register only the 2025 B2 deck");

const cards = seed[deckId];
assert.equal(cards.length, 301, "The PDF contains exactly 301 cards");
assert.equal(new Set(cards.map(card => card.front.trim().toLowerCase())).size, 301);
assert.equal(cards[0].front, "president of");
assert.equal(cards.at(-1).front, "traditions and festivals");
assert.deepEqual(
  [...new Set(cards.map(card => card.sourcePage))],
  Array.from({ length: 28 }, (_, index) => index + 1),
  "Every PDF page must be represented"
);

for (const [index, card] of cards.entries()) {
  assert.ok(card.front?.trim(), `Card ${index + 1} needs an English front`);
  assert.ok(card.meaning?.trim(), `Card ${index + 1} needs a Chinese meaning`);
  assert.equal(card.source, "Flash Card 2025 DSE B2 Data file.pdf");
  assert.ok(
    Number.isInteger(card.sourcePage) && card.sourcePage >= 1 && card.sourcePage <= 28,
    `Card ${index + 1} needs a valid source page`
  );
  assert.equal(card.examples?.length, 5, `Card ${index + 1} needs five examples`);
  for (const [exampleIndex, example] of card.examples.entries()) {
    assert.ok(example.en?.trim(), `Card ${index + 1}, example ${exampleIndex + 1} needs English`);
    assert.ok(example.zh?.trim(), `Card ${index + 1}, example ${exampleIndex + 1} needs Chinese`);
  }
}

const inlineSeedEnd = html.indexOf("</script>", html.indexOf("window.EDMUND_FLASHCARD_SEED = {"));
const dataScript = html.indexOf(
  '<script src="flashcards-dse-paper3-b2-2025-data.js?v=20260725-1"></script>'
);
const appSeedRead = html.indexOf("const seedDecks = window.EDMUND_FLASHCARD_SEED || {};");
assert.ok(inlineSeedEnd !== -1 && inlineSeedEnd < dataScript);
assert.ok(dataScript < appSeedRead);
assert.match(html, /const dseYears = \[[^\]]*"2025"/);
assert.match(
  html,
  /b2: \{ title: "Part B \(Data File\) - B2", prefix: "dse\/paper-3\/part-b-data-file-b2" \}/
);

const combinedSandbox = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(siteDir, "flashcards-dse-paper3-b2-2024-data.js"), "utf8"),
  combinedSandbox,
  { filename: "flashcards-dse-paper3-b2-2024-data.js" }
);
vm.runInNewContext(dataSource, combinedSandbox, { filename: dataFile });
assert.deepEqual(
  Object.keys(combinedSandbox.window.EDMUND_FLASHCARD_SEED).sort(),
  ["dse/paper-3/part-b-data-file-b2/2024", deckId],
  "The 2024 and 2025 B2 decks must coexist"
);

console.log("DSE Paper 3 B2 2025 flashcard checks passed: 301 cards.");
