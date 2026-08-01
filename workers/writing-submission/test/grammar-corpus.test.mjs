import assert from "node:assert/strict";
import test from "node:test";

import {
  GRAMMAR_CORPUS_SIZE,
  GRAMMAR_CORPUS_VERSION,
  createGrammarCorpusRuntime,
  lookupApprovedExactCorrection
} from "../src/grammar-corpus.js";

const FIXTURES = Object.freeze([
  Object.freeze({
    sentenceId: "TEST-S01",
    paragraphId: "TEST-P01",
    sourceSentence: "The children was playing outside.",
    correctedSentence: "The children were playing outside.",
    categories: Object.freeze(["subject_verb_agreement"]),
    ruleIds: Object.freeze(["PLURAL_PAST_BE"]),
    structureTags: Object.freeze(["plural_subject", "past_be"]),
    issues: Object.freeze([Object.freeze({
      ruleId: "PLURAL_PAST_BE",
      category: "subject_verb_agreement",
      originalText: "was",
      replacementText: "were",
      occurrence: 1,
      explanationZhHant: "children 是複數主語，所以過去式要用 were。",
      confidence: 1
    })])
  }),
  Object.freeze({
    sentenceId: "TEST-S02",
    paragraphId: "TEST-P01",
    sourceSentence: "The driver can delivers the parcel.",
    correctedSentence: "The driver can deliver the parcel.",
    categories: Object.freeze(["modal_or_auxiliary"]),
    ruleIds: Object.freeze(["MODAL_BASE_VERB"]),
    structureTags: Object.freeze(["modal_base_form"]),
    issues: Object.freeze([Object.freeze({
      ruleId: "MODAL_BASE_VERB",
      category: "modal_or_auxiliary",
      originalText: "delivers",
      replacementText: "deliver",
      occurrence: 1,
      explanationZhHant: "can 後面要用動詞原形，所以要寫 deliver。",
      confidence: 1
    })])
  }),
  Object.freeze({
    sentenceId: "TEST-S03",
    paragraphId: "TEST-P01",
    sourceSentence: "Maya wants visit library.",
    correctedSentence: "Maya wants to visit the library.",
    categories: Object.freeze(["infinitive_or_gerund", "article_or_determiner"]),
    ruleIds: Object.freeze(["WANT_TO_INFINITIVE"]),
    structureTags: Object.freeze(["verb_complement", "singular_countable_noun"]),
    issues: Object.freeze([Object.freeze({
      ruleId: "WANT_TO_INFINITIVE",
      category: "infinitive_or_gerund",
      originalText: "wants visit",
      replacementText: "wants to visit",
      occurrence: 1,
      explanationZhHant: "want 後面通常用 to 加動詞原形。",
      confidence: 1
    })])
  }),
  Object.freeze({
    sentenceId: "TEST-S04",
    paragraphId: "TEST-P01",
    sourceSentence: "The students are ready.",
    correctedSentence: "The students are ready.",
    categories: Object.freeze([]),
    ruleIds: Object.freeze([]),
    structureTags: Object.freeze(["clean_reference"]),
    issues: Object.freeze([])
  })
]);

function runtime(sentences = FIXTURES) {
  return createGrammarCorpusRuntime({
    corpusVersion: "test-corpus-1",
    corpusSentences: sentences
  });
}

test("generated approved corpus is loaded and materialized at module initialization", () => {
  assert.match(GRAMMAR_CORPUS_VERSION, /^\d{4}-\d{2}-\d{2}\.\d+$/u);
  assert.ok(GRAMMAR_CORPUS_SIZE >= 14);

  const result = lookupApprovedExactCorrection(
    "In recent years, many company requires their staffs to wears uniforms at work."
  );
  assert.ok(result);
  assert.equal(result.sentenceId, "PARA-0001-S01");
  assert.equal(result.paragraphId, "PARA-0001");
  assert.equal(result.issues.length, 4);
  assert.equal(result.issues[0].category, "singular_plural");
  assert.equal(result.issues[0].message, "many 後面的可數名詞通常要用複數，所以寫 companies。");
});

test("exact approved lookup is authoritative and exposes safe Worker-derived ranges", () => {
  const corpus = runtime();
  const result = corpus.lookupApprovedExactCorrection("The children was playing outside.");

  assert.ok(result);
  assert.equal(result.corpusId, "TEST-S01");
  assert.equal(result.sentenceId, "TEST-S01");
  assert.equal(result.paragraphId, "TEST-P01");
  assert.equal(result.corpusVersion, "test-corpus-1");
  assert.equal(result.correctedSentence, "The children were playing outside.");
  assert.deepEqual(result.issues.map((issue) => ({
    start: issue.start,
    end: issue.end,
    originalText: issue.originalText,
    suggestedText: issue.suggestedText
  })), [{
    start: 13,
    end: 16,
    originalText: "was",
    suggestedText: "were"
  }]);
  assert.equal(result.issues[0].message, "children 是複數主語，所以過去式要用 were。");
  assert.equal(result.issues[0].engine, corpus.engine);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.issues), true);
});

test("exact means exact; case, spacing and punctuation variants do not inherit an approved correction", () => {
  const corpus = runtime();
  assert.equal(corpus.lookupApprovedExactCorrection("the children was playing outside."), null);
  assert.equal(corpus.lookupApprovedExactCorrection("The children  was playing outside."), null);
  assert.equal(corpus.lookupApprovedExactCorrection("The children was playing outside;"), null);
  assert.equal(corpus.lookupApprovedExactCorrection("The technicians was playing outside."), null);
});

test("an approved clean sentence authoritatively returns an empty frozen issue list", () => {
  const result = runtime().lookupApprovedExactCorrection("The students are ready.");
  assert.ok(result);
  assert.deepEqual(result.issues, []);
  assert.equal(Object.isFrozen(result.issues), true);
});

test("a teacher-approved corrected counterpart is also an authoritative clean exact match", () => {
  const result = runtime().lookupApprovedExactCorrection(
    "The children were playing outside."
  );

  assert.ok(result);
  assert.equal(result.sentenceId, "TEST-S01");
  assert.equal(result.sourceSentence, "The children were playing outside.");
  assert.equal(result.correctedSentence, "The children were playing outside.");
  assert.deepEqual(result.categories, []);
  assert.deepEqual(result.ruleIds, []);
  assert.deepEqual(result.issues, []);
});

test("corrupt or conflicting generated data fails closed", () => {
  assert.throws(() => runtime([
    FIXTURES[0],
    { ...FIXTURES[0], sentenceId: "TEST-S99" }
  ]), /Duplicate approved grammar corpus sentence/);

  assert.throws(() => runtime([
    { ...FIXTURES[0], sentenceId: "" }
  ]), /sentence id/);

  assert.throws(() => runtime([
    { ...FIXTURES[0], sentenceId: "TEST-S98", categories: ["invented_category"] }
  ]), /unknown value/);

  assert.throws(() => runtime([
    {
      ...FIXTURES[0],
      sentenceId: "TEST-S97",
      issues: [{ ...FIXTURES[0].issues[0], ruleId: "UNDECLARED_RULE" }]
    }
  ]), /undeclared rule/);

  assert.throws(() => runtime([
    FIXTURES[0],
    {
      ...FIXTURES[0],
      sentenceId: "TEST-S96",
      sourceSentence: FIXTURES[0].correctedSentence,
      correctedSentence: "The children are playing outside.",
      issues: [{
        ...FIXTURES[0].issues[0],
        originalText: "were",
        replacementText: "are"
      }]
    }
  ]), /marks a corrected sentence as incorrect/);

  for (const partitionMarker of [
    { evaluationHoldout: true },
    { retrievalEligible: false },
    { partition: "holdout" },
    { status: "draft" }
  ]) {
    assert.throws(() => runtime([
      { ...FIXTURES[0], sentenceId: "TEST-HOLDOUT", ...partitionMarker }
    ]), /Non-retrieval grammar corpus material/);
  }
});

test("guide selection gives category agreement priority over names and subject matter", () => {
  const corpus = runtime();
  const guides = corpus.selectApprovedGrammarGuides(
    "Gary and Maya was waiting at the station.",
    ["subject_verb_agreement"],
    { limit: 2 }
  );

  assert.equal(guides[0].sentenceId, "TEST-S01");
  assert.ok(guides.length <= 2);
  assert.equal(Object.isFrozen(guides), true);
  assert.ok(guides.every((guide) => Object.isFrozen(guide)));
});

test("generic token shapes can retrieve a structural modal guide without an exact sentence map", () => {
  const corpus = runtime();
  const guides = corpus.selectApprovedGrammarGuides(
    "The pilot can carries the luggage.",
    [],
    { limit: 1 }
  );

  assert.equal(guides.length, 1);
  assert.equal(guides[0].sentenceId, "TEST-S02");
  assert.equal(guides[0].sourceSentence, "The driver can delivers the parcel.");
  assert.equal(guides[0].correctedSentence, "The driver can deliver the parcel.");
});

test("weak length or inflection tags alone never retrieve unrelated teacher examples", () => {
  const corpus = runtime();

  assert.deepEqual(corpus.selectApprovedGrammarGuides("Water evaporates.", []), []);
  assert.deepEqual(corpus.selectApprovedGrammarGuides("Birds sing.", []), []);
});

test("selection is bounded, deterministic, ignores unknown hints and never returns the exact source", () => {
  const corpus = runtime();
  const sentence = "The pilot can carries the luggage.";
  const first = corpus.selectApprovedGrammarGuides(
    sentence,
    ["modal_or_auxiliary", "untrusted_model_category"],
    { limit: 99 }
  );
  const second = corpus.selectApprovedGrammarGuides(
    sentence,
    ["modal_or_auxiliary", "untrusted_model_category"],
    { limit: 99 }
  );

  assert.deepEqual(first, second);
  assert.ok(first.length <= 3);
  assert.ok(first.every((guide) => guide.sourceSentence !== sentence));
  assert.deepEqual(
    corpus.selectApprovedGrammarGuides("The driver can delivers the parcel.", ["modal_or_auxiliary"])
      .map((guide) => guide.sentenceId)
      .includes("TEST-S02"),
    false
  );
  assert.deepEqual(corpus.selectApprovedGrammarGuides(sentence, [], { limit: 0 }), []);
});
