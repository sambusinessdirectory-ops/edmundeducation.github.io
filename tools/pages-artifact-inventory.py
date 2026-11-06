#!/usr/bin/env python3
"""Measure the directory that is about to be uploaded, across all builders."""
import argparse
from collections import Counter
import os
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("site", type=Path)
parser.add_argument("--budget", type=int, default=1_000_000_000)
parser.add_argument("--enforce", action="store_true")
args = parser.parse_args()
# Editorial QA reports are build inputs. Student content and PDF manuals remain public.
for report in ("MCQ-REVIEW.json", "MCQ-REVIEW.md", "PDF-ANSWER-AUDIT.json", "PDF-ANSWER-REVIEW.md",
               "PDF-ORPHAN-ANSWER-REVIEW.json", "PDF-PLAIN-ANSWER-REVIEW.json", "PDF-SOUND-ANSWER-REVIEW.json"):
    (args.site / "polysemy-lab" / report).unlink(missing_ok=True)
directories = Counter()
largest_files = []
files = 0
for path in args.site.rglob("*"):
    if path.is_file():
        size = path.stat().st_size
        relative = path.relative_to(args.site)
        directories[relative.parts[0]] += size
        largest_files.append((size, str(relative)))
        files += 1
if not files:
    raise SystemExit("Empty Pages artifact")
total = sum(directories.values())
lines = [f"Prepared artifact: {total:,} uncompressed bytes across {files:,} files (budget {args.budget:,}).", "",
         "| Path | Bytes |", "|---|---:|"]
lines.extend(f"| {path} | {size:,} |" for path,size in directories.most_common(12))
lines.extend(["", "| Largest file | Bytes |", "|---|---:|"])
lines.extend(f"| {path} | {size:,} |" for size,path in sorted(largest_files, reverse=True)[:12])
summary = "\n".join(lines)
print(summary)
if "GITHUB_STEP_SUMMARY" in os.environ:
    with open(os.environ["GITHUB_STEP_SUMMARY"],"a") as output:
        print(summary,file=output)
if total > args.budget:
    print("::warning::Uncompressed Pages files exceed the size budget. See the directory inventory.")
    if args.enforce:
        raise SystemExit(1)
