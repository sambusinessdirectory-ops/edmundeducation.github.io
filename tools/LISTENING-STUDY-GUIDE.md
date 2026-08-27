# Listening bookmarks and read-aloud practice

## Students

1. Log into the Listening system with the usual student account.
2. Choose IELTS. **我的書簽 · Bookmarks** is the first tile, before Practice 1, in either sort order.
3. In a transcript, select **收藏此行** to bookmark the sentence, or click an English word to bookmark it.
4. Open Bookmarks to see all saved Listening items. Search by text and filter by difficulty.
5. Set **1–5 stars**: 1 is easiest; 5 is hardest. Each saved bookmark has its own rating.
6. Choose **只重聽這一行** to play only that transcript row. It stops at the authored end time, including at slower/faster speeds. Words in a transcript replay their containing row. Untimed question/instruction bookmarks link back to the exercise rather than guessing an audio position.
7. Choose **朗讀練習** beside a row/bookmark, or **朗讀錄音** on a player.
8. Allow microphone access, start, pause/resume as needed, then finish to make an MP3. Preview it, save it, or download it.
9. Find saved files under **我的聆聽錄音** in the recorder. Play, download, or delete your own files. They are available on other devices after logging into the same student account.

Listening has a separate **100 MB (104,857,600 bytes) per-student total**. The Speaking allowance is untouched. As in Speaking, each recording is mono 64 kbps MP3, up to five minutes and 3 MB. Delete unwanted recordings to free space.

If saving fails, the MP3 stays in the open page. Retry Save or download a backup before leaving. A retry uses the same recording ID and does not charge storage twice. Switching away pauses an active recording. Leaving with an unsaved recording asks for confirmation; mobile operating systems can still discard a closed tab, so save/download first.

## Listening administrator

1. Select **管理員登入 · Listening Admin** from the login page, or open `listening-system.html?section=admin`.
2. Use the separately supplied Listening administrator credentials. They are not included in this guide or the website source.
3. The report shows the student, bookmarked text/context, difficulty and update time.
4. Search by student/content. Choose all, rated, or unrated bookmarks.
5. **匯出 CSV** exports the current filtered result, including links. Select all and clear the search to export everything.

Admin login is rate-limited to five attempts per minute for an account name. Sessions expire after eight hours. Student passwords are not changed by this feature.

## Implementation and deployment

- Frontend: `listening-system.html`, `.css`, `.js`; `listening-study.js`, `listening-study-core.mjs`, `listening-recorder.js`.
- Additive database setup: `supabase-listening-study-20260827.sql` (applied on 2026-08-27).
- Server: `supabase/functions/listening-study/` (deployed on 2026-08-27).
- Private bucket: `listening-recordings`. No public object access or browser Storage policies.
- Canonical student sessions are checked server-side. Admin sessions are separate and stored as hashes. Every student query is owner-scoped.
- The server reserves quota atomically, validates complete MP3 frames and duration, and retains pending/deleting records in quota until storage deletion succeeds. A pending upload may be retried from the original page or deleted after the 10-minute in-flight safety window. This prevents upload/delete races leaving hidden files.
- Admin provisioning uses an offline cost-12 bcrypt hash; use PostgreSQL-compatible `$2a$` format. Apache `htpasswd` emits `$2y$`, which this project's `pgcrypto` does **not** support directly. For an ASCII password, normalize the generated prefix to `$2a$` before provisioning and verify login. Never commit passwords/hashes, put passwords in shell arguments, or expose server keys in frontend code.
- Edge Function `verify_jwt=false` is deliberate: protected routes verify the site's existing custom student session or Listening admin token; a Supabase anonymous/publishable key is not sufficient authorization.
- Publish the frontend through the normal GitHub Pages release after reviewing/committing these changes. Server setup alone does not update the public webpage.

## Verification

Run:

```sh
node tools/test-listening-system.mjs
node tools/test-grammar-listening-practice1.mjs
node --test tools/test-listening-study.mjs
```

Browser QA: `node tools/listening-study-preview.mjs`, then open the printed localhost URL. The yellow banner identifies synthetic accounts/data. Its microphone is a generated tone; it does not record the user's microphone. The fixture does not send anything to the live database.

The opt-in `tools/test-listening-study-live.mjs` accepts a short-lived synthetic student token on stdin, uploads a generated tone, checks private download/idempotency/quota, then deletes its own recording. It must never use a student's existing session. After verification, remove the test sessions and seeded QA bookmarks, and archive the synthetic student using the normal `deleted_at` soft-delete. The existing student hard-delete protection must remain enabled.

Verified on 2026-08-27: existing portal/transcript tests; 10 new automated checks; local browser student/admin paths, row replay, star saving, real MediaRecorder-to-MP3 conversion using a synthetic stream, pause/resume/save, mobile/tablet layout; live admin login/report/logout; live private MP3 upload/download, duplicate retry, anonymous rejection, deletion/quota recovery; live rating persistence. Physical iPhone/iPad microphone permission and background suspension still need a device smoke test after the frontend is published.
