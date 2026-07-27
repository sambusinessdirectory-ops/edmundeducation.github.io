import {
  SCHEDULE_MAX_DATE,
  SCHEDULE_MIN_DATE,
  parseISODate,
  weekDates
} from "./schedule-calendar.mjs";

export const SCHEDULE_CLIPBOARD_SCHEMA = "edmundeducation.schedule-slots";
export const SCHEDULE_CLIPBOARD_VERSION = 1;
export const SCHEDULE_CLIPBOARD_PREFIX = "EDMUND-SCHEDULE-CLIPBOARD/1\n";
export const SCHEDULE_CLIPBOARD_MAX_ITEMS = 700;
export const SCHEDULE_CLIPBOARD_MAX_BYTES = 524_288;
export const SCHEDULE_CLIPBOARD_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export class ScheduleClipboardError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ScheduleClipboardError";
    this.code = code;
  }
}

function clipboardError(code, message) {
  throw new ScheduleClipboardError(code, message);
}

function utf8Length(value) {
  const text = String(value || "");
  if (typeof TextEncoder === "function") return new TextEncoder().encode(text).length;
  return unescape(encodeURIComponent(text)).length;
}

function normalizeWeekStart(value) {
  const weekStart = String(value || "");
  let date;
  try {
    date = parseISODate(weekStart);
  } catch {
    clipboardError("invalid-week", "複製資料的星期格式不正確。");
  }
  if (date.getDay() !== 1) clipboardError("invalid-week", "複製資料必須以星期一開始。");
  return weekStart;
}

function normalizeEstimatedMinutes(value) {
  if (value === null || value === undefined || value === "") return null;
  const minutes = Number(value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 10_080) {
    clipboardError("invalid-time", "複製資料包含無效的預計需時。");
  }
  return minutes;
}

function normalizeClipboardItem(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    clipboardError("invalid-item", "複製資料包含無效安排。");
  }
  const dayOffset = Number(item.dayOffset);
  const slotIndex = Number(item.slotIndex);
  const message = typeof item.message === "string" ? item.message : "";
  if (!Number.isInteger(dayOffset) || dayOffset < 0 || dayOffset > 6) {
    clipboardError("invalid-day", "複製資料包含無效星期位置。");
  }
  if (!Number.isInteger(slotIndex) || slotIndex < 1 || slotIndex > 100) {
    clipboardError("invalid-slot", "複製資料包含無效格數。");
  }
  if (!message.trim() || message.length > 2000) {
    clipboardError("invalid-message", "複製資料的安排內容無效或過長。");
  }
  return {
    dayOffset,
    slotIndex,
    message,
    estimatedMinutes: normalizeEstimatedMinutes(item.estimatedMinutes)
  };
}

function normalizeClipboardPayload(value, { now = Date.now(), maxAgeMs = SCHEDULE_CLIPBOARD_MAX_AGE_MS } = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    clipboardError("invalid-payload", "剪貼簿沒有有效的日程安排資料。");
  }
  if (value.schema !== SCHEDULE_CLIPBOARD_SCHEMA || Number(value.version) !== SCHEDULE_CLIPBOARD_VERSION) {
    clipboardError("unsupported-version", "剪貼簿內並非支援的日程安排格式。");
  }
  const sourceWeekStart = normalizeWeekStart(value.sourceWeekStart);
  const copiedAtDate = new Date(value.copiedAt);
  if (Number.isNaN(copiedAtDate.getTime())) {
    clipboardError("invalid-time", "複製資料的時間無效。");
  }
  if (copiedAtDate.getTime() > Number(now) + 5 * 60 * 1000) {
    clipboardError("future-payload", "複製資料的時間無效。");
  }
  if (Number.isFinite(maxAgeMs) && Number(now) - copiedAtDate.getTime() > maxAgeMs) {
    clipboardError("expired", "已複製的安排超過兩小時，請重新複製。");
  }
  if (!Array.isArray(value.items) || !value.items.length || value.items.length > SCHEDULE_CLIPBOARD_MAX_ITEMS) {
    clipboardError("invalid-count", `每次只可複製 1 至 ${SCHEDULE_CLIPBOARD_MAX_ITEMS} 項安排。`);
  }

  const positions = new Set();
  const items = value.items.map((item) => {
    const normalized = normalizeClipboardItem(item);
    const key = `${normalized.dayOffset}:${normalized.slotIndex}`;
    if (positions.has(key)) clipboardError("duplicate-position", "複製資料包含重複的星期及格數。");
    positions.add(key);
    return normalized;
  }).sort((left, right) => left.dayOffset - right.dayOffset || left.slotIndex - right.slotIndex);

  return {
    schema: SCHEDULE_CLIPBOARD_SCHEMA,
    version: SCHEDULE_CLIPBOARD_VERSION,
    copiedAt: copiedAtDate.toISOString(),
    sourceWeekStart,
    items
  };
}

export function createScheduleClipboardPayload({ entries = [], selectedEntryIds = [], weekStart, now = Date.now() } = {}) {
  const sourceWeekStart = normalizeWeekStart(weekStart);
  const dates = weekDates(sourceWeekStart);
  const selected = selectedEntryIds instanceof Set ? selectedEntryIds : new Set(selectedEntryIds);
  const chosen = (Array.isArray(entries) ? entries : []).filter((entry) => selected.has(entry?.id));
  if (!chosen.length) clipboardError("empty-selection", "請先選取至少一項安排。");
  if (chosen.some((entry) => entry?.spanGroupId)) {
    clipboardError("span-unsupported", "跨日項目暫不可複製；請取消選取跨日項目後再試。");
  }

  const items = chosen.map((entry) => {
    const dayOffset = dates.indexOf(String(entry.scheduleDate || ""));
    if (dayOffset < 0) clipboardError("outside-week", "所選安排不在目前顯示的星期內。");
    return normalizeClipboardItem({
      dayOffset,
      slotIndex: entry.slotIndex,
      message: entry.message,
      estimatedMinutes: entry.estimatedMinutes
    });
  });

  const payload = normalizeClipboardPayload({
    schema: SCHEDULE_CLIPBOARD_SCHEMA,
    version: SCHEDULE_CLIPBOARD_VERSION,
    copiedAt: new Date(now).toISOString(),
    sourceWeekStart,
    items
  }, { now, maxAgeMs: Infinity });

  if (utf8Length(JSON.stringify(payload)) > SCHEDULE_CLIPBOARD_MAX_BYTES) {
    clipboardError("too-large", "所選安排太多，請分批複製。");
  }
  return payload;
}

export function serializeScheduleClipboard(payload, options = {}) {
  const normalized = normalizeClipboardPayload(payload, options);
  const serialized = `${SCHEDULE_CLIPBOARD_PREFIX}${JSON.stringify(normalized)}`;
  if (utf8Length(serialized) > SCHEDULE_CLIPBOARD_MAX_BYTES) {
    clipboardError("too-large", "剪貼簿內的日程安排資料過大。");
  }
  return serialized;
}

export function parseScheduleClipboard(value, options = {}) {
  const text = String(value || "").trim();
  if (!text || utf8Length(text) > SCHEDULE_CLIPBOARD_MAX_BYTES) {
    clipboardError(text ? "too-large" : "empty", text ? "剪貼簿資料過大。" : "剪貼簿沒有日程安排資料。");
  }
  const jsonText = text.startsWith(SCHEDULE_CLIPBOARD_PREFIX.trim())
    ? text.slice(text.indexOf("\n") + 1)
    : text;
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    clipboardError("invalid-json", "剪貼簿內並非日程安排資料。");
  }
  return normalizeClipboardPayload(parsed, options);
}

export function planScheduleClipboardPaste({
  payload,
  targetWeekStart,
  entries = [],
  capacities = {},
  currentRole = "student",
  now = Date.now()
} = {}) {
  const normalized = normalizeClipboardPayload(payload, { now });
  const weekStart = normalizeWeekStart(targetWeekStart);
  const dates = weekDates(weekStart);
  const currentEntries = Array.isArray(entries) ? entries : [];
  const ready = [];
  const conflicts = [];
  const unchanged = [];

  for (const item of normalized.items) {
    const scheduleDate = dates[item.dayOffset];
    const target = {
      ...item,
      scheduleDate,
      key: `${scheduleDate}:${item.slotIndex}`
    };
    if (!scheduleDate || scheduleDate < SCHEDULE_MIN_DATE || scheduleDate > SCHEDULE_MAX_DATE) {
      conflicts.push({ ...target, reason: "outside-range" });
      continue;
    }
    const configuredCapacity = Number(capacities?.[scheduleDate]);
    const capacity = Number.isFinite(configuredCapacity)
      ? Math.max(10, Math.min(100, configuredCapacity))
      : 10;
    if (item.slotIndex > capacity) {
      conflicts.push({ ...target, reason: "outside-capacity", capacity });
      continue;
    }
    const existing = currentEntries.find((entry) => (
      entry?.scheduleDate === scheduleDate && Number(entry?.slotIndex) === item.slotIndex
    ));
    if (!existing) {
      ready.push(target);
      continue;
    }
    if (
      existing.message === item.message
      && (Number(existing.estimatedMinutes) || null) === item.estimatedMinutes
    ) {
      unchanged.push({ ...target, existingId: existing.id || null });
      continue;
    }
    conflicts.push({
      ...target,
      reason: existing.spanGroupId
        ? "span-occupied"
        : currentRole === "student" && existing.source === "admin"
          ? "protected"
          : "occupied",
      existingId: existing.id || null
    });
  }

  return {
    payload: normalized,
    targetWeekStart: weekStart,
    ready,
    conflicts,
    unchanged
  };
}
