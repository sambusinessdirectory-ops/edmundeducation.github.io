#!/usr/bin/env python3
"""Resumably upload the immutable Pages asset packs to the existing R2 bucket."""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import os
import shutil
import subprocess
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BUILD = Path("/private/tmp/edmund-site-assets-build")


def wrangler_binary() -> str:
    configured = os.environ.get("WRANGLER_BIN")
    if configured:
        return configured
    installed = shutil.which("wrangler")
    if installed:
        return installed
    for local in (ROOT / "workers/schedule-system/node_modules/.bin/wrangler", ROOT / "node_modules/.bin/wrangler"):
        if local.is_file():
            return str(local)
    raise SystemExit("Install Wrangler or set WRANGLER_BIN to its executable path")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--build-dir", type=Path, default=DEFAULT_BUILD)
    parser.add_argument("--workers", type=int, default=12)
    args = parser.parse_args()
    wrangler = wrangler_binary()
    rows = []
    indexes = []
    for name, subdir in (("flashcard-pack-index-v1.json", "flashcard-audio-v1"), ("site-pack-index-v1.json", "site-assets"), ("eddy-pack-index-v1.json", "eddy-carrot-assets")):
        path = ROOT / "workers/edmund-site-assets/src" / name
        index = json.loads(path.read_text(encoding="utf-8"))
        packs = index["packs"].values() if isinstance(index["packs"], dict) else index["packs"]
        for pack in packs:
            local = args.build_dir / "packs" / subdir / Path(pack["key"]).name
            if not local.is_file() or local.stat().st_size != pack["size"] or sha256(local) != pack["sha256"]:
                raise SystemExit(f"Pack mismatch: {local}")
            rows.append((pack["key"], local, pack["sha256"]))
        indexes.append((path, index))
    checkpoint = args.build_dir / "uploaded-r2-packs.txt"
    completed = set(checkpoint.read_text(encoding="utf-8").splitlines()) if checkpoint.exists() else set()
    todo = [(key, path, digest) for key, path, digest in rows if f"{key} {digest}" not in completed]
    print(f"{len(completed)} uploaded; {len(todo)} remaining of {len(rows)} packs", flush=True)

    def upload(item: tuple[str, Path, str]) -> tuple[str, str]:
        key, local, digest = item
        for attempt in range(4):
            result = subprocess.run(
                [wrangler, "r2", "object", "put", f"edmund-assets/{key}", "--file", str(local), "--remote", "--force", "--content-type", "application/octet-stream"],
                cwd=ROOT, capture_output=True, text=True, timeout=180,
            )
            if result.returncode == 0 and "Upload complete" in result.stdout:
                return key, digest
            if attempt < 3:
                time.sleep(2 ** attempt)
        raise RuntimeError(f"Upload failed for {key}: {result.stderr[-500:]} {result.stdout[-500:]}")

    failed = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(upload, item): item[0] for item in todo}
        for number, future in enumerate(concurrent.futures.as_completed(futures), 1):
            try:
                key, digest = future.result()
            except Exception as error:
                failed.append(str(error))
                print(str(error), flush=True)
                continue
            with checkpoint.open("a", encoding="utf-8") as output:
                output.write(f"{key} {digest}\n")
            if number % 10 == 0 or number == len(todo):
                print(f"Uploaded {number}/{len(todo)} in this run", flush=True)
    if failed:
        raise SystemExit(f"{len(failed)} uploads failed; re-run to resume")
    completed = set(checkpoint.read_text(encoding="utf-8").splitlines()) | completed
    if any(f"{key} {digest}" not in completed for key, _, digest in rows):
        raise SystemExit("Upload checkpoint incomplete")
    for path, index in indexes:
        index["meta"]["r2UploadComplete"] = True
        path.write_text(json.dumps(index, sort_keys=True, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"All {len(rows)} packs uploaded and all indexes marked complete", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
