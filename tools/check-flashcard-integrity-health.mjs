#!/usr/bin/env node

import { chmod, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const HEALTH_SCHEMA_VERSION = "2026-08-15.3";
export const HEALTH_SOURCE = "supabase-flashcard-integrity-health";

const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 15_000;

function finiteCount(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.min(Math.trunc(number), 1_000_000_000);
}

function booleanValue(value) {
  return value === true;
}

function dateValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function outboxIdValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value);
  if (!/^[1-9][0-9]{0,18}$/.test(text)) return null;
  try {
    const parsed = BigInt(text);
    return parsed <= 9_223_372_036_854_775_807n ? text : null;
  } catch {
    return null;
  }
}

function preciseTimestampValue(value) {
  const text = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(text)) {
    return null;
  }
  return Number.isFinite(new Date(text).getTime()) ? text : null;
}

function sha256DigestValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value);
  return /^[0-9a-f]{64}$/.test(text) ? text : null;
}

function checkedAtValue(value) {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
}

function unavailableHealth(failureKind, httpStatus = null) {
  return {
    schemaVersion: HEALTH_SCHEMA_VERSION,
    source: HEALTH_SOURCE,
    checkedAt: new Date().toISOString(),
    healthy: false,
    status: "unhealthy",
    incidentCodes: [failureKind],
    checks: {
      endpoint: {
        healthy: false,
        failureKind,
        httpStatus: finiteCount(httpStatus),
      },
    },
  };
}

function normalizeCheck(raw, countFields = [], booleanFields = [], dateFields = []) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const normalized = { healthy: booleanValue(raw.healthy) };
  for (const field of countFields) normalized[field] = finiteCount(raw[field]);
  for (const field of booleanFields) normalized[field] = booleanValue(raw[field]);
  for (const field of dateFields) normalized[field] = dateValue(raw[field]);
  return normalized;
}

/**
 * Fail-closed allow-listing for the RPC response. Unknown fields are discarded so a
 * future database change cannot accidentally copy student data into logs or issues.
 */
export function normalizeHealthResponse(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return unavailableHealth("malformed_health_response");
  }

  const rawChecks = raw.checks && typeof raw.checks === "object" ? raw.checks : {};
  const checks = {
    state: normalizeCheck(rawChecks.state, ["metadataViolationCount"]),
    attempts: normalizeCheck(rawChecks.attempts, ["driftCount"]),
    triggers: normalizeCheck(rawChecks.triggers, ["missingCount"]),
    alerts: normalizeCheck(rawChecks.alerts, ["unresolvedCriticalCount"]),
    outbox: normalizeCheck(
      rawChecks.outbox,
      [
        "pendingCount",
        "lateCount",
        "oldestPendingAgeSeconds",
        "pendingWarningCount",
        "pendingCriticalCount",
        "pendingOptimisticConflictCount",
        "ackPendingCount",
        "ackBatchLimit",
      ],
    ),
    snapshot: normalizeCheck(
      rawChecks.snapshot,
      ["failedExpectedCount"],
      ["enabled", "late", "corrupt"],
      ["expectedDate", "lastCompletedDate"],
    ),
  };
  if (checks.outbox) {
    checks.outbox.ackThroughOutboxId = outboxIdValue(
      rawChecks.outbox?.ackThroughOutboxId,
    );
    checks.outbox.ackObservedAt = preciseTimestampValue(
      rawChecks.outbox?.ackObservedAt,
    );
    checks.outbox.ackBatchDigest = sha256DigestValue(
      rawChecks.outbox?.ackBatchDigest,
    );
    checks.outbox.ackBatchDigestAlgorithm =
      rawChecks.outbox?.ackBatchDigestAlgorithm ===
        "sha256-ordered-decimal-outbox-ids-v1"
        ? rawChecks.outbox.ackBatchDigestAlgorithm
        : null;
  }

  const snapshotEnabledPresent = typeof rawChecks.snapshot?.enabled === "boolean";
  const requiredChecksPresent = Object.values(checks).every((check) => check !== null)
    && checks.state?.metadataViolationCount !== null
    && checks.attempts?.driftCount !== null
    && checks.triggers?.missingCount !== null
    && checks.alerts?.unresolvedCriticalCount !== null
    && checks.outbox?.pendingCount !== null
    && checks.outbox?.lateCount !== null
    && checks.outbox?.pendingWarningCount !== null
    && checks.outbox?.pendingCriticalCount !== null
    && checks.outbox?.pendingOptimisticConflictCount !== null
    && checks.outbox?.ackPendingCount !== null
    && checks.outbox?.ackBatchLimit === 500
    && checks.outbox?.ackBatchDigestAlgorithm ===
      "sha256-ordered-decimal-outbox-ids-v1"
    && checks.outbox?.ackObservedAt !== null
    && (
      (checks.outbox?.ackPendingCount === 0
        && checks.outbox?.ackThroughOutboxId === null
        && checks.outbox?.ackBatchDigest === null)
      || (checks.outbox?.ackPendingCount > 0
        && checks.outbox?.ackThroughOutboxId !== null
        && checks.outbox?.ackBatchDigest !== null)
    )
    && snapshotEnabledPresent
    && checks.snapshot?.failedExpectedCount !== null
    && (
      checks.snapshot?.enabled === false
      || (
        checks.snapshot?.expectedDate !== null
        && (checks.snapshot?.healthy !== true || checks.snapshot?.lastCompletedDate !== null)
      )
    );
  const incidentCodes = Array.isArray(raw.incidentCodes)
    ? [...new Set(raw.incidentCodes
      .filter((code) => typeof code === "string" && /^[a-z0-9_]{1,80}$/.test(code)))]
      .sort()
    : [];

  const schemaMatches = raw.schemaVersion === HEALTH_SCHEMA_VERSION;
  if (!schemaMatches) incidentCodes.push("health_schema_mismatch");
  if (!requiredChecksPresent) incidentCodes.push("malformed_health_response");

  const everyCheckHealthy = requiredChecksPresent
    && Object.values(checks).every((check) => check.healthy === true);
  const healthy = raw.healthy === true
    && raw.status === "healthy"
    && schemaMatches
    && incidentCodes.length === 0
    && everyCheckHealthy;

  return {
    schemaVersion: HEALTH_SCHEMA_VERSION,
    source: HEALTH_SOURCE,
    checkedAt: checkedAtValue(raw.checkedAt),
    healthy,
    status: healthy ? "healthy" : "unhealthy",
    incidentCodes: [...new Set(incidentCodes)].sort(),
    checks,
  };
}

function validateConfiguration(env) {
  const supabaseUrl = String(env.SUPABASE_URL || "").replace(/\/+$/, "");
  const anonKey = String(env.SUPABASE_ANON_KEY || "");
  const watchdogToken = String(env.FLASHCARD_WATCHDOG_TOKEN || "");
  const snapshotChecksSetting = String(
    env.FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED || "",
  );

  let parsedUrl;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    throw new Error("SUPABASE_URL is missing or invalid");
  }
  if (parsedUrl.protocol !== "https:") throw new Error("SUPABASE_URL must use HTTPS");
  if (anonKey.length < 20) throw new Error("SUPABASE_ANON_KEY is missing or invalid");
  if (watchdogToken.length < 32 || watchdogToken.length > 256) {
    throw new Error("FLASHCARD_WATCHDOG_TOKEN is missing or invalid");
  }
  if (snapshotChecksSetting !== "true" && snapshotChecksSetting !== "false") {
    throw new Error(
      "FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED must be exactly true or false",
    );
  }

  return {
    supabaseUrl,
    anonKey,
    watchdogToken,
    snapshotChecksEnabled: snapshotChecksSetting === "true",
  };
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function fetchIntegrityHealth({ env = process.env, fetchImpl = fetch } = {}) {
  let config;
  try {
    config = validateConfiguration(env);
  } catch {
    return unavailableHealth("watchdog_configuration_invalid");
  }

  const endpoint = `${config.supabaseUrl}/rest/v1/rpc/flashcard_integrity_health`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const requestHeaders = {
        accept: "application/json",
        apikey: config.anonKey,
        "content-type": "application/json",
        "x-flashcard-watchdog-token": config.watchdogToken,
        "x-flashcard-watchdog-snapshot-checks-enabled": String(
          config.snapshotChecksEnabled,
        ),
      };

      // Supabase's current publishable keys (`sb_publishable_...`) are API keys,
      // not JWTs. Sending one as a Bearer token makes PostgREST reject an otherwise
      // valid anonymous request with HTTP 401. Retain Authorization only for legacy
      // JWT-style anon keys, while all key generations continue to use `apikey`.
      if (config.anonKey.startsWith("eyJ")) {
        requestHeaders.authorization = `Bearer ${config.anonKey}`;
      }

      const response = await fetchImpl(endpoint, {
        method: "POST",
        redirect: "error",
        signal: controller.signal,
        headers: requestHeaders,
        body: "{}",
      });

      if (!response.ok) {
        if (response.status >= 500 && attempt < MAX_ATTEMPTS) {
          await delay(attempt * 2_000);
          continue;
        }
        return unavailableHealth("health_endpoint_http_error", response.status);
      }

      let raw;
      try {
        raw = await response.json();
      } catch {
        return unavailableHealth("malformed_health_response", response.status);
      }
      const health = normalizeHealthResponse(raw);
      if (health.checks.snapshot?.enabled !== config.snapshotChecksEnabled) {
        health.healthy = false;
        health.status = "unhealthy";
        health.incidentCodes = [...new Set([
          ...health.incidentCodes,
          "snapshot_gate_mismatch",
        ])].sort();
      }
      return health;
    } catch {
      if (attempt < MAX_ATTEMPTS) {
        await delay(attempt * 2_000);
        continue;
      }
      return unavailableHealth("health_endpoint_unreachable");
    } finally {
      clearTimeout(timeout);
    }
  }

  return unavailableHealth("health_endpoint_unreachable");
}

function outputPathFromArguments(argv) {
  const index = argv.indexOf("--output");
  if (index === -1 || !argv[index + 1]) throw new Error("Usage: --output <path>");
  return argv[index + 1];
}

async function main() {
  const outputPath = outputPathFromArguments(process.argv.slice(2));
  const health = await fetchIntegrityHealth();
  await writeFile(outputPath, `${JSON.stringify(health, null, 2)}\n`, { mode: 0o600 });
  await chmod(outputPath, 0o600);

  // This summary is generated from a strict allow-list. It contains no token, key,
  // student ID, username, state payload, alert detail, or snapshot contents.
  console.log(JSON.stringify({
    checkedAt: health.checkedAt,
    healthy: health.healthy,
    incidentCodes: health.incidentCodes,
    snapshotChecksEnabled: typeof health.checks?.snapshot?.enabled === "boolean"
      ? health.checks.snapshot.enabled
      : null,
    pendingWarningAlerts: health.checks?.outbox?.pendingWarningCount ?? null,
    pendingOptimisticConflicts:
      health.checks?.outbox?.pendingOptimisticConflictCount ?? null,
  }));
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch(() => {
    // Avoid printing exception objects because environment/HTTP libraries can include
    // request headers. The workflow reconciler will handle the fail-closed document.
    console.error("Flashcard health probe could not write its sanitized result.");
    process.exitCode = 1;
  });
}
