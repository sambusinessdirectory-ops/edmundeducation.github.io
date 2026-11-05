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


html = index.read_text()
boss_tag = '<script data-reader-source="boss-letter.js"></script>'
meeting_tag = '<script data-reader-source="meeting-data.js">'
if 'data-reader-source="boss-letter.js"' not in html:
    if meeting_tag not in html:
        raise ValueError("Missing meeting-data.js script anchor")
    html = html.replace(meeting_tag, boss_tag + meeting_tag, 1)
podcast_tag = '<script data-reader-source="podcast-v4.js"></script>'
podcast_anchor = '<script data-reader-source="reference/benchmark-pages.js">'
if 'data-reader-source="podcast-v4.js"' not in html:
    if podcast_anchor not in html:
        raise ValueError("Missing benchmark-pages.js script anchor")
    html = html.replace(podcast_anchor, podcast_tag + podcast_anchor, 1)
html = re.sub(r'<script data-reader-source="podcast-v[56]\.js">.*?</script>', '', html, flags=re.S)
podcast_v7_tag = '<script data-reader-source="podcast-v7.js"></script>'
if 'data-reader-source="podcast-v7.js"' not in html:
    if podcast_anchor not in html:
        raise ValueError("Missing benchmark-pages.js script anchor")
    html = html.replace(podcast_anchor, podcast_v7_tag + podcast_anchor, 1)
atomic_anchor = '<script data-reader-source="reference-shell.js">'
if 'data-reader-source="source-units.js"' not in html:
    html = html.replace(atomic_anchor, '<script data-reader-source="source-units.js"></script>' + atomic_anchor, 1)
index.write_text(scripts.sub(embed, html))
