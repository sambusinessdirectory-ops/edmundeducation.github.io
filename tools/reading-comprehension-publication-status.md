# Reading catalogue publication status — 27 August 2026

## Approved release

The owner explicitly confirmed publication on 27 August 2026, including the three
IDs below. The release contains 436 additions (437 entries including the unchanged
Albert Einstein exercise). Website deployment and a final live check follow the
validated release commit.

The previous publishing pause is resolved by that explicit confirmation:

| Confirmed for inclusion | Article | Different passage ID on the actual hold list |
| --- | --- | --- |
| p1-140 | Internal and External Marketing | p2-140 — Tattoo on Tikopia |
| p2-119 | Can We Believe Our Own Eyes? | p3-119 — Learning Lessons from the Past |
| p3-079 | Mystery of the Mummies | p1-079 — Reform of the Prison System; p2-079 — Distance Learning |

The source audit in `reading-comprehension-import-audit.md` records the intended
27 additional holds and the original 13 exclusions. All 40 are absent from the
generated Reading catalogue. No held source PDFs were modified.

## Completed locally

- 436 original English passages and question sets, with the existing Chinese
  analyses linked per exercise; 932 original question-page images preserve
  diagrams, tables and answer options.
- Three mismatched analyses corrected in Reading-only files; existing public
  IELTS-analysis files remain untouched.
- Seven source-ambiguous questions are clearly flagged and excluded from marking.
- Search, pagination, cross-article drafts, bookmarking and progress support.
- `test-reading-comprehension-system.mjs`,
  `test-reading-comprehension-enhancements.mjs`, and
  `test-reading-comprehension-catalogue.mjs` pass; `git diff --check` passes.

Full Traditional Chinese passage translations and narration for the 436 new
exercises have not been prepared. The UI explicitly shows their unavailable state.
Albert Einstein content and audio are unchanged.

## Database state

Backward-compatible migrations already applied through Supabase:

1. `reading_comprehension_multi_article_catalogue_20260827`
2. `reading_comprehension_clear_edited_answer_results_20260827`

The private catalogue now contains **437 enabled entries**. A complete digest
comparison verifies every ID, title and answer key against the validated seed.
All 40 intended hold IDs remain absent. Do not blindly replay the schema file:
its constraints and dashboard transformation have already been applied.

Transaction-only integration checks passed: partial/full/force submission, draft
restoration, clearing stale results, rejecting another student's token and a
cross-article attempt ID, held-ID rejection, and review-only marking. Every
synthetic test record was rolled back. Existing counts remain 5 attempts and
0 question results.

The security advisor's Reading findings reflect intentional private RLS tables
and authenticated SECURITY DEFINER RPCs. Table reads and anonymous RPC execution
are denied; RPCs validate the shared student session and ownership. References:
[private RLS tables](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
and [authenticated RPC review](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

## Deployment verification

The source and database integration checks pass. Publish the scoped release on top
of the latest production branch, preserving unrelated changes, and verify the live
437-entry catalogue and assets. The Pages workflow now runs all three Reading
regression suites. No audio content or student records were altered by the import.
