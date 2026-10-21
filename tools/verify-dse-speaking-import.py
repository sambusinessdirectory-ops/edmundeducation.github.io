#!/usr/bin/env python3
"""Check that all supplied learner-facing speaking bank units survive import."""
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('/Users/sammak/Downloads')
spec = importlib.util.spec_from_file_location('dse_importer', ROOT / 'tools/import-dse-speaking-banks.py')
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)
manifest = json.loads((ROOT / 'dse-argument-bank/import-manifest.json').read_text())
assert len(manifest) == len(module.SOURCES) == 14
assert not any('checklist' in source.lower() or 'manual' in source.lower() for source in module.SOURCES)
migration = (ROOT / 'supabase/migrations/20261021000000_dse_argument_all_banks_recordings.sql').read_text()
synonym_bounds = {module_id: int(maximum) for module_id, maximum in re.findall(r"\('([^']+)',(\d+)\)", migration)}
for filename in ('data.json', 'driving-data.json', 'self-care-data.json', 'mario-data.json', 'subtitles-data.json'):
    existing = json.loads((ROOT / 'dse-argument-bank' / filename).read_text())
    assert synonym_bounds[existing['id']] == len(existing['synonyms']) - 1, filename
total = 0
for name, row in zip(module.SOURCES, manifest):
    source = SOURCE / name
    data = json.loads((ROOT / 'dse-argument-bank' / row['file']).read_text())
    assert data['sourceFile'] == name and data['id'] == row['id']
    assert synonym_bounds[data['id']] == len(data['synonyms']) - 1, name
    assert len(data['groups']) == 3 and len(data['responses']) == 8
    headings = [module.ID.match(line)[1] for line in source.read_text(encoding='utf-8-sig').splitlines() if module.ID.match(line)]
    arguments = [item for section in data['groups'] + data['responses'] for item in section['arguments']]
    ids = [item['id'] for item in arguments]
    assert len(ids) == len(set(ids)) == len(headings) == row['arguments'], name
    assert set(ids) == set(headings), name
    assert len(data['structures']) == 20, name
    assert all(len(section['samples']) == 2 for section in data['responses']), name
    assert all(section['question'] and section['arguments'] for section in data['groups'] + data['responses']), name
    for item in arguments:
        assert item['title'] and item['description'] and item['angle'], (name, item['id'])
        assert len(item['glossary']) == 5, (name, item['id'])
        spoken = item['englishDemo'].replace('**', '').casefold()
        assert spoken, (name, item['id'])
        assert all(term['english'].casefold() in spoken and term['chinese'] for term in item['glossary']), (name, item['id'])
    for entry in data['synonyms']:
        assert entry['keyword'] and len(entry['alternatives']) == 5
        assert all(word and '<br' not in word and '**' not in word for word in entry['alternatives'])
    total += len(ids)
print(f'PASS: {len(manifest)} supplied banks, {total} distinct arguments, all five glossary terms in every demonstration, two responses for every Part B question, all structures and synonym groups')
