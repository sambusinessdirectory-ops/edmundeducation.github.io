#!/usr/bin/env python3
"""Build the deterministic Passage 3 analysis import manifest.

PDF filenames are matched to the canonical Passage 3 catalogue titles after
normalising punctuation and known source-filename variants. Every match must
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
OUTPUT_PATH = ROOT / "tools/ielts-reading-analysis-p3-import-manifest.json"
PREFIX = "Question Analysis Website Free Resource - Passage 3 -"
EXCLUDED_FILENAMES = {
    # These three older PDFs were already in Downloads but were not attached
    # to the user's 2026-08-22 Passage 3 request.
    f"{PREFIX}The value of research into mite harvestmen.pdf",
    f"{PREFIX}The Ecological Importance of Bees.pdf",
    f"{PREFIX}Science and the Stradivarius_Uncovering the secret of quality.pdf",
}
TYPO_NORMALISATIONS: dict[str, str] = {
    # The canonical title PDF/index has "Heat"; the supplied source filename
    # uses the grammatically correct passage title "Heals".
    "heals": "heat",
}
SOURCE_OVERRIDES: dict[str, dict[str, object]] = {
    # This source begins with the answer key and worked questions; it does not
    # contain a paragraph roadmap, so the website must not invent one.
    "p3-015": {"overviewUnavailable": True},
    # This supplied PDF contains the complete Q27-Q40 worked analysis, but its
    # introductory answer-key page is absent. Recover the key only from each
    # question's explicit authored 答案 line and still require contiguous Q27-Q40.
    "p3-128": {"deriveAnswerKey": True},
    # The answer table lists Paragraph B/D/E/F/G before the numbered rows.
    # Paragraph F is an authored note about a missing heading option, while
    # the four actual Q27-Q30 answers are B=v, D=ii, E=iii and G=viii.
    "p3-157": {"answerKeyPrefix": ["v", "ii", "iii", "viii"]},
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


def load_passage_three_catalogue() -> list[dict[str, object]]:
    source = INDEX_PATH.read_text(encoding="utf-8")
    match = re.search(r"Object\.freeze\((.*)\);\s*$", source, re.DOTALL)
    if match is None:
        raise ValueError(f"Unable to parse {INDEX_PATH.name}")
    payload = json.loads(match.group(1))
    return payload["passages"]["3"]


def build_manifest(source_dir: Path) -> dict[str, object]:
    files = sorted(
        (
            path
            for path in source_dir.glob(f"{PREFIX}*.pdf")
            if path.name not in EXCLUDED_FILENAMES
        ),
        key=lambda path: path.name.casefold(),
    )
    if len(files) != 157:
        raise ValueError(f"Expected 157 supplied Passage 3 analysis PDFs, found {len(files)}")

    catalogue_by_title: dict[str, list[dict[str, object]]] = defaultdict(list)
    for record in load_passage_three_catalogue():
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
        "version": "2026-08-22.1",
        "passage": 3,
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
