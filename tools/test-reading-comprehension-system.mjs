#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [html, css, script, dataText, analysisText, audioManifest, sql, nav, progress, home, manifestText, bookmarkHtml, bookmarkScript] = await Promise.all([
  read("reading-comprehension.html"), read("reading-comprehension.css"), read("reading-comprehension.js"),
  read("reading-comprehension-data/p1-069-albert-einstein.json"), read("ielts-reading-analysis-data/p1-069-albert-einstein.json"),
  read("reading-comprehension-audio-manifest.js"), read("supabase-reading-comprehension.sql"),
  read("shared-system-nav.js"), read("student-progress-core.js"), read("index.html"), read("pwa-manifests/reading-comprehension.webmanifest"),
  read("bookmark-directory.html"), read("bookmark-directory.js")
]);
const data = JSON.parse(dataText); const analysis = JSON.parse(analysisText); const manifest = JSON.parse(manifestText);

assert.match(html, /Reading Comprehension<br><span>閱讀理解<\/span><br>學習系統/);
assert.match(html, /data-system="reading-comprehension"/);
assert.match(html, /data-progress-toggle/);
assert.match(html, /data-question-chart/);
assert.match(html, /data-time-chart/);
assert.match(html, /data-translation-all/);
assert.equal((html.match(/data-translation-paragraph=/g) || []).length, 5);
assert.match(html, /data-force-submit/);
assert.match(html, /data-submit-partial/);
assert.match(html, /data-analysis-bookmark/);
assert.doesNotMatch(html, /活潑英式女聲 · Kokoro/);
assert.equal((html.match(/data-passage-tab=/g) || []).length, 3);
assert.match(html, /data-hide-translations/);
assert.match(html, /data-skimming-bookmark/);
assert.match(html, /data-passage-bookmark/);
assert.match(html, /flashcards\.html\?deck=ielts%2Freading%2Fpassage-1%2FPractice%2069/);
assert.match(html, /model-essay-downloads\.html\?catalog=reading-passage-1&amp;item=63e1085c1daadcb8/);
assert.doesNotMatch(html, /<dialog/);
assert.match(css, /grid-template-columns:minmax\(0,1\.15fr\) minmax\(390px,\.85fr\)/);
assert.match(css, /@media\(max-width:1000px\)/);
assert.match(script, /flashcard_student_login/);
assert.match(script, /reading_comprehension_save_attempt/);
assert.match(script, /reading_comprehension_student_dashboard/);
assert.match(script, /learning_portal_set_bookmark/);
assert.match(script, /scrollIntoView\(\{ block: "center", behavior: "smooth" \}\)/);
assert.match(script, /data-play-paragraph/);
assert.match(script, /data-scan-question/);
assert.match(script, /answerTimings/);
assert.match(script, /interactive-word/);
assert.match(script, /if \(!submit && !Object\.keys\(state\.answers\)\.length && currentDuration\(\) === 0\) return null/);
assert.doesNotMatch(script.match(/async function openExercise\(\)[\s\S]*?\n\}/)?.[0] || "", /startTimer\(\)/);
assert.equal(data.paragraphs.length, 5);
assert.equal(data.questions.length, 13);
assert.ok(data.paragraphs.every((paragraph) => paragraph.translation && paragraph.translation !== paragraph.text));
assert.equal(analysis.answerKey.length, 13);
assert.equal(analysis.paragraphOverview.paragraphs.length, 5);
assert.match(audioManifest, /en-gb/);
assert.doesNotMatch(audioManifest, /voiceLabel|Kokoro-82M/);
assert.match(audioManifest, /"paragraphs":\[/);
assert.match(sql, /enable row level security/);
assert.match(sql, /flashcard_session_student_id/);
assert.match(sql, /_reading_comprehension_correct_answer/);
assert.match(sql, /readingComprehension/);
assert.match(sql, /reading-comprehension/);
assert.doesNotMatch(sql, /pg_catalog\.(?:greatest|nullif)/);
assert.match(nav, /id: "reading-comprehension"/);
assert.match(progress, /id: "readingComprehension"/);
assert.match(home, /href="reading-comprehension.html"/);
assert.match(bookmarkHtml, /data-type-filter/);
assert.match(bookmarkScript, /reading-content/);
assert.match(bookmarkScript, /Skimming Tips/);
assert.match(bookmarkScript, /答案解析/);
assert.equal(manifest.id, "/apps/reading-comprehension");
assert.equal(manifest.start_url, "/reading-comprehension.html?source=pwa");

const pathMatch = audioManifest.match(/"path":"([^"]+\.mp3)"/);
if (pathMatch) assert.ok((await stat(new URL(pathMatch[1], root))).size > 1000, "generated narration must be a real MP3");

console.log("Reading Comprehension portal, exercise, secure persistence, translations, analysis, progress, PWA and audio contracts validated.");
