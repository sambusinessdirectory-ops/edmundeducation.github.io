import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const repository = process.env.SPEAKING_REPO_PATH || fileURLToPath(new URL("../", import.meta.url));
const context = { window: {}, crypto: webcrypto, Uint32Array, Uint8Array, Math };
vm.createContext(context);

for (const filename of [
  "speaking-system-part1-data.js",
  "speaking-system-data.js",
  "speaking-system-part3-data.js"
]) {
  vm.runInContext(readFileSync(`${repository}/${filename}`, "utf8"), context, { filename });
}
vm.runInContext(readFileSync(`${repository}/speaking-exam-mode.js`, "utf8"), context, {
  filename: "speaking-exam-mode.js"
});

const exam = context.window.EDMUND_SPEAKING_EXAM;
assert.ok(exam, "exam helper should load");
assert.equal(exam.modes.length, 7);

const part1 = context.window.EDMUND_SPEAKING_PART1_DATA.books.flatMap(book => (
  book.exercises.map(exercise => ({ ...exercise, book: book.book }))
));
const part2 = context.window.EDMUND_SPEAKING_DATA.books.flatMap(book => (
  book.exercises.map(exercise => ({ ...exercise, book: book.book }))
));
const part3 = context.window.EDMUND_SPEAKING_PART3_DATA.books.flatMap(book => (
  book.exercises.map(exercise => ({ ...exercise, book: book.book }))
));
const pools = { 1: part1, 2: part2, 3: part3 };
const expectedCounts = { full: 19, p1: 12, p2: 1, p3: 6, "p1-p2": 13, "p1-p3": 18, "p2-p3": 7 };
const expectedPartOrders = {
  full: [...Array(12).fill(1), 2, ...Array(6).fill(3)],
  p1: Array(12).fill(1),
  p2: [2],
  p3: Array(6).fill(3),
  "p1-p2": [...Array(12).fill(1), 2],
  "p1-p3": [...Array(12).fill(1), ...Array(6).fill(3)],
  "p2-p3": [2, ...Array(6).fill(3)]
};

for (const mode of exam.modes) {
  assert.equal(exam.expectedRecordingCount(mode.id), expectedCounts[mode.id]);
  assert.equal(exam.modeIsFeasible(mode.id, pools), true, `${mode.id} should be feasible`);
  const items = exam.buildExamItems(mode.id, pools, { randomIndex: length => length - 1 });
  assert.equal(items.length, expectedCounts[mode.id], `${mode.id} item count`);
  assert.deepEqual([...new Set(Array.from(items, item => item.part))], Array.from(mode.parts), `${mode.id} part order`);
  assert.deepEqual(Array.from(items, item => item.part), expectedPartOrders[mode.id], `${mode.id} exact part boundaries`);
  assert.deepEqual(Array.from(items, item => item.globalOrder), Array.from({ length: items.length }, (_, index) => index + 1));
  expectedPartOrders[mode.id].forEach((part, index) => {
    assert.equal(exam.expectedPartForOrder(mode.id, index + 1), part, `${mode.id} order ${index + 1} part`);
  });
  assert.equal(exam.expectedPartForOrder(mode.id, items.length + 1), null, `${mode.id} rejects an order after its final question`);
  assert.equal(new Set(items.map(item => item.sourceKey)).size, items.length, `${mode.id} source identities`);
  assert.equal(new Set(items.map(item => item.contentKey)).size, items.length, `${mode.id} content identities`);
}

for (const mode of exam.modes) {
  const items = exam.buildExamItems(mode.id, pools, { randomIndex: () => 0 });
  const partOrder = expectedPartOrders[mode.id];
  const skippedOrders = new Set([1, items.length]);
  for (let index = 0; index < partOrder.length - 1; index += 1) {
    if (partOrder[index] !== partOrder[index + 1]) {
      skippedOrders.add(index + 1);
      skippedOrders.add(index + 2);
    }
  }
  const outcomeManifest = items.map(item => ({
    ...item,
    skipped: skippedOrders.has(item.globalOrder)
  }));
  assert.equal(outcomeManifest.length, items.length, `${mode.id} skips must not remove review questions`);
  assert.deepEqual(
    outcomeManifest.map(item => item.globalOrder),
    items.map(item => item.globalOrder),
    `${mode.id} skips must not renumber the manifest`
  );
  outcomeManifest.filter(item => item.skipped).forEach(item => {
    assert.ok(item.title && item.sourceId && item.sourceKey && item.contentKey, `${mode.id} skipped Q${item.globalOrder} remains reviewable`);
  });

  const nextAttempt = exam.buildExamItems(mode.id, pools, {
    randomIndex: () => 0,
    excludedSourceKeys: outcomeManifest.map(item => item.sourceKey),
    excludedContentKeys: outcomeManifest.map(item => item.contentKey)
  });
  assert.equal(
    nextAttempt.some(item => outcomeManifest.some(previous => (
      previous.sourceKey === item.sourceKey || previous.contentKey === item.contentKey
    ))),
    false,
    `${mode.id} cooldown includes questions marked skipped`
  );
}

const part1Items = exam.buildExamItems("p1", pools, { randomIndex: () => 0 });
assert.equal(new Set(part1Items.map(item => item.sourceId)).size, 4, "Part 1 must use four distinct themes");
assert.equal(new Set(part1Items.map(item => item.title.toLocaleLowerCase("en"))).size, 12, "Part 1 questions must not repeat");
for (let slot = 1; slot <= 4; slot += 1) {
  const items = part1Items.filter(item => item.themeSlot === slot);
  assert.equal(items.length, 3);
  assert.deepEqual(Array.from(items, item => item.questionInTheme), [slot * 3 - 2, slot * 3 - 1, slot * 3]);
}

const part3Items = exam.buildExamItems("p3", pools, { randomIndex: () => 0 });
assert.equal(new Set(part3Items.map(item => item.sourceId)).size, 6, "Part 3 must draw six unique records");
assert.equal(new Set(part3Items.map(item => item.contentKey)).size, 6, "Part 3 must not draw duplicate wording");

const cooldownAttemptA = exam.buildExamItems("p1", pools, { randomIndex: () => 0 });
const cooldownAttemptB = exam.buildExamItems("p1", pools, {
  randomIndex: () => 0,
  excludedSourceKeys: cooldownAttemptA.map(item => item.sourceKey),
  excludedContentKeys: cooldownAttemptA.map(item => item.contentKey)
});
assert.equal(
  cooldownAttemptB.some(item => cooldownAttemptA.some(previous => previous.sourceKey === item.sourceKey || previous.contentKey === item.contentKey)),
  false,
  "the immediately previous attempt must be fully excluded"
);
const cooldownAttemptC = exam.buildExamItems("p1", pools, {
  randomIndex: () => 0,
  excludedSourceKeys: cooldownAttemptB.map(item => item.sourceKey),
  excludedContentKeys: cooldownAttemptB.map(item => item.contentKey)
});
assert.equal(
  cooldownAttemptC.some(item => cooldownAttemptA.some(previous => previous.sourceKey === item.sourceKey)),
  true,
  "questions from attempt X may return in X+2 once only X+1 is frozen"
);

const blockedPart2 = exam.buildExamItems("p2", pools, { randomIndex: () => 0 });
assert.equal(exam.modeIsFeasible("p2", pools, {
  excludedSourceKeys: part2.map(item => `p2:${item.id}`),
  excludedContentKeys: part2.map(item => exam.normalizeContentKey(item.cueCard?.promptEn || item.title || ""))
}), false, "cooldown-aware feasibility must not silently reuse a blocked Part 2 card");

const fixedAttempt = "d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a";
const recordingId = exam.recordingExerciseId("p1-p3", fixedAttempt, 3, 18);
assert.equal(recordingId, `exam:p1-p3:${fixedAttempt}:p3:q18`);
assert.deepEqual(
  { ...exam.parseRecordingExerciseId(recordingId) },
  { modeId: "p1-p3", attemptId: fixedAttempt, part: 3, globalOrder: 18 }
);
assert.equal(exam.parseRecordingExerciseId("exam:unknown:not-valid"), null);
assert.equal(exam.parseRecordingExerciseId(`exam:full:${fixedAttempt}:p3:q01`), null, "Part must match the mode's slot order");
assert.equal(exam.parseRecordingExerciseId(`exam:p1:${fixedAttempt}:p1:q13`), null, "Order must stay within the mode");
assert.equal(exam.parseRecordingExerciseId(`exam:p2:${fixedAttempt}:p2:q00`), null, "Order zero is invalid");
assert.throws(() => exam.recordingExerciseId("full", fixedAttempt, 3, 1), /Invalid exam recording identifier/);
const introRecordingId = exam.recordingIntroId("p2-p3", fixedAttempt, 2);
assert.equal(introRecordingId, `exam:p2-p3:${fixedAttempt}:p2:intro`);
assert.deepEqual(
  { ...exam.parseRecordingExerciseId(introRecordingId) },
  { modeId: "p2-p3", attemptId: fixedAttempt, part: 2, globalOrder: 0, intro: true }
);
assert.equal(exam.expectedStoredRecordingCount("full", true), 20);
assert.throws(() => exam.recordingIntroId("p2-p3", fixedAttempt, 3), /Invalid exam introduction/);

const great = "Great. Really nice.";
const part1To2 = "Perfect. All right, that will do for Part 1. We'll go on to Part 2 now.";
const part1To3 = "Perfect. All right, that will do for Part 1. We'll go on to Part 3 now.";
const part2To3 = "Perfect. All right, that will do for Part 2. We'll go on to Part 3 now.";
const introducePart3 = "Okay, so now we'll go on to Part 3 of the test. Okay? Okay. So, the first question.";
const transitionMatrix = {
  full: [[1, 2, [part1To2]], [2, 3, [great, introducePart3]], [3, null, []]],
  p1: [[1, null, []]],
  p2: [[2, null, [great]]],
  p3: [[3, null, []]],
  "p1-p2": [[1, 2, [part1To2]], [2, null, [great]]],
  "p1-p3": [[1, 3, [part1To3]], [3, null, []]],
  "p2-p3": [[2, 3, [great, part2To3, introducePart3]], [3, null, []]]
};
for (const [modeId, transitions] of Object.entries(transitionMatrix)) {
  transitions.forEach(([currentPart, nextPart, messages]) => {
    assert.deepEqual(
      Array.from(exam.naturalTransitionMessages(modeId, currentPart, nextPart)),
      messages,
      `${modeId} natural transition Part ${currentPart} to ${nextPart ?? "end"}`
    );
  });
}
assert.deepEqual(Array.from(exam.naturalTransitionMessages("full", 2, 3, { answered: false })), [introducePart3]);
assert.deepEqual(Array.from(exam.naturalTransitionMessages("p2-p3", 2, 3, { answered: false })), [part2To3, introducePart3]);
assert.deepEqual(Array.from(exam.naturalTransitionMessages("p2", 2, null, { answered: false })), []);

const impossiblePools = { 1: part1.filter(theme => theme.questions.length < 12).slice(0, 4), 2: part2, 3: part3 };
assert.equal(exam.modeIsFeasible("p1", impossiblePools), false, "Part 1 needs a theme with Q10-Q12");

function topLevelFunctionSource(source, name) {
  const match = new RegExp(`\\n  (?:async )?function ${name}\\(`).exec(source);
  assert.ok(match, `${name} should exist in speaking-system.js`);
  const start = match.index + 1;
  const remaining = source.slice(start + match[0].length - 1);
  const next = /\n  (?:async )?function [A-Za-z_$][\w$]*\(/.exec(remaining);
  return source.slice(start, next ? start + match[0].length - 1 + next.index : source.length);
}

function createOpeningFlowHarness(source) {
  const content = { innerHTML: "" };
  const scrollCalls = [];
  const documentListeners = new Map();
  const windowListeners = new Map();
  const document = {
    visibilityState: "visible",
    body: { classList: { add() {}, remove() {} } },
    querySelector(selector) {
      return selector === "[data-view-content]" ? content : null;
    },
    querySelectorAll() { return []; },
    createElement() {
      return {
        classList: { add() {}, remove() {}, toggle() {} },
        dataset: {},
        append() {},
        remove() {},
        setAttribute() {}
      };
    },
    addEventListener(type, listener) {
      const listeners = documentListeners.get(type) || [];
      listeners.push(listener);
      documentListeners.set(type, listeners);
    }
  };
  const localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  };
  const audioActions = [];
  let userGestureActive = false;
  class GestureAudioContext {
    constructor() {
      this.state = "suspended";
      this.sampleRate = 44100;
    }
    createBuffer() { return {}; }
    createBufferSource() {
      return {
        buffer: null,
        connect() {},
        start() {
          assert.equal(userGestureActive, true, "audio priming must run inside the exam-mode click gesture");
          audioActions.push("audio-prime");
        }
      };
    }
    resume() {
      assert.equal(userGestureActive, true, "AudioContext.resume must run inside the exam-mode click gesture");
      this.state = "running";
      audioActions.push("audio-resume");
      return Promise.resolve();
    }
  }
  let unexpectedNetworkCalls = 0;
  const unexpectedFetch = async () => {
    unexpectedNetworkCalls += 1;
    throw new Error("opening-flow harness attempted an unexpected network request");
  };
  const window = {
    EDMUND_SPEAKING_CONFIG: {},
    EDMUND_SUPABASE: {},
    EDMUND_SPEAKING_EXAM: exam,
    AudioContext: GestureAudioContext,
    document,
    localStorage,
    matchMedia: () => ({ matches: false }),
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) || [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    requestAnimationFrame: () => 0,
    cancelAnimationFrame() {},
    scrollTo(...args) { scrollCalls.push(args); },
    fetch: unexpectedFetch
  };
  const instrumented = source.replace(/\n  init\(\);\n\}\)\(\);\s*$/, `
  window.__EDMUND_SPEAKING_OPENING_TEST__ = {
    state,
    setupEvents: () => setupEvents(),
    runOpeningSequence: () => startExamOpeningSequence(),
    renderOpening: () => renderExamOpening(),
    renderPractice: () => renderExamPractice(),
    renderCompletion: () => renderExamCompletion(),
    renderPart1: item => renderExamPart1(item),
    renderPart2: item => renderExamPart2(item),
    renderPart3: item => renderExamPart3(item),
    renderProgress: item => renderExamProgress(item),
    renderReviewQuestion: item => renderExamReviewQuestion(item),
    renderSavedReflection: attempt => renderSavedExamReflection(attempt),
    renderExamRecordingBox: groups => renderExamRecordingBox(groups),
    normaliseExamAttempt: attempt => normaliseExamAttempt(attempt),
    advanceItem: () => advanceExamItem(),
    submitRating: () => submitExamRating(),
    startPart2Timer: item => startExamPart2Timer(item),
    clearExamTimer: () => clearExamPhaseTimer(),
    clearExamSession: () => clearExamSession(),
    skipIntroduction: () => skipExamIntroduction(),
    currentRecordingItem: () => currentExamRecordingItem(),
    replaceStartExamPractice: replacement => { startExamPractice = replacement; },
    replaceStartOpeningSequence: replacement => { startExamOpeningSequence = replacement; },
    replaceSpeakExamText: replacement => { speakExamText = replacement; },
    replaceWaitForExamDelay: replacement => { waitForExamDelay = replacement; },
    replaceRenderExamPractice: replacement => { renderExamPractice = replacement; },
    replaceApiJson: replacement => { apiJson = replacement; }
  };
})();`);
  assert.notEqual(instrumented, source, "speaking-system.js test hook injection should replace init()");
  const harnessContext = {
    window,
    document,
    localStorage,
    console,
    crypto: webcrypto,
    navigator: { mediaDevices: null },
    location: { hostname: "localhost" },
    URL,
    URLSearchParams,
    Headers,
    Request,
    Response,
    FormData,
    Blob,
    AbortController,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    Uint32Array,
    fetch: unexpectedFetch,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  };
  vm.createContext(harnessContext);
  vm.runInContext(instrumented, harnessContext, { filename: "speaking-system.js" });
  return {
    hooks: window.__EDMUND_SPEAKING_OPENING_TEST__,
    content,
    scrollCalls,
    audioActions,
    documentListeners,
    setUserGesture(active) { userGestureActive = Boolean(active); },
    unexpectedNetworkCalls: () => unexpectedNetworkCalls
  };
}

const speakingSystemSource = readFileSync(`${repository}/speaking-system.js`, "utf8");
const openingSource = topLevelFunctionSource(speakingSystemSource, "renderExamOpening");
const openingSequenceSource = topLevelFunctionSource(speakingSystemSource, "startExamOpeningSequence");
const introSkipControlSource = topLevelFunctionSource(speakingSystemSource, "examIntroductionSkipHtml");
const speakExamTextSource = topLevelFunctionSource(speakingSystemSource, "speakExamText");
const speakQuestionSource = topLevelFunctionSource(speakingSystemSource, "speakCurrentExamQuestion");
const skipIntroductionSource = topLevelFunctionSource(speakingSystemSource, "skipExamIntroduction");
const setupEventsSource = topLevelFunctionSource(speakingSystemSource, "setupEvents");

assert.match(openingSource, /examIntroductionSkipHtml\(\)/, "the opening panel must render the dedicated introduction skip control");
assert.match(introSkipControlSource, /data-exam-skip-intro/, "the dedicated introduction skip control needs a stable DOM hook");
assert.doesNotMatch(introSkipControlSource, /data-stop-exam-voice|略過語音/, "the starter skip helper must not recreate the removed voice-skip control");
assert.match(speakingSystemSource, /data-exam-skip-intro/, "the introduction skip control needs a stable DOM hook");
assert.match(setupEventsSource, /data-exam-skip-intro[\s\S]*?skipExamIntroduction\(\)/, "the introduction skip control must call skipExamIntroduction");
assert.match(skipIntroductionSource, /\["opening", "intro-answer"\]\.includes\(session\.phase\)/, "introduction skip must work while either opening message is active");
assert.match(skipIntroductionSource, /introduction\/skip/, "introduction skip must persist its non-recording outcome");
assert.doesNotMatch(skipIntroductionSource, /recordingIntroId|startRecording|saveRecording|FormData|method:\s*["']POST["']/, "introduction skip must never create or upload a recording");
assert.match(openingSequenceSource, /await speakExamText\("Okay, let's begin\."\)/, "opening voice must start with the examiner greeting");
assert.match(openingSequenceSource, /await speakExamText\("Could you tell me your full name please\?"\)/, "opening voice must ask the name starter once");
assert.match(speakQuestionSource, /risingInflection:\s*true/, "live examiner questions must request a stronger rising inflection");
assert.match(speakExamTextSource, /playbackRate\.linearRampToValueAtTime/, "examiner playback must shape the final syllables with a controlled pitch rise");
const unlockIndex = setupEventsSource.indexOf("unlockExamAudio();");
const startIndex = setupEventsSource.indexOf("startExamPractice(examMode.dataset.examMode);");
assert.ok(unlockIndex >= 0 && startIndex > unlockIndex, "the click gesture must unlock examiner audio before asynchronous exam creation starts");

const openingHarness = createOpeningFlowHarness(speakingSystemSource);
const openingHooks = openingHarness.hooks;
assert.ok(openingHooks, "opening-flow test hooks should load");
openingHooks.state.user = { id: fixedAttempt, role: "student", name: "Test Student" };
openingHooks.state.access = {};
openingHooks.setupEvents();
const clickHandler = openingHarness.documentListeners.get("click")?.[0];
assert.equal(typeof clickHandler, "function", "exam-mode click handler should be registered");
const clickActions = [];
openingHooks.replaceStartExamPractice(modeId => {
  clickActions.push(`start:${modeId}`);
  openingHarness.audioActions.push("exam-start");
});
const examModeNode = {
  dataset: { examMode: "p1" },
  getAttribute() { return null; }
};
const clickTarget = {
  closest(selector) { return selector === "[data-exam-mode]" ? examModeNode : null; }
};
openingHarness.setUserGesture(true);
try {
  clickHandler({ target: clickTarget, preventDefault() {} });
} finally {
  openingHarness.setUserGesture(false);
}
assert.deepEqual(openingHarness.audioActions, ["audio-prime", "audio-resume", "exam-start"], "the user gesture must prime and resume audio before exam startup");
assert.deepEqual(clickActions, ["start:p1"]);
assert.equal(openingHooks.state.examAudioContext?.state, "running", "the unlocked audio context must remain ready for the delayed opening voice");

const firstRealQuestion = { kind: "question", part: 1, globalOrder: 1, title: "First real question" };
const openingIntro = { kind: "intro", part: 1, globalOrder: 0, title: "Could you tell me your full name please?", saved: false };
openingHooks.state.route = { view: "exam-practice", exam: "ielts", modeId: "p1" };
openingHooks.state.examFlowGeneration = 10;
openingHooks.state.examSession = {
  id: fixedAttempt,
  modeId: "p1",
  mode: exam.modeForId("p1"),
  phase: "opening",
  openingStarted: false,
  naturalExchange: true,
  introItem: openingIntro,
  items: [firstRealQuestion],
  currentIndex: 0
};
const spokenOpeningMessages = [];
const openingDelays = [];
openingHooks.replaceSpeakExamText(async message => {
  assert.equal(openingHooks.state.examAudioContext?.state, "running", "opening speech must use the context unlocked by the earlier user gesture");
  spokenOpeningMessages.push(message);
  return true;
});
openingHooks.replaceWaitForExamDelay(async milliseconds => {
  openingDelays.push(milliseconds);
  return true;
});
await openingHooks.runOpeningSequence();
assert.deepEqual(spokenOpeningMessages, ["Okay, let's begin.", "Could you tell me your full name please?"]);
assert.deepEqual(openingDelays, [2000]);
assert.equal(openingHooks.state.examSession.phase, "intro-answer");

openingHooks.replaceStartOpeningSequence(() => {});
for (const phase of ["opening", "intro-answer"]) {
  openingHooks.state.examSession.phase = phase;
  openingHarness.content.innerHTML = "";
  openingHooks.renderOpening();
  const skipButton = openingHarness.content.innerHTML.match(/<button[^>]*data-exam-skip-intro[^>]*>/)?.[0] || "";
  assert.ok(skipButton, `the name starter skip button must render during ${phase}`);
  assert.doesNotMatch(skipButton, /\bhidden\b|\bdisabled\b/, `the idle name starter skip button must be usable during ${phase}`);
  assert.ok(
    openingHarness.content.innerHTML.indexOf(skipButton) < openingHarness.content.innerHTML.indexOf('class="exam-intro-answer"'),
    "the starter skip belongs in the examiner opening panel"
  );
}

const introSkipApiCalls = [];
openingHooks.replaceApiJson(async (path, options = {}) => {
  introSkipApiCalls.push({ path: String(path), method: String(options.method || "GET") });
  return { attempt: { introSkipped: true } };
});
let skippedRenderCount = 0;
openingHooks.replaceRenderExamPractice(() => { skippedRenderCount += 1; });
for (const phase of ["opening", "intro-answer"]) {
  const intro = { kind: "intro", part: 1, globalOrder: 0, title: "Could you tell me your full name please?", saved: false };
  const realQuestion = { kind: "question", part: 1, globalOrder: 1, title: "First real question" };
  const messageFinishes = [];
  const speechFinishes = [];
  let audioAbortCount = 0;
  const callsBefore = introSkipApiCalls.length;
  const rendersBefore = skippedRenderCount;
  openingHooks.state.route = { view: "exam-practice", exam: "ielts", modeId: "p1" };
  openingHooks.state.examSession = {
    id: fixedAttempt,
    modeId: "p1",
    phase,
    openingStarted: true,
    naturalExchange: true,
    introItem: intro,
    items: [realQuestion],
    currentIndex: 0
  };
  openingHooks.state.examSkipSaving = false;
  openingHooks.state.examSaving = false;
  openingHooks.state.recordingPermissionPending = false;
  openingHooks.state.recordingProcessing = false;
  openingHooks.state.recordingTransition = "";
  openingHooks.state.mediaRecorder = null;
  openingHooks.state.recordedMp3 = null;
  openingHooks.state.recordedMp3Url = "";
  openingHooks.state.recordingSaved = false;
  openingHooks.state.recordingContextKey = "";
  openingHooks.state.examPhaseTimer = 41;
  openingHooks.state.examMessageTimer = 42;
  openingHooks.state.examMessageFinish = value => messageFinishes.push(value);
  openingHooks.state.examSpeechTimeout = 43;
  openingHooks.state.examSpeechFinish = value => speechFinishes.push(value);
  openingHooks.state.examAudioAbortController = { abort() { audioAbortCount += 1; } };
  openingHooks.state.examAudioSource = null;

  await openingHooks.skipIntroduction();

  assert.equal(introSkipApiCalls.length, callsBefore + 1, `${phase} skip should make one metadata-only request`);
  assert.deepEqual(introSkipApiCalls.at(-1), {
    path: `/v1/exam-attempts/${fixedAttempt}/introduction/skip`,
    method: "PUT"
  });
  assert.equal(introSkipApiCalls.at(-1).path.includes("/recordings"), false, "starter skip must not call the recording service");
  assert.equal(intro.skipped, true, `${phase} starter should be marked skipped locally`);
  assert.equal(intro.saved, false, `${phase} starter skip must not masquerade as a saved recording`);
  assert.equal("recordingId" in intro, false, `${phase} starter skip must not create a recording id`);
  assert.equal(openingHooks.state.examSession.phase, "question", `${phase} skip should enter the real exam`);
  assert.equal(openingHooks.state.examSession.currentIndex, 0, `${phase} skip should start at the first real question`);
  assert.equal(openingHooks.currentRecordingItem(), realQuestion, `${phase} skip should make the first real question current`);
  assert.equal(skippedRenderCount, rendersBefore + 1, `${phase} skip should render the first real question once`);
  assert.equal(openingHooks.state.examPhaseTimer, 0, `${phase} skip should stop the active phase timer`);
  assert.equal(openingHooks.state.examMessageTimer, 0, `${phase} skip should stop the opening delay`);
  assert.deepEqual(messageFinishes, [false], `${phase} skip should settle the opening delay`);
  assert.equal(openingHooks.state.examSpeechTimeout, 0, `${phase} skip should stop the active speech timeout`);
  assert.deepEqual(speechFinishes, [false], `${phase} skip should settle active examiner speech`);
  assert.equal(audioAbortCount, 1, `${phase} skip should abort any examiner audio request`);
  assert.equal(openingHooks.state.examSkipSaving, false, `${phase} skip should release its busy state`);
  assert.equal(openingHooks.state.mediaRecorder, null, `${phase} skip should not start a recorder`);
  assert.equal(openingHooks.state.recordedMp3, null, `${phase} skip should not create audio data`);
  assert.equal(openingHooks.state.recordingContextKey, "", `${phase} skip should not reserve an intro recording context`);
}
assert.equal(openingHarness.unexpectedNetworkCalls(), 0, "opening-flow tests must not fall through to real network access");

const speakingSystemHtmlSource = readFileSync(`${repository}/speaking-system.html`, "utf8");
const examAudioManifestSource = readFileSync(`${repository}/speaking-exam-audio-manifest.js`, "utf8");
const productionExamUiSource = `${speakingSystemSource}\n${speakingSystemHtmlSource}`;
for (const removedCopy of [
  "略過語音",
  "考官已讀完題目，請按「開始回答」。",
  "考官正在讀出題目…",
  "按「開始回答」錄音，完成後按「完成回答」。"
]) {
  assert.equal(productionExamUiSource.includes(removedCopy), false, `removed exam copy must stay absent: ${removedCopy}`);
}
assert.equal(productionExamUiSource.includes("data-stop-exam-voice"), false, "the duplicate voice-skip control must be removed from every exam view");
assert.equal(productionExamUiSource.includes("data-exam-skip-intro"), true, "the distinct name-starter skip control must remain available");
for (const repairedOkayKey of [
  "fixed:opening-begin-v2",
  "fixed:part2-instructions-v2",
  "fixed:part2-ready-v2",
  "fixed:part3-opening-v2"
]) {
  assert.equal(examAudioManifestSource.includes(`\"${repairedOkayKey}\"`), true, `${repairedOkayKey} must have a generated neural-audio asset`);
  assert.equal(speakingSystemSource.includes(`\"${repairedOkayKey}\"`), true, `${repairedOkayKey} must be selected by the live examiner flow`);
}

const noScrollHarness = createOpeningFlowHarness(speakingSystemSource);
const noScrollHooks = noScrollHarness.hooks;
const answeredQuestion = { kind: "question", part: 1, globalOrder: 1, title: "Answered", saved: true };
const followingQuestion = { kind: "question", part: 1, globalOrder: 2, title: "Following", saved: false };
let nextQuestionRenderCount = 0;
noScrollHooks.state.user = { id: fixedAttempt, role: "student", name: "Test Student" };
noScrollHooks.state.route = { view: "exam-practice", exam: "ielts", modeId: "p1" };
noScrollHooks.state.examSession = {
  id: fixedAttempt,
  modeId: "p1",
  phase: "question",
  naturalExchange: false,
  items: [answeredQuestion, followingQuestion],
  currentIndex: 0
};
noScrollHooks.replaceRenderExamPractice(() => { nextQuestionRenderCount += 1; });
noScrollHooks.advanceItem();
assert.equal(noScrollHooks.state.examSession.currentIndex, 1, "next question should still advance normally");
assert.equal(noScrollHooks.state.examSession.phase, "question");
assert.equal(nextQuestionRenderCount, 1, "next question should render exactly once");
assert.equal(noScrollHarness.scrollCalls.length, 0, "advancing to the next question must not force the page back to the top");

function part2TestItem() {
  return {
    kind: "question",
    part: 2,
    globalOrder: 1,
    sourceBook: 7,
    sourceIndex: 4,
    sourceId: "part2-source-record",
    sourceKey: "p2:part2-source-record",
    contentKey: "silent-part-2-cue",
    cueTitle: "A useful object",
    cueTitleZh: "一件有用的物件",
    title: "Describe a useful object you own.",
    titleZh: "描述一件你擁有的有用物件。",
    hints: [{ en: "what it is", zh: "它是甚麼" }],
    ppf: null,
    saved: false,
    skipped: false,
    prepPhase: "waiting",
    questionSpeechStarted: false,
    questionSpeechDone: false
  };
}

async function waitForExamUi(predicate, message) {
  for (let turn = 0; turn < 20; turn += 1) {
    if (predicate()) return;
    await new Promise(resolve => setImmediate(resolve));
  }
  assert.ok(predicate(), message);
}

async function assertSilentPart2Start(naturalExchange) {
  const harness = createOpeningFlowHarness(speakingSystemSource);
  const hooks = harness.hooks;
  const item = part2TestItem();
  const spoken = [];
  hooks.state.user = { id: fixedAttempt, role: "student", name: "Test Student" };
  hooks.state.access = {};
  hooks.state.route = { view: "exam-practice", exam: "ielts", modeId: "p2" };
  hooks.state.examSession = {
    id: fixedAttempt,
    modeId: "p2",
    mode: exam.modeForId("p2"),
    phase: "question",
    naturalExchange,
    startedAt: new Date().toISOString(),
    items: [item],
    currentIndex: 0
  };
  hooks.replaceSpeakExamText(async (message, audioKey) => {
    spoken.push({ message: String(message), audioKey: String(audioKey || "") });
    return true;
  });

  hooks.renderPractice();
  if (naturalExchange) {
    assert.equal(harness.content.innerHTML.includes(item.title), false, "natural mode must finish the fixed handout instruction before revealing the cue card");
  }
  await waitForExamUi(
    () => harness.content.innerHTML.includes(item.title),
    "Part 2 cue card should become visible after the handout step"
  );

  assert.equal(spoken.some(call => call.message.includes(item.title) || call.audioKey === item.sourceKey), false, "Part 2 prompt and hints must never be spoken or fetched as question audio");
  assert.equal(item.questionSpeechDone, true, "silent Part 2 handout should be marked ready without question TTS");
  assert.ok(Number.isFinite(item.cueDisplayedAt), "cue display time should be captured once the card becomes visible");
  assert.equal(item.settleEndsAt - item.cueDisplayedAt, 2000, "silent cue card must settle for exactly two seconds");
  assert.equal(item.prepEndsAt - item.settleEndsAt, 60000, "the automatic preparation timer must run for exactly sixty seconds after settling");
  assert.match(harness.content.innerHTML, /0:02/, "the initial silent cue-card state should show the two-second settle countdown");
  assert.equal(harness.content.innerHTML.includes("Book 7"), false, "live Part 2 must not reveal its source book");

  if (naturalExchange) {
    assert.deepEqual(spoken.map(call => call.message), [
      "So here is your question. I'll give you a pencil there as well. I'll give you one minute to take some notes. Okay?"
    ], "natural Part 2 should speak only the fixed handout instruction before preparation");
    item.prepPhase = "preparing";
    item.settleEndsAt = Date.now() - 61000;
    item.prepEndsAt = Date.now() - 1;
    hooks.startPart2Timer(item);
    await waitForExamUi(
      () => spoken.some(call => call.message === "Okay, you can begin."),
      "natural Part 2 should speak the fixed ready prompt after preparation"
    );
    assert.deepEqual(spoken.map(call => call.message), [
      "So here is your question. I'll give you a pencil there as well. I'll give you one minute to take some notes. Okay?",
      "Okay, you can begin."
    ], "only the fixed ready prompt may be spoken when preparation finishes");
  } else {
    assert.deepEqual(spoken, [], "natural-exchange-off Part 2 must reveal the cue silently and immediately");
  }
  hooks.clearExamSession();
}

await assertSilentPart2Start(false);
await assertSilentPart2Start(true);

const sourceVisibilityHarness = createOpeningFlowHarness(speakingSystemSource);
const sourceVisibilityHooks = sourceVisibilityHarness.hooks;
sourceVisibilityHooks.state.user = { id: fixedAttempt, role: "student", name: "Test Student" };
sourceVisibilityHooks.state.access = {};
sourceVisibilityHooks.state.bookmarks = [];
sourceVisibilityHooks.state.examSession = { naturalExchange: false };
const liveSourceItems = [
  {
    kind: "question",
    part: 1,
    globalOrder: 1,
    themeSlot: 1,
    themeTitle: "Home",
    questionInTheme: 3,
    questionNumber: 3,
    sourceBook: 7,
    sourceIndex: 2,
    sourceId: "part1-source-record",
    title: "Where do you live?",
    titleZh: "你住在哪裏？",
    questionSpeechDone: true
  },
  {
    ...part2TestItem(),
    prepPhase: "settling",
    questionSpeechDone: true,
    settleEndsAt: Date.now() + 2000,
    prepEndsAt: Date.now() + 62000
  },
  {
    kind: "question",
    part: 3,
    globalOrder: 3,
    themeTitle: "Private source discussion heading",
    sourceBook: 7,
    sourceIndex: 9,
    sourceId: "part3-source-record",
    title: "Why are useful objects important?",
    titleZh: "為甚麼有用的物件很重要？",
    questionSpeechDone: true
  }
];
const livePartHtml = [
  sourceVisibilityHooks.renderPart1(liveSourceItems[0]),
  sourceVisibilityHooks.renderPart2(liveSourceItems[1]),
  sourceVisibilityHooks.renderPart3(liveSourceItems[2])
];
livePartHtml.forEach((html, index) => {
  assert.equal(html.includes("Book 7"), false, `live Part ${index + 1} must hide its source book`);
  assert.equal(html.includes("data-open-exam-source"), false, `live Part ${index + 1} must not expose a source link`);
});
assert.equal(livePartHtml[0].includes("題庫原題"), false, "live Part 1 must hide its original question-bank label");
assert.equal(livePartHtml[2].includes("Private source discussion heading"), false, "live Part 3 must hide its source theme/book subtitle");

function elapsedSecondsFromHtml(html, attribute) {
  const element = html.match(new RegExp(`<[^>]+${attribute}[^>]*>([\\s\\S]*?)<\\/[^>]+>`));
  assert.ok(element, `${attribute} should be rendered`);
  const text = element[1].replace(/<[^>]*>/g, " ");
  const clock = text.match(/(\d+):(\d{2})/);
  assert.ok(clock, `${attribute} should contain a minutes:seconds value`);
  return Number(clock[1]) * 60 + Number(clock[2]);
}

const stopwatchHarness = createOpeningFlowHarness(speakingSystemSource);
const stopwatchHooks = stopwatchHarness.hooks;
const stopwatchStartedMs = Date.now() - 125000;
const stopwatchStartedAt = new Date(stopwatchStartedMs).toISOString();
const stopwatchCompletedAt = new Date(stopwatchStartedMs + 125000).toISOString();
const stopwatchQuestions = [
  { ...liveSourceItems[0], globalOrder: 1 },
  { ...liveSourceItems[0], globalOrder: 2, title: "Second question", questionNumber: 4 }
];
stopwatchHooks.state.user = { id: fixedAttempt, role: "student", name: "Test Student" };
stopwatchHooks.state.access = {};
stopwatchHooks.state.bookmarks = [];
stopwatchHooks.state.examSession = {
  id: fixedAttempt,
  modeId: "p1",
  mode: exam.modeForId("p1"),
  phase: "question",
  naturalExchange: false,
  startedAt: stopwatchStartedAt,
  completedAt: "",
  items: stopwatchQuestions,
  currentIndex: 0
};
const firstStopwatchSeconds = elapsedSecondsFromHtml(stopwatchHooks.renderProgress(stopwatchQuestions[0]), "data-exam-elapsed-clock");
stopwatchHooks.state.examSession.currentIndex = 1;
const secondStopwatchSeconds = elapsedSecondsFromHtml(stopwatchHooks.renderProgress(stopwatchQuestions[1]), "data-exam-elapsed-clock");
assert.ok(firstStopwatchSeconds >= 123, "live stopwatch must derive from the persisted attempt start instead of resetting per question");
assert.ok(secondStopwatchSeconds >= firstStopwatchSeconds, "live stopwatch must persist when the current question changes");

const reviewItems = [liveSourceItems[0], liveSourceItems[1], liveSourceItems[2]];
stopwatchHooks.state.examSession = {
  id: fixedAttempt,
  modeId: "full",
  mode: exam.modeForId("full"),
  phase: "rating",
  naturalExchange: false,
  startedAt: stopwatchStartedAt,
  completedAt: "",
  selectedNervousness: 4,
  nervousness: null,
  completed: false,
  items: reviewItems,
  currentIndex: reviewItems.length - 1
};
stopwatchHooks.replaceApiJson(async () => ({
  attempt: { nervousness: 4, completedAt: stopwatchCompletedAt }
}));
await stopwatchHooks.submitRating();
assert.equal(stopwatchHooks.state.examSession.completedAt, stopwatchCompletedAt, "completion must freeze the stopwatch at the canonical completedAt returned by PATCH");
assert.equal(elapsedSecondsFromHtml(stopwatchHarness.content.innerHTML, "data-exam-total-duration"), 125, "completion screen must show the frozen total duration");
assert.equal(stopwatchHarness.content.innerHTML.includes("Book 7"), true, "completion review must retain each random question's source book");
assert.equal(stopwatchHarness.content.innerHTML.includes("data-open-exam-source"), true, "completion review must retain source links");

const normalisedHistoryAttempt = stopwatchHooks.normaliseExamAttempt({
  id: fixedAttempt,
  modeId: "p1",
  attemptNumber: 9,
  naturalExchange: false,
  nervousness: 4,
  startedAt: stopwatchStartedAt,
  completedAt: stopwatchCompletedAt,
  questions: [{
    order: 1,
    part: 1,
    sourceKey: "p1:part1-source-record:q3",
    contentKey: "where-do-you-live",
    sourceId: "part1-source-record",
    sourceBook: 7,
    sourceIndex: 2,
    questionNumber: 3,
    promptEn: "Where do you live?",
    promptZh: "你住在哪裏？"
  }]
});
const historyGroup = {
  modeId: "p1",
  owner: "mine",
  examAttempt: normalisedHistoryAttempt,
  attempts: [],
  startedAt: Date.parse(stopwatchStartedAt),
  expected: 12,
  introSaved: false,
  saved: 0,
  skipped: 12,
  covered: 12,
  duplicateCount: 0
};
const historyHtml = `${stopwatchHooks.renderSavedReflection(normalisedHistoryAttempt)}${stopwatchHooks.renderExamRecordingBox([historyGroup])}`;
assert.equal(elapsedSecondsFromHtml(historyHtml, "data-exam-total-duration"), 125, "recording history must preserve the same frozen exam duration");
assert.equal(historyHtml.includes("Book 7"), true, "history review must retain source books after live labels are hidden");
assert.equal(historyHtml.includes("data-open-exam-source"), true, "history review must retain clickable source routes");
stopwatchHooks.clearExamSession();

console.log("Speaking exam mode tests passed: mode boundaries, cooldowns, natural exchanges, gesture audio, intro/question skips, silent Part 2 timing, persistent stopwatch, source visibility and no-scroll progression.");
