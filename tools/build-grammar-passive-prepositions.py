#!/usr/bin/env python3
"""Build complete Passive Voice and Prepositions grammar modules from reviewed sources."""

from __future__ import annotations

import html
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PASSIVE_SOURCE = ROOT / "course-materials/grammar/source/passive-voice-student-reading-guide.md"
PREP_SOURCE = ROOT / "course-materials/grammar/source/prepositions-prepositional-phrases-course-pages.txt"

STEPS = (
    "① 先明白意思", "② 看英文例句", "③ 看中文意思",
    "④ 看為甚麼這樣寫", "⑤ 比較接近的寫法", "⑥ 最後看限制或例外",
)

PASSIVE_ANSWERS = {
    **dict(zip((f"D{i:03d}" for i in range(1, 25)), "B C A C D B A B C A C B B C C A B C C B B B B B".split())),
    **dict(zip((f"D{i:03d}" for i in range(25, 49)), [
        "are checked", "was written", "is being repaired", "were being cleaned", "have been sent",
        "had been locked", "will be announced", "are going to be replaced", "will have been finished",
        "must be washed", "should be closed", "might have been lost", "was not used", "to be signed",
        "being watched", "to have been deleted", "got damaged", "had my hair cut", "looked after",
        "laughed at", "was given", "It is believed that", "be informed", "to wait",
    ])),
    **dict(zip((f"D{i:03d}" for i in range(49, 65)), [
        "The forms were checked this morning.", "The message was sent yesterday.",
        "The walls are being painted right now by the workers.", "The bridge will be repaired next week.",
        "The parcel has been delivered already.", "The doors were not locked last night.",
        "The plants must be watered daily.", "He dislikes being watched.", "Ben was made to wait outside.",
        "The child was looked after well by the volunteers.", "A doctor was sent for yesterday.",
        "The plan was explained to us yesterday.", "The report is being written now.",
        "The prize was given to May.", "The form needs to be signed today.",
        "I hope to be invited to the event.",
    ])),
    **dict(zip((f"D{i:03d}" for i in range(65, 93)), "A B C A B B A C B B B A C B A B C B B B A B C B B A B A".split())),
}

PREP_ANSWERS = {
    **dict(zip((f"P{i:03d}" for i in range(1, 61)), [
        "B","A","C","B","in","at","C","B","A","B","into","B","B","A","B","A","C","for","since","C",
        "by","A","B","at","B","on","B","A","B","with","A","A","in","of","for","to","of","B","to","C",
        "B","to","A","B","C","B","A","C","B","A","B","C","A","C","B","A","for","A","on","B",
    ])),
    "P061":"We discussed the plan after school.",
    "P062":"Please listen to the instructions carefully.",
    "P063":"They arrived at the airport at seven.",
    "P064":"I am interested in learning French.",
    "P065":"A", "P066":"B", "P067":"This is the chair that I sat on.",
    "P068":"This bed has been slept in.", "P069":"C", "P070":"It was in the library that we met.",
    "P071":"The speaker used binoculars to see the boy; or the boy had binoculars.",
    "P072":"Yes. Between can connect three or more separately identified parties.",
    "P073":"A", "P074":"C", "P075":"B", "P076":"A", "P077":"C", "P078":"B",
    "P079":"We played outside despite the cold weather.", "P080":"This is between you and me.",
    "P081":"No. It only denies seeing him at school, not seeing him elsewhere.",
    "P082":"With Dad cooking, I was setting the table.",
    "P083":"No. Off of occurs in informal American English; off is preferred in formal British English.",
    "P084":"After the meeting, we went home.", "P085":"B",
    "P086":"This picture was painted by the children.",
}

PASSIVE_TOPICS = dict(zip((f"D{i:03d}" for i in range(1, 93)), [
    "PV.02.03","PV.03.01","PV.05.01","PV.06.07","PV.04.01","PV.04.04","PV.06.10","PV.13.10",
    "PV.07.07","PV.10.05","PV.11.01","PV.12.05","PV.21.06","PV.08.08","PV.09.10","PV.03.01",
    "PV.01.09","PV.01.10","PV.14.03","PV.08.05","PV.11.06","PV.06.05","PV.20.11","PV.19.01",
    "PV.02.03","PV.03.01","PV.05.01","PV.05.05","PV.06.01","PV.06.07","PV.04.01","PV.04.04",
    "PV.06.10","PV.07.06","PV.07.09","PV.07.14","PV.03.04","PV.08.01","PV.08.08","PV.08.05",
    "PV.10.05","PV.09.01","PV.12.01","PV.12.02","PV.11.01","PV.14.03","PV.20.03","PV.09.10",
    "PV.03.02","PV.01.05","PV.05.01","PV.04.01","PV.06.01","PV.03.04","PV.07.06","PV.08.08",
    "PV.09.10","PV.12.01","PV.12.12","PV.11.10","PV.05.01","PV.11.01","PV.08.01","PV.08.01",
    "PV.03.08","PV.04.01","PV.05.05","PV.06.06","PV.11.01","PV.12.04","PV.09.10","PV.06.07",
    "PV.14.01","PV.09.01","PV.07.14","PV.11.07","PV.21.02","PV.19.03","PV.05.01","PV.06.01",
    "PV.18.09","PV.09.09","PV.08.05","PV.01.10","PV.01.09","PV.09.05","PV.21.07","PV.21.11",
    "PV.14.01","PV.09.12","PV.16.05","PV.07.07",
]))

PREP_TOPICS = dict(zip((f"P{i:03d}" for i in range(1, 87)), [
    "PP.02.01","PP.02.02","PP.02.03","PP.05.05","PP.05.03","PP.05.01","PP.05.10","PP.02.05",
    "PP.02.05","PP.03.12","PP.03.04","PP.02.01","PP.03.11","PP.03.09","PP.02.15","PP.04.07",
    "PP.04.11","PP.06.01","PP.06.02","PP.06.03","PP.06.05","PP.06.06","PP.07.07","PP.05.01",
    "PP.05.06","PP.05.02","PP.05.12","PP.05.13","PP.07.01","PP.07.03","PP.07.04","PP.12.09",
    "PP.10.03","PP.10.04","PP.10.11","PP.10.15","PP.10.06","PP.10.19","PP.09.01","PP.09.16",
    "PP.09.30","PP.09.10","PP.09.14","PP.09.14","PP.09.04","PP.09.26","PP.09.26","PP.11.04",
    "PP.11.09","PP.12.01","PP.08.11","PP.12.06","PP.08.02","PP.07.12","PP.12.10","PP.12.11",
    "PP.07.10","PP.02.04","PP.05.02","PP.14.16","PP.09.30","PP.09.01","PP.03.16","PP.10.03",
    "PP.13.14","PP.13.15","PP.13.16","PP.13.17","PP.14.11","PP.14.05","PP.14.07","PP.04.06",
    "PP.06.10","PP.09.04","PP.15.08","PP.14.19","PP.15.09","PP.14.19","PP.08.11","PP.13.08",
    "PP.14.10","PP.15.10","PP.14.26","PP.15.12","PP.15.07","PP.07.04",
]))


def clean(value: str) -> str:
    value = value.replace("\f", " ")
    return " ".join(line.strip().lstrip("> ") for line in value.strip().splitlines()).strip()


def plain(value: str) -> str:
    return re.sub(r"[*`]", "", clean(value)).strip()


def inline(value: str) -> str:
    escaped = html.escape(clean(value))
    escaped = re.sub(r"`(.+?)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"(?<!\*)\*([^*]+?)\*", r"<em>\1</em>", escaped)
    return escaped


def normalize_prompt(value: str) -> str:
    lines = [clean(part) for part in value.splitlines() if clean(part)]
    if lines and ":" in lines[0]:
        lead, rest = lines[0].split(":", 1)
        if lead.strip() and rest.strip():
            lines[:1] = [lead.strip() + ":", rest.strip()]
    return "\n".join(lines)


def split_markdown_rules(source: str, prefix: str, expected: int) -> list[dict]:
    start = source.index("# PART III")
    end = source.index("# PART IV", start)
    area = source[start:end]
    matches = list(re.finditer(rf"^###\s+({prefix}\.\d{{2}}\.\d{{2}})\s+—\s+(.+)$", area, re.M))
    rules = []
    for index, match in enumerate(matches):
        block = area[match.end():matches[index + 1].start() if index + 1 < len(matches) else len(area)]
        values = {}
        for step_index, label in enumerate(STEPS):
            marker = re.search(rf"^\*\*{re.escape(label)}\*\*\s*$", block, re.M)
            if not marker:
                raise ValueError(f"{match.group(1)} missing {label}")
            later = [found.start() + marker.end() for next_label in STEPS[step_index + 1:]
                     if (found := re.search(rf"^\*\*{re.escape(next_label)}\*\*\s*$", block[marker.end():], re.M))]
            stop = min(later) if later else len(block)
            step_source = re.split(r"^\s*##\s+", block[marker.end():stop], maxsplit=1, flags=re.M)[0]
            values[label] = clean(step_source)
        rules.append({"id":match.group(1), "title":match.group(2).strip(), **values})
    if len(rules) != expected or len({item["id"] for item in rules}) != expected:
        raise ValueError(f"Expected {expected} unique {prefix} rules; found {len(rules)}")
    return rules


def split_plain_rules(source: str, prefix: str, expected: int) -> list[dict]:
    source = source.replace("\u200b", "")
    start = source.index("PART III — Comprehensive Rule")
    end = source.index("PART IV — Advanced Grammar", start)
    area = source[start:end]
    matches = list(re.finditer(rf"^(?:\f)?({prefix}\.\d{{2}}\.\d{{2}})\s*[—-]\s*(.+)$", area, re.M))
    rules = []
    for index, match in enumerate(matches):
        block = area[match.end():matches[index + 1].start() if index + 1 < len(matches) else len(area)]
        values = {}
        for step_index, label in enumerate(STEPS):
            marker = re.search(rf"^\s*{re.escape(label)}\s*$", block, re.M)
            if not marker:
                raise ValueError(f"{match.group(1)} missing {label}")
            later = [found.start() + marker.end() for next_label in STEPS[step_index + 1:]
                     if (found := re.search(rf"^\s*{re.escape(next_label)}\s*$", block[marker.end():], re.M))]
            stop = min(later) if later else len(block)
            step_source = block[marker.end():stop].replace("\f", "\n")
            step_lines = []
            for raw_line in step_source.splitlines():
                line = clean(raw_line)
                if not line:
                    continue
                if line.startswith("英文介詞及介詞短語｜學生閱讀指南") or line.startswith("（共 6 冊）"):
                    continue
                if line.startswith("請按規則編號順序閱讀") or line.startswith("PART III —"):
                    continue
                if line.startswith("Loading older messages") or line == "please continue" or line.startswith("<!-- SOURCE PDF"):
                    continue
                if re.match(r"^PP\.\d{2}\s+—\s+", line):
                    continue
                step_lines.append(line)
            values[label] = " ".join(step_lines)
        rules.append({"id":match.group(1), "title":clean(match.group(2)), **values})
    if len(rules) != expected or len({item["id"] for item in rules}) != expected:
        raise ValueError(f"Expected {expected} unique {prefix} rules; found {len(rules)}")
    return rules


def markdown_to_html(value: str, anchor_prefix: str) -> tuple[str, list[dict]]:
    lines, out, chapters = value.strip().splitlines(), [], []
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line or line == "---": i += 1; continue
        heading = re.match(r"^(#{1,3})\s+(.+)$", line)
        if heading:
            level = min(3, len(heading.group(1)) + 1); title = plain(heading.group(2))
            if level == 2:
                anchor = f"{anchor_prefix}-{len(chapters) + 1}"; chapters.append({"id":anchor, "title":title})
                out.append(f'<h2 id="{anchor}">{inline(title)}</h2>')
            else: out.append(f'<h{level}>{inline(title)}</h{level}>')
            i += 1; continue
        if line.startswith("|") and i + 1 < len(lines) and re.match(r"^\|?\s*:?-+", lines[i + 1]):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append([cell.strip() for cell in lines[i].strip().strip("|").split("|")]); i += 1
            header, body = rows[0], rows[2:]
            out.append('<div class="grammar-new-table-wrap"><table><thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in header) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in row) + '</tr>' for row in body) + '</tbody></table></div>')
            continue
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
        paragraph = [line]; i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"^(#{1,3})\s|^---$|^[-*] |^\d+\. |^>|^\|", lines[i]):
            paragraph.append(lines[i].strip()); i += 1
        out.append(f'<p>{inline(" ".join(paragraph))}</p>')
    return "\n".join(out), chapters


def plain_to_html(value: str, anchor_prefix: str) -> tuple[str, list[dict]]:
    text = value.replace("\f", "\n")
    lines, out, chapters = text.splitlines(), [], []
    i = 0
    while i < len(lines):
        line = clean(lines[i]); i += 1
        if not line or line.startswith("# Normalized") or line.startswith("# Original") or line.startswith("# Included") or line.startswith("# Excluded"): continue
        if line.startswith("PART "):
            anchor = f"{anchor_prefix}-{len(chapters) + 1}"; chapters.append({"id":anchor, "title":line})
            out.append(f'<h2 id="{anchor}">{inline(line)}</h2>'); continue
        if re.match(r"^(?:[IVX]+\.\d+|PP\.\d{2})\b", line):
            out.append(f'<h3>{inline(line)}</h3>'); continue
        if line.startswith("●"):
            items = [line.lstrip("● ")]
            while i < len(lines) and clean(lines[i]).startswith("●"):
                items.append(clean(lines[i]).lstrip("● ")); i += 1
            out.append('<ul>' + ''.join(f'<li>{inline(item)}</li>' for item in items) + '</ul>'); continue
        paragraph = [line]
        while i < len(lines):
            peek = clean(lines[i])
            if not peek or peek.startswith("PART ") or peek.startswith("●") or re.match(r"^(?:[IVX]+\.\d+|PP\.\d{2})\b", peek): break
            paragraph.append(peek); i += 1
        out.append(f'<p>{inline(" ".join(paragraph))}</p>')
    return "\n".join(out), chapters


def build_guide(source: str, rules: list[dict], slug: str, is_markdown: bool) -> tuple[str, list[dict]]:
    part3 = source.index("# PART III" if is_markdown else "PART III — Comprehensive Rule")
    part4 = source.index("# PART IV" if is_markdown else "PART IV — Advanced Grammar", part3)
    part9 = source.index("# PART IX" if is_markdown else "PART IX — Diagnostic Tests", part4)
    part10 = source.index("# PART X" if is_markdown else "PART X — Final Coverage Check", part9)
    converter = markdown_to_html if is_markdown else plain_to_html
    intro, chapters = converter(source[:part3], f"{slug}-overview")
    appendix, appendix_chapters = converter(source[part4:part9], f"{slug}-reference")
    final, final_chapters = converter(source[part10:], f"{slug}-final")
    chunks = [intro]
    for family, family_rules in _families(rules):
        chapter_id = f"{slug}-rules-{len([c for c in chapters if c['id'].startswith(slug + '-rules-')]) + 1}"
        title = f"{family} · {family_rules[0]['title']}"; chapters.append({"id":chapter_id, "title":title})
        chunks.append(f'<h2 id="{chapter_id}">{inline(title)}</h2>')
        for rule in family_rules:
            chunks.extend((
                f'<h3 data-concept-number="{rule["id"]}">{inline(rule["title"])}</h3>',
                f'<p>{inline(rule[STEPS[0]])}</p>',
                f'<blockquote><p>{inline(rule[STEPS[1]])}</p></blockquote>',
                f'<p><strong>中文意思</strong>　{inline(rule[STEPS[2]])}</p>',
                f'<p><strong>為甚麼這樣寫</strong>　{inline(rule[STEPS[3]])}</p>',
                f'<blockquote><p><strong>比較接近的寫法</strong>　{inline(rule[STEPS[4]])}</p></blockquote>',
                f'<p>{inline(rule[STEPS[5]])}</p>',
            ))
    chunks.extend((appendix, final)); chapters.extend(appendix_chapters + final_chapters)
    return "\n".join(chunks), chapters


def _families(rules: list[dict]):
    groups = []
    for rule in rules:
        family = rule["id"][:5]
        if not groups or groups[-1][0] != family: groups.append((family, []))
        groups[-1][1].append(rule)
    return groups


def split_markdown_diagnostics(source: str, expected: int) -> list[dict]:
    start, end = source.index("**D001."), source.index("# PART X", source.index("**D001."))
    area = source[start:end]
    matches = list(re.finditer(r"^\*\*(D\d{3})\.\*\*", area, re.M))
    return [_parse_diagnostic(match.group(1), area[match.end():matches[i + 1].start() if i + 1 < len(matches) else len(area)], r"(?:^|\s)([A-D])\.\s*") for i, match in enumerate(matches)] if len(matches) == expected else _raise_count("Passive diagnostics", expected, len(matches))


def split_plain_diagnostics(source: str, expected: int) -> list[dict]:
    start, end = source.index("P001"), source.index("PART X — Final Coverage Check", source.index("P001"))
    area = source[start:end]
    matches = list(re.finditer(r"(?:^|\f)\s*(P\d{3})\s*$", area, re.M))
    return [_parse_diagnostic(match.group(1), area[match.end():matches[i + 1].start() if i + 1 < len(matches) else len(area)], r"\(([A-C])\)\s*") for i, match in enumerate(matches)] if len(matches) == expected else _raise_count("Preposition diagnostics", expected, len(matches))


def _raise_count(label: str, expected: int, actual: int):
    raise ValueError(f"Expected {expected} {label}; found {actual}")


def _parse_diagnostic(qid: str, block: str, option_pattern: str) -> dict:
    block = block.replace("\f", "\n")
    translation_match = re.search(r"【(.+?)】", block, re.S)
    translation = clean(translation_match.group(1)) if translation_match else ""
    english = block[:translation_match.start()].strip() if translation_match else block.strip()
    english = re.sub(r"\n*(?:答案|完整句子|我的解釋)：_+.*", "", english, flags=re.S).strip()
    flat = clean(english)
    markers = list(re.finditer(option_pattern, flat))
    options = []
    if markers:
        prompt = flat[:markers[0].start()].strip()
        for index, marker in enumerate(markers):
            text = flat[marker.end():markers[index + 1].start() if index + 1 < len(markers) else len(flat)].strip()
            options.append({"label":marker.group(1), "text":text.rstrip(".")})
    else: prompt = flat
    return {"id":qid, "prompt":prompt, "translation":translation, "options":options}


STOP = {"the","a","an","is","are","was","were","be","been","being","to","of","and","or","in","on","at","for","with","by","that","this","it","we","you","he","she","they","i","my","our","their","from","will","can","should","must","may","might"}


def best_topic(item: dict, rules: list[dict]) -> dict:
    haystack = plain(item["prompt"] + " " + item["translation"]).lower()
    tokens = [token for token in re.findall(r"[a-z]+(?:'[a-z]+)?", haystack) if len(token) > 2 and token not in STOP]
    prompt_counts = Counter(tokens)
    best = None
    for rule in rules:
        corpus = " ".join([rule["title"], *(rule[step] for step in STEPS)]).lower()
        score = sum((3 if count > 1 else 2) for token, count in prompt_counts.items() if re.search(rf"\b{re.escape(token)}\b", corpus))
        for phrase in re.findall(r"\b(?:is|are|was|were|has|have|had|will|must|should|might|to|being|get|got)\s+(?:not\s+)?(?:been\s+|being\s+|be\s+)?[a-z]+", haystack):
            if phrase in corpus: score += 8
        candidate = (score, -int(rule["id"].split(".")[1]), -int(rule["id"].split(".")[2]), rule)
        if best is None or candidate[:3] > best[:3]: best = candidate
    return best[3]


def build_questions(diagnostics: list[dict], rules: list[dict], slug: str, answers: dict, topics: dict) -> list[dict]:
    rule_map = {rule["id"]:rule for rule in rules}
    questions = []
    for number, item in enumerate(diagnostics, 1):
        raw_answer = answers[item["id"]]
        topic = rule_map[topics[item["id"]]]
        if item["options"]:
            correct = raw_answer
            answer_text = next(option["text"] for option in item["options"] if option["label"] == correct)
            mode, accepted = "multiple-choice", [correct, answer_text]
        else:
            correct, answer_text = None, raw_answer
            mode = "self-review" if "解釋" in item["translation"] or "meanings" in item["prompt"] else "exact"
            accepted = [answer_text]
        section = "基本練習" if number <= len(diagnostics) // 3 else "混合練習" if number <= len(diagnostics) * 2 // 3 else "進階與理解"
        questions.append({
            "id":f"{slug}-{number:03d}", "diagnosticId":item["id"], "number":number, "section":section,
            "prompt":normalize_prompt(item["prompt"]), "instruction":"按英文語境完成題目；中文只協助理解，不會單獨透露答案。",
            "translation":item["translation"], "options":item["options"], "correctOption":correct,
            "answer":answer_text, "answers":accepted, "mode":mode, "topic":topic["id"],
            "steps":[
                {"title":"步驟一：先明白題意", "body":f"這題表達：{item['translation']}"},
                {"title":"步驟二：認清題目要求", "body":"先找時間、句子重點、動詞形式和固定配搭，再決定最自然的標準英語寫法。"},
                {"title":"步驟三：找出英文線索", "body":f"英文資料：{item['prompt']}"},
                {"title":"步驟四：套用對應規則", "body":f"{topic['id']}：{topic['title']}。{topic[STEPS[3]]}"},
                {"title":"步驟五：核對答案", "body":f"參考答案：{answer_text}"},
                {"title":"步驟六：排除容易混淆的寫法", "body":topic[STEPS[5]]},
                {"title":"步驟七：放回語境檢查", "body":f"再讀一次答案，確認它仍然表示：{item['translation']}"},
            ],
        })
    return questions


def write_module(*, slug: str, english: str, chinese: str, source_path: Path, source: str,
                 rules: list[dict], diagnostics: list[dict], answers: dict, topics: dict, is_markdown: bool) -> None:
    guide_html, chapters = build_guide(source, rules, slug, is_markdown)
    questions = build_questions(diagnostics, rules, slug, answers, topics)
    guide = {"slug":slug, "english":english, "chinese":chinese, "count":len(rules), "practiceCount":len(questions), "html":guide_html, "chapters":chapters}
    practice = {"slug":slug, "title":english, "chinese":chinese, "questions":questions}
    symbol = "PASSIVE_VOICE" if slug == "passive-voice" else "PREPOSITIONS"
    payload = (
        f"// Generated by tools/build-grammar-passive-prepositions.py from {source_path.name}.\n"
        "(() => {\n"
        f"  const guide = Object.freeze({json.dumps(guide, ensure_ascii=False, separators=(',', ':'))});\n"
        f"  const practice = Object.freeze({json.dumps(practice, ensure_ascii=False, separators=(',', ':'))});\n"
        "  const guides = Array.isArray(window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA) ? [...window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA] : [];\n"
        "  if (!guides.some((item) => item.slug === guide.slug)) guides.push(guide);\n"
        "  window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA = guides;\n"
        "  const modules = Array.isArray(window.EDMUND_GRAMMAR_THREE_SETS) ? [...window.EDMUND_GRAMMAR_THREE_SETS] : [];\n"
        "  if (!modules.some((item) => item.slug === practice.slug)) modules.push(practice);\n"
        "  window.EDMUND_GRAMMAR_THREE_SETS = modules;\n"
        f"  window.EDMUND_GRAMMAR_{symbol} = Object.freeze({{ guide, practice }});\n"
        "})();\n"
    )
    (ROOT / f"grammar-{slug}-data.js").write_text(payload, encoding="utf-8")
    audit = {
        "source":str(source_path.relative_to(ROOT)),
        "guide":{"ruleCount":len(rules), "sixStepFieldCount":len(rules) * 6,
                 "rules":[{"id":rule["id"], "title":rule["title"], "dialogueNote":rule[STEPS[5]]} for rule in rules]},
        "practice":{"questionCount":len(questions), "sevenStepExplanationCount":len(questions) * 7,
                    "questions":[{"diagnosticId":q["diagnosticId"], "topic":q["topic"], "answer":q["answer"], "correctOption":q["correctOption"]} for q in questions]},
    }
    (ROOT / f"course-materials/grammar/{slug}-source-map.json").write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(rules)} {english} guide cards and {len(questions)} exercises.")


def main() -> None:
    passive = PASSIVE_SOURCE.read_text(encoding="utf-8")
    passive_rules = split_markdown_rules(passive, "PV", 290)
    passive_diagnostics = split_markdown_diagnostics(passive, 92)
    write_module(slug="passive-voice", english="Passive Voice", chinese="被動語態", source_path=PASSIVE_SOURCE,
                 source=passive, rules=passive_rules, diagnostics=passive_diagnostics, answers=PASSIVE_ANSWERS,
                 topics=PASSIVE_TOPICS, is_markdown=True)

    prepositions = PREP_SOURCE.read_text(encoding="utf-8")
    prep_rules = split_plain_rules(prepositions, "PP", 291)
    prep_diagnostics = split_plain_diagnostics(prepositions, 86)
    write_module(slug="prepositions", english="Prepositions and Prepositional Phrases", chinese="介詞及介詞短語",
                 source_path=PREP_SOURCE, source=prepositions, rules=prep_rules, diagnostics=prep_diagnostics,
                 answers=PREP_ANSWERS, topics=PREP_TOPICS, is_markdown=False)


if __name__ == "__main__":
    main()
