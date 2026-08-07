# Phrasal Verb lesson imports

This directory contains the reviewed source-data fragments for lessons 02–329.
Lesson 01 (`Build`) remains in the published bundle and is retained by
`tools/build-phrasal-verb-expansion.mjs` whenever the catalogue is rebuilt.

The supplied source set contained two PDFs numbered 15. Their creation order
and titles are preserved without dropping either lesson:

- lesson 15: `Switch`
- lesson 16: `Cool`
- the source files numbered 16–34 continue as lessons 17–35

Lessons 36–329 come from the 294-file PDF/DOCX/Markdown library recorded in
`tools/phrasal-verb-import-manifest.json`. Duplicate source numbers and the two
intentional duplicate-content pairs are retained as separate lessons because
each supplied file is part of the requested catalogue. Together with `Build`,
the catalogue contains 329 lessons and 21,320 questions.

The checked-in override file documents the three reviewed source exceptions:

- TIP imports only its genuine pages 1–16; later pages are unrelated material;
- MARK has a reviewed 70-answer replacement because its PDF has no answer key;
- GET Volume 3 has a one-question patch for its present-but-unlabelled q80 answer.

Run the mixed-format importer in audit mode before writing fragments:

```sh
python3 tools/import-phrasal-verb-library.py \
  --source-dir /path/to/Phrasal\ Verb \
  --lesson-dir tools/phrasal-verb-lessons \
  --overrides tools/phrasal-verb-import-overrides.json \
  --audit
```

The importer requires exactly 294 files and 19,350 questions. A normal run
writes only after every file passes and refreshes the SHA-256 manifest.
Each imported question records its Exercise page and Answer Key page; split
Chinese translations may additionally record `promptZhSourcePage` or
`answerZhSourcePage`.

Rebuild and verify from the site root:

```sh
python3 tools/verify-phrasal-verb-pdf-imports.py \
  --lesson-dir tools/phrasal-verb-lessons \
  --pdf-dir /path/to/source-pdfs
node tools/build-phrasal-verb-expansion.mjs
node tools/generate-phrasal-verb-catalog.mjs
node tools/generate-phrasal-verb-sql.mjs
node tools/generate-homework-resource-catalog.mjs
node --test tools/test-phrasal-verb-system.mjs
```

The older PDF verifier remains available for the historical lessons 02–35.
The mixed-format importer performs the source reconciliation for lessons
36–329 and the application/Worker tests then enforce catalogue parity.
