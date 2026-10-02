#!/usr/bin/env python3
"""Audit generated Paper 3 readers before adding them to the public catalogue."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def audit_reader(folder: Path) -> dict:
    report = json.loads((folder / "audit.json").read_text(encoding="utf-8"))
    source = json.loads((folder / "source-text.json").read_text(encoding="utf-8"))
    markup = (folder / "index.html").read_text(encoding="utf-8")
    issues = []
    if len(source) != report["pages"]:
        issues.append(f"source pages {len(source)} != {report['pages']}")
    if len(re.findall(r'class="paper-page(?:\s[^"]*)?"', markup)) != report["pages"]:
        issues.append("HTML page count mismatch")
    # A missing scan can still have a clearly labeled partial reconstruction.
    # Those pages have selectable text and a Chinese layer, so audit both.
    missing_without_text = set(report.get("missing_source_pages", [])) - {
        page["leaf"] for page in source if page.get("text", "").strip()
    }
    exempt = missing_without_text | set(report.get("nontext_qab_pages", []))
    inline_translation_pages = markup.count('class="paper-page verified-reconstruction"')
    expected_translation_count = report["pages"] - len(exempt) - inline_translation_pages
    if markup.count('class="page-translation"') != expected_translation_count:
        issues.append("Chinese page count mismatch")
    if markup.count('class="translation" lang="zh-Hant"') < inline_translation_pages:
        issues.append("Inline Chinese translation missing")
    for page in source:
        n = page["leaf"]
        image = folder / "assets" / f"page-{n:02d}.webp"
        zh = folder / "assets" / f"page-{n:02d}.zh.txt"
        if not image.exists() or image.stat().st_size < 1000:
            issues.append(f"page {n}: image missing or small")
        min_zh = 1 if page["kind"] == "qab" and len(page["text"]) < 100 else 10
        has_inline_translation = bool(re.search(rf'<article class="paper-page verified-reconstruction" id="page-{n}"', markup))
        if n not in exempt and not has_inline_translation and (not zh.exists() or len(zh.read_text(encoding="utf-8").strip()) < min_zh):
            issues.append(f"page {n}: Chinese missing or small")
        if page["kind"] == "data" and n not in exempt and len(page["text"].strip()) < 25:
            issues.append(f"page {n}: minimal selectable English")
        if re.search(r"[sScCeEnN]{14,}|\.{10,}", page["text"]):
            issues.append(f"page {n}: OCR leader/noise")
        if re.search(r"(?:^|\n)[1-5]\t\d+\t\d+\t", page["text"]) or (len(page["text"]) > 200 and sum(c.isdigit() for c in page["text"]) / max(1, sum(c.isalnum() for c in page["text"])) > .25):
            issues.append(f"page {n}: raw OCR records or digit noise")
    return {"reader": folder.name, "pages": report["pages"], "data_pages": report["data_pages"], "qab_pages": report["qab_pages"], "missing_source_pages": report.get("missing_source_pages", []), "low_confidence": report["low_coverage"], "issues": issues}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path, help="paper3 directory")
    args = parser.parse_args()
    result = [audit_reader(folder) for folder in sorted(args.root.glob("20??-b?")) if (folder / "audit.json").exists()]
    print(json.dumps({"readers": result, "totals": {"readers": len(result), "pages": sum(item["pages"] for item in result), "missing_source_pages": sum(len(item["missing_source_pages"]) for item in result), "structural_issues": sum(len(item["issues"]) for item in result), "low_confidence_pages": sum(len(item["low_confidence"]) for item in result)}}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
