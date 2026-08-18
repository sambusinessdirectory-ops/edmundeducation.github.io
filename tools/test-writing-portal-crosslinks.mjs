import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function localScriptSources(htmlFile, pattern) {
  return [...new Set([...read(htmlFile).matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1].split("?", 1)[0])
    .filter((source) => !source.includes("://") && pattern.test(source)))];
}

function evaluate(files, sandbox = { window: {} }) {
  vm.createContext(sandbox);
  for (const file of files) {
    vm.runInContext(read(file), sandbox, { filename: file, timeout: 30_000 });
  }
  return sandbox;
}

function publishedWritingFlashDecks() {
  const html = read("flashcards.html");
  const seedStart = html.indexOf("window.EDMUND_FLASHCARD_SEED = {");
  const seedEnd = html.indexOf("\n};\n  </script>", seedStart);
  assert.ok(seedStart >= 0 && seedEnd > seedStart, "Flash Cards inline seed must be readable");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(html.slice(seedStart, seedEnd + 3), sandbox, {
    filename: "flashcards.html#EDMUND_FLASHCARD_SEED",
    timeout: 30_000
  });
  evaluate(localScriptSources(
    "flashcards.html",
    /^(?:flashcards-ielts-writing(?:-.*)?|flashcards-dse-writing-part-a|flashcards-hkpf|flashcards-hkfsd-incident-reports)-data\.js$/
  ), sandbox);
  return new Map(Object.entries(sandbox.window.EDMUND_FLASHCARD_SEED || {})
    .filter(([, cards]) => Array.isArray(cards) && cards.length));
}

function categoryFor(exerciseId) {
  if (/^dse-writing-.+-part-a(?:-|$)/.test(exerciseId)) return "DSE Part A";
  if (/^dse-writing-.+-part-b-/.test(exerciseId)) return "DSE Part B";
  if (/^model-essay-.+-ielts-task1-/.test(exerciseId)) return "IELTS Task 1";
  if (/^model-essay-.+-ielts-/.test(exerciseId)) return "IELTS Task 2";
  if (exerciseId === "hkfsd-incident-report-3") return "Government";
  if (/^hkpf-civic-composition-/.test(exerciseId)) return "Government";
  if (/^business-english-standard-response-book-1-q\d+$/.test(exerciseId)) return "Business English";
  return "Unknown";
}

test("all six Writing families expose every real reciprocal route and no invented route", async () => {
  const { WRITING_SUBMISSION_REFERENCE_DATA: references } = await import(
    `${pathToFileURL(path.join(root, "writing-submission-reference-data.mjs")).href}?crosslinks=${Date.now()}`
  );
  const entries = Object.entries(references);
  const flashDecks = publishedWritingFlashDecks();

  const counts = Object.fromEntries(Object.entries(Object.groupBy(entries, ([exerciseId]) => categoryFor(exerciseId)))
    .map(([category, rows]) => [category, {
      lessons: rows.length,
      flashcards: rows.filter(([, reference]) => reference.flashDeckId).length
    }]));
  assert.deepEqual(counts, {
    "DSE Part A": { lessons: 15, flashcards: 15 },
    "DSE Part B": { lessons: 3, flashcards: 0 },
    Government: { lessons: 5, flashcards: 4 },
    "Business English": { lessons: 10, flashcards: 0 },
    "IELTS Task 1": { lessons: 60, flashcards: 59 },
    "IELTS Task 2": { lessons: 228, flashcards: 224 }
  });

  for (const [exerciseId, reference] of entries) {
    assert.notEqual(categoryFor(exerciseId), "Unknown", `unclassified writing lesson: ${exerciseId}`);
    assert.equal(
      reference.writingHref,
      `writing-practice.html?exercise=${encodeURIComponent(exerciseId)}`,
      `${exerciseId} has a stale Writing Practice link`
    );
    if (!reference.flashDeckId) continue;
    assert.ok(flashDecks.has(reference.flashDeckId), `${exerciseId} points to a missing/empty Flash Card deck`);
    assert.ok(reference.vocabulary.length, `${exerciseId} links Flash Cards without importing their details`);
  }

  assert.deepEqual(entries.filter(([, reference]) => !reference.flashDeckId).map(([exerciseId]) => exerciseId), [
    "business-english-standard-response-book-1-q1",
    "business-english-standard-response-book-1-q2",
    "business-english-standard-response-book-1-q3",
    "business-english-standard-response-book-1-q4",
    "business-english-standard-response-book-1-q5",
    "business-english-standard-response-book-1-q6",
    "business-english-standard-response-book-1-q7",
    "business-english-standard-response-book-1-q8",
    "business-english-standard-response-book-1-q9",
    "business-english-standard-response-book-1-q10",
    "dse-writing-2022-part-b-q3",
    "dse-writing-2024-part-b-q5",
    "dse-writing-2025-part-b-q3",
    "hkpf-civic-composition-7",
    "model-essay-2-ielts-cause-solution",
    "model-essay-9-ielts-task1-maps",
    "model-essay-26-ielts-direct-question",
    "model-essay-55-ielts-opinion",
    "model-essay-76-ielts-opinion"
  ], "only lessons with no published lesson-specific deck may omit the Flash Card route");

  for (const exerciseId of [
    "dse-writing-2022-part-b-q3",
    "dse-writing-2024-part-b-q5",
    "dse-writing-2025-part-b-q3"
  ]) {
    assert.ok(references[exerciseId].vocabulary.length, `${exerciseId} must retain its built-in thematic details`);
  }
});

test("every IELTS Writing Practice lesson has its canonical download route", async () => {
  const { WRITING_SUBMISSION_REFERENCE_DATA: references } = await import(
    `${pathToFileURL(path.join(root, "writing-submission-reference-data.mjs")).href}?downloads=${Date.now()}`
  );
  const sandbox = evaluate(
    ["essay-portal-links.js", "ielts-task2-model-essays.js", "ielts-task1-downloads.js"],
    { window: { location: { search: "" } }, URLSearchParams }
  );
  const portals = sandbox.window.EDMUND_ESSAY_PORTALS;
  const downloadKeys = new Set([
    ...(sandbox.window.EDMUND_MODEL_ESSAYS || []),
    ...(sandbox.window.EDMUND_IELTS_TASK1_DOWNLOADS || [])
  ].map((item) => portals.fromDownloadItem(item)));

  const ieltsEntries = Object.entries(references).filter(([exerciseId]) => /^model-essay-/.test(exerciseId));
  assert.equal(ieltsEntries.length, 288);
  for (const [exerciseId, reference] of ieltsEntries) {
    assert.ok(reference.essayKey, `${exerciseId} is missing its cross-portal identity`);
    assert.ok(downloadKeys.has(reference.essayKey), `${exerciseId} has no matching Download Site record`);
    assert.match(portals.href("downloads", reference.essayKey), /^model-essay-downloads\.html\?essay=/);
  }
});
