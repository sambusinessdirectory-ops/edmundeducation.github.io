# 2013 B2 Super Curation — Stage 4 Implementation Report

## Outcome

Stage 4 (Data File / 逐句取證) is implemented as a 134-step, page-continuous reading experience. It reads Data File pages 5–11 in printed order, preserves the complete Stage 1–3 teaching surface, progressively reveals only reached Stage 4 marks, and builds a persistent 49-entry Task A/B/C evidence bank. Stage 5 remains locked and contains no model writing.

Release: `2013-b2-stage4-v1` · state schema: `6` · browser cache bundle: `20261123f`.

## Teaching flow and source inventory

| Page | Source | Steps | Main teaching purpose |
|---:|---|---:|---|
| 5 | Asia Life editorial meeting minutes | 17 | Current issue deadline, image quantity, word limit, administrative noise |
| 6 | 2013 Writers’ Guidelines | 15 | Submission, copyright, image format/source, title limit, rejected generic rules |
| 7 | Queenie Lau editorial review | 16 | Provisional review facts, cross-page resolution, exact Task B changes |
| 8 | See the World TV transcript | 19 | Task C positive effects, question-versus-answer distinction, culture preservation |
| 9 | Wildrovers forum | 19 | Claim-by-claim strength, positive evidence, negative/unsupported counter-material |
| 10 | Mei Cheng interview and Kevin Hui letter | 27 | Task A historical evidence; Task C opposing position and its rationale |
| 11 | Historian blog, photographs and table | 21 | Task A historical examples, visual/statistical corroboration, tone and limits |
| **Total** | **7 pages / 8 source documents** | **134** | **49 evidence-bank entries; 5 explicit cross-page routes** |

The sequence excludes the situation, contents page, podcast and Boss letter because Stages 1–3 already teach them. Every Stage 4 item uses a stable descriptive ID, exact 2013 source phrase, source page, source document ID, evidence type, bank decision and Traditional Chinese explanation.

## Evidence ledger and bank

The released data model stores the complete ledger in `super-curation-data-file-data.js`. Evidence types are:

1. Task A usable evidence.
2. Task B usable evidence.
3. Task C usable evidence.
4. Meaning, tone, purpose or source relationship.
5. Update, correction, qualification or cross-page relationship.
6. Rejected, administrative or distracting material.

The bank contains 14 Task A, 16 Task B and 19 Task C entries. Duplicate insertion is prevented by stable evidence ID. Filters, current step, completed IDs, reached evidence, bank IDs, bookmarks, spotlight and bank filter persist through reload. Backward navigation hides later paper annotations while preserving the learner’s completed/banked record.

## Cross-page resolution

- Page 5’s reminder to follow the 2013 guidelines routes to page 6.
- Page 6’s variable word-limit rule routes back to the page 5 issue-specific limit.
- Page 7’s image checklist routes to page 5 for quantity and page 6 for format/source.
- Page 7’s title-character reminder routes to page 6’s 80-character limit.
- Page 7’s unanswered word-limit question routes to page 5’s 900-word decision.

No route reveals writing-stage language or a model answer.

## Saved state and migration

The controller accepts all Stage 1–3 content versions as migrations and restores Stage 4 by stable ID rather than raw array position. New fields are `dataCurrentStepId`, `dataPosition`, `dataCompleted`, `reachedEvidenceIds`, `evidenceBankIds`, `dataBankFilter`, and `dataStageComplete`. Invalid/removed IDs are filtered on import. Stages 1–4 remain freely accessible; Stage 5 alone is locked. Stage 4 also reprojects every Stage 3 generated note that the learner actually reached, while native reader storage preserves learner-authored notes; both layers survive the Stage 3 → Stage 4 transition and a full reload.

## Verification

Automated browser verification passed at 1800 × 1100 using the unmodified production HTML/CSS/JS bundle.

1. 134 stable IDs are present and unique.
2. Pages are exactly 5, 6, 7, 8, 9, 10 and 11 in order.
3. All exact phrase targets resolve; missing-target count is zero.
4. All source document IDs resolve.
5. All five cross-page destination selectors resolve.
6. Stage 1 remains 52 steps.
7. Stage 2 remains 14 steps.
8. Stage 3 remains 185 steps with 28 cues and 154 transcript rows.
9. Four stages are freely accessible.
10. Stage 5 remains disabled.
11. Stage 4 direct URL entry works without prior local state.
12. Stable step deep links override saved position.
13. Forward navigation covers all 134 steps.
14. Reverse navigation hides future Stage 4 annotations.
15. No future annotation appears at any forward boundary.
16. Beginning reload restores the first step.
17. Middle reload restores the stable middle ID.
18. Final reload restores completion and the final stable ID.
19. Step counter reports 1/134 through 134/134 correctly.
20. Completion counter follows completed stable IDs.
21. Final step marks Stage 4 complete only after the complete sequence.
22. Spotlight enabled renders four masks around the exact phrase.
23. Spotlight disabled removes all masks.
24. Stage 3 player and transcript chrome remain hidden in Stage 4.
25. Stage 1 marks and Boss/source-route stamps remain mounted.
26. Stage 2 document and note stamps remain visible.
27. The three Stage 2 listening-only strikes remain visible.
28. Evidence bank prevents duplicate stable IDs.
29. A/B/C bank filters show only the selected task and persist through reload.
30. Bank entries return to their originating Stage 4 step.
31. Rejected/admin evidence uses the red strike grammar.
32. Task A/B/C phrases use the established cyan/yellow/pink grammar.
33. Cross-page routes use the red source-route indicator.
34. Bookmark and step picker include Stage 4 stable IDs.
35. Stage 1 full forward/reverse regression passed.
36. Stage 2 full classification regression passed.
37. Stage 3 full 185-step regression passed.
38. Stage 3 playback, replay, seek, reload and no-autoplay behavior regression passed.
39. Stage 3 generated podcast notes remain visible on the authentic page-3 sheet in Stage 4.
40. Learner-authored Stage 3 notes survive the Stage 4 handoff and a full reload.
41. JavaScript syntax checks passed.
42. Generated 134-row source mapping matches the released data model.

Screenshots:

- `outputs/2013-b2-stage4-v1/01-first-step.png`
- `outputs/2013-b2-stage4-v1/02-representative-middle-step.png`
- `outputs/2013-b2-stage4-v1/03-source-reference-step.png`
- `outputs/2013-b2-stage4-v1/04-final-step.png`

## Files created or modified

- `paper3/2013-b2/index.html`
- `paper3/2013-b2/super-curation-data.js`
- `paper3/2013-b2/super-curation-data-file-data.js` (new)
- `paper3/2013-b2/super-curation.js`
- `paper3/2013-b2/super-curation.css`
- `tools/paper3/check-2013-b2-stage1.mjs`
- `tools/paper3/check-2013-b2-stage2.mjs`
- `tools/paper3/check-2013-b2-stage3.mjs`
- `tools/paper3/check-2013-b2-stage3-behaviors.mjs`
- `tools/paper3/check-2013-b2-stage4.mjs` (new)
- `tools/paper3/build-2013-b2-stage4-mapping.mjs` (new)
- `docs/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md` (new)
- `docs/paper3/2013_B2_STAGE4_IMPLEMENTATION_REPORT.md` (new)
- `docs/paper3/PAPER3_COMPLIANCE_REPORT.md`
- `tools/paper3/paper3-compliance.json`

## Known limitations

- Wide desktop is the acceptance target. The existing compact safety fallback remains, but no mobile design is claimed.
- Forum statements retain their source status: they are taught as claims and examples, not independently verified external facts.
- The evidence bank prepares material selection only; it does not rank, outline or compose the final answers.
- Stage 5 is intentionally absent and locked.

## Stage 5 plan (not implemented)

After approval, Stage 5 should consume only reached, confirmed bank entries; require the learner to select and order evidence separately for Tasks A, B and C; preserve each source link and qualification; then scaffold genre, paragraph purpose and word-budget checks without inserting hidden facts or prewritten model answers. It should use a new schema/content version and a separate acceptance pass.
