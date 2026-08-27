#!/usr/bin/env python3
"""Cache real recording word timestamps for deterministic transcript alignment."""
import argparse
import concurrent.futures
import hashlib
import json
import time
import subprocess
from pathlib import Path

from faster_whisper import WhisperModel

CATALOG = "https://edmund-neural-audio.edmundeducation.workers.dev/v1/listening/catalog"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", type=Path, required=True)
    parser.add_argument("--model", required=True)
    parser.add_argument("--workers", type=int, default=2)
    parser.add_argument("--practice", type=int)
    parser.add_argument("--part", type=int)
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    catalog_file = args.cache / "audio-catalog.json"
    if not catalog_file.exists():
        subprocess.run(["curl", "-fsSL", "--retry", "3", "--max-time", "120", CATALOG, "-o", str(catalog_file)], check=True)
    catalog = json.loads(catalog_file.read_text())
    model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=4,
                         num_workers=args.workers, local_files_only=True)

    def process(track):
        practice, part = track["practice"], track["part"]
        stem = f"practice-{practice}-part-{part}"
        target, audio = args.cache / f"{stem}.json", args.cache / f"{stem}.mp3"
        if target.exists():
            return f"{stem}: cached"
        if not audio.exists():
            subprocess.run(["curl", "-fsSL", "--retry", "3", "--max-time", "180", track["url"], "-o", str(audio)], check=True)
        start = time.monotonic()
        segments, info = model.transcribe(str(audio), language="en", beam_size=5,
            word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
        words, utterances = [], []
        for segment in segments:
            utterances.append({"start": segment.start, "end": segment.end, "text": segment.text})
            words.extend({"text": word.word, "start": word.start, "end": word.end,
                          "probability": round(word.probability, 4)} for word in segment.words or [])
        result = {"practice": practice, "part": part, "url": track["url"],
                  "audioSha256": hashlib.sha256(audio.read_bytes()).hexdigest(),
                  "duration": info.duration, "model": "faster-whisper-base.en-1.2.1",
                  "words": words, "segments": utterances}
        target.write_text(json.dumps(result, ensure_ascii=False, indent=2))
        return f"{stem}: {len(words)} words, {info.duration:.1f}s audio in {time.monotonic()-start:.1f}s"

    tracks = [track for track in catalog["tracks"] if (track["practice"] == args.practice if args.practice else 2 <= track["practice"] <= 20)
              and (not args.part or track["part"] == args.part)]
    with concurrent.futures.ThreadPoolExecutor(args.workers) as pool:
        futures = [pool.submit(process, track) for track in tracks]
        for future in concurrent.futures.as_completed(futures):
            print(future.result(), flush=True)


if __name__ == "__main__":
    main()
