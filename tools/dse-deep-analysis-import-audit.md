# DSE 2023 Part A: complete deep-analysis reader

Implemented in the Reading Comprehension portal, not Reading Analysis.

## Source preservation

- Source: `Edmund Sir - 2023 Reading A - Question Analysis 2.pdf` (322 pages).
- `dse-reading-analysis/dse-2023-a/original.pdf` is an unchanged byte-for-byte copy.
- Every page has a searchable text record, SHA-256 digest, and original-layout WebP rendering.
- Page body, running header and footer reconstruct the complete extracted page text exactly.
- Question 1–22 span pages 35–321. Pages 1–34 and 322 are available as supplementary content, as well as within the original PDF.
- No paraphrasing, correction, deduplication, shortening or removal of source text was performed. Original page images/PDF remain authoritative for typography, colours, and mixed-font extraction ordering.
- Q21 has a source caveat: p.34 lists “A good example”; p.280 onward accepts either supported position. Both are retained and the reader explicitly explains this difference without assigning an automatic score.

## Experience

- All question parts must be attempted before opening the answer and analysis.
- Guided steps, full-text and original-page modes; search, mixed-content category navigation, evidence passage panel, font sizes and explicit “understood” markers.
- Modal keyboard focus, Escape and close return to the original question. Existing answers/drafts are retained; study time pauses while reading.
- Understanding markers are per student, article, question, source version and device. They are not cloud-synced or exam scores.
- Source data is fetched on demand; original page images are lazy-loaded. Failed fetches expose a retry button and never delete answers.
- No auth, grading, schema, database or other passage content was changed.

## Verification

`python tools/import-dse-deep-analysis.py --check` checks the local PDF against every generated text record and the archived PDF.

`node tools/test-dse-deep-analysis.mjs` checks all 322 pages, hashes, disjoint complete page coverage, all 22 question boundaries, original files and answer-gating integration. Included in the Pages release workflow.

`node tools/test-dse-deep-analysis-browser.mjs` uses Playwright with local-only mocked auth. Covers every question, incomplete answers, multiparts, original-page images, full text, search, saved markers, retry after a simulated HTTP 503, preserved draft answers, keyboard return and 390px/820px/1440px viewports. It never uses real student accounts or writes live records.

Existing reading system, enhancements, catalogue, audio and DSE translation checks were also run.

This working branch is `dse-2023-deep-analysis-20260904`, based on `c613ae9c5`. Publication requires the normal commit/push/release workflow; no live deployment has been performed for this change.

## Source emphasis update

- Every page now has `richBody` runs derived from PDF character font names/sizes and highlight rectangle positions. Yellow, pink, cyan and other source highlights become responsive web highlights; bold and italic text retain their source emphasis.
- Relative font sizes are adapted to 0.93–1.7 times the reader font size, so source emphasis scales with the user's accessibility font control without oversized text breaking phone layouts.
- Visual-row extraction uses a wider baseline tolerance to reunite mixed-size Latin/CJK phrases (for example p.248's “但題目問 BOOM 的直接成因。”). The original plain text remains unchanged, and every page passes a non-whitespace source-character multiset assertion. The unchanged PDF/page images remain available.
- Source vertical gaps are translated into bounded paragraph spacing; no text is summarized or deleted. Search matches use a separate purple outline, distinct from source highlighter colours.
- Verified exact source examples p.173 (cyan + speech verb bold), p.220 (pink/yellow and enlarged text), p.223 (yellow enlarged checklist), and p.248 (pink enlarged causal distinction). Browser checks include desktop/tablet and 390px phone wrapping.
