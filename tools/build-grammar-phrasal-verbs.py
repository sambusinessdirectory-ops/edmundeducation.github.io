#!/usr/bin/env python3
"""Build the complete Phrasal Verbs grammar guide and diagnostic practice data."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "course-materials/grammar/source/phrasal-verbs-student-reading-guide-v2.md"
OUTPUT = ROOT / "grammar-phrasal-verbs-data.js"
AUDIT_OUTPUT = ROOT / "course-materials/grammar/phrasal-verbs-source-map.json"

STEP_LABELS = (
    "① 先明白意思", "② 看英文例句", "③ 看中文意思",
    "④ 看為甚麼這樣寫", "⑤ 比較接近的寫法", "⑥ 最後看限制或例外",
)

ANSWERS = {
    "D001":"A", "D002":"She looks after her little brother when their parents work late.", "D003":"B",
    "D004":"A", "D005":"She didn't come in yesterday because she was ill.", "D006":"B", "D007":"B",
    "D008":"got up", "D009":"of", "D010":"B", "D011":"B", "D012":"gave away",
    "D013":"The teacher handed them out.", "D014":"B", "D015":"Please hand it in by Friday.", "D016":"A",
    "D017":"They made up.", "D018":"gave up", "D019":"A", "D020":"sped up",
    "D021":"I will give it back tomorrow.", "D022":"A", "D023":"The plane took off from the runway at noon.",
    "D024":"A", "D025":"A", "D026":"A", "D027":"The match was called off.",
    "D028":"The child was looked after by his aunt.", "D029":"A", "D030":"I finally worked it out.",
    "D031":"A", "D032":"Dad talked me out of buying the expensive phone.", "D033":"A", "D034":"A",
    "D035":"I ran into my old teacher at the mall.", "D036":"A",
    "D037":"The manager will look into it tomorrow.", "D038":"A", "D039":"A", "D040":"saving up",
    "D041":"B", "D042":"writing", "D043":"B", "D044":"A", "D045":"went",
    "D046":"My worn-out shoes need replacing.", "D047":"The plane will take off soon.",
    "D048":"I work out every morning.", "D049":"A", "D050":"up", "D051":"through", "D052":"A",
    "D053":"A", "D054":"A", "D055":"The child was looked after by the nurse.", "D056":"A",
    "D057":"I wonder who she looks after.", "D058":"This is the coat that you took off.", "D059":"A",
    "D060":"showed up", "D061":"away", "D062":"A", "D063":"dropped off",
    "D064":"I asked them not to let anyone else in on the secret.",
    "D065":"call off 表示取消比賽；put off 表示把比賽延期，並非取消。",
    "D066":"兩句都自然。turn off 是可分開的組合，普通名詞 lamp 可放在 off 前或後。",
    "D067":"look after 是不能分開的組合；him 必須放在 after 後面，所以應寫 She looked after him.",
    "D068":"The plane took off 中 take off 表示飛機起飛，不接物件；She took off her coat 中 take off 表示脫去某物，所以要接 coat。",
    "D069":"hope 後的 to 是不定詞標記，所以接 see；look forward to 中的 to 是介詞，所以接 seeing。",
    "D070":"got away with 表示他作弊後沒有受到應有的懲罰或追究。",
    "D071":"說話者重讀 UP 和 DOWN 作對比；他不要對方調高聲量，而要把聲量調低。",
    "D072":"look up to 是以 to 結尾的三字組合；關係代名詞省略後，to 可保留在關係子句句尾。",
    "D073":"something heavy 是較長的普通名詞組，可放在 picked up 後；it 是代字，必須放在 picked 和 up 中間。",
    "D074":"turned",
}

TOPICS = {
    "D001":"PV.06.10", "D002":"PV.09.01", "D003":"PV.04.05", "D004":"PV.08.01",
    "D005":"PV.03.08", "D006":"PV.03.03", "D007":"PV.07.06", "D008":"PV.04.02",
    "D009":"PV.12.14", "D010":"PV.12.01", "D011":"PV.02.04", "D012":"PV.05.02",
    "D013":"PV.02.04", "D014":"PV.05.04", "D015":"PV.02.04", "D016":"PV.08.14",
    "D017":"PV.09.05", "D018":"PV.07.07", "D019":"PV.05.03", "D020":"PV.06.09",
    "D021":"PV.02.04", "D022":"PV.10.06", "D023":"PV.02.10", "D024":"PV.09.03",
    "D025":"PV.05.20", "D026":"PV.07.07", "D027":"PV.03.12", "D028":"PV.03.13",
    "D029":"PV.08.01", "D030":"PV.02.04", "D031":"PV.05.02", "D032":"PV.12.08",
    "D033":"PV.15.07", "D034":"PV.05.05", "D035":"PV.05.18", "D036":"PV.11.06",
    "D037":"PV.02.05", "D038":"PV.09.05", "D039":"PV.08.14", "D040":"PV.10.04",
    "D041":"PV.09.02", "D042":"PV.12.04", "D043":"PV.12.05", "D044":"PV.08.06",
    "D045":"PV.15.11", "D046":"PV.14.11", "D047":"PV.14.12", "D048":"PV.14.12",
    "D049":"PV.12.11", "D050":"PV.11.18", "D051":"PV.05.23", "D052":"PV.10.10",
    "D053":"PV.07.12", "D054":"PV.11.16", "D055":"PV.03.13", "D056":"PV.09.07",
    "D057":"PV.13.05", "D058":"PV.13.02", "D059":"PV.12.12", "D060":"PV.05.17",
    "D061":"PV.15.08", "D062":"PV.08.07", "D063":"PV.11.09", "D064":"PV.15.02",
    "D065":"PV.07.06", "D066":"PV.02.03", "D067":"PV.02.05", "D068":"PV.02.01",
    "D069":"PV.12.01", "D070":"PV.11.14", "D071":"PV.14.01", "D072":"PV.13.04",
    "D073":"PV.02.17", "D074":"PV.13.16",
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
    matches = list(re.finditer(r"^###\s+(PV\.\d{2}\.\d{2})\s+—\s+(.+)$", area, re.M))
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
            values[label] = clean(block[marker.end():stop])
        rules.append({"id":match.group(1), "title":match.group(2).strip(), **values})
    if len(rules) != 240 or len({item["id"] for item in rules}) != 240:
        raise ValueError(f"Expected 240 unique rules; found {len(rules)}")
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
    intro_html, intro_chapters = markdown_to_html(source[:part3], "phrasal-verbs-overview")
    appendix_html, appendix_chapters = markdown_to_html(source[part4:part9], "phrasal-verbs-reference")
    final_html, final_chapters = markdown_to_html(source[part10:], "phrasal-verbs-final")
    groups: list[tuple[str, list[dict]]] = []
    for rule in rules:
        family = rule["id"][:5]
        if not groups or groups[-1][0] != family: groups.append((family, []))
        groups[-1][1].append(rule)
    chunks = [intro_html]
    chapters = [*intro_chapters]
    for chapter_index, (family, family_rules) in enumerate(groups, 1):
        chapter_id = f"phrasal-verbs-rules-{chapter_index}"
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
        option_matches = list(re.finditer(r"\(([ABC])\)\s*(.+?)(?=\s*\([ABC]\)|$)", flat))
        options = [{"label":item.group(1), "text":plain(item.group(2)).rstrip(".")} for item in option_matches]
        prompt = re.sub(r"\s*\([ABC]\)\s*.+$", "", flat).strip() if options else flat
        diagnostics.append({"id":match.group(1), "prompt":prompt or flat, "translation":translation, "options":options})
    if len(diagnostics) != 74: raise ValueError(f"Expected 74 diagnostics; found {len(diagnostics)}")
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
            mode = "self-review" if number in range(65, 74) else "exact"
            answers = [answer_text]
        section = "基本練習" if number <= 20 else "混合練習" if number <= 50 else "進階與理解"
        questions.append({
            "id":f"phrasal-verbs-{number:03d}", "diagnosticId":item["id"], "number":number,
            "section":section, "prompt":item["prompt"], "instruction":"按英文語境完成題目，並保留指定意思和資料。",
            "translation":item["translation"], "options":item["options"], "correctOption":answer if item["options"] else None,
            "answer":answer_text, "answers":answers, "mode":mode, "topic":rule["id"],
            "steps":[
                {"title":"步驟一：先明白題意", "body":f"這題表達：{item['translation']}"},
                {"title":"步驟二：認清題目要求", "body":"先判斷整組動詞的意思，再核對物件位置、動詞形式和句子結構。"},
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
    guide = {"slug":"phrasal-verbs", "english":"Phrasal Verbs", "chinese":"動詞組合", "count":len(rules),
             "practiceCount":len(questions), "html":guide_html, "chapters":chapters}
    practice = {"slug":"phrasal-verbs", "title":"Phrasal Verbs", "chinese":"動詞組合", "questions":questions}
    payload = (
        "// Generated by tools/build-grammar-phrasal-verbs.py from the complete reviewed student guide.\n"
        "(() => {\n"
        f"  const guide = Object.freeze({json.dumps(guide, ensure_ascii=False, separators=(',', ':'))});\n"
        f"  const practice = Object.freeze({json.dumps(practice, ensure_ascii=False, separators=(',', ':'))});\n"
        "  const guides = Array.isArray(window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA) ? [...window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA] : [];\n"
        "  if (!guides.some((item) => item.slug === guide.slug)) guides.push(guide);\n"
        "  window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA = guides;\n"
        "  const modules = Array.isArray(window.EDMUND_GRAMMAR_THREE_SETS) ? [...window.EDMUND_GRAMMAR_THREE_SETS] : [];\n"
        "  if (!modules.some((item) => item.slug === practice.slug)) modules.push(practice);\n"
        "  window.EDMUND_GRAMMAR_THREE_SETS = modules;\n"
        "  window.EDMUND_GRAMMAR_PHRASAL_VERBS = Object.freeze({ guide, practice });\n"
        "})();\n"
    )
    OUTPUT.write_text(payload, encoding="utf-8")
    AUDIT_OUTPUT.write_text(json.dumps({
        "source":str(SOURCE.relative_to(ROOT)),
        "guide":{"ruleCount":len(rules), "rules":[{"id":r["id"], "title":r["title"], "dialogueNote":r[STEP_LABELS[5]]} for r in rules]},
        "practice":{"questionCount":len(questions), "questions":[{"diagnosticId":q["diagnosticId"], "topic":q["topic"], "answer":q["answer"], "correctOption":q["correctOption"]} for q in questions]},
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(rules)} Phrasal Verbs guide cards and {len(questions)} exercises.")


if __name__ == "__main__": main()
