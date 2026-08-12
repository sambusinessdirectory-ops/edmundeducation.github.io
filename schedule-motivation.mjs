export const MOTIVATION_SAVE_DELAY_MS = 2000;

export function normalizeMotivationRating(value) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

export function motivationRatingsByDate(rows) {
  const ratings = {};
  for (const row of Array.isArray(rows) ? rows : []) {
    const scheduleDate = typeof row?.scheduleDate === "string"
      ? row.scheduleDate
      : typeof row?.schedule_date === "string"
        ? row.schedule_date
        : "";
    const rating = normalizeMotivationRating(row?.rating);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduleDate) || rating === null) continue;
    ratings[scheduleDate] = {
      rating,
      persistedRating: rating,
      updatedAt: row?.updatedAt || row?.updated_at || null
    };
  }
  return ratings;
}

export function spreadsheetSafeText(value) {
  const text = String(value ?? "");
  return /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
}

export function csvCell(value) {
  const safe = spreadsheetSafeText(value);
  return `"${safe.replaceAll('"', '""')}"`;
}

export function motivationRatingsCsv(rows) {
  const header = ["學生名稱", "日期", "動力指數", "最後更新"];
  const lines = [header.map(csvCell).join(",")];
  for (const row of Array.isArray(rows) ? rows : []) {
    lines.push([
      row?.student_name ?? row?.studentName ?? "",
      row?.schedule_date ?? row?.scheduleDate ?? "",
      normalizeMotivationRating(row?.rating) ?? "",
      row?.updated_at ?? row?.updatedAt ?? ""
    ].map(csvCell).join(","));
  }
  return `\uFEFF${lines.join("\r\n")}`;
}
