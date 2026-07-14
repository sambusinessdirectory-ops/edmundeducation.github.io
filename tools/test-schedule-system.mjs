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

const [homepage, modelEssayHtml, scheduleHtml, scheduleJs, scheduleSql, databaseSmokeTest, worker] = await Promise.all([
  read("index.html"),
  read("model-essay-downloads.html"),
  read("schedule-system.html"),
  read("schedule-system.js"),
  read("supabase-schedule-system.sql"),
  read("tools/test-schedule-batch-database.sql"),
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
assert.match(
  homepage,
  /href="model-essay-downloads\.html"[\s\S]*?<span class="category-name">學生使用<br>DSE \/ IELTS<br>其他範文<br>下載區<\/span>/,
  "model-essay homepage card must use the requested four lines"
);
assert.match(
  homepage,
  /href="schedule-system\.html"[\s\S]*?<span class="category-name"><span class="schedule-card-first-line">\(學生使用\) 功課及溫習<\/span><br>安排系統<\/span>/,
  "schedule homepage card must use the requested two lines"
);

assert.match(modelEssayHtml, /assets\/model-essays\/essay-cover\.webp/);
assert.match(modelEssayHtml, /assets\/model-essays\/mascot-reading-essays\.webp/);
assert.match(
  modelEssayHtml,
  /login-cover-art[^>]*essay-cover\.webp[\s\S]*?<p class="eyebrow">EDMUND STUDENT LIBRARY/,
  "essay cover must appear above the download-site heading"
);
assert.match(
  modelEssayHtml,
  /login-reading-mascot[^>]*mascot-reading-essays\.webp[\s\S]*?<h2>學生 \/ 管理員登入/,
  "reading mascot must appear above the login credentials"
);

assert.match(scheduleHtml, /Background%20for%20Schedule%20System\.jpg/);
assert.match(scheduleHtml, /opacity:\s*\.5/);
assert.match(scheduleHtml, /grid-template-columns:\s*repeat\(7/);
assert.match(scheduleHtml, /匯出 \/ 列印 PDF/);
assert.match(scheduleHtml, /刪除後無法復原/);
assert.match(scheduleHtml, /按 Enter 儲存/);
assert.match(scheduleHtml, /@media print/);
assert.match(scheduleHtml, /data-print-grid/);
assert.doesNotMatch(scheduleHtml, /data-print-head|data-print-body/);
assert.match(
  scheduleHtml,
  /\.calendar-panel\.glass-card\s*\{[^}]*background:\s*rgba\(\s*255\s*,\s*252\s*,\s*245\s*,\s*\.05\s*\)[^}]*backdrop-filter:\s*none/s,
  "calendar panel must use the requested 5% opaque background without blur"
);
assert.match(
  scheduleHtml,
  /\.day-column\s*\{[^}]*background:\s*rgba\(\s*255\s*,\s*253\s*,\s*248\s*,\s*\.8\s*\)/s,
  "weekday columns must use the requested 80% alpha"
);
assert.match(
  scheduleHtml,
  /\.day-column\.is-weekend\s*\{[^}]*background:\s*rgba\(\s*249\s*,\s*243\s*,\s*234\s*,\s*\.8\s*\)/s,
  "weekend columns must use the requested 80% alpha"
);
assert.match(scheduleHtml, /\.day-header\s*\{[^}]*position:\s*(?:relative|static)\s*;/s);
assert.doesNotMatch(scheduleHtml, /\.day-header\s*\{[^}]*position:\s*sticky\b/s);
assert.match(scheduleHtml, /\.legend-badge,\s*\.entry-source\s*\{[^}]*font-size:\s*13\.2px/s);
assert.match(scheduleHtml, /#schedule-export-help\s*\{[^}]*background:\s*rgba\([^)]*,\s*\.9\)/s);
assert.match(scheduleHtml, /\.entry-message\s*\{[^}]*font-size:\s*17px/s);
assert.match(scheduleHtml, /data-toggle-table/);
assert.match(scheduleHtml, /aria-controls="schedule-table-region"/);
assert.match(scheduleHtml, /data-toggle-unused/);
assert.match(scheduleHtml, /data-toggle-unused[^>]*aria-pressed="false"/);
assert.match(scheduleHtml, /data-toggle-mascots/);
assert.match(scheduleHtml, /data-toggle-mascots[^>]*aria-controls="schedule-week-grid"[^>]*aria-pressed="false"/);
assert.match(scheduleHtml, /\.week-grid\.mascots-hidden \.day-header\s*\{[^}]*min-height:\s*78px[^}]*padding:\s*18px/s);
assert.match(scheduleHtml, /\.week-grid\.mascots-hidden \.day-mascot\s*\{[^}]*display:\s*none/s);
assert.match(scheduleHtml, /remove-slots-button/);
assert.match(scheduleHtml, /－5 格/);
assert.match(scheduleHtml, /data-toggle-complete/);
assert.match(scheduleHtml, /\.schedule-slot\.has-entry\.is-completed/);
assert.match(scheduleHtml, /\.completion-badge/);
assert.match(scheduleHtml, />標記完成</);
assert.match(scheduleHtml, /data-toggle-selection[^>]*aria-pressed="false"/);
assert.match(scheduleHtml, />select multiple</);
assert.match(scheduleHtml, /data-selection-actions/);
assert.match(scheduleHtml, /data-batch-complete/);
assert.match(scheduleHtml, /data-move-selected/);
assert.match(scheduleHtml, /data-batch-delete/);
assert.match(scheduleHtml, /data-cancel-selection/);
assert.match(scheduleHtml, /assets\/schedule\/mascot-timetable-planning\.webp/);
assert.match(scheduleHtml, /assets\/schedule\/day-week-post-it\.webp/);
assert.match(scheduleHtml, /\.day-mascot\b/);
assert.match(scheduleHtml, /\.unused-day-note\s*\{[^}]*white-space:\s*pre-line/s);
assert.match(scheduleHtml, /\.print-entry-admin\s*\{[^}]*#f4dfc2/i);
assert.match(scheduleHtml, /\.print-entry-student\s*\{[^}]*#dfe9ff/i);

const metricCards = [...scheduleHtml.matchAll(/<article\s+class="metric-card(?:\s[^"]*)?"/g)];
assert.equal(metricCards.length, 4, "schedule progress dashboard must contain exactly four metric cards");
for (const metric of [
  "week-goals",
  "total-goals",
  "week-completed",
  "total-completed"
]) {
  assert.match(scheduleHtml, new RegExp(`data-metric-${metric}\\b`), `missing ${metric} metric card`);
}

assert.match(scheduleJs, /Math\.max\(10/);
assert.match(scheduleJs, /＋5 格/);
assert.match(scheduleJs, /window\.print\(\)/);
assert.match(scheduleJs, /flashcard_student_login/);
assert.match(scheduleJs, /schedule_admin_get_week/);
assert.match(scheduleJs, /schedule_student_upsert_entry/);
assert.match(scheduleJs, /p_expected_updated_at/);
assert.match(scheduleJs, /restoreCalendarFocus/);
assert.match(scheduleJs, /state\.tableHidden/);
assert.match(scheduleJs, /state\.hideUnused/);
assert.match(scheduleJs, /state\.hideMascots/);
assert.match(scheduleJs, /state\.showUnusedTemporarily/);
assert.match(scheduleJs, /displayPreferenceRequestId/);
assert.match(scheduleJs, /function displayPreferenceOwner\(/);
assert.match(scheduleJs, /const isCurrentRequest = \(\) =>/);
assert.match(scheduleJs, /if \(!isCurrentRequest\(\)\) return;/);
assert.match(scheduleJs, /if \(isCurrentRequest\(\)\) setMutationInFlight\(false\)/);
assert.match(scheduleJs, /function toggleTableVisibility\(/);
assert.match(scheduleJs, /function toggleUnusedSlots\(/);
assert.match(scheduleJs, /function toggleMascots\(/);
assert.match(scheduleJs, /function unusedSlotsAreHidden\(/);
assert.match(scheduleJs, /schedule_student_set_display_preferences/);
assert.match(scheduleJs, /schedule_admin_set_display_preferences/);
assert.match(scheduleJs, /payload\.displayPreferences/);
assert.match(scheduleJs, /function renderMetrics\(/);
assert.match(scheduleJs, /capacityVersions/);
assert.match(scheduleJs, /if\s*\(hideUnusedNow\s*&&\s*!entry\)\s*continue/);
assert.doesNotMatch(scheduleJs, /UNUSED_HIDDEN_KEY|edmund-schedule-unused-hidden-v1/);
assert.doesNotMatch(scheduleJs, /saveDisplayPreference\([^\n]*hideUnused/);
assert.match(scheduleJs, /unused-day-note/);
assert.match(scheduleJs, /data\.removeSlotsDate|dataset\.removeSlotsDate/);
assert.match(scheduleJs, /schedule_admin_change_capacity/);
assert.match(scheduleJs, /schedule_student_change_capacity/);
assert.match(scheduleJs, /schedule_admin_set_entry_completed/);
assert.match(scheduleJs, /schedule_student_set_entry_completed/);
assert.match(scheduleJs, /p_expected_version/);
assert.match(scheduleJs, /p_delta/);
assert.match(scheduleJs, /classList\.add\("is-completed"\)/);
assert.match(scheduleJs, /completion-badge/);
assert.match(scheduleJs, /textContent\s*=\s*"已完成"/);
assert.match(scheduleJs, /elements\.toggleTable\.addEventListener\(/);
assert.match(scheduleJs, /elements\.toggleUnused\.addEventListener\(/);
assert.match(scheduleJs, /elements\.toggleComplete\.addEventListener\(/);
assert.match(scheduleJs, /changeCapacity\([^,]+,\s*-5\s*,/);
assert.doesNotMatch(scheduleJs, /\baddSlots\(/, "legacy addSlots handler must be replaced by versioned capacity changes");
assert.match(scheduleJs, /本日未有安排；\\n未使用格已隱藏。/);
assert.match(scheduleJs, /WEEKDAY_MASCOTS/);
for (const mascot of [
  "monday-walking-to-school",
  "tuesday-basketball",
  "wednesday-piano",
  "thursday-reading",
  "friday-pizza",
  "saturday-sleeping",
  "sunday-side-sleeping"
]) {
  assert.match(scheduleJs, new RegExp(`${mascot}\\.webp`));
}
assert.match(scheduleJs, /selectedEntryIds:\s*new Set\(\)/);
assert.match(scheduleJs, /function batchSetCompletion\(/);
assert.match(scheduleJs, /function batchDeleteEntries\(/);
assert.match(scheduleJs, /function beginMoveSelected\(/);
assert.match(scheduleJs, /function moveEntryTo\(/);
assert.match(scheduleJs, /addEventListener\("dragstart"/);
assert.match(scheduleJs, /addEventListener\("drop"/);
assert.match(scheduleJs, /state\.currentUser\?\.role === "student" && entry\.source === "admin"/);
assert.match(scheduleJs, /p_source_capacity_version/);
assert.match(scheduleJs, /p_target_capacity_version/);
assert.match(scheduleJs, /const dayEntries = state\.weekPayload\.entries/);
assert.doesNotMatch(scheduleJs, /const maxSlots =/, "print rendering must not recreate unused slot rows");
assert.doesNotMatch(scheduleJs, /elements\.printHead|elements\.printBody/);

const rpcNames = [
  "schedule_admin_login",
  "schedule_admin_me",
  "schedule_admin_logout",
  "schedule_admin_list_students",
  "schedule_admin_get_week",
  "schedule_admin_upsert_entry",
  "schedule_admin_delete_entry",
  "schedule_admin_change_capacity",
  "schedule_admin_set_entry_completed",
  "schedule_admin_batch_delete_entries",
  "schedule_admin_batch_set_entries_completed",
  "schedule_admin_move_entry",
  "schedule_admin_set_display_preferences",
  "schedule_student_profile",
  "schedule_student_logout",
  "schedule_student_get_week",
  "schedule_student_upsert_entry",
  "schedule_student_delete_entry",
  "schedule_student_change_capacity",
  "schedule_student_set_entry_completed",
  "schedule_student_batch_delete_entries",
  "schedule_student_batch_set_entries_completed",
  "schedule_student_move_entry",
  "schedule_student_set_display_preferences"
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
assert.match(scheduleSql, /for update/);
assert.match(scheduleSql, /version bigint not null default 0/);
assert.match(scheduleSql, /add column if not exists version bigint not null default 0/);
assert.match(scheduleSql, /is_completed boolean not null default false/);
assert.match(scheduleSql, /completed_at timestamptz/);
assert.match(scheduleSql, /completion_source text/);
assert.match(scheduleSql, /completed_by_admin uuid/);
assert.match(scheduleSql, /schedule_entries_completed_by_admin_fkey[\s\S]*?on delete restrict/);
assert.match(scheduleSql, /'isCompleted',\s*entry\.is_completed/);
assert.match(scheduleSql, /'completedAt',\s*entry\.completed_at/);
assert.match(scheduleSql, /'completionSource',\s*entry\.completion_source/);
assert.match(scheduleSql, /'metrics',\s*pg_catalog\.jsonb_build_object/);
assert.match(scheduleSql, /'weekGoals'/);
assert.match(scheduleSql, /'totalGoals'/);
assert.match(scheduleSql, /'weekCompleted'/);
assert.match(scheduleSql, /'totalCompleted'/);
assert.match(scheduleSql, /'capacityVersions'/);
assert.match(scheduleSql, /'displayPreferences'/);
assert.match(scheduleSql, /edmundStudentDisplayPreferences/);
assert.match(scheduleSql, /scheduleHideUnused/);
assert.match(scheduleSql, /scheduleHideMascots/);
assert.match(scheduleSql, /create or replace function public\._schedule_display_preferences\b/);
assert.match(scheduleSql, /create or replace function public\._schedule_set_display_preferences\b/);
assert.match(scheduleSql, /state\.value \|\| excluded\.value|existing\.value \|\| excluded\.value/);
assert.match(scheduleSql, /create or replace function public\._schedule_set_entry_completed\b/);
assert.match(scheduleSql, /set is_completed = p_completed/);
assert.match(
  scheduleSql,
  /create or replace function public\._schedule_set_entry_completed\b[\s\S]*?from public\.schedule_entries entry[\s\S]*?for update;[\s\S]*?set is_completed = p_completed/,
  "completion changes must lock the current entry before updating it"
);
assert.match(scheduleSql, /create or replace function public\._schedule_change_capacity\b/);
assert.match(scheduleSql, /p_delta is null or p_delta not in \(-5, 5\)/);
assert.match(scheduleSql, /p_expected_version is null or p_expected_version < 0/);
assert.match(scheduleSql, /v_capacity\.version <> p_expected_version/);
assert.match(scheduleSql, /entry\.slot_index > v_target/);
assert.match(scheduleSql, /version = capacity\.version \+ 1/);
assert.match(scheduleSql, /v_reopens_completion := v_existing\.message is distinct from v_message/);
assert.match(scheduleSql, /is_completed = case when v_reopens_completion then false else v_existing\.is_completed end/);
assert.doesNotMatch(scheduleSql, /create or replace function public\.schedule_(?:student|admin)_add_slots\b/);
assert.match(
  scheduleSql,
  /create or replace function public\._schedule_change_capacity\b[\s\S]*?from public\.schedule_day_capacity capacity[\s\S]*?where capacity\.student_id = p_student_id[\s\S]*?for update;/,
  "capacity changes must lock the current day-capacity row"
);
assert.match(scheduleSql, /Schedule entry changed in another session/);
assert.match(scheduleSql, /Teacher assignments can only be changed by an administrator/);
assert.match(scheduleSql, /Teacher assignments can only be deleted by an administrator/);
assert.match(scheduleSql, /create or replace function public\._schedule_batch_delete_entries\b/);
assert.match(scheduleSql, /create or replace function public\._schedule_batch_set_entries_completed\b/);
assert.match(scheduleSql, /create or replace function public\._schedule_move_entry\b/);
assert.match(scheduleSql, /jsonb_array_length\(p_items\)/);
assert.match(scheduleSql, /expected_updated_at/);
assert.match(scheduleSql, /order by schedule_entry\.id[\s\S]*?for update/);
assert.match(scheduleSql, /Target slot is occupied/);
assert.match(databaseSmokeTest, /^begin;/m);
assert.match(databaseSmokeTest, /^rollback;/m);
assert.match(databaseSmokeTest, /_schedule_batch_set_entries_completed/);
assert.match(databaseSmokeTest, /_schedule_batch_delete_entries/);
assert.match(databaseSmokeTest, /_schedule_move_entry/);
assert.match(databaseSmokeTest, /_schedule_set_display_preferences/);
assert.match(databaseSmokeTest, /schedule_student_set_display_preferences/);
assert.match(databaseSmokeTest, /schedule_admin_set_display_preferences/);
assert.match(databaseSmokeTest, /flashcardHideLockedSections/);
assert.match(databaseSmokeTest, /schedule preference isolation/i);
assert.match(databaseSmokeTest, /when sqlstate '40001'/);
assert.match(databaseSmokeTest, /when sqlstate '42501'/);
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

for (const asset of [
  "assets/model-essays/essay-cover.webp",
  "assets/model-essays/mascot-reading-essays.webp",
  "assets/schedule/mascot-timetable-planning.webp",
  "assets/schedule/day-week-post-it.webp",
  "assets/schedule/weekdays/monday-walking-to-school.webp",
  "assets/schedule/weekdays/tuesday-basketball.webp",
  "assets/schedule/weekdays/wednesday-piano.webp",
  "assets/schedule/weekdays/thursday-reading.webp",
  "assets/schedule/weekdays/friday-pizza.webp",
  "assets/schedule/weekdays/saturday-sleeping.webp",
  "assets/schedule/weekdays/sunday-side-sleeping.webp"
]) {
  const file = await stat(new URL(asset, root));
  assert.ok(file.size > 10_000, `${asset} must be a non-empty optimized image`);
}

console.log(`Schedule checks passed: ${supportedDays.toLocaleString()} supported dates, 13 homepage cards, ${rpcNames.length} secured RPCs.`);
