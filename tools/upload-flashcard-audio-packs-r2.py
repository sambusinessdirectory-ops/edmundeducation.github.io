#!/usr/bin/env python3
"""Validate and upload the Passage 1 flashcard audio packs to Cloudflare R2."""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import re
import subprocess
from pathlib import Path


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
        default=repository_root / "workers/edmund-audio/src/flashcard-pack-index.json",
    )
    parser.add_argument(
        "--pack-dir",
        type=Path,
        default=repository_root / ".flashcards-audio-build/r2-packs",
    )
    parser.add_argument(
        "--checkpoint",
        type=Path,
        default=repository_root / ".flashcards-audio-build/r2-upload-checkpoint.json",
    )
    parser.add_argument("--check", action="store_true")
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
    meta = index.get("meta", {})
    return {
        "bucket": bucket,
        "cloudBaseUrl": index.get("cloudBaseUrl"),
        "corpusSha256": meta.get("corpusSha256"),
        "entryCount": meta.get("entryCount"),
        "packCount": meta.get("packCount"),
        "packKeyPrefix": index.get("packKeyPrefix"),
        "totalBytes": meta.get("totalBytes"),
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
            "use a release-specific checkpoint path"
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


def write_checkpoint(path: Path, identity: dict[str, object], packs: dict[str, str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    value = {
        "schemaVersion": CHECKPOINT_SCHEMA_VERSION,
        "identity": identity,
        "packs": packs,
    }
    temporary.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")
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
    packs = index.get("packs", {})
    entries = index.get("entries", {})
    meta = index.get("meta", {})
    pack_key_prefix = str(index.get("packKeyPrefix", ""))
    if (
        meta.get("entryCount") != 27_280
        or meta.get("packCount") != 256
        or len(packs) != 256
        or set(entries) != set(packs)
        or not pack_key_prefix.startswith("assets/flashcards/audio/edmund-neural/")
        or ".." in pack_key_prefix
    ):
        raise SystemExit("Passage 1 flashcard pack index is incomplete")
    validated = []
    indexed_recordings = 0
    for prefix, item in sorted(packs.items()):
        expected_key = f"{pack_key_prefix}{prefix}.bin"
        if not re.fullmatch(r"[0-9a-f]{2}", prefix) or item.get("key") != expected_key:
            raise SystemExit(f"Unsafe or unexpected flashcard pack key for prefix {prefix!r}")
        path = pack_dir / f"{prefix}.bin"
        expected_size = int(item.get("size", 0))
        expected_hash = str(item.get("sha256", ""))
        if not path.is_file() or path.stat().st_size != expected_size:
            raise SystemExit(f"Flashcard audio pack size mismatch: {path}")
        if sha256_file(path) != expected_hash:
            raise SystemExit(f"Flashcard audio pack SHA-256 mismatch: {path}")
        prefix_entries = entries[prefix]
        if not isinstance(prefix_entries, dict):
            raise SystemExit(f"Invalid flashcard entry map for prefix {prefix}")
        validated_ranges: list[tuple[str, list[int]]] = []
        for suffix, audio_range in prefix_entries.items():
            if (
                not re.fullmatch(r"[0-9a-f]{22}", suffix)
                or not isinstance(audio_range, list)
                or len(audio_range) != 2
                or any(not isinstance(value, int) for value in audio_range)
            ):
                raise SystemExit(f"Invalid flashcard range in prefix {prefix}")
            validated_ranges.append((suffix, audio_range))
        expected_offset = 0
        for suffix, audio_range in sorted(validated_ranges, key=lambda row: row[1][0]):
            if (
                audio_range[0] != expected_offset
                or audio_range[1] <= 1000
            ):
                raise SystemExit(f"Invalid or non-contiguous flashcard range in prefix {prefix}")
            expected_offset += audio_range[1]
            indexed_recordings += 1
        if expected_offset != expected_size:
            raise SystemExit(f"Flashcard audio ranges do not fill pack {prefix}")
        validated.append((expected_key, path, expected_hash))
    if indexed_recordings != meta["entryCount"]:
        raise SystemExit(
            f"Flashcard pack index contains {indexed_recordings:,} ranges, "
            f"expected {meta['entryCount']:,}"
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
        raise RuntimeError(f"R2 upload failed for {key}: {(result.stderr or result.stdout).strip()}")
    return key


def main() -> int:
    args = parse_args()
    wrangler = args.wrangler.resolve()
    if not wrangler.is_file():
        raise SystemExit(f"Wrangler executable is missing: {wrangler}")
    validated = validate_packs(args.index.resolve(), args.pack_dir.resolve())
    total_bytes = sum(path.stat().st_size for _, path, _ in validated)
    print(f"Flashcard R2 source valid: {len(validated)} packs, {total_bytes / (1024 * 1024):.1f} MiB.")
    if args.check:
        return 0

    checkpoint_path = args.checkpoint.resolve()
    identity = checkpoint_identity(args.index.resolve(), args.bucket)
    checkpoint = load_checkpoint(checkpoint_path, identity)
    pending = [item for item in validated if checkpoint.get(item[0]) != item[2]]
    print(f"Uploading {len(pending)} pack(s); {len(validated) - len(pending)} checkpoint hit(s).")
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
            except Exception as error:  # Keep every successfully uploaded pack resumable.
                failures.append(str(error))
                continue
            checkpoint[key] = expected_hash
            write_checkpoint(checkpoint_path, identity, checkpoint)
            completed += 1
            if completed == len(pending) or completed % 16 == 0:
                print(f"Uploaded {completed}/{len(pending)} pending pack(s).")
    if failures:
        raise SystemExit("\n".join(failures[:10]))
    mark_index_uploaded(args.index.resolve())
    print("Passage 1 flashcard R2 pack upload complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
