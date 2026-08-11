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
    /^(?:flashcards-ielts-writing(?:-.*)?|flashcards-dse-writing-part-a)-data\.js$/
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
  assert.equal(entries.filter(([, reference]) => reference.vocabulary.length > 0).length, 298);
  assert.equal(entries.filter(([, reference]) => reference.paragraphs.every((paragraph) => paragraph.chinese)).length, 293);

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
      assert.equal(reference.vocabulary.length, 0, `${exerciseId} has unlinked thematic vocabulary`);
    }
    assert.ok(reference.paragraphs.length > 0, `${exerciseId} must include essay paragraphs`);
    for (const paragraph of reference.paragraphs) {
      assert.ok(paragraph.label, `${exerciseId} has an unlabelled paragraph`);
      assert.ok(paragraph.english, `${exerciseId} has an empty English paragraph`);
      assert.equal(typeof paragraph.chinese, "string");
    }
    for (const row of reference.vocabulary) {
      assert.ok(row.english, `${exerciseId} has an empty vocabulary term`);
      assert.equal(typeof row.chinese, "string");
    }
  }

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
      "dse-writing-2022-part-b-q3",
      "dse-writing-2024-part-b-q5",
      "dse-writing-2025-part-b-q3",
      "hkpf-civic-composition-4",
      "hkpf-civic-composition-5",
      "hkpf-civic-composition-6",
      "hkpf-civic-composition-7",
      "model-essay-2-ielts-cause-solution",
      "model-essay-26-ielts-direct-question",
      "model-essay-55-ielts-opinion",
      "model-essay-76-ielts-opinion",
      "model-essay-9-ielts-task1-maps"
    ]
  );
});
