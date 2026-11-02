# Model essay memorization rollout: editorial gate

Status on 2026-11-02: **288 canonical source bundles prepared; four full lessons reviewed and published; 284 full lessons still require authored teaching content**. A source bundle or automatically matched structure is not a finished student lesson.

## Verified source inventory

- The live writing-practice catalogue contains 228 IELTS Writing Task 2 model essays and 60 IELTS Writing Task 1 reports: **288 unique interactive essays**, rather than the approximate 270 in the request.
- Four existing lessons have individually reviewed teaching support: Opinion 80, Opinion 3, Discuss Both Views 4, and Cause / Solution 2.
- The other 284 essays have individual source bundles in `essay-memory-lessons/`. The full catalogue has 4,387 English and Traditional Chinese sentence records: 3,792 Task 2 and 595 Task 1. Each bundle has sentence roles, medium-fill answers, and exact narration word timings; Task 1 bundles also have question images.
- `tools/build-essay-memory-sentence-groups.mjs` joins recording fragments into **4,275 complete sentences** without changing source text or source indices. There are 104 joined groups covering 216 fragment records. One canonical essay had a missing final period; both displayed source representations were corrected, and the grouping check now reports zero missing endings.
- `tools/build-essay-memory-lessons.js` rejects missing source records, translations, medium answers, Task 1 question images, duplicate keys, and word mismatches with narration. The build completed for all 288 essays. This verifies source integrity, not teaching quality.
- `tools/audit-essay-memory-release.mjs` checks source completeness and reviewed-support shape across the full catalogue. Its current ledger reports 288 source-ready essays, four released lessons, and 284 unpublished lessons. `--require-complete` fails until every lesson passes the release gate.

## Why the other lessons are not linked to students yet

The supplied Task 2 sentence-structure mapping DOCX has 4,477 authored rows across 238 PDF essays. All 228 interactive Task 2 essays match its catalogue. `tools/extract-essay-memory-structure-mapping.py` extracts the rows; `tools/build-essay-memory-structure-candidates.mjs` checks each candidate against the **complete canonical sentence**. The current ledger has 3,182 direct Task 2 mappings, 244 Task 2 bank matches, 227 Task 1 bank matches, and 622 unmatched complete sentences. **Every match still needs semantic review**: a literal span match cannot prove that the formula, meaning, usage, or practice question is right.

The mapping itself repeats a known error: it describes `instead of` as an actual result differing from an expected result. In the museum essay, the phrase compares two proposed display choices. A `so` clause also cannot be restricted to an audience benefit. These user corrections must be applied to every reused formula. Some PDF paragraph/sentence numbers differ from the interactive source, so source spans must be verified rather than joined by printed position alone.

An earlier automatic teaching-support prototype was run against the 224 new Task 2 bundles. The editorial audit found:

| Requirement | Failed cases |
| --- | ---: |
| Simpler whole-sentence English differs meaningfully from the original | 2,430 / 3,723 sentences unchanged (65%) |
| Sentence structure has a specific, source-accurate analysis | 2,058 generic fallbacks |
| Transfer question identifies the source sentence and transfers its actual reasoning | 2,688 / 2,688 missing source links |

The prototype was removed. An unchanged sentence cannot be presented as a simpler paraphrase. A generic split cannot be presented as the sentence's actual structure. A reusable transfer question cannot be presented as an application of that essay's argument without a traceable source link.

## Release acceptance for each of the remaining 284 essays

1. Review every English sentence against the writing-practice model essay and every Chinese translation against the canonical translation. Keep narration aligned to the exact English words. Preserve source fragments and link them to the full sentence when teaching grammar. For Task 1, check prompt images, units, values, trends and process order.
2. Write a genuinely simpler, meaning-preserving English sentence for each source sentence. Audit word choice, grammar, scope, stance, conditions, negation, and cause and effect. Where the original is already basic, explain that honestly and use a distinct, useful bridge rather than repeating the source.
3. Review every vocabulary simplification in its sentence context. Highlight only words or phrases actually simplified.
4. Segment every source sentence without losing or changing a character. Explain its actual grammatical and logical relation. Write a topic-neutral usage note that remains true outside that essay, plus four plausible choices, one key, and specific feedback for each distractor. Audit the 789 unique authored formula explanations before reuse.
5. Build stance/route/evidence/logic exercises from the actual paragraphs, preserving the essay's task type and argument direction. Do not turn a cause/solution essay into a for/against essay or a Task 1 report into an opinion essay.
6. Write at least ten distinct cross-topic transfer tasks that each cite source sentence indices, preserve that source's reasoning, and use plausible wrong choices of similar length. For Task 1, create a report-appropriate data-description transfer route. Review Traditional Chinese line breaks at supported viewport and font sizes.
7. Run the existing browser, mobile, recording, progress, and source-integrity tests; inspect the entire 11-stage journey before adding the essay to the live selector and writing-practice entry point. Preserve the standalone recording collection, playback speed, font enlargement, hint-then-record-again behavior, and per-essay progress.

The two attached Model Essay Memorization Golden Manuals and the four reviewed lessons are the reference for these checks. This file records a release gate; it does not replace the manuals or approve generated teaching content.
