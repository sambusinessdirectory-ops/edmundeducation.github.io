#!/usr/bin/env python3
"""Point published site asset references at the R2-backed public Worker."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import unquote


BASE = "https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/"
EDDY_BASE = "https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/eddy-carrot-patch/assets/"
AUDIO_BASE = "https://edmund-neural-audio.edmundeducation.workers.dev/assets/"
ORIGIN = "https://edmund-site-assets.edmundeducation.workers.dev"
ABSOLUTE = re.compile(r"https://(?:www\.)?edmundeducation\.com/assets/")
LOCAL = re.compile(r"(?<![A-Za-z0-9_./:-])(?:(?:\.\./)+|\./|/)?assets/")
CSP_META = re.compile(r"<meta\s+[^>]*http-equiv=[\"']Content-Security-Policy[\"'][^>]*>", re.IGNORECASE)
EXTENSIONS = {".html", ".css", ".js", ".mjs", ".json", ".webmanifest", ".xml", ".svg", ".txt"}
INDEX_DIR = Path(__file__).resolve().parents[1] / "workers/edmund-site-assets/src"


def load_keys(index_name: str) -> set[str]:
    index = json.loads((INDEX_DIR / index_name).read_text(encoding="utf-8"))
    if index["meta"]["r2UploadComplete"] is not True:
        raise RuntimeError(f"R2 packs not verified complete: {index_name}")
    return set(index["entries"])


def load_flashcard_keys() -> set[str]:
    index = json.loads((INDEX_DIR / "flashcard-pack-index-v1.json").read_text(encoding="utf-8"))
    if index["meta"]["r2UploadComplete"] is not True:
        raise RuntimeError("Flashcard R2 packs are not verified complete")
    prefix = index["audioPathPrefix"].removeprefix("site-assets/v1/")
    return {prefix + shard + "/" + shard + suffix + ".mp3" for shard, entries in index["entries"].items() for suffix in entries}


def directories(keys: set[str]) -> set[str]:
    result = set()
    for key in keys:
        parts = key.split("/")
        for end in range(1, len(parts)):
            result.add("/".join(parts[:end]) + "/")
    return result


def rewrite(value: str, source: Path, root_keys: set[str], eddy_keys: set[str], root_dirs: set[str] | None = None, eddy_dirs: set[str] | None = None) -> str:
    if root_dirs is None:
        root_dirs = directories(root_keys)
    if eddy_dirs is None:
        eddy_dirs = directories(eddy_keys)

    def destination(match: re.Match[str], absolute: bool = False) -> str:
        prefix = match.group(0)
        tail = re.match(r"[^\"'`$<>()[\]{};,\n\r\t]*", value[match.end():]).group(0)
        tail = tail.split("?", 1)[0].split("#", 1)[0].rstrip("\\").rstrip()
        candidates = [tail]
        while " " in candidates[-1]:
            candidates.append(candidates[-1].rsplit(" ", 1)[0])
        for suffix in candidates:
            root_key = "assets/" + suffix
            eddy_key = "eddy-carrot-patch/assets/" + suffix
            if not absolute and source.parts and source.parts[0] == "eddy-carrot-patch" and not prefix.startswith("../") and (eddy_key in eddy_keys or eddy_key in eddy_dirs):
                return EDDY_BASE
            if root_key in root_keys or unquote(root_key) in root_keys or root_key in root_dirs:
                return BASE
            if root_key.startswith("assets/speaking-system/audio/edmund-neural/"):
                return AUDIO_BASE
            if value[match.end() + len(tail):].startswith("$") and any(key.startswith(root_key) for key in root_keys):
                return BASE
            if not absolute and eddy_key in eddy_keys and source.parts and source.parts[0] == "eddy-carrot-patch":
                return EDDY_BASE
        return prefix

    value = ABSOLUTE.sub(lambda match: destination(match, True), value)
    return LOCAL.sub(destination, value)


def allow_asset_origin_in_csp(value: str) -> str:
    def update_meta(match: re.Match[str]) -> str:
        tag = match.group(0)
        # CSP values are semicolon-delimited; inserting a source after 'self' keeps
        # each directive's existing restrictions and permits the R2-backed Worker.
        for directive in ("default-src", "script-src", "style-src", "img-src", "font-src", "connect-src", "media-src", "worker-src"):
            pattern = re.compile(rf"({directive}\s+)([^;\"<>]+)", re.IGNORECASE)
            tag = pattern.sub(lambda source: source.group(1) + (source.group(2) if ORIGIN in source.group(2) else source.group(2).rstrip() + " " + ORIGIN), tag)
        return tag
    return CSP_META.sub(update_meta, value)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", type=Path)
    args = parser.parse_args()
    if not args.site.is_dir():
        raise SystemExit(f"Missing Pages directory: {args.site}")
    root_keys = load_keys("site-pack-index-v1.json")
    root_keys.update(load_flashcard_keys())
    eddy_keys = load_keys("eddy-pack-index-v1.json")
    root_dirs = directories(root_keys)
    eddy_dirs = directories(eddy_keys)
    touched = Counter()
    for path in args.site.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
            continue
        original = path.read_text(encoding="utf-8")
        updated = rewrite(original, path.relative_to(args.site), root_keys, eddy_keys, root_dirs, eddy_dirs)
        if path.suffix.lower() == ".html":
            updated = allow_asset_origin_in_csp(updated)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            touched[path.suffix.lower()] += 1
    print(f"Rewrote local asset references in {sum(touched.values())} files: {dict(touched)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
