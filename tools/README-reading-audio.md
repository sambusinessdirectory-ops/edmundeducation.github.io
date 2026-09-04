# Reading Passage Narration

The catalogue uses the original Albert Einstein recording as its voice reference:
Kokoro `bf_isabella`, `en-gb`, speed `1.05`, sentence pause `0.65s`, paragraph
pause `0.76s`. Do not regenerate or replace that recording.

## Generate

Use a Python environment containing `kokoro_onnx`, `onnxruntime`, `numpy`,
`soundfile`, and `faster_whisper`. The approved Kokoro model/voices checksums are
enforced. Download `base.en` for Whisper before starting; generation is offline.

```sh
python tools/generate-reading-catalogue-audio.py \
  --source-root /path/to/website \
  --output-root /path/outside/website/reading-audio-build \
  --model /path/to/kokoro-v1.0.onnx \
  --voices /path/to/voices-v1.0.bin \
  --workers 2 --threads 4 --background
```

`generation.log`, `build-progress.json`, and `active/` show progress. The same
command resumes completed articles and sentence checkpoints. A process lock
prevents two producers sharing the same output directory. Keep the computer
awake and connected to power for the long batch. Generation does not require
the browser to stay open.

The original Einstein reference recording remains unchanged. A recipe release
rebuilds every other catalogue article so the new pause duration is present in
the MP3 itself; already-published generated recordings are not reused.

Only published catalogue articles are included. Held articles remain blocked.
Narration includes the English passage paragraphs, not questions or translations.
Every recording is checked for the source hash, complete word labels, paragraph
boundaries, ordered timings, duration, and a non-silent decodable waveform.

## Verify And Publish

Authenticate the existing Wrangler CLI normally; do not put credentials in the
repository. New MP3s go to the `edmund-assets` R2 bucket under hash-named reading
paths, not GitHub Pages. Existing R2 objects must match before they can be reused.

```sh
python tools/publish-reading-catalogue-audio.py \
  --source-root /path/to/website \
  --output-root /path/outside/website/reading-audio-build --publish
node tools/test-reading-comprehension-audio.mjs --require-complete
node tools/test-reading-comprehension-catalogue.mjs
```

Without `--publish`, the uploader only verifies/uploads completed recordings.
`--check` validates locally without networking. `--publish` refuses incomplete
coverage or unverified objects, preserves existing narration, and generates a
small public manifest plus per-article word-timing JSON. Publish those files and
the catalogue with the normal website workflow after the tests pass. Bump the
manifest script's cache version in `reading-comprehension.html` for the release.

The audio worker must allow the reading prefix, and the reading page's media
security policy must allow that worker's hostname. Verify full playback,
paragraph playback, seeking, and lazy word highlighting before release.

## DSE Reading

Pass `--system dse` to both the generator and publisher, with a separate build
directory. This selects the 42 available A/B1/B2 sections from 2012-2023 and
2025-2026; 2024 is excluded. It never replaces the IELTS manifest or recordings.
The voice, timing and immutable audio storage rules are unchanged.

The DSE source includes English passage paragraphs and native passage-table
captions/cells in reading order, not questions, translations or exam directions.
The table projection in Python must match `readingNarrationParagraphText` in
`reading-comprehension-features.mjs`; the English source files remain unchanged.
Publication writes `dse-reading-audio-manifest.js` and `dse-reading-audio-data/`.

```sh
python tools/publish-reading-catalogue-audio.py --system dse \
  --source-root /path/to/website --output-root /path/to/dse-build --publish
node tools/test-dse-reading-audio.mjs --require-complete
python tools/test-dse-reading-audio-waveforms.py \
  --output-root /path/to/dse-build --require-complete
node tools/test-dse-reading-translations.mjs --complete
node tools/test-reading-comprehension-audio.mjs --require-complete
```

Do not deploy an empty or partial DSE audio manifest. After publication, bump
the reading page and DSE audio script cache versions and test full/paragraph
playback, seeking, speed, highlighting without automatic scrolling, and the
translation toggles on desktop and mobile.
