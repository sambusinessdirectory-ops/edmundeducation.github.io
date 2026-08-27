# Writing submission notifications

Activated on 2026-08-27 with two approved recipients and the existing Edmund
Gmail connection. Migration version: `20260827113137`. Production checks verified
the enabled trigger, private configuration, and zero historical notification jobs.

New rows in `writing_submissions` queue one `writing_submission` email per
distinct configured administrator address. Draft saves, existing-submission
retries, edits, and feedback publication do not notify. There is no backfill.

Routing lives in the private, RLS-enabled `writing_submission_email_settings`
table. Actual recipient addresses are deliberately absent from this repository.
The configuration pins both the existing Schedule administrator ID and the
requested Gmail address. Disconnection or switching to a different Gmail pauses
pending messages rather than silently sending them from another account.

Emails include the student's name, truncated topic/title, Hong Kong submission
time, word count and submission ID. They link to the Writing Submission portal,
where the recipient must sign in as an administrator. Full essays, passwords,
session tokens, and private feedback are never embedded in notifications.

The existing five-minute Schedule Worker processes notifications using the
shared 400-per-rolling-24-hour cap. Two configured recipients consume two sends.
Queue pressure, retries, Gmail restrictions or a disconnected sender can delay
mail. Gmail acceptance is not proof of inbox delivery.

Look in Homework → Email Log → All for `寫作提交通知（管理員）`. The request ID is
the writing submission ID. Each recipient has a separate website email ID and,
after acceptance, Gmail ID. The `writing_submitted` checkpoint links the source.

Run `node tools/test-writing-submission-email.mjs` for source/MIME contracts.
For isolated transaction, deduplication, sender-pinning and access checks, run
the same command with `EMAIL_QA_MODULES` pointing to a PGlite installation.
These checks never connect to production or send real email.

Activation: apply the migration, then insert the approved configuration through
a privileged database connection. Keep recipient values out of public commits.
To pause new notifications, set the private configuration's `enabled` to false;
already queued emails remain queued. Do not delete delivery history.
