# Song vocabulary thematic review — 2026-10-30

## Scope and result

Reviewed all 490 vocabulary questions across the 49 published songs. Revised 473 questions and 1,012 English options, with matching Traditional Chinese reasons. Retained 17 questions that did not need a thematic change. All 49 database rows were updated and compared exactly with the reviewed local vocabulary JSON. The archived Taylor Swift “Mean” lesson remains hidden.

The target expressions, question numbers, answer positions and meanings are preserved. Existing learner selections remain attached to the same word and answer position. Listening questions, translations, media, introductions and interaction code were unchanged by this vocabulary release. One usage note was rephrased to remove the prohibited Chinese contrast construction.

## Editorial approach

- Broaden everyday settings: relationships, relatives, work, travel, technology, money, neighbourhoods, art, music, sport, events, weather, health and ordinary mishaps.
- Keep surrounding language simple. The song expression itself can exceed A2; preserving the taught expression is intentional. This is an editorial A2-oriented pass, not external CEFR certification.
- Retain gentle exaggeration, awkward conversations, mistaken names, surprising guests, small accidents and friendly jokes. Avoid making food, pets, shoes and homework the default source of humour.
- Make every revised Chinese reason refer to the actual revised option. Preserve the existing four-choice usage-question format, including grammar and meaning distractors.
- Repair alternative readings noticed during review, rather than declaring a plausible alternative wrong merely because it differs from the intended scene.
- Shorten some correct answers so elaboration does not become a stronger answer clue. The count of uniquely longest correct answers fell from 244 to 194 out of 490. This is an improvement, not a claim of perfect statistical balance.

## Verification

- All 490 identities, taught words, meanings and answer indices preserved.
- Four distinct options and four Chinese reasons in every question.
- No duplicate complete option sentences across the release.
- Matching reasons for revised correct options; retained summaries can differ in wording from the option-level reason.
- No prohibited Chinese `不是…而是…` construction in vocabulary fields.
- A narrow diagnostic list (dog, cat, shoes, homework, sandwich, pizza, soup, breakfast, cake) appeared in 550 original options and zero revised options. This is a repetition diagnostic, not a permanent ban on these legitimate A2 topics.
- 1,960 server-side grading round trips tested locally: every option of every question; returned answer and explanations matched the source.
- Saved progress and withholding answer keys before selection verified in the local database tests.
- Existing content tests passed for the album, October 29 batch and eight-song batch; the full 49-song listening quality check passed.
- Production updates were guarded by exact comparison with the pre-edit vocabulary (or the already-applied new vocabulary). A concurrent edit would abort that song's update.
- Each production write changed only `vocabulary`; every returned `verified` result was true.

## Records and reproducibility

- `audit.json`: all 490 question identities, revised option positions and explicitly tagged edit themes.
- `edits.tsv`: initial individually written options and reasons.
- `key-polish.tsv`: later correct-answer polish; keyed by song and question.
- `final-corrections.tsv`: final overrides for ambiguity, repetition and wording findings.
- `apply.py`: one-off release reconstruction in that order. It is **not** part of the runtime or an automatic import pipeline. Do not run it over future editorial changes without review.
- `audit.py`: verifies this release against baseline commit `94e979713` and writes the item-level report.
- `../test-song-vocabulary-variety.mjs`: complete local grading and progress test.

## Related radar direction audit

All 49 profiles were checked for consistent difficulty direction, valid six-axis values, totals and star mapping. The fourth axis is labelled `辨音難度 / Vocal decoding difficulty`: a larger value means harder to distinguish the vocal. The original score report explicitly called this axis `clarityDifficulty`; values were already difficulty scores. Applying `11 - score` would incorrectly reverse those values, so no numeric values were changed.

The original 38 profiles have individual editorial notes; the later 11 share the schema but have less individual documentation. This direction/provenance check does not claim a fresh listening assessment or learner calibration. Full record: `../song-import-reports/20261030-difficulty-direction-audit.json`. Browser tests passed for all 49 cards and panels, totals, outward polygon animation, keyboard replay, reduced-motion explicit replay, desktop, tablet and mobile.
