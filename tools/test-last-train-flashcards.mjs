import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => readFileSync(path.join(root, name), "utf8");
const context = { window: {} };
vm.runInNewContext(read("flashcards-core-data.js"), context);
vm.runInNewContext(read("flashcards-data-catalog.js"), context);
vm.runInNewContext(read("flashcards-audio-manifest.js"), context);

const deckId = "custom-setup/the-last-train";
const cards = context.window.EDMUND_FLASHCARD_SEED[deckId];
const catalog = context.window.EDMUND_FLASHCARD_DATA_CATALOG[deckId];
const audio = context.window.EDMUND_FLASHCARD_AUDIO;
const html = read("flashcards.html");
assert.equal(cards.length, 64);
assert.equal(catalog.c, 64);
assert.equal(catalog.u, "flashcards-core-data.js?v=20261027-last-train");
assert.match(html, /id: "custom-setup\/the-last-train", studentName: "Jayden", title: "The Last Train"/);
assert.ok(cards.every((card) => card.front && card.meaning && card.sourcePage >= 1 && card.sourcePage <= 4));
assert.ok(cards.every((card) => card.examples.length === 5 && card.examples.every((example) => example.en && example.zh)));

let published = 0;
let reused = 0;
for (const card of cards) {
  const key = card.front.replaceAll("’", "'").trim();
  const url = audio[key];
  assert.ok(url, `Missing Kokoro audio for ${key}`);
  if (url.startsWith("https://edmund-neural-audio.edmundeducation.workers.dev/assets/flashcards/audio/edmund-neural/v1-custom-20261024/last-train/")) {
    assert.match(url, /\/[0-9a-f]{24}\.mp3$/);
    published += 1;
  } else if (url.startsWith("https://")) {
    reused += 1;
  } else {
    assert.fail(`Unpublished audio for ${key}: ${url}`);
  }
}
assert.equal(published, 63);
assert.equal(reused, 1);
assert.match(read("homework-resource-catalog.mjs"), /"id": "flash:custom-setup\/the-last-train"/);
console.log("Last Train: 64 Jayden-only cards, 320 bilingual examples and 64 mapped Kokoro clips verified.");
