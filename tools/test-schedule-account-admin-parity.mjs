import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");

const [accountSql, paritySql, baseSql, scheduleHtml, scheduleJs] = await Promise.all([
  read("supabase-schedule-account-management.sql"),
  read("supabase-schedule-account-admin-parity.sql"),
  read("supabase-schedule-system.sql"),
  read("schedule-system.html"),
  read("schedule-system.js")
]);

const combinedSql = `${baseSql}\n${accountSql}\n${paritySql}`;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function functionBlock(name) {
  const marker = `create or replace function public.${name}(`;
  const start = combinedSql.indexOf(marker);
  assert.notEqual(start, -1, `missing SQL contract: ${name}`);
  const next = combinedSql.indexOf("create or replace function public.", start + marker.length);
  return combinedSql.slice(start, next === -1 ? combinedSql.length : next);
}

function assertSecureAdminRpc(name) {
  const block = functionBlock(name);
  assert.match(block, /security definer/i, `${name} must execute through a controlled SECURITY DEFINER boundary`);
  assert.match(block, /set search_path\s*=\s*''/i, `${name} must use an empty search_path`);
  assert.match(block, /public\._schedule_admin_id\s*\(\s*p_admin_token\s*\)/i, `${name} must authenticate the Schedule admin token`);
  assert.match(block, /(?:v_admin_id|public\._schedule_admin_id\s*\([^)]*\))\s+is\s+null/i, `${name} must reject an invalid admin session`);

  const escaped = escapeRegExp(name);
  assert.match(
    paritySql,
    new RegExp(`revoke\\s+all\\s+on\\s+function\\s+public\\.${escaped}\\([^;]*\\)\\s+from\\s+public\\s*,\\s*anon\\s*,\\s*authenticated(?:\\s*,\\s*service_role)?\\s*;`, "i"),
    `${name} must revoke Postgres' default function execution privileges`
  );
  assert.match(
    paritySql,
    new RegExp(`grant\\s+execute\\s+on\\s+function\\s+public\\.${escaped}\\([^;]*\\)\\s+to\\s+authenticated\\s*;`, "i"),
    `${name} must be callable only through the authenticated RPC client after its own token check`
  );
  return block;
}

function assertOneOf(content, patterns, message) {
  assert.ok(patterns.some((pattern) => pattern.test(content)), message);
}

const rpcNames = [
  "schedule_admin_list_student_accounts",
  "schedule_admin_get_student_list_preferences",
  "schedule_admin_set_student_sort_mode",
  "schedule_admin_reorder_students",
  "schedule_admin_set_student_access",
  "schedule_admin_get_student_account_audit",
  "schedule_admin_reactivate_student",
  "schedule_admin_get_student_deletion_impact",
  "schedule_admin_permanently_delete_student"
];

const blocks = Object.fromEntries(rpcNames.map((name) => [name, assertSecureAdminRpc(name)]));

// Active/inactive listing and bounded pagination.
assert.match(blocks.schedule_admin_list_student_accounts, /p_status\s+text\s+default\s+'all'/i);
assert.match(blocks.schedule_admin_list_student_accounts, /p_limit\s+integer\s+default\s+100/i);
assert.match(blocks.schedule_admin_list_student_accounts, /p_offset\s+integer\s+default\s+0/i);
assert.match(blocks.schedule_admin_list_student_accounts, /deleted_at/i);
assert.match(blocks.schedule_admin_list_student_accounts, /sort_order/i);
assert.match(blocks.schedule_admin_list_student_accounts, /total_count/i);
assert.match(blocks.schedule_admin_list_student_accounts, /'active'[\s\S]*'inactive'/i);
assert.match(blocks.schedule_admin_list_student_accounts, /p_limit[\s\S]*(?:least|between|>|<)/i, "student-list page size must be bounded server-side");

// Persistent A-Z, Z-A and custom ordering, including a complete, duplicate-free reorder request.
assert.match(blocks.schedule_admin_set_student_sort_mode, /p_sort_mode|p_mode/i);
assert.match(blocks.schedule_admin_set_student_sort_mode, /(?:name_asc|alphabetical_asc|a_to_z|'asc')/i);
assert.match(blocks.schedule_admin_set_student_sort_mode, /(?:name_desc|alphabetical_desc|z_to_a|'desc')/i);
assert.match(blocks.schedule_admin_set_student_sort_mode, /custom/i);
assert.match(blocks.schedule_admin_reorder_students, /p_student_ids\s+uuid\[\]/i);
assert.match(blocks.schedule_admin_reorder_students, /sort_order/i);
assertOneOf(
  blocks.schedule_admin_reorder_students,
  [/duplicates?/i, /count\s*\(\s*distinct/i, /cardinality[\s\S]*(?:<>|!=)/i],
  "custom reordering must reject duplicate or incomplete student ID lists"
);

// Per-system access controls use a validated JSON object and optimistic concurrency.
assert.match(blocks.schedule_admin_set_student_access, /p_access\s+jsonb/i);
assert.match(blocks.schedule_admin_set_student_access, /p_expected_updated_at\s+timestamptz/i);
assert.match(blocks.schedule_admin_set_student_access, /jsonb_typeof\s*\(\s*p_access\s*\)\s*(?:<>|!=)\s*'object'/i);
assert.match(blocks.schedule_admin_set_student_access, /update\s+public\.flashcard_students/i);
assert.match(blocks.schedule_admin_set_student_access, /updated_at\s*=\s*p_expected_updated_at|p_expected_updated_at[\s\S]*(?:stale|conflict|modified|changed)/i);

// Reactivation must be explicit, concurrency checked and session-safe.
assert.match(blocks.schedule_admin_reactivate_student, /p_expected_deleted_at\s+timestamptz/i);
assert.match(blocks.schedule_admin_reactivate_student, /deleted_at\s*=\s*null/i);
assert.match(blocks.schedule_admin_reactivate_student, /deleted_at\s*=\s*p_expected_deleted_at|p_expected_deleted_at[\s\S]*(?:stale|conflict|modified|changed)/i);
assert.match(blocks.schedule_admin_reactivate_student, /delete\s+from\s+public\.flashcard_student_sessions/i, "reactivation must invalidate stale student sessions");

// Audit logs are server-paginated and return a total for accessible page controls.
assert.match(blocks.schedule_admin_get_student_account_audit, /p_student_id\s+uuid/i);
assert.match(blocks.schedule_admin_get_student_account_audit, /p_limit\s+integer/i);
assert.match(blocks.schedule_admin_get_student_account_audit, /p_offset\s+integer/i);
assert.match(blocks.schedule_admin_get_student_account_audit, /total_count/i);
assert.match(blocks.schedule_admin_get_student_account_audit, /p_limit[\s\S]*(?:least|between|>|<)/i, "audit page size must be bounded server-side");

// Permanent deletion is a two-phase operation: inspect impact, then verify every
// piece of state again while holding the target row before deleting it.
assert.match(blocks.schedule_admin_get_student_deletion_impact, /p_student_id\s+uuid/i);
assert.match(blocks.schedule_admin_get_student_deletion_impact, /dependency|dependenc|audit|count/i);
assert.match(blocks.schedule_admin_permanently_delete_student, /p_typed_name\s+text/i);
assert.match(blocks.schedule_admin_permanently_delete_student, /p_expected_updated_at\s+timestamptz/i);
assert.match(blocks.schedule_admin_permanently_delete_student, /p_expected_dependency_counts\s+jsonb/i);
assert.match(blocks.schedule_admin_permanently_delete_student, /p_expected_audit_count\s+(?:bigint|integer)/i);
assert.match(blocks.schedule_admin_permanently_delete_student, /for\s+(?:no\s+key\s+)?update/i, "permanent deletion must lock the student row before validating and deleting");
assert.match(blocks.schedule_admin_permanently_delete_student, /p_typed_name[\s\S]*(?:student\.name|v_student_name)[\s\S]*(?:<>|!=|is\s+distinct\s+from)/i, "permanent deletion must compare the typed name with the current account name");
assert.match(blocks.schedule_admin_permanently_delete_student, /public\._schedule_student_dependency_snapshot\s*\(\s*p_student_id\s*\)/i, "permanent deletion must recalculate the complete FK dependency snapshot inside the locked transaction");
assert.match(blocks.schedule_admin_permanently_delete_student, /not\s+in\s*\(\s*'CASCADE'\s*,\s*'SET NULL'\s*,\s*'MANUAL CASCADE'\s*\)/i, "permanent deletion must abort rather than silently orphan a non-cascading dependency");
assert.match(blocks.schedule_admin_permanently_delete_student, /delete\s+from\s+public\.flashcard_students/i);

// No public RPC return signature may expose a password, password hash or
// reversible credential. Password reset inputs are deliberately not forbidden.
for (const match of combinedSql.matchAll(/create\s+or\s+replace\s+function\s+public\.([a-z0-9_]+)\s*\([\s\S]*?\)\s*returns\s+table\s*\(([\s\S]*?)\)\s*language/gi)) {
  const [, name, returnedColumns] = match;
  assert.doesNotMatch(returnedColumns, /\b(?:password|password_hash|plaintext_password|credential_secret)\b/i, `${name} must not return credentials`);
}
for (const name of rpcNames) {
  assert.doesNotMatch(blocks[name], /return\s+query[\s\S]{0,500}\bpassword_hash\b/i, `${name} must not select a password hash into its response`);
}
assert.doesNotMatch(scheduleJs, /\b(?:passwordHash|password_hash|plaintextPassword|plaintext_password)\b/, "the admin UI must never receive or render stored credentials");

// UI contracts: access toggles (including all on/off), active/inactive views,
// ordering, manual rearrangement, paginated logs and typed permanent deletion.
assertOneOf(scheduleHtml, [/data-student-status-filter/i, /data-account-status-filter/i, /data-show-inactive-students/i], "admin UI needs an active/inactive status filter");
assert.match(scheduleHtml, /(?:使用中|啟用中|有效帳戶)|value=["']active["']/i);
assert.match(scheduleHtml, /(?:已停用|停用帳戶)|value=["']inactive["']/i);

assertOneOf(scheduleHtml, [/data-student-sort/i, /data-account-sort/i], "admin UI needs a persistent student sort selector");
assert.match(scheduleHtml, /(?:A\s*(?:→|-|to)\s*Z|name_asc|alphabetical_asc)/i);
assert.match(scheduleHtml, /(?:Z\s*(?:→|-|to)\s*A|name_desc|alphabetical_desc)/i);
assert.match(scheduleHtml, /(?:自訂排序|custom)/i);
assertOneOf(scheduleJs, [/向上移/i, /aria-label[\s\S]{0,120}(?:move up|上移)/i], "custom order needs an accessible move-up control");
assertOneOf(scheduleJs, [/向下移/i, /aria-label[\s\S]{0,120}(?:move down|下移)/i], "custom order needs an accessible move-down control");

assertOneOf(scheduleHtml, [/data-access-all-on/i, /data-(?:enable|open)-all-access/i, /data-set-student-access=["']true["']/i, /全部(?:開啟|啟用)/i], "access editor needs an all-on action");
assertOneOf(scheduleHtml, [/data-access-all-off/i, /data-(?:disable|close)-all-access/i, /data-set-student-access=["']false["']/i, /全部(?:關閉|停用|取消)/i], "access editor needs an all-off action");
assertOneOf(scheduleHtml, [/data-student-access/i, /data-account-access/i, /系統權限/i], "student cards need per-system access controls");
assertOneOf(`${scheduleHtml}\n${scheduleJs}`, [/data-reactivate-student/i, /data-(?:profile-)?reactivate-student/i, /data-restore-student/i, /重新啟用/i], "inactive accounts need a reactivation action");

assertOneOf(scheduleHtml, [/data-account-audit/i, /data-student-audit/i, /帳戶紀錄/i], "student account audit needs a visible panel");
assertOneOf(scheduleHtml, [/data-audit-previous/i, /data-(?:log|audit)-prev/i, /上一頁/i], "audit pagination needs a previous-page action");
assertOneOf(scheduleHtml, [/data-audit-next/i, /data-(?:log|audit)-next/i, /下一頁/i], "audit pagination needs a next-page action");

assertOneOf(scheduleHtml, [/data-permanent-delete/i, /永久刪除/i], "admin UI needs a clearly destructive permanent-delete action");
assertOneOf(scheduleHtml, [/data-delete-confirm-name/i, /data-permanent-delete-name/i, /輸入[^<]{0,16}(?:學生|帳戶)?名稱/i], "permanent deletion must require typed-name confirmation");
assert.match(scheduleHtml, /永久刪除[\s\S]{0,1200}(?:無法復原|不能復原|不可復原)/i);

for (const rpc of rpcNames) {
  assert.match(scheduleJs, new RegExp(`["']${escapeRegExp(rpc)}["']`), `Schedule UI must call ${rpc}`);
}
assert.match(scheduleJs, /p_status:\s*["']all["'][\s\S]{0,220}p_limit:[\s\S]{0,120}p_offset:/i, "student-account pages must request an explicit status, limit and offset");
assert.match(scheduleJs, /Object\.fromEntries\(allStudentAccessKeys\(\)\.map\(\(key\)\s*=>\s*\[key,\s*enabled\]\)\)/i, "all-on/all-off must update every registered access key, including child sections");
assert.match(scheduleJs, /schedule_admin_set_student_access[\s\S]{0,400}p_expected_updated_at:\s*student\.updated_at/i);
assert.match(scheduleJs, /schedule_admin_get_student_account_audit[\s\S]{0,400}p_limit:[\s\S]{0,160}p_offset:/i);
assert.match(scheduleJs, /schedule_admin_reactivate_student[\s\S]{0,350}p_expected_deleted_at:\s*student\.deleted_at/i);
assert.match(scheduleJs, /schedule_admin_permanently_delete_student[\s\S]{0,700}p_typed_name:[\s\S]{0,160}p_expected_updated_at:[\s\S]{0,180}p_expected_dependency_counts:[\s\S]{0,180}p_expected_audit_count:/i);
assert.match(scheduleJs, /card\.draggable\s*=\s*[^;]*studentSortMode\s*===\s*["']custom["']/i, "custom ordering needs pointer drag support restricted to custom mode");
assert.match(scheduleJs, /studentList\.addEventListener\(\s*["']dragstart["']/i);
assert.match(scheduleJs, /studentList\.addEventListener\(\s*["']drop["']/i);
const orderDatasetWriter = scheduleJs.match(/(?:up|down)\.dataset\.([a-z0-9_]+)\s*=\s*student\.id/i)?.[1];
const orderDatasetReader = scheduleJs.match(/moveStudentOrder\(\s*order\.dataset\.([a-z0-9_]+)/i)?.[1];
assert.ok(orderDatasetWriter, "move-up/down controls must attach the student ID to their dataset");
assert.equal(orderDatasetReader, orderDatasetWriter, "move-up/down controls must read the same student-ID dataset key that rendering writes");
assertOneOf(
  scheduleJs,
  [
    /typedName[\s\S]{0,300}(?:accountName|studentName)[\s\S]{0,120}(?:!==|!=)/i,
    /(?:accountName|studentName)[\s\S]{0,300}typedName[\s\S]{0,120}(?:!==|!=)/i,
    /typedName\s*(?:!==|!=)\s*impact\.name/i,
    /(?:deleteConfirmName|permanentDeleteName)[\s\S]{0,300}(?:trim|normalize)/i
  ],
  "the browser must reject permanent deletion before the RPC when the typed name does not match"
);
assert.match(scheduleHtml, /單向加密儲存[\s\S]{0,180}(?:不能顯示舊密碼|不(?:會|可)顯示)/i, "admin UI must clearly state that stored passwords cannot be viewed");

console.log("Schedule account-admin parity verified: secure access, lifecycle, ordering, audit pagination and typed permanent deletion.");
