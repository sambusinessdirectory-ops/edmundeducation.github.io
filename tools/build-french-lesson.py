"""Import supplied French PDFs as lesson data; document instructions are not executed."""
from pathlib import Path
import re,json,os
import pdfplumber
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
SRC=Path(os.environ.get('FRENCH_LESSON_SOURCE',str(Path.home()/'Downloads')))
OUT=Path('/tmp/french-lesson');OUT.mkdir(exist_ok=True)
def source(fragment):return next(SRC.glob('French 1 - '+fragment+'*.pdf'))
def norm(s):return re.sub(r'\s+',' ',s).strip()
def extract(p):return '\n'.join(x.extract_text(extraction_mode='layout') for x in PdfReader(p).pages)
TITLE='French 1 - Ni sur le plan de travail, ni dans le four, le fondant au chocolat se conserve beaucoup mieux à cet endroit'
cards=[]
with pdfplumber.open(source('Flash')) as doc:
 for page_num,page in enumerate(doc.pages,1):
  for table in page.extract_tables():
   for row in table:
    assert len(row)==2 and all(row),(page_num,row)
    front,back=row;fs=re.split(r'\n[1-5]\.\s*',front);bs=re.split(r'\n[1-5]\.\s*',back)
    assert len(fs)==len(bs)==6,(page_num,len(fs),len(bs))
    title=norm(fs[0]);header=bs[0].splitlines();assert norm(header[0])==title
    examples=[]
    for fr,tri in zip(fs[1:],bs[1:]):
     fr=norm(fr);tri=norm(tri);assert tri.startswith(fr),(title,fr,tri)
     rest=tri[len(fr):].strip();mark=rest.index('(')
     examples.append({'en':fr,'translation':rest[:mark].strip(),'zh':rest[mark:].strip()})
    cards.append({'front':title,'meaning':'\n'.join(header[1:]),'examples':examples,'sourcePage':page_num})
text=extract(source('Translation')).replace('\f','')
units=[]
for m in re.finditer(r'Français:\s*(.*?)\s*English:\s*(.*?)\s*繁體中文:\s*(.*?)(?=\n\s*\n|\n\s*Français:|$)',text,re.S):
 units.append({'english':norm(m[1]),'translationEn':norm(m[2]),'chinese':norm(m[3])})
heading={'english':'Ni sur le plan de travail, ni dans le four : le fondant au chocolat se conserve beaucoup mieux à cet endroit','translationEn':'Neither on the Counter nor in the Oven: Chocolate Fondant Keeps Much Better in This Spot','chinese':'既不是放在流理台上，也不是放進烤箱：巧克力熔岩蛋糕放在這裡保存更好'}
all_units=[heading]
for u in units:
 if u['english'].startswith('La présence'):
  all_units.append({'english':'Pourquoi un gâteau bien cuit peut rester à température ambiante','translationEn':'Why a Fully Baked Cake Can Be Kept at Room Temperature','chinese':'為什麼完全烤熟的蛋糕可以放在室溫下保存'})
 if u['english'].startswith('Avec le fondant'):
  all_units.append({'english':'Le fondant au chocolat devrait aller au réfrigérateur','translationEn':'Chocolate Fondant Should Be Kept in the Refrigerator','chinese':'巧克力熔岩蛋糕應該放進冰箱保存'})
 all_units.append(u)
canonical='\n\n'.join(x['english'] for x in all_units)
TOKEN=re.compile(r'[\w]+(?:[’\x27][\w]+)*',re.UNICODE);MARK=re.compile(r'\((\d+)\)')
canonical_tokens=TOKEN.findall(canonical)
text=extract(source('Fill')).replace('\f','')
heads=list(re.finditer(r'(?m)^\s*(\d+)\. Niveau (Standard|Moyen|Difficile|Enfer) — Mode [^\n]+',text));assert len(heads)==16,len(heads)
sheets={int(m[1]):text[m.end():heads[i+1].start() if i+1<len(heads) else len(text)].strip() for i,m in enumerate(heads)}
variants=[]
for number,key,zh in [(2,'standard','標準'),(6,'medium','中等'),(10,'hard','困難'),(14,'hell','地獄')]:
 s=sheets[number];masked=MARK.sub(lambda m:' '*len(m[0]),s);ts=list(TOKEN.finditer(masked))
 assert len(ts)==len(canonical_tokens),(number,len(ts),len(canonical_tokens))
 for i,(t,c) in enumerate(zip(ts,canonical_tokens)):
  pattern=re.sub('_+',r'[^\\W_]*',re.escape(t[0].replace('’',"'")))
  assert re.fullmatch(pattern,c.replace('’',"'"),re.I),(number,i,t[0],c)
 # Source markers delimit each selected phrase, including unmasked single-letter
 # words inside it. Trailing literal words belong to the following prose.
 spans=[]
 for mark in MARK.finditer(s):
  start=next(i for i,t in enumerate(ts) if t.start()>=mark.end());end=start
  while end<len(ts) and ('_' in ts[end][0] or len(ts[end][0])==1):
   if end>start and MARK.search(s[ts[end-1].end():ts[end].start()]):break
   end+=1
  while end>start+1 and '_' not in ts[end-1][0]:end-=1
  end=max(start+1,end)
  a,b=ts[start].start(),ts[end-1].end();answer=s[a:b]
  for j in reversed(range(start,end)):answer=answer[:ts[j].start()-a]+canonical_tokens[j]+answer[ts[j].end()-a:]
  spans.append((mark.start(),b,norm(answer)))
 def restore(a,b):
  fragment=s[a:b]
  for i in reversed(range(len(ts))):
   t=ts[i]
   if a<=t.start() and t.end()<=b:fragment=fragment[:t.start()-a]+canonical_tokens[i]+fragment[t.end()-a:]
  return norm(fragment)
 paragraphs=[];parts=[];pos=0
 for a,b,answer in spans+[(len(s),len(s),None)]:
  raw=s[pos:a];offset=pos
  for j,chunk in enumerate(re.split(r'\n\s*\n',raw)):
   if j and parts:paragraphs.append({'label':f'Part {len(paragraphs)+1}','sentences':[{'parts':parts}]});parts=[]
   loc=s.find(chunk,offset);offset=loc+len(chunk);clean=restore(loc,offset)
   if clean:parts.append(' '+clean+' ')
  if answer is not None:parts.append({'answer':answer})
  pos=b
 if parts:paragraphs.append({'label':f'Part {len(paragraphs)+1}','sentences':[{'parts':parts}]})
 variants.append({'key':key,'title':key.title()+' Difficulty','titleZh':zh,'answers':[a for _,_,a in spans],'sourceParagraphs':paragraphs})
paragraphs=json.loads(json.dumps(variants[0]['sourceParagraphs']))
for p in paragraphs:
 for sentence in p['sentences']:sentence['parts']=[part['answer'] if isinstance(part,dict) else part for part in sentence['parts']]
exercise={'id':'french-1-fondant-au-chocolat','title':TITLE,'exam':'French','taskType':'Food and Cooking','practiceModes':['blank','start','end','both'],'paragraphs':paragraphs,'translationSections':[{'title':'Français · English · 繁體中文','items':all_units}],'translation':[],'practiceDifficultySets':variants}
data={'title':TITLE,'deckId':'food-cooking/french-1-fondant-au-chocolat','cards':cards,'exercise':exercise}
ROOT.joinpath('french-1-fondant-data.js').write_text('window.EDMUND_FRENCH_LESSON = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
print('Cards:',len(cards),'translations:',len(all_units),'blank counts:',[len(x['answers']) for x in variants])
