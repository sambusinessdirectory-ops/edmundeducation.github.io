# 2016 B2 Super Curation — Stage 3 implementation report

## Delivered contract

- 61 freely accessible Stage 3 steps: 2 setup, 13 cue stops, 44 transcript turns, 1 verification and 1 completion step.
- A single Stage 3 state owner for active step, audio time/rate, heard cues, generated-note ownership, bookmarks, help drafts, transcript placement, pins and completion.
- Complete MP3 controls: play/pause, seek, exact cue pins, replay, 0.5×–3× speed, and elapsed/duration display.
- Four authentic Data File page 3 textareas only. Each receives a stable ID and accessible heading relation; no duplicate worksheet exists.
- Twelve generated notes across the four native fields. Replay is idempotent. Rewind retracts future generated notes but retains learner-authored text.
- Movable, four-corner-resizable 44-turn transcript with Chinese toggle, source-name normalisation, exact selective Task A/B phrase colouring, and red Type 6 strike-throughs.
- Task evidence bank contains only heard Task A/B evidence. Six listening-only cue notes remain in the native sheet but never enter A/B/C.
- Stage 1 annotations remain visible in Stage 3; Stage 2 can be entered directly; every Stage 3 step is directly selectable; Stages 4 and 5 remain disabled.

## Deliberate exclusions

- The boss letter receives no page stamp because it governs all three tasks rather than supplying task content.
- The redundant “你會先標哪個任務？” prompt is absent.
- The podcast heading has no question-mark badge.
- Task colouring is phrase-level, not whole-sentence or whole-row highlighting.

## Verification targets

Static validation covers the 4/13/44/61 cardinalities, stable IDs, endpoints, field mapping, selective-highlight phrases, source text preservation, MP3 hash/metadata, script order and Stage 4/5 lock. Browser validation covers direct entry, real media endpoint commits, typing, replay, rewind, persistence, free navigation, translation, drag/resize, Stage 1/2 regression, responsive layout, and Chromium/Firefox lifecycle.
