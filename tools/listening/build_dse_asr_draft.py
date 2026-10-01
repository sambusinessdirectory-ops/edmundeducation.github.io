#!/usr/bin/env python3
"""Prepare a timed, auditable transcript draft from locally transcribed exam audio.

Speech recognition is a draft only. Review the output against the source recording
before adding its script tag to the published listening page.
"""

import argparse
import json
from pathlib import Path


def read_rows(paths, stitch_at=None):
    rows = []
    for source_index, path in enumerate(paths):
        for line in Path(path).read_text(encoding="utf-8").splitlines():
            if line.strip():
                row = json.loads(line)
                if stitch_at is not None and ((source_index == 0 and row["start"] >= stitch_at)
                                           or (source_index > 0 and row["start"] < stitch_at)):
                    continue
                rows.append(row)
    return sorted(rows, key=lambda item: (item["start"], item["end"]))


def tidy(text, year):
    text = " ".join(text.split())
    if year == 2025:
        replacements = {
            "C friends": "Sea Friends",
            "C Friends": "Sea Friends",
            "see friends": "Sea Friends",
            "Get Fit": "Getfit",
            "get fit": "Getfit",
            "NRG sex": "N.R.G. 6",
            "NRG six": "N.R.G. 6",
            "NRG6": "N.R.G. 6",
            "NRG 6": "N.R.G. 6",
            "NRG": "N.R.G.",
            "part three A": "Part A",
        }
        for before, after in replacements.items():
            text = text.replace(before, after)
        text = text.replace("N.R.G. .", "N.R.G.")
    if year == 2026:
        text = (text.replace("James Lee", "James Leigh")
                .replace("Ian Fraser", "Iain Fraser")
                .replace("Ian", "Iain")
                .replace("Monica Lamb", "Monica Lam")
                .replace("Asher Giles", "Asha Giles")
                .replace("part 3a", "Part A"))
    return text


def build(rows, cuts, year):
    result = {}
    first_speech = {2025: (551, 937, 1355, 1814), 2026: (534, 999, 1553, 2010)}[year]
    for task, (start, stop) in enumerate(cuts, 1):
        item_rows = []
        for row in rows:
            absolute = float(row["start"])
            if not start <= absolute < stop:
                continue
            text = tidy(row["text"], year)
            if not text:
                continue
            speaker = "Announcer" if absolute < first_speech[task - 1] else "Conversation"
            if year == 2025 and task == 4 and absolute >= 1814.9:
                speaker = "Sandy Elliot"
            if year == 2026 and task == 4 and absolute >= 2010.5:
                speaker = "Alex Lowry"
            item_rows.append({
                "start": round(absolute - start, 2),
                "end": round(min(float(row["end"]), stop) - start, 2),
                "speaker": speaker,
                "text": text,
            })
        result[task] = item_rows
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--year", type=int, choices=(2025, 2026), required=True)
    parser.add_argument("--asr", action="append", required=True, type=Path)
    parser.add_argument("--stitch-at", type=float, help="Use first ASR source before this second and later sources after it")
    parser.add_argument("--cut", action="append", required=True, help="start:end; one per task")
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    if len(args.cut) != 4:
        parser.error("Exactly four --cut values are required")
    cuts = [tuple(map(float, item.split(":"))) for item in args.cut]
    if any(end <= start for start, end in cuts):
        parser.error("Each cut end must be after its start")
    rows = read_rows(args.asr, args.stitch_at)
    result = build(rows, cuts, args.year)
    payload = json.dumps(result, ensure_ascii=False, separators=(",", ":"))
    args.output.write_text(
        f"// Draft timed transcript derived from the {args.year} source recording.\n"
        f"window.EDMUND_DSE_LISTENING_{args.year}_TRANSCRIPT = {payload};\n",
        encoding="utf-8",
    )
    print({task: len(lines) for task, lines in result.items()})


if __name__ == "__main__":
    main()
