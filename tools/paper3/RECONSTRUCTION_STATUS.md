# Paper 3 Part B reconstruction status — 2026-10-01

The 14 new readers were published as **校對預覽 / review previews** at the user’s request so they can be checked on the live site. Each page retains the source scan beside selectable OCR text, and the first-pass Chinese translation is clearly labelled for review. These previews are not yet equivalent to the bespoke 2025 B2 reconstruction. Existing public readers remain unchanged.

## Source inventory

Fourteen new B1/B2 reader drafts were built from local original-paper scans (2012–2023). Each has a page-by-page Data File and Question-Answer Book, selectable OCR English, a separate first-pass Traditional Chinese layer, a faithful source-page image for visual checking, local reading progress, and clearly labelled extra-practice notes. Unlike the hand-redrawn 2025 B2 Wellness Month reader, these drafts **do not yet have document-specific HTML reconstruction** for every email, poster, chart and conversation.

| Reader | Source status | Release status |
| --- | --- | --- |
| 2012 B1 | 9 Data File + 4 QAB pages found | Live preview; editorial review required |
| 2014 B1 / B2 | Complete local scans found | Live preview; editorial review required |
| 2015 B1 | Complete local scan found; three trailing watermark-only leaves excluded | Live preview; editorial review required |
| 2016 B1 | Complete local scan found | Live preview; editorial review required |
| 2018 B1 | Complete local scan found; trailing watermark-only leaf excluded | Live preview; editorial review required |
| 2019 B1 / B2 | Complete local scans found; trailing watermark-only leaves excluded | Live preview; editorial review required |
| 2020 B1 | Complete local scan found | Live preview; editorial review required |
| 2021 B1 / B2 | Complete local scans found | Live preview; editorial review required |
| 2022 B1 | **Data File page 3 is blank in the available scan** | Live incomplete preview; Data File p. 3 missing |
| 2023 B1 / B2 | Complete local scans found | Live preview; editorial review required |
| 2024 B1 / B2 | Partial 2024 B2 annotated material locally; full originals located only on third-party indexed document pages, without verifiable complete downloadable scans | Blocked pending complete source |
| 2025 B1 / B2 | Existing public native readers | No changes here |
| 2026 B1 / B2 | No complete, verifiable local source found | Blocked pending complete source |

The [archived dse.life index](https://web.archive.org/web/20241228044243/https://dse.life/ppindex/eng/) lists Paper 3 through 2023 and a 2024 sample paper, not the full 2024/2026 originals. Search results identify 2024 B1/B2 Data Files and QABs on Scribd, but text previews alone cannot establish all visual details or provide a reliable source-page audit. Mock papers with similar titles were deliberately excluded.

## Remaining editorial checks

1. Verify every Data File and QAB leaf against its original, including page number, source document type, table, chart, photo, message order and task wording. Resolve the missing 2022 B1 page 3.
2. Replace OCR artefacts and correct names, dates, numbers, punctuation and task wording. In particular, inspect any pages listed as low-confidence in `reconstruction-audit.json`.
3. Editorially review every Chinese paragraph against the corrected English. The current translations are machine-generated first passes and can mishandle proper names or scan artefacts.
4. Build document-specific native HTML for the emails, posters, charts, chats, forms and QAB fields, matching the 2025 B2 reader standard; keep original images as supporting visual elements.
5. Review page controls, Chinese visibility, mobile layout, printing, local progress and extra-practice labels on the published preview. Corrections can then be applied in place.

Run the structural audit with:

```sh
python3 tools/paper3/audit_native_archive.py paper3 > tools/paper3/reconstruction-audit.json
```

The structural audit checks assets and counts; **a clean structural result is not editorial approval**.

## Corrections after live review

- 2021 B2 Data File source page 19 (reader leaf 2): malformed Tesseract TSV had leaked into the selectable English and its machine translation. The English was transcribed against the source image, the Chinese was rewritten, and a manual override now preserves both on rebuild. The audit now flags raw TSV records and extreme digit noise; its new rule rejects the previous page text and accepts the correction.
