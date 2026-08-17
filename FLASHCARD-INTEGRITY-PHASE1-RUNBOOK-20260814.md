# Flashcard integrity phase 1 — production runbook

This is a forward-only, evidence-preserving rollout. Never run the deprecated monolith. Apply the numbered SQL files individually, in order, and stop whenever a gate fails. A failed stage rolls back only that stage; already completed protection remains available.

## Before stage 01

1. Take and verify a Supabase point-in-time/database backup. Export `flashcard_students` and `flashcard_student_state` to an encrypted off-project object as a second recovery source. Record row counts and SHA-256 checksums.
2. Confirm the target project/database and migration role. Capture current function grants, current state-key/type/maximum-size inventory, active sessions, table size, and free database quota.
3. Confirm the source inventory: ten `edmundFlashcard*` keys plus `edmundStudentDisplayPreferences`, `speaking-access-v1`, and `speaking-bookmarks-v1`. The stage-11 locked inventory safely grandfathers any additional already-live key, but a new unregistered key is rejected after cut-over.
4. Confirm current clients can continue using v1 during rollout. Do not remove `anon`/`PUBLIC` endpoint grants yet. Stage 14 is a separate kill switch.
5. Prepare the outbox dispatcher for `flashcard_integrity.alert_outbox`, with retries and a dead-letter alarm. Invalid legacy state writes and protected deletes use a fail-closed soft rejection: the `BEFORE ROW` trigger records the alert/outbox and returns `NULL`, so PostgreSQL skips the row while the durable database signal commits. The legacy RPCs inspect `ROW_COUNT` and return `false` when a row was skipped. Keep Supabase/Postgres/API error-log monitoring as independent defense-in-depth for unexpected database faults, but it is not the primary or only rejection signal.
6. Prepare the independent aggregate-only five-minute GitHub watchdog from
   `FLASHCARD-INTEGRITY-WATCHDOG-RUNBOOK-20260814.md`. Its migration and credentials
   remain a separate, reviewed activation after stages 01–13 pass; never place its
   plaintext token or token digest in this public repository.

## Apply order and gates

| Stage | File | Purpose | Required gate before continuing |
|---|---|---|---|
| 01 | `...-01-foundation-20260814.sql` | Private schema/tables, 13 source-known key rules, nullable metadata, lightweight metadata trigger | New writes get positive version and correct checksum; public state `updated_at` is unchanged by metadata repair |
| 02 | `...-02-state-metadata-backfill-20260814.sql` | DML-only metadata backfill | Zero null/bad versions and zero bad checksums |
| 03 | `...-03-attempt-routines-20260814.sql` | Lossless attempt merge, normalized-record and alert routines | Function creation succeeds; equal-quality stale input does not replace richer existing nested arrays |
| 04 | `...-04-state-routines-20260814.sql` | Validation, durable soft-rejection, protection and revision routines (not attached) | Invalid rows are skipped only after alert/outbox insertion; normalized mutations roll back before oversize rejection evidence is recorded |
| 05 | `...-05-v2-routines-20260814.sql` | Dark v2 RPCs, idempotency receipts, request/key locks | All four public v2 RPCs remain revoked from client roles |
| 06 | `...-06-snapshot-routines-20260814.sql` | Manual snapshot/manifest and scheduler-inspection routines | No cron job is created |
| 07 | `...-07-integrity-backfill-20260814.sql` | Initial revisions and normalized attempts | No malformed attempts; every current v2 row/relevant attempt has coverage |
| 08 | `...-08-add-not-valid-constraints-20260814.sql` | Add metadata checks `NOT VALID` | Both constraints exist and are not yet invalidating traffic |
| 09 | `...-09-validate-constraints-20260814.sql` | Online validation | Both constraints are validated |
| 10 | `...-10-finalize-columns-20260814.sql` | Brief default/`NOT NULL` finalization | Both columns are non-null; lock timeout caused no partial stage |
| 11 | `...-11-trigger-cutover-20260814.sql` | Locked final inventory, legacy RPC safety replacements, and atomic trigger swap | Full protection/revision/hard-delete/immutability triggers enabled; legacy skipped writes return false; hard-delete RPC performs no child deletion; metadata-only trigger absent |
| 12 | `...-12-post-cutover-catchup-20260814.sql` | Close the stage-07-to-11 write gap and rebuild attempt blobs from canonical records | Registry/revisions pass; every attempts blob is exactly bidirectionally equal to normalized records |
| 13 | `...-13-security-activation-20260814.sql` | RLS/private grants and authenticated v2 activation | Read-only verification passes; old v1 grants are deliberately unchanged |
| 14 | `...-14-auth-role-cutover-20260814.sql` | Optional authenticated-only legacy endpoint cut-over | Run only after the explicit same-session confirmation and production Auth-role telemetry |

Every DDL stage uses a short `lock_timeout`; retry a timed-out file later instead of increasing the timeout during peak traffic. DML backfills are separate from table-locking DDL.

## Verification and smoke sequence

1. Run section A of `supabase-flashcard-integrity-phase1-verification-20260814.sql` after stage 13. Every check must pass. Review every open critical alert and overdue outbox item.
2. The transactional internal smoke test is optional and rolls back. PostgreSQL identity sequences are non-transactional, so gaps in alert/revision/mutation IDs after a rolled-back smoke test are expected and are not lost records.
3. Test the public student and admin v2 wrappers separately using a dedicated quarantined test account and real authenticated JWT/admin test credential. Do not impersonate roles or insert a test user into production inside the acceptance transaction; authentication/session functions and rate limits need an end-to-end test.
4. Test exactly-once replay, concurrent first insert, concurrent reuse of one request ID with different payloads, optimistic conflict/reload, stale subset merge, malformed attempt rejection, unknown-key rejection, and blocked physical delete. For each direct/legacy rejection verify all four conditions together: affected row count is zero (or legacy RPC result is `false`), current state is unchanged, an `alerts` row exists, and its linked pending `alert_outbox` row exists.
5. Deploy the frontend v2 client only after the database is green. On `reloadRequired=true`, call the v2 GET and replace local state with the returned version/checksum/value before another write.

## Stage 14 authenticated-role gate

Stage 14 fails closed unless the operator first sets, in the same database session:

```sql
set flashcard_integrity.authenticated_client_cutover_approved =
  'confirmed-authenticated-only-20260814';
```

Confirm from Cloudflare/Supabase logs that all supported Flashcard builds obtain an authenticated anonymous-user JWT before RPC calls, and have a tested rollback client build. Stage 14 intentionally removes `anon` and PostgreSQL `PUBLIC` execution; treat it as a kill-switch change, not routine cleanup.

## Snapshots, offsite copies, and retention

Phase 1 intentionally schedules no `pg_cron` job. Do not schedule one until an independent worker outside this Supabase project does all of the following:

1. invokes `capture_nightly_snapshot()` and treats returned `failed`/`already_running` as failures requiring follow-up;
2. verifies the run’s snapshot count, aggregate state/attempt/duration/byte metrics, every student checksum, and the deterministic manifest checksum;
3. writes an encrypted, immutable copy to a separate provider/account (for example Cloudflare R2 with object lock/versioning), reads it back, verifies its checksum, and only then records `offsite_provider`, `offsite_object_key`, `offsite_checksum`, and `offsite_verified_at`;
4. enforces quotas and retention. Local deletion must never occur unless the offsite fields are complete, the restore drill passed, and the retention action itself is audited. The current immutable trigger deliberately prevents casual snapshot deletion.

The reviewed nightly target is 04:00 `Asia/Hong_Kong`, with watchdog lateness beginning
at 04:15. Before activating the independent worker, apply
`supabase-flashcard-integrity-snapshot-hkt0400-20260817.sql` and run
`supabase-flashcard-integrity-snapshot-hkt0400-verification-20260817.sql`. Neither file
creates or changes a scheduler. For an independently verified UTC scheduler, 04:00 HKT
is `0 20 * * *`; for a scheduler explicitly configured to `Asia/Hong_Kong`, it is
`0 4 * * *`.

Also monitor growth of receipts, revisions, mutations, alerts/outbox, normalized attempts, and snapshots. Alert at conservative database-size thresholds before service limits.

## Safe disable and incident response

Run `supabase-flashcard-integrity-phase1-forward-disable-20260814.sql` to unschedule any old draft cron job first, revoke v2 entry points second, and retain all evidence. By default it keeps the full protection trigger. Only set the documented break-glass GUC when the trigger itself is proven to cause an outage; that guarded step atomically restores the metadata-only trigger while retaining the hard-delete guard and evidence tables.

Do not drop the private schema, columns, constraints, revisions, receipts, alerts, normalized attempts, or snapshots during an incident. Restore missing user state into a new revision through a reviewed repair transaction, compare checksums, and preserve both pre-repair and post-repair evidence.
