# 2026 Part B1 reader — unit-level defect/change register

Status before rebuild: **OPEN**  
Rebuild disposition: **D01–D09 RESOLVED; D10 machine gates passed, independent human gates NOT RUN**

| ID | Scope | Defect found in the pre-rebuild reader | Required change | Verification evidence |
| --- | --- | --- | --- | --- |
| B1-D01 | Whole reader | No provenance-labelled inventory existed before implementation. | Add and maintain `audit/source-inventory.md`. | File presence and content test. |
| B1-D02 | Pages 1–10 | Source record listed titles but did not record page-level inspection outcomes, visual elements, exclusions or proof status. | Add a complete page-proof ledger and expose its status in the reader. | `audit/page-verification.json`; UI proof panels. |
| B1-D03 | Source exception | Handwriting exclusion was disclosed globally but not reconciled page by page. | Record candidate-mark exclusions on every affected physical page and never reproduce them. | Page ledger plus text/scan regression checks. |
| B1-D04 | Reader architecture | Large hand-authored page HTML made source-unit reconciliation and regression testing brittle. | Replace with a structured, source-ordered semantic reconstruction with stable page and unit anchors. | DOM and source-unit tests. |
| B1-D05 | Page 3 | Blank listening headings and missing recording status were not tied to a page-specific evidence statement. | Preserve only the six printed headings; identify the recording as missing and notes as deliberately blank. | Page 3 visual comparison and exact-heading tests. |
| B1-D06 | Page 7 | Chart fidelity depended on visible text checks only. | Rebuild the chart with accessible labels, exact 73/12/15 values, a stated 100% base, and native selectable labels. | Exact-value, sum and accessibility tests. |
| B1-D07 | Page 10 | Two related tables required explicit row/column relationship checks. | Rebuild as semantic tables with exact headers, price key, values and last-page statement. | Table-cell ledger and browser inspection. |
| B1-D08 | State | Saved notes/progress lacked schema-version migration and reset controls. | Version stored state, preserve autosave, expose a scoped reset, and test persistence. | Browser persistence test. |
| B1-D09 | Filters/navigation | Filtering hid pages without updating result status or ensuring the current navigation target remained available. | Add live result count/status and reset to all pages on navigation. | Keyboard/mobile interaction tests. |
| B1-D10 | Release gate | No documented mobile, desktop, print, overflow or independent review record accompanied the reader. | Add machine checks and truthful review status; keep artifact uncertified until human gates run. | QA report and screenshots. |

## Change closure

- D01–D09: `RESOLVED` in the rebuilt native reader and regression suite.
- D10 machine checks: `PASS` in Safari at desktop and mobile viewports; print rules and overflow checks pass.
- D10 independent native-reader, student and project-owner checks: `NOT RUN`.
- Certification remains `UNCERTIFIED`.

### Completion-audit correction

- B1-D11: OCR-assisted comparison found that the bilingual HKEAA cover copyright line, the continuation arrow/text on printed pages 3, 5, 7 and 9, and the page 7 source heading were not rendered. They are now restored as native selectable text and source-specific visual elements. `RESOLVED`.

