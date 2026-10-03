# Polysemy MCQ answer review — 3 October 2026

## Finding

The published exercise answer key sometimes assigned a practice sentence to the wrong Chinese meaning. The error was in the imported content and its database answer catalogue; the UI displayed and graded the incorrect key consistently. For example, `high-30-1` (“The teacher had a high opinion of his work”) was keyed to the `high-level` meaning, while section 30 of `high.pdf` explicitly says `high = 評價、尊重或看法程度高`.

## Cause

The importer aligned numbered PDF sense sections to a shorter final MCQ comparison table using wording similarity and relative position. The final table is not a complete one-to-one list of every practice meaning. In `high.pdf` it omits `high regard/opinion`, `high price/cost`, `high temperature`, `high speed`, and other distinct practice sections. Once a source section was missing or merged, adjacent table rows could absorb its practice questions. The previous review concentrated on the validity of table rows and low-confidence alignment scores; it did not assert, for every sentence, that the keyed meaning agreed with the exact PDF practice section. Some PDFs also use plain-text or unnumbered headings that the first audit parser could not reliably segment.

## Scope and repairs

- Audited all **1,088 published PDF-backed modules** and **48,000 exercise questions**. Every published module has a corresponding PDF manual.
- Matched **45,217** questions to structured PDF sections in the first pass. Reviewed the remaining **2,777** questions with an alternate-layout pass and checked its unmatched or mixed-section cases individually.
- Corrected **1,500 distinct questions across 407 modules**. The first PDF-definition pass fixed 1,422; individually reviewed ambiguous cases fixed 14; the alternate-layout pass fixed 43; mixed exercises grouped under broad source sections fixed 17; four figurative `sound of that` questions were fixed separately.
- Updated each changed question's answer, option list, explanation, and meaning examples. Added a source-defined meaning when the PDF's final comparison table omitted it. Updated the compact website index and the corresponding private database answer catalogue, then changed import versions so browsers fetch the corrected modules.

Representative errors included `high opinion` → `high-level`, `generation` → `generation gap`, physical and computing `entry point` → trading entry point, `crowd-pleaser`/`crowdfunding` → overcrowding, and `I like the sound of that` → literal headphone audio.

## Verification and limits

The post-repair structured-PDF audit reports **zero remaining candidate answer mismatches** under its source-definition and distinct-form checks. All 48,000 question records have a valid answer present in their options; the altered database rows were checked against their expected previous state before migration. The alternate-layout scan still emits low-similarity warnings when a PDF uses a short Chinese label and its MCQ table uses a fuller paraphrase. Those warnings are not proof of wrong answers; obvious contradictions found among them were corrected. This is a comprehensive automated source audit with targeted human review, not a claim that 48,000 meanings were independently proofread by a person.

The underlying import process must not use positional or fuzzy alignment alone for a future batch. Future imports should preserve a direct PDF section-to-question reference, require an explicit approved answer meaning for each sentence, and fail publication if a source section's meaning is absent from the final table without a reviewed source-derived entry.
