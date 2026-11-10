import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const root = new URL("../", import.meta.url);
const read = name => fs.readFile(new URL(name, root), "utf8");
const [passiveSource, prepSource, passiveData, prepData, passiveMapText, prepMapText, html, guideRuntime, propagation] = await Promise.all([
  read("course-materials/grammar/source/passive-voice-student-reading-guide.md"),
  read("course-materials/grammar/source/prepositions-prepositional-phrases-course-pages.txt"),
  read("grammar-passive-voice-data.js"), read("grammar-prepositions-data.js"),
  read("course-materials/grammar/passive-voice-source-map.json"), read("course-materials/grammar/prepositions-source-map.json"),
  read("grammar-system.html"), read("grammar-new-curations.js"), read("grammar-dialogue-propagation.js"),
]);

const context = { window:{ EDMUND_GRAMMAR_NEW_CURATIONS_DATA:[], EDMUND_GRAMMAR_THREE_SETS:[] } };
vm.runInNewContext(passiveData, context);
vm.runInNewContext(prepData, context);
const modules = [
  { name:"Passive Voice", global:context.window.EDMUND_GRAMMAR_PASSIVE_VOICE, source:passiveSource, map:JSON.parse(passiveMapText), prefix:"PV", rules:290, questions:92 },
  { name:"Prepositions", global:context.window.EDMUND_GRAMMAR_PREPOSITIONS, source:prepSource, map:JSON.parse(prepMapText), prefix:"PP", rules:291, questions:86 },
];
for (const item of modules) {
  const { guide, practice } = item.global;
  assert.equal(guide.count, item.rules);
  assert.equal(guide.practiceCount, item.questions);
  assert.equal(practice.questions.length, item.questions);
  assert.equal(item.map.guide.ruleCount, item.rules);
  assert.equal(item.map.guide.sixStepFieldCount, item.rules * 6);
  assert.equal(item.map.practice.questionCount, item.questions);
  assert.equal(item.map.practice.sevenStepExplanationCount, item.questions * 7);
  assert.equal([...guide.html.matchAll(new RegExp(`data-concept-number="${item.prefix}\\.\\d{2}\\.\\d{2}"`, "g"))].length, item.rules);
  assert.equal(new Set(item.map.guide.rules.map(rule => rule.id)).size, item.rules);
  assert.equal(new Set(item.map.guide.rules.map(rule => rule.dialogueNote)).size, item.rules, `${item.name} Eddy notes must be rule-specific`);
  assert.ok(item.map.guide.rules.every(rule => rule.dialogueNote.length >= 8));
  assert.ok(item.map.guide.rules.every(rule => !/PART III|Loading older|SOURCE PDF|^PP\.\d{2} —/.test(rule.dialogueNote)));
  assert.deepEqual(Array.from(practice.questions, q => q.number), Array.from({length:item.questions}, (_, i) => i + 1));
  for (const question of practice.questions) {
    assert.equal(question.steps.length, 7);
    assert.ok(question.prompt && question.translation && question.answer && question.topic);
    assert.match(question.topic, new RegExp(`^${item.prefix}\\.\\d{2}\\.\\d{2}$`));
    if (question.mode === "multiple-choice") {
      assert.ok(question.options.length >= 3);
      assert.ok(question.options.some(option => option.label === question.correctOption));
    }
  }
}

for (const label of ["① 先明白意思", "② 看英文例句", "③ 看中文意思", "④ 看為甚麼這樣寫", "⑤ 比較接近的寫法", "⑥ 最後看限制或例外"]) {
  assert.equal([...passiveSource.matchAll(new RegExp(`^\\*\\*${label}\\*\\*$`, "gm"))].length, 290);
  assert.equal(prepSource.split(label).length - 1, 291);
}
assert.equal([...passiveSource.matchAll(/^\*\*(D\d{3})\.\*\*/gm)].length, 92);
assert.equal(new Set([...prepSource.matchAll(/(?:^|\f)\s*(P\d{3})\s*$/gm)].map(match => match[1])).size, 86);
assert.match(passiveData, /window\.EDMUND_GRAMMAR_PASSIVE_VOICE/);
assert.match(prepData, /window\.EDMUND_GRAMMAR_PREPOSITIONS/);
assert.ok(html.indexOf("grammar-passive-voice-data.js") < html.indexOf("grammar-new-curations.js"));
assert.ok(html.indexOf("grammar-prepositions-data.js") < html.indexOf("grammar-new-curations.js"));
assert.match(html, /grammar-new-curations\.js\?v=20261110-conditionals1/);
assert.match(propagation, /passive-voice/);
assert.match(propagation, /prepositions/);
assert.match(guideRuntime, /passive-voice/);
assert.match(guideRuntime, /prepositions/);

const require = createRequire(new URL("./email-qa/package.json", import.meta.url));
const { JSDOM } = require("jsdom");
const dom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section></section></main>',
  { runScripts:"outside-only", url:"https://example.test/grammar-system.html" });
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.requestAnimationFrame = () => 1;
dom.window.eval(passiveData);
dom.window.eval(prepData);
dom.window.eval(guideRuntime);
for (const item of modules) {
  const slug = item.global.guide.slug;
  const view = dom.window.document.querySelector(`[data-new-grammar-curation="${slug}"]`);
  assert.ok(view, `${slug} guide view must render`);
  const reference = view.querySelector(".grammar-relative-reference");
  assert.ok(reference, `${slug} must place its learning guide and rule inventory in a disclosure panel`);
  assert.equal(reference.open, false, `${slug} reference panel must be collapsed by default`);
  assert.match(reference.textContent, /PART I — Grammar System Overview/);
  assert.match(reference.textContent, /PART II — Complete Hierarchical Rule/);
  assert.equal(view.querySelector(".grammar-new-stream").firstElementChild?.id, `${slug}-rules-1`, `${slug} rule cards must begin immediately after the collapsed reference panel`);
  const overviewLink = view.querySelector(`.grammar-new-chapters a[href^="#${slug}-overview-"]`);
  assert.ok(overviewLink, `${slug} must retain a chapter link to its collapsed guide`);
  overviewLink.dispatchEvent(new dom.window.MouseEvent("click", { bubbles:true, cancelable:true }));
  assert.equal(reference.open, true, `${slug} chapter navigation must expand the reference panel before scrolling`);
  reference.open = false;
  const cards = [...view.querySelectorAll(".grammar-eddy-dialogue")];
  assert.equal(cards.length, item.rules);
  assert.equal(new Set(cards.map(card => card.querySelector("figcaption")?.textContent.trim())).size, item.rules);
  assert.match(cards[0].querySelector("img").src, /eddy-01\.webp/);
  assert.match(cards[31].querySelector("img").src, /eddy-32\.webp/);
  assert.match(cards[32].querySelector("img").src, /eddy-01\.webp/);
  assert.ok(cards.every(card => card.querySelector(".grammar-eddy-dialogue__lesson-copy blockquote")));
}
dom.window.close();
console.log("Passive Voice and Prepositions passed: 581 six-step Eddy cards, 178 exercises and 1,246 seven-step rationale steps.");
