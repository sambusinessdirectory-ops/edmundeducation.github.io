from pathlib import Path
import re, html, textwrap
from reportlab.platypus import BaseDocTemplate,PageTemplate,Frame,Paragraph,Spacer,PageBreak,Preformatted,Image,KeepTogether
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'docs/golden-manual-modular-wardrobe-v3.md'
DEST=ROOT/'output/pdf/Golden-Manual-Modular-Character-Wardrobe-SOP-v3.pdf'
GOLD=colors.HexColor('#A77925'); INK=colors.HexColor('#202D2A'); MUTED=colors.HexColor('#5F6964')
styles={
 'body':ParagraphStyle('Body',fontName='Helvetica',fontSize=9.5,leading=14,spaceAfter=7,textColor=INK,allowWidows=0,allowOrphans=0),
 'intro':ParagraphStyle('Intro',fontName='Helvetica',fontSize=9.5,leading=14,spaceAfter=7,textColor=INK,allowWidows=0,allowOrphans=0,keepWithNext=True),
 'h2':ParagraphStyle('Section',fontName='Helvetica-Bold',fontSize=16,leading=21,spaceBefore=18,spaceAfter=10,textColor=INK,keepWithNext=True),
 'bullet':ParagraphStyle('Bullet',fontName='Helvetica',fontSize=9.5,leading=14,leftIndent=14,firstLineIndent=0,bulletIndent=2,spaceAfter=5,textColor=INK),
 'code':ParagraphStyle('Code',fontName='Courier',fontSize=7.2,leading=10,backColor=colors.HexColor('#F3F1EB'),borderPadding=9,spaceBefore=4,spaceAfter=12),
 'caption':ParagraphStyle('Caption',fontName='Helvetica-Oblique',fontSize=8,leading=11,textColor=MUTED,spaceAfter=12),
 'toc':ParagraphStyle('TOC',fontName='Helvetica',fontSize=9.5,leading=13.5,leftIndent=0,firstLineIndent=0,textColor=INK),
}
def inline(t):
 t=html.escape(t)
 t=re.sub(r'`([^`]+)`',r'<font name="Courier">\1</font>',t)
 t=re.sub(r'\*\*(.*?)\*\*',r'<b>\1</b>',t)
 return t
class ManualDoc(BaseDocTemplate):
 def afterFlowable(self,f):
  if isinstance(f,Paragraph) and f.style.name=='Section':
   title=f.getPlainText();key='section-'+title.split('.')[0]
   self.canv.bookmarkPage(key);self.canv.addOutlineEntry(title,key,0,False)
   self.notify('TOCEntry',(0,title,self.page,key))
def decorate(c,doc):
 w,h=A4
 c.setStrokeColor(GOLD);c.setLineWidth(.6)
 if doc.page>1:
  c.line(52,h-38,w-52,h-38);c.setFillColor(MUTED);c.setFont('Helvetica',7)
  c.drawString(52,h-28,'EDMUND EDUCATION  /  MODULAR WARDROBE')
  c.drawRightString(w-52,h-28,'GOLDEN MANUAL  3.0')
 c.line(52,39,w-52,39);c.setFont('Helvetica',7);c.setFillColor(MUTED)
 c.drawString(52,27,'15 September 2026  |  Shared Eddy + Noir standard v3 / 20260915-noirfit1')
 c.drawRightString(w-52,27,str(doc.page))
doc=ManualDoc(str(DEST),pagesize=A4,leftMargin=52,rightMargin=52,topMargin=52,bottomMargin=53,title='The Golden Manual - Modular Character Wardrobe SOP',author='Edmund Education',subject='Asset fitting, modular cosmetics, rendering, QA and release standards')
doc.addPageTemplates(PageTemplate(id='Manual',frames=Frame(52,53,A4[0]-104,A4[1]-105,id='body',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0),onPage=decorate))
story=[]
story.append(Spacer(1,75))
story.append(Paragraph('EDMUND EDUCATION',ParagraphStyle('Brand',fontName='Helvetica-Bold',fontSize=11,leading=16,textColor=GOLD,spaceAfter=27)))
story.append(Paragraph('THE GOLDEN<br/>MANUAL',ParagraphStyle('Cover',fontName='Helvetica-Bold',fontSize=42,leading=48,textColor=INK,spaceAfter=24)))
story.append(Paragraph('Modular Character<br/>Wardrobe SOP',ParagraphStyle('Sub',fontName='Helvetica',fontSize=24,leading=31,textColor=INK,spaceAfter=29)))
story.append(Paragraph('How to fit individual cosmetic items to a canonical character, combine them reliably, preserve smooth rendering, and verify what students actually see.',ParagraphStyle('Deck',fontName='Helvetica',fontSize=12,leading=19,textColor=MUTED,spaceAfter=25)))
story.append(Paragraph('ARTWORK  /  ENGINEERING  /  QUALITY  /  RELEASE',ParagraphStyle('Tag',fontName='Helvetica-Bold',fontSize=8.5,leading=14,textColor=GOLD,spaceAfter=40)))
story.append(Paragraph('Version 3.0 | 15 September 2026<br/>Eddy + Noir<br/>Paired garment fits, shared outfits and cross-system restoration',styles['body']))
story.append(Spacer(1,18))
story.append(Paragraph('Implemented behavior, project-specific calibration and future standards are distinguished throughout. Passing a deployment check is not a substitute for visual acceptance.',styles['caption']))
story.append(PageBreak())
story.append(Paragraph('Contents',ParagraphStyle('Contents',fontName='Helvetica-Bold',fontSize=24,leading=30,spaceAfter=18,textColor=INK)))
toc=TableOfContents();toc.levelStyles=[styles['toc']];toc.dotsMinLevel=0
story.append(toc);story.append(PageBreak())
lines=SOURCE.read_text().splitlines();start=next(i for i,l in enumerate(lines) if l.startswith('## 00.'));i=start
while i<len(lines):
 l=lines[i].strip()
 if not l:i+=1;continue
 if l.startswith('## '):
  story.append(Paragraph(inline(l[3:]),styles['h2']));i+=1;continue
 if l.startswith('### '):
  story.append(Paragraph(inline(l[4:]),ParagraphStyle('Subheading',parent=styles['h2'],fontSize=11,leading=15,spaceBefore=12,spaceAfter=7)));i+=1;continue
 if l.startswith('```'):
  block=[];i+=1
  while i<len(lines) and not lines[i].startswith('```'):
   block.extend(textwrap.wrap(lines[i],width=100,replace_whitespace=False,drop_whitespace=False,subsequent_indent='  ') or ['']);i+=1
  prefix=[story.pop()] if story and isinstance(story[-1],Paragraph) and story[-1].style.name=='Intro' else []
  story.append(KeepTogether(prefix+[Preformatted('\n'.join(block),styles['code'])]));i+=1;continue
 if l.startswith('!['):
  m=re.match(r'!\[(.*?)\]\((.*?)\)',l)
  p=SOURCE.parent/m.group(2)
  from PIL import Image as PILImage
  with PILImage.open(p) as im:w,h=im.size
  width=A4[0]-104;height=width*h/w
  group=[Spacer(1,7),Image(str(p),width=width,height=height)]
  if i+2<len(lines) and lines[i+2].startswith('Figure '):
   group.append(Paragraph(inline(lines[i+2]),styles['caption']));i+=2
  story.append(KeepTogether(group));i+=1;continue
 if l.startswith('- '):
  story.append(Paragraph(inline(l[2:]),styles['bullet'],bulletText='\u2022'));i+=1;continue
 m=re.match(r'^(\d+)\. (.*)',l)
 if m:
  story.append(Paragraph(inline(m.group(2)),styles['bullet'],bulletText=m.group(1)+'.'));i+=1;continue
 parts=[l];i+=1
 while i<len(lines) and lines[i].strip() and not lines[i].startswith(('## ','### ','- ','```','![')) and not re.match(r'^\d+\. ',lines[i]):
  parts.append(lines[i].strip());i+=1
 story.append(Paragraph(inline(' '.join(parts)),styles['intro'] if parts[-1].endswith(':') else styles['body']))
DEST.parent.mkdir(parents=True,exist_ok=True)
doc.multiBuild(story)
from pypdf import PdfReader
r=PdfReader(DEST)
print('PDF:',DEST)
print('Pages:',len(r.pages))
print('Words:',len(SOURCE.read_text().split()))
for index,p in enumerate(r.pages):
 t=p.extract_text() or ''
 if len(t.strip())<100:print('REVIEW SHORT PAGE',index+1,len(t))
assert len(r.pages)>10
