#!/usr/bin/env python3
"""Extract the supplied News 2 PDF into a reviewable private seed document."""

import json
import re
import sys
from pathlib import Path

import pdfplumber


SOURCE = Path('/Users/sammak/Downloads/News 2.pdf')
TARGET = Path('/private/tmp/news-discussion-2.json')
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
        'id': 'news-2',
        'title': '工人應否有權拒絕不安全的工作？',
        'published_at': '2026-10-15',
        'source_label': '香港01（事故背景據所附教材）',
        'source_url': None,
        'brief': '',
        'questions': [{
            'id': 'q1',
            'text': '當工人認為工作環境不安全時，是否應有權拒絕工作，而不受扣薪、解僱或其他紀律處分？',
            'for_label': '工人應有權拒絕不安全工作而不受處分',
            'against_label': '拒絕權須有客觀條件、合理程序及責任界線',
            'for': [], 'against': [], 'structures': [],
        }],
    }
    q = news['questions'][0]
    side = None
    angle = ''
    current = None
    section = 'preamble'
    brief_lines = []
    for line in lines:
        if line.startswith('二、正方：'):
            side, section, current = 'for', 'heading', None
            continue
        if line.startswith('三、反方：'):
            side, section, current = 'against', 'heading', None
            continue
        if line.startswith('四、20個全新英文辯論句式'):
            side, section, current = None, 'structures', None
            continue
        if section == 'preamble':
            if line.startswith('新聞背景：'):
                section = 'brief'
                brief_lines.append(line.removeprefix('新聞背景：').strip())
            continue
        if section == 'brief':
            brief_lines.append(line)
            continue
        if section == 'structures':
            if line.startswith('# Sentence Structure') or line.startswith('這是你後來要求') or line.startswith('完整教材已在'):
                continue
            match = STRUCTURE.match(line)
            if match:
                number, english, purpose = match.groups()
                q['structures'].append({
                    'id': f'structure:{number}', 'number': int(number),
                    'english': english, 'purpose': purpose,
                })
            elif q['structures']:
                previous = q['structures'][-1]
                if re.match(r'^[\u3400-\u9fff]', line):
                    previous['purpose'] += line
                elif previous['number'] == 17 and line.startswith('... 處'):
                    previous['english'] += ' ...'
                    previous['purpose'] += '處'
                else:
                    previous['english'] += ' ' + line
            continue
        if line.startswith('正方立場：') or line.startswith('反方立場：'):
            continue
        match = ANGLE.match(line)
        if match:
            angle = match.group(1)
            section = 'heading'
            continue
        match = ARGUMENT.match(line)
        if match and side:
            number, title = match.groups()
            current = {
                'id': f'arg:{side}:{number}', 'number': int(number),
                'angle': angle, 'title': title, 'description': '', 'glossary': [],
            }
            q[side].append(current)
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
                if re.match(r'^[\u3400-\u9fff]', line):
                    previous['chinese'] += line
                else:
                    previous['english'] += ' ' + line

    news['brief'] = ''.join(brief_lines).rstrip('。') + '。'
    return news


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else SOURCE
    target = Path(sys.argv[2]) if len(sys.argv) > 2 else TARGET
    news = extract(source)
    q = news['questions'][0]
    assert news['brief'] and '事故原因仍有待調查' in news['brief']
    assert len(q['for']) == 64, len(q['for'])
    assert len(q['against']) == 64, len(q['against'])
    assert len(q['structures']) == 20, len(q['structures'])
    for side in ('for', 'against'):
        assert [arg['number'] for arg in q[side]] == list(range(1, 65))
        for arg in q[side]:
            assert arg['description'], arg
            assert len(arg['glossary']) == 5, (arg['id'], arg['glossary'])
            assert all(item['english'] and item['chinese'] for item in arg['glossary'])
    assert [item['number'] for item in q['structures']] == list(range(1, 21))
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(news, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Wrote {target}: 64 for, 64 against, 640 glossary entries, 20 structures')


if __name__ == '__main__':
    main()
