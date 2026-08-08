#!/usr/bin/env python3
"""Deterministically import Idiom lessons 26-138 from the supplied PDFs.

The sources share a bilingual teaching structure but differ in their exact
headings and pagination.  This importer preserves the source exercises and
answer keys verbatim, normalises them into the existing eight-page Idiom
schema, and deliberately omits the sections rejected by the course owner:
Communicative Function, The Original Image, and extended dictionary/source
commentary after the concise Core Meaning.

Run ``--audit`` to parse and reconcile every source without writing output.
The normal mode writes one reviewed JSON fragment per source plus a SHA-256
manifest.  The public data bundle is produced separately by
``build-idiom-expansion.mjs``.
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SOURCE = Path.home() / "Desktop" / "Idiom"
LESSON_DIRECTORY = ROOT / "tools" / "idiom-lessons"
MANIFEST_PATH = ROOT / "tools" / "idiom-import-manifest.json"
PDFTOTEXT = Path(shutil.which("pdftotext") or (
    Path.home() / ".cache" / "codex-runtimes" / "codex-primary-runtime"
    / "dependencies" / "native" / "poppler" / "poppler" / "bin" / "pdftotext"
))
SOURCE_NAME = re.compile(r"^idiom\s+(?P<number>\d+)\s*-\s*(?P<title>.+?)\.pdf$", re.I)
HAS_CJK = re.compile(r"[\u3400-\u9fff]")
TOKEN = re.compile(r"[A-Za-z]+(?:['’][A-Za-z]+)?|\d+(?:[.,]\d+)?|[^\w\s]", re.UNICODE)
MATCH_TOKEN = re.compile(r"[A-Za-z0-9]+(?:['’][A-Za-z]+)?", re.UNICODE)
ANSWER_BLANK = re.compile(r"^Answer\s*:\s*(?P<starter>.*?)\s*_{3,}\s*$", re.I)
QUESTION_RANGE = re.compile(r"^Questions?\s+1\s*[–—-]\s*10\b", re.I)
PAGE_SECTION_PREFIX = re.compile(r"^P\.\s*\d+\s*[—–-]\s*", re.I)
ANSWER_RANGE_HEADING = re.compile(r"^Answers?\s+\d+\s*[–—-]\s*\d+\b", re.I)
BAND_HEADING = re.compile(r"^Band\s+\d+\s*[—–-]", re.I)
EDITORIAL_APPENDIX = re.compile(r"^(?:::?\s*)?This edition deliberately\b", re.I)
GENERIC_FALLBACK_COPY = re.compile(
    r"Source Exercise Pattern|Concise Idiomatic Expression|Follow the Source Exercise Meaning|"
    r"Source Coverage|the meaning and usage of the expression|按原檔示範答案所顯示的意思及用法|"
    r"原檔練習句式|簡潔地運用慣用語|按照原檔練習意思運用|原檔內容範圍|"
    r"Use the target idiom with this source pattern|按照這個原檔句式運用目標慣用語|"
    r"Apply this source point|按照原檔列出的這項重點運用目標慣用語",
    re.I,
)

IRREGULAR_FORMS = {
    "be": {"am", "is", "are", "was", "were", "been", "being"},
    "bite": {"bites", "bit", "bitten", "biting"},
    "blow": {"blows", "blew", "blown", "blowing"},
    "break": {"breaks", "broke", "broken", "breaking"},
    "bring": {"brings", "brought", "bringing"},
    "build": {"builds", "built", "building"},
    "buy": {"buys", "bought", "buying"},
    "catch": {"catches", "caught", "catching"},
    "come": {"comes", "came", "coming"},
    "cost": {"costs", "cost", "costing"},
    "cut": {"cuts", "cut", "cutting"},
    "do": {"does", "did", "done", "doing"},
    "draw": {"draws", "drew", "drawn", "drawing"},
    "eat": {"eats", "ate", "eaten", "eating"},
    "fight": {"fights", "fought", "fighting"},
    "fit": {"fits", "fitted", "fit", "fitting"},
    "fly": {"flies", "flew", "flown", "flying"},
    "get": {"gets", "got", "gotten", "getting"},
    "give": {"gives", "gave", "given", "giving"},
    "go": {"goes", "went", "gone", "going"},
    "hang": {"hangs", "hung", "hanged", "hanging"},
    "have": {"has", "had", "having"},
    "hear": {"hears", "heard", "hearing"},
    "keep": {"keeps", "kept", "keeping"},
    "know": {"knows", "knew", "known", "knowing"},
    "leave": {"leaves", "left", "leaving"},
    "lie": {"lies", "lay", "lain", "lying"},
    "make": {"makes", "made", "making"},
    "meet": {"meets", "met", "meeting"},
    "put": {"puts", "put", "putting"},
    "raise": {"raises", "raised", "raising"},
    "run": {"runs", "ran", "running"},
    "see": {"sees", "saw", "seen", "seeing"},
    "set": {"sets", "set", "setting"},
    "shake": {"shakes", "shook", "shaken", "shaking"},
    "show": {"shows", "showed", "shown", "showing"},
    "speak": {"speaks", "spoke", "spoken", "speaking"},
    "spill": {"spills", "spilled", "spilt", "spilling"},
    "take": {"takes", "took", "taken", "taking"},
    "think": {"thinks", "thought", "thinking"},
    "throw": {"throws", "threw", "thrown", "throwing"},
    "turn": {"turns", "turned", "turning"},
    "wear": {"wears", "wore", "worn", "wearing"},
}

ROMAN_ZH = {
    1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六", 7: "七", 8: "八",
    9: "九", 10: "十", 11: "十一", 12: "十二", 13: "十三", 14: "十四", 15: "十五",
}

# Card titles are compact learning labels, not definitions.  The full source
# explanation remains in meaning.zh; these reviewed labels keep the dashboard
# consistent with lessons 01-25.
TITLE_ZH_OVERRIDES = {
    31: "爭吵不休／水火不容",
    35: "成敗關鍵／決定成敗",
    27: "很久沒有／久未",
    29: "虛張的障礙／想像中的困難",
    30: "身陷險境／闖入虎口",
    36: "大人物／重要人物",
    39: "思想契合／達成共識",
    42: "視而不見／隻眼開、隻眼閉",
    43: "欣喜若狂／興奮得發狂",
    44: "身體不適／有點不舒服",
    45: "全神貫注地聽／洗耳恭聽",
    47: "指責／歸咎於",
    48: "令某人怒火中燒／令人非常憤怒",
    51: "找錯方向／怪錯人",
    52: "杞人憂天／自尋煩惱",
    57: "改過自新／重新做人",
    58: "停止運作／壽終正寢",
    62: "紙老虎／外強中乾",
    63: "一石二鳥／一舉兩得",
    66: "難以下嚥的苦果／難接受的事實",
    67: "全權授權／不設限制",
    68: "害群之馬／不受接納的成員",
    70: "高價／最高價",
    71: "脆弱的體系／紙牌屋",
    72: "分而治之／分化統治",
    73: "折衷方案／中間方案",
    74: "跟風／加入潮流",
    76: "幾乎不可能／才怪",
    77: "並肩合作／同心協力",
    79: "消息人士告訴我／不便透露來源",
    80: "挺身承擔風險／為貓掛鈴",
    82: "小心翼翼／如履薄冰",
    83: "處於十字路口／面臨抉擇",
    88: "特洛伊木馬／暗藏威脅",
    92: "提心吊膽／極度緊張",
    93: "不只外表漂亮／有才有貌",
    96: "瘦骨嶙峋／皮包骨",
    98: "鳥瞰／全局概覽",
    102: "上流名人／時尚名流",
    103: "受到嚴厲責罵／受罰",
    104: "指手畫腳的乘客／愛管閒事者",
    106: "打一場必敗之仗／徒勞抗爭",
    112: "千真萬確／毫無疑問",
    113: "亂七八糟／混亂無序",
    116: "暫緩行動／延後決定",
    117: "說曹操，曹操到／剛提起便出現",
    118: "隨大流／順應潮流",
    121: "亮出底牌／透露意圖",
    123: "因禍得福／塞翁失馬",
    125: "低頭認錯／承認失敗",
    126: "不能相提並論／截然不同",
    131: "玩命／冒生命危險",
    132: "煙幕／障眼法",
    134: "打亂計劃／破壞局面",
    135: "一心想要／立志得到",
    136: "精力充沛／活力十足",
}


@dataclass(frozen=True)
class Line:
    text: str
    page: int


@dataclass
class ParsedQuestion:
    number: int
    page: int
    english: str
    chinese: str
    starter: str = ""
    pages: tuple[int, ...] = ()


def normal_text(value: object) -> str:
    text = unicodedata.normalize("NFKC", str(value or ""))
    text = text.replace("\u200b", "").replace("\ufeff", "").replace("\u2060", "")
    return re.sub(r"\s+", " ", text).strip()


def formula_display_text(value: object) -> str:
    """Strip source terminators before adding one display-language mark."""
    return re.sub(r"^[.;；。●•▪◦* ]+|[.;；。●•▪◦* ]+$", "", normal_text(value))


def normalize_student_names(value: str) -> str:
    return re.sub(r"\bMia\b", "Tom", value).replace("米婭", "湯姆")


REJECTED_SECTION_COPY = re.compile(
    r"The Original Image|The Literal Picture|原來的畫面|字面畫面|"
    r"Communicative Function|Communication Purpose|溝通功能|溝通用途",
    re.I,
)


def remove_rejected_section_sentences(value: str) -> str:
    """Delete copied rejected-section sentences rather than renaming them."""
    text = normal_text(value)
    if not REJECTED_SECTION_COPY.search(text):
        return text
    pieces = re.split(r"(?<=[.!?。！？])\s+", text)
    kept = [piece for piece in pieces if not REJECTED_SECTION_COPY.search(piece)]
    return normal_text(" ".join(kept))


def sanitize_published_copy(value: object) -> object:
    """Apply the owner's presentation exclusions after source parsing."""
    if isinstance(value, str):
        value = re.sub(r"The expression does not simply mean", "The expression is not limited to meaning", value, flags=re.I)
        return normalize_student_names(remove_rejected_section_sentences(value))
    if isinstance(value, list):
        return [sanitize_published_copy(item) for item in value]
    if isinstance(value, dict):
        return {key: sanitize_published_copy(item) for key, item in value.items()}
    return value


def normalize_chinese_display_text(value: object) -> str:
    """Repair PDF line wraps and punctuation in Chinese-facing copy.

    This is presentation normalization only: it never changes English prompt
    or answer semantics.  ASCII punctuation inside an English formula remains
    untouched unless it directly borders Chinese text.
    """
    text = str(value or "")
    text = re.sub(r"(?<=[\u3400-\u9fff])\s+(?=[\u3400-\u9fff])", "", text)
    text = re.sub(r"(?<=[\u3400-\u9fff])。?\s*\.{3,}\s*。?", "……", text)
    text = re.sub(r"\s+([，。；：！？、）】」』])", r"\1", text)
    text = re.sub(r"([（【「『])\s+", r"\1", text)
    for ascii_mark, chinese_mark in ((",", "，"), (";", "；"), (":", "："), ("?", "？"), ("!", "！"), (".", "。")):
        text = re.sub(rf"(?<=[\u3400-\u9fff]){re.escape(ascii_mark)}", chinese_mark, text)
        text = re.sub(rf"{re.escape(ascii_mark)}(?=[\u3400-\u9fff])", chinese_mark, text)
    text = re.sub(r"(?:[;；]\s*){2,}", "；", text)
    text = re.sub(r"。[;；]\s*", "；", text)
    text = re.sub(r"([，。；：！？、])\1+", r"\1", text)
    text = re.sub(r"^[\s;；]+", "", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_teaching_display_fields(
    value: object,
    chinese_context: bool = False,
) -> object:
    """Remove PDF bullet glyphs from teaching copy, never exercises."""
    if isinstance(value, str):
        separator = "；" if chinese_context else "; "
        text = repair_unmatched_display_delimiters(value)
        text = re.sub(r"\s*[●•▪◦]\s*", separator, text)
        text = re.sub(r"；{2,}", "；", text)
        text = re.sub(r"(?:;\s*){2,}", "; ", text)
        return normalize_chinese_display_text(text) if chinese_context else re.sub(r"\s+", " ", text).strip()
    if isinstance(value, list):
        return [normalize_teaching_display_fields(item, chinese_context) for item in value]
    if isinstance(value, dict):
        return {
            key: item if key == "questions" else normalize_teaching_display_fields(
                item,
                key == "zh" or key.lower().endswith("zh"),
            )
            for key, item in value.items()
        }
    return value


def normalize_chinese_display_fields(
    value: object,
    chinese_context: bool = False,
) -> object:
    if isinstance(value, str):
        return normalize_chinese_display_text(value) if chinese_context else value
    if isinstance(value, list):
        return [normalize_chinese_display_fields(item, chinese_context) for item in value]
    if isinstance(value, dict):
        return {
            key: normalize_chinese_display_fields(
                item,
                key == "zh" or key.lower().endswith("zh"),
            )
            for key, item in value.items()
        }
    return value


def chinese_clause_key(value: object) -> str:
    return re.sub(
        r"[\s，,。！？!?；;：:「」“”'’\"()（）\[\]［］]",
        "",
        str(value or "").casefold(),
    )


def remove_immediate_overlapping_prefix(value: str) -> str:
    """Remove a damaged PDF prefix immediately repeated with its full tail."""
    text = value.strip()
    changed = True
    while changed:
        changed = False
        for index in range(1, len(text)):
            prefix = text[:index].rstrip()
            suffix = text[index:].lstrip()
            if len(chinese_clause_key(prefix)) >= 12 and suffix.startswith(prefix):
                text = suffix
                changed = True
                break
    return text


def dedupe_chinese_teaching_text(value: object) -> str:
    """Keep the first occurrence of each Chinese teaching clause in order."""
    text = normalize_chinese_display_text(value)
    text = re.sub(
        r"(?:(?<=^)|(?<=[。！？!?；;\s]))(?:Rule|Benefit|Formula)\s+\d+\s*[:：]\s*",
        "",
        text,
        flags=re.I,
    )
    text = re.sub(
        r"(?:(?<=^)|(?<=[。！？!?；;\s]))(?:規則|好處|句式)[一二三四五六七八九十\d]+\s*[:：]\s*",
        "",
        text,
    )
    if text and not substantive_chinese(text):
        text = f"原檔重點：{text}"
    text = remove_immediate_overlapping_prefix(text)
    clauses = [part.strip() for part in re.split(r"(?<=[。！？!?；;])", text) if part.strip()]
    seen: set[str] = set()
    kept: list[str] = []
    for raw_clause in clauses:
        clause = remove_immediate_overlapping_prefix(raw_clause)
        key = chinese_clause_key(clause)
        if len(key) >= 6 and key in seen:
            continue
        if len(key) >= 6:
            seen.add(key)
        kept.append(clause)
    return normalize_chinese_display_text(" ".join(kept))


def clean_english_teaching_text(value: object) -> str:
    text = repair_unmatched_display_delimiters(value)
    text = re.sub(r"\s*[●•▪◦]\s*", "; ", text)
    text = re.sub(r"(?:;\s*){2,}", "; ", text)
    text = re.sub(r"\b(?:Rule|Benefit|Formula)\s+\d+\s*[:：]\s*", "", text, flags=re.I)
    return normal_text(text).lstrip("; ")


def dedupe_lesson_teaching_chinese(lesson: dict) -> None:
    """Deduplicate only teaching prose; exercise prompts/answers stay intact."""
    register = lesson.get("register", {})
    for key in ("summaryEn", "formalEn"):
        if register.get(key):
            register[key] = clean_english_teaching_text(register[key])
    for key in ("summaryZh", "formalZh"):
        if register.get(key):
            register[key] = dedupe_chinese_teaching_text(register[key])
    instructions = lesson.get("instructions", {})
    if instructions.get("en"):
        instructions["en"] = clean_english_teaching_text(instructions["en"])
    if instructions.get("zh"):
        instructions["zh"] = dedupe_chinese_teaching_text(instructions["zh"])
    for form in lesson.get("specificForms", []):
        if form.get("descriptionEn"):
            form["descriptionEn"] = clean_english_teaching_text(form["descriptionEn"])
        if form.get("descriptionZh"):
            form["descriptionZh"] = dedupe_chinese_teaching_text(form["descriptionZh"])
    for section_name in ("benefits", "rules"):
        for card in lesson.get(section_name, []):
            if card.get("en"):
                card["en"] = clean_english_teaching_text(card["en"])
            if card.get("zh"):
                card["zh"] = dedupe_chinese_teaching_text(card["zh"])
    for card in lesson.get("origin", {}).get("history", []):
        if card.get("en"):
            card["en"] = clean_english_teaching_text(card["en"])
        if card.get("zh"):
            card["zh"] = dedupe_chinese_teaching_text(card["zh"])


def enforce_atomic_form_descriptions(lesson: dict) -> None:
    """Guarantee every form explanation is one coherent bilingual source unit."""
    for form in lesson.get("specificForms", []):
        english = normal_text(form.get("descriptionEn"))
        chinese = str(form.get("descriptionZh") or "").strip()
        formula_like = "+" in english or bool(
            re.match(r"^(?:Frame|Pattern|Formula)\s+\d+\b", english, re.I)
        )
        invalid = (
            not english
            or not chinese
            or HAS_CJK.search(english)
            or is_description_heading(english)
            or is_description_heading(chinese)
            or not substantive_chinese(chinese)
            or (
                formula_like
                and not re.search(r"原檔列出的句法框架|核心句式庫.*句式", chinese)
            )
        )
        if invalid:
            formula = normal_text(form.get("formula"))
            display_formula = formula_display_text(formula)
            form["descriptionEn"] = normal_text(f"Source grammar frame: {display_formula}.")
            form["descriptionZh"] = normalize_chinese_display_text(
                f"原檔列出的句法框架：{display_formula}。"
            )


def remove_false_parent_examples(lesson: dict) -> None:
    """Drop explanatory prose accidentally paired as an example translation."""
    for form in lesson.get("specificForms", []):
        parent = normalize_chinese_display_text(form.get("descriptionZh"))
        form["examples"] = [
            example for example in form.get("examples", [])
            if normalize_chinese_display_text(example.get("zh")) != parent
        ]
    for section_name in ("benefits", "rules"):
        for card in lesson.get(section_name, []):
            parent = normalize_chinese_display_text(card.get("zh"))
            card["examples"] = [
                example for example in card.get("examples", [])
                if normalize_chinese_display_text(example.get("zh")) != parent
            ]


def repair_known_source_artifacts(lesson: dict, order: int) -> None:
    """Repair narrowly reviewed extraction artefacts in the supplied PDFs."""
    if order == 77 and lesson.get("specificForms"):
        first_form = lesson["specificForms"][0]
        formula = formula_display_text(first_form.get("formula"))
        first_form["formula"] = formula
        first_form["descriptionEn"] = f"Source grammar frame: {formula}."
        first_form["descriptionZh"] = f"原檔列出的句法框架：{formula}。"
        if lesson.get("fixedVariable", {}).get("forms"):
            lesson["fixedVariable"]["forms"][0]["form"] = formula
    if order == 136:
        literal_rule = next(
            (card for card in lesson.get("rules", []) if card.get("number") == 3),
            None,
        )
        if literal_rule:
            literal_rule["zh"] = (
                "錯誤的字面理解：「她裝滿了豆子。」"
                "正確的慣用意思：「她精力充沛、活力十足、精神奕奕或生龍活虎。」"
            )


def clean_line(value: str) -> str:
    return normalize_student_names(normal_text(value))


def strip_bullet(value: str) -> str:
    return re.sub(r"^(?:[●•▪◦*-]|\d+[.)])\s*", "", clean_line(value)).strip()


def join_lines(values: Iterable[str]) -> str:
    text = " ".join(clean_line(value) for value in values if clean_line(value))
    text = re.sub(r"\s+([,.;:!?，。；：！？）】])", r"\1", text)
    text = re.sub(r"([（【])\s+", r"\1", text)
    return normal_text(text)


def strip_outer_wrappers(value: str) -> str:
    text = normal_text(value)
    wrappers = (("(", ")"), ("（", "）"), ("[", "]"), ("［", "］"), ("【", "】"))
    while True:
        stripped = next(
            (
                text[len(opening) : -len(closing)].strip()
                for opening, closing in wrappers
                if text.startswith(opening) and text.endswith(closing)
            ),
            None,
        )
        if stripped is None or stripped == text:
            return text
        text = stripped


def join_chinese(values: Iterable[str]) -> str:
    text = join_lines(values)
    text = re.split(r"\s*:::\s*", text, maxsplit=1)[0]
    # Exercise translations are inconsistently wrapped in round, square or
    # full-width brackets.  The wrapper is layout punctuation, not content.
    return strip_outer_wrappers(text)


def chinese_part(value: object) -> str:
    text = normal_text(value)
    match = HAS_CJK.search(text)
    if not match:
        return ""
    prefix = text[: match.start()].strip(" ([［【（")
    first_cjk = text[match.start()]
    preserve_short_prefix = (
        prefix
        and len(prefix) <= 60
        and len(re.findall(r"[A-Za-z][A-Za-z’'-]*", prefix)) <= 8
        and not re.search(r"[.!?。！？:]", prefix)
        and first_cjk in "的和是在於屬指表示把與由可通常"
    )
    value = normal_text(f"{prefix} {text[match.start():]}") if preserve_short_prefix else text[match.start() :]
    # A damaged two-column extraction can append a new English paragraph
    # after a short Chinese heading.  Retain a short target-expression tail,
    # but discard a long English-only tail after the final Chinese character.
    cjk_positions = [item.start() for item in HAS_CJK.finditer(value)]
    last_cjk = cjk_positions[-1]
    tail = value[last_cjk + 1 :]
    if len(re.findall(r"[A-Za-z]", tail)) > 30:
        value = value[: last_cjk + 1]
    for opening, closing in (("(", ")"), ("（", "）"), ("[", "]"), ("［", "］"), ("【", "】")):
        if value.endswith(closing) and opening not in value:
            value = value[: -len(closing)].rstrip()
    return strip_outer_wrappers(value)


def substantive_chinese(value: object) -> bool:
    text = normal_text(value)
    # Formulae and target expressions may remain in English inside an
    # otherwise Chinese-first explanation.  Judge substance on the prose
    # preceding a labelled formula instead of treating formula tokens as
    # untranslated copy.
    ratio_text = re.sub(r"(?:句式|公式|句法框架)\s*[:：].*$", "", text)
    cjk_count = len(HAS_CJK.findall(ratio_text))
    latin_count = len(re.findall(r"[A-Za-z]", ratio_text))
    structural_contamination = re.search(
        r"\bSource\s*:|Rewrite or respond|A strong exercise should|This is accidental|"
        r"Do not use the idiom|:::|\]\s*[●•▪◦]",
        text,
        re.I,
    )
    return cjk_count >= 2 and latin_count <= max(60, cjk_count * 3) and not structural_contamination


def compact_heading(value: object, fallback: str, max_length: int) -> str:
    # Source headings are frequently formatted as short imperative sentences
    # with a final full stop.  Keep the source wording but remove presentation
    # punctuation so it remains a compact heading rather than falling back to
    # a generic Rule/Form/Benefit number.
    text = normal_text(value).rstrip(".!?。！？ ")
    if (
        not text
        or len(text) > max_length
        or re.search(r"[●•▪◦]", text)
    ):
        return fallback
    return text


def is_description_heading(value: object) -> bool:
    return bool(re.fullmatch(
        r"(?:Examples?\s*:?\s*|Best Core Grammar Bank|Core Grammar Bank|Grammar Bank|"
        r"Important Rules|Benefits|Model Examples?|Formula(?:s|\(s\))?|"
        r"Frame\s+\d+\s*:\s*[^.!?。！？]*)",
        normal_text(value),
        re.I,
    ))


def normalize_chinese_display_punctuation(value: object) -> str:
    """Use full-width punctuation in Chinese-facing card titles."""
    return (
        normal_text(value)
        .replace("/", "／")
        .replace(",", "，")
        .replace(";", "；")
        .replace(":", "：")
    )


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return value or "idiom"


def source_metadata(path: Path) -> tuple[int, str]:
    match = SOURCE_NAME.match(path.name)
    if not match:
        raise ValueError(f"Unsupported Idiom filename: {path.name}")
    title = match.group("title").strip().strip("“”\"「」 ")
    title = re.sub(r"^Target Expression[_:]?\s*", "", title, flags=re.I)
    return int(match.group("number")), normal_text(title)


def extract_lines(path: Path) -> tuple[list[Line], int]:
    if not PDFTOTEXT.is_file():
        raise RuntimeError(f"Bundled pdftotext is missing: {PDFTOTEXT}")
    result = subprocess.run(
        [str(PDFTOTEXT), "-layout", str(path), "-"],
        check=True,
        capture_output=True,
        text=True,
    )
    raw_pages = result.stdout.split("\f")
    if raw_pages and not raw_pages[-1].strip():
        raw_pages.pop()
    lines: list[Line] = []
    for page_number, raw_page in enumerate(raw_pages, 1):
        lines.extend(Line(clean_line(raw), page_number) for raw in raw_page.splitlines())
        lines.append(Line("", page_number))
    return lines, len(raw_pages)


def logical_heading_text(value: str) -> str:
    """Remove a printed P.n prefix while retaining the underlying heading."""
    return PAGE_SECTION_PREFIX.sub("", clean_line(value)).strip()


def line_matches(line: Line, patterns: Sequence[str]) -> bool:
    candidates = (line.text, logical_heading_text(line.text))
    return any(re.search(pattern, candidate, re.I) for pattern in patterns for candidate in candidates)


def find_index(lines: Sequence[Line], patterns: Sequence[str], start: int = 0, stop: int | None = None, *, last: bool = False) -> int | None:
    upper = len(lines) if stop is None else min(stop, len(lines))
    matches = [index for index in range(start, upper) if line_matches(lines[index], patterns)]
    if not matches:
        return None
    return matches[-1] if last else matches[0]


def section(lines: Sequence[Line], starts: Sequence[str], ends: Sequence[str]) -> list[Line]:
    begin = find_index(lines, starts)
    if begin is None:
        return []
    finish_candidates = [find_index(lines, ends, begin + 1)]
    # Printed P.n headings are authoritative section boundaries even when a
    # source reorders Benefits, Rules, History or uses P.9/P.10 for Exercise.
    finish_candidates.append(find_index(lines, [r"^P\.\s*\d+\s*[—–-]"], begin + 1))
    finish = min((value for value in finish_candidates if value is not None), default=None)
    return list(lines[begin + 1 : finish if finish is not None else len(lines)])


def paragraph_groups(lines: Sequence[Line]) -> list[list[Line]]:
    groups: list[list[Line]] = []
    active: list[Line] = []
    for line in lines:
        if line.text:
            active.append(line)
        elif active:
            groups.append(active)
            active = []
    if active:
        groups.append(active)
    return groups


def numbered_value(value: str) -> tuple[int, str] | None:
    value = clean_line(value)
    match = re.fullmatch(r"(?P<number>\d{1,2})(?:[.)]\s*(?P<rest>.*))?", value)
    if not match:
        return None
    return int(match.group("number")), clean_line(match.group("rest") or "")


def split_bilingual(lines: Sequence[Line]) -> tuple[str, str]:
    usable = [
        line for line in lines
        if line.text
        and not QUESTION_RANGE.match(line.text)
        and not ANSWER_RANGE_HEADING.match(line.text)
        and not BAND_HEADING.match(line.text)
        and not EDITORIAL_APPENDIX.match(line.text)
        and not re.fullmatch(r"(?:::|---|___)+", line.text)
    ]
    chinese_start = next(
        (
            index for index, line in enumerate(usable)
            if HAS_CJK.search(line.text) and line.text.startswith(("（", "(", "［", "["))
        ),
        None,
    )
    if chinese_start is None:
        chinese_start = next((index for index, line in enumerate(usable) if HAS_CJK.search(line.text)), len(usable))
    english = join_lines(line.text for line in usable[:chinese_start])
    chinese = join_chinese(line.text for line in usable[chinese_start:])
    return english, chinese


def regular_forms(base: str) -> set[str]:
    base = base.casefold()
    forms = {base, f"{base}s", f"{base}ed", f"{base}ing"}
    if base.endswith("e"):
        forms.update({f"{base}d", f"{base[:-1]}ing"})
    if base.endswith("y") and len(base) > 1 and base[-2] not in "aeiou":
        forms.update({f"{base[:-1]}ies", f"{base[:-1]}ied"})
    if len(base) >= 3 and base[-1] not in "aeiouwxy" and base[-2] in "aeiou" and base[-3] not in "aeiou":
        forms.update({f"{base}{base[-1]}ed", f"{base}{base[-1]}ing"})
    forms.update(IRREGULAR_FORMS.get(base, set()))
    return forms


def expression_alternatives(expression: str) -> list[str]:
    expression = normal_text(expression).replace("_", " / ")
    alternatives = [normal_text(item) for item in re.split(r"\s+/\s+", expression) if normal_text(item)]
    expanded: list[str] = []
    for item in alternatives or [expression]:
        expanded.append(item)
        without_optional = re.sub(r"\([^)]*\)", "", item)
        if normal_text(without_optional) != item:
            expanded.append(normal_text(without_optional))
    return sorted(set(expanded), key=len, reverse=True)


def expression_regex(expression: str) -> re.Pattern[str] | None:
    tokens = [token for token in TOKEN.findall(expression) if re.search(r"[A-Za-z]", token)]
    if not tokens:
        return None
    patterns: list[str] = []
    for index, token in enumerate(tokens):
        lower = token.casefold().replace("’", "'")
        if lower in {"someone", "somebody", "something", "person"} and index == len(tokens) - 1:
            # A trailing dictionary placeholder is outside the fixed words that
            # should receive the blue target highlight.
            continue
        if lower in {"one's", "someone's", "somebody's", "your", "my", "his", "her", "our", "their", "its"}:
            patterns.append(
                r"(?:my|your|his|her|our|their|its|one['’]s|someone['’]s|somebody['’]s|"
                r"(?:Mr|Mrs|Ms|Dr)\s+[A-Za-z]+['’]s|"
                r"(?:the|many|several|both|all|some|these|those)\s+[A-Za-z]+(?:\s+[A-Za-z]+)?(?:['’]s|s['’])|"
                r"[A-Za-z]+(?:\s+[A-Za-z]+){0,3}(?:['’]s|s['’]))"
            )
            continue
        if index == 0 and lower.isalpha():
            if lower == "be":
                patterns.append(r"(?:I['’]m|(?:you|we|they)['’]re|(?:he|she|it)['’]s|am|is|are|was|were|been|being|be)")
            else:
                forms = sorted(regular_forms(lower), key=len, reverse=True)
                patterns.append("(?:" + "|".join(re.escape(form) for form in forms) + ")")
            continue
        if lower in {"brain", "cow", "hand", "head", "heart", "mouth", "stomach", "wound"}:
            patterns.append(re.escape(token).replace("’", "['’]") + "s?")
        else:
            patterns.append(re.escape(token).replace("’", "['’]"))
    if not patterns:
        return None
    separators = [r"[\s,;:—–-]+"] * max(0, len(patterns) - 1)
    if tokens and tokens[0].casefold() == "fit" and len(separators) >= 1:
        separators[0] = r"(?:\s+(?:[A-Za-z]+(?:['’]s)?)(?:\s+[A-Za-z]+){0,2})?\s+"
    if tokens and tokens[0].casefold() == "be" and separators:
        separators[0] = r"(?:\s+(?:always|still|really|quite|certainly|completely|totally|now|already|just))?\s+"
    if re.fullmatch(r"cost\s+the\s+earth", normal_text(expression), re.I) and separators:
        separators[0] = r"(?:\s+(?:me|us|you|him|her|them|the\s+[A-Za-z]+))?\s+"
    if re.fullmatch(r"not\s+just\s+a\s+pretty\s+face", normal_text(expression), re.I) and separators:
        separators[0] = r"(?:\s+(?:be|been|being))?\s+"
    body = "".join(pattern + (separators[index] if index < len(separators) else "") for index, pattern in enumerate(patterns))
    return re.compile(r"(?<![A-Za-z])" + body + r"(?![A-Za-z])", re.I)


def special_target_match(answer: str, expression: str) -> re.Match[str] | None:
    """Match attested grammatical variants that are not simple word changes."""
    normalized = normal_text(expression).casefold().replace("’", "'")
    if normalized == "pigs might fly":
        return re.search(r"(?<![A-Za-z])pigs\s+(?:might|can)\s+fly(?![A-Za-z])", answer, re.I)
    if normalized.startswith("point the finger"):
        return re.search(
            r"(?<![A-Za-z])(?:point|points|pointed|pointing)\s+the\s+finger(?![A-Za-z])",
            answer,
            re.I,
        )
    if "heart in one's mouth" in normalized:
        possessive = r"(?:my|your|his|her|our|their|one['’]s|[A-Za-z]+(?:['’]s|s['’]))"
        heart = r"hearts?"
        mouth = r"mouths?"
        patterns = [
            rf"{possessive}\s+{heart}\s+(?:had\s+been|has\s+been|have\s+been|will\s+be|is|are|was|were|be|been|being)\s+in\s+{possessive}\s+{mouth}",
            rf"(?:have|has|had|having)\s+{possessive}\s+{heart}\s+in\s+{possessive}\s+{mouth}",
            rf"{possessive}\s+{heart}\s+in\s+{possessive}\s+{mouth}",
            r"heart[-‐‑‒–—]in[-‐‑‒–—](?:my|your|his|her|our|their)[-‐‑‒–—]mouth",
        ]
        for pattern in patterns:
            match = re.search(r"(?<![A-Za-z])" + pattern + r"(?![A-Za-z])", answer, re.I)
            if match:
                return match
    return None


def target_highlight(answer: str, expression: str, prompt: str = "") -> tuple[str, str]:
    special = special_target_match(answer, expression)
    if special:
        return special.group(0).strip(" ,.;:!?—–-"), "expression"
    for alternative in expression_alternatives(expression):
        regex = expression_regex(alternative)
        match = regex.search(answer) if regex else None
        if match:
            return match.group(0).strip(" ,.;:!?—–-"), "expression"
    answer_tokens = [(match.group(0), match.start(), match.end()) for match in TOKEN.finditer(answer)]
    prompt_tokens = [match.group(0).casefold() for match in TOKEN.finditer(prompt)]
    matcher = difflib.SequenceMatcher(
        a=prompt_tokens,
        b=[token.casefold() for token, _, _ in answer_tokens],
        autojunk=False,
    )
    changed = [(j1, j2) for tag, _, _, j1, j2 in matcher.get_opcodes() if tag != "equal" and j2 > j1]
    if changed:
        start, end = max(changed, key=lambda item: item[1] - item[0])
        if end - start > 14:
            end = start + 14
        value = answer[answer_tokens[start][1] : answer_tokens[end - 1][2]].strip(" ,.;:!?—–-")
        if value:
            return value, "diff-fallback"
    first = next((token for token, _, _ in answer_tokens if token.isalpha()), answer.strip())
    return first, "first-token-fallback"


def parse_questions(lines: Sequence[Line], answer_heading: int) -> list[ParsedQuestion]:
    exercise_heading = find_index(
        lines,
        [r"^(?:P\.\d+\s*[—–-]\s*)?Exercise(?:\s+練習)?$"],
        stop=answer_heading,
        last=True,
    )
    if exercise_heading is None:
        raise ValueError("Exercise heading is missing")
    start = find_index(lines, [r"^Questions?\s+1\s*[–—-]\s*10\b"], exercise_heading + 1, answer_heading)
    if start is None:
        start = exercise_heading + 1
    questions: list[ParsedQuestion] = []
    previous_answer = start
    for answer_index in range(start, answer_heading):
        marker = ANSWER_BLANK.fullmatch(lines[answer_index].text)
        if not marker:
            continue
        number_index = None
        number = None
        for cursor in range(answer_index - 1, previous_answer - 1, -1):
            parsed = numbered_value(lines[cursor].text)
            if parsed and 1 <= parsed[0] <= 50:
                number_index, number = cursor, parsed[0]
                break
        if number_index is None or number != len(questions) + 1:
            continue
        parsed_number = numbered_value(lines[number_index].text)
        segment = list(lines[number_index + 1 : answer_index])
        if parsed_number and parsed_number[1]:
            segment.insert(0, Line(parsed_number[1], lines[number_index].page))
        english, chinese = split_bilingual(segment)
        starter = normal_text(marker.group("starter"))
        if not all((english, chinese, starter)):
            raise ValueError(f"Question {number} is incomplete")
        questions.append(ParsedQuestion(number, lines[number_index].page, english, chinese, starter))
        previous_answer = answer_index + 1
    if len(questions) != 50:
        raise ValueError(f"Expected 50 exercise questions, found {len(questions)}")
    return questions


def parse_answers(lines: Sequence[Line], answer_heading: int) -> list[ParsedQuestion]:
    answer_lines = lines[answer_heading + 1 :]
    markers: list[tuple[int, int, str]] = []
    cursor = 0
    for expected in range(1, 51):
        found = None
        while cursor < len(answer_lines):
            parsed = numbered_value(answer_lines[cursor].text)
            if parsed and parsed[0] == expected:
                found = (cursor, parsed[1])
                cursor += 1
                break
            cursor += 1
        if found is None:
            raise ValueError(f"Answer {expected} marker is missing")
        markers.append((found[0], expected, found[1]))
    answers: list[ParsedQuestion] = []
    for index, (line_index, number, rest) in enumerate(markers):
        stop = markers[index + 1][0] if index + 1 < len(markers) else len(answer_lines)
        segment = list(answer_lines[line_index + 1 : stop])
        if rest:
            segment.insert(0, Line(rest, answer_lines[line_index].page))
        english, chinese = split_bilingual(segment)
        if not all((english, chinese)):
            raise ValueError(f"Answer {number} is incomplete")
        answers.append(ParsedQuestion(number, answer_lines[line_index].page, english, chinese))
    return answers


def concise_core(lines: Sequence[Line]) -> tuple[dict, list[str]]:
    core = section(
        lines,
        [r"^(?:\d+[.)]\s*)?Core Meaning(?:\s+核心意思)?$", r"^Included Meaning(?:\s+本(?:課|練習)教授的意思)?$"],
        [r"^Communicative Function(?:\s+溝通功能)?$", r"(?:Register and )?Tone\s+語域及語氣$", r"^Fixed and (?:Variable|Optional) Parts\b"],
    )
    if not core:
        core = section(
            lines,
            [r"^Target Expression and Core Meaning$", r"^Target Expression and Meaning$"],
            [r"^Communicative Function(?:\s+溝通功能)?$", r"^Register\b", r"^Fixed and (?:Variable|Optional) Parts\b"],
        )
    pairs = bilingual_paragraphs(core)
    english = ""
    chinese = ""
    for candidate_en, candidate_zh in pairs:
        if (
            len(candidate_en) > 12
            and len(candidate_zh) > 4
            and substantive_chinese(candidate_zh)
            and not candidate_en.lower().startswith("natural chinese")
            and not re.fullmatch(r"Core Meaning|核心意思", candidate_en, re.I)
        ):
            english, chinese = candidate_en, candidate_zh
            break
    natural: list[str] = []
    natural_index = next(
        (
            index for index, line in enumerate(core)
            if re.search(r"Natural Chinese meanings?(?:\s+include)?\b", line.text, re.I)
        ),
        None,
    )
    if natural_index is not None:
        for line in core[natural_index + 1 :]:
            if not line.text:
                if natural:
                    break
                continue
            if HAS_CJK.search(line.text):
                value = strip_bullet(chinese_part(line.text))
                if value and value not in natural:
                    natural.append(value)
            elif natural:
                break
    if not natural and chinese:
        natural = [normal_text(item) for item in re.split(r"[；;]", chinese) if normal_text(item)][:4]
    return {"en": english, "zh": chinese, "naturalZh": natural}, natural


def concise_title_zh(natural: Sequence[str], meaning_zh: str) -> str:
    candidates: list[str] = []
    for raw in natural:
        value = normal_text(raw).strip("“”\"「」【】[]() ")
        if value and HAS_CJK.search(value) and len(value) <= 64 and value not in candidates:
            candidates.append(value)
        if len(candidates) >= 2:
            break
    if candidates:
        return "／".join(candidates)
    clauses = [normal_text(item) for item in re.split(r"[，；。;]", meaning_zh) if HAS_CJK.search(normal_text(item))]
    value = clauses[0] if clauses else "按原檔示範答案運用這個慣用語"
    value = re.sub(r"^[A-Za-z][A-Za-z’'\s-]+(?:表示|意思是)\s*", "", value, flags=re.I)
    return value[:72].rstrip("，；。; ")


def source_page_ranges(lines: Sequence[Line], answer_heading: int, order: int) -> dict[str, list[int]]:
    exercise_heading = find_index(
        lines,
        [r"^(?:P\.\d+\s*[—–-]\s*)?Exercise(?:\s+練習)?$"],
        stop=answer_heading,
        last=True,
    )
    if exercise_heading is None:
        raise ValueError("Exercise heading is missing while deriving source page ranges")

    def pages(segment: Sequence[Line]) -> list[int]:
        return sorted({line.page for line in segment if line.text})

    content_pages = pages(lines[:exercise_heading])
    if order == 72:
        # This source is explicitly an exercise/answer-key revision and has no
        # supplied teaching pages.  Its title page is not teaching content.
        content_pages = []
    return {
        "contentPdfPages": content_pages,
        "exercisePdfPages": pages(lines[exercise_heading:answer_heading]),
        "answerKeyPdfPages": pages(lines[answer_heading:]),
    }


def match_tokens(value: str) -> list[str]:
    return [token.casefold().replace("’", "'") for token in MATCH_TOKEN.findall(normal_text(value))]


def physical_page_tokens(lines: Sequence[Line], allowed_pages: Sequence[int]) -> dict[int, list[str]]:
    allowed = set(allowed_pages)
    result = {page: [] for page in sorted(allowed)}
    for line in lines:
        if line.page in allowed and line.text:
            result[line.page].extend(match_tokens(line.text))
    return result


def resolve_physical_pages(
    page_tokens: dict[int, list[str]],
    text: str,
    preferred_page: int,
) -> tuple[int, ...]:
    """Resolve the exact physical page span containing a parsed prompt/answer.

    Number markers occasionally land at the bottom of one PDF page while the
    actual answer begins on the next.  Searching the normalized token stream
    avoids inheriting the marker page and also preserves two-page continuations.
    """
    target = match_tokens(text)
    if not target:
        raise ValueError("Cannot resolve an empty source string")
    allowed = sorted(page_tokens)
    token_stream: list[tuple[str, int]] = []
    for page in allowed:
        token_stream.extend((token, page) for token in page_tokens[page])
    token_values = [token for token, _ in token_stream]
    matches: list[tuple[int, int, int]] = []
    width = len(target)
    for start in range(0, len(token_values) - width + 1):
        if token_values[start : start + width] == target:
            first_page = token_stream[start][1]
            last_page = token_stream[start + width - 1][1]
            matches.append((first_page, last_page, start))
    if not matches:
        raise ValueError(f"Source text does not occur on the declared physical page range: {text[:120]!r}")
    first_page, last_page, _ = min(
        matches,
        key=lambda match: (abs(match[0] - preferred_page), match[1] - match[0], match[2]),
    )
    pages = tuple(page for page in allowed if first_page <= page <= last_page)
    if not pages:
        raise ValueError("Resolved an empty physical page span")
    return pages


def parse_target(lines: Sequence[Line], filename_title: str) -> tuple[str, str]:
    # Do not confuse a page heading such as "P.1 — Target Expression and Core
    # Meaning" with the actual labelled target-expression field.
    target_index = find_index(
        lines,
        [r"^Target Expression\s*(?::\s*.+|目標慣用語)?$"],
    )
    expression = ""
    if target_index is not None:
        inline = re.match(r"^Target Expression\s*:\s*(.+)$", lines[target_index].text, re.I)
        if inline:
            expression = inline.group(1)
        else:
            expression = next((line.text for line in lines[target_index + 1 : target_index + 8] if line.text and not HAS_CJK.search(line.text)), "")
    lexicographic_index = find_index(lines, [r"^Lexicographic Form\b"])
    lexicographic = ""
    if lexicographic_index is not None:
        lexicographic = next((line.text for line in lines[lexicographic_index + 1 : lexicographic_index + 8] if line.text and not HAS_CJK.search(line.text)), "")
    if not expression:
        expression = next((line.text for line in lines[:20] if line.text and not HAS_CJK.search(line.text) and not re.search(r"Expression Class|Revised 50", line.text, re.I)), filename_title)
    expression = normal_text(expression.strip("“”\"「」"))
    lexicographic = normal_text(lexicographic.strip("“”\"「」")) or expression
    return expression, lexicographic


def parse_register(lines: Sequence[Line]) -> dict:
    register = section(
        lines,
        [
            r"^Register(?:\s*(?:,|and)\s*Tone)?(?:\s+and\s+Regional\s+Use)?\b",
            r"(?:Register and )?Tone\s+語域及語氣$",
            r"^Register:\s*",
        ],
        [r"^Fixed and Variable Parts\b", r"^Grammar Frames\b", r"^Core Grammar Bank\b", r"^Important Rules\b"],
    )
    groups = paragraph_groups(register)
    pairs = bilingual_paragraphs(register)
    english_groups = [english for english, _ in pairs]
    chinese_groups = [chinese for _, chinese in pairs]
    english_groups.extend(
        join_lines(line.text for line in group)
        for group in groups
        if not HAS_CJK.search(join_lines(line.text for line in group))
    )
    chinese_groups.extend(
        chinese_part(join_lines(line.text for line in group))
        for group in groups
        if HAS_CJK.search(join_lines(line.text for line in group))
    )
    english_groups = [text for text in english_groups if text]
    chinese_groups = [text for text in chinese_groups if text and substantive_chinese(text)]
    short_pairs = [
        (english, chinese)
        for english, chinese in pairs
        if 1 <= len(english) <= 40
        and 1 <= len(chinese) <= 24
        and not re.search(r"[●•▪◦]|[.!?。！？]$", f"{english}{chinese}")
        and re.search(r"informal|neutral|formal|traditional|literary", english, re.I)
        and re.search(r"非正式|中性|正式|傳統|文學", chinese)
    ]
    label_en = short_pairs[0][0] if short_pairs else ""
    label_zh = short_pairs[0][1] if short_pairs else ""
    if not label_en:
        register_text = " ".join(english_groups).lower()
        has_informal = "informal" in register_text
        has_neutral = "neutral" in register_text
        has_formal = bool(re.search(r"(?<!in)formal", register_text))
        if has_informal and has_neutral:
            label_en, label_zh = "Informal to Neutral", "非正式至中性"
        elif has_formal and has_neutral:
            label_en, label_zh = "Neutral to Formal", "中性至正式"
        elif has_informal:
            label_en, label_zh = "Informal", "非正式"
        elif has_formal:
            label_en, label_zh = "Formal", "正式"
        elif has_neutral:
            label_en, label_zh = "Neutral", "中性"
        else:
            label_en, label_zh = "Source-Guided Register", "按原檔語域使用"
    summary_en = next((text for text in english_groups if len(text) > 40), label_en)
    summary_zh = next((text for text in chinese_groups if len(text) > 15), label_zh)
    formal_en = next((text for text in reversed(english_groups) if re.search(r"formal|safer|alternative", text, re.I)), "Use the idiom only in the contexts described in the source.")
    formal_zh = next((text for text in reversed(chinese_groups) if re.search(r"正式|較為|替代|使用", text)), "只在原檔說明的合適情境中使用這個慣用語。")
    if not substantive_chinese(formal_zh):
        formal_zh = "在正式文體中，應按原檔建議選用較直接而合適的表達。"
    contexts_en: list[str] = []
    contexts_zh: list[str] = []
    for line in register:
        if re.match(r"^[●•▪◦*-]", line.text):
            value = strip_bullet(line.text)
            english_value, chinese_value = split_group_bilingual([Line(value, line.page)])
            if english_value:
                contexts_en.append(english_value.rstrip(";.；"))
            if chinese_value:
                contexts_zh.append(chinese_value.rstrip(";.；"))
    return {
        "labelEn": label_en,
        "labelZh": label_zh,
        "summaryEn": summary_en,
        "summaryZh": summary_zh,
        "contextsEn": contexts_en[:12],
        "contextsZh": contexts_zh[:12],
        "formalEn": formal_en,
        "formalZh": formal_zh,
    }


def strip_unmatched_edge_wrappers(value: object) -> str:
    """Remove source translation openers stranded on displayed examples."""
    text = normal_text(value)
    for opening, closing in (("[", "]"), ("［", "］"), ("(", ")"), ("（", "）")):
        while text.count(opening) > text.count(closing):
            position = text.rfind(opening)
            text = text[len(opening) :].lstrip() if position == 0 else text[:position].rstrip()
    return text


def repair_unmatched_display_delimiters(value: object) -> str:
    """Remove extraction-only delimiter residues without changing words."""
    text = strip_unmatched_edge_wrappers(value)
    for opening, closing in (("(", ")"), ("[", "]"), ("［", "］"), ("（", "）"), ("【", "】"), ("「", "」"), ("“", "”")):
        stack: list[int] = []
        remove: set[int] = set()
        for index, character in enumerate(text):
            if character == opening:
                stack.append(index)
            elif character == closing:
                if stack:
                    stack.pop()
                else:
                    remove.add(index)
        remove.update(stack)
        if remove:
            text = "".join(character for index, character in enumerate(text) if index not in remove)
    if text.count('"') % 2:
        position = text.rfind('"')
        text = f"{text[:position]}{text[position + 1:]}"
    return normal_text(text)


def repair_chinese_example_quotes(value: object) -> str:
    text = normalize_chinese_display_text(value)
    for opening, closing in (("「", "」"), ("“", "”")):
        if text.count(closing) > text.count(opening):
            text = f"{opening}{text}"
        elif text.count(opening) > text.count(closing):
            text = f"{text}{closing}"
    return text


def content_sentences(lines: Sequence[Line], expression: str, limit: int = 4) -> list[dict]:
    examples: list[dict] = []
    groups = paragraph_groups(lines)
    for index, group in enumerate(groups):
        english, chinese = split_group_bilingual(group)
        # Several PDFs place the opening bracket of the Chinese translation at
        # the end of the extracted English line.  It is layout punctuation,
        # not part of the displayed example.
        english = strip_unmatched_edge_wrappers(english)
        explicit_translation = any(
            is_outer_bracketed(line.text)
            or re.search(r"[\[［【（(][^\]］】）)]*[\u3400-\u9fff][^\]］】）)]*[\]］】）)]", line.text)
            for line in group
        )
        if chinese and not explicit_translation:
            chinese = ""
        if (
            not english
            or HAS_CJK.search(english)
            or len(english) > 500
            or "+" in english
            or re.fullmatch(r"(?:Examples?|Common preceding verbs)\s*:?", english, re.I)
        ):
            continue
        highlight, mode = target_highlight(english, expression)
        if mode != "expression" or highlight.casefold() not in english.casefold():
            continue
        if not chinese and index + 1 < len(groups):
            raw_candidate = join_lines(line.text for line in groups[index + 1])
            candidate = chinese_part(raw_candidate)
            # Teaching examples normally mark their translation with full- or
            # half-width brackets.  Without that source signal, do not attach
            # the next explanatory paragraph as a fake translation.
            if HAS_CJK.search(candidate) and is_outer_bracketed(raw_candidate):
                chinese = strip_outer_wrappers(candidate)
        if not chinese or not HAS_CJK.search(chinese) or not substantive_chinese(chinese):
            continue
        chinese = repair_chinese_example_quotes(chinese)
        key = english.casefold()
        if any(item["en"].casefold() == key for item in examples):
            continue
        examples.append({"en": english, "zh": chinese, "highlight": highlight})
        if len(examples) >= limit:
            break
    return examples


def parse_specific_forms(lines: Sequence[Line], expression: str, fallback_example: dict) -> list[dict]:
    grammar_starts = [
        r"^(?:Main\s+)?Grammar Frame(?:s)?(?:\s+and\s+Examples)?\b",
        r"^Core Grammar Bank\b",
        r"^Best Core Grammar Bank\b",
        r"^Grammar Bank\b",
        r"^Grammar and (?:Discourse|Position) (?:Frames?|Bank)\b",
        r"^Formula(?:\(s\)|e|s)?\s*(?:(?:and|\+)\s*(?:all\s+)?(?:Specific\s+Forms?|Example(?:\(s\)|s)?))?\s*$",
    ]
    grammar_ends = [
        r"^Important Rules\b", r"^Benefits\b", r"^Model Example(?:s)?\b",
        r"^History and (?:Origin|Development)\b", r"^Exercise\b",
    ]
    grammar = section(
        lines,
        grammar_starts,
        grammar_ends,
    )
    if not grammar:
        # Some early sources place the grammar patterns directly inside the
        # Fixed/Variable page without a separate Grammar Bank heading.
        grammar = section(
            lines,
            [r"^Fixed and (?:Variable|Optional) Parts\b"],
            grammar_ends,
        )
    starts: list[tuple[int, int, str]] = []
    last_source_number = 0
    for index, line in enumerate(grammar):
        formula = re.match(r"^(?:Formula|Pattern)\s+(\d+)\s*[:：.)-]\s*(.+)$", line.text, re.I)
        numbered = re.match(r"^(\d{1,2})[.)]\s*(.+)$", line.text)
        match = formula or numbered
        if match and last_source_number < int(match.group(1)) <= 20:
            source_number = int(match.group(1))
            starts.append((index, source_number, normal_text(match.group(2))))
            last_source_number = source_number
    forms: list[dict] = []
    for position, (start, source_number, title_en) in enumerate(starts):
        stop = starts[position + 1][0] if position + 1 < len(starts) else len(grammar)
        segment = grammar[start + 1 : stop]
        raw_title_en = title_en
        raw_title_zh = next((chinese_part(line.text) for line in segment[:12] if HAS_CJK.search(line.text) and len(line.text) <= 140), "")
        fallback_title_en = f"Form {len(forms) + 1}"
        title_en = compact_heading(raw_title_en, fallback_title_en, 80)
        title_zh = compact_heading(raw_title_zh, f"句式{ROMAN_ZH.get(len(forms) + 1, len(forms) + 1)}", 30)
        formula = next(
            (
                line.text for line in segment
                if not HAS_CJK.search(line.text)
                and (" + " in line.text or re.search(r"\bSubject\b|\bWho\b|\bBefore\b|\bAfter\b", line.text))
                and len(line.text) <= 240
            ),
            raw_title_en if " + " in raw_title_en else expression,
        )
        examples = content_sentences(segment, expression, 3)
        concise_source_line = next(
            (
                line.text for line in segment
                if not HAS_CJK.search(line.text)
                and 8 <= len(line.text) <= 80
                and not re.match(r"^(?:Formula|Example|Correct|Incorrect|Note)\s*:?$", line.text, re.I)
            ),
            "",
        )
        if title_en == fallback_title_en and concise_source_line:
            title_en = compact_heading(concise_source_line, fallback_title_en, 80)
        if title_en == fallback_title_en and examples:
            # A source formula can be too long for a card heading.  In that
            # case, retain the first concise source example as the specific
            # English heading instead of publishing a generic Form N pair.
            title_en = compact_heading(examples[0]["en"], fallback_title_en, 80)
        pairs = bilingual_paragraphs(segment)
        description_en, description_zh = next(
            (
                (english, chinese)
                for english, chinese in pairs
                if english not in {formula, title_en, raw_title_en}
                and chinese not in {title_zh, raw_title_zh}
                and not HAS_CJK.search(english)
                and not is_description_heading(english)
                and not is_description_heading(chinese)
                and "+" not in english
                and not re.match(r"^(?:Frame|Pattern|Formula)\s+\d+\b", english, re.I)
                and substantive_chinese(chinese)
                and not any(english == item["en"] or chinese == item["zh"] for item in examples)
            ),
            ("", ""),
        )
        if description_en and description_zh:
            if raw_title_en != title_en:
                description_en = normal_text(f"{raw_title_en} {description_en}")
            if raw_title_zh != title_zh and substantive_chinese(raw_title_zh):
                description_zh = normal_text(f"{raw_title_zh} {description_zh}")
        else:
            # Never select the two languages independently.  If the source
            # extraction does not yield one trustworthy bilingual tuple, pair
            # the exact source formula with an explicit Chinese formula label.
            display_formula = formula_display_text(formula)
            description_en = normal_text(f"Source grammar frame: {display_formula}.")
            description_zh = normal_text(f"原檔列出的句法框架：{display_formula}。")
        forms.append({
            "number": len(forms) + 1,
            "titleEn": title_en or f"Form {source_number}",
            "titleZh": title_zh or f"句式{ROMAN_ZH.get(len(forms) + 1, len(forms) + 1)}",
            "formula": formula,
            "descriptionEn": description_en,
            "descriptionZh": description_zh,
            "examples": [
                example for example in examples
                if normal_text(example.get("zh")) not in {normal_text(description_zh), normal_text(title_zh)}
            ] or [fallback_example],
            "notes": [],
        })
    if not forms and grammar:
        source_examples = content_sentences(grammar, expression, 4)
        pairs = bilingual_paragraphs(grammar)
        formula = next(
            (
                line.text for line in grammar
                if not HAS_CJK.search(line.text)
                and (" + " in line.text or re.search(r"\bSubject\b|\bPattern\b", line.text, re.I))
                and len(line.text) <= 300
            ),
            expression,
        )
        description_en, description_zh = next(
            (
                (english, chinese)
                for english, chinese in pairs
                if english != formula
                and not HAS_CJK.search(english)
                and not is_description_heading(english)
                and not is_description_heading(chinese)
                and "+" not in english
                and not re.match(r"^(?:Frame|Pattern|Formula)\s+\d+\b", english, re.I)
                and substantive_chinese(chinese)
                and not any(english == item["en"] or chinese == item["zh"] for item in source_examples)
            ),
            ("", ""),
        )
        if not (description_en and description_zh):
            display_formula = formula_display_text(formula)
            description_en = normal_text(f"Core Grammar Bank. Formula: {display_formula}.")
            description_zh = normal_text(f"核心句式庫。句式：{display_formula}。")
        forms.append({
            "number": 1,
            "titleEn": "Core Grammar Bank",
            "titleZh": "核心句式庫",
            "formula": formula,
            "descriptionEn": description_en,
            "descriptionZh": description_zh,
            "examples": [
                example for example in source_examples
                if normal_text(example.get("zh")) not in {normal_text(description_zh), ""}
            ] or [fallback_example],
            "notes": [],
        })
    if not forms:
        forms.append({
            "number": 1,
            "titleEn": "Source Exercise Pattern",
            "titleZh": "原檔練習句式",
            "formula": expression,
            "descriptionEn": "The source focuses on applying this expression in complete sentences.",
            "descriptionZh": "原檔集中練習在完整句子中運用這個表達。",
            "examples": [fallback_example],
            "notes": [],
        })
    return forms


def parse_numbered_cards(lines: Sequence[Line], expression: str, kind: str) -> list[dict]:
    if kind == "rules":
        body = section(lines, [r"^Important Rules\b"], [r"^Benefits\b", r"^Model Example\b", r"^History and (?:Origin|Development)\b", r"^Exercise\b"])
        explicit_marker = re.compile(r"^Rule\s+(\d{1,2})\s*[.):：-]\s*(.+)$", re.I)
    else:
        body = section(lines, [r"^Benefits\b"], [r"^Important Rules\b", r"^Model Example\b", r"^History and (?:Origin|Development)\b", r"^Exercise\b"])
        explicit_marker = re.compile(r"^Benefit\s+(\d{1,2})\s*[.):：-]\s*(.+)$", re.I)
    bare_marker = re.compile(r"^(\d{1,2})\s*[.):：-]\s*(.+)$", re.I)
    # Numbered examples and bullet lists occur inside many Rule cards.  When
    # explicit Rule/Benefit headings exist, they alone define card boundaries.
    marker = explicit_marker if any(explicit_marker.match(line.text) for line in body) else bare_marker
    starts: list[tuple[int, int, str]] = []
    expected_number = 1
    for index, line in enumerate(body):
        match = marker.match(line.text)
        if match and int(match.group(1)) == expected_number:
            starts.append((index, int(match.group(1)), normal_text(match.group(2))))
            expected_number += 1
    cards: list[dict] = []
    for position, (start, _, title_en) in enumerate(starts):
        stop = starts[position + 1][0] if position + 1 < len(starts) else len(body)
        segment = body[start + 1 : stop]
        groups = paragraph_groups(segment)
        raw_title_en = title_en
        raw_title_zh = next((chinese_part(line.text) for line in segment[:12] if HAS_CJK.search(line.text) and len(line.text) <= 140), "")
        fallback_title_en = f"Rule {len(cards) + 1}" if kind == "rules" else f"Benefit {len(cards) + 1}"
        fallback_title_zh = f"規則{ROMAN_ZH.get(len(cards) + 1, len(cards) + 1)}" if kind == "rules" else f"好處{ROMAN_ZH.get(len(cards) + 1, len(cards) + 1)}"
        title_en = compact_heading(raw_title_en, fallback_title_en, 80)
        title_zh = compact_heading(raw_title_zh, fallback_title_zh, 30)
        examples = content_sentences(segment, expression, 4)
        pairs = bilingual_paragraphs(segment)
        english_groups = [english for english, _ in pairs]
        chinese_groups = [
            chinese for _, chinese in pairs
            if chinese != title_zh and substantive_chinese(chinese)
        ]
        english = " ".join(text for text in english_groups if text not in {title_en} and not any(text == item["en"] for item in examples))
        chinese = " ".join(chinese_groups)
        if raw_title_zh:
            english = normal_text(english.replace(normal_text(raw_title_zh), "", 1))
        if raw_title_en != title_en:
            english = normal_text(f"{raw_title_en} {english}")
        if raw_title_zh != title_zh and substantive_chinese(raw_title_zh):
            chinese = normal_text(f"{raw_title_zh} {chinese}")
        if not english:
            english = normal_text(raw_title_en or title_en)
        if not chinese or not substantive_chinese(chinese):
            chinese = normal_text(raw_title_zh or title_zh)
        source_bullets = [
            strip_bullet(line.text).rstrip(";.；")
            for line in segment
            if re.match(r"^[●•▪◦]", line.text)
            and not HAS_CJK.search(line.text)
        ]
        if source_bullets and re.search(r"\b(?:exact|correct)\b", title_en, re.I):
            english = normal_text(
                f"Correct target: {expression}. Incorrect target forms: "
                f"{'; '.join(source_bullets)}."
            )
        examples = [
            example for example in examples
            if normal_text(example.get("zh")) not in {normal_text(chinese), normal_text(title_zh)}
        ]
        cards.append({
            "number": len(cards) + 1,
            "titleEn": title_en,
            "titleZh": title_zh or (f"規則{ROMAN_ZH.get(len(cards) + 1, len(cards) + 1)}" if kind == "rules" else f"好處{ROMAN_ZH.get(len(cards) + 1, len(cards) + 1)}"),
            "en": normal_text(english),
            "zh": normal_text(chinese),
            "examples": examples,
        })
    return cards


def split_group_bilingual(group: Sequence[Line]) -> tuple[str, str]:
    text = join_lines(line.text for line in group)
    cjk = HAS_CJK.search(text)
    if cjk:
        cjk_count = len(HAS_CJK.findall(text))
        latin_count = len(re.findall(r"[A-Za-z]", text))
        if latin_count > max(60, cjk_count * 3):
            # An English paragraph may legitimately quote a short Chinese
            # term such as 紙老虎; it is still the English half of the pair.
            return text, ""
        if cjk_count > max(8, latin_count // 2) and cjk.start() < max(20, len(text) // 5):
            # A Chinese paragraph may begin with an English name or target
            # expression.  Discard that short prefix and retain the Chinese.
            return "", chinese_part(text)
        return normal_text(text[: cjk.start()]), chinese_part(text)
    return text, ""


def bilingual_paragraphs(lines: Sequence[Line]) -> list[tuple[str, str]]:
    groups = paragraph_groups(lines)
    pairs: list[tuple[str, str]] = []
    index = 0
    while index < len(groups):
        english, chinese = split_group_bilingual(groups[index])
        if english and chinese:
            pairs.append((english, chinese))
            index += 1
            continue
        if english and index + 1 < len(groups):
            next_english, next_chinese = split_group_bilingual(groups[index + 1])
            if next_chinese:
                pairs.append((english, next_chinese))
                index += 2
                continue
        index += 1
    return pairs


def parse_origin(lines: Sequence[Line]) -> dict:
    body = section(lines, [r"^History and (?:Origin|Development)\b"], [r"^Important Rules\b", r"^Benefits\b", r"^Model Example\b", r"^Exercise\b"])
    status_index = find_index(body, [r"^Origin Status\b"])
    original_index = find_index(body, [r"^The Original Image\b"])
    history_index = find_index(
        body,
        [
            r"^(?:The )?Historical (?:Background(?: and Development)?|Record|Development)\b",
            r"^Early Development\b",
            r"^Development of the Modern Meaning\b",
            r"^The Earlier Words\b",
        ],
    )
    meaning_index = find_index(
        body,
        [
            r"^How (?:the Meaning|the Expression) Developed\b",
            r"^Meaning Development\b",
            r"^What It Means Today\b",
            r"^What Is Still Unknown\b",
        ],
    )
    memory_index = find_index(body, [r"^Memory Link\b"])

    def pair(start: int | None, stop_candidates: Sequence[int | None]) -> tuple[str, str]:
        if start is None:
            return "", ""
        stops = [value for value in stop_candidates if value is not None and value > start]
        stop = min(stops) if stops else len(body)
        pairs = bilingual_paragraphs(body[start + 1 : stop])
        return pairs[0] if pairs else ("", "")

    status_en, status_zh = pair(status_index, [original_index, history_index, meaning_index, memory_index])
    history: list[dict] = []
    background_en, background_zh = pair(history_index, [meaning_index, memory_index])
    background_en = remove_rejected_section_sentences(background_en)
    background_zh = remove_rejected_section_sentences(background_zh)
    if background_en or background_zh:
        history.append({
            "titleEn": "The Historical Background",
            "titleZh": "歷史背景",
            "en": background_en or "The source provides this historical background.",
            "zh": background_zh or "原檔提供了這段歷史背景。",
        })
    developed_en, developed_zh = pair(meaning_index, [memory_index])
    developed_en = remove_rejected_section_sentences(developed_en)
    developed_zh = remove_rejected_section_sentences(developed_zh)
    if developed_en or developed_zh:
        history.append({
            "titleEn": "How the Meaning Developed",
            "titleZh": "意思如何演變",
            "en": developed_en or "The source explains how the meaning developed.",
            "zh": developed_zh or "原檔說明了這個意思的演變。",
        })
    memory_en, memory_zh = pair(memory_index, [])
    if not history:
        # Use the supplied bilingual history prose even when it has no standard
        # subheading.  Explicit literal-picture material remains excluded.
        narrative = list(body)
        if original_index is not None:
            following = [
                value for value in (history_index, meaning_index, memory_index)
                if value is not None and value > original_index
            ]
            original_stop = min(following) if following else len(narrative)
            narrative = narrative[:original_index] + narrative[original_stop:]
        heading_noise = re.compile(
            r"^(?:Origin Status|The Original Image|The Literal Picture|Memory Link|"
            r"History and (?:Origin|Development)|歷史及(?:來源|演變)|來源可信度|原來的畫面|字面畫面)\b",
            re.I,
        )
        narrative = [line for line in narrative if not heading_noise.search(line.text)]
        for paragraph_en, paragraph_zh in bilingual_paragraphs(narrative)[:3]:
            history.append({
                "titleEn": "History and Development",
                "titleZh": "歷史及演變",
                "en": paragraph_en,
                "zh": paragraph_zh,
            })
        if not history and (status_en or status_zh):
            history.append({
                "titleEn": "Origin Status",
                "titleZh": "來源可信度",
                "en": status_en or "The exact origin is not stated as certain in the source.",
                "zh": status_zh or "原檔沒有把確切來源列為已證實資料。",
            })
    return {
        "statusEn": status_en or "No separate origin status supplied",
        "statusZh": status_zh or "原檔沒有另列來源可信度",
        "history": history,
        "memoryEn": memory_en or "Use the source meaning and examples as the memory link.",
        "memoryZh": memory_zh or "以原檔的核心意思及例句作為記憶提示。",
    }


def parse_instructions(lines: Sequence[Line], answer_heading: int) -> dict:
    exercise = section(
        lines[:answer_heading],
        [r"^(?:P\.\d+\s*[—–-]\s*)?Exercise(?:\s+練習)?$"],
        [r"^Questions?\s+1\s*[–—-]\s*(?:10|50)\b"],
    )
    pairs = bilingual_paragraphs(exercise)
    english = next((candidate for candidate, _ in pairs if len(candidate) > 20), "Rewrite or respond using the target idiom.")
    chinese = next((candidate for _, candidate in pairs if len(candidate) > 8), "使用目標慣用語改寫句子或完成回應。")
    return {"en": english, "zh": chinese}


def is_outer_bracketed(value: str) -> bool:
    text = normal_text(value)
    return any(
        text.startswith(opening) and text.endswith(closing)
        for opening, closing in (("(", ")"), ("（", "）"), ("[", "]"), ("［", "］"), ("【", "】"))
    )


def has_unbalanced_display_delimiters(value: object) -> bool:
    text = str(value or "")
    for opening, closing in (("(", ")"), ("[", "]"), ("［", "］"), ("【", "】"), ("「", "」"), ("“", "”")):
        depth = 0
        for character in text:
            if character == opening:
                depth += 1
            elif character == closing:
                depth -= 1
                if depth < 0:
                    return True
        if depth:
            return True
    return text.count('"') % 2 == 1


def validate_lesson(lesson: dict, highlight_modes: dict[str, int]) -> None:
    """Enforce the reviewed Idiom publishing contract at import time."""
    order = lesson["order"]
    # Keep the required full-width Chinese punctuation intact here.  The
    # general normalizer uses NFKC and would turn ／，；： back into ASCII.
    title_zh = re.sub(r"\s+", " ", str(lesson.get("titleZh") or "")).strip()
    if not title_zh or not HAS_CJK.search(title_zh) or len(title_zh) > 24:
        raise ValueError(f"Lesson {order} has a non-concise Chinese title: {title_zh!r}")
    if re.search(r"Cambridge|Oxford|defines?|classif", title_zh, re.I):
        raise ValueError(f"Lesson {order} Chinese title contains source-definition prose")
    if "按原檔示範答案" in title_zh or re.search(r"[:：]", title_zh):
        raise ValueError(f"Lesson {order} Chinese title contains a generic label or colon")
    if re.search(r"[，。；;,;]$", title_zh):
        raise ValueError(f"Lesson {order} Chinese title is a sentence fragment rather than a card label")
    if re.search(r"[/,;:]", title_zh):
        raise ValueError(f"Lesson {order} Chinese title uses ASCII punctuation: {title_zh!r}")

    source = lesson.get("source", {})
    expected_page_keys = {"contentPdfPages", "exercisePdfPages", "answerKeyPdfPages"}
    if not expected_page_keys.issubset(source):
        raise ValueError(f"Lesson {order} source provenance does not split teaching, exercise and answer pages")
    page_count = source.get("pageCount", 0)
    for key in expected_page_keys:
        pages = source[key]
        if pages != sorted(set(pages)) or any(not 1 <= page <= page_count for page in pages):
            raise ValueError(f"Lesson {order} has invalid {key}")
    if order == 72:
        if source["contentPdfPages"]:
            raise ValueError("Lesson 72 must explicitly record that no teaching pages were supplied")
    elif not source["contentPdfPages"]:
        raise ValueError(f"Lesson {order} unexpectedly has no teaching pages")
    if not source["exercisePdfPages"] or not source["answerKeyPdfPages"]:
        raise ValueError(f"Lesson {order} has incomplete exercise/answer provenance")

    if highlight_modes != {"expression": 50}:
        raise ValueError(f"Lesson {order} did not obtain 50 exact idiom-phrase highlights: {highlight_modes}")
    questions = lesson.get("questions", [])
    if len(questions) != 50:
        raise ValueError(f"Lesson {order} must publish exactly 50 questions")
    for question in questions:
        source_pages = question.get("sourcePages", [])
        answer_pages = question.get("answerSourcePages", [])
        if (
            not source_pages
            or question.get("sourcePage") != source_pages[0]
            or not set(source_pages).issubset(source["exercisePdfPages"])
            or not answer_pages
            or question.get("answerSourcePage") != answer_pages[0]
            or not set(answer_pages).issubset(source["answerKeyPdfPages"])
        ):
            raise ValueError(f"Lesson {order} question {question['number']} has invalid physical-page evidence")
        for key in ("promptZh", "answerZh"):
            if is_outer_bracketed(question.get(key, "")):
                raise ValueError(f"Lesson {order} question {question['number']} retains bracket-wrapped {key}")
        for key in ("prompt", "promptZh", "starter", "answer", "answerZh"):
            if re.search(r"Answers?\s+\d+\s*[–—-]\s*\d+|Band\s+\d+\s*[—–-]|:::?\s*This edition deliberately", normal_text(question.get(key)), re.I):
                raise ValueError(f"Lesson {order} question {question['number']} contains a structural answer heading in {key}")

    serialized = json.dumps(lesson, ensure_ascii=False)
    if order != 72 and GENERIC_FALLBACK_COPY.search(serialized):
        fallbacks = sorted(set(GENERIC_FALLBACK_COPY.findall(serialized)))
        raise ValueError(
            f"Lesson {order} published generic fallback teaching copy despite having teaching pages: {fallbacks}"
        )

    if not lesson.get("examples"):
        raise ValueError(f"Lesson {order} has no bilingual model example")

    register = lesson.get("register", {})
    for key, maximum in (("labelEn", 60), ("labelZh", 24)):
        label = normal_text(register.get(key))
        if not label or len(label) > maximum or re.search(r"[●•▪◦]|[.!?。！？]$", label):
            raise ValueError(f"Lesson {order} has an oversized or prose register heading in {key}: {label!r}")

    for form in lesson.get("specificForms", []):
        if len(normal_text(form.get("titleEn"))) > 80 or len(normal_text(form.get("titleZh"))) > 30:
            raise ValueError(f"Lesson {order} has an oversized specific-form heading")
        if re.search(r"[●•▪◦]|[.!?。！？]$", f"{form.get('titleEn', '')}{form.get('titleZh', '')}"):
            raise ValueError(f"Lesson {order} has prose or bullets in a specific-form heading")
        if not normal_text(form.get("descriptionEn")) or not normal_text(form.get("descriptionZh")):
            raise ValueError(f"Lesson {order} has an incomplete bilingual specific-form explanation")
        if is_description_heading(form.get("descriptionEn")) or is_description_heading(form.get("descriptionZh")):
            raise ValueError(f"Lesson {order} leaks a section heading into a specific-form description")
        if (
            "+" in normal_text(form.get("descriptionEn"))
            or re.match(r"^(?:Frame|Pattern|Formula)\s+\d+\b", normal_text(form.get("descriptionEn")), re.I)
        ) and not re.search(r"原檔列出的句法框架|核心句式庫.*句式", normal_text(form.get("descriptionZh"))):
            raise ValueError(f"Lesson {order} has a formula description paired with unrelated Chinese prose")
        if re.fullmatch(r"Form\s+\d+", normal_text(form.get("titleEn")), re.I) and re.fullmatch(
            r"句式(?:[一二三四五六七八九十]+|\d+)", normal_text(form.get("titleZh"))
        ):
            raise ValueError(f"Lesson {order} has a generic English/Chinese specific-form heading pair")
    for section_name in ("benefits", "rules"):
        cards = lesson.get(section_name, [])
        if not cards:
            raise ValueError(f"Lesson {order} has no {section_name} cards")
        for card in cards:
            if len(normal_text(card.get("titleEn"))) > 80 or len(normal_text(card.get("titleZh"))) > 30:
                raise ValueError(f"Lesson {order} has an oversized {section_name} heading")
            if re.search(r"[●•▪◦]|[.!?。！？]$", f"{card.get('titleEn', '')}{card.get('titleZh', '')}"):
                raise ValueError(f"Lesson {order} has prose or bullets in a {section_name} heading")
            if not normal_text(card.get("en")) or not normal_text(card.get("zh")):
                raise ValueError(f"Lesson {order} has an incomplete bilingual {section_name} card")
            generic_en = r"Rule\s+\d+" if section_name == "rules" else r"Benefit\s+\d+"
            generic_zh = r"規則(?:[一二三四五六七八九十]+|\d+)" if section_name == "rules" else r"好處(?:[一二三四五六七八九十]+|\d+)"
            if re.fullmatch(generic_en, normal_text(card.get("titleEn")), re.I) and re.fullmatch(
                generic_zh, normal_text(card.get("titleZh"))
            ):
                raise ValueError(f"Lesson {order} has a generic English/Chinese {section_name} heading pair")
    for history in lesson.get("origin", {}).get("history", []):
        if not normal_text(history.get("en")) or not normal_text(history.get("zh")):
            raise ValueError(f"Lesson {order} has an incomplete bilingual origin card")

    def check_examples(value: object, location: str = "lesson") -> None:
        if isinstance(value, dict):
            parent_chinese = {
                normal_text(value.get(key))
                for key in ("zh", "descriptionZh")
                if normal_text(value.get(key))
            }
            for key, child in value.items():
                if key == "examples" and isinstance(child, list):
                    for index, example in enumerate(child, 1):
                        if not isinstance(example, dict) or not normal_text(example.get("en")):
                            raise ValueError(f"Lesson {order} has an invalid example at {location}.{key}[{index}]")
                        if re.search(r"[\[［]\s*$", str(example.get("en") or "")) or has_unbalanced_display_delimiters(example.get("en")):
                            raise ValueError(f"Lesson {order} has an unmatched wrapper in an English example at {location}.{key}[{index}]")
                        zh = normal_text(example.get("zh"))
                        if not zh or not HAS_CJK.search(zh):
                            raise ValueError(f"Lesson {order} has an English-only example at {location}.{key}[{index}]")
                        if is_outer_bracketed(zh):
                            raise ValueError(f"Lesson {order} retains a bracket-wrapped example translation")
                        if has_unbalanced_display_delimiters(example.get("zh")):
                            raise ValueError(f"Lesson {order} has an unmatched wrapper in a Chinese example at {location}.{key}[{index}]")
                        if zh in parent_chinese:
                            raise ValueError(
                                f"Lesson {order} example at {location}.{key}[{index}] reuses its parent explanation as a false translation"
                            )
                check_examples(child, f"{location}.{key}")
        elif isinstance(value, list):
            for index, child in enumerate(value):
                check_examples(child, f"{location}[{index}]")

    check_examples(lesson)

    def check_chinese(value: object, location: str = "lesson", chinese_context: bool = False) -> None:
        if isinstance(value, dict):
            for key, child in value.items():
                is_chinese = key == "zh" or key.lower().endswith("zh")
                check_chinese(child, f"{location}.{key}", is_chinese)
            return
        if isinstance(value, list):
            for index, child in enumerate(value):
                check_chinese(child, f"{location}[{index}]", chinese_context)
            return
        if not chinese_context or not isinstance(value, str) or not normal_text(value):
            return
        raw_text = str(value)
        text = normal_text(value)
        if re.search(r"(?<=[\u3400-\u9fff])\s+(?=[\u3400-\u9fff])", raw_text):
            raise ValueError(f"Lesson {order} retains a CJK line-wrap space at {location}: {raw_text[:140]!r}")
        if re.search(r"(?<=[\u3400-\u9fff])[.,;:?!]|[.,;:?!](?=[\u3400-\u9fff])", raw_text):
            raise ValueError(f"Lesson {order} retains ASCII punctuation beside Chinese at {location}: {raw_text[:140]!r}")
        if re.search(r"(?:[;；]\s*){2,}|([，。；：！？、])\1+|^[;；]|。[;；]", raw_text):
            raise ValueError(f"Lesson {order} retains repeated or leading Chinese punctuation at {location}: {raw_text[:140]!r}")
        if re.search(r"(?<=[\u3400-\u9fff])。?\s*\.{3,}\s*。?", raw_text):
            raise ValueError(f"Lesson {order} retains an ASCII-dot ellipsis in Chinese copy at {location}: {raw_text[:140]!r}")
        if re.search(r"[●•▪◦]", raw_text):
            raise ValueError(f"Lesson {order} retains a raw PDF bullet at {location}: {raw_text[:140]!r}")
        if text.startswith(("的", "和 ")):
            raise ValueError(f"Lesson {order} has a dangling Chinese translation at {location}: {text[:140]!r}")
        if not substantive_chinese(text):
            raise ValueError(
                f"Lesson {order} has English-dominated or non-Chinese copy at {location}: {text[:140]!r}"
            )

    check_chinese(lesson)

    def check_deduped_teaching_field(value: object, location: str) -> None:
        text = str(value or "").strip()
        if not text:
            return
        seen: set[str] = set()
        for clause in (part.strip() for part in re.split(r"(?<=[。！？!?；;])", text)):
            key = chinese_clause_key(clause)
            if len(key) < 6:
                continue
            if key in seen:
                raise ValueError(f"Lesson {order} repeats a Chinese teaching clause at {location}: {clause[:140]!r}")
            seen.add(key)
        if re.search(r"(?:Rule|Benefit|Formula)\s+\d+\s*[:：]", text, re.I):
            raise ValueError(f"Lesson {order} retains a structural English body marker at {location}")

    def check_english_teaching_field(value: object, location: str) -> None:
        text = str(value or "").strip()
        if re.search(r"(?:Rule|Benefit|Formula)\s+\d+\s*[:：]", text, re.I):
            raise ValueError(f"Lesson {order} retains a structural English body marker at {location}")
        if re.match(r"^(?:規則|好處|句式)[一二三四五六七八九十\d]+\s*[:：]", text):
            raise ValueError(f"Lesson {order} retains a Chinese heading in an English body at {location}")

    register = lesson.get("register", {})
    check_english_teaching_field(register.get("summaryEn"), "register.summaryEn")
    check_english_teaching_field(register.get("formalEn"), "register.formalEn")
    check_deduped_teaching_field(register.get("summaryZh"), "register.summaryZh")
    check_deduped_teaching_field(register.get("formalZh"), "register.formalZh")
    check_english_teaching_field(lesson.get("instructions", {}).get("en"), "instructions.en")
    check_deduped_teaching_field(lesson.get("instructions", {}).get("zh"), "instructions.zh")
    for index, form in enumerate(lesson.get("specificForms", [])):
        check_english_teaching_field(form.get("descriptionEn"), f"specificForms[{index}].descriptionEn")
        check_deduped_teaching_field(form.get("descriptionZh"), f"specificForms[{index}].descriptionZh")
    for section_name in ("benefits", "rules"):
        for index, card in enumerate(lesson.get(section_name, [])):
            check_english_teaching_field(card.get("en"), f"{section_name}[{index}].en")
            check_deduped_teaching_field(card.get("zh"), f"{section_name}[{index}].zh")
    for index, card in enumerate(lesson.get("origin", {}).get("history", [])):
        check_english_teaching_field(card.get("en"), f"origin.history[{index}].en")
        check_deduped_teaching_field(card.get("zh"), f"origin.history[{index}].zh")

    def check_teaching_delimiters(value: object, location: str = "lesson") -> None:
        if isinstance(value, list):
            for index, child in enumerate(value):
                check_teaching_delimiters(child, f"{location}[{index}]")
            return
        if isinstance(value, dict):
            for key, child in value.items():
                if key != "questions":
                    check_teaching_delimiters(child, f"{location}.{key}")
            return
        if isinstance(value, str):
            if has_unbalanced_display_delimiters(value):
                raise ValueError(f"Lesson {order} has unmatched teaching delimiters at {location}: {value[:140]!r}")
            if re.search(r"[●•▪◦]", value):
                raise ValueError(f"Lesson {order} retains a raw PDF teaching bullet at {location}")

    check_teaching_delimiters(lesson)


def lesson_from_source(path: Path) -> tuple[dict, dict]:
    order, filename_title = source_metadata(path)
    lines, page_count = extract_lines(path)
    answer_heading = find_index(lines, [r"^Answer Key(?:\s+參考答案)?$"], last=True)
    if answer_heading is None:
        raise ValueError("Answer Key heading is missing")
    questions = parse_questions(lines, answer_heading)
    answers = parse_answers(lines, answer_heading)
    if [item.number for item in questions] != [item.number for item in answers]:
        raise ValueError("Exercise and answer inventories do not match")

    expression, lexicographic = parse_target(lines, filename_title)
    meaning, natural_zh = concise_core(lines)
    if not meaning["en"]:
        meaning["en"] = f"the meaning and usage of the expression {expression}, as demonstrated by the supplied model answers"
    if not meaning["zh"]:
        meaning["zh"] = "按原檔示範答案所顯示的意思及用法，運用這個目標慣用語"
    title_zh = TITLE_ZH_OVERRIDES.get(order, concise_title_zh(natural_zh, meaning["zh"]))
    page_ranges = source_page_ranges(lines, answer_heading, order)
    exercise_page_tokens = physical_page_tokens(lines, page_ranges["exercisePdfPages"])
    answer_page_tokens = physical_page_tokens(lines, page_ranges["answerKeyPdfPages"])
    for question in questions:
        question.pages = resolve_physical_pages(exercise_page_tokens, question.english, question.page)
        question.page = question.pages[0]
    for answer in answers:
        answer.pages = resolve_physical_pages(answer_page_tokens, answer.english, answer.page)
        answer.page = answer.pages[0]

    question_rows: list[dict] = []
    fallback_modes: dict[str, int] = {}
    for prompt, answer in zip(questions, answers, strict=True):
        highlight, mode = target_highlight(answer.english, lexicographic, prompt.english)
        fallback_modes[mode] = fallback_modes.get(mode, 0) + 1
        if mode != "expression":
            raise ValueError(f"Question {prompt.number} required unsafe highlight fallback {mode!r}")
        if not highlight or highlight.casefold() not in answer.english.casefold():
            raise ValueError(f"Question {prompt.number} has no exact answer highlight")
        question_rows.append({
            "id": f"idiom-{order:02d}-q{prompt.number:02d}",
            "number": prompt.number,
            "sourcePage": prompt.page,
            "sourcePages": list(prompt.pages),
            "answerSourcePage": answer.page,
            "answerSourcePages": list(answer.pages),
            "prompt": prompt.english,
            "promptZh": prompt.chinese,
            "starter": prompt.starter,
            "answer": answer.english,
            "answerZh": answer.chinese,
            "targetForm": lexicographic,
            "targetMeaning": meaning["en"],
            "highlight": highlight,
        })

    fallback_example = {"en": question_rows[0]["answer"], "zh": question_rows[0]["answerZh"], "highlight": question_rows[0]["highlight"]}
    specific_forms = parse_specific_forms(lines, lexicographic, fallback_example)
    examples = []
    for form in specific_forms:
        for example in form["examples"]:
            if example["en"] and not any(existing["en"] == example["en"] for existing in examples):
                examples.append(example)
            if len(examples) >= 2:
                break
        if len(examples) >= 2:
            break
    if not examples:
        examples = [fallback_example]

    rules = parse_numbered_cards(lines, lexicographic, "rules")
    benefits = parse_numbered_cards(lines, lexicographic, "benefits")
    omissions: list[str] = [
        "The owner-rejected communication-purpose block was intentionally omitted under the approved Idiom formatting contract.",
        "The owner-rejected literal-picture block was intentionally omitted under the approved Idiom formatting contract.",
        "Extended dictionary/source commentary after the concise Core Meaning was intentionally omitted.",
    ]
    if order == 72:
        omissions.append("The supplied PDF contains only revised exercise material and an answer key; missing learning-page fields are explicitly marked as source-coverage notes.")
    if not rules:
        rules = [{
            "number": 1,
            "titleEn": "Follow the Source Exercise Meaning",
            "titleZh": "按照原檔練習意思運用",
            "en": "Preserve the actor, tense, certainty and important context shown in the source.",
            "zh": "保留原檔題目中的行動者、時態、確定程度及重要情境。",
            "examples": [fallback_example],
        }]
        omissions.append("No separate Important Rules section was supplied; the source exercise instruction is retained as the rule.")
    if not benefits:
        benefits = [{
            "number": 1,
            "titleEn": "Concise Idiomatic Expression",
            "titleZh": "簡潔地運用慣用語",
            "en": "The source exercises show how the idiom can replace a longer literal explanation.",
            "zh": "原檔練習展示如何以慣用語取代較長的字面解釋。",
            "examples": [fallback_example],
        }]
        omissions.append("No separate Benefits section was supplied; the benefit is conservatively derived from the rewrite exercise.")

    register = parse_register(lines)
    fixed_forms = []
    for form in specific_forms:
        example = form["examples"][0]
        fixed_forms.append({"form": form["formula"], "example": example["en"], "highlight": example["highlight"]})
    lesson = {
        "id": f"idiom-{order:02d}",
        "order": order,
        "slug": slugify(expression),
        "version": "1",
        "title": title_zh,
        "titleEn": expression.title() if expression.isupper() else expression,
        "titleZh": title_zh,
        "source": {
            "file": path.name,
            "pageCount": page_count,
            **page_ranges,
            "omissions": omissions,
        },
        "formulas": [{"labelEn": "Core Idiom", "labelZh": "核心慣用語", "formula": lexicographic, "highlight": lexicographic}],
        "examples": examples,
        "meaning": meaning,
        "register": register,
        "fixedVariable": {
            "fixed": lexicographic,
            "fixedEn": "Keep the fixed words and word order shown in the source expression.",
            "fixedZh": "保留原檔目標表達中的固定字詞及字序。",
            "variableEn": "Change only the verb form, possessive, tense or surrounding grammar permitted by the source patterns.",
            "variableZh": "只按照原檔句式改變動詞形式、所有格、時態或前後文法。",
            "forms": fixed_forms,
        },
        "specificForms": specific_forms,
        "benefits": benefits,
        "origin": parse_origin(lines),
        "rules": rules,
        "instructions": parse_instructions(lines, answer_heading),
        "questions": question_rows,
    }
    repair_known_source_artifacts(lesson, order)
    lesson = sanitize_published_copy(lesson)
    lesson = normalize_chinese_display_fields(lesson)
    lesson = normalize_teaching_display_fields(lesson)
    dedupe_lesson_teaching_chinese(lesson)
    enforce_atomic_form_descriptions(lesson)
    remove_false_parent_examples(lesson)
    lesson["titleZh"] = normalize_chinese_display_punctuation(lesson["titleZh"])
    lesson["title"] = lesson["titleZh"]
    for card_key in ("benefits", "rules"):
        lesson[card_key] = [
            card for card in lesson[card_key]
            if normal_text(card.get("en")) and normal_text(card.get("zh"))
        ]
    lesson["origin"]["history"] = [
        card for card in lesson["origin"]["history"]
        if normal_text(card.get("en")) and normal_text(card.get("zh"))
    ]
    if not lesson["origin"]["history"]:
        lesson["origin"]["history"] = [{
            "titleEn": "Origin Status",
            "titleZh": "來源可信度",
            "en": lesson["origin"]["statusEn"],
            "zh": lesson["origin"]["statusZh"],
        }]
    validate_lesson(lesson, fallback_modes)
    serialized = json.dumps(lesson, ensure_ascii=False)
    rejected = re.search(
        r"The Original Image|The Literal Picture|原來的畫面|字面畫面|"
        r"Communicative Function|Communication Purpose|溝通功能|溝通用途",
        serialized,
        re.I,
    )
    if rejected:
        context = serialized[max(0, rejected.start() - 80) : rejected.end() + 80]
        raise ValueError(f"A rejected Idiom section leaked into the lesson near {context!r}")
    if re.search(r"\bMia\b|米婭", serialized):
        raise ValueError("A disallowed student name leaked into the lesson")
    manifest = {
        "order": order,
        "lessonId": lesson["id"],
        "titleEn": lesson["titleEn"],
        "titleZh": lesson["titleZh"],
        "sourceFile": path.name,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "pageCount": page_count,
        "questionCount": len(question_rows),
        "highlightModes": fallback_modes,
        "physicalPageMatchCount": len(question_rows) * 2,
        "contentPages": lesson["source"]["contentPdfPages"],
        "exercisePages": lesson["source"]["exercisePdfPages"],
        "answerKeyPages": lesson["source"]["answerKeyPdfPages"],
        "omissions": omissions,
    }
    return lesson, manifest


def source_files(source_directory: Path) -> list[Path]:
    selected: list[tuple[int, Path]] = []
    for path in source_directory.glob("*.pdf"):
        match = SOURCE_NAME.match(path.name)
        if match and 26 <= int(match.group("number")) <= 138:
            selected.append((int(match.group("number")), path))
    selected.sort(key=lambda item: item[0])
    numbers = [number for number, _ in selected]
    if numbers != list(range(26, 139)):
        missing = sorted(set(range(26, 139)) - set(numbers))
        duplicates = sorted(number for number in set(numbers) if numbers.count(number) > 1)
        raise ValueError(f"Expected Idiom sources 26-138; missing={missing}, duplicates={duplicates}")
    return [path for _, path in selected]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-directory", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--audit", action="store_true")
    args = parser.parse_args()
    lessons: list[dict] = []
    manifest_rows: list[dict] = []
    failures: list[str] = []
    for path in source_files(args.source_directory):
        try:
            lesson, manifest = lesson_from_source(path)
            lessons.append(lesson)
            manifest_rows.append(manifest)
            print(f"{lesson['id']}: {lesson['titleEn']} ({len(lesson['questions'])} questions)")
        except Exception as error:  # noqa: BLE001 - batch audit must report every source failure.
            failures.append(f"{path.name}: {error}")
            print(f"ERROR {path.name}: {error}", file=sys.stderr)
    if failures:
        print(f"\n{len(failures)} source(s) failed:\n" + "\n".join(failures), file=sys.stderr)
        return 1
    total_questions = sum(len(lesson["questions"]) for lesson in lessons)
    if len(lessons) != 113 or total_questions != 5650:
        raise ValueError(f"Expected 113 lessons and 5,650 questions; found {len(lessons)} and {total_questions}")
    if args.audit:
        print(json.dumps({"files": len(lessons), "questions": total_questions, "orders": [26, 138]}, ensure_ascii=False))
        return 0
    LESSON_DIRECTORY.mkdir(parents=True, exist_ok=True)
    destinations = {
        LESSON_DIRECTORY / f"lesson-{lesson['order']:03d}-{lesson['slug']}.json"
        for lesson in lessons
    }
    # Slug corrections must not leave a second fragment for the same lesson.
    # This directory contains only generated Idiom 26–138 fragments.
    for existing in LESSON_DIRECTORY.glob("lesson-*.json"):
        if existing not in destinations:
            existing.unlink()
    for lesson in lessons:
        destination = LESSON_DIRECTORY / f"lesson-{lesson['order']:03d}-{lesson['slug']}.json"
        destination.write_text(json.dumps({"lesson": lesson}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    manifest = {
        "version": 1,
        "system": "idiom",
        "sourceDirectory": args.source_directory.name,
        "firstImportedOrder": 26,
        "lastImportedOrder": 138,
        "fileCount": len(lessons),
        "questionCount": total_questions,
        "sources": manifest_rows,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(lessons)} lesson fragments, {total_questions} questions and {MANIFEST_PATH.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
