import { ACCEPTED_ANSWERS } from "../src/catalog.js";

const expectedIds = Array.from(
  { length: 50 },
  (_, index) => `proverb-01-q${String(index + 1).padStart(2, "0")}`
);
const actualIds = Object.keys(ACCEPTED_ANSWERS);
const failures = [];

if (actualIds.length !== expectedIds.length) {
  failures.push(`expected 50 question entries, found ${actualIds.length}`);
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
  console.error("Proverb answer catalogue is not production-ready:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Proverb answer catalogue verified: 50 protected questions ready.");
}
