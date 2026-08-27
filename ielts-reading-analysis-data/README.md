# IELTS Reading analysis article data

This directory is the deployment location for lazily loaded IELTS Reading
analysis JSON files. The catalogue page does not fetch these files. It fetches
one file only after a visitor opens the matching article.

## Editorial holds

As of 2026-08-27, 13 Passage 1 articles are temporarily locked pending diagram
and explanation corrections. `LOCKED_CATALOGUE_IDS` in
`ielts-reading-analysis-loader.mjs` is the single list of holds. The catalogue
keeps these titles visible in pale orange, but the loader rejects direct links
and cached/bundled access. The Pages preparation step uses
`tools/ielts-reading-analysis-publication-excludes.mjs` to omit their JSON files
from the public site. Source files remain here for editing.

Correcting content does not release a hold. Remove its catalogue ID from the
lock list only after an explicit request to unlock it, update the corresponding
regression expectations, bump the client/loader cache versions, and redeploy.
The corpus counts below describe source inventory, before these holds.

## Current Passage 1 corpus

The expanded import currently contains:

- 156 manifest and report source records: 106 newly parsed sources and 50
  cached sources;
- one additional supplied PDF that duplicates the already bundled
  `p1-092` article;
- 155 lazily loaded JSON articles covering 158 catalogue IDs;
- two bundled articles, `p1-092` and `p1-161`;
- 160 of the 164 Passage 1 catalogue entries available in total;
- exactly four unavailable entries: `p1-033`, `p1-053`, `p1-066` and
  `p1-164`;
- 2,030 answers, 1,987 analysis cards, 10,761 question-analysis sections and
  3,658 imported PDF pages;
- 150 paragraph roadmaps.

Exactly five imported articles intentionally have no paragraph roadmap because
their source analysis did not provide one: The History Of Salt (`p1-157`),
Grey Workers (`p1-159`), Malaria Combat in Italy (`p1-160`), The Power of
Nothing (`p1-162`) and Grimm’s Fairy Tales (`p1-163`). Do not synthesize a
roadmap merely to satisfy the schema; the regression test treats only these
five omissions as expected.

Run the complete corpus consistency check with:

```sh
node tools/test-ielts-reading-analysis-imported-data.mjs
```

The test validates the manifest/report inventory, cached and parsed source
counts, shared catalogue aliases, bundled duplicates, deployed JSON filenames,
all article payloads, exact aggregate counts, roadmap exceptions, representative
answers and important source caveats.

Add each generated file to the availability manifest as follows:

```js
"article-slug": {
  id: "article-slug",
  catalogueId: "p1-001",
  passage: 1,
  source: "json",
  file: "article-slug.json",
  version: "2026-08-08.2",
}
```

Use `catalogueIds: ["p1-009", "p1-060"]` instead of `catalogueId` when the
same analysis article appears at more than one catalogue position. `version`
is appended as a cache-safe query string and should change whenever that JSON
file changes.

The current shared JSON aliases are:

- Flight of the Honeybee: `p1-009` and `p1-060`;
- The Nature of Addiction: `p1-010` and `p1-061`;
- The Loch Ness Monster: `p1-011` and `p1-063`.

`p1-092` is not another JSON alias. Its supplied PDF is recorded as an
`already-bundled` duplicate of `if-you-can-get-used-to-the-taste`, so it must
remain a single bundled article rather than creating a second JSON payload.

The JSON may contain the article object directly, `{ "article": {...} }`, or
the legacy-compatible `{ "articles": { "article-slug": {...} } }` envelope.
Its `id`, `catalogueId`, `passage`, answer-key length and question count must
match the manifest before the page will render it.

One analysis card may cover a question range. Keep `number` as the first
question and add every covered question in `numbers`, for example
`{ "number": 6, "numbers": [6, 7, 8], ... }`. The fast-travel links for Q6,
Q7 and Q8 will all open that card, which is headed `第 6–8 題`. Across all
analysis cards, every number from 1 through `questionCount` must be covered
exactly once.

Paragraph roadmaps may use a teacher-authored label, for example
`{ "number": 1, "label": "Introduction", "summary": "..." }`. The UI uses
`label` when present and falls back to `Paragraph <number>`.

Teacher caveats that belong before the roadmap (for example, a missing source
diagram or a source-question wording issue) belong in the article-level
`sourceNotes` string array. They render in a separate `閱讀前提示` panel and
must never be concatenated into the roadmap title. Each note must be a
human-readable explanation of the caveat, not a stray heading, answer word or
topic label. The regression test deliberately rejects blank and fragmentary
notes so extraction artefacts cannot appear as teacher guidance.
