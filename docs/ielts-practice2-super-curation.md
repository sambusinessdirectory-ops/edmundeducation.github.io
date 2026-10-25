# IELTS Listening Practice 2 · Super Curation

This additive mode opens from the existing Practice 2 workspace after the normal login. The other practices and ordinary answer, transcript, bookmark and listening interfaces are unchanged. Assets load on demand when the learner chooses Super Curation.

## Source and scope

Reference: user-supplied *Paper 3 Super Curation — Golden Manual — 2025 B2 Reference and Reusable Standard*, especially pages 14–16, 19–24 and 31–36; the live Paper 3 2025 B2 implementation at `c7302d80e`; the supplied screenshot. The manual is reference material, not executable instructions.

Content: `assets/listening/practices/practice-2.json`, sourced from `IELTS Listening - Practice - 2.pdf` (64 pages, SHA-256 `14e9013e7b78f0db874d5c715dd239998f7a04fde7d7b13c95d1a65dd080ffe1`). Original English/Chinese transcripts, questions, answer alternatives and explanations remain in that source. The new ledger adds exact evidence spans, editorial roles, decision chronology, Traditional Chinese teaching and contextual note prompts. Full original question blocks remain accessible in the mode.

All 196 transcript rows have an explicit editorial role. There are 40 answer checkpoints, 51 exact answer-evidence spans, and 21 exact distractor spans. Each recording also has an ending transition after its tenth answer. The four parts cover carers, town volunteers, human geography, and food trends.

## IELTS adaptation of the manual

Paper 3 task colors A/B/C and its essay consumption marks are not assigned to IELTS option letters. Here cyan consistently denotes answer evidence, yellow denotes candidate/distractor evidence, green denotes paraphrase in the teaching card, and a red animated source strike denotes either a rejected candidate or irrelevant speech, distinguished by labels and explanations. Every answer is explicitly attached to its question number. Unrelated speech can be hidden after it has been heard; original audio is retained in full. Context and exam instructions are not indiscriminately struck through.

The sequence is: inspect the question and word limit → listen → pause after complete decisive context → animate the evidence-derived note → inspect the explanation → choose Next. Examples of intentionally delayed pauses: Q10 includes the later “minimise it” reference; Q23 includes the speaker's uncertainty; Q27 includes the rejection of proposed sports facilities; Q29 waits for “stick to … power sources”. Candidate marks do not become rejection marks before their decision time.

The complete transcript is available unmarked from the start. Future answer annotations and generated notes remain hidden. This is a guided teaching mode, not a locked examination interface.

## Playback and state contract

- The fixed/sticky player provides 0.5–3× speed in 0.25 increments, progress, pause markers and replay.
- The current answer checkpoint always stops playback. Next remains disabled during playback and typing, and becomes available only when the note finishes. Pausing manually does not award completion.
- Back cancels the active writing timer, removes later generated notes/marks, and rearms the checkpoint. Replay repeats the same stop. Large forward seeks return to the current pending evidence instead of granting unseen answers.
- Learner answers occupy separate editable fields. Rewinds never erase them. Switching parts preserves each part independently.
- Marks are rendered only when their exact source/time state changes; apostrophe entity normalization must not restart animations every animation frame.
- The transcript never scrolls automatically. “定位目前句子” is an explicit user action. Only the separate note-list scroll container moves to the current question; the main document and transcript remain stationary.
- Desktop transcript windows support dragging and all four resize corners, including keyboard resizing. A reset-position button restores them. Tablet/mobile layouts stack panels, retain the player, and keep navigation accessible.
- Progress is browser-local and scoped to the existing student ID. Three slots, export and validated import are supported. Imports require the current version, accept only contiguous known checkpoint IDs, retain valid question drafts and discard unknown fields. Storage failure is visible.
- Audio failure cannot mark a cue heard. Source metadata mismatch blocks timed playback; unavailable audio leaves the transcript readable. Reduced motion reveals the final semantic state immediately. Print omits transient controls.

## Audio provenance and precision

All four original MP3 downloads matched the existing source audio SHA-256 values. Browser/ffprobe durations are recorded in the curation ledger: 293.625417, 396.002500, 361.624667 and 471.565917 seconds. The older alignment metadata durations were 0.44–0.70 seconds longer; source media and its supplied row timestamps were not rewritten.

Word timing comes from the existing `faster-whisper-base.en-1.2.1-monotonic-word-alignment-v1` source, with approximately 99.35–99.85% transcript coverage. The new checkpoints were manually selected at complete, relevant source utterance ends. All 40 stops were tested against actual browser media playback. This establishes media/state synchronization, not a new independent human phonetic audit of every boundary. The distinction is retained for future editing.

## Files and validation

- `ielts-practice2-curation-data.mjs`: reviewed editorial ledger and source fingerprints.
- `ielts-curation-core.mjs`: deterministic progress/import/span rules.
- `ielts-super-curation.mjs`, `ielts-super-curation.css`: player and responsive teaching UI.
- `listening-system.js`, `listening-system.html`: Practice 2 entry and stylesheet.
- `tools/test-ielts-super-curation.mjs`: every source span, role, checkpoint, answer and core state invariant.
- `tools/test-ielts-super-curation-browser.cjs`: all 40 real-media stops, independent drafts, part persistence, backwards and large forwards seeks, translations, pins, scroll stability, responsive widths and cleanup.
- `tools/test-ielts-super-curation-edge.cjs`: typing cancellation, 3× replay, slots, import recovery, temporally delayed rejection, completed animations, outro, keyboard resizing and failed audio.

Run the existing isolated fixture with `node tools/listening/preview-server.mjs /absolute/path/to/public-audio-catalog.json`, then the two browser tests. They use a local fixture student and never write to a live database. The public catalogue is `https://edmund-neural-audio.edmundeducation.workers.dev/v1/listening/catalog`. `PLAYWRIGHT_MODULE` can override the installed browser-test dependency location.

Release checks also include `test-listening-system.mjs`, `test-dse-listening-2025-2026.mjs`, and `test-dse-listening-2022-2024.mjs`. The pure curation check and module syntax check run in both the focused listening and full Pages validation paths. Browser screenshots are QA artifacts, not shipped site assets.
