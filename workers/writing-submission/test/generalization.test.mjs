import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIRECTORY = path.resolve(TEST_DIRECTORY, "../src");
const GENERAL_CORRECTION_MODULE = fs.existsSync(path.join(SOURCE_DIRECTORY, "general-correction.js"))
  ? path.join(SOURCE_DIRECTORY, "general-correction.js")
  : path.join(SOURCE_DIRECTORY, "grammar-ai.js");

const {
  deriveGeneralCorrectionHunks,
  materializeGeneralCorrection
} = await import(pathToFileURL(GENERAL_CORRECTION_MODULE).href);

const TEST_ENGINE = Object.freeze({
  provider: "test",
  model: "deterministic-generalization-fixture",
  version: "1"
});

function modelResult(correctedSentence, issues = []) {
  return {
    response: {
      correctedSentence,
      issues
    }
  };
}

function applyRanges(source, ranges, replacementKey) {
  let output = source;
  for (const range of [...ranges].sort((left, right) => right.start - left.start)) {
    output = `${output.slice(0, range.start)}${range[replacementKey]}${output.slice(range.end)}`;
  }
  return output;
}

function assertValidRanges(source, target, ranges, replacementKey) {
  assert.ok(Array.isArray(ranges), "correction ranges must be an array");
  assert.ok(ranges.length > 0, "a changed sentence must expose at least one range");

  let previousEnd = -1;
  for (const range of ranges) {
    assert.equal(Number.isSafeInteger(range.start), true);
    assert.equal(Number.isSafeInteger(range.end), true);
    assert.ok(range.start >= 0);
    assert.ok(range.end > range.start, "ranges must anchor insertions to source text");
    assert.ok(range.start >= previousEnd, "ranges must be ordered and non-overlapping");
    assert.equal(source.slice(range.start, range.end), range.originalText);
    assert.equal(typeof range[replacementKey], "string");
    assert.notEqual(range[replacementKey], range.originalText);
    previousEnd = range.end;
  }

  assert.equal(applyRanges(source, ranges, replacementKey), target);
}

const GENERALIZATION_CASES = Object.freeze([
  Object.freeze({
    source: "The technicians was repairing two device yesterday.",
    target: "The technicians were repairing two devices yesterday."
  }),
  Object.freeze({
    source: "Every participants need submit two report before Friday.",
    target: "Every participant needs to submit two reports before Friday."
  }),
  Object.freeze({
    source: "These proposal has create serious problem for residents.",
    target: "These proposals have created serious problems for residents."
  }),
  Object.freeze({
    source: "Our new equipment allow workers finish tasks more quick.",
    target: "Our new equipment allows workers to finish tasks more quickly."
  })
]);

test("deriveGeneralCorrectionHunks reconstructs unseen multi-error corrections", () => {
  for (const { source, target } of GENERALIZATION_CASES) {
    const ranges = deriveGeneralCorrectionHunks(source, target);
    assertValidRanges(source, target, ranges, "replacementText");
  }
});

test("materializeGeneralCorrection trusts a safe correctedSentence, not model issue coordinates", () => {
  const source = "Several applicant was send the form late.";
  const target = "Several applicants sent the form late.";
  const malformedHints = [
    null,
    { category: "not_a_real_category" },
    {
      category: "subject_verb_agreement",
      originalText: "text that is not present",
      replacementText: "irrelevant text",
      occurrence: 99,
      explanationZhHant: "這個座標是故意錯誤的。",
      confidence: 0.99
    }
  ];

  const issues = materializeGeneralCorrection(
    source,
    modelResult(target, malformedHints),
    TEST_ENGINE
  );

  assertValidRanges(source, target, issues, "suggestedText");
  assert.ok(issues.every((issue) => issue.engine === TEST_ENGINE));
});

test("materializeGeneralCorrection can recover every edit from an empty issue map", () => {
  const source = "Neither solution provide enough informations for users.";
  const target = "Neither solution provides enough information for users.";
  const issues = materializeGeneralCorrection(source, modelResult(target), TEST_ENGINE);

  assertValidRanges(source, target, issues, "suggestedText");
  assert.ok(issues.every((issue) => typeof issue.message === "string" && issue.message.length > 0));
});

test("general ranges use UTF-16 offsets and reconstruct text containing astral characters", () => {
  const source = "📘 These learner writes useful summary every week.";
  const target = "📘 These learners write useful summaries every week.";
  const ranges = deriveGeneralCorrectionHunks(source, target);

  assertValidRanges(source, target, ranges, "replacementText");
  assert.ok(ranges[0].start >= 3, "the first range must begin after the two-unit emoji and space");

  const issues = materializeGeneralCorrection(source, modelResult(target), TEST_ENGINE);
  assertValidRanges(source, target, issues, "suggestedText");
});

test("unchanged clean sentences return an empty immutable issue list", () => {
  const sentence = "The participants have submitted their reports.";
  const issues = materializeGeneralCorrection(sentence, modelResult(sentence), TEST_ENGINE);

  assert.deepEqual(issues, []);
  assert.equal(Object.isFrozen(issues), true);
});

const UNSAFE_CORRECTIONS = Object.freeze([
  Object.freeze({
    label: "quoted text",
    source: "The file named \"North Star\" contains an error.",
    target: "The file named \"Northern Star\" contains an error."
  }),
  Object.freeze({
    label: "number",
    source: "The office ordered 3 replacement screens.",
    target: "The office ordered 4 replacement screens."
  }),
  Object.freeze({
    label: "proper name",
    source: "Professor Elena reviews the report every Friday.",
    target: "Professor Emma reviews the report every Friday."
  }),
  Object.freeze({
    label: "negation",
    source: "The backup does not contain the missing records.",
    target: "The backup contains the missing records."
  }),
  Object.freeze({
    label: "URL mutation",
    source: "The guide at https://docs.example.org contain more detail.",
    target: "The guide at https://malicious.example contains more details."
  }),
  Object.freeze({
    label: "URL introduction",
    source: "The guide contain more detail for readers.",
    target: "The guide contains more details at https://malicious.example."
  }),
  Object.freeze({
    label: "HTML introduction",
    source: "The note contain one spelling error.",
    target: "The note contains one <script>alert(1)</script> spelling error."
  }),
  Object.freeze({
    label: "unrelated semantic rewrite",
    source: "The analyst prepare a short report each month.",
    target: "A beautiful sunset appeared above the quiet harbour."
  }),
  Object.freeze({
    label: "bidirectional control character",
    source: "The analyst prepare a short report each month.",
    target: "The analyst prepares a short \u202ereport each month."
  })
]);

test("general correction rejects protected-meaning changes and active-content injection", () => {
  for (const { label, source, target } of UNSAFE_CORRECTIONS) {
    assert.equal(
      deriveGeneralCorrectionHunks(source, target),
      null,
      `${label} must fail before UI ranges are created`
    );
    assert.equal(
      materializeGeneralCorrection(source, modelResult(target), TEST_ENGINE),
      null,
      `${label} must fail before model output is materialized`
    );
  }
});

test("production does not contain sentence-specific recovery tables or this unseen corpus", () => {
  const production = fs.readdirSync(SOURCE_DIRECTORY)
    .filter((name) => name.endsWith(".js"))
    .map((name) => fs.readFileSync(path.join(SOURCE_DIRECTORY, name), "utf8"))
    .join("\n");

  assert.doesNotMatch(production, /VERIFIED_RECOVERY_BATCHES/);
  assert.doesNotMatch(production, /VERIFIED_ACCEPTABLE_SENTENCES/);

  for (const { source, target } of GENERALIZATION_CASES) {
    assert.equal(production.includes(source), false, `source fixture must not be hard-coded: ${source}`);
    assert.equal(production.includes(target), false, `target fixture must not be hard-coded: ${target}`);
  }
});
