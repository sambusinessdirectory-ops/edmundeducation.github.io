# Flashcard interrupted-sync repair

## Scope and evidence

Student screenshots show a few pending mutations, recovery warnings during study,
and a finished deck appearing as unfinished. Screenshots do not reveal the exact
IndexedDB payload or identify a server-side failure. The following failure paths
were confirmed in the client and reproduced with synthetic data; this is not a
claim that a specific student's missing records have already been restored.

## Repairs

- Claim a durable outbox row inside an IndexedDB transaction before sending it.
  A stale sender list can no longer recreate rows already replaced by coalescing.
  Coalescing also checks current inflight status inside its transaction.
- Verify persistence within the write transaction. A legitimate acknowledgement
  or successor cannot be mistaken for a storage failure between transactions.
- Merge grades per card instead of treating an entire deck as one conflicting
  field. New grades carry per-card timestamps; independent cards are retained.
  In older records without timestamps, an ambiguous grade tie prefers review.
- Reconsider old account-wide familiarity blocks only when they match the exact
  historical whole-deck-overlap error. Revalidate and merge against canonical
  data under a fresh request ID; never bypass authentication or checksum failures.
- Union same-attempt card outcomes, deduplicate by card identity, retain completion
  and use the latest per-card answer time. Attempts from different IDs stay distinct.
- Treat a newer authenticated canonical read as concurrent activity, not corruption.
  Same-version checksum mismatch and invalid ownership remain protected.
  Older reads/receipts cannot roll back a newer acknowledged baseline.
- Background recovery refreshes canonical metadata without resetting hydration or
  replacing the active study screen. Ordinary version/request-ID conflicts are
  scoped to the affected key; verified students can keep saving learning work locally.
- Retry each new terminal mutation set automatically, rather than consuming one
  recovery opportunity for the entire login. Transient recovery reads retry later.
- Never remove unresolved rows merely to dismiss recovery warnings. They remain
  queued. Legacy release code also refuses deletion if archival storage failed.
- Keep local learning snapshots visible on reload. A completed attempt suppresses
  stale resume pointers such as 28/30, without deleting data during that read.
- Reject late responses belonging to a previous login context. Auth/ownership,
  missing initial hydration, and unavailable durable storage still fail closed.

## Verification

`tools/test-flashcard-sync-resilience.mjs` covers per-card merge, latest timestamps,
same-attempt unions, completed-vs-stale attempts, advanced server receipts,
checksum rejection, account switching, transactional queue claims, completed
resume suppression, background hydration stability, and retaining unresolved rows.

`tools/flashcard-sync-browser-check.mjs` is a loopback-only, synthetic fixture using
the actual client functions and native browser IndexedDB. No production accounts,
credentials, records or endpoints are used. It tests 30 rapid answers, a response
lost after a successful save, delayed writes, a temporary outage, reload with
pending writes, and reconnection. Required outcomes: 30 retained answers, completed
attempt, no false recovery events, no redo prompt, then 30 server answers and an
empty queue after reconnecting.

Existing Flashcard integrity, recovery, deck-mode, login, account-isolation,
preferences, progress sorting, study-interaction and critical-update tests are
run alongside the new regression. The new regression is also a Pages deployment
gate and runs in the independent Flashcard integrity workflow.

## Student guidance and limits

After publication, reload once in the same browser when paused, without clearing
site data. Pending writes should resume automatically. Do not ask students to redo
a completed deck simply because a progress pointer was stale. If an unresolved
warning remains, retain that browser and use its recovery export for targeted
investigation. This release does not claim to recover records absent from both
local storage and all retained backups.

No Supabase schema, student records, backup schedule, R2 retention, account
permissions or authentication credentials were changed for this repair.
