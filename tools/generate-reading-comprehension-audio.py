#!/usr/bin/env python3
"""Generate the static Kokoro narration and word timings for reading practice."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel
from kokoro_onnx import Kokoro


ARTICLE_ID = "p1-069-albert-einstein"
BUILD_VERSION = "v1"
VOICE = "bf_isabella"
LANGUAGE = "en-gb"
SPEED = 1.05
SENTENCE_PAUSE = 0.65
PARAGRAPH_PAUSE = 0.76


def load_writing_audio_helpers(source_root: Path):
    path = source_root / "tools" / "generate-writing-audio.py"
    spec = importlib.util.spec_from_file_location("edmund_writing_audio_helpers", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sentences(text: str) -> list[str]:
    return [item.strip() for item in re.split(r"(?<=[.!?])\s+", text.replace("\n", " ")) if item.strip()]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--voices", type=Path, required=True)
    parser.add_argument("--alignment-cache", type=Path)
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    helpers = load_writing_audio_helpers(source_root)
    payload = json.loads((source_root / "reading-comprehension-data" / f"{ARTICLE_ID}.json").read_text(encoding="utf-8"))
    paragraphs = [str(item["text"]) for item in payload["paragraphs"]]
    full_text = "\n\n".join(paragraphs)
    digest = hashlib.sha256(full_text.encode("utf-8")).hexdigest()
    asset_digest = hashlib.sha256(f"{VOICE}\0{LANGUAGE}\0{SPEED}\0{full_text}".encode("utf-8")).hexdigest()
    relative_path = f"assets/reading-comprehension/audio/edmund-neural/{BUILD_VERSION}/{asset_digest[:2]}/{ARTICLE_ID}-{asset_digest[:24]}.mp3"
    output_path = source_root / relative_path
    manifest_path = source_root / "reading-comprehension-audio-manifest.js"

    if output_path.exists() and output_path.stat().st_size > 1000 and not args.force:
        raise SystemExit("Audio already exists; pass --force to regenerate it.")

    kokoro = Kokoro(str(args.model.resolve()), str(args.voices.resolve()))
    aligner = WhisperModel(
        "base.en", device="cpu", compute_type="int8",
        download_root=str(args.alignment_cache.resolve()) if args.alignment_cache else None,
    )
    chunks: list[np.ndarray] = []
    timings: list[list[object]] = []
    elapsed_samples = 0
    sample_rate = 0
    paragraph_ranges: list[dict[str, object]] = []
    for paragraph_index, paragraph in enumerate(paragraphs):
        paragraph_start = elapsed_samples / sample_rate if sample_rate else 0.0
        paragraph_sentences = sentences(paragraph)
        for sentence_index, sentence in enumerate(paragraph_sentences):
            audio, chunk_rate = kokoro.create(helpers.spoken_text(sentence), voice=VOICE, speed=SPEED, lang=LANGUAGE)
            if sample_rate and sample_rate != chunk_rate:
                raise RuntimeError("Kokoro changed sample rate during generation")
            sample_rate = chunk_rate
            chunk = np.asarray(audio, dtype=np.float32)
            timings.extend(helpers.align_sentence_words(sentence, chunk, sample_rate, elapsed_samples / sample_rate, aligner))
            chunks.append(chunk)
            elapsed_samples += len(chunk)
            if sentence_index < len(paragraph_sentences) - 1:
                pause = np.zeros(round(sample_rate * SENTENCE_PAUSE), dtype=np.float32)
                chunks.append(pause)
                elapsed_samples += len(pause)
        paragraph_ranges.append({
            "number": paragraph_index + 1,
            "start": round(paragraph_start, 3),
            "end": round(elapsed_samples / sample_rate, 3),
        })
        if paragraph_index < len(paragraphs) - 1:
            pause = np.zeros(round(sample_rate * PARAGRAPH_PAUSE), dtype=np.float32)
            chunks.append(pause)
            elapsed_samples += len(pause)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = output_path.with_name(f".{output_path.stem}.{os.getpid()}.tmp")
    sf.write(temp_path, np.concatenate(chunks), sample_rate, format="MP3", subtype="MPEG_LAYER_III", compression_level=0.55, bitrate_mode="VARIABLE")
    temp_path.replace(output_path)
    words = [{"label": row[0], "start": row[1], "end": row[2]} for row in timings]
    entry = {
        ARTICLE_ID: {
            "src": f"/{relative_path}", "path": relative_path, "sourceSha256": digest,
            "duration": round(elapsed_samples / sample_rate, 3), "wordCount": len(words),
            "paragraphs": paragraph_ranges, "words": words,
        }
    }
    meta = {
        "buildVersion": BUILD_VERSION, "language": LANGUAGE, "speed": SPEED,
        "sampleRate": sample_rate, "format": "audio/mpeg", "wordTiming": "faster-whisper-base.en-audio-v1",
    }
    content = "/* Generated by tools/generate-reading-comprehension-audio.py. */\n"
    content += f"window.EDMUND_READING_AUDIO = Object.freeze({json.dumps(entry, separators=(',', ':'))});\n"
    content += f"window.EDMUND_READING_AUDIO_META = Object.freeze({json.dumps(meta, separators=(',', ':'))});\n"
    manifest_path.write_text(content, encoding="utf-8")
    print(f"Generated {relative_path} ({len(words)} words, {meta['sampleRate']} Hz)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
