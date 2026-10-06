#!/usr/bin/env python3
"""Extract the two owner-supplied Churchill PDFs into private lesson JSON.

The PDFs contain one bilingual reading unit per page. Some vocabulary rows
continue on an otherwise empty page. This adapter preserves source page IDs,
removes documented clipboard overlays, and separates editorial section labels
from Churchill's words. Never publish its JSON as a static web asset.
"""

import argparse
from difflib import SequenceMatcher
import hashlib
import json
import logging
import re
from pathlib import Path

import pdfplumber

logging.getLogger("pdfminer").setLevel(logging.ERROR)
HAN = re.compile(r"[\u3400-\u9fff]")
NOTE = re.compile(r"^\d+\.\s")
FOOTER = "Knowledge pays the highest dividends"
OVERLAYS = ("Sun, Jun 28 at 3:08 PM ", "Pasted text (2) Pasted text ")
INTRO_TITLES = ("歷史背景", "演說的重要性", "演說之後", "語言與修辭", "人物與事件")


def join_wrapped(rows):
    result = " ".join(row.strip() for row in rows if row.strip())
    result = re.sub(r"(?<=[\u3400-\u9fff])\s+(?=[\u3400-\u9fff])", "", result)
    result = re.sub(r"\s+([，。；：！？）])", r"\1", result)
    return re.sub(r"（\s+", "（", result).strip()


def page_body(page):
    rows = (page.extract_text() or "").splitlines()
    if len(rows) < 3 or not rows[0].startswith("Edmund Education"):
        raise ValueError("Unexpected PDF page header")
    start = 3 if ("Victory in Europe, 1945" in rows[2] or "Invasion of France" in rows[2]) else 2
    result = []
    for row in rows[start:]:
        if FOOTER in row:
            break
        result.append(row)
    return result


def parse_note(raw):
    match = re.match(r"^\d+\.\s*(.+?)\s*（([^）]+)）\s*(?:[:：])?\s*(.*)$", raw)
    if not match:
        raise ValueError(f"Unparseable note: {raw[:100]}")
    title, title_zh, remainder = match.groups()
    parts = re.split(r"\bExamples?:\s*", remainder, maxsplit=1, flags=re.I)
    examples = []
    if len(parts) == 2:
        for example in re.finditer(r"([^（]+?)（([^）]+)）", parts[1]):
            english = example.group(1).strip().lstrip("/ ").strip()
            chinese = example.group(2).strip()
            examples.append({"english": english, "chinese": chinese})
        if len(examples) != 2:
            raise ValueError(f"Expected two translated examples: {raw[:100]}")
    return {
        "title_en": title.strip(), "title_zh": title_zh.strip(),
        "description_zh": parts[0].strip(), "examples": examples,
    }


def extract(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        introduction = []
        for number, title in enumerate(INTRO_TITLES, start=1):
            page = pdf.pages[number]
            body = page_body(page)
            if len(body) < 3 or not HAN.search(body[1]):
                raise ValueError(f"Missing introduction heading on page {number + 1}")
            text = join_wrapped(body[2:])
            highlighted = []
            for rectangle in page.rects:
                color = rectangle.get("non_stroking_color")
                if (rectangle["top"] < 100 or not isinstance(color, tuple) or
                    color not in ((1.0, 0.898, 0.6), (1.0, 0.851, 0.4))):
                    continue
                phrase = join_wrapped((page.crop((rectangle["x0"], rectangle["top"],
                                                 rectangle["x1"], rectangle["bottom"])).extract_text() or "").splitlines())
                if phrase not in text:
                    match = SequenceMatcher(None, phrase, text, autojunk=False).find_longest_match()
                    phrase = phrase[match.a:match.a + match.size]
                if len(phrase) >= 4 and phrase not in highlighted:
                    highlighted.append(phrase)
            introduction.append({"title": title, "text": text, "highlights": highlighted})
        groups = []
        for page_index in range(6, len(pdf.pages)):
            body = page_body(pdf.pages[page_index])
            if not body:
                continue
            first_note = next((i for i, row in enumerate(body) if NOTE.match(row)), len(body))
            first_chinese = next((i for i, row in enumerate(body[:first_note]) if HAN.search(row)), None)
            new_line = (first_chinese is not None and first_chinese > 0 and
                        not body[0].startswith(("Collocations 配詞:", "Examples:")))
            if new_line:
                groups.append({"page": page_index + 1,
                               "english": join_wrapped(body[:first_chinese]),
                               "tail": body[first_chinese:]})
            elif groups:
                groups[-1]["tail"].extend(body)
            else:
                raise ValueError(f"Orphan continuation on page {page_index + 1}")
        lines = []
        corrections = []
        for group in groups:
            tail = group["tail"]
            note_at = next((i for i, row in enumerate(tail) if NOTE.match(row)), len(tail))
            coll_at = next((i for i, row in enumerate(tail) if row.startswith("Collocations 配詞:")), len(tail))
            if note_at == len(tail) or coll_at == len(tail) or note_at >= coll_at:
                raise ValueError(f"Incomplete annotation on page {group['page']}")
            raw_notes, block = [], []
            for row in tail[note_at:coll_at]:
                if NOTE.match(row) and block:
                    raw_notes.append(join_wrapped(block))
                    block = []
                block.append(row)
            if block:
                raw_notes.append(join_wrapped(block))
            english = group["english"]
            for overlay in OVERLAYS:
                if overlay in english:
                    english = english.replace(overlay, "")
                    corrections.append({"page": group["page"], "removed_overlay": overlay.strip()})
            line = {
                "id": f"p{group['page']:03}", "source_page": group["page"],
                "english": english, "chinese": join_wrapped(tail[:note_at]),
                "notes": [parse_note(note) for note in raw_notes],
                "collocations": join_wrapped(tail[coll_at:]),
            }
            if not line["english"] or not line["chinese"] or not line["notes"]:
                raise ValueError(f"Incomplete bilingual unit on page {group['page']}")
            lines.append(line)
    return introduction, lines, corrections


def find_start(lines, prefix):
    positions = [i for i, line in enumerate(lines) if line["english"].startswith(prefix)]
    if len(positions) != 1:
        raise ValueError(f"Ambiguous section start: {prefix}")
    return positions[0]


def build(path, edition):
    introduction, lines, corrections = extract(path)
    if edition == "ve":
        if len(lines) != 86 or not lines[0]["english"].startswith("Yesterday morning") or not lines[-1]["english"].endswith("former times."):
            raise ValueError("VE Day line sequence changed")
        chapters = [
            ("Yesterday morning", "投降文書", "投降"),
            ("Hostilities will end", "停火與海峽群島", "停火"),
            ("Today, perhaps", "勝利日與盟友", "盟友"),
            ("The German war is", "戰爭回顧", "回顧"),
            ("Our gratitude", "感恩與未竟之戰", "責任"),
            ("That is the message", "下議院續言", "議會"),
            ("I recollect well", "感恩動議", "感恩"),
        ]
        title = "Victory in Europe, 1945"
        title_zh = "歐洲勝利：廣播與下議院續言"
        slug = "churchill-victory-europe-1945"
        source_url = "https://winstonchurchill.hillsdale.edu/victory-in-europe/"
        source_note = "BBC 8 May 1945 broadcast (lines 1-56), followed by Churchill's House of Commons remarks (lines 57-86)."
        paragraph_prefixes = ["Yesterday morning", "General Bedell Smith", "Today this agreement", "The German representatives", "Hostilities will end", "The Germans are still", "It is not surprising", "This does not", "Today, perhaps", "The German war is", "After years of intense", "After gallant France", "Finally almost", "Our gratitude", "We may allow", "Japan, with", "We must now", "Advance, Britannia", "That is the message", "They will convey", "We have all", "I wish to give", "I recollect well", "That this House", "This is the identical"]
    elif edition == "dday":
        if len(lines) != 148 or not lines[0]["english"].startswith("The House should") or not lines[-1]["english"].endswith("good friendship."):
            raise ValueError("D-Day line sequence changed")
        marker_at = find_start(lines, "[Editor’s Note:")
        lines.pop(marker_at)
        corrections.append({"page": 111, "removed_editorial_line": "Later-statement marker moved into section metadata"})
        lines.insert(0, {"id": "hansard-opening", "source_page": None,
                         "english": "I must apologise to the House for having delayed them, but Questions were gone through rather more rapidly than usual.",
                         "chinese": "我必須向本院致歉，讓各位久等了；今天的質詢比平常更快結束。",
                         "notes": [], "collocations": "", "editorial_completion": True})
        later_at = find_start(lines, "I have been at the centres")
        lines.insert(later_at, {"id": "hansard-later-opening", "source_page": None,
                                "english": "I promised to report to the House later on in the Sitting.",
                                "chinese": "我曾答應在本次會議稍後向本院報告。",
                                "notes": [], "collocations": "", "editorial_completion": True})
        omitted_at = find_start(lines, "I will not give lists")
        lines[omitted_at]["english"] = lines[omitted_at]["english"].replace("they represent—", "they represent or the States they represent—")
        lines[omitted_at]["chinese"] = "我不會逐一列出他們的各種國籍，也不會列出他們所代表的國家——"
        corrections.append({"page": lines[omitted_at]["source_page"], "restored_from_hansard": "or the States they represent"})
        aircraft_at = find_start(lines, "The Anglo-American Allies are sustained")
        lines[aircraft_at]["english"] = lines[aircraft_at]["english"].replace("firstline aircraft", "first-line aircraft")
        corrections.append({"page": lines[aircraft_at]["source_page"], "spelling_normalized_against_hansard": "firstline → first-line"})
        chapters = [
            ("I must apologise", "羅馬解放", "羅馬"),
            ("Meanwhile, the great", "義大利戰局", "義大利"),
            ("At what was judged", "盟軍推進羅馬", "推進"),
            ("I have also to announce", "諾曼第登陸", "登陸"),
            ("And what a plan", "龐大作戰計畫", "計畫"),
            ("I promised to report", "稍後戰況報告", "戰況"),
            ("But all this", "審慎展望", "展望"),
        ]
        title = "Invasion of France, 1944"
        title_zh = "盟軍進攻法國：下議院兩次報告"
        slug = "churchill-invasion-france-1944"
        source_url = "https://api.parliament.uk/historic-hansard/commons/1944/jun/06/liberation-of-rome-landings-in-france"
        source_note = "The supplied annotated PDF follows Churchill's two 6 June 1944 Commons reports. Hansard was used to restore omitted opening words and one phrase; other PDF wording variants are retained."
        paragraph_prefixes = ["I must apologise", "This is a memorable", "The original landing", "The losses on both", "Meanwhile, the great", "At what was judged", "The Allied Forces, with great", "The American and other", "However, General Alexander", "The Allied Forces, with the Americans", "It would be futile", "It is our duty", "In General Clark", "We must await", "I have also to announce", "An immense armada", "I cannot, of course", "And what a plan", "There are already hopes", "The battle that has", "Complete unity prevails", "The ardour and spirit", "I promised to report", "Many dangers and difficulties", "The passage of the sea", "The outstanding feature", "But all this", "It is, therefore", "Thank God"]
    else:
        raise ValueError("Unknown edition")
    chapter_data = [{"first": find_start(lines, prefix) + 1, "title": full, "short": short} for prefix, full, short in chapters]
    paragraph_starts = sorted(set(find_start(lines, prefix) for prefix in paragraph_prefixes) | {0})
    if chapter_data[0]["first"] != 1 or paragraph_starts[0] != 0:
        raise ValueError("Invalid first chapter/paragraph")
    if any(chapter["first"] not in {i + 1 for i in paragraph_starts} for chapter in chapter_data):
        paragraph_starts = sorted(set(paragraph_starts) | {chapter["first"] - 1 for chapter in chapter_data})
    for index, line in enumerate(lines):
        line["id"] = f"{slug}-l{index+1:03}"
    return {
        "slug": slug, "title": title, "title_zh": title_zh, "speaker": "Winston Churchill",
        "year": 1945 if edition == "ve" else 1944,
        "source_url": source_url, "source_note": source_note,
        "source_pdf_sha256": hashlib.sha256(Path(path).read_bytes()).hexdigest(),
        "introduction": introduction, "chapters": chapter_data,
        "paragraph_starts": paragraph_starts, "lines": lines,
        "import_audit": {"pdf_pages": 95 if edition == "ve" else 155,
                         "notes": sum(len(line["notes"]) for line in lines),
                         "corrections": corrections},
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("edition", choices=("ve", "dday"))
    parser.add_argument("source_pdf", type=Path)
    parser.add_argument("output_json", type=Path)
    args = parser.parse_args()
    result = build(args.source_pdf, args.edition)
    args.output_json.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    print(f"{result['slug']}: {len(result['lines'])} lines; {result['import_audit']['notes']} notes")
