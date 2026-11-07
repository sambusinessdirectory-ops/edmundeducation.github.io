import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const read = (name) => fs.readFile(new URL(`../${name}`, import.meta.url), "utf8");
const [guideData, reportedSpeechData, phrasalVerbsData, guideRuntime, exerciseData, exerciseRuntime, html, css] = await Promise.all([
  read("grammar-new-curations-data.js"), read("grammar-reported-speech-data.js"), read("grammar-phrasal-verbs-data.js"),
  read("grammar-new-curations.js"), read("grammar-three-sets-data.js"), read("grammar-three-sets.js"),
  read("grammar-system.html"), read("grammar-three-sets.css")
]);
const context = { window: {} };
vm.runInNewContext(exerciseData, context);
context.window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA = [];
vm.runInNewContext(reportedSpeechData, context);
vm.runInNewContext(phrasalVerbsData, context);
const modules = context.window.EDMUND_GRAMMAR_THREE_SETS;
assert.equal(modules.length, 5);
assert.deepEqual(Array.from(modules, m => m.slug), ["so", "modal-verbs", "unless", "reported-speech", "phrasal-verbs"]);
for (const module of modules) {
  const total = module.slug === "reported-speech" ? 44 : module.slug === "phrasal-verbs" ? 74 : 150;
  assert.equal(module.questions.length, total);
  assert.deepEqual(Array.from(module.questions, q => q.number), Array.from({ length: total }, (_, n) => n + 1));
  for (const q of module.questions) {
    assert.ok(q.prompt && q.translation && q.answer && q.section);
    assert.ok(["exact", "self-review", "multiple-choice"].includes(q.mode));
    assert.equal(q.steps.length, 7);
    assert.ok(q.steps.every(s => s.title && s.body));
    assert.ok(q.answers.includes(q.answer) || q.mode === "multiple-choice");
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
window.requestAnimationFrame = () => 1;
window.eval(guideData);
window.eval(exerciseData);
window.eval(reportedSpeechData);
window.eval(phrasalVerbsData);
window.eval(guideRuntime);
window.eval(exerciseRuntime);
const { document } = window;
assert.equal(document.querySelectorAll('[data-new-grammar-practice]').length, 5);
assert.equal(document.querySelectorAll('[data-open-new-grammar-practice]').length, 5);

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
  if (first.mode === 'multiple-choice') practice.querySelector(`[data-mc-options] input[value="${first.correctOption}"]`).checked = true;
  else {
    const input = practice.querySelector(first.mode === 'exact' ? '[data-short-answer]' : '[data-long-answer]');
    input.value = first.answer;
  }
  practice.querySelector('[data-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(practice.querySelector('[data-explanation]').hidden, false);
  assert.equal(practice.querySelectorAll('.grammar-extra-step').length, 1);
  practice.querySelector('[data-mode="scroll"]').click();
  assert.equal(practice.querySelectorAll('.grammar-extra-step').length, 7);
  if (first.mode === 'self-review') practice.querySelector('[data-mark-reviewed]').click();
  assert.equal(practice.querySelector('[data-score]').textContent, '1');
  const total = module.questions.length;
  practice.querySelector('[data-grid] [data-question="25"]').click();
  assert.equal(practice.querySelector('[data-number]').textContent, `第 25 / ${total} 題`);
  const lastRange = Math.floor((total - 1) / 25) * 25 + 1;
  practice.querySelector('[data-range]').value = String(lastRange);
  practice.querySelector('[data-range]').dispatchEvent(new window.Event('change'));
  practice.querySelector(`[data-grid] [data-question="${total}"]`).click();
  assert.equal(practice.querySelector('[data-number]').textContent, `第 ${total} / ${total} 題`);
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
console.log("Grammar practice passed: 568 sourced items, seven steps each, MC marking, navigation, review and guide routing.");
