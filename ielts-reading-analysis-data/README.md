# IELTS Reading analysis article data

This directory is the deployment location for lazily loaded IELTS Reading
analysis JSON files. The catalogue page does not fetch these files. It fetches
one file only after a visitor opens the matching article.

Add each generated file to the availability manifest as follows:

```js
"article-slug": {
  id: "article-slug",
  catalogueId: "p1-001",
  passage: 1,
  source: "json",
  file: "article-slug.json",
  version: "2026-08-08.1",
}
```

Use `catalogueIds: ["p1-009", "p1-060"]` instead of `catalogueId` when the
same analysis article appears at more than one catalogue position. `version`
is appended as a cache-safe query string and should change whenever that JSON
file changes.

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
must never be concatenated into the roadmap title.
