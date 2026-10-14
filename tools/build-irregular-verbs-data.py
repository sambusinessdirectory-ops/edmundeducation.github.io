#!/usr/bin/env python3
"""Import the supplied bilingual study sheet without silently rewriting its content."""
from hashlib import sha256
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'irregular-verbs' / 'irregular_verbs_bilingual_full.txt'
OUT = ROOT / 'irregular-verbs' / 'data.json'
raw = SOURCE.read_text(encoding='utf-8')
blocks = re.split(r'(?=^##\s*\d+\.)', raw, flags=re.M)[1:]
heading = re.compile(r'^##\s*(\d+)\.\s*(.*?)（(.*?)）\s*[—–-]\s*(.*?)\s*/\s*(.*?)\s*/\s*(.*?)\s*$')
example = re.compile(r'^([123])\.\s+(.+?)\s*\n\s*【([^】]+)】', re.M)
entries = []

for block in blocks:
    line = block.splitlines()[0]
    match = heading.fullmatch(line)
    if not match:
        raise ValueError(f'Unrecognized heading: {line}')
    number, lemma, meaning, v1, v2, v3 = match.groups()
    number = int(number)
    if number != len(entries) + 1:
        raise ValueError(f'Entry sequence gap at {number}')
    # The parenthetical label distinguishes this lemma from "lie" = tell an untruth;
    # it is not part of the V1 form students should enter or hear.
    if lemma == 'lie (recline)':
        v1 = 'lie'
    forms = [v1, v2, v3]
    samples = example.findall(block)
    if [int(position) for position, _, _ in samples] != [1, 2, 3]:
        raise ValueError(f'Entry {number} must have V1, V2 and V3 examples')
    sentences = []
    for position, english, chinese in samples:
        index = int(position) - 1
        candidates = [form.strip() for form in forms[index].split(',')]
        if lemma == 'lie (recline)' and index == 0:
            candidates = ['lie']
        if lemma == 'wind' and index == 0:
            candidates.append('winds')  # The supplied V1 example uses third-person singular.
        matches = []
        for candidate in candidates:
            for found in re.finditer(r'(?<![A-Za-z])' + re.escape(candidate) + r'(?![A-Za-z])', english, re.I):
                matches.append((found.start(), found.end(), english[found.start():found.end()]))
        if not matches:
            raise ValueError(f'No target form in entry {number}, example {position}: {english}')
        # Multiple target forms in one supplied example (e.g. "was" and "were")
        # become separate blanks; this prevents the answer leaking through the sentence.
        matches.sort(key=lambda span: (span[0], -(span[1] - span[0])))
        spans = []
        for start, end, answer in matches:
            if spans and start < spans[-1][1]:
                continue
            spans.append((start, end, answer))
        parts = []
        offset = 0
        for start, end, _ in spans:
            parts.append(english[offset:start])
            offset = end
        parts.append(english[offset:])
        sentences.append({'form': int(position), 'english': english, 'chinese': chinese,
                          'parts': parts, 'answers': [answer for _, _, answer in spans]})
    entries.append({'id': number, 'lemma': lemma, 'meaning': meaning,
                    'forms': forms, 'sentences': sentences})

if len(entries) != 220 or sum(len(entry['sentences']) for entry in entries) != 660:
    raise ValueError('Expected exactly 220 entries and 660 examples')
OUT.parent.mkdir(exist_ok=True)
# The checked-in copy removes trailing Markdown spaces; retain the attached file's
# original byte hash separately so the import can be traced to the supplied artifact.
OUT.write_text(json.dumps({'source': SOURCE.name, 'source_sha256': sha256(SOURCE.read_bytes()).hexdigest(),
                           'supplied_source_sha256': '3b7094838767d5624657ca1e270077e2c8874ea92fa1c6f7c4c31d269ed966e4',
                           'entries': entries}, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
print(f'Imported {len(entries)} entries and 660 examples to {OUT}')
