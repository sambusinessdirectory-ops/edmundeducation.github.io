"""Render every situation-card turn with the site's established local voices."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro


ROOT = Path(__file__).resolve().parents[1] / "professional-english"
CHECKSUMS = {
    "model": "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5",
    "voices": "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
}


def sha(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def voice_for(role: str) -> str:
    return "british-male" if role in {"Security Officer", "Security / CS"} else "american-female"


def spoken_text(text: str) -> str:
    return text.replace("G/F", "ground floor").replace("CS counter", "Customer Services Counter").replace("QR", "Q R")


def duration(path: Path) -> float:
    return round(float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(path),
    ], text=True)), 3)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--voices", type=Path, required=True)
    args = parser.parse_args()
    for name, path in (("model", args.model), ("voices", args.voices)):
        if hashlib.sha256(path.read_bytes()).hexdigest() != CHECKSUMS[name]:
            raise ValueError(f"Unexpected {name} file")

    source = json.loads((ROOT / "content/situation-cards.json").read_text())
    recipes = json.loads((ROOT / "dialogues.json").read_text())["voiceRecipes"]
    existing = json.loads((ROOT / "dialogue-audio.json").read_text())
    reusable = {(row["sourceSha256"], row["voice"]): row["path"] for row in existing.values()}
    output = ROOT / "content/situation-card-audio.json"
    manifest = json.loads(output.read_text()) if output.exists() else {}
    audio_dir = ROOT / "audio/situations-v1"
    audio_dir.mkdir(parents=True, exist_ok=True)
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    speaker = Kokoro.from_session(ort.InferenceSession(
        str(args.model), sess_options=options, providers=["CPUExecutionProvider"]
    ), str(args.voices))

    total = sum(len(card["turns"]) for lesson in source["lessons"] for card in lesson["cards"])
    count = 0
    for lesson in source["lessons"]:
        for card in lesson["cards"]:
            for index, turn in enumerate(card["turns"]):
                key = f'l{lesson["lesson"]}c{card["number"]}:{index}'
                text = turn["en"]
                voice = voice_for(turn["role"])
                recipe = recipes[voice]
                digest = sha(json.dumps({"recipe": recipe, "text": spoken_text(text)}, sort_keys=True))
                same = reusable.get((sha(text), voice))
                path = ROOT / same if same and (ROOT / same).exists() else audio_dir / f"{digest[:24]}.mp3"
                if not path.exists():
                    samples, rate = speaker.create(spoken_text(text), voice=recipe["voice"], lang=recipe["lang"], speed=recipe["speed"])
                    with tempfile.TemporaryDirectory(prefix="situation-voice-") as folder:
                        wav = Path(folder) / "clip.wav"
                        sf.write(wav, samples, rate)
                        subprocess.run([
                            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav),
                            "-codec:a", "libmp3lame", "-b:a", "128k", str(path),
                        ], check=True)
                manifest[key] = {
                    "path": str(path.relative_to(ROOT)),
                    "voice": voice,
                    "sourceSha256": sha(text),
                    "recipeSha256": digest,
                    "duration": duration(path),
                }
                count += 1
                if count % 10 == 0 or count == total:
                    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
                    print(f"situation audio {count}/{total}", flush=True)


if __name__ == "__main__":
    main()
