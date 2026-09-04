# Listening library search

The DSE year selector and IELTS practice selector now provide keyword search with direct Task/Part links. Search covers the available question text, choices, headings and transcripts, including bilingual IELTS transcripts. It does not index private student data or separate answer-key/analysis fields.

- DSE: 44 tasks from the 11 currently available years. Empty years are not advertised as searchable content.
- IELTS: 80 parts from Practices 1–20.
- Typing at least two characters or submitting the form loads only that library's text index. No full practice files or audio are preloaded for search.
- Matching is case-insensitive, supports multiple terms and Chinese, highlights safely escaped snippets, and displays 12 results at a time.
- Normal clicks use existing navigation functions; modified clicks retain normal link behavior. Existing login and access handling is unchanged.
- An unsuccessful index request can be retried. A stale response cannot replace results after the search text changes.

Rebuild with `node tools/listening/build-search-index.mjs` after changing listening question/transcript content. `--check` detects stale indexes during publication. Bump the index version URL in `listening-search.mjs` when shipping updated indexes.

Tests: `node tools/test-listening-search.mjs` and the Playwright-based `node tools/test-listening-search-browser.mjs` (`PLAYWRIGHT_MODULE` optionally points to a bundled installation).

The visible “按圖放大原圖 ↗” caption is removed. Image links and their accessible labels remain usable. No image-restoration preview is installed: the tested generated singer image did not meet the required original-detail fidelity or 4K output size.
