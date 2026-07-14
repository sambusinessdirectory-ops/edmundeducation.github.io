import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import {
  SCHEDULE_MAX_DATE,
  SCHEDULE_MIN_DATE,
  addDays,
  firstWeekStart,
  isDateInScheduleRange,
  isWeekStartInScheduleRange,
  lastWeekStart,
  parseISODate,
  toISODate,
  weekDates
} from "../schedule-calendar.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const [homepage, scheduleHtml, scheduleJs, scheduleSql, worker] = await Promise.all([
  read("index.html"),
  read("schedule-system.html"),
  read("schedule-system.js"),
  read("supabase-schedule-system.sql"),
  read("workers/schedule-system/src/index.js")
]);

assert.equal(SCHEDULE_MIN_DATE, "2026-01-01");
assert.equal(SCHEDULE_MAX_DATE, "2050-12-31");
assert.equal(toISODate(firstWeekStart()), "2025-12-29");
assert.ok(isWeekStartInScheduleRange(toISODate(firstWeekStart())));
assert.ok(isWeekStartInScheduleRange(toISODate(lastWeekStart())));
assert.equal(parseISODate(toISODate(firstWeekStart())).getDay(), 1);
assert.equal(parseISODate(toISODate(lastWeekStart())).getDay(), 1);

let cursor = parseISODate(SCHEDULE_MIN_DATE);
const finalDate = parseISODate(SCHEDULE_MAX_DATE);
let supportedDays = 0;
while (cursor <= finalDate) {
  const iso = toISODate(cursor);
  assert.ok(isDateInScheduleRange(iso));
  supportedDays += 1;
  cursor = addDays(cursor, 1);
}
assert.equal(supportedDays, 9131, "2026-01-01 through 2050-12-31 must contain 9,131 days");

for (let week = firstWeekStart(); week <= lastWeekStart(); week = addDays(week, 7)) {
  const dates = weekDates(toISODate(week));
  assert.equal(dates.length, 7);
  assert.equal(parseISODate(dates[0]).getDay(), 1);
  assert.equal(parseISODate(dates[6]).getDay(), 0);
}

const homepageCards = [...homepage.matchAll(/<a class="category(?:\s[^"]*)?"/g)];
assert.equal(homepageCards.length, 13, "homepage must contain 13 numbered category cards");
assert.match(homepage, /schedule-system-card/);
assert.match(homepage, /href="schedule-system\.html"/);
assert.match(homepage, /功課及溫習安排系統/);

assert.match(scheduleHtml, /Background%20for%20Schedule%20System\.jpg/);
assert.match(scheduleHtml, /opacity:\s*\.5/);
assert.match(scheduleHtml, /grid-template-columns:\s*repeat\(7/);
assert.match(scheduleHtml, /匯出 \/ 列印 PDF/);
assert.match(scheduleHtml, /刪除後無法復原/);
assert.match(scheduleHtml, /按 Enter 儲存/);
assert.match(scheduleHtml, /@media print/);
assert.match(scheduleHtml, /<thead data-print-head>/);

assert.match(scheduleJs, /Math\.max\(10/);
assert.match(scheduleJs, /＋5 格/);
assert.match(scheduleJs, /window\.print\(\)/);
assert.match(scheduleJs, /flashcard_student_login/);
assert.match(scheduleJs, /schedule_admin_get_week/);
assert.match(scheduleJs, /schedule_student_upsert_entry/);
assert.match(scheduleJs, /p_expected_updated_at/);
assert.match(scheduleJs, /restoreCalendarFocus/);

const rpcNames = [
  "schedule_admin_login",
  "schedule_admin_me",
  "schedule_admin_logout",
  "schedule_admin_list_students",
  "schedule_admin_get_week",
  "schedule_admin_upsert_entry",
  "schedule_admin_delete_entry",
  "schedule_admin_add_slots",
  "schedule_student_profile",
  "schedule_student_logout",
  "schedule_student_get_week",
  "schedule_student_upsert_entry",
  "schedule_student_delete_entry",
  "schedule_student_add_slots"
];
for (const name of rpcNames) {
  assert.match(scheduleSql, new RegExp(`function public\\.${name}\\b`), `missing SQL RPC ${name}`);
  if (name !== "schedule_admin_login") {
    assert.match(scheduleSql, new RegExp(`grant execute on function public\\.${name}\\b`));
  }
}

assert.match(scheduleSql, /references public\.flashcard_students\(id\)/);
assert.match(scheduleSql, /flashcard_session_student_id\(p_token\)/);
assert.match(scheduleSql, /enable row level security/g);
assert.match(scheduleSql, /revoke all on table public\.schedule_entries/);
assert.match(scheduleSql, /schedule_date between date '2026-01-01' and date '2050-12-31'/);
assert.match(scheduleSql, /slot_count between 10 and 100/);
assert.match(scheduleSql, /least\(100, public\.schedule_day_capacity\.slot_count \+ 5\)/);
assert.match(scheduleSql, /for update/);
assert.match(scheduleSql, /Schedule entry changed in another session/);
assert.match(scheduleSql, /Teacher assignments can only be changed by an administrator/);
assert.match(scheduleSql, /Teacher assignments can only be deleted by an administrator/);
assert.match(
  scheduleSql,
  /schedule_student_upsert_entry\(uuid, date, integer, text, timestamptz\) to authenticated/
);

assert.match(worker, /ADMIN_LOGIN_RATE_LIMITER/);
assert.match(worker, /SCHEDULE_SERVICE_SECRET/);
assert.match(worker, /Origin not allowed/);
assert.match(worker, /readLimitedText\(request, 4096\)/);

const background = await stat(new URL("assets/schedule/Background for Schedule System.jpg", root));
assert.ok(background.size > 100_000, "schedule background image must be present");

console.log(`Schedule checks passed: ${supportedDays.toLocaleString()} supported dates, 13 homepage cards, ${rpcNames.length} secured RPCs.`);
