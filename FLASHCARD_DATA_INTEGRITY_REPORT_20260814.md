# Flashcard Data Integrity and Disaster-Prevention Report

Date: 14 August 2026
Incident class: destructive logical overwrite of student progress
Affected data class: Flashcard attempt history and associated progress state

## 1. Executive conclusion

The incident was caused by a client-side hydration race combined with a server-side last-write-wins data model. A browser temporarily believed that a student's attempt history was empty, created one new attempt, and submitted the resulting one-item array. The database had no version check, no reduction invariant, no anomaly detector, and no before-image archive, so it replaced the older array exactly as requested.

This was not a Supabase outage and was not student error. It was an application data-integrity design failure.

The exact incident path has already been closed by the first emergency release: the dashboard waits for hydration, state-changing actions require hydration, delayed responses are account-scoped, and attempt arrays are merged transactionally on the server. However, that emergency patch is only the first layer. A production subscription service requires independent safeguards so that the failure of any one layer cannot destroy data.

The target standard is:

- no browser, including an old or defective browser, can silently delete canonical progress;
- every accepted write is versioned, idempotent, acknowledged, and attributable;
- destructive or statistically abnormal changes are rejected or quarantined;
- previous versions and normalized attempt records remain recoverable;
- nightly recovery points exist inside the database and independently outside Supabase;
- backup success is monitored by a second provider;
- restores are tested, audited, and performed by merge rather than blind replacement.

## 2. Why the page was usable before download completed

The code previously used one flag for two different facts:

1. the browser had connected to Supabase; and
2. the student's complete progress had finished downloading.

The first fact became true before the second. The interface treated “connected” as “ready,” even though the account data was still in transit. At the same time, the generic browser cache had been cleared to avoid mixing two accounts. Therefore, during that short interval, the browser saw an empty attempt list and was still allowed to start an exercise.

This is a classic time-of-check/time-of-use race. The correct model is an explicit state machine in which `authenticated_unhydrated` and `hydrating` are read-only. Only `ready` may mutate state.

### The exact sequence in plain words

1. The student entered a valid username and password.
2. The website connected to Supabase and treated that connection as a successful login.
3. The old page then prepared the dashboard immediately. At this moment, the student's historical Flashcard data had **not** arrived yet.
4. While waiting, the page's temporary in-memory attempt list was empty. This was meant to be a short-lived placeholder, but the page did not label it as a placeholder.
5. The page wrongly enabled the practice controls while that empty placeholder was active.
6. The student completed a new attempt. The empty placeholder consequently became an array containing one attempt.
7. The page uploaded that one-item array as though it were the student's complete history.
8. The old database function performed a replacement: “make the saved value equal to the uploaded value.” It did not ask whether older attempt IDs had disappeared.
9. The previous large array was therefore replaced by the one-item array.

In other words, the download itself was not deliberately skipped. The page confused **“the account has connected”** with **“the account's complete data is ready.”** That distinction should have existed from the beginning, and the database should still have refused the destructive result even if the page made that mistake.

## 3. Why no alarm fired

The submitted value was syntactically valid:

- it came from a valid student session;
- it used an allowed RPC;
- it was valid JSON;
- it contained a valid Flashcard attempt;
- the SQL operation completed normally.

Nothing in the old system expressed the business rule that attempt history is append-only. The database did not know that 150 attempts becoming one attempt was impossible. Specifically, it had no:

- expected row version;
- previous-count comparison;
- monotonic-field rules;
- minimum/maximum reduction policy;
- immutable attempt table;
- before-update trigger;
- incident table;
- notification path;
- snapshot from which to compare or restore.

An alarm cannot be triggered unless the system first defines what is abnormal and records enough context to detect it.

### Why this should have been considered suspicious

It absolutely should have been. A history changing from many stable attempt IDs to one ID is not normal Flashcard use. The omission was not that an existing alarm missed the event; the old system had no data-loss alarm at all. It checked whether the caller was logged in and whether the payload was valid JSON, but it never checked whether the change made sense.

The corrected alarm policy is therefore based on meaning, not merely technical validity:

- ordinary saves may add attempt IDs but may not remove them;
- a completed attempt may not become incomplete;
- answer totals and elapsed time may not move backwards;
- an empty or sharply smaller upload against a non-empty server record is automatically quarantined;
- the server records the rejected/merged payload, previous counts, student, device/client version, and mutation ID;
- a critical incident is created even when the server successfully prevents the loss.

## 4. Defence-in-depth implementation matrix

### Layer A — Browser access gate

Required controls:

1. Use explicit phases: `signed_out`, `authenticating`, `authenticated_unhydrated`, `hydrating`, `ready`, `offline_ready`, `degraded_read_only`, `conflict`, and `signing_out`.
2. Route every mutation through one central guard. A missing authenticated context must never mean “ready.”
3. Disable every practice, reset, import, edit, bookmark, note, familiarity, and layout mutation until the exact account UUID and state versions are hydrated.
4. Increment a synchronization epoch on login, logout, account switch, and impersonation. Ignore responses from an older epoch.
5. If hydration fails, keep the portal read-only and show a clear error. Do not fall back to an apparently working but unsynced student account.
6. Admin impersonation must also remain read-only until the selected student's data is completely hydrated.

Rationale: preventing unsafe actions at the interface removes the original race and makes partial loading visible.

### Layer B — Legacy-device rescue quarantine

Required controls:

1. Before the first session restoration or cache clear, copy legacy synchronized browser keys into a quarantine bundle.
2. Record a bundle ID, capture time, raw payload, parsed counts, schema version, and digest.
3. Verify the quarantine copy before deleting or replacing the original key.
4. Claim a bundle only after authentication identifies the student UUID and name unambiguously.
5. Never automatically attach ownerless or mismatched records. Preserve them for admin-assisted recovery.
6. Keep consumed bundles for at least 30 days and mark them consumed only after a server acknowledgement proves that all recovered attempt IDs are canonical.
7. If local storage is unavailable or full, block clearing and offer an export/recovery screen.

Rationale: an old device is a recovery source only if opening the new page cannot erase the evidence first.

### Layer C — Durable browser write-ahead log

Required controls:

1. Store every mutation in IndexedDB before changing the visible state.
2. Each mutation carries: mutation ID, student UUID, synchronization epoch, entity/key, operation, payload/delta, base version, client version, creation time, retry count, and status.
3. Retry with exponential backoff and jitter after network or server failure.
4. Replay after startup, reconnect, focus, and visibility restoration.
5. Remove an outbox item only after a canonical server acknowledgement for the same student, epoch, and mutation ID.
6. Track both queued and in-flight work. Logout may finish only after acknowledgement or durable retention.
7. Display truthful states: last successful synchronization time, pending count, offline-but-saved-locally, conflict, or integrity stop.

Rationale: RAM timers and page-unload requests are not durable. The browser must survive crashes and temporary outages without fabricating successful synchronization.

### Layer D — Versioned and idempotent server writes

Required controls:

1. Add a monotonically increasing version to every student-state row.
2. Hydration returns value, version, timestamp, and checksum.
3. Every mutation sends the version on which it was based.
4. Lock the row in one short transaction and compare the expected version.
5. Reject or explicitly merge a version conflict; never silently overwrite.
6. Require a UUID mutation ID and store a write receipt under a unique constraint.
7. Repeating the same request returns the original result instead of applying it twice.
8. Return the canonical server value/version after every write so the browser cannot continue displaying a stale copy.
9. Enforce an allowlist of state keys, expected JSON type, maximum payload size, and domain validation.

Rationale: the server must decide whether a write is safe. A stale client must be harmless even if every browser guard fails.

### Layer E — Domain invariants and anomaly rejection

Required controls:

1. Attempt IDs may be added but not disappear through an ordinary save.
2. A completed attempt may not become incomplete.
3. Answered count, outcome count, and recorded duration may not regress for the same attempt.
4. An incoming attempt array smaller than the canonical array is merged, not substituted, and generates an integrity event.
5. Unknown keys, wrong JSON types, oversized payloads, invalid versions, and repeated conflicts are rejected and logged.
6. Emptying notes, bookmarks, familiarity, or progress requires an explicit typed destructive operation rather than accidental omission from a whole document.
7. Large reductions in any high-value collection require explicit intent and create an audit event.

Rationale: business rules convert a technically valid but impossible change into a detectable incident.

### Layer F — Normalize high-value data

Required controls:

1. Store each attempt under a stable attempt key in a separate canonical table.
2. Never delete a canonical attempt merely because it is absent from a browser snapshot.
3. Eventually store card outcomes as append-only events, or at minimum preserve the strongest attempt record.
4. Store familiarity per student/deck/card rather than replacing one large document.
5. Store progress per student/deck with a version.
6. Store notes, bookmarks, and custom cards as separate entities with tombstones.
7. Reserve last-write-wins only for low-risk UI preferences, and still version those writes.

Rationale: one damaged document must not contain enough authority to erase an entire learning history.

### Layer G — Immutable history and audit

Required controls:

1. Archive before-images for every update and delete of high-value state.
2. Retain student UUID/name, key, version, operation, checksum, size/count metrics, timestamp, transaction ID, actor type, client version, and mutation ID.
3. Keep history in a private, non-API-exposed schema.
4. Revoke all access from `PUBLIC`, `anon`, and ordinary authenticated users.
5. Prevent application RPCs from updating or deleting audit rows.
6. Archive state before a hard student-account deletion so cascade deletion cannot erase the recovery evidence.
7. Record every preview and restoration action in a separate restore audit.

Rationale: prevention may fail; history makes the failure reversible and attributable.

### Layer H — Integrity incident detection and alerting

Required controls:

1. Create a durable incident record for prevented count drops, version conflicts, wrong-owner responses, invalid payloads, rejected legacy writers, failed snapshots, failed off-site backups, and failed restore drills.
2. Assign severity and resolution status.
3. Show unresolved critical incidents prominently in the admin portal.
4. Deliver an external email/webhook alert for critical events.
5. Alert when expected daily backup manifests are absent or late.
6. Rate-limit duplicate notifications without suppressing distinct student incidents.
7. Treat the loss of even one known attempt ID as a blocked critical event; the server must merge the missing attempt back before acknowledging the write.
8. Treat an empty replacement of non-empty state, a drop of at least 25% in entity count, or a drop of at least 50% in payload size as suspicious unless it carries a narrowly scoped, audited delete/reset command.
9. Alert on repeated version conflicts, owner mismatches, browser outbox age above five minutes, snapshots more than fifteen minutes late, or any backup without a verified checksum and success marker.
10. Send alerts through a path independent of the student application so a broken website cannot also hide its own alarm.

Rationale: silent protection is insufficient. The administrator must know that a failure was attempted even when data survived.

### Layer I — Multi-tab and multi-device coordination

Required controls:

1. Elect one synchronization leader per account using Web Locks, with an IndexedDB lease fallback.
2. Share mutations and canonical acknowledgements through `BroadcastChannel`.
3. Follower tabs forward mutations to the leader instead of independently uploading whole snapshots.
4. Fetch current versions before draining an outbox after reconnect.
5. Subscribe to changes or poll versions so remote-device writes become visible.
6. Never resolve a conflict by silently choosing the last browser to save.

Rationale: concurrency is normal behavior, not an exceptional condition.

### Layer J — Old-client containment

Required controls:

1. Introduce a versioned writer RPC with a required client/storage schema version.
2. Deploy server protection before the new browser client.
3. After adoption, disable legacy whole-document writers for non-mergeable state.
4. Keep a compatibility endpoint only where the server can prove the operation is monotonic, such as attempt union.
5. Old clients receive an “update required / read-only” response rather than write permission.

Rationale: an already-open browser may keep old JavaScript for days. The database must contain it.

### Layer K — Midnight in-database snapshots

Required controls:

1. At 00:00 Asia/Hong_Kong (`0 16 * * *` in the UTC database), copy all Flashcard state into a private snapshot batch.
2. Use an advisory lock so only one batch can run.
3. Store batch status, expected and copied row counts, expected and copied bytes, per-row SHA-256 digests, and verification time.
4. Mark a batch complete only after verification succeeds.
5. Use immutable date/batch identifiers; never overwrite yesterday's healthy snapshot.
6. Retain 7–14 local daily snapshots subject to database-size monitoring.
7. Create an incident if capture or verification fails.

Rationale: local snapshots provide fast targeted recovery from application mistakes, although they are not independent of Supabase.

### Layer L — Independent encrypted off-site backups

Required controls:

1. Run the official roles, schema, and data dumps from a private infrastructure repository.
2. Export Storage objects separately because database dumps contain only Storage metadata.
3. Compress and encrypt before upload using an offline-held private key; the automation runner should know only the public encryption recipient.
4. Upload ciphertext to a private Cloudflare R2 bucket with a unique timestamped key.
5. Upload a non-sensitive success manifest last.
6. Download the ciphertext after upload and verify its SHA-256 checksum.
7. Use a bucket-scoped writer credential that cannot change retention settings.
8. Prefer a separate Cloudflare account/admin identity for the backup bucket.
9. Keep daily backups for roughly 90–120 days, weekly backups for one year, and monthly backups according to the privacy policy.

Rationale: a backup stored in the same database or same compromised account is not independent.

### Layer M — Immutable retention

Required controls:

1. Apply an R2 Bucket Lock to backup prefixes for the agreed retention period.
2. Ensure automated writer credentials cannot delete, overwrite, or shorten the lock.
3. Apply lifecycle deletion only after the lock expires.
4. Protect workflow, migration, and backup scripts with CODEOWNERS and branch approval.

Rationale: ransomware, compromised credentials, or operator error must not be able to delete all recovery points.

### Layer N — Independent watchdog

Required controls:

1. GitHub performs the backup; Cloudflare independently checks that the expected manifest exists.
2. Use a second scheduled check and retry path because scheduled jobs may be delayed.
3. The watchdog verifies date, age, size, checksum metadata, and the local Supabase snapshot manifest.
4. Missing or invalid backups trigger an external alert independent of Supabase.

Rationale: a failed backup job that nobody notices is equivalent to no backup.

### Layer O — Restore safety and regular drills

Required controls:

1. Never restore an entire production database to fix one student.
2. Restore a selected backup into a disposable/quarantine database first.
3. Verify checksums, row counts, schema version, critical-table counts, and attempt totals.
4. Preview a student-level diff, then merge only missing or stronger records by stable ID.
5. Require an administrator confirmation and write an immutable restore audit.
6. Perform automated monthly restore tests and a human-reviewed quarterly drill.
7. Maintain two separately secured copies of the decryption key.

Rationale: an untested backup is only a file; safe restoration is part of the backup system.

### Layer P — Operational and security controls

Required controls:

1. Use least-privilege database, R2, GitHub, and watchdog identities.
2. Never place service-role keys, database passwords, R2 secrets, webhook tokens, or decryption keys in frontend code or the public repository.
3. Require MFA/passkeys for Supabase, GitHub, Cloudflare, and the backup administrator.
4. Rotate backup credentials periodically and immediately after an incident.
5. Limit active student sessions and provide “log out other devices.”
6. Monitor database size, history growth, failed RPCs, conflicts, snapshot duration, and backup age.
7. Write an incident-response and recovery runbook with named responsibilities.
8. Extend the same version/history/snapshot standard to every other learning system.
9. Use an expand/backfill/validate/contract migration pattern: add nullable structures in a short transaction, backfill without holding schema locks, validate constraints separately, and only then enforce them.
10. Set short database `lock_timeout` and bounded `statement_timeout` values for production migrations; abort rather than freeze active student traffic.
11. Run production migrations as small ordered units with a verified checkpoint after each unit. Never combine table-locking DDL, historical backfills, trigger installation, and extension setup in one long transaction.
12. Test migrations against a representative non-production copy or branch, monitor locks and API errors during rollout, and keep a documented forward-fix/rollback procedure.

Rationale: technical safeguards fail when privileged identities and operational procedures are weak.

### Layer Q — Immediate forensic recovery after any future incident

Required controls and procedure:

1. Freeze destructive writers and place the affected account in read-only mode.
2. Do not ask the student to clear browser data, reinstall the browser, or repeatedly log in and out.
3. Export the affected student's current server state and checksums before attempting repair.
4. Collect quarantined IndexedDB/localStorage bundles from every device the student used, without automatically uploading ownerless records.
5. Inspect immutable database revisions, normalized attempt events, emergency snapshots, daily snapshots, and the latest verified R2 backup.
6. If provider point-in-time recovery exists, restore the relevant time into a separate project/database; never roll the whole live project backwards merely to recover one student.
7. Build a candidate recovery set by attempt ID and select the strongest monotonic fields for duplicates.
8. Show the administrator a before/after diff: missing IDs, completed attempts, answer totals, elapsed time, and source snapshot.
9. Take a fresh pre-recovery snapshot, then merge the candidate records through the audited restore RPC.
10. Verify the restored counts from both the student's account and the administrative dashboard before closing the incident.

Rationale: recovery work itself can destroy evidence. The first action must preserve every remaining copy, and restoration must occur by reviewed merge rather than another whole-document replacement.

### Layer R — Optional continuously updated secondary database

For a subscription service, a second database can reduce recovery time further, but it must be designed carefully:

1. Keep Supabase as the single writer initially. Do not make the browser write independently to two databases; one request could succeed and the other fail, creating two contradictory “truths.”
2. Write each accepted mutation to a transactional database outbox in the same Supabase transaction as the canonical change.
3. A server-side replicator copies immutable mutation events and periodic state checkpoints to a Postgres database owned by a different provider/account.
4. Give the replicator insert-only credentials at the secondary destination. It must not be able to delete earlier events.
5. Store source transaction ID, mutation ID, student ID, entity ID, version, checksum, and replication timestamp under unique constraints.
6. Run a reconciliation job that compares record counts, maximum versions, missing mutation IDs, and rolling checksums; discrepancies create critical incidents.
7. Define and measure recovery-point objective (for example, less than five minutes of accepted writes) and recovery-time objective (for example, service restored within one hour).
8. Maintain a tested promotion procedure: freeze the primary writer, verify replication lag, promote the secondary, rotate credentials, and change the server endpoint. Never perform automatic active-active failover while whole-document state still exists.
9. Keep nightly encrypted R2 backups even after replication is enabled. Replication copies accidental deletions and corrupt logical writes too; immutable backups preserve older truth.
10. Prefer a different provider, account, administrator identity, and region so one billing, credential, or provider incident cannot affect both copies.

Possible targets include a separately owned managed Postgres service or a self-hosted Postgres instance. This layer has recurring cost and operational complexity, so it should follow—not replace—the versioning, immutable history, snapshots, and restore work.

Rationale: a secondary database protects availability and shortens failover, while immutable backups protect history. They solve different problems and both are required for high assurance.

## 5. Implementation order

### Phase 0 — already deployed emergency containment

- hydration barrier;
- account-owner checks for asynchronous work;
- server-side attempt union;
- account-scoped attempt rescue copy;
- save flush before logout.

### Phase 1 — immediate production integrity foundation

- pre-authentication quarantine of legacy browser data;
- strict mutation state machine;
- version/checksum columns;
- idempotent v2 mutation RPC;
- canonical server acknowledgements;
- attempt normalization shadow table;
- immutable history and incident tables;
- verified local snapshot routine and an immediate manual recovery point; keep its automatic daily schedule disabled until independent alert delivery and off-site-verified retention are active.

### Phase 2 — client durability and concurrency

- IndexedDB outbox;
- retry/acknowledgement UI;
- multi-tab leader and broadcast reconciliation;
- explicit domain operations and tombstones;
- disable unsafe legacy writers.

### Phase 3 — independent backup and monitoring

- private infrastructure repository;
- encrypted nightly database and Storage export to private R2;
- R2 Bucket Lock/lifecycle;
- independent Cloudflare watchdog and alerting;
- enable the midnight local snapshot schedule only after the watchdog verifies completed manifests and the retention worker requires an immutable off-site archive receipt;
- automated restore verification.

### Phase 4 — normalize all progress systems

- migrate familiarity, progress, notes, bookmarks, and custom cards to entity-level tables;
- audit every other portal for last-write-wins documents;
- apply the same write receipts, versions, history, alerts, snapshots, and restore procedures across the platform.

## 6. Success criteria

The work is not complete until all of these tests pass:

1. A simulated 150-to-1 attempt upload retains all 151 unique attempts, records a critical prevented-regression incident, and alerts the administrator.
2. Two devices add different attempts simultaneously and both survive.
3. Two devices update non-mergeable state from the same version; one succeeds and the other receives a conflict without data loss.
4. Repeating a mutation ID applies it exactly once.
5. A five-second hydration delay leaves every mutation route blocked.
6. An old browser with local history but no session storage is quarantined before cache clearing.
7. A failed or interrupted save remains in the durable outbox and later replays exactly once.
8. A hard account deletion leaves a recoverable archived copy according to retention policy.
9. Midnight snapshot verification detects count or checksum mismatch.
10. A missing R2 backup produces an independent alert.
11. A selected student can be reconstructed in a quarantine database and merged without overwriting current production data.
12. Monthly automated and quarterly human restore drills succeed.
13. A migration-lock test proves schema changes fail quickly when they cannot obtain a safe lock, rather than blocking student reads or writes.
14. Every production rollout records its migration version, pre-change snapshot ID, verification result, and deploy commit.

## 7. Residual risk statement

No honest system can promise absolute zero risk. Hardware providers, credentials, software, administrators, and encryption keys can all fail. The correct goal is that no single failure—and preferably no two ordinary failures—can cause unrecoverable loss. The layers in this report provide prevention, detection, containment, independent recovery, and proof that recovery works.

## 8. Execution record — 14 August 2026

This section distinguishes controls that are live from controls that are only prepared. A prepared control must never be described to students or administrators as an active backup.

### Live now

- Two private, same-database emergency recovery batches exist in the locked-down `flashcard_recovery` schema. The newest batch is `03bb3759-a015-4cf0-9071-731ed0e29b36`, captured at `2026-08-14 14:18:47 UTC`; all 120 rows and 1,256,663 bytes were copied, and every stored value hash verified.
- Database rollout stages 01–10 are applied. They create the integrity schema, state-key registry, version/checksum metadata, lossless attempt merge routines, v2 routines (not yet granted to clients), snapshot routines, canonical attempt records, validated constraints, and non-null metadata.
- The preparation verification found zero invalid versions and zero invalid checksums across all 120 current state rows.
- Canonical attempt preservation currently contains 447 unique attempt records across 17 students with attempt history.
- Manual integrity snapshot run `54d90810-0a54-4d57-b5f7-10e9864f8fb0` completed for all 19 students with manifest checksum `2fd978b811bfcc7286bfd5f3a685149898f5f80355a41e271f8bce2ce84c0320`.
- A dedicated private Cloudflare R2 bucket, `edmund-flashcard-backups-private`, now exists. It contains no backup yet and therefore is not yet a recovery copy.

### Deliberately not activated yet

- Stages 11–13—the protection-trigger cut-over, bidirectional canonical catch-up, and v2 client grants—remain gated on an independent incident/outbox monitor and a verified off-site export. Activating them without those controls would recreate the original problem of silent failure.
- Stage 14, which removes legacy anonymous RPC access, remains excluded until every deployed browser version has migrated safely.
- Automatic database snapshot cron remains disabled. A scheduler is not a backup unless an independent observer verifies the manifest and the off-site object.
- R2 Bucket Lock remains disabled until a retention duration is approved and a restore test succeeds. Bucket Lock is intentionally difficult to reverse.
- The hardened browser client is tested but not yet published because the v2 server grants are correctly withheld until the cut-over gate passes.

### Independent review record

- The first review stopped the rollout because Stage 12 checked reconciliation in only one direction. Stage 12 now rebuilds every public attempt blob from canonical records and refuses commit unless both directions match exactly.
- Parser verification then stopped the rollout because 90 schema-qualified SQL special forms would have failed with PostgreSQL error `42883`. They were corrected before any affected stage reached production, and a regression test now prohibits their return.
- Four Flashcard regression suites pass: state integrity, display preferences, outcome counting/admin sorting, and staged database source checks.

This stop-and-fix record is intentional evidence that release gates are working.

## 9. Authoritative implementation references

- Supabase database backup policy and PITR: <https://supabase.com/docs/guides/platform/backups>
- Supabase CLI backup and restore procedure: <https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore>
- Supabase scheduled GitHub backup example: <https://supabase.com/docs/guides/deployment/ci/backups>
- Supabase platform-to-self-hosted restore procedure: <https://supabase.com/docs/guides/self-hosting/restore-from-platform>
- Cloudflare R2 Bucket Lock: <https://developers.cloudflare.com/r2/buckets/bucket-locks/>
- Cloudflare R2 durability and deletion caveat: <https://developers.cloudflare.com/r2/reference/durability/>
- GitHub Actions security hardening: <https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions>

Important current provider limits reflected in this design:

- Supabase states that Free projects should regularly export data and keep off-site backups; automatic daily platform backups are a paid-plan feature.
- A database backup does not contain the actual files stored through Supabase Storage, so Storage objects require a separate export.
- Cloudflare R2 durability does not protect against intentional or accidental deletion; bucket-scoped credentials and Bucket Lock provide that separate control.
- An R2 Bucket Lock prevents deletion and overwriting for the configured retention period and takes precedence over lifecycle deletion.
