#!/usr/bin/env python3
"""Validate, upload and remotely verify the immutable 142-deck audio release."""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path


RELEASE = "v1-flashcard-expansion-20260801-1"
EXPECTED_PATH_PREFIX = f"assets/flashcards/audio/edmund-neural/{RELEASE}/"
EXPECTED_CLOUD_BASE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev"
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
EXPECTED_SECTIONS = (
    ("ielts-listening-practices-2-20", 76, 9_460, 8_798),
    ("dse-reading-2012-2025", 42, 7_475, 7_278),
    ("dse-practical-writing", 12, 630, 579),
    ("dse-paper3-b2-data-files-2012-2023", 12, 2_941, 2_804),
)
EXPECTED_SOURCE_CARD_COUNT = 20_506
EXPECTED_SOURCE_ENTRY_COUNT = 18_943
EXPECTED_NEW_ENTRY_COUNT = 16_083
EXPECTED_EXCLUDED_EXISTING_ENTRY_COUNT = 2_860
EXPECTED_SOURCE_CORPUS_SHA256 = (
    "ace3c896b6bc4dfb6cc2e649b0da95432d10825527d66924a8184c22c7c53b2f"
)
EXPECTED_NEW_CORPUS_SHA256 = (
    "22913b458da32795beeccc8e420effd48d2afbc31dd4e5ee07748cf1598c7878"
)
EXPECTED_EXISTING_PREFIXES = (
    "assets/flashcards/audio/edmund-neural/v1-passage1-20260722/",
    "assets/flashcards/audio/edmund-neural/v1-passage2-20260730-1/",
    "assets/flashcards/audio/edmund-neural/v1-reading-expansion-20260731-1/",
)
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
        / "workers/edmund-audio/src/flashcard-pack-index-flashcard-expansion.json",
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
    parser.add_argument("--check", action="store_true", help="Validate local packs only.")
    parser.add_argument(
        "--verify-remote",
        action="store_true",
        help="Download and SHA-256 verify every already-uploaded pack without writing R2.",
    )
    parser.add_argument(
        "--prune-source-audio",
        action="store_true",
        help=(
            "Delete individual v1 MP3s represented by a completed release. "
            "Use only after Worker deployment and live verification."
        ),
    )
    args = parser.parse_args()
    if args.jobs < 1 or args.jobs > 16:
        parser.error("--jobs must be between 1 and 16")
    if sum((args.check, args.verify_remote, args.prune_source_audio)) > 1:
        parser.error("--check, --verify-remote and --prune-source-audio are exclusive")
    return args


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def valid_nonnegative_int(value: object) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value >= 0


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
            "R2 checkpoint belongs to a different bucket or immutable release"
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
    temporary.write_text(
        json.dumps(
            {"schemaVersion": CHECKPOINT_SCHEMA_VERSION, "identity": identity, "packs": packs},
            indent=2,
            sort_keys=True,
        )
        + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def mark_index_uploaded(path: Path) -> None:
    value = json.loads(path.read_text(encoding="utf-8"))
    value["meta"]["r2UploadComplete"] = True
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def validate_packs(index_path: Path, pack_dir: Path) -> list[tuple[str, Path, str]]:
    index = json.loads(index_path.read_text(encoding="utf-8"))
    if not isinstance(index, dict):
        raise SystemExit("Flashcard expansion pack index has an invalid schema")
    packs = index.get("packs") if isinstance(index, dict) else None
    entries = index.get("entries") if isinstance(index, dict) else None
    meta = index.get("meta") if isinstance(index, dict) else None
    if (
        index.get("schemaVersion") != 1
        or not isinstance(packs, dict)
        or not isinstance(entries, dict)
        or not isinstance(meta, dict)
    ):
        raise SystemExit("Flashcard expansion pack index has an invalid schema")

    sections = meta.get("sourceSections")
    existing_indexes = meta.get("existingIndexes")
    section_pairs = (
        [
            (
                row.get("id"),
                row.get("deckCount"),
                row.get("cardCount"),
                row.get("uniqueFrontCount"),
            )
            for row in sections
        ]
        if isinstance(sections, list) and all(isinstance(row, dict) for row in sections)
        else []
    )
    if (
        meta.get("release") != RELEASE
        or index.get("audioPathPrefix") != EXPECTED_PATH_PREFIX
        or index.get("packKeyPrefix") != EXPECTED_PATH_PREFIX
        or index.get("cloudBaseUrl") != EXPECTED_CLOUD_BASE_URL
        or meta.get("entryCount") != EXPECTED_NEW_ENTRY_COUNT
        or not valid_nonnegative_int(meta.get("packCount"))
        or meta["packCount"] == 0
        or meta["packCount"] > 256
        or not valid_nonnegative_int(meta.get("totalBytes"))
        or meta["totalBytes"] == 0
        or meta.get("sourceEntryCount") != EXPECTED_SOURCE_ENTRY_COUNT
        or meta.get("sourceDeclaredUniqueFrontCount") != EXPECTED_SOURCE_ENTRY_COUNT
        or meta.get("sourceDeckCount") != 142
        or meta.get("sourceCardCount") != EXPECTED_SOURCE_CARD_COUNT
        or section_pairs != list(EXPECTED_SECTIONS)
        or any(
            not valid_nonnegative_int(row.get("cardCount"))
            or row["cardCount"] == 0
            or not valid_nonnegative_int(row.get("uniqueFrontCount"))
            or row["uniqueFrontCount"] == 0
            or not isinstance(row.get("filename"), str)
            for row in sections
        )
        or sum(row["deckCount"] for row in sections) != 142
        or sum(row["cardCount"] for row in sections) != meta["sourceCardCount"]
        or meta.get("excludedExistingEntryCount")
        != EXPECTED_EXCLUDED_EXISTING_ENTRY_COUNT
        or meta["sourceEntryCount"]
        != meta["entryCount"] + meta["excludedExistingEntryCount"]
        or meta.get("baselineEntryCount") != EXPECTED_BASELINE_ENTRY_COUNT
        or meta.get("baselineManifestSha256") != EXPECTED_BASELINE_MANIFEST_SHA256
        or meta.get("baselineMappingSha256") != EXPECTED_BASELINE_MAPPING_SHA256
        or meta.get("baselineCorpusSha256") != EXPECTED_BASELINE_CORPUS_SHA256
        or meta.get("sourceCorpusSha256") != EXPECTED_SOURCE_CORPUS_SHA256
        or meta.get("corpusSha256") != EXPECTED_NEW_CORPUS_SHA256
        or not isinstance(existing_indexes, list)
        or [row.get("audioPathPrefix") for row in existing_indexes if isinstance(row, dict)]
        != list(EXPECTED_EXISTING_PREFIXES)
        or len(packs) != meta["packCount"]
        or set(entries) != set(packs)
        or ".." in EXPECTED_PATH_PREFIX
        or meta.get("r2UploadComplete") not in (False, True)
    ):
        raise SystemExit("Flashcard expansion pack metadata is incomplete or inconsistent")
    for digest_name in ("corpusSha256", "sourceCorpusSha256"):
        if not isinstance(meta.get(digest_name), str) or not re.fullmatch(
            r"[0-9a-f]{64}", meta[digest_name]
        ):
            raise SystemExit(f"Invalid {digest_name} in expansion metadata")

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
            raise SystemExit(f"Unsafe pack key for prefix {prefix!r}")
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
            or sha256_file(path) != expected_hash
        ):
            raise SystemExit(f"Pack size or SHA-256 mismatch: {path}")
        prefix_entries = entries[prefix]
        if not isinstance(prefix_entries, dict) or not prefix_entries:
            raise SystemExit(f"Empty entry map for pack {prefix}")
        ranges: list[list[int]] = []
        for suffix, audio_range in prefix_entries.items():
            if (
                not re.fullmatch(r"[0-9a-f]{22}", suffix)
                or not isinstance(audio_range, list)
                or len(audio_range) != 2
                or any(not valid_nonnegative_int(value) for value in audio_range)
            ):
                raise SystemExit(f"Invalid audio range in pack {prefix}")
            ranges.append(audio_range)
        expected_offset = 0
        for audio_range in sorted(ranges, key=lambda row: row[0]):
            if audio_range[0] != expected_offset or audio_range[1] <= 1000:
                raise SystemExit(f"Non-contiguous audio ranges in pack {prefix}")
            expected_offset += audio_range[1]
            indexed_recordings += 1
        if expected_offset != expected_size:
            raise SystemExit(f"Audio ranges do not fill pack {prefix}")
        indexed_bytes += expected_size
        validated.append((expected_key, path, expected_hash))
    if indexed_recordings != meta["entryCount"] or indexed_bytes != meta["totalBytes"]:
        raise SystemExit("Validated pack totals disagree with index metadata")
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
        raise RuntimeError(f"R2 upload failed for {key}: {(result.stderr or result.stdout).strip()}")
    return key


def verify_remote_one(
    wrangler: Path,
    bucket: str,
    key: str,
    expected_path: Path,
    expected_hash: str,
    destination: Path,
) -> str:
    result = subprocess.run(
        [
            str(wrangler),
            "r2",
            "object",
            "get",
            f"{bucket}/{key}",
            "--file",
            str(destination),
            "--remote",
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"R2 verification download failed for {key}: "
            f"{(result.stderr or result.stdout).strip()}"
        )
    if destination.stat().st_size != expected_path.stat().st_size:
        raise RuntimeError(f"R2 verification size mismatch for {key}")
    if sha256_file(destination) != expected_hash:
        raise RuntimeError(f"R2 verification SHA-256 mismatch for {key}")
    destination.unlink()
    return key


def verify_remote_packs(
    wrangler: Path,
    bucket: str,
    validated: list[tuple[str, Path, str]],
    jobs: int,
) -> None:
    print(f"Downloading and hashing all {len(validated)} remote pack(s).")
    with tempfile.TemporaryDirectory(prefix=f"edmund-{RELEASE}-") as temporary_root:
        root = Path(temporary_root)
        with concurrent.futures.ThreadPoolExecutor(max_workers=jobs) as pool:
            futures = {
                pool.submit(
                    verify_remote_one,
                    wrangler,
                    bucket,
                    key,
                    path,
                    expected_hash,
                    root / f"{index:03d}.bin",
                ): key
                for index, (key, path, expected_hash) in enumerate(validated)
            }
            completed = 0
            failures: list[str] = []
            for future in concurrent.futures.as_completed(futures):
                try:
                    future.result()
                except Exception as error:
                    failures.append(str(error))
                    continue
                completed += 1
                if completed == len(validated) or completed % 16 == 0:
                    print(f"Verified {completed}/{len(validated)} remote pack(s).")
            if failures:
                raise SystemExit("\n".join(failures[:10]))


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
    print(
        f"Flashcard expansion source valid: {len(validated)} packs, "
        f"{sum(path.stat().st_size for _, path, _ in validated) / (1024 * 1024):.1f} MiB."
    )
    if args.check:
        return 0

    complete = json.loads(index_path.read_text(encoding="utf-8"))["meta"][
        "r2UploadComplete"
    ]
    if args.verify_remote:
        verify_remote_packs(wrangler, args.bucket, validated, args.jobs)
        return 0
    if complete:
        if not args.prune_source_audio:
            raise SystemExit(f"{RELEASE} is complete and immutable; refusing to overwrite it")
        removed = prune_uploaded_source_audio(args.source_root.resolve(), index_path)
        print(f"Removed {removed:,} source MP3(s) after verified live deployment.")
        return 0
    if args.prune_source_audio:
        raise SystemExit(
            "Upload and fully verify the release before requesting source pruning"
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
            pool.submit(upload_one, wrangler, args.bucket, key, path): (key, expected_hash)
            for key, path, expected_hash in pending
        }
        for future in concurrent.futures.as_completed(futures):
            key, expected_hash = futures[future]
            try:
                future.result()
            except Exception as error:
                failures.append(str(error))
                continue
            checkpoint[key] = expected_hash
            write_checkpoint(checkpoint_path, identity, checkpoint)
            completed += 1
            if completed == len(pending) or completed % 16 == 0:
                print(f"Uploaded {completed}/{len(pending)} pending pack(s).")
    if failures:
        raise SystemExit("\n".join(failures[:10]))

    # A successful PUT is not enough to make an immutable release public. Read
    # every object back from R2 and compare its complete SHA-256 first.
    verify_remote_packs(wrangler, args.bucket, validated, args.jobs)
    mark_index_uploaded(index_path)
    print(f"Flashcard expansion R2 release {RELEASE} is uploaded and fully verified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
