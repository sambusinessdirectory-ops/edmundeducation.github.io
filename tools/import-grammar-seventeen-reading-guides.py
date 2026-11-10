#!/usr/bin/env python3
"""Import the seventeen reviewed Grammar reading guides into canonical Markdown.

DOCX blocks are read in their authored XML order. PDF pages are reconstructed from
positioned words so that the two PDF-only guides retain their visible reading order.
Every import is checked for ten parts, the complete unique rule set, and six teaching
steps per rule before it is allowed into the site build.
"""

from __future__ import annotations

import hashlib
import logging
import re
import unicodedata
from pathlib import Path

import pdfplumber
from docx import Document
from docx.document import Document as DocumentObject
from docx.table import Table
from docx.text.paragraph import Paragraph

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "course-materials/grammar/source"
DOWNLOADS = Path("/Users/sammak/Downloads")

STEP_LABELS = (
    "① 先明白意思", "② 看英文例句", "③ 看中文意思", "④ 看為甚麼這樣寫",
    "⑤ 比較接近的寫法", "⑥ 最後看限制或例外",
)
LABEL_ALIASES = {
    "④ 為甚麼這樣寫": STEP_LABELS[3],
    "1 先明白意思": STEP_LABELS[0], "2 看英文例句": STEP_LABELS[1],
    "3 看中文意思": STEP_LABELS[2], "4 為甚麼這樣寫": STEP_LABELS[3],
    "4 看為甚麼這樣寫": STEP_LABELS[3], "5 比較接近的寫法": STEP_LABELS[4],
    "6 最後看限制或例外": STEP_LABELS[5],
}

GUIDES = (
    ("abstract-meaning", "AB", 342, "Abstract Meaning", "抽象詞類與相關結構", "Abstract_Nouns_Verbs_Adjectives_Adverbs_and_Related_Structures_Complete_Student_Reading_Guide_v1.0.md"),
    ("sentence-fragments", "FR", 196, "Sentence Fragments", "句子片段", "Sentence Fragments — Complete Student Reading Guide (196 Rules).docx"),
    ("misplaced-dangling-modifiers", "MM", 232, "Misplaced & Dangling Modifiers", "錯置與懸垂修飾語", "Misplaced & Dangling Modifiers — Complete Student Reading Guide (232 lessons).docx"),
    ("reporting-structures", "RPT", 312, "Reporting Structures", "轉述結構", "Reporting Structures — Complete Student Reading Guide (312 Lessons).docx"),
    ("auxiliary-verbs", "AU", 270, "Auxiliary Verbs — BE, HAVE & DO", "助動詞 BE、HAVE 與 DO", "Auxiliary Verbs — BE, HAVE & DO Complete Student Reading Guide.docx"),
    ("conjunctions-connectives", "CL", 258, "Conjunctions & Connectives", "連接詞與連接語", "Conjunctions and Connectives — Complete Student Reading Guide (258 lessons).pdf"),
    ("subjunctive", "SJB", 182, "Subjunctive", "假設語氣", "Subjunctive — Complete Student Reading Guide (182 Rules).docx"),
    ("imperatives", "IMP", 310, "Imperatives", "祈使句", "Imperatives — Complete Student Reading Guide Positive, Negative, Let's, Polite Commands & Cookbook Instructions.docx"),
    ("negation-negatives", "NEG", 292, "Negation & Negatives", "否定句", "Negation & Negatives — Complete Student Reading Guide (292 Rules).docx"),
    ("reflexive-verbs-pronouns", "RF", 260, "Reflexive Verbs & Pronouns", "反身動詞與代名詞", "Reflexive Verbs & Pronouns — Complete Student Reading Guide (260 Lessons).docx"),
    ("non-finite-verbs", "NF", 270, "Non-finite Verbs", "非限定動詞", "Non-finite Verbs — Gerund vs Infinitive vs Bare Infinitive (270 lessons).docx"),
    ("question-tags", "QT", 236, "Question Tags", "附加問句", "Question Tags — Complete Student Reading Guide (236 Lessons).docx"),
    ("either-or-neither-nor", "EO", 196, "Either…Or / Neither…Nor", "Either…Or 與 Neither…Nor", "Either Or Neither Nor — Complete Student Reading Guide (196 Rules).docx"),
    ("that-clauses", "TC", 233, "That-clauses", "That 子句", "That-clauses — Complete Student Reading Guide (233 lessons).pdf"),
    ("subject-object-pronouns", "PR", 237, "Subject & Object Pronouns", "主格與受格代名詞", "Pronouns — Subject Pronouns & Object Pronouns Complete Student Reading Guide.docx"),
    ("whether-vs-if", "WI", 186, "Whether vs If", "Whether 與 If", "Whether vs If — Complete Student Reading Guide (186 lessons).docx"),
    ("all-question-forms", "QF", 322, "All Question Forms", "各類問句", "All Question Forms — Complete Student Reading Guide (322 Lessons).docx"),
)


def clean(value: str) -> str:
    sentinels = {mark: f"__STEP_MARK_{index}__" for index, mark in enumerate("①②③④⑤⑥", 1)}
    sentinels["｜"] = "__FULLWIDTH_DIVIDER__"
    for mark, sentinel in sentinels.items():
        value = value.replace(mark, sentinel)
    value = unicodedata.normalize("NFKC", value.replace("\r", ""))
    for mark, sentinel in sentinels.items():
        value = value.replace(sentinel, mark)
    value = "\n".join(line.rstrip() for line in value.splitlines()).strip()
    # The product's established Chinese style rule bans this construction. Preserve
    # the meaning while retaining every authored statement.
    value = re.sub(r"([^，。；\n]+)不是([^，。；\n]+)，?而是", r"\1並非\2；重點是", value)
    value = value.replace("，而是", "；重點是").replace("而是", "改為")
    return value


def iter_blocks(parent: DocumentObject):
    for child in parent.element.body.iterchildren():
        if child.tag.endswith("}p"):
            yield Paragraph(child, parent)
        elif child.tag.endswith("}tbl"):
            yield Table(child, parent)


def table_markdown(table: Table) -> list[str]:
    rows = [[clean(cell.text).replace("\n", "<br>") for cell in row.cells] for row in table.rows]
    if not rows:
        return []
    width = max(map(len, rows))
    rows = [row + [""] * (width - len(row)) for row in rows]
    esc = lambda text: text.replace("|", "\\|")
    return [
        "| " + " | ".join(map(esc, rows[0])) + " |",
        "| " + " | ".join("---" for _ in range(width)) + " |",
        *("| " + " | ".join(map(esc, row)) + " |" for row in rows[1:]),
    ]


def split_inline_label(text: str) -> tuple[str | None, str]:
    for label in (*STEP_LABELS, *LABEL_ALIASES):
        if text == label:
            return LABEL_ALIASES.get(label, label), ""
        if text.startswith(label + " "):
            return LABEL_ALIASES.get(label, label), text[len(label):].strip()
    return None, text


def paragraph_markdown(text: str, prefix: str, in_rules: bool) -> list[str]:
    text = clean(text)
    if not text:
        return []
    if text.startswith("PART "):
        return [f"# {text}"]
    if in_rules and re.match(rf"^{prefix}\.\d{{2}}\.\d{{2}}\s+[—-]\s+", text):
        return [f"### {text}"]
    if (re.match(r"^\d{2}｜", text) or re.match(r"^第\s*\d+\s*組｜", text)
            or re.match(r"^(?:[IVX]+|\d+)\.\d+(?:\.\d+)?\s+", text)):
        return [f"## {text}"]
    if not in_rules:
        return [text]
    label_forms = sorted((*STEP_LABELS, *LABEL_ALIASES), key=len, reverse=True)
    marker = re.compile("(" + "|".join(map(re.escape, label_forms)) + ")")
    pieces = marker.split(text)
    if len(pieces) == 1:
        return [text]
    output = []
    for piece in pieces:
        piece = piece.strip()
        if not piece:
            continue
        label = LABEL_ALIASES.get(piece, piece if piece in STEP_LABELS else None)
        output.append(f"**{label}**" if label else piece)
    return output


def import_docx(source: Path, prefix: str) -> str:
    output: list[str] = []
    inside_part3 = False
    in_rules = False
    for block in iter_blocks(Document(source)):
        if isinstance(block, Paragraph):
            text = clean(block.text)
            if text.startswith("PART III"):
                inside_part3 = True
            elif text.startswith("PART IV"):
                inside_part3 = False
                in_rules = False
            elif inside_part3 and re.match(rf"^{prefix}\.\d{{2}}\.\d{{2}}\s+[—-]\s+", text):
                in_rules = True
            output.extend(paragraph_markdown(text, prefix, in_rules))
        else:
            output.extend(table_markdown(block))
        output.append("")
    return "\n".join(output).strip() + "\n"


def physical_lines(page) -> list[str]:
    words = page.extract_words(x_tolerance=1, y_tolerance=2, use_text_flow=False)
    rows: list[list] = []
    for word in sorted(words, key=lambda item: (item["top"], item["x0"])):
        if not rows or abs(word["top"] - rows[-1][0]) >= 8:
            rows.append([word["top"], [(word["x0"], word["text"])]])
        else:
            rows[-1][1].append((word["x0"], word["text"]))
    return [clean(" ".join(text for _, text in sorted(words))) for _, words in rows]


def smart_join(lines: list[str]) -> str:
    result = ""
    for line in (clean(item) for item in lines if clean(item)):
        if not result:
            result = line
        elif re.search(r"[A-Za-z0-9,.;:!?)}\]]$", result) and re.match(r"[A-Za-z0-9({\[]", line):
            result += " " + line
        else:
            result += line
    return result


def pdf_rules(lines: list[str], prefix: str) -> list[dict]:
    header_re = re.compile(rf"^{prefix}\.\d{{2}}\.\d{{2}}\s+[—-]\s*(.*)$")
    indices = [index for index, line in enumerate(lines) if header_re.match(line)]
    rules = []
    for pos, start in enumerate(indices):
        end = indices[pos + 1] if pos + 1 < len(indices) else len(lines)
        block = lines[start:end]
        match = header_re.match(block[0])
        label_positions = []
        for index, line in enumerate(block[1:], 1):
            normalized = LABEL_ALIASES.get(line, line if line in STEP_LABELS else None)
            if normalized:
                label_positions.append((index, normalized))
        if len(label_positions) < 6:
            continue
        label_positions = label_positions[:6]
        title = smart_join([match.group(1), *block[1:label_positions[0][0]]])
        steps = {}
        for step_index, (label_at, label) in enumerate(label_positions):
            stop = label_positions[step_index + 1][0] if step_index + 1 < 6 else len(block)
            values = [item for item in block[label_at + 1:stop] if item]
            family_at = next((i for i, item in enumerate(values) if re.match(r"^(?:第.*組[｜|]|PART\s+)", item)), None)
            if family_at is not None:
                values = values[:family_at]
            if step_index == 4:
                split = next((i for i, item in enumerate(values[1:], 1) if re.search(r"[\u3400-\u9fff]", item)), 1)
                steps[label] = [smart_join(values[:split]), smart_join(values[split:])]
            else:
                steps[label] = [smart_join(values)]
        rules.append({"id": block[0].split()[0], "title": title, "steps": steps})
    return rules


def import_pdf(source: Path, prefix: str) -> str:
    logging.getLogger("pdfminer").setLevel(logging.ERROR)
    with pdfplumber.open(source) as document:
        pages = [physical_lines(page) for page in document.pages]
    flat = [line for page in pages for line in page if line]
    part_pages = {}
    for index, lines in enumerate(pages):
        text = " ".join(lines)
        for roman in ("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"):
            if re.search(rf"PART {roman}(?:\s|$)", text) and roman not in part_pages:
                part_pages[roman] = index
    if set(part_pages) != {"I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"}:
        raise ValueError(f"Could not locate all ten PDF parts in {source.name}: {part_pages}")
    rules_area = [line for page in pages[part_pages["III"]:part_pages["IV"] + 1] for line in page]
    rules_area = rules_area[:next(index for index, line in enumerate(rules_area) if line.startswith("PART IV"))]
    rules = pdf_rules(rules_area, prefix)
    first_rule = next(index for index, line in enumerate(flat) if re.match(rf"^{prefix}\.01\.01\s+[—-]", line))
    first_part4 = next(index for index, line in enumerate(flat) if line.startswith("PART IV"))
    intro = flat[:first_rule]
    appendix = flat[first_part4:]
    output = []
    current_part = ""
    for line in intro:
        if line.startswith("PART "):
            current_part = line
            output.append(f"# {line}")
        elif re.match(r"^\d{2}｜", line) or re.match(r"^[IVX]+\.\d+", line):
            output.append(f"## {line}")
        else:
            output.append(line)
        output.append("")
    if not any(line.startswith("# PART III") for line in output):
        output.extend(["# PART III — Comprehensive Rule Encyclopedia｜完整規則百科", ""])
    family = None
    for rule in rules:
        next_family = rule["id"].split(".")[1]
        if next_family != family:
            family = next_family
            output.extend([f"## {family}｜規則組 {family}", ""])
        output.extend([f"### {rule['id']} — {rule['title']}", ""])
        for label in STEP_LABELS:
            output.extend([f"**{label}**", *rule["steps"][label], ""])
    for line in appendix:
        output.append(f"# {line}" if line.startswith("PART ") else line)
        output.append("")
    return "\n".join(output).strip() + "\n"


def validate(content: str, prefix: str, count: int, source: Path) -> None:
    start = content.index("# PART III")
    end = content.index("# PART IV", start)
    rules_area = content[start:end]
    ids = re.findall(rf"^###\s+({prefix}\.\d{{2}}\.\d{{2}})\s+[—-]", rules_area, re.M)
    if len(ids) != count or len(set(ids)) != count:
        raise ValueError(f"{source.name}: expected {count} unique rules, found {len(ids)} ({len(set(ids))} unique)")
    for label in STEP_LABELS:
        actual = len(re.findall(rf"^\*\*{re.escape(label)}\*\*$", rules_area, re.M))
        if actual != count:
            raise ValueError(f"{source.name}: {label} occurs {actual}, expected {count}")
    if len(re.findall(r"^# PART (?:I|II|III|IV|V|VI|VII|VIII|IX|X)\b", content, re.M)) != 10:
        raise ValueError(f"{source.name}: all ten parts were not preserved exactly once")
    if "而是" in content or "jayden" in content.lower():
        raise ValueError(f"{source.name}: prohibited wording remains")


def main() -> None:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    for slug, prefix, count, _english, _chinese, filename in GUIDES:
        source = DOWNLOADS / filename
        if source.suffix.lower() == ".docx":
            body = import_docx(source, prefix)
        elif source.suffix.lower() == ".pdf":
            body = import_pdf(source, prefix)
        else:
            body = clean(source.read_text(encoding="utf-8")) + "\n"
        header = (
            "<!-- Generated by tools/import-grammar-seventeen-reading-guides.py. -->\n"
            f"<!-- Source: {source.name}; SHA-256: {hashlib.sha256(source.read_bytes()).hexdigest()} -->\n\n"
        )
        content = header + body
        validate(content, prefix, count, source)
        output = SOURCE_DIR / f"{slug}-student-reading-guide-{count}.md"
        output.write_text(content, encoding="utf-8")
        print(f"Imported {count:>3} rules: {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
