# Sentence Structure imported lesson sources

This directory is the editable, auditable source for Sentence Structure lessons
`ss5` through `ss114`. Each `ssNN.json` file corresponds to one original PDF and
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
sentence-structure-lessons-5-114.js
```

The catalogue command then regenerates the Cloudflare Worker's protected
accepted-answer catalogue. Never edit either generated file by hand.

Published lesson IDs and question IDs are permanent. Correct wording under the
same ID when necessary, but never renumber or reuse an existing ID for unrelated
content.

If the source PDF intentionally gives two questions the exact same bilingual
answer, preserve both answers verbatim and add `duplicateAnswerOf` to the later
question, pointing to the first question ID. The builder rejects unmarked
duplicates and invalid pointers.
