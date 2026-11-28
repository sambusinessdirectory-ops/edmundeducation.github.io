# 2013 B2 Super Curation — Stage 4 Implementation Report

## Outcome

Stage 4 is rebuilt directly from the user-authored V4 source and contains **207 stable clause-level steps** across Data File pages 5–11. No authored unit inside that bounded scope is omitted. Every step renders the exact excerpt or visual observation, Traditional Chinese rendering, authored type, answer decision, the original four analysis labels and all four analysis values.

Release: `2013-b2-stage4-v3-v4-source-rebuilt` · state schema: `8` · browser cache bundle: `20261129a`.

The Situation, Contents page, Podcast/Track 7 and Track 8, and the boss letter/Casey email remain excluded because Stages 1–3 already teach them. Stage 5 remains locked and contains no writing content.

## Source inventory

| Page | Fact-file source | Authored steps |
|---:|---|---:|
| 5 | Asia Life editorial meeting minutes | 24 |
| 6 | 2013 Writers’ Guidelines | 17 |
| 7 | Queenie Lau editorial review | 21 |
| 8 | *See the World* TV transcript | 35 |
| 9 | Wildrovers forum | 43 |
| 10 | Mei Cheng interview and Kevin Hui letter | 38 |
| 11 | Historian webpage, table and photographs | 29 |
| **Total** | **7 pages / 8 source documents** | **207** |

The authoritative V4 source has SHA-256 `7d928ea01e6ef825e4cb8f37db084ba9edf1613f72bcbf1118705b4196d0c9d4`. The parser is bounded from `# Data File page 5` through page 11 and stops before `# Track 7`. It proves 207/207 complete `###` units, zero unparsed nonblank content and 207 per-block hashes. The generated mapping identifies the exact authored source line, reconstructed phrase and authored-block SHA-256 for every step.

## Explicit scope exclusions

The Stage 4 parser excludes whole, explicit source sections already curated in Stages 1–3: Situation, Contents page, Track 7/Track 8 Podcast material, and the boss letter/Casey email. It does not sample or hand-pick lines inside pages 5–11: every authored unit in that bounded fact-file scope is included.

## Teaching interface

- The left dock contains the complete authored analysis for the current step.
- The source document remains centred and focuses the exact 2013 phrase.
- The independent right-side panel is titled **三項寫作證據庫** and contains **62** usable Task A/B/C entries, matching the 2025 Stage 4 workspace architecture.
- Bank entries appear only after the corresponding usable source step is reached.
- A/B/C filters and entry-to-source return navigation are saved.
- Six source-reference decisions retain route indicators.
- Spotlight on and off both work.
- Prior Stage 1–3 annotations and learner/generated podcast notes remain preserved.
- Backward navigation removes future Stage 4 ink without erasing completed/banked progress.

## Saved state and migration

Schema 8 restores Stage 1–3 state unchanged and migrates both earlier Stage 4 releases through explicit `legacyIds` aliases. Current/completed/reached/bank/bookmark records map to the closest corresponding V4 unit; removed IDs are filtered safely. Restoration uses stable IDs before array position.

## Verification

The production bundle passed the 1800 × 1100 Playwright journey:

1. Exactly 207 unique stable IDs.
2. Exactly 207 complete authored field/label sets and valid per-block hashes.
3. Pages exactly 5–11 in printed order with counts 24/17/21/35/43/38/29.
4. Exactly 62 bank entries and six source routes.
5. Zero missing phrase or route targets and zero unparsed authored content.
6. Exact source SHA and parser boundary verified.
7. Standalone right bank is outside the left dock and inside the viewport.
8. Eight visible authored-analysis fields per step.
9. All 207 steps pass forward navigation.
10. All 207 steps pass reverse navigation with no future annotations.
11. Beginning, middle and final reload restore the stable current step.
12. Final step marks Stage 4 complete at 207/207.
13. Spotlight on and off both pass.
14. Stage 3 learner and generated notes survive Stage 4 entry and reload.
15. Podcast player/transcript chrome remains hidden in Stage 4.
16. Bank filters persist and return to originating steps.
17. Direct stable-ID links work.
18. Stage 5 remains disabled.
19. JavaScript syntax checks pass.
20. Source-mapping generator validates all units.

Screenshots:

- `outputs/2013-b2-stage4-v3-v4-source-rebuilt/01-first-step.png`
- `outputs/2013-b2-stage4-v3-v4-source-rebuilt/02-representative-middle-step.png`
- `outputs/2013-b2-stage4-v3-v4-source-rebuilt/03-source-reference-step.png`
- `outputs/2013-b2-stage4-v3-v4-source-rebuilt/04-final-step.png`

## Known limitations

- The acceptance target is wide desktop. A compact safety fallback remains, but no mobile design is claimed.
- Forum claims retain their source status and are not upgraded into independently verified facts.
- The evidence bank supports selection and return routes; it does not compose answers.
- Stage 5 remains intentionally unimplemented and locked.

## Stage 5 plan

After approval, Stage 5 should consume only reached evidence, preserve every source and qualification, and scaffold selection, ordering, genre, paragraph purpose and word-budget checks without introducing hidden facts or prewritten answers. It requires a separate content/schema version and acceptance pass.

