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
    scrollTo() {},
    fetch: unexpectedFetch
  };
  const instrumented = source.replace(/\n  init\(\);\n\}\)\(\);\s*$/, `
  window.__EDMUND_SPEAKING_OPENING_TEST__ = {
    state,
    setupEvents: () => setupEvents(),
    runOpeningSequence: () => startExamOpeningSequence(),
    renderOpening: () => renderExamOpening(),
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
    audioActions,
    documentListeners,
    setUserGesture(active) { userGestureActive = Boolean(active); },
    unexpectedNetworkCalls: () => unexpectedNetworkCalls
  };
}

const speakingSystemSource = readFileSync(`${repository}/speaking-system.js`, "utf8");
const openingSource = topLevelFunctionSource(speakingSystemSource, "renderExamOpening");
const openingSequenceSource = topLevelFunctionSource(speakingSystemSource, "startExamOpeningSequence");
const skipIntroductionSource = topLevelFunctionSource(speakingSystemSource, "skipExamIntroduction");
const setupEventsSource = topLevelFunctionSource(speakingSystemSource, "setupEvents");

assert.match(openingSource, /examVoiceControlHtml\(\{ allowIntroSkip: true \}\)/, "the opening panel must render an always-available introduction skip control");
assert.match(speakingSystemSource, /data-exam-skip-intro/, "the introduction skip control needs a stable DOM hook");
assert.match(setupEventsSource, /data-exam-skip-intro[\s\S]*?skipExamIntroduction\(\)/, "the introduction skip control must call skipExamIntroduction");
assert.match(skipIntroductionSource, /\["opening", "intro-answer"\]\.includes\(session\.phase\)/, "introduction skip must work while either opening message is active");
assert.match(skipIntroductionSource, /introduction\/skip/, "introduction skip must persist its non-recording outcome");
assert.doesNotMatch(skipIntroductionSource, /recordingIntroId|startRecording|saveRecording|FormData|method:\s*["']POST["']/, "introduction skip must never create or upload a recording");
assert.match(openingSequenceSource, /await speakExamText\("Okay, let's begin\."\)/, "opening voice must start with the examiner greeting");
assert.match(openingSequenceSource, /await speakExamText\("Could you tell me your full name please\?"\)/, "opening voice must ask the name starter once");
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

console.log("Speaking exam mode tests passed: 7 mode boundaries, skipped-question cooldown/review semantics, natural transitions, user-gesture opening audio, skippable name starter and 19-question full flow.");
