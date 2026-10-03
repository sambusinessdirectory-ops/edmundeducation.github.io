#!/usr/bin/env python3
"""Reviewed answer corrections for source PDFs with plain-text section headings."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
# Each meaning was checked against the corresponding numbered PDF section and
# its exercise sentences. Keys are source section numbers, not table positions.
CASES={
 'assessment':{50:'自我評估；自行評估自己的作品、表現或能力'},
 'crowd':{5:'聚集於某處；擠滿某個地方'},
 'diary':{55:'記錄未來約會及安排的行事曆／日程表'},
 'entry':{61:'供人或事物進入的入口點',64:'程式開始執行的入口點',
          65:'攻擊者得以進入系統的入侵入口點'},
 'exhaust':{22:'完整無遺漏、全面涵蓋所有相關項目的'},
 'generate':{76:'產生或生成某種事物的過程',80:'出生於相近時期的一代人；世代',
             91:'家族中的一代',103:'生成元'},
 'home':{15:'在某處感到自在、熟悉或有歸屬感',17:'像家一樣舒服的地方',
         19:'擁有自己的住宅；置業'},
 'incorporate':{59:'公司或組織依法註冊成立為法人實體'},
 'instruction':{140:'由電腦處理器執行的指令；機器指令'},
 'reduce':{82:'烹調時收濃的汁液；濃縮汁',83:'化學反應中的還原',
           99:'原圖的縮小版本；縮印',101:'減價；折扣'},
 'rehearse':{123:'為保持記憶而反覆默念或複誦',138:'再次重述、詳述或列舉'},
 'return':{61:'來回票；往返車票',64:'投資所得的回報或收益'},
 'work':{7:'從事某個行業或專業領域的工作'},
}

def main():
    patches=[]
    for mid,sections in CASES.items():
        path=ROOT/'polysemy-lab/content'/f'{mid}.mjs'
        m=json.loads(path.read_text()[15:-2]);old_count=len(m['senses'])
        smap={s['id']:s for s in m['senses']};new_senses=[];changes=[]
        for section,title in sections.items():
            prefix=f'{mid}-{section:02d}-'
            chosen=[q for q in m['questions'] if q['id'].startswith(prefix)]
            if not chosen:raise ValueError(f'Missing source section {prefix}')
            sid=f'{mid}-pdf-plain-{section:03d}'
            if sid in smap:raise ValueError(f'Duplicate sense {sid}')
            s={'id':sid,'title':title,'form':f'PDF section {section}',
               'en':f'PDF section {section}','zh':title,
               'note':f'原始 PDF 第 {section} 節：{title}',
               'examples':[],'options':[],'excludedOverlaps':[]}
            smap[sid]=s;new_senses.append(s)
            for q in chosen:
                old=q['correctOption'];old_options=list(q['options'])
                if old not in old_options:raise ValueError(q['id'])
                smap[old]['examples']=[e for e in smap[old].get('examples',[])
                                       if not(e and e[0]==q['en'] and len(e)>1 and e[1]==q['zh'])]
                s['examples'].append([q['en'],q['zh'],title])
                q['sense']=sid;q['correctOption']=sid
                q['options']=[sid if x==old else x for x in old_options]
                target=q['targets'][0] if q.get('targets') else m['word']
                q['explanation']=f'本句的「{target}」指「{title}」。'
                q['optionReasons']={x:(f'本句指「{title}」。' if x==sid else
                                       f'「{smap[x]["title"]}」與本句語境不同。') for x in q['options']}
                changes.append({'question':q['id'],'sourceSection':section,
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
    (ROOT/'polysemy-lab/PDF-PLAIN-ANSWER-REVIEW.json').write_text(
        json.dumps({'patches':patches},ensure_ascii=False,indent=2)+'\n')
    print({'modules':len(patches),'questions':sum(len(p['changes']) for p in patches)})

if __name__=='__main__':main()
