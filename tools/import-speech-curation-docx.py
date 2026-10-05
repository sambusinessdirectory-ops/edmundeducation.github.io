#!/usr/bin/env python3
"""Extract the Churchill lesson's line-level notes from the supplied DOCX.

Usage: python3 tools/import-speech-curation-docx.py source.docx output.json
The output contains the complete supplied text and must be uploaded to the
private speech database; it is not a public website asset.
"""

import json
import sys
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
HEADER = "The Council of Europe, 1949  ( 歐洲理事會)"


def paragraphs(path):
    root = ElementTree.fromstring(ZipFile(path).read("word/document.xml"))
    for paragraph in root.iter(W + "p"):
        value = "".join(node.text or "" for node in paragraph.iter(W + "t")).strip()
        if value:
            yield value


def extract(path):
    source = list(paragraphs(path))
    introduction = [
        {"title": "歷史背景", "text": source[3]},
        {"title": "演說的重要性", "text": "\n".join(source[6:8])},
        {"title": "演說之後", "text": source[10]},
        {"title": "語言與修辭", "text": source[13]},
        {"title": "人物與事件", "text": source[16]},
    ]
    groups, current = [], []
    for item in source[17:]:
        if item.startswith(HEADER):
            continue
        current.append(item)
        if item.startswith("Collocations 配詞:"):
            groups.append(current)
            current = []
    if current or len(groups) != 222:
        raise ValueError(f"Unexpected annotation structure: {len(groups)} groups")
    lines = []
    for group in groups:
        english, chinese, *details = group
        if not details[-1].startswith("Collocations 配詞:"):
            raise ValueError(f"Missing collocations for {english}")
        if english == "We must feel our way forward" and any(
            line["english"] == english for line in lines
        ):
            continue  # The DOCX repeats this complete block; the speech does not.
        lines.append({
            "english": english,
            "chinese": chinese,
            "notes": details[:-1],
            "collocations": details[-1],
        })
    if len(lines) != 221:
        raise ValueError(f"Expected 221 transcript lines, got {len(lines)}")
    if not lines[0]["english"].startswith("Mr. President") or not lines[-1]["english"].endswith("worst of misery."):
        raise ValueError("Transcript does not span the complete speech")
    return {
        "title": "The Council of Europe, 1949",
        "speaker": "Winston Churchill",
        "source_url": "https://www.nationalchurchillmuseum.org/the-council-of-europe.html",
        "introduction": introduction,
        "lines": lines,
    }


if __name__ == "__main__":
    result = extract(sys.argv[1])
    Path(sys.argv[2]).write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    print(f"Extracted {len(result['lines'])} lines, {sum(len(x['notes']) for x in result['lines'])} notes")
