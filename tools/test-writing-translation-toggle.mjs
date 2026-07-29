import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const LISTENING_RELEASE_BUFFER = 2.00;
const repository = process.env.WRITING_REPO_PATH || fileURLToPath(new URL("../", import.meta.url));
const html = readFileSync(`${repository}/writing-practice.html`, "utf8");
const writingAttemptsSql = readFileSync(`${repository}/supabase-writing-practice-attempts.sql`, "utf8");
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
  let failLocalStorageWrites = false;
  let trackedAnswerInputs = [];
  const document = {
    visibilityState: "visible",
    body: { classList: classList() },
    querySelector(selector) {
      if (selector === "[data-exercise-view]") return panel;
      if (selector === "[data-writing-breadcrumbs]") return breadcrumbs;
      if (selector.startsWith("[data-answer-id")) return trackedAnswerInputs[0] || null;
      return null;
    },
    querySelectorAll(selector) {
      return selector === "[data-answer-id]" ? trackedAnswerInputs : [];
    },
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
    setItem(key, value) {
      if (failLocalStorageWrites) throw new Error("Simulated localStorage quota failure");
      localValues.set(key, String(value));
    },
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
  let failNextEagerAudioSeek = false;
  let deferNextMetadataAudioSeek = false;
  class FakeAudio {
    constructor() {
      this._currentTime = 0;
      this.readyState = 0;
      this.seeking = false;
      this.paused = true;
      this.ended = false;
      this.error = null;
      this.playbackRate = 1;
      this.defaultPlaybackRate = 1;
      this.playCalls = 0;
      this.failEagerAudioSeek = failNextEagerAudioSeek;
      failNextEagerAudioSeek = false;
      this.deferMetadataAudioSeek = deferNextMetadataAudioSeek;
      deferNextMetadataAudioSeek = false;
      this.pendingCurrentTime = null;
      this.listeners = new Map();
      createdAudios.push(this);
    }
    get currentTime() {
      return this._currentTime;
    }
    set currentTime(value) {
      if (this.failEagerAudioSeek && this.readyState === 0) {
        throw new Error("Metadata is not ready for seeking");
      }
      if (this.deferMetadataAudioSeek && this.readyState > 0) {
        this.pendingCurrentTime = Number(value);
        this.seeking = true;
        return;
      }
      this._currentTime = Number(value);
      this.seeking = false;
    }
    emit(type) {
      const listeners = [...(this.listeners.get(type) || [])];
      listeners.forEach(listener => listener.call(this));
      this.listeners.set(type, (this.listeners.get(type) || []).filter(listener => !listener.once));
    }
    play() {
      this.playCalls += 1;
      if (this.readyState === 0) {
        this.readyState = 1;
        this.emit("loadedmetadata");
      }
      this.paused = false;
      this.ended = false;
      this.onplay?.();
      this.onplaying?.();
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
    addEventListener(type, listener, options = {}) {
      const listeners = this.listeners.get(type) || [];
      listener.once = Boolean(options?.once);
      listeners.push(listener);
      this.listeners.set(type, listeners);
    }
    removeEventListener(type, listener) {
      this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item !== listener));
    }
    completeDeferredSeek(offset = 0) {
      if (this.pendingCurrentTime === null) return false;
      this._currentTime = this.pendingCurrentTime + Number(offset || 0);
      this.pendingCurrentTime = null;
      this.deferMetadataAudioSeek = false;
      this.seeking = false;
      this.readyState = 4;
      this.onseeked?.();
      return true;
    }
    emitPlaying() {
      this.onplaying?.();
    }
    advancePlayback(seconds = 0.05) {
      this._currentTime += Number(seconds) || 0;
      this.ontimeupdate?.();
    }
  }
  const windowListeners = new Map();
  let windowScrollCalls = 0;
  const releaseTimers = new Map();
  const releaseTimerDelays = [];
  let nextReleaseTimerId = -1;
  const windowSetTimeout = (callback, delay, ...args) => {
    if (Number(delay) === LISTENING_RELEASE_BUFFER * 1000) {
      const timerId = nextReleaseTimerId;
      nextReleaseTimerId -= 1;
      releaseTimers.set(timerId, () => callback(...args));
      releaseTimerDelays.push(Number(delay));
      return timerId;
    }
    return setTimeout(callback, delay, ...args);
  };
  const windowClearTimeout = timerId => {
    if (releaseTimers.delete(timerId)) return;
    clearTimeout(timerId);
  };
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
    setTimeout: windowSetTimeout,
    clearTimeout: windowClearTimeout,
    setInterval,
    clearInterval,
    scrollTo() { windowScrollCalls += 1; },
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
      taskOnePathSnapshot(exerciseId) {
        const sectionKey = sectionKeyForWritingExercise(exerciseId);
        const ancestry = writingExerciseAncestry(sectionKey, exerciseId);
        const pathway = writingPathways[sectionKey];
        const task = getPathwayTask(pathway, ancestry.taskKey || "");
        const essayType = getPathwayEssayType(pathway, ancestry.essayTypeKey || "");
        currentView = "exercise";
        currentExerciseSectionKey = sectionKey;
        setWritingPathForExercise(sectionKey, exerciseId);
        currentExerciseId = exerciseId;
        currentEssayTab = "essay";
        practiceState = null;
        return {
          sectionKey,
          ancestry: { ...ancestry },
          taskKey: task?.key || "",
          essayTypeKey: essayType?.key || "",
          categoryDeckIds: [...(essayType?.deckIds || [])],
          state: {
            currentExerciseSectionKey,
            currentPathwayLevel,
            currentEssayTypeKey,
            currentExerciseId
          },
          breadcrumbs: writingBreadcrumbEntries().map(entry => ({
            label: entry.label || "",
            view: entry.route?.view || "",
            taskKey: entry.route?.taskKey || "",
            essayTypeKey: entry.route?.essayTypeKey || "",
            exerciseId: entry.route?.exerciseId || ""
          }))
        };
      },
      pathwayState: () => ({
        currentExerciseSectionKey,
        currentPathwayLevel,
        currentEssayTypeKey,
        currentExerciseId,
        breadcrumbs: writingBreadcrumbEntries().map(entry => ({
          label: entry.label || "",
          view: entry.route?.view || "",
          taskKey: entry.route?.taskKey || "",
          essayTypeKey: entry.route?.essayTypeKey || "",
          exerciseId: entry.route?.exerciseId || ""
        }))
      }),
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
      setProgressResults(studentName, results) {
        currentUser = { name: studentName, role: "student" };
        writingPracticeResults = normalizeWritingPracticeResults(results);
        writingAttemptHistoryComplete = true;
      },
      progressSeries: (rangeKey, nowValue) => buildWritingProgressSeries(rangeKey, currentUser?.name, nowValue),
      progressChart: series => writingProgressChartSvg(series),
      setCumulativeProgress(nextVisible) { setWritingCumulativeProgressVisible(nextVisible); },
      cumulativeProgressVisible: () => showWritingCumulativeProgress,
      timeSeries: (rangeKey, nowValue) => buildWritingTimeSeries(rangeKey, currentUser?.name, nowValue),
      timeChart: series => writingTimeChartSvg(series),
      formatDuration: value => formatWritingDuration(value),
      elapsedDuration: (startedAt, finishedAt) => writingPracticeElapsedDuration(startedAt, finishedAt),
      progressDayKey: value => writingProgressDayKey(value),
      selectedProgressDay: () => selectedWritingProgressDayKey,
      selectedTimeDay: () => selectedWritingTimeDayKey,
      setCurrentStudent(user) { currentUser = { ...user, role: "student" }; },
      setRawWritingState(value) { localStorage.setItem(WRITING_STATE_KEY, JSON.stringify(value)); },
      rawWritingState: () => readJson(WRITING_STATE_KEY, {}),
      accountKey: () => writingStateAccountKey(),
      localAccountState: () => getWritingLocalAccountState(),
      migrateNameAccount: () => migrateWritingNameAccountToId(currentUser),
      loadStudentState: () => loadWritingStudentState(),
      saveAttempt: result => savePracticeResult(result),
      progressResults: () => [...writingPracticeResults],
      attemptOutbox: () => [...writingAttemptOutbox],
      setAttemptOutbox(results) { writingAttemptOutbox = normalizeWritingPracticeResults(results); },
      attemptOutboxCapacity: () => MAX_WRITING_ATTEMPT_OUTBOX,
      boundedAttemptCache: results => boundedWritingAttemptCache(results),
      normalizeDeleteRequests: value => normalizeWritingAttemptDeleteRequests(value),
      attemptCoveredByDelete: (result, requests) => writingAttemptCoveredByDelete(result, requests),
      setDashboardUiState(range, day, open, visibleCount) {
        selectedWritingProgressRange = range;
        selectedWritingProgressDayKey = day;
        writingAttemptLogOpen = open;
        writingAttemptLogVisibleCount = visibleCount;
      },
      dashboardUiState: () => ({
        range: selectedWritingProgressRange,
        day: selectedWritingProgressDayKey,
        open: writingAttemptLogOpen,
        visibleCount: writingAttemptLogVisibleCount
      }),
      resetPersonalState: () => resetWritingPersonalState(),
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
    setLocalStorageWriteFailure(value) {
      failLocalStorageWrites = Boolean(value);
    },
    runAnimationFrames() {
      const callbacks = [...animationFrames.values()];
      animationFrames.clear();
      callbacks.forEach(callback => callback?.());
    },
    deferNextAudioPlay() {
      deferNextAudioPlay = true;
    },
    failNextEagerAudioSeek() {
      failNextEagerAudioSeek = true;
    },
    deferNextMetadataAudioSeek() {
      deferNextMetadataAudioSeek = true;
    },
    completeLatestAudioSeek(offset = 0) {
      return createdAudios.at(-1)?.completeDeferredSeek(offset) || false;
    },
    emitLatestAudioPlaying() {
      createdAudios.at(-1)?.emitPlaying();
    },
    advanceLatestAudio(seconds) {
      createdAudios.at(-1)?.advancePlayback(seconds);
    },
    setTrackedAnswerInputs(inputs = []) {
      trackedAnswerInputs = inputs;
    },
    windowScrollCalls() {
      return windowScrollCalls;
    },
    setVisibilityState(value) {
      document.visibilityState = value;
      (documentListeners.get("visibilitychange") || []).forEach(listener => listener());
    },
    emitWindowEvent(type) {
      const listeners = windowListeners.get(type) || [];
      listeners.forEach(listener => listener());
      return listeners.length;
    },
    flushReleaseTimers() {
      const callbacks = [...releaseTimers.values()];
      releaseTimers.clear();
      callbacks.forEach(callback => callback());
    },
    releaseTimerDelays() {
      return [...releaseTimerDelays];
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
const LISTENING_PREROLL = 0.20;
const LISTENING_PREVIOUS_GUARD = 0.10;
const LISTENING_NEXT_GUARD = 0.08;

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

const taskOnePathSentinels = [
  { category: "bar-charts", label: "Bar Charts", count: 8, exerciseId: "model-essay-1-ielts-task1-bar-charts" },
  { category: "line-graph", label: "Line Graph", count: 9, exerciseId: "model-essay-1-ielts-task1-line-graph" },
  { category: "pie-charts", label: "Pie Charts", count: 6, exerciseId: "model-essay-1-ielts-task1-pie-charts" },
  { category: "process-diagram", label: "Process Diagram", count: 9, exerciseId: "model-essay-1-ielts-task1-process-diagram" },
  { category: "maps", label: "Maps", count: 10, exerciseId: "model-essay-9-ielts-task1-maps" },
  { category: "tables", label: "Tables", count: 11, exerciseId: "model-essay-11-ielts-task1-tables" },
  { category: "mixed-charts", label: "Mixed Charts", count: 7, exerciseId: "model-essay-7-ielts-task1-mixed-charts" }
];

for (const sentinel of taskOnePathSentinels) {
  assert.ok(hooks.exerciseIds().includes(sentinel.exerciseId), `${sentinel.exerciseId} should be loaded into the writing runtime`);
  const snapshot = hooks.taskOnePathSnapshot(sentinel.exerciseId);
  assert.equal(snapshot.sectionKey, "ielts-writing", `${sentinel.exerciseId} should resolve to the IELTS section`);
  assert.equal(snapshot.ancestry.taskKey, "task-1", `${sentinel.exerciseId} should have Task 1 ancestry`);
  assert.equal(snapshot.ancestry.essayTypeKey, sentinel.category, `${sentinel.exerciseId} should retain its exact category ancestry`);
  assert.equal(snapshot.taskKey, "task-1");
  assert.equal(snapshot.essayTypeKey, sentinel.category);
  assert.equal(snapshot.categoryDeckIds.length, sentinel.count, `${sentinel.category} should expose its complete Task 1 deck inventory`);
  assert.ok(snapshot.categoryDeckIds.includes(sentinel.exerciseId), `${sentinel.exerciseId} should belong to its rendered category`);
  assert.equal(snapshot.state.currentExerciseSectionKey, "ielts-writing");
  assert.equal(snapshot.state.currentPathwayLevel, "category");
  assert.equal(snapshot.state.currentEssayTypeKey, sentinel.category);
  assert.equal(snapshot.state.currentExerciseId, sentinel.exerciseId);
  assert.deepEqual(
    Array.from(snapshot.breadcrumbs, entry => entry.label),
    ["寫作首頁", "IELTS Writing", "Task 1 (Charts)", sentinel.label, hooks.exercise().title],
    `${sentinel.exerciseId} should render the exact Task 1 breadcrumb chain`
  );
  assert.deepEqual(
    Array.from(snapshot.breadcrumbs, entry => entry.view),
    ["dashboard", "section", "writing-task", "essay-type", "essay"]
  );
  assert.equal(snapshot.breadcrumbs[2].taskKey, "task-1");
  assert.equal(snapshot.breadcrumbs[3].taskKey, "task-1");
  assert.equal(snapshot.breadcrumbs[3].essayTypeKey, sentinel.category);
  assert.equal(snapshot.breadcrumbs[4].exerciseId, sentinel.exerciseId);

  await clickHandler({ target: clickTarget("data-back-writing-pathway"), preventDefault() {} });
  let backState = hooks.pathwayState();
  assert.equal(backState.currentExerciseSectionKey, "ielts-writing");
  assert.equal(backState.currentExerciseId, "");
  assert.equal(backState.currentPathwayLevel, "category", `${sentinel.exerciseId} should return to its category`);
  assert.equal(backState.currentEssayTypeKey, sentinel.category);
  assert.deepEqual(
    Array.from(backState.breadcrumbs, entry => entry.label),
    ["寫作首頁", "IELTS Writing", "Task 1 (Charts)", sentinel.label]
  );

  await clickHandler({ target: clickTarget("data-pathway-back"), preventDefault() {} });
  backState = hooks.pathwayState();
  assert.equal(backState.currentPathwayLevel, "task-1", `${sentinel.category} should return to the Task 1 type selector`);
  assert.equal(backState.currentEssayTypeKey, "");
  assert.deepEqual(
    Array.from(backState.breadcrumbs, entry => entry.label),
    ["寫作首頁", "IELTS Writing", "Task 1 (Charts)"]
  );
}

hooks.installExercise(fixtureExercise());
hooks.renderView();

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
          { parts: ["Write ", { answer: "the answer" }, " now."] },
          { parts: ["Carry this context into the next paragraph."] }
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

const isolatedState = hooks.state();
const isolatedTarget = hooks.exercise().paragraphs[0].sentences[2].parts
  .find(part => part && typeof part === "object" && part.answer);
isolatedState.screen = "practice";
isolatedState.round = 2;
isolatedState.mode = "blank";
isolatedState.targetBlankIds = [isolatedTarget.id];
const [isolatedSegment] = hooks.listeningSegments();
assert.equal(isolatedSegment.startSentenceIndex, 2, "the remedial unit should target the late mistake sentence");
assert.equal(
  isolatedSegment.playbackStartSentenceIndex,
  2,
  "a remedial unit must not replay hidden, already-mastered sentences"
);
isolatedState.screen = "mode";
isolatedState.round = 1;
isolatedState.mode = "";
isolatedState.targetBlankIds = null;

harness.deferNextAudioPlay();
hooks.startMode("blank", "");
let segments = hooks.listeningSegments();
assert.equal(segments.length, 3, "only target-bearing sentences should become listening units");
assert.equal(segments[2].blankIds.length, 2, "multiple blanks in one sentence should share one listening unit");
assert.equal(
  segments[1].playbackStartSentenceIndex,
  1,
  "an unblanked bridge sentence should lead into the next target-bearing listening unit"
);
assert.equal(segments[1].startSentenceIndex, 2, "the second unit should retain its actual target sentence index");
assert.equal(
  listenExerciseAudio.words[segments[1].startWordIndex][0],
  "This",
  "the bridge sentence must be spoken instead of skipped"
);
assert.equal(
  listenExerciseAudio.words[segments[1].endWordIndex][0],
  "now",
  "the bridge unit should stop only after the target-bearing sentence is complete"
);
assert.equal(
  segments[2].playbackStartParagraphIndex,
  0,
  "a trailing blank-free sentence should carry across the paragraph boundary"
);
assert.equal(segments[2].playbackStartSentenceIndex, 3);
assert.equal(segments[2].playbackEndParagraphIndex, 1);
assert.equal(
  listenExerciseAudio.words[segments[2].startWordIndex][0],
  "Carry",
  "cross-paragraph playback should not omit the prior paragraph's trailing sentence"
);
assert.equal(
  listenExerciseAudio.words[segments[2].endWordIndex][0],
  "today",
  "cross-paragraph playback should stop after the next target-bearing sentence"
);
assert.ok(segments.every(segment => segment.blankIds.length > 0), "every listening unit must end on an active blank");
assert.equal(hooks.state().listeningPlaying, true, "the first listening sentence should start automatically");
assert.equal(hooks.state().listeningUnitIndex, 0);
assert.equal(harness.createdAudios.length, 1, "automatic listening should create one audio player");
assert.equal(harness.createdAudios[0].currentTime, segments[0].startTime, "automatic playback should seek to the first target sentence");
const firstSentenceFinalWordEnd = listenExerciseAudio.words[segments[0].endWordIndex][2];
const firstSentenceNextWordStart = listenExerciseAudio.words[segments[0].endWordIndex + 1][1];
assert.equal(segments[0].startTime, 0, "pre-roll at the beginning of an audio file should clamp to zero");
assert.ok(segments[0].stopTime > firstSentenceFinalWordEnd, "the final answer needs protected release time");
assert.equal(
  segments[0].stopTime,
  Math.max(firstSentenceFinalWordEnd, firstSentenceNextWordStart - LISTENING_NEXT_GUARD),
  "a non-final sentence should use the full silent gap before the next sentence"
);
assert.ok(
  segments[0].stopTime < firstSentenceNextWordStart,
  "a non-final sentence must stop before the next sentence begins"
);
assert.equal(
  segments.at(-1).stopTime,
  null,
  "the final listening sentence should use the media element's natural ending"
);
const secondSentenceFirstWordStart = listenExerciseAudio.words[segments[1].startWordIndex][1];
const secondSentencePreviousWordEnd = listenExerciseAudio.words[segments[1].startWordIndex - 1][2];
const expectedSecondSentenceStart = Math.max(
  0,
  Math.min(
    secondSentenceFirstWordStart,
    Math.max(
      secondSentencePreviousWordEnd + LISTENING_PREVIOUS_GUARD,
      secondSentenceFirstWordStart - LISTENING_PREROLL
    )
  )
);
assert.equal(segments[1].startTime, expectedSecondSentenceStart, "later sentences should use the protected pre-roll policy");
assert.ok(segments[1].startTime < secondSentenceFirstWordStart, "pre-roll should begin before the first spoken word");
assert.ok(segments[1].startTime > secondSentencePreviousWordEnd, "pre-roll must not replay the preceding word");
const activePracticeHtml = hooks.renderRound();
assert.ok(
  activePracticeHtml.indexOf("data-toggle-practice-translation") < activePracticeHtml.indexOf("data-toggle-practice-listening"),
  "listening ON/OFF should appear immediately after the Chinese translation button"
);
assert.equal(occurrences(activePracticeHtml, "data-next-practice-listening"), 1, "the round should render one continue control");
const listeningPanelHtml = elementsInnerHtml(activePracticeHtml, "data-practice-listening-panel");
const listeningNavigationHtml = elementsInnerHtml(listeningPanelHtml, "data-practice-listening-navigation");
assert.ok(
  listeningNavigationHtml.indexOf("data-previous-practice-listening")
    < listeningNavigationHtml.indexOf("data-replay-practice-listening"),
  "previous should appear before replay in the green listening bar"
);
assert.ok(
  listeningNavigationHtml.indexOf("data-replay-practice-listening")
    < listeningNavigationHtml.indexOf("data-next-practice-listening"),
  "continue should appear directly after replay in the green listening bar"
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

harness.createdAudios[0].currentTime = segments[0].stopTime - 0.01;
harness.runAnimationFrames();
assert.equal(
  harness.createdAudios[0].paused,
  false,
  "playback should use the available silence immediately before the next sentence"
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

let automaticAnswerFocusCalls = 0;
let automaticAnswerScrollCalls = 0;
harness.setTrackedAnswerInputs([{
  value: "",
  getAttribute(name) { return name === "data-answer-id" ? `${listenExercise.id}-q1` : null; },
  focus() { automaticAnswerFocusCalls += 1; },
  scrollIntoView() { automaticAnswerScrollCalls += 1; }
}]);
const windowScrollCallsBeforeSentenceEnd = harness.windowScrollCalls();
harness.createdAudios[1].currentTime = segments[0].stopTime + 0.02;
harness.runAnimationFrames();
assert.equal(harness.createdAudios[1].paused, true, "the audio should pause at the sentence boundary");
assert.equal(hooks.state().listeningUnitFinished, false, "the first sentence should remain unfinished during its quiet release buffer");
assert.equal(hooks.state().listeningPlaying, false);
assert.equal(hooks.state().listeningPlaybackError, "", "the intentional quiet release must not look like a playback error");
assert.match(hooks.renderRound(), /句尾緩衝中/, "the quiet release buffer should have a clear status");
assert.match(
  elementOpeningTag(hooks.renderRound(), "data-next-practice-listening"),
  /\bdisabled\b/,
  "continue should remain disabled during the quiet release buffer"
);
const keydownHandler = harness.documentListeners.get("keydown")?.[0];
assert.equal(typeof keydownHandler, "function", "the Space-key playback handler should be registered");
const manualReleasePlayCalls = harness.createdAudios[1].playCalls;
let manualReleasePreventDefaultCalls = 0;
keydownHandler({
  code: "Space",
  repeat: false,
  target: { closest() { return null; } },
  preventDefault() { manualReleasePreventDefaultCalls += 1; }
});
assert.equal(
  harness.createdAudios[1].playCalls,
  manualReleasePlayCalls,
  "Space must not restart a sentence during its quiet release buffer"
);
assert.equal(manualReleasePreventDefaultCalls, 1, "Space should be safely consumed during the quiet release");
assert.equal(harness.emitWindowEvent("pagehide"), 1, "the pagehide interruption handler should be registered");
assert.equal(hooks.state().listeningPlaybackError, "", "page hiding must preserve an intentional quiet release");
assert.equal(hooks.state().listeningUnitFinished, false);
harness.flushReleaseTimers();
assert.equal(hooks.state().listeningUnitFinished, true, "the first sentence should become ready after the quiet release");
assert.equal(automaticAnswerFocusCalls, 0, "sentence completion must not force focus or move the learner to an answer field");
assert.equal(automaticAnswerScrollCalls, 0, "sentence completion must not scroll an answer field into view");
assert.equal(
  harness.windowScrollCalls(),
  windowScrollCallsBeforeSentenceEnd,
  "sentence completion must not move the page viewport"
);
harness.setTrackedAnswerInputs([]);

const inputHandler = harness.documentListeners.get("input")?.[0];
assert.equal(typeof inputHandler, "function", "writing input handler should be registered");
const firstBlankInput = {
  value: "carefully",
  getAttribute(name) { return name === "data-answer-id" ? `${listenExercise.id}-q1` : null; },
  closest(selector) { return selector === "[data-answer-id]" ? firstBlankInput : null; }
};
inputHandler({ target: firstBlankInput });

harness.failNextEagerAudioSeek();
harness.deferNextMetadataAudioSeek();
await clickHandler({ target: clickTarget("data-next-practice-listening"), preventDefault() {} });
assert.equal(hooks.state().listeningUnitIndex, 1, "continue should advance to the next target-bearing sentence");
assert.equal(hooks.state().answers[`${listenExercise.id}-q1`], "carefully", "continuing must preserve typed answers");
assert.equal(harness.createdAudios.length, 3);
assert.equal(harness.createdAudios[2].seeking, true, "the next sentence should wait while its metadata seek is pending");
assert.equal(
  harness.createdAudios[2].muted,
  true,
  "a metadata-dependent seek must keep time-zero opening audio silent"
);
assert.equal(
  hooks.state().listeningPlaying,
  false,
  "a pending seek must not be reported as audible playback"
);
assert.equal(
  harness.completeLatestAudioSeek(0.3),
  true,
  "an overshooting metadata seek should be detected and corrected"
);
assert.equal(
  harness.createdAudios[2].currentTime,
  segments[1].startTime,
  "metadata-ready retry should return to the protected pre-roll instead of clipping the first word"
);
assert.equal(
  hooks.state().listeningPlaying,
  true,
  "a completed seek should begin at the verified sentence boundary without clipping its first word"
);
assert.equal(harness.createdAudios[2].muted, false, "verified sentence playback should unmute immediately");
harness.advanceLatestAudio(0.05);
assert.equal(
  hooks.state().listeningPlaying,
  true,
  "verified media-time progression should keep the correctly sought sentence active"
);
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
assert.equal(hooks.state().listeningUnitFinished, false, "replayed sentences should also enter the quiet release buffer");
harness.flushReleaseTimers();
await clickHandler({ target: clickTarget("data-next-practice-listening"), preventDefault() {} });
assert.equal(hooks.state().listeningUnitIndex, 1);
assert.equal(harness.createdAudios[4].currentTime, segments[1].startTime);
harness.createdAudios[4].currentTime = segments[1].stopTime + 0.02;
harness.runAnimationFrames();
assert.equal(hooks.state().listeningUnitFinished, false);
harness.flushReleaseTimers();
await clickHandler({ target: clickTarget("data-next-practice-listening"), preventDefault() {} });
assert.equal(hooks.state().listeningUnitIndex, 2);
assert.equal(harness.createdAudios[5].currentTime, segments[2].startTime);
harness.createdAudios[5].currentTime = listenExerciseAudio.duration - 0.01;
harness.runAnimationFrames();
assert.equal(
  harness.createdAudios[5].paused,
  false,
  "the final sentence must not be paused by a synthetic manifest boundary"
);
assert.equal(
  hooks.state().listeningUnitFinished,
  false,
  "the final sentence must remain active until the media element reaches its natural ending"
);
harness.createdAudios[5].ended = true;
harness.createdAudios[5].paused = true;
harness.createdAudios[5].onpause?.();
harness.createdAudios[5].onended?.();
assert.equal(
  hooks.state().listeningUnitFinished,
  false,
  "the natural ending should retain the final audio element during its two-second release buffer"
);
const finalAudioPlayCalls = harness.createdAudios[5].playCalls;
let finalReleasePreventDefaultCalls = 0;
keydownHandler({
  code: "Space",
  repeat: false,
  target: { closest() { return null; } },
  preventDefault() { finalReleasePreventDefaultCalls += 1; }
});
assert.equal(
  harness.createdAudios[5].playCalls,
  finalAudioPlayCalls,
  "Space must not restart an ended recording during its final release buffer"
);
assert.equal(finalReleasePreventDefaultCalls, 1, "Space should be safely consumed during the final release");
assert.equal(hooks.state().listeningUnitFinished, false, "Space must not short-circuit the final release buffer");
harness.setVisibilityState("hidden");
assert.equal(
  hooks.state().listeningPlaybackError,
  "",
  "hiding the page during the final release buffer must not create a false interruption"
);
assert.equal(hooks.state().listeningUnitFinished, false, "visibility changes must preserve the final release buffer");
harness.setVisibilityState("visible");
assert.equal(harness.emitWindowEvent("pagehide"), 1, "pagehide should exercise the registered interruption handler");
assert.equal(hooks.state().listeningPlaybackError, "");
assert.equal(hooks.state().listeningUnitFinished, false, "pagehide must not short-circuit the final release buffer");
harness.flushReleaseTimers();
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
assert.equal(hooks.state().listeningUnitFinished, false, "a replayed final sentence should keep the same release buffer");
harness.flushReleaseTimers();
assert.equal(hooks.state().listeningUnitFinished, true, "the replayed final sentence should complete normally");
listeningHtml = hooks.renderRound();
assert.match(
  elementOpeningTag(listeningHtml, "data-next-practice-listening"),
  /\bdisabled\b/,
  "the next button should return to its completed state after replaying the final sentence"
);
assert.match(listeningHtml, /聆聽練習已完成/, "the completed status should return after final-sentence replay");

await clickHandler({ target: clickTarget("data-previous-practice-listening"), preventDefault() {} });
const manualReleaseBeforeReplay = harness.createdAudios.at(-1);
assert.equal(hooks.state().listeningUnitIndex, 1, "previous should reopen the preceding listening sentence");
manualReleaseBeforeReplay.currentTime = segments[1].stopTime + 0.02;
harness.runAnimationFrames();
assert.equal(manualReleaseBeforeReplay.paused, true);
assert.equal(hooks.state().listeningUnitFinished, false, "the reopened sentence should enter its manual release buffer");
await clickHandler({ target: clickTarget("data-replay-practice-listening"), preventDefault() {} });
const replacementAfterPendingRelease = harness.createdAudios.at(-1);
assert.notEqual(replacementAfterPendingRelease, manualReleaseBeforeReplay, "replay should replace the pending audio player");
harness.flushReleaseTimers();
assert.equal(replacementAfterPendingRelease.paused, false, "a stale release timer must not stop replacement playback");
assert.equal(hooks.state().listeningUnitFinished, false, "a stale release timer must not complete the replayed sentence");
assert.equal(hooks.state().listeningUnitIndex, 1, "a stale release timer must not change the active sentence");
assert.ok(harness.releaseTimerDelays().length >= 6, "manual and natural endings should both schedule quiet release buffers");
assert.ok(
  harness.releaseTimerDelays().every(delay => delay === LISTENING_RELEASE_BUFFER * 1000),
  "every listening release buffer should last exactly two seconds"
);

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
assert.equal(Object.keys(fullAudioManifest).length, 310, "the complete writing audio manifest should contain 310 essays");
hooks.setAudioManifest(fullAudioManifest);
[
  {
    id: "dse-writing-2022-part-b-q3",
    paragraphStartWordIndex: 10,
    paragraphFirstWord: "Your",
    firstTargetSentenceIndex: 0,
    firstTargetFinalWord: "decision"
  },
  {
    id: "dse-writing-2024-part-b-q5",
    paragraphStartWordIndex: 11,
    paragraphFirstWord: "At",
    firstTargetSentenceIndex: 0,
    firstTargetFinalWord: "friends"
  },
  {
    id: "dse-writing-2025-part-b-q3",
    paragraphStartWordIndex: 6,
    paragraphFirstWord: "In",
    firstTargetSentenceIndex: 1,
    firstTargetFinalWord: "drilling"
  }
].forEach(testCase => {
  hooks.useExercise(testCase.id);
  const [firstSegment] = hooks.useDifficulty("");
  const manifestEntry = fullAudioManifest[testCase.id];
  assert.ok(firstSegment, `${testCase.id} should expose a first listening segment`);
  assert.equal(
    firstSegment.playbackStartSentenceIndex,
    0,
    `${testCase.id} should begin with the paragraph's first sentence, even when it has no blank`
  );
  assert.equal(
    firstSegment.startSentenceIndex,
    testCase.firstTargetSentenceIndex,
    `${testCase.id} should retain the sentence containing its first blank`
  );
  assert.equal(
    firstSegment.startWordIndex,
    testCase.paragraphStartWordIndex,
    `${testCase.id} should exclude its title and salutation from listening playback`
  );
  assert.equal(
    manifestEntry.words[firstSegment.startWordIndex][0],
    testCase.paragraphFirstWord,
    `${testCase.id} should start on the first word of its essay body`
  );
  assert.equal(
    manifestEntry.words[firstSegment.endWordIndex][0],
    testCase.firstTargetFinalWord,
    `${testCase.id} should stop after the full first target-bearing sentence`
  );
});
hooks.useExercise("dse-writing-2022-part-b-q3");
const dse2022Segments = hooks.useDifficulty("");
const dse2022Manifest = fullAudioManifest["dse-writing-2022-part-b-q3"];
const dse2022MultiBridge = dse2022Segments.find(segment => (
  segment.paragraphIndex === 3 && segment.startSentenceIndex === 3
));
assert.ok(dse2022MultiBridge, "DSE 2022 should expose its multi-sentence bridge unit");
assert.equal(dse2022MultiBridge.playbackStartParagraphIndex, 3);
assert.equal(dse2022MultiBridge.playbackStartSentenceIndex, 1);
assert.equal(dse2022Manifest.words[dse2022MultiBridge.startWordIndex][0], "You");
assert.equal(dse2022Manifest.words[dse2022MultiBridge.endWordIndex][0], "forever");
const dse2022FinalSegment = dse2022Segments.at(-1);
assert.equal(dse2022FinalSegment.playbackEndParagraphIndex, 4);
assert.equal(dse2022FinalSegment.playbackEndSentenceIndex, 3);
assert.equal(dse2022FinalSegment.endWordIndex, 688);
assert.equal(dse2022Manifest.words[dse2022FinalSegment.endWordIndex][0], "discipline");
assert.equal(
  dse2022Manifest.words[dse2022FinalSegment.endWordIndex + 1][0],
  "Brew",
  "listening should stop at the final active blank sentence, not append answerless tail prose"
);
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
    if (
      exerciseSegments[0]?.playbackStartParagraphIndex !== 0
      || exerciseSegments[0]?.playbackStartSentenceIndex !== 0
    ) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} skips the first body sentence`);
    }
    if (exerciseSegments.some(segment => segment.startSentenceIndex !== segment.endSentenceIndex)) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} crosses a sentence boundary`);
    }
    if (exerciseSegments.some(segment => !segment.blankIds.length)) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} contains an answerless listening unit`);
    }
    if (exerciseSegments.some(segment => {
      const manifestEntry = fullAudioManifest[exerciseId];
      const isFinalAudioWord = segment.endWordIndex === manifestEntry.words.length - 1;
      return !Number.isFinite(segment.startTime)
        || (isFinalAudioWord
          ? segment.stopTime !== null
          : !Number.isFinite(segment.stopTime) || segment.stopTime <= segment.startTime);
    })) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} has an invalid playback range`);
    }
    if (exerciseSegments.some(segment => {
      const manifestEntry = fullAudioManifest[exerciseId];
      const firstWordStart = Number(manifestEntry?.words?.[segment.startWordIndex]?.[1]);
      const previousWordEnd = Number(manifestEntry?.words?.[segment.startWordIndex - 1]?.[2]);
      const finalWordEnd = Number(manifestEntry?.words?.[segment.endWordIndex]?.[2]);
      const isFinalAudioWord = segment.endWordIndex === manifestEntry.words.length - 1;
      const nextWordStart = Number(manifestEntry?.words?.[segment.endWordIndex + 1]?.[1]);
      const earliestSafeStart = Number.isFinite(previousWordEnd)
        ? previousWordEnd + LISTENING_PREVIOUS_GUARD
        : 0;
      const expectedStartTime = Math.max(
        0,
        Math.min(firstWordStart, Math.max(earliestSafeStart, firstWordStart - LISTENING_PREROLL))
      );
      const expectedStopTime = isFinalAudioWord
        ? null
        : Math.max(finalWordEnd, nextWordStart - LISTENING_NEXT_GUARD);
      return Math.abs(segment.startTime - expectedStartTime) > 0.001
        || (isFinalAudioWord
          ? segment.stopTime !== null
          : Math.abs(segment.stopTime - expectedStopTime) > 0.001
            || segment.stopTime >= nextWordStart);
    })) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} violates the protected sentence playback boundary`);
    }
    if (exerciseSegments.some((segment, index) => index > 0 && segment.startTime <= exerciseSegments[index - 1].startTime)) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} has out-of-order playback ranges`);
    }
    if (exerciseSegments.some((segment, index) => (
      index > 0 && segment.startWordIndex !== exerciseSegments[index - 1].endWordIndex + 1
    ))) {
      listeningMappingGaps.push(`${exerciseId}: ${difficultyKey || "default"} omits body words between listening units`);
    }
  });
});
assert.deepEqual(
  listeningMappingGaps,
  [],
  `every writing difficulty should map its blanks to timed listening sentences: ${listeningMappingGaps.join("; ")}`
);
assert.ok(checkedListeningConfigurations >= 900, "the listening audit should cover every normal and exceptional difficulty");

const dashboardStudent = "Writing Dashboard Student";
const dashboardNow = new Date(2026, 6, 26, 12, 0, 0).getTime();
const dashboardDayOne = new Date(2026, 6, 20, 9, 30, 0).getTime();
const dashboardDayTwo = new Date(2026, 6, 25, 18, 0, 0).getTime();
const dashboardOldDay = new Date(2026, 5, 1, 8, 0, 0).getTime();
const dashboardPriorYearDay = new Date(2025, 6, 27, 8, 0, 0).getTime();
const dashboardVeryOldDay = new Date(2024, 0, 5, 8, 0, 0).getTime();
hooks.setProgressResults(dashboardStudent, [
  { id: "dash-1", exerciseId: fixtureExercise().id, exerciseTitle: "Dashboard A", studentName: dashboardStudent, total: 7, correct: 6, round: 1, durationMs: 120_000, createdAt: dashboardDayOne },
  { id: "dash-2", exerciseId: fixtureExercise().id, exerciseTitle: "Dashboard B", studentName: dashboardStudent, total: 5, correct: 4, round: 2, durationMs: 180_000, createdAt: dashboardDayOne + 60_000 },
  { id: "dash-3", exerciseId: fixtureExercise().id, exerciseTitle: "Dashboard C", studentName: dashboardStudent, total: 3, correct: 3, round: 1, durationMs: 60_000, createdAt: dashboardDayTwo },
  { id: "dash-old", exerciseId: fixtureExercise().id, exerciseTitle: "Dashboard Old", studentName: dashboardStudent, total: 9, correct: 7, round: 1, durationMs: 300_000, createdAt: dashboardOldDay },
  { id: "dash-prior-year", exerciseId: fixtureExercise().id, exerciseTitle: "Dashboard Prior Year", studentName: dashboardStudent, total: 4, correct: 3, round: 1, durationMs: 600_000, createdAt: dashboardPriorYearDay },
  { id: "dash-very-old", exerciseId: fixtureExercise().id, exerciseTitle: "Dashboard Very Old", studentName: dashboardStudent, total: 6, correct: 4, round: 1, durationMs: 90_000, createdAt: dashboardVeryOldDay },
  { id: "dash-other", exerciseId: fixtureExercise().id, exerciseTitle: "Other Student", studentName: "Another Student", total: 99, correct: 99, round: 1, createdAt: dashboardDayTwo }
]);
const weekSeries = hooks.progressSeries("week", dashboardNow);
assert.equal(weekSeries.points.length, 7, "Writing dashboard week range should contain seven local calendar days");
assert.equal(weekSeries.totalQuestions, 15, "Writing dashboard should total every attempted question in the selected range");
assert.equal(weekSeries.attemptCount, 3, "Writing dashboard should count attempts separately from questions");
const dashboardFirstPoint = weekSeries.points.find(point => point.key === hooks.progressDayKey(dashboardDayOne));
assert.equal(dashboardFirstPoint?.questions, 12, "Writing dashboard should combine same-day question totals");
assert.equal(dashboardFirstPoint?.attempts, 2, "Writing dashboard should combine same-day attempts");
assert.equal(weekSeries.cumulativeBeforeStart, 19, "Cumulative Writing progress should carry totals from before the selected range");
assert.equal(dashboardFirstPoint?.cumulative, 31, "The cumulative point should add the selected day's questions to earlier history");
const monthSeries = hooks.progressSeries("month", dashboardNow);
assert.equal(monthSeries.points.length, 30, "Writing dashboard month range should contain 30 local calendar days");
assert.equal(monthSeries.totalQuestions, 15, "Month range should exclude older records");
const halfYearSeries = hooks.progressSeries("half-year", dashboardNow);
assert.equal(halfYearSeries.points.length, 182, "Half Year should match the Flashcard dashboard's 182-day range");
assert.equal(halfYearSeries.totalQuestions, 24, "Half Year should include records within its boundary");
const ytdSeries = hooks.progressSeries("ytd", dashboardNow);
assert.equal(ytdSeries.points.length, 207, "Year to Date should start on January 1");
assert.equal(ytdSeries.totalQuestions, 24, "Year to Date should exclude the prior calendar year");
const yearSeries = hooks.progressSeries("year", dashboardNow);
assert.equal(yearSeries.points.length, 365, "1 Year should contain 365 inclusive local days");
assert.equal(yearSeries.totalQuestions, 28, "1 Year should include its first-day boundary");
const allSeries = hooks.progressSeries("all", dashboardNow);
assert.equal(allSeries.totalQuestions, 34, "All Time should include the student's complete older history");
assert.equal(allSeries.attemptCount, 6, "All Time should exclude another student's records");
assert.equal(hooks.cumulativeProgressVisible(), false, "The cumulative Writing line should be off on first release");
assert.doesNotMatch(hooks.progressChart(weekSeries), /stroke="#7e22ce"/, "The purple cumulative line should stay hidden while off");
hooks.setCumulativeProgress(true);
assert.equal(hooks.cumulativeProgressVisible(), true, "Students should be able to show the cumulative Writing line");
assert.match(hooks.progressChart(weekSeries), /stroke="#7e22ce"/, "The enabled cumulative Writing line should be purple");
assert.equal(hooks.localAccountState().progressPreferences.showCumulative, true, "The cumulative preference should persist per Writing account");

const weekTimeSeries = hooks.timeSeries("week", dashboardNow);
assert.equal(weekTimeSeries.points.length, 7, "Writing time week range should contain seven local calendar days");
assert.equal(weekTimeSeries.stats.selectedMs, 360_000, "Writing time should total only timed attempts in the selected range");
assert.equal(weekTimeSeries.stats.totalMs, 1_350_000, "Writing time should retain an all-time total across ranges");
assert.equal(weekTimeSeries.stats.averageMs, 225_000, "Writing time should calculate the average submitted-round duration");
assert.equal(weekTimeSeries.stats.medianMs, 150_000, "Writing time should calculate a duration median");
assert.equal(weekTimeSeries.stats.longestMs, 600_000, "Writing time should identify the longest submitted round");
assert.equal(
  weekTimeSeries.points.find(point => point.key === hooks.progressDayKey(dashboardDayOne))?.totalMs,
  300_000,
  "Writing time should combine same-day round durations"
);
assert.match(hooks.timeChart(weekTimeSeries), /stroke="#f97316"/, "Writing time should render with the Flashcard-style orange line");
assert.match(hooks.timeChart(weekTimeSeries), /data-writing-time-day="2026-07-20"/, "A timed chart point should expose a clickable day drilldown");
assert.equal(hooks.formatDuration(3_723_000), "1:02:03", "Writing durations should format hours, minutes, and seconds");
assert.equal(hooks.elapsedDuration(1_000, 91_000), 90_000, "A submitted round should use its own elapsed duration");
assert.equal(hooks.elapsedDuration(1_000, 100_000_000), 86_400_000, "A stale open page should cap a single round at 24 hours");
await hooks.loadStudentState();
assert.equal(hooks.cumulativeProgressVisible(), true, "The cumulative preference should survive a Writing account reload");
const progressKeyHandler = harness.documentListeners.get("keydown")?.[0];
let progressKeyPrevented = false;
progressKeyHandler?.({
  target: clickTarget("data-writing-progress-day", hooks.progressDayKey(dashboardDayOne)),
  key: "Enter",
  code: "Enter",
  repeat: false,
  preventDefault() { progressKeyPrevented = true; }
});
assert.equal(progressKeyPrevented, true, "Keyboard activation should prevent the default action for a chart day");
assert.equal(hooks.selectedProgressDay(), hooks.progressDayKey(dashboardDayOne), "Enter should open the selected chart day's drilldown");
let timeKeyPrevented = false;
progressKeyHandler?.({
  target: clickTarget("data-writing-time-day", hooks.progressDayKey(dashboardDayOne)),
  key: " ",
  code: "Space",
  repeat: false,
  preventDefault() { timeKeyPrevented = true; }
});
assert.equal(timeKeyPrevented, true, "Keyboard activation should prevent scrolling for a Writing time point");
assert.equal(hooks.selectedTimeDay(), hooks.progressDayKey(dashboardDayOne), "Space should open the selected Writing time day's drilldown");
assert.match(html, /data-writing-progress-chart/, "Writing dashboard should render a progress chart");
assert.match(html, /data-toggle-writing-cumulative/, "Writing progress should expose its persisted cumulative toggle");
assert.match(html, /data-writing-time-chart/, "Writing dashboard should render a second duration chart");
assert.match(html, /durationMs:\s*writingPracticeElapsedDuration/, "Submitted Writing rounds should save their measured duration");
assert.match(html, /data-toggle-writing-attempt-log/, "Writing dashboard should expose a collapsible all-attempt log");
assert.match(html, /data-load-more-writing-attempts/, "The all-attempt log should render in bounded pages");
assert.match(html, /writing_student_append_attempt/, "Writing attempts should append through the dedicated student RPC");
assert.match(html, /writing_student_list_attempts/, "Writing history should load through a paginated dedicated RPC");
assert.match(html, /writing_student_delete_attempts_by_exercise/, "Exercise resets should delete dedicated attempt rows");
assert.match(html, /p_reset_at:\s*resetAtIso/, "Exercise reset RPC calls should carry the client action time");
assert.match(writingAttemptsSql, /state\.key\s*=\s*'writing-attempts-v1'/, "The dedicated attempt migration should import the legacy Supabase state key");
assert.match(writingAttemptsSql, /writing_student_append_attempt\([\s\S]*?returns text/i, "The student append RPC should report inserted, existing, or ignored_reset");
assert.match(html, /writeStatus\s*===\s*"ignored_reset"/, "The client should remove an attempt from memory when a reset barrier intentionally rejects it");
assert.match(writingAttemptsSql, /attempt_row\.created_at\s*<=\s*p_reset_at/, "Exercise resets should only delete attempts at or before the client reset time");
assert.doesNotMatch(writingAttemptsSql, /v_existing\.attempt\s*<>\s*p_attempt/, "A compact client retry should not conflict with the richer JSON imported from legacy state");
assert.match(writingAttemptsSql, /v_existing\.total_count\s*<>\s*v_total/, "Idempotent retries should still reject a core score mismatch for the same attempt ID");

const migrationStudent = { id: "11111111-1111-4111-8111-111111111111", name: "Migration Student" };
const migrationAttempt = {
  exerciseId: fixtureExercise().id,
  exerciseTitle: "Migrated attempt",
  studentName: migrationStudent.name,
  total: 4,
  correct: 3,
  mistakes: 1,
  round: 1,
  createdAt: dashboardDayOne
};
hooks.setRawWritingState({
  version: 2,
  accounts: {
    "name:migration student": {
      bookmarks: [fixtureExercise().id],
      paragraphMastery: {},
      practiceResults: [migrationAttempt],
      pendingAttempts: true
    }
  }
});
hooks.setCurrentStudent(migrationStudent);
assert.equal(hooks.migrateNameAccount(), true, "A name-scoped account should migrate to its stable Supabase ID key");
const migratedRoot = hooks.rawWritingState();
assert.ok(migratedRoot.accounts[`id:${migrationStudent.id}`], "The ID-scoped Writing state should be created");
assert.equal(migratedRoot.accounts["name:migration student"], undefined, "The superseded name-scoped state should be removed after a successful migration");
await hooks.loadStudentState();
assert.equal(hooks.localAccountState().attemptStoreMigrated, true, "Legacy cached attempts should be marked for one-time dedicated-table migration");
assert.equal(hooks.attemptOutbox().length, 1, "The migrated attempt should remain in the durable append outbox while offline");

const oversizedCache = Array.from({ length: 260 }, (_, index) => ({
  ...migrationAttempt,
  id: `bounded-${index}`,
  createdAt: dashboardDayOne + index
}));
assert.equal(hooks.boundedAttemptCache(oversizedCache).length, 200, "The account-local attempt fallback should remain bounded");
const resetBoundary = dashboardDayTwo;
const resetRequests = hooks.normalizeDeleteRequests([{ exerciseId: fixtureExercise().id, resetAt: resetBoundary }]);
assert.equal(
  hooks.attemptCoveredByDelete({ exerciseId: fixtureExercise().id, createdAt: resetBoundary - 1 }, resetRequests),
  true,
  "A pre-reset offline attempt should remain hidden while its reset is pending"
);
assert.equal(
  hooks.attemptCoveredByDelete({ exerciseId: fixtureExercise().id, createdAt: resetBoundary + 1 }, resetRequests),
  false,
  "A post-reset offline attempt should survive even if the reset RPC reaches Supabase later"
);

harness.setLocalStorageWriteFailure(true);
const originalConsoleWarn = console.warn;
console.warn = () => {};
let quotaSaveResult;
try {
  assert.doesNotThrow(() => {
    quotaSaveResult = hooks.saveAttempt({
      ...migrationAttempt,
      id: "quota-safe-attempt",
      createdAt: dashboardDayTwo
    });
  }, "A localStorage quota failure must be handled without an uncaught exception");
} finally {
  console.warn = originalConsoleWarn;
}
harness.setLocalStorageWriteFailure(false);
assert.equal(quotaSaveResult, false, "An attempt should not claim to be saved when its durable device fallback failed");
assert.equal(
  hooks.progressResults().some(result => result.id === "quota-safe-attempt"),
  false,
  "A quota failure should roll back the cache rather than create an unsyncable cache-only result"
);

const fullAttemptOutbox = Array.from({ length: hooks.attemptOutboxCapacity() }, (_, index) => ({
  ...migrationAttempt,
  id: `outbox-full-${index}`,
  createdAt: dashboardDayOne + index
}));
hooks.setAttemptOutbox(fullAttemptOutbox);
assert.equal(hooks.saveAttempt({
  ...migrationAttempt,
  id: "must-not-be-cache-only",
  createdAt: dashboardDayTwo + 1
}), false, "A full durable outbox should explicitly refuse a new saved result");
assert.equal(
  hooks.progressResults().some(result => result.id === "must-not-be-cache-only"),
  false,
  "A refused attempt must not enter the cache with no durable retry path"
);
assert.equal(hooks.attemptOutbox().length, hooks.attemptOutboxCapacity(), "The bounded outbox must not silently evict an older unsynced attempt");

hooks.setDashboardUiState("all", "2026-07-20", true, 100);
hooks.resetPersonalState();
const resetDashboardState = hooks.dashboardUiState();
assert.equal(resetDashboardState.range, "month", "Switching accounts should restore the default progress range");
assert.equal(resetDashboardState.day, "", "Switching accounts should close the prior account's day drilldown");
assert.equal(resetDashboardState.open, false, "Switching accounts should collapse the prior account's all-attempt log");
assert.equal(resetDashboardState.visibleCount, 25, "Switching accounts should reset attempt-log pagination");

console.log(`Writing tests passed: safe translation, protected audio tails, speed control, continuation, ${checkedListeningConfigurations} corpus configurations, progress dashboard and attempt log.`);
