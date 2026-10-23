# Books 10–16: streamlined production review

The owner has authorised AI-only editorial review and asked us to accelerate the rollout. This changes the *review method*, not the seven-step lesson contract, source fidelity, answer integrity, media checks, or the obligation to report what is actually live. The [Golden SOP audit checklist](GOLDEN_SOP_AUDIT_CHECKLIST.md) remains the requirements register and records each gate's real evidence.

## Work in frozen cohorts

1. Reconcile source occurrences and decide whether each is a distinct teachable sense, an exact-source alias, an existing-course alias, or a documented hold. Preserve source page, question, sample, original sentence and decision rationale. A detector match alone is not a semantic merge.
2. Author distinct lessons in cohorts of roughly 10–20; larger mechanically clear alias groups may be processed together. Keep every new lesson in draft status until its cohort passes review. Avoid small-wave metadata rewrites for unchanged records.
3. Run structural checks on all new or changed records: schema, seven steps, six assessed questions, four valid replies with one target golden reply, answer keys, bilingual pairs, target spans, glossary spans and exclusion of the target, source/alias coverage, duplicate and originality screens. Fix any blocking result.
4. Have a separate AI reviewer inspect **every new or materially changed lesson**, prioritising meaning, source/sense fidelity, idiomatic English, Traditional Chinese equivalence, pragmatic validity of all four replies, ambiguity, scenario transfer, register and age suitability. Inspect automated near-duplicate flags and a representative sample of unflagged material. Keep specific findings and record hashes; do not repeat a full twelve-axis narrative for questions whose relevant content did not change.
5. Recheck only affected fields after a repair. An unchanged passing question inherits its earlier evidence. A source-only transformation can inherit teaching review only when a recorded before/after hash proves the teaching data is identical. A changed target, answer, option or translation requires focused independent recheck at the final exact hash.
6. At a frozen cohort checkpoint, rerun the full catalogue verifier, cross-cohort source/alias collision checks, answer and audio-key checks, and the audit checklist once. Record counts and any unresolved exceptions. Do not turn a draft-branch push, AI review, generated audio, or local browser pass into a live-release claim.

## Media and release gates

- Generate only missing/changed four-role audio identities. Hash and fully decode every final clip; use automated signal and speech-content screening for the full queue, then listen to a targeted sample including dual-ASR flags and new/changed voices. Neither ASR nor signal checks certify accent or pronunciation.
- Upload an exact frozen queue with a resumable checkpoint, verify hosted bytes and headers, and run representative Chromium/WebKit visual/interaction checks at supported widths. Inspect flagged wraps and representative screenshots. Retain physical-device and live signed-in checks as distinct gates.
- Apply the compatible assessment catalogue before switching the frontend index; publish the complete selected set atomically; verify the public version, lesson order, media playback, grading, progress and rollback path. Mark lessons live only from public evidence.

## Stop conditions

Do not select a lesson with an unresolved source/owner conflict, invalid answer, missing or target-leaking glossary, misleading translation, duplicated learning scenario, missing required audio, or failed exact-hash independent review. Keep such items in the hold register with a specific reason while independent work continues. Do not rerun already-passing whole-catalogue gates after each small edit; rerun them at the next frozen checkpoint and after any change to shared runtime or release data.
