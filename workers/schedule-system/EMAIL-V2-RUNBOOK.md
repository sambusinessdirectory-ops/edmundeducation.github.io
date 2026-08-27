# Email v2: activation and debugging

## Pre-submit diagnostics update (emailVersion 4)

On 28 August at 00:20–00:24 Hong Kong time, the reported successful request
entries were all `GET /v1/admin/email/logs`. The database still contained four
historical delivery jobs and zero v3 submission receipts. Thus these entries
were not evidence of new sends. The exact browser stopping point was not
recorded by v3 and must not be inferred from those GET requests.

- The preview checks spelling automatically while the admin reviews it. One
  final button explicitly says `確認發送 N 封`. Cancelling explicitly says no
  email was submitted. Unavailable spelling checks still allow an explicit override.
- Before upload, failures now say **not submitted**, with a step and request ID.
  After upload starts, uncertain results remain locked behind receipt recovery.
- `/v1/admin/email/client-events` records only allowlisted browser observations,
  stage, slot, version and state. It requires admin authentication and cannot
  create jobs or claim Gmail acceptance. No content, addresses, credentials or
  attachment bytes are recorded. The browser keeps 60 metadata checkpoints per
  admin session as a fallback when the network is unavailable.
- Successful log reads no longer pollute request diagnostics. Historical reads
  are grouped under **not sends**. Browser observations never substitute for
  an authoritative `submit_committed`/job record.
- Regression tests use the actual preview together with the designer (the old
  designer test bypassed preview). Real-browser local checks cover stored image
  plus PDF, real Harper, and one-click final confirmation. Transport is isolated;
  these checks do not prove real mailbox delivery. A fresh admin-selected test
  must produce a website email ID and then be confirmed in the recipient mailbox.

No new migration, OAuth change, historical resend, or recipient change is needed.
Deploy the Worker first, then Pages. Additional test: `node tools/test-email-attempts.mjs`.

## Attachment reliability update (emailVersion 3)

Migration `20260827123503_email_atomic_submission.sql` adds an additive, private
receipt table and new RPCs. Deploy this migration, then the Worker, then the web
pages. Existing jobs and their snapshots are not modified or resent.

Applied on 2026-08-27. Before/after activation: 4 jobs, 4 logs, 1 PDF and 741,626
signature-image bytes, unchanged; zero new submission receipts. The Worker release
is `e2d20742-6ac3-42b5-a184-311432fd6790` (emailVersion 3).
Security advisors flag the three service RPCs' intentional `anon` execution grants:
each requires BOTH the server-only service secret and a valid custom admin session.
The receipt table's RLS-with-no-policy notice is intentional: direct access is
revoked from all API roles. Do not add public table policies to silence it.

- The designer sends a single multipart `POST /v1/admin/email/templates/:slot/submit`.
  Saving the template/files, creating immutable queue snapshots and jobs, and
  storing the receipt all commit in one transaction. Failure rolls them all back.
- The request ID and canonical payload hash protect both duplicate uploads and
  duplicate queue entries. The draft revision prevents stale-tab overwrites.
- An interrupted response is recovered using the original request ID. A replay
  uses the same form and ID, never a newly generated send request.
- `GET /v1/admin/email/requests/:id` reads the receipt. The explicit `POST .../resolve`
  returns an existing receipt or creates a cancellation fence while holding the
  same transaction lock. A late upload can never commit after that fence.
- Browser session storage retains only pending request metadata, scoped to a
  hash of the administrator session. The recovery panel blocks a fresh send until
  the old result is known. Do not automatically send historical unfinished drafts.
- Upload/navigation warnings reduce accidental interruption. `waitUntil` retains
  in-flight server work for Cloudflare's grace period, but the DB receipt/fence is
  the correctness guarantee, not a claim that every disconnected upload succeeds.
- HTTP audit checkpoints are buffered and flushed in one bounded background call;
  they cannot hold up a successful receipt. `submit_committed` and job creation
  events are persisted in the same DB transaction. UI timelines sort by timestamps.
- Database calls have a timeout; uncertain outcomes must be recovered, not treated
  as proof that nothing was saved. Gmail acceptance still does not prove inbox delivery.

Regression checks (synthetic files and mail transport only):
`npm ci --prefix tools/email-qa --ignore-scripts`, then set `EMAIL_QA_MODULES` to its
absolute `node_modules` path and run `tools/test-email-atomic-submission.mjs` and
`tools/test-email-submit-ui.mjs`. Both also run before GitHub Pages publication.

## Activation status

Production database activation was approved and applied on **2026-08-27** (migration
`20260827110241`). The deployed Worker health endpoint reports `emailVersion: 2`.
The dependent frontend can now be published. Do not reapply the migration.
The first production scheduler cycle completed at 11:06 UTC with no error, and
all five page monitors established their initial baselines. Existing email jobs
and logs remained at three each; no subscriber records were created by deployment.
No real recipients were emailed during the automated tests.

## Deployment order

1. Obtain explicit approval to update the live email queue/database and enable public subscription notifications. Preserve existing student data and all email history. Review the current database backup before applying.
2. Apply only `supabase/migrations/20260827110241_email_audit_preview_subscriptions.sql` to project `ookkxzgpdclzrrhfmvqx` (already applied; these are reference steps for a fresh environment). Do not blindly push unrelated pending migrations. It creates private subscriber/audit/snapshot tables, replaces queue functions, adds state-history triggers, and changes template deletion to retain delivery records.
3. Run security/performance advisors, inspect new function privileges and RLS, and verify the admin log endpoint's data isolation after deploying the Worker. Existing OAuth secrets stay unchanged.
4. Deploy `workers/schedule-system`. Its configuration adds `EMAIL_SIGNUP_RATE_LIMITER`. Check `/v1/health` reports `emailVersion: 2`.
5. Publish only this feature's frontend changes. In Homework → Email 內容設計, select the visitor notification sender if not automatically pinned from the one existing connected administrator. A future Gmail address change on that same admin is supported; queued messages from a different sender stay paused for review.
6. Confirm the five monitors and scheduler timestamps appear in Email Log. Initial page baselines never trigger a broadcast. Test delivery only to an address the admin explicitly selects; observe its website ID, MIME Message-ID and Gmail ID. Test a small image + PDF, then a deliberately misspelled message and cancellation.
7. For public signup testing, use a mailbox owned by the tester. Confirm it, publish a meaningful page update, verify the notification, unsubscribe, then verify no further updates are queued. Do not use real student addresses for synthetic tests.

The migration is transactional. If application fails, it rolls back. After a successful application, do not “roll back” by dropping the new tables: that would erase new records. Prefer a forward fix. Reverting only the frontend/Worker is not a complete database rollback, so review the queue first.

## IDs and states

- Website email ID: the job UUID, created before contacting Gmail; it is stable across retries.
- `Message-ID`: `<job-uuid@edmundeducation.com>` in new outgoing MIME. In the sending Gmail search for `rfc822msgid:job-uuid@edmundeducation.com`. Historical pre-v2 email records do not claim this header existed.
- Gmail ID: stored only after Gmail returns a successful response with its ID.
- Request ID: links upload, validation, save, preview confirmation, spellcheck result, and queue entries. Multiple recipients have separate email IDs under one request.
- `accepted`: Gmail accepted the API request, **not** inbox delivery. This send-only integration cannot prove inbox placement, opens, or bounces. Do not label it “delivered”.
- `uncertain`: Gmail may have accepted, but the response or record was lost. Never auto-resend; inspect Gmail Sent and the `gmail_accepted` checkpoint first.
- Explicit `429` and pre-send transient authorization-service failures may retry up to three attempts with ten-minute backoff. HTTP 5xx after submission and network/response failures are uncertain.

## Debug map

| Checkpoint / symptom | Check next |
| --- | --- |
| Browser error with no server request entry | Network/offline, JavaScript console, current admin session; retain the shown request ID. No email ID exists before queueing. |
| `authentication` / HTTP 401 | Log into Homework again. Never put an admin token or Google secret in a screenshot. |
| `upload_parsed` / HTTP 413 | Multipart upload limit; image max 2 MiB, at most three PDFs each 5 MiB, combined PDFs 10 MiB. |
| `validation` | File magic/type, PDF count and retained-file totals, recipient IDs, HTTPS signature link, content length. |
| `template_saved` | An atomic revision identifies the saved message. `DRAFT_CHANGED` means preview again. |
| `preview_approved` / `spellcheck` | `passed`, an explicit warning override, unavailable-check override, or draft-only `not_checked`. Text is checked locally with vendored Harper; Chinese is not checked. |
| `queued` | Email IDs exist. Check waiting reason, next attempt, connected sender, quota, scheduler timestamps. |
| `claimed` | Worker reserved the job. A stale pre-send claim can retry; a stale post-submission claim becomes uncertain. |
| `token_refresh` | `invalid_grant`: reconnect the saved Gmail. HTTP 429/5xx can retry. Never log the refresh/access token. |
| `mime_built` | Byte count, attachment count, signature presence. Assets are snapshotted so later draft edits do not alter queued mail. |
| `gmail_request` | Gmail HTTP response; 403 usually needs permission/scope inspection, 429 needs backoff. |
| `gmail_accepted` | Record Gmail ID. If final persistence fails, only recording is retried; Gmail is not called again. |
| `accepted`, but mailbox empty | Search recipient spam/all-mail and sender Sent. Gmail acceptance is not proof of final delivery. |
| Scheduler timestamp stale / `last_error` | Cloudflare cron logs and database connectivity. If the database itself is unavailable, diagnostics fall back to redacted Worker logs. |
| Page monitor `last_error` | Public page HTTP status / missing main content; failed reads never become new content or trigger a notice. |

## Visitor behavior and boundaries

`email-subscribe.html` provides page selection → confirmation email → explicit confirmation. Confirmation tokens are stored hashed and expire after 24 hours. Link actions require a button press (GET/link scanners do not confirm or unsubscribe). Unsubscribe links are HMAC-signed and stop queued notifications; messages already handed to Gmail cannot be recalled.

Subscriber records and visitor emails are separate from student identities. The admin log has audience filters and a visitor directory. The first public sender is pinned to its administrator identity so another admin reconnecting Gmail cannot silently take over subscriptions.

The form has an IP rate limit, honeypot, one confirmation per address per hour, and a 50-confirmation rolling-day ceiling; this ceiling is a safety default, not an additional Gmail quota. All student, confirmation, and visitor-update emails share the 400-per-rolling-24-hours application limit. Gmail can impose stricter limits.

About every five minutes the Worker compares the five published pages' main markup, plus database-published newsletter/music records. Browser-local News Analysis / English Study drafts are not public and are intentionally excluded. Updating a linked asset in place without changing its URL or the page markup is not detected. Several changes between polls produce one current-version notification, not one email per keystroke. Styles/scripts outside `<main>` are excluded. No initial-baseline notification is sent.

Subscriber data remains private behind secret-guarded Worker functions and custom admin-token checks; new tables have RLS and no direct client privileges. Request-only diagnostics retain 30 days; email history and subscriber records persist for admin support. The signup page explains data usage and how to request deletion. It does not claim the existing blank site-wide legal pages constitute a compliance review.

## Repeatable local checks

```sh
node tools/test-email-v2.mjs
node tools/test-schedule-email-linked-homework.mjs
node tools/test-schedule-reminder-email-and-hotkeys.mjs
node tools/test-pwa-and-brand-metadata.mjs
```

Isolated database/DOM checks use PGlite and jsdom (not production): install them in a temporary directory, then set `EMAIL_QA_MODULES` to that directory and run `tools/test-email-v2-database.mjs` and `tools/test-email-v2-ui.mjs`. The fixture deliberately does not emulate every production extension; `extensions.digest` is a local SHA-256 shim. Production verification remains necessary after approved activation.
