#!/usr/bin/env python3
"""Generate every country, Hong Kong district and MTR name with Kokoro bf_isabella."""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import os
import subprocess
import tempfile
from pathlib import Path

MODEL_SHA256 = "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5"
VOICES_SHA256 = "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"
VOICE = "bf_isabella"
LANGUAGE = "en-gb"
SPEED = 1.05
RELEASE = "country-spelling-bf-isabella-v1"
ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/kokoro-v1.0.onnx")
DEFAULT_VOICES = DEFAULT_MODEL.with_name("voices-v1.0.bin")
SYNTH = None
MODEL_PATH = None
VOICES_PATH = None


def digest(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def corpus() -> list[dict]:
    source = """
      import { WORLD_COUNTRIES, HK_DISTRICTS, MTR_STATIONS } from './country-name-spelling-data.mjs';
      const rows = [
        ...WORLD_COUNTRIES.map(item => ({...item, category:'world', src:`country-name-spelling-audio/world/${item.id}.mp3`})),
        ...HK_DISTRICTS.map(item => ({...item, category:'district', src:`country-name-spelling-audio/hong-kong/districts/${item.id}.mp3`})),
        ...MTR_STATIONS.map(item => ({...item, category:'mtr', src:`country-name-spelling-audio/hong-kong/mtr/${item.id}.mp3`})),
      ];
      process.stdout.write(JSON.stringify(rows));
    """
    result = subprocess.run(
        ["node", "--input-type=module", "--eval", source],
        cwd=ROOT, check=True, capture_output=True, text=True,
    )
    rows = json.loads(result.stdout)
    if len(rows) != 138:
        raise ValueError(f"Expected 138 pronunciation targets, found {len(rows)}")
    return rows


def init_worker(model: str, voices: str) -> None:
    global SYNTH, MODEL_PATH, VOICES_PATH
    import onnxruntime as ort
    from kokoro_onnx import Kokoro
    MODEL_PATH = model
    VOICES_PATH = voices
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    SYNTH = Kokoro.from_session(
        ort.InferenceSession(model, sess_options=options, providers=["CPUExecutionProvider"]), voices
    )


def generate(row: dict) -> dict:
    import numpy as np
    import soundfile as sf

    destination = ROOT / row["src"]
    if destination.is_file() and destination.stat().st_size > 1800:
        return {**row, "bytes": destination.stat().st_size, "sha256": digest(destination), "status": "existing"}
    destination.parent.mkdir(parents=True, exist_ok=True)
    spoken = row["name"]
    samples, rate = SYNTH.create(spoken, voice=VOICE, speed=SPEED, lang=LANGUAGE)
    samples = np.concatenate((
        np.zeros(round(rate * .08), dtype=np.float32),
        np.asarray(samples, dtype=np.float32),
        np.zeros(round(rate * .18), dtype=np.float32),
    ))
    with tempfile.TemporaryDirectory(prefix=".country-kokoro-", dir=destination.parent) as directory:
        wav = Path(directory) / "speech.wav"
        encoded = Path(directory) / "speech.mp3"
        sf.write(wav, samples, rate)
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(wav),
            "-codec:a", "libmp3lame", "-b:a", "80k", "-y", str(encoded),
        ], check=True)
        if encoded.stat().st_size < 1800:
            raise ValueError(f"Generated audio is empty: {row['name']}")
        os.replace(encoded, destination)
    return {**row, "bytes": destination.stat().st_size, "sha256": digest(destination), "status": "generated"}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL)
    parser.add_argument("--voices", type=Path, default=DEFAULT_VOICES)
    parser.add_argument("--workers", type=int, default=2)
    args = parser.parse_args()
    for path, expected in ((args.model, MODEL_SHA256), (args.voices, VOICES_SHA256)):
        if not path.is_file() or digest(path) != expected:
            raise SystemExit(f"Unapproved Kokoro asset: {path}")
    rows = corpus()
    completed = []
    with concurrent.futures.ProcessPoolExecutor(
        max_workers=max(1, args.workers),
        initializer=init_worker,
        initargs=(str(args.model), str(args.voices)),
    ) as pool:
        futures = {pool.submit(generate, row): row for row in rows}
        for number, future in enumerate(concurrent.futures.as_completed(futures), 1):
            completed.append(future.result())
            if number % 10 == 0 or number == len(rows):
                print(f"Kokoro British female: {number}/{len(rows)} clips", flush=True)
    completed.sort(key=lambda row: (row["category"], row["id"]))
    manifest = {
        "release": RELEASE,
        "engine": "Kokoro-82M",
        "voice": VOICE,
        "language": LANGUAGE,
        "speed": SPEED,
        "modelSha256": MODEL_SHA256,
        "voicesSha256": VOICES_SHA256,
        "count": len(completed),
        "complete": True,
        "items": [{key: row[key] for key in ("id", "category", "name", "src", "bytes", "sha256")} for row in completed],
    }
    target = ROOT / "country-name-spelling-audio" / "manifest.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Wrote {target.relative_to(ROOT)} with {len(completed)} verified clips", flush=True)


if __name__ == "__main__":
    main()
