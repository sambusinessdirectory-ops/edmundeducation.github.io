#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const deckId = "government/hkfsd/incident-reports/incident-report-3";
const sourceFile = "Flash Card - HKFSD - Incident Report 3.pdf";
const chinese = /[\u3400-\u9fff]/u;
const normalizedFront = value => String(value || "")
  .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
  .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
  .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2")
  .trim();

const sandbox = { window: {} };
vm.runInNewContext(read("flashcards-hkfsd-incident-reports-data.js"), sandbox, {
  filename: "flashcards-hkfsd-incident-reports-data.js",
  timeout: 30_000
});
vm.runInNewContext(read("flashcards-audio-manifest.js"), sandbox, {
  filename: "flashcards-audio-manifest.js",
  timeout: 30_000
});

const seed = sandbox.window.EDMUND_HKFSD_INCIDENT_REPORTS_SEED;
const mergedSeed = sandbox.window.EDMUND_FLASHCARD_SEED;
const audio = sandbox.window.EDMUND_FLASHCARD_AUDIO;
const audioMeta = sandbox.window.EDMUND_FLASHCARD_AUDIO_META;
assert.deepEqual(Object.keys(seed || {}), [deckId], "only supplied Incident Report 3 may be published");
assert.deepEqual(Object.keys(mergedSeed || {}), [deckId], "Incident Report seed must merge into the main seed");

const cards = seed[deckId];
assert.equal(cards.length, 86, "source PDF contains exactly 86 cards");
assert.equal(new Set(cards.map(card => card.front.toLocaleLowerCase("en"))).size, 86, "card fronts must be unique");
assert.deepEqual(
  Object.fromEntries(Array.from({ length: 9 }, (_, index) => {
    const page = index + 1;
    return [page, cards.filter(card => card.sourcePage === page).length];
  })),
  { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 10, 9: 6 },
  "source-page inventory changed"
);

let bilingualExamples = 0;
for (const [index, card] of cards.entries()) {
  const label = `card ${index + 1}`;
  assert.ok(String(card.front || "").trim(), `${label}: blank front`);
  assert.match(String(card.meaning || ""), chinese, `${label}: Chinese meaning missing`);
  assert.equal(card.source, sourceFile, `${label}: source filename changed`);
  assert.ok(Number.isInteger(card.sourcePage) && card.sourcePage >= 1 && card.sourcePage <= 9, `${label}: bad source page`);
  assert.equal(card.examples?.length, 5, `${label}: five bilingual examples required`);
  for (const [exampleIndex, example] of card.examples.entries()) {
    assert.ok(String(example?.en || "").trim(), `${label}: blank English example ${exampleIndex + 1}`);
    assert.match(String(example?.zh || ""), chinese, `${label}: Chinese example ${exampleIndex + 1} missing`);
    bilingualExamples += 1;
  }
  const audioUrl = audio?.[normalizedFront(card.front)];
  assert.ok(audioUrl, `${label}: Kokoro mapping missing for ${card.front}`);
  if (!audioUrl.startsWith("https://")) {
    const audioPath = path.join(root, audioUrl);
    assert.ok(fs.existsSync(audioPath), `${label}: local MP3 missing`);
    assert.ok(fs.statSync(audioPath).size > 1_000, `${label}: local MP3 implausibly small`);
  }
}
assert.equal(bilingualExamples, 430);
assert.equal(audioMeta?.complete, true);
assert.equal(audioMeta?.engine, "Kokoro-82M");
assert.equal(audioMeta?.voice, "af_heart");
assert.ok(audioMeta?.count >= 136333, `audio manifest is incomplete (${audioMeta?.count})`);

const html = read("flashcards.html");
const generator = read("tools/generate-flashcard-audio.py");
assert.match(html, /flashcards-hkfsd-incident-reports-data\.js\?v=20260818-1/);
assert.match(html, /flashcards-audio-manifest\.js\?v=edmund-neural-v1-20260818-(?:[2-9]|[1-9]\d+)/, "Flash Card audio cache pin was not advanced");
assert.match(html, /const hkfsdIncidentReportDecks = Array\.from\(\{ length: 10 \}/);
assert.match(html, /route:\s*"government-hkfsd-incident-reports"/);
assert.match(html, /route === "government-hkfsd-incident-reports"/);
assert.match(html, /addAggregate\(typeId, "政府機構 \/ HKFSD", 2\)/);
assert.match(generator, /"flashcards-hkfsd-incident-reports-data\.js"/);
assert.match(generator, /"window\.EDMUND_HKFSD_INCIDENT_REPORTS_SEED = "/);

const { HOMEWORK_RESOURCE_CATALOG } = await import(
  `${pathToFileURL(path.join(root, "homework-resource-catalog.mjs")).href}?hkfsd-ir3=${Date.now()}`
);
const homework = HOMEWORK_RESOURCE_CATALOG.filter(resource => resource.id === `flash:${deckId}`);
assert.equal(homework.length, 1, "Homework must itemize Incident Report 3 exactly once");
assert.equal(homework[0].url, `flashcards.html?deck=${encodeURIComponent(deckId)}`);
assert.match(homework[0].label, /HKFSD.*Incident Report 3/i);

console.log("HKFSD Incident Report 3 Flash Cards verified: 86 cards, 430 bilingual examples, navigation, Kokoro audio and Homework link.");
