"""Embed the reader's ordered classic scripts in one cacheable HTML document.

Edit the individual JavaScript sources, then run this file. The source paths
in data-reader-source keep repeated builds deterministic.
"""
from pathlib import Path
import re

reader = Path(__file__).resolve().parents[1] / "paper3/2023-b2/curation"
index = reader / "index.html"
scripts = re.compile(r'<script (?:src|data-reader-source)="([^"?]+)(?:\?[^"]*)?">.*?</script>', re.S)


def embed(match):
    name = match[1]
    source = (reader / name).read_text()
    if "</script" in source.lower():
        raise ValueError(f"Unescaped script end in {name}")
    return f'<script data-reader-source="{name}">\n{source.rstrip()}\n</script>'


index.write_text(scripts.sub(embed, index.read_text()))
