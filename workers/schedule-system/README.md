# Edmund Schedule System Worker

This small Cloudflare Worker is the rate-limited administrator-login boundary
for the Schedule System. The public browser never receives the service secret,
and the administrator password is exchanged for an expiring, hashed Supabase
session token.

The Schedule login requires one encrypted Worker secret:

- `SCHEDULE_SERVICE_SECRET`

Gmail delivery additionally requires three encrypted Worker secrets:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GMAIL_TOKEN_ENCRYPTION_KEY` — exactly 32 random bytes, base64 encoded

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

## Gmail email-delivery rollout

The email designer supports a saved/changeable personal Gmail sender, Google
OAuth, one-time and recurring delivery, dynamic messages, inline linked
signature images, and up to three PDF attachments. Refresh tokens are encrypted
with AES-GCM in the Worker before storage; the key and Google client secret must
never be placed in this repository or sent to the browser. The queue accepts no
more than 400 messages for one sender in a rolling 24-hour period.

Deploy this feature in this order:

1. Confirm `supabase-schedule-email-designer-and-linked-homework-20260821.sql`
   is already applied, then apply
   `supabase-schedule-gmail-delivery-20260822.sql` in Supabase.
2. In Google Cloud, create or select a project, enable the Gmail API, configure
   an OAuth consent screen, and add a **Web application** OAuth client. Add the
   exact redirect URI from `wrangler.jsonc`. For a personal-only app, add the
   sending Gmail as a test user while configuring it, then publish the consent
   app to **In production** so its refresh token does not expire after seven
   days. The app requests only `openid`, `email`, and `gmail.send`.
3. Store the Google client ID and client secret with `wrangler secret put`.
   Generate the encryption key locally with
   `openssl rand -base64 32`, then store only its output with
   `wrangler secret put GMAIL_TOKEN_ENCRYPTION_KEY`. Do not reuse the Schedule
   service secret as the encryption key.
4. Run `npm run check`, `node tools/test-schedule-email-linked-homework.mjs`,
   and the complete Schedule regression suite. Deploy the Worker before the
   static page so all new API routes exist when the UI becomes visible.
5. Log in as the Schedule administrator, open Email 內容設計, confirm
   `edmundeducationedu@gmail.com`, click 連接 Gmail, and authorize that exact
   Google account. Send one message to an address you control before selecting
   real recipients. Verify the message, linked signature, PDF, and Email Log.

Normal Gmail is still subject to Google's anti-abuse and recipient limits. The
application's 400-per-24-hours cap is intentionally below the commonly applied
personal Gmail limit; it is not a guarantee that Google will accept every
message. Only email users who agreed to receive these messages, keep recipient
addresses current, and stop sending to addresses that bounce or complain.
