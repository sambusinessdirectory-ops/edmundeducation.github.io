#!/usr/bin/env python3
"""Inventory every graded synonym question and assign three local Kokoro voices."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOICE_ORDER = ("american-female", "british-male", "british-female")
VOICE_IDS = {"american-female": "af_heart", "british-male": "bm_fable", "british-female": "bf_isabella"}


def exported_json(path: Path, name: str):
    source = path.read_text(encoding="utf-8")
    match = re.search(rf"export const {name} = (.*?);(?=\s*(?:export const|\Z))", source, re.S)
    if not match:
        raise ValueError(f"Cannot parse {path}")
    return json.loads(match.group(1))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--build-dir", type=Path, default=Path("/private/tmp/synonym-bulk-audio-20261011"))
    parser.add_argument("--batches", type=int, default=6)
    args = parser.parse_args()
    if not 1 <= args.batches <= 16:
        raise SystemExit("Use 1–16 batches")

    catalog_path = ROOT / "synonyms/lesson-catalog.mjs"
    catalog = exported_json(catalog_path, "catalog")
    legacy = exported_json(catalog_path, "legacyCatalog")
    if len(catalog) != 1845 or len(legacy) != 2:
        raise ValueError("The ranked inventory has changed; review before recording")
    entries = sorted(catalog + legacy, key=lambda row: (row["rank"], bool(row.get("legacy"))))
    featured = [
        exported_json(ROOT / "synonyms/important-data.mjs", "importantModule"),
        exported_json(ROOT / "synonyms/social-media-data.mjs", "socialMediaModule"),
    ]
    modules = [featured[0]]
    for entry in entries:
        modules.append(json.loads((ROOT / "synonyms/lessons" / (entry["id"] + ".json")).read_text(encoding="utf-8")))
    modules.append(featured[1])

    rows = []
    seen_ids = set()
    for module in modules:
        module_id = module["id"]
        for wi, word in enumerate(module["words"], 1):
            for ei, exercise in enumerate(word["exercises"], 1):
                prefix = "" if module_id == "important" else "social-" if module_id == "social-media" else module_id + "-"
                question_id = f"{prefix}{wi}-{ei}"
                text = str(exercise["original"]).strip()
                if not text or question_id in seen_ids:
                    raise ValueError(f"Empty sentence or duplicate question ID: {question_id}")
                seen_ids.add(question_id)
                index = len(rows)
                rows.append({"id": question_id, "moduleId": module_id, "en": text,
                             "voice": VOICE_ORDER[index % 3], "index": index})
    expected = 51162 + 1 + 28 + 28
    if len(rows) != expected:
        raise ValueError(f"Expected {expected} questions; found {len(rows)}")

    dialogue = json.loads(subprocess.check_output(
        ["git", "show", "HEAD:professional-english/dialogues.json"], cwd=ROOT, text=True))
    recipes = {voice: dialogue["voiceRecipes"][voice] for voice in VOICE_ORDER}
    if {voice: recipe["voice"] for voice, recipe in recipes.items()} != VOICE_IDS:
        raise ValueError("The established voice recipe changed; review before recording")

    build = args.build_dir
    build.mkdir(parents=True, exist_ok=True)
    (build / "all.json").write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    (build / "recipes.json").write_text(json.dumps(recipes, indent=2) + "\n", encoding="utf-8")
    batches = [[] for _ in range(args.batches)]
    for row in rows:
        digest = hashlib.sha256((row["voice"] + "\0" + row["en"]).encode()).digest()
        batches[int.from_bytes(digest[:4], "big") % args.batches].append(row)
    for i, batch in enumerate(batches):
        (build / f"local-{i}.json").write_text(json.dumps(batch, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    counts = Counter(row["voice"] for row in rows)
    lengths = sorted(len(row["en"].split()) for row in rows)
    unique = len({(row["voice"], row["en"]) for row in rows})
    print(json.dumps({"questions": len(rows), "voices": counts, "uniqueVoiceText": unique,
                      "maxWords": lengths[-1], "p99Words": lengths[int(len(lengths) * .99)],
                      "batches": [len(batch) for batch in batches]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
