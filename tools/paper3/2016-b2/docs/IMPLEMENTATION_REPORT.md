# 2016 B2 Super Curation — Stage 3 implementation report

## Delivered contract

- 61 freely accessible Stage 3 steps: 2 setup, 13 cue stops, 44 transcript turns, 1 verification and 1 completion step.
- A single Stage 3 state owner for active step, audio time/rate, heard cues, generated-note ownership, bookmarks, help drafts, transcript placement, pins and completion.
- Complete MP3 controls: play/pause, seek, exact cue pins, replay, 0.5×–3× speed, and elapsed/duration display.
- Four authentic Data File page 3 textareas only. Each receives a stable ID and accessible heading relation; no duplicate worksheet exists.
- Twelve generated notes across the four native fields. Replay is idempotent. Rewind retracts future generated notes but retains learner-authored text.
- Movable, four-corner-resizable 44-turn transcript with a complete line-by-line Traditional Chinese translation toggle, source-name normalisation, exact selective Task A/B/listening-point colouring, and red rejection lines across every remaining non-point word. Rejection ink applies to copy only, never speaker labels.
- Task evidence bank contains only heard Task A/B evidence. Six listening-only cue notes remain in the native sheet but never enter A/B/C.
- Stage 1 annotations remain visible in Stage 3; Stage 2 can be entered directly; every Stage 3 step is directly selectable; Stages 4 and 5 remain disabled.
- The readable data/controller sources stay versioned under `tools/paper3/2016-b2/source/`; Pages publishes a deterministic gzip runtime plus a tested loader, keeping the full-site artifact within its fixed size budget without removing functionality.

## Deliberate exclusions

- The boss letter receives no page stamp because it governs all three tasks rather than supplying task content.
- The redundant “你會先標哪個任務？” prompt is absent.
- The podcast heading has no question-mark badge.
- Task colouring is phrase-level, not whole-sentence or whole-row highlighting.
- Stage 2 owns the podcast-subheading category badge while it is active. Stage 1 and Stage 3 heading badges remain in the DOM for state preservation but are hidden during Stage 2, so the farmhouse and plough headings show exactly one rounded-square B/A stamp.

## Reference fidelity audit

- Golden Manual pages 28–29: a rejection line crosses utterance copy only; exact useful spans remain selective rather than colouring the whole turn.
- Golden Manual pages 65–66: Traditional Chinese uses a natural Hong Kong teaching register, preserves source meaning, and every filler/Type 6 span receives red ink.
- Golden Manual pages 127–128: listening-sheet decisions stay beside their authentic headings; transcript review classifies exact spans and strikes irrelevant speech.
- Golden Manual pages 157, 163 and 170: per-heading marks must not be duplicated as page-level decisions; transcript speech keeps separate speaker/copy columns and hides translations until requested.
- The complete 157-page 2025 Stage 3 code-annotated reference was inspected. Its late review states (including pages 120, 140 and 157) establish the persistent red-line treatment for non-points and corrections.

## Verification targets

Static validation covers the 4/13/44/61 cardinalities, 44 non-empty Traditional Chinese translations, 21 point-bearing turns, 23 fully rejected turns, zero overlapping semantic spans, stable IDs, endpoints, field mapping, source text preservation, MP3 hash/metadata, script order and Stage 4/5 lock. Browser validation covers direct entry, real media endpoint commits, typing, replay, rewind, persistence, free navigation, 44/44 translation rows, zero uncovered transcript text nodes, copy-only rejection ink, selective listening/task spans, single Stage 2 heading stamps, drag/resize, Stage 1/2 regression, responsive layout, and Chromium/Firefox lifecycle.
