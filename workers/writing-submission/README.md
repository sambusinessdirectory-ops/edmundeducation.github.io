# Edmund Writing Submission Worker

This Worker is the browser-facing security boundary for submitted writing,
Harper grammar-occurrence history, the student's grammar-problem summary, and
the dedicated Writing Submission administrator.

Students use the canonical `flashcard_students` and
`flashcard_student_sessions` identity. This subsystem creates no student or
student-password table. All application tables have RLS enabled with no
browser-facing policies, and the Worker may invoke only the service-role RPCs
explicitly granted by `../../supabase-writing-submission.sql`.

## Secure bootstrap

### 1. Apply the migration

Apply the repository's shared Flashcard-account migrations first. Then run
`../../supabase-writing-submission.sql` in a private Supabase SQL session.

The migration creates:

- subsystem-specific administrator accounts and hash-only eight-hour sessions;
- immutable, idempotent student submissions keyed to `flashcard_students.id`;
- deduplicated grammar occurrences that can be saved before final submission;
- per-rule grammar-problem summaries; and
- service-role-only student and administrator RPCs.

Do not run the migration from browser code. Do not grant its tables to `anon`
or `authenticated`.

### 2. Provision the dedicated administrator

Never paste the administrator password into this repository, a shell argument,
`wrangler.jsonc`, screenshots, deployment output, or an online hash generator.
Generate a cost-12 bcrypt hash locally using an interactive, non-echoing prompt.
For example, in a disposable Python environment with `bcrypt` installed:

```sh
python3 - <<'PY'
import bcrypt
import getpass

first = getpass.getpass("Writing Submission admin password: ").encode()
second = getpass.getpass("Confirm password: ").encode()
if first != second:
    raise SystemExit("Passwords did not match")
print(bcrypt.hashpw(first, bcrypt.gensalt(rounds=12, prefix=b"2a")).decode())
PY
```

Paste only the resulting hash into a private Supabase SQL session:

```sql
select *
from public.writing_submission_provision_admin(
  'Sam Admin Writing Grammar Check',
  '<PASTE_COST_12_BCRYPT_HASH_ONLY>'
);
```

The provisioning RPC is owner-only and is deliberately unavailable to the
Worker's `service_role`. Running it again rotates the password and revokes all
earlier Writing Submission admin tokens.

### 3. Configure and deploy

Review the exact `ALLOWED_ORIGINS` list. Add each staging origin explicitly;
never use `*`. Ensure the three rate-limit namespace IDs are unused in the
target Cloudflare account.

From this directory:

```sh
npm install
npm run check
npx wrangler secret put SUPABASE_SECRET_KEY
npm run deploy
```

Use a dedicated modern Supabase `sb_secret_...` key. A legacy JWT service-role
key may temporarily be supplied as `SUPABASE_SERVICE_ROLE_KEY`, but
`SUPABASE_SECRET_KEY` takes precedence. Neither key belongs in frontend code or
checked-in configuration.

The Worker fails closed if an exact origin list, Supabase URL, secret, or any
rate limiter is missing. Admin login is limited to 5 attempts/IP/minute,
submission writes to 10/student/minute, and grammar batches to
60/student/minute. `GET /v1/health` reports configuration readiness without
exposing secrets.

## Browser API

Every protected call uses a custom UUID bearer token:

```http
Authorization: Bearer <token>
```

Student routes accept the token returned by the canonical
`flashcard_student_login` RPC. Admin routes accept only the separate token
returned by this Worker's admin login.

### Sessions

- `GET /v1/student/me`
- `POST /v1/admin/login` with `{ "username", "password" }`
- `GET /v1/admin/me`
- `POST /v1/admin/logout`

Only the login request contains a password. Unknown names and wrong passwords
both receive the same generic `401` response.

### Student writing

- `GET /v1/submissions?page=1&pageSize=20`
- `GET /v1/submissions/<submission-uuid>`
- `PUT /v1/submissions/<submission-uuid>` with:

```json
{
  "topic": "The writing prompt",
  "answer": "The student's complete answer."
}
```

The client generates the submission UUID. The server derives the owner from
the bearer token, calculates word count, and supplies submission time. A saved
submission is immutable. Retrying the identical UUID and content is safe;
reusing it with changed content is rejected.

### Grammar history

- `POST /v1/grammar-occurrences/batch`
- `GET /v1/grammar-problems`

The batch body is:

```json
{
  "documentId": "the-eventual-submission-uuid",
  "occurrences": [
    {
      "id": "client-generated-occurrence-uuid",
      "fingerprint": "64-lowercase-hex-character-stable-sha256",
      "ruleId": "SubjectVerbAgreement",
      "title": "Subject–verb agreement",
      "message": "A plural subject takes the base verb form.",
      "originalText": "companies requires",
      "suggestedText": "companies require",
      "sentenceText": "More companies requires staff to wear uniforms.",
      "detectedAt": "2026-07-31T00:00:00.000Z"
    }
  ]
}
```

Send at most 50 occurrences per batch. The stable fingerprint should identify
one rule/span occurrence within one document. Database uniqueness makes retry
safe and prevents resolved issues being counted repeatedly when a sentence is
rescanned. Batches may arrive before final submission; saving the matching
submission UUID links those earlier occurrences automatically. Buffer and
batch detections rather than making one Supabase request per keystroke.

`GET /v1/grammar-problems` groups the student's durable history by `ruleId`
and returns occurrence count plus first/last detection time.

### Administrator

- `GET /v1/admin/students`
- `GET /v1/admin/submissions?page=1&pageSize=20`
- `GET /v1/admin/submissions?studentId=<student-uuid>&page=1&pageSize=20`
- `GET /v1/admin/submissions/<submission-uuid>`

List responses contain short answer previews. Detail responses contain the
full writing and the associated grammar occurrences. Administrator routes do
not expose Flashcard passwords or student session tokens.

## Operational limits

- Topic: 4,000 characters / 16 KiB UTF-8
- Answer: 100,000 characters / 400 KiB UTF-8
- Retained submissions: 2,000 per student
- Grammar occurrences: 50,000 per student
- Grammar batch: 1–50 unique occurrences
- Grammar occurrences returned for one document: at most 2,000
- Student/admin page size: at most 100

If a production requirement exceeds a limit, update and review both the Worker
and SQL checks together. Do not relax only one boundary.
