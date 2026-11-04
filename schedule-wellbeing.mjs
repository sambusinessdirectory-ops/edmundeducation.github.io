export const WELLBEING_SAVE_DELAY_MS = 2000;

export const SELF_EVALUATION_DEFINITIONS = Object.freeze([
  Object.freeze({
    key: "motivation",
    label: "今天的動力指數",
    shortLabel: "動力",
    preferenceKey: "collapseMotivation",
    lowIsChallenging: true
  }),
  Object.freeze({
    key: "confidence",
    label: "今天的自信評分",
    shortLabel: "自信",
    preferenceKey: "collapseConfidence",
    lowIsChallenging: true
  }),
  Object.freeze({
    key: "concentration",
    label: "集中精神程度",
    shortLabel: "集中程度",
    preferenceKey: "collapseConcentration",
    lowIsChallenging: true
  }),
  Object.freeze({
    key: "attention-span",
    label: "專注力持續時間評分",
    shortLabel: "專注持續",
    preferenceKey: "collapseAttentionSpan",
    lowIsChallenging: true
  }),
  Object.freeze({
    key: "stress",
    label: "壓力評分",
    shortLabel: "壓力",
    preferenceKey: "collapseStress",
    highIsChallenging: true
  }),
  Object.freeze({
    key: "homework-difficulty",
    label: "功課難度評分",
    shortLabel: "功課難度",
    preferenceKey: "collapseHomeworkDifficulty",
    highIsChallenging: true
  })
]);

export const WELLBEING_METRIC_KEYS = Object.freeze(
  SELF_EVALUATION_DEFINITIONS.filter((definition) => definition.key !== "motivation")
    .map((definition) => definition.key)
);

const DEFINITION_BY_KEY = new Map(
  SELF_EVALUATION_DEFINITIONS.map((definition) => [definition.key, definition])
);

export function selfEvaluationDefinition(key) {
  return DEFINITION_BY_KEY.get(String(key || "")) || null;
}

export function normalizeWellbeingMetric(value) {
  const metric = String(value || "");
  return WELLBEING_METRIC_KEYS.includes(metric) ? metric : null;
}

export function wellbeingRatingsByMetricAndDate(rows) {
  const ratings = Object.fromEntries(WELLBEING_METRIC_KEYS.map((metric) => [metric, {}]));
  for (const row of Array.isArray(rows) ? rows : []) {
    const metric = normalizeWellbeingMetric(row?.metric);
    const scheduleDate = typeof row?.scheduleDate === "string"
      ? row.scheduleDate
      : typeof row?.schedule_date === "string"
        ? row.schedule_date
        : "";
    const rating = Number(row?.rating);
    if (!metric || !/^\d{4}-\d{2}-\d{2}$/.test(scheduleDate)
      || !Number.isInteger(rating) || rating < 1 || rating > 5) continue;
    ratings[metric][scheduleDate] = {
      rating,
      persistedRating: rating,
      updatedAt: row?.updatedAt || row?.updated_at || null
    };
  }
  return ratings;
}

export function selfEvaluationRatingsForDate(motivationRatings, wellbeingRatings, scheduleDate) {
  const values = {};
  const motivation = Number(motivationRatings?.[scheduleDate]?.rating);
  if (Number.isInteger(motivation) && motivation >= 1 && motivation <= 5) {
    values.motivation = motivation;
  }
  for (const metric of WELLBEING_METRIC_KEYS) {
    const rating = Number(wellbeingRatings?.[metric]?.[scheduleDate]?.rating);
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) values[metric] = rating;
  }
  return values;
}

export function shouldLimitHomeworkSlots(motivationRatings, wellbeingRatings, scheduleDate) {
  const ratings = selfEvaluationRatingsForDate(motivationRatings, wellbeingRatings, scheduleDate);
  return SELF_EVALUATION_DEFINITIONS.some((definition) => {
    const rating = ratings[definition.key];
    if (!Number.isInteger(rating)) return false;
    return (definition.lowIsChallenging && rating <= 2)
      || (definition.highIsChallenging && rating >= 4);
  });
}

export function normalizeRatingCollapsePreferences(value) {
  return Object.fromEntries(SELF_EVALUATION_DEFINITIONS.map((definition) => [
    definition.key,
    value?.[definition.preferenceKey] === true || value?.ratingCollapsed?.[definition.key] === true
  ]));
}

export function spreadsheetSafeSelfEvaluationText(value) {
  const text = String(value ?? "");
  return /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
}

function csvCell(value) {
  const safe = spreadsheetSafeSelfEvaluationText(value);
  return `"${safe.replaceAll('"', '""')}"`;
}

export function selfEvaluationRatingsCsv(rows) {
  const header = ["學生名稱", "日期", "自評項目", "評分", "最後更新"];
  const lines = [header.map(csvCell).join(",")];
  for (const row of Array.isArray(rows) ? rows : []) {
    const definition = selfEvaluationDefinition(row?.metric);
    const rating = Number(row?.rating);
    lines.push([
      row?.student_name ?? row?.studentName ?? "",
      row?.schedule_date ?? row?.scheduleDate ?? "",
      definition?.label || "",
      Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : "",
      row?.updated_at ?? row?.updatedAt ?? ""
    ].map(csvCell).join(","));
  }
  return `\uFEFF${lines.join("\r\n")}`;
}

export function normalizeLearningPurposePayload(value) {
  const id = /^[0-9a-f-]{36}$/i.test(String(value?.id || "")) ? String(value.id) : "";
  const totalCount = Math.max(0, Number(value?.totalCount ?? value?.total_count) || 0);
  const position = Math.max(0, Number(value?.position) || 0);
  const normalizeId = (candidate) => (
    /^[0-9a-f-]{36}$/i.test(String(candidate || "")) ? String(candidate) : ""
  );
  return {
    id,
    message: id ? String(value?.message || "").slice(0, 1000) : "",
    updatedAt: id ? value?.updatedAt || value?.updated_at || null : null,
    totalCount,
    position: id ? Math.min(Math.max(1, position), Math.max(1, totalCount)) : 0,
    olderId: normalizeId(value?.olderId ?? value?.older_id),
    newerId: normalizeId(value?.newerId ?? value?.newer_id),
    isLatest: Boolean(id && (value?.isLatest === true || value?.is_latest === true))
  };
}
