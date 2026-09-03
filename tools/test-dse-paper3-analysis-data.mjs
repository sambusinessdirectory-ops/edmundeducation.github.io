#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const dataPath = path.join(siteDir, "dse-paper3-analysis-data.js");
const source = fs.readFileSync(dataPath, "utf8");
const context = { window: {} };

vm.runInNewContext(source, context, { filename: dataPath });

const data = context.window.EDMUND_DSE_PAPER3_DATA;
assert.ok(data, "generated Paper 3 data global should exist");

assert.deepEqual(
  Array.from(data.years),
  [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012],
  "years should cover 2012-2026 in descending order"
);

assert.deepEqual(
  Object.keys(data.resources),
  ["2025-b2"],
  "the generated inventory should expose only the 2025-b2 resource"
);

const resource = data.resources["2025-b2"];
assert.equal(resource.year, 2025);
assert.equal(resource.level, "B2");

assert.equal(resource.modelEssays.length, 3, "there should be exactly three benchmark essays");
assert.deepEqual(
  Array.from(resource.modelEssays, ({ id, task, page, title }) => ({ id, task, page, title })),
  [
    { id: "task-1", task: "Task 1", page: 2, title: "A Relaxing and Rewarding Wellness Month" },
    { id: "task-2", task: "Task 2", page: 3, title: "Proposal on Sports Day at the Beach" },
    { id: "task-3", task: "Task 3", page: 4, title: "Letter to Parents - Wellness Month Volunteers" }
  ],
  "essay identities and PDF order should remain stable"
);

for (const essay of resource.modelEssays) {
  assert.ok(Array.isArray(essay.blocks) && essay.blocks.length >= 7, `${essay.id} should contain its complete clean text`);
  assert.ok(essay.blocks.every((block) => typeof block === "string" && block.trim()), `${essay.id} blocks should be non-empty strings`);
}

const essayText = resource.modelEssays.map((essay) => essay.blocks.join("\n")).join("\n");
assert.match(essayText, /Three Returning Highlights/);
assert.match(essayText, /What Students Said Last Year/);
assert.match(essayText, /Sepak Takraw and Kabaddi/);
assert.match(essayText, /Cafeteria Beach/);
assert.match(essayText, /sign up through the school app/);
assert.match(essayText, /President, Healthy Living Club/);

const expectedSectionTitles = [
  "分析方法、三項任務與 Situation",
  "Listening note-taking sheet",
  "Email from Mr John Duncan to Nico Lin (boss letter)",
  "Emails between Mr John Duncan and Ms Melissa Henley",
  "Email attachment - poster for Wellness Month 2024",
  "Transcript of an interview during the 2024 Wellness Month",
  "WhatsApp chat between Ms Melissa Henley and Dr David Chan",
  "Emails between Mr John Duncan and Mr Manraj Singh",
  "Email attachment - 'The Influator' blog",
  "Email from Mr John Duncan to Ms Melissa Henley",
  "Email attachment - a magazine article on sports",
  "PODCAST Recording Transcript",
  "最後整合核心答案"
];

assert.equal(resource.analysisSections.length, 13, "there should be exactly thirteen Data File sections");
assert.deepEqual(
  Array.from(resource.analysisSections, (section) => section.title),
  expectedSectionTitles,
  "Data File sections should retain the verified PDF order and labels"
);
assert.deepEqual(
  Array.from(resource.analysisSections, (section) => section.order),
  Array.from({ length: 13 }, (_, index) => index + 1),
  "section order values should be contiguous"
);

const coveredPages = resource.analysisSections.flatMap((section) =>
  section.pages.map((page) => page.pageNumber)
);
const expectedPages = Array.from({ length: 87 }, (_, index) => index + 5);
assert.deepEqual(Array.from(coveredPages), expectedPages, "analysis sections should cover pages 5-91 in order");
assert.equal(new Set(coveredPages).size, coveredPages.length, "analysis page coverage should contain no duplicates");
assert.equal(Math.min(...coveredPages), 5, "analysis coverage should start on page 5");
assert.equal(Math.max(...coveredPages), 91, "analysis coverage should end on page 91");

for (const section of resource.analysisSections) {
  assert.equal(section.pageCount, section.pages.length, `${section.id} pageCount should match its page records`);
  assert.ok(section.pages.every((page) => page.blocks.length > 0), `${section.id} should not contain an empty extracted page`);
}

const firstSectionText = resource.analysisSections[0].pages
  .flatMap((page) => page.blocks)
  .join("\n");
assert.match(firstSectionText, /先定這一卷的 6 類標記/);
assert.match(firstSectionText, /類型1：Task 1 直接可用/);
assert.match(firstSectionText, /類型6：無關噪音/);
assert.match(firstSectionText, /Situation/);
assert.match(firstSectionText, /You are Nico Lin/);

const finalSectionText = resource.analysisSections.at(-1).pages
  .flatMap((page) => page.blocks)
  .join("\n");
assert.match(finalSectionText, /最後整合核心答案/);
assert.match(finalSectionText, /Task 1：校刊文章/);
assert.match(finalSectionText, /Task 2：proposal/);
assert.match(finalSectionText, /Task 3：寫信給家長招募義工/);

assert.doesNotMatch(
  JSON.stringify(data),
  /[\u2018\u2019\u201B\u2032\uFF07]/,
  "all apostrophes should be normalized to ASCII apostrophes"
);

console.log("DSE Paper 3 analysis data regression checks passed.");
