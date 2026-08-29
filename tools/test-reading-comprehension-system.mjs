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
assert.match(html, /data-view="reading-home"/);
assert.match(html, /data-enter-dse/);
assert.match(html, /data-enter-ielts/);
assert.match(html, /reading-system-choice-grid" role="group" aria-label="閱讀理解系統選擇"/);
assert.match(html, /DSE 閱讀理解/);
assert.match(html, /IELTS 閱讀理解/);
assert.match(html, /data-view="dse-placeholder"/);
assert.match(html, /練習內容尚未加入/);
assert.match(html, /data-back-reading-home/);
assert.ok(
  html.indexOf('data-view="login"') < html.indexOf('data-view="reading-home"')
    && html.indexOf('data-view="reading-home"') < html.indexOf('data-view="dashboard"'),
  "the DSE/IELTS selector must be the first authenticated view before the IELTS dashboard",
);
assert.match(html, /data-open-question-types/);
assert.match(html, /data-view="question-types"/);
assert.match(html, /data-question-type-search/);
assert.match(html, /ielts-reading-question-types\.js/);
assert.doesNotMatch(html, /ielts-reading-analysis\.html\?view=question-types/);
assert.ok(
  html.indexOf("question-type-directory") < html.indexOf('data-passage-tab="1"'),
  "By Question Type must appear before the Passage 1 catalogue",
);
assert.match(html, /flashcards\.html\?deck=ielts%2Freading%2Fpassage-1%2FPractice%2069/);
assert.match(html, /model-essay-downloads\.html\?catalog=reading-passage-1&amp;item=63e1085c1daadcb8/);
assert.doesNotMatch(html, /<dialog/);
assert.match(css, /grid-template-columns:minmax\(0,1\.15fr\) minmax\(390px,\.85fr\)/);
assert.match(css, /@media\(max-width:1000px\)/);
assert.match(css, /\.question-type-directory\s*\{/);
assert.match(css, /\.question-type-chip\s*\{/);
assert.match(css, /\.question-type-result-card\s*\{/);
assert.match(css, /\.reading-system-choice-grid\s*\{/);
assert.match(css, /\.reading-system-card\s*\{/);
assert.match(css, /\.dse-placeholder-view\s*\{/);
assert.match(script, /flashcard_student_login/);
assert.match(script, /reading_comprehension_save_attempt/);
assert.match(script, /reading_comprehension_student_dashboard/);
assert.match(script, /learning_portal_set_bookmark/);
assert.match(script, /function openQuestionTypeDirectory\(/);
assert.match(script, /dataset\.openExercise = articleId/);
assert.match(script, /QUESTION_TYPE_INDEX\.umbrellaAliases/);
assert.match(script, /url\.searchParams\.set\('passage', String\(\[1, 2, 3\]\.includes\(state\.passageTab\)/, "the in-portal finder route must retain its IELTS Passage context");
assert.match(script, /async function openReadingHome\(\)/);
assert.match(script, /async function openDsePlaceholder\(\)/);
assert.match(script, /async function enterIeltsReading\(\)/);
assert.match(script, /openInitialView\(\{ afterLogin: true \}\)/);
assert.match(script, /await Promise\.all\(\[loadCatalogue\(\), loadBookmarks\(\)\]\)/);
assert.doesNotMatch(script, /Promise\.all\(\[loadArticleData\(\), loadBookmarks\(\)\]\)/, "login must not preload a default IELTS article before the system selector");
assert.ok(
  script.indexOf("state.catalogue.some((item) => item.id === id)") < script.indexOf("params.get('view') === 'question-types'")
    && script.indexOf("params.get('view') === 'question-types'") < script.indexOf("await openReadingHome()"),
  "valid exercise and finder deep links must take precedence over the generic post-login selector",
);
assert.match(script, /el\.home\.addEventListener\("click", openReadingHome\)/);
assert.match(script, /\$\('\[data-back-dashboard\]'\)\.addEventListener\("click", openDashboard\)/);
assert.match(script, /\['skimming', 'scanning', 'analysis'\]\.includes\(requestedView\)/, "exercise deep links must preserve supported learning views");
assert.match(script, /const url = clearReadingRoute\(new URL\(location\.href\)\); history\.replaceState\(\{\}, '', url\); document\.title = '閱讀理解學習系統｜EdmundEducation'/, "logout must clear stale article and finder routes before another student signs in");
assert.match(script, /heading\.focus\(\{ preventScroll: true \}\)/, "SPA view changes must move keyboard focus to the new page heading");
assert.doesNotMatch(script, /target\?\.scrollIntoView/, "Synchronized highlighting must not force-scroll the viewport");
assert.match(script, /data-play-paragraph/);
assert.match(script, /data-scan-question/);
assert.match(script, /answerTimings/);
assert.match(script, /interactive-word/);
assert.match(script, /if \(!submit && !state\.attemptId && !Object\.keys\(state\.answers\)\.length && currentDuration\(\) === 0\) return null/);
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
