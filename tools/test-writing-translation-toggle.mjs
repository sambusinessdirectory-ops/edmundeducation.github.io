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
  const animationFrames = new Map();
  let nextAnimationFrame = 1;
  const requestAnimationFrame = callback => {
    const id = nextAnimationFrame;
    nextAnimationFrame += 1;
    animationFrames.set(id, callback);
    return id;
  };
  const cancelAnimationFrame = id => animationFrames.delete(id);
  const createdAudios = [];
  const deferredAudioPlays = [];
  let deferNextAudioPlay = false;
  class FakeAudio {
    constructor() {
      this.currentTime = 0;
      this.paused = true;
      this.ended = false;
      this.error = null;
      this.playbackRate = 1;
      this.defaultPlaybackRate = 1;
      createdAudios.push(this);
    }
    play() {
      this.paused = false;
      this.ended = false;
      this.onplay?.();
      if (deferNextAudioPlay) {
        deferNextAudioPlay = false;
        return new Promise((resolve, reject) => {
          deferredAudioPlays.push({ audio: this, resolve, reject });
        });
      }
      return Promise.resolve();
    }
    pause() {
      if (this.paused) return;
      this.paused = true;
      this.onpause?.();
    }
    removeAttribute() {}
    load() {}
    addEventListener() {}
    removeEventListener() {}
  }
  const windowListeners = new Map();
  const window = {
    document,
    localStorage,
    EDMUND_IELTS_WRITING_EXERCISES: {},
    EDMUND_IELTS_WRITING_OPINIONS_3_16_EXERCISES: {},
    EDMUND_IELTS_WRITING_ADVANTAGE_2_30_EXERCISES: {},
    EDMUND_WRITING_AUDIO: {},
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame,
    cancelAnimationFrame,
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
      setAudioManifest: manifest => { window.EDMUND_WRITING_AUDIO = manifest || {}; },
      listeningSegments: () => practiceListeningSegments(currentExercise()),
      difficultyKeys: () => practiceDifficultySetsForExercise(currentExercise()).map(item => item.key),
      useDifficulty: difficultyKey => {
        practiceState.screen = "practice";
        practiceState.mode = "blank";
        practiceState.difficultyKey = difficultyKey || "";
        practiceState.sentenceKeys = null;
        practiceState.targetBlankIds = null;
        return practiceListeningSegments(currentExercise());
      },
      setAudioRate: rate => setEssayAudioRate(rate),
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
    requestAnimationFrame,
    cancelAnimationFrame,
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
    Audio: FakeAudio
  };
  vm.createContext(context);
  dataFiles.forEach(filename => {
    vm.runInContext(readFileSync(`${repository}/${filename}`, "utf8"), context, { filename });
  });
  vm.runInContext(injectedSource, context, { filename: "writing-practice.html" });
  return {
    hooks: window.__EDMUND_WRITING_TRANSLATION_TEST__,
    panel,
    documentListeners,
    createdAudios,
    runAnimationFrames() {
      const callbacks = [...animationFrames.values()];
      animationFrames.clear();
      callbacks.forEach(callback => callback?.());
    },
    deferNextAudioPlay() {
      deferNextAudioPlay = true;
    },
    rejectOldestDeferredPlay(error = new Error("Delayed fixture rejection")) {
      deferredAudioPlays.shift()?.reject(error);
    }
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

function clickTarget(attribute, value = "") {
  const node = {
    getAttribute(name) { return name === attribute ? value : null; },
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

function listeningFixture() {
  return {
    id: "writing-listening-mode-fixture",
    title: "Listening Mode Fixture",
    exam: "IELTS Writing Task 2",
    taskType: "Listening",
    practiceModes: ["blank"],
    paragraphs: [
      {
        label: "Introduction",
        sentences: [
          { parts: ["Listen ", { answer: "carefully" }, "."] },
          { parts: ["This bridge sentence has no blank."] },
          { parts: ["Write ", { answer: "the answer" }, " now."] }
        ]
      },
      {
        label: "Body Paragraph 1",
        sentences: [
          { parts: ["Finish with ", { answer: "two" }, " ", { answer: "blanks" }, " today."] }
        ]
      }
    ]
  };
}

function listeningFixtureAudio(exercise) {
  let time = 0;
  const words = [];
  exercise.paragraphs.forEach(paragraph => {
    paragraph.sentences.forEach(sentence => {
      const sentenceWords = sentence.parts
        .map(part => typeof part === "object" ? part.answer : part)
        .join("")
        .match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu) || [];
      sentenceWords.forEach(word => {
        words.push([word, Number(time.toFixed(3)), Number((time + 0.18).toFixed(3))]);
        time += 0.2;
      });
      time += 0.6;
    });
  });
  return {
    duration: Number((time + 0.2).toFixed(3)),
    path: "fixture-listening.mp3",
    wordCount: words.length,
    words
  };
}

const listenExercise = listeningFixture();
const listenExerciseAudio = listeningFixtureAudio(listenExercise);
hooks.setAudioManifest({ [listenExercise.id]: listenExerciseAudio });
hooks.installExercise(listenExercise);
hooks.renderView();

let listeningHtml = harness.panel.innerHTML;
const listeningToggle = elementOpeningTag(listeningHtml, "data-toggle-practice-listening");
assert.match(listeningToggle, /^<button\b/, "listening mode should use native button semantics");
assert.match(listeningToggle, /\btype="button"/, "listening toggle must not submit the answer form");
assert.match(listeningToggle, /\baria-pressed="false"/, "listening mode must default to OFF");
assert.doesNotMatch(listeningToggle, /\bdisabled\b/, "matching audio should make listening mode available");

await clickHandler({ target: clickTarget("data-toggle-practice-listening"), preventDefault() {} });
assert.equal(hooks.state().listeningEnabled, true, "listening toggle should persist ON before practice starts");
assert.equal(
  occurrences(harness.panel.innerHTML, "data-essay-audio-rate="),
  6,
  "listening mode should expose all six playback speeds before the round"
);

harness.deferNextAudioPlay();
hooks.startMode("blank", "");
let segments = hooks.listeningSegments();
assert.equal(segments.length, 3, "only target-bearing sentences should become listening units");
assert.equal(segments[2].blankIds.length, 2, "multiple blanks in one sentence should share one listening unit");
assert.equal(hooks.state().listeningPlaying, true, "the first listening sentence should start automatically");
assert.equal(hooks.state().listeningUnitIndex, 0);
assert.equal(harness.createdAudios.length, 1, "automatic listening should create one audio player");
assert.equal(harness.createdAudios[0].currentTime, segments[0].startTime, "automatic playback should seek to the first target sentence");
const firstSentenceFinalWordEnd = listenExerciseAudio.words[segments[0].endWordIndex][2];
assert.ok(
  segments[0].stopTime >= firstSentenceFinalWordEnd + 0.26,
  "a sentence-final blank should retain enough audio tail to speak the complete answer"
);
assert.equal(
  segments.at(-1).stopTime,
  listenExerciseAudio.duration,
  "the final listening sentence should play to the natural end of its audio file"
);
const activePracticeHtml = hooks.renderRound();
assert.ok(
  activePracticeHtml.indexOf("data-next-practice-listening") < activePracticeHtml.indexOf("data-toggle-practice-translation"),
  "continue listening should appear to the left of the Chinese translation button"
);
assert.ok(
  activePracticeHtml.indexOf("data-toggle-practice-translation") < activePracticeHtml.indexOf("data-toggle-practice-listening"),
  "listening ON/OFF should appear immediately after the Chinese translation button"
);
const previousButtonAtStart = elementOpeningTag(activePracticeHtml, "data-previous-practice-listening");
const replayButtonAtStart = elementOpeningTag(activePracticeHtml, "data-replay-practice-listening");
assert.match(previousButtonAtStart, /^<button\b/, "previous sentence should use native button semantics");
assert.match(previousButtonAtStart, /\btype="button"/, "previous sentence must not submit the answer form");
assert.match(previousButtonAtStart, /\bdisabled\b/, "previous sentence should be disabled on the first listening unit");
assert.match(replayButtonAtStart, /^<button\b/, "replay sentence should use native button semantics");
assert.match(replayButtonAtStart, /\btype="button"/, "replay sentence must not submit the answer form");
assert.doesNotMatch(replayButtonAtStart, /\bdisabled\b/, "replay should be available while the current sentence is playing");
assert.match(activePracticeHtml, /上一句/, "the listening panel should label the previous-sentence control");
assert.match(activePracticeHtml, /重播本句/, "the listening panel should label the replay control");

harness.createdAudios[0].currentTime = firstSentenceFinalWordEnd + 0.16;
harness.runAnimationFrames();
assert.equal(
  harness.createdAudios[0].paused,
  false,
  "playback must continue beyond the old cutoff so a sentence-final answer is fully spoken"
);
const audioCountAtFirstUnit = harness.createdAudios.length;
await clickHandler({ target: clickTarget("data-previous-practice-listening"), preventDefault() {} });
assert.equal(harness.createdAudios.length, audioCountAtFirstUnit, "previous should safely do nothing on the first unit");
assert.equal(hooks.state().listeningUnitIndex, 0, "an invalid previous action must keep the first unit selected");
assert.equal(harness.createdAudios[0].paused, false, "an invalid previous action must not interrupt current playback");
assert.equal(hooks.state().listeningPlaying, true, "an invalid previous action must preserve the playing state");

harness.createdAudios[0].pause();
assert.equal(hooks.state().listeningPlaying, false, "a mid-sentence pause should update listening state");
assert.match(hooks.state().listeningPlaybackError, /已暫停/, "a paused sentence should expose a visible recovery state");
listeningHtml = hooks.renderRound();
const pausedNextButton = elementOpeningTag(listeningHtml, "data-next-practice-listening");
const pausedReplayButton = elementOpeningTag(listeningHtml, "data-replay-practice-listening");
assert.match(pausedNextButton, /\bdisabled\b/, "continue should remain disabled until the paused sentence finishes");
assert.match(listeningHtml, /繼續下一句/, "the main progression control should remain dedicated to the next sentence");
assert.doesNotMatch(pausedReplayButton, /\bdisabled\b/, "touch users should be able to replay a paused sentence");
assert.match(listeningHtml, /重播本句/, "a paused sentence should direct learners to the dedicated replay button");

await clickHandler({ target: clickTarget("data-replay-practice-listening"), preventDefault() {} });
assert.equal(harness.createdAudios.length, 2, "replaying a paused sentence should replace its audio player");
assert.equal(harness.createdAudios[1].currentTime, segments[0].startTime);
assert.equal(hooks.state().listeningUnitIndex, 0, "replay should keep the current listening unit");
assert.equal(hooks.state().listeningUnitFinished, false, "replay should reset the current unit's completion state");
assert.equal(hooks.state().listeningPlaybackError, "", "replay should clear the paused recovery message");
harness.rejectOldestDeferredPlay();
await Promise.resolve();
await Promise.resolve();
assert.equal(harness.createdAudios[1].paused, false, "a delayed rejection from an old player must not stop the replacement");
assert.equal(hooks.state().listeningPlaying, true, "an obsolete rejection must not fail the active listening unit");

await clickHandler({ target: clickTarget("data-essay-audio-rate", "0.5"), preventDefault() {} });
assert.equal(harness.createdAudios[1].playbackRate, 0.5, "speed changes should apply during listening playback");

harness.createdAudios[1].currentTime = segments[0].stopTime + 0.02;
harness.runAnimationFrames();
assert.equal(harness.createdAudios[1].paused, true, "the audio should pause at the sentence boundary");
assert.equal(hooks.state().listeningUnitFinished, true, "the first sentence should become ready for answers");
assert.equal(hooks.state().listeningPlaying, false);

const inputHandler = harness.documentListeners.get("input")?.[0];
assert.equal(typeof inputHandler, "function", "writing input handler should be registered");
const firstBlankInput = {
  value: "carefully",
  getAttribute(name) { return name === "data-answer-id" ? `${listenExercise.id}-q1` : null; },
  closest(selector) { return selector === "[data-answer-id]" ? firstBlankInput : null; }
};
inputHandler({ target: firstBlankInput });

await clickHandler({ target: clickTarget("data-next-practice-listening"), preventDefault() {} });
assert.equal(hooks.state().listeningUnitIndex, 1, "continue should advance to the next target-bearing sentence");
assert.equal(hooks.state().answers[`${listenExercise.id}-q1`], "carefully", "continuing must preserve typed answers");
assert.equal(harness.createdAudios.length, 3);
assert.equal(harness.createdAudios[2].currentTime, segments[1].startTime);
assert.equal(harness.createdAudios[2].playbackRate, 0.5, "the selected speed should carry into the next sentence");
const secondUnitHtml = hooks.renderRound();
assert.doesNotMatch(
  elementOpeningTag(secondUnitHtml, "data-previous-practice-listening"),
  /\bdisabled\b/,
  "previous should become available after advancing beyond the first unit"
);
assert.doesNotMatch(
  elementOpeningTag(secondUnitHtml, "data-replay-practice-listening"),
  /\bdisabled\b/,
  "replay should remain available on later units"
);

await clickHandler({ target: clickTarget("data-previous-practice-listening"), preventDefault() {} });
assert.equal(harness.createdAudios[2].paused, true, "previous should stop the sentence that is currently playing");
assert.equal(hooks.state().listeningUnitIndex, 0, "previous should return to the preceding listening unit");
assert.equal(hooks.state().answers[`${listenExercise.id}-q1`], "carefully", "previous must preserve typed answers");
assert.equal(harness.createdAudios.length, 4);
assert.equal(harness.createdAudios[3].currentTime, segments[0].startTime);
assert.equal(harness.createdAudios[3].playbackRate, 0.5, "previous should preserve the selected playback speed");
assert.match(
  elementOpeningTag(hooks.renderRound(), "data-previous-practice-listening"),
  /\bdisabled\b/,
  "previous should become disabled again after returning to the first unit"
);

harness.createdAudios[3].currentTime = segments[0].stopTime + 0.02;
harness.runAnimationFrames();
await clickHandler({ target: clickTarget("data-next-practice-listening"), preventDefault() {} });
assert.equal(hooks.state().listeningUnitIndex, 1);
assert.equal(harness.createdAudios[4].currentTime, segments[1].startTime);
harness.createdAudios[4].currentTime = segments[1].stopTime + 0.02;
harness.runAnimationFrames();
await clickHandler({ target: clickTarget("data-next-practice-listening"), preventDefault() {} });
assert.equal(hooks.state().listeningUnitIndex, 2);
assert.equal(harness.createdAudios[5].currentTime, segments[2].startTime);
harness.createdAudios[5].currentTime = segments[2].stopTime + 0.02;
harness.runAnimationFrames();
assert.equal(hooks.state().listeningUnitFinished, true);
listeningHtml = hooks.renderRound();
const completedButton = elementOpeningTag(listeningHtml, "data-next-practice-listening");
assert.match(completedButton, /\bdisabled\b/, "continue should be disabled after the final listening sentence");
assert.match(listeningHtml, /聆聽練習已完成/, "the final control should announce completion");
assert.doesNotMatch(
  elementOpeningTag(listeningHtml, "data-previous-practice-listening"),
  /\bdisabled\b/,
  "previous should remain available after the final sentence finishes"
);
assert.doesNotMatch(
  elementOpeningTag(listeningHtml, "data-replay-practice-listening"),
  /\bdisabled\b/,
  "replay should remain available after the final sentence finishes"
);

await clickHandler({ target: clickTarget("data-replay-practice-listening"), preventDefault() {} });
assert.equal(hooks.state().listeningUnitIndex, 2, "replaying the final sentence should stay on the final unit");
assert.equal(hooks.state().listeningUnitFinished, false, "replaying the final sentence should reopen its playback state");
assert.equal(harness.createdAudios[6].currentTime, segments[2].startTime);
assert.equal(harness.createdAudios[6].paused, false);
harness.createdAudios[6].ended = true;
harness.createdAudios[6].paused = true;
harness.createdAudios[6].onpause?.();
assert.equal(hooks.state().listeningPlaybackError, "", "a natural media ending must not announce a false pause error");
harness.createdAudios[6].onended?.();
assert.equal(hooks.state().listeningUnitFinished, true, "the replayed final sentence should complete normally");
listeningHtml = hooks.renderRound();
assert.match(
  elementOpeningTag(listeningHtml, "data-next-practice-listening"),
  /\bdisabled\b/,
  "the next button should return to its completed state after replaying the final sentence"
);
assert.match(listeningHtml, /聆聽練習已完成/, "the completed status should return after final-sentence replay");

await clickHandler({ target: clickTarget("data-toggle-practice-listening"), preventDefault() {} });
assert.equal(hooks.state().listeningEnabled, false, "students should be able to turn listening mode back OFF");

await clickHandler({ target: clickTarget("data-toggle-practice-listening"), preventDefault() {} });
assert.equal(hooks.state().listeningEnabled, true);
const exitAudio = harness.createdAudios.at(-1);
assert.equal(exitAudio.paused, false, "turning listening back on during a round should start its first sentence");
await clickHandler({ target: clickTarget("data-back-essay"), preventDefault() {} });
assert.equal(exitAudio.paused, true, "returning to the essay must stop an active listening segment");
assert.equal(hooks.state(), null, "returning to the essay should leave practice mode");

const audioManifestWindow = {};
vm.runInNewContext(readFileSync(`${repository}/writing-audio-manifest.js`, "utf8"), { window: audioManifestWindow });
const fullAudioManifest = audioManifestWindow.EDMUND_WRITING_AUDIO;
assert.equal(Object.keys(fullAudioManifest).length, 235, "the complete writing audio manifest should contain 235 essays");
hooks.setAudioManifest(fullAudioManifest);
const listeningMappingGaps = [];
let checkedListeningConfigurations = 0;
hooks.exerciseIds().forEach(exerciseId => {
  if (exerciseId === listenExercise.id || exerciseId === fixtureExercise().id) return;
  if (!fullAudioManifest[exerciseId]) {
    listeningMappingGaps.push(`${exerciseId}: missing manifest entry`);
    return;
  }
  hooks.useExercise(exerciseId);
  const difficultyKeys = hooks.difficultyKeys();
  (difficultyKeys.length ? difficultyKeys : [""]).forEach(difficultyKey => {
    const exerciseSegments = hooks.useDifficulty(difficultyKey);
    checkedListeningConfigurations += 1;
    if (!exerciseSegments.length) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} has no listening segments`);
    }
    if (exerciseSegments.some(segment => segment.startSentenceIndex !== segment.endSentenceIndex)) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} crosses a sentence boundary`);
    }
    if (exerciseSegments.some(segment => !Number.isFinite(segment.startTime) || !Number.isFinite(segment.stopTime) || segment.stopTime <= segment.startTime)) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} has an invalid playback range`);
    }
    if (exerciseSegments.some(segment => {
      const manifestEntry = fullAudioManifest[exerciseId];
      const finalWordEnd = Number(manifestEntry?.words?.[segment.endWordIndex]?.[2]);
      const isFinalAudioWord = segment.endWordIndex === manifestEntry.words.length - 1;
      const nextWordStart = Number(manifestEntry?.words?.[segment.endWordIndex + 1]?.[1]);
      const expectedStopTime = isFinalAudioWord
        ? Number(manifestEntry.duration)
        : Math.max(finalWordEnd, Math.min(finalWordEnd + 0.35, nextWordStart - 0.18));
      return Math.abs(segment.stopTime - expectedStopTime) > 0.001;
    })) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} violates the protected sentence-ending boundary`);
    }
    if (exerciseSegments.some((segment, index) => index > 0 && segment.startTime <= exerciseSegments[index - 1].startTime)) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} has out-of-order playback ranges`);
    }
  });
});
assert.deepEqual(
  listeningMappingGaps,
  [],
  `every writing difficulty should map its blanks to timed listening sentences: ${listeningMappingGaps.join("; ")}`
);
assert.ok(checkedListeningConfigurations >= 900, "the listening audit should cover every normal and exceptional difficulty");

console.log(`Writing translation/listening tests passed: safe translation, sentence-bounded audio, speed control, continuation, ${checkedListeningConfigurations} corpus configurations and no answer leakage.`);
