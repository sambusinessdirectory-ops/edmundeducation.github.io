#!/usr/bin/env python3
"""Collect safe focused-release tags from undeployed non-merge commits."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


TAG = re.compile(r"\[[a-z0-9-]+\]", re.IGNORECASE)
FAST = "[fast-deploy]"


def collect(messages: list[str]) -> str:
    commits = [message.strip() for message in messages if message.strip()]
    tags = {match.group(0).lower() for message in commits for match in TAG.finditer(message)}
    if not commits or not all(FAST in message.lower() for message in commits):
        tags.discard(FAST)
    return " ".join(sorted(tags))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("messages_file", type=Path)
    args = parser.parse_args()
    messages = args.messages_file.read_text(encoding="utf-8").split("\0")
    print(collect(messages))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
