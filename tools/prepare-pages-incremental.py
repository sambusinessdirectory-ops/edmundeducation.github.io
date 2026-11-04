#!/usr/bin/env python3
"""Classify and apply a Pages artifact delta against the deployed snapshot."""

from __future__ import annotations

import argparse
import shutil
import stat
import subprocess
from pathlib import Path, PurePosixPath


ALWAYS_FULL = {
    ".gitmodules",
    "ielts-reading-analysis-availability.js",
    "paper3/reader-batch.zip",
    "ielts-reading-analysis-loader.mjs",
    "tools/add-paper3-study-support.py",
    "tools/ielts-reading-analysis-publication-excludes.mjs",
}
ALWAYS_FULL_PREFIXES = (
    "ielts-reading-analysis-data/",
)
R2_INDEX_PREFIX = "workers/edmund-site-assets/src/"
R2_INDEX_SUFFIX = "-index-v1.json"
MAX_INCREMENTAL_FILES = 5000
PWA_FILES = ("service-worker.js", "pwa-register.js", "release.json")


def changed_entries(base: str, target: str) -> list[tuple[str, list[str]]]:
    output = subprocess.check_output(
        ["git", "diff", "--name-status", "-z", "--find-renames", base, target]
    )
    fields = output.decode("utf-8", errors="surrogateescape").split("\0")
    entries: list[tuple[str, list[str]]] = []
    index = 0
    while index < len(fields) and fields[index]:
        status_code = fields[index]
        index += 1
        path_count = 2 if status_code.startswith(("R", "C")) else 1
        paths = fields[index:index + path_count]
        if len(paths) != path_count:
            raise RuntimeError("Incomplete git diff entry")
        index += path_count
        entries.append((status_code, paths))
    return entries


def requires_full(path: str) -> bool:
    return (
        path in ALWAYS_FULL
        or path.startswith(ALWAYS_FULL_PREFIXES)
        or (
            path.startswith(R2_INDEX_PREFIX)
            and path.endswith(R2_INDEX_SUFFIX)
        )
    )


def is_publishable(path: str) -> bool:
    item = PurePosixPath(path)
    parts = item.parts
    if not parts or item.is_absolute() or ".." in parts:
        raise RuntimeError(f"Unsafe repository path: {path}")
    if path in {
        ".DS_Store",
        "song-appreciation-data.js",
        "news-discussion/news-1.json",
        "dse-argument-bank/source.md",
        "natural-english/imported-lessons.json",
        "natural-english/IMPORT-REVIEW.md",
        "natural-english/audio/imported-metadata.json",
    }:
        return False
    if item.suffix == ".sql":
        return False
    if len(parts) == 2 and parts[0] == "dse-argument-bank" and parts[1].endswith("-source.md"):
        return False
    excluded_roots = {
        ".git",
        ".github",
        "_site",
        "assets",
        "course-materials",
        "supabase",
        "tools",
        "workers",
    }
    if parts[0] in excluded_roots:
        return False
    if len(parts) >= 2 and parts[0] == "eddy-carrot-patch" and parts[1] == "assets":
        return False
    if len(parts) >= 2 and parts[0] == "synonyms" and parts[1] == "source":
        return False
    return True


def classify(base: str, target: str) -> str:
    entries = changed_entries(base, target)
    paths = [path for _, entry_paths in entries for path in entry_paths]
    if len(paths) > MAX_INCREMENTAL_FILES:
        return "full"
    return "full" if any(requires_full(path) for path in paths) else "incremental"


def remove_path(path: Path) -> None:
    if path.is_symlink() or path.is_file():
        path.unlink(missing_ok=True)
    elif path.is_dir():
        shutil.rmtree(path)


def copy_public_file(source_root: Path, site_root: Path, relative: str) -> bool:
    if not is_publishable(relative):
        return False
    source = source_root / relative
    destination = site_root / relative
    if not source.exists():
        remove_path(destination)
        return False
    mode = source.lstat().st_mode
    if not stat.S_ISREG(mode):
        raise RuntimeError(f"Pages delta only supports regular files: {relative}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    return True


def apply_delta(source_root: Path, site_root: Path, base: str, target: str, paths_file: Path) -> None:
    rewritten: set[str] = set()
    for status_code, paths in changed_entries(base, target):
        if status_code.startswith("R"):
            old_path, new_path = paths
            if is_publishable(old_path):
                remove_path(site_root / old_path)
            if copy_public_file(source_root, site_root, new_path):
                rewritten.add(new_path)
            continue
        path = paths[0]
        if status_code.startswith("D"):
            if is_publishable(path):
                remove_path(site_root / path)
            continue
        if copy_public_file(source_root, site_root, path):
            rewritten.add(path)

    for relative in PWA_FILES:
        # The snapshot already contains verified, rewritten asset URLs. Undo
        # only its release stamp so the normal stamping step can run again.
        published = site_root / relative
        if relative not in rewritten and published.is_file():
            content = published.read_text(encoding="utf-8")
            if base in content:
                published.write_text(content.replace(base, "__EDMUND_RELEASE__"), encoding="utf-8")
                continue
        if not copy_public_file(source_root, site_root, relative):
            raise RuntimeError(f"Missing required PWA source file: {relative}")
        rewritten.add(relative)

    paths_file.write_text("".join(f"{path}\n" for path in sorted(rewritten)), encoding="utf-8")
    print(f"Applied {len(rewritten)} public files from {base[:9]}..{target[:9]}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    classify_parser = subparsers.add_parser("classify")
    classify_parser.add_argument("--base", required=True)
    classify_parser.add_argument("--target", required=True)

    apply_parser = subparsers.add_parser("apply")
    apply_parser.add_argument("--source", type=Path, required=True)
    apply_parser.add_argument("--site", type=Path, required=True)
    apply_parser.add_argument("--base", required=True)
    apply_parser.add_argument("--target", required=True)
    apply_parser.add_argument("--paths-file", type=Path, required=True)

    args = parser.parse_args()
    if args.command == "classify":
        print(classify(args.base, args.target))
        return 0
    apply_delta(args.source, args.site, args.base, args.target, args.paths_file)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
