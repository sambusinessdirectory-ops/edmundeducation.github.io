# 2014 B2 Super Curation Part 2 source mapping

Part 2 implements Stage 2 Data Categorization only. It contains 14 learner steps: one transition, one decision for each of 12 relevant source documents, and one completion/re-entry step. Kerry Lam's task email remains the Stage 1 task contract and is therefore not classified again as a Stage 2 source document.

Classification is a revisable working hypothesis. The interface saves independent A/B/C choices, allows multi-task combinations, and provides an exclusive `暫未確定` state. No sentence-level evidence, podcast answer, data-file answer bank, or model writing is included.

| Stable ID | Page | Exact DOM target | Document | Type | Writer / institution | Intended reader | Date | Initial | Possible after close reading | Status |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `p2-p03-pet-club-notes` | 3 | `#page-3 .conference-notes > h2` | Pet Club podcast note sheet | Listening route / note sheet | Exam-set note form | Joey / candidate | — | A + C | A + C | Sub-heading routed |
| `p2-p04-online-today-statistics` | 4 | `#page-4 .exotic-email-chart > h2:nth-of-type(2)` | Online Today statistics | Magazine chart | Online Today | Magazine readers | 29 Nov 2013 | B | B | Strong initial fit |
| `p2-p05-veterinary-course-ad` | 5 | `#page-5 .exotic-course-gamer > h2:first-of-type` | Veterinary nurse course advertisement | University advertisement | Hong Kong Metropolitan University | Prospective students | — | A | A | Strong initial fit |
| `p2-p05-gamer-article` | 5 | `#page-5 .exotic-course-gamer > h2:nth-of-type(2)` | The Gamer article | Gaming magazine article | The Gamer / Perry Schmidt | Gaming readers | — | B | B | Strong initial fit |
| `p2-p06-student-podcast-interview` | 6 | `#page-6 .exotic-podcast > h2` | A different kind of nurse! | Interview transcript | Student host and veterinary nurses | Student podcast listeners | — | A | A | Strong initial fit |
| `p2-p07-virtual-jungle-book` | 7 | `#page-7 .exotic-book-fish > h2:first-of-type` | Inside the Virtual Jungle and Pets Online | Non-fiction / research extract | Book author and interviewees | General / research readers | — | B | B | Explicit Kerry route |
| `p2-p07-hong-kong-times` | 7 | `#page-7 .exotic-book-fish > h2:nth-of-type(2)` | Hong Kong Times article | Newspaper report | Reporter / AFCD interviewee | Hong Kong public | Nov 2013 | C | C | Strong initial fit |
| `p2-p08-elderly-news` | 8 | `#page-8 .exotic-elderly > h2` | Elderly News extract | Magazine feature / reader messages | Editor and readers | Older readers and families | — | B | B | Strong initial fit |
| `p2-p09-squeers-letter` | 9 | `#page-9 .exotic-letter-news > h2:first-of-type` | Squeers letter | Letter to the editor | Mr W. Squeers | Editor and public | 23 Mar 2014 | C | C | Explicit Kerry route |
| `p2-p09-hong-kong-telegraph` | 9 | `#page-9 .exotic-letter-news > h2:nth-of-type(2)` | Hong Kong Telegraph article | Newspaper report | Reporter / interviewees | Hong Kong public | Mar 2014 | C | C | Strong initial fit |
| `p2-p10-hospital-annual-report` | 10 | `#page-10 .exotic-annual > h2` | Hospital annual-report extract | Institutional report with chart | Kowloon Exotic Pets Hospital | Stakeholders / public | 2014 context | C | C | Strong initial fit |
| `p2-p11-neelay-email` | 11 | `#page-11 .exotic-thanks > h2` | Neelay Shah email | Professional email | Neelay Shah | Kerry Lam | — | C | C | Strong initial fit |

## Classification rationale

- Task A sources centre on becoming a veterinary nurse: the explicit podcast route, the course advertisement, and the student interview.
- Task B sources centre on virtual pets and older users: the age chart, The Gamer, the explicitly routed book, and Elderly News.
- Task C sources centre on Squeers's criticism, hospital/community action, and external corroboration: the two relevant news reports, Squeers's letter, the annual report, and Neelay's email.
- The Pet Club note sheet is an explicit multitask document, but its six printed sub-headings are not interchangeable: only `Email 2` routes to Task A and `Advice for exotic pet owners` routes to Task C.

## Pet Club podcast sub-heading map

| Stable sub-heading ID | Exact DOM target | Printed sub-heading | Stage 2 label | Reason |
| --- | --- | --- | --- | --- |
| `p2-p03-definition` | `#page-3 .notes-form-body > h3:nth-of-type(1)` | Exotic pets — Definition | 不取材 | None of the three tasks asks for a general exotic-pet definition. |
| `p2-p03-reasons` | `#page-3 .notes-form-body > h3:nth-of-type(2)` | Reasons to have an exotic pet | 不取材 | General ownership motives do not answer Task A, B or C. |
| `p2-p03-examples` | `#page-3 .notes-form-body > h3:nth-of-type(3)` | Examples of exotic pets in Hong Kong | 不取材 | Species examples do not answer the three output requirements. |
| `p2-p03-email-1` | `#page-3 .notes-form-body > h3:nth-of-type(4)` | Email 1 | 不取材 | Kenny's snake question is outside all three tasks. |
| `p2-p03-email-2` | `#page-3 .notes-form-body > h3:nth-of-type(5)` | Email 2 | Task A | Pinky/Wendy's veterinary-nursing exchange supports the information page. |
| `p2-p03-advice` | `#page-3 .notes-form-body > h3:nth-of-type(6)` | Advice for exotic pet owners | Task C | Responsible ownership and hospital support feed the response letter. |

## Runtime and state mapping

- Stage 2 source inventory and teaching copy: `paper3/2014-b2/super-curation-stage2-data.js`.
- Integrated Stage 1–2 controller, schema-2 state, schema-1 migration, free stage/step navigation, saved categories, progressive stamps, rewind, completion and debug API: `paper3/2014-b2/super-curation-v2.js`.
- Compatibility loader that preserves the existing reader entry while loading the Stage 2 assets: `paper3/2014-b2/super-curation.js`.
- Stage 2 category controls, metadata cards, sparse-highlight override, wide desktop and reduced-motion presentation: `paper3/2014-b2/super-curation-stage2.css`.
- Static contracts: `tools/test-2014-b2-super-curation-part1.mjs` and `tools/test-2014-b2-super-curation-part2.mjs`.
- Browser journey and screenshot capture: `tools/test-2014-b2-super-curation-part2-browser.cjs`.

## Re-entry and rewind rules

- All 14 Stage 2 steps are freely selectable; completion is not used as a navigation gate.
- Each visited document begins with its source-grounded initial classification and saves every learner change. The podcast step additionally labels all six printed sub-headings on the page and in the dock.
- A/B/C are independent badges; `暫未確定` clears the task choices.
- Forward movement adds document stamps progressively. Moving backward hides future stamps without deleting saved decisions.
- Schema-1 Stage 1 position, completion, bookmarks, spotlight and help drafts migrate to schema 2 by stable ID.
- Completing Stage 2 does not open Stage 3. The learner can re-enter Stage 1 or any Stage 2 step and revise categories.

## Stage 3 plan (not implemented)

1. Locate and provenance-audit the authentic 2014 Part B recording and transcript.
2. Map every recoverable audio turn to stable speaker/segment IDs and the page-3 note headings.
3. Verify the content under the already labelled `Email 2` (Task A) and `Advice for exotic pet owners` (Task C) routes against the full authentic audio.
4. Implement sentence/turn-level listening analysis without importing Stage 4 printed-source evidence or Stage 5 writing.
5. Add forward, rewind, reload, missing-audio, speaker-source, accessibility, reduced-motion and cross-stage regression tests before enabling Stage 3.

Stages 3–5 remain disabled in the learner interface.
