#!/usr/bin/env python3
"""Validate and pack the complete three-voice synonym exercise release."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev/"
VOICES = {"american-female", "british-male", "british-female"}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--build-dir", type=Path, default=Path("/private/tmp/synonym-bulk-audio-20261011"))
    parser.add_argument("--repository", type=Path, default=ROOT)
    parser.add_argument("--release", default="v1-kokoro-20261011-1")
    parser.add_argument("--batches", type=int, default=6)
    parser.add_argument("--expected", type=int, default=51219)
    args = parser.parse_args()
    build = args.build_dir
    rows = json.loads((build / "all.json").read_text(encoding="utf-8"))
    expected = {row["id"]: row for row in rows}
    if len(rows) != len(expected) or len(rows) != args.expected:
        raise SystemExit("Unexpected question count or duplicate question IDs")
    if set(row["voice"] for row in rows) != VOICES:
        raise SystemExit("The release must use exactly the three approved voices")

    recorded = {}
    for batch in range(args.batches):
        done = json.loads((build / f"batch-{batch}.done.json").read_text())
        if done["returncode"] != 0:
            raise SystemExit(f"Batch {batch} did not finish successfully")
        manifest = json.loads((build / f"local-{batch}-manifest.json").read_text(encoding="utf-8"))
        if set(recorded) & set(manifest):
            raise SystemExit(f"Duplicate question IDs in batch {batch}")
        recorded.update(manifest)
    if set(recorded) != set(expected):
        raise SystemExit(f"Missing or extra recordings: {len(set(expected)-set(recorded))} / {len(set(recorded)-set(expected))}")

    unique = {}
    module_audio = defaultdict(dict)
    prefix = f"assets/synonyms/audio/{args.release}/"
    for question_id, entry in recorded.items():
        row = expected[question_id]
        if (entry["voice"], entry["text"], entry["index"]) != (row["voice"], row["en"], row["index"]):
            raise SystemExit(f"Voice or sentence mismatch: {question_id}")
        if entry["sourceSha256"] != hashlib.sha256(row["en"].encode()).hexdigest():
            raise SystemExit(f"Source hash mismatch: {question_id}")
        filename = Path(entry["path"]).name
        if not re.fullmatch(r"[0-9a-f]{24}\.mp3", filename):
            raise SystemExit(f"Invalid clip name: {filename}")
        clip = build / "clips" / filename
        if not clip.is_file() or clip.stat().st_size <= 1000:
            raise SystemExit(f"Missing or empty clip: {clip}")
        digest = filename[:24]
        old = unique.setdefault(digest, (clip, row["voice"], row["en"]))
        if old[1:] != (row["voice"], row["en"]):
            raise SystemExit(f"Content-address collision: {digest}")
        module_audio[row["moduleId"]][question_id] = {
            "path": f"{BASE_URL}{prefix}{digest[:2]}/{filename}",
            "voice": row["voice"],
        }

    pack_dir = build / "packs"
    pack_dir.mkdir(exist_ok=True)
    packs, entries = {}, {}
    for shard_number in range(256):
        shard = f"{shard_number:02x}"
        entries[shard] = {}
        pack_path = pack_dir / f"{shard}.bin"
        hash_state = hashlib.sha256()
        with pack_path.open("wb") as output:
            for digest, (clip, _, _) in sorted(unique.items()):
                if not digest.startswith(shard):
                    continue
                audio = clip.read_bytes()
                if not (audio.startswith(b"ID3") or audio[:1] == b"\xff"):
                    raise SystemExit(f"Not an MP3 clip: {clip}")
                offset = output.tell()
                output.write(audio)
                hash_state.update(audio)
                entries[shard][digest[2:]] = [offset, len(audio)]
        packs[shard] = {"key": f"{prefix}{shard}.bin", "sha256": hash_state.hexdigest(),
                        "size": pack_path.stat().st_size}

    index = {
        "meta": {"release": args.release, "entryCount": len(unique), "questionCount": len(rows),
                 "packCount": 256, "totalBytes": sum(pack["size"] for pack in packs.values()),
                 "r2UploadComplete": False},
        "audioPathPrefix": prefix,
        "packs": packs,
        "entries": entries,
    }
    index_path = args.repository / "workers/edmund-audio/src/synonym-pack-index.json"
    index_path.write_text(json.dumps(index, separators=(",", ":"), sort_keys=True) + "\n")
    audio_dir = args.repository / "synonyms/lesson-audio"
    audio_dir.mkdir(exist_ok=True)
    for module_id, mapping in module_audio.items():
        (audio_dir / f"{module_id}.json").write_text(
            json.dumps(mapping, separators=(",", ":"), sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"questions": len(rows), "uniqueClips": len(unique), "modules": len(module_audio),
                      "packs": len(packs), "bytes": index["meta"]["totalBytes"]}))


if __name__ == "__main__":
    main()
