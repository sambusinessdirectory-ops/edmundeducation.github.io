#!/usr/bin/env python3
"""Import Edmund's Passage 2 analysis PDFs into deterministic website JSON.

The PDFs are teacher-authored documents with a consistent semantic structure but
several visual/template variants.  This importer deliberately keeps the source
text intact while turning answer keys, paragraph roadmaps, question groups and
analysis stages into the data model used by the reading-analysis portal.

Usage:
  python tools/import-ielts-reading-analysis-p2.py --check
  python tools/import-ielts-reading-analysis-p2.py --write
  python tools/import-ielts-reading-analysis-p2.py --write --source-dir /path/to/pdfs
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "tools/ielts-reading-analysis-p2-import-manifest.json"
REPORT_PATH = ROOT / "tools/ielts-reading-analysis-p2-import-report.json"
OUTPUT_DIR = ROOT / "ielts-reading-analysis-data"
AVAILABILITY_PATH = ROOT / "ielts-reading-analysis-availability.js"
IMPORT_VERSION = "2026-08-20.1"
AVAILABILITY_VERSION = "2026-08-20.1"

QUESTION_LINE = re.compile(r"^Question\s+(\d+)\s*$", re.IGNORECASE)
QUESTION_RANGE_LINE = re.compile(
    r"^Questions\s+(\d+)\s*[–—-]\s*(\d+)\s*$", re.IGNORECASE
)
GROUP_LINE = re.compile(
    r"^(?:(?:Part|Section)\s+\d+\s*(?:[—–-]|[:：])\s*)?Questions?\s+"
    r"(\d+)(?:\s*[–—-]\s*(\d+))?\s*[:：]?\s*(.*)$",
    re.IGNORECASE,
)
PARAGRAPH_LINE = re.compile(
    r"^Paragraph\s+([A-Z]|\d+)\s*(?:Roadmap)?\s*$", re.IGNORECASE
)
PARAGRAPH_INLINE = re.compile(
    r"^Paragraph\s+([A-Z]|\d+)\s*(?:Roadmap)?\s*[:：]\s*(.+)$", re.IGNORECASE
)
ANSWER_LINE = re.compile(
    r"^(\d+)(?:\s*[–—-]\s*(\d+))?\s*[.)]?\s+(.+?)\s*$"
)
SECTION_PREFIXES = (
    "題型",
    "Skim",
    "Scan",
    "Read",
    "同義",
    "中伏",
    "選項分析",
)
FIELD_LABELS = (
    "答案",
    "題目",
    "題目句子",
    "題目資訊",
    "完整句子",
    "中文意思",
)
INLINE_FIELD_LINE = re.compile(
    r"^(答案|題目|題目句子|題目資訊|完整句子|中文意思)\s*[:：]",
)
OVERVIEW_HEADING_LINE = re.compile(
    r"(?:Skim\s+Roadmap|Paragraph\s+Map)",
    re.IGNORECASE,
)
OVERVIEW_CUSTOM_LABEL = re.compile(
    r"^(?:(?:Intro(?:ductory)?|Opening)\s+paragraph(?:\s+(\d+))?|"
    r"Introduction|Lead[- ]in|導語)$",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class Group:
    start: int
    end: int
    title: str
    body: list[str]


def load_manifest() -> dict[str, Any]:
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def load_previous_source_rows() -> dict[str, dict[str, Any]]:
    """Index the last successful import so unavailable earlier batches survive.

    The teacher supplies the PDF corpus in batches and may replace the desktop
    source folder between imports.  A missing source is therefore recoverable
    only when both its prior report row and its validated generated article are
    still present.  Newly listed or otherwise unverified missing PDFs remain a
    hard error.
    """

    if not REPORT_PATH.is_file():
        return {}
    report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
    return {
        row["filename"]: row
        for row in report.get("sources", [])
        if row.get("filename") and row.get("articleId") and row.get("sha256")
    }


def load_cached_article(
    source: dict[str, Any],
    previous_rows: dict[str, dict[str, Any]],
) -> tuple[str, dict[str, Any]]:
    """Load a prior generated article for a source absent from this batch."""

    filename = source["filename"]
    row = previous_rows.get(filename)
    if row is None:
        raise ValueError("no successful prior import-report row")
    article_path = OUTPUT_DIR / f"{row['articleId']}.json"
    if not article_path.is_file():
        raise ValueError(f"cached article is missing: {article_path.name}")
    article = json.loads(article_path.read_text(encoding="utf-8"))
    if article.get("id") != row["articleId"]:
        raise ValueError("cached article ID does not match the prior report")
    digest = row["sha256"]
    if article.get("source", {}).get("sha256") != digest:
        raise ValueError("cached article checksum does not match the prior report")
    if not set(source["catalogueIds"]).issubset(set(article.get("catalogueIds", []))):
        raise ValueError("cached article does not cover the manifest catalogue IDs")
    return digest, article


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def slugify(value: str) -> str:
    normalised = unicodedata.normalize("NFKD", value)
    ascii_value = normalised.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")
    return slug or "analysis"


def clean_line(value: str) -> str:
    return (
        value.replace("\u00a0", " ")
        .replace("\u200b", "")
        .replace("\ufeff", "")
        .rstrip()
        .strip()
    )


def extract_pdf(path: Path) -> tuple[list[str], int]:
    pages: list[str] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text(x_tolerance=2, y_tolerance=3) or "")
        page_count = len(pdf.pages)
    lines = [clean_line(line) for line in "\n".join(pages).splitlines()]
    return [line for line in lines if line], page_count


def is_answer_heading(line: str) -> bool:
    compact = re.sub(r"\s+", "", line).lower()
    return compact.endswith(("答案總表", "答案表", "answerkey"))


def is_group_heading(line: str) -> bool:
    match = GROUP_LINE.match(line)
    if not match:
        return False
    # Singular standalone "Question 4" is a question marker, not a group.
    if QUESTION_LINE.match(line):
        return False
    # An exact plural range is a combined question marker, unless it is the
    # first boundary for a new group (handled contextually by parse_groups).
    return True


def answer_region(lines: list[str]) -> tuple[int, int] | None:
    start = next((i for i, line in enumerate(lines) if is_answer_heading(line)), None)
    if start is None:
        return None
    end = len(lines)
    for i in range(start + 1, len(lines)):
        line = lines[i]
        if (
            is_group_heading(line)
            or QUESTION_LINE.match(line)
            or line.lower().startswith("skim roadmap")
            or line.startswith("全文 Skim")
            or line.lower() == "paragraph map"
            or re.match(r"^Part\s+\d+\s*[—–-]\s*Skim", line, re.I)
            or PARAGRAPH_LINE.match(line)
        ):
            end = i
            break
    return start, end


def split_answer_values(value: str) -> list[str]:
    return [part.strip() for part in re.split(r"\s*[,，]\s*", value) if part.strip()]


def parse_answer_key(lines: list[str]) -> tuple[int, list[str]]:
    region = answer_region(lines)
    if region is None:
        raise ValueError("Answer key heading not found")
    start, end = region
    rows: list[tuple[int, int, list[str]]] = []
    active_row: int | None = None
    continuation_count = 0
    for line in lines[start + 1 : end]:
        if re.sub(r"\s+", "", line).lower() in {"題號答案", "questionanswer", "questionanswerkey"}:
            active_row = None
            continue
        match = ANSWER_LINE.match(line)
        if not match:
            if (
                active_row is not None
                and continuation_count < 2
                and len(line) <= 45
                and not re.search(r"[\u3400-\u9fff]", line)
                and not re.search(r"[。！？!?]", line)
                and not re.match(
                    r"^(?:Questio|n|小提示|小提醒|重要|Question|題目|SECTION|Part|Skim|全文|第\s*\d+\s*題)",
                    line,
                    re.I,
                )
            ):
                rows[active_row][2].append(line)
                continuation_count += 1
            else:
                active_row = None
            continue
        first = int(match.group(1))
        last = int(match.group(2) or first)
        rows.append((first, last, [match.group(3).strip()]))
        active_row = len(rows) - 1
        continuation_count = 0

    answers: dict[int, str] = {}
    for first, last, value_parts in rows:
        value = smart_join(value_parts)
        if last == first:
            answers[first] = value
            continue
        values = split_answer_values(value)
        count = last - first + 1
        if len(values) == count and all(len(item) <= 30 for item in values):
            for offset, item in enumerate(values):
                answers[first + offset] = item
        elif 1 < len(values) < count and all(len(item) <= 30 for item in values):
            # Preserve every supplied answer in order, but make an incomplete
            # grouped answer row explicit.  Repeating `C, D, E` across all
            # four Questions 1–4 would falsely imply that the source provided
            # a fourth supported option.
            for offset, item in enumerate(values):
                answers[first + offset] = item
            for offset in range(len(values), count):
                answers[first + offset] = f"原 PDF 未提供第 {offset + 1} 個答案"
        else:
            # Some source files explicitly say a diagram is missing.  Do not
            # invent arrow-to-label mappings; make that limitation visible.
            fallback = "需參考題圖" if "diagram" in value.lower() or "無法" in value else value
            for number in range(first, last + 1):
                answers[number] = fallback

    if not answers:
        raise ValueError("Answer key contains no recognised answers")
    minimum = min(answers)
    maximum = max(answers)
    missing = [number for number in range(minimum, maximum + 1) if number not in answers]
    if missing:
        raise ValueError(f"Answer key is missing questions: {missing}")
    return minimum, [answers[number] for number in range(minimum, maximum + 1)]


def smart_join(parts: Iterable[str]) -> str:
    result = ""
    for raw in parts:
        part = raw.strip()
        if not part:
            continue
        if not result:
            result = part
            continue
        if result.endswith("-") and re.match(r"^[A-Za-z]", part):
            result += part
        elif part.lower() in {"s", "es"} and result[-1:].isalpha():
            result += part
        elif re.search(r"[A-Za-z0-9)]$", result) and re.match(r"^[A-Za-z0-9(]", part):
            result += " " + part
        elif re.search(r"[，。！？；：,.!?;:’”\]\)]$", result):
            result += " " + part if re.match(r"^[A-Za-z0-9]", part) else part
        elif re.match(r"^[，。！？；：,.!?;:’”\]\)]", part):
            result += part
        else:
            result += part
    return re.sub(r"\s+", " ", result).strip()


def paragraph_chunks(lines: list[str]) -> list[str]:
    """Join PDF soft wraps but keep authored sentence/label boundaries."""
    chunks: list[str] = []
    buffer: list[str] = []

    def flush() -> None:
        if buffer:
            value = smart_join(buffer)
            if value:
                chunks.append(value)
            buffer.clear()

    quote_open = False
    for line in lines:
        # Inline fields must start a fresh chunk.  In particular, an inline
        # Chinese translation often follows a wrapped English prompt; joining
        # the two would place both languages in `prompt` and leave
        # `translation` empty.
        if INLINE_FIELD_LINE.match(line):
            flush()
            chunks.append(line)
            continue
        # Labels and analysis headings should stand alone.
        if is_field_label(line) or section_heading(line) is not None:
            flush()
            chunks.append(line)
            continue

        starts_quote = line.startswith(("“", '"'))
        if starts_quote and not quote_open:
            flush()
            quote_open = True
        buffer.append(line)
        if quote_open:
            if line.endswith(("”", '"', "”。”", '".')):
                flush()
                quote_open = False
            continue
        if re.search(r"[。！？!?](?:[”\"])?$", line):
            flush()
    flush()
    return chunks


def answer_table_last_row(lines: list[str], limit: int) -> int | None:
    """Return the final answer-row *or continuation* before ``limit``.

    Teacher caveats and roadmap introductions can sit immediately after the
    answer table.  They are source content, not part of the final answer.  A
    concrete row boundary lets the overview parser retain those notes without
    dragging the answer table itself into the roadmap heading.  The final
    answer may itself wrap across PDF lines (for example ``marine`` followed
    by ``chronometer``), so use the same conservative continuation rules as
    ``parse_answer_key``; otherwise the wrapped tail leaks into sourceNotes.
    """

    answer_start = next(
        (i for i, line in enumerate(lines[:limit]) if is_answer_heading(line)),
        None,
    )
    if answer_start is None:
        return None
    last_row: int | None = None
    active_row = False
    continuation_count = 0
    for i in range(answer_start + 1, limit):
        line = lines[i]
        if re.sub(r"\s+", "", line).lower() in {"題號答案", "questionanswer", "questionanswerkey"}:
            active_row = False
            continue
        if ANSWER_LINE.match(line):
            last_row = i
            active_row = True
            continuation_count = 0
            continue
        if (
            active_row
            and continuation_count < 2
            and len(line) <= 45
            and not re.search(r"[\u3400-\u9fff]", line)
            and not re.search(r"[。！？!?]", line)
            and not re.match(
                r"^(?:Questio|n|小提示|小提醒|重要|Question|題目|SECTION|Part|Skim|全文|第\s*\d+\s*題)",
                line,
                re.I,
            )
        ):
            last_row = i
            continuation_count += 1
            continue
        active_row = False
    return last_row


def source_note_chunks(lines: list[str]) -> list[str]:
    """Turn pre-roadmap caveats into a few readable, lossless notes."""

    if not lines:
        return []

    # A missing diagram can be documented with several source quotations and
    # their Chinese translations.  Keep those pairs together instead of
    # emitting every label and quotation as a separate one-line note.
    evidence_start = next(
        (i for i, line in enumerate(lines) if line.startswith("文章只提供") and line.endswith(("：", ":"))),
        None,
    )
    if evidence_start is not None and "中文意思：" in lines[evidence_start + 1 :]:
        notes: list[str] = []
        preface = list(lines[:evidence_start])
        if len(preface) > 1 and preface[0].startswith("重要說明：") and not re.search(
            r"[。！？.!?]$", preface[0]
        ):
            preface[0] += "。"
        if preface:
            # Keep the Chinese full stop as the visual boundary; an extra
            # ASCII space before the following English label looks like a PDF
            # extraction artefact in the rendered note.
            notes.append(re.sub(r"([。！？])\s+(?=[A-Za-z])", r"\1", smart_join(preface)))

        evidence_parts = [lines[evidence_start]]
        i = evidence_start + 1
        while i < len(lines):
            if (
                lines[i].startswith(("“", '"'))
                and i + 2 < len(lines)
                and lines[i + 1].rstrip("：:") == "中文意思"
            ):
                evidence_parts.append(f"{lines[i]}（中文意思：{lines[i + 2]}）")
                i += 3
                continue
            break
        evidence = evidence_parts[0]
        if len(evidence_parts) > 1:
            # The introductory label already ends with a colon.  Attach the
            # first quotation directly, then separate later quotation pairs
            # with semicolons (avoids the malformed sequence `：；`).
            evidence += evidence_parts[1]
            if len(evidence_parts) > 2:
                evidence += "；" + "；".join(evidence_parts[2:])
        notes.append(evidence)
        conclusion = smart_join(lines[i:])
        if conclusion:
            notes.append(conclusion)
        return notes

    # Some diagram notes use a compact two-column text table.  Rebuild its
    # rows with Chinese colons and semicolons so the labels do not collapse
    # into one unreadable run-on string.
    table_heading = next(
        (i for i, line in enumerate(lines) if "圖上部位 / 描述" in line),
        None,
    )
    if table_heading is not None:
        row_parts: list[str] = []
        i = table_heading + 1
        while i < len(lines) and not lines[i].startswith(("如果", "因為")):
            row = re.match(r"^(.+?)\s+([A-Za-z][A-Za-z /-]*)$", lines[i])
            if not row:
                break
            row_parts.append(f"{row.group(1).strip()}：{row.group(2).strip()}")
            i += 1
        intro = lines[0]
        if row_parts:
            intro = f"{intro}{'；'.join(row_parts)}。"
        conclusion = smart_join(lines[i:])
        return [note for note in (intro, conclusion) if note]

    prepared = list(lines)
    if (
        len(prepared) > 1
        and prepared[0].startswith("重要說明：")
        and not re.search(r"[。！？.!?]$", prepared[0])
    ):
        prepared[0] += "。"
    notes = paragraph_chunks(prepared)
    merged: list[str] = []
    for note in notes:
        if merged and len(note.strip()) < 10:
            merged[-1] = smart_join([merged[-1], note])
        else:
            merged.append(note)
    return merged


def parse_overview(
    lines: list[str],
    analysis_start: int,
) -> tuple[dict[str, Any] | None, list[str]]:
    preamble = lines[:analysis_start]

    heading_candidates = [
        i
        for i, line in enumerate(preamble)
        if OVERVIEW_HEADING_LINE.search(line)
    ]
    # Introductory teacher notes may mention that a Skim Roadmap will follow.
    # The actual roadmap heading is the final matching heading before the
    # paragraph labels begin.
    heading_index = heading_candidates[-1] if heading_candidates else None

    starts: list[tuple[int, str, str | None]] = []
    for i, line in enumerate(preamble):
        if heading_index is not None and i <= heading_index:
            continue
        standalone = PARAGRAPH_LINE.match(line)
        inline = PARAGRAPH_INLINE.match(line)
        if standalone:
            starts.append((i, standalone.group(1).upper(), None))
        elif inline:
            starts.append((i, inline.group(1).upper(), inline.group(2).strip()))

    # Some passages begin with one or more explicitly named introductions and
    # then continue with Paragraph A, B, ... .  Preserve every such label
    # instead of dragging its prose into the roadmap title.
    if heading_index is not None:
        for i, line in enumerate(preamble[heading_index + 1 :], heading_index + 1):
            custom = OVERVIEW_CUSTOM_LABEL.match(line)
            if not custom:
                continue
            number = f"Intro {custom.group(1)}" if custom.group(1) else "Intro"
            starts.append((i, number, line))
        starts.sort(key=lambda item: item[0])

    custom_starts: list[tuple[int, str]] = []
    if not starts:
        if heading_index is not None:
            for i in range(heading_index + 1, len(preamble) - 1):
                line = preamble[i]
                next_line = preamble[i + 1]
                if (
                    1 <= len(line) <= 36
                    and not re.search(r"[。！？!?：:]$", line)
                    and not re.match(r"^(?:Questio|Answer|答案|題號)", line, re.I)
                    and len(next_line) >= 30
                ):
                    custom_starts.append((i, line))
        if not custom_starts:
            return None, []

    first_start = starts[0][0] if starts else custom_starts[0][0]
    heading_extra_lines: list[str] = []
    if heading_index is not None:
        # A roadmap heading is sometimes wrapped over two PDF lines.  Its
        # continuation lies between the explicit heading and the first
        # paragraph label.  Only short title-like continuation lines belong in
        # the heading: some PDFs put a full Golden Manual instruction in the
        # same gap, which must remain visible as a source note rather than
        # polluting the title.
        heading_lines = [preamble[heading_index]]
        in_heading_extra = False
        for line in preamble[heading_index + 1 : first_start]:
            candidate = smart_join(heading_lines + [line])
            if (
                not in_heading_extra
                and len(line) <= 36
                and len(candidate) <= 80
                and not re.search(r"[。！？.!?]$", line)
            ):
                heading_lines.append(line)
            else:
                in_heading_extra = True
                heading_extra_lines.append(line)
        heading = smart_join(heading_lines)
    else:
        heading = "全文 Skim Roadmap"

    source_notes: list[str] = []
    last_answer_row = answer_table_last_row(preamble, heading_index or first_start)
    if heading_index is not None and last_answer_row is not None:
        note_lines = preamble[last_answer_row + 1 : heading_index]
        source_notes = source_note_chunks(note_lines)
    if heading_extra_lines:
        source_notes.extend(source_note_chunks(heading_extra_lines))

    paragraphs: list[dict[str, str]] = []
    overview_starts = starts if starts else [
        (line_index, str(position + 1), label)
        for position, (line_index, label) in enumerate(custom_starts)
    ]
    overview_answer_index = next(
        (
            i for i in range(first_start + 1, len(preamble))
            if is_answer_heading(preamble[i])
        ),
        None,
    )
    for position, (line_index, number, initial_or_label) in enumerate(overview_starts):
        next_index = overview_starts[position + 1][0] if position + 1 < len(overview_starts) else len(preamble)
        if overview_answer_index is not None and line_index < overview_answer_index < next_index:
            next_index = overview_answer_index
        if starts:
            if number.startswith("Intro"):
                initial = None
                label = initial_or_label
            else:
                initial = initial_or_label
                label = None
        else:
            initial = None
            label = initial_or_label
        summary_parts = ([initial] if initial else []) + preamble[line_index + 1 : next_index]
        summary = smart_join(summary_parts)
        if summary:
            row = {"number": number, "summary": summary}
            if label:
                row["label"] = label
            paragraphs.append(row)
    if not paragraphs:
        return None, source_notes
    return {
        "title": heading,
        "intro": "先掌握每段的功能與主旨，再進入逐題定位和細讀分析。",
        "paragraphs": paragraphs,
    }, source_notes


def parse_groups(lines: list[str]) -> tuple[list[Group], int]:
    boundaries: list[tuple[int, re.Match[str]]] = []
    for i, line in enumerate(lines):
        match = GROUP_LINE.match(line)
        if not match or QUESTION_LINE.match(line):
            continue
        if re.match(r"^Question\s+\d+", line, re.I) and not re.match(r"^Questions\s+", line, re.I):
            next_line = lines[i + 1] if i + 1 < len(lines) else ""
            next_marker = QUESTION_LINE.match(next_line)
            if not next_marker or int(next_marker.group(1)) != int(match.group(1)):
                continue
        prefix = bool(re.match(r"^(?:Part|Section)\s+\d+", line, re.I))
        has_colon = bool(
            re.match(
                r"^(?:(?:Part|Section)\s+\d+\s*(?:[—–-]|[:：])\s*)?"
                r"Questions?\s+\d+(?:\s*[–—-]\s*\d+)?\s*[:：]",
                line,
                re.I,
            )
        )
        tail = (match.group(3) or "").strip()
        has_type_keyword = len(tail) <= 60 and bool(
            re.search(
                r"(?:\b(?:Matching|TRUE|FALSE|NOT|YES|NO|Summary|Sentence|Multiple|Choose|"
                r"Diagram|Short|Notes|Completion|Classification|Headings|Information)\b|"
                r"題型|詳細分析)",
                tail,
                re.I,
            )
        )
        # Exact plural ranges inside an existing group are combined-unit
        # markers, not new group headings.  A group heading either contains a
        # type/title or occurs before any group has started.
        exact_range = QUESTION_RANGE_LINE.match(line)
        if exact_range and boundaries and not tail:
            continue
        if not (prefix or has_colon or has_type_keyword or (exact_range and not boundaries)):
            continue
        boundaries.append((i, match))

    # Teacher notes between the answer table and the first analysed question
    # can mention a later range (for example, "Questions 19-21 ..."). Such a
    # sentence resembles a group heading but is not a section boundary. The
    # actual first heading is the final candidate immediately before the first
    # singular Question marker.
    first_question_index = next(
        (i for i, line in enumerate(lines) if QUESTION_LINE.match(line)),
        None,
    )
    if first_question_index is not None:
        pre_question = [item for item in boundaries if item[0] < first_question_index]
        if len(pre_question) > 1:
            retained_pre_question: list[tuple[int, re.Match[str]]] = []
            next_start = sys.maxsize
            for item in reversed(pre_question):
                start = int(item[1].group(1))
                if start < next_start:
                    retained_pre_question.append(item)
                    next_start = start
            retained_pre_question.reverse()
            retained_indexes = {item[0] for item in retained_pre_question}
            boundaries = [
                item for item in boundaries
                if item[0] >= first_question_index or item[0] in retained_indexes
            ]

    if not boundaries:
        first_question = next(
            ((i, int(match.group(1))) for i, line in enumerate(lines) if (match := QUESTION_LINE.match(line))),
            None,
        )
        if first_question is None:
            raise ValueError("No Questions group headings found")
        return [Group(first_question[1], first_question[1], "Question Analysis", lines[first_question[0] :])], first_question[0]

    groups: list[Group] = []
    # Some authored PDFs move directly from the answer table into Question 1
    # and introduce a plural group heading only later.  Preserve those early
    # standalone questions as an implicit group instead of starting halfway
    # through the article.
    first_boundary_index = boundaries[0][0]
    early_markers = [
        (i, int(match.group(1)))
        for i, line in enumerate(lines[:first_boundary_index])
        if (match := QUESTION_LINE.match(line))
    ]
    if early_markers:
        first_line, first_number = early_markers[0]
        last_number = early_markers[-1][1]
        groups.append(Group(
            first_number,
            last_number,
            "Question Analysis",
            lines[first_line:first_boundary_index],
        ))
    for position, (line_index, match) in enumerate(boundaries):
        next_index = boundaries[position + 1][0] if position + 1 < len(boundaries) else len(lines)
        start = int(match.group(1))
        end = int(match.group(2) or start)
        title_tail = (match.group(3) or "").strip()
        title = title_tail
        body_start = line_index + 1
        if not title and body_start < next_index and len(lines[body_start]) < 60:
            # Handles wrapped headings such as "Questions 1–6：TRUE / FALSE / NOT" + "GIVEN".
            candidate = lines[body_start]
            if (
                not QUESTION_LINE.match(candidate)
                and not QUESTION_RANGE_LINE.match(candidate)
                and re.search(
                    r"(?:\b(?:Matching|TRUE|FALSE|NOT|YES|NO|Summary|Sentence|Multiple|Choose|"
                    r"Diagram|Short|Notes|Completion|Classification|Headings|Information)\b|"
                    r"題型|詳細分析)",
                    candidate,
                    re.I,
                )
            ):
                title = candidate
                body_start += 1
        if title and body_start < next_index:
            candidate = lines[body_start]
            if (
                len(candidate) < 45
                and not QUESTION_LINE.match(candidate)
                and not QUESTION_RANGE_LINE.match(candidate)
                and re.search(r"(?:Information|Questions|GIVEN|Completion)$", candidate, re.I)
            ):
                title = f"{title} {candidate}".strip()
                body_start += 1
        body = lines[body_start:next_index]
        if body:
            groups.append(Group(start, end, title or "Question Analysis", body))
    return groups, boundaries[0][0]


def split_group_units(group: Group) -> list[tuple[list[int], list[str], str | None]]:
    raw_markers: list[tuple[int, list[int], bool, str | None]] = []
    typed_for_next: dict[int, str] = {}
    for i, line in enumerate(group.body):
        typed = re.match(r"^Question\s+(\d+)\s*[:：]\s*(.+)$", line, re.I)
        if typed:
            number = int(typed.group(1))
            title = typed.group(2).strip()
            next_line = group.body[i + 1] if i + 1 < len(group.body) else ""
            next_single = QUESTION_LINE.match(next_line)
            if next_single and int(next_single.group(1)) == number:
                typed_for_next[i + 1] = title
            else:
                raw_markers.append((i, [number], False, title))
            continue
        single = QUESTION_LINE.match(line)
        if single:
            raw_markers.append((i, [int(single.group(1))], False, typed_for_next.get(i)))
            continue
        combined = QUESTION_RANGE_LINE.match(line)
        if combined:
            first, last = int(combined.group(1)), int(combined.group(2))
            raw_markers.append((i, list(range(first, last + 1)), True, None))

    markers: list[tuple[int, list[int], str | None]] = []
    for marker_index, (line_index, numbers, combined, override) in enumerate(raw_markers):
        next_combined_index = next(
            (
                later_line
                for later_line, _, later_combined, _ in raw_markers[marker_index + 1 :]
                if later_combined
            ),
            len(group.body),
        )
        has_individual_children = combined and any(
            not later_combined
            and later_line < next_combined_index
            and later_numbers[0] in numbers
            for later_line, later_numbers, later_combined, _ in raw_markers[marker_index + 1 :]
        )
        if not has_individual_children:
            markers.append((line_index, numbers, override))

    if not markers:
        return [(list(range(group.start, group.end + 1)), group.body, None)]

    first_marked_number = min(markers[0][1])
    leading_numbers = [
        number
        for number in range(group.start, group.end + 1)
        if number < first_marked_number
    ]
    if leading_numbers:
        markers.insert(0, (-1, leading_numbers, None))

    units: list[tuple[list[int], list[str], str | None]] = []
    for position, (line_index, numbers, override) in enumerate(markers):
        next_index = markers[position + 1][0] if position + 1 < len(markers) else len(group.body)
        units.append((numbers, group.body[line_index + 1 : next_index], override))
    return units


def is_field_label(line: str) -> bool:
    stripped = line.rstrip("：:").strip()
    return stripped in FIELD_LABELS and line.endswith(("：", ":"))


def field_name(line: str) -> str | None:
    stripped = line.rstrip("：:").strip()
    if stripped in {"題目", "題目句子", "題目資訊", "完整句子"}:
        return "prompt"
    if stripped == "中文意思":
        return "translation"
    if stripped == "答案":
        return "answer"
    return None


def section_heading(line: str) -> tuple[str, str, str] | None:
    if not line.startswith(SECTION_PREFIXES):
        return None
    colon_positions = [pos for token in ("：", ":") if (pos := line.find(token)) >= 0]
    if not colon_positions:
        if len(line) <= 28:
            head, remainder = line, ""
        else:
            return None
    else:
        colon = min(colon_positions)
        if colon > 30:
            return None
        head, remainder = line[:colon], line[colon + 1 :].strip()
    if head.startswith("題型"):
        section_id = "task"
    elif head.startswith("Skim"):
        section_id = "skim"
    elif head.startswith("Scan"):
        section_id = "scan"
    elif head.startswith("Read"):
        section_id = "read"
    elif head.startswith("同義"):
        section_id = "paraphrase"
    elif head.startswith("中伏"):
        section_id = "trap"
    else:
        section_id = "options"
    title = head.strip() or line.strip()
    return section_id, title, remainder


def block_from_text(text: str) -> dict[str, str]:
    stripped = text.strip()
    if stripped.startswith(("“", '"')) and stripped.endswith(("”", '"')):
        return {"kind": "quote", "text": stripped}
    if stripped.endswith(("：", ":")) and len(stripped) <= 36:
        return {"kind": "label", "text": stripped}
    return {"kind": "paragraph", "text": stripped}


def parse_unit(
    numbers: list[int],
    lines: list[str],
    group_title: str,
    answer_key: list[str],
    question_number_start: int,
) -> dict[str, Any]:
    chunks = paragraph_chunks(lines)
    fields: dict[str, str] = {}
    residual: list[str] = []
    active_field: str | None = None
    continuing_field: str | None = None

    def field_value_is_complete(value: str) -> bool:
        return bool(re.search(r"[。！？.!?](?:[’'\"”])?$", value.strip()))

    first_section = next(
        (i for i, chunk in enumerate(chunks) if section_heading(chunk) is not None),
        len(chunks),
    )
    for i, chunk in enumerate(chunks):
        inline_field = re.match(r"^(答案|題目|題目句子|題目資訊|完整句子|中文意思)\s*[:：]\s*(.+)$", chunk)
        if i < first_section and inline_field:
            key = field_name(inline_field.group(1) + "：")
            if key and key not in fields:
                fields[key] = inline_field.group(2).strip()
                continuing_field = (
                    key
                    if key in {"prompt", "translation"}
                    and not field_value_is_complete(fields[key])
                    else None
                )
            active_field = None
            continue
        if i < first_section and is_field_label(chunk):
            active_field = field_name(chunk)
            continuing_field = None
            continue
        if i < first_section and active_field and active_field not in fields:
            fields[active_field] = chunk
            continuing_field = (
                active_field
                if active_field in {"prompt", "translation"}
                and not field_value_is_complete(fields[active_field])
                else None
            )
            active_field = None
        elif i < first_section and continuing_field:
            fields[continuing_field] = smart_join([fields[continuing_field], chunk])
            if field_value_is_complete(fields[continuing_field]):
                continuing_field = None
        else:
            active_field = None
            continuing_field = None
            residual.append(chunk)

    explicit_answer = fields.get("answer", "")
    if len(explicit_answer) > 240 or re.search(
        r"(?:目標段落|題目要求|中文意思|Skim|Scan|Read)", explicit_answer
    ):
        explicit_answer = ""
    if not explicit_answer:
        values = [
            answer_key[number - question_number_start]
            for number in numbers
            if 0 <= number - question_number_start < len(answer_key)
        ]
        explicit_answer = values[0] if values and len(set(values)) == 1 else ", ".join(values)

    sections: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    preface: list[dict[str, str]] = []
    for chunk in residual:
        heading = section_heading(chunk)
        if heading is not None:
            section_id, title, remainder = heading
            current = {"id": section_id, "title": title, "blocks": []}
            sections.append(current)
            if remainder:
                current["blocks"].append(block_from_text(remainder))
            continue
        block = block_from_text(chunk)
        if current is None:
            preface.append(block)
        else:
            current["blocks"].append(block)

    if preface:
        sections.insert(0, {"id": "context", "title": "題目與答案重點", "blocks": preface})
    if not sections:
        sections = [{"id": "analysis", "title": "解卷分析", "blocks": [
            {"kind": "paragraph", "text": smart_join(lines)}
        ]}]

    # Remove empty sections but never discard authored text.
    sections = [section for section in sections if section["blocks"]]
    first, last = numbers[0], numbers[-1]
    result: dict[str, Any] = {
        "number": first,
        "answer": explicit_answer,
        "answerKey": explicit_answer,
        "type": group_title,
        "prompt": fields.get("prompt", f"Questions {first}–{last}" if last > first else f"Question {first}"),
        "translation": fields.get("translation", "請依照下方步驟完成定位、細讀與答案判斷。"),
        "sections": sections,
    }
    if last > first:
        result["numbers"] = numbers
    return result


def parse_article(
    source: dict[str, Any],
    path: Path,
    digest: str,
) -> dict[str, Any]:
    lines, page_count = extract_pdf(path)
    truncate_after = source.get("truncateAfterLine")
    if truncate_after:
        try:
            truncate_index = lines.index(truncate_after)
        except ValueError as error:
            raise ValueError(
                f"Configured truncation marker was not found: {truncate_after}"
            ) from error
        lines = lines[: truncate_index + 1]
    question_number_start, answer_key = parse_answer_key(lines)
    groups, analysis_start = parse_groups(lines)
    questions: list[dict[str, Any]] = []
    seen_question_numbers: set[int] = set()
    for group in groups:
        for numbers, unit_lines, type_override in split_group_units(group):
            overlap = seen_question_numbers.intersection(numbers)
            if overlap:
                if set(numbers).issubset(seen_question_numbers) and len(unit_lines) <= 5:
                    # A few PDFs finish with brief teacher reminders beginning
                    # "Questions N-M ...". They are notes, not a second copy of
                    # the already completed analysis units.
                    continue
                raise ValueError(
                    f"analysis repeats questions {sorted(overlap)} in a full content unit"
                )
            questions.append(parse_unit(
                numbers,
                unit_lines,
                type_override or group.title,
                answer_key,
                question_number_start,
            ))
            seen_question_numbers.update(numbers)

    coverage = Counter(
        number
        for question in questions
        for number in question.get("numbers", [question["number"]])
    )
    covered = sorted(coverage)
    expected = list(range(question_number_start, question_number_start + len(answer_key)))
    if covered != expected:
        raise ValueError(f"analysis coverage {covered} does not match answer key {expected}")
    duplicates = [number for number, count in coverage.items() if count != 1]
    if duplicates:
        raise ValueError(f"analysis contains duplicate question coverage: {duplicates}")

    primary_id = source["catalogueIds"][0]
    article_id = f"{primary_id}-{slugify(source['title'])}"
    article: dict[str, Any] = {
        "id": article_id,
        "catalogueId": primary_id,
        "catalogueIds": source["catalogueIds"],
        "passage": 2,
        "title": source["title"],
        "eyebrow": "IELTS Reading · Passage 2",
        "description": "完整答案表、全文段落速覽，以及逐題 Skim、Scan、Read、同義改寫與中伏位分析。",
        "questionCount": len(answer_key),
        "questionNumberStart": question_number_start,
        "answerKey": answer_key,
        "questions": questions,
        "source": {
            "filename": source["filename"],
            "sha256": digest,
            "pageCount": page_count,
        },
        "version": IMPORT_VERSION,
    }
    overview, source_notes = parse_overview(lines, analysis_start)
    # Some source PDFs place an important diagram/option caveat inside a later
    # question group instead of beside the answer table.  Those notes are
    # recorded verbatim in the manifest so an incremental re-import cannot
    # silently turn an inferred arrow mapping into an apparently definitive
    # answer.  Merge and de-duplicate both note sources.
    source_notes = list(dict.fromkeys(source_notes + source.get("sourceNotes", [])))
    if overview:
        article["paragraphOverview"] = overview
    if source_notes:
        article["sourceNotes"] = source_notes
    return article


def validate_article(article: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    label = article.get("id", "unknown")
    if article["questionCount"] != len(article["answerKey"]):
        errors.append(f"{label}: questionCount/answerKey mismatch")
    for answer_index, answer in enumerate(article.get("answerKey", []), 1):
        if re.search(r"(?:SECTION\s+\d+|Skim\s+Roadmap|中文意思|題目要求)", answer, re.I):
            errors.append(f"{label}: Q{answer_index} answer key contains non-answer prose")
    overview_title = article.get("paragraphOverview", {}).get("title", "")
    if len(overview_title) > 80:
        errors.append(f"{label}: paragraph overview title contains too much source prose")
    if re.search(r"[。！？.!?]", overview_title):
        errors.append(f"{label}: paragraph overview title contains a prose sentence")
    if any(
        re.search(r"(?:Answer\s*Key|Questio\s*Answer)", paragraph.get("summary", ""), re.I)
        for paragraph in article.get("paragraphOverview", {}).get("paragraphs", [])
    ):
        errors.append(f"{label}: answer table leaked into paragraph overview")
    if any(len(note.strip()) < 10 for note in article.get("sourceNotes", [])):
        errors.append(f"{label}: sourceNotes contains an empty or leaked answer fragment")
    covered: list[int] = []
    for question in article["questions"]:
        numbers = question.get("numbers", [question["number"]])
        covered.extend(numbers)
        if not question.get("answer"):
            errors.append(f"{label}: Q{question['number']} has no answer")
        if "中文意思" in question.get("prompt", ""):
            errors.append(f"{label}: Q{question['number']} prompt swallowed its translation")
        if not question.get("sections"):
            errors.append(f"{label}: Q{question['number']} has no sections")
        for section in question.get("sections", []):
            if not section.get("blocks"):
                errors.append(f"{label}: Q{question['number']} has an empty section")
            for block in section.get("blocks", []):
                if not block.get("text") and not (block.get("from") and block.get("to")):
                    errors.append(f"{label}: Q{question['number']} has an empty block")
    question_number_start = article.get("questionNumberStart", 1)
    expected = list(range(
        question_number_start,
        question_number_start + article["questionCount"],
    ))
    coverage = Counter(covered)
    if sorted(coverage) != expected or any(count != 1 for count in coverage.values()):
        errors.append(f"{label}: question coverage mismatch")
    return errors


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rendered = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    path.write_text(rendered, encoding="utf-8")


def write_availability(articles: list[dict[str, Any]]) -> None:
    source = AVAILABILITY_PATH.read_text(encoding="utf-8")
    match = re.search(r"Object\.freeze\((\{.*\})\);\s*$", source, re.DOTALL)
    if match is None:
        raise ValueError("Unable to parse the existing analysis availability index")
    previous = json.loads(match.group(1))
    # Preserve every Passage 1 (and future non-Passage-2) analysis while
    # replacing Passage 2 as one deterministic corpus.
    entries: dict[str, Any] = {
        article_id: entry
        for article_id, entry in previous.get("articles", {}).items()
        if entry.get("passage") != 2
    }
    for article in articles:
        entry: dict[str, Any] = {
            "id": article["id"],
            "passage": article["passage"],
            "source": "json",
            "file": f"{article['id']}.json",
            "version": IMPORT_VERSION,
        }
        if len(article["catalogueIds"]) > 1:
            entry["catalogueIds"] = article["catalogueIds"]
        else:
            entry["catalogueId"] = article["catalogueId"]
        entries[article["id"]] = entry

    payload = {
        "version": AVAILABILITY_VERSION,
        "dataDirectory": "/ielts-reading-analysis-data/",
        "articles": entries,
    }
    rendered = json.dumps(payload, ensure_ascii=False, indent=2)
    AVAILABILITY_PATH.write_text(
        "// Lightweight availability index. JSON-backed articles are listed here without\n"
        "// placing their full question analysis in the catalogue page's initial payload.\n"
        f"window.EDMUND_IELTS_READING_ANALYSIS_AVAILABILITY = Object.freeze({rendered});\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="Parse and validate without writing")
    mode.add_argument("--write", action="store_true", help="Parse, validate and write website JSON")
    parser.add_argument("--source-dir", type=Path, help="Override the source PDF directory")
    args = parser.parse_args()

    manifest = load_manifest()
    source_root = (args.source_dir or Path(manifest["sourceDirectoryHint"])).expanduser()
    previous_rows = load_previous_source_rows()
    unrecoverable: list[tuple[str, str]] = []
    for source in manifest["sources"]:
        if (source_root / source["filename"]).is_file():
            continue
        try:
            load_cached_article(source, previous_rows)
        except (OSError, ValueError, json.JSONDecodeError) as error:
            unrecoverable.append((source["filename"], str(error)))
    if unrecoverable:
        print("Missing source PDFs without a verified cached import:", file=sys.stderr)
        for filename, reason in unrecoverable:
            print(f"  - {filename}: {reason}", file=sys.stderr)
        return 1

    articles_by_hash: dict[str, dict[str, Any]] = {}
    source_rows: list[dict[str, Any]] = []
    parsed_source_count = 0
    cached_source_count = 0
    parsed_article_hashes: set[str] = set()
    parsed_catalogue_ids: set[str] = set()
    for source in manifest["sources"]:
        path = source_root / source["filename"]
        source_status = "parsed"
        if path.is_file():
            digest = sha256(path)
            parsed_source_count += 1
            parsed_catalogue_ids.update(source["catalogueIds"])
        else:
            digest, cached_article = load_cached_article(source, previous_rows)
            source_status = "cached"
            cached_source_count += 1
        if digest not in articles_by_hash:
            if source_status == "parsed":
                try:
                    articles_by_hash[digest] = parse_article(source, path, digest)
                    parsed_article_hashes.add(digest)
                except Exception as error:  # show the exact source before stopping
                    raise RuntimeError(f"Failed to import {source['filename']}: {error}") from error
            else:
                articles_by_hash[digest] = cached_article
        else:
            article = articles_by_hash[digest]
            if source["catalogueIds"] != article["catalogueIds"]:
                article["catalogueIds"] = sorted(set(article["catalogueIds"] + source["catalogueIds"]))
        source_rows.append({
            "filename": source["filename"],
            "sha256": digest,
            "articleId": articles_by_hash[digest]["id"],
            "catalogueIds": source["catalogueIds"],
            "status": source_status,
        })

    bundled_duplicate_rows: list[dict[str, Any]] = []
    for source in manifest.get("bundledSourceDuplicates", []):
        path = source_root / source["filename"]
        row: dict[str, Any] = {
            "filename": source["filename"],
            "articleId": source["articleId"],
            "catalogueIds": source["catalogueIds"],
            "reason": source["reason"],
            "status": "skipped-already-bundled",
            "present": path.is_file(),
        }
        if path.is_file():
            row["sha256"] = sha256(path)
        bundled_duplicate_rows.append(row)

    articles = sorted(articles_by_hash.values(), key=lambda item: item["id"])
    errors = [error for article in articles for error in validate_article(article)]
    if errors:
        print("Validation errors:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    if args.write:
        expected_files = {f"{article['id']}.json" for article in articles}
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        for article in articles:
            write_json(OUTPUT_DIR / f"{article['id']}.json", article)
        # Only remove stale files produced by this importer; keep any future
        # hand-authored JSON that does not begin with a Passage 2 catalogue id.
        for path in OUTPUT_DIR.glob("p2-*.json"):
            if path.name not in expected_files:
                path.unlink()
        write_availability(articles)
        write_json(REPORT_PATH, {
            "version": IMPORT_VERSION,
            "sourceCount": len(manifest["sources"]),
            "parsedSourceCount": parsed_source_count,
            "cachedSourceCount": cached_source_count,
            "batchInventorySourceCount": parsed_source_count + sum(
                1 for row in bundled_duplicate_rows if row["present"]
            ),
            "newUniqueAnalysisCount": len(parsed_article_hashes),
            "newCatalogueIdCount": len(parsed_catalogue_ids),
            "bundledDuplicateSourceCount": sum(
                1 for row in bundled_duplicate_rows if row["present"]
            ),
            "uniqueAnalysisCount": len(articles),
            "catalogueIds": sorted({value for article in articles for value in article["catalogueIds"]}),
            "sources": source_rows,
            "bundledSourceDuplicates": bundled_duplicate_rows,
        })

    overview_count = sum(1 for article in articles if article.get("paragraphOverview"))
    card_count = sum(len(article["questions"]) for article in articles)
    section_count = sum(
        len(question["sections"])
        for article in articles
        for question in article["questions"]
    )
    print(json.dumps({
        "sourceCount": len(manifest["sources"]),
        "parsedSourceCount": parsed_source_count,
        "cachedSourceCount": cached_source_count,
        "batchInventorySourceCount": parsed_source_count + sum(
            1 for row in bundled_duplicate_rows if row["present"]
        ),
        "newUniqueAnalysisCount": len(parsed_article_hashes),
        "newCatalogueIdCount": len(parsed_catalogue_ids),
        "bundledDuplicateSourceCount": sum(
            1 for row in bundled_duplicate_rows if row["present"]
        ),
        "uniqueAnalysisCount": len(articles),
        "catalogueIdCount": len({value for article in articles for value in article["catalogueIds"]}),
        "overviewCount": overview_count,
        "questionCardCount": card_count,
        "answerCount": sum(len(article["answerKey"]) for article in articles),
        "sectionCount": section_count,
        "pages": sum(article["source"]["pageCount"] for article in articles),
        "write": bool(args.write),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
