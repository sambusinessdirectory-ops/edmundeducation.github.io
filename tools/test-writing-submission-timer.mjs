import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_WRITING_TIMER_SECONDS,
  emptyWritingTimer,
  expireWritingTimer,
  formatWritingTimer,
  normalizeWritingTimer,
  pauseWritingTimer,
  resumeWritingTimer,
  startWritingTimer,
  timerInputSeconds,
  writingTimerRemaining
} from "../writing-submission-timer.js";

test("countdown formatting and bounded input use HH:MM:SS", () => {
  assert.equal(formatWritingTimer(0), "00:00:00");
  assert.equal(formatWritingTimer(3723), "01:02:03");
  assert.equal(timerInputSeconds(1, 2, 3), 3723);
  assert.equal(timerInputSeconds(99, 99, 99), MAX_WRITING_TIMER_SECONDS);
});

test("a running timer derives remaining time from an absolute deadline", () => {
  const timer = startWritingTimer(90, true, 1_000);
  assert.equal(timer.status, "running");
  assert.equal(timer.forceSubmit, true);
  assert.equal(writingTimerRemaining(timer, 31_000), 60);
  assert.equal(writingTimerRemaining(timer, 91_000), 0);
});

test("pause and resume preserve the exact draft countdown", () => {
  const started = startWritingTimer(120, false, 10_000);
  const paused = pauseWritingTimer(started, 40_000);
  assert.equal(paused.status, "paused");
  assert.equal(paused.remainingSeconds, 90);
  assert.equal(paused.endsAt, 0);
  const resumed = resumeWritingTimer(paused, 50_000);
  assert.equal(resumed.status, "running");
  assert.equal(resumed.endsAt, 140_000);
  assert.equal(writingTimerRemaining(resumed, 80_000), 60);
});

test("restored overdue timers expire without losing force-submit metadata", () => {
  const restored = normalizeWritingTimer({
    status: "running",
    durationSeconds: 20,
    remainingSeconds: 20,
    endsAt: 25_000,
    forceSubmit: true
  }, 30_000);
  assert.equal(restored.status, "expired");
  assert.equal(restored.remainingSeconds, 0);
  assert.equal(restored.forceSubmit, true);
  assert.equal(expireWritingTimer(restored).status, "expired");
});

test("idle force-submit choice can be persisted before countdown starts", () => {
  const timer = normalizeWritingTimer({ ...emptyWritingTimer(), forceSubmit: true });
  assert.equal(timer.status, "idle");
  assert.equal(timer.forceSubmit, true);
});

test("zero-second countdowns are rejected", () => {
  assert.throws(() => startWritingTimer(0), RangeError);
});
