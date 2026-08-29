#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import {
  CANONICAL_TYPES,
  EXPECTED_ARTICLE_COUNT,
  OUTPUT_FILE,
  compressQuestionRanges,
  generateQuestionTypePayload,
  resolveSearchTypeIds,
  serializeQuestionTypePayload,
} from "./generate-ielts-reading-question-types.mjs";

const payload = await generateQuestionTypePayload();
const secondPayload = await generateQuestionTypePayload();
assert.equal(payload.articleCount, EXPECTED_ARTICLE_COUNT);
assert.equal(payload.articles.length, EXPECTED_ARTICLE_COUNT);
assert.equal(payload.taxonomy.length, 14);
assert.equal(new Set(payload.taxonomy.map(({ id }) => id)).size, 14);
assert.deepEqual(payload, secondPayload, "generation must be deterministic");

const canonicalIds = new Set(CANONICAL_TYPES.map(({ id }) => id));
for (const type of payload.taxonomy) {
  assert.ok(type.nameEn.trim(), `${type.id} needs an English name`);
  assert.ok(type.nameZh.trim(), `${type.id} needs a Chinese name`);
  assert.ok(type.aliases.some((alias) => /[\u3400-\u9fff]/u.test(alias)), `${type.id} needs a Chinese alias`);
}

assert.deepEqual(
  Object.fromEntries([1, 2, 3].map((passage) => [
    passage,
    payload.articles.filter((article) => article.passage === passage).length,
  ])),
  { 1: 147, 2: 137, 3: 153 },
);

const expectedArticleCounts = {
  "sentence-completion": 82,
  "summary-completion": 145,
  "note-completion": 23,
  "table-completion": 27,
  "flowchart-completion": 25,
  "diagram-labelling": 16,
  "short-answer-questions": 57,
  "multiple-choice": 232,
  "true-false-not-given": 200,
  "yes-no-not-given": 67,
  "matching-sentence-endings": 35,
  "matching-names-features": 127,
  "matching-information": 102,
  "matching-headings": 80,
};
const expectedQuestionCounts = {
  "sentence-completion": 336,
  "summary-completion": 686,
  "note-completion": 129,
  "table-completion": 142,
  "flowchart-completion": 126,
  "diagram-labelling": 67,
  "short-answer-questions": 248,
  "multiple-choice": 907,
  "true-false-not-given": 1005,
  "yes-no-not-given": 351,
  "matching-sentence-endings": 154,
  "matching-names-features": 660,
  "matching-information": 539,
  "matching-headings": 477,
};
assert.deepEqual(
  Object.fromEntries(payload.taxonomy.map(({ id }) => [id, payload.byType[id].length])),
  expectedArticleCounts,
  "article counts must match the independently reviewed 437-practice corpus",
);
assert.deepEqual(
  Object.fromEntries(payload.taxonomy.map(({ id }) => [
    id,
    payload.articles.reduce(
      (total, entry) => total + (entry.types.find((type) => type.id === id)?.questionNumbers.length || 0),
      0,
    ),
  ])),
  expectedQuestionCounts,
  "question counts must match the independently reviewed 5,827-question corpus",
);
assert.equal(Object.values(expectedQuestionCounts).reduce((sum, count) => sum + count, 0), 5827);

for (const article of payload.articles) {
  assert.ok(article.types.length > 0, `${article.id} is unclassified`);
  const numbers = [];
  for (const type of article.types) {
    assert.ok(canonicalIds.has(type.id), `${article.id} uses unknown type ${type.id}`);
    assert.deepEqual(type.ranges, compressQuestionRanges(type.questionNumbers));
    numbers.push(...type.questionNumbers);
  }
  const expected = Array.from(
    { length: article.questionEnd - article.questionStart + 1 },
    (_, index) => article.questionStart + index,
  );
  assert.deepEqual(numbers.sort((left, right) => left - right), expected, `${article.id} question coverage`);
}

assert.deepEqual(resolveSearchTypeIds(payload, "段落標題"), ["matching-headings"]);
assert.deepEqual(resolveSearchTypeIds(payload, "Matching Headings"), ["matching-headings"]);
assert.deepEqual(resolveSearchTypeIds(payload, "補 summary"), ["summary-completion"]);
assert.deepEqual(resolveSearchTypeIds(payload, "選正確選項"), ["multiple-choice"]);
assert.deepEqual(resolveSearchTypeIds(payload, "判斷題"), ["true-false-not-given", "yes-no-not-given"]);
assert.deepEqual(resolveSearchTypeIds(payload, "填空"), [
  "sentence-completion",
  "summary-completion",
  "note-completion",
  "table-completion",
  "flowchart-completion",
  "diagram-labelling",
]);
assert.deepEqual(resolveSearchTypeIds(payload, "配對"), [
  "matching-sentence-endings",
  "matching-names-features",
  "matching-information",
  "matching-headings",
]);

function article(id) {
  const result = payload.articles.find((entry) => entry.id === id);
  assert.ok(result, `missing representative article ${id}`);
  return result;
}

assert.deepEqual(article("p1-069-albert-einstein").types, [
  { id: "sentence-completion", questionNumbers: [9, 10], ranges: [[9, 10]] },
  { id: "multiple-choice", questionNumbers: [11, 12, 13], ranges: [[11, 13]] },
  { id: "true-false-not-given", questionNumbers: [1, 2, 3, 4, 5, 6, 7, 8], ranges: [[1, 8]] },
]);
assert.deepEqual(article("p2-064").types, [
  { id: "true-false-not-given", questionNumbers: [20, 21, 22, 23, 24, 25], ranges: [[20, 25]] },
  { id: "matching-information", questionNumbers: [14, 15, 16, 17, 18, 19], ranges: [[14, 19]] },
]);
assert.deepEqual(
  article("p1-076").types.find(({ id }) => id === "sentence-completion")?.questionNumbers,
  [9],
);
assert.deepEqual(
  article("p1-104").types.find(({ id }) => id === "matching-names-features")?.questionNumbers,
  [7, 8, 9, 10, 11, 12, 13],
);
assert.deepEqual(
  article("p3-076").types.find(({ id }) => id === "flowchart-completion")?.questionNumbers,
  [27, 28, 29, 30, 31],
);
assert.deepEqual(payload.buildAudit.ignoredGroups, [{
  articleId: "p3-007",
  ignoredGroupId: "g30",
  containingGroupId: "g27",
  reason: "Spurious OCR fragment Q30–30 fully contained in the real Q27–36 flowchart group g27.",
}]);
assert.deepEqual(article("p1-074").types.find(({ id }) => id === "matching-sentence-endings"), {
  id: "matching-sentence-endings",
  questionNumbers: [7, 8, 9],
  ranges: [[7, 9]],
});
assert.deepEqual(article("p3-092").types.find(({ id }) => id === "matching-names-features"), {
  id: "matching-names-features",
  questionNumbers: [35, 36, 37, 38, 39, 40],
  ranges: [[35, 40]],
});
assert.deepEqual(article("p3-104").types.find(({ id }) => id === "matching-sentence-endings"), {
  id: "matching-sentence-endings",
  questionNumbers: [37, 38, 39, 40],
  ranges: [[37, 40]],
});

const serialized = serializeQuestionTypePayload(payload);
assert.equal(await readFile(OUTPUT_FILE, "utf8"), serialized, "generated browser index is stale");
const sandbox = { window: {} };
vm.runInNewContext(serialized, sandbox, { filename: OUTPUT_FILE });
assert.equal(sandbox.window.EDMUND_IELTS_READING_QUESTION_TYPES.articleCount, EXPECTED_ARTICLE_COUNT);

console.log(`IELTS Reading question-type index verified: ${EXPECTED_ARTICLE_COUNT} articles, 14 canonical bilingual types.`);
