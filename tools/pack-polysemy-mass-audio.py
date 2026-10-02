#!/usr/bin/env python3
"""Pack the three locally recorded Polysemy voices for the audio Worker."""

import argparse
import hashlib
import json
import re
from pathlib import Path


BASE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev/"
LOCAL_VOICES = {"american-female", "british-male", "british-female"}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--build-dir", type=Path, default=Path("/private/tmp/polysemy-mass-audio"))
    parser.add_argument("--repository", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--release", default="v1-mass-kokoro-20260929-1")
    parser.add_argument("--expected", type=int, default=15687)
    parser.add_argument("--batches", type=int, default=4)
    parser.add_argument("--index-path", default="workers/edmund-audio/src/polysemy-pack-index.json")
    parser.add_argument("--manifest-path", default="polysemy-lab/audio-mass.json")
    args = parser.parse_args()
    build = args.build_dir
    rows = json.loads((build / "all.json").read_text())
    expected = {row["id"]: row for row in rows if row["voice"] in LOCAL_VOICES}
    if len(expected) != args.expected:
        raise SystemExit(f"Unexpected local sentence count: {len(expected)}")

    recorded = {}
    for batch in range(args.batches):
        recorded.update(json.loads((build / f"local-{batch}-manifest.json").read_text()))
    if set(recorded) != set(expected):
        raise SystemExit(f"Missing or extra recordings: {len(set(expected) - set(recorded))} / {len(set(recorded) - set(expected))}")

    by_digest = {}
    for question_id, row in recorded.items():
        source = expected[question_id]
        if (row["voice"], row["text"], row["index"]) != (
            source["voice"], source["en"], source["index"]
        ):
            raise SystemExit(f"Voice or source mismatch: {question_id}")
        if hashlib.sha256(source["en"].encode()).hexdigest() != row["sourceSha256"]:
            raise SystemExit(f"Source hash mismatch: {question_id}")
        name = Path(row["path"]).name
        if not re.fullmatch(r"[0-9a-f]{24}\.mp3", name):
            raise SystemExit(f"Invalid clip name: {name}")
        digest = name[:24]
        clip = build / "clips" / name
        if not clip.is_file() or clip.stat().st_size <= 1000:
            raise SystemExit(f"Missing or empty clip: {clip}")
        by_digest[digest] = clip

    prefix = f"assets/polysemy-lab/audio/{args.release}/"
    pack_dir = build / "packs"
    pack_dir.mkdir(exist_ok=True)
    packs, entries = {}, {}
    for shard in "0123456789abcdef":
        entries[shard] = {}
        pack = pack_dir / f"{shard}.bin"
        digest = hashlib.sha256()
        with pack.open("wb") as output:
            for clip_digest, clip in sorted(by_digest.items()):
                if not clip_digest.startswith(shard):
                    continue
                audio = clip.read_bytes()
                offset = output.tell()
                output.write(audio)
                digest.update(audio)
                entries[shard][clip_digest[1:]] = [offset, len(audio)]
        packs[shard] = {
            "key": f"{prefix}{shard}.bin",
            "sha256": digest.hexdigest(),
            "size": pack.stat().st_size,
        }
    index = {
        "meta": {
            "release": args.release,
            "entryCount": len(by_digest),
            "questionCount": len(recorded),
            "packCount": len(packs),
            "totalBytes": sum(pack["size"] for pack in packs.values()),
            "r2UploadComplete": False,
        },
        "audioPathPrefix": prefix,
        "packs": packs,
        "entries": entries,
    }
    index_path = args.repository / args.index_path
    index_path.write_text(json.dumps(index, separators=(",", ":"), sort_keys=True) + "\n")
    manifest = {
        question_id: {
            "path": f"{BASE_URL}{prefix}{Path(row['path']).stem[0]}/{Path(row['path']).name}",
            "voice": row["voice"],
        }
        for question_id, row in sorted(recorded.items())
    }
    manifest_path = args.repository / args.manifest_path
    manifest_path.write_text(json.dumps(manifest, separators=(",", ":"), sort_keys=True) + "\n")
    print(json.dumps({
        "questions": len(recorded),
        "uniqueClips": len(by_digest),
        "packs": len(packs),
        "bytes": index["meta"]["totalBytes"],
        "index": str(index_path),
        "manifest": str(manifest_path),
    }))


if __name__ == "__main__":
    main()
