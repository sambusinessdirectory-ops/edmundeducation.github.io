"""Convert the supplied policy discussion manuscript, preserving all teaching content."""
import json,re,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=(root/'tools/content-sources/policy-construction-safety-b1-b2.md').read_text()
question=source.splitlines()[0].removeprefix('# ').strip()
sections=re.split(r'^## ',source,flags=re.M)
q={'id':'q1','text':question,'for_label':'具體政策與管理方案','against_label':'反對意見、限制與執行難題','for':[],'against':[],'structures':[]}
body=next(s for s in sections if s.startswith('二、'))
category=''
for chunk in re.split(r'^(?=### |#### )',body,flags=re.M):
 if chunk.startswith('### '):category=chunk.splitlines()[0][4:].strip();continue
 if not chunk.startswith('#### '):continue
 heading,rest=chunk.split('\n',1)
 m=re.match(r'#### (\d+)\. (.*)',heading);number=int(m[1]);title=m[2]
 description,gloss=rest.split('**Glossary（B1–B2）**',1)
 rows=[line.strip().strip('|').split('|') for line in gloss.splitlines() if line.startswith('|')]
 pairs=[[x.strip() for x in row] for row in rows[2:]]
 assert len(pairs)==5,(number,pairs)
 side='against' if category.startswith('M｜') else 'for'
 q[side].append({'id':f'arg:{side}:{number}','number':number,'angle':category,'title':title,'description':description.strip().replace('**',''),'glossary':[{'id':f'gloss:{side}:{number}:{i+1}','english':p[0],'chinese':p[1]} for i,p in enumerate(pairs)]})
structures=next(s for s in sections if s.startswith('六、'))
for line in structures.splitlines():
 if not re.match(r'^\| \d+ \|',line):continue
 number,english,purpose=[x.strip() for x in line.strip('|').split('|')]
 q['structures'].append({'id':f'structure:{number}','number':int(number),'english':english,'purpose':purpose})
resources=[{'title':'教材概覽與優先討論方案','markdown':'\n'.join(sections[0].splitlines()[2:]).strip()}]
for section in sections[1:]:
 if section.startswith(('二、','六、')):continue
 title,markdown=section.split('\n',1);resources.append({'title':title,'markdown':markdown.strip()})
content={'questions':[q],'resources':resources,'source_document':'HK_Construction_Site_Safety_and_Progress_Policy_Brainstorm_B1_B2.md','language_level':'B1–B2'}
assert len(q['for'])==141 and len(q['against'])==25 and len(q['structures'])==20
assert sum(len(a['glossary']) for side in ['for','against'] for a in q[side])==830
assert len(re.findall(r'^\| \*\*',next(s for s in sections if s.startswith('七、')),re.M))==42
ids=[a['id'] for side in ['for','against'] for a in q[side]]+[g['id'] for side in ['for','against'] for a in q[side] for g in a['glossary']]+[s['id'] for s in q['structures']]
assert len(ids)==len(set(ids))
target=Path(sys.argv[1] if len(sys.argv)>1 else '/private/tmp/policy-discussion-content.json')
target.write_text(json.dumps(content,ensure_ascii=False,indent=2))
print('Verified: 141 proposals, 25 objections, 830 glossary pairs, 20 structures, 42 vocabulary groups; all supplementary sections included.')
