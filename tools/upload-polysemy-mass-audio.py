#!/usr/bin/env python3
"""Upload validated Polysemy voice packs; resume safely after interruption."""

import argparse
import concurrent.futures
import hashlib
import json
import subprocess
from pathlib import Path


def file_hash(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--build-dir", type=Path, default=Path("/private/tmp/polysemy-mass-audio"))
    parser.add_argument("--repository", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--wrangler", type=Path, required=True)
    parser.add_argument("--jobs", type=int, default=4)
    args = parser.parse_args()
    if not 1 <= args.jobs <= 8:
        raise SystemExit("Use 1–8 upload jobs")
    index_path = args.repository / "workers/edmund-audio/src/polysemy-pack-index.json"
    index = json.loads(index_path.read_text())
    if index["meta"]["r2UploadComplete"]:
        raise SystemExit("This immutable release is already marked complete")
    packs = []
    for shard, row in sorted(index["packs"].items()):
        path = args.build_dir / "packs" / f"{shard}.bin"
        if path.stat().st_size != row["size"] or file_hash(path) != row["sha256"]:
            raise SystemExit(f"Pack integrity mismatch: {path}")
        packs.append((row["key"], path, row["sha256"]))
    if len(packs) != 16 or sum(row[1].stat().st_size for row in packs) != index["meta"]["totalBytes"]:
        raise SystemExit("Pack count or byte total mismatch")

    checkpoint_path = args.build_dir / "r2-upload-checkpoint.json"
    checkpoint = json.loads(checkpoint_path.read_text()) if checkpoint_path.exists() else {}
    if any(checkpoint.get(key) not in (None, digest) for key, _, digest in packs):
        raise SystemExit("Upload checkpoint does not match the pack index")

    def upload(row):
        key, path, digest = row
        result = subprocess.run([
            str(args.wrangler), "r2", "object", "put", f"edmund-assets/{key}",
            "--file", str(path), "--content-type", "application/octet-stream",
            "--cache-control", "public, max-age=31536000, immutable",
            "--remote", "--force",
        ], cwd=args.repository / "workers/edmund-audio", text=True, capture_output=True)
        if result.returncode:
            raise RuntimeError(f"{key}: {(result.stderr or result.stdout).strip()}")
        return key, digest

    pending = [row for row in packs if checkpoint.get(row[0]) != row[2]]
    print(f"Uploading {len(pending)} Polysemy audio packs", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = {pool.submit(upload, row): row for row in pending}
        for future in concurrent.futures.as_completed(futures):
            key, digest = future.result()
            checkpoint[key] = digest
            checkpoint_path.write_text(json.dumps(checkpoint, indent=2, sort_keys=True) + "\n")
            print(f"Uploaded {len(checkpoint)}/16: {key}", flush=True)
    if len(checkpoint) != 16:
        raise SystemExit("Some audio packs are still missing")
    index["meta"]["r2UploadComplete"] = True
    index_path.write_text(json.dumps(index, separators=(",", ":"), sort_keys=True) + "\n")
    print("All 16 Polysemy packs uploaded; Worker index is ready to deploy", flush=True)


if __name__ == "__main__":
    main()
