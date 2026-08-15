# Flashcard optimistic-conflict alert containment runbook

Status: staged for review only; **not deployed**.

This change contains repeated `optimistic_version_conflict` warning notifications and
does not weaken optimistic concurrency or the version check that protected the
student's saved data. It is a database operations change, not a conflict-resolution
shortcut: every stale write is still rejected, receives `status=conflict`,
`code=version_conflict`, and `reloadRequired=true`, and must reload before retrying.

## Why the warning storm occurs

`write_state_v2` correctly rejects a write when `expected_version` differs from the
current version. An exact replay of the same request ID is already idempotent, but a
browser can generate many different request IDs while repeatedly retrying the same
stale payload. Before this change, each distinct request produced a new warning alert
and outbox row. The state was safe, but the undelivered outbox rows made the watchdog
repeatedly unhealthy and generated excessive operational noise.

The containment migration replaces only the private `record_alert` helper. It does
not replace `write_state_v2`, alter its expected-version comparison, change the public
RPCs, or grant a client any new privilege.

## Containment semantics

For a warning whose code is exactly `optimistic_version_conflict`, the recorder builds
a SHA-256 fingerprint from the complete fields that would be stored in the operational
alert:

- student ID and state key;
- normalized severity, code, action, and actor kind;
- current state metrics and incoming payload metrics.

The request ID and timestamp are deliberately excluded. They vary per retry, while
each request remains independently traceable through `write_receipts` and its payload
checksum.

An unresolved alert with the same fingerprint in the same fixed 15-minute UTC bucket
becomes the canonical alert. A repeat increments `occurrence_count`, updates
`last_seen_at` and `last_request_id`, and returns the same alert ID to the new receipt.
While that alert already has an undelivered monitor outbox row, the repeat does not add
another. If the independently authenticated external consumer has delivered the prior
notification, a later recurrence adds one fresh pending outbox row to prevent a false
watchdog recovery. A transaction advisory lock plus a partial unique index prevents
racing requests from creating two canonical alerts or two pending notifications.

This produces at most four canonical alerts per hour for one continuously
identical fingerprint. A conflict with a different student, key, actor, action, or
metrics is not coalesced. A bucket boundary can produce two close notifications; this
is intentional so an incident cannot be hidden indefinitely by extending a sliding
window. The separate consumer can deliver more than four outbox rows per hour if an
incident genuinely recurs after each delivery, but there is never more than one pending
row per canonical alert/destination through this recorder.

All other info, warning, and critical alerts preserve the original one-call/one-alert
behavior.

## Evidence and data-safety guarantees

- CAS continues to reject every stale payload. Student state, version, and checksum do
  not change.
- Every distinct request keeps a `write_receipts` row and payload checksum, even when
  several receipts reference one canonical alert.
- The first request ID and first alert metrics remain on the canonical alert. Count,
  last-seen time, and last request ID show the repeated incident.
- A rejected conflict creates no state revision because no state changed. Fabricating
  one would falsely claim a data mutation. Existing revisions remain untouched.
- Alerts, receipts, outbox rows, attempts, `last_error`, and resolution evidence are
  never deleted by either the migration or its forward rollback.
- No student value, progress, answer, attempt, account, session, or credential row is
  changed by the migration.
- `record_alert` remains unavailable to `PUBLIC`, `anon`, `authenticated`, and
  `service_role` through the Data API.

## Existing warning outbox rows: can they be closed?

Existing warning outbox rows can safely be marked delivered only after the external
GitHub issue reconciler has accepted the aggregate incident. A delivered timestamp
means "the notification was captured externally"; it must never mean "we wanted the
watchdog to become quiet."

Never mark an outbox row delivered merely to quiet the watchdog.

Delivery belongs exclusively to the separately staged external acknowledgement path in
`supabase-flashcard-integrity-watchdog-outbox-ack-20260815.sql`. That design uses a
second SHA-256-digested scoped token, a destination-bound and observation-bounded
monotonic outbox watermark, and append-only acknowledgement receipts containing the
consumer, reconciliation run key, health fingerprint, GitHub reconciliation action,
previous/resulting watermark, and delivered count. A row created after the health
observation cannot be swept into that earlier acknowledgement. This containment
migration neither sets `delivered_at` nor exposes a competing delivery endpoint.

Delivery and semantic resolution are different. The external consumer deliberately
leaves `alerts.resolved_at` unchanged. Because the watchdog treats unresolved critical
alerts—not unresolved warnings—as the alert-health failure, delivered optimistic
conflict warnings do not need to be mass-resolved to restore health. It is technically
safe for a trusted operator to resolve an individually reviewed conflict warning after
full incident triage because CAS rejected the payload and the alert, receipt, and
revision evidence remain. That action should be a separate reviewed operation with an
external issue reference. No resolver is staged in this change; automatic or bulk
resolution would confuse notification delivery with root-cause closure.

### Approved backlog procedure

1. In a trusted SQL session, list the exact warning alert IDs, their first
   and last seen times, occurrence counts, and outbox state. For alerts that predate
   this migration, use `coalesce(last_seen_at, created_at)`,
   `coalesce(last_request_id, request_id)`, and `coalesce(occurrence_count, 1)`. Do not
   copy student state or receipt payload checksums into a public issue.
2. Let the external GitHub reconciler open/update its private aggregate issue. It must
   produce a reconciliation record before the separately scoped acknowledgement step
   runs; if issue reconciliation fails, the workflow must not acknowledge the outbox.
3. Require the bounded acknowledgement receipt to match the health observation's exact
   watermark, time, health fingerprint, run key, and reconciliation action. Do not run a
   direct blanket `UPDATE alert_outbox`.
4. Verify the selected outbox rows are delivered, the immutable acknowledgement receipt
   exists, all alerts and linked write receipts remain, and any later/unobserved outbox
   row is still pending.
5. Re-run the watchdog. If it remains unhealthy, investigate the remaining rows; do not
   broaden a watermark or resolve alerts merely to clear the alarm.

## Staged deployment order

Production already has the public snapshot-gate watchdog wrapper. **Do not reapply the
base watchdog or snapshot-gate migrations.** This change does not touch the watchdog
implementation, credentials, trigger inventory, public wrapper, or grants.

During an approved low-traffic change window:

1. Run all repository integrity tests, including:

   ```bash
   node tools/test-flashcard-conflict-alert-containment.mjs
   ```

2. Capture the current definition and ACL of `flashcard_integrity.record_alert`, the
   current open-conflict/outbox counts, and watchdog health for the change record. The
   preflight must show no duplicate pending rows for one alert/destination:

   ```sql
   select alert_id, destination, count(*)
   from flashcard_integrity.alert_outbox
   where delivered_at is null
   group by alert_id, destination
   having count(*) > 1;
   ```

   Require zero rows. If any row is returned, stop and investigate; do not delete or
   auto-deliver evidence to make the unique-index migration pass.
3. Apply only
   `supabase-flashcard-integrity-conflict-alert-containment-20260815.sql`.
4. Run
   `supabase-flashcard-integrity-conflict-alert-containment-verification-20260815.sql`.
   It creates synthetic rows inside a transaction and rolls all row changes back.
   Harmless identity-sequence gaps can remain.
5. Confirm the verification reports PASS, the private helper remains inaccessible
   to Data API roles, and the watchdog still authenticates through the existing public
   snapshot-gate wrapper.
6. Generate two controlled stale writes with different request IDs. Require two
   receipts, one canonical alert, one outbox row, unchanged state/version/checksum,
   and no new revision.
7. Observe normal production traffic for at least one complete 15-minute bucket.
   Confirm non-conflict alerts are still one-per-call and no new database errors occur.
8. Only after the separate external acknowledgement migration and workflow pass their
   own verification may the reconciler deliver the existing warning backlog using the
   bounded procedure above. Do not acknowledge it from this migration.

Do not combine this rollout with endpoint-grant cutover, credential rotation, snapshot
activation, schema cleanup, or browser behavior changes. Separating them keeps the
rollback decision attributable.

## Go/no-go gate

Go only if all of the following are true:

- the hardened v2 writer and immutable receipts/revisions are already present;
- migration preflight and transactional verification pass without edits;
- two distinct stale requests remain conflicts and share one alert only when all
  fingerprint fields are identical;
- state/value/version/checksum and revision count remain unchanged;
- every request has its own receipt;
- a different metric set produces a different alert;
- the containment migration never sets `delivered_at` or `resolved_at`;
- after an external delivery, a later recurrence creates exactly one fresh pending
  outbox row on the same canonical alert;
- the existing watchdog public wrapper and token continue to work;
- an approved rollback operator and change record are available.

No-go if any state row changes, a conflict is reported accepted/noop, a receipt is
missing, a critical/non-target alert is coalesced, two pending rows appear for one
canonical alert/destination, an outbox row is lost, the watchdog wrapper changes, or
the private helper becomes client-executable.

## Forward rollback

If the containment helper causes an unexpected operational problem, do not drop
columns, indexes, alerts, receipts, or outbox rows. In the same controlled SQL session:

```sql
set flashcard_integrity.conflict_alert_containment_rollback_approved =
  'confirmed-disable-dedup-20260815';
```

Then apply
`supabase-flashcard-integrity-conflict-alert-containment-rollback-20260815.sql`.
It restores one-call/one-alert recording for all future alerts while retaining every
aggregation field already recorded. It does not change CAS, student data, the separate
external acknowledgement path, endpoint grants, watchdog credentials, or the public
watchdog wrapper.

After rollback, re-run the watchdog and controlled stale-write test. Expect two
distinct request IDs to create two alerts and two outbox rows, while both writes remain
conflicts and student state remains unchanged.

## User-experience impact

There is no intended visible change. A student whose browser writes against a stale
version still receives the same reload requirement and must retry against current
state. Successful, noop, validation, explicit-delete, and attempt-array strongest-merge
semantics do not change. The benefit is operational: repeated identical retries no
longer flood monitoring, so a real independent warning is easier to see. The tradeoff
is that operators inspect `occurrence_count` and receipt rows rather than one alert row
per retry; the first and last request IDs plus all receipts preserve that traceability.
