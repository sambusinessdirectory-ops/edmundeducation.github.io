# 2016 DSE original listening paper

The reusable project standard, refinement history and release checklist are documented in `tools/listening/DSE-LISTENING-PAST-PAPER-DIGITIZATION-GOLDEN-MANUAL.md`.

Source: user-supplied `2016 DSE Just listening.pdf`, 8 scanned Part A pages, SHA-256 `5f5f367f94732327102072cf55996611dff3dd7da11b19e2e94cadbb332dc28e`.

The supplied scan was used only as a layout reference. The live paper is reconstructed with semantic HTML and CSS in `dse-listening-2016-paper-layout.mjs`; it does not display the scanned page images. The remaining reference renders and OCR geometry in this folder are not loaded by the website. Questions 10–12 use A=yes, B=no; questions 40 and 47 permit A/B/C combinations, matching the existing question renderer.

The digitised paper is the default 2016 answering view. It shares the current listening answer map and stores answers under the signed-in student's ID in this browser; the custom question layout is available only through the optional layout button. Audio, answer checking, per-question reference answers and analysis, POS guesses, mistake notes, translations, and transcripts remain available around the paper. The three paper illustrations use the existing reconstructed 1280-pixel assets. No answers are inferred from the scan.

Validation: `node tools/test-dse-listening-original-paper.mjs`. Browser integration tests in `tools/test-speaking-study-tools-browser.mjs` and `tools/test-speaking-study-integration-browser.mjs` run against a local server with synthetic accounts and mocked external services.
