# Sentence Structure imported lesson sources

This directory is the editable, auditable source for Sentence Structure lessons
`ss5` through `ss345`. Each `ssNN.json` file corresponds to one original PDF and
contains the lesson material, source-page provenance and exactly 50 bilingual
questions.

After editing any lesson:

```sh
node tools/build-sentence-structure-expansion.mjs
python3 tools/verify-sentence-structure-pdf-imports.py \
  --pdf-dir /path/to/the/original/pdfs
node tools/generate-sentence-structure-catalog.mjs
node tools/test-sentence-structure-system.mjs
```

The build command generates the public browser bundle:

```text
sentence-structure-lessons-5-345.js
```

The catalogue command then regenerates the Cloudflare Worker's protected
accepted-answer catalogue. Never edit either generated file by hand.

Published lesson IDs and question IDs are permanent. Correct wording under the
same ID when necessary, but never renumber or reuse an existing ID for unrelated
content.

The source batch after `ss200` contains two different PDFs both labelled
“Sentence Structure 201”. Their permanent system mapping is intentionally:

- `ss201`: `For good reason`;
- `ss202`: `There is good reason to ...`; and
- original source numbers 202–274 continue as `ss203`–`ss275`.

Consequently, source PDFs 218–274 in that batch map to `ss219`–`ss275`.
The source number and permanent lesson ID remain offset by one throughout this
range because both distinct source documents numbered 201 are retained.

The source batch numbered 275–343 contains two different PDFs both labelled
“Sentence Structure 310”. Files are ordered by source number and then exact
filename, so the permanent mapping is intentionally:

- source 275 maps to `ss276`;
- source 310, `Do not get me wrong, but + clause`, maps to `ss311`;
- source 310, `With all due respect, + clause`, maps to `ss312`; and
- source 343 maps to `ss345`.

The auditable inventory and source hashes for this batch are stored in
`../sentence-structure-import-manifest-275-343.json`. Regenerate the batch with
`../import-sentence-structure-library.py`; the importer deliberately retains
both source-310 documents instead of collapsing the duplicate number.

The importer separates Chinese and English source lines before writing each
Benefits or Important Rules card. It contains reviewed, card-specific mappings
for English-only source cards, terse Chinese extraction fragments and
Chinese-only source cards; generic fallback explanations are forbidden. The
import fails if Chinese-primary text is too short, starts in English, is more
than twice as Latin-heavy as Chinese, leaks a numbered English heading, or uses
an unreviewed translation. Prose-heavy cards (40 or more English words) must
also contain at least one Chinese character for every two English words.
Appended Core Grammar Bank and Related Structures blocks are split at semantic
headings so no English teaching card exceeds 1,000 characters. Any future
ratio exception must be an exact card ID with a reviewed reason in
`BILINGUAL_RATIO_EXCEPTIONS`; the current corpus has no exceptions.

Chinese labels that point to an English formula or example retain that exact
source token inside a balanced `【…】` reference. Short English list labels are
rendered with Chinese-first connectors rather than mechanical `其中，` prefixes.
Extraction-only ordinals, bullet glyphs, `Core Grammar Bank` labels and
`Pattern N:` headings are removed while their substantive content remains.
Within-card exact repeats are collapsed automatically. A cross-card repeat is
accepted only when its exact lesson, field, sentence, card IDs and source-backed
teaching reason appear in `PEDAGOGICAL_REPEAT_ALLOWLIST`; all other repeats fail
the import.

Two pairs in this batch have matching-looking lesson titles but remain separate
source documents and permanent lessons: source 229/230 map to `ss230`/`ss231`,
and source 247/248 map to `ss248`/`ss249`. Preserve each exact numbered source
filename and never collapse either pair.

Keep each exact source filename in `source.file`; do not collapse or renumber the
two source documents after publication.

When a source sentence crosses a physical page boundary, keep its normal
`questionPage` or `answerPage` and add `promptContinuationPage` or
`answerContinuationPage`. The PDF verifier joins only those explicitly cited
pages, so a page-spanning source remains auditable without weakening validation.

If the source PDF intentionally gives two questions the exact same bilingual
answer, preserve both answers verbatim and add `duplicateAnswerOf` to the later
question, pointing to the first question ID. The builder rejects unmarked
duplicates and invalid pointers.
