# DSE 2018 Part A · Super Curation pilot

The 2018 workspace opens a shared Super Curation player for Tasks 1–4 (Q1–51). It retains the approved IELTS layout, Chinese explanations in the left dock, automatic note writing, try-first per-question reveal, five-second backward/forward controls, floating bilingual transcript, noise filtering, evidence bank and browser-local save slots/import/export. Other DSE years and Part B remain outside this pilot.

## Sources and editorial decisions

The source is the existing `dse-listening-2018-data.js`, its original question-page images and the bilingual `assets/dse-listening/2018/guide.json`. Every authored answer explanation is preserved verbatim. These are authored reference answers, not an official marking scheme. The Paper 3 Golden Manual and the existing IELTS implementation provide the interaction standard; the manual is reference material rather than executable instructions.

`tools/listening/dse2018-curation-review.mjs` explicitly reviews all 51 questions: contextual question text, a pre-answer listening target, evidence-to-note mapping, replay start and a complete-context ending. The generated root-level `dse-curation-data/2018.json` contains 41 chronological stops for 51 numbered answers, 96 exact evidence spans, six rejected-reading spans and an editorial role for every one of 322 bilingual rows. Linked answers pause together where the complete shared statement is needed. Fixed-position groups (Q3–4, Q14–15, Q35–37) are distinguished from any-order lists.

- Task 1 keeps the opening weekend conversation because it answers Q1–6. Greetings can be struck without losing the question-bearing continuation of a mixed row. The final topic waits for the rejection for insufficient research.
- Task 2 confirms top/exit and bottom/entrance together, after the speaker corrects the initial guess. Q17 waits for the monster confirmation; Q18 includes the final move to F4 and confirmation of survival. Students mark O/M in editable keyboard-accessible grids. Revealed model routes are separate grids; no reveal, rewind or task switch overwrites student cells.
- Task 3 retains the printed numbering but follows Q32 → Q31 → Q30 → Q33 in the recording. Original painting circles are accessible beside the corresponding notes. The three graphics blanks share their complete statement and paraphrase. The pause for *funny* waits for *humorous*, rejecting *weird*.
- Task 4 waits for all three agreed definition points, then both sides of the disagreement about life. The rat example includes *sometimes* and the purpose of letting the weaker rat win. Context and valid facts belonging to another field are not falsely marked as rejected answers.

The original question layouts, translations and scanned pages are available under “完整原題與作答指示”. The original audio remains intact. Noise is marked or hidden only after it has been heard. In try-first mode, answer-specific annotations, solutions and explanations wait for that question’s reveal; the transcript itself remains readable as in the approved guided mode.

## Recording checks

All four original public MP3s were downloaded and fingerprinted. `dse2018-curation-audio.json` records their URLs, SHA-256 values and actual media durations: 393.9, 540.2, 536.9 and 561.3 seconds. Existing transcript timings exclude trailing answer-tidying silence, so the player finishes after the narrator’s final instruction rather than forcing students to wait through that silence.

The existing cue boundaries were independently cross-checked with the installed faster-whisper-base.en model against those MP3s. Normalized transcript coverage was 98.94%, 99.45%, 99.66% and 99.94%; no matched row endpoint differed by more than 0.8 seconds. The model omitted Task 2’s final single-word “Exactly”; the existing guide’s row was retained. This is a machine cross-check plus editorial review, not a claim of a fresh independent human phonetic audit.

The check recovered missing narrator material: two ending rows in Task 3 and four opening rows in Task 4. These six rows and their Traditional Chinese translations are included only in the curation adapter; the archive’s established row/bookmark identifiers are unchanged. No word-count interpolation was used.

## State and compatibility

The shared player now derives task counts and question ranges from its ledger. IELTS’s public API, Practice 2 ledger/version and existing saved-progress keys remain compatible. DSE has a separate identity (`dse2018-part-a`) and browser key, and imports from another exam/year are rejected. Student maze drafts are stored alongside free-text drafts in that identity. Rewind retracts later reveals and notes but preserves drafts.

The DSE adapter checks question/guide fingerprints and catalogue audio URLs before opening. Fingerprints canonicalize the production asset-host prefix because Pages rewrites known source images. The new curation JSON lives outside `assets/` so it ships with Pages rather than requiring a new asset-pack upload.

## Validation

- `node tools/listening/build-dse2018-curation.mjs --check`: deterministic source/ledger reproduction.
- `node tools/test-dse2018-super-curation.mjs`: all 51 questions, exact evidence, temporal rejection, complete route/decision endpoints, grouped/out-of-order progress, per-task counts, source explanations and exam-isolated import rules.
- `node tools/test-dse2018-super-curation-browser.cjs`: real-media stops for all 51 answers, per-question manual reveals and verbatim explanations, original images, maze click/keyboard input and draft preservation, reload and mobile controls.
- `node tools/test-dse2018-super-curation-edge.cjs`: animated maze solution, all four real outros, foreign import rejection and changed-source guard.
- Existing IELTS pure/all-practice tests, representative real-media browser checks, player edge/reveal suites and existing Listening/DSE archive tests cover compatibility.

Browser checks use the isolated local fixture student. They do not write live student accounts or progress. Audio tests establish stop/state synchronization and playback compatibility; source alignment precision remains subject to the limits documented above.
