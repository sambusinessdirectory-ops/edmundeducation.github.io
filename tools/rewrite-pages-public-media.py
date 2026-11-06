#!/usr/bin/env python3
"""Rewrite indexed media references to the verified public R2 Worker origin."""

from __future__ import annotations

import argparse
import json
import posixpath
import re
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit


DEFAULT_ORIGIN = "https://edmund-public-media.edmundeducation.workers.dev"
TEXT_EXTENSIONS = {".html", ".css", ".js", ".mjs", ".cjs", ".json", ".webmanifest", ".xml", ".svg", ".txt"}
MEDIA_EXTENSIONS = "mp3|wav|m4a|ogg|webp|jpg|jpeg|png|pdf|mp4|gif|ttf"
QUOTED_URL = re.compile(
    rf"(?P<quote>[\"'`])(?P<url>[^\"'`\r\n]+?\.(?:{MEDIA_EXTENSIONS})(?:[?#][^\"'`\r\n]*)?)(?P=quote)",
    re.IGNORECASE,
)
CSS_URL = re.compile(
    rf"(?P<prefix>url\(\s*)(?P<url>(?![\"'])[^)\s]+?\.(?:{MEDIA_EXTENSIONS})(?:[?#][^)\s]*)?)(?P<suffix>\s*\))",
    re.IGNORECASE,
)
CSP_META = re.compile(r"<meta\s+[^>]*http-equiv=[\"']Content-Security-Policy[\"'][^>]*>", re.IGNORECASE)


def indexed_path(value: str, source: Path, entries: set[str]) -> tuple[str, str] | None:
    parsed = urlsplit(value)
    if parsed.scheme:
        if parsed.scheme not in ("http", "https") or parsed.netloc not in ("edmundeducation.com", "www.edmundeducation.com"):
            return None
        candidate = unquote(parsed.path.lstrip("/"))
    elif parsed.netloc or value.startswith("//"):
        return None
    elif parsed.path.startswith("/"):
        candidate = unquote(parsed.path.lstrip("/"))
    else:
        candidate = posixpath.normpath(posixpath.join(source.parent.as_posix(), unquote(parsed.path)))
    if candidate.startswith("../") or candidate not in entries:
        return None
    suffix = ("?" + parsed.query if parsed.query else "") + ("#" + parsed.fragment if parsed.fragment else "")
    return candidate, suffix


def rewrite_text(value: str, source: Path, entries: set[str], origin: str) -> tuple[str, int]:
    count = 0

    def destination(url: str) -> str:
        nonlocal count
        match = indexed_path(url, source, entries)
        if not match:
            return url
        path, suffix = match
        count += 1
        return origin.rstrip("/") + "/" + quote(path, safe="/") + suffix

    value = QUOTED_URL.sub(
        lambda match: match.group("quote") + destination(match.group("url")) + match.group("quote"),
        value,
    )
    value = CSS_URL.sub(
        lambda match: match.group("prefix") + destination(match.group("url")) + match.group("suffix"),
        value,
    )
    if count and source.suffix.lower() == ".html":
        def add_origin(match: re.Match[str]) -> str:
            tag = match.group(0)
            for directive in ("default-src", "img-src", "font-src", "connect-src", "media-src", "worker-src"):
                pattern = re.compile(rf"({directive}\s+)([^;\"<>]+)", re.IGNORECASE)
                tag = pattern.sub(
                    lambda item: item.group(1) + (
                        item.group(2) if origin in item.group(2)
                        else item.group(2).rstrip() + " " + origin
                    ),
                    tag,
                )
            return tag
        value = CSP_META.sub(add_origin, value)
    return value, count


def candidates(site: Path):
    return (path for path in site.rglob("*")
            if path.is_file() and path.suffix.lower() in TEXT_EXTENSIONS)


def rewrite(site: Path, index_file: Path, origin: str) -> dict:
    entries = set(json.loads(index_file.read_text())["entries"])
    files = references = 0
    for path in candidates(site):
        original = path.read_text(encoding="utf-8")
        updated, count = rewrite_text(original, path.relative_to(site), entries, origin)
        if count:
            path.write_text(updated, encoding="utf-8")
            files += 1
            references += count
    return {"files": files, "references": references, "origin": origin, "indexed_entries": len(entries)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", type=Path)
    parser.add_argument("index", type=Path)
    parser.add_argument("--origin", default=DEFAULT_ORIGIN)
    args = parser.parse_args()
    if args.site.name != "_site" or not args.site.is_dir() or args.site.is_symlink():
        raise SystemExit("Expected a disposable _site artifact directory")
    print(json.dumps(rewrite(args.site, args.index, args.origin), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
