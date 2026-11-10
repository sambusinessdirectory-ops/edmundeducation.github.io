#!/usr/bin/env python3
"""Build the complete reading-only Conditionals grammar module."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "course-materials/grammar/source/conditionals-student-reading-guide-298.md"
OUTPUT = ROOT / "grammar-conditionals-data.js"
AUDIT_OUTPUT = ROOT / "course-materials/grammar/conditionals-source-map.json"
STEP_LABELS = (
    "① 先明白意思",
    "② 看英文例句",
    "③ 看中文意思",
    "④ 看為甚麼這樣寫",
    "⑤ 比較接近的寫法",
    "⑥ 最後看限制或例外",
)


def inline(value: str) -> str:
    escaped = html.escape(value.strip())
    escaped = re.sub(r"`(.+?)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"(?<!\*)\*([^*]+?)\*", r"<em>\1</em>", escaped)
    return escaped


def plain(value: str) -> str:
    return re.sub(r"[*`]", "", value).strip()


def clean(value: str) -> str:
    return " ".join(line.strip().lstrip("> ") for line in value.strip().splitlines()).strip()


def split_rules(source: str) -> list[dict]:
    start = source.index("# PART III")
    end = source.index("# PART IV", start)
    area = source[start:end]
    matches = list(re.finditer(r"^###\s+(CD\.\d{2}\.\d{2})\s+—\s+(.+)$", area, re.M))
    rules = []
    for index, match in enumerate(matches):
        block = area[match.end(): matches[index + 1].start() if index + 1 < len(matches) else len(area)]
        values = {}
        for step_index, label in enumerate(STEP_LABELS):
            marker = re.search(rf"^\*\*{re.escape(label)}\*\*\s*$", block, re.M)
            if not marker:
                raise ValueError(f"{match.group(1)} is missing {label}")
            later = []
            for next_label in STEP_LABELS[step_index + 1:]:
                found = re.search(rf"^\*\*{re.escape(next_label)}\*\*\s*$", block[marker.end():], re.M)
                if found:
                    later.append(marker.end() + found.start())
            stop = min(later) if later else len(block)
            step_source = re.split(r"^\s*##\s+", block[marker.end():stop], maxsplit=1, flags=re.M)[0]
            values[label] = clean(step_source)
        rules.append({"id": match.group(1), "title": match.group(2).strip(), **values})
    if len(rules) != 298 or len({rule["id"] for rule in rules}) != 298:
        raise ValueError(f"Expected 298 unique rules; found {len(rules)}")
    if len({rule[STEP_LABELS[-1]] for rule in rules}) != 298:
        raise ValueError("Every Conditionals card must have a unique Eddy teaching note")
    return rules


def markdown_to_html(value: str, prefix: str) -> tuple[str, list[dict]]:
    lines = value.strip().splitlines()
    output, chapters = [], []
    index = 0
    while index < len(lines):
        line = lines[index].rstrip()
        if not line or line.startswith("<!--"):
            index += 1
            continue
        heading = re.match(r"^(#{1,3})\s+(.+)$", line)
        if heading:
            level = min(3, len(heading.group(1)) + 1)
            title = plain(heading.group(2))
            anchor = f"{prefix}-{len(chapters) + 1}"
            if level == 2:
                chapters.append({"id": anchor, "title": title})
                output.append(f'<h2 id="{anchor}">{inline(title)}</h2>')
            else:
                output.append(f'<h{level}>{inline(title)}</h{level}>')
            index += 1
            continue
        if line.startswith("|") and index + 1 < len(lines) and re.match(r"^\|?\s*:?-+", lines[index + 1]):
            rows = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                rows.append([cell.strip().replace("\\|", "|") for cell in lines[index].strip().strip("|").split("|")])
                index += 1
            header, body = rows[0], rows[2:]
            output.append('<div class="grammar-new-table-wrap"><table><thead><tr>' + ''.join(f'<th>{inline(cell)}</th>' for cell in header) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{inline(cell)}</td>' for cell in row) + '</tr>' for row in body) + '</tbody></table></div>')
            continue
        if re.match(r"^[-*] ", line):
            items = []
            while index < len(lines) and re.match(r"^[-*] ", lines[index]):
                items.append(f'<li>{inline(re.sub(r"^[-*] ", "", lines[index]))}</li>')
                index += 1
            output.append('<ul>' + ''.join(items) + '</ul>')
            continue
        if re.match(r"^\d+\. ", line):
            items = []
            while index < len(lines) and re.match(r"^\d+\. ", lines[index]):
                items.append(f'<li>{inline(re.sub(r"^\d+\. ", "", lines[index]))}</li>')
                index += 1
            output.append('<ol>' + ''.join(items) + '</ol>')
            continue
        if line.startswith(">"):
            quote = []
            while index < len(lines) and lines[index].startswith(">"):
                quote.append(lines[index].lstrip("> "))
                index += 1
            output.append(f'<blockquote><p>{inline(" ".join(quote))}</p></blockquote>')
            continue
        paragraph = [line]
        index += 1
        while index < len(lines) and lines[index].strip() and not re.match(r"^(#{1,3})\s|^[-*] |^\d+\. |^>|^\|", lines[index]):
            paragraph.append(lines[index].strip())
            index += 1
        output.append(f'<p>{inline(" ".join(paragraph))}</p>')
    return "\n".join(output), chapters


def build_guide(source: str, rules: list[dict]) -> tuple[str, list[dict]]:
    part3 = source.index("# PART III")
    part4 = source.index("# PART IV", part3)
    part9 = source.index("# PART IX", part4)
    part10 = source.index("# PART X", part9)
    intro_html, intro_chapters = markdown_to_html(source[:part3], "conditionals-overview")
    appendix_html, appendix_chapters = markdown_to_html(source[part4:part9], "conditionals-reference")
    final_html, final_chapters = markdown_to_html(source[part10:], "conditionals-final")
    groups: list[tuple[str, list[dict]]] = []
    for rule in rules:
        family = rule["id"][:5]
        if not groups or groups[-1][0] != family:
            groups.append((family, []))
        groups[-1][1].append(rule)
    chunks = [intro_html]
    chapters = [*intro_chapters]
    for chapter_index, (family, family_rules) in enumerate(groups, 1):
        chapter_id = f"conditionals-rules-{chapter_index}"
        chapter_title = f"{family} · {family_rules[0]['title']}"
        chapters.append({"id": chapter_id, "title": chapter_title})
        chunks.append(f'<h2 id="{chapter_id}">{inline(chapter_title)}</h2>')
        for rule in family_rules:
            chunks.extend((
                f'<h3 data-concept-number="{rule["id"]}">{inline(rule["title"])}</h3>',
                f'<p>{inline(rule[STEP_LABELS[0]])}</p>',
                f'<blockquote><p>{inline(rule[STEP_LABELS[1]])}</p></blockquote>',
                f'<p><strong>中文意思</strong>　{inline(rule[STEP_LABELS[2]])}</p>',
                f'<p><strong>為甚麼這樣寫</strong>　{inline(rule[STEP_LABELS[3]])}</p>',
                f'<blockquote><p><strong>比較接近的寫法</strong>　{inline(rule[STEP_LABELS[4]])}</p></blockquote>',
                f'<p>{inline(rule[STEP_LABELS[5]])}</p>',
            ))
    chunks.extend((appendix_html, final_html))
    chapters.extend(appendix_chapters + final_chapters)
    return "\n".join(chunks), chapters


def main() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    if "而是" in source:
        raise ValueError("Prohibited Chinese sentence structure remains in the canonical source")
    rules = split_rules(source)
    guide_html, chapters = build_guide(source, rules)
    guide = {
        "slug": "conditionals",
        "english": "Conditionals",
        "chinese": "條件句",
        "count": len(rules),
        "practiceCount": 0,
        "readingOnly": True,
        "html": guide_html,
        "chapters": chapters,
    }
    payload = (
        "// Generated by tools/build-grammar-conditionals.py from the reviewed 298-rule Conditionals guide.\n"
        "(() => {\n"
        f"  const guide = Object.freeze({json.dumps(guide, ensure_ascii=False, separators=(',', ':'))});\n"
        "  const guides = Array.isArray(window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA) ? [...window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA] : [];\n"
        "  if (!guides.some((item) => item.slug === guide.slug)) guides.push(guide);\n"
        "  window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA = guides;\n"
        "  window.EDMUND_GRAMMAR_CONDITIONALS = Object.freeze({ guide });\n"
        "})();\n"
    )
    OUTPUT.write_text(payload, encoding="utf-8")
    AUDIT_OUTPUT.write_text(json.dumps({
        "source": str(SOURCE.relative_to(ROOT)),
        "sourceDocument": "Conditionals — Complete Student Reading Guide (298 lessons).docx",
        "guide": {
            "ruleCount": len(rules),
            "readingOnly": True,
            "rules": [{"id": rule["id"], "title": rule["title"], "dialogueNote": rule[STEP_LABELS[-1]]} for rule in rules],
        },
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(rules)} Conditionals guide cards (reading-only).")


if __name__ == "__main__":
    main()
