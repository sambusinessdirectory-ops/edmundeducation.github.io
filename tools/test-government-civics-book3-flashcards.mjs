#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { HOMEWORK_RESOURCE_CATALOG } from "../homework-resource-catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = "flashcards-government-civics-book3-data.js";
const dataSource = fs.readFileSync(path.join(root, dataFile), "utf8");
const html = fs.readFileSync(path.join(root, "flashcards.html"), "utf8");
const audioManifestSource = fs.readFileSync(path.join(root, "flashcards-audio-manifest.js"), "utf8");
const audioGeneratorSource = fs.readFileSync(path.join(root, "tools/generate-flashcard-audio.py"), "utf8");
const topicMigration = fs.readFileSync(
  path.join(root, "supabase-writing-submission-civics-book3-topics-20260920.sql"),
  "utf8"
);
const prefix = "government/concept-vocabulary/book-3";

function normalizeCardText(value) {
  return String(value || "")
    .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
    .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
    .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2");
}

const expected = [
  ["a-core-policy-group-discussion", 20, 2, "政策及小組討論", "Civics Vocab - Book 3 - Core Policy & Group Discussion — 政策及小組討論.pdf"],
  ["b-housing-living-conditions", 39, 3, "房屋及居住環境", "Civics Vocab - Book 3 - Housing & Living Conditions — 房屋及居住環境.pdf"],
  ["c-healthcare-mental-health", 40, 3, "醫療及精神健康", "Book 3 - Healthcare & Mental Health — 醫療及精神健康.pdf"],
  ["d-elderly-people-carers", 40, 3, "長者及照顧者", "Book 3 - Elderly People & Carers — 長者及照顧者.pdf"],
  ["e-families-children-working-parents", 20, 2, "家庭、兒童及在職父母", "Book 3 - Families, Children & Working Parents — 家庭、兒童及在職父母.pdf"],
  ["f-jobs-wages-employment", 40, 3, "就業、工資及勞工", "Book 3 - Jobs, Wages & Employment — 就業、工資及勞工.pdf"],
  ["g-education-young-people", 30, 2, "教育及青年", "Book 3 - Education & Young People — 教育及青年.pdf"],
  ["h-transport-getting-around", 20, 2, "交通及市民出行", "Book 3 - Transport & Getting Around — 交通及市民出行.pdf"],
  ["i-welfare-poverty-helping-people-in-need", 40, 3, "社會福利、扶貧及支援有需要人士", "Book 3 - 社會福利、扶貧及支援有需要人士.pdf"],
  ["j-cost-of-living-peoples-financial-burden", 20, 2, "生活成本及市民經濟負擔", "Book 3 - 生活成本及市民經濟負擔.pdf"],
  ["k-public-safety-emergency-preparedness-building-safety", 20, 2, "公共安全、應急準備及樓宇安全", "Book 3 - 公共安全、應急準備及樓宇安全.pdf"]
].map(([slug, cards, pages, chineseTitle, source], index) => ({
  slug,
  cards,
  pages,
  chineseTitle,
  source,
  letter: String.fromCharCode(65 + index),
  deckId: `${prefix}/${slug}`
}));

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox, { filename: dataFile, timeout: 20_000 });
const seed = sandbox.window.EDMUND_GOVERNMENT_CIVICS_BOOK3_SEED;
const audioSandbox = { window: {} };
vm.runInNewContext(audioManifestSource, audioSandbox, { filename: "flashcards-audio-manifest.js", timeout: 20_000 });
const audioManifest = audioSandbox.window.EDMUND_FLASHCARD_AUDIO;
const audioMeta = audioSandbox.window.EDMUND_FLASHCARD_AUDIO_META;
assert.ok(seed && typeof seed === "object", "Missing Civics Book 3 seed");
assert.deepEqual(Object.keys(seed), expected.map(({ deckId }) => deckId), "Book 3 deck order or inventory changed");
assert.deepEqual(
  Object.keys(sandbox.window.EDMUND_FLASHCARD_SEED || {}),
  expected.map(({ deckId }) => deckId),
  "Book 3 seed was not merged into the main flashcard seed"
);

let cardCount = 0;
let exampleCount = 0;
const audioFronts = new Set();
for (const item of expected) {
  const cards = seed[item.deckId];
  assert.equal(cards.length, item.cards, `${item.deckId}: card count changed`);
  const fronts = new Set();
  const pages = new Set();
  cards.forEach((card, index) => {
    const label = `${item.deckId} card ${index + 1}`;
    assert.ok(String(card.front || "").trim(), `${label}: blank front`);
    assert.match(String(card.meaning || ""), /[\u3400-\u9fff]/u, `${label}: meaning is not Chinese`);
    assert.equal(card.source, item.source, `${label}: source filename changed`);
    assert.ok(Number.isInteger(card.sourcePage) && card.sourcePage >= 1 && card.sourcePage <= item.pages, `${label}: invalid source page`);
    pages.add(card.sourcePage);
    assert.equal(card.examples?.length, 5, `${label}: expected five bilingual examples`);
    card.examples.forEach((example, exampleIndex) => {
      assert.ok(String(example?.en || "").trim(), `${label}: blank English example ${exampleIndex + 1}`);
      assert.match(String(example?.zh || ""), /[\u3400-\u9fff]/u, `${label}: Chinese example ${exampleIndex + 1} has no Chinese`);
    });
    const normalizedFront = card.front.trim().toLocaleLowerCase("en");
    assert.equal(fronts.has(normalizedFront), false, `${item.deckId}: duplicate front ${card.front}`);
    fronts.add(normalizedFront);
    const spokenFront = normalizeCardText(card.front).trim();
    audioFronts.add(spokenFront);
    assert.ok(audioManifest?.[spokenFront], `${label}: missing Edmund Neural audio mapping`);
    exampleCount += card.examples.length;
  });
  assert.deepEqual([...pages].sort((a, b) => a - b), Array.from({ length: item.pages }, (_, index) => index + 1), `${item.deckId}: incomplete source-page coverage`);
  cardCount += cards.length;
}
assert.equal(cardCount, 329, "Civics Book 3 must contain exactly 329 cards");
assert.equal(exampleCount, 1645, "Civics Book 3 must contain exactly 1,645 bilingual example pairs");
assert.equal(audioFronts.size, 329, "Civics Book 3 must contain 329 unique spoken fronts");
assert.equal(audioMeta?.complete, true, "Edmund Neural audio manifest is incomplete");

const navigationMatch = html.match(/const governmentCivicsBook3Decks = (\[[\s\S]*?\n    \]);/);
assert.ok(navigationMatch, "Could not locate the Book 3 navigation list");
const navigation = vm.runInNewContext(`(${navigationMatch[1]})`, { governmentCivicsBook3Prefix: prefix });
assert.deepEqual(Array.from(navigation, deck => String(deck.deckId)), expected.map(({ deckId }) => deckId), "Book 3 navigation order changed");
for (const [index, deck] of Array.from(navigation).entries()) {
  const item = expected[index];
  assert.equal(String(deck.label), `${item.letter}. ${item.chineseTitle}`, `${item.deckId}: navigation title must remain Chinese`);
}

assert.match(html, /flashcards-government-civics-book3-data\.js\?v=20260920-1/, "Book 3 data file is not loaded");
assert.match(html, /flashcards-audio-manifest\.js\?v=edmund-neural-v1-20260920-civics-book3-1/, "Book 3 audio manifest cache key is stale");
assert.ok(html.includes('route === "government-concept-vocabulary-book-3"'), "Book 3 route handler is missing");
assert.ok(html.includes('route: "government-concept-vocabulary-book-3"'), "Book 3 selector is missing");
assert.ok(html.includes('addAggregate("government/concept-vocabulary", "政府機構 / 概念詞彙", 3)'), "Book selector aggregate must contain three books");
assert.match(
  audioGeneratorSource,
  /\(\s*"flashcards-government-civics-book3-data\.js",\s*"window\.EDMUND_GOVERNMENT_CIVICS_BOOK3_SEED = ",\s*None,\s*\)/,
  "The flashcard audio generator does not ingest Book 3"
);

const homeworkResources = HOMEWORK_RESOURCE_CATALOG.filter(resource => resource.id.startsWith(`flash:${prefix}/`));
assert.equal(homeworkResources.length, expected.length, "Homework must index all eleven Civics Book 3 decks");
const homeworkById = new Map(homeworkResources.map(resource => [resource.id, resource]));
for (const item of expected) {
  const resource = homeworkById.get(`flash:${item.deckId}`);
  assert.ok(resource, `${item.deckId}: Homework deep link missing`);
  assert.equal(resource.label, `${item.letter}. ${item.chineseTitle}`, `${item.deckId}: Homework title must remain Chinese`);
  assert.equal(resource.url, `flashcards.html?deck=${encodeURIComponent(item.deckId)}`, `${item.deckId}: Homework URL changed`);
  assert.match(resource.detail, new RegExp(`· ${item.cards} cards$`), `${item.deckId}: Homework card count changed`);
}

assert.equal((topicMigration.match(/^\s*\([0-9]+, '[A-K][1-5]',/gm) || []).length, 55, "Expected 55 Writing Submission topics");
assert.equal((topicMigration.match(/flashcards\.html\?deck=government%2Fconcept-vocabulary%2Fbook-3%2F/g) || []).length, 1, "Migration must build Book 3 flashcard links centrally");
assert.match(topicMigration, /b3000000-0000-5000-8000-/i, "Writing topic IDs must remain stable");

console.log(JSON.stringify({
  decks: expected.length,
  cards: cardCount,
  bilingualExamples: exampleCount,
  audioFronts: audioFronts.size,
  audioMappings: audioMeta.count,
  homeworkLinks: homeworkResources.length,
  writingTopics: 55
}, null, 2));
