# Rebuilding Edmund Neural audio

The canonical cross-system recipe and release checklist are in
`tools/EDMUND-NEURAL-VOICE-SOP.md`. This file retains flashcard-specific build
details.

The website does not synthesize speech in the browser. Official flashcard fronts
are rendered once with Kokoro-82M, compressed to MP3, and looked up through
`flashcards-audio-manifest.js`.

The generator reads the inline seed in `flashcards.html` plus every maintained
external seed listed in `EXTERNAL_SEED_ASSIGNMENTS`. If another external seed is
introduced, add its filename and assignment marker there before building audio.

## IELTS Reading Passage 1 import

The 157 supplied Passage 1 PDF decks are converted into the generated static
seed `flashcards-ielts-reading-passage-1-data.js`. Deck IDs preserve their source
ordinals (for example, `ielts/reading/passage-1/Practice 44`) so existing student
progress is never renumbered. Display titles are joined by ordinal from
`tools/ielts-reading-passage-titles.json`. The browser loads this large seed only
when a user opens IELTS Reading, so it does not delay the login page or unrelated
flashcard sections.

Regenerate the seed from the repository root with:

```sh
python3 tools/build-ielts-reading-passage1-flashcards.py \
  --source "/path/to/IELTS Reading Passage 1 Cards" \
  --titles tools/ielts-reading-passage-titles.json \
  --output flashcards-ielts-reading-passage-1-data.js
```

Then rebuild Edmund Neural audio normally. The importer validates every PDF
table, bilingual row, title mapping, source page and ordinal before replacing
the generated seed.

## Deployment layout

The live library uses a hybrid layout:

- Existing recordings remain as hash-named MP3s under
  `assets/flashcards/audio/edmund-neural/v1/`.
- The 27,280 Passage 1 recordings are stored in R2 as 256 immutable hash-prefix
  packs. Their public URLs use the release-specific
  `v1-passage1-20260722/` prefix. `workers/edmund-audio/src/flashcard-pack-index.json`
  maps each public MP3 URL to its byte range in a pack.
- `flashcards-audio-manifest.js` maps normalized front text to either a local
  path or an absolute URL on the read-only Edmund Neural audio Worker.

This avoids adding 246.5 MiB to the GitHub Pages deployment while retaining local
URLs for 1,122 existing recordings and browser byte-range playback for the
26,158 new recordings.

## Local setup

```sh
python3 -m venv .venv-tts
.venv-tts/bin/python -m pip install -r tools/requirements-tts.txt
```

Download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the
[`kokoro-onnx` model-files-v1.0 release](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0)
into a local model directory. Model files are build dependencies and must not be
committed to the website.

Reference SHA-256 checksums for this audio build:

- `kokoro-v1.0.onnx`: `7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5`
- `voices-v1.0.bin`: `bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d`

## Generate or resume

From the repository root:

```sh
.venv-tts/bin/python tools/generate-flashcard-audio.py \
  --source-root . \
  --output-root . \
  --model /path/to/kokoro-v1.0.onnx \
  --voices /path/to/voices-v1.0.bin
```

The command is resumable: valid existing MP3 files are skipped. It writes one
file per unique normalized card front and then refreshes the synchronous
manifest. `--manifest-only` rebuilds the manifest without synthesizing missing
audio. Two build processes may use `--shard-count 2` with `--shard-index 0` and
`1`; run the command once without sharding afterwards to create the final full
manifest. Shard manifests are build-only files and must not be deployed.
Use `--prune-orphans` only with a verified full-corpus run to remove audio for
renamed or deleted card fronts.

After completing the Passage 1 recordings, build and validate the R2 packs:

```sh
.venv-tts/bin/python tools/build-flashcard-audio-r2-packs.py
.venv-tts/bin/python tools/upload-flashcard-audio-packs-r2.py \
  --wrangler workers/speaking-system/node_modules/.bin/wrangler \
  --check
```

Upload the validated packs by removing `--check`, then deploy
`workers/edmund-audio/`. Once the generated pack index is present, a full
`--manifest-only` run retains valid local paths and emits release-versioned
Worker URLs for indexed recordings that are not stored locally. The uploader
marks the index release complete only after all 256 packs succeed, so a locally
built but unfinished R2 release cannot enter the production manifest. Pack binaries,
shard manifests, and upload checkpoints live under `.flashcards-audio-build/`
and are never committed. Upload checkpoints are bound to the bucket, pack prefix,
corpus hash, byte total and entry counts so they cannot be reused for another
release accidentally.

The audio build version is part of the directory path. Bump
`AUDIO_BUILD_VERSION` in the generator whenever the voice, model, speed,
language, compression, or pronunciation recipe changes; this prevents browsers
from reusing stale local MP3s. Packed releases must likewise receive new
`PUBLIC_AUDIO_PATH_PREFIX` and `PACK_KEY_PREFIX` values; never replace bytes under
an already published immutable URL.

Whenever card fronts change, rerun the generator and update the appropriate
local or R2 release alongside the refreshed manifest. User-created cards are not
part of the static corpus and intentionally show that no Edmund Neural recording
is available.
