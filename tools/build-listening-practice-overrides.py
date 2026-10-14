#!/usr/bin/env python3
"""Create R2 JSON overrides whose embedded image paths point at the public asset Worker."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path("/private/tmp/edmund-site-assets-build/listening-practice-overrides")
BASE = "https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/"


def main() -> int:
    index = json.loads((ROOT / "workers/edmund-site-assets/src/site-pack-index-v1.json").read_text())
    known = set(index["entries"])
    OUTPUT.mkdir(parents=True, exist_ok=True)
    count = 0
    for source in sorted((ROOT / "assets/listening/practices").glob("practice-*.json")):
        text = source.read_text(encoding="utf-8")
        refs = re.findall(r'"src"\s*:\s*"(assets/[^"\n]+)"', text)
        if not refs:
            continue
        for ref in refs:
            if ref not in known:
                raise SystemExit(f"Missing referenced image: {ref}")
            text = text.replace('"' + ref + '"', '"' + BASE + ref + '"')
        json.loads(text)
        (OUTPUT / source.name).write_text(text, encoding="utf-8")
        count += 1
    if count != 11:
        raise SystemExit(f"Expected 11 listening practice overrides, found {count}")
    print(f"Prepared {count} listening practice JSON overrides")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
