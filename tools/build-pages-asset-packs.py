#!/usr/bin/env python3
"""Build immutable R2 packs for public /assets/ files other than flashcard v1 MP3s."""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
from pathlib import Path


SOURCE_PREFIX = "assets/"
FLASHCARD_PREFIX = "assets/flashcards/audio/edmund-neural/v1/"
PACK_PREFIX = "site-assets/v1/packs/site-assets/"
MAX_PACK_SIZE = 64 * 1024 * 1024


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=root)
    parser.add_argument("--build-dir", type=Path, default=Path("/private/tmp/edmund-site-assets-build"))
    parser.add_argument("--index-output", type=Path, default=root / "workers/edmund-site-assets/src/site-pack-index-v1.json")
    args = parser.parse_args()
    assets = args.source_root / SOURCE_PREFIX
    paths = sorted(path for path in assets.rglob("*") if path.is_file() and not path.name.startswith("."))
    paths = [path for path in paths if not path.relative_to(args.source_root).as_posix().startswith(FLASHCARD_PREFIX)]
    output_dir = args.build_dir / "packs/site-assets"
    output_dir.mkdir(parents=True, exist_ok=True)
    entries = {}
    packs = []
    target = None
    digest = None
    offset = 0
    pack_number = -1
    total_bytes = 0

    def close_pack() -> None:
        nonlocal target, digest, offset
        if target is not None:
            target.close()
            packs.append({"key": f"{PACK_PREFIX}{pack_number:03d}.bin", "size": offset, "sha256": digest.hexdigest()})
            target = None
            digest = None
            offset = 0

    for path in paths:
        size = path.stat().st_size
        if target is None or (offset and offset + size > MAX_PACK_SIZE):
            close_pack()
            pack_number += 1
            target = (output_dir / f"{pack_number:03d}.bin").open("wb")
            digest = hashlib.sha256()
        key = path.relative_to(args.source_root).as_posix()
        mime = mimetypes.guess_type(key)[0] or "application/octet-stream"
        if key.endswith(".wasm"):
            mime = "application/wasm"
        entries[key] = [pack_number, offset, size, mime]
        with path.open("rb") as source:
            for chunk in iter(lambda: source.read(1024 * 1024), b""):
                target.write(chunk)
                digest.update(chunk)
        offset += size
        total_bytes += size
    close_pack()
    index = {"schemaVersion": 1, "entries": entries, "packs": packs, "meta": {
        "entryCount": len(entries), "packCount": len(packs), "totalBytes": total_bytes, "r2UploadComplete": False,
    }}
    args.index_output.parent.mkdir(parents=True, exist_ok=True)
    args.index_output.write_text(json.dumps(index, sort_keys=True, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Packed {len(entries):,} assets into {len(packs)} objects ({total_bytes / 1048576:.1f} MiB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
