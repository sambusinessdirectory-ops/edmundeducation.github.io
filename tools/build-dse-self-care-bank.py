#!/usr/bin/env python3
"""Extract the supplied self-care speaking bank without rewriting its teaching content."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'dse-argument-bank'
SOURCE = ROOT / 'self-care-source.md'
DEST = ROOT / 'self-care-data.json'
lines = SOURCE.read_text(encoding='utf-8').splitlines()

GROUP_TITLES = [
    'Whether Hong Kong students are aware of the importance of self-care.',
    'Activities to organise during the Self-Care Month.',
    'Ways to encourage students to take part in self-care activities.',
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

plan_start = next(i for i, line in enumerate(lines) if line.startswith('| 星期 | 主題 |'))
study_plan = [
    {'week': week, 'theme': theme, 'activity': activity, 'participation': participation, 'care': care}
    for week, theme, activity, participation, care in table_rows(plan_start, 5)
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
    'id': '2025-the-art-of-self-care',
    'title': '2025 · The Art of Self-Care',
    'heroTitle': 'The art of self-care',
    'synonymWarning': '替代表達須按語境、語域和文法選用；self-care 不等於購物，日常壓力不等於臨床診斷，朋友聊天亦不等於專業輔導。',
    'contextTitle': '閱讀材料與校園任務',
    'contextCaveat': '活動與方案屬供考試討論的建議，並非試題已安排的措施。個人回應應按真實經驗修改；持續或嚴重困擾應尋求合適的專業支援。',
    'context': [
        {'place': '閱讀文章 · The art of self-care', 'point': '文章將自我照顧連繫身體及精神健康，提到運動、睡眠和飲食，並以習慣配對作為一種可能方法。'},
        {'place': 'Part A · 學校籌備委員會', 'point': '學生要為校內 Self-Care Month 討論健康意識、可舉辦的活動，以及鼓勵同學參與的方法。'},
        {'place': '概念界線', 'point': '知道健康重要未必做得到；活動安排與參與方法應分開討論，並顧及自願參與、私隱、安全及不同學生的需要。'},
    ],
    'groups': groups, 'responses': responses,
    'structures': structures, 'synonyms': synonyms, 'studyPlan': study_plan,
}

assert [len(group['arguments']) for group in groups] == [45, 45, 43]
assert len(responses) == 8 and sum(len(item['arguments']) for item in responses) == 73
assert all(section['angles'] and section['question'] for section in groups + responses)
assert all(item['description'] and len(item['glossary']) == 5
           for section in groups + responses for item in section['arguments'])
assert all(section['samples'] for section in responses)
assert len(structures) == 20 and len(synonyms) == 120
assert len(study_plan) == 4
assert all(len(entry['alternatives']) == 5 for entry in synonyms)
DEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{DEST}: {sum(len(s["arguments"]) for s in groups + responses)} arguments, {len(synonyms)} synonym groups')
