#!/usr/bin/env python3
"""Pack new IELTS Reading Passage 2 flashcard MP3s for an immutable R2 release."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


DATA_ASSIGNMENT = "window.EDMUND_IELTS_READING_PASSAGE_2_SEED = "
META_ASSIGNMENT = "window.EDMUND_IELTS_READING_PASSAGE_2_META = "
SOURCE_AUDIO_PATH_PREFIX = "assets/flashcards/audio/edmund-neural/v1/"
RELEASE = "v1-passage2-20260730-1"
PUBLIC_AUDIO_PATH_PREFIX = f"assets/flashcards/audio/edmund-neural/{RELEASE}/"
PACK_KEY_PREFIX = PUBLIC_AUDIO_PATH_PREFIX
PASSAGE_1_PUBLIC_AUDIO_PATH_PREFIX = (
    "assets/flashcards/audio/edmund-neural/v1-passage1-20260722/"
)
CLOUD_BASE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev"


def parse_args() -> argparse.Namespace:
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=repository_root)
    parser.add_argument(
        "--seed",
        type=Path,
        default=repository_root / "flashcards-ielts-reading-passage-2-data.js",
    )
    parser.add_argument(
        "--existing-index",
        type=Path,
        default=repository_root / "workers/edmund-audio/src/flashcard-pack-index.json",
        help="Uploaded Passage 1 index whose recordings must not be duplicated.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=repository_root / f".flashcards-audio-build/r2-packs-{RELEASE}",
    )
    parser.add_argument(
        "--index-output",
        type=Path,
        default=repository_root
        / "workers/edmund-audio/src/flashcard-pack-index-passage2.json",
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


def assigned_json(source: str, assignment: str) -> object:
    try:
        start = source.index(assignment) + len(assignment)
    except ValueError as error:
        raise SystemExit(f"Missing JavaScript assignment: {assignment.strip()}") from error
    value, _ = json.JSONDecoder().raw_decode(source[start:])
    return value


def load_fronts(path: Path) -> tuple[list[str], dict[str, object]]:
    source = path.read_text(encoding="utf-8")
    seed = assigned_json(source, DATA_ASSIGNMENT)
    meta = assigned_json(source, META_ASSIGNMENT)
    if not isinstance(seed, dict) or not isinstance(meta, dict):
        raise SystemExit("Passage 2 seed or metadata has an invalid shape")
    if any(not isinstance(deck, list) for deck in seed.values()):
        raise SystemExit("Passage 2 seed contains an invalid deck")
    cards = [card for deck in seed.values() for card in deck]
    if any(not isinstance(card, dict) for card in cards):
        raise SystemExit("Passage 2 seed contains an invalid card")
    declared_fronts = {
        str(card.get("front", card.get("term", ""))).strip() for card in cards
    }
    declared_fronts.discard("")
    fronts = {
        normalize_card_text(card.get("front", card.get("term", "")))
        for card in cards
    }
    fronts.discard("")
    if (
        meta.get("passage") != 2
        or meta.get("deckCount") != len(seed)
        or meta.get("cardCount") != len(cards)
        or meta.get("uniqueFrontCount") != len(declared_fronts)
    ):
        raise SystemExit(
            "Passage 2 seed disagrees with its generated deck/card/front metadata"
        )
    return sorted(fronts, key=lambda value: (value.casefold(), value)), meta


def text_digest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:24]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def uploaded_index_digests(path: Path) -> tuple[set[str], dict[str, object]]:
    value = json.loads(path.read_text(encoding="utf-8"))
    meta = value.get("meta", {}) if isinstance(value, dict) else {}
    entries = value.get("entries", {}) if isinstance(value, dict) else {}
    if (
        not isinstance(value, dict)
        or value.get("schemaVersion") != 1
        or value.get("audioPathPrefix") != PASSAGE_1_PUBLIC_AUDIO_PATH_PREFIX
        or not isinstance(meta, dict)
        or meta.get("r2UploadComplete") is not True
        or not isinstance(meta.get("corpusSha256"), str)
        or not re.fullmatch(r"[0-9a-f]{64}", meta["corpusSha256"])
        or not isinstance(entries, dict)
    ):
        raise SystemExit(f"Existing cloud pack index is not complete: {path}")

    digests: set[str] = set()
    for prefix, prefix_entries in entries.items():
        if not re.fullmatch(r"[0-9a-f]{2}", prefix) or not isinstance(
            prefix_entries, dict
        ):
            raise SystemExit(f"Existing cloud pack index has invalid prefix {prefix!r}")
        for suffix, audio_range in prefix_entries.items():
            if (
                not re.fullmatch(r"[0-9a-f]{22}", suffix)
                or not isinstance(audio_range, list)
                or len(audio_range) != 2
                or any(not isinstance(item, int) for item in audio_range)
                or audio_range[0] < 0
                or audio_range[1] <= 1000
            ):
                raise SystemExit(
                    f"Existing cloud pack index has an invalid entry in prefix {prefix}"
                )
            digests.add(f"{prefix}{suffix}")
    if meta.get("entryCount") != len(digests):
        raise SystemExit("Existing cloud pack index entry count is inconsistent")
    return digests, value


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    seed_path = args.seed.resolve()
    existing_index_path = args.existing_index.resolve()
    output_dir = args.output_dir.resolve()
    index_output = args.index_output.resolve()

    if index_output.is_file():
        previous = json.loads(index_output.read_text(encoding="utf-8"))
        if (
            isinstance(previous, dict)
            and isinstance(previous.get("meta"), dict)
            and previous["meta"].get("r2UploadComplete") is True
        ):
            raise SystemExit(
                f"{RELEASE} is already marked as uploaded; create a new release "
                "instead of mutating this immutable one"
            )

    all_fronts, source_meta = load_fronts(seed_path)
    existing_digests, existing_index = uploaded_index_digests(existing_index_path)
    seen_digests: dict[str, str] = {}
    packed_fronts: list[str] = []
    for front in all_fronts:
        digest = text_digest(front)
        previous = seen_digests.get(digest)
        if previous is not None and previous != front:
            raise SystemExit(f"Truncated SHA-256 collision: {front!r} and {previous!r}")
        seen_digests[digest] = front
        if digest not in existing_digests:
            packed_fronts.append(front)
    if not packed_fronts:
        raise SystemExit("Passage 2 has no recordings outside the Passage 1 cloud release")

    grouped: dict[str, list[tuple[str, Path]]] = {}
    for front in packed_fronts:
        digest = text_digest(front)
        relative = f"{SOURCE_AUDIO_PATH_PREFIX}{digest[:2]}/{digest}.mp3"
        audio_path = source_root / relative
        if not audio_path.is_file() or audio_path.stat().st_size <= 1000:
            raise SystemExit(f"Missing or invalid Passage 2 MP3: {relative}")
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

    source_corpus_sha256 = hashlib.sha256(
        "\n".join(all_fronts).encode("utf-8")
    ).hexdigest()
    corpus_sha256 = hashlib.sha256(
        "\n".join(packed_fronts).encode("utf-8")
    ).hexdigest()
    index = {
        "schemaVersion": 1,
        "cloudBaseUrl": CLOUD_BASE_URL,
        "audioPathPrefix": PUBLIC_AUDIO_PATH_PREFIX,
        "packKeyPrefix": PACK_KEY_PREFIX,
        "entries": entries,
        "packs": packs,
        "meta": {
            "release": RELEASE,
            "entryCount": len(packed_fronts),
            "packCount": len(packs),
            "totalBytes": total_bytes,
            "corpusSha256": corpus_sha256,
            "sourceEntryCount": len(all_fronts),
            "sourceDeclaredUniqueFrontCount": source_meta["uniqueFrontCount"],
            "sourceDeckCount": source_meta["deckCount"],
            "sourceCardCount": source_meta["cardCount"],
            "sourceCorpusSha256": source_corpus_sha256,
            "excludedExistingEntryCount": len(all_fronts) - len(packed_fronts),
            "existingIndexAudioPathPrefix": existing_index["audioPathPrefix"],
            "existingIndexCorpusSha256": existing_index["meta"]["corpusSha256"],
            "r2UploadComplete": False,
        },
    }
    index_output.parent.mkdir(parents=True, exist_ok=True)
    temporary = index_output.with_name(f".{index_output.name}.tmp")
    temporary.write_text(
        json.dumps(index, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        + "\n",
        encoding="utf-8",
    )
    temporary.replace(index_output)
    print(
        f"Built {len(packs)} R2 packs for {len(packed_fronts):,} new Passage 2 "
        f"recordings ({total_bytes / (1024 * 1024):.1f} MiB)."
    )
    print(
        f"Reused {len(all_fronts) - len(packed_fronts):,} recording(s) from the "
        "existing Passage 1 cloud release."
    )
    print(f"Pack index: {index_output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
