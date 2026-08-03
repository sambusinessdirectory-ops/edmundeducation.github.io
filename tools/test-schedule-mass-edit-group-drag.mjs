import assert from "node:assert/strict";
import { ScheduleGroupShiftError, planScheduleGroupShift } from "../schedule-mass-edit.mjs";

const capacities = Object.fromEntries([
  "2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06",
  "2026-08-07", "2026-08-08", "2026-08-09"
].map((date) => [date, 10]));

const entries = [
  {
    id: "one",
    scheduleDate: "2026-08-03",
    slotIndex: 2,
    message: "First",
    source: "student",
    isCompleted: true,
    isInProgress: false,
    isPreviousIncomplete: false,
    estimatedMinutes: 30,
    spanGroupId: null
  },
  {
    id: "two",
    scheduleDate: "2026-08-04",
    slotIndex: 4,
    message: "Second",
    source: "student",
    isCompleted: false,
    isInProgress: true,
    isPreviousIncomplete: false,
    estimatedMinutes: 45,
    spanGroupId: null
  }
];

const shifted = planScheduleGroupShift({
  entries,
  selectedEntryIds: new Set(["one", "two"]),
  anchorEntryId: "one",
  targetDate: "2026-08-05",
  weekStart: "2026-08-03",
  capacities,
  currentRole: "student"
});
assert.equal(shifted.offsetDays, 2);
assert.deepEqual(
  shifted.items.map((item) => [item.scheduleDate, item.slotIndex]),
  [["2026-08-05", 2], ["2026-08-06", 4]],
  "group drag should preserve every relative day and slot position"
);
assert.deepEqual(
  shifted.items.map((item) => [item.isCompleted, item.isInProgress, item.isPreviousIncomplete]),
  [[true, false, false], [false, true, false]],
  "all three status tags must survive the staged group operation"
);

const previousIncompleteShift = planScheduleGroupShift({
  entries: [{
    ...entries[0],
    id: "previous",
    isCompleted: false,
    isPreviousIncomplete: true
  }],
  selectedEntryIds: ["previous"],
  anchorEntryId: "previous",
  targetDate: "2026-08-05",
  weekStart: "2026-08-03",
  capacities
});
assert.equal(previousIncompleteShift.items[0].isPreviousIncomplete, true, "the pale-red previous-homework tag must survive a group shift");

const overlappingShift = planScheduleGroupShift({
  entries,
  selectedEntryIds: ["one", "two"],
  anchorEntryId: "one",
  targetDate: "2026-08-04",
  weekStart: "2026-08-03",
  capacities
});
assert.deepEqual(
  overlappingShift.items.map((item) => item.scheduleDate),
  ["2026-08-04", "2026-08-05"],
  "selected source cells vacated by the same move should not count as collisions"
);

const collisionEntries = [...entries, {
  id: "occupied",
  scheduleDate: "2026-08-05",
  slotIndex: 2,
  message: "Do not overwrite",
  source: "student",
  spanGroupId: null
}];
assert.throws(
  () => planScheduleGroupShift({
    entries: collisionEntries,
    selectedEntryIds: ["one", "two"],
    anchorEntryId: "one",
    targetDate: "2026-08-05",
    weekStart: "2026-08-03",
    capacities
  }),
  (error) => error instanceof ScheduleGroupShiftError && error.code === "collision",
  "group drag must never overwrite an occupied target"
);

assert.throws(
  () => planScheduleGroupShift({
    entries: [{ ...entries[0], isPreviousIncomplete: true }],
    selectedEntryIds: ["one"],
    anchorEntryId: "one",
    targetDate: "2026-08-05",
    weekStart: "2026-08-03",
    capacities
  }),
  (error) => error instanceof ScheduleGroupShiftError && error.code === "status",
  "mutually exclusive statuses must be validated before staging"
);

assert.throws(
  () => planScheduleGroupShift({
    entries,
    selectedEntryIds: ["one", "two"],
    anchorEntryId: "one",
    targetDate: "2026-08-09",
    weekStart: "2026-08-03",
    capacities
  }),
  (error) => error instanceof ScheduleGroupShiftError && error.code === "boundary",
  "a shift taking any selected item outside the visible week must be rejected"
);

const protectedCopy = planScheduleGroupShift({
  entries: [{ ...entries[0], id: "teacher", source: "admin" }],
  selectedEntryIds: ["teacher"],
  anchorEntryId: "teacher",
  targetDate: "2026-08-05",
  weekStart: "2026-08-03",
  capacities,
  copy: true,
  currentRole: "student"
});
assert.equal(protectedCopy.items[0].source, "student", "a student copy must not acquire protected teacher ownership");
assert.throws(
  () => planScheduleGroupShift({
    entries: [{ ...entries[0], id: "teacher", source: "admin" }],
    selectedEntryIds: ["teacher"],
    anchorEntryId: "teacher",
    targetDate: "2026-08-05",
    weekStart: "2026-08-03",
    capacities,
    currentRole: "student"
  }),
  (error) => error instanceof ScheduleGroupShiftError && error.code === "protected"
);

console.log("Schedule Mass Edit group-drag checks passed: relative shift, no overwrite, boundaries, ownership and all statuses.");
