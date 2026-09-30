#!/usr/bin/env python3
"""Convert the approved Golden Manual Markdown lessons to website modules."""

import json
import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parents[1] / "Synonym_Lessons_Rebuild/rebuild_0001_0100/lessons"
OUT = ROOT / "synonyms/lessons-data.mjs"
ORDER_OUT = ROOT / "synonyms/module-order-03-102.csv"


def plain(value):
    value = re.sub(r"\*\*([^*]+)\*\*", r"\1", value.strip())
    return re.sub(r"\*([^*]+)\*", r"\1", value)


def field(block, name):
    match = re.search(r"^\*\*" + re.escape(name) + r"\*\*\s*(.*)$", block, re.M)
    if not match:
        raise ValueError(f"Missing {name}: {block[:120]!r}")
    return plain(match.group(1))


def section(text, start, end):
    match = re.search(r"^## " + re.escape(start) + r"[^\n]*\n(.*?)(?=^## " + re.escape(end) + r"|\Z)", text, re.M | re.S)
    if not match:
        raise ValueError(f"Missing section {start}")
    return match.group(1).strip()


def audit_table(block):
    rows = []
    for line in block.splitlines():
        if line.startswith("|"):
            cells = [plain(cell) for cell in line.strip().strip("|").split("|")]
            if cells and not all(re.fullmatch(r"[-: ]+", cell) for cell in cells):
                rows.append(cells)
    trailing = re.sub(r"(?m)^\|.*\n?", "", block).strip()
    return {"headers": rows[0] if rows else [], "rows": rows[1:], "note": plain(trailing)}


def parse(path):
    text = path.read_text(encoding="utf-8")
    fm = text.split("---", 2)[1]
    source_id = int(re.search(r"^id:\s*(\d+)$", fm, re.M).group(1))
    headword = re.search(r'^headword:\s*"(.*)"$', fm, re.M).group(1)
    status = re.search(r'^lesson_status:\s*"(.*)"$', fm, re.M).group(1)
    if status != "QA passed":
        raise ValueError(f"Not approved: {path}")
    title_line = re.search(r"^# (.+)$", text, re.M).group(1)
    title, _, title_zh = title_line.partition(" · ")
    guide = section(text, "3.", "4.")
    source_map = audit_table(section(text, "2.", "3."))
    false = section(text, "4.", "5.")
    practice = section(text, "5.", "6.")
    quick_choice = audit_table(section(text, "6.", "7."))
    words = []
    for match in re.finditer(r"^### (\d{2}) ([^\n]+?) · ([^\n]+)\n(.*?)(?=^### |\Z)", guide, re.M | re.S):
        n, word, meaning, body = match.groups()
        words.append({
            "order": int(n), "word": word.strip(), "meaning": meaning.strip(),
            "note": field(body, "詞義與用法："),
            "collocations": field(body, "常見搭配："),
            "example": field(body, "例句："),
            "exampleZh": field(body, "中文翻譯："),
            "contrast": field(body, "辨析："), "exercises": [],
        })
    if not words:
        raise ValueError(f"No guide words: {path}")
    false_items = []
    for match in re.finditer(r"^### \d{2} ([^\n]+)\n(.*?)(?=^### |\Z)", false, re.M | re.S):
        heading, body = match.groups()
        english = re.search(r"^\*\*English contrast:\*\*\s*(.+)$", body, re.M)
        chinese = body[:english.start()].strip() if english else body.strip()
        false_items.append({"word": heading.strip(), "zh": plain(chinese.replace("\n", " ")), "point": plain(english.group(1)) if english else ""})
    if not false_items:
        raise ValueError(f"No false synonyms: {path}")
    exercises = list(re.finditer(r"^### (\d{2})\.(\d) · 練習\n(.*?)(?=^### |\Z)", practice, re.M | re.S))
    for match in exercises:
        wi, ei, body = match.groups()
        index = int(wi) - 1
        if index >= len(words):
            raise ValueError(f"Bad word index: {path}")
        context = re.search(r"\*\*Read the context · 閱讀語境\*\*\s*\n\s*\n(.*?)\n\s*\n\*\*中文翻譯\*\*", body, re.S)
        zh = re.search(r"\*\*中文翻譯\*\*\s*\n\s*\n(.*?)\n\s*\nA\.", body, re.S)
        rewrite = re.search(r"\*\*Correct rewrite · 正確改寫\*\*\s*\n\s*\n(.*?)\n\s*\n\*\*Option feedback", body, re.S)
        answer = re.search(r"^\*\*Answer:\*\*\s*([A-F])\.\s*(.+)$", body, re.M)
        if not all((context, zh, rewrite, answer)):
            raise ValueError(f"Incomplete exercise {wi}.{ei}: {path}")
        options = dict(re.findall(r"^([A-F])\.\s*(.+)$", body, re.M))
        feedback = {letter: explanation for letter, _label, explanation in
                    re.findall(r"^- \*\*([A-F])\. (.+?)\*\* — (.+)$", body, re.M)}
        if len(options) != 6 or len(feedback) != 6:
            raise ValueError(f"Six options/feedback missing {wi}.{ei}: {path}")
        option_list = []
        for letter in "ABCDEF":
            feedback_line = feedback[letter]
            option_list.append({"letter": letter, "text": options[letter].strip(), "explanation": plain(feedback_line)})
        if options[answer.group(1)].strip() != answer.group(2).strip():
            raise ValueError(f"Answer mismatch {wi}.{ei}: {path}")
        words[index]["exercises"].append({
            "number": int(ei), "original": context.group(1).strip(), "zh": zh.group(1).strip(),
            "upgrade": rewrite.group(1).strip(), "answer": answer.group(2).strip(), "options": option_list,
        })
    if any(len(w["exercises"]) != 2 for w in words):
        raise ValueError(f"Expected two questions per alternative: {path}")
    source = section(text, "1.", "2.").split("\n\n")[0]
    return {
        "id": None, "sourceId": source_id, "headword": headword, "title": title,
        "titleZh": title_zh, "subtitle": title_zh,
        "description": plain(source), "sourceSense": plain(source),
        "sourceMap": source_map, "quickChoice": quick_choice,
        "words": words, "falseSynonyms": false_items,
    }


# Approximate everyday English frequency, prioritising common general vocabulary.
# The values are source lesson IDs. Related inflections are kept separate because
# the approved lessons teach different grammatical uses.
FREQUENCY_ORDER = [
    2,7,58,50,61,59,21,13,79,46,96,66,41,85,88,9,19,18,60,33,39,6,91,97,98,31,
    70,63,69,52,17,42,43,82,51,8,92,93,89,83,86,87,14,3,5,4,1,99,57,34,30,56,
    76,77,84,90,20,54,11,12,35,22,25,26,28,80,81,73,74,100,40,67,68,47,48,49,
    55,65,36,37,38,15,23,24,27,29,32,44,45,53,64,71,72,75,78,94,95,62,10,16,
]


def main():
    files = sorted(SOURCE.glob("*.md"))
    if len(files) != 100:
        raise ValueError(f"Expected 100 files, found {len(files)}")
    lessons = {lesson["sourceId"]: lesson for lesson in (parse(path) for path in files)}
    if set(lessons) != set(FREQUENCY_ORDER):
        raise ValueError(f"Frequency order missing/duplicate IDs: {set(lessons) ^ set(FREQUENCY_ORDER)}")
    ordered = []
    for module_number, source_id in enumerate(FREQUENCY_ORDER, 3):
        item = lessons[source_id]
        item["id"] = f"lesson-{module_number:03d}"
        item["moduleNumber"] = module_number
        ordered.append(item)
    OUT.write_text("// Generated from approved Golden Manual Markdown. Run tools/import-synonym-lessons.py.\n"
                   + "export const lessons = " + json.dumps(ordered, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    with ORDER_OUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(["module_number", "headword", "source_lesson_id", "taught_alternatives", "questions"])
        for item in ordered:
            writer.writerow([item["moduleNumber"], item["headword"], item["sourceId"], len(item["words"]), sum(len(word["exercises"]) for word in item["words"])])
    print(f"{len(ordered)} modules; {sum(len(m['words']) for m in ordered)} alternatives; "
          f"{sum(len(w['exercises']) for m in ordered for w in m['words'])} questions; "
          f"{OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
