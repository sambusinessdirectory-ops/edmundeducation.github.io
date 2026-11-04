# Professional English save conflict incident — 16 September 2026

The Professional English save RPC raised SQLSTATE `40001` for a stale client
revision. This is an application conflict, but PostgREST 14.5 interpreted it as a
retryable database serialization failure. Requests repeatedly rolled back and
retried, saturating the shared API and preventing login in other portals.

Observed during recovery:

- The public API returned HTTP 503 / `PGRST002`.
- Several PostgREST backends repeatedly executed `special_flash_save` and waited
  on the same progress advisory lock.
- The database rollback counter exceeded 488 million while only 776 save calls
  had completed successfully in the available statement statistics.

## Recovery

Migration `20260916102429_professional_save_conflict_no_transaction_retry.sql`
changes only the stale-revision exception to `PT409`, which returns HTTP 409
without transaction retries. Session checks, enrollment checks, optimistic
concurrency, idempotency, table permissions and student progress are preserved.
The identified looping API backends were cleared and the schema cache refreshed.
No student accounts, marks, attempts or drafts were deleted.

The browser now recognizes both `PT409` and legacy `40001` as conflicts, stops
further writes until recovery, and retains the pending request and completed
answers in its device backup. Recovery controls compare the stable internal status
value rather than its translated label, so they are also visible in bilingual mode.

## Verification

Eight temporary, isolated student accounts and one synthetic 20-card deck were
created solely for recovery verification. All eight concurrently completed the
first ten cards, retried the same committed mutation safely, received a bounded
HTTP 409 for a conflicting mutation, signed in again, recovered their ten saved
marks and began the next ten-card range. The conflict responses took roughly
one to one-and-a-half seconds including network transit. All temporary records
were removed afterwards; the original 14 progress rows remained.

The shared student-login endpoint returned HTTP 200 for a nonexistent synthetic
username, confirming normal endpoint execution without student credentials.
The rollback counter stopped increasing rapidly and no active looping API
queries remained. Regression tests cover the database error code and browser
conflict handling with device-backup retention. Chromium and WebKit browser checks
confirmed the recovery controls are visible, a completed answer and position remain
in local storage, and clicking Retry after a conflict sends no further mutation.

Provider reference:
https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b
