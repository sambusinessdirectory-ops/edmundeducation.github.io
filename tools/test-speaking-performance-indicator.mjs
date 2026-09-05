import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = new URL("../", import.meta.url);
const scriptPath = new URL("speaking-performance-indicator.js", root);
const cssPath = new URL("speaking-performance-indicator.css", root);
const script = await readFile(scriptPath, "utf8");
const css = await readFile(cssPath, "utf8");

const expectedContent = [
  "Idea / Topic Sentence", "Explanation", "Example", "Conclusion", "Contextual Reference"
];
const expectedLanguage = [
  "Parallelism / Juxtaposition 並置",
  "Rule of Three 排比",
  "Modal 情態 (Can / Could / Should / Would)",
  "Comparatives 比較句 (more / less)",
  "Contrast 內容對比 (Young vs Old, Past vs Future etc.)",
  "Adjectives / Adverbs",
  "Negative statements 否定句",
  "Personification 擬人句",
  "Reification 擬物句",
  "Simile 明喻",
  "Metaphor 暗喻",
  "Metonymy / Synecdoche 借代",
  "Double literary devices 雙重修辭 (e.g., 並置並置 / 並置排比 etc.)",
  "Phrasal Verbs 動詞片語",
  "Although / Even though / Even if -- (Concession 讓步句)",
  "Precise Vocabulary"
];

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body>
    <div data-view-content>
      <article class="exam-practice-view">
        <header class="exam-progress-card"><strong>Part 1 · 第 1 / 12 題</strong></header>
        <section class="exam-question-card"><h1>Do you play a musical instrument?</h1></section>
        <section class="exam-answer-recorder"><span class="cue-label">YOUR ANSWER · 你的回答</span></section>
      </article>
    </div>
  </body></html>`);
  await page.addScriptTag({ content: script });
  await page.locator("[data-performance-indicator]").waitFor();

  assert.equal(await page.locator(".performance-table-card").count(), 2);
  assert.equal(await page.locator("[data-performance-kind=content]").count(), 5);
  assert.equal(await page.locator("[data-performance-kind=language]").count(), 16);
  assert.deepEqual(
    await page.locator(".performance-content tbody th").allTextContents(),
    expectedContent.map((label, index) => `${index + 1}. ${label}`)
  );
  assert.deepEqual(
    await page.locator(".performance-language tbody th").allTextContents(),
    expectedLanguage.map((label, index) => `${index + 1}. ${label}`)
  );

  await page.locator("[data-performance-kind=content]").first().check();
  await page.locator("[data-performance-kind=language]").nth(15).check();
  assert.equal(await page.locator("[data-performance-count=content]").textContent(), "1 / 5");
  assert.equal(await page.locator("[data-performance-count=language]").textContent(), "1 / 16");
  assert.equal(await page.locator("tr.is-checked").count(), 2);

  await page.evaluate(() => {
    document.querySelector("[data-view-content]").innerHTML = `
      <article class="exam-practice-view">
        <header class="exam-progress-card"><strong>Part 1 · 第 1 / 12 題</strong></header>
        <section class="exam-question-card"><h1>Do you play a musical instrument?</h1></section>
        <section class="exam-answer-recorder"><span class="cue-label">YOUR ANSWER · 你的回答</span></section>
      </article>`;
  });
  await page.locator("[data-performance-indicator]").waitFor();
  assert.equal(await page.locator("input:checked").count(), 2, "Ticks survive a same-question re-render");

  await page.evaluate(() => {
    document.querySelector(".exam-progress-card strong").textContent = "Part 1 · 第 2 / 12 題";
    document.querySelector(".exam-question-card h1").textContent = "Why do you enjoy music?";
    document.querySelector(".exam-answer-recorder").replaceWith(
      Object.assign(document.createElement("section"), { className: "exam-answer-recorder" })
    );
  });
  await page.locator("[data-performance-indicator]").waitFor();
  assert.equal(await page.locator("input:checked").count(), 0, "A new question starts with a clean checklist");

  await page.evaluate(() => {
    document.querySelector("[data-view-content]").innerHTML = `
      <article class="exam-practice-view dse-practice-view">
        <header class="dse-practice-header"><h1>2023 · Set 1</h1><h2>Discussion</h2></header>
        <section class="dse-single-question"><h2>What should schools do?</h2></section>
        <section class="recorder-card"></section>
      </article>`;
  });
  await page.locator(".dse-practice-view [data-performance-indicator]").waitFor();
  assert.match(await page.locator(".dse-practice-view .cue-label").textContent(), /YOUR ANSWER/);
  assert.equal(await page.locator(".dse-practice-view input").count(), 21);

  await page.evaluate(() => {
    document.querySelector("[data-view-content]").innerHTML =
      '<article class="exercise-view"><section class="recorder-card"></section></article>';
  });
  await page.waitForTimeout(50);
  assert.equal(await page.locator("[data-performance-indicator]").count(), 0, "Normal practice is unchanged");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    document.querySelector("[data-view-content]").innerHTML = `
      <article class="exam-practice-view dse-practice-view">
        <header class="dse-practice-header"><h1>2023 · Set 1</h1></header>
        <section class="dse-single-question"><h2>What should schools do?</h2></section>
        <section class="admin-recorder-notice"></section>
      </article>`;
  });
  await page.locator(".dse-practice-view [data-performance-indicator]").waitFor();
  assert.equal(
    await page.locator("[data-performance-indicator]").evaluate(node => node.scrollWidth <= node.clientWidth + 1),
    true,
    "No horizontal overflow on phone"
  );
  await page.screenshot({ path: "/private/tmp/speaking-indicator-mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log("Speaking performance indicator passed: exact 5 content + 16 language items, live toggles, re-render retention, DSE/IELTS exam scoping and mobile layout.");
} finally {
  await browser.close();
}
