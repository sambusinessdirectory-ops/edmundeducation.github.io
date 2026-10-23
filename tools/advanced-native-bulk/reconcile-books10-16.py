"""Classify exact/near expression candidates without making semantic merge decisions."""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "course-materials/advanced-native"
ROWS = [json.loads(line) for line in (ROOT / "books10-16/source-inventory.jsonl").read_text().splitlines() if line.strip()]
OLD = json.loads((ROOT / "provenance/source-labels.json").read_text())
MANIFEST = json.loads((ROOT / "drafts-books10-16/batch-manifest.json").read_text())
PILOT = {
    source["occurrenceId"]
    for draft_file in (ROOT / "drafts-books10-16" / name for name in MANIFEST["batchFiles"])
    for lesson in json.loads(draft_file.read_text())["lessons"]
    for source in lesson["sources"]
}


def norm(value):
    return re.sub(r"\s+", " ", value.lower().replace("’", "'")).strip(" .,:;!?\"'")


old_by_id = {row["inventoryId"]: row for row in OLD}
old_by_key = defaultdict(list)
tokens = defaultdict(set)
for index, row in enumerate(OLD):
    phrase = norm(row["sourcePhrase"])
    old_by_key[phrase].append(row)
    for token in set(re.findall(r"[a-z]{4,}", phrase)) - {"this", "that", "their", "there", "about", "with", "from", "into", "more"}:
        tokens[token].add(index)

first_new = {}
out = []
for row in ROWS:
    phrase = norm(row["expression"])
    exact_old = old_by_key.get(phrase, [])
    candidate_indexes = set()
    for token in set(re.findall(r"[a-z]{4,}", phrase)):
        if len(tokens[token]) <= 100:
            candidate_indexes.update(tokens[token])
    near = []
    for index in candidate_indexes:
        old = OLD[index]
        other = norm(old["sourcePhrase"])
        score = SequenceMatcher(None, phrase, other).ratio()
        if score >= .72 and phrase != other:
            near.append((round(score, 3), old["inventoryId"], old["sourcePhrase"], old["canonicalModuleIds"]))
    near.sort(reverse=True)
    first = first_new.setdefault(phrase, row["sourceId"])
    if row["sourceId"] in PILOT:
        state = "drafted-pending-review-audio-qa"
    elif exact_old:
        state = "exact-existing-phrase-sense-review-pending"
    elif first != row["sourceId"]:
        state = "repeat-in-new-source-sense-review-pending"
    elif near:
        state = "new-phrase-near-existing-review-pending"
    else:
        state = "new-phrase-authoring-pending"
    out.append({
        "sourceId": row["sourceId"], "sourceOrdinal": 2111 + int(row["sourceId"].rsplit("-", 1)[1]),
        "phrase": row["expression"], "book": row["book"], "question": row["question"],
        "sample": row["sample"], "page": row["renderedPdfPage"], "state": state,
        "exactPriorMatches": [{"inventoryId": x["inventoryId"], "canonicalModuleIds": x["canonicalModuleIds"]} for x in exact_old],
        "firstNewSourceId": first if first != row["sourceId"] else None,
        "nearPriorCandidates": [{"score": a, "inventoryId": b, "phrase": c, "canonicalModuleIds": d} for a, b, c, d in near[:3]],
        "decision": None,
    })

summary = dict(Counter(row["state"] for row in out))
summary["total"] = len(out)
summary["uniqueNewCandidatePhrases"] = len({norm(row["phrase"]) for row in out if not row["exactPriorMatches"]})
(ROOT / "books10-16/reconciliation-register.jsonl").write_text("".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in out))
(ROOT / "books10-16/reconciliation-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(summary, ensure_ascii=False, indent=2))
