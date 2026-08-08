import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const basePath = path.join(root, "supabase-proverb-system.sql");
const migrationPath = path.join(root, "supabase-proverb-system-lessons-2-3.sql");
const base = fs.readFileSync(basePath, "utf8");

function block(startMarker, endMarker) {
  const start = base.indexOf(startMarker);
  const end = base.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end <= start) throw new Error(`Could not extract SQL block: ${startMarker}`);
  return base.slice(start, end).trimEnd();
}

const resultValidator = block(
  "create or replace function public._proverb_system_result_valid(",
  "create or replace function public._proverb_system_bookmark_payload_valid("
);
const bookmarkValidator = block(
  "create or replace function public._proverb_system_bookmark_payload_valid(",
  "-- Administrators are intentionally subsystem-specific."
);
const upsertAttempt = block(
  "create or replace function public.proverb_system_upsert_attempt(",
  "create or replace function public.proverb_system_get_attempt("
);
const listBookmarksPage = block(
  "create or replace function public.proverb_system_list_bookmarks_page(",
  "create or replace function public.proverb_system_admin_list_students("
);
const adminListBookmarksPage = block(
  "create or replace function public.proverb_system_admin_list_bookmarks_page(",
  "-- Remove PostgreSQL's default PUBLIC execute privilege"
);

const output = `-- Expand the existing Proverb System from lesson 1 to lessons 1–3.\n`
  + `-- Apply this forward migration to an existing production database; do not\n`
  + `-- rerun the full baseline migration on a populated project.\n\n`
  + `begin;\n\n`
  + `set local lock_timeout = '5s';\n`
  + `set local statement_timeout = '2min';\n\n`
  + `select pg_catalog.pg_advisory_xact_lock(\n`
  + `  pg_catalog.hashtextextended('proverb-system-lessons-2-3', 0)\n`
  + `);\n\n`
  + `do $$\n`
  + `begin\n`
  + `  if to_regclass('public.proverb_system_attempts') is null\n`
  + `    or to_regclass('public.proverb_system_bookmarks') is null\n`
  + `  then\n`
  + `    raise exception 'The Proverb System baseline migration must be installed first';\n`
  + `  end if;\n`
  + `  if exists (\n`
  + `    select 1 from public.proverb_system_attempts\n`
  + `    where lesson_id not in ('proverb-01', 'proverb-02', 'proverb-03')\n`
  + `  ) or exists (\n`
  + `    select 1 from public.proverb_system_bookmarks\n`
  + `    where lesson_id not in ('proverb-01', 'proverb-02', 'proverb-03')\n`
  + `  ) then\n`
  + `    raise exception 'Unexpected Proverb lesson IDs prevent safe constraint expansion';\n`
  + `  end if;\n`
  + `end;\n`
  + `$$;\n\n`
  + `${resultValidator}\n\n`
  + `${bookmarkValidator}\n\n`
  + `alter table public.proverb_system_attempts\n`
  + `  drop constraint if exists proverb_system_attempts_lesson_id_check;\n`
  + `alter table public.proverb_system_attempts\n`
  + `  add constraint proverb_system_attempts_lesson_id_check\n`
  + `  check (lesson_id in ('proverb-01', 'proverb-02', 'proverb-03')) not valid;\n`
  + `alter table public.proverb_system_attempts\n`
  + `  validate constraint proverb_system_attempts_lesson_id_check;\n\n`
  + `alter table public.proverb_system_bookmarks\n`
  + `  drop constraint if exists proverb_system_bookmarks_lesson_id_check;\n`
  + `alter table public.proverb_system_bookmarks\n`
  + `  add constraint proverb_system_bookmarks_lesson_id_check\n`
  + `  check (lesson_id in ('proverb-01', 'proverb-02', 'proverb-03')) not valid;\n`
  + `alter table public.proverb_system_bookmarks\n`
  + `  validate constraint proverb_system_bookmarks_lesson_id_check;\n\n`
  + `alter table public.proverb_system_bookmarks\n`
  + `  drop constraint if exists proverb_system_bookmarks_check;\n`
  + `alter table public.proverb_system_bookmarks\n`
  + `  drop constraint if exists proverb_system_bookmarks_question_id_check;\n`
  + `alter table public.proverb_system_bookmarks\n`
  + `  add constraint proverb_system_bookmarks_question_id_check\n`
  + `  check (\n`
  + `    (question_id = '__section__' and include_answer = false)\n`
  + `    or question_id ~ ('^' || lesson_id || '-q(0[1-9]|[1-4][0-9]|50)$')\n`
  + `  ) not valid;\n`
  + `alter table public.proverb_system_bookmarks\n`
  + `  validate constraint proverb_system_bookmarks_question_id_check;\n\n`
  + `${upsertAttempt}\n\n`
  + `${listBookmarksPage}\n\n`
  + `${adminListBookmarksPage}\n\n`
  + `revoke all on function public._proverb_system_result_valid(text, jsonb)\n`
  + `  from public, anon, authenticated, service_role;\n`
  + `revoke all on function public._proverb_system_bookmark_payload_valid(jsonb)\n`
  + `  from public, anon, authenticated, service_role;\n`
  + `revoke all on function public.proverb_system_upsert_attempt(\n`
  + `  uuid, uuid, text, text, text, integer, integer, integer, integer,\n`
  + `  timestamptz, jsonb\n`
  + `) from public, anon, authenticated;\n`
  + `grant execute on function public.proverb_system_upsert_attempt(\n`
  + `  uuid, uuid, text, text, text, integer, integer, integer, integer,\n`
  + `  timestamptz, jsonb\n`
  + `) to service_role;\n`
  + `revoke all on function public.proverb_system_list_bookmarks_page(uuid, integer, integer)\n`
  + `  from public, anon, authenticated;\n`
  + `grant execute on function public.proverb_system_list_bookmarks_page(uuid, integer, integer)\n`
  + `  to service_role;\n`
  + `revoke all on function public.proverb_system_admin_list_bookmarks_page(uuid, uuid, integer, integer)\n`
  + `  from public, anon, authenticated;\n`
  + `grant execute on function public.proverb_system_admin_list_bookmarks_page(uuid, uuid, integer, integer)\n`
  + `  to service_role;\n\n`
  + `notify pgrst, 'reload schema';\n\n`
  + `commit;\n`;

fs.writeFileSync(migrationPath, output);
console.log(`Wrote ${path.relative(root, migrationPath)}`);
