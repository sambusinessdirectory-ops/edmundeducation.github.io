#!/usr/bin/env python3
"""Merge independently generated Part 1 audio shards into one strict manifest."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import shutil
from pathlib import Path
from types import ModuleType
from typing import Any


TOOLS_DIR = Path(__file__).resolve().parent
GENERATOR_PATH = TOOLS_DIR / "generate-speaking-part1-audio.py"


def load_python_file(path: Path, module_name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load Python module from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


generator = load_python_file(GENERATOR_PATH, "edmund_part1_audio_merge")


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
    parser.add_argument("--check", action="store_true")
    return parser.parse_args()


def validate_complete_library(
    exercises: dict[str, dict[str, Any]],
    output_root: Path,
) -> None:
    sf = generator.shared.load_soundfile_dependency()
    manifest_path = output_root / generator.MANIFEST_NAME
    manifest = generator.load_manifest(manifest_path)
    if manifest is None:
        raise SystemExit("Merged Part 1 manifest is missing or unreadable")
    expected_content = generator.manifest_content(
        exercises,
        manifest["entries"],
        manifest["audioSha256"],
        complete=True,
    )
    if manifest["source"] != expected_content:
        raise SystemExit("Merged Part 1 manifest is stale or incomplete")
    for exercise_id, exercise in exercises.items():
        entry = manifest["entries"].get(exercise_id)
        error = generator.entry_validation_error(entry, exercise_id, exercise)
        if error:
            raise SystemExit(f"Invalid merged Part 1 entry {exercise_id}: {error}")
        audio_path = output_root / str(entry["path"])
        if not audio_path.is_file():
            raise SystemExit(f"Merged Part 1 MP3 is missing: {exercise_id}")
        audio_error = generator.shared.audio_validation_error(
            audio_path,
            sf,
            expected_sha256=manifest["audioSha256"].get(exercise_id),
            expected_duration=entry.get("duration"),
        )
        if audio_error:
            raise SystemExit(f"Invalid merged Part 1 MP3 {exercise_id}: {audio_error}")


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    output_root = args.output_root.resolve()
    shard_roots = [path.resolve() for path in args.shard_root]
    generator.SELECTED_BOOKS = generator.SUPPORTED_BOOKS
    exercises = generator.load_exercises(source_root)

    if args.check:
        validate_complete_library(exercises, output_root)
        print(f"Merged Part 1 library valid: {len(exercises)} modules.")
        return 0
    if not shard_roots:
        raise SystemExit("At least one --shard-root is required")

    sf = generator.shared.load_soundfile_dependency()
    entries: dict[str, dict[str, Any]] = {}
    audio_hashes: dict[str, str] = {}
    entry_roots: dict[str, Path] = {}
    for root in shard_roots:
        manifest = generator.load_manifest(root / generator.MANIFEST_NAME)
        if manifest is None:
            raise SystemExit(f"Part 1 shard manifest is missing or unreadable: {root}")
        if manifest["meta"].get("complete") is not True:
            raise SystemExit(f"Part 1 shard is incomplete: {root}")
        if (
            manifest["meta"].get("count") != len(manifest["entries"])
            or manifest["meta"].get("expectedCount") != len(manifest["entries"])
        ):
            raise SystemExit(f"Part 1 shard count metadata is inconsistent: {root}")
        if manifest["recipeSha256"] != generator.recipe_sha256():
            raise SystemExit(f"Part 1 shard uses a different audio recipe: {root}")
        if (
            manifest["meta"].get("spokenOverrideCount") != len(generator.PART1_SPOKEN_OVERRIDES)
            or manifest["meta"].get("spokenOverridesSha256") != generator.spoken_overrides_sha256()
        ):
            raise SystemExit(f"Part 1 shard uses a different spoken-override map: {root}")
        for exercise_id, entry in manifest["entries"].items():
            audio_hash = manifest["audioSha256"].get(exercise_id)
            if exercise_id in entries:
                if entries[exercise_id] != entry or audio_hashes[exercise_id] != audio_hash:
                    raise SystemExit(f"Conflicting duplicate Part 1 entry: {exercise_id}")
                continue
            if not isinstance(audio_hash, str):
                raise SystemExit(f"Part 1 shard is missing an MP3 hash: {exercise_id}")
            entries[exercise_id] = entry
            audio_hashes[exercise_id] = audio_hash
            entry_roots[exercise_id] = root

    expected_ids = set(exercises)
    if set(entries) != expected_ids or set(audio_hashes) != expected_ids:
        missing = sorted(expected_ids - set(entries))
        extra = sorted(set(entries) - expected_ids)
        raise SystemExit(
            f"Part 1 shards do not cover the corpus; missing={missing[:5]}, extra={extra[:5]}"
        )

    copied = 0
    for exercise_id, exercise in exercises.items():
        entry = entries[exercise_id]
        error = generator.entry_validation_error(entry, exercise_id, exercise)
        if error:
            raise SystemExit(f"Invalid Part 1 shard entry {exercise_id}: {error}")
        relative_path = Path(str(entry["path"]))
        source_path = entry_roots[exercise_id] / relative_path
        if not source_path.is_file():
            raise SystemExit(f"Part 1 shard MP3 is missing: {source_path}")
        audio_error = generator.shared.audio_validation_error(
            source_path,
            sf,
            expected_sha256=audio_hashes[exercise_id],
            expected_duration=entry.get("duration"),
        )
        if audio_error:
            raise SystemExit(f"Invalid Part 1 shard MP3 {exercise_id}: {audio_error}")
        output_path = output_root / relative_path
        if output_path.is_file():
            if sha256_file(output_path) != audio_hashes[exercise_id]:
                raise SystemExit(f"Existing Part 1 MP3 conflicts with shard: {exercise_id}")
            continue
        output_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, output_path)
        copied += 1

    write_atomic(
        output_root / generator.MANIFEST_NAME,
        generator.manifest_content(exercises, entries, audio_hashes, complete=True),
    )
    validate_complete_library(exercises, output_root)
    print(
        f"Merged {len(entries)} Part 1 entries; copied {copied} MP3 files into the final library."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
