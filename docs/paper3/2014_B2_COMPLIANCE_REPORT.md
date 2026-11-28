# Paper 3 compliance report

Compliance revision: `paper3-2014-b2-remove-internal-metadata-v1`

## Decision

The native 2014 B2 reader implements the complete five-stage Super Curation sequence. Stage 5 contains 237 stable steps: 12 task-specific preparation actions, 49 atomic model units, 88 exact source-reference visits, 88 paired returns, and explicit answer transfer. Every model unit has a sentence-specific Traditional Chinese explanation of its content/genre decision and a separate reusable structure analysis tied to exact pale-purple words in that unit. The Stage 5 interface contains no model-authority disclaimer above the essays or below the analysis, and every sentence in all three model essays remains fully visible rather than fading unreached text toward white. Internal step IDs are not shown in the dock or help dialog, and the generated Stage 4 source-order/writer/reader/date sentence is not presented to learners.

Stages 1–3 are preserved. All four implemented stage buttons and every step in the current stage are freely selectable: progress, Previous/Next, source focus, and completion do not gate browsing. The Stage 3 podcast keeps line-by-line professional Traditional Chinese translation, forward-seek reveal, backward-seek removal, synchronized transcript/notes, and saved playback state.

Stage 4 follows the native Data File source order rather than grouping by task. It applies exact-span marks only: Type 1/2/3 uses the corresponding A/B/C task colour, Type 4/5 uses green for evidence limits or navigation context, and Type 6 alone receives a red strike. It never strikes a content point merely because it is challenged. Visual and scan-only records use their exact native figure or scan target without inventing adjacent text.

The evidence bank is cumulative and reversible. It contains only the 79 records explicitly marked bank-eligible; each item identifies its source and returns to the exact stable record. Rewinding removes later highlights, source stamps, and bank entries. Four contested Task C claims have explicit check-source detours and a return-to-main-line control. Schema 3 restores existing Stage 1–3 state by stable ID and adds Stage 4 position/completion without deleting earlier work.

The 2025 implementation was used only as the interaction and teaching-style reference. No 2025 answers, source order, classifications, or page sequence were copied into the 2014 lesson.

## Authority inspected

| Authority | Use | Result |
| --- | --- | --- |
| Supplied `2014_B2_Fact_Line_Deep_Analysis.md` | Authoritative 2014 atomic content, translations, classifications, decisions, and explanations | Parsed in full; SHA-256 `8afa38a7366913c294f647255caeda6ece1b9ace53a40163f2d46730be90773d` |
| Golden Manual v8.2 PDF | Stage 5 draft-first sequence, sentence-level teaching, exact purple syntax, bilingual editorial standard, all model-guide units, evidence visits, state, accessibility, and QA gates | Pages 57–66 and 81–89 read; pages 60, 61, 65 and 83–89 visually rendered and inspected |
| `tools/paper3/v7-requirements.json` and the normative V7 builder | Local governance and verification contract | Read before implementation |
| `2025_B2_Super_Curation_Line_by_Line.md` | Required architecture and teaching-style reference | Read; no answer content reused |
| Actual `paper3/2025-b2/model-essays.js`, `model-essay-guides.js`, `super-curation.js`, and CSS | Model-unit segmentation, concise why/structure pairing, exact syntax spans, source visits, and progressive display | Read in full for relevant Stage 5 implementation behavior |
| 2025 Stage 5 code-annotated PDF | Visual/code-annotation reference for the 183-step reference walkthrough | All 183 pages text-extracted; implementation decisions cross-checked against the actual 2025 source and Golden Manual |

## Source inventory and classification audit

The Stage 4 inventory contains exactly 11 native Data File sources, in original order:

1. Online Today age chart (page 4) → Task B
2. Metropolitan University course advertisement (page 5) → Task A
3. *The Gamer* article (page 5) → Task B
4. Student veterinary-nursing podcast excerpt (page 6) → Task A
5. *Inside the Virtual Jungle and Pets Online* (page 7) → Task B
6. *Hong Kong Times* article (page 7) → Task C
7. *Elderly News* feature (page 8) → Task B
8. W. Squeers letter (page 9) → Task C
9. *Hong Kong Telegraph* orphan-pet article (page 9) → Task C
10. Hospital annual report (page 10) → Task C
11. Neelay Shah email (page 11) → Task C

The Stage 2 document classifications survived the atomic audit. Stage 4 nevertheless separates direct Task facts (Types 1–3) from evidence boundaries/context (Types 4–5) and non-content (Type 6), so a source-level stamp never turns every sentence into an answer point.

The generated inventories are:

- `docs/paper3/2014-b2-stage4-source-inventory.md`
- `docs/paper3/2014-b2-stage4-evidence-ledger.md`
- `tools/paper3/2014-b2-stage4-source-inventory.json`

## Atomic ledger totals

| Type | Meaning | Records |
| --- | --- | ---: |
| 1 | Task A direct fact | 17 |
| 2 | Task B direct fact | 22 |
| 3 | Task C direct fact | 47 |
| 4 | Evidence boundary / qualification | 51 |
| 5 | Source navigation / structural context | 12 |
| 6 | Not answer content; exact red strike | 25 |
| **Total** |  | **174** |

There are 159 text-bearing records, 13 visual records, and 2 scan-only records. The browser DOM audit found all 159 text records at their exact native selectors and normalized source phrases; misses and page errors are both zero. The evidence bank contains 79 decision-approved direct facts.

## Implementation evidence

| Evidence ID | File | Verified scope |
| --- | --- | --- |
| `P3-2014-P1-INDEX` | `paper3/2014-b2/index.html` | Native 2014 source surface remains authoritative |
| `P3-2014-P1-DATA` | `paper3/2014-b2/super-curation-data.js` | Preserved 47-step Stage 1 |
| `P3-2014-P2-DATA` | `paper3/2014-b2/super-curation-stage2-data.js` | Preserved 20-step Stage 2 and source classifications |
| `P3-2014-P3-DATA` | `paper3/2014-b2/super-curation-stage3-data.js` | Preserved 21 podcast cues and Traditional Chinese transcript |
| `P3-2014-P4-LOADER` | `paper3/2014-b2/super-curation.js` | Deterministic Stage 2–5 data/style/controller load order |
| `P3-2014-P4-CONTROLLER` | `paper3/2014-b2/super-curation-v2.js` | Five-stage state, free navigation, exact marks, evidence use, previews, rewind, migration and restoration |
| `P3-2014-P4-DATA` | `paper3/2014-b2/super-curation-stage4-data.js` | 11-source, 174-record runtime ledger with stable IDs and exact targets |
| `P3-2014-P4-STYLES` | `paper3/2014-b2/super-curation-stage4.css` | Wide dock/source/bank layout, exact Type colours, Type 6 strike, responsive and print rules |
| `P3-2014-P4-BROWSER-TEST` | `paper3-2014-stage4.test.cjs` | First/middle/last, rewind, routes, persistence, audio seeking, responsive widths, and visual QA |
| `P3-2014-P5-DATA` | `paper3/2014-b2/super-curation-stage5-data-v3.js` | Twelve writing actions, 49 atomic units, 49 sentence-specific Traditional Chinese structure analyses, 88 source visits and 88 paired returns |
| `P3-2014-P5-STYLES` | `paper3/2014-b2/super-curation-stage5-v2.css` | Exact 2025 five-stage rail component values, fully visible essay text, readable 16px analysis typography, paler semi-transparent source-use strikes, task/structure marks, evidence strikes and source preview |
| `P3-2014-P5-BROWSER-TEST` | `paper3-2014-stage5.test.cjs` | Exact 2025 rail labels/geometry/colours/count states, pale-blue source-strike styling, full visibility across Tasks A/B/C, disclaimer absence, computed analysis typography, preview-return, rewind, persistence, transfer, storage failure and responsive QA |
| `P3-2014-P5-AUDIT` | `outputs/2014-b2-part5/stage5-source-mapping.json` | Complete evidence-to-unit and source-visit/return audit |

Supporting audit tools and outputs:

- `tools/paper3/build-2014-b2-stage4-ledger.mjs`
- `tools/paper3/audit-2014-b2-stage4-dom.cjs`
- `outputs/2014-b2-part4/stage4-dom-target-audit.json`
- `outputs/2014-b2-part4/screenshots/stage4-first-source.png`
- `outputs/2014-b2-part4/screenshots/stage4-middle-evidence-bank.png`
- `outputs/2014-b2-part4/screenshots/stage4-source-detour.png`
- `outputs/2014-b2-part4/screenshots/stage4-final-all-sources.png`
- `outputs/2014-b2-part4/screenshots/stage4-mobile.png`

## Verification performed

- Generator gates: 11 sources, 174 records, exact type totals, stable unique IDs, source-order monotonicity, and 79 bank-eligible records.
- DOM target audit: 159/159 text records matched native English DOM; 13 visual and 2 scan-only records resolved to explicit safe targets; zero misses and zero page errors.
- Controller target audit: zero selector, exact-phrase, transcript-highlight, or source-stamp misses across Stages 1–4.
- First/middle/last browser journey: first source chart, middle source plus cumulative bank, and final source with all 174 records completed.
- Highlight semantics: every live red-strike mark has `type=6`; a direct Type 1/2/3 content point computes without line-through.
- Reversibility: Back never reveals a later mark and retracts later bank content; direct free jumps reconstruct the correct prefix deterministically.
- Evidence bank: task counts follow the current source position; every bank button revisits its stable source record.
- Detours: source-check route, visible route trace, destination outline, and return to the same stable main-line record pass.
- Persistence: final Stage 4 position, all 174 completed IDs, completion state, and earlier Stage 1–3 state restore after reload.
- Audio regression: seeking forward reveals transcript rows, notes, and heard cues; seeking back to the segment start removes generated notes and future transcript evidence.
- Translation regression: every transcript row retains a non-empty `zh-Hant` translation.
- Stage boundary: Stage 4 completion enters the first Stage 5 task-analysis step; Stage 5 remains freely selectable and its draft-first model controls remain active.
- Wide-layout checks: reader width remains at least 680px at 1440, 1600, 1920, and 2560 viewports; it reaches 1120px at 1920.
- Mobile check: 390×844 uses root overflow clipping, a bounded teaching panel, an exact source target visible below the panel, and a collapsible full evidence bank inside the dock.
- Scan/print checks: both scan-only records open the explicit native scan target; print media removes the rail, dock, bank, routes, source bars, outlines, highlights, and strikes.
- Accessibility/interaction: native buttons/selects, ARIA labels, keyboard Previous/Next, focus-visible controls, reduced-motion equivalence, and print-safe unannotated output remain available.
- Sentence-analysis QA: all 49 units have distinct why/structure fields; every purple phrase exists verbatim in its unit; no sentence is painted as one undifferentiated purple block; all 49 explained constructions render as independent pale-purple marks.
- Readability QA: both Stage 5 analysis lines compute at 16px; both disclaimer rendering paths and all related DOM nodes are absent.
- Internal-metadata QA: the dock contains no `#curation-step-id` node or `STEP ID` text at the four reported records; both Neelay-email checks confirm that `來源 11/11`, writer/reader routing and the generated date annotation are absent while the authentic email remains available on the source page.
- Essay-visibility QA: every model unit in Task A, B and C computes at opacity 1 with visible, non-hidden text; the current unit keeps its outline without washing out later sentences.
- Source-strike readability QA: the Stage 5 Data File use mark computes as a 52%-opacity pale blue line, 3px thick at 55% vertical position; the preview frame and header retain their stronger navy treatment.
- Stage-rail QA: the 2014 renderer and CSS now use the actual 2025 implementation contract—`任務指示 / 資料分類 / 聆聽錄音 / 逐句取證 / 三篇寫作`, 88px rail, 35px dots, 5px track, `#efbf3a` active gold, `#287a70` done green, `#237b70` fill, paper-white dot border, active-only fraction, completed-only `完成`, in-dot check, and stage-index fill. Only the fixed top offset is adapted to the 2014 page shell. A direct Chromium comparison against the live 2025 component reports deep equality for every selected computed visual property.
- Browser console: zero page errors throughout the full automated journey.

## Scope boundary

- Implemented: Stages 1–5, including the three 2014 writing tasks, source-traceable teacher draft models, task-specific checks and explicit native-answer transfer.
- The Stage 5 interface presents the three model essays directly, without the removed model-authority disclaimer copy.
- The native 2014 source text was not rewritten to manufacture matches. When a record is visual or scan-only, Stage 4 targets that exact source object rather than an adjacent sentence.
- No deployment or publication was performed.

## Stage 5 audit and verification

- Runtime: `paper3/2014-b2/super-curation-stage5-data-v3.js`, `paper3/2014-b2/super-curation-stage5-v2.css`, and the schema-5 integration in `paper3/2014-b2/super-curation-v2.js`.
- Sequence: 12 writing-preparation actions, 49 atomic model units (Task A 13, Task B 15, Task C 21), 88 source visits and 88 paired returns; total 237 steps.
- Generated audit: `outputs/2014-b2-part5/stage5-audit.md` and `outputs/2014-b2-part5/stage5-source-mapping.json`.
- The 88-record content ledger maps every factual model use to an exact Stage 3/4 evidence ID, source title, page and phrase. Zero IDs or routes are missing, and every visit has an immediate return step.
- Schema 5 preserves all Stage 1–4 state and adds separate plans, drafts, checks, essay positions and transfer states for Tasks A/B/C.
- Stage 5 uses the approved central practice-page architecture: draft cards first, then sentence-by-sentence model teaching. Backward movement hides later units and removes their later red/navy use marks.
- The revised structure guide follows the Golden Manual sentence by sentence: it names the exact construction actually used, explains its reusable grammatical or organisational function in concise Hong Kong Traditional Chinese, and marks only those exact words in pale purple. Titles, salutations, sign-offs and signatures are identified as structural units rather than mislabelled as factual sentences.
- The no-spotlight view retains the fixed five-stage rail and left dock. The right evidence bank uses red midline strikes; task keywords use A/B/C colours; reusable structure uses pale purple; exact source use uses navy.
- Source previews have a navy header, blue border, independent scrolling, drag movement, four-corner resize, bounded placement and immediate close on the paired return step.
- Submission safety: transfer is explicit, task-specific and sends only the learner draft to the correct native Task 8/9/10 fields. Planning notes, models and evidence metadata are excluded. The browser suite recorded zero POST/PUT requests.
- `paper3-2014-stage5.test.cjs` passes exact 2025 rail assertions for labels, 88px geometry, padding, 5px track, 80% Stage 5 fill, 35px dots, paper-white active border, gold/green colours, shadow, `✓`/`完成`, active fraction and `aria-current`; it also passes the 49-unit structure/mark audit, exact pale-blue source-strike colour/thickness/position assertion, full-visibility assertions for Tasks A/B/C, disclaimer-absence and 16px typography assertions, preview/return, rewind, persistence, transfer, storage-failure and 1440/1100/768/390 responsive checks. Stage 4 regression and the 159/159 DOM text-target audit also pass with zero page errors.

Readiness: teacher review is ready; student pilot is ready after teacher approval of the draft models; production deployment is not ready until model approval and explicit deployment authorization.
