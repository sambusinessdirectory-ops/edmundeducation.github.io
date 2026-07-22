#!/usr/bin/env node

import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataOnly = process.argv.includes("--data-only");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parseAssignment(source, marker, endMarker = ";\n") {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing assignment: ${marker}`);
  const valueStart = start + marker.length;
  const end = source.indexOf(endMarker, valueStart);
  if (end < 0) throw new Error(`Missing assignment terminator after: ${marker}`);
  return JSON.parse(source.slice(valueStart, end).trim().replace(/;$/, ""));
}

function normalizeCardText(value) {
  return String(value || "")
    .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
    .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
    .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2")
    .trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const dataSource = read("flashcards-ielts-reading-passage-1-data.js");
const seed = parseAssignment(
  dataSource,
  "window.EDMUND_IELTS_READING_PASSAGE_1_SEED = ",
  ";\nwindow.EDMUND_IELTS_READING_PASSAGE_1_TITLES"
);
const titles = parseAssignment(
  dataSource,
  "window.EDMUND_IELTS_READING_PASSAGE_1_TITLES = ",
  ";\nwindow.EDMUND_IELTS_READING_PASSAGE_1_META"
);
const meta = parseAssignment(
  dataSource,
  "window.EDMUND_IELTS_READING_PASSAGE_1_META = ",
  ";\nwindow.EDMUND_FLASHCARD_SEED"
);

const expectedOrdinals = Array.from({ length: 162 }, (_, index) => index + 2)
  .filter(ordinal => !new Set([10, 16, 26, 27, 33]).has(ordinal));
const deckIds = Object.keys(seed);
assert(deckIds.length === 157, `Expected 157 generated decks, found ${deckIds.length}`);
assert(Object.keys(titles).length === 157, `Expected 157 generated titles, found ${Object.keys(titles).length}`);
assert(meta.deckCount === 157, `Metadata deck count is ${meta.deckCount}`);
assert(meta.cardCount === 30029, `Expected 30,029 cards, found ${meta.cardCount}`);
assert(meta.uniqueFrontCount === 27280, `Expected 27,280 unique fronts, found ${meta.uniqueFrontCount}`);
assert(JSON.stringify(meta.ordinals) === JSON.stringify(expectedOrdinals), "Generated ordinal inventory is incorrect");
assert(titles["Practice 44"] === "Voyage of Going: Beyond the Blue Line", "Practice 44 title correction is missing");
assert(titles["Practice 48"] === "What Do Managers Really Do?", "Practice 48 title correction is missing");
assert(titles["Practice 130"] === "Exploring British Village", "Practice 130 title correction is missing");

let cardCount = 0;
const uniqueFronts = new Set();
for (const ordinal of expectedOrdinals) {
  const practice = `Practice ${ordinal}`;
  const deckId = `ielts/reading/passage-1/${practice}`;
  const cards = seed[deckId];
  assert(Array.isArray(cards) && cards.length > 0, `${deckId} has no cards`);
  assert(typeof titles[practice] === "string" && titles[practice].trim(), `${practice} has no title`);
  for (const [index, card] of cards.entries()) {
    const location = `${deckId} card ${index + 1}`;
    assert(typeof card.front === "string" && card.front.trim(), `${location} has no front`);
    assert(typeof card.meaning === "string" && card.meaning.trim(), `${location} has no meaning`);
    assert(Array.isArray(card.examples) && card.examples.length > 0, `${location} has no examples`);
    assert(card.examples.every(example => typeof example.en === "string" && example.en.trim()), `${location} has a blank English example`);
    assert(card.examples.every(example => typeof example.zh === "string"), `${location} has an invalid Chinese example`);
    assert(typeof card.source === "string" && new RegExp(`^Flash Cards\\s+${ordinal}\\b`).test(card.source), `${location} has the wrong source filename`);
    assert(Number.isInteger(card.sourcePage) && card.sourcePage > 0, `${location} has an invalid source page`);
    uniqueFronts.add(normalizeCardText(card.front));
    cardCount += 1;
  }
}
assert(cardCount === meta.cardCount, `Card rows total ${cardCount}, metadata says ${meta.cardCount}`);
assert(uniqueFronts.size === meta.uniqueFrontCount, `Unique fronts total ${uniqueFronts.size}, metadata says ${meta.uniqueFrontCount}`);

const html = read("flashcards.html");
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
assert(html.includes('const IELTS_READING_PASSAGE_1_DATA_URL = "flashcards-ielts-reading-passage-1-data.js?v=20260722-1"'), "Passage 1 lazy-load URL is missing");
assert(!html.includes('<script src="flashcards-ielts-reading-passage-1-data.js'), "Passage 1 data should not block the login page");
assert(html.includes("await ensureIeltsReadingPassage1Data()"), "IELTS Reading does not wait for its Passage 1 data");
assert(html.includes('<script src="flashcards-audio-manifest.js?v=edmund-neural-v1-20260722-1"></script>'), "Flashcard audio cache key is stale");
assert(html.includes("ieltsReadingPracticesForPassage(passage)"), "IELTS Reading chooser is not using passage-specific decks");
assert(html.includes("ieltsReadingPracticeLabel(passage, practice)"), "IELTS Reading chooser is not rendering passage titles");
const inlineSeed = parseAssignment(html, "window.EDMUND_FLASHCARD_SEED = ", ";\n  </script>");
assert(inlineSeed["ielts/reading/passage-1/Practice 1"]?.length === 140, "Existing Practice 1 changed unexpectedly");

let audioResult = { checked: false };
if (!dataOnly) {
  const manifestSource = read("flashcards-audio-manifest.js");
  const manifest = parseAssignment(
    manifestSource,
    "window.EDMUND_FLASHCARD_AUDIO = Object.freeze(",
    ");\nwindow.EDMUND_FLASHCARD_AUDIO_META"
  );
  const audioMeta = parseAssignment(
    manifestSource,
    "window.EDMUND_FLASHCARD_AUDIO_META = Object.freeze(",
    ");\n"
  );
  assert(audioMeta.complete === true, "Flashcard audio manifest is incomplete");
  assert(audioMeta.count === 61701, `Expected 61,701 manifest entries, found ${audioMeta.count}`);
  const cloudIndex = JSON.parse(read("workers/edmund-audio/src/flashcard-pack-index.json"));
  assert(cloudIndex.schemaVersion === 1, "Flashcard cloud-pack index schema is invalid");
  assert(cloudIndex.meta?.entryCount === 27280, `Expected 27,280 cloud recordings, found ${cloudIndex.meta?.entryCount}`);
  assert(cloudIndex.meta?.packCount === 256, `Expected 256 cloud packs, found ${cloudIndex.meta?.packCount}`);
  assert(cloudIndex.meta?.r2UploadComplete === true, "Flashcard cloud-pack release is not marked uploaded");
  assert(cloudIndex.audioPathPrefix.includes("v1-passage1-20260722/"), "Cloud audio URLs are not release-versioned");
  const missing = [];
  let localAudio = 0;
  let cloudAudio = 0;
  for (const front of uniqueFronts) {
    const audioUrl = manifest[front];
    if (!audioUrl) {
      missing.push(`${front}: no manifest entry`);
      continue;
    }
    const digest = crypto.createHash("sha256").update(front).digest("hex").slice(0, 24);
    const localRelativePath = `assets/flashcards/audio/edmund-neural/v1/${digest.slice(0, 2)}/${digest}.mp3`;
    const localPath = path.join(root, localRelativePath);
    const cloudRelativePath = `${cloudIndex.audioPathPrefix}${digest.slice(0, 2)}/${digest}.mp3`;
    const expectedUrl = `${String(cloudIndex.cloudBaseUrl).replace(/\/+$/, "")}/${cloudRelativePath}`;
    const packEntry = cloudIndex.entries?.[digest.slice(0, 2)]?.[digest.slice(2)];
    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 1000) {
      localAudio += 1;
      if (audioUrl !== localRelativePath) {
        missing.push(`${front}: expected retained local URL ${localRelativePath}, found ${audioUrl}`);
      }
    } else if (audioUrl !== expectedUrl) {
      missing.push(`${front}: expected cloud URL ${expectedUrl}, found ${audioUrl}`);
    } else {
      cloudAudio += 1;
    }
    if (!Array.isArray(packEntry) || packEntry.length !== 2 || packEntry[1] <= 1000) {
      missing.push(`${front}: missing from the cloud pack index`);
    }
    if (missing.length >= 20) break;
  }
  assert(!missing.length, `Missing Passage 1 audio:\n${missing.join("\n")}`);
  assert(localAudio === 1122, `Expected 1,122 retained local recordings, found ${localAudio}`);
  assert(cloudAudio === 26158, `Expected 26,158 cloud recordings, found ${cloudAudio}`);
  audioResult = { checked: true, manifestEntries: Object.keys(manifest).length, localAudio, cloudAudio };
}

console.log(JSON.stringify({
  decks: deckIds.length,
  cards: cardCount,
  uniqueFronts: uniqueFronts.size,
  firstPractice: expectedOrdinals[0],
  lastPractice: expectedOrdinals.at(-1),
  missingPractices: [10, 16, 26, 27, 33],
  existingPractice1Cards: 140,
  totalPublishedPassage1Decks: deckIds.length + 1,
  audio: audioResult
}, null, 2));
