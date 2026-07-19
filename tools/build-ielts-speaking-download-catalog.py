#!/usr/bin/env python3
"""Build the IELTS Speaking download manifest, Worker catalog, and cover thumbnails."""

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


R2_PREFIX = "IELTS Speaking All Parts"
EXPECTED_BOOKS = {
    1: set(range(1, 15)),
    2: set(range(1, 17)),
    3: set(range(1, 17)),
}


def classify(filename: str) -> tuple[int, int]:
    samples = re.fullmatch(
        r"Book (\d+) - IELTS Speaking Part ([12]) - Band 9 Samples\.pdf",
        filename,
        flags=re.IGNORECASE,
    )
    if samples:
        return int(samples.group(2)), int(samples.group(1))

    part_three = re.fullmatch(
        r"Book (\d+) - Band 9 IELTS Speaking - Part 3\.pdf",
        filename,
        flags=re.IGNORECASE,
    )
    if part_three:
        return 3, int(part_three.group(1))

    raise ValueError(f"Unrecognised IELTS Speaking filename: {filename}")


def page_count(pdf: Path, pdfinfo: str) -> int:
    result = subprocess.run(
        [pdfinfo, str(pdf)],
        check=True,
        capture_output=True,
        text=True,
    )
    match = re.search(r"^Pages:\s+(\d+)", result.stdout, flags=re.MULTILINE)
    return int(match.group(1)) if match else 0


def crc32_for(pdf: Path) -> int:
    checksum = 0
    with pdf.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            checksum = zlib.crc32(chunk, checksum)
    return checksum & 0xFFFFFFFF


def render_thumbnail(pdf: Path, output: Path, pdftoppm: str, cwebp: str) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="edmund-speaking-thumb-") as temp_dir:
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
    thumbnail_dir: Path,
    pdftoppm: str,
    cwebp: str,
    pdfinfo: str,
) -> dict[str, object]:
    filename = pdf.name
    part, book = classify(filename)
    digest = hashlib.sha256(filename.encode("utf-8")).hexdigest()[:16]
    thumbnail_name = f"{digest}.webp"
    render_thumbnail(pdf, thumbnail_dir / thumbnail_name, pdftoppm, cwebp)
    pages = page_count(pdf, pdfinfo)

    return {
        "id": digest,
        "number": book,
        "book": book,
        "part": part,
        "filename": filename,
        "category": f"part-{part}",
        "categoryLabel": f"Part {part}",
        "categoryOrder": part,
        "problem": False,
        "pages": pages,
        "bytes": pdf.stat().st_size,
        "crc32": crc32_for(pdf),
        "key": f"{R2_PREFIX}/{filename}",
        "thumbnail": f"assets/ielts-speaking/thumbnails/{thumbnail_name}",
    }


def validate_inventory(entries: list[dict[str, object]]) -> None:
    if len(entries) != 46:
        raise ValueError(f"Expected 46 IELTS Speaking PDFs, found {len(entries)}")

    for part, expected in EXPECTED_BOOKS.items():
        actual = {int(entry["book"]) for entry in entries if int(entry["part"]) == part}
        if actual != expected:
            missing = sorted(expected - actual)
            extra = sorted(actual - expected)
            raise ValueError(f"Part {part} inventory mismatch; missing={missing}, extra={extra}")

    ids = [str(entry["id"]) for entry in entries]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate generated catalog IDs")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Folder containing the 46 IELTS Speaking PDFs")
    parser.add_argument("--site-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    site_root = args.site_root.expanduser().resolve()
    pdfs = sorted(source.glob("*.pdf"), key=lambda path: path.name.casefold())

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

    thumbnail_dir = site_root / "assets" / "ielts-speaking" / "thumbnails"
    entries: list[dict[str, object]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = [
            executor.submit(build_entry, pdf, thumbnail_dir, pdftoppm, cwebp, pdfinfo)
            for pdf in pdfs
        ]
        for future in concurrent.futures.as_completed(futures):
            entries.append(future.result())

    entries.sort(key=lambda item: (int(item["part"]), int(item["book"])))
    validate_inventory(entries)

    part_counts = {
        f"part-{part}": sum(1 for entry in entries if int(entry["part"]) == part)
        for part in sorted(EXPECTED_BOOKS)
    }
    part_bytes = {
        f"part-{part}": sum(int(entry["bytes"]) for entry in entries if int(entry["part"]) == part)
        for part in sorted(EXPECTED_BOOKS)
    }
    part_pages = {
        f"part-{part}": sum(int(entry["pages"]) for entry in entries if int(entry["part"]) == part)
        for part in sorted(EXPECTED_BOOKS)
    }

    public_entries = [
        {key: value for key, value in entry.items() if key not in {"key", "crc32"}}
        for entry in entries
    ]
    manifest_path = site_root / "ielts-speaking-downloads.js"
    manifest_path.write_text(
        "// Generated by tools/build-ielts-speaking-download-catalog.py\n"
        f"window.EDMUND_IELTS_SPEAKING_DOWNLOADS=Object.freeze({json.dumps(public_entries, ensure_ascii=False, separators=(',', ':'))});\n"
        f"window.EDMUND_IELTS_SPEAKING_META=Object.freeze({json.dumps({'total': len(entries), 'totalBytes': sum(int(entry['bytes']) for entry in entries), 'totalPages': sum(int(entry['pages']) for entry in entries), 'categoryCounts': part_counts, 'partBytes': part_bytes, 'partPages': part_pages, 'generatedFrom': source.name}, ensure_ascii=False, separators=(',', ':'))});\n",
        encoding="utf-8",
    )

    worker_catalog_path = site_root / "workers" / "model-essay-downloads" / "src" / "speaking-catalog.js"
    worker_catalog_path.parent.mkdir(parents=True, exist_ok=True)
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
    worker_catalog_path.write_text(
        "// Generated by tools/build-ielts-speaking-download-catalog.py\n"
        f"export const SPEAKING_CATALOG=Object.freeze({json.dumps(worker_entries, ensure_ascii=False, separators=(',', ':'))});\n",
        encoding="utf-8",
    )

    print(f"Wrote {len(entries)} speaking files to {manifest_path}")
    print(f"Wrote {len(list(thumbnail_dir.glob('*.webp')))} thumbnails to {thumbnail_dir}")
    print(f"Wrote Worker catalog to {worker_catalog_path}")
    print(json.dumps({"partCounts": part_counts, "partBytes": part_bytes, "partPages": part_pages}, sort_keys=True))


if __name__ == "__main__":
    main()
