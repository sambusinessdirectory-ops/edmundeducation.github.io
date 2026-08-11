import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const generator = path.join(root, "tools/generate-writing-submission-reference-data.mjs");
const checkedInModule = path.join(root, "writing-submission-reference-data.mjs");
const homeworkCatalogModule = path.join(root, "homework-resource-catalog.mjs");

function generateReferenceModule(outputPath) {
  execFileSync(process.execPath, [generator, "--output", outputPath], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe"
  });
  return fs.readFileSync(outputPath, "utf8");
}

function localScriptSources(htmlFile, pattern) {
  const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
  return [...new Set([...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1].split("?", 1)[0])
    .filter((source) => !source.includes("://") && pattern.test(source)))];
}

function evaluateBrowserFiles(files, sandbox = { window: {} }) {
  vm.createContext(sandbox);
  for (const file of files) {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {
      filename: file,
      timeout: 30_000
    });
  }
  return sandbox;
}

function authoritativeWritingExerciseIds() {
  const sandbox = evaluateBrowserFiles(localScriptSources(
    "writing-practice.html",
    /^writing-practice-.*-data\.js$/
  ));
  const ids = [];
  for (const collection of Object.values(sandbox.window)) {
    if (!collection || typeof collection !== "object" || Array.isArray(collection)) continue;
    for (const exercise of Object.values(collection)) {
      if (exercise?.id && exercise?.title) ids.push(String(exercise.id));
    }
  }
  assert.equal(new Set(ids).size, ids.length, "Writing Practice must not publish duplicate exercise ids");
  return ids.sort((left, right) => left.localeCompare(right, "en", { numeric: true }));
}

function writingCategory(exerciseId) {
  if (/^dse-writing-.*-part-a(?:-|$)/.test(exerciseId)) return "DSE Part A";
  if (/^dse-writing-.*-part-b(?:-|$)/.test(exerciseId)) return "DSE Part B";
  if (/^model-essay-\d+-ielts-task1-/.test(exerciseId)) return "IELTS Task 1";
  if (/^model-essay-\d+-ielts-/.test(exerciseId)) return "IELTS Task 2";
  if (/^hkpf-civic-composition-/.test(exerciseId)) return "Government / HKPF";
  throw new Error(`Unclassified Writing Practice exercise: ${exerciseId}`);
}

function publishedWritingFlashDeckIds() {
  const flashcardsHtml = fs.readFileSync(path.join(root, "flashcards.html"), "utf8");
  const seedStart = flashcardsHtml.indexOf("window.EDMUND_FLASHCARD_SEED = {");
  const seedEnd = flashcardsHtml.indexOf("\n};\n  </script>", seedStart);
  assert.ok(seedStart >= 0 && seedEnd > seedStart, "Flash Cards inline seed must be readable");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(flashcardsHtml.slice(seedStart, seedEnd + 3), sandbox, {
    filename: "flashcards.html#EDMUND_FLASHCARD_SEED",
    timeout: 30_000
  });
  evaluateBrowserFiles(localScriptSources(
    "flashcards.html",
    /^(?:flashcards-ielts-writing(?:-.*)?|flashcards-dse-writing-part-a|flashcards-dse-practical-writing|flashcards-hkpf)-data\.js$/
  ), sandbox);
  return new Set(Object.entries(sandbox.window.EDMUND_FLASHCARD_SEED || {})
    .filter(([, cards]) => Array.isArray(cards) && cards.length)
    .map(([deckId]) => deckId));
}

test("Writing Submission reference data is deterministic and up to date", () => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "writing-submission-reference-"));
  try {
    const first = generateReferenceModule(path.join(temporaryDirectory, "first.mjs"));
    const second = generateReferenceModule(path.join(temporaryDirectory, "second.mjs"));
    assert.equal(first, second, "two generator runs must produce byte-identical modules");
    assert.equal(
      first,
      fs.readFileSync(checkedInModule, "utf8"),
      "rerun the generator after changing an essay, translation, or Flash Card deck"
    );
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test("generated references cover every published Writing Practice lesson with no stale or duplicate route", async () => {
  const moduleUrl = `${pathToFileURL(checkedInModule).href}?test=${Date.now()}`;
  const { WRITING_SUBMISSION_REFERENCE_DATA: references } = await import(moduleUrl);
  const entries = Object.entries(references);

  const authoritativeIds = authoritativeWritingExerciseIds();
  const generatedIds = entries.map(([exerciseId]) => exerciseId);
  assert.equal(authoritativeIds.length, 310);
  assert.deepEqual(generatedIds, authoritativeIds, "references must exactly match Writing Practice sources");
  assert.equal(new Set(generatedIds).size, generatedIds.length);
  assert.equal(entries.filter(([, reference]) => reference.vocabulary.length > 0).length, 304);
  assert.equal(entries.filter(([, reference]) => reference.flashDeckId).length, 301);
  assert.equal(entries.filter(([, reference]) => reference.paragraphs.every((paragraph) => paragraph.chinese)).length, 310);

  const expectedCategoryCoverage = {
    "DSE Part A": { total: 15, modelEssay: 15, translation: 15, vocabulary: 15, flashCards: 15 },
    "DSE Part B": { total: 3, modelEssay: 3, translation: 3, vocabulary: 3, flashCards: 0 },
    "IELTS Task 1": { total: 60, modelEssay: 60, translation: 60, vocabulary: 59, flashCards: 59 },
    "IELTS Task 2": { total: 228, modelEssay: 228, translation: 228, vocabulary: 224, flashCards: 224 },
    "Government / HKPF": { total: 4, modelEssay: 4, translation: 4, vocabulary: 3, flashCards: 3 }
  };
  const actualCategoryCoverage = {};
  for (const [exerciseId, reference] of entries) {
    const category = writingCategory(exerciseId);
    const coverage = actualCategoryCoverage[category] ||= {
      total: 0,
      modelEssay: 0,
      translation: 0,
      vocabulary: 0,
      flashCards: 0
    };
    coverage.total += 1;
    coverage.modelEssay += Number(reference.paragraphs.length > 0);
    coverage.translation += Number(
      reference.paragraphs.length > 0
      && reference.paragraphs.every((paragraph) => paragraph.chinese)
    );
    coverage.vocabulary += Number(reference.vocabulary.length > 0);
    coverage.flashCards += Number(Boolean(reference.flashDeckId));
  }
  assert.deepEqual(actualCategoryCoverage, expectedCategoryCoverage);

  const writingHrefs = entries.map(([, reference]) => reference.writingHref);
  assert.equal(new Set(writingHrefs).size, writingHrefs.length, "each lesson needs one unique Fill-in-the-Blanks route");
  const publishedFlashDecks = publishedWritingFlashDeckIds();

  for (const [exerciseId, reference] of entries) {
    assert.equal(reference.exerciseId, exerciseId);
    assert.equal(
      reference.writingHref,
      `writing-practice.html?exercise=${encodeURIComponent(exerciseId)}`
    );
    if (reference.essayKey) assert.match(reference.essayKey, /^[^:]+:\d+$/);
    if (reference.flashDeckId) {
      assert.ok(publishedFlashDecks.has(reference.flashDeckId), `${exerciseId} has a stale Flash Card route`);
      assert.ok(reference.vocabulary.length, `${exerciseId} has an empty linked Flash Card deck`);
    } else {
      assert.equal(typeof reference.flashDeckId, "string");
    }
    assert.ok(reference.paragraphs.length > 0, `${exerciseId} must include essay paragraphs`);
    for (const paragraph of reference.paragraphs) {
      assert.ok(paragraph.label, `${exerciseId} has an unlabelled paragraph`);
      assert.ok(paragraph.english, `${exerciseId} has an empty English paragraph`);
      assert.equal(typeof paragraph.chinese, "string");
    }
    for (const row of reference.vocabulary) {
      assert.ok(row.english, `${exerciseId} has an empty vocabulary term`);
      assert.ok(row.chinese, `${exerciseId} has a vocabulary term without Chinese meaning`);
    }
  }

  assert.doesNotMatch(
    JSON.stringify(references),
    /\[object Object\]/,
    "object answer tokens must be expanded into their answer text"
  );

  const duplicatedFlashRoutes = Object.entries(Object.groupBy(
    entries.filter(([, reference]) => reference.flashDeckId),
    ([, reference]) => reference.flashDeckId
  )).filter(([, rows]) => rows.length > 1);
  assert.deepEqual(
    duplicatedFlashRoutes.map(([deckId, rows]) => [deckId, rows.map(([exerciseId]) => exerciseId)]),
    [["dse/writing/part-a/2015", [
      "dse-writing-2015-part-a-argument-against",
      "dse-writing-2015-part-a-argument-for"
    ]]],
    "only the two intentional 2015 model-answer variants may share one Flash Card deck"
  );

  const museums = references["model-essay-3-ielts-opinion"];
  assert.equal(museums.essayKey, "opinion:3");
  assert.match(museums.paragraphs[0].english, /^Museums and galleries help shape/);
  assert.match(museums.paragraphs[0].chinese, /^博物館和美術館有助塑造/);
  assert.equal(museums.vocabulary.length, 62);
  assert.deepEqual(museums.vocabulary[0], {
    english: "museums and galleries",
    chinese: "博物館和美術館"
  });

  assert.deepEqual(
    entries
      .filter(([, reference]) => reference.vocabulary.length === 0)
      .map(([exerciseId]) => exerciseId)
      .sort(),
    [
      "hkpf-civic-composition-7",
      "model-essay-2-ielts-cause-solution",
      "model-essay-26-ielts-direct-question",
      "model-essay-55-ielts-opinion",
      "model-essay-76-ielts-opinion",
      "model-essay-9-ielts-task1-maps"
    ]
  );

  assert.deepEqual(
    entries
      .filter(([, reference]) => !reference.flashDeckId)
      .map(([exerciseId]) => exerciseId)
      .sort(),
    [
      "dse-writing-2022-part-b-q3",
      "dse-writing-2024-part-b-q5",
      "dse-writing-2025-part-b-q3",
      "hkpf-civic-composition-7",
      "model-essay-2-ielts-cause-solution",
      "model-essay-26-ielts-direct-question",
      "model-essay-55-ielts-opinion",
      "model-essay-76-ielts-opinion",
      "model-essay-9-ielts-task1-maps"
    ]
  );

  assert.deepEqual(
    [
      references["dse-writing-2022-part-b-q3"].vocabulary.length,
      references["dse-writing-2024-part-b-q5"].vocabulary.length,
      references["dse-writing-2025-part-b-q3"].vocabulary.length
    ],
    [105, 87, 73],
    "DSE Part B must expose the thematic vocabulary already published with each lesson"
  );
  for (const composition of [4, 5, 6]) {
    assert.equal(
      references[`hkpf-civic-composition-${composition}`].flashDeckId,
      `government/hkpf/writing-composition/composition-${composition}`
    );
  }
});

test("every Writing Submission topic resolves to the same canonical Writing Practice route as its reference", async () => {
  const referenceUrl = `${pathToFileURL(checkedInModule).href}?route-test=${Date.now()}`;
  const catalogUrl = `${pathToFileURL(homeworkCatalogModule).href}?route-test=${Date.now()}`;
  const [
    { WRITING_SUBMISSION_REFERENCE_DATA: references },
    { HOMEWORK_RESOURCE_CATALOG: catalog }
  ] = await Promise.all([import(referenceUrl), import(catalogUrl)]);

  const writingTopics = catalog.filter((resource) => resource?.type === "fill-blanks");
  assert.equal(writingTopics.length, Object.keys(references).length);

  for (const resource of writingTopics) {
    assert.match(resource.id, /^fill:.+/);
    const exerciseId = resource.id.slice(5);
    const expectedHref = `writing-practice.html?exercise=${encodeURIComponent(exerciseId)}`;
    assert.equal(resource.url, expectedHref, `${exerciseId} has a stale Homework catalogue route`);
    assert.equal(
      references[exerciseId]?.writingHref,
      expectedHref,
      `${exerciseId} cannot open its Writing Practice details from Writing Submission`
    );
  }

  const bamboo = references["model-essay-1-ielts-task1-process-diagram"];
  assert.equal(
    bamboo.writingHref,
    "writing-practice.html?exercise=model-essay-1-ielts-task1-process-diagram"
  );
  assert.equal(bamboo.flashDeckId, "ielts/writing/task-1/process-diagrams/process-diagram-1");
  assert.ok(bamboo.paragraphs.length, "the bamboo model essay must be embedded");
  assert.equal(bamboo.vocabulary.length, 54, "the bamboo thematic vocabulary must be embedded");
});
