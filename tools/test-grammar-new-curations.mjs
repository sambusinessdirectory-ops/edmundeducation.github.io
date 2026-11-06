import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [dataScript, reportedSpeechData, runtime, html, css] = await Promise.all([
  read("grammar-new-curations-data.js"), read("grammar-reported-speech-data.js"),
  read("grammar-new-curations.js"), read("grammar-system.html"), read("grammar-system.css")
]);
const context = { window: {} };
vm.runInNewContext(dataScript, context);
context.window.EDMUND_GRAMMAR_THREE_SETS = [];
vm.runInNewContext(reportedSpeechData, context);
const lessons = context.window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA;
assert.equal(lessons.length, 4);
for (const [index, [slug, prefix, count]] of [["so", "S", 30], ["modal", "M", 42], ["unless", "U", 24], ["reported-speech", "RS", 148]].entries()) {
  const lesson = lessons[index];
  assert.equal(lesson.slug, slug);
  assert.equal(lesson.count, count);
  const ids = prefix === "RS"
    ? [...lesson.html.matchAll(/data-concept-number="(RS\.\d{2}\.\d{2})"/g)].map((match) => match[1])
    : [...lesson.html.matchAll(new RegExp(`<h3>${prefix}(\\d\\d)｜`, "g"))].map((match) => Number(match[1]));
  assert.equal(ids.length, count);
  assert.ok(lesson.chapters.length >= 5);
  assert.doesNotMatch(lesson.html, /(?:診斷練習與答案|練習與解釋|七步示範|先做練習)/);
  assert.ok(!lesson.html.includes("<form"));
  assert.ok(lesson.html.includes("<blockquote>"));
  if (prefix !== "RS") assert.ok(lesson.html.includes("<table>"));
}
assert.match(html, /grammar-new-curations-data\.js\?v=/);
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
dom.window.eval(runtime);
const { document } = dom.window;
assert.equal(document.querySelectorAll(".grammar-lesson-card--new-curation").length, 4);
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
dom.window.close();
const validationPaths = await read("tools/pages-validation-paths");
assert.match(validationPaths, /^\/grammar-eddy-dialogues\/$/m, "production checkout must contain Eddy's grammar artwork");
console.log("Grammar reading guides passed: 4 modules, 244 numbered points, no embedded exercise sections, and navigation.");
