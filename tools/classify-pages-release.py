#!/usr/bin/env python3
"""Choose the smallest safe Pages builder for an undeployed path set."""

from __future__ import annotations

import argparse
from pathlib import PurePosixPath


SITE_FILES = {"index.html"}
SITE_PREFIXES = ("homepage-",)
SITE_SUFFIXES = (".webp", ".png", ".jpg", ".jpeg")

PAPER3_FILES = {
    ".github/workflows/pages-paper3-fast.yml",
    "tools/add-paper3-study-support.py",
    "tools/build-2023-b2-reader.py",
    "tools/check-2023-b2-entry.cjs",
    "tools/check-2023-b2-v7.cjs",
    "tools/classify-pages-release.py",
    "tools/manuals/build-paper3-super-curation-golden-manual-v7.py",
    "tools/test-classify-pages-release.py",
    "tools/validate-2023-b2-verbatim.mjs",
}
PAPER3_PREFIXES = ("paper3/", "tools/paper3/")


def safe_path(value: str) -> str:
    path = PurePosixPath(value)
    if not value or path.is_absolute() or ".." in path.parts:
        raise ValueError(f"Unsafe changed path: {value}")
    return value


def is_site_only(path: str) -> bool:
    return path in SITE_FILES or (
        path.startswith(SITE_PREFIXES) and path.lower().endswith(SITE_SUFFIXES)
    )


def is_paper3_only(path: str) -> bool:
    return path in PAPER3_FILES or path.startswith(PAPER3_PREFIXES)


def classify(paths: list[str]) -> str:
    checked = [safe_path(path) for path in paths]
    if not checked:
        return "none"
    if all(is_site_only(path) for path in checked):
        return "site"
    if any(path.startswith("paper3/") for path in checked) and all(
        is_paper3_only(path) for path in checked
    ):
        return "paper3"
    return "standard"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths_file", type=argparse.FileType("r", encoding="utf-8"))
    args = parser.parse_args()
    paths = [line.rstrip("\n") for line in args.paths_file if line.rstrip("\n")]
    print(classify(paths))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
