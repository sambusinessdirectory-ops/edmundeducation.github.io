#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");
const [html, css, js, config, schema, bcryptMigration, home, nav, learningConfig, pagesWorkflow] = await Promise.all([
  read("song-appreciation.html"), read("song-appreciation.css"), read("song-appreciation.js"),
  read("song-appreciation-config.js"), read("supabase-song-appreciation.sql"),
  read("supabase-song-appreciation-admin-bcrypt-compatibility.sql"), read("index.html"),
  read("shared-system-nav.js"), read("learning-portal-config.js"), read(".github/workflows/pages.yml")
]);

function between(source, startMarker, endMarker, label) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `${label} is missing ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `${label} is missing ${endMarker}`);
  return source.slice(start, end);
}

function assertRequiresRpcResult(block, label) {
  assert.doesNotMatch(block, /\b(?:row|result|saved|deleted)\s*\|\|/, `${label} must not synthesize a successful RPC result`);
  assert.ok(
    /require(?:d)?(?:Rpc)?(?:Row|Result|Success)\s*\(/i.test(block)
      || /if\s*\(\s*!(?:row|result|saved|deleted)\s*\)\s*(?:\{|throw\b)/s.test(block)
      || /if\s*\(\s*!(?:row|result|saved)\?\.(?:id|success)\b[\s\S]{0,250}?throw\s+new\s+Error/.test(block)
      || /if\s*\(\s*(?:row|result|saved|deleted)\s*!==\s*true\s*\)\s*(?:\{|throw\b)/s.test(block),
    `${label} must reject an empty or false RPC result`
  );
}

for (const marker of [
  'data-view="login"', 'data-login-form="student"', 'data-login-form="admin"',
  'data-learning-dashboard', 'data-dashboard-toggle', 'data-question-chart', 'data-time-chart',
  'data-song-search', 'data-song-grid', 'data-song-tab="description"', 'data-song-tab="translation"',
  'data-song-tab="exercise"', 'data-translation-columns', 'data-bookmark-selection', 'data-mode-grid',
  'data-countdown-value', 'data-seek="-10"', 'data-seek="10"', 'data-submit-exercise',
  'data-relisten', 'data-result-relisten', 'data-admin-song-list', 'data-youtube-preview',
  'name="tags"', 'data-student-access-list'
]) assert.ok(html.includes(marker), `song-appreciation.html is missing ${marker}`);

assert.match(html, /Content-Security-Policy[^>]*cdn\.jsdelivr\.net[^>]*youtube\.com[^>]*ookkxzgpdclzrrhfmvqx\.supabase\.co/i);
assert.doesNotMatch(html, /unsafe-eval/i);
assert.match(html, /meta name="robots" content="noindex, nofollow"/);
assert.match(html, /pwa-manifests\/song-appreciation\.webmanifest/);
assert.match(html, /data-edmund-system-switcher data-system="song-appreciation"/);

for (const pattern of [
  /flashcard_student_login/, /student_list_songs/, /student_get_song/, /admin_set_access/,
  /bookmark_add/, /bookmark_delete/, /attempt_save/, /youtubeVideoId/, /i\.ytimg\.com\/vi/,
  /getSelection/, /kind: "phrase"/, /kind: "word"/, /remaining = 30/, /seekPlayer\(delta\)/,
  /exercise\.answers\[number\] = option/, /p_mode_id/, /p_exercise_version/, /dailyAttemptSeries/,
  /dashboardPreferenceKey/, /aria-checked/, /player\.seekTo\(0, true\)/, /fetchAllPages/,
  /cancelReadCountdown/, /includeAnswers: false/, /validateSavedAttempt/, /revealServerResult/
]) assert.match(`${config}\n${js}`, pattern);

for (const pattern of [
  /\.translation-columns\s*\{[^}]*grid-template-columns:\s*1fr 1fr/s,
  /\.choice-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3/s,
  /\.choice-button\.is-selected/, /\.choice-button\.is-correct/, /\.choice-button\.is-wrong/,
  /@media \(max-width: 980px\)/, /\.learning-dashboard/, /\.chart-card--time/
]) assert.match(css, pattern);

// Song source material and answer keys are database content. They must never be
// loaded from, or embedded in, a publicly deployable JavaScript asset.
assert.doesNotMatch(html, /song-appreciation-data\.js|EDMUND_SONG_APPRECIATION_DATA/i);
const deployableSongSources = `${html}\n${config}\n${js}`;
for (const protectedMarker of [
  "EDMUND_SONG_APPRECIATION_DATA",
  "mergeSongWithSeed",
  "You, with your words like knives",
  "Got me feeling like I",
  "《Mean》描寫被欺凌"
]) assert.ok(!deployableSongSources.includes(protectedMarker), `deployable Song Appreciation code exposes ${protectedMarker}`);

// Opening a song must always revalidate the bearer token and per-song access;
// list metadata or a previously opened in-memory song is never authoritative.
const openSong = between(js, "async function openSong", "function renderSong", "openSong");
assert.match(openSong, /await rpc\(CONFIG\.rpc\.getSong,\s*\{[\s\S]*?p_student_token:[\s\S]*?p_song_id:/);
assert.doesNotMatch(openSong, /if\s*\([^)]*(?:translations|modes)[^)]*\)\s*\{[\s\S]*?CONFIG\.rpc\.getSong/, "openSong must not conditionally skip access revalidation");
assert.match(openSong, /if\s*\(\s*!row\s*\)[\s\S]*?(?:throw|return)/);

// Mutations must only update local state after the database confirms a row or
// true deletion. Empty RPC results represent expired/revoked authorization.
const addBookmark = between(js, "async function addBookmark", "async function deleteBookmark", "addBookmark");
const deleteBookmark = between(js, "async function deleteBookmark", "function renderBookmarks", "deleteBookmark");
const submitExercise = between(js, "async function submitExercise", "let youtubeApiPromise", "submitExercise");
assertRequiresRpcResult(addBookmark, "addBookmark");
assertRequiresRpcResult(deleteBookmark, "deleteBookmark");
assertRequiresRpcResult(submitExercise, "submitExercise");

// The browser submits answers and timing only. Result, correct_count and
// total_count are calculated from the protected exercise stored by Postgres.
const attemptRpcCall = between(submitExercise, "CONFIG.rpc.saveAttempt", "}));", "attempt-save RPC call");
for (const parameter of [
  "p_student_token", "p_attempt_id", "p_song_id", "p_mode_id", "p_exercise_version",
  "p_answers", "p_duration_ms", "p_started_at", "p_completed_at"
]) assert.match(attemptRpcCall, new RegExp(`\\b${parameter}\\b`), `attempt-save call is missing ${parameter}`);
for (const forbiddenParameter of ["p_result", "p_correct_count", "p_total_count"])
  assert.doesNotMatch(attemptRpcCall, new RegExp(`\\b${forbiddenParameter}\\b`), `browser must not submit ${forbiddenParameter}`);

const attemptSql = between(
  schema,
  "create or replace function public.song_appreciation_attempt_save(",
  "create or replace function public.song_appreciation_admin_list_songs(",
  "song_appreciation_attempt_save"
);
const attemptSignature = attemptSql.slice(0, attemptSql.indexOf("returns table"));
for (const parameter of [
  "p_student_token uuid", "p_attempt_id uuid", "p_song_id uuid", "p_mode_id text",
  "p_exercise_version integer", "p_answers jsonb", "p_duration_ms bigint",
  "p_started_at timestamptz", "p_completed_at timestamptz"
]) assert.ok(attemptSignature.includes(parameter), `attempt-save SQL signature is missing ${parameter}`);
for (const forbiddenParameter of ["p_result", "p_correct_count", "p_total_count"])
  assert.ok(!attemptSignature.includes(forbiddenParameter), `attempt-save SQL must calculate ${forbiddenParameter.slice(2)}`);
assert.match(attemptSql, /song\.exercises|v_exercises|exercise_row\.exercise/i, "attempt-save must read the protected stored exercise");
assert.match(attemptSql, /jsonb_array_elements|jsonb_path_query/i, "attempt-save must inspect stored questions");
assert.match(attemptSql, /->>\s*'answer'|\[\s*'answer'\s*\]/i, "attempt-save must grade against stored answers");

for (const table of [
  "song_appreciation_admin_accounts", "song_appreciation_admin_sessions", "song_appreciation_songs",
  "song_appreciation_access_overrides", "song_appreciation_bookmarks", "song_appreciation_attempts",
  "song_appreciation_admin_login_throttles"
]) {
  assert.match(schema, new RegExp(`create table if not exists public\\.${table}`));
  assert.match(schema, new RegExp(`alter table public\\.${table} enable row level security`));
  assert.match(schema, new RegExp(`revoke all on table public\\.${table}`));
}
for (const routine of [
  "song_appreciation_admin_login", "song_appreciation_admin_me", "song_appreciation_admin_logout",
  "song_appreciation_student_me", "song_appreciation_student_list_songs", "song_appreciation_student_get_song",
  "song_appreciation_bookmark_list", "song_appreciation_bookmark_add", "song_appreciation_bookmark_delete",
  "song_appreciation_attempt_list", "song_appreciation_attempt_save", "song_appreciation_admin_list_songs",
  "song_appreciation_admin_upsert_song", "song_appreciation_admin_list_students_with_access",
  "song_appreciation_admin_set_access"
]) assert.match(schema, new RegExp(`create or replace function public\\.${routine}`));
const adminUpsertSql = between(
  schema,
  "create or replace function public.song_appreciation_admin_upsert_song(",
  "create or replace function public.song_appreciation_admin_list_students_with_access(",
  "song_appreciation_admin_upsert_song"
);
assert.match(
  adminUpsertSql,
  /on conflict on constraint song_appreciation_songs_pkey do update/i,
  "song upsert must name the primary-key constraint instead of colliding with its id output column"
);
assert.doesNotMatch(
  adminUpsertSql,
  /on conflict\s*\(\s*id\s*\)/i,
  "song upsert must not use an ambiguous bare id conflict target"
);
assert.match(schema, /password_hash text not null/);
assert.ok(
  schema.includes("check (password_hash ~ '^\\$2a\\$12\\$[./A-Za-z0-9]{53}$')"),
  "admin table must accept only the cost-12 $2a$ bcrypt identifier supported by pgcrypto"
);
const provisionAdminSql = between(
  schema,
  "create or replace function public.song_appreciation_provision_admin(",
  "create or replace function public.song_appreciation_admin_login(",
  "song_appreciation_provision_admin"
);
assert.ok(
  provisionAdminSql.includes("!~ '^\\$2a\\$12\\$[./A-Za-z0-9]{53}$'"),
  "admin provisioning must reject unsupported $2b$ and $2y$ bcrypt identifiers"
);
assert.doesNotMatch(
  `${schema.slice(schema.indexOf("create table if not exists public.song_appreciation_admin_accounts"), schema.indexOf("create table if not exists public.song_appreciation_admin_sessions"))}\n${provisionAdminSql}`,
  /\\\$2\[aby\]/,
  "admin storage and provisioning must not accept bcrypt identifiers pgcrypto cannot verify"
);
for (const pattern of [
  /drop constraint if exists song_appreciation_admin_accounts_password_hash_check/,
  /check \(password_hash ~ '\^\\\$2a\\\$12\\\$\[\.\/A-Za-z0-9\]\{53\}\$'\)/,
  /create or replace function public\.song_appreciation_provision_admin/,
  /!~ '\^\\\$2a\\\$12\\\$\[\.\/A-Za-z0-9\]\{53\}\$'/,
  /revoke all on function public\.song_appreciation_provision_admin\(text, text\)[\s\S]*?from public, anon, authenticated, service_role/
]) assert.match(bcryptMigration, pattern, "bcrypt compatibility migration must preserve the $2a$-only owner contract");
assert.match(schema, /extensions\.digest\([\s\S]*?'sha256'/);
assert.match(schema, /not public\._song_appreciation_student_can_access/);
assert.match(schema, /An absent row means allowed/);
assert.match(schema, /grant execute on function public\.song_appreciation_student_list_songs\(uuid\)[\s\S]*?to anon, authenticated/);

// The public admin-login RPC must throttle before doing bcrypt work. Known
// accounts have per-account buckets; arbitrary unknown names share one bucket.
const adminLoginSql = between(
  schema,
  "create or replace function public.song_appreciation_admin_login(",
  "create or replace function public.song_appreciation_admin_me(",
  "song_appreciation_admin_login"
);
for (const pattern of [
  /song_appreciation_admin_login_throttles/,
  /pg_advisory_xact_lock/,
  /else 'unknown'/,
  /failed_attempts\s*>=\s*5[\s\S]*?interval '15 minutes'/,
  /locked_until\s*>\s*v_now[\s\S]*?return/,
  /extensions\.gen_salt\('bf',\s*12\)/
]) assert.match(adminLoginSql, pattern);
assert.ok(
  adminLoginSql.indexOf("locked_until > v_now") < adminLoginSql.indexOf("extensions.crypt(p_password"),
  "admin login must enforce an active lock before starting bcrypt"
);
const adminSecurityTrigger = between(
  schema,
  "create or replace function public._song_appreciation_revoke_admin_sessions()",
  "drop trigger if exists song_appreciation_admin_security_change",
  "admin security-change trigger"
);
assert.match(adminSecurityTrigger, /delete from public\.song_appreciation_admin_sessions/);
assert.match(adminSecurityTrigger, /delete from public\.song_appreciation_admin_login_throttles/);
assert.match(schema, /revoke all on function public\._song_appreciation_revoke_admin_sessions\(\)[\s\S]*?from public, anon, authenticated, service_role/);

// Defense in depth: an accidentally retained private import file is excluded
// from Pages and the built artifact is scanned before upload.
assert.match(pagesWorkflow, /--exclude='song-appreciation-data\.js'/);
assert.match(pagesWorkflow, /Verify protected Song Appreciation data is absent from Pages artifact/);
assert.match(pagesWorkflow, /EDMUND_SONG_APPRECIATION_DATA/);
assert.match(pagesWorkflow, /You, with your words like knives/);
assert.match(pagesWorkflow, /Got me feeling like I/);

assert.match(home, /href="song-appreciation\.html"[^>]*>[\s\S]*?Song Appreciation<br>英文歌<br>聆聽練習/);
assert.match(home, /\.system-switch-card\s*\{[^}]*counter-increment:\s*none/s);
const linkedCards = [...home.matchAll(/<a\s+class="category\b[^>]*>/g)];
const songIndex = linkedCards.findIndex(match => match[0].includes('href="song-appreciation.html"'));
assert.equal(songIndex + 1, 50, "Song Appreciation must be linked homepage card 50");
assert.match(nav, /id: "song-appreciation", href: "song-appreciation\.html"/);
assert.match(nav, /"song-appreciation": "edmund-song-appreciation-session-v1"/);
assert.match(learningConfig, /ordinal: 51, id: "precise-language"/);

console.log("Song Appreciation checks passed (portal UI, protected DB delivery, server scoring, mutations, access, dashboard, admin, PWA and homepage card 50). ");
