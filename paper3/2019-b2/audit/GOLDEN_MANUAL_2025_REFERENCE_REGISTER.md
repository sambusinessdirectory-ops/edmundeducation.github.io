# Golden Manual 2025 Reference Register

## Register purpose

This is the controlling requirement register for adapting the 2025 B2 Super Curation system to 2019 B2. It distinguishes normative Golden Manual requirements from historical 2025 implementation choices and from 2019 paper content. No implementation may be called compliant merely because a class name, panel, or test selector exists.

## Authority and reference set

| ID | Reference | Authority | Read state |
|---|---|---|---|
| GM-PDF | Paper 3 Super Curation Golden Manual 2025 B2 v8.2, 183 pages | Normative Super Curation behaviour, architecture, motion, testing, evidence and release rules | Complete, text and visual |
| GM-CODE | 2025 B2 Super Curation Line-by-Line, 24,425 physical lines | Exact reference implementation and rationale | Complete |
| FL-GM | Paper 3 Fact-Line Line-by-Line Deep Analysis Golden Manual v2.1, 3,772 lines | Normative fact-line status, unit and source reasoning rules | Complete |
| CG-GM | Fact-Line Analysis and Model Essay Congruence Audit Golden Manual v1.0, 2,937 lines | Normative bidirectional evidence and release-audit rules | Complete |
| 2019-FL | 2019 B2 Fact-Line Deep Analysis v2.1, 6,555 lines | Canonical 2019 source-unit analysis | Complete |
| 2019-ME | 2019 B2 length-controlled model essays v1.0, 60 lines | Canonical model-answer set | Complete |
| 2025-REF | `/paper3/2025-b2/` page-specific source | Behavioural benchmark, not a content source for 2019 | Complete; one tracked `index.html` variance |
| 2019-SRC | `/paper3/2019-b2/` source and 19 scans | Target implementation and original-paper evidence | Complete |

## Normative requirements

### R01 — Source inventory and separation

- Every original page, recording, transcript, visual, fact-line analysis, model answer and generated manifest has a stable identity and provenance.
- Original source evidence, teacher analysis, learner state and release evidence remain separable.
- A visual is not considered covered by OCR/text alone; it must have an original-resolution evidence entry.
- 2019 adaptation: pages `P01`–`P19`, the three embedded/cropped visual groups, and authentic Part B audio are the source inventory.

### R02 — Atomic learner unit

- One learner step owns one source unit, one stable ID, one exact spotlight target and one teaching decision.
- Each fact-line unit exposes the original excerpt, Chinese translation, one of the seven answer statuses, task relevance, the reason for that status, and an allowed answer treatment.
- A paragraph, file, class, or page-level highlight is not a substitute for an atomic source unit.
- 2019 adaptation: the 420 canonical `###` fact-line units become immutable `2019-B2-U####` records.

### R03 — Seven answer statuses and four learner prompts

- The interface must preserve the canonical seven-status decision system and consistently answer the four learner questions: what the source says, why it matters, why this status/decision applies, and how the answer may use it.
- Status text may not be collapsed into a binary relevant/irrelevant flag.

### R04 — Task contracts and routes

- Task, role, reader, genre, purpose, word limit, specified sources and prohibitions are taught before evidence collection.
- Cross-source routes must be explicit, deterministic and reversible.
- 2019 adaptation: Task 8 report (~180 words), Task 9 programme text (~120 words), Task 10 introductory speech (~200 words).

### R05 — Single audio owner

- One authoritative audio element owns play, pause, seek, rate, current time and end state.
- Transcript marks, note-field updates and step transitions subscribe to that owner; competing clocks are forbidden.
- 2019 adaptation: authentic 2019 Part B MP3 and the 107-cue timestamp transcript. Audio provenance must include URL, byte length, ETag, cue count, first/last cue and verification time.

### R06 — Atomic cue transaction

- A cue transaction resolves the cue, transcript target, source page, note target and teaching step as one unit.
- Seeking backward removes future cue state and restores the exact earlier state.
- The end of audio is ordinary deterministic state, not an exceptional branch.
- No cue may mark a note or source before the evidence is heard.

### R07 — Authentic note-taking pipeline

- Learners first inspect the official note sheet, hear evidence, write or reveal only the justified note, then cross-check the transcript/source.
- Notes distinguish uncertainty, correction, exclusion and final evidence.
- 2019 adaptation: page 3 headings (short video, Brighthouse, prize giving, current state of cinema) remain visually and semantically tied to the official sheet.

### R08 — Source marking and evidence bank

- Task colours, status badges, source marks, exclusions and update/correction marks encode meaning and remain visible in matched interaction states.
- Evidence may enter a task bank only after its decision permits use; rejected/overridden/metadata evidence cannot silently enter.
- Bank entries retain source-unit IDs and return links.

### R09 — Guided choreography

- The five teaching chapters remain conceptually present: task/boss instructions, categorisation, listening, complete source review, and writing.
- Next/previous, jump-to-source, cross-source detours and returns are deterministic.
- Spotlight, dimming, scrolling and focus never hide the target, steal input focus, or strand keyboard/mobile users.

### R10 — Persistence and reset

- Progress, active step, notes, evidence bank and drafts persist under a versioned key.
- Reset is scoped, explicit and deterministic. Version migration must not reinterpret old indexes as new stable IDs.

### R11 — Writing and model answers

- The three writing tasks require learner planning/drafting before model inspection.
- Model answers are length controlled, task appropriate and grounded only in permitted evidence.
- Each model sentence maps to source-unit IDs or a documented non-source function such as salutation/transition.
- Every permitted high-value source claim maps forward to at least one model use or an explicit exclusion rationale.

### R12 — Visual, responsive and accessible behaviour

- Desktop, tablet and mobile preserve semantic state, tap targets, readable contrast, visible focus, keyboard operation and reduced-motion safety.
- Controls have accessible names and programmatic state. Status is not colour-only.
- Original-page viewing remains available without replacing the accessible text reconstruction.

### R13 — Motion contract

- The M01–M22 motion tokens and their ownership/interruptibility principles are preserved as behaviour, not necessarily identical pixel values.
- No lingering timers, stale animation classes, hidden targets or scroll races may survive step changes, seeks, reset, resize, or reduced-motion mode.

### R14 — Required verification depth

- Manual motion tests M-Q01–M-Q34, page/interaction tests P-Q01–P-Q30 and visual/source inventory checks V8 are represented by executable or documented evidence.
- Tests must assert matched user-visible states and data semantics. Selector/class existence alone is invalid evidence.
- Negative tests cover wrong source, premature cue application, backward seek, reset, migration and missing assets.

### R15 — Release evidence

- Compliance requires exact file inventory and hashes, clean verification results, bidirectional congruence, correction log, commit SHA, remote SHA equality and live payload verification.
- A local pass, a pushed commit, or a deployed-looking page alone is not a release pass.
- Any unresolved failure remains visibly open in the compliance report.

## Reference implementation variance

All copied 2025 page-specific modules except `index.html` match the line-by-line guide SHA-256. The current 2025 `index.html` (`e352ead…`) does not match the guide payload (`e80f784…`). It is therefore used as a current benchmark only; the guide/manual remains the authority for intent. This variance is not inherited as a 2019 requirement.

## Claim rule

“Full Golden Manual compliance” is allowed only when R01–R15 have evidence and no open blocker. Partial implementation is reported as partial, regardless of visual similarity to 2025.
