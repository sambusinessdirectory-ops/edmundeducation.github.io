import assert from "node:assert/strict";
import test from "node:test";

import {
  applyGeneralCorrectionIssues,
  deriveGeneralCorrectionHunks,
  materializeGeneralCorrection,
  validateGeneralCorrection
} from "../src/general-correction.js";

const ENGINE = Object.freeze({
  name: "test-ai",
  model: "general-grammar-reviewer",
  version: "1"
});

const GENERALIZATION_CASES = [
  [
    'Tom has have a book call "Good".',
    'Tom has a book called "Good".'
  ],
  [
    "It go to telling story such as table.",
    "It goes to tell a story, such as a table."
  ],
  [
    "The children was playing outside.",
    "The children were playing outside."
  ],
  [
    "She suggested to go by bus.",
    "She suggested going by bus."
  ],
  [
    "My brother buy two box yesterday.",
    "My brother bought two boxes yesterday."
  ],
  [
    "Gary love watch movie in morning.",
    "Gary loves watching movies in the morning."
  ]
];

test("general correction materializes unseen sentences without sentence maps", () => {
  for (const [source, target] of GENERALIZATION_CASES) {
    const issues = materializeGeneralCorrection(source, target, [], ENGINE);
    assert.ok(issues, source);
    assert.ok(issues.length >= 1, source);
    assert.equal(applyGeneralCorrectionIssues(source, issues), target, source);
    for (let index = 1; index < issues.length; index += 1) {
      assert.ok(issues[index - 1].end <= issues[index].start, source);
    }
  }
});

test("model metadata labels matching hunks but does not control their ranges", () => {
  const source = "The children was playing outside.";
  const target = "The children were playing outside.";
  const issues = materializeGeneralCorrection(source, target, [{
    category: "subject_verb_agreement",
    originalText: "was",
    replacementText: "were",
    occurrence: 99,
    explanationZhHant: "children 是複數主語，所以要用 were。",
    confidence: 0.98,
    start: -400,
    end: 9000
  }], ENGINE);

  assert.equal(issues.length, 1);
  assert.equal(issues[0].start, source.indexOf("was"));
  assert.equal(issues[0].end, source.indexOf("was") + 3);
  assert.equal(issues[0].category, "subject_verb_agreement");
  assert.equal(issues[0].engine, ENGINE);
  assert.equal(applyGeneralCorrectionIssues(source, issues), target);
});

test("unusable model prose cannot become a learner-facing explanation", () => {
  const source = "Nadia enjoy drawing pictures.";
  const target = "Nadia enjoys drawing pictures.";
  const issues = materializeGeneralCorrection(source, target, [{
    category: "subject_verb_agreement",
    originalText: "enjoy",
    replacementText: "enjoys",
    explanationZhHant: "Nadia",
    confidence: 0.9
  }], ENGINE);

  assert.equal(issues.length, 1);
  assert.match(issues[0].message, /主語和動詞/);
  assert.doesNotMatch(issues[0].message, /^Nadia$/);
});

test("generic token LCS handles insertions and preserves an exact reconstruction", () => {
  const source = "Mary and John eats restaurant.";
  const target = "Mary and John eat at a restaurant.";
  const hunks = deriveGeneralCorrectionHunks(source, target);

  assert.ok(hunks?.length);
  const issues = materializeGeneralCorrection(source, target, [], ENGINE);
  assert.equal(applyGeneralCorrectionIssues(source, issues), target);
});

test("integrity checks preserve quotes, numbers, names and semantic operators", () => {
  assert.equal(validateGeneralCorrection(
    'Tom has a book call "Good" in 2026.',
    'Tom has a book called "Good" in 2026.'
  ), true);
  assert.equal(validateGeneralCorrection(
    'Tom has a book call "Good" in 2026.',
    'Tom has a book called "Better" in 2026.'
  ), false);
  assert.equal(validateGeneralCorrection(
    'Tom has a book call "Good" in 2026.',
    'Tom has a book called "Good" in 2027.'
  ), false);
  assert.equal(validateGeneralCorrection("Tom can go.", "Tom cannot go."), false);
  assert.equal(validateGeneralCorrection("Tom can go.", "Tom must go."), false);
  assert.equal(validateGeneralCorrection(
    "If Tom will arrive early, we can start.",
    "If Tom arrives early, we can start."
  ), true);
  assert.equal(validateGeneralCorrection("Tom does not go.", "Tom goes."), false);
  assert.equal(validateGeneralCorrection("Tom go home.", "Gary goes home."), false);
});

test("integrity checks reject active content, introduced URLs and bidi controls", () => {
  assert.equal(validateGeneralCorrection("Tom go home.", "Tom goes <b>home</b>."), false);
  assert.equal(validateGeneralCorrection("Tom go home.", "Tom goes https://attacker.test/home."), false);
  assert.equal(validateGeneralCorrection("Tom go home.", "Tom goes \u202ehome."), false);
});

test("integrity checks reject grammatical-looking style and meaning substitutions", () => {
  assert.equal(validateGeneralCorrection("He is kind.", "He is king."), false);
  assert.equal(validateGeneralCorrection(
    "Tom enjoys watching movies.",
    "Tom enjoys watching films."
  ), false);
  assert.equal(validateGeneralCorrection("Tom is happy.", "Tom is sad."), false);
  assert.equal(validateGeneralCorrection(
    "The report contains one error.",
    "The report contains one warning."
  ), false);
  assert.equal(validateGeneralCorrection(
    "Tom likes tea but hates coffee.",
    "Tom likes tea."
  ), false);
  assert.equal(validateGeneralCorrection(
    "Tom enjoys watching movies.",
    "Tom enjoys watching."
  ), false);
  assert.equal(validateGeneralCorrection("Tom hopes.", "Tom hops."), false);
  assert.equal(validateGeneralCorrection("Tom likes tea.", "Toms like tea."), false);
});

test("audited mode permits necessary grammar expansion but retains hard protections", () => {
  const source = "She gave many useful advices in 2026.";
  const target = "She gave many useful pieces of advice in 2026.";
  assert.equal(validateGeneralCorrection(source, target), false);
  assert.equal(validateGeneralCorrection(source, target, {
    allowMeaningSensitiveChanges: true
  }), true);
  assert.equal(validateGeneralCorrection(
    source,
    "She gave many useful pieces of advice in 2027.",
    { allowMeaningSensitiveChanges: true }
  ), false);
  assert.equal(validateGeneralCorrection(
    'Tom wrote "Good" yesterday.',
    'Gary wrote "Better" yesterday.',
    { allowMeaningSensitiveChanges: true }
  ), false);
  assert.equal(validateGeneralCorrection(
    "Tom write a book.",
    "Tom writes <script>a book</script>.",
    { allowMeaningSensitiveChanges: true }
  ), false);
});

test("unchanged safe targets produce no issues", () => {
  const sentence = "Students can learn together.";
  assert.deepEqual(materializeGeneralCorrection(sentence, sentence, [], ENGINE), []);
});
