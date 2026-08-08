import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "idiom-system-data.js");
const fragmentDirectory = path.join(root, "tools", "idiom-lessons");
const manifestPath = path.join(root, "tools", "idiom-import-manifest.json");
const rejectedCopy = /The expression does not simply mean|The Original Image|原來的畫面|Communicative Function|溝通功能/i;
const localPath = /\/Users\/|[A-Z]:\\/;
const cjk = /[\u3400-\u9fff]/;
const outerBrackets = /^(?:\[[\s\S]*\]|［[\s\S]*］|【[\s\S]*】|\([\s\S]*\)|（[\s\S]*）)$/;

function loadPublicData() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(dataPath, "utf8"), context, { filename: dataPath });
  return context.window.EDMUND_IDIOM_SYSTEM_DATA;
}

function validateImportedLesson(lesson, order, manifestRow) {
  const expectedId = `idiom-${String(order).padStart(2, "0")}`;
  assert.equal(lesson.id, expectedId, `lesson ${order} ID`);
  assert.equal(lesson.order, order, `lesson ${order} order`);
  assert.equal(lesson.version, "1", `${expectedId} version`);
  assert.ok(lesson.titleZh && cjk.test(lesson.titleZh), `${expectedId} needs a Chinese title`);
  assert.ok(lesson.titleZh.length <= 24, `${expectedId} titleZh must remain a concise card label`);
  assert.doesNotMatch(lesson.titleZh, /按原檔示範答案|[:：]|[，。；;,;]$/u, `${expectedId} titleZh must not be a generic sentence fragment`);
  assert.ok(Array.isArray(lesson.questions) && lesson.questions.length === 50, `${expectedId} needs 50 questions`);
  assert.equal(manifestRow.lessonId, expectedId, `${expectedId} manifest ID`);
  assert.equal(manifestRow.questionCount, 50, `${expectedId} manifest question count`);
  assert.equal(manifestRow.physicalPageMatchCount, 100, `${expectedId} physical page matches`);
  assert.equal(manifestRow.sha256.length, 64, `${expectedId} manifest SHA-256`);
  assert.deepEqual(manifestRow.highlightModes, { expression: 50 }, `${expectedId} highlights`);

  const source = lesson.source || {};
  for (const key of ["contentPdfPages", "exercisePdfPages", "answerKeyPdfPages"]) {
    assert.ok(Array.isArray(source[key]), `${expectedId} source.${key}`);
  }
  if (order === 72) assert.equal(source.contentPdfPages.length, 0, "lesson 72 has no supplied teaching pages");
  else assert.ok(source.contentPdfPages.length > 0, `${expectedId} needs teaching-page provenance`);
  assert.ok(source.exercisePdfPages.length > 0, `${expectedId} needs exercise-page provenance`);
  assert.ok(source.answerKeyPdfPages.length > 0, `${expectedId} needs answer-page provenance`);

  const ids = lesson.questions.map((question, index) => {
    const expectedQuestionId = `${expectedId}-q${String(index + 1).padStart(2, "0")}`;
    assert.equal(question.id, expectedQuestionId, `${expectedId} canonical question order`);
    assert.ok(question.answer.toLocaleLowerCase().includes(question.highlight.toLocaleLowerCase()), `${question.id} exact highlight`);
    assert.equal(question.sourcePages?.[0], question.sourcePage, `${question.id} prompt physical page`);
    assert.equal(question.answerSourcePages?.[0], question.answerSourcePage, `${question.id} answer physical page`);
    assert.ok(question.sourcePages.every((page) => source.exercisePdfPages.includes(page)), `${question.id} prompt page range`);
    assert.ok(question.answerSourcePages.every((page) => source.answerKeyPdfPages.includes(page)), `${question.id} answer page range`);
    assert.ok(question.promptZh && !outerBrackets.test(question.promptZh), `${question.id} promptZh wrapper`);
    assert.ok(question.answerZh && !outerBrackets.test(question.answerZh), `${question.id} answerZh wrapper`);
    return question.id;
  });
  assert.equal(new Set(ids).size, 50, `${expectedId} unique question IDs`);

  assert.ok(Array.isArray(lesson.examples) && lesson.examples.length > 0, `${expectedId} bilingual model examples`);
  const inspectExamples = (value, label = expectedId) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => inspectExamples(item, `${label}[${index}]`));
      return;
    }
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value.examples)) {
      value.examples.forEach((example, index) => {
        assert.ok(example.en, `${label}.examples[${index}] English`);
        assert.ok(example.zh && cjk.test(example.zh), `${label}.examples[${index}] Chinese`);
        assert.ok(!outerBrackets.test(example.zh), `${label}.examples[${index}] wrapper`);
      });
    }
    Object.entries(value).forEach(([key, item]) => inspectExamples(item, `${label}.${key}`));
  };
  inspectExamples(lesson);

  const serialized = JSON.stringify(lesson);
  assert.doesNotMatch(serialized, rejectedCopy, `${expectedId} excluded owner-rejected copy`);
  assert.doesNotMatch(serialized, localPath, `${expectedId} local path leak`);
  assert.doesNotMatch(serialized, /\bMia\b|米婭/, `${expectedId} student-name normalization`);
}

const current = loadPublicData();
assert.ok(current?.system === "idiom", "Existing Idiom public data is missing");
const originalLessons = current.lessons.filter((lesson) => lesson.order <= 25);
assert.equal(originalLessons.length, 25, "The reviewed lessons 01-25 must remain intact");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
assert.equal(manifest.fileCount, 113, "Idiom import manifest file count");
assert.equal(manifest.questionCount, 5650, "Idiom import manifest question count");
assert.deepEqual(manifest.sources.map(({ order }) => order), Array.from({ length: 113 }, (_, index) => index + 26));
const manifestByOrder = new Map(manifest.sources.map((row) => [row.order, row]));

const fragmentFiles = fs.readdirSync(fragmentDirectory)
  .filter((name) => /^lesson-\d{3}-.*\.json$/.test(name))
  .sort();
assert.equal(fragmentFiles.length, 113, "Expected exactly 113 Idiom fragments");

const importedLessons = fragmentFiles.map((filename, index) => {
  const order = index + 26;
  assert.match(filename, new RegExp(`^lesson-${String(order).padStart(3, "0")}-`));
  const fragment = JSON.parse(fs.readFileSync(path.join(fragmentDirectory, filename), "utf8"));
  validateImportedLesson(fragment.lesson, order, manifestByOrder.get(order));
  return fragment.lesson;
});

const lessons = [...originalLessons, ...importedLessons];
assert.deepEqual(lessons.map(({ order }) => order), Array.from({ length: 138 }, (_, index) => index + 1));
assert.equal(new Set(lessons.map(({ id }) => id)).size, 138, "Lesson IDs must be unique");
assert.equal(lessons.reduce((total, lesson) => total + lesson.questions.length, 0), 6900);

const data = {
  ...current,
  lessonCount: 138,
  questionCount: 6900,
  lessons
};
const output = `/* Generated from the visually reviewed lesson PDFs. Do not edit answers by hand. */\n`
  + `(function defineIdiomSystemData() {\n`
  + `  const data = ${JSON.stringify(data, null, 2)};\n`
  + `  function normalizeStudentNames(value) {\n`
  + `    if (typeof value === "string") return value.replace(/\\bMia\\b/g, "Tom").replaceAll("米婭", "湯姆");\n`
  + `    if (Array.isArray(value)) value.forEach((item, index) => { value[index] = normalizeStudentNames(item); });\n`
  + `    else if (value && typeof value === "object") Object.keys(value).forEach((key) => { value[key] = normalizeStudentNames(value[key]); });\n`
  + `    return value;\n`
  + `  }\n`
  + `  normalizeStudentNames(data);\n`
  + `  window.EDMUND_IDIOM_SYSTEM_DATA = Object.freeze(data);\n`
  + `})();\n`;

fs.writeFileSync(dataPath, output);
console.log(`Wrote ${data.lessonCount} Idiom lessons and ${data.questionCount} questions to ${path.relative(root, dataPath)}`);
