#!/usr/bin/env python3
"""Import and audit the supplied Advanced Articles PDFs."""

import argparse
import json
import re
from pathlib import Path

from pypdf import PdfReader

PAGE = re.compile(r"(?m)^=== PDF PAGE (\d+) ===\s*$")
QUESTION = re.compile(r"(?m)^([12]\d\d)[ \t]*$")
ANSWER = re.compile(r"(?m)^([12]\d\d)\.\s*((?:a|an|the|Ø)(?:\s*/\s*(?:a|an|the|Ø))?)\s*$")
STEP = re.compile(r"(?m)^步驟([一二三四五六七])[：:]\s*(.*)$")
RULE = re.compile(r"(?m)^([6-9]\d)\.\s+(.+)$")


def read_pdf(path):
    return "\n".join(f"\n=== PDF PAGE {i} ===\n{p.extract_text(extraction_mode='layout') or ''}"
                     for i, p in enumerate(PdfReader(path).pages, 1))


def page_number(text, position):
    pages = list(PAGE.finditer(text, 0, position))
    return int(pages[-1].group(1)) if pages else 1


def clean(value):
    value = PAGE.sub("", value).replace("\xa0", " ").replace("\r", "")
    return re.sub(r"\n{3,}", "\n\n", "\n".join(line.rstrip() for line in value.splitlines())).strip()


def student_copy(value):
    value = re.sub(r"(?:例如新 worksheet 有|worksheet 有|新 worksheet 有)[：:]", "例如：", value)
    value = value.replace("worksheet 同時有另一個很容易混淆的寫法：", "再看另一個容易混淆的寫法：")
    value = value.replace("這組在新 worksheet 很重要。", "這組寫法很容易混淆。")
    value = value.replace("worksheet 後面有：", "再看例句：")
    value = value.replace("這裡 Ann 並不是去做病人。\n\n她是去照顧／探望哥哥。", "這些例句說的是前往某間醫院，而不是病人去接受治療。")
    value = value.replace("所以這組之後出題時，要清楚採用英式英語，避免無 context 的爭議。", "遇到 hospital 題目時，要留意英美差異與具體語境。")
    value = re.sub(r"(?:原本 curation|Articles - Grammar Curation)", "冠詞導讀", value)
    return clean(value)


def import_questions(text):
    first_answer = text.index("Part B — 答案及七步公式化解析")
    second_practice = text.index("Part A — 學生版練習", first_answer)
    second_answer = text.index("Part B — 答案及七步公式化解析", second_practice)
    sets = [(151, 200, text.index("\n151\n"), first_answer, first_answer, second_practice),
            (201, 250, second_practice, second_answer, second_answer, len(text))]
    questions = {}
    answers = {}
    for first, last, practice_start, practice_end, answers_start, answers_end in sets:
        practice = text[practice_start:practice_end]
        matches = [m for m in QUESTION.finditer(practice) if first <= int(m.group(1)) <= last]
        assert [int(m.group(1)) for m in matches] == list(range(first, last + 1)), (first, [m.group(1) for m in matches])
        for index, match in enumerate(matches):
            number = int(match.group(1))
            end = matches[index + 1].start() if index + 1 < len(matches) else len(practice)
            body = clean(practice[match.end():end])
            translation = re.search(r"【(.*?)】", body, re.S)
            assert translation, f"Missing translation: {number}"
            prompt = re.sub(r"\s+", " ", body[:translation.start()]).strip()
            assert prompt.count("_____") >= 1, (number, prompt)
            questions[number] = {"number": number, "prompt": prompt,
                                 "translation": re.sub(r"\s+", " ", translation.group(1)).strip(),
                                 "sourcePage": page_number(text, practice_start + match.start())}

        answer_text = text[answers_start:answers_end]
        headings = [m for m in ANSWER.finditer(answer_text) if first <= int(m.group(1)) <= last]
        assert [int(m.group(1)) for m in headings] == list(range(first, last + 1)), (first, [m.group(1) for m in headings])
        for index, heading in enumerate(headings):
            number = int(heading.group(1))
            end = headings[index + 1].start() if index + 1 < len(headings) else len(answer_text)
            body = clean(answer_text[heading.end():end])
            if index == len(headings) - 1:
                body = re.split(r"\nAdvanced Questions 151[–-]200 — Coverage", body)[0]
                body = re.split(r"\nQuestions 201[–-]250 — Remaining", body)[0]
            steps = list(STEP.finditer(body))
            assert len(steps) == 7, (number, len(steps))
            complete = re.sub(r"^完整句子：[ \t]*", "", clean(body[:steps[0].start()])).strip()
            answer_parts = [part.strip() for part in heading.group(2).split("/")]
            assert len(answer_parts) == questions[number]["prompt"].count("_____"), (number, answer_parts)
            assert complete, number
            answers[number] = {
                "answer": " / ".join(answer_parts), "answers": answer_parts,
                "completeSentence": complete,
                "steps": [{"title": f"步驟{step.group(1)}：{step.group(2).strip()}",
                           "body": student_copy(body[step.end():steps[i+1].start() if i+1 < len(steps) else len(body)]) or step.group(2).strip()}
                          for i, step in enumerate(steps)],
                "answerSourcePage": page_number(text, answers_start + heading.start())}
            assert all(step["body"] for step in answers[number]["steps"]), number
    assert set(questions) == set(answers) == set(range(151, 251))
    return [{**questions[i], **answers[i]} for i in range(151, 251)]


def import_curation(text):
    map_start = text.index("Updated Article Decision Map")
    portion = text[:map_start]
    headings = [m for m in RULE.finditer(portion) if 67 <= int(m.group(1)) <= 93]
    assert [int(m.group(1)) for m in headings] == list(range(67, 94))
    topics = []
    for index, heading in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(portion)
        raw = portion[heading.end():end]
        title = heading.group(2).strip()
        continuation = re.match(r"\n\s*(/[^\n]+)\n", raw)
        if continuation:
            title += " " + continuation.group(1).strip()
            raw = raw[continuation.end():]
        topics.append({"number": int(heading.group(1)), "title": title,
                       "body": student_copy(raw), "sourcePage": page_number(text, heading.start())})
    appendix = student_copy(text[map_start:])
    appendix = re.split(r"\n這個 Advanced Part 現在是", appendix)[0].strip()
    return topics, appendix


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--exercises", type=Path, required=True)
    parser.add_argument("--curation", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    questions = import_questions(read_pdf(args.exercises))
    topics, appendix = import_curation(read_pdf(args.curation))
    payload = {"module": "advanced-articles", "source": {"exercises": args.exercises.name,
              "curation": args.curation.name}, "topics": topics, "appendix": appendix, "questions": questions}
    args.output.write_text("window.EDMUND_GRAMMAR_ADVANCED_ARTICLES_DATA = " +
                           json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(f"Imported {len(topics)} rules and {len(questions)} questions ({sum(len(q['answers']) > 1 for q in questions)} multi-blank).")


if __name__ == "__main__":
    main()
