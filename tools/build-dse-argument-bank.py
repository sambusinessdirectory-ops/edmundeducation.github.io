#!/usr/bin/env python3
"""Extract the complete DSE speaking bank into reviewable site data."""
import json
import re
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / 'dse-argument-bank' / 'source.md'
DEST = Path(__file__).resolve().parents[1] / 'dse-argument-bank' / 'data.json'
lines = SOURCE.read_text(encoding='utf-8').splitlines()

GROUP_TITLES = [
    'Why people might not like others taking photos in public places.',
    'Places in Hong Kong that are popular for taking photos.',
    'Whether Hong Kong needs to have rules for photo-taking in public places.',
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
    'id': '2025-1-2-photo-taking-visitors',
    'title': '2025 1.2 Photo-taking visitors not welcomed by everyone',
    'heroTitle': 'Photo-taking visitors not welcomed by everyone',
    'synonymWarning': '用詞須按句意、搭配和語域選擇；例如 rules、guidelines、laws 的效力不同，take a photo 與 publish an image 也不是同一動作。',
    'context': [
        {'place': 'Vermont, USA', 'point': '秋季賞葉遊客在住宅附近泊車、損壞財物及與居民爭執；道路封閉凸顯景點吸引力與社區承載力的衝突。'},
        {'place': 'Mount Fuji, Japan', 'point': '富士山附近小鎮因拍照遊客亂拋垃圾、泊車不當及不守規則，在 2024 年 5 月設置遮擋景觀的牆。'},
        {'place': 'Berlin, Germany', 'point': '餐廳 N&S 要求訪客不拍照或拍片，以照顧其他食客私隱及用餐體驗。'},
    ],
    'groups': groups,
    'responses': responses,
    'structures': structures,
    'synonyms': synonyms,
}
assert [len(x['arguments']) for x in groups] == [41, 35, 48]
assert len(responses) == 8 and sum(len(x['arguments']) for x in responses) == 41
assert all(len(a['glossary']) == 5 for section in groups + responses for a in section['arguments'])
assert len(structures) == 20 and len(synonyms) == 64
assert all(len(s['alternatives']) == 5 for s in synonyms)
DEST.parent.mkdir(exist_ok=True)
DEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{DEST}: {sum(map(lambda s: len(s["arguments"]), groups + responses))} arguments, {len(synonyms)} synonym groups')
