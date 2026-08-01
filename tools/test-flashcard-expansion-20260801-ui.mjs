#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const html = fs.readFileSync(path.join(siteDir, "flashcards.html"), "utf8");

assert.ok(
  html.includes(
    '<script src="flashcards-audio-manifest.js?v=edmund-neural-v1-20260801-1"></script>'
  ),
  "The 2026-08-01 audio manifest cache key is stale"
);

function blockBetween(startNeedle, endNeedle) {
  const start = html.indexOf(startNeedle);
  const end = html.indexOf(endNeedle, start + startNeedle.length);
  assert.ok(start >= 0, `Missing block start: ${startNeedle}`);
  assert.ok(end > start, `Missing block end after ${startNeedle}: ${endNeedle}`);
  return html.slice(start, end);
}

const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map(match => match[1])
  .filter(source => source.trim());
for (const [index, source] of inlineScripts.entries()) {
  assert.doesNotThrow(
    () => new Function(source),
    undefined,
    `Inline flashcards script ${index + 1} has invalid syntax`
  );
}

const bundles = [
  {
    constant: "IELTS_LISTENING_PRACTICES_2_20_DATA_URL",
    file: "flashcards-ielts-listening-practices-2-20-data.js",
    global: "EDMUND_IELTS_LISTENING_PRACTICES_2_20_SEED",
    expectedDeckId: "ielts/listening/Practice 2/task-1"
  },
  {
    constant: "DSE_READING_2012_2025_DATA_URL",
    file: "flashcards-dse-reading-2012-2025-data.js",
    global: "EDMUND_DSE_READING_2012_2025_SEED",
    expectedDeckId: "dse/reading/part-a/2012"
  },
  {
    constant: "DSE_PRACTICAL_WRITING_DATA_URL",
    file: "flashcards-dse-practical-writing-data.js",
    global: "EDMUND_DSE_PRACTICAL_WRITING_SEED",
    expectedDeckId: "dse/paper-3/practical-english-writing/practical-formats/letter-of-request"
  },
  {
    constant: "DSE_PAPER3_B2_2012_2023_DATA_URL",
    file: "flashcards-dse-paper3-b2-2012-2023-data.js",
    global: "EDMUND_DSE_PAPER3_B2_2012_2023_SEED",
    expectedDeckId: "dse/paper-3/part-b-data-file-b2/2012"
  }
];

for (const bundle of bundles) {
  assert.ok(
    html.includes(`const ${bundle.constant} = "${bundle.file}?v=20260801-1";`),
    `${bundle.file} does not have a versioned lazy-load URL`
  );
  assert.ok(html.includes(`globalName: "${bundle.global}"`), `${bundle.global} is not registered`);
  assert.ok(
    html.includes(`expectedDeckId: "${bundle.expectedDeckId}"`),
    `${bundle.file} does not validate an expected deck`
  );
  assert.ok(
    !html.includes(`<script src="${bundle.file}`),
    `${bundle.file} must not block the flashcard login page`
  );
}

const loaderBlock = blockBetween(
  "function supplementalFlashcardBundleReady(bundle)",
  "const promotedSharedDecks"
);
assert.match(loaderBlock, /supplementalFlashcardDataPromises\.has\(bundle\.globalName\)/);
assert.match(loaderBlock, /document\.createElement\("script"\)/);
assert.match(loaderBlock, /script\.dataset\[bundle\.datasetKey\] = "true"/);
assert.match(loaderBlock, /document\.head\.appendChild\(script\)/);
assert.match(loaderBlock, /Array\.isArray\(seedDecks\[bundle\.expectedDeckId\]\)/);
assert.match(loaderBlock, /supplementalFlashcardDataPromises\.delete\(bundle\.globalName\)/);

assert.ok(
  html.includes('const dseReadingYears = Array.from({ length: 14 }, (_, index) => String(2012 + index));'),
  "DSE Reading must expose only 2012–2025"
);
assert.ok(
  html.includes('const dsePaper3DataYears = Array.from({ length: 14 }, (_, index) => String(2012 + index));'),
  "DSE Paper 3 Data File must expose 2012–2025"
);

const readingBlock = blockBetween("async function showDseReading()", "function showDseWriting()");
assert.match(readingBlock, /await ensureSupplementalFlashcardViewData\(DSE_READING_PREFIX\)/);
for (const part of ["part-a", "part-b1", "part-b2"]) {
  assert.ok(readingBlock.includes(`"dse/reading/${part}"`), `DSE Reading ${part} chooser is missing`);
}
assert.equal((readingBlock.match(/dseReadingYears/g) || []).length, 3);

const practicalFormats = [
  ["letter-of-enquiry", "Letter of Enquiry"],
  ["negative-emails", "Negative Letter"],
  ["letter-of-reply", "Letter of Reply"],
  ["report", "Report"],
  ["proposal", "Proposal"],
  ["letter-of-request", "Letter of Request"],
  ["letter-of-invitation-spokesperson", "Letter of Invitation (Spokesperson)"],
  ["letter-of-invitation-to-winners", "Letter of Invitation (Winner)"],
  ["letter-of-request-informal", "Informal Letter of Request"],
  ["press-release", "Press Release"],
  ["speech", "Speech"],
  ["outline", "Outline / Summary"]
];
const practicalConfigBlock = blockBetween(
  "const dsePaper3PracticalWritingSections = [",
  "const businessEnglishSections"
);
assert.equal((practicalConfigBlock.match(/\{ id:/g) || []).length, 12, "Practical Writing needs 12 formats");
for (const [id, label] of practicalFormats) {
  assert.ok(
    practicalConfigBlock.includes(`{ id: "${id}", label: "${label}" }`),
    `Practical Writing mapping is missing ${id}`
  );
}
assert.ok(!practicalConfigBlock.includes("Promotional Article"), "The unsupplied Promotional Article must stay hidden");

const practicalChooserBlock = blockBetween(
  "async function showDsePaper3PracticalFormats()",
  "async function showDsePaper3Years"
);
assert.match(practicalChooserBlock, /await ensureSupplementalFlashcardViewData\(DSE_PRACTICAL_WRITING_PREFIX\)/);
assert.match(practicalChooserBlock, /`\$\{DSE_PRACTICAL_WRITING_PREFIX\}\/\$\{section\.id\}`/);

const paper3YearsBlock = blockBetween("async function showDsePaper3Years", "function showDsePaper3Tasks");
assert.match(
  paper3YearsBlock,
  /b2: \{ title: "Part B \(Data File\) - B2", prefix: "dse\/paper-3\/part-b-data-file-b2" \}/
);
assert.match(paper3YearsBlock, /partKey === "part-a" \? dseListeningYears : dsePaper3DataYears/);
assert.match(
  paper3YearsBlock,
  /partKey === "b2" && !await ensureSupplementalFlashcardViewData\(config\.prefix\)/
);
assert.ok(
  html.includes('<script src="flashcards-dse-paper3-b2-2024-data.js?v=20260725-1"></script>'),
  "Existing 2024 B2 Data File bundle must remain installed"
);
assert.ok(
  html.includes('<script src="flashcards-dse-paper3-b2-2025-data.js?v=20260725-1"></script>'),
  "Existing 2025 B2 Data File bundle must remain installed"
);

const listeningSectionSource = blockBetween(
  "function ieltsListeningSections(practiceLabel)",
  "async function showIeltsListening()"
);
const { ieltsListeningSections } = new Function(`${listeningSectionSource}; return { ieltsListeningSections };`)();
assert.deepEqual(
  ieltsListeningSections("Practice 1"),
  [1, 2, 3, 4].map(number => ({ id: `part-${number}`, label: `Part ${number}` })),
  "Practice 1 must preserve its existing Part 1–4 IDs"
);
for (const practice of ["Practice 2", "Practice 10", "Practice 20"]) {
  assert.deepEqual(
    ieltsListeningSections(practice),
    [1, 2, 3, 4].map(number => ({ id: `task-${number}`, label: `Task ${number}` })),
    `${practice} must expose Task 1–4 IDs`
  );
}
for (const part of [1, 2, 3, 4]) {
  assert.ok(
    html.includes(`"ielts/listening/Practice 1/part-${part}"`),
    `Existing Practice 1 part-${part} deck ID changed`
  );
}

const listeningChooserBlock = blockBetween("async function showIeltsListening()", "async function showIeltsParts");
assert.match(listeningChooserBlock, /await ensureSupplementalFlashcardViewData\(IELTS_LISTENING_PREFIX\)/);
assert.match(listeningChooserBlock, /Practice 1 至 Practice 20/);
assert.match(listeningChooserBlock, /routeColumnHtml/);
assert.match(listeningChooserBlock, /route: `ielts-listening-practice\|\$\{practiceLabel\}`/);
assert.ok(!listeningChooserBlock.includes("columnHtml("), "Practice parents must route to their four tasks");

const listeningPartsBlock = blockBetween("async function showIeltsParts", "function showIeltsSpeaking");
assert.match(listeningPartsBlock, /await ensureSupplementalFlashcardViewData\(deckPrefix\)/);
assert.match(listeningPartsBlock, /ieltsListeningSections\(practiceLabel\)/);
assert.match(listeningPartsBlock, /`\$\{deckPrefix\}\/\$\{section\.id\}`/);

const completionBlock = blockBetween("function ieltsListeningChildIds", "function familiarityStatsForPrefix");
assert.match(completionBlock, /ieltsListeningSections\(practiceLabel\)/);
assert.match(completionBlock, /ieltsListeningChildIds\(prefix\)\.every/);
assert.ok(!completionBlock.includes("ieltsPartIds"), "Completion must not assume old part-* IDs for new practices");

const searchBlock = blockBetween("async function openSearchDeckResult", "function renderHighAttemptCards");
const searchLazyLoad = searchBlock.indexOf("await ensureSupplementalFlashcardDataForDeck(deckId)");
const searchCardLookup = searchBlock.indexOf("getDeckCards(deckId)");
assert.ok(searchLazyLoad >= 0, "Search results do not lazy-load supplemental data");
assert.ok(searchCardLookup > searchLazyLoad, "Search inspects cards before supplemental data can load");

const homeworkBlock = blockBetween(
  "async function openRequestedHomeworkDeck()",
  "async function openRequestedFlashcardTarget()"
);
const homeworkLazyLoad = homeworkBlock.indexOf("await ensureSupplementalFlashcardDataForDeck(deckId)");
const homeworkCardLookup = homeworkBlock.indexOf("getDeckCards(deckId)");
assert.ok(homeworkLazyLoad >= 0, "Homework deep links do not lazy-load supplemental data");
assert.ok(homeworkCardLookup > homeworkLazyLoad, "Homework deep links inspect cards before supplemental data can load");

const routeBlock = blockBetween(
  'document.addEventListener("click", async event => {',
  'document.addEventListener("keydown", event => {'
);
assert.match(routeBlock, /route === "dse-reading"\) await showDseReading\(\)/);
assert.match(routeBlock, /route === "dse-paper3-b2"\) await showDsePaper3Years\("b2"\)/);
assert.match(routeBlock, /route === "dse-paper3-practical-formats"\) await showDsePaper3PracticalFormats\(\)/);
assert.match(routeBlock, /route === "ielts-listening"\) await showIeltsListening\(\)/);
assert.match(
  routeBlock,
  /route\.startsWith\("ielts-listening-practice\|"\)\) await showIeltsParts\(route\.split\("\|"\)\[1\]\)/
);

console.log("2026-08-01 flashcard expansion lazy-loading and taxonomy checks passed.");
