# 2026 Paper 3 B1/B2 native-reader QA report

Run date: 2026-11-13 (Asia/Hong_Kong)  
Overall state: **MACHINE-VERIFIED / UNCERTIFIED**

## Source and static integrity

- `node tools/test-dse-paper3-2026-readers.mjs`: `PASS`
- `node tools/generate-dse-paper3-2026-unit-ledgers.mjs --check`: `PASS`
- `git diff --check`: `PASS`
- B1: 10/10 native page sections and 10/10 page-proof panels present.
- B2: 11/11 native page sections and 11/11 page-proof panels present.
- B1 source SHA-256: `785a1052ad4bc70f59489dac48ad7ca14c0e265e98317851857c415977713a64`.
- B2 private source SHA-256 equals `5675a5dfe5ac025603c3a888a4d1d69780224c48ab1729e5ef24e2b3040cd4fe`; the raw scan is not published because public-release provenance was not established.
- B1 marked scan is not published; candidate handwriting is excluded page by page.
- B2 printed-to-physical mapping verified as `1,11,10,9,8,7,6,5,4,3,2`.
- Missing QAB, recording, official tapescript and official marking information are disclosed; none is reconstructed.
- A second Apple Vision OCR-assisted comparison was run across all 21 original-resolution page renders. OCR was treated only as an aid; flagged differences were manually checked against the page images. This recovered the cover copyright lines, four continuation arrows per reader and three source headings that the first test suite had not covered.
- The reproducible source-unit ledgers reconcile 324 B1 and 353 B2 native printed-text fragments in source order. Visual relationships and documented exclusions remain in the page-verification records; the ledger check fails if generated evidence and reader HTML diverge.

## Safari browser verification

Browser: Safari 18.5 via WebDriver.

| Check | B1 | B2 |
| --- | --- | --- |
| Desktop viewport | 1440 × 1000, no horizontal overflow | 1440 × 1000, no horizontal overflow |
| Mobile viewport | 390 × 844, no document-level horizontal overflow | 390 × 844, no document-level horizontal overflow |
| Native pages | 10 | 11 |
| Inline Chinese units | 98 | 115 |
| Page-proof panels | 10 | 11 |
| Editable note fields | 6 | 6 |
| Visual filter | Pages 7 and 10 only | Page 8 only |
| Mobile navigation | Jump menu shown; desktop sidebar hidden | Jump menu shown; desktop sidebar hidden |
| Saved state | Note and read checkbox persisted after reload; scoped cleanup passed | Shared interaction layer verified |
| Chart values | 73/12/15 pie and page 10 tables covered by static checks | 54/33/13, 91/2/7 and 82/12/6 returned from three accessible chart tables |

## Print and accessibility controls

- Print stylesheet includes A4 page settings, one source page per printed page, visible native text, visible tables and editable note lines.
- Translation visibility is switchable and persisted separately from notes.
- Filters announce the visible page count through a live status region.
- Save state is announced through a live status region.
- Keyboard focus styles, skip link, semantic tables, chart data tables, native headings and language attributes are present.
- Reduced-motion preference is respected.

## Review gates not run

- Native Traditional Chinese reader review: `NOT RUN`
- Student-without-marking-scheme review: `NOT RUN`
- Project-owner approval: `NOT RUN`

The readers therefore remain `UNCERTIFIED`; this report does not claim those independent reviews occurred.

