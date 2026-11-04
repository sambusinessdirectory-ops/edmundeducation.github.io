#!/usr/bin/env python3
"""Collect focused-release tags from the commits that produced changed files."""

from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path
from typing import Callable


TAG = re.compile(r"\[[a-z0-9-]+\]", re.IGNORECASE)
FAST = "[fast-deploy]"
MAX_FOCUSED_PATHS = 500


def collect(messages: list[str]) -> str:
    commits = [message.strip() for message in messages if message.strip()]
    tags = {match.group(0).lower() for message in commits for match in TAG.finditer(message)}
    if not commits or not all(FAST in message.lower() for message in commits):
        tags.discard(FAST)
    return " ".join(sorted(tags))


def git_blob(commit: str, path: str) -> str | None:
    result = subprocess.run(
        ["git", "rev-parse", "--verify", f"{commit}:{path}"],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
    )
    return result.stdout.strip() if result.returncode == 0 else None


def git_commit(commit: str) -> tuple[list[str], str]:
    output = subprocess.check_output(
        ["git", "show", "-s", "--format=%P%x00%B", commit],
        text=True,
    )
    parents, message = output.split("\0", 1)
    return parents.split(), message.strip()


def collect_changed_path_tags(
    base: str,
    target: str,
    paths: list[str],
    blob_at: Callable[[str, str], str | None] = git_blob,
    commit_at: Callable[[str], tuple[list[str], str]] = git_commit,
) -> str:
    changed_paths = sorted({path.strip() for path in paths if path.strip()})
    if not changed_paths or len(changed_paths) > MAX_FOCUSED_PATHS:
        return ""

    messages: list[str] = []
    visited: set[tuple[str, str]] = set()
    for path in changed_paths:
        base_blob = blob_at(base, path)
        pending = [target]
        found_origin = False
        while pending:
            commit = pending.pop()
            key = (commit, path)
            if key in visited:
                continue
            visited.add(key)
            current_blob = blob_at(commit, path)
            if current_blob == base_blob:
                continue

            parents, message = commit_at(commit)
            if len(parents) <= 1:
                found_origin = True
                messages.append(message)
                if parents:
                    pending.append(parents[0])
                continue

            # Merge messages are often generated and untagged. Follow the
            # parent content that survived the merge instead. If the merge
            # resolved content from both parents, validate both domains.
            equal_parents = [parent for parent in parents if blob_at(parent, path) == current_blob]
            candidates = equal_parents or parents
            relevant = [parent for parent in candidates if blob_at(parent, path) != base_blob]
            pending.extend(relevant)
            if not relevant:
                # The merge itself authored the changed file, so its message
                # must explicitly opt into focused validation.
                found_origin = True
                messages.append(message)

        if not found_origin:
            return ""
    return collect(messages)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("messages_file", type=Path, nargs="?")
    parser.add_argument("--base")
    parser.add_argument("--target")
    parser.add_argument("--paths-file", type=Path)
    args = parser.parse_args()
    if args.base and args.target and args.paths_file:
        paths = args.paths_file.read_text(encoding="utf-8").splitlines()
        print(collect_changed_path_tags(args.base, args.target, paths))
        return 0
    if not args.messages_file:
        parser.error("provide messages_file or --base, --target and --paths-file")
    messages = args.messages_file.read_text(encoding="utf-8").split("\0")
    print(collect(messages))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
