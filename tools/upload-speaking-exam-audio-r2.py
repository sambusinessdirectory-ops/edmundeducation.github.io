#!/usr/bin/env python3
"""Validate and upload manifest-referenced Speaking Exam Mode MP3s to R2."""

from __future__ import annotations

import argparse
import concurrent.futures
import importlib.util
import json
import re
import subprocess
from pathlib import Path
from types import ModuleType


TOOLS_DIR = Path(__file__).resolve().parent
GENERATOR_PATH = TOOLS_DIR / "generate-speaking-exam-audio.py"
IMMUTABLE_CACHE = "public, max-age=31536000, immutable"
APPROVED_RECIPE_SHA256 = "d6be09beb506f2a7869e8fee1534f4fad2bac06eecdffc5c6ec9d9114e488923"


def load_python_file(path: Path, module_name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load Python module from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


generator = load_python_file(GENERATOR_PATH, "edmund_exam_audio_r2_upload")


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
        raise SystemExit("Exam-audio R2 checkpoint is invalid")
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
    audio_root: Path,
) -> list[tuple[str, Path, str]]:
    if generator.recipe_sha256() != APPROVED_RECIPE_SHA256:
        raise SystemExit(
            "Exam-audio generator recipe changed; approve a new immutable release first"
        )
    sf = generator.load_soundfile_dependency()
    corpus, _, manifest = generator.validate_complete_manifest(
        source_root,
        audio_root,
        sf,
    )
    if manifest["recipeSha256"] != APPROVED_RECIPE_SHA256:
        raise SystemExit("Exam-audio manifest does not use the approved v1 recipe")
    entries = manifest["entries"]
    hashes = manifest["audioSha256"]
    if set(entries) != set(corpus) or set(hashes) != set(corpus):
        raise SystemExit("Exam-audio manifest does not cover the exact source corpus")

    expected_prefix = f"{generator.STATIC_AUDIO_ROOT}/"
    validated: list[tuple[str, Path, str]] = []
    seen_paths: set[str] = set()
    for source_key in sorted(corpus):
        entry = entries[source_key]
        relative = str(entry.get("path", ""))
        if (
            not relative.startswith(expected_prefix)
            or not relative.endswith(".mp3")
            or ".." in Path(relative).parts
            or relative in seen_paths
        ):
            raise SystemExit(f"Unsafe or duplicate Exam Mode MP3 path: {relative!r}")
        seen_paths.add(relative)
        local_path = audio_root / relative
        expected_hash = hashes[source_key]
        validated.append((relative, local_path, expected_hash))
    if not validated:
        raise SystemExit("Exam-audio manifest references no MP3s")
    return validated


def upload_one(
    *,
    wrangler: Path,
    bucket: str,
    relative: str,
    local_path: Path,
) -> str:
    result = subprocess.run(
        [
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
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        details = (result.stderr or result.stdout).strip()
        raise RuntimeError(f"R2 upload failed for {relative}: {details}")
    return relative


def parse_args() -> argparse.Namespace:
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=repository_root)
    parser.add_argument(
        "--audio-root",
        type=Path,
        help=(
            "Root containing speaking-exam-audio-manifest.js and the generated "
            "MP3 tree (default: --source-root)"
        ),
    )
    parser.add_argument("--bucket", default="edmund-assets")
    parser.add_argument(
        "--wrangler",
        type=Path,
        default=repository_root / "workers/speaking-system/node_modules/.bin/wrangler",
    )
    parser.add_argument("--jobs", type=int, default=4)
    parser.add_argument("--checkpoint", type=Path)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Decode and validate every manifest-referenced MP3 without uploading",
    )
    args = parser.parse_args()
    if not 1 <= args.jobs <= 8:
        parser.error("--jobs must be between 1 and 8")
    return args


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    audio_root = args.audio_root.resolve() if args.audio_root else source_root
    validated = validate_manifest(source_root, audio_root)
    total_bytes = sum(path.stat().st_size for _, path, _ in validated)
    print(
        f"Exam Mode R2 source valid: {len(validated)} MP3s, "
        f"{total_bytes / (1024 * 1024):.1f} MiB."
    )
    if args.check:
        return 0

    wrangler = args.wrangler.resolve()
    if not wrangler.is_file():
        raise SystemExit(f"Wrangler executable is missing: {wrangler}")
    checkpoint_path = args.checkpoint.resolve() if args.checkpoint else None
    checkpoint = load_checkpoint(checkpoint_path)
    pending = [
        item for item in validated if checkpoint.get(item[0]) != item[2]
    ]
    print(
        f"Uploading {len(pending)} object(s); "
        f"{len(validated) - len(pending)} checkpoint hit(s)."
    )
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
            except Exception as error:  # noqa: BLE001 - collect every object failure
                failures.append(str(error))
                continue
            checkpoint[relative] = expected_hash
            write_checkpoint(checkpoint_path, checkpoint)
            completed += 1
            if completed == len(pending) or completed % 25 == 0:
                print(f"Uploaded {completed}/{len(pending)} pending object(s).")
    if failures:
        raise SystemExit("\n".join(failures[:10]))
    print(f"R2 upload complete: {len(validated)} Exam Mode MP3s are checkpointed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
