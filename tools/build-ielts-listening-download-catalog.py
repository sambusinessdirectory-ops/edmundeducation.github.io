#!/usr/bin/env python3
"""Build the IELTS Listening download manifest, Worker catalog, and thumbnails."""

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

from PIL import Image, ImageDraw, ImageFont


R2_PREFIX = "IELTS Listening - Practice Papers"
EXPECTED_PRACTICES = set(range(1, 21))
FILENAME_PATTERN = re.compile(
    r"IELTS Listening - Practice(?: -)? (\d+)\.pdf",
    flags=re.IGNORECASE,
)


def practice_number(filename: str) -> int:
    match = FILENAME_PATTERN.fullmatch(filename)
    if not match:
        raise ValueError(f"Unrecognised IELTS Listening filename: {filename}")
    return int(match.group(1))


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


def add_practice_badge(image_path: Path, number: int) -> None:
    with Image.open(image_path) as source:
        image = source.convert("RGB")
    draw = ImageDraw.Draw(image)
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 25)
    except OSError:
        font = ImageFont.load_default(size=25)
    label = f"PRACTICE {number:02d}"
    text_box = draw.textbbox((0, 0), label, font=font)
    width = text_box[2] - text_box[0]
    height = text_box[3] - text_box[1]
    padding_x = 12
    padding_y = 8
    left = 14
    top = int(image.height * 0.72)
    right = left + width + padding_x * 2
    bottom = top + height + padding_y * 2
    draw.rounded_rectangle(
        (left, top, right, bottom),
        radius=10,
        fill="#102D63",
        outline="#F3A322",
        width=3,
    )
    draw.text(
        (left + padding_x, top + padding_y - text_box[1]),
        label,
        font=font,
        fill="#FFFFFF",
    )
    image.save(image_path, format="JPEG", quality=90, optimize=True)


def render_thumbnail(pdf: Path, output: Path, number: int, pdftoppm: str, cwebp: str) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="edmund-listening-thumb-") as temp_dir:
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
                "quality=86",
                str(pdf),
                str(temp_prefix),
            ],
            check=True,
            capture_output=True,
        )
        jpeg_path = temp_prefix.with_suffix(".jpg")
        add_practice_badge(jpeg_path, number)
        subprocess.run(
            [
                cwebp,
                "-quiet",
                "-q",
                "82",
                "-resize",
                "320",
                "0",
                str(jpeg_path),
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
    number = practice_number(filename)
    digest = hashlib.sha256(filename.encode("utf-8")).hexdigest()[:16]
    thumbnail_name = f"{digest}.webp"
    render_thumbnail(pdf, thumbnail_dir / thumbnail_name, number, pdftoppm, cwebp)
    pages = page_count(pdf, pdfinfo)
    byte_count = pdf.stat().st_size
    if pages < 1 or byte_count < 1:
        raise ValueError(f"Invalid PDF metadata for {filename}: pages={pages}, bytes={byte_count}")
    return {
        "id": digest,
        "number": number,
        "title": f"IELTS Listening Practice {number}",
        "filename": filename,
        "category": "listening",
        "categoryLabel": "IELTS Listening",
        "categoryOrder": 1,
        "problem": False,
        "pages": pages,
        "bytes": byte_count,
        "crc32": crc32_for(pdf),
        "key": f"{R2_PREFIX}/{filename}",
        "thumbnail": f"assets/ielts-listening/thumbnails/{thumbnail_name}",
    }


def validate_inventory(entries: list[dict[str, object]]) -> None:
    actual = {int(entry["number"]) for entry in entries}
    if len(entries) != 20 or actual != EXPECTED_PRACTICES:
        raise ValueError(
            "IELTS Listening inventory mismatch; "
            f"count={len(entries)}, missing={sorted(EXPECTED_PRACTICES - actual)}, "
            f"extra={sorted(actual - EXPECTED_PRACTICES)}"
        )
    ids = [str(entry["id"]) for entry in entries]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate generated IELTS Listening catalog IDs")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Folder containing IELTS Listening Practice 1-20 PDFs")
    parser.add_argument("--site-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    site_root = args.site_root.expanduser().resolve()
    pdfs = [path for path in source.glob("IELTS Listening - Practice*.pdf") if FILENAME_PATTERN.fullmatch(path.name)]

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

    thumbnail_dir = site_root / "assets" / "ielts-listening" / "thumbnails"
    entries: list[dict[str, object]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = [
            executor.submit(build_entry, pdf, thumbnail_dir, pdftoppm, cwebp, pdfinfo)
            for pdf in pdfs
        ]
        for future in concurrent.futures.as_completed(futures):
            entries.append(future.result())

    entries.sort(key=lambda item: int(item["number"]))
    validate_inventory(entries)

    public_entries = [
        {key: value for key, value in entry.items() if key not in {"key", "crc32"}}
        for entry in entries
    ]
    meta = {
        "total": len(entries),
        "totalBytes": sum(int(entry["bytes"]) for entry in entries),
        "totalPages": sum(int(entry["pages"]) for entry in entries),
        "categoryCounts": {"listening": len(entries)},
        "generatedFrom": R2_PREFIX,
    }
    manifest_path = site_root / "ielts-listening-downloads.js"
    manifest_path.write_text(
        "// Generated by tools/build-ielts-listening-download-catalog.py\n"
        f"window.EDMUND_IELTS_LISTENING_DOWNLOADS=Object.freeze({json.dumps(public_entries, ensure_ascii=False, separators=(',', ':'))});\n"
        f"window.EDMUND_IELTS_LISTENING_META=Object.freeze({json.dumps(meta, ensure_ascii=False, separators=(',', ':'))});\n",
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
    worker_catalog_path = site_root / "workers" / "model-essay-downloads" / "src" / "listening-catalog.js"
    worker_catalog_path.parent.mkdir(parents=True, exist_ok=True)
    worker_catalog_path.write_text(
        "// Generated by tools/build-ielts-listening-download-catalog.py\n"
        f"export const LISTENING_CATALOG=Object.freeze({json.dumps(worker_entries, ensure_ascii=False, separators=(',', ':'))});\n",
        encoding="utf-8",
    )

    print(f"Wrote {len(entries)} listening files to {manifest_path}")
    print(f"Wrote {len(entries)} thumbnails to {thumbnail_dir}")
    print(f"Wrote Worker catalog to {worker_catalog_path}")
    print(json.dumps(meta, sort_keys=True))


if __name__ == "__main__":
    main()
