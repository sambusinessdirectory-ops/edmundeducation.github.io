import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const repository = process.env.WRITING_REPO_PATH || fileURLToPath(new URL("../", import.meta.url));
const html = readFileSync(`${repository}/writing-practice.html`, "utf8");
const writingDataFiles = [...html.matchAll(/<script src="(writing-practice[^"?]+-data\.js)(?:\?[^"}]*)?"/g)]
  .map(match => match[1]);
assert.ok(writingDataFiles.length >= 10, "writing page should declare its exercise data files");

function inlineApplicationSource(documentSource) {
  const externalScriptsEnd = documentSource.indexOf('<script src="writing-practice-hkpf-compositions-data.js');
  assert.ok(externalScriptsEnd >= 0, "writing data script list should exist");
  const start = documentSource.indexOf("<script>", externalScriptsEnd);
  const end = documentSource.lastIndexOf("</script>");
  assert.ok(start >= 0 && end > start, "writing application inline script should exist");
  return documentSource.slice(start + "<script>".length, end);
}

function classList() {
  return {
    add() {},
    remove() {},
    toggle() {},
    contains() { return false; }
  };
}

function createHarness(applicationSource, dataFiles) {
  const panel = { innerHTML: "", classList: classList() };
  const breadcrumbs = {
    innerHTML: "",
    classList: classList(),
    scrollLeft: 0,
    scrollWidth: 0,
    _routes: []
  };
  const documentListeners = new Map();
  const localValues = new Map();
  const document = {
    visibilityState: "visible",
    body: { classList: classList() },
    querySelector(selector) {
      if (selector === "[data-exercise-view]") return panel;
      if (selector === "[data-writing-breadcrumbs]") return breadcrumbs;
      return null;
    },
    querySelectorAll() { return []; },
    createElement() {
      return {
        classList: classList(),
        style: {},
        dataset: {},
        append() {},
        appendChild() {},
        remove() {},
        setAttribute() {},
        addEventListener() {}
      };
    },
    addEventListener(type, listener) {
      const listeners = documentListeners.get(type) || [];
      listeners.push(listener);
      documentListeners.set(type, listeners);
    }
  };
  const localStorage = {
    getItem(key) { return localValues.has(key) ? localValues.get(key) : null; },
    setItem(key, value) { localValues.set(key, String(value)); },
    removeItem(key) { localValues.delete(key); }
  };
  const windowListeners = new Map();
  const window = {
    document,
    localStorage,
    EDMUND_IELTS_WRITING_EXERCISES: {},
    EDMUND_IELTS_WRITING_OPINIONS_3_16_EXERCISES: {},
    EDMUND_IELTS_WRITING_ADVANTAGE_2_30_EXERCISES: {},
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame(callback) { callback?.(); return 1; },
    cancelAnimationFrame() {},
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    scrollTo() {},
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) || [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    },
    alert() {},
    confirm: () => true,
    open: () => null
  };

  const baseExercise = {
    id: "model-essay-9-ielts-advantage-disadvantage",
    title: "Fixture required by the writing application",
    exam: "IELTS Writing Task 2",
    taskType: "Opinion",
    paragraphs: [{ label: "Introduction", sentences: [{ parts: ["Fixture sentence."] }] }],
    translation: ["測試句子。"]
  };
  window.EDMUND_IELTS_WRITING_ADVANTAGE_2_30_EXERCISES[baseExercise.id] = baseExercise;

  const injectedSource = applicationSource.replace(/\n    init\(\);\s*$/, `
    window.__EDMUND_WRITING_TRANSLATION_TEST__ = {
      installExercise(exercise) {
        writingExercises[exercise.id] = exercise;
        currentExerciseSectionKey = exercise.id;
        currentExerciseId = "";
        currentPathwayLevel = "exercise";
        currentEssayTypeKey = "";
        prepareWritingExercises();
        practiceState = defaultPracticeState(exercise);
      },
      useExercise(exerciseId) {
        currentExerciseSectionKey = exerciseId;
        currentExerciseId = "";
        currentPathwayLevel = "exercise";
        practiceState = defaultPracticeState(currentExercise());
      },
      exerciseIds: () => Object.keys(writingExercises),
      state: () => practiceState,
      exercise: () => currentExercise(),
      renderMode: () => renderModePage(currentExercise()),
      renderRound: () => renderPracticeRound(currentExercise()),
      renderView: () => renderExerciseView(),
      startMode: (mode, difficultyKey) => startPracticeMode(mode, difficultyKey),
      updateParagraph: (index, checked) => updatePracticeParagraph(index, checked),
      paragraphTranslation: index => practiceTranslationLinesForParagraph(currentExercise(), index),
      fixedLineTranslation: line => practiceTranslationLinesForEnglish(currentExercise(), line),
      setupEvents: () => setupEvents()
    };
  `);
  assert.notEqual(injectedSource, applicationSource, "test hooks should replace init() without running the application");

  const context = {
    window,
    document,
    localStorage,
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    requestAnimationFrame: window.requestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame,
    FormData,
    Blob,
    URL,
    URLSearchParams,
    Headers,
    Request,
    Response,
    AbortController,
    TextEncoder,
    TextDecoder,
    navigator: {},
    location: { hostname: "localhost" },
    Audio: class {
      addEventListener() {}
      removeEventListener() {}
      pause() {}
      play() { return Promise.resolve(); }
    }
  };
  vm.createContext(context);
  dataFiles.forEach(filename => {
    vm.runInContext(readFileSync(`${repository}/${filename}`, "utf8"), context, { filename });
  });
  vm.runInContext(injectedSource, context, { filename: "writing-practice.html" });
  return {
    hooks: window.__EDMUND_WRITING_TRANSLATION_TEST__,
    panel,
    documentListeners
  };
}

const ANSWER_SENTINEL = "LEAK_SENTINEL_ANSWER";
const TRANSLATIONS = [
  "測試引言翻譯甲。",
  "測試正文第一段翻譯乙。",
  "測試正文第二段翻譯丙。",
  "測試結論翻譯丁。"
];
const DIFFICULTIES = ["standard", "medium", "hard", "hell"];
const MODES = ["blank", "start", "end", "both"];

function fixtureExercise() {
  const english = [
    `Safe opening ${ANSWER_SENTINEL} closes.`,
    "Body paragraph one remains visible.",
    "Body paragraph two remains visible.",
    "The conclusion remains visible."
  ];
  return {
    id: "writing-translation-toggle-fixture",
    title: "Translation Toggle Fixture",
    exam: "IELTS Writing Task 2",
    taskType: "Opinion",
    questionPrompt: ["Complete the practice without revealing its answer."],
    practiceModes: [...MODES],
    practiceModeDetails: Object.fromEntries(MODES.map(mode => [mode, {
      title: `Fixture ${mode}`,
      description: `Fixture ${mode} hint style.`
    }])),
    practiceDifficultySets: DIFFICULTIES.map(key => ({
      key,
      title: `${key} difficulty`,
      titleZh: `${key} 難度`,
      answers: [ANSWER_SENTINEL]
    })),
    paragraphs: english.map((sentence, paragraphIndex) => ({
      label: `Paragraph ${paragraphIndex + 1}`,
      sentences: [{
        parts: paragraphIndex === 0
          ? ["Safe opening ", { answer: ANSWER_SENTINEL }, " closes."]
          : [sentence]
      }]
    })),
    translation: [...TRANSLATIONS],
    translationSections: english.map((sentence, index) => ({
      title: `Paragraph ${index + 1}`,
      subtitle: `第 ${index + 1} 段`,
      items: [{
        label: "Sentence",
        english: sentence,
        chinese: TRANSLATIONS[index]
      }]
    }))
  };
}

function occurrences(source, token) {
  return source.split(token).length - 1;
}

function elementOpeningTag(source, attribute) {
  const match = source.match(new RegExp(`<[^>]+${attribute}(?:=[^\\s>]+|="[^"]*")?[^>]*>`));
  assert.ok(match, `${attribute} should be rendered`);
  return match[0];
}

function elementsInnerHtml(source, attribute) {
  const openingPattern = new RegExp(`<[^>]+${attribute}(?:=[^\\s>]+|="[^"]*")?[^>]*>`, "g");
  const elements = [];
  let openingMatch;
  while ((openingMatch = openingPattern.exec(source))) {
    const opening = openingMatch[0];
    const start = openingMatch.index;
    const tagName = opening.match(/^<([\w-]+)/)?.[1];
    assert.ok(tagName, `${attribute} should belong to an HTML element`);
    const tokenPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "g");
    tokenPattern.lastIndex = start;
    let depth = 0;
    let token;
    while ((token = tokenPattern.exec(source))) {
      if (token[0].startsWith(`</${tagName}`)) depth -= 1;
      else depth += 1;
      if (depth === 0) {
        elements.push(source.slice(start + opening.length, token.index));
        openingPattern.lastIndex = tokenPattern.lastIndex;
        break;
      }
    }
  }
  assert.ok(elements.length, `${attribute} should have at least one complete element`);
  return elements.join("\n");
}

function assertToggle(htmlSource, pressed) {
  assert.equal(occurrences(htmlSource, "data-toggle-practice-translation"), 1, "each screen should expose one stable translation-toggle hook");
  const opening = elementOpeningTag(htmlSource, "data-toggle-practice-translation");
  assert.match(opening, /^<button\b/, "translation toggle must use native button semantics");
  assert.match(opening, /\btype="button"/, "translation toggle must not submit the answer form");
  assert.match(opening, new RegExp(`\\baria-pressed="${pressed}"`), "translation toggle must expose its current state to assistive technology");
  const expectedText = pressed ? "隱藏中文翻譯" : "顯示中文翻譯";
  const buttonStart = htmlSource.indexOf(opening);
  const buttonEnd = htmlSource.indexOf("</button>", buttonStart);
  assert.ok(buttonEnd > buttonStart, "translation toggle should have visible accessible text");
  assert.ok(htmlSource.slice(buttonStart, buttonEnd).includes(expectedText), `translation toggle should say ${expectedText}`);
}

function assertTranslationHidden(htmlSource) {
  assert.equal(htmlSource.includes("data-practice-translation"), false, "hidden translations should not remain in the exercise DOM");
  TRANSLATIONS.forEach(translation => {
    assert.equal(htmlSource.includes(translation), false, `hidden translation must not leak: ${translation}`);
  });
}

function assertTranslationScope(htmlSource, selectedIndexes) {
  assert.ok(htmlSource.includes("data-practice-translation"), "visible translations need a stable placement hook");
  const translationHtml = elementsInnerHtml(htmlSource, "data-practice-translation");
  assert.match(elementOpeningTag(htmlSource, "data-practice-translation"), /\blang="zh-Hant"/, "Chinese practice translation should declare Traditional Chinese");
  TRANSLATIONS.forEach((translation, index) => {
    assert.equal(
      translationHtml.includes(translation),
      selectedIndexes.includes(index),
      `translation mapping should ${selectedIndexes.includes(index) ? "include" : "exclude"} paragraph ${index + 1}`
    );
  });
  assert.equal(translationHtml.includes(ANSWER_SENTINEL), false, "translation support must never reveal a correct English answer");
}

function clickTarget(attribute) {
  const node = {
    getAttribute(name) { return name === attribute ? "" : null; },
    closest(selector) { return selector === `[${attribute}]` ? node : null; }
  };
  return node;
}

const source = inlineApplicationSource(html);
const harness = createHarness(source, writingDataFiles);
const hooks = harness.hooks;
assert.ok(hooks, "writing translation test hooks should load");
hooks.installExercise(fixtureExercise());
hooks.setupEvents();
hooks.renderView();

const clickHandler = harness.documentListeners.get("click")?.[0];
assert.equal(typeof clickHandler, "function", "writing click handler should be registered");

assert.equal(hooks.state().showTranslation, false, "Chinese translation must default to hidden");
let selectorHtml = hooks.renderMode();
assertToggle(selectorHtml, false);
assertTranslationHidden(selectorHtml);
assert.equal(occurrences(selectorHtml, "data-start-practice-mode="), 16, "selector should offer four difficulties × four hint styles");

await clickHandler({ target: clickTarget("data-toggle-practice-translation"), preventDefault() {} });
assert.equal(hooks.state().showTranslation, true, "selector toggle should persist its choice in practice state");
selectorHtml = harness.panel.innerHTML;
assertToggle(selectorHtml, true);

for (const difficulty of DIFFICULTIES) {
  for (const mode of MODES) {
    hooks.startMode(mode, difficulty);
    assert.equal(hooks.state().showTranslation, true, `${difficulty}/${mode} should inherit the selector's translation choice`);
    assert.equal(hooks.state().difficultyKey, difficulty);
    assert.equal(hooks.state().mode, mode);
    const practiceHtml = harness.panel.innerHTML;
    assertToggle(practiceHtml, true);
    assertTranslationScope(practiceHtml, [0, 1, 2, 3]);
    assert.equal(practiceHtml.includes(ANSWER_SENTINEL), false, `${difficulty}/${mode} must not leak the correct English answer anywhere in the live round`);

    await clickHandler({ target: clickTarget("data-back-practice-mode"), preventDefault() {} });
    assert.equal(hooks.state().screen, "mode");
    assert.equal(hooks.state().showTranslation, true, `${difficulty}/${mode} back navigation should retain the translation choice`);
    assertToggle(harness.panel.innerHTML, true);
  }
}

hooks.startMode("blank", "standard");
hooks.updateParagraph(0, false);
hooks.updateParagraph(2, false);
hooks.updateParagraph(3, false);
assert.deepEqual(Array.from(hooks.state().selectedParagraphs), [1], "paragraph selector should narrow the exercise to one paragraph");
assert.equal(hooks.state().showTranslation, true, "changing paragraph scope must not reset translation visibility");
assertTranslationScope(harness.panel.innerHTML, [1]);

await clickHandler({ target: clickTarget("data-select-full-essay"), preventDefault() {} });
assert.deepEqual(Array.from(hooks.state().selectedParagraphs), [0, 1, 2, 3], "full-essay navigation should restore every paragraph");
assert.equal(hooks.state().showTranslation, true, "full-essay navigation must retain translation visibility");
assertTranslationScope(harness.panel.innerHTML, [0, 1, 2, 3]);

await clickHandler({ target: clickTarget("data-toggle-practice-translation"), preventDefault() {} });
assert.equal(hooks.state().showTranslation, false, "practice-screen toggle should hide translations without leaving the round");
assert.equal(hooks.state().screen, "practice");
assertToggle(harness.panel.innerHTML, false);
assertTranslationHidden(harness.panel.innerHTML);
assert.equal(harness.panel.innerHTML.includes(ANSWER_SENTINEL), false, "hiding translation must not reveal the correct answer elsewhere");

const translationMappingGaps = [];
hooks.exerciseIds().forEach(exerciseId => {
  if (exerciseId === fixtureExercise().id) return;
  hooks.useExercise(exerciseId);
  const exercise = hooks.exercise();
  const hasTranslationData = Boolean(
    exercise?.translation?.length
    || exercise?.translationSections?.length
  );
  if (!hasTranslationData) return;
  exercise.paragraphs.forEach((_, paragraphIndex) => {
    if (!hooks.paragraphTranslation(paragraphIndex).length) {
      translationMappingGaps.push(`${exerciseId}: paragraph ${paragraphIndex + 1}`);
    }
  });
  [...(exercise.essayLeadLines || []), ...(exercise.essayClosingLines || [])].forEach(line => {
    if (!hooks.fixedLineTranslation(line).length) {
      translationMappingGaps.push(`${exerciseId}: fixed line ${line}`);
    }
  });
});
assert.deepEqual(
  translationMappingGaps,
  [],
  `every translated exercise paragraph and fixed letter/article line must map to Chinese: ${translationMappingGaps.join("; ")}`
);

console.log("Writing translation toggle tests passed: safe default, 16 mode combinations, persistent navigation, corpus mapping, accessibility and no answer leakage.");
