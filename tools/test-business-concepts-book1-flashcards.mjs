#!/usr/bin/env node

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { HOMEWORK_RESOURCE_CATALOG } from "../homework-resource-catalog.mjs";


const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "flashcards.html"), "utf8");
const dataFile = "flashcards-business-concepts-book1-data.js";
const dataSource = fs.readFileSync(path.join(root, dataFile), "utf8");
const audioManifestFile = "flashcards-audio-manifest.js";
const audioManifestSource = fs.readFileSync(path.join(root, audioManifestFile), "utf8");
const audioGeneratorSource = fs.readFileSync(
  path.join(root, "tools/generate-flashcard-audio.py"),
  "utf8"
);
const prefix = "business-english/business-concepts-standard-response";

const expected = [
  {
    number: 1,
    slug: "q1-uncertainty",
    cards: 82,
    uniqueFronts: 81,
    pages: 10,
    label: "Q1 - 你如何理解「不確定性」（uncertainty）對商業決策的影響？",
    source: "Flashcard - Book 1 - Q1 - Uncertainty.pdf",
    duplicateFronts: ["in business"],
  },
  {
    number: 2,
    slug: "q2-inflation-interest-rates-rising-rent-and-rising-wages",
    cards: 82,
    uniqueFronts: 82,
    pages: 10,
    label: "Q2 - 通脹、利率、租金或人工上升，哪一項對企業壓力最大？為甚麼？",
    source: "Flashcard - Book 1 - Q2 - Inflation, Interest rates, Rising rent, and Rising wages.pdf",
    duplicateFronts: [],
  },
  {
    number: 3,
    slug: "q3-core-management-capabilities",
    cards: 82,
    uniqueFronts: 82,
    pages: 9,
    label: "Q3 - 管理最核心的三個能力是甚麼？",
    source: "Business - Book 1 - Q3 - 管理最核心的三個能力是甚麼？.pdf",
    duplicateFronts: [],
  },
  {
    number: 4,
    slug: "q4-problems-of-micromanagement",
    cards: 61,
    uniqueFronts: 61,
    pages: 7,
    label: "Q4 - 微觀管理（micromanagement）會帶來哪些問題？",
    source: "Business - Book 1 - Q4 - 微觀管理（micromanagement）會帶來哪些問題？.pdf",
    duplicateFronts: [],
  },
  {
    number: 5,
    slug: "q5-function-feeling-or-identity",
    cards: 110,
    uniqueFronts: 110,
    pages: 11,
    label: "Q5 - 消費者真正購買的是功能、感受，還是身份認同？",
    source: "Business - Book 1 - Q5 -消費者真正購買的是功能、感受，還是身份認同？.pdf",
    duplicateFronts: [],
  },
  {
    number: 6,
    slug: "q6-what-to-do-or-what-not-to-do",
    cards: 88,
    uniqueFronts: 88,
    pages: 9,
    label: "Q6 - 企業最重要的策略問題，是「做甚麼」還是「不做甚麼」？",
    source: "Business - Book 1 - Q6 - 企業最重要的策略問題，是「做甚麼」還是「不做甚麼」？.pdf",
    duplicateFronts: [],
  },
  {
    number: 7,
    slug: "q7-process-people-or-management",
    cards: 82,
    uniqueFronts: 81,
    pages: 9,
    label: "Q7 - 一間公司執行力差，通常是流程問題、人才問題，還是管理問題？",
    source: "Business - Book 1 - Q7 - 一間公司執行力差，通常是流程問題、人才問題，還是管理問題？.pdf",
    duplicateFronts: ["the root cause"],
  },
  {
    number: 8,
    slug: "q8-high-ability-but-difficult-to-work-with",
    cards: 88,
    uniqueFronts: 88,
    pages: 9,
    label: "Q8 - 應否聘用高能力但難合作的人？",
    source: "Business - Book 1 - Q8 - 應否聘用高能力但難合作的人？.pdf",
    duplicateFronts: [],
  },
  {
    number: 9,
    slug: "q9-high-profit-and-company-health",
    cards: 73,
    uniqueFronts: 73,
    pages: 8,
    label: "Q9 - 利潤高是否代表公司一定健康？為甚麼？",
    source: "Business - Book 1 - Q9 - 利潤高是否代表公司一定健康？為甚麼？.pdf",
    duplicateFronts: [],
  },
  {
    number: 10,
    slug: "q10-innovation-and-conservatism",
    cards: 110,
    uniqueFronts: 110,
    pages: 11,
    label: "Q10 - 企業為何常說要創新，實際上卻很保守？",
    source: "Business - Book 1 - Q10 -企業為何常說要創新，實際上卻很保守？.pdf",
    duplicateFronts: [],
  },
].map((item) => Object.freeze({ ...item, deckId: `${prefix}/${item.slug}` }));


function assignedJson(source, assignment) {
  const assignmentIndex = source.indexOf(assignment);
  assert.notEqual(assignmentIndex, -1, `Missing assignment ${assignment}`);
  const valueStart = assignmentIndex + assignment.length;
  const opener = source[valueStart];
  const closer = opener === "{" ? "}" : opener === "[" ? "]" : "";
  assert.ok(closer, `Unsupported assignment value for ${assignment}`);
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
    else if (character === opener) depth += 1;
    else if (character === closer && --depth === 0) {
      return JSON.parse(source.slice(valueStart, index + 1));
    }
  }
  throw new Error(`Unterminated assignment ${assignment}`);
}


function normalizeFront(value) {
  return String(value || "")
    .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
    .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
    .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2")
    .trim();
}


function expectedAudioDigest(front) {
  return crypto.createHash("sha256").update(front).digest("hex").slice(0, 24);
}


const inlineAssignment = "window.EDMUND_FLASHCARD_SEED = ";
const inlineStart = html.indexOf(inlineAssignment);
const inlineEnd = html.indexOf("</script>", inlineStart);
assert.ok(inlineStart >= 0 && inlineEnd > inlineStart, "Could not locate the inline flashcard seed");
const inlineSeed = JSON.parse(
  html.slice(inlineStart + inlineAssignment.length, inlineEnd).trim().replace(/;$/, "")
);
const sandbox = { window: { EDMUND_FLASHCARD_SEED: inlineSeed } };
vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox, { filename: dataFile, timeout: 20_000 });

const importedSeed = sandbox.window.EDMUND_BUSINESS_CONCEPTS_BOOK1_SEED;
const mergedSeed = sandbox.window.EDMUND_FLASHCARD_SEED;
assert.ok(importedSeed && typeof importedSeed === "object", "Missing Business Book 1 seed");
assert.equal(Object.keys(importedSeed).length, 8, "The external Business seed must contain Q3-Q10 only");
assert.deepEqual(
  Object.keys(importedSeed),
  expected.slice(2).map(({ deckId }) => deckId),
  "External Business decks are missing or out of order"
);

const businessDecks = Object.entries(mergedSeed).filter(([deckId]) => deckId.startsWith(`${prefix}/`));
assert.deepEqual(
  businessDecks.map(([deckId]) => deckId),
  expected.map(({ deckId }) => deckId),
  "Merged Business Book 1 deck order must remain Q1-Q10"
);

const audioManifest = assignedJson(
  audioManifestSource,
  "window.EDMUND_FLASHCARD_AUDIO = Object.freeze("
);
const audioMeta = assignedJson(
  audioManifestSource,
  "window.EDMUND_FLASHCARD_AUDIO_META = Object.freeze("
);
const globalFronts = new Set();
let cardCount = 0;

for (const item of expected) {
  const cards = mergedSeed[item.deckId];
  assert.ok(Array.isArray(cards), `Missing ${item.deckId}`);
  assert.equal(cards.length, item.cards, `${item.deckId}: card count changed`);
  const perDeckFronts = new Map();
  const sourcePages = new Set();
  for (const [index, card] of cards.entries()) {
    const label = `${item.deckId} card ${index + 1}`;
    const front = normalizeFront(card?.front ?? card?.term);
    assert.ok(front, `${label}: blank front`);
    assert.equal(typeof card.meaning, "string", `${label}: missing meaning`);
    assert.match(card.meaning, /[\u3400-\u9fff]/u, `${label}: meaning is not Chinese`);
    assert.equal(card.source, item.source, `${label}: source filename changed`);
    assert.ok(
      Number.isInteger(card.sourcePage) && card.sourcePage >= 1 && card.sourcePage <= item.pages,
      `${label}: invalid source page ${card.sourcePage}`
    );
    sourcePages.add(card.sourcePage);
    assert.ok(Array.isArray(card.examples), `${label}: examples are missing`);
    assert.equal(card.examples.length, 5, `${label}: expected five bilingual examples`);
    for (const [exampleIndex, example] of card.examples.entries()) {
      assert.ok(String(example?.en || "").trim(), `${label}: blank English example ${exampleIndex + 1}`);
      assert.match(
        String(example?.zh || ""),
        /[\u3400-\u9fff]/u,
        `${label}: Chinese example ${exampleIndex + 1} has no Chinese text`
      );
    }

    const occurrences = perDeckFronts.get(front) || [];
    occurrences.push(card.sourcePage);
    perDeckFronts.set(front, occurrences);
    globalFronts.add(front);

    const audioUrl = audioManifest[front];
    assert.ok(audioUrl, `${label}: missing Edmund Neural audio for ${JSON.stringify(front)}`);
    const digest = expectedAudioDigest(front);
    const pathname = audioUrl.startsWith("https://")
      ? new URL(audioUrl).pathname.replace(/^\//, "")
      : audioUrl;
    assert.equal(
      pathname.endsWith(`/${digest.slice(0, 2)}/${digest}.mp3`),
      true,
      `${label}: audio URL does not match the normalized-front digest`
    );
    if (audioUrl.startsWith("https://")) {
      assert.ok(
        audioUrl.startsWith("https://edmund-neural-audio.edmundeducation.workers.dev/"),
        `${label}: unexpected remote audio origin`
      );
    } else {
      const audioPath = path.join(root, audioUrl);
      assert.ok(fs.existsSync(audioPath), `${label}: local audio file is missing`);
      assert.ok(fs.statSync(audioPath).size > 1000, `${label}: local audio file is too small`);
    }
  }
  assert.equal(perDeckFronts.size, item.uniqueFronts, `${item.deckId}: unique-front count changed`);
  assert.deepEqual(
    [...perDeckFronts.entries()].filter(([, pages]) => pages.length > 1).map(([front]) => front),
    item.duplicateFronts,
    `${item.deckId}: duplicate-front inventory changed`
  );
  assert.deepEqual(
    [...sourcePages].sort((left, right) => left - right),
    Array.from({ length: item.pages }, (_, index) => index + 1),
    `${item.deckId}: source-page coverage changed`
  );
  cardCount += cards.length;
}

assert.equal(cardCount, 858, "Business Book 1 must contain exactly 858 cards across Q1-Q10");
assert.equal(globalFronts.size, 816, "Business Book 1 global unique-front inventory changed");
assert.equal(audioMeta.engine, "Kokoro-82M", "Unexpected flashcard audio engine");
assert.equal(audioMeta.buildVersion, "v1", "Unexpected flashcard audio build version");
assert.equal(audioMeta.name, "Edmund Neural", "Unexpected flashcard audio name");
assert.equal(audioMeta.voice, "af_heart", "Unexpected flashcard audio voice");
assert.equal(audioMeta.language, "en-us", "Unexpected flashcard audio language");
assert.equal(audioMeta.speed, 0.96, "Unexpected flashcard audio speed");
assert.equal(audioMeta.sampleRate, 24000, "Unexpected flashcard audio sample rate");
assert.equal(audioMeta.format, "audio/mpeg", "Unexpected flashcard audio format");
assert.equal(audioMeta.complete, true, "Flashcard audio manifest is incomplete");
assert.equal(audioMeta.count, Object.keys(audioManifest).length, "Flashcard audio count is inconsistent");
assert.ok(audioMeta.count >= 135276, `Expected at least 135276 audio mappings; found ${audioMeta.count}`);
assert.equal(
  audioMeta.corpusSha256,
  crypto.createHash("sha256").update(Object.keys(audioManifest).sort().join("\n")).digest("hex"),
  "Flashcard audio corpus hash is inconsistent"
);

const navigationMatch = html.match(/const businessConceptDecks = (\[[\s\S]*?\n    \]);/);
assert.ok(navigationMatch, "Could not locate the Business Concepts navigation list");
const navigation = vm.runInNewContext(`(${navigationMatch[1]})`, Object.create(null), {
  timeout: 1_000,
});
assert.deepEqual(
  Array.from(navigation, (deck) => String(deck.deckId)),
  expected.map(({ deckId }) => deckId),
  "Business navigation must expose Q1-Q10 in exact order"
);
for (const [index, deck] of Array.from(navigation).entries()) {
  const item = expected[index];
  assert.equal(String(deck.label), item.label, `${item.deckId}: navigation label changed`);
  assert.equal(
    String(deck.title),
    `Business - Book 1 - ${item.label}`,
    `${item.deckId}: selected-deck title changed`
  );
}
assert.match(
  html,
  /<script src="flashcards-business-concepts-book1-data\.js\?v=20260816-1"><\/script>/,
  "Business Book 1 data file is not loaded by flashcards.html"
);
assert.match(
  html,
  /<script src="flashcards-audio-manifest\.js\?v=edmund-neural-v1-20260827-1"><\/script>/,
  "Edmund Neural audio cache key is stale"
);
assert.ok(
  html.indexOf(`src="${dataFile}`) < html.indexOf("src=\"flashcards-audio-manifest.js"),
  "Business seed must load before the audio manifest and flashcard application"
);
assert.ok(
  html.includes('route === "business-english-business-concepts"'),
  "Business Concepts route handler is missing"
);
assert.ok(
  html.includes("businessConceptDecks.map(deck => optionButton(deck.label, deck.deckId, deck.title))"),
  "Business Concepts route no longer renders the registered decks"
);
assert.ok(
  html.includes("addAggregate(section.prefix, `商務英語 Business English / ${section.label}`, businessConceptDecks.length)"),
  "Business aggregate access-control count is not derived from the ten-deck list"
);
assert.match(
  audioGeneratorSource,
  /\(\s*"flashcards-business-concepts-book1-data\.js",\s*"window\.EDMUND_BUSINESS_CONCEPTS_BOOK1_SEED = ",\s*None,\s*\)/,
  "The flashcard audio generator does not ingest the external Business seed"
);

const homeworkResources = HOMEWORK_RESOURCE_CATALOG
  .filter((resource) => resource.id.startsWith(`flash:${prefix}/`))
  .sort((left, right) => Number(left.ordinal) - Number(right.ordinal));
assert.equal(homeworkResources.length, 10, "Homework must index all ten Business Book 1 decks");
for (const [index, resource] of homeworkResources.entries()) {
  const item = expected[index];
  assert.equal(resource.id, `flash:${item.deckId}`, `${item.deckId}: Homework id changed`);
  assert.equal(resource.ordinal, item.number, `${item.deckId}: Homework ordinal changed`);
  assert.equal(resource.label, item.label, `${item.deckId}: Homework label changed`);
  assert.equal(
    resource.url,
    `flashcards.html?deck=${encodeURIComponent(item.deckId)}`,
    `${item.deckId}: Homework deep link changed`
  );
  assert.match(resource.detail, new RegExp(`· ${item.cards} cards$`), `${item.deckId}: Homework card count changed`);
}

console.log(JSON.stringify({
  decks: expected.length,
  cards: cardCount,
  uniqueFronts: globalFronts.size,
  newDeckCards: expected.slice(2).reduce((total, item) => total + item.cards, 0),
  audioMappings: audioMeta.count,
  homeworkResources: homeworkResources.length,
}, null, 2));
