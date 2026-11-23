# 2013 B2 Super Curation — Stage 3 implementation report

## Outcome

Stage 3 now delivers the complete 2013 *Travel Report* guided-listening experience and stops before Stage 4. It contains **185 stable teaching steps**:

1. one note-sheet/player orientation step;
2. 28 authentic audio cue steps;
3. one transcript-review orientation step;
4. 154 aligned English transcript-review steps; and
5. one Stage 3 completion step.

The learner can freely open Stages 1, 2 or 3. Access does not falsely mark an earlier stage complete. Stage 4 (Data File close reading) and Stage 5 (Writing) remain disabled and contain no teaching sequence.

## Teaching flow

The opening step locates the original Data File page-3 note sheet and explains the difference between normal Play and explicit Replay. Each cue then plays the actual 2013 MP3 to a verified answer boundary, pauses once, focuses the correct original field, renders a separate generated note, and explains the decision in Traditional Chinese. The sequence distinguishes:

- listening-only reasons, statistics and unusual-hotel details;
- Task A evidence about international travel in the past;
- personal opinion and contextual speech;
- the prison-cell correction (cell, but not locked; the guest has a key);
- negative tourism context that Task C should not use as its positive main case;
- the safety qualification that limits the crime discussion;
- Task C revenue, infrastructure and cultural-preservation evidence; and
- the complete programme close, which generates no note.

All 154 supplied English timing rows remain visible from the start; no row is replaced by an unlock placeholder. As the playhead crosses each endpoint, 39 usable-point rows receive their listening/task treatment and 115 non-point rows receive the 2025-style red strike across utterance copy only. Rewinding removes later treatment. The optional “中文對照” layer supplies one professionally edited Hong Kong Traditional Chinese line for every English row while retaining the English source. Related rows also carry Task A/Task C, correction and qualification states; unresolved source turns remain explicitly unresolved.

## Recording and transcript provenance

- Recording: `DSE 2013 Part B.mp3`
- Authoritative catalogue: `https://edmund-neural-audio.edmundeducation.workers.dev/v1/listening/catalog`
- Full duration: **981.169456 seconds**
- Format: **MPEG Layer III, 96 kbps, 44.1 kHz, mono**
- SHA-256: `903f2353349166c2bd3fb0805376802a2cc217bcc00505014e78bbea0a2d0baa`
- Taught source segment: **388.20–980.02 seconds**
- Display duration: **0:00–9:51.82** (591.82 seconds)
- English transcript: the supplied timed `partB` array, source indices 18–171 (154 rows)
- Traditional Chinese teaching translation: 154 authored Hong Kong Traditional Chinese rows, mapped one-to-one to the supplied English timing rows and presented as a translation rather than a source transcript
- Cue timing: derived from the actual MP3 and supplied 2013 timed alignment, with explicit replay starts and endpoints recorded in `super-curation-podcast-data.js`

The complete 28-row audit, note-field inventory, cue-to-field map, cue-to-transcript map and correction/rejection table are in `2013_B2_STAGE3_CUE_LEDGER.md`. The 185-row step-to-source/code ledger is in `2013_B2_STAGE3_SOURCE_MAPPING.md`.

## Original note-sheet fields

| Field | Original learner control | Stage 3 use |
|---|---|---|
| Why people travel | `textarea[data-note="3-1"]` | Three listening-only reasons |
| Information about travel and tourism in the past | `textarea[data-note="3-2"]` | Task A historic-travel evidence and context |
| Adrian's statistics | Four authentic table rows | India given; USA country; China visitors; Spain country and visitors |
| Unusual hotels | `textarea[data-note="3-3"]` | Ice-hotel and prison-hotel details, correction and opinion |
| Effects of travel and tourism | `textarea[data-note="3-4"]` | Negative context, qualification and Task C positive evidence |

Generated content is rendered in separate output containers. Learner-entered text is retained through cue completion, backward navigation and reload.

## Verified correction to the preserved reader

The previously reconstructed Adrian statistics table did not preserve the authentic distribution of printed values and blanks. It is corrected to the source layout:

- `India | 76 million` is printed as the given example;
- the next row has a blank country and printed `59 million`;
- the `China` row has a blank visitor count; and
- the final row has both country and visitor count blank.

The four learner controls now have stable individual `data-note` keys. The old aggregate `data-note="3-statistics"` control remains hidden solely to preserve older local data. This correction does not change any Stage 1 or Stage 2 stable ID, classification or target heading; both earlier-stage regression suites pass unchanged in teaching behaviour.

## Interaction and state architecture

- Paper-specific cue/provenance/note-field data is isolated in `super-curation-podcast-data.js`.
- Shared 2013 controller logic builds the 185-step sequence by stable descriptive ID.
- A single persistent audio element backs one fixed desktop player; re-entry never creates a duplicate player or autoplays.
- Normal Play resumes at the current position. Explicit Replay seeks to the current cue's replay start.
- A session/endpoint guard pauses once per run and deduplicates heard/generated cue IDs.
- Slider seeking is deterministic: moving forward materialises every crossed cue, generated note and transcript mark; moving backward removes all downstream notes, marks and completion state.
- Supported rates are 0.75x, 1x, 1.25x, 1.5x and 2x.
- The floating transcript supports follow mode, learner-controlled free scrolling, explicit review targeting, drag, resize and reset.
- Save schema 5 persists current Stage 3 ID, completed IDs, heard/generated cues, transcript-review completion, bookmarks, spotlight, transcript-follow and Chinese-layer preferences, playback speed, cue-pin visibility and bounded audio currentTime.
- Restoration filters by stable IDs, so inserting or reordering steps does not silently shift progress.
- Generated notes and transcript marks are reconciled directly from the playhead on every scrub, so no later answer survives a backward seek.

## Verification results

All tests load the production HTML/CSS/JavaScript. No test injects a substitute player or mocked lesson DOM.

| Test | Result |
|---|---|
| Stage 3 structural/source audit | PASS — 185 unique steps, 28 unique cues, 154 transcript reviews, zero missing targets |
| Complete Stage 3 learner journey | PASS — 185 forward states, 185 reverse states, cue gates, counters and final completion |
| Authentic audio cue pass | PASS — all 28 explicit replay intervals stop at their declared endpoint |
| Playback-speed matrix | PASS — 28 cues × five supported rates (140 authentic-audio runs) |
| Normal Play vs Replay | PASS — Play resumes; Replay returns to the declared cue start |
| Seek/manual scroll/window controls | PASS — forward seek restores crossed notes/marks, backward seek removes later state; free scroll disables follow; explicit review targets the row; drag/resize/reset pass |
| Transcript visibility/classification | PASS — 154 English rows always visible; 39 point rows; 115 non-point rows; strikes affect copy but not speaker labels |
| Traditional Chinese layer | PASS — 154/154 translated rows, toggle on/off, English retained, preference restored after reload |
| Reload/state | PASS — beginning, middle and final restoration; bounded currentTime and learner text retained; no autoplay |
| Spotlight | PASS — enabled and disabled; disabled state has zero visible masks and persists through reload |
| Stage 1 regression | PASS — all 52 steps forward/reverse, three reloads, prior routes/stamps/motion and 2025 smoke mount |
| Stage 2 regression | PASS — all 14 steps forward/reverse, migration, no future marks, six screenshots |
| Firefox desktop smoke | PASS — 185/28/154 inventory, stage locks and one authentic MP3 pause cue |
| JavaScript syntax | PASS — data, controller, mapping and browser tests |
| Existing 2025 implementation | PASS — unchanged source; existing controller mounts with zero page errors |

### Wide-desktop screenshots

The verified 1800×1100 screenshot set is in `outputs/2013-b2-stage3-v2/`:

1. `01-first-step-spotlight-on.png`
2. `02-chinese-line-by-line.png`
3. `03-forward-seek-reveals-notes-and-strikes.png`
4. `04-active-cue-before-playback.png`
5. `05-generated-note-automatic-pause.png`
6. `06-task-a-evidence.png`
7. `07-middle-qualification.png`
8. `08-correction-cue.png`
9. `09-task-c-evidence.png`
10. `10-spotlight-off.png`
11. `11-transcript-review.png`
12. `12-final-stage-complete.png`

Together they show the first step, complete bilingual transcript, forward-seek note/strike restoration, floating audio controls, active/paused cue states, generated notes, Task A/Task C decisions, a correction, transcript review, non-spotlight usability and final completion.

## Files created or modified for Stage 3

- `paper3/2013-b2/index.html`
- `paper3/2013-b2/super-curation-data.js`
- `paper3/2013-b2/super-curation-podcast-data.js` (new)
- `paper3/2013-b2/super-curation.js`
- `paper3/2013-b2/super-curation.css`
- `tools/paper3/check-2013-b2-stage1.mjs` (access-state regression expectation only)
- `tools/paper3/check-2013-b2-stage2.mjs` (access-state regression expectation only)
- `tools/paper3/check-2013-b2-stage3.mjs` (new)
- `tools/paper3/check-2013-b2-stage3-speed-matrix.mjs` (new)
- `tools/paper3/build-2013-b2-stage3-mapping.mjs` (new)
- `docs/paper3/2013_B2_STAGE3_CUE_LEDGER.md` (new)
- `docs/paper3/2013_B2_STAGE3_SOURCE_MAPPING.md` (new)
- `docs/paper3/2013_B2_STAGE3_IMPLEMENTATION_REPORT.md` (new)
- `docs/paper3/PAPER3_COMPLIANCE_REPORT.md`
- `tools/paper3/paper3-compliance.json`

No file under `paper3/2025-b2/` is modified.

## Known limitations

- The supplied English alignment usually labels a turn generically as “Travel Report guests”. Named speakers are shown only where the 2013 source evidence resolves the turn; other contextual rows deliberately remain unresolved.
- The supplied source has no independently authored Chinese transcript. The Chinese layer is therefore explicitly a professional teaching translation of the aligned English, not presented as original-source wording.
- Cue timing is sentence/turn aligned rather than word-level. All implemented endpoints are marked high confidence and are protected by a small drift tolerance.
- Wide desktop is the acceptance target. Existing compact safety CSS remains, but no mobile Stage 3 design or screenshot is claimed.
- Audio availability depends on the authoritative remote recording service; the interface reports playback failure and keeps progress safe if that service is unavailable.

## Part 4 plan — not implemented

After approval, Part 4 should inventory each 2013 Data/Fact File sentence, create stable evidence IDs, map only Task A/B/C-relevant claims, preserve source order and qualification, and connect Stage 1 routes plus Stage 2 classifications to exact evidence without changing Stage 3 heard/generated state. It should add its own source ledger, saved-state migration, forward/reverse/reload/spotlight tests and desktop screenshots. No Part 4 extraction or answer is present in this release.
