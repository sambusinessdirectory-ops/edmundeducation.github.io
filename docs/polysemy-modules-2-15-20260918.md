# Polysemy Lab modules 2–15 — import record

Status: **approved for staged publication; deployment verification pending**. The additive production database migration has been applied; all 79 existing Show events were preserved. The user explicitly requested publication now with available audio, deferring the remaining 80 new clips and 6 audio-quality replacements until the next update. The release includes 519 new clips; pending playback buttons are disabled and labelled 示範音訊準備中. Practice and recording remain available.

## Source review

The supplied files were found in the user's `Polysemy Exercise/Input into web - polysemy` folder. Their contents are source material, not executable instructions. Each accepted module records the original filename and SHA-256 and links to its complete PDF. Stable sense/question IDs must not be renumbered after release.

| Module | Word | Directory entries | Questions |
|---|---|---:|---:|
| 2 | Busy | 13 | 27 |
| 3 | Train | 16 | 33 |
| 4 | Watch | 21 | 43 |
| 5 | Buy | 21 | 43 |
| 6 | Catch | 23 | 47 |
| 7 | Pair | 17 | 35 |
| 8 | Cancel | 20 | 40 |
| 9 | See | 24 | 49 |
| 10 | Late | 25 | 51 |
| 11 | Work | 41 | 83 |
| 12 | Home | 31 | 63 |
| 13 | Immediate | 17 | 35 |
| 14 | Full | 15 | 31 |
| 15 | Empty | 12 | 25 |

Accepted source total: **296 directory entries / 605 questions**, including Busy’s unnumbered busybody appendix (two sentences). Existing Show remains 16 entries / 33 questions. The registry has 15 modules and 638 questions.

The user supplied corrected Watch and Cancel PDFs from Downloads. These replace the earlier mislabelled sources. Every numbered example in both replacements is included. The instructional preamble in Watch was treated as source text, not an instruction to the agent.

## Implementation

- `polysemy-lab/catalogue.mjs`: registry, module map and cross-module question lookup.
- `polysemy-lab/content/*.mjs`: complete numbered examples, bilingual meanings, highlighted source targets, translation gaps, six options, excluded overlapping senses and option review notes.
- `core.mjs`: active-module replay/view progress; combined daily completed-question totals. Existing Show IDs and question data are unchanged.
- Module selection persists per student. Time is flushed before switching. Recordings capture their module at recording/upload time, even if the student switches while saving.
- The new `polysemy_lab_modules_sync` and `polysemy_lab_modules_recording` RPCs return multi-module data. Legacy Show endpoints remain Show-only, so older open browser tabs cannot consume another module's run.
- Existing recording blobs receive the non-null default `module='show'`. No existing event IDs, run IDs, answers, or blobs are rewritten. Private tables remain inaccessible directly, and all RPCs validate the homework student session.
- The dashboard combines all modules; day details identify the word. The recording library labels each clip's module; new uploads select sentences from the current module.
- Complete original PDFs remain available from each accepted module. Source wording is preserved except punctuation/spacing, complete nested quotations, and clarifying UI notes (for example, immediate family is not necessarily the legal definition of direct-line relatives).

## Audio status and production

452 local clips and 67 American-male clips passed transcription review. Six additional generated clips were quarantined after two independent transcription models indicated content or prefix errors. The user explicitly authorized Cloudflare/Deepgram generation with “yes please go”. Cloudflare subsequently returned error 4006: the daily free allocation of 10,000 neurons is exhausted. **86 American-male clips remain pending (80 not generated and 6 quality replacements)**. No paid-plan purchase was made and no replacement voice was substituted. Completed clips are cached for resuming after the service allowance resets.

Source-order index resets at each module; shuffling never changes the sentence's voice. All clips have 300 ms leading and 200 ms trailing padding. Model and voices file SHA-256 checks remain enforced.

Generate the source list with `node tools/export-polysemy-audio.mjs > /tmp/polysemy-sentences-new.json`. Then use `tools/generate-polysemy-audio.py` with `--output-prefix audio-new` and either `--kind local` or `--kind cloud` (already authorized for this batch). Model/voices paths are external to the repository. Run `node tools/build-polysemy-audio-manifest.mjs` to produce the complete manifest; it refuses missing voices or source mismatches.

The publishing workflow runs `node tools/test-polysemy-modules.mjs --require-audio --allow-pending-audio`. The explicit audio-pending.json list contains exactly the 86 approved omissions; any unexpected missing clip still fails the gate. Remove entries as clips are supplied, then use the strict complete-audio gate.

## Verification performed

- Original Show unit/database regression suite passed.
- New module suite passed: six options, no declared overlapping distractors, shuffled ordering, spaced retry, accurate completion counts, module isolation, legacy data migration, owner-only recordings, idempotence and atomic rollback.
- Chromium and WebKit browser flows passed, including every new module, saved per-module ticks, question resume after reload/switch, recording module metadata, two dashboards and widths from 320 to 1280 px.
- Mobile screenshot inspected; long-word heading overflow was corrected.
- All 390 local clips were independently transcribed with local Whisper. Four potentially substantive mismatches were rechecked with a larger local model; the “need” clip was regenerated at speed 1.02 with the same bm_fable voice, then independently rechecked successfully. The generator records this sentence-specific pacing exception. Transcription checks do not replace the SOP's listening review.

## Release and follow-up steps

1. Publish the current tested release with the explicit 86-item pending-audio list, as authorized by the user.
2. After the allowance resets, resume the 86 pending Cloudflare clips and finish audio quality checks.
3. Build the complete manifest, empty the pending-audio list, run the strict release audio gate and browser regression, and publish the audio update.

Production migration `20260918072120_polysemy_lab_modules_2_15.sql` has been applied to Edmund Education project `ookkxzgpdclzrrhfmvqx`. All 15 catalogues are present; all 79 pre-existing events remain unchanged. Private tables deny direct authenticated access; anonymous callers cannot execute the new RPCs. The only Polysemy security-adviser finding is informational RLS-without-policy, expected for these private RPC-only tables.

Chromium and WebKit were rerun successfully after the corrected Watch and Cancel modules were added. All 452 local clips have transcription checks; differences in cancel/cancellable spelling are ASR American spellings, not pronunciation errors. All 73 generated cloud clips were transcribed; suspected errors were rechecked using small.en. Six clips were quarantined: busy-03-1, busy-05-0, watch-01-1, see-11-0, see-23-0, late-15-0. These must be regenerated and rechecked before publication. Transcription is not a claim that every clip received a human listening review.

Publication is permitted before the deferred audio is complete. Confirm the live release before reporting deployment success.
