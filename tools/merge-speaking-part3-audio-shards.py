#!/usr/bin/env python3
"""Merge independently generated Part 3 audio shards into one strict manifest."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import shutil
from pathlib import Path
from types import ModuleType
from typing import Any


TOOLS_DIR = Path(__file__).resolve().parent
GENERATOR_PATH = TOOLS_DIR / "generate-speaking-part3-audio.py"


def load_python_file(path: Path, module_name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load Python module from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


generator = load_python_file(GENERATOR_PATH, "edmund_part3_audio_merge")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_atomic(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.merge.tmp")
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--shard-root", type=Path, action="append", default=[])
    parser.add_argument(
        "--check",
        action="store_true",
        help="Validate the already merged manifest and audio without writing",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    output_root = args.output_root.resolve()
    shard_roots = [path.resolve() for path in args.shard_root]
    generator.install_part3_configuration()
    generator.SELECTED_BOOKS = generator.SUPPORTED_BOOKS
    exercises = generator.load_exercises(source_root)
    final_manifest_path = output_root / generator.MANIFEST_NAME

    if args.check:
        manifest = generator.load_manifest(final_manifest_path)
        if manifest is None:
            raise SystemExit("Merged Part 3 manifest is missing or unreadable")
        expected_content = generator.manifest_content(
            exercises,
            manifest["entries"],
            manifest["audioSha256"],
            complete=True,
        )
        if manifest["source"] != expected_content:
            raise SystemExit("Merged Part 3 manifest is stale or incomplete")
        print(f"Merged Part 3 manifest valid: {len(exercises)} exercises.")
        return 0

    roots = [output_root, *shard_roots]
    entries: dict[str, dict[str, Any]] = {}
    audio_hashes: dict[str, str] = {}
    entry_roots: dict[str, Path] = {}
    for root in roots:
        manifest = generator.load_manifest(root / generator.MANIFEST_NAME)
        if manifest is None:
            raise SystemExit(f"Part 3 shard manifest is missing or unreadable: {root}")
        if manifest["recipeSha256"] != generator.shared.recipe_sha256():
            raise SystemExit(f"Part 3 shard uses a different audio recipe: {root}")
        for exercise_id, entry in manifest["entries"].items():
            audio_hash = manifest["audioSha256"].get(exercise_id)
            if exercise_id in entries:
                if entries[exercise_id] != entry or audio_hashes[exercise_id] != audio_hash:
                    raise SystemExit(f"Conflicting duplicate Part 3 entry: {exercise_id}")
                continue
            if not isinstance(audio_hash, str):
                raise SystemExit(f"Part 3 shard is missing an MP3 hash: {exercise_id}")
            entries[exercise_id] = entry
            audio_hashes[exercise_id] = audio_hash
            entry_roots[exercise_id] = root

    expected_ids = set(exercises)
    if set(entries) != expected_ids or set(audio_hashes) != expected_ids:
        missing = sorted(expected_ids - set(entries))
        extra = sorted(set(entries) - expected_ids)
        raise SystemExit(
            f"Part 3 shards do not cover the corpus; missing={missing[:5]}, extra={extra[:5]}"
        )

    copied = 0
    for exercise_id, exercise in exercises.items():
        entry = entries[exercise_id]
        entry_error = generator.shared.entry_validation_error(entry, exercise_id, exercise)
        if entry_error:
            raise SystemExit(f"Invalid Part 3 shard entry {exercise_id}: {entry_error}")
        relative_path = Path(str(entry["path"]))
        source_path = entry_roots[exercise_id] / relative_path
        if not source_path.is_file():
            raise SystemExit(f"Part 3 shard MP3 is missing: {source_path}")
        if sha256_file(source_path) != audio_hashes[exercise_id]:
            raise SystemExit(f"Part 3 shard MP3 hash mismatch: {exercise_id}")
        output_path = output_root / relative_path
        if output_path.is_file():
            if sha256_file(output_path) != audio_hashes[exercise_id]:
                raise SystemExit(f"Existing Part 3 MP3 conflicts with shard: {exercise_id}")
            continue
        output_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, output_path)
        copied += 1

    write_atomic(
        final_manifest_path,
        generator.manifest_content(exercises, entries, audio_hashes, complete=True),
    )
    print(
        f"Merged {len(entries)} Part 3 entries; copied {copied} MP3 files into the final library."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
