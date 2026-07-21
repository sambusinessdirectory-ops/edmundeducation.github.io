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

for (const mode of exam.modes) {
  assert.equal(exam.expectedRecordingCount(mode.id), expectedCounts[mode.id]);
  assert.equal(exam.modeIsFeasible(mode.id, pools), true, `${mode.id} should be feasible`);
  const items = exam.buildExamItems(mode.id, pools, { randomIndex: length => length - 1 });
  assert.equal(items.length, expectedCounts[mode.id], `${mode.id} item count`);
  assert.deepEqual([...new Set(Array.from(items, item => item.part))], Array.from(mode.parts), `${mode.id} part order`);
  assert.deepEqual(Array.from(items, item => item.globalOrder), Array.from({ length: items.length }, (_, index) => index + 1));
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

const impossiblePools = { 1: part1.filter(theme => theme.questions.length < 12).slice(0, 4), 2: part2, 3: part3 };
assert.equal(exam.modeIsFeasible("p1", impossiblePools), false, "Part 1 needs a theme with Q10-Q12");

console.log("Speaking exam mode tests passed: 7 modes, 19-question full flow, random selection and recording grouping IDs.");
