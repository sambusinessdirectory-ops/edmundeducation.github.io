# Edmund Speaking System recording Worker

This Cloudflare Worker is the only browser-facing broker for the private
Supabase Storage bucket `speaking-recordings`. Students authenticate with the
existing Flashcard session UUID, so Flashcards, Writing, Downloads and Speaking
continue to use one canonical account in `flashcard_students` and
`flashcard_student_sessions`. Speaking creates no student passwords or shadow
sessions.

The Worker provides:

- strict MP3 upload validation and server-generated object names;
- per-student upload rate limiting and transaction-locked file/byte quotas;
- owner-only list, playback/download, deletion and ZIP export;
- rate-limited Speaking-admin login with eight-hour, hash-only sessions;
- recoverable object/metadata deletion with admin reconciliation;
- admin list/download/delete access to every student's attempts; and
- exact-origin CORS for the custom site and GitHub Pages host.

## Secure deployment

### 1. Apply the database migration

Run `../../supabase-speaking-system.sql` in the same Supabase project that
already contains the Flashcard account/session tables. The migration:

- creates the private `speaking-recordings` bucket with a 20 MiB object limit;
- creates `speaking_recording_attempts`, `speaking_system_settings`,
  `speaking_admin_accounts` and `speaking_admin_sessions`;
- enables RLS and gives `anon` and `authenticated` no direct table access; and
- grants `service_role` read-only attempt metadata plus narrowly scoped,
  transaction-safe mutation and authentication RPCs.

No `storage.objects` policy is created for the bucket. Check the project's
existing Storage policies for an older broad policy such as "all buckets for
authenticated users": PostgreSQL policies are ORed, so a broad pre-existing
policy can accidentally reopen a new bucket. The bucket itself must continue
to report `public = false`.

### 2. Provision `Sam Admin Speaking` without storing plaintext

The supplied administrator password must never be pasted into this repository,
`wrangler.jsonc`, a shell command argument, or an online hash generator. Create
a cost-12 `$2a$` bcrypt with trusted local tooling that prompts without echo.
For example, in a disposable local Python environment with `bcrypt` installed:

```sh
python3 - <<'PY'
import bcrypt
import getpass

first = getpass.getpass("Speaking admin password: ").encode()
second = getpass.getpass("Confirm password: ").encode()
if first != second:
    raise SystemExit("Passwords did not match")
print(bcrypt.hashpw(first, bcrypt.gensalt(rounds=12, prefix=b"2a")).decode())
PY
```

Paste **only the resulting hash** into a private Supabase SQL session:

```sql
select *
from public.speaking_provision_admin(
  'Sam Admin Speaking',
  '<PASTE_COST_12_BCRYPT_HASH_ONLY>'
);
```

The provisioning function is owner-only and accepts hashes, not plaintext. A
password rotation through the same function invalidates all existing Speaking
admin sessions.

### 3. Configure and deploy the Worker

Review `wrangler.jsonc`. `ALLOWED_ORIGINS` is a comma-separated exact allowlist
and currently contains the custom domain, its `www` form, and
`https://edmundeducation.github.io`. Remove a hostname if it is not actually
used; add staging origins explicitly instead of using `*`.

From this directory:

```sh
npm install
npm run check
npx wrangler secret put SUPABASE_SECRET_KEY
npm run deploy
```

`SUPABASE_SECRET_KEY` should be a dedicated modern `sb_secret_...` key for this
Worker. Supabase maps it to the server-side `service_role` database role. It is
intentionally absent from source and must never be copied into frontend
JavaScript, HTML, GitHub Actions output, screenshots or issue reports. The
Worker sends it only in Supabase's `apikey` header to the configured HTTPS
origin and never includes upstream error bodies in browser responses or logs.

The code also accepts `SUPABASE_SERVICE_ROLE_KEY` as a temporary compatibility
fallback for the legacy JWT-based service-role key, but a new deployment should
prefer a separately rotatable secret key. Do not set both unless performing a
controlled rotation; `SUPABASE_SECRET_KEY` takes precedence.

Both checked-in rate-limit bindings fail closed if missing. Admin login allows
five attempts per client IP per 60 seconds; uploads allow twelve attempts per
student account per 60 seconds. Use distinct Cloudflare rate-limit namespaces
if either checked-in ID is already allocated in the account. `/v1/health`
reports both binding states as well as the effective upload, duration and export
caps.

This deployment is intentionally sized for the Cloudflare Workers Free plan:
uploads default to 3 MiB and 150 seconds, while exports are limited to 40 files
and 64 MiB of audio per batch. Missing or invalid upload settings fall back to
those safe values, not to the database ceilings. The Supabase table and bucket
retain 20 MiB/30-minute ceilings so a later paid deployment can raise Worker
limits without another storage migration. Do not raise the checked-in Worker
caps until the upload inspection/hash benchmark and Cloudflare CPU/subrequest
budgets have been reviewed for the target plan.

The reference local Node benchmark used a real ffmpeg-encoded, 149.943-second
MP3 of 2,998,901 bytes. Across 100 warmed runs, frame inspection plus the
slicing-by-eight CRC-32 averaged 3.56 ms with a 3.65 ms p95. A broader local
pass including multipart parsing and SHA-256 averaged about 9 ms of CPU. This
is evidence for the checked-in boundary, not a guarantee of Cloudflare
production CPU time. Workers Free currently allows 10 ms of CPU per HTTP
request (with limited flexibility for infrequent overruns) and 50 external
subrequests; see the [official limits](https://developers.cloudflare.com/workers/platform/limits/).
Raising either cap may therefore require Workers Paid and a new
production-like benchmark.

After deployment, put the Worker base URL in the Speaking frontend's public
configuration. Do not put any secret beside it.

## Browser API contract

Every protected call sends one custom UUID as:

```http
Authorization: Bearer <token>
```

Student routes use the canonical `flashcard_student_sessions.token`. Admin
routes use the separate `adminToken` returned by Speaking admin login.

### Admin session

- `POST /v1/admin/login` — JSON `{ "username": "...", "password": "..." }`.
  Returns `{ "admin": { "adminToken", "name", "expiresAt" } }` or a generic
  `401`; it never reveals whether a username exists.
- `GET /v1/admin/me` — validates the admin bearer token.
- `POST /v1/admin/logout` — revokes the current admin token.

### Student session

- `GET /v1/student/me` — validates the canonical Flashcard student bearer and
  returns `{ "student": { "id", "name", "expiresAt" } }`. The Speaking page
  uses this before restoring a session from browser storage.

### Save an attempt

`POST /v1/recordings` accepts `multipart/form-data` with exactly these fields:

| Field | Required | Rules |
| --- | --- | --- |
| `file` | yes | One real MP3; MIME `audio/mpeg`, `audio/mp3` or `audio/x-mp3`; 512 bytes to 3 MiB with the checked-in configuration |
| `exerciseId` | yes | Stable 1-120 character ID using letters, digits, `.`, `_`, `:` or `-` |
| `exerciseTitle` | yes | 1-240 printable characters |
| `exam` | yes | `IELTS`/`ielts` for the current release |
| `part` | for IELTS | `1`-`3`, `Part 1`-`Part 3`, or equivalent hyphenated form |
| `book` | for IELTS | `1`-`16`, `Book 1`-`Book 16`, or equivalent hyphenated form |
| `durationMs` | no | Non-negative client timing hint up to 150 seconds; the Worker independently derives the authoritative duration from MP3 frames |

Example (placeholder tokens only):

```sh
curl --fail-with-body \
  -H 'Origin: https://edmundeducation.github.io' \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -F "file=@$MP3_FILE;type=audio/mpeg" \
  -F 'exerciseId=ielts-part2-book1-question1' \
  -F 'exerciseTitle=Advertisements' \
  -F 'exam=IELTS' \
  -F 'part=2' \
  -F 'book=1' \
  -F 'durationMs=120000' \
  "$WORKER_BASE_URL/v1/recordings"
```

The Worker parses the MPEG Layer III frame stream, recomputes duration,
SHA-256 and CRC-32, and generates the only permitted path:
`students/<student UUID>/<attempt UUID>.mp3`. Renaming another format to
`.mp3` is rejected. Native `MediaRecorder` commonly produces WebM or Ogg; the
frontend must encode a genuine MP3 before upload because this Worker does not
transcode audio. ID3v2 data is capped at 64 KiB and 25% of the file, malformed
tag flags are rejected, at least 24 consistent audio frames and one second of
audio are required, and trailing zero padding is capped at 1 KiB.

Before writing Storage, the Worker reserves metadata through
`speaking_reserve_recording_attempt`. That RPC takes a transaction-level
per-student advisory lock and atomically enforces the singleton settings row.
The defaults are 500 retained attempts and 1 GiB per student; all lifecycle
states count until their metadata is finalized. An owner may adjust the limits
from a private Supabase SQL session, for example:

```sql
update public.speaking_system_settings
set max_recordings_per_student = 750,
    max_storage_bytes_per_student = 1610612736
where singleton;
```

Never expose this settings table or its mutation to a browser role.

### List, play, delete and export

- `GET /v1/recordings?scope=mine&page=1&pageSize=100` — owner list. Each row has
  an authenticated `downloadUrl`; it is not a public or long-lived signed URL.
- `GET /v1/recordings/<attempt-uuid>` — owner/admin playback. Single byte ranges
  are forwarded so audio seeking works. Add `?download=1` for attachment
  disposition.
- `DELETE /v1/recordings/<attempt-uuid>` — students may delete only their own;
  an admin bearer token may delete any. The row is hidden as `deleting` before
  Storage removal and finalized afterward. A `202` response means the safe
  tombstone remains for reconciliation.
- `GET /v1/recordings/export?page=1&pageSize=10` (or the `.zip` alias) — streams
  one authenticated-student batch as an uncompressed ZIP. `pageSize` may not
  exceed 40, and a batch may not exceed 64 MiB of MP3 data by default.
- `GET /v1/recordings?scope=all&page=1&pageSize=100&studentId=<optional-uuid>` —
  admin list. `GET /v1/admin/recordings` is an equivalent admin-only alias.
- `DELETE /v1/admin/recordings/<attempt-uuid>` — explicit admin-only delete.
- `POST /v1/admin/reconcile` — admin-only cleanup of at most 10 `deleting` or
  stale `uploading` rows. Optional JSON: `{ "limit": 10 }`. Upload reservations
  are not considered stale until ten minutes have elapsed.

Every successful export response exposes `X-Export-Page`,
`X-Export-Page-Size`, `X-Export-File-Count`, `X-Export-Total-Files`,
`X-Export-Total-Pages` and `X-Export-Has-More`. The frontend downloads batches
sequentially. An empty or out-of-range batch returns `404 NO_RECORDINGS`.
Cloudflare's `FixedLengthStream` supplies the exact ZIP length when available;
the generic runtime fallback deliberately omits `Content-Length`. Export trusts
the CRC/SHA recorded from validated immutable upload bytes and rechecks each
Storage object's byte length while streaming, avoiding per-byte CRC work during
large exports.

## Threat-model highlights

- **Credential isolation:** student credentials remain canonical; raw admin
  session tokens are never stored in Postgres, and the Supabase secret key
  remains an encrypted Worker secret.
- **Broken object-level authorization:** the Worker resolves ownership from the
  validated canonical token and adds `student_id` to every student metadata
  query. A cross-student UUID therefore returns the same `404` as a missing
  object.
- **Upload abuse and polyglots:** both declared and streamed body size are
  bounded before multipart parsing. The account-keyed rate limiter runs before
  parsing, and the database lock enforces retained-file and byte quotas under
  concurrent uploads. MIME, bounded ID3 data and every MPEG Layer III frame are
  checked; arbitrary trailing payloads are rejected.
- **Path traversal/overwrite:** clients never supply a Storage key. UUID-only
  paths are generated server-side, SQL checks the path against row/student IDs,
  and uploads use `x-upsert: false`.
- **Password attacks:** Cloudflare rate limiting runs before JSON parsing or
  bcrypt. Missing bindings fail closed, errors are generic, and unknown names
  still incur cost-12 bcrypt work.
- **Private downloads:** Supabase objects remain private. The Worker validates a
  bearer token for every list, audio, delete and ZIP request; CORS is an
  additional browser boundary, not the authentication mechanism.
- **Retention/deletion:** a three-state `uploading`/`ready`/`deleting` lifecycle
  prevents ordinary list/download/export calls from exposing incomplete work.
  Storage failure leaves a recoverable tombstone rather than inconsistent
  visible metadata. The student foreign key uses `ON DELETE RESTRICT` so a hard
  account deletion cannot silently strand private objects; export or delete
  attempts first. Soft-deleted students cannot log in, but admins can reconcile
  or remove their attempts.
- **Cross-service key impact:** a Supabase service-role key is powerful. Limit
  Worker account access, rotate on suspected exposure, keep Cloudflare logs
  free of request headers, and audit deployments for source-map/secret leaks.

## Release verification

Run these checks against a staging deployment before publishing:

1. `GET /v1/health` reports `ok: true`; an unlisted or `Origin: null` caller is
   rejected on every protected route.
2. The canonical Flashcard token lists/uploads successfully; an expired token,
   random UUID and second student's token cannot read/delete the first
   student's attempt.
3. A valid MP3 uploads and seeks with a `Range` request. Renamed text/WebM,
   truncated frames, oversized/malformed ID3, excessive trailing padding,
   multiple `file` parts and an over-limit/chunked request are rejected without
   a visible attempt.
4. Five admin login attempts are processed and the sixth from the same client
   within 60 seconds returns `429`. Thirteen student upload requests in a minute
   produce a `429` on the last one. Correct login, `me`, logout and expiry work.
5. Admin `scope=all` includes student names and can delete an attempt; a student
   cannot request `scope=all`.
6. Export more than one ZIP batch, confirm all six pagination headers, run
   `unzip -t` on every archive, and compare entries with authenticated
   downloads. Test a deliberately missing/short staging object and confirm the
   affected archive stream aborts.
7. As `anon` and `authenticated`, direct REST reads of
   `speaking_recording_attempts` fail and direct Storage reads fail. Confirm
   `storage.buckets.public = false` and inspect all existing
   `storage.objects` policies for broad grants.
8. Simulate Storage delete and metadata-finalization failures. Confirm visible
   APIs hide tombstones, `POST /v1/admin/reconcile` completes them, and a stale
   `uploading` reservation is not claimed before ten minutes.
9. Rotate the admin bcrypt and confirm old admin tokens stop working. Rotate
   the Worker service-role secret in a controlled staging exercise.

Finally run `npm run check`, inspect `wrangler deploy --dry-run`, and verify the
dry-run bundle contains neither the service-role key nor any plaintext
password.
