#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const dataFile = "flashcards-ielts-writing-task1-data.js";

const families = [
  {
    slug: "bar-charts",
    label: "Bar Chart",
    deckCounts: [45, 47, 45, 43, 46, 47, 51, 45],
    pageCounts: [5, 5, 5, 5, 5, 5, 6, 5]
  },
  {
    slug: "line-graphs",
    label: "Line Graph",
    deckCounts: [52, 56, 54, 52, 50, 58, 54, 66, 62],
    pageCounts: [6, 6, 6, 6, 5, 6, 5, 7, 7]
  },
  {
    slug: "pie-charts",
    label: "Pie Chart",
    deckCounts: [49, 54, 47, 49, 52, 55],
    pageCounts: [5, 6, 5, 5, 5, 6]
  },
  {
    slug: "process-diagrams",
    label: "Process Diagram",
    deckCounts: [54, 59, 52, 60, 53, 61, 52, 63, 63],
    pageCounts: [5, 6, 6, 6, 6, 6, 6, 7, 6]
  }
];

const expectedDecks = families.flatMap(family => family.deckCounts.map((cardCount, index) => {
  const ordinal = index + 1;
  const deckSlug = `${family.label.toLowerCase().replaceAll(" ", "-")}-${ordinal}`;
  return {
    familySlug: family.slug,
    id: `ielts/writing/task-1/${family.slug}/${deckSlug}`,
    title: `${family.label} ${ordinal}`,
    source: `Flash Card - IELTS Writing Task 1 - ${family.label} ${ordinal}.pdf`,
    cardCount,
    pageCount: family.pageCounts[index]
  };
}));

assert.deepEqual(
  families.map(family => family.deckCounts.length),
  [8, 9, 6, 9],
  "The family inventory must remain 8 Bar, 9 Line, 6 Pie and 9 Process decks"
);
assert.equal(expectedDecks.length, 32, "The fixed inventory must describe exactly 32 decks");
assert.equal(
  expectedDecks.reduce((total, deck) => total + deck.cardCount, 0),
  1696,
  "The fixed per-deck counts must total 1,696 cards"
);

const dataPath = path.join(siteDir, dataFile);
assert.ok(fs.existsSync(dataPath), `Missing generated data file: ${dataFile}`);
const dataSource = fs.readFileSync(dataPath, "utf8");
const sandbox = { window: {} };
vm.runInNewContext(dataSource, sandbox, { filename: dataFile });

const seed = sandbox.window.EDMUND_IELTS_WRITING_TASK1_SEED;
const titles = sandbox.window.EDMUND_IELTS_WRITING_TASK1_TITLES;
assert.ok(seed && typeof seed === "object", "The Task 1 seed must be created");
assert.ok(titles && typeof titles === "object", "The Task 1 title map must be created");

const expectedDeckIds = expectedDecks.map(deck => deck.id);
assert.deepEqual(Object.keys(seed), expectedDeckIds, "Task 1 deck IDs or their stable order changed");
assert.deepEqual(Object.keys(titles), expectedDeckIds, "Task 1 title keys must match the deck IDs exactly");
assert.deepEqual(
  Object.keys(sandbox.window.EDMUND_FLASHCARD_SEED),
  expectedDeckIds,
  "The data file must register exactly the 32 Task 1 decks in a fresh seed"
);

const familyInventory = new Map(families.map(family => [family.slug, 0]));
const duplicateFronts = [];
let cardRows = 0;

for (const expected of expectedDecks) {
  assert.equal(titles[expected.id], expected.title, `${expected.id} has an unstable display title`);
  const cards = seed[expected.id];
  assert.ok(Array.isArray(cards), `${expected.id} must contain a card array`);
  assert.equal(cards.length, expected.cardCount, `${expected.id} has the wrong card count`);
  familyInventory.set(expected.familySlug, familyInventory.get(expected.familySlug) + 1);

  const pagesSeen = new Set();
  const frontsSeen = new Map();
  for (const [cardIndex, card] of cards.entries()) {
    const location = `${expected.id}, card ${cardIndex + 1}`;
    assert.equal(typeof card.front, "string", `${location} needs an English front`);
    assert.ok(card.front.trim(), `${location} has a blank English front`);
    assert.equal(card.front, card.front.trim(), `${location} has outer whitespace in its front`);
    assert.equal(typeof card.meaning, "string", `${location} needs a Chinese meaning`);
    assert.ok(card.meaning.trim(), `${location} has a blank Chinese meaning`);
    assert.equal(card.meaning, card.meaning.trim(), `${location} has outer whitespace in its meaning`);
    assert.equal(card.source, expected.source, `${location} has the wrong PDF source`);
    assert.ok(
      Number.isInteger(card.sourcePage)
        && card.sourcePage >= 1
        && card.sourcePage <= expected.pageCount,
      `${location} has sourcePage ${card.sourcePage}; expected 1-${expected.pageCount}`
    );
    pagesSeen.add(card.sourcePage);

    assert.equal(card.examples?.length, 5, `${location} must contain exactly five examples`);
    for (const [exampleIndex, example] of card.examples.entries()) {
      assert.equal(typeof example.en, "string", `${location}, example ${exampleIndex + 1} needs English`);
      assert.ok(example.en.trim(), `${location}, example ${exampleIndex + 1} has blank English`);
      assert.equal(typeof example.zh, "string", `${location}, example ${exampleIndex + 1} needs Chinese`);
      assert.ok(example.zh.trim(), `${location}, example ${exampleIndex + 1} has blank Chinese`);
    }

    const normalizedFront = card.front.trim().toLocaleLowerCase("en");
    frontsSeen.set(normalizedFront, (frontsSeen.get(normalizedFront) || 0) + 1);
    cardRows += 1;
  }

  assert.deepEqual(
    [...pagesSeen].sort((left, right) => left - right),
    Array.from({ length: expected.pageCount }, (_, index) => index + 1),
    `${expected.id} does not represent every page of ${expected.source}`
  );
  for (const [front, count] of frontsSeen) {
    if (count > 1) duplicateFronts.push({ deckId: expected.id, front, count });
  }
}

assert.equal(cardRows, 1696, `Expected 1,696 Task 1 card rows, found ${cardRows}`);
assert.deepEqual(
  Object.fromEntries(familyInventory),
  {
    "bar-charts": 8,
    "line-graphs": 9,
    "pie-charts": 6,
    "process-diagrams": 9
  },
  "The generated family deck counts changed"
);
assert.deepEqual(
  duplicateFronts,
  [{
    deckId: "ielts/writing/task-1/line-graphs/line-graph-1",
    front: "amateur dramatics",
    count: 2
  }],
  "Only the intentional duplicate ‘amateur dramatics’ may repeat within a deck"
);

const coexistenceSandbox = {
  window: {
    EDMUND_FLASHCARD_SEED: {
      "existing/deck": [{ front: "Existing card" }]
    }
  }
};
vm.runInNewContext(dataSource, coexistenceSandbox, { filename: dataFile });
assert.deepEqual(
  Object.keys(coexistenceSandbox.window.EDMUND_FLASHCARD_SEED),
  ["existing/deck", ...expectedDeckIds],
  "The generated data must preserve decks that were loaded earlier"
);

const html = fs.readFileSync(path.join(siteDir, "flashcards.html"), "utf8");
const dataScriptMatch = html.match(
  /<script\s+src="flashcards-ielts-writing-task1-data\.js\?v=[^"]+"><\/script>/
);
assert.ok(dataScriptMatch, "flashcards.html must load the generated Task 1 data with a cache key");
const dataScriptIndex = html.indexOf(dataScriptMatch[0]);
const seedReadIndex = html.indexOf("const seedDecks = window.EDMUND_FLASHCARD_SEED || {};");
assert.ok(seedReadIndex !== -1, "flashcards.html is missing its seed read");
assert.ok(dataScriptIndex < seedReadIndex, "Task 1 data must load before the app reads the flashcard seed");

assert.match(
  html,
  /function\s+showIeltsWritingTask1Decks\s*\(/,
  "The Task 1 category route needs a deck chooser"
);
for (const family of families) {
  assert.ok(
    html.includes(`ielts-writing-task1-type|${family.slug}`),
    `Task 1 is missing the ${family.slug} category route`
  );
}
assert.match(
  html,
  /route\.startsWith\("ielts-writing-task1-type\|"\)[^\n]*showIeltsWritingTask1Decks\(route\.split\("\|"\)\[1\]\)/,
  "The Task 1 category route must dispatch to its deck chooser"
);

const deckChooserStart = html.search(/function\s+showIeltsWritingTask1Decks\s*\(/);
const deckChooserEnd = html.indexOf("\n    function ", deckChooserStart + 1);
const deckChooserSource = html.slice(
  deckChooserStart,
  deckChooserEnd === -1 ? html.length : deckChooserEnd
);
assert.match(
  deckChooserSource,
  /\b(?:optionButton|columnHtml)\s*\(/,
  "The Task 1 deck chooser must render buttons that open individual decks"
);
assert.ok(
  html.includes("EDMUND_IELTS_WRITING_TASK1_TITLES"),
  "The Task 1 deck chooser must use the generated stable title map"
);

console.log(JSON.stringify({
  decks: expectedDeckIds.length,
  cards: cardRows,
  familyDecks: Object.fromEntries(familyInventory),
  intentionalWithinDeckDuplicates: duplicateFronts.length,
  uiDataLoadsBeforeSeedRead: true,
  uiCategoryRoutes: families.map(family => family.slug)
}, null, 2));
