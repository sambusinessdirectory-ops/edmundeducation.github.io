#!/usr/bin/env python3
"""Remove verified replicas from a prepared artifact after checking their public route."""
import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen


def blob_id(path):
    digest = hashlib.sha1(f"blob {path.stat().st_size}\0".encode())
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(262144), b""):
            digest.update(block)
    return digest.hexdigest()


def prune(site, index_file, origin, keep=()):
    raw = index_file.read_bytes().rstrip(b"\n")
    index = json.loads(raw)
    headers = {"User-Agent": "EdmundEducation-Release/1.0", "Cache-Control": "no-cache"}
    manifest = Request(origin + "/.well-known/edmund-public-media.json", headers=headers)
    with urlopen(manifest, timeout=20) as response:
        remote = json.load(response)
    if remote.get("sha256") != hashlib.sha256(raw).hexdigest():
        raise ValueError("Public media route does not serve this exact verified index")

    root = site.resolve()
    samples = {}
    copies = []
    keep = set(keep)
    for name, (_, _, size, _, oid) in index["entries"].items():
        rel = Path(name)
        if not rel.parts or rel.is_absolute() or ".." in rel.parts:
            raise ValueError(f"Unsafe staged path: {name}")
        path = root / rel
        if path.is_symlink() or path.resolve() != path:
            raise ValueError(f"Unsafe staged symlink: {name}")
        if path.is_file():
            if path.stat().st_size != size or blob_id(path) != oid:
                raise ValueError(f"Restage changed media before cutover: {name}")
            if name not in keep:
                copies.append(path)
        family = rel.parts[0] if len(rel.parts) > 1 else "."
        samples.setdefault(family, (name, size, oid))

    for name, size, oid in samples.values():
        request = Request(origin + "/" + quote(name), headers={**headers, "Range": "bytes=0-0"})
        with urlopen(request, timeout=20) as response:
            if (response.status != 206
                    or response.headers.get("X-Edmund-Media-Blob") != oid
                    or response.headers.get("Content-Range") != f"bytes 0-0/{size}"
                    or len(response.read(2)) != 1):
                raise ValueError(f"Existing public URL lacks verified byte-range delivery: {name}")

    # Complete every check before removing the first replica from the disposable artifact.
    for path in copies:
        path.unlink()
    print(f"Removed {len(copies)} verified replicas from prepared artifact")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", type=Path)
    parser.add_argument("index", type=Path)
    parser.add_argument("--rehearse", action="store_true", help="Use the isolated R2 hostname")
    parser.add_argument("--origin", help="Verified media origin (defaults to the school domain)")
    parser.add_argument("--keep-list", type=Path, help="Newline-delimited legacy paths to retain in Pages")
    args = parser.parse_args()
    if args.site.name != "_site" or args.site.is_symlink() or not args.site.is_dir():
        raise SystemExit("Expected a disposable _site artifact directory")
    if args.rehearse and args.origin:
        raise SystemExit("Choose --rehearse or --origin, not both")
    origin = args.origin or (
        "https://edmund-public-media.edmundeducation.workers.dev" if args.rehearse
        else "https://edmundeducation.com"
    )
    keep = []
    if args.keep_list:
        keep = [line.strip() for line in args.keep_list.read_text().splitlines()
                if line.strip() and not line.lstrip().startswith("#")]
    prune(args.site, args.index, origin, keep)
