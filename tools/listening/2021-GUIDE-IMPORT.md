# 2021 Part A authored guide

The supplied 57-page Edmund Sir guide is imported into
`assets/dse-listening/2021/guide.json` by `import-2021-guide.py`.
The asset records the source SHA-256 and page references, rather than distributing
the source PDF or extracting its branding/contact details.

- Pages 3–22: Q1–56 reference answers, accepted variants, explanations and traps.
- Pages 23–57: 214 bilingual transcript rows across Tasks 1–4 (54/41/46/73).
- Continuation cells crossing pages are joined. Empty columns introduced by the
  footer grid are ignored without discarding the actual two-column body content.
- Speaker labels and Chinese translations are from the supplied guide. Its Q10
  and Q31 editorial caveats remain in the explanations; no guessed replacement
  answers or automatic grading rules have been introduced.
- Transcript navigation cues are matched to the existing segmented recording
  transcript. They are approximate navigation cues, not newly forced-aligned
  word timings. No audio, original question content, illustrations, Part B,
  student answers or database schema are replaced.
- The guide is lazy-loaded on opening 2021, with retry on failure. Answers start
  hidden. Full analyses, individual reveals, bilingual transcript visibility and
  existing shared listening bookmarks are supported.

Validation:

```sh
node tools/test-dse-listening-guide.mjs
node tools/test-dse-listening-guide-ui.mjs
node tools/test-dse-native-questions.mjs
node tools/test-listening-study.mjs
node tools/listening/build-search-index.mjs --check
```

The browser tests use isolated mock sessions/RPCs and never write student data.
Set `PLAYWRIGHT_MODULE` when Playwright is provided by a bundled runtime.
