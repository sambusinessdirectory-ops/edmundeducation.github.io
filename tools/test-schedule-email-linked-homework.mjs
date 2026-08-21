import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [sql, scheduleHtml, scheduleJs, contentHtml, contentJs, logHtml, logJs] = await Promise.all([
  read("supabase-schedule-email-designer-and-linked-homework-20260821.sql"),
  read("schedule-system.html"), read("schedule-system.js"),
  read("schedule-email-content-admin.html"), read("schedule-email-content-admin.js"),
  read("schedule-email-log-admin.html"), read("schedule-email-log-admin.js")
]);

for (const table of [
  "schedule_email_templates", "schedule_email_template_recipients", "schedule_email_logs",
  "schedule_homework_link_groups", "schedule_homework_link_members"
]) {
  assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
}
assert.match(sql, /revoke all on table[\s\S]*?from public,anon,authenticated/);
assert.match(sql, /if \(select auth\.uid\(\)\) is null then raise exception 'Authentication required'/);
assert.match(sql, /jsonb_array_length\(p_recipient_ids\)>1000/);
assert.match(sql, /cadence in \('15m','30m','45m','1h','24h','daily'\)/);
assert.match(sql, /transportConnected',false/);
assert.match(sql, /create trigger schedule_linked_homework_sync_trigger after insert or update or delete/);
assert.match(sql, /if tg_op='UPDATE'[\s\S]*?old\.schedule_date,old\.slot_index[\s\S]*?delete from public\.schedule_entries/);
assert.match(sql, /on conflict\(student_id,schedule_date,slot_index\) do update[\s\S]*?where public\.schedule_entries\.homework_sync_group_id=v_group/);
assert.doesNotMatch(sql, /gmail\.googleapis\.com|refresh_token|client_secret/i);

assert.match(scheduleHtml, /Email 內容設計/);
assert.match(scheduleHtml, /Email Log/);
assert.match(scheduleHtml, /連結學生功課安排/);
assert.match(scheduleJs, /schedule_admin_link_homework_accounts/);
assert.match(scheduleJs, /schedule_admin_unlink_homework_accounts/);

assert.match(contentHtml, /Gmail 傳送尚未連接/);
assert.match(contentHtml, /Hi（帳戶名稱）/);
assert.match(contentJs, /schedule_admin_email_designer_snapshot/);
assert.match(contentJs, /schedule_admin_save_email_template/);
assert.match(contentJs, />全選</);
assert.match(contentJs, />取消全選</);
assert.match(logHtml, /Email Log/);
assert.match(logJs, /schedule_admin_list_email_logs/);

console.log("Schedule email-designer and linked-homework security contracts passed.");
