export const STUDENT_PROGRESS_TIME_ZONE = "Asia/Hong_Kong";

export const STUDENT_PROGRESS_RANGES = Object.freeze([
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "half-year", label: "Half a Year" },
  { id: "ytd", label: "Year to Date" },
  { id: "year", label: "1 Year" },
  { id: "all", label: "All Time" }
]);

export const STUDENT_PROGRESS_SOURCES = Object.freeze([
  {
    id: "flashcards",
    labelZh: "Flashcard 學習卡",
    labelEn: "Flashcard System",
    href: "flashcards.html",
    color: "#2563eb",
    activityTitle: "完成學習卡走勢",
    activityUnit: "張卡片",
    primaryMetric: "total",
    activitySeries: [
      { key: "total", label: "總完成", color: "#2563eb" },
      { key: "green", label: "綠勾", color: "#16a34a" },
      { key: "red", label: "紅叉", color: "#dc2626" }
    ]
  },
  {
    id: "writingPractice",
    labelZh: "英文寫作練習",
    labelEn: "Writing Practice",
    href: "writing-practice.html",
    color: "#7c3aed",
    activityTitle: "完成寫作題目走勢",
    activityUnit: "道題目",
    primaryMetric: "questions",
    activitySeries: [
      { key: "questions", label: "完成題目", color: "#7c3aed" },
      { key: "attempts", label: "練習紀錄", color: "#c026d3" }
    ]
  },
  {
    id: "sentenceStructure",
    labelZh: "句子結構",
    labelEn: "Sentence Structure",
    href: "sentence-structure.html",
    color: "#0f6bdc",
    activityTitle: "完成句子結構題目走勢",
    activityUnit: "道題目",
    primaryMetric: "questions",
    activitySeries: [{ key: "questions", label: "完成題目", color: "#0f6bdc" }]
  },
  {
    id: "speaking",
    labelZh: "Speaking 說話練習",
    labelEn: "Speaking System",
    href: "speaking-system.html",
    color: "#0f8f8f",
    activityTitle: "完成錄音走勢",
    activityUnit: "段錄音",
    primaryMetric: "recordings",
    activitySeries: [{ key: "recordings", label: "完成錄音", color: "#0f8f8f" }]
  },
  {
    id: "phrasalVerbs",
    labelZh: "Phrasal Verb 動詞片語",
    labelEn: "Phrasal Verb System",
    href: "phrasal-verb-system.html",
    color: "#15803d",
    activityTitle: "完成動詞片語題目走勢",
    activityUnit: "道題目",
    primaryMetric: "questions",
    activitySeries: [{ key: "questions", label: "完成題目", color: "#15803d" }]
  },
  {
    id: "idioms",
    labelZh: "英文慣用語",
    labelEn: "Idiom Learning",
    href: "idiom-system.html",
    color: "#dc4b22",
    activityTitle: "完成慣用語題目走勢",
    activityUnit: "道題目",
    primaryMetric: "questions",
    activitySeries: [{ key: "questions", label: "完成題目", color: "#dc4b22" }]
  },
  {
    id: "proverbs",
    labelZh: "諺語",
    labelEn: "Proverb System",
    href: "proverb-system.html",
    color: "#a16207",
    activityTitle: "完成諺語題目走勢",
    activityUnit: "道題目",
    primaryMetric: "questions",
    activitySeries: [{ key: "questions", label: "完成題目", color: "#a16207" }]
  },
  {
    id: "commonExpressionSpeaking",
    labelZh: "常用語會話",
    labelEn: "Common Expression Speaking",
    href: "common-expression-speaking.html",
    color: "#0891b2",
    activityTitle: "完成常用語會話題目走勢",
    activityUnit: "道題目",
    primaryMetric: "questions",
    activitySeries: [{ key: "questions", label: "完成題目", color: "#0891b2" }]
  },
  {
    id: "commonExpressionWritten",
    labelZh: "常用語專業寫作",
    labelEn: "Common Expression Written",
    href: "common-expression-written.html",
    color: "#4f46e5",
    activityTitle: "完成常用語專業寫作題目走勢",
    activityUnit: "道題目",
    primaryMetric: "questions",
    activitySeries: [{ key: "questions", label: "完成題目", color: "#4f46e5" }]
  },
  {
    id: "commonExpressionRhetoricalSpeaking",
    labelZh: "常用語修辭會話",
    labelEn: "Common Expression Rhetorical Speaking",
    href: "common-expression-rhetorical-speaking.html",
    color: "#9333ea",
    activityTitle: "完成常用語修辭會話題目走勢",
    activityUnit: "道題目",
    primaryMetric: "questions",
    activitySeries: [{ key: "questions", label: "完成題目", color: "#9333ea" }]
  },
  {
    id: "commonExpressionRhetoricalWriting",
    labelZh: "常用語修辭寫作",
    labelEn: "Common Expression Rhetorical Writing",
    href: "common-expression-rhetorical-writing.html",
    color: "#c026d3",
    activityTitle: "完成常用語修辭寫作題目走勢",
    activityUnit: "道題目",
    primaryMetric: "questions",
    activitySeries: [{ key: "questions", label: "完成題目", color: "#c026d3" }]
  },
  {
    id: "commonExpressionProfessionalMessage",
    labelZh: "常用語商業溝通",
    labelEn: "Common Expression Professional Message",
    href: "common-expression-professional-message.html",
    color: "#ea580c",
    activityTitle: "完成常用語商業溝通題目走勢",
    activityUnit: "道題目",
    primaryMetric: "questions",
    activitySeries: [{ key: "questions", label: "完成題目", color: "#ea580c" }]
  },
  {
    id: "commonExpressionBusinessSpeaking",
    labelZh: "常用語商務會話",
    labelEn: "Common Expression Business Speaking",
    href: "common-expression-business-speaking.html",
    color: "#0f766e",
    activityTitle: "完成常用語商務會話題目走勢",
    activityUnit: "道題目",
    primaryMetric: "questions",
    activitySeries: [{ key: "questions", label: "完成題目", color: "#0f766e" }]
  },
  {
    id: "writingSubmission",
    labelZh: "Edmund Sir Writing 交文",
    labelEn: "Writing Submission",
    href: "writing-submission.html",
    color: "#be123c",
    activityTitle: "完成文章走勢",
    activityUnit: "篇文章",
    primaryMetric: "articles",
    activitySeries: [{ key: "articles", label: "完成文章", color: "#be123c" }]
  }
]);

const RANGE_IDS = new Set(STUDENT_PROGRESS_RANGES.map(({ id }) => id));

export function localDayKey(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dateFromDayKey(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return localDayKey(date) === value ? date : null;
}

export function addLocalDays(value, amount) {
  const date = value instanceof Date ? new Date(value) : dateFromDayKey(value);
  if (!date) return null;
  date.setDate(date.getDate() + Number(amount || 0));
  return date;
}

function rangeStart(rangeKey, availableDayKeys, nowValue) {
  const range = RANGE_IDS.has(rangeKey) ? rangeKey : "month";
  const now = nowValue instanceof Date ? new Date(nowValue) : new Date(nowValue || Date.now());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "week") return addLocalDays(end, -6);
  if (range === "month") return addLocalDays(end, -29);
  if (range === "half-year") return addLocalDays(end, -181);
  if (range === "ytd") return new Date(end.getFullYear(), 0, 1);
  if (range === "year") return addLocalDays(end, -364);
  if (range === "all") {
    const dates = availableDayKeys.map(dateFromDayKey).filter(Boolean).filter((date) => date <= end);
    if (dates.length) return new Date(Math.min(...dates.map((date) => date.getTime())));
  }
  return addLocalDays(end, -29);
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

export function normalizeProgressSnapshot(value) {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const rawSources = raw.sources && typeof raw.sources === "object" && !Array.isArray(raw.sources)
    ? raw.sources
    : {};
  const sources = {};
  for (const definition of STUDENT_PROGRESS_SOURCES) {
    const source = rawSources[definition.id] && typeof rawSources[definition.id] === "object"
      ? rawSources[definition.id]
      : {};
    sources[definition.id] = {
      activityDays: Array.isArray(source.activityDays) ? source.activityDays.filter((day) => localDayKey(day?.date)) : [],
      timeDays: Array.isArray(source.timeDays) ? source.timeDays.filter((day) => localDayKey(day?.date)) : []
    };
  }
  return {
    schemaVersion: Number(raw.schemaVersion || 1),
    generatedAt: String(raw.generatedAt || ""),
    timeZone: String(raw.timeZone || STUDENT_PROGRESS_TIME_ZONE),
    student: {
      id: String(raw.student?.id || ""),
      name: String(raw.student?.name || "")
    },
    sources
  };
}

function sourceTimeRows(snapshot, sourceId) {
  return snapshot.sources[sourceId]?.timeDays || [];
}

export function buildMasterTimeSeries(snapshotValue, rangeKey = "month", nowValue = new Date()) {
  const snapshot = normalizeProgressSnapshot(snapshotValue);
  const rowsBySource = new Map();
  const availableKeys = [];
  const now = nowValue instanceof Date ? new Date(nowValue) : new Date(nowValue || Date.now());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const definition of STUDENT_PROGRESS_SOURCES) {
    const byDay = new Map();
    for (const row of sourceTimeRows(snapshot, definition.id)) {
      const key = localDayKey(row?.date);
      const date = dateFromDayKey(key);
      if (!date || date > end) continue;
      byDay.set(key, (byDay.get(key) || 0) + positiveNumber(row.totalMs));
      availableKeys.push(key);
    }
    rowsBySource.set(definition.id, byDay);
  }

  const start = rangeStart(rangeKey, availableKeys, now);
  const cumulative = {};
  const allTimeBySystem = {};
  for (const definition of STUDENT_PROGRESS_SOURCES) {
    const byDay = rowsBySource.get(definition.id);
    let before = 0;
    let allTime = 0;
    for (const [key, totalMs] of byDay) {
      const date = dateFromDayKey(key);
      allTime += totalMs;
      if (date < start) before += totalMs;
    }
    cumulative[definition.id] = before;
    allTimeBySystem[definition.id] = allTime;
  }

  const points = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = new Date(cursor);
    const key = localDayKey(date);
    const systems = {};
    const cumulativeSystems = {};
    let totalMs = 0;
    let cumulativeTotalMs = 0;
    for (const definition of STUDENT_PROGRESS_SOURCES) {
      const daily = rowsBySource.get(definition.id).get(key) || 0;
      systems[definition.id] = daily;
      totalMs += daily;
      cumulative[definition.id] += daily;
      cumulativeSystems[definition.id] = cumulative[definition.id];
      cumulativeTotalMs += cumulative[definition.id];
    }
    points.push({ date, key, systems, totalMs, cumulativeSystems, cumulativeTotalMs });
  }

  return {
    points,
    allTimeBySystem,
    allTimeTotalMs: Object.values(allTimeBySystem).reduce((sum, value) => sum + value, 0),
    periodTotalMs: points.reduce((sum, point) => sum + point.totalMs, 0)
  };
}

export function buildActivitySeries(snapshotValue, sourceId, rangeKey = "month", nowValue = new Date()) {
  const snapshot = normalizeProgressSnapshot(snapshotValue);
  const definition = STUDENT_PROGRESS_SOURCES.find((source) => source.id === sourceId);
  if (!definition) return { points: [], totals: {}, allTimeTotals: {}, primaryTotal: 0 };
  const rows = snapshot.sources[sourceId]?.activityDays || [];
  const now = nowValue instanceof Date ? new Date(nowValue) : new Date(nowValue || Date.now());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const byDay = new Map();
  const availableKeys = [];
  for (const row of rows) {
    const key = localDayKey(row?.date);
    const date = dateFromDayKey(key);
    if (!date || date > end) continue;
    const values = byDay.get(key) || {};
    for (const series of definition.activitySeries) {
      values[series.key] = positiveNumber(values[series.key]) + positiveNumber(row[series.key]);
    }
    byDay.set(key, values);
    availableKeys.push(key);
  }
  const start = rangeStart(rangeKey, availableKeys, now);
  const allTimeTotals = Object.fromEntries(definition.activitySeries.map(({ key }) => [key, 0]));
  const cumulativeBefore = Object.fromEntries(definition.activitySeries.map(({ key }) => [key, 0]));
  for (const [key, values] of byDay) {
    const date = dateFromDayKey(key);
    for (const series of definition.activitySeries) {
      allTimeTotals[series.key] += positiveNumber(values[series.key]);
      if (date < start) cumulativeBefore[series.key] += positiveNumber(values[series.key]);
    }
  }
  const points = [];
  const cumulative = { ...cumulativeBefore };
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = new Date(cursor);
    const key = localDayKey(date);
    const values = byDay.get(key) || {};
    const point = { date, key };
    for (const series of definition.activitySeries) {
      point[series.key] = positiveNumber(values[series.key]);
      cumulative[series.key] += point[series.key];
      point[`cumulative_${series.key}`] = cumulative[series.key];
    }
    points.push(point);
  }
  const totals = Object.fromEntries(definition.activitySeries.map(({ key }) => [
    key,
    points.reduce((sum, point) => sum + positiveNumber(point[key]), 0)
  ]));
  return {
    definition,
    points,
    totals,
    allTimeTotals,
    primaryTotal: allTimeTotals[definition.primaryMetric] || 0
  };
}

export function buildSourceTimeSeries(snapshotValue, sourceId, rangeKey = "month", nowValue = new Date()) {
  const snapshot = normalizeProgressSnapshot(snapshotValue);
  const rows = snapshot.sources[sourceId]?.timeDays || [];
  const now = nowValue instanceof Date ? new Date(nowValue) : new Date(nowValue || Date.now());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const byDay = new Map();
  const availableKeys = [];
  for (const row of rows) {
    const key = localDayKey(row?.date);
    const date = dateFromDayKey(key);
    if (!date || date > end) continue;
    byDay.set(key, (byDay.get(key) || 0) + positiveNumber(row.totalMs));
    availableKeys.push(key);
  }
  const start = rangeStart(rangeKey, availableKeys, now);
  let cumulativeMs = 0;
  let allTimeMs = 0;
  for (const [key, totalMs] of byDay) {
    const date = dateFromDayKey(key);
    allTimeMs += totalMs;
    if (date < start) cumulativeMs += totalMs;
  }
  const points = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = new Date(cursor);
    const key = localDayKey(date);
    const totalMs = byDay.get(key) || 0;
    cumulativeMs += totalMs;
    points.push({ date, key, totalMs, cumulativeMs });
  }
  return {
    points,
    allTimeMs,
    periodTotalMs: points.reduce((sum, point) => sum + point.totalMs, 0)
  };
}

export function buildWritingAverageSeries(snapshotValue, rangeKey = "month", nowValue = new Date()) {
  const snapshot = normalizeProgressSnapshot(snapshotValue);
  const now = nowValue instanceof Date ? new Date(nowValue) : new Date(nowValue || Date.now());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rows = (snapshot.sources.writingSubmission?.activityDays || []).filter((row) => {
    const date = dateFromDayKey(localDayKey(row?.date));
    return date && date <= end;
  });
  const availableKeys = rows.map((row) => localDayKey(row?.date)).filter(Boolean);
  const start = rangeStart(rangeKey, availableKeys, now);
  const byDay = new Map(rows.map((row) => [localDayKey(row?.date), row]));
  const points = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = new Date(cursor);
    const key = localDayKey(date);
    const row = byDay.get(key) || {};
    const articles = positiveNumber(row.articles);
    const totalMs = positiveNumber(row.totalMs);
    points.push({ date, key, averageMs: articles ? totalMs / articles : 0 });
  }
  const allArticles = rows.reduce((sum, row) => sum + positiveNumber(row.articles), 0);
  const allTimeMs = rows.reduce((sum, row) => sum + positiveNumber(row.totalMs), 0);
  return { points, allTimeAverageMs: allArticles ? allTimeMs / allArticles : 0 };
}

export function formatProgressDuration(milliseconds, { compact = false } = {}) {
  const totalSeconds = Math.max(0, Math.round(positiveNumber(milliseconds) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (compact) {
    if (hours) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
    if (minutes) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
    return `${seconds}s`;
  }
  if (hours) return `${hours} 小時 ${String(minutes).padStart(2, "0")} 分 ${String(seconds).padStart(2, "0")} 秒`;
  if (minutes) return `${minutes} 分 ${String(seconds).padStart(2, "0")} 秒`;
  return `${seconds} 秒`;
}

export function niceProgressMaximum(value) {
  const maximum = Math.max(1, positiveNumber(value));
  const magnitude = 10 ** Math.floor(Math.log10(maximum));
  const normalized = maximum / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

export function progressPolyline(points, valueFor, dimensions, maximum) {
  const width = dimensions.width - dimensions.left - dimensions.right;
  const height = dimensions.height - dimensions.top - dimensions.bottom;
  const denominator = Math.max(points.length - 1, 1);
  const yMax = Math.max(1, positiveNumber(maximum));
  return points.map((point, index) => {
    const x = dimensions.left + (width * index / denominator);
    const y = dimensions.top + height - (height * positiveNumber(valueFor(point)) / yMax);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}
