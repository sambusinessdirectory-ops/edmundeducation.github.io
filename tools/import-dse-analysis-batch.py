"""Lossless source import for the supplied 2023 B / 2024 / 2025 analyses.

Page boundaries are reviewed against the actual paper questions. The source's
missing dedicated 2025 A Q15 explanation is represented as references, not filled.
PDFs and raster assets stay outside Git and are published through verified R2 packs.
"""
import argparse, collections, concurrent.futures, hashlib, importlib.util
import json, logging, re, shutil, time
from pathlib import Path
import pdfplumber

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location('legacy_deep_import',ROOT/'tools/import-dse-deep-analysis.py')
LEGACY=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(LEGACY)
VERSION='20261018-analysis-batch-v1'
CONFIG={
 'dse-2023-b1':dict(source='Edmund Sir - 2023 Reading B1 - Question Analysis.pdf',first=23,starts=[29,34,42,48,54,59,63,67,73,77,83,88,91,95,100,103,121,137,148,168,180,192,210],answerPages=[28]),
 'dse-2023-b2':dict(source='Edmund Sir - 2023 Reading B2 - Question Analysis.pdf',first=46,starts=[32,34,36,43,54,62,69,78,89,93,100,105,113,118,123,130,136,143,149,153,161,175,180,188]),
 'dse-2024-a':dict(source='Edmund Sir - 2024 Reading A - Question Analysis.pdf',first=1,starts=[28,39,47,51,55,64,68,72,75,79,83,91,97,138,141,144,148,151,157,160,163,167,171]),
 'dse-2024-b1':dict(source='Edmund Sir - 2024 Reading B1 - Question Analysis.pdf',first=24,starts=[30,35,42,50,57,63,70,76,83,91,98,106,112,121,126,132,135,144,152],answerPages=[29],variants=['Edmund Sir - 2024 Reading B1 - Question Analysis-1.pdf']),
 'dse-2024-b2':dict(source='Edmund Sir - 2024 Reading B2 - Question Analysis-1.pdf',first=43,starts=[35,75,82,87,93,97,106,110,120,126,132,136,154,163,167,193,198,208,224,233],answerPages=[30,31,32,33,34]),
 'dse-2025-a':dict(source='Edmund Sir - 2025 Reading A - Question Analysis.pdf',first=1,starts=[28,35,41,47,52,58,64,71,94,100,105,109,113,120,None,157,162,166,169,174,181],answerPages=[27],duplicates=['Edmund Sir - 2025 Reading A - Question Analysis-1.pdf']),
 'dse-2025-b1':dict(source='Edmund Sir - 2025 Reading B1  - DSE Reading - Question Analysis.pdf',first=22,starts=[28,35,52,61,67,75,82,90,101,109,115,121,129,135,145,154,158,165,171,178,184]),
 'dse-2025-b2':dict(source='Edmund Sir - 2025 B2 - DSE Reading - Question Analysis.pdf',first=43,starts=[28,40,49,62,74,83,97,108,121,132,152,166,177,189,200,210,219,233,252,260,271,292])}

def digest(data):return hashlib.sha256(data).hexdigest()

def rich_body(page,header_end,footer,body):
 ids=set();line=0
 for text,char in page.get_textmap().tuples:
  if text=='\n':line+=1
  elif char and header_end<=line<footer:ids.add(id(char))
 rows=[[]]
 for text,char in page.get_textmap(y_tolerance=6).tuples:
  if text=='\n':rows.append([])
  else:rows[-1].append((text,char))
 out=[];previous=None
 for row in rows:
  indexes=[i for i,(_,char) in enumerate(row) if char and id(char) in ids]
  if not indexes:continue
  selected=row[indexes[0]:indexes[-1]+1];runs=[];glyphs=[c for _,c in selected if c and id(c) in ids]
  for text,char in selected:
   if char and id(char) not in ids:continue
   style=dict(size=round(char['size'],1),bold='Bold' in char['fontname'],italic=any(n in char['fontname'] for n in ['Italic','Oblique']),highlight=LEGACY.source_highlight(char,page.rects)) if char else (runs[-1]['style'] if runs else dict(size=14,bold=False,italic=False,highlight=''))
   if runs and runs[-1]['style']==style:runs[-1]['text']+=text
   else:runs.append(dict(text=text,style=style))
  top=min(c['top'] for c in glyphs);bottom=max(c['bottom'] for c in glyphs)
  out.append(dict(runs=runs,gap=round(max(0,top-previous) if previous is not None else 0,1),top=round(top,2),bottom=round(bottom,2)));previous=bottom
 plain=''.join(r['text'] for row in out for r in row['runs'])
 assert collections.Counter(c for c in plain if not c.isspace())==collections.Counter(c for c in '\n'.join(body) if not c.isspace()),f'Lost source glyph p.{page.page_number}'
 return out

def answer_overview(pages,numbers):
 result={};current=None;recording=False
 for n in numbers:
  for line in pages[n-1]['body']:
   match=re.match(r'^(\d{1,2})[.．、]\s*(.*)',line)
   if match:current=int(match[1]);result[current]={'text':match[2],'pages':[n]};recording=True
   elif recording and current is not None:
    if line.strip() and not line.strip().isdigit():
     result[current]['text']+='\n'+line
     if n not in result[current]['pages']:result[current]['pages'].append(n)
 return result

def import_one(item):
 key,cfg,source_dir,out_dir,assets_dir,check=item;logging.getLogger('pdfminer').setLevel(logging.ERROR)
 started=time.time();source=Path(source_dir)/cfg['source'];sha=digest(source.read_bytes());out=Path(out_dir)/key;assets=Path(assets_dir)/key
 old=json.loads((out/'index.json').read_text()) if check else None
 manifest_path=assets/'asset-manifest.json'
 if manifest_path.exists():
  assert json.loads(manifest_path.read_text())['sourceSha256']==sha, f'{key}: use a fresh assets directory for a changed source PDF'
 out.mkdir(parents=True,exist_ok=True);assets.mkdir(parents=True,exist_ok=True);pages=[];asset_rows=[]
 def save_image(image,name):
  path=assets/name
  if not path.exists():image.convert('RGB').save(path,'WEBP',quality=88)
  b=path.read_bytes();row={'file':name,'bytes':len(b),'sha256':digest(b),'contentType':'image/webp'};asset_rows.append(row);return row
 with pdfplumber.open(source) as pdf:
  for n,page in enumerate(pdf.pages,1):
   text=page.extract_text() or '';lines=text.splitlines();head=2 if lines and lines[0].startswith('Edmund Education') else 0
   footer=next((i for i,line in enumerate(lines) if line.startswith(('“- Knowledge','“– Knowledge','"- Knowledge'))),len(lines))
   if n==1 and lines and all(s.strip().isdigit() for s in lines):footer=0
   body=lines[head:footer];title=(' '.join(body[:2]) if body and len(body[0])<14 else body[0]) if body else ('原書封面' if n==1 else f'原書第 {n} 頁')
   record=dict(number=n,text=text,sha256=digest(text.encode()),header=lines[:head],body=body,footer=lines[footer:],title=title,category=LEGACY.category(title),image=f'page-{n:03}.webp')
   record['richBody']=rich_body(page,head,footer,body)
   assert '\n'.join(record['header']+record['body']+record['footer'])==text
   rendered=None;image_path=assets/record['image']
   if not image_path.exists():rendered=page.to_image(resolution=135).original
   if rendered is not None:save_image(rendered,record['image'])
   else:
    b=image_path.read_bytes();asset_rows.append(dict(file=record['image'],bytes=len(b),sha256=digest(b),contentType='image/webp'))
   figures=[]
   if n==1 and page.images:
    figures.append(dict(file=record['image'],top=0,bottom=page.height,alt='原書封面'))
   else:
    for i,image in enumerate(page.images):
     if image['top']<85 or image['bottom']>page.height-80 or image['x1']-image['x0']<12 or image['bottom']-image['top']<12:continue
     name=f'figure-{n:03}-{i+1:02}.webp';bbox=tuple(image[k] for k in ['x0','top','x1','bottom'])
     if not (assets/name).exists():save_image(page.crop(bbox).to_image(resolution=160).original,name)
     else:
      b=(assets/name).read_bytes();asset_rows.append(dict(file=name,bytes=len(b),sha256=digest(b),contentType='image/webp'))
     figures.append(dict(file=name,top=round(image['top'],2),bottom=round(image['bottom'],2),bbox=[round(x,3) for x in bbox],alt=f'原書第 {n} 頁圖表'))
   if figures:record['figures']=figures
   pages.append(record);page.close()
   if n%50==0:print(f'{key}: {n}/{len(pdf.pages)} pages preserved',flush=True)
 overview=answer_overview(pages,cfg.get('answerPages',[]));questions=[]
 paper=json.loads((ROOT/'dse-reading-data'/f'{key}.json').read_text());expected=[q['number'] for q in paper['questions']]
 assert expected==list(range(cfg['first'],cfg['first']+len(cfg['starts'])))
 for idx,start in enumerate(cfg['starts']):
  number=cfg['first']+idx
  if start is None:
   assert key=='dse-2025-a' and number==15
   questions.append(dict(number=number,startPage=27,endPage=190,pages=[27,190],ownedPages=[],referenceOnly=True,sourceNote='提供的 PDF 沒有第 15 題獨立逐題解析。此處保留答案總表（原書 p.27）及全題總結（p.190）的相關原文，未補寫新的解說。',answer=overview[number]['text'],answerLabel='原書答案總表 · p.27'));continue
  # Reviewed question boundaries identify task pages even when a source heading is only a numeral.
  pages[start-1]['category']='task'
  next_start=next((s for s in cfg['starts'][idx+1:] if s is not None),len(pages)+1);end=next_start-1
  answer=overview.get(number)
  question=dict(number=number,startPage=start,endPage=end,pages=list(range(start,end+1)))
  if answer:
   question.update(answer=answer['text'],answerLabel='原書答案總表 · p.'+'、'.join(map(str,answer['pages'])),answerSourcePages=answer['pages'])
  else:
   question.update(answer='本題的參考答案及分題說明保留在下方原書完整解說，請逐項核對。',answerLabel=f'原書本題解說 · p.{start}–{end}',answerInSource=True)
  if key=='dse-2023-b1' and number==32:question['sourceNote']='原稿註明：僅憑打字版本不能確定圖片題答案，因原稿缺少 A–D 圖片。此限制及原文分析均予保留，沒有推測答案。'
  if key=='dse-2023-b1' and number==45:question['sourceNote']='原書答案總表只列出部分配對；完整角色配對及未使用選項保留在本題逐項解說內，請一併核對。'
  questions.append(question)
 owned=[n for q in questions for n in q.get('ownedPages',q['pages'])];supplements=[n for n in range(1,len(pages)+1) if n not in set(owned)]
 assert len(owned)==len(set(owned));assert sorted(owned+supplements)==list(range(1,len(pages)+1))
 variants=[]
 for i,name in enumerate(cfg.get('variants',[]),1):
  src=Path(source_dir)/name;dest=assets/f'original-alternate-{i}.pdf'
  if not check:shutil.copyfile(src,dest)
  variants.append(dict(sourceName=name,sourceSha256=digest(src.read_bytes()),sourcePdf=dest.name))
 for name in cfg.get('duplicates',[]):
  assert digest((Path(source_dir)/name).read_bytes())==sha;variants.append(dict(sourceName=name,sourceSha256=sha,sourcePdf='original.pdf',byteIdentical=True))
 if not check:shutil.copyfile(source,assets/'original.pdf')
 for name in ['original.pdf']+[x['sourcePdf'] for x in variants if not x.get('byteIdentical')]:
  b=(assets/name).read_bytes();asset_rows.append(dict(file=name,bytes=len(b),sha256=digest(b),contentType='application/pdf'))
 data=dict(version=VERSION,formattingVersion=VERSION,articleId=key,sourceName=source.name,sourceSha256=sha,sourcePdf='original.pdf',assetBase=f'https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/dse-reading-analysis/{VERSION}/{key}/{sha[:16]}/',pageCount=len(pages),pages=pages,questions=questions,supplementaryPages=supplements)
 if variants:data['sourceVariants']=variants
 if check:assert data==old,f'{key}: current source differs from imported content'
 else:(out/'index.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 manifest=dict(articleId=key,sourceName=source.name,sourceSha256=sha,pages=len(pages),questions=len(questions),dedicatedQuestions=sum(not q.get('referenceOnly') for q in questions),assets=asset_rows,seconds=round(time.time()-started,2))
 (assets/'asset-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 return {k:v for k,v in manifest.items() if k!='assets'}

def main():
 p=argparse.ArgumentParser();p.add_argument('--source-dir',required=True);p.add_argument('--assets-dir',required=True);p.add_argument('--output-dir',default=str(ROOT/'dse-reading-analysis'));p.add_argument('--workers',type=int,default=3);p.add_argument('--check',action='store_true');a=p.parse_args()
 with concurrent.futures.ProcessPoolExecutor(max_workers=a.workers) as pool:
  for result in pool.map(import_one,[(k,c,a.source_dir,a.output_dir,a.assets_dir,a.check) for k,c in CONFIG.items()]):print(json.dumps(result,ensure_ascii=False),flush=True)
if __name__=='__main__':main()
