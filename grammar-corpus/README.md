# Edmund Grammar Corpus Framework

This directory is the version-controlled authoring and release layer for the
teacher-approved grammar corpus used by the Writing Submission portal.

The Golden SOP remains the editorial standard. This directory adds the
mechanical safeguards needed to turn reviewed examples into database rows and
a fast Worker lookup snapshot without copying student writing into production
code by hand.

## One source, three generated outputs

`corpus-v1.json` is the single source of truth for release `2026-08-02.1`.
It currently contains:

- 18 approved paragraphs;
- 322 approved sentences;
- 724 individually annotated issues;
- 640 reusable rule records; and
- 13 exceptions or valid counterexamples.

The original two paragraph families remain eligible for retrieval. Datasets
3–18 are preserved as 16 approved development families, with 308 sentences
and all 693 issue rows physically present in the supplied source. They remain
excluded from the Worker snapshot until a separate production-retrieval
review. Dataset 17 declares 100 mappings, but its source contains 99 numbered
rows; the release records the 99 real rows and does not fabricate a missing
mapping.

Running:

```sh
node grammar-corpus/validate-and-generate.mjs
```

performs all integrity checks and regenerates:

1. `workers/writing-submission/src/grammar-corpus.generated.js` — the compact,
   read-only Worker snapshot used for zero-latency exact matches and bounded
   structural guidance;
2. `seed-corpus-v1.sql` — the immutable, idempotent Supabase seed; and
3. `sheets-v1/*.csv` — six spreadsheet tabs suitable for Excel or Google
   Sheets review.

Never edit a generated output. Edit the source JSON or a reviewed workbook,
then run the generator.

## Spreadsheet workflow

The generated CSV files correspond to these workbook sheets:

- `Groups`
- `Paragraphs`
- `Sentences`
- `Issues`
- `Rules`
- `Exceptions`

When a future workbook is ready, convert it into the same normalized JSON
shape before publishing. Character offsets are intentionally absent: the
validator finds each annotated occurrence and proves that applying every
replacement reconstructs the full teacher-approved sentence exactly.

## Release rules

Every publication must use a new `corpusVersion`. An approved version is
immutable. The generated seed refuses to reuse a version number when its
content SHA-256 is different. The fingerprint is calculated from the canonical
JSON value in `corpus-v1.json`; indentation and trailing newlines do not change
it, and validator-only derived fields are not included.

The seed creates a new release as `reviewed`, inserts and verifies every child
row in one transaction, and only then promotes it to `approved` and current.
Database triggers lock approved and retired release content. Re-running the
same generated seed is a no-op apart from safely restoring its current-release
flag; changed content must use a new version.

Before publication, the validator enforces:

- unique paragraph, sentence, issue, rule and exception identifiers;
- valid parent/foreign-key relationships;
- approved status for every published record;
- database-compatible identifiers, field types, ranges and enum values;
- unique sentence, issue and exception ordering within each parent;
- exact group, paragraph, sentence, issue, rule and exception counts;
- exact original and corrected word counts;
- ordered sentence joins that reproduce both full paragraphs;
- non-overlapping issue spans;
- issue replacements that reproduce the approved corrected sentence;
- no more than eight displayed issues per exact retrieval sentence (dense
  development guidance may retain more for review);
- an existing reusable rule for every issue; and
- retrieval and holdout flags agreeing with the family's partition.

## Retrieval versus evaluation

Related variants must share a `groupKey`. Each group belongs to exactly one
partition: `retrieval`, `development`, `holdout`, or `regression`.

Keep approximately 20% of mature corpus families in `holdout`. A whole family
must remain in one partition; do not place one vocabulary variant in retrieval
and a near-duplicate in holdout. This prevents the system from appearing to
generalise merely because it saw almost the same sentence.

The initial two examples retain the user-approved values
`retrievalEligible: true` and `evaluationHoldout: false`. Begin allocating
holdout families once there are enough independent examples for a meaningful
evaluation set. The 16 newly imported families use the `development`
partition with `reviewPolicy: "guidance"`, `retrievalEligible: false`, and
`evaluationHoldout: false`.

## Database deployment order

1. Apply `../supabase-writing-grammar-corpus.sql` once after the existing
   Writing Submission migration.
2. Apply the generated `seed-corpus-v1.sql`.
3. Confirm `writing_grammar_corpus_status()` reports the expected release and
   counts.
4. Deploy the Worker snapshot generated from the same source JSON.

The Supabase tables use RLS with no permissive policies. Neither `anon` nor
`authenticated` can read or write corpus rows. Corpus authoring and approval
remain private deployment operations. The browser never receives the corpus
database or a Supabase server key.

## Runtime privacy and performance

Supabase is the authoritative normalized archive. The Worker uses the bundled
published snapshot instead of sending every student sentence to Supabase.
Therefore corpus lookup:

- adds no extra database request while the student types;
- continues to work if Workers AI is unavailable;
- does not place raw student sentences in a corpus-query log; and
- avoids reintroducing the earlier Supabase latency problem.

An exact approved sentence uses the teacher correction without an AI call,
after the existing generic safety materializer verifies it. A non-exact
sentence may receive at most a few structurally relevant examples as guidance;
those examples are never treated as its answer, and the AI must analyse the
new sentence independently.

## Approval boundary

Never promote these sources automatically:

- a student submission;
- an AI-generated correction;
- a Harper suggestion;
- a local-rule suggestion; or
- an unreviewed import.

Only teacher-reviewed material may have `status: "approved"` and enter a
published release. Corrections, explanations, alternatives and exceptions
must be reviewed together.
