#!/usr/bin/env python3
"""Build the Reported Speech grammar guide and diagnostic practice data."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "course-materials/grammar/source/reported-speech-student-reading-guide-v3.md"
OUTPUT = ROOT / "grammar-reported-speech-data.js"
AUDIT_OUTPUT = ROOT / "course-materials/grammar/reported-speech-source-map.json"

STEP_LABELS = (
    "① 先明白意思",
    "② 看英文例句",
    "③ 看中文意思",
    "④ 看為甚麼這樣寫",
    "⑤ 比較接近的寫法",
    "⑥ 最後看限制或例外",
)

ANSWERS = {
    **dict(zip((f"D{i:02d}" for i in range(1, 37)), (
        "A", "B", "C", "B", "B", "A", "C", "B", "A", "C", "B", "C",
        "B", "A", "B", "C", "A", "B", "B", "A", "C", "B", "C", "A",
        "B", "A", "B", "A", "B", "B", "A", "B", "C", "A", "B", "C",
    ))),
    "D37": "She asked me where the bus was.",
    "D38": "He said to me that the room was ready.",
    "D39": "She suggested that we leave earlier.",
    "D40": "Lee said that he is here now.",
    "D41": "The teacher warned the students not to enter the laboratory.",
    "D42": "Ava asked Ben which book he had chosen.",
    "D43": "The visitors said that they were delighted.",
    "D44": "He says that the results are reliable.",
}

ALTERNATIVES = {
    "D37": ["She asked me where the bus was"],
    "D38": ["He said to me that the room was ready", "He said to me the room was ready"],
    "D39": ["She suggested that we leave earlier", "She suggested we leave earlier"],
    "D40": ["Lee said that he is here now", "Lee said he is here now"],
    "D41": ["The teacher warned the students not to enter the laboratory"],
    "D42": ["Ava asked Ben which book he had chosen"],
    "D43": ["The visitors said that they were delighted", "The visitors said they were delighted"],
    "D44": ["He says that the results are reliable", "He says the results are reliable"],
}

RULE_FOR_DIAGNOSTIC = {
    "D01": "RS.02.01", "D02": "RS.02.02", "D03": "RS.03.04", "D04": "RS.03.05",
    "D05": "RS.03.09", "D06": "RS.03.10", "D07": "RS.04.01", "D08": "RS.04.05",
    "D09": "RS.02.06", "D10": "RS.02.11", "D11": "RS.07.06", "D12": "RS.07.02",
    "D13": "RS.06.03", "D14": "RS.03.05", "D15": "RS.06.09", "D16": "RS.06.07",
    "D17": "RS.06.08", "D18": "RS.06.05", "D19": "RS.06.14", "D20": "RS.06.03",
    "D21": "RS.07.03", "D22": "RS.08.03", "D23": "RS.07.08", "D24": "RS.08.08",
    "D25": "RS.08.08", "D26": "RS.07.09", "D27": "RS.07.04", "D28": "RS.07.05",
    "D29": "RS.08.01", "D30": "RS.08.06", "D31": "RS.03.12", "D32": "RS.05.08",
    "D33": "RS.07.12", "D34": "RS.12.04", "D35": "RS.09.09", "D36": "RS.03.16",
    "D37": "RS.06.03", "D38": "RS.02.01", "D39": "RS.07.06", "D40": "RS.03.12",
    "D41": "RS.07.05", "D42": "RS.06.03", "D43": "RS.03.04", "D44": "RS.03.02",
}


def inline(value: str) -> str:
    escaped = html.escape(value.strip())
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"\*(.+?)\*", r"<em>\1</em>", escaped)
    escaped = re.sub(r"`(.+?)`", r"<code>\1</code>", escaped)
    return escaped


def clean_paragraph(value: str) -> str:
    return " ".join(line.strip().lstrip("> ") for line in value.strip().splitlines()).strip()


def plain(value: str) -> str:
    return re.sub(r"[*`]", "", value).strip()


def split_rules(source: str) -> list[dict]:
    matches = list(re.finditer(r"^###\s+(RS\.\d{2}\.\d{2})\s+—\s+(.+)$", source, re.M))
    end = source.index("## IX-A — Student diagnostic set")
    rules = []
    for index, match in enumerate(matches):
        block = source[match.end(): matches[index + 1].start() if index + 1 < len(matches) else end]
        values = {}
        for step_index, label in enumerate(STEP_LABELS):
            start_match = re.search(rf"^\*\*{re.escape(label)}\*\*\s*$", block, re.M)
            if not start_match:
                raise ValueError(f"{match.group(1)} is missing {label}")
            next_positions = [m.start() for later in STEP_LABELS[step_index + 1:]
                              if (m := re.search(rf"^\*\*{re.escape(later)}\*\*\s*$", block[start_match.end():], re.M))]
            stop = start_match.end() + min(next_positions) if next_positions else len(block)
            values[label] = clean_paragraph(block[start_match.end():stop])
        rules.append({"id": match.group(1), "title": match.group(2).strip(), **values})
    if len(rules) != 148 or len({rule["id"] for rule in rules}) != 148:
        raise ValueError(f"Expected 148 unique rules; found {len(rules)}")
    return rules


def build_guide(rules: list[dict]) -> tuple[str, list[dict]]:
    groups: list[tuple[str, list[dict]]] = []
    for rule in rules:
        family = rule["id"][:5]
        if not groups or groups[-1][0] != family:
            groups.append((family, []))
        groups[-1][1].append(rule)
    # The source deliberately revisits rule families across three stages, so each visual chapter
    # follows the authored order rather than sorting the IDs mechanically.
    chapters = []
    chunks = [
        "<p><strong>主線：先辨認原句的說話行為，再處理人稱、時態、時間地點和句型。</strong></p>",
        "<p>香港繁體中文解釋；以現代標準英式英語作主要寫作參考。每張卡保留原指南的六步教學次序。</p>",
    ]
    for chapter_index, (family, family_rules) in enumerate(groups, 1):
        chapter_id = f"reported-speech-section-{chapter_index}"
        chapter_title = f"{family} · {family_rules[0]['title']}"
        chapters.append({"id": chapter_id, "title": chapter_title})
        chunks.append(f'<h2 id="{chapter_id}">{inline(chapter_title)}</h2>')
        for rule in family_rules:
            chunks.extend((
                f'<h3 data-concept-number="{html.escape(rule["id"])}">{inline(rule["title"])}</h3>',
                f'<p>{inline(rule[STEP_LABELS[0]])}</p>',
                f'<blockquote><p>{inline(rule[STEP_LABELS[1]])}</p></blockquote>',
                f'<p><strong>中文意思</strong>　{inline(rule[STEP_LABELS[2]])}</p>',
                f'<p><strong>為甚麼這樣寫</strong>　{inline(rule[STEP_LABELS[3]])}</p>',
                f'<blockquote><p><strong>比較接近的寫法</strong>　{inline(rule[STEP_LABELS[4]])}</p></blockquote>',
                f'<p>{inline(rule[STEP_LABELS[5]])}</p>',
            ))
    return "\n".join(chunks), chapters


def split_diagnostics(source: str) -> list[dict]:
    start = source.index("**D01 ·")
    end = source.index("**本練習完結。**", start)
    diagnostic_source = source[start:end]
    matches = list(re.finditer(r"^\*\*(D\d{2})\s+·\s+(.+?)\*\*\s*(.*)$", diagnostic_source, re.M))
    diagnostics = []
    for index, match in enumerate(matches):
        block = diagnostic_source[match.start(): matches[index + 1].start() if index + 1 < len(matches) else len(diagnostic_source)]
        first_line = match.group(3).strip()
        rest = block[match.end() - match.start():]
        text = clean_paragraph("\n".join([first_line, rest]))
        translation_match = re.search(r"【(.+?)】", text)
        translation = translation_match.group(1).strip() if translation_match else ""
        before_translation = text[:translation_match.start()].strip() if translation_match else text
        before_translation = re.sub(r"答案：_+", "", before_translation).strip()
        option_source = re.sub(r"\s*·\s*(?=[ABC]\.\s)", " ", before_translation)
        option_matches = list(re.finditer(r"(?:^|\s)([ABC])\.\s*(.+?)(?=(?:\s+[ABC]\.\s)|$)", option_source))
        options = []
        prompt_body = before_translation
        if int(match.group(1)[1:]) <= 36:
            if len(option_matches) != 3:
                raise ValueError(f"{match.group(1)} should have exactly three options, found {len(option_matches)}")
            options = [{"label": option.group(1), "text": plain(option.group(2))} for option in option_matches]
            prompt_body = option_source[:option_matches[0].start()].strip()
        diagnostics.append({
            "id": match.group(1),
            "instruction": plain(match.group(2)),
            "prompt": plain(prompt_body) or plain(match.group(2)),
            "translation": translation,
            "options": options,
        })
    if len(diagnostics) != 44:
        raise ValueError(f"Expected 44 diagnostics; found {len(diagnostics)}")
    return diagnostics


def build_questions(diagnostics: list[dict], rules: list[dict]) -> list[dict]:
    rule_map = {rule["id"]: rule for rule in rules}
    questions = []
    for number, diagnostic in enumerate(diagnostics, 1):
        diagnostic_id = diagnostic["id"]
        rule = rule_map[RULE_FOR_DIAGNOSTIC[diagnostic_id]]
        if diagnostic["options"]:
            letter = ANSWERS[diagnostic_id]
            option = next(item for item in diagnostic["options"] if item["label"] == letter)
            answer = option["text"]
            mode = "multiple-choice"
            answers = [letter, answer]
        else:
            answer = ANSWERS[diagnostic_id]
            mode = "self-review"
            answers = list(dict.fromkeys([answer, *ALTERNATIVES[diagnostic_id]]))
        instruction = diagnostic["instruction"]
        section = "選詞與結構" if number <= 12 else "間接問句與說話行為" if number <= 30 else "進階判斷與改寫"
        questions.append({
            "id": f"reported-speech-{number:03d}",
            "diagnosticId": diagnostic_id,
            "number": number,
            "section": section,
            "prompt": diagnostic["prompt"],
            "instruction": instruction,
            "translation": diagnostic["translation"],
            "options": diagnostic["options"],
            "correctOption": ANSWERS[diagnostic_id] if diagnostic["options"] else None,
            "answer": answer,
            "answers": answers,
            "mode": mode,
            "topic": rule["id"],
            "steps": [
                {"title": "步驟一：先明白題意", "body": f"這題表達：{diagnostic['translation']}"},
                {"title": "步驟二：認清題目要求", "body": f"題目要求：{instruction}。先保留人物、時間、否定和原本意思。"},
                {"title": "步驟三：找出英文線索", "body": f"英文資料：{diagnostic['prompt']}"},
                {"title": "步驟四：套用對應規則", "body": f"{rule['id']}：{rule['title']}。{rule[STEP_LABELS[3]]}"},
                {"title": "步驟五：核對答案", "body": f"參考答案：{answer}"},
                {"title": "步驟六：排除容易混淆的寫法", "body": rule[STEP_LABELS[5]]},
                {"title": "步驟七：放回語境檢查", "body": f"再讀一次答案「{answer}」，確認它仍然表示：{diagnostic['translation']}"},
            ],
        })
    return questions


def main() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    rules = split_rules(source)
    guide_html, chapters = build_guide(rules)
    diagnostics = split_diagnostics(source)
    questions = build_questions(diagnostics, rules)
    guide = {
        "slug": "reported-speech",
        "english": "Reported Speech",
        "chinese": "轉述句",
        "count": len(rules),
        "practiceCount": len(questions),
        "html": guide_html,
        "chapters": chapters,
    }
    practice = {
        "slug": "reported-speech",
        "title": "Reported Speech",
        "chinese": "轉述句",
        "questions": questions,
    }
    payload = (
        "// Generated by tools/build-grammar-reported-speech.py from the reviewed student guide.\n"
        "(() => {\n"
        f"  const guide = Object.freeze({json.dumps(guide, ensure_ascii=False, separators=(',', ':'))});\n"
        f"  const practice = Object.freeze({json.dumps(practice, ensure_ascii=False, separators=(',', ':'))});\n"
        "  const guides = Array.isArray(window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA) ? [...window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA] : [];\n"
        "  if (!guides.some((item) => item.slug === guide.slug)) guides.push(guide);\n"
        "  window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA = guides;\n"
        "  const modules = Array.isArray(window.EDMUND_GRAMMAR_THREE_SETS) ? [...window.EDMUND_GRAMMAR_THREE_SETS] : [];\n"
        "  if (!modules.some((item) => item.slug === practice.slug)) modules.push(practice);\n"
        "  window.EDMUND_GRAMMAR_THREE_SETS = modules;\n"
        "  window.EDMUND_GRAMMAR_REPORTED_SPEECH = Object.freeze({ guide, practice });\n"
        "})();\n"
    )
    OUTPUT.write_text(payload, encoding="utf-8")
    AUDIT_OUTPUT.write_text(json.dumps({
        "source": str(SOURCE.relative_to(ROOT)),
        "guide": {
            "ruleCount": len(rules),
            "rules": [{"id": rule["id"], "title": rule["title"], "dialogueNote": rule[STEP_LABELS[5]]}
                      for rule in rules],
        },
        "practice": {
            "questionCount": len(questions),
            "multipleChoiceCount": sum(question["mode"] == "multiple-choice" for question in questions),
            "rewriteCount": sum(question["mode"] == "self-review" for question in questions),
            "questions": [{
                "diagnosticId": question["diagnosticId"],
                "topic": question["topic"],
                "answer": question["answer"],
                "correctOption": question["correctOption"],
            } for question in questions],
        },
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(rules)} Reported Speech guide cards and {len(questions)} exercises.")


if __name__ == "__main__":
    main()
