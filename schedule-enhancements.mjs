const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;
const HONG_KONG_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;

export const COUNTDOWN_INITIAL_CAPACITY = 6;
export const COUNTDOWN_BATCH_SIZE = 5;
export const COUNTDOWN_MAX_CAPACITY = 101;

function parseDateOnly(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(date.getTime())
    || date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return null;
  return date;
}

function emptyCountdownBreakdown() {
  return { days: 0, months: 0, monthWeeks: 0, weeks: 0, weekDays: 0, hours: 0, hourMinutes: 0, minutes: 0 };
}

function remainingHongKongMilliseconds(endValue, nowValue = new Date()) {
  const end = parseDateOnly(endValue);
  const now = nowValue instanceof Date ? nowValue : new Date(nowValue);
  if (!end || Number.isNaN(now.getTime())) return 0;

  // A date-only deadline represents the end of that calendar day in Hong Kong.
  const endOfDayHongKong = end.getTime() + DAY_MS - HONG_KONG_UTC_OFFSET_MS - 1;
  return Math.max(0, endOfDayHongKong - now.getTime());
}

function countdownBreakdownFromMilliseconds(milliseconds) {
  const safeMilliseconds = Math.max(0, Number(milliseconds) || 0);
  const minutes = Math.floor(safeMilliseconds / MINUTE_MS);
  const days = Math.floor(safeMilliseconds / DAY_MS);
  const months = Math.floor(days / 30);
  const monthWeeks = Math.floor((days % 30) / 7);
  const weeks = Math.floor(days / 7);
  const weekDays = days % 7;
  const hours = Math.floor(minutes / 60);
  return {
    days,
    months,
    monthWeeks,
    weeks,
    weekDays,
    hours,
    hourMinutes: minutes % 60,
    minutes
  };
}

export function formatEstimatedMinutes(value) {
  const minutes = Math.max(0, Math.round(Number(value) || 0));
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} 分鐘`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} 小時 ${remainder} 分鐘` : `${hours} 小時`;
}

export function spanBounds(entries, entry) {
  if (!entry) return null;
  const members = entry.spanGroupId
    ? entries.filter((candidate) => candidate.spanGroupId === entry.spanGroupId)
    : [entry];
  const dates = members.map((member) => member.scheduleDate).sort();
  return {
    start: dates[0],
    end: dates[dates.length - 1],
    length: dates.length
  };
}

export function isAdjacentSpanTarget(entries, entry, targetDate) {
  const bounds = spanBounds(entries, entry);
  const target = parseDateOnly(targetDate);
  const start = parseDateOnly(bounds?.start);
  const end = parseDateOnly(bounds?.end);
  if (!target || !start || !end) return false;
  const targetTime = target.getTime();
  return targetTime === start.getTime() - DAY_MS || targetTime === end.getTime() + DAY_MS;
}

export function spanLaneLayout(entries, dates = []) {
  const dateSet = new Set(dates.map(String));
  const groups = new Map();

  for (const entry of Array.isArray(entries) ? entries : []) {
    if (!entry?.spanGroupId || !entry.scheduleDate) continue;
    if (dateSet.size && !dateSet.has(String(entry.scheduleDate))) continue;
    const id = String(entry.spanGroupId);
    if (!groups.has(id)) groups.set(id, { id, dates: new Set() });
    groups.get(id).dates.add(String(entry.scheduleDate));
  }

  const orderedGroups = [...groups.values()]
    .map((group) => {
      const memberDates = [...group.dates].sort();
      return { id: group.id, dates: memberDates, start: memberDates[0], end: memberDates.at(-1) };
    })
    .sort((left, right) => (
      left.start.localeCompare(right.start)
      || left.end.localeCompare(right.end)
      || left.id.localeCompare(right.id)
    ));

  const laneEnds = [];
  const laneByGroup = {};
  for (const group of orderedGroups) {
    let lane = laneEnds.findIndex((end) => end < group.start);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = group.end;
    laneByGroup[group.id] = lane;
  }

  const visibleDates = dateSet.size
    ? [...dateSet]
    : [...new Set(orderedGroups.flatMap((group) => group.dates))].sort();
  const cells = Object.fromEntries(visibleDates.map((date) => [date, Array(laneEnds.length).fill(null)]));
  for (const group of orderedGroups) {
    const lane = laneByGroup[group.id];
    for (const date of group.dates) {
      if (cells[date]) cells[date][lane] = group.id;
    }
  }

  return {
    laneCount: laneEnds.length,
    laneByGroup,
    cells
  };
}

export function countdownBreakdown(startValue, endValue) {
  const start = parseDateOnly(startValue);
  const end = parseDateOnly(endValue);
  if (!start || !end || end < start) {
    return emptyCountdownBreakdown();
  }

  const days = Math.floor((end.getTime() - start.getTime()) / DAY_MS);
  const months = Math.floor(days / 30);
  const monthWeeks = Math.floor((days % 30) / 7);
  const weeks = Math.floor(days / 7);
  const weekDays = days % 7;
  const minutes = days * 24 * 60;
  const hours = Math.floor(minutes / 60);
  return {
    days,
    months,
    monthWeeks,
    weeks,
    weekDays,
    hours,
    hourMinutes: minutes % 60,
    minutes
  };
}

export function countdownBreakdownFromHongKongNow(endValue, nowValue = new Date()) {
  return countdownBreakdownFromMilliseconds(remainingHongKongMilliseconds(endValue, nowValue));
}

export function studyHoursBefore(startValue, endValue, dailyHours) {
  const { days } = countdownBreakdown(startValue, endValue);
  const hours = Math.max(0, Number(dailyHours) || 0) * days;
  return Math.round(hours * 100) / 100;
}

export function studyHoursFromHongKongNow(endValue, dailyHours, nowValue = new Date()) {
  const durationInDays = remainingHongKongMilliseconds(endValue, nowValue) / DAY_MS;
  const hours = Math.max(0, Number(dailyHours) || 0) * durationInDays;
  return Math.round(hours * 100) / 100;
}

export function planCountdownCapacityChange(
  currentValue,
  deltaValue,
  {
    savedPositions = [],
    dirtyPositions = [],
    maximum = COUNTDOWN_MAX_CAPACITY,
    batchSize = COUNTDOWN_BATCH_SIZE,
    initialCapacity = COUNTDOWN_INITIAL_CAPACITY
  } = {}
) {
  const current = Number(currentValue);
  const delta = Number(deltaValue);
  if (
    !Number.isInteger(batchSize)
    || batchSize < 1
    || !Number.isInteger(current)
    || !Number.isInteger(initialCapacity)
    || initialCapacity < 1
    || current < initialCapacity
    || current > maximum
    || (current - initialCapacity) % batchSize !== 0
    || ![-batchSize, batchSize].includes(delta)
  ) {
    return { allowed: false, reason: "invalid", current, target: current };
  }
  const target = current + delta;
  if (target < initialCapacity || target > maximum) return { allowed: false, reason: "bounds", current, target };

  const dirtyAbove = dirtyPositions.map(Number).filter((position) => position > target).sort((a, b) => a - b);
  if (delta < 0 && dirtyAbove.length) {
    return { allowed: false, reason: "dirty", current, target, blockedPositions: dirtyAbove };
  }
  const savedAbove = savedPositions.map(Number).filter((position) => position > target).sort((a, b) => a - b);
  if (delta < 0 && savedAbove.length) {
    return { allowed: false, reason: "saved", current, target, blockedPositions: savedAbove };
  }
  return {
    allowed: true,
    reason: "ok",
    current,
    target,
    createdPositions: delta > 0
      ? Array.from({ length: batchSize }, (_, index) => current + index + 1)
      : [],
    removedPositions: delta < 0
      ? Array.from({ length: batchSize }, (_, index) => target + index + 1)
      : []
  };
}
