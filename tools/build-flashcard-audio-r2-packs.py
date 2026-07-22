#!/usr/bin/env python3
"""Pack the IELTS Reading Passage 1 flashcard MP3s for Cloudflare R2."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


DATA_ASSIGNMENT = "window.EDMUND_IELTS_READING_PASSAGE_1_SEED = "
SOURCE_AUDIO_PATH_PREFIX = "assets/flashcards/audio/edmund-neural/v1/"
PUBLIC_AUDIO_PATH_PREFIX = "assets/flashcards/audio/edmund-neural/v1-passage1-20260722/"
PACK_KEY_PREFIX = "assets/flashcards/audio/edmund-neural/v1-passage1-20260722/"
CLOUD_BASE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev"


def parse_args() -> argparse.Namespace:
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=repository_root)
    parser.add_argument(
        "--seed",
        type=Path,
        default=repository_root / "flashcards-ielts-reading-passage-1-data.js",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=repository_root / ".flashcards-audio-build/r2-packs",
    )
    parser.add_argument(
        "--index-output",
        type=Path,
        default=repository_root / "workers/edmund-audio/src/flashcard-pack-index.json",
    )
    return parser.parse_args()


def normalize_card_text(value: object) -> str:
    text = str(value or "")
    text = re.sub(r"[\u2018\u2019\u02bc\u02bb\uff07]", "'", text)
    text = re.sub(r"([A-Za-z])\s+'\s*([A-Za-z])", r"\1'\2", text)
    text = re.sub(
        r"([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b",
        r"\1'\2",
        text,
        flags=re.IGNORECASE,
    )
    return text.strip()


def load_fronts(path: Path) -> list[str]:
    source = path.read_text(encoding="utf-8")
    start = source.index(DATA_ASSIGNMENT) + len(DATA_ASSIGNMENT)
    seed, _ = json.JSONDecoder().raw_decode(source[start:])
    fronts = {
        normalize_card_text(card.get("front", card.get("term", "")))
        for deck in seed.values()
        for card in deck
    }
    fronts.discard("")
    return sorted(fronts, key=lambda value: (value.casefold(), value))


def text_digest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:24]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    seed_path = args.seed.resolve()
    output_dir = args.output_dir.resolve()
    index_output = args.index_output.resolve()
    fronts = load_fronts(seed_path)
    if len(fronts) != 27_280:
        raise SystemExit(f"Expected 27,280 unique Passage 1 fronts, found {len(fronts):,}")

    grouped: dict[str, list[tuple[str, Path]]] = {}
    seen_digests: dict[str, str] = {}
    for front in fronts:
        digest = text_digest(front)
        previous = seen_digests.get(digest)
        if previous is not None and previous != front:
            raise SystemExit(f"Truncated SHA-256 collision: {front!r} and {previous!r}")
        seen_digests[digest] = front
        relative = f"{SOURCE_AUDIO_PATH_PREFIX}{digest[:2]}/{digest}.mp3"
        audio_path = source_root / relative
        if not audio_path.is_file() or audio_path.stat().st_size <= 1000:
            raise SystemExit(f"Missing or invalid Passage 1 MP3: {relative}")
        grouped.setdefault(digest[:2], []).append((digest, audio_path))

    output_dir.mkdir(parents=True, exist_ok=True)
    entries: dict[str, dict[str, list[int]]] = {}
    packs: dict[str, dict[str, object]] = {}
    total_bytes = 0
    for prefix in sorted(grouped):
        pack_path = output_dir / f"{prefix}.bin"
        offset = 0
        prefix_entries: dict[str, list[int]] = {}
        with pack_path.open("wb") as output_handle:
            for digest, audio_path in sorted(grouped[prefix]):
                audio = audio_path.read_bytes()
                output_handle.write(audio)
                prefix_entries[digest[2:]] = [offset, len(audio)]
                offset += len(audio)
        pack_key = f"{PACK_KEY_PREFIX}{prefix}.bin"
        entries[prefix] = prefix_entries
        packs[prefix] = {
            "key": pack_key,
            "size": offset,
            "sha256": sha256_file(pack_path),
        }
        total_bytes += offset

    if len(packs) != 256:
        raise SystemExit(f"Expected all 256 hash-prefix packs, found {len(packs)}")
    corpus_sha256 = hashlib.sha256("\n".join(fronts).encode("utf-8")).hexdigest()
    index = {
        "schemaVersion": 1,
        "cloudBaseUrl": CLOUD_BASE_URL,
        "audioPathPrefix": PUBLIC_AUDIO_PATH_PREFIX,
        "packKeyPrefix": PACK_KEY_PREFIX,
        "entries": entries,
        "packs": packs,
        "meta": {
            "entryCount": len(fronts),
            "packCount": len(packs),
            "totalBytes": total_bytes,
            "corpusSha256": corpus_sha256,
            "r2UploadComplete": False,
        },
    }
    index_output.parent.mkdir(parents=True, exist_ok=True)
    temporary = index_output.with_name(f".{index_output.name}.tmp")
    temporary.write_text(
        json.dumps(index, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    temporary.replace(index_output)
    print(
        f"Built {len(packs)} R2 packs for {len(fronts):,} Passage 1 recordings "
        f"({total_bytes / (1024 * 1024):.1f} MiB)."
    )
    print(f"Pack index: {index_output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
