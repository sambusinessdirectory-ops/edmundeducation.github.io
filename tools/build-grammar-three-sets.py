#!/usr/bin/env python3
"""Build the three sourced grammar practice modules and their reviewed model answers."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "course-materials/grammar/source"
ANSWERS = ROOT / "course-materials/grammar/answers"
CONFIG = (
    ("so", "so-so-that-so-as-to", "So / So That / So As To", "結果與目的"),
    ("modal-verbs", "modal-verbs", "Modal Verbs", "情態動詞"),
    ("unless", "unless", "Unless", "條件與例外"),
)
ACCEPTED_ALTERNATIVES = {
    ("modal-verbs", 15): ("needn't", "don't need to"),
}
NUMBER = re.compile(r"^### 第 (\d+) 題\s*$", re.M)
SECTION = re.compile(r"^### ([A-J])｜(.+)$", re.M)
STEP_TITLES = (
    "步驟一：先看句子在說甚麼",
    "步驟二：認清題目要求",
    "步驟三：找出形式或意思線索",
    "步驟四：選擇合適規則",
    "步驟五：寫出示範答案",
    "步驟六：對照容易混淆的寫法",
    "步驟七：放回語境檢查",
)


def rule(slug: str, prompt: str) -> tuple[str, str]:
    p = prompt.lower()
    if slug == "so":
        if "so far" in p or "so do i" in p or "so i do" in p:
            return "這裏的 so 是固定搭配的一部分，要按整句功能理解。", "不要把每個 so 都當作『所以』或目的連接詞。"
        if "so ... that" in p or "such" in p or "too ..." in p or "enough to" in p or "so unclear as to" in p:
            return "先辨認程度與結果，再檢查形容詞、名詞及數量詞的位置。", "so + 形容詞／副詞與 such +（形容詞）名詞的結構不同；程度結果也不是刻意目的。"
        if "in case" in p:
            return "in case 表示預防可能出現的情況；目的連接詞說明想達到的效果。", "不能控制是否下雨時，帶傘是預防，不是為了令雨下來。"
        if "so as not to" in p or "negative-purpose" in p:
            return "同一做事者想避免某事時，可用 so as not to + 動詞原形。", "否定放在目的上；不要把主句誤改成『沒有做』。"
        if "so as to" in p or "in order to" in p:
            return "so as to／in order to 後接動詞原形，通常由主句做事者完成目的動作。", "若真正完成目的的人不同，要保留 so that + 完整小句等寫法。"
        if "so that" in p:
            return "so that 後可接主語和動詞，說明目的；某些語境也可表結果，要看上下文。", "目的只說想達成的效果，不保證效果已經發生。"
        return "so 連接已交代的原因與後面的結果或決定；先讀清楚前後因果。", "不要把原因、結果與目的混為一談；留意逗號和主語。"
    if slug == "modal-verbs":
        if "mustn't" in p or "needn't" in p or "don't have to" in p or "doesn't have to" in p:
            return "先分清禁止與無須：mustn't 是否准許；needn't／don't have to 是沒有必要。", "說『可做可不做』時，不能用 mustn't 改成禁止。"
        if "passive" in p or "(sign)" in p or "(reuse)" in p or "(delete)" in p:
            return "情態動詞後若主語承受動作，使用 be + 過去分詞；過去推斷可用 have been + 過去分詞。", "不要把被動的 be／been 或主要動詞的過去分詞漏掉。"
        if "have to" in p or "need to" in p or "be able to" in p:
            return "have to、need to、be able to 是會按人稱和時間變化的相關表達。", "在 does／did 後用動詞原形；未來的能力可用 will be able to。"
        if "have" in p or "perfect" in p or "yesterday" in p:
            return "分清過去的事實、過去的要求和現在對過去的推斷；情態動詞後可用 have + 過去分詞。", "had to 說過去必須；must have + 過去分詞則是對過去的強烈推斷。"
        return "先辨認能力、許可、義務、建議或推斷；核心情態動詞後通常接動詞原形。", "不要在 can／must／should 後加第三人稱 -s 或多餘的 to；問句的助動詞位置也要檢查。"
    if "until" in p or "in case" in p or "even if" in p:
        return "先分清例外、時間終點、預防與讓步；unless、until、in case、even if 不可只靠中文逐字替換。", "until 說『直到』的時間；in case 是預防；even if 說即使發生仍不改變決定。"
    if "if ... not" in p or "rewrite with unless" in p or "rewrite with if" in p:
        return "unless 引出原安排的例外；改寫 if ... not 時要重新檢查否定範圍和主句意思。", "不要在 unless 子句機械保留原本的 not，否則可能把例外倒轉。"
    if "perfect" in p or "past" in p or "future" in p or "(arrive)" in p:
        return "看條件發生的時間；普通將來條件的 unless 子句通常用現在式，已完成可用完成式。", "不要因主句有 will 就自動在普通 unless 子句也加 will。"
    return "unless 表示『除非／如果不』；先找原安排，再找可能改變它的例外。", "例外出現不必然保證相反結果；必要條件也不等於充分保證。"


def classify(prompt: str, answer: str) -> str:
    p = prompt.lower()
    if "_____" not in prompt or " / " in answer or len(answer) > 55:
        return "self-review"
    if p.startswith(("choose ", "complete", "use ", "answer to mean")):
        return "exact"
    return "self-review"


def load_answers(name: str) -> dict[int, str]:
    entries: dict[int, str] = {}
    for line in (ANSWERS / f"{name}.tsv").read_text(encoding="utf-8").splitlines():
        number, sep, answer = line.partition("\t")
        if not sep or not answer.strip():
            raise ValueError(f"Missing answer: {name} {number}")
        key = int(number)
        if key in entries:
            raise ValueError(f"Duplicate answer: {name} {key}")
        entries[key] = answer.strip()
    if set(entries) != set(range(1, 151)):
        raise ValueError(f"Answer coverage is incomplete: {name}")
    return entries


def parse_questions(name: str, slug: str) -> list[dict]:
    source = (SOURCE / f"{name}-exercises-150.md").read_text(encoding="utf-8")
    chunks = NUMBER.split(source)
    answers = load_answers(name)
    rows = []
    for index in range(1, len(chunks), 2):
        number = int(chunks[index])
        block = chunks[index + 1]
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        prompt = next((line for line in lines if not line.startswith(("【", "#", "答案：")) and line != "---"), "")
        translation = next((line[1:-1] for line in lines if line.startswith("【") and line.endswith("】")), "")
        if not prompt or not translation:
            raise ValueError(f"Incomplete source question: {name} {number}")
        heading = SECTION.findall(chunks[index - 1])
        if heading:
            current_section = heading[-1][1]
        if number > 50:
            current_section = "混合練習"
        answer = answers[number]
        focus, contrast = rule(slug, prompt)
        task = prompt.split(":", 1)[0] if ":" in prompt else "閱讀、比較或解釋"
        steps = [
            f"這題表達：{translation}",
            f"題目要求：{task}。先保留原句的人物、時間、否定和意思。",
            f"英文線索：{prompt}",
            focus,
            f"示範寫法：{answer}",
            contrast,
            f"再讀一次示範答案：{answer} 檢查它是否保留了這句中文的意思：{translation}",
        ]
        rows.append({
            "id": f"{slug}-{number:03d}", "number": number,
            "section": current_section, "prompt": prompt, "translation": translation,
            "answer": answer, "answers": [answer, *ACCEPTED_ALTERNATIVES.get((slug, number), ())],
            "mode": classify(prompt, answer),
            "steps": [{"title": title, "body": body} for title, body in zip(STEP_TITLES, steps)],
        })
    if [item["number"] for item in rows] != list(range(1, 151)):
        raise ValueError(f"Question sequence is incomplete: {name}")
    return rows


def main() -> None:
    modules = []
    for slug, source_name, title, chinese in CONFIG:
        questions = parse_questions(source_name, slug)
        modules.append({"slug": slug, "title": title, "chinese": chinese, "questions": questions})
        modes = {mode: sum(q["mode"] == mode for q in questions) for mode in ("exact", "self-review")}
        print(slug, len(questions), modes)
    payload = json.dumps(modules, ensure_ascii=False, separators=(",", ":"))
    output = ROOT / "grammar-three-sets-data.js"
    output.write_text("/* Generated from the supplied grammar exercise files and reviewed model answers. */\nwindow.EDMUND_GRAMMAR_THREE_SETS = Object.freeze(" + payload + ");\n", encoding="utf-8")
    print(output, output.stat().st_size)


if __name__ == "__main__":
    main()
