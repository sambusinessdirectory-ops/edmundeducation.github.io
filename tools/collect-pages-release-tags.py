#!/usr/bin/env python3
"""Resolve focused Pages release tags from a versioned changed-path policy."""

from __future__ import annotations

import argparse
import fnmatch
import json
import sys
from pathlib import Path, PurePosixPath


FAST = "[fast-deploy]"
MAX_FOCUSED_PATHS = 500
DEFAULT_POLICY = Path(__file__).with_name("pages-release-scopes.json")


def safe_path(value: str) -> str:
    path = PurePosixPath(value)
    if not value or path.is_absolute() or ".." in path.parts:
        raise ValueError(f"Unsafe changed path: {value}")
    return value


def load_policy(path: Path = DEFAULT_POLICY) -> dict[str, tuple[str, ...]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("version") != 1 or not isinstance(payload.get("scopes"), dict):
        raise ValueError(f"Unsupported Pages release scope policy: {path}")

    policy: dict[str, tuple[str, ...]] = {}
    for tag, patterns in payload["scopes"].items():
        if not (
            isinstance(tag, str)
            and tag.startswith("[")
            and tag.endswith("]")
            and isinstance(patterns, list)
            and patterns
            and all(isinstance(pattern, str) and pattern for pattern in patterns)
        ):
            raise ValueError(f"Invalid Pages release scope entry: {tag!r}")
        policy[tag.lower()] = tuple(patterns)
    return policy


def collect_path_scopes(
    paths: list[str],
    policy: dict[str, tuple[str, ...]],
) -> tuple[str, list[str]]:
    changed_paths = sorted({safe_path(path.strip()) for path in paths if path.strip()})
    if not changed_paths or len(changed_paths) > MAX_FOCUSED_PATHS:
        return "", changed_paths

    tags: set[str] = set()
    uncovered: list[str] = []
    for path in changed_paths:
        matches = {
            tag
            for tag, patterns in policy.items()
            if any(fnmatch.fnmatchcase(path, pattern) for pattern in patterns)
        }
        # Test-only assertion repairs validate the repaired gate contract; they
        # must not pull the unchanged multi-gigabyte product corpus merely
        # because a product scope also has a broad test filename pattern.
        if "[release-gate-repair]" in matches:
            matches = {"[release-gate-repair]"}
        if matches:
            tags.update(matches)
        else:
            uncovered.append(path)

    # A single unclassified file sends the complete undeployed range through
    # full validation. Known scopes remain visible for route diagnostics.
    shared = any(
        path.startswith("shared-")
        or path in {"index.html", "pwa-register.js", "release.json", "service-worker.js"}
        for path in changed_paths
    )
    if not uncovered and not shared:
        tags.add(FAST)
        if "[audio-contract-release]" in tags:
            tags.add("[full-artifact]")
    return " ".join(sorted(tags)), uncovered


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--paths-file", type=Path, required=True)
    parser.add_argument("--policy", type=Path, default=DEFAULT_POLICY)
    args = parser.parse_args()

    paths = args.paths_file.read_text(encoding="utf-8").splitlines()
    tags, uncovered = collect_path_scopes(paths, load_policy(args.policy))
    if uncovered:
        print(
            "Pages full-validation fallback; unclassified paths: "
            + ", ".join(uncovered),
            file=sys.stderr,
        )
    print(tags)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
