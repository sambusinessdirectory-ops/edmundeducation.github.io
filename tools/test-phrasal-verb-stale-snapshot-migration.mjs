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
const branchForwardPath = new URL(
  "../supabase-phrasal-verb-branch-divergence-guard-20260817.sql",
  import.meta.url,
);
const branchRollbackPath = new URL(
  "../supabase-phrasal-verb-branch-divergence-guard-rollback-preflight-20260817.sql",
  import.meta.url,
);
const branchVerificationPath = new URL(
  "../supabase-phrasal-verb-branch-divergence-guard-verification-20260817.sql",
  import.meta.url,
);
const controlForwardPath = new URL(
  "../supabase-phrasal-verb-control-state-guard-20260817.sql",
  import.meta.url,
);
const controlRollbackPreflightPath = new URL(
  "../supabase-phrasal-verb-control-state-guard-rollback-preflight-20260817.sql",
  import.meta.url,
);
const controlVerificationPath = new URL(
  "../supabase-phrasal-verb-control-state-guard-verification-20260817.sql",
  import.meta.url,
);

const [
  forward,
  rollback,
  verification,
  canonical,
  branchForward,
  branchRollback,
  branchVerification,
  controlForward,
  controlRollbackPreflight,
  controlVerification,
] = await Promise.all([
  readFile(forwardPath, "utf8"),
  readFile(rollbackPath, "utf8"),
  readFile(verificationPath, "utf8"),
  readFile(canonicalPath, "utf8"),
  readFile(branchForwardPath, "utf8"),
  readFile(branchRollbackPath, "utf8"),
  readFile(branchVerificationPath, "utf8"),
  readFile(controlForwardPath, "utf8"),
  readFile(controlRollbackPreflightPath, "utf8"),
  readFile(controlVerificationPath, "utf8"),
]);

for (const [name, sql] of [
  ["forward", forward],
  ["rollback", rollback],
  ["verification", verification],
  ["branch-forward", branchForward],
  ["branch-rollback", branchRollback],
  ["branch-verification", branchVerification],
  ["control-forward", controlForward],
  ["control-rollback-preflight", controlRollbackPreflight],
  ["control-verification", controlVerification],
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

assert.match(branchForward, /PHRASAL_BRANCH_DIVERGENCE_GUARD_V2/);
assert.match(branchForward, /10af1df40e59487746e5c3f6f868ebf8/);
assert.match(branchForward, /82f2622814f04bd03651ffec3a6fe68c/);
assert.match(branchForward, /v_incoming_dominates/);
assert.match(branchForward, /v_canonical_dominates/);
assert.match(branchForward, /Attempt progress branches diverged/);
assert.match(
  branchForward,
  /revoke all on function public\.phrasal_verb_system_upsert_attempt\([\s\S]*from public, anon, authenticated, service_role;[\s\S]*grant execute[\s\S]*to service_role;/,
);
assert.doesNotMatch(branchForward, /\b(?:insert|update|delete)\s+public\.flashcard_students\b/i);
assert.match(branchRollback, /refusing rollback|refusing blind rollback/i);
assert.match(branchRollback, /DOES NOT weaken or replace the live function/);
assert.match(branchRollback.trimEnd(), /rollback;$/);
assert.match(branchVerification, /Monotonic-looking divergent branch was not rejected/);
assert.match(branchVerification, /Dominated stale retry changed canonical progress/);
assert.match(branchVerification, /Dominating forward progress was not accepted/);
assert.match(branchVerification.trimEnd(), /rollback;$/);
assert.match(canonical, /PHRASAL_BRANCH_DIVERGENCE_GUARD_V2/);
assert.match(canonical, /v_incoming_dominates/);
assert.match(canonical, /v_canonical_dominates/);
assert.match(canonical, /Attempt progress branches diverged/);

assert.match(controlForward, /PHRASAL_CONTROL_STATE_GUARD_V3/);
assert.match(controlForward, /52fcf6e23f9b1ff8444419c58804518e/);
assert.match(controlForward, /82f2622814f04bd03651ffec3a6fe68c/);
assert.match(controlForward, /d19560ebb208369b6cc5eadc6fa904ef/);
assert.match(controlForward, /PHRASAL_CONTROL_REVISION_V3/);
assert.match(controlForward, /v_existing_control_revision/);
assert.match(controlForward, /v_candidate_control_revision/);
assert.match(controlForward, /v_controls_equal/);
assert.match(controlForward, /2147483647/);
for (const controlKey of [
  "awaitingNextRound",
  "correctionMode",
  "correctionIds",
  "collapsedCorrectIds",
]) {
  assert.match(controlForward, new RegExp(controlKey));
}
assert.match(controlForward, /Unreviewed Phrasal V2 upsert drift/);
assert.match(controlForward, /Unreviewed Phrasal V2 dominance-helper drift/);
assert.match(
  controlForward,
  /revoke all on function public\._phrasal_verb_system_snapshot_is_dominated\(jsonb, jsonb\)[\s\S]*from public, anon, authenticated, service_role;/,
);
assert.doesNotMatch(
  controlForward,
  /grant\s+execute\s+on\s+function\s+public\._phrasal_verb_system_snapshot_is_dominated/i,
);
assert.match(controlRollbackPreflight, /DOES NOT weaken or replace/);
assert.match(controlRollbackPreflight, /refusing blind rollback/);
assert.match(controlRollbackPreflight, /Rollback preflight passed/);
assert.match(controlRollbackPreflight.trimEnd(), /rollback;$/);
assert.match(controlVerification, /Equal-structure awaitingNextRound branches were ordered/);
assert.match(controlVerification, /Equal-structure collapsed-card branches were ordered/);
assert.match(controlVerification, /Incomparable correction-control branches were ordered/);
assert.match(controlVerification, /Equal-counter control-state branch was not rejected/);
assert.match(controlVerification, /Higher-revision control-only update was not accepted/);
assert.match(controlVerification, /Missing legacy controlRevision did not normalize to zero/);
assert.match(controlVerification, /Invalid controlRevision was accepted/);
assert.match(controlVerification, /Legitimate next-round forward progress was rejected/);
assert.match(controlVerification, /Structurally dominated retry changed canonical data/);
assert.match(controlVerification.trimEnd(), /rollback;$/);
assert.match(canonical, /PHRASAL_CONTROL_STATE_GUARD_V3/);
assert.match(canonical, /PHRASAL_CONTROL_REVISION_V3/);
assert.match(canonical, /v_existing_control_revision/);
assert.match(canonical, /v_candidate_control_revision/);
assert.match(canonical, /v_controls_equal/);

console.log(`Phrasal stale-snapshot migration contract OK: ${root}`);
