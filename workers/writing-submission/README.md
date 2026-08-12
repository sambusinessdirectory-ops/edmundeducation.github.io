# Edmund Writing Submission Worker

This Worker is the browser-facing security boundary for submitted writing,
authenticated Cloudflare Workers AI sentence checks, grammar-occurrence
history, the student's grammar-problem summary, and the dedicated Writing
Submission administrator.

Students use the canonical `flashcard_students` and
`flashcard_student_sessions` identity. This subsystem creates no student or
student-password table. All application tables have RLS enabled with no
browser-facing policies, and the Worker may invoke only the service-role RPCs
explicitly granted by `../../supabase-writing-submission.sql`.

## Secure bootstrap

### Existing-installation topic-access upgrade (required)

An existing Writing Submission installation must use the incremental
`../../supabase-writing-submission-topic-access.sql` migration before the
matching Worker or browser assets are released. Use this exact rollout order:

1. Apply `../../supabase-writing-submission-topic-access.sql` in a private
   Supabase SQL session.
2. Verify that `writing_submission_student_profile(uuid)` has the new
   four-column result (`id`, `name`, `session_expires_at`, `access`) and that
   only `service_role` can execute it:

   ```sql
   select
     pg_get_function_result(
       'public.writing_submission_student_profile(uuid)'::regprocedure
     ) as result_type,
     has_function_privilege(
       'service_role',
       'public.writing_submission_student_profile(uuid)',
       'EXECUTE'
     ) as service_role_can_execute,
     has_function_privilege(
       'anon',
       'public.writing_submission_student_profile(uuid)',
       'EXECUTE'
     ) as anon_can_execute,
     has_function_privilege(
       'authenticated',
       'public.writing_submission_student_profile(uuid)',
       'EXECUTE'
     ) as authenticated_can_execute;
   ```

   The result type must list all four columns, with `access jsonb` last.
   `service_role_can_execute` must be `true`; both browser-role values must be
   `false`.
3. Deploy this Writing Submission Worker.
4. Publish the matching static Pages/site assets.

Do not use `../../supabase-writing-submission.sql` as an in-place upgrade for
an existing database. That core bootstrap file now declares a four-column
table return type, while existing installations have the earlier three-column
function. PostgreSQL does not allow `CREATE OR REPLACE FUNCTION` to change a
function's table return type. The incremental topic-access migration performs
the required drop and recreation atomically inside a transaction and restores
the service-role-only ACL.

### 1. Apply the migration

Apply the repository's shared Flashcard-account migrations first. Then run
`../../supabase-writing-submission.sql` in a private Supabase SQL session.
Apply `../../supabase-writing-submission-enhancements.sql` immediately after
it, then apply `../../supabase-writing-submission-grammar-history.sql` and
`../../supabase-writing-submission-drafts-admin.sql`. Apply
`../../supabase-writing-submission-feedback.sql` next. Apply
`../../supabase-writing-grammar-corpus.sql` after that, followed by the generated
`../../grammar-corpus/seed-corpus-v1.sql` release seed.

The migration creates:

- subsystem-specific administrator accounts and hash-only eight-hour sessions;
- immutable, idempotent student submissions keyed to `flashcard_students.id`;
- account-backed grammar-detection preferences and per-composition timing;
- recoverable student archive deletion that keeps the administrator record;
- daily article, total-time and average-time progress aggregates;
- deduplicated grammar occurrences that can be saved before final submission;
- complete per-occurrence cards with their source composition;
- per-rule grammar-problem summaries and student-owned detail pages;
- an administrator-only queue for generic explanations that need a specific
  teacher-authored rule; and
- normalized, versioned teacher feedback with ordered original-fragment and
  Edmund-comment pairs, draft/published states, and an immutable audit trail;
- published-feedback visibility limited to the student who owns the active
  submission, with all draft/edit/delete operations limited to the dedicated
  Writing Submission administrator; and
- service-role-only student and administrator RPCs.

The separate corpus migration creates a normalized, versioned private archive
for teacher-approved paragraphs, sentences, issues, reusable rules and valid
counterexamples. Its tables also have RLS enabled with no browser policies.

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
never use `*`. Ensure all four rate-limit namespace IDs are unused in the
target Cloudflare account.

The checked-in Wrangler configuration binds Workers AI as `env.AI` and uses a
fourth, dedicated rate-limit namespace (`914072063`) for advanced grammar
checks. The AI binding needs no browser credential and no additional Worker
secret. Do not replace the binding with a client-side Cloudflare API token.

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

The core Worker fails closed if an exact origin list, Supabase URL, secret, or
any of its three core rate limiters is missing. Admin login is limited to 5
attempts/IP/minute, submission writes to 10/student/minute, and grammar batches to
60/student/minute. Advanced grammar checks are separately limited to
20/student/minute. `GET /v1/health` reports core service readiness, Workers AI
availability, and the grammar-check limiter separately without exposing
secrets. A missing AI binding or grammar-check limiter disables only advanced
checking; it does not disable writing, submission, archive, or grammar-history
routes.

## Browser API

Every protected call uses a custom UUID bearer token:

```http
Authorization: Bearer <token>
```

Student routes accept the token returned by the canonical
`flashcard_student_login` RPC. Admin routes accept only the separate token
returned by this Worker's admin login.

### Sessions

- `GET /v1/student/me` — restores the canonical student identity and current
  Writing Practice section-access map. Browser/session-storage permissions are
  never accepted as authorization.
- `POST /v1/admin/login` with `{ "username", "password" }`
- `GET /v1/admin/me`
- `POST /v1/admin/logout`

Only the login request contains a password. Unknown names and wrong passwords
both receive the same generic `401` response.

### Student writing

- `GET /v1/preferences`
- `PUT /v1/preferences` with `{ "grammarDetectionEnabled": true | false }`
- `GET /v1/progress`
- `GET /v1/submissions?page=1&pageSize=20`
- `GET /v1/submissions/<submission-uuid>`
- `GET /v1/submissions/<submission-uuid>/feedback` — returns the student's
  published teacher feedback, or `{ "feedback": null }` before publication.
- `DELETE /v1/submissions/<submission-uuid>` (student archive soft-delete)
- `PUT /v1/submissions/<submission-uuid>` with:

```json
{
  "topic": "The writing prompt",
  "answer": "The student's complete answer.",
  "durationSeconds": 725
}
```

The client generates the submission UUID. The server derives the owner from
the bearer token, calculates word count, and supplies submission time. A saved
submission is immutable. Retrying the identical UUID and content is safe;
reusing it with changed content or duration is rejected. Student deletion only
hides an article from the personal archive; the saved article, grammar history,
and historical progress remain available to the administrator.

### Teacher feedback

- `GET /v1/admin/submissions/<submission-uuid>/feedback`
- `PUT /v1/admin/submissions/<submission-uuid>/feedback`
- `DELETE /v1/admin/submissions/<submission-uuid>/feedback` with the exact JSON
  body `{ "expectedVersion": 2, "expectedFeedbackId": "<feedback-uuid>" }`

The administrator may repeatedly save a draft or publish a complete review:

```json
{
  "overallComment": "整體評語",
  "fragments": [
    {
      "originalFragment": "The student's original sentence.",
      "edmundComment": "Edmund 評語"
    }
  ],
  "finalComment": "最後評語",
  "status": "published",
  "expectedVersion": 2,
  "expectedFeedbackId": "77777777-7777-4777-8777-777777777777"
}
```

Draft feedback may contain partially completed fragment pairs. Publishing
requires a non-empty overall comment, at least one pair containing both the
original fragment and Edmund comment, and a non-empty final comment. Each save
replaces the ordered fragment set atomically and increments the feedback
version. Deleting feedback removes its current contents while retaining an
administrator audit event. Student APIs never expose drafts. A new feedback
uses `expectedVersion: 0` and `expectedFeedbackId: null`; subsequent saves must
send both the `version` and `id` returned by the latest GET or PUT response. A
stale version or mismatched feedback identity is rejected with HTTP `409` and
code `FEEDBACK_VERSION_CONFLICT`, so another administrator's changes cannot be
silently overwritten—even if feedback was deleted and recreated at version 1.
Deletion likewise requires the current positive version and exact feedback ID;
a missing, invalid, or stale concurrency token cannot delete feedback.

### Advanced grammar checking

- `POST /v1/grammar-check`

The request body must have exactly one key:

```json
{
  "sentence": "Tommy need book to reading better."
}
```

The student bearer token is authenticated before inference. The sentence must
be complete with a final full stop or semicolon, contain no leading or trailing
space, and stay within 2,000 characters / 8 KiB UTF-8. The complete request is
limited to 12 KiB.

#### Privacy boundary

The Worker sends only the completed sentence being checked. It does not send
the writing topic, whole essay, student identity, account details, earlier
sentences, saved submissions, or grammar-history records to Workers AI. The
second review receives the original sentence and the first proposed correction,
both of which contain only material derived from that same sentence.

The grammar service does not learn from live student submissions. Prompts,
provider responses, checked sentences and accepted suggestions are not added
to the teacher corpus or written to KV, R2, Durable Objects or application
logs. Responses use `Cache-Control: no-store`.

The reviewed corpus is authored and audited in the version-controlled source
JSON (or a reviewed workbook normalized into it), then archived in Supabase and
published as a versioned read-only Worker snapshot from that same validated
source. Exact lookup therefore does not send the student's sentence to Supabase
or add a database round-trip. Only deliberately teacher-approved examples
appear in the snapshot; runtime detections can never promote themselves.

#### Review pipeline

Version `2026-08-01.11` uses a corpus-assisted general correction pipeline:

1. The Worker checks for an exact teacher-approved source sentence. A match is
   returned from the bundled release without calling Workers AI. The generic
   safety materializer still derives and verifies every edit range.
2. `@cf/meta/llama-3.3-70b-instruct-fp8-fast` independently reviews the entire
   sentence and proposes one complete correction. It is instructed to find
   every high-confidence grammatical problem, preserve meaning and protected
   quoted text, and avoid stylistic rewriting.
3. A second invocation of the same 70B model uses a different task prompt and
   seed. It rereads the original sentence, treats the first proposal as
   untrusted, audits every clause for missed errors, and checks that the
   proposal did not introduce a new error or alter the student's meaning. The
   audit may receive at most two structurally relevant teacher-approved
   examples. They are reference data, never answers, and vocabulary or facts
   may not be copied from them.
4. The Worker compares the original sentence with the final validated
   correction and derives the actual replacement ranges itself. Provider
   fragments and occurrence metadata are advisory only; the Worker does not
   trust provider-supplied coordinates.
5. If the audited result is unavailable or unsafe, the Worker may use a safe
   validated first proposal. If neither 70B result can be safely materialised,
   `@cf/meta/llama-3.1-8b-instruct-fast` performs an independent last-resort
   review beginning from the original sentence.

The exact corpus path is intentionally narrow. Near matches never inherit an
approved correction. Unseen sentences remain AI judgements, with corpus
examples used only as reusable structural guidance.

A successful response contains zero to eight validated issues in the same
serialisable shape used by the browser checker. Every returned issue is built
from a Worker-derived edit range, uses a bounded grammar category, and includes
a brief Traditional Chinese explanation. The Worker rejects malformed,
low-confidence, unsafe, overlapping, meaning-changing, duplicated, or
unverifiable output.

If all available results are inconclusive, the endpoint fails closed with the
generic `503 GRAMMAR_CHECK_UNAVAILABLE` response. The browser may retain its
limited local checker, but the absence of an AI suggestion must not be presented
as proof that a sentence is correct.

A confirmed Workers AI daily-allocation error (`4006`) stops the pipeline
immediately instead of attempting the audit and fallback models. It returns
`503 GRAMMAR_CHECK_QUOTA_EXHAUSTED` without exposing provider details or the
student sentence. The browser identifies this availability state separately and
states that Cloudflare's daily allowance resets at 08:00 Hong Kong time.

#### Cost and quota implications

A normal version `.11` non-exact check performs two 70B invocations: one proposal and one
independent completeness-and-meaning audit. The 8B invocation is a last-resort
fallback and is not normally used. During the 1 August 2026 preview evaluation,
one 70B invocation consumed approximately 39–41 Workers AI neurons and one 8B
invocation approximately 7–9 neurons. These are observations rather than a
billing guarantee; prompt length, completion length, model accounting, pricing,
and quotas may change.

Monitor Workers AI usage before running large evaluation suites. Quota
exhaustion, provider failure, and validation failure are availability states,
not grammar judgements. The existing browser may separately save a displayed
issue through the grammar-history batch route; that durable history operation
is distinct from the stateless AI check.

An exact teacher-approved corpus match performs no Workers AI invocation and
therefore consumes no Workers AI neurons.

### Grammar history

- `POST /v1/grammar-occurrences/batch`
- `GET /v1/grammar-problems`
- `GET /v1/grammar-problem-occurrences?ruleId=<rule-id>&page=1&pageSize=25`

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
      "correctedSentence": "More companies require staff to wear uniforms.",
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
and returns occurrence count plus first/last detection time. The paginated
detail route requires the same authenticated student and derives the student
identifier from that token; it returns only that student's occurrences,
including the complete original sentence, complete locally corrected sentence,
exact explanation, timestamp and linked source-composition metadata.

### Administrator

- `GET /v1/admin/students`
- `GET /v1/admin/submissions?page=1&pageSize=20`
- `GET /v1/admin/submissions?studentId=<student-uuid>&page=1&pageSize=20`
- `GET /v1/admin/submissions/<submission-uuid>`
- `GET /v1/admin/explanation-review?page=1&pageSize=50`

List responses contain short answer previews. Detail responses contain the
full writing and the associated grammar occurrences. The explanation-review
route returns only occurrences whose saved explanation contains the exact
generic-review marker. Administrator routes do not expose Flashcard passwords
or student session tokens.

## Operational limits

- Topic: 4,000 characters / 16 KiB UTF-8
- Answer: 100,000 characters / 400 KiB UTF-8
- Grammar-check request: 12 KiB
- Completed grammar-check sentence: 2,000 characters / 8 KiB UTF-8
- Browser grammar-check request deadline: 5 minutes (300,000 ms); the Worker
  or Workers AI provider may return a classified failure sooner
- Advanced grammar issues returned: at most 8
- Retained submissions: 2,000 per student
- Grammar occurrences: 50,000 per student
- Grammar batch: 1–50 unique occurrences
- Grammar occurrences returned for one document: at most 2,000
- Student/admin page size: at most 100

If a production requirement exceeds a limit, update and review both the Worker
and SQL checks together. Do not relax only one boundary.
