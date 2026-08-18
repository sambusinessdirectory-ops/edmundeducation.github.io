#!/usr/bin/env node

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const flashcardDataFile = "flashcards-hkfsd-incident-reports-data.js";
const writingDataFile = "writing-practice-hkfsd-incident-report-data.js";
const flashcardDataPath = path.join(root, flashcardDataFile);
const writingDataPath = path.join(root, writingDataFile);
const flashcardHtmlPath = path.join(root, "flashcards.html");
const writingHtmlPath = path.join(root, "writing-practice.html");
const flashcardAudioManifestPath = path.join(root, "flashcards-audio-manifest.js");
const writingAudioManifestPath = path.join(root, "writing-audio-manifest.js");
const flashcardAudioGeneratorPath = path.join(root, "tools/generate-flashcard-audio.py");
const homeworkGeneratorPath = path.join(root, "tools/generate-homework-resource-catalog.mjs");
const homeworkCatalogPath = path.join(root, "homework-resource-catalog.mjs");

const deckId = "government/hkfsd/incident-reports/incident-report-3";
const exerciseId = "hkfsd-incident-report-3";
const flashcardSourceFile = "Flash Card - HKFSD - Incident Report 3.pdf";
const writingSourceFile = "Fill in the blanks - HKFSD - Incident Report 3.pdf";
const expectedPageCounts = [10, 10, 10, 10, 10, 10, 10, 10, 6];
const expectedModes = ["blank", "start", "end", "both"];
const expectedDifficulty = [
  ["standard", 30, [1, 2, 3, 4], "42efe17cf40df70c3b0444f3a76d3837c7b989797ade6012b12b330722349a34"],
  ["medium", 45, [5, 6, 7, 8], "942ee884d0c2bac15b707f4978a4fbe28ad4460266ed2babd19e9c02825dc112"],
  ["hard", 75, [9, 10, 11, 12], "71e99d74eba5495dc0b28509b397b22ab12b0958cf93d0cc1d0312eef1777eac"],
  ["hell", 70, [13, 14, 15, 16], "d731a0e7d50b8e7200d959f0342507a503243b186787bc3dbf7994d5f87b89b3"]
];
const expectedFlashcardPayloadSha256 = "2d99704359f1c37619b9cafa4e7b4c6cf19ca4bda42b04162a93dff7ae7eae39";
const expectedWritingTextSha256 = "9d6916a9deed29ba96bd692c94f737e0291377b1b111fb282e90f7426b6a70fe";
const chinesePattern = /[\u3400-\u9fff]/u;
const wordPattern = /[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function loadWindowScript(filePath) {
  const window = {};
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), { window }, {
    filename: filePath,
    timeout: 30_000
  });
  return window;
}

function evaluateDeclaration(source, name, nextDeclaration) {
  const start = source.indexOf(`const ${name} =`);
  const end = source.indexOf(nextDeclaration, start);
  assert.ok(start >= 0 && end > start, `Could not isolate ${name}`);
  const context = {};
  vm.runInNewContext(
    `${source.slice(start, end)}\nglobalThis.result = ${name};`,
    context,
    { filename: `${name}.js`, timeout: 30_000 }
  );
  return context.result;
}

function normalizeCardText(value) {
  return String(value || "")
    .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
    .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
    .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2")
    .trim();
}

function sentenceText(sentence) {
  return (sentence?.parts || [])
    .map(part => typeof part === "string" ? part : part?.answer || "")
    .join("");
}

function paragraphText(paragraph) {
  return (paragraph?.sentences || []).map(sentenceText).join(" ");
}

// These functions mirror buildPracticeDifficultyParagraphs() in
// writing-practice.html, including its paragraph-scoped fallback for source
// answers that cross a sentence boundary.
function splitByAnswers(text, answers, answerState) {
  const parts = [];
  let textCursor = 0;
  while (answerState.index < answers.length) {
    const answer = String(answers[answerState.index] || "");
    assert.ok(answer, `Empty source answer at index ${answerState.index}`);
    const matchIndex = text.indexOf(answer, textCursor);
    if (matchIndex < 0) break;
    if (matchIndex > textCursor) parts.push(text.slice(textCursor, matchIndex));
    parts.push({ answer });
    textCursor = matchIndex + answer.length;
    answerState.index += 1;
  }
  if (textCursor < text.length) parts.push(text.slice(textCursor));
  return parts.length ? parts : [text];
}

function reconstruct(exercise, answers, paragraphScoped = false) {
  const answerState = { index: 0 };
  const paragraphs = exercise.paragraphs.map(paragraph => {
    if (paragraphScoped) {
      return {
        sentences: [{ parts: splitByAnswers(paragraphText(paragraph), answers, answerState) }]
      };
    }
    return {
      sentences: paragraph.sentences.map(sentence => ({
        parts: splitByAnswers(sentenceText(sentence), answers, answerState)
      }))
    };
  });
  return { answerState, paragraphs };
}

// Flashcard source, provenance and bilingual inventory.
const flashcardWindow = loadWindowScript(flashcardDataPath);
const seed = flashcardWindow.EDMUND_HKFSD_INCIDENT_REPORTS_SEED;
assert.ok(seed && typeof seed === "object", "Missing HKFSD Incident Reports seed");
assert.deepEqual(Object.keys(seed), [deckId], "Only Incident Report 3 may be live in this ten-item branch");
assert.deepEqual(
  Object.keys(flashcardWindow.EDMUND_FLASHCARD_SEED || {}),
  [deckId],
  "Incident Report 3 was not merged into the main flashcard seed"
);

const cards = seed[deckId];
assert.ok(Array.isArray(cards), "Incident Report 3 flashcards are missing");
assert.equal(cards.length, 86, "Incident Report 3 must contain exactly 86 flashcards");
assert.equal(
  sha256(JSON.stringify(cards)),
  expectedFlashcardPayloadSha256,
  "Flashcard text or audited provenance drifted from the source PDF"
);

const frontSet = new Set();
let exampleCount = 0;
for (const [index, card] of cards.entries()) {
  const label = `Flashcard ${index + 1}`;
  assert.ok(String(card.front || "").trim(), `${label}: blank front`);
  assert.match(String(card.meaning || ""), chinesePattern, `${label}: Chinese meaning missing`);
  assert.equal(card.source, flashcardSourceFile, `${label}: source filename changed`);
  assert.ok(Number.isInteger(card.sourcePage), `${label}: sourcePage must be an integer`);
  assert.ok(card.sourcePage >= 1 && card.sourcePage <= 9, `${label}: sourcePage is outside pages 1-9`);
  assert.ok(Array.isArray(card.examples), `${label}: examples missing`);
  assert.equal(card.examples.length, 5, `${label}: expected five bilingual examples`);
  for (const [exampleIndex, example] of card.examples.entries()) {
    assert.ok(String(example?.en || "").trim(), `${label}: English example ${exampleIndex + 1} missing`);
    assert.match(String(example?.zh || ""), chinesePattern, `${label}: Chinese example ${exampleIndex + 1} missing`);
  }
  const frontKey = normalizeCardText(card.front).toLocaleLowerCase("en");
  assert.equal(frontSet.has(frontKey), false, `${label}: duplicate front ${card.front}`);
  frontSet.add(frontKey);
  exampleCount += card.examples.length;
}
assert.equal(frontSet.size, 86, "Incident Report 3 fronts must be unique");
assert.equal(exampleCount, 430, "Incident Report 3 must contain 430 bilingual example pairs");
assert.deepEqual(
  expectedPageCounts.map((_, pageIndex) => cards.filter(card => card.sourcePage === pageIndex + 1).length),
  expectedPageCounts,
  "Source-page card distribution must remain 10 cards on pages 1-8 and 6 on page 9"
);

// Ten visible placeholders, with only Incident Report 3 backed by live data.
const flashcardHtml = fs.readFileSync(flashcardHtmlPath, "utf8");
const incidentPrefixStart = flashcardHtml.indexOf("const hkfsdIncidentReportsPrefix =");
const incidentPrefixEnd = flashcardHtml.indexOf("hkfsdIncidentReportDecks.forEach", incidentPrefixStart);
assert.ok(incidentPrefixStart >= 0 && incidentPrefixEnd > incidentPrefixStart, "HKFSD incident-report hierarchy missing");
const hierarchyContext = {};
vm.runInNewContext(
  `${flashcardHtml.slice(incidentPrefixStart, incidentPrefixEnd)}\n` +
    "globalThis.result = { prefix: hkfsdIncidentReportsPrefix, decks: hkfsdIncidentReportDecks };",
  hierarchyContext,
  { filename: "flashcards.html#hkfsdIncidentReportDecks", timeout: 30_000 }
);
const flashcardPlaceholders = hierarchyContext.result.decks;
assert.equal(hierarchyContext.result.prefix, "government/hkfsd/incident-reports");
assert.equal(flashcardPlaceholders.length, 10, "Flashcard hierarchy must show Incident Report 1-10");
assert.deepEqual(
  Array.from(flashcardPlaceholders, item => item.deckId),
  Array.from({ length: 10 }, (_, index) => `government/hkfsd/incident-reports/incident-report-${index + 1}`)
);
assert.deepEqual(
  Array.from(flashcardPlaceholders, item => item.deckId).filter(id => Array.isArray(seed[id])),
  [deckId],
  "Only Incident Report 3 should be unlocked"
);
assert.match(flashcardHtml, /flashcards-hkfsd-incident-reports-data\.js\?v=/, "Incident Report seed is not loaded");
assert.ok(flashcardHtml.includes('route: "government-hkfsd-incident-reports"'), "HKFSD Incident Reports category route missing");
assert.ok(flashcardHtml.includes('route === "government-hkfsd-incident-reports"'), "HKFSD Incident Reports route handler missing");

// Flashcard Kokoro audio mappings and physical MP3s.
const flashcardAudioWindow = loadWindowScript(flashcardAudioManifestPath);
const flashcardAudio = flashcardAudioWindow.EDMUND_FLASHCARD_AUDIO || {};
const flashcardAudioMeta = flashcardAudioWindow.EDMUND_FLASHCARD_AUDIO_META || {};
for (const [index, card] of cards.entries()) {
  const audioPath = flashcardAudio[normalizeCardText(card.front)];
  assert.ok(audioPath, `Flashcard ${index + 1}: missing Kokoro audio mapping for ${card.front}`);
  if (!String(audioPath).startsWith("https://")) {
    const localPath = path.join(root, audioPath);
    assert.ok(fs.existsSync(localPath), `Flashcard ${index + 1}: mapped MP3 is missing`);
    assert.ok(fs.statSync(localPath).size > 1000, `Flashcard ${index + 1}: mapped MP3 is implausibly small`);
  }
}
assert.equal(flashcardAudioMeta.complete, true, "Flashcard audio manifest must be complete");
assert.equal(flashcardAudioMeta.engine, "Kokoro-82M", "Flashcard narration must use Kokoro");
assert.equal(flashcardAudioMeta.voice, "af_heart", "Flashcard narration must use the established voice");
const flashcardAudioGenerator = fs.readFileSync(flashcardAudioGeneratorPath, "utf8");
assert.ok(flashcardAudioGenerator.includes(`"${flashcardDataFile}"`), "Flashcard audio generator ignores Incident Report 3");
assert.ok(
  flashcardAudioGenerator.includes('"window.EDMUND_HKFSD_INCIDENT_REPORTS_SEED = "'),
  "Flashcard audio generator is missing the Incident Reports assignment"
);

// Writing-practice source fidelity and all 16 fill configurations.
const writingWindow = loadWindowScript(writingDataPath);
const exercises = writingWindow.EDMUND_HKFSD_INCIDENT_REPORT_EXERCISES;
assert.ok(exercises && typeof exercises === "object", "Missing HKFSD Incident Report writing export");
assert.deepEqual(Object.keys(exercises), [exerciseId], "Only Incident Report 3 may be live in writing practice");
const exercise = exercises[exerciseId];
assert.equal(exercise.id, exerciseId);
assert.equal(exercise.title, "Incident Report 3");
assert.equal(exercise.exam, "HKFSD");
assert.equal(exercise.taskType, "事故報告 Incident Report");
assert.equal(exercise.sourceFile, writingSourceFile, "Writing source filename changed");
assert.equal(exercise.sourcePageCount, 15, "Writing source must retain all 15 pages of provenance");
assert.deepEqual(Array.from(exercise.questionPrompt || []), [], "Do not invent a task prompt absent from the PDF");
assert.deepEqual(Array.from(exercise.essayLeadLines || []), [], "Do not invent lead lines absent from the PDF");
assert.deepEqual(Array.from(exercise.essayClosingLines || []), [], "Do not invent closing lines absent from the PDF");
assert.equal(Object.hasOwn(exercise, "translation"), false, "Do not invent a Chinese translation absent from the PDF");
assert.equal(Object.hasOwn(exercise, "translationSections"), false, "Do not invent bilingual sections absent from the PDF");
assert.equal(Object.hasOwn(exercise, "question"), false, "Do not invent a question absent from the PDF");
assert.equal(exercise.showWordBank, false, "Incident Report 3 must not expose an invented word bank");

assert.equal(exercise.paragraphs.length, 5, "Canonical incident report must contain five paragraphs");
assert.deepEqual(Array.from(exercise.paragraphs, paragraph => paragraph.sentences.length), [2, 5, 5, 4, 3]);
const canonicalParagraphs = exercise.paragraphs.map(paragraphText);
const canonicalText = canonicalParagraphs.join("\n\n");
assert.equal(sha256(canonicalText), expectedWritingTextSha256, "Canonical incident report drifted from the audited source");
assert.deepEqual(Array.from(exercise.practiceModes), expectedModes, "Writing practice must retain all four cue modes");
assert.deepEqual(Object.keys(exercise.practiceModeDetails || {}), expectedModes, "Cue-mode metadata is incomplete");
assert.equal(exercise.practiceDifficultySets.length, 4, "Writing practice must retain four difficulty tiers");
assert.equal(
  exercise.practiceModes.length * exercise.practiceDifficultySets.length,
  16,
  "Four cue modes x four difficulty tiers must yield 16 fill-in-the-blank modes"
);

let distinctAnswerCount = 0;
for (const [index, difficulty] of exercise.practiceDifficultySets.entries()) {
  const [expectedKey, expectedCount, expectedSourceExercises, expectedAnswerSha] = expectedDifficulty[index];
  const label = `${exerciseId}/${expectedKey}`;
  assert.equal(difficulty.key, expectedKey, `${label}: difficulty order changed`);
  assert.equal(difficulty.answers.length, expectedCount, `${label}: source blank count changed`);
  assert.deepEqual(Array.from(difficulty.sourceExerciseNumbers), expectedSourceExercises, `${label}: source exercise group changed`);
  assert.equal(sha256(JSON.stringify(difficulty.answers)), expectedAnswerSha, `${label}: audited answer sequence drifted`);
  assert.ok(
    difficulty.answers.every(answer => typeof answer === "string" && answer.length > 0 && answer.trim() === answer),
    `${label}: answers must be non-empty, trimmed strings`
  );

  let reconstructed = reconstruct(exercise, difficulty.answers);
  if (reconstructed.answerState.index !== difficulty.answers.length) {
    reconstructed = reconstruct(exercise, difficulty.answers, true);
  }
  assert.equal(
    reconstructed.answerState.index,
    difficulty.answers.length,
    `${label}: every source blank must align using the production fallback`
  );
  assert.deepEqual(
    reconstructed.paragraphs.map(paragraphText),
    canonicalParagraphs,
    `${label}: filling every answer must exactly reconstruct the canonical report`
  );
  distinctAnswerCount += difficulty.answers.length;
}
assert.equal(distinctAnswerCount, 220, "The source defines exactly 220 answer segments across four difficulty tiers");
assert.equal(distinctAnswerCount * expectedModes.length, 880, "The UI must render 880 blank instances across all cue modes");

// Writing hierarchy: ten visible placeholders, only Incident Report 3 live.
const writingHtml = fs.readFileSync(writingHtmlPath, "utf8");
const writingPathways = evaluateDeclaration(writingHtml, "writingPathways", "const dseWritingYears");
const hkfsdDepartment = writingPathways["government-writing"].departments.find(item => item.key === "hkfsd");
assert.ok(hkfsdDepartment, "HKFSD writing-practice department missing");
const incidentCategory = hkfsdDepartment.categories.find(item => item.key === "incident-reports");
assert.ok(incidentCategory, "HKFSD Incident Reports writing category missing");
assert.equal(incidentCategory.items.length, 10, "Writing hierarchy must show Incident Report 1-10");
assert.deepEqual(
  Array.from(incidentCategory.items, item => item.label),
  Array.from({ length: 10 }, (_, index) => `Incident Report ${index + 1}`)
);
assert.deepEqual(
  Array.from(incidentCategory.items, item => item.exerciseId).filter(Boolean),
  [exerciseId],
  "Only Incident Report 3 should be live in writing practice"
);
assert.match(writingHtml, /writing-practice-hkfsd-incident-report-data\.js\?v=/, "Writing data file is not loaded");
assert.ok(
  writingHtml.includes("window.EDMUND_HKFSD_INCIDENT_REPORT_EXERCISES"),
  "Incident Report 3 is not merged into the writing exercise registry"
);

// Writing Kokoro recording, exact narration text, word timing rows and MP3.
const writingAudioWindow = loadWindowScript(writingAudioManifestPath);
const writingAudio = writingAudioWindow.EDMUND_WRITING_AUDIO || {};
const writingAudioMeta = writingAudioWindow.EDMUND_WRITING_AUDIO_META || {};
const writingAudioEntry = writingAudio[exerciseId];
assert.ok(writingAudioEntry, "Incident Report 3 writing-practice Kokoro recording is missing");
assert.equal(writingAudioEntry.sourceSha256, expectedWritingTextSha256, "Writing audio narrates stale or different text");
const expectedWords = Array.from(canonicalText.match(wordPattern) || []);
assert.equal(expectedWords.length, 326, "Canonical narration word inventory changed");
assert.equal(writingAudioEntry.wordCount, 326, "Writing audio word count must match the 326-word report");
assert.deepEqual(
  Array.from(writingAudioEntry.words || [], row => row[0]),
  expectedWords,
  "Writing audio timing words must exactly follow the report"
);
assert.ok(Number(writingAudioEntry.duration) > 0, "Writing audio duration is invalid");
assert.ok(String(writingAudioEntry.path || "").endsWith(".mp3"), "Writing audio path must be an MP3");
const writingAudioPath = path.join(root, writingAudioEntry.path);
assert.ok(fs.existsSync(writingAudioPath), "Writing-practice Kokoro MP3 is missing");
assert.ok(fs.statSync(writingAudioPath).size > 10_000, "Writing-practice Kokoro MP3 is implausibly small");
assert.equal(writingAudioMeta.complete, true, "Writing audio manifest must be complete");
assert.equal(writingAudioMeta.engine, "Kokoro-82M", "Writing narration must use Kokoro");
assert.equal(writingAudioMeta.voice, "af_heart", "Writing narration must use the established voice");
assert.match(writingHtml, /writing-audio-manifest\.js\?v=/, "Writing audio manifest is not loaded");

// Homework is optional for this request, but if the catalog exposes the deck,
// its label and deep link must be exact. The generator mapping is always pinned.
const homeworkGenerator = fs.readFileSync(homeworkGeneratorPath, "utf8");
assert.ok(
  homeworkGenerator.includes(`["${deckId}", "HKFSD Incident Report 3 事故報告 3"]`),
  "Homework generator is missing the Incident Report 3 bilingual title"
);
let homeworkResources = [];
if (fs.existsSync(homeworkCatalogPath)) {
  const catalogUrl = `${pathToFileURL(homeworkCatalogPath).href}?hkfsd-ir3-test=${Date.now()}`;
  const { HOMEWORK_RESOURCE_CATALOG } = await import(catalogUrl);
  homeworkResources = HOMEWORK_RESOURCE_CATALOG.filter(resource => resource.id === `flash:${deckId}`);
  if (homeworkResources.length) {
    assert.equal(homeworkResources.length, 1, "Homework must not duplicate Incident Report 3");
    assert.equal(homeworkResources[0].label, "HKFSD Incident Report 3 事故報告 3");
    assert.equal(homeworkResources[0].url, `flashcards.html?deck=${encodeURIComponent(deckId)}`);
  }
}

console.log(JSON.stringify({
  flashcardDecks: 1,
  flashcards: cards.length,
  bilingualExamples: exampleCount,
  flashcardAudioMappings: cards.length,
  writingExercises: 1,
  writingParagraphs: canonicalParagraphs.length,
  writingWords: expectedWords.length,
  fillConfigurations: exercise.practiceModes.length * exercise.practiceDifficultySets.length,
  sourceAnswerSegments: distinctAnswerCount,
  placeholders: 10,
  livePlaceholder: 3,
  homeworkLinks: homeworkResources.length
}, null, 2));
