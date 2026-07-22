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

console.log("Speaking exam mode tests passed: 7 mode boundaries, skipped-question cooldown/review semantics, natural transitions and 19-question full flow.");
