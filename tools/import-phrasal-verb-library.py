#!/usr/bin/env python3
"""Import the supplied bilingual Phrasal Verb library into reviewed lesson fragments.

The source library uses one stable teaching layout across PDF, DOCX and Markdown
files: metadata, rules, a reference bank, benefits, rewrite exercises and a
model-answer key.  This importer deliberately derives every published prompt,
translation and answer from those source sections instead of asking an LLM to
recreate them.

Run with ``--audit`` first.  A normal run writes only lessons whose exercise and
answer-key inventories reconcile exactly; source files with a genuinely missing
answer key must be supplied through the checked-in override file.
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

import pdfplumber
from docx import Document
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from docx.table import Table
from docx.text.paragraph import Paragraph


SOURCE_NAME = re.compile(
    r"^Phrasal Verbs?\s+(?P<number>\d+)\s*-\s*(?P<title>.+?)\.(?P<extension>pdf|docx|md)$",
    re.IGNORECASE,
)
NUMBERED_LINE = re.compile(r"^(?P<number>\d+)(?:\.\s*(?P<rest>.*))?$")
PAGE_FOOTER = re.compile(r"^Page\s+\d+$", re.IGNORECASE)
ANSWER_BLANK = re.compile(r"^Answer:\s*(?P<starter>.*?)_{3,}\s*$", re.IGNORECASE)
TARGET_LINE = re.compile(r"^(?:Phrasal verb|Expression):\s*(?P<target>.*)$", re.IGNORECASE)
HAS_CJK = re.compile(r"[\u3400-\u9fff]")
TOKEN = re.compile(r"[\w]+(?:['’][\w]+)*|[^\w\s]", re.UNICODE)

BAND_HEADINGS = {
    "Clear Meanings 基本意思": (1, "基本意思", "Clear Meanings"),
    "Common Sentence Forms 常見句式": (2, "常見句式", "Common Sentence Forms"),
    "Full-Sentence Practice 完整句子運用": (3, "完整句子運用", "Full-Sentence Practice"),
    "Similar Meanings and New Situations 相近意思與不同情境": (4, "相近意思與不同情境", "Similar Meanings and New Situations"),
    "Full Practice 綜合運用": (5, "綜合運用", "Full Practice"),
}

RULE_HEADINGS = {
    "Important Rules 重要規則",
    "Important Rules  重要規則",
}
REFERENCE_HEADINGS = {
    "Phrasal-Verb Reference Bank",
    "Phrasal-Verb Reference Bank 片語動詞參考",
    "Phrasal-Verb Reference Bank 片語動詞參考表",
    "Phrasal-Verb Reference Bank  片語動詞參考表",
    "Expression Reference Bank 表達參考表",
}
BENEFIT_HEADINGS = {
    "Benefits 片語動詞好處",
    "Benefits  片語動詞好處",
    "Benefits 好處",
}
EXERCISE_HEADINGS = {
    "Exercise 練習",
    "Exercise  練習",
}
ANSWER_KEY_HEADINGS = {
    "Answer Key",
    "Answer Key 參考答案",
}

IGNORED_EXACT = {
    "Answer Key 參考答案",
    "Exercise 練習",
    "Phrasal-Verb Reference Bank 片語動詞參考表",
    "Benefits 片語動詞好處",
    "Important Rules 重要規則",
    "Learning Objective 學習目標",
    "End of exercise 練習完",
}

IRREGULAR_FORMS = {
    "be": {"am", "is", "are", "was", "were", "been", "being"},
    "bear": {"bears", "bore", "borne", "bearing"},
    "beat": {"beats", "beat", "beaten", "beating"},
    "bite": {"bites", "bit", "bitten", "biting"},
    "blow": {"blows", "blew", "blown", "blowing"},
    "break": {"breaks", "broke", "broken", "breaking"},
    "bring": {"brings", "brought", "bringing"},
    "build": {"builds", "built", "building"},
    "burn": {"burns", "burned", "burnt", "burning"},
    "buy": {"buys", "bought", "buying"},
    "catch": {"catches", "caught", "catching"},
    "come": {"comes", "came", "coming"},
    "deal": {"deals", "dealt", "dealing"},
    "dig": {"digs", "dug", "digging"},
    "do": {"does", "did", "done", "doing"},
    "draw": {"draws", "drew", "drawn", "drawing"},
    "drink": {"drinks", "drank", "drunk", "drinking"},
    "drive": {"drives", "drove", "driven", "driving"},
    "eat": {"eats", "ate", "eaten", "eating"},
    "fall": {"falls", "fell", "fallen", "falling"},
    "feed": {"feeds", "fed", "feeding"},
    "feel": {"feels", "felt", "feeling"},
    "fight": {"fights", "fought", "fighting"},
    "find": {"finds", "found", "finding"},
    "fling": {"flings", "flung", "flinging"},
    "fly": {"flies", "flew", "flown", "flying"},
    "freeze": {"freezes", "froze", "frozen", "freezing"},
    "get": {"gets", "got", "gotten", "getting"},
    "give": {"gives", "gave", "given", "giving"},
    "go": {"goes", "went", "gone", "going"},
    "grow": {"grows", "grew", "grown", "growing"},
    "hang": {"hangs", "hung", "hanged", "hanging"},
    "have": {"has", "had", "having"},
    "hear": {"hears", "heard", "hearing"},
    "hide": {"hides", "hid", "hidden", "hiding"},
    "hit": {"hits", "hit", "hitting"},
    "hold": {"holds", "held", "holding"},
    "keep": {"keeps", "kept", "keeping"},
    "know": {"knows", "knew", "known", "knowing"},
    "lay": {"lays", "laid", "laying"},
    "lead": {"leads", "led", "leading"},
    "leave": {"leaves", "left", "leaving"},
    "let": {"lets", "let", "letting"},
    "lie": {"lies", "lay", "lain", "lied", "lying"},
    "lose": {"loses", "lost", "losing"},
    "make": {"makes", "made", "making"},
    "meet": {"meets", "met", "meeting"},
    "pay": {"pays", "paid", "paying"},
    "read": {"reads", "read", "reading"},
    "ring": {"rings", "rang", "rung", "ringing"},
    "run": {"runs", "ran", "running"},
    "see": {"sees", "saw", "seen", "seeing"},
    "send": {"sends", "sent", "sending"},
    "set": {"sets", "set", "setting"},
    "shake": {"shakes", "shook", "shaken", "shaking"},
    "shoot": {"shoots", "shot", "shooting"},
    "shut": {"shuts", "shut", "shutting"},
    "sing": {"sings", "sang", "sung", "singing"},
    "sit": {"sits", "sat", "sitting"},
    "sleep": {"sleeps", "slept", "sleeping"},
    "smell": {"smells", "smelled", "smelt", "smelling"},
    "speak": {"speaks", "spoke", "spoken", "speaking"},
    "spin": {"spins", "spun", "spinning"},
    "spill": {"spills", "spilled", "spilt", "spilling"},
    "spring": {"springs", "sprang", "sprung", "springing"},
    "stand": {"stands", "stood", "standing"},
    "steal": {"steals", "stole", "stolen", "stealing"},
    "stick": {"sticks", "stuck", "sticking"},
    "strike": {"strikes", "struck", "stricken", "striking"},
    "sweep": {"sweeps", "swept", "sweeping"},
    "swear": {"swears", "swore", "sworn", "swearing"},
    "take": {"takes", "took", "taken", "taking"},
    "tear": {"tears", "tore", "torn", "tearing"},
    "tell": {"tells", "told", "telling"},
    "think": {"thinks", "thought", "thinking"},
    "throw": {"throws", "threw", "thrown", "throwing"},
    "wear": {"wears", "wore", "worn", "wearing"},
    "weigh": {"weighs", "weighed", "weighing"},
    "win": {"wins", "won", "winning"},
    "wind": {"winds", "wound", "winding"},
    "write": {"writes", "wrote", "written", "writing"},
}


@dataclass(frozen=True)
class Line:
    text: str
    page: int


@dataclass
class QuestionBlock:
    local_number: int
    volume: int
    page: int
    band: int
    english: str
    chinese: str
    starter: str = ""
    target_form: str = ""
    target_meaning_zh: str = ""


def normalized_text(value: object) -> str:
    text = unicodedata.normalize("NFKC", str(value or ""))
    return re.sub(r"\s+", " ", text).strip()


def normalize_student_names(value: str) -> str:
    return re.sub(r"\bMia\b", "Tom", value).replace("米婭", "湯姆")


def clean_line(value: str) -> str:
    value = normalized_text(value)
    value = re.sub(r"^#{1,6}\s*", "", value)
    value = re.sub(r"^\*\*(.*?)\*\*$", r"\1", value)
    return normalize_student_names(value.strip())


def is_noise(line: Line) -> bool:
    text = line.text
    if not text or PAGE_FOOTER.fullmatch(text) or text in IGNORED_EXACT:
        return True
    if re.fullmatch(r"Phrasal Verbs? with .+(?: - Answer Key)?", text, re.IGNORECASE):
        return True
    if text.startswith("Complete model sentences, Chinese translations"):
        return True
    if text.startswith("提供") and "完整示範句子" in text:
        return True
    return False


def source_metadata(path: Path) -> tuple[int, str, str]:
    match = SOURCE_NAME.match(path.name)
    if not match:
        raise ValueError(f"Unsupported source filename: {path.name}")
    return int(match.group("number")), match.group("title").strip(), match.group("extension").lower()


def extract_pdf_lines(path: Path) -> tuple[list[Line], int]:
    lines: list[Line] = []
    with pdfplumber.open(path) as document:
        for page_number, page in enumerate(document.pages, 1):
            text = page.extract_text(x_tolerance=2, y_tolerance=3) or ""
            lines.extend(Line(clean_line(raw), page_number) for raw in text.splitlines())
        return lines, len(document.pages)


def extract_docx_lines(path: Path) -> tuple[list[Line], int]:
    document = Document(path)
    raw_lines: list[str] = []
    for child in document.element.body.iterchildren():
        if isinstance(child, CT_P):
            raw_lines.extend(Paragraph(child, document).text.splitlines())
        elif isinstance(child, CT_Tbl):
            table = Table(child, document)
            for row in table.rows:
                for cell in row.cells:
                    for paragraph in cell.paragraphs:
                        raw_lines.extend(paragraph.text.splitlines())
    lines = [Line(clean_line(value), 1) for value in raw_lines]
    return lines, 1


def extract_markdown_lines(path: Path) -> tuple[list[Line], int]:
    return [Line(clean_line(raw), 1) for raw in path.read_text(encoding="utf-8").splitlines()], 1


def extract_lines(path: Path) -> tuple[list[Line], int]:
    extension = path.suffix.lower()
    if extension == ".pdf":
        return extract_pdf_lines(path)
    if extension == ".docx":
        return extract_docx_lines(path)
    if extension == ".md":
        return extract_markdown_lines(path)
    raise ValueError(f"Unsupported source type: {path}")


def numbered_line(text: str) -> tuple[int, str] | None:
    match = NUMBERED_LINE.fullmatch(text)
    if not match:
        return None
    number = int(match.group("number"))
    # A wrapped answer can begin with a four-digit year (for example
    # ``1760.``).  It is sentence content, not a new exercise number.
    if number > 999:
        return None
    return number, clean_line(match.group("rest") or "")


def join_english(lines: Iterable[str]) -> str:
    text = " ".join(clean_line(line) for line in lines if clean_line(line))
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    return normalized_text(text)


def join_chinese(lines: Iterable[str]) -> str:
    pieces = [clean_line(line) for line in lines if clean_line(line)]
    text = "".join(pieces)
    if (text.startswith("（") and text.endswith("）")) or (text.startswith("(") and text.endswith(")")):
        text = text[1:-1]
    return normalized_text(text)


def split_bilingual(lines: Sequence[Line]) -> tuple[str, str]:
    usable = [line for line in lines if not is_noise(line) and line.text not in BAND_HEADINGS]
    chinese_start = next((index for index, line in enumerate(usable) if line.text.startswith(("（", "(")) and HAS_CJK.search(line.text)), None)
    if chinese_start is None:
        chinese_start = next((index for index, line in enumerate(usable) if HAS_CJK.search(line.text)), len(usable))
    english = join_english(line.text for line in usable[:chinese_start])
    chinese = join_chinese(line.text for line in usable[chinese_start:])
    return english, chinese


def section_windows(lines: Sequence[Line], start: str | set[str], end: str | set[str]) -> list[list[Line]]:
    starts = {start} if isinstance(start, str) else start
    ends = {end} if isinstance(end, str) else end
    windows: list[list[Line]] = []
    index = 0
    while index < len(lines):
        if lines[index].text not in starts:
            index += 1
            continue
        stop = next((cursor for cursor in range(index + 1, len(lines)) if lines[cursor].text in ends), None)
        if stop is None:
            break
        windows.append(list(lines[index + 1 : stop]))
        index = stop + 1
    return windows


def numbered_segments(lines: Sequence[Line]) -> list[tuple[int, list[Line]]]:
    starts: list[tuple[int, int, str]] = []
    for index, line in enumerate(lines):
        parsed = numbered_line(line.text)
        if parsed:
            starts.append((index, parsed[0], parsed[1]))
    segments: list[tuple[int, list[Line]]] = []
    for position, (index, number, rest) in enumerate(starts):
        stop = starts[position + 1][0] if position + 1 < len(starts) else len(lines)
        segment = list(lines[index + 1 : stop])
        if rest:
            segment.insert(0, Line(rest, lines[index].page))
        segments.append((number, segment))
    return segments


def parse_rules(lines: Sequence[Line]) -> list[dict]:
    rules: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for window in section_windows(
        lines,
        RULE_HEADINGS,
        REFERENCE_HEADINGS,
    ):
        for _, segment in numbered_segments(window):
            english_lines: list[str] = []
            chinese_lines: list[str] = []
            in_chinese = False
            for line in segment:
                if is_noise(line):
                    continue
                if not in_chinese and HAS_CJK.search(line.text):
                    in_chinese = True
                (chinese_lines if in_chinese else english_lines).append(line.text)
            english = join_english(english_lines)
            chinese = join_chinese(chinese_lines)
            if not english or not chinese or (english.casefold(), chinese) in seen:
                continue
            seen.add((english.casefold(), chinese))
            rules.append({"titleZh": chinese, "titleEn": english.split(". ", 1)[0].rstrip(".") + ".", "zh": chinese, "en": english})
    return rules


def parse_reference_bank(lines: Sequence[Line]) -> list[dict]:
    groups: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for window in section_windows(
        lines,
        REFERENCE_HEADINGS,
        BENEFIT_HEADINGS | EXERCISE_HEADINGS,
    ):
        for _, segment in numbered_segments(window):
            usable = [line for line in segment if not is_noise(line)]
            if len(usable) >= 2:
                mixed_formula = re.match(r"^(?P<formula>.+?)\s+[—–-]\s*(?P<meaning>[\u3400-\u9fff].*)$", usable[0].text)
                mixed_example = re.match(r"^(?P<example>.+?)\s*[（(\[](?P<translation>[\u3400-\u9fff].*?)[）)\]]$", usable[1].text)
                if mixed_formula and mixed_example:
                    formula = normalized_text(mixed_formula.group("formula"))
                    meaning_zh = normalized_text(mixed_formula.group("meaning"))
                    example_en = normalized_text(mixed_example.group("example"))
                    example_zh = normalized_text(mixed_example.group("translation"))
                    key = (formula.casefold(), meaning_zh)
                    if key not in seen:
                        seen.add(key)
                        groups.append({
                            "formula": formula,
                            "titleZh": meaning_zh,
                            "titleEn": formula,
                            "descriptionZh": meaning_zh,
                            "descriptionEn": example_en,
                            "examples": [{"en": example_en, "zh": example_zh, "highlight": source_example_highlight(example_en, formula)}],
                        })
                    continue
            first_cjk = next((index for index, line in enumerate(usable) if HAS_CJK.search(line.text)), None)
            if first_cjk is None or first_cjk == 0:
                continue
            example_zh_start = next((index for index in range(first_cjk + 1, len(usable)) if usable[index].text.startswith(("（", "(", "[")) and HAS_CJK.search(usable[index].text)), None)
            if example_zh_start is None:
                continue
            english_example_start = first_cjk + 1
            while english_example_start < example_zh_start and HAS_CJK.search(usable[english_example_start].text):
                english_example_start += 1
            formula = join_english(line.text for line in usable[:first_cjk])
            meaning_zh = join_chinese(line.text for line in usable[first_cjk:english_example_start])
            example_en = join_english(line.text for line in usable[english_example_start:example_zh_start])
            example_zh = join_chinese(line.text for line in usable[example_zh_start:])
            key = (formula.casefold(), meaning_zh)
            if not all((formula, meaning_zh, example_en, example_zh)) or key in seen:
                continue
            seen.add(key)
            groups.append({
                "formula": formula,
                "titleZh": meaning_zh,
                "titleEn": formula,
                "descriptionZh": meaning_zh,
                "descriptionEn": example_en,
                "examples": [{"en": example_en, "zh": example_zh, "highlight": source_example_highlight(example_en, formula)}],
            })
    for index, group in enumerate(groups, 1):
        group["number"] = index
        group["pageGroup"] = 1 if index <= (len(groups) + 1) // 2 else 2
    return groups


def parse_benefits(lines: Sequence[Line]) -> list[dict]:
    benefits: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for window in section_windows(lines, BENEFIT_HEADINGS, EXERCISE_HEADINGS):
        for _, segment in numbered_segments(window):
            usable = [line for line in segment if not is_noise(line)]
            first_cjk = next((index for index, line in enumerate(usable) if HAS_CJK.search(line.text)), None)
            if first_cjk is None or first_cjk < 1 or first_cjk + 1 >= len(usable):
                continue
            english_title = usable[0].text
            english = join_english(line.text for line in usable[1:first_cjk])
            chinese_title = usable[first_cjk].text
            chinese = join_chinese(line.text for line in usable[first_cjk + 1 :])
            key = (english_title.casefold(), chinese_title)
            if not all((english_title, english, chinese_title, chinese)) or key in seen:
                continue
            seen.add(key)
            benefits.append({"titleZh": chinese_title, "titleEn": english_title, "zh": chinese, "en": english})
    return benefits


def metadata_value(lines: Sequence[Line], pattern: str) -> str:
    regex = re.compile(pattern, re.IGNORECASE)
    for line in lines:
        match = regex.search(line.text)
        if match:
            return clean_line(match.group(1))
    return ""


def parse_learning_objective(lines: Sequence[Line], title: str) -> dict:
    for index, line in enumerate(lines):
        if line.text != "Learning Objective 學習目標":
            continue
        window = [candidate for candidate in lines[index + 1 : index + 8] if not is_noise(candidate)]
        english = next((candidate.text for candidate in window if not HAS_CJK.search(candidate.text)), "")
        chinese = next((candidate.text for candidate in window if HAS_CJK.search(candidate.text)), "")
        if english and chinese:
            return {"zh": chinese, "en": english}
    upper = title.upper()
    return {"zh": f"學習及練習與 {upper} 有關的片語動詞。", "en": f"Learn and practise the phrasal verbs related to {upper}."}


def question_candidates(lines: Sequence[Line], marker_predicate) -> list[tuple[int, int, int, list[Line], Line]]:
    numbered: list[tuple[int, int, str]] = []
    for index, line in enumerate(lines):
        parsed = numbered_line(line.text)
        if parsed:
            numbered.append((index, parsed[0], parsed[1]))
    candidates: list[tuple[int, int, int, list[Line], Line]] = []
    volume = 1
    previous_number = 0
    for position, (index, number, rest) in enumerate(numbered):
        stop = numbered[position + 1][0] if position + 1 < len(numbered) else len(lines)
        segment = list(lines[index + 1 : stop])
        if rest:
            segment.insert(0, Line(rest, lines[index].page))
        marker = next((line for line in segment if marker_predicate(line.text)), None)
        if marker is None:
            continue
        if number <= previous_number:
            volume += 1
        previous_number = number
        candidates.append((number, volume, lines[index].page, segment, marker))
    return candidates


def nearest_band(lines: Sequence[Line], question_page: int, question_index: int) -> int:
    # Numbered question blocks are already ordered.  The last band heading seen
    # before the question is therefore the authoritative band.
    band = 1
    for line in lines[:question_index]:
        if line.text in BAND_HEADINGS:
            band = BAND_HEADINGS[line.text][0]
    return band


def parse_exercises(lines: Sequence[Line]) -> list[QuestionBlock]:
    start = next((index + 1 for index, line in enumerate(lines) if line.text in EXERCISE_HEADINGS), 0)
    stop = next((index for index in range(start, len(lines)) if lines[index].text in ANSWER_KEY_HEADINGS), len(lines))
    exercise_lines = lines[start:stop]
    candidates = question_candidates(exercise_lines, lambda text: ANSWER_BLANK.fullmatch(text) is not None)
    questions: list[QuestionBlock] = []
    search_start = 0
    active_band = 1
    for number, volume, page, segment, marker in candidates:
        while search_start < len(exercise_lines):
            if exercise_lines[search_start].text in BAND_HEADINGS:
                active_band = BAND_HEADINGS[exercise_lines[search_start].text][0]
            parsed = numbered_line(exercise_lines[search_start].text)
            if parsed and parsed[0] == number and any(candidate is marker for candidate in segment):
                break
            search_start += 1
        marker_index = segment.index(marker)
        english, chinese = split_bilingual(segment[:marker_index])
        match = ANSWER_BLANK.fullmatch(marker.text)
        starter = normalized_text(match.group("starter") if match else "")
        if english and chinese and starter:
            questions.append(QuestionBlock(number, volume, page, active_band, english, chinese, starter=starter))
    return questions


def parse_answer_key(lines: Sequence[Line]) -> list[QuestionBlock]:
    start = next((index + 1 for index, line in enumerate(lines) if line.text in ANSWER_KEY_HEADINGS), len(lines))
    answer_lines = lines[start:]
    candidates = question_candidates(answer_lines, lambda text: TARGET_LINE.match(text) is not None)
    answers: list[QuestionBlock] = []
    for number, volume, page, segment, marker in candidates:
        marker_index = segment.index(marker)
        english, chinese = split_bilingual(segment[:marker_index])
        target_lines = [marker.text]
        for line in segment[marker_index + 1 :]:
            if is_noise(line) or line.text in BAND_HEADINGS:
                continue
            if line.text.startswith(("（", "(")) or ((target_lines[-1].count("（") + target_lines[-1].count("(")) > (target_lines[-1].count("）") + target_lines[-1].count(")")) and HAS_CJK.search(line.text)):
                target_lines.append(line.text)
            else:
                break
        target_text = join_chinese(target_lines)
        target_text = re.sub(r"^(?:Phrasal verb|Expression):\s*", "", target_text, flags=re.IGNORECASE)
        chinese_parenthesis = re.search(r"[（(](?=[^）)]*[\u3400-\u9fff])", target_text)
        if chinese_parenthesis:
            target_form = target_text[: chinese_parenthesis.start()]
            target_meaning = target_text[chinese_parenthesis.end() :].rstrip("）)")
        else:
            target_form, target_meaning = target_text, ""
        if english and chinese and target_form:
            answers.append(QuestionBlock(number, volume, page, 1, english, chinese, target_form=normalized_text(target_form), target_meaning_zh=normalized_text(target_meaning)))
    return answers


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


def token_records(text: str) -> list[tuple[str, int, int]]:
    return [(match.group(0), match.start(), match.end()) for match in TOKEN.finditer(text)]


def first_formula_verb(formula: str) -> str:
    match = re.search(r"[A-Za-z]+", formula)
    return match.group(0).casefold() if match else ""


def changed_highlight(prompt: str, answer: str, formula: str) -> str:
    prompt_tokens = token_records(prompt)
    answer_tokens = token_records(answer)
    matcher = difflib.SequenceMatcher(
        a=[token.casefold() for token, _, _ in prompt_tokens],
        b=[token.casefold() for token, _, _ in answer_tokens],
        autojunk=False,
    )
    changed = [(j1, j2) for tag, _, _, j1, j2 in matcher.get_opcodes() if tag != "equal" and j2 > j1]
    if not changed:
        changed = [(0, min(len(answer_tokens), 2))]
    start, end = changed[0]
    base = first_formula_verb(formula)
    forms = regular_forms(base) if base else set()
    verb_index = next((index for index in range(min(start, len(answer_tokens) - 1), max(-1, start - 12), -1) if answer_tokens[index][0].casefold() in forms), None)
    if verb_index is None and base:
        scores = []
        for index in range(max(0, start - 8), min(len(answer_tokens), max(end, start + 1))):
            token = answer_tokens[index][0].casefold()
            if token.isalpha():
                scores.append((difflib.SequenceMatcher(a=base, b=token).ratio(), index))
        if scores and max(scores)[0] >= 0.45:
            verb_index = max(scores)[1]
    if verb_index is not None:
        start = min(start, verb_index)
    if start >= len(answer_tokens):
        start = max(0, len(answer_tokens) - 1)
    end = max(start + 1, min(end, len(answer_tokens)))
    highlight = answer[answer_tokens[start][1] : answer_tokens[end - 1][2]].strip(" ,.;:!?")
    return highlight or answer


def source_example_highlight(example: str, formula: str) -> str:
    tokens = token_records(example)
    if not tokens:
        return example
    base = first_formula_verb(formula)
    forms = regular_forms(base)
    start = next((index for index, (token, _, _) in enumerate(tokens) if token.casefold() in forms), None)
    if start is None:
        return tokens[0][0]
    particles = {
        token.casefold()
        for token in re.findall(r"[A-Za-z]+", formula)
        if token.casefold() in {"about", "across", "after", "against", "along", "around", "at", "away", "back", "behind", "by", "down", "for", "forward", "from", "in", "into", "off", "on", "onto", "out", "over", "round", "through", "to", "together", "under", "up", "upon", "with"}
    }
    end = start + 1
    for index in range(start + 1, min(len(tokens), start + 12)):
        if tokens[index][0].casefold() in particles:
            end = index + 1
    return example[tokens[start][1] : tokens[end - 1][2]].strip(" ,.;:!?")


def band_ranges(questions: Sequence[dict]) -> list[dict]:
    ranges: list[dict] = []
    for band_number in range(1, 6):
        numbers = [question["number"] for question in questions if question["band"] == band_number]
        if not numbers:
            continue
        _, zh, en = next(value for value in BAND_HEADINGS.values() if value[0] == band_number)
        ranges.append({"number": band_number, "titleZh": zh, "titleEn": en, "questionRange": [min(numbers), max(numbers)]})
    return ranges


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().casefold()).strip("-")
    return slug or "lesson"


def load_overrides(path: Path | None) -> dict[str, dict]:
    if path is None or not path.is_file():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("Override file must be a JSON object keyed by source filename")
    return data


def apply_answer_overrides(source_name: str, questions: list[QuestionBlock], answers: list[QuestionBlock], overrides: dict[str, dict]) -> list[QuestionBlock]:
    source_override = overrides.get(source_name, {})
    replacement = source_override.get("answers")
    parsed = list(answers)
    if replacement is not None:
        parsed = []
        for index, item in enumerate(replacement, 1):
            parsed.append(QuestionBlock(
                local_number=int(item.get("localNumber", index)),
                volume=int(item.get("volume", 1)),
                page=int(item.get("page", 1)),
                band=1,
                english=normalize_student_names(normalized_text(item["answer"])),
                chinese=normalize_student_names(normalized_text(item["answerZh"])),
                target_form=normalized_text(item["targetForm"]),
                target_meaning_zh=normalized_text(item["targetMeaningZh"]),
            ))
    patches = source_override.get("answerPatches", {})
    by_key = {(item.volume, item.local_number): item for item in parsed}
    for raw_key, item in patches.items():
        volume_text, number_text = str(raw_key).split(":", 1)
        key = (int(volume_text), int(number_text))
        existing = by_key.get(key)
        by_key[key] = QuestionBlock(
            local_number=int(item.get("localNumber", key[1])),
            volume=int(item.get("volume", key[0])),
            page=int(item.get("page", existing.page if existing else 1)),
            band=1,
            english=normalize_student_names(normalized_text(item["answer"])),
            chinese=normalize_student_names(normalized_text(item["answerZh"])),
            target_form=normalized_text(item["targetForm"]),
            target_meaning_zh=normalized_text(item["targetMeaningZh"]),
        )
    return sorted(by_key.values(), key=lambda item: (item.volume, item.local_number))


def fallback_benefits(groups: Sequence[dict]) -> list[dict]:
    benefits: list[dict] = []
    for group in groups[:3]:
        formula = group["formula"]
        meaning = group["titleZh"]
        benefits.append({
            "titleZh": f"準確表達「{meaning}」",
            "titleEn": f"Use {formula} precisely",
            "zh": f"使用 {formula}，可以自然並準確地表達「{meaning}」。",
            "en": f"Use {formula} to express this meaning naturally and precisely.",
        })
    return benefits


def build_lesson(path: Path, order: int, overrides: dict[str, dict]) -> tuple[dict, list[str]]:
    source_number, filename_title, _ = source_metadata(path)
    lines, page_count = extract_lines(path)
    source_override = overrides.get(path.name, {})
    max_page = source_override.get("maxPage")
    if max_page is not None:
        max_page = int(max_page)
        if max_page < 1 or max_page > page_count:
            raise ValueError(f"Invalid maxPage {max_page} for {path.name} ({page_count} pages)")
        lines = [line for line in lines if line.page <= max_page]
    rules = parse_rules(lines)
    groups = parse_reference_bank(lines)
    benefits = parse_benefits(lines)
    benefits_derived = not benefits
    if not benefits and groups:
        benefits = fallback_benefits(groups)
    exercises = parse_exercises(lines)
    answers = apply_answer_overrides(path.name, exercises, parse_answer_key(lines), overrides)
    errors: list[str] = []

    if not groups:
        errors.append("reference bank not found")
    if not benefits:
        errors.append("benefits not found")
    if not rules:
        errors.append("rules not found")
    if not exercises:
        errors.append("exercise questions not found")

    if len(answers) < len(exercises):
        errors.append(f"missing {len(exercises) - len(answers)} answer-key entries")
    if len(answers) > len(exercises):
        errors.append(f"found {len(answers) - len(exercises)} unmatched answer-key entries")

    title = filename_title.replace("_", "/").strip()
    upper_title = title.upper()
    lesson_id = f"phrasal-verb-{order:02d}"
    questions: list[dict] = []
    for index, (exercise, answer) in enumerate(zip(exercises, answers), 1):
        highlight = changed_highlight(exercise.english, answer.english, answer.target_form)
        if highlight.casefold() not in answer.english.casefold():
            errors.append(f"q{index}: highlight is not in answer")
        questions.append({
            "id": f"{lesson_id}-q{index:02d}",
            "number": index,
            "band": exercise.band,
            "sourcePage": exercise.page,
            "answerSourcePage": answer.page,
            "prompt": exercise.english,
            "promptZh": exercise.chinese,
            "starter": exercise.starter,
            "answer": answer.english,
            "answerZh": answer.chinese,
            "highlight": highlight,
            "targetForm": answer.target_form,
            "targetMeaningZh": answer.target_meaning_zh or next((group["titleZh"] for group in groups if group["formula"].casefold() == answer.target_form.casefold()), "使用指定片語動詞保留原句意思"),
        })

    exercise_pages = sorted({question.page for question in exercises}) or [1]
    answer_pages = sorted({answer.page for answer in answers}) or [1]
    teaching_pages = sorted({line.page for line in lines if line.text == "Learning Objective 學習目標" or line.text in RULE_HEADINGS | REFERENCE_HEADINGS | BENEFIT_HEADINGS}) or [1]
    source = {
        "file": path.name,
        "sourceNumber": source_number,
        "pageCount": page_count,
        "teachingPdfPages": teaching_pages,
        "exercisePdfPages": exercise_pages,
        "contentPdfPages": sorted(set(teaching_pages + exercise_pages)),
        "answerKeyPdfPages": answer_pages,
        "benefitsDerivedFromReferenceBank": benefits_derived,
        "answerOverrideCount": len(source_override.get("answers", [])),
        "answerPatchCount": len(source_override.get("answerPatches", {})),
    }
    if max_page is not None:
        source["importedPageRange"] = [1, max_page]
    examples = [group["examples"][0] | {"labelZh": "例句", "labelEn": "Example"} for group in groups[:3]]
    contexts_zh = [benefit["titleZh"] for benefit in benefits]
    contexts_en = [benefit["titleEn"] for benefit in benefits]
    summary_zh = "；".join(benefit["zh"] for benefit in benefits)
    summary_en = " ".join(benefit["en"] for benefit in benefits)
    first_rule = rules[0] if rules else {"zh": f"閱讀整句，選出意思相同的 {upper_title} 片語動詞。", "en": f"Read the whole sentence and choose the {upper_title} expression that gives the same meaning."}
    second_rule = rules[1] if len(rules) > 1 else first_rule
    variable_rules = rules[1:] or rules
    forms = [{
        "formZh": group["titleZh"],
        "formEn": group["formula"],
        "exampleZh": group["examples"][0]["zh"],
        "exampleEn": group["examples"][0]["en"],
        "highlight": group["examples"][0]["highlight"],
    } for group in groups]
    specific_forms = [{
        "number": index,
        "titleZh": group["titleZh"],
        "titleEn": group["formula"],
        "formula": group["formula"],
        "highlight": group["formula"],
        "descriptionZh": group["descriptionZh"],
        "descriptionEn": group["descriptionEn"],
        "examples": group["examples"],
        "notes": [],
    } for index, group in enumerate(groups, 1)]
    comparisons = []
    comparison_source = benefits or [{"titleZh": group["titleZh"], "titleEn": group["formula"], "zh": group["descriptionZh"], "en": group["descriptionEn"]} for group in groups]
    for index, item in enumerate(comparison_source):
        example = groups[index % len(groups)]["examples"] if groups else []
        comparisons.append(item | {"examples": example})

    instructions = {
        "zh": f"使用與 {upper_title} 有關的片語動詞改寫以下句子。答案必須保留原意。每題已提供答案的第一個字。請完成整句。",
        "en": f"Rewrite each sentence using a phrasal verb related to {upper_title}. Keep the same meaning. The first word of each answer has been provided. Complete the whole sentence.",
    }
    level = metadata_value(lines, r"Level:\s*(.+)") or metadata_value(lines, r"^(A\d(?:[–-]B\d)?(?:\s+transitional)?)\b") or "A2–B1"
    lesson = {
        "id": lesson_id,
        "order": order,
        "slug": slugify(title),
        "version": "1",
        "title": f"{upper_title} 動詞片語",
        "titleEn": title.title() if title.isupper() else title,
        "titleZh": f"{upper_title} 動詞片語",
        "level": level.replace("-", "–"),
        "groupCount": len(groups),
        "source": source,
        "learningObjective": parse_learning_objective(lines, title),
        "formulas": [{"labelZh": "核心動詞", "labelEn": "Core Verb", "formula": upper_title, "highlight": upper_title}],
        "examples": examples,
        "meaning": {"zh": "；".join(group["titleZh"] for group in groups), "en": "; ".join(group["formula"] for group in groups), "naturalZh": [group["titleZh"] for group in groups]},
        "meaningGroups": groups,
        "register": {
            "labelZh": f"{upper_title} 片語動詞的實際用途",
            "labelEn": f"{upper_title} Phrasal Verbs in Use",
            "summaryZh": summary_zh or "；".join(group["titleZh"] for group in groups),
            "summaryEn": summary_en or " ".join(group["descriptionEn"] for group in groups),
            "contextsZh": contexts_zh or [group["titleZh"] for group in groups],
            "contextsEn": contexts_en or [group["formula"] for group in groups],
            "formalZh": first_rule["zh"],
            "formalEn": first_rule["en"],
        },
        "fixedVariable": {
            "fixed": groups[0]["formula"] if groups else upper_title,
            "fixedHighlight": groups[0]["formula"] if groups else upper_title,
            "fixedZh": first_rule["zh"],
            "fixedEn": first_rule["en"],
            "correct": examples[0]["highlight"] if examples else upper_title,
            "incorrectForms": [],
            "variableZh": "；".join(rule["zh"] for rule in variable_rules),
            "variableEn": " ".join(rule["en"] for rule in variable_rules),
            "variableItemsZh": [group["formula"] for group in groups],
            "variableItemsEn": [group["formula"] for group in groups],
            "forms": forms,
        },
        "specificForms": specific_forms,
        "benefits": benefits,
        "usageGuide": {"titleZh": "實際用途及例句", "titleEn": "Uses and Examples", "contextsZh": contexts_zh, "contextsEn": contexts_en, "comparisons": comparisons},
        "rules": rules,
        "instructions": instructions,
        "exercise": {
            "kicker": "PAGE 8 · TYPE THE WHOLE SENTENCE",
            "titleZh": f"{upper_title} 動詞片語句子改寫練習",
            "titleEn": f"{upper_title} Phrasal-Verb Sentence Practice",
            "instructionsZh": instructions["zh"],
            "instructionsEn": instructions["en"],
            "bands": band_ranges(questions),
        },
        "questions": questions,
    }
    return lesson, errors


def source_files(directory: Path) -> list[Path]:
    files = [path for path in directory.iterdir() if path.is_file() and SOURCE_NAME.match(path.name)]
    return sorted(files, key=lambda path: (source_metadata(path)[0], source_metadata(path)[1].casefold(), path.name.casefold()))


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--lesson-dir", type=Path, required=True)
    parser.add_argument("--start-order", type=int, default=36)
    parser.add_argument("--expected-files", type=int, default=294)
    parser.add_argument("--expected-questions", type=int, default=19350)
    parser.add_argument("--overrides", type=Path)
    parser.add_argument("--manifest", type=Path, default=Path("tools/phrasal-verb-import-manifest.json"))
    parser.add_argument("--audit", action="store_true", help="parse and report without writing fragments")
    parser.add_argument("--quiet", action="store_true", help="print failures and final totals only")
    parser.add_argument("--only", action="append", default=[], help="source filename substring to parse (repeatable)")
    args = parser.parse_args()

    all_files = source_files(args.source_dir)
    files = all_files
    if args.only:
        files = [path for path in files if any(value.casefold() in path.name.casefold() for value in args.only)]
    elif len(all_files) != args.expected_files:
        raise SystemExit(f"Expected {args.expected_files} source files, found {len(all_files)}")
    order_by_path = {path: args.start_order + index for index, path in enumerate(all_files)}

    overrides = load_overrides(args.overrides)
    failures: list[str] = []
    totals = {"files": 0, "groups": 0, "questions": 0}
    generated: list[tuple[Path, dict]] = []
    manifest_entries: list[dict] = []
    for path in files:
        order = order_by_path[path]
        lesson, errors = build_lesson(path, order, overrides)
        totals["files"] += 1
        totals["groups"] += lesson["groupCount"]
        totals["questions"] += len(lesson["questions"])
        status = "FAIL" if errors else "OK"
        if not args.quiet or errors:
            print(f"{status} {lesson['id']} source={lesson['source']['sourceNumber']} {path.name}: {lesson['groupCount']} groups, {len(lesson['questions'])} questions")
        for error in errors:
            print(f"  - {error}")
            failures.append(f"{path.name}: {error}")
        generated.append((args.lesson_dir / f"lesson-{order:03d}-{lesson['slug']}.json", lesson))
        manifest_entries.append({
            "order": order,
            "lessonId": lesson["id"],
            "sourceNumber": lesson["source"]["sourceNumber"],
            "sourceFile": path.name,
            "sourceFormat": path.suffix.lower().lstrip("."),
            "sourceSha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "sourcePageCount": lesson["source"]["pageCount"],
            "importedPageRange": lesson["source"].get("importedPageRange"),
            "groupCount": lesson["groupCount"],
            "questionCount": len(lesson["questions"]),
            "benefitsDerivedFromReferenceBank": lesson["source"]["benefitsDerivedFromReferenceBank"],
            "answerOverrideCount": lesson["source"]["answerOverrideCount"],
            "answerPatchCount": lesson["source"]["answerPatchCount"],
        })

    if not args.only and totals["questions"] != args.expected_questions:
        failures.append(f"Expected {args.expected_questions} questions, found {totals['questions']}")
    print(json.dumps(totals, ensure_ascii=False))
    if failures:
        print(f"Import stopped with {len(failures)} validation failures", file=sys.stderr)
        return 1
    if not args.audit:
        for output_path, lesson in generated:
            write_json(output_path, lesson)
        write_json(args.manifest, {
            "version": 1,
            "sourceDirectory": "Phrasal Verb",
            "lessonRange": [min(item["order"] for item in manifest_entries), max(item["order"] for item in manifest_entries)],
            "fileCount": totals["files"],
            "questionCount": totals["questions"],
            "lessons": manifest_entries,
        })
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
