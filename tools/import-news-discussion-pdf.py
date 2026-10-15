#!/usr/bin/env python3
"""Extract News Discussion 1 into a structured, reviewable seed document."""

import json
import re
import sys
from pathlib import Path

import pdfplumber


SOURCE = Path('/Users/sammak/Downloads/News Discussion 1 - .pdf')
TARGET = Path('/private/tmp/news-discussion-1.json')
ARGUMENT = re.compile(r'^(\d{1,2})\.\s+(.+)$')
ANGLE = re.compile(r'^角度[一二三四五六七八九十]+：(.+)$')
GLOSSARY = re.compile(r'^(.+?)\s+([\u3400-\u9fff].*)$')
STRUCTURE = re.compile(r'^(\d{1,2})\s+([A-Za-z].*?)\s+([\u3400-\u9fff].*)$')


def extract(source: Path):
    with pdfplumber.open(source) as pdf:
        lines = [line.strip() for page in pdf.pages for line in
                 (page.extract_text(x_tolerance=2, y_tolerance=3) or '').splitlines()
                 if line.strip()]
    news = {
        'id': 'news-1',
        'title': '銀行應否有權暫停可疑的大額轉賬？',
        'published_at': '2026-10-15',
        'source_label': '香港01（日期及事件據所附教材）',
        'source_url': None,
        'image': None,
        'brief': '',
        'questions': [{
            'id': 'q1',
            'text': '銀行應否有權違反客戶意願，暫停可疑的大額轉賬？',
            'for_label': '銀行應有權暫停可疑的大額轉賬',
            'against_label': '銀行不應有權違反客戶意願暫停轉賬',
            'for': [],
            'against': [],
            'structures': [],
        }],
    }
    question = news['questions'][0]
    side = None
    angle = ''
    current = None
    section = 'brief'
    brief_lines = []
    for line in lines:
        if line == 'Brief News Content:':
            continue
        if line.startswith('二、正方：'):
            side, section = 'for', 'heading'
            continue
        if line.startswith('三、反方：'):
            side, section = 'against', 'heading'
            current = None
            continue
        if line.startswith('正方立場：') or line.startswith('反方立場：'):
            continue
        if line == '20個句式表':
            side, section = None, 'structures'
            current = None
            continue
        if section == 'brief':
            brief_lines.append(line)
            continue
        if section == 'structures':
            if line.startswith('#  Sentence Structure'):
                continue
            match = STRUCTURE.match(line)
            if match:
                number, english, purpose = match.groups()
                question['structures'].append({
                    'id': f'structure:{number}', 'number': int(number),
                    'english': english, 'purpose': purpose,
                })
            elif question['structures']:
                previous = question['structures'][-1]
                if re.search(r'[\u3400-\u9fff]', line):
                    previous['purpose'] += line
                else:
                    previous['english'] += ' ' + line
            continue
        match = ANGLE.match(line)
        if match:
            angle = match.group(1)
            section = 'heading'
            continue
        match = ARGUMENT.match(line)
        if match:
            number, title = match.groups()
            current = {
                'id': f'arg:{side}:{number}', 'number': int(number),
                'angle': angle, 'title': title, 'description': '', 'glossary': [],
            }
            question[side].append(current)
            section = 'description'
            continue
        if not current:
            continue
        if line == '英文詞彙 中文翻譯':
            section = 'glossary'
            continue
        if section == 'description':
            current['description'] += line
        elif section == 'glossary':
            match = GLOSSARY.match(line)
            if match:
                english, chinese = match.groups()
                current['glossary'].append({
                    'id': f'gloss:{side}:{current["number"]}:{len(current["glossary"])+1}',
                    'english': english.strip(), 'chinese': chinese.strip(),
                })
            elif current['glossary']:
                previous = current['glossary'][-1]
                if re.search(r'[\u3400-\u9fff]', line):
                    previous['chinese'] += line
                else:
                    previous['english'] += ' ' + line
    news['brief'] = ''.join(brief_lines)
    return news


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else SOURCE
    target = Path(sys.argv[2]) if len(sys.argv) > 2 else TARGET
    document = extract(source)
    question = document['questions'][0]
    assert len(question['for']) == 40, len(question['for'])
    assert len(question['against']) == 50, len(question['against'])
    assert len(question['structures']) == 20, len(question['structures'])
    for side in ('for', 'against'):
        assert [argument['number'] for argument in question[side]] == list(range(1, len(question[side]) + 1))
        for argument in question[side]:
            assert argument['description'] and len(argument['glossary']) >= 3, argument
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"Wrote {target}: 40 for, 50 against, 20 sentence structures; "
          f"{sum(len(a['glossary']) for side in ('for','against') for a in question[side])} glossary entries")


if __name__ == '__main__':
    main()
