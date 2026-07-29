#!/usr/bin/env python3
"""Build the IELTS Writing Task 1 download manifest, Worker catalog, and covers."""

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


R2_PREFIX = "IELTS Writing Task 1"
SECOND_BATCH_R2_PREFIX = "IELTS Writing Task 1/IELTS Writing Task 2 - Second Batch"
CATEGORIES = {
    "Bar Charts": ("bar-charts", "Bar Charts", 1, 8),
    "Line Graph": ("line-graph", "Line Graph", 2, 9),
    "Pie Charts": ("pie-charts", "Pie Charts", 3, 7),
    "Process Diagram": ("process-diagram", "Process Diagram", 4, 10),
    "Maps": ("maps", "Maps", 5, 10),
    "Tables": ("tables", "Tables", 6, 1),
    "MIXED Charts": ("mixed-charts", "Mixed Charts", 7, 7),
}
FILENAME = re.compile(
    r"(?P<without_analysis>\(Without Analysis\)\s+)?"
    r"Model Essay (?P<number>\d+) - IELTS - (?P<category>.+?) "
    r"- \(Band 9 示範\) - Task 1(?P<variant>-1)?\.pdf",
    flags=re.IGNORECASE,
)


def classify(filename: str) -> tuple[int, int, str, str, int, bool]:
    match = FILENAME.fullmatch(filename)
    if not match:
        raise ValueError(f"Unrecognised IELTS Task 1 filename: {filename}")

    number = int(match.group("number"))
    raw_category = match.group("category")
    canonical = next((name for name in CATEGORIES if name.casefold() == raw_category.casefold()), None)
    if not canonical:
        raise ValueError(f"Unrecognised IELTS Task 1 category in {filename}: {raw_category}")

    category, label, order, _expected = CATEGORIES[canonical]
    variant = 2 if match.group("variant") else 1
    analysis_included = not bool(match.group("without_analysis"))
    return number, variant, category, label, order, analysis_included


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
    with tempfile.TemporaryDirectory(prefix="edmund-task1-thumb-") as temp_dir:
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
    r2_prefix: str,
    batch: int,
    thumbnail_dir: Path,
    pdftoppm: str,
    cwebp: str,
    pdfinfo: str,
) -> dict[str, object]:
    filename = pdf.name
    number, variant, category, label, order, analysis_included = classify(filename)
    digest = hashlib.sha256(filename.encode("utf-8")).hexdigest()[:16]
    thumbnail_name = f"{digest}.webp"
    render_thumbnail(pdf, thumbnail_dir / thumbnail_name, pdftoppm, cwebp)

    return {
        "id": digest,
        "number": number,
        "variant": variant,
        "batch": batch,
        "analysisIncluded": analysis_included,
        "filename": filename,
        "category": category,
        "categoryLabel": label,
        "categoryOrder": order,
        "problem": False,
        "pages": page_count(pdf, pdfinfo),
        "bytes": pdf.stat().st_size,
        "crc32": crc32_for(pdf),
        "key": f"{r2_prefix}/{filename}",
        "thumbnail": f"assets/ielts-task1/thumbnails/{thumbnail_name}",
    }


def validate_inventory(entries: list[dict[str, object]]) -> None:
    if len(entries) != 52:
        raise ValueError(f"Expected 52 IELTS Task 1 PDFs, found {len(entries)}")

    for category_name, (category, _label, _order, expected) in CATEGORIES.items():
        actual = sum(1 for entry in entries if entry["category"] == category)
        if actual != expected:
            raise ValueError(
                f"{category_name} inventory mismatch; expected={expected}, actual={actual}"
            )

    ids = [str(entry["id"]) for entry in entries]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate generated IELTS Task 1 catalog IDs")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Folder containing the first 35 IELTS Task 1 PDFs")
    parser.add_argument(
        "--second-source",
        type=Path,
        required=True,
        help="Folder containing the 17 second-batch IELTS Task 1 PDFs",
    )
    parser.add_argument(
        "--second-r2-prefix",
        default=SECOND_BATCH_R2_PREFIX,
        help="R2 prefix containing the second-batch PDFs",
    )
    parser.add_argument("--site-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    second_source = args.second_source.expanduser().resolve()
    site_root = args.site_root.expanduser().resolve()
    source_groups = [
        (source, R2_PREFIX, 1),
        (second_source, str(args.second_r2_prefix).strip("/"), 2),
    ]
    pdfs = [
        (pdf, r2_prefix, batch)
        for folder, r2_prefix, batch in source_groups
        for pdf in sorted(folder.glob("*.pdf"), key=lambda path: path.name.casefold())
    ]

    pdftoppm = shutil.which("pdftoppm")
    cwebp = shutil.which("cwebp")
    pdfinfo = shutil.which("pdfinfo")
    missing = [
        name
        for name, value in (("pdftoppm", pdftoppm), ("cwebp", cwebp), ("pdfinfo", pdfinfo))
        if not value
    ]
    if missing:
        raise SystemExit(f"Missing required tools: {', '.join(missing)}")

    thumbnail_dir = site_root / "assets" / "ielts-task1" / "thumbnails"
    entries: list[dict[str, object]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = [
            executor.submit(
                build_entry,
                pdf,
                r2_prefix,
                batch,
                thumbnail_dir,
                pdftoppm,
                cwebp,
                pdfinfo,
            )
            for pdf, r2_prefix, batch in pdfs
        ]
        for future in concurrent.futures.as_completed(futures):
            entries.append(future.result())

    entries.sort(
        key=lambda item: (
            int(item["categoryOrder"]),
            int(item["number"]),
            int(item["variant"]),
            str(item["filename"]),
        )
    )
    validate_inventory(entries)
    expected_thumbnails = {f"{entry['id']}.webp" for entry in entries}
    for thumbnail in thumbnail_dir.glob("*.webp"):
        if thumbnail.name not in expected_thumbnails:
            thumbnail.unlink()

    category_counts = {
        category: sum(1 for entry in entries if entry["category"] == category)
        for category, _label, _order, _expected in CATEGORIES.values()
    }
    category_bytes = {
        category: sum(int(entry["bytes"]) for entry in entries if entry["category"] == category)
        for category, _label, _order, _expected in CATEGORIES.values()
    }
    category_pages = {
        category: sum(int(entry["pages"]) for entry in entries if entry["category"] == category)
        for category, _label, _order, _expected in CATEGORIES.values()
    }

    public_entries = [
        {key: value for key, value in entry.items() if key not in {"key", "crc32"}}
        for entry in entries
    ]
    manifest_path = site_root / "ielts-task1-downloads.js"
    manifest_path.write_text(
        "// Generated by tools/build-ielts-task1-download-catalog.py\n"
        f"window.EDMUND_IELTS_TASK1_DOWNLOADS=Object.freeze({json.dumps(public_entries, ensure_ascii=False, separators=(',', ':'))});\n"
        f"window.EDMUND_IELTS_TASK1_META=Object.freeze({json.dumps({'total': len(entries), 'totalBytes': sum(int(entry['bytes']) for entry in entries), 'totalPages': sum(int(entry['pages']) for entry in entries), 'categoryCounts': category_counts, 'categoryBytes': category_bytes, 'categoryPages': category_pages, 'generatedFrom': [source.name, second_source.name]}, ensure_ascii=False, separators=(',', ':'))});\n",
        encoding="utf-8",
    )

    worker_catalog_path = site_root / "workers" / "model-essay-downloads" / "src" / "task1-catalog.js"
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
        "// Generated by tools/build-ielts-task1-download-catalog.py\n"
        f"export const TASK1_CATALOG=Object.freeze({json.dumps(worker_entries, ensure_ascii=False, separators=(',', ':'))});\n",
        encoding="utf-8",
    )

    print(f"Wrote {len(entries)} Task 1 files to {manifest_path}")
    print(f"Wrote {len(list(thumbnail_dir.glob('*.webp')))} thumbnails to {thumbnail_dir}")
    print(f"Wrote Worker catalog to {worker_catalog_path}")
    print(
        json.dumps(
            {
                "categoryCounts": category_counts,
                "categoryBytes": category_bytes,
                "categoryPages": category_pages,
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
