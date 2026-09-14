"""Import the supplied multilingual cards and recover worksheet blanks from source evidence."""
from pathlib import Path
import re,json,collections,functools,os
import pdfplumber
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
SRC=Path(os.environ.get('ITALIAN_LESSON_SOURCE',str(Path.home()/'Downloads')))
BASE=Path('/tmp/italian-lesson');BASE.mkdir(parents=True,exist_ok=True)
TITLE='Italian 1 - Burro montato - il trucco per trasformarlo in una nuvola'
def norm(s):return re.sub(r'\s+',' ',s).strip()
cards=[]
with pdfplumber.open(SRC/(TITLE+'.pdf')) as doc:
 for page_num,page in enumerate(doc.pages,1):
  for table in page.extract_tables():
   for front,back in table:
    fs=re.split(r'\n[1-5]\.\s*',front);bs=re.split(r'\n[1-5]\.\s*',back)
    assert len(fs)==len(bs)==6,(page_num,len(fs),len(bs))
    title=norm(fs[0]);header=bs[0].splitlines();assert norm(header[0])==title
    examples=[]
    for it,tri in zip(fs[1:],bs[1:]):
     it=norm(it);tri=norm(tri);assert tri.startswith(it),(title,it,tri)
     enzh=tri[len(it):].strip();mark=enzh.index('(')
     examples.append({'en':it,'translation':enzh[:mark].strip(),'zh':enzh[mark:].strip()})
    cards.append({'front':title,'meaning':'\n'.join(header[1:]),'examples':examples,'sourcePage':page_num})
translations='\n'.join(p.extract_text(extraction_mode='layout') for p in PdfReader(SRC/'Italian 1 - Translations.pdf').pages)
translation_items=[]
for m in re.finditer(r'Italiano:\s*(.*?)\s*English:\s*(.*?)\s*繁體中文:\s*(.*?)(?=\n\s*\n|$)',translations,re.S):
 translation_items.append({'english':norm(m[1]),'translationEn':norm(m[2]),'chinese':re.sub(r'\s+','',m[3])})
assert len(translation_items)==34,len(translation_items)
bullets=re.findall(r'^\s*●\s*(.+)$',translations,re.M)
assert len(bullets)==33
for i in range(0,len(bullets),3):
 translation_items.append({'english':norm(bullets[i]),'translationEn':norm(bullets[i+1]),'chinese':norm(bullets[i+2])})

# Each first-letter sheet is recovered against the other 15 sheets, the supplied
# translations and flashcards. Ambiguous tokens stop the build for review.
text='\n'.join(p.extract_text(extraction_mode='layout') for p in PdfReader(SRC/'Italian 1 - Fill in the blanks.pdf').pages)
HEAD=re.compile(r'(?m)^\s*(\d+)\.\s+(Standard|Medium|Hard|Hell)\s+Difficulty[^\n]*')
heads=list(HEAD.finditer(text));assert len(heads)==16
sheets={int(m[1]):text[m.end():heads[i+1].start() if i+1<len(heads) else len(text)].strip() for i,m in enumerate(heads)}
TOKEN=re.compile(r'[^\W_]+(?:[’\x27][^\W_]+)*|[\w]+(?:[’\x27][\w]+)*',re.UNICODE)
# Keep underscores in one token, including accented Italian letters.
TOKEN=re.compile(r'[\w]+(?:[’\x27][\w]+)*',re.UNICODE)
MARK=re.compile(r'\((\d+)\)')
def tokens(s):return list(TOKEN.finditer(MARK.sub(lambda m:' '*len(m[0]),s)))
def val(s):return s.lower().replace('’',"'")
@functools.lru_cache(None)
def compat(a,b):
 a=val(a);b=val(b)
 if a==b:return True
 if '_' not in a and '_' not in b:return False
 if '_' in a and '_' in b:return a.strip('_')=='' or b.strip('_')=='' or len(a)==len(b) and all(x==y or '_' in (x,y) for x,y in zip(a,b))
 if '_' in b:a,b=b,a
 return bool(re.fullmatch(re.sub(r'_+',r'[^\\W_]*',re.escape(a)),b))
def align(aa,bb):
 rows=[];prev=[0]*(len(bb)+1)
 for i,a in enumerate(aa,1):
  cur=[i*2]+[0]*len(bb);dirs=bytearray(len(bb)+1)
  for j,b in enumerate(bb,1):
   choices=(prev[j-1]+(0 if compat(a,b) else 3),prev[j]+2,cur[j-1]+2)
   cur[j]=min(choices);dirs[j]=choices.index(cur[j])
  rows.append(dirs);prev=cur
 j=min(range(max(1,len(aa)-100),len(bb)+1),key=lambda j:prev[j]) if len(bb)>=len(aa)-100 else len(bb)
 cost=prev[j];i=len(aa);mapping={}
 while i>0 and j>0:
  d=rows[i-1][j]
  if d==0:mapping[i-1]=j-1;i-=1;j-=1
  elif d==1:i-=1
  else:j-=1
 return mapping,cost
corpus=' '.join(c['front']+' '+' '.join(x['en'] for x in c['examples']) for c in cards)+' '+translations
words=collections.Counter(TOKEN.findall(corpus))
for s in sheets.values():words.update(w[0] for w in tokens(s) if '_' not in w[0])
variants={};missing=[];canonical_tokens=None
for num in [2,6,10,14]:
 s=sheets[num];ts=tokens(s);aa=[w[0] for w in ts];resolved={i:a for i,a in enumerate(aa) if '_' not in a}
 candidates=[TOKEN.findall(' '.join(x['english'] for x in translation_items))]+[[w[0] for w in tokens(sheets[n])] for n in [2,6,10,14,3,4,7,8,11,12,15,16] if n!=num]
 for bb in candidates:
  mp,cost=align(aa,bb)
  for i,j in mp.items():
   if i not in resolved and '_' not in bb[j] and compat(aa[i],bb[j]):resolved[i]=bb[j]
 # Reviewed against the supplied translation PDF: title and recipe ingredient
 # words masked in all sixteen sheets, plus two fully masked adjectives.
 reviewed={8:'nuvola',152:'aromatizzate',160:'burro',161:'morbido',165:'acqua',166:'frizzante',168:'bel',169:'pizzico',171:'sale',227:'spumoso',266:'zucchero',267:'semolato',271:'baccello',273:'vaniglia',383:'tostato'}
 for i,value in reviewed.items():
  assert compat(aa[i],value),(num,i,aa[i],value)
  resolved[i]=value
 for i,a in enumerate(aa):
  if i in resolved:continue
  options=[w for w in words if compat(a,w)]
  if len({val(w) for w in options})==1:resolved[i]=max(options,key=words.get)
  else:missing.append({'sheet':num,'index':i,'mask':a,'options':options[:30],'context':' '.join(aa[max(0,i-5):i+6])})
 if canonical_tokens is not None:
  assert len(aa)==len(canonical_tokens)
  for i,w in enumerate(canonical_tokens):
   assert compat(aa[i],w),(num,i,aa[i],w)
   resolved[i]=w
 else:
  # All first-letter editions have the same token sequence. Literal tokens in
  # any edition provide stronger evidence than alignment to translated prose.
  for othernum in [2,6,10,14]:
   other=[w[0] for w in tokens(sheets[othernum])];assert len(other)==len(aa)
   for i,w in enumerate(other):
    if '_' not in w and compat(aa[i],w):resolved[i]=w
  canonical_tokens=[resolved.get(i,a) for i,a in enumerate(aa)]
 replacements=[]
 for i,w in enumerate(ts):
  if '_' in w[0]:
   value=resolved.get(i,w[0]);value=value[:1].upper()+value[1:] if w[0][0].isupper() else value[:1].lower()+value[1:]
   replacements.append((w.start(),w.end(),value))
 # Replace blanks as objects before losing source offsets; spans follow the supplied numbered boundaries.
 spans=[]
 for m in MARK.finditer(s):
  start=next(i for i,w in enumerate(ts) if w.start()>=m.end());end=start
  while end<len(ts) and ('_' in aa[end] or len(aa[end])==1):
   if end>start and MARK.search(s[ts[end-1].end():ts[end].start()]):break
   end+=1
  while end>start+1 and '_' not in aa[end-1]:end-=1
  end=max(start+1,end)
  a,b=ts[start].start(),ts[end-1].end();fragment=s[a:b]
  for x,y,v in reversed(replacements):
   if a<=x and y<=b:fragment=fragment[:x-a]+v+fragment[y-a:]
  spans.append((m.start(),b,norm(fragment)))
 parts=[];pos=0
 def restore(segment,start):
  for a,b,v in reversed(replacements):
   if start<=a and b<=start+len(segment):segment=segment[:a-start]+v+segment[b-start:]
  return re.sub(r'\s+',' ',segment)
 for a,b,answer in spans:
  if a>pos:parts.append(restore(s[pos:a],pos)+' ')
  parts.append({'answer':answer});pos=b
 if pos<len(s):parts.append(' '+restore(s[pos:],pos))
 # Split by source paragraph boundaries while retaining exact blank objects.
 paragraphs=[];buf=[];pos=0
 for a,b,answer in spans:
  raw=s[pos:a];chunks=re.split(r'\n\s*\n',raw)
  offset=pos
  for j,c in enumerate(chunks):
   if j and buf:paragraphs.append({'label':f'Part {len(paragraphs)+1}','sentences':[{'parts':buf}]});buf=[]
   clean=restore(c,s.find(c,offset));offset=s.find(c,offset)+len(c)
   if clean:buf.append(clean+' ')
  buf.append({'answer':answer});pos=b
 raw=s[pos:];chunks=re.split(r'\n\s*\n',raw)
 for j,c in enumerate(chunks):
  if j and buf:paragraphs.append({'label':f'Part {len(paragraphs)+1}','sentences':[{'parts':buf}]});buf=[]
  if norm(c):buf.append(' '+restore(c,s.find(c,pos)))
 if buf:paragraphs.append({'label':f'Part {len(paragraphs)+1}','sentences':[{'parts':buf}]})
 variants[num]={'answers':[x[2] for x in spans],'sourceParagraphs':paragraphs}
BASE.joinpath('unresolved.json').write_text(json.dumps(missing,ensure_ascii=False,indent=2))
BASE.joinpath('recovered.json').write_text(json.dumps(variants,ensure_ascii=False,indent=2))
print('cards',len(cards),'translations',len(translation_items),'unresolved',len(missing),'counts',[len(v['answers']) for v in variants.values()])
if missing:raise SystemExit('Resolve ambiguous source words before publishing')
paragraphs=variants[2]['sourceParagraphs']
paragraphs=json.loads(json.dumps(paragraphs))
for p in paragraphs:
 for sentence in p['sentences']:sentence['parts']=[part['answer'] if isinstance(part,dict) else part for part in sentence['parts']]
exercise={'id':'italian-1-burro-montato','title':TITLE,'exam':'Italian','taskType':'Food and Cooking','practiceModes':['blank','start','end','both'],'paragraphs':paragraphs,'translationSections':[{'title':'Italiano · English · 繁體中文','items':translation_items}], 'translation':[], 'practiceDifficultySets':[{'key':key,'title':key.title()+' Difficulty','titleZh':zh,**variants[num]} for key,zh,num in [('standard','標準',2),('medium','中等',6),('hard','困難',10),('hell','地獄',14)]]}
data={'title':TITLE,'deckId':'food-cooking/italian-1-burro-montato','cards':cards,'exercise':exercise}
ROOT.joinpath('italian-1-burro-montato-data.js').write_text('window.EDMUND_ITALIAN_LESSON = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
