# Edmund Membership — phase-one architecture and operating guide

Status: **working public preview + protected plan administration; NO payment processing**.
Stripe is not connected. This release does not collect customer details, charge money,
create learners, grant access, revoke existing access, or send activation emails.

## What is implemented

- Homepage card 59: `Edmund 學習系統 / 會員計劃` → `/membership.html`.
- Public portal with no student login, responsive plan cards, policy links and a clear closed-payment notice.
- Upper-right Admin login → `/membership-admin.html`. A separate administrator account uses a
  server-side bcrypt hash, browser-identity-bound hashed session token, one-hour expiry,
  logout revocation, credential-change revocation and a five-failure / 15-minute login throttle.
- Up to 12 draft monthly plans: price/currency, description, benefits, included-system mappings,
  separate test/live Stripe Price IDs, visibility, company/support and policy drafts.
- Save draft and Publish preview are separate actions. Publishing NEVER enables checkout.
- Private financial/identity tables and their uniqueness constraints, not connected to existing students yet.
- Cloudflare Worker route skeleton that rejects all financial/activation requests with HTTP 503.
- Unit-tested future integration contracts for monthly checkout parameters, signed raw webhook
  verification and paid-period decisions. These helpers are NOT connected to public routes.
- An honest status page; query parameters or visiting a success URL cannot claim payment success.

The supplied administrator credential was provisioned privately, not included in code or migrations.
Use the given username/password in Admin login. The backslash before `@` in the original Markdown
was treated as an escape, not a password character. Do not reuse this password elsewhere.

## Current data flow

```text
Walk-in visitor → membership.html → public.membership_catalog (read-only published snapshot)

Admin → isolated anonymous Supabase Auth browser session
      → membership_admin_login (password verified server-side)
      → one-hour token bound to that browser's auth.uid()
      → guarded save/load RPCs → membership_private configuration / plans / audit
      → explicit Publish preview → safe public snapshot; sales_enabled always false

Any checkout / portal / webhook / activation request → Cloudflare Worker → 503 (closed)
```

The anonymous browser session is only a transport identity, **not admin authorization**.
Every privileged operation additionally checks the administrator token. It is isolated in
sessionStorage under membership-specific keys and does not replace student login storage.
No financial mutation is granted to the browser. Do not expose `membership_private` in the Data API.
The public RPC wrappers use SECURITY INVOKER; their unexposed guarded implementations use
SECURITY DEFINER with an empty search path and explicit grants. Only the published snapshot
has a public SELECT policy. The private tables intentionally have no browser RLS policies.

## Admin procedure now

1. Open the membership portal and choose Admin login.
2. Enter the supplied administrator credentials; enter plan details and included systems.
3. Leave Stripe Price IDs blank until the Stripe account and monthly Prices exist. Never enter API keys.
4. Save draft. This does not change the public catalogue.
5. To preview publicly, mark a complete plan visible and press 儲存並公布預覽.
   A visible published plan requires a price, benefits and at least one included system.
6. To remove a preview, uncheck visibility and publish again. History is retained.
7. Log out. Another tab's stale draft cannot overwrite newer changes; reload after a revision conflict.

No prices, trial policy, refund commitment, grace period or licence/device limits have been
invented. Currency options currently support HKD and USD, with two decimal places. Recorded
prices are catalogue drafts, not verified Stripe Prices. Only 14 mapped systems are selectable
in this first editor; expanding the mappings requires adding their real entitlement adapters.

## Planned commercial architecture (not enabled by this release)

```text
Public purchase form: plan key + separate payer/learner details + consent
  → Worker validates, rate-limits and creates pending signup + hashed status credential
  → server resolves and verifies Stripe monthly Price (never browser amount)
  → Stripe-hosted Checkout: cards / eligible Apple Pay
  → signed webhook → durable unique event → retryable job
  → verified invoice.paid → subscription/paid-through mirror → entitlement
  → idempotent learner provisioning → short-lived single-use setup link
  → all learning APIs validate the same identity + paid entitlement

Authenticated payer → Worker → short-lived Stripe Customer Portal → invoices/cancellation
Nightly reconciliation → compare Stripe ledger with local mirror → admin alerts/retries
```

Stripe owns the money/invoice ledger; Supabase owns identity, access and learning progress.
Cloudflare handles secrets and trusted integration. Do not introduce a second payment ledger.
Keep existing students' access unchanged until a separately tested migration is approved.

### Route contract

| Route | Foundation response | Future responsibility |
| --- | --- | --- |
| `GET /health` | 200, all payment flags false | Operational readiness, no secrets |
| `POST /api/subscriptions/checkout` | 503 | Validated signup and server-controlled monthly Price |
| `GET /api/subscriptions/status` | 503 | Status protected by unguessable expiring credential, no email enumeration |
| `POST /api/stripe/webhook` | 503 | Raw-body signature, durable event deduplication and asynchronous processing |
| `POST /api/billing/portal` | 503 | Authenticated payer/customer ownership, short-lived portal URL |
| `POST /api/accounts/activate` | 503 | Single-use expiring token, verified learner, password setup |

Do not configure Stripe to deliver real webhooks to this skeleton. It deliberately refuses to
acknowledge unprocessed events. Adding a secret or setting `SALES_ENABLED=true` cannot turn it on.

### Private records

`learner_identities` maps a verified email/Auth identity to the existing student ID.
`signup_intents` separates payer and learner, records consent and an expiring hashed status token.
`billing_customers`, `subscriptions`, `billing_invoices` mirror Stripe identifiers and paid periods.
`entitlements` holds per-system access independently from educational progress.
`webhook_events` has a unique Stripe event ID; `provisioning_jobs` has one job per signup with retries.
`activation_tokens` stores only token hashes, expiry and use time. Admin accounts, sessions,
configuration, plans, throttle and audit records are likewise private.

Before activation: add validated email/account mapping FKs after verifying compatibility with the
legacy student model; service-only transaction functions; payer billing ownership authorization;
reconciliation/queue leasing; retention policies; new-device/session security tables and handlers.
The one-open-subscription constraint currently means one plan per learner per Stripe mode.
Confirm whether that matches the eventual licence policy before creating real subscriptions.

### Payment/access lifecycle

- `checkout.session.completed`: link IDs, not proof that access should start.
- Verified `invoice.paid`: extend the paid-through date once, then enqueue recoverable provisioning.
- Failed/action-required invoice: follow an explicitly chosen grace/recovery policy, not an invented default.
- Canceled at period end: retain only the already paid interval; preserve all progress.
- Incomplete, unpaid, paused, expired: deny new paid entitlement by default.
- Trials, refunds, disputes and exceptions: require defined business policies and audited transitions.
- Duplicate/out-of-order events: deduplicate event IDs and fetch current Stripe state as needed.
- Never email permanent passwords. Use at least 32 random bytes, stored hashed, one-hour expiry,
  single use, invalidate earlier links, and recover failed provisioning without another charge.

## Launch gates

1. Verify the company Stripe account and payout bank; approve price/currency, included systems,
   payer/learner licence, trial/refund/cancellation/grace and privacy/recurring-consent policies.
2. Audit the existing shared login/RPC model and rotate any legacy exposed credentials. This
   foundation does not claim to harden all existing systems or enforce anti-sharing rules.
3. Implement verified learner email/Auth mapping, secure legacy session bridge, central API-side
   entitlement checks and session revocation on access expiry. Do not rely on hiding UI cards.
4. Implement the real routes, Stripe SDK integration with a pinned API version, secure Worker
   secrets, service-only database gateway, idempotency, durable jobs, retries and reconciliation.
5. Configure Stripe invoices/recovery emails plus a real activation/welcome mail provider.
6. Implement payer billing management and device/session controls after agreeing the licence policy.
7. Sandbox tests: success/3DS/decline, renewal failure/retry, cancel/refund/dispute,
   duplicate and out-of-order events, browser closed during payment, tampered prices,
   account reuse, failed provisioning/retry, expired/reused links, entitlement expiry during
   a session, test/live separation, invoice download and legitimate device changes.
8. Pilot, monitor reconciliation and provisioning, then deploy a deliberately enabled live release.

Do not treat this checklist or the rough proposal's estimates as legal/accounting advice or
current Stripe pricing. Confirm invoices, tax, retention, fees and limits during account onboarding.

## Validation and deployment

```sh
node --test tools/test-membership-foundation.mjs
npm test --prefix workers/membership
node tools/test-learning-portal-scaffolds.mjs
cd workers/membership
npm ci
npm run check
npm run deploy
```

Apply the versioned Supabase migration through the trusted management/CLI migration workflow.
Never put real initial passwords in a seed or migration. `tools/membership-security-regression.sql`
uses a synthetic admin and browser identity, tests grants/login/expiry/revocation, private drafts,
publication and concurrency, then rolls back every fixture change.

GitHub Pages deploys the frontend on a push to main. The Pages bundle excludes `workers/`,
`supabase/`, `tools/` and SQL. The public frontend uses only the existing publishable key.
The Worker has no payment/database secrets in this phase and has no route on existing systems.

Foundation endpoint: `https://edmund-membership.edmundeducation.workers.dev/health`.
Optional normal-API login smoke test: `node tools/verify-membership-login.mjs` (hidden password
prompt, no saved credentials, logs out afterwards; never modifies plan configuration).

Supabase advisory review: membership tables only report the expected informational
[RLS enabled with no policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
because browser access is intentionally denied. The project's pre-existing broader warnings
still require an independent commercial-launch audit; they were not changed here.

## Official integration references

- [Stripe subscription Checkout](https://docs.stripe.com/payments/checkout/build-subscriptions)
- [Stripe webhook security and delivery](https://docs.stripe.com/webhooks)
- [Stripe subscription events](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Stripe customer management portal](https://docs.stripe.com/customer-management)
- [Stripe Apple Pay](https://docs.stripe.com/apple-pay)
- [Supabase database functions](https://supabase.com/docs/guides/database/functions)
