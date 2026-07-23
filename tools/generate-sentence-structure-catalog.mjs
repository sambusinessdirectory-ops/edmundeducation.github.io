#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const expansionUrl = new URL("sentence-structure-lessons-5-70.js", root);
const dataUrl = new URL("sentence-structure-data.js", root);
const catalogUrl = new URL("workers/sentence-structure/src/catalog.js", root);
const [expansionSource, source] = await Promise.all([
  readFile(expansionUrl, "utf8"),
  readFile(dataUrl, "utf8")
]);
const sandbox = { window: {} };

vm.createContext(sandbox);
vm.runInContext(expansionSource, sandbox, { filename: "sentence-structure-lessons-5-70.js" });
vm.runInContext(source, sandbox, { filename: "sentence-structure-data.js" });

const lessons = sandbox.window.EDMUND_SENTENCE_STRUCTURE_DATA?.lessons;
if (!Array.isArray(lessons) || !lessons.length) {
  throw new Error("Sentence Structure lesson data is missing.");
}

const catalog = {};
for (const lesson of lessons) {
  for (const question of lesson.questions || []) {
    if (!question.id || !question.answer || catalog[question.id]) {
      throw new Error(`Invalid or duplicate question catalog entry: ${question.id || "missing-id"}`);
    }
    catalog[question.id] = [question.answer, ...(question.acceptedAnswers || [])];
  }
}

const output = `// Generated from the published Sentence Structure lesson data by tools/generate-sentence-structure-catalog.mjs.\n`
  + `// Run the generator whenever published lesson answers change.\n`
  + `export const ACCEPTED_ANSWERS = Object.freeze(${JSON.stringify(catalog, null, 2)});\n`;

await writeFile(catalogUrl, output, "utf8");
console.log(`Generated ${Object.keys(catalog).length} accepted-answer entries.`);
