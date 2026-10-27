import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [dataScript, runtime, html, css] = await Promise.all([
  read("grammar-new-curations-data.js"), read("grammar-new-curations.js"),
  read("grammar-system.html"), read("grammar-system.css")
]);
const context = { window: {} };
vm.runInNewContext(dataScript, context);
const lessons = context.window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA;
assert.equal(lessons.length, 3);
for (const [index, [slug, prefix, count]] of [["so", "S", 30], ["modal", "M", 42], ["unless", "U", 24]].entries()) {
  const lesson = lessons[index];
  assert.equal(lesson.slug, slug);
  assert.equal(lesson.count, count);
  const ids = [...lesson.html.matchAll(new RegExp(`<h3>${prefix}(\\d\\d)｜`, "g"))].map((match) => Number(match[1]));
  assert.deepEqual(ids, Array.from({ length: count }, (_, number) => number + 1));
  assert.ok(lesson.chapters.length >= 5);
  assert.doesNotMatch(lesson.html, /(?:診斷練習與答案|練習與解釋|七步示範|先做練習)/);
  assert.ok(!lesson.html.includes("<form"));
  assert.ok(lesson.html.includes("<blockquote>") && lesson.html.includes("<table>"));
}
assert.match(html, /grammar-new-curations-data\.js\?v=/);
assert.match(html, /grammar-new-curations\.js\?v=/);
assert.match(css, /\.grammar-new-body table/);
assert.match(runtime, /data-new-grammar-curation/);

const require = createRequire(new URL("./email-qa/package.json", import.meta.url));
const { JSDOM } = require("jsdom");
const dom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section><section data-tense-curation hidden></section><section data-grammar-practice hidden></section></section></main>', { runScripts: "outside-only", url: "https://example.test/grammar-system.html" });
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.eval(dataScript);
dom.window.eval(runtime);
const { document } = dom.window;
assert.equal(document.querySelectorAll(".grammar-lesson-card--new-curation").length, 3);
for (const [index, lesson] of lessons.entries()) {
  document.querySelectorAll(".grammar-lesson-card--new-curation button")[index].click();
  const section = document.querySelector(`[data-new-grammar-curation="${lesson.slug}"]`);
  assert.equal(section.hidden, false);
  assert.equal(document.querySelectorAll("[data-new-grammar-curation]:not([hidden])").length, 1);
  assert.equal(document.querySelector("[data-grammar-library]").hidden, true);
  assert.equal(new URL(dom.window.location.href).searchParams.get("lesson"), lesson.slug);
  section.querySelector("[data-back-library]").click();
  assert.equal(document.querySelector("[data-grammar-library]").hidden, false);
}
dom.window.close();
console.log("Grammar reading guides passed: 3 modules, 96 numbered points, no exercise sections, and navigation.");
