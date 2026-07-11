# Edmund Neural flashcard audio

These MP3 files are generated ahead of time with the Apache-2.0-licensed
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) neural speech model.
The deployed website plays the static files directly and does not send card text
to an external speech service.

- Voice: `af_heart`
- Source sample rate: 24 kHz, mono
- Delivery format: variable-bitrate MP3
- Audio build: `v1`
- Generator: `tools/generate-flashcard-audio.py`

Credits: Kokoro-82M v1.0 / `af_heart` by hexgrad (Apache-2.0), rendered
with `kokoro-onnx` 0.5.0 by thewh1teagle (MIT). The build uses the
[`model-files-v1.0`](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0)
release.

Do not rename individual files manually. Their names are deterministic hashes of
the normalized English card text and are referenced by
`flashcards-audio-manifest.js`.
