#!/usr/bin/env python3
"""Build the owner-approved Reading catalogue from the audited PDF cache.

Original question groups are retained verbatim, including a page-image reference
for tables and figures. Analysis text is never used to reconstruct missing source
questions. Run without --write to validate; --render creates original-page JPEGs.
"""
from __future__ import annotations
import argparse
import concurrent.futures
import hashlib
import importlib.util
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOLD = {f'p1-{n:03}' for n in (8,13,22,25,71,79,90,91,107,112,118,121,133,53,66,164)} | {f'p2-{n:03}' for n in (31,43,67,79,91,103,115,127,136,140,152,164)} | {f'p3-{n:03}' for n in (2,6,19,22,23,74,83,116,119,173,174,175)}
EXISTING = 'p1-069-albert-einstein'
VERSION = '20260827-corpus1'
GROUP = re.compile(r'(?im)^\s*Questions?\s+(\d+)(?:\s*[–—-]\s*(\d+))?[^\n]*')
POPPLER = Path('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftoppm')


def assigned(path):
    raw = path.read_text()
    return json.JSONDecoder().raw_decode(raw[raw.index('{'):])[0]


def compact(text):
    return re.sub(r'\s+', ' ', text).strip()


def paragraphs(text, title):
    text = re.sub(r'(?im)^\s*SECTION\s+\d+\s*:\s*QUESTIONS?\s+[^\n]*', '', text)
    text = re.sub(r'(?im)^\s*(?:Reading Test\s+\d+[^\n]*|Section\s+[123]|Reading Passage\s+[123])\s*\n', '', text).strip()
    markers = list(re.finditer(r'(?m)^\s*([A-Z])(?:[.]\s*|\s+)(?=[A-Z“‘"\d]|\n)', text))
    # Only actual sequential A/B/C labels define paragraphs; isolated initials
    # and large title capitals must never split prose.
    if len(markers) >= 2 and len(text[:markers[0].start()].split()) < 50 and [m[1] for m in markers] == [chr(65+i) for i in range(len(markers))]:
        result = [{'number': i+1, 'label': m[1], 'text': compact(text[m.end():markers[i+1].start() if i+1<len(markers) else None])} for i,m in enumerate(markers)]
        intro = compact(text[:markers[0].start()])
    else:
        blocks = [compact(s) for s in re.split(r'\n\s*\n', text) if s.strip()]
        intro = ''
        # First short block is the source heading, sometimes including subtitle.
        if blocks and len(blocks[0].split()) < 40 and not re.match(r'^1[.)]', blocks[0]):
            intro = blocks.pop(0)
        result = []
        for block in blocks:
            if result and (not re.search(r'[.!?][”’"\')]*$', result[-1]['text']) or re.match(r'^[a-z]', block)):
                result[-1]['text'] += ' ' + block
            else:
                result.append({'number': len(result)+1, 'label': str(len(result)+1), 'text': re.sub(r'^\d+[.)]\s+', '', block)})
    if not result or any(not p['text'] for p in result):
        raise ValueError('Empty passage paragraph')
    return intro, result


def accepted(raw):
    value = re.sub(r'^人物\s+', '', compact(str(raw)).strip('“”"'))
    tf = re.match(r'^(TRUE|FALSE|NOT GIVEN|YES|NO)\b', value, re.I)
    if tf:
        values = [tf[1].upper()]
        letter = re.search(r'選\s*([A-Z])\b', value)
        if letter:
            values.append(letter[1])
        return values
    choice = re.match(r'^([A-Z]|[ivxlcdm]+)(?:\s*[—–:：.)(（]|\s+-\s+|$)', value)
    if choice:
        return [choice[1]]
    # Preserve source-authorized alternatives and optional parenthesized words.
    value = re.split(r'\s*[—–]\s*|[；;]|（(?:接受|亦可|可接受)', value)[0].strip()
    variants = re.split(r'\s*/\s*|\s+or\s+|\s*或\s*', value)
    output = []
    for variant in variants:
        if re.search(r'\([^)]*\)', variant):
            output.extend([compact(re.sub(r'\([^)]*\)', '', variant)), compact(re.sub(r'[()]', '', variant))])
        else:
            output.append(variant)
    return list(dict.fromkeys(v.strip(' .“”"') for v in output if v.strip()))


def question_controls(group_text, raw, type_name):
    if str(raw).upper() == 'NOT GIVEN' and (re.search(r'YES\s*[/—–-]|YES\s+if',group_text,re.I) or re.search(r'YES.*NO',type_name,re.I)):
        return ['YES', 'NO', 'NOT GIVEN']
    if re.match(r'^(TRUE|FALSE|NOT GIVEN)\b', str(raw), re.I):
        return ['TRUE', 'FALSE', 'NOT GIVEN']
    if re.match(r'^(YES|NO)\b', str(raw), re.I):
        return ['YES', 'NO', 'NOT GIVEN']
    if re.search(r'YES\s*[/—–-]|YES\s*if', group_text, re.I) and str(raw).upper() == 'NOT GIVEN':
        return ['YES', 'NO', 'NOT GIVEN']
    values = accepted(raw)
    if len(values)==1 and re.fullmatch(r'[ivxlcdm]+', values[0]):
        labels = re.findall(r'(?m)^\s*([ivxlcdm]+)[.)]?\s+', group_text)
        if labels:
            return list(dict.fromkeys(labels))
    if len(values)==1 and re.fullmatch('[A-Z]', values[0]):
        labels = re.findall(r'(?m)^\s*([A-Z])(?:[.)]\s*|\s+)', group_text)
        if len(set(labels))>=2:
            return sorted(set(labels))
        rng = re.search(r'\b([A-Z])\s*[–—-]\s*([A-Z])\b', group_text)
        if rng and rng[1]<rng[2]:
            return [chr(c) for c in range(ord(rng[1]),ord(rng[2])+1)]
    return []


def build(row, cached, analysis, download_id):
    cid = row['catalogueId']
    pages = cached['pages'][:cached['answerStart']]
    full = '\n\n'.join(pages)
    matches = list(GROUP.finditer(full))
    if not matches:
        raise ValueError('Missing original question groups')
    intro, paras = paragraphs(full[:matches[0].start()], analysis['title'])
    groups = []
    for i, match in enumerate(matches):
        start,end = int(match[1]),int(match[2] or match[1])
        # A repeated heading for the same question range is a continued group.
        body = full[match.start():matches[i+1].start() if i+1<len(matches) else None].strip()
        if groups and (groups[-1]['start'],groups[-1]['end']) == (start,end):
            groups[-1]['text'] += '\n\n'+body
        else:
            groups.append({'id':f'g{start}', 'start':start,'end':end,'text':body})
    first_question_page = next(i for i,p in enumerate(pages) if GROUP.search(p))
    source_pages = [i+1 for i in range(first_question_page,len(pages)) if pages[i].strip()]
    analysis_numbers = sorted({n for q in analysis['questions'] for n in q.get('numbers',[q['number']])})
    start = analysis.get('questionNumberStart', min(analysis_numbers))
    numbers = list(range(start,start+analysis['questionCount']))
    keys = dict(zip(numbers,analysis['answerKey']))
    review_numbers = set()
    for aq in analysis['questions']:
        nums = aq.get('numbers',[aq['number']])
        raw = aq.get('answer', '')
        if len(nums)==1:
            keys[nums[0]]=raw
        elif re.fullmatch(r'[A-Z](?:\s*(?:,|、|and|&)\s*[A-Z])+',raw):
            letters=re.findall(r'\b[A-Z]\b',raw)
            if len(letters)==len(nums):
                for n,v in zip(nums,letters): keys[n]=v
        if re.search(r'未提供|沒有完全正確|文本支援較弱|選項.{0,8}(?:問題|理想)|方向寫反',raw):
            review_numbers.update(nums)
    if cid=='p2-119':
        keys[22]='A'
        keys[23]='B'
    if cid=='p3-079':
        review_numbers.add(35)
    questions = []
    grading = {}
    for number in numbers:
        aq = next((q for q in analysis['questions'] if number in q.get('numbers',[q['number']])), None)
        if not aq:
            raise ValueError(f'Missing analysis Q{number}')
        group = next((g for g in groups if g['start']<=number<=g['end']), None)
        if not group:
            raise ValueError(f'Original question range does not contain Q{number}')
        # Prefer only an unambiguous source-numbered line. The complete source
        # group remains displayed above it, so no table context is discarded.
        qline = re.search(rf'(?m)^\s*{number}[.)]?\s+(.+)', group['text'])
        prompt = f'Question {number} · 請參照上方原題'
        if qline:
            rest=group['text'][qline.start():]
            rest=re.sub(rf'^\s*{number}[.)]?\s+', '', rest)
            prompt=compact(re.split(r'\n\s*(?:\d{1,2}[.)]?\s+|[A-Z][.)]?\s+)',rest)[0])
        options = question_controls(group['text'],keys[number],aq.get('type',''))
        multi = re.findall(r'\b[A-Z]\b',str(keys[number])) if re.fullmatch(r'[A-Z](?:\s*(?:,|、|and|&)\s*[A-Z])+',str(keys[number])) else []
        if multi:
            options=question_controls(group['text'],multi[0],aq.get('type',''))
        q = {'number':number,'group':group['id'],'type':'choice' if options else 'text','prompt':prompt,
             'translation':aq.get('translation','') if aq.get('translation')!='請依照下方步驟完成定位、細讀與答案判斷。' else '',
             'options':options,'placeholder':'依照原題字數限制輸入答案'}
        if multi and options:
            q['type']='multiple'
            q['slots']=len(multi)
        if number in review_numbers:
            q['requiresReview']=True
        questions.append(q)
        grading[f'q{number}'] = {'display':str(keys[number]),'accepted':accepted(keys[number]),'requiresReview':number in review_numbers}
    for aq in analysis['questions']:
        nums = aq.get('numbers',[])
        if len(nums)>1:
            group = next((g for g in groups if g['start']<=nums[0]<=g['end']),None)
            if group and re.search(r'choose\s+(?:any\s+)?(?:TWO|THREE|FOUR|FIVE|SIX|SEVEN|\d+)\b',group['text'],re.I):
                vals = sorted({v for n in nums for v in accepted(keys[n])})
                if all(re.fullmatch('[A-Z]',v) for v in vals) and len(vals)==len(nums):
                    for n in nums:
                        grading[f'q{n}']['accepted']=vals
                        grading[f'q{n}']['unorderedGroup']=[f'q{k}' for k in nums]
    data = {'id':cid,'catalogueId':cid,'title':analysis['title'],'sourceHeading':intro,
            'passage':int(cid[1]),'practice':int(cid[3:]),'version':VERSION,
            'analysisId':analysis['id'],'source':{'filename':Path(row['source']).name,'sha256':row['sha256']},
            'paragraphs':paras,'instructions':{g['id']:f"Questions {g['start']}–{g['end']}" for g in groups},
            'questionGroups':groups,'questions':questions,
            'questionPages':[f'/assets/reading-comprehension/questions/{cid}/page-{n}.jpg' for n in source_pages]}
    metadata = {k:data[k] for k in ('id','title','passage','practice','version','analysisId')}
    metadata.update({'paragraphCount':len(paras),'questionCount':len(questions),'questionStart':numbers[0],
                     'questionEnd':numbers[-1],'downloadId':download_id,'translations':False,'audio':False})
    return data,metadata,grading,source_pages


def render_pdf(job):
    row,pages = job
    folder = ROOT/'assets/reading-comprehension/questions'/row['catalogueId']
    folder.mkdir(parents=True,exist_ok=True)
    for n in pages:
        output = folder/f'page-{n}'
        if output.with_suffix('.jpg').exists():
            continue
        subprocess.run([str(POPPLER),'-f',str(n),'-l',str(n),'-singlefile','-scale-to','1450','-jpeg','-jpegopt','quality=82',row['source'],str(output)],check=True,capture_output=True)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache',type=Path,required=True)
    parser.add_argument('--write',action='store_true')
    parser.add_argument('--render',action='store_true')
    args=parser.parse_args()
    inventory=json.loads((args.cache/'inventory.json').read_text())['sources']
    bundled=assigned(ROOT/'ielts-reading-analysis-content.js')['articles']
    corrections=json.loads((ROOT/'tools/reading-comprehension-source-corrections.json').read_text())
    download_script=(ROOT/'workers/model-essay-downloads/src/reading-catalog.js').read_text()
    download_ids={}
    for raw in re.findall(r'\{"id":"[^\n]+?\}',download_script):
        r=json.loads(raw)
        number=re.search(r'Practice\s*(\d+)',r['filename'])
        passage=re.search(r'Passage\s*([123])',r['filename'])
        if number and passage:
            download_ids[f'p{passage[1]}-{int(number[1]):03}']=r['id']
    catalogue=[]; answers=[]; jobs=[]; errors=[]; warnings=[]
    for row in inventory:
        cid=row['catalogueId']
        if cid in HOLD:
            continue
        if cid=='p1-069':
            d=json.loads((ROOT/f'reading-comprehension-data/{EXISTING}.json').read_text())
            a=json.loads((ROOT/f'ielts-reading-analysis-data/{EXISTING}.json').read_text())
            catalogue.append({'id':EXISTING,'title':d['title'],'passage':1,'practice':69,'version':VERSION,'analysisId':EXISTING,'paragraphCount':5,'questionCount':13,'questionStart':1,'questionEnd':13,'downloadId':download_ids[cid],'translations':True,'audio':True})
            answers.append({'id':EXISTING,'title':d['title'],'keys':{f'q{i+1}':{'display':str(k),'accepted':accepted(k)} for i,k in enumerate(a['answerKey'])}})
            continue
        try:
            analysis=bundled[row['analysisId']] if row['analysisSource']=='bundled' else json.loads((ROOT/f"ielts-reading-analysis-data/{row['analysisId']}.json").read_text())
            if cid in corrections:
                correction=corrections[cid]
                rows=correction['questions']
                analysis={**analysis,'id':f'analysis-{cid}','questionNumberStart':rows[0][0], 'questionCount':len(rows),
                          'answerKey':[q[1] for q in rows], 'paragraphOverview':None,
                          'questions':[{'number':n,'answer':answer,'answerKey':answer,'prompt':f'Question {n}', 'translation':zh,'type':'Question Analysis',
                                        'sections':[{'id':'scan','title':'Scanning','blocks':[{'kind':'paragraph','text':scan}]},
                                                    {'id':'read','title':'Read · 原文證據','blocks':[{'kind':'quote','text':evidence},{'kind':'paragraph','text':reason}]}]}
                                       for n,answer,zh,scan,evidence,reason in rows]}
                if correction.get('paragraphSummaries'):
                    analysis['paragraphOverview']={'paragraphs':[{'number':chr(65+i),'summary':s} for i,s in enumerate(correction['paragraphSummaries'])]}
                if args.write:
                    (ROOT/f'reading-comprehension-data/analysis-{cid}.json').write_text(json.dumps(analysis,ensure_ascii=False,indent=2)+'\n')
            if cid=='p2-119':
                analysis['id']='analysis-p2-119'
                for q in analysis['questions']:
                    if q['number'] not in (22,23): continue
                    answer='A' if q['number']==22 else 'B'
                    reason='原 PDF 的 A 圖把左下方、底邊平行地面的正面着色，符合第 4 段對 Necker cube 的描述。' if q['number']==22 else '對照原 PDF：B 圖把兩端不同的線放在最下方，中間及上方分別為兩端外張及內收的線，符合第 6 段指定的排列。'
                    q.update({'answer':answer,'answerKey':answer,'sections':[{'id':'scan','title':'Scanning','blocks':[{'kind':'paragraph','text':'定位第 4 段的 lower-left face。' if q['number']==22 else '定位第 6 段的 middle line、above 及 third。'}]},{'id':'read','title':'原題圖像核對','blocks':[{'kind':'paragraph','text':reason}]}]})
                if args.write:
                    (ROOT/'reading-comprehension-data/analysis-p2-119.json').write_text(json.dumps(analysis,ensure_ascii=False,indent=2)+'\n')
            cached=json.loads((args.cache/f'{cid}.json').read_text())
            d,m,k,pages=build(row,cached,analysis,download_ids.get(cid))
            for qn,key in k.items():
                if any(re.search(r'[\u3400-\u9fff]',v) for v in key['accepted']):
                    key['requiresReview']=True
                    next(q for q in d['questions'] if f"q{q['number']}"==qn)['requiresReview']=True
                    warnings.append({'id':cid,'question':qn,**key})
            if args.write:
                (ROOT/f'reading-comprehension-data/{cid}.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
            catalogue.append(m);answers.append({'id':cid,'title':m['title'],'keys':k});jobs.append((row,pages))
        except Exception as error:
            errors.append({'id':cid,'error':str(error)})
    report={'version':VERSION,'total':len(catalogue),'new':len(jobs),'held':sorted(HOLD),'errors':errors,'answerReview':warnings}
    (args.cache/'build-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps(report,ensure_ascii=False,indent=2),flush=True)
    if errors or len(catalogue)!=437 or len(jobs)!=436:
        raise SystemExit('Catalogue validation failed; no catalogue was published')
    if args.write:
        (ROOT/'reading-comprehension-catalogue.json').write_text(json.dumps({'version':VERSION,'articles':catalogue},ensure_ascii=False,indent=2)+'\n')
        (ROOT/'tools/reading-comprehension-answer-seed.json').write_text(json.dumps(answers,ensure_ascii=False,separators=(',',':'))+'\n')
        for row in inventory:
            if row.get('analysisSource')=='bundled' and row['catalogueId'] not in HOLD:
                (ROOT/f"reading-comprehension-data/analysis-{row['analysisId']}.json").write_text(json.dumps(bundled[row['analysisId']],ensure_ascii=False)+'\n')
    if args.render:
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            for i,_ in enumerate(pool.map(render_pdf,jobs),1):
                if i%25==0: print(f'Rendered original questions for {i}/{len(jobs)} exercises',flush=True)


if __name__=='__main__':
    main()
