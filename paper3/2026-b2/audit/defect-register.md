# 2026 Part B2 reader — unit-level defect/change register

Status before rebuild: **OPEN**  
Rebuild disposition: **D01–D09 RESOLVED; D10 machine gates passed, independent human gates NOT RUN**

| ID | Scope | Defect found in the pre-rebuild reader | Required change | Verification evidence |
| --- | --- | --- | --- | --- |
| B2-D01 | Whole reader | No provenance-labelled inventory existed before implementation. | Add and maintain `audit/source-inventory.md`. | File presence and content test. |
| B2-D02 | Pages 1–11 | Source record listed titles but did not record page-level inspection outcomes, visual elements or proof status. | Add a complete page-proof ledger and expose its status in the reader. | `audit/page-verification.json`; UI proof panels. |
| B2-D03 | Page order | The reverse physical scan order appeared only as an array, without learner-facing explanation or per-page proof. | Display and test the printed-to-physical map for every page. | Source panel and exact mapping test. |
| B2-D04 | Reader architecture | Large hand-authored page HTML made source-unit reconciliation and regression testing brittle. | Replace with a structured, source-ordered semantic reconstruction with stable page and unit anchors. | DOM and source-unit tests. |
| B2-D05 | Page 6 | Forum posts and the Bangkok email are functionally separate sources on one printed page. | Keep separate source blocks and separate navigation/filter labels without merging their evidence. | Page 6 unit ledger and DOM structure test. |
| B2-D06 | Page 8 | Three charts require exact categories, values, axes, percentage units and a stated survey base of 140. | Rebuild as accessible native charts and retain every value: 54/33/13, 91/2/7 and 82/12/6. | Chart-value and relationship tests. |
| B2-D07 | Pages 9–11 | Social comments, telephone turns and chat bubbles need distinct speaker/date relationships. | Rebuild each as its own semantic source-specific layout with all turns in source order. | Exact speaker/date/turn-count tests. |
| B2-D08 | State | Saved notes/progress lacked schema-version migration and reset controls. | Version stored state, preserve autosave, expose a scoped reset, and test persistence. | Browser persistence test. |
| B2-D09 | Filters/navigation | Filtering hid pages without updating result status or ensuring the current navigation target remained available. | Add live result count/status and reset to all pages on navigation. | Keyboard/mobile interaction tests. |
| B2-D10 | Release gate | No documented mobile, desktop, print, overflow or independent review record accompanied the reader. | Add machine checks and truthful review status; keep artifact uncertified until human gates run. | QA report and screenshots. |

## Change closure

- D01–D09: `RESOLVED` in the rebuilt native reader and regression suite.
- D10 machine checks: `PASS` in Safari at desktop and mobile viewports; print rules and overflow checks pass.
- D10 independent native-reader, student and project-owner checks: `NOT RUN`.
- Certification remains `UNCERTIFIED`.

