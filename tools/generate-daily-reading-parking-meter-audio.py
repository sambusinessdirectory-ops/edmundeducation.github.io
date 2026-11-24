#!/usr/bin/env python3
"""Generate the parking-meter Daily Reading narration with Kokoro."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro


VOICE = "bm_george"
LANGUAGE = "en-gb"
SPEED = 0.98
PARAGRAPH_PAUSE = 0.72
PASSAGE = [
    "The Transport Department said a software update triggered a citywide malfunction of Hong Kong’s parking meter system on Tuesday.",
    "The department said preliminary investigations found that a software update in the morning caused a back-end software fault, which prevented the system from making a normal connection with the parking meters.",
    "It added that about 11,000 parking meters were affected across the city.",
    "The department has instructed the operator to conduct a thorough investigation into the cause of the outage and submit a detailed report.",
    "There is no evidence that the system was attacked at the moment, the department said, adding it has reported the matter to the Digital Policy Office.",
    "The operator will arrange for full refunds for all meter transactions between 8am and 12.15pm to users, and will strive to complete the approval of the refunds within this week, it added.",
    "The Transport Department received a report at around 8.20am from the operator that the parking meter system had malfunctioned, with payment functions suspended or meter displays not operating normally.",
    "The system resumed normal operations at 12.15pm.",
]


def spoken(text: str) -> str:
    text = text.replace("Hong Kong’s", "Hong Kong's")
    text = re.sub(r"\b8am\b", "eight a.m.", text)
    text = re.sub(r"\b8\.20am\b", "eight twenty a.m.", text)
    text = re.sub(r"\b12\.15pm\b", "twelve fifteen p.m.", text)
    text = text.replace("11,000", "eleven thousand")
    return text


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--voices", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    kokoro = Kokoro(str(args.model), str(args.voices))
    chunks: list[np.ndarray] = []
    sample_rate = 0
    for index, paragraph in enumerate(PASSAGE):
        audio, rate = kokoro.create(spoken(paragraph), voice=VOICE, speed=SPEED, lang=LANGUAGE)
        if sample_rate and rate != sample_rate:
            raise RuntimeError("Kokoro changed sample rate")
        sample_rate = rate
        chunks.append(np.asarray(audio, dtype=np.float32))
        if index < len(PASSAGE) - 1:
            chunks.append(np.zeros(round(sample_rate * PARAGRAPH_PAUSE), dtype=np.float32))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    sf.write(args.output, np.concatenate(chunks), sample_rate, format="MP3", subtype="MPEG_LAYER_III", compression_level=0.55, bitrate_mode="VARIABLE")
    print(f"Generated {args.output} with {VOICE}, {sample_rate} Hz")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
