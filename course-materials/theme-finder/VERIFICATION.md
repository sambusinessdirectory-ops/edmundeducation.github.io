# Theme finder verification — 28 October 2026

## Scope and coverage
- [x] DSE speaking: all 3,102 group/individual questions from 282 sets.
- [x] IELTS speaking: 828 Part 1 questions, 153 Part 2 cue cards, 564 Part 3 questions.
- [x] DSE reading: all 45 catalogue papers, 2012–2026, Parts A/B1/B2.
- [x] IELTS reading: all 437 actual catalogue passages (the supplied estimate was 450+).
- [x] No missing IDs, duplicate IDs, empty labels or invalid themes.
- [x] 25 bilingual themes; multiple relevant themes permitted.

## Classification method
The generator scans source titles, questions and full reading paragraphs. Weighted subject signals supply candidate labels. All 282 DSE speaking set contexts and IELTS speaking topic contexts have explicit editorial mappings. Speaking questions can add strongly signalled secondary subjects. Reading titles and candidate labels were reviewed; ambiguous titles were checked against passage text and explicit corrections recorded in `tools/theme-overrides.json`. This is a topic classification review, not a new factual/editorial review of every exercise.

The classification audit records source hashes, text lengths and signals. The `lowConfidence` flag refers to the original automatic signal score, not the subsequent editorial context mapping. No source exercise content is changed.

## UI and regression checks
- [x] Existing question-type finders retained.
- [x] English/Traditional Chinese theme and content search.
- [x] Year and section filters where applicable; reset and empty state.
- [x] Pagination, per-theme counts and multi-label explanation.
- [x] Speaking links resolve to exact source questions/cue cards.
- [x] Reading links resolve to existing source papers/passages.
- [x] IELTS speaking results respect existing part/book access checks.
- [x] Native buttons, keyboard focus, status announcements and responsive CSS.
- [x] Component DOM tests: search, reset, filtering, pagination, opening and remount.
- [x] JS syntax checks and existing discussion-timer regression test.
- [x] Desktop browser visual inspection of shared finder.
- [ ] Physical mobile-device check (not performed).
- [ ] Authenticated end-to-end student account check (not performed).

Run `node tools/test-theme-finder.mjs` for source/coverage checks; append `--dom` when the existing tools/email-qa jsdom dependencies are installed. The native paper-view regression depends on image assets omitted by this local sparse checkout; the full-checkout deployment workflow runs it.

Publication is tracked separately from source validation and only confirmed after GitHub Pages deployment and live asset verification.
