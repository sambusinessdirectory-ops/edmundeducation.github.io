import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "phrasal-verb-system-data.js");
const catalogPath = path.join(root, "workers/phrasal-verb-system/src/catalog.js");
const context = { window: {} };

vm.runInNewContext(fs.readFileSync(dataPath, "utf8"), context, { filename: dataPath });
const content = context.window.EDMUND_PHRASAL_VERB_SYSTEM_DATA;
if (content?.system !== "phrasal-verb" || !Array.isArray(content.lessons)) {
  throw new Error("Phrasal Verb lesson data is missing");
}

const catalog = {};
const lessonQuestionCounts = {};
for (const [lessonIndex, lesson] of content.lessons.entries()) {
  const expectedLessonId = `phrasal-verb-${String(lessonIndex + 1).padStart(2, "0")}`;
  if (lesson.id !== expectedLessonId || !Array.isArray(lesson.questions) || !lesson.questions.length) {
    throw new Error(`${expectedLessonId} is missing or malformed`);
  }
  lessonQuestionCounts[lesson.id] = lesson.questions.length;
  for (const [questionIndex, question] of lesson.questions.entries()) {
    const expectedQuestionId = `${lesson.id}-q${String(questionIndex + 1).padStart(2, "0")}`;
    if (question.id !== expectedQuestionId) throw new Error(`Invalid Phrasal Verb question ID: ${question.id || "(missing)"}`);
    const answers = [question.answer, ...(Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : [])]
      .map((answer) => String(answer || "").trim())
      .filter(Boolean);
    const uniqueAnswers = [...new Set(answers)];
    if (!uniqueAnswers.length) throw new Error(`${question.id} has no protected answer`);
    if (catalog[question.id]) throw new Error(`Duplicate question ID: ${question.id}`);
    catalog[question.id] = uniqueAnswers;
  }
}

if (Object.keys(catalog).length !== Number(content.questionCount)) {
  throw new Error(`Expected ${content.questionCount} protected answers, found ${Object.keys(catalog).length}`);
}

const output = `// Generated from the visually verified Phrasal Verb lesson PDFs.\n`
  + `// Run \`node tools/generate-phrasal-verb-catalog.mjs\` whenever lesson answers change.\n`
  + `// This protected catalogue is deployed only with the private Worker.\n`
  + `export const LESSON_QUESTION_COUNTS = Object.freeze(${JSON.stringify(lessonQuestionCounts, null, 2)});\n`
  + `export const ACCEPTED_ANSWERS = Object.freeze(${JSON.stringify(catalog, null, 2)});\n`;

fs.writeFileSync(catalogPath, output);
console.log(`Wrote ${Object.keys(catalog).length} protected answers across ${Object.keys(lessonQuestionCounts).length} lessons to ${path.relative(root, catalogPath)}`);
