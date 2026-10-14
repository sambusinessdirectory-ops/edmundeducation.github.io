#!/usr/bin/env python3
"""Pack the public legacy flashcard MP3s for the Pages asset R2 migration."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


SOURCE_PREFIX = "assets/flashcards/audio/edmund-neural/v1/"
PUBLIC_PREFIX = "site-assets/v1/" + SOURCE_PREFIX
PACK_PREFIX = "site-assets/v1/packs/flashcard-audio-v1/"
HEX_PREFIX = re.compile(r"[0-9a-f]{2}")
HEX_NAME = re.compile(r"[0-9a-f]{24}\.mp3")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=root)
    parser.add_argument("--build-dir", type=Path, default=Path("/private/tmp/edmund-site-assets-build"))
    parser.add_argument(
        "--index-output",
        type=Path,
        default=root / "workers/edmund-site-assets/src/flashcard-pack-index-v1.json",
    )
    args = parser.parse_args()
    source = args.source_root / SOURCE_PREFIX
    if not source.is_dir():
        raise SystemExit(f"Flashcard audio source is missing: {source}")
    grouped: dict[str, list[tuple[str, Path]]] = {}
    for path in sorted(source.glob("*/*.mp3")):
        prefix, filename = path.parent.name, path.name
        if not HEX_PREFIX.fullmatch(prefix) or not HEX_NAME.fullmatch(filename):
            raise SystemExit(f"Unexpected flashcard filename: {path}")
        if filename[:2] != prefix or path.stat().st_size <= 1000:
            raise SystemExit(f"Invalid flashcard recording: {path}")
        grouped.setdefault(prefix, []).append((filename[:24], path))
    if len(grouped) != 256 or sum(map(len, grouped.values())) < 43_249:
        raise SystemExit("The legacy flashcard corpus is incomplete")

    output_dir = args.build_dir / "packs/flashcard-audio-v1"
    output_dir.mkdir(parents=True, exist_ok=True)
    entries: dict[str, dict[str, list[int]]] = {}
    packs: dict[str, dict[str, object]] = {}
    total_bytes = 0
    for prefix, rows in sorted(grouped.items()):
        pack_path = output_dir / f"{prefix}.bin"
        offset = 0
        prefix_entries: dict[str, list[int]] = {}
        with pack_path.open("wb") as target:
            for digest, path in rows:
                audio = path.read_bytes()
                target.write(audio)
                prefix_entries[digest[2:]] = [offset, len(audio)]
                offset += len(audio)
        entries[prefix] = prefix_entries
        packs[prefix] = {
            "key": f"{PACK_PREFIX}{prefix}.bin",
            "size": offset,
            "sha256": sha256(pack_path),
        }
        total_bytes += offset

    index = {
        "schemaVersion": 1,
        "audioPathPrefix": PUBLIC_PREFIX,
        "packKeyPrefix": PACK_PREFIX,
        "entries": entries,
        "packs": packs,
        "meta": {
            "entryCount": sum(map(len, grouped.values())),
            "packCount": len(packs),
            "totalBytes": total_bytes,
            "r2UploadComplete": False,
        },
    }
    args.index_output.parent.mkdir(parents=True, exist_ok=True)
    args.index_output.write_text(
        json.dumps(index, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(f"Packed {index['meta']['entryCount']:,} MP3s into 256 objects ({total_bytes / 1048576:.1f} MiB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
