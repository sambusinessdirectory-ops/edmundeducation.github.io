# Usage: python extract.py /path/to/staging-directory-containing-manifest.json
import sys
from pathlib import Path
import pdfplumber,json
from docx import Document
O=Path(sys.argv[1])
for d in json.loads((O/'manifest.json').read_text()):
 with pdfplumber.open(d['pdf']) as p:
  (O/(d['slug']+'.txt')).write_text('\n'.join(x.extract_text() or '' for x in p.pages))
  tabs=[]
  for i,x in enumerate(p.pages):
   for tab in x.extract_tables():tabs.append(dict(page=i+1,rows=tab))
  (O/(d['slug']+'.tables.json')).write_text(json.dumps(tabs,ensure_ascii=False,indent=2))
 if d.get('docx'):
  doc=Document(d['docx']);lines=[]
  from docx.oxml.ns import qn
  from docx.table import Table
  from docx.text.paragraph import Paragraph
  for el in doc.element.body:
   if el.tag==qn('w:p'):lines.append(Paragraph(el,doc).text)
   elif el.tag==qn('w:tbl'):
    for r in Table(el,doc).rows:lines.append('| '+' | '.join(c.text for c in r.cells)+' |')
  (O/(d['slug']+'.docx.txt')).write_text('\n'.join(lines))
 print(d['slug'],len(tabs))
