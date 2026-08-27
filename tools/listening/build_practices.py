#!/usr/bin/env python3
"""Build versioned listening practice data from audited PDF extraction.

Questions, answer variants, explanations and bilingual rows retain source pages.
Image questions remain images (with extracted text when available), not guesses.
Run align_transcripts.py afterwards; missing timings fail the release validator.
"""
import argparse
import json
import re
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "assets/listening/practices"
CJK = r"\u3400-\u9fff"
ANALYSIS = re.compile(r"(?m)^(\d{1,2})(?:\s*[–—-]\s*(\d{1,2}))?\.?\s*答案\s*[：:]\s*([^\n]+)")
# These standalone headings begin the numbered matching items, not the last
# option above them. PDF plain-text extraction loses the visual paragraph gap.
# Keep them in the original paper but exclude them from radio-button labels.
# New source layouts must have their option boundaries visually audited too.
OPTION_SECTION_HEADINGS = {
    "Activities", "Aspects of human geography", "Shows", "Year", "Food trends",
    "Footwear", "Festival workshops", "Club members", "Types of books",
    "Area of voluntary work", "Countries", "Jobs", "Modules on Veterinary Science course",
    "Locations on the farm", "Aspects of the production", "Events management skills",
    "Hotels", "Items of sporting equipment", "Pictures",
    "Food available at serving points in Food Hall", "Job opportunities", "Cities",
    "Position in family",
}


def clean(value):
    value = re.sub(r"\s+", " ", str(value or "").replace("\u00ad", "")).strip()
    # Wrapped Chinese characters must not gain artificial word spaces.
    return re.sub(rf"(?<=[{CJK}])\s+(?=[{CJK}，。！？；：、）」』])", "", value)


def source_text(page, top=70, bottom=718):
    # Rebuild text outside an embedded source image without duplicating its OCR.
    words = [word for word in page["words"] if top <= (word["top"]+word["bottom"])/2 < bottom]
    lines = []
    for word in words:
        if not lines or abs(word["top"] - lines[-1][0]) > 4:
            lines.append((word["top"], [word["text"]]))
        else:
            lines[-1][1].append(word["text"])
    return "\n".join(" ".join(words) for _, words in lines)


def question_blocks(pages, document, practice):
    result = []
    for page in pages:
        images = [image for image in page["images"] if image["top"] >= 70
                  and image["bottom"] <= 706 and image["x1"]-image["x0"] > 120]
        cursor = 70
        for index, image in enumerate(sorted(images, key=lambda image: image["top"])):
            text = source_text(page, cursor, image["top"])
            if text.strip(): result.append({"type": "text", "text": text, "page": page["page"]})
            name = f"practice-{practice}-page-{page['page']}-{index+1}.webp"
            target = OUTPUT / "images" / name
            if not target.exists():
                bbox = (image["x0"], image["top"], image["x1"], image["bottom"])
                picture = document.pages[page["page"]-1].crop(bbox).to_image(resolution=180).original
                picture.save(target, "WEBP", quality=92)
            result.append({"type": "image", "src": f"assets/listening/practices/images/{name}",
                           "alt": f"Practice {practice}, source question diagram/table, PDF page {page['page']}",
                           "text": source_text(page, image["top"], image["bottom"]), "page": page["page"]})
            cursor = image["bottom"]
        text = source_text(page, cursor)
        if text.strip(): result.append({"type": "text", "text": text, "page": page["page"]})
    return result


def parse_analysis(pages):
    result, groups = {}, []
    content, offsets = "", []
    for page in pages:
        offsets.append((len(content), page["page"]))
        content += page["text"] + "\n"
    matches = list(ANALYSIS.finditer(content))
    for index, match in enumerate(matches):
        end = matches[index+1].start() if index+1 < len(matches) else len(content)
        explanation = content[match.end():end].strip()
        explanation = re.sub(r"(?m)^Part [1-4]\s*$|^Questions? \d+[^\n]*$", "", explanation).strip()
        numbers = list(range(int(match[1]), int(match[2] or match[1])+1))
        source_pages = sorted({p for start, p in offsets if match.start() <= start < end}
                              | {max((start, p) for start, p in offsets if start <= match.start())[1]})
        for number in numbers:
            result[str(number)] = {"answer": clean(match[3]), "explanation": clean(explanation), "sourcePages": source_pages}
        if len(numbers) > 1:
            groups.append({"numbers": numbers, "answer": clean(match[3])})
    return result, groups


def options_from(text):
    matches = list(re.finditer(r"(?m)^([A-I])[.)]?\s+(.+)", text))
    options = []
    for index, match in enumerate(matches):
        end = matches[index+1].start() if index+1 < len(matches) else len(text)
        value = text[match.start(2):end]
        value = re.split(r"\n(?:Questions?\s+\d|\d{1,2}[.)]?\s+)", value)[0]
        lines = value.splitlines()
        boundary = next((i for i, line in enumerate(lines) if i > 0 and clean(line) in OPTION_SECTION_HEADINGS), len(lines))
        value = "\n".join(lines[:boundary])
        options.append({"key": match[1], "en": clean(value), "zh": ""})
    return options


def make_questions(part, pages, answers, analysis, groups):
    text = "\n".join(page["text"] for page in pages)
    # The question paper, not a possibly misfiled explanation page, defines
    # which answers form an unordered multi-select group.
    groups = [{"numbers": list(range(int(match[1]),int(match[2])+1))}
              for match in re.finditer(r"Questions?\s+(\d+)\s*(?:and|[–—-])\s*(\d+)\s*\nChoose TWO", text)]
    questions = []
    skip = set()
    for number in range((part-1)*10+1, part*10+1):
        if number in skip: continue
        answer = answers[str(number)]
        line = re.search(rf"(?m)^(?:[●•·−-]\s*)?{number}[.)]?\s+(.+)", text)
        blank = re.search(rf"(?m)^([^\n]*?)\b{number}\s+_{{2,}}([^\n]*)", text)
        end = len(text)
        if line:
            next_question = re.search(r"(?m)^(?:Questions?\s+\d|\d{1,2}[.)]?\s+)", text[line.end():])
            if next_question: end = line.end()+next_question.start()
        section = text[line.end():end] if line else ""
        own_options = options_from(section)
        group = next((group for group in groups if number == group["numbers"][0]), None)
        prompt = clean(line[1]).replace("_", "").strip() if line else ""
        if line and own_options:
            prompt = clean(text[line.start(1):end].split('\nA.')[0].split('\nA ')[0])
        if blank: prompt = clean(blank[0])
        # Quoted question wording is supplied in the source analysis when an
        # embedded diagram has no searchable text. It is not generated content.
        if not prompt:
            quote = re.search(r"[“\"]([^”\"]*_{2,}[^”\"]*)[”\"]", analysis[str(number)]["explanation"])
            prompt = clean(quote[1]) if quote else f"Question {number} — refer to the original question paper above."
        if group:
            numbers = group["numbers"]
            heading = re.search(rf"(?m)^Questions?\s+{number}\s*(?:and|[–—-])\s*{numbers[-1]}\b", text)
            if heading:
                following = text[heading.end():]
                next_heading = re.search(r"(?m)^Questions?\s+\d", following)
                section = following[:next_heading.start()] if next_heading else following
            choices = options_from(section)
            if len(choices) >= 3:
                qprompt = re.split(r"(?m)^[A-I][.)]?\s", section)[0]
                questions.append({"type": "multi", "part": part, "numbers": numbers,
                                  "prompt": clean(qprompt), "translation": "",
                                  "answers": [answers[str(n)] for n in numbers], "options": choices})
                skip.update(numbers[1:]); continue
        variants = [clean(value) for value in re.split(r"\s*[/;]\s*", answer)]
        if re.fullmatch("[A-I]", answer):
            # Matching and map labels use the same accessible radio input as
            # multiple choice. Full shared options/diagrams remain above.
            choices = own_options if len(own_options) >= 3 else []
            if not choices:
                preceding = text[:line.start()] if line else text
                headings = list(re.finditer(r"(?m)^Questions?\s+\d", preceding))
                shared = preceding[headings[-1].start():] if headings else preceding
                choices = options_from(shared)
            if not choices or len({item["key"] for item in choices}) != len(choices):
                choices = [{"key": key, "en": key, "zh": ""} for key in "ABCDEFGHI"]
            questions.append({"type": "choice", "part": part, "number": number,
                              "prompt": prompt, "translation": "", "answer": answer, "options": choices})
        else:
            questions.append({"type": "gap", "part": part, "number": number,
                              "prompt": prompt, "translation": "", "answer": variants[0], "alternatives": variants[1:]})
    return questions


def build(raw, source_dir):
    number = raw["practice"]
    pages = raw["pages"]
    answer_pages = [page for page in pages if re.match(r"Part [1-4] Ans", page["text"])]
    first_answer = min(page["page"] for page in answer_pages)
    first_analysis = next(page["page"] for page in pages if ANALYSIS.search(page["text"]))
    analysis, groups = parse_analysis([page for page in pages if page["page"] >= first_analysis])
    answers = {}
    for page in answer_pages:
        for match in re.finditer(r"(?m)^(\d{1,2})[.)]?\s+(.+)$", page["text"]):
            answers[match[1]] = clean(match[2])
    corrections = []
    overrides = json.loads((Path(__file__).parent / "source-overrides.json").read_text()).get(str(number), {})
    for key, override in overrides.get("answers", {}).items():
        corrections.append({"question": int(key), "originalAnswer": answers.get(key), **override})
        answers[key] = override["answer"]
    for q in range(1, 41):
        if str(q) not in answers:
            group = next((group for group in groups if q in group["numbers"]), None)
            if not group: raise ValueError(f"Practice {number}: missing answer {q}")
            values = re.findall(r"\b[A-I]\b", group["answer"])
            answers[str(q)] = values[group["numbers"].index(q)]
            corrections.append({"question": q, "reason": "Missing from summary answer key; recovered from explicit detailed analysis", "answer": answers[str(q)]})
    if set(analysis) != {str(q) for q in range(1,41)}: raise ValueError(f"Practice {number}: incomplete analysis {set(analysis)}")
    transcript = {str(p): [] for p in range(1,5)}
    current = None
    for page in pages:
        if page["page"] >= first_analysis: break
        if page["page"] <= max(p["page"] for p in answer_pages): continue
        for table in page["tables"]:
            for cells in table["rows"]:
                cells = [value for value in cells if value is not None]
                if len(cells) < 2: continue
                en, zh = clean(cells[0]), clean(cells[-1])
                part_marker = re.fullmatch(r"PART ([1-4])", en, re.I)
                if part_marker: current = part_marker[1]; continue
                if not current or not en or en == "English": continue
                if "Knowledge pays" in en or "港大畢業" in en: continue
                rows = transcript[current]
                # Join true PDF page continuations, keeping every source page.
                continuation = rows and (not zh or (page["page"] != rows[-1]["sourcePages"][-1]
                    and not re.search(r"[.!?。！？][’\"”']?$", rows[-1]["en"])
                    and not re.match(r"[A-Z][A-Z ]+:", en)))
                if continuation:
                    rows[-1]["en"] = clean(rows[-1]["en"] + " " + en)
                    rows[-1]["zh"] = clean(rows[-1]["zh"] + " " + zh)
                    rows[-1]["sourcePages"] = sorted(set(rows[-1]["sourcePages"] + [page["page"]]))
                else:
                    rows.append({"en": en, "zh": zh, "sourcePages": [page["page"]]})
    if overrides.get("analysis"):
        for key, override in overrides["analysis"].items():
            part = (int(key)-1)//10+1
            evidence = [transcript[str(part)][index] for index in override["rows"]]
            analysis[key] = {"answer": answers[key], "explanation": override["explanation"] + " 錄音依據：“" + " ” “".join(row["en"] for row in evidence) + "”",
                             "sourcePages": sorted({page for row in evidence for page in row["sourcePages"]}),
                             "evidenceRows": override["rows"], "editorialNote": "原PDF解析誤用了Practice 11；本解析按本練習的原題、答案及雙語錄音稿重新核對。"}
        corrections.append({"reason": "The PDF's 40 explanation entries belong to Practice 11. Replaced with explanations grounded in Practice 12 questions and transcript.", "questions": list(range(1,41))})
    for key, rows in overrides.get("cueRows", {}).items():
        analysis[key]["evidenceRows"] = rows
    parts, current, question_pages = [], None, {p: [] for p in range(1,5)}
    for page in pages:
        if page["page"] >= first_answer: break
        if re.fullmatch(r"Part [1-4]", page["text"].strip()):
            current = int(page["text"].strip()[-1]); continue
        if current and (page["text"].strip() or any(image["top"]>70 and image["bottom"]<706 for image in page["images"])):
            question_pages[current].append(page)
    with pdfplumber.open(source_dir / raw["file"]) as document:
        for part in range(1,5):
            parts.append({"part": part, "instruction": "Answer the questions using the instructions in the original question paper below.",
                          "instructionZh": "請按下方原題的字數限制及指示作答；錄音稿提供中英對照。",
                          "sourcePages": [page["page"] for page in question_pages[part]],
                          "sourceBlocks": question_blocks(question_pages[part], document, number),
                          "questions": make_questions(part, question_pages[part], answers, analysis, groups)})
    for key, rows in transcript.items():
        for index, row in enumerate(rows): row["id"] = f"p{key}-row-{index+1:03}"
        if len(rows)<20 or any(not row["zh"] for row in rows): raise ValueError(f"Practice {number} part {key}: incomplete bilingual transcript")
    return {"schemaVersion": 1, "practice": number, "title": f"IELTS Listening Practice {number}",
            "source": {"file": raw["file"], "sha256": raw["sha256"], "pageCount": len(pages), "corrections": corrections},
            "parts": parts, "transcript": transcript, "analysis": analysis,
            "timings": {"parts": {}, "questions": {}}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--extracted", type=Path, required=True)
    parser.add_argument("--source-dir", type=Path, required=True)
    args = parser.parse_args()
    (OUTPUT / "images").mkdir(parents=True, exist_ok=True)
    for path in sorted(args.extracted.glob("practice-*.json"), key=lambda path:int(path.stem.split('-')[1])):
        data = build(json.loads(path.read_text()), args.source_dir)
        target = OUTPUT / f"practice-{data['practice']}.json"
        if target.exists(): data["timings"] = json.loads(target.read_text()).get("timings", data["timings"])
        target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        print(f"Practice {data['practice']}: 40 questions, {sum(map(len, data['transcript'].values()))} bilingual rows; {data['source']['corrections']}", flush=True)


if __name__ == "__main__":
    main()
