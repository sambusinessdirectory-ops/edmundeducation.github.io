import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const read = path => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const expected = [
  ["causative-constructions","CAU",283,17],
  ["cleft-pseudo-cleft-sentences","CLF",257,11],
  ["transitivity-verb-valency","VV",272,7],
  ["complements-complementation","CMP",348,18],
  ["sentence-structure-types","SS",289,11],
  ["inversion","INV",273,9],
];
const [data, auditText, runtime, html, propagation] = await Promise.all([
  read("grammar-six-reading-guides-data.js"),
  read("course-materials/grammar/six-reading-guides-source-map.json"),
  read("grammar-new-curations.js"), read("grammar-system.html"), read("grammar-dialogue-propagation.js"),
]);
const context = { window:{} };
vm.runInNewContext(data, context);
const lessons = context.window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA;
const audit = JSON.parse(auditText);
assert.equal(lessons.length, 6);
assert.equal(audit.guides.length, 6);
assert.equal(lessons.reduce((sum, lesson) => sum + lesson.count, 0), 1722);
const allIds = [];
for (const [slug, prefix, count, tableCount] of expected) {
  const lesson = lessons.find(item => item.slug === slug);
  const source = await read(`course-materials/grammar/source/${slug}-student-reading-guide-${count}.md`);
  const map = audit.guides.find(item => item.slug === slug);
  assert.ok(lesson?.readingOnly, `${slug} must be reading-only`);
  assert.equal(lesson.practiceCount, 0);
  const ids = [...lesson.html.matchAll(new RegExp(`data-concept-number="(${prefix}\\.\\d{2}\\.\\d{2})"`, "g"))].map(match => match[1]);
  assert.equal(ids.length, count);
  assert.equal(new Set(ids).size, count);
  allIds.push(...ids);
  assert.equal(map.ruleCount, count);
  assert.equal(map.rules.length, count);
  assert.equal(new Set(map.rules.map(rule => rule.dialogueNote)).size, count);
  assert.equal(map.tableCount, tableCount, `${slug} must retain every authored table`);
  assert.equal((lesson.html.match(/<table>/g) || []).length, tableCount);
  for (const label of ["① 先明白意思", "② 看英文例句", "③ 看中文意思", "④ 看為甚麼這樣寫", "⑤ 比較接近的寫法", "⑥ 最後看限制或例外"]) {
    assert.equal([...source.matchAll(new RegExp(`^\\*\\*${label}\\*\\*$`, "gm"))].length, count, `${slug} lost ${label}`);
  }
  for (const part of ["PART IV","PART V","PART VI","PART VII","PART VIII","PART IX","PART X"]) assert.match(lesson.html, new RegExp(part));
  assert.doesNotMatch(source, /而是|Jayden/i);
  assert.doesNotMatch(lesson.html, /<(?:form|input|textarea|select|button)\b/i);
}
assert.equal(new Set(allIds).size, 1722);
assert.match(html, /grammar-six-reading-guides-data\.js\?v=20261111-1/);
assert.ok(html.indexOf("grammar-six-reading-guides-data.js") < html.indexOf("grammar-new-curations.js"));
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
  card.querySelector("button").click();
  const view = dom.window.document.querySelector(`[data-new-grammar-curation="${lesson.slug}"]`);
  assert.equal(view.querySelectorAll(".grammar-eddy-dialogue").length, lesson.count);
  const reference = view.querySelector(".grammar-relative-reference");
  assert.equal(reference?.open, false);
  assert.equal(view.querySelector(".grammar-new-stream")?.firstElementChild?.id, `${lesson.slug}-rules-1`);
  view.querySelector(`.grammar-new-chapters a[href^="#${lesson.slug}-overview-"]`)?.click();
  assert.equal(reference.open, true);
  view.querySelector("[data-back-library]").click();
}
dom.window.close();
console.log("Six Grammar reading guides passed: 1,722 source-complete cards, unique Eddy notes, collapsed references, and Overview expansion.");
