#!/usr/bin/env python3
"""Correct PDF exercises embedded under broader numbered sections."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
# (question ID, existing MCQ sense ID or None, source-defined meaning if new)
CASES={
 'crowd': [('crowd-10-2','crowd-mcq-17',None),
           ('crowd-10-3',None,'大型群眾在某情況下的行為及反應'),
           ('crowd-10-4','crowd-mcq-18',None),('crowd-10-5','crowd-mcq-18',None),
           ('crowd-10-6','crowd-mcq-19',None),('crowd-10-7','crowd-mcq-20',None)],
 'incorporate': [('incorporate-49-0','incorporate-mcq-33',None),
                 ('incorporate-66-0','incorporate-mcq-42',None)],
 'rehearse': [('rehearse-43-0','rehearse-mcq-34',None),
              ('rehearse-43-1','rehearse-mcq-34',None),
              ('rehearse-121-0',None,'為日後真實活動而做的練習或預演')],
 'spirit': [('spirit-15-16','spirit-mcq-22',None),
            ('spirit-15-17','spirit-mcq-22',None)],
 'store': [('store-78-0','store-mcq-70',None),
           ('store-78-1','store-mcq-24',None),
           ('store-84-0','store-mcq-76',None)],
 'text': [('text-05-0','text-mcq-02',None)],
}

def main():
    patches=[]
    for mid,cases in CASES.items():
        path=ROOT/'polysemy-lab/content'/f'{mid}.mjs';m=json.loads(path.read_text()[15:-2])
        smap={s['id']:s for s in m['senses']};qmap={q['id']:q for q in m['questions']}
        old_count=len(m['senses']);new_senses=[];changes=[]
        for qid,existing,title in cases:
            q=qmap[qid];old=q['correctOption'];old_options=list(q['options'])
            if title:
                sid=f'{mid}-pdf-orphan-01'
                if sid not in smap:
                    sense={'id':sid,'title':title,'form':f'PDF practice {q["sourcePractice"]}',
                           'en':f'PDF practice {q["sourcePractice"]}','zh':title,
                           'note':f'原始 PDF 練習 {q["sourcePractice"]}：{title}',
                           'examples':[],'options':[],'excludedOverlaps':[]}
                    smap[sid]=sense;new_senses.append(sense)
                q['options']=[sid if x==old else x for x in old_options]
            else:
                sid=existing;title=smap[sid]['title']
                ref=next((x for x in m['questions'] if x['id']!=qid and x.get('correctOption')==sid),None)
                if ref:q['options']=list(ref['options'])
                else:q['options']=[sid if x==old else x for x in old_options]
            unique=[]
            for option in [sid,*q['options'],*[s['id'] for s in m['senses']]]:
                if option not in unique:unique.append(option)
                if len(unique)==len(old_options):break
            q['options']=unique
            smap[old]['examples']=[e for e in smap[old].get('examples',[])
                                   if not(e and e[0]==q['en'] and len(e)>1 and e[1]==q['zh'])]
            smap[sid]['examples'].append([q['en'],q['zh'],title])
            q['sense']=sid;q['correctOption']=sid
            target=q['targets'][0] if q.get('targets') else m['word']
            q['explanation']=f'本句的「{target}」指「{title}」。'
            q['optionReasons']={x:(f'本句指「{title}」。' if x==sid else
                                   f'「{smap[x]["title"]}」與本句語境不同。') for x in q['options']}
            changes.append({'question':qid,'sourceSection':int(qid[len(mid)+1:].split('-')[0]),
                            'sourceMeaning':title,'oldSense':old,'newSense':sid,
                            'oldOptions':old_options,'newOptions':list(q['options'])})
        m['senses'].extend(new_senses)
        path.write_text('export default '+json.dumps(m,ensure_ascii=False,indent=2)+';\n')
        patches.append({'module':mid,'number':m['number'],'oldSenseCount':old_count,
                        'newSenses':new_senses,'changes':changes})
    index=[]
    for path in (ROOT/'polysemy-lab/content').glob('*.mjs'):
        m=json.loads(path.read_text()[15:-2])
        if m.get('mass'):
            index.append({'id':m['id'],'word':m['word'],'number':m['number'],'mass':True,
                          'senses':[{'id':s['id']} for s in m['senses']],
                          'questions':[{'id':q['id'],'sense':q['sense'],
                                        'correctOption':q.get('correctOption'),'en':q['en']}
                                       for q in m['questions']]})
    index.sort(key=lambda m:(m['number'],m['id']))
    (ROOT/'polysemy-lab/mass-index.mjs').write_text(
        'export default '+json.dumps(index,ensure_ascii=False,separators=(',',':'))+';\n')
    (ROOT/'polysemy-lab/PDF-ORPHAN-ANSWER-REVIEW.json').write_text(
        json.dumps({'patches':patches},ensure_ascii=False,indent=2)+'\n')
    print({'modules':len(patches),'questions':sum(len(p['changes']) for p in patches)})

if __name__=='__main__':main()
