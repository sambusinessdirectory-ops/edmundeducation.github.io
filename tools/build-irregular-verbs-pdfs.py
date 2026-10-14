#!/usr/bin/env python3
"""Build the two downloadable, four-column irregular-verb reference PDFs."""
from html import escape
from pathlib import Path
import json

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import LongTable, Paragraph, SimpleDocTemplate, Spacer, TableStyle

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'irregular-verbs' / 'data.json').read_text(encoding='utf-8'))
PRIORITY = json.loads((ROOT / 'irregular-verbs' / 'priority.json').read_text(encoding='utf-8'))
OUT = ROOT / 'output' / 'pdf'
OUT.mkdir(parents=True, exist_ok=True)

pdfmetrics.registerFont(TTFont('ArialUnicode', '/System/Library/Fonts/Supplemental/Arial Unicode.ttf'))
ink = colors.HexColor('#193B52')
blue = colors.HexColor('#174960')
muted = colors.HexColor('#526A76')
line = colors.HexColor('#D4E2E4')
cream = colors.HexColor('#F5F8F7')
gold = colors.HexColor('#AD7948')
cell = ParagraphStyle('cell', fontName='ArialUnicode', fontSize=9.2, leading=13.7,
                      textColor=ink, alignment=TA_LEFT, wordWrap='CJK')
column = ParagraphStyle('column', parent=cell, fontSize=9.0, leading=12.5,
                        textColor=colors.white)
intro = ParagraphStyle('intro', parent=cell, fontSize=9.1, leading=15,
                       textColor=muted, spaceAfter=10)

def footer(canvas, doc, title):
    width, height = landscape(A4)
    canvas.saveState()
    canvas.setFillColor(blue)
    canvas.rect(0, height - 6, width, 6, fill=1, stroke=0)
    canvas.setFont('ArialUnicode', 16)
    canvas.setFillColor(ink)
    canvas.drawString(42, height - 39, '不規則動詞｜四欄參考表')
    canvas.setFont('ArialUnicode', 8.5)
    canvas.setFillColor(gold)
    canvas.drawRightString(width - 42, height - 34, title)
    canvas.setStrokeColor(line)
    canvas.line(42, 40, width - 42, 40)
    canvas.setFont('ArialUnicode', 7.8)
    canvas.setFillColor(muted)
    footer_text = 'EdmundEducation · 220 個動詞 · 逗號 = 可接受的變體'
    if 'LEARNING PRIORITY' in title:
        footer_text += ' · 排序：be、awake 置首；其餘以 BNC 頻率為主 · UCREL List 5.2, CC BY-SA 2.0 UK'
    canvas.drawString(42, 26, footer_text)
    canvas.drawRightString(width - 42, 26, f'第 {doc.page} 頁')
    canvas.restoreState()

def build(filename, title, ordered, note):
    output = OUT / filename
    width, height = landscape(A4)
    doc = SimpleDocTemplate(str(output), pagesize=(width, height),
                            leftMargin=42, rightMargin=42,
                            topMargin=58, bottomMargin=50,
                            title=f'不規則動詞四欄參考表 - {title}',
                            author='EdmundEducation')
    headers = ['中文意思', 'V1 原形', 'V2 過去式', 'V3 過去分詞']
    rows = [[Paragraph(escape(label), column) for label in headers]]
    for entry in ordered:
        rows.append([Paragraph(escape(entry['meaning']), cell),
                     *[Paragraph(escape(form), cell) for form in entry['forms']]])
    table = LongTable(rows, colWidths=[225, 145, 190, 197.89], repeatRows=1,
                      hAlign='LEFT', splitByRow=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), blue),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, cream]),
        ('LINEBELOW', (0, 0), (-1, 0), 1, gold),
        ('LINEBELOW', (0, 1), (-1, -1), .35, line),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 4.2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4.2),
    ]))
    story = [table]
    doc.build(story, onFirstPage=lambda c, d: footer(c, d, title),
              onLaterPages=lambda c, d: footer(c, d, title))
    print(output)

entries = DATA['entries']
assert len(entries) == 220 and len(PRIORITY['order']) == 220
by_id = {entry['id']: entry for entry in entries}
assert len(set(PRIORITY['order'])) == 220 and set(PRIORITY['order']) == set(by_id)

build('irregular-verbs-alphabetical.pdf', '字母順序 · ALPHABETICAL', entries,
      '按教材原有字母順序排列。所有 220 個動詞均列出中文意思、V1、V2 及 V3；逗號表示可接受的變體。')
build('irregular-verbs-learning-priority.pdf', '常用優先 · LEARNING PRIORITY',
      [by_id[id] for id in PRIORITY['order']],
      '常用優先以 British National Corpus 動詞詞元頻率為主要依據；be 及 awake 按教學要求置於起首。未列入語料頻率表的動詞按字母排列。排序資料：UCREL, Word Frequencies in Written and Spoken English, List 5.2 (CC BY-SA 2.0 UK)。')
