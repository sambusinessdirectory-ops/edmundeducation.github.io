#!/usr/bin/env python3
"""Generate the complete Kokoro British-male audio set for Liaison."""

import hashlib
import json
import re
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro


ROOT = Path(__file__).resolve().parents[1]
MODEL_ROOT = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models")
AUDIO_DIR = ROOT / "liaison/audio/kokoro-british-male"
MANIFEST = ROOT / "liaison/liaison-audio-manifest.js"
PUBLIC_PREFIX = "/liaison/audio/kokoro-british-male/"
VOICE = "bm_george"
LANGUAGE = "en-gb"
SPEED = 0.96


def valid_audio(path: Path) -> bool:
    if not path.exists() or path.stat().st_size < 1_000:
        return False
    try:
        info = sf.info(path)
        return info.frames > 2_000 and info.channels == 1 and info.samplerate == 24_000
    except RuntimeError:
        return False


def corpus() -> list[str]:
    bank = (ROOT / "liaison/liaison.mjs").read_text(encoding="utf-8")
    loop = (ROOT / "liaison/lesson-loop.mjs").read_text(encoding="utf-8")
    question_source = bank.split("const questions = [", 1)[1].split("\n];", 1)[0]
    phrases = re.findall(r'phrase:\s*"([^"]+)"', question_source)
    focuses = re.findall(r'focus:\s*"([^"]+)"', question_source)

    detail_source = bank.split("const lessonDetails = ", 1)[1].split(".map(", 1)[0]
    details = json.loads(detail_source)
    transfers = [row[2] for row in details]

    paragraph_source = loop.split("const paragraphs = [", 1)[1].split("\n];", 1)[0]
    paragraphs = re.findall(r'text:\s*"([^"]+)"', paragraph_source)
    chunks = [" ".join(part.strip() for part in focus.split("+") if part.strip()) for focus in focuses]
    values = phrases + transfers + paragraphs + chunks
    return sorted(dict.fromkeys(values), key=str.casefold)


def main() -> None:
    texts = corpus()
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    kokoro = Kokoro(str(MODEL_ROOT / "kokoro-v1.0.onnx"), str(MODEL_ROOT / "voices-v1.0.bin"))
    entries = {}
    for number, text in enumerate(texts, 1):
        digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:24]
        output = AUDIO_DIR / f"{digest}.mp3"
        if not valid_audio(output):
            samples, rate = kokoro.create(text, voice=VOICE, lang=LANGUAGE, speed=SPEED)
            sf.write(output, samples, rate, format="MP3", subtype="MPEG_LAYER_III",
                     compression_level=0.55, bitrate_mode="VARIABLE")
        if not valid_audio(output):
            raise RuntimeError(f"Invalid Kokoro audio: {text}")
        entries[text] = PUBLIC_PREFIX + output.name
        print(f"{number}/{len(texts)} {text}", flush=True)

    payload = json.dumps(entries, ensure_ascii=False, indent=2)
    metadata = json.dumps({"voice": VOICE, "language": LANGUAGE, "speed": SPEED, "count": len(entries)}, ensure_ascii=False)
    MANIFEST.write_text(
        f"window.EDMUND_LIAISON_AUDIO = Object.freeze({payload});\n"
        f"window.EDMUND_LIAISON_AUDIO_META = Object.freeze({metadata});\n",
        encoding="utf-8",
    )
    print(f"Liaison audio ready: {len(entries)} Kokoro {VOICE} clips", flush=True)


if __name__ == "__main__":
    main()
