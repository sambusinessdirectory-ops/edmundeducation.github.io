import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const read = (name) => fs.readFile(new URL(`../${name}`, import.meta.url), "utf8");
const [guideData, guideRuntime, exerciseData, exerciseRuntime, html, css] = await Promise.all([
  read("grammar-new-curations-data.js"), read("grammar-new-curations.js"),
  read("grammar-three-sets-data.js"), read("grammar-three-sets.js"),
  read("grammar-system.html"), read("grammar-three-sets.css")
]);
const context = { window: {} };
vm.runInNewContext(exerciseData, context);
const modules = context.window.EDMUND_GRAMMAR_THREE_SETS;
assert.equal(modules.length, 3);
assert.deepEqual(Array.from(modules, m => m.slug), ["so", "modal-verbs", "unless"]);
for (const module of modules) {
  assert.equal(module.questions.length, 150);
  assert.deepEqual(Array.from(module.questions, q => q.number), Array.from({ length: 150 }, (_, n) => n + 1));
  for (const q of module.questions) {
    assert.ok(q.prompt && q.translation && q.answer && q.section);
    assert.ok(["exact", "self-review"].includes(q.mode));
    assert.equal(q.steps.length, 7);
    assert.ok(q.steps.every(s => s.title && s.body));
    assert.ok(q.answers.includes(q.answer));
  }
}
assert.match(html, /grammar-three-sets-data\.js\?v=/);
assert.match(html, /grammar-three-sets\.js\?v=/);
assert.match(html, /grammar-three-sets\.css\?v=/);
assert.match(css, /\.grammar-extra-step/);

const require = createRequire(new URL("./email-qa/package.json", import.meta.url));
const { JSDOM } = require("jsdom");
const fixture = '<main data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section><section data-tense-curation hidden></section><section data-grammar-practice hidden></section></section></main>';
const dom = new JSDOM(fixture, { runScripts: "outside-only", url: "https://example.test/grammar-system.html" });
const { window } = dom;
window.HTMLElement.prototype.scrollIntoView = function () {};
window.eval(guideData);
window.eval(guideRuntime);
window.eval(exerciseData);
window.eval(exerciseRuntime);
const { document } = window;
assert.equal(document.querySelectorAll('[data-new-grammar-practice]').length, 3);
assert.equal(document.querySelectorAll('[data-open-new-grammar-practice]').length, 3);

for (const module of modules) {
  const practice = document.querySelector(`[data-new-grammar-practice="${module.slug}"]`);
  const card = [...document.querySelectorAll('.grammar-lesson-card--new-curation')]
    .find(c => c.querySelector(`[data-open-new-grammar-practice="${module.slug}"]`));
  assert.ok(practice && card);
  card.querySelector('[data-open-new-grammar-practice]').click();
  assert.equal(practice.hidden, false);
  assert.equal(document.querySelector('[data-grammar-library]').hidden, true);
  assert.equal(new URL(window.location.href).searchParams.get("lesson"), module.slug);
  assert.equal(practice.querySelector('[data-prompt]').textContent, module.questions[0].prompt);
  assert.equal(practice.querySelector('[data-translation]').textContent, `【${module.questions[0].translation}】`);
  assert.equal(practice.querySelectorAll('[data-grid] button').length, 25);

  const first = module.questions[0];
  const input = practice.querySelector(first.mode === 'exact' ? '[data-short-answer]' : '[data-long-answer]');
  input.value = first.answer;
  practice.querySelector('[data-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(practice.querySelector('[data-explanation]').hidden, false);
  assert.equal(practice.querySelectorAll('.grammar-extra-step').length, 1);
  practice.querySelector('[data-mode="scroll"]').click();
  assert.equal(practice.querySelectorAll('.grammar-extra-step').length, 7);
  if (first.mode === 'self-review') practice.querySelector('[data-mark-reviewed]').click();
  assert.equal(practice.querySelector('[data-score]').textContent, '1');
  practice.querySelector('[data-grid] [data-question="25"]').click();
  assert.equal(practice.querySelector('[data-number]').textContent, '第 25 / 150 題');
  practice.querySelector('[data-range]').value = '126';
  practice.querySelector('[data-range]').dispatchEvent(new window.Event('change'));
  practice.querySelector('[data-grid] [data-question="150"]').click();
  assert.equal(practice.querySelector('[data-number]').textContent, '第 150 / 150 題');
  assert.equal(practice.querySelector('[data-next]').disabled, true);
  practice.querySelector('[data-back-guide]').click();
  const guideSlug = module.slug === 'modal-verbs' ? 'modal' : module.slug;
  assert.equal(document.querySelector(`[data-new-grammar-curation="${guideSlug}"]`).hidden, false);
  assert.equal(practice.hidden, true);
  document.querySelector(`[data-new-grammar-curation="${guideSlug}"] [data-back-library]`).click();
}

// The one open-ended short-answer exception permits all standard no-obligation forms.
const modal = modules[1].questions[14];
assert.equal(modal.mode, 'exact');
assert.deepEqual(Array.from(modal.answers), ["don't have to", "needn't", "don't need to"]);
dom.window.close();
console.log("Three grammar practice sets passed: 450 sourced items, seven steps each, navigation, review and guide routing.");
