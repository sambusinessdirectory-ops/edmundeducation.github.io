export const MAX_WRITING_STOPWATCH_MILLISECONDS = 365 * 24 * 60 * 60 * 1000;

const STOPWATCH_STATUSES = new Set(["idle", "running", "paused"]);

function boundedMilliseconds(value, fallback = 0) {
  const milliseconds = Number(value);
  if (!Number.isFinite(milliseconds)) return fallback;
  return Math.max(0, Math.min(MAX_WRITING_STOPWATCH_MILLISECONDS, Math.round(milliseconds)));
}

export function emptyWritingStopwatch() {
  return {
    status: "idle",
    accumulatedMilliseconds: 0,
    startedAt: 0
  };
}

export function writingStopwatchElapsed(value, now = Date.now()) {
  const accumulated = boundedMilliseconds(value?.accumulatedMilliseconds);
  if (value?.status !== "running") return accumulated;
  const startedAt = Number(value?.startedAt);
  if (!Number.isFinite(startedAt) || startedAt <= 0 || now <= startedAt) return accumulated;
  return boundedMilliseconds(accumulated + (now - startedAt));
}

export function normalizeWritingStopwatch(value, now = Date.now()) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const status = STOPWATCH_STATUSES.has(source.status) ? source.status : "idle";
  const accumulatedMilliseconds = boundedMilliseconds(source.accumulatedMilliseconds);
  const startedAt = Number.isFinite(Number(source.startedAt))
    ? Math.max(0, Math.round(Number(source.startedAt)))
    : 0;

  if (status === "running" && startedAt > 0) {
    if (writingStopwatchElapsed({ status, accumulatedMilliseconds, startedAt }, now)
      >= MAX_WRITING_STOPWATCH_MILLISECONDS) {
      return {
        status: "paused",
        accumulatedMilliseconds: MAX_WRITING_STOPWATCH_MILLISECONDS,
        startedAt: 0
      };
    }
    return { status, accumulatedMilliseconds, startedAt };
  }
  if (status === "paused" && accumulatedMilliseconds > 0) {
    return { status, accumulatedMilliseconds, startedAt: 0 };
  }
  return emptyWritingStopwatch();
}

export function startWritingStopwatch(value = emptyWritingStopwatch(), now = Date.now()) {
  const normalized = normalizeWritingStopwatch(value, now);
  if (normalized.status === "running") return normalized;
  return {
    status: "running",
    accumulatedMilliseconds: normalized.accumulatedMilliseconds,
    startedAt: Math.max(1, Math.round(Number(now) || Date.now()))
  };
}

export function pauseWritingStopwatch(value, now = Date.now()) {
  const normalized = normalizeWritingStopwatch(value, now);
  if (normalized.status !== "running") return normalized;
  return {
    status: "paused",
    accumulatedMilliseconds: writingStopwatchElapsed(normalized, now),
    startedAt: 0
  };
}

export function resetWritingStopwatch() {
  return emptyWritingStopwatch();
}

export function formatWritingStopwatch(value, now = Date.now()) {
  const totalSeconds = Math.floor(writingStopwatchElapsed(value, now) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map(part => String(part).padStart(2, "0")).join(":");
}
