#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { HOMEWORK_RESOURCE_CATALOG } from "../homework-resource-catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = "flashcards-government-civics-book2-data.js";
const dataSource = fs.readFileSync(path.join(root, dataFile), "utf8");
const html = fs.readFileSync(path.join(root, "flashcards.html"), "utf8");
const audioManifestFile = "flashcards-audio-manifest.js";
const audioManifestSource = fs.readFileSync(path.join(root, audioManifestFile), "utf8");
const audioGeneratorSource = fs.readFileSync(path.join(root, "tools/generate-flashcard-audio.py"), "utf8");
const prefix = "government/concept-vocabulary/book-2";

function normalizeCardText(value) {
  return String(value || "")
    .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
    .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
    .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2");
}

const expected = [
  ["a-core-policy-group-discussion", 40, 4, "A. Core Policy & Group Discussion", "政策及小組討論"],
  ["b-housing-living-conditions", 40, 4, "B. Housing & Living Conditions", "房屋及居住環境"],
  ["c-healthcare-mental-health", 40, 4, "C. Healthcare & Mental Health", "醫療及精神健康"],
  ["d-elderly-people-carers", 40, 4, "D. Elderly People & Carers", "長者及照顧者"],
  ["e-families-children-working-parents", 40, 4, "E. Families, Children & Working Parents", "家庭、兒童及在職父母"],
  ["f-jobs-wages-employment", 40, 4, "F. Jobs, Wages & Employment", "就業、工資及勞工"],
  ["g-education-young-people", 40, 4, "G. Education & Young People", "教育及青年"],
  ["h-transport-getting-around", 40, 4, "H. Transport & Getting Around", "交通及市民出行"],
  ["i-welfare-poverty-helping-people-in-need", 40, 4, "I. Welfare, Poverty & Helping People in Need", "社會福利、扶貧及支援有需要人士"],
  ["j-cost-of-living-peoples-financial-burden", 40, 4, "J. Cost of Living & People’s Financial Burden", "生活成本及市民經濟負擔"],
  ["k-environment-everyday-green-living", 40, 4, "K. Environment & Everyday Green Living", "環境及日常綠色生活"],
  ["l-scams-online-safety-technology", 40, 4, "L. Scams, Online Safety & Technology", "騙案、網絡安全及科技"],
  ["m-economy-tourism-small-businesses", 40, 4, "M. Economy, Tourism & Small Businesses", "經濟、旅遊及中小企"],
  ["n-public-safety-emergency-preparedness-building-safety", 40, 4, "N. Public Safety, Emergency Preparedness & Building Safety", "公共安全、應急準備及樓宇安全"]
].map(([slug, cards, pages, englishTitle, chineseTitle]) => ({
  slug,
  cards,
  pages,
  englishTitle,
  chineseTitle,
  source: `Civics - Book 2 - ${englishTitle} ${chineseTitle}.pdf`,
  deckId: `${prefix}/${slug}`
}));

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox, { filename: dataFile, timeout: 20_000 });
const seed = sandbox.window.EDMUND_GOVERNMENT_CIVICS_BOOK2_SEED;
const audioSandbox = { window: {} };
vm.runInNewContext(audioManifestSource, audioSandbox, { filename: audioManifestFile, timeout: 20_000 });
const audioManifest = audioSandbox.window.EDMUND_FLASHCARD_AUDIO;
const audioMeta = audioSandbox.window.EDMUND_FLASHCARD_AUDIO_META;
assert.ok(seed && typeof seed === "object", "Missing Civics Book 2 seed");
assert.deepEqual(Object.keys(seed), expected.map(({ deckId }) => deckId), "Book 2 deck order or inventory changed");
assert.deepEqual(
  Object.keys(sandbox.window.EDMUND_FLASHCARD_SEED || {}),
  expected.map(({ deckId }) => deckId),
  "Book 2 seed was not merged into the main flashcard seed"
);

let cardCount = 0;
let exampleCount = 0;
const audioFronts = new Set();
for (const item of expected) {
  const cards = seed[item.deckId];
  assert.ok(Array.isArray(cards), `Missing deck ${item.deckId}`);
  assert.equal(cards.length, item.cards, `${item.deckId}: card count changed`);
  const fronts = new Set();
  const pages = new Set();
  cards.forEach((card, index) => {
    const label = `${item.deckId} card ${index + 1}`;
    assert.ok(String(card.front || "").trim(), `${label}: blank front`);
    assert.ok(String(card.meaning || "").trim(), `${label}: blank meaning`);
    assert.match(card.meaning, /[\u3400-\u9fff]/u, `${label}: meaning is not Chinese`);
    assert.equal(card.source, item.source, `${label}: source filename changed`);
    assert.ok(Number.isInteger(card.sourcePage) && card.sourcePage >= 1 && card.sourcePage <= item.pages, `${label}: invalid source page`);
    pages.add(card.sourcePage);
    assert.ok(Array.isArray(card.examples), `${label}: examples missing`);
    assert.equal(card.examples.length, 5, `${label}: expected five bilingual examples`);
    card.examples.forEach((example, exampleIndex) => {
      assert.ok(String(example?.en || "").trim(), `${label}: blank English example ${exampleIndex + 1}`);
      assert.match(String(example?.zh || ""), /[\u3400-\u9fff]/u, `${label}: Chinese example ${exampleIndex + 1} has no Chinese`);
    });
    const normalizedFront = card.front.trim().toLocaleLowerCase("en");
    assert.equal(fronts.has(normalizedFront), false, `${item.deckId}: duplicate front ${card.front}`);
    fronts.add(normalizedFront);
    const spokenFront = normalizeCardText(card.front).trim();
    audioFronts.add(spokenFront);
    const audioUrl = audioManifest?.[spokenFront];
    assert.ok(audioUrl, `${label}: missing Edmund Neural audio mapping`);
    if (!audioUrl.startsWith("https://")) {
      const audioPath = path.join(root, audioUrl);
      assert.ok(fs.existsSync(audioPath), `${label}: local audio file is missing`);
      assert.ok(fs.statSync(audioPath).size > 1000, `${label}: local audio file is too small`);
    }
    exampleCount += card.examples.length;
  });
  assert.deepEqual([...pages].sort((a, b) => a - b), Array.from({ length: item.pages }, (_, index) => index + 1), `${item.deckId}: incomplete source-page coverage`);
  cardCount += cards.length;
}
assert.equal(cardCount, 560, "Civics Book 2 must contain exactly 560 cards");
assert.equal(exampleCount, 2800, "Civics Book 2 must contain exactly 2,800 bilingual example pairs");
assert.equal(audioFronts.size, 560, "Civics Book 2 must contain 560 unique spoken fronts");
assert.equal(audioMeta?.complete, true, "Edmund Neural audio manifest is incomplete");
assert.ok(audioMeta?.count >= 135787, `Expected at least 135787 audio mappings; found ${audioMeta?.count}`);

const navigationMatch = html.match(/const governmentCivicsBook2Decks = (\[[\s\S]*?\n    \]);/);
assert.ok(navigationMatch, "Could not locate the Book 2 navigation list");
const navigation = vm.runInNewContext(`(${navigationMatch[1]})`, { governmentCivicsBook2Prefix: prefix });
assert.deepEqual(Array.from(navigation, deck => String(deck.deckId)), expected.map(({ deckId }) => deckId), "Book 2 navigation order changed");
for (const [index, deck] of Array.from(navigation).entries()) {
  const item = expected[index];
  assert.ok(String(deck.label).includes(item.englishTitle), `${item.deckId}: English navigation title missing`);
  assert.ok(String(deck.label).includes(item.chineseTitle), `${item.deckId}: Chinese navigation title missing`);
}

assert.match(html, /<script src="flashcards-government-civics-book2-data\.js\?v=20260817-1"><\/script>/, "Book 2 data file is not loaded");
assert.match(html, /<script src="flashcards-audio-manifest\.js\?v=edmund-neural-v1-20260818-2"><\/script>/, "Edmund Neural audio cache key is stale");
assert.ok(html.includes('route === "government-concept-vocabulary-book-2"'), "Book 2 route handler is missing");
assert.ok(html.includes('route: "government-concept-vocabulary-book-2"'), "Book 2 selector is missing");
assert.ok(html.includes('addAggregate("government/concept-vocabulary", "政府機構 / 概念詞彙", 2)'), "Book selector aggregate must contain two books");
assert.match(
  audioGeneratorSource,
  /\(\s*"flashcards-government-civics-book2-data\.js",\s*"window\.EDMUND_GOVERNMENT_CIVICS_BOOK2_SEED = ",\s*None,\s*\)/,
  "The flashcard audio generator does not ingest Book 2"
);

const homeworkResources = HOMEWORK_RESOURCE_CATALOG.filter(resource => resource.id.startsWith(`flash:${prefix}/`));
assert.equal(homeworkResources.length, expected.length, "Homework must index all fourteen Civics Book 2 decks");
const homeworkById = new Map(homeworkResources.map(resource => [resource.id, resource]));
for (const item of expected) {
  const resource = homeworkById.get(`flash:${item.deckId}`);
  assert.ok(resource, `${item.deckId}: Homework deep link missing`);
  assert.equal(resource.label, `${item.englishTitle} ${item.chineseTitle}`, `${item.deckId}: Homework title changed`);
  assert.equal(resource.url, `flashcards.html?deck=${encodeURIComponent(item.deckId)}`, `${item.deckId}: Homework URL changed`);
  assert.match(resource.detail, new RegExp(`· ${item.cards} cards$`), `${item.deckId}: Homework card count changed`);
}

console.log(JSON.stringify({ decks: expected.length, cards: cardCount, bilingualExamples: exampleCount, audioFronts: audioFronts.size, audioMappings: audioMeta.count, homeworkLinks: homeworkResources.length }, null, 2));
