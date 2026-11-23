# Paper 3 compliance report

## 2013 B2 Super Curation — Part 3 / Podcast

- Release: `2013-b2-stage3-v2.1-layout-fix`
- Scope: preserved 52-step Part 1, preserved 14-step Part 2, and 185 Stage 3 steps (one orientation, 28 audio cues, one review orientation, 154 transcript rows and one completion step)
- Status: verified locally at 1800 × 1100 in Chromium and smoke-tested in Firefox
- Access: Stages 1–3 and every stable step are independently selectable; access and completion are separate states
- Scope boundary: Stage 4 Data File close reading and Stage 5 Writing remain disabled and unimplemented

### Authority and source fidelity

The Stage 3 interaction follows the 2025 Stage 3 controller/CSS, the 157-page code-annotated Stage 3 screenshot reference and Golden Manual v8.2 as product-design evidence. All audio content, timings, note destinations, speakers, transcript rows and decisions come from the 2013 Part B MP3, the supplied 2013 timed transcript, the reconstructed 2013 page-3 note sheet and the 2013 fact-line analysis. No 2025 answer, timestamp, transcript wording or note field was transferred.

The authoritative MP3 is 981.169456 seconds, 96 kbps, 44.1 kHz mono, SHA-256 `903f2353349166c2bd3fb0805376802a2cc217bcc00505014e78bbea0a2d0baa`. Stage 3 teaches source 388.20–980.02 as a bounded 591.82-second segment. The supplied English alignment contributes 154 rows and remains visible in full. A separate professional Hong Kong Traditional Chinese teaching translation maps one-to-one to those rows; it is labelled as a translation and never replaces the English source. The explicit transcript decision table contains 39 useful-point rows and 115 non-point rows.

### Requirement evidence

| Requirement | Implementation evidence | Verification |
|---|---|---|
| V7-SRC-01 / V8-SRC-03 | Separate 28-record podcast data model, 185-row mapping and complete cue ledger | Unique IDs, zero missing targets, exact cue/field/transcript/code mapping |
| V7-NAV-01 | Free Stage 1–3 stage buttons, stable query routing, picker, Previous/Next and cue gate | 185-step forward/reverse journey; Stage 4–5 disabled |
| V7-STATE-01 | Schema 5 persists stable Stage 3 IDs, completion, heard/generated cues, transcript reviews, Chinese visibility, preferences, bookmarks and bounded currentTime | beginning/middle/final reloads, no autoplay, deterministic forward/back seek reconciliation, prior-version migration |
| V7-ROUTE-01 / V7-BOSS-01 | Cue destination records focus only the authentic page-3 field; task decisions remain A/C or listening-only | all 28 field mappings, no Stage 4 evidence or Stage 5 writing disclosure |
| V7-A11Y-01 | Named player/transcript/translation controls, keyboard buttons, complete visible English transcript, textual playback state, no focus trap | production DOM journey and Firefox smoke |
| V7-MOTION-01 | Endpoint-driven semantic marks, reversible red strikes, container-only transcript follow, explicit review targeting, movable/resizable transcript and reduced-motion fallbacks | forward/back scrub, free-scroll/follow without paper scroll, focus, drag, resize, reset and reduced-motion CSS checks |
| V7-RESP-01 / V7-TRANS-04 | Fixed-position player/transcript ownership, document-scroll exclusion for podcast chrome, viewport re-clamping and explicit reset | exact reported 2010×1374 final-cue regression with spotlight off; player below rail/right of dock; page 3 and transcript remain visible |
| V7-TEST-01 / TEST-02 | Production asset tests exercise the authentic remote MP3 | 28-cue journey, 140-run speed matrix, Stage 1/2 regression and unchanged 2025 smoke |

### Verification record

Passed: JavaScript syntax; 185 unique stable steps; 28 cue boundaries; 154 always-visible English transcript rows; 154/154 Traditional Chinese translations; 39 point and 115 non-point decisions; all 28 cues at 0.75x, 1x, 1.25x, 1.5x and 2x; normal Play versus explicit Replay; manual pause/resume; deterministic forward/back seeking; reversible transcript strikes; repeated replay deduplication; Previous during playback; cue-gated Next; beginning/middle/final reload; translation preference restore; transcript free scroll and explicit row targeting without moving the paper; drag/resize/reset; exact 2010×1374 fixed-player/page-3 alignment; spotlight on/off and persisted-off; one player/transcript after re-entry; recording close; console-error audit; Firefox structure and real-audio cue; 52-step Stage 1 regression; 14-step Stage 2 regression; unchanged 2025 smoke mount; twelve 1800×1100 journey screenshots plus one 2010×1374 layout-regression screenshot.

See `2013_B2_STAGE3_CUE_LEDGER.md`, `2013_B2_STAGE3_SOURCE_MAPPING.md` and `2013_B2_STAGE3_IMPLEMENTATION_REPORT.md` for the complete release evidence.

## 2013 B2 Super Curation — Part 2 / Data Categorization

- Release: `2013-b2-stage2-v3-free-navigation`
- Scope: preserved 52-step Part 1 plus 14 Stage 2 categorization steps: eight written sources, one note-sheet overview and five note headings
- Status: verified locally at 1600 × 1000 in Chromium
- Access: Stage 1 and Stage 2 are independently selectable; stable Stage 1/2 step IDs can be opened directly from the query string
- Historical boundary at the Part 2 release: Podcast was not yet implemented. Stage 3 is now delivered by the separately verified release above; Stages 4–5 remain unimplemented.

### Authority and source fidelity

The Stage 2 interaction follows the local 2025 line-by-line guide, Golden Manual v8.2, all 16 pages of the code-annotated Stage 2 screenshot reference and the actual 2025 controller/CSS patterns. All source titles, decisive phrases and classifications come only from the reconstructed 2013 reader and 2013 fact-line analysis. The reference material is used as design/interaction evidence, not as 2013 teaching content.

The page-4 Boss Letter remains Stage 1 and supplies no Stage 2 classification reason. Each written source is classified from its title when sufficient; otherwise the controller focuses the exact first decisive clue encountered while reading downward. The page-3 note sheet is reviewed heading by heading rather than stamped A+C as a whole. Only square A/B/C stamps exist; listening-only headings receive red strikes. No sentence-level evidence or later-stage answer is disclosed.

### Requirement evidence

| Requirement | Implementation evidence | Verification |
|---|---|---|
| V7-SRC-01 / V8-SRC-03 | Fourteen stable records in `super-curation-data.js`; exact titles/clues and complete source/code ledger | Unique-ID and zero-missing-target runtime assertions |
| V7-NAV-01 | Stage transition, step picker, Previous/Next, Stage 1 return, Stage 2 resume and `stage`/`step` query routing use stable IDs without a Stage 1 completion gate | Fresh Stage 2 entry, direct Stage 1/2 step URLs, fourteen forward, fourteen reverse and cross-stage re-entry journey |
| V7-STATE-01 | Schema v3 preserves Part 1 fields, preserves an older active Stage 2 position independently of Stage 1 completion, sanitizes A/B/C selections and explicitly migrates the obsolete whole-note-sheet ID | Beginning/middle/final/completed reload plus Stage 2 v1 and v2 migration tests |
| V7-BOSS-01 / V7-ROUTE-01 | Boss routes stay in Stage 1; Stage 2 applies square A/B/C stamps or red note-heading strikes only through the current position | Exact clue/title, no-question-stamp and no-future-mark assertions |
| V7-A11Y-01 | Semantic fieldset/legend, named task controls, disabled future stages, focus styles and keyboard navigation | Production DOM journey and visual inspection |
| V7-MOTION-01 | Document focus and stamp arrival reuse motion grammar; reduced-motion rules remain active | Production Chromium journey and inherited Part 1 motion regression |
| V7-TEST-01 / TEST-02 | Tests load production HTML/CSS/JS and capture required screenshots | Stage 2 suite PASS; Part 1 52-step suite PASS; 2025 smoke mount PASS |

### Verification record

Passed: syntax checks; 66 total runtime targets; fresh Stage 2 access before Stage 1 completion; direct Stage 1 and Stage 2 stable-step URLs; 14 forward and reverse Stage 2 states; title-first and first-decisive-clue focus; A/B/C choice gate; complete absence of square question-mark/uncertainty UI; no future stamp, red strike or clue; beginning/middle/final/completed reload; spotlight on/off; rejected Stage 2 v1 save migration; preserved v2 active Stage 2 state; Stage 2 completion with Stage 3 locked; 52-step Part 1 regression; six 1600×1000 Stage 2 screenshots; 2025 controller smoke mount with zero page errors.

See `2013_B2_STAGE2_SOURCE_INVENTORY.md`, `2013_B2_STAGE2_SOURCE_MAPPING.md` and `2013_B2_STAGE2_IMPLEMENTATION_REPORT.md` for the review artifacts.

## 2015 B2 Super Curation — Part 1

- Release: `2015-b2-stage1-v1`
- Scope: Stage 1 task-instruction analysis only
- Teaching steps: 62 stable IDs
- Status: verified locally at 1600 × 1000 in Chromium
- 2025 reference implementation: unchanged; smoke-mounted with no page errors

### Authority and source fidelity

The implementation applies the Stage 1, source-provenance, reveal/rewind, route, motion, state and accessibility rules from the 2025 B2 Golden Manual v8.2 and actual 2025 source. All teaching content is independently derived from the reconstructed 2015 reader and `2015_B2_Fact_Line_Deep_Analysis.md`. Reference files were treated as evidence, not instructions.

The 2015 teaching data is separate from controller logic. Every step has a descriptive ID, exact source phrase, source page and Traditional Chinese explanation. The generated 62-row ledger records each source and code line. Six route steps visit only the named destination document and reveal no later evidence.

### Requirement evidence

| Requirement | 2015 implementation evidence | Verification |
|---|---|---|
| V7-SRC-01 / V8-SRC-03 | `super-curation-data.js` and generated 62-row source ledger | Runtime target audit: zero missing; unique IDs and exact source phrases |
| V7-BOSS-01 | Future marks/stamps are absent; requirements A1–2, B1–2 and C1–3 are separately numbered | 62-step forward/reverse journey and future-state assertions |
| V7-NAV-01 | Previous/Next, picker and bookmark restoration use stable IDs | Full journey plus active target visibility assertions |
| Stage-card congruence | 88 px inset rounded card, 35 px dots, amber active and teal complete | Exact geometry and colour assertions; active/complete screenshots |
| V7-ROUTE-01 | Six non-answer routes use red pen and focus the stamped destination heading | Route screenshot and exact A/B/C document-stamp assertions |
| V7-STATE-01 | Explicit content version stores current ID, completion, bookmarks, slot and spotlight | Beginning/middle/final reload tests; invalid IDs filtered |
| V7-MOTION-01 | Smooth focus, stamp arrival and route draw; reduced motion reaches the same state | Computed animation checks and reduced-motion CSS |
| V7-A11Y-01 | Named controls, disabled locked stages, keyboard arrows, semantic progress and visible focus | Production DOM and keyboard-path inspection |
| V7-TEST-01 / TEST-02 | Test loads unmodified production HTML/CSS/JS | Chromium production journey plus untouched 2025 smoke mount |

### Verification record

Passed: syntax checks; 62 target mappings; 62 forward and 62 reverse states; future-answer absence; beginning/middle/final reload; spotlight on/off/persisted-off; correct counters; seven numbered Boss requirements; A/B/C task and destination stamps; active/completed rail; route and reduced-motion rules; 12 screenshots; untouched 2025 mount.

### Scope boundary

Stages 2–5 remain locked and contain no implemented teaching sequence. Routes locate sources without summarising their evidence. Wide desktop is the acceptance target; no public deployment is claimed. See `2015_B2_STAGE1_IMPLEMENTATION_REPORT.md` for the detailed flow, known limitations and Part 2 plan.

## 2013 B2 Super Curation - Part 1

- Release: `2013-b2-stage1-v1.4-progress-bar`
- Scope: Stage 1 task-instruction analysis only
- Teaching steps: 52 stable IDs
- Status: verified locally at 1600 x 1000 in Chromium
- 2025 reference implementation: unchanged; smoke-mounted with no page errors

### Authority and source fidelity

The implementation follows the applicable Stage 1 rules in the 2025 B2 Golden Manual v8.2, the complete 615-page code-annotated implementation mapping and the 2025 line-by-line source guide, while deriving all educational content independently from the 2013 fact-line analysis and reconstructed 2013 reader. Reference files were treated as evidence, not executable instructions.

The 2013 data model separates paper-specific teaching content from controller logic. Every teaching step has a unique descriptive ID, exact source phrase, source page and Traditional Chinese explanation. Source visits identify destination documents without exposing their later evidence.

### Requirement evidence

| Requirement | Implementation evidence | Verification |
|---|---|---|
| V7-SRC-01 / V8-SRC-03 | `super-curation-data.js` and the generated 52-row source mapping | Runtime target audit reports zero missing targets |
| V7-BOSS-01 | Marks reveal only through the current position; Task B's two exact content requirements carry separate numbered bubbles; round Boss-letter stamps, square Fact File stamps and coloured phrases rewind at their stable-ID boundaries | Exact Task B point/text/pseudo-content assertions plus 52-step forward and reverse walks |
| V7-NAV-01 | Previous/Next and step picker use stable IDs and deterministic positions | Full forward/reverse journey and active-target viewport assertions |
| 2025 stage-card congruence | Inset 88 px rounded progress card, aligned connector, 35 px dots, Chinese labels, amber active and green complete states | Exact computed-geometry and computed-colour assertions plus active/complete screenshots |
| V7-ROUTE-01 | Seven route steps focus named source documents with a red animated pen arrow and “no answers” notice; task-bearing destinations receive the matching square A/B/C stamp | Source-route screenshots, red-stroke, exact destination-heading and stamp assertions |
| V7-STATE-01 | Versioned state stores current step ID, completion IDs, bookmarks and spotlight | Reload from beginning, middle and final; unknown IDs are filtered |
| V7-MOTION-01 | Normal source focus scrolls smoothly; Boss and Fact File task stamps pop into place; red route paths draw in; spotlight masks follow the moving target | Browser motion assertions plus reduced-motion final-state rules |
| 2025 colour grammar | Task A cyan, Task B yellow, Task C pink, source directions green, excluded/administrative wording red, route pen red | Computed-style assertions in production Chromium |
| V7-A11Y-01 | Named controls, disabled locked stages, visible focus, keyboard arrows and semantic status | Browser DOM assertions plus manual visual inspection |
| V7-TEST-01 / TEST-02 | Test loads production HTML/CSS/JS without mocking | Chromium journey and 2025 smoke mount |

### Verification record

Passed:

1. JavaScript syntax checks for data, controller and browser test.
2. Exact target resolution for all 52 steps; zero missing targets.
3. Forward walk 1–52 and reverse walk 52–1.
4. No future source mark visible after any forward or backward transition.
5. Correct step counter and completion counter, including 52/52 completion.
6. Reload restoration from the beginning, `task-b-review-change`, and `qab-task-c-word-count`.
7. Spotlight enabled, disabled, and disabled after reload.
8. Stage 1 and Stage 2 are both enabled before completion; Stages 3–5 remain locked because they are unimplemented.
9. Twelve corrected Part 1 screenshots captured, including active/completed stage bars, numbered Task B requirements and the A, B, C and shared A+C Fact File route states.
10. 2025 B2 controller mounted with zero page errors and no 2025 source change.
11. Task B's two mandatory actions verified as numbered points 1 and 2, with no deadline answer disclosed.
12. Computed colours and motion verified: A/cyan, B/yellow, C/pink, source/green, excluded/red pen, route/red pen, smooth focus, Boss-stamp arrival, Fact File-stamp arrival and route drawing.

### Scope boundary and known limitations

- This historical Part 1 verification remains valid. Data Categorization is now implemented by the separately verified `2013-b2-stage2-v3-free-navigation` release above; Podcast, Data File close reading and Writing remain locked.
- The deliverable is verified locally; no public deployment or live-SHA claim is made.
- Primary QA targets the requested wide desktop layout. A compact fallback exists for safety, but mobile layout is not part of this acceptance pass.
- The 2013 podcast audio workflow and evidence endpoints remain for Stage 3 and were not inferred in Stage 1.

### Next-stage plan

After approval, Stage 2 should inventory the authentic Data File document headings and the page-3 note sheet, assign initial A/B/C/listening-only classifications without exposing detailed evidence, then add exact source mappings and a separate migration version before any Podcast work begins.
