#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const [html, css, script, catalogue, worker, home] = await Promise.all([
  read("listening-system.html"),
  read("listening-system.css"),
  read("listening-system.js"),
  read("listening-system-catalog.js"),
  read("workers/edmund-audio/src/index.js"),
  read("index.html")
]);

assert.match(html, /data-system="listening"/);
assert.match(html, /DSE Paper 3 Part A 聆聽/);
assert.match(html, /IELTS 聆聽/);
assert.match(html, /Practice 1 → 20/);
assert.match(html, /Practice 20 → 1/);
assert.match(html, /2026 → 2012/);
assert.match(html, /2012 → 2026/);
assert.match(html, /dse-listening-2023-data\.js/);
assert.match(html, /dse-listening-2023-transcript\.js/);
assert.match(html, /dse-listening-2016-data\.js/);
assert.match(html, /dse-listening-2016-transcript\.js/);
assert.match(html, /dse-listening-2021-data\.js/);
assert.match(html, /dse-listening-2021-transcript\.js/);
assert.match(html, /data-dse-year-grid/);
assert.match(html, /data-dse-workspace/);
assert.match(html, /listening-system-catalog\.js/);
assert.match(html, /listening-practice-1-analysis\.js/);
assert.match(html, /data-floating-audio/);
assert.match(html, /data-answer-analysis-dialog/);
assert.match(html, /shared-system-nav\.js/);
assert.match(html, /class="login-hero-copy"/);
assert.match(css, /writing-mode:\s*horizontal-tb/);
assert.match(css, /word-break:\s*keep-all/);
assert.match(script, /flashcard_student_login/);
assert.match(script, /flashcard_student_session_profile/);
assert.match(script, /Array\.isArray\(payload\?\.tracks\)/);
assert.match(script, /payload\?\.dseTracks/);
assert.match(script, /renderDseYearGrid/);
assert.match(script, /renderDseTask/);
assert.match(script, /data-dse-audio-task/);
assert.match(script, /const SPEEDS = Object\.freeze\(\[0\.25, 0\.5, 0\.75, 1, 1\.25, 1\.5, 1\.75, 2\]\)/);
assert.match(script, /audio\.playbackRate = state\.speed/);
assert.match(script, /setPartAnswersVisibility/);
assert.match(script, /renderAnalysisSection/);
assert.match(script, /updateFloatingAudio/);
assert.match(catalogue, /const practiceNumbers = \[/);
assert.match(catalogue, /Array\.from\(\{ length: 4 \}/);
assert.match(catalogue, /Array\.from\(\{ length: 15 \}/);
assert.match(catalogue, /\[2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2023\]\.includes\(year\)/);
assert.match(catalogue, /listening-system\.html\?section=ielts&practice=/);
assert.match(worker, /\/v1\/listening\/catalog/);
assert.match(worker, /IELTS Listening - Recordings\//);
assert.match(worker, /DSE Listening - Recordings\//);
assert.match(worker, /dseTracks:/);
assert.doesNotMatch(html, /Cloudflare|R2/);
assert.doesNotMatch(script, /Cloudflare|R2|formatMegabytes|\.size\b/);
assert.doesNotMatch(script, /可以登入|共用學生帳戶/);
assert.match(worker, /tracks:\s*unique\.map\(\(\{ practice, part, url \}\)/);
assert.doesNotMatch(
  worker.match(/return jsonResponse\(\{[\s\S]*?\}, 200, "public, max-age=300/)?.[0] || "",
  /\b(?:prefix|duplicates|unmapped)\s*:/
);

const scheduleIndex = home.indexOf('href="schedule-system.html"');
const flashcardIndex = home.indexOf('href="flashcards.html"');
const parentIndex = home.indexOf('href="parent-communication.html"');
const listeningIndex = home.indexOf('href="listening-system.html"');
assert.ok(scheduleIndex >= 0 && flashcardIndex > scheduleIndex, "Schedule must precede Flashcards after the ordinal swap");
assert.ok(parentIndex > flashcardIndex && listeningIndex > parentIndex, "Parent and Listening portals must follow Flashcards in the requested order");

console.log("Listening portal, complete DSE archive catalogue contract, playback speeds, and homepage order validated.");
