#!/usr/bin/env python3
"""Build the DSE Writing Part A download manifest, Worker catalog, and thumbnails."""

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


R2_PREFIX = "DSE Writing Part A"
EXPECTED_YEARS = {
    2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
    2021, 2022, 2023, 2024, 2025,
}
FILENAME_PATTERN = re.compile(
    r"(20\d{2}) DSE writing task 1 _ part A - 5\*\* - Edmund\.pdf",
    flags=re.IGNORECASE,
)


def classify(filename: str) -> int:
    match = FILENAME_PATTERN.fullmatch(filename)
    if not match:
        raise ValueError(f"Unrecognised DSE Writing Part A filename: {filename}")
    return int(match.group(1))


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
    with tempfile.TemporaryDirectory(prefix="edmund-dse-writing-thumb-") as temp_dir:
        temp_prefix = Path(temp_dir) / "cover"
        subprocess.run(
            [
                pdftoppm,
                "-f", "1",
                "-l", "1",
                "-singlefile",
                "-scale-to-x", "360",
                "-scale-to-y", "-1",
                "-jpeg",
                "-jpegopt", "quality=88",
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
                "-q", "82",
                "-resize", "360", "0",
                str(temp_prefix.with_suffix(".jpg")),
                "-o", str(output),
            ],
            check=True,
            capture_output=True,
        )


def build_entry(
    pdf: Path,
    thumbnail_dir: Path,
    pdftoppm: str,
    cwebp: str,
    pdfinfo: str,
) -> dict[str, object]:
    filename = pdf.name
    year = classify(filename)
    digest = hashlib.sha256(filename.encode("utf-8")).hexdigest()[:16]
    thumbnail_name = f"{year}.webp"
    render_thumbnail(pdf, thumbnail_dir / thumbnail_name, pdftoppm, cwebp)
    return {
        "id": digest,
        "number": year,
        "year": year,
        "title": f"{year} DSE Writing Part A - 5** Model Answer",
        "filename": filename,
        "category": "writing-part-a",
        "categoryLabel": "Writing Part A",
        "categoryOrder": 1,
        "problem": False,
        "pages": page_count(pdf, pdfinfo),
        "bytes": pdf.stat().st_size,
        "crc32": crc32_for(pdf),
        "key": f"{R2_PREFIX}/{filename}",
        "thumbnail": f"assets/model-essays/dse-writing-part-a/{thumbnail_name}",
    }


def validate_inventory(entries: list[dict[str, object]]) -> None:
    actual_years = {int(entry["year"]) for entry in entries}
    if actual_years != EXPECTED_YEARS:
        raise ValueError(
            f"DSE Writing Part A inventory mismatch; "
            f"missing={sorted(EXPECTED_YEARS - actual_years)}, "
            f"extra={sorted(actual_years - EXPECTED_YEARS)}"
        )
    ids = [str(entry["id"]) for entry in entries]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate generated DSE Writing Part A catalog IDs")
    if any(int(entry["pages"]) < 1 or int(entry["bytes"]) < 1 for entry in entries):
        raise ValueError("Invalid PDF size or page count")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Folder containing the 13 model-answer PDFs")
    parser.add_argument("--site-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    site_root = args.site_root.expanduser().resolve()
    pdfs = sorted(source.glob("*.pdf"), key=lambda path: classify(path.name), reverse=True)

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

    thumbnail_dir = site_root / "assets" / "model-essays" / "dse-writing-part-a"
    entries: list[dict[str, object]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = [
            executor.submit(
                build_entry,
                pdf,
                thumbnail_dir,
                str(pdftoppm),
                str(cwebp),
                str(pdfinfo),
            )
            for pdf in pdfs
        ]
        for future in concurrent.futures.as_completed(futures):
            entries.append(future.result())

    entries.sort(key=lambda item: int(item["year"]), reverse=True)
    validate_inventory(entries)
    total_bytes = sum(int(entry["bytes"]) for entry in entries)
    total_pages = sum(int(entry["pages"]) for entry in entries)

    public_entries = [
        {key: value for key, value in entry.items() if key not in {"key", "crc32"}}
        for entry in entries
    ]
    manifest_path = site_root / "dse-writing-part-a-downloads.js"
    manifest_path.write_text(
        "// Generated by tools/build-dse-writing-part-a-download-catalog.py\n"
        f"window.EDMUND_DSE_WRITING_PART_A_DOWNLOADS=Object.freeze({json.dumps(public_entries, ensure_ascii=False, separators=(',', ':'))});\n"
        f"window.EDMUND_DSE_WRITING_PART_A_META=Object.freeze({json.dumps({'total': len(entries), 'totalBytes': total_bytes, 'totalPages': total_pages, 'categoryCounts': {'writing-part-a': len(entries)}, 'generatedFrom': source.name}, ensure_ascii=False, separators=(',', ':'))});\n",
        encoding="utf-8",
    )

    worker_entries = [
        {
            "id": entry["id"],
            "key": entry["key"],
            "filename": entry["filename"],
            "bytes": entry["bytes"],
            "crc32": entry["crc32"],
        }
        for entry in entries
    ]
    worker_catalog_path = (
        site_root / "workers" / "model-essay-downloads" / "src" /
        "dse-writing-part-a-catalog.js"
    )
    worker_catalog_path.parent.mkdir(parents=True, exist_ok=True)
    worker_catalog_path.write_text(
        "// Generated by tools/build-dse-writing-part-a-download-catalog.py\n"
        f"export const DSE_WRITING_PART_A_CATALOG=Object.freeze({json.dumps(worker_entries, ensure_ascii=False, separators=(',', ':'))});\n",
        encoding="utf-8",
    )

    print(f"Wrote {len(entries)} DSE Writing Part A files to {manifest_path}")
    print(f"Wrote {len(list(thumbnail_dir.glob('*.webp')))} thumbnails to {thumbnail_dir}")
    print(f"Wrote Worker catalog to {worker_catalog_path}")
    print(json.dumps({"totalBytes": total_bytes, "totalPages": total_pages}, sort_keys=True))


if __name__ == "__main__":
    main()
