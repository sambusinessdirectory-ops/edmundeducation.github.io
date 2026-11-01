"""Join completed question-audio partitions and verify coverage before release."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "ielts-writing-preview"
VOICE_CYCLE = ("british-male", "british-female", "american-female")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("partitions", nargs="+", type=Path)
    args = parser.parse_args()
    questions = [("task1", row) for row in json.loads((DATA / "task1-diagrams.json").read_text())]
    questions += [("task2", row) for row in json.loads((DATA / "task2-questions.json").read_text())]
    manifest = {}
    for source in args.partitions:
        for key, entry in json.loads(source.read_text()).items():
            if key in manifest and manifest[key] != entry:
                raise ValueError(f"Conflicting audio entry: {key}")
            manifest[key] = entry
    expected = {f"{section}:{row['id']}" for section, row in questions}
    if set(manifest) != expected:
        raise ValueError(f"Expected {len(expected)} audio entries; missing {sorted(expected - set(manifest))}, extra {sorted(set(manifest) - expected)}")
    for index, (section, row) in enumerate(questions):
        entry = manifest[f"{section}:{row['id']}"]
        if entry["voice"] != VOICE_CYCLE[index % 3]:
            raise ValueError(f"Wrong voice for {row['id']}")
        text = (row.get("quizPrompt") or row["prompt"]) if section == "task1" else row["en"]
        if entry["sourceSha256"] != hashlib.sha256(text.encode("utf-8")).hexdigest():
            raise ValueError(f"Audio text is stale for {row['id']}")
        path = ROOT / entry["path"]
        if not path.is_file() or path.stat().st_size < 1000:
            raise ValueError(f"Missing or invalid audio: {path}")
    target = DATA / "question-audio.json"
    target.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(f"Validated {len(manifest)} question clips: {target}")


if __name__ == "__main__":
    main()
