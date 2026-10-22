#!/usr/bin/env python3
"""Validate every generated DSE Kokoro clip and pack them for efficient R2 upload."""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "assets/dse-argument-bank/audio/v1"


def upload(wrangler: Path, bucket: str, key: str, path: Path) -> str:
    content_type = "application/json" if key.endswith(".json") else "application/octet-stream"
    result = subprocess.run([str(wrangler), "r2", "object", "put", f"{bucket}/{key}", "--file", str(path),
                             "--content-type", content_type, "--cache-control", "public, max-age=31536000, immutable",
                             "--remote"], text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(f"{key}: {(result.stderr or result.stdout)[-1200:]}")
    return key


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audio-root", type=Path, default=Path("/private/tmp/dse-argument-kokoro"))
    parser.add_argument("--pack-root", type=Path, default=Path("/private/tmp/dse-argument-kokoro-packs"))
    parser.add_argument("--upload", action="store_true")
    parser.add_argument("--wrangler", type=Path, required=False)
    parser.add_argument("--bucket", default="edmund-assets")
    parser.add_argument("--jobs", type=int, default=8)
    args = parser.parse_args()
    mapping = json.loads((ROOT / "dse-argument-bank/audio-manifest.json").read_text())
    if len(mapping) < 33000:
        raise SystemExit(f"Audio manifest incomplete: {len(mapping)} clips")
    by_prefix: dict[str, list[tuple[str, Path]]] = {}
    for key, relative in mapping.items():
        digest = hashlib.sha256(key.encode()).hexdigest()
        expected = f"{PREFIX}/{digest[:2]}/{digest}.mp3"
        if relative != expected:
            raise SystemExit(f"Incorrect mapping for {key[:100]!r}")
        path = args.audio_root / relative
        if not path.is_file() or path.stat().st_size < 1800:
            raise SystemExit(f"Missing or empty clip: {path}")
        with path.open("rb") as file:
            first = file.read(4)
        if not (first.startswith(b"ID3") or first[:2] == b"\xff\xfb" or first[:2] == b"\xff\xf3"):
            raise SystemExit(f"Invalid MP3 header: {path}")
        by_prefix.setdefault(digest[:2], []).append((digest, path))
    uploaded = []
    for prefix, clips in sorted(by_prefix.items()):
        clips.sort()
        target = args.pack_root / PREFIX / "packs"
        target.mkdir(parents=True, exist_ok=True)
        pack = target / f"{prefix}.bin"
        index_path = target / f"{prefix}.index.json"
        index = {}
        with pack.open("wb") as writer:
            for digest, path in clips:
                offset = writer.tell()
                with path.open("rb") as reader:
                    while chunk := reader.read(1024 * 1024):
                        writer.write(chunk)
                index[digest] = [offset, writer.tell() - offset]
        index_path.write_text(json.dumps(index, separators=(",", ":")) + "\n")
        uploaded += [(f"{PREFIX}/packs/{prefix}.bin", pack), (f"{PREFIX}/packs/{prefix}.index.json", index_path)]
        print(f"Packed {prefix}: {len(clips)} clips, {pack.stat().st_size} bytes", flush=True)
    print(f"Validated {len(mapping)} clips in {len(by_prefix)} packs", flush=True)
    if not args.upload:
        return
    if not args.wrangler:
        raise SystemExit("--wrangler is required with --upload")
    checkpoint = args.pack_root / "upload-checkpoint.json"
    done = json.loads(checkpoint.read_text()) if checkpoint.is_file() else {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = {}
        for key, path in uploaded:
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            if done.get(key) == digest:
                continue
            futures[pool.submit(upload, args.wrangler, args.bucket, key, path)] = (key, digest)
        for future in concurrent.futures.as_completed(futures):
            key, digest = futures[future]
            future.result()
            done[key] = digest
            checkpoint.write_text(json.dumps(done, sort_keys=True) + "\n")
            if len(done) % 25 == 0:
                print(f"Uploaded {len(done)}/{len(uploaded)} pack objects", flush=True)
    print(f"R2 upload complete: {len(done)} objects", flush=True)


if __name__ == "__main__":
    main()
