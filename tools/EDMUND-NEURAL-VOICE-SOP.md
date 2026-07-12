# Edmund Neural Voice — permanent SOP

This is the canonical recipe for every pre-generated voice file used by Edmund
Education. The browser never synthesizes speech. It only plays versioned MP3
files, so iPhone, Android and desktop users hear the same voice.

## The recipe — do not change silently

| Setting | Permanent value |
| --- | --- |
| Model | Kokoro-82M v1.0 (`kokoro-v1.0.onnx`) |
| Voice | `af_heart` |
| Language | `en-us` |
| Speed | `0.96` |
| Output | Mono MP3, 24 kHz, variable bitrate |
| MP3 compression level | `0.55` |
| Writing sentence pause | `0.45` seconds |
| Writing paragraph pause | `0.72` seconds |
| Word timing | Sentence-boundary weighted alignment (`sentence-weighted-v1`) |
| Audio build version | Flashcards `v1`; writing essays `v4` |
| Generator runtime | `kokoro-onnx==0.5.0`, `numpy==2.5.1`, `soundfile==0.14.0` |

Reference model checksums:

- `kokoro-v1.0.onnx`: `7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5`
- `voices-v1.0.bin`: `bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d`

The model and voice files are local build dependencies. Never commit them to
the website repository.

## First-time setup

From the repository root:

```sh
python3 -m venv .venv-tts
.venv-tts/bin/python -m pip install -r tools/requirements-tts.txt
```

Download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the
[`kokoro-onnx` model-files-v1.0 release](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0)
to a directory outside the repository. Verify them before use:

```sh
shasum -a 256 /path/to/kokoro-v1.0.onnx
shasum -a 256 /path/to/voices-v1.0.bin
```

## SOP A — importing or editing flashcards

Yes: every new **unique English card front** needs a generated MP3. Two cards
with the identical normalized front share one file. Meanings, translations and
examples do not need separate audio because the sound button reads the front.

1. Import or edit the cards in their normal source file.
2. Check the English fronts for spelling and pronunciation-sensitive items.
3. Add only necessary exceptions to `SPOKEN_OVERRIDES` in
   `tools/generate-flashcard-audio.py`. The displayed card text must not be
   changed merely to guide pronunciation. An exact override for a brand-new,
   never-published front may be added before that front's first release without
   changing the audio build version. If a staged file for that front was
   already rendered, force-regenerate that exact front before publishing.
4. Generate or resume the audio build:

```sh
.venv-tts/bin/python tools/generate-flashcard-audio.py \
  --source-root . \
  --output-root . \
  --model /path/to/kokoro-v1.0.onnx \
  --voices /path/to/voices-v1.0.bin
```

5. Validate the complete library without synthesizing anything:

```sh
.venv-tts/bin/python tools/generate-flashcard-audio.py \
  --source-root . \
  --output-root . \
  --model /path/to/kokoro-v1.0.onnx \
  --voices /path/to/voices-v1.0.bin \
  --manifest-only
```

The generator skips valid existing MP3s. Normally it creates sound only for new
or renamed fronts and refreshes `flashcards-audio-manifest.js`. User-created
cards made inside a student's browser are not in the repository corpus and
therefore cannot receive static audio until they are imported into the source.

## SOP B — adding or editing writing-practice essays

The writing generator reads the English `paragraphs` directly from
`writing-practice.html`; do not maintain a second transcript.

1. Add or edit the essay in `writing-practice.html`.
2. Run:

```sh
.venv-tts/bin/python tools/generate-writing-audio.py \
  --source-root . \
  --output-root . \
  --model /path/to/kokoro-v1.0.onnx \
  --voices /path/to/voices-v1.0.bin \
  --prune-orphans
```

3. Validate without regenerating:

```sh
.venv-tts/bin/python tools/generate-writing-audio.py \
  --source-root . \
  --output-root . \
  --model /path/to/kokoro-v1.0.onnx \
  --voices /path/to/voices-v1.0.bin \
  --manifest-only
```

Each essay receives one continuous MP3. Sentences are synthesized separately,
joined with fixed sentence and paragraph pauses, and recorded in the manifest
with word-level timing data. The writing page uses these timings for its green
follow-along highlight. Playback speed choices (`0.25X`, `0.5X`, `0.75X`, `1X`,
`1.25X`, and `1.5X`) are browser playback rates, so they do not require six
different MP3 files and do not alter the voice recipe. The highlight starts
enabled but can be turned off beside the rate selector. Every timed essay word
is also a seek target: clicking a word starts or moves playback to that word.
On pointer devices, the rate and highlight controls open as a hover/focus
popover beneath the sound button and do not reserve page height. While audio is
active, the Space bar pauses or resumes playback unless the user is typing or
has focused another interactive control.

## Listening and release checklist

Before committing:

1. Listen to every newly generated essay and a targeted sample of new cards.
2. Check names, abbreviations, currency, numbers and unusual punctuation.
3. Confirm each manifest reports `complete: true` and the expected item count.
4. Test the sound button, hover/focus popover, Space-bar pause/resume, all six
   playback rates, the highlight ON/OFF control, word-click seeking and green
   word highlighting on a narrow mobile viewport and desktop.
5. Confirm writing manifests report `faster-whisper-base.en-audio-v1` word
   timing. These timestamps are measured from each generated sentence, so the
   0.45-second sentence gaps are included without cumulative highlight drift.
6. Confirm navigation, logout and backgrounding stop active audio.
7. Run `git diff --check` and inspect `git status --short`.
8. Do not commit `.venv-tts`, ONNX/BIN models, shard manifests, failure logs,
   temporary files or Python cache directories.

When asking Codex to import cards, use: **“Import these cards and rebuild Edmund
Neural audio according to `tools/EDMUND-NEURAL-VOICE-SOP.md`.”** This explicitly
includes sound generation and validation in the task.

## Changing the voice recipe

Do not overwrite published `v1` audio after changing the model, voice, language,
speed, compression, pauses, or the pronunciation of an already-published
front. Instead:

1. Bump `AUDIO_BUILD_VERSION` in the affected generator. Flashcard and writing
   audio may use different version numbers.
2. Update the cache tags in `flashcards.html` and `writing-practice.html`.
3. Generate the complete new version and test it.
4. Keep the old version until the deployment is verified; remove it later in a
   separate cleanup.

This prevents browsers and CDNs from mixing old and new recordings.

## Future Cloudflare R2 storage

Moving audio to R2 is feasible and does not require changing the UI or
manifests. The site currently serves local repository paths because
`window.EDMUND_AUDIO_BASE_URL` is blank in `edmund-audio-config.js`.

When a move is needed:

1. Upload the `assets/flashcards/audio/` and
   `assets/writing-practice/audio/` directory trees to matching R2 object keys.
2. Connect a production custom domain such as `audio.edmundeducation.com` to
   the bucket. Do not rely on the rate-limited `r2.dev` development URL for the
   live study system.
3. Serve MP3s as `audio/mpeg` with a long immutable cache policy because every
   changed recording receives a versioned/hash-based path.
4. Set `window.EDMUND_AUDIO_BASE_URL` in `edmund-audio-config.js` to the custom
   domain root, with no trailing slash.
5. Test representative card and essay audio, including iPhone Safari, before
   deleting local copies from the repository.

The first migration uploads the complete directory trees once. After that,
normal deck imports are incremental: upload only the newly generated hash-named
MP3 objects and deploy the updated website manifest. Do not delete and re-upload
unchanged objects. When a front is removed, its old object may remain harmlessly
until a deliberate cleanup.

Do not use SoundCloud as the object store for this system. SoundCloud manages
uploads as tracks, transcodes them for streaming, and exposes track/API stream
URLs rather than stable object keys. The flashcard site instead needs thousands
of directly addressable, immutable MP3 objects. Use R2 or another S3-compatible
object store.

Cloudflare's current R2 Standard free tier includes 10 GB-month storage, one
million Class A operations and ten million Class B operations per month, with
free direct egress. Confirm the current limits before migrating:

- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/r2/buckets/public-buckets/
- https://developers.cloudflare.com/cache/interaction-cloudflare-products/r2/

The flashcard corpus after the 2025 DSE Listening import is about 97 MB of
referenced MP3s (a little over four hours of speech), so storage capacity is not
a near-term concern. Object-read counts, caching and production-domain setup
are more important than raw storage size.
