import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  CORPUS_COMPILED_PATTERN_COUNT,
  CORPUS_COMPILED_RULE_COUNT,
  WRITING_CORPUS_RULE_ENGINE,
  checkCorpusGrammar
} from "../writing-submission-corpus-detector.js";
import {
  CORPUS_APPROVED_CLEAN_SENTENCES,
  CORPUS_APPROVED_INCORRECT_SENTENCES,
  CORPUS_DETECTOR_PATTERNS
} from "../writing-submission-corpus-detector.generated.js";
import {
  CORPUS_GUIDANCE_SENTENCES,
  CORPUS_SENTENCES
} from "../workers/writing-submission/src/grammar-corpus.generated.js";

const DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const CORPUS = JSON.parse(fs.readFileSync(
  path.resolve(DIRECTORY, "../grammar-corpus/corpus-v1.json"),
  "utf8"
));
const ISSUES_BY_SENTENCE = new Map();
for (const issue of CORPUS.issues) {
  const bucket = ISSUES_BY_SENTENCE.get(issue.sentenceId) || [];
  bucket.push(issue);
  ISSUES_BY_SENTENCE.set(issue.sentenceId, bucket);
}

function applyIssues(source, issues) {
  return [...issues]
    .sort((left, right) => right.start - left.start)
    .reduce((value, issue) => (
      `${value.slice(0, issue.start)}${issue.suggestedText}${value.slice(issue.end)}`
    ), source);
}

function nthOccurrence(source, fragment, occurrence) {
  let start = 0;
  let found = -1;
  for (let index = 0; index < occurrence; index += 1) {
    found = source.indexOf(fragment, start);
    if (found < 0) return -1;
    start = found + fragment.length;
  }
  return found;
}

test("compiler publishes all approved rules and issue mappings with exact answers kept separate", () => {
  assert.equal(CORPUS_COMPILED_RULE_COUNT, 640);
  assert.equal(CORPUS_COMPILED_PATTERN_COUNT, 724);
  assert.equal(CORPUS_DETECTOR_PATTERNS.every((pattern) => pattern.source === "issue"), true);
  assert.equal(CORPUS_APPROVED_INCORRECT_SENTENCES.length, 322);
  assert.equal(CORPUS_SENTENCES.length, 14);
  assert.equal(CORPUS_SENTENCES.every((sentence) => (
    sentence.partition === "retrieval" && sentence.reviewPolicy === "exact"
  )), true);
  assert.equal(CORPUS_GUIDANCE_SENTENCES.length, 322);
  assert.equal(CORPUS_GUIDANCE_SENTENCES.filter((sentence) => (
    sentence.partition === "development" && sentence.reviewPolicy === "guidance"
  )).length, 308);
  assert.equal(CORPUS_GUIDANCE_SENTENCES.every((sentence) => !Object.hasOwn(sentence, "issues")), true);
});

test("every known incorrect sentence receives exactly its approved non-overlapping repairs", () => {
  for (const sentence of CORPUS.sentences) {
    const expectedIssues = ISSUES_BY_SENTENCE.get(sentence.sentenceId) || [];
    const actualIssues = checkCorpusGrammar(sentence.incorrectSentence, { maximumIssues: 32 });
    assert.equal(
      actualIssues.length,
      expectedIssues.length,
      `${sentence.sentenceId} must not gain cross-pattern extras`
    );
    assert.equal(
      applyIssues(sentence.incorrectSentence, actualIssues),
      sentence.correctedSentence,
      `${sentence.sentenceId} must reconstruct its teacher-approved correction`
    );
    for (let index = 1; index < actualIssues.length; index += 1) {
      assert.ok(actualIssues[index - 1].end <= actualIssues[index].start);
    }
  }
});

test("anchored mappings still work when the surrounding sentence is not an exact corpus lookup", () => {
  const prefix = "Yesterday, ";
  const suffix = " This is documented.";
  let expected = 0;
  let detected = 0;
  for (const sentence of CORPUS.sentences) {
    const transformed = `${prefix}${sentence.incorrectSentence}${suffix}`;
    const actualIssues = checkCorpusGrammar(transformed, { maximumIssues: 32 });
    for (const issue of ISSUES_BY_SENTENCE.get(sentence.sentenceId) || []) {
      expected += 1;
      const originalStart = nthOccurrence(
        sentence.incorrectSentence,
        issue.wrongText,
        issue.occurrence
      );
      const start = prefix.length + originalStart;
      const expectedCorrection = (
        `${transformed.slice(0, start)}${issue.replacementText}`
        + transformed.slice(start + issue.wrongText.length)
      );
      if (actualIssues.some((candidate) => candidate.correctedSentence === expectedCorrection)) {
        detected += 1;
      }
    }
  }
  assert.equal(expected, 724);
  assert.ok(detected >= 600, `expected broad anchored reuse, received ${detected}/724`);
});

test("corrected corpus sentences remain clean without relying on exact-string suppression", () => {
  for (const sentence of CORPUS.sentences) {
    assert.deepEqual(checkCorpusGrammar(sentence.correctedSentence, { maximumIssues: 32 }), []);
    assert.deepEqual(
      checkCorpusGrammar(`${sentence.correctedSentence} This is documented.`, { maximumIssues: 32 }),
      [],
      `${sentence.sentenceId} suffix mutation exposed a false positive`
    );
    assert.deepEqual(
      checkCorpusGrammar(`Yesterday, ${sentence.correctedSentence}`, { maximumIssues: 32 }),
      [],
      `${sentence.sentenceId} prefix mutation exposed a false positive`
    );
  }
});

test("approved exceptions and unrelated grammatical sentences do not trigger literal rewrites", () => {
  for (const exception of CORPUS.exceptions) {
    assert.deepEqual(checkCorpusGrammar(exception.exampleText, { maximumIssues: 32 }), []);
  }
  for (const sentence of [
    "Please help students.",
    "Always help students.",
    "Never give up.",
    "The students like eating food.",
    "John likes to eat food.",
    "May helps students after class.",
    "She suggests that he leave.",
    "They were the first students to arrive.",
    "For example, schools can support their staff.",
    "The rate will be 20 per cent next year.",
    "Although it was raining, we continued.",
    "This bag is for carrying books.",
    "We received three pieces of information."
  ]) {
    assert.deepEqual(checkCorpusGrammar(sentence, { maximumIssues: 32 }), [], sentence);
  }
});

test("emitted issue contract uses UTF-16 offsets and the accepted local engine identity", () => {
  const sentence = "🙂 On the first day, we collected many informations from a tourist centre.";
  const issues = checkCorpusGrammar(sentence, { maximumIssues: 32 });
  const issue = issues.find((candidate) => candidate.ruleId === "INFORMATION_UNCOUNTABLE");
  assert.ok(issue);
  assert.equal(sentence.slice(issue.start, issue.end), issue.originalText);
  assert.equal(issue.originalText, "many informations");
  assert.equal(issue.suggestedText, "much information");
  assert.equal(issue.engine, WRITING_CORPUS_RULE_ENGINE);
  assert.equal(issue.engine.name, "edmund-esl-basics");
  assert.equal(issue.engine.version, "2.0.0");
  assert.equal(issue.category, "countability");
  assert.equal(issue.reviewRequired, false);
  assert.equal(Object.isFrozen(issue), true);
  assert.equal(Object.isFrozen(issue.suggestions), true);
});

test("generated clean references remain test data rather than a runtime mask", () => {
  assert.equal(CORPUS_APPROVED_CLEAN_SENTENCES.length, 335);
  const unseenClean = "Yesterday, the staff received much information. This is documented.";
  assert.equal(CORPUS_APPROVED_CLEAN_SENTENCES.includes(unseenClean), false);
  assert.deepEqual(checkCorpusGrammar(unseenClean, { maximumIssues: 32 }), []);
});
