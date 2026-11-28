# 2016 B2 Super Curation — Stage 4 Implementation Report

## Outcome

Stage 4 (Data File / Fact File / 逐句取證) is implemented for the seven approved 2016 source documents only. It contains 148 stable fact-line/visual steps in Data File page order, preserves all four authoritative analysis fields, and stops with Stage 5 locked.

## Architecture

- The authoritative Markdown is parsed deterministically into a committed audit JSON and generated runtime data.
- Runtime source and controller are compressed into a deterministic gzip payload loaded after Stage 3.
- Stage 4 owns a separate versioned local-storage record. Stage 1–3 storage is read only for handoff and is not migrated or rewritten.
- Exact targets use scoped, punctuation-tolerant text ranges. CSS Custom Highlights avoid destructive DOM wrapping and permit overlapping evidence without blanket paragraph colouring.
- Visual records use explicit selectors for the survey table, plough photograph and thumbs-up approval.
- Search, free step selection, bookmarks, help drafts, forward/backward recomputation, spotlight, persistence and keyboard navigation use stable IDs.
- A right-side A/B/C bank accepts only confirmed direct evidence. Type 6, provisional, contextual, duplicated and rejected material is excluded.

## UI and reference fidelity

- Five-stage rail with Stage 4 active and Stage 5 disabled.
- Left evidence dock shows the exact excerpt/visual description, Traditional Chinese translation, type, decision and all four analysis explanations.
- Current evidence remains visibly outlined with spotlight on or off.
- Persistent colours match the reference architecture: A cyan, B yellow, C rose, contextual/hint green and rejected red strike.
- Rounded-square A/B/C stamps display confirmed or revised classification state.
- Four-mask spotlight preserves the dock, rail, bank and exact source region.

## Native source correction

The reconstructed page 10 was missing the printed “Sources of materials…” publication acknowledgement, although it is an authoritative fact-line record. The exact statement was restored immediately before the existing final-page boundary so every Stage 4 line has a native target. No task content was changed.

## Earlier-stage integration

The only approved Stage 3 controller change is the rail boundary: Stage 4 becomes enabled when its runtime handshake exists; Stage 5 remains disabled. The Stage 3 gzip was rebuilt deterministically. Chromium and Firefox Stage 3 lifecycle regressions pass unchanged apart from the intentional Stage 4 unlock expectation.

## Generated and authored deliverables

- `2016_B2_STAGE4_SOURCE_INVENTORY.md`
- `2016_B2_STAGE4_SOURCE_MAPPING.md`
- `2016_B2_STAGE4_EVIDENCE_LEDGER.md`
- `2016_B2_STAGE4_CHRONOLOGY_UPDATES_REJECTIONS.md`
- `2016_B2_STAGE4_CLASSIFICATION_BANK_ROUTES.md`
- this implementation report
- browser/static test scripts and browser report
- three Stage 4 screenshots in `test-results/2016-b2-part4/`
- Part 5 plan, kept separate and unimplemented

## Verification summary

- 148/148 stable records parsed with no missing analysis field.
- 148/148 exact browser targets; zero adjacent/approximate fallbacks.
- 37 bank rows at completion: A 12, B 12, C 13.
- Rewind, persistence, free access, search, bookmark, help, spotlight, revisions and final lock verified.
- Exact-target indexing completed in 7 ms in the final Chromium test run; cached canonical source models avoid repeated full-document scans.
- Normal motion: one flight clone maximum and zero leaks; reduced motion: no clone with the same semantic bank result.
- Stage 3 static and Chromium/Firefox browser regressions pass.

## Matching ambiguities

No ambiguity remains unresolved. Bracketed subjects, ellipses, smart punctuation and split header/table cells are canonicalised only for matching; the learner still sees the exact authoritative excerpt. Three non-text units use explicit visual selectors. The staff-manual title uses its exact sibling heading selector. `[Recording ends]` retains its literal bracketed target. The publication acknowledgement was restored to the native page rather than approximated against adjacent final-page text.

## Screenshot catalogue

`test-results/2016-b2-part4/` contains separate wide-desktop captures for the first step, spotlight, non-spotlight, Task A, Task B, Task C, multi-task evidence, correction, rejection, classification revision, source detour, return route, evidence-bank revisit and final completion.

The old untracked Stage 1/2 static scripts in this worktree still assert an obsolete Stage 2 cache-buster string (`20261122-stage2-v3`) while the approved page already uses `20261123-stage2-v4`; that stale assertion is unrelated to Stage 4 and those user-owned files were not modified.
