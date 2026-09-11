# DSE Speaking source layouts

The 282 entries in `dse-speaking-source-layouts.js` provide explicit paragraphs,
subheadings, list entries, tables and the separate discussion task. Both the
source-text panel and student/examiner digital papers use the same segments.

## References

These are the user-supplied PDF filenames. Years follow the year printed on
the paper, including the final two files whose filenames differ from that year.
The per-set `paper` field identifies the corresponding rendered source page.

| Printed year | Supplied PDF | Sets |
|---|---|---:|
| 2012 | 2012 Speaking Past Paper.pdf | 24 |
| 2013 | 2013 Speaking Paper 4.pdf | 30 |
| 2014 | 2014 DSE Speaking Paper 4 Questions.pdf | 30 |
| 2015 | 2015 Speaking DSE.pdf | 27 |
| 2016 | 2016 DSE Paper 4.pdf | 27 |
| 2017 | 2017 DSE Speaking.pdf | 24 |
| 2018 | 2018 DSE Speaking.pdf | 24 |
| 2019 | 2019 DSE Speaking.pdf | 24 |
| 2023 | DSE 2023 Speaking.pdf | 24 |
| 2024 | 2025 DSE Speaking Paper 4.pdf | 24 |
| 2025 | 2026 DSE SPeaking paper 4.pdf | 24 |

## Review method and scope

All source pages were processed with OCR layout coordinates and aligned to the
existing imported text. Paragraph spacing, headings and columns were reviewed;
low-confidence alignments, short fragments, unusually long paragraphs, lists,
and missing source text received additional checks against the rendered scans.
Text wrapping beside illustrations must not introduce a paragraph break.

The layout data retain the existing passage wording except for source-referenced
repairs needed to restore omitted or interleaved text. This is not a wholesale
transcription audit of every pre-existing spelling or wording choice.

Notable source repairs include the missing passages/tables in 2013 sets 3.2,
5.1 and 8.1 and 2015 set 6.1; the missing opening of 2014 set 5.1; columns in
2024 sets 3.2, 3.3, 4.2, 5.2, 6.3 and 7.1 and 2025 set 1.2; and unrelated
preceding-question fragments in 2016 sets 7.3 and 8.1 and 2019 sets 5.1 and 5.2.
Interviews, product sections, statistics and task instructions remain distinct.

## Maintenance and validation

Each entry has a SHA-256 of its original catalogue `sourceText`. If source text
changes, review that set's supplied paper and update its layout and digest
together. Do not regenerate paragraphs by splitting at words such as “However”
or “According to”. Future uncatalogued sets may supply blank-line paragraphs.

Run:

```sh
node tools/test-dse-speaking-system.mjs
node tools/test-dse-speaking-source-layouts.mjs
```

The release gate covers all 282 entries, source-page references, source digests,
both actual renderers, list/table structure, escaping, bookmark-key uniqueness,
and preservation of existing saved keys when paragraph boundaries change.
Browser review covers a standard article, interview, numbered list and a table
with internal horizontal scrolling at a narrow viewport.
