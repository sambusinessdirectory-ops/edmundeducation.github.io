# Polysemy Lab — homepage card 65

Entry: `/polysemy-lab.html`. Initial module: SHOW, 16 directory entries and 33 questions, exactly six curated options each. Practice order is seeded by each new run UUID, with adjacent identical senses avoided. The reference directory remains in teaching order. Related/overlapping meanings remain in the reference but are not opposing choices in ambiguous contexts.

## Accounts and progress

Uses the existing homework/schedule `flashcard_student_login` and `flashcard_student_session_profile` RPCs and the universal student-session bridge. It does not call Professional English (`special_flash_*`) endpoints. Passwords are not persisted.

`polysemy_private.events` is an isolated append-only record, scoped by a validated homework student token. A public SECURITY INVOKER RPC wraps the private token-checking function, which also requires an authenticated transport session. Both private tables have RLS enabled, no direct client table privileges, and deliberately no permissive policies. The advisor's informational “RLS enabled, no policy” notes reflect this deny-by-default design.

Views deduplicate per student/meaning. Answers deduplicate per student/run/round/question, and the server checks choices against the catalogue. Request IDs make lost-response retries idempotent. Directory views do not earn completed-question credit. Each question counts once when answered correctly within each practice run. New runs preserve history.

The two collapsible dashboards show completed questions and active study time by Hong Kong date. Hidden tabs and ten-minute inactivity pause timing. Timing batches are at most 60 seconds. An owner-specific local outbox retains pending events on network failure. Unfinished practice reconstructs from saved answers; returning after reload continues at the next unanswered question. The current run does not start until the initial account load has finished.

## Verification

- `node tools/test-polysemy-lab.mjs` — catalogue, spaced retry, legacy resume, metrics and private recordings, PGlite account isolation/expiry, atomic validation, idempotency, permissions.
- `node tools/test-shared-system-nav.mjs` — shared navigation regression.
- `PROFESSIONAL_QA_PLAYWRIGHT=/path/to/playwright/index.mjs node tools/test-polysemy-lab-browser.mjs [WebKit]` — local preview on port 8633, synthetic accounts and intercepted RPCs, full practice/resume, offline saving, idle clock and responsive layouts. `POLYSEMY_QA_BASE` can select a deployed origin. The SDK stub requires stripping SRI only in the intercepted test HTML; the shipped HTML retains SRI.

Live migration: `20260917015203_polysemy_lab_show.sql`. Existing login functions and Professional English tables are not modified.

## September 18 media and practice update

The replay engine folds saved answers (including legacy ordered runs), preserves completed questions, and shuffles remaining questions. A wrong answer is scheduled after 5–6 intervening answers. If reviews are due together, the oldest due question takes precedence. Near the end, already-correct questions provide the intervening practice; these do not earn extra completion credit. The persisted `round` field is the attempt number for that question. Original question IDs and database uniqueness constraints are unchanged.

`audio.json` maps all 33 question IDs to immutable MP3 files. Voices cycle in manual order: Kokoro af_heart (US female), Aura2 Aries (US male), Kokoro bm_fable (UK male), Kokoro bf_isabella (UK female). The shuffled question retains its assigned voice. All clips have 300 ms leading silence for mobile playback and were checked with independent speech recognition. `tools/generate-polysemy-audio.py` documents reproducible generation with model hash checks and in-memory credentials. Supply the manual-order sentences JSON and the established local model/voices paths. Merge the local/cloud manifest shards into `audio.json`.

`media.mjs` provides click-to-listen, optional recorder and the My Recordings view, including file upload, replay, download and failed-upload retry. `recording.mjs` uses a separate owner-keyed IndexedDB cache. The migration `20260918060607_polysemy_lab_media_shuffle.sql` adds a private, owner-scoped recording RPC with checked audio containers, 2 MB per recording and 100 MB per student. Only the authenticated transport plus a valid homework student token can access it; no public recording URLs exist. Sounds reuse the shared `edmund:answer-result` event.
