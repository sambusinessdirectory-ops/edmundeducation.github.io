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
const jsonEntries = Object.values(availability.articles).filter(({ source }) => source === "json");
const jsonFilenames = filenames.filter((filename) => filename.endsWith(".json")).sort();

assert.equal(manifest.sources.length, 50, "the attached batch must retain all 50 source records");
assert.equal(report.sourceCount, 50);
assert.equal(report.uniqueAnalysisCount, 49, "the identical Platypus PDFs should share one article");
assert.equal(report.catalogueIds.length, 50, "the Honeybee analysis is shared by two catalogue IDs");
assert.equal(new Set(report.catalogueIds).size, 50);
assert.equal(jsonEntries.length, 49);
assert.equal(jsonFilenames.length, 49);
assert.equal(sourceByFilename.size, 50);

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
  assert.equal(article.version, report.version);
  assert.deepEqual(Array.from(article.catalogueIds), Array.from(catalogueIds));
  assert.equal(article.title, manifestTitlesByCatalogueId.get(article.catalogueId));
  const reportedSource = sourceByFilename.get(article.source.filename);
  assert.ok(reportedSource, `${article.id}: source filename is absent from the import report`);
  assert.equal(reportedSource.articleId, article.id);
  assert.equal(reportedSource.sha256, article.source.sha256);
  assert.match(article.source.sha256, /^[a-f0-9]{64}$/);
  assert.ok(article.source.pageCount > 0);
  assert.equal(article.answerKey.length, article.questionCount);
  if (article.sourceNotes !== undefined) {
    assert.ok(Array.isArray(article.sourceNotes), `${article.id}: sourceNotes must be an array`);
    assert.ok(article.sourceNotes.length <= 5, `${article.id}: source notes are too fragmented`);
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
    article.answerKey.every((answer) => !/目標段落|題目要求|中文意思|SECTION|Roadmap|Skim|Scan|Read/i.test(answer)),
    `${article.id}: instructional prose leaked into an answer`,
  );

  assert.ok(article.paragraphOverview?.paragraphs?.length, `${article.id}: Skim Roadmap is missing`);
  assert.ok(
    article.paragraphOverview.title.length <= 80,
    `${article.id}: pre-roadmap teacher notes leaked into the roadmap title`,
  );
  assert.ok(
    article.paragraphOverview.paragraphs.every(({ summary }) => typeof summary === "string" && summary.trim()),
    `${article.id}: roadmap has a blank summary`,
  );

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
  overviewCount += 1;
}

assert.equal(articles.size, 49);
assert.equal(answerCount, 640);
assert.equal(questionCardCount, 618, "grouped question ranges must remain single analysis cards");
assert.equal(sectionCount, 3272);
assert.equal(pageCount, 1092);
assert.equal(overviewCount, 49);

function answerAt(articleId, questionNumber) {
  return articles.get(articleId).answerKey[questionNumber - 1];
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

console.log(
  "IELTS Reading Passage 1 imported-data checks passed: "
  + "50 sources, 49 unique articles, 640 answers, 618 analysis cards, 3,272 sections.",
);
