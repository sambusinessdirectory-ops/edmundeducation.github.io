import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { HOMEWORK_HOT_KEY_REFERENCE, HOMEWORK_RESOURCE_TYPES } from "../schedule-homework-links.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [
  html,
  js,
  sql,
  emailAdminHtml,
  emailAdminJs,
  hotkeyAdminHtml,
  hotkeyAdminJs,
  pagesWorkflow
] = await Promise.all([
  read("schedule-system.html"),
  read("schedule-system.js"),
  read("supabase-schedule-reminder-email.sql"),
  read("schedule-reminder-email-admin.html"),
  read("schedule-reminder-email-admin.js"),
  read("schedule-homework-hotkeys-admin.html"),
  read("schedule-homework-hotkeys-admin.js"),
  read(".github/workflows/pages.yml")
]);

// Student reminder-email experience and immediate validation.
assert.match(html, /data-toggle-reminder-email[^>]*>隱藏電郵列</);
assert.match(html, /placeholder="電子郵件 - 輸入以接收馬仔 Eddy 每日給您的學習提醒"/);
assert.match(html, /請放心，您的電子郵件 會被秘密儲存，而且不會用作市場推廣用途/);
assert.match(html, /\.reminder-email-panel\s*\{[\s\S]*#35530a[\s\S]*linear-gradient/i);
assert.match(js, /schedule_student_get_reminder_email/);
assert.match(js, /schedule_student_set_reminder_email/);
assert.match(js, /schedule_student_delete_reminder_email/);
assert.match(js, /reminderEmailInput\.addEventListener\("input",/);
assert.match(js, /elements\.reminderEmailInput\.validity\.valid/);
assert.match(js, /hideReminderEmail/);

// Clicking the native dialog backdrop closes the editor without weakening the
// nested delete-confirmation flow.
assert.match(
  js,
  /elements\.entryDialog\.addEventListener\("click", \(event\) => \{\s*if \(event\.target === elements\.entryDialog && !elements\.deleteDialog\.open\) \{\s*elements\.entryDialog\.close\(\);/s
);

// The palettes must be actual gradients, including each score control.
assert.match(html, /\.daily-self-rating-list::before\s*\{[\s\S]*DAILY CHECK-IN · 每日狀態/);
for (const selector of [
  "rating-confidence",
  "rating-concentration",
  "rating-attention-span",
  "rating-stress",
  "rating-homework-difficulty"
]) {
  assert.match(
    html,
    new RegExp(`\\.daily-self-rating\\.${selector}\\s*\\{[\\s\\S]*?--rating-from:[^;]+;[\\s\\S]*?--rating-to:[^;]+;[\\s\\S]*?--rating-surface:\\s*linear-gradient`)
  );
}
assert.match(html, /\.daily-motivation-circle\s*\{[\s\S]*background:\s*linear-gradient\(145deg,[\s\S]*--rating-strength/s);
assert.match(html, /grid-template-columns:\s*repeat\(5, minmax\(0, 1fr\)\)/);

// Private database contract: no direct table access; student identity comes
// from the private session token; administrator reads require both auth layers.
assert.match(sql, /create table if not exists public\.schedule_student_reminder_emails/);
assert.match(sql, /alter table public\.schedule_student_reminder_emails enable row level security/);
assert.match(sql, /revoke all on table public\.schedule_student_reminder_emails\s+from public, anon, authenticated/);
assert.doesNotMatch(sql, /grant\s+(?:select|insert|update|delete|all)[^;]*schedule_student_reminder_emails/i);
for (const fn of [
  "schedule_student_get_reminder_email",
  "schedule_student_set_reminder_email",
  "schedule_student_delete_reminder_email"
]) {
  const body = sql.match(new RegExp(`create or replace function public\\.${fn}\\([\\s\\S]*?\\n\\$\\$;`))?.[0] || "";
  assert.match(body, /\(select auth\.uid\(\)\) is null/);
  assert.match(body, /flashcard_session_student_id\(p_token\)/);
}
assert.match(sql, /schedule_admin_list_reminder_emails[\s\S]*_schedule_admin_id\(p_admin_token\)/);
assert.match(sql, /p_limit is null or p_limit not between 1 and 500/);
assert.match(sql, /p_offset is null or p_offset not between 0 and 100000/);
assert.match(sql, /pg_catalog\.char_length\(v_query\) > 100/);
assert.match(sql, /'hideReminderEmail'/);
assert.match(sql, /'scheduleHideReminderEmail'/);

// The confidential directory is read-only and requires the existing Schedule
// administrator session. It intentionally provides no bulk-export control.
assert.match(emailAdminHtml, /data-directory/);
assert.match(emailAdminHtml, /學生提醒電郵/);
assert.doesNotMatch(emailAdminHtml, /download|export|匯出/i);
assert.match(emailAdminJs, /schedule_admin_me/);
assert.match(emailAdminJs, /schedule_admin_list_reminder_emails/);
assert.doesNotMatch(emailAdminJs, /console\.(?:log|info|debug)\([^)]*email/i);

// Hot-key documentation is generated from the canonical registry, avoiding a
// second hand-maintained list, and is gated by the Schedule admin session.
assert.equal(HOMEWORK_HOT_KEY_REFERENCE.length, HOMEWORK_RESOURCE_TYPES.length);
for (let index = 0; index < HOMEWORK_RESOURCE_TYPES.length; index += 1) {
  assert.equal(HOMEWORK_HOT_KEY_REFERENCE[index].type, HOMEWORK_RESOURCE_TYPES[index].type);
  assert.equal(HOMEWORK_HOT_KEY_REFERENCE[index].trigger, HOMEWORK_RESOURCE_TYPES[index].trigger);
  assert.ok(HOMEWORK_HOT_KEY_REFERENCE[index].pages.length > 0);
}
assert.match(hotkeyAdminHtml, /功課 Hot Keys/);
assert.match(hotkeyAdminHtml, /data-hotkey-grid/);
assert.match(hotkeyAdminJs, /HOMEWORK_HOT_KEY_REFERENCE/);
assert.match(hotkeyAdminJs, /schedule_admin_me/);
assert.match(hotkeyAdminJs, /\.textContent=/);
assert.match(html, /schedule-reminder-email-admin\.html/);
assert.match(html, /schedule-homework-hotkeys-admin\.html/);
assert.match(pagesWorkflow, /node tools\/test-schedule-reminder-email-and-hotkeys\.mjs/);

console.log("Schedule reminder-email, gradient rating, backdrop and hot-key checks passed.");
