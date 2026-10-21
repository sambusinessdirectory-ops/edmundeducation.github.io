"""Extract phrase-level curation highlights from the supplied 2025 B2 annotated PDF.

Usage: python3 tools/build-paper3-curation-highlights.py path/to/benchmark.pdf
The checked-in browser asset is intentionally standalone; students never need the PDF.
"""
import collections
import json
import re
import sys
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'paper3/2025-b2/sentence-analysis-data.js'
OUTPUT = ROOT / 'paper3/2025-b2/super-curation-highlights.js'
COLORS = {
    (1.0, 1.0, 0.0): 'yellow',
    (0.0, 1.0, 1.0): 'cyan',
    (0.9176, 0.6, 0.6): 'rose',
    (0.0, 1.0, 0.0): 'green',
}


def norm(text):
    return (re.sub(r'\s+', '', text).casefold()
            .replace('’', "'").replace('‘', "'")
            .replace('“', '"').replace('”', '"')
            .strip('"“”.,:;!！。[]()'))


def kind(record):
    for block in record.get('blocks', []):
        match = re.match(r'類型：([1-6])', block)
        if match:
            return int(match.group(1))
    return 0


def add(out, record_id, location, phrase, color):
    value = {'text': phrase, 'color': color}
    if value not in out[record_id][location]:
        out[record_id][location].append(value)


def main(pdf_path):
    source = SOURCE.read_text()
    records = json.loads(source.split('=', 1)[1].strip().rstrip(';'))['records']
    pages = collections.defaultdict(list)
    for record in records:
        for number in record.get('pages', []):
            pages[number].append(record)
    result = collections.defaultdict(lambda: {'source': [], 'analysis': []})
    with pdfplumber.open(pdf_path) as pdf:
        for number, page in enumerate(pdf.pages, 1):
            if number not in pages:
                continue
            for rect in page.rects:
                color = COLORS.get(rect.get('non_stroking_color'))
                if not color or rect['top'] < 70 or rect['bottom'] > 720:
                    continue  # page branding/footer is not learning content
                phrase = (page.crop((rect['x0'], rect['top'] - 1,
                                     rect['x1'], rect['bottom'] + 1))
                          .extract_text(x_tolerance=1, y_tolerance=3) or '').strip()
                needle = norm(phrase)
                if len(needle) < 4:
                    continue
                found = []
                for record in pages[number]:
                    quote = norm(record['quote'])
                    blocks = norm(' '.join(record.get('blocks', [])))
                    if needle in quote:
                        found.append((record, 'source'))
                    elif needle in blocks:
                        found.append((record, 'analysis'))
                if len(found) != 1:
                    continue  # ambiguous PDF geometry must not become a false mark
                record, location = found[0]
                if location == 'source' and kind(record) not in (1, 2, 3, 4):
                    continue
                add(result, record['id'], location, phrase, color)

    # These highlights repeat a phrase in the source and in the analysis. The
    # PDF places yellow on the source and cyan on the analysis explanation.
    result['duncan-henley-emails-14']['source'] = [
        {'text': 'interesting', 'color': 'yellow'},
        {'text': 'inclusive', 'color': 'yellow'},
        {'text': 'Sports Day at the Beach!', 'color': 'cyan'},
    ]
    result['duncan-henley-emails-14']['analysis'] = [
        {'text': '這句可以直接用作 proposal 的理由之一：', 'color': 'cyan'},
        {'text': 'more interesting', 'color': 'cyan'},
        {'text': 'more inclusive', 'color': 'cyan'},
    ]
    result['duncan-henley-emails-10']['analysis'] = [
        {'text': '但它是老師判斷，不是 student feedback。', 'color': 'rose'},
        {'text': '不宜當 Task 1 的主要 feedback', 'color': 'rose'},
    ]
    # This deletion cue is Type 5: keep its analysis, not a source highlight.
    result.pop('duncan-henley-emails-13', None)
    result['sports-article-14']['source'] = [
        {'text': 'sat down for a very long time', 'color': 'yellow'},
    ]
    result['sports-article-18']['source'] = [
        {'text': 'keep players', 'color': 'yellow'},
        {'text': 'on the move.', 'color': 'yellow'},
    ]
    result['whatsapp-chat-15']['source'] = [
        {'text': 'It depends on the transport situation', 'color': 'cyan'},
    ]
    # Remove accidental page-header matches and ineffective snippets.
    result.pop('guide-1', None)
    for record_id, group in list(result.items()):
        for location in ('source', 'analysis'):
            group[location] = [item for item in group[location] if len(norm(item['text'])) >= 5]
        if not group['source'] and not group['analysis']:
            del result[record_id]
    content = dict(sorted(result.items()))
    OUTPUT.write_text('/* Exact phrase highlights from the supplied revised 2025 B2 benchmark PDF. */\n'
                      'window.EDMUND_B2_CURATION_HIGHLIGHTS = '
                      + json.dumps(content, ensure_ascii=False, indent=2) + ';\n')
    print(f'Wrote {len(content)} records to {OUTPUT}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
