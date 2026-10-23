# Idiom Super Curation: lessons 001–108 acceptance audit

**Status:** OPEN — do not describe the 108-lesson rollout as complete or strictly compliant.

**Reference:** `Idiom_Super_Curation_and_Exercise_Golden_Manual_2026-10-23.pdf`, owner copy in Golden Manuals, SHA-256 `94dc50ca21d12c5f818d4551a2f4bb0795e3d830f2e2a175eca68d58a963ac23`. This checklist maps its 35 numbered sections, appendices, and recorded corrections to observable acceptance evidence. The manual is source material; the owner's latest instruction controls the review method.

**Owner review decision:** On 23 October 2026 the owner explicitly selected **AI-only review** for this rollout. This replaces the manual's proposed independent human English and Traditional Chinese reviewers for this project. It does **not** lower the single-key, fluent-English, faithful-Chinese, option-specific-rationale, or no-shortcut acceptance standards. Record the human-review difference in every release record; do not mark independent human review as performed.

**Scope and denominator:** 108 lessons × (50 retained original items + 10 extensions) = 6,480 final-practice items and 25,920 choices. The source catalogue currently has 5,400 original IDs. Existing Compass curation covers lessons 001–030 and has 300 extensions; lessons 031–108 lack Compass guides and 780 extensions. The older 006–030 MC bank needs substantive editorial revision too: a quantitative audit found that in every one of those 25 lessons, at least one identical rationale appears 50 or more times. Structural candidates are not language-approved items. Every item requires a separate semantic, bilingual, foil, rationale, comparison-mark and rendering decision.

## Status legend and evidence rules

- `[x]` means the named assertion was verified against a cited artifact or recorded observation.
- `[ ]` means unverified, failed, or still to be done. A count or generated string alone never means language approval.
- `N/A` requires a reason and scope: print-only rules are not website-release requirements unless a PDF/textbook is also delivered.
- `Blocked` identifies missing or contradictory source facts. Fix the source or hold the affected lesson before assigning keys.
- `Exception` requires the latest owner decision, exact affected requirement, remaining risk and date.
- For each item, record the exact phrase or fact that changes; a generic green status is not evidence.

Evidence artifacts: source catalogue `idiom-system-data.js`; curated guides `idiom-first-five-curation.js`, `idiom-compass-06-30-curation.js` and `idiom-compass-06-30-bonus.js`; source packets `content/idiom-super-curation-dossiers-31-108.json`; [source correction trace](Idiom_031-108_Source_Corrections_2026-10-23.md); 6,480-row item ledger `content/idiom-super-curation-item-review-ledger-001-108.csv`; [108-lesson coverage matrix](Idiom_Super_Curation_001-108_Coverage_Matrix_2026-10-23.md); `content/idiom-existing-foil-audit-06-30.json`; structural report from `node tools/audit-idiom-super-curation.mjs`; future browser/mobile/audio proofs and dated release record. The ledger's `AI_REVIEW_PENDING` fields are intentionally not passes.

## A. Authority, scope, and lessons from the owner record (manual introduction, §§1–4)

- [x] A01. Identify the current owner request as lessons 001–108; keep the original 50 IDs per lesson and target ten genuinely new themed extensions per lesson.
- [x] A02. Record that 001–005 established the seven-page Compass plus 60-item practice; 006–030 were later extended; PR #52 corrected recycled guide choices.
- [x] A03. Preserve the owner's English-learning objective: complete English stems, options and idiom lines; Chinese supports and explains.
- [ ] A04. Verify each lesson teaches the exact intended sense rather than a plausible but different meaning.
- [ ] A05. Verify no old example gallery, copied stock trio, or gratuitous paraphrase replaces a distinct guided learning decision.
- [ ] A06. Check the sixteen recorded failures R01–R16 against every changed lesson: excessive difficulty; Chinese-only choices; idiom absent on response page; typing; actor shortcut; tiny English print; invisible `and/or` distinction; English-only explanations; missing neutral highlights; missing original IDs; five-at-a-time gates; length giveaway; viewport drift; missing oral transfer; undocumented publication risk; repeated guided scenes.
- [ ] A07. Where the source, predecessor manual, code and current owner request conflict, log the conflict and follow current owner direction, semantic truth and evidence in that order.
- [ ] A08. Distinguish proposed targets from historical owner requirements; never claim a machine test proves idiomaticity.

## B. Source dossier and sense gate (§5, appendix A)

- [x] B01. Extract one source-backed dossier per lesson 031–108 (78/78) with lemma, meaning, source PDF name, manifest SHA-256 and pages, register fields, forms, selected rules and five diverse original-question anchors.
- [x] B02. Remove detectable placeholder, circular or merely procedural source meanings and register labels. Seventeen canonical source fragments were corrected and regenerated; `node tools/test-idiom-super-source-readiness.mjs` checks the 78 meanings, glosses, register labels and 3,900 target-meaning snapshots. Downstream guide and item review remains open under B03–B09.
- [ ] B03. Verify each dossier's concise English meaning and idiomatic Hong Kong Traditional Chinese gloss against the target sense.
- [ ] B04. Identify a falsifiable positive condition and near-miss negative condition; do not invent an absolute prohibition from a contextual tendency.
- [ ] B05. Record fixed words, permissible inflections, syntactic frames, collocates, register, region and dated status where relevant.
- [ ] B06. Record at least three independent realistic domains; do not count noun swaps as new use domains.
- [ ] B07. Record an authentic or independently reviewed use example, source, access date and unresolved uncertainty. Preserve original source text separately from learner rewrites.
- [ ] B08. For every assessment item, state its truth condition, necessary clue, near miss, source and intended misconception before writing options.
- [ ] B09. Hold disputed senses or regional variants until checked against authoritative dictionaries or usage evidence; inspect especially 031, 041, 068, 072, 082, 087, 104 and 108.

## C. Seven guided pages and content progression (§§3, 6–7, 13, 19–20)

- [ ] C01. 108/108 lessons have seven guided pages followed by a single final-practice stage; baseline is 30/108.
- [ ] C02. Page 01 gives one concise English sense, faithful Chinese gloss, natural full English model, helpful mental image and real boundary without an example gallery.
- [ ] C03. Page 02 assesses necessary situation evidence with one defensible answer and three plausible English options.
- [ ] C04. Page 03 assesses social signal: addressee, relationship, timing, register or implication. The answer is not just Page 02 with different nouns.
- [ ] C05. Page 04 distinguishes fixed phrase from permitted tense, person, articles, pronouns and grammar; forms are natural, not mechanical.
- [ ] C06. Page 05 asks what the learner could actually say; the keyed utterance contains the target idiom and a decisive contextual cue.
- [ ] C07. Page 06 tests a falsifiable misuse boundary with a plausible near miss. Do not imply a disputed absolute rule.
- [ ] C08. Page 07 includes three short checks covering meaning, context and form; its read-aloud line is new and differs from Page 01.
- [ ] C09. Across pages 02/03/05/06, stems are distinct, all 12 English choices are distinct, at least three settings/stakes and three reasoning targets occur, and no key line copies Page 01.
- [ ] C10. Review decisions for semantic diversity, not just string uniqueness; one stock setting or answer mechanism must not dominate.
- [ ] C11. Source the guide's tone, use setting and boundary from the dossier; Chinese support is concise and does not announce the key before a choice.
- [ ] C12. Read all model and guided English aloud for speakability, natural collocation, tense and register.

## D. English and Chinese editorial standard (§6)

- [ ] D01. English is the primary task language in every stem and option; the correct line is a plausible utterance, not a teacher's meta-comment.
- [ ] D02. Surrounding vocabulary is ordinarily B1–B2; any C1 term is needed, contextualised and does not become the hidden test.
- [ ] D03. Check every sentence for actor, event, time, aspect, negation, degree, certainty, outcome and grammatical fit.
- [ ] D04. Use the manual's proposed length flags: guided stems 12–32 words; guided options 7–24; practice stems 10–35; practice options 8–25. Revise flagged cards by meaning, not by padding.
- [ ] D05. Prefer one actor, one event and a decisive clue; no needless occupation jargon, double negatives or stacked subordinate clauses.
- [ ] D06. Traditional Chinese uses appropriate Hong Kong Traditional characters and punctuation; its actor, time, negation, uncertainty, degree and outcome match English.
- [ ] D07. Chinese never repairs a deliberately wrong English option or reveals a key through one unusually explicit gloss.
- [ ] D08. Translate the nuance, not only a dictionary label; keep glosses consistent across pages and rationales.
- [ ] D09. Review English and Chinese independently on each item under the owner's AI-only review decision; item ledger records actual coverage, not merely generation.

## E. Final-practice authoring and diagnostic foils (§§8–12, 16–18, 24–28, appendix D)

- [ ] E01. Preserve 50 original item IDs per lesson and their source prompts/answer provenance; all 5,400 original IDs are present in the source catalogue, but converted MC items are not fully reviewed.
- [ ] E02. Add ten genuinely new themed situations per lesson: 1,080 total; current count 300/1,080.
- [ ] E03. Present 60 ordered items continuously per lesson, with no next-five gate.
- [ ] E04. Each item has four complete English sentences and exactly one defensible key after blind-key review.
- [ ] E05. Write the correct utterance first. It both uses the approved idiom and preserves the source's essential facts; neither criterion can be rescued later by rationale.
- [ ] E06. Each of three wrong options tests a distinct plausible misconception (sense, condition, time, scope, fixed form, register, literal reading, unsupported inference, adjacent phrase or factual near miss).
- [ ] E07. Keep actor, topic, time frame and grammatical frame comparable; no subject-matching shortcut.
- [ ] E08. Check that no answer is guessable by word count, clause count, line wrap, punctuation, Chinese note, letter position or highlight alone.
- [ ] E09. Flag any option over 30% longer than the median and any option more than one line wrap beyond peers; repair local facts instead of adding a long contradiction tail.
- [ ] E10. Avoid default tiny `and/or` contrasts and mechanically malformed idioms unless exact collocation is the explicit decision.
- [ ] E11. Avoid repeated `although`, `even though`, `despite` and similar long-tail foils; inspect both exact and near-duplicate stems/endings across 60 items.
- [ ] E12. Rotate key positions across the bank while binding option identity to content rather than display letter.
- [ ] E13. Audit lesson diversity: ≥8 meaningful domains, ≥6 actor-role configurations, ≥4 tense/aspect frames where possible, ≥4 sentence shapes, ≥6 foil categories.
- [ ] E14. No consecutive pair repeats actor + setting + foil mechanism; no three consecutive items repeat one syntactic template.
- [ ] E15. Extensions transfer the same verified sense to fresh domains and stakes; they are not copies of original prompts with a changed name.
- [ ] E16. If a sense lacks ten credible extensions, record the exact shortfall and seek an owner decision instead of inventing unnatural English.
- [ ] E17. Test worked calibrations: `hit the ground running` requires useful immediate progress; `chop and change` may not hinge invisibly on `or/and`; `the acid test` needs decisive relevant evidence; `think big` is ambitious thinking, not `talk big` boasting.

## F. Answers, rationales, comparison and correction (§§10–11, 14)

- [ ] F01. Before selection, no answer colour, Chinese hint, rationale or hidden text leaks the correct criterion.
- [ ] F02. A wrong guided attempt identifies only the selected error in Traditional Chinese, retains the other choices and permits correction without revealing the green key.
- [ ] F03. A correct guided attempt explains the right choice and relevant contrasts; feedback states the specific clue rather than “good call” alone.
- [ ] F04. A wrong final-practice attempt gives a precise reason for that selected option and invites correction without moving the viewport.
- [ ] F05. A correct final-practice attempt reveals the keyed answer plus four distinct Traditional Chinese A–D reasons.
- [ ] F06. Each rationale names the exact changed English phrase or fact, the semantic consequence and why it matters; generic “fits naturally” is insufficient.
- [ ] F07. The correct rationale cites affirmative source evidence; wrong rationales do not claim that context-dependent English is universally wrong.
- [ ] F08. Yellow difference marks cover the smallest meaning-bearing spans in all four choices, including the key when applicable; they are neutral, legible and not a covert answer colour.
- [ ] F09. Comparison uses the unchanged plain-English string for audio, copying, indexing and accessibility; green/red outcome states use more than colour alone.
- [ ] F10. On selection, correction, reload and account switch, preserve question order, identity, progress and reading position.
- [ ] F11. Semantic item revisions that change the key or decision receive an item version and a documented progress migration; typography-only edits keep IDs.
- [ ] F12. Account-scoped state does not leak a previous student's progress or recording to another student.

## G. Pocket Check, audio and recording (§13)

- [ ] G01. Every lesson has a fresh English read-aloud line, faithful Traditional Chinese support and target idiom in the approved form.
- [ ] G02. Displayed text and voice model match exactly in names, words and meaningful punctuation; record audio source, date and text hash.
- [ ] G03. Recording is optional practice with playback, never an unsupported pronunciation score or prerequisite for final practice.
- [ ] G04. Audio delay, absent permission or recording failure preserve text access and the practice route without false “saved” claims.
- [ ] G05. No student voice or identifiable account information appears in source curation, public screenshots or audit artifacts.

## H. Canonical data model and technical invariants (§§14–15, 30, 32)

- [x] H01. Source catalogue contains 108 × 50 original questions with unique IDs, bilingual prompts/answers and matching target highlight strings; baseline structural audit confirms this limited assertion.
- [ ] H02. Each lesson stores stable sense/form/register/source/version/review state; each guided and final item stores decision type, truth condition, stable option IDs, keyed ID, misconception code, Chinese rationale, comparison spans, version and migration policy.
- [ ] H03. All guided pages have exactly 3 options/1 key; all 6,480 final items have exactly 4 options/1 key and 4 Chinese reasons.
- [ ] H04. No identical options, blank fields, invalid stages, duplicate item IDs or duplicate read-aloud model in the published set.
- [ ] H05. Shuffle keeps English, Chinese, rationale, score and audio bound to the same option ID; order changes do not change correctness.
- [ ] H06. Difference spans resolve in the exact displayed string and remain valid after content edits.
- [ ] H07. Progress credits an item once, survives correction/reload, and respects account scope and item version.
- [ ] H08. Run existing runtime tests and expanded 108-lesson structural/content tests; log command, date, commit and failures. Baseline on 23 October: `node tools/test-idiom-system.mjs` 9/9 pass; `node tools/test-idiom-system-runtime.mjs` 23/23 pass; `node tools/test-idiom-super-source-readiness.mjs` pass; strict 108-guide audit fails on 78 absent guides.
- [ ] H09. Test normal desktop, mobile, narrow screen, touch/keyboard, audio fallback and denied microphone on representative high-risk lessons.
- [ ] H10. Verify live page loads exact versioned assets and spot-check early, middle and final lessons after release; a green CI result alone is not a live check.

## I. Reference design, print and pagination (§§21–23, 30)

Website design is explicitly outside the new manual's subject, but the manual records learning-critical visual semantics and a reusable **print** specification. Mark print-specific items N/A for a website-only rollout; do not label them passed.

- [ ] I01. Preserve typographic hierarchy: idiom and English decision prominent, Traditional Chinese immediately associated, rationale visually attached to its question.
- [ ] I02. Student view uses colour semantically: neutral yellow for differences, green only after verified success, selected-error state distinct and accessible without colour.
- [ ] I03. English practice text remains large enough to read; no regression from the owner's 20% increase. Check actual browser sizes rather than assuming CSS source suffices.
- [ ] I04. Guide pages show one learning decision at a time; final practice remains a continuous list. Feedback expansion retains local alignment.
- [ ] I05. For a PDF/textbook edition only: A4 portrait 210 × 297 mm; inner/outer margins about 19–22 mm, top 20–23 mm, bottom 18–21 mm, extra 8 mm binding room; one main column; 4-point spacing grid. **N/A to website release unless a PDF is produced.**
- [ ] I06. For a PDF/textbook edition only: embedded Traditional-Chinese-capable fonts and all glyphs verified; cover 26–34 pt, part 18–22, section 13–16, body 9.5–10.5 with 13.5–15 leading, English stems 12–14, options 11–12.5, Chinese 9.5–10.5, running header/folio ≥8. **N/A to website release unless a PDF is produced.**
- [ ] I07. For a PDF/textbook edition only: warm near-white, high-contrast ink, rust/orange labels, success green, selected-error muted red, neutral yellow lexical differences; grayscale proof with text/symbol redundancy. **N/A to website release unless a PDF is produced.**
- [ ] I08. For a PDF/textbook edition only: hairline rules about 0.4–0.7 pt, 4–6 mm text clearance, no detached rule; comparison tables with repeated heads, 5–7 pt padding, top-aligned cells, IDs/titles/source notes. **N/A to website release unless a PDF is produced.**
- [ ] I09. For a PDF/textbook edition only: contents page, running heads and continuous folios, major parts on new pages, continuous 1–60 item numbering; keep stem/choices/answer space together or label a continuation; no answers visible before completion in student edition. **N/A to website release unless a PDF is produced.**
- [ ] I10. For a PDF/textbook edition only: adjacent English and Chinese, no orphaned Chinese line or punctuation, no idiom hyphenation across lines, searchable text and embedded fonts; inspect extraction and all rasterised pages. **N/A to website release unless a PDF is produced.**
- [ ] I11. For a PDF/textbook edition only: tagged PDF if reliable or an accessible source edition with verified reading order; every colour comparison gets textual reasoning; audio references use stable nonsensitive URL/QR plus printed sentence. **N/A to website release unless a PDF is produced.**
- [ ] I12. For a PDF/textbook edition only: Page 01 meaning/model, Page 02 situation, Page 03 social signal, Page 04 form table, Page 05 speakable response, Page 06 boundary, Page 07 oral check, then continuous practice; teacher rationales separate from unattempted student pages. **N/A to website release unless a PDF is produced.**
- [ ] I13. If any workbook PDF is later generated, create a separate render-and-inspect record rather than treating website proof as print proof.

## J. Twelve-axis rubric, workflow and release (§§29–35, appendices A–C)

- [ ] J01. Every item scores 2/2 on: sense accuracy; natural English key; prompt-fact preservation; one defensible key; realistic situation; three diagnostic foils; shape fairness; English clarity; faithful Chinese; option-specific rationale; neutral differences; stage-appropriate reveal/progress. Any 0/1 returns to draft.
- [ ] J02. Intake gate records owner instruction, audience, exact sense, source/reuse rights, quantities, language variety and progress constraints.
- [ ] J03. Dossier gate approves the sense, fixed/variable form, register and positive/negative conditions before MC authoring.
- [ ] J04. Blueprint gate allocates distinct guided jobs and the 60-item domain/actor/tense/syntax/foil ledger.
- [ ] J05. Draft gate writes key, stem, three diagnostic foils, Chinese support and four reasons in that order; every item records provenance.
- [ ] J06. Semantic gate runs blind-key, bilingual and anti-shortcut review; AI-only is the owner-authorised reviewer method and must be stated in release notes.
- [ ] J07. Mechanism gate checks IDs, state, shuffle, difference spans, audio/text, corrections, reload and account separation.
- [ ] J08. Proof gate inspects student and answer views at desktop/mobile and print only if applicable; re-proof after every content repair.
- [ ] J09. Release gate records version, commit/hash, exact review coverage, test output, known risk, publication route, deployment result and live sample.
- [ ] J10. Re-run the complete audit after any change. A repaired error cannot be closed solely by editing the checklist; the content and tests must be rerun.
- [ ] J11. Failure register F01–F15 is closed one by one: ambiguity; unnatural key; Chinese repair/leak; length/topic shortcut; recycled guide job; pre-answer leak; wrong-choice green leak; misleading difference mark; audio mismatch; denied mic; viewport drift; account leak; contested source; artificial extension quota; partial review claim.
- [ ] J12. Measure student outcomes only with unseen pre/post items and misconception-level analysis; do not claim learning gains without evidence.
- [ ] J13. Keep dated changelog and item-version decisions; retire contested items explicitly and never overwrite prior learner history.
- [ ] J14. Final acceptance consists of all applicable checks above complete, zero unreviewed published items, zero unresolved high-risk semantic conflicts, and an honest AI-only exception record.

## K. Current failure register and next iteration

| ID | Finding | Scope | Required repair | Status |
|---|---|---:|---|---|
| F-001 | Compass curation absent | 78 lessons, 031–108 | Write seven distinct guided pages and verify stage-specific decisions | Open |
| F-002 | Ten new themed extensions absent | 780 items | Author distinct English/Chinese prompts and natural keys; then four-option review | Open |
| F-003 | Final-practice per-item review absent | Up to 6,480 items | Run 12-axis review and record outcome for each item | Open |
| F-004 | Source lesson 072 meaning was circular | 1 lesson; 50 targetMeaning fields | Source-backed meaning and register corrected in catalogue; still inspect its future guide and answer keys | Source fixed; downstream open |
| F-005 | Six generic register labels and additional extracted meaning defects | 17 source lesson entries | Replaced labels/meanings from original PDFs or dictionaries; inspect downstream learner text and options | Source fixed; downstream open |
| F-006 | Independent human review replaced | Entire rollout | Owner chose AI-only review; record exception and avoid claiming human sign-off | Exception logged |
| F-007 | Existing 006–030 final-practice rationales are mechanically repeated | 25 lessons, 1,500 items | Rewrite individual option reasons around each actual changed phrase/fact; vary diagnostic mechanisms; independently re-audit all four options | Open |

**Cycle rule:** After drafting each item, audit A–J and its ledger row. Any failure returns that item or lesson to the relevant source/dossier/blueprint/draft stage. Rebuild the 108-lesson report and rerun tests after each correction batch. The release is complete only when every applicable check is verifiably closed; a missing reviewer record cannot be inferred from generated content.

**Baseline command:** `node tools/audit-idiom-super-curation.mjs --strict` currently exits nonzero. The 6,480-row ledger is generated by `node tools/build-idiom-super-curation-ledger.mjs`. The current source packets are generated by `node tools/build-idiom-super-curation-dossiers.mjs`. Neither generator publishes content.

**Latest audit record:** 2026-10-23, before the 031–108 rollout. 108 lessons and 5,400 original questions; 30 Compass guides; 5 lessons with no current automated finding; 103 findings total: 78 `NO_COMPASS_GUIDE` and 25 `REPEATED_RATIONALE_REVIEW`. The second class is an editorial triage flag backed by `content/idiom-existing-foil-audit-06-30.json`, not an automatic judgment that every repeated sentence is semantically wrong. No lesson has passed full item-level editorial review. Per-lesson details appear in the machine-readable report. This is an honest baseline, not final acceptance.
