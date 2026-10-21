#!/usr/bin/env python3
"""Import the supplied Paper 4 teaching banks, excluding checklists and audit text.

Run with --source-dir pointing at the supplied Markdown directory. The importer
keeps only the learner-facing Part A/B argument units, models, structures and
synonym tables. It never infers an examination year from a publication date.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    "DSE_Paper4_Homeschooling_Hong_Kong_Gold_Enhanced.md",
    "DSE_Talent_Reality_TV_Speaking_Bank_Enhanced.md",
    "DSE_2024_Paper4_Tourism_Management_Complete_Speaking_Bank_Enhanced.md",
    "DSE_Paper4_Multifunctional_Cafes_Complete_Speaking_Bank_Enhanced.md",
    "DSE_Feeding_Communities.md",
    "DSE_Comfort_Food_Complete_Speaking_Bank_Enhanced.md",
    "DSE_2024_Paper4_Food_Delivery_Workers_Complete_Speaking_Bank_Enhanced.md",
    "DSE_2024_Paper4_Digital_Museums_Enhanced_Speaking_Bank.md",
    "DSE_2025_Paper4_Personal_Shopping_AI_Future_Retail_Complete_Speaking_Bank_Enhanced.md",
    "DSE_Once_in_a_Lifetime_Adventures_Speaking_Bank_Enhanced.md",
    "DSE_Paper4_Scouts_Create_a_Better_World_Complete_Speaking_Bank_Enhanced.md",
    "DSE_2025_Paper4_LinkedIn_Teens_Complete_Speaking_Bank_Enhanced.md",
    "DSE_Hong_Kong_Tourism_Speaking_Bank_Enhanced.md",
    "DSE_2025_Paper4_Second_Hand_Luxury_Clothes_Complete_Speaking_Bank_Enhanced.md",
]
ID = re.compile(r"^####\s+((?:A[123]|B[1-8])-[A-Z0-9]+)\s*[｜|]\s*(.+)")
QUESTION = re.compile(r"^###\s+Question\s+([1-8])\s*[.｜:：-]\s*(.+)", re.I)
YEAR = re.compile(r"\b(20(?:1[2-9]|2[0-6]))\s+HKDSE\b", re.I)


def clean(value: str) -> str:
    value = re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", value)
    return value.strip().strip("*` ")


def cells(line: str) -> list[str]:
    return [clean(x) for x in line.strip().strip("|").split("|")]


def english_lines(lines: list[str], start: int, end: int) -> str:
    for i in range(start, end):
        if "English linking paragraph" in lines[i] or "English integration paragraph" in lines[i]:
            for candidate in lines[i + 1:min(i + 5, end)]:
                if candidate.startswith("> "):
                    return candidate[2:].strip()
    return ""


def parse_argument(lines: list[str], start: int, end: int, angle: str) -> dict:
    match = ID.match(lines[start])
    assert match
    prose, glossary = [], []
    in_glossary = False
    for line in lines[start + 1:end]:
        if line.startswith("**Glossary") or line.startswith("**五項英中"):
            in_glossary = True
            continue
        if "English linking paragraph" in line or "English integration paragraph" in line:
            break
        if in_glossary and line.startswith("|"):
            row = cells(line)
            if len(row) >= 2 and row[0] and row[1] and not row[0].startswith(("English", "---")) and not set(row[0]) <= {"-", ":", " "}:
                glossary.append({"english": row[0], "chinese": row[1]})
        elif not in_glossary and line.strip() and not line.startswith(("**", "|", "---", ">", "#")):
            prose.append(clean(line))
    return {"id": match[1], "title": clean(match[2]), "angle": angle or "其他角度", "description": " ".join(prose), "glossary": glossary, "englishDemo": english_lines(lines, start, end)}


def split_alternatives(value: str) -> list[str]:
    value = re.split(r"<br\s*/?>", value, maxsplit=1, flags=re.I)[0]
    parts = re.split(r"\s*[；;·]\s*", value)
    if len(parts) == 1:
        parts = re.split(r"\s*,\s*(?=\*\*\d+\*\*\.|\d+[.)、])", value)
    if len(parts) == 1:
        parts = re.split(r"\s*\d+[.)、]\s*", value)
    return [clean(re.sub(r"^(?:\*\*)?\d+(?:\*\*)?[.)、]\s*", "", x)).replace("`", "") for x in parts if clean(x)]


def parse(path: Path) -> dict:
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    title_line = next((x for x in lines if x.startswith("# ")), path.stem)
    title = clean(re.split(r"\s*[—–]\s*", title_line[2:], maxsplit=1)[-1])
    year_match = YEAR.search(title_line) or re.search(r"(?:^|_)\b(20(?:1[2-9]|2[0-6]))\b", path.name)
    year = int(year_match[1]) if year_match else None
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:72]
    groups = [{"id": f"A{i}", "question": "", "angles": [], "arguments": []} for i in range(1, 4)]
    responses = [{"id": f"B{i}", "question": "", "angles": [], "arguments": [], "samples": []} for i in range(1, 9)]
    section = None
    angle = ""
    starts = [i for i, line in enumerate(lines) if ID.match(line)]
    boundaries = starts[1:] + [len(lines)]
    for start, next_start in zip(starts, boundaries):
        code = ID.match(lines[start])[1]
        # All of these sources use one contiguous Part A/B bank; never import
        # an argument printed in a later checklist or editorial appendix.
        preceding = lines[:start]
        if any(re.match(r"^##\s+.*(?:Checklist|檢查清單|QA|品質檢查)", x, re.I) for x in preceding[-35:]):
            continue
        target = groups[int(code[1]) - 1] if code[0] == "A" else responses[int(code[1]) - 1]
        heading = next((x for x in reversed(preceding) if x.startswith("## ") and "Part A" in x or x.startswith("## ") and "Part B" in x), "")
        if (code[0] == "A" and "Part A" not in heading) or (code[0] == "B" and "Part B" not in heading):
            continue
        local_angle = "其他角度"
        for heading_line in reversed(preceding):
            if heading_line.startswith("## "):
                break
            if re.match(rf"^###\s+{code[:2]}\s*[｜|]", heading_line):
                local_angle = clean(heading_line.split("｜", 1)[-1].split("|", 1)[-1])
                break
            if heading_line.startswith(("### 角度", "**角度", "**分析角度")):
                local_angle = clean(heading_line.split("｜", 1)[-1].split("：", 1)[-1])
                break
        # Stop at the next structural header, which protects the argument from
        # sample replies, later question headings and checklist notes.
        end = next((j for j in range(start + 1, next_start) if lines[j].startswith(("### ", "## "))), next_start)
        item = parse_argument(lines, start, end, local_angle)
        if item["glossary"] and item["description"]:
            target["arguments"].append(item)
            if item["angle"] not in target["angles"]:
                target["angles"].append(item["angle"])
    current_group = current_response = None
    in_bank = False
    model_label = "英文示範回應"
    for i, line in enumerate(lines):
        if line.startswith("## "):
            m = re.search(r"Part A.*?問題\s*([123一二三])", line)
            if not m and "Part A" in line:
                preceding = sum(bool(g["question"]) for g in groups)
                if preceding < 3 and re.match(r"^##\s+[一二三123]、Part A", line):
                    m = re.match(r".*", line)
                    index = preceding
                else:
                    index = None
            else:
                index = {"一": 0, "二": 1, "三": 2, "1": 0, "2": 1, "3": 2}[m[1]] if m else None
            if index is not None:
                current_group, current_response, in_bank = groups[index], None, True
                current_group["question"] = clean(line.split("｜", 1)[-1])
            elif "Part B" in line and re.match(r"^##\s+[四4]、Part B", line):
                current_group, current_response, in_bank = None, None, True
            elif in_bank and line.startswith("## "):
                current_group, current_response, in_bank = None, None, False
        q = QUESTION.match(line)
        if q and in_bank:
            current_response = responses[int(q[1]) - 1]
            current_response["question"] = clean(q[2])
        if current_response and in_bank:
            if re.match(r"^\*\*(?:Model [AB]|示範回應|英文個人回應)", line):
                model_label = clean(line)
            elif line.startswith("> ") and not line.startswith("> **") and not any(x in model_label.lower() for x in ("glossary", "paragraph")):
                if "Model " in model_label or "示範" in model_label:
                    value = clean(line[2:])
                    if value and len(value.split()) >= 15 and len(current_response["samples"]) < 2:
                        current_response["samples"].append({"label": model_label, "text": value})
    # Some books use an English prompt in the exam section but a Chinese Part A
    # heading. The heading is still a faithful learner-facing prompt summary.
    for i, group in enumerate(groups):
        group["question"] = group["question"] or f"Part A · 問題 {i + 1}"
    for i, response in enumerate(responses):
        response["question"] = response["question"] or f"Part B · Question {i + 1}"
    structures = []
    in_structures = False
    for line in lines:
        if line.startswith("## "):
            in_structures = bool(re.search(r"(?:functional|structure|frame|句式|口語框架)", line, re.I))
        if not in_structures:
            continue
        if not line.startswith("|"):
            continue
        row = cells(line)
        if len(row) >= 3 and re.fullmatch(r"(?:0?[1-9]|1\d|20)", row[0]) and re.search(r"[A-Za-z]{2}", row[1]):
            number = int(row[0])
            if not any(s["number"] == number for s in structures):
                structures.append({"number": number, "english": row[1], "purpose": row[2]})
    synonyms, category = [], "主題詞彙"
    in_synonyms = False
    for line in lines:
        if line.startswith("## "):
            in_synonyms = bool(re.search(r"(?:Synonym|Paraphrase|替代表達|主題詞語|主題關鍵詞)", line, re.I))
        if not in_synonyms:
            continue
        if line.startswith("### "):
            category = clean(line[4:].split("｜", 1)[-1])
        if line.startswith("|"):
            row = cells(line)
            if len(row) >= 3 and re.search(r"[A-Za-z]{2}", row[0]) and not re.search(r"Keyword|English|主題詞|關鍵詞", row[0], re.I):
                term = row[0].replace("**", "")
                chinese = row[1]
                alternative_cell = row[2]
                if len(row) == 3 and "（" in term and term.endswith("）"):
                    alternative_cell, chinese = row[1], ""
                    term, chinese = term.split("（", 1)
                    chinese = chinese[:-1]
                alternatives = split_alternatives(alternative_cell)
                if len(alternatives) == 5:
                    synonyms.append({"category": category, "keyword": term.strip(), "chinese": chinese, "alternatives": alternatives})
    return {"id": f"{year or 'undated'}-{slug}", "year": year, "title": f"{year or '年份未註明'} · {title}", "heroTitle": title,
            "sourceFile": path.name, "synonymWarning": "近義詞須按語境、詞性和語域選擇，不一定可以逐字互換。",
            "context": [], "groups": groups, "responses": responses, "structures": structures, "synonyms": synonyms}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, required=True)
    args = parser.parse_args()
    out = ROOT / "dse-argument-bank"
    manifest = []
    for name in SOURCES:
        source = args.source_dir / name
        if not source.exists():
            raise SystemExit(f"Missing source: {source}")
        data = parse(source)
        n = sum(len(s["arguments"]) for s in data["groups"] + data["responses"])
        if len(data["groups"]) != 3 or len(data["responses"]) != 8 or n < 100:
            raise SystemExit(f"Incomplete extraction: {name}: {n} arguments")
        filename = data["id"] + ".json"
        (out / filename).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        manifest.append({"file": filename, "id": data["id"], "year": data["year"], "arguments": n, "glossary": sum(len(a["glossary"]) for s in data["groups"] + data["responses"] for a in s["arguments"]), "demonstrations": sum(bool(a["englishDemo"]) for s in data["groups"] + data["responses"] for a in s["arguments"]), "synonyms": len(data["synonyms"])})
        print(f"{filename}: {n} arguments; {manifest[-1]['glossary']} glossary; {manifest[-1]['demonstrations']} demos; {len(data['synonyms'])} synonyms")
    (out / "import-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
