import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "proverb-system-data.js");
const catalogPath = path.join(root, "workers", "proverb-system", "src", "catalog.js");
const context = { window: {} };

vm.runInNewContext(fs.readFileSync(dataPath, "utf8"), context, { filename: dataPath });
const content = context.window.EDMUND_PROVERB_SYSTEM_DATA;
if (!content || !Array.isArray(content.lessons)) throw new Error("Proverb lesson data is missing");

const catalog = {};
for (const lesson of content.lessons) {
  if (!Array.isArray(lesson.questions) || lesson.questions.length !== 50) {
    throw new Error(`${lesson.id || "Unknown lesson"} must contain exactly 50 questions`);
  }
  for (const question of lesson.questions) {
    if (!/^proverb-(?:0[1-3])-q(?:0[1-9]|[1-4][0-9]|50)$/.test(question.id || "")) {
      throw new Error(`Invalid Proverb question ID: ${question.id || "(missing)"}`);
    }
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

const output = `// Generated from the reviewed Proverb lesson PDFs.\n`
  + `// Run \`node tools/generate-proverb-catalog.mjs\` whenever lesson answers change.\n`
  + `// This protected catalogue is deployed only with the private Worker.\n`
  + `export const ACCEPTED_ANSWERS = Object.freeze(${JSON.stringify(catalog, null, 2)});\n`;

fs.writeFileSync(catalogPath, output);
console.log(`Wrote ${Object.keys(catalog).length} protected answers to ${path.relative(root, catalogPath)}`);
