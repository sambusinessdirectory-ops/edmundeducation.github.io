export const MAX_WRITING_TIMER_SECONDS = 12 * 60 * 60;

const TIMER_STATUSES = new Set(["idle", "running", "paused", "expired"]);

function boundedSeconds(value, fallback = 0) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return fallback;
  return Math.max(0, Math.min(MAX_WRITING_TIMER_SECONDS, Math.round(seconds)));
}

export function emptyWritingTimer() {
  return {
    status: "idle",
    durationSeconds: 0,
    remainingSeconds: 0,
    endsAt: 0,
    forceSubmit: false,
    autoSubmitAttemptedAt: 0,
    autoSubmitError: ""
  };
}

export function writingTimerRemaining(timer, now = Date.now()) {
  if (timer?.status === "running" && Number(timer.endsAt) > 0) {
    return Math.max(0, Math.ceil((Number(timer.endsAt) - now) / 1000));
  }
  return boundedSeconds(timer?.remainingSeconds);
}

export function normalizeWritingTimer(value, now = Date.now()) {
  const timer = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
  const normalized = {
    status: TIMER_STATUSES.has(timer.status) ? timer.status : "idle",
    durationSeconds: boundedSeconds(timer.durationSeconds),
    remainingSeconds: boundedSeconds(timer.remainingSeconds),
    endsAt: Number.isFinite(Number(timer.endsAt)) ? Math.max(0, Math.round(Number(timer.endsAt))) : 0,
    forceSubmit: timer.forceSubmit === true,
    autoSubmitAttemptedAt: Number.isFinite(Number(timer.autoSubmitAttemptedAt))
      ? Math.max(0, Math.round(Number(timer.autoSubmitAttemptedAt)))
      : 0,
    autoSubmitError: String(timer.autoSubmitError || "").slice(0, 300)
  };
  if (normalized.status === "running") {
    normalized.remainingSeconds = writingTimerRemaining(normalized, now);
    if (normalized.remainingSeconds <= 0) {
      normalized.status = "expired";
      normalized.endsAt = 0;
    }
  }
  if (normalized.status === "idle") {
    return { ...emptyWritingTimer(), forceSubmit: normalized.forceSubmit };
  }
  return normalized;
}

export function startWritingTimer(durationSeconds, forceSubmit = false, now = Date.now()) {
  const duration = boundedSeconds(durationSeconds);
  if (duration < 1) throw new RangeError("Timer duration must be at least one second.");
  return {
    status: "running",
    durationSeconds: duration,
    remainingSeconds: duration,
    endsAt: now + duration * 1000,
    forceSubmit: forceSubmit === true,
    autoSubmitAttemptedAt: 0,
    autoSubmitError: ""
  };
}

export function pauseWritingTimer(timer, now = Date.now()) {
  const normalized = normalizeWritingTimer(timer, now);
  if (normalized.status !== "running") return normalized;
  const remainingSeconds = writingTimerRemaining(normalized, now);
  return {
    ...normalized,
    status: remainingSeconds > 0 ? "paused" : "expired",
    remainingSeconds,
    endsAt: 0
  };
}

export function resumeWritingTimer(timer, now = Date.now()) {
  const normalized = normalizeWritingTimer(timer, now);
  if (normalized.status !== "paused" || normalized.remainingSeconds < 1) return normalized;
  return {
    ...normalized,
    status: "running",
    endsAt: now + normalized.remainingSeconds * 1000,
    autoSubmitError: ""
  };
}

export function expireWritingTimer(timer) {
  const normalized = normalizeWritingTimer(timer);
  return {
    ...normalized,
    status: "expired",
    remainingSeconds: 0,
    endsAt: 0
  };
}

export function formatWritingTimer(secondsValue) {
  const seconds = boundedSeconds(secondsValue);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsPart = seconds % 60;
  return [hours, minutes, secondsPart]
    .map(value => String(value).padStart(2, "0"))
    .join(":");
}

export function timerInputSeconds(hoursValue, minutesValue, secondsValue) {
  const hours = Math.max(0, Math.min(12, Math.floor(Number(hoursValue) || 0)));
  const minutes = Math.max(0, Math.min(59, Math.floor(Number(minutesValue) || 0)));
  const seconds = Math.max(0, Math.min(59, Math.floor(Number(secondsValue) || 0)));
  return Math.min(MAX_WRITING_TIMER_SECONDS, hours * 3600 + minutes * 60 + seconds);
}
