"""Build Professional English Lesson 5 polysemy questions from its source PDF.

Run with the bundled workspace Python, which includes pdfplumber.
The MC labels are copied only from the PDF's 繁體中文 table column.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pdfplumber


GLYPHS = {
    "(cid:58974)": "ff",
    "(cid:58975)": "fi",
    "(cid:58976)": "fl",
    "(cid:58977)": "ffi",
}

# The source meaning and the next table meaning are equivalent in these contexts.
# Both PDF labels remain visible, and either answer is accepted for those questions.
OVERLAPPING_FIRST_SENSES = {
    "stay", "calm", "affected", "area", "safe", "staircase", "route",
    "team", "breathing", "alarm", "designated", "all-clear", "urgent",
    "awake", "assistance", "attempt", "entrapment", "restricted",
    "recognise", "observe",
}


def repair_glyphs(value: str) -> str:
    for broken, correct in GLYPHS.items():
        value = value.replace(broken, correct)
    return value


def clean_english(value: str) -> str:
    return re.sub(r"\s+", " ", repair_glyphs(value).replace("-\n", "-")).strip()


def clean_chinese(value: str) -> str:
    value = repair_glyphs(value)
    lines = [line.strip() for line in value.splitlines()]
    result = lines[0] if lines else ""
    for line in lines[1:]:
        if result and line and result[-1].isascii() and result[-1].isalnum() and line[0].isascii() and line[0].isalnum():
            result += " "
        result += line
    return result.strip().removeprefix("「").removesuffix("」")


def numbered_examples(value: str, cleaner) -> list[str]:
    parts = re.split(r"(?m)^\s*[12]\.\s+", value or "")
    if len(parts) != 3 or parts[0].strip():
        raise ValueError(f"Expected exactly two numbered examples: {value!r}")
    return [cleaner(part) for part in parts[1:]]


def word_id(word: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", word.lower()).strip("-")


def build(source: Path) -> dict:
    words = []
    with pdfplumber.open(source) as pdf:
        if len(pdf.pages) != 75:
            raise ValueError(f"Expected 75 pages, found {len(pdf.pages)}")
        for page_number in range(5, 76):
            page = pdf.pages[page_number - 1]
            text = repair_glyphs(page.extract_text() or "")
            match = re.match(r"^(\d+)\.\s+(.+)$", text.splitlines()[0])
            base = re.search(r"(?m)^Base word:\s*(.+)$", text)
            tables = page.extract_tables()
            if not match or not base or int(match.group(1)) != page_number - 4 or len(tables) != 1:
                raise ValueError(f"Unexpected heading or table on PDF page {page_number}")
            rows = tables[0]
            if rows[0][:2] != ["Meaning", "繁體中文"] or len(rows) != 5:
                raise ValueError(f"Unexpected meaning columns on PDF page {page_number}")
            word = repair_glyphs(match.group(2)).strip()
            slug = word_id(word)
            senses = []
            examples = []
            for sense_number, row in enumerate(rows[1:]):
                meaning, traditional_chinese, english_cell, chinese_cell = row
                sense_id = f"{slug}-{sense_number}"
                sense = {
                    "id": sense_id,
                    "zh": clean_chinese(traditional_chinese),
                    "sourceMeaning": clean_english(meaning).removeprefix("Meaning in Lesson 5: "),
                }
                if not all(sense.values()):
                    raise ValueError(f"Empty meaning on PDF page {page_number}, row {sense_number}")
                senses.append(sense)
                english = numbered_examples(english_cell, clean_english)
                chinese = numbered_examples(chinese_cell, clean_chinese)
                if sense_number == 0:
                    # The second source-row entry is a meta note that gives the answer away.
                    if not english[1].startswith("Please note:"):
                        raise ValueError(f"Unexpected source note on PDF page {page_number}")
                    examples.append({
                        "id": f"{slug}-passage",
                        "kind": "passage",
                        "en": english[0],
                        "zh": chinese[0],
                        "answer": sense_id,
                    })
                else:
                    for example_number in range(2):
                        examples.append({
                            "id": f"{slug}-{sense_number}-{example_number + 1}",
                            "kind": "example",
                            "en": english[example_number],
                            "zh": chinese[example_number],
                            "answer": sense_id,
                        })
            # Interleave senses so two examples with the same answer do not appear together.
            passage = examples[0]
            questions = [next(q for q in examples[1:] if q["id"] == f"{slug}-{sense_number}-{example_number}")
                         for example_number in (1, 2) for sense_number in (1, 2, 3)]
            questions.append(passage)
            if slug in OVERLAPPING_FIRST_SENSES:
                for question in questions:
                    if question["answer"] in {senses[0]["id"], senses[1]["id"]}:
                        question["acceptedAnswers"] = [senses[0]["id"], senses[1]["id"]]
            words.append({
                "id": slug,
                "word": word,
                "baseWord": repair_glyphs(base.group(1)).strip(),
                "sourcePage": page_number,
                "senses": senses,
                "questions": questions,
                "source": {
                    "lesson": 5,
                    "page": page_number,
                    "label": str(page_number),
                    "pdf": "materials/lesson-5-polysemy.pdf",
                    "directPdf": True,
                },
            })
    if len(words) != 71 or len({word["id"] for word in words}) != 71:
        raise ValueError("Expected 71 unique Lesson 5 words")
    return {
        "lesson": 5,
        "title": "一詞多義 (Polysemy) 練習",
        "source": source.name,
        "words": words,
        "sourceNotes": "MC labels are transcribed from the PDF's 繁體中文 column; the answer-giving 'Please note' lines are excluded.",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    args.output.write_text(json.dumps(build(args.source), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
