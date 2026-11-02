# IELTS Task 2 memorization rollout: editorial gate

Status on 2026-11-02: **source extraction complete; teaching content not approved for publication**.

## Verified source inventory

- 228 IELTS Writing Task 2 model essays: 103 Opinion, 28 Advantages / Disadvantages, 17 Cause / Solution, 41 Direct Question, and 39 Discuss Both Views.
- Four existing lessons have individually reviewed teaching support: Opinion 80, Opinion 3, Discuss Both Views 4, and Cause / Solution 2.
- The other 224 essays have individual source bundles in `essay-memory-lessons/`. They contain 3,723 original English sentences, the corresponding Traditional Chinese translations and sentence roles, the medium-fill answer list, and exact narration word timing.
- `tools/build-essay-memory-lessons.js` rejects missing source records, empty translations, absent medium answers, duplicate lesson keys, and any word mismatch between a model essay and its narration. The build completed for all 228 essays.

## Why the other lessons are not linked to students yet

An automatic teaching-support prototype was run against every new source bundle. The editorial audit found:

| Requirement | Failed cases |
| --- | ---: |
| Simpler whole-sentence English differs meaningfully from the original | 2,430 / 3,723 sentences unchanged (65%) |
| Sentence structure has a specific, source-accurate analysis | 2,058 generic fallbacks |
| Transfer question identifies the source sentence and transfers its actual reasoning | 2,688 / 2,688 missing source links |

The prototype is not included in the published student journey. An unchanged sentence cannot be presented as a simpler paraphrase. A generic split cannot be presented as the sentence's actual structure. A reusable transfer question cannot be presented as an application of that essay's argument without a traceable source link.

## Release acceptance for each remaining essay

1. Review every English sentence against the writing-practice model essay and every Chinese translation against the canonical translation. Keep narration aligned to the exact English words.
2. Write a genuinely simpler, meaning-preserving English sentence for each source sentence. Audit word choice, grammar, scope, stance, conditions, negation, and cause and effect. Where the original is already basic, explain that honestly and use a distinct, useful bridge rather than repeating the source.
3. Review every vocabulary simplification in its sentence context. Highlight only words or phrases actually simplified.
4. Segment every source sentence without losing or changing a character. Explain its actual grammatical and logical relation. Write a topic-neutral usage note that remains true outside that essay, plus four plausible choices, one key, and specific feedback for each distractor.
5. Build stance/route/evidence/logic exercises from the actual paragraphs, preserving the essay's task type and argument direction. Do not turn a cause/solution essay into a for/against essay.
6. Write at least ten distinct cross-topic transfer tasks that each cite source sentence indices, preserve that source's reasoning, and use plausible wrong choices of similar length. Review Traditional Chinese line breaks at supported viewport and font sizes.
7. Run the existing browser, mobile, recording, progress, and source-integrity tests; inspect the entire 11-stage journey before adding the essay to the live selector and writing-practice entry point.

The two attached Model Essay Memorization Golden Manuals and the four reviewed lessons are the reference for these checks. This file records a release gate; it does not replace the manuals or approve generated teaching content.
