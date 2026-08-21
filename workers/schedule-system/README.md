# Edmund Schedule System Worker

This small Cloudflare Worker is the rate-limited administrator-login boundary
for the Schedule System. The public browser never receives the service secret,
and the administrator password is exchanged for an expiring, hashed Supabase
session token.

Deployment requires one encrypted Worker secret:

- `SCHEDULE_SERVICE_SECRET`

The matching SHA-256 digest is provisioned in `public.schedule_worker_secrets`
under the name `schedule-worker` during the private deployment step.

## Secure deployment runbook

1. Run `supabase-schedule-system.sql` in the Edmund Education Supabase project.
2. Generate a bcrypt hash for the exact administrator name
   `Sam Admind Schedule` and a separate random Worker secret of at least 32
   characters. Never place either plaintext value in this repository.
3. In a private Supabase query, upsert the bcrypt into
   `public.schedule_admin_accounts` and the Worker's SHA-256 digest into
   `public.schedule_worker_secrets` as `schedule-worker`.
4. From this directory, run
   `wrangler secret put SCHEDULE_SERVICE_SECRET`, then `wrangler deploy`.
5. Verify `/v1/health`, a successful administrator login, and the authenticated
   schedule RPCs before publishing the browser page.

For credential rotation, replace the database digest and encrypted Worker
secret together. Replacing the administrator bcrypt should also be followed by
deleting that administrator's rows from `public.schedule_admin_sessions` so
all earlier sessions are revoked immediately.

## Wellbeing ratings and Learning Purpose rollout

The additional daily self-evaluations and the versioned `我的學習初心` panel do
not add a new public Worker route. They follow the Schedule System's existing
authenticated Supabase RPC boundary: the browser must hold a Supabase Auth JWT
and must also present the existing short-lived student or administrator
Schedule token. The two backing tables keep RLS enabled and grant no direct
table privileges to `anon` or `authenticated`; only the narrowly-scoped RPCs
are executable.

Deploy this feature in this order:

1. Confirm `supabase-schedule-daily-motivation.sql`,
   `supabase-schedule-quote-encouragement.sql`, and
   `supabase-schedule-student-entry-tags.sql` have already been applied.
2. Apply `supabase-schedule-wellbeing-and-learning-purpose.sql` in Supabase.
3. Run `node tools/test-schedule-wellbeing.mjs`,
   `node tools/test-schedule-self-evaluation-admin.mjs`, and the existing
   Schedule regression tests.
4. Publish the static site only after the migration succeeds. Publishing the
   browser files first would leave the optional panels in fallback mode and
   would prevent new ratings and Learning Purpose versions from saving.
5. Verify one student save for each of the six ratings, the administrator CSV
   report, focus-mode restoration, Learning Purpose history navigation, and an
   owner-scoped version deletion. No Worker secret rotation or Worker redeploy
   is required for this migration.

## Email designer and linked-homework rollout

The email designer currently stores four private administrator templates,
cadence choices and recipient selections only. It deliberately does not hold
Google credentials and does not send mail until a later Gmail Worker is
connected. Linked homework mirrors teacher-authored Schedule entries between
explicitly linked accounts while leaving each student's progress fields
independent.

Deploy this feature in this order:

1. Confirm `supabase-schedule-reminder-email.sql` and the Schedule base schema
   are already applied.
2. Apply `supabase-schedule-email-designer-and-linked-homework-20260821.sql`.
3. Run `node tools/test-schedule-email-linked-homework.mjs` and the complete
   Schedule regression suite.
4. Publish the static site. No Worker secret or Worker deployment changes are
   required for this storage-only stage.
5. Smoke-test one disabled template save, recipient all/none controls, linking
   and unlinking two test accounts, and confirm that completion/progress on the
   paired copies remains independent.
