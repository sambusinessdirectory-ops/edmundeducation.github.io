#!/usr/bin/env python3
"""Losslessly extract the supplied Campus TV speaking bank's teaching entries."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'dse-argument-bank'
SOURCE = ROOT / 'subtitles-source.md'
DEST = ROOT / 'subtitles-data.json'
lines = SOURCE.read_text(encoding='utf-8').splitlines()

GROUP_TITLES = [
    'Benefits of adding subtitles to the programmes',
    'Whether adding subtitles to programmes would be popular among students',
    'Types of programmes subtitles are not suitable for',
]


def plain(value):
    return value.replace('**', '').replace('`', '').strip()


def table_rows(start, columns):
    rows = []
    for line in lines[start:]:
        if not line.startswith('|'):
            break
        cells = [cell.strip() for cell in line.strip().strip('|').split('|')]
        if len(cells) != columns or all(re.fullmatch(r'[:\- ]+', cell) for cell in cells):
            continue
        rows.append(cells)
    return rows[1:] if rows else []


def argument_at(index, angle):
    match = re.match(r'^#### ((?:A[123]|B[1-8])-[A-Z0-9]+)｜(.+)$', lines[index])
    if not match:
        return None
    end = next((i for i in range(index + 1, len(lines)) if re.match(r'^#{2,4} ', lines[i])), len(lines))
    block = lines[index + 1:end]
    glossary_start = next((i for i, line in enumerate(block) if line.startswith('| English（')), None)
    assert glossary_start is not None, f'{match[1]}: glossary table missing'
    description = ' '.join(plain(line) for line in block[:glossary_start]
                           if line.strip() and not line.startswith('**Glossary'))
    glossary = [
        {'english': english, 'chinese': chinese}
        for english, chinese in table_rows(index + 1 + glossary_start, 2)
    ]
    demo_heading = next((re.match(r'^\*\*English linking paragraph · (\d+) words', line)
                         for line in block if line.startswith('**English linking paragraph')), None)
    demo = next((line[2:].strip() for line in block if line.startswith('> ')), None)
    assert demo_heading and demo, f'{match[1]}: English demonstration missing'
    bold_terms = re.findall(r'\*\*(.+?)\*\*', demo)
    word_count = len(demo.replace('**', '').split())
    assert len(glossary) == len(bold_terms) == 5, f'{match[1]}: not exactly five terms'
    assert sorted(term['english'].casefold() for term in glossary) == sorted(term.casefold() for term in bold_terms), f'{match[1]}: highlighted expressions differ from glossary'
    assert 20 <= word_count <= 40 and word_count == int(demo_heading[1]), f'{match[1]}: word count mismatch'
    return {
        'id': match[1], 'title': match[2], 'angle': angle,
        'description': description, 'glossary': glossary, 'englishDemo': demo,
    }


groups = [{'id': f'A{i + 1}', 'question': question, 'angles': [], 'arguments': []}
          for i, question in enumerate(GROUP_TITLES)]
responses = []
current_group = None
current_response = None
angle = ''
sample_label = ''
for index, line in enumerate(lines):
    group_heading = re.match(r'^## [一二三]、Part A｜問題([一二三])', line)
    if group_heading:
        current_group = groups[{'一': 0, '二': 1, '三': 2}[group_heading[1]]]
        current_response = None
        angle = ''
        continue
    if line.startswith('## 四、'):
        current_group = None
    response_heading = re.match(r'^### Question (\d+)\. (.+)$', line)
    if response_heading:
        current_response = {
            'id': f'B{response_heading[1]}', 'question': response_heading[2],
            'angles': [], 'arguments': [], 'samples': [],
        }
        responses.append(current_response)
        angle = ''
        sample_label = ''
        continue
    if line.startswith('## 五、'):
        current_response = None
    if (current_group or current_response) and line.startswith('### 角度｜'):
        angle = line.removeprefix('### 角度｜').strip()
        (current_group or current_response)['angles'].append(angle)
    if current_group or current_response:
        entry = argument_at(index, angle)
        if entry:
            (current_group or current_response)['arguments'].append(entry)
    if current_response and line.startswith('**英文個人回應示範'):
        sample_label = plain(line).rstrip('：')
    elif current_response and line.startswith('**另一種合理回答'):
        sample_label = plain(line).rstrip('：')
    elif current_response and sample_label and line.startswith('> '):
        current_response['samples'].append({'label': sample_label, 'text': line[2:].strip()})
        sample_label = ''

structure_start = next(i for i, line in enumerate(lines) if line.startswith('| # | Sentence structure'))
structures = [
    {'number': int(number), 'english': english, 'purpose': purpose}
    for number, english, purpose in table_rows(structure_start, 3)
]

synonyms = []
category = ''
in_synonyms = False
for line in lines:
    if line.startswith('## 七、'):
        in_synonyms = True
    elif line.startswith('## 八、'):
        in_synonyms = False
    if not in_synonyms:
        continue
    if line.startswith('### '):
        category = line[4:].strip()
    if line.startswith('| **'):
        cells = [cell.strip() for cell in line.strip().strip('|').split('|')]
        if len(cells) == 3:
            synonyms.append({
                'category': category, 'keyword': cells[0].strip('*'), 'chinese': cells[1],
                'alternatives': [item.strip().strip('`') for item in cells[2].split(';')],
            })

data = {
    'id': '2025-subtitles-campus-tv',
    'englishDemoRequired': True,
    'title': '2025 · Young People Love Subtitles; Older People, Not So Much',
    'heroTitle': 'Young people love subtitles; older people, not so much',
    'synonymWarning': '同義詞、近義詞和改寫須按語境使用；subtitles、captions、closed captions、translated subtitles 和 same-language subtitles 並非完全相同。',
    'contextTitle': '閱讀材料與 Campus TV 任務',
    'contextCaveat': '英國受訪者的年齡組數據不代表所有英國人或香港學生；討論中的建議並非學校現行制度。',
    'context': [
        {'place': '閱讀文章 · Young people love subtitles', 'point': '文章介紹字幕的翻譯與無障礙用途，並引用英國兩個年齡組的使用情況；原題未提供調查樣本量與方法。'},
        {'place': 'Part A · Campus TV Team', 'point': '小組須討論是否在校園電視加入英文和中文字幕：好處、學生接受程度，以及哪些節目或字幕安排可能不適合。'},
        {'place': '概念與證據界線', 'point': '字幕受歡迎與有需要不相同；英中同屏和可切換字幕也不同。文中的理論不等於已證實的單一因果結論。'},
    ],
    'groups': groups, 'responses': responses,
    'structures': structures, 'synonyms': synonyms,
}

assert [len(group['arguments']) for group in groups] == [43, 39, 37]
assert len(responses) == 8 and sum(len(item['arguments']) for item in responses) == 65
assert all(section['angles'] and section['question'] for section in groups + responses)
assert all(item['description'] and len(item['glossary']) == 5 and item['englishDemo']
           for section in groups + responses for item in section['arguments'])
assert all(len(section['samples']) == 2 for section in responses)
assert len(structures) == 20 and len(synonyms) == 120
assert all(len(entry['alternatives']) == 5 for entry in synonyms)
DEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{DEST}: {sum(len(s["arguments"]) for s in groups + responses)} arguments with English demonstrations')
