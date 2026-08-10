function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDateDays(value, days) {
  const date = parseDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + Number(days));
  return formatDate(date);
}

function dateDifference(left, right) {
  const leftDate = parseDate(left);
  const rightDate = parseDate(right);
  if (!leftDate || !rightDate) return null;
  return Math.round((leftDate.getTime() - rightDate.getTime()) / 86400000);
}

function entryCellKey(entry) {
  return `${entry.scheduleDate}:${Number(entry.slotIndex)}`;
}

export class ScheduleGroupShiftError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ScheduleGroupShiftError";
    this.code = code;
  }
}

/**
 * Plans one collision-safe group shift for Mass Edit. The dragged anchor lands
 * on targetDate; every other selected entry keeps its relative day and slot.
 * Existing non-selected cells are never overwritten. During a move, selected
 * source cells may receive another selected item because they are vacated by
 * the same atomic group operation; copies continue to treat them as occupied.
 */
export function planScheduleGroupShift({
  entries,
  selectedEntryIds,
  anchorEntryId,
  targetDate,
  weekStart,
  capacities,
  copy = false,
  currentRole = "student"
}) {
  const allEntries = Array.isArray(entries) ? entries : [];
  const selectedIds = new Set(selectedEntryIds || []);
  const selected = allEntries.filter((entry) => selectedIds.has(entry.id));
  const anchor = selected.find((entry) => entry.id === anchorEntryId);
  if (!anchor || !selected.length) {
    throw new ScheduleGroupShiftError("selection", "請先選取要一起拖動的安排。");
  }
  if (selected.some((entry) => entry.spanGroupId)) {
    throw new ScheduleGroupShiftError("span", "跨日項目暫不可加入群組拖動。");
  }
  if (selected.some((entry) => (
    Number(entry.isCompleted === true)
    + Number(entry.isInProgress === true)
    + Number(entry.isMoreThanHalfCompleted === true)
    + Number(entry.isPreviousIncomplete === true)
  ) > 1)) {
    throw new ScheduleGroupShiftError("status", "所選安排的狀態資料不一致，請重新載入後再試。");
  }
  if (!copy && currentRole === "student" && selected.some((entry) => entry.source === "admin")) {
    throw new ScheduleGroupShiftError("protected", "老師安排只可由管理員移動；按住 Option／Alt 可複製到空白日期。");
  }

  const offsetDays = dateDifference(targetDate, anchor.scheduleDate);
  if (!Number.isInteger(offsetDays) || offsetDays === 0) {
    throw new ScheduleGroupShiftError("same-day", "請把所選安排拖到另一個日期欄。");
  }
  const weekDates = Array.from({ length: 7 }, (_, index) => addDateDays(weekStart, index));
  if (weekDates.some((date) => !date)) {
    throw new ScheduleGroupShiftError("week", "目前星期資料無效，請重新載入。");
  }
  const weekDateSet = new Set(weekDates);
  const occupied = new Map(allEntries
    .filter((entry) => copy || !selectedIds.has(entry.id))
    .map((entry) => [entryCellKey(entry), entry]));
  const targets = [];
  const targetKeys = new Set();

  for (const entry of selected) {
    const shiftedDate = addDateDays(entry.scheduleDate, offsetDays);
    const slotIndex = Number(entry.slotIndex);
    if (!shiftedDate || !weekDateSet.has(shiftedDate)) {
      throw new ScheduleGroupShiftError("boundary", "所選安排會超出目前星期，未有作出修改。");
    }
    const capacity = Math.max(0, Number(capacities?.[shiftedDate]) || 10);
    if (!Number.isInteger(slotIndex) || slotIndex < 1 || slotIndex > capacity) {
      throw new ScheduleGroupShiftError("capacity", "目標日期沒有足夠相同格數，未有作出修改。");
    }
    const key = `${shiftedDate}:${slotIndex}`;
    if (targetKeys.has(key) || occupied.has(key)) {
      throw new ScheduleGroupShiftError("collision", "目標日期的對應格已有安排；系統不會覆蓋任何內容。");
    }
    targetKeys.add(key);
    targets.push({
      sourceEntry: entry,
      scheduleDate: shiftedDate,
      slotIndex,
      message: entry.message,
      estimatedMinutes: Number(entry.estimatedMinutes) || null,
      source: copy
        ? (currentRole === "admin" ? "admin" : "student")
        : entry.source,
      isCompleted: entry.isCompleted === true,
      isInProgress: entry.isInProgress === true,
      isMoreThanHalfCompleted: entry.isMoreThanHalfCompleted === true,
      isPreviousIncomplete: entry.isPreviousIncomplete === true
    });
  }

  return Object.freeze({
    copy: Boolean(copy),
    offsetDays,
    anchorEntryId,
    items: Object.freeze(targets)
  });
}
