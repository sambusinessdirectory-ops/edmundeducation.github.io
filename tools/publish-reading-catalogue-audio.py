#!/usr/bin/env python3
"""Verify immutable R2 narration before publishing lightweight reading indexes."""

from __future__ import annotations

import argparse
import concurrent.futures
import importlib.util
import json
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from urllib import error, request


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("reading_audio_batch", ROOT / "tools/generate-reading-catalogue-audio.py")
batch = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(batch)
CLOUD_BASE = "https://edmund-neural-audio.edmundeducation.workers.dev"
BUCKET = "edmund-assets"


def run_wrangler(wrangler: Path, arguments: list[str], root: Path) -> None:
    result = subprocess.run([str(wrangler), *arguments], cwd=root, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError((result.stderr or result.stdout)[-3000:])


def download_public(key: str, destination: Path) -> bool:
    try:
        public_request = request.Request(
            f"{CLOUD_BASE}/{key}",
            headers={"User-Agent": "curl/8.7.1", "Accept": "audio/mpeg,*/*"},
        )
        with request.urlopen(public_request, timeout=90) as response, destination.open("wb") as output:
            shutil.copyfileobj(response, output)
        return True
    except error.HTTPError as exc:
        if exc.code == 404:
            return False
        raise


def upload_and_verify(record: dict, output: Path, wrangler: Path, root: Path) -> tuple[str, dict]:
    key = record["entry"]["path"]
    path = output / key
    if not key.startswith(f"assets/reading-comprehension/audio/edmund-neural/{batch.RELEASE}/") or ".." in Path(key).parts:
        raise ValueError(f"Unexpected narration key: {key}")
    if batch.file_hash(path) != record["audioSha256"]:
        raise ValueError(f"Audio changed after validation: {path}")
    # Hash-named keys are immutable. The public endpoint is faster and more
    # reliable for checksum verification than downloading through Wrangler.
    with tempfile.TemporaryDirectory(prefix="reading-r2-") as directory:
        downloaded = Path(directory) / "remote.mp3"
        exists = download_public(key, downloaded)
        if exists:
            if batch.file_hash(downloaded) != record["audioSha256"]:
                raise ValueError(f"Refusing to replace a different immutable R2 object: {key}")
        else:
            run_wrangler(wrangler, ["r2", "object", "put", f"{BUCKET}/{key}", "--file", str(path),
                                   "--content-type", "audio/mpeg", "--cache-control", "public, max-age=31536000, immutable", "--remote"], root)
            for attempt in range(6):
                if download_public(key, downloaded):
                    break
                time.sleep(2 ** attempt)
            else:
                raise RuntimeError(f"Uploaded R2 object is not available publicly: {key}")
            if batch.file_hash(downloaded) != record["audioSha256"]:
                raise ValueError(f"R2 download checksum mismatch: {key}")
    return key, {"bucket": BUCKET, "audioSha256": record["audioSha256"], "bytes": path.stat().st_size, "verified": True}


def publish(root: Path, output: Path, articles: list[dict], records: dict, verified: dict, recipe: dict) -> dict:
    existing, old_meta = batch.load_manifest(root / batch.MANIFEST)
    old_timing_paths = {
        str(entry.get("timingsSrc", "")).lstrip("/")
        for entry in existing.values()
        if entry.get("timingsSrc")
    }
    preserved = {article_id: entry for article_id, entry in existing.items() if article_id in batch.PRESERVED_ARTICLES}
    entries = dict(preserved)
    missing = [payload["id"] for payload in articles if payload["id"] not in preserved and payload["id"] not in records]
    if missing:
        raise ValueError(f"Refusing to publish an incomplete catalogue: {len(missing)} articles missing")
    timings = {}
    for payload in articles:
        article_id = payload["id"]
        if article_id in preserved:
            batch.validate_entry(payload, batch.expanded_entry(root, article_id, preserved[article_id]))
            continue
        record = records.get(article_id)
        entry = dict(record["entry"])
        receipt = verified.get(entry["path"], {})
        if receipt.get("bucket") != BUCKET or receipt.get("audioSha256") != record["audioSha256"] or receipt.get("verified") is not True:
            raise ValueError(f"R2 narration has not been verified: {article_id}")
        timing_path = f"reading-comprehension-audio-data/{article_id}-{record['audioSha256'][:24]}.json"
        timings[timing_path] = {"articleId": article_id, "sourceSha256": entry["sourceSha256"], "words": entry.pop("words")}
        entry.update({"src": f"{CLOUD_BASE}/{entry['path']}", "timingsSrc": f"/{timing_path}",
                      "audioSha256": record["audioSha256"], "bytes": record["bytes"]})
        entries[article_id] = entry
    for timing_path, timing in timings.items():
        batch.atomic_json(root / timing_path, timing)
    meta = {**old_meta, **{key: recipe[key] for key in ("buildVersion", "voice", "language", "speed", "sentencePause", "paragraphPause", "sampleRate", "format", "wordTiming", "recipeSha256")},
            "count": len(entries), "catalogueCount": len(articles), "complete": True, "lazyWordTimings": True}
    content = "/* Generated by tools/publish-reading-catalogue-audio.py. */\n"
    content += f"window.EDMUND_READING_AUDIO = Object.freeze({json.dumps(entries, ensure_ascii=False, separators=(',', ':'))});\n"
    content += f"window.EDMUND_READING_AUDIO_META = Object.freeze({json.dumps(meta, separators=(',', ':'))});\n"
    temporary = root / f".{batch.MANIFEST}.tmp"
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(root / batch.MANIFEST)
    active_timing_paths = {
        str(entry.get("timingsSrc", "")).lstrip("/")
        for entry in entries.values()
        if entry.get("timingsSrc")
    }
    timing_directory = (root / "reading-comprehension-audio-data").resolve()
    removed_timings = 0
    for timing_path in old_timing_paths - active_timing_paths:
        candidate = (root / timing_path).resolve()
        if candidate.parent != timing_directory or candidate.suffix != ".json":
            raise ValueError(f"Refusing to remove an unexpected timing file: {timing_path}")
        if candidate.is_file():
            candidate.unlink()
            removed_timings += 1
    catalogue_path = root / "reading-comprehension-catalogue.json"
    catalogue = json.loads(catalogue_path.read_text())
    for row in catalogue["articles"]:
        row["audio"] = row["id"] in entries
    catalogue_path.write_text(json.dumps(catalogue, ensure_ascii=False, indent=2) + "\n")
    return {"articles": len(articles), "recordings": len(entries), "removedTimings": removed_timings, "complete": True}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=ROOT)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--wrangler", type=Path, default=ROOT / "workers/speaking-system/node_modules/.bin/wrangler")
    parser.add_argument("--jobs", type=int, default=3)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--publish", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.jobs <= 4:
        parser.error("jobs must be 1-4")
    root, output = args.source_root.resolve(), args.output_root.resolve()
    recipe = json.loads((output / "recipe.json").read_text())
    articles = batch.load_catalogue(root)
    records = {}
    for payload in articles:
        record = batch.checkpoint(payload, output, recipe["recipeSha256"])
        if record:
            records[payload["id"]] = record
    print(f"Validated {len(records)} generated recordings ({sum(row['bytes'] for row in records.values()) / 1048576:.1f} MiB).", flush=True)
    if args.check:
        return 0
    checkpoint_path = output / "r2-verified.json"
    verified = json.loads(checkpoint_path.read_text()) if checkpoint_path.is_file() else {}
    pending = [row for row in records.values() if verified.get(row["entry"]["path"], {}) != {
        "bucket": BUCKET, "audioSha256": row["audioSha256"], "bytes": row["bytes"], "verified": True}]
    failures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = {pool.submit(upload_and_verify, row, output, args.wrangler.resolve(), root): row["article"] for row in pending}
        for future in concurrent.futures.as_completed(futures):
            try:
                key, receipt = future.result()
                verified[key] = receipt
                batch.atomic_json(checkpoint_path, verified)
                print(f"R2 verified: {futures[future]}", flush=True)
            except Exception as error:
                failures.append(f"{futures[future]}: {error}")
                print(f"FAILED upload {failures[-1]}", flush=True)
    if failures:
        batch.atomic_json(output / "r2-failures.json", failures)
        return 1
    if args.publish:
        print(json.dumps(publish(root, output, articles, records, verified, recipe)), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
