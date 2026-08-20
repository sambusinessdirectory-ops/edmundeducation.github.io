export const DEFAULT_POMODORO_SETTINGS = Object.freeze({
  enabled: false,
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 25,
  sessionsBeforeLongBreak: 4,
  taskLabel: "英文學習"
});

function validDayKey(value) {
  const text = String(value || "");
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function dayNumber(dayKey) {
  const [year, month, day] = String(dayKey).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

export function learningDaySummary(snapshot, todayKey) {
  const days = new Set();
  const sources = snapshot?.sources && typeof snapshot.sources === "object" ? snapshot.sources : {};
  Object.values(sources).forEach((source) => {
    [source?.activityDays, source?.timeDays].forEach((rows) => {
      if (!Array.isArray(rows)) return;
      rows.forEach((row) => {
        const day = validDayKey(row?.date);
        if (day) days.add(day);
      });
    });
  });
  const ordered = [...days].sort();
  if (!ordered.length) return { streak: 0, total: 0, latestDay: "" };
  const latestDay = ordered.at(-1);
  const today = validDayKey(todayKey);
  if (today && dayNumber(today) - dayNumber(latestDay) > 1) {
    return { streak: 0, total: ordered.length, latestDay };
  }
  let streak = 1;
  for (let index = ordered.length - 1; index > 0; index -= 1) {
    if (dayNumber(ordered[index]) - dayNumber(ordered[index - 1]) !== 1) break;
    streak += 1;
  }
  return { streak, total: ordered.length, latestDay };
}

export function normalizePurposeFontSize(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 3 ? parsed : 2;
}

export function normalizePomodoroSettings(value) {
  const source = value && typeof value === "object" ? value : {};
  const bounded = (raw, fallback, min, max) => {
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
  };
  return {
    enabled: source.enabled === true,
    workMinutes: bounded(source.workMinutes, 25, 1, 180),
    shortBreakMinutes: bounded(source.shortBreakMinutes, 5, 1, 60),
    longBreakMinutes: bounded(source.longBreakMinutes, 25, 1, 120),
    sessionsBeforeLongBreak: bounded(source.sessionsBeforeLongBreak, 4, 1, 12),
    taskLabel: String(source.taskLabel || "英文學習").trim().slice(0, 60) || "英文學習"
  };
}

export function pomodoroPhaseDurationMs(settings, phase) {
  const normalized = normalizePomodoroSettings(settings);
  const minutes = phase === "short-break"
    ? normalized.shortBreakMinutes
    : phase === "long-break"
      ? normalized.longBreakMinutes
      : normalized.workMinutes;
  return minutes * 60000;
}

export function nextPomodoroPhase(current) {
  const settings = normalizePomodoroSettings(current?.settings);
  const completed = Math.max(0, Number(current?.completedSessions) || 0);
  if (current?.phase === "work") {
    const nextCompleted = completed + 1;
    return {
      phase: nextCompleted % settings.sessionsBeforeLongBreak === 0 ? "long-break" : "short-break",
      completedSessions: nextCompleted
    };
  }
  return { phase: "work", completedSessions: completed };
}

export function formatPomodoroRemaining(milliseconds) {
  const seconds = Math.max(0, Math.ceil(Number(milliseconds || 0) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
