# Advanced Native Books 10–16 — Golden SOP verification checklist

Audit snapshot: 2026-10-23 07:08 UTC. Baseline repository commit: `eca72e6f`. Branch: `codex/advanced-native-books10-16-20261023` (pushed to the site's GitHub repository; this draft branch is not the public site).
Golden manual SHA-256: `0e2eaa6001eeebf911ff8e1a0645a61fed991df947bf701152cd1ad9ddc17580`. Source DOCX SHA-256: `d239bee71f02ae43a60475202d36090e436af4da4081af92720cd5fa8fdbd012`.

**Release verdict: NOT APPROVED.** This is a complete requirements audit of the current work, not a certificate that all requirements have passed. Failed or pending gates must be repaired and the entire affected verification cycle rerun before publication. No new Books 10–16 lessons are live.

## Scope and exact counts

- Existing published baseline: 1,893 learner-facing lessons (10 original plus 1,883 imported). Source ordinal 2,111 is already assigned to a supplementary prior-course lesson; the first new draft uses 2,112.
- New document: 2,604 source rows across 275 questions and 7 books. Its per-book question and expression counts match all stated totals; 0 rows lack a rendered-PDF page.
- Exact spelling analysis: 1,844 distinct spellings, 866 occurrences exactly matching a prior source phrase, and 760 repeated occurrences within the new document. These figures do not decide whether senses match.
- Reconciliation states: 7 draft lessons; 1,230 other first-use authoring candidates; 270 first-use near-prior candidates; 865 exact-prior occurrences; 232 remaining repeated-source occurrences. 1,506 distinct new spellings need a sense-level decision.
- Pilot draft: seven lessons projected for display 1894–1900, 49 steps, 42 assessed questions, 14 writing examples and 28 required audio roles. Audio produced for this pilot: **0**.
- First 30 source occurrences have an explicit **provisional** sense/action triage: 19 proposed new lessons, 8 proposed aliases to existing lessons, 2 proposed aliases within this document, and 1 wording hold. This is a self-review queue, not independent editorial approval. The `show up` arrival sense is kept distinct from the existing support-someone sense.

## Requirement-by-requirement register

The 55 IDs match the repository's Golden SOP release-checklist register. A pass scoped to intake does not pass the entire course. Existing production behavior is not automatically evidence for these new drafts.
Draft evidence below is split across `drafts-books10-16/batch-2112-2119.json`, `drafts-books10-16/batch-2113.json` and `drafts-books10-16/batch-2123.json`; the combined verifier reads all three in source-ordinal order.

### Source and provenance

- [ ] **SRC01 — PARTIAL.** Reconcile every supplied PDF page, expression and occurrence. All 2,604 rows and 275 questions extracted; semantic ownership of each source row is still open. Evidence: `books10-16/source-inventory.jsonl; books10-16/reconciliation-register.jsonl`.

- [x] **SRC02 — PASS—intake.** Preserve exact source sentence, complete expression, document checksum, real page, book/question/S1–S2 and honest missing locators. Every row has Book, question, S1/S2, DOCX table/row, example, SHA-256 and rendered-PDF page; 0 page gaps. Evidence: `books10-16/source-inventory.jsonl; books10-16/reconciliation-register.jsonl`.

- [x] **SRC03 — PASS—intake.** Distinguish original sample sentences from guide-written practice examples. The seven pilot lesson records say guide_original_example, rather than original online sample answer. Evidence: `books10-16/source-inventory.jsonl; books10-16/reconciliation-register.jsonl`.

- [ ] **SRC04 — PARTIAL.** Merge exact variants without losing provenance; split genuine senses and retain useful related constructions. 865 unresolved exact-prior occurrences and 270 first-use near-prior candidates flagged; first 30 have explicit proposed decisions including a distinct `show up` sense. No automatic semantic merges. Evidence: `books10-16/source-inventory.jsonl; books10-16/reconciliation-register.jsonl; books10-16/editorial-decisions-2112-2141.jsonl`.

- [ ] **SRC05 — PENDING.** Resolve doubtful meaning, grammar, register and taxonomy against primary language references. One of the first 30 occurrences is explicitly held for number/target wording; no completed primary-reference or independent sense review across 2,604 rows. Evidence: `books10-16/source-inventory.jsonl; books10-16/reconciliation-register.jsonl; books10-16/editorial-decisions-2112-2141.jsonl`.

### Curation and seven-step lesson

- [ ] **CUR01 — PARTIAL.** Write one complete meaning/grammar/register/boundary/misconception/outcome brief per canonical lesson. Seven new briefs authored; at least 1,500 other distinct new candidate spellings remain, plus unresolved sense variants. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR02 — PARTIAL.** Provide seven ordered actions and six assessed questions with optional, unscored speaking. Seven pilot records compile to 49 ordered steps and 42 questions; whole new source unbuilt. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR03 — PARTIAL.** Tailor listening context, four meaning choices, one key and specific feedback. Seven listening tasks have four keyed options and tailored feedback; independent editorial review pending. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR04 — PARTIAL.** Make all four reply options naturally valid, exactly one target-bearing and golden. Schema proves exactly one target-bearing golden reply in each pilot; pragmatic validity needs independent review. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR05 — PARTIAL.** Write a new concrete scene, one defensible best answer and plausible alternatives. Seven scene tasks drafted; the first self-review replaced over-obvious distractors with closer timing, scope and evidence errors. Alternative fairness still needs independent review. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR06 — PARTIAL.** Test a real boundary without inventing a restriction or rejecting a valid meaning. Seven boundary tasks drafted; no whole-source or independent sense sign-off. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR07 — PARTIAL.** Write a natural next turn with consistent speaker, tone and purpose; do not mark legitimate clarification questions wrong. Seven dialogue tasks drafted; over-obvious distractors were revised during self-review. Speaker/tone decisions still need independent review. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR08 — PARTIAL.** Make final writing change the setting/task/communicative goal; reject name swaps. Seven changed writing settings drafted; the near-duplicate wording screen found 0 flags involving the seven pilots. Contextual originality still needs review. Evidence: `drafts-books10-16/batch-2112-2119.json; drafts-books10-16/batch-2123.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR09 — PARTIAL.** Supply two complete appropriate writing answers and useful self-check criteria; no exact-match or mastery claim. Ten complete pilot examples and self-review guidance compile; runtime interaction not checked. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR10 — PARTIAL.** Extract 4–6 useful glossary rows as exact contiguous answer spans; exclude target and revealing fragments. Seven pilot glossaries have exact answer offsets, 4–6 rows and no target-form rows; rest pending. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR11 — PARTIAL.** Preserve natural tense/person/passive/article forms in target regex and exact target-only speaking span. Pilot target regex and speaking spans pass schema; language-form review remains open. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR12 — PARTIAL.** Write original models and diverse scenarios, screening exact/near duplication without treating similarity as automatic deletion. All 42 pilot teaching texts had 0 exact whole-sentence copies of the 2,604 source examples; the near-duplicate wording screen found 0 flags against existing lessons. These screens do not prove semantic originality. Evidence: `drafts-books10-16/batch-2112-2119.json; drafts-books10-16/batch-2123.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

### Traditional Chinese

- [ ] **ZH01 — PARTIAL.** Translate every English question, option, model, writing answer and takeaway in Traditional Chinese. Required Chinese fields are present in the seven pilots; whole-source authoring pending. Evidence: `drafts-books10-16/batch-2112-2119.json`.

- [ ] **ZH02 — PENDING.** Preserve subject, tense, uncertainty, negation, modality and the wrong meaning of each distractor. Independent English–Traditional Chinese semantic comparison not recorded. Evidence: `drafts-books10-16/batch-2112-2119.json`.

- [ ] **ZH03 — PENDING.** Pair translations by stable content identity after shuffling; bracket beneath English with no orphan closing bracket. No new-lesson browser shuffle or bracket-line check. Evidence: `drafts-books10-16/batch-2112-2119.json`.

### Interaction, typography and visual design

- [ ] **UI01 — PENDING.** Conceal first-listening transcript/translation until correct; keep wrong attempts retryable. No completed, new-batch evidence for this gate. Evidence: `No new browser report`.

- [ ] **UI02 — PENDING.** Keep four-valid replies reselectable, correct sounding, golden after selection and credited once. No completed, new-batch evidence for this gate. Evidence: `No new browser report`.

- [ ] **UI03 — PENDING.** Play full British male model before optional recording/skip; preserve exact blank cue. No completed, new-batch evidence for this gate. Evidence: `No new browser report`.

- [ ] **UI04 — PENDING.** Show glossary before typing; reveal examples only after an attempt and complete through explicit self-review. No completed, new-batch evidence for this gate. Evidence: `No new browser report`.

- [ ] **UI05 — PENDING.** Use yellow target marks/glow in examples and green in revealed models, never in unanswered choices or Chinese. No completed, new-batch evidence for this gate. Evidence: `No new browser report`.

- [ ] **UI06 — PENDING.** Show negative cues red and start final Chinese question on a sensible new line. No completed, new-batch evidence for this gate. Evidence: `No new browser report`.

- [ ] **UI07 — PENDING.** Prevent orphan final English word, lone CJK character, closing punctuation/bracket, split word, clipping and overflow. No completed, new-batch evidence for this gate. Evidence: `No new browser report`.

- [ ] **UI08 — PENDING.** Keep Card74 exact four-line identity, image-free cards and quiet background with no beams/spheres. No completed, new-batch evidence for this gate. Evidence: `No new browser report`.

- [ ] **UI09 — PENDING.** Keep full groups of five: odd3white+2black, even2black+3white; preserve DOM/data order. No completed, new-batch evidence for this gate. Evidence: `No new browser report`.

- [ ] **UI10 — PENDING.** Review partial final groups without fake lessons, hidden cards or reordered content. No completed, new-batch evidence for this gate. Evidence: `No new browser report`.

- [ ] **UI11 — PENDING.** Use readable white completion, dark copy, completed count, bilingual takeaways and working actions. No completed, new-batch evidence for this gate. Evidence: `No new browser report`.

### Accessibility

- [ ] **A11Y01 — PENDING.** Verify keyboard, visible focus, touch targets, reduced motion, live status and microphone denial on supported devices. No completed, new-batch evidence for this gate. Evidence: `No new device report`.

### Answer sounds

- [ ] **SND01 — PENDING.** Emit one shared answer-result event after marking only, respecting mute; no false objective sound for open writing. No completed, new-batch evidence for this gate. Evidence: `No new sound report`.

- [ ] **SND02 — PENDING.** Listen to correct/wrong cues, mute/unmute and rapid taps on real supported desktop and phone/tablet. No completed, new-batch evidence for this gate. Evidence: `No new sound report`.

### Audio and hosting

- [ ] **AUD01 — PENDING.** Pin Kokoro/voice hashes, four explicit roles, exact text/settings identities and British male speaking role. No completed, new-batch evidence for this gate. Evidence: `28 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD02 — PENDING.** Generate and upload only missing/changed clips with resumable checkpoints; keep MP3 binaries out of Git. No completed, new-batch evidence for this gate. Evidence: `28 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD03 — PENDING.** Verify every final public clip by exact bytes, MIME, CORS, immutable cache and range support. No completed, new-batch evidence for this gate. Evidence: `28 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD04 — PENDING.** Fully decode every clip and reject corrupt, silent or non-finite audio. No completed, new-batch evidence for this gate. Evidence: `28 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD05 — PENDING.** Run speech-content screening, inspect flags and never confuse ASR with pronunciation/accent certification. No completed, new-batch evidence for this gate. Evidence: `28 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD06 — PENDING.** Listen to every new/changed clip for wording, pronunciation, accent, pacing and clipping; record actual reviewer. No completed, new-batch evidence for this gate. Evidence: `28 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD07 — PENDING.** Check normal/slow playback, replay, repeated taps, interruption and lesson switching on desktop and phone/tablet. No completed, new-batch evidence for this gate. Evidence: `28 requested roles, 0 approved/generated/uploaded new clips`.

### Identifiers, progress and recordings

- [ ] **DAT01 — PARTIAL.** Preserve existing ten lessons, stable IDs, legacy questions/options, Native course and student history. Combined schema validates 1,893 old modules plus seven drafts; old ID/display pairs remain unchanged in generated index. Evidence: `tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **DAT02 — PENDING.** Keep writing self-reviewed, speaking unscored, one completion per question/run and owner-scoped recordings. No completed, new-batch evidence for this gate. Evidence: `tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **DAT03 — PENDING.** Verify outbox/reload/retry/storage-failure handling preserves typed input and does not claim an unsaved cloud record. No completed, new-batch evidence for this gate. Evidence: `tools/advanced-native-bulk/verify-books10-16.mjs`.

### Scale and reproducibility

- [ ] **SCL01 — PARTIAL.** Keep all lessons discoverable with sharded lazy content, stable partitions, cache retry and stale-account/selection cancellation. Current runtime has sharded loader; seven drafts have not been staged or browser-tested. Evidence: `Combined build/index validation, no new runtime stage`.

- [ ] **SCL02 — PENDING.** Measure real index/full content bytes, initial requests, render/search time and hosting usage. No completed, new-batch evidence for this gate. Evidence: `Combined build/index validation, no new runtime stage`.

- [ ] **SCL03 — PARTIAL.** Retain canonical content, exact review hashes, source-only transformation proof, audio keys and reproducible batch snapshots. Source intake, checksum, draft content and generated build remain reproducible locally; review hashes/audio absent. Evidence: `Combined build/index validation, no new runtime stage`.

### Publication and acceptance

- [ ] **REL01 — PENDING.** Reconcile all source labels/occurrences to live canonical records, aliases or explicitly resolved holds. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL02 — PENDING.** Close all blocking editorial, media, interaction and typography defects on exact final revision. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL03 — PENDING.** Create formal Supabase migration with CLI; apply compatible catalogue before frontend; verify all valid replies and old progress. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL04 — PARTIAL.** Fetch/reconcile current main, inspect selected diff, exclude private scratch/student data/secrets and audio binaries. Fresh origin/main checkout and dedicated branch; release diff/commit/push not yet performed. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL05 — PENDING.** Version every changed entrypoint and nested cached dependency; run complete focused release gates. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL06 — PENDING.** Commit/push, wait for successful Pages deployment and verify public release.json contains intended change. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL07 — PENDING.** Open live signed-in test lessons, verify assets and standard Native regression, record URLs/screenshots/commit and rollback plan. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL08 — PENDING.** Record actual owner/reviewer acceptance and exceptions separately; never label push, compilation or this checklist as completion. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

## Manual chapter crosswalk

This crosswalk covers all 30 chapters of the attached manual, including its forms and calibration sections; it does not replace the individual 55 gates.

- **Chapter 1 — Authority, owner decisions, and no false release claim.** Gates: REL08, SRC03. Open: drafts are not called live or approved.
- **Chapter 2 — Requirements register.** Gates: SRC01–REL08. All 55 gates appear above; unresolved items remain unchecked.
- **Chapter 3 — Source intake, provenance, rights.** Gates: SRC01–SRC05. Page/expression extraction complete; meaning and merge decisions pending.
- **Chapter 4 — Expression brief and difficulty.** Gates: SRC05, CUR01, CUR12. Seven briefs drafted; broader source not curated.
- **Chapter 5 — Seven-step learning contract.** Gates: CUR02, DAT02. Seven records compile; browser behavior unverified.
- **Chapter 6 — Listening question and concealment.** Gates: CUR03, UI01. Seven question records drafted; concealment unverified.
- **Chapter 7 — Four-valid reply and golden state.** Gates: CUR04, UI02. Structural golden count passes; pragmatic/browser review pending.
- **Chapter 8 — Scene, boundary, dialogue.** Gates: CUR05–CUR07, UI06. Seven of each drafted; editorial and visual checks pending.
- **Chapter 9 — Listen-before-speak and optional recording.** Gates: CUR11, UI03, AUD01, AUD07. Exact spans pass; audio and real interaction absent.
- **Chapter 10 — Changed-context writing and self-review.** Gates: CUR08–CUR09, UI04. Ten examples drafted; interaction unverified.
- **Chapter 11 — Exact answer-derived glossary.** Gates: CUR10. Seven glossaries pass span and target-leakage schema.
- **Chapter 12 — Traditional Chinese completeness and fidelity.** Gates: ZH01–ZH03. Structural fields present; independent fidelity and display pending.
- **Chapter 13 — English and Chinese wrapping.** Gates: UI06–UI07. No new six-width browser or physical-device evidence.
- **Chapter 14 — Yellow/green highlights and concealment.** Gates: CUR11, UI05. Target patterns supplied; actual CSS/reveal state unverified.
- **Chapter 15 — Correct/wrong sounds and mute.** Gates: SND01–SND02. No new lesson sound test.
- **Chapter 16 — Alternating card groups and quiet design.** Gates: UI08–UI10. Existing runtime unchanged; new group unrendered.
- **Chapter 17 — Lesson surfaces, completion, accessibility.** Gates: UI11, A11Y01. No new lesson completion/device report.
- **Chapter 18 — Canonical data and stable identifiers.** Gates: DAT01, SCL03. No ID collision; source 2,111 already used, first draft 2,112.
- **Chapter 19 — Progress and recordings.** Gates: DAT02–DAT03. No new backend/account/recording check.
- **Chapter 20 — Audio and hosting.** Gates: AUD01–AUD07. 28 pilot audio roles planned; 0 produced, heard or uploaded.
- **Chapter 21 — Current repository implementation map.** Gates: SCL01, REL04. Current loader/schema/renderer paths inspected; no release integration.
- **Chapter 22 — Twenty-step production method.** Gates: Steps 1–20 below. Only source intake and seven draft steps advanced.
- **Chapter 23 — Automated and visual audit.** Gates: CUR02, UI01–UI11, SND01. Schema passes; new browser/visual coverage absent.
- **Chapter 24 — Human editorial and device review.** Gates: SRC05, ZH02, A11Y01, AUD06. No independent human or physical-device sign-off.
- **Chapter 25 — Publication, live verification, rollback.** Gates: REL01–REL08. No new release or signed-in live evidence.
- **Chapter 26 — Scale, batch freezes and stop conditions.** Gates: SCL01–SCL03, REL02. Reconciliation queue exists; held items excluded from live.
- **Chapter 27 — Ten-lesson calibration.** Gates: CUR01, CUR06, DAT01. Preserved 1–10; new briefs checked against stated boundary examples only.
- **Chapter 28 — Worked get through it example.** Gates: CUR09–CUR11. Used as content-shape reference; no copying of its scenario.
- **Chapter 29 — Reusable intake/editorial/visual/release records.** Gates: SRC02, REL08. Intake record saved; review/media/release fields still empty.
- **Chapter 30 — Maintenance and reference map.** Gates: SCL03, REL08. No SOP rule changed; batch evidence and exceptions recorded here.

## Golden SOP twenty-step production cycle

1. [x] **PASS—intake:** Inspected origin/main, current 1,893 modules, source map, SOP and dedicated branch; reserved after existing source ordinal 2,111.
2. [ ] **PARTIAL:** Extracted all 2,604 source entries with actual page and context; 1,500 undrafted unique candidates still need sense/grammar review.
3. [ ] **PARTIAL:** Exact and lexical near candidates flagged; semantic duplicate decisions and scenario review remain open.
4. [ ] **PARTIAL:** Seven complete lesson briefs and writing answers drafted.
5. [ ] **PARTIAL:** Seven listening models, four options and explanations drafted; concealment untested in new UI.
6. [ ] **PARTIAL:** Seven four-reply sets drafted; schema confirms one target reply each, human pragmatic review pending.
7. [ ] **PARTIAL:** Seven scene/contrast/dialogue triplets drafted; visual negative cue untested.
8. [ ] **PARTIAL:** Seven speaking full models and exact blank spans validated; playback and recording untested.
9. [ ] **PARTIAL:** Fourteen complete writing examples; exact answer-derived glossary spans validated for seven drafts.
10. [ ] **PARTIAL:** Required Chinese fields structurally present for seven drafts; independent translation review pending.
11. [ ] **PARTIAL:** Seven target patterns and cloze spans pass schema; external language-form review pending.
12. [ ] **PENDING:** No completed evidence for the new batch.
13. [ ] **PENDING:** No completed evidence for the new batch.
14. [ ] **PARTIAL:** Draft builder produced seven isolated lesson shards and 42 assessment items; not added to active release index.
15. [ ] **PENDING:** No completed evidence for the new batch.
16. [ ] **PENDING:** No completed evidence for the new batch.
17. [ ] **PARTIAL:** The one schema error found in draft takeaway wording was fixed and the draft/combined checks rerun.
18. [ ] **PENDING:** No completed evidence for the new batch.
19. [ ] **PENDING:** No completed evidence for the new batch.
20. [ ] **PENDING:** No completed evidence for the new batch.

## Current automated checks and defects

- Source extraction: 275/275 question headings found in the rendered 246-page PDF; 2,604/2,604 rows assigned a page; seven per-book counts agree with the source headings.
- Seven-record draft compilation: both batches passed with 0 structural errors and 0 wording-reuse flags; `node tools/advanced-native-bulk/test.mjs` passed.
- Combined existing-plus-pilot validation: 1,890 authored records, 0 schema errors; unchanged identity/display pairs for the existing 1,883 imported records; proposed new display numbers 1894–1900.
- Pilot originality screen: 0 exact whole-sentence copies of new guide examples among 42 teaching texts; pilot near-duplicate wording screen against existing records: 0 flags. These screens do not prove originality or semantic quality.
- The broader legacy course test was attempted in the sparse checkout but could not reach assertions: its required tracked MP3 files are excluded. The old SQL catalogue `--check` was also attempted but its migration files are excluded. Neither is recorded as a pass or as a product defect; both must be rerun in a full release checkout.
- Repair cycle: the first draft's `let it slide` takeaway did not match the target regex; wording was corrected and both draft and combined validation passed. A later self-review found over-obvious scene/dialogue distractors across the pilot; these were replaced with closer alternatives and the combined validator rerun. No defect was converted into a pass without a rerun.
- Blocking gaps: 1,500 unique new candidates have no lesson; all 2,604 rows still need final semantic ownership; no independent English/Chinese review of the seven drafts; 28 pilot audio clips absent; no new browser/device, accessibility, sound, progress, backend, public-host or live-release evidence.

## Mandatory restart rule

For any edited answer, rerun glossary span/leakage checks. For any edited model or audio setting, regenerate the exact audio request and repeat media checks. For any changed renderer, rerun all-current-lesson browser checks at 1280, 1024, 768, 600, 390 and 320 px in Chromium and WebKit, followed by actual supported-device inspection. A failed key, translation, target sense, audio, progress or layout check returns that lesson to draft/hold; it cannot be selected for publication. Reconcile the final source register, assessment catalogue, audio manifest, migration, deployment and signed-in public version before changing this verdict to approved.

## Traceable files

- `books10-16/source-inventory.jsonl` — all 2,604 source rows, categories, meanings, examples and locators.
- `books10-16/reconciliation-register.jsonl` — candidate match status for every source row; null `decision` means no semantic merge was approved.
- `drafts-books10-16/batch-2112-2119.json` — five structurally valid, unpublished lesson drafts; `drafts-books10-16/batch-2113.json` and `drafts-books10-16/batch-2123.json` contain two further distinct-sense drafts.
- `tools/advanced-native-bulk/verify-books10-16.mjs` — reproducible intake, draft and combined-catalogue integrity checks.

No human listening, physical-device approval or owner acceptance is claimed by this file.
