# DSE Traditional Chinese Translations

Scope: all 42 populated 2012-2023 and 2025-2026 A/B1/B2 sections. Exclude 2024.
Translate each passage and every question field in professional written Traditional
Chinese for Hong Kong learners. Preserve qualifications, names, figures, dates,
paragraph references, option letters and blanks. Do not provide answers, repair
intentional proofreading errors, or change the English examination content.

Run `node tools/dse-reading-translations.mjs source dse-2026-a` to obtain the exact
source fields and hash. Editorial JSON files use this structure:

```json
{
  "articleId": "dse-2026-a",
  "locale": "zh-Hant",
  "sourceSha256": "the source hash from the source command",
  "translations": {
    "title": "繁體中文標題",
    "paragraphs/0/text": "完整段落翻譯"
  }
}
```

Use `compact-source` to list unique text requiring editorial translation. Include
each listed path once. Identical source strings reuse that translation; standard
labels such as paragraph numbers and True/False are expanded by the shared builder.
The final database payload must contain every source path exactly once.
Each value must contain Chinese; keep
English vocabulary alongside its Chinese gloss where a question tests the word.
Do not invent transliterations of unverified Chinese personal names: retain the
English name and add the appropriate Chinese role or descriptive label.
For proofreading exercises, preserve deliberately incorrect claims and wording
without identifying or supplying the correction; retain the English word being
tested where needed.
Text that is only in an image must be reviewed separately and translated as a
caption supplement, without changing the original image or exposing answers.

Run `node tools/dse-reading-translations.mjs status` to validate every completed
file. `seed` produces database rows. Files in this tools directory are editorial
sources, not public browser bundles. Database uploads and live verification must
be recorded separately from local completion.

## Verification

`node tools/test-dse-reading-translations.mjs --complete` requires all 42 sections,
656 passage blocks and 965 questions. It rejects source drift, missing fields,
changed answer values, missing blanks, placeholders and common Simplified Chinese
characters. The existing reading-system and catalogue tests also remain required.

The September 2026 import restores OCR omissions and paragraph boundaries from
the supplied PDFs using `tools/dse-reading-passage-corrections.json`; it does not
alter intentionally incorrect proofreading questions. Original images are retained.

Database access is through `dse_reading_article_translation` using the existing
authenticated student-session boundary. Run `tools/test-dse-reading-translations.sql`
against the database to check the RPC and access restrictions using rolled-back
synthetic fixtures. No direct table access is granted to browser roles. The RLS
"no policy" advisory is intentional: reads are gated by the private checked RPC.
