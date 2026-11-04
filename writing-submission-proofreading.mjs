export const WRITING_PROOFREADING_DURATION_SECONDS = 5 * 60;

const WRITING_PROOFREADING_DURATION_MILLISECONDS = WRITING_PROOFREADING_DURATION_SECONDS * 1000;
const PROOFREADING_STATUSES = new Set(["idle", "active", "ready"]);

function currentTimestamp(value) {
  const timestamp = Number(value);
  if (Number.isSafeInteger(timestamp) && timestamp >= 0) return timestamp;
  return Date.now();
}

function persistedTimestamp(value) {
  const timestamp = Number(value);
  return Number.isSafeInteger(timestamp) && timestamp > 0 ? timestamp : 0;
}

function readPersistedValue(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function canonicalTimedGate(startedAt, status) {
  return {
    status,
    startedAt,
    endsAt: startedAt + WRITING_PROOFREADING_DURATION_MILLISECONDS
  };
}

export function createWritingProofreadingGate() {
  return {
    status: "idle",
    startedAt: 0,
    endsAt: 0
  };
}

export function resetWritingProofreadingGate() {
  return createWritingProofreadingGate();
}

export function normalizeWritingProofreadingGate(value, now = Date.now()) {
  const source = readPersistedValue(value);
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return createWritingProofreadingGate();
  }
  if (!PROOFREADING_STATUSES.has(source.status) || source.status === "idle") {
    return createWritingProofreadingGate();
  }

  const checkedAt = currentTimestamp(now);
  const startedAt = persistedTimestamp(source.startedAt);
  const endsAt = persistedTimestamp(source.endsAt);
  if (!startedAt || !endsAt || startedAt > checkedAt) {
    return createWritingProofreadingGate();
  }

  const canonicalEndsAt = startedAt + WRITING_PROOFREADING_DURATION_MILLISECONDS;
  if (!Number.isSafeInteger(canonicalEndsAt) || endsAt !== canonicalEndsAt) {
    return createWritingProofreadingGate();
  }

  return canonicalTimedGate(startedAt, checkedAt >= endsAt ? "ready" : "active");
}

export function startWritingProofreadingGate(now = Date.now()) {
  const startedAt = currentTimestamp(now);
  const endsAt = startedAt + WRITING_PROOFREADING_DURATION_MILLISECONDS;
  if (!Number.isSafeInteger(endsAt)) {
    return createWritingProofreadingGate();
  }
  return canonicalTimedGate(startedAt, "active");
}

export function writingProofreadingRemaining(value, now = Date.now()) {
  const checkedAt = currentTimestamp(now);
  const gate = normalizeWritingProofreadingGate(value, checkedAt);
  if (gate.status !== "active") return 0;
  return Math.min(
    WRITING_PROOFREADING_DURATION_SECONDS,
    Math.max(0, Math.ceil((gate.endsAt - checkedAt) / 1000))
  );
}

export function isWritingProofreadingActive(value, now = Date.now()) {
  return normalizeWritingProofreadingGate(value, now).status === "active";
}

export function isWritingProofreadingReady(value, now = Date.now()) {
  return normalizeWritingProofreadingGate(value, now).status === "ready";
}

export function formatWritingProofreading(secondsValue) {
  const numericSeconds = Number(secondsValue);
  const seconds = Number.isFinite(numericSeconds)
    ? Math.max(0, Math.min(WRITING_PROOFREADING_DURATION_SECONDS, Math.ceil(numericSeconds)))
    : 0;
  const minutes = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;
  return `${minutes}:${String(secondsPart).padStart(2, "0")}`;
}
