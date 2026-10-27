#!/usr/bin/env python3
"""Compile the three teaching-only grammar manuscripts into a static browser asset."""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "content" / "grammar-curations"
LESSONS = [
    ("so", "So / So That / So As To", "結果、目的及相關用法", "S", 30),
    ("modal", "Modal Verbs", "情態動詞", "M", 42),
    ("unless", "Unless", "除非與條件", "U", 24),
]


def inline(value: str) -> str:
    chunks: list[str] = []

    def code(match: re.Match[str]) -> str:
        chunks.append("<code>" + html.escape(match.group(1)) + "</code>")
        return f"\x00{len(chunks) - 1}\x00"

    value = re.sub(r"`([^`]+)`", code, value)
    value = html.escape(value)
    value = re.sub(r"\[([^\]]+)\]\((https?://[^\s)]+)\)", lambda m: f'<a href="{m.group(2)}" rel="noopener noreferrer" target="_blank">{m.group(1)}</a>', value)
    value = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", value)
    value = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", value)
    return re.sub(r"\x00(\d+)\x00", lambda m: chunks[int(m.group(1))], value)


def render(markdown: str, slug: str) -> tuple[str, list[dict[str, str]]]:
    lines = markdown.splitlines()
    out: list[str] = []
    chapters: list[dict[str, str]] = []
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        stripped = line.strip()
        if not stripped:
            i += 1
            continue
        heading = re.match(r"^(#{1,3})\s+(.+)$", stripped)
        if heading:
            level, title = len(heading.group(1)), heading.group(2)
            if level == 1:
                i += 1
                continue
            ident = f"{slug}-section-{len(chapters) + 1}" if level == 2 else None
            if ident:
                chapters.append({"id": ident, "title": title})
                out.append(f'<h2 id="{ident}">{inline(title)}</h2>')
            else:
                out.append(f"<h3>{inline(title)}</h3>")
            i += 1
            continue
        if re.match(r"^-{3,}$", stripped):
            out.append("<hr>")
            i += 1
            continue
        if stripped.startswith("|") and i + 1 < len(lines) and re.match(r"^\|[\s:|\-]+\|$", lines[i + 1].strip()):
            header = [part.strip() for part in stripped.strip("|").split("|")]
            i += 2
            rows: list[list[str]] = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append([part.strip() for part in lines[i].strip().strip("|").split("|")])
                i += 1
            out.append('<div class="grammar-new-table-wrap"><table><thead><tr>' + "".join(f"<th>{inline(part)}</th>" for part in header) + "</tr></thead><tbody>" + "".join("<tr>" + "".join(f"<td>{inline(part)}</td>" for part in row) + "</tr>" for row in rows) + "</tbody></table></div>")
            continue
        if stripped.startswith(">"):
            quoted: list[str] = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quoted.append(lines[i].strip().lstrip(">").strip())
                i += 1
            out.append("<blockquote>" + "<br>".join(inline(part) for part in quoted) + "</blockquote>")
            continue
        if re.match(r"^(?:\d+\.|[-*])\s+", stripped):
            numbered = bool(re.match(r"^\d+\.\s+", stripped))
            tag = "ol" if numbered else "ul"
            entries: list[str] = []
            while i < len(lines) and re.match(r"^(?:\d+\.|[-*])\s+", lines[i].strip()):
                entries.append(re.sub(r"^(?:\d+\.|[-*])\s+", "", lines[i].strip()))
                i += 1
            out.append(f"<{tag}>" + "".join(f"<li>{inline(part)}</li>" for part in entries) + f"</{tag}>")
            continue
        paragraph = [stripped]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"^(?:#{1,3}\s|[-*]\s|\d+\.\s|\||>|---+$)", lines[i].strip()):
            paragraph.append(lines[i].strip())
            i += 1
        out.append("<p>" + "<br>".join(inline(part) for part in paragraph) + "</p>")
    return "\n".join(out), chapters


result = []
for slug, english, chinese, prefix, count in LESSONS:
    text = (SOURCE / f"{slug}.md").read_text(encoding="utf-8")
    ids = re.findall(rf"^### ({prefix}\d\d)｜", text, flags=re.M)
    assert ids == [f"{prefix}{number:02d}" for number in range(1, count + 1)], (slug, ids)
    assert not re.search(r"^## [六七八]、練習", text, re.M), slug
    rendered, chapters = render(text, slug)
    result.append({"slug": slug, "english": english, "chinese": chinese, "count": count, "html": rendered, "chapters": chapters})

(ROOT / "grammar-new-curations-data.js").write_text(
    "window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA = " + json.dumps(result, ensure_ascii=False, separators=(",", ":")) + ";\n",
    encoding="utf-8",
)
print("Built teaching-only lessons:", ", ".join(f"{item['slug']} {item['count']} points" for item in result))
