#!/usr/bin/env python3
"""Verify DSE checkpoints and the actual encoded sentence/paragraph silences."""
import argparse
import importlib.util
import json
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("reading_audio_batch", ROOT / "tools/generate-reading-catalogue-audio.py")
batch = importlib.util.module_from_spec(spec)
spec.loader.exec_module(batch)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--require-complete", action="store_true")
    args = parser.parse_args()
    batch.configure_system("dse")
    output = args.output_root.resolve()
    recipe = json.loads((output / "recipe.json").read_text())
    for key, value in {"voice": "bf_isabella", "language": "en-gb", "speed": 1.05,
                       "sentencePause": 0.65, "paragraphPause": 0.76, "sampleRate": 24000}.items():
        assert recipe[key] == value, (key, recipe[key])
    generator = batch.load_generator(ROOT)
    count, sentence_pauses, paragraph_pauses = 0, 0, 0
    for article in batch.load_catalogue(ROOT):
        record = batch.checkpoint(article, output, recipe["recipeSha256"])
        if not record:
            assert not args.require_complete, f"Missing {article['id']}"
            continue
        samples, rate = sf.read(output / record["entry"]["path"], dtype="float32")
        paragraphs, digest = batch.sentence_plan(article, generator, recipe["recipeSha256"])
        cache = output / "sentence-cache" / article["id"] / digest[:24]
        offset = 0
        for pi, sentences in enumerate(paragraphs):
            for si, _ in enumerate(sentences):
                offset += sf.info(cache / f"{pi:03}-{si:03}.wav").frames
                pause = 0.65 if si < len(sentences) - 1 else 0.76 if pi < len(paragraphs) - 1 else 0
                if not pause:
                    continue
                # Exclude MP3 filter ringing at either edge of the silence.
                middle = samples[offset + round(rate * 0.1):offset + round(rate * (pause - 0.1))]
                assert len(middle) > rate * 0.4, (article["id"], pi, si, "truncated pause")
                assert float(np.sqrt(np.mean(middle ** 2))) < 0.0001, (article["id"], pi, si, "non-silent pause")
                offset += round(rate * pause)
                sentence_pauses += pause == 0.65
                paragraph_pauses += pause == 0.76
        assert abs(offset / rate - record["entry"]["duration"]) < 0.002, article["id"]
        count += 1
    print(json.dumps({"recordings": count, "sentencePausesVerified": sentence_pauses,
                      "paragraphPausesVerified": paragraph_pauses, "complete": count == 42}))


if __name__ == "__main__":
    main()
