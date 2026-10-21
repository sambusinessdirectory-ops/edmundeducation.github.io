"""Build the Writing Submission structure catalog from the tagged IELTS PDF.

Usage: python tools/build-writing-sentence-support.py /path/to/mapping.pdf
Requires pdfplumber. Source examples come from the Writing Practice essay data.
"""

import json
import re
import sys
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "writing-sentence-support-data.json"
SOURCE_RE = re.compile(
    r"First:\s*(.+?)\s*·\s*Model Essay\s+(\d+)\s*·\s*P(\d+)\s+S(\d+)\s*·\s*(\d+)\s+source rows?"
)
TAG_RE = re.compile(r"(?:I|B1|B2|R|C)-[A-Z]{2}|F-[A-Z]{2}")
ID_RE = re.compile(r"S\d{3}")
HAN_SPACES = re.compile(r"(?<=[\u3400-\u9fff])\s+(?=[\u3400-\u9fff])")


def normalized(text):
    text = " ".join(text.split())
    return HAN_SPACES.sub("", text)


def essays():
    found = {}
    paths = list(ROOT.glob("writing-practice-model-essays*data.js"))
    paths += list(ROOT.glob("writing-practice-model-essay-*-data.js"))
    for path in sorted(paths):
        source = path.read_text()
        match = re.match(r"window\.\w+\s*=\s*", source)
        if not match:
            continue
        collection = json.loads(source[match.end() :].rstrip().removesuffix(";"))
        for essay in collection.values():
            number = re.search(r"model-essay-(\d+)-", essay["id"])
            if number:
                found[(essay["taskType"], int(number.group(1)))] = essay
    return found


def source_example(essay, paragraph, sentence):
    if not essay:
        return ""
    try:
        parts = essay["paragraphs"][paragraph - 1]["sentences"][sentence - 1]["parts"]
        return "".join(parts).strip()
    except (IndexError, KeyError, TypeError):
        return ""


def read_catalog(pdf_path):
    source_essays = essays()
    source_categories = {
        "Advantages and Disadvantages": "Advantages / Disadvantages",
        "Cause and Solution": "Cause / Solution",
        "Direct Questions": "Direct Question",
    }
    catalog = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages[2:]:
            starts = [
                word
                for word in page.extract_words()
                if ID_RE.fullmatch(word["text"]) and word["x0"] < 60
            ]
            for index, word in enumerate(starts):
                bottom = starts[index + 1]["top"] - 2 if index + 1 < len(starts) else 560
                top = word["top"] - 2
                left = page.crop((40, top, 300, bottom)).extract_text() or ""
                meaning = page.crop((300, top, 458, bottom)).extract_text() or ""
                usage = page.crop((458, top, 658, bottom)).extract_text() or ""
                tag_text = page.crop((658, top, 807, bottom)).extract_text() or ""
                formula, separator, citation = left.partition("First:")
                if not separator:
                    raise ValueError(f"Missing source for {word['text']}")
                source = SOURCE_RE.search("First:" + citation.replace("\n", " "))
                if not source:
                    raise ValueError(f"Unreadable source for {word['text']}: {citation}")
                category, number, paragraph, sentence, count = source.groups()
                essay = source_essays.get((source_categories.get(category, category), int(number)))
                entry = {
                    "id": word["text"],
                    "formula": normalized(formula.removeprefix(word["text"])),
                    "meaning": normalized(meaning),
                    "usage": normalized(usage),
                    "tags": list(dict.fromkeys(TAG_RE.findall(tag_text))),
                    "source": f"{category} · Model Essay {number} · P{paragraph} S{sentence}",
                    "sourceRows": int(count),
                    "example": source_example(essay, int(paragraph), int(sentence)),
                    "sourceUrl": (
                        f"writing-practice.html?exercise={essay['id']}" if essay else ""
                    ),
                }
                if not entry["formula"] or not entry["tags"]:
                    raise ValueError(f"Incomplete catalog entry: {entry['id']}")
                catalog.append(entry)
    if len(catalog) != 789 or len({row["id"] for row in catalog}) != 789:
        raise ValueError(f"Expected 789 unique structures; found {len(catalog)}")
    return catalog


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Pass the tagged PDF path")
    rows = read_catalog(sys.argv[1])
    OUTPUT.write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"Wrote {len(rows)} structures to {OUTPUT}")
    print(f"Examples: {sum(bool(row['example']) for row in rows)} / {len(rows)}")
