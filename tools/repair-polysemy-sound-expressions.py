#!/usr/bin/env python3
"""Restore the two figurative sound-of-that meanings from the sound PDF."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'polysemy-lab/content/sound.mjs'
m=json.loads(path.read_text()[15:-2]);old_count=len(m['senses'])
rows=[('sound-pdf-like-sound','like the sound of something',
       '聽到構思、安排或提議後，覺得它吸引並產生好感'),
      ('sound-pdf-not-like-sound','not like the sound of something',
       '聽到消息或情況後，覺得它不妙、令人擔心或不吸引')]
new=[]
for sid,form,title in rows:
    new.append({'id':sid,'title':title,'form':form,'en':form,'zh':title,
                'note':f'原始 PDF 用法：{title}','examples':[],
                'options':[],'excludedOverlaps':[]})
smap={s['id']:s for s in m['senses']};smap.update({s['id']:s for s in new})
changes=[]
for q in m['questions']:
    if q['id'] not in ('sound-16-0','sound-16-1','sound-16-2','sound-16-3'):continue
    sid=new[0 if q['id'].endswith(('-0','-1')) else 1]['id']
    old=q['correctOption'];old_options=list(q['options']);title=smap[sid]['title']
    smap[old]['examples']=[e for e in smap[old].get('examples',[])
                           if not(e and e[0]==q['en'] and len(e)>1 and e[1]==q['zh'])]
    smap[sid]['examples'].append([q['en'],q['zh'],title])
    q['sense']=sid;q['correctOption']=sid
    q['options']=[sid if x==old else x for x in old_options]
    target=q['targets'][0] if q.get('targets') else m['word']
    q['explanation']=f'本句的「{target}」指「{title}」。'
    q['optionReasons']={x:(f'本句指「{title}」。' if x==sid else
                           f'「{smap[x]["title"]}」與本句語境不同。') for x in q['options']}
    changes.append({'question':q['id'],'sourceSection':16,'sourceMeaning':title,
                    'oldSense':old,'newSense':sid,
                    'oldOptions':old_options,'newOptions':list(q['options'])})
m['senses'].extend(new)
path.write_text('export default '+json.dumps(m,ensure_ascii=False,indent=2)+';\n')
(ROOT/'polysemy-lab/PDF-SOUND-ANSWER-REVIEW.json').write_text(
    json.dumps({'patches':[{'module':'sound','number':m['number'],'oldSenseCount':old_count,
                            'newSenses':new,'changes':changes}]},ensure_ascii=False,indent=2)+'\n')
print({'questions':len(changes),'meanings':len(new)})
