#!/usr/bin/env python3
"""Extract auditable page text and bilingual tables; never executes PDF content."""
import argparse
import concurrent.futures
import hashlib
import json
import re
from pathlib import Path

import pdfplumber


def extract(job):
    number, source, destination = job
    target = destination / f"practice-{number}.json"
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if target.exists() and json.loads(target.read_text()).get("extractorVersion") == 3 and json.loads(target.read_text())["sha256"] == digest:
        return f"Practice {number}: cached"
    pages = []
    with pdfplumber.open(source) as document:
        for index, page in enumerate(document.pages):
            # Source books have the same running masthead and footer, outside
            # this body region. Keep the original full text for audit as well.
            body = page.crop((0, 70, page.width, 718))
            tables = []
            for table in page.find_tables():
                if table.bbox[1] < 65 or table.bbox[1] >= 718:
                    continue
                rows = [values for values, row in zip(table.extract(), table.rows)
                        if row.bbox[1] < 718 and not any("Knowledge pays" in (value or "") for value in values)]
                tables.append({"bbox": table.bbox, "rows": rows})
            pages.append({"page": index + 1, "width": page.width, "height": page.height,
                          "text": body.extract_text(x_tolerance=2) or "",
                          "fullText": page.extract_text(x_tolerance=2) or "",
                          "tables": tables,
                          "images": [{key: image.get(key) for key in ("x0", "top", "x1", "bottom")}
                                     for image in page.images],
                          "words": body.extract_words()})
    target.write_text(json.dumps({"extractorVersion": 3, "practice": number, "file": source.name,
                                  "sha256": digest, "pages": pages}, ensure_ascii=False, indent=2))
    return f"Practice {number}: {len(pages)} pages"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--practices", type=int, nargs="+", help="Exact practice numbers to import; default 2 through 20")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    jobs = []
    expected = sorted(set(args.practices or range(2, 21)))
    for source in args.source_dir.glob("*.pdf"):
        match = re.search(r"Practice\s*-?\s*(\d+)\.pdf$", source.name)
        if match and int(match[1]) in expected:
            jobs.append((int(match[1]), source, args.output))
    if sorted(job[0] for job in jobs) != expected:
        raise SystemExit(f"Expected exactly one source PDF for each practice in {expected}")
    with concurrent.futures.ProcessPoolExecutor(args.workers) as pool:
        for message in pool.map(extract, sorted(jobs)):
            print(message, flush=True)


if __name__ == "__main__":
    main()
