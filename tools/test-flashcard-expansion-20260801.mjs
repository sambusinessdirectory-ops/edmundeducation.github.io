#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { HOMEWORK_RESOURCE_CATALOG } from "../homework-resource-catalog.mjs";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDirectory, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index);
const CJK = /[\u3400-\u4dbf\u4e00-\u9fff]/;
const INVALID_TEXT = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd]/;

const practicalSources = new Map([
  ["letter-of-request", "Flash Cards -實用文 - Letter Of Request.pdf"],
  ["outline", "Flash Cards -實用文 - Outline : Summary.pdf"],
  ["speech", "Flash Cards -實用文 - Speech.pdf"],
  ["press-release", "Flash Cards -實用文 - Press Release.pdf"],
  ["letter-of-invitation-to-winners", "Flash Cards -實用文 - Letter of Invitation (Winner).pdf"],
  ["letter-of-request-informal", "Flash Cards -實用文 - Informal letter of request.pdf"],
  ["letter-of-invitation-spokesperson", "Flash Cards -實用文 - Letter of Invitation (Spokesperson).pdf"],
  ["proposal", "Flash Cards -實用文 - Proposal.pdf"],
  ["report", "Flash Cards -實用文 - Report.pdf"],
  ["letter-of-reply", "Flash Cards -實用文 - Letter of Reply.pdf"],
  ["negative-emails", "Flash Cards -實用文 - Negative Letter.pdf"],
  ["letter-of-enquiry", "Flash Cards -實用文 - Letter of Enquiry .pdf"]
]);

function sourceForDseReading(part, year) {
  if (part === "b2") return `Flash Cards - DSE Reading - B2 - ${year}.pdf`;
  const label = part.toUpperCase();
  return year <= 2020
    ? `Flash Card - DSE Reading - ${year} - ${label}.pdf`
    : `Flash Cards - DSE Reading - ${label} - ${year}.pdf`;
}

function entriesFor(prefix, values, sourceForValue) {
  return values.map(value => {
    const deckId = `${prefix}/${value}`;
    return [deckId, sourceForValue(value)];
  });
}

const inventories = {
  "ielts-listening": new Map(
    range(2, 20).flatMap(practice => range(1, 4).map(task => [
      `ielts/listening/Practice ${practice}/task-${task}`,
      `IELTS Listening > Practice ${practice} > Task ${task}.pdf`
    ]))
  ),
  "dse-reading": new Map(
    ["a", "b1", "b2"].flatMap(part => range(2012, 2025).map(year => [
      `dse/reading/part-${part}/${year}`,
      sourceForDseReading(part, year)
    ]))
  ),
  "dse-paper3-b2": new Map(
    entriesFor(
      "dse/paper-3/part-b-data-file-b2",
      range(2012, 2023),
      year => `Flash Cards - ${year} B2 Data File.pdf`
    )
  ),
  "dse-practical-writing": new Map(
    [...practicalSources].map(([slug, source]) => [
      `dse/paper-3/practical-english-writing/practical-formats/${slug}`,
      source
    ])
  )
};

const specs = [
  {
    group: "ielts-listening",
    file: "flashcards-ielts-listening-practices-2-20-data.js",
    seedGlobal: "EDMUND_IELTS_LISTENING_PRACTICES_2_20_SEED",
    metaGlobal: "EDMUND_IELTS_LISTENING_PRACTICES_2_20_META",
    deckCount: 76,
    cardCount: 9460,
    pageCount: 915
  },
  {
    group: "dse-reading",
    file: "flashcards-dse-reading-2012-2025-data.js",
    seedGlobal: "EDMUND_DSE_READING_2012_2025_SEED",
    metaGlobal: "EDMUND_DSE_READING_2012_2025_META",
    deckCount: 42,
    cardCount: 7475,
    pageCount: 705
  },
  {
    group: "dse-paper3-b2",
    file: "flashcards-dse-paper3-b2-2012-2023-data.js",
    seedGlobal: "EDMUND_DSE_PAPER3_B2_2012_2023_SEED",
    metaGlobal: "EDMUND_DSE_PAPER3_B2_2012_2023_META",
    deckCount: 12,
    cardCount: 2941,
    pageCount: 279
  },
  {
    group: "dse-practical-writing",
    file: "flashcards-dse-practical-writing-data.js",
    seedGlobal: "EDMUND_DSE_PRACTICAL_WRITING_SEED",
    metaGlobal: "EDMUND_DSE_PRACTICAL_WRITING_META",
    deckCount: 12,
    cardCount: 630,
    pageCount: 63
  }
];

function evaluate(source, filename, sandbox = { window: {} }) {
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename, timeout: 60_000 });
  return sandbox.window;
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right, "en"));
}

const allDecks = new Map();
const bundleSources = new Map();
let totalCards = 0;
let totalPages = 0;

for (const spec of specs) {
  const source = read(spec.file);
  bundleSources.set(spec.file, source);
  const globals = evaluate(source, spec.file);
  const seed = globals[spec.seedGlobal];
  const meta = globals[spec.metaGlobal];
  const expectedInventory = inventories[spec.group];

  assert.ok(seed && typeof seed === "object" && !Array.isArray(seed), `${spec.file} must publish its seed`);
  assert.ok(meta && typeof meta === "object" && !Array.isArray(meta), `${spec.file} must publish metadata`);
  assert.equal(meta.release, "20260801-1", `${spec.group} release changed`);
  assert.equal(meta.group, spec.group, `${spec.group} metadata group changed`);
  assert.equal(meta.deckCount, spec.deckCount, `${spec.group} metadata deck count changed`);
  assert.equal(meta.cardCount, spec.cardCount, `${spec.group} metadata card count changed`);
  assert.equal(meta.pageCount, spec.pageCount, `${spec.group} metadata page count changed`);
  assert.equal(meta.sourcePdfCount, spec.deckCount, `${spec.group} source PDF count changed`);
  assert.equal(meta.uniqueFrontCount + meta.repeatedFrontCount, meta.cardCount, `${spec.group} front metadata is inconsistent`);

  const actualIds = Object.keys(seed);
  const expectedIds = [...expectedInventory.keys()];
  assert.deepEqual(sorted(actualIds), sorted(expectedIds), `${spec.group} deck inventory changed`);
  assert.deepEqual(
    sorted(Object.keys(meta.sourceSha256 || {})),
    sorted(expectedInventory.values()),
    `${spec.group} source filename inventory changed`
  );
  for (const [sourceName, digest] of Object.entries(meta.sourceSha256 || {})) {
    assert.match(digest, /^[a-f0-9]{64}$/, `${sourceName} needs a full SHA-256 digest`);
  }

  let groupCards = 0;
  const normalizedFronts = new Set();
  for (const deckId of expectedIds) {
    const cards = seed[deckId];
    const expectedSource = expectedInventory.get(deckId);
    assert.ok(Array.isArray(cards) && cards.length > 0, `${deckId} must contain cards`);
    allDecks.set(deckId, cards);
    for (const [cardIndex, card] of cards.entries()) {
      const location = `${deckId} card ${cardIndex + 1}`;
      assert.ok(card && typeof card === "object" && !Array.isArray(card), `${location} must be an object`);
      assert.equal(typeof card.front, "string", `${location} front must be text`);
      assert.equal(typeof card.meaning, "string", `${location} meaning must be text`);
      assert.ok(card.front.trim(), `${location} needs an English front`);
      assert.ok(card.meaning.trim(), `${location} needs a Chinese meaning`);
      assert.equal(CJK.test(card.front), false, `${location} English front contains CJK text`);
      assert.equal(INVALID_TEXT.test(card.front + card.meaning), false, `${location} contains invalid text`);
      assert.equal(card.source, expectedSource, `${location} has incorrect source provenance`);
      assert.ok(Number.isInteger(card.sourcePage) && card.sourcePage > 0, `${location} has an invalid source page`);
      assert.equal(card.examples?.length, 5, `${location} must have five aligned examples`);
      for (const [exampleIndex, example] of card.examples.entries()) {
        const exampleLocation = `${location} example ${exampleIndex + 1}`;
        assert.equal(typeof example?.en, "string", `${exampleLocation} English must be text`);
        assert.equal(typeof example?.zh, "string", `${exampleLocation} Chinese must be text`);
        assert.ok(example.en.trim(), `${exampleLocation} needs English`);
        assert.ok(example.zh.trim(), `${exampleLocation} needs Chinese`);
        assert.equal(CJK.test(example.en), false, `${exampleLocation} English contains CJK text`);
        assert.equal(INVALID_TEXT.test(example.en + example.zh), false, `${exampleLocation} contains invalid text`);
      }
      assert.equal(
        [card.meaning, ...card.examples.map(example => example.zh)].some(value => CJK.test(value)),
        true,
        `${location} Chinese side contains no CJK text`
      );
      normalizedFronts.add(card.front.replace(/\s+/g, " ").trim());
      groupCards += 1;
    }
  }
  assert.equal(groupCards, spec.cardCount, `${spec.group} card rows changed`);
  assert.equal(normalizedFronts.size, meta.uniqueFrontCount, `${spec.group} unique-front metadata changed`);
  assert.equal(actualIds.length, spec.deckCount, `${spec.group} deck rows changed`);
  totalCards += groupCards;
  totalPages += meta.pageCount;
}

assert.equal(allDecks.size, 142, "The expansion must contain exactly 142 decks");
assert.equal(totalCards, 20_506, "The expansion must contain exactly 20,506 cards");
assert.equal(totalPages, 1_962, "The expansion must retain all 1,962 source pages");

const combined = { window: {} };
vm.createContext(combined);
for (const spec of specs) {
  vm.runInContext(bundleSources.get(spec.file), combined, { filename: spec.file, timeout: 60_000 });
}
assert.deepEqual(
  sorted(Object.keys(combined.window.EDMUND_FLASHCARD_SEED || {})),
  sorted(allDecks.keys()),
  "The four bundles must merge exactly the 142 expansion decks"
);
for (const spec of specs) {
  const seed = combined.window[spec.seedGlobal];
  for (const deckId of inventories[spec.group].keys()) {
    assert.equal(
      combined.window.EDMUND_FLASHCARD_SEED[deckId],
      seed[deckId],
      `${deckId} lost its bundle object during seed integration`
    );
  }
}

const stubCards = allDecks.get("ielts/listening/Practice 3/task-3")
  .filter(card => card.sourcePage === 18 && card.front === "resembles an artwork");
assert.equal(stubCards.length, 1, "The incomplete 'resembles an artwork' duplicate stub must be absent");
assert.equal(stubCards[0].examples[0].en, "The programme resembles an artwork.");
assert.equal(stubCards[0].examples[0].zh, "這份節目單像一件藝術品。");

function uniqueCard(deckId, front, sourcePage) {
  const matches = allDecks.get(deckId).filter(card => card.front === front && card.sourcePage === sourcePage);
  assert.equal(matches.length, 1, `${deckId} must contain one repaired '${front}' card on page ${sourcePage}`);
  return matches[0];
}

const dataFileAfcd = uniqueCard(
  "dse/paper-3/part-b-data-file-b2/2014",
  "Agriculture, Fisheries and Conservation Department",
  23
);
assert.equal(
  dataFileAfcd.examples[1].en,
  "The Agriculture, Fisheries and Conservation Department is a government department dealing with farming, fisheries, country parks, and animal-related matters."
);
assert.equal(
  dataFileAfcd.examples[1].zh,
  "Agriculture, Fisheries and Conservation Department 是處理農業、漁業、郊野公園和動物相關事務的政府部門。"
);

const readingAfcd = uniqueCard(
  "dse/reading/part-b1/2025",
  "Agriculture, Fisheries and Conservation Department",
  4
);
assert.equal(
  readingAfcd.examples[1].en,
  "The Agriculture, Fisheries and Conservation Department is a government department connected with farming, fisheries, nature conservation, and country parks."
);
assert.equal(
  readingAfcd.examples[1].zh,
  "Agriculture, Fisheries and Conservation Department 指與農業、漁業、自然保育和郊野公園有關的政府部門。"
);

const winterClothes = uniqueCard("ielts/listening/Practice 18/task-4", "warm winter clothes", 5);
assert.deepEqual(
  Array.from(winterClothes.examples, example => example.zh),
  [
    "幾個孩子可能需要保暖冬衣。",
    "保暖冬衣是在寒冷天氣中令人保暖的衣物。",
    "頸巾、帽、手套和毛衣都是保暖冬衣。",
    "編織可以幫助家庭以較低成本製作保暖冬衣。",
    "這個短語描述寒冷季節的衣物。"
  ],
  "The repaired warm-winter-clothes translation changed"
);

const html = read("flashcards.html");
for (const spec of specs) {
  assert.ok(
    html.includes(`"${spec.file}?v=20260801-1"`),
    `${spec.file} is not registered for lazy loading in flashcards.html`
  );
  assert.ok(html.includes(`globalName: "${spec.seedGlobal}"`), `${spec.seedGlobal} is not in the lazy bundle registry`);
}
assert.ok(html.includes("ensureSupplementalFlashcardDataForDeck"), "Supplemental deck deep-link loading is missing");

const catalogIds = new Map();
for (const resource of HOMEWORK_RESOURCE_CATALOG) {
  const items = catalogIds.get(resource.id) || [];
  items.push(resource);
  catalogIds.set(resource.id, items);
}
let homeworkLinks = 0;
for (const [deckId, cards] of allDecks) {
  const id = `flash:${deckId}`;
  const resources = catalogIds.get(id) || [];
  assert.equal(resources.length, 1, `${deckId} must appear exactly once in the Homework catalogue`);
  const resource = resources[0];
  assert.equal(resource.type, "flashcards", `${deckId} Homework resource has the wrong type`);
  assert.equal(resource.url, `flashcards.html?deck=${encodeURIComponent(deckId)}`, `${deckId} has an incorrect deep link`);
  assert.ok(resource.label?.trim(), `${deckId} needs an itemized Homework label`);
  assert.ok(resource.detail?.includes(`· ${cards.length} cards`), `${deckId} Homework detail has the wrong card count`);
  homeworkLinks += 1;
}
assert.equal(homeworkLinks, 142, "All 142 Homework deep links must be itemized");

console.log(JSON.stringify({
  decks: allDecks.size,
  cards: totalCards,
  pages: totalPages,
  homeworkLinks,
  groups: Object.fromEntries(specs.map(spec => [spec.group, {
    decks: spec.deckCount,
    cards: spec.cardCount,
    pages: spec.pageCount
  }]))
}, null, 2));
