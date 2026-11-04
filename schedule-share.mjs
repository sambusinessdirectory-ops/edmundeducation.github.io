import { isWeekStartInScheduleRange } from "./schedule-calendar.mjs";

export const SCHEDULE_WEEK_QUERY_KEY = "week";

export function scheduleWeekStartFromUrl(href, fallbackWeekStart) {
  const fallback = isWeekStartInScheduleRange(fallbackWeekStart) ? fallbackWeekStart : "";
  try {
    const url = new URL(String(href));
    const candidates = url.searchParams.getAll(SCHEDULE_WEEK_QUERY_KEY);
    if (candidates.length !== 1) return fallback;
    const candidate = String(candidates[0] || "");
    return isWeekStartInScheduleRange(candidate) ? candidate : fallback;
  } catch {
    return fallback;
  }
}

export function buildScheduleWeekUrl(href, weekStart) {
  if (!isWeekStartInScheduleRange(weekStart)) throw new Error("Invalid schedule week");
  const url = new URL(String(href));
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid schedule URL");
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  url.searchParams.set(SCHEDULE_WEEK_QUERY_KEY, weekStart);
  return url.href;
}

export function scheduleWeekShareMessage(url) {
  return `Edmund 提醒：\n已安排本週功課，請努力溫習！ 😬💪🏻\n${url}`;
}
