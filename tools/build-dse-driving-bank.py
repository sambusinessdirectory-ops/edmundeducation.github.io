#!/usr/bin/env python3
"""Extract the learning-to-drive DSE speaking bank into reviewable site data."""
import json
import re
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / 'dse-argument-bank' / 'driving-source.md'
DEST = Path(__file__).resolve().parents[1] / 'dse-argument-bank' / 'driving-data.json'
lines = SOURCE.read_text(encoding='utf-8').splitlines()

GROUP_TITLES = [
    'The benefits and challenges of being a driver in Hong Kong.',
    'Whether Hong Kong is a car-friendly city.',
    'Reasons why so few teenagers learn to drive in Hong Kong.',
]

def table_rows(start, columns):
    rows = []
    for line in lines[start:]:
        if not line.startswith('|'):
            break
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) != columns or all(re.fullmatch(r'[:\- ]+', c) for c in cells):
            continue
        rows.append(cells)
    return rows[1:] if rows and rows[0][0].lower().startswith(('english', '#', 'thematic')) else rows

def entry_at(i, angle):
    match = re.match(r'^#### ((?:A[123]|B[1-8])-[A-Z0-9]+)｜(.+)$', lines[i])
    if not match:
        return None
    entry = {'id': match[1], 'title': match[2], 'angle': angle, 'description': '', 'glossary': []}
    j = i + 1
    prose = []
    while j < len(lines) and not lines[j].startswith('| English') and not re.match(r'^#{2,4} ', lines[j]):
        if lines[j].strip() and lines[j].strip() != '---':
            prose.append(lines[j].strip())
        j += 1
    entry['description'] = ' '.join(prose)
    if j < len(lines) and lines[j].startswith('| English'):
        for row in table_rows(j, 2):
            if row[0] != 'English（自然單字／詞組）':
                entry['glossary'].append({'english': row[0], 'chinese': row[1]})
    return entry

groups = [{'id': f'A{i+1}', 'question': GROUP_TITLES[i], 'angles': [], 'arguments': []} for i in range(3)]
responses = []
current_group = None
current_response = None
angle = ''
last_demo_label = '示範回應'
for i, line in enumerate(lines):
    a = re.match(r'^## [一二三]、Part A｜問題([一二三])', line)
    if a:
        current_group = groups[{'一':0, '二':1, '三':2}[a[1]]]
        current_response = None
        angle = ''
        continue
    if line.startswith('## 四、Part B'):
        current_group = None
        continue
    b = re.match(r'^### Question (\d+)\. (.+)$', line)
    if b:
        current_response = {'id': f'B{b[1]}', 'question': b[2], 'angles': [], 'arguments': [], 'samples': []}
        responses.append(current_response)
        angle = ''
        last_demo_label = '示範回應'
        continue
    if line.startswith('## 五、'):
        current_response = None
    if current_group and line.startswith('### 角度：'):
        angle = line.removeprefix('### 角度：').strip()
        current_group['angles'].append(angle)
    elif current_response and line.startswith('**角度：'):
        angle = line.removeprefix('**角度：').removesuffix('**').strip()
        current_response['angles'].append(angle)
    if current_group or current_response:
        entry = entry_at(i, angle)
        if entry:
            (current_group or current_response)['arguments'].append(entry)
    if current_response and line.startswith('**') and ('示範' in line or '如果真實答案' in line):
        last_demo_label = line.strip('*：')
    if current_response and line.startswith('> ') and not line.startswith('> **'):
        current_response['samples'].append({'label': last_demo_label, 'text': line[2:].strip()})

structure_start = next(i for i, line in enumerate(lines) if line.startswith('| # | English sentence structure'))
structures = [{'number': int(r[0]), 'english': r[1], 'purpose': r[2]} for r in table_rows(structure_start, 3)]

synonyms = []
category = ''
in_synonyms = False
for i, line in enumerate(lines):
    if line.startswith('## 六、'):
        in_synonyms = True
    elif line.startswith('## 七、'):
        in_synonyms = False
    if not in_synonyms:
        continue
    if line.startswith('### '):
        category = line[4:].strip()
    if line.startswith('| **'):
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) != 3:
            continue
        alternatives = [x.strip().strip('`') for x in cells[2].split(';')]
        synonyms.append({'category': category, 'keyword': cells[0].strip('*'), 'chinese': cells[1], 'alternatives': alternatives})

data = {
    'id': '2025-learning-to-drive-in-hong-kong',
    'title': '2025 · Learning to Drive in Hong Kong',
    'heroTitle': 'American teenagers today are driving less than their parents did',
    'synonymWarning': '近義詞須按語境選用；driving licence 不等於 learner’s licence，學車不等於擁車，交通擠塞也不等於交通意外。',
    'contextTitle': '題目與香港討論界線',
    'contextCaveat': '試題中的美國百分比不能當作香港青少年持牌比例；學車、擁車與經常駕車是三個不同決定。政策方案屬課堂討論，並非已實施措施。',
    'context': [
        {'place': '閱讀材料 · 美國', 'point': '文章說美國青少年持牌比例較 1995 年低，並提出費用、城市環境與網上生活等可能原因；其數字只屬試題材料所述時點。'},
        {'place': '香港 · 核心問題', 'point': '討論在香港學車是否值得：比較技能與出行自由、學車與擁車成本、公共交通及道路安全。'},
        {'place': '概念區分', 'point': '值得學車不等於值得立即買車，也不等於每天自己駕車；未滿十八歲與符合考牌資格的青少年亦須區分。'},
    ],
    'groups': groups,
    'responses': responses,
    'structures': structures,
    'synonyms': synonyms,
}
assert [len(x['arguments']) for x in groups] == [45, 41, 42]
assert len(responses) == 8 and sum(len(x['arguments']) for x in responses) == 67
assert all(len(a['glossary']) == 5 for section in groups + responses for a in section['arguments'])
assert len(structures) == 20 and len(synonyms) == 101
assert all(len(s['alternatives']) == 5 for s in synonyms)
DEST.parent.mkdir(exist_ok=True)
DEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{DEST}: {sum(map(lambda s: len(s["arguments"]), groups + responses))} arguments, {len(synonyms)} synonym groups')
