#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { HEALTH_SCHEMA_VERSION } from "./check-flashcard-integrity-health.mjs";
import {
  RECONCILIATION_SCHEMA_VERSION,
  acknowledgementObservationFingerprint,
} from "./reconcile-flashcard-integrity-issue.mjs";

export const ACKNOWLEDGEMENT_SCHEMA_VERSION = "2026-08-15.2";
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 15_000;

function argumentValue(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1 || !argv[index + 1]) {
    throw new Error(`Usage: ${name} <path>`);
  }
  return argv[index + 1];
}

function outboxId(value) {
  const text = String(value ?? "");
  if (!/^[1-9][0-9]{0,18}$/.test(text)) return null;
  try {
    return BigInt(text) <= 9_223_372_036_854_775_807n ? text : null;
  } catch {
    return null;
  }
}

function safeCount(value) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function sha256Digest(value) {
  const text = String(value ?? "");
  return /^[0-9a-f]{64}$/.test(text) ? text : null;
}

function configuration(env) {
  const supabaseUrl = String(env.SUPABASE_URL || "").replace(/\/+$/, "");
  const anonKey = String(env.SUPABASE_ANON_KEY || "");
  const ackToken = String(env.FLASHCARD_WATCHDOG_OUTBOX_ACK_TOKEN || "");
  const repository = String(env.GITHUB_REPOSITORY || "");
  const runId = String(env.GITHUB_RUN_ID || "");
  const runAttempt = String(env.GITHUB_RUN_ATTEMPT || "");

  let parsedUrl;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    throw new Error("SUPABASE_URL is missing or invalid");
  }
  if (parsedUrl.protocol !== "https:") throw new Error("SUPABASE_URL must use HTTPS");
  if (anonKey.length < 20) throw new Error("SUPABASE_ANON_KEY is missing or invalid");
  if (ackToken.length < 32 || ackToken.length > 256) {
    throw new Error("FLASHCARD_WATCHDOG_OUTBOX_ACK_TOKEN is missing or invalid");
  }
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error("GITHUB_REPOSITORY is invalid");
  }
  if (!/^[1-9][0-9]{0,19}$/.test(runId)) throw new Error("GITHUB_RUN_ID is invalid");
  if (!/^[1-9][0-9]{0,9}$/.test(runAttempt)) {
    throw new Error("GITHUB_RUN_ATTEMPT is invalid");
  }

  const reconciliationRunKey = createHash("sha256")
    .update(`${repository}\0${runId}\0${runAttempt}`)
    .digest("hex");
  return { supabaseUrl, anonKey, ackToken, repository, reconciliationRunKey };
}

function validateReconciliation(health, reconciliation) {
  if (health?.schemaVersion !== HEALTH_SCHEMA_VERSION) {
    throw new Error("Health file schema is not acknowledgement-capable");
  }
  if (reconciliation?.schemaVersion !== RECONCILIATION_SCHEMA_VERSION) {
    throw new Error("GitHub reconciliation receipt schema is invalid");
  }
  if (reconciliation.checkedAt !== health.checkedAt) {
    throw new Error("GitHub reconciliation receipt does not match the health observation");
  }
  const fingerprint = acknowledgementObservationFingerprint(health);
  if (reconciliation.healthFingerprint !== fingerprint) {
    throw new Error("GitHub reconciliation fingerprint does not match the health observation");
  }

  const healthyActions = new Set([
    "healthy_no_open_issue",
    "closed_recovered_issue",
  ]);
  const unhealthyActions = new Set([
    "opened_issue",
    "updated_issue",
    "deduplicated_unchanged_issue",
  ]);
  const allowedActions = health?.healthy === true ? healthyActions : unhealthyActions;
  if (!allowedActions.has(reconciliation.action)) {
    throw new Error("GitHub reconciliation action is inconsistent with health status");
  }
  const issueNumber = Number.isSafeInteger(reconciliation.issueNumber)
    && reconciliation.issueNumber > 0
    ? reconciliation.issueNumber
    : null;
  if (reconciliation.action === "healthy_no_open_issue") {
    if (issueNumber !== null) {
      throw new Error("No-open-issue reconciliation unexpectedly names an issue");
    }
  } else if (issueNumber === null) {
    throw new Error("GitHub reconciliation receipt is missing its issue number");
  }

  const outbox = health?.checks?.outbox;
  if (outbox?.ackBatchDigestAlgorithm !==
      "sha256-ordered-decimal-outbox-ids-v1") {
    throw new Error("Trusted outbox batch digest algorithm is missing or invalid");
  }
  const pendingCount = safeCount(outbox?.ackPendingCount);
  if (pendingCount === null) throw new Error("Trusted outbox pending count is missing");
  const throughOutboxId = outboxId(outbox?.ackThroughOutboxId);
  if (pendingCount === 0 && throughOutboxId !== null) {
    throw new Error("Outbox watermark exists for an empty observed batch");
  }
  if (pendingCount > 0 && throughOutboxId === null) {
    throw new Error("Trusted outbox watermark is missing for a pending batch");
  }

  const observedAtText = String(outbox?.ackObservedAt || "");
  const observedAt = new Date(observedAtText);
  if (!Number.isFinite(observedAt.getTime())) {
    throw new Error("Outbox acknowledgement observation time is invalid");
  }
  const observedBatchDigest = sha256Digest(outbox?.ackBatchDigest);
  if (pendingCount === 0 && observedBatchDigest !== null) {
    throw new Error("Outbox batch digest exists for an empty observed batch");
  }
  if (pendingCount > 0 && observedBatchDigest === null) {
    throw new Error("Trusted outbox batch digest is missing");
  }
  return {
    fingerprint,
    // Preserve PostgreSQL sub-millisecond precision so the bound cannot move
    // backwards when JavaScript serializes the ordinary checkedAt summary.
    observedAt: observedAtText,
    reconciliationAction: reconciliation.action,
    issueNumber,
    pendingCount,
    throughOutboxId,
    observedBatchDigest,
  };
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function normalizeReceipt(raw, expected) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Outbox acknowledgement response is malformed");
  }
  const status = raw.status === "acknowledged" ? raw.status : null;
  const throughOutboxId = outboxId(raw.throughOutboxId);
  const previousWatermark = raw.previousWatermark === "0"
    ? "0"
    : outboxId(raw.previousWatermark);
  const resultingWatermark = outboxId(raw.resultingWatermark);
  const deliveredCount = safeCount(raw.deliveredCount);
  const observedBatchDigest = sha256Digest(raw.observedBatchDigest);
  const acknowledgedAt = new Date(raw.acknowledgedAt);

  if (raw.schemaVersion !== ACKNOWLEDGEMENT_SCHEMA_VERSION
      || status === null
      || throughOutboxId !== expected.throughOutboxId
      || previousWatermark === null
      || resultingWatermark === null
      || deliveredCount === null
      || deliveredCount !== expected.batchCount
      || observedBatchDigest !== expected.observedBatchDigest
      || raw.reconciliationRunKey !== expected.reconciliationRunKey
      || raw.reconciliationReference !== expected.reconciliationReference
      || !Number.isFinite(acknowledgedAt.getTime())) {
    throw new Error("Outbox acknowledgement response failed its allow-list validation");
  }
  if (BigInt(resultingWatermark) < BigInt(previousWatermark)) {
    throw new Error("Outbox acknowledgement watermark regressed");
  }

  return {
    schemaVersion: ACKNOWLEDGEMENT_SCHEMA_VERSION,
    status,
    throughOutboxId,
    previousWatermark,
    resultingWatermark,
    deliveredCount,
    observedBatchDigest,
    reconciliationRunKey: expected.reconciliationRunKey,
    reconciliationReference: expected.reconciliationReference,
    acknowledgedAt: acknowledgedAt.toISOString(),
  };
}

export async function acknowledgeOutbox({
  health,
  reconciliation,
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  const config = configuration(env);
  const observation = validateReconciliation(health, reconciliation);
  if (observation.pendingCount === 0) {
    return {
      schemaVersion: ACKNOWLEDGEMENT_SCHEMA_VERSION,
      status: "skipped_empty_batch",
      deliveredCount: 0,
    };
  }

  const endpoint = `${config.supabaseUrl}/rest/v1/rpc/flashcard_integrity_acknowledge_outbox`;
  const expected = {
    throughOutboxId: observation.throughOutboxId,
    observedBatchDigest: observation.observedBatchDigest,
    batchCount: Math.min(observation.pendingCount, 500),
    reconciliationRunKey: config.reconciliationRunKey,
    reconciliationReference:
      `github:${config.repository}#${observation.issueNumber ?? "none"}`,
  };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const headers = {
        accept: "application/json",
        apikey: config.anonKey,
        "content-type": "application/json",
        "x-flashcard-watchdog-outbox-ack-token": config.ackToken,
      };
      if (config.anonKey.startsWith("eyJ")) {
        headers.authorization = `Bearer ${config.anonKey}`;
      }

      const response = await fetchImpl(endpoint, {
        method: "POST",
        redirect: "error",
        signal: controller.signal,
        headers,
        body: JSON.stringify({
          p_through_outbox_id: observation.throughOutboxId,
          p_observed_at: observation.observedAt,
          p_observed_batch_digest: observation.observedBatchDigest,
          p_health_fingerprint: observation.fingerprint,
          p_reconciliation_action: observation.reconciliationAction,
          p_reconciliation_reference: expected.reconciliationReference,
          p_reconciliation_run_key: config.reconciliationRunKey,
        }),
      });

      if (!response.ok) {
        if (response.status >= 500 && attempt < MAX_ATTEMPTS) {
          await delay(attempt * 2_000);
          continue;
        }
        throw new Error(`Outbox acknowledgement failed with HTTP ${response.status}`);
      }
      let raw;
      try {
        raw = await response.json();
      } catch {
        throw new Error("Outbox acknowledgement response is not JSON");
      }
      return normalizeReceipt(raw, expected);
    } catch (error) {
      if (attempt < MAX_ATTEMPTS
          && (error?.name === "AbortError" || error instanceof TypeError)) {
        await delay(attempt * 2_000);
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Outbox acknowledgement endpoint is unreachable");
}

async function main() {
  const argv = process.argv.slice(2);
  const healthPath = argumentValue(argv, "--health");
  const reconciliationPath = argumentValue(argv, "--reconciliation");
  const health = JSON.parse(await readFile(healthPath, "utf8"));
  const reconciliation = JSON.parse(await readFile(reconciliationPath, "utf8"));
  const receipt = await acknowledgeOutbox({ health, reconciliation });

  // Strictly sanitized aggregate output; never print request headers or raw bodies.
  console.log(JSON.stringify({
    status: receipt.status,
    deliveredCount: receipt.deliveredCount,
    throughOutboxId: receipt.throughOutboxId ?? null,
    resultingWatermark: receipt.resultingWatermark ?? null,
  }));
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch((error) => {
    console.error(
      error instanceof Error
        ? error.message
        : "Flashcard outbox acknowledgement failed",
    );
    process.exitCode = 1;
  });
}
