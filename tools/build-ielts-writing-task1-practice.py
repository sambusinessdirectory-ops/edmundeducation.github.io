#!/usr/bin/env python3
"""Build the IELTS Task 1 fill-in-the-blanks writing-practice catalogue.

The source package for each logical exercise consists of:

* one 16-exercise fill-in-the-blanks PDF in ``~/Downloads``; and
* one full model-essay PDF in one of the three Task 1 source directories.

The builder deliberately derives, rather than guesses, every important field:

* page 2 of the model PDF supplies the task prompt and largest task image;
* page 3 supplies the canonical four-paragraph essay;
* the first bilingual pages after page 3 supply aligned Chinese translations;
* first-letter Exercises 2, 6, 10 and 14 in the worksheet supply the answer
  spans for the four difficulty levels.

The output is JSON-compatible JavaScript so it can be loaded directly by the
static writing-practice application.  Validation is intentionally strict:
inventory gaps, worksheet reconstruction errors, untranslated canonical text,
and prompt-image failures stop the build instead of silently publishing mixed
or incomplete material.
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import shutil
import sys
import unicodedata
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = Path("/Users/sammak/Downloads")
MODEL_DIRECTORIES = (
    Path("/Users/sammak/Desktop/IELTS All Model Essays - Task 1"),
    Path("/Users/sammak/Desktop/IELTS All Model Essay - Task 1 - Second Batch"),
    Path("/Users/sammak/Desktop/IELTS Model Essay Task 1 Batch 3"),
)
OUTPUT_DATA = ROOT / "writing-practice-ielts-task1-data.js"
OUTPUT_IMAGES = ROOT / "assets/writing-practice/questions/ielts-task1"
STAGING_ROOT = ROOT / "tmp/pdfs/ielts-task1-practice-builder"


@dataclass(frozen=True)
class Category:
    slug: str
    source_label: str
    display_label: str
    expected_count: int


CATEGORIES = (
    Category("bar-charts", "Bar Charts", "Bar Charts", 8),
    Category("line-graph", "Line Graph", "Line Graph", 9),
    Category("pie-charts", "Pie Charts", "Pie Charts", 6),
    Category("process-diagram", "Process Diagram", "Process Diagram", 9),
    Category("maps", "Maps", "Maps", 10),
    Category("tables", "Tables", "Tables", 11),
    Category("mixed-charts", "MIXED Charts", "Mixed Charts", 7),
)
CATEGORY_BY_SOURCE = {
    re.sub(r"\s+", " ", category.source_label).casefold(): category
    for category in CATEGORIES
}
CATEGORY_BY_SLUG = {category.slug: category for category in CATEGORIES}
EXPECTED_KEYS = {
    (category.slug, number)
    for category in CATEGORIES
    for number in range(1, category.expected_count + 1)
}

DIFFICULTIES = (
    (2, "standard", "Standard Mode", "標準模式"),
    (6, "medium", "Medium Difficulty Mode", "中等難度模式"),
    (10, "hard", "Hard Difficulty Mode", "高難度模式"),
    (14, "hell", "Hell Difficulty Mode", "地獄難度模式"),
)
PRACTICE_MODES = ("blank", "start", "end", "both")
PRACTICE_MODE_DETAILS = {
    "blank": {
        "title": "不顯示字母提示",
        "description": "Standard Mode：每題只顯示編號空格。",
    },
    "start": {
        "title": "顯示開首字母",
        "description": "First-Letter Mode：顯示每個答案部分的第一個字母。",
    },
    "end": {
        "title": "顯示結尾字母",
        "description": "Ending-Letter Mode：顯示每個答案部分的最後一個字母。",
    },
    "both": {
        "title": "顯示開首及結尾字母",
        "description": "First-and-Ending-Letter Mode：同時顯示首尾字母。",
    },
}

SECTION_META = (
    ("Introduction", "引言", "blue"),
    ("Overview", "總覽", "green"),
    ("Body Paragraph 1", "正文第一段", "orange"),
    ("Body Paragraph 2", "正文第二段", "purple"),
)

EXERCISE_HEADER_RE = re.compile(
    r"(?m)(?:Exercise\s+)?"
    r"(\d+)\s*(?:—|-|\.|:)\s*"
    r"(Standard Difficulty|Medium Difficulty|Hard Difficulty|Hell Difficulty)"
    r"\s*(?:—|-)\s*"
    r"(Standard/Uncued|First-Letter|Ending-Letter|"
    r"First-and-Ending-Letter)(?:\s+Mode)?"
)
SOURCE_NAME_RE = re.compile(
    r"^(?:Fill in the blanks\s*-\s*)?"
    r"(?:(?:\(Without Analysis\))\s*)?"
    r"Model Essay\s+(\d+)\s*-\s*IELTS\s*-\s*(.*?)\s*-\s*"
    r"\(Band 9 示範\)\s*-\s*Task 1(?:-1)?\s*\.pdf$",
    re.IGNORECASE,
)
CHINESE_RE = re.compile(r"[\u3400-\u9fff]")
PROMPT_TEXT_REPLACEMENTS = {
    "fordifferent": "for different",
    "Melbourne,Australia": "Melbourne, Australia",
    "period2000": "period 2000",
    "features,andmake": "features, and make",
    "features,and": "features, and",
    "selectingand": "selecting and",
    "changes inownership": "changes in ownership",
    "houseworkin": "housework in",
    "seconachart": "second chart",
    "comparisonswhere": "comparisons where",
    "mail features": "main features",
    "dioxide(CO2)": "dioxide (CO2)",
}

# These five page-2 sources intentionally store the prompt and visual together
# as one raster screenshot and therefore have no selectable prompt text layer.
# The transcriptions were checked against the rendered source image; the image
# crop below preserves the complete original screenshot.
SCREENSHOT_ONLY_PROMPTS: dict[tuple[str, int], list[str]] = {
    ("tables", 3): [
        "The table below provides statistics on several major metro (MRT) systems around the world.",
        "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        "Write at least 150 words.",
    ],
    ("tables", 7): [
        "The table details the international tourist arrivals in millions in 8 countries in 2009 and 2010 and the changes (in percentages).",
        "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        "Write at least 150 words.",
    ],
    ("tables", 8): [
        "The table below gives information about management positions held by women in a European country in 2006.",
        "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        "Write at least 150 words.",
    ],
    ("tables", 9): [
        "The table below shows the consumption of three basic foods (wheat, maize, rice) by people in four different countries.",
        "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        "Write at least 150 words.",
    ],
    ("maps", 8): [
        "The plans below show the layout of a university’s sports centre now, and how it will look after redevelopment.",
        "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        "Write at least 150 words.",
    ],
}


class BuildError(RuntimeError):
    """A source invariant failed."""


@dataclass(frozen=True)
class SourcePair:
    category: Category
    number: int
    worksheet: Path
    model: Path

    @property
    def key(self) -> tuple[str, int]:
        return (self.category.slug, self.number)

    @property
    def exercise_id(self) -> str:
        return f"model-essay-{self.number}-ielts-task1-{self.category.slug}"


# Three supplied PDFs contain an internally mismatched page 2.  These are
# narrow, source-audited repairs using only other PDFs in the supplied package:
#
# * Maps 9 page 3/worksheet are the Grange Park essay and are exact duplicates
#   of Maps 6's canonical text.  Maps 9 page 2 and bilingual pages describe
#   Islip, so the matching Maps 6 prompt, image and translations are reused.
# * Mixed Charts 4 page 3/bilingual pages describe export earnings, but page 2
#   contains the Anthropology graduates task.  Mixed Charts 5 has the matching
#   export-earnings page 2, so only its prompt/image are reused.
# * Mixed Charts 7 page 3/bilingual pages exactly duplicate Mixed Charts 6, but
#   page 2 contains a land-degradation task.  Mixed Charts 6's matching page 2
#   is reused.
#
# The exact-canonical assertions below prevent these exceptions from widening
# into an accidental "nearest source" fallback.
SOURCE_REPAIRS: dict[tuple[str, int], dict[str, Any]] = {
    ("maps", 9): {
        "prompt": ("maps", 6),
        "translations": ("maps", 6),
        "requirePromptCanonicalMatch": True,
        "requireTranslationCanonicalMatch": True,
        "note": (
            "Supplied Maps 9 combines an Islip page 2/bilingual section with "
            "the Grange Park canonical essay; reused the exact-duplicate "
            "Maps 6 Grange Park prompt, image and bilingual pairs."
        ),
    },
    ("mixed-charts", 4): {
        "prompt": ("mixed-charts", 5),
        "requirePromptCanonicalMatch": False,
        "note": (
            "Supplied Mixed Charts 4 page 2 is the Anthropology graduates "
            "task; reused the matching export-earnings prompt/image from "
            "Mixed Charts 5."
        ),
    },
    ("mixed-charts", 7): {
        "prompt": ("mixed-charts", 6),
        "requirePromptCanonicalMatch": True,
        "note": (
            "Supplied Mixed Charts 7 page 2 is a land-degradation task; "
            "reused the matching prompt/image from its exact canonical "
            "duplicate, Mixed Charts 6."
        ),
    },
}


@dataclass(frozen=True)
class TextLine:
    top: float
    text: str


@dataclass(frozen=True)
class TranslationPair:
    english: str
    chinese: str
    page: int


def normalise_space(value: str) -> str:
    value = unicodedata.normalize("NFC", value).replace("\u00a0", " ")
    return re.sub(r"\s+", " ", value).strip()


def smart_join_chinese(lines: Sequence[str]) -> str:
    result = ""
    for raw in lines:
        text = normalise_space(raw)
        if not text:
            continue
        if (
            result
            and result[-1].isascii()
            and result[-1].isalnum()
            and text[0].isascii()
            and text[0].isalnum()
        ):
            result += " "
        result += text
    return result


def parse_source_identity(path: Path) -> tuple[str, int]:
    match = SOURCE_NAME_RE.match(path.name)
    if not match:
        raise BuildError(f"Unrecognised Task 1 source filename: {path}")
    number = int(match.group(1))
    source_label = normalise_space(match.group(2)).casefold()
    category = CATEGORY_BY_SOURCE.get(source_label)
    if not category:
        raise BuildError(
            f"Unknown Task 1 source category {match.group(2)!r}: {path.name}"
        )
    return category.slug, number


def unique_source_map(paths: Iterable[Path], source_kind: str) -> dict[tuple[str, int], Path]:
    result: dict[tuple[str, int], Path] = {}
    for path in sorted(paths):
        key = parse_source_identity(path)
        if key in result:
            raise BuildError(
                f"Duplicate {source_kind} source for {key}: "
                f"{result[key]} and {path}"
            )
        result[key] = path
    missing = sorted(EXPECTED_KEYS - set(result))
    extra = sorted(set(result) - EXPECTED_KEYS)
    if missing or extra:
        raise BuildError(
            f"{source_kind} inventory mismatch; missing={missing}, extra={extra}"
        )
    return result


def discover_sources() -> list[SourcePair]:
    worksheets = unique_source_map(
        DOWNLOADS.glob("Fill in the blanks*IELTS*Task 1*.pdf"), "worksheet"
    )
    model_paths: list[Path] = []
    for directory in MODEL_DIRECTORIES:
        if not directory.is_dir():
            raise BuildError(f"Missing model-essay source directory: {directory}")
        model_paths.extend(directory.glob("*Model Essay*IELTS*Task 1*.pdf"))
    models = unique_source_map(model_paths, "model essay")
    pairs = [
        SourcePair(
            category=CATEGORY_BY_SLUG[slug],
            number=number,
            worksheet=worksheets[(slug, number)],
            model=models[(slug, number)],
        )
        for slug, number in sorted(
            EXPECTED_KEYS,
            key=lambda item: (
                [category.slug for category in CATEGORIES].index(item[0]),
                item[1],
            ),
        )
    ]
    if len(pairs) != 60:
        raise BuildError(f"Expected 60 logical Task 1 sets, discovered {len(pairs)}")
    return pairs


def page_lines(
    page: pdfplumber.page.Page,
    *,
    minimum_top: float,
    maximum_top: float,
) -> list[TextLine]:
    words_in_bounds: list[dict[str, Any]] = []
    for word in page.extract_words(
        x_tolerance=2,
        y_tolerance=2,
        keep_blank_chars=False,
        use_text_flow=False,
    ):
        top = float(word["top"])
        if not (minimum_top <= top < maximum_top):
            continue
        words_in_bounds.append(word)

    # Latin text/numerals in a Chinese line often use a different embedded
    # font whose baseline is about 2.2 points lower.  Cluster nearby baselines
    # into the same visual line so names, years and percentages are retained.
    grouped: list[tuple[float, list[dict[str, Any]]]] = []
    for word in sorted(
        words_in_bounds, key=lambda item: (float(item["top"]), float(item["x0"]))
    ):
        top = float(word["top"])
        if grouped and abs(top - grouped[-1][0]) <= 3:
            grouped[-1][1].append(word)
        else:
            grouped.append((top, [word]))

    lines: list[TextLine] = []
    for top, words in grouped:
        words.sort(key=lambda word: float(word["x0"]))
        text = normalise_space(" ".join(str(word["text"]) for word in words))
        if text:
            lines.append(TextLine(top, text))
    return lines


def bilingual_only_sections(
    model_pdf: pdfplumber.pdf.PDF,
) -> tuple[list[str], list[TranslationPair]]:
    """Read the one source whose model PDF contains only bilingual sections.

    Mixed Charts 1 begins its bilingual teaching layout on page 3 instead of
    providing the usual standalone four-paragraph essay there.  Its section
    headings still identify the four canonical paragraphs unambiguously.
    """

    section_patterns = (
        re.compile(r"^Introduction\b", re.IGNORECASE),
        re.compile(r"^Overview\b", re.IGNORECASE),
        re.compile(r"^Body Paragraph 1\b", re.IGNORECASE),
        re.compile(r"^Body Paragraph 2\b", re.IGNORECASE),
    )
    grouped_pairs: list[list[TranslationPair]] = [[], [], [], []]
    current_section: int | None = None
    english_buffer: list[str] = []

    for page_number, page in enumerate(model_pdf.pages[2:], start=3):
        cropped = page.crop((0, 70, float(page.width), 700))
        raw_lines = [
            normalise_space(line)
            for line in (cropped.extract_text() or "").splitlines()
            if normalise_space(line)
        ]
        index = 0
        while index < len(raw_lines):
            line = raw_lines[index]
            new_section = next(
                (
                    section_index
                    for section_index, pattern in enumerate(section_patterns)
                    if pattern.search(line)
                ),
                None,
            )
            if new_section is not None:
                current_section = new_section
                english_buffer = []
                index += 1
                continue
            if "（" in line and line.endswith("）"):
                # Secondary bilingual headings (Background, Main Feature,
                # topic labels, etc.) are labels rather than translations.
                english_buffer = []
                index += 1
                continue
            if CHINESE_RE.search(line):
                chinese_lines = [line]
                next_index = index + 1
                while (
                    next_index < len(raw_lines)
                    and CHINESE_RE.search(raw_lines[next_index])
                    and not (
                        "（" in raw_lines[next_index]
                        and raw_lines[next_index].endswith("）")
                    )
                ):
                    chinese_lines.append(raw_lines[next_index])
                    next_index += 1
                if current_section is not None and english_buffer:
                    english = normalise_space(" ".join(english_buffer))
                    chinese = smart_join_chinese(chinese_lines)
                    if (
                        english.endswith((".", "?", "!"))
                        and not chinese.endswith(("。", "？", "！"))
                    ):
                        chinese += "。"
                    grouped_pairs[current_section].append(
                        TranslationPair(english, chinese, page_number)
                    )
                english_buffer = []
                index = next_index
                continue
            if current_section is not None:
                english_buffer.append(line)
            index += 1

    if any(not section for section in grouped_pairs):
        raise BuildError("Bilingual-only source does not contain all four sections")
    paragraphs = [
        normalise_space(" ".join(pair.english for pair in section))
        for section in grouped_pairs
    ]
    if any(len(paragraph) < 40 for paragraph in paragraphs):
        raise BuildError("Bilingual-only source contains an implausibly short section")
    return paragraphs, [pair for section in grouped_pairs for pair in section]


def canonical_paragraphs(model_pdf: pdfplumber.pdf.PDF) -> list[str]:
    if len(model_pdf.pages) < 4:
        raise BuildError("Model PDF has fewer than four pages")
    page_three_text = model_pdf.pages[2].extract_text() or ""
    if "Introduction（引言）" in page_three_text:
        paragraphs, _ = bilingual_only_sections(model_pdf)
        return paragraphs
    # Most essays begin around y=107, but several compact exports begin in the
    # low 70s.  The branded header ends above y=64.
    lines = page_lines(model_pdf.pages[2], minimum_top=65, maximum_top=700)
    if not lines:
        raise BuildError("No canonical essay text found on page 3")
    paragraphs: list[str] = []
    current: list[str] = []
    previous_top: float | None = None
    for line in lines:
        # The overview is always a separate Task 1 paragraph.  One supplied
        # map export leaves only a 33-point gap after a one-line introduction,
        # just below the normal visual paragraph-gap threshold.
        starts_overview = bool(current) and line.text.lower().startswith("overall")
        if previous_top is not None and (
            line.top - previous_top > 30 or starts_overview
        ):
            paragraphs.append(normalise_space(" ".join(current)))
            current = []
        current.append(line.text)
        previous_top = line.top
    if current:
        paragraphs.append(normalise_space(" ".join(current)))
    if len(paragraphs) != 4:
        raise BuildError(
            f"Expected four canonical paragraphs on page 3, found {len(paragraphs)}"
        )
    if any(len(paragraph) < 40 for paragraph in paragraphs):
        raise BuildError("Canonical page 3 contains an implausibly short paragraph")
    return paragraphs


def largest_prompt_image(page: pdfplumber.page.Page) -> dict[str, Any]:
    candidates = [
        image
        for image in page.images
        if float(image["top"]) >= 65
        and float(image["bottom"]) <= 720
        and float(image["x1"]) > 0
        and float(image["x0"]) < float(page.width)
        and float(image["width"]) * float(image["height"]) >= 8_000
    ]
    if not candidates:
        raise BuildError("No embedded task-prompt image found on page 2")
    return max(
        candidates,
        key=lambda image: float(image["width"]) * float(image["height"]),
    )


def extract_question_prompt(
    page: pdfplumber.page.Page, prompt_image: dict[str, Any]
) -> list[str]:
    image_top = float(prompt_image["top"])
    lines = [
        line.text
        for line in page_lines(
            page,
            minimum_top=65,
            maximum_top=max(71, image_top - 4),
        )
    ]
    text = normalise_space(" ".join(lines))
    for source_text, repaired_text in PROMPT_TEXT_REPLACEMENTS.items():
        text = text.replace(source_text, repaired_text)
    text = re.sub(
        r"^You should spend about 20 minutes on this task\.\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )
    summarise_match = re.search(r"\bSummari[sz]e\b", text)
    summarise_at = summarise_match.start() if summarise_match else -1
    write_at = text.find("Write at least")
    if summarise_at <= 0:
        raise BuildError(f"Could not segment IELTS task instructions on page 2: {text!r}")
    if write_at < 0:
        # One supplied page-2 export omits the standard word-count footer
        # from its text layer.  The instruction is invariant across all Task 1
        # sources, so restore it while retaining the source prompt verbatim.
        prompt = [
            normalise_space(text[:summarise_at]),
            normalise_space(text[summarise_at:]),
            "Write at least 150 words.",
        ]
    elif write_at > summarise_at:
        prompt = [
            normalise_space(text[:summarise_at]),
            normalise_space(text[summarise_at:write_at]),
            normalise_space(text[write_at:]),
        ]
    else:
        raise BuildError(f"Could not segment IELTS task instructions on page 2: {text!r}")
    if not prompt[0].lower().startswith(("the ", "these ")):
        raise BuildError(f"Unexpected IELTS Task 1 prompt opening: {prompt[0]!r}")
    if prompt[2] != "Write at least 150 words.":
        raise BuildError(f"Unexpected IELTS word-count instruction: {prompt[2]!r}")
    return prompt


def render_prompt_image(
    page: pdfplumber.page.Page,
    prompt_image: dict[str, Any],
    destination: Path,
) -> tuple[int, int]:
    resolution = 180
    scale = resolution / 72
    rendered = page.to_image(resolution=resolution, antialias=True).original
    crop = rendered.crop(
        (
            round(float(prompt_image["x0"]) * scale),
            round(float(prompt_image["top"]) * scale),
            round(float(prompt_image["x1"]) * scale),
            round(float(prompt_image["bottom"]) * scale),
        )
    )
    if crop.width < 300 or crop.height < 180:
        raise BuildError(
            f"Rendered task image is implausibly small: {crop.width}x{crop.height}"
        )
    destination.parent.mkdir(parents=True, exist_ok=True)
    crop.save(destination, "WEBP", quality=92, method=6)
    return crop.size


def candidate_matches_canonical_prefix(
    candidate: str, canonical_tokens: Sequence[str], cursor: int
) -> bool:
    tokens = normalise_space(candidate).split()
    canonical_slice = list(canonical_tokens[cursor : cursor + len(tokens)])

    # One supplied bilingual export uses the British double-l spelling
    # "levelling", while its authoritative page-3 essay uses "leveling".
    # Compare this known orthographic variant only for alignment; output still
    # takes the exact canonical page-3 spelling.
    def comparison_token(token: str) -> str:
        return token.replace("levelling", "leveling")

    return bool(tokens) and [
        comparison_token(token) for token in canonical_slice
    ] == [comparison_token(token) for token in tokens]


def extract_translation_pairs(
    model_pdf: pdfplumber.pdf.PDF, paragraphs: Sequence[str]
) -> list[TranslationPair]:
    canonical = normalise_space(" ".join(paragraphs))
    page_three_text = model_pdf.pages[2].extract_text() or ""
    if "Introduction（引言）" in page_three_text:
        bilingual_paragraphs, pairs = bilingual_only_sections(model_pdf)
        if bilingual_paragraphs != list(paragraphs):
            raise BuildError(
                "Bilingual-only source does not reconstruct its canonical sections"
            )
        return pairs
    canonical_tokens = canonical.split()
    cursor = 0
    pairs: list[TranslationPair] = []
    # Keep a pending English segment across page boundaries.  Tables 5 ends
    # page 4 with an English sentence and begins page 5 with its Chinese
    # translation.
    english_buffer: list[TextLine] = []
    for page_number, page in enumerate(model_pdf.pages[3:], start=4):
        if cursor >= len(canonical_tokens):
            break
        records = page_lines(page, minimum_top=70, maximum_top=700)
        index = 0
        while index < len(records) and cursor < len(canonical_tokens):
            record = records[index]
            if CHINESE_RE.search(record.text):
                chinese_lines = [record.text]
                previous_top = record.top
                next_index = index + 1
                while next_index < len(records):
                    following = records[next_index]
                    if not CHINESE_RE.search(following.text):
                        break
                    if following.top - previous_top >= 35:
                        break
                    chinese_lines.append(following.text)
                    previous_top = following.top
                    next_index += 1

                best: tuple[str, int] | None = None
                for start in range(len(english_buffer)):
                    candidate = normalise_space(
                        " ".join(line.text for line in english_buffer[start:])
                    )
                    token_count = len(candidate.split())
                    if (
                        len(candidate) >= 20
                        and candidate_matches_canonical_prefix(
                            candidate, canonical_tokens, cursor
                        )
                        and (best is None or token_count > best[1])
                    ):
                        best = (candidate, token_count)
                if best:
                    chinese = smart_join_chinese(chinese_lines)
                    if not CHINESE_RE.search(chinese):
                        raise BuildError(
                            f"Page {page_number}: aligned translation has no Chinese text"
                        )
                    canonical_english = " ".join(
                        canonical_tokens[cursor : cursor + best[1]]
                    )
                    if (
                        canonical_english.endswith((".", "?", "!"))
                        and not chinese.endswith(("。", "？", "！"))
                    ):
                        chinese += "。"
                    pairs.append(
                        TranslationPair(canonical_english, chinese, page_number)
                    )
                    cursor += best[1]
                english_buffer = []
                index = next_index
                continue
            english_buffer.append(record)
            index += 1

    if cursor != len(canonical_tokens):
        remaining = " ".join(canonical_tokens[cursor : cursor + 24])
        raise BuildError(
            "Bilingual pages do not cover the full canonical essay; "
            f"{len(canonical_tokens) - cursor} token(s) remain from {remaining!r}"
        )
    reconstructed = normalise_space(" ".join(pair.english for pair in pairs))
    if reconstructed != canonical:
        raise BuildError("Aligned bilingual English does not reconstruct page 3")
    if not pairs:
        raise BuildError("No bilingual sentence/segment pairs were extracted")
    return pairs


def distribute_translation_pairs(
    paragraphs: Sequence[str], pairs: Sequence[TranslationPair]
) -> list[list[TranslationPair]]:
    result: list[list[TranslationPair]] = []
    pair_index = 0
    for paragraph in paragraphs:
        paragraph_tokens = paragraph.split()
        cursor = 0
        paragraph_pairs: list[TranslationPair] = []
        while cursor < len(paragraph_tokens):
            if pair_index >= len(pairs):
                raise BuildError("Translation pairs ended before paragraph reconstruction")
            pair = pairs[pair_index]
            pair_tokens = pair.english.split()
            if paragraph_tokens[cursor : cursor + len(pair_tokens)] != pair_tokens:
                raise BuildError(
                    "A bilingual segment crosses or disagrees with a canonical "
                    f"paragraph boundary near {pair.english!r}"
                )
            paragraph_pairs.append(pair)
            cursor += len(pair_tokens)
            pair_index += 1
        if cursor != len(paragraph_tokens):
            raise BuildError("Translation paragraph did not reconstruct exactly")
        result.append(paragraph_pairs)
    if pair_index != len(pairs):
        raise BuildError("Unused bilingual segment(s) remain after paragraph alignment")
    return result


def worksheet_text(worksheet: Path) -> str:
    with pdfplumber.open(worksheet) as pdf:
        if len(pdf.pages) < 8:
            raise BuildError(f"Worksheet has too few pages: {worksheet}")
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def regex_characters(value: str, *, masked: bool) -> str:
    output: list[str] = []
    in_space = False
    in_underscore_run = False
    for character in value:
        if character.isspace():
            if not in_space:
                # A small number of first-letter exports omit an internal
                # comma from a multi-word blank (for example
                # "Overall, home ownership").  The authoritative page-3
                # punctuation is captured when present.
                output.append(r"(?:[,;:]?\s+)" if masked else r"\s+")
            in_space = True
            in_underscore_run = False
            continue
        in_space = False
        if masked and character == "_":
            # Unicode-aware letter: needed for visible first-letter masks such
            # as c___ -> café.  Treat each underline run as one-or-more
            # letters: a few exported worksheets have an underline count that
            # is one character longer than the authoritative word (for
            # example c_______ -> climbed).
            if not in_underscore_run:
                output.append(r"[^\W\d_]+")
            in_underscore_run = True
        elif character in {"'", "’"}:
            in_underscore_run = False
            output.append("['’]")
        elif character in {"-", "–", "—"}:
            in_underscore_run = False
            output.append("[-–—]")
        elif character in {",", "，"}:
            # A handful of exported English worksheets contain a CJK
            # full-width comma even though the authoritative model essay uses
            # the normal ASCII comma.
            in_underscore_run = False
            output.append("[,，]")
        else:
            in_underscore_run = False
            output.append(re.escape(character))
    return "".join(output)


def answer_spans_from_first_letter_exercise(
    worksheet: Path,
    full_text: str,
    canonical: str,
    exercise_number: int,
) -> list[str]:
    headers = list(EXERCISE_HEADER_RE.finditer(full_text))
    header_numbers = [int(header.group(1)) for header in headers]
    expected_headers = list(range(1, 17))
    known_missing_first_heading = (
        (
            "Model Essay 8 - IELTS - Line Graph" in worksheet.name
            or "Model Essay 6 - IELTS - Tables" in worksheet.name
        )
        and header_numbers == list(range(2, 17))
    )
    if header_numbers != expected_headers and not known_missing_first_heading:
        raise BuildError(
            f"{worksheet.name}: expected Exercises 1-16, found {header_numbers}"
        )
    header_index = next(
        index
        for index, header in enumerate(headers)
        if int(header.group(1)) == exercise_number
    )
    header = headers[header_index]
    block_end = (
        headers[header_index + 1].start()
        if header_index + 1 < len(headers)
        else len(full_text)
    )
    block = normalise_space(full_text[header.end() : block_end])
    pieces: list[tuple[str, str, int | None]] = []
    cursor = 0
    markers = list(re.finditer(r"\((\d+)\)", block))
    marker_numbers = [int(marker.group(1)) for marker in markers]
    if marker_numbers != list(range(1, len(markers) + 1)):
        raise BuildError(
            f"{worksheet.name} Exercise {exercise_number}: "
            f"non-consecutive blank markers {marker_numbers}"
        )
    for marker_index, marker in enumerate(markers):
        pieces.append(("literal", block[cursor : marker.start()], None))
        masked_start = marker.end()
        next_marker_start = (
            markers[marker_index + 1].start()
            if marker_index + 1 < len(markers)
            else len(block)
        )
        remainder = block[masked_start:next_marker_start]
        leading_space = re.match(r"\s*", remainder)
        assert leading_space is not None
        token_matches = list(re.finditer(r"\S+", remainder[leading_space.end() :]))
        included_end: int | None = None
        for token_index, token_match in enumerate(token_matches):
            token = token_match.group(0)
            core = token.strip(".,;:!?()[]{}\"“”'")
            if "_" in token:
                included_end = leading_space.end() + token_match.end()
                continue
            if len(core) == 1 and core.isalpha():
                # A one-letter word reveals itself completely in first-letter
                # mode.  Include it only when it bridges to another masked
                # token, e.g. "g____ t_ a c___" -> "going to a café".
                remaining_tokens = token_matches[token_index + 1 :]
                next_substantive = next(
                    (
                        later.group(0)
                        for later in remaining_tokens
                        if len(
                            later.group(0).strip(
                                ".,;:!?()[]{}\"“”'"
                            )
                        )
                        != 1
                        or "_"
                        in later.group(0)
                    ),
                    "",
                )
                if "_" in next_substantive:
                    included_end = leading_space.end() + token_match.end()
                    continue
            break
        if included_end is None:
            raise BuildError(
                f"{worksheet.name} Exercise {exercise_number}: "
                f"blank {marker.group(1)} has no first-letter mask"
            )
        masked_text = remainder[leading_space.end() : included_end]
        stripped = masked_text.rstrip(".,;:!?)]}\"”–—-")
        trailing = masked_text[len(stripped) :]
        if not stripped:
            raise BuildError(
                f"{worksheet.name} Exercise {exercise_number}: "
                f"blank {marker.group(1)} has an empty mask"
            )
        pieces.append(("masked", stripped, int(marker.group(1))))
        if trailing:
            pieces.append(("literal", trailing, None))
        cursor = masked_start + included_end
    pieces.append(("literal", block[cursor:], None))

    pattern_parts = ["^"]
    for kind, text, blank_number in pieces:
        if kind == "literal":
            pattern_parts.append(regex_characters(text, masked=False))
        else:
            pattern_parts.append(
                f"(?P<answer_{blank_number}>{regex_characters(text, masked=True)})"
            )
    # A few worksheet exports drop the final full stop even though all
    # canonical page-3 essays include it.
    pattern_parts.append(r"(?:[.!?])?$")
    match = re.match("".join(pattern_parts), canonical, flags=re.IGNORECASE)
    if not match:
        raise BuildError(
            f"{worksheet.name} Exercise {exercise_number}: masked worksheet "
            "does not reconstruct the canonical page-3 essay"
        )
    answers = [
        match.group(f"answer_{number}") for number in range(1, len(markers) + 1)
    ]
    if any(not answer for answer in answers):
        raise BuildError(
            f"{worksheet.name} Exercise {exercise_number}: empty reconstructed answer"
        )
    return answers


def validate_runtime_answer_order(
    paragraphs: Sequence[str], difficulty_key: str, answers: Sequence[str]
) -> None:
    paragraph_index = 0
    cursor = 0
    for answer_index, answer in enumerate(answers, start=1):
        while paragraph_index < len(paragraphs):
            found = paragraphs[paragraph_index].find(answer, cursor)
            if found >= 0:
                cursor = found + len(answer)
                break
            paragraph_index += 1
            cursor = 0
        else:
            raise BuildError(
                f"{difficulty_key}: answer {answer_index} {answer!r} is not an "
                "ordered substring of the canonical paragraphs"
            )


def build_translation_sections(
    paragraph_pairs: Sequence[Sequence[TranslationPair]],
) -> list[dict[str, Any]]:
    sections: list[dict[str, Any]] = []
    for paragraph_index, pairs in enumerate(paragraph_pairs):
        title, subtitle, tone = SECTION_META[paragraph_index]
        items = []
        for pair_index, pair in enumerate(pairs):
            if paragraph_index == 0:
                label = (
                    "Background（背景）"
                    if pair_index == 0
                    else f"Introduction Detail {pair_index + 1}（引言細節）"
                )
            elif paragraph_index == 1:
                label = f"Main Feature {pair_index + 1}（主要特徵）"
            else:
                label = f"Detail {pair_index + 1}（細節）"
            items.append(
                {
                    "label": label,
                    "english": pair.english,
                    "chinese": pair.chinese,
                }
            )
        sections.append(
            {
                "title": title,
                "subtitle": subtitle,
                "tone": tone,
                "items": items,
            }
        )
    return sections


def build_exercise(
    pair: SourcePair,
    staging_images: Path,
    source_index: dict[tuple[str, int], SourcePair],
) -> tuple[dict[str, Any], dict[str, Any]]:
    repair = SOURCE_REPAIRS.get(pair.key, {})
    prompt_source = source_index.get(repair.get("prompt"), pair)
    translation_source = source_index.get(repair.get("translations"), pair)
    with pdfplumber.open(pair.model) as model_pdf:
        paragraphs = canonical_paragraphs(model_pdf)
        canonical = normalise_space(" ".join(paragraphs))
        if translation_source == pair:
            translations = extract_translation_pairs(model_pdf, paragraphs)
        else:
            with pdfplumber.open(translation_source.model) as translation_pdf:
                translation_canonical = canonical_paragraphs(translation_pdf)
                if (
                    repair.get("requireTranslationCanonicalMatch")
                    and translation_canonical != paragraphs
                ):
                    raise BuildError(
                        "Declared translation repair source is not an exact "
                        "canonical duplicate"
                    )
                translations = extract_translation_pairs(
                    translation_pdf, paragraphs
                )
        paragraph_pairs = distribute_translation_pairs(paragraphs, translations)

    with pdfplumber.open(prompt_source.model) as prompt_pdf:
        if repair.get("requirePromptCanonicalMatch"):
            prompt_canonical = canonical_paragraphs(prompt_pdf)
            if prompt_canonical != paragraphs:
                raise BuildError(
                    "Declared prompt repair source is not an exact canonical duplicate"
                )
        prompt_page = prompt_pdf.pages[1]
        embedded_image = largest_prompt_image(prompt_page)
        question_prompt = SCREENSHOT_ONLY_PROMPTS.get(prompt_source.key)
        if question_prompt is None:
            question_prompt = extract_question_prompt(
                prompt_page, embedded_image
            )
        else:
            question_prompt = list(question_prompt)
        staged_image = staging_images / f"{pair.exercise_id}.webp"
        image_size = render_prompt_image(
            prompt_page, embedded_image, staged_image
        )

    fill_text = worksheet_text(pair.worksheet)
    difficulty_sets = []
    for exercise_number, key, title, title_zh in DIFFICULTIES:
        answers = answer_spans_from_first_letter_exercise(
            pair.worksheet,
            fill_text,
            canonical,
            exercise_number,
        )
        validate_runtime_answer_order(paragraphs, key, answers)
        difficulty_sets.append(
            {
                "key": key,
                "title": title,
                "titleZh": title_zh,
                "answers": answers,
            }
        )

    data_paragraphs = []
    translations_by_paragraph = []
    for paragraph_index, aligned_pairs in enumerate(paragraph_pairs):
        title, _, _ = SECTION_META[paragraph_index]
        data_paragraphs.append(
            {
                "label": title,
                "sentences": [
                    {"parts": [translation_pair.english]}
                    for translation_pair in aligned_pairs
                ],
            }
        )
        translations_by_paragraph.append(
            "".join(translation_pair.chinese for translation_pair in aligned_pairs)
        )

    image_path = (
        f"assets/writing-practice/questions/ielts-task1/"
        f"{pair.exercise_id}.webp"
    )
    exercise = {
        "id": pair.exercise_id,
        "title": (
            f"Model Essay {pair.number} - IELTS Task 1 - "
            f"{pair.category.display_label}"
        ),
        "exam": "IELTS Writing Task 1",
        "taskType": pair.category.display_label,
        "modelEssayNumber": pair.number,
        "downloadCategory": pair.category.slug,
        "questionPrompt": question_prompt,
        "questionImages": [
            {
                "src": image_path,
                "alt": (
                    f"IELTS Task 1 {pair.category.display_label} "
                    f"Model Essay {pair.number} question"
                ),
            }
        ],
        "practiceModes": list(PRACTICE_MODES),
        "practiceModeDetails": PRACTICE_MODE_DETAILS,
        "practiceDifficultySets": difficulty_sets,
        "paragraphs": data_paragraphs,
        "translation": translations_by_paragraph,
        "translationSections": build_translation_sections(paragraph_pairs),
        "showWordBank": False,
        "synonymGuide": [],
        "studyTabs": {},
    }
    if repair:
        exercise["sourceAuditNotes"] = [repair["note"]]
    report = {
        "id": pair.exercise_id,
        "category": pair.category.slug,
        "number": pair.number,
        "canonicalWords": len(canonical.split()),
        "translationSegments": len(translations),
        "difficultyAnswers": {
            difficulty["key"]: len(difficulty["answers"])
            for difficulty in difficulty_sets
        },
        "promptImage": {
            "width": image_size[0],
            "height": image_size[1],
            "bytes": staged_image.stat().st_size,
        },
        "sourceRepair": repair.get("note"),
    }
    return exercise, report


def write_outputs(
    exercises: dict[str, dict[str, Any]],
    staged_images: Path,
    *,
    dry_run: bool,
) -> None:
    if dry_run:
        return
    OUTPUT_IMAGES.mkdir(parents=True, exist_ok=True)
    for image in staged_images.glob("*.webp"):
        shutil.copy2(image, OUTPUT_IMAGES / image.name)

    javascript = (
        "window.EDMUND_IELTS_WRITING_TASK1_EXERCISES = "
        + json.dumps(exercises, ensure_ascii=False, indent=2)
        + ";\n"
    )
    temporary = OUTPUT_DATA.with_suffix(".js.tmp")
    temporary.write_text(javascript, encoding="utf-8")
    temporary.replace(OUTPUT_DATA)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and render to staging without replacing repository outputs.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    logging.getLogger("pdfminer").setLevel(logging.ERROR)
    sources = discover_sources()
    source_index = {source.key: source for source in sources}
    if STAGING_ROOT.exists():
        shutil.rmtree(STAGING_ROOT)
    staging_images = STAGING_ROOT / "prompts"
    staging_images.mkdir(parents=True, exist_ok=True)

    exercises: dict[str, dict[str, Any]] = {}
    reports: list[dict[str, Any]] = []
    try:
        for index, source in enumerate(sources, start=1):
            try:
                exercise, report = build_exercise(
                    source, staging_images, source_index
                )
            except BuildError as error:
                raise BuildError(f"{source.exercise_id}: {error}") from error
            exercises[source.exercise_id] = exercise
            reports.append(report)
            print(
                f"[{index:02d}/60] {source.exercise_id}: "
                f"{report['canonicalWords']} words, "
                f"{report['translationSegments']} translations, "
                f"{report['difficultyAnswers']}",
                flush=True,
            )

        if len(exercises) != 60:
            raise BuildError(
                f"Expected 60 generated exercises, got {len(exercises)}"
            )
        if len(list(staging_images.glob("*.webp"))) != len(exercises):
            raise BuildError("Prompt-image count does not match exercise count")

        category_counts = Counter(
            exercise["downloadCategory"] for exercise in exercises.values()
        )
        write_outputs(exercises, staging_images, dry_run=args.dry_run)
        summary = {
            "generatedExercises": len(exercises),
            "generatedPromptImages": len(exercises),
            "categoryCounts": dict(category_counts),
            "translationSegments": sum(
                report["translationSegments"] for report in reports
            ),
            "difficultyAnswerTotals": {
                key: sum(
                    report["difficultyAnswers"][key] for report in reports
                )
                for _, key, _, _ in DIFFICULTIES
            },
            "sourceRepairs": [
                {
                    "id": report["id"],
                    "note": report["sourceRepair"],
                }
                for report in reports
                if report["sourceRepair"]
            ],
            "outputData": str(OUTPUT_DATA),
            "outputImages": str(OUTPUT_IMAGES),
            "dryRun": args.dry_run,
        }
        print(json.dumps(summary, ensure_ascii=False, indent=2), flush=True)
    finally:
        if STAGING_ROOT.exists():
            shutil.rmtree(STAGING_ROOT)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except BuildError as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
