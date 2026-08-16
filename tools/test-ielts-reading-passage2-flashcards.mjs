#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
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

function normalizeSourceText(value) {
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

const dataSource = read("flashcards-ielts-reading-passage-2-data.js");
const seed = parseAssignment(
  dataSource,
  "window.EDMUND_IELTS_READING_PASSAGE_2_SEED = ",
  ";\nwindow.EDMUND_IELTS_READING_PASSAGE_2_TITLES"
);
const titles = parseAssignment(
  dataSource,
  "window.EDMUND_IELTS_READING_PASSAGE_2_TITLES = ",
  ";\nwindow.EDMUND_IELTS_READING_PASSAGE_2_META"
);
const meta = parseAssignment(
  dataSource,
  "window.EDMUND_IELTS_READING_PASSAGE_2_META = ",
  ";\nwindow.EDMUND_FLASHCARD_SEED"
);

const expectedOrdinals = Array.from({ length: 150 }, (_, index) => index + 24);
const deckIds = Object.keys(seed);
assert(deckIds.length === 150, `Expected 150 generated decks, found ${deckIds.length}`);
assert(Object.keys(titles).length === 150, `Expected 150 generated titles, found ${Object.keys(titles).length}`);
assert(meta.passage === 2, `Metadata passage is ${meta.passage}`);
assert(meta.deckCount === 150, `Metadata deck count is ${meta.deckCount}`);
assert(meta.cardCount === 30371, `Expected 30,371 cards, found ${meta.cardCount}`);
assert(meta.uniqueFrontCount === 27601, `Expected 27,601 unique fronts, found ${meta.uniqueFrontCount}`);
assert(Array.isArray(meta.ordinals), "Metadata ordinals must be an array");
assert(JSON.stringify(meta.ordinals) === JSON.stringify(expectedOrdinals), "Generated ordinal inventory is incorrect");
assert(meta.ordinals.includes(170), "New source Practice 170 is missing");

const expectedTitleSentinels = {
  "Practice 24": "Caveat Scriptor",
  "Practice 25": "The 2003 Heatwave",
  "Practice 26": "Being Left-handed in a Right-handed World",
  "Practice 27": "A New Ice Age",
  "Practice 28": "The Ant and the Mandarin",
  "Practice 37": "Storytelling: From Prehistoric Caves to Modern Cinemas",
  "Practice 47": "The History of the Pencil",
  "Practice 49": "Are Artists Liars?",
  "Practice 55": "The Evolutionary Mystery: Crocodile Survives",
  "Practice 78": "Therapeutic Jurisprudence: An Overview",
  "Practice 81": "Surf’s Up",
  "Practice 115": "Sustainable Growth at Didcot: The Outline of a Report by South Oxfordshire District Council",
  "Practice 117": "The Dinosaurs’ Footprints and Extinction",
  "Practice 131": "Conflicting climatic phenomena co-existing on Mars",
  "Practice 138": "Have teenagers always existed?",
  "Practice 156": "Aqua Product: New Zealand’s Algae Biodiesel",
  "Practice 161": "El Niño and Seabirds",
  "Practice 170": "Australian parrots and their adaptation to habitat change",
  "Practice 173": "Bovids"
};
for (const [practice, expectedTitle] of Object.entries(expectedTitleSentinels)) {
  assert(titles[practice] === expectedTitle, `${practice} title is ${JSON.stringify(titles[practice])}, expected ${JSON.stringify(expectedTitle)}`);
}
const sharedTitleIndex = JSON.parse(read("tools/ielts-reading-passage-titles.json"))["2"];
const authoritativeTitles = {
  ...sharedTitleIndex,
  "24": "Caveat Scriptor",
  "25": "The 2003 Heatwave",
  "26": "Being Left-handed in a Right-handed World",
  "27": "A New Ice Age",
  "49": "Are Artists Liars?",
  "55": "The Evolutionary Mystery: Crocodile Survives",
  "78": "Therapeutic Jurisprudence: An Overview",
  "81": "Surf’s Up",
  "117": "The Dinosaurs’ Footprints and Extinction",
  "131": "Conflicting climatic phenomena co-existing on Mars",
  "138": "Have teenagers always existed?",
  "156": "Aqua Product: New Zealand’s Algae Biodiesel",
  "161": "El Niño and Seabirds",
  "170": "Australian parrots and their adaptation to habitat change"
};
for (const ordinal of expectedOrdinals) {
  const expectedTitle = authoritativeTitles[String(ordinal)];
  assert(expectedTitle, `Authoritative title index is missing Practice ${ordinal}`);
  assert(titles[`Practice ${ordinal}`] === expectedTitle, `Practice ${ordinal} does not match the authoritative middle-column title`);
}

let cardCount = 0;
const sourceUniqueFronts = new Set();
const audioUniqueFronts = new Set();
for (const ordinal of expectedOrdinals) {
  const practice = `Practice ${ordinal}`;
  const deckId = `ielts/reading/passage-2/${practice}`;
  const cards = seed[deckId];
  assert(Array.isArray(cards) && cards.length > 0, `${deckId} has no cards`);
  assert(typeof titles[practice] === "string" && titles[practice].trim(), `${practice} has no title`);
  for (const [index, card] of cards.entries()) {
    const location = `${deckId} card ${index + 1}`;
    assert(card && typeof card === "object" && !Array.isArray(card), `${location} is not an object`);
    assert(typeof card.front === "string" && card.front.trim(), `${location} has no front`);
    assert(typeof card.meaning === "string" && card.meaning.trim(), `${location} has no meaning`);
    assert(Array.isArray(card.examples), `${location} examples is not an array`);
    for (const [exampleIndex, example] of card.examples.entries()) {
      assert(example && typeof example === "object" && !Array.isArray(example), `${location} example ${exampleIndex + 1} is not an object`);
      assert(typeof example.en === "string" && example.en.trim(), `${location} example ${exampleIndex + 1} has no English text`);
      assert(typeof example.zh === "string", `${location} example ${exampleIndex + 1} has invalid Chinese text`);
    }
    assert(typeof card.source === "string" && card.source.endsWith(".pdf"), `${location} has an invalid source filename`);
    const sourceOrdinal = Number(card.source.match(/^(?:(?:Flash Cards|Passage 2 Flash Cards)\s*-?\s*)?(\d+)\s*-/i)?.[1]);
    assert(sourceOrdinal === ordinal, `${location} points to source ordinal ${sourceOrdinal || "unknown"}`);
    assert(Number.isInteger(card.sourcePage) && card.sourcePage > 0, `${location} has an invalid source page`);
    sourceUniqueFronts.add(normalizeSourceText(card.front));
    audioUniqueFronts.add(normalizeAudioText(card.front));
    cardCount += 1;
  }
}
assert(cardCount === 30371, `Card rows total ${cardCount}, expected 30,371`);
assert(cardCount === meta.cardCount, `Card rows total ${cardCount}, metadata says ${meta.cardCount}`);
assert(sourceUniqueFronts.size === meta.uniqueFrontCount, `Unique fronts total ${sourceUniqueFronts.size}, metadata says ${meta.uniqueFrontCount}`);
assert(meta.uniqueFrontCount > 0 && meta.uniqueFrontCount <= meta.cardCount, `Metadata unique-front count is invalid: ${meta.uniqueFrontCount}`);

const repairedCardSentinels = [
  [71, "homeopathy", "to treat similar symptoms.", "順勢療法是一種治療體系"],
  [78, "consider someone for probation", "instead of prison.", "是否應在社區中受監管服刑"],
  [144, "the National Institute on Deafness and Other Communication Disorders", "communication problems.", "專注於聽覺、說話、語言和溝通問題"],
  [159, "Japanese organisational model", "long-term development.", "常強調忠誠、參與和長期發展"]
];
for (const [ordinal, front, englishTail, chineseText] of repairedCardSentinels) {
  const card = seed[`ielts/reading/passage-2/Practice ${ordinal}`].find(item => item.front === front);
  assert(card, `Missing repaired extraction card ${front}`);
  assert(card.examples[1].en.includes(englishTail), `${front} still has a truncated English example`);
  assert(card.examples[1].zh.includes(chineseText), `${front} still has a corrupted Chinese example`);
}
const sourceSupplementCard = seed["ielts/reading/passage-2/Practice 143"].find(item => item.front === "selling its shares");
assert(sourceSupplementCard?.examples[4]?.zh === "這個短語描述市場對感知風險或欠佳決策的反應。", "Missing source-omission translation supplement");

const bundleSandbox = { window: {} };
vm.createContext(bundleSandbox);
vm.runInContext(dataSource, bundleSandbox, { filename: "flashcards-ielts-reading-passage-2-data.js", timeout: 20_000 });
assert(bundleSandbox.window.EDMUND_FLASHCARD_SEED, "Generated bundle did not initialize the shared flashcard seed");
assert(
  Object.keys(bundleSandbox.window.EDMUND_FLASHCARD_SEED).length === 150,
  "Generated bundle did not merge all 150 decks into the shared flashcard seed"
);
assert(
  bundleSandbox.window.EDMUND_FLASHCARD_SEED["ielts/reading/passage-2/Practice 173"] ===
    bundleSandbox.window.EDMUND_IELTS_READING_PASSAGE_2_SEED["ielts/reading/passage-2/Practice 173"],
  "Generated bundle integration does not retain the Passage 2 deck object"
);

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
assert(
  html.includes('const IELTS_READING_PASSAGE_2_DATA_URL = "flashcards-ielts-reading-passage-2-data.js?v=20260731-1"'),
  "Passage 2 lazy-load URL is missing"
);
assert(html.includes("const IELTS_READING_PASSAGE_2_CARD_COUNT = 30371;"), "Unloaded Passage 2 card count does not match generated metadata");
assert(!html.includes('<script src="flashcards-ielts-reading-passage-2-data.js'), "Passage 2 data should not block the login page");
assert(html.includes("function ensureIeltsReadingPassage2Data()"), "Passage 2 lazy loader is missing");
assert(html.includes('script.dataset.ieltsReadingPassage2 = "true"'), "Passage 2 lazy-load script is not identifiable");
assert(!html.includes("function ensureIeltsReadingData()"), "IELTS Reading must not bulk-load every large passage bundle");
assert(/function ensureIeltsReadingDataForDeck\(deckId\)[\s\S]*?IELTS_READING_PASSAGE_2_PREFIX[\s\S]*?return ensureIeltsReadingPassage2Data\(\)/.test(html), "Passage 2 direct links do not select the Passage 2 lazy loader");
assert(!html.includes("await ensureIeltsReadingData();"), "IELTS Reading chooser/search still downloads all passages at once");
assert(html.includes("window.EDMUND_IELTS_READING_PASSAGE_2_TITLES?.[practice]"), "IELTS Reading labels do not use Passage 2 canonical titles");
assert(/function deckTitleFromId\(deckId\)[\s\S]*?ieltsReadingPracticePathLabel\(passage, ieltsReadingMatch\[2\]\)/.test(html), "Direct-linked Passage 2 decks do not receive their canonical title");

const directLinkStart = html.indexOf("async function openRequestedHomeworkDeck()");
const directLinkEnd = html.indexOf("\n    async function openRequestedFlashcardTarget()", directLinkStart);
assert(directLinkStart >= 0 && directLinkEnd > directLinkStart, "Homework direct-link handler is not async or is missing");
const directLinkBlock = html.slice(directLinkStart, directLinkEnd);
const lazyLoadPosition = directLinkBlock.indexOf("await ensureIeltsReadingDataForDeck(deckId)");
const cardLookupPosition = directLinkBlock.indexOf("getDeckCards(deckId)");
const reservationPosition = directLinkBlock.indexOf("requestedHomeworkDeckOpened = true");
assert(lazyLoadPosition >= 0, "Homework direct-link handler does not await deck-specific lazy data");
assert(cardLookupPosition > lazyLoadPosition, "Homework direct-link handler checks cards before Passage 2 data has loaded");
assert(reservationPosition >= 0 && reservationPosition < lazyLoadPosition, "Homework direct-link handler does not reserve the request before awaiting lazy data");
assert(/catch \(error\)[\s\S]*?requestedHomeworkDeckOpened = false[\s\S]*?連線問題[\s\S]*?return false/.test(directLinkBlock), "Homework direct-link handler cannot recover from a lazy-load network error");
assert(/currentUser !== requestUser[\s\S]*?currentDeckRequest !== deckId/.test(directLinkBlock), "Homework direct-link handler can open a stale deck after account or URL changes");
assert(html.includes('new URLSearchParams(window.location.search).get("deck")'), "Flashcard Homework deep-link query is missing");
assert(!/data-deck-search-input[\s\S]{0,1200}?ensureIeltsReadingData/.test(html), "Ordinary search bulk-loads every Reading passage");
assert(!/data-advanced-search-input[\s\S]{0,1200}?ensureIeltsReadingData/.test(html), "Advanced search bulk-loads every Reading passage");
assert(html.includes('<script src="flashcards-audio-manifest.js?v=edmund-neural-v1-20260816-1"></script>'), "Flashcard audio cache key was not refreshed for the latest audio release");

const inlineSeed = parseAssignment(html, "window.EDMUND_FLASHCARD_SEED = ", ";\n  </script>");
assert(inlineSeed["ielts/reading/passage-2/Practice 1"]?.length === 165, "Existing Passage 2 Practice 1 changed unexpectedly");
assert(deckIds.every(deckId => !(deckId in inlineSeed)), "A generated Passage 2 deck would silently overwrite an inline deck");

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
  assert(audioMeta.buildVersion === "v1", `Flashcard audio recipe changed unexpectedly: ${audioMeta.buildVersion}`);
  assert(audioMeta.count === Object.keys(manifest).length, `Audio metadata count ${audioMeta.count} does not match ${Object.keys(manifest).length} manifest entries`);

  const cloudIndexDirectory = path.join(root, "workers/edmund-audio/src");
  const cloudIndexFiles = fs.readdirSync(cloudIndexDirectory)
    .filter(file => /^flashcard-pack-index(?:-[\w-]+)?\.json$/.test(file))
    .sort();
  assert(cloudIndexFiles.includes("flashcard-pack-index-passage2.json"), "Passage 2 cloud-pack index is missing");
  assert(cloudIndexFiles.includes("flashcard-pack-index-reading-expansion.json"), "Reading expansion cloud-pack index is missing");
  const cloudIndexes = cloudIndexFiles.map(file => ({ file, data: JSON.parse(read(`workers/edmund-audio/src/${file}`)) }));
  for (const { file, data } of cloudIndexes) {
    assert(data.schemaVersion === 1, `${file} schema is invalid`);
    assert(data.meta?.r2UploadComplete === true, `${file} is not marked uploaded`);
    assert(data.meta?.entryCount > 0, `${file} has no indexed recordings`);
    assert(data.meta?.packCount > 0, `${file} has no audio packs`);
  }
  const passage2CloudIndex = cloudIndexes.find(({ file }) => file === "flashcard-pack-index-passage2.json")?.data;
  assert(passage2CloudIndex.audioPathPrefix.includes("passage2"), "Passage 2 cloud audio prefix is not release-specific");

  const missing = [];
  let localAudio = 0;
  let cloudAudio = 0;
  const cloudIndexUsage = new Map();
  for (const front of audioUniqueFronts) {
    const audioUrl = manifest[front];
    if (!audioUrl) {
      missing.push(`${front}: no manifest entry`);
      if (missing.length >= 20) break;
      continue;
    }
    const digest = crypto.createHash("sha256").update(front).digest("hex").slice(0, 24);
    if (audioUrl.startsWith("assets/flashcards/audio/edmund-neural/")) {
      const localPath = path.join(root, audioUrl);
      if (!fs.existsSync(localPath) || fs.statSync(localPath).size <= 1000) {
        missing.push(`${front}: missing or undersized local file ${audioUrl}`);
      } else {
        localAudio += 1;
      }
      if (missing.length >= 20) break;
      continue;
    }

    const cloudMatch = cloudIndexes.find(({ data }) => {
      const expectedRelativePath = `${data.audioPathPrefix}${digest.slice(0, 2)}/${digest}.mp3`;
      const expectedUrl = `${String(data.cloudBaseUrl || "").replace(/\/+$/, "")}/${expectedRelativePath}`;
      return audioUrl === expectedUrl;
    });
    if (!cloudMatch) {
      missing.push(`${front}: manifest URL is neither a valid local file nor a tracked cloud release (${audioUrl})`);
      if (missing.length >= 20) break;
      continue;
    }
    const packEntry = cloudMatch.data.entries?.[digest.slice(0, 2)]?.[digest.slice(2)];
    if (!Array.isArray(packEntry) || packEntry.length !== 2 || packEntry[1] <= 1000) {
      missing.push(`${front}: invalid cloud-pack entry in ${cloudMatch.file}`);
    } else {
      cloudAudio += 1;
      cloudIndexUsage.set(cloudMatch.file, (cloudIndexUsage.get(cloudMatch.file) || 0) + 1);
    }
    if (missing.length >= 20) break;
  }
  assert(!missing.length, `Missing Passage 2 audio:\n${missing.join("\n")}`);
  assert(localAudio + cloudAudio === audioUniqueFronts.size, `Validated ${localAudio + cloudAudio} of ${audioUniqueFronts.size} Passage 2 recordings`);
  assert((cloudIndexUsage.get("flashcard-pack-index-passage2.json") || 0) > 0, "No Passage 2 card resolves through the Passage 2 cloud release");
  assert((cloudIndexUsage.get("flashcard-pack-index-reading-expansion.json") || 0) > 0, "No new Passage 2 card resolves through the Reading expansion release");
  audioResult = {
    checked: true,
    manifestEntries: Object.keys(manifest).length,
    localAudio,
    cloudAudio,
    cloudIndexUsage: Object.fromEntries(cloudIndexUsage)
  };
}

console.log(JSON.stringify({
  decks: deckIds.length,
  cards: cardCount,
  uniqueFronts: sourceUniqueFronts.size,
  audioUniqueFronts: audioUniqueFronts.size,
  firstPractice: expectedOrdinals[0],
  lastPractice: expectedOrdinals.at(-1),
  missingPractices: [],
  existingPractice1Cards: 165,
  totalPublishedPassage2Decks: deckIds.length + 1,
  audio: audioResult
}, null, 2));
