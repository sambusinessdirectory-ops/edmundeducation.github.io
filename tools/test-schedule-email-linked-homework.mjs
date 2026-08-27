import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [sql, gmailSql, scheduleHtml, scheduleJs, contentHtml, contentJs, logHtml, logJs, worker, wrangler, workerReadme] = await Promise.all([
  read("supabase-schedule-email-designer-and-linked-homework-20260821.sql"),
  read("supabase-schedule-gmail-delivery-20260822.sql"),
  read("schedule-system.html"), read("schedule-system.js"),
  read("schedule-email-content-admin.html"), read("schedule-email-content-admin.js"),
  read("schedule-email-log-admin.html"), read("schedule-email-log-admin.js"),
  read("workers/schedule-system/src/index.js"), read("workers/schedule-system/wrangler.jsonc"),
  read("workers/schedule-system/README.md")
]);

for (const table of ["schedule_email_templates", "schedule_email_template_recipients", "schedule_email_logs", "schedule_homework_link_groups", "schedule_homework_link_members"]) {
  assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
}
for (const table of ["schedule_email_sender_settings", "schedule_email_oauth_states", "schedule_email_template_attachments", "schedule_email_delivery_jobs"]) {
  assert.match(gmailSql, new RegExp(`alter table public\\.${table} enable row level security`));
}
assert.match(sql, /revoke all on table[\s\S]*?from public,anon,authenticated/);
assert.match(gmailSql, /revoke all on table[\s\S]*?from public,anon,authenticated,service_role/);
assert.doesNotMatch(gmailSql, /grant (?:select|insert|update|delete|all) on table/i);
assert.match(sql, /create trigger schedule_linked_homework_sync_trigger after insert or update or delete/);
assert.match(sql, /if tg_op='UPDATE'[\s\S]*?old\.schedule_date,old\.slot_index[\s\S]*?delete from public\.schedule_entries/);
assert.match(sql, /on conflict\(student_id,schedule_date,slot_index\) do update[\s\S]*?where public\.schedule_entries\.homework_sync_group_id=v_group/);

assert.match(gmailSql, /cadence in \('once','15m','30m','45m','1h','24h','daily'\)/);
assert.match(gmailSql, /slot between 1 and 100/);
assert.match(gmailSql, /refresh_token_ciphertext/);
assert.match(gmailSql, /schedule_email_service_oauth_begin/);
assert.match(gmailSql, /schedule_email_service_oauth_consume/);
assert.match(gmailSql, /schedule_email_service_claim_job/);
assert.match(gmailSql, /status='accepted'[\s\S]*?interval '24 hours'[\s\S]*?<400/);
assert.match(gmailSql, /A message can contain at most three PDFs/);
assert.match(gmailSql, /p_signature_link !~ '\^https:\/\//);
assert.doesNotMatch(gmailSql, /GOOGLE_OAUTH_CLIENT_SECRET\s*=/);
assert.doesNotMatch(gmailSql, /refresh_token_ciphertext\s+text\s+default/i);

assert.match(scheduleHtml, /Email 內容設計/);
assert.match(scheduleHtml, /Email Log/);
assert.match(scheduleHtml, /連結學生功課安排/);
assert.match(scheduleJs, /schedule_admin_link_homework_accounts/);
assert.match(scheduleJs, /schedule_admin_unlink_homework_accounts/);

assert.match(contentHtml, /data-sender-email/);
assert.match(contentHtml, /data-connect-gmail/);
assert.match(contentHtml, /data-add-template/);
assert.match(contentHtml, /schedule-system-config\.js/);
assert.match(contentJs, /<option value="once">一次性發送<\/option>/);
assert.match(contentJs, /data-signature/);
assert.match(contentJs, /accept="application\/pdf,\.pdf"/);
assert.match(contentJs, /\/v1\/admin\/gmail\/oauth\/start/);
assert.match(contentJs, /missing_gmail_send/);
assert.match(contentJs, /submitWithRecovery/);
assert.match(await read('email-submit.mjs'), /\/submit/);
assert.match(contentJs, /schedule_admin_email_designer_snapshot/);
assert.match(contentJs, />全選</);
assert.match(contentJs, />取消全選</);
assert.match(contentJs, /指定時間（香港時間・24 小時制）/);
assert.doesNotMatch(contentJs, /GOOGLE_OAUTH_CLIENT_SECRET|GMAIL_TOKEN_ENCRYPTION_KEY|refreshTokenCiphertext/);

assert.match(worker, /async scheduled\(_event, env, ctx\)/);
assert.match(worker, /https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth/);
assert.match(worker, /GMAIL_SEND_SCOPE = "https:\/\/www\.googleapis\.com\/auth\/gmail\.send"/);
assert.match(worker, /grantedScopes\.has\(GMAIL_SEND_SCOPE\)/);
assert.match(worker, /AES-GCM/);
assert.match(worker, /https:\/\/gmail\.googleapis\.com\/gmail\/v1\/users\/me\/messages\/send/);
assert.match(worker, /Content-Disposition: attachment/);
assert.match(worker, /Content-ID:/);
assert.match(worker, /PDF attachments must be valid/);
assert.match(worker, /Authorization: `Bearer \$\{accessToken\}`/);
assert.match(worker, /payload\?\.error\?\.errors\?\.\[0\]\?\.reason/);
assert.match(worker, /GMAIL_SEND_FAILED_\$\{response\.status\}/);
assert.match(wrangler, /"crons": \["\*\/5 \* \* \* \*"\]/);
assert.match(workerReadme, /wrangler secret put GMAIL_TOKEN_ENCRYPTION_KEY/);
assert.match(workerReadme, /In production/);
assert.doesNotMatch(workerReadme, /Gmail 傳送尚未連接/);

assert.match(logHtml, /Email Log/);
assert.match(logJs, /schedule_admin_list_email_logs/);

console.log("Schedule Gmail delivery, email-designer, and linked-homework security contracts passed.");
