#!/usr/bin/env python3
"""Import the supplied Articles PDFs into the Grammar module's audited data file."""

import argparse
import json
import re
from pathlib import Path

from pypdf import PdfReader


PAGE_MARKER = re.compile(r"(?m)^=== PDF PAGE (\d+) ===\s*$")
QUESTION_NUMBER = re.compile(r"(?m)^([ \t]*)(\d{1,3})[ \t]*$")
ANSWER_HEADING = re.compile(r"(?m)^([ \t]*)(\d{1,3})\.[ \t]*(a|an|the|Ø)[ \t]*$")
STEP_HEADING = re.compile(r"(?m)^步驟([一二三四五六七八九十]+)[：:][ \t]*(.*)$")
CURATION_HEADING = re.compile(r"(?m)^([1-9]|[1-5]\d|6[0-6])\.[ \t]+(.+)$")


def read_pdf(path):
    pages = [page.extract_text(extraction_mode="layout") or "" for page in PdfReader(path).pages]
    return "\n".join(f"\n=== PDF PAGE {index} ===\n{page}" for index, page in enumerate(pages, 1))


def source_page(text, offset):
    markers = list(PAGE_MARKER.finditer(text, 0, offset))
    return int(markers[-1].group(1)) if markers else 1


def clean(text):
    text = PAGE_MARKER.sub("", text).replace("\xa0", " ").replace("\r", "")
    lines = [line.rstrip() for line in text.splitlines()]
    return re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip()


def student_copy(text):
    substitutions = [
        (r"你提供的 worksheet(?: 正好)?(?: 也)?有這一類例子：", "例如："),
        (r"你提供的 worksheet(?: 正好)?有：", "例如："),
        (r"你的 worksheet(?: 就)?\s*有：", "例如："),
        (r"你的 worksheet：", "例如："),
        (r"例如 worksheet：", "例如："),
        (r"這正好解釋你 worksheet 裡：", "這可解釋以下寫法："),
        (r"你圖片中有：", "例如："),
        (r"你的圖片中有：", "例如："),
        (r"你圖片中值得特別修正的一點", "值得特別留意的一點"),
        (r"這類在你圖片裡很多，也是非常值得特別訓練的。", "這類寫法值得特別練習。"),
        (r"Golden Manual 亦特別提醒：", "要留意："),
        (r"Golden Manual 也特別強調，", "要留意，"),
        (r"\s*Grammar\s+Teaching Golden Manual", ""),
        (r"所以之後製作 exercises 時，我不建議使用", "因此不宜使用"),
    ]
    for before, after in substitutions:
        text = re.sub(before, after, text)
    return clean(text)


def import_questions(text):
    part_as = list(re.finditer(r"Part A — 學生版練習", text))
    part_bs = list(re.finditer(r"Part B — 答案及七步公式化解析", text))
    assert len(part_as) == len(part_bs) == 3, (len(part_as), len(part_bs))
    questions = {}
    answers = {}
    for set_index, (part_a, part_b) in enumerate(zip(part_as, part_bs)):
        expected = range(set_index * 50 + 1, set_index * 50 + 51)
        practice = text[part_a.end():part_b.start()]
        matches = [match for match in QUESTION_NUMBER.finditer(practice) if int(match.group(2)) in expected]
        assert [int(match.group(2)) for match in matches] == list(expected), f"Question numbers in set {set_index + 1} are incomplete"
        for position, match in enumerate(matches):
            end = matches[position + 1].start() if position + 1 < len(matches) else len(practice)
            block = clean(practice[match.end():end])
            translation = re.search(r"【(.*?)】", block, re.S)
            assert translation, f"Missing translation for question {match.group(2)}"
            prompt = re.sub(r"\s+", " ", block[:translation.start()]).strip()
            assert "_____" in prompt, (match.group(2), prompt)
            number = int(match.group(2))
            questions[number] = {
                "number": number,
                "stage": "guided" if number <= 50 else "mixed",
                "prompt": prompt,
                "translation": re.sub(r"\s+", " ", translation.group(1)).strip(),
                "sourcePage": source_page(text, part_a.end() + match.start()),
            }

        part_b_end = part_as[set_index + 1].start() if set_index < 2 else len(text)
        answer_text = text[part_b.end():part_b_end]
        answer_matches = [match for match in ANSWER_HEADING.finditer(answer_text) if int(match.group(2)) in expected]
        assert [int(match.group(2)) for match in answer_matches] == list(expected), f"Answer numbers in set {set_index + 1} are incomplete"
        for position, match in enumerate(answer_matches):
            end = answer_matches[position + 1].start() if position + 1 < len(answer_matches) else len(answer_text)
            block = clean(answer_text[match.end():end])
            if position == len(answer_matches) - 1:
                block = re.split(r"\n\s*First 50 — Formula Map", block)[0]
                block = re.split(r"\n\s*Questions 51[–-]100 的學習設計", block)[0]
                block = re.split(r"\n\s*Questions 101[–-]150 — 學習重點總結", block)[0]
            steps = list(STEP_HEADING.finditer(block))
            assert len(steps) == 7, (match.group(2), len(steps))
            complete = clean(block[:steps[0].start()])
            complete = re.sub(r"^完整句子：[ \t]*", "", complete)
            answers[int(match.group(2))] = {
                "answer": match.group(3),
                "completeSentence": complete,
                "steps": [
                    {
                        "title": f"步驟{step.group(1)}：{step.group(2).strip()}",
                        "body": clean(block[step.end():steps[index + 1].start() if index + 1 < len(steps) else len(block)]),
                    }
                    for index, step in enumerate(steps)
                ],
                "answerSourcePage": source_page(text, part_b.end() + match.start()),
            }

    assert set(questions) == set(answers) == set(range(1, 151))
    result = []
    for number in range(1, 151):
        question = {**questions[number], **answers[number]}
        assert all(step["body"] for step in question["steps"]), f"Empty explanation step {number}"
        result.append(question)
    return result


def import_curation(text):
    start = text.index("1. 先記住最重要的核心")
    appendix = text.index("一張真正可以用來解題的 Article Decision")
    topic_text = text[start:appendix]
    headings = [match for match in CURATION_HEADING.finditer(topic_text) if int(match.group(1)) <= 66]
    assert [int(match.group(1)) for match in headings] == list(range(1, 67))
    topics = []
    for index, heading in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(topic_text)
        raw = topic_text[heading.end():end]
        title = heading.group(2).strip()
        continuation = re.match(r"\n([^\n]+)\n\n", raw)
        if continuation:
            title += continuation.group(1).strip()
            raw = raw[continuation.end():]
        block = student_copy(raw)
        topics.append({
            "number": index + 1,
            "title": title,
            "body": block,
            "sourcePage": source_page(text, start + heading.start()),
        })
    appendix_body = student_copy(text[appendix:])
    appendix_body = re.split(r"\n所以你的 source material", appendix_body)[0] + "\n\n" + re.split(r"最後把整套概念壓縮成三句", appendix_body)[-1]
    appendix_body = re.split(r"\n這就是之後所有 article exercises", appendix_body)[0].strip()
    return topics, appendix_body


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--exercises", type=Path, required=True)
    parser.add_argument("--curation", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    questions = import_questions(read_pdf(args.exercises))
    topics, appendix = import_curation(read_pdf(args.curation))
    payload = {
        "module": "articles",
        "source": {"exercises": args.exercises.name, "curation": args.curation.name},
        "topics": topics,
        "appendix": appendix,
        "questions": questions,
    }
    args.output.write_text("window.EDMUND_GRAMMAR_ARTICLES_DATA = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(f"Imported {len(topics)} curation topics and {len(questions)} questions into {args.output}")


if __name__ == "__main__":
    main()
