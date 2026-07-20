#!/usr/bin/env python3
"""Validate and upload the referenced Part 3 MP3 library to Cloudflare R2."""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import importlib.util
import json
import re
import subprocess
from pathlib import Path
from types import ModuleType
from typing import Any


TOOLS_DIR = Path(__file__).resolve().parent
GENERATOR_PATH = TOOLS_DIR / "generate-speaking-part3-audio.py"
EXPECTED_PREFIX = "assets/speaking-system/audio/edmund-neural/part3/"
IMMUTABLE_CACHE = "public, max-age=31536000, immutable"
BOOK_ID_PATTERN = re.compile(r"^ielts-part-3-book-(\d+)-exercise-\d+$")


def load_python_file(path: Path, module_name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load Python module from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


generator = load_python_file(GENERATOR_PATH, "edmund_part3_audio_r2_upload")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_books(value: str) -> tuple[int, ...]:
    try:
        return generator.parse_book_selection(value)
    except argparse.ArgumentTypeError as error:
        raise argparse.ArgumentTypeError(str(error)) from error


def parse_args() -> argparse.Namespace:
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=repository_root)
    parser.add_argument("--bucket", default="edmund-assets")
    parser.add_argument(
        "--wrangler",
        type=Path,
        default=repository_root / "workers/speaking-system/node_modules/.bin/wrangler",
    )
    parser.add_argument("--books", type=parse_books, default=generator.SUPPORTED_BOOKS)
    parser.add_argument("--jobs", type=int, default=4)
    parser.add_argument("--checkpoint", type=Path)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Validate the manifest and every referenced local MP3 without uploading",
    )
    args = parser.parse_args()
    if args.jobs < 1 or args.jobs > 8:
        parser.error("--jobs must be between 1 and 8")
    return args


def load_checkpoint(path: Path | None) -> dict[str, str]:
    if path is None or not path.is_file():
        return {}
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict) or any(
        not isinstance(key, str)
        or not isinstance(digest, str)
        or not re.fullmatch(r"[0-9a-f]{64}", digest)
        for key, digest in value.items()
    ):
        raise SystemExit("R2 upload checkpoint is invalid")
    return value


def write_checkpoint(path: Path | None, value: dict[str, str]) -> None:
    if path is None:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(
        json.dumps(value, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def validate_manifest(
    source_root: Path,
    selected_books: tuple[int, ...],
) -> list[tuple[str, Path, str]]:
    manifest = generator.load_manifest(source_root / generator.MANIFEST_NAME)
    if manifest is None:
        raise SystemExit("Part 3 audio manifest is missing or unreadable")
    if manifest["meta"].get("complete") is not True:
        raise SystemExit("Part 3 audio manifest is incomplete")
    if manifest["recipeSha256"] != "f3e7bf34b5c6cea2bcfc29921550023abc2c03c66cbdbc16aab2b3cbcb36d9cb":
        raise SystemExit("Part 3 audio recipe SHA-256 is not the approved v2 recipe")

    selected = set(selected_books)
    entries = manifest["entries"]
    audio_hashes = manifest["audioSha256"]
    if set(entries) != set(audio_hashes):
        raise SystemExit("Part 3 manifest entries and MP3 hashes differ")

    validated: list[tuple[str, Path, str]] = []
    for exercise_id in sorted(entries):
        match = BOOK_ID_PATTERN.fullmatch(exercise_id)
        if match is None:
            raise SystemExit(f"Unexpected Part 3 manifest id: {exercise_id}")
        if int(match.group(1)) not in selected:
            continue
        entry = entries[exercise_id]
        relative = str(entry.get("path", ""))
        if (
            not relative.startswith(EXPECTED_PREFIX)
            or not relative.endswith(".mp3")
            or ".." in Path(relative).parts
        ):
            raise SystemExit(f"Unsafe or unexpected Part 3 MP3 path: {relative!r}")
        expected_hash = audio_hashes[exercise_id]
        local_path = source_root / relative
        if not local_path.is_file():
            raise SystemExit(f"Referenced Part 3 MP3 is missing: {local_path}")
        actual_hash = sha256_file(local_path)
        if actual_hash != expected_hash:
            raise SystemExit(f"Part 3 MP3 SHA-256 mismatch: {exercise_id}")
        validated.append((relative, local_path, expected_hash))
    if not validated:
        raise SystemExit("No Part 3 MP3s matched the selected books")
    return validated


def upload_one(
    *,
    wrangler: Path,
    bucket: str,
    relative: str,
    local_path: Path,
) -> str:
    command = [
        str(wrangler),
        "r2",
        "object",
        "put",
        f"{bucket}/{relative}",
        "--file",
        str(local_path),
        "--content-type",
        "audio/mpeg",
        "--cache-control",
        IMMUTABLE_CACHE,
        "--remote",
        "--force",
    ]
    result = subprocess.run(command, text=True, capture_output=True, check=False)
    if result.returncode != 0:
        details = (result.stderr or result.stdout).strip()
        raise RuntimeError(f"R2 upload failed for {relative}: {details}")
    return relative


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    wrangler = args.wrangler.resolve()
    if not wrangler.is_file():
        raise SystemExit(f"Wrangler executable is missing: {wrangler}")
    validated = validate_manifest(source_root, tuple(args.books))
    total_bytes = sum(path.stat().st_size for _, path, _ in validated)
    print(
        f"Part 3 R2 source valid: {len(validated)} MP3s, "
        f"{total_bytes / (1024 * 1024):.1f} MiB."
    )
    if args.check:
        return 0

    checkpoint_path = args.checkpoint.resolve() if args.checkpoint else None
    checkpoint = load_checkpoint(checkpoint_path)
    pending = [
        item for item in validated
        if checkpoint.get(item[0]) != item[2]
    ]
    print(f"Uploading {len(pending)} object(s); {len(validated) - len(pending)} checkpoint hit(s).")
    failures: list[str] = []
    completed = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = {
            pool.submit(
                upload_one,
                wrangler=wrangler,
                bucket=args.bucket,
                relative=relative,
                local_path=local_path,
            ): (relative, expected_hash)
            for relative, local_path, expected_hash in pending
        }
        for future in concurrent.futures.as_completed(futures):
            relative, expected_hash = futures[future]
            try:
                future.result()
            except Exception as error:  # noqa: BLE001 - report every failed object
                failures.append(str(error))
                continue
            checkpoint[relative] = expected_hash
            write_checkpoint(checkpoint_path, checkpoint)
            completed += 1
            if completed == len(pending) or completed % 10 == 0:
                print(f"Uploaded {completed}/{len(pending)} pending object(s).")
    if failures:
        raise SystemExit("\n".join(failures[:10]))
    print(f"R2 upload complete: {len(validated)} selected Part 3 MP3s are checkpointed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
