# 2022 B2 Golden Manual Compliance Index

Status: `V2 CORRECTION · READY FOR PROTECTED RELEASE`
Manual authority: `Paper_3_Super_Curation_Golden_Manual_2025_B2_v8.2_2026-11-05.pdf`
Manual coverage: all 183 pages inspected on 2026-11-11
Coding reference: `2025_B2_Super_Curation_Line_by_Line.md` (24,425 lines; indexed and reference hashes verified)
Target: `/paper3/2022-b2/` on correction branch from baseline `9c2f546bc7c108b05f884e49856e0a24075dd3b7`

## Source inventory

| Source | SHA-256 | Role | Coverage established |
| --- | --- | --- | --- |
| 2022 Complete Tapescript and Marking Scheme - source scan.pdf | `14da22577bcb07b43607e4635021d2691b4e241530910bcfb4d0f8c204fdc349` | Tapescript and marking authority | 33/33 pages rendered; Part B tapescript and Tasks 8-10 tables located |
| 2022 Paper 3 - local source scan (B2 pages unordered).pdf | `cab59106cf72107a84d6140850ca4fd52956460c2019e3cf27e271d75a5a1251` | Original page and answer-book provenance | 46/46 pages rendered; B2 Data File at scan pages 28-38 and B2 QAB at 39-46 |
| 2022 Paper 3 Answers and Marking Scheme.pdf | `dda06ed6db2a8905f8623345135b44be98262dc875578e35e993c2eeefefdd46` | Older answer/marking provenance | 33/33 pages inventoried |
| 2022 Part B2 Data File - complete ordered extract.pdf | `7b7533d3fe2372cd7e3aa24ef8c3d9aee7124a4061b9db7ea39f284c22de6b23` | Primary ordered Data File | 11/11 pages rendered and inspected |
| 2022_B2_Integrated_Skills_Benchmark_Essays_Revised_for_Review_2026-11-03.pdf | `456209d62d47d002d6093cd16d1b7d61fa7d2f0d1a10d2de735d7a0b32665934` | Required model essays and analysis | 108/108 pages rendered and inspected; final revised essays at PDF pages 7, 12 and 17 |
| 2022 DSE Listening.mp4 | `37d0a5871616ea31587524587055ae9b50333e476a77b6a81b8cb6f6bba7b9ab` | Authentic Part A and Part B recording | 51:11.610 inspected, transcribed for boundaries, and split into five verified tracks |

The printed handwriting on Data File page 3 is candidate annotation, not authoritative source content. Listening answers must come from the tapescript and an authentic recording.

## Governing manual map

| Manual reference | Requirement | Planned owner/evidence |
| --- | --- | --- |
| v8.2 pp. 1, 180-183 | v8.2 authority; atomic source coverage; separation; release evidence | This index; source inventory; exact-SHA release packet |
| Sections 01-17, pp. 46-79 | Source truth, task contracts, six types, five stages, model writing, test gates | 2022 source records, curation runtime, browser tests |
| Sections 23-30, pp. 124-132 | Navigation, marks, listening review, save slots, routes, acceptance | Runtime state schema and journey tests |
| Sections 31-44, pp. 133-151 | Motion, rewind, persistence, responsive and reduced-motion states | CSS/runtime assertions and screenshots |
| Sections 45-55, pp. 152-164 | Authentic note sheet, continuous podcast ownership, testing and publication | Page-3 textareas, cue manifest, real-media ledger, live SHA checks |
| 2025 line guide lines 1-38, 57-2689 | Lesson flow, state/re-entry and `super-curation.js` reference | 2022-specific adaptation; no copied 2025 content |
| 2025 line guide lines 10524-10779 | Authentic note-sheet/audio component reference | 2022 page-3 note fields and listening controls |
| 2025 line guide lines 11674-11927 | Supplied model essays and guides reference | Revised 2022 PDF pages 7/12/17 and analysis pages 18-108 |
| 2025 line guide lines 11928-13021 | Script loading and reader entry reference | Generated 2022 reader integration |

## Verified reference integrity

- `paper3/2025-b2/super-curation.js`: `220937e6b0f78e70299e1edbce13d82a90725783922524fb56832790ea727fef`
- `paper3/2025-b2/sentence-analysis-data.js`: `ae084d166e184eacd297b505ee4c6fda41e10d9aecdaeb425ba50ab779a1537e`
- `paper3/2025-b2/listening-notes.js`: `edbcbeb6648909442ed1fec3ffffe3c6669e268facc163fb1673ce34c55ac356`
- `paper3/2025-b2/model-essays.js`: `db089f462105a1fcc77fcffd26fcd1600f1e409369559de24cad32a686e0e9a7`
- `paper3/2025-b2/model-essay-guides.js`: `94020aeed5c51275f46a798553263e2db2198bb0e24da1b1d025db3abb3ed1c7`

## Task requirements

1. Preserve the existing native 19-page order: Data File 1-11, Task 8 pages 12-13, Task 9 pages 14-16, Task 10 pages 17-19.
2. Create a sentence-level source inventory in printed order, with one primary type and one learner Next step per unit.
3. Keep the authentic page-3 note sheet as the only listening note surface, with stable per-heading fields.
4. Regenerate all 2022 task mappings, categories, cues, routes and explanations; do not copy 2025 content.
5. Use only the revised supplied model essays and their supplied analysis.
6. Preserve learner answers, notes, bookmarks and save-slot state through regeneration and re-entry.
7. Add static, Chromium, Firefox, accessibility, responsive, reduced-motion, source-coverage, real-audio and exact-SHA live gates.
8. Publish only after the same commit passes build, deployment and cache-busted live verification.

## Implementation and verification evidence

| Requirement | Status | Evidence |
| --- | --- | --- |
| Complete paper order and source closure | PASS | Production-equivalent artifact contains 19 pages: 11 Data File + 8 QAB; original native paper remains unchanged |
| Six-type atomic source coverage | PASS | Chromium and Firefox each generate 160 ordered English source units with one primary type per unit |
| 2025 desktop architecture | PASS | Browser geometry verifies fixed five-stage rail, fixed 420 px left dock, central paper workspace, and fixed 288 px right evidence bank; obsolete `.curation-hub` count is zero |
| Five-stage learning route | PASS | Task instructions → classification → listening → sentence evidence → three writings; progress persists in five separate v2 save slots |
| Authentic note sheet and listening ownership | PASS | Original page-3 five-field note sheet retained; eight real-media cue transactions target those fields; no substitute note surface |
| Authentic media | PASS | Four Part A tracks + Part B podcast uploaded to R2; all five full public readbacks match recorded SHA-256 values; live DSE catalogue exposes five 2022 tracks |
| Revised essays and line-by-line analysis | PASS | Only the final reviewed versions from supplied PDF pages 7, 12 and 17 are digitised; 35 sentence-level guide records cite their evidence source |
| Persistence and re-entry | PASS | Chromium and Firefox journeys confirm original note-field persistence through reload; v2 exposes five selectable local save slots plus JSON import/export |
| Accessibility and responsive states | PASS | Keyboard-native controls, labels/live output, reduced-motion context, 390 px overflow assertion, desktop/mobile visual inspection |
| Search integration | PASS | Search index rebuilt: 3,353 text blocks across 13 years, including 2022 essays and podcast analysis |
| Regression and release tooling | PASS | 62 incremental-build/release-classification/release-coordinator unit tests pass; production-equivalent assembly and cross-browser journey pass |

The former recording stop condition was resolved when the user supplied the authentic 2022 recording. The official 33-page tapescript scan was re-rendered and OCR-located on 2026-11-11; Part B occupies source-scan pages 7–8 and the eight cue endpoints remain aligned to the authentic audio. No variance is in use. Publication remains conditional on the protected-branch checks, deployment workflow and cache-busted live verification of the exact commit.
