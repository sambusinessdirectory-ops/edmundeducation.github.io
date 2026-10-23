# Advanced Native Books 10–16 — Golden SOP verification checklist

Audit snapshot: 2026-10-23 08:22 UTC. Baseline repository commit: `eca72e6f`. Branch: `codex/advanced-native-books10-16-20261023` (pushed to the site's GitHub repository; this draft branch is not the public site).
Golden manual SHA-256: `0e2eaa6001eeebf911ff8e1a0645a61fed991df947bf701152cd1ad9ddc17580`. Source DOCX SHA-256: `d239bee71f02ae43a60475202d36090e436af4da4081af92720cd5fa8fdbd012`.

**Release verdict: NOT APPROVED.** This is a complete requirements audit of the current work, not a certificate that all requirements have passed. Failed or pending gates must be repaired and the entire affected verification cycle rerun before publication. No new Books 10–16 lessons are live.

## Scope and exact counts

- Existing published baseline: 1,893 learner-facing lessons (10 original plus 1,883 imported). Source ordinal 2,111 is already assigned to a supplementary prior-course lesson; the first new draft uses 2,112.
- New document: 2,604 source rows across 275 questions and 7 books. Its per-book question and expression counts match all stated totals; 0 rows lack a rendered-PDF page.
- Exact spelling analysis: 1,844 distinct spellings, 866 occurrences exactly matching a prior source phrase, and 760 repeated occurrences within the new document. These figures do not decide whether senses match.
- Reconciliation states: 64 drafted source occurrences across 62 draft lessons; 1,182 other first-use authoring candidates; 263 first-use near-prior candidates; 864 exact-prior occurrences; 231 remaining repeated-source occurrences. 1,506 distinct new spellings need a sense-level decision.
- Draft set: 62 lessons projected for display 1894–1955, 434 steps, 372 assessed questions, 124 writing examples and 248 required audio roles. Audio produced for this draft set: **0**.
- First 540 source occurrences have an explicit **provisional** sense/action triage: 162 proposed new lessons, 182 proposed aliases to existing lessons, 27 proposed aliases within this document, and 169 wording or naturalness holds. Nine overconfident proposals in the second 60 were moved to explicit holds after independent AI critique; the third 60 have received independent AI critique and eight overconfident decisions were moved to holds or an existing owner; the fourth through ninth 60 were independently AI-audited; flagged proposals were repaired or moved to holds. These decisions are not human editorial approval. The `show up` arrival sense is kept distinct from the existing support-someone sense; `swallow time whole` is provisionally distinct from the existing accept-a-claim sense.
- A mechanical exact-phrase plus exact-guide-meaning comparison proposes 816 prior-course aliases, each pointing to one existing canonical lesson. These are **suggestions**, not approved merges; the remaining 50 exact-prior phrase occurrences include potentially different senses or differently worded explanations and remain in the review queue.

## Requirement-by-requirement register

The 55 detailed gates below operationalize the manual's 14-row requirements register. A pass scoped to intake does not pass the entire course. Existing production behavior is not automatically evidence for these new drafts.
The register maps as follows: Identity → UI08/SCL01; Learning sequence → CUR02/UI01–UI04; Four response task → CUR04/UI02; Writing support → CUR08–CUR10/UI04; Speech → CUR11/UI03/AUD01/AUD07; Chinese support → ZH01–ZH03; Target emphasis → UI05; Feedback → SND01–SND02; Wrapping → UI06–UI07; Card groups → UI09–UI10; Decoration → UI08; Completion → UI11; Compatibility → DAT01–DAT03; Release → REL01–REL08. The source, accessibility, audio quality, and scaling gates elaborate the chapter procedures beyond those 14 summary rows.
Draft evidence is split across fourteen selected `drafts-books10-16/batch-*.json` files; the combined verifier reads every batch in source-ordinal order. Independent AI review covered all 62 selected drafts. The preceding six had five findings over two review rounds, and the latest six had twelve; all seventeen were repaired and rechecked with no remaining known scoped AI finding. Source decisions 2172–2651 received independent AI audits in successive batches, with unsupported aliases and doubtful idioms moved to explicit holds; the first 60 were cross-checked through the draft reviews and alias-pattern audit but did not have a separate decision-only review. All 182 selected aliases to existing lessons now have source examples that match the canonical target detectors; this mechanical coverage does not prove semantic or pedagogical approval. AI review does not replace required human sign-off.

### Source and provenance

- [ ] **SRC01 — PARTIAL.** Reconcile every supplied PDF page, expression and occurrence. All 2,604 rows and 275 questions extracted; semantic ownership of each source row is still open. Evidence: `books10-16/source-inventory.jsonl; books10-16/reconciliation-register.jsonl`.

- [x] **SRC02 — PASS—intake.** Preserve exact source sentence, complete expression, document checksum, real page, book/question/S1–S2 and honest missing locators. Every row has Book, question, S1/S2, DOCX table/row, example, SHA-256 and rendered-PDF page; 0 page gaps. Evidence: `books10-16/source-inventory.jsonl; books10-16/reconciliation-register.jsonl`.

- [x] **SRC03 — PASS—intake.** Distinguish original sample sentences from guide-written practice examples. The 62 draft lesson records say guide_original_example, rather than original online sample answer. Evidence: `books10-16/source-inventory.jsonl; books10-16/reconciliation-register.jsonl`.

- [ ] **SRC04 — PARTIAL.** Merge exact variants without losing provenance; split genuine senses and retain useful related constructions. 816 of 866 exact-prior phrase occurrences have mechanical exact-meaning alias **suggestions**; 50 need closer sense comparison. Another 263 first-use near-prior candidates are flagged; first 540 have explicit provisional editorial decisions including a distinct `show up` sense. A new read-only alias-pattern audit found 0 detector mismatches among the 182 selected existing-owner aliases after uncertain cases were held. Four exact-match suggestions are exceptions to an automatic merge: three remain on editorial hold and one is provisionally a distinct `sink in` sense. No automatic semantic merges are approved for release. Evidence: `books10-16/source-inventory.jsonl; books10-16/reconciliation-register.jsonl; books10-16/exact-prior-alias-suggestions.jsonl; books10-16/editorial-decisions-2112-2141.jsonl; books10-16/editorial-decisions-2142-2171.jsonl; books10-16/editorial-decisions-2172-2231.jsonl; books10-16/editorial-decisions-2232-2291.jsonl; books10-16/editorial-decisions-2292-2351.jsonl; books10-16/editorial-decisions-2352-2411.jsonl; books10-16/editorial-decisions-2412-2471.jsonl; books10-16/editorial-decisions-2472-2531.jsonl; books10-16/editorial-decisions-2532-2591.jsonl; books10-16/editorial-decisions-2592-2651.jsonl; books10-16/editorial-decision-manifest.json; books10-16/linguistic-reference-notes.md`.

- [ ] **SRC05 — PENDING.** Resolve doubtful meaning, grammar, register and taxonomy against primary language references. One hundred and sixty-nine of the first 540 occurrences are explicitly held for wording, naturalness or target-unit review; two narrow dictionary checks are recorded for held idioms, but no comprehensive primary-reference or human sense review covers the 2,604 rows. Evidence: `books10-16/source-inventory.jsonl; books10-16/reconciliation-register.jsonl; books10-16/editorial-decisions-2112-2141.jsonl; books10-16/editorial-decisions-2142-2171.jsonl; books10-16/editorial-decisions-2172-2231.jsonl; books10-16/editorial-decisions-2232-2291.jsonl; books10-16/editorial-decisions-2292-2351.jsonl; books10-16/editorial-decisions-2352-2411.jsonl; books10-16/editorial-decisions-2412-2471.jsonl; books10-16/editorial-decisions-2472-2531.jsonl; books10-16/editorial-decisions-2532-2591.jsonl; books10-16/editorial-decisions-2592-2651.jsonl; books10-16/editorial-decision-manifest.json; books10-16/linguistic-reference-notes.md`.

### Curation and seven-step lesson

- [ ] **CUR01 — PARTIAL.** Write one complete meaning/grammar/register/boundary/misconception/outcome brief per canonical lesson. 62 new briefs authored; at least 1,444 other distinct new candidate spellings remain, plus unresolved sense variants. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR02 — PARTIAL.** Provide seven ordered actions and six assessed questions with optional, unscored speaking. 62 draft records compile to 434 ordered steps and 372 questions; whole new source unbuilt. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR03 — PARTIAL.** Tailor listening context, four meaning choices, one key and specific feedback. 62 listening tasks have four keyed options and tailored feedback; human editorial review pending. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR04 — PARTIAL.** Make all four reply options naturally valid, exactly one target-bearing and golden. Schema proves exactly one target-bearing golden reply in each draft; pragmatic validity needs independent review. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR05 — PARTIAL.** Write a new concrete scene, one defensible best answer and plausible alternatives. 62 scene tasks drafted; the first self-review replaced over-obvious distractors with closer timing, scope and evidence errors. AI-reviewed fairness issues were repaired; human review remains open. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR06 — PARTIAL.** Test a real boundary without inventing a restriction or rejecting a valid meaning. 62 boundary tasks drafted; no whole-source or independent sense sign-off. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR07 — PARTIAL.** Write a natural next turn with consistent speaker, tone and purpose; do not mark legitimate clarification questions wrong. 62 dialogue tasks drafted; over-obvious distractors were revised during self-review. The new-source schema now rejects a keyed dialogue reply without the target, closing a defect found in AI review; speaker/tone decisions still need human review. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR08 — PARTIAL.** Make final writing change the setting/task/communicative goal; reject name swaps. 62 changed writing settings drafted; the near-duplicate wording screen found 0 flags involving the 62 drafts. Contextual originality still needs review. Evidence: `drafts-books10-16/batch-2112-2119.json; drafts-books10-16/batch-2123.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR09 — PARTIAL.** Supply two complete appropriate writing answers and useful self-check criteria; no exact-match or mastery claim. One hundred and twenty-four complete draft examples and self-review guidance compile; runtime interaction not checked. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR10 — PARTIAL.** Extract 4–6 useful glossary rows as exact contiguous answer spans; exclude target and revealing fragments. 62 draft glossaries have exact answer offsets, 4–6 rows and no target-form rows; rest pending. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR11 — PARTIAL.** Preserve natural tense/person/passive/article forms in target regex and exact target-only speaking span. Draft target regex and speaking spans pass schema; language-form review remains open. Evidence: `drafts-books10-16/batch-2112-2119.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **CUR12 — PARTIAL.** Write original models and diverse scenarios, screening exact/near duplication without treating similarity as automatic deletion. All 372 draft teaching texts had 0 exact whole-sentence copies of the 2,604 source examples; the near-duplicate wording screen found 0 flags against existing lessons. These screens do not prove semantic originality. Evidence: `drafts-books10-16/batch-2112-2119.json; drafts-books10-16/batch-2123.json; tools/advanced-native-bulk/verify-books10-16.mjs`.

### Traditional Chinese

- [ ] **ZH01 — PARTIAL.** Translate every English question, option, model, writing answer and takeaway in Traditional Chinese. Required Chinese fields are present in the 62 drafts; whole-source authoring pending. Evidence: `drafts-books10-16/batch-2112-2119.json`.

- [ ] **ZH02 — PENDING.** Preserve subject, tense, uncertainty, negation, modality and the wrong meaning of each distractor. Independent AI review found fidelity/subject issues in the first eight; those were repaired and the AI re-review found them resolved. Human translation comparison is not recorded. Evidence: `drafts-books10-16/batch-2112-2119.json`.

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

- [ ] **AUD01 — PENDING.** Pin Kokoro/voice hashes, four explicit roles, exact text/settings identities and British male speaking role. No completed, new-batch evidence for this gate. Evidence: `248 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD02 — PENDING.** Generate and upload only missing/changed clips with resumable checkpoints; keep MP3 binaries out of Git. No completed, new-batch evidence for this gate. Evidence: `248 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD03 — PENDING.** Verify every final public clip by exact bytes, MIME, CORS, immutable cache and range support. No completed, new-batch evidence for this gate. Evidence: `248 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD04 — PENDING.** Fully decode every clip and reject corrupt, silent or non-finite audio. No completed, new-batch evidence for this gate. Evidence: `248 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD05 — PENDING.** Run speech-content screening, inspect flags and never confuse ASR with pronunciation/accent certification. No completed, new-batch evidence for this gate. Evidence: `248 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD06 — PENDING.** Listen to every new/changed clip for wording, pronunciation, accent, pacing and clipping; record actual reviewer. No completed, new-batch evidence for this gate. Evidence: `248 requested roles, 0 approved/generated/uploaded new clips`.

- [ ] **AUD07 — PENDING.** Check normal/slow playback, replay, repeated taps, interruption and lesson switching on desktop and phone/tablet. No completed, new-batch evidence for this gate. Evidence: `248 requested roles, 0 approved/generated/uploaded new clips`.

### Identifiers, progress and recordings

- [ ] **DAT01 — PARTIAL.** Preserve existing ten lessons, stable IDs, legacy questions/options, Native course and student history. Combined schema validates 1,883 old imported records plus 62 drafts; old imported ID/display pairs remain unchanged in the generated index. The 10 original runtime lessons are not rewritten by this draft build. Evidence: `tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **DAT02 — PENDING.** Keep writing self-reviewed, speaking unscored, one completion per question/run and owner-scoped recordings. No completed, new-batch evidence for this gate. Evidence: `tools/advanced-native-bulk/verify-books10-16.mjs`.

- [ ] **DAT03 — PENDING.** Verify outbox/reload/retry/storage-failure handling preserves typed input and does not claim an unsaved cloud record. No completed, new-batch evidence for this gate. Evidence: `tools/advanced-native-bulk/verify-books10-16.mjs`.

### Scale and reproducibility

- [ ] **SCL01 — PARTIAL.** Keep all lessons discoverable with sharded lazy content, stable partitions, cache retry and stale-account/selection cancellation. Current runtime has a sharded loader; 62 drafts have not been staged or browser-tested. Evidence: `Combined build/index validation, no new runtime stage`.

- [ ] **SCL02 — PENDING.** Measure real index/full content bytes, initial requests, render/search time and hosting usage. No completed, new-batch evidence for this gate. Evidence: `Combined build/index validation, no new runtime stage`.

- [ ] **SCL03 — PARTIAL.** Retain canonical content, exact review hashes, source-only transformation proof, audio keys and reproducible batch snapshots. Source intake, checksum, draft content and generated build remain reproducible locally; review hashes/audio absent. Evidence: `Combined build/index validation, no new runtime stage`.

### Publication and acceptance

- [ ] **REL01 — PENDING.** Reconcile all source labels/occurrences to live canonical records, aliases or explicitly resolved holds. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL02 — PENDING.** Close all blocking editorial, media, interaction and typography defects on exact final revision. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL03 — PENDING.** Create formal Supabase migration with CLI; apply compatible catalogue before frontend; verify all valid replies and old progress. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL04 — PARTIAL.** Fetch/reconcile current main, inspect selected diff, exclude private scratch/student data/secrets and audio binaries. Fresh origin/main checkout and dedicated branch; draft-branch commits/push performed; release diff, migration and deployment not performed. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL05 — PENDING.** Version every changed entrypoint and nested cached dependency; run complete focused release gates. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL06 — PENDING.** Commit/push, wait for successful Pages deployment and verify public release.json contains intended change. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL07 — PENDING.** Open live signed-in test lessons, verify assets and standard Native regression, record URLs/screenshots/commit and rollback plan. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

- [ ] **REL08 — PENDING.** Record actual owner/reviewer acceptance and exceptions separately; never label push, compilation or this checklist as completion. No completed, new-batch evidence for this gate. Evidence: `No migration, deployment or public-version evidence`.

## Manual chapter crosswalk

This crosswalk covers all 30 chapters of the attached manual, including its forms and calibration sections; it does not replace the individual 54 gates.

- **Chapter 1 — Authority, owner decisions, and no false release claim.** Gates: REL08, SRC03. Open: drafts are not called live or approved.
- **Chapter 2 — Requirements register.** Gates: SRC01–REL08. All 54 gates appear above; unresolved items remain unchecked.
- **Chapter 3 — Source intake, provenance, rights.** Gates: SRC01–SRC05. Page/expression extraction complete; meaning and merge decisions pending.
- **Chapter 4 — Expression brief and difficulty.** Gates: SRC05, CUR01, CUR12. 62 briefs drafted; broader source not curated.
- **Chapter 5 — Seven-step learning contract.** Gates: CUR02, DAT02. 62 records compile; browser behavior unverified.
- **Chapter 6 — Listening question and concealment.** Gates: CUR03, UI01. 62 question records drafted; concealment unverified.
- **Chapter 7 — Four-valid reply and golden state.** Gates: CUR04, UI02. Structural golden count passes; pragmatic/browser review pending.
- **Chapter 8 — Scene, boundary, dialogue.** Gates: CUR05–CUR07, UI06. 62 of each drafted; editorial and visual checks pending.
- **Chapter 9 — Listen-before-speak and optional recording.** Gates: CUR11, UI03, AUD01, AUD07. Exact spans pass; audio and real interaction absent.
- **Chapter 10 — Changed-context writing and self-review.** Gates: CUR08–CUR09, UI04. Eighty examples drafted; interaction unverified.
- **Chapter 11 — Exact answer-derived glossary.** Gates: CUR10. 62 glossaries pass span and target-leakage schema.
- **Chapter 12 — Traditional Chinese completeness and fidelity.** Gates: ZH01–ZH03. Structural fields present; first-eight AI findings repaired and AI re-reviewed; human fidelity and display pending.
- **Chapter 13 — English and Chinese wrapping.** Gates: UI06–UI07. No new six-width browser or physical-device evidence.
- **Chapter 14 — Yellow/green highlights and concealment.** Gates: CUR11, UI05. Target patterns supplied; actual CSS/reveal state unverified.
- **Chapter 15 — Correct/wrong sounds and mute.** Gates: SND01–SND02. No new lesson sound test.
- **Chapter 16 — Alternating card groups and quiet design.** Gates: UI08–UI10. Existing runtime unchanged; new group unrendered.
- **Chapter 17 — Lesson surfaces, completion, accessibility.** Gates: UI11, A11Y01. No new lesson completion/device report.
- **Chapter 18 — Canonical data and stable identifiers.** Gates: DAT01, SCL03. No ID collision; source 2,111 already used, first draft 2,112.
- **Chapter 19 — Progress and recordings.** Gates: DAT02–DAT03. No new backend/account/recording check.
- **Chapter 20 — Audio and hosting.** Gates: AUD01–AUD07. 248 draft audio roles planned; 0 produced, heard or uploaded.
- **Chapter 21 — Current repository implementation map.** Gates: SCL01, REL04. Current loader/schema/renderer paths inspected; no release integration.
- **Chapter 22 — Twenty-step production method.** Gates: Steps 1–20 below. Only source intake and 62 draft records advanced.
- **Chapter 23 — Automated and visual audit.** Gates: CUR02, UI01–UI11, SND01. Schema passes; new browser/visual coverage absent.
- **Chapter 24 — Human editorial and device review.** Gates: SRC05, ZH02, A11Y01, AUD06. AI peer review is recorded, but no independent human or physical-device sign-off.
- **Chapter 25 — Publication, live verification, rollback.** Gates: REL01–REL08. No new release or signed-in live evidence.
- **Chapter 26 — Scale, batch freezes and stop conditions.** Gates: SCL01–SCL03, REL02. Reconciliation queue exists; held items excluded from live.
- **Chapter 27 — Ten-lesson calibration.** Gates: CUR01, CUR06, DAT01. Preserved 1–10; new briefs checked against stated boundary examples only.
- **Chapter 28 — Worked get through it example.** Gates: CUR09–CUR11. Used as content-shape reference; no copying of its scenario.
- **Chapter 29 — Reusable intake/editorial/visual/release records.** Gates: SRC02, REL08. Intake record saved; review/media/release fields still empty.
- **Chapter 30 — Maintenance and reference map.** Gates: SCL03, REL08. No SOP rule changed; batch evidence and exceptions recorded here.

## Golden SOP twenty-step production cycle

1. [x] **PASS—intake:** Inspected origin/main, current 1,893 modules, source map, SOP and dedicated branch; reserved after existing source ordinal 2,111.
2. [ ] **PARTIAL:** Extracted all 2,604 source entries with actual page and context; at least 1,444 undrafted unique candidates still need sense/grammar review.
3. [ ] **PARTIAL:** Exact and lexical near candidates flagged; semantic duplicate decisions and scenario review remain open.
4. [ ] **PARTIAL:** 62 complete lesson briefs and writing answers drafted.
5. [ ] **PARTIAL:** 62 listening models, four options and explanations drafted; concealment untested in new UI.
6. [ ] **PARTIAL:** 62 four-reply sets drafted; schema confirms one target reply each, human pragmatic review pending.
7. [ ] **PARTIAL:** 62 scene/contrast/dialogue triplets drafted; visual negative cue untested.
8. [ ] **PARTIAL:** 62 speaking full models and exact blank spans validated; playback and recording untested.
9. [ ] **PARTIAL:** One hundred and twenty-four complete writing examples; exact answer-derived glossary spans validated for 62 drafts.
10. [ ] **PARTIAL:** Required Chinese fields structurally present for 62 drafts; independent translation review pending.
11. [ ] **PARTIAL:** 62 target patterns and cloze spans pass schema; external language-form review pending.
12. [ ] **PARTIAL — English and Chinese editorial review:** Independent AI peer review covered all 62 drafts, and all recorded scoped findings were repaired and rechecked with no remaining known AI findings. This does not satisfy the manual's independent human English/Chinese review or owner acceptance.
13. [ ] **PENDING — freeze text and produce audio:** Text remains provisional. No exact final text/voice freeze, new Kokoro clip generation, listening approval or hosted manifest exists.
14. [ ] **PARTIAL — generate browser and assessment outputs:** The draft builder compiled 62 lesson records into source-ordinal content shards and 372 assessment items; these were generated from provisional source and are not in the active release index. Old IDs remain unchanged in the combined build.
15. [ ] **PARTIAL — automate and exercise each step:** Schema, source, glossary, existing-alias target coverage, target-bearing dialogue, cloze, duplicate and combined-catalogue checks pass for the selected 62-draft checkpoint. Fresh/completed browser interactions have not been exercised.
16. [ ] **PENDING — widths, access and feedback:** No 1280/1024/768/600/390/320-pixel visual inspection, keyboard/touch/accessibility, correct/wrong sound and mute, highlight/concealment, translation pairing or completion-contrast evidence for new lessons.
17. [ ] **PARTIAL — repair and rerun:** Initial target-regex error and first-eight AI findings were repaired; affected glossary spans and combined schema checks were rerun. All AI-reviewed draft findings across 62 records were repaired; scoped AI follow-ups found no remaining known issues, including a second review of lesson 2243. Edited audio models still require exact clip generation and media checks.
18. [ ] **PENDING — reviewed release and migration:** Draft branch was committed and pushed for review, but main reconciliation, approved batch commit, compatible Supabase migration, deployment and public version verification are open.
19. [ ] **PENDING — signed-in live acceptance:** No new live signed-in lesson, reported-case replay, public screenshot, deployed commit or rollback rehearsal has been recorded.
20. [ ] **PARTIAL — register and rule maintenance:** Intake and this audit are versioned; no SOP rule changed. Release record and accepted pilot operating-rule archive remain open, and mass propagation is not release-approved.

## Current automated checks and defects

- Source extraction: 275/275 question headings found in the rendered 246-page PDF; 2,604/2,604 rows assigned a page; seven per-book counts agree with the source headings.
- 62-record draft compilation: all fourteen selected batches passed with 0 structural errors and 0 wording-reuse flags; `node tools/advanced-native-bulk/test.mjs` passed.
- Combined existing-plus-draft validation: 1,945 authored records, 0 schema errors; unchanged identity/display pairs for the existing 1,883 imported records; proposed new display numbers 1894–1955.
- Draft originality screen: 0 exact whole-sentence copies of new guide examples among 372 teaching texts; draft near-duplicate wording screen against existing records: 0 flags. These screens do not prove originality or semantic quality.
- The broader legacy course test was attempted in the sparse checkout but could not reach assertions: its required tracked MP3 files are excluded. The old SQL catalogue `--check` was also attempted but its migration files are excluded. Neither is recorded as a pass or as a product defect; both must be rerun in a full release checkout.
- Repair cycle: the first draft's `let it slide` takeaway did not match the target regex; wording was corrected and draft/combined validation passed. Self-review and independent AI review then found distractor fairness, answer grounding, Chinese fidelity, scenario originality and dialogue-target issues across all 62 drafts. All recorded scoped findings in those 62 were repaired and independently AI rechecked to zero remaining known issues. The editable source remains provisional and no defect was converted into a release pass.
- Blocking gaps: at least 1,444 unique new candidates have no lesson; all 2,604 rows still need final semantic ownership. One hundred and sixty-nine of the first 540 rows are explicitly held. Independent human English/Chinese review of all 62 drafts remains pending; 248 draft audio roles have no generated clips; no new browser/device, accessibility, sound, progress, backend, public-host or live-release evidence.

## Mandatory restart rule

For any edited answer, rerun glossary span/leakage checks. For any edited model or audio setting, regenerate the exact audio request and repeat media checks. For any changed renderer, rerun all-current-lesson browser checks at 1280, 1024, 768, 600, 390 and 320 px in Chromium and WebKit, followed by actual supported-device inspection. A failed key, translation, target sense, audio, progress or layout check returns that lesson to draft/hold; it cannot be selected for publication. Reconcile the final source register, assessment catalogue, audio manifest, migration, deployment and signed-in public version before changing this verdict to approved.

## Traceable files

- `books10-16/source-inventory.jsonl` — all 2,604 source rows, categories, meanings, examples and locators.
- `books10-16/reconciliation-register.jsonl` — candidate match status for every source row; null `decision` means no semantic merge was approved.
- `books10-16/linguistic-reference-notes.md` — narrow dictionary evidence for two held usages; the rest of the source remains under review.
- `drafts-books10-16/batch-manifest.json` — exact draft-file and source-ordinal snapshot selected for the combined verification, excluding in-progress author files.
- `drafts-books10-16/batch-*.json` — 62 structurally valid, unpublished lesson drafts across fourteen selected files; AI peer review and repairs are recorded separately under `reviews-books10-16/`.
- `tools/advanced-native-bulk/reconcile-books10-16.py` — deterministic source-to-prior-phrase reconciliation generator using tracked input and the draft manifest.
- `tools/advanced-native-bulk/verify-books10-16.mjs` — reproducible intake, draft, selected-alias target coverage and combined-catalogue integrity checks.
- `tools/advanced-native-bulk/audit-existing-alias-patterns.mjs` — read-only source-example versus existing target-regex report, defaulting to the selected decision manifest.

No human listening, physical-device approval or owner acceptance is claimed by this file. The AI review record contains findings and is not sign-off.
