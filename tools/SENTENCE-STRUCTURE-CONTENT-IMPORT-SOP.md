# Sentence Structure System — content creation and import SOP

This is the permanent reference for converting a Sentence Structure source PDF
into a complete, auditable lesson in the EdmundEducation Sentence Structure
System.

It covers:

- inspecting and transcribing the source PDF;
- formatting lesson, question and provenance fields;
- preserving the Chinese-first presentation used by the learning pages;
- generating the public lesson bundle and protected Worker answer catalogue;
- extending Supabase and the Cloudflare Worker for new lesson IDs;
- testing, publishing and verifying a release; and
- safely correcting published material.

| Document status | Value |
| --- | --- |
| Last verified | 23 July 2026 |
| Applies to | EdmundEducation Sentence Structure System |
| Current corpus | `ss1`–`ss70`, 3,500 questions |
| Current imported JSON range | `ss5`–`ss70`, 66 lessons and 3,300 questions |
| Legacy inline range | `ss1`–`ss4`, 4 lessons and 200 questions |
| Standard import unit | One bilingual lesson with exactly 50 questions |
| Saved-content version | `"1"` |

Follow this SOP for every later import unless the application contract is
deliberately redesigned first.

## 1. System flow at a glance

The current controlled path is:

```text
Source PDF
  → text extraction plus full visual page inspection
  → tools/sentence-structure-lessons/ssNN.json
  → PDF provenance verification
  → sentence-structure-lessons-5-NN.js
  → sentence-structure-data.js merges ss1–ss4 with the imported lessons
  → four-page browser lesson and exercise
  → generated Worker answer catalogue
  → Worker validation and Supabase persistence
  → automated tests, visual QA and production rollout
```

Lessons `ss1`–`ss4` are legacy inline data in
`sentence-structure-data.js`. Do not use that format for new lessons. Lessons
`ss5` onward use one editable JSON source file per lesson.

The public expansion bundle and Worker answer catalogue are generated files.
A lesson is not complete merely because it appears in the browser: the JSON,
bundle, frontend, catalogue, Worker, Supabase and tests must all agree.

## 2. Canonical files and ownership

| Purpose | Canonical file |
| --- | --- |
| This SOP | `tools/SENTENCE-STRUCTURE-CONTENT-IMPORT-SOP.md` |
| Editable imported lessons | `tools/sentence-structure-lessons/ssNN.json` |
| Imported-lesson notes | `tools/sentence-structure-lessons/README.md` |
| Legacy `ss1`–`ss4` and final lesson merge | `sentence-structure-data.js` |
| Generated public imported-lesson bundle | `sentence-structure-lessons-5-70.js` |
| Imported-bundle builder | `tools/build-sentence-structure-expansion.mjs` |
| PDF/source verifier | `tools/verify-sentence-structure-pdf-imports.py` |
| Browser rendering and answer checking | `sentence-structure.js` |
| Page, lesson count and cache versions | `sentence-structure.html` |
| Sentence Structure styling | `sentence-structure.css` |
| Generated protected answer catalogue | `workers/sentence-structure/src/catalog.js` |
| Catalogue generator | `tools/generate-sentence-structure-catalog.mjs` |
| Worker validation and API | `workers/sentence-structure/src/index.js` |
| Fresh-install Supabase schema | `supabase-sentence-structure.sql` |
| Latest production widening migration | `supabase-sentence-structure-lessons-40-70.sql` |
| Root system tests | `tools/test-sentence-structure-system.mjs` |
| Worker tests | `workers/sentence-structure/test/worker.test.mjs` |
| Worker operations | `workers/sentence-structure/README.md` |
| Website deployment | `.github/workflows/pages.yml` |

### Edit manually

- the new or corrected `tools/sentence-structure-lessons/ssNN.json`;
- range/configuration files when the highest lesson number changes;
- the fresh-install SQL schema and a new forward migration;
- Worker and root tests; and
- HTML cache versions and displayed lesson count.

### Never edit manually

- `sentence-structure-lessons-5-70.js`; or
- `workers/sentence-structure/src/catalog.js`.

Regenerate both files from their canonical sources.

When the highest lesson changes, the bundle filename must also change so its
range remains truthful. For example, adding `ss71` changes the generated file
to `sentence-structure-lessons-5-71.js`.

## 3. Standard lesson and interface contract

A normal imported lesson must contain:

1. one permanent lesson ID such as `ss71`;
2. matching display order and a stable kebab-case slug;
3. English and Traditional Chinese lesson titles;
4. source filename, physical page count and page inventories;
5. at least one formula;
6. at least one bilingual example with an exact red-highlight target;
7. bilingual learning benefits;
8. bilingual important rules, with examples where useful;
9. bilingual exercise instructions;
10. exactly 50 consecutively numbered exercises;
11. an English and Traditional Chinese prompt for every exercise;
12. a supplied first word or opening text;
13. an English and Traditional Chinese suggested answer;
14. an exact English answer substring to highlight in red; and
15. physical PDF page provenance for every source-derived question field.

The browser generates four pages:

1. Formula + Example
2. Benefits 學習好處
3. Important Rules 重要規則
4. Exercise

Bookmarks, partial submission, correction rounds, completed-card hiding,
attempt history and administrator progress work automatically after every
system layer accepts the new lesson ID.

### 3.1 Chinese-first presentation contract

Every Benefits and Important Rules card must render in this order:

1. Traditional Chinese explanation in the larger primary font; then
2. English explanation underneath in the smaller secondary font.

The JSON still stores both fields with their semantic names:

```json
{
  "zh": "中文解釋。",
  "en": "English explanation."
}
```

Do not swap the text between `zh` and `en` to achieve visual ordering. The
renderer deliberately outputs `.chinese` before `.english`.

The current implementation is:

- `renderBenefitsPage()` in `sentence-structure.js`: Chinese, then English;
- `renderRulesPage()` in `sentence-structure.js`: Chinese, then English, then
  any examples;
- `.benefit-card .chinese` and `.rule-card .chinese` in
  `sentence-structure.css`: larger, bold primary text; and
- `.benefit-card .english` and `.rule-card .english`: smaller, muted secondary
  text.

The root test asserts both DOM order and visual class contract. This order
applies to all lessons, including legacy `ss1`–`ss4` and imported `ss5`
onward.

Other pages retain their existing layouts. Do not infer that every bilingual
field elsewhere must automatically be reordered.

### 3.2 Current hard limits

| Item | Current value |
| --- | ---: |
| Questions per lesson | Exactly 50 |
| Question IDs | `ssN-q01` through `ssN-q50` |
| Saved content version | `"1"` |
| Bookmark limit | 4,000 per student |
| Bookmark request body | 768 KiB at the Worker |
| Bookmark JSON accepted by Supabase | 512 KiB |
| Saved round summaries | 250 per attempt |
| Saved attempts | 1,000 per student |
| Attempt request body | 128 KiB |
| Attempt result JSON | 96 KiB |

Do not silently shorten, pad, merge or invent questions to force a source into
the 50-question contract. If a source does not contain exactly 50 suitable
questions, revise the source PDF or deliberately redesign the frontend,
Worker, SQL and tests before importing it.

The current corpus contains 3,500 possible bookmarks, below the 4,000 limit.
Before a future release pushes the corpus above 4,000 questions, raise and test
the matching frontend, Worker, SQL payload and pagination limits together.

## 4. Never change published identifiers

Lesson and question IDs are database keys, not cosmetic labels.

- A lesson ID is `ss` plus its permanent number: `ss1`, `ss2`, …, `ss70`.
- Imported filenames use two digits where applicable: `ss05.json`,
  `ss70.json`.
- Question IDs are `ssN-q01` through `ssN-q50`.
- `id` and `order` must agree for a standard sequential import.
- Never reuse an earlier lesson ID for different content.
- Never renumber published questions.
- Never move the content of one published question to another ID.

Saved attempts, correction state and bookmarks refer to these IDs. Correct
published wording under the same ID when necessary. If a question must be
withdrawn or renumbered, use a reviewed data-migration plan.

## 5. Prepare and inspect the source PDF

Keep the master PDF in its approved source location. Do not copy a private
source PDF into the public repository unless it is intentionally downloadable.

### 5.1 Record the source inventory

Before transcription, record:

- exact filename;
- total physical PDF page count;
- lesson, formula and example pages;
- exercise pages;
- answer-key pages;
- any overlapping page roles;
- any missing English or Chinese content;
- any number, prompt, starter or answer spilling onto a neighbouring page; and
- any obvious PDF typo requiring an editorial correction.

The lesson JSON is the current source registry. Its `source` object must contain
the inventory. Do not maintain a separate hand-written 70-row registry that can
drift from the actual data.

Always use physical PDF page numbers beginning at page 1, not a page number
printed inside the document.

### 5.2 Extract and render

Text extraction accelerates transcription, but rendered pages are the final
authority.

The automated verifier requires Python 3 and `pdfplumber`. Check the selected
Python runtime before beginning:

```sh
python3 -c 'import pdfplumber; print(pdfplumber.__version__)'
```

If that import fails:

- in Codex Desktop, load the workspace dependencies and use the bundled Python
  executable it reports; or
- create an isolated virtual environment outside the repository and install a
  compatible `pdfplumber` release there.

Use the same verified Python executable for every
`verify-sentence-structure-pdf-imports.py` command in this SOP. Do not install
packages globally merely to complete an import.

```sh
pdfinfo "/path/to/Sentence Structure N.pdf"
pdftotext -layout "/path/to/Sentence Structure N.pdf" lesson.txt
pdftoppm -png -r 144 "/path/to/Sentence Structure N.pdf" lesson-page
```

`pdfplumber` or `pypdf` may be used when Poppler extraction is unreliable. OCR
may be used for scanned pages, but OCR output must be visually checked.

Inspect every rendered page at readable resolution. Contact sheets help with
orientation, but full-size page images are required for punctuation, Chinese
characters and page-boundary decisions.

### 5.3 Transcription rules

- Preserve source English and Traditional Chinese faithfully.
- Preserve meaningful punctuation, capitalization, names and British spelling.
- Use Traditional Chinese for editorial translations.
- Do not silently improve an awkward but intentional source sentence.
- Record every editorial addition, translation or correction.
- Do not paste Markdown bold markers into JSON strings.
- Use `highlight` for red emphasis.
- Check straight and curly apostrophes carefully.
- Check every full stop, comma and question mark against the exercise and
  answer pages.

## 6. Create the imported lesson JSON

For `ss5` onward, copy the nearest structurally similar JSON file from
`tools/sentence-structure-lessons/` and rename it to the next permanent ID.
Do not add new lesson content directly to `sentence-structure-data.js`.

The following is the standard shape:

```json
{
  "id": "ss71",
  "order": 71,
  "slug": "stable-kebab-case-name",
  "title": "「中文句型名稱」句型",
  "titleZh": "較完整的中文名稱或說明",
  "titleEn": "English lesson title",
  "titleEnSource": "pdf",
  "source": {
    "file": "Sentence Structure 71 - exact source filename.pdf",
    "pageCount": 16,
    "lessonPages": [1, 2],
    "exercisePages": [3, 4, 5, 6, 7, 8, 9, 10],
    "answerPages": [11, 12, 13, 14, 15, 16],
    "omissions": [
      "Record source limitations or editorial additions here."
    ]
  },
  "formula": "Primary formula kept for compatibility",
  "formulas": [
    {
      "id": "ss71-formula-main",
      "labelEn": "Target Structure",
      "labelZh": "目標句型",
      "formula": "Complete displayed formula"
    }
  ],
  "example": "Primary example kept for compatibility.",
  "exampleZh": "主要例句的中文翻譯。",
  "examples": [
    {
      "id": "ss71-example-01",
      "en": "Complete English example.",
      "zh": "完整中文例句。",
      "highlight": "exact target substring"
    }
  ],
  "meaning": {
    "zh": [
      "可選的中文句型意思。"
    ]
  },
  "rules": [
    {
      "id": "ss71-rule-01",
      "zh": "完整中文規則。這是畫面上的主要文字。",
      "en": "Complete English rule. This is the secondary text.",
      "enSource": "pdf",
      "examples": [
        "Correct: …",
        "Incorrect: …"
      ]
    }
  ],
  "benefits": [
    {
      "id": "ss71-benefit-01",
      "zh": "完整中文學習好處。這是畫面上的主要文字。",
      "en": "Complete English benefit. This is the secondary text.",
      "enSource": "pdf"
    }
  ],
  "sourceOmissions": [
    "General source limitation or editorial-provenance note."
  ],
  "instructions": {
    "en": [
      "Rewrite each sentence using the target structure.",
      "The first word of each answer has been provided."
    ],
    "zh": [
      "使用目標句型改寫每句。",
      "每題已提供答案的第一個字。"
    ]
  },
  "questions": [
    {
      "id": "ss71-q01",
      "number": 1,
      "source": {
        "numberPage": 3,
        "questionPage": 3,
        "promptZhPage": 3,
        "starterPage": 3,
        "answerNumberPage": 11,
        "answerPage": 11,
        "answerZhPage": 11
      },
      "prompt": "Complete English exercise prompt.",
      "promptZh": "完整繁體中文題目。",
      "promptZhSource": "pdf",
      "starter": "The",
      "answer": "The complete suggested answer.",
      "answerZh": "完整繁體中文參考答案。",
      "answerZhSource": "pdf",
      "highlight": "exact target structure"
    }
  ]
}
```

Remove an optional property only when it genuinely does not apply. Do not
leave a required bilingual field blank.

### 6.1 Lesson-level field rules

- `id`: permanent database identifier.
- `order`: normally the numeric part of the ID.
- `slug`: stable, lowercase kebab-case internal name.
- `title`, `titleZh`, `titleEn`: required.
- `titleEnSource`: `"pdf"` or a precise editorial label such as
  `"editorial-translation"`.
- `source.file`: exact source filename.
- `source.pageCount`: physical page count.
- `lessonPages`, `exercisePages`, `answerPages`: one-based arrays; overlap is
  allowed.
- `source.omissions`: source limitations and editorial changes that apply to
  the lesson.
- `formula`: primary compatibility value.
- `formulas`: displayed formula list with unique IDs.
- `example` and `exampleZh`: primary compatibility pair.
- `examples`: displayed bilingual examples with unique IDs and exact
  highlights.
- `meaning.zh`: optional Page 1 Chinese meaning section; the current renderer
  accepts either one string or an array of strings.
- `rules`: bilingual items. Store Chinese in `zh` and English in `en`; the UI
  renders Chinese first.
- `benefits`: bilingual items with the same Chinese-first UI contract.
- `instructions.en` and `instructions.zh`: both non-empty arrays.
- `sourceOmissions`: general provenance notes retained for compatibility and
  audit visibility.
- `questions`: exactly 50 question objects.

If the PDF supplies Chinese teaching content without an English equivalent,
write a faithful English editorial translation and record it:

```json
{
  "zh": "PDF 原有中文解釋。",
  "en": "Faithful editorial English translation.",
  "enSource": "editorial-translation"
}
```

Also mention the limitation in `source.omissions` or `sourceOmissions`. Never
mislabel editorial English as PDF-sourced.

## 7. Format every question

Every question must contain:

| Field | Requirement |
| --- | --- |
| `id` | Exact `ssN-qNN` ID |
| `number` | Integer `1`–`50`, consecutive |
| `source` | Physical page provenance |
| `prompt` | Complete English exercise prompt |
| `promptZh` | Corresponding Traditional Chinese prompt |
| `promptZhSource` | Optional; defaults to `"pdf"` |
| `starter` | Exact supplied first word or opening text |
| `answer` | Complete suggested English answer |
| `answerZh` | Corresponding Traditional Chinese answer |
| `answerZhSource` | Optional; defaults to `"pdf"` |
| `highlight` | Exact English answer substring shown in red after checking |
| `acceptedAnswers` | Optional strict alternative English answers |
| `answerParts` | Optional multi-answer structure for a genuinely multipart task |

### 7.1 Starter rule

The normalized suggested answer must begin with the supplied starter,
case-insensitively.

Valid:

```text
Starter: Although
Answer:  Although the shop was small, it sold many useful items.
```

Invalid:

```text
Starter: The
Answer:  Although the shop was small, it sold many useful items.
```

### 7.2 Red-highlight rule

The `highlight` value:

- must be an exact substring of `answer`;
- must occur exactly once in that answer;
- should identify the target structure;
- must be unique within the lesson under the current test contract; and
- may be the complete answer when the whole sentence is the target.

The same exact-once rule applies to example highlights.

### 7.3 Accepted answers

Answer normalization covers:

- Unicode compatibility forms;
- curly and straight quotation marks;
- repeated whitespace;
- spaces immediately before punctuation;
- capitalization; and
- final `.`, `!` or `?`.

It does not accept changed words, word order or materially different internal
punctuation.

When the source genuinely permits another complete answer:

```json
"acceptedAnswers": [
  "First complete valid alternative.",
  "Second complete valid alternative."
]
```

Do not add fragments or loose paraphrases. Every accepted answer is copied
into the protected Worker catalogue.

### 7.4 Editorial Chinese

Use `"pdf"` only when the corresponding Chinese text is present in the PDF.
Use a precise label otherwise:

```json
"answerZhSource": "editorial-missing-in-pdf"
```

or:

```json
"promptZhSource": "editorial-translation"
```

Document the reason in the lesson’s provenance notes. Update the expected
editorial-source list in `tools/test-sentence-structure-system.mjs` if the root
test maintains an explicit allow-list.

### 7.5 Multipart answers

Use `answerParts` only when the task genuinely requires more than one answer,
as in the existing `ss32` Whether/If lesson. Each part requires:

- `label`;
- `starter`;
- `answer`;
- `answerZh`; and
- any part-specific source pages.

When a part appears on a different physical page, use the established
part-specific provenance names on the question source:

- `answerPart0StarterPage`;
- `answerPart0AnswerPage`;
- `answerPart0AnswerZhPage`;
- `answerPart1StarterPage`; and so forth.

An `answerParts[n].source` object may also carry `starterPage`, `answerPage` and
`answerZhPage`. Copy the existing verified pattern that matches the PDF layout
and let the builder and PDF verifier confirm it.

The combined top-level values must follow the application contract:

```text
answer:
  Label A: complete answer || Label B: complete answer

answerZh:
  Chinese answer A || Chinese answer B
```

Copy and adapt the exact `ss32` shape instead of inventing a new multipart
format.

## 8. Map source pages accurately

Each question uses:

| Source field | Meaning |
| --- | --- |
| `numberPage` | Page containing the printed question number |
| `questionPage` | Page containing the English prompt |
| `promptZhPage` | Optional page containing the Chinese prompt |
| `starterPage` | Page containing the supplied opening |
| `answerNumberPage` | Page containing the printed answer number |
| `answerPage` | Page containing the English suggested answer |
| `answerZhPage` | Optional page containing the Chinese answer |

When Chinese and English share a page, the optional Chinese-specific page may
be omitted. The PDF verifier then uses `questionPage` or `answerPage`.

Imported JSON stores the final page mapping directly. The
`sourcePageOverrides` helper in `sentence-structure-data.js` is a legacy
`ss1`–`ss4` mechanism and should not be used for new JSON lessons.

Every page value must be an integer from `1` through `source.pageCount`.

## 9. Build and verify the imported bundle

### 9.1 Updating an existing imported lesson

After correcting an existing `ss05.json`–`ss70.json`:

```sh
node tools/build-sentence-structure-expansion.mjs
python3 tools/verify-sentence-structure-pdf-imports.py \
  --pdf-dir /path/to/the/original/pdfs \
  --first 5 \
  --last 70
node tools/generate-sentence-structure-catalog.mjs
```

Current expected output:

```text
Generated 66 Sentence Structure lessons with 3300 questions.
Verified 66 lessons against their source PDF pages (3300 questions).
Generated 3500 accepted-answer entries.
```

The catalogue total includes legacy `ss1`–`ss4`.

### 9.2 Adding a lesson above the current high-water mark

Adding `ss71` requires all of the following:

1. add `tools/sentence-structure-lessons/ss71.json`;
2. update `LAST_LESSON` in
   `tools/build-sentence-structure-expansion.mjs`;
3. change that builder’s output and generated comment from `5-70` to `5-71`;
4. rename the generated browser bundle to
   `sentence-structure-lessons-5-71.js`;
5. update the bundle filename in
   `tools/generate-sentence-structure-catalog.mjs`;
6. update the bundle filename and lesson count in `sentence-structure.html`;
7. update bundle paths, expected lesson IDs and totals in
   `tools/test-sentence-structure-system.mjs`;
8. update the expansion-bundle path, total and newest-lesson fixtures in
   `workers/sentence-structure/test/worker.test.mjs`;
9. update the default/highest range and help text in
   `tools/verify-sentence-structure-pdf-imports.py`;
10. update `tools/sentence-structure-lessons/README.md`;
11. delete the superseded generated bundle after confirming nothing references
    it; and
12. run the builder before generating the Worker catalogue.

Search for stale range references:

```sh
rg -n "5-70|ss70|length: 70|3500" \
  sentence-structure.html \
  tools \
  workers/sentence-structure
```

Review every result. Some occurrences describe historical migrations and must
remain unchanged; active range and count contracts must be updated.

### 9.3 PDF verification

The verifier defaults to `~/Downloads`, lessons `5`–`70`, and the canonical
lesson JSON directory:

```sh
python3 tools/verify-sentence-structure-pdf-imports.py
```

For a targeted import:

```sh
python3 tools/verify-sentence-structure-pdf-imports.py \
  --pdf-dir "/path/to/pdfs" \
  --first 71 \
  --last 71
```

It checks PDF existence, physical page count and page-local presence of the
prompt, Chinese prompt when PDF-sourced, starter, answer, Chinese answer when
PDF-sourced, and multipart answer fields.

Passing automated verification does not replace visual review. Extraction can
normalize or misread content in ways that only a rendered-page comparison
reveals.

## 10. Regenerate the protected answer catalogue

From the repository root:

```sh
node tools/generate-sentence-structure-catalog.mjs
```

The generator loads:

1. the generated imported-lesson bundle; then
2. `sentence-structure-data.js`, which merges legacy and imported lessons.

It writes `answer` plus every `acceptedAnswers` entry to
`workers/sentence-structure/src/catalog.js`.

Never edit the catalogue manually. Regenerate it whenever:

- an English suggested answer changes;
- an accepted answer changes;
- an imported bundle changes; or
- a lesson is added.

Expected total:

```text
published lessons × 50
```

The Worker catalogue-parity test must match the browser data exactly.

## 11. Decide which production layers must change

| Change | Supabase | Worker | Website |
| --- | --- | --- | --- |
| Correct display-only Chinese teaching text | No | No | Yes |
| Reorder Benefits/Rules presentation only | No | No | Yes |
| Correct an English prompt only | No | No | Yes |
| Change an English suggested answer | Usually no ID migration | Regenerate and deploy | Yes |
| Add an accepted answer | No | Regenerate and deploy | Yes |
| Add a new lesson ID | Migrate first | Update, regenerate and deploy | Publish last |
| Raise bookmark capacity | Update all matching SQL limits/functions | Update body, count and paging limits | Update frontend limit |
| Change the 50-question contract | Coordinated redesign | Coordinated redesign | Coordinated redesign |
| Renumber/delete published IDs | Explicit data-migration plan | Yes | Yes |

### Safe answer correction

When correcting a published answer, consider retaining the former answer
temporarily in `acceptedAnswers` if students were previously credited for it.
Regenerate and deploy the catalogue. Removing it immediately can invalidate
saved in-progress state at the next Worker validation.

## 12. Extend the Worker for a new lesson

For a new highest lesson:

1. extend `LESSON_IDS` in
   `workers/sentence-structure/src/index.js`;
2. widen the bounded lesson portion of `validQuestionId()`;
3. keep `QUESTIONS_PER_LESSON = 50`;
4. regenerate `src/catalog.js`;
5. update the catalogue total in Worker tests;
6. submit at least one real question from the new highest lesson through a
   successful attempt test;
7. retain an out-of-range rejection test; and
8. review bookmark capacity and pagination against the new corpus total.

Current contracts include:

```js
const LESSON_IDS = new Set(
  Array.from({ length: 70 }, (_, index) => `ss${index + 1}`)
);
const QUESTIONS_PER_LESSON = 50;
const MAX_BOOKMARKS = 4000;
const BOOKMARK_PAGE_SIZE = 900;
```

The lesson set and question-ID parser must agree. Do not widen one without the
other. An ID not present in the generated answer catalogue must still be
rejected.

## 13. Extend Supabase for a new lesson

Update the canonical fresh-install schema in
`supabase-sentence-structure.sql`.

The new ID must be accepted by:

1. `_sentence_structure_result_valid`;
2. `_sentence_structure_bookmark_payload_valid`;
3. `sentence_structure_attempts_lesson_id_check`;
4. `sentence_structure_bookmarks_lesson_id_check`; and
5. `sentence_structure_upsert_attempt`.

Create a new transactional, repeatable forward migration. Do not rewrite
`supabase-sentence-structure-lessons-40-70.sql` after it has been applied.
For example:

```text
supabase-sentence-structure-lessons-71-80.sql
```

The current root contract test expects the newest lesson migration to contain
definitions matching the fresh schema for:

1. `_sentence_structure_result_valid`;
2. `_sentence_structure_bookmark_payload_valid`;
3. `sentence_structure_list_bookmarks`;
4. `sentence_structure_list_bookmarks_page`;
5. `sentence_structure_admin_list_bookmarks`;
6. `sentence_structure_admin_list_bookmarks_page`; and
7. `sentence_structure_upsert_attempt`.

The migration must:

- use `begin;` and `commit;`;
- preserve every older lesson ID;
- replace required functions with definitions matching the fresh schema;
- drop and recreate both named lesson-ID constraints;
- add the constraints as `not valid`;
- explicitly validate both constraints; and
- be safe to run again.

Never place a Supabase key, student password or administrator password in SQL,
repository files, shell arguments or screenshots.

### 13.1 Database verification

After applying the migration privately, verify the highest lesson:

```sql
select
  public._sentence_structure_result_valid(
    'ss71',
    '{
      "round": 1,
      "correctIds": [],
      "questionState": {},
      "rounds": [],
      "awaitingNextRound": false,
      "contentVersion": "1"
    }'::jsonb
  ) as result_validator_accepts_new_lesson,
  public._sentence_structure_bookmark_payload_valid(
    '[
      {
        "lessonId": "ss71",
        "questionId": "ss71-q01",
        "includeAnswer": false
      }
    ]'::jsonb
  ) as bookmark_validator_accepts_new_lesson;
```

Both values must be `true`.

Verify both constraints:

```sql
select
  conname,
  convalidated,
  pg_get_constraintdef(oid) as definition
from pg_catalog.pg_constraint
where conrelid in (
  'public.sentence_structure_attempts'::regclass,
  'public.sentence_structure_bookmarks'::regclass
)
and conname in (
  'sentence_structure_attempts_lesson_id_check',
  'sentence_structure_bookmarks_lesson_id_check'
)
order by conname;
```

Both rows must be validated and include the new bounded lesson range.

Also verify:

- the deployed `sentence_structure_upsert_attempt` accepts the lesson;
- student and administrator paged bookmark functions exist;
- required `service_role` execute grants remain present; and
- a lesson beyond the published range is rejected.

Apply and verify the migration before the Worker and website expose the lesson.

## 14. Update cache versions and lesson count

`sentence-structure.html` must load scripts in this order:

1. configuration;
2. generated expansion bundle;
3. `sentence-structure-data.js`; and
4. `sentence-structure.js`.

When lesson content or bundle content changes:

- bump the expansion-bundle query version;
- bump the `sentence-structure-data.js` query only if that file changed;
- update the displayed `data-lesson-count`; and
- change the generated bundle filename when its upper range changes.

Bump:

- `sentence-structure.js` only when application/rendering logic changes; and
- `sentence-structure.css` only when styles change.

The saved content version and browser cache query have different purposes:

- content version controls attempt compatibility;
- query strings refresh browser/CDN assets.

Do not change `version: 1` merely to refresh a cache.

## 15. Automated validation

From the repository root:

```sh
node tools/build-sentence-structure-expansion.mjs
python3 tools/verify-sentence-structure-pdf-imports.py \
  --pdf-dir "/path/to/the/original/pdfs" \
  --first 5 \
  --last 70
node tools/generate-sentence-structure-catalog.mjs
node --check sentence-structure-lessons-5-70.js
node --check sentence-structure-data.js
node --check sentence-structure.js
node tools/test-sentence-structure-system.mjs
git diff --check
git status --short
```

Use the new upper range in every command after adding lessons.

Then validate the Worker:

```sh
cd workers/sentence-structure
npm install
npm run check
```

`npm run check` performs JavaScript syntax checking, Worker tests and a
Cloudflare dry-run bundle.

Do not proceed unless:

- the builder and PDF verifier pass;
- the root suite passes;
- the Worker suite passes;
- catalogue parity is exact;
- the Cloudflare dry-run succeeds;
- the newest migration matches the fresh-schema function definitions;
- the diff is clean of formatting errors; and
- `git status` contains no accidental extracts, screenshots, credentials,
  generated review files or unrelated edits selected for commit.

Do not weaken a validation rule to make incomplete content pass.

## 16. Manual content and interface review

### 16.1 Source review

For every imported lesson:

- compare all 50 English prompts with the rendered PDF;
- compare all 50 Chinese prompts;
- compare all 50 English answers;
- compare all 50 Chinese answers;
- check all supplied starters;
- check all source-page fields;
- inspect formula, examples, Benefits and Important Rules; and
- confirm every editorial translation or correction is documented.

That is at least 200 bilingual text comparisons per lesson, plus teaching
content, starters and provenance.

### 16.2 Browser review

- The dashboard count and lesson-card count are correct.
- The new card appears in the correct order.
- Page 1 shows all formulas and examples.
- Every target example segment is red.
- Page 2 displays Chinese Benefits first in the larger primary font and English
  underneath in the smaller secondary font.
- Page 3 displays Chinese Important Rules first in the larger primary font and
  English underneath in the smaller secondary font.
- Rule examples appear below both explanations.
- Page 4 shows exactly 50 bilingual questions.
- Suggested answers remain hidden before checking.
- Correct answers turn cards pale green without forcing the card to disappear.
- Wrong answers can enter Correction Round without revealing the answer.
- Partial submission checks only filled answers.
- Individual and bulk completed-card controls work.
- Question-only and question-plus-answer bookmarks work.
- An unfinished attempt resumes after reload/login.
- A completed attempt appears in history.
- Administrator progress shows attempt and bookmark counts.

Test desktop and a narrow mobile viewport. Use a designated QA student account
for persistence checks rather than a real student’s account.

## 17. Production rollout

For a new lesson ID, always use:

1. **Supabase first** — apply and verify the additive migration.
2. **Cloudflare Worker second** — deploy the widened range and catalogue.
3. **Website last** — publish the bundle, HTML and other static assets.

This prevents the browser from offering a lesson that cannot be saved.

### 17.1 Deploy the Worker

```sh
cd workers/sentence-structure
npm run check
npm run deploy
```

Verify:

```sh
curl -fsSL \
  https://edmund-sentence-structure.edmundeducation.workers.dev/v1/health
```

The response must report `"ok": true`, expected limits and configured rate
limiters.

Do not run `wrangler secret put` during an ordinary content release. Existing
production secrets remain in place unless a separate key rotation is
authorized.

### 17.2 Publish the website and SOP

Commit only reviewed files:

```sh
git diff --check
git status --short
git add <reviewed-files-only>
git commit -m "Add Sentence Structure lesson N"
git push github main
```

In this repository, `github` is the production GitHub remote. Do not use an
ambiguous plain `git push`.

If the push is rejected because production advanced:

1. fetch `github/main`;
2. inspect the incoming commits and overlapping files;
3. merge or rebase without discarding user changes;
4. rerun all affected tests; and
5. push the verified result.

Wait for the `Deploy GitHub Pages` workflow to succeed.

The Pages workflow excludes `tools`, `workers` and SQL files from the public
site artifact. The SOP remains version-controlled in GitHub, while the
generated root-level browser bundle must be committed because that is the file
Pages serves. The Worker catalogue is deployed separately with
`npm run deploy`.

Verify the live HTML and bundle with a cache-busting query:

```sh
curl -fsSL \
  'https://edmundeducation.com/sentence-structure.html?verify=UNIQUE_VALUE'

curl -fsSL \
  'https://edmundeducation.com/sentence-structure-lessons-5-70.js?verify=UNIQUE_VALUE'
```

After adding lessons, use the new bundle range. Confirm:

- the displayed lesson count;
- the new source filename and lesson ID;
- the final question ID;
- the cache-versioned script reference; and
- Worker health.

### 17.3 Documentation-only changes

An SOP-only correction does not require a Supabase migration or Worker deploy.
Publish the reviewed Markdown to the repository and, when the user keeps a
separate reference copy, replace that copy from the repository version so the
two files remain identical.

## 18. Correcting published material

For a display-only correction:

1. edit the canonical JSON;
2. rebuild the expansion bundle;
3. rerun PDF verification and tests;
4. bump the bundle cache query; and
5. publish the website.

For an answer correction:

1. edit the canonical JSON;
2. decide whether the old answer remains temporarily accepted;
3. rebuild the expansion bundle;
4. regenerate the Worker catalogue;
5. rerun root and Worker tests;
6. deploy the Worker; and
7. publish the website.

Never patch only the generated bundle or catalogue. The next build would erase
the correction.

## 19. Rollback and recovery

If a public lesson is faulty:

1. remove or correct its website exposure first;
2. keep harmless additive Supabase ID permission unless there is a reviewed
   reason to remove it;
3. do not delete student attempts or bookmarks automatically;
4. never reuse the lesson ID for unrelated content; and
5. fix forward, regenerate, redeploy and republish.

Static-site rollback:

```sh
git revert <BAD_COMMIT_SHA>
git push github main
```

Worker rollback:

```sh
cd workers/sentence-structure
npx wrangler versions list
npx wrangler rollback <KNOWN_GOOD_VERSION_ID> \
  --message "Rollback faulty Sentence Structure release"
```

After rollback, verify the website, Worker health and student save flow.
Do not delete Supabase data merely to match a static display rollback.

## 20. Definition of done

- [ ] Exact source PDF filename and physical page count recorded
- [ ] Every PDF page rendered and visually inspected
- [ ] Formula, examples, Benefits, Rules and instructions imported bilingually
- [ ] Chinese appears first in all Benefits cards
- [ ] Chinese appears first in all Important Rules cards
- [ ] Exactly 50 questions imported
- [ ] All starters prefix their answers
- [ ] All highlights are exact, single-occurrence and lesson-unique
- [ ] All source page mappings verified
- [ ] Editorial content labelled and documented
- [ ] Published IDs preserved
- [ ] Expansion bundle regenerated
- [ ] PDF/source verifier passes
- [ ] Protected Worker catalogue regenerated
- [ ] Worker lesson range updated when required
- [ ] Fresh Supabase schema and new forward migration updated when required
- [ ] Bookmark capacity reviewed against total corpus size
- [ ] HTML count, bundle filename and cache query updated
- [ ] Root and Worker suites pass
- [ ] Desktop and mobile visual QA pass
- [ ] Supabase migration verified before exposure
- [ ] Worker deployed and healthy
- [ ] GitHub Pages workflow succeeds
- [ ] Live HTML, bundle, lesson and save flow verified
- [ ] Temporary review artifacts excluded
- [ ] Only reviewed files committed
- [ ] Repository SOP and any external reference copy are identical

## 21. Current release baseline

The verified 23 July 2026 baseline is:

- 70 lessons: `ss1`–`ss70`;
- 3,500 questions;
- 66 auditable imported JSON files: `ss05.json`–`ss70.json`;
- generated public bundle:
  `sentence-structure-lessons-5-70.js`;
- 4,000-bookmark capacity;
- Benefits and Important Rules both render Traditional Chinese first in the
  larger primary font;
- English appears underneath in the smaller secondary font;
- root suite: 16 tests passing at this baseline; and
- Worker suite: 6 tests passing at this baseline.

Test counts may grow later. A future release must pass every discovered test,
not merely reproduce these historical counts.

## 22. Recommended Codex request

For a future import:

> Import the attached Sentence Structure PDF as the next permanent lesson,
> following `tools/SENTENCE-STRUCTURE-CONTENT-IMPORT-SOP.md`. Preserve and
> visually verify all bilingual source text and physical PDF provenance,
> import exactly 50 questions into a canonical `ssNN.json`, keep Benefits and
> Important Rules Chinese-first, rebuild the public expansion bundle,
> regenerate the Worker catalogue, update the Supabase and Worker lesson
> contracts for a new ID, run every required test, and deploy in Supabase →
> Worker → website order.

This wording includes content extraction, bilingual presentation, provenance,
grading, persistence, testing and publishing as one controlled workflow.
