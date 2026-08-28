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
2026-08-28 (next sequential set): p1-051, p1-052, p1-054 through p1-065,
and p1-067 (15 articles / 106 paragraphs). Withheld p1-053 and p1-066 remain excluded.
2026-08-28 (next 60): the 60 approved articles from p1-068 through p1-137,
excluding existing Einstein and all withheld IDs (60 articles / 474 paragraphs).
2026-08-28 (following 60): p1-138 through p1-163, then p2-024 through p2-061
in the approved catalogue, excluding p2-031, p2-043 and IDs not in that catalogue
(60 articles / 517 paragraphs). All held articles remain excluded.
2026-08-28 (next approved 60): p2-062 through p2-126 in catalogue order,
excluding withheld p2-067, p2-079, p2-091, p2-103 and p2-115
(60 articles / 473 paragraphs). All held articles remain excluded.
2026-08-28 (following approved 60): p2-128 through p2-174, then p3-003
through p3-032 in approved catalogue order, excluding all held and absent IDs
(60 articles / 498 paragraphs). All held articles remain excluded.
300 of 436 articles; 2,420 paragraphs; 136 articles remain. Next: p3-033.
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

The p1-051–p1-067 set retains the original paragraphs, including embedded titles
and the telescope passage's separate refraction footnote. Historical money
amounts, exchange rates, population figures and forecasts are not modernized.
Editorial notes flag the educational-philosophy passage's chronology, the
refrigeration passage's outdated HFC safety claim, and the honeybee passage's
dating and direction wording. Problematic assertions are identified as source
statements without altering the English exercises or answers. The mobile-money
and gender-equality passages retain their historical reporting context; the
clouded-leopard passage preserves the author's classification debate rather
than presenting it as current taxonomy or law.

The p1-068–p1-137 set preserves paragraph boundaries, embedded headings,
footnotes, names, dates, quantities and qualifications. Historical forecasts and
industry statistics retain their source time frame. Local editorial notes flag
source ambiguities or questionable historical/scientific assertions without
changing the English passages, exercises, answers or audio. No paid translation
API was used; each passage was translated individually.

The p1-138–p2-061 set was translated one article at a time, without a paid
translation API. It preserves the original paragraph boundaries, embedded
headings, quotations, figures and qualifications. Historical scientific,
medical, legal, economic and technical claims remain tied to the source period;
questionable source assertions are attributed rather than silently modernized.
Local editorial notes record source issues without changing the English corpus,
questions, answer keys, recordings or student records.

The p2-062–p2-126 set was translated individually without a paid translation API.
All source paragraphs and standalone introductions are preserved, including
embedded section labels, examples, quotations and scientific glossary notes.
Local editorial notes identify historical claims or source ambiguities; notably,
p2-118 names EEG/brain-wave monitoring while discussing cardiac recovery. The
translation attributes that inconsistency to the source without silently
substituting ECG or changing the English exercise. Historical policy, medical,
technology and commercial statements are not presented as updated guidance.

The p2-128–p3-032 set was translated individually, preserving every source
paragraph, embedded heading, quotation, figure and qualification. Historical
policy, medical and technical claims retain their original context. Local
editorial notes flag ambiguities without changing the English text. The two
similar psychology passages, p2-147 and p3-020, each retain their own exact
source text and the differences in their wording. No English exercises, audio,
answer keys or student records were changed.

For the latest set, all 300 database rows were checked against validated local
payloads: per-paragraph English/Chinese text checksums, paragraph order/count,
titles, remaining content metadata, English-source hashes and publication flags
all matched. The database contains exactly 300 published translation rows and
2,420 translated paragraphs, including the latest 60 articles / 498 paragraphs.
Authenticated RPC reads were tested for all 60 newly added articles, alongside
anonymous/invalid-token rejection and the withheld-article check, in a rolled-back
transaction. Translation, catalogue, portal and reading-enhancement tests passed.
All translation files were also scanned for common unambiguous Simplified
Chinese forms; no matches remained. Ambiguous shared characters such as 云 in
the valid Traditional Chinese phrase 不知所云 are not treated as errors.

The database-backed reader was published successfully in GitHub Pages run
33090844037. The live JavaScript matches the tested source exactly. Further
validated database uploads are available on the next article/page load without
needing to rebuild the static English files.
