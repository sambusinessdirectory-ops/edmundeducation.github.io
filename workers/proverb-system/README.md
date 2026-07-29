# Edmund Proverb System Worker

This Worker is the private browser-facing boundary for the Proverb System. It
stores attempts and bookmarks for the single `proverb-01` lesson and provides a
dedicated Proverb System administrator login.

Student authentication is shared with the existing Flashcard, Writing
Practice, Speaking, Homework, and Sentence Structure portals. A student uses
the UUID bearer token returned by `flashcard_student_login`; this service
validates that token against `flashcard_student_sessions`. It does not create a
second student account or password table. Proverb attempts, bookmarks, admin
accounts, and admin sessions remain separately namespaced as
`proverb_system_*`.

All Proverb System tables have RLS enabled with no permissive browser policies.
Table access is revoked from browser roles and `service_role`; the Worker may
invoke only the narrowly scoped security-definer RPCs granted by the migration.

## Secure setup

### 1. Apply the database migration

First apply `../../supabase-shared-student-accounts.sql` if the shared account
bridge is not already installed. Then apply
`../../supabase-proverb-system.sql` in a private Supabase SQL session.

The migration creates:

- hash-only administrator accounts and SHA-256-digested, eight-hour sessions;
- account-isolated attempts for `proverb-01` and `proverb-01-q01` through
  `proverb-01-q50`;
- normalized bookmarks for the lesson card plus its 50 questions; and
- service-role-only student, attempt, bookmark, and administrator RPCs.

### 2. Install the canonical answer catalogue

`src/catalog.js` is a static, protected copy of the visually verified answers
from `../../proverb-system-data.js`. When the canonical browser content
changes, update the protected server-side object at the same time:

- use exactly `proverb-01-q01` through `proverb-01-q50`;
- put the canonical English answer first in each answer array;
- append only deliberately approved `acceptedAnswers` variants; and
- never invent or retain placeholder strings.

Do not import the public browser data file at Worker runtime. The catalogue is
an independent server-side trust boundary. Tests compare both catalogues and
pin their canonical-answer SHA-256 digest. `GET /v1/health` returns `503` with
`catalog.ready: false` if any of the 50 protected entries becomes invalid. With
the catalogue incomplete or invalid, every claimed-correct answer returns
`ANSWER_CATALOG_NOT_READY` before an attempt can be credited. Wrong-answer
progress and bookmarks remain usable while the catalogue is being prepared.
`npm run verify:catalog`, `npm run release-check`, and `npm run deploy` all fail
before contacting production if the catalogue is incomplete.

### 3. Provision the administrator securely

Never put the administrator password in source code, shell arguments,
`wrangler.jsonc`, screenshots, online hash tools, or deployment logs. Generate
a cost-12 bcrypt hash locally with an interactive, no-echo prompt. For example,
in a disposable Python environment with `bcrypt` installed:

```sh
python3 - <<'PY'
import bcrypt
import getpass

first = getpass.getpass("Proverb System admin password: ").encode()
second = getpass.getpass("Confirm password: ").encode()
if first != second:
    raise SystemExit("Passwords did not match")
print(bcrypt.hashpw(first, bcrypt.gensalt(rounds=12, prefix=b"2a")).decode())
PY
```

Paste only the resulting `$2a$12$…` bcrypt hash into a private Supabase SQL
session:

```sql
select *
from public.proverb_system_provision_admin(
  'Sam Proverb Admin',
  '<PASTE_COST_12_BCRYPT_HASH_ONLY>'
);
```

The provisioning RPC is unavailable to `service_role`. Calling it again
rotates the hash and revokes every earlier Proverb System admin session.

### 4. Configure and deploy the Worker

`wrangler.jsonc` currently allows only these exact production origins:

- `https://edmundeducation.com`
- `https://www.edmundeducation.com`
- `https://edmundeducation.github.io`

Add any staging origin explicitly; never use `*`. The Proverb Worker owns rate
limit namespaces `914072034` and `914072035`, distinct from every existing
Edmund Education Worker. Confirm that they are available in the target
Cloudflare account before deployment.

From this directory:

```sh
npm ci
npm run check
npm run verify:catalog
npx wrangler secret put SUPABASE_SECRET_KEY
npm run deploy
```

Use a dedicated modern Supabase `sb_secret_...` key. A legacy JWT service-role
key can temporarily be supplied as `SUPABASE_SERVICE_ROLE_KEY` during a
controlled rotation, but `SUPABASE_SECRET_KEY` takes precedence. Neither
belongs in frontend code or checked-in configuration.

Admin login is limited to five attempts per client IP per 60 seconds. Attempt
writes are limited to 30 per student per 60 seconds. The Worker fails closed
if a limiter, the origin allow-list, the Supabase URL, or the secret is absent.
`GET /v1/health` reports readiness without exposing secrets.

## Browser API

Protected calls use a UUID bearer token:

```http
Authorization: Bearer <token>
```

Student routes accept only a valid shared Flashcard student token. Admin routes
accept only the separate token returned by Proverb System admin login.

### Sessions

- `POST /v1/admin/login` with `{ "username", "password" }`
- `GET /v1/admin/me`
- `POST /v1/admin/logout`
- `GET /v1/student/me`

Only the login request contains a password. Both an unknown username and an
incorrect password return the same generic `401` response.

### Attempts

- `GET /v1/attempts?page=1&pageSize=100`
- `GET /v1/attempts/<attempt-uuid>`
- `PUT /v1/attempts/<attempt-uuid>`

The exact top-level `PUT` shape is:

```json
{
  "lessonId": "proverb-01",
  "lessonVersion": "1",
  "status": "in_progress",
  "roundNumber": 1,
  "correctCount": 0,
  "totalCount": 50,
  "durationMs": 0,
  "startedAt": "2026-07-27T00:00:00.000Z",
  "completedAt": null,
  "result": {
    "round": 1,
    "correctIds": [],
    "questionState": {},
    "rounds": [],
    "awaitingNextRound": false,
    "contentVersion": "1"
  }
}
```

Only content version `1`, lesson `proverb-01`, and question IDs `proverb-01-q01`
through `proverb-01-q50` are accepted. Once populated, claimed correct answers
are checked against the protected 50-answer server catalogue derived from the
canonical browser data. Progress cannot lose previously correct IDs, and
completed attempts are immutable, so a
retry after a lost response is safe. Result JSON is capped at 96 KiB and 250
round summaries; the database retains at most 1,000 attempts per student.

### Bookmarks

- `GET /v1/bookmarks`
- `PUT /v1/bookmarks` with `{ "bookmarks": [...] }`

`PUT` atomically replaces the student's list. Each item has exactly
`lessonId`, `questionId`, and boolean `includeAnswer`. The optional lesson-card
bookmark uses question ID `__section__` and must set `includeAnswer` to `false`.
The maximum is 51 unique items: one lesson card plus 50 questions. Existing
creation timestamps survive updates.

### Administrator progress view

- `GET /v1/admin/students`
- `GET /v1/admin/students/<student-uuid>`

The list route returns every active shared student with attempt, completion,
and bookmark counts. The detail route returns that student's latest 100
attempts and all Proverb bookmarks. A Proverb System administrator never
receives student passwords or shared session tokens.
