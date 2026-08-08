#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = "flashcards-government-civics-book1-data.js";
const audioManifestFile = "flashcards-audio-manifest.js";
const dataSource = fs.readFileSync(path.join(root, dataFile), "utf8");
const html = fs.readFileSync(path.join(root, "flashcards.html"), "utf8");
const audioManifestSource = fs.readFileSync(path.join(root, audioManifestFile), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(dataSource, sandbox, { filename: dataFile, timeout: 10_000 });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assignedJson(source, assignment) {
  const start = source.indexOf(assignment);
  assert(start >= 0, `Missing assignment ${assignment}`);
  const valueStart = start + assignment.length;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = valueStart; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return JSON.parse(source.slice(valueStart, index + 1));
    }
  }
  throw new Error(`Unterminated assignment ${assignment}`);
}

const prefix = "government/concept-vocabulary/book-1";
const expected = [
  ["a-core-policy-group-discussion", 53, 6, "Core Policy & Group Discussion", "政策及小組討論"],
  ["b-housing-living-conditions", 40, 4, "Housing & Living Conditions", "房屋及居住環境"],
  ["c-healthcare-mental-health", 40, 4, "Healthcare & Mental Health", "醫療及精神健康"],
  ["d-elderly-people-carers", 40, 4, "Elderly People & Carers", "長者及照顧者"],
  ["e-families-children-working-parents", 40, 4, "Families, Children & Working Parents", "家庭、兒童及在職父母"],
  ["f-jobs-wages-employment", 44, 5, "Jobs, Wages & Employment", "就業、工資及勞工"],
  ["g-education-young-people", 40, 4, "Education & Young People", "教育及青年"],
  ["h-transport-getting-around", 40, 4, "Transport & Getting Around", "交通及市民出行"],
  ["i-welfare-poverty-helping-people-in-need", 40, 4, "Welfare, Poverty & Helping People in Need", "社會福利、扶貧及支援有需要人士"],
  ["j-cost-of-living-peoples-financial-burden", 40, 4, "Cost of Living & People's Financial Burden", "生活成本及市民經濟負擔"],
  ["k-environment-everyday-green-living", 38, 4, "Environment & Everyday Green Living", "環境及日常綠色生活"],
  ["l-scams-online-safety-technology", 40, 4, "Scams, Online Safety & Technology", "騙案、網絡安全及科技"]
];

const seed = sandbox.window.EDMUND_GOVERNMENT_CIVICS_BOOK1_SEED;
const audioManifest = assignedJson(
  audioManifestSource,
  "window.EDMUND_FLASHCARD_AUDIO = Object.freeze("
);
const audioMeta = assignedJson(
  audioManifestSource,
  "window.EDMUND_FLASHCARD_AUDIO_META = Object.freeze("
);
assert(seed && typeof seed === "object", "Missing Civics Book 1 seed");
assert(Object.keys(seed).length === expected.length, `Expected 12 decks; found ${Object.keys(seed).length}`);
assert(
  Object.keys(sandbox.window.EDMUND_FLASHCARD_SEED || {}).length === expected.length,
  "Civics seed was not merged into the main flashcard seed"
);

let cardCount = 0;
const fronts = new Map();
for (const [slug, expectedCards, maxPage, englishTitle, chineseTitle] of expected) {
  const deckId = `${prefix}/${slug}`;
  const cards = seed[deckId];
  assert(Array.isArray(cards), `Missing deck ${deckId}`);
  assert(cards.length === expectedCards, `${deckId}: expected ${expectedCards} cards; found ${cards.length}`);
  assert(html.includes(`/${slug}`), `${deckId}: missing navigation registration`);
  assert(html.includes(englishTitle), `${deckId}: missing English display title`);
  assert(html.includes(chineseTitle), `${deckId}: missing Chinese display title`);
  const withinDeck = new Set();
  cards.forEach((card, index) => {
    const label = `${deckId} card ${index + 1}`;
    assert(typeof card.front === "string" && card.front.trim(), `${label}: blank front`);
    assert(typeof card.meaning === "string" && card.meaning.trim(), `${label}: blank meaning`);
    assert(/[\u3400-\u9fff]/u.test(card.meaning), `${label}: meaning is not Chinese`);
    assert(Array.isArray(card.examples) && card.examples.length === 5, `${label}: expected five examples`);
    card.examples.forEach((example, exampleIndex) => {
      assert(typeof example.en === "string" && example.en.trim(), `${label}: blank English example ${exampleIndex + 1}`);
      assert(typeof example.zh === "string" && example.zh.trim(), `${label}: blank Chinese example ${exampleIndex + 1}`);
      assert(/[\u3400-\u9fff]/u.test(example.zh), `${label}: Chinese example ${exampleIndex + 1} has no Chinese text`);
    });
    assert(typeof card.source === "string" && card.source.startsWith("Civics - Book 1 -"), `${label}: invalid source`);
    assert(Number.isInteger(card.sourcePage) && card.sourcePage >= 1 && card.sourcePage <= maxPage, `${label}: invalid source page`);
    const normalizedFront = card.front.trim().toLocaleLowerCase("en");
    assert(!withinDeck.has(normalizedFront), `${deckId}: duplicate front ${card.front}`);
    withinDeck.add(normalizedFront);
    fronts.set(normalizedFront, (fronts.get(normalizedFront) || 0) + 1);
    const audioUrl = audioManifest[card.front.trim()];
    assert(typeof audioUrl === "string" && audioUrl, `${label}: missing Edmund Neural audio mapping`);
    if (!audioUrl.startsWith("https://")) {
      const audioPath = path.join(root, audioUrl);
      assert(fs.existsSync(audioPath), `${label}: local audio file is missing`);
      assert(fs.statSync(audioPath).size > 1000, `${label}: local audio file is too small`);
    }
  });
  cardCount += cards.length;
}

assert(cardCount === 495, `Expected 495 cards; found ${cardCount}`);
assert(fronts.size === 491, `Expected 491 unique audio fronts; found ${fronts.size}`);
assert(
  [...fronts.entries()].filter(([, count]) => count > 1).map(([front]) => front).sort().join("|") ===
    ["affordability", "financial support", "mental health support", "waiting time"].join("|"),
  "Cross-topic duplicate-front inventory changed"
);
assert(html.includes(`<script src="${dataFile}?v=20260808-1"></script>`), "Civics data file is not loaded by flashcards.html");
assert(html.includes(`${audioManifestFile}?v=edmund-neural-v1-20260808-1`), "Edmund Neural audio cache key is stale");
assert(audioMeta.complete === true, "Edmund Neural audio manifest is incomplete");
assert(audioMeta.count >= 134735, `Expected at least 134735 audio mappings; found ${audioMeta.count}`);
assert(audioMeta.voice === "af_heart", `Unexpected voice ${audioMeta.voice}`);
assert(html.includes('data-route="${escapeHtml(route)}"'), "Route option renderer changed unexpectedly");
assert(html.includes('route === "government-concept-vocabulary"'), "Missing 概念詞彙 route handler");
assert(html.includes('route === "government-concept-vocabulary-book-1"'), "Missing Book 1 route handler");
assert(html.includes('{ key: "government-concept-vocabulary", label: "概念詞彙" }'), "Missing access-control child key");

console.log(JSON.stringify({ decks: expected.length, cards: cardCount, bilingualExamples: cardCount * 5 }, null, 2));
