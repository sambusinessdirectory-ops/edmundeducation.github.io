#!/usr/bin/env python3
"""Build the versioned speech-curation Golden Manual PDF from its Markdown source."""

from __future__ import annotations

import html
import re
import textwrap
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, HRFlowable, KeepTogether, PageBreak, PageTemplate,
    Paragraph, Preformatted, Spacer, Table, TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs/SPEECH-CURATION-IMPORT-GOLDEN-MANUAL.md"
DEST = ROOT / "output/pdf/Speech-Curation-Import-Golden-Manual-v1.pdf"

pdfmetrics.registerFont(TTFont("ArialUni", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"))
pdfmetrics.registerFont(TTFont("Georgia", "/System/Library/Fonts/Supplemental/Georgia.ttf"))
pdfmetrics.registerFont(TTFont("GeorgiaBold", "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"))

PAPER = colors.HexColor("#F7F4EB")
INK = colors.HexColor("#1A3942")
TEAL = colors.HexColor("#007E95")
GOLD = colors.HexColor("#B78A4C")
BURGUNDY = colors.HexColor("#4B1B27")
MUTED = colors.HexColor("#536D71")
RULE = colors.HexColor("#C8D7D5")
RED = colors.HexColor("#A73529")
BODY_FONT = "ArialUni"

ST = {
    "body": ParagraphStyle("Body", fontName=BODY_FONT, fontSize=9.6, leading=15.3,
                           textColor=INK, spaceAfter=8, splitLongWords=True,
                           allowWidows=0, allowOrphans=0),
    "lead": ParagraphStyle("Lead", fontName=BODY_FONT, fontSize=10.3, leading=17,
                           textColor=INK, spaceAfter=12),
    "h2": ParagraphStyle("Major", fontName="GeorgiaBold", fontSize=16.5, leading=23,
                         textColor=INK, spaceBefore=21, spaceAfter=9,
                         keepWithNext=True),
    "h3": ParagraphStyle("Minor", fontName=BODY_FONT, fontSize=11.2, leading=16.7,
                         textColor=TEAL, spaceBefore=13, spaceAfter=7,
                         keepWithNext=True),
    "bullet": ParagraphStyle("Bullet", fontName=BODY_FONT, fontSize=9.4, leading=15,
                             textColor=INK, leftIndent=17, firstLineIndent=0,
                             bulletIndent=3, spaceAfter=5.5, splitLongWords=True),
    "quote": ParagraphStyle("Quote", fontName=BODY_FONT, fontSize=9.2, leading=15,
                            textColor=INK, leftIndent=13, rightIndent=9,
                            borderColor=GOLD, borderWidth=0, borderPadding=(0, 0, 0, 11),
                            spaceBefore=6, spaceAfter=11, backColor=colors.HexColor("#F5EBD6")),
    "code": ParagraphStyle("Code", fontName=BODY_FONT, fontSize=7.4, leading=11.8,
                           textColor=INK, backColor=colors.HexColor("#EAF0EE"),
                           borderColor=RULE, borderWidth=.5, borderPadding=10,
                           spaceBefore=5, spaceAfter=11),
    "toc": ParagraphStyle("TOC", fontName=BODY_FONT, fontSize=8.7, leading=12.7,
                          textColor=INK, leftIndent=0, firstLineIndent=0,
                          spaceBefore=1),
    "small": ParagraphStyle("Small", fontName=BODY_FONT, fontSize=8, leading=12.5,
                            textColor=MUTED),
}


def inline(value: str) -> str:
    value = html.escape(value)
    value = re.sub(r"`([^`]+)`", lambda m: f'<font color="#006D87">{m.group(1)}</font>', value)
    value = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"\*(.*?)\*", r"<i>\1</i>", value)
    return value


class ManualDoc(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == "Major":
            title = flowable.getPlainText()
            key = "section-" + title.split(".")[0].strip()
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title, key, level=0, closed=False)
            self.notify("TOCEntry", (0, title, self.page, key))


def decorate(canvas, doc):
    canvas.saveState()
    w, h = A4
    if doc.page > 1:
        canvas.setFillColor(PAPER)
        canvas.rect(0, h - 46, w, 46, fill=1, stroke=0)
        canvas.setStrokeColor(GOLD)
        canvas.setLineWidth(.6)
        canvas.line(44, h - 46, w - 44, h - 46)
        canvas.setFillColor(INK)
        canvas.setFont("ArialUni", 7)
        canvas.drawString(44, h - 31, "EDMUND EDUCATION   /   SPEECH CURATION")
        canvas.setFillColor(MUTED)
        canvas.drawRightString(w - 44, h - 31, "GOLDEN MANUAL  1.0")
    canvas.setStrokeColor(GOLD)
    canvas.line(44, 42, w - 44, 42)
    canvas.setFillColor(MUTED)
    canvas.setFont("ArialUni", 7)
    canvas.drawString(44, 28, "6 OCT 2026  |  REFERENCE: CHURCHILL 1949  |  SC-GM-001")
    canvas.drawRightString(w - 44, 28, f"{doc.page:02d}")
    canvas.restoreState()


def cover():
    story = [Spacer(1, 53)]
    story.append(Paragraph("EDMUND EDUCATION  /  ARCHIVAL LEARNING SYSTEM",
        ParagraphStyle("Brand", fontName=BODY_FONT, fontSize=10, leading=14,
                       textColor=TEAL, spaceAfter=23)))
    story.append(Paragraph("THE GOLDEN<br/>MANUAL",
        ParagraphStyle("Cover", fontName="GeorgiaBold", fontSize=39,
                       leading=46, textColor=INK, spaceAfter=19)))
    story.append(HRFlowable(width="100%", thickness=3, color=GOLD, spaceAfter=23))
    story.append(Paragraph("Speech Curation Import<br/>and Learning-Reader SOP",
        ParagraphStyle("Subtitle", fontName="Georgia", fontSize=21,
                       leading=30, textColor=INK, spaceAfter=17)))
    story.append(Paragraph("The Churchill 1949 reference, complete import workflow, bilingual editorial standard, documentary-evidence rules, interface design system, exercise contract, QA, and release controls.",
        ParagraphStyle("Deck", fontName=BODY_FONT, fontSize=11, leading=18,
                       textColor=MUTED, spaceAfter=29)))
    swatches = Table([["ARCHIVE INK", "ACTION BLUE", "WARM GOLD", "EVIDENCE WALL"],
                      ["#1A3942", "#007E95", "#B78A4C", "#4B1B27"]],
                     colWidths=[(A4[0]-88)/4]*4, rowHeights=[30, 27])
    swatches.setStyle(TableStyle([
        ("BACKGROUND", (0,0),(0,0), INK), ("BACKGROUND", (1,0),(1,0), TEAL),
        ("BACKGROUND", (2,0),(2,0), GOLD), ("BACKGROUND", (3,0),(3,0), BURGUNDY),
        ("TEXTCOLOR", (0,0),(-1,0), colors.white),
        ("FONTNAME", (0,0),(-1,-1), BODY_FONT),
        ("FONTSIZE", (0,0),(-1,0), 6.7), ("FONTSIZE", (0,1),(-1,1), 8),
        ("ALIGN", (0,0),(-1,-1), "CENTER"),
        ("VALIGN", (0,0),(-1,-1), "MIDDLE"),
        ("LINEBELOW", (0,1),(-1,1), .5, RULE),
    ]))
    story.extend([swatches, Spacer(1, 22)])
    story.append(Paragraph("VERSION 1.0   •   6 OCTOBER 2026   •   DOCUMENT SC-GM-001",
        ParagraphStyle("Metadata", fontName=BODY_FONT, fontSize=8.2, leading=13,
                       textColor=TEAL, spaceAfter=13)))
    story.append(Paragraph("Observed implementation, owner requirements, proposed standards and open engineering work are distinguished throughout. This manual is an operational reference, not a claim that future-speech support or scored exercises are already live.", ST["small"]))
    return story


def parse_source():
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    start = next(i for i, line in enumerate(lines) if line.startswith("## 00."))
    story = []
    i = start
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith("## "):
            if line.startswith("## 23."):
                story.append(PageBreak())
            story.append(Paragraph(inline(line[3:]), ST["h2"]))
            story.append(HRFlowable(width="100%", thickness=.75, color=GOLD,
                                    spaceBefore=0, spaceAfter=9))
            i += 1
            continue
        if line.startswith("### "):
            story.append(Paragraph(inline(line[4:]), ST["h3"]))
            i += 1
            continue
        if line.startswith("```text") or line.startswith("```"):
            code = []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                code.extend(textwrap.wrap(lines[i], width=77, replace_whitespace=False,
                                          drop_whitespace=False) or [""])
                i += 1
            story.append(Preformatted("\n".join(code), ST["code"]))
            i += 1
            continue
        if line.startswith("> "):
            story.append(Paragraph(inline(line[2:]), ST["quote"]))
            i += 1
            continue
        if line.startswith("- [ ") or line.startswith("- [x"):
            story.append(Paragraph(inline(line[6:]), ST["bullet"], bulletText="[ ]"))
            i += 1
            continue
        if line.startswith("- "):
            story.append(Paragraph(inline(line[2:]), ST["bullet"], bulletText="•"))
            i += 1
            continue
        ordered = re.match(r"^(\d+)\.\s+(.*)", line)
        if ordered:
            story.append(Paragraph(inline(ordered.group(2)), ST["bullet"],
                                   bulletText=ordered.group(1) + "."))
            i += 1
            continue
        chunk = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].startswith(("## ", "### ", "- ", "> ", "```")) and not re.match(r"^\d+\.\s+", lines[i]):
            chunk.append(lines[i].strip())
            i += 1
        story.append(Paragraph(inline(" ".join(chunk)), ST["body"]))
    return story


def main():
    DEST.parent.mkdir(parents=True, exist_ok=True)
    w, h = A4
    doc = ManualDoc(str(DEST), pagesize=A4, leftMargin=44, rightMargin=44,
                    topMargin=62, bottomMargin=57,
                    title="The Golden Manual: Speech Curation Import and Learning-Reader SOP",
                    author="EdmundEducation", subject="Churchill reference and reusable speech import standard")
    frame = Frame(44, 57, w-88, h-119, id="normal", leftPadding=0,
                  rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates(PageTemplate(id="manual", frames=frame, onPage=decorate))
    toc = TableOfContents()
    toc.levelStyles = [ST["toc"]]
    toc.dotsMinLevel = 0
    story = cover() + [PageBreak(), Paragraph("Contents",
        ParagraphStyle("Contents", fontName="GeorgiaBold", fontSize=25,
                       leading=31, textColor=INK, spaceAfter=14)), toc,
        Spacer(1, 14), Paragraph("Read sections 02-04 for the exact Churchill reference; sections 05-16 for production rules; sections 17-23 for decisions, recovery, sources and release checks.", ST["small"]),
        PageBreak()]
    story += parse_source()
    doc.multiBuild(story)
    from pypdf import PdfReader
    reader = PdfReader(DEST)
    extracted = "\n".join(page.extract_text() or "" for page in reader.pages)
    assert len(reader.pages) >= 20, len(reader.pages)
    assert "Churchill" in extracted and "221" in extracted and "Procedural urgency" in extracted
    assert "偉人真蹟" in extracted and "逐句細讀" in extracted
    print(f"PDF: {DEST}")
    print(f"Pages: {len(reader.pages)}")
    print(f"Source words (whitespace estimate): {len(SOURCE.read_text().split())}")
    for index, page in enumerate(reader.pages, start=1):
        count = len((page.extract_text() or "").strip())
        if count < 140:
            print(f"Review sparse page: {index} ({count} characters)")


if __name__ == "__main__":
    main()
