#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { performance } from "node:perf_hooks";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (name) => readFile(new URL(name, root), "utf8");

const [
  expansionSource,
  dataSource,
  frontendSource,
  html,
  css,
  indexHtml,
  workerSource,
  supabaseSchema,
  bookmarkMigration,
  correctionMigration,
  lessonMigration
] = await Promise.all([
  read("sentence-structure-lessons-5-114.js"),
  read("sentence-structure-data.js"),
  read("sentence-structure.js"),
  read("sentence-structure.html"),
  read("sentence-structure.css"),
  read("index.html"),
  read("workers/sentence-structure/src/index.js"),
  read("supabase-sentence-structure.sql"),
  read("supabase-sentence-structure-section-bookmarks.sql"),
  read("supabase-sentence-structure-correction-state.sql"),
  read("supabase-sentence-structure-lessons-71-114.sql")
]);

const tests = [];
const test = (name, run) => tests.push({ name, run });
const occurrences = (text, fragment) => text.split(fragment).length - 1;
const normalText = (value) => String(value ?? "").trim();

function loadContent() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(expansionSource, sandbox, { filename: "sentence-structure-lessons-5-114.js" });
  vm.runInContext(dataSource, sandbox, { filename: "sentence-structure-data.js" });
  return sandbox.window.EDMUND_SENTENCE_STRUCTURE_DATA;
}

const content = loadContent();
const lessons = content.lessons;
const allQuestions = lessons.flatMap((lesson) => lesson.questions);
const importedLessonSources = await Promise.all(
  Array.from({ length: 110 }, (_, index) => index + 5)
    .map(async (number) => JSON.parse(
      await read(`tools/sentence-structure-lessons/ss${String(number).padStart(2, "0")}.json`)
    ))
);

function makeElement(seed = {}) {
  const attributes = new Map();
  const classes = new Set();
  const listeners = new Map();
  return {
    hidden: false,
    disabled: false,
    innerHTML: "",
    textContent: "",
    value: "",
    type: "text",
    dataset: {},
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
      toggle(name, force) {
        const enabled = force === undefined ? !classes.has(name) : Boolean(force);
        if (enabled) classes.add(name);
        else classes.delete(name);
        return enabled;
      }
    },
    addEventListener(type, callback) { listeners.set(type, callback); },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    removeAttribute(name) { attributes.delete(name); },
    toggleAttribute(name, force) {
      const enabled = force === undefined ? !attributes.has(name) : Boolean(force);
      if (enabled) attributes.set(name, "");
      else attributes.delete(name);
      return enabled;
    },
    querySelectorAll: () => [],
    scrollIntoView() {},
    reset() { this.value = ""; },
    ...seed,
    __attributes: attributes,
    __listeners: listeners
  };
}

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    clone() { return jsonResponse(payload, status); },
    async json() { return payload; }
  };
}

function createFrontendHarness() {
  const views = ["login", "dashboard", "lesson", "bookmarks", "admin"]
    .map((name) => makeElement({ dataset: { view: name } }));
  const steps = [1, 2, 3, 4].map((step) => makeElement({ dataset: { step: String(step) } }));
  const selectorMap = new Map();
  const selectors = [
    "[data-connection-status]", "[data-user-pill]", "[data-dashboard-button]",
    "[data-admin-students-button]", "[data-logout]", "[data-login-form]",
    "[data-login-button]", "[data-login-status]", "#sentence-structure-username",
    "#sentence-structure-password", "[data-password-toggle]", "[data-dashboard-welcome]",
    "[data-lesson-count]", "[data-lesson-choice-grid]", "[data-history-list]", "[data-lesson-round]",
    "[data-sentence-progress-toggle]", "[data-sentence-progress-toggle-label]", "[data-sentence-progress-panel]",
    "[data-sentence-progress-chart]", "[data-sentence-progress-period-total]",
    "[data-sentence-progress-all-total]", "[data-sentence-progress-active-days]",
    "[data-toggle-sentence-cumulative]", "[data-sentence-cumulative-legend]",
    "[data-sentence-progress-day-panel]", "[data-sentence-progress-day-title]",
    "[data-sentence-progress-day-list]",
    "[data-sentence-time-progress-chart]", "[data-sentence-time-all-total]",
    "[data-sentence-time-period-total]", "[data-sentence-time-average]",
    "[data-sentence-time-median]", "[data-sentence-time-maximum]",
    "[data-sentence-time-day-panel]", "[data-sentence-time-day-title]",
    "[data-sentence-time-day-list]",
    "[data-lesson-kicker]", "[data-lesson-title]", "[data-lesson-stepper]",
    "[data-lesson-content]", "[data-bookmark-list]", "[data-admin-search]",
    "[data-admin-student-count]", "[data-admin-student-list]", "[data-admin-detail]",
    "#sentence-structure-loading-template", "[data-toast]"
  ];
  selectors.forEach((selector) => selectorMap.set(selector, makeElement()));
  selectorMap.get("#sentence-structure-password").type = "password";
  selectorMap.get("#sentence-structure-loading-template").innerHTML = "<p>loading</p>";
  selectorMap.get("[data-lesson-stepper]").querySelectorAll = (selector) => selector === "[data-step]" ? steps : [];

  const controls = {
    partial: makeElement({ hidden: true }),
    all: makeElement(),
    copy: makeElement(),
    header: makeElement()
  };
  const answerInputs = [];
  const documentListeners = new Map();
  const document = {
    querySelector(selector) {
      if (selector === "[data-submit-partial]") return controls.partial;
      if (selector === "[data-submit-all]") return controls.all;
      if (selector === "[data-exercise-action-copy]") return controls.copy;
      if (selector === ".exercise-header") return controls.header;
      if (selector.startsWith("[data-question-id=")) return makeElement();
      return selectorMap.get(selector) ?? null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-view]") return views;
      if (selector === "[data-answer-input]") return answerInputs;
      const inputMatch = selector.match(/^\[data-answer-input="(.+)"\]$/);
      if (inputMatch) return answerInputs.filter((input) => input.dataset.answerInput === inputMatch[1].replaceAll("\\", ""));
      return [];
    },
    addEventListener(type, callback) { documentListeners.set(type, callback); }
  };

  const sessionValues = new Map();
  const sessionStorage = {
    getItem: (key) => sessionValues.get(key) ?? null,
    setItem: (key, value) => sessionValues.set(key, String(value)),
    removeItem: (key) => sessionValues.delete(key)
  };
  const localValues = new Map();
  const localStorage = {
    getItem: (key) => localValues.get(key) ?? null,
    setItem: (key, value) => localValues.set(key, String(value)),
    removeItem: (key) => localValues.delete(key)
  };
  const apiCalls = [];
  let apiHandler = async (url, options = {}) => {
    const pathname = new URL(url).pathname;
    if (pathname.startsWith("/v1/attempts/") && options.method === "PUT") {
      const body = JSON.parse(options.body);
      return jsonResponse({ attempt: { id: decodeURIComponent(pathname.split("/").at(-1)), ...body } });
    }
    if (pathname === "/v1/bookmarks" && options.method === "PUT") {
      return jsonResponse({ bookmarks: JSON.parse(options.body).bookmarks });
    }
    throw new Error(`Unexpected test API request: ${options.method || "GET"} ${pathname}`);
  };
  const fetch = async (url, options = {}) => {
    apiCalls.push({ url: String(url), options });
    return apiHandler(String(url), options);
  };

  const window = {
    EDMUND_SENTENCE_STRUCTURE_CONFIG: {
      workerBaseUrl: "https://sentence-structure.test",
      adminUsername: "admin",
      studentLoginRpc: "flashcard_student_login"
    },
    EDMUND_SUPABASE: { url: "https://supabase.test", anonKey: "anon" },
    EDMUND_SENTENCE_STRUCTURE_DATA: content,
    sessionStorage,
    localStorage,
    scrollY: 0,
    scrollTo() {},
    setTimeout: () => 1,
    clearTimeout() {},
    addEventListener() {}
  };
  window.window = window;

  const context = {
    window,
    document,
    sessionStorage,
    localStorage,
    fetch,
    Headers,
    crypto: webcrypto,
    performance,
    CSS: { escape: (value) => String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&") },
    requestAnimationFrame: (callback) => callback(),
    console,
    URL,
    Intl,
    Date,
    Promise,
    JSON,
    Math,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Set,
    Map,
    Error,
    encodeURIComponent,
    decodeURIComponent
  };
  vm.createContext(context);

  const initialisation = /\ninitialise\(\)\.catch\(\(error\) => \{[\s\S]*?\n\}\);\s*$/;
  assert.match(frontendSource, initialisation, "test harness could not locate the frontend bootstrap");
  const instrumented = frontendSource.replace(initialisation, `
window.__SENTENCE_STRUCTURE_TEST__ = {
  state, elements, LESSON_PAGES, MAX_BOOKMARKS,
  getLesson, getQuestion, createExercise, exerciseFromAttempt,
  studentLogin, openLesson, setLessonPage, renderLessonPage, renderExercisePage, renderLessonChoices,
  currentProgressQuestionId, focusExerciseQuestion,
  syncExerciseButtons, submitExercise, startNextRound,
  startCorrectionRound, exitCorrectionRound, toggleCorrectCard, toggleAllCorrectCards,
  clearQuestionAnswer,
  wrongQuestionIds, correctionQuestions, submissionQuestions,
  highlightedAnswerHtml, questionAnswerParts, storedAnswerPartValues,
  combinedAnswerPartValue, suggestedAnswerHtml, missingAnswerMarkup, comparedAnswerHtml, normalizeAnswer, answersMatch,
  normalizeBookmark, normalizeAttempt, attemptHistoryHtml,
  renderBookmarks, bookmarkAnswerAvailable, toggleBookmark, toggleSectionBookmark, saveBookmarks, renderAdminStudents, openAdminStudent,
  readProgressPanelPreference, writeProgressPanelPreference, renderProgressPanelDisclosure, toggleProgressPanel,
  readCumulativeProgressPreference, writeCumulativeProgressPreference, toggleCumulativeProgress,
  loadAllAttempts, loadDashboardData, questionActivityRows, buildQuestionProgressSeries, questionProgressChartSvg,
  renderProgressDashboard, renderProgressDayPanel,
  medianDuration, timedSentenceAttempts, buildSentenceTimeSeries, sentenceTimeProgressChartSvg,
  renderSentenceTimeDashboard, renderSentenceTimeDayPanel, formatDuration,
  renderAttemptHistory,
  serializeExerciseResult, persistExercise
};
`);
  vm.runInContext(instrumented, context, { filename: "sentence-structure.js" });

  return {
    apiCalls,
    answerInputs,
    controls,
    steps,
    selectorMap,
    sessionValues,
    localValues,
    sut: window.__SENTENCE_STRUCTURE_TEST__,
    setApiHandler(handler) { apiHandler = handler; }
  };
}

test("data contract contains 114 complete 50-question lessons", () => {
  assert.ok(Object.isFrozen(content), "top-level content should be immutable");
  assert.equal(content.version, 1);
  const expectedIds = Array.from({ length: 114 }, (_, index) => `ss${index + 1}`);
  assert.equal(lessons.length, expectedIds.length);
  assert.deepEqual(Array.from(lessons, (lesson) => lesson.id), expectedIds);
  assert.deepEqual(
    Array.from(lessons, (lesson) => lesson.questions.length),
    Array.from({ length: expectedIds.length }, () => 50)
  );
  assert.equal(allQuestions.length, 5700);
  assert.equal(new Set(allQuestions.map((question) => question.id)).size, 5700);
  assert.equal(new Set(lessons.map((lesson) => lesson.source.file)).size, expectedIds.length);
  assert.ok(lessons.every((lesson) => lesson.source.file.endsWith(".pdf")));
  assert.deepEqual(
    JSON.parse(JSON.stringify(lessons.slice(4))),
    importedLessonSources,
    "the public expansion bundle must match its 110 auditable JSON sources"
  );
});

test("frontend, Worker, and Supabase attempt-result contracts stay aligned", () => {
  const resultKeys = [
    "round", "correctIds", "questionState", "rounds", "awaitingNextRound",
    "correctionMode", "correctionIds", "collapsedCorrectIds", "contentVersion"
  ];
  for (const key of resultKeys) {
    assert.ok(frontendSource.includes(key), `frontend result contract is missing ${key}`);
    assert.ok(workerSource.includes(`\"${key}\"`), `Worker result contract is missing ${key}`);
    assert.ok(supabaseSchema.includes(`'${key}'`), `Supabase result contract is missing ${key}`);
  }
  assert.match(supabaseSchema, /v_key_count not in \(6, 9\)/, "Supabase must accept legacy and correction-state results");
  assert.match(frontendSource, /rounds: state\.exercise\.rounds\.slice\(-250\)/, "client history must respect the server round limit");
  assert.match(frontendSource, /maxlength="1000"[^>]+data-answer-input=/, "answer inputs must respect the server answer limit");
  assert.match(frontendSource, /const MAX_BOOKMARKS = 6000;/, "frontend bookmark capacity must cover the expanded corpus");
  assert.match(workerSource, /const MAX_BOOKMARKS = 6000;/, "Worker bookmark capacity must match the frontend");
  assert.match(supabaseSchema, /jsonb_array_length\(p_bookmarks\) > 6000/, "Supabase bookmark capacity must match the frontend");
  assert.match(supabaseSchema, /octet_length\(p_bookmarks::text\) > 524288/, "Supabase bookmark payload size must cover the expanded corpus");
  assert.match(workerSource, /const SECTION_BOOKMARK_ID = "__section__";/);
  assert.match(supabaseSchema, /question_id = '__section__'/);
  assert.match(bookmarkMigration, /question_id = '__section__' and include_answer = false/,
    "the database constraint must prevent a lesson bookmark from exposing a synthetic answer");
  assert.match(bookmarkMigration, /drop constraint if exists sentence_structure_bookmarks_check/i,
    "the migration must remove the unnamed legacy question-id constraint used in production");
  assert.match(bookmarkMigration, /on conflict on constraint sentence_structure_bookmarks_pkey do update/i,
    "bookmark replacement must avoid PL/pgSQL output-column ambiguity");
  assert.doesNotMatch(bookmarkMigration, /on conflict \(student_id, lesson_id, question_id\)/i);

  const functionSql = (source, functionName) => {
    const functionMarker = `create or replace function public.${functionName}(`;
    const start = source.indexOf(functionMarker);
    assert.ok(start >= 0, `${functionName} is missing`);
    const end = source.indexOf("\n$$;", start);
    assert.ok(end > start, `${functionName} is incomplete`);
    return source.slice(start, end + 4).trim();
  };
  const historicalCorrectionValidator = functionSql(
    correctionMigration,
    "_sentence_structure_result_valid"
  );
  for (const functionName of [
    "_sentence_structure_bookmark_payload_valid",
    "sentence_structure_replace_bookmarks"
  ]) {
    assert.equal(
      functionSql(bookmarkMigration, functionName),
      functionSql(supabaseSchema, functionName),
      `${functionName} bookmark migration must match the base schema`
    );
  }
  for (const key of ["correctionMode", "correctionIds", "collapsedCorrectIds"]) {
    assert.ok(
      historicalCorrectionValidator.includes(`'${key}'`),
      `historical correction-state migration must introduce ${key}`
    );
  }
  for (const functionName of [
    "_sentence_structure_result_valid",
    "_sentence_structure_bookmark_payload_valid",
    "sentence_structure_list_bookmarks",
    "sentence_structure_list_bookmarks_page",
    "sentence_structure_admin_list_bookmarks",
    "sentence_structure_admin_list_bookmarks_page",
    "sentence_structure_upsert_attempt"
  ]) {
    assert.equal(
      functionSql(lessonMigration, functionName),
      functionSql(supabaseSchema, functionName),
      `${functionName} lesson migration must match the base schema`
    );
  }
  assert.match(
    lessonMigration,
    /sentence_structure_attempts_lesson_id_check[\s\S]+check \(lesson_id ~ '\^ss\(\[1-9\]\|\[1-9\]\[0-9\]\|10\[0-9\]\|11\[0-4\]\)\$'\)/
  );
  assert.match(
    lessonMigration,
    /sentence_structure_bookmarks_lesson_id_check[\s\S]+check \(lesson_id ~ '\^ss\(\[1-9\]\|\[1-9\]\[0-9\]\|10\[0-9\]\|11\[0-4\]\)\$'\)/
  );
  assert.match(workerSource, /const BOOKMARK_PAGE_SIZE = 900;/);
  assert.ok(workerSource.includes("sentence_structure_list_bookmarks_page"));
  assert.ok(workerSource.includes("sentence_structure_admin_list_bookmarks_page"));
  assert.ok(workerSource.includes("postgresJsonbTextByteLength(normalized)"));
});

test("every question preserves the bilingual exercise and answer contract", () => {
  const requiredText = ["id", "prompt", "promptZh", "starter", "answer", "answerZh", "highlight"];
  for (const lesson of lessons) {
    assert.ok(normalText(lesson.title));
    assert.ok(normalText(lesson.titleEn));
    assert.ok(Array.isArray(lesson.formulas) && lesson.formulas.length > 0);
    assert.ok(Array.isArray(lesson.examples) && lesson.examples.length > 0);
    assert.ok(Array.isArray(lesson.rules) && lesson.rules.length > 0);
    assert.ok(Array.isArray(lesson.benefits) && lesson.benefits.length > 0);
    assert.ok(Array.isArray(lesson.instructions.en) && lesson.instructions.en.length > 0);
    assert.ok(Array.isArray(lesson.instructions.zh) && lesson.instructions.zh.length > 0);

    const promptKeys = new Set();
    const answerKeys = new Set();
    const answerOwners = new Map();
    const highlights = new Set();
    lesson.questions.forEach((question, index) => {
      assert.equal(question.number, index + 1, `${question.id}: numbering`);
      for (const field of requiredText) assert.ok(normalText(question[field]), `${question.id}: missing ${field}`);
      assert.ok(question.answer.toLocaleLowerCase().startsWith(question.starter.toLocaleLowerCase()), `${question.id}: starter does not prefix answer`);
      assert.equal(occurrences(question.answer.toLocaleLowerCase(), question.highlight.toLocaleLowerCase()), 1, `${question.id}: highlight must occur exactly once`);
      if (
        question.cue !== undefined
        || question.cueSource !== undefined
        || question.source?.cuePage !== undefined
      ) {
        assert.ok(normalText(question.cue), `${question.id}: missing cue`);
        assert.equal(question.cueSource, "pdf", `${question.id}: cueSource must be pdf`);
        assert.ok(
          Number.isInteger(question.source?.cuePage)
            && question.source.cuePage >= 1
            && question.source.cuePage <= lesson.source.pageCount,
          `${question.id}: invalid cuePage`
        );
      }
      if (question.answerParts !== undefined) {
        assert.ok(Array.isArray(question.answerParts) && question.answerParts.length >= 2, `${question.id}: invalid answerParts`);
        for (const part of question.answerParts) {
          for (const field of ["label", "starter", "answer", "answerZh"]) {
            assert.ok(normalText(part[field]), `${question.id}: answerParts missing ${field}`);
          }
          assert.ok(part.answer.toLocaleLowerCase().startsWith(part.starter.toLocaleLowerCase()), `${question.id}: answerParts starter mismatch`);
        }
        assert.equal(
          question.answer,
          question.answerParts.map((part) => `${part.label}: ${part.answer}`).join(" || "),
          `${question.id}: combined answerParts mismatch`
        );
      }
      assert.match(question.id, new RegExp(`^${lesson.id}-q\\d{2}$`));
      for (const pageField of ["numberPage", "questionPage", "starterPage", "answerNumberPage", "answerPage"]) {
        assert.ok(Number.isInteger(question.source[pageField]), `${question.id}: invalid ${pageField}`);
        assert.ok(question.source[pageField] >= 1 && question.source[pageField] <= lesson.source.pageCount, `${question.id}: ${pageField} out of range`);
      }
      const promptKey = `${question.prompt}\u0000${question.promptZh}`;
      const answerKey = `${question.answer}\u0000${question.answerZh}`;
      assert.ok(!promptKeys.has(promptKey), `${lesson.id}: duplicate prompt`);
      if (answerKeys.has(answerKey)) {
        assert.equal(
          question.duplicateAnswerOf,
          answerOwners.get(answerKey),
          `${question.id}: duplicate answer must link to its source-identical predecessor`
        );
      } else {
        assert.equal(
          question.duplicateAnswerOf,
          undefined,
          `${question.id}: duplicateAnswerOf requires a duplicate bilingual answer`
        );
      }
      assert.ok(!highlights.has(question.highlight), `${lesson.id}: duplicate target highlight`);
      promptKeys.add(promptKey);
      answerKeys.add(answerKey);
      if (!answerOwners.has(answerKey)) answerOwners.set(answerKey, question.id);
      highlights.add(question.highlight);
    });
  }

  const editorialAnswers = allQuestions.filter((question) => question.answerZhSource !== "pdf");
  assert.deepEqual(Array.from(editorialAnswers, ({ id, answerZhSource }) => ({ id, answerZhSource })), [
    { id: "ss2-q50", answerZhSource: "editorial-missing-in-pdf" },
    { id: "ss9-q03", answerZhSource: "editorial-translation-of-revised-answer" },
    { id: "ss9-q09", answerZhSource: "editorial-translation-of-revised-answer" },
    { id: "ss9-q13", answerZhSource: "editorial-translation-of-revised-answer" },
    { id: "ss9-q20", answerZhSource: "editorial-translation-of-revised-answer" },
    { id: "ss9-q25", answerZhSource: "editorial-translation-of-revised-answer" },
    { id: "ss9-q48", answerZhSource: "editorial-translation-of-revised-answer" }
  ]);
});

test("HTML, CSS, and navigation expose all required system surfaces", () => {
  assert.match(html, /<html[^>]+lang="zh-Hant"/);
  assert.match(html, /data-login-form/);
  assert.match(html, /同一個學生帳戶登入/);
  for (const view of ["login", "dashboard", "lesson", "bookmarks", "admin"]) {
    assert.match(html, new RegExp(`data-view="${view}"`));
  }
  assert.equal((html.match(/data-step="[1-4]"/g) || []).length, 4);
  assert.match(html, /data-history-list/);
  assert.match(html, /data-sentence-progress-chart/);
  assert.match(html, /data-sentence-progress-toggle[^>]+aria-expanded="false"/);
  assert.match(html, /data-sentence-progress-panel[^>]+hidden/);
  assert.ok(
    html.indexOf("data-sentence-progress-toggle") < html.indexOf("data-lesson-choice-grid"),
    "progress disclosure must sit immediately above the long lesson grid"
  );
  assert.equal((html.match(/data-sentence-progress-range=/g) || []).length, 6);
  assert.match(html, /data-toggle-sentence-cumulative[^>]+aria-pressed="false"/);
  assert.match(html, /data-sentence-cumulative-legend[^>]+hidden/);
  assert.match(html, /data-sentence-progress-day-list/);
  assert.match(html, /data-sentence-time-progress-chart/);
  assert.equal((html.match(/data-sentence-time-progress-range=/g) || []).length, 6);
  assert.match(html, /data-sentence-time-all-total/);
  assert.match(html, /data-sentence-time-day-list/);
  assert.ok(
    html.indexOf("data-sentence-progress-day-list") < html.indexOf("data-sentence-time-progress-chart"),
    "the time dashboard must follow the completed-question dashboard"
  );
  assert.match(html, /data-bookmark-list/);
  assert.match(html, /data-admin-student-list/);
  assert.match(html, /data-admin-detail/);
  assert.match(html, /data-lesson-count>114</);
  const configAt = html.indexOf('src="sentence-structure-config.js"');
  const expansionAt = html.indexOf('src="sentence-structure-lessons-5-114.js');
  const dataAt = html.indexOf('src="sentence-structure-data.js');
  const appAt = html.indexOf('type="module" src="sentence-structure.js');
  assert.ok(
    configAt >= 0
      && configAt < expansionAt
      && expansionAt < dataAt
      && dataAt < appAt,
    "config, expansion, data, and module scripts must load in order"
  );
  assert.match(css, /\.target-highlight\s*\{[^}]*color:\s*#d32727/i);
  assert.match(css, /\.target-highlight\s*\{[^}]*font-weight:\s*900/i);
  assert.match(css, /\.login-hero \.eyebrow\s*\{[^}]*font-size:\s*clamp\(18px,[^}]*22px\)/i);
  assert.match(css, /\.benefit-card \.chinese\s*\{[^}]*font-size:\s*clamp\(16px,[^}]*18px\)[^}]*font-weight:\s*800/i);
  assert.match(css, /\.benefit-card \.english\s*\{[^}]*color:\s*var\(--muted\)[^}]*font-size:\s*14px/i);
  assert.match(css, /\.rule-card \.chinese\s*\{[^}]*font-size:\s*clamp\(16px,[^}]*18px\)[^}]*font-weight:\s*800/i);
  assert.match(css, /\.rule-card \.english\s*\{[^}]*color:\s*var\(--muted\)[^}]*font-size:\s*14px/i);
  assert.match(css, /\.lesson-choice\.is-complete\s*\{[^}]*linear-gradient/i);
  assert.match(css, /\.sentence-legend-cumulative\s*\{[^}]*#7e22ce/i);
  assert.match(css, /\.sentence-legend-time\s*\{[^}]*#ff914d/i);
  assert.match(css, /\.lesson-section-bookmark\s*\{/);
  assert.match(css, /\.bookmark-columns\s*\{[^}]*grid-template-columns:\s*repeat\(2/i);
  assert.match(css, /\.missing-answer-highlight\s*\{[^}]*background:\s*#ffe56f/i);
  assert.doesNotMatch(frontendSource, /choice-icon/);
  assert.doesNotMatch(frontendSource, /題練習<\/span>/);
  assert.doesNotMatch(frontendSource, /由公式開始/);
  assert.equal((indexHtml.match(/href=["']sentence-structure\.html["']/g) || []).length, 1, "homepage must link to Sentence Structure exactly once");
});

test("frontend source keeps shared login, persistence, and click wiring intact", () => {
  assert.match(frontendSource, /studentLoginRpc\s*\|\|\s*"flashcard_student_login"/);
  assert.match(frontendSource, /p_name:\s*username/);
  assert.match(frontendSource, /p_password:\s*password/);
  assert.match(frontendSource, /row\?\.session_token/);
  assert.match(frontendSource, /sessionStorage\.setItem\(SESSION_KEY/);
  assert.match(frontendSource, /localStorage\.setItem\(key, expanded \? "expanded" : "collapsed"\)/,
    "only the account-keyed dashboard disclosure preference should persist locally");
  assert.doesNotMatch(frontendSource, /localStorage\.setItem\(SESSION_KEY/,
    "authentication must remain session-scoped");
  assert.match(frontendSource, /const LESSON_PAGES = 4/);
  assert.match(frontendSource, /data-submit-partial[^\n]+submitExercise\("partial"\)/);
  assert.match(frontendSource, /data-submit-all[^\n]+submitExercise\("all"\)/);
  for (const endpoint of ["/v1/attempts", "/v1/bookmarks", "/v1/admin/students"]) assert.ok(frontendSource.includes(endpoint));
});

test("answer normalization and red target markup are safe and deterministic", () => {
  const { sut } = createFrontendHarness();
  assert.equal(sut.normalizeAnswer("  “HELLO”  world ! "), '"hello" world');
  assert.equal(sut.normalizeAnswer("I eat           apples."), "i eat apples");
  const studentVariant = sut.normalizeAnswer("Lily got up early to catch the first bus!");
  const modelVariant = sut.normalizeAnswer("lily got up early to catch the first bus.");
  assert.equal(studentVariant, modelVariant);
  assert.ok(sut.answersMatch("Lily got up early to catch the first bus!", {
    answer: "lily got up early to catch the first bus."
  }));
  assert.ok(sut.answersMatch("an accepted variant", {
    answer: "model answer",
    acceptedAnswers: ["An accepted variant."]
  }));
  assert.ok(!sut.answersMatch("almost right", { answer: "right" }));
  assert.ok(sut.answersMatch("I practice English every day.", { answer: "I practise English every day." }));
  assert.ok(sut.answersMatch("The center has colorful programs.", { answer: "The centre has colourful programmes." }));
  assert.match(workerSource, /practise:\s*"practice"/);
  assert.match(workerSource, /normalised|normalized/);
  assert.equal(
    sut.highlightedAnswerHtml("A <tag> target & end.", "target"),
    "A &lt;tag&gt; <span class=\"target-highlight\">target</span> &amp; end."
  );
});

test("wrong-answer hints mark missing words, articles, and plural corrections in yellow", () => {
  const { sut } = createFrontendHarness();
  const missingVerb = sut.missingAnswerMarkup("I eat apples.", "I apples.");
  assert.equal(missingVerb.missingCount, 1);
  assert.match(missingVerb.html, /<mark class="missing-answer-highlight">eat<\/mark>/);
  const missingArticle = sut.missingAnswerMarkup("She bought an umbrella.", "She bought umbrella.");
  assert.match(missingArticle.html, /<mark class="missing-answer-highlight">an<\/mark>/);
  const missingPlural = sut.missingAnswerMarkup("I eat apples.", "I eat apple.");
  assert.match(missingPlural.html, /apple<mark class="missing-answer-highlight">s<\/mark>/);
  const spellingVariant = sut.missingAnswerMarkup("We practised in the centre.", "We practiced in the center.");
  assert.equal(spellingVariant.missingCount, 0, "British and American variants must align in the hint diff");
  assert.equal(
    sut.missingAnswerMarkup("I <eat> apples.", "I apples.").html,
    "I &lt;<mark class=\"missing-answer-highlight\">eat</mark>&gt; apples.",
    "hint markup must escape source punctuation safely"
  );
});

test("two-part Whether and If questions retain both required answers", () => {
  const { sut } = createFrontendHarness();
  const question = sut.getQuestion("ss32", "ss32-q01");
  const parts = sut.questionAnswerParts(question);
  assert.equal(parts.length, 2);
  assert.deepEqual(Array.from(parts, (part) => part.label), ["Whether", "If"]);
  const combined = sut.combinedAnswerPartValue(
    question,
    Array.from(parts, (part) => part.answer)
  );
  assert.equal(combined, question.answer);
  assert.deepEqual(
    Array.from(sut.storedAnswerPartValues(question, combined)),
    Array.from(parts, (part) => part.answer)
  );
  assert.ok(sut.answersMatch(combined, question));
  assert.match(sut.suggestedAnswerHtml(question), /Whether/);
  assert.match(sut.suggestedAnswerHtml(question), />If</);
});

test("four lesson pages render in order and answers stay secret before submit", () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  sut.state.user = { id: "student-1", name: "Test Student", role: "student" };
  sut.state.authToken = "student-token";
  const attempt = {
    id: "11111111-1111-4111-8111-111111111111",
    lessonId: "ss1",
    lessonVersion: "1",
    status: "in_progress",
    roundNumber: 1,
    correctCount: 0,
    totalCount: 50,
    durationMs: 0,
    startedAt: new Date().toISOString(),
    result: {}
  };
  sut.openLesson("ss1", { page: 1, attempt });
  assert.match(sut.elements.lessonContent.innerHTML, /FORMULA \+ EXAMPLE/);
  assert.ok(sut.elements.lessonContent.innerHTML.includes(`<span class="target-highlight">${lessons[0].examples[0].highlight}</span>`));
  sut.setLessonPage(2);
  assert.match(sut.elements.lessonContent.innerHTML, /WHY THIS STRUCTURE HELPS/);
  const firstBenefitCard = sut.elements.lessonContent.innerHTML.match(/<li class="benefit-card">[\s\S]*?<\/li>/)?.[0] || "";
  assert.ok(firstBenefitCard.includes(lessons[0].benefits[0].zh));
  assert.ok(firstBenefitCard.includes(lessons[0].benefits[0].en));
  assert.ok(
    firstBenefitCard.indexOf('class="chinese"') < firstBenefitCard.indexOf('class="english"'),
    "Benefits must present Chinese before English"
  );
  sut.setLessonPage(3);
  assert.match(sut.elements.lessonContent.innerHTML, /IMPORTANT REMINDERS/);
  const firstRuleCard = sut.elements.lessonContent.innerHTML.match(/<li class="rule-card">[\s\S]*?<\/li>/)?.[0] || "";
  assert.ok(firstRuleCard.includes(lessons[0].rules[0].zh));
  assert.ok(firstRuleCard.includes(lessons[0].rules[0].en));
  assert.ok(
    firstRuleCard.indexOf('class="chinese"') < firstRuleCard.indexOf('class="english"'),
    "Important Rules must present Chinese before English"
  );
  sut.setLessonPage(4);
  const exerciseHtml = sut.elements.lessonContent.innerHTML;
  assert.equal((exerciseHtml.match(/data-answer-input=/g) || []).length, 50);
  assert.doesNotMatch(exerciseHtml, /answer-reveal/);
  assert.doesNotMatch(exerciseHtml, /target-highlight/);
  assert.ok(!exerciseHtml.includes(lessons[0].questions[49].answer), "model answers must not be rendered before checking");
  assert.equal(sut.LESSON_PAGES, 4);
  assert.equal(harness.steps.filter((step) => step.getAttribute("aria-current") === "step").length, 1);

  const althoughLesson = lessons[3];
  sut.openLesson("ss4", {
    page: 1,
    attempt: {
      ...attempt,
      id: "14444444-4444-4444-8444-444444444444",
      lessonId: "ss4"
    }
  });
  assert.match(sut.elements.lessonContent.innerHTML, /MEANING · 句型意思/);
  assert.ok(sut.elements.lessonContent.innerHTML.includes(althoughLesson.meaning.zh[0]));
  assert.ok(sut.elements.lessonContent.innerHTML.includes(althoughLesson.examples[0].highlight));

  const evenLesson = sut.getLesson("ss20");
  sut.openLesson("ss20", {
    page: 1,
    attempt: {
      ...attempt,
      id: "20000000-0000-4000-8000-000000000020",
      lessonId: "ss20"
    }
  });
  assert.equal(typeof evenLesson.meaning.zh, "string");
  assert.match(sut.elements.lessonContent.innerHTML, /MEANING · 句型意思/);
  assert.ok(sut.elements.lessonContent.innerHTML.includes(evenLesson.meaning.zh));

  const cueLesson = sut.getLesson("ss96");
  assert.equal(cueLesson.questions.filter((question) => question.cue).length, 50);
  sut.openLesson("ss96", {
    page: 4,
    attempt: {
      ...attempt,
      id: "96000000-0000-4000-8000-000000000096",
      lessonId: "ss96"
    }
  });
  assert.equal((sut.elements.lessonContent.innerHTML.match(/class="question-cue"/g) || []).length, 50);
  assert.ok(sut.elements.lessonContent.innerHTML.includes(cueLesson.questions[0].cue));
});

test("partial submit checks only filled answers, reveals targets, and preserves the next round", async () => {
  const harness = createFrontendHarness();
  const { sut, answerInputs, controls, apiCalls } = harness;
  const lesson = sut.getLesson("ss1");
  const [q1, q2, q3] = lesson.questions;
  sut.state.user = { id: "student-1", name: "Test Student", role: "student" };
  sut.state.authToken = "student-token";
  sut.state.lessonId = lesson.id;
  sut.state.lessonPage = 4;
  sut.state.exercise = sut.exerciseFromAttempt({
    id: "22222222-2222-4222-8222-222222222222",
    lessonId: lesson.id,
    lessonVersion: "1",
    roundNumber: 1,
    totalCount: 50,
    result: {}
  });
  sut.state.bookmarks = [
    { lessonId: lesson.id, questionId: q1.id, includeAnswer: false, createdAt: "" },
    { lessonId: lesson.id, questionId: q2.id, includeAnswer: false, createdAt: "" }
  ];

  answerInputs.push(
    makeElement({ dataset: { answerInput: q1.id }, value: q1.answer }),
    makeElement({ dataset: { answerInput: q2.id }, value: "not the model answer" })
  );
  sut.syncExerciseButtons();
  assert.equal(controls.partial.hidden, false);
  assert.match(controls.copy.textContent, /已輸入 2 \/ 50 題/);

  await sut.submitExercise("partial");
  assert.deepEqual(Array.from(sut.state.exercise.correctIds), [q1.id]);
  assert.equal(sut.state.exercise.questionState[q1.id].status, "correct");
  assert.equal(sut.state.exercise.questionState[q2.id].status, "wrong");
  assert.equal(sut.state.exercise.questionState[q3.id], undefined, "blank question must remain untouched by a partial submit");
  assert.equal(sut.state.exercise.awaitingNextRound, false);
  assert.equal(sut.state.exercise.rounds.length, 1);
  assert.deepEqual(Array.from(sut.state.exercise.rounds[0].checkedIds), [q1.id, q2.id]);
  assert.deepEqual(Array.from(sut.state.exercise.rounds[0].incorrectIds), [q2.id]);
  assert.equal(sut.state.bookmarks[0].includeAnswer, true, "correct bookmarked answers should be upgraded");
  assert.equal(sut.state.bookmarks[1].includeAnswer, false, "wrong bookmarked answers must remain question-only");
  assert.match(sut.elements.lessonContent.innerHTML, /missing-answer-highlight/);
  assert.ok(sut.elements.lessonContent.innerHTML.includes(q2.answerZh));
  assert.ok(!sut.elements.lessonContent.innerHTML.includes(q3.answer));
  assert.match(sut.elements.lessonContent.innerHTML, /question-card is-correct/);
  assert.ok(sut.elements.lessonContent.innerHTML.includes(`data-toggle-correct-card="${q1.id}"`));
  assert.match(sut.elements.lessonContent.innerHTML, /data-toggle-all-correct-cards/);
  assert.match(sut.elements.lessonContent.innerHTML, /隱藏所有已完成題目/);
  assert.equal((sut.elements.lessonContent.innerHTML.match(/data-answer-input=/g) || []).length, 50, "correct cards stay visible after checking");

  await sut.toggleCorrectCard(q1.id);
  assert.deepEqual(Array.from(sut.state.exercise.collapsedCorrectIds), [q1.id]);
  assert.match(sut.elements.lessonContent.innerHTML, /is-collapsed/);
  assert.match(sut.elements.lessonContent.innerHTML, /顯示已完成題目/);
  await sut.toggleCorrectCard(q1.id);
  assert.deepEqual(Array.from(sut.state.exercise.collapsedCorrectIds), []);

  await sut.toggleAllCorrectCards();
  assert.deepEqual(Array.from(sut.state.exercise.collapsedCorrectIds), [q1.id]);
  assert.match(sut.elements.lessonContent.innerHTML, /展開所有已完成題目/);
  assert.match(sut.elements.lessonContent.innerHTML, /data-toggle-all-correct-cards aria-pressed="true"/);
  await sut.toggleAllCorrectCards();
  assert.deepEqual(Array.from(sut.state.exercise.collapsedCorrectIds), []);
  assert.match(sut.elements.lessonContent.innerHTML, /隱藏所有已完成題目/);

  const attemptPut = apiCalls.find((call) => new URL(call.url).pathname.startsWith("/v1/attempts/"));
  assert.ok(attemptPut, "partial result must be persisted");
  const persisted = JSON.parse(attemptPut.options.body);
  assert.equal(persisted.status, "in_progress");
  assert.equal(persisted.correctCount, 1);
  assert.equal(persisted.totalCount, 50);
  assert.equal(persisted.result.rounds[0].kind, "partial");

  await sut.submitExercise("all");
  assert.equal(sut.state.exercise.awaitingNextRound, true);
  assert.equal(sut.state.exercise.rounds.at(-1).kind, "all");
  assert.equal(sut.state.exercise.rounds.at(-1).checkedIds.length, 49);
  answerInputs.splice(0);
  await sut.startNextRound();
  assert.equal(sut.state.exercise.round, 2);
  assert.equal(sut.state.exercise.awaitingNextRound, false);
  assert.equal(sut.state.exercise.questionState[q2.id].status, "pending");
  assert.equal(sut.state.exercise.questionState[q2.id].reveal, false);
  assert.deepEqual(Array.from(sut.state.exercise.correctIds), [q1.id], "correct answers must not return next round");
  assert.equal((sut.elements.lessonContent.innerHTML.match(/data-answer-input=/g) || []).length, 50, "completed cards remain available for reference in later rounds");
});

test("a failed attempt sync resumes the active exercise stopwatch", async () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  const lesson = sut.getLesson("ss1");
  sut.state.user = { id: "student-1", name: "Test Student", role: "student" };
  sut.state.authToken = "student-token";
  sut.state.currentView = "lesson";
  sut.state.lessonId = lesson.id;
  sut.state.lessonPage = 4;
  sut.state.exercise = sut.exerciseFromAttempt({
    id: "23333333-3333-4333-8333-333333333333",
    lessonId: lesson.id,
    lessonVersion: "1",
    roundNumber: 1,
    totalCount: 50,
    result: {}
  });
  sut.state.exerciseClockStartedAt = performance.now();
  harness.setApiHandler(async () => jsonResponse(
    { error: "Temporary upstream failure", code: "SUPABASE_UNAVAILABLE" },
    503
  ));

  await assert.rejects(() => sut.persistExercise(), /Temporary upstream failure/);
  assert.ok(
    sut.state.exerciseClockStartedAt > 0,
    "the stopwatch must restart even when persistence rejects"
  );
});

test("bulk completed-card visibility handles mixed cards and preserves the current scope", async () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  const lesson = sut.getLesson("ss1");
  const [q1, q2] = lesson.questions;
  sut.state.user = { id: "student-1", name: "Test Student", role: "student" };
  sut.state.authToken = "student-token";
  sut.state.currentView = "lesson";
  sut.state.lessonId = lesson.id;
  sut.state.lessonPage = 4;
  sut.state.exercise = sut.exerciseFromAttempt({
    id: "24444444-4444-4444-8444-444444444444",
    lessonId: lesson.id,
    lessonVersion: "1",
    roundNumber: 2,
    totalCount: 50,
    result: {
      round: 2,
      correctIds: [q1.id, q2.id],
      questionState: {
        [q1.id]: { status: "correct", lastAnswer: q1.answer, reveal: true },
        [q2.id]: { status: "correct", lastAnswer: q2.answer, reveal: true }
      },
      rounds: [],
      awaitingNextRound: false,
      correctionMode: false,
      correctionIds: [],
      collapsedCorrectIds: [q1.id],
      contentVersion: "1"
    }
  });

  sut.renderExercisePage(lesson);
  assert.match(sut.elements.lessonContent.innerHTML, /隱藏所有已完成題目/, "a mixed state must offer to hide all");
  await sut.toggleAllCorrectCards();
  assert.deepEqual(Array.from(sut.state.exercise.collapsedCorrectIds), [q1.id, q2.id]);
  assert.equal((sut.elements.lessonContent.innerHTML.match(/question-card is-correct is-collapsed/g) || []).length, 2);
  assert.match(sut.elements.lessonContent.innerHTML, /展開所有已完成題目/);
  await sut.toggleAllCorrectCards();
  assert.deepEqual(Array.from(sut.state.exercise.collapsedCorrectIds), []);

  sut.state.exercise.correctionMode = true;
  sut.state.exercise.correctionIds = [q2.id];
  sut.state.exercise.collapsedCorrectIds = [q1.id];
  sut.renderExercisePage(lesson);
  await sut.toggleAllCorrectCards();
  assert.deepEqual(Array.from(sut.state.exercise.collapsedCorrectIds), [q1.id, q2.id], "hiding the correction scope keeps hidden cards outside it unchanged");
  await sut.toggleAllCorrectCards();
  assert.deepEqual(Array.from(sut.state.exercise.collapsedCorrectIds), [q1.id], "expanding the correction scope keeps hidden cards outside it unchanged");

  const resumed = sut.exerciseFromAttempt({
    id: sut.state.exercise.id,
    lessonId: lesson.id,
    lessonVersion: "1",
    roundNumber: 2,
    totalCount: 50,
    result: sut.serializeExerciseResult()
  });
  assert.deepEqual(Array.from(resumed.collapsedCorrectIds), [q1.id], "bulk visibility state survives result serialization");
});

test("wrong answers can enter an immediate correction round and return to the unfinished set", async () => {
  const harness = createFrontendHarness();
  const { sut, answerInputs, apiCalls } = harness;
  const lesson = sut.getLesson("ss1");
  const [q1, q2] = lesson.questions;
  sut.state.user = { id: "student-1", name: "Test Student", role: "student" };
  sut.state.authToken = "student-token";
  sut.state.currentView = "lesson";
  sut.state.lessonId = lesson.id;
  sut.state.lessonPage = 4;
  sut.state.exercise = sut.exerciseFromAttempt({
    id: "33333333-3333-4333-8333-333333333333",
    lessonId: lesson.id,
    lessonVersion: "1",
    roundNumber: 1,
    totalCount: 50,
    result: {}
  });
  answerInputs.push(
    makeElement({ dataset: { answerInput: q1.id }, value: q1.answer }),
    makeElement({ dataset: { answerInput: q2.id }, value: "wrong answer" })
  );

  await sut.submitExercise("partial");
  assert.match(sut.elements.lessonContent.innerHTML, /data-start-correction/);
  assert.match(sut.elements.lessonContent.innerHTML, /answer-reveal/);
  assert.ok(sut.elements.lessonContent.innerHTML.includes(q2.answerZh));
  assert.deepEqual(Array.from(sut.wrongQuestionIds()), [q2.id]);

  await sut.startCorrectionRound();
  assert.equal(sut.state.exercise.round, 2);
  assert.equal(sut.state.exercise.correctionMode, true);
  assert.deepEqual(Array.from(sut.state.exercise.correctionIds), [q2.id]);
  assert.deepEqual(Array.from(sut.submissionQuestions(), (question) => question.id), [q2.id]);
  assert.equal((sut.elements.lessonContent.innerHTML.match(/data-question-id=/g) || []).length, 1);
  assert.match(sut.elements.lessonContent.innerHTML, /Correction Round · 改正輪/);
  assert.match(sut.elements.lessonContent.innerHTML, /暫時隱藏參考答案/);
  assert.doesNotMatch(sut.elements.lessonContent.innerHTML, /answer-reveal/);
  assert.ok(!sut.elements.lessonContent.innerHTML.includes(q2.answer));
  assert.ok(!sut.elements.lessonContent.innerHTML.includes(q2.answerZh));
  assert.match(sut.elements.lessonContent.innerHTML, /請再次修改後提交/);

  const correctionSnapshot = sut.serializeExerciseResult();
  assert.equal(correctionSnapshot.correctionMode, true);
  assert.deepEqual(Array.from(correctionSnapshot.correctionIds), [q2.id]);
  const resumedCorrection = sut.exerciseFromAttempt({
    id: sut.state.exercise.id,
    lessonId: lesson.id,
    lessonVersion: "1",
    roundNumber: sut.state.exercise.round,
    totalCount: 50,
    result: correctionSnapshot
  });
  assert.equal(resumedCorrection.correctionMode, true);
  assert.deepEqual(Array.from(resumedCorrection.correctionIds), [q2.id]);

  await sut.submitExercise("all");
  assert.equal(sut.state.exercise.questionState[q2.id].status, "wrong");
  assert.equal(sut.state.exercise.round, 3, "an unsuccessful correction submission must advance to the next correction round");
  assert.match(sut.elements.lessonContent.innerHTML, /answer-reveal/);
  assert.match(sut.elements.lessonContent.innerHTML, /missing-answer-highlight/);
  assert.ok(sut.elements.lessonContent.innerHTML.includes("first bus"));
  assert.ok(sut.elements.lessonContent.innerHTML.includes(q2.answerZh));
  assert.match(sut.elements.lessonContent.innerHTML, /data-clear-question-answer=/);

  sut.clearQuestionAnswer(q2.id);
  assert.equal(sut.state.exercise.drafts[q2.id], "");
  assert.equal(answerInputs.find((input) => input.dataset.answerInput === q2.id).value, "");

  answerInputs.find((input) => input.dataset.answerInput === q2.id).value = q2.answer;
  await sut.submitExercise("all");
  assert.ok(sut.state.exercise.correctIds.includes(q2.id));
  assert.equal(sut.state.exercise.correctionMode, true, "completed correction cards stay visible until the student returns");
  assert.match(sut.elements.lessonContent.innerHTML, /本次錯題已全部改正/);
  assert.ok(sut.elements.lessonContent.innerHTML.includes(`data-toggle-correct-card="${q2.id}"`));
  assert.match(sut.elements.lessonContent.innerHTML, /answer-reveal/);
  assert.ok(sut.elements.lessonContent.innerHTML.includes(q2.answerZh));
  assert.match(sut.elements.lessonContent.innerHTML, /data-toggle-all-correct-cards/);

  await sut.toggleAllCorrectCards();
  assert.deepEqual(Array.from(sut.state.exercise.collapsedCorrectIds), [q2.id], "bulk toggle only affects completed cards visible in the correction scope");
  assert.match(sut.elements.lessonContent.innerHTML, /展開所有已完成題目/);
  await sut.toggleAllCorrectCards();
  assert.deepEqual(Array.from(sut.state.exercise.collapsedCorrectIds), []);

  await sut.exitCorrectionRound();
  assert.equal(sut.state.exercise.correctionMode, false);
  assert.deepEqual(Array.from(sut.state.exercise.correctionIds), []);
  assert.equal((sut.elements.lessonContent.innerHTML.match(/data-answer-input=/g) || []).length, 50);
  const exitPayload = JSON.parse(apiCalls.at(-1).options.body);
  assert.equal(exitPayload.result.correctionMode, false, "leaving correction must be persisted immediately");
  assert.deepEqual(exitPayload.result.correctionIds, []);
  const persisted = sut.serializeExerciseResult();
  assert.deepEqual(Array.from(Object.keys(persisted)).sort(), [
    "awaitingNextRound", "collapsedCorrectIds", "contentVersion", "correctIds", "correctionIds",
    "correctionMode", "questionState", "round", "rounds"
  ], "the Worker/database result contract preserves correction and manual-collapse state");
});

test("the dashboard charts daily question activity and drills into the selected date", () => {
  const { sut } = createFrontendHarness();
  const submitted = new Date();
  submitted.setHours(10, 30, 0, 0);
  const dateKey = `${submitted.getFullYear()}-${String(submitted.getMonth() + 1).padStart(2, "0")}-${String(submitted.getDate()).padStart(2, "0")}`;
  const [q1, q2] = sut.getLesson("ss1").questions;
  sut.state.attempts = [sut.normalizeAttempt({
    id: "activity-1",
    lessonId: "ss1",
    status: "in_progress",
    roundNumber: 2,
    correctCount: 1,
    totalCount: 50,
    startedAt: submitted.toISOString(),
    result: {
      round: 2,
      correctIds: [q1.id],
      rounds: [{
        round: 2,
        kind: "partial",
        checkedIds: [q1.id, q2.id],
        correctIds: [q1.id],
        incorrectIds: [q2.id],
        submittedAt: submitted.toISOString()
      }]
    }
  })];
  const activity = sut.questionActivityRows();
  assert.equal(activity.length, 2);
  assert.deepEqual(Array.from(activity, (row) => row.status), ["correct", "wrong"]);
  const series = sut.buildQuestionProgressSeries("week");
  assert.equal(series.periodTotal, 2);
  assert.equal(series.activeDays, 1);
  assert.equal(series.points.length, 7);
  assert.equal(sut.buildQuestionProgressSeries("month").points.length, 30);
  assert.equal(sut.buildQuestionProgressSeries("half-year").points.length, 182);
  assert.equal(sut.buildQuestionProgressSeries("year").points.length, 365);
  assert.equal(
    sut.buildQuestionProgressSeries("ytd").points.length,
    Math.floor((new Date(submitted.getFullYear(), submitted.getMonth(), submitted.getDate()) - new Date(submitted.getFullYear(), 0, 1)) / 86400000) + 1
  );
  assert.equal(sut.buildQuestionProgressSeries("all").points.length, 1);
  const svg = sut.questionProgressChartSvg(series);
  assert.ok(svg.includes(`data-sentence-progress-day="${dateKey}"`));
  assert.match(svg, /完成：2 題/);
  assert.equal((svg.match(/tabindex="0" role="button"/g) || []).length, 1, "only dates with activity belong in the keyboard tab order");
  assert.equal((svg.match(/aria-hidden="true"/g) || []).length, 6, "zero-activity dates remain visual but non-interactive");
  assert.match(frontendSource, /\["Enter", " "\]\.includes\(event\.key\)/);

  sut.state.progressRange = "week";
  sut.state.selectedProgressDay = dateKey;
  sut.renderProgressDashboard();
  assert.equal(sut.elements.progressPeriodTotal.textContent, "2");
  assert.equal(sut.elements.progressAllTotal.textContent, "2");
  assert.equal(sut.elements.progressActiveDays.textContent, "1");
  assert.equal(sut.elements.progressDayPanel.hidden, false);
  assert.ok(sut.elements.progressDayList.innerHTML.includes(q1.prompt));
  assert.ok(sut.elements.progressDayList.innerHTML.includes(q2.prompt));
  assert.match(sut.elements.progressDayList.innerHTML, /答對/);
  assert.match(sut.elements.progressDayList.innerHTML, /待改正/);
});

test("question progress can add a persisted purple cumulative line with pre-range history", () => {
  const harness = createFrontendHarness();
  const { sut, localValues } = harness;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const earlier = new Date(today);
  earlier.setDate(earlier.getDate() - 10);
  const questions = sut.getLesson("ss1").questions.slice(0, 13);
  sut.state.attempts = [sut.normalizeAttempt({
    id: "cumulative-activity",
    lessonId: "ss1",
    status: "in_progress",
    startedAt: earlier.toISOString(),
    result: {
      rounds: [
        {
          round: 1,
          checkedIds: questions.slice(0, 12).map((question) => question.id),
          correctIds: questions.slice(0, 12).map((question) => question.id),
          incorrectIds: [],
          submittedAt: earlier.toISOString()
        },
        {
          round: 2,
          checkedIds: [questions[12].id],
          correctIds: [questions[12].id],
          incorrectIds: [],
          submittedAt: today.toISOString()
        }
      ]
    }
  })];

  const series = sut.buildQuestionProgressSeries("week");
  assert.equal(series.cumulativeBeforeStart, 12);
  assert.equal(series.periodTotal, 1);
  assert.equal(series.allTotal, 13);
  assert.equal(series.points.at(-1).cumulative, 13);
  sut.state.showCumulativeProgress = false;
  assert.doesNotMatch(sut.questionProgressChartSvg(series), /data-chart-series="cumulative"/);
  sut.state.showCumulativeProgress = true;
  const cumulativeSvg = sut.questionProgressChartSvg(series);
  assert.match(cumulativeSvg, /data-chart-series="cumulative"/);
  assert.match(cumulativeSvg, /stroke="#7e22ce"/);
  assert.match(cumulativeSvg, /累積：13 題/);

  sut.state.user = { id: "student-cumulative-a", name: "Student A", role: "student" };
  sut.state.showCumulativeProgress = false;
  sut.toggleCumulativeProgress();
  assert.equal(sut.state.showCumulativeProgress, true);
  assert.equal(sut.elements.cumulativeProgressToggle.textContent, "隱藏累積總數");
  assert.equal(sut.elements.cumulativeProgressToggle.getAttribute("aria-pressed"), "true");
  assert.equal(sut.elements.cumulativeProgressLegend.hidden, false);
  assert.equal([...localValues.values()].at(-1), "visible");
  assert.equal(sut.readCumulativeProgressPreference(), true);

  sut.state.user = { id: "student-cumulative-b", name: "Student B", role: "student" };
  assert.equal(sut.readCumulativeProgressPreference(), false, "cumulative visibility must not leak into another account");
  sut.writeCumulativeProgressPreference(false);
  sut.state.user = { id: "student-cumulative-a", name: "Student A", role: "student" };
  assert.equal(sut.readCumulativeProgressPreference(), true);
});

test("the second dashboard aggregates Supabase attempt duration and opens daily time details", () => {
  const { sut } = createFrontendHarness();
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const earlier = new Date(today);
  earlier.setDate(earlier.getDate() - 10);
  const dayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  sut.state.attempts = [
    sut.normalizeAttempt({
      id: "time-1", lessonId: "ss1", status: "completed", correctCount: 50, totalCount: 50,
      durationMs: 90000, completedAt: today.toISOString(), result: {}
    }),
    sut.normalizeAttempt({
      id: "time-2", lessonId: "ss2", status: "in_progress", correctCount: 18, totalCount: 50,
      durationMs: 150000, updatedAt: today.toISOString(), result: {}
    }),
    sut.normalizeAttempt({
      id: "time-3", lessonId: "ss3", status: "completed", correctCount: 50, totalCount: 50,
      durationMs: 300000, completedAt: earlier.toISOString(), result: {}
    })
  ];

  const series = sut.buildSentenceTimeSeries("week");
  assert.equal(series.points.length, 7);
  assert.equal(series.points.at(-1).totalMs, 240000);
  assert.equal(series.stats.periodTotalMs, 240000);
  assert.equal(series.stats.allTotalMs, 540000);
  assert.equal(series.stats.averageMs, 180000);
  assert.equal(series.stats.medianMs, 150000);
  assert.equal(series.stats.maximumMs, 300000);
  const svg = sut.sentenceTimeProgressChartSvg(series);
  assert.match(svg, /data-chart-series="time"/);
  assert.match(svg, /stroke="#ff914d"/);
  assert.ok(svg.includes(`data-sentence-time-day="${dayKey}"`));
  assert.match(svg, /時間：4 分 00 秒/);

  sut.state.timeProgressRange = "week";
  sut.state.selectedTimeProgressDay = dayKey;
  sut.renderSentenceTimeDashboard();
  assert.equal(sut.elements.timeProgressAllTotal.textContent, "9 分 00 秒");
  assert.equal(sut.elements.timeProgressPeriodTotal.textContent, "4 分 00 秒");
  assert.equal(sut.elements.timeProgressAverage.textContent, "3 分 00 秒");
  assert.equal(sut.elements.timeProgressMedian.textContent, "2 分 30 秒");
  assert.equal(sut.elements.timeProgressMaximum.textContent, "5 分 00 秒");
  assert.equal(sut.elements.timeProgressDayPanel.hidden, false);
  assert.match(sut.elements.timeProgressDayTitle.textContent, /4 分 00 秒/);
  assert.match(sut.elements.timeProgressDayList.innerHTML, /已完成/);
  assert.match(sut.elements.timeProgressDayList.innerHTML, /進行中/);
  assert.match(sut.elements.timeProgressDayList.innerHTML, /1 分 30 秒/);
  assert.match(sut.elements.timeProgressDayList.innerHTML, /2 分 30 秒/);
});

test("bookmark is pinned first and every completed 50-question lesson turns gold", () => {
  const { sut } = createFrontendHarness();
  sut.state.bookmarks = [{ lessonId: "ss1", questionId: "ss1-q01", includeAnswer: false, createdAt: "" }];
  sut.state.attempts = [sut.normalizeAttempt({
    id: "complete-ss1",
    lessonId: "ss1",
    status: "completed",
    correctCount: 50,
    totalCount: 50,
    result: { correctIds: sut.getLesson("ss1").questions.map((question) => question.id) }
  })];
  sut.renderLessonChoices();
  const html = sut.elements.lessonChoiceGrid.innerHTML;
  assert.ok(html.indexOf("data-open-bookmarks-card") < html.indexOf('data-open-lesson="ss1"'));
  assert.match(html, /data-open-lesson="ss1"[^>]+data-tone="gold"/);
  assert.match(html, /50 \/ 50 題已完成/);
  assert.match(html, /0 個句型/);
  assert.match(html, /1 道題目/);
});

test("attempt history pagination loads every dashboard page", async () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  let calls = 0;
  harness.setApiHandler(async (url) => {
    const parsed = new URL(url);
    assert.equal(parsed.pathname, "/v1/attempts");
    calls += 1;
    const page = Number(parsed.searchParams.get("page"));
    const count = page === 1 ? 100 : 1;
    return jsonResponse({
      attempts: Array.from({ length: count }, (_, index) => ({ id: `${page}-${index}` })),
      hasMore: page === 1
    });
  });
  const result = await sut.loadAllAttempts();
  assert.equal(calls, 2);
  assert.equal(result.attempts.length, 101);
  assert.equal(result.complete, true);
});

test("attempt history reports its explicit 10,000-row dashboard cap", async () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  harness.setApiHandler(async (url) => {
    const parsed = new URL(url);
    const page = Number(parsed.searchParams.get("page"));
    return jsonResponse({
      attempts: Array.from({ length: 100 }, (_, index) => ({ id: `${page}-${index}` })),
      hasMore: true
    });
  });
  const result = await sut.loadAllAttempts();
  assert.equal(result.attempts.length, 10000);
  assert.equal(result.complete, false);
  sut.state.attempts = [];
  sut.state.attemptHistoryComplete = false;
  sut.renderAttemptHistory();
  assert.match(sut.elements.historyList.innerHTML, /超過 10,000 次/);
  assert.match(sut.elements.historyList.innerHTML, /較早記錄仍保留在系統內/);
});

test("bookmark normalization, secrecy, reveal, synchronization, and limit all hold", async () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  const question = sut.getQuestion("ss1", "ss1-q01");
  assert.deepEqual(
    JSON.parse(JSON.stringify(sut.normalizeBookmark({ lesson_id: "ss1", question_id: question.id, include_answer: true }))),
    { lessonId: "ss1", questionId: question.id, includeAnswer: true, createdAt: "" }
  );
  assert.equal(sut.normalizeBookmark({ lessonId: "ss1", questionId: "missing" }), null);
  assert.deepEqual(
    JSON.parse(JSON.stringify(sut.normalizeBookmark({ lessonId: "ss1", questionId: "__section__", includeAnswer: false }))),
    { lessonId: "ss1", questionId: "__section__", includeAnswer: false, createdAt: "" }
  );
  assert.equal(
    sut.normalizeBookmark({ lessonId: "missing", questionId: "__section__", includeAnswer: false }),
    null
  );

  sut.state.currentView = "dashboard";
  sut.state.user = { id: "student-1", name: "Test Student", role: "student" };
  sut.state.authToken = "student-token";
  const cueQuestion = sut.getQuestion("ss96", "ss96-q01");
  sut.state.bookmarks = [{ lessonId: "ss96", questionId: cueQuestion.id, includeAnswer: false, createdAt: "" }];
  sut.renderBookmarks();
  assert.ok(sut.elements.bookmarkList.innerHTML.includes(cueQuestion.cue));

  sut.state.bookmarks = [{ lessonId: "ss1", questionId: question.id, includeAnswer: false, createdAt: "" }];
  sut.renderBookmarks();
  assert.ok(sut.elements.bookmarkList.innerHTML.includes(question.prompt));
  assert.ok(!sut.elements.bookmarkList.innerHTML.includes(question.answer));
  sut.state.bookmarks[0].includeAnswer = true;
  sut.renderBookmarks();
  assert.ok(sut.elements.bookmarkList.innerHTML.includes(`<span class="target-highlight">${question.highlight}</span>`));
  assert.ok(sut.elements.bookmarkList.innerHTML.includes(question.answerZh));
  assert.match(sut.elements.bookmarkList.innerHTML, /target-highlight/);
  sut.state.exercise = {
    lessonId: "ss1",
    correctIds: [],
    questionState: { [question.id]: { status: "wrong", reveal: true } }
  };
  sut.renderBookmarks();
  assert.ok(!sut.elements.bookmarkList.innerHTML.includes(question.answer), "an unresolved wrong answer must stay hidden in Bookmarks");
  sut.state.exercise = null;

  await sut.toggleBookmark("ss1", question.id);
  assert.equal(sut.state.bookmarks.length, 0);
  await sut.toggleBookmark("ss1", question.id, true);
  assert.equal(sut.state.bookmarks.length, 1);
  assert.equal(sut.state.bookmarks[0].includeAnswer, true);

  sut.state.bookmarks = Array.from({ length: sut.MAX_BOOKMARKS }, (_, index) => ({
    lessonId: "ss1", questionId: question.id, includeAnswer: false, createdAt: String(index)
  }));
  await sut.toggleBookmark("ss1", "ss1-q02");
  assert.equal(sut.state.bookmarks.length, sut.MAX_BOOKMARKS);
  assert.match(sut.elements.toast.textContent, /最多可儲存 6000 個書簽/);
});

test("dashboard progress disclosure is collapsed by default and persists per student account", () => {
  const harness = createFrontendHarness();
  const { sut, localValues } = harness;
  sut.state.user = { id: "student-a", name: "Student A", role: "student" };
  sut.renderProgressPanelDisclosure();
  assert.equal(sut.elements.progressPanel.hidden, true);
  assert.equal(sut.elements.progressToggle.getAttribute("aria-expanded"), "false");

  sut.toggleProgressPanel();
  assert.equal(sut.state.progressPanelExpanded, true);
  assert.equal(sut.elements.progressPanel.hidden, false);
  assert.equal(sut.elements.progressToggleLabel.textContent, "收起 −");
  assert.equal(sut.readProgressPanelPreference(), true);
  assert.equal([...localValues.values()].at(-1), "expanded");

  sut.state.user = { id: "student-b", name: "Student B", role: "student" };
  assert.equal(sut.readProgressPanelPreference(), false, "Student A's preference must not leak into Student B's account");
  sut.writeProgressPanelPreference(false);
  sut.state.user = { id: "student-a", name: "Student A", role: "student" };
  assert.equal(sut.readProgressPanelPreference(), true);
});

test("lesson bookmarks render as card stars and a separate left bookmark column", async () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  sut.state.currentView = "dashboard";
  sut.state.user = { id: "student-1", name: "Test Student", role: "student" };
  sut.state.authToken = "student-token";

  await sut.toggleSectionBookmark("ss1");
  assert.equal(sut.state.bookmarks[0].questionId, "__section__");
  assert.match(sut.elements.lessonChoiceGrid.innerHTML, /data-toggle-section-bookmark="ss1"[^>]+aria-pressed="true"/);
  assert.match(sut.elements.lessonChoiceGrid.innerHTML, /1 個句型/);

  sut.state.bookmarks.push({ lessonId: "ss2", questionId: "ss2-q01", includeAnswer: false, createdAt: "" });
  sut.renderBookmarks();
  const html = sut.elements.bookmarkList.innerHTML;
  assert.match(html, /class="bookmark-columns"/);
  assert.ok(html.indexOf("收藏句型") < html.indexOf("收藏題目"));
  assert.match(html, /data-open-section-bookmark="ss1"/);
  assert.match(html, /data-open-bookmark="ss2\|ss2-q01"/);
});

test("returning to an exercise targets its next unfinished question", () => {
  const { sut } = createFrontendHarness();
  const lesson = sut.getLesson("ss1");
  sut.state.lessonId = lesson.id;
  sut.state.exercise = sut.createExercise(lesson);
  sut.state.exercise.correctIds = lesson.questions.slice(0, 25).map((question) => question.id);
  assert.equal(sut.currentProgressQuestionId(lesson), "ss1-q26");

  sut.state.exercise.correctIds = lesson.questions.slice(1, 25).map((question) => question.id);
  sut.state.exercise.questionState["ss1-q01"] = { status: "wrong", lastAnswer: "an earlier wrong answer", reveal: true };
  assert.equal(
    sut.currentProgressQuestionId(lesson),
    "ss1-q26",
    "an earlier wrong answer must not send a returning student back before the next unanswered question"
  );

  sut.state.exercise.correctionMode = true;
  sut.state.exercise.correctionIds = ["ss1-q07", "ss1-q31"];
  assert.equal(sut.currentProgressQuestionId(lesson), "ss1-q31", "correction mode must target the first unresolved correction");
  sut.state.exercise.correctIds.push("ss1-q31");
  assert.equal(sut.currentProgressQuestionId(lesson), "", "a finished correction scope should keep its summary visible");

  sut.state.exercise.correctionMode = false;
  sut.state.exercise.correctIds = lesson.questions.map((question) => question.id);
  assert.equal(sut.currentProgressQuestionId(lesson), "", "a completed lesson should keep its completion summary visible");
});

test("rapid bookmark changes are serialized so an older Supabase response cannot overwrite the latest state", async () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  sut.state.currentView = "dashboard";
  sut.state.user = { id: "student-1", name: "Test Student", role: "student" };
  sut.state.authToken = "student-token";
  let releaseFirst;
  const firstGate = new Promise((resolve) => { releaseFirst = resolve; });
  const payloads = [];
  harness.setApiHandler(async (url, options) => {
    assert.equal(new URL(url).pathname, "/v1/bookmarks");
    const bookmarks = JSON.parse(options.body).bookmarks;
    payloads.push(bookmarks);
    if (payloads.length === 1) await firstGate;
    return jsonResponse({ bookmarks });
  });

  const first = sut.toggleBookmark("ss1", "ss1-q01");
  const second = sut.toggleBookmark("ss1", "ss1-q02");
  await Promise.resolve();
  assert.equal(payloads.length, 1, "only the first replacement may be in flight");
  releaseFirst();
  await Promise.all([first, second]);
  assert.equal(payloads.length, 2);
  assert.equal(payloads[0].length, 1);
  assert.equal(payloads[1].length, 2);
  assert.deepEqual(Array.from(sut.state.bookmarks, (bookmark) => bookmark.questionId), ["ss1-q01", "ss1-q02"]);
});

test("queued bookmark writes keep the account token captured when the edit was made", async () => {
  const harness = createFrontendHarness();
  const { sut, apiCalls } = harness;
  sut.state.currentView = "dashboard";
  sut.state.user = { id: "student-a", name: "Student A", role: "student" };
  sut.state.authToken = "token-a";
  let releaseFirst;
  const firstGate = new Promise((resolve) => { releaseFirst = resolve; });
  let requestCount = 0;
  harness.setApiHandler(async (url, options) => {
    assert.equal(new URL(url).pathname, "/v1/bookmarks");
    requestCount += 1;
    if (requestCount === 1) await firstGate;
    return jsonResponse({ bookmarks: JSON.parse(options.body).bookmarks });
  });

  const first = sut.toggleBookmark("ss1", "ss1-q01");
  const second = sut.toggleBookmark("ss1", "ss1-q02");
  await Promise.resolve();
  sut.state.user = { id: "student-b", name: "Student B", role: "student" };
  sut.state.authToken = "token-b";
  releaseFirst();
  await Promise.all([first, second]);

  assert.equal(apiCalls.length, 2);
  assert.equal(apiCalls[0].options.headers.get("Authorization"), "Bearer token-a");
  assert.equal(apiCalls[1].options.headers.get("Authorization"), "Bearer token-a", "the queued replacement must never use Student B's token");
});

test("a late bookmark failure from another account cannot roll back or notify the active student", async () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  sut.state.currentView = "dashboard";
  sut.state.user = { id: "student-a", name: "Student A", role: "student" };
  sut.state.authToken = "token-a";
  let releaseRequest;
  const requestGate = new Promise((resolve) => { releaseRequest = resolve; });
  harness.setApiHandler(async () => {
    await requestGate;
    return jsonResponse({ error: "Temporary failure", code: "SUPABASE_UNAVAILABLE" }, 502);
  });

  const oldAccountWrite = sut.toggleBookmark("ss1", "ss1-q01");
  await Promise.resolve();
  sut.state.user = { id: "student-b", name: "Student B", role: "student" };
  sut.state.authToken = "token-b";
  sut.state.bookmarks = [{ lessonId: "ss2", questionId: "ss2-q01", includeAnswer: false, createdAt: "" }];
  sut.elements.toast.textContent = "";
  releaseRequest();
  await oldAccountWrite;

  assert.deepEqual(Array.from(sut.state.bookmarks, ({ lessonId, questionId }) => ({ lessonId, questionId })), [
    { lessonId: "ss2", questionId: "ss2-q01" }
  ]);
  assert.equal(sut.elements.toast.textContent, "", "Student B must not see Student A's late sync failure");
});

test("a late dashboard response cannot copy one student's attempts or bookmarks into another account", async () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  sut.state.user = { id: "student-a", name: "Student A", role: "student" };
  sut.state.authToken = "token-a";
  let releaseResponses;
  const responseGate = new Promise((resolve) => { releaseResponses = resolve; });
  harness.setApiHandler(async (url, options) => {
    assert.equal(options.headers.get("Authorization"), "Bearer token-a");
    await responseGate;
    const pathname = new URL(url).pathname;
    if (pathname === "/v1/attempts") return jsonResponse({ attempts: [], hasMore: false });
    if (pathname === "/v1/bookmarks") return jsonResponse({
      bookmarks: [{ lessonId: "ss1", questionId: "ss1-q01", includeAnswer: false }]
    });
    throw new Error(`Unexpected request: ${pathname}`);
  });

  const oldDashboardLoad = sut.loadDashboardData();
  await Promise.resolve();
  sut.state.user = { id: "student-b", name: "Student B", role: "student" };
  sut.state.authToken = "token-b";
  sut.state.bookmarks = [{ lessonId: "ss2", questionId: "ss2-q01", includeAnswer: false, createdAt: "" }];
  sut.state.syncedBookmarks = sut.state.bookmarks.map((bookmark) => ({ ...bookmark }));
  releaseResponses();
  await oldDashboardLoad;

  assert.deepEqual(Array.from(sut.state.bookmarks, (bookmark) => bookmark.questionId), ["ss2-q01"]);
  assert.deepEqual(Array.from(sut.state.syncedBookmarks, (bookmark) => bookmark.questionId), ["ss2-q01"]);
  assert.equal(sut.state.dashboardLoaded, false);
});

test("a failed latest bookmark replacement rolls back to the last confirmed server snapshot", async () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  sut.state.currentView = "dashboard";
  sut.state.user = { id: "student-a", name: "Student A", role: "student" };
  sut.state.authToken = "token-a";
  let requestCount = 0;
  harness.setApiHandler(async (_url, options) => {
    requestCount += 1;
    const bookmarks = JSON.parse(options.body).bookmarks;
    if (requestCount === 1) return jsonResponse({ bookmarks });
    return jsonResponse({ error: "Temporary failure", code: "SUPABASE_UNAVAILABLE" }, 502);
  });

  const first = sut.toggleBookmark("ss1", "ss1-q01");
  const second = sut.toggleBookmark("ss1", "ss1-q02");
  await Promise.all([first, second]);

  assert.deepEqual(Array.from(sut.state.syncedBookmarks, (bookmark) => bookmark.questionId), ["ss1-q01"]);
  assert.deepEqual(Array.from(sut.state.bookmarks, (bookmark) => bookmark.questionId), ["ss1-q01"],
    "the unsaved second change must not leave a phantom local bookmark");
  assert.match(sut.elements.toast.textContent, /未能同步書簽/);
});

test("attempt history is expandable and only unfinished attempts can resume", () => {
  const { sut } = createFrontendHarness();
  const incomplete = sut.normalizeAttempt({
    id: "attempt-1", lesson_id: "ss1", status: "in_progress", round_number: 2,
    correct_count: 7, total_count: 50, duration_ms: 65000,
    started_at: "2026-07-21T10:00:00.000Z", result: { rounds: [{}, {}] }
  });
  const completed = sut.normalizeAttempt({
    id: "attempt-2", lessonId: "ss2", status: "completed", roundNumber: 3,
    correctCount: 50, totalCount: 50, durationMs: 125000,
    startedAt: "2026-07-21T11:00:00.000Z", result: { rounds: [{}, {}, {}] }
  });
  const history = sut.attemptHistoryHtml([incomplete, completed]);
  assert.equal((history.match(/<details class="attempt-row">/g) || []).length, 2);
  assert.equal((history.match(/data-resume-attempt=/g) || []).length, 1);
  assert.match(history, /進行中 · 7\/50/);
  assert.match(history, /已完成 · 50\/50/);
  assert.doesNotMatch(sut.attemptHistoryHtml([incomplete], { allowResume: false }), /data-resume-attempt=/);
});

test("student login calls the shared Supabase RPC and maps its session token", async () => {
  const { sut } = createFrontendHarness();
  let rpcCall;
  sut.state.supabase = {
    auth: { async getSession() { return { data: { session: { user: { id: "anon" } } }, error: null }; } },
    async rpc(name, args) {
      rpcCall = { name, args };
      return { data: [{ id: "student-9", name: "Shared Student", session_token: "shared-token" }], error: null };
    }
  };
  const result = await sut.studentLogin("Shared Student", "password-123");
  assert.deepEqual(JSON.parse(JSON.stringify(rpcCall)), {
    name: "flashcard_student_login",
    args: { p_name: "Shared Student", p_password: "password-123" }
  });
  assert.deepEqual(JSON.parse(JSON.stringify(result)), {
    token: "shared-token",
    user: { id: "student-9", name: "Shared Student", role: "student" }
  });
});

test("admin list and detail show per-student attempts, completions, and bookmarks", async () => {
  const harness = createFrontendHarness();
  const { sut } = harness;
  sut.state.user = { id: "admin", name: "Admin", role: "admin" };
  sut.state.authToken = "admin-token";
  sut.state.adminStudents = [{ id: "student-1", name: "Alice", attemptCount: 4, bookmarkCount: 3 }];
  sut.renderAdminStudents();
  assert.equal(sut.elements.adminStudentCount.textContent, "1");
  assert.match(sut.elements.adminStudentList.innerHTML, /data-admin-student="student-1"/);
  assert.match(sut.elements.adminStudentList.innerHTML, /4 次練習 · 3 個書簽/);

  harness.setApiHandler(async (url) => {
    assert.equal(new URL(url).pathname, "/v1/admin/students/student-1");
    return jsonResponse({
      student: { id: "student-1", name: "Alice" },
      attempts: [
        { id: "a1", lessonId: "ss1", status: "completed", correctCount: 50, totalCount: 50, roundNumber: 2, result: {} },
        { id: "a2", lessonId: "ss2", status: "in_progress", correctCount: 10, totalCount: 50, roundNumber: 1, result: {} }
      ],
      bookmarks: [{ lessonId: "ss1", questionId: "ss1-q01", includeAnswer: true }]
    });
  });
  await sut.openAdminStudent("student-1");
  assert.match(sut.elements.adminDetail.innerHTML, /<strong>2<\/strong><span>練習次數<\/span>/);
  assert.match(sut.elements.adminDetail.innerHTML, /<strong>1<\/strong><span>完成次數<\/span>/);
  assert.match(sut.elements.adminDetail.innerHTML, /<strong>1<\/strong><span>書簽數量<\/span>/);
  assert.doesNotMatch(sut.elements.adminDetail.innerHTML, /data-resume-attempt=/);
});

let failed = 0;
for (const { name, run } of tests) {
  try {
    await run();
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}`);
    console.error(error?.stack || error);
  }
}

console.log(`\n${tests.length - failed}/${tests.length} Sentence Structure checks passed.`);
if (failed) process.exitCode = 1;
