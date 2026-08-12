import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  MOTIVATION_SAVE_DELAY_MS,
  motivationRatingsByDate,
  motivationRatingsCsv,
  normalizeMotivationRating,
  spreadsheetSafeText
} from "../schedule-motivation.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [html, js, adminHtml, adminJs, sql] = await Promise.all([
  read("schedule-system.html"),
  read("schedule-system.js"),
  read("schedule-motivation-admin.html"),
  read("schedule-motivation-admin.js"),
  read("supabase-schedule-daily-motivation.sql")
]);

assert.equal(MOTIVATION_SAVE_DELAY_MS, 2000);
assert.equal(normalizeMotivationRating(1), 1);
assert.equal(normalizeMotivationRating("5"), 5);
assert.equal(normalizeMotivationRating(0), null);
assert.equal(normalizeMotivationRating(6), null);
assert.equal(normalizeMotivationRating(2.5), null);
assert.deepEqual(motivationRatingsByDate([
  { scheduleDate: "2026-08-12", rating: 5, updatedAt: "now" },
  { schedule_date: "2026-08-13", rating: "3", updated_at: "later" },
  { scheduleDate: "not-a-date", rating: 4 },
  { scheduleDate: "2026-08-14", rating: 9 }
]), {
  "2026-08-12": { rating: 5, persistedRating: 5, updatedAt: "now" },
  "2026-08-13": { rating: 3, persistedRating: 3, updatedAt: "later" }
});
assert.equal(spreadsheetSafeText("=HYPERLINK(\"bad\")"), "'=HYPERLINK(\"bad\")");
assert.equal(spreadsheetSafeText("  +SUM(1,1)"), "'  +SUM(1,1)");
assert.equal(spreadsheetSafeText("Student One"), "Student One");
const csv = motivationRatingsCsv([{ student_name: "=CMD()", schedule_date: "2026-08-12", rating: 4, updated_at: "now" }]);
assert.ok(csv.startsWith("\uFEFF"));
assert.match(csv, /"'=CMD\(\)"/);

assert.match(html, /data-admin-motivation-results[^>]*hidden>動力指數結果/);
assert.match(html, /\.daily-motivation-scale\s*\{[^}]*grid-template-columns:\s*repeat\(6,\s*1fr\)/s);
assert.match(html, /\.daily-motivation-circle:nth-child\(4\)\s*\{\s*grid-column:\s*2 \/ span 2/);
assert.match(html, /\.daily-motivation-circle:hover,[\s\S]*linear-gradient\(135deg,\s*#dbeafe,\s*#d1fae5\)/);
assert.match(js, /createDailyMotivationPanel\(date, dayIndex, active\)/);
assert.match(js, /column\.append\(header, motivation, slots\)/);
assert.match(js, /schedule_student_get_motivation_week/);
assert.match(js, /schedule_admin_get_motivation_week/);
assert.match(js, /schedule_student_save_motivation_rating/);
assert.match(js, /schedule_admin_save_motivation_rating/);
assert.match(js, /MOTIVATION_SAVE_DELAY_MS/);
assert.match(js, /stageDailyMotivationRating\(/);
assert.match(js, /function flushPendingMotivationSaves\(\)/);
assert.match(js, /function cancelPendingMotivationSaves\(\)/);
assert.match(js, /function runDailyMotivationSave\(context\)/);
assert.match(js, /motivationSaveChains:\s*new Map\(\)/);
assert.match(js, /const previous = state\.motivationSaveChains\.get\(context\.key\) \|\| Promise\.resolve\(\)/);
assert.match(js, /previous\s*\.catch\(\(\) => undefined\)\s*\.then\(\(\) => saveDailyMotivationRating\(context\)\)/s);
assert.match(js, /state\.motivationSaveChains\.set\(context\.key, promise\)/);
assert.match(js, /motivationSaveContextIsCurrent\(context\)/g);
assert.match(js, /MOTIVATION_PENDING_STORAGE_KEY/);
assert.match(js, /rememberPendingMotivationSave\(student\.id, scheduleDate, rating\)/);
assert.match(js, /forgetPendingMotivationSave\(studentId, scheduleDate, rating\)/);
assert.match(js, /async function replayStoredMotivationSaves\(student\)/);
assert.match(js, /async function safelyReplayStoredMotivationSaves\(student\)/);
assert.match(js, /await safelyReplayStoredMotivationSaves\(student\)/);
assert.match(js, /async function safelyLoadMotivationWeek\(rpcName, args\)/);
assert.equal((js.match(/safelyLoadMotivationWeek\("schedule_(?:admin|student)_get_motivation_week"/g) || []).length, 2);
assert.match(js, /weekStart:\s*state\.weekStart/);
assert.ok((js.match(/await flushPendingMotivationSaves\(\);/g) || []).length >= 5);
assert.match(js, /function clearRenderedSchedule\(\)\s*\{\s*cancelPendingMotivationSaves\(\);/);

assert.match(adminHtml, /data-auth-gate/);
assert.match(adminHtml, /data-filter-form/);
assert.match(adminHtml, /data-export-csv/);
assert.match(adminJs, /schedule_admin_me/);
assert.match(adminJs, /schedule_admin_list_motivation_ratings/);
assert.match(adminJs, /p_student_query/);
assert.match(adminJs, /motivationRatingsCsv/);
assert.match(adminJs, /committedFilters:\s*null/);
assert.match(adminJs, /state\.committedFilters\s*=\s*readFilters\(\)/);
assert.match(adminJs, /\.\.\.committedRpcFilters\(\),\s*p_limit:\s*1000/);

assert.match(sql, /create table if not exists public\.schedule_daily_motivation_ratings/);
assert.match(sql, /primary key \(student_id, schedule_date\)/);
assert.match(sql, /check \(rating between 1 and 5\)/);
assert.match(sql, /alter table public\.schedule_daily_motivation_ratings enable row level security/);
assert.match(sql, /revoke all on table public\.schedule_daily_motivation_ratings\s+from public, anon, authenticated/);
assert.doesNotMatch(sql, /grant\s+(?:select|insert|update|delete|all)[^;]*schedule_daily_motivation_ratings/i);
assert.match(sql, /on conflict \(student_id, schedule_date\) do update/g);
assert.match(sql, /schedule_admin_list_motivation_ratings/);
assert.doesNotMatch(sql, /p_date_to\s*-\s*p_date_from\s*>/);
for (const rpc of [
  "schedule_student_get_motivation_week(uuid, date)",
  "schedule_admin_get_motivation_week(uuid, uuid, date)",
  "schedule_student_save_motivation_rating(uuid, date, integer)",
  "schedule_admin_save_motivation_rating(uuid, uuid, date, integer)",
  "schedule_admin_list_motivation_ratings(uuid, date, date, text, integer, integer)"
]) {
  const signature = rpc.replace(/[().]/g, "\\$&");
  assert.match(sql, new RegExp(`revoke all on function public\\.${signature}\\s+from public, anon, authenticated`));
  assert.match(sql, new RegExp(`grant execute on function public\\.${signature}\\s+to authenticated`));
}
assert.match(sql, /public\._schedule_admin_id\(p_admin_token\) is null/g);
assert.match(sql, /public\.flashcard_session_student_id\(p_token\)/g);

console.log("Schedule daily motivation tests passed.");
