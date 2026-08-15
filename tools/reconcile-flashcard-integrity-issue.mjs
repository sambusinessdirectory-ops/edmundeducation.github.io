#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const ISSUE_TITLE = "[Flashcard integrity] Watchdog alert";
export const ISSUE_MARKER = "<!-- flashcard-integrity-watchdog:v1 -->";
const FINGERPRINT_PREFIX = "<!-- flashcard-integrity-fingerprint:";

function count(check, field) {
  const value = check?.[field];
  return Number.isFinite(value) && value >= 0 ? Math.trunc(value) : 0;
}

function stableIncidentRecord(health) {
  return {
    status: health?.status === "healthy" ? "healthy" : "unhealthy",
    incidentCodes: Array.isArray(health?.incidentCodes)
      ? [...health.incidentCodes].filter((value) => typeof value === "string").sort()
      : ["malformed_health_file"],
    stateViolations: count(health?.checks?.state, "metadataViolationCount"),
    attemptDrift: count(health?.checks?.attempts, "driftCount"),
    missingTriggers: count(health?.checks?.triggers, "missingCount"),
    unresolvedCriticalAlerts: count(health?.checks?.alerts, "unresolvedCriticalCount"),
    pendingOutbox: count(health?.checks?.outbox, "pendingCount"),
    lateOutbox: count(health?.checks?.outbox, "lateCount"),
    snapshotChecksEnabled: typeof health?.checks?.snapshot?.enabled === "boolean"
      ? health.checks.snapshot.enabled
      : null,
    expectedSnapshotDate: health?.checks?.snapshot?.expectedDate || null,
    lastCompletedSnapshotDate: health?.checks?.snapshot?.lastCompletedDate || null,
    snapshotLate: health?.checks?.snapshot?.late === true,
    snapshotCorrupt: health?.checks?.snapshot?.corrupt === true,
    failedExpectedSnapshots: count(health?.checks?.snapshot, "failedExpectedCount"),
    endpointFailure: health?.checks?.endpoint?.failureKind || null,
    endpointHttpStatus: count(health?.checks?.endpoint, "httpStatus") || null,
  };
}

export function incidentFingerprint(health) {
  return createHash("sha256")
    .update(JSON.stringify(stableIncidentRecord(health)))
    .digest("hex");
}

function row(label, value) {
  return `| ${label} | ${String(value).replaceAll("|", "\\|")} |`;
}

/** Build a strictly aggregate-only issue body. No arbitrary response field is copied. */
export function buildIssueBody(health) {
  const record = stableIncidentRecord(health);
  const fingerprint = incidentFingerprint(health);
  const codes = record.incidentCodes.length > 0
    ? record.incidentCodes.map((code) => `\`${code}\``).join(", ")
    : "None reported (response was internally inconsistent)";

  return [
    ISSUE_MARKER,
    `${FINGERPRINT_PREFIX}${fingerprint} -->`,
    "## Flashcard integrity watchdog detected an unhealthy condition",
    "",
    "This issue is maintained automatically and deduplicated. It contains only aggregate health signals—no student names, account identifiers, answers, progress payloads, or snapshot contents.",
    "",
    "| Signal | Aggregate value |",
    "| --- | --- |",
    row("Last checked (UTC)", health?.checkedAt || "unknown"),
    row("Incident codes", codes),
    row("State invariant violations", record.stateViolations),
    row("Canonical attempt drift", record.attemptDrift),
    row("Missing protection triggers", record.missingTriggers),
    row("Unresolved critical alerts", record.unresolvedCriticalAlerts),
    row("Pending / late alert-outbox items", `${record.pendingOutbox} / ${record.lateOutbox}`),
    row("Snapshot checks enabled", record.snapshotChecksEnabled ?? "unknown"),
    row("Required snapshot date", record.expectedSnapshotDate || "unknown"),
    row("Last completed snapshot date", record.lastCompletedSnapshotDate || "none"),
    row("Snapshot late / corrupt / failed", `${record.snapshotLate} / ${record.snapshotCorrupt} / ${record.failedExpectedSnapshots}`),
    row("Endpoint failure / HTTP status", `${record.endpointFailure || "none"} / ${record.endpointHttpStatus || "n/a"}`),
    "",
    "### Immediate response",
    "",
    "1. Freeze Flashcard deployments and destructive maintenance.",
    "2. Preserve database/API logs and take a fresh recovery snapshot if the database is reachable.",
    "3. Follow `FLASHCARD-INTEGRITY-PHASE1-RUNBOOK-20260814.md`; do not delete audit/history rows.",
    "4. Close this issue only through the watchdog's confirmed healthy run.",
    "",
    `Stable incident fingerprint: \`${fingerprint}\``,
  ].join("\n");
}

function githubConfiguration(env) {
  const token = String(env.GITHUB_TOKEN || "");
  const repository = String(env.GITHUB_REPOSITORY || "");
  if (token.length < 20) throw new Error("GITHUB_TOKEN is unavailable");
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error("GITHUB_REPOSITORY is invalid");
  }
  return { token, repository };
}

async function githubRequest(path, { method = "GET", body, config, fetchImpl = fetch } = {}) {
  const response = await fetchImpl(`https://api.github.com${path}`, {
    method,
    redirect: "error",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
      "user-agent": "flashcard-integrity-watchdog",
      "x-github-api-version": "2022-11-28",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`GitHub API request failed with HTTP ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

async function findOpenWatchdogIssue(config, fetchImpl) {
  const query = encodeURIComponent(
    `repo:${config.repository} is:issue is:open in:title "${ISSUE_TITLE}"`,
  );
  const search = await githubRequest(`/search/issues?q=${query}&per_page=20`, {
    config,
    fetchImpl,
  });
  return (search.items || []).find((item) =>
    item.title === ISSUE_TITLE
    && typeof item.body === "string"
    && item.body.includes(ISSUE_MARKER));
}

export async function reconcileIssue(health, { env = process.env, fetchImpl = fetch } = {}) {
  const config = githubConfiguration(env);
  const issue = await findOpenWatchdogIssue(config, fetchImpl);

  if (health?.healthy === true) {
    if (!issue) return { action: "healthy_no_open_issue" };

    await githubRequest(`/repos/${config.repository}/issues/${issue.number}/comments`, {
      method: "POST",
      body: {
        body: `Watchdog recovery confirmed at ${health.checkedAt}. All required aggregate checks are healthy. Closing automatically.`,
      },
      config,
      fetchImpl,
    });
    await githubRequest(`/repos/${config.repository}/issues/${issue.number}`, {
      method: "PATCH",
      body: { state: "closed", state_reason: "completed" },
      config,
      fetchImpl,
    });
    return { action: "closed_recovered_issue", issueNumber: issue.number };
  }

  const body = buildIssueBody(health);
  const fingerprint = incidentFingerprint(health);
  if (!issue) {
    const created = await githubRequest(`/repos/${config.repository}/issues`, {
      method: "POST",
      body: { title: ISSUE_TITLE, body },
      config,
      fetchImpl,
    });
    return { action: "opened_issue", issueNumber: created.number, fingerprint };
  }

  if (!issue.body.includes(`${FINGERPRINT_PREFIX}${fingerprint} -->`)) {
    await githubRequest(`/repos/${config.repository}/issues/${issue.number}`, {
      method: "PATCH",
      body: { body },
      config,
      fetchImpl,
    });
    return { action: "updated_issue", issueNumber: issue.number, fingerprint };
  }

  return { action: "deduplicated_unchanged_issue", issueNumber: issue.number, fingerprint };
}

function inputPathFromArguments(argv) {
  const index = argv.indexOf("--input");
  if (index === -1 || !argv[index + 1]) throw new Error("Usage: --input <path>");
  return argv[index + 1];
}

async function main() {
  const inputPath = inputPathFromArguments(process.argv.slice(2));
  const health = JSON.parse(await readFile(inputPath, "utf8"));
  const result = await reconcileIssue(health);
  console.log(JSON.stringify(result));
  if (health?.healthy !== true) process.exitCode = 1;
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch((error) => {
    // Errors intentionally omit response bodies and request configuration.
    console.error(error instanceof Error ? error.message : "Watchdog issue reconciliation failed");
    process.exitCode = 1;
  });
}
