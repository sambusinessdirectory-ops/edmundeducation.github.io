import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const root = new URL("../", import.meta.url);
const read = name => fs.readFile(new URL(name, root), "utf8");
const [source, generated, sourceMapText, html, guideRuntime, practiceRuntime, propagation] = await Promise.all([
  read("course-materials/grammar/source/relative-clauses-student-reading-guide-224.md"),
  read("grammar-relative-clauses-data.js"),
  read("course-materials/grammar/relative-clauses-source-map.json"),
  read("grammar-system.html"), read("grammar-new-curations.js"), read("grammar-three-sets.js"),
  read("grammar-dialogue-propagation.js")
]);

const context = { window: { EDMUND_GRAMMAR_NEW_CURATIONS_DATA: [], EDMUND_GRAMMAR_THREE_SETS: [] } };
vm.runInNewContext(generated, context);
const { guide, practice } = context.window.EDMUND_GRAMMAR_RELATIVE_CLAUSES;
const sourceMap = JSON.parse(sourceMapText);
const sourceRules = [...source.matchAll(/^###\s+(RC\.\d{2}\.\d{2})\s+—\s+(.+)$/gm)];
const sourceDiagnostics = [...source.matchAll(/^###\s+(D\d{3})\s*$/gm)];
assert.equal(sourceRules.length, 224);
assert.equal(new Set(sourceRules.map(match => match[1])).size, 224);
assert.equal(sourceDiagnostics.length, 82);
for (const label of ["① 先明白意思", "② 看英文例句", "③ 看中文意思", "④ 看為甚麼這樣寫", "⑤ 比較接近的寫法", "⑥ 最後看限制或例外"]) {
  assert.equal([...source.matchAll(new RegExp(`^\\*\\*${label}\\*\\*$`, "gm"))].length, 224, `missing source step ${label}`);
}
assert.equal(guide.slug, "relative-clauses");
assert.equal(guide.count, 224);
assert.equal(guide.practiceCount, 82);
assert.equal([...guide.html.matchAll(/data-concept-number="RC\.\d{2}\.\d{2}"/g)].length, 224);
assert.match(guide.html, /Final Coverage Check/);
assert.match(guide.html, /Reference Tables/);
assert.match(guide.html, /Common Errors and Misconceptions/);
assert.equal(sourceMap.guide.ruleCount, 224);
assert.equal(sourceMap.guide.rules.length, 224);
assert.equal(new Set(sourceMap.guide.rules.map(rule => rule.dialogueNote)).size, 224, "every Eddy note must be rule-specific");
assert.ok(sourceMap.guide.rules.every(rule => rule.dialogueNote.length >= 12));
assert.ok(sourceMap.guide.rules.every(rule => !rule.dialogueNote.includes("##")), "chapter headings must not leak into Eddy dialogue");

assert.equal(practice.questions.length, 82);
assert.deepEqual(Array.from(practice.questions, q => q.number), Array.from({length:82}, (_, i) => i + 1));
assert.equal(practice.questions.filter(q => q.mode === "self-review").length, 12);
for (const question of practice.questions) {
  assert.equal(question.steps.length, 7);
  assert.ok(question.prompt && question.translation && question.answer && question.topic);
  assert.match(question.topic, /^RC\.\d{2}\.\d{2}$/);
  if (question.mode === "multiple-choice") {
    assert.equal(question.options.length, 4);
    assert.ok(question.options.some(option => option.label === question.correctOption));
  }
}
assert.equal(practice.questions[0].answer, "who");
assert.equal(practice.questions[81].answer, "Sam");
assert.equal(sourceMap.practice.questionCount, 82);

const extensionIndex = html.indexOf("grammar-relative-clauses-data.js");
assert.ok(extensionIndex > html.indexOf("grammar-reported-speech-data.js"));
assert.ok(extensionIndex < html.indexOf("grammar-new-curations.js"));
assert.ok(extensionIndex < html.indexOf("grammar-three-sets.js"));
assert.match(guideRuntime, /relative clause/i);
assert.match(practiceRuntime, /multiple-choice/);
assert.match(propagation, /relative-clauses/);

const require = createRequire(new URL("./email-qa/package.json", import.meta.url));
const { JSDOM } = require("jsdom");
const dom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section></section></main>',
  { runScripts:"outside-only", url:"https://example.test/grammar-system.html?lesson=relative-clauses&view=curation" });
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.requestAnimationFrame = () => 1;
dom.window.eval(generated);
dom.window.eval(guideRuntime);
const view = dom.window.document.querySelector('[data-new-grammar-curation="relative-clauses"]');
assert.ok(view && !view.hidden);
const cards = [...view.querySelectorAll('.grammar-eddy-dialogue')];
assert.equal(cards.length, 224);
assert.equal(new Set(cards.map(card => card.querySelector('figcaption').textContent.trim())).size, 224);
assert.ok(cards.every(card => card.querySelector('.grammar-eddy-dialogue__lesson-copy blockquote')));
assert.match(cards[0].querySelector('img').src, /eddy-01\.webp/);
assert.match(cards[31].querySelector('img').src, /eddy-32\.webp/);
assert.match(cards[32].querySelector('img').src, /eddy-01\.webp/);
assert.ok(view.querySelectorAll('.grammar-new-appendix').length >= 3, "overview and references must remain available");
dom.window.close();
console.log("Relative Clauses passed: 224 six-step Eddy cards, complete appendices, 82 diagnostics and 82 seven-step rationales.");
