#!/usr/bin/env python3
"""Build the complete Relative Clauses grammar guide and diagnostic practice data."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "course-materials/grammar/source/relative-clauses-student-reading-guide-224.md"
OUTPUT = ROOT / "grammar-relative-clauses-data.js"
AUDIT_OUTPUT = ROOT / "course-materials/grammar/relative-clauses-source-map.json"

STEP_LABELS = (
    "① 先明白意思", "② 看英文例句", "③ 看中文意思",
    "④ 看為甚麼這樣寫", "⑤ 比較接近的寫法", "⑥ 最後看限制或例外",
)

ANSWERS = {
    **dict(zip([f"D{i:03d}" for i in range(1, 33)],
      "A C B D B A C B C D B D C B C A C B C D B A C A C A B C A B C B".split())),
    "D033":"whose", "D034":"who", "D035":"where", "D036":"when", "D037":"why",
    "D038":"whom", "D039":"which", "D040":"that", "D041":"what", "D042":"Whoever",
    "D043":"whichever", "D044":"being repaired", "D045":"to be signed", "D046":"on which",
    "D047":"The boy who lives next door is friendly.",
    "D048":"The bag that I lost is black.",
    "D049":"Nora, who lives nearby, is kind.",
    "D050":"The child whose father called is here.",
    "D051":"The seat on which I sat is broken.",
    "D052":"The food that I ordered has arrived.",
    "D053":"The lady who called me is waiting.",
    "D054":"The house which I visited was old.",
    "D055":"The bike, which I bought yesterday, is blue.",
    "D056":"The first student to arrive won a prize.",
    "D057":"The students who work here are friendly.",
    "D058":"The shop that I went to is closed.",
    "D059":"I remember the morning when we met.",
    "D060":"Maya, who helped us, is here.",
    "D061":"A nurse who lives next door helped us.",
    "D062":"I bought a laptop, which is very light.",
    "D063":"I met a student whose father is a doctor.",
    "D064":"This is the café where we met.",
    "D065":"I remember the day when we first met.",
    "D066":"I know the reason why he left.",
    "D067":"The bag I bought is new.",
    "D068":"The woman waiting outside is my aunt.",
    "D069":"The letter written by Ben is here.",
    "D070":"She was the first person to arrive.",
    "D071":"I kept what you gave me.",
    "D072":"The room in which we met was quiet.",
    **dict(zip([f"D{i:03d}" for i in range(73, 83)], "A B C A B B A C B B".split())),
}

TOPICS = {
    **{f"D{i:03d}": topic for i, topic in enumerate([
      "RC.05.03","RC.03.01","RC.07.01","RC.08.01","RC.08.04","RC.08.07","RC.02.08","RC.05.04",
      "RC.02.01","RC.03.13","RC.09.06","RC.06.11","RC.12.01","RC.03.09","RC.02.09","RC.02.09",
      "RC.07.01","RC.10.02","RC.11.05","RC.11.01","RC.11.07","RC.05.05","RC.08.01","RC.07.05",
      "RC.08.03","RC.14.01","RC.07.07","RC.02.02","RC.07.05","RC.06.12","RC.10.05","RC.07.07",
      "RC.07.01","RC.02.01","RC.08.01","RC.08.04","RC.08.07","RC.02.08","RC.05.03","RC.03.13",
      "RC.11.01","RC.11.07","RC.11.10","RC.09.06","RC.10.07","RC.02.09","RC.03.03","RC.03.04",
      "RC.05.03","RC.07.06","RC.02.10","RC.16.02","RC.03.03","RC.08.03","RC.03.04","RC.10.01",
      "RC.09.07","RC.03.22","RC.08.04","RC.05.03","RC.01.03","RC.05.02","RC.07.02","RC.08.01",
      "RC.08.04","RC.08.07","RC.03.13","RC.09.02","RC.09.04","RC.10.02","RC.11.01","RC.06.02",
      "RC.04.01","RC.05.08","RC.12.01","RC.04.01","RC.11.01","RC.11.04","RC.09.02","RC.09.04",
      "RC.10.03","RC.12.05"], start=1)},
}


def inline(value: str) -> str:
    escaped = html.escape(value.strip())
    escaped = re.sub(r"`(.+?)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"(?<!\*)\*([^*]+?)\*", r"<em>\1</em>", escaped)
    return escaped


def clean(value: str) -> str:
    return " ".join(line.strip().lstrip("> ") for line in value.strip().splitlines()).strip()


def plain(value: str) -> str:
    return re.sub(r"[*`]", "", value).strip()


def split_rules(source: str) -> list[dict]:
    start = source.index("# PART III")
    end = source.index("# PART IV", start)
    area = source[start:end]
    matches = list(re.finditer(r"^###\s+(RC\.\d{2}\.\d{2})\s+—\s+(.+)$", area, re.M))
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
                if found: later.append(marker.end() + found.start())
            stop = min(later) if later else len(block)
            step_source = block[marker.end():stop]
            # The source places each next numbered family heading between the final
            # rule of one family and the first rule of the next.  It is navigation,
            # not part of Eddy's rule-specific closing note.
            step_source = re.split(r"^\s*##\s+", step_source, maxsplit=1, flags=re.M)[0]
            values[label] = clean(step_source)
        rules.append({"id":match.group(1), "title":match.group(2).strip(), **values})
    if len(rules) != 224 or len({item["id"] for item in rules}) != 224:
        raise ValueError(f"Expected 224 unique rules; found {len(rules)}")
    return rules


def markdown_to_html(value: str, prefix: str) -> tuple[str, list[dict]]:
    """Convert the guide's controlled Markdown subset while preserving every paragraph/table/list."""
    lines = value.strip().splitlines()
    out, chapters = [], []
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line or line == "---": i += 1; continue
        heading = re.match(r"^(#{1,3})\s+(.+)$", line)
        if heading:
            level = min(3, len(heading.group(1)) + 1)
            title = plain(heading.group(2))
            anchor = f"{prefix}-{len(chapters) + 1}"
            if level == 2:
                chapters.append({"id":anchor, "title":title})
                out.append(f'<h2 id="{anchor}">{inline(title)}</h2>')
            else:
                out.append(f'<h{level}>{inline(title)}</h{level}>')
            i += 1; continue
        if line.startswith("|") and i + 1 < len(lines) and re.match(r"^\|?\s*:?-+", lines[i + 1]):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append([cell.strip() for cell in lines[i].strip().strip("|").split("|")]); i += 1
            header, body = rows[0], rows[2:]
            out.append('<div class="grammar-new-table-wrap"><table><thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in header) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in row) + '</tr>' for row in body) + '</tbody></table></div>')
            continue
        if re.match(r"^[-*] \[[ xX]\] ", line):
            items = []
            while i < len(lines) and re.match(r"^[-*] \[[ xX]\] ", lines[i]):
                checked = lines[i][3].lower() == "x"
                items.append(f'<li>{"✓ " if checked else "□ "}{inline(lines[i][6:])}</li>'); i += 1
            out.append('<ul class="grammar-source-checklist">' + ''.join(items) + '</ul>'); continue
        if re.match(r"^[-*] ", line):
            items = []
            while i < len(lines) and re.match(r"^[-*] ", lines[i]):
                items.append(f'<li>{inline(re.sub(r"^[-*] ", "", lines[i]))}</li>'); i += 1
            out.append('<ul>' + ''.join(items) + '</ul>'); continue
        if re.match(r"^\d+\. ", line):
            items = []
            while i < len(lines) and re.match(r"^\d+\. ", lines[i]):
                items.append(f'<li>{inline(re.sub(r"^\d+\. ", "", lines[i]))}</li>'); i += 1
            out.append('<ol>' + ''.join(items) + '</ol>'); continue
        if line.startswith(">"):
            quote = []
            while i < len(lines) and lines[i].startswith(">"):
                quote.append(lines[i].lstrip("> ")); i += 1
            out.append(f'<blockquote><p>{inline(" ".join(quote))}</p></blockquote>'); continue
        paragraph = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"^(#{1,3})\s|^---$|^[-*] |^\d+\. |^>|^\|", lines[i]):
            paragraph.append(lines[i].strip()); i += 1
        out.append(f'<p>{inline(" ".join(paragraph))}</p>')
    return "\n".join(out), chapters


def build_guide(source: str, rules: list[dict]) -> tuple[str, list[dict]]:
    part3 = source.index("# PART III")
    part4 = source.index("# PART IV", part3)
    part9 = source.index("# PART IX", part4)
    part10 = source.index("# PART X", part9)
    intro_html, intro_chapters = markdown_to_html(source[:part3], "relative-clauses-overview")
    appendix_html, appendix_chapters = markdown_to_html(source[part4:part9], "relative-clauses-reference")
    final_html, final_chapters = markdown_to_html(source[part10:], "relative-clauses-final")
    groups: list[tuple[str, list[dict]]] = []
    for rule in rules:
        family = rule["id"][:5]
        if not groups or groups[-1][0] != family: groups.append((family, []))
        groups[-1][1].append(rule)
    chunks = [intro_html]
    chapters = [*intro_chapters]
    for chapter_index, (family, family_rules) in enumerate(groups, 1):
        chapter_id = f"relative-clauses-rules-{chapter_index}"
        chapter_title = f"{family} · {family_rules[0]['title']}"
        chapters.append({"id":chapter_id, "title":chapter_title})
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


def split_diagnostics(source: str) -> list[dict]:
    start = source.index("### D001")
    end = source.index("# PART X", start)
    area = source[start:end]
    matches = list(re.finditer(r"^###\s+(D\d{3})\s*$", area, re.M))
    diagnostics = []
    for index, match in enumerate(matches):
        block = area[match.end(): matches[index + 1].start() if index + 1 < len(matches) else len(area)]
        translation_match = re.search(r"【(.+?)】", block, re.S)
        translation = clean(translation_match.group(1)) if translation_match else ""
        english = block[:translation_match.start()].strip() if translation_match else block.strip()
        english = re.sub(r"\n+(?:答案|完整句子|你的解釋)：_+", "", english).strip()
        flat = clean(english)
        option_matches = list(re.finditer(r"(?:\(([A-D])\)|\b([A-D])\.)\s*(.+?)(?=\s*(?:\([A-D]\)|\b[A-D]\.)|$)", flat))
        options = [{"label":item.group(1) or item.group(2), "text":plain(item.group(3)).rstrip(".")} for item in option_matches]
        prompt = re.sub(r"\s*(?:\([A-D]\)|\b[A-D]\.)\s*.+$", "", flat).strip() if options else flat
        diagnostics.append({"id":match.group(1), "prompt":prompt or flat, "translation":translation, "options":options})
    if len(diagnostics) != 82: raise ValueError(f"Expected 82 diagnostics; found {len(diagnostics)}")
    return diagnostics


def build_questions(diagnostics: list[dict], rules: list[dict]) -> list[dict]:
    rule_map = {rule["id"]:rule for rule in rules}
    questions = []
    for number, item in enumerate(diagnostics, 1):
        answer = ANSWERS[item["id"]]
        rule = rule_map[TOPICS[item["id"]]]
        if item["options"]:
            correct = answer
            answer_text = next(option["text"] for option in item["options"] if option["label"] == correct)
            mode, answers = "multiple-choice", [correct, answer_text]
        else:
            answer_text = answer
            mode = "self-review" if number in range(61, 73) else "exact"
            answers = [answer_text]
        section = "基本練習" if number <= 20 else "混合練習" if number <= 50 else "進階與理解"
        questions.append({
            "id":f"relative-clauses-{number:03d}", "diagnosticId":item["id"], "number":number,
            "section":section, "prompt":item["prompt"], "instruction":"按英文語境完成題目，並保留指定意思和資料。",
            "translation":item["translation"], "options":item["options"], "correctOption":answer if item["options"] else None,
            "answer":answer_text, "answers":answers, "mode":mode, "topic":rule["id"],
            "steps":[
                {"title":"步驟一：先明白題意", "body":f"這題表達：{item['translation']}"},
                {"title":"步驟二：認清題目要求", "body":"先找關係子句介紹的人、物、地方或整件事，再核對關係字、逗號、介詞和動詞形式。"},
                {"title":"步驟三：找出英文線索", "body":f"英文資料：{item['prompt']}"},
                {"title":"步驟四：套用對應規則", "body":f"{rule['id']}：{rule['title']}。{rule[STEP_LABELS[3]]}"},
                {"title":"步驟五：核對答案", "body":f"參考答案：{answer_text}"},
                {"title":"步驟六：排除容易混淆的寫法", "body":rule[STEP_LABELS[5]]},
                {"title":"步驟七：放回語境檢查", "body":f"再讀一次答案，確認它仍然表示：{item['translation']}"},
            ],
        })
    return questions


def main() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    rules = split_rules(source)
    guide_html, chapters = build_guide(source, rules)
    diagnostics = split_diagnostics(source)
    questions = build_questions(diagnostics, rules)
    guide = {"slug":"relative-clauses", "english":"Relative Clauses", "chinese":"關係子句", "count":len(rules),
             "practiceCount":len(questions), "html":guide_html, "chapters":chapters}
    practice = {"slug":"relative-clauses", "title":"Relative Clauses", "chinese":"關係子句", "questions":questions}
    payload = (
        "// Generated by tools/build-grammar-relative-clauses.py from the complete reviewed Relative Clauses student guide.\n"
        "(() => {\n"
        f"  const guide = Object.freeze({json.dumps(guide, ensure_ascii=False, separators=(',', ':'))});\n"
        f"  const practice = Object.freeze({json.dumps(practice, ensure_ascii=False, separators=(',', ':'))});\n"
        "  const guides = Array.isArray(window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA) ? [...window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA] : [];\n"
        "  if (!guides.some((item) => item.slug === guide.slug)) guides.push(guide);\n"
        "  window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA = guides;\n"
        "  const modules = Array.isArray(window.EDMUND_GRAMMAR_THREE_SETS) ? [...window.EDMUND_GRAMMAR_THREE_SETS] : [];\n"
        "  if (!modules.some((item) => item.slug === practice.slug)) modules.push(practice);\n"
        "  window.EDMUND_GRAMMAR_THREE_SETS = modules;\n"
        "  window.EDMUND_GRAMMAR_RELATIVE_CLAUSES = Object.freeze({ guide, practice });\n"
        "})();\n"
    )
    OUTPUT.write_text(payload, encoding="utf-8")
    AUDIT_OUTPUT.write_text(json.dumps({
        "source":str(SOURCE.relative_to(ROOT)),
        "guide":{"ruleCount":len(rules), "rules":[{"id":r["id"], "title":r["title"], "dialogueNote":r[STEP_LABELS[5]]} for r in rules]},
        "practice":{"questionCount":len(questions), "questions":[{"diagnosticId":q["diagnosticId"], "topic":q["topic"], "answer":q["answer"], "correctOption":q["correctOption"]} for q in questions]},
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(rules)} Relative Clauses guide cards and {len(questions)} exercises.")


if __name__ == "__main__": main()
