#!/usr/bin/env python3
"""Reject a Pages artifact with missing student runtime dependencies."""

from __future__ import annotations

import argparse
import fnmatch
from html.parser import HTMLParser
import json
from pathlib import Path, PurePosixPath
import posixpath
import subprocess
from urllib.parse import unquote, urljoin, urlsplit


ORIGIN = "https://edmundeducation.com/"
LOCAL_HOST = "edmundeducation.com"
RUNTIME_PATTERNS = (
    "flashcards-audio-manifest.js",
    "flashcards-core-data.js",
    "flashcards-*-data.js",
    "common-expression-system-imported-data.js",
    "idiom-compass-*-curation.js",
    "idiom-system-data.js",
    "phrasal-verb-system-data.js",
    "sentence-structure-lessons-*.js",
    "speaking-part*-audio-manifest.js",
    "speaking-system-part3-data.js",
    "writing-audio*.js",
    "writing-practice-*-data.js",
    "writing-submission-reference-data.mjs",
)
RESOURCE_LINK_RELS = {"stylesheet", "icon", "manifest", "preload", "modulepreload"}


class ResourceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.resources: set[str] = set()

    def handle_starttag(self, tag: str, attrs) -> None:
        values = dict(attrs)
        if tag == "script" and values.get("src"):
            self.resources.add(values["src"])
        elif tag == "link" and values.get("href"):
            rels = set((values.get("rel") or "").lower().split())
            if rels & RESOURCE_LINK_RELS:
                self.resources.add(values["href"])
        elif tag in {"img", "audio", "video", "source", "iframe", "embed"}:
            for key in ("src", "poster"):
                if values.get(key):
                    self.resources.add(values[key])
            if values.get("srcset"):
                for candidate in values["srcset"].split(","):
                    self.resources.add(candidate.strip().split()[0])
        elif tag == "object" and values.get("data"):
            self.resources.add(values["data"])


def system_routes(system_map: dict) -> list[str]:
    routes = {"index.html"}
    for family_routes in system_map["families"].values():
        for route in family_routes:
            routes.add(route + "index.html" if route.endswith("/") else route)
    return sorted(routes)


def local_resource(route: str, raw: str) -> str | None:
    raw = raw.strip()
    if not raw or raw.startswith(("#", "data:", "blob:", "javascript:", "mailto:", "tel:")):
        return None
    absolute = urlsplit(urljoin(urljoin(ORIGIN, route), raw))
    if absolute.hostname and absolute.hostname != LOCAL_HOST:
        return None
    path = unquote(absolute.path).lstrip("/")
    if not path:
        return "index.html"
    normalized = posixpath.normpath(path)
    if normalized == ".." or normalized.startswith("../"):
        raise ValueError(f"Unsafe runtime dependency from {route}: {raw}")
    if normalized.endswith("/"):
        normalized += "index.html"
    return normalized


def tracked_runtime_files(git_ref: str) -> set[str]:
    output = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", git_ref], text=True)
    expected = set()
    for name in output.splitlines():
        if "/" not in name and any(fnmatch.fnmatchcase(name, pattern) for pattern in RUNTIME_PATTERNS):
            expected.add(name)
        if fnmatch.fnmatchcase(name, "edmund-coins/*.webp"):
            expected.add(name)
    return expected


def verify(site: Path, source: Path, system_map: dict, git_ref: str = "HEAD") -> dict:
    site = site.resolve()
    missing: dict[str, set[str]] = {}
    checked: set[str] = set()
    routes = system_routes(system_map)
    for route in routes:
        page = site / PurePosixPath(route)
        if not page.is_file() or page.stat().st_size < 100:
            missing.setdefault(route, set()).add("route")
            continue
        parser = ResourceParser()
        parser.feed(page.read_text(encoding="utf-8", errors="replace"))
        for raw in parser.resources:
            relative = local_resource(route, raw)
            if relative is None:
                continue
            checked.add(relative)
            dependency = site / PurePosixPath(relative)
            if not dependency.is_file() or dependency.stat().st_size == 0:
                missing.setdefault(relative, set()).add(route)

    for relative in tracked_runtime_files(git_ref):
        checked.add(relative)
        dependency = site / PurePosixPath(relative)
        if not dependency.is_file() or dependency.stat().st_size == 0:
            missing.setdefault(relative, set()).add("runtime inventory")

    if missing:
        details = "\n".join(
            f"  - {relative} (required by {', '.join(sorted(owners))})"
            for relative, owners in sorted(missing.items())
        )
        raise ValueError(f"Pages artifact has missing student runtime dependencies:\n{details}")
    return {"routes": len(routes), "dependencies": len(checked)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", type=Path)
    parser.add_argument("--source", type=Path, default=Path("."))
    parser.add_argument("--system-map", type=Path, required=True)
    parser.add_argument("--git-ref", default="HEAD")
    args = parser.parse_args()
    result = verify(args.site, args.source, json.loads(args.system_map.read_text()), args.git_ref)
    print(f"Verified {result['routes']} student routes and {result['dependencies']} artifact dependencies")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
