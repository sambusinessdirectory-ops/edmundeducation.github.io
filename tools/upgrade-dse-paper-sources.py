#!/usr/bin/env python3
"""Match imported DSE page images to source PDFs and re-render them sharply."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps


PDFTOPPM = Path(
    "/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/"
    "dependencies/native/poppler/poppler/bin/pdftoppm"
)

SOURCES = {
    2013: (
        Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/DSE/2013/paper 1/2013-DSE-ENG-LANG-1-RP-A.pdf"),
        Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/DSE/2013/paper 1/2013-DSE-ENG-LANG-1-RP-B1.pdf"),
        Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/DSE/2013/paper 1/2013-DSE-ENG-LANG-1-RP-B2.pdf"),
        Path("/Users/sammak/Downloads/2013 Reading Questions.pdf"),
    ),
    2015: (Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/2015 Reading Passage and Questions.pdf"),),
    2016: (Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/2016 Reading Passage and Questions.pdf"),),
    2017: (Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/2017 Reading Passage and Questions.pdf"),),
    2018: (Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/2018 Reading.pdf"),),
    2019: (Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/2019 Reading and Questions.pdf"),),
    2020: (Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/2020 Reading Passage.pdf"),),
    2021: (Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/2021 Reading Passage and Questions.pdf"),),
    2022: (Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/2022 Reading - Passage and Questions.pdf"),),
    2023: (Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD/2023 Reading past paper.pdf"),),
    2025: (
        Path("/Users/sammak/Desktop/2025 Reading Part A.pdf"),
        Path("/Volumes/(Pro-G) Sam's Data/Website/Useless Casual Desktop Images Dumpster Backup/2025 Reading B1.pdf"),
        Path("/Users/sammak/Desktop/2025 Reading B2.pdf"),
    ),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--year", type=int, choices=tuple(SOURCES))
    parser.add_argument("--cache-dir", type=Path, default=Path("/tmp/dse-source-page-match"))
    parser.add_argument("--render-dpi", type=int, default=300)
    parser.add_argument("--write", action="store_true")
    return parser.parse_args()


def normalized_page(image: Image.Image) -> np.ndarray:
    page = ImageOps.exif_transpose(image).convert("L")
    page = ImageOps.autocontrast(page, cutoff=1)
    page = ImageOps.fit(page, (96, 136), method=Image.Resampling.LANCZOS)
    values = np.asarray(page, dtype=np.float32) / 255.0
    values = (values - values.mean()) / max(values.std(), 0.05)
    return values


def distance(left: np.ndarray, right: np.ndarray) -> float:
    body = float(np.mean(np.square(left - right)))
    left_edges = np.diff(left, axis=0)
    right_edges = np.diff(right, axis=0)
    edges = float(np.mean(np.square(left_edges - right_edges)))
    return body + edges * 0.35


def render_thumbnails(pdf: Path, directory: Path) -> list[Path]:
    digest = hashlib.sha256(str(pdf.resolve()).encode()).hexdigest()[:12]
    key = f"{pdf.stem}-{digest}"
    target = directory / key
    existing = sorted(target.glob("page-*.jpg"))
    if existing:
        return existing
    target.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [str(PDFTOPPM), "-r", "72", "-jpeg", "-jpegopt", "quality=88", str(pdf), str(target / "page")],
        check=True,
        capture_output=True,
    )
    return sorted(target.glob("page-*.jpg"))


def page_number(path: Path) -> int:
    return int(path.stem.rsplit("-", 1)[1])


def match_pages(root: Path, year: int, cache_dir: Path) -> list[dict]:
    sources = SOURCES[year]
    missing = [str(path) for path in sources if not path.exists()]
    if missing:
        raise FileNotFoundError("Missing source PDFs: " + ", ".join(missing))
    candidates = []
    for pdf in sources:
        for thumbnail in render_thumbnails(pdf, cache_dir):
            with Image.open(thumbnail) as image:
                candidates.append((pdf, page_number(thumbnail), normalized_page(image)))

    matches = []
    paper_dir = root / "assets/reading-comprehension/dse/papers" / str(year)
    for asset in sorted(paper_dir.glob("*/*.webp")):
        with Image.open(asset) as image:
            fingerprint = normalized_page(image)
        ranked = sorted(
            (distance(fingerprint, candidate), pdf, number)
            for pdf, number, candidate in candidates
        )
        score, pdf, number = ranked[0]
        second_score = ranked[1][0] if len(ranked) > 1 else 99.0
        matches.append(
            {
                "asset": asset.relative_to(root).as_posix(),
                "pdf": str(pdf),
                "page": number,
                "score": round(score, 5),
                "separation": round(second_score - score, 5),
            }
        )
    return matches


def enhance_page(source: Path, target: Path) -> None:
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("L")
        image = ImageOps.autocontrast(image, cutoff=1)
        image = ImageEnhance.Contrast(image).enhance(1.08)
        image = image.filter(ImageFilter.UnsharpMask(radius=0.9, percent=110, threshold=3))
        target.parent.mkdir(parents=True, exist_ok=True)
        image.save(target, "WEBP", quality=94, method=6)


def render_matches(root: Path, matches: list[dict], dpi: int) -> None:
    with tempfile.TemporaryDirectory(prefix="dse-sharp-pages-") as temporary:
        temp = Path(temporary)
        for index, match in enumerate(matches, 1):
            prefix = temp / f"page-{index}"
            subprocess.run(
                [
                    str(PDFTOPPM), "-f", str(match["page"]), "-l", str(match["page"]),
                    "-r", str(dpi), "-png", "-singlefile", match["pdf"], str(prefix),
                ],
                check=True,
                capture_output=True,
            )
            enhance_page(prefix.with_suffix(".png"), root / match["asset"])


def main() -> None:
    args = parse_args()
    root = args.root.resolve()
    cache_dir = args.cache_dir.resolve()
    cache_dir.mkdir(parents=True, exist_ok=True)
    years = (args.year,) if args.year else tuple(SOURCES)
    all_matches = []
    for year in years:
        matches = match_pages(root, year, cache_dir)
        all_matches.extend(matches)
        for match in matches:
            print(json.dumps({"year": year, **match}, ensure_ascii=False))
        if args.write:
            render_matches(root, matches, args.render_dpi)
    weak = [match for match in all_matches if match["score"] > 0.45 or match["separation"] < 0.015]
    print(json.dumps({"pages": len(all_matches), "weakMatches": len(weak), "write": args.write}))
    if weak:
        raise SystemExit("Weak source-page matches require review before replacement.")


if __name__ == "__main__":
    main()
