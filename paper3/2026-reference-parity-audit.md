# 2025 B2 reference → 2026 B1/B2 parity audit

Audit date: 2026-11-13 (Asia/Hong_Kong)  
Reference: `https://edmundeducation.com/paper3/2025-b2/`  
Targets: `https://edmundeducation.com/paper3/2026-b1/`, `https://edmundeducation.com/paper3/2026-b2/`  
Method: live Safari 18.5 DOM, interaction and responsive inspection after production deployment

The 2025 page is an implementation and interaction reference. It is not evidence for any 2026 wording, value, layout relationship or answer. Every 2026 source claim instead comes from the project-owner-supplied B1/B2 Data File PDFs and the corresponding source records.

## Requested parity

| Capability | 2025 B2 reference | 2026 B1 | 2026 B2 | Result |
| --- | --- | --- | --- | --- |
| Native selectable source text | Present | Present | Present | PASS |
| Traditional Chinese document language | `zh-Hant` | `zh-Hant` | `zh-Hant` | PASS |
| Inline Traditional Chinese support | Present | 98 units | 115 units | PASS |
| Source-specific native layouts | Email, transcript, blog, poster, chat, tables | Email, transcript, article, pie chart, chat, tables | Email, transcript, article, forum, comments, charts, chat, tables | PASS |
| Persistent editable fields | Present | 6 note fields | 6 note fields | PASS |
| Reading progress | Present | 10 page checks | 11 page checks | PASS |
| Content filters | Present | Data File, visual/table and listening-note filters | Data File, visual/table and listening-note filters | PASS |
| Responsive layout | No horizontal overflow in live Safari | No horizontal overflow | No horizontal overflow | PASS |
| Print stylesheet | Present | Present | Present | PASS |
| Missing-source disclosure | Present | QAB/recording disclosed missing | QAB/recording disclosed missing | PASS |

## 2026 evidence improvements

The 2026 readers additionally expose features not present as explicit controls/evidence in the live 2025 reference:

- one page-proof panel for every printed Data File page;
- provenance record, page-verification record and complete source-unit ledger links;
- live filter-result status;
- scoped saved-state reset;
- explicit print control;
- switchable translation control;
- source SHA-256 and printed-to-physical page mapping;
- `UNCERTIFIED` and independent-review status visible to learners.

## Source-dependent differences

| 2025-only material | 2026 disposition | Reason |
| --- | --- | --- |
| Six supplied recording-transcript pages | Not reproduced | No 2026 recording or official/supplied tapescript was provided. Inventing or importing wording would violate source fidelity. |
| PP writing-practice workspace | Not reproduced | No 2026 Question-Answer Book or official task wording was provided. The requested deliverable is the Data File reconstruction, and task prompts must not be inferred. |
| 2025-specific analysis notes | Not carried over | They concern different source material and cannot evidence 2026 facts or answers. |

## Conclusion

The 2026 readers match or improve the requested 2025 implementation capabilities while preserving the stricter 2026 source boundary. No 2025-only content was copied into 2026 without authentic 2026 evidence. This is a machine/operator parity finding only; it does not replace the pending native-reader, student-without-marking-scheme or project-owner reviews.
