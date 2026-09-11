# Learning tools release, 11 September 2026

## Question catalogues

- IELTS Listening: 20 practices, 80 parts, 800 individually accounted-for questions. `listening-question-type-ranges.json` records the reviewed question ranges, including mixed layouts within a part. The generator rejects omissions and duplicate assignments.
- Eight types are present: single-answer multiple choice, multiple-answer multiple choice, matching, map/plan labelling, note, table, form and flow-chart completion. These are the types in this collection, not a claim about every possible IELTS question type.
- DSE Speaking: 282 sets, 846 discussion points and 2,256 individual questions. Sixteen intent tags allow overlapping categories. Each result retains its year, set, section, question number and original wording.
- Recent DSE discussion points were checked against the supplied examiner papers. Duplicate points, task instructions mistakenly stored as questions and OCR page footers were repaired. Source passage text and bookmark keys remain unchanged.
- Regenerate with `node tools/generate-listening-question-types.mjs` and `node tools/generate-dse-speaking-question-types.mjs`.

## Professional English

Seven standalone dialogue pages contain 87 English/Chinese turns, six playback rates, synchronized current-line highlighting, translation display/copy and 16 cloze modes.

The supplied *Lesson 1 and 2 - Dialogue Translations.pdf* covers five dialogue versions. The missing Lesson 1 third dialogue and Lesson 2 first dialogue were translated from the existing English. Per-dialogue provenance is retained in `dialogues.json`.

Approved site voice recipes:

| Lesson | Visitor | Security |
| --- | --- | --- |
| 1 | Kokoro bm_fable, en-gb, 0.98 | Kokoro af_heart, en-us, 0.96 |
| 2 | Kokoro bf_isabella, en-gb, 1.05 | Deepgram Aura 2 Aries, en-us |

The Kokoro model and voice-bank checksums match the existing Speaking generator. The DSE read-aloud frontend again requests the existing `american-youthful-male-v1` Aries endpoint; it no longer silently changes to a device-selected voice after a provider failure.

### Outstanding provider dependency

At release preparation, Cloudflare returned HTTP 429 / code 4006: the account had exhausted its daily free Workers AI allowance. No paid subscription was purchased. The owner was asked separately whether to approve the Workers Paid plan.

64 dialogue turns (60 unique MP3 files) are generated. The 23 Lesson 2 Security/Aries turns remain unavailable. The page explicitly states this, disables unavailable clips and complete-dialogue playback, and keeps available Visitor audio, translations and exercises usable. DSE Aries audio also depends on the provider allowance for uncached requests.

After the allowance resets or an authorized upgrade, run `tools/generate-professional-dialogue-audio.py --kind cloud` with the existing model, voices, Wrangler and account paths. Credentials are obtained through Wrangler in memory and never written to the repository. The generator merges completed entries into `professional-english/dialogue-audio.json`; the availability notice disappears automatically when all clips for that dialogue exist. Validate with `node tools/test-learning-updates-20260911.mjs --require-complete-audio`, then deploy.

## Validation

The new regression gate checks complete question coverage, category counts, source correspondence, all four resize corners, finder filtering and links, translated dialogue roles, MP3 manifests, playback lifecycle/rates/highlighting, all 16 modes, wrong-answer retry and partial-provider availability. Browser checks cover desktop and phone-width layouts and keyboard resizing of all four music/transcript corners. Existing DSE source-layout/bookmark, Listening, Professional feedback, Speaking exam mode and floating-music tests also pass.
