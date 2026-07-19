# Edmund Speaking Neural Voice — permanent SOP

This is the canonical recipe for the pre-generated sample answers in the
Edmund Speaking System. It is a **separate audio product** from flashcards and
writing practice. Do not change `tools/EDMUND-NEURAL-VOICE-SOP.md`, the writing
generator, or the flashcard generator when maintaining speaking audio.

The browser never synthesizes a sample answer. It only plays versioned MP3
files and reads their measured word timings from
`speaking-audio-manifest.js`, so iPhone, Android, and desktop users hear the
same performance.

## The recipe — do not change silently

| Setting | Permanent speaking value |
| --- | --- |
| Model | Kokoro-82M v1.0 (`kokoro-v1.0.onnx`) |
| Voice | `bm_fable` |
| Vocal direction | Standard British male; youthful, bright, energetic, attractive, and confident |
| Language | `en-gb` |
| Speed | `0.98` |
| Output | Mono MP3, 24 kHz, variable bitrate |
| MP3 compression level | `0.55` |
| Sentence pause | `0.45` seconds |
| Section pause | `0.72` seconds between each of the four answer sections |
| Audio unit | One continuous MP3 per exercise |
| Word timing | Faster Whisper `base.en`, measured per rendered sentence (`faster-whisper-base.en-audio-v1`) |
| Audio build version | Speaking `v1` |
| Static path | `assets/speaking-system/audio/edmund-neural/v1/` |
| Generator runtime | `kokoro-onnx==0.5.0`, `numpy==2.5.1`, `soundfile==0.14.0`, `faster-whisper==1.2.1` |

Reference model checksums:

- `kokoro-v1.0.onnx`: `7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5`
- `voices-v1.0.bin`: `bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d`

`tools/generate-speaking-audio.py` verifies both checksums before synthesis.
The model, voices bundle, and Faster Whisper cache are local build
dependencies. Never commit them to the website repository.

## First-time setup

Use the repository's existing TTS environment and requirements:

```sh
python3 -m venv .venv-tts
.venv-tts/bin/python -m pip install -r tools/requirements-tts.txt
```

Place `kokoro-v1.0.onnx` and `voices-v1.0.bin` outside the repository. The
generator will reject a file whose checksum does not match the permanent
recipe. Faster Whisper may download `base.en` on its first real audio build;
pass `--alignment-cache` to keep that cache outside the repository.

## Source data and browser data

For the initial release, the English audio source is exactly the four
`english_text` values for each exercise in:

`tools/book1-ielts-speaking-part2-structured.json`

Do not maintain a second transcript for audio. Rebuild the browser data after
any approved source correction:

```sh
python3 tools/build-speaking-system-data.py
python3 tools/build-speaking-system-data.py --check
```

The builder writes `speaking-system-data.js` and exposes
`window.EDMUND_SPEAKING_DATA`. It validates all of the following before it
writes:

- 10 exercises;
- four response sections per exercise (40 total);
- stable exercise order and section order;
- 3,854 English words under the source import's ASCII-English acceptance
  counter; and
- four cue hints per exercise.

The timing tokenizer is Unicode-aware, so a visible word such as `café` still
receives its own highlight timestamp even though the source acceptance counter
above deliberately follows the import's ASCII-English rule.

## Preparing the site before synthesis

Source validation does not import Kokoro, NumPy, SoundFile, or Faster Whisper:

```sh
python3 tools/generate-speaking-audio.py \
  --source-root . \
  --output-root . \
  --validate-source
```

Before the first audio build, create an explicit incomplete manifest so the
page can load safely without pretending audio exists:

```sh
python3 tools/generate-speaking-audio.py \
  --source-root . \
  --output-root . \
  --write-placeholder
```

The placeholder exposes empty `window.EDMUND_SPEAKING_AUDIO` data and
`window.EDMUND_SPEAKING_AUDIO_META.complete === false`. Do not use `--force`
with this command after real entries exist.

## Building all speaking audio

From the repository root:

```sh
.venv-tts/bin/python tools/generate-speaking-audio.py \
  --source-root . \
  --output-root . \
  --model /path/to/kokoro-v1.0.onnx \
  --voices /path/to/voices-v1.0.bin \
  --alignment-cache /path/outside/repository/faster-whisper-cache \
  --prune-orphans
```

For each of the 10 exercises, the generator:

1. reads the four exact English section texts;
2. renders each sentence with `bm_fable`, `en-gb`, at speed `0.98`;
3. measures that sentence's words from its generated waveform with Faster
   Whisper `base.en`;
4. inserts 0.45 seconds between sentences and 0.72 seconds between sections;
5. joins the result into one mono 24 kHz VBR MP3; and
6. writes immutable, content-hashed paths and word timings to
   `speaking-audio-manifest.js`.

The final manifest exposes:

- `window.EDMUND_SPEAKING_AUDIO`, keyed by the same stable exercise ids used in
  `speaking-system-data.js`; and
- `window.EDMUND_SPEAKING_AUDIO_META`, including the recipe, corpus hash,
  item counts, and `complete: true`;
- `window.EDMUND_SPEAKING_AUDIO_RECIPE_SHA256`, which fingerprints every
  synthesis, encoding, pause, pronunciation, and alignment setting; and
- `window.EDMUND_SPEAKING_AUDIO_SHA256`, which pins each exercise id to the
  exact MP3 bytes that were validated.

Valid existing MP3s are reused. Normally, editing one exercise regenerates only
that exercise's content-hashed MP3 and refreshes the manifest. During a build,
the generator atomically checkpoints every completed exercise with
`complete: false`; after an interruption, the next run reuses each validated
checkpoint instead of rendering it again.

If the persisted recipe fingerprint differs from the generator, the build stops
and requires a new audio build version. `--force` never bypasses this guard.

## Validation without synthesis

After a complete build, validate every expected file and manifest entry:

```sh
.venv-tts/bin/python tools/generate-speaking-audio.py \
  --source-root . \
  --output-root . \
  --manifest-only
```

This must report 10 ready exercises. It checks the MP3 format, mono channel,
24 kHz sample rate, decoded duration, MP3 byte hash, recipe fingerprint,
content-hashed path, source hash, exact displayed-word sequence, section word
ranges, finite non-overlapping timing rows, duration bounds, item counts, and
the complete manifest serialization.

`--manifest-only` is strictly read-only: it does not rewrite the manifest,
prune files, or synthesize audio. It cannot be combined with `--force`,
`--prune-orphans`, or `--write-placeholder`.

## Pronunciation corrections

Displayed English must never be changed merely to guide pronunciation. Add a
minimal pronunciation-only rule to `spoken_text()` in
`tools/generate-speaking-audio.py`, then listen to every exercise affected by
that rule.

An exception added before an exercise's first publication may remain in `v1`.
Changing the pronunciation of already-published audio requires a new speaking
audio build version; do not overwrite an immutable published MP3.

## Listening and release checklist

Before publishing:

1. Listen to all 10 newly generated exercises from beginning to end.
2. Confirm the voice is male, standard British, youthful, bright, energetic,
   and confident without sounding rushed or artificial.
3. Check names, initials, contractions, quoted speech, and pronunciation-
   sensitive words.
4. Confirm the four sections are in source order, with natural sentence pauses
   and the longer section pause.
5. Confirm `window.EDMUND_SPEAKING_AUDIO_META.complete` is `true`, `count` and
   `expectedCount` are both 10, and the word-timing version is
   `faster-whisper-base.en-audio-v1`.
6. Test the sound button, Space-bar pause/resume, all supported playback rates,
   highlight ON/OFF, word-click seeking, and green synchronized highlighting
   on desktop and a narrow mobile viewport.
7. Confirm navigation, logout, and backgrounding stop active audio.
8. Run the data `--check` command and the audio `--manifest-only` command.
9. Run `git diff --check` and inspect `git status --short`.
10. Do not commit `.venv-tts`, ONNX/BIN models, Whisper caches, temporary
    files, failure logs, or Python cache directories.

## Changing the speaking voice recipe

Do not overwrite published `v1` audio after changing the model, voice,
language, speed, compression, pauses, alignment method, or pronunciation.
Instead:

1. bump `AUDIO_BUILD_VERSION` in `tools/generate-speaking-audio.py`;
2. update `audioBuildVersion` in `tools/build-speaking-system-data.py`;
3. update this SOP and the speaking page's cache tag;
4. generate and test the complete new version; and
5. keep the old version until deployment is verified, then remove it in a
   separate deliberate cleanup.

This prevents browsers and CDNs from mixing versions and keeps speaking audio
independent of the flashcard and writing audio builds.
