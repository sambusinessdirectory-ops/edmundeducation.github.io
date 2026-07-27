import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDirectory, "..");
const sandbox = { window: {} };
vm.createContext(sandbox);

for (const file of ["ielts-task2-question-data.js", "essay-portal-links.js", "writing-progression-data.js"]) {
  const source = await readFile(path.join(root, file), "utf8");
  vm.runInContext(source, sandbox, { filename: file, timeout: 10_000 });
}

const rows = sandbox.window.EDMUND_WRITING_PROGRESSION;
const questions = sandbox.window.EDMUND_MODEL_ESSAY_QUESTION_DATA;
const portals = sandbox.window.EDMUND_ESSAY_PORTALS;
assert.equal(rows.length, 238);
assert.deepEqual([...rows].map((row) => row.number), Array.from({ length: 238 }, (_, index) => index + 1));

const keys = rows.map((row) => row.essayKey);
assert.equal(new Set(keys).size, 238, "every canonical essay must appear exactly once");
assert.deepEqual([...new Set(keys)].sort(), Object.keys(questions).sort());
const categoryCounts = keys.reduce((counts, key) => {
  const category = key.slice(0, key.lastIndexOf(":"));
  counts[category] = (counts[category] || 0) + 1;
  return counts;
}, {});
assert.deepEqual(categoryCounts, {
  opinion: 104,
  "discuss-both-views": 40,
  "cause-solution": 19,
  "advantage-disadvantage": 29,
  "direct-question": 46
});

assert.equal(rows[2].essayKey, "cause-solution:5", "the released-prisoners PDF typo must target canonical Q5");
assert.match(rows[2].topic, /released prisoners/i);
assert.equal(rows[47].essayKey, "cause-solution:7", "the gender-imbalance row remains canonical Q7");
assert.match(rows[47].topic, /Gender imbalance/i);
assert.equal(rows[170].essayKey, "discuss-both-views:20");
assert.equal(rows[237].essayKey, "discuss-both-views:41");

assert.equal(rows.filter((row) => portals.hasWritingPractice(row.essayKey)).length, 228);
assert.equal(rows.filter((row) => portals.hasFlashcards(row.essayKey)).length, 232);
assert.ok(rows.every((row) => portals.href("downloads", row.essayKey)));

const writingSource = await readFile(path.join(root, "writing-practice.html"), "utf8");
assert.match(writingSource, /writing-progression-data\.js\?v=/);
assert.match(writingSource, /全部 238 篇 IELTS Task 2 範文/);
assert.match(writingSource, /essayPortals\.hasWritingPractice\(essayKey\)/);
assert.match(writingSource, /essayPortals\.hasFlashcards\(essayKey\)/);
assert.match(writingSource, />Flash Cards<\/a>/);
assert.match(writingSource, />下載 PDF<\/a>/);
assert.doesNotMatch(
  writingSource.slice(writingSource.indexOf("function renderWritingProgressionView"), writingSource.indexOf("function renderExerciseView")),
  /內容準備中/
);

console.log("Writing progression checks passed: 238 ordered canonical essays, 228 Writing links, 232 Flashcard links.");
