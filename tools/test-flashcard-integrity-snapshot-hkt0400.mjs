#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const paths = {
  forward: new URL(
    "../supabase-flashcard-integrity-snapshot-hkt0400-20260817.sql",
    import.meta.url,
  ),
  rollback: new URL(
    "../supabase-flashcard-integrity-snapshot-hkt0400-rollback-20260817.sql",
    import.meta.url,
  ),
  verification: new URL(
    "../supabase-flashcard-integrity-snapshot-hkt0400-verification-20260817.sql",
    import.meta.url,
  ),
  snapshotBaseline: new URL(
    "../supabase-flashcard-integrity-phase1-06-snapshot-routines-20260814.sql",
    import.meta.url,
  ),
  watchdogBaseline: new URL(
    "../supabase-flashcard-integrity-watchdog-20260814.sql",
    import.meta.url,
  ),
  watchdogRunbook: new URL(
    "../FLASHCARD-INTEGRITY-WATCHDOG-RUNBOOK-20260814.md",
    import.meta.url,
  ),
  phase1Runbook: new URL(
    "../FLASHCARD-INTEGRITY-PHASE1-RUNBOOK-20260814.md",
    import.meta.url,
  ),
  integrityReport: new URL(
    "../FLASHCARD_DATA_INTEGRITY_REPORT_20260814.md",
    import.meta.url,
  ),
  workflow: new URL(
    "../.github/workflows/flashcard-integrity-watchdog.yml",
    import.meta.url,
  ),
};

const entries = await Promise.all(
  Object.entries(paths).map(async ([name, path]) => [name, await readFile(path, "utf8")]),
);
const source = Object.fromEntries(entries);

const executableSql = (sql) => sql.replace(/^\s*--.*$/gm, "");
const regexEscape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const occurrenceCount = (text, needle) =>
  (text.match(new RegExp(regexEscape(needle), "g")) ?? []).length;

for (const name of ["forward", "rollback", "verification"]) {
  const sql = source[name];
  assert.match(sql, /^begin;/m, `${name} must be transactional`);
  assert.match(sql, /set local lock_timeout = '3s';/);
  assert.match(sql, /set local statement_timeout = '2min';/);
  assert.doesNotMatch(
    executableSql(sql),
    /\bcron\.(?:schedule|alter_job|unschedule)\s*\(|\b(?:insert|update|delete)\s+(?:from\s+)?cron\.job\b/i,
    `${name} must not mutate scheduler configuration`,
  );
  assert.doesNotMatch(
    executableSql(sql),
    /\b(?:insert|update|delete)\s+(?:from\s+)?flashcard_integrity\.(?:snapshot_runs|student_snapshots)\b/i,
    `${name} must not rewrite snapshot evidence`,
  );
}

for (const [name, delimiter] of [
  ["forward", "$snapshot_hkt0400$"],
  ["rollback", "$snapshot_hkt0400_rollback$"],
  ["verification", "$snapshot_hkt0400_verification$"],
]) {
  assert.equal(
    occurrenceCount(source[name], delimiter),
    2,
    `${name} procedural block must have balanced dollar delimiters`,
  );
}
assert.match(source.forward.trimEnd(), /commit;$/);
assert.match(source.rollback.trimEnd(), /commit;$/);

assert.match(source.forward, /flashcard-integrity-snapshot-hkt0400-v1/);
assert.match(source.forward, /pg_catalog\.pg_get_functiondef\(v_capture\)/);
assert.match(source.forward, /pg_catalog\.pg_get_functiondef\(v_watchdog\)/);
assert.match(source.forward, /v_capture_needs_update/);
assert.match(source.forward, /v_watchdog_needs_update/);
assert.match(source.forward, /unknown scheduled_for policy/i);
assert.match(source.forward, /unknown expected-snapshot cutoff/i);
assert.match(source.forward, /reviewed schema \.3\/eight-trigger implementation/i);
assert.match(
  source.forward,
  /revoke all on function flashcard_integrity\.capture_nightly_snapshot\(\)[\s\S]*from public, anon, authenticated, service_role;/i,
);
assert.match(
  source.forward,
  /revoke all on function public\.flashcard_integrity_health_snapshot_v7_internal\(\)[\s\S]*from public, anon, authenticated, service_role;/i,
);

assert.match(source.rollback, /snapshot_hkt0400_rollback_approved/);
assert.match(
  source.rollback,
  /confirmed-restore-midnight-snapshot-policy-20260817/,
);
assert.match(source.rollback, /All rollback preconditions[\s\S]*before either definition changes/i);
assert.doesNotMatch(
  executableSql(source.rollback),
  /\b(?:drop|truncate)\b/i,
  "timing rollback must preserve all functions and evidence",
);
assert.doesNotMatch(
  executableSql(source.forward),
  /\bgrant\b/i,
  "timing migration must not broaden function access",
);

assert.match(source.verification, /Rollback-only verification/i);
assert.match(source.verification, /2026-08-16 20:00:00\+00/);
assert.match(source.verification, /timestamp '2026-08-17 04:14:59'/);
assert.match(source.verification, /timestamp '2026-08-17 04:15:00'/);
assert.match(
  source.verification,
  /\(v_health ->> 'schemaVersion'\) is distinct from '2026-08-15\.3'/,
);
assert.match(source.verification, /checks,snapshot,enabled/);
assert.match(source.verification, /checks,triggers,expectedCount/);
assert.match(source.verification, /snapshot_scheduler_status\(\)/);
assert.match(source.verification.trimEnd(), /rollback;$/);

const oldCapture =
  "v_scheduled_for := v_snapshot_date::timestamp at time zone 'Asia/Hong_Kong';";
const newCapture =
  "v_scheduled_for := (v_snapshot_date::timestamp + interval '4 hours') at time zone 'Asia/Hong_Kong';";
assert.equal(
  occurrenceCount(source.snapshotBaseline, oldCapture),
  1,
  "forward transform must match exactly one reviewed capture assignment",
);
assert.equal(occurrenceCount(source.snapshotBaseline, newCapture), 0);
const transformedCapture = source.snapshotBaseline.replace(oldCapture, newCapture);
assert.equal(occurrenceCount(transformedCapture, oldCapture), 0);
assert.equal(occurrenceCount(transformedCapture, newCapture), 1);

const oldCutoff = "time '00:15'";
const newCutoff = "time '04:15'";
assert.equal(
  occurrenceCount(source.watchdogBaseline, oldCutoff),
  1,
  "forward transform must match exactly one reviewed watchdog cutoff",
);
assert.equal(occurrenceCount(source.watchdogBaseline, newCutoff), 0);
const transformedWatchdog = source.watchdogBaseline
  .replace(oldCutoff, newCutoff)
  .replace("The 00:00 HKT snapshot", "The 04:00 HKT snapshot")
  .replace("Before 00:15", "Before 04:15");
assert.equal(occurrenceCount(transformedWatchdog, oldCutoff), 0);
assert.equal(occurrenceCount(transformedWatchdog, newCutoff), 1);
assert.match(transformedWatchdog, /The 04:00 HKT snapshot/);
assert.match(transformedWatchdog, /Before 04:15/);

const HKT_OFFSET_MS = 8 * 60 * 60 * 1_000;
const pad2 = (value) => String(value).padStart(2, "0");
const dateKey = (date) =>
  `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;

function expectedSnapshotDateAt(utcInstant) {
  const local = new Date(new Date(utcInstant).getTime() + HKT_OFFSET_MS);
  const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
  if (minutes >= 4 * 60 + 15) return dateKey(local);
  const previous = new Date(local.getTime() - 24 * 60 * 60 * 1_000);
  return dateKey(previous);
}

function scheduledForUtc(snapshotDate) {
  return new Date(`${snapshotDate}T04:00:00+08:00`).toISOString();
}

for (const [utcInstant, expected] of [
  ["2026-08-16T19:59:59.000Z", "2026-08-16"], // 03:59:59 HKT
  ["2026-08-16T20:14:59.000Z", "2026-08-16"], // 04:14:59 HKT
  ["2026-08-16T20:15:00.000Z", "2026-08-17"], // 04:15:00 HKT
  ["2026-08-16T20:16:00.000Z", "2026-08-17"],
  ["2026-12-31T20:14:59.000Z", "2026-12-31"], // New-year boundary
  ["2026-12-31T20:15:00.000Z", "2027-01-01"],
]) {
  assert.equal(expectedSnapshotDateAt(utcInstant), expected, utcInstant);
}

assert.equal(scheduledForUtc("2026-08-17"), "2026-08-16T20:00:00.000Z");
assert.equal(scheduledForUtc("2027-01-01"), "2026-12-31T20:00:00.000Z");

assert.match(source.watchdogRunbook, /required 04:00 Hong Kong snapshot/);
assert.match(source.watchdogRunbook, /completed by 04:15/);
assert.match(source.phase1Runbook, /reviewed nightly target is 04:00 `Asia\/Hong_Kong`/);
assert.match(source.integrityReport, /Layer K — 04:00 HKT in-database snapshots/);
assert.match(source.integrityReport, /`0 20 \* \* \*` only when/);
assert.doesNotMatch(source.integrityReport, /At 00:00 Asia\/Hong_Kong/);

assert.match(
  source.workflow,
  /cron: "\*\/5 \* \* \* \*"/,
  "the independent watchdog cadence must remain five minutes",
);

console.log("Flashcard 04:00 HKT snapshot-policy contract tests passed.");
