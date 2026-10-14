#!/usr/bin/env python3
"""Pack the public Eddy Carrot Patch image assets for R2 delivery."""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
from pathlib import Path


PREFIX = "eddy-carrot-patch/assets/"
PACK_PREFIX = "site-assets/v1/packs/eddy-carrot-assets/"
MAX_SIZE = 64 * 1024 * 1024


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=root)
    parser.add_argument("--build-dir", type=Path, default=Path("/private/tmp/edmund-site-assets-build"))
    parser.add_argument("--index-output", type=Path, default=root / "workers/edmund-site-assets/src/eddy-pack-index-v1.json")
    args = parser.parse_args()
    paths = sorted(path for path in (args.source_root / PREFIX).rglob("*") if path.is_file() and not path.name.startswith("."))
    if not paths:
        raise SystemExit("Eddy asset source is empty")
    output_dir = args.build_dir / "packs/eddy-carrot-assets"
    output_dir.mkdir(parents=True, exist_ok=True)
    entries = {}
    packs = []
    target = None
    digest = None
    offset = 0
    number = -1
    total = 0

    def close_pack() -> None:
        nonlocal target, digest, offset
        if target is not None:
            target.close()
            packs.append({"key": f"{PACK_PREFIX}{number:03d}.bin", "size": offset, "sha256": digest.hexdigest()})
            target = None
            digest = None
            offset = 0

    for path in paths:
        size = path.stat().st_size
        if target is None or (offset and offset + size > MAX_SIZE):
            close_pack()
            number += 1
            target = (output_dir / f"{number:03d}.bin").open("wb")
            digest = hashlib.sha256()
        key = path.relative_to(args.source_root).as_posix()
        entries[key] = [number, offset, size, mimetypes.guess_type(key)[0] or "application/octet-stream"]
        with path.open("rb") as source:
            for chunk in iter(lambda: source.read(1024 * 1024), b""):
                target.write(chunk)
                digest.update(chunk)
        offset += size
        total += size
    close_pack()
    index = {"schemaVersion": 1, "entries": entries, "packs": packs, "meta": {
        "entryCount": len(entries), "packCount": len(packs), "totalBytes": total, "r2UploadComplete": False,
    }}
    args.index_output.parent.mkdir(parents=True, exist_ok=True)
    args.index_output.write_text(json.dumps(index, sort_keys=True, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Packed {len(entries):,} Eddy assets into {len(packs)} objects ({total / 1048576:.1f} MiB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
