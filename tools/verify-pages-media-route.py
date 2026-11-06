#!/usr/bin/env python3
"""Verify the R2 media service at the exact public origin before Pages pruning."""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen


USER_AGENT = "EdmundEducation-Media-Cutover/1.0"


def blob_id(payload: bytes) -> str:
    return hashlib.sha1(f"blob {len(payload)}\0".encode() + payload).hexdigest()


def request(url: str, *, method: str = "GET", headers: dict[str, str] | None = None):
    return urlopen(
        Request(url, method=method, headers={"User-Agent": USER_AGENT, **(headers or {})}),
        timeout=30,
    )


def normalized_type(value: str) -> str:
    return value.split(";", 1)[0].strip().lower()


def choose_samples(entries: dict[str, list], saved: list[str]) -> tuple[list[str], list[str]]:
    missing = [path for path in saved if path not in entries]
    if missing:
        raise ValueError("Saved media paths are absent from the R2 index: " + ", ".join(missing))

    # Exercise a byte range through every routed top-level family. Select the
    # smallest member to keep the cutover check quick and deterministic.
    families: dict[str, tuple[int, str]] = {}
    kinds: dict[str, tuple[int, str]] = {}
    for path, row in entries.items():
        size, media_type = int(row[2]), str(row[3])
        family = path.split("/", 1)[0]
        kind = media_type.split("/", 1)[0]
        families[family] = min(families.get(family, (size, path)), (size, path))
        kinds[kind] = min(kinds.get(kind, (size, path)), (size, path))
    range_samples = sorted({path for _, path in families.values()} | set(saved))
    full_samples = sorted({path for _, path in kinds.values()} | set(saved))
    return range_samples, full_samples


def verify_headers(headers, *, path: str, size: int, media_type: str) -> None:
    if normalized_type(headers.get("Content-Type", "")) != normalized_type(media_type):
        raise ValueError(f"Wrong content type for {path}: {headers.get('Content-Type')!r}")
    if headers.get("Accept-Ranges", "").lower() != "bytes":
        raise ValueError(f"Missing byte-range support for {path}")
    if headers.get("Access-Control-Allow-Origin") != "*":
        raise ValueError(f"Missing CORS header for {path}")
    if "max-age=" not in headers.get("Cache-Control", "").lower():
        raise ValueError(f"Missing cache lifetime for {path}")
    if headers.get("X-Content-Type-Options", "").lower() != "nosniff":
        raise ValueError(f"Missing nosniff protection for {path}")
    if headers.get("X-Edmund-Media-Blob") is None:
        raise ValueError(f"Missing immutable blob identity for {path}")
    if int(headers.get("Content-Length", -1)) not in (1, size):
        raise ValueError(f"Wrong content length for {path}")


def verify(
    index_file: Path,
    origin: str,
    saved: list[str],
    fallback_path: str,
    expect_pages_fallback: bool = False,
) -> dict:
    raw = index_file.read_bytes().rstrip(b"\n")
    index = json.loads(raw)
    entries = index["entries"]
    origin = origin.rstrip("/")

    with request(origin + "/.well-known/edmund-public-media.json", headers={"Cache-Control": "no-cache"}) as response:
        manifest = json.load(response)
        if "no-store" not in response.headers.get("Cache-Control", "").lower():
            raise ValueError("Public media manifest must not be cached")
    expected_digest = hashlib.sha256(raw).hexdigest()
    if manifest.get("sha256") != expected_digest or manifest.get("count") != len(entries):
        raise ValueError("Public media route does not serve the exact repository index")

    range_samples, full_samples = choose_samples(entries, saved)
    def verify_range_and_cors(path: str) -> None:
        pack, offset, size, media_type, oid = entries[path]
        del pack, offset
        url = origin + "/" + quote(path)
        with request(url, headers={"Range": "bytes=0-0", "Origin": origin}) as response:
            payload = response.read(2)
            if response.status != 206 or len(payload) != 1:
                raise ValueError(f"Byte-range request failed for {path}")
            verify_headers(response.headers, path=path, size=size, media_type=media_type)
            if response.headers.get("Content-Range") != f"bytes 0-0/{size}":
                raise ValueError(f"Wrong content range for {path}")
            if response.headers.get("X-Edmund-Media-Blob") != oid:
                raise ValueError(f"Wrong immutable blob identity for {path}")

        with request(url, method="OPTIONS", headers={"Origin": origin, "Access-Control-Request-Method": "GET"}) as response:
            if response.status != 204 or response.headers.get("Access-Control-Allow-Origin") != "*":
                raise ValueError(f"CORS preflight failed for {path}")

    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(verify_range_and_cors, range_samples))

    def verify_complete(path: str) -> int:
        _, _, size, media_type, oid = entries[path]
        url = origin + "/" + quote(path)
        with request(url, headers={"Origin": origin}) as response:
            payload = response.read()
            verify_headers(response.headers, path=path, size=size, media_type=media_type)
            etag = response.headers.get("ETag")
        if len(payload) != size or blob_id(payload) != oid:
            raise ValueError(f"Complete download differs from the deployed Git blob: {path}")
        if not etag:
            raise ValueError(f"Missing ETag for {path}")
        try:
            request(url, headers={"If-None-Match": etag})
        except HTTPError as response:
            try:
                if response.code != 304:
                    raise
            finally:
                response.close()
        else:
            raise ValueError(f"Conditional cache validation did not return 304 for {path}")
        return len(payload)

    with ThreadPoolExecutor(max_workers=4) as pool:
        downloaded = sum(pool.map(verify_complete, full_samples))

    if expect_pages_fallback:
        # A non-media request on the school-domain route must continue to Pages.
        with request(origin + "/" + fallback_path.lstrip("/"), headers={"Cache-Control": "no-cache"}) as response:
            fallback = response.read()
            if response.status != 200 or response.headers.get("X-Edmund-Media-Blob"):
                raise ValueError(f"Non-media fallback failed for {fallback_path}")
            if fallback_path.endswith("release.json") and not json.loads(fallback).get("release"):
                raise ValueError("Fallback release record is invalid")

    return {
        "index_sha256": expected_digest,
        "entry_count": len(entries),
        "range_samples": len(range_samples),
        "complete_samples": len(full_samples),
        "downloaded_bytes": downloaded,
        "saved_links": saved,
        "pages_fallback": fallback_path if expect_pages_fallback else "not applicable",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("index", type=Path)
    parser.add_argument("--origin", required=True)
    parser.add_argument("--saved-links", type=Path)
    parser.add_argument("--fallback-path", default="release.json")
    parser.add_argument("--expect-pages-fallback", action="store_true")
    args = parser.parse_args()
    saved = []
    if args.saved_links:
        saved = [line.strip() for line in args.saved_links.read_text().splitlines()
                 if line.strip() and not line.lstrip().startswith("#")]
    print(json.dumps(verify(
        args.index, args.origin, saved, args.fallback_path, args.expect_pages_fallback
    ), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
