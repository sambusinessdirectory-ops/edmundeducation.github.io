import assert from "node:assert/strict";
import {
  SCHEDULE_CLIPBOARD_PREFIX,
  ScheduleClipboardError,
  createScheduleClipboardPayload,
  parseScheduleClipboard,
  planScheduleClipboardPaste,
  serializeScheduleClipboard
} from "../schedule-clipboard.mjs";

const now = Date.parse("2026-07-27T12:00:00.000Z");
const entries = [
  {
    id: "monday-2",
    scheduleDate: "2026-07-27",
    slotIndex: 2,
    message: "Flash Cards\n__EDMUND_HOMEWORK_RESOURCES__=[{\"id\":\"deck-2\"}]",
    estimatedMinutes: 45,
    source: "admin",
    isCompleted: true,
    updatedAt: "2026-07-27T01:00:00Z"
  },
  {
    id: "friday-7",
    scheduleDate: "2026-07-31",
    slotIndex: 7,
    message: "Sentence Structure 3",
    estimatedMinutes: null,
    source: "student",
    isInProgress: false,
    isMoreThanHalfCompleted: true
  }
];

const payload = createScheduleClipboardPayload({
  entries,
  selectedEntryIds: new Set(["friday-7", "monday-2"]),
  weekStart: "2026-07-27",
  now
});
assert.deepEqual(payload.items, [
  {
    dayOffset: 0,
    slotIndex: 2,
    message: entries[0].message,
    estimatedMinutes: 45
  },
  {
    dayOffset: 4,
    slotIndex: 7,
    message: entries[1].message,
    estimatedMinutes: null
  }
]);
const payloadText = JSON.stringify(payload);
assert.doesNotMatch(payloadText, /monday-2|friday-7|updatedAt|isCompleted|isInProgress|isMoreThanHalfCompleted|"source"/);

const serialized = serializeScheduleClipboard(payload, { now });
assert.ok(serialized.startsWith(SCHEDULE_CLIPBOARD_PREFIX));
assert.deepEqual(parseScheduleClipboard(serialized, { now }), payload);
assert.deepEqual(parseScheduleClipboard(JSON.stringify(payload), { now }), payload);

const exactPlan = planScheduleClipboardPaste({
  payload,
  targetWeekStart: "2026-08-03",
  capacities: { "2026-08-03": 10, "2026-08-07": 10 },
  entries: [],
  currentRole: "admin",
  now
});
assert.deepEqual(exactPlan.ready.map(({ scheduleDate, slotIndex }) => ({ scheduleDate, slotIndex })), [
  { scheduleDate: "2026-08-03", slotIndex: 2 },
  { scheduleDate: "2026-08-07", slotIndex: 7 }
]);

const shiftedPlan = planScheduleClipboardPaste({
  payload,
  targetWeekStart: "2026-08-03",
  targetDayOffset: 1,
  targetSlotIndex: 4,
  capacities: { "2026-08-04": 10, "2026-08-08": 10 },
  entries: [],
  currentRole: "admin",
  now
});
assert.deepEqual(shiftedPlan.ready.map(({ scheduleDate, slotIndex }) => ({ scheduleDate, slotIndex })), [
  { scheduleDate: "2026-08-04", slotIndex: 4 },
  { scheduleDate: "2026-08-08", slotIndex: 9 }
]);

const conflictPlan = planScheduleClipboardPaste({
  payload: {
    ...payload,
    items: [payload.items[0], { ...payload.items[1], slotIndex: 12 }]
  },
  targetWeekStart: "2026-08-03",
  capacities: { "2026-08-03": 10, "2026-08-07": 10 },
  entries: [
    {
      id: "protected",
      scheduleDate: "2026-08-03",
      slotIndex: 2,
      message: "Existing teacher work",
      source: "admin"
    }
  ],
  currentRole: "student",
  now
});
assert.deepEqual(conflictPlan.ready, []);
assert.deepEqual(conflictPlan.conflicts.map((conflict) => conflict.reason), ["protected", "outside-capacity"]);

const unchangedPlan = planScheduleClipboardPaste({
  payload,
  targetWeekStart: "2026-07-27",
  capacities: { "2026-07-27": 10, "2026-07-31": 10 },
  entries,
  currentRole: "admin",
  now
});
assert.equal(unchangedPlan.ready.length, 0);
assert.equal(unchangedPlan.conflicts.length, 0);
assert.equal(unchangedPlan.unchanged.length, 2);

assert.throws(
  () => createScheduleClipboardPayload({
    entries: [{ ...entries[0], spanGroupId: "span" }],
    selectedEntryIds: new Set(["monday-2"]),
    weekStart: "2026-07-27",
    now
  }),
  (error) => error instanceof ScheduleClipboardError && error.code === "span-unsupported"
);

for (const invalid of [
  { ...payload, version: 2 },
  { ...payload, sourceWeekStart: "2026-07-28" },
  { ...payload, items: [...payload.items, payload.items[0]] },
  { ...payload, items: [{ ...payload.items[0], slotIndex: 101 }] }
]) {
  assert.throws(() => parseScheduleClipboard(JSON.stringify(invalid), { now }), ScheduleClipboardError);
}

assert.throws(
  () => parseScheduleClipboard(serialized, { now: now + 2 * 60 * 60 * 1000 + 1 }),
  (error) => error instanceof ScheduleClipboardError && error.code === "expired"
);

const edgePlan = planScheduleClipboardPaste({
  payload: {
    ...payload,
    sourceWeekStart: "2050-12-26",
    copiedAt: new Date(now).toISOString(),
    items: [{ ...payload.items[1], dayOffset: 6 }]
  },
  targetWeekStart: "2050-12-26",
  entries: [],
  capacities: {},
  now
});
assert.equal(edgePlan.ready.length, 0);
assert.equal(edgePlan.conflicts[0].reason, "outside-range");

console.log("Schedule clipboard checks passed: exact weekday/slot mapping, safe conflicts, stripped identity, validated fallback payload.");
