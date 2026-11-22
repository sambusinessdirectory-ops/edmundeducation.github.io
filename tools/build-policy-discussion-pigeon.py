"""Convert the Repulse Bay pigeon policy manuscript without dropping teaching content."""
import json
import re
import sys
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'tools/content-sources/policy-repulse-bay-pigeon-b1-b2.md').read_text()
sections = re.split(r'^## ', source, flags=re.M)
question_match = re.search(r'^> \*\*思考題：\*\*(.+)$', source, re.M)
if not question_match:
    raise ValueError('Missing discussion question')

question = {
    'id': 'q1',
    'text': question_match.group(1).strip(),
    'for_label': '具體政策與管理方案',
    'against_label': '反對意見、限制與執行難題',
    'for': [],
    'against': [],
    'structures': [],
}

argument_section = next(section for section in sections if section.startswith('5.0｜政策類別與數量索引'))
category = ''
for chunk in re.split(r'^(?=### |#### )', argument_section, flags=re.M):
    if chunk.startswith('### '):
        category = chunk.splitlines()[0][4:].strip()
        continue
    if not chunk.startswith('#### '):
        continue
    heading, rest = chunk.split('\n', 1)
    match = re.match(r'#### (\d+)\. (.*)', heading)
    if not match:
        continue
    number = int(match.group(1))
    title = match.group(2)
    description, glossary = re.split(r'\*\*Glossary（B1–B2(?:，5 組)?）\*\*', rest, maxsplit=1)
    rows = [line.strip().strip('|').split('|') for line in glossary.splitlines() if line.startswith('|')]
    pairs = [[cell.strip() for cell in row] for row in rows[2:]]
    if len(pairs) != 5:
        raise ValueError(f'Argument {number} has {len(pairs)} glossary rows')
    side = 'against' if category.startswith('M｜') else 'for'
    question[side].append({
        'id': f'arg:{side}:{number}',
        'number': number,
        'angle': category,
        'title': title,
        'description': description.strip().replace('**', ''),
        'glossary': [
            {'id': f'gloss:{side}:{number}:{index + 1}', 'english': pair[0], 'chinese': pair[1]}
            for index, pair in enumerate(pairs)
        ],
    })

structure_section = next(section for section in sections if section.startswith('7｜20 個 B1–B2 英文討論句式'))
for line in structure_section.splitlines():
    if not re.match(r'^\| \d+ \|', line):
        continue
    number, english, purpose = [cell.strip() for cell in line.strip('|').split('|')]
    question['structures'].append({
        'id': f'structure:{number}',
        'number': int(number),
        'english': english,
        'purpose': purpose,
    })

resources = [{
    'title': '教材概覽與思考題',
    'markdown': '\n'.join(sections[0].splitlines()[2:]).strip(),
}]
for section in sections[1:]:
    if section.startswith(('5｜', '7｜')):
        continue
    title, markdown = section.split('\n', 1)
    resources.append({'title': title, 'markdown': markdown.strip()})

content = {
    'questions': [question],
    'resources': resources,
    'source_document': 'HK_Repulse_Bay_Pigeon_Tourism_Public_Health_Policy_Brainstorm_B1_B2.md',
    'language_level': 'B1–B2',
}

assert len(question['for']) == 139
assert len(question['against']) == 24
assert len(question['structures']) == 20
assert sum(len(argument['glossary']) for side in ('for', 'against') for argument in question[side]) == 815
assert len(re.findall(r'^\| \*\*', next(section for section in sections if section.startswith('8｜')), re.M)) == 59
ids = (
    [argument['id'] for side in ('for', 'against') for argument in question[side]]
    + [entry['id'] for side in ('for', 'against') for argument in question[side] for entry in argument['glossary']]
    + [structure['id'] for structure in question['structures']]
)
assert len(ids) == len(set(ids))

target = Path(sys.argv[1] if len(sys.argv) > 1 else Path(tempfile.gettempdir()) / 'policy-discussion-pigeon-content.json')
target.write_text(json.dumps(content, ensure_ascii=False, indent=2))
print('Verified: 139 proposals, 24 objections, 815 glossary pairs, 20 structures, 59 vocabulary groups; all supplementary sections included.')
