# 2013 B2 Super Curation — Stage 4 Implementation Report

## Outcome

Stage 4 now presents the complete user-authored deep analysis for every included fact-file unit. It contains **59 stable steps** across Data File pages 5–11 and a **29-entry** Task A/B/C evidence bank. Every step renders the authored excerpt or visual observation, Traditional Chinese rendering, type, answer decision, and all four analysis subsections without summarising or dropping content.

Release: `2013-b2-stage4-v2-full-analysis` · state schema: `7` · browser cache bundle: `20261128a`.

The Situation, Boss Letter/task-contract material, listening sheet/answer frames, and all Podcast-derived units remain excluded because Stages 1–3 already curate them. Stage 5 remains locked and contains no writing content.

## Source inventory

| Page | Fact-file source | Authored steps |
|---:|---|---:|
| 5 | Asia Life editorial meeting minutes | 7 |
| 6 | 2013 Writers’ Guidelines | 4 |
| 7 | Queenie Lau editorial review | 7 |
| 8 | *See the World* TV transcript | 7 |
| 9 | Wildrovers forum | 11 |
| 10 | Mei Cheng interview and Kevin Hui letter | 12 |
| 11 | Historian webpage, table and photographs | 11 |
| **Total** | **7 pages / 8 source documents** | **59** |

The deep-analysis source has SHA-256 `30fb485c26ba494c94278d8c24cd6d6f7b2ad87cca5e25002787fca99861db0f`. The generated mapping identifies the exact authored source line and exact reconstructed source phrase for every step.

## Explicit scope exclusions

Seventeen authored units are intentionally absent from this Stage 4 sequence:

- Podcast-only historical points: ship/train travel, the six-week voyage, only-rich international travel.
- Podcast-only Task C points: roads/hospitals, Nora Dance, visitor statistics, unusual hotels.
- Already-curated interfaces: listening sheet, Task 8 answer frame, Task 9 answer frame.
- Already-curated navigation/instruction material: Contents page and Casey’s Boss Letter header.
- Remaining Podcast branches and closing/equipment instructions.

The exclusion list is asserted by authored source-line number in the generator and browser test.

## Teaching interface

- The left dock contains the complete authored analysis for the current step.
- The source document remains centred and focuses the exact 2013 phrase.
- The independent right-side panel is titled **三項寫作證據庫**, matching the 2025 Stage 4 workspace architecture.
- Bank entries appear only after the corresponding usable source step is reached.
- A/B/C filters and entry-to-source return navigation are saved.
- Cross-page decisions retain red route indicators.
- Spotlight on and off both work.
- Prior Stage 1–3 annotations and learner/generated podcast notes remain preserved.
- Backward navigation removes future Stage 4 ink without erasing completed/banked progress.

## Saved state and migration

Schema 7 restores Stage 1–3 state unchanged and migrates the rejected Stage 4 v1 IDs through explicit `legacyIds` aliases. Current/completed/reached/bank/bookmark records are mapped to the new stable analysis IDs; removed IDs are filtered safely. Restoration uses stable IDs before array position.

## Verification

The production bundle passed the 1800 × 1100 Playwright journey:

1. Exactly 59 unique stable IDs.
2. Exactly 59 complete authored field sets.
3. Pages exactly 5–11 in printed order.
4. Exactly 29 bank entries and two cross-page routes.
5. Zero missing phrase or route targets.
6. All 17 already-curated/Podcast source lines absent.
7. Standalone right bank is outside the left dock and inside the viewport.
8. Eight visible authored-analysis fields per step.
9. All 59 steps pass forward navigation.
10. Reverse navigation exposes no future annotations.
11. Beginning, middle and final reload restore the stable current step.
12. Final step marks Stage 4 complete at 59/59.
13. Spotlight on and off both pass.
14. Stage 3 learner and generated notes survive Stage 4 entry and reload.
15. Podcast player/transcript chrome remains hidden in Stage 4.
16. Bank filters persist and return to originating steps.
17. Direct stable-ID links work.
18. Stage 5 remains disabled.
19. JavaScript syntax checks pass.
20. Source-mapping generator validates all units.

Screenshots:

- `outputs/2013-b2-stage4-v2-full-analysis/01-first-step.png`
- `outputs/2013-b2-stage4-v2-full-analysis/02-representative-middle-step.png`
- `outputs/2013-b2-stage4-v2-full-analysis/03-source-reference-step.png`
- `outputs/2013-b2-stage4-v2-full-analysis/04-final-step.png`

## Known limitations

- The acceptance target is wide desktop. A compact safety fallback remains, but no mobile design is claimed.
- Forum claims retain their source status and are not upgraded into independently verified facts.
- The evidence bank supports selection and return routes; it does not compose answers.
- Stage 5 remains intentionally unimplemented and locked.

## Stage 5 plan

After approval, Stage 5 should consume only reached evidence, preserve every source and qualification, and scaffold selection, ordering, genre, paragraph purpose and word-budget checks without introducing hidden facts or prewritten answers. It requires a separate content/schema version and acceptance pass.

