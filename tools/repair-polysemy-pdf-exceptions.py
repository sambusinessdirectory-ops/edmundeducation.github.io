#!/usr/bin/env python3
"""Reviewed exceptions whose PDF layout has multiple nearby definitions."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CASES={
 'bear': [('bear-10-3','bear-mcq-04',None),('bear-10-4','bear-mcq-02',None)],
 'big': [('big-40-0',None,'諷刺地表示某事沒甚麼了不起'),
         ('big-40-1',None,'諷刺地表示某事沒甚麼了不起')],
 'draw': [('draw-31-0',None,'畫圖的人'),('draw-31-1',None,'畫圖的人')],
 'handle': [('handle-40-0',None,'電腦系統中負責回應／處理特定事件、錯誤或資料的程式元件'),
            ('handle-40-1',None,'電腦系統中負責回應／處理特定事件、錯誤或資料的程式元件')],
 'mind': [('mind-45-0',None,'有主見或意志堅定的'),('mind-45-1',None,'有主見或意志堅定的')],
 'mother': [('mother-29-0',None,'動物的雌性親代'),('mother-29-1',None,'動物的雌性親代')],
 'script': [('script-27-0',None,'按照預先規定的文字／步驟進行'),
            ('script-27-1',None,'按照預先規定的文字／步驟進行')],
}

def main():
    patches=[]
    for mid,cases in CASES.items():
        path=ROOT/'polysemy-lab/content'/f'{mid}.mjs'
        module=json.loads(path.read_text()[15:-2]);qmap={q['id']:q for q in module['questions']}
        smap={s['id']:s for s in module['senses']};old_count=len(module['senses'])
        new_senses=[];changes=[]
        for qid,existing,title in cases:
            q=qmap[qid];old=q['correctOption'];old_options=list(q['options'])
            if title:
                sid=f'{mid}-pdf-reviewed-01'
                if sid not in smap:
                    sense={'id':sid,'title':title,'form':f'PDF practice {q["sourcePractice"]}',
                           'en':f'PDF practice {q["sourcePractice"]}','zh':title,
                           'note':f'原始 PDF 練習 {q["sourcePractice"]}：{title}',
                           'examples':[],'options':[],'excludedOverlaps':[]}
                    smap[sid]=sense;new_senses.append(sense)
                q['options']=[sid if x==old else x for x in q['options']]
            else:
                sid=existing;title=smap[sid]['title']
                reference=next(x for x in module['questions'] if x['id']!=qid and x.get('correctOption')==sid)
                q['options']=list(reference['options'])
            smap[old]['examples']=[e for e in smap[old].get('examples',[])
                                    if not(e and e[0]==q['en'] and len(e)>1 and e[1]==q['zh'])]
            smap[sid]['examples'].append([q['en'],q['zh'],title])
            q['sense']=sid;q['correctOption']=sid
            word=q['targets'][0] if q.get('targets') else module['word']
            q['explanation']=f'本句的「{word}」指「{title}」。'
            q['optionReasons']={x:(f'本句指「{title}」。' if x==sid else
                                  f'「{smap[x]["title"]}」與本句語境不同。') for x in q['options']}
            changes.append({'question':qid,'sourceSection':int(qid[len(mid)+1:].split('-')[0]),
                            'sourceMeaning':title,'oldSense':old,'newSense':sid,
                            'oldAnswerMissing':mid in ('bear','handle','mind','mother'),
                            'oldOptions':old_options,'newOptions':list(q['options'])})
        module['senses'].extend(new_senses)
        path.write_text('export default '+json.dumps(module,ensure_ascii=False,indent=2)+';\n')
        patches.append({'module':mid,'number':module['number'],'oldSenseCount':old_count,
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
    (ROOT/'polysemy-lab/PDF-ANSWER-EXCEPTIONS.json').write_text(
        json.dumps({'patches':patches},ensure_ascii=False,indent=2)+'\n')
    print({'modules':len(patches),'questions':sum(len(p['changes']) for p in patches)})

if __name__=='__main__':main()
