#!/usr/bin/env python3
"""Extract the supplied Super Mario speaking bank without rewriting its teaching content."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'dse-argument-bank'
SOURCE = ROOT / 'mario-source.md'
DEST = ROOT / 'mario-data.json'
lines = SOURCE.read_text(encoding='utf-8').splitlines()

GROUP_TITLES = [
    'Why people still play classic games like Super Mario Bros.',
    'What makes a video game popular for a long time',
    'What video games will be like in the future',
]


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
    entry = {'id': match[1], 'title': match[2], 'angle': angle, 'description': '', 'glossary': []}
    cursor = index + 1
    prose = []
    while cursor < len(lines) and not lines[cursor].startswith('| English') and not re.match(r'^#{2,4} ', lines[cursor]):
        if lines[cursor].strip() and lines[cursor].strip() != '---':
            prose.append(lines[cursor].strip())
        cursor += 1
    entry['description'] = ' '.join(prose)
    if cursor < len(lines) and lines[cursor].startswith('| English'):
        entry['glossary'] = [
            {'english': english, 'chinese': chinese}
            for english, chinese in table_rows(cursor, 2)
        ]
    return entry


groups = [{'id': f'A{i + 1}', 'question': question, 'angles': [], 'arguments': []}
          for i, question in enumerate(GROUP_TITLES)]
responses = []
current_group = None
current_response = None
angle = ''
sample_label = '示範回應'
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
        sample_label = '示範回應'
        continue
    if line.startswith('## 六、'):
        current_response = None
    if current_group and line.startswith('### 角度：'):
        angle = line.removeprefix('### 角度：').strip()
        current_group['angles'].append(angle)
    elif current_response and line.startswith('**角度：'):
        angle = line.removeprefix('**角度：').removesuffix('**').strip()
        current_response['angles'].append(angle)
    if current_group or current_response:
        entry = argument_at(index, angle)
        if entry:
            (current_group or current_response)['arguments'].append(entry)
    if current_response and line.startswith('**') and ('示範' in line or '另一種合理立場' in line):
        sample_label = line.strip('*：')
    if current_response and line.startswith('> ') and not line.startswith('> **'):
        current_response['samples'].append({'label': sample_label, 'text': line[2:].strip()})

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
                'category': category, 'keyword': cells[0].strip('*'),
                'chinese': cells[1],
                'alternatives': [item.strip().strip('`') for item in cells[2].split(';')],
            })

data = {
    'id': '2025-why-was-super-mario-a-plumber',
    'title': '2025 · Why Was Super Mario a Plumber?',
    'heroTitle': 'Why was Super Mario a plumber?',
    'synonymWarning': '同義詞、近義詞與改寫方式須按語境、詞性和具體遊戲類型選用；augmented reality 與 virtual reality 不能互換，platform game 亦不一定是 side-scrolling。',
    'contextTitle': '閱讀材料與班級專題',
    'contextCaveat': '未來技術均以可能性討論；班級專題、展示活動與英文個人回應是教學示例，不是試題已規定或學生已經歷的事。',
    'context': [
        {'place': '閱讀文章 · Why was Super Mario a plumber?', 'point': '材料以 1985 年《Super Mario Bros.》為背景，談 Mario 的普通水管工形象、當年的像素限制，以及冒險式玩法。'},
        {'place': 'Part A · 班級專題', 'point': '小組要討論人們為何仍玩經典遊戲、遊戲長期受歡迎的原因，以及未來電子遊戲可能如何發展。'},
        {'place': '資料與推論界線', 'point': '文章背景、可辯論觀點與未來假設須分開；試題截圖未展示的產品或發行細節不應自行補上。'},
    ],
    'groups': groups, 'responses': responses,
    'structures': structures, 'synonyms': synonyms,
}

assert [len(group['arguments']) for group in groups] == [38, 45, 45]
assert len(responses) == 8 and sum(len(item['arguments']) for item in responses) == 82
assert all(section['angles'] and section['question'] for section in groups + responses)
assert all(item['description'] and len(item['glossary']) == 5
           for section in groups + responses for item in section['arguments'])
assert all(section['samples'] for section in responses)
assert len(structures) == 20 and len(synonyms) == 120
assert all(len(entry['alternatives']) == 5 for entry in synonyms)
DEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{DEST}: {sum(len(s["arguments"]) for s in groups + responses)} arguments, {len(synonyms)} synonym groups')
