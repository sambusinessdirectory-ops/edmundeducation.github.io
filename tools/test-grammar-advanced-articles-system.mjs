import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [tenseData, tenseGuide, tenseRuntime, extensionData, articleData, articleRuntime, advancedData, advancedRuntime, html, css, sql, workflow] = await Promise.all([
  read("grammar-tense-data.js"), read("grammar-tense-curation-data.js"), read("grammar-system.js"), read("grammar-advanced-articles-extension-data.js"), read("grammar-articles-data.js"), read("grammar-articles.js"),
  read("grammar-advanced-articles-data.js"), read("grammar-advanced-articles.js"), read("grammar-system.html"),
  read("grammar-system.css"), read("supabase-grammar-advanced-articles-progress.sql"), read(".github/workflows/pages.yml")
]);
const context = { window: {} };
vm.createContext(context);
vm.runInContext(advancedData, context);
vm.runInContext(extensionData, context);
const lesson = context.window.EDMUND_GRAMMAR_ADVANCED_ARTICLES_DATA;
assert.equal(lesson.topics.length, 31);
assert.equal(lesson.questions.length, 120);
assert.deepEqual(Array.from(lesson.topics, ({ number }) => number), Array.from({ length: 31 }, (_, i) => i + 67));
assert.deepEqual(Array.from(lesson.questions, ({ number }) => number), Array.from({ length: 120 }, (_, i) => i + 151));
assert.match(lesson.appendix, /第十步/);
assert.deepEqual(Array.from(lesson.questions[49].answers), ["Ø", "an"]);
for (const topic of lesson.topics) {
  assert.ok(topic.title && topic.body && (topic.sourcePage > 0 || topic.sourceLine > 0));
  assert.doesNotMatch(topic.body, /worksheet|Golden Manual|Articles - Grammar Curation|之後出題/);
}
for (const question of lesson.questions) {
  assert.equal(question.prompt.split("_____").length - 1, question.answers.length, `Blank count: ${question.number}`);
  assert.ok(question.translation && question.completeSentence && (question.sourcePage > 0 || question.sourceLine > 0) && (question.answerSourcePage > 0 || question.answerSourceLine > 0));
  assert.equal(question.steps.length, 7, `Seven steps: ${question.number}`);
  assert.ok(question.steps.every(({ title, body }) => title && body));
}
assert.match(html, /grammar-advanced-articles-data\.js\?v=20261012-advanced1/);
assert.match(html, /grammar-advanced-articles\.js\?v=[A-Za-z0-9-]+/);
assert.match(css, /\.grammar-lesson-card--advanced-articles::after/);
assert.match(sql, /p_question_number not between 151 and 270/);
assert.match(sql, /auth\.uid\(\) is null/);
assert.match(sql, /advanced-articles:q/);
assert.match(sql, /grant execute on function public\.grammar_advanced_articles_record_completion[\s\S]*to authenticated/);
assert.match(workflow, /node tools\/test-grammar-advanced-articles-system\.mjs/);

const require = createRequire(new URL("./email-qa/package.json", import.meta.url));
const { JSDOM } = require("jsdom");
function makeDom(url) {
  const dom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><div class="learning-portal-empty"></div></section></main>', {
    runScripts: "outside-only", pretendToBeVisual: true, url
  });
  const w = dom.window;
  w.HTMLElement.prototype.scrollIntoView = function () {};
  for (const source of [tenseData, tenseGuide, articleData, advancedData, extensionData, tenseRuntime, articleRuntime, advancedRuntime]) w.eval(source);
  return dom;
}
function submit(w, value) {
  const form = w.document.querySelector("[data-advanced-articles-form]");
  form.querySelector("input").value = value;
  form.dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  return w.document.querySelector("[data-advanced-articles-feedback]").dataset.state;
}
const dom = makeDom("https://example.test/grammar-system.html");
const w = dom.window, d = w.document;
const card = d.querySelector(".grammar-lesson-card--advanced-articles");
assert.ok(card, "Module 3 card exists");
assert.ok(card.previousElementSibling.classList.contains("grammar-lesson-card--articles"), "Module 3 follows Module 2");
const mockTopics = [...d.querySelectorAll("[data-advanced-articles-topic]")];
mockTopics.forEach((topic, index) => { topic.getBoundingClientRect = () => ({ top: 1000 + index * 200 - w.scrollY }); });
card.querySelector("[data-advanced-articles-open]").click();
const guide = d.querySelector("[data-advanced-articles-curation]");
assert.equal(guide.hidden, false);
assert.match(w.location.search, /lesson=advanced-articles&view=curation/);
const topics = [...guide.querySelectorAll("[data-advanced-articles-topic]")];
assert.equal(topics.length, 32, "31 rules and updated decision map");
assert.match(topics[1].querySelector("h3").textContent, /enough/);
assert.equal(topics[0].dataset.scrollVisible, "true");
assert.equal(topics[1].dataset.scrollVisible, "false");
Object.defineProperty(w, "scrollY", { configurable: true, writable: true, value: 1500 });
w.dispatchEvent(new w.Event("scroll"));
assert.equal(topics[1].dataset.scrollVisible, "true");
w.scrollY = 0;
w.dispatchEvent(new w.Event("scroll"));
assert.equal(topics[1].dataset.scrollVisible, "false", "scroll up hides later rule");
guide.querySelector("[data-advanced-articles-start]").click();
const practice = d.querySelector("[data-advanced-articles-practice]");
assert.equal(practice.hidden, false);
assert.equal(guide.hidden, true);
assert.equal(d.querySelector("[data-advanced-articles-number]").textContent, "QUESTION 151 / 270");
assert.equal(submit(w, "x"), "correct", "x means no article");
assert.equal(practice.querySelectorAll("[data-step-number]").length, 7);
const steps = [...practice.querySelectorAll("[data-step-number]")];
assert.equal(steps[1].hidden, true);
steps.forEach((step, index) => { step.getBoundingClientRect = () => ({ top: 1000 + index * 200 - w.scrollY }); });
w.scrollY = 0;
practice.querySelector('[data-advanced-articles-mode="scroll"]').click();
assert.equal(steps[1].hidden, false);
assert.equal(steps[1].dataset.scrollVisible, "false");
w.scrollY = 1600;
w.dispatchEvent(new w.Event("scroll"));
assert.equal(steps[1].dataset.scrollVisible, "true");
w.scrollY = 0;
w.dispatchEvent(new w.Event("scroll"));
assert.equal(steps[1].dataset.scrollVisible, "false");
practice.querySelector('[data-advanced-articles-mode="step"]').click();
assert.equal(steps[1].hidden, true);
steps[0].querySelector("[data-advanced-articles-reveal-step]").click();
assert.equal(steps[1].hidden, false);

const multi = makeDom("https://example.test/grammar-system.html?lesson=advanced-articles&view=practice&question=200");
assert.equal(multi.window.document.querySelector("[data-advanced-articles-practice]").hidden, false);
assert.equal(multi.window.document.querySelector("[data-advanced-articles-number]").textContent, "QUESTION 200 / 270");
assert.equal(submit(multi.window, "x / an"), "correct", "both blanks accepted in order");
assert.equal(submit(multi.window, "Maya took part in the event and later played an important part in organising the next one."), "correct", "completed sentence accepted");
assert.equal(submit(multi.window, "an / x"), "wrong", "reversed answers rejected");
const last = makeDom("https://example.test/grammar-system.html?lesson=advanced-articles&view=practice&question=270");
assert.equal(last.window.document.querySelector("[data-advanced-articles-next]").disabled, true);
assert.equal(last.window.document.querySelector("[data-advanced-articles-number]").textContent, "QUESTION 270 / 270");
console.log("Advanced Articles checks passed: 31 rules, 120 questions, direct routes, reversible scrolling, and two-blank grading.");
