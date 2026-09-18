#!/usr/bin/env python3
import json,re,hashlib,shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/'tmp/pdfs/polysemy-16-32/raw'
META={r['module']:r for r in json.loads((ROOT/'tmp/pdfs/polysemy-16-32/sources.json').read_text())}
NAMES={16:'promise',17:'people',18:'pack',19:'ordinary',20:'present',21:'background',22:'world',23:'image',24:'time',25:'button',26:'outside',27:'small',28:'sell',29:'everyday',30:'practice',31:'comfort',32:'life'}
SOURCE_DIR=Path('/Users/sammak/Desktop/Polysemy Exercise')

def clean(s):
 s=s.replace('\f',' ').replace('**','').replace('`','').strip()
 s=re.sub(r'^>\s*','',s);s=re.sub(r'\s+',' ',s)
 return s.strip(' \n\t“”"')

def heading_parts(text):
 text=text.replace('\f','\n')
 # Sequential numbering isolates the lexical inventory; later comparison lists restart.
 rx=re.compile(r'(?m)^#\s*(\d+)\.\s*(.+)$|^(\d+)\.\s+([^\n]+)$')
 out=[]
 for m in rx.finditer(text):
  n=int(m.group(1) or m.group(3)); title=(m.group(2) or m.group(4)).strip()
  if n!=len(out)+1: continue
  if title.count('**')%2:
   continuation=text[m.end():].split('**',1)[0]
   title+=' '+continuation
  title=clean(title)
  out.append((n,title,m.start(),m.end()))
 return text,out

def split_title(h):
 h=re.sub(r'^\*\*|\*\*$','',h)
 parts=re.split(r'\s+[—–]\s+',h,maxsplit=1)
 form=clean(parts[0]); title=clean(parts[1] if len(parts)>1 else parts[0])
 title=re.sub(r'^.+?（[^）]+）\s*','',title)
 return form,title

def practices(block):
 ms=list(re.finditer(r'(?m)^#{0,3}\s*Practice\s+(\d+)\b[^\n]*',block))
 out=[]
 for i,m in enumerate(ms):
  body=block[m.end():ms[i+1].start() if i+1<len(ms) else len(block)]
  lines=[x.strip() for x in body.replace('\f','\n').splitlines() if x.strip()]
  en=''; zh=''
  # First quoted English line(s), then first Chinese line; tolerate PDF line wraps.
  for j,line in enumerate(lines):
   c=clean(line)
   if not en and re.search(r'[A-Za-z]',c) and not c.startswith(('Meaning:','Note:')):
    en=c
    k=j+1
    while k<len(lines) and not re.search(r'[。！？」』]|[\u4e00-\u9fff]',lines[k]):
     en+=' '+clean(lines[k]);k+=1
    for line2 in lines[k:]:
     c2=clean(line2)
     if re.search(r'[\u4e00-\u9fff]',c2): zh=c2.strip('「」');break
    break
  en=clean(en); zh=clean(zh)
  # Do not absorb the explanatory definition after a sentence.
  en=re.split(r'\n|\*\*[^*]+=|\s{2,}',en)[0].strip()
  if en and zh: out.append((int(m.group(1)),en,zh))
 return out

def targets(en,word):
 fam={
 'promise':r'promis(?:e|es|ed|ing)|promising', 'people':r'people|peoples|persons?|personal(?:ly|ity|ities)?|personnel',
 'pack':r'pack(?:s|ed|ing|age|ages|aged|aging|er|ers)?|packet(?:s)?','ordinary':r'extraordinary|ordinarily|ordinary',
 'present':r'present(?:s|ed|ing|ation|ations|er|ers)?','background':r'backgrounds?|backgrounded|backgrounding|foregrounds?',
 'world':r'worlds?|worldwide|worldly','image':r'images?|imagery|imaging|imagine|imaginations?|imaginary','time':r'times?|timed|timing|timely',
 'button':r'buttons?|buttoned|buttoning','outside':r'outsides?|outsider(?:s)?','small':r'smaller|smallest|smallness|small',
 'sell':r'sells?|sold|selling|seller(?:s)?|sellout(?:s)?|sales?|salesperson(?:s)?|bestseller(?:s)?|best-selling','everyday':r'everyday|every day|daily',
 'practice':r'practice|practices|practiced|practicing|practise|practises|practised|practising|practical(?:ly|ity|ities)?|practicable|practitioner(?:s)?','comfort':r'comfort(?:s|ed|ing|able|ably|less)?',
 'life':r'lives|lifelong|lifetime|lifestyle|lifelike|lifeless|life'
 }[word]
 found=list(re.finditer(r'\b(?:'+fam+r')\b',en,re.I))
 return [m.group(0) for m in found] or [word]

def make_module(num,word):
 text=(SRC/f'{num}.txt').read_text(errors='replace').replace('\f','\n')
 clipped,heads=heading_parts(text)
 senses=[]; allp=[]
 for i,(n,h,start,end) in enumerate(heads):
  body=clipped[end:heads[i+1][2] if i+1<len(heads) else len(clipped)]
  form,title=split_title(h)
  mm=re.search(r'\*\*Meaning:\*\*\s*(.+?)(?=\n#{0,3}\s*Practice|\n\*\*繁體中文|$)',body,re.S)
  if not mm: mm=re.search(r'(?m)^Meaning:\s*(.+)$',body)
  meaning=clean(mm.group(1)) if mm else form
  ps=practices(body)
  sid=f'{word}-{n:02d}'
  senses.append({'id':sid,'title':title,'form':form,'en':meaning,'zh':title,'note':f'留意搭配：{form}。這裡著重「{title}」。','examples':[[en,zh,title] for _,en,zh in ps],'options':[],'excludedOverlaps':[]})
  allp.extend((pn,sid,en,zh,n) for pn,en,zh in ps)
 # Preserve useful quoted examples which the manuals intentionally leave unnumbered.
 if word=='button':
  allp += [(15.1,'button-08',"The baby’s belly button has healed.",'寶寶的肚臍已經癒合。',8),(15.2,'button-08',"The scar is just below her belly button.",'疤痕就在她的肚臍下方。',8)]
 # Everyday has four lexical senses, but the manual explicitly teaches these two contrasts.
 if word=='everyday':
  senses += [
   {'id':'everyday-05','title':'每天；每一日（兩個字）','form':'every day','en':'On each day; expressing frequency.','zh':'每天；表示事情發生的頻率。','note':'every day 是兩個字，表示「每天」。','examples':[],'options':[],'excludedOverlaps':[]},
   {'id':'everyday-06','title':'每日發生或製作的','form':'daily','en':'Happening or produced every day.','zh':'每日發生、進行或製作的。','note':'daily 著重每日頻率。','examples':[],'options':[],'excludedOverlaps':[]}
  ]
 ids=[s['id'] for s in senses]
 for i,s in enumerate(senses): s['options']=[s['id']]+[ids[(i+j)%len(ids)] for j in range(1,len(ids))][:5]
 questions=[]
 for sentence_index,(pn,sid,en,zh,sense_no) in enumerate(sorted(allp)):
  i=ids.index(sid); opts=[sid]+[ids[(i+j)%len(ids)] for j in range(1,len(ids))][:5]
  ts=targets(en,word); masked=en
  for t in ts: masked=masked.replace(t,'____',1)
  reasons={oid:(f'本句應理解為「{next(s["title"] for s in senses if s["id"]==oid)}」。' if oid==sid else f'「{next(s["title"] for s in senses if s["id"]==oid)}」與本句語境不同。') for oid in opts}
  questions.append({'id':f'{sid}-{sum(1 for q in questions if q["sense"]==sid)}','sense':sid,'en':en,'zh':zh,'masked':masked,'options':opts,'explanation':next(s['note'] for s in senses if s['id']==sid),'sentenceIndex':sentence_index,'sourcePractice':pn,'targets':ts,'optionReasons':reasons})
 meta=META[num]
 return {'id':word,'word':word,'number':num,'version':1,'senses':senses,'questions':questions,'comparisons':[],'source':{'path':f'manuals/{word}.pdf','file':meta['file'],'sha256':meta['sha256'],'pages':meta['pages']}},heads

def main():
 report=[]
 manuals=ROOT/'polysemy-lab/manuals';manuals.mkdir(exist_ok=True)
 for num,word in NAMES.items():
  mod,heads=make_module(num,word)
  path=ROOT/'polysemy-lab/content'/f'{word}.mjs'
  path.write_text('export default '+json.dumps(mod,ensure_ascii=False,indent=2)+';\n')
  src=SOURCE_DIR/META[num]['file'];shutil.copy2(src,manuals/f'{word}.pdf')
  report.append({'number':num,'id':word,'senses':len(mod['senses']),'questions':len(mod['questions']),'practiceNumbers':[q['sourcePractice'] for q in mod['questions']]})
 (ROOT/'tmp/pdfs/polysemy-16-32/import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps([{k:v for k,v in r.items() if k!='practiceNumbers'}|{'missing':sorted(set(range(1,max(r['practiceNumbers'] or [0])+1))-set(r['practiceNumbers']))} for r in report],ensure_ascii=False,indent=2))

if __name__=='__main__':main()
