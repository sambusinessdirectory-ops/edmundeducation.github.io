#!/usr/bin/env node

import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataOnly = process.argv.includes("--data-only");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parseAssignment(source, marker, endMarker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing assignment: ${marker}`);
  const valueStart = start + marker.length;
  const end = source.indexOf(endMarker, valueStart);
  if (end < 0) throw new Error(`Missing assignment terminator after: ${marker}`);
  return JSON.parse(source.slice(valueStart, end).trim().replace(/;$/, ""));
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAudioText(value) {
  return String(value || "")
    .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
    .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
    .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2")
    .trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const source = read("flashcards-ielts-reading-passage-3-data.js");
const seed = parseAssignment(
  source,
  "window.EDMUND_IELTS_READING_PASSAGE_3_SEED = ",
  ";\nwindow.EDMUND_IELTS_READING_PASSAGE_3_TITLES"
);
const titles = parseAssignment(
  source,
  "window.EDMUND_IELTS_READING_PASSAGE_3_TITLES = ",
  ";\nwindow.EDMUND_IELTS_READING_PASSAGE_3_META"
);
const meta = parseAssignment(
  source,
  "window.EDMUND_IELTS_READING_PASSAGE_3_META = ",
  ";\nwindow.EDMUND_FLASHCARD_SEED"
);

const expectedOrdinals = Array.from({ length: 173 }, (_, index) => index + 3)
  .filter((ordinal) => !new Set([10, 11, 12, 13, 18, 21, 120, 155]).has(ordinal));
assert(expectedOrdinals.length === 165, "Expected ordinal fixture is invalid");
assert(Object.keys(seed).length === 165, `Expected 165 decks, found ${Object.keys(seed).length}`);
assert(Object.keys(titles).length === 165, `Expected 165 titles, found ${Object.keys(titles).length}`);
assert(meta.passage === 3, `Metadata passage is ${meta.passage}`);
assert(meta.deckCount === 165, `Metadata deck count is ${meta.deckCount}`);
assert(meta.cardCount === 33025, `Expected 33,025 cards, found ${meta.cardCount}`);
assert(meta.uniqueFrontCount === 30048, `Expected 30,048 unique fronts, found ${meta.uniqueFrontCount}`);
assert(Array.isArray(meta.ordinals), "Metadata ordinals must be an array");
assert(JSON.stringify(meta.ordinals) === JSON.stringify(expectedOrdinals), "Generated ordinal inventory is incorrect");

const sharedTitles = JSON.parse(read("tools/ielts-reading-passage-titles.json"))["3"];
const authoritativeTitles = {
  ...sharedTitles,
  "24": "The future of the World’s Language",
  "25": "The Game of Tennis",
  "26": "Amateur Naturalists",
  "40": "High-speed photography",
  "60": "CO-EDUCATIONAL VERSUS SINGLE-SEX CLASSROOMS",
  "126": "Is Graffiti Art or Crime?",
  "128": "Human Remains in the Green Sahara",
  "129": "The Bite That Heals",
  "139": "The Dinosaurs’ Footprints and Extinction",
  "157": "Mystery on Easter Island",
  "158": "Saving Endangered Languages",
  "164": "The Impact of Environment on Children",
  "175": "Science and the Stradivarius: Uncovering the secret of quality"
};

let cardCount = 0;
const uniqueFronts = new Set();
const audioFronts = new Set();
for (const ordinal of expectedOrdinals) {
  const practice = `Practice ${ordinal}`;
  const deckId = `ielts/reading/passage-3/${practice}`;
  const cards = seed[deckId];
  assert(Array.isArray(cards) && cards.length > 0, `${deckId} has no cards`);
  assert(titles[practice] === authoritativeTitles[String(ordinal)], `${practice} has the wrong canonical title`);
  for (const [index, card] of cards.entries()) {
    const location = `${deckId} card ${index + 1}`;
    assert(card && typeof card === "object" && !Array.isArray(card), `${location} is invalid`);
    assert(typeof card.front === "string" && card.front.trim(), `${location} has no front`);
    assert(typeof card.meaning === "string" && card.meaning.trim(), `${location} has no meaning`);
    assert(Array.isArray(card.examples) && card.examples.length === 5, `${location} must have five examples`);
    for (const [exampleIndex, example] of card.examples.entries()) {
      assert(typeof example?.en === "string" && example.en.trim(), `${location} example ${exampleIndex + 1} has no English`);
      assert(typeof example?.zh === "string" && example.zh.trim(), `${location} example ${exampleIndex + 1} has no Chinese`);
    }
    const normalMatch = card.source.match(/^Passage 3 Flash Cards\s*-?\s*(\d+)\s*-/i);
    const sourceOrdinal = card.source.startsWith("SuperFast FlPassage 3 Flash Cards 48 -")
      ? 48
      : Number(normalMatch?.[1]);
    assert(sourceOrdinal === ordinal, `${location} points to source ordinal ${sourceOrdinal || "unknown"}`);
    assert(Number.isInteger(card.sourcePage) && card.sourcePage > 0, `${location} has an invalid source page`);
    uniqueFronts.add(normalizeText(card.front));
    audioFronts.add(normalizeAudioText(card.front));
    cardCount += 1;
  }
}

assert(cardCount === meta.cardCount, `Card rows total ${cardCount}, metadata says ${meta.cardCount}`);
assert(uniqueFronts.size === meta.uniqueFrontCount, `Unique fronts total ${uniqueFronts.size}, metadata says ${meta.uniqueFrontCount}`);
assert(meta.uniqueFrontCount > 0 && meta.uniqueFrontCount <= meta.cardCount, "Unique-front metadata is invalid");

const repairs = [
  [32, "the Columbian Exchange", "contact with the Americas.", "哥倫布大交換"],
  [33, "the Americas and Oceania", "nearby islands.", "美洲、南美洲"],
  [43, "apply reading comprehension strategies", "supporting details.", "理解文本的方法"],
  [44, "changing farmers’ attitudes toward wildlife", "seeing them as useful.", "野生動物"],
  [59, "non-governmental organisations", "government control.", "不受政府直接控制"],
  [97, "transport, storage, post and telecommunications", "communication networks.", "通訊網絡"],
  [173, "Gondwana", "Australia, and India.", "古代南方超大陸"],
];
for (const [ordinal, front, englishTail, chineseText] of repairs) {
  const card = seed[`ielts/reading/passage-3/Practice ${ordinal}`].find((item) => item.front === front);
  assert(card, `Missing repaired extraction card ${front}`);
  assert(card.examples[1].en.includes(englishTail), `${front} still has truncated English`);
  assert(card.examples[1].zh.includes(chineseText), `${front} still has corrupted Chinese`);
}

assert(
  seed["ielts/reading/passage-3/Practice 48"].every((card) => card.source.startsWith("SuperFast FlPassage 3 Flash Cards 48 -")),
  "Practice 48 did not retain its explicitly mapped source"
);

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "flashcards-ielts-reading-passage-3-data.js", timeout: 20_000 });
assert(Object.keys(sandbox.window.EDMUND_FLASHCARD_SEED || {}).length === 165, "Bundle did not merge all Passage 3 decks");
assert(
  sandbox.window.EDMUND_FLASHCARD_SEED["ielts/reading/passage-3/Practice 175"] ===
    sandbox.window.EDMUND_IELTS_READING_PASSAGE_3_SEED["ielts/reading/passage-3/Practice 175"],
  "Bundle integration did not retain the Passage 3 deck object"
);

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
  assert(audioMeta.count === Object.keys(manifest).length, "Flashcard audio manifest count is inconsistent");
  const indexDirectory = path.join(root, "workers/edmund-audio/src");
  const indexes = fs.readdirSync(indexDirectory)
    .filter((file) => /^flashcard-pack-index(?:-[\w-]+)?\.json$/.test(file))
    .sort()
    .map((file) => ({ file, value: JSON.parse(read(`workers/edmund-audio/src/${file}`)) }));
  assert(indexes.some(({ file }) => file === "flashcard-pack-index-reading-expansion.json"), "Reading expansion cloud index is missing");
  assert(indexes.every(({ value }) => value.meta?.r2UploadComplete === true), "A cloud audio index is incomplete");
  const missing = [];
  let localAudio = 0;
  let cloudAudio = 0;
  let expansionAudio = 0;
  for (const front of audioFronts) {
    const digest = crypto.createHash("sha256").update(front).digest("hex").slice(0, 24);
    const url = manifest[front];
    const expectedLocal = `assets/flashcards/audio/edmund-neural/v1/${digest.slice(0, 2)}/${digest}.mp3`;
    if (url === expectedLocal) {
      const localPath = path.join(root, expectedLocal);
      if (!fs.existsSync(localPath) || fs.statSync(localPath).size <= 1000) missing.push(`${front}: invalid local audio`);
      else localAudio += 1;
    } else {
      const match = indexes.find(({ value }) =>
        url === `${String(value.cloudBaseUrl).replace(/\/+$/, "")}/${value.audioPathPrefix}${digest.slice(0, 2)}/${digest}.mp3`
      );
      const range = match?.value.entries?.[digest.slice(0, 2)]?.[digest.slice(2)];
      if (!match || !Array.isArray(range) || range.length !== 2 || range[1] <= 1000) {
        missing.push(`${front}: unresolvable cloud audio ${url || "(missing)"}`);
      } else {
        cloudAudio += 1;
        if (match.value.meta?.release === "v1-reading-expansion-20260731-1") expansionAudio += 1;
      }
    }
    if (missing.length >= 20) break;
  }
  assert(!missing.length, `Missing Passage 3 audio:\n${missing.join("\n")}`);
  assert(localAudio + cloudAudio === audioFronts.size, `Validated ${localAudio + cloudAudio} of ${audioFronts.size} Passage 3 recordings`);
  assert(expansionAudio > 0, "No Passage 3 recording resolves through the Reading expansion release");
  audioResult = { checked: true, manifestEntries: audioMeta.count, localAudio, cloudAudio, expansionAudio };
}

console.log(JSON.stringify({
  decks: Object.keys(seed).length,
  cards: cardCount,
  uniqueFronts: uniqueFronts.size,
  audioUniqueFronts: audioFronts.size,
  firstOrdinal: expectedOrdinals[0],
  lastOrdinal: expectedOrdinals.at(-1),
  audio: audioResult
}, null, 2));
