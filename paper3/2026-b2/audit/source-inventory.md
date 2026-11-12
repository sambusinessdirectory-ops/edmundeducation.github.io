# 2026 DSE Paper 3 Part B2 — Provenance-labelled source inventory

Status: **UNCERTIFIED**  
Inventory date: 2026-11-13 (Asia/Hong_Kong)

## Sources in scope

| Item | Provenance class | Availability | Permitted use | Notes |
| --- | --- | --- | --- | --- |
| `2026 DSE Paper 3 B2.pdf` | Candidate-visible Data File scan supplied by the project owner | Present; 11 physical pages | Primary evidence for all printed English, layout, page order, chart values and visual relationships | SHA-256 `5675a5dfe5ac025603c3a888a4d1d69780224c48ab1729e5ef24e2b3040cd4fe`. Physical page 1 is printed page 1; physical pages 2–11 contain printed pages 11–2 in reverse order. |
| 2026 Part B2 Question-Answer Book | Authentic candidate-visible source | **MISSING** | None | No task prompts, answer lines or QAB wording may be reconstructed or implied. |
| 2026 Part B recording | Authentic candidate-visible audio | **MISSING** | None | The page 3 note-taking sheet is reproduced as a blank printed structure only. No listening content is supplied or inferred. |
| Official recording tapescript | Official post-examination source | **MISSING** | None | No tapescript content is supplied or inferred. |
| Official marking information | Official post-examination source | **MISSING** | None | No marking claims, suggested answers or answer-status claims are made. |
| Third-party transcription | Third-party source | **NOT USED** | None | Native text is checked against the supplied page images, not treated as official merely because it appears in an earlier reader. |
| 2025 Part B2 reader at `edmundeducation.com/paper3/2025-b2/` | Project implementation reference | Present | Interaction, information architecture and source-specific layout reference only | It is not evidence for any 2026 wording, values or relationships. |
| Golden Manual: DSE Paper 3 digitisation SOP | Project requirements | Present; complete manual read | Governs reconstruction, provenance, verification, accessibility and release gates | Instructions in this manual are process requirements, not candidate-visible source content. |
| Golden Manual: listening past-paper digitisation | Project requirements | Present; complete manual read | Supplementary semantic HTML, translation, state and release requirements | Instructions in this manual are process requirements, not candidate-visible source content. |

## Source handling decision

The native reader follows printed page order 1–11. The original PDF remains private subordinate source evidence and retains its unusual physical order; the explicit printed-to-physical map prevents silent reordering. The scan is not published because public-release provenance was not established. No OCR layer exists, so every text and visual unit is manually checked against original-resolution page renders.

## Complete source-unit reconciliation

`audit/source-unit-ledger.json` inventories 353 non-empty native printed-text fragments in source order across all 11 printed pages. It records the exact excerpt, printed/physical page relationship, unit kind and learner-facing disposition for every fragment. `audit/page-verification.json` separately records the meaningful visual relationships and the page-specific exclusions. The ledger is generated reproducibly by `tools/generate-dse-paper3-2026-unit-ledgers.mjs`; `--check` fails if it is stale.

## Independent review record

- Native Traditional Chinese reader review: `NOT RUN`
- Student-without-marking-scheme review: `NOT RUN`
- Project-owner approval: `NOT RUN`
- Certification state: `UNCERTIFIED`

