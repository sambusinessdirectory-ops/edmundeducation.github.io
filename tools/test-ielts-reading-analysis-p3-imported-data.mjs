#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import vm from "node:vm";

import { questionNumbers, validateArticlePayload } from "../ielts-reading-analysis-loader.mjs";

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

const expectedMissingCatalogueIds = [
  "p3-002", "p3-006", "p3-019", "p3-022", "p3-023", "p3-074",
  "p3-116", "p3-119", "p3-173", "p3-174", "p3-175",
].sort();

const [manifest, report, availabilitySource, indexSource, filenames] = await Promise.all([
  readJson("tools/ielts-reading-analysis-p3-import-manifest.json"),
  readJson("tools/ielts-reading-analysis-p3-import-report.json"),
  read("ielts-reading-analysis-availability.js"),
  read("ielts-reading-analysis-index.js"),
  readdir(new URL("ielts-reading-analysis-data/", root)),
]);

const availability = loadBrowserData(
  availabilitySource,
  "EDMUND_IELTS_READING_ANALYSIS_AVAILABILITY",
);
const index = loadBrowserData(indexSource, "EDMUND_IELTS_READING_ANALYSIS_INDEX");
const passageThreeCatalogue = new Map(index.passages[3].map((record) => [record.id, record]));
const passageThreeEntries = Object.values(availability.articles).filter(
  ({ passage, source }) => passage === 3 && source === "json",
);
const passageOneEntries = Object.values(availability.articles).filter(({ passage }) => passage === 1);
const passageTwoEntries = Object.values(availability.articles).filter(({ passage }) => passage === 2);
const passageThreeFiles = filenames.filter(
  (filename) => filename.startsWith("p3-") && filename.endsWith(".json"),
).sort();

assert.equal(manifest.version, "2026-08-22.1");
assert.equal(manifest.passage, 3);
assert.equal(manifest.sources.length, 157);
assert.equal(report.sourceCount, 157);
assert.equal(report.parsedSourceCount, 157);
assert.equal(report.cachedSourceCount, 0);
assert.equal(report.uniqueAnalysisCount, 157);
assert.equal(report.catalogueIds.length, 157);
assert.equal(passageThreeEntries.length, 157);
assert.equal(passageThreeFiles.length, 157);
assert.equal(passageOneEntries.length, 157, "Passage 1 availability must remain intact");
assert.equal(passageTwoEntries.length, 139, "Passage 2 availability must remain intact");
assert.equal(index.passages[3].length, 168);

const expectedFiles = passageThreeEntries.map(({ file }) => file).sort();
assert.deepEqual(passageThreeFiles, expectedFiles);

const availableCatalogueIds = new Set(
  passageThreeEntries.flatMap((entry) => entry.catalogueIds || [entry.catalogueId]),
);
assert.equal(availableCatalogueIds.size, 157);
const missingCatalogueIds = Array.from(index.passages[3], ({ id }) => id)
  .filter((id) => !availableCatalogueIds.has(id))
  .sort();
assert.deepEqual(missingCatalogueIds, expectedMissingCatalogueIds);

const sourceByFilename = new Map(report.sources.map((source) => [source.filename, source]));
const manifestTitleByCatalogueId = new Map();
for (const source of manifest.sources) {
  assert.ok(sourceByFilename.has(source.filename), `${source.filename}: missing import report row`);
  for (const catalogueId of source.catalogueIds) {
    const catalogueRecord = passageThreeCatalogue.get(catalogueId);
    assert.ok(catalogueRecord, `${catalogueId}: missing canonical catalogue record`);
    assert.equal(normaliseTitle(source.title), normaliseTitle(catalogueRecord.title));
    manifestTitleByCatalogueId.set(catalogueId, source.title);
  }
}

let answerCount = 0;
let questionCardCount = 0;
let sectionCount = 0;
let pageCount = 0;
for (const entry of passageThreeEntries) {
  const payload = await readJson(`ielts-reading-analysis-data/${entry.file}`);
  const catalogueIds = entry.catalogueIds || [entry.catalogueId];
  const article = validateArticlePayload(payload, {
    ...entry,
    catalogueId: catalogueIds[0],
    catalogueIds,
  });
  assert.equal(article.passage, 3);
  assert.equal(article.version, report.version);
  assert.equal(article.title, manifestTitleByCatalogueId.get(article.catalogueId));
  assert.equal(article.answerKey.length, article.questionCount);
  assert.ok(Number.isInteger(article.questionNumberStart));
  if (article.catalogueId === "p3-015") {
    assert.equal(article.overviewUnavailable, true);
    assert.equal(article.paragraphOverview, undefined);
  } else {
    assert.ok(article.paragraphOverview?.paragraphs?.length);
  }
  assert.ok(article.source.pageCount > 0);
  assert.match(article.source.sha256, /^[a-f0-9]{64}$/);
  assert.ok(
    (article.sourceNotes || []).every((note) => typeof note === "string" && note.trim().length >= 10),
  );

  const covered = article.questions.flatMap(questionNumbers).sort((left, right) => left - right);
  const expected = Array.from(
    { length: article.questionCount },
    (_, indexValue) => article.questionNumberStart + indexValue,
  );
  assert.deepEqual(covered, expected, `${article.id}: question coverage mismatch`);

  answerCount += article.answerKey.length;
  questionCardCount += article.questions.length;
  sectionCount += article.questions.reduce((sum, question) => sum + question.sections.length, 0);
  pageCount += article.source.pageCount;
}

assert.equal(answerCount, 2156);
assert.equal(questionCardCount, 2039);
assert.equal(sectionCount, 7795);
assert.equal(pageCount, 3359);

const greenSahara = await readJson("ielts-reading-analysis-data/p3-128-human-remain-in-green-sahara.json");
assert.equal(greenSahara.questionNumberStart, 27);
assert.equal(greenSahara.answerKey.length, 14);

const easterIsland = await readJson("ielts-reading-analysis-data/p3-157-mystery-in-easter-island.json");
assert.deepEqual(easterIsland.answerKey.slice(0, 4), ["v", "ii", "iii", "viii"]);

console.log(JSON.stringify({
  sourceCount: manifest.sources.length,
  analysisCount: passageThreeEntries.length,
  catalogueIdCount: availableCatalogueIds.size,
  answerCount,
  questionCardCount,
  sectionCount,
  pageCount,
}, null, 2));
