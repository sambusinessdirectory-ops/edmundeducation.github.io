#!/usr/bin/env python3
"""Pack the 142-deck flashcard expansion into a new immutable R2 release."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import soundfile as sf


SEED_SPECS = (
    (
        "flashcards-ielts-listening-practices-2-20-data.js",
        "window.EDMUND_IELTS_LISTENING_PRACTICES_2_20_SEED = ",
        "ielts-listening-practices-2-20",
        76,
        9_460,
        8_798,
    ),
    (
        "flashcards-dse-reading-2012-2025-data.js",
        "window.EDMUND_DSE_READING_2012_2025_SEED = ",
        "dse-reading-2012-2025",
        42,
        7_475,
        7_278,
    ),
    (
        "flashcards-dse-practical-writing-data.js",
        "window.EDMUND_DSE_PRACTICAL_WRITING_SEED = ",
        "dse-practical-writing",
        12,
        630,
        579,
    ),
    (
        "flashcards-dse-paper3-b2-2012-2023-data.js",
        "window.EDMUND_DSE_PAPER3_B2_2012_2023_SEED = ",
        "dse-paper3-b2-data-files-2012-2023",
        12,
        2_941,
        2_804,
    ),
)
EXPECTED_TOTAL_DECK_COUNT = 142
EXPECTED_TOTAL_CARD_COUNT = 20_506
EXPECTED_SOURCE_ENTRY_COUNT = 18_943
EXPECTED_NEW_ENTRY_COUNT = 16_083
EXPECTED_EXCLUDED_EXISTING_ENTRY_COUNT = 2_860
EXPECTED_SOURCE_CORPUS_SHA256 = (
    "ace3c896b6bc4dfb6cc2e649b0da95432d10825527d66924a8184c22c7c53b2f"
)
EXPECTED_NEW_CORPUS_SHA256 = (
    "22913b458da32795beeccc8e420effd48d2afbc31dd4e5ee07748cf1598c7878"
)
SOURCE_AUDIO_PATH_PREFIX = "assets/flashcards/audio/edmund-neural/v1/"
RELEASE = "v1-flashcard-expansion-20260801-1"
PUBLIC_AUDIO_PATH_PREFIX = f"assets/flashcards/audio/edmund-neural/{RELEASE}/"
PACK_KEY_PREFIX = PUBLIC_AUDIO_PATH_PREFIX
CLOUD_BASE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev"
EXPECTED_BASELINE_ENTRY_COUNT = 118_304
EXPECTED_BASELINE_MANIFEST_SHA256 = (
    "9525ffdb8b600d50cc70ab26627fdc6959070df5dbc7bcfad852897bf3ffc1bb"
)
EXPECTED_BASELINE_MAPPING_SHA256 = (
    "59751d5405a4117a32057740f6202671118426db6ba26ce8ba5f80a5e4235eb8"
)
EXPECTED_BASELINE_CORPUS_SHA256 = (
    "eb1376e535c27570be8fb3ed385646f2ac3d4d0cf1ffc52e2b4f1ce4ec50f73f"
)
EXPECTED_EXISTING_INDEXES = (
    (
        "flashcard-pack-index.json",
        "assets/flashcards/audio/edmund-neural/v1-passage1-20260722/",
        27_280,
        "8ac885a1efe29a2518b4b34cabc719f3689fc64a225182aff6abf99ef72d9c5a",
    ),
    (
        "flashcard-pack-index-passage2.json",
        "assets/flashcards/audio/edmund-neural/v1-passage2-20260730-1/",
        25_031,
        "cff1fc038202ea3e3b5307f775e28328b700d26dc70cee378622838a4981cee1",
    ),
    (
        "flashcard-pack-index-reading-expansion.json",
        "assets/flashcards/audio/edmund-neural/v1-reading-expansion-20260731-1/",
        26_966,
        "9e4cf6b7d9f243f975b4fc27ac0714afe172bd7187a0babf0a08affa1c54e433",
    ),
)
BASELINE_AUDIO_ASSIGNMENT = "window.EDMUND_FLASHCARD_AUDIO = Object.freeze("
BASELINE_META_ASSIGNMENT = "window.EDMUND_FLASHCARD_AUDIO_META = Object.freeze("


def parse_args() -> argparse.Namespace:
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=repository_root)
    parser.add_argument(
        "--baseline-manifest",
        type=Path,
        default=repository_root / ".flashcards-audio-build/baseline-manifest-20260801.js",
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
        / "workers/edmund-audio/src/flashcard-pack-index-flashcard-expansion.json",
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


def text_digest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:24]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_source_fronts(
    source_root: Path,
) -> tuple[list[str], list[dict[str, object]]]:
    all_fronts: set[str] = set()
    all_deck_ids: set[str] = set()
    sections: list[dict[str, object]] = []
    for (
        filename,
        assignment,
        section_id,
        expected_decks,
        expected_cards,
        expected_unique_fronts,
    ) in SEED_SPECS:
        path = source_root / filename
        if not path.is_file():
            raise SystemExit(
                f"Required 142-deck source bundle is not ready: {path}. "
                "Finish the card import before building audio packs."
            )
        seed = assigned_json(path.read_text(encoding="utf-8"), assignment)
        if not isinstance(seed, dict) or len(seed) != expected_decks:
            found = len(seed) if isinstance(seed, dict) else "invalid"
            raise SystemExit(
                f"{filename} must contain exactly {expected_decks} decks; found {found}"
            )
        duplicate_decks = all_deck_ids.intersection(seed)
        if duplicate_decks:
            raise SystemExit(
                f"Deck IDs appear in more than one expansion bundle: {sorted(duplicate_decks)[:10]}"
            )
        all_deck_ids.update(seed)
        cards: list[dict[str, object]] = []
        for deck_id, deck in seed.items():
            if not isinstance(deck_id, str) or not deck_id or not isinstance(deck, list) or not deck:
                raise SystemExit(f"Invalid or empty deck in {filename}: {deck_id!r}")
            if any(not isinstance(card, dict) for card in deck):
                raise SystemExit(f"Non-object card in {filename}: {deck_id}")
            cards.extend(deck)
        fronts = {
            normalize_card_text(card.get("front", card.get("term", "")))
            for card in cards
        }
        if "" in fronts:
            raise SystemExit(f"Blank card front in {filename}")
        if len(cards) != expected_cards or len(fronts) != expected_unique_fronts:
            raise SystemExit(
                f"{filename} source inventory changed: expected {expected_cards:,} cards / "
                f"{expected_unique_fronts:,} unique fronts; found {len(cards):,} / "
                f"{len(fronts):,}"
            )
        all_fronts.update(fronts)
        sections.append(
            {
                "id": section_id,
                "filename": filename,
                "deckCount": len(seed),
                "cardCount": len(cards),
                "uniqueFrontCount": len(fronts),
            }
        )
    if len(all_deck_ids) != EXPECTED_TOTAL_DECK_COUNT:
        raise SystemExit(
            f"Expected {EXPECTED_TOTAL_DECK_COUNT} expansion decks; found {len(all_deck_ids)}"
        )
    if len(all_fronts) != EXPECTED_SOURCE_ENTRY_COUNT:
        raise SystemExit(
            f"Expected {EXPECTED_SOURCE_ENTRY_COUNT:,} source-union fronts; "
            f"found {len(all_fronts):,}"
        )
    if sum(int(row["cardCount"]) for row in sections) != EXPECTED_TOTAL_CARD_COUNT:
        raise SystemExit(
            f"Expected {EXPECTED_TOTAL_CARD_COUNT:,} source cards across all sections"
        )
    return sorted(all_fronts, key=lambda value: (value.casefold(), value)), sections


def load_baseline_manifest(path: Path) -> tuple[dict[str, str], dict[str, object]]:
    source = path.read_text(encoding="utf-8")
    entries = assigned_json(source, BASELINE_AUDIO_ASSIGNMENT)
    meta = assigned_json(source, BASELINE_META_ASSIGNMENT)
    if (
        not isinstance(entries, dict)
        or not isinstance(meta, dict)
        or meta.get("complete") is not True
        or meta.get("count") != len(entries)
        or any(not isinstance(key, str) or not isinstance(value, str) for key, value in entries.items())
    ):
        raise SystemExit(f"Baseline audio manifest is incomplete or invalid: {path}")
    normalized: dict[str, str] = {}
    for text, url in entries.items():
        key = normalize_card_text(text)
        if key != text:
            raise SystemExit(f"Baseline manifest contains a non-canonical key: {text!r}")
        if key in normalized and normalized[key] != url:
            raise SystemExit(f"Baseline manifest has conflicting normalized text: {key!r}")
        normalized[key] = url
    return normalized, meta


def validate_existing_indexes(source_root: Path) -> list[dict[str, object]]:
    values: list[dict[str, object]] = []
    index_root = source_root / "workers/edmund-audio/src"
    for filename, expected_prefix, expected_count, expected_corpus in EXPECTED_EXISTING_INDEXES:
        path = index_root / filename
        value = json.loads(path.read_text(encoding="utf-8"))
        meta = value.get("meta", {}) if isinstance(value, dict) else {}
        entries = value.get("entries", {}) if isinstance(value, dict) else {}
        if (
            not isinstance(value, dict)
            or value.get("schemaVersion") != 1
            or value.get("cloudBaseUrl") != CLOUD_BASE_URL
            or value.get("audioPathPrefix") != expected_prefix
            or value.get("packKeyPrefix") != expected_prefix
            or not isinstance(meta, dict)
            or meta.get("r2UploadComplete") is not True
            or meta.get("entryCount") != expected_count
            or meta.get("corpusSha256") != expected_corpus
            or not isinstance(entries, dict)
        ):
            raise SystemExit(f"Earlier immutable pack index changed or is incomplete: {path}")
        indexed = 0
        for prefix, prefix_entries in entries.items():
            if not re.fullmatch(r"[0-9a-f]{2}", prefix) or not isinstance(prefix_entries, dict):
                raise SystemExit(f"Invalid earlier pack prefix in {path}: {prefix!r}")
            for suffix, audio_range in prefix_entries.items():
                if (
                    not re.fullmatch(r"[0-9a-f]{22}", suffix)
                    or not isinstance(audio_range, list)
                    or len(audio_range) != 2
                    or any(not isinstance(item, int) for item in audio_range)
                    or audio_range[0] < 0
                    or audio_range[1] <= 1000
                ):
                    raise SystemExit(f"Invalid earlier pack entry in {path}: {prefix}{suffix}")
                indexed += 1
        if indexed != expected_count:
            raise SystemExit(f"Earlier pack index entry count is inconsistent: {path}")
        values.append(value)
    return values


def validate_mp3(path: Path) -> None:
    if not path.is_file() or path.stat().st_size <= 1000:
        raise SystemExit(f"Missing or invalid expansion MP3: {path}")
    try:
        info = sf.info(path)
    except Exception as error:
        raise SystemExit(f"Unreadable expansion MP3: {path}: {error}") from error
    if (
        info.format != "MP3"
        or info.samplerate != 24000
        or info.channels != 1
        or not 0.2 <= info.duration <= 20
    ):
        raise SystemExit(
            f"Expansion MP3 format mismatch: {path} "
            f"({info.format}, {info.samplerate} Hz, {info.channels} channel(s), "
            f"{info.duration:.3f}s)"
        )


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    baseline_path = args.baseline_manifest.resolve()
    output_dir = args.output_dir.resolve()
    index_output = args.index_output.resolve()

    if index_output.is_file():
        previous = json.loads(index_output.read_text(encoding="utf-8"))
        if previous.get("meta", {}).get("r2UploadComplete") is True:
            raise SystemExit(
                f"{RELEASE} is already complete; create a new release instead of mutating it"
            )

    source_fronts, source_sections = load_source_fronts(source_root)
    baseline_entries, baseline_meta = load_baseline_manifest(baseline_path)
    baseline_mapping_sha256 = hashlib.sha256(
        json.dumps(
            baseline_entries,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    ).hexdigest()
    if (
        len(baseline_entries) != EXPECTED_BASELINE_ENTRY_COUNT
        or sha256_file(baseline_path) != EXPECTED_BASELINE_MANIFEST_SHA256
        or baseline_mapping_sha256 != EXPECTED_BASELINE_MAPPING_SHA256
        or baseline_meta.get("corpusSha256") != EXPECTED_BASELINE_CORPUS_SHA256
    ):
        raise SystemExit("Baseline snapshot does not match the immutable 2026-08-01 contract")
    earlier_indexes = validate_existing_indexes(source_root)

    baseline_digest_text: dict[str, str] = {}
    for text in baseline_entries:
        digest = text_digest(text)
        previous = baseline_digest_text.get(digest)
        if previous is not None and previous != text:
            raise SystemExit(f"Baseline truncated SHA-256 collision: {text!r} and {previous!r}")
        baseline_digest_text[digest] = text

    seen_digests: dict[str, str] = {}
    packed_fronts: list[str] = []
    for front in source_fronts:
        digest = text_digest(front)
        previous = seen_digests.get(digest)
        if previous is not None and previous != front:
            raise SystemExit(f"Expansion truncated SHA-256 collision: {front!r} and {previous!r}")
        baseline_text = baseline_digest_text.get(digest)
        if baseline_text is not None and baseline_text != front:
            raise SystemExit(
                f"Expansion/baseline truncated SHA-256 collision: {front!r} and {baseline_text!r}"
            )
        seen_digests[digest] = front
        if front not in baseline_entries:
            packed_fronts.append(front)
    if not packed_fronts:
        raise SystemExit("The 142-deck expansion contains no recordings outside the baseline")
    if (
        len(packed_fronts) != EXPECTED_NEW_ENTRY_COUNT
        or len(source_fronts) - len(packed_fronts)
        != EXPECTED_EXCLUDED_EXISTING_ENTRY_COUNT
    ):
        raise SystemExit(
            "Expansion/baseline deduplication changed: expected "
            f"{EXPECTED_NEW_ENTRY_COUNT:,} new and "
            f"{EXPECTED_EXCLUDED_EXISTING_ENTRY_COUNT:,} reused recordings; found "
            f"{len(packed_fronts):,} and {len(source_fronts) - len(packed_fronts):,}"
        )

    source_corpus_sha256 = hashlib.sha256(
        "\n".join(source_fronts).encode("utf-8")
    ).hexdigest()
    corpus_sha256 = hashlib.sha256(
        "\n".join(packed_fronts).encode("utf-8")
    ).hexdigest()
    if (
        source_corpus_sha256 != EXPECTED_SOURCE_CORPUS_SHA256
        or corpus_sha256 != EXPECTED_NEW_CORPUS_SHA256
    ):
        raise SystemExit("Expansion corpus content changed after the verified 142-deck import")

    grouped: dict[str, list[tuple[str, Path]]] = {}
    for front in packed_fronts:
        digest = text_digest(front)
        relative = f"{SOURCE_AUDIO_PATH_PREFIX}{digest[:2]}/{digest}.mp3"
        audio_path = source_root / relative
        validate_mp3(audio_path)
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
        entries[prefix] = prefix_entries
        packs[prefix] = {
            "key": f"{PACK_KEY_PREFIX}{prefix}.bin",
            "size": offset,
            "sha256": sha256_file(pack_path),
        }
        total_bytes += offset

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
            "sourceEntryCount": len(source_fronts),
            "sourceDeclaredUniqueFrontCount": len(source_fronts),
            "sourceDeckCount": sum(int(row["deckCount"]) for row in source_sections),
            "sourceCardCount": sum(int(row["cardCount"]) for row in source_sections),
            "sourceSections": source_sections,
            "sourceCorpusSha256": source_corpus_sha256,
            "excludedExistingEntryCount": len(source_fronts) - len(packed_fronts),
            "baselineEntryCount": len(baseline_entries),
            "baselineManifestSha256": sha256_file(baseline_path),
            "baselineMappingSha256": baseline_mapping_sha256,
            "baselineCorpusSha256": baseline_meta.get("corpusSha256", ""),
            "existingIndexes": [
                {
                    "audioPathPrefix": value["audioPathPrefix"],
                    "corpusSha256": value["meta"]["corpusSha256"],
                    "entryCount": value["meta"]["entryCount"],
                }
                for value in earlier_indexes
            ],
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
        f"Built {len(packs)} R2 packs for {len(packed_fronts):,} new recordings "
        f"({total_bytes / (1024 * 1024):.1f} MiB)."
    )
    print(
        f"Reused {len(source_fronts) - len(packed_fronts):,} recording(s) from the "
        f"immutable {len(baseline_entries):,}-entry baseline."
    )
    print(f"Pack index: {index_output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
