#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  HEALTH_SCHEMA_VERSION,
  fetchIntegrityHealth,
  normalizeHealthResponse,
} from "./check-flashcard-integrity-health.mjs";
import {
  ISSUE_MARKER,
  buildIssueBody,
  incidentFingerprint,
} from "./reconcile-flashcard-integrity-issue.mjs";

const migration = await readFile(
  "supabase-flashcard-integrity-watchdog-20260814.sql",
  "utf8",
);
const snapshotGateMigration = await readFile(
  "supabase-flashcard-integrity-watchdog-snapshot-gate-20260815.sql",
  "utf8",
);
const internalInventoryMigration = await readFile(
  "supabase-flashcard-integrity-watchdog-eight-trigger-internal-20260815.sql",
  "utf8",
);
const internalInventoryVerification = await readFile(
  "supabase-flashcard-integrity-watchdog-eight-trigger-internal-verification-20260815.sql",
  "utf8",
);
const internalInventoryRollback = await readFile(
  "supabase-flashcard-integrity-watchdog-eight-trigger-internal-rollback-20260815.sql",
  "utf8",
);
const runbook = await readFile(
  "FLASHCARD-INTEGRITY-WATCHDOG-RUNBOOK-20260814.md",
  "utf8",
);
const internalInventoryExecutableSql = internalInventoryMigration.replace(
  /^\s*--.*$/gm,
  "",
);
const workflow = await readFile(
  ".github/workflows/flashcard-integrity-watchdog.yml",
  "utf8",
);
const probe = await readFile("tools/check-flashcard-integrity-health.mjs", "utf8");

assert.match(migration, /create table if not exists flashcard_integrity\.watchdog_credentials/i);
assert.match(migration, /alter table flashcard_integrity\.watchdog_credentials enable row level security/i);
assert.match(migration, /revoke all on table flashcard_integrity\.watchdog_credentials[\s\S]*from public, anon, authenticated, service_role/i);
assert.match(migration, /create or replace function public\.flashcard_integrity_health\(\)/i);
assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
assert.match(migration, /current_setting\('request\.headers', true\)/i);
assert.match(migration, /x-flashcard-watchdog-token/i);
assert.match(migration, /extensions\.digest[\s\S]*'sha256'/i);
assert.match(migration, /grant execute on function public\.flashcard_integrity_health\(\) to anon/i);
assert.doesNotMatch(migration, /grant[^;]+watchdog_credentials[^;]+to anon/i);
assert.doesNotMatch(migration, /service[_-]?role[_-]?key/i);
assert.doesNotMatch(migration, /eyJ[A-Za-z0-9_-]{20,}/);
assert.match(migration, /Eight named triggers/i);

const expectedTriggerBlockStart = migration.indexOf(
  "with expected(relation_id, trigger_name)",
);
const expectedTriggerBlockEnd = migration.indexOf(
  "select pg_catalog.count(*) filter",
  expectedTriggerBlockStart,
);
assert.notEqual(
  expectedTriggerBlockStart,
  -1,
  "watchdog must declare its required-trigger inventory",
);
assert.notEqual(
  expectedTriggerBlockEnd,
  -1,
  "watchdog required-trigger inventory must feed the missing-trigger count",
);
const expectedTriggerBlock = migration.slice(
  expectedTriggerBlockStart,
  expectedTriggerBlockEnd,
);
const expectedTriggerNames = [
  "flashcard_state_zy_legacy_object_merge",
  "flashcard_state_zz_integrity_protect",
  "flashcard_state_revision_audit",
  "flashcard_student_hard_delete_protected",
  "flashcard_integrity_state_revisions_immutable",
  "flashcard_integrity_receipts_immutable",
  "flashcard_integrity_attempt_mutations_immutable",
  "flashcard_integrity_snapshots_immutable",
];
for (const triggerName of expectedTriggerNames) {
  assert.match(
    expectedTriggerBlock,
    new RegExp(`'${triggerName}'::text`),
    `watchdog must require ${triggerName}`,
  );
}
assert.equal(
  (expectedTriggerBlock.match(/::text\)/g) ?? []).length,
  expectedTriggerNames.length,
  "watchdog trigger inventory must contain exactly the eight reviewed triggers",
);

assert.match(
  snapshotGateMigration,
  /rename to flashcard_integrity_health_snapshot_required_internal/i,
);
assert.match(
  snapshotGateMigration,
  /revoke all on function public\.flashcard_integrity_health_snapshot_required_internal\(\)[\s\S]*from public, anon, authenticated, service_role/i,
);
assert.match(
  snapshotGateMigration,
  /x-flashcard-watchdog-snapshot-checks-enabled/i,
);
assert.match(
  snapshotGateMigration,
  /v_snapshot_checks_enabled := coalesce\(\s*v_headers ->> 'x-flashcard-watchdog-snapshot-checks-enabled',\s*'true'\s*\) <> 'false'/i,
);
assert.match(snapshotGateMigration, /'schemaVersion', '2026-08-15\.1'/i);
assert.match(
  snapshotGateMigration,
  /code not in \([\s\S]*'nightly_snapshot_late'[\s\S]*'nightly_snapshot_failed'[\s\S]*'nightly_snapshot_corrupt'[\s\S]*\)/i,
);
assert.match(
  snapshotGateMigration,
  /grant execute on function public\.flashcard_integrity_health\(\) to anon/i,
);
for (const requiredCheck of ["state", "attempts", "triggers", "alerts", "outbox"]) {
  assert.match(
    snapshotGateMigration,
    new RegExp(`\\{checks,${requiredCheck},healthy\\}`),
  );
}
assert.doesNotMatch(snapshotGateMigration, /service[_-]?role[_-]?key/i);
assert.doesNotMatch(snapshotGateMigration, /eyJ[A-Za-z0-9_-]{20,}/);

assert.match(
  internalInventoryMigration,
  /rename to flashcard_integrity_health_snapshot_v7_internal/i,
);
assert.match(
  internalInventoryMigration,
  /create or replace function public\.flashcard_integrity_health_snapshot_required_internal\(\)/i,
);
assert.match(
  internalInventoryMigration,
  /public\.flashcard_integrity_health_snapshot_v7_internal\(\)/i,
);
assert.match(
  internalInventoryMigration,
  /Current internal watchdog is not the reviewed supplemental adapter\/passthrough/i,
);
assert.match(
  internalInventoryMigration,
  /'flashcard_state_zy_legacy_object_merge'/i,
);
assert.match(
  internalInventoryMigration,
  /'expectedCount', 8/i,
);
assert.match(
  internalInventoryMigration,
  /'supplementalEightTriggerInventory', true/i,
);
assert.match(
  internalInventoryMigration,
  /revoke all on function public\.flashcard_integrity_health_snapshot_v7_internal\(\)[\s\S]*from public, anon, authenticated, service_role/i,
);
assert.match(
  internalInventoryMigration,
  /revoke all on function public\.flashcard_integrity_health_snapshot_required_internal\(\)[\s\S]*from public, anon, authenticated, service_role/i,
);
assert.doesNotMatch(
  internalInventoryExecutableSql,
  /create or replace function public\.flashcard_integrity_health\(\)/i,
  "supplemental migration must not replace the public snapshot-gate wrapper",
);
assert.doesNotMatch(
  internalInventoryExecutableSql,
  /(?:insert|update|delete|alter|drop|create)\s+(?:table\s+)?flashcard_integrity\.watchdog_credentials/i,
  "supplemental migration must not mutate credential schema or rows",
);
assert.doesNotMatch(
  internalInventoryExecutableSql,
  /(?:grant|revoke)[^;]*public\.flashcard_integrity_health\(\)/i,
  "supplemental migration must not alter the public wrapper ACL",
);

assert.match(
  internalInventoryVerification,
  /v_health := public\.flashcard_integrity_health\(\)/i,
);
assert.match(
  internalInventoryVerification,
  /x-flashcard-watchdog-snapshot-checks-enabled', 'false'/i,
);
assert.match(
  internalInventoryVerification,
  /checks,triggers,expectedCount/i,
);
assert.match(internalInventoryVerification, /rollback;/i);

assert.match(
  internalInventoryRollback,
  /watchdog_internal_inventory_rollback_approved/i,
);
assert.match(
  internalInventoryRollback,
  /return public\.flashcard_integrity_health_snapshot_v7_internal\(\)/i,
);
assert.doesNotMatch(
  internalInventoryRollback,
  /drop\s+(?:table|function)|delete\s+from/i,
  "rollback must preserve credentials and watchdog implementations",
);

assert.match(
  runbook,
  /watchdog-eight-trigger-internal-20260815\.sql/i,
  "runbook must route already-gated production through the supplemental internal migration",
);

assert.match(workflow, /cron: "\*\/5 \* \* \* \*"/);
assert.match(workflow, /contents: read/);
assert.match(workflow, /issues: write/);
assert.match(workflow, /actions\/checkout@[0-9a-f]{40}/);
assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/);
assert.match(workflow, /persist-credentials: false/);
assert.match(
  workflow,
  /if: \$\{\{ vars\.FLASHCARD_WATCHDOG_ENABLED == 'true' \}\}/,
);
assert.match(workflow, /FLASHCARD_WATCHDOG_TOKEN: \$\{\{ secrets\.FLASHCARD_WATCHDOG_TOKEN \}\}/);
assert.match(
  workflow,
  /FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED: \$\{\{ vars\.FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED \}\}/,
);
assert.doesNotMatch(workflow, /pull_request:/);
assert.doesNotMatch(workflow, /service[_-]?role/i);

assert.match(probe, /Unknown fields are discarded/i);
assert.doesNotMatch(probe, /console\.log\(raw/i);

const rawHealthy = {
  schemaVersion: HEALTH_SCHEMA_VERSION,
  checkedAt: "2026-08-14T12:00:00.000Z",
  healthy: true,
  status: "healthy",
  incidentCodes: [],
  unexpectedStudentPayload: { username: "must-never-escape" },
  checks: {
    state: { healthy: true, metadataViolationCount: 0 },
    attempts: { healthy: true, driftCount: 0 },
    triggers: { healthy: true, missingCount: 0 },
    alerts: { healthy: true, unresolvedCriticalCount: 0 },
    outbox: {
      healthy: true,
      pendingCount: 0,
      lateCount: 0,
      oldestPendingAgeSeconds: null,
      pendingWarningCount: 0,
      pendingCriticalCount: 0,
      pendingOptimisticConflictCount: 0,
      ackPendingCount: 0,
      ackBatchLimit: 500,
      ackThroughOutboxId: null,
      ackObservedAt: "2026-08-14T12:00:00.000000+00:00",
      ackBatchDigest: null,
      ackBatchDigestAlgorithm: "sha256-ordered-decimal-outbox-ids-v1",
    },
    snapshot: {
      enabled: true,
      healthy: true,
      expectedDate: "2026-08-14",
      lastCompletedDate: "2026-08-14",
      late: false,
      corrupt: false,
      failedExpectedCount: 0,
    },
  },
};

const normalized = normalizeHealthResponse(rawHealthy);
assert.equal(normalized.healthy, true);
assert.equal("unexpectedStudentPayload" in normalized, false);
assert.doesNotMatch(JSON.stringify(normalized), /must-never-escape/);

const rawSnapshotChecksDisabled = {
  ...rawHealthy,
  checks: {
    ...rawHealthy.checks,
    snapshot: {
      enabled: false,
      healthy: true,
      expectedDate: null,
      lastCompletedDate: null,
      late: true,
      corrupt: true,
      failedExpectedCount: 1,
    },
  },
};
const snapshotChecksDisabled = normalizeHealthResponse(rawSnapshotChecksDisabled);
assert.equal(snapshotChecksDisabled.healthy, true);
assert.equal(snapshotChecksDisabled.checks.snapshot.enabled, false);

const disabledSnapshotWithStateFailure = normalizeHealthResponse({
  ...rawSnapshotChecksDisabled,
  checks: {
    ...rawSnapshotChecksDisabled.checks,
    state: { healthy: false, metadataViolationCount: 1 },
  },
});
assert.equal(disabledSnapshotWithStateFailure.healthy, false);

const missingSnapshotGate = structuredClone(rawHealthy);
delete missingSnapshotGate.checks.snapshot.enabled;
const missingSnapshotGateResult = normalizeHealthResponse(missingSnapshotGate);
assert.equal(missingSnapshotGateResult.healthy, false);
assert.ok(missingSnapshotGateResult.incidentCodes.includes("malformed_health_response"));

const unhealthy = normalizeHealthResponse({
  ...rawHealthy,
  healthy: false,
  status: "unhealthy",
  incidentCodes: ["alert_outbox_late"],
  checks: {
    ...rawHealthy.checks,
    outbox: {
      healthy: false,
      pendingCount: 3,
      lateCount: 2,
      oldestPendingAgeSeconds: 700,
      pendingWarningCount: 3,
      pendingCriticalCount: 0,
      pendingOptimisticConflictCount: 3,
      ackPendingCount: 3,
      ackBatchLimit: 500,
      ackThroughOutboxId: "123",
      ackObservedAt: "2026-08-14T12:00:00.000000+00:00",
      ackBatchDigest: "a".repeat(64),
      ackBatchDigestAlgorithm: "sha256-ordered-decimal-outbox-ids-v1",
    },
  },
});
assert.equal(unhealthy.healthy, false);
const body = buildIssueBody(unhealthy);
assert.match(body, new RegExp(ISSUE_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(body, /alert_outbox_late/);
assert.match(body, /Snapshot checks enabled/);
assert.doesNotMatch(body, /must-never-escape/);

const laterSameIncident = structuredClone(unhealthy);
laterSameIncident.checkedAt = "2026-08-14T12:05:00.000Z";
laterSameIncident.checks.outbox.oldestPendingAgeSeconds = 1_000;
assert.equal(incidentFingerprint(unhealthy), incidentFingerprint(laterSameIncident));

const malformed = normalizeHealthResponse({ schemaVersion: HEALTH_SCHEMA_VERSION });
assert.equal(malformed.healthy, false);
assert.ok(malformed.incidentCodes.includes("malformed_health_response"));

const validEnvironment = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "a".repeat(32),
  FLASHCARD_WATCHDOG_TOKEN: "b".repeat(64),
  FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED: "false",
};
let observedSnapshotHeader = null;
let observedAuthorizationHeader = null;
const disabledFetchResult = await fetchIntegrityHealth({
  env: validEnvironment,
  fetchImpl: async (_url, options) => {
    observedSnapshotHeader = options.headers[
      "x-flashcard-watchdog-snapshot-checks-enabled"
    ];
    observedAuthorizationHeader = options.headers.authorization;
    return {
      ok: true,
      status: 200,
      async json() {
        return rawSnapshotChecksDisabled;
      },
    };
  },
});
assert.equal(observedSnapshotHeader, "false");
assert.equal(observedAuthorizationHeader, undefined);
assert.equal(disabledFetchResult.healthy, true);

let observedLegacyAuthorizationHeader = null;
const legacyAnonKey = `eyJ${"a".repeat(61)}`;
await fetchIntegrityHealth({
  env: {
    ...validEnvironment,
    SUPABASE_ANON_KEY: legacyAnonKey,
  },
  fetchImpl: async (_url, options) => {
    observedLegacyAuthorizationHeader = options.headers.authorization;
    return {
      ok: true,
      status: 200,
      async json() {
        return rawSnapshotChecksDisabled;
      },
    };
  },
});
assert.equal(observedLegacyAuthorizationHeader, `Bearer ${legacyAnonKey}`);

let invalidConfigurationFetched = false;
const invalidConfigurationResult = await fetchIntegrityHealth({
  env: {
    ...validEnvironment,
    FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED: "False",
  },
  fetchImpl: async () => {
    invalidConfigurationFetched = true;
    throw new Error("must not fetch");
  },
});
assert.equal(invalidConfigurationFetched, false);
assert.equal(invalidConfigurationResult.healthy, false);
assert.deepEqual(
  invalidConfigurationResult.incidentCodes,
  ["watchdog_configuration_invalid"],
);

const mismatchResult = await fetchIntegrityHealth({
  env: {
    ...validEnvironment,
    FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED: "true",
  },
  fetchImpl: async () => ({
    ok: true,
    status: 200,
    async json() {
      return rawSnapshotChecksDisabled;
    },
  }),
});
assert.equal(mismatchResult.healthy, false);
assert.ok(mismatchResult.incidentCodes.includes("snapshot_gate_mismatch"));

console.log("Flashcard integrity watchdog regression tests passed.");
