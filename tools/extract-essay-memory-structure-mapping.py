"""Extract per-sentence IELTS Task 2 structure mappings from the supplied DOCX.

Usage: python tools/extract-essay-memory-structure-mapping.py SOURCE.docx
The output is a reviewable source ledger, not automatically approved lesson cards.
"""
import json
import re
import sys
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tools" / "essay-memory-structure-mapping.json"
CATEGORIES = {
    "Opinion": "opinion",
    "Discuss Both Views": "discuss-both-views",
    "Advantages and Disadvantages": "advantage-disadvantage",
    "Cause and Solution": "cause-solution",
    "Direct Questions": "direct-question",
}
SOURCE = re.compile(r"Source\s+P(\d+)\s*·\s*S(\d+)")
ESSAY = re.compile(r"Model Essay (\d+)")
NUMBER = re.compile(r"^(\d+)\s+")


def extract(path: Path):
    document = Document(path)
    category = None
    essay = None
    ledger = {}
    for child in document.element.body.iterchildren():
        if child.tag == qn("w:p"):
            paragraph = Paragraph(child, document).text.strip()
            if paragraph in CATEGORIES:
                category = CATEGORIES[paragraph]
            match = ESSAY.fullmatch(paragraph)
            if match:
                essay = int(match.group(1))
        elif child.tag == qn("w:tbl"):
            if category is None or essay is None:
                raise ValueError("Unidentified essay table")
            key = f"{category}:{essay}"
            if key in ledger:
                raise ValueError(f"Duplicate essay table: {key}")
            items = []
            for row in Table(child, document).rows:
                cell = row.cells[0].text
                source = SOURCE.search(cell)
                if not source:
                    continue
                row_number = NUMBER.match(cell)
                if not row_number:
                    raise ValueError(f"Missing row number: {key}: {cell[:60]}")
                formula = cell[: source.start()].strip()
                formula = NUMBER.sub("", formula, count=1).strip()
                formula = " ".join(formula.split())
                meaning = " ".join(row.cells[1].text.split())
                usage = " ".join(row.cells[2].text.split())
                if not formula or not meaning or not usage:
                    raise ValueError(f"Incomplete mapping: {key}, row {row_number.group(1)}")
                items.append({
                    "row": int(row_number.group(1)),
                    "paragraph": int(source.group(1)),
                    "sentence": int(source.group(2)),
                    "formula": formula,
                    "meaning": meaning,
                    "usage": usage,
                })
            ledger[key] = items
    if len(ledger) != 238 or sum(map(len, ledger.values())) != 4477:
        raise ValueError(f"Unexpected mapping size: {len(ledger)} essays, {sum(map(len, ledger.values()))} rows")
    return ledger


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    rows = extract(Path(sys.argv[1]))
    OUT.write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"Wrote {len(rows)} essays and {sum(map(len, rows.values()))} structure rows to {OUT}")
