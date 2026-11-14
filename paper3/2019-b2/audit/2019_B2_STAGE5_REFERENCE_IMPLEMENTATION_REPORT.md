# 2019 B2 Stage 5 Reference Implementation Report

## Outcome

Stage 5 now follows the complete 2025 writing interaction grammar while retaining the authentic 2019 task, model and evidence inventory. It is not a recoloured legacy model panel and does not force the 2019 content into the 2025 screenshot count.

## Reference-derived behaviour

- Learners plan and draft before benchmark inspection.
- The benchmark reveals one title, heading or sentence teaching unit at a time.
- Task-colour marks identify content; pale-purple marks identify reusable structure.
- Every factual source reference opens its exact original evidence, receives navy consumption ink and returns explicitly to the same writing unit.
- The right evidence bank retains red used-state marks, current-source state and stable-ID reopening.
- Writing remains undimmed even if the spotlight preference is on.
- Task 8, 9 and 10 retain independent position, rewind and reload state.

## Authentic 2019 sequence

| Component | Task 8 | Task 9 | Task 10 | Total |
|---|---:|---:|---:|---:|
| Draft-preparation states | 4 | 4 | 4 | 12 |
| Title/heading/sentence units | 16 | 10 | 21 | 47 |
| Exact source visits | 34 | 28 | 49 | 111 |
| Explicit returns | 34 | 28 | 49 | 111 |
| Total states | 88 | 70 | 123 | 281 |

The 2025 paired screenshot references contain 183 states. The Golden Manual treats that as an audit snapshot, not a reusable quota. Removing 2019 mappings to hit 183 would violate evidence lineage, so all 111 authentic references and returns are preserved.

## Persistence and migration

The release uses `2019-b2-super-curation-v8` and `edmund-paper3-2019-b2-curation-v8`. A v7 save keeps compatible Stages 1–4, bank evidence, plans and drafts. Old Stage 5 unlock/use completion is deliberately reset because its schema cannot be interpreted as the 281-state sequence.

## Verification

- Focused Stage 5: 13/13 PASS.
- Full Stage 5 completion: 281/281 states.
- Static: 61/61 PASS.
- Cross-stage browser conformance: 76/76 PASS in Chromium/Firefox plus 390 px mobile, 768 px tablet, 200% zoom, print and reduced motion.
- Earlier-stage focused regressions: 10/10, 15/15, 19/19 and 16/16 PASS.
- Runtime console/page errors: none in tested states.

Independent human visual sign-off and public release identity remain separate certification gates.
