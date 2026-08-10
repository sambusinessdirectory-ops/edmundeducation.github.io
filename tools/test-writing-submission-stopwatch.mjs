import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_WRITING_STOPWATCH_MILLISECONDS,
  emptyWritingStopwatch,
  formatWritingStopwatch,
  normalizeWritingStopwatch,
  pauseWritingStopwatch,
  resetWritingStopwatch,
  startWritingStopwatch,
  writingStopwatchElapsed
} from "../writing-submission-stopwatch.js";

test("stopwatch starts, pauses and resumes without losing elapsed time", () => {
  const running = startWritingStopwatch(emptyWritingStopwatch(), 1_000);
  assert.equal(writingStopwatchElapsed(running, 31_250), 30_250);
  const paused = pauseWritingStopwatch(running, 31_250);
  assert.equal(paused.status, "paused");
  assert.equal(paused.accumulatedMilliseconds, 30_250);
  assert.equal(writingStopwatchElapsed(paused, 90_000), 30_250);
  const resumed = startWritingStopwatch(paused, 90_000);
  assert.equal(writingStopwatchElapsed(resumed, 120_750), 61_000);
});

test("running stopwatch state survives reload through an absolute start timestamp", () => {
  const restored = normalizeWritingStopwatch({
    status: "running",
    accumulatedMilliseconds: 12_000,
    startedAt: 50_000
  }, 80_500);
  assert.equal(restored.status, "running");
  assert.equal(writingStopwatchElapsed(restored, 80_500), 42_500);
  assert.equal(formatWritingStopwatch(restored, 80_500), "00:00:42");
});

test("stopwatch values are bounded and corrupt state fails closed", () => {
  assert.deepEqual(normalizeWritingStopwatch({ status: "hacked", startedAt: -2 }), emptyWritingStopwatch());
  const bounded = normalizeWritingStopwatch({
    status: "paused",
    accumulatedMilliseconds: Number.MAX_SAFE_INTEGER,
    startedAt: 0
  });
  assert.equal(bounded.accumulatedMilliseconds, MAX_WRITING_STOPWATCH_MILLISECONDS);
  assert.deepEqual(resetWritingStopwatch(), emptyWritingStopwatch());
});

test("stopwatch formatting supports durations longer than one hour", () => {
  assert.equal(formatWritingStopwatch({
    status: "paused",
    accumulatedMilliseconds: ((2 * 3600) + (3 * 60) + 4) * 1000,
    startedAt: 0
  }), "02:03:04");
});
