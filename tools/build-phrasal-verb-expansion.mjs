import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "phrasal-verb-system-data.js");
const lessonDirectory = path.join(root, "tools/phrasal-verb-lessons");
const expectedLessonCount = 329;
const maximumQuestionsPerLesson = 999;

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function normalText(value) {
  return typeof value === "string" && value.trim() === value && value.length > 0;
}

function normalizeStudentNames(value) {
  if (typeof value === "string") return value.replace(/\bMia\b/g, "Tom").replaceAll("米婭", "湯姆");
  if (Array.isArray(value)) value.forEach((item, index) => { value[index] = normalizeStudentNames(item); });
  else if (value && typeof value === "object") Object.keys(value).forEach((key) => { value[key] = normalizeStudentNames(value[key]); });
  return value;
}

function readPublishedData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(dataPath, "utf8"), context, { filename: dataPath });
  const content = context.window.EDMUND_PHRASAL_VERB_SYSTEM_DATA;
  requireCondition(content?.system === "phrasal-verb", "Published Phrasal Verb data is missing");
  return JSON.parse(JSON.stringify(content));
}

function readLessonFragment(file) {
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  return normalizeStudentNames(parsed?.lesson || parsed);
}

function validateBilingualExamples(examples, location) {
  requireCondition(Array.isArray(examples), `${location} must be an array`);
  examples.forEach((example, index) => {
    const item = `${location}[${index}]`;
    requireCondition(example && typeof example === "object" && !Array.isArray(example), `${item} must be an object`);
    requireCondition(normalText(example.en), `${item}.en is missing`);
    requireCondition(normalText(example.zh), `${item}.zh is missing`);
    if (example.highlight !== undefined) {
      requireCondition(normalText(example.highlight), `${item}.highlight is invalid`);
      requireCondition(example.en.toLocaleLowerCase().includes(example.highlight.toLocaleLowerCase()), `${item}.highlight is not in the English example`);
    }
  });
}

function validateLesson(lesson, expectedOrder) {
  const prefix = `phrasal-verb-${String(expectedOrder).padStart(2, "0")}`;
  requireCondition(lesson && typeof lesson === "object" && !Array.isArray(lesson), `${prefix} must be an object`);
  requireCondition(lesson.id === prefix, `${prefix}: lesson.id is invalid`);
  requireCondition(Number(lesson.order) === expectedOrder, `${prefix}: lesson.order is invalid`);
  requireCondition(normalText(lesson.slug), `${prefix}: slug is missing`);
  requireCondition(String(lesson.version) === "1", `${prefix}: version must be 1`);
  requireCondition(normalText(lesson.title) && normalText(lesson.titleEn) && normalText(lesson.titleZh), `${prefix}: titles are incomplete`);
  requireCondition(!("image" in lesson) && !("illustration" in lesson), `${prefix}: no lesson image is permitted`);
  requireCondition(lesson.source && normalText(lesson.source.file), `${prefix}: source.file is missing`);
  requireCondition(Number.isInteger(lesson.source.pageCount) && lesson.source.pageCount > 0, `${prefix}: source.pageCount is invalid`);
  requireCondition(Array.isArray(lesson.source.exercisePdfPages) && lesson.source.exercisePdfPages.length > 0, `${prefix}: exercisePdfPages is missing`);
  requireCondition(Array.isArray(lesson.source.answerKeyPdfPages) && lesson.source.answerKeyPdfPages.length > 0, `${prefix}: answerKeyPdfPages is missing`);
  const exercisePages = new Set(lesson.source.exercisePdfPages);
  const answerKeyPages = new Set(lesson.source.answerKeyPdfPages);
  requireCondition(lesson.learningObjective && normalText(lesson.learningObjective.zh) && normalText(lesson.learningObjective.en), `${prefix}: learning objective is incomplete`);
  requireCondition(Array.isArray(lesson.formulas) && lesson.formulas.length > 0, `${prefix}: formulas are missing`);
  requireCondition(Array.isArray(lesson.meaningGroups) && lesson.meaningGroups.length > 0, `${prefix}: meaning groups are missing`);
  requireCondition(Number(lesson.groupCount) === lesson.meaningGroups.length, `${prefix}: groupCount does not match meaningGroups`);
  requireCondition(Array.isArray(lesson.specificForms) && lesson.specificForms.length === lesson.meaningGroups.length, `${prefix}: specificForms do not match meaningGroups`);
  requireCondition(Array.isArray(lesson.benefits) && lesson.benefits.length > 0, `${prefix}: benefits are missing`);
  requireCondition(Array.isArray(lesson.rules) && lesson.rules.length > 0, `${prefix}: rules are missing`);
  requireCondition(lesson.meaning && normalText(lesson.meaning.zh) && normalText(lesson.meaning.en), `${prefix}: meaning is incomplete`);
  requireCondition(lesson.register && normalText(lesson.register.summaryZh) && normalText(lesson.register.summaryEn), `${prefix}: register summary is incomplete`);
  for (const key of ["fixed", "fixedZh", "fixedEn", "correct", "variableZh", "variableEn"]) {
    requireCondition(normalText(lesson.fixedVariable?.[key]), `${prefix}: fixedVariable.${key} is missing`);
  }
  requireCondition(Array.isArray(lesson.fixedVariable?.forms) && lesson.fixedVariable.forms.length === lesson.meaningGroups.length, `${prefix}: fixedVariable.forms do not match meaningGroups`);
  requireCondition(Array.isArray(lesson.usageGuide?.comparisons) && lesson.usageGuide.comparisons.length > 0, `${prefix}: usage comparisons are missing`);
  lesson.usageGuide.comparisons.forEach((item, index) => {
    for (const key of ["titleZh", "titleEn", "zh", "en"]) {
      requireCondition(normalText(item?.[key]), `${prefix}.usageGuide.comparisons[${index}].${key} is missing`);
    }
  });
  for (const [sectionName, items] of [["benefits", lesson.benefits], ["rules", lesson.rules]]) {
    items.forEach((item, index) => {
      for (const key of ["titleZh", "titleEn", "zh", "en"]) {
        requireCondition(normalText(item?.[key]), `${prefix}.${sectionName}[${index}].${key} is missing`);
      }
    });
  }
  requireCondition(lesson.instructions && normalText(lesson.instructions.zh) && normalText(lesson.instructions.en), `${prefix}: instructions are incomplete`);
  requireCondition(Array.isArray(lesson.questions) && lesson.questions.length > 0 && lesson.questions.length <= maximumQuestionsPerLesson, `${prefix}: questions are missing or exceed the supported limit`);

  validateBilingualExamples(lesson.examples || [], `${prefix}.examples`);
  lesson.meaningGroups.forEach((group, index) => {
    const location = `${prefix}.meaningGroups[${index}]`;
    requireCondition(Number(group.number) === index + 1, `${location}.number is invalid`);
    requireCondition(normalText(group.formula) && normalText(group.titleZh) && normalText(group.titleEn), `${location} is incomplete`);
    validateBilingualExamples(group.examples || [], `${location}.examples`);
  });

  lesson.questions.forEach((question, index) => {
    const number = index + 1;
    const expectedId = `${prefix}-q${String(number).padStart(2, "0")}`;
    requireCondition(question?.id === expectedId, `${expectedId}: question.id is invalid`);
    requireCondition(Number(question.number) === number, `${expectedId}: question.number is invalid`);
    for (const key of ["prompt", "promptZh", "starter", "answer", "answerZh", "highlight", "targetForm", "targetMeaningZh"]) {
      requireCondition(normalText(question[key]), `${expectedId}: ${key} is missing`);
    }
    requireCondition(question.answer.toLocaleLowerCase().includes(question.highlight.toLocaleLowerCase()), `${expectedId}: highlight is not in answer`);
    for (const key of ["sourcePage", "answerSourcePage"]) {
      requireCondition(Number.isInteger(question[key]) && question[key] >= 1 && question[key] <= lesson.source.pageCount, `${expectedId}: ${key} is outside the PDF`);
    }
    requireCondition(exercisePages.has(question.sourcePage), `${expectedId}: sourcePage is outside the Exercise range`);
    requireCondition(answerKeyPages.has(question.answerSourcePage), `${expectedId}: answerSourcePage is outside the Answer Key range`);
    if (question.promptZhSourcePage !== undefined) {
      requireCondition(Number.isInteger(question.promptZhSourcePage) && exercisePages.has(question.promptZhSourcePage), `${expectedId}: promptZhSourcePage is outside the Exercise range`);
    }
    if (question.answerZhSourcePage !== undefined) {
      requireCondition(Number.isInteger(question.answerZhSourcePage) && answerKeyPages.has(question.answerZhSourcePage), `${expectedId}: answerZhSourcePage is outside the Answer Key range`);
    }
    if (question.acceptedAnswers !== undefined) {
      requireCondition(Array.isArray(question.acceptedAnswers) && question.acceptedAnswers.length > 0, `${expectedId}: acceptedAnswers is invalid`);
      const canonical = question.answer.trim().toLocaleLowerCase();
      const seen = new Set();
      question.acceptedAnswers.forEach((answer) => {
        requireCondition(normalText(answer), `${expectedId}: acceptedAnswers contains an empty value`);
        const normalized = answer.toLocaleLowerCase();
        requireCondition(normalized !== canonical && !seen.has(normalized), `${expectedId}: acceptedAnswers contains a duplicate`);
        seen.add(normalized);
      });
    }
  });
}

const published = readPublishedData();
const existingFirstLesson = normalizeStudentNames(published.lessons?.find((lesson) => lesson.id === "phrasal-verb-01"));
requireCondition(existingFirstLesson, "The existing Build lesson is missing");

const fragments = fs.existsSync(lessonDirectory)
  ? fs.readdirSync(lessonDirectory)
    .filter((name) => /^lesson-\d{2,3}(?:-[a-z0-9-]+)?\.json$/.test(name))
    .sort()
    .map((name) => readLessonFragment(path.join(lessonDirectory, name)))
  : [];

const lessons = [existingFirstLesson, ...fragments]
  .sort((left, right) => Number(left.order) - Number(right.order));
requireCondition(lessons.length === expectedLessonCount, `Expected ${expectedLessonCount} lessons, found ${lessons.length}`);
requireCondition(new Set(lessons.map(({ id }) => id)).size === expectedLessonCount, "Duplicate Phrasal Verb lesson IDs found");
lessons.forEach((lesson, index) => validateLesson(lesson, index + 1));

const content = {
  version: "1",
  system: "phrasal-verb",
  lessonCount: lessons.length,
  questionCount: lessons.reduce((total, lesson) => total + lesson.questions.length, 0),
  lessons
};
const serialized = JSON.stringify(content, null, 2);
requireCondition(!/\/Users\/|[A-Z]:\\/.test(serialized), "Generated public data contains a local path");
const output = `/* Generated from the fully rendered and reviewed lesson sources. Do not edit answers by hand. */\n(function definePhrasalVerbSystemData() {\n  const data = ${serialized.replaceAll("\n", "\n  ")};\n  function normalizeStudentNames(value) {\n    if (typeof value === "string") return value.replace(/\\bMia\\b/g, "Tom").replaceAll("米婭", "湯姆");\n    if (Array.isArray(value)) value.forEach((item, index) => { value[index] = normalizeStudentNames(item); });\n    else if (value && typeof value === "object") Object.keys(value).forEach((key) => { value[key] = normalizeStudentNames(value[key]); });\n    return value;\n  }\n  normalizeStudentNames(data);\n  Object.freeze(data.lessons);\n  window.EDMUND_PHRASAL_VERB_SYSTEM_DATA = Object.freeze(data);\n}());\n`;
fs.writeFileSync(dataPath, output);
console.log(`Wrote ${content.lessonCount} lessons and ${content.questionCount} questions to ${path.relative(root, dataPath)}`);
