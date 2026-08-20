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
  "p2-001", "p2-002", "p2-003", "p2-004", "p2-005", "p2-006",
  "p2-007", "p2-008", "p2-009", "p2-010", "p2-011", "p2-012",
  "p2-013", "p2-014", "p2-015", "p2-016", "p2-017", "p2-018",
  "p2-019", "p2-021", "p2-022", "p2-023", "p2-031", "p2-043",
  "p2-055", "p2-067", "p2-079", "p2-091", "p2-103", "p2-115",
  "p2-127", "p2-136", "p2-140", "p2-152", "p2-164",
].sort();

const [manifest, report, availabilitySource, indexSource, filenames] = await Promise.all([
  readJson("tools/ielts-reading-analysis-p2-import-manifest.json"),
  readJson("tools/ielts-reading-analysis-p2-import-report.json"),
  read("ielts-reading-analysis-availability.js"),
  read("ielts-reading-analysis-index.js"),
  readdir(new URL("ielts-reading-analysis-data/", root)),
]);

const availability = loadBrowserData(
  availabilitySource,
  "EDMUND_IELTS_READING_ANALYSIS_AVAILABILITY",
);
const index = loadBrowserData(indexSource, "EDMUND_IELTS_READING_ANALYSIS_INDEX");
const passageTwoCatalogue = new Map(index.passages[2].map((record) => [record.id, record]));
const passageTwoEntries = Object.values(availability.articles).filter(
  ({ passage, source }) => passage === 2 && source === "json",
);
const passageOneEntries = Object.values(availability.articles).filter(({ passage }) => passage === 1);
const passageTwoFiles = filenames.filter(
  (filename) => filename.startsWith("p2-") && filename.endsWith(".json"),
).sort();

assert.equal(manifest.version, "2026-08-20.1");
assert.equal(manifest.passage, 2);
assert.equal(manifest.sources.length, 139);
assert.equal(report.sourceCount, 139);
assert.equal(report.parsedSourceCount, 139);
assert.equal(report.cachedSourceCount, 0);
assert.equal(report.uniqueAnalysisCount, 139);
assert.equal(report.catalogueIds.length, 140);
assert.equal(passageTwoEntries.length, 139);
assert.equal(passageTwoFiles.length, 139);
assert.equal(passageOneEntries.length, 157, "Passage 1 availability must remain intact");
assert.equal(index.passages[2].length, 175);

const stress = passageTwoEntries.find(({ catalogueIds }) =>
  Array.isArray(catalogueIds) && catalogueIds.includes("p2-020")
);
assert.ok(stress, "the shared Stress of Workplace analysis is missing");
assert.deepEqual(Array.from(stress.catalogueIds), ["p2-020", "p2-050"]);

const expectedFiles = passageTwoEntries.map(({ file }) => file).sort();
assert.deepEqual(passageTwoFiles, expectedFiles);

const availableCatalogueIds = new Set(
  passageTwoEntries.flatMap((entry) => entry.catalogueIds || [entry.catalogueId]),
);
assert.equal(availableCatalogueIds.size, 140);
const missingCatalogueIds = Array.from(index.passages[2], ({ id }) => id)
  .filter((id) => !availableCatalogueIds.has(id))
  .sort();
assert.deepEqual(missingCatalogueIds, expectedMissingCatalogueIds);

const sourceByFilename = new Map(report.sources.map((source) => [source.filename, source]));
const manifestTitleByCatalogueId = new Map();
for (const source of manifest.sources) {
  assert.ok(sourceByFilename.has(source.filename), `${source.filename}: missing import report row`);
  for (const catalogueId of source.catalogueIds) {
    const catalogueRecord = passageTwoCatalogue.get(catalogueId);
    assert.ok(catalogueRecord, `${catalogueId}: missing canonical catalogue record`);
    assert.equal(normaliseTitle(source.title), normaliseTitle(catalogueRecord.title));
    manifestTitleByCatalogueId.set(catalogueId, source.title);
  }
}

let answerCount = 0;
let questionCardCount = 0;
let sectionCount = 0;
let pageCount = 0;
for (const entry of passageTwoEntries) {
  const payload = await readJson(`ielts-reading-analysis-data/${entry.file}`);
  const catalogueIds = entry.catalogueIds || [entry.catalogueId];
  const article = validateArticlePayload(payload, {
    ...entry,
    catalogueId: catalogueIds[0],
    catalogueIds,
  });
  assert.equal(article.passage, 2);
  assert.equal(article.version, report.version);
  assert.equal(article.title, manifestTitleByCatalogueId.get(article.catalogueId));
  assert.equal(article.answerKey.length, article.questionCount);
  assert.ok(Number.isInteger(article.questionNumberStart));
  assert.ok(article.paragraphOverview?.paragraphs?.length);
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

assert.equal(answerCount, 1827);
assert.equal(questionCardCount, 1714);
assert.equal(sectionCount, 7851);
assert.equal(pageCount, 2621);

const falseBelief = await read("ielts-reading-analysis-data/p2-052-implication-of-false-belief-experiments.json");
assert.doesNotMatch(falseBelief, /From a Novice to an Expert/);

console.log(JSON.stringify({
  sourceCount: manifest.sources.length,
  analysisCount: passageTwoEntries.length,
  catalogueIdCount: availableCatalogueIds.size,
  answerCount,
  questionCardCount,
  sectionCount,
  pageCount,
}, null, 2));
