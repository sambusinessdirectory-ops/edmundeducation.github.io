# Phrasal Verb lesson imports

This directory contains the reviewed source-data fragments for lessons 02–35.
Lesson 01 (`Build`) remains in the published bundle and is retained by
`tools/build-phrasal-verb-expansion.mjs` whenever the catalogue is rebuilt.

The supplied source set contained two PDFs numbered 15. Their creation order
and titles are preserved without dropping either lesson:

- lesson 15: `Switch`
- lesson 16: `Cool`
- the source files numbered 16–34 continue as lessons 17–35

Together with `Build`, the catalogue contains 35 lessons and 1,970 questions.
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
node --test tools/test-phrasal-verb-system.mjs
```

The PDF verifier checks every imported prompt, translation, answer, teaching
example, benefit and rule against its declared source PDF before publication.
