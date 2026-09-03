#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [html, css, script, dataText, analysisText, audioManifest, sql, nav, progress, home, manifestText, bookmarkHtml, bookmarkScript, dseCatalogueText, dse2012AText, dse2012B1Text, dse2012B2Text, dseAText, dseB2Text, dse2026AText, dse2026B1Text, dse2026B2Text] = await Promise.all([
  read("reading-comprehension.html"), read("reading-comprehension.css"), read("reading-comprehension.js"),
  read("reading-comprehension-data/p1-069-albert-einstein.json"), read("ielts-reading-analysis-data/p1-069-albert-einstein.json"),
  read("reading-comprehension-audio-manifest.js"), read("supabase-reading-comprehension.sql"),
  read("shared-system-nav.js"), read("student-progress-core.js"), read("index.html"), read("pwa-manifests/reading-comprehension.webmanifest"),
  read("bookmark-directory.html"), read("bookmark-directory.js"),
  read("dse-reading-catalogue.json"),
  read("dse-reading-data/dse-2012-a.json"), read("dse-reading-data/dse-2012-b1.json"), read("dse-reading-data/dse-2012-b2.json"),
  read("dse-reading-data/dse-2014-a.json"), read("dse-reading-data/dse-2014-b2.json"),
  read("dse-reading-data/dse-2026-a.json"), read("dse-reading-data/dse-2026-b1.json"), read("dse-reading-data/dse-2026-b2.json")
]);
const data = JSON.parse(dataText); const analysis = JSON.parse(analysisText); const manifest = JSON.parse(manifestText);
const dseCatalogue = JSON.parse(dseCatalogueText); const dseA = JSON.parse(dseAText); const dseB2 = JSON.parse(dseB2Text);
const dse2012A = JSON.parse(dse2012AText); const dse2012B1 = JSON.parse(dse2012B1Text); const dse2012B2 = JSON.parse(dse2012B2Text);
const dse2026A = JSON.parse(dse2026AText); const dse2026B1 = JSON.parse(dse2026B1Text); const dse2026B2 = JSON.parse(dse2026B2Text);

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
assert.match(html, /data-view="dse-dashboard"/);
assert.match(html, /data-dse-sort="desc"/);
assert.match(html, /data-dse-sort="asc"/);
assert.match(html, /data-dse-year-grid/);
assert.match(html, /2012、2013、2015–2023、2025、2026/);
assert.match(html, /2014 已有 Part A、B2/);
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
assert.match(css, /\.dse-dashboard-view\s*\{/);
assert.match(css, /\.dse-year-grid\s*\{/);
assert.match(css, /\.dse-section-button\s*\{/);
assert.match(css, /\.dse-paragraph-figure\s*\{/);
assert.match(css, /\.paper-page-gallery\s*\{/);
assert.match(css, /\.paper-answer-grid\s*\{/);
assert.match(script, /flashcard_student_login/);
assert.match(script, /reading_comprehension_save_attempt/);
assert.match(script, /reading_comprehension_student_dashboard/);
assert.match(script, /learning_portal_set_bookmark/);
assert.match(script, /function openQuestionTypeDirectory\(/);
assert.match(script, /dataset\.openExercise = articleId/);
assert.match(script, /QUESTION_TYPE_INDEX\.umbrellaAliases/);
assert.match(script, /url\.searchParams\.set\('passage', String\(\[1, 2, 3\]\.includes\(state\.passageTab\)/, "the in-portal finder route must retain its IELTS Passage context");
assert.match(script, /async function openReadingHome\(\)/);
assert.match(script, /async function openDseDashboard\(\)/);
assert.match(script, /async function openDseExercise\(id\)/);
assert.match(script, /function renderDseCatalogue\(\)/);
assert.match(script, /paragraph\.image/);
assert.match(script, /function renderPaperPageGallery\(/);
assert.match(script, /state\.data\.displayMode === 'paper'/);
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
assert.match(script, /\$\('\[data-back-dashboard\]'\)\.addEventListener\("click", \(\) => state\.system === 'dse' \? openDseDashboard\(\) : openDashboard\(\)\)/);
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

assert.deepEqual(dseCatalogue.years.map((row) => row.year), Array.from({ length: 15 }, (_, index) => 2012 + index));
assert.deepEqual(Object.keys(dseCatalogue.years[0].sections), ["A", "B1", "B2"]);
const dse2012 = dseCatalogue.years.find((row) => row.year === 2012);
assert.equal(dse2012.sections.A.id, "dse-2012-a");
assert.equal(dse2012.sections.B1.id, "dse-2012-b1");
assert.equal(dse2012.sections.B2.id, "dse-2012-b2");
assert.deepEqual([dse2012A.questions.length, dse2012B1.questions.length, dse2012B2.questions.length], [20, 20, 33]);
assert.deepEqual([dse2012A.questions.at(0).number, dse2012A.questions.at(-1).number], [1, 20]);
assert.deepEqual([dse2012B1.questions.at(0).number, dse2012B1.questions.at(-1).number], [21, 40]);
assert.deepEqual([dse2012B2.questions.at(0).number, dse2012B2.questions.at(-1).number], [41, 73]);
assert.deepEqual([dse2012A.paragraphs.length, dse2012B1.paragraphs.length, dse2012B2.paragraphs.length], [23, 24, 13]);
const dse2012Figure = dse2012A.questions.find((question) => question.number === 13).figure.src;
assert.match(dse2012Figure, /2012-a-q13-games\.jpg$/);
assert.ok((await stat(new URL(dse2012Figure, root))).size > 1000);
assert.ok([...dse2012A.paragraphs, ...dse2012B1.paragraphs, ...dse2012B2.paragraphs].every((paragraph) => !paragraph.translation));
assert.ok([...dse2012A.questions, ...dse2012B1.questions, ...dse2012B2.questions].every((question) => !("answer" in question)));
assert.ok([dse2012A, dse2012B1, dse2012B2].every((exercise) => exercise.sourceNote === undefined));
const dse2014 = dseCatalogue.years.find((row) => row.year === 2014);
assert.equal(dse2014.sections.A.id, "dse-2014-a");
assert.equal(dse2014.sections.B1, null);
assert.equal(dse2014.sections.B2.id, "dse-2014-b2");
assert.equal(dseA.title, "Apologies all around");
assert.equal(dseA.questions.length, 30);
assert.equal(dseA.questions.at(0).number, 1);
assert.equal(dseA.questions.at(-1).number, 30);
assert.match(dseA.questions.find((question) => question.number === 8).figure.src, /2014-a-q8-robot\.jpg$/);
assert.equal(dseB2.title, "Celebrity");
assert.equal(dseB2.paragraphs.length, 9);
assert.equal(dseB2.questions.length, 25);
assert.equal(dseB2.questions.at(0).number, 60);
assert.equal(dseB2.questions.at(-1).number, 84);
assert.match(dseB2.sourceImage.src, /2014-b2-stephen-fry\.jpg$/);
assert.equal(dseB2.sourceNote, undefined);
assert.ok((await stat(new URL(dseB2.sourceImage.src.slice(1), root))).size > 1000);
assert.ok([...dseA.paragraphs, ...dseB2.paragraphs].every((paragraph) => !paragraph.translation));
assert.ok([...dseA.questions, ...dseB2.questions].every((question) => !("answer" in question)));

const dse2026 = dseCatalogue.years.find((row) => row.year === 2026);
assert.equal(dse2026.sections.A.id, "dse-2026-a");
assert.equal(dse2026.sections.B1.id, "dse-2026-b1");
assert.equal(dse2026.sections.B2.id, "dse-2026-b2");
assert.deepEqual([dse2026A.questions.length, dse2026B1.questions.length, dse2026B2.questions.length], [22, 22, 24]);
assert.deepEqual([dse2026A.questions.at(0).number, dse2026A.questions.at(-1).number], [1, 22]);
assert.deepEqual([dse2026B1.questions.at(0).number, dse2026B1.questions.at(-1).number], [23, 44]);
assert.deepEqual([dse2026B2.questions.at(0).number, dse2026B2.questions.at(-1).number], [45, 68]);
assert.deepEqual([dse2026A.paragraphs.length, dse2026B1.paragraphs.length, dse2026B2.paragraphs.length], [17, 17, 13]);
const dse2026ImageSources = [
  dse2026A.questions.find((question) => question.number === 1).figure.src,
  ...dse2026B1.paragraphs.filter((paragraph) => paragraph.image).map((paragraph) => paragraph.image.src),
  ...dse2026B2.paragraphs.filter((paragraph) => paragraph.image).map((paragraph) => paragraph.image.src),
];
assert.equal(dse2026ImageSources.length, 4);
for (const src of dse2026ImageSources) assert.ok((await stat(new URL(src, root))).size > 1000);
assert.ok([...dse2026A.paragraphs, ...dse2026B1.paragraphs, ...dse2026B2.paragraphs].every((paragraph) => !paragraph.translation));
assert.ok([...dse2026A.questions, ...dse2026B1.questions, ...dse2026B2.questions].every((question) => !("answer" in question)));
assert.ok([dse2026A, dse2026B1, dse2026B2].every((exercise) => exercise.sourceNote === undefined));

const paperYears = [2013, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2025];
for (const year of paperYears) {
  const catalogueYear = dseCatalogue.years.find((row) => row.year === year);
  for (const section of ["A", "B1", "B2"]) {
    const entry = catalogueYear.sections[section];
    assert.equal(entry.id, `dse-${year}-${section.toLowerCase()}`);
    const exercise = JSON.parse(await read(`dse-reading-data/${entry.id}.json`));
    assert.equal(exercise.displayMode, "paper");
    assert.equal(exercise.questions.length, entry.questionCount);
    assert.deepEqual(
      [exercise.questions.at(0).number, exercise.questions.at(-1).number],
      [entry.questionStart, entry.questionEnd],
    );
    assert.ok(exercise.passagePages.length >= 2);
    assert.ok(exercise.questionPages.length >= 4);
    assert.ok(exercise.questions.every((question) => !("answer" in question)));
    assert.ok(exercise.paragraphs.every((paragraph) => !paragraph.translation));
    for (const page of [...exercise.passagePages, ...exercise.questionPages]) {
      assert.match(page.src, /\.webp$/);
      assert.ok((await stat(new URL(page.src, root))).size > 10000);
    }
  }
}

const pathMatch = audioManifest.match(/"path":"([^"]+\.mp3)"/);
if (pathMatch) assert.ok((await stat(new URL(pathMatch[1], root))).size > 1000, "generated narration must be a real MP3");

console.log("Reading Comprehension portal, exercise, secure persistence, translations, analysis, progress, PWA and audio contracts validated.");
