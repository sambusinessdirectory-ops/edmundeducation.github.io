#!/usr/bin/env python3
"""Rewrite indexed media references to resilient public delivery origins."""

from __future__ import annotations

import argparse
import json
import posixpath
import re
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit


DEFAULT_ORIGIN = "https://edmund-public-media.edmundeducation.workers.dev"
DEFAULT_NEURAL_AUDIO_ORIGIN = "https://edmund-neural-audio.edmundeducation.workers.dev"
TEXT_EXTENSIONS = {".html", ".css", ".js", ".mjs", ".cjs", ".json", ".webmanifest", ".xml", ".svg", ".txt"}
MEDIA_EXTENSIONS = "mp3|wav|m4a|ogg|webp|jpg|jpeg|png|pdf|mp4|gif|ttf"
AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg"}
QUOTED_URL = re.compile(
    rf"(?P<quote>[\"'`])(?P<url>[^\"'`\r\n]+?\.(?:{MEDIA_EXTENSIONS})(?:[?#][^\"'`\r\n]*)?)(?P=quote)",
    re.IGNORECASE,
)
CSS_URL = re.compile(
    rf"(?P<prefix>url\(\s*)(?P<url>(?![\"'])[^)\s]+?\.(?:{MEDIA_EXTENSIONS})(?:[?#][^)\s]*)?)(?P<suffix>\s*\))",
    re.IGNORECASE,
)
CSP_META = re.compile(r"<meta\s+[^>]*http-equiv=[\"']Content-Security-Policy[\"'][^>]*>", re.IGNORECASE)
CSP_CONTENT = re.compile(
    r"(?P<prefix>\bcontent\s*=\s*)(?P<quote>[\"'])(?P<policy>.*?)(?P=quote)",
    re.IGNORECASE,
)


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


def csp_source(origin: str) -> str:
    parsed = urlsplit(origin)
    return f"{parsed.scheme}://{parsed.netloc}" if parsed.scheme and parsed.netloc else origin.rstrip("/")


def extend_csp(tag: str, additions: dict[str, set[str]], add_missing=()) -> str:
    match = CSP_CONTENT.search(tag)
    if not match:
        return tag
    directives: list[tuple[str, list[str]]] = []
    positions: dict[str, int] = {}
    for raw in match.group("policy").split(";"):
        tokens = raw.strip().split()
        if not tokens:
            continue
        positions[tokens[0].lower()] = len(directives)
        directives.append((tokens[0], tokens[1:]))
    for directive, sources in additions.items():
        key = directive.lower()
        if key not in positions:
            if key not in add_missing:
                continue
            positions[key] = len(directives)
            directives.append((directive, ["'self'"]))
        name, values = directives[positions[key]]
        for source in sorted(sources):
            if source not in values:
                values.append(source)
        directives[positions[key]] = (name, values)
    policy = "; ".join(" ".join((name, *values)) for name, values in directives)
    replacement = match.group("prefix") + match.group("quote") + policy + match.group("quote")
    return tag[:match.start()] + replacement + tag[match.end():]


def rewrite_text(
    value: str,
    source: Path,
    entries: set[str],
    origin: str,
    audio_origin: str | None = None,
    neural_audio_origin: str | None = None,
) -> tuple[str, int, int, int]:
    count = audio_count = neural_audio_count = 0

    if neural_audio_origin:
        old_origin = DEFAULT_NEURAL_AUDIO_ORIGIN.rstrip("/")
        new_origin = neural_audio_origin.rstrip("/")
        neural_audio_count = value.count(old_origin)
        value = value.replace(old_origin, new_origin)

    def destination(url: str) -> str:
        nonlocal count, audio_count
        match = indexed_path(url, source, entries)
        if not match:
            return url
        path, suffix = match
        count += 1
        delivery_origin = origin
        if audio_origin and Path(path).suffix.lower() in AUDIO_EXTENSIONS:
            delivery_origin = audio_origin
            audio_count += 1
        return delivery_origin.rstrip("/") + "/" + quote(path, safe="/") + suffix

    value = QUOTED_URL.sub(
        lambda match: match.group("quote") + destination(match.group("url")) + match.group("quote"),
        value,
    )
    value = CSS_URL.sub(
        lambda match: match.group("prefix") + destination(match.group("url")) + match.group("suffix"),
        value,
    )
    if (count or neural_audio_count) and source.suffix.lower() == ".html":
        additions = {
            directive: {csp_source(origin)}
            for directive in ("default-src", "img-src", "font-src", "connect-src", "media-src", "worker-src")
        }
        if audio_count and audio_origin:
            audio_source = csp_source(audio_origin)
            additions.setdefault("connect-src", set()).add(audio_source)
            additions.setdefault("media-src", set()).add(audio_source)
        if neural_audio_count and neural_audio_origin:
            neural_source = csp_source(neural_audio_origin)
            additions.setdefault("connect-src", set()).add(neural_source)
            additions.setdefault("media-src", set()).add(neural_source)
        value = CSP_META.sub(lambda match: extend_csp(match.group(0), additions), value)
    return value, count, audio_count, neural_audio_count


def candidates(site: Path):
    return (path for path in site.rglob("*")
            if path.is_file() and path.suffix.lower() in TEXT_EXTENSIONS)


def rewrite(
    site: Path,
    index_file: Path,
    origin: str,
    keep=(),
    audio_origin: str | None = None,
    neural_audio_origin: str | None = None,
) -> dict:
    keep = set(keep)
    entries = set(json.loads(index_file.read_text())["entries"]) - keep
    files = references = audio_references = neural_audio_references = 0
    for path in candidates(site):
        original = path.read_text(encoding="utf-8")
        updated, count, audio_count, neural_audio_count = rewrite_text(
            original,
            path.relative_to(site),
            entries,
            origin,
            audio_origin,
            neural_audio_origin,
        )
        if count or neural_audio_count:
            path.write_text(updated, encoding="utf-8")
            files += 1
            references += count
            audio_references += audio_count
            neural_audio_references += neural_audio_count
    csp_additions: dict[str, set[str]] = {}
    if references > audio_references:
        public_media_source = csp_source(origin)
        csp_additions = {
            directive: {public_media_source}
            for directive in (
                "default-src",
                "img-src",
                "font-src",
                "connect-src",
                "media-src",
                "worker-src",
            )
        }
    if audio_references and audio_origin:
        audio_source = csp_source(audio_origin)
        csp_additions.setdefault("connect-src", set()).add(audio_source)
        csp_additions.setdefault("media-src", set()).add(audio_source)
    if neural_audio_references and neural_audio_origin:
        neural_audio_source = csp_source(neural_audio_origin)
        csp_additions.setdefault("connect-src", set()).add(neural_audio_source)
        csp_additions.setdefault("media-src", set()).add(neural_audio_source)
    if csp_additions:
        for path in site.rglob("*.html"):
            original = path.read_text(encoding="utf-8")
            updated = CSP_META.sub(
                lambda match: extend_csp(
                    match.group(0),
                    csp_additions,
                    add_missing={"connect-src", "media-src"},
                ),
                original,
            )
            if updated != original:
                path.write_text(updated, encoding="utf-8")
    remaining_neural_worker_references = 0
    if neural_audio_origin:
        for path in candidates(site):
            remaining_neural_worker_references += path.read_text(
                encoding="utf-8"
            ).count(DEFAULT_NEURAL_AUDIO_ORIGIN)
        if remaining_neural_worker_references:
            raise RuntimeError(
                f"{remaining_neural_worker_references} blocked neural-audio Worker "
                "references remain in the Pages artifact"
            )
    return {
        "files": files,
        "references": references,
        "audio_references": audio_references,
        "neural_audio_references": neural_audio_references,
        "remaining_neural_worker_references": remaining_neural_worker_references,
        "origin": origin,
        "audio_origin": audio_origin,
        "neural_audio_origin": neural_audio_origin,
        "indexed_entries": len(entries),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", type=Path)
    parser.add_argument("index", type=Path)
    parser.add_argument("--origin", default=DEFAULT_ORIGIN)
    parser.add_argument(
        "--audio-origin",
        help="Immutable origin used for indexed audio while R2 remains the verified source of truth",
    )
    parser.add_argument(
        "--neural-audio-origin",
        help="School-network-compatible relay for generated neural audio",
    )
    parser.add_argument("--keep-list", type=Path, help="Newline-delimited paths to keep on Pages")
    args = parser.parse_args()
    if args.site.name != "_site" or not args.site.is_dir() or args.site.is_symlink():
        raise SystemExit("Expected a disposable _site artifact directory")
    keep = []
    if args.keep_list:
        keep = [line.strip() for line in args.keep_list.read_text().splitlines()
                if line.strip() and not line.lstrip().startswith("#")]
    print(json.dumps(rewrite(
        args.site,
        args.index,
        args.origin,
        keep,
        args.audio_origin,
        args.neural_audio_origin,
    ), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
