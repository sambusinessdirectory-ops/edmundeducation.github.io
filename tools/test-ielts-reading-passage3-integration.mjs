#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const html = read("flashcards.html");
const catalogGenerator = read("tools/generate-homework-resource-catalog.mjs");

const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map(match => match[1])
  .filter(source => source.trim());
for (const [index, source] of inlineScripts.entries()) {
  try {
    new Function(source);
  } catch (error) {
    throw new Error(`Inline flashcards script ${index + 1} has invalid syntax: ${error.message}`);
  }
}

assert(
  html.includes('const IELTS_READING_PASSAGE_3_DATA_URL = "flashcards-ielts-reading-passage-3-data.js?v=20260731-1";'),
  "Passage 3 lazy-load URL is missing"
);
assert(
  html.includes('const IELTS_READING_PASSAGE_3_PREFIX = "ielts/reading/passage-3";'),
  "Passage 3 deck prefix is missing"
);
assert(
  html.includes("const IELTS_READING_PASSAGE_3_CARD_COUNT = 33025;"),
  "Passage 3 unloaded card-count constant is missing"
);
assert(
  !html.includes('<script src="flashcards-ielts-reading-passage-3-data.js'),
  "Passage 3 data should not block the login page"
);
assert(html.includes("function ensureIeltsReadingPassage3Data()"), "Passage 3 lazy loader is missing");
assert(
  html.includes('script.dataset.ieltsReadingPassage3 = "true"'),
  "Passage 3 lazy-load script is not identifiable"
);
assert(
  /function ensureIeltsReadingPassage3Data\(\)[\s\S]*?EDMUND_IELTS_READING_PASSAGE_3_SEED[\s\S]*?IELTS_READING_PASSAGE_3_DATA_URL[\s\S]*?EDMUND_IELTS_READING_PASSAGE_3_SEED/.test(html),
  "Passage 3 loader does not validate its generated seed"
);
assert(!html.includes("function ensureIeltsReadingData()"), "IELTS Reading must never bulk-load all three passage bundles");
assert(
  /function ensureIeltsReadingDataForDeck\(deckId\)[\s\S]*?IELTS_READING_PASSAGE_3_PREFIX[\s\S]*?return ensureIeltsReadingPassage3Data\(\)/.test(html),
  "Passage 3 direct links do not select the Passage 3 lazy loader"
);
assert(
  html.includes("window.EDMUND_IELTS_READING_PASSAGE_3_TITLES?.[practice]"),
  "IELTS Reading labels do not use Passage 3 canonical titles"
);
assert(
  /function deckCardCount\(prefix\)[\s\S]*?unloadedPassage3Count[\s\S]*?IELTS_READING_PASSAGE_3_CARD_COUNT[\s\S]*?unloadedPassage1Count \+ unloadedPassage2Count \+ unloadedPassage3Count/.test(html),
  "Aggregate card counts do not include unloaded Passage 3 cards"
);
assert(!html.includes("await ensureIeltsReadingData();"), "Search still bulk-loads every Reading passage");

const directLinkStart = html.indexOf("async function openRequestedHomeworkDeck()");
const directLinkEnd = html.indexOf("\n    async function openRequestedFlashcardTarget()", directLinkStart);
assert(directLinkStart >= 0 && directLinkEnd > directLinkStart, "Homework direct-link handler is missing");
const directLinkBlock = html.slice(directLinkStart, directLinkEnd);
const lazyLoadPosition = directLinkBlock.indexOf("await ensureIeltsReadingDataForDeck(deckId)");
const cardLookupPosition = directLinkBlock.indexOf("getDeckCards(deckId)");
assert(lazyLoadPosition >= 0, "Homework direct links do not await deck-specific IELTS data");
assert(cardLookupPosition > lazyLoadPosition, "Homework direct links inspect cards before Passage 3 can load");

const inlineSeedStart = html.indexOf("window.EDMUND_FLASHCARD_SEED = ");
const inlineSeedEnd = html.indexOf(";\n  </script>", inlineSeedStart);
assert(inlineSeedStart >= 0 && inlineSeedEnd > inlineSeedStart, "Inline flashcard seed is missing");
const inlineSeed = JSON.parse(
  html.slice(inlineSeedStart + "window.EDMUND_FLASHCARD_SEED = ".length, inlineSeedEnd)
);
assert(
  inlineSeed["ielts/reading/passage-3/Practice 1"]?.length === 279,
  "Existing Passage 3 Practice 1 changed unexpectedly"
);
const generatedSource = read("flashcards-ielts-reading-passage-3-data.js");
const generatedSeedMatch = generatedSource.match(/window\.EDMUND_IELTS_READING_PASSAGE_3_SEED = (\{[\s\S]*?\});\nwindow\.EDMUND_IELTS_READING_PASSAGE_3_TITLES/);
assert(generatedSeedMatch, "Generated Passage 3 seed is missing");
const generatedSeed = JSON.parse(generatedSeedMatch[1]);
assert(
  Object.keys(generatedSeed).every((deckId) => !(deckId in inlineSeed)),
  "A generated Passage 3 deck would silently overwrite an inline deck"
);

const readingIndexSource = read("flashcards-ielts-reading-index.js");
const readingIndexMatch = readingIndexSource.match(/window\.EDMUND_IELTS_READING_INDEX = Object\.freeze\((\{.*\})\);/s);
assert(readingIndexMatch, "Lightweight IELTS Reading index is missing");
const readingIndex = JSON.parse(readingIndexMatch[1]);
assert(readingIndex["Passage 1"].length === 158, "Passage 1 index count is incorrect");
assert(readingIndex["Passage 2"].length === 151, "Passage 2 index count is incorrect");
assert(readingIndex["Passage 3"].length === 166, "Passage 3 index count is incorrect");
assert(readingIndex["Passage 3"].reduce((sum, row) => sum + row.cardCount, 0) === 33304, "Passage 3 index card total is incorrect");
assert(
  html.includes('<script src="flashcards-ielts-reading-index.js?v=20260731-1"></script>'),
  "Flashcards page does not load the lightweight Reading index"
);
const chooserStart = html.indexOf("function showIeltsReading()");
const chooserEnd = html.indexOf("\n    async function showIeltsReadingPassage", chooserStart);
assert(chooserStart >= 0 && chooserEnd > chooserStart, "Lightweight IELTS Reading chooser is missing");
const chooserBlock = html.slice(chooserStart, chooserEnd);
assert(!chooserBlock.includes("ensureIeltsReadingData()"), "Reading chooser still downloads all three full card bundles");
assert(!/"columns-grid one",\s*false/.test(chooserBlock), "Reading chooser does not preserve the IELTS home screen in Back navigation");
assert(
  /async function showIeltsReadingPassage\(passageNumber\)[\s\S]*?await ensureIeltsReadingDataForDeck\(passageId\)/.test(html),
  "Passage chooser does not lazy-load only the selected passage"
);
assert(
  /async function openSearchDeckResult\(deckId, aggregate = false\)[\s\S]*?if \(!aggregate\)[\s\S]*?await ensureIeltsReadingDataForDeck\(deckId\)[\s\S]*?getDeckCards\(deckId\)/.test(html),
  "Exact Reading search results do not load their passage before opening the deck"
);
assert(
  /const searchDeckButton[\s\S]*?await openSearchDeckResult\(/.test(html),
  "Search result clicks do not await lazy Reading deck loading"
);

assert(
  catalogGenerator.includes("sandbox.window.EDMUND_IELTS_READING_PASSAGE_3_TITLES"),
  "Homework catalog generator does not use Passage 3 canonical titles"
);
assert(
  /deckId\.match\(\/\^ielts\\\/reading\\\/passage-\(\[123\]\)\\\/\(Practice \\d\+\)\$\//.test(catalogGenerator),
  "Homework catalog generator does not recognize Passage 3 deck IDs"
);
assert(
  catalogGenerator.includes("flashcards.html?deck=${encodeURIComponent(deckId)}"),
  "Homework catalog generator does not create encoded flashcard deep links"
);

console.log("IELTS Reading Passage 3 UI and Homework integration checks passed.");
