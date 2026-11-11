import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const fourSourcePaths = [
  "course-materials/grammar/source/comparative-superlative-student-reading-guide-319.md",
  "course-materials/grammar/source/dependent-independent-clauses-student-reading-guide-316.md",
  "course-materials/grammar/source/adverbs-of-frequency-student-reading-guide-265.md",
  "course-materials/grammar/source/parts-of-speech-functions-student-reading-guide-309.md",
];
const [dataScript, reportedSpeechData, conditionalsData, conditionalsSource, conditionalsMapText, fourGuidesData, fourGuidesMapText, runtime, html, css, fourSources] = await Promise.all([
  read("grammar-new-curations-data.js"), read("grammar-reported-speech-data.js"),
  read("grammar-conditionals-data.js"),
  read("course-materials/grammar/source/conditionals-student-reading-guide-298.md"),
  read("course-materials/grammar/conditionals-source-map.json"),
  read("grammar-four-reading-guides-data.js"),
  read("course-materials/grammar/four-reading-guides-source-map.json"),
  read("grammar-new-curations.js"), read("grammar-system.html"), read("grammar-system.css"),
  Promise.all(fourSourcePaths.map(read)),
]);
const context = { window: {} };
vm.runInNewContext(dataScript, context);
context.window.EDMUND_GRAMMAR_THREE_SETS = [];
vm.runInNewContext(reportedSpeechData, context);
vm.runInNewContext(conditionalsData, context);
vm.runInNewContext(fourGuidesData, context);
const lessons = context.window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA;
assert.equal(lessons.length, 9);
for (const [index, [slug, prefix, count]] of [["so", "S", 30], ["modal", "M", 42], ["unless", "U", 24], ["reported-speech", "RS", 148], ["conditionals", "CD", 298], ["comparative-superlative", "CS", 319], ["dependent-independent-clauses", "CL", 316], ["adverbs-of-frequency", "AF", 265], ["parts-of-speech-functions", "WC", 309]].entries()) {
  const lesson = lessons[index];
  assert.equal(lesson.slug, slug);
  assert.equal(lesson.count, count);
  const ids = prefix === "RS"
    ? [...lesson.html.matchAll(/data-concept-number="(RS\.\d{2}\.\d{2})"/g)].map((match) => match[1])
    : ["CD", "CS", "CL", "AF", "WC"].includes(prefix)
      ? [...lesson.html.matchAll(new RegExp(`data-concept-number="(${prefix}\\.\\d{2}\\.\\d{2})"`, "g"))].map((match) => match[1])
      : [...lesson.html.matchAll(new RegExp(`<h3>${prefix}(\\d\\d)｜`, "g"))].map((match) => Number(match[1]));
  assert.equal(ids.length, count);
  assert.ok(lesson.chapters.length >= 5);
  assert.doesNotMatch(lesson.html, /(?:診斷練習與答案|練習與解釋|七步示範|先做練習)/);
  assert.ok(!lesson.html.includes("<form"));
  assert.ok(lesson.html.includes("<blockquote>"));
  if (prefix !== "RS") assert.ok(lesson.html.includes("<table>"));
}
assert.match(html, /grammar-new-curations-data\.js\?v=/);
assert.match(html, /grammar-conditionals-data\.js\?v=20261110-1/);
assert.match(html, /grammar-four-reading-guides-data\.js\?v=20261110-1/);
assert.match(html, /grammar-seventeen-reading-guides-data\.js\?v=20261110-1/);
assert.match(html, /grammar-seven-reading-guides-data\.js\?v=20261110-1/);
assert.match(html, /grammar-six-reading-guides-data\.js\?v=20261111-1/);
assert.match(html, /grammar-new-curations\.js\?v=20261111-six-guides1/);
assert.match(html, /grammar-dialogue-propagation\.js\?v=20261110-seven-guides1/);
assert.match(html, /grammar-new-curations\.js\?v=/);
assert.match(css, /\.grammar-new-body table/);
assert.match(css, /https:\/\/edmund-public-media\.edmundeducation\.workers\.dev\/grammar-eddy-dialogues\/blackboard-imagegen-framed-v2\.webp\?v=20261106-live-assets2/);
assert.match(runtime, /data-new-grammar-curation/);

const require = createRequire(new URL("./email-qa/package.json", import.meta.url));
const { JSDOM } = require("jsdom");
const dom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section><section data-tense-curation hidden></section><section data-grammar-practice hidden></section></section></main>', { runScripts: "outside-only", url: "https://example.test/grammar-system.html" });
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.requestAnimationFrame = () => 1;
dom.window.eval(await read("grammar-dialogue-notes.js"));
dom.window.eval(dataScript);
dom.window.EDMUND_GRAMMAR_THREE_SETS = [];
dom.window.eval(reportedSpeechData);
dom.window.eval(conditionalsData);
dom.window.eval(fourGuidesData);
dom.window.eval(runtime);
const { document } = dom.window;
assert.equal(document.querySelectorAll(".grammar-lesson-card--new-curation").length, lessons.length);
for (const [index, lesson] of lessons.entries()) {
  document.querySelectorAll(".grammar-lesson-card--new-curation button")[index].click();
  const section = document.querySelector(`[data-new-grammar-curation="${lesson.slug}"]`);
  assert.equal(section.hidden, false);
  assert.equal(section.querySelectorAll(".grammar-new-topic:not(.grammar-new-appendix)").length, lesson.count);
  assert.equal(section.querySelectorAll(".grammar-new-chapter").length, lesson.chapters.length);
  const dialogues = section.querySelectorAll(".grammar-eddy-dialogue");
  assert.equal(dialogues.length, lesson.count);
  if (lesson.slug === "unless") {
    assert.deepEqual([...dialogues].map((dialogue) => dialogue.dataset.rule), Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, "0")));
    assert.ok([...dialogues].every((dialogue) => dialogue.querySelector("img")?.getAttribute("src") === `https://edmund-public-media.edmundeducation.workers.dev/grammar-eddy-dialogues/unless/eddy-${dialogue.dataset.rule}.webp?v=20261106-live-assets2`));
    assert.match(dialogues[20].querySelector("figcaption").textContent, /短答能依賴前一句/);
    assert.equal(dialogues[23].querySelector("figcaption").textContent, "看看例句就清楚了！");
  }
  assert.ok([...section.querySelectorAll(".grammar-new-topic:not(.grammar-new-appendix)")].every((card) => card.dataset.scrollVisible === "true" && card.querySelector(".grammar-articles-topic__head > span")));
  assert.equal(document.querySelectorAll("[data-new-grammar-curation]:not([hidden])").length, 1);
  assert.equal(document.querySelector("[data-grammar-library]").hidden, true);
  assert.equal(new URL(dom.window.location.href).searchParams.get("lesson"), lesson.slug);
  section.querySelector("[data-back-library]").click();
  assert.equal(document.querySelector("[data-grammar-library]").hidden, false);
}
const conditionals = lessons.find(lesson => lesson.slug === "conditionals");
const conditionalsMap = JSON.parse(conditionalsMapText);
assert.ok(conditionals?.readingOnly);
assert.equal(conditionals.practiceCount, 0);
assert.equal(conditionals.count, 298);
assert.equal([...conditionals.html.matchAll(/data-concept-number="CD\.\d{2}\.\d{2}"/g)].length, 298);
assert.equal([...conditionalsSource.matchAll(/^###\s+(CD\.\d{2}\.\d{2})\s+—\s+(.+)$/gm)].length, 298);
assert.equal(conditionalsMap.guide.ruleCount, 298);
assert.equal(conditionalsMap.guide.rules.length, 298);
assert.equal(new Set(conditionalsMap.guide.rules.map(rule => rule.dialogueNote)).size, 298);
assert.ok(conditionalsMap.guide.rules.every(rule => rule.dialogueNote.length >= 12));
assert.equal((conditionals.html.match(/<table>/g) || []).length, 11);
for (const part of ["PART IV", "PART V", "PART VI", "PART VII", "PART VIII", "PART X"]) assert.match(conditionals.html, new RegExp(part));
assert.doesNotMatch(conditionals.html, /PART IX|D001|而是/);
const conditionalsView = document.querySelector('[data-new-grammar-curation="conditionals"]');
assert.equal(conditionalsView.querySelectorAll('.grammar-eddy-dialogue').length, 298);
assert.equal(new Set([...conditionalsView.querySelectorAll('figcaption')].map(node => node.textContent.trim())).size, 298);
assert.equal(conditionalsView.querySelector('.grammar-relative-reference')?.open, false);
assert.equal(conditionalsView.querySelector('.grammar-new-stream')?.firstElementChild?.id, 'conditionals-rules-1');
const conditionalsCard = [...document.querySelectorAll('.grammar-lesson-card--new-curation')].find(card => card.textContent.includes('Conditionals'));
assert.match(conditionalsCard.textContent, /READING GUIDE/);
assert.doesNotMatch(conditionalsCard.textContent, /QUESTIONS|150 題/);

const fourGuideMap = JSON.parse(fourGuidesMapText);
const fourExpected = [
  ["comparative-superlative", "CS", 319, 12],
  ["dependent-independent-clauses", "CL", 316, 12],
  ["adverbs-of-frequency", "AF", 265, 10],
  ["parts-of-speech-functions", "WC", 309, 9],
];
for (const [index, [slug, prefix, count, tableCount]] of fourExpected.entries()) {
  const lesson = lessons.find(item => item.slug === slug);
  const source = fourSources[index];
  const audit = fourGuideMap.guides.find(item => item.slug === slug);
  assert.ok(lesson?.readingOnly, `${slug} must remain a reading-only source guide`);
  assert.equal(lesson.practiceCount, 0);
  assert.equal(lesson.count, count);
  assert.equal([...lesson.html.matchAll(new RegExp(`data-concept-number="${prefix}\\.\\d{2}\\.\\d{2}"`, "g"))].length, count);
  assert.equal([...source.matchAll(new RegExp(`^###\\s+${prefix}\\.\\d{2}\\.\\d{2}\\s+[—-]\\s+.+$`, "gm"))].length, count);
  for (const label of ["① 先明白意思", "② 看英文例句", "③ 看中文意思", "④ 看為甚麼這樣寫", "⑤ 比較接近的寫法", "⑥ 最後看限制或例外"]) {
    assert.equal([...source.matchAll(new RegExp(`^\\*\\*${label}\\*\\*$`, "gm"))].length, count, `${slug} must retain every ${label} source line`);
  }
  assert.equal(audit.ruleCount, count);
  assert.equal(audit.rules.length, count);
  assert.equal(new Set(audit.rules.map(rule => rule.dialogueNote)).size, count);
  assert.ok(audit.rules.every(rule => rule.dialogueNote.length >= 12));
  assert.equal((lesson.html.match(/<table>/g) || []).length, tableCount);
  for (const part of ["PART IV", "PART V", "PART VI", "PART VII", "PART VIII", "PART IX", "PART X"]) assert.match(lesson.html, new RegExp(part));
  assert.doesNotMatch(lesson.html, /而是|Jayden/i);
  const view = document.querySelector(`[data-new-grammar-curation="${slug}"]`);
  assert.equal(view.querySelectorAll('.grammar-eddy-dialogue').length, count);
  assert.equal(new Set([...view.querySelectorAll('figcaption')].map(node => node.textContent.trim())).size, count);
  const reference = view.querySelector('.grammar-relative-reference');
  assert.equal(reference?.open, false);
  assert.equal(view.querySelector('.grammar-new-stream')?.firstElementChild?.id, `${slug}-rules-1`);
  view.querySelector(`.grammar-new-chapters a[href^="#${slug}-overview-"]`).click();
  assert.equal(reference.open, true, `${slug} overview links must expand hidden reference content`);
  reference.open = false;
  const moduleCard = [...document.querySelectorAll('.grammar-lesson-card--new-curation')].find(card => card.textContent.includes(lesson.english));
  assert.match(moduleCard.textContent, /READING GUIDE/);
  assert.doesNotMatch(moduleCard.textContent, /QUESTIONS|150 題/);
}
dom.window.close();
const validationPaths = await read("tools/pages-validation-paths");
assert.match(validationPaths, /^\/grammar-eddy-dialogues\/$/m, "production checkout must contain Eddy's grammar artwork");
console.log("Grammar reading guides passed: 9 modules including 1,209 new source-complete cards, collapsed overview references, and navigation auto-expansion.");
