# Advanced Native canonical course production

This tooling implements the 16 October 2026 Golden SOP's reproducible data checks. It does not certify that English is idiomatic, all four replies are contextually valid, a Chinese translation is faithful, audio sounds British, or a live release works. Those require recorded editorial, listening, browser and release evidence. A generated checkmark must not be described as independent human approval.

## Files and authority

- `schema.mjs`: canonical record validator, deterministic compatible lesson compiler, and exact audio queue settings.
- `build.mjs`: reads canonical JSON, validates all records, flags duplicate task wording, generates browser lessons, reviewed target patterns, assessment data, audio requests, and a validation report.
- `convert-calibration.mjs`: reproducibly converts shipped lesson 7 using the extracted source occurrence register. This is a migration example, not new approval.
- `calibration-007.json`: complete authoring example with honest missing book/question/sample locators, exact glossary spans, preserved approved cue and original answer text.
- `audio.py`: resumable pinned-Kokoro production and exact legacy cache reuse; no upload or listening sign-off.
- `test.mjs`: adversarial checks for stale source spans, target fragments, two golden replies, translation pairing, speaking surroundings, voice settings and absent release evidence.
- `select-preview.mjs`: selects only the current independently reviewed record hash with four exact, pinned, uploaded audio roles for local QA. Refresh `progress.mjs` immediately before selection; the record count alone never proves that review is current.
- `test-select-preview.mjs`: rejects a changed record after review, an American speaking-voice substitution, missing upload evidence, changed audio text and expired status.

Canonical authoring records are separate from generated browser files. Never edit generated outputs by hand. Never replace existing lessons 1–10 by a reconstructed version as a side effect of adding new lessons. The approved old content and existing IDs remain in place until a separately validated migration deliberately supersedes them.

## Canonical envelope

Use `{ "schemaVersion": 1, "batchId": "unique-batch-id", "lessons": [...] }`. A bare array is accepted for offline transformations, but the versioned envelope is preferred. The complete runnable example is `calibration-007.json`.

Each record contains:

| Field | Contract |
| --- | --- |
| `id`, `number`, `contentRevision` | Immutable `advanced-native-NNN` identity; `number` in canonical authoring records reserves the source ordinal; explicit content revision. Keep reserved IDs/ordinals after deduplication. The bulk builder assigns consecutive learner-facing display numbers from11 and retains the source ordinal separately as `sourceNumber`; display labels never key student events. |
| `titleEn`, `titleZh`, `cardTitleLines` | Complete expression and natural Traditional Chinese title. Optional line groups reconstruct the title exactly. |
| `category` | `phrasal-verb`, `idiom`, `figurative`, or `natural`; decide from the actual taught sense. |
| `target.pattern` | Reviewed case-insensitive JavaScript regex covering natural target forms. Match a meaningful expression, not a ubiquitous word such as `out`. |
| `target.glossaryForbidden` | Optional additional reviewed regexes for revealing fragments, variants, or close clues. Full target spans are always excluded from glossaries. |
| `brief` | `meaningEn`, `meaningZh`, `grammar`, `register`, `boundaryZh`, `misconceptionZh`, `outcomeZh`; complete before exercise drafting. |
| `sources[]` | `occurrenceId`, `file`, `sha256`, one-based `page`, `book`, `question`, `sample`, `locatorNote`, exact `sentence`, complete `expression`, `referenceSentenceKind`. |
| `listening` | English `en`, Traditional Chinese `zh`, question fields, four tailored meaning options, one answer. Transcript concealment is supplied by the compatible runtime. |
| `reply` | English question and Chinese translation, exactly four valid replies, exactly one `goldenId`; all score correct and remain selectable. |
| `scene`, `contrast`, `dialogue` | New concrete situations and distinct decisions; three or four options, one defensible best answer, explanatory Chinese feedback. |
| `speaking` | Full English `en`, Chinese `zh`, contextual `promptZh`, exact UTF-16 `targetSpan: {start,end}`, optional derived `cloze`. Model plays before speaking. |
| `writing` | Changed `promptZh`; exactly two bilingual complete `examples`; four to six answer-derived glossary rows; contextual `selfCheckZh`. |
| `takeaways` | Exactly two `{en,zh}` complete useful teaching sentences. |
| `review` | Production `state` and honest evidence. Draft source conversion does not constitute passed review. |

`referenceSentenceKind` must be `source_sentence` or `guide_original_example`. A guide-written practice sentence is not the original online sample answer. Keep every occurrence attached to the canonical expression even when repeated labels are merged. Distinct senses can require separate records: a matching label alone is not proof of duplicate meaning.

Use a source basename, not a private absolute workstation path, in public metadata. Keep the original path/checksum/intake record privately for reproducibility. Missing book, question, or sample fields stay null and carry an explicit `locatorNote`; never derive a nonexistent locator from the order of extraction. Actual PDF page and the original source book's printed page are separate locators.

## Question and option identity

Each question has `promptEn` where English is shown, `promptZh`, `explanationZh`, and `options: [{id,en,zh}]`. Chinese-only options can use the existing `en` storage slot for the actual displayed Chinese text; no duplicate translation is necessary. New bilingual English choices must each have their own Chinese translation. `answerId` references a stable option identity. The four-response question uses `goldenId` instead.

The compiler preserves historical question identities: `-v1-audio`, `-v2-reply`, `-v1-scene`, `-v1-contrast`, `-v1-branch`, `-v1-final`. `speaking` is not an assessed question. Source `dialogue` compiles to historical runtime `branch`. The compiler attaches both `optionIds` and English-keyed `optionZh` so the present string-based runtime stays compatible while presentation shuffles preserve pairs. Answer strings remain exact; changing assessment semantics requires a deliberate revision and compatible server catalogue.

The four replies are not four guesses with three secretly wrong answers. A language reviewer must be able to justify each one independently from the prompt; exactly one naturally contains the teaching target. The validator can count regex matches, but it cannot make those pragmatic judgments.

## Glossary spans and speaking blank

A glossary row is `{en,zh,exampleIndex,span:{start,end}}`. `exampleIndex` is zero based and points to one of the two actual writing examples. `start` is inclusive and `end` exclusive using JavaScript UTF-16 offsets. `example.en.slice(start,end)` must equal the row's English after deliberate case, curly-apostrophe and whitespace normalization. Prefer recording the exact original spelling so manual audits are straightforward.

The validator checks actual spans as well as contiguous source inclusion. It rejects any row whose source span intersects the teaching phrase, even if the row contains only part of it, and rejects reviewed forbidden fragments anywhere. Example edits therefore invalidate old glossary spans. Manually check that the remaining rows are useful ordinary language and do not reconstruct the target or an entire answer in disguised order.

Speaking uses the same span convention. Derive the cue by replacing precisely that selected span with `__________________`. Keep all surrounding text. The full speaking model, never the underscores, supplies the audio queue. The lesson 1 accepted cue has a deliberately wider removed chunk; preserve it unless separately approved.

## Build, validation and integration

Run:

```sh
node tools/advanced-native-bulk/test.mjs
node tools/advanced-native-bulk/build.mjs authoring/batch.json --out-dir /private/tmp/advanced-native-batch
node tools/advanced-native-bulk/build.mjs authoring/batch.json --out-dir /private/tmp/advanced-native-batch --check
```

Generated files:

1. `advanced-imported.generated.mjs`: lightweight library metadata and exact historical grading keys; complete exercise payloads are in immutable `advanced-content/NNNN-HASH.mjs` shards.
2. `advanced-targets.generated.mjs`: pattern map for `advanced-display.mjs`; contains only reviewed imported lesson patterns and never duplicates the whole lesson payload.
3. `assessment-catalogue.generated.json`: server import input with stable questions, answer strings and option identities. Generate/apply a compatible database migration through the established project workflow; this JSON is not an applied migration.
4. `audio-queue.generated.json`: four explicitly named roles per lesson; exact text and pinned voice settings; deterministic full SHA-256 synthesis identities.
5. `validation-report.generated.json`: counts, errors, review flags, and whether release evidence was checked. Default outputs are draft artifacts.

Use `--release` to require passed English, Chinese, media and QA records, each with a named reviewer and concrete evidence, plus no unresolved hold. The tool verifies evidence fields exist; the release owner must inspect their authenticity, review scope and reviewer role. Passing the flag does not turn an AI or automated review into independent human review. Owner acceptance must be recorded separately. No release occurs from this command.

`advanced-display.mjs` merges the generated pattern file after the ten legacy patterns. Integrate the full generated map atomically with lesson imports, and version its import URL along with the app/CSS/cache suffix. Do not install only the last batch's map or overwrite earlier imported forms. The canonical build should include every imported release record, excluding unchanged legacy modules unless a validated migration intentionally covers them.

## Resumable audio

The driver verifies the same pinned Kokoro model and voice hashes as the existing approved generator. It uses four roles explicitly, so repeated text does not shift the British speaking voice. Synthesis identities match the approved sorted-key Python JSON format; a text/settings change gets a new identity.

```sh
python3 tools/advanced-native-bulk/audio.py /private/tmp/advanced-native-batch/audio-queue.generated.json \
  --model /path/to/kokoro-v1.0.onnx \
  --voices /path/to/voices-v1.0.bin \
  --audio-dir /private/tmp/advanced-native-assets/audio \
  --state-dir /private/tmp/advanced-native-assets/state \
  --asset-prefix natural-english/audio/advanced-bulk/ \
  --limit 100
```

Configure the approved model with `--model` or `ADVANCED_NATIVE_KOKORO_MODEL`.
Configure voices with `--voices` or `ADVANCED_NATIVE_KOKORO_VOICES`; otherwise
`voices-v1.0.bin` beside the model is used. Explicit flags take precedence over
environment settings. The pinned file hashes, voices, locales, speeds and
synthesis identities remain unchanged. Configuration is required only when a
missing clip needs synthesis; verification and exact-cache reuse remain usable
without a local model.

Rerun the same command to resume. Use the approved Python environment containing `kokoro_onnx`, `onnxruntime` and `soundfile`, plus `ffmpeg`/`ffprobe` on PATH. Imports and model loading are deferred until a genuinely missing clip needs synthesis. Existing legacy cache reuse requires exact text, role settings and a verified saved file checksum. Each production record stores text, voice, locale, speed, duration, bytes, checksum and whether listening review remains pending. Synthesis results are written separately from repository binaries so the authorized asset-hosting pipeline can upload them without growing Git needlessly.

`--verify-only` checks all present assets and returns a failure for missing/failed clips. State output includes `manifest.json`, `metadata.json`, `summary.json`, per-clip records and explicit error files. `--limit 0` inventories/reuses exact cached files without synthesizing. Generated manifests are incomplete while clips are pending; do not publish them as a complete batch.

The driver does not certify accent or pronunciation, listen to clips, upload to Cloudflare, merge the existing manifest, apply a server catalogue, deploy Pages, or verify live playback. Those remain required production steps with their own evidence. It never sets a human listening-review field automatically.

Every listening, speaking and takeaway audio text must be at most 240 characters, with no underscores or markup. The canonical validator enforces the same bound before a frozen queue reaches the generator. Rewrite an overlong model naturally and review its English/Chinese pair; do not silently truncate it.

For an active production queue, freeze completed metadata, manifest, summary and upload checkpoint together after upload finishes. Run public-byte, signal and ASR checks against that frozen state, not mutable metadata from a later generator. ASR differences such as `ate`/`eight` or past/present inflection remain review flags; do not normalize away a possible language difference. A second recognizer can help triage flags, but neither recognizer certifies hearing or accent.

The browser orphan checker permits an intentionally blank speaking cue consisting only of underscores and punctuation, including Unicode quotation marks. This exception does not permit a lone closing bracket in a translation or a dangling English/Chinese word. Rerun affected lessons after correcting a checker; preserve initial failure evidence and explain its scope.

## Implemented scale runtime integration

The builder partitions records by immutable source-ordinal ranges of fifty and hashes each complete content shard. Appending a later range does not shift earlier records between shards. Updating a partly filled range produces a new hash; old files remain available for browsers with a cached preceding index. The initial generated index contains titles, ordering, course identity, six question IDs/types/answer keys, and prompt text for existing history-detail views. It contains no options, translations, writing examples, glossaries or full steps.

`natural-english/advanced-loader.mjs` imports a shard only when its lesson is requested. Concurrent requests in one shard share a promise; successful results are cached. Failed imports are removed from the pending map, and a retry gets a fresh query URL so a browser's cached import failure does not poison future attempts. Invalid or incomplete shard membership is rejected before hydration.

`catalogue.mjs` exports `hydrateModule(id)`. It validates the loaded question identities/types/answer keys against the index, then fills the existing module object in place and refreshes its question map/global question entries. Historical completion and daily grading work before full content is loaded. Legacy Advanced 1–10 and the standard Native modules remain full synchronous data. Offline tools that need every new lesson's steps must await hydration and use the returned full objects; the default `advanced-expressions.mjs` array intentionally contains lightweight entries for new modules.

`app.mjs` awaits hydration before beginning a new run or rendering a lesson. Account generation, owner identity and a monotonic selection request protect against stale completion after logout, a newer selection, Back, returning to the library or a search change. A failed load leaves the complete library available with a Chinese same-card retry message. All cards remain discoverable; there is no pagination, hidden-course gate or change to five-card groups and source order.

`stage.mjs` writes complete immutable shard files first, followed by target forms and media mappings, and atomically replaces the index last. Each file is written only if its exact body changed. This is local staging, not publication or release approval. Stage all records intended for the complete imported release index; supplying only a new subset would deliberately replace the catalogue selection.

The measured 15-lesson pilot has 198,373 bytes of full new content versus a 37,415-byte initial index (81.14% reduction). Gzip sizes are 35,441 versus 9,291 bytes. These measurements exclude unchanged legacy data, styles, app code and audio manifests; they are not a measurement of total site transfer or of all future 2110 labels.

Checks include `test-lazy.mjs` for initial payload isolation, stable fifty-number partitions, concurrent cache use, network-failure retry, invalid-shard retry and actual indexed/full historical progress parity. `browser-lazy-qa.mjs` uses synthetic intercepted RPC and checks standard/Advanced initial no-shard loads, all library cards/order, successful load/cache, failed load/retry, new-selection wins, logout, search and browser Back cancellation. Pass a local origin and set `PLAYWRIGHT_MODULE` to an installed Playwright entry point when needed. The final 1893-card library was checked at six widths. The final 130 new lessons received full seven-step checks in Chromium and WebKit; 1753 exact unchanged imported records and the 10 preserved baseline lessons inherit earlier documented coverage with shared-runtime regression. Forty synthetic resilience/accessibility cases and six lazy-loading cases also passed. This is bounded local browser evidence, not a fresh full-step rerun of every lesson, physical-device review or public live verification.

Version the changed browser entrypoints and every nested generated-index/loader/target-map import at publication. Hashed content payloads provide immutable cache identities, while the stable index itself needs an updated import version when its body changes. Keep exact grading keys for earlier published questions and apply compatible backend assessment data before the frontend release.

Release inventory must reconcile source occurrences to expression records, sense/duplicate decisions, completed lessons, six questions each, four clip roles each, held items and exact live asset keys. All counts come from records. The script passing, a successful upload, or a Git push alone never marks the project done.

## Production evidence and partial uploads

`snapshot.mjs ROOT NAME` freezes exact canonical inputs before an audio run. `upload-audio.py --allow-partial` can upload only completed, hash-verified clips while later requests are pending; this explicit flag does not certify a complete course release. `stage.mjs` checks every selected role against its current text/settings and uploaded SHA, independent of unrelated unfinished batches. Public verification checks downloaded bytes, MIME, CORS and Range headers. Signal verification fully decodes MP3s and rejects silent/non-finite output; it does not certify pronunciation, accent or human listening.

For Books 10–16, `build-selected-audio-queue.mjs OUTPUT_DIRECTORY` freezes the exact unpublished selected manifest. `build-combined-audio-queue.mjs OUTPUT_DIRECTORY SELECTED_AUDIO_DIRECTORY [PUBLIC_BASE_REF]` then adds only canonical clip identities changed from the public baseline (default `origin/main`), including canonical edits already committed on the draft branch. Pin and record that base commit before synthesis; comparing only with draft `HEAD` would silently omit unshipped audio from earlier draft commits. `upload-audio-s3.py --queue ... --audio-dir ... --state-dir ... --profile ...` requires a fully verified exact queue and a matching frozen manifest, checkpoints each remote `HeadObject` result, and writes the public manifest only after every required object has upload evidence. Its `--check` mode is read-only. Neither uploader stages nor approves a release.

`source-audit.mjs` reconciles every PDF occurrence through documented aliases and genuine sense splits. `progress.mjs` counts exact current editorial-review hashes and accepts a provenance-only transformation only when unchanged teaching data and the earlier passing hash are proved. `near-duplicates.mjs` screens rare English four-word and Chinese three-character shingles with Sørensen–Dice similarity at0.62, excluding common instructions. Flags request contextual editorial comparison; absence of a flag does not certify originality or semantic diversity.

`browser-course-qa.mjs ORIGIN OUTPUT_DIR` exercises every staged lesson's seven steps in a synthetic account: listening concealment, wrong/correct sounds, four-valid reply reselection and golden marking, bilingual pairing, writing reveal and self-review, optional recording skip, light completion and original Native course isolation. It audits overflow and English/Chinese orphan lines at1280,1024,768,600,390,320px. Use `PLAYWRIGHT_MODULE` for the installed Playwright module; `ADVANCED_NATIVE_QA_BROWSER=webkit` selects WebKit and the default is Chromium. `ADVANCED_NATIVE_QA_IDS` optionally limits a comma-separated immutable-ID regression subset; the report records the actual checked count. Service workers are blocked in these synthetic test contexts so an old cached SDK cannot bypass the intercepted RPC fixture. A resize-triggered header hover is closed using mouse movement and Escape before selecting a step. This is browser-engine automation, never physical-device or human listening evidence.


## Speech-content screening and bounded scale checks

`verify-audio-transcript.py` compares exact-hash MP3 files with their frozen canonical/audio metadata using a locally cached Whisper model. It records normalised word edit distance and missing target tokens. Routine UK/US spelling and explicitly listed compound spelling differences compare alike; homophones, missing tense endings and substantive word changes remain flagged. A second model can examine only flagged identities with `--only-flags-from`. Keep reports tied to the original audio hashes and snapshot. Neither a recogniser agreement nor an empty flag list certifies pronunciation, accent, listening review or a physical-device check. `test-audio-transcript.py` protects that distinction.

Use fresh bounded browser contexts for large catalogue runs. `browser-course-qa.mjs` writes a durable per-lesson checkpoint, exact checked IDs and wrap failures. If a browser renderer crashes, retain the failure and rerun only incomplete IDs in a new context; the combined report must prove a unique complete union and explicitly note the restart. Do not turn an assertion failure into a pass by dropping that lesson.

`browser-partial-groups-qa.mjs` verifies one-to-four-card final groups for both palette parities in Chromium and WebKit at all six widths. Partial groups use the regular responsive grid with the corresponding prefix of the group's colours, no filler lessons and unchanged DOM order. Screenshot inspection remains separate from the automated colour/count/overflow assertions.

The shared database regression checks every current lesson, every accepted reply and completion semantics inside a rolled-back per-lesson savepoint. This prevents the synthetic fixture's complete-history RPC result from growing quadratically; independent cross-run history, ownership, recording and legacy checks still run outside that loop. No real student records are used.

`release-checklist.mjs` generates a55-item requirement/evidence register from the current production state. Partial or automated evidence is labelled as such. It never sets overall release approval and never fills human review fields. Refresh its evidence scopes when final content, media and live publication are actually verified.


## Rebuild from tracked course materials

Run from the repository root; the 87 canonical inputs and their exact byte hashes are listed in `course-materials/advanced-native/release-index.json`. No temporary authoring workspace is needed to recover the source records, aliases or provenance.

```sh
node tools/advanced-native-bulk/build.mjs course-materials/advanced-native/batches/batch-????-????.json --out-dir .advanced-native-build
node tools/advanced-native-bulk/build.mjs course-materials/advanced-native/batches/batch-????-????.json --out-dir .advanced-native-build --check
```

This validates and reproduces derived draft outputs; it does not stage the runtime, publish assets, apply database migrations or grant release approval. The existing first 10 modules remain in their repository runtime source. `course-materials/advanced-native/review-register.json` records exact current independent AI review hashes. The separately hashed `verification.json` summarizes the final 55-check evidence scopes, media, browser inheritance and actual production definition comparison; it supplements the existing release index without changing that index's hash manifest. Human hearing, physical-device review, deployment and owner acceptance are distinct checks.

Keep `course-materials/advanced-native/` as tracked curator input, excluded from public site asset export. Also exclude `.advanced-native-build/`, raw source PDFs, local audio/model files, credentials and reviewer scratch. Public site packaging should select the current generated runtime index, its referenced immutable shards, target map and hosted-media mappings; do not export authoring or audit inputs simply because they are tracked.
