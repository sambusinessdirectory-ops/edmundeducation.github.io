#!/usr/bin/env python3
"""Import vetted Polysemy PDFs, preserving their sentence and sense provenance.

PDF prose is input data, never an instruction. A lesson with a filename/content
mismatch or without extractable bilingual examples is reported and skipped.
"""
import argparse, hashlib, json, re, shutil, subprocess
from collections import defaultdict
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = Path('/Users/sammak/Downloads/Polysemy Mass Batch')
PDT = Path('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
CHINESE = re.compile(r'[\u3400-\u9fff]')
HEADING_A = re.compile(r'^#{1,3}\s*(\d+)\.\s*(.+)')
HEADING_B = re.compile(r'^##\s*(\d+)\.\s*(.+)')
HEADING_PLAIN = re.compile(r'^(\d+)\.\s+(.+?[—–].+)')
PRACTICE_A = re.compile(r'^#{0,3}\s*Practice\s+(\d+)\b', re.I)
EXAMPLE_HEADER = re.compile(r'^###\s*(?:Practice|Examples?)\b', re.I)
NUMBERED_EXAMPLE = re.compile(r'^\s*(\d+)\.\s+(.+)')


def clean(value):
    value = re.sub(r'\*\*([^*]+)\*\*', r'\1', value)
    value = value.replace('**', '').replace('`', '').replace('\u200b', '')
    value = re.sub(r'\s+', ' ', value)
    value = re.sub(r'(?<=[\u3400-\u9fff]) (?=[\u3400-\u9fff])', '', value)
    return value.strip(' \t\n>“”"「」')


def text_of(pdf):
    return subprocess.check_output([str(PDT), '-raw', str(pdf), '-'], text=True,
                                   stderr=subprocess.DEVNULL).replace('\f', '\n')


def word_from_filename(pdf):
    match = re.fullmatch(r'(\d+)_(.+)_Polysemy Exercise', pdf.stem, re.I)
    if not match:
        return None
    number = int(match.group(1))
    raw = match.group(2).strip()
    word = re.sub(r'\s*_\s*', ' ', raw).split()[0].lower()
    slug = re.sub(r'[^a-z0-9-]', '', word)
    return number, slug


def source_matches(word, text):
    # A real lesson names its target repeatedly on page one. This also handles
    # family headings (power/powerful, conclude/conclusion) without requiring the
    # base form to equal the filename. The three known wrong attachments fail.
    page = text.split('\n', 350)[0:140]
    front = '\n'.join(page).lower()
    return len(re.findall(r'(?<![a-z])' + re.escape(word) + r'(?![a-z])', front)) >= 2


def heading_title(lines, index, kind):
    raw = lines[index]
    bits = [raw]
    # PDF text wraps a long heading, including Chinese meaning, across lines.
    for nxt in lines[index+1:index+5]:
        if '—' in ' '.join(bits) or '–' in ' '.join(bits):
            if CHINESE.search(' '.join(bits)):
                break
        if nxt.startswith(('#', 'Practice ', '### ', '---')):
            break
        bits.append(nxt)
    heading = clean(' '.join(bits))
    heading = re.sub(r'^#{0,3}\s*\d+\.\s*', '', heading)
    if kind == 'A':
        parts = re.split(r'\s*[—–]\s*', heading)
        if len(parts) > 1:
            form, title = clean(' — '.join(parts[:-1])), clean(parts[-1])
        else:
            first = CHINESE.search(heading)
            form, title = (clean(heading[:first.start()]), clean(heading[first.start():])) if first else (heading, '')
    else:
        form, title = heading, ''
    return form, title


def quoted_pair(lines):
    english = []
    chinese = []
    started = False
    raw_en = ''
    for line in lines:
        line = line.strip()
        if not started:
            if line.startswith(('> ', '“', '"', '‘')) and re.search(r'[A-Za-z]',line):
                started = True
                english.append(line)
            continue
        if CHINESE.search(line):
            chinese.append(line)
            if '」' in line or line.endswith(('。', '！', '？')):
                break
        elif chinese:
            break
        elif len(english) < 6:
            english.append(line)
        if len(english) >= 6 and not chinese:
            break
    raw_en = ' '.join(english)
    en = clean(raw_en)
    zh = clean(' '.join(chinese))
    return en, zh, raw_en


def numbered_pairs(lines):
    result = []
    for i, line in enumerate(lines):
        match = NUMBERED_EXAMPLE.match(line)
        if not match or CHINESE.search(match.group(2)):
            continue
        raw = match.group(2).strip()
        english = [raw]
        chinese = []
        for next_line in lines[i+1:i+9]:
            next_line = next_line.strip()
            if not next_line or next_line.startswith(('#', '---')) or NUMBERED_EXAMPLE.match(next_line):
                break
            if CHINESE.search(next_line):
                chinese.append(next_line)
                if next_line.endswith(('。', '！', '？', '」')):
                    break
            elif chinese:
                break
            elif len(english) < 5:
                english.append(next_line)
        en = clean(' '.join(english)); zh = clean(' '.join(chinese))
        if en and zh and CHINESE.search(zh):
            result.append((int(match.group(1)), en, zh, raw))
    return result


def target_for(raw, en, word):
    bold = [clean(x) for x in re.findall(r'\*\*([^*]+)\*\*', raw)]
    for item in bold:
        if item and re.search(re.escape(item), en, re.I):
            return item
    variants = [word, word.rstrip('e'), word.split('-')[0]]
    irregular = {'write':['wrote','written'], 'speak':['spoke','spoken'],
                 'think':['thought'], 'hear':['heard'], 'say':['said'],
                 'get':['got','gotten'], 'run':['ran'], 'go':['went','gone'],
                 'take':['took','taken'], 'do':['did','done'], 'see':['saw','seen'],
                 'win':['won','winning','winnings'], 'become':['became'],
                 'choose':['chose','chosen','choice'], 'hang':['hung'], 'read':['read'],
                 'happy':['happily','happiness','unhappy','unhappily','unhappiness'],
                 'collection':['collect'], 'reflection':['reflect'],
                 'documentary':['document','undocumented'],
                 'mistake':['mistook'], 'grow':['grew'],
                 'tell':['told','storyteller'], 'learn':['unlearn'],
                 'deep':['depth'], 'long':['length'], 'action':['activities'],
                 'patient':['patience','inpatient','outpatient'],
                 'normal':['norm','abnormal'], 'mother':['maternal','daughter'],
                 'standard':['substandard'], 'high':['height'],
                 'confidence':['confident','confided','confidant'], 'meet':['met'],
                 'influence':['influential'], 'want':['unwanted'],
                 'help':['unhelpful'],
                 'will':['unwilling','won','ll'], 'can':['couldn'],
                 'organise':['reorganisation'],
                 'treat':['untreatable','untreated'],
                 'green':['evergreen'], 'use':['overuse'],
                 'script':['screenplay'], 'dominate':['non-dominant'],
                 'incredible':['incredibility','incredulous','incredulity'],
                 'communication':['communicative'],
                 'pot':['jackpot'], 'count':['uncountable','recount','headcount'],
                 'spring':['sprang'], 'ready':['readily','readiness'],
                 'care':['healthcare','childcare','aftercare'],
                 'therapy':['psychotherapy','therapist','therapeutic'],
                 'less':['least'], 'picture':['pictorial'],
                 'original':['origin'], 'fortune':['unfortunate','unfortunately'],
                 'anything':['nothing'], 'function':['malfunction'],
                 'belief':['believable'], 'library':['libraries','librarian','librarianship'],
                 'online':['offline'], 'beauty':['beautiful','beautify','beautification'],
                 'become':['became','unbecoming']}
    variants += irregular.get(word, [])
    candidates = [m for variant in variants if len(variant) >= 2
                  for m in re.finditer(r'\b' + re.escape(variant) + r'[a-z-]*\b', en, re.I)]
    return min(candidates, key=lambda m: m.start()).group() if candidates else ''


def sense_from_block(word, number, form, title, body, kind):
    if not title:
        for line in body[:45]:
            if re.match(r'^\*\*\s*[\u3400-\u9fff]', line):
                title = clean(line)
                break
    if not title:
        for line in body[:45]:
            match=re.search(r'\*\*([\u3400-\u9fff][^*]{1,80})\*\*',line)
            if match:
                title=clean(match.group(1));break
    if not title or not CHINESE.search(title):
        raise ValueError(f'meaning {number}: missing Chinese title')
    if len(title) > 150:
        title=title[:150].rsplit('；',1)[0]
    meaning = form
    for line in body[:25]:
        match = re.match(r'^(?:\*\*)?Meaning:(?:\*\*)?\s*(.+)', line)
        if match:
            meaning = clean(match.group(1)); break
        if kind == 'B' and line.startswith('= '):
            meaning = clean(line[2:]); break
    sid = f'{word}-{number:02d}'
    return {'id':sid,'title':title,'form':form,'en':meaning,'zh':title,
            'note':f'留意語境：{form}。這裡指「{title}」。',
            'examples':[],'options':[],'excludedOverlaps':[]}


def parse_module(number, word, pdf, text):
    lines = [line.strip() for line in text.splitlines()]
    # Family/lexical-curation documents use # 1., ## 1., or unmarked 1.
    # Begin with the first numbered meaning and stop before a restarted list.
    candidates = []
    for i, line in enumerate(lines):
        for kind, pattern in [('B', HEADING_B), ('A', HEADING_A), ('A', HEADING_PLAIN)]:
            match = pattern.match(line)
            if match and int(match.group(1)) == 1 and (kind == 'B' or CHINESE.search(line) or '—' in line):
                candidates.append((i,kind,pattern)); break
    if not candidates:
        raise ValueError('no numbered meaning sections')
    start, kind, pattern = candidates[0]
    heads = []
    expected = 1
    for i in range(start,len(lines)):
        line = lines[i]
        if i > start and (line.startswith('# MCQ-ready') or line.startswith('## MCQ-ready')):
            break
        match = pattern.match(line)
        if not match:
            continue
        n = int(match.group(1))
        if n == expected:
            heads.append((i,n)); expected += 1
        elif n == 1 and heads:
            break
    if len(heads) < 2:
        raise ValueError(f'only {len(heads)} meaning section(s)')
    senses=[]; rows=[]
    for index,(line_at,n) in enumerate(heads):
        end = heads[index+1][0] if index+1<len(heads) else len(lines)
        form,title = heading_title(lines,line_at,kind)
        body = lines[line_at+1:end]
        entries=[]
        if kind == 'A':
            marks = [(j,int(m.group(1))) for j,line in enumerate(body) if (m:=PRACTICE_A.match(line))]
            for pidx,(j,pno) in enumerate(marks):
                chunk = body[j+1:marks[pidx+1][0] if pidx+1<len(marks) else len(body)]
                en,zh,raw = quoted_pair(chunk)
                if en and zh:
                    entries.append((pno,en,zh,raw))
        else:
            headers=[j for j,line in enumerate(body) if EXAMPLE_HEADER.match(line)]
            for hidx,j in enumerate(headers):
                stop = headers[hidx+1] if hidx+1<len(headers) else len(body)
                for pno,en,zh,raw in numbered_pairs(body[j+1:stop]):
                    entries.append((pno,en,zh,raw))
        if not entries:
            continue
        if not title and entries:
            found=re.search(r'\*\*([^*]*[\u3400-\u9fff][^*]*)\*\*',entries[0][2])
            if found:title=clean(found.group(1))
        sense = sense_from_block(word,n,form,title,body,kind)
        senses.append(sense)
        for pno,en,zh,raw in entries:
            rows.append((len(rows),sense['id'],en,zh,raw,pno))
            sense['examples'].append([en,zh,sense['title']])
    if not rows:
        raise ValueError('no bilingual exercise sentences')
    # Exact duplicate sentences in a PDF are one question. Ambiguous duplicates
    # under different senses are dropped and recorded for editorial review.
    seen={}; unique=[]; ambiguities=[]; duplicates=0
    for row in rows:
        key=re.sub(r'\W+','',row[2].lower())
        if key in seen:
            duplicates += 1
            if seen[key][1] != row[1]: ambiguities.append(row[2])
            continue
        seen[key]=row;unique.append(row)
    ids=[s['id'] for s in senses]
    if len(ids)<2:
        raise ValueError('fewer than two meanings')
    for i,s in enumerate(senses):
        s['options']=[ids[(i+j)%len(ids)] for j in range(min(6,len(ids)))]
    questions=[]; skipped_target=[]
    for _,sid,en,zh,raw,pno in unique:
        target=target_for(raw,en,word)
        if not target:
            skipped_target.append(en); continue
        i=ids.index(sid); opts=senses[i]['options']; title=senses[i]['title']
        masked=re.sub(re.escape(target),'____',en,count=1,flags=re.I)
        if masked==en:
            skipped_target.append(en);continue
        reasons={oid:(f'本句的意思是「{title}」。' if oid==sid else
                      f'「{senses[ids.index(oid)]["title"]}」與本句語境不同。') for oid in opts}
        questions.append({'id':f'{sid}-{sum(q["sense"]==sid for q in questions)}',
                          'sense':sid,'en':en,'zh':zh,'masked':masked,'options':opts,
                          'explanation':senses[i]['note'],'sentenceIndex':len(questions),
                          'sourcePractice':pno,'targets':[target],'optionReasons':reasons})
    if not questions:
        raise ValueError('no sentences with identifiable target words')
    return {'id':word,'word':word,'number':number,'version':1,'mass':True,'senses':senses,
            'questions':questions,'comparisons':[],
            'source':{'path':f'manuals/{word}.pdf','file':pdf.name,
                      'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),
                      'pages':len(PdfReader(pdf).pages)}}, \
           {'sourceSentences':len(rows),'duplicateSentences':duplicates,
            'ambiguousSentences':ambiguities,'missingTarget':skipped_target}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--write',action='store_true')
    args=parser.parse_args()
    existing=json.loads(subprocess.check_output(['node','--input-type=module','-e',
        "import {modules} from './polysemy-lab/catalogue.mjs'; console.log(JSON.stringify(modules.filter(m=>!m.mass).map(m=>({number:m.number,id:m.id}))))"],
        cwd=ROOT,text=True))
    known_numbers={item['number'] for item in existing}; known_ids={item['id'] for item in existing}
    by_number=defaultdict(list)
    for pdf in sorted(PDF_DIR.glob('*.pdf')):
        named=word_from_filename(pdf)
        if named:by_number[named[0]].append((pdf,named[1]))
    report={'existingModules':len(existing),'sourceFiles':sum(map(len,by_number.values())),
            'imported':[],'skipped':[],'problems':[]}
    module_index=[]
    output=ROOT/'polysemy-lab/content'
    for number,pairs in sorted(by_number.items()):
        for index,(pdf,word) in enumerate(sorted(pairs,key=lambda item:item[0].name)):
            entry={'number':number,'word':word,'file':pdf.name}
            if number in known_numbers or word in known_ids:
                report['skipped'].append(entry|{'reason':'already in system'});continue
            if index:
                report['problems'].append(entry|{'reason':'number used by '+pairs[0][0].name});continue
            try:
                text=text_of(pdf)
                if not source_matches(word,text):
                    raise ValueError('filename word does not match PDF content')
                module,stats=parse_module(number,word,pdf,text)
                if len(stats['missingTarget'])>max(5,len(module['questions'])//4):
                    raise ValueError(f'{len(stats["missingTarget"])} sentence(s) lack a reliable highlighted target')
                if args.write:
                    (output/f'{word}.mjs').write_text('export default '+json.dumps(module,ensure_ascii=False,indent=2)+';\n')
                    shutil.copy2(pdf,ROOT/'polysemy-lab/manuals'/f'{word}.pdf')
                    module_index.append({'id':word,'word':word,'number':number,'mass':True,
                                  'senses':[{'id':s['id']} for s in module['senses']],
                                  'questions':[{'id':q['id'],'sense':q['sense'],'en':q['en']}
                                               for q in module['questions']]})
                report['imported'].append(entry|{'meanings':len(module['senses']),
                    'questions':len(module['questions'])}|stats)
            except Exception as error:
                report['problems'].append(entry|{'reason':str(error)})
    target=ROOT/'polysemy-lab/import-report.json' if args.write else Path('/private/tmp/polysemy-import-preview.json')
    target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    if args.write:
        (ROOT/'polysemy-lab/mass-index.mjs').write_text('export default '+json.dumps(module_index,ensure_ascii=False,separators=(',',':'))+';\n')
    print(json.dumps({'existing':len(existing),'sources':report['sourceFiles'],
        'imported':len(report['imported']),'skipped':len(report['skipped']),
        'problems':len(report['problems']),'questions':sum(x['questions'] for x in report['imported']),
        'report':str(target)},ensure_ascii=False))
    for item in report['problems'][:35]:print(item['number'],item['word'],item['reason'])


if __name__=='__main__':main()
