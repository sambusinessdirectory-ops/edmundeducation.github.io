#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ACKNOWLEDGEMENT_SCHEMA_VERSION,
  acknowledgeOutbox,
} from "./acknowledge-flashcard-integrity-outbox.mjs";
import { HEALTH_SCHEMA_VERSION } from "./check-flashcard-integrity-health.mjs";
import {
  RECONCILIATION_SCHEMA_VERSION,
  acknowledgementObservationFingerprint,
} from "./reconcile-flashcard-integrity-issue.mjs";

const migration = await readFile(
  "supabase-flashcard-integrity-watchdog-outbox-ack-20260815.sql",
  "utf8",
);
const verification = await readFile(
  "supabase-flashcard-integrity-watchdog-outbox-ack-verification-20260815.sql",
  "utf8",
);
const rollback = await readFile(
  "supabase-flashcard-integrity-watchdog-outbox-ack-rollback-20260815.sql",
  "utf8",
);
const exactBatchMigration = await readFile(
  "supabase-flashcard-integrity-watchdog-outbox-batch-digest-20260815.sql",
  "utf8",
);
const exactBatchVerification = await readFile(
  "supabase-flashcard-integrity-watchdog-outbox-batch-digest-verification-20260815.sql",
  "utf8",
);
const exactBatchRollback = await readFile(
  "supabase-flashcard-integrity-watchdog-outbox-batch-digest-rollback-20260815.sql",
  "utf8",
);
const exactBatchFunctionRepair = await readFile(
  "supabase-flashcard-integrity-watchdog-outbox-batch-digest-function-repair-20260815.sql",
  "utf8",
);
const workflow = await readFile(
  ".github/workflows/flashcard-integrity-watchdog.yml",
  "utf8",
);
const runbook = await readFile(
  "FLASHCARD-INTEGRITY-WATCHDOG-RUNBOOK-20260814.md",
  "utf8",
);

assert.match(migration, /begin;[\s\S]*commit;/i);
assert.match(migration, /watchdog_outbox_consumers[\s\S]*enable row level security/i);
assert.match(migration, /outbox_acknowledgements[\s\S]*enable row level security/i);
assert.match(
  migration,
  /revoke all on table flashcard_integrity\.watchdog_outbox_consumers[\s\S]*from public, anon, authenticated, service_role/i,
);
assert.match(
  migration,
  /revoke all on table flashcard_integrity\.outbox_acknowledgements[\s\S]*from public, anon, authenticated, service_role/i,
);
assert.match(migration, /flashcard_integrity_outbox_acknowledgements_immutable/i);
assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
assert.match(migration, /x-flashcard-watchdog-outbox-ack-token/i);
assert.match(migration, /extensions\.digest[\s\S]*'sha256'/i);
assert.match(migration, /'ackThroughOutboxId'/i);
assert.match(migration, /'schemaVersion', '2026-08-15\.2'/i);
assert.match(migration, /flashcard_integrity_outbox_delivery_pending_idx/i);
assert.match(migration, /order by pending\.outbox_id[\s\S]*limit 500/i);
assert.match(migration, /'ackBatchLimit', 500/i);
assert.match(migration, /set lock_timeout = '3s'/i);
assert.match(migration, /set statement_timeout = '20s'/i);
assert.match(
  migration,
  /outbox\.delivered_at is null[\s\S]*outbox\.outbox_id <= v_through[\s\S]*outbox\.created_at <= p_observed_at/i,
);
assert.match(migration, /unique \(consumer_id, reconciliation_run_key\)/i);
assert.match(migration, /return v_existing\.canonical_receipt/i);
assert.match(
  migration,
  /grant execute on function public\.flashcard_integrity_acknowledge_outbox\([\s\S]*\) to anon/i,
);
assert.doesNotMatch(migration, /service[_-]?role[_-]?key/i);
assert.doesNotMatch(migration, /eyJ[A-Za-z0-9_-]{20,}/);

assert.match(exactBatchMigration, /begin;[\s\S]*commit;/i);
assert.match(exactBatchMigration, /'schemaVersion', '2026-08-15\.3'/i);
assert.match(exactBatchMigration, /'ackBatchDigest'/i);
assert.match(exactBatchMigration, /sha256-ordered-decimal-outbox-ids-v1/i);
assert.match(exactBatchMigration, /p_observed_batch_digest text/i);
assert.match(exactBatchMigration, /p_observed_batch_digest !~ '\^\[0-9a-f\]\{64\}\$'/i);
assert.match(exactBatchMigration, /array_agg\(batch\.outbox_id order by batch\.outbox_id\)/i);
assert.match(exactBatchMigration, /limit 500[\s\S]*for update/i);
assert.match(exactBatchMigration, /v_available_digest is distinct from p_observed_batch_digest/i);
assert.match(exactBatchMigration, /outbox\.outbox_id = any\(v_batch_ids\)/i);
assert.doesNotMatch(
  exactBatchMigration,
  /pg_catalog\.(?:least|greatest)\s*\(/i,
  "LEAST and GREATEST are PostgreSQL special syntax and must not be schema-qualified",
);
assert.doesNotMatch(
  exactBatchMigration,
  /set delivered_at = v_now[\s\S]{0,500}outbox\.outbox_id <= v_through/i,
  "schema .3 delivery must update only its captured exact ID array",
);
assert.match(
  exactBatchMigration,
  /flashcard_integrity_acknowledge_outbox_pre_batch_digest_internal/i,
);
assert.match(exactBatchVerification, /Changed exact batch was incorrectly accepted/i);
assert.match(exactBatchVerification, /Digest mismatch partially delivered/i);
assert.match(exactBatchVerification, /rollback;/i);
assert.match(exactBatchRollback, /outbox_batch_digest_rollback_approved/i);
assert.doesNotMatch(
  exactBatchRollback,
  /drop table|delete\s+from|truncate/i,
  "schema .3 rollback must retain acknowledgement evidence",
);
assert.match(exactBatchFunctionRepair, /begin;[\s\S]*commit;/i);
assert.match(exactBatchFunctionRepair, /pg_get_functiondef/i);
assert.match(
  exactBatchFunctionRepair,
  /replace\([\s\S]*'pg_catalog\.least\('[\s\S]*'least\('/i,
);
assert.match(
  exactBatchFunctionRepair,
  /replace\([\s\S]*'pg_catalog\.greatest\('[\s\S]*'greatest\('/i,
);
assert.match(exactBatchFunctionRepair, /'2026-08-15\.3'/i);
assert.match(exactBatchFunctionRepair, /outbox\.outbox_id = any\(v_batch_ids\)/i);
assert.match(
  exactBatchFunctionRepair,
  /revoke all on function public\.flashcard_integrity_health\(\)[\s\S]*grant execute on function public\.flashcard_integrity_health\(\) to anon/i,
);
assert.match(
  exactBatchFunctionRepair,
  /revoke all on function public\.flashcard_integrity_acknowledge_outbox\([\s\S]*grant execute on function public\.flashcard_integrity_acknowledge_outbox\(/i,
);
assert.doesNotMatch(
  exactBatchFunctionRepair,
  /\b(?:insert\s+into|update|delete\s+from|truncate|drop\s+(?:table|schema))\b/i,
  "function-only repair must not mutate or remove data",
);

assert.match(verification, /flashcard-integrity-verification/i);
assert.match(verification, /v_duplicate_receipt <> v_receipt/i);
assert.match(verification, /Future\/unobserved watermark was incorrectly accepted/i);
assert.match(verification, /Invalid acknowledgement token was accepted/i);
assert.match(verification, /Acknowledgement receipt mutation was accepted/i);
assert.match(verification, /rollback;/i);

assert.match(rollback, /outbox_ack_rollback_approved/i);
assert.match(rollback, /confirmed-outbox-ack-rollback-20260815/i);
assert.doesNotMatch(
  rollback,
  /drop table|delete\s+from|truncate/i,
  "rollback must retain credentials, receipts, alerts, and outbox evidence",
);

const probeIndex = workflow.indexOf("Probe aggregate Supabase integrity health");
const reconcileIndex = workflow.indexOf("Open, update, deduplicate, or close");
const acknowledgeIndex = workflow.indexOf("Acknowledge only the reconciled");
const finalGateIndex = workflow.indexOf("Keep this run red");
assert.ok(
  probeIndex >= 0
    && probeIndex < reconcileIndex
    && reconcileIndex < acknowledgeIndex
    && acknowledgeIndex < finalGateIndex,
  "workflow order must be probe, GitHub reconciliation, acknowledgement, final gate",
);
assert.match(workflow, /--defer-health-exit/);
assert.match(workflow, /FLASHCARD_WATCHDOG_OUTBOX_ACK_TOKEN: \$\{\{ secrets\.FLASHCARD_WATCHDOG_OUTBOX_ACK_TOKEN \}\}/);
assert.match(workflow, /acknowledge-flashcard-integrity-outbox\.mjs/);
assert.match(workflow, /assert-flashcard-integrity-health\.mjs/);
assert.doesNotMatch(
  workflow.slice(reconcileIndex, acknowledgeIndex),
  /FLASHCARD_WATCHDOG_OUTBOX_ACK_TOKEN/,
  "GitHub reconciliation step must not receive the outbox write token",
);
assert.doesNotMatch(
  workflow.slice(acknowledgeIndex, finalGateIndex),
  /GITHUB_TOKEN/,
  "outbox acknowledgement step must not receive the GitHub issue token",
);
assert.match(runbook, /outbox acknowledgement/i);

const health = {
  schemaVersion: HEALTH_SCHEMA_VERSION,
  source: "supabase-flashcard-integrity-health",
  checkedAt: "2026-08-15T04:00:00.000Z",
  healthy: false,
  status: "unhealthy",
  incidentCodes: ["alert_outbox_late"],
  checks: {
    state: { healthy: true, metadataViolationCount: 0 },
    attempts: { healthy: true, driftCount: 0 },
    triggers: { healthy: true, missingCount: 0 },
    alerts: { healthy: true, unresolvedCriticalCount: 0 },
    outbox: {
      healthy: false,
      pendingCount: 3,
      lateCount: 3,
      oldestPendingAgeSeconds: 600,
      pendingWarningCount: 3,
      pendingCriticalCount: 0,
      pendingOptimisticConflictCount: 3,
      ackPendingCount: 3,
      ackBatchLimit: 500,
      ackThroughOutboxId: "123",
      ackObservedAt: "2026-08-15T04:00:00.000000+00:00",
      ackBatchDigest: "d".repeat(64),
      ackBatchDigestAlgorithm: "sha256-ordered-decimal-outbox-ids-v1",
    },
    snapshot: {
      enabled: false,
      healthy: true,
      expectedDate: null,
      lastCompletedDate: null,
      late: true,
      corrupt: false,
      failedExpectedCount: 0,
    },
  },
};
const reconciliation = {
  schemaVersion: RECONCILIATION_SCHEMA_VERSION,
  checkedAt: health.checkedAt,
  healthFingerprint: acknowledgementObservationFingerprint(health),
  action: "opened_issue",
  issueNumber: 42,
};
const env = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "a".repeat(32),
  FLASHCARD_WATCHDOG_OUTBOX_ACK_TOKEN: "b".repeat(64),
  GITHUB_REPOSITORY: "owner/repository",
  GITHUB_RUN_ID: "31863169000",
  GITHUB_RUN_ATTEMPT: "1",
};

let observedRequest;
const acknowledged = await acknowledgeOutbox({
  health,
  reconciliation,
  env,
  fetchImpl: async (url, options) => {
    observedRequest = { url, options, body: JSON.parse(options.body) };
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          schemaVersion: ACKNOWLEDGEMENT_SCHEMA_VERSION,
          status: "acknowledged",
          throughOutboxId: "123",
          previousWatermark: "0",
          resultingWatermark: "123",
          deliveredCount: 3,
          observedBatchDigest: health.checks.outbox.ackBatchDigest,
          reconciliationRunKey: observedRequest.body.p_reconciliation_run_key,
          reconciliationReference:
            observedRequest.body.p_reconciliation_reference,
          acknowledgedAt: "2026-08-15T04:00:01.000Z",
          unexpectedStudentPayload: { name: "must-never-escape" },
        };
      },
    };
  },
});
assert.equal(acknowledged.deliveredCount, 3);
assert.equal("unexpectedStudentPayload" in acknowledged, false);
assert.match(observedRequest.url, /rpc\/flashcard_integrity_acknowledge_outbox$/);
assert.equal(
  observedRequest.options.headers["x-flashcard-watchdog-outbox-ack-token"],
  env.FLASHCARD_WATCHDOG_OUTBOX_ACK_TOKEN,
);
assert.equal("x-flashcard-watchdog-token" in observedRequest.options.headers, false);
assert.equal(observedRequest.body.p_through_outbox_id, "123");
assert.equal(
  observedRequest.body.p_observed_batch_digest,
  health.checks.outbox.ackBatchDigest,
);
assert.equal(
  observedRequest.body.p_observed_at,
  "2026-08-15T04:00:00.000000+00:00",
);
assert.equal(
  observedRequest.body.p_health_fingerprint,
  acknowledgementObservationFingerprint(health),
);
assert.equal(observedRequest.body.p_reconciliation_action, "opened_issue");

let mismatchFetched = false;
await assert.rejects(
  acknowledgeOutbox({
    health,
    reconciliation: { ...reconciliation, healthFingerprint: "f".repeat(64) },
    env,
    fetchImpl: async () => {
      mismatchFetched = true;
      throw new Error("must not fetch");
    },
  }),
  /fingerprint does not match/i,
);
assert.equal(mismatchFetched, false);

let emptyFetched = false;
const emptyHealth = structuredClone(health);
emptyHealth.healthy = true;
emptyHealth.status = "healthy";
emptyHealth.incidentCodes = [];
emptyHealth.checks.outbox = {
  ...emptyHealth.checks.outbox,
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
  ackObservedAt: "2026-08-15T04:00:00.000000+00:00",
  ackBatchDigest: null,
  ackBatchDigestAlgorithm: "sha256-ordered-decimal-outbox-ids-v1",
};
const emptyReconciliation = {
  schemaVersion: RECONCILIATION_SCHEMA_VERSION,
  checkedAt: emptyHealth.checkedAt,
  healthFingerprint: acknowledgementObservationFingerprint(emptyHealth),
  action: "healthy_no_open_issue",
  issueNumber: null,
};
const emptyResult = await acknowledgeOutbox({
  health: emptyHealth,
  reconciliation: emptyReconciliation,
  env,
  fetchImpl: async () => {
    emptyFetched = true;
    throw new Error("must not fetch");
  },
});
assert.equal(emptyFetched, false);
assert.equal(emptyResult.status, "skipped_empty_batch");

await assert.rejects(
  acknowledgeOutbox({
    health,
    reconciliation: { ...reconciliation, action: "healthy_no_open_issue" },
    env,
    fetchImpl: async () => {
      throw new Error("must not fetch");
    },
  }),
  /action is inconsistent/i,
);

console.log("Flashcard external outbox acknowledgement checks passed.");
