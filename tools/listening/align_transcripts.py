#!/usr/bin/env python3
"""Map PDF rows to real ASR word boundaries, with an explicit review report.

No equal-duration/character-count timing estimates are used. Low-confidence rows
are reported instead of silently claiming precise alignment.
"""
import argparse
import difflib
import json
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NUMBER_WORDS = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split()
NUMBER_WORDS += ["twenty"+word for word in NUMBER_WORDS[1:10]] + ["thirty"]
NUMBER_WORDS += ["thirty"+word for word in NUMBER_WORDS[1:10]] + ["forty"]


def normalize(text, speaker=False):
    if speaker: text = re.sub(r"^[A-Z][A-Z .’'-]{1,30}:\s*", "", text)
    text = re.sub(r"\b\d{1,2}\b", lambda match: NUMBER_WORDS[int(match[0])] if int(match[0])<len(NUMBER_WORDS) else match[0], text.lower())
    return re.sub(r"[^a-z0-9]", "", text)


def align(rows, recording):
    expected_rows = [normalize(row["en"], True) for row in rows]
    expected = "".join(expected_rows)
    observed, char_words = "", []
    for index, word in enumerate(recording["words"]):
        token = normalize(word["text"])
        observed += token
        char_words.extend([index]*len(token))
    matcher = difflib.SequenceMatcher(None, expected, observed, autojunk=False)
    mapping = {}
    for left, right, size in matcher.get_matching_blocks():
        for offset in range(size): mapping[left+offset] = char_words[right+offset]
    ranges, warnings, cursor = [], [], 0
    for index, token in enumerate(expected_rows):
        matched = [mapping[pos] for pos in range(cursor, cursor+len(token)) if pos in mapping]
        coverage = len(matched)/max(1,len(token))
        if matched:
            first, last = recording["words"][min(matched)], recording["words"][max(matched)]
            timing = {"start": round(first["start"],3), "end": round(last["end"],3), "coverage": round(coverage,4)}
            if timing["end"] <= timing["start"]: warnings.append({"row": index, "reason": "zero_duration", "text": rows[index]["en"]})
            if coverage < .8: warnings.append({"row": index, "reason": "low_coverage", "coverage": round(coverage,3), "text": rows[index]["en"]})
        else:
            timing = {"start": None, "end": None, "coverage": 0}
            warnings.append({"row": index, "reason": "no_match", "text": rows[index]["en"]})
        ranges.append(timing); cursor += len(token)
    return {"duration": recording["duration"], "audioUrl": recording["url"], "audioSha256": recording["audioSha256"],
            "transcriptSha256": hashlib.sha256(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),
            "method": recording["model"]+"-monotonic-word-alignment-v1", "coverage": round(len(mapping)/max(1,len(expected)),4), "lines": ranges}, warnings


def question_cue(question, analysis, rows, ranges):
    # Quotes in the authored explanations identify the supporting speech.
    quotes = [normalize(quote) for quote in re.findall(r'[“"]([^”"]+)[”"]', analysis["explanation"])
              if len(re.findall(r"[A-Za-z]+", quote)) >= 3 and "___" not in quote]
    answers = [normalize(answer) for answer in [question.get("answer", ""), *question.get("alternatives", [])] if len(answer)>1]
    scores = []
    for index, row in enumerate(rows):
        text = normalize(row["en"], True)
        score = 0
        for quote in quotes:
            block = difflib.SequenceMatcher(None, quote, text, autojunk=False).find_longest_match()
            if block.size >= 12: score = max(score, block.size*(block.size/len(quote)))
        if any(answer in text for answer in answers): score += 20
        scores.append((score,index))
    score,index = max(scores)
    timing = ranges[index]
    if score < 12 or timing["start"] is None: return None
    return {"part": question["part"], "time": timing["start"], "line": index, "evidenceScore": round(score,2)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audio-cache", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    report = []
    review_path=Path(__file__).parent/'timing-reviews.json'
    reviews=json.loads(review_path.read_text()) if review_path.exists() else []
    for path in sorted((ROOT / "assets/listening/practices").glob("practice-*.json")):
        data = json.loads(path.read_text()); p = data["practice"]
        for part in range(1,5):
            audio = args.audio_cache / f"practice-{p}-part-{part}.json"
            if not audio.exists(): continue
            rows = data["transcript"][str(part)]
            timings, warnings = align(rows, json.loads(audio.read_text()))
            refinement_file=audio.with_suffix('.refinements.json')
            if refinement_file.exists():
                refinement=json.loads(refinement_file.read_text())
                fingerprint=hashlib.sha256(json.dumps(rows,ensure_ascii=False).encode()).hexdigest()
                if refinement['transcriptSha256']==fingerprint:
                    for index,value in refinement['rows'].items():timings['lines'][int(index)]=value
                    warnings=[warning for warning in warnings if timings['lines'][warning['row']]['coverage']<.8]
            for review in reviews:
                if review['practice']!=p or review['part']!=part:continue
                index=review['row']
                if review['audioSha256']!=timings['audioSha256'] or review['transcriptText']!=rows[index]['en']:
                    raise ValueError(f'Stale timing review: Practice {p} part {part} row {index}')
                timings['lines'][index].update(start=review['start'],end=review['end'],reviewed=True,reviewMethod='focused-audio-window',reviewNote=review['reason'])
                warnings=[warning for warning in warnings if warning['row']!=index]
            for index,line in enumerate(timings['lines']):
                if line['start'] is None or line['end'] is None:continue
                if index and timings['lines'][index-1]['end'] is not None and line['start']<timings['lines'][index-1]['end']-.05:
                    warnings.append({'row':index,'reason':'overlap','text':rows[index]['en']})
            lengths=[len(normalize(row['en'],True)) for row in rows]
            timings['coverage']=round(sum(n*line['coverage'] for n,line in zip(lengths,timings['lines']))/sum(lengths),4)
            data["timings"]["parts"][str(part)] = timings
            for warning in warnings: report.append({"practice":p,"part":part,**warning})
            for question in data["parts"][part-1]["questions"]:
                for number in question.get("numbers",[question.get("number")]):
                    analysis=data['analysis'][str(number)]
                    evidence=analysis.get('evidenceRows')
                    cue = ({'part':part,'time':timings['lines'][evidence[0]]['start'],'line':evidence[0],'evidenceScore':100}
                           if evidence else question_cue(question,analysis,rows,timings['lines']))
                    if cue: data["timings"]["questions"][str(number)] = cue
                    else: report.append({"practice":p,"part":part,"question":number,"reason":"cue_needs_review"})
            print(f"P{p}.{part}: {len(rows)} rows; coverage {timings['coverage']:.1%}; {len(warnings)} review rows",flush=True)
        path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
    args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")


if __name__ == "__main__": main()
