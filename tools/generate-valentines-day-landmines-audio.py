#!/usr/bin/env python3
"""Generate Jayden's Valentine's Day dictation with approved Kokoro bf_isabella."""
from hashlib import sha256
from pathlib import Path
import json
import re
import subprocess
import tempfile

import numpy as np
import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
MODEL = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/kokoro-v1.0.onnx")
VOICES = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/voices-v1.0.bin")
EXPECTED = (
    "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5",
    "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
)
DATA = ROOT / "junior-quiz-review" / "valentines-day-landmines.json"
OUT = ROOT / "junior-quiz-review" / "audio" / "valentines-day-landmines"
MANIFEST = ROOT / "junior-quiz-review" / "valentines-day-landmines-audio-manifest.json"


def spoken(text: str) -> str:
    """Remove print-only note marks and make the currency amount unambiguous to TTS."""
    text = re.sub(r"[¹²³]", "", text)
    return text.replace("US$23.9 billion", "23.9 billion US dollars")


for file, digest in zip((MODEL, VOICES), EXPECTED):
    if sha256(file.read_bytes()).hexdigest() != digest:
        raise SystemExit(f"Unapproved Kokoro model or voice file: {file}")

data = json.loads(DATA.read_text())
sections = [*data["paragraphs"], *data.get("footnotes", [])]
sentences = [sentence for section in sections for sentence in section["sentences"]]
if len(sentences) != 31:
    raise SystemExit(f"Expected 31 dictation sentences, found {len(sentences)}")

OUT.mkdir(parents=True, exist_ok=True)
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
synth = Kokoro.from_session(
    ort.InferenceSession(str(MODEL), sess_options=options, providers=["CPUExecutionProvider"]),
    str(VOICES),
)
manifest = {
    "engine": "kokoro-onnx",
    "engineVersion": "0.5.0",
    "voice": "bf_isabella",
    "locale": "en-gb",
    "modelSha256": EXPECTED[0],
    "voicesSha256": EXPECTED[1],
    "sentences": [],
}
full = []
rate = None
for number, sentence in enumerate(sentences, 1):
    target = OUT / f"s{number:02d}.mp3"
    wav_cache = OUT / f"s{number:02d}.wav"
    samples, sample_rate = synth.create(spoken(sentence), voice="bf_isabella", lang="en-gb", speed=1.0)
    sf.write(wav_cache, samples, sample_rate)
    samples, sample_rate = sf.read(wav_cache, dtype="float32")
    if rate is not None and sample_rate != rate:
        raise ValueError("Unexpected Kokoro sample-rate change")
    rate = sample_rate
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(wav_cache), "-codec:a", "libmp3lame", "-b:a", "80k", "-y", str(target)],
        check=True,
    )
    if target.stat().st_size < 1500:
        raise ValueError(f"Empty sentence clip {number}")
    manifest["sentences"].append(f"junior-quiz-review/audio/valentines-day-landmines/{target.name}")
    full.append(samples)
    full.append(np.zeros(int(sample_rate * (0.65 if sentence.endswith((".", "?", "!", "’")) else 0.34)), dtype=np.float32))
    print(f"{number}/{len(sentences)}", flush=True)

with tempfile.TemporaryDirectory(prefix="valentines-day-landmines-") as temporary:
    wav = Path(temporary) / "full.wav"
    sf.write(wav, np.concatenate(full), rate)
    full_target = OUT / "valentines-day-landmines-full.mp3"
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "96k", "-y", str(full_target)],
        check=True,
    )
manifest["full"] = "junior-quiz-review/audio/valentines-day-landmines/valentines-day-landmines-full.mp3"
MANIFEST.write_text(json.dumps(manifest, separators=(",", ":")) + "\n")
for cached in OUT.glob("s*.wav"):
    cached.unlink()
print("Full narration and 31 Kokoro bf_isabella dictation clips ready", flush=True)
