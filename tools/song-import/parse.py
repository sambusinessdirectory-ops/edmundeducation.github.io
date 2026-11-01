# Usage: python parse.py /path/to/staging-directory-containing-manifest.json
import sys
import json,re,hashlib,difflib,random
from pathlib import Path
import pdfplumber
O=Path(sys.argv[1]);specs=json.loads((O/'manifest.json').read_text())
def norm(s):return re.sub('[^a-z0-9]','',s.lower())
def vocab(d):
 md=Path(d['md']).read_text();out=[]
 for n,w,b in re.findall(r'## (\d+)\. ([^\n]+)\n(.*?)(?=\n## |\Z)',md,re.S):
  def get(p):
   m=re.search(p,b);assert m,(d['slug'],n,p);return m[1].strip().strip('*')
  a=ord(get(r'\*\*正確答案：([ABCD])\*\*'))-65
  opts=re.findall(r'^(?:- \*\*)?[ABCD]\.(?:\*\*)? (.+)$',b.split('<details>')[0],re.M)
  ex=re.findall(r'^- \*\*[ABCD][^*]*\*\*[：:]?\s*(.+)$',b.split('**正確答案：')[1],re.M)
  assert len(opts)==len(ex)==4,(n,opts,ex)
  out.append(dict(number=int(n),word=w,meaning=get(r'\*\*中文意思：\*\* ([^\n]+)'),usage=get(r'\*\*使用時機：\*\* ([^\n]+)'),prompt=get(r'[^\n]*(哪一句[^\n]+)'),options=[x.strip() for x in opts],answer=a,explanation=ex[a],optionExplanations=ex))
 assert len(out)==10
 return out
pat=re.compile(r'\((\d+)\)\s*\(([^()]+)\)')
def extract(d):
 rows=[];active=False;boundary=305
 with pdfplumber.open(d['pdf']) as doc:
  for page in doc.pages:
   words=page.extract_words();ls=page.extract_text_lines();last=None
   for l in ls:
    if l['text'].startswith('English') and '繁體' in l['text']:active=True;boundary=290;continue
    if not active:continue
    if l['x0']<75:active=False;continue
    ws=[w for w in words if abs(w['top']-l['top'])<4]
    cjk=[w['x0'] for w in ws if re.search(r'[\u4e00-\u9fff]',w['text'])]
    if cjk:boundary=min(cjk)-1
    # table left cell begins near x77, right cell begins near x310
    en=' '.join(w['text'] for w in ws if w['x0']<boundary);zh=''.join(w['text'] for w in ws if w['x0']>=boundary)
    if last is not None and l['top']-last<19 and rows:rows[-1]['english']+=' '+en;rows[-1]['chinese']+=zh
    else:rows.append(dict(english=en,chinese=zh))
    last=l['top']
 return rows
report=[]
for d in specs:
 slug=d['slug'];txt=(O/(slug+'.docx.txt')).read_text()
 txt=re.sub(r'\((\d+)\) \[A\. (.*?) / B\. (.*?) / C\. (.*?)\]',lambda m:'('+m[1]+') ('+'/'.join(m.group(i) for i in [2,3,4])+')',txt)
 txt=re.sub(r'  \((?:lyric )?line \d+\)','',txt).replace(' • ',' — ')
 txt=re.sub(r'(Standard|Medium|Hard|Hell) \| Multiple-Choice Listening \| (\d+) questions',r'\1 — \2 questions',txt)
 txt=re.sub(r'^(Standard|Medium|Hard|Hell)(?: Difficulty)? [·—] (?:Listening Worksheet \(|Multiple-Choice Listening · |Multiple-Choice Listening \()(\d+) questions\)?',r'\1 — \2 questions',txt,flags=re.M)
 txt=re.sub(r'(?m)^'+re.escape(d['title'])+r' — [^\n]+$','',txt)
 txt=re.sub(r'\[(\d+)\]',r'(\1)',txt)
 txt=re.sub(r'(?<=\()([ABC])\. ', '',txt)
 txt=re.sub(r' / [ABC]\. ', ' / ',txt)
 txt=re.sub(r'(?m)^(Standard|Medium|Hard|Hell) \((\d+)\)$',r'\1 — \2 answers',txt).replace('Teacher Edition — Answer Keys','Teacher Answer Keys')
 keys={};mode=None
 for line in txt.splitlines():
  m=re.match(r'^(Standard|Medium|Hard|Hell)(?:\s*[—–-]\s*(?:\d+(?: (?:[Aa]nswers|questions|items))?|Answer Key))?$',line)
  if m:mode=m[1].lower();keys.setdefault(mode,{});continue
  if not mode:continue
  m=re.match(r'\| (\d+) \| ([ABC]) \| (.*?) \|',line)
  if m:keys[mode][int(m[1])]=(ord(m[2])-65,m[3]);continue
  for part in re.split(r'\s+[•|]\s+|\s{2,}(?=\d+\.)',line):
   m=re.match(r'(\d+)\.?\s+([ABC])\s*[—–]\s*(.+)',part)
   if m:keys[mode][int(m[1])]=(ord(m[2])-65,m[3].strip())
 sections=re.split(r'(Standard|Medium|Hard|Hell)(?: Difficulty)?\s*[—–-]\s*(?:Multiple-Choice Listening \()?([0-9]+) [Qq]uestions\)?',txt.split('Teacher Answer Keys')[0])[1:]
 modes=[];issues=[];allflow=[]
 for z in range(0,len(sections),3):
  mode=sections[z].lower();count=int(sections[z+1]);block=sections[z+2];flow=[];qs=[]
  lines=block.strip().splitlines()
  while lines and (not lines[-1].strip() or norm(lines[-1]) in [norm(d['title']),norm(d['title']+' — Multiple-Choice Listening'),norm(d['title']+' — Listening Exercise')]):lines.pop()
  for raw in lines:
   raw=raw.strip()
   if 'Answer Key' in raw or raw.startswith('Teacher'):break
   if not raw or raw.startswith(('Listen and','Listen to','Instructions','Circle','Score:','Name:')) or (not flow and norm(raw) in [norm(d['title']),norm(d['title']+' — Multiple-Choice Listening'),norm(d['title']+' — Listening Exercise')]):continue
   matches=list(pat.finditer(raw));answers={}
   for m in matches:
    n=int(m[1]);opts=[x.strip() for x in m[2].split('/')];key=keys[mode][n];assert len(opts)==3,(slug,mode,n,opts);assert opts[key[0]]==key[1],(slug,mode,n,opts,key);answers[n]=key[1]
   full=pat.sub(lambda m:answers[int(m[1])],raw)
   rowid='line-'+str(len(flow)+1)
   flow.append({'lineId':rowid,'english':full,'prompt':pat.sub(lambda m:'{{q:'+m[1]+'}}',raw)})
   for m in matches:
    n=int(m[1]);qs.append(dict(number=n,lineId=rowid,prompt=pat.sub(lambda mm:'{{blank}}' if mm[1]==m[1] else answers[int(mm[1])],raw),options=[x.strip() for x in m[2].split('/')],answer=answers[n]))
  assert len(qs)==count,(slug,mode,len(qs),count)
  assert sorted(q['number'] for q in qs)==list(range(1,count+1)),(slug,mode,'numbers')
  modes.append(dict(id=mode,label=mode.title(),version=1,questionCount=count,questions=qs,listeningLines=[dict(lineId=x['lineId'],prompt=x['prompt']) for x in flow]))
  allflow.append(flow)

 table=extract(d);(O/(slug+'.translations-extracted.json')).write_text(json.dumps(table,ensure_ascii=False,indent=2))
 if slug=='faithfully':
  for r in table:r['english']=r['english'].replace('to start family','to start a family')
 translated=[dict(lineId='line-'+str(i+1),**r) for i,r in enumerate(table[1:])]
 for mode,flow in zip(modes,allflow):
  cursor=0
  for row,display in zip(flow,mode['listeningLines']):
   target=norm(row['english'])
   if row['english'].startswith('Listening detail:'):
    idx=max(0,cursor-1)
   else:
    candidates=[i for i in range(cursor,len(translated)) if norm(translated[i]['english'])==target]
    if candidates:idx=candidates[0]
    else:
     idx=max(range(cursor,len(translated)),key=lambda i:difflib.SequenceMatcher(None,target,norm(translated[i]['english'])).ratio()) if cursor<len(translated) else len(translated)-1
     issues.append(['translation-match',mode['id'],row['english'],translated[idx]['english']])
    cursor=idx+1
   old=row['lineId'];new=translated[idx]['lineId'];display['lineId']=new
   for q in mode['questions']:
    if q.get('_oldId',q['lineId'])==old:
     q['_oldId']=old;q['lineId']=new;q['promptZh']=translated[idx]['chinese']
  for q in mode['questions']:q.pop('_oldId',None)
  mode['questions'].sort(key=lambda q:q['number'])
 s=(O/(slug+'.txt')).read_text();intro=s.split('\n"')[0].replace('\n','')
 if not re.search(r'[。！？.!?][」』”\"’\')）]*$',intro.strip()):raise ValueError(f'{slug}: introduction ends mid-sentence; compare the PDF and supply a reviewed complete introduction before import')
 lesson=dict(slug=slug,title=d['title'],singer=d['singer'],exercise_name=d['title']+' · Listening & Vocabulary',description=intro,tags=[d['singer'].lower(),d['title'].lower()],translations=translated,exercises=modes,vocabulary=vocab(d),audio_url=f'https://edmundeducation.com/song-media/{slug}/album.mp3',cover_url=f'https://edmundeducation.com/song-media/{slug}/user-cover-20261030.png')
 (O/(slug+'.parsed.json')).write_text(json.dumps(lesson,ensure_ascii=False,indent=2));report.append(dict(slug=slug,rows=len(translated),tableRows=len(table),issues=issues));print(slug,len(translated),len(table),len(issues),flush=True)
(O/'parse-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
