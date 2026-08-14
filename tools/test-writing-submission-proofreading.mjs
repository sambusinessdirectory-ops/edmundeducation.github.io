import assert from "node:assert/strict";
import test from "node:test";

import {
  WRITING_PROOFREADING_DURATION_SECONDS,
  createWritingProofreadingGate,
  formatWritingProofreading,
  isWritingProofreadingActive,
  isWritingProofreadingReady,
  normalizeWritingProofreadingGate,
  resetWritingProofreadingGate,
  startWritingProofreadingGate,
  writingProofreadingRemaining
} from "../writing-submission-proofreading.mjs";

const STARTED_AT = 1_000_000;

test("proofreading gate starts with exactly five minutes", () => {
  const gate = startWritingProofreadingGate(STARTED_AT);
  assert.equal(WRITING_PROOFREADING_DURATION_SECONDS, 300);
  assert.deepEqual(gate, {
    status: "active",
    startedAt: STARTED_AT,
    endsAt: STARTED_AT + 300_000
  });
  assert.equal(writingProofreadingRemaining(gate, STARTED_AT), 300);
  assert.equal(formatWritingProofreading(300), "5:00");
  assert.equal(isWritingProofreadingActive(gate, STARTED_AT), true);
  assert.equal(isWritingProofreadingReady(gate, STARTED_AT), false);
});

test("remaining time is derived from the wall clock", () => {
  const gate = startWritingProofreadingGate(STARTED_AT);
  assert.equal(writingProofreadingRemaining(gate, STARTED_AT + 1_000), 299);
  assert.equal(writingProofreadingRemaining(gate, STARTED_AT + 123_456), 177);
  assert.equal(formatWritingProofreading(177), "2:57");
});

test("active state normalizes after a sessionStorage-style reload", () => {
  const serialized = JSON.stringify(startWritingProofreadingGate(STARTED_AT));
  const restored = normalizeWritingProofreadingGate(serialized, STARTED_AT + 120_000);
  assert.deepEqual(restored, {
    status: "active",
    startedAt: STARTED_AT,
    endsAt: STARTED_AT + 300_000
  });
  assert.equal(writingProofreadingRemaining(restored, STARTED_AT + 120_000), 180);
});

test("the gate becomes ready at expiry and remains ready when stale", () => {
  const gate = startWritingProofreadingGate(STARTED_AT);
  const expired = normalizeWritingProofreadingGate(gate, STARTED_AT + 300_000);
  assert.equal(expired.status, "ready");
  assert.equal(writingProofreadingRemaining(expired, STARTED_AT + 300_000), 0);
  assert.equal(isWritingProofreadingActive(expired, STARTED_AT + 900_000), false);
  assert.equal(isWritingProofreadingReady(expired, STARTED_AT + 900_000), true);
});

test("invalid, extended and future-dated persisted state fails back to idle", () => {
  const idle = createWritingProofreadingGate();
  assert.deepEqual(normalizeWritingProofreadingGate("not json", STARTED_AT), idle);
  assert.deepEqual(normalizeWritingProofreadingGate({ status: "unknown" }, STARTED_AT), idle);
  assert.deepEqual(normalizeWritingProofreadingGate({
    status: "active",
    startedAt: STARTED_AT,
    endsAt: STARTED_AT + 600_000
  }, STARTED_AT + 1_000), idle);
  assert.deepEqual(normalizeWritingProofreadingGate({
    status: "active",
    startedAt: STARTED_AT + 1_000,
    endsAt: STARTED_AT + 301_000
  }, STARTED_AT), idle);
  assert.equal(formatWritingProofreading(Number.NaN), "0:00");
});

test("reset returns a fresh gate with no active or ready state", () => {
  const reset = resetWritingProofreadingGate(startWritingProofreadingGate(STARTED_AT));
  assert.deepEqual(reset, createWritingProofreadingGate());
  assert.equal(writingProofreadingRemaining(reset, STARTED_AT), 0);
  assert.equal(isWritingProofreadingActive(reset, STARTED_AT), false);
  assert.equal(isWritingProofreadingReady(reset, STARTED_AT), false);
});
