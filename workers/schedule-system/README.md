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
