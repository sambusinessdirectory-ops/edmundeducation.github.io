#!/usr/bin/env python3
"""List retained original DSE Reading page scans for the optional reference view."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOGUE = ROOT / "dse-reading-catalogue.json"
SCANS = ROOT / "assets/reading-comprehension/dse/papers"
OUTPUT = ROOT / "dse-reading-paper-scans.json"


def sort_key(path: Path) -> tuple[int, int]:
    kind, number = path.stem.split("-", 1)
    return (0 if kind == "passage" else 1, int(number))


def build() -> dict[str, list[dict[str, str | int]]]:
    catalogue = json.loads(CATALOGUE.read_text())
    papers = {}
    for year in catalogue["years"]:
        for section, entry in year["sections"].items():
            if not entry:
                continue
            folder = SCANS / str(year["year"]) / section.lower()
            pages = []
            for path in sorted(folder.glob("*.webp"), key=sort_key):
                kind, number = path.stem.split("-", 1)
                pages.append({"kind": kind, "number": int(number), "src": path.relative_to(ROOT).as_posix()})
            papers[entry["id"]] = pages
    return papers


if __name__ == "__main__":
    OUTPUT.write_text(json.dumps(build(), ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
