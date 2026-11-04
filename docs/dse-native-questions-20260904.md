# DSE Part A native question rebuild

Scope: 2012, 2013, 2014, 2015, 2017, 2018, 2019 and 2020; 32 tasks and 439 numbered questions.

- Replaced page-image question sheets and generic prompts with source-specific text, tables, radio buttons, dropdowns, ranking, ordered picture selection and interactive maze grids.
- Retained the original small illustrations and photos. Figure crops are rendered directly from the supplied PDFs at A4 300-dpi-equivalent resolution and saved losslessly as WebP. This avoids extra JPEG compression, but cannot recover detail absent from a scanned original. These are not claimed to contain newly recovered 4K detail.
- No AI-generated or reimagined replacement is referenced or shipped. The lounge plan retains the original illustration, rather than a newly drawn approximation. Map labels, drawing positions and picture content are preserved.
- Whole-page scans are no longer displayed in these tasks. Existing scan files remain in the repository to avoid breaking old references.
- Audio, segmentation, timestamps, transcripts, student records and authentication are unchanged.

## Reproduction

`node tools/listening/rebuild_archive_questions.mjs` builds the year data scripts from `tools/listening/archive-question-layouts.mjs`.

`python3 tools/listening/extract_archive_figures.py` extracts the bounded figure regions from the original PDFs specified in that script. Requires Poppler (`pdftoppm`) and Pillow. The coordinates use the reviewed 1191 × 1684 page coordinate system. No generative restoration is used.

## Checks

- `node tools/test-dse-listening-archive.mjs`: every question number exactly once, no full-page assets, all figure paths exist, original transcripts available.
- `node tools/test-dse-native-questions.mjs`: production renderer mounted in a local browser fixture; all 32 tasks at desktop and mobile widths, image loading, input coverage, selection limits, ranking/order uniqueness, maze interaction and retention when switching tasks. Requires Playwright; `PLAYWRIGHT_MODULE` can identify a bundled installation. Optional `DSE_QA_OUTPUT` saves screenshots outside the site.
- Existing 2016, 2021, 2023, listening-system, listening-study and Paper 3 portal regressions.

The browser fixture does not access live accounts or write student data.
