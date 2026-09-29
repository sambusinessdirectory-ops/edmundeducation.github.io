#!/usr/bin/env python3
"""Regenerate published polysemy choices from MCQ-ready PDF source tables.

PDF content is treated as lesson data. Use --write to replace lesson files.
"""
import json
import re
import argparse
import subprocess
from bisect import bisect_right
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXT = Path('/private/tmp/polysemy-manual-text')
SOURCE_REVISION = 'c63457e49'  # Last published import before the MCQ repair.
PDT = Path('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
HEAD = re.compile(r'(?im)^\s*(?:#{1,3}\s*)?(?:Master comparison|MCQ-ready master list)\s*$')
END = re.compile(r'(?im)^\s*(?:#{1,3}\s*)?(?:For your original|For the original|Passage recap|Your original|Original passage|Meaning map|Final recap)\b')
HAN = re.compile(r'[\u3400-\u9fff]')


def source_text(module_id):
    cached=TEXT/(module_id+'.txt')
    if cached.exists():return cached.read_text()
    pdf=ROOT/'polysemy-lab/manuals'/f'{module_id}.pdf'
    return subprocess.check_output([str(PDT),'-raw',str(pdf),'-'],text=True)


def clean(s):
    s = re.sub(r'\*\*|`|\u200b|\u2060', '', s)
    return re.sub(r'\s+', ' ', s).strip(' |\n\t')


def table(text):
    matches = list(HEAD.finditer(text))
    if not matches:
        return []
    part = text[matches[-1].end():]
    end = END.search(part)
    if end:
        part = part[:end.start()]
    rows = []
    pending = ''
    for raw in part.splitlines():
        line = clean(raw.replace('\f', ''))
        if rows and (re.match(r'^#{1,3}\s',raw.strip()) or raw.strip()=='---'):
            break
        if not line or line.startswith(('#', '---')) or line.lower().startswith(('form /', 'form |', 'form ', 'mcq-ready', '| ---', '--- |')):
            continue
        if raw.lstrip().startswith('|'):
            cells = [clean(x) for x in raw.strip().strip('|').split('|')]
            if len(cells) >= 2 and HAN.search(cells[1]):
                rows.append([cells[0], cells[1]])
            elif rows and len(cells) <= 2 and HAN.search(raw):
                rows[-1][1] += clean(raw)
            continue
        first = HAN.search(line)
        if first and first.start() >= 2:
            en = clean(pending+' '+line[:first.start()])
            zh = clean(line[first.start():])
            if en and zh:
                rows.append([en, zh])
            pending = ''
        elif pending and HAN.search(line):
            rows.append([clean(pending),clean(line)])
            pending = ''
        elif rows and HAN.search(line):
            rows[-1][1] += clean(line)
        elif not HAN.search(line) and not line.startswith(('|','---')):
            pending = (pending+' '+line).strip()
    return [(a, b.strip('| ')) for a,b in rows if a and len(b) >= 2]


def words(s):
    s = clean(s).lower().split('（')[0]
    s = s.replace('=', ' ').replace('—', ' ').replace('–', ' ')
    return re.findall(r'[a-z]+', s)


def similarity(a,b):
    aa,bb=words(a),words(b)
    if not aa or not bb:return 0
    sa,sb=set(aa),set(bb)
    sequence=SequenceMatcher(None,' '.join(aa),' '.join(bb)).ratio()
    overlap=len(sa&sb)/max(1,len(sa|sb))
    return .65*sequence+.35*overlap


def chinese_similarity(a,b):
    a=''.join(HAN.findall(a));b=''.join(HAN.findall(b))
    if not a or not b:return 0
    grams=lambda s:set(s[i:i+2] for i in range(len(s)-1)) or {s}
    x,y=grams(a),grams(b)
    return .45*SequenceMatcher(None,a,b).ratio()+.55*len(x&y)/max(1,len(x|y))


def align(senses,rows):
    """Monotone table alignment: consecutive source sections may share one MCQ meaning."""
    if not rows:return []
    n,m=len(senses),len(rows)
    scores=[]
    for i,s in enumerate(senses):
        row=[]
        for j,(form,zh) in enumerate(rows):
            f=similarity(s['form'],form)
            z=chinese_similarity(s['title'],zh)
            pos=1-abs(i/max(1,n-1)-j/max(1,m-1))
            row.append(.58*f+.34*z+.08*pos)
        scores.append(row)
    dp=[[-1e9]*m for _ in range(n)];prev=[[-1]*m for _ in range(n)]
    for j in range(m):dp[0][j]=scores[0][j]-.045*j
    for i in range(1,n):
        for j in range(m):
            for k in range(j+1):
                penalty=.075 if k==j else .025*max(0,j-k-1)
                value=dp[i-1][k]+scores[i][j]-penalty
                if value>dp[i][j]:dp[i][j]=value;prev[i][j]=k
    j=max(range(m),key=lambda x:dp[-1][x]-.035*(m-1-x))
    result=[]
    for i in range(n-1,-1,-1):result.append((j,scores[i][j]));j=prev[i][j]
    return list(reversed(result))


def no_table_rows(senses,source):
    """Source-section-based provisional choices where no master table exists."""
    rows=[]
    locate=source_locator(source,senses)
    for sense in senses:
        title=clean(sense['title'])
        form=clean(sense['form'])
        example=sense.get('examples',[])
        definition=locate(example[0][0])[2] if example else ''
        if len(HAN.findall(definition))>=12:
            title=definition.strip('；。 ')
        context=re.search(r'[（(]([^）)]+)[）)]',form)
        if len(HAN.findall(title))>=12:
            pass
        elif context and HAN.search(context.group(1)):
            title=f'{context.group(1)}時，表示{title}'
        else:
            example_zh=clean(example[0][1]) if example else ''
            if example_zh and len(HAN.findall(example_zh))>=4:
                title=f'表示{title}；例句：「{example_zh[:42]}」'
            else:
                title=f'在此語境中表示{title}'
        rows.append((form,title))
    return rows


def source_locator(text,senses):
    """Locate source sentences and the boundary after the last numbered sense."""
    lines=text.splitlines();parts=[];headings=[];at=0
    for line_number,raw in enumerate(lines):
        line=clean(raw)
        mark=re.match(r'^(#{1,3})\s+(.+)',raw.strip())
        if mark and not re.match(r'^(?:Practice|Examples?)\b',clean(mark.group(2)),re.I):
            headings.append((at,len(mark.group(1)),clean(mark.group(2)),line_number))
        parts.append(line)
        at+=len(line)+1
    flat=' '.join(parts)
    numbers=[(pos,level,int(m.group(1))) for pos,level,title,_ in headings
             if (m:=re.match(r'(\d+)\.\s',title))]
    last_number=int(senses[-1]['id'].rsplit('-',1)[-1])
    last=next(((pos,level) for pos,level,n in reversed(numbers) if n==last_number),None)
    boundary=None
    if last:
        boundary=next((pos for pos,level,title,_ in headings if pos>last[0] and level<=last[1]),None)
    starts=[h[0] for h in headings]
    def locate(sentence):
        pos=flat.find(clean(sentence),numbers[0][0] if numbers else 0)
        if pos<0:return '',False,''
        index=bisect_right(starts,pos)-1
        if index<0:return '',False,''
        start=headings[index][3]+1;level=headings[index][1]
        end=next((h[3] for h in headings[index+1:] if h[1]<=level),len(lines))
        block=lines[start:end]
        definition=''
        for line in block:
            raw=clean(line)
            if '=' in raw and HAN.search(raw) and not raw.startswith(('>', '「', '“')):
                definition=clean(raw.split('=',1)[1])
                break
        if not definition:
            for line in block:
                raw=clean(line)
                if line.strip().startswith('**') and HAN.search(raw) and len(raw)<130:
                    definition=raw
                    break
        return headings[index][2],bool(boundary and pos>=boundary),definition
    return locate


def selected_options(rows,answer,limit=6):
    seen={rows[answer][1]};choices=[answer]
    for j in sorted((j for j in range(len(rows)) if j!=answer),key=lambda j:(abs(j-answer),j)):
        if rows[j][1] not in seen:
            choices.append(j);seen.add(rows[j][1])
        if len(choices)>=limit:break
    return choices


def heading_similarity(heading,form):
    heading=re.sub(r'^\d+\.\s*','',clean(heading))
    heading=re.sub(r'^(?:Related form|Fixed expression|Useful construction):\s*','',heading,flags=re.I)
    heading=heading.split(' — ')[0]
    return max(similarity(heading,form),similarity(heading.split(' = ')[0],form))


def source_derived_title(heading,definition='',fallback=''):
    heading=clean(heading)
    if 'in progress' in heading.lower():
        return '某項活動已開始但尚未完成；正在進行中'
    definition=clean(definition)
    if len(HAN.findall(definition))>=2:
        definition=definition.strip('；。 ')
        return definition if len(HAN.findall(definition))>=12 else f'表示{definition}'
    phrase=heading.split(' — ')[-1] if ' — ' in heading else heading
    chinese=''.join(re.findall(r'[\u3400-\u9fff][^A-Za-z]*',phrase)).strip('；。 ')
    chinese=clean(chinese)
    if len(HAN.findall(chinese))>=2:
        return chinese if len(HAN.findall(chinese))>=12 else f'表示{chinese}'
    fallback=clean(fallback)
    if HAN.search(fallback):
        return fallback if len(HAN.findall(fallback))>=12 else f'表示{fallback}'
    return '請對照句子的完整中文翻譯理解這個用法'


def repair_module(module,source):
    rows=list(table(source))
    authored=bool(rows)
    if not authored:rows=no_table_rows(module['senses'],source)
    if len(rows)<2:return None,{'reason':'fewer than two source meanings'}
    mapping=align(module['senses'],rows) if authored else [(i,1) for i in range(len(rows))]
    by_sense={s['id']:(j,score) for s,(j,score) in zip(module['senses'],mapping)}
    q_stats={'sourceTable':authored,'sourceMeanings':len(rows),'remapped':0,'held':[],
             'lowConfidence':[],'sourceDerived':[],'provisional':not authored}
    locate=source_locator(source,module['senses'])
    progress_override={14:5,15:5,16:6,17:6,18:7,19:7,20:1,21:1,22:'in-progress',23:'in-progress',24:1}
    manual={
      'so':{**{n:0 for n in (1,2,6,7)},**{n:1 for n in (3,4,5)},
        **{n:2 for n in (8,9,10)},**{n:3 for n in (11,12)},
        **{n:4 for n in (13,14)},**{n:5 for n in (17,18,19)}},
      'history':{**{n:4 for n in range(10,16)},**{n:5 for n in (16,17)},
        **{n:6 for n in (18,19)},**{n:7 for n in (20,21)},
        **{n:8 for n in (22,23)}},
      'hope':{**{n:0 for n in range(1,6)},**{n:1 for n in (6,7)},
        **{n:2 for n in (8,9)},**{n:3 for n in (10,11)},
        **{n:4 for n in (12,13)},**{n:5 for n in (14,15)},
        **{n:6 for n in (18,)},**{n:7 for n in (19,20)}}}
    extra={}
    assigned=[]
    for q in module['questions']:
        j,score=by_sense[q['sense']]
        heading,spill,definition=locate(q['en'])
        old_sense=q['sense']
        special=module['id']=='progress' and q.get('sourcePractice') in progress_override
        hand=manual.get(module['id'],{}).get(q.get('sourcePractice'))
        resolved=special or hand is not None
        if hand is not None:
            j=hand;spill=False
        if special:
            target=progress_override[q['sourcePractice']]
            if target=='in-progress':
                heading='in progress — 正在進行中'
                spill=True
            else:
                j=target
                q_stats['remapped']+=1
                spill=False
        if authored:
            ranking=sorted(((.53*heading_similarity(heading,form)+
              .47*chinese_similarity(definition or heading,meaning),k)
              for k,(form,meaning) in enumerate(rows)),reverse=True)
            best=ranking[0] if ranking else (0,-1)
            next_score=ranking[1][0] if len(ranking)>1 else 0
            threshold=.42 if spill or score<.24 else .57
            margin=.035 if spill or score<.24 else .075
            if not special and hand is None and best[0]>=threshold and best[0]-next_score>=margin:
                if j!=best[1]:q_stats['remapped']+=1
                j=best[1]
                spill=False
                resolved=True
            elif not special and hand is None and score<.24 and heading:
                spill=True
        # A heading with an explicit Chinese definition is stronger evidence
        # than a fuzzy ordinal match to an unrelated table entry.
        if authored and not special and hand is None and not spill and len(HAN.findall(definition))>=12:
            row_match=chinese_similarity(definition,rows[j][1])
            form_match=heading_similarity(heading,rows[j][0])
            if row_match<.11 and form_match<.55:
                spill=True
        if module['id']=='hope' and q.get('sourcePractice') in (16,17):
            spill=True
        if authored and score<.24 and not resolved:
            spill=True
        if spill:
            key=heading or f'Unmapped practice {q["id"]}'
            if key not in extra:
                extra[key]=len(rows)
                fallback=next((s['title'] for s in module['senses'] if s['id']==old_sense),'')
                rows.append((key,source_derived_title(key,definition,fallback)))
                q_stats['sourceDerived'].append({'heading':key,'meaning':rows[-1][1]})
            j=extra[key]
            q_stats['remapped']+=1
        if score<.24 and authored and not spill and not resolved:
            q_stats['lowConfidence'].append({'question':q['id'],'sourceSense':old_sense,
              'mappedTo':rows[j][0],'score':round(score,2)})
        assigned.append((q,j))
    meanings=[{'id':f"{module['id']}-mcq-{i+1:02d}",'title':title,'form':form,
      'en':form,'zh':title,'note':f'來源詞義：{title}',
      'examples':[],'options':[],'excludedOverlaps':[]}
      for i,(form,title) in enumerate(rows)]
    repaired=[]
    for q,j in assigned:
        option_indices=selected_options(rows,j)
        if len(option_indices)<2:
            q_stats['held'].append({'question':q['id'],'sentence':q['en'],'reason':'not enough distinct source meanings'})
            continue
        q['options']=[meanings[k]['id'] for k in option_indices]
        q['correctOption']=meanings[j]['id']
        q['sense']=meanings[j]['id']
        q.pop('acceptedSenses',None)
        q['explanation']=f'本句的「{q["targets"][0] if q.get("targets") else module["word"]}」指「{rows[j][1]}」。'
        q['optionReasons']={meanings[k]['id']:(f'本句指「{rows[j][1]}」。' if k==j else
          f'「{rows[k][1]}」是「{rows[k][0]}」的用法，與本句語境不同。') for k in option_indices}
        meanings[j]['examples'].append([q['en'],q['zh'],rows[j][1]])
        repaired.append(q)
    module['senses']=meanings
    module['questions']=repaired
    module['version']=2
    module['mcqSource']='master-comparison' if authored else 'sense-sections-provisional'
    return module,q_stats


def write_modules():
    report=[]
    content=ROOT/'polysemy-lab/content'
    for path in sorted(content.glob('*.mjs')):
        raw=subprocess.check_output(['git','show',f'{SOURCE_REVISION}:{path.relative_to(ROOT)}'],cwd=ROOT,text=True)
        try:module=json.loads(raw.removeprefix('export default ').removesuffix(';\n'))
        except (json.JSONDecodeError,ValueError):continue
        if not isinstance(module.get('number'),int) or module['number']<8:continue
        result,stats=repair_module(module,source_text(module['id']))
        report.append({'number':module['number'],'module':module['id'],**stats,
                       'remainingQuestions':len(result['questions']) if result else 0})
        if result:path.write_text('export default '+json.dumps(result,ensure_ascii=False,indent=2)+';\n')
    # The lazy catalogue's compact records also need the corrected answer key
    # so module cards and saved progress never use the obsolete sense ID.
    index=[]
    for path in content.glob('*.mjs'):
        try:m=json.loads(path.read_text().removeprefix('export default ').removesuffix(';\n'))
        except (json.JSONDecodeError,ValueError):continue
        if not m.get('mass'):continue
        index.append({'id':m['id'],'word':m['word'],'number':m['number'],'mass':True,
          'senses':[{'id':s['id']} for s in m['senses']],
          'questions':[{'id':q['id'],'sense':q['sense'],'correctOption':q.get('correctOption'),'en':q['en']}
                       for q in m['questions']]})
    index.sort(key=lambda m:(m['number'],m['id']))
    (ROOT/'polysemy-lab/mass-index.mjs').write_text('export default '+json.dumps(index,ensure_ascii=False,separators=(',',':'))+';\n')
    (ROOT/'polysemy-lab/MCQ-REVIEW.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'modules':len(report),'withSourceTable':sum(r['sourceTable'] for r in report),
      'provisional':sum(r['provisional'] for r in report),
      'heldQuestions':sum(len(r['held']) for r in report),
      'lowConfidenceQuestions':sum(len(r['lowConfidence']) for r in report),
      'remainingQuestions':sum(r['remainingQuestions'] for r in report)},ensure_ascii=False))


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--write',action='store_true')
    args=parser.parse_args()
    if args.write:
        write_modules()
        return
    report=[]
    for path in sorted((ROOT/'polysemy-lab/content').glob('*.mjs')):
        try:module=json.loads(path.read_text().removeprefix('export default ').removesuffix(';\n'))
        except (json.JSONDecodeError,ValueError):continue
        n=module.get('number')
        if not isinstance(n,int) or n<8:continue
        rows=table(source_text(module['id']))
        senses=module['senses']
        best=[]
        for s in senses:
            ranking=sorted(((similarity(s['form'],a),i,a) for i,(a,b) in enumerate(rows)),reverse=True)
            best.append(ranking[0] if ranking else (0,-1,''))
        aligned=align(senses,rows)
        report.append({'number':n,'id':module['id'],'senses':len(senses),'questions':len(module['questions']),
                       'tableRows':len(rows),'bestMatchAtLeast06':sum(x[0]>=.6 for x in best),
                       'matches':[(s['id'],s['form'],round(score,2),label) for s,(score,_,label) in zip(senses,best)],
                       'aligned':[(s['id'],j,round(score,2),rows[j][0] if j>=0 else '') for s,(j,score) in zip(senses,aligned)]})
    print(json.dumps({'lessons':len(report),'withTable':sum(x['tableRows']>=2 for x in report),
      'questionsWithTable':sum(x['questions'] for x in report if x['tableRows']>=2),
      'senses':sum(x['senses'] for x in report),'matched':sum(x['bestMatchAtLeast06'] for x in report),
      'noTable':[x['number'] for x in report if x['tableRows']<2]},ensure_ascii=False,indent=2))
    Path('/private/tmp/polysemy-mcq-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    for x in report:
        if x['id'] in ('progress','cancel','old','blame','step'):
            print('\n',x['id'],x['tableRows'],x['bestMatchAtLeast06'],'/',x['senses'])
            for row in x['matches'][:28]:print(' ',row)
            print(' aligned:')
            for row in x['aligned'][:28]:print(' ',row)

if __name__ == '__main__':main()
