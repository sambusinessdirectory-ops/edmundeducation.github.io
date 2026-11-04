#!/usr/bin/env python3
"""Build the consolidated V6 Golden Manual and append V5 as historical evidence."""
from __future__ import annotations
import argparse, json, tempfile
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

FOREST=colors.HexColor("#123F38"); TEAL=colors.HexColor("#167668"); PALE=colors.HexColor("#EEF5F0")
RED=colors.HexColor("#C92835"); RULE=colors.HexColor("#B9CEC3"); INK=colors.HexColor("#17332D")

def esc(v):
    return str(v).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

def styles():
    b=getSampleStyleSheet()
    return {
      "title":ParagraphStyle("title",parent=b["Title"],fontName="Helvetica-Bold",fontSize=28,leading=33,textColor=FOREST,alignment=TA_CENTER,spaceAfter=12),
      "sub":ParagraphStyle("sub",parent=b["Normal"],fontName="Helvetica",fontSize=13,leading=18,textColor=TEAL,alignment=TA_CENTER,spaceAfter=18),
      "h1":ParagraphStyle("h1",parent=b["Heading1"],fontName="Helvetica-Bold",fontSize=19,leading=23,textColor=FOREST,spaceBefore=5,spaceAfter=9,keepWithNext=True),
      "h2":ParagraphStyle("h2",parent=b["Heading2"],fontName="Helvetica-Bold",fontSize=13,leading=17,textColor=TEAL,spaceBefore=8,spaceAfter=5,keepWithNext=True),
      "body":ParagraphStyle("body",parent=b["BodyText"],fontName="Helvetica",fontSize=9.1,leading=13,textColor=INK,spaceAfter=6),
      "small":ParagraphStyle("small",parent=b["BodyText"],fontName="Helvetica",fontSize=7.2,leading=9.4,textColor=INK),
      "cell":ParagraphStyle("cell",parent=b["BodyText"],fontName="Helvetica",fontSize=7.0,leading=9.1,textColor=INK),
      "head":ParagraphStyle("head",parent=b["BodyText"],fontName="Helvetica-Bold",fontSize=7.0,leading=9.1,textColor=colors.white),
      "call":ParagraphStyle("call",parent=b["BodyText"],fontName="Helvetica-Bold",fontSize=9.6,leading=13.5,textColor=FOREST,backColor=PALE,borderColor=TEAL,borderWidth=1,borderPadding=8,spaceBefore=5,spaceAfter=9),
      "warn":ParagraphStyle("warn",parent=b["BodyText"],fontName="Helvetica-Bold",fontSize=9,leading=12.5,textColor=colors.HexColor("#7A1823"),backColor=colors.HexColor("#FFF0F1"),borderColor=RED,borderWidth=1,borderPadding=8,spaceBefore=5,spaceAfter=8),
      "mono":ParagraphStyle("mono",parent=b["Code"],fontName="Courier",fontSize=7.5,leading=10,textColor=INK,backColor=colors.HexColor("#F3F5F2"),borderPadding=7,spaceAfter=8),
    }

def chrome(c,doc):
    c.saveState(); w,h=A4
    c.setFillColor(FOREST); c.rect(0,h-13*mm,w,13*mm,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont("Helvetica-Bold",8); c.drawString(18*mm,h-8.5*mm,"PAPER 3 SUPER CURATION - V6 NORMATIVE STANDARD")
    c.setStrokeColor(RULE); c.line(18*mm,15*mm,w-18*mm,15*mm)
    c.setFillColor(FOREST); c.setFont("Helvetica",7.5); c.drawString(18*mm,10.5*mm,"Candidate until per-release evidence proves live conformance")
    c.drawRightString(w-18*mm,10.5*mm,f"V6-{doc.page:03d}"); c.restoreState()

def P(text,s): return Paragraph(text,s)
def bullet(text,s): return P("&#8226;&nbsp; "+esc(text),s["body"])
def heading(story,text,s): story.append(P(text,s["h1"]))
def section(story,title,s,paras=(),bullets=()):
    heading(story,title,s)
    for x in paras: story.append(P(x,s["body"]))
    for x in bullets: story.append(bullet(x,s))

def make_table(rows,widths,s,header=True):
    out=[]
    for r,row in enumerate(rows):
        out.append([x if isinstance(x,Paragraph) else P(esc(x),s["head"] if header and r==0 else s["cell"]) for x in row])
    t=Table(out,colWidths=widths,repeatRows=1 if header else 0,hAlign="LEFT")
    cmds=[("VALIGN",(0,0),(-1,-1),"TOP"),("GRID",(0,0),(-1,-1),.35,RULE),
          ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),
          ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
    if header:
        cmds += [("BACKGROUND",(0,0),(-1,0),FOREST),("TEXTCOLOR",(0,0),(-1,0),colors.white)]
        for r in range(2,len(rows),2): cmds.append(("BACKGROUND",(0,r),(-1,r),colors.HexColor("#F7FAF7")))
    t.setStyle(TableStyle(cmds)); return t

def timecode(seconds):
    m=int(seconds//60); return f"{m}:{seconds-m*60:05.2f}"

def normative(path,manifest):
    s=styles()
    doc=BaseDocTemplate(str(path),pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=21*mm,bottomMargin=20*mm,
      title="Paper 3 Super Curation Golden Manual 2025 B2 V6.0",author="Edmund Education",
      subject="Consolidated normative standard and release-conformance contract")
    frame=Frame(doc.leftMargin,doc.bottomMargin,doc.width,doc.height,id="body")
    doc.addPageTemplates(PageTemplate(id="v6",frames=[frame],onPage=chrome))
    x=[]
    x += [Spacer(1,30*mm),P("PAPER 3 SUPER CURATION",s["title"]),P("Golden Manual - 2025 B2 - V6.0",s["sub"]),
          Spacer(1,8*mm),P("CONSOLIDATED NORMATIVE STANDARD",s["call"]),
          P("Release date: 4 November 2026<br/>Scope: 2025 B2 design system and the 2023 B2 implementation profile<br/>Status at generation: candidate standard; conformance is granted only per deployed SHA",s["body"]),
          Spacer(1,8*mm),P("V6 replaces V1-V5 as the only current source of normative requirements. Prior editions are retained after the historical-annex divider for audit history only.",s["warn"]),
          Spacer(1,15*mm),P("Writing a requirement is not proof that the live release meets it. V6 binds every rule to an owner, executable test, mandatory gate and retained evidence.",s["call"]),PageBreak()]

    section(x,"1. Authority, status and release vocabulary",s,[
      "The words MUST, MUST NOT, REQUIRED, SHALL and SHALL NOT are release-blocking. SHOULD may vary only through an approved variance in the release evidence packet.",
      "Only the consolidated V6 section is normative. The appended V5 pages are historical evidence and cannot override or supplement V6."
    ])
    x.append(make_table([
      ["State","Meaning","Permitted claim"],["Candidate","Source and manual exist; mandatory gates have not all passed.","Candidate V6 build"],
      ["Tested","Required static and browser suites passed for the exact SHA.","Tested candidate"],
      ["Deployed","GitHub Pages published the exact SHA.","Deployed candidate"],
      ["Verified-live","Cache-busted public runtime and release.json expose the SHA and V6 handshake.","Live verified candidate"],
      ["Conforming","All gates and required evidence passed; every variance is approved.","V6 conforming release"],
    ],[25*mm,92*mm,50*mm],s)); x += [P("A successful GitHub deployment is not a conformance certificate.",s["warn"]),PageBreak()]

    section(x,"2. Deliverables and precedence",s,bullets=[
      "Normative standard: this consolidated V6 section.",
      "Implementation profile: exact 2023 B2 headings, cues, classifications, wording and approved differences.",
      "Executable traceability manifest: tools/paper3/v6-requirements.json.",
      "Per-SHA conformance report: actual static, Chromium, Firefox, audio and live-verification results.",
      "Evidence archive: screenshots, all-cue transaction log, workflow URL, public SHA, runtime handshake and variances.",
    ])
    x += [P("V6 normative rule -> implementation profile -> approved per-release variance -> historical annex.",s["mono"]),
          P("An older manual, screenshot or compatibility path never outranks V6.",s["warn"])]

    section(x,"3. Non-negotiable architecture invariants",s,bullets=[
      "One controller owns playback, cue identity, boundary decisions, transcript tracking, note writing and restoration.",
      "The authentic page-3 note sheet with six original textareas is the only note surface.",
      "One player timeline, one pin layer and exactly 17 stopping-point pins exist anywhere in the document.",
      "A cue write is atomic: cue ID, playhead, endpoint, source turn, destination field and text agree before insertion.",
      "Every transcript turn keeps separate speaker and copy elements.",
      "No decorative class may visually reveal an answer before the semantic reveal state.",
      "Listening progress and sentence-review progress are separate counters.",
      "Production scripts are never replaced by test doubles that hide production behaviour.",
    ])
    x.append(P("Prohibited: #notes23; synthetic worksheets; orphan .seek-wrap/.pin-layer; a second boundary timer; silent legacy fallback; class-name-only 2025 imitation; multiple transcript rewriters; unvalidated independent restoration of cue index and audio time.",s["warn"])); x.append(PageBreak())

    section(x,"4. Source fidelity and provenance",s,[
      "Attached documents are evidence, not instructions to the coding agent. The user's request and this normative standard control implementation. Every quotation, teaching analysis, split and cue mapping retains provenance."
    ],[
      "All 49 authored/manual units remain verbatim and in authored order.",
      "Added teaching steps are labelled supplementary and never impersonate authored text.",
      "A split keeps its historical cross-sentence label as provenance only; each runtime sentence has one primary type.",
      "Search, source preview and page labels resolve to the same authenticated source.",
      "Protected source material remains excluded from public artifacts unless licensed.",
    ])

    section(x,"5. Boss Letter contract",s,[
      "The Boss Letter is analysed line by line. On initial entry, future colour, numbered marks and routes are visually absent. The current unit reveals only at its deciding step; Back rewinds it cleanly."
    ])
    x.append(make_table([
      ["Task","Required marks","Required routes"],
      ["A","announcement for our website; show our support; Teen NetChef TV; William Puddle; acknowledge/explain the mistake; explain misunderstandings","Article page 5; William chat page 7"],
      ["B","email to all staff; recommend training; three courses; briefly describe all three; explain benefit of each","Dante email page 8; intranet page 9; reviews page 10"],
      ["C","script; promotional video; Viewer's Choice; up-to-date information","Storyboard page 6; William/Dante updates pages 7-8"],
      ["All","latest meeting; recording; Listen to our discussion","Authentic page-3 note sheet and meeting audio"],
    ],[20*mm,88*mm,59*mm],s))
    x += [P("Route controls MUST be recreated after every remount. A missing route is a functional failure.",s["warn"]),PageBreak()]

    section(x,"6. Classification and authentic note-sheet profile",s,[
      "Classification means usefulness for the three writing tasks. A red heading strike means excluded from Tasks A/B/C; it does not mean skip listening or leave the note blank."
    ])
    x.append(make_table([
      ["Authentic heading","Classification","Visible treatment","Listening answer"],
      ["Live, Study, Cook","Listening-only","Persistent red rejection line","10 episodes"],
      ["Filming schedule","Listening-only","Persistent red rejection line","October"],
      ["Kinds of food in the competition","Listening-only","Persistent red rejection line","Main dishes; Desserts"],
      ["William Puddle's viral video","Task A + Task B","Two labelled badges","Cues 5-10"],
      ["Golden Sun Tower Private Kitchen complaints","Task B","Task B badge","Cues 11-13"],
      ["New show: Viewer's Choice","Task C","Task C badge","Cues 14-17"],
    ],[52*mm,29*mm,48*mm,38*mm],s))
    x += [P("The invented heading 'Staff training' is prohibited because it is not printed on the authentic note sheet.",s["warn"]),PageBreak()]

    section(x,"7. Canonical player and transcript",s,bullets=[
      "meeting.mp3 uses the absolute exam clock. Displayed meeting time = mediaTime - 426.00 seconds.",
      "Visible duration is 6:52.79; the full media duration is approximately 14:29.",
      "Player provides play/pause, seek, 0.5x-3x speed, cue status, retry state and a truthful pin toggle.",
      "Transcript provides translation, follow on/off and fit/reset; drag and four-corner resize preserve readable copy.",
      "Automatic follow centers the current utterance unless deliberately disabled.",
      "A rejection line crosses utterance copy only, never the speaker.",
      "Desktop, 390px mobile, normal motion and reduced motion are mandatory.",
    ])
    x += [P("cue.start <= audio.currentTime <= cue.end AND cue.id, destination, text and sourceTurn all match. Invalid stored tuples are repaired or reset before writing.",s["mono"]),PageBreak()]

    section(x,"8. Audited 17-cue ledger",s,[
      "Every endpoint below is exercised against the real MP3. The evidence log records cue ID, absolute and displayed time, endpoint, destination, text, architecture handshake and release SHA."
    ])
    cues=[
      (18,472.86,477.00,"Live, Study, Cook","10 episodes","Listening-only"),
      (20,480.18,490.26,"Filming schedule","Filming postponed until October","Listening-only"),
      (24,505.08,514.50,"Kinds of food","Main dishes","Listening-only"),
      (28,520.74,529.14,"Kinds of food","Desserts","Listening-only"),
      (34,548.40,553.22,"William video","Flood in the test kitchen","Task A"),
      (38,556.20,564.76,"William video","Food safety allegations may be misunderstandings","Task A"),
      (41,581.69,589.45,"William video","Watering eyes from chopping onions","Task A"),
      (43,600.03,608.80,"William video","Social media training for staff","Task B"),
      (46,612.86,626.56,"William video","Communicate clearly and avoid offence","Task B"),
      (53,663.39,674.05,"William video","First ten to finish all three courses earn an extra day off","Task B"),
      (58,707.84,713.80,"Golden Sun","Burnt toast","Listening-only"),
      (63,734.37,739.05,"Golden Sun","Fire safety training","Task B"),
      (71,762.87,772.78,"Golden Sun","Offer $5,000 for the private kitchen","Listening-only"),
      (73,777.96,789.93,"Viewer's Choice","New show: Viewer's Choice","Task C"),
      (75,792.83,806.55,"Viewer's Choice","Interactive: viewers choose the ingredients","Task C"),
      (79,819.73,825.63,"Viewer's Choice","Fully live","Task C"),
      (81,833.35,838.79,"Viewer's Choice","End of meeting; no generated answer","Listening-only"),
    ]
    rows=[["ID","Turn","Semantic interval (display)","Destination","Generated note","Use"]]
    for n,(turn,start,end,dest,note,use) in enumerate(cues,1):
        rows.append([f"{n:02d}",turn,f"{timecode(start-426)} - {timecode(end-426)}",dest,note,use])
    x.append(make_table(rows,[11*mm,11*mm,34*mm,31*mm,58*mm,22*mm],s)); x.append(PageBreak())

    section(x,"9. Atomic cue transaction",s,bullets=[
      "Validate metadata and a seekable HTTP range before playback or testing.",
      "Resolve cue from stable ID and semantic interval; never trust an independent restored index.",
      "Seek and wait until the playhead agrees before playback.",
      "At endpoint: pause, clamp, lock transaction and record source turn.",
      "Open related evidence, mark source utterance and focus/glow the authentic destination textarea.",
      "Type into that textarea only. Re-enhancement MUST NOT project complete or partial text while the lock is held.",
      "Unlock only when the complete audited string is present, persisted and logged.",
      "Replay replaces the generated line deterministically and preserves learner-authored lines.",
    ])
    x += [P("{cueId, index, audioTime, displayTime, endpoint, sourceEndpoint, sourceTurn, destination, text, architectureVersion, releaseSha}",s["mono"])]

    section(x,"10. Transcript and source-to-destination choreography",s,bullets=[
      "All 76 meeting turns remain .speech > .speaker + .curation-transcript-copy.",
      "Sentence review inserts spans inside copy; it never flattens the row.",
      "Current utterance has a readable highlight; cue source has a distinct outline.",
      "The related-recording panel opens at the cue boundary.",
      "The destination textarea receives current/glow and smooth focus.",
      "Speaker, quotation, timestamp and destination remain available for diagnosis.",
    ]); x.append(PageBreak())

    section(x,"11. Progress, task language and type granularity",s,[
      "Listening reports 1/17 through 17/17. Sentence review reports its own labelled counter. The UI MUST NOT display 1/166 or imply 166 audio stops."
    ])
    x.append(make_table([
      ["Rule","Normative treatment"],["Multi-task","Use 'Task A + Task B' or two labelled badges; slash-only A/B is prohibited."],
      ["Primary type","Exactly one runtime primary type per sentence."],
      ["Contact sentence","'Neither Puddle ... could be reached for comment.' is Type 5."],
      ["Rumour sentence","'With rumours of a new show ...' is a separate Type 6."],
      ["Historical label","A combined authored label appears only as provenance, explicitly not runtime type."],
      ["Meaning","Excluded from essays is not the same as useless audio noise."],
    ],[42*mm,125*mm],s))

    section(x,"12. Colour overlap and motion grammar",s,[
      "Colour layers encode different meanings and MUST be nested rather than replacing one another."
    ])
    x.append(make_table([
      ["Layer","Colour","Meaning","Example"],["Outer sentence","Task A blue / B yellow / C pink","Task/content ownership","Whole current sentence"],
      ["Inner syntax","Pale purple","Reusable wording or grammar","The words 'did flood'"],
      ["Rejection ink","Red line","Rejected content or listening-only heading","Copy only, not speaker"],
      ["Cue focus","Gold/teal outline","Current source and destination","Cue 5 + William field"],
    ],[31*mm,42*mm,48*mm,46*mm],s))
    x.append(P("Required overlap: the complete sentence 'William did flood the test kitchen' remains Task A blue while the nested words 'did flood' remain purple. CI checks both computed colours.",s["call"]))
    for item in ["sentence hover/focus/selection","evidence reveal","source route and spotlight","route-arrow draw","note focus/typewriter","transcript follow and pen strike","stamp drop/reflow","model-sentence glide","source-preview entrance","podcast-note reuse ink"]:
        x.append(bullet(item+": motion has a persistent reduced-motion equivalent.",s))
    x.append(PageBreak())

    section(x,"13. Storage, remount and lifecycle",s,bullets=[
      "Persisted state is versioned and validates cue ID, index, playhead, destination and text as one tuple.",
      "Invalid tuples are repaired from the semantic interval or safely reset.",
      "Learner-authored lines are separated from generated lines and never discarded.",
      "Three repeated stage exits/entries leave one player, one transcript, one timeline, 17 pins, no duplicates and unchanged learner text.",
      "Firefox startup, reload and restoration are first-class paths.",
      "Blocked/full storage falls back safely and tells the learner to export.",
      "Obsolete open tabs are detected through V6 handshake and release SHA; users are not told merely to clear caches.",
    ])
    section(x,"14. Accessibility and responsive acceptance",s,bullets=[
      "Controls have programmatic names, keyboard operation and visible focus.",
      "Task, cue, rejection and completion are not conveyed by colour alone.",
      "aria-pressed, aria-expanded and labels agree with visible state.",
      "Speaker and copy remain distinct and readable at supported zoom.",
      "At 390 x 844, there is no unintended horizontal overflow; player/transcript remain in viewport; copy width exceeds 120 CSS px.",
      "Fit/reset recovers dragged/resized transcript; normal and reduced motion retain meaning.",
    ]); x.append(PageBreak())

    section(x,"15. Executable traceability manifest",s,[
      "This table is generated from tools/paper3/v6-requirements.json. Missing owner, test, gate or evidence invalidates a requirement and blocks release."
    ])
    req=[["Requirement","Normative rule","Owner","Gate / evidence"]]
    for r in manifest["requirements"]: req.append([r["id"],r["rule"],r["owner"],r["gate"]+" / "+r["evidence"]])
    x.append(make_table(req,[25*mm,78*mm,31*mm,33*mm],s)); x.append(PageBreak())

    section(x,"16. Mandatory release gates",s,bullets=[
      "Static: syntax, V6 manifest, forbidden-pattern scan and 49/49 verbatim/provenance.",
      "Chromium reduced motion: Boss routes, six fields, classification, player/transcript, state repair, all 17 MP3 cues, three remounts, nested colours, storage failure and mobile geometry.",
      "Firefox normal motion: hidden Boss future state, V6 handshake, one timeline, 17 pins, 76 structured turns and zero page errors.",
      "Visual: full-page Chromium and Firefox evidence at named critical states.",
      "Deploy only after build gates. Verify-live checks release.json, cache-busted runtime, V6 handshake and public smoke.",
      "Archive the evidence artifact for the exact SHA, including on later-gate failure.",
    ])
    x.append(P("The test MUST load production lesson.js, meeting.js, podcast-v4.js and podcast-v6.js. It MUST fail on any orphan seek-wrap/pin-layer anywhere, not only inside the preferred timeline.",s["warn"]))

    section(x,"17. Required conformance evidence packet",s,bullets=[
      "Commit SHA and cache-busted public URL.",
      "GitHub Actions workflow URL and conclusion.",
      "Manifest and 49/49 provenance reports.",
      "Chromium and Firefox results, versions and motion settings.",
      "Critical-state screenshots.",
      "Seventeen-entry cue transaction JSON.",
      "Public release.json and runtime handshake.",
      "Approved variances, owner, rationale and expiry.",
    ]); x.append(PageBreak())

    section(x,"18. Troubleshooting decision table",s)
    x.append(make_table([
      ["Observed failure","Required diagnosis","Release-blocking correction"],
      ["Boss already green","Compare semantic reveal with computed colour/decorative classes.","Remove bypass selector; test initial/reveal/rewind."],
      ["Wrong note at spoken cue","Log playhead, cue ID, interval, source, endpoint, field and text.","Repair tuple atomically; one boundary owner."],
      ["Full answer then partial","Check enhancement during transaction lock.","No projection while locked; one canonical field writer."],
      ["Duplicate red/green pins","Count all marker layers in document.","Delete legacy constructor; one timeline/17 pins."],
      ["Transcript narrow","Inspect speaker/copy DOM and grid min-width.","Preserve structured rows; enforce geometry."],
      ["Strike crosses speaker","Compare row/copy computed backgrounds.","Apply ink to copy only."],
      ["1/166","Identify conflated counters.","Show 1/17; label review separately."],
      ["Route absent","Inspect canonical shell after remount.","Recreate route from current Boss unit."],
      ["Live differs","Compare SHA, handshake, cache-busted URL and artifact.","No conformance claim before exact-SHA public pass."],
    ],[40*mm,62*mm,65*mm],s)); x.append(PageBreak())

    section(x,"19. Incident catalogue closed by V6",s,[
      "These discovered failures are now explicit prohibitions, executable assertions or evidence obligations."
    ])
    incidents=[
      "Premature Boss highlights and visible future numbered marks.","Unexplained A/B shorthand.",
      "All-green podcast headings and disappearing strikes.","Legacy player wearing 2025 class names.",
      "Flood audio writing Desserts because playhead and cue index disagreed.","Type 5 and Type 6 combined across sentences.",
      "Task colour erased by nested purple syntax colour.","Transcript not following audio or highlighting current speech.",
      "No visible source-to-destination route, evidence-panel opening or destination glow.","Over-broad cue ranges and endpoint-only seeking semantics.",
      "Generated notes lacking cue/timestamp/source diagnostics.","Two pin layers and contradictory toggle state.",
      "Speaker/copy structure destroyed by a later rewrite.","Rejection line drawn through speaker labels.",
      "Transcript clipping, unreadable copy and no fit/reset.","Listening and 149 review units collapsed into 166 apparent stops.",
      "Essay exclusion confused with useless audio noise.","Synthetic worksheet, merged headings and invented Staff training.",
      "Learner and generated notes stored in separate systems.","Repeated wrappers and a legacy timer retaining competing ownership.",
      "Tests mocking lesson.js and hiding duplicate pins.","Tests checking classes but not hierarchy, geometry or styles.",
      "Tests bypassing audio with direct notes() calls.","Workflow syntax-checking a test without executing it.",
      "No per-SHA evidence packet or public handshake.","Enhancement briefly replacing a full answer with a partial typewriter value.",
      "Range-incapable local server causing false seek failures; CI-equivalent range serving is mandatory.",
    ]
    for i,item in enumerate(incidents,1): x.append(P(f"<b>{i:02d}.</b> {esc(item)}",s["body"]))
    x.append(PageBreak())

    section(x,"20. Definition of ready, conformance and change control",s)
    x.append(make_table([
      ["Before merge","Before deploy","After deploy"],
      ["Manifest valid; source rebuilt; 49/49; no forbidden patterns; browser suite green","Chromium + Firefox + 17 cues + remount + mobile + visual evidence","release.json SHA + V6 handshake + cache-busted smoke + artifact"],
      ["No generated-reader drift","No unapproved required variance","Only then mark the exact SHA conforming"],
    ],[56*mm,56*mm,55*mm],s))
    for item in [
      "Change a normative rule and its machine-readable requirement together.",
      "A behaviour change adds or strengthens its executable assertion before publication.",
      "A new incident identifies missing invariant, test blind spot and gate correction, not just more prose.",
      "Future manuals are rebuilt from this source; direct PDF-only editing is prohibited.",
      "A future major version consolidates current rules again and does not create contradictory normative appendices.",
    ]: x.append(bullet(item,s))
    x += [P("A later defect invalidates the conformance claim for the affected release and opens a new incident. It does not rewrite the historical evidence packet.",s["warn"]),
          Spacer(1,8*mm),P("END OF V6 NORMATIVE STANDARD",s["call"]),
          P("The pages after the annex divider are the complete V5 manual retained as non-normative audit history. They cannot add, remove or override V6.",s["warn"])]
    doc.build(x)

def divider(path):
    s=styles(); doc=BaseDocTemplate(str(path),pagesize=A4,leftMargin=22*mm,rightMargin=22*mm,topMargin=25*mm,bottomMargin=25*mm)
    frame=Frame(doc.leftMargin,doc.bottomMargin,doc.width,doc.height,id="divider")
    doc.addPageTemplates(PageTemplate(id="divider",frames=[frame],onPage=chrome))
    doc.build([Spacer(1,40*mm),P("HISTORICAL ANNEX",s["title"]),P("V5.0 - retained for audit history only",s["sub"]),
      Spacer(1,10*mm),P("NON-NORMATIVE",s["warn"]),
      P("The following pages preserve the complete V5 manual. V5 contains superseded wording, additive appendices and claims not always matched by enforcement. Implementers MUST NOT use it to resolve current behaviour. V6 above is the sole authority.",s["call"])])

def merge(normative_path,divider_path,previous,output):
    writer=PdfWriter()
    for source in (normative_path,divider_path,previous):
        for page in PdfReader(str(source)).pages: writer.add_page(page)
    writer.add_metadata({"/Title":"Paper 3 Super Curation Golden Manual 2025 B2 V6.0",
      "/Author":"Edmund Education","/Subject":"Consolidated normative standard with non-normative V5 historical annex",
      "/Keywords":"Paper 3, Super Curation, Golden Manual, V6, conformance, 2023 B2, 2025 B2"})
    output.parent.mkdir(parents=True,exist_ok=True)
    with output.open("wb") as f: writer.write(f)

def main():
    p=argparse.ArgumentParser(); p.add_argument("--manifest",type=Path,required=True); p.add_argument("--previous",type=Path,required=True); p.add_argument("--output",type=Path,required=True); a=p.parse_args()
    m=json.loads(a.manifest.read_text(encoding="utf-8"))
    if m.get("version")!="6.0" or len(m.get("requirements",[]))<30: raise SystemExit("V6 manifest incomplete")
    if not a.previous.exists(): raise SystemExit(f"Missing V5: {a.previous}")
    with tempfile.TemporaryDirectory(prefix="paper3-v6-") as d:
        n=Path(d)/"normative.pdf"; h=Path(d)/"divider.pdf"; normative(n,m); divider(h); merge(n,h,a.previous,a.output)
    print(f"Wrote {a.output}")

if __name__=="__main__": main()
