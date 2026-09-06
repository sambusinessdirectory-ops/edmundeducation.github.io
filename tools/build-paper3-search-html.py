import json,re,sys,zipfile
from pathlib import Path
from html.parser import HTMLParser
payload=json.load(sys.stdin);rows=payload['rows']
class Reader(HTMLParser):
 def __init__(self): super().__init__();self.stack=[];self.skip=0;self.records=[];self.parts=[];self.anchor=''
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.stack.append((tag,a.get('id','')))
  if tag in ('script','style','nav','header','footer'):self.skip+=1
  if tag in ('p','h1','h2','h3','h4','li','td','th','label','summary','div','section','article'):self.flush()
 def handle_endtag(self,tag):
  if tag in ('p','h1','h2','h3','h4','li','td','th','label','summary','div','section','article'):self.flush()
  if tag in ('script','style','nav','header','footer'):self.skip=max(0,self.skip-1)
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==tag:self.stack=self.stack[:i];break
 def handle_data(self,text):
  if not self.skip:
   self.parts.append(text);self.anchor=next((a for _,a in reversed(self.stack) if a),'')
 def flush(self):
  text=re.sub(r'\s+',' ',' '.join(self.parts)).strip();self.parts=[]
  if len(text)>25:self.records.append((self.anchor,text))
files={}
with zipfile.ZipFile('paper3/reader-batch.zip') as z:
 for name in z.namelist():
  if re.search(r'paper3/\d{4}-b[12]/.*\.html$',name):files[name]=z.read(name).decode()
for path in [Path('dse-paper3-2025-b1-data-file.html'),*Path('paper3').rglob('*.html')]:files[str(path)]=path.read_text()
for name,html in files.items():
 match=re.search(r'(20\d{2})-b([12])',name)
 if not match:continue
 year,level=int(match[1]),'B'+match[2];parser=Reader();parser.feed(html);parser.flush()
 for anchor,text in parser.records:rows.append(dict(year=year,level=level,title='Data File / 原題目及練習',url='/'+name.replace('index.html',''),anchor=anchor,text=text))
for entry in payload['listening']:
 year=entry['year'];data=entry['data'];segments=data.get('transcript',{}).get('partB',[])
 text='\n'.join(' '.join(str(s.get(k,'')) for k in ['text','translation','zh','speaker']) for s in segments)
 if text:rows.append(dict(year=year,level='B1 / B2',title='Part B 錄音稿',material='part-b-transcript',text=text))
# All source text retained; de-duplicate exact repeats.
unique={}
for row in rows:unique[(row['year'],row['level'],row.get('url',''),row.get('material',''),row.get('anchor',''),row['text'])]=row
Path('paper3-search-index.json').write_text(json.dumps(list(unique.values()),ensure_ascii=False,separators=(',',':'))+'\n')
print(f'Indexed {len(unique)} text blocks across {len(set(r[0] for r in unique))} years')
