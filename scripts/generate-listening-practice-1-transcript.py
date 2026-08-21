#!/usr/bin/env python3
"""Generate the bilingual Practice 1 transcript from the source PDF extraction."""
import json
from pathlib import Path

SOURCE = Path("/private/tmp/ielts-practice1-pages.json")
OUTPUT = Path(__file__).resolve().parents[1] / "listening-practice-1-transcript.js"
PART_PAGES = {1: range(26, 34), 2: range(34, 41), 3: range(42, 50), 4: range(50, 56)}

def clean(value):
    return " ".join(str(value or "").replace("\u00ad", "").split())

def usable(english, chinese):
    bad = ("Edmund Education", "有免費每日通訊", "Knowledge pays", "港大畢業")
    return bool(english and chinese and english not in {"English", "PART 1", "PART 2", "PART 3", "PART 4"} and not any(mark in english for mark in bad))

pages = json.loads(SOURCE.read_text(encoding="utf-8"))
parts = {}
for part, numbers in PART_PAGES.items():
    rows = []
    for page_number in numbers:
        for table in pages[str(page_number)]["tables"]:
            for row in table:
                if not row or not row[0]:
                    continue
                english = clean(row[0])
                chinese = next((clean(cell) for cell in reversed(row[1:]) if clean(cell)), "")
                if usable(english, chinese):
                    rows.append({"en": english, "zh": chinese})
    parts[str(part)] = rows

payload = json.dumps(parts, ensure_ascii=False, indent=2)
OUTPUT.write_text(f"window.EDMUND_IELTS_LISTENING_PRACTICE_1_TRANSCRIPT = Object.freeze({payload});\n", encoding="utf-8")
print(f"Wrote {OUTPUT} with " + ", ".join(f"Part {part}: {len(rows)} lines" for part, rows in parts.items()))
