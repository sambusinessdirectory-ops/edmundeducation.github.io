import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const read = path => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const expected = [
  ["abstract-meaning","AB",342], ["sentence-fragments","FR",196],
  ["misplaced-dangling-modifiers","MM",232], ["reporting-structures","RPT",312],
  ["auxiliary-verbs","AU",270], ["conjunctions-connectives","CL",258],
  ["subjunctive","SJB",182], ["imperatives","IMP",310],
  ["negation-negatives","NEG",292], ["reflexive-verbs-pronouns","RF",260],
  ["non-finite-verbs","NF",270], ["question-tags","QT",236],
  ["either-or-neither-nor","EO",196], ["that-clauses","TC",233],
  ["subject-object-pronouns","PR",237], ["whether-vs-if","WI",186],
  ["all-question-forms","QF",322],
];
const [data, auditText, runtime, html, propagation] = await Promise.all([
  read("grammar-seventeen-reading-guides-data.js"),
  read("course-materials/grammar/seventeen-reading-guides-source-map.json"),
  read("grammar-new-curations.js"), read("grammar-system.html"),
  read("grammar-dialogue-propagation.js"),
]);
const context = { window:{} };
vm.runInNewContext(data, context);
const lessons = context.window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA;
const audit = JSON.parse(auditText);
assert.equal(lessons.length, 17);
assert.equal(audit.guides.length, 17);
assert.equal(lessons.reduce((sum, lesson) => sum + lesson.count, 0), 4334);
const allIds = [];
for (const [slug, prefix, count] of expected) {
  const lesson = lessons.find(item => item.slug === slug);
  const source = await read(`course-materials/grammar/source/${slug}-student-reading-guide-${count}.md`);
  const map = audit.guides.find(item => item.slug === slug);
  assert.ok(lesson?.readingOnly, `${slug} must be reading-only`);
  assert.equal(lesson.practiceCount, 0);
  assert.equal(lesson.count, count);
  const ids = [...lesson.html.matchAll(new RegExp(`data-concept-number="(${prefix}\\.\\d{2}\\.\\d{2})"`, "g"))].map(match => match[1]);
  assert.equal(ids.length, count);
  assert.equal(new Set(ids).size, count);
  allIds.push(...ids);
  assert.equal(map.ruleCount, count);
  assert.equal(map.rules.length, count);
  assert.equal(new Set(map.rules.map(rule => rule.dialogueNote)).size, count);
  for (const label of ["① 先明白意思", "② 看英文例句", "③ 看中文意思", "④ 看為甚麼這樣寫", "⑤ 比較接近的寫法", "⑥ 最後看限制或例外"]) {
    assert.equal([...source.matchAll(new RegExp(`^\\*\\*${label}\\*\\*$`, "gm"))].length, count, `${slug} lost ${label}`);
  }
  for (const part of ["PART IV","PART V","PART VI","PART VII","PART VIII","PART IX","PART X"]) assert.match(lesson.html, new RegExp(part));
  assert.doesNotMatch(source, /而是|Jayden/i);
  assert.doesNotMatch(lesson.html, /<(?:form|input|textarea|select|button)\b/i);
}
assert.equal(new Set(allIds).size, 4334);
assert.match(html, /grammar-seventeen-reading-guides-data\.js\?v=20261110-1/);
assert.match(propagation, /querySelectorAll\('\[data-new-grammar-curation\]'\)/);

const require = createRequire(new URL("./email-qa/package.json", import.meta.url));
const { JSDOM } = require("jsdom");
const dom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section></section></main>', { runScripts:"outside-only", url:"https://example.test/grammar-system.html" });
dom.window.HTMLElement.prototype.scrollIntoView = function() {};
dom.window.requestAnimationFrame = () => 1;
dom.window.matchMedia = () => ({ matches:false, addEventListener(){}, removeEventListener(){} });
dom.window.eval(data);
dom.window.eval(runtime);
for (const lesson of lessons) {
  const card = [...dom.window.document.querySelectorAll(".grammar-lesson-card--new-curation")].find(item => item.textContent.includes(lesson.english));
  assert.ok(card, `${lesson.slug} library card missing`);
  assert.match(card.textContent, /READING GUIDE/);
  assert.doesNotMatch(card.textContent, /QUESTIONS/);
  card.querySelector("button").click();
  const view = dom.window.document.querySelector(`[data-new-grammar-curation="${lesson.slug}"]`);
  assert.equal(view.querySelectorAll(".grammar-eddy-dialogue").length, lesson.count);
  assert.equal(view.querySelector(".grammar-relative-reference")?.open, false);
  assert.equal(view.querySelector(".grammar-new-stream")?.firstElementChild?.id, `${lesson.slug}-rules-1`);
  view.querySelector(`.grammar-new-chapters a[href^="#${lesson.slug}-overview-"]`)?.click();
  assert.equal(view.querySelector(".grammar-relative-reference")?.open, true);
  view.querySelector("[data-back-library]").click();
}
dom.window.close();
console.log("Seventeen Grammar reading guides passed: 4,334 source-complete cards, unique Eddy notes, collapsed references, and overview-link expansion.");
