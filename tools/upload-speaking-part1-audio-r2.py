#!/usr/bin/env python3
"""Validate and upload the referenced IELTS Part 1 MP3s to Cloudflare R2."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import subprocess
from pathlib import Path
from types import ModuleType


TOOLS_DIR = Path(__file__).resolve().parent
GENERATOR_PATH = TOOLS_DIR / "generate-speaking-part1-audio.py"
EXPECTED_PREFIX = "assets/speaking-system/audio/edmund-neural/part1/"
IMMUTABLE_CACHE = "public, max-age=31536000, immutable"
APPROVED_RECIPE_SHA256 = "683ba2bb6e32f680cb9d2f55f7e4b86cba3f35bfe515f25f8a18c142cb18a011"


def load_python_file(path: Path, module_name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load Python module from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


generator = load_python_file(GENERATOR_PATH, "edmund_part1_audio_r2_upload")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


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
        raise SystemExit("Part 1 R2 checkpoint is invalid")
    return value


def write_checkpoint(path: Path | None, value: dict[str, str]) -> None:
    if path is None:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(path)


def validate_manifest(source_root: Path) -> list[tuple[str, Path, str]]:
    manifest = generator.load_manifest(source_root / generator.MANIFEST_NAME)
    if manifest is None or manifest["meta"].get("complete") is not True:
        raise SystemExit("Part 1 audio manifest is missing or incomplete")
    if generator.recipe_sha256() != APPROVED_RECIPE_SHA256:
        raise SystemExit("Part 1 generator recipe has changed; approve and pin the new release first")
    if manifest["recipeSha256"] != APPROVED_RECIPE_SHA256:
        raise SystemExit("Part 1 audio recipe SHA-256 is not approved")
    entries = manifest["entries"]
    hashes = manifest["audioSha256"]
    if set(entries) != set(hashes) or set(entries) != {generator.stable_module_id()}:
        raise SystemExit("Part 1 manifest does not contain exactly the Accommodation module")
    validated: list[tuple[str, Path, str]] = []
    for exercise_id, entry in entries.items():
        relative = str(entry.get("path", ""))
        if not relative.startswith(EXPECTED_PREFIX) or not relative.endswith(".mp3") or ".." in Path(relative).parts:
            raise SystemExit(f"Unsafe Part 1 MP3 path: {relative!r}")
        local_path = source_root / relative
        expected_hash = hashes[exercise_id]
        if not local_path.is_file() or sha256_file(local_path) != expected_hash:
            raise SystemExit(f"Part 1 MP3 SHA-256 mismatch: {exercise_id}")
        validated.append((relative, local_path, expected_hash))
    return validated


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
    parser.add_argument("--checkpoint", type=Path)
    parser.add_argument("--check", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    validated = validate_manifest(source_root)
    total_bytes = sum(path.stat().st_size for _, path, _ in validated)
    print(f"Part 1 R2 source valid: {len(validated)} MP3, {total_bytes / (1024 * 1024):.1f} MiB.")
    if args.check:
        return 0
    wrangler = args.wrangler.resolve()
    if not wrangler.is_file():
        raise SystemExit(f"Wrangler executable is missing: {wrangler}")
    checkpoint_path = args.checkpoint.resolve() if args.checkpoint else None
    checkpoint = load_checkpoint(checkpoint_path)
    for relative, local_path, expected_hash in validated:
        if checkpoint.get(relative) == expected_hash:
            print("R2 upload checkpoint hit.")
            continue
        result = subprocess.run([
            str(wrangler), "r2", "object", "put", f"{args.bucket}/{relative}",
            "--file", str(local_path),
            "--content-type", "audio/mpeg",
            "--cache-control", IMMUTABLE_CACHE,
            "--remote", "--force",
        ], text=True, capture_output=True, check=False)
        if result.returncode != 0:
            raise SystemExit((result.stderr or result.stdout).strip())
        checkpoint[relative] = expected_hash
        write_checkpoint(checkpoint_path, checkpoint)
        print(f"Uploaded {relative}")
    print("Part 1 R2 upload complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
