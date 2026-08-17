import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const forwardPath = new URL(
  "../supabase-phrasal-verb-stale-snapshot-noop-20260817.sql",
  import.meta.url,
);
const rollbackPath = new URL(
  "../supabase-phrasal-verb-stale-snapshot-noop-rollback-20260817.sql",
  import.meta.url,
);
const verificationPath = new URL(
  "../supabase-phrasal-verb-stale-snapshot-noop-verification-20260817.sql",
  import.meta.url,
);
const canonicalPath = new URL(
  "../supabase-phrasal-verb-system.sql",
  import.meta.url,
);

const [forward, rollback, verification, canonical] = await Promise.all([
  readFile(forwardPath, "utf8"),
  readFile(rollbackPath, "utf8"),
  readFile(verificationPath, "utf8"),
  readFile(canonicalPath, "utf8"),
]);

for (const [name, sql] of [
  ["forward", forward],
  ["rollback", rollback],
  ["verification", verification],
]) {
  assert.match(sql, /^begin;/m, `${name} must be transactional`);
  assert.match(sql, /set local lock_timeout = '5s';/);
  assert.match(sql, /set local statement_timeout = '60s';/);
  assert.doesNotMatch(sql, /\b(?:insert|update|delete)\s+public\.flashcard_students\b/i);
}

assert.match(
  forward,
  /create or replace function public\._phrasal_verb_system_snapshot_is_dominated\(/,
);
assert.match(forward, /edmund-phrasal-verb-stale-snapshot-noop-v1/);
assert.match(forward, /c898446011c53c15ecbb5a8040674537/);
assert.match(forward, /Unreviewed Phrasal upsert drift; refusing blind overwrite/);
assert.match(forward, /PHRASAL_STALE_SNAPSHOT_NOOP_V1/);
assert.match(
  forward,
  /revoke all on function public\._phrasal_verb_system_snapshot_is_dominated\(jsonb, jsonb\)[\s\S]*from public, anon, authenticated, service_role;/,
);
assert.doesNotMatch(
  forward,
  /grant\s+execute\s+on\s+function\s+public\._phrasal_verb_system_snapshot_is_dominated/i,
);
assert.match(
  forward,
  /public\._phrasal_verb_system_snapshot_is_dominated\(\s*v_existing\.result,\s*p_result\s*\)/,
);
assert.match(
  forward,
  /raise exception 'Attempt progress cannot move backwards'[\s\S]*errcode = '22023'/,
);
assert.match(
  forward,
  /Deliberately do|deliberately do/i,
  "the no-op branch must remain explicit for reviewers",
);

assert.match(
  rollback,
  /drop function if exists public\._phrasal_verb_system_snapshot_is_dominated\(jsonb, jsonb\);/,
);
assert.doesNotMatch(
  rollback,
  /_phrasal_verb_system_snapshot_is_dominated\(\s*v_existing\.result/i,
);
assert.match(
  rollback,
  /if p_round_number < v_existing\.round_number[\s\S]*raise exception 'Attempt progress cannot move backwards'/,
);

assert.match(verification, /Dominated retry mutated the canonical row/);
assert.match(verification, /Disjoint stale retry was not rejected/);
assert.match(verification, /Migration changed the existing upsert client ACL/);
assert.match(verification, /Internal dominance helper is client-executable/);
assert.match(verification, /Phrasal upsert migration marker is missing/);
assert.match(verification.trimEnd(), /rollback;$/);

assert.match(
  canonical,
  /create or replace function public\._phrasal_verb_system_snapshot_is_dominated\(/,
);
assert.match(canonical, /PHRASAL_STALE_SNAPSHOT_NOOP_V1/);
assert.match(
  canonical,
  /public\._phrasal_verb_system_snapshot_is_dominated\(\s*v_existing\.result,\s*p_result\s*\)/,
);
assert.match(
  canonical,
  /revoke all on function public\._phrasal_verb_system_snapshot_is_dominated\(jsonb, jsonb\)[\s\S]*from public, anon, authenticated, service_role;/,
);

console.log(`Phrasal stale-snapshot migration contract OK: ${root}`);
