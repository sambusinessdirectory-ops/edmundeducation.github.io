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

const [indexSource, contentSource, html, css, client, examResources, sitemap, workflow] =
  await Promise.all([
    read("ielts-reading-analysis-index.js"),
    read("ielts-reading-analysis-content.js"),
    read("ielts-reading-analysis.html"),
    read("ielts-reading-analysis.css"),
    read("ielts-reading-analysis.js"),
    read("exam-resources.html"),
    read("sitemap.xml"),
    read(".github/workflows/pages.yml"),
  ]);

const index = loadBrowserData(
  indexSource,
  "EDMUND_IELTS_READING_ANALYSIS_INDEX",
);
const content = loadBrowserData(
  contentSource,
  "EDMUND_IELTS_READING_ANALYSIS_CONTENT",
);

const records = Object.values(index.passages).flat();
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

const supportedBlockKinds = new Set(["paragraph", "label", "quote", "comparison", "bullet"]);
for (const question of article.questions) {
  assert.equal(question.answerKey, article.answerKey[question.number - 1]);
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
  "Passage 1",
  "搜尋文章名稱",
  "答案表",
]) {
  assert.ok(html.includes(required), `page is missing ${required}`);
}
const indexScript = html.indexOf("ielts-reading-analysis-index.js");
const contentScript = html.indexOf("ielts-reading-analysis-content.js");
const clientScript = html.indexOf("ielts-reading-analysis.js");
assert.ok(indexScript < contentScript && contentScript < clientScript, "scripts load out of order");
assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
assert.match(html, /rel="canonical" href="https:\/\/edmundeducation\.com\/ielts-reading-analysis\.html"/);
assert.match(css, /\.reading-toolbar\s*\{[\s\S]*?position:\s*fixed/);
assert.match(
  css,
  /scroll-margin-top:\s*calc\(var\(--toolbar-offset\) \+ env\(safe-area-inset-top, 0px\)\)/,
);

assert.match(client, /function normalise\(/);
assert.match(client, /\[1, 2, 3\]/, "all three passage selectors must be rendered");
assert.match(client, /Intl\.Collator/);
assert.match(client, /normalise\(record\.title\)\.includes\(needle\)/);
assert.match(client, /history\[replace \? "replaceState" : "pushState"\]/);
assert.match(client, /url\.hash = "";/, "new routes must clear stale question anchors");
assert.match(client, /prompt\.lang = "en";/, "English prompts need a language tag");
assert.doesNotMatch(client, /record\.sourceOrder|\$\{\s*record\.sourceOrder\s*\}/, "source numbering leaked into UI renderer");

assert.match(
  examResources,
  /href="ielts-reading-analysis\.html">IELTS 閱讀理解 - 解卷分析<\/a>/,
);
assert.equal(
  (sitemap.match(/https:\/\/edmundeducation\.com\/ielts-reading-analysis\.html/g) || []).length,
  1,
  "sitemap should contain one canonical analysis URL",
);
assert.match(workflow, /node tools\/test-ielts-reading-analysis\.mjs/);

console.log("IELTS Reading analysis checks passed: 507 catalogue titles and 14 Mungo Man questions.");
