"""Generate IELTS preview question narration with the site's three Kokoro voices."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "ielts-writing-preview"
VOICES = ("british-male", "british-female", "american-female")


def digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def quiz_prompt(text: str) -> str:
    text = re.sub(r"\b(?:bar|pie|line|table)\s+(?:chart|charts|graph|graphs)\b", lambda m: "visuals" if m.group().endswith("s") else "visual", text, flags=re.I)
    text = re.sub(r"\b(?:charts|graphs|tables|maps|plans|diagrams)\b", "visuals", text, flags=re.I)
    return re.sub(r"\b(?:chart|graph|table|map|plan|diagram)\b", "visual", text, flags=re.I)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--voices", type=Path, required=True)
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--end", type=int, default=302)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    recipes = json.loads((ROOT / "professional-english/dialogues.json").read_text())["voiceRecipes"]
    questions = [
        ("task1", item["id"], item.get("quizPrompt") or quiz_prompt(item["prompt"]))
        for item in json.loads((DATA / "task1-diagrams.json").read_text())
    ] + [
        ("task2", item["id"], item["en"])
        for item in json.loads((DATA / "task2-questions.json").read_text())
    ]
    target = args.output or DATA / "question-audio.json"
    manifest = json.loads(target.read_text()) if target.exists() else {}
    audio_dir = DATA / "audio"
    audio_dir.mkdir(exist_ok=True)
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    speaker = Kokoro.from_session(ort.InferenceSession(
        str(args.model), sess_options=options, providers=["CPUExecutionProvider"]
    ), str(args.voices))
    for index in range(args.start, min(args.end, len(questions))):
        section, question_id, text = questions[index]
        voice = VOICES[index % len(VOICES)]
        recipe = recipes[voice]
        fingerprint = digest(json.dumps({"text": text, "voice": voice, "recipe": recipe}, sort_keys=True))
        filename = f"{question_id.lower()}-{fingerprint[:14]}.mp3"
        path = audio_dir / filename
        if not path.exists():
            samples, rate = speaker.create(text, voice=recipe["voice"], lang=recipe["lang"], speed=recipe["speed"])
            with tempfile.TemporaryDirectory(prefix="ielts-preview-audio-") as folder:
                wav = Path(folder) / "clip.wav"
                sf.write(wav, samples, rate)
                subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav),
                                "-codec:a", "libmp3lame", "-b:a", "96k", str(path)], check=True)
        manifest[f"{section}:{question_id}"] = {
            "path": f"ielts-writing-preview/audio/{filename}",
            "voice": voice,
            "sourceSha256": digest(text),
        }
        if (index + 1) % 10 == 0 or index + 1 == min(args.end, len(questions)):
            target.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
            print(f"Question audio {index + 1}/{len(questions)}", flush=True)


if __name__ == "__main__":
    main()
