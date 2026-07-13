#!/usr/bin/env python3
"""Generate the static Edmund Neural flashcard audio library.

The deployed site receives only MP3 files and a synchronous text-to-file manifest.
Kokoro and its model files stay on the build machine.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro


PREVIEW_TEXT = "Welcome to Edmund Education. Let's practise English together."
INLINE_ASSIGNMENT = "window.EDMUND_FLASHCARD_SEED = "
EXTERNAL_SEED_ASSIGNMENTS = (
    (
        "flashcards-dse-writing-2025-data.js",
        'window.EDMUND_FLASHCARD_SEED["dse/writing/part-a/2025"] = ',
        "dse/writing/part-a/2025",
    ),
    (
        "flashcards-dse-listening-data.js",
        "window.EDMUND_DSE_LISTENING_SEED = ",
        None,
    ),
    (
        "flashcards-dse-speaking-2012-data.js",
        "window.EDMUND_DSE_SPEAKING_2012_SEED = ",
        None,
    ),
    (
        "flashcards-dse-speaking-2013-data.js",
        "window.EDMUND_DSE_SPEAKING_2013_SEED = ",
        None,
    ),
    (
        "flashcards-dse-speaking-2014-data.js",
        "window.EDMUND_DSE_SPEAKING_2014_SEED = ",
        None,
    ),
    (
        "flashcards-dse-speaking-2015-data.js",
        "window.EDMUND_DSE_SPEAKING_2015_SEED = ",
        None,
    ),
    (
        "flashcards-dse-speaking-2016-data.js",
        "window.EDMUND_DSE_SPEAKING_2016_SEED = ",
        None,
    ),
    (
        "flashcards-dse-speaking-2017-data.js",
        "window.EDMUND_DSE_SPEAKING_2017_SEED = ",
        None,
    ),
    (
        "flashcards-dse-speaking-2018-data.js",
        "window.EDMUND_DSE_SPEAKING_2018_SEED = ",
        None,
    ),
    (
        "flashcards-dse-speaking-2019-data.js",
        "window.EDMUND_DSE_SPEAKING_2019_SEED = ",
        None,
    ),
)
AUDIO_BUILD_VERSION = "v1"
STATIC_AUDIO_ROOT = f"assets/flashcards/audio/edmund-neural/{AUDIO_BUILD_VERSION}"
SPOKEN_OVERRIDES = {
    "AR": "A R",
    "built-in GPS": "built-in G P S",
    "Getfit 4": "Get Fit four",
    "IT department": "I T department",
    "K-pop dancing": "kay pop dancing",
    "MTR station": "M T R station",
    "N.R.G. 6": "N R G six",
    "NGO": "N G O",
    "o-daiko": "oh dye koh",
    "officers from the AFCD": "officers from the A F C D",
    "QR codes": "Q R codes",
    "start at A5": "start at A five",
    "start on A4": "start on A four",
    "Study at AC": "Study at A C",
    "taiko drumming": "tie koh drumming",
    "taiko festivals": "tie koh festivals",
    "the N.R.G. app": "the N R G app",
    "three-day AR training programme": "three-day A R training programme",
    "TNR": "T N R",
    "World War II": "World War Two",
    "a £50 deposit": "a fifty-pound deposit",
    "pay a £50 deposit": "pay a fifty-pound deposit",
    "extremely high IQs": "extremely high I Q scores",
    "strong IQs": "strong I Q scores",
    "18–26-year-olds": "eighteen to twenty-six year olds",
    "EQ skills": "E Q skills",
    "Emotional Quotient (EQ)": "Emotional Quotient, E Q",
    "Intelligence Quotient (IQ)": "Intelligence Quotient, I Q",
    "a Category III film": "a Category three film",
    "a No. 8 typhoon signal": "a number eight typhoon signal",
    "arrive around 3 a.m.": "arrive around three a.m.",
    "because of low EQ": "because of low E Q",
    "developing younger students' EQ": "developing younger students' E Q",
    "have a high EQ": "have a high E Q",
    "having a high IQ": "having a high I Q",
    "help develop EQ": "help develop E Q",
    "lower than US$50": "lower than fifty U S dollars",
    "monosodium glutamate (MSG)": "monosodium glutamate, M S G",
    "prefer the MTR to the bus": "prefer the M T R to the bus",
    "prefer the bus to the MTR": "prefer the bus to the M T R",
    "come from the 1930s and 40s": "come from the nineteen thirties and forties",
    "during World War II": "during World War Two",
    "people aged 15–18": "people aged fifteen to eighteen",
    "sell 30,000 copies": "sell thirty thousand copies",
    "worth US$5,500": "worth five thousand five hundred U S dollars",
    "1940s outfits": "nineteen forties outfits",
    "a 1940s convention": "a nineteen forties convention",
    "a 1940s time zone": "a nineteen forties time zone",
    "a 1940s-style ceremony": "a nineteen forties style ceremony",
    "the 1940s era": "the nineteen forties era",
    "since the 1950s": "since the nineteen fifties",
    "an 18,000-strong taxi fleet": "an eighteen thousand strong taxi fleet",
    "top 93,728": "top ninety-three thousand seven hundred twenty-eight",
    "people aged 16–24": "people aged sixteen to twenty-four",
    "an original World War II uniform": "an original World War Two uniform",
    "research linking A to B": "research linking eh to bee",
    "such as Uber": "such as Oober",
    "use Uber in Hong Kong": "yooz Oober in Hong Kong",
    "up to 50,000 calories": "up to fifty thousand calories",
    "spend $23,000 a year": "spend twenty-three thousand dollars a year",
    "cost US$5,000": "cost five thousand U S dollars",
    "Chindōgu-worthy": "chin doh goo worthy",
    "adults aged 25–64": "adults aged twenty-five to sixty-four",
    "interview around 1,000 people": "interview around one thousand people",
    "carry over 100,000 titles": "carry over one hundred thousand titles",
    "well into their 30s": "well into their thirties",
    "somewhere between 500 and 1,300": "somewhere between five hundred and one thousand three hundred",
    "in the late 1960s": "in the late nineteen sixties",
    "be reduced from A to B": "be reduced from eh to bee",
    "prefer buying A to reading B": "prefer buying eh to reading bee",
    "the quickest way to get from A to B": "the quickest way to get from ay to bee",
    "in St Louis": "in Saint Louis",
    "avoid Chunyun altogether": "avoid Choon-yoon altogether",
    "OmniSeafood series": "Omni Seafood series",
    "swim 1,500 metres": "swim one thousand five hundred metres",
    "more than 4,000 students": "more than four thousand students",
    "since 1997": "since nineteen ninety-seven",
}


def normalize_card_text(value: object) -> str:
    text = str(value or "")
    text = re.sub(r"[\u2018\u2019\u02bc\u02bb\uff07]", "'", text)
    text = re.sub(r"([A-Za-z])\s+'\s*([A-Za-z])", r"\1'\2", text)
    text = re.sub(r"([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b", r"\1'\2", text, flags=re.IGNORECASE)
    return text.strip()


def extract_static_fronts(source_root: Path) -> list[str]:
    html = (source_root / "flashcards.html").read_text(encoding="utf-8")
    start = html.index(INLINE_ASSIGNMENT) + len(INLINE_ASSIGNMENT)
    end = html.index("</script>", start)
    inline_seed = json.loads(html[start:end].strip().removesuffix(";"))

    # Merge decks exactly as the browser does.  A later external seed replaces a
    # deck with the same ID instead of leaving superseded card fronts in the
    # audio corpus.
    merged_seed = dict(inline_seed)
    for filename, assignment, deck_id in EXTERNAL_SEED_ASSIGNMENTS:
        external_source = (source_root / filename).read_text(encoding="utf-8")
        external_start = external_source.index(assignment) + len(assignment)
        external_seed, _ = json.JSONDecoder().raw_decode(external_source[external_start:])
        if isinstance(external_seed, list):
            if not deck_id:
                raise ValueError(f"Missing deck ID for list seed in {filename}")
            merged_seed[deck_id] = external_seed
        else:
            merged_seed.update(external_seed)
    rows = [card for deck in merged_seed.values() for card in deck]
    texts = {normalize_card_text(card.get("front", card.get("term", ""))) for card in rows}
    texts.discard("")
    texts.add(PREVIEW_TEXT)
    return sorted(texts, key=lambda value: (value.casefold(), value))


def spoken_text(display_text: str) -> str:
    """Apply conservative pronunciation fixes without changing the manifest key."""
    text = SPOKEN_OVERRIDES.get(display_text, display_text)
    text = re.sub(r"(?:\.{3}|…+)", ", ", text)
    text = re.sub(r"\b24/7\b", "twenty-four seven", text)
    text = re.sub(r"\bCOVID-19\b", "COVID nineteen", text, flags=re.IGNORECASE)
    text = re.sub(r"\bIELTS\b", "eye elts", text)
    text = re.sub(r"\bS1\b", "S one", text)
    for initialism in ("DNA", "AQ", "TVB", "TV", "CV", "PE", "QR", "IT", "USA", "DIY", "LED", "DSE", "RAE", "US", "UK", "HK"):
        text = re.sub(rf"\b{initialism}\b", " ".join(initialism), text)
    text = re.sub(r"£\s*([\d,]+)", r"\1 pounds", text)
    text = re.sub(r"\bH K\$\s*([\d,]+)", r"\1 Hong Kong dollars", text)
    text = re.sub(r"\bHK\$\s*([\d,]+)", r"\1 Hong Kong dollars", text)
    text = re.sub(r"\$\s*([\d,]+)", r"\1 dollars", text)
    text = re.sub(r"\b(\d+)\s*km\b", r"\1 kilometres", text, flags=re.IGNORECASE)
    text = re.sub(r"\b(\d+)\s+am\b", r"\1 a.m.", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text).strip(" ,")
    text = re.sub(r"\s+,", ",", text)
    text = re.sub(r",(?:\s*,)+", ",", text)
    return text


def audio_relative_path(text: str) -> str:
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:24]
    return f"{STATIC_AUDIO_ROOT}/{digest[:2]}/{digest}.mp3"


def valid_existing_audio(path: Path) -> bool:
    if not path.exists() or path.stat().st_size <= 1000:
        return False
    try:
        info = sf.info(path)
    except Exception:
        return False
    return (
        info.format == "MP3"
        and info.samplerate == 24000
        and info.channels == 1
        and 0.2 <= info.duration <= 20
    )


def write_manifest(
    path: Path,
    entries: dict[str, str],
    *,
    complete: bool,
    voice: str,
    lang: str,
    speed: float,
) -> None:
    payload = json.dumps(entries, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    corpus_hash = hashlib.sha256("\n".join(sorted(entries)).encode("utf-8")).hexdigest()
    meta = json.dumps(
        {
            "engine": "Kokoro-82M",
            "buildVersion": AUDIO_BUILD_VERSION,
            "name": "Edmund Neural",
            "voice": voice,
            "language": lang,
            "speed": speed,
            "count": len(entries),
            "complete": complete,
            "corpusSha256": corpus_hash,
            "sampleRate": 24000,
            "format": "audio/mpeg",
        },
        separators=(",", ":"),
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    content = (
        "/* Generated by tools/generate-flashcard-audio.py. */\n"
        f"window.EDMUND_FLASHCARD_AUDIO = Object.freeze({payload});\n"
        f"window.EDMUND_FLASHCARD_AUDIO_META = Object.freeze({meta});\n"
    )
    temp_path = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temp_path.write_text(content, encoding="utf-8")
    temp_path.replace(path)


def prune_orphan_audio(output_root: Path, expected_paths: set[str]) -> int:
    audio_root = output_root / STATIC_AUDIO_ROOT
    removed = 0
    for path in audio_root.glob("*/*.mp3"):
        relative_path = path.relative_to(output_root).as_posix()
        if relative_path in expected_paths:
            continue
        path.unlink()
        removed += 1
    return removed


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--voices", type=Path, required=True)
    parser.add_argument("--voice", default="af_heart")
    parser.add_argument("--lang", default="en-us")
    parser.add_argument("--speed", type=float, default=0.96)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--manifest-only", action="store_true")
    parser.add_argument("--allow-incomplete", action="store_true")
    parser.add_argument("--force-regex", default="")
    parser.add_argument("--prune-orphans", action="store_true")
    parser.add_argument("--shard-count", type=int, default=1)
    parser.add_argument("--shard-index", type=int, default=0)
    parser.add_argument("--progress-every", type=int, default=25)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    output_root = args.output_root.resolve()
    if args.shard_count < 1 or not 0 <= args.shard_index < args.shard_count:
        raise ValueError("shard-index must be between 0 and shard-count - 1")
    manifest_name = (
        "flashcards-audio-manifest.js"
        if args.shard_count == 1
        else f".flashcards-audio-build/shard-{args.shard_index}.js"
    )
    manifest_path = output_root / manifest_name
    texts = extract_static_fronts(source_root)
    if args.limit > 0:
        texts = texts[: args.limit]
    if args.shard_count > 1:
        texts = [
            text
            for text in texts
            if int(hashlib.sha256(text.encode("utf-8")).hexdigest(), 16) % args.shard_count == args.shard_index
        ]

    expected = {text: audio_relative_path(text) for text in texts}
    force_pattern = re.compile(args.force_regex) if args.force_regex else None
    complete_entries: dict[str, str] = {}
    pending: list[tuple[str, str, Path]] = []
    for text, relative_path in expected.items():
        output_path = output_root / relative_path
        forced = bool(force_pattern and force_pattern.search(text))
        if not forced and valid_existing_audio(output_path):
            complete_entries[text] = relative_path
        else:
            pending.append((text, relative_path, output_path))

    print(
        f"Corpus: {len(texts)} utterances; existing: {len(complete_entries)}; pending: {len(pending)}",
        flush=True,
    )
    full_corpus_run = args.limit <= 0 and args.shard_count == 1
    initial_complete = full_corpus_run and not pending and len(complete_entries) == len(texts)
    write_manifest(
        manifest_path,
        complete_entries,
        complete=initial_complete,
        voice=args.voice,
        lang=args.lang,
        speed=args.speed,
    )
    if args.manifest_only:
        if not initial_complete and not args.allow_incomplete:
            print("Manifest is incomplete; generate missing audio before deployment.", file=sys.stderr)
            return 2
        if initial_complete and args.prune_orphans:
            removed = prune_orphan_audio(output_root, set(expected.values()))
            print(f"Pruned {removed} orphan audio files.", flush=True)
        return 0
    if not pending:
        if initial_complete and args.prune_orphans:
            removed = prune_orphan_audio(output_root, set(expected.values()))
            print(f"Pruned {removed} orphan audio files.", flush=True)
        return 0

    model_started = time.perf_counter()
    kokoro = Kokoro(str(args.model.resolve()), str(args.voices.resolve()))
    print(f"Model loaded in {time.perf_counter() - model_started:.1f}s", flush=True)

    started = time.perf_counter()
    failures: list[dict[str, str]] = []
    for index, (text, relative_path, output_path) in enumerate(pending, start=1):
        try:
            audio, sample_rate = kokoro.create(
                spoken_text(text),
                voice=args.voice,
                speed=args.speed,
                lang=args.lang,
            )
            output_path.parent.mkdir(parents=True, exist_ok=True)
            temp_path = output_path.with_name(f".{output_path.stem}.{os.getpid()}.tmp")
            sf.write(
                temp_path,
                audio,
                sample_rate,
                format="MP3",
                subtype="MPEG_LAYER_III",
                compression_level=0.55,
                bitrate_mode="VARIABLE",
            )
            temp_path.replace(output_path)
            complete_entries[text] = relative_path
        except Exception as error:  # Keep the long batch resumable.
            failures.append({"text": text, "error": repr(error)})
            print(f"ERROR {text!r}: {error!r}", file=sys.stderr, flush=True)

        if index % max(1, args.progress_every) == 0 or index == len(pending):
            elapsed = time.perf_counter() - started
            per_item = elapsed / index
            remaining = per_item * (len(pending) - index)
            print(
                f"Generated {index}/{len(pending)} "
                f"({len(complete_entries)}/{len(texts)} total); ETA {remaining / 60:.1f} min",
                flush=True,
            )
            write_manifest(
                manifest_path,
                complete_entries,
                complete=False,
                voice=args.voice,
                lang=args.lang,
                speed=args.speed,
            )

    complete = full_corpus_run and not failures and len(complete_entries) == len(texts)
    write_manifest(
        manifest_path,
        complete_entries,
        complete=complete,
        voice=args.voice,
        lang=args.lang,
        speed=args.speed,
    )
    if complete and args.prune_orphans:
        removed = prune_orphan_audio(output_root, set(expected.values()))
        print(f"Pruned {removed} orphan audio files.", flush=True)
    if failures:
        failure_name = (
            "flashcards-audio-failures.json"
            if args.shard_count == 1
            else f".flashcards-audio-build/failures-{args.shard_index}.json"
        )
        failure_path = output_root / failure_name
        failure_path.parent.mkdir(parents=True, exist_ok=True)
        failure_path.write_text(json.dumps(failures, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Finished with {len(failures)} failures: {failure_path}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
