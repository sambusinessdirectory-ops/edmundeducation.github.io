#!/usr/bin/env python3
"""Convert imported DSE paper scans into the normal reading-workbench data model.

The input datasets are the OCR-backed structured-paper files. The output uses
the same paragraph and question-card renderer as the hand-authored 2014/2026
exercises. Only real content visuals are cropped from the source paper pages.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import subprocess
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


PAPER_YEARS = (2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2025)
SECTIONS = ("a", "b1", "b2")
QUESTION_RANGE_OVERRIDES = {(2013, "b2"): (46, 65)}
EXCLUDED_VISUALS = {
    "assets/reading-comprehension/dse/content/2013/b2/questions-1-visual-1.webp",
    "assets/reading-comprehension/dse/content/2013/b2/questions-1-visual-3.webp",
    "assets/reading-comprehension/dse/content/2016/b1/questions-1-visual-2.webp",
    "assets/reading-comprehension/dse/content/2017/a/questions-1-visual-4.webp",
    "assets/reading-comprehension/dse/content/2018/b2/passage-2-visual-1.webp",
    "assets/reading-comprehension/dse/content/2022/b2/passage-1-visual-1.webp",
    "assets/reading-comprehension/dse/content/2022/b2/passage-2-visual-1.webp",
    "assets/reading-comprehension/dse/content/2023/b2/questions-1-visual-2.webp",
    "assets/reading-comprehension/dse/content/2025/b1/questions-2-visual-2.webp",
    "assets/reading-comprehension/dse/content/2025/b2/questions-2-visual-1.webp",
}
QUESTION_WORDS = re.compile(
    r"^(?:What|Which|Who|Whom|Whose|Why|How|Where|When|Find|Explain|According|"
    r"Read|Use|Based|Complete|Match|Choose|Decide|Give|Identify|State|Name|List|"
    r"Put|Fill|Look|In|From|Refer|Select|The following|Some of|Below|Order|Study)\b",
    re.I,
)
SUBPART = re.compile(r"^(?:\(?[ivx]{1,5}\)?(?:[\.)]\s*|\s+)|\([a-h]\)\s*)", re.I)
OPTION = re.compile(r"^([A-H])[\.)]\s*(.+)", re.I)
EXPLICIT_QUESTION = re.compile(r"^(\d{1,3})(?:[\.,]?\s+(.+))?$")
PARAGRAPH_MARKER = re.compile(r"^\s*(?:\d{1,3}\s+)?[\[\{\(]\s*(\d{1,2})\s*[\]\}\)]\s*(.*)$")


@dataclass
class Block:
    lines: list[dict]
    explicit: bool = False
    score: float = 0
    figures: list[dict] = field(default_factory=list)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--year", type=int, choices=PAPER_YEARS)
    parser.add_argument("--section", choices=SECTIONS)
    parser.add_argument("--write", action="store_true")
    return parser.parse_args()


def normalize(text: str) -> str:
    text = text.replace("ﬁ", "fi").replace("ﬂ", "fl").replace("_", " ")
    text = re.sub(r"\s+([,.;:!?%\)\]\}])", r"\1", text)
    text = re.sub(r"([\(\[\{])\s+", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def passage_has_two_columns(page: dict) -> bool:
    width = page["width"]
    body = [
        line for line in page.get("lines", [])
        if page["height"] * .2 < line["y"] < page["height"] * .9
        and line["width"] < width * .48
    ]
    left = sum(line["x"] + line["width"] / 2 < width / 2 for line in body)
    right = sum(line["x"] + line["width"] / 2 >= width / 2 for line in body)
    return left >= 7 and right >= 7


def ocr_region(image: Image.Image, box: tuple[int, int, int, int], column: int) -> list[dict]:
    x0, y0, x1, y1 = box
    crop = image.crop(box).convert("L")
    crop = ImageOps.autocontrast(crop, cutoff=1)
    crop = ImageEnhance.Contrast(crop).enhance(1.08)
    crop = crop.filter(ImageFilter.UnsharpMask(radius=.8, percent=105, threshold=3))
    with tempfile.NamedTemporaryFile(suffix=".png") as temporary:
        crop.save(temporary.name)
        result = subprocess.run(
            ["tesseract", temporary.name, "stdout", "-l", "eng", "--oem", "1", "--psm", "6", "tsv"],
            check=True,
            capture_output=True,
            text=True,
        )
    grouped: dict[tuple[str, str, str], list[dict]] = {}
    for row in csv.DictReader(io.StringIO(result.stdout), delimiter="\t"):
        if row.get("level") != "5" or not row.get("text", "").strip():
            continue
        try:
            confidence = float(row["conf"])
        except (TypeError, ValueError):
            continue
        if confidence < 12:
            continue
        key = (row["block_num"], row["par_num"], row["line_num"])
        grouped.setdefault(key, []).append(row)
    lines = []
    for words in grouped.values():
        words.sort(key=lambda word: int(word["left"]))
        text = normalize(" ".join(word["text"] for word in words))
        if not text:
            continue
        left = min(int(word["left"]) for word in words)
        top = min(int(word["top"]) for word in words)
        right = max(int(word["left"]) + int(word["width"]) for word in words)
        bottom = max(int(word["top"]) + int(word["height"]) for word in words)
        lines.append(
            {
                "x": x0 + left,
                "y": y0 + top,
                "width": right - left,
                "height": bottom - top,
                "text": text,
                "bold": False,
                "column": column,
            }
        )
    return sorted(lines, key=lambda line: (line["y"], line["x"]))


def passage_ocr_lines(root: Path, data: dict, page: dict, page_index: int) -> list[dict]:
    # The structured-page builder uses macOS Vision's accurate OCR. Retaining
    # those coordinates gives us reliable paragraph markers and column order.
    if page.get("lines"):
        return passage_reading_order(page)
    source = root / "assets/reading-comprehension/dse/papers" / str(data["year"]) / data["section"].lower() / f"passage-{page_index}.webp"
    if not source.exists():
        return passage_reading_order(page)
    cache_dir = Path("/tmp/dse-flow-column-ocr")
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache = cache_dir / f"{data['year']}-{data['section'].lower()}-{page_index}.json"
    source_stamp = source.stat().st_mtime_ns
    if cache.exists():
        payload = json.loads(cache.read_text())
        if payload.get("sourceStamp") == source_stamp:
            return payload["lines"]
    with Image.open(source) as opened:
        image = opened.convert("RGB")
        width, height = image.size
        top, bottom = round(height * .08), round(height * .91)
        if passage_has_two_columns(page):
            boxes = [
                (round(width * .065), top, round(width * .465), bottom),
                (round(width * .47), top, round(width * .9), bottom),
            ]
        else:
            boxes = [(round(width * .06), top, round(width * .94), bottom)]
        lines = []
        for column, box in enumerate(boxes):
            lines.extend(ocr_region(image, box, column))
    cache.write_text(json.dumps({"sourceStamp": source_stamp, "lines": lines}, ensure_ascii=False))
    return lines


def is_page_noise(text: str) -> bool:
    value = normalize(text)
    if not value:
        return True
    patterns = (
        r"^Please stick the barcode",
        r"^Candidate Number",
        r"^HKDSE\s+20\d{2}$",
        r"^ENGLISH LANGUAGE$",
        r"^PAPER 1",
        r"^QUESTION-ANSWER BOOK",
        r"^Write your Candidate Number",
        r"^Answers written in the margins?",
        r"^Go on(?:to)? the next page",
        r"^(?:END|ID) OF RE",
        r"^END OF PART\s+(?:A|B1|B2)$",
        r"^Sources? of materials",
        r"acknowledged in the Examination Report",
        r"Assessment Authority at a later stage",
        r"^published by the Hong Kong",
        r"^\d{4}-DSE-ENG",
        r"^Provided by dse\.life",
        r"https?://dsepp\.com",
        r"^ADING PASSAGES",
        r"^[|Il_~=-]{1,8}$",
        r"^[A-Z]{0,4}\d{1,2}$",
    )
    return any(re.search(pattern, value, re.I) for pattern in patterns)


def line_column(line: dict, width: int) -> int:
    center = line["x"] + line["width"] / 2
    return 0 if center < width / 2 else 1


def merge_line_fragments(lines: list[dict]) -> list[dict]:
    """Vision can split one printed line into boxes with slightly different tops."""
    rows: list[list[dict]] = []
    for line in sorted(lines, key=lambda item: (item["y"] + item["height"] / 2, item["x"])):
        center = line["y"] + line["height"] / 2
        row = rows[-1] if rows else []
        same_baseline = row and abs(center - sum(item["y"] + item["height"] / 2 for item in row) / len(row)) <= min(line["height"], max(item["height"] for item in row)) * .48
        if same_baseline:
            row.append(line)
        else:
            rows.append([line])
    merged = []
    for row in rows:
        row.sort(key=lambda item: item["x"])
        result = dict(row[0])
        result["text"] = " ".join(item["text"] for item in row)
        result["y"] = min(item["y"] for item in row)
        result["width"] = max(item["x"] + item["width"] for item in row) - result["x"]
        result["height"] = max(item["y"] + item["height"] for item in row) - result["y"]
        merged.append(result)
    return merged


def passage_reading_order(page: dict) -> list[dict]:
    width = page["width"]
    height = page["height"]
    lines = [
        dict(line)
        for line in page.get("lines", [])
        if line.get("text") and line["y"] < height - 120 and not is_page_noise(line["text"])
    ]
    body = [line for line in lines if line["y"] > 420]
    left = [line for line in body if line_column(line, width) == 0 and line["width"] < width * .58]
    right = [line for line in body if line_column(line, width) == 1 and line["width"] < width * .58]
    crossing = [line for line in body if line['x'] < width * .44 and line['x'] + line['width'] > width * .60]
    two_columns = len(left) >= 8 and len(right) >= 8 and len(crossing) < 3
    for line in lines:
        line["column"] = line_column(line, width) if two_columns else 0
    if not two_columns:
        return merge_line_fragments(lines)

    headings = [line for line in lines if line["width"] >= width * .58]
    heading_ids = {id(line) for line in headings}
    columns = [line for line in lines if id(line) not in heading_ids]
    return (
        merge_line_fragments(headings)
        + merge_line_fragments([line for line in columns if line["column"] == 0])
        + merge_line_fragments([line for line in columns if line["column"] == 1])
    )


def merge_passage_marker_rows(lines: list[dict]) -> list[dict]:
    consumed: set[int] = set()
    replacements: dict[int, dict] = {}
    for index, line in enumerate(lines):
        text = normalize(line.get("text", ""))
        marker = PARAGRAPH_MARKER.match(text)
        if not marker:
            continue
        companions = [
            (other_index, other)
            for other_index, other in enumerate(lines)
            if other_index != index
            and other.get("column", 0) == line.get("column", 0)
            and other["x"] > line["x"]
            and abs(
                (other["y"] + other["height"] / 2)
                - (line["y"] + line["height"] / 2)
            ) <= 36
        ]
        if not companions:
            continue
        companion_index, companion = min(companions, key=lambda item: item[1]["x"])
        copy = dict(line)
        marker_text = normalize(marker.group(2))
        companion_text = normalize(companion["text"])
        copy["text"] = f"({marker.group(1)}) {marker_text} {companion_text}".strip()
        copy["y"] = min(line["y"], companion["y"])
        copy["height"] = max(line["y"] + line["height"], companion["y"] + companion["height"]) - copy["y"]
        copy["width"] = companion["x"] + companion["width"] - line["x"]
        replacement_index = min(index, companion_index)
        replacements[replacement_index] = copy
        consumed.update((index, companion_index))

    merged: list[dict] = []
    for index, line in enumerate(lines):
        if index in replacements:
            merged.append(replacements[index])
        if index in consumed:
            continue
        merged.append(dict(line))
    return merged


def clean_passage_line(line: dict, page: dict) -> str:
    text = normalize(line["text"])
    line_number = re.match(r"^(\d{1,3})\s+(?=\D)", text)
    if line_number and int(line_number.group(1)) <= 200 and int(line_number.group(1)) % 5 == 0:
        text = text[line_number.end():]
    width = page["width"]
    column = line.get("column", 0)
    expected_x = width * (.115 if column == 0 else .505)
    if line["x"] < expected_x and re.match(r"^\d{1,3}\s+\S", text):
        text = re.sub(r"^\d{1,3}\s+", "", text)
    if re.fullmatch(r"\d{1,3}[\)\]]?", text):
        return ""
    if is_page_noise(text):
        return ""
    if re.match(r"^(?:PART [AB]\d?|Read (?:Text|the following))\b", text, re.I):
        return ""
    return text


def passage_boundary(text: str, bold: bool = False) -> bool:
    letters = re.sub(r"[^A-Za-z]", "", text)
    return bool(
        re.match(r"^(?:Text\s+\d+|Section\s+\d+\b)", text, re.I)
        or (
            4 <= len(letters) <= 64
            and letters.isupper()
            and len(text.split()) <= 9
        )
    )


def join_lines(lines: list[str]) -> str:
    output = ""
    for text in filter(None, lines):
        if not output:
            output = text
        elif output.endswith("-") and text[:1].islower():
            output += text
        else:
            output += " " + text
    return normalize(output)


def crop_visuals(root: Path, data: dict, page: dict, kind: str, page_index: int) -> list[dict]:
    year = data["year"]
    section = data["section"].lower()
    source = root / "assets/reading-comprehension/dse/papers" / str(year) / section / f"{kind}-{page_index}.webp"
    overrides = json.loads((root / "tools/dse-reading-visual-crops.json").read_text())
    approved = set(json.loads((root / "tools/dse-reading-reviewed-visuals.json").read_text()))
    page_key = f"{year}/{section}/{kind}-{page_index}"
    manual = overrides.get(page_key)
    if not source.exists() or not (page.get("figures") or manual):
        return []
    image = Image.open(source).convert("RGB")
    output_dir = root / "assets/reading-comprehension/dse/content" / str(year) / section
    output_dir.mkdir(parents=True, exist_ok=True)
    visuals = []
    figures = page.get("figures", [])
    if manual is not None:
        figures = [{**item, "x": item["box"][0] * image.width, "y": item["box"][1] * image.height, "width": item["box"][2] * image.width, "height": item["box"][3] * image.height} for item in manual]
    for index, figure in enumerate(figures, 1):
        x0 = max(0, int(figure["x"]) - 12)
        y0 = max(0, int(figure["y"]) - 12)
        x1 = min(image.width, int(figure["x"] + figure["width"]) + 12)
        y1 = min(image.height, int(figure["y"] + figure["height"]) + 12)
        if x1 <= x0 or y1 <= y0:
            continue
        crop = image.crop((x0, y0, x1, y1))
        longest = max(crop.size)
        if longest < 3840:
            scale = 3840 / max(1, longest)
            crop = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.LANCZOS)
            crop = crop.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=3))
        output = output_dir / f"{kind}-{page_index}-{'crop' if manual is not None else 'visual'}-{index}.webp"
        output_relative = output.relative_to(root).as_posix()
        if manual is None and (output_relative in EXCLUDED_VISUALS or output_relative not in approved):
            continue
        crop.save(output, "WEBP", quality=92, method=6)
        visuals.append(
            {
                "src": output_relative,
                "alt": figure.get("alt", f"Original {kind} visual from the {year} Part {data['section']} paper"),
                "question": figure.get("question"),
                "paragraph": figure.get("paragraph"),
                "page": page_index,
                "x": x0,
                "y": y0,
                "width": x1 - x0,
                "height": y1 - y0,
            }
        )
    return visuals


def build_paragraphs(root: Path, data: dict) -> tuple[list[dict], int]:
    groups: list[dict] = []
    visual_count = 0
    for page_index, page in enumerate(data.get("structuredPassagePages", []), 1):
        ordered = merge_passage_marker_rows(passage_ocr_lines(root, data, page, page_index))
        page_visuals = crop_visuals(root, data, page, "passage", page_index)
        visual_count += len(page_visuals)
        current = None
        pending: list[str] = []
        page_groups: list[dict] = []
        has_markers = any(PARAGRAPH_MARKER.match(clean_passage_line(line, page)) for line in ordered)
        marker_numbers = {
            int(match.group(1))
            for line in ordered
            if (match := PARAGRAPH_MARKER.match(clean_passage_line(line, page)))
        }
        complete_markers = bool(
            len(marker_numbers) >= 3
            and marker_numbers == set(range(min(marker_numbers), max(marker_numbers) + 1))
        )
        body_lines = [
            line for line in ordered
            if clean_passage_line(line, page)
            and not passage_boundary(clean_passage_line(line, page), line.get("bold", False))
        ]
        base_x = {
            column: min((line["x"] for line in body_lines if line.get("column", 0) == column), default=0)
            for column in (0, 1)
        }
        previous_by_column: dict[int, dict] = {}
        for line in ordered:
            text = clean_passage_line(line, page)
            if not text:
                continue
            normalized_heading = text.casefold()
            known_headings = {
                str(data.get("title", "")).strip().casefold(),
                str(data.get("sourceHeading", "")).strip().casefold(),
            }
            heading_fragment = any(
                len(normalized_heading) >= 5
                and normalized_heading in heading
                and re.search(r"[A-Z]{4}", text)
                for heading in known_headings
                if heading
            )
            if re.fullmatch(r"Text\s+[0-9Il]+", text, re.I) or normalized_heading in known_headings or heading_fragment:
                continue
            marker = PARAGRAPH_MARKER.match(text)
            if marker:
                if pending and groups:
                    groups[-1]["lines"].extend(pending)
                if current and current["lines"]:
                    page_groups.append(current)
                current = {
                    "marker": marker.group(1),
                    "lines": pending + ([marker.group(2)] if marker.group(2) else []),
                    "page": page_index,
                    "column": line.get("column", 0),
                    "start_y": line["y"],
                    "end_y": line["y"] + line["height"],
                    "visuals": [],
                }
                pending = []
                previous_by_column[line.get("column", 0)] = line
                continue
            column = line.get("column", 0)
            previous = previous_by_column.get(column)
            gap = line["y"] - (previous["y"] + previous["height"]) if previous else 0
            inferred_start = bool(
                current
                and not complete_markers
                and (
                    column != current.get("column", column)
                    or (
                        gap >= 55
                        and line["x"] >= base_x.get(column, 0) + page["width"] * .032
                    )
                )
            )
            if inferred_start:
                if current.get("lines"):
                    page_groups.append(current)
                current = {
                    "marker": str(len(groups) + len(page_groups) + 1),
                    "lines": [text],
                    "page": page_index,
                    "column": column,
                    "start_y": line["y"],
                    "end_y": line["y"] + line["height"],
                    "visuals": [],
                }
                previous_by_column[column] = line
                continue
            if passage_boundary(text, line.get("bold", False)):
                if current is None and has_markers:
                    continue
                if current and current["lines"]:
                    page_groups.append(current)
                elif pending:
                    page_groups.append(
                        {
                            "marker": str(len(groups) + len(page_groups) + 1),
                            "lines": pending,
                            "page": page_index,
                            "column": line.get("column", 0),
                            "start_y": line["y"],
                            "end_y": line["y"] + line["height"],
                            "visuals": [],
                        }
                    )
                current = {
                    "marker": str(len(groups) + len(page_groups) + 1),
                    "lines": [text],
                    "page": page_index,
                    "column": line.get("column", 0),
                    "start_y": line["y"],
                    "end_y": line["y"] + line["height"],
                    "visuals": [],
                }
                pending = []
                previous_by_column[column] = line
                continue
            if current is None:
                if len(text) > 2 and text.upper() != data.get("title", "").upper():
                    pending.append(text)
                previous_by_column[column] = line
                continue
            current["lines"].append(text)
            current["end_y"] = max(current["end_y"], line["y"] + line["height"])
            previous_by_column[column] = line
        if current and current["lines"]:
            page_groups.append(current)
        elif pending:
            page_groups.append(
                {
                    "marker": str(len(groups) + len(page_groups) + 1),
                    "lines": pending,
                    "page": page_index,
                    "column": 0,
                    "start_y": 0,
                    "end_y": page["height"],
                    "visuals": [],
                }
            )
        groups.extend(page_groups)
        for visual in page_visuals:
            same_page = [group for group in page_groups if group["page"] == page_index]
            if same_page:
                center = visual["y"] + visual["height"] / 2
                target = min(same_page, key=lambda group: abs((group["start_y"] + group["end_y"]) / 2 - center))
                if visual.get("paragraph") and visual["paragraph"] <= len(groups):
                    target = groups[visual["paragraph"] - 1]
                target["visuals"].append(visual)

    if not groups:
        return [], visual_count
    paragraphs = []
    for index, group in enumerate(groups, 1):
        text = join_lines(group["lines"])
        if len(text) < 3:
            continue
        paragraph_number = len(paragraphs) + 1
        paragraph = {"number": paragraph_number, "label": f"Paragraph {group['marker']}", "text": text}
        if group.get("visuals"):
            paragraph["images"] = [
                {key: visual[key] for key in ("src", "alt")}
                for visual in group["visuals"]
            ]
        paragraphs.append(paragraph)
    return paragraphs, visual_count


def merge_question_rows(page: dict) -> list[dict]:
    width = page["width"]
    source = [
        dict(line)
        for line in page.get("lines", [])
        if width * .025 <= line["x"] <= width * .94
        and line["y"] < page["height"] - 120
        and not (line["height"] > line["width"] * 1.4)
    ]
    rows: list[list[dict]] = []
    for line in sorted(source, key=lambda item: (item["y"] + item["height"] / 2, item["x"])):
        center = line["y"] + line["height"] / 2
        target = next(
            (
                row for row in reversed(rows[-4:])
                if abs(center - sum(item["y"] + item["height"] / 2 for item in row) / len(row)) <= 36
            ),
            None,
        )
        if target is None:
            rows.append([line])
        else:
            target.append(line)

    merged = []
    for row in rows:
        row.sort(key=lambda item: item["x"])
        left = min(item["x"] for item in row)
        top = min(item["y"] for item in row)
        right = max(item["x"] + item["width"] for item in row)
        bottom = max(item["y"] + item["height"] for item in row)
        texts = []
        for item in row:
            value = normalize(item.get("text", ""))
            if value and (not texts or value != texts[-1]):
                texts.append(value)
        merged.append(
            {
                "x": left,
                "y": top,
                "width": right - left,
                "height": bottom - top,
                "text": normalize(" ".join(texts)),
                "bold": any(item.get("bold") for item in row),
            }
        )
    return sorted(merged, key=lambda item: (item["y"], item["x"]))


def clean_question_lines(page: dict, page_index: int) -> list[dict]:
    result = []
    for line in merge_question_rows(page):
        text = normalize(line.get("text", ""))
        text = re.sub(r"^\(?(?:iri|iti|ili|ill)\)", "(iii)", text, flags=re.I)
        question_start = re.search(
            r"\b(?:What|Which|Who|Whom|Whose|Why|How|Where|When|Find|Explain|According|Read|Use|Based|Complete|Match|Choose|Decide|Give|Identify|State|Name|List|Put|Fill|Look|In|From|Refer|Select|The following|Study)\b",
            text,
            re.I,
        )
        if question_start and question_start.start():
            prefix = text[:question_start.start()]
            if not re.search(r"[A-Za-z]{2,}", prefix) and not re.fullmatch(r"\s*\d{1,3}[.,]\s*", prefix):
                text = text[question_start.start():]
        text = re.sub(r"(?:\s+[A-H]){2,}$", "", text)
        if not OPTION.match(text):
            text = re.sub(r"([?])\s+(?:[^A-Za-z]|[A-Za-z]\s*){1,8}$", r"\1", text)
        if not text or line["y"] > page["height"] - 110:
            continue
        if re.search(r"Candidate Number|barcode label", text, re.I):
            continue
        if is_page_noise(text) and not re.fullmatch(r"\d{1,3}", text):
            continue
        if not re.search(r"[A-Za-z]{2,}", text) and not (EXPLICIT_QUESTION.match(text) or SUBPART.match(text) or OPTION.match(text)):
            continue
        if re.match(r"^Read Texts?\b.*\band answer questions?\b", text, re.I) or re.fullmatch(r"Text\s+\d+", text, re.I):
            continue
        copy = dict(line)
        copy.update({"text": text, "page": page_index, "page_width": page["width"]})
        result.append(copy)
    return result


def candidate_score(lines: list[dict], index: int, expected_start: int, expected_end: int) -> tuple[bool, float]:
    line = lines[index]
    text = line["text"]
    explicit = EXPLICIT_QUESTION.match(text)
    if explicit and expected_start <= int(explicit.group(1)) <= expected_end:
        remainder = normalize(explicit.group(2) or "")
        plausible = not remainder or QUESTION_WORDS.match(remainder) or "?" in remainder or len(remainder.split()) >= 5
        if line["x"] <= line.get("page_width", 2500) * .18 and plausible:
            return True, 10000.0
    if line["x"] > line.get("page_width", 2500) * .22 or SUBPART.match(text) or OPTION.match(text):
        return False, 0.0
    if re.match(r"^(?:Statements?|Step|Sub-headings?|Person|Example|TRUE|FALSE|NOT GIVEN)\b", text, re.I) or re.fullmatch(r"Order(?:\s*\(.*\))?", text, re.I):
        return False, 0.0
    looks_like_prompt = bool(QUESTION_WORDS.match(text) or "?" in text or text.endswith("..."))
    if not looks_like_prompt:
        return False, 0.0
    previous = lines[index - 1] if index else None
    if previous and previous["page"] == line["page"]:
        gap = line["y"] - (previous["y"] + previous["height"])
    else:
        gap = 80
    return False, float(max(gap, 20))


def make_blocks(lines: list[dict], expected_start: int, expected_end: int) -> list[Block]:
    target = expected_end - expected_start + 1
    candidates: dict[int, tuple[bool, float]] = {}
    alternatives: list[tuple[float, int]] = []
    for index, line in enumerate(lines):
        explicit, score = candidate_score(lines, index, expected_start, expected_end)
        if explicit or score:
            candidates[index] = (explicit, score)
        if line["x"] <= 340 and not SUBPART.match(line["text"]) and not OPTION.match(line["text"]):
            previous = lines[index - 1] if index else None
            gap = 80 if not previous or previous["page"] != line["page"] else line["y"] - (previous["y"] + previous["height"])
            if gap >= 24 and len(line["text"]) >= 10:
                alternatives.append((float(gap), index))

    last_explicit_number = expected_start - 1
    for index in sorted(candidates):
        explicit, score = candidates[index]
        if not explicit:
            continue
        match = EXPLICIT_QUESTION.match(lines[index]["text"])
        number = int(match.group(1))
        if number <= last_explicit_number:
            candidates[index] = (False, 80.0)
        else:
            last_explicit_number = number

    explicit_indices = [index for index, value in candidates.items() if value[0]]
    if explicit_indices and min(explicit_indices) > 0:
        first_explicit = min(explicit_indices)
        match = EXPLICIT_QUESTION.match(lines[first_explicit]["text"])
        if match and int(match.group(1)) == expected_start:
            lines = lines[first_explicit:]
            return make_blocks(lines, expected_start, expected_end)

    for score, index in alternatives:
        candidates.setdefault(index, (False, score))

    anchors = []
    last_number = expected_start - 1
    for index, (explicit, _) in sorted(candidates.items()):
        if not explicit:
            continue
        match = EXPLICIT_QUESTION.match(lines[index]["text"])
        number = int(match.group(1))
        if number > last_number:
            anchors.append((number, index))
            last_number = number
    if anchors:
        anchored_starts = []
        previous_number = expected_start - 1
        previous_index = -1
        for number, index in anchors:
            needed = number - previous_number - 1
            pool = [
                (score, candidate_index)
                for candidate_index, (explicit, score) in candidates.items()
                if not explicit and previous_index < candidate_index < index
            ]
            if len(pool) < needed:
                anchored_starts = []
                break
            anchored_starts.extend(sorted(candidate_index for _, candidate_index in sorted(pool, reverse=True)[:needed]))
            anchored_starts.append(index)
            previous_number = number
            previous_index = index
        if anchored_starts:
            needed = expected_end - previous_number
            pool = [
                (score, candidate_index)
                for candidate_index, (explicit, score) in candidates.items()
                if not explicit and candidate_index > previous_index
            ]
            if len(pool) >= needed:
                anchored_starts.extend(sorted(candidate_index for _, candidate_index in sorted(pool, reverse=True)[:needed]))
                if len(anchored_starts) == target:
                    starts = sorted(anchored_starts)
                    return [
                        Block(
                            lines=lines[start:(starts[offset + 1] if offset + 1 < len(starts) else len(lines))],
                            explicit=candidates[start][0],
                            score=candidates[start][1],
                        )
                        for offset, start in enumerate(starts)
                    ]
    while len(candidates) > target:
        removable = [(score, index) for index, (explicit, score) in candidates.items() if not explicit]
        if not removable:
            break
        _, index = min(removable)
        candidates.pop(index)
    if len(candidates) < target:
        used = set(candidates)
        fallback = []
        for index, line in enumerate(lines):
            if index in used or line["x"] > 380 or SUBPART.match(line["text"]) or OPTION.match(line["text"]):
                continue
            previous = lines[index - 1] if index else None
            gap = 0 if not previous or previous["page"] != line["page"] else line["y"] - (previous["y"] + previous["height"])
            fallback.append((gap, index))
        for _, index in sorted(fallback, reverse=True):
            candidates[index] = (False, float(_))
            if len(candidates) >= target:
                break

    starts = sorted(candidates)[:target]
    blocks = []
    for offset, start in enumerate(starts):
        end = starts[offset + 1] if offset + 1 < len(starts) else len(lines)
        explicit, score = candidates[start]
        blocks.append(Block(lines=lines[start:end], explicit=explicit, score=score))
    return blocks


def question_from_block(number: int, block: Block) -> dict:
    texts = [line["text"] for line in block.lines]
    if texts:
        match = EXPLICIT_QUESTION.match(texts[0])
        if match and (int(match.group(1)) == number or (not block.explicit and block.score >= 70)):
            texts[0] = match.group(2) or ""
    texts = [text for text in texts if text and not is_page_noise(text)]
    option_rows = []
    option_indices = []
    for index, text in enumerate(texts):
        match = OPTION.match(text)
        if match:
            option_rows.append({"value": match.group(1).upper(), "label": f"{match.group(1).upper()}. {normalize(match.group(2))}"})
            option_indices.append(index)
    if option_indices and len(texts) - option_indices[0] == 4 and len(option_rows) >= 2:
        first = option_indices[0]
        option_indices = list(range(first, len(texts)))
        option_rows = [
            {"value": chr(65 + offset), "label": f"{chr(65 + offset)}. {re.sub(r'^[A-D1-4][.)]\s*', '', text)}"}
            for offset, text in enumerate(texts[first:])
        ]
    if len(option_rows) < 3 and texts and re.match(r"^(?:Which\b|What is the purpose\b)", texts[0], re.I):
        base_x = block.lines[0]["x"] if block.lines else 0
        inferred = []
        for index, text in enumerate(texts[1:], 1):
            line = block.lines[min(index, len(block.lines) - 1)]
            if line["x"] >= base_x + 45 and 2 <= len(text) <= 130 and not SUBPART.match(text):
                cleaned = re.sub(r"^[1-4A-D][\.)]\s*", "", text, flags=re.I)
                inferred.append((index, cleaned))
        if len(inferred) >= 4:
            inferred = inferred[:4]
            option_indices = [index for index, _ in inferred]
            option_rows = [
                {"value": chr(65 + offset), "label": f"{chr(65 + offset)}. {text}"}
                for offset, (_, text) in enumerate(inferred)
            ]

    subpart_indices = [index for index, text in enumerate(texts) if SUBPART.match(text)]
    if len(subpart_indices) >= 2 and not option_rows:
        first = subpart_indices[0]
        prompt = "\n".join(texts[:first]).strip()
        true_false = re.search(r"\bTrue\b.*\bFalse\b.*\bNot Given\b", prompt, re.I)
        parts = []
        for offset, start in enumerate(subpart_indices):
            end = subpart_indices[offset + 1] if offset + 1 < len(subpart_indices) else len(texts)
            label = "\n".join(texts[start:end]).strip()
            key_match = SUBPART.match(texts[start])
            key = re.sub(r"[^a-z0-9]+", "", key_match.group(0).lower()) or str(offset + 1)
            part = {"key": key, "label": label, "type": "text"}
            if true_false:
                part.update({"type": "choice", "options": ["TRUE", "FALSE", "NOT GIVEN"]})
            parts.append(part)
        question = {"number": number, "group": "paper", "type": "parts", "prompt": prompt or f"Question {number}", "parts": parts}
    elif 2 <= len(option_rows) <= 8 and not re.search(r"\b(?:Match|matching|Sub-headings|Write the letter|correct order)\b", texts[0], re.I):
        first = min(option_indices)
        prompt = "\n".join(text for index, text in enumerate(texts) if index < first).strip()
        question = {"number": number, "group": "paper", "type": "choice", "prompt": prompt or f"Question {number}", "options": option_rows}
        unparsed = [text for index, text in enumerate(texts) if index >= first and index not in option_indices]
        if unparsed:
            # Retain source lines that were not confidently classified as options.
            question["optionBank"] = "\n".join(texts[first:])
    else:
        prompt = "\n".join(texts).strip()
        question = {"number": number, "group": "paper", "type": "textarea", "prompt": prompt or f"Question {number}"}
    if block.figures:
        question["figures"] = [{key: figure[key] for key in ("src", "alt")} for figure in block.figures]
    return question


def build_questions(root: Path, data: dict) -> tuple[list[dict], int, int]:
    override = QUESTION_RANGE_OVERRIDES.get((data["year"], data["section"].lower()))
    expected = list(range(override[0], override[1] + 1)) if override else [question["number"] for question in data["questions"]]
    all_lines = []
    visuals = []
    for page_index, page in enumerate(data.get("structuredQuestionPages", []), 1):
        all_lines.extend(clean_question_lines(page, page_index))
        visuals.extend(crop_visuals(root, data, page, "questions", page_index))
    blocks = make_blocks(all_lines, expected[0], expected[-1])
    for visual in visuals:
        if visual.get("question") in expected:
            blocks[expected.index(visual["question"])].figures.append(visual)
            continue
        candidates = []
        for block in blocks:
            same_page = [line for line in block.lines if line["page"] == visual["page"]]
            if same_page:
                start = min(line["y"] for line in same_page)
                candidates.append((start, block))
        if candidates:
            center = visual["y"] + visual["height"] / 2
            preceding = [item for item in candidates if item[0] <= center]
            target = max(preceding, key=lambda item: item[0]) if preceding else min(candidates, key=lambda item: item[0])
            target[1].figures.append(visual)
    questions = [question_from_block(number, block) for number, block in zip(expected, blocks)]
    return questions, len(visuals), len(blocks)


def convert(root: Path, path: Path, write: bool) -> dict:
    data = json.loads(path.read_text())
    if data.get("displayMode") != "structured-paper":
        return {"file": path.name, "skipped": True}
    paragraphs, passage_visuals = build_paragraphs(root, data)
    questions, question_visuals, block_count = build_questions(root, data)
    override = QUESTION_RANGE_OVERRIDES.get((data["year"], data["section"].lower()))
    expected_question_count = override[1] - override[0] + 1 if override else len(data["questions"])
    report = {
        "file": path.name,
        "paragraphs": len(paragraphs),
        "questions": len(questions),
        "expectedQuestions": expected_question_count,
        "visuals": passage_visuals + question_visuals,
        "complete": block_count == expected_question_count,
    }
    if write and report["complete"]:
        data.pop("displayMode", None)
        data.pop("structuredPassagePages", None)
        data.pop("structuredQuestionPages", None)
        data["paragraphs"] = paragraphs
        data["instructions"] = {"paper": "Answer every question using the passage."}
        data["questions"] = questions
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


def main() -> None:
    args = parse_args()
    root = args.root.resolve()
    years = (args.year,) if args.year else PAPER_YEARS
    sections = (args.section,) if args.section else SECTIONS
    reports = []
    for year in years:
        for section in sections:
            path = root / "dse-reading-data" / f"dse-{year}-{section}.json"
            reports.append(convert(root, path, args.write))
    for report in reports:
        print(json.dumps(report, ensure_ascii=False))
    failures = [report for report in reports if not report.get("skipped") and not report["complete"]]
    if failures:
        raise SystemExit(f"Question block count mismatch in {len(failures)} exercise(s).")


if __name__ == "__main__":
    main()
