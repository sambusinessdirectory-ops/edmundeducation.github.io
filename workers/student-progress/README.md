# Edmund Student Progress Worker

This Worker is the browser-facing boundary for the unified student progress
portal. It reads one transactional Supabase snapshot containing the canonical
daily activity and time data from Flash Cards, Writing Practice, Sentence
Structure, Speaking, Phrasal Verbs, Idioms, Proverbs, and Writing Submission.
It does not duplicate or cache those systems' dashboard counters.

Students use the existing shared Flashcard session token. The portal therefore
does not create another student password, account, or session. The dedicated
progress administrator has separate hash-only credentials and sessions.

## Secure bootstrap

### 1. Apply the database migration

Install the migrations for all source systems first, including the Writing
Submission duration/soft-delete enhancement. Then run
`../../supabase-student-progress.sql` in a private Supabase SQL session.

The migration supplies service-role-only RPCs for shared-student validation,
administrator authentication and student selection, and the single
transactional progress snapshot. Browser roles have no direct access to source
tables or administrator tables.

### 2. Provision the dedicated administrator

Never put the administrator password in this repository, Wrangler variables,
shell arguments, online hash generators, screenshots, or deployment logs.
Create a cost-12 bcrypt hash locally with a non-echoing prompt. For example, in
a disposable Python environment with `bcrypt` installed:

```sh
python3 - <<'PY'
import bcrypt
import getpass

first = getpass.getpass("Student Progress admin password: ").encode()
second = getpass.getpass("Confirm password: ").encode()
if first != second:
    raise SystemExit("Passwords did not match")
print(bcrypt.hashpw(first, bcrypt.gensalt(rounds=12, prefix=b"2a")).decode())
PY
```

Paste only the resulting hash into a private owner SQL session:

```sql
select *
from public.student_progress_provision_admin(
  'Sam Admin Dashboard',
  '<PASTE_COST_12_BCRYPT_HASH_ONLY>'
);
```

The provisioning RPC is owner-only and must not be granted to `service_role`.
Re-provisioning rotates the hash and revokes all earlier progress-admin tokens.

### 3. Configure and deploy

Review the exact `ALLOWED_ORIGINS` allowlist in `wrangler.jsonc`; add any
staging origin explicitly and never use `*`. If rate-limit namespace
`914072064` is already allocated in the Cloudflare account, replace it with a
distinct namespace ID.

From this directory:

```sh
npm install
npm run check
npx wrangler secret put SUPABASE_SECRET_KEY
npm run deploy
```

Use a dedicated modern Supabase `sb_secret_...` key. A legacy JWT service-role
key may temporarily be stored as `SUPABASE_SERVICE_ROLE_KEY` during a controlled
rotation, but `SUPABASE_SECRET_KEY` takes precedence. Neither key belongs in
frontend code or checked-in configuration. Admin login is limited to five
attempts per client IP per 60 seconds. The Worker fails closed if its exact
origin allowlist, Supabase URL, server secret, or rate limiter is absent.

## Browser API

Protected requests send the applicable UUID token as:

```http
Authorization: Bearer <token>
```

Available routes are:

- `GET /v1/health`
- `POST /v1/admin/login` with `{ "username", "password" }`
- `GET /v1/admin/me`
- `POST /v1/admin/logout`
- `GET /v1/student/me`
- `GET /v1/progress`
- `GET /v1/admin/students`
- `GET /v1/admin/students/<student-uuid>/progress`

`GET /v1/progress` and the administrator detail route return
`{ "snapshot": ... }`. The snapshot is produced by one database RPC and has a
student profile plus a `sources` object. Each source contains sparse daily
activity and millisecond-time arrays. The frontend derives daily, cumulative,
and cross-system chart series from that one response without re-querying the
individual applications.

The database snapshot owns aggregation semantics. In particular, learning
system question activity is unique by system, lesson, and question even after
many retries; Flashcard and Writing Practice retain their native counting
rules; Speaking includes only ready recordings; and Writing Submission keeps
historical activity from student-soft-deleted articles while hiding those
articles from the student's article list.

Every response is `no-store`, credentials are never accepted in query strings,
upstream Supabase errors are sanitized, and administrator list/detail routes
never expose passwords or student session tokens.
