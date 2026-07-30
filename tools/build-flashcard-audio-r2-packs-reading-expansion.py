#!/usr/bin/env python3
"""Pack new IELTS Reading Passage 2/3 MP3s for an immutable R2 release."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import soundfile as sf

SEED_SPECS = (
    (
        "flashcards-ielts-reading-passage-2-data.js",
        "window.EDMUND_IELTS_READING_PASSAGE_2_SEED = ",
        "window.EDMUND_IELTS_READING_PASSAGE_2_META = ",
        2,
    ),
    (
        "flashcards-ielts-reading-passage-3-data.js",
        "window.EDMUND_IELTS_READING_PASSAGE_3_SEED = ",
        "window.EDMUND_IELTS_READING_PASSAGE_3_META = ",
        3,
    ),
)
SOURCE_AUDIO_PATH_PREFIX = "assets/flashcards/audio/edmund-neural/v1/"
RELEASE = "v1-reading-expansion-20260731-1"
PUBLIC_AUDIO_PATH_PREFIX = f"assets/flashcards/audio/edmund-neural/{RELEASE}/"
PACK_KEY_PREFIX = PUBLIC_AUDIO_PATH_PREFIX
EXPECTED_EXISTING_PREFIXES = (
    "assets/flashcards/audio/edmund-neural/v1-passage1-20260722/",
    "assets/flashcards/audio/edmund-neural/v1-passage2-20260730-1/",
)
CLOUD_BASE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev"
EXPECTED_BASELINE_ENTRY_COUNT = 91_338
EXPECTED_BASELINE_MANIFEST_SHA256 = "2d496c54e8d8104c89eff5ef28ec230c2a21e755af05b0d35fef19981b3bd950"
EXPECTED_BASELINE_MAPPING_SHA256 = "4cf616f93a6b2ff5066fca610b8cae0ca8750c6429b62eac641a27974c0369c0"
EXPECTED_BASELINE_CORPUS_SHA256 = "94cc0319aba7d0d024c86a811cfb011dee35ebaf4dd641638a6ee603065298fc"
BASELINE_AUDIO_ASSIGNMENT = "window.EDMUND_FLASHCARD_AUDIO = Object.freeze("
BASELINE_META_ASSIGNMENT = "window.EDMUND_FLASHCARD_AUDIO_META = Object.freeze("


def parse_args() -> argparse.Namespace:
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=repository_root)
    parser.add_argument(
        "--existing-index",
        type=Path,
        action="append",
        help="Complete earlier index to reuse; defaults to Passage 1 and Passage 2.",
    )
    parser.add_argument(
        "--baseline-manifest",
        type=Path,
        default=repository_root / ".flashcards-audio-build/baseline-manifest-20260730.js",
        help="Complete pre-expansion manifest whose text-to-URL mappings are immutable.",
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
        / "workers/edmund-audio/src/flashcard-pack-index-reading-expansion.json",
    )
    args = parser.parse_args()
    if not args.existing_index:
        args.existing_index = [
            repository_root / "workers/edmund-audio/src/flashcard-pack-index.json",
            repository_root / "workers/edmund-audio/src/flashcard-pack-index-passage2.json",
        ]
    return args


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


def load_fronts(source_root: Path) -> tuple[list[str], list[dict[str, object]]]:
    fronts: set[str] = set()
    source_meta: list[dict[str, object]] = []
    for filename, seed_assignment, meta_assignment, passage in SEED_SPECS:
        source = (source_root / filename).read_text(encoding="utf-8")
        seed = assigned_json(source, seed_assignment)
        meta = assigned_json(source, meta_assignment)
        if not isinstance(seed, dict) or not isinstance(meta, dict):
            raise SystemExit(f"Passage {passage} seed or metadata has an invalid shape")
        if any(not isinstance(deck, list) for deck in seed.values()):
            raise SystemExit(f"Passage {passage} seed contains an invalid deck")
        cards = [card for deck in seed.values() for card in deck]
        if any(not isinstance(card, dict) for card in cards):
            raise SystemExit(f"Passage {passage} seed contains an invalid card")
        declared_fronts = {
            str(card.get("front", card.get("term", ""))).strip() for card in cards
        }
        declared_fronts.discard("")
        passage_fronts = {
            normalize_card_text(card.get("front", card.get("term", "")))
            for card in cards
        }
        passage_fronts.discard("")
        if (
            meta.get("passage") != passage
            or meta.get("deckCount") != len(seed)
            or meta.get("cardCount") != len(cards)
            or meta.get("uniqueFrontCount") != len(declared_fronts)
        ):
            raise SystemExit(
                f"Passage {passage} seed disagrees with its generated metadata"
            )
        fronts.update(passage_fronts)
        source_meta.append(meta)
    return sorted(fronts, key=lambda value: (value.casefold(), value)), source_meta


def text_digest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:24]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def uploaded_index_digests(path: Path, expected_prefix: str) -> tuple[set[str], dict[str, object]]:
    value = json.loads(path.read_text(encoding="utf-8"))
    meta = value.get("meta", {}) if isinstance(value, dict) else {}
    entries = value.get("entries", {}) if isinstance(value, dict) else {}
    if (
        not isinstance(value, dict)
        or value.get("schemaVersion") != 1
        or value.get("audioPathPrefix") != expected_prefix
        or value.get("cloudBaseUrl") != CLOUD_BASE_URL
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
        previous = normalized.get(key)
        if previous is not None and previous != url:
            raise SystemExit(f"Baseline manifest has conflicting normalized text: {key!r}")
        normalized[key] = url
    return normalized, meta


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
            f"({info.format}, {info.samplerate} Hz, {info.channels} channel(s), {info.duration:.3f}s)"
        )


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    existing_index_paths = [path.resolve() for path in args.existing_index]
    baseline_manifest_path = args.baseline_manifest.resolve()
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

    all_fronts, source_meta = load_fronts(source_root)
    baseline_entries, baseline_meta = load_baseline_manifest(baseline_manifest_path)
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
        or sha256_file(baseline_manifest_path) != EXPECTED_BASELINE_MANIFEST_SHA256
        or baseline_mapping_sha256 != EXPECTED_BASELINE_MAPPING_SHA256
        or baseline_meta.get("corpusSha256") != EXPECTED_BASELINE_CORPUS_SHA256
    ):
        raise SystemExit(
            "Baseline audio snapshot does not match the immutable 2026-07-30 release"
        )
    baseline_digest_text: dict[str, str] = {}
    for baseline_text in baseline_entries:
        digest = text_digest(baseline_text)
        previous = baseline_digest_text.get(digest)
        if previous is not None and previous != baseline_text:
            raise SystemExit(
                f"Baseline truncated SHA-256 collision: {baseline_text!r} and {previous!r}"
            )
        baseline_digest_text[digest] = baseline_text
    existing_digests: set[str] = set()
    existing_indexes: list[dict[str, object]] = []
    if len(existing_index_paths) != len(EXPECTED_EXISTING_PREFIXES):
        raise SystemExit(
            f"Expected {len(EXPECTED_EXISTING_PREFIXES)} earlier indexes, "
            f"received {len(existing_index_paths)}"
        )
    for path, prefix in zip(existing_index_paths, EXPECTED_EXISTING_PREFIXES, strict=True):
        digests, value = uploaded_index_digests(path, prefix)
        existing_digests.update(digests)
        existing_indexes.append(value)
    seen_digests: dict[str, str] = {}
    packed_fronts: list[str] = []
    for front in all_fronts:
        digest = text_digest(front)
        previous = seen_digests.get(digest)
        if previous is not None and previous != front:
            raise SystemExit(f"Truncated SHA-256 collision: {front!r} and {previous!r}")
        baseline_text = baseline_digest_text.get(digest)
        if baseline_text is not None and baseline_text != front:
            raise SystemExit(
                f"New/baseline truncated SHA-256 collision: {front!r} and {baseline_text!r}"
            )
        seen_digests[digest] = front
        if front not in baseline_entries and digest not in existing_digests:
            packed_fronts.append(front)
    if not packed_fronts:
        raise SystemExit("The reading expansion has no recordings outside the baseline library")

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
            "sourceDeclaredUniqueFrontCount": len(all_fronts),
            "sourceDeckCount": sum(int(meta["deckCount"]) for meta in source_meta),
            "sourceCardCount": sum(int(meta["cardCount"]) for meta in source_meta),
            "sourcePassages": [
                {
                    "passage": meta["passage"],
                    "deckCount": meta["deckCount"],
                    "cardCount": meta["cardCount"],
                    "uniqueFrontCount": meta["uniqueFrontCount"],
                }
                for meta in source_meta
            ],
            "sourceCorpusSha256": source_corpus_sha256,
            "excludedExistingEntryCount": len(all_fronts) - len(packed_fronts),
            "baselineEntryCount": len(baseline_entries),
            "baselineManifestSha256": sha256_file(baseline_manifest_path),
            "baselineMappingSha256": baseline_mapping_sha256,
            "baselineCorpusSha256": baseline_meta.get("corpusSha256", ""),
            "existingIndexes": [
                {
                    "audioPathPrefix": index["audioPathPrefix"],
                    "corpusSha256": index["meta"]["corpusSha256"],
                    "entryCount": index["meta"]["entryCount"],
                }
                for index in existing_indexes
            ],
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
        f"Built {len(packs)} R2 packs for {len(packed_fronts):,} new Reading expansion "
        f"recordings ({total_bytes / (1024 * 1024):.1f} MiB)."
    )
    print(
        f"Reused {len(all_fronts) - len(packed_fronts):,} recording(s) from the "
        "immutable baseline library."
    )
    print(f"Pack index: {index_output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
