import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lessonDir = path.join(root, "tools", "proverb-lessons");
const dataPath = path.join(root, "proverb-system-data.js");

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

const fragmentPaths = fs.readdirSync(lessonDir)
  .filter((name) => /^lesson-\d{2}-.+\.json$/.test(name))
  .sort((left, right) => left.localeCompare(right, "en", { numeric: true }))
  .map((name) => path.join(lessonDir, name));

const lessons = fragmentPaths.map((fragmentPath) => JSON.parse(fs.readFileSync(fragmentPath, "utf8")));
requireCondition(lessons.length === 3, `Expected 3 Proverb lesson fragments, found ${lessons.length}`);
requireCondition(new Set(lessons.map(({ id }) => id)).size === lessons.length, "Duplicate Proverb lesson ID");

lessons.sort((left, right) => Number(left.order) - Number(right.order));
lessons.forEach((lesson, lessonIndex) => {
  const expectedOrder = lessonIndex + 1;
  const expectedId = `proverb-${String(expectedOrder).padStart(2, "0")}`;
  requireCondition(lesson.order === expectedOrder, `${lesson.id}: expected order ${expectedOrder}`);
  requireCondition(lesson.id === expectedId, `${lesson.id}: expected ID ${expectedId}`);
  requireCondition(Array.isArray(lesson.questions) && lesson.questions.length === 50, `${lesson.id}: expected 50 questions`);
  requireCondition(Array.isArray(lesson.specificForms) && lesson.specificForms.length >= 6, `${lesson.id}: expected at least 6 formula frames`);
  requireCondition(Array.isArray(lesson.benefits) && lesson.benefits.length >= 5, `${lesson.id}: expected at least 5 benefits`);
  requireCondition(Array.isArray(lesson.rules) && lesson.rules.length >= 8, `${lesson.id}: expected at least 8 rules`);
  requireCondition(!lesson.origin?.history?.some(({ titleEn }) => titleEn === "The Original Image"), `${lesson.id}: Original Image must be omitted`);
  lesson.questions.forEach((question, questionIndex) => {
    const expectedQuestionId = `${lesson.id}-q${String(questionIndex + 1).padStart(2, "0")}`;
    requireCondition(question.id === expectedQuestionId, `${lesson.id}: expected ${expectedQuestionId}, found ${question.id}`);
    requireCondition(String(question.answer || "").toLocaleLowerCase().includes(String(question.highlight || "").toLocaleLowerCase()), `${question.id}: answer does not contain target highlight`);
  });
});

const content = {
  version: "1",
  system: "proverb",
  lessonCount: lessons.length,
  questionCount: lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0),
  lessons
};

const output = `/* Generated from reviewed Proverb lesson fragments. Do not edit answers by hand. */\n`
  + `(function defineProverbSystemData() {\n`
  + `  const data = ${JSON.stringify(content, null, 2)};\n\n`
  + `  window.EDMUND_PROVERB_SYSTEM_DATA = Object.freeze(data);\n`
  + `})();\n`;

fs.writeFileSync(dataPath, output);
console.log(`Wrote ${content.lessonCount} Proverb lessons and ${content.questionCount} questions to ${path.relative(root, dataPath)}`);
