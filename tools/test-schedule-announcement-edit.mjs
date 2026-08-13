import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [sql, worker, html, client] = await Promise.all([
  read("supabase-schedule-announcement-edit.sql"),
  read("workers/schedule-system/src/index.js"),
  read("schedule-system.html"),
  read("schedule-system.js")
]);

const normalizedSql = sql.replace(/--[^\n]*\n/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
const signature = [
  "p_service_secret text",
  "p_admin_token uuid",
  "p_id uuid",
  "p_expected_version integer",
  "p_message text",
  "p_image_action text",
  "p_image_content text",
  "p_image_content_type text",
  "p_is_active boolean"
].join(", ");
const functionTypes = "text, uuid, uuid, integer, text, text, text, text, boolean";

assert.ok(normalizedSql.startsWith("begin;"), "the incremental migration must be transactional");
assert.ok(normalizedSql.endsWith("commit;"), "the incremental migration must commit explicitly");
assert.ok(
  normalizedSql.includes(`create or replace function public.schedule_announcement_admin_update( ${signature} )`),
  "the versioned announcement-update RPC signature changed"
);
assert.ok(
  normalizedSql.includes("language plpgsql security definer set search_path = ''"),
  "the mutation RPC must use an empty search_path under security definer"
);
assert.ok(normalizedSql.includes("public._schedule_worker_ok(p_service_secret)"));
assert.ok(normalizedSql.includes("public._schedule_admin_id(p_admin_token)"));

assert.ok(
  normalizedSql.includes("p_image_action not in ('keep', 'replace', 'remove')"),
  "only the explicit keep/replace/remove image actions may cross the SQL boundary"
);
assert.ok(
  normalizedSql.includes("p_image_action in ('keep', 'remove') and (p_image_content is not null or p_image_content_type is not null)"),
  "keep/remove must reject unexpected replacement bytes"
);
assert.ok(normalizedSql.includes("if p_image_action = 'replace' then"));
assert.ok(normalizedSql.includes("v_image := decode(p_image_content, 'base64')"));
assert.ok(normalizedSql.includes("octet_length(v_image) not between 1 and 5242880"));
assert.ok(
  normalizedSql.includes("image_content = case p_image_action when 'keep' then announcement.image_content when 'remove' then null else v_image end"),
  "image bytes must be retained, removed, or replaced according to the declared action"
);
assert.ok(
  normalizedSql.includes("image_content_type = case p_image_action when 'keep' then announcement.image_content_type when 'remove' then null else p_image_content_type end"),
  "the image MIME type must follow the same image action"
);

assert.ok(
  normalizedSql.includes("version = announcement.version + 1"),
  "a successful edit must increment the announcement version"
);
assert.ok(
  normalizedSql.includes("where announcement.id = p_id and announcement.version = p_expected_version and announcement.version < 2147483647"),
  "the update must use the supplied version as an optimistic concurrency predicate"
);
assert.ok(normalizedSql.includes("if not found then return; end if;"));

const revokeContract = `revoke all on function public.schedule_announcement_admin_update( ${functionTypes} ) from public, anon, authenticated, service_role;`;
const grantContract = `grant execute on function public.schedule_announcement_admin_update( ${functionTypes} ) to anon;`;
assert.ok(normalizedSql.includes(revokeContract), "the RPC must revoke inherited execution from every broad role");
assert.ok(normalizedSql.includes(grantContract), "only the Worker-facing anon role should receive execute");
assert.doesNotMatch(normalizedSql, /grant\s+(?:select|insert|update|delete|all)\s+on\s+table/);
assert.doesNotMatch(
  normalizedSql,
  /grant execute on function public\.schedule_announcement_admin_update\([^)]+\) to (?:public|authenticated|service_role)/
);

assert.match(worker, /rpc\(env, "schedule_announcement_admin_update", \{/);
for (const argument of [
  "p_admin_token",
  "p_id",
  "p_expected_version",
  "p_message",
  "p_image_action",
  "p_image_content",
  "p_image_content_type",
  "p_is_active"
]) {
  assert.match(worker, new RegExp(`\\b${argument}:`), `Worker is missing ${argument}`);
}
assert.match(worker, /Announcement changed elsewhere; reload and try again/);

for (const action of ["keep", "replace", "remove"]) {
  assert.match(html, new RegExp(`<option value="${action}">`), `Admin UI is missing image action ${action}`);
}
assert.match(client, /body\.set\("expectedVersion", String\(state\.editingAnnouncementVersion\)\)/);
assert.match(client, /body\.set\("imageAction", imageAction\)/);

console.log("Schedule announcement edit migration contract passed.");
