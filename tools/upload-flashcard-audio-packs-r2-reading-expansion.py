#!/usr/bin/env python3
"""Validate and upload the immutable IELTS Reading expansion audio release."""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import re
import subprocess
from pathlib import Path


RELEASE = "v1-reading-expansion-20260731-1"
EXPECTED_PATH_PREFIX = f"assets/flashcards/audio/edmund-neural/{RELEASE}/"
EXPECTED_CLOUD_BASE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev"
IMMUTABLE_CACHE = "public, max-age=31536000, immutable"
CHECKPOINT_SCHEMA_VERSION = 1


def parse_args() -> argparse.Namespace:
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=repository_root)
    parser.add_argument("--bucket", default="edmund-assets")
    parser.add_argument("--wrangler", type=Path, required=True)
    parser.add_argument("--jobs", type=int, default=8)
    parser.add_argument(
        "--index",
        type=Path,
        default=repository_root
        / "workers/edmund-audio/src/flashcard-pack-index-reading-expansion.json",
    )
    parser.add_argument(
        "--pack-dir",
        type=Path,
        default=repository_root / f".flashcards-audio-build/r2-packs-{RELEASE}",
    )
    parser.add_argument(
        "--checkpoint",
        type=Path,
        default=repository_root
        / f".flashcards-audio-build/r2-upload-checkpoint-{RELEASE}.json",
    )
    parser.add_argument("--check", action="store_true")
    parser.add_argument(
        "--prune-source-audio",
        action="store_true",
        help=(
            "Prune only the individual v1 MP3s represented by an already-complete "
            "release. Run this separately after the Worker is deployed and live-tested."
        ),
    )
    args = parser.parse_args()
    if args.jobs < 1 or args.jobs > 16:
        parser.error("--jobs must be between 1 and 16")
    return args


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def checkpoint_identity(index_path: Path, bucket: str) -> dict[str, object]:
    index = json.loads(index_path.read_text(encoding="utf-8"))
    meta = index["meta"]
    return {
        "bucket": bucket,
        "cloudBaseUrl": index["cloudBaseUrl"],
        "corpusSha256": meta["corpusSha256"],
        "entryCount": meta["entryCount"],
        "packCount": meta["packCount"],
        "packKeyPrefix": index["packKeyPrefix"],
        "release": meta["release"],
        "totalBytes": meta["totalBytes"],
    }


def load_checkpoint(path: Path, identity: dict[str, object]) -> dict[str, str]:
    if not path.is_file():
        return {}
    value = json.loads(path.read_text(encoding="utf-8"))
    if (
        not isinstance(value, dict)
        or value.get("schemaVersion") != CHECKPOINT_SCHEMA_VERSION
        or value.get("identity") != identity
        or not isinstance(value.get("packs"), dict)
    ):
        raise SystemExit(
            "R2 upload checkpoint belongs to a different bucket or pack release; "
            "use the release-specific checkpoint path"
        )
    packs = value["packs"]
    if any(
        not isinstance(key, str)
        or not isinstance(digest, str)
        or not re.fullmatch(r"[0-9a-f]{64}", digest)
        for key, digest in packs.items()
    ):
        raise SystemExit("R2 upload checkpoint is invalid")
    return packs


def write_checkpoint(
    path: Path, identity: dict[str, object], packs: dict[str, str]
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    value = {
        "schemaVersion": CHECKPOINT_SCHEMA_VERSION,
        "identity": identity,
        "packs": packs,
    }
    temporary.write_text(
        json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    temporary.replace(path)


def mark_index_uploaded(path: Path) -> None:
    value = json.loads(path.read_text(encoding="utf-8"))
    value["meta"]["r2UploadComplete"] = True
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def valid_nonnegative_int(value: object) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value >= 0


def validate_packs(index_path: Path, pack_dir: Path) -> list[tuple[str, Path, str]]:
    index = json.loads(index_path.read_text(encoding="utf-8"))
    if not isinstance(index, dict) or index.get("schemaVersion") != 1:
        raise SystemExit("Reading expansion pack index has an invalid schema")
    packs = index.get("packs")
    entries = index.get("entries")
    meta = index.get("meta")
    if not isinstance(packs, dict) or not isinstance(entries, dict) or not isinstance(
        meta, dict
    ):
        raise SystemExit("Reading expansion pack index has an invalid shape")

    entry_count = meta.get("entryCount")
    pack_count = meta.get("packCount")
    total_bytes = meta.get("totalBytes")
    source_entry_count = meta.get("sourceEntryCount")
    source_declared_entry_count = meta.get("sourceDeclaredUniqueFrontCount")
    excluded_entry_count = meta.get("excludedExistingEntryCount")
    source_passages = meta.get("sourcePassages")
    existing_indexes = meta.get("existingIndexes")
    if (
        meta.get("release") != RELEASE
        or index.get("audioPathPrefix") != EXPECTED_PATH_PREFIX
        or index.get("packKeyPrefix") != EXPECTED_PATH_PREFIX
        or index.get("cloudBaseUrl") != EXPECTED_CLOUD_BASE_URL
        or not valid_nonnegative_int(entry_count)
        or entry_count == 0
        or not valid_nonnegative_int(pack_count)
        or pack_count == 0
        or pack_count > 256
        or not valid_nonnegative_int(total_bytes)
        or total_bytes == 0
        or not valid_nonnegative_int(source_entry_count)
        or not valid_nonnegative_int(source_declared_entry_count)
        or source_declared_entry_count < source_entry_count
        or not valid_nonnegative_int(meta.get("sourceDeckCount"))
        or meta["sourceDeckCount"] == 0
        or not valid_nonnegative_int(meta.get("sourceCardCount"))
        or meta["sourceCardCount"] == 0
        or not valid_nonnegative_int(excluded_entry_count)
        or source_entry_count != entry_count + excluded_entry_count
        or not valid_nonnegative_int(meta.get("baselineEntryCount"))
        or meta["baselineEntryCount"] == 0
        or not isinstance(source_passages, list)
        or [row.get("passage") for row in source_passages if isinstance(row, dict)] != [2, 3]
        or any(
            not isinstance(row, dict)
            or not valid_nonnegative_int(row.get("deckCount"))
            or row["deckCount"] == 0
            or not valid_nonnegative_int(row.get("cardCount"))
            or row["cardCount"] == 0
            or not valid_nonnegative_int(row.get("uniqueFrontCount"))
            or row["uniqueFrontCount"] == 0
            for row in source_passages
        )
        or sum(row["deckCount"] for row in source_passages) != meta["sourceDeckCount"]
        or sum(row["cardCount"] for row in source_passages) != meta["sourceCardCount"]
        or not isinstance(existing_indexes, list)
        or len(existing_indexes) != 2
        or [row.get("audioPathPrefix") for row in existing_indexes if isinstance(row, dict)] != [
            "assets/flashcards/audio/edmund-neural/v1-passage1-20260722/",
            "assets/flashcards/audio/edmund-neural/v1-passage2-20260730-1/",
        ]
        or len(packs) != pack_count
        or set(entries) != set(packs)
        or ".." in EXPECTED_PATH_PREFIX
        or meta.get("r2UploadComplete") not in (False, True)
    ):
        raise SystemExit("Reading expansion pack index metadata is incomplete")
    for digest_name in (
        "corpusSha256",
        "sourceCorpusSha256",
        "baselineManifestSha256",
        "baselineMappingSha256",
        "baselineCorpusSha256",
    ):
        if not isinstance(meta.get(digest_name), str) or not re.fullmatch(
            r"[0-9a-f]{64}", meta[digest_name]
        ):
            raise SystemExit(f"Reading expansion pack metadata has invalid {digest_name}")
    for row in existing_indexes:
        if (
            not isinstance(row.get("corpusSha256"), str)
            or not re.fullmatch(r"[0-9a-f]{64}", row["corpusSha256"])
            or not valid_nonnegative_int(row.get("entryCount"))
            or row["entryCount"] == 0
        ):
            raise SystemExit("Reading expansion has invalid earlier-index metadata")

    validated: list[tuple[str, Path, str]] = []
    indexed_recordings = 0
    indexed_bytes = 0
    for prefix, item in sorted(packs.items()):
        expected_key = f"{EXPECTED_PATH_PREFIX}{prefix}.bin"
        if (
            not re.fullmatch(r"[0-9a-f]{2}", prefix)
            or not isinstance(item, dict)
            or item.get("key") != expected_key
        ):
            raise SystemExit(
                f"Unsafe or unexpected Reading expansion pack key for prefix {prefix!r}"
            )
        path = pack_dir / f"{prefix}.bin"
        expected_size = item.get("size")
        expected_hash = item.get("sha256")
        if (
            not valid_nonnegative_int(expected_size)
            or expected_size == 0
            or not isinstance(expected_hash, str)
            or not re.fullmatch(r"[0-9a-f]{64}", expected_hash)
            or not path.is_file()
            or path.stat().st_size != expected_size
        ):
            raise SystemExit(f"Flashcard audio pack size or metadata mismatch: {path}")
        if sha256_file(path) != expected_hash:
            raise SystemExit(f"Flashcard audio pack SHA-256 mismatch: {path}")

        prefix_entries = entries[prefix]
        if not isinstance(prefix_entries, dict) or not prefix_entries:
            raise SystemExit(f"Invalid flashcard entry map for prefix {prefix}")
        validated_ranges: list[tuple[str, list[int]]] = []
        for suffix, audio_range in prefix_entries.items():
            if (
                not re.fullmatch(r"[0-9a-f]{22}", suffix)
                or not isinstance(audio_range, list)
                or len(audio_range) != 2
                or any(not valid_nonnegative_int(value) for value in audio_range)
            ):
                raise SystemExit(f"Invalid flashcard range in prefix {prefix}")
            validated_ranges.append((suffix, audio_range))
        expected_offset = 0
        for _, audio_range in sorted(validated_ranges, key=lambda row: row[1][0]):
            if audio_range[0] != expected_offset or audio_range[1] <= 1000:
                raise SystemExit(
                    f"Invalid or non-contiguous flashcard range in prefix {prefix}"
                )
            expected_offset += audio_range[1]
            indexed_recordings += 1
        if expected_offset != expected_size:
            raise SystemExit(f"Flashcard audio ranges do not fill pack {prefix}")
        indexed_bytes += expected_size
        validated.append((expected_key, path, expected_hash))

    if indexed_recordings != entry_count or indexed_bytes != total_bytes:
        raise SystemExit(
            "Reading expansion pack index counts disagree with its validated packs"
        )
    return validated


def upload_one(wrangler: Path, bucket: str, key: str, path: Path) -> str:
    result = subprocess.run(
        [
            str(wrangler),
            "r2",
            "object",
            "put",
            f"{bucket}/{key}",
            "--file",
            str(path),
            "--content-type",
            "application/octet-stream",
            "--cache-control",
            IMMUTABLE_CACHE,
            "--remote",
            "--force",
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"R2 upload failed for {key}: {(result.stderr or result.stdout).strip()}"
        )
    return key


def prune_uploaded_source_audio(source_root: Path, index_path: Path) -> int:
    index = json.loads(index_path.read_text(encoding="utf-8"))
    if index.get("meta", {}).get("r2UploadComplete") is not True:
        raise SystemExit("Refusing to prune source MP3s before upload is complete")
    removed = 0
    source_prefix = Path("assets/flashcards/audio/edmund-neural/v1")
    for prefix, prefix_entries in index["entries"].items():
        for suffix in prefix_entries:
            digest = f"{prefix}{suffix}"
            path = source_root / source_prefix / prefix / f"{digest}.mp3"
            if path.is_file():
                path.unlink()
                removed += 1
    return removed


def main() -> int:
    args = parse_args()
    wrangler = args.wrangler.resolve()
    if not wrangler.is_file():
        raise SystemExit(f"Wrangler executable is missing: {wrangler}")
    index_path = args.index.resolve()
    validated = validate_packs(index_path, args.pack_dir.resolve())
    total_bytes = sum(path.stat().st_size for _, path, _ in validated)
    print(
        f"Reading expansion R2 source valid: {len(validated)} packs, "
        f"{total_bytes / (1024 * 1024):.1f} MiB."
    )
    if args.check:
        return 0

    already_complete = json.loads(index_path.read_text(encoding="utf-8"))["meta"][
        "r2UploadComplete"
    ]
    if already_complete:
        if not args.prune_source_audio:
            raise SystemExit(
                f"{RELEASE} is already complete and immutable; refusing to overwrite it"
            )
        removed = prune_uploaded_source_audio(args.source_root.resolve(), index_path)
        print(f"Removed {removed:,} packed source MP3(s) after live release verification.")
        return 0
    if args.prune_source_audio:
        raise SystemExit(
            "Upload without --prune-source-audio first; deploy and live-test the Worker, "
            "then run this command again with --prune-source-audio"
        )

    checkpoint_path = args.checkpoint.resolve()
    identity = checkpoint_identity(index_path, args.bucket)
    checkpoint = load_checkpoint(checkpoint_path, identity)
    pending = [item for item in validated if checkpoint.get(item[0]) != item[2]]
    print(
        f"Uploading {len(pending)} pack(s); "
        f"{len(validated) - len(pending)} checkpoint hit(s)."
    )
    failures: list[str] = []
    completed = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = {
            pool.submit(upload_one, wrangler, args.bucket, key, path): (
                key,
                expected_hash,
            )
            for key, path, expected_hash in pending
        }
        for future in concurrent.futures.as_completed(futures):
            key, expected_hash = futures[future]
            try:
                future.result()
            except Exception as error:  # Keep every successful upload resumable.
                failures.append(str(error))
                continue
            checkpoint[key] = expected_hash
            write_checkpoint(checkpoint_path, identity, checkpoint)
            completed += 1
            if completed == len(pending) or completed % 16 == 0:
                print(f"Uploaded {completed}/{len(pending)} pending pack(s).")
    if failures:
        raise SystemExit("\n".join(failures[:10]))
    mark_index_uploaded(index_path)
    print(f"Reading expansion R2 release {RELEASE} upload complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
