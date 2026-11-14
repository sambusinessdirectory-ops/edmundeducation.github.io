# 2019 B2 Matched-State Browser Test Report

**Machine result:** PASS — 137/137 core assertions (61 static + 76 browser), plus 73/73 focused Stage 1–5 assertions, zero failures.<br>
**Browser run:** `2019-b2-browser-conformance-v2`, generated 2026-11-14T09:24:12.624Z against the release candidate at `http://127.0.0.1:8768`.<br>
**Human visual result:** PENDING — automated and author visual inspection do not substitute for independent human approval.

## Executable suites

| Suite | Result | Scope |
|---|---:|---|
| `work/validate-2019-curation.mjs` | 61/61 PASS | Dataset identity, seven-status counts, provenance, manifests, models, 281-state writing architecture, source mappings, UI ownership, persistence and audit manifest |
| `work/test-2019-curation-browser.cjs` | 76/76 PASS | Real interaction states in Chromium and Firefox, matched reference states, writing source reopen/return, responsive and reduced-motion behaviour |
| Focused Stage 1–5 suites | 73/73 PASS | 10 + 15 + 19 + 16 + 13 assertions, including full completion gates for Stages 4 and 5 |

## Matched-state coverage

- Fresh state: five chapters, 420 source units, seven decisions, 107 cues, one audio owner, five save slots and no horizontal overflow.
- Categorisation: canonical answer hidden until learner interaction; persistent accessible task/route stamps; exact rejected span and truthful empty-filter state.
- Route and evidence: coherent M12 path, immediate source visit, exact return with one M13 ghost, one-clone M14 transfer, duplicate/Type-6 guard and 700 ms missing-event fallback.
- Listening: six authentic page-3 textareas, no synthetic worksheet, no premature cue completion, two-character/28 ms typing, user interruption, replay guard, rewind reconstruction and all 107 reduced-motion cue transactions.
- Writing: 12 draft-first states, 47 title/heading/sentence teaching units, 111 source visits, 111 explicit returns, stable source IDs, red evidence-bank consumption, navy exact-span use, podcast-note mirror and exact return to draft.
- Persistence: slot isolation, validated export/import, conservative v1–v7 migration, per-task writing position/rewind, reload restore and versioned v8 state.
- Accessibility/layout: keyboard unit navigation, accessible stamp labels, live states, 1440/1100/768/390 widths, 200% visual scale, print, reduced motion, Firefox geometry and lifecycle.
- Negative/error state: no console warnings or page errors in the tested Chromium, mobile and Firefox runs.
- Release-specific regression: a first live run exposed relative preview-image requests after the Pages media rewrite; the preview now derives its URL from the already rewritten native scan, and the full local suite passes with no 4xx console errors.

## Key verified values

| Property | Verified value |
|---|---:|
| Atomic source units | 420 |
| Decision distribution | 137 / 72 / 33 / 33 / 68 / 69 / 8 across the seven canonical statuses |
| Authentic transcript cues | 107, 0.05–986.06 seconds |
| Native listening fields | 6 |
| High-value units | 89: 86 model-mapped, 3 rationalised |
| Model sentences | Task 8: 12; Task 9: 8; Task 10: 16 |
| Model word counts | Task 8: 171; Task 9: 123; Task 10: 210 |
| Stage 5 teaching units | Task 8: 16; Task 9: 10; Task 10: 21; total 47 |
| Stage 5 exact source visits / returns | 111 / 111 |
| Stage 5 total states | Task 8: 88; Task 9: 70; Task 10: 123; total 281 |

## Tested viewports and engines

Chromium exercised 1440×900, 1100 px, 768 px, 390×844, 200% page scale, normal motion, reduced motion and print. Firefox exercised startup, geometry, native-note state, one-audio ownership and reload lifecycle. The suite also opened the 2025 reference in matched five-stage and writing states to verify the transferred architecture rather than merely comparing selectors.

## Visual proof bundle

`outputs/2019-b2-visual-proof/` contains route, cue, essay-consumption and reduced-motion frame sequences plus four WebM traces. Machine inspection confirmed visible exact destination/return, authentic-field typing, navy source use and reduced-motion end state. Independent human review remains required.

## Result boundary

This report establishes deterministic machine conformance. It does not certify perceived timing, visual polish or absence of subjective jank; those remain the explicit human sign-off gate.
