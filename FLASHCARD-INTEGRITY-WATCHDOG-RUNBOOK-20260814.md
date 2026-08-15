# Flashcard integrity watchdog runbook

Status (2026-08-15): the base aggregate watchdog RPC is present in production, but
the external GitHub watchdog is not active. The supplemental snapshot-gate migration,
workflow gates, probe changes, and this revised runbook are **staged only**. They have
not been applied to Supabase or to the actual GitHub repository.

This watchdog is independent of the Flashcard browser code and independent of any
same-project Supabase cron job. GitHub Actions calls a read-only, aggregate-only RPC
every five minutes and maintains one deduplicated incident issue.

## Security model

- The RPC returns only invariant-violation counts, trigger presence, unresolved
  critical-alert count, alert-outbox lateness, and nightly-snapshot health.
- It never returns a student ID, name, username, answer, progress record, state JSON,
  alert detail, mutation, revision, checksum, or snapshot payload.
- Unknown RPC fields are discarded by an explicit JavaScript allow-list before any
  output is written or sent to GitHub.
- The public repository contains no monitor token or digest.
- Supabase stores only a SHA-256 digest in the private
  `flashcard_integrity.watchdog_credentials` table. That table has RLS enabled, no
  policies, and no Data API role privileges.
- The callable RPC is `SECURITY DEFINER` because it reads private integrity tables. It
  has an empty `search_path`, fully qualified objects, an explicit `anon` EXECUTE
  grant, and an independent 256-bit token gate read from an HTTP header.
- GitHub's job has only `contents: read` and `issues: write`. Checkout credentials are
  not persisted, third-party actions are not used, and official actions are pinned to
  full commit SHAs.
- Supabase credentials are present only in the probe step. The GitHub issue step sees
  only the sanitized temporary health document and `github.token`.
- Publishing the workflow does not activate it. The entire job runs only when the
  repository variable `FLASHCARD_WATCHDOG_ENABLED` is exactly `true`; a missing value
  or any other spelling skips the job.
- Snapshot checks have a separate, explicit repository variable. Once the job is
  active, `FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED` must be exactly `true` or
  `false`; missing, differently cased, or malformed values produce a fail-closed
  `watchdog_configuration_invalid` incident without contacting Supabase.
- The database defaults snapshot checks to enabled if the request header is missing,
  stripped, malformed, or anything other than exact `false`. The response states the
  effective mode, and a mismatch between requested and reported mode is unhealthy.
- Disabling snapshot checks suppresses only the three snapshot-family incident codes.
  State, canonical-attempt, trigger, critical-alert, outbox, endpoint, response-schema,
  and token-authentication protections remain active and fail closed.

The snapshot switch is a temporary rollout gate, not a substitute for snapshots and
not a second authentication factor. A caller possessing the watchdog token can send
the header, so GitHub variable/workflow changes require branch protection and review.
Missing headers remain safe because the database enables snapshot checks by default.

## Health rules

The RPC reports unhealthy when any of these is true:

1. a state row has an unknown/disabled key, wrong JSON type, excessive size, invalid
   version, or incorrect SHA-256 checksum;
2. the attempts JSON and normalized canonical attempt records differ in either
   direction, contain a duplicate attempt ID, or have a bad payload checksum;
3. any of seven required protection/audit/immutability triggers is absent or disabled;
4. an unresolved critical integrity alert exists;
5. an alert-outbox row remains undelivered for more than five minutes;
6. when snapshot checks are enabled, the required midnight Hong Kong snapshot is not
   completed by 00:15;
7. when snapshot checks are enabled, the required snapshot failed or its row counts,
   aggregate metrics, student snapshot checksums, or manifest checksum no longer
   match.

The probe retries only transient endpoint/network failure, then fails closed. An
unreachable, unauthorized, malformed, or schema-mismatched endpoint is unhealthy.

## One-time deployment (reviewed change window)

### 1. Apply and verify the database migrations

Apply `supabase-flashcard-integrity-watchdog-20260814.sql` only after Flashcard
integrity phase 1 stages 01–13 pass their verification gate. Do not apply stage 14 as
part of this change. If the base migration is already present, do not re-provision its
credential as a side effect of this rollout.

Then apply
`supabase-flashcard-integrity-watchdog-snapshot-gate-20260815.sql`. It renames the
existing implementation to a non-Data-API internal function and installs the gated
wrapper. Do not publish the revised workflow until the supplemental migration is
verified; the revised probe requires response schema `2026-08-15.1` and will reject
the previous schema.

Confirm:

```sql
select
  has_function_privilege('anon', 'public.flashcard_integrity_health()', 'EXECUTE')
    as anon_can_execute,
  has_function_privilege('authenticated', 'public.flashcard_integrity_health()', 'EXECUTE')
    as authenticated_can_execute,
  has_function_privilege(
    'anon',
    'public.flashcard_integrity_health_snapshot_required_internal()',
    'EXECUTE'
  ) as anon_can_execute_internal,
  has_table_privilege('anon', 'flashcard_integrity.watchdog_credentials', 'SELECT')
    as anon_can_read_credentials;
```

Expected: `true`, `false`, `false`, `false` respectively.

### 2. Generate a token offline and store only its digest in Supabase

Generate 32 random bytes (64 hexadecimal characters). Keep the plaintext token only
in an approved password manager long enough to enter the GitHub secret.

```bash
FLASHCARD_WATCHDOG_TOKEN="$(openssl rand -hex 32)"
printf '%s' "$FLASHCARD_WATCHDOG_TOKEN" | openssl dgst -sha256
```

Copy only the 64-character digest into this reviewed SQL; never place the plaintext
token or digest in Git:

```sql
insert into flashcard_integrity.watchdog_credentials (
  label,
  token_digest,
  enabled,
  valid_after,
  valid_until
)
values (
  'github-actions-primary',
  decode('<SHA256_HEX_DIGEST>', 'hex'),
  true,
  now() - interval '1 minute',
  now() + interval '180 days'
)
on conflict (label) do update
set token_digest = excluded.token_digest,
    enabled = true,
    valid_after = excluded.valid_after,
    valid_until = excluded.valid_until,
    rotated_at = now();
```

### 3. Configure GitHub Actions

In repository **Settings → Secrets and variables → Actions**, add:

- secret `FLASHCARD_WATCHDOG_SUPABASE_URL`;
- secret `FLASHCARD_WATCHDOG_SUPABASE_ANON_KEY` (publishable/legacy anon key only;
  never a service-role or secret key);
- secret `FLASHCARD_WATCHDOG_TOKEN` (the plaintext random token).

Add these repository variables before enabling the workflow:

- `FLASHCARD_WATCHDOG_ENABLED` = `false` initially. Only exact lowercase `true`
  activates both manual and scheduled jobs.
- `FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED` = `false` only during the controlled
  pre-snapshot rollout. Use exact lowercase `true` or `false`; no default is accepted
  by the probe once the job is active.

Protect changes to `.github/workflows/**`, `tools/check-flashcard-integrity-health.mjs`,
`tools/reconcile-flashcard-integrity-issue.mjs`, and watchdog SQL with CODEOWNERS and
branch review. Restrict who can edit Actions secrets or repository variables.

### 4. Activate with a controlled pre-snapshot smoke test

1. Keep `FLASHCARD_WATCHDOG_ENABLED=false`. A manual dispatch at this point must show
   the job as **skipped**. A skip proves the activation gate works; it is not evidence
   that Flashcard data is healthy.
2. Confirm all three secrets are configured, the watchdog token digest is enabled,
   the supplemental RPC returns schema `2026-08-15.1`, and the alert outbox has no
   intentionally unhandled entries.
3. Set `FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED=false`. Record an owner, reason,
   approval, and deadline for removing this temporary exception.
4. Set `FLASHCARD_WATCHDOG_ENABLED=true`, then manually dispatch the workflow.
5. Verify the run is green, no watchdog issue is open, and the sanitized probe summary
   explicitly reports `"snapshotChecksEnabled":false`. Verify state, attempts,
   triggers, critical alerts, outbox, endpoint, schema, and auth checks are still
   present and healthy.
6. Temporarily disable the watchdog credential, manually dispatch, and verify the run
   fails and exactly one issue titled `[Flashcard integrity] Watchdog alert` opens.
7. Re-enable the credential, rerun, and verify that same issue receives one recovery
   comment and closes. Do not create a second issue.
8. Confirm the issue contains no student/account/payload data.

After step 4, the five-minute schedule is active. GitHub scheduled workflows can be
delayed under load; monitor missing workflow runs through an independent provider once
that service is available.

### 5. Turn on snapshot checks after snapshot automation is proven

Do not leave the temporary exception in place merely because the workflow is green.
The green result deliberately excludes snapshot lateness/failure/corruption while the
variable is `false`.

1. Deploy the independently monitored nightly snapshot automation.
2. Complete and verify at least one expected Hong Kong midnight snapshot, including
   manifest and per-student checksum validation and offsite-backup evidence.
3. Confirm the current expected snapshot run is `completed` and not late, failed, or
   corrupt.
4. Change `FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED` to exact lowercase `true` in a
   reviewed repository-settings change.
5. Manually dispatch the workflow. Verify it is green and the sanitized summary
   explicitly reports `"snapshotChecksEnabled":true`.
6. Observe at least one scheduled run and close the temporary-exception record.

If enabling snapshot checks opens an incident, treat that as a real failure; do not
toggle the variable back to `false` merely to obtain a green run.

## Token rotation

Rotate before the 180-day expiry:

1. generate a second token and digest;
2. insert it under a new label with an overlap window;
3. replace the GitHub secret;
4. manually verify a healthy run;
5. disable the old credential;
6. after 24 hours, delete or retain the disabled digest according to the security log
   policy. Never delete incident/audit/history data during an integrity incident.

## Incident response

The workflow issue is deliberately deduplicated by an internal marker and a stable
aggregate fingerprint. It updates only when the incident type/count changes, avoiding
five-minute notification spam. A healthy check closes the issue automatically.

When an issue opens:

1. freeze Flashcard releases and destructive maintenance;
2. preserve GitHub run logs and Supabase database/API logs;
3. take a fresh recovery snapshot if safe;
4. follow `FLASHCARD-INTEGRITY-PHASE1-RUNBOOK-20260814.md`;
5. do not manually close the issue as a substitute for restoring health;
6. never paste student data, secret values, database URLs with credentials, or raw
   responses into the issue.

## Disable without destroying evidence

For an emergency stop, first set `FLASHCARD_WATCHDOG_ENABLED=false`; subsequent jobs
will be skipped. Also disable the credential so a copied workflow token cannot call
the RPC. A skipped job is not a healthy result and must be tracked as a monitoring
outage. To remove API reachability while preserving every private table:

```sql
revoke execute on function public.flashcard_integrity_health() from anon;
notify pgrst, 'reload schema';
```

Do not drop the RPC, credential digests, alerts, outbox, revisions, attempts, snapshot
runs, or snapshots during an incident. Re-enable only after review.

## References

- Supabase Data API security: <https://supabase.com/docs/guides/api/securing-your-api>
- GitHub scheduled issue creation: <https://docs.github.com/en/actions/tutorials/manage-your-work/schedule-issue-creation>
- GitHub Actions secure use: <https://docs.github.com/en/actions/reference/security/secure-use>
