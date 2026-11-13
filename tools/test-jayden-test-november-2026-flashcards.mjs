import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = name => readFileSync(path.join(root, name), "utf8");
const context = { window: {} };
vm.runInNewContext(read("flashcards-jayden-test-november-2026-data.js"), context);
vm.runInNewContext(read("flashcards-data-catalog.js"), context);
vm.runInNewContext(read("flashcards-audio-manifest.js"), context);

const deckId = "custom-setup/jayden-test-november-2026";
const cards = context.window.EDMUND_JAYDEN_TEST_NOVEMBER_2026_SEED[deckId];
const catalog = context.window.EDMUND_FLASHCARD_DATA_CATALOG[deckId];
const audio = context.window.EDMUND_FLASHCARD_AUDIO;
const html = read("flashcards.html");

assert.equal(cards.length, 184);
assert.equal(catalog.c, 184);
assert.equal(catalog.u, "flashcards-jayden-test-november-2026-data.js?v=20261113-1");
assert.match(html, /id: "custom-setup\/jayden-test-november-2026", studentName: "Jayden", title: "Jayden Test November 2026"/);
assert.equal(cards[0].front, "unwittingly upset someone");
assert.equal(cards.at(-1).front, "unknown");
assert.deepEqual(Array.from({ length: 10 }, (_, index) => cards.filter(card => card.sourcePage === index + 1).length), [18, 18, 18, 18, 18, 17, 21, 21, 21, 14]);
assert.equal(cards.filter(card => card.front === "cheesy").length, 2, "the two source-defined cheesy meanings remain separate cards");
assert.equal(new Set(cards.map(card => card.front)).size, 183);
assert.ok(cards.every(card => card.front && card.meaning && card.examples.length === 5));
assert.ok(cards.every(card => card.examples.every(example => example.en && example.zh)));

let local = 0;
let reused = 0;
for (const card of cards) {
  const key = card.front.replaceAll("’", "'").trim();
  const url = audio[key];
  assert.ok(url, `Missing Kokoro audio for ${key}`);
  if (url.startsWith("flashcard-custom-audio/jayden-test-november-2026/")) {
    assert.match(url, /\/[0-9a-f]{24}\.mp3$/);
    const file = path.join(root, url);
    assert.ok(existsSync(file) && statSync(file).size > 1000, `Missing public MP3: ${url}`);
    local += 1;
  } else {
    assert.match(url, /^https:\/\//, `Unexpected reused audio URL: ${url}`);
    reused += 1;
  }
}
assert.equal(local, 169, "168 generated fronts plus the repeated cheesy card use local Kokoro audio");
assert.equal(reused, 15);
assert.match(read("homework-resource-catalog.mjs"), /"id": "flash:custom-setup\/jayden-test-november-2026"/);
console.log("Jayden Test November 2026: 184 private cards, 920 bilingual examples and 184 Kokoro mappings verified.");
