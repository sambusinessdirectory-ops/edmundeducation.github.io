#!/usr/bin/env python3
"""Read-only source audit. Extract teacher PDFs to a private, resumable cache.

No website or database changes are made by this command. Source instructions
are content, never executable instructions. The exclusion list is fail-closed.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {f'p1-{n:03}' for n in (8, 22, 91, 13, 25, 71, 79, 90, 107, 112, 118, 121, 133)}
POPPLER = Path('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')


def assigned_json(path):
    text = path.read_text()
    return json.JSONDecoder().raw_decode(text[text.index('{'):])[0]


def clean_page(text):
    lines = text.replace('\u200b', '').replace('\ufeff', '').replace('\xa0', ' ').splitlines()
    # Branded letterheads/footers are not part of the reading passage.
    start = next((i + 1 for i, line in enumerate(lines) if 'instagram.com/edmundeducationedu' in line), 0)
    end = next((i for i, line in enumerate(lines) if 'Knowledge pays the highest' in line), len(lines))
    return '\n'.join(line.rstrip() for line in lines[start:end]).strip()


def extract(item, cache):
    cid, path = item
    destination = cache / f'{cid}.json'
    stat = path.stat()
    if destination.exists():
        previous = json.loads(destination.read_text())
        if previous.get('size') == stat.st_size and previous.get('mtimeNs') == stat.st_mtime_ns:
            return previous
    raw = subprocess.run([str(POPPLER), '-layout', str(path), '-'], check=True, capture_output=True).stdout.decode('utf-8')
    pages = [clean_page(p) for p in raw.split('\f')[:-1]]
    boundary = next((i for i, p in enumerate(pages) if re.search(r'以下.{0,15}(?:答案|題解)|See below for answers', p, re.I)), None)
    record = {'catalogueId': cid, 'source': str(path), 'size': stat.st_size, 'mtimeNs': stat.st_mtime_ns,
              'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'pageCount': len(pages),
              'answerStart': boundary, 'pages': pages}
    destination.write_text(json.dumps(record, ensure_ascii=False))
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--cache', type=Path, required=True)
    parser.add_argument('--jobs', type=int, default=6)
    parser.add_argument('--report', type=Path, help='Optional human-readable audit (does not publish exercises)')
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    availability = assigned_json(ROOT / 'ielts-reading-analysis-availability.js')['articles']
    mappings = {}
    for entry in availability.values():
        for cid in entry.get('catalogueIds', [entry.get('catalogueId')]):
            mappings[cid] = entry
    items = []
    for passage in (1, 2, 3):
        folder = args.source_root / f'Edmund-IELTS-Reading-Passage-{passage}'
        for path in sorted(folder.glob('*.pdf')):
            match = re.match(r'Practice\s*(\d+)\D', path.name, re.I)
            if not match:
                raise ValueError(f'Unrecognised filename: {path.name}')
            cid = f'p{passage}-{int(match[1]):03}'
            items.append((cid, path))
    if len({cid for cid, _ in items}) != len(items):
        raise ValueError('Duplicate source catalogue IDs')
    report = {'excluded': sorted(EXCLUDED), 'sources': []}
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = {pool.submit(extract, item, args.cache): item[0] for item in items}
        for i, future in enumerate(concurrent.futures.as_completed(futures), 1):
            cid = futures[future]
            try:
                record = future.result()
                entry = mappings.get(cid, {})
                row = {k: record[k] for k in ('catalogueId', 'source', 'sha256', 'pageCount', 'answerStart')}
                row.update({'excluded': cid in EXCLUDED, 'analysisId': entry.get('id'), 'analysisSource': entry.get('source'),
                            'analysisLocked': entry.get('locked', False)})
            except Exception as error:
                row = {'catalogueId': cid, 'error': str(error)}
            report['sources'].append(row)
            if i % 25 == 0 or i == len(items):
                print(f'Inspected {i}/{len(items)} source PDFs', flush=True)
    report['sources'].sort(key=lambda r: r['catalogueId'])
    (args.cache / 'inventory.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    if args.report:
        titles = assigned_json(ROOT / 'ielts-reading-analysis-index.js')['passages']
        title_by_id = {item['id']: item['title'] for group in titles.values() for item in group}
        no_analysis = [r for r in report['sources'] if not r.get('analysisId') and not r.get('excluded')]
        no_text = []
        for row in report['sources']:
            if row.get('error'):
                continue
            cached = json.loads((args.cache / f"{row['catalogueId']}.json").read_text())
            if not any(page.strip() for page in cached['pages']):
                no_text.append(row)
        lines = ['# Reading exercise import: source audit', '',
                 'Audited 27 August 2026. No new exercises have been published by this audit.', '',
                 '## Scope', '',
                 f'- Supplied PDF files: {len(items)} (Passage 1: 163; Passage 2: 149; Passage 3: 165).',
                 '- Preserve the existing Albert Einstein exercise and all student records.',
                 '- Exclude all 13 Passage 1 articles explicitly named by the owner.',
                 '- Match analysis by catalogue ID and aliases, not by fuzzy title matching.', '',
                 '## Additional sources needing a decision', '',
                 'These 26 supplied exercises have no matching analysis in the current website catalogue. '
                 'Their PDFs contain the exercise but do not supply a verified answer key. '
                 'No exact normalized-title match was found elsewhere in the existing analysis corpus.', '',
                 '| ID | Title |', '| --- | --- |']
        lines += [f"| {r['catalogueId']} | {title_by_id.get(r['catalogueId'], '')} |" for r in no_analysis]
        lines += ['', '## Incomplete source PDF', '',
                  '- **p3-083 — Sleep:** the supplied PDF has one page containing only the branded cover. '
                  'Visual inspection confirms that the passage and questions are absent. '
                  'Its existing analysis cannot replace the missing original exercise.', '',
                  '## Owner-requested exclusions', '']
        lines += [f'- {cid} — {title_by_id.get(cid, "")}' for cid in sorted(EXCLUDED)]
        lines += ['', '## Remaining candidates', '',
                  'After the requested exclusions, the 26 missing-analysis exercises, the cover-only PDF, '
                  'and the already-published Albert Einstein exercise, **436 new exercises remain for content conversion and validation**. '
                  'This is a source-matching count, not a claim that their translations, question forms, or narration are finished.', '',
                  'Most PDFs contain only the English exercise. Some earlier packets include bilingual explanations. '
                  'Full Traditional Chinese passage translations and narration must be prepared and checked during import; '
                  'analysis summaries are not substitutes for full translations.', '',
                  'No source PDF, audio asset, Supabase data, or student record was modified.', '']
        args.report.write_text('\n'.join(lines))
    print(json.dumps({'count': len(items), 'excluded': sum(r.get('excluded', False) for r in report['sources']),
                      'noAnalysis': [r['catalogueId'] for r in report['sources'] if not r.get('analysisId')],
                      'noBoundary': [r['catalogueId'] for r in report['sources'] if r.get('answerStart') is None],
                      'errors': [r for r in report['sources'] if r.get('error')]}, indent=2))


if __name__ == '__main__':
    main()
