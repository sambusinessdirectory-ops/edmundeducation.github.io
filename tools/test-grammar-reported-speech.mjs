import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = name => fs.readFile(new URL(name, root), "utf8");
const [source, generated, sourceMapText, html, guideRuntime, practiceRuntime, propagation] = await Promise.all([
  read("course-materials/grammar/source/reported-speech-student-reading-guide-v3.md"),
  read("grammar-reported-speech-data.js"),
  read("course-materials/grammar/reported-speech-source-map.json"),
  read("grammar-system.html"),
  read("grammar-new-curations.js"),
  read("grammar-three-sets.js"),
  read("grammar-dialogue-propagation.js")
]);

const context = { window: { EDMUND_GRAMMAR_NEW_CURATIONS_DATA: [], EDMUND_GRAMMAR_THREE_SETS: [] } };
vm.runInNewContext(generated, context);
const { guide, practice } = context.window.EDMUND_GRAMMAR_REPORTED_SPEECH;
const sourceMap = JSON.parse(sourceMapText);

const sourceRules = [...source.matchAll(/^###\s+(RS\.\d{2}\.\d{2})\s+—\s+(.+)$/gm)];
const sourceDiagnostics = [...source.matchAll(/^\*\*(D\d{2})\s+·\s+/gm)];
assert.equal(sourceRules.length, 148);
assert.equal(sourceDiagnostics.length, 44);
assert.equal(new Set(sourceRules.map(match => match[1])).size, 148);
for (const label of ["① 先明白意思", "② 看英文例句", "③ 看中文意思", "④ 看為甚麼這樣寫", "⑤ 比較接近的寫法", "⑥ 最後看限制或例外"]) {
  assert.equal([...source.matchAll(new RegExp(`^\\*\\*${label}\\*\\*$`, "gm"))].length, 148, `missing source step ${label}`);
}

assert.equal(guide.slug, "reported-speech");
assert.equal(guide.count, 148);
assert.equal(guide.practiceCount, 44);
assert.equal([...guide.html.matchAll(/data-concept-number="RS\.\d{2}\.\d{2}"/g)].length, 148);
assert.equal(sourceMap.guide.ruleCount, 148);
assert.equal(sourceMap.guide.rules.length, 148);
assert.equal(new Set(sourceMap.guide.rules.map(rule => rule.dialogueNote)).size, 148, "every Eddy dialogue note must be rule-specific");
assert.ok(sourceMap.guide.rules.every(rule => rule.dialogueNote.length >= 12));

assert.equal(practice.questions.length, 44);
assert.equal(practice.questions.filter(question => question.mode === "multiple-choice").length, 36);
assert.equal(practice.questions.filter(question => question.mode === "self-review").length, 8);
assert.deepEqual(Array.from(practice.questions, question => question.number), Array.from({ length: 44 }, (_, index) => index + 1));
for (const question of practice.questions) {
  assert.equal(question.steps.length, 7);
  assert.ok(question.prompt && question.translation && question.answer && question.topic);
  assert.doesNotMatch(question.prompt, /\*\*|`/);
  if (question.mode === "multiple-choice") {
    assert.equal(question.options.length, 3);
    assert.ok(question.options.some(option => option.label === question.correctOption && option.text === question.answer));
  }
}
assert.equal(practice.questions[37].answer, "He said to me that the room was ready.");
assert.equal(practice.questions[43].answer, "He says that the results are reliable.");
assert.equal(sourceMap.practice.questionCount, 44);

const extensionIndex = html.indexOf("grammar-reported-speech-data.js");
assert.ok(extensionIndex > html.indexOf("grammar-three-sets-data.js"));
assert.ok(extensionIndex < html.indexOf("grammar-new-curations.js"));
assert.ok(extensionIndex < html.indexOf("grammar-three-sets.js"));
assert.match(guideRuntime, /reported speech/i);
assert.doesNotMatch(practiceRuntime, /modules\.length !== 3/);
assert.match(practiceRuntime, /multiple-choice/);
assert.match(propagation, /reported-speech/);

console.log("Reported Speech passed: 148 six-step curation cards, 148 unique dialogue notes, 36 MC items, 8 rewrites and 44 seven-step rationales.");
