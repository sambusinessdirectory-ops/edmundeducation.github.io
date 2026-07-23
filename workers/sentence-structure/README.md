# Edmund Sentence Structure Worker

This Worker is the browser-facing boundary for Sentence Structure attempts,
bookmarks, shared-student progress, and the dedicated administrator. Students
continue to authenticate against the canonical `flashcard_students` and
`flashcard_student_sessions` tables. There is no Sentence Structure student or
password table.

All application tables have RLS enabled and no browser-facing policies. Table
privileges are revoked from `anon`, `authenticated`, and `service_role`; the
Worker's service key may invoke only narrowly scoped security-definer RPCs.

## Secure bootstrap

### 1. Apply the migration

First apply the repository's shared Flashcard account migration if it is not
already installed. Then run `../../supabase-sentence-structure.sql` in a
private Supabase SQL session.

For an existing production installation that already supports `ss1`–`ss39`,
apply only the forward migration
`../../supabase-sentence-structure-lessons-40-70.sql`. It widens the permitted
lesson IDs and bookmark capacity without deleting attempts or bookmarks.

The migration creates:

- `sentence_structure_admin_accounts` and hash-only, eight-hour admin sessions;
- `sentence_structure_attempts`, keyed to `flashcard_students.id`;
- normalized, account-synced `sentence_structure_bookmarks`; and
- service-role-only authentication, attempt, bookmark, and administrator RPCs.

### 2. Provision the dedicated administrator

Never paste the supplied administrator password into this repository,
`wrangler.jsonc`, a shell argument, an online hash generator, screenshots, or
deployment logs. Generate a cost-12 bcrypt locally with a tool that prompts
without echo. For example, in a disposable Python environment with `bcrypt`
installed:

```sh
python3 - <<'PY'
import bcrypt
import getpass

first = getpass.getpass("Sentence Structure admin password: ").encode()
second = getpass.getpass("Confirm password: ").encode()
if first != second:
    raise SystemExit("Passwords did not match")
print(bcrypt.hashpw(first, bcrypt.gensalt(rounds=12, prefix=b"2a")).decode())
PY
```

Paste only the resulting hash into a private Supabase SQL session:

```sql
select *
from public.sentence_structure_provision_admin(
  'Sam Sentence Structure',
  '<PASTE_COST_12_BCRYPT_HASH_ONLY>'
);
```

The provisioning function cannot be called by `service_role`. Calling it again
rotates the password and revokes every earlier Sentence Structure admin token.

### 3. Configure and deploy

Review the exact `ALLOWED_ORIGINS` list in `wrangler.jsonc`. Add staging hosts
explicitly; never replace it with `*`. If rate-limit namespace `914072030` or
`914072031` is already allocated in the Cloudflare account, replace it with a
distinct ID.

From this directory:

```sh
npm install
npm run check
npx wrangler secret put SUPABASE_SECRET_KEY
npm run deploy
```

Use a dedicated modern Supabase `sb_secret_...` key. The Worker also supports a
legacy JWT service-role key in `SUPABASE_SERVICE_ROLE_KEY` during a controlled
rotation, but `SUPABASE_SECRET_KEY` takes precedence. Neither key belongs in
frontend code or checked-in configuration.

Admin login is limited to five attempts per client IP per 60 seconds. Attempt
writes are limited to 30 per student per 60 seconds. The Worker fails closed
when either binding, the exact origin list, Supabase URL, or secret is missing.
`GET /v1/health` reports configuration readiness without exposing secrets.

## Browser API

Protected calls use one custom UUID bearer token:

```http
Authorization: Bearer <token>
```

Student routes accept the token returned by the existing
`flashcard_student_login` RPC. Admin routes accept only the separate token
returned from Sentence Structure admin login.

### Sessions

- `POST /v1/admin/login` with `{ "username", "password" }`
- `GET /v1/admin/me`
- `POST /v1/admin/logout`
- `GET /v1/student/me`

Only the login request contains a password. The Worker returns a generic `401`
for both unknown names and incorrect passwords.

### Attempts

- `GET /v1/attempts?page=1&pageSize=100`
- `GET /v1/attempts/<attempt-uuid>`
- `PUT /v1/attempts/<attempt-uuid>`

The `PUT` body is the exact frontend shape:

```json
{
  "lessonId": "ss1",
  "lessonVersion": "1",
  "status": "in_progress",
  "roundNumber": 1,
  "correctCount": 0,
  "totalCount": 50,
  "durationMs": 0,
  "startedAt": "2026-07-22T00:00:00.000Z",
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

Attempt UUIDs are client-generated but the student owner always comes from the
validated bearer token. Only catalog version `1`, lessons `ss1`–`ss70`, their
exact 50 question IDs per lesson, and answers accepted by the published catalog can be
credited as correct. Progress cannot lose previously correct IDs and completed
attempts are immutable, making a retry after a lost response safe. Result JSON
is capped at 96 KiB and 250 round summaries, writes are rate limited, and the
database retains at most 1,000 attempts per student. Bodies and all nested
arrays, strings, identifiers, timestamps, counts, and result snapshots are
bounded and validated before the database RPC is called.

### Bookmarks

- `GET /v1/bookmarks`
- `PUT /v1/bookmarks` with `{ "bookmarks": [...] }`

`PUT` atomically replaces the student's list. Each item has exactly
`lessonId`, `questionId`, and boolean `includeAnswer`; duplicates and more than
4,000 items are rejected. Existing bookmark creation timestamps survive updates.

### Administrator progress view

- `GET /v1/admin/students`
- `GET /v1/admin/students/<student-uuid>`

The first route lists every active shared Flashcard student with attempt,
completion, and bookmark counts. The detail route returns the student's latest
100 attempts and all bookmarks. A Sentence Structure administrator never gains
access to student passwords or Flashcard session tokens.
