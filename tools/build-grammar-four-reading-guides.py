#!/usr/bin/env python3
"""Build four complete reading-only Grammar modules from canonical Markdown."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "grammar-four-reading-guides-data.js"
AUDIT_OUTPUT = ROOT / "course-materials/grammar/four-reading-guides-source-map.json"
STEP_LABELS = (
    "① 先明白意思",
    "② 看英文例句",
    "③ 看中文意思",
    "④ 看為甚麼這樣寫",
    "⑤ 比較接近的寫法",
    "⑥ 最後看限制或例外",
)
GUIDES = (
    {
        "slug": "comparative-superlative", "prefix": "CS", "count": 319,
        "english": "Comparative & Superlative", "chinese": "比較級與最高級",
        "source": "comparative-superlative-student-reading-guide-319.md",
        "sourceDocument": "Comparative & Superlative — Complete Student Reading Guide (319 Rules).docx",
        "tables": 12,
    },
    {
        "slug": "dependent-independent-clauses", "prefix": "CL", "count": 316,
        "english": "Dependent & Independent Clauses", "chinese": "從屬子句與獨立子句",
        "source": "dependent-independent-clauses-student-reading-guide-316.md",
        "sourceDocument": "Dependent & Independent Clauses — Complete Student Reading Guide.docx",
        "tables": 12,
    },
    {
        "slug": "adverbs-of-frequency", "prefix": "AF", "count": 265,
        "english": "Adverbs of Frequency", "chinese": "頻率副詞",
        "source": "adverbs-of-frequency-student-reading-guide-265.md",
        "sourceDocument": "Adverbs of Frequency — Complete Student Reading Guide (265 Lessons).docx",
        "tables": 10,
    },
    {
        "slug": "parts-of-speech-functions", "prefix": "WC", "count": 309,
        "english": "Parts of Speech & Grammatical Functions", "chinese": "詞類與句子功能",
        "source": "parts-of-speech-functions-student-reading-guide-309.md",
        "sourceDocument": "Parts of Speech & Grammatical Functions — Student Reading Guide (309 lessons).docx",
        "tables": 9,
    },
)


def inline(value: str) -> str:
    escaped = html.escape(value.strip()).replace("&lt;br&gt;", "<br>")
    escaped = re.sub(r"`(.+?)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"(?<!\*)\*([^*]+?)\*", r"<em>\1</em>", escaped)
    return escaped


def plain(value: str) -> str:
    return re.sub(r"[*`]", "", value).strip()


def step_lines(value: str) -> list[str]:
    return [line.strip().lstrip("> ") for line in value.strip().splitlines() if line.strip()]


def split_rules(source: str, config: dict) -> tuple[str, list[tuple[str, list[dict]]]]:
    start = source.index("# PART III")
    end = source.index("# PART IV", start)
    area = source[start:end]
    part_title = re.search(r"^#\s+(PART III.+)$", area, re.M).group(1)
    family_matches = list(re.finditer(r"^##\s+((?:\d{2}｜|第\s*\d+\s*組｜).+)$", area, re.M))
    rule_matches = list(re.finditer(rf"^###\s+({config['prefix']}\.\d{{2}}\.\d{{2}})\s+[—-]\s+(.+)$", area, re.M))
    rules = []
    for index, match in enumerate(rule_matches):
        block = area[match.end(): rule_matches[index + 1].start() if index + 1 < len(rule_matches) else len(area)]
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
            raw = re.split(r"^\s*##\s+", block[marker.end():stop], maxsplit=1, flags=re.M)[0]
            values[label] = step_lines(raw)
        family = next((item.group(1) for item in reversed(family_matches) if item.start() < match.start()), None)
        if not family:
            raise ValueError(f"{match.group(1)} has no authored family heading")
        rules.append({"id": match.group(1), "title": match.group(2).strip(), "family": family, **values})
    if len(rules) != config["count"] or len({rule["id"] for rule in rules}) != config["count"]:
        raise ValueError(f"Expected {config['count']} unique rules; found {len(rules)}")
    minimum_shape = [1, 1, 1, 1, 1, 1]
    for rule in rules:
        actual = [len(rule[label]) for label in STEP_LABELS]
        if any(value < minimum for value, minimum in zip(actual, minimum_shape)):
            raise ValueError(f"{rule['id']} has step shape {actual}; expected at least {minimum_shape}")
    notes = ["\n".join(rule[STEP_LABELS[-1]]) for rule in rules]
    if len(set(notes)) != config["count"]:
        raise ValueError(f"Every {config['english']} card must have a unique Eddy teaching note")
    groups = []
    for rule in rules:
        if not groups or groups[-1][0] != rule["family"]:
            groups.append((rule["family"], []))
        groups[-1][1].append(rule)
    return part_title, groups


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
        if re.match(r"^[-*•] ", line):
            items = []
            while index < len(lines) and re.match(r"^[-*•] ", lines[index]):
                items.append(f'<li>{inline(re.sub(r"^[-*•] ", "", lines[index]))}</li>')
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
        while index < len(lines) and lines[index].strip() and not re.match(r"^(#{1,3})\s|^[-*•] |^\d+\. |^>|^\|", lines[index]):
            paragraph.append(lines[index].strip())
            index += 1
        output.append(f'<p>{inline(" ".join(paragraph))}</p>')
    return "\n".join(output), chapters


def labelled_paragraph(label: str, lines: list[str]) -> str:
    return f'<p><strong>{inline(label)}</strong><br>{"<br>".join(inline(line) for line in lines)}</p>'


def build_guide(source: str, config: dict) -> tuple[str, list[dict], list[dict]]:
    part3 = source.index("# PART III")
    part4 = source.index("# PART IV", part3)
    intro_html, intro_chapters = markdown_to_html(source[:part3], f"{config['slug']}-overview")
    appendix_html, appendix_chapters = markdown_to_html(source[part4:], f"{config['slug']}-reference")
    part_title, groups = split_rules(source, config)
    part_id = f"{config['slug']}-rules-1"
    chunks = [intro_html, f'<h2 id="{part_id}">{inline(part_title)}</h2>']
    chapters = [*intro_chapters, {"id": part_id, "title": part_title}]
    flat_rules = []
    for family_index, (family_title, family_rules) in enumerate(groups, 1):
        family_id = f"{config['slug']}-rules-family-{family_index:02d}"
        chunks.append(f'<h2 id="{family_id}">{inline(family_title)}</h2>')
        chapters.append({"id": family_id, "title": family_title})
        for rule in family_rules:
            flat_rules.append(rule)
            chunks.extend((
                f'<h3 data-concept-number="{rule["id"]}">{inline(rule["title"])}</h3>',
                labelled_paragraph(STEP_LABELS[0], rule[STEP_LABELS[0]]),
                f'<blockquote>{labelled_paragraph(STEP_LABELS[1], rule[STEP_LABELS[1]])}</blockquote>',
                labelled_paragraph(STEP_LABELS[2], rule[STEP_LABELS[2]]),
                labelled_paragraph(STEP_LABELS[3], rule[STEP_LABELS[3]]),
                f'<blockquote>{labelled_paragraph(STEP_LABELS[4], rule[STEP_LABELS[4]])}</blockquote>',
                labelled_paragraph(STEP_LABELS[5], rule[STEP_LABELS[5]]),
            ))
    chunks.append(appendix_html)
    chapters.extend(appendix_chapters)
    return "\n".join(chunks), chapters, flat_rules


def main() -> None:
    guides = []
    audits = []
    for config in GUIDES:
        source_path = ROOT / "course-materials/grammar/source" / config["source"]
        source = source_path.read_text(encoding="utf-8")
        if "而是" in source or "jayden" in source.lower():
            raise ValueError(f"Prohibited wording remains in {source_path}")
        guide_html, chapters, rules = build_guide(source, config)
        if len(re.findall(rf'data-concept-number="{config["prefix"]}\.\d{{2}}\.\d{{2}}"', guide_html)) != config["count"]:
            raise ValueError(f"Generated card count drifted for {config['slug']}")
        if guide_html.count("<table>") != config["tables"]:
            raise ValueError(f"Generated table count drifted for {config['slug']}")
        for part in ["PART IV", "PART V", "PART VI", "PART VII", "PART VIII", "PART IX", "PART X"]:
            if part not in guide_html:
                raise ValueError(f"{part} missing from {config['slug']}")
        guide = {
            "slug": config["slug"], "english": config["english"], "chinese": config["chinese"],
            "count": config["count"], "practiceCount": 0, "readingOnly": True,
            "html": guide_html, "chapters": chapters,
        }
        guides.append(guide)
        audits.append({
            "slug": config["slug"], "source": str(source_path.relative_to(ROOT)),
            "sourceDocument": config["sourceDocument"], "ruleCount": config["count"],
            "tableCount": config["tables"], "readingOnly": True,
            "rules": [{"id": rule["id"], "title": rule["title"], "dialogueNote": rule[STEP_LABELS[-1]][0]} for rule in rules],
        })
    payload = (
        "// Generated by tools/build-grammar-four-reading-guides.py from four reviewed student guides.\n"
        "(() => {\n"
        f"  const incoming = {json.dumps(guides, ensure_ascii=False, separators=(',', ':'))};\n"
        "  const guides = Array.isArray(window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA) ? [...window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA] : [];\n"
        "  for (const guide of incoming) if (!guides.some((item) => item.slug === guide.slug)) guides.push(Object.freeze(guide));\n"
        "  window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA = guides;\n"
        "  window.EDMUND_GRAMMAR_FOUR_READING_GUIDES = Object.freeze({ guides: incoming });\n"
        "})();\n"
    )
    OUTPUT.write_text(payload, encoding="utf-8")
    AUDIT_OUTPUT.write_text(json.dumps({"guides": audits}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built {sum(config['count'] for config in GUIDES)} cards across four reading-only Grammar guides.")


if __name__ == "__main__":
    main()
