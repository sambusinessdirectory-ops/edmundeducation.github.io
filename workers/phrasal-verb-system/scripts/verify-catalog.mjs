import { ACCEPTED_ANSWERS, LESSON_QUESTION_COUNTS } from "../src/catalog.js";

const expectedLessonIds = Array.from(
  { length: Object.keys(LESSON_QUESTION_COUNTS).length },
  (_, index) => `phrasal-verb-${String(index + 1).padStart(2, "0")}`
);
const expectedIds = expectedLessonIds.flatMap((lessonId) => Array.from(
  { length: LESSON_QUESTION_COUNTS[lessonId] || 0 },
  (_, index) => `${lessonId}-q${String(index + 1).padStart(2, "0")}`
));
const actualIds = Object.keys(ACCEPTED_ANSWERS);
const failures = [];

if (!expectedLessonIds.every((lessonId) => Number.isInteger(LESSON_QUESTION_COUNTS[lessonId]) && LESSON_QUESTION_COUNTS[lessonId] >= 1 && LESSON_QUESTION_COUNTS[lessonId] <= 99)) {
  failures.push("lesson question-count metadata is incomplete or invalid");
}
if (actualIds.length !== expectedIds.length) {
  failures.push(`expected ${expectedIds.length} question entries, found ${actualIds.length}`);
}

if (actualIds.length) {
  for (const questionId of expectedIds) {
    const answers = ACCEPTED_ANSWERS[questionId];
    if (!Array.isArray(answers) || answers.length < 1) {
      failures.push(`${questionId} has no canonical answer array`);
      continue;
    }
    for (const answer of answers) {
      if (
        typeof answer !== "string"
        || answer.trim() !== answer
        || answer.length < 1
        || answer.length > 1000
        || /[\u0000-\u001f\u007f]/.test(answer)
        || /canonical answer|placeholder|todo/i.test(answer)
      ) {
        failures.push(`${questionId} contains an invalid or placeholder answer`);
        break;
      }
    }
  }
}

const expectedSet = new Set(expectedIds);
for (const questionId of actualIds) {
  if (!expectedSet.has(questionId)) failures.push(`unexpected question ID: ${questionId}`);
}

if (failures.length) {
  console.error("Phrasal Verb answer catalogue is not production-ready:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Phrasal Verb answer catalogue verified: ${actualIds.length} protected questions across ${expectedLessonIds.length} lessons ready.`);
}
