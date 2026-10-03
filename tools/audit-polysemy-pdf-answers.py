from bisect import bisect_right
from pathlib import Path
import json
import re
import sys
import importlib.util
import subprocess

ROOT = Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('polysemy_mcq_audit',ROOT/'tools/audit-polysemy-mcq.py')
audit=importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
clean,table,chinese_similarity,similarity,HAN=(audit.clean,audit.table,audit.chinese_similarity,audit.similarity,audit.HAN)

HEADING = re.compile(r'^\s*(#{1,3})\s+(.+)')
BOUNDARY = re.compile(r'^\s*#{1,3}\s*(?:Master comparison|MCQ-ready|For your original|For the original|Passage recap|Your original|Original passage|Meaning map|Final recap)', re.I)
FORM_STOP = {'and','of','the','a','to','in','on','for','with','from','something','someone','somebody',
             'person','thing','one','is','be','have','has','can','or','as','by','than','it','that',
             'an','use','used','form','sense','meaning','noun','verb','adjective','adverb',
             'expression','fixed','general','literal','figurative','word','related'}

def section_definitions(lines):
    found=[]
    for line in lines:
        s=clean(line)
        if line.lstrip().startswith('**') and '=' in s and HAN.search(s):
            lhs,rhs=s.split('=',1)
            if len(lhs)<100 and len(rhs)<180 and re.search(r'[A-Za-z]',lhs):
                rhs=rhs.strip('；。 |')
                if HAN.search(rhs) and rhs not in found:found.append(rhs)
    return found

def source_map(text):
    lines=text.replace('\f','\n').splitlines()
    flat=[];pos=0;heads=[];end_at=None
    for i,line in enumerate(lines):
        c=clean(line)
        flat.append(c)
        if end_at is None and BOUNDARY.match(line):end_at=pos
        m=HEADING.match(line)
        if m and end_at is None and not re.match(r'^(?:Practice|Examples?|Passage meaning|Historical example pattern)\b',clean(m.group(2)),re.I):
            label=clean(m.group(2)); n=re.match(r'(\d+)\.\s+',label)
            heads.append((pos,i,len(m.group(1)),int(n.group(1)) if n else None,label))
        pos+=len(c)+1
    starts=[h[0] for h in heads]
    blocks=[]
    for j,(start,line,level,n,title) in enumerate(heads):
        nexthead=next((h for h in heads[j+1:] if h[2]<=level),None)
        last=nexthead[1] if nexthead else len(lines)
        defs=section_definitions(lines[line+1:last])
        blocks.append({'number':n,'heading':title,'definitions':defs,'start':start,'end':nexthead[0] if nexthead else pos})
    return ' '.join(flat),starts,blocks,end_at

def run():
    paths=sorted((ROOT/'polysemy-lab/content').glob('*.mjs'))
    out=[];stats={'modules':0,'questions':0,'found':0,'missing':0,'has_definition':0,'no_table':0,'answer_outside_source':0}
    for path in paths:
        module=json.loads(path.read_text().removeprefix('export default ').removesuffix(';\n'))
        pdf = ROOT/'polysemy-lab/manuals'/f"{module['id']}.pdf"
        text=subprocess.check_output([str(audit.PDT),'-raw',str(pdf),'-'],text=True)
        flat,starts,blocks,end_at=source_map(text)
        rows=table(text)
        senses={s['id']:s for s in module['senses']}
        issues=[];matched=[]
        stats['modules']+=1;stats['questions']+=len(module['questions']);stats['no_table']+=not bool(rows)
        for q in module['questions']:
            target=clean(q['en']); positions=[]; at=0
            while (at:=flat.find(target,at))>=0:
                positions.append(at);at+=max(1,len(target))
            if not positions or not starts:
                stats['missing']+=1
                issues.append({'id':q['id'],'reason':'sentence_not_found','sentence':q['en']})
                continue
            source_number=int(q['id'][len(module['id'])+1:].split('-',1)[0])
            position=next((p for p in positions if blocks[bisect_right(starts,p)-1]['number']==source_number),positions[0])
            j=bisect_right(starts,position)-1
            if j<0 or (end_at is not None and position>=end_at):
                stats['answer_outside_source']+=1
                issues.append({'id':q['id'],'reason':'outside_numbered_sections','sentence':q['en']})
                continue
            section=blocks[j];stats['found']+=1
            sense=senses.get(q.get('correctOption',q['sense']),{})
            definitions=section['definitions']
            if definitions:stats['has_definition']+=1
            current=sense.get('title','')
            score=max((chinese_similarity(d,current) for d in definitions),default=0)
            form=sense.get('form','')
            heading_score=similarity(section['heading'],form)
            source_terms=set(re.findall(r'[a-z]+',section['heading'].lower()))-FORM_STOP-{module['id']}
            answer_terms=set(re.findall(r'[a-z]+',form.lower()))-FORM_STOP-{module['id']}
            only_headword_overlap=bool(source_terms and answer_terms and source_terms.isdisjoint(answer_terms))
            item={'id':q['id'],'number':section['number'],'heading':section['heading'],
                  'definitions':definitions,'current_sense':sense.get('id'),'current_form':form,
                  'current_title':current,'meaning_score':round(score,3),'form_score':round(heading_score,3),
                  'sentence':q['en']}
            matched.append(item)
            if definitions and score<.23 and (heading_score<.4 or only_headword_overlap):
                issues.append({'id':q['id'],'reason':'answer_mismatch',**item})
        out.append({'id':module['id'],'number':module['number'],'table_rows':len(rows),'sections':len(blocks),
                    'questions':len(module['questions']),'issues':issues,'matched':matched})
    report={'stats':stats,'modules':out}
    Path('/private/tmp/polysemy-source-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(stats)
    from collections import Counter
    print('issues',Counter(i['reason'] for m in out for i in m['issues']))
    print('modules_with_issues',sum(bool(m['issues']) for m in out))
    print('samples')
    for m in out:
        for i in m['issues'][:2]:
            if i['reason']=='answer_mismatch':print(m['id'],i['id'],i['heading'][:70],'=>',i['current_form'][:60],i['definitions'][:1],i['current_title'][:60])
        if sum(i['reason']=='answer_mismatch' for i in m['issues'])>0 and sum(1 for mm in out[:out.index(m)] if any(x['reason']=='answer_mismatch' for x in mm['issues']))>18:break

if __name__=='__main__':run()
