#!/usr/bin/env python3
"""Build the IELTS Task 2 download manifest and first-page thumbnails."""

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
R2_PREFIX = "IELTS Task 2 Model Essays"

CATEGORY_RULES = (
    ("Advantage _ Disadvatange Type", "advantage-disadvantage", "Advantage and Disadvantage", 1),
    ("Opinion", "opinion", "Opinions", 2),
    ("Express Both Views Type", "discuss-both-views", "Express Both Views + Your Opinion", 3),
    ("Cause _ Solution Type", "cause-solution", "Cause and Solution", 4),
    ("Direct Question Type", "direct-question", "Direct Question", 5),
)


def category_for(filename: str) -> tuple[str, str, int]:
    for marker, key, label, order in CATEGORY_RULES:
        if marker in filename:
            return key, label, order
    raise ValueError(f"Unrecognised essay category: {filename}")


def essay_number(filename: str) -> int:
    match = re.search(r"Model Essay\s+(\d+)", filename, flags=re.IGNORECASE)
    if not match:
        raise ValueError(f"Missing essay number: {filename}")
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


def render_thumbnail(pdf: Path, output: Path, pdftoppm: str, cwebp: str) -> None:
    if output.exists() and output.stat().st_size > 0:
        return

    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="edmund-essay-thumb-") as temp_dir:
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
                "quality=82",
                str(pdf),
                str(temp_prefix),
            ],
            check=True,
            capture_output=True,
        )
        subprocess.run(
            [cwebp, "-quiet", "-q", "78", "-resize", "320", "0", str(temp_prefix.with_suffix(".jpg")), "-o", str(output)],
            check=True,
            capture_output=True,
        )


def build_entry(pdf: Path, thumbnail_dir: Path, pdftoppm: str, cwebp: str, pdfinfo: str) -> dict[str, object]:
    filename = pdf.name
    category, category_label, category_order = category_for(filename)
    digest = hashlib.sha256(filename.encode("utf-8")).hexdigest()[:16]
    thumbnail_name = f"{digest}.webp"
    thumbnail_path = thumbnail_dir / thumbnail_name
    render_thumbnail(pdf, thumbnail_path, pdftoppm, cwebp)

    key = f"{R2_PREFIX}/{filename}"
    return {
        "id": digest,
        "number": essay_number(filename),
        "filename": filename,
        "category": category,
        "categoryLabel": category_label,
        "categoryOrder": category_order,
        "problem": filename.startswith("(Problem)"),
        "pages": page_count(pdf, pdfinfo),
        "bytes": pdf.stat().st_size,
        "crc32": crc32_for(pdf),
        "key": key,
        "thumbnail": f"assets/model-essays/thumbnails/{thumbnail_name}",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Folder containing the 238 PDF files")
    parser.add_argument("--site-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    site_root = args.site_root.expanduser().resolve()
    pdfs = sorted(source.glob("*.pdf"), key=lambda path: path.name.casefold())
    if len(pdfs) != 238:
        raise SystemExit(f"Expected 238 PDF files, found {len(pdfs)} in {source}")

    pdftoppm = shutil.which("pdftoppm")
    cwebp = shutil.which("cwebp")
    pdfinfo = shutil.which("pdfinfo")
    missing = [name for name, value in (("pdftoppm", pdftoppm), ("cwebp", cwebp), ("pdfinfo", pdfinfo)) if not value]
    if missing:
        raise SystemExit(f"Missing required tools: {', '.join(missing)}")

    thumbnail_dir = site_root / "assets" / "model-essays" / "thumbnails"
    thumbnail_dir.mkdir(parents=True, exist_ok=True)

    entries: list[dict[str, object]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = [
            executor.submit(build_entry, pdf, thumbnail_dir, pdftoppm, cwebp, pdfinfo)
            for pdf in pdfs
        ]
        for future in concurrent.futures.as_completed(futures):
            entries.append(future.result())

    entries.sort(key=lambda item: (int(item["number"]), int(item["categoryOrder"]), str(item["filename"]).casefold()))
    category_counts: dict[str, int] = {}
    for entry in entries:
        key = str(entry["category"])
        category_counts[key] = category_counts.get(key, 0) + 1

    manifest_path = site_root / "ielts-task2-model-essays.js"
    public_entries = [
        {key: value for key, value in entry.items() if key not in {"key", "crc32"}}
        for entry in entries
    ]
    payload = json.dumps(public_entries, ensure_ascii=False, separators=(",", ":"))
    meta = json.dumps(
        {
            "total": len(entries),
            "totalBytes": sum(int(entry["bytes"]) for entry in entries),
            "categoryCounts": category_counts,
            "generatedFrom": source.name,
        },
        ensure_ascii=False,
        separators=(",", ":"),
    )
    manifest_path.write_text(
        "// Generated by tools/build-model-essay-catalog.py\n"
        f"window.EDMUND_MODEL_ESSAYS=Object.freeze({payload});\n"
        f"window.EDMUND_MODEL_ESSAY_META=Object.freeze({meta});\n",
        encoding="utf-8",
    )

    worker_catalog_path = site_root / "workers" / "model-essay-downloads" / "src" / "catalog.js"
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
        "// Generated by tools/build-model-essay-catalog.py\n"
        f"export const CATALOG=Object.freeze({json.dumps(worker_entries, ensure_ascii=False, separators=(',', ':'))});\n",
        encoding="utf-8",
    )

    print(f"Wrote {len(entries)} essays to {manifest_path}")
    print(f"Wrote {len(list(thumbnail_dir.glob('*.webp')))} thumbnails to {thumbnail_dir}")
    print(f"Wrote Worker catalog to {worker_catalog_path}")
    print(json.dumps(category_counts, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
