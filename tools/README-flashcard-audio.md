# Rebuilding Edmund Neural audio

The canonical cross-system recipe and release checklist are in
`tools/EDMUND-NEURAL-VOICE-SOP.md`. This file retains flashcard-specific build
details.

The website does not synthesize speech in the browser. Official flashcard fronts
are rendered once with Kokoro-82M, compressed to MP3, and looked up through
`flashcards-audio-manifest.js`.

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

The audio build version is part of the directory path. Bump
`AUDIO_BUILD_VERSION` in the generator whenever the voice, model, speed,
language, compression, or pronunciation recipe changes; this prevents browsers
from reusing stale MP3s.

Whenever card fronts change, rerun the generator and commit the new MP3 files
alongside the updated manifest. User-created cards are not part of the static
corpus and intentionally show that no Edmund Neural recording is available.
