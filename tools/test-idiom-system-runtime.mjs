#!/usr/bin/env node

import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (name) => readFile(new URL(name, root), "utf8");

const [dataSource, frontendSource, html, css] = await Promise.all([
  read("idiom-system-data.js"),
  read("idiom-system.js"),
  read("idiom-system.html"),
  read("idiom-system.css")
]);
const comparisonSource = await read("shared-answer-comparison.js");
const compassSource = await read("idiom-first-five-curation.js");

const tests = [];
const test = (name, run) => tests.push({ name, run });
const occurrences = (text, fragment) => String(text).split(String(fragment)).length - 1;

function renderedText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replace(/\s+/g, " ")
    .trim();
}

function assertChineseBeforeEnglish(renderedHtml, chinese, english, label) {
  const text = renderedText(renderedHtml);
  const chineseAt = text.indexOf(chinese);
  const englishAt = text.indexOf(english);
  assert.ok(chineseAt >= 0, `${label}: Chinese material must render`);
  assert.ok(englishAt >= 0, `${label}: English material must render`);
  assert.ok(chineseAt < englishAt, `${label}: Chinese must precede English`);
}

function cssColorValue(source, ruleBody) {
  let value = ruleBody.match(/(?:^|;)\s*color:\s*([^;]+)/i)?.[1]?.trim() || "";
  const variable = value.match(/^var\((--[\w-]+)\)$/)?.[1];
  if (variable) {
    const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    value = source.match(new RegExp(`${escaped}\\s*:\\s*([^;]+)`))?.[1]?.trim() || value;
  }
  return value;
}

function rgbFromCssColor(value) {
  const hex = String(value).match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (hex) {
    const expanded = hex.length === 3 ? [...hex].map((digit) => digit + digit).join("") : hex;
    return [0, 2, 4].map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16));
  }
  const rgb = String(value).match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  return rgb ? rgb.slice(1, 4).map(Number) : null;
}

function assertBlueColor(value, label) {
  const rgb = rgbFromCssColor(value);
  assert.ok(rgb, `${label}: expected a literal or resolved blue colour, received ${value || "nothing"}`);
  assert.ok(rgb[2] > rgb[0] && rgb[2] >= rgb[1], `${label}: ${value} is not blue-dominant`);
}

function loadContent() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(dataSource, sandbox, { filename: "idiom-system-data.js" });
  return sandbox.window.EDMUND_IDIOM_SYSTEM_DATA;
}

const content = loadContent();
const lesson = content.lessons[0];
const rejectedMeaningNote = "The expression does not simply mean begin. It usually highlights the first action that creates movement or progress. Cambridge describes it as beginning an activity, particularly one involving other people, while Merriam-Webster defines the wider family of expressions as beginning an activity or process.";
const rejectedOriginImageEn = "The expression creates a simple picture: a ball remains still until somebody gives it the first push. Once it begins rolling, movement has started and can continue.";
const rejectedOriginImageZh = "這個表達帶出一個簡單畫面：球在有人推動前會保持靜止；當有人把球推動後，整個活動便會開始，並可以繼續發展。";

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
    matches() { return false; },
    closest() { return null; },
    querySelectorAll: () => [],
    querySelector: () => null,
    scrollIntoView() {},
    focus() {},
    reset() { this.value = ""; },
    ...seed,
    __attributes: attributes,
    __classes: classes,
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

function attemptSeed(overrides = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    lessonId: lesson.id,
    lessonVersion: "1",
    status: "in_progress",
    roundNumber: 1,
    correctCount: 0,
    totalCount: lesson.questions.length,
    durationMs: 0,
    startedAt: "2026-07-27T00:00:00.000Z",
    completedAt: "",
    result: {},
    ...overrides
  };
}

function createFrontendHarness({ withCompass = false } = {}) {
  const views = ["login", "dashboard", "lesson", "bookmarks", "admin"]
    .map((name) => makeElement({ dataset: { view: name } }));
  const steps = Array.from({ length: 8 }, (_, index) => (
    makeElement({ dataset: { step: String(index + 1) } })
  ));
  const selectorMap = new Map();
  const selectors = [
    "[data-connection-status]", "[data-user-pill]", "[data-dashboard-button]",
    "[data-admin-students-button]", "[data-logout]", "[data-login-form]",
    "[data-login-button]", "[data-login-status]", "#idiom-system-username",
    "#idiom-system-password", "[data-password-toggle]", "[data-dashboard-welcome]",
    "[data-lesson-count]", "[data-lesson-choice-grid]", "[data-history-list]",
    "[data-sentence-progress-toggle]", "[data-sentence-progress-toggle-label]",
    "[data-sentence-progress-panel]", "[data-sentence-progress-chart]",
    "[data-sentence-progress-period-total]", "[data-sentence-progress-all-total]",
    "[data-sentence-progress-active-days]", "[data-toggle-sentence-cumulative]",
    "[data-sentence-cumulative-legend]", "[data-sentence-progress-day-panel]",
    "[data-sentence-progress-day-title]", "[data-sentence-progress-day-list]",
    "[data-sentence-time-progress-chart]", "[data-sentence-time-all-total]",
    "[data-sentence-time-period-total]", "[data-sentence-time-average]",
    "[data-sentence-time-median]", "[data-sentence-time-maximum]",
    "[data-sentence-time-day-panel]", "[data-sentence-time-day-title]",
    "[data-sentence-time-day-list]", "[data-lesson-round]", "[data-lesson-kicker]",
    "[data-lesson-title]", "[data-lesson-stepper]", "[data-lesson-content]",
    "[data-bookmark-list]", "[data-admin-search]", "[data-admin-student-count]",
    "[data-admin-student-list]", "[data-admin-detail]",
    "#idiom-system-loading-template", "[data-toast]"
  ];
  selectors.forEach((selector) => selectorMap.set(selector, makeElement()));
  selectorMap.get("#idiom-system-password").type = "password";
  selectorMap.get("#idiom-system-loading-template").innerHTML = "<p>loading</p>";
  selectorMap.get("[data-lesson-stepper]").querySelectorAll = (selector) => (
    selector === "[data-step]" ? steps : []
  );

  const controls = {
    partial: makeElement({ hidden: true }),
    all: makeElement(),
    copy: makeElement(),
    header: makeElement()
  };
  const answerInputs = [];
  const focusedQuestionIds = [];
  const scrolledQuestionIds = [];
  const documentListeners = new Map();
  const windowListeners = new Map();
  const questionCards = new Map();

  function questionCard(questionId) {
    if (!questionCards.has(questionId)) {
      const input = makeElement({
        dataset: { answerInput: questionId },
        focus() { focusedQuestionIds.push(questionId); }
      });
      questionCards.set(questionId, makeElement({
        dataset: { questionId },
        scrollIntoView() { scrolledQuestionIds.push(questionId); },
        querySelector(selector) {
          return selector === "[data-answer-input]:not([disabled])" ? input : null;
        }
      }));
    }
    return questionCards.get(questionId);
  }

  const document = {
    visibilityState: "visible",
    querySelector(selector) {
      if (selector === "[data-submit-partial]") return controls.partial;
      if (selector === "[data-submit-all]") return controls.all;
      if (selector === "[data-exercise-action-copy]") return controls.copy;
      if (selector === ".exercise-header") return controls.header;
      const questionMatch = selector.match(/^\[data-question-id="(.+)"\]$/);
      if (questionMatch) return questionCard(questionMatch[1].replaceAll("\\", ""));
      if (selector.startsWith("[data-toggle-correct-card=")) return makeElement();
      if (selector === "[data-toggle-all-correct-cards]") return makeElement();
      return selectorMap.get(selector) ?? null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-view]") return views;
      if (selector === "[data-answer-input]") return answerInputs;
      const inputMatch = selector.match(/^\[data-answer-input="(.+)"\]$/);
      if (inputMatch) {
        const questionId = inputMatch[1].replaceAll("\\", "");
        return answerInputs.filter((input) => input.dataset.answerInput === questionId);
      }
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
      return jsonResponse({
        attempt: {
          id: decodeURIComponent(pathname.split("/").at(-1)),
          ...body,
          updatedAt: "2026-07-27T00:00:01.000Z"
        }
      });
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

  let timerId = 0;
  const window = {
    EDMUND_IDIOM_SYSTEM_CONFIG: {
      workerBaseUrl: "https://idiom-system.test",
      adminUsername: "Sam Admin Idiom",
      studentLoginRpc: "flashcard_student_login"
    },
    EDMUND_SUPABASE: { url: "https://supabase.test", anonKey: "anon" },
    EDMUND_IDIOM_SYSTEM_DATA: content,
    sessionStorage,
    localStorage,
    location: { search: "" },
    scrollY: 0,
    scrollTo() {},
    setTimeout(callback, delay) {
      timerId += 1;
      if (delay === 50) callback();
      return timerId;
    },
    clearTimeout() {},
    addEventListener(type, callback) { windowListeners.set(type, callback); }
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
    URLSearchParams,
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
    Uint16Array,
    Error,
    encodeURIComponent,
    decodeURIComponent
  };
  vm.createContext(context);
  vm.runInContext(comparisonSource, context, { filename: "shared-answer-comparison.js" });
  if (withCompass) vm.runInContext(compassSource, context, { filename: "idiom-first-five-curation.js" });

  const initialisation = /\ninitialise\(\)\.catch\(\(error\) => \{[\s\S]*?\n\}\);\s*$/;
  assert.match(frontendSource.replace(/\ninstallQuestionOrder\([^\n]+\n?$/,''), initialisation, "test harness could not locate the frontend bootstrap");
  const instrumented = "const createHorseyTrophies=()=>({sync(){},celebrate(){}});const orderQuestions=questions=>questions;\n"+frontendSource.replace(/^import \{ createHorseyTrophies \}[^\n]+\n/m,"").replace(/^import \{ installQuestionOrder, orderQuestions \}[^\n]+\n/m,'').replace(/\ninstallQuestionOrder\([^\n]+\n?$/,'').replace(initialisation, `
window.__IDIOM_RUNTIME_TEST__ = {
  state, elements, LESSON_PAGES, EXERCISE_PAGE,
  getLesson, getQuestion, createExercise, exerciseFromAttempt,
  openLesson, setLessonPage, renderLessonPage, renderLessonChoices, renderExercisePage,
  renderFormulaPage, renderBenefitsPage, renderRulesPage, renderCompassPage, pilotBatchQuestions, compassPracticeQuestions, compassMcOptions, compassMcHighlightedOptions, answerCompassMcQuestion, compassBonusCorrectIds, handleClick, searchLessons,
  compassReviewedCount, displayAttemptProgress,
  clearSession,
  questionActivityRows, buildQuestionProgressSeries,
  updateLessonStepper, currentProgressQuestionId, focusExerciseQuestion,
  readExerciseDrafts, syncExerciseButtons, wrongQuestionIds, correctionQuestions,
  submissionQuestions, submitExercise, startCorrectionRound, exitCorrectionRound,
  serializeExerciseResult, persistExercise,
  pauseExerciseClock, startExerciseClock, bindEvents
};
`);
  vm.runInContext(instrumented, context, { filename: "idiom-system.js" });

  return {
    apiCalls,
    compass: window.EDMUND_IDIOM_COMPASS,
    answerInputs,
    controls,
    document,
    documentListeners,
    focusedQuestionIds,
    scrolledQuestionIds,
    selectorMap,
    steps,
    sut: window.__IDIOM_RUNTIME_TEST__,
    setApiHandler(handler) { apiHandler = handler; }
  };
}

function authenticateStudent(sut, id = "student-a", token = "token-a") {
  sut.state.user = { id, name: id === "student-a" ? "Student A" : "Student B", role: "student" };
  sut.state.authToken = token;
}

test("all eight pages render and a direct exercise jump marks only visited steps", () => {
  const harness = createFrontendHarness();
  const { sut, steps } = harness;
  authenticateStudent(sut);
  sut.openLesson(lesson.id, { page: 1, attempt: attemptSeed() });

  assert.equal(sut.LESSON_PAGES, 8);
  assert.equal(sut.EXERCISE_PAGE, 8);
  assert.deepEqual(Array.from(sut.state.visitedLessonPages), [1]);
  assert.equal(steps[0].getAttribute("aria-current"), "step");
  assert.ok(!steps[0].classList.contains("is-complete"));

  sut.setLessonPage(8);
  assert.match(sut.elements.lessonContent.innerHTML, /PAGE 8 · TYPE THE WHOLE SENTENCE/);
  assert.ok(sut.elements.lessonContent.innerHTML.includes(lesson.instructions.zh));
  assert.ok(sut.elements.lessonContent.innerHTML.includes(lesson.instructions.en));
  assert.deepEqual(Array.from(sut.state.visitedLessonPages).sort((a, b) => a - b), [1, 8]);
  assert.ok(steps[0].classList.contains("is-complete"));
  assert.equal(steps[7].getAttribute("aria-current"), "step");
  for (const step of steps.slice(1, 7)) {
    assert.ok(!step.classList.contains("is-complete"), `unvisited step ${step.dataset.step} must not look completed`);
  }

  const pageMarkers = new Map([
    [1, "CORE MEANING + FORMULA"],
    [2, "REGISTER + TONE"],
    [3, "WHAT STAYS + WHAT CHANGES"],
    [4, `${lesson.specificForms.length} USEFUL FORMULAS`],
    [5, "WHY THIS IDIOM HELPS"],
    [6, "HISTORY + ORIGIN"],
    [7, `${lesson.rules.length} IMPORTANT REMINDERS`],
    [8, "TYPE THE WHOLE SENTENCE"]
  ]);
  for (const [page, marker] of pageMarkers) {
    sut.setLessonPage(page);
    assert.ok(sut.elements.lessonContent.innerHTML.includes(marker), `page ${page} must render its own content`);
  }
  assert.deepEqual(
    Array.from(sut.state.visitedLessonPages).sort((a, b) => a - b),
    [1, 2, 3, 4, 5, 6, 7, 8]
  );
});

test("Pages 1, 5, and 7 render cleanly without duplicated titles or object coercion", () => {
  const { sut } = createFrontendHarness();
  authenticateStudent(sut);
  sut.openLesson(lesson.id, { page: 1, attempt: attemptSeed() });

  const pageOne = sut.elements.lessonContent.innerHTML;
  assert.equal(occurrences(renderedText(pageOne), "Formula(s) + Example(s)"), 1);
  assert.equal(occurrences(renderedText(pageOne), "句式及例子"), 1);
  assert.equal(occurrences(pageOne, lesson.examples[0].zh), 1);
  assert.doesNotMatch(pageOne, /\[object Object\]/);

  sut.setLessonPage(5);
  const pageFive = sut.elements.lessonContent.innerHTML;
  assert.equal(occurrences(renderedText(pageFive), "Benefits"), 1);
  assert.equal(occurrences(renderedText(pageFive), "表達好處"), 1);
  assert.equal(occurrences(pageFive, lesson.benefits[0].titleEn), 1);
  assert.equal(occurrences(pageFive, lesson.benefits[0].titleZh), 1);
  assert.doesNotMatch(pageFive, /\[object Object\]/);

  sut.setLessonPage(7);
  const pageSeven = sut.elements.lessonContent.innerHTML;
  assert.equal(occurrences(renderedText(pageSeven), "Important Rules"), 1);
  assert.equal(occurrences(renderedText(pageSeven), "重要規則"), 1);
  assert.equal(occurrences(pageSeven, lesson.rules[0].titleEn), 1);
  assert.equal(occurrences(pageSeven, lesson.rules[0].titleZh), 1);
  assert.doesNotMatch(pageSeven, /\[object Object\]/);
});

test("only the specifically rejected lesson content is removed from the rendered UI", () => {
  const { sut } = createFrontendHarness();
  const publicLessonData = JSON.stringify(lesson);
  assert.ok(!publicLessonData.includes(rejectedMeaningNote));
  assert.ok(!publicLessonData.includes(rejectedOriginImageEn));
  assert.ok(!publicLessonData.includes(rejectedOriginImageZh));
  authenticateStudent(sut);
  sut.openLesson(lesson.id, { page: 1, attempt: attemptSeed() });

  const pageOne = renderedText(sut.elements.lessonContent.innerHTML);
  assert.ok(pageOne.includes(lesson.meaning.zh), "the retained Chinese core meaning must remain");
  assert.ok(pageOne.includes(lesson.meaning.en), "the retained English core meaning must remain");
  assert.ok(pageOne.includes(lesson.meaning.naturalZh[0]), "the retained natural Chinese meanings must remain");
  assert.ok(!Object.hasOwn(lesson.meaning, "noteEn"), "the rejected meaning note must not remain in public lesson data");
  assert.ok(!pageOne.includes(rejectedMeaningNote), "the rejected long 'does not simply mean begin' paragraph must be absent");
  assert.doesNotMatch(pageOne, /Communicative Function|溝通功能/i);
  assert.ok(!Object.hasOwn(lesson, "communication"), "the removed Communicative Function data block must be absent");

  sut.setLessonPage(6);
  const pageSix = renderedText(sut.elements.lessonContent.innerHTML);
  assert.doesNotMatch(pageSix, /The Original Image|原來的畫面/i);
  assert.ok(!Object.hasOwn(lesson.origin, "imageEn"));
  assert.ok(!Object.hasOwn(lesson.origin, "imageZh"));
  assert.ok(!pageSix.includes(rejectedOriginImageEn));
  assert.ok(!pageSix.includes(rejectedOriginImageZh));
  assert.ok(pageSix.includes(lesson.origin.statusZh), "origin status must remain after removing the image block");
  assert.ok(pageSix.includes(lesson.origin.history[0].zh), "historical content must remain after removing the image block");
  assert.ok(pageSix.includes(lesson.origin.memoryZh), "the memory link must remain after removing the image block");
});

test("lesson Pages 1–7 consistently present Chinese before their English counterpart", () => {
  const { sut } = createFrontendHarness();
  authenticateStudent(sut);
  sut.openLesson(lesson.id, { page: 1, attempt: attemptSeed() });

  assertChineseBeforeEnglish(
    sut.elements.lessonContent.innerHTML,
    lesson.meaning.zh,
    lesson.meaning.en,
    "Page 1 core meaning"
  );
  sut.setLessonPage(2);
  assertChineseBeforeEnglish(
    sut.elements.lessonContent.innerHTML,
    lesson.register.summaryZh,
    lesson.register.summaryEn,
    "Page 2 register summary"
  );
  assertChineseBeforeEnglish(
    sut.elements.lessonContent.innerHTML,
    lesson.register.formalZh,
    lesson.register.formalEn,
    "Page 2 formal alternative"
  );
  assertChineseBeforeEnglish(
    sut.elements.lessonContent.innerHTML,
    lesson.register.contextsZh[0],
    lesson.register.contextsEn[0],
    "Page 2 natural contexts"
  );

  sut.setLessonPage(3);
  assertChineseBeforeEnglish(
    sut.elements.lessonContent.innerHTML,
    lesson.fixedVariable.fixedZh,
    lesson.fixedVariable.fixedEn,
    "Page 3 fixed part"
  );
  assertChineseBeforeEnglish(
    sut.elements.lessonContent.innerHTML,
    lesson.fixedVariable.variableZh,
    lesson.fixedVariable.variableEn,
    "Page 3 variable part"
  );

  sut.setLessonPage(4);
  const firstForm = lesson.specificForms[0];
  assertChineseBeforeEnglish(sut.elements.lessonContent.innerHTML, firstForm.titleZh, firstForm.titleEn, "Page 4 form title");
  assertChineseBeforeEnglish(sut.elements.lessonContent.innerHTML, firstForm.descriptionZh, firstForm.descriptionEn, "Page 4 form explanation");
  const formWithNote = lesson.specificForms.find((form) => form.notes?.some((note) => note.zh && note.en));
  assert.ok(formWithNote, "test material must include a bilingual Page 4 note");
  assertChineseBeforeEnglish(
    sut.elements.lessonContent.innerHTML,
    formWithNote.notes[0].zh,
    formWithNote.notes[0].en,
    "Page 4 grammar note"
  );

  sut.setLessonPage(5);
  const firstBenefit = lesson.benefits[0];
  const firstBenefitCard = sut.elements.lessonContent.innerHTML.match(/<li class="benefit-card"[\s\S]*?<\/li>/)?.[0] || "";
  assertChineseBeforeEnglish(firstBenefitCard, firstBenefit.titleZh, firstBenefit.titleEn, "Page 5 benefit title");
  assertChineseBeforeEnglish(firstBenefitCard, firstBenefit.zh, firstBenefit.en, "Page 5 benefit explanation");
  assert.ok(
    firstBenefitCard.indexOf('class="chinese"') < firstBenefitCard.indexOf('class="english"'),
    "Page 5 must use Chinese-primary then English-secondary renderer classes"
  );
  sut.setLessonPage(6);
  assertChineseBeforeEnglish(sut.elements.lessonContent.innerHTML, lesson.origin.statusZh, lesson.origin.statusEn, "Page 6 origin status");
  assertChineseBeforeEnglish(
    sut.elements.lessonContent.innerHTML,
    lesson.origin.history[0].titleZh,
    lesson.origin.history[0].titleEn,
    "Page 6 history title"
  );
  assertChineseBeforeEnglish(
    sut.elements.lessonContent.innerHTML,
    lesson.origin.history[0].zh,
    lesson.origin.history[0].en,
    "Page 6 history explanation"
  );
  assertChineseBeforeEnglish(sut.elements.lessonContent.innerHTML, lesson.origin.memoryZh, lesson.origin.memoryEn, "Page 6 memory link");

  sut.setLessonPage(7);
  const firstRule = lesson.rules[0];
  const firstRuleCard = sut.elements.lessonContent.innerHTML.match(/<li class="rule-card"[\s\S]*?<\/li>/)?.[0] || "";
  assertChineseBeforeEnglish(firstRuleCard, firstRule.titleZh, firstRule.titleEn, "Page 7 rule title");
  assertChineseBeforeEnglish(firstRuleCard, firstRule.zh, firstRule.en, "Page 7 rule explanation");
  assert.ok(
    firstRuleCard.indexOf('class="chinese"') < firstRuleCard.indexOf('class="english"'),
    "Page 7 must use Chinese-primary then English-secondary renderer classes"
  );
});

test("Benefits and Rules colour only nested idiom spans blue, never whole sentences", () => {
  const { sut } = createFrontendHarness();
  authenticateStudent(sut);
  sut.openLesson(lesson.id, { page: 5, attempt: attemptSeed() });
  const pageFive = sut.elements.lessonContent.innerHTML;
  sut.setLessonPage(7);
  const pageSeven = sut.elements.lessonContent.innerHTML;
  const pages = `${pageFive}${pageSeven}`;

  assert.doesNotMatch(pages, /<(?:p|code)[^>]*class="[^"]*target-highlight/i);
  const highlighted = [...pages.matchAll(/<span[^>]*class="[^"]*\btarget-highlight\b[^"]*"[^>]*>([\s\S]*?)<\/span>/gi)]
    .map((match) => renderedText(match[1]));
  assert.ok(highlighted.length >= 2, "Benefits and Rules must visibly mark their relevant idiom phrases");
  const idiomOnly = /^(?:(?:has|have|had|will|would|can|could|should|shall|may|might)\s+)?(?:start|starts|started|starting|get|gets|got|getting|set|sets|setting|keep|keeps|kept|keeping)\s+the ball rolling$/i;
  highlighted.forEach((text) => {
    assert.match(text, idiomOnly, `highlight must contain only an idiom phrase, not the whole sentence: ${text}`);
  });

  const benefitExample = pageFive.match(/<code[^>]*>[^<]*Idiomatic:\s*Maya[\s\S]*?<\/code>/i)?.[0] || "";
  assert.ok(benefitExample, "the representative idiomatic Benefits example must render");
  assert.match(benefitExample, /Maya\s*<span[^>]*target-highlight[^>]*>started the ball rolling<\/span>\s*by asking a question/i);
  assert.ok(renderedText(benefitExample).length > "started the ball rolling".length, "the surrounding Benefits sentence must stay outside the highlight");

  const ruleExample = pageSeven.match(/<code[^>]*>[^<]*She[\s\S]*?starts the ball rolling[\s\S]*?<\/code>/i)?.[0] || "";
  assert.ok(ruleExample, "the representative Rules sentence must render");
  assert.match(ruleExample, /She\s*<span[^>]*target-highlight[^>]*>starts the ball rolling<\/span>/i);
  assert.ok(renderedText(ruleExample).length > "starts the ball rolling".length, "the surrounding Rules sentence must stay outside the highlight");

  const targetRule = css.match(/\.target-highlight\s*\{([^}]*)\}/i)?.[1] || "";
  assert.ok(targetRule, "the idiom target highlight style must exist");
  assertBlueColor(cssColorValue(css, targetRule), "idiom target highlight");

  const exampleRule = css.match(/\.benefit-card \.examples code,\s*\.rule-card \.examples code\s*\{([^}]*)\}/i)?.[1]
    || css.match(/\.benefit-card \.examples code\s*\{([^}]*)\}/i)?.[1]
    || "";
  assert.ok(exampleRule, "Benefits and Rules example sentences need an explicit neutral style");
  assert.doesNotMatch(exampleRule, /color:\s*var\(--(?:coral|blue|accent-text)\)/i);
  const exampleColour = cssColorValue(css, exampleRule);
  const exampleRgb = rgbFromCssColor(exampleColour);
  if (exampleRgb) {
    assert.ok(!(exampleRgb[2] > exampleRgb[0] && exampleRgb[2] >= exampleRgb[1]), "whole example sentences must not be blue");
  }
});

test("correct and wrong answers support immediate correction, explicit exit, and successful correction", async () => {
  const harness = createFrontendHarness();
  const { sut, answerInputs, apiCalls } = harness;
  const [q1, q2] = lesson.questions;
  authenticateStudent(sut);
  sut.state.currentView = "lesson";
  sut.state.lessonId = lesson.id;
  sut.state.lessonPage = 8;
  sut.state.exercise = sut.exerciseFromAttempt(attemptSeed());
  answerInputs.push(
    makeElement({ dataset: { answerInput: q1.id }, value: q1.answer }),
    makeElement({ dataset: { answerInput: q2.id }, value: "not the model answer" })
  );

  await sut.submitExercise("partial");
  assert.deepEqual(Array.from(sut.state.exercise.correctIds), [q1.id]);
  assert.equal(sut.state.exercise.questionState[q1.id].status, "correct");
  assert.equal(sut.state.exercise.questionState[q2.id].status, "wrong");
  assert.deepEqual(Array.from(sut.wrongQuestionIds()), [q2.id]);
  assert.match(sut.elements.lessonContent.innerHTML, /data-start-correction/);
  assert.match(sut.elements.lessonContent.innerHTML, /answer-reveal/);

  await sut.startCorrectionRound();
  assert.equal(sut.state.exercise.correctionMode, true);
  assert.deepEqual(Array.from(sut.state.exercise.correctionIds), [q2.id]);
  assert.deepEqual(Array.from(sut.submissionQuestions(), (question) => question.id), [q2.id]);
  assert.equal(occurrences(sut.elements.lessonContent.innerHTML, "data-question-id="), 1);
  assert.match(sut.elements.lessonContent.innerHTML, /錯題改正/);
  assert.doesNotMatch(sut.elements.lessonContent.innerHTML, /第\s*\d+\s*輪|分輪|改正輪/);
  assert.ok(!sut.elements.lessonContent.innerHTML.includes(`data-question-id="${q1.id}"`));

  await sut.exitCorrectionRound();
  assert.equal(sut.state.exercise.correctionMode, false);
  assert.deepEqual(Array.from(sut.state.exercise.correctionIds), []);
  assert.equal(occurrences(sut.elements.lessonContent.innerHTML, "data-question-id="), 50);
  const exitPayload = JSON.parse(apiCalls.at(-1).options.body);
  assert.equal(exitPayload.result.correctionMode, false);
  assert.deepEqual(exitPayload.result.correctionIds, []);

  await sut.startCorrectionRound();
  answerInputs.find((input) => input.dataset.answerInput === q2.id).value = q2.answer;
  await sut.submitExercise("all");
  assert.ok(sut.state.exercise.correctIds.includes(q2.id));
  assert.equal(sut.state.exercise.questionState[q2.id].status, "correct");
  assert.equal(sut.state.exercise.correctionMode, false);
  assert.deepEqual(Array.from(sut.state.exercise.correctionIds), []);
});

test("resumed and persisted correction IDs exclude already-correct questions", async () => {
  const harness = createFrontendHarness();
  const { sut, apiCalls } = harness;
  const [q1, q2] = lesson.questions;
  const resumed = sut.exerciseFromAttempt(attemptSeed({
    roundNumber: 3,
    correctCount: 1,
    result: {
      round: 3,
      correctIds: [q1.id],
      questionState: {
        [q1.id]: { status: "correct", lastAnswer: q1.answer, reveal: true },
        [q2.id]: { status: "wrong", lastAnswer: "wrong", reveal: false }
      },
      rounds: [],
      awaitingNextRound: false,
      correctionMode: true,
      correctionIds: [q1.id, q2.id, "unknown-question"],
      collapsedCorrectIds: [],
      contentVersion: "1"
    }
  }));

  assert.equal(resumed.correctionMode, true);
  assert.deepEqual(Array.from(resumed.correctionIds), [q2.id]);
  assert.deepEqual(Array.from(sut.serializeExerciseResult(resumed).correctionIds), [q2.id]);

  authenticateStudent(sut);
  sut.state.lessonId = lesson.id;
  sut.state.exercise = resumed;
  await sut.persistExercise();
  const payload = JSON.parse(apiCalls.at(-1).options.body);
  assert.deepEqual(payload.result.correctionIds, [q2.id]);
  assert.ok(!payload.result.correctionIds.includes(q1.id));
});

test("opening the same lesson from a bookmark preserves drafts and exposes an out-of-scope target", () => {
  const harness = createFrontendHarness();
  const { sut, focusedQuestionIds, scrolledQuestionIds } = harness;
  const [q1, q2] = lesson.questions;
  authenticateStudent(sut);
  const exercise = sut.createExercise(lesson);
  exercise.drafts[q1.id] = "A draft that must survive navigation";
  exercise.questionState[q1.id] = { status: "wrong", lastAnswer: "old answer", reveal: false };
  exercise.correctionMode = true;
  exercise.correctionIds = [q1.id];
  sut.state.exercise = exercise;
  sut.state.lessonId = lesson.id;
  sut.state.currentView = "bookmarks";

  sut.openLesson(lesson.id, { page: 1 });
  assert.equal(sut.state.exercise, exercise);
  assert.equal(sut.state.exercise.drafts[q1.id], "A draft that must survive navigation");

  sut.openLesson(lesson.id, { page: 8, questionId: q2.id });
  assert.equal(sut.state.exercise, exercise);
  assert.equal(sut.state.exercise.drafts[q1.id], "A draft that must survive navigation");
  assert.equal(sut.state.exercise.correctionMode, false, "an explicit bookmark outside the correction scope must leave correction mode");
  assert.deepEqual(Array.from(sut.state.exercise.correctionIds), []);
  assert.equal(occurrences(sut.elements.lessonContent.innerHTML, "data-question-id="), 50);
  assert.ok(sut.elements.lessonContent.innerHTML.includes(`data-question-id="${q2.id}"`));
  assert.equal(focusedQuestionIds.at(-1), q2.id);
  assert.equal(scrolledQuestionIds.at(-1), q2.id);
});

test("an in-flight attempt save uses its captured token and cannot update a switched account", async () => {
  const harness = createFrontendHarness();
  const { sut, apiCalls } = harness;
  authenticateStudent(sut, "student-a", "token-a");
  sut.state.currentView = "lesson";
  sut.state.lessonId = lesson.id;
  sut.state.lessonPage = 8;
  sut.state.exercise = sut.exerciseFromAttempt(attemptSeed());

  let releaseRequest;
  const requestGate = new Promise((resolve) => { releaseRequest = resolve; });
  harness.setApiHandler(async (url, options) => {
    assert.match(new URL(url).pathname, /^\/v1\/attempts\//);
    await requestGate;
    const body = JSON.parse(options.body);
    return jsonResponse({ attempt: { id: sut.state.exercise.id, ...body } });
  });

  const oldAccountSave = sut.persistExercise();
  await Promise.resolve();
  authenticateStudent(sut, "student-b", "token-b");
  const studentBAttempt = sut.exerciseFromAttempt(attemptSeed({
    id: "22222222-2222-4222-8222-222222222222"
  }));
  sut.state.exercise = studentBAttempt;
  sut.state.attempts = [{ id: "student-b-existing-attempt" }];
  sut.state.dashboardLoaded = false;
  releaseRequest();
  await oldAccountSave;

  assert.equal(apiCalls.length, 1);
  assert.equal(apiCalls[0].options.headers.get("Authorization"), "Bearer token-a");
  assert.deepEqual(Array.from(sut.state.attempts, (attempt) => attempt.id), ["student-b-existing-attempt"]);
  assert.equal(sut.state.dashboardLoaded, false);
  assert.equal(sut.state.exercise.id, studentBAttempt.id);
});

test("a hidden-page persistence cycle never restarts the exercise clock", async () => {
  const harness = createFrontendHarness();
  const { sut, document, documentListeners } = harness;
  authenticateStudent(sut);
  sut.state.currentView = "lesson";
  sut.state.lessonId = lesson.id;
  sut.state.lessonPage = 8;
  sut.state.exercise = sut.exerciseFromAttempt(attemptSeed());
  sut.state.exerciseClockStartedAt = performance.now();
  document.visibilityState = "hidden";

  sut.bindEvents();
  const visibilityChange = documentListeners.get("visibilitychange");
  assert.equal(typeof visibilityChange, "function");
  visibilityChange();
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(sut.state.exerciseClockStartedAt, 0);
  assert.ok(sut.state.exercise.durationMs >= 0);
});

test("question progress counts every lesson question once across retries and later corrections", () => {
  const { sut } = createFrontendHarness();
  const [firstQuestion, secondQuestion] = lesson.questions;
  sut.state.progressRange = "all";
  sut.state.attempts = [
    attemptSeed({
      id: "33333333-3333-4333-8333-333333333333",
      result: {
        rounds: [
          {
            round: 1,
            submittedAt: "2026-07-27T01:00:00.000Z",
            checkedIds: [firstQuestion.id, secondQuestion.id],
            correctIds: [],
            incorrectIds: [firstQuestion.id, secondQuestion.id]
          },
          {
            round: 2,
            submittedAt: "2026-07-27T02:00:00.000Z",
            checkedIds: [firstQuestion.id],
            correctIds: [],
            incorrectIds: [firstQuestion.id]
          },
          {
            round: 3,
            submittedAt: "2026-07-28T03:00:00.000Z",
            checkedIds: [firstQuestion.id, secondQuestion.id],
            correctIds: [firstQuestion.id, secondQuestion.id],
            incorrectIds: []
          }
        ]
      }
    }),
    attemptSeed({
      id: "44444444-4444-4444-8444-444444444444",
      result: {
        rounds: [{
          round: 1,
          submittedAt: "2026-07-29T04:00:00.000Z",
          checkedIds: [firstQuestion.id],
          correctIds: [firstQuestion.id],
          incorrectIds: []
        }]
      }
    })
  ];

  const rows = sut.questionActivityRows();
  assert.equal(rows.length, 2, "six submissions for two questions must count as two questions");
  assert.deepEqual(Array.from(rows, ({ questionId }) => questionId), [firstQuestion.id, secondQuestion.id]);
  assert.ok(rows.every(({ status }) => status === "correct"), "later corrections should update the unique question outcome");
  assert.ok(rows.every(({ correctedAt }) => Number.isFinite(correctedAt)), "corrected questions should retain correction metadata");

  const series = sut.buildQuestionProgressSeries("all");
  assert.equal(series.allTotal, 2);
  assert.equal(series.periodTotal, 2);
  assert.equal(series.points.reduce((total, point) => total + point.total, 0), 2);
});

test("the collapsed progress panel has exactly the two requested summary metrics", () => {
  const summary = html.match(/<div class="progress-summary-metrics"[\s\S]*?<\/div>/)?.[0] || "";
  assert.ok(summary, "progress summary block must exist");
  assert.equal(occurrences(summary, "<article>"), 2);
  assert.equal(occurrences(summary, "data-sentence-progress-all-total"), 1);
  assert.equal(occurrences(summary, "data-sentence-time-all-total"), 1);
  assert.match(summary, /QUESTIONS DONE · 已完成題目/);
  assert.match(summary, /TIME SPENT · 練習時間/);
  assert.match(html, /data-sentence-progress-toggle aria-expanded="false"/);
  assert.match(html, /data-sentence-progress-panel[^>]+hidden/);
});

test("a completed illustrated idiom card follows the gold artwork class path", () => {
  const { sut } = createFrontendHarness();
  sut.state.attempts = [{
    ...attemptSeed(),
    status: "completed",
    correctCount: 50,
    result: { correctIds: lesson.questions.map((question) => question.id) }
  }];
  sut.renderLessonChoices();
  const rendered = sut.elements.lessonChoiceGrid.innerHTML;

  assert.match(
    rendered,
    /<article class="lesson-choice-card is-complete">[\s\S]*?<button class="lesson-choice is-complete"[^>]+data-tone="gold"[\s\S]*?<img class="lesson-choice-illustration"/
  );
  assert.match(rendered, /50 \/ 50 題已完成/);
  assert.match(
    css,
    /\.lesson-choice-card \.lesson-choice\.is-complete:has\(\.lesson-choice-illustration\)\s*\{[^}]*linear-gradient[^}]*#e5b94f/is
  );
});

test("first five use distinct short compass lessons without example-sentence galleries", () => {
  const { sut } = createFrontendHarness({ withCompass: true });
  authenticateStudent(sut);
  for (const current of content.lessons.slice(0, 5)) {
    sut.openLesson(current.id, { page: 1, attempt: attemptSeed({ lessonId: current.id }) });
    for (let page = 1; page <= 7; page += 1) {
      sut.setLessonPage(page);
      const markup = sut.elements.lessonContent.innerHTML;
      assert.match(markup, /IDIOM COMPASS/);
      assert.doesNotMatch(markup, /class="example-block"|class="examples"|例句 ·|EXAMPLE/);
      assert.ok(!markup.includes(current.examples[0].english), `${current.id} old example must stay off the teaching pages`);
    }
  }
});

test("first five show a real idiom sentence and require idiom use in social signal, response and boundary", () => {
  const { sut, compass } = createFrontendHarness({ withCompass: true });
  authenticateStudent(sut);
  const idiomPatterns = {
    "idiom-01": /start(?:ed|ing|s)? the ball rolling/i,
    "idiom-02": /shake a leg/i,
    "idiom-03": /hit the ground running/i,
    "idiom-04": /chop and change|chops and changes|chopped and changed|chopping and changing/i,
    "idiom-05": /think big|thinks big|thought big|thinking big/i
  };
  for (const current of content.lessons.slice(0, 5)) {
    const guide = compass[current.id];
    const idiom = idiomPatterns[current.id];
    assert.match(guide.modelEn, idiom, `${current.id} model must use the idiom in a sentence`);
    for (const page of [3, 5]) {
      assert.match(guide.choices[page].optionsEn[guide.choices[page].correct], idiom, `${current.id} page ${page} correct answer must say the idiom`);
    }
    assert.ok(guide.choices[6].optionsEn.every((option) => idiom.test(option)), `${current.id} boundary choices must test actual idiom use`);
    sut.openLesson(current.id, { page: 1, attempt: attemptSeed({ lessonId: current.id }) });
    let markup = sut.elements.lessonContent.innerHTML;
    assert.match(markup, /HEAR IT IN USE/);
    assert.match(markup, idiom, `${current.id} page 1 must show the idiom in context`);
    for (const page of [2, 3, 5, 6]) {
      sut.setLessonPage(page);
      markup = sut.elements.lessonContent.innerHTML;
      assert.equal(occurrences(markup, 'class="compass-option-copy"'), 3);
      assert.equal(occurrences(markup, "<strong>" ) >= 3, true);
      assert.equal(occurrences(markup, "</strong><small>") >= 3, true);
      assert.match(markup, /class="compass-option-copy"><strong>[A-Za-z]/);
      assert.match(markup, /<\/strong><small>[\u3400-\u9fff]/);
      if ([3, 5, 6].includes(page)) assert.match(markup, idiom, `${current.id} page ${page} must visibly use the idiom`);
    }
    sut.setLessonPage(7);
    markup = sut.elements.lessonContent.innerHTML;
    assert.match(markup, /Before you use it, ask yourself/);
    assert.equal(occurrences(markup, "</strong><small>"), 3);
  }
});

test("first-five practice uses single-answer English choices, including ten themed extras", async () => {
  const { sut, apiCalls } = createFrontendHarness({ withCompass: true });
  authenticateStudent(sut);
  for (const current of content.lessons.slice(0, 5)) {
    const questions = sut.compassPracticeQuestions(current);
    assert.equal(current.questions.length, 50, `${current.id}: preserve all 50 original questions`);
    assert.equal(questions.slice(0, 50).map((question) => question.id).join("|"), current.questions.map((question) => question.id).join("|"), `${current.id}: keep the original questions in order`);
    assert.equal(questions.length, 60, `${current.id} must have 60 practice questions`);
    assert.equal(new Set(questions.slice(50).map((question) => question.theme)).size, 10, `${current.id} must cover ten themes`);
    for (const question of questions) {
      const { options, rationales, correctAt } = sut.compassMcOptions(question, current);
      assert.equal(options.length, 4);
      assert.equal(rationales.length, 4, `${question.id}: explain every option`);
      assert.ok(rationales.every(Boolean), `${question.id}: no explanation may be blank`);
      assert.ok(rationales.every((reason) => /[\u3400-\u9fff]/.test(reason)), `${question.id}: explain each option in Traditional Chinese`);
      assert.equal(new Set(options).size, 4, `${question.id}: all four options must differ`);
      assert.equal(options.filter((option) => option === question.answer).length, 1, `${question.id} must have exactly one keyed answer`);
      assert.equal(options[correctAt], question.answer);
      const lengths = options.map((option) => option.trim().split(/\s+/).length);
      assert.ok(Math.max(...lengths) - Math.min(...lengths) <= 1, `${question.id}: answer length must not reveal the correct choice`);
      assert.ok(lengths[correctAt] !== Math.min(...lengths) || lengths.filter((length) => length === lengths[correctAt]).length > 1, `${question.id}: the correct choice cannot be uniquely shortest`);
      const highlighted = sut.compassMcHighlightedOptions(options, question.id);
      assert.equal(highlighted.length, 4, `${question.id}: highlight all four choices`);
      highlighted.forEach((markup, index) => {
        assert.equal(renderedText(markup), options[index], `${question.id}: highlighting must preserve choice ${index + 1}`);
        assert.match(markup, /<mark class="compass-mc-diff">[^<]+<\/mark>/, `${question.id}: show the differing phrase in choice ${index + 1}`);
      });
      assert.match(question.answer.toLowerCase(), /(ball rolling|shake a leg|ground running|chop(?:p(?:ing|ed)|s)? and chang(?:ing|ed|es)?|(?:think(?:ing|s)?|thought) big)/, `${question.id} must use its lesson idiom`);
    }
  }
  const jobLesson = content.lessons[2];
  for (const [question, actor] of [[jobLesson.questions[0], "Sarah"], [jobLesson.questions[1], "coach"]]) {
    const { options } = sut.compassMcOptions(question, jobLesson);
    assert.ok(options.every((option) => option.toLowerCase().includes(actor.toLowerCase())), `${question.id}: every choice must keep the original actor`);
    assert.ok(options.every((option) => option.includes("ground")), `${question.id}: the choices must differ in idiom use or meaning, not topic`);
  }
  sut.openLesson(lesson.id, { page: 8, attempt: attemptSeed() });
  assert.equal(occurrences(sut.elements.lessonContent.innerHTML, 'class="question-card '), 60);
  assert.equal(occurrences(sut.elements.lessonContent.innerHTML, 'data-compass-mc-choice='), 240);
  assert.ok(sut.elements.lessonContent.innerHTML.includes('School debate'));
  assert.ok(!sut.elements.lessonContent.innerHTML.includes('data-pilot-batch='));
  assert.match(sut.elements.lessonContent.innerHTML, /<mark class="compass-mc-diff">/);
  assert.doesNotMatch(sut.elements.lessonContent.innerHTML, /<textarea|data-answer-input=|data-compass-reveal|data-compass-complete/);
  assert.match(css, /\.compass-question \.question-prompt \.english \{ font-size: clamp\(20\.4px, 2\.4vw, 26\.4px\)/);
  assert.match(css, /\.compass-mc-option strong \{[^}]*font-size: clamp\(18px, 2\.04vw, 21\.6px\)/);
  assert.ok(sut.elements.lessonContent.innerHTML.includes('全部題目 · 英文選擇題'));
  const first = lesson.questions[0];
  const right = sut.compassMcOptions(first, lesson).correctAt;
  await sut.answerCompassMcQuestion(first.id, (right + 1) % 4);
  assert.equal(sut.state.exercise.correctIds.length, 0, "wrong choice must not score");
  assert.match(sut.elements.lessonContent.innerHTML, /再想想/);
  await sut.answerCompassMcQuestion(first.id, right);
  assert.deepEqual([...sut.state.exercise.correctIds], [first.id]);
  assert.equal(sut.state.exercise.questionState[first.id].status, "correct");
  assert.equal(sut.state.exercise.questionState[first.id].lastAnswer, first.answer);
  const saved = apiCalls.filter((call) => call.options.method === "PUT").at(-1);
  assert.ok(saved);
  const payload = JSON.parse(saved.options.body);
  assert.equal(payload.correctCount, 1);
  assert.equal(payload.totalCount, 50, "the protected catalog still counts the original questions");
  assert.equal(payload.result.questionState[first.id].lastAnswer, first.answer);
  const extra = sut.compassPracticeQuestions(lesson)[50];
  await sut.answerCompassMcQuestion(extra.id, sut.compassMcOptions(extra, lesson).correctAt);
  assert.equal(sut.compassBonusCorrectIds(lesson).has(extra.id), true);
  assert.equal(sut.state.exercise.correctIds.length, 1, "bonus ID must not enter the protected 50-question catalog");
  assert.equal(sut.compassReviewedCount(lesson), 2);
});

test("all four similarly sized sentences highlight the changed words", () => {
  const { sut } = createFrontendHarness({ withCompass: true });
  const current = content.lessons[2];
  const question = current.questions[2];
  const { options } = sut.compassMcOptions(question, current);
  const marked = sut.compassMcHighlightedOptions(options, question.id);
  assert.equal(marked.length, 4);
  assert.ok(marked.some((value) => /<mark class="compass-mc-diff">running<\/mark>/.test(value)));
  assert.ok(marked.some((value) => /<mark class="compass-mc-diff">walking<\/mark>/.test(value)));
  assert.ok(marked.some((value) => /<mark class="compass-mc-diff">Friday<\/mark>/.test(value)));
  assert.ok(marked.some((value) => /<mark class="compass-mc-diff">campaign<\/mark>/.test(value)));
  assert.ok(marked.every((value) => !/<mark class="compass-mc-diff">We need to hit the ground/.test(value)));
  assert.match(css, /\.compass-mc-diff \{[^}]*background: #ffe66b/);
});

test("chop and change practice uses meaningful distractors and explains them after selection", async () => {
  const { sut } = createFrontendHarness({ withCompass: true });
  authenticateStudent(sut);
  const choppingLesson = content.lessons[3];
  const first = choppingLesson.questions[0];
  const { options, correctAt } = sut.compassMcOptions(first, choppingLesson);
  assert.equal(correctAt, 1);
  assert.match(options[0], /chopping or changing/i);
  assert.match(options[1], /chopping and changing/i);
  assert.match(options[2], /next weekend/i);
  assert.match(options[3], /this holiday/i);
  const highlighted = sut.compassMcHighlightedOptions(options, first.id);
  assert.ok(highlighted[0].includes('<mark class="compass-mc-diff">or</mark>'));
  assert.ok(highlighted[2].includes('<mark class="compass-mc-diff">next weekend</mark>'));
  assert.ok(highlighted[3].includes('<mark class="compass-mc-diff">this holiday</mark>'));
  sut.openLesson(choppingLesson.id, { page: 8, attempt: attemptSeed({ lessonId: choppingLesson.id, totalCount: choppingLesson.questions.length }) });
  assert.ok(!sut.elements.lessonContent.innerHTML.includes('與原來的情境不符'));
  await sut.answerCompassMcQuestion(first.id, 0);
  assert.ok(sut.elements.lessonContent.innerHTML.includes('把 “and” 改成 “or”'));
  assert.ok(!sut.elements.lessonContent.innerHTML.includes('“chop and change” 表示反覆改變主意或計劃'));
  await sut.answerCompassMcQuestion(first.id, correctAt);
  assert.ok(sut.elements.lessonContent.innerHTML.includes('<b>A：</b> 固定慣用語是 “chop and change”'));
  assert.ok(sut.elements.lessonContent.innerHTML.includes('<b>B：</b> “chop and change” 表示反覆改變主意或計劃'));
  assert.ok(sut.elements.lessonContent.innerHTML.includes('<b>C：</b> 這句把原題的「this weekend」改成「next weekend」'));
  assert.ok(sut.elements.lessonContent.innerHTML.includes('<b>D：</b> 這句把原題的「weekend」改成「holiday」'));
  assert.match(sut.elements.lessonContent.innerHTML, /class="compass-mc-feedback" lang="zh-Hant"/);
});

test("Compass choices show the full set after resuming and legacy self-reviews do not count as correct", () => {
  const { sut } = createFrontendHarness({ withCompass: true });
  authenticateStudent(sut);
  sut.openLesson(lesson.id, { page: 2, attempt: attemptSeed() });
  assert.doesNotMatch(sut.elements.lessonContent.innerHTML, /class="compass-feedback/);
  sut.handleClick({ target: { closest(selector) {
    return selector === "[data-compass-choice]" ? { dataset: { compassChoice: "0", compassPage: "2" } } : null;
  } } });
  assert.match(sut.elements.lessonContent.innerHTML, /class="compass-feedback/);
  const reviewed = Object.fromEntries(lesson.questions.slice(0, 20).map((question) => [question.id, { status: "correct", lastAnswer: question.answer, reveal: true }]));
  sut.openLesson(lesson.id, { page: 8, attempt: attemptSeed({ correctCount: 20, result: { questionState: reviewed, correctIds: lesson.questions.slice(0, 20).map((question) => question.id) } }) });
  assert.equal(sut.pilotBatchQuestions().length, 60);
  assert.equal(occurrences(sut.elements.lessonContent.innerHTML, 'class="question-card '), 60);
  assert.ok(sut.elements.lessonContent.innerHTML.includes('data-question-id="idiom-01-q21"'));
  sut.openLesson(lesson.id, { page: 8, questionId: lesson.questions[34].id });
  assert.ok(sut.elements.lessonContent.innerHTML.includes('data-question-id="idiom-01-q35"'));
  const oldReview = Object.fromEntries(lesson.questions.slice(0, 20).map((question) => [question.id, { status: "pending", lastAnswer: "My reviewed draft", reveal: true }]));
  sut.openLesson(lesson.id, { page: 8, attempt: attemptSeed({ result: { questionState: oldReview, correctIds: [] } }) });
  assert.equal(sut.compassReviewedCount(lesson), 0);
  assert.ok(!sut.elements.lessonContent.innerHTML.includes('data-pilot-batch='));
});

test("switching accounts isolates bonus progress and clears unsaved Compass choices", async () => {
  const { sut } = createFrontendHarness({ withCompass: true });
  authenticateStudent(sut);
  sut.openLesson(lesson.id, { page: 2, attempt: attemptSeed() });
  sut.state.pilotSelections[`${lesson.id}:2`] = 1;
  sut.state.pilotOpenModels.add(lesson.questions[0].id);
  sut.openLesson(lesson.id, { page: 8, attempt: attemptSeed() });
  const extra = sut.compassPracticeQuestions(lesson)[50];
  await sut.answerCompassMcQuestion(extra.id, sut.compassMcOptions(extra, lesson).correctAt);
  assert.equal(sut.compassBonusCorrectIds(lesson).has(extra.id), true);
  sut.clearSession();
  assert.equal(Object.keys(sut.state.pilotSelections).length, 0);
  assert.equal(sut.state.pilotOpenModels.size, 0);
  authenticateStudent(sut, "student-b", "token-b");
  assert.equal(sut.compassBonusCorrectIds(lesson).has(extra.id), false);
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

console.log(`\n${tests.length - failed}/${tests.length} Idiom runtime checks passed.`);
if (failed) process.exitCode = 1;
