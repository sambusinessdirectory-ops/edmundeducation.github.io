#!/usr/bin/env python3
"""Generate one Kokoro MP3 per unique DSE argument phrase/model/alternative.

Output is kept outside Git and uploaded to R2 only after integrity checks.
The manifest uses voice + exact spoken text as its key so all modules can
reuse a clip without changing their source material.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODEL = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/kokoro-v1.0.onnx")
VOICES = MODEL.with_name("voices-v1.0.bin")
EXPECTED_MODEL = "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5"
EXPECTED_VOICES = "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"
PREFIX = "assets/dse-argument-bank/audio/v1"
BASE = "https://edmund-neural-audio.edmundeducation.workers.dev/"
DEFAULT_OUTPUT_ROOT = ROOT.parent / "dse-speaking-audio-output"
SYNTH = None


def corpus() -> dict[str, str]:
    mapping = {}
    paths = [ROOT / "dse-argument-bank" / name for name in
             ("data.json", "driving-data.json", "self-care-data.json", "mario-data.json", "subtitles-data.json")]
    manifest = json.loads((ROOT / "dse-argument-bank/import-manifest.json").read_text())
    paths += [ROOT / "dse-argument-bank" / row["file"] for row in manifest]
    for path in paths:
        data = json.loads(path.read_text())
        for section in data["groups"] + data["responses"]:
            voice = "af_heart" if section["id"].startswith("A") else "bm_fable"
            for argument in section["arguments"]:
                for term in argument.get("glossary", []):
                    add(mapping, voice, term["english"])
                add(mapping, voice, argument.get("englishDemo", ""))
            for sample in section.get("samples", []):
                add(mapping, voice, sample["text"])
        for row in data["synonyms"]:
            add(mapping, "bf_isabella", row["keyword"])
            for alternative in row["alternatives"]:
                add(mapping, "bf_isabella", alternative)
    return mapping


def add(mapping: dict[str, str], voice: str, text: str) -> None:
    plain = re.sub(r"\*\*", "", str(text or "")).strip()
    if not plain:
        return
    if any(c in plain for c in "<>\x00") or len(plain) > 800:
        raise ValueError(f"Unexpected audio text: {plain[:100]!r}")
    key = f"{voice}\x00{plain}"
    digest = hashlib.sha256(key.encode()).hexdigest()
    mapping[key] = f"{PREFIX}/{digest[:2]}/{digest}.mp3"


def init_worker() -> None:
    global SYNTH
    import onnxruntime as ort
    from kokoro_onnx import Kokoro
    options = ort.SessionOptions()
    options.intra_op_num_threads = 1
    options.inter_op_num_threads = 1
    SYNTH = Kokoro.from_session(
        ort.InferenceSession(str(MODEL), sess_options=options, providers=["CPUExecutionProvider"]), str(VOICES)
    )


def generate(row: tuple[str, str, str]) -> tuple[str, str]:
    import soundfile as sf
    key, path, output_root = row
    voice, text = key.split("\x00", 1)
    dest = Path(output_root) / path
    if dest.is_file() and dest.stat().st_size > 1800:
        return key, "existing"
    dest.parent.mkdir(parents=True, exist_ok=True)
    # Keep the temporary MP3 on the destination filesystem so the final
    # replace is atomic even when the workspace is on an external volume.
    with tempfile.TemporaryDirectory(prefix=".dse-kokoro-", dir=dest.parent) as directory:
        wav = Path(directory) / "speech.wav"
        temp_mp3 = Path(directory) / "speech.mp3"
        language = "en-us" if voice == "af_heart" else "en-gb"
        samples, rate = SYNTH.create(text, voice=voice, speed=0.96, lang=language)
        sf.write(wav, samples, rate)
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(wav),
                        "-codec:a", "libmp3lame", "-b:a", "64k", "-y", str(temp_mp3)], check=True)
        if temp_mp3.stat().st_size < 1800:
            raise ValueError(f"Empty MP3: {key[:100]}")
        os.replace(temp_mp3, dest)
    return key, "generated"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--voice", choices=("af_heart", "bm_fable", "bf_isabella"),
                        help="Generate only one voice while retaining the complete manifest")
    parser.add_argument("--manifest-only", action="store_true")
    args = parser.parse_args()
    for path, expected in ((MODEL, EXPECTED_MODEL), (VOICES, EXPECTED_VOICES)):
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise SystemExit(f"Kokoro model checksum mismatch: {path}")
    mapping = corpus()
    (ROOT / "dse-argument-bank/audio-manifest.json").write_text(
        json.dumps(mapping, ensure_ascii=False, separators=(",", ":")) + "\n"
    )
    print(f"{len(mapping)} unique Kokoro clips in manifest", flush=True)
    if args.manifest_only:
        return
    todo = [(key, path, str(args.output_root)) for key, path in sorted(mapping.items())]
    if args.voice:
        todo = [row for row in todo if row[0].startswith(f"{args.voice}\x00")]
    if args.limit:
        todo = todo[:args.limit]
    done = 0
    errors = []
    with concurrent.futures.ProcessPoolExecutor(max_workers=args.workers, initializer=init_worker) as pool:
        futures = {pool.submit(generate, row): row[0] for row in todo}
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception as error:
                errors.append((futures[future], str(error)))
            done += 1
            if done % 100 == 0 or done == len(todo):
                print(f"Kokoro: {done}/{len(todo)} clips, {len(errors)} errors", flush=True)
    if errors:
        for key, error in errors[:20]:
            print(f"FAILED {key[:120]!r}: {error}", flush=True)
        raise SystemExit(f"{len(errors)} Kokoro clips failed")


if __name__ == "__main__":
    main()
