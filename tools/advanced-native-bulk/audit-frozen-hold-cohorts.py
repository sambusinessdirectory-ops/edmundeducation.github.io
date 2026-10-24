#!/usr/bin/env python3
"""Check that every hold at a frozen checkpoint has one source-specific review row.

This is coverage evidence, not an automatic decision to exclude or publish a row.
"""

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = Path("course-materials/advanced-native")
DECISIONS = BASE / "books10-16"
REVIEWS = BASE / "reviews-books10-16"
BASELINE = "8775dda2"
FILES = (
    "read-only-first100-current-holds-2130-2727-a.json",
    "read-only-second100-current-holds-2729-3107-a.json",
    "read-only-third100-current-holds-3110-3528-a.json",
    "read-only-fourth100-current-holds-3530-3955-a.json",
    "read-only-fifth101-current-holds-3956-4400-a.json",
    "read-only-last100-held-disposition-4402-4715-b.json",
)


def frozen_bytes(path):
    return subprocess.check_output(["git", "show", f"{BASELINE}:{path.as_posix()}"], cwd=ROOT)


def decisions_from(lines):
    return [json.loads(line) for line in lines.splitlines() if line.strip()]


def main():
    baseline = {}
    current = {}
    for path in sorted((ROOT / DECISIONS).glob("editorial-decisions-*.jsonl")):
        rel = path.relative_to(ROOT)
        for row in decisions_from(frozen_bytes(rel).decode("utf-8")):
            if row["action"] == "hold-editorial":
                baseline[row["sourceOrdinal"]] = row
        for row in decisions_from(path.read_text()):
            current[row["sourceOrdinal"]] = row

    reviewed = {}
    report_files = []
    for filename in FILES:
        path = ROOT / REVIEWS / filename
        data = path.read_bytes()
        rows = json.loads(data)["rows"]
        report_files.append({"path": (REVIEWS / filename).as_posix(), "sha256": hashlib.sha256(data).hexdigest(), "rows": len(rows)})
        for row in rows:
            ordinal = row["sourceOrdinal"]
            if ordinal in reviewed:
                raise SystemExit(f"Duplicate reviewed ordinal: {ordinal}")
            old = baseline.get(ordinal)
            if old is None:
                raise SystemExit(f"Reviewed row was not a frozen hold: {ordinal}")
            if row["sourceId"] != old["sourceId"] or row["expression"] != old["phrase"]:
                raise SystemExit(f"Source identity changed: {ordinal}")
            if not (row.get("rationale") or row.get("reason")):
                raise SystemExit(f"No source-specific reason: {ordinal}")
            reviewed[ordinal] = row

    missing = sorted(set(baseline) - set(reviewed))
    if missing:
        raise SystemExit(f"Frozen holds without a cohort review: {missing}")
    action_counts = {}
    promoted = []
    for ordinal in sorted(reviewed):
        action = current[ordinal]["action"]
        action_counts[action] = action_counts.get(action, 0) + 1
        if action != "hold-editorial":
            promoted.append({"sourceOrdinal": ordinal, "sourceId": current[ordinal]["sourceId"], "action": action, "canonicalId": current[ordinal]["canonicalId"]})
    output = {
        "status": "frozen-hold-review-coverage-only-not-release-approval",
        "baselineCommit": BASELINE,
        "frozenHolds": len(baseline),
        "reviewedExactlyOnce": len(reviewed),
        "reportFiles": report_files,
        "currentActionsForFrozenHolds": action_counts,
        "promotedSinceBaseline": promoted,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
