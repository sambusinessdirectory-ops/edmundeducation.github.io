#!/usr/bin/env python3
"""Build the IELTS Reading manifests, Worker catalog, and page-one thumbnails."""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
import zlib
from pathlib import Path


R2_PREFIX = "IELTS Reading"
EXPECTED_NUMBERS = {
    1: set(range(1, 165)) - {33},
    2: set(range(24, 175)) - {49, 55},
    3: set(range(2, 176)) - {10, 11, 12, 13, 18, 21, 24, 25, 26},
}
FILENAME_PATTERN = re.compile(
    r"Practice\s+(\d+)\s*-?\s*IETLS 閱讀練習\s*-\s*Passage\s+([123])\.pdf",
    flags=re.IGNORECASE,
)


def classify(filename: str) -> tuple[int, int]:
    match = FILENAME_PATTERN.fullmatch(filename)
    if not match:
        raise ValueError(f"Unrecognised IELTS Reading filename: {filename}")
    return int(match.group(2)), int(match.group(1))


def load_titles(path: Path) -> dict[tuple[int, int], str]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    titles: dict[tuple[int, int], str] = {}

    if all(str(key).startswith("passage-") for key in raw):
        for passage_key, rows in raw.items():
            passage = int(str(passage_key).removeprefix("passage-"))
            for number, title in rows.items():
                titles[(passage, int(number))] = str(title).strip()
    elif all(str(key).isdigit() and isinstance(rows, dict) for key, rows in raw.items()):
        for passage_key, rows in raw.items():
            passage = int(passage_key)
            for number, title in rows.items():
                titles[(passage, int(number))] = str(title).strip()
    else:
        for composite, title in raw.items():
            passage, number = (int(value) for value in str(composite).split(":", 1))
            titles[(passage, number)] = str(title).strip()

    blank = sorted(key for key, title in titles.items() if not title)
    if blank:
        raise ValueError(f"Blank IELTS Reading titles: {blank}")
    return titles


def page_count(pdf: Path, pdfinfo: str) -> int:
    result = subprocess.run(
        [pdfinfo, str(pdf)],
        check=True,
        capture_output=True,
        text=True,
    )
    match = re.search(r"^Pages:\s+(\d+)", result.stdout, flags=re.MULTILINE)
    if not match:
        raise ValueError(f"Could not read page count: {pdf.name}")
    return int(match.group(1))


def crc32_for(pdf: Path) -> int:
    checksum = 0
    with pdf.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            checksum = zlib.crc32(chunk, checksum)
    return checksum & 0xFFFFFFFF


def render_thumbnail(pdf: Path, output: Path, pdftoppm: str, cwebp: str) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="edmund-reading-thumb-") as temp_dir:
        temp_prefix = Path(temp_dir) / "cover"
        subprocess.run(
            [
                pdftoppm,
                "-f",
                "1",
                "-l",
                "1",
                "-singlefile",
                "-scale-to-x",
                "320",
                "-scale-to-y",
                "-1",
                "-jpeg",
                "-jpegopt",
                "quality=84",
                str(pdf),
                str(temp_prefix),
            ],
            check=True,
            capture_output=True,
        )
        subprocess.run(
            [
                cwebp,
                "-quiet",
                "-q",
                "80",
                "-resize",
                "320",
                "0",
                str(temp_prefix.with_suffix(".jpg")),
                "-o",
                str(output),
            ],
            check=True,
            capture_output=True,
        )


def build_entry(
    pdf: Path,
    titles: dict[tuple[int, int], str],
    thumbnail_dir: Path,
    pdftoppm: str,
    cwebp: str,
    pdfinfo: str,
) -> dict[str, object]:
    filename = pdf.name
    passage, number = classify(filename)
    title = titles.get((passage, number))
    if not title:
        raise ValueError(f"Missing title for Passage {passage}, Practice {number}: {filename}")

    digest = hashlib.sha256(filename.encode("utf-8")).hexdigest()[:16]
    thumbnail_name = f"{digest}.webp"
    render_thumbnail(pdf, thumbnail_dir / thumbnail_name, pdftoppm, cwebp)

    return {
        "id": digest,
        "number": number,
        "passage": passage,
        "title": title,
        "filename": filename,
        "category": f"passage-{passage}",
        "categoryLabel": f"Passage {passage}",
        "categoryOrder": passage,
        "problem": False,
        "pages": page_count(pdf, pdfinfo),
        "bytes": pdf.stat().st_size,
        "crc32": crc32_for(pdf),
        "key": f"{R2_PREFIX}/{filename}",
        "thumbnail": f"assets/ielts-reading/thumbnails/{thumbnail_name}",
    }


def validate_inventory(
    entries: list[dict[str, object]],
    titles: dict[tuple[int, int], str],
) -> None:
    if len(entries) != 477:
        raise ValueError(f"Expected 477 IELTS Reading PDFs, found {len(entries)}")

    actual_title_keys = {(int(entry["passage"]), int(entry["number"])) for entry in entries}
    if set(titles) != actual_title_keys:
        missing = sorted(actual_title_keys - set(titles))
        extra = sorted(set(titles) - actual_title_keys)
        raise ValueError(f"Title inventory mismatch; missing={missing}, extra={extra}")

    for passage, expected in EXPECTED_NUMBERS.items():
        actual = {
            int(entry["number"])
            for entry in entries
            if int(entry["passage"]) == passage
        }
        if actual != expected:
            missing = sorted(expected - actual)
            extra = sorted(actual - expected)
            raise ValueError(
                f"Passage {passage} inventory mismatch; missing={missing}, extra={extra}"
            )

    ids = [str(entry["id"]) for entry in entries]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate generated IELTS Reading catalog IDs")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Folder containing the 477 IELTS Reading PDFs")
    parser.add_argument(
        "--titles",
        type=Path,
        default=Path(__file__).with_name("ielts-reading-passage-titles.json"),
        help="Normalized passage/practice title map",
    )
    parser.add_argument("--site-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    site_root = args.site_root.expanduser().resolve()
    titles_path = args.titles.expanduser().resolve()
    titles = load_titles(titles_path)
    pdfs = sorted(source.glob("*.pdf"), key=lambda path: (*classify(path.name), path.name))

    pdftoppm = shutil.which("pdftoppm")
    cwebp = shutil.which("cwebp")
    pdfinfo = shutil.which("pdfinfo")
    missing_tools = [
        name
        for name, value in (("pdftoppm", pdftoppm), ("cwebp", cwebp), ("pdfinfo", pdfinfo))
        if not value
    ]
    if missing_tools:
        raise SystemExit(f"Missing required tools: {', '.join(missing_tools)}")

    thumbnail_dir = site_root / "assets" / "ielts-reading" / "thumbnails"
    entries: list[dict[str, object]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = [
            executor.submit(
                build_entry,
                pdf,
                titles,
                thumbnail_dir,
                str(pdftoppm),
                str(cwebp),
                str(pdfinfo),
            )
            for pdf in pdfs
        ]
        for future in concurrent.futures.as_completed(futures):
            entries.append(future.result())

    entries.sort(key=lambda item: (int(item["passage"]), int(item["number"])))
    validate_inventory(entries, titles)

    passage_counts = {
        f"passage-{passage}": sum(1 for entry in entries if int(entry["passage"]) == passage)
        for passage in sorted(EXPECTED_NUMBERS)
    }
    passage_bytes = {
        f"passage-{passage}": sum(
            int(entry["bytes"]) for entry in entries if int(entry["passage"]) == passage
        )
        for passage in sorted(EXPECTED_NUMBERS)
    }
    passage_pages = {
        f"passage-{passage}": sum(
            int(entry["pages"]) for entry in entries if int(entry["passage"]) == passage
        )
        for passage in sorted(EXPECTED_NUMBERS)
    }

    public_entries = [
        {key: value for key, value in entry.items() if key not in {"key", "crc32"}}
        for entry in entries
    ]
    meta = {
        "total": len(entries),
        "totalBytes": sum(int(entry["bytes"]) for entry in entries),
        "totalPages": sum(int(entry["pages"]) for entry in entries),
        "categoryCounts": passage_counts,
        "passageBytes": passage_bytes,
        "passagePages": passage_pages,
        "generatedFrom": source.name,
    }
    manifest_path = site_root / "ielts-reading-downloads.js"
    manifest_path.write_text(
        "// Generated by tools/build-ielts-reading-download-catalog.py\n"
        f"window.EDMUND_IELTS_READING_DOWNLOADS=Object.freeze({json.dumps(public_entries, ensure_ascii=False, separators=(',', ':'))});\n"
        f"window.EDMUND_IELTS_READING_META=Object.freeze({json.dumps(meta, ensure_ascii=False, separators=(',', ':'))});\n",
        encoding="utf-8",
    )

    worker_groups: dict[str, list[dict[str, object]]] = {}
    for passage in sorted(EXPECTED_NUMBERS):
        worker_groups[f"passage-{passage}"] = [
            {
                "id": entry["id"],
                "key": entry["key"],
                "filename": entry["filename"],
                "bytes": entry["bytes"],
                "crc32": entry["crc32"],
            }
            for entry in entries
            if int(entry["passage"]) == passage
        ]

    worker_catalog_path = (
        site_root / "workers" / "model-essay-downloads" / "src" / "reading-catalog.js"
    )
    worker_catalog_path.parent.mkdir(parents=True, exist_ok=True)
    lines = ["// Generated by tools/build-ielts-reading-download-catalog.py"]
    lines.append("export const READING_CATALOG=Object.freeze({")
    for index, (key, rows) in enumerate(worker_groups.items()):
        suffix = "," if index < len(worker_groups) - 1 else ""
        lines.append(
            f"{json.dumps(key)}:Object.freeze({json.dumps(rows, ensure_ascii=False, separators=(',', ':'))}){suffix}"
        )
    lines.append("});")
    worker_catalog_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Wrote {len(entries)} reading files to {manifest_path}")
    print(f"Wrote {len(list(thumbnail_dir.glob('*.webp')))} thumbnails to {thumbnail_dir}")
    print(f"Wrote Worker catalog to {worker_catalog_path}")
    print(
        json.dumps(
            {
                "passageCounts": passage_counts,
                "passageBytes": passage_bytes,
                "passagePages": passage_pages,
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
