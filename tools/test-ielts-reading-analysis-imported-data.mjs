#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import vm from "node:vm";

import { validateArticlePayload } from "../ielts-reading-analysis-loader.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const readJson = async (path) => JSON.parse(await read(path));

function loadBrowserData(source, variableName) {
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: variableName });
  return context.window[variableName];
}

function normaliseTitle(value) {
  return String(value)
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en");
}

const expectedMissingRoadmapIds = [
  "p1-157-the-history-of-salt",
  "p1-159-grey-workers",
  "p1-160-malaria-combat-in-italy",
  "p1-162-the-power-of-nothing",
  "p1-163-grimms-fairy-tales",
];

const expectedMissingCatalogueIds = ["p1-033", "p1-053", "p1-066", "p1-164"];

const [manifest, report, availabilitySource, indexSource, filenames] = await Promise.all([
  readJson("tools/ielts-reading-analysis-p1-import-manifest.json"),
  readJson("tools/ielts-reading-analysis-p1-import-report.json"),
  read("ielts-reading-analysis-availability.js"),
  read("ielts-reading-analysis-index.js"),
  readdir(new URL("ielts-reading-analysis-data/", root)),
]);

const availability = loadBrowserData(
  availabilitySource,
  "EDMUND_IELTS_READING_ANALYSIS_AVAILABILITY",
);
const index = loadBrowserData(
  indexSource,
  "EDMUND_IELTS_READING_ANALYSIS_INDEX",
);
const catalogueById = new Map(index.passages[1].map((record) => [record.id, record]));
const sourceByFilename = new Map(report.sources.map((source) => [source.filename, source]));
const availabilityEntries = Object.values(availability.articles);
const jsonEntries = Object.values(availability.articles).filter(({ source }) => source === "json");
const bundledEntries = availabilityEntries.filter(({ source }) => source === "bundled");
const jsonFilenames = filenames.filter((filename) => filename.endsWith(".json")).sort();

assert.equal(manifest.sources.length, 156, "the expanded corpus must retain all 156 source records");
assert.equal(report.sourceCount, 156);
assert.equal(report.parsedSourceCount, 106);
assert.equal(report.cachedSourceCount, 50);
assert.equal(report.batchInventorySourceCount, 107);
assert.equal(report.newUniqueAnalysisCount, 106);
assert.equal(report.newCatalogueIdCount, 108);
assert.equal(report.bundledDuplicateSourceCount, 1);
assert.equal(report.uniqueAnalysisCount, 155, "the identical Platypus PDFs should share one article");
assert.equal(report.catalogueIds.length, 158, "three analyses are shared by paired catalogue IDs");
assert.equal(new Set(report.catalogueIds).size, 158);
assert.equal(jsonEntries.length, 155);
assert.equal(jsonFilenames.length, 155);
assert.equal(sourceByFilename.size, 156);
assert.equal(report.sources.filter(({ status }) => status === "parsed").length, 106);
assert.equal(report.sources.filter(({ status }) => status === "cached").length, 50);

const duplicateHashes = new Map();
for (const source of report.sources) {
  assert.match(source.sha256, /^[a-f0-9]{64}$/);
  duplicateHashes.set(source.sha256, [...(duplicateHashes.get(source.sha256) || []), source]);
}
const repeatedHashGroups = [...duplicateHashes.values()].filter((sources) => sources.length > 1);
assert.equal(repeatedHashGroups.length, 1, "only the supplied Platypus duplicate should share a hash");
assert.equal(repeatedHashGroups[0].length, 2);
assert.ok(repeatedHashGroups[0].every(({ articleId }) => articleId === "p1-007-australia-s-platypus"));

const manifestDuplicates = manifest.sources.filter(({ duplicateGroup }) => duplicateGroup);
assert.equal(manifestDuplicates.length, 2);
assert.ok(manifestDuplicates.every(({ duplicateGroup }) => duplicateGroup === "australias-platypus"));

const honeybee = availability.articles["p1-009-flight-of-the-honeybee"];
assert.deepEqual(Array.from(honeybee.catalogueIds), ["p1-009", "p1-060"]);
const lochNess = availability.articles["p1-011-the-loch-ness-monster"];
assert.deepEqual(Array.from(lochNess.catalogueIds), ["p1-011", "p1-063"]);
const natureOfAddiction = availability.articles["p1-010-the-nature-of-addiction"];
assert.deepEqual(Array.from(natureOfAddiction.catalogueIds), ["p1-010", "p1-061"]);

assert.equal(bundledEntries.length, 2, "Mungo Man and If You Can Get Used to the Taste remain bundled");
assert.deepEqual(
  bundledEntries.map(({ catalogueId }) => catalogueId).sort(),
  ["p1-092", "p1-161"],
);
const bundledTaste = availability.articles["if-you-can-get-used-to-the-taste"];
assert.equal(bundledTaste.catalogueId, "p1-092");
assert.equal(bundledTaste.source, "bundled");
assert.equal(manifest.bundledSourceDuplicates.length, 1);
assert.equal(report.bundledSourceDuplicates.length, 1);
for (const duplicate of [manifest.bundledSourceDuplicates[0], report.bundledSourceDuplicates[0]]) {
  assert.equal(duplicate.articleId, "if-you-can-get-used-to-the-taste");
  assert.deepEqual(Array.from(duplicate.catalogueIds), ["p1-092"]);
  assert.equal(duplicate.reason, "already-bundled");
}

assert.equal(index.passages[1].length, 164, "Passage 1 catalogue size changed unexpectedly");
const availableCatalogueIds = new Set(
  availabilityEntries.flatMap((entry) => entry.catalogueIds || [entry.catalogueId]),
);
assert.equal(availableCatalogueIds.size, 160, "160 of 164 Passage 1 catalogue entries should be available");
const missingCatalogueIds = Array.from(index.passages[1], ({ id }) => id)
  .filter((id) => !availableCatalogueIds.has(id))
  .sort();
assert.deepEqual(missingCatalogueIds, expectedMissingCatalogueIds);

const expectedJsonFiles = jsonEntries.map(({ file }) => file).sort();
assert.deepEqual(jsonFilenames, expectedJsonFiles, "availability manifest and deployed JSON files differ");

const manifestTitlesByCatalogueId = new Map();
for (const source of manifest.sources) {
  assert.ok(sourceByFilename.has(source.filename), `${source.filename}: missing from import report`);
  for (const catalogueId of source.catalogueIds) {
    assert.ok(catalogueById.has(catalogueId), `${catalogueId}: not found in Passage 1 catalogue`);
    manifestTitlesByCatalogueId.set(catalogueId, source.title);
    assert.equal(
      normaliseTitle(catalogueById.get(catalogueId).title),
      normaliseTitle(source.title),
      `${catalogueId}: importer title no longer matches the catalogue`,
    );
  }
}

const articles = new Map();
let answerCount = 0;
let questionCardCount = 0;
let sectionCount = 0;
let pageCount = 0;
let overviewCount = 0;
const missingRoadmapIds = [];

for (const entry of jsonEntries) {
  const payload = await readJson(`ielts-reading-analysis-data/${entry.file}`);
  const catalogueIds = entry.catalogueIds || [entry.catalogueId];
  const article = validateArticlePayload(payload, {
    ...entry,
    catalogueId: catalogueIds[0],
    catalogueIds,
  });

  articles.set(article.id, article);
  assert.equal(article.id, entry.id);
  assert.equal(article.passage, 1);
  assert.deepEqual(Array.from(article.catalogueIds), Array.from(catalogueIds));
  assert.equal(article.title, manifestTitlesByCatalogueId.get(article.catalogueId));
  const reportedSource = sourceByFilename.get(article.source.filename);
  assert.ok(reportedSource, `${article.id}: source filename is absent from the import report`);
  assert.equal(entry.version, report.version, `${article.id}: availability cache version is stale`);
  if (reportedSource.status === "parsed") {
    assert.equal(article.version, report.version, `${article.id}: newly parsed payload version is stale`);
  } else {
    assert.equal(reportedSource.status, "cached", `${article.id}: unexpected import status`);
    assert.equal(article.version, "2026-08-08.1", `${article.id}: cached payload version changed unexpectedly`);
  }
  assert.equal(reportedSource.articleId, article.id);
  assert.equal(reportedSource.sha256, article.source.sha256);
  assert.match(article.source.sha256, /^[a-f0-9]{64}$/);
  assert.ok(article.source.pageCount > 0);
  assert.equal(article.answerKey.length, article.questionCount);
  if (article.sourceNotes !== undefined) {
    assert.ok(Array.isArray(article.sourceNotes), `${article.id}: sourceNotes must be an array`);
    assert.ok(
      article.sourceNotes.every((note) => typeof note === "string" && note.trim().length >= 10),
      `${article.id}: sourceNotes contains a blank or non-text note`,
    );
    assert.ok(
      article.sourceNotes.every((note) => !/缺少圖Questions|^中文意思：?$/.test(note)),
      `${article.id}: source-note lines were joined without readable punctuation`,
    );
  }
  assert.ok(article.answerKey.every((answer) => typeof answer === "string" && answer.trim()));
  assert.ok(article.answerKey.every((answer) => answer.length <= 80), `${article.id}: suspiciously long answer`);
  assert.ok(
    article.answerKey.every(
      (answer) => !/目標段落|題目要求|中文意思|\b(?:SECTION|Roadmap|Skim|Scan|Read)\b/i.test(answer),
    ),
    `${article.id}: instructional prose leaked into an answer`,
  );

  if (!article.paragraphOverview?.paragraphs?.length) {
    missingRoadmapIds.push(article.id);
  } else {
    assert.ok(
      article.paragraphOverview.title.length <= 80,
      `${article.id}: pre-roadmap teacher notes leaked into the roadmap title`,
    );
    assert.doesNotMatch(
      article.paragraphOverview.title,
      /[。！？!?]$/,
      `${article.id}: roadmap title ends with explanatory prose`,
    );
    assert.ok(
      article.paragraphOverview.paragraphs.every(({ summary }) => typeof summary === "string" && summary.trim()),
      `${article.id}: roadmap has a blank summary`,
    );
    overviewCount += 1;
  }

  for (const question of article.questions) {
    assert.ok(question.answer.trim(), `${article.id}/Q${question.number}: answer is blank`);
    assert.ok(question.prompt.trim(), `${article.id}/Q${question.number}: prompt is blank`);
    assert.ok(question.translation.trim(), `${article.id}/Q${question.number}: translation is blank`);
    assert.doesNotMatch(
      question.prompt,
      /中文意思：/,
      `${article.id}/Q${question.number}: Chinese translation leaked into the English prompt`,
    );
    for (const section of question.sections) {
      assert.ok(section.blocks.length, `${article.id}/Q${question.number}/${section.id}: empty section`);
      for (const block of section.blocks) {
        const text = block.kind === "comparison" ? `${block.from}${block.to}` : block.text;
        assert.ok(text.trim(), `${article.id}/Q${question.number}/${section.id}: blank content block`);
      }
    }
  }

  answerCount += article.answerKey.length;
  questionCardCount += article.questions.length;
  sectionCount += article.questions.reduce((sum, question) => sum + question.sections.length, 0);
  pageCount += article.source.pageCount;
}

assert.deepEqual(missingRoadmapIds.sort(), expectedMissingRoadmapIds);
assert.equal(articles.size, 155);
assert.equal(answerCount, 2030);
assert.equal(questionCardCount, 1987, "grouped question ranges must remain single analysis cards");
assert.equal(sectionCount, 10761);
assert.equal(pageCount, 3658);
assert.equal(overviewCount, 150);

function answerAt(articleId, questionNumber) {
  return articles.get(articleId).answerKey[questionNumber - 1];
}

function sourceNotesFor(articleId) {
  return (articles.get(articleId).sourceNotes || []).join("\n");
}

assert.equal(answerAt("p1-043-ancient-chinese-chariots", 13), "underground caverns");
assert.equal(answerAt("p1-019-animal-minds-parrot-alex", 13), "a teenager");
assert.equal(answerAt("p1-112-astronaut-ice-cream-anyone", 13), "high altitudes");
assert.equal(answerAt("p1-007-australia-s-platypus", 13), "permit");
assert.equal(answerAt("p1-146-bird-migration", 12), "predators");
assert.equal(answerAt("p1-146-bird-migration", 13), "visible");
assert.equal(answerAt("p1-096-coming-of-age", 13), "NOT GIVEN");
assert.equal(articles.get("p1-132-father-of-modern-management").questionCount, 14);
for (let questionNumber = 5; questionNumber <= 9; questionNumber += 1) {
  assert.match(answerAt("p1-091-an-essential-intermediary", questionNumber), /圖像缺失/);
}
for (let questionNumber = 7; questionNumber <= 10; questionNumber += 1) {
  assert.equal(answerAt("p1-022-foot-pedal-irrigation", questionNumber), "需參考題圖");
}

// Representative answers from the expanded batch.
assert.equal(answerAt("p1-050-radiocarbon-dating-the-profile-of-nancy-athfield", 13), "database");
assert.equal(answerAt("p1-082-graffiti", 11), "F");
assert.equal(answerAt("p1-154-world-ecotourism-in-the-developing-courtiers", 10), "tour");
assert.equal(answerAt("p1-157-the-history-of-salt", 14), "TRUE");
assert.equal(answerAt("p1-160-malaria-combat-in-italy", 1), "insects");
assert.equal(answerAt("p1-163-grimms-fairy-tales", 14), "B");

// These caveats protect intentionally unresolved or grammar-adjusted answers
// from being silently presented as ordinary, source-verbatim answers.
assert.match(
  sourceNotesFor("p1-008-the-eisriesenwelt-ice-caves"),
  /Questions 10–11[\s\S]*diagram[\s\S]*無法唯一判斷/,
);
assert.equal(answerAt("p1-008-the-eisriesenwelt-ice-caves", 10), "圖未提供，無法唯一判斷");
assert.equal(answerAt("p1-008-the-eisriesenwelt-ice-caves", 11), "圖未提供，無法唯一判斷");
assert.match(
  sourceNotesFor("p1-118-the-construction-of-roads-and-bridges"),
  /Questions 1–3[\s\S]*diagram[\s\S]*hot tar[\s\S]*five centimetres/,
);
assert.equal(answerAt("p1-118-the-construction-of-roads-and-bridges", 3), "water");
assert.doesNotMatch(
  sourceNotesFor("p1-118-the-construction-of-roads-and-bridges"),
  /stone chips/,
  "Roads Q3 is water; the source caveat must not present stone chips as its answer",
);
assert.match(
  sourceNotesFor("p1-050-radiocarbon-dating-the-profile-of-nancy-athfield"),
  /Question 8[\s\S]*mid-teens[\s\S]*university/,
);
assert.match(
  sourceNotesFor("p1-154-world-ecotourism-in-the-developing-courtiers"),
  /第 10 題[\s\S]*sustainable tours[\s\S]*單數[\s\S]*tour/,
);
assert.match(
  sourceNotesFor("p1-121-reflecting-on-the-mirror"),
  /Questions 6–9[\s\S]*diagram[\s\S]*紙本圖/,
);
assert.match(
  sourceNotesFor("p1-055-the-innovation-of-grocery-stores"),
  /Question 10[\s\S]*customers[\s\S]*consumers/,
  "Grocery Stores Q10 must retain the customers/consumers alternative-answer caveat",
);
assert.match(
  sourceNotesFor("p1-125-the-success-of-cellulose"),
  /Question 12[\s\S]*selective membranes/,
  "Cellulose Q12 must retain the source's plural wording caveat",
);
assert.match(
  sourceNotesFor("p1-125-the-success-of-cellulose"),
  /selective membrane(?!s)/,
  "Cellulose Q12 must explain the summary's possible singular form",
);

console.log(
  "IELTS Reading Passage 1 imported-data checks passed: "
  + "156 sources, 155 unique JSON articles, 2 bundled articles, 2,030 answers, "
  + "1,987 analysis cards, 10,761 sections, 160/164 catalogue entries available.",
);
