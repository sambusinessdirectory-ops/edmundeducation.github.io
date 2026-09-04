# DSE Part A bilingual study guides

Scope: 2012–2021 and 2023, four Part A tasks each. 2022 and 2024–2026 are excluded. Part B, recordings, reconstructed illustrations and student records are outside this change.

The 2021 author-provided guide and the user-approved 2023 material are the teaching-style references. New years contain authored reference answers, not official HKEAA marking schemes. Each question has an explanation and an evidence quote matched to its own year's transcript. Every existing transcript cue has a Traditional Chinese counterpart. Question translations preserve blanks and do not automatically reveal answers.

## Replay

`analysis.audioTime` identifies an answer-bearing cue; `audioEnd` records the supporting span. Replay seeks to `max(0, audioTime - 15)` in the current year's task recording, keeps the selected playback speed and never writes to student answers. Cues follow the existing split recordings. The 2021/2023 helpers interpolate word positions within longer transcript cues; these are navigation estimates, not fresh forced alignment.

Replay is available in both the full analysis cards and floating answer analysis. Native multi-select, ordering, ranking and maze controls receive their own numbered answer tools outside clickable input labels.

## Reproducibility

- 2012–2014: `build-2012-2014-guides.mjs 2012 2013 2014 --check` and individual `YEAR-guide-content.mjs` sources.
- 2015–2017: `build-2015-2017-guides.mjs YEAR --check`; default output is generated JSON on stdout.
- 2018–2020: `build-2018-2020-guides.mjs 2018 2019 2020 --check`.
- 2023: `build-2023-guide.mjs --check`.
- 2021/2023 replay support: `enrich-existing-dse-guides.mjs --check`. Run without `--check` after reimporting the approved 2021 PDF.
- Search: `build-search-index.mjs --check` (run without `--check` to rebuild).

Archive structural/content checks: `node tools/test-dse-listening-archive-guides.mjs`.
Isolated actual-renderer browser checks: `node tools/test-dse-listening-archive-guides-ui.mjs`, using `PLAYWRIGHT_MODULE` if needed. The harness blocks remote traffic and mocks account writes. `DSE_GUIDE_YEARS` can narrow diagnostic checks; release validation uses all 11 years.

Source correction: 2014 Task 2, John's printed view on Hong Kong comics is **?**, not ✓. Verified against `assets/dse-listening/2014/paper-page-5.jpg`; corrected the same cell in the English question asset and its layout source. No numbered answer fields were changed.

Source correction: 2019 Task 2's printed example is **Mentor (example) Mine**. Restored the omitted trailing **Mine** in the question asset and layout source, verified against `assets/dse-listening/2019/paper-page-7.jpg`. This is an unnumbered example, not a student answer.
