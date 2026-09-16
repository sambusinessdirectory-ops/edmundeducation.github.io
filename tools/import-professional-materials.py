"""Import the supplied student PDFs as selectable HTML, retaining printed highlights.
Requires PyMuPDF==1.26.4. Originals are copied without re-exporting.
"""
import argparse,collections,html,json,re,shutil,unicodedata
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
SOURCES=[('Lesson 1 - Professional Lobby Communication - Revised.docx.pdf','專業大堂首次接觸及訪客應對'),('Lesson 2 - Three Garden Road Visitor Guidance.pdf','訪客指引'),('Lesson 3 - Complaint Handling and Calm Response.pdf','投訴處理與冷靜回應')]
def norm(s):return unicodedata.normalize('NFKC',s).replace('\u200b','').replace('\ufeff','')
def colour(c):return '#'+''.join(f'{round(max(0,min(1,v))*255):02x}' for v in c[:3])
def inside(rect,point):return rect.x0<=point[0]<rect.x1 and rect.y0<=point[1]<rect.y1
def extract_page(page,index):
 drawings=[(fitz.Rect(d['rect']),colour(d['fill'])) for d in page.get_drawings() if d.get('fill') and colour(d['fill'])!='#ffffff']
 tables=[]
 for candidate in sorted(page.find_tables(strategy='lines_strict').tables,key=lambda t:fitz.Rect(t.bbox).get_area(),reverse=True):
  box=fitz.Rect(candidate.bbox)
  if not any((box&fitz.Rect(t.bbox)).get_area()>.9*box.get_area() for t in tables):tables.append(candidate)
 cells=[fitz.Rect(c) for t in tables for c in t.cells if c]
 blocks=page.get_text('rawdict')['blocks'];lines=[]
 for block in blocks:
  for line in block.get('lines',[]):
   chars=[]
   for span in line['spans']:
    for c in span['chars']:
     box=fitz.Rect(c['bbox']);point=((box.x0+box.x1)/2,(box.y0+box.y1)/2)
     background=next((bg for rect,bg in sorted(drawings,key=lambda v:v[0].get_area()) if inside(rect,point)),None)
     chars.append({'text':norm(c['c']),'point':point,'bg':background,'bold':bool(span['flags']&16),'fg':f"#{span['color']:06x}",'size':span['size']})
   lines.append((fitz.Rect(line['bbox']),chars))
 def rich(rect=None,exclude_tables=False):
  rendered=[]
  for _,chars in lines:
   chosen=[c for c in chars if (rect is None or inside(rect,c['point'])) and (not exclude_tables or not any(inside(cell,c['point']) for cell in cells))]
   if not chosen or not ''.join(c['text'] for c in chosen).strip():continue
   runs=[]
   for c in chosen:
    style=(c['bg'],c['bold'],c['fg'])
    if runs and runs[-1][0]==style:runs[-1][1]+=c['text']
    else:runs.append([style,c['text']])
   rendered.append(''.join(('<mark' if bg else '<span')+f' style="'+(';'.join(([f'background-color:{bg}'] if bg else [])+([f'color:{fg}'] if fg!='#000000' else ['color:#111'])+(['font-weight:700'] if bold else [])))+'">'+html.escape(text)+('</mark>' if bg else '</span>') for (bg,bold,fg),text in runs))
  return '<br>'.join(rendered)
 chunks=[]
 for table in tables:
  xs=sorted(set(round(v,1) for c in table.cells if c for v in [c[0],c[2]]));ys=sorted(set(round(v,1) for c in table.cells if c for v in [c[1],c[3]]));bypos={};covered=set()
  for c in table.cells:
   if not c:continue
   rect=fitz.Rect(c);x0=min(range(len(xs)),key=lambda i:abs(xs[i]-rect.x0));x1=min(range(len(xs)),key=lambda i:abs(xs[i]-rect.x1));y0=min(range(len(ys)),key=lambda i:abs(ys[i]-rect.y0));y1=min(range(len(ys)),key=lambda i:abs(ys[i]-rect.y1));bypos[y0,x0]=(rect,x1-x0,y1-y0)
   covered.update((y,x) for y in range(y0,y1) for x in range(x0,x1) if (y,x)!=(y0,x0))
  rows=[]
  for y in range(len(ys)-1):
   row=[]
   for x in range(len(xs)-1):
    if (y,x) in covered:continue
    cell=bypos.get((y,x))
    if cell:
     rect,colspan,rowspan=cell;row.append(f'<td colspan="{colspan}" rowspan="{rowspan}">{rich(rect)}</td>')
    else:row.append('<td></td>')
   rows.append('<tr>'+''.join(row)+'</tr>')
  chunks.append((table.bbox[1],'<div class="material-table-scroll" tabindex="0" aria-label="課文表格，可橫向捲動"><table class="material-table"><tbody>'+''.join(rows)+'</tbody></table></div>'))
 for block in blocks:
  if 'lines' not in block:continue
  rect=fitz.Rect(block['bbox']);content=rich(rect,True)
  if content:
   size=max((s['size'] for line in block['lines'] for s in line['spans']),default=10)
   tag='h3' if size>=17 else 'p';chunks.append((rect.y0,f'<{tag}>{content}</{tag}>'))
 text=norm(page.get_text());footer=re.findall(r'Page\s+(\d+)(?:\s+of\s+\d+)?',text)
 return {'page':index,'label':footer[-1] if footer else str(index),'text':text,'html':''.join(c for _,c in sorted(chunks,key=lambda x:x[0]))}
def forms(word):
 base=word.get('baseWord') or word['word'];values={base,*re.split(r'\s*/\s*',word['word'])};irregular={'say':['said','says'],'understand':['understood'],'take':['took','taken'],'leave':['left'],'hold':['held'],'stand':['stood'],'run':['ran','running'],'make':['made'],'keep':['kept'],'bring':['brought'],'send':['sent']}
 for form in list(values):
  values.update(irregular.get(form,[]))
  if re.fullmatch('[a-z]+',form):
   values.update([form+'s',form+'ed',form+'ing'])
   if form.endswith('e'):values.update([form+'d',form[:-1]+'ing'])
   if form.endswith('y'):values.update([form[:-1]+'ies',form[:-1]+'ied'])
 return values
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--source-dir',type=Path,default=Path.home()/'Downloads');args=parser.parse_args()
 output=ROOT/'professional-english/content';materials=ROOT/'professional-english/materials';materials.mkdir(exist_ok=True)
 result=[]
 for lesson,(name,title) in enumerate(SOURCES,1):
  source=args.source_dir/name;doc=fitz.open(source);pdf=f'materials/lesson-{lesson}.pdf';shutil.copyfile(source,ROOT/'professional-english'/pdf)
  pages=[extract_page(page,i+1) for i,page in enumerate(doc)];entry={'lesson':lesson,'title':title,'sourceName':name,'pdf':pdf,'pages':pages};result.append(entry)
  polyPath=output/f'lesson-{lesson}-polysemy.json';poly=json.loads(polyPath.read_text());missing=[]
  for word in poly['words']:
   pattern=re.compile(r'(?<![A-Za-z])(?:'+'|'.join(re.escape(f) for f in sorted(forms(word),key=len,reverse=True))+r')(?![A-Za-z])',re.I)
   page=next((p for p in pages if pattern.search(p['text'])),None)
   word['source']=({'lesson':lesson,'page':page['page'],'label':page['label'],'pdf':pdf} if page else {'lesson':lesson,'page':None,'label':None,'pdf':pdf})
   if not page:missing.append(word['word'])
  polyPath.write_text(json.dumps(poly,ensure_ascii=False,indent=2)+'\n')
  print('Lesson',lesson,'pages',len(pages),'highlight segments',sum(p['html'].count('<mark') for p in pages),'unmatched polysemy',missing)
 (output/'lesson-materials.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 from html.parser import HTMLParser
 class Highlights(HTMLParser):
  def __init__(self):super().__init__();self.current=None;self.entries=[]
  def handle_starttag(self,tag,attrs):
   if tag=='mark':
    bg=re.search(r'background-color:(#[0-9a-f]{6})',dict(attrs).get('style',''))
    if bg and bg[1] in ('#ffe599','#f9cb9c','#ffff00'):self.current=[bg[1],'']
  def handle_data(self,text):
   if self.current:self.current[1]+=text
  def handle_endtag(self,tag):
   if tag=='mark' and self.current:self.entries.append(self.current);self.current=None
 dialogues=(ROOT/'professional-english/dialogues.js').read_text();dialogues=json.loads(dialogues[dialogues.index('=')+1:].strip().rstrip(';'))
 ranges={}
 for lesson in result:
  parser=Highlights();parser.feed(''.join(p['html'] for p in lesson['pages']))
  phrases=sorted({(bg,text.strip()) for bg,text in parser.entries if len(text.strip())>=3},key=lambda p:len(p[1]),reverse=True)
  for dialogue in dialogues:
   if dialogue['lesson']!=lesson['lesson']:continue
   for index,line in enumerate(dialogue['lines']):
    found=[];occupied=set()
    for bg,text in phrases:
     pattern=re.escape(text.replace('’',"'")).replace(r"\ ",r"\s+").replace("'","['’]")
     for match in re.finditer(r'(?<![A-Za-z])'+pattern+r'(?![A-Za-z])',line['en'],re.I):
      span=set(range(match.start(),match.end()))
      if not span&occupied:found.append({'start':match.start(),'end':match.end(),'colour':bg});occupied.update(span)
    if found:ranges[f"{dialogue['id']}:{index}"]=sorted(found,key=lambda r:r['start'])
 (output/'dialogue-highlights.json').write_text(json.dumps(ranges,ensure_ascii=False,indent=2)+'\n')
 print('Dialogue lines with matching original teaching highlights:',len(ranges))
