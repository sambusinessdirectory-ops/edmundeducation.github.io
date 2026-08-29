#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

function loadBrowserData(source, variableName) {
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: variableName });
  return context.window[variableName];
}

const [indexSource, availabilitySource, contentSource, questionTypeSource, html, css, client, examResources, resources, sitemap, workflow] =
  await Promise.all([
    read("ielts-reading-analysis-index.js"),
    read("ielts-reading-analysis-availability.js"),
    read("ielts-reading-analysis-content.js"),
    read("ielts-reading-question-types.js"),
    read("ielts-reading-analysis.html"),
    read("ielts-reading-analysis.css"),
    read("ielts-reading-analysis.js"),
    read("exam-resources.html"),
    read("resources.html"),
    read("sitemap.xml"),
    read(".github/workflows/pages.yml"),
  ]);

const index = loadBrowserData(
  indexSource,
  "EDMUND_IELTS_READING_ANALYSIS_INDEX",
);
const availability = loadBrowserData(
  availabilitySource,
  "EDMUND_IELTS_READING_ANALYSIS_AVAILABILITY",
);
const content = loadBrowserData(
  contentSource,
  "EDMUND_IELTS_READING_ANALYSIS_CONTENT",
);
const questionTypeIndex = loadBrowserData(
  questionTypeSource,
  "EDMUND_IELTS_READING_QUESTION_TYPES",
);

assert.equal(questionTypeIndex.articleCount, 437);
assert.equal(questionTypeIndex.articles.length, 437);
assert.equal(questionTypeIndex.taxonomy.length, 14);
assert.equal(new Set(questionTypeIndex.taxonomy.map(({ id }) => id)).size, 14);
assert.ok(
  questionTypeIndex.taxonomy.every(({ nameEn, nameZh }) => nameEn.trim() && nameZh.trim()),
  "question types need bilingual labels",
);
assert.deepEqual(
  Array.from(
    questionTypeIndex.articles.find(({ id }) => id === "p1-002").types
      .find(({ id }) => id === "matching-headings").questionNumbers,
  ),
  [1, 2, 3, 4, 5, 6],
);

const records = Object.values(index.passages).flat();
assert.equal(availability.articles["mungo-man"].catalogueId, "p1-161");
assert.equal(availability.articles["if-you-can-get-used-to-the-taste"].catalogueId, "p1-092");
assert.equal(availability.articles["mungo-man"].source, "bundled");
assert.equal(availability.articles["if-you-can-get-used-to-the-taste"].source, "bundled");
assert.deepEqual(
  Object.fromEntries(
    Object.entries(index.passages).map(([passage, entries]) => [passage, entries.length]),
  ),
  { 1: 164, 2: 175, 3: 168 },
  "attached-PDF catalogue counts changed",
);
assert.equal(index.total, 507);
assert.equal(records.length, 507);
assert.equal(new Set(records.map(({ id }) => id)).size, 507, "catalogue IDs must be unique");
assert.ok(records.every(({ title }) => title.trim()), "catalogue titles must not be blank");

const byId = new Map(records.map((record) => [record.id, record]));
assert.equal(byId.get("p1-161")?.title, "Mungo Man");
assert.equal(
  byId.get("p3-049")?.title,
  "Theory or Practice? —What is the point of research carried out by biz schools?",
);
assert.equal(
  byId.get("p3-172")?.title,
  "Why Do We Touch Strangers So Much? A History Of The Handshake Offers Clues",
);

const article = content.articles["mungo-man"];
assert.ok(article, "Mungo Man analysis is missing");
assert.equal(article.catalogueId, "p1-161");
assert.equal(article.passage, 1);
assert.equal(article.questionCount, 14);
assert.deepEqual(
  Array.from(article.answerKey),
  ["A", "E", "A", "B", "C", "D", "B", "A", "TRUE", "NOT GIVEN", "TRUE", "FALSE", "TRUE", "NOT GIVEN"],
);
assert.deepEqual(
  Array.from(article.questions, ({ number }) => number),
  Array.from({ length: 14 }, (_, index) => index + 1),
);

const tasteArticle = content.articles["if-you-can-get-used-to-the-taste"];
assert.ok(tasteArticle, "If You Can Get Used to the Taste analysis is missing");
assert.equal(tasteArticle.catalogueId, "p1-092");
assert.equal(tasteArticle.passage, 1);
assert.equal(tasteArticle.questionCount, 13);
assert.deepEqual(
  Array.from(tasteArticle.answerKey),
  ["FALSE", "TRUE", "FALSE", "NOT GIVEN", "calcium", "Thailand", "indigenous Africans", "mopane leaves", "southern China", "arachnids", "D", "A", "D"],
);
assert.deepEqual(
  Array.from(tasteArticle.questions, ({ number }) => number),
  Array.from({ length: 13 }, (_, index) => index + 1),
);
assert.equal(tasteArticle.paragraphOverview.paragraphs.length, 7);
assert.deepEqual(
  Array.from(tasteArticle.paragraphOverview.paragraphs, ({ number }) => number),
  [1, 2, 3, 4, 5, 6, 7],
);
assert.ok(
  tasteArticle.paragraphOverview.paragraphs.every(({ summary }) => summary.trim().length > 100),
  "the seven-paragraph skim roadmap is incomplete",
);
assert.equal(tasteArticle.questions[0].prompt, "“The French are well known for eating insects.”");
assert.equal(tasteArticle.questions[12].answer, "D — probably eats rice weevil larvae");
assert.ok(contentSource.includes("most famously by the French"));
assert.ok(contentSource.includes("phenomenal rate at which insects breed"));
assert.ok(contentSource.includes("rice-weevil larvae"));

const supportedBlockKinds = new Set(["paragraph", "label", "quote", "comparison", "bullet"]);
for (const question of [...article.questions, ...tasteArticle.questions]) {
  const owningArticle = question === article.questions[question.number - 1]
    ? article
    : tasteArticle;
  assert.equal(question.answerKey, owningArticle.answerKey[question.number - 1]);
  assert.ok(question.answer.trim(), `Q${question.number}: answer missing`);
  assert.ok(question.prompt.trim(), `Q${question.number}: prompt missing`);
  assert.ok(question.translation.trim(), `Q${question.number}: translation missing`);
  assert.ok(question.sections.length >= 5, `Q${question.number}: analysis is incomplete`);
  assert.equal(
    new Set(question.sections.map(({ id }) => id)).size,
    question.sections.length,
    `Q${question.number}: duplicate section IDs`,
  );
  for (const section of question.sections) {
    assert.ok(section.title.trim(), `Q${question.number}/${section.id}: title missing`);
    assert.ok(section.blocks.length, `Q${question.number}/${section.id}: no content`);
    for (const block of section.blocks) {
      assert.ok(supportedBlockKinds.has(block.kind), `unsupported block kind ${block.kind}`);
      if (block.kind === "comparison") {
        assert.ok(block.from.trim() && block.to.trim(), "comparison needs both sides");
      } else {
        assert.ok(block.text.trim(), "text block is blank");
        assert.doesNotMatch(block.text, /^。/, "paragraph starts with a detached full stop");
        if (block.kind === "label") {
          assert.doesNotMatch(block.text, /。/, "label swallowed a full explanatory sentence");
        }
        if (block.kind === "quote") {
          assert.doesNotMatch(block.text, /改寫關係|若原文寫/, "quote swallowed surrounding analysis");
        }
      }
    }
  }
}

for (const required of [
  "離開",
  "上一頁",
  "主頁",
  "文章目錄",
  "By Question Type",
  "Passage 1",
  "搜尋文章名稱",
  "答案表",
]) {
  assert.ok(html.includes(required), `page is missing ${required}`);
}
const indexScript = html.indexOf("ielts-reading-analysis-index.js");
const availabilityScript = html.indexOf("ielts-reading-analysis-availability.js");
const contentScript = html.indexOf("ielts-reading-analysis-content.js");
const questionTypeScript = html.indexOf("ielts-reading-question-types.js");
const clientScript = html.indexOf("ielts-reading-analysis.js");
assert.ok(
  indexScript < availabilityScript
    && availabilityScript < contentScript
    && contentScript < questionTypeScript
    && questionTypeScript < clientScript,
  "scripts load out of order",
);
assert.match(html, /<script type="module" src="ielts-reading-analysis\.js/);
assert.match(html, /rel="manifest" href="\/pwa-manifests\/ielts-reading-analysis\.webmanifest"/);
assert.match(html, /rel="canonical" href="https:\/\/edmundeducation\.com\/ielts-reading-analysis\.html"/);
assert.match(html, /data-article-overview hidden/);
assert.match(html, /data-overview-list/);
assert.match(html, /data-view="question-types"/);
assert.match(html, /data-question-type-search/);
assert.match(html, /data-question-type-results/);
assert.match(css, /\.reading-toolbar\s*\{[\s\S]*?position:\s*fixed/);
assert.match(css, /\.question-type-chip\s*\{/);
assert.match(css, /\.question-type-result-card\s*\{/);
assert.match(
  css,
  /scroll-margin-top:\s*calc\(var\(--toolbar-offset\) \+ env\(safe-area-inset-top, 0px\)\)/,
);

assert.match(client, /function normalise\(/);
assert.match(client, /\[1, 2, 3\]/, "all three passage selectors must be rendered");
assert.match(client, /Intl\.Collator/);
assert.match(client, /normalise\(record\.title\)\.includes\(needle\)/);
assert.match(client, /history\[replace \? "replaceState" : "pushState"\]/);
assert.match(client, /createArticleRepository/);
assert.match(client, /articleRepository\.availabilityForCatalogueId/);
assert.match(client, /async function applyRoute\(\)/);
assert.match(client, /params\.get\("view"\)/);
assert.match(client, /url\.searchParams\.set\("view", "question-types"\)/);
assert.match(client, /questionTypeIndex\.umbrellaAliases/);
assert.match(client, /reading-comprehension\.html\?article=/);
assert.match(client, /"開始閱讀練習"/);
assert.match(client, /url\.hash = "";/, "new routes must clear stale question anchors");
assert.match(client, /prompt\.lang = "en";/, "English prompts need a language tag");
assert.match(client, /function renderArticleOverview\(/);
assert.match(client, /String\(sectionIndex \+ 1\)/, "step numbers must follow each question's real section order");
assert.match(css, /\.analysis-step-number\s*\{/);
assert.doesNotMatch(client, /record\.sourceOrder|\$\{\s*record\.sourceOrder\s*\}/, "source numbering leaked into UI renderer");

assert.equal(
  (examResources.match(/href="ielts-reading-analysis\.html">Start Free<\/a>/g) || []).length,
  1,
  "the IELTS Start Free button should open the IELTS Reading analysis catalogue directly",
);
assert.equal(
  (resources.match(/href="ielts-reading-analysis\.html"/g) || []).length,
  1,
  "resources.html should expose one IELTS analysis entry after Start Free",
);
assert.equal(
  (sitemap.match(/https:\/\/edmundeducation\.com\/ielts-reading-analysis\.html/g) || []).length,
  1,
  "sitemap should contain one canonical analysis URL",
);
assert.match(workflow, /node tools\/test-ielts-reading-analysis\.mjs/);

console.log("IELTS Reading checks passed: 507 analysis titles plus 437 practices across 14 bilingual question types.");
