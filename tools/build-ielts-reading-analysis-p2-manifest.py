#!/usr/bin/env python3
"""Build the deterministic Passage 2 analysis import manifest.

PDF filenames are matched to the canonical Passage 2 catalogue titles after
normalising punctuation and three known source-filename typos. Every match must
be exact and one-to-one after normalisation; the script deliberately refuses a
fuzzy or ambiguous match.
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "ielts-reading-analysis-index.js"
OUTPUT_PATH = ROOT / "tools/ielts-reading-analysis-p2-import-manifest.json"
PREFIX = "Question Analysis Website Free Resource - Passage 2 - "
TYPO_NORMALISATIONS = {
    "patients": "patience",
    "craves": "caves",
    "usy": "us",
}
SOURCE_OVERRIDES = {
    # The supplied PDF appends a second, unrelated IELTS analysis after the
    # complete False Belief analysis. Stop at the final authored answer line.
    "p2-052": {"truncateAfterLine": "所以答案是 challenging。"},
}


def normalise_title(value: str) -> str:
    ascii_value = (
        unicodedata.normalize("NFKD", value)
        .encode("ascii", "ignore")
        .decode("ascii")
        .lower()
    )
    words = re.sub(r"[^a-z0-9]+", " ", ascii_value).strip().split()
    return " ".join(TYPO_NORMALISATIONS.get(word, word) for word in words)


def load_passage_two_catalogue() -> list[dict[str, object]]:
    source = INDEX_PATH.read_text(encoding="utf-8")
    match = re.search(r"Object\.freeze\((.*)\);\s*$", source, re.DOTALL)
    if match is None:
        raise ValueError(f"Unable to parse {INDEX_PATH.name}")
    payload = json.loads(match.group(1))
    return payload["passages"]["2"]


def build_manifest(source_dir: Path) -> dict[str, object]:
    files = sorted(source_dir.glob(f"{PREFIX}*.pdf"), key=lambda path: path.name.casefold())
    if len(files) != 139:
        raise ValueError(f"Expected 139 Passage 2 analysis PDFs, found {len(files)}")

    catalogue_by_title: dict[str, list[dict[str, object]]] = defaultdict(list)
    for record in load_passage_two_catalogue():
        catalogue_by_title[normalise_title(str(record["title"]))].append(record)

    sources: list[dict[str, object]] = []
    used_catalogue_ids: set[str] = set()
    for path in files:
        source_title = path.name[len(PREFIX) : -len(".pdf")]
        candidates = catalogue_by_title[normalise_title(source_title)]
        if not candidates:
            raise ValueError(
                f"{path.name}: no exact canonical title match after normalisation"
            )
        catalogue_ids = [str(record["id"]) for record in candidates]
        duplicate_ids = used_catalogue_ids.intersection(catalogue_ids)
        if duplicate_ids:
            raise ValueError(f"Duplicate catalogue mapping: {sorted(duplicate_ids)}")
        used_catalogue_ids.update(catalogue_ids)
        source: dict[str, object] = {
            "catalogueIds": catalogue_ids,
            "title": candidates[0]["title"],
            "filename": path.name,
        }
        source.update(SOURCE_OVERRIDES.get(catalogue_ids[0], {}))
        sources.append(source)

    sources.sort(key=lambda source: int(str(source["catalogueIds"][0]).split("-")[1]))
    return {
        "version": "2026-08-20.1",
        "passage": 2,
        "sourceDirectoryHint": str(source_dir),
        "sources": sources,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, default=Path.home() / "Downloads")
    parser.add_argument("--check", action="store_true", help="Validate without writing")
    args = parser.parse_args()

    manifest = build_manifest(args.source_dir.expanduser())
    if not args.check:
        OUTPUT_PATH.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    print(json.dumps({
        "sourceCount": len(manifest["sources"]),
        "firstCatalogueId": manifest["sources"][0]["catalogueIds"][0],
        "lastCatalogueId": manifest["sources"][-1]["catalogueIds"][0],
        "write": not args.check,
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
