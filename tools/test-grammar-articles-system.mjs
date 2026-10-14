import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [tenseData, tenseGuide, tenseRuntime, articlesData, articlesRuntime, css, sql, workflow] = await Promise.all([
  read("grammar-tense-data.js"), read("grammar-tense-curation-data.js"), read("grammar-system.js"), read("grammar-articles-data.js"),
  read("grammar-articles.js"), read("grammar-system.css"), read("supabase-grammar-articles-progress.sql"),
  read(".github/workflows/pages.yml")
]);
const context = { window: {} };
vm.createContext(context);
vm.runInContext(articlesData, context);
const lesson = context.window.EDMUND_GRAMMAR_ARTICLES_DATA;
assert.equal(lesson.topics.length, 66);
assert.equal(lesson.questions.length, 150);
assert.deepEqual(Array.from(lesson.topics, (item) => item.number), Array.from({ length: 66 }, (_, index) => index + 1));
assert.deepEqual(Array.from(lesson.questions, (item) => item.number), Array.from({ length: 150 }, (_, index) => index + 1));
assert.deepEqual(Array.from(lesson.questions, (item) => item.answer).reduce((counts, answer) => {
  counts[answer] = (counts[answer] || 0) + 1; return counts;
}, {}), { a: 24, an: 13, the: 62, "Ø": 51 });
for (const topic of lesson.topics) {
  assert.ok(topic.title && topic.body && topic.sourcePage > 0);
  assert.doesNotMatch(topic.body, /Golden Manual|(?:你的?|你提供的)\s*(?:worksheet|圖片中有)|source material/);
}
for (const question of lesson.questions) {
  assert.ok(question.prompt.includes("_____"), `Question ${question.number}: missing blank`);
  assert.ok(question.translation && question.completeSentence && question.sourcePage > 0 && question.answerSourcePage > 0);
  assert.equal(question.steps.length, 7, `Question ${question.number}: seven steps required`);
  assert.ok(question.steps.every((step) => step.title && step.body));
}
assert.match(css, /\.grammar-articles-topic\[data-scroll-visible="true"\]/);
assert.match(sql, /auth\.uid\(\) is null/);
assert.match(sql, /articles:q/);
assert.match(sql, /grant execute on function public\.grammar_articles_record_completion[\s\S]*to authenticated/);
assert.doesNotMatch(sql, /grant execute[\s\S]*to anon/);
assert.match(workflow, /node tools\/test-grammar-articles-system\.mjs/);

const require = createRequire(new URL("./email-qa/package.json", import.meta.url));
const { JSDOM } = require("jsdom");
const makeDom = (url) => {
  const dom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><div class="learning-portal-empty"></div></section></main>', {
    runScripts: "outside-only", pretendToBeVisual: true, url
  });
  const { window: w } = dom;
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.eval(tenseData);
  w.eval(tenseGuide);
  w.eval(articlesData);
  w.eval(tenseRuntime);
  w.eval(articlesRuntime);
  return dom;
};

const dom = makeDom("https://example.test/grammar-system.html");
const w = dom.window, d = w.document;
const card = d.querySelector(".grammar-lesson-card--articles");
assert.ok(card, "Articles appears after Tense in the module library");
assert.equal(card.previousElementSibling.classList.contains("grammar-lesson-card"), true);
Object.defineProperty(w, "scrollY", { configurable: true, writable: true, value: 0 });
const mockTopics = [...d.querySelectorAll("[data-articles-topic]")];
mockTopics.forEach((topic, index) => { topic.getBoundingClientRect = () => ({ top: 1000 + index * 200 - w.scrollY }); });
card.querySelector("[data-articles-open]").click();
const curation = d.querySelector("[data-articles-curation]");
assert.equal(curation.hidden, false, "the module opens to curation");
assert.equal(d.querySelector("[data-articles-practice]").hidden, true);
assert.match(w.location.search, /view=curation/);
const topics = [...curation.querySelectorAll("[data-articles-topic]")];
assert.equal(topics.length, 67, "66 source topics plus decision map");
assert.equal(topics[66].querySelectorAll(".grammar-articles-map__choice").length, 3);
assert.equal(topics[66].querySelectorAll(".grammar-articles-map__checks li").length, 5);
assert.match(topics[66].querySelector("details").textContent, /the United Kingdom|the shopping mall near Mong Kok/);
const schoolTopic = topics[31];
assert.match(schoolTopic.querySelector(".grammar-articles-topic__focus").textContent, /本來用途/);
assert.equal(schoolTopic.querySelectorAll(".grammar-articles-example").length, 5);
assert.equal(schoolTopic.querySelector(".grammar-articles-topic__details").open, false);
assert.match(schoolTopic.querySelector(".grammar-articles-topic__details").textContent, /He should be back at Ø school tomorrow/);
assert.ok(schoolTopic.querySelectorAll(".grammar-articles-ink").length > 0);
assert.equal(topics.slice(0, 66).filter((topic) => topic.querySelector("h3").textContent === topic.querySelector(".grammar-articles-topic__focus p").textContent).length, 0, "highlights should add information, not repeat headings");
assert.doesNotMatch(topics[60].querySelector(".grammar-articles-topic__examples")?.textContent || "", /a bad flu/);
assert.match(topics[61].querySelector(".grammar-articles-topic__focus").textContent, /語境/);
assert.ok(topics[64].querySelector(".grammar-articles-example__warning"), "incorrect examples must be visibly labelled");
assert.equal(topics[0].dataset.scrollVisible, "true");
assert.equal(topics[1].dataset.scrollVisible, "false", "later curation starts hidden");
w.scrollY = 1500;
w.dispatchEvent(new w.Event("scroll"));
assert.equal(topics[1].dataset.scrollVisible, "true", "scrolling down reveals more curation");
w.scrollY = 0;
w.dispatchEvent(new w.Event("scroll"));
assert.equal(topics[1].dataset.scrollVisible, "false", "scrolling up hides later curation again");

curation.querySelector("[data-articles-start]").click();
const practice = d.querySelector("[data-articles-practice]");
assert.equal(practice.hidden, false);
assert.equal(curation.hidden, true);
assert.equal(d.querySelector("[data-articles-number]").textContent, "QUESTION 1 / 150");
const input = practice.querySelector("[data-articles-form] input");
input.value = "a";
practice.querySelector("[data-articles-form]").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
assert.equal(practice.querySelector("[data-articles-feedback]").dataset.state, "correct");
assert.equal(practice.querySelectorAll("[data-step-number]").length, 7);
assert.equal(practice.querySelector("[data-step-number='2']").hidden, true);
const steps = [...practice.querySelectorAll("[data-step-number]")];
steps.forEach((step, index) => { step.getBoundingClientRect = () => ({ top: 1000 + index * 200 - w.scrollY }); });
w.scrollY = 0;
practice.querySelector("[data-articles-mode='scroll']").click();
assert.equal(steps[1].hidden, false);
assert.equal(steps[1].dataset.scrollVisible, "false");
w.scrollY = 1600;
w.dispatchEvent(new w.Event("scroll"));
assert.equal(steps[1].dataset.scrollVisible, "true");
w.scrollY = 0;
w.dispatchEvent(new w.Event("scroll"));
assert.equal(steps[1].dataset.scrollVisible, "false", "later explanation re-hides on scroll-up");
practice.querySelector("[data-articles-mode='step']").click();
assert.equal(steps[1].hidden, true, "step mode still requires acknowledgement");
steps[0].querySelector("[data-articles-reveal-step]").click();
assert.equal(steps[1].hidden, false);

practice.querySelector("[data-articles-range]").value = "26";
practice.querySelector("[data-articles-range]").dispatchEvent(new w.Event("change"));
assert.equal(d.querySelector("[data-articles-number]").textContent, "QUESTION 26 / 150");
const noArticle = lesson.questions.find((question) => question.answer === "Ø");
practice.querySelector(`[data-articles-grid]`)?.querySelector("button");
const route = `https://example.test/grammar-system.html?lesson=articles&view=practice&question=${noArticle.number}`;
const direct = makeDom(route);
assert.equal(direct.window.document.querySelector("[data-articles-practice]").hidden, false);
assert.equal(direct.window.document.querySelector("[data-articles-number]").textContent, `QUESTION ${noArticle.number} / 150`);
assert.match(direct.window.location.search, /lesson=articles/, "Tense initialization preserves direct Articles route");
const directInput = direct.window.document.querySelector("[data-articles-form] input");
directInput.value = "x";
direct.window.document.querySelector("[data-articles-form]").dispatchEvent(new direct.window.Event("submit", { bubbles: true, cancelable: true }));
assert.equal(direct.window.document.querySelector("[data-articles-feedback]").dataset.state, "correct", "x is accepted for Ø");
console.log("Grammar Articles checks passed: 66 curation topics, 150 questions, reversible scrolling, answers, and direct routing.");
