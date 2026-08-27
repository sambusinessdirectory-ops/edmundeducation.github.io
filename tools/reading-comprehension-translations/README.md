# Sequential Traditional Chinese translation

Scope: the 436 new published articles, in article-ID order. Existing Einstein
translations and the 40 withheld articles are excluded. No paid translation API.

Each JSON file contains a complete translation, not a summary. Keep every source
paragraph, its number, claims, qualifications, dates, numbers and proper names.
Use professional written Traditional Chinese; do not modernize historical facts.
Source ambiguities belong in editorial notes, never silently corrected in English.

`node tools/reading-translations.mjs status` validates all completed files and
prints the exact completed count and next pending article. The source hash locks
the translation to the original English text. Structural checks do not replace
careful bilingual review of meaning and terminology.

`node tools/reading-translations.mjs seed [article-id ...]` emits validated database
rows for the authenticated Supabase import. Upload only completed articles. The
reader loads them through `reading_comprehension_article_translation` and rejects
any payload whose English paragraph text no longer matches. New translations can
therefore become available without rebuilding the English corpus or changing
student attempts, bookmarks, answer keys or audio.

Completion of local files and database verification are separate steps. A file
is not evidence that it has been uploaded. Record verified uploads below.

## Verified database uploads

2026-08-27: p1-001 through p1-007, p1-009, p1-010 and p1-011.
2026-08-28: also p1-012 and p1-014 through p1-017.
2026-08-28 (next set): p1-018 through p1-021, p1-023, p1-024,
p1-026 through p1-032, p1-034 and p1-035 (15 articles / 120 paragraphs).
2026-08-28 (following set): p1-036 through p1-050 (15 articles / 121 paragraphs).
45 of 436 articles; 352 paragraphs; 391 articles remain. Next: p1-051.
Database content and English-source hashes match the validated local rows exactly.
Authenticated RPC reads passed; anonymous requests and invalid student tokens
were rejected. All synthetic test records were rolled back. Direct client table
access remains revoked; RLS is enabled with no policies intentionally, because
reads go through the session-checked function in the private schema.

Editorial flags in p1-007 and p1-009 record questionable claims in the English
source. These are not silent corrections to the exercise; the translations
preserve what the source says. The wine passage likewise describes historical
health and naming claims, rather than providing updated medical or legal advice.
Additional notes in p1-012, p1-014 and p1-015 record obvious source typos or
historical medical/legal claims. The Everest translation explicitly identifies
the source's suspect altitude and year rather than silently replacing them.
The incomplete treatment-duration range in p1-016 is explicitly marked rather
than filled in speculatively. Historical energy figures in p1-017 are preserved.
Notes in p1-018 identify the source's "nam bread" typo. The
Mozart passage (p1-029) preserves an inconsistent citation year and historical
medical claims; the seaweed passage (p1-032) preserves local names and the
source's terminology. The banana passage (p1-034) retains the original time
frame of its forecasts. The river passage (p1-035) preserves the source's dam
location wording without guessing an upstream/downstream correction.

The p1-036–p1-050 set preserves the food-advertising review's distinction between
evidence and conclusive proof, and the competing interpretations of ant teaching.
Notes in p1-038, p1-040–p1-042 and p1-045 identify specialist naming, historical
context or source claims; p1-048 records an internal inconsistency in the original
classification discussion. Two passages particularly need an English-source
editorial review (not performed as part of this translation task):

- p1-049 conflates Watkin Tench with transported convicts and gives an incorrect
  departure year. The Australian Dictionary of Biography identifies him as a
  marine officer sailing in 1787. The translation marks the problematic assertions
  as statements in the source; its JSON editorial notes include the reference.
- p1-050 overgeneralizes radiocarbon dating to any object. Its treatment of Angkor
  chronology and biographical claims also needs review. The translation preserves
  the supplied narrative and labels the overgeneralization as a source statement;
  its JSON notes cite the GNS laboratory and UNESCO rather than silently replacing
  the English text, questions or answer keys.

For the latest set, all 45 database rows were checked against validated local
payloads: per-paragraph English/Chinese text checksums, paragraph order/count,
titles, remaining content metadata, English-source hashes and publication flags
all matched. The database contains exactly 45 published translation rows.
Authenticated RPC reads were tested for all 15 newly added articles, alongside
anonymous/invalid-token rejection and the withheld-article check, in a rolled-back
transaction. Translation, catalogue, portal and reading-enhancement tests passed.

The database-backed reader was published successfully in GitHub Pages run
33090844037. The live JavaScript matches the tested source exactly. Further
validated database uploads are available on the next article/page load without
needing to rebuild the static English files.
