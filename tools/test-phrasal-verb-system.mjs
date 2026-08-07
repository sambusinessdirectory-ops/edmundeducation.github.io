import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const app = read("phrasal-verb-system.js");
const html = read("phrasal-verb-system.html");
const css = read("phrasal-verb-system.css");
const config = read("phrasal-verb-system-config.js");
const home = read("index.html");

function functionSource(name, nextName) {
  const start = app.indexOf(`function ${name}(`);
  const end = app.indexOf(`function ${nextName}(`, start + 1);
  assert.ok(start >= 0 && end > start, `could not isolate ${name}()`);
  return app.slice(start, end);
}

function runInSandbox(source, resultExpression, globals = {}) {
  const context = { ...globals };
  vm.createContext(context);
  vm.runInContext(`${source}\nresult = (${resultExpression});`, context, { filename: "phrasal-verb-system.test-fragment.js" });
  return context.result;
}

function syntheticLesson(id = "phrasal-verb-01", order = 1, questionCount = 70) {
  return {
    id,
    order,
    titleZh: `動詞片語 ${order}`,
    titleEn: `Phrasal Verb ${order}`,
    questions: Array.from({ length: questionCount }, (_, index) => {
      const number = index + 1;
      return {
        id: `${id}-q${String(number).padStart(2, "0")}`,
        number,
        prompt: `English prompt ${number}`,
        promptZh: `中文題目 ${number}`,
        starter: "This",
        answer: `This uses build up ${number}.`,
        answerZh: `這是答案 ${number}。`,
        highlight: `build up ${number}`
      };
    })
  };
}

test("portal exposes the complete eight-page Phrasal Verb flow and first-card bookmarks", () => {
  const choices = functionSource("renderLessonChoices", "localDayKey");
  assert.equal((html.match(/data-step="/g) || []).length, 8);
  assert.match(html, /概覽＋例句/);
  assert.match(html, /意思組別（一）/);
  assert.match(html, /意思組別（二）＋位置/);
  assert.match(html, /完整形式參考/);
  assert.match(html, /實際用途＋意思比較/);
  assert.match(html, /data-jump-to-exercise/);
  assert.match(html, /data-system="phrasal-verbs"/);
  assert.match(html, /QUESTIONS DONE/i);
  assert.match(html, /TIME SPENT/i);
  assert.match(html, /phrasal-verb-system-data\.js/);
  assert.match(html, /phrasal-verb-system\.js/);
  assert.match(html, /phrasal-verb-system\.css/);
  assert.ok(choices.indexOf("data-open-bookmarks-card") < choices.indexOf("${cards}"));
  assert.match(app, /const LESSON_PAGES = 8/);
  assert.match(app, /const EXERCISE_PAGE = 8/);
});

test("frontend is isolated while retaining the shared student login contract", () => {
  assert.match(config, /workerBaseUrl:\s*"https:\/\/edmund-phrasal-verb-system\.edmundeducation\.workers\.dev"/);
  assert.match(config, /adminUsername:\s*"Sam Phrasal Verb Admin"/);
  assert.match(config, /studentLoginRpc:\s*"flashcard_student_login"/);
  assert.doesNotMatch(config, /password\s*:/i);
  assert.match(app, /edmund-phrasal-verb-system-session-v1/);
  assert.match(app, /edmund-phrasal-verb-system-progress-panel-v1/);
  assert.match(app, /edmund-phrasal-verb-system-cumulative-progress-v1/);
  assert.match(html, /connect-src[^>]*https:\/\/edmund-phrasal-verb-system\.edmundeducation\.workers\.dev/);
  assert.match(html, /@supabase\/supabase-js@2\.110\.8\/dist\/umd\/supabase\.js/);
  assert.match(html, /integrity="sha384-[^"]+"/);
  assert.doesNotMatch(`${html}\n${css}\n${app}\n${config}`, /out of sight|start the ball rolling|stone ball|英文慣用語/i);
});

test("public entry is an original green old-book card with exact four-line branding", () => {
  const card = home.match(/<a class="category phrasal-verb-system-card"[\s\S]*?<\/a>/)?.[0] || "";
  assert.match(card, /href="phrasal-verb-system\.html"/);
  assert.match(card, /\(學生使用\)<br><span class="phrasal-card-title">Phrasal Verb<\/span><br>動詞片語<br>學習系統/);
  assert.match(card, /phrasal-book-spine/);
  assert.match(card, /phrasal-book-stitching/);
  assert.match(card, /phrasal-book-strap/);
  assert.match(card, /phrasal-book-medallion/);
  assert.match(home, /\.phrasal-verb-system-card[\s\S]*?linear-gradient/);
  assert.doesNotMatch(home.match(/\.phrasal-verb-system-card\s*\{[\s\S]*?\n\s*\}/)?.[0] || "", /url\(/);
  assert.match(html, /<body data-phrasal-verb-view="login">/);
  assert.match(html, /<p class="student-label">\(學生使用\)<\/p>\s*<h1><span lang="en">Phrasal Verb<\/span><br>動詞片語<br>學習系統<\/h1>/);
  assert.match(css, /--navy:\s*#1f5f3d/);
  assert.match(css, /body\[data-phrasal-verb-view="login"\][\s\S]*?linear-gradient/);
  assert.doesNotMatch(css, /assets\//, "the green portal must not depend on a wallpaper or lesson artwork");
});

test("lesson validation accepts no-image lessons and derives any sequential question total", () => {
  const source = [
    functionSource("isPlainObject", "validLessonContract"),
    functionSource("validLessonContract", "parseJsonObject")
  ].join("\n");
  assert.equal(runInSandbox(source, "validLessonContract(lesson)", { lesson: syntheticLesson() }), true);
  assert.equal(runInSandbox(source, "validLessonContract(lesson)", { lesson: syntheticLesson("phrasal-verb-03", 3, 12) }), true);
  assert.equal(runInSandbox(source, "validLessonContract(lesson)", { lesson: syntheticLesson("phrasal-verb-269", 269, 250) }), true);

  const badId = structuredClone(syntheticLesson());
  badId.questions[9].id = "phrasal-verb-01-q99";
  assert.equal(runInSandbox(source, "validLessonContract(lesson)", { lesson: badId }), false);

  const missingTranslation = structuredClone(syntheticLesson());
  missingTranslation.questions[0].promptZh = "";
  assert.equal(runInSandbox(source, "validLessonContract(lesson)", { lesson: missingTranslation }), false);

  const empty = structuredClone(syntheticLesson());
  empty.questions = [];
  assert.equal(runInSandbox(source, "validLessonContract(lesson)", { lesson: empty }), false);
  assert.doesNotMatch(source, /illustration|length !== 50/);
});

test("lesson catalog accepts multiple lessons, removes duplicate IDs, and sorts by order", () => {
  const source = [
    functionSource("isPlainObject", "validLessonContract"),
    functionSource("validLessonContract", "parseJsonObject"),
    functionSource("lessonList", "getLesson")
  ].join("\n");
  const content = {
    system: "phrasal-verb",
    lessons: [syntheticLesson("phrasal-verb-02", 2), syntheticLesson("phrasal-verb-01", 1), syntheticLesson("phrasal-verb-01", 9)]
  };
  const ids = runInSandbox(`const CONTENT = input;\n${source}`, "lessonList().map(({ id }) => id)", { input: content });
  assert.deepEqual(Array.from(ids), ["phrasal-verb-01", "phrasal-verb-02"]);
  const wrongSystem = runInSandbox(`const CONTENT = input;\n${source}`, "lessonList()", { input: { ...content, system: "proverb" } });
  assert.equal(wrongSystem.length, 0);
});

test("only explicit lesson metadata creates blue phrase highlighting", () => {
  const source = [
    functionSource("escapeHtml", "isPlainObject"),
    functionSource("relevantExampleHtml", "exampleHighlights")
  ].join("\n");
  const render = (value, highlight) => runInSandbox(source, "relevantExampleHtml(value, highlight)", { value, highlight });
  assert.equal(render("A <broad> explanation.", ""), "A &lt;broad&gt; explanation.");
  const highlighted = render("Traffic is building up; pressure is BUILDING UP.", "building up");
  assert.equal((highlighted.match(/class="target-highlight"/g) || []).length, 2);
  assert.match(css, /\.target-highlight\s*\{[^}]*color:\s*#2468c9[^}]*\}/s);
});

test("source rule examples render once and repeated sentence headings are suppressed", () => {
  const source = functionSource("sourceExamples", "teachingCardsHtml");
  const examples = runInSandbox(source, "sourceExamples(input)", {
    input: {
      examples: [{ en: "tidy it away", zh: "tidy it away", highlight: "tidy it away" }],
      examplesEn: ["tidy it away", "tidy them up"]
    }
  });
  assert.deepEqual(Array.from(examples, (example) => ({ ...example })), [
    { en: "tidy it away", zh: "", highlight: "tidy it away" },
    { en: "tidy them up", zh: "", highlight: "tidy them up" }
  ]);
  assert.equal(runInSandbox(source, "hasDistinctBilingualHeading(raw, item)", {
    raw: { titleZh: "保留原句資料。", titleEn: "Keep the original details." },
    item: { chinese: "保留原句資料。", english: "Keep the original details." }
  }), false);
  assert.equal(runInSandbox(source, "hasDistinctBilingualHeading(raw, item)", {
    raw: { titleZh: "代詞位置", titleEn: "Pronoun placement" },
    item: { chinese: "把代詞放在動詞與副詞之間。", english: "Place the pronoun between the verb and particle." }
  }), true);
});

test("Pages 1–7 are Chinese-primary while exercise prompts are English-primary", () => {
  const formula = functionSource("renderFormulaPage", "bilingualItem");
  const benefits = functionSource("renderBenefitsPage", "renderOriginPage");
  const rules = functionSource("renderRulesPage", "makeAttemptId");
  const questions = functionSource("questionHtml", "activeQuestions");
  const bookmarks = functionSource("renderBookmarks", "resumeAttempt");
  assert.ok(formula.indexOf("chinese-primary") < formula.indexOf("english-secondary"));
  assert.ok(benefits.indexOf("chinese") < benefits.indexOf("english"));
  assert.ok(rules.indexOf("chinese") < rules.indexOf("english"));
  assert.ok(questions.indexOf('class="english"') < questions.indexOf('class="chinese"'));
  assert.ok(bookmarks.indexOf('class="bookmark-prompt"') < bookmarks.indexOf('class="bookmark-zh"'));
  assert.match(css, /\.question-prompt \.english\s*\{[^}]*font-size:\s*clamp\(/s);
  assert.match(css, /\.question-prompt \.chinese\s*\{[^}]*color:\s*var\(--muted\)/s);
});

test("source-faithful teaching renderers cover the Build lesson without invented history", () => {
  const formula = functionSource("renderFormulaPage", "bilingualItem");
  const register = functionSource("renderRegisterPage", "renderFixedVariablePage");
  const fixedVariable = functionSource("renderFixedVariablePage", "renderSpecificFormsPage");
  const uses = functionSource("renderOriginPage", "renderRulesPage");
  assert.match(formula, /learningObjective/);
  assert.match(register, /meaningGroups1/);
  assert.match(fixedVariable, /meaningGroups2/);
  assert.match(fixedVariable, /fixedVariable/);
  assert.match(uses, /usageGuide/);
  assert.match(uses, /contextsZh/);
  assert.match(uses, /comparisons/);
  assert.doesNotMatch(uses, /history|etymology|origin\.status/i);
});

test("answer matching accepts source-approved variants while revealing the canonical answer", () => {
  const source = [
    "const SPELLING_EQUIVALENTS = Object.freeze({});",
    functionSource("canonicalSpellingToken", "answerWordSegments"),
    functionSource("normalizeAnswer", "answersMatch"),
    functionSource("answersMatch", "serializeExerciseResult")
  ].join("\n");
  const question = {
    answer: "The course is built around weekly projects.",
    acceptedAnswers: ["The course is built round weekly projects."]
  };
  assert.equal(runInSandbox(source, "answersMatch(student, question)", { student: question.answer, question }), true);
  assert.equal(runInSandbox(source, "answersMatch(student, question)", { student: question.acceptedAnswers[0], question }), true);
  assert.equal(runInSandbox(source, "answersMatch(student, question)", { student: "The course includes weekly projects.", question }), false);
  const reveal = functionSource("suggestedAnswerHtml", "questionHtml");
  assert.match(reveal, /question\.answer/);
  assert.doesNotMatch(reveal, /acceptedAnswers/);
});

const dataPath = path.join(root, "phrasal-verb-system-data.js");
const importManifestPath = path.join(root, "tools/phrasal-verb-import-manifest.json");
test("published 329-lesson data satisfies the dynamic no-image frontend contract", { skip: !fs.existsSync(dataPath) }, () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(dataPath, "utf8"), context, { filename: "phrasal-verb-system-data.js" });
  const content = context.window.EDMUND_PHRASAL_VERB_SYSTEM_DATA;
  assert.equal(content.system, "phrasal-verb");
  const historicalQuestionCounts = [70, 50, 70, 60, 50, 70, 70, 70, 50, 70, 50, 50, 50, 70, 50, 50, 50, 50, 70, 50, 60, 50, 60, 60, 50, 50, 60, 60, 50, 50, 50, 30, 50, 50, 70];
  assert.equal(content.lessonCount, 329);
  assert.equal(content.questionCount, 21320);
  assert.equal(content.lessons.length, 329);
  assert.equal(new Set(content.lessons.map(({ id }) => id)).size, content.lessons.length);
  assert.doesNotMatch(JSON.stringify(content), /\[object Object\]|\/Users\/|[A-Z]:\\/);

  const expectedTitles = ["Build", "Catch", "Fly", "Answer", "Chase", "Clear", "Clean", "Grow", "Watch", "Wash", "Top", "Try", "Tidy", "Buy", "Switch", "Cool", "Bubble", "Breathe", "Drive", "Win", "Wind", "Copy", "Tell", "Wait", "Zoom", "Clock", "Boil", "Touch", "Box", "Cover", "Steal", "Centre", "Chop", "Cheat", "Close"];
  content.lessons.forEach((lesson, lessonIndex) => {
    const order = lessonIndex + 1;
    assert.equal(lesson.id, `phrasal-verb-${String(order).padStart(2, "0")}`);
    assert.equal(lesson.order, order);
    if (lessonIndex < expectedTitles.length) {
      assert.equal(lesson.titleEn.toLocaleLowerCase(), expectedTitles[lessonIndex].toLocaleLowerCase());
      assert.equal(lesson.questions.length, historicalQuestionCounts[lessonIndex]);
    }
    assert.equal(lesson.groupCount, lesson.meaningGroups.length);
    assert.equal(lesson.fixedVariable.forms.length, lesson.meaningGroups.length);
    assert.equal(lesson.specificForms.length, lesson.meaningGroups.length);
    assert.ok(lesson.benefits.length >= 1);
    assert.ok(lesson.rules.length >= 1);
    assert.equal("image" in lesson, false);
    assert.equal("illustration" in lesson, false);
    assert.ok(Number.isInteger(lesson.source.pageCount) && lesson.source.pageCount > 0);
    lesson.questions.forEach((question, index) => {
      assert.equal(question.id, `${lesson.id}-q${String(index + 1).padStart(2, "0")}`);
      assert.equal(question.number, index + 1);
      assert.ok(question.prompt && question.promptZh);
      assert.ok(question.answer && question.answerZh && question.starter && question.highlight);
      assert.ok(question.answer.toLocaleLowerCase().includes(question.highlight.toLocaleLowerCase()));
      assert.ok(question.sourcePage >= 1 && question.sourcePage <= lesson.source.pageCount);
      assert.ok(question.answerSourcePage >= 1 && question.answerSourcePage <= lesson.source.pageCount);
      if (question.acceptedAnswers !== undefined) assert.ok(Array.isArray(question.acceptedAnswers));
    });
  });
  assert.match(content.lessons[14].source.file, /SWITCH/);
  assert.match(content.lessons[15].source.file, /Cool/);
  assert.equal(content.lessons[35].titleEn.toLocaleLowerCase(), "break");
  assert.equal(content.lessons[35].questions.length, 60);
  assert.match(content.lessons[194].source.file, /BUMP/);
  assert.match(content.lessons[195].source.file, /KICK/);
  assert.match(content.lessons[225].source.file, /BURN/);
  assert.match(content.lessons[226].source.file, /COME/);
  assert.equal(content.lessons[112].questions.length, 40, "TIP must exclude contaminated pages 17–51");
  assert.deepEqual(Array.from(content.lessons[112].source.importedPageRange), [1, 16]);
  assert.equal(content.lessons[268].questions.length, 250);
  assert.equal(content.lessons[268].questions[99].id, "phrasal-verb-269-q100");
  assert.equal(content.lessons[268].questions[249].id, "phrasal-verb-269-q250");
  assert.equal(content.lessons[328].titleEn.toLocaleLowerCase(), "shy");
  assert.equal(content.lessons[328].questions.length, 50);

  const manifest = JSON.parse(fs.readFileSync(importManifestPath, "utf8"));
  assert.equal(manifest.fileCount, 294);
  assert.equal(manifest.questionCount, 19350);
  assert.deepEqual(manifest.lessonRange, [36, 329]);
  assert.equal(manifest.lessons.length, 294);
  assert.ok(manifest.lessons.every(item => /^[0-9a-f]{64}$/.test(item.sourceSha256)));
});

test("question totals, progress, completion and gold cards are data-derived", () => {
  assert.doesNotMatch(app, /length !== 50|exactly 50|q50/);
  assert.match(app, /lessonQuestionCount\(lesson\)/);
  assert.match(app, /attempt\.correctCount >= questionCount/);
  assert.match(app, /data-tone="\$\{complete \? "gold"/);
  assert.match(app, /const total = lesson\.questions\?\.length \|\| 0/);
  assert.match(app, /totalCount: lesson\?\.questions\?\.length \|\| 0/);
});

test("progress dashboard counts a question once across retries and later correction", () => {
  const source = functionSource("questionActivityRows", "progressRangeStart");
  const attempts = [{
    id: "attempt-1",
    lessonId: "phrasal-verb-01",
    result: {
      rounds: [
        { round: 1, submittedAt: "2026-07-01T10:00:00.000Z", checkedIds: ["phrasal-verb-01-q01"], correctIds: [], incorrectIds: ["phrasal-verb-01-q01"] },
        { round: 2, submittedAt: "2026-07-02T10:00:00.000Z", checkedIds: ["phrasal-verb-01-q01", "phrasal-verb-01-q01"], correctIds: [], incorrectIds: ["phrasal-verb-01-q01"] },
        { round: 3, submittedAt: "2026-07-03T10:00:00.000Z", checkedIds: ["phrasal-verb-01-q01", "phrasal-verb-01-q02"], correctIds: ["phrasal-verb-01-q01", "phrasal-verb-01-q02"], incorrectIds: [] }
      ]
    }
  }];
  const rows = runInSandbox(source, "questionActivityRows(input)", {
    input: attempts,
    state: { attempts: [] },
    getQuestion: (_lessonId, questionId) => ({ id: questionId })
  });
  assert.equal(rows.length, 2);
  const corrected = rows.find(({ questionId }) => questionId === "phrasal-verb-01-q01");
  assert.equal(corrected.status, "correct");
  assert.equal(corrected.round, 3);
  assert.equal(corrected.time, Date.parse("2026-07-01T10:00:00.000Z"));
  assert.equal(corrected.correctedAt, Date.parse("2026-07-03T10:00:00.000Z"));
});

test("student search can enter a Phrasal Verb teaching page or exact question", () => {
  const source = [
    "let lessonSearchIndexCache = null; const EXERCISE_PAGE = 8;",
    functionSource("collectLessonSearchStrings", "normalizeLessonSearchText"),
    functionSource("normalizeLessonSearchText", "lessonSearchIndex"),
    functionSource("lessonSearchIndex", "searchLessons"),
    functionSource("searchLessons", "renderLessonSearch")
  ].join("\n");
  const lesson = { ...syntheticLesson(), slug: "build", benefits: [{ zh: "逐步發展", en: "gradual development" }], rules: [{ zh: "位置規則", en: "placement rule" }] };
  const globals = { lessonList: () => [lesson], lessonTitle: (item) => item.titleZh, lessonEnglishTitle: (item) => item.titleEn };
  assert.equal(runInSandbox(source, "searchLessons('GRADUAL DEVELOPMENT')[0].page", globals), 5);
  const question = runInSandbox(source, "searchLessons('English prompt 9')", globals).find(({ questionId }) => questionId === "phrasal-verb-01-q09");
  assert.equal(question.page, 8);
  assert.equal(question.questionId, "phrasal-verb-01-q09");
  assert.match(html, /data-lesson-search-input/);
});

test("published Phrasal Verb exports normalize Mia and 米婭 to Tom and 湯姆", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(dataPath, "utf8"), context, { filename: "phrasal-verb-system-data.js" });
  const serialized = JSON.stringify(context.window.EDMUND_PHRASAL_VERB_SYSTEM_DATA);
  assert.doesNotMatch(serialized, /\bMia\b|米婭/);
  assert.match(serialized, /\bTom\b|湯姆/);
});

test("student-facing Phrasal Verb copy contains no round counter", () => {
  assert.doesNotMatch(`${html}\n${app}`, /第\s*\$?\{?[^\n<]{0,30}輪|分輪|改正輪/);
});
