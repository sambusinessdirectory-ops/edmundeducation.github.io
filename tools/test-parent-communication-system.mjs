import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");
const [parentSql, accountSql, parentHtml, progressJs, scheduleHtml, scheduleJs, sharedNav] = await Promise.all([
  read("supabase-parent-communication-system.sql"),
  read("supabase-schedule-account-management.sql"),
  read("parent-communication.html"),
  read("student-progress.js"),
  read("schedule-system.html"),
  read("schedule-system.js"),
  read("shared-system-nav.js")
]);

for (const table of ["parent_communication_accounts", "parent_communication_sessions", "parent_communication_assignments"]) {
  assert.match(parentSql, new RegExp(`alter table public\\.${table} enable row level security;`));
  assert.match(parentSql, new RegExp(`revoke all on table public\\.${table}[\\s\\S]*?from public, anon, authenticated, service_role;`));
}
assert.match(parentSql, /password_hash text not null/);
assert.match(parentSql, /extensions\.crypt\(p_parent_password, extensions\.gen_salt\('bf', 12\)\)/);
assert.match(parentSql, /extensions\.digest\(v_token::text, 'sha256'\)/);
assert.match(parentSql, /public\._schedule_worker_ok\(p_service_secret\)/);
const snapshotFunction = parentSql.match(/create or replace function public\.parent_communication_snapshot[\s\S]*?\n\$\$;/)?.[0] || "";
assert.match(snapshotFunction, /public\._student_progress_snapshot\(student\.id\)/);
assert.match(snapshotFunction, /from public\.parent_communication_assignments/);
assert.match(snapshotFunction, /assignment\.student_id = p_student_id/);
assert.match(parentSql, /schedule_admin_assign_parent_students[\s\S]*delete from public\.parent_communication_assignments[\s\S]*insert into public\.parent_communication_assignments/);
assert.match(parentSql, /Student list contains duplicates/);
assert.match(parentSql, /A parent can be assigned at most 100 students/);
assert.match(parentSql, /A parent account with this name already exists/);
assert.doesNotMatch(parentSql, /returns table \([^)]*(?:password|password_hash)/i, "no parent RPC may return a password or password hash");

for (const functionBlock of parentSql.matchAll(/create or replace function public\.[\s\S]*?\n\$\$;/g)) {
  const block = functionBlock[0];
  if (/security definer/.test(block)) assert.match(block, /set search_path = ''/, "every SECURITY DEFINER parent function needs an empty search_path");
}

assert.match(accountSql, /shared_student_change_password[\s\S]*p_current_password[\s\S]*p_new_password/);
assert.match(accountSql, /Current password is incorrect or the session has expired/);
assert.match(accountSql, /delete from public\.flashcard_student_sessions[\s\S]*insert into public\.flashcard_student_sessions/);
assert.match(accountSql, /schedule_admin_change_own_password[\s\S]*delete from public\.schedule_admin_sessions[\s\S]*insert into public\.schedule_admin_sessions/);
assert.match(accountSql, /A student account with this name already exists/);
assert.match(accountSql, /p_status not in \('none', 'completed', 'in_progress', 'previous_incomplete'\)/);
assert.match(accountSql, /for update of entry/);
assert.match(accountSql, /is_in_progress = p_status = 'in_progress'/);
assert.match(accountSql, /is_previous_incomplete = p_status = 'previous_incomplete'/);

assert.match(parentHtml, /data-progress-portal="parent"/);
assert.match(parentHtml, /家長溝通系統/);
assert.match(parentHtml, /全面英文能力發展進度表/);
assert.match(parentHtml, /data-change-password/);
assert.doesNotMatch(parentHtml, /href="(?:flashcards|writing-practice|speaking-system|sentence-structure|idiom-system|proverb-system|phrasal-verb-system)\.html/, "the parent portal must not expose exercise links");
assert.match(progressJs, /const PARENT_MODE = document\.body\?\.dataset\.progressPortal === "parent"/);
assert.match(progressJs, /\/v1\/parent\/login/);
assert.match(progressJs, /parent_communication_students/);
assert.match(progressJs, /parent_communication_snapshot/);
assert.match(progressJs, /parent_communication_change_password/);
assert.match(progressJs, /const sourceNavigation = PARENT_MODE[\s\S]*?<span class="system-link" aria-disabled="true">家長帳戶只可查看進度<\/span>/);

assert.match(scheduleHtml, /開設學生帳戶/);
assert.match(scheduleHtml, /開設家長帳戶/);
assert.match(scheduleHtml, /家長帳戶與子女指派/);
assert.match(scheduleHtml, /data-batch-progress[^>]*>標記進行中/);
assert.match(scheduleHtml, /data-batch-previous-incomplete[^>]*>標記上週未完成/);
assert.match(scheduleJs, /schedule_admin_upsert_student_account/);
assert.match(scheduleJs, /schedule_admin_reset_student_password/);
assert.match(scheduleJs, /schedule_admin_deactivate_student/);
assert.match(scheduleJs, /schedule_admin_upsert_parent/);
assert.match(scheduleJs, /schedule_admin_assign_parent_students/);
assert.match(scheduleJs, /batchSetExclusiveStatus\("in_progress"\)/);
assert.match(scheduleJs, /batchSetExclusiveStatus\("previous_incomplete"\)/);

assert.match(sharedNav, /shared_student_change_password/);
assert.match(sharedNav, /p_current_password/);
assert.match(sharedNav, /p_new_password/);
assert.match(sharedNav, /location\.reload\(\)/);

console.log("Parent communication, secure password management, admin accounts and exclusive bulk statuses verified.");
