#!/usr/bin/env python3
"""Reject a Pages artifact that cannot load its advertised Flash Cards decks."""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from urllib.parse import urlsplit


SCRIPT_REFERENCE = re.compile(r"flashcards-[A-Za-z0-9-]+\.js(?:\?[^\"'`<>)\s]+)?")
ALWAYS_REQUIRED = {
    "flashcards-data-catalog.js",
    "flashcards-ielts-reading-index.js",
    "flashcards-audio-manifest.js",
    "flashcards-dse-writing-part-b-audio.js",
    "flashcards-core-data.js",
}


def referenced_scripts(site: Path) -> set[str]:
    references: set[str] = set()
    for name in ("flashcards.html", "flashcards-data-catalog.js"):
        path = site / name
        if not path.is_file():
            raise ValueError(f"Missing Flash Cards runtime entry point: {name}")
        for match in SCRIPT_REFERENCE.findall(path.read_text(encoding="utf-8")):
            references.add(urlsplit(match).path)
    return references


def expected_runtime_files(source: Path, site: Path) -> set[str]:
    expected = set(ALWAYS_REQUIRED)
    expected.update(path.name for path in source.glob("flashcards-*-data.js") if path.is_file())
    expected.update(referenced_scripts(site))
    expected.update(
        path.relative_to(source).as_posix()
        for path in (source / "edmund-coins").glob("*.webp")
        if path.is_file()
    )
    return expected


def verify(site: Path, source: Path) -> list[str]:
    expected = expected_runtime_files(source.resolve(), site.resolve())
    missing = sorted(
        relative
        for relative in expected
        if not (site / relative).is_file() or (site / relative).stat().st_size == 0
    )
    if missing:
        details = "\n".join(f"  - {relative}" for relative in missing)
        raise ValueError(f"Pages artifact is missing Flash Cards runtime files:\n{details}")
    return sorted(expected)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", type=Path)
    parser.add_argument("--source", type=Path, default=Path("."))
    args = parser.parse_args()
    checked = verify(args.site, args.source)
    print(f"Verified {len(checked)} Flash Cards runtime files in the Pages artifact")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
