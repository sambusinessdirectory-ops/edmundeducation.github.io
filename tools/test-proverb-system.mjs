import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const app = read("proverb-system.js");
const html = read("proverb-system.html");
const css = read("proverb-system.css");
const config = read("proverb-system-config.js");
const home = read("index.html");

function functionSource(name, nextName) {
  const start = app.indexOf(`function ${name}(`);
  const end = app.indexOf(`function ${nextName}(`, start + 1);
  assert.ok(start >= 0 && end > start, `could not isolate ${name}()`);
  return app.slice(start, end);
}

function runInSandbox(source, resultExpression, globals = {}) {
  const context = { window: {}, ...globals };
  vm.createContext(context);
  vm.runInContext(read("shared-answer-comparison.js"), context, { filename: "shared-answer-comparison.js" });
  vm.runInContext(`${source}\nresult = (${resultExpression});`, context, { filename: "proverb-system.test-fragment.js" });
  return context.result;
}

function syntheticLesson(id = "proverb-01", order = 1) {
  return {
    id,
    order,
    titleZh: `諺語 ${order}`,
    titleEn: `Proverb ${order}`,
    illustration: { src: `assets/proverb-system/${id}.webp` },
    questions: Array.from({ length: 50 }, (_, index) => {
      const number = index + 1;
      return {
        id: `${id}-q${String(number).padStart(2, "0")}`,
        number,
        promptZh: `中文題目 ${number}`,
        prompt: `English prompt ${number}`,
        starter: "This",
        answer: `This uses proverb ${number}.`,
        answerZh: `這是答案 ${number}。`,
        highlight: `proverb ${number}`
      };
    })
  };
}

test("portal exposes the complete eight-page Proverb flow and first-card bookmarks", () => {
  const choices = functionSource("renderLessonChoices", "localDayKey");
  assert.equal((html.match(/data-step="/g) || []).length, 8);
  assert.match(html, /data-jump-to-exercise/);
  assert.match(html, /data-system="proverbs"/);
  assert.match(html, /QUESTIONS DONE/i);
  assert.match(html, /TIME SPENT/i);
  assert.match(html, /proverb-system-data\.js\?v=20260807-2/);
  assert.match(html, /shared-answer-comparison\.js\?v=20260812-1/);
  assert.match(html, /proverb-system\.js\?v=20260812-1/);
  assert.match(html, /proverb-system\.css/);
  assert.ok(choices.indexOf("data-open-bookmarks-card") < choices.indexOf("${cards}"));
  assert.match(app, /const LESSON_PAGES = 8/);
  assert.match(app, /const EXERCISE_PAGE = 8/);
  assert.match(app, /function renderRegisterPage/);
  assert.match(app, /function renderFixedVariablePage/);
  assert.match(app, /function renderSpecificFormsPage/);
  assert.match(app, /function renderBenefitsPage/);
  assert.match(app, /function renderOriginPage/);
  assert.match(app, /function renderRulesPage/);
  assert.match(app, /function renderExercisePage/);
});

test("frontend is isolated while retaining the shared student login contract", () => {
  assert.match(config, /workerBaseUrl:\s*"https:\/\/edmund-proverb-system\.edmundeducation\.workers\.dev"/);
  assert.match(config, /adminUsername:\s*"Sam Proverb Admin"/);
  assert.match(config, /studentLoginRpc:\s*"flashcard_student_login"/);
  assert.doesNotMatch(config, /password\s*:/i);
  assert.match(app, /edmund-proverb-system-session-v1/);
  assert.match(app, /edmund-proverb-system-progress-panel-v1/);
  assert.match(app, /edmund-proverb-system-cumulative-progress-v1/);
  assert.match(html, /connect-src[^>]*https:\/\/edmund-proverb-system\.edmundeducation\.workers\.dev/);
  assert.match(html, /@supabase\/supabase-js@2\.110\.8\/dist\/umd\/supabase\.js/);
  assert.match(html, /integrity="sha384-[^"]+"/);
  assert.doesNotMatch(`${html}\n${css}\n${app}\n${config}`, /\bIdiom\b|慣用語|start the ball rolling|out of sight|stone ball/i);
});

test("public entry and portal use the supplied old-book visual system", () => {
  const card = home.match(/<a class="category proverb-system-card"[\s\S]*?<\/a>/)?.[0] || "";
  assert.match(card, /href="proverb-system\.html"/);
  assert.match(card, /\(學生使用\)<br>[\s\S]*諺語[\s\S]*<br>學生使用系統/);
  assert.match(card, /proverb-book-spine/);
  assert.match(card, /proverb-book-stitching/);
  assert.match(card, /proverb-book-strap/);
  assert.match(card, /proverb-book-medallion/);
  assert.match(home, /\.proverb-system-card[\s\S]*?assets\/proverb-system\/main-leather\.webp/);
  assert.match(html, /<body data-proverb-view="login">/);
  assert.match(css, /body\[data-proverb-view="login"\][\s\S]*?assets\/proverb-system\/login-library\.webp/);
  assert.match(css, /body\s*\{[\s\S]*?assets\/proverb-system\/main-leather\.webp/);
  assert.match(app, /document\.body\.dataset\.proverbView = name/);
  assert.match(html, /<p class="student-label">\(學生使用\)<\/p>\s*<h1>諺語<br>學生使用系統<\/h1>/);
  assert.match(html, /<p class="eyebrow">\(學生使用\)<\/p>\s*<h1>諺語<br>學生使用系統<\/h1>/);
  assert.doesNotMatch(html, /<h1>諺語<br><span>Proverb<\/span>/);
  for (const asset of [
    "assets/proverb-system/login-library.webp",
    "assets/proverb-system/main-leather.webp",
    "assets/proverb-system/out-of-sight-out-of-mind.webp"
  ]) assert.ok(fs.existsSync(path.join(root, asset)), `${asset} must exist`);
});

test("lesson validation enforces the stable multi-lesson data contract", () => {
  const source = [
    functionSource("isPlainObject", "validLessonContract"),
    functionSource("validLessonContract", "parseJsonObject"),
    functionSource("lessonIllustration", "lessonPageMeta")
  ].join("\n");
  const valid = syntheticLesson();
  assert.equal(runInSandbox(source, "validLessonContract(lesson)", { lesson: valid }), true);

  const badId = structuredClone(valid);
  badId.questions[9].id = "proverb-01-q99";
  assert.equal(runInSandbox(source, "validLessonContract(lesson)", { lesson: badId }), false);

  const missingTranslation = structuredClone(valid);
  missingTranslation.questions[0].promptZh = "";
  assert.equal(runInSandbox(source, "validLessonContract(lesson)", { lesson: missingTranslation }), false);

  const missingArtwork = structuredClone(valid);
  missingArtwork.illustration.src = "";
  assert.equal(runInSandbox(source, "validLessonContract(lesson)", { lesson: missingArtwork }), false);

  const incomplete = structuredClone(valid);
  incomplete.questions.pop();
  assert.equal(runInSandbox(source, "validLessonContract(lesson)", { lesson: incomplete }), false);
});

test("legacy and canonical illustration metadata preserve both bilingual captions", () => {
  const source = [
    functionSource("isPlainObject", "validLessonContract"),
    functionSource("lessonIllustration", "lessonPageMeta")
  ].join("\n");
  const illustration = runInSandbox(source, "lessonIllustration(lesson)", {
    lesson: {
      image: "assets/proverb-system/example.svg",
      imageCaptionZh: "中文圖片說明",
      imageCaption: "English illustration caption."
    }
  });
  assert.equal(illustration.captionZh, "中文圖片說明");
  assert.equal(illustration.captionEn, "English illustration caption.");
});

test("lesson catalog accepts multiple lessons, removes duplicate IDs, and sorts by order", () => {
  const source = [
    functionSource("isPlainObject", "validLessonContract"),
    functionSource("validLessonContract", "parseJsonObject"),
    functionSource("lessonList", "getLesson"),
    functionSource("lessonIllustration", "lessonPageMeta")
  ].join("\n");
  const content = {
    system: "proverb",
    lessons: [syntheticLesson("proverb-02", 2), syntheticLesson("proverb-01", 1), syntheticLesson("proverb-01", 9)]
  };
  const ids = runInSandbox(`const CONTENT = input;\n${source}`, "lessonList().map(({ id }) => id)", { input: content });
  assert.deepEqual(Array.from(ids), ["proverb-01", "proverb-02"]);
  const wrongSystem = runInSandbox(`const CONTENT = input;\n${source}`, "lessonList()", { input: { ...content, system: "idiom" } });
  assert.equal(wrongSystem.length, 0);
});

test("only explicit lesson metadata creates blue phrase highlighting", () => {
  const source = [
    functionSource("escapeHtml", "isPlainObject"),
    functionSource("relevantExampleHtml", "exampleHighlights")
  ].join("\n");
  const render = (value, highlight) => runInSandbox(source, "relevantExampleHtml(value, highlight)", { value, highlight });

  const neutral = render("A <broad> English explanation.", "");
  assert.equal(neutral, "A &lt;broad&gt; English explanation.");
  assert.doesNotMatch(neutral, /target-highlight/);

  const highlighted = render("This proverb helps; this PROVERB helps.", "proverb");
  assert.equal((highlighted.match(/class="target-highlight"/g) || []).length, 2);
  assert.match(highlighted, />proverb<\/span>/);
  assert.match(highlighted, />PROVERB<\/span>/);
  assert.equal(render("No matching phrase.", "proverb"), "No matching phrase.");

  assert.match(app, /relevantExampleHtml\(formula, highlights\)/);
  assert.match(app, /relevantExampleHtml\(form\.formula \|\| "", exampleHighlights\(form\)\)/);
  assert.match(app, /parts\.fixedHighlights \|\| parts\.fixedHighlight/);
  assert.match(css, /\.target-highlight\s*\{[^}]*color:\s*#2468c9[^}]*\}/s);
  assert.doesNotMatch(app, /\b(?:start|set|get|keep)[^\n]{0,80}the\\s\+ball/i);
});

test("all bilingual lesson and exercise surfaces keep Chinese before English", () => {
  const formula = functionSource("renderFormulaPage", "bilingualItem");
  const specificForms = functionSource("renderSpecificFormsPage", "renderBenefitsPage");
  const benefits = functionSource("renderBenefitsPage", "renderOriginPage");
  const rules = functionSource("renderRulesPage", "makeAttemptId");
  const answers = functionSource("suggestedAnswerHtml", "questionHtml");
  const questions = functionSource("questionHtml", "activeQuestions");
  const bookmarks = functionSource("renderBookmarks", "resumeAttempt");

  assert.ok(formula.indexOf("chinese-primary") < formula.indexOf("english-secondary"));
  assert.ok(specificForms.indexOf("chinese-primary") < specificForms.indexOf("english-secondary"));
  assert.ok(benefits.indexOf("chinese-example") < benefits.indexOf("english-example"));
  assert.ok(rules.indexOf("chinese-example") < rules.indexOf("english-example"));
  assert.ok(answers.indexOf("chinese-answer") < answers.indexOf("english-answer"));
  assert.ok(questions.indexOf('class="chinese"') < questions.indexOf('class="english"'));
  assert.ok(bookmarks.indexOf('class="bookmark-zh"') < bookmarks.indexOf('class="bookmark-prompt"'));
  assert.match(css, /\.question-prompt \.chinese\s*\{[^}]*font-size:\s*clamp\(/s);
  assert.match(css, /\.question-prompt \.english\s*\{[^}]*color:\s*var\(--muted\)/s);
});

test("all source-backed teaching details are rendered without restoring excluded blocks", () => {
  const formula = functionSource("renderFormulaPage", "bilingualItem");
  const register = functionSource("renderRegisterPage", "renderFixedVariablePage");
  const fixedVariable = functionSource("renderFixedVariablePage", "renderSpecificFormsPage");

  assert.match(formula, /modelExample/);
  assert.match(formula, /preservedZh/);
  assert.match(formula, /compressedZh/);
  assert.match(formula, /tendencyZh/);
  assert.match(register, /register\.tones/);
  assert.match(register, /sensitiveContextsZh/);
  assert.match(register, /sensitivityZh/);
  assert.doesNotMatch(register, /communicativeFunctions/);
  assert.match(fixedVariable, /incorrectForms/);
  assert.match(fixedVariable, /capitalisation/);
  assert.match(fixedVariable, /variableItemsZh/);
  assert.match(fixedVariable, /beForms/);
  assert.match(css, /\.teaching-mini-grid/);
  assert.match(css, /\.form-status-list/);
});

const dataPath = path.join(root, "proverb-system-data.js");
test("published Proverb data satisfies the frontend contract", { skip: !fs.existsSync(dataPath) }, () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(dataPath, "utf8"), context, { filename: "proverb-system-data.js" });
  const content = context.window.EDMUND_PROVERB_SYSTEM_DATA;
  assert.equal(content.system, "proverb");
  assert.equal(content.lessonCount, 3);
  assert.equal(content.questionCount, 150);
  assert.ok(Array.isArray(content.lessons) && content.lessons.length === 3);
  assert.equal(new Set(content.lessons.map(({ id }) => id)).size, content.lessons.length);
  assert.doesNotMatch(JSON.stringify(content), /\[object Object\]|\/Users\/|[A-Z]:\\/);

  const expectedCounts = [
    {
      id: "proverb-01",
      image: "assets/proverb-system/out-of-sight-out-of-mind.webp",
      specificForms: 7,
      benefits: 5,
      rules: 10,
      forms: 7
    },
    {
      id: "proverb-02",
      image: "assets/proverb-system/every-man-has-his-price.svg",
      specificForms: 7,
      benefits: 5,
      rules: 8,
      forms: 7
    },
    {
      id: "proverb-03",
      image: "assets/proverb-system/once-bitten-twice-shy.svg",
      specificForms: 6,
      benefits: 6,
      rules: 12,
      forms: 6
    }
  ];
  for (const [lessonIndex, lesson] of content.lessons.entries()) {
    const expected = expectedCounts[lessonIndex];
    assert.equal(lesson.id, expected.id);
    assert.match(lesson.id, /^proverb-\d{2}$/);
    assert.ok(lesson.titleZh || lesson.title);
    assert.ok(lesson.titleEn || lesson.englishTitle);
    const image = lesson.illustration?.src || lesson.image;
    assert.equal(image, expected.image);
    assert.ok(image && !path.isAbsolute(image));
    assert.ok(fs.existsSync(path.join(root, image)), `${lesson.id} artwork does not exist: ${image}`);
    assert.equal(lesson.questions.length, 50);
    assert.equal(lesson.specificForms.length, expected.specificForms);
    const target = String(lesson.formulas?.[0]?.highlight || "").toLocaleLowerCase();
    assert.ok(target);
    assert.ok(lesson.specificForms.every(({ formula, highlight }) => (
      String(highlight || "").toLocaleLowerCase() === target
      && String(formula || "").toLocaleLowerCase().includes(String(highlight).toLocaleLowerCase())
    )));
    assert.equal(lesson.benefits.length, expected.benefits);
    assert.equal(lesson.rules.length, expected.rules);
    assert.ok(lesson.rules.flatMap(({ examples = [] }) => examples).every(({ en, highlight }) => (
      !String(highlight || "").trim()
      || String(en || "").toLocaleLowerCase().includes(String(highlight).toLocaleLowerCase())
    )));
    assert.equal(lesson.fixedVariable.forms.length, expected.forms);
    assert.ok(lesson.fixedVariable.forms.every(({ exampleZh }) => String(exampleZh || "").trim()));
    assert.equal(lesson.origin.history.some(({ titleEn }) => titleEn === "The Original Image"), false);
    if (lesson.order > 1) {
      assert.equal(lesson.sourceOmissions.length, 2);
      assert.deepEqual(Array.from(lesson.sourceOmissions, ({ section }) => section), [
        "Communicative Function · 溝通功能",
        "The Original Image · 原來的畫面"
      ]);
      assert.equal(lesson.source.sha256.length, 64);
    }
    lesson.questions.forEach((question, index) => {
      assert.equal(question.id, `${lesson.id}-q${String(index + 1).padStart(2, "0")}`);
      assert.equal(question.number, index + 1);
      assert.ok(question.promptZh && question.prompt);
      assert.ok(question.answerZh && question.answer && question.starter && question.highlight);
      assert.ok(question.answer.toLocaleLowerCase().includes(question.highlight.toLocaleLowerCase()));
      assert.equal(question.highlight.toLocaleLowerCase(), target);
      if (question.acceptedAnswers !== undefined) assert.ok(Array.isArray(question.acceptedAnswers));
    });
  }
});

test("student search indexes titles, teaching pages, and exact exercise questions", () => {
  const source = [
    "let lessonSearchIndexCache = null; const EXERCISE_PAGE = 8;",
    functionSource("collectLessonSearchStrings", "normalizeLessonSearchText"),
    functionSource("normalizeLessonSearchText", "lessonSearchIndex"),
    functionSource("lessonSearchIndex", "searchLessons"),
    functionSource("searchLessons", "renderLessonSearch")
  ].join("\n");
  const lesson = {
    ...syntheticLesson(),
    slug: "out-of-sight",
    formulas: [{ formula: "page-one-unique" }],
    register: { summaryEn: "page-two-unique" },
    fixedVariable: { fixedEn: "page-three-unique" },
    specificForms: [{ formula: "page-four-unique" }],
    benefits: [{ zh: "合作表達", en: "page-five-unique cooperative expression" }],
    origin: { history: [{ en: "page-six-unique" }] },
    rules: [{ zh: "重要規則", en: "page-seven-unique important rule" }]
  };
  const globals = { lessonList: () => [lesson], lessonTitle: (item) => item.titleZh, lessonEnglishTitle: (item) => item.titleEn };
  const pageWords = ["one", "two", "three", "four", "five", "six", "seven"];
  for (let page = 1; page <= 7; page += 1) {
    const hit = runInSandbox(source, `searchLessons('page-${pageWords[page - 1]}-unique')`, globals);
    assert.equal(hit.some((entry) => entry.lessonId === lesson.id && entry.page === page), true, `page ${page} must be searchable`);
  }
  const benefit = runInSandbox(source, "searchLessons('COOPERATIVE')", globals);
  assert.equal(benefit[0].page, 5);
  const question = runInSandbox(source, "searchLessons('中文題目 7')", globals).find(({ questionId }) => questionId === "proverb-01-q07");
  assert.equal(question.page, 8);
  assert.equal(question.questionId, "proverb-01-q07");
  const answer = runInSandbox(source, "searchLessons('This uses proverb 7')", globals).find(({ questionId }) => questionId === "proverb-01-q07");
  assert.equal(answer.page, 8);
  assert.match(html, /data-lesson-search-input/);
  assert.match(html, /class="lesson-search-label"[^>]*>搜尋關鍵字</);
  assert.match(html, /data-clear-lesson-search/);
  assert.ok(html.indexOf('class="lesson-search-panel') < html.indexOf('data-lesson-choice-grid'), "search must appear directly before the lesson cards");
  assert.doesNotMatch(html, /SEARCH ALL LESSON CONTENT/);
  assert.match(css, /\.lesson-search-controls\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto\s+auto/s);
  assert.match(css, /\.lesson-search-controls input\s*\{[^}]*border:\s*2px/s);
  assert.match(app, /data-search-question/);
});

test("progress dashboard counts each Proverb question once across retries", () => {
  const source = functionSource("questionActivityRows", "progressRangeStart");
  const attempts = [{ id: "attempt-1", lessonId: "proverb-01", result: { rounds: [
    { round: 1, submittedAt: "2026-07-01T10:00:00.000Z", checkedIds: ["proverb-01-q01", "proverb-01-q01"], correctIds: [], incorrectIds: ["proverb-01-q01"] },
    { round: 2, submittedAt: "2026-07-02T10:00:00.000Z", checkedIds: ["proverb-01-q01", "proverb-01-q02"], correctIds: ["proverb-01-q01", "proverb-01-q02"], incorrectIds: [] }
  ] } }];
  const rows = runInSandbox(source, "questionActivityRows(input)", { input: attempts, state: { attempts: [] }, getQuestion: (_lessonId, questionId) => ({ id: questionId }) });
  assert.equal(rows.length, 2);
  assert.equal(rows.find(({ questionId }) => questionId.endsWith("q01")).time, Date.parse("2026-07-01T10:00:00.000Z"));
  assert.equal(rows.find(({ questionId }) => questionId.endsWith("q01")).correctedAt, Date.parse("2026-07-02T10:00:00.000Z"));
});

test("student-facing Proverb copy contains no round counter", () => {
  assert.doesNotMatch(`${html}\n${app}`, /第\s*\$?\{?[^\n<]{0,30}輪|分輪|改正輪/);
});
