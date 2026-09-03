#!/usr/bin/env python3
"""Replace scanned DSE paper pages with OCR text and figure-only overlays."""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import subprocess
import tempfile
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


PAPER_YEARS = (2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2025)
SECTIONS = ("a", "b1", "b2")
VISION_HELPER = Path("/tmp/edmund-dse-vision-ocr")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--tesseract", default="tesseract")
    parser.add_argument("--year", type=int, choices=PAPER_YEARS)
    parser.add_argument("--section", choices=SECTIONS)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--cache-dir", type=Path, default=Path("/tmp/dse-structured-ocr-cache"))
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def clean_line(words: list[dict]) -> str:
    text = " ".join(word["text"] for word in words)
    text = re.sub(r"\s+([,.;:!?%\)\]\}])", r"\1", text)
    text = re.sub(r"([\(\[\{])\s+", r"\1", text)
    text = re.sub(r"\s+([’'])\s+", r"\1", text)
    return re.sub(r"\s+", " ", text).strip()


def style_lines(lines: list[dict]) -> list[dict]:
    lines = [
        line for line in lines
        if not (line["height"] > line["width"] * 3 and len(line["text"]) > 10)
    ]
    body_heights = [line["height"] for line in lines if len(line["text"]) >= 35]
    median_height = float(np.median(body_heights or [20]))
    for index, line in enumerate(lines):
        letters = re.sub(r"[^A-Za-z]", "", line["text"])
        previous = lines[index - 1] if index else None
        following = lines[index + 1] if index + 1 < len(lines) else None
        previous_gap = line["y"] - (previous["y"] + previous["height"]) if previous else median_height
        following_gap = following["y"] - (line["y"] + line["height"]) if following else median_height
        separated_heading = (
            3 <= len(letters) <= 45
            and max(previous_gap, following_gap) >= median_height * 1.25
            and line["height"] >= median_height * .72
        )
        line["bold"] = bool(
            line["height"] >= median_height * 1.45
            or (letters and letters.isupper() and len(letters) <= 64)
            or separated_heading
        )
    return lines


def ensure_vision_helper(root: Path) -> bool:
    source = root / "tools/ocr-dse-page.m"
    if not source.exists():
        return False
    if VISION_HELPER.exists() and VISION_HELPER.stat().st_mtime_ns >= source.stat().st_mtime_ns:
        return True
    try:
        subprocess.run(
            [
                "xcrun", "clang", "-fobjc-arc", "-fblocks",
                "-framework", "Foundation", "-framework", "AppKit", "-framework", "Vision",
                str(source), "-o", str(VISION_HELPER),
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False


def run_vision_helper(image_path: Path) -> list[dict]:
    if not VISION_HELPER.exists():
        return []
    try:
        result = subprocess.run(
            [str(VISION_HELPER), str(image_path)],
            check=True,
            capture_output=True,
            text=True,
        )
        lines = json.loads(result.stdout)
    except (json.JSONDecodeError, subprocess.CalledProcessError):
        return []
    return lines


def vision_lines(image_path: Path, columns: bool = False) -> list[dict]:
    lines = run_vision_helper(image_path)
    if columns and lines:
        with Image.open(image_path) as image:
            width, height = image.size
            marker_y = [
                line["y"] for line in lines
                if re.match(r"^\s*(?:\d{1,3}\s+)?[\[\(]\s*\d{1,2}\s*[\]\)]", line.get("text", ""))
            ]
            top = max(round(height * .05), min(marker_y, default=round(height * .12)) - round(height * .035))
            bottom = round(height * .9)
            boxes = (
                (round(width * .06), top, round(width * .54), bottom),
                (round(width * .47), top, round(width * .94), bottom),
            )
            column_lines = []
            for column, box in enumerate(boxes):
                with tempfile.NamedTemporaryFile(suffix=".png") as temporary:
                    image.crop(box).save(temporary.name)
                    cropped_lines = run_vision_helper(Path(temporary.name))
                for line in cropped_lines:
                    line["x"] += box[0]
                    line["y"] += box[1]
                column_lines.extend(
                    line for line in cropped_lines
                    if (line["x"] + line["width"] / 2 < width / 2) == (column == 0)
                )
        lines = [line for line in lines if line["y"] < top or line["y"] >= bottom] + column_lines
    for line in lines:
        line["text"] = clean_line([{"text": line["text"]}])
        line["bold"] = False
    return style_lines(sorted(lines, key=lambda item: (item["y"], item["x"])))


def ocr_page(image_path: Path, tesseract: str, psm: str = "3") -> tuple[list[dict], list[dict]]:
    result = subprocess.run(
        [tesseract, str(image_path), "stdout", "-l", "eng", "--oem", "1", "--psm", psm, "tsv"],
        check=True,
        capture_output=True,
        text=True,
    )
    words: list[dict] = []
    reader = csv.DictReader(io.StringIO(result.stdout), delimiter="\t")
    for row in reader:
        if row.get("level") != "5" or not row.get("text", "").strip():
            continue
        try:
            confidence = float(row["conf"])
        except (TypeError, ValueError):
            continue
        if confidence < 10:
            continue
        words.append(
            {
                "block": int(row["block_num"]),
                "paragraph": int(row["par_num"]),
                "line": int(row["line_num"]),
                "word": int(row["word_num"]),
                "x": int(row["left"]),
                "y": int(row["top"]),
                "width": int(row["width"]),
                "height": int(row["height"]),
                "confidence": round(confidence, 2),
                "text": row["text"].strip(),
            }
        )

    grouped: dict[tuple[int, int, int], list[dict]] = defaultdict(list)
    for word in words:
        grouped[(word["block"], word["paragraph"], word["line"])].append(word)

    lines: list[dict] = []
    for line_words in grouped.values():
        line_words.sort(key=lambda item: (item["x"], item["word"]))
        text = clean_line(line_words)
        if not text:
            continue
        left = min(word["x"] for word in line_words)
        top = min(word["y"] for word in line_words)
        right = max(word["x"] + word["width"] for word in line_words)
        bottom = max(word["y"] + word["height"] for word in line_words)
        height = bottom - top
        lines.append(
            {
                "x": left,
                "y": top,
                "width": right - left,
                "height": height,
                "text": text,
                "bold": False,
            }
        )
    lines.sort(key=lambda item: (item["y"], item["x"]))
    # Keep complete lines. The flow importer determines reading order; splitting
    # every passage down the middle truncates wide paragraphs and table cells.
    accurate_lines = vision_lines(image_path)
    return words, accurate_lines or style_lines(lines)


def dilate_grid(grid: np.ndarray, rounds: int = 2) -> np.ndarray:
    result = grid.copy()
    for _ in range(rounds):
        source = result.copy()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if not dx and not dy:
                    continue
                y0 = max(0, dy)
                y1 = source.shape[0] + min(0, dy)
                x0 = max(0, dx)
                x1 = source.shape[1] + min(0, dx)
                result[y0:y1, x0:x1] |= source[y0 - dy:y1 - dy, x0 - dx:x1 - dx]
    return result


def component_boxes(mask: np.ndarray, scale: int = 4) -> list[tuple[int, int, int, int]]:
    height = mask.shape[0] // scale
    width = mask.shape[1] // scale
    reduced = mask[: height * scale, : width * scale].reshape(height, scale, width, scale).any(axis=(1, 3))
    reduced = dilate_grid(reduced, rounds=2)
    seen = np.zeros_like(reduced, dtype=bool)
    boxes: list[tuple[int, int, int, int]] = []
    for start_y, start_x in np.argwhere(reduced & ~seen):
        if seen[start_y, start_x]:
            continue
        queue = deque([(int(start_y), int(start_x))])
        seen[start_y, start_x] = True
        min_x = max_x = int(start_x)
        min_y = max_y = int(start_y)
        cells = 0
        while queue:
            y, x = queue.popleft()
            cells += 1
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < height and 0 <= nx < width and reduced[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    queue.append((ny, nx))
        if cells >= 18:
            boxes.append((min_x * scale, min_y * scale, (max_x + 1) * scale, (max_y + 1) * scale))
    return boxes


def merge_boxes(boxes: list[tuple[int, int, int, int]], gap: int = 10) -> list[tuple[int, int, int, int]]:
    merged = list(boxes)
    changed = True
    while changed:
        changed = False
        output: list[tuple[int, int, int, int]] = []
        while merged:
            box = merged.pop(0)
            bx0, by0, bx1, by1 = box
            for index, other in enumerate(merged):
                ox0, oy0, ox1, oy1 = other
                horizontal_overlap = min(bx1, ox1) - max(bx0, ox0)
                vertical_overlap = min(by1, oy1) - max(by0, oy0)
                near = (
                    horizontal_overlap >= -gap and vertical_overlap > min(by1 - by0, oy1 - oy0) * .2
                ) or (
                    vertical_overlap >= -gap and horizontal_overlap > min(bx1 - bx0, ox1 - ox0) * .2
                )
                if near:
                    box = (min(bx0, ox0), min(by0, oy0), max(bx1, ox1), max(by1, oy1))
                    merged.pop(index)
                    merged.insert(0, box)
                    changed = True
                    break
            else:
                output.append(box)
        merged = output
    return merged


def build_figure_crops(
    image_path: Path,
    words: list[dict],
    output_base: Path,
    output_rel_base: Path,
) -> list[dict]:
    image = Image.open(image_path).convert("RGBA")
    pixels = np.asarray(image).copy()
    rgb = pixels[:, :, :3]

    # Blank paper becomes transparent. OCR word rectangles are removed so only
    # source photos, illustrations, diagrams and rule-based graphics remain.
    pixels[:, :, 3] = np.where(np.min(rgb, axis=2) < 200, 255, 0).astype(np.uint8)
    height, width = pixels.shape[:2]
    for word in words:
        pad_x = max(3, round(word["height"] * 0.18))
        pad_y = max(3, round(word["height"] * 0.22))
        x0 = max(0, word["x"] - pad_x)
        y0 = max(0, word["y"] - pad_y)
        x1 = min(width, word["x"] + word["width"] + pad_x)
        y1 = min(height, word["y"] + word["height"] + pad_y)
        pixels[y0:y1, x0:x1, 3] = 0

    alpha = pixels[:, :, 3] > 0
    candidates = []
    for x0, y0, x1, y1 in component_boxes(alpha):
        box_width = x1 - x0
        box_height = y1 - y0
        if box_width < 100 or box_height < 55:
            continue
        if box_width * box_height > width * height * .5:
            continue
        if x0 < 25 and x1 > width - 25:
            continue
        if y0 < 25 and y1 > height - 25:
            continue
        visible = int(np.count_nonzero(alpha[y0:y1, x0:x1]))
        if visible < 220:
            continue
        candidates.append((x0, y0, x1, y1))

    figures = []
    output_base.parent.mkdir(parents=True, exist_ok=True)
    for index, (x0, y0, x1, y1) in enumerate(merge_boxes(candidates), 1):
        box_width = x1 - x0
        box_height = y1 - y0
        area_ratio = box_width * box_height / (width * height)
        aspect_ratio = max(box_width / max(1, box_height), box_height / max(1, box_width))
        crop_rgb = rgb[y0:y1, x0:x1]
        dark_density = float(np.mean(np.min(crop_rgb, axis=2) < 210)) if crop_rgb.size else 0
        if area_ratio > .55 or aspect_ratio > 3.2:
            continue
        if area_ratio > .35 and dark_density < .12:
            continue
        padding = 8
        x0 = max(0, x0 - padding)
        y0 = max(0, y0 - padding)
        x1 = min(width, x1 + padding)
        y1 = min(height, y1 + padding)
        output_path = output_base.parent / f"{output_base.name}-figure-{index}.webp"
        output_rel = output_rel_base.parent / f"{output_rel_base.name}-figure-{index}.webp"
        Image.fromarray(pixels[y0:y1, x0:x1], "RGBA").save(
            output_path,
            "WEBP",
            lossless=True,
            method=6,
        )
        figures.append(
            {
                "src": output_rel.as_posix(),
                "x": x0,
                "y": y0,
                "width": x1 - x0,
                "height": y1 - y0,
                "alt": f"Original figure {index}",
            }
        )
    return figures


def convert_page(
    root: Path,
    page: dict,
    output_rel: Path,
    tesseract: str,
    force: bool,
    cache_dir: Path,
) -> dict:
    source_rel = Path(page["src"])
    source_path = root / source_rel
    output_path = root / output_rel
    cache_path = cache_dir / output_rel.with_suffix(".ocr.json")
    legacy_cache_path = cache_dir / output_rel.parent / f"{output_rel.name}-figures.ocr.json"
    if not cache_path.exists() and legacy_cache_path.exists():
        cache_path = legacy_cache_path

    if cache_path.exists() and not force:
        cached = json.loads(cache_path.read_text())
        words = cached.pop("words")
        lines = style_lines(cached["lines"])
        width = cached["width"]
        height = cached["height"]
    else:
        with Image.open(source_path) as source:
            width, height = source.size
        psm = "6" if output_rel.name.startswith("questions-") else "3"
        words, lines = ocr_page(source_path, tesseract, psm)
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        cache_path.write_text(
            json.dumps({"width": width, "height": height, "words": words, "lines": lines}, ensure_ascii=False),
            encoding="utf-8",
        )

    figures = build_figure_crops(source_path, words, output_path, output_rel)
    result = {
        "width": width,
        "height": height,
        "label": page.get("label", "Original paper page"),
        "lines": lines,
    }
    if figures:
        result["figures"] = figures
    return result


def preserve_content_figures(old_page: dict, width: int, height: int, kind: str) -> list[dict]:
    old_width = max(1, int(old_page.get("width", width)))
    old_height = max(1, int(old_page.get("height", height)))
    scale_x = width / old_width
    scale_y = height / old_height
    figures = []
    for figure in old_page.get("figures", []):
        x = int(figure["x"])
        y = int(figure["y"])
        figure_width = int(figure["width"])
        figure_height = int(figure["height"])
        center_y = y + figure_height / 2
        if kind == "passage":
            overlapping_lines = sum(
                1
                for line in old_page.get("lines", [])
                if min(x + figure_width, line["x"] + line["width"]) - max(x, line["x"]) > line["width"] * .18
                and min(y + figure_height, line["y"] + line["height"]) - max(y, line["y"]) > line["height"] * .18
            )
            if overlapping_lines >= 2:
                continue
        elif (
            center_y > old_height * .92
            or (
                center_y < old_height * .18
                and max(figure_width, figure_height) < old_width * .2
            )
        ):
            continue
        figures.append(
            {
                "src": figure.get("src", ""),
                "x": round(x * scale_x),
                "y": round(y * scale_y),
                "width": round(figure_width * scale_x),
                "height": round(figure_height * scale_y),
                "alt": figure.get("alt", "Original content visual"),
            }
        )
    return figures


def convert_exercise(
    root: Path,
    data_path: Path,
    tesseract: str,
    force: bool,
    cache_dir: Path,
    workers: int,
) -> tuple[int, int]:
    data = json.loads(data_path.read_text())
    if data.get("displayMode") not in {"paper", "structured-paper"}:
        return 0, 0

    year = data["year"]
    section = data["section"].lower()
    output_base = Path("assets/reading-comprehension/dse/structured") / str(year) / section
    converted = 0
    line_count = 0
    for source_key, target_key, stem in (
        ("passagePages", "structuredPassagePages", "passage"),
        ("questionPages", "structuredQuestionPages", "questions"),
    ):
        old_pages = data.get(target_key, [])
        source_pages = data.get(source_key)
        if not source_pages:
            legacy_dir = root / "assets/reading-comprehension/dse/papers" / str(year) / section
            source_pages = [
                {
                    "src": path.relative_to(root).as_posix(),
                    "label": f"{'Reading passage' if stem == 'passage' else 'Question'} page {index}",
                }
                for index, path in enumerate(sorted(legacy_dir.glob(f"{stem}-*.webp")), 1)
            ]
        jobs = [
            (page, output_base / f"{stem}-{index}")
            for index, page in enumerate(source_pages or [], 1)
        ]
        with ThreadPoolExecutor(max_workers=max(1, workers)) as executor:
            pages = list(
                executor.map(
                    lambda job: convert_page(root, job[0], job[1], tesseract, force, cache_dir),
                    jobs,
                )
            )
        for page, old_page in zip(pages, old_pages):
            figures = preserve_content_figures(old_page, page["width"], page["height"], stem)
            if figures:
                page["figures"] = figures
            else:
                page.pop("figures", None)
        converted += len(pages)
        line_count += sum(len(page["lines"]) for page in pages)
        data[target_key] = pages
        data.pop(source_key, None)

    data["displayMode"] = "structured-paper"
    data_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return converted, line_count


def main() -> None:
    args = parse_args()
    root = args.root.resolve()
    ensure_vision_helper(root)
    total_pages = 0
    total_lines = 0
    years = (args.year,) if args.year else PAPER_YEARS
    sections = (args.section,) if args.section else SECTIONS
    for year in years:
        for section in sections:
            path = root / "dse-reading-data" / f"dse-{year}-{section}.json"
            pages, lines = convert_exercise(
                root,
                path,
                args.tesseract,
                args.force,
                args.cache_dir,
                args.workers,
            )
            total_pages += pages
            total_lines += lines
            print(f"{path.name}: {pages} pages, {lines} OCR lines")
    print(f"Converted {total_pages} pages with {total_lines} selectable text lines.")


if __name__ == "__main__":
    main()
