export const SCHEDULE_MIN_DATE = "2026-01-01";
export const SCHEDULE_MAX_DATE = "2050-12-31";
export const WEEKDAY_LABELS = [
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
  "星期日"
];

export function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) throw new Error("Invalid ISO date");
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  if (
    date.getFullYear() !== Number(match[1])
    || date.getMonth() !== Number(match[2]) - 1
    || date.getDate() !== Number(match[3])
  ) {
    throw new Error("Invalid calendar date");
  }
  return date;
}

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date, amount) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  result.setDate(result.getDate() + amount);
  return result;
}

export function mondayFor(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  const weekday = result.getDay();
  result.setDate(result.getDate() + (weekday === 0 ? -6 : 1 - weekday));
  return result;
}

export function clampToScheduleRange(date) {
  const min = parseISODate(SCHEDULE_MIN_DATE);
  const max = parseISODate(SCHEDULE_MAX_DATE);
  if (date < min) return min;
  if (date > max) return max;
  return date;
}

export function weekStartFor(date) {
  return mondayFor(clampToScheduleRange(date));
}

export function firstWeekStart() {
  return mondayFor(parseISODate(SCHEDULE_MIN_DATE));
}

export function lastWeekStart() {
  return mondayFor(parseISODate(SCHEDULE_MAX_DATE));
}

export function isDateInScheduleRange(value) {
  return value >= SCHEDULE_MIN_DATE && value <= SCHEDULE_MAX_DATE;
}

export function isWeekStartInScheduleRange(value) {
  try {
    const date = parseISODate(value);
    return date.getDay() === 1 && date >= firstWeekStart() && date <= lastWeekStart();
  } catch {
    return false;
  }
}

export function weekDates(weekStart) {
  const monday = typeof weekStart === "string" ? parseISODate(weekStart) : mondayFor(weekStart);
  return Array.from({ length: 7 }, (_, index) => toISODate(addDays(monday, index)));
}

export function formatDayDate(value, locale = "zh-HK") {
  const date = parseISODate(value);
  return new Intl.DateTimeFormat(locale, {
    month: "numeric",
    day: "numeric"
  }).format(date);
}

export function formatWeekRange(weekStart, locale = "zh-HK") {
  const start = typeof weekStart === "string" ? parseISODate(weekStart) : weekStart;
  const end = addDays(start, 6);
  const startText = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(start);
  const endText = new Intl.DateTimeFormat(locale, {
    year: start.getFullYear() === end.getFullYear() ? undefined : "numeric",
    month: "long",
    day: "numeric"
  }).format(end);
  return `${startText} — ${endText}`;
}

export function defaultWeekStart(today = new Date()) {
  return toISODate(weekStartFor(today));
}
