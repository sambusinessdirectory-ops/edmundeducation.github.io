#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const dataFile = "flashcards-dse-listening-data.js";
const html = fs.readFileSync(path.join(siteDir, "flashcards.html"), "utf8");
const dataSource = fs.readFileSync(path.join(siteDir, dataFile), "utf8");
const expected = {
  "2012": {
    count: 122,
    pages: 12,
    first: "be delighted to have",
    last: "thanks for coming into",
  },
  "2013": {
    count: 134,
    pages: 13,
    first: "this week’s edition",
    last: "see you all next week",
  },
  "2014": {
    count: 137,
    pages: 13,
    first: "exotic pets in Hong Kong",
    last: "keeping goldfish",
  },
  "2015": {
    count: 115,
    pages: 11,
    first: "conference call transcript",
    last: "Bye for now",
  },
  "2016": {
    count: 109,
    pages: 10,
    first: "leading weekly podcast",
    last: "good luck with",
  },
  "2017": {
    count: 130,
    pages: 12,
    first: "listeners",
    last: "come in",
  },
  "2018": {
    count: 116,
    pages: 11,
    first: "welcome to today’s edition of",
    last: "chat to us",
  },
  "2019": {
    count: 154,
    pages: 14,
    first: "Visual Media Festival",
    last: "pass on your message",
  },
  "2020": {
    count: 119,
    pages: 11,
    first: "lots of interesting things to talk about",
    last: "Bye for now",
  },
  "2021": {
    count: 162,
    pages: 15,
    first: "this is Anthony from",
    last: "bye for now",
  },
  "2022": {
    count: 125,
    pages: 12,
    first: "wherever you are",
    last: "Goodbye for now",
  },
  "2024": {
    count: 147,
    pages: 14,
    first: "monthly Zoom meeting",
    last: "goodbye for now",
  },
  "2025": {
    count: 144,
    pages: 14,
    first: "good to see you both",
    last: "See you later",
  },
};

const sandbox = { window: {} };
vm.runInNewContext(dataSource, sandbox, { filename: dataFile });
const seed = sandbox.window.EDMUND_FLASHCARD_SEED;
assert.ok(seed && typeof seed === "object", "The flashcard seed must be created");

let checkedCards = 0;
for (const [year, details] of Object.entries(expected)) {
  const deckId = `dse/paper-3/podcast/${year}`;
  const cards = seed[deckId];
  assert.ok(Array.isArray(cards), `${deckId} must exist`);
  assert.equal(cards.length, details.count, `${deckId} has the wrong card count`);
  assert.equal(cards[0].front, details.first);
  assert.equal(cards.at(-1).front, details.last);
  assert.deepEqual(
    [...new Set(cards.map(card => card.sourcePage))],
    Array.from({ length: details.pages }, (_, index) => index + 1),
    `${deckId} must include every PDF page`
  );

  for (const [index, card] of cards.entries()) {
    assert.ok(card.front?.trim(), `${deckId} card ${index + 1} needs an English front`);
    assert.ok(card.meaning?.trim(), `${deckId} card ${index + 1} needs a Chinese meaning`);
    assert.equal(card.source, `Flash Card ${year} DSE Podcast.pdf`);
    assert.equal(card.examples?.length, 5, `${deckId} card ${index + 1} needs five examples`);
    for (const [exampleIndex, example] of card.examples.entries()) {
      assert.ok(
        example.en?.trim(),
        `${deckId} card ${index + 1}, example ${exampleIndex + 1} needs English`
      );
      assert.ok(
        example.zh?.trim(),
        `${deckId} card ${index + 1}, example ${exampleIndex + 1} needs Chinese`
      );
    }
    checkedCards += 1;
  }
}

assert.equal(checkedCards, 1714, "All 13 Podcast PDFs must contribute 1,714 cards");
assert.match(
  html,
  /const dsePodcastYears = \["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2024", "2025"\];/
);
assert.match(html, /route: "dse-paper3-podcast", metaPrefix: "dse\/paper-3\/podcast"/);
assert.match(html, /if \(route === "dse-paper3-podcast"\) showDsePaper3Podcast\(\);/);
assert.match(html, /flashcards-dse-listening-data\.js\?v=20260726-2/);

console.log("DSE Paper 3 Podcast checks passed: 1,714 cards across 13 year decks.");
