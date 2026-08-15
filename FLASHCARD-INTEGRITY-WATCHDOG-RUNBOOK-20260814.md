# Flashcard integrity watchdog runbook

Status (2026-08-15): the base aggregate watchdog RPC, public snapshot-gate wrapper,
legacy-object merge guard, and supplemental eight-trigger internal inventory are
present and transactionally verified in production. The external GitHub watchdog was
active and is temporarily gated off for this schema cutover. Snapshot-family checks remain
temporarily disabled until the independent encrypted nightly backup is restored in
quarantine and the nightly schedule is activated; every non-snapshot integrity check
remains active and fail-closed. The base external outbox acknowledgement schema
`2026-08-15.2` and its separately scoped consumer credential are installed with the
workflow gate disabled. The forward exact-batch schema `2026-08-15.3` was installed,
but its first verification exposed invalid `pg_catalog.least` qualification in the
live function body. Keep the workflow gate disabled, apply the function-only forward
repair described below, and require the full schema `.3` verification to pass before
the acknowledgement workflow is activated. Do not reapply the original `.3`
migration to repair an already-installed environment.

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
- The staged delivery design uses a second random token whose digest is stored in a
  private, RLS-enabled consumer table. The probe never receives this write token; the
  GitHub reconciliation step never receives it; and the acknowledgement step never
  receives `GITHUB_TOKEN`.
- The exact-batch acknowledgement RPC returns only aggregate counts, a decimal-string
  high-water mark, and SHA-256 of the ordered observed outbox IDs. It cannot return
  alert details or student/account/state data. It recomputes the digest while locking
  the batch and updates only that captured ID array; a newly committed lower ID, later
  ID, delivered row, or any other membership change fails closed.
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
3. any of eight required compatibility/protection/audit/immutability triggers is
   absent or disabled;
4. an unresolved critical integrity alert exists;
5. an alert-outbox row remains undelivered for more than five minutes;
6. when snapshot checks are enabled, the required midnight Hong Kong snapshot is not
   completed by 00:15;
7. when snapshot checks are enabled, the required snapshot failed or its row counts,
   aggregate metrics, student snapshot checksums, or manifest checksum no longer
   match.

The probe retries only transient endpoint/network failure, then fails closed. An
unreachable, unauthorized, malformed, or schema-mismatched endpoint is unhealthy.

## Alert-outbox delivery and warning policy

The `alert_outbox_late` failure in workflow run `31863169000` was a real monitoring
failure: warning alerts were durably queued, but no consumer ever marked successful
delivery. The database correctly kept them pending. Do not bulk-edit `delivered_at`
from the SQL editor and do not weaken the five-minute health rule.

The staged external delivery path is deliberately ordered:

1. the read-only probe obtains a privacy-safe aggregate health document, the current
   pending outbox watermark as decimal text, and SHA-256 of the ordered batch IDs;
2. the GitHub step opens, updates, deduplicates, closes, or confirms the absence of the
   watchdog issue;
3. only after that GitHub API operation succeeds, the separately scoped
   acknowledgement step verifies the health fingerprint and reconciliation receipt,
then acknowledges the exact observed batch;
4. a final step evaluates the original health document. If that observation was
   unhealthy, the same workflow run remains red even though delivery succeeded.

Any GitHub reconciliation failure prevents acknowledgement. Any token, schema,
fingerprint, action, time-window, response, watermark, or batch-digest mismatch fails
closed and leaves rows pending. Network retries reuse a deterministic
repository/run/attempt key;
the private append-only receipt makes replay idempotent. A later row or a new conflict
after the probe receives a larger outbox ID and remains for the next run.

`optimistic_version_conflict` at warning severity is normal evidence that optimistic
concurrency rejected a stale write. Individual conflicts should **not** open and close
one GitHub issue each; that would create alert fatigue and incorrectly imply data was
lost. The issue and workflow show only aggregate pending warning, critical, and
optimistic-conflict counts. A late undelivered notification still opens the existing
watchdog issue. A future reviewed policy may add a separate `optimistic_conflict_burst`
incident for a sustained rate/ratio threshold, but must not classify one ordinary
conflict as an integrity failure. Delivery acknowledgement does not set
`alerts.resolved_at`: notification delivery and semantic resolution are different
facts, and the alert audit trail remains intact.

### Forward supplemental deployment: exact-batch acknowledgement

Use a reviewed change window and keep `FLASHCARD_WATCHDOG_ENABLED=false` during the
database/client schema transition:

1. confirm the scoped consumer digest and GitHub secret are installed while
   `FLASHCARD_WATCHDOG_ENABLED=false`;
2. for a fresh environment whose health RPC is still schema `2026-08-15.2`, apply
   `supabase-flashcard-integrity-watchdog-outbox-batch-digest-20260815.sql`; for the
   existing production environment where schema `.3` is already installed, **do not
   reapply it** and instead apply
   `supabase-flashcard-integrity-watchdog-outbox-batch-digest-function-repair-20260815.sql`;
3. run (or rerun)
   `supabase-flashcard-integrity-watchdog-outbox-batch-digest-verification-20260815.sql`
   and require its rolled-back exact-membership acceptance tests to pass with no SQL
   error. Confirm the health response is schema `.3`, exposes the ordered-ID digest
   and algorithm, the seven-argument acknowledgement RPC is callable only by `anon`,
   and the retained six-argument implementation is not callable by Data API roles;
4. publish the schema `2026-08-15.3` probe and reconciliation receipt, schema
   `2026-08-15.2` acknowledgement receipt client, final health gate, and workflow
   together; do not rotate the already-provisioned acknowledgement token;
5. set `FLASHCARD_WATCHDOG_ENABLED=true` and immediately manually dispatch once;
   the five-minute schedule becomes active at the same moment, while the workflow's
   concurrency group serializes any scheduled run behind the controlled run;
6. verify GitHub reconciliation precedes acknowledgement,
   verify the original unhealthy observation stays red, and verify the next run sees
   the delivered exact batch and closes only after all other health checks pass.

Stop without enabling the workflow if the repair rejects the live function markers,
the verification reports any error, the health RPC is not schema `.3`, either RPC has
unexpected privileges, or the deployed workflow/client source does not match the
verified database contract. The repair replaces only the two already-installed
function definitions and reasserts their grants; it does not mutate outbox rows,
acknowledgement receipts, consumer credentials, alerts, or student data.

Generate and provision the separate acknowledgement credential:

```bash
FLASHCARD_WATCHDOG_OUTBOX_ACK_TOKEN="$(openssl rand -hex 32)"
printf '%s' "$FLASHCARD_WATCHDOG_OUTBOX_ACK_TOKEN" | openssl dgst -sha256
```

```sql
insert into flashcard_integrity.watchdog_outbox_consumers (
  label,
  destination,
  token_digest,
  enabled,
  valid_after,
  valid_until
)
values (
  'github-actions-outbox-primary',
  'flashcard-integrity-monitor',
  decode('<SHA256_HEX_DIGEST>', 'hex'),
  true,
  now() - interval '1 minute',
  now() + interval '90 days'
)
on conflict (label) do update
set token_digest = excluded.token_digest,
    enabled = true,
    valid_after = excluded.valid_after,
    valid_until = excluded.valid_until,
    rotated_at = now(),
    updated_at = now();
```

Never reuse the health token for this consumer. The separate token limits compromise
of the read-only probe and permits independent 90-day rotation. The database cannot
cryptographically attest that GitHub accepted its own issue mutation; that boundary
is enforced by reviewed workflow ordering, per-step secret isolation, immutable
reconciliation input, deterministic run keys, branch protection, and append-only
database receipts.

Each run acknowledges at most 500 oldest pending rows. The probe hashes their ordered
decimal IDs; the RPC recomputes that digest under row locks and updates only those IDs.
This keeps the transaction and row-lock window short, closes the lower-ID transaction
race, and leaves a larger backlog visibly unhealthy for successive red runs.

## One-time deployment (reviewed change window)

### 1. Apply and verify the database migrations

Production already has the public snapshot-gate wrapper. After Flashcard integrity
phase 1 stages 01–13 pass their verification gate, use this production-safe order:

1. apply
   `supabase-flashcard-integrity-legacy-object-merge-guard-20260815.sql`;
2. run
   `supabase-flashcard-integrity-legacy-object-merge-guard-verification-20260815.sql`
   and require its transaction to pass (the verification rolls all test data back);
3. apply
   `supabase-flashcard-integrity-watchdog-eight-trigger-internal-20260815.sql`;
4. run
   `supabase-flashcard-integrity-watchdog-eight-trigger-internal-verification-20260815.sql`
   and require its transaction to pass.

Do not apply phase 1 stage 14 as part of this change. If the base watchdog migration
is already present, preserve the existing credential rows; do not re-provision or
rotate a credential as an accidental side effect of this rollout. Applying the
updated watchdog before the guard will correctly report `integrity_trigger_missing`.

The order above is mandatory. **Do not reapply either**
`supabase-flashcard-integrity-watchdog-20260814.sql` or
`supabase-flashcard-integrity-watchdog-snapshot-gate-20260815.sql` in production.
Reapplying the base watchdog after the public wrapper exists could replace that wrapper
and undo the snapshot gate. The supplemental migration updates only the renamed
internal implementation, preserves all credential rows, and never creates, replaces,
grants, or revokes the public wrapper.

For a genuinely fresh environment only, apply the updated eight-trigger base watchdog
and then the snapshot-gate migration; the supplemental internal migration is not
needed because the implementation being renamed already contains all eight triggers.

The eight required trigger names are:

- `flashcard_state_zy_legacy_object_merge`;
- `flashcard_state_zz_integrity_protect`;
- `flashcard_state_revision_audit`;
- `flashcard_student_hard_delete_protected`;
- `flashcard_integrity_state_revisions_immutable`;
- `flashcard_integrity_receipts_immutable`;
- `flashcard_integrity_attempt_mutations_immutable`;
- `flashcard_integrity_snapshots_immutable`.

The compatibility guard deliberately performs a **shallow top-level merge** for
legacy v1 student/admin object upserts. An object member omitted by a legacy writer is
preserved, so a legacy v1 client can no longer delete or reset one top-level member by
omitting it. Incoming values still win for members the request actually supplies.
Nested values underneath a supplied member are not recursively merged. Deliberate
member removal and exact replacement must use the version-checked v2 writer.

The base acknowledgement probe requires response schema `2026-08-15.2`. Do not
publish the exact-batch workflow until its forward migration is verified; the staged
probe requires schema `2026-08-15.3` and deliberately rejects both earlier schemas.

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
- after the staged acknowledgement migration is verified, secret
  `FLASHCARD_WATCHDOG_OUTBOX_ACK_TOKEN` (a distinct plaintext random token scoped only
  to the `flashcard-integrity-monitor` destination).

Add these repository variables before enabling the workflow:

- `FLASHCARD_WATCHDOG_ENABLED` = `false` initially. Only exact lowercase `true`
  activates both manual and scheduled jobs.
- `FLASHCARD_WATCHDOG_SNAPSHOT_CHECKS_ENABLED` = `false` only during the controlled
  pre-snapshot rollout. Use exact lowercase `true` or `false`; no default is accepted
  by the probe once the job is active.

Protect changes to `.github/workflows/**`, `tools/check-flashcard-integrity-health.mjs`,
`tools/reconcile-flashcard-integrity-issue.mjs`,
`tools/acknowledge-flashcard-integrity-outbox.mjs`,
`tools/assert-flashcard-integrity-health.mjs`, and watchdog SQL with CODEOWNERS and
branch review. Restrict who can edit Actions secrets or repository variables.

### 4. Activate with a controlled pre-snapshot smoke test

1. Keep `FLASHCARD_WATCHDOG_ENABLED=false`. A manual dispatch at this point must show
   the job as **skipped**. A skip proves the activation gate works; it is not evidence
   that Flashcard data is healthy.
2. Confirm the three existing secrets are configured (and the fourth acknowledgement
   secret after that staged path is enabled), the relevant token digests are enabled,
   the RPC returns the schema required by the deployed client, and no alert-outbox
   entry is being intentionally abandoned.
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

Do not run
`supabase-flashcard-integrity-legacy-object-merge-guard-rollback-20260815.sql` as a
routine disable action. Once the watchdog uses the eight-trigger contract, removing
or disabling `flashcard_state_zy_legacy_object_merge` must open and retain an
`integrity_trigger_missing` incident until the guard is restored or a separately
reviewed redesign intentionally updates the watchdog contract. The guard rollback is
fail-closed and requires its explicit same-session approval setting; it does not
delete state or audit evidence.

To emergency-disable exact-batch acknowledgement, first disable its consumer
credential and remove the GitHub acknowledgement secret. If a reviewed code rollback
is still required, use
`supabase-flashcard-integrity-watchdog-outbox-batch-digest-rollback-20260815.sql` with
its exact same-session approval setting. That rollback restores the preserved schema
`2026-08-15.2` health and six-argument acknowledgement contracts, while deliberately
retaining credential digests, digest columns, append-only receipts, alerts, and outbox
evidence. Keep the workflow gate off until the matching `.2` client is restored.

## References

- Supabase Data API security: <https://supabase.com/docs/guides/api/securing-your-api>
- GitHub scheduled issue creation: <https://docs.github.com/en/actions/tutorials/manage-your-work/schedule-issue-creation>
- GitHub Actions secure use: <https://docs.github.com/en/actions/reference/security/secure-use>
