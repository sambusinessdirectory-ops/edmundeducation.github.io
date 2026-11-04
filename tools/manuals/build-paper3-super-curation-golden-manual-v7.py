#!/usr/bin/env python3
"""Build the V7 corrective appendix and retain V6 as a historical annex."""
from __future__ import annotations
import argparse, json, tempfile
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

FOREST=colors.HexColor("#123F38"); TEAL=colors.HexColor("#167668"); PALE=colors.HexColor("#EEF5F0")
RED=colors.HexColor("#C92835"); GOLD=colors.HexColor("#D59B25"); RULE=colors.HexColor("#B9CEC3"); INK=colors.HexColor("#17332D")

def esc(value):
    return str(value).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

def get_styles():
    base=getSampleStyleSheet()
    return {
      "title":ParagraphStyle("title",parent=base["Title"],fontName="Helvetica-Bold",fontSize=27,leading=32,textColor=FOREST,alignment=TA_CENTER,spaceAfter=12),
      "sub":ParagraphStyle("sub",parent=base["Normal"],fontName="Helvetica",fontSize=13,leading=18,textColor=TEAL,alignment=TA_CENTER,spaceAfter=18),
      "h1":ParagraphStyle("h1",parent=base["Heading1"],fontName="Helvetica-Bold",fontSize=18,leading=22,textColor=FOREST,spaceBefore=5,spaceAfter=9,keepWithNext=True),
      "h2":ParagraphStyle("h2",parent=base["Heading2"],fontName="Helvetica-Bold",fontSize=12.5,leading=16,textColor=TEAL,spaceBefore=7,spaceAfter=4,keepWithNext=True),
      "body":ParagraphStyle("body",parent=base["BodyText"],fontName="Helvetica",fontSize=8.8,leading=12.5,textColor=INK,spaceAfter=5),
      "small":ParagraphStyle("small",parent=base["BodyText"],fontName="Helvetica",fontSize=7.0,leading=9.2,textColor=INK,spaceAfter=3),
      "cell":ParagraphStyle("cell",parent=base["BodyText"],fontName="Helvetica",fontSize=6.7,leading=8.7,textColor=INK),
      "head":ParagraphStyle("head",parent=base["BodyText"],fontName="Helvetica-Bold",fontSize=6.7,leading=8.7,textColor=colors.white),
      "call":ParagraphStyle("call",parent=base["BodyText"],fontName="Helvetica-Bold",fontSize=9.4,leading=13.2,textColor=FOREST,backColor=PALE,borderColor=TEAL,borderWidth=1,borderPadding=8,spaceBefore=5,spaceAfter=8),
      "warn":ParagraphStyle("warn",parent=base["BodyText"],fontName="Helvetica-Bold",fontSize=8.8,leading=12.2,textColor=colors.HexColor("#7A1823"),backColor=colors.HexColor("#FFF0F1"),borderColor=RED,borderWidth=1,borderPadding=8,spaceBefore=5,spaceAfter=8),
      "mono":ParagraphStyle("mono",parent=base["Code"],fontName="Courier",fontSize=7.2,leading=9.6,textColor=INK,backColor=colors.HexColor("#F3F5F2"),borderPadding=7,spaceAfter=7),
      "incident":ParagraphStyle("incident",parent=base["BodyText"],fontName="Helvetica",fontSize=7.2,leading=9.6,textColor=INK,backColor=colors.HexColor("#F8FAF7"),borderColor=RULE,borderWidth=.6,borderPadding=7,spaceAfter=7),
    }

def chrome(canvas,doc):
    canvas.saveState(); width,height=A4
    canvas.setFillColor(FOREST); canvas.rect(0,height-13*mm,width,13*mm,fill=1,stroke=0)
    canvas.setFillColor(colors.white); canvas.setFont("Helvetica-Bold",8)
    canvas.drawString(18*mm,height-8.5*mm,"PAPER 3 SUPER CURATION - V7 CORRECTIVE APPENDIX")
    canvas.setStrokeColor(RULE); canvas.line(18*mm,15*mm,width-18*mm,15*mm)
    canvas.setFillColor(FOREST); canvas.setFont("Helvetica",7.5)
    canvas.drawString(18*mm,10.5*mm,"Normative candidate until the exact deployed SHA passes all V7 gates")
    canvas.drawRightString(width-18*mm,10.5*mm,f"V7-{doc.page:03d}"); canvas.restoreState()

def P(text,style): return Paragraph(text,style)
def bullet(text,styles): return P("&#8226;&nbsp; "+esc(text),styles["body"])
def section(story,title,styles,paras=(),bullets=()):
    story.append(P(title,styles["h1"]))
    for paragraph in paras: story.append(P(paragraph,styles["body"]))
    for item in bullets: story.append(bullet(item,styles))

def table(rows,widths,styles,header=True):
    rendered=[]
    for row_index,row in enumerate(rows):
        rendered.append([cell if isinstance(cell,Paragraph) else P(esc(cell),styles["head"] if header and row_index==0 else styles["cell"]) for cell in row])
    result=Table(rendered,colWidths=widths,repeatRows=1 if header else 0,hAlign="LEFT")
    commands=[("VALIGN",(0,0),(-1,-1),"TOP"),("GRID",(0,0),(-1,-1),.35,RULE),
              ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),
              ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
    if header:
        commands += [("BACKGROUND",(0,0),(-1,0),FOREST),("TEXTCOLOR",(0,0),(-1,0),colors.white)]
        for row in range(2,len(rows),2): commands.append(("BACKGROUND",(0,row),(-1,row),colors.HexColor("#F7FAF7")))
    result.setStyle(TableStyle(commands)); return result

def tc(seconds):
    minute=int(seconds//60); return f"{minute}:{seconds-minute*60:05.2f}"

INCIDENTS=[
("V7-I01","Boss Letter answers are green on entry","A decoration pass applied visible classes without checking reveal state.","A semantic hidden state is useless if later CSS bypasses it.","Gate every visual class through the same reveal state; remove unconditional !important colour.","Inspect future marks and computed backgrounds before/after Next and Back.","At step 1 every future mark is transparent; one mark reveals per trigger and rewinds.","V7-BOSS-01"),
("V7-I02","Listening-only headings become green or rejection lines disappear","The authentic sheet was replaced by a synthetic view and listening hints reused a green evidence class.","Essay exclusion and listening completion are different meanings.","Keep the authentic six-heading sheet; persistent heading strikes remain while listening answers fill the fields.","Count six authentic headings, three persistent strikes and zero synthetic worksheets after every stage change.","Three listening-only headings remain struck; their fields still receive 10 episodes, October, Main dishes and Desserts.","V7-CLASS-01"),
("V7-I03","A/B is visible but unexplained","A storage abbreviation was exposed as learner-facing copy.","Correct internal semantics do not guarantee understandable UI.","Render two badges labelled Task A and Task B and an accessible name 'Task A plus Task B'.","Read visible text and accessible label without opening another panel.","The William heading communicates both tasks without slash-only shorthand.","V7-BADGE-01"),
("V7-I04","Two pin systems appear","lesson.js added a legacy pin layer and a later adapter added a modern layer.","Class-name parity cannot repair duplicate ownership.","Only V7 creates the timeline and pins; statically reject .seek-wrap/.pin-layer constructors.","Globally count timelines, pins and orphan layers—not only descendants of the preferred player.","Exactly one timeline and 17 pins exist; the toggle hides/shows all 17.","V7-PLAYER-01"),
("V7-I05","Pin label contradicts visible state","The toggle controlled only one of two layers and its label was not derived from actual visibility.","Control text and aria state must describe the current screen.","Derive label and aria-pressed from the one authoritative pin layer.","Compare hidden, aria-pressed and text after two toggles.","Visible pins say 'hide'; hidden pins say 'show'; aria-pressed agrees.","V7-PLAYER-01"),
("V7-I06","Transcript text wraps in a narrow column","One layer built speaker/copy grid rows; another flattened them while the grid CSS remained.","A wide window cannot compensate for broken internal structure.","V7 exclusively creates speech > speaker + copy and review may only decorate inside copy.","Assert 76 structured rows and a minimum copy width in both browsers.","Speaker column stays separate; copy remains readable after move/resize/review.","V7-TRANS-01"),
("V7-I07","Red line crosses a speaker name","The rejection class/background was attached to the whole grid row.","The rejected object is the utterance, not the speaker identity.","Apply rejection ink to .curation-transcript-copy only.","Compare row and copy computed background images.","Row and speaker have no line; rejected copy has the red line.","V7-TRANS-01"),
("V7-I08","Transcript does not follow playback","Programmatic smooth scrolling fired the same listener used to detect learner scrolling and disabled follow.","Programmatic and user intent are different events.","Only wheel/touch disables follow; guarded programmatic scroll retains follow state.","Play Cue 1 and verify active row is visible while follow remains pressed.","Current utterance centers smoothly in Chromium and Firefox; follow stays on.","V7-TRANS-03"),
("V7-I09","No reliable current-sentence highlight","Legacy paint used only reached/not reached and adapters disagreed over current rows.","Learners need the exact source currently being heard.","Derive the active turn solely from media time and apply is-current to one copy row.","At arbitrary playheads count exactly one current row.","One current utterance is visibly highlighted at all valid times.","V7-TRANS-03"),
("V7-I10","Answer appears with no visible route to its source","Boundary code wrote into a field without opening evidence or marking source/destination.","Correct data can still be pedagogically opaque.","At the endpoint outline the source, open related evidence and glow the destination before typewriting.","For each cue assert source, panel and destination current states.","Every insertion has an inspectable source-to-field path.","V7-ROUTE-01"),
("V7-I11","Stage 3 starts around 0:46 instead of 0:00","Cue start was defined as the answer utterance start.","The task is listening comprehension, not an answer-excerpt jukebox.","Separate playbackStart from sourceStart; Cue 1 playbackStart is media 426.000/display 0:00.","Fresh-load snapshot and coverage ledger.","Fresh entry displays 0:00 and plays greetings/context before the first answer.","V7-MEDIA-03"),
("V7-I12","Large parts of the recording are skipped","Every cue interval began at its own source utterance, leaving 279 seconds uncovered.","Source provenance and playback navigation were conflated.","Set Cue N playbackStart to Cue N-1 endpoint; keep sourceStart/sourceEnd separately.","Sum all intervals and compare with 412.790-second segment.","The 17 intervals cover 100% of the meeting with no gaps or overlap.","V7-MEDIA-02"),
("V7-I13","Next jumps over context","Next called listen(index+1), which sought to the next source start.","Next should continue listening, not teleport to the answer.","Replay/Next uses the next cue's playbackStart, equal to the prior endpoint.","Record playhead before and after Next.","The next interval begins exactly where the previous one stopped.","V7-NAV-01"),
("V7-I14","Pin click starts at the answer sentence","Pins used semantic sourceStart as playback start.","A stop-point pin represents an interval ending at that stop.","Pin replay seeks to playbackStart and plays the whole interval.","For all 17 pins compare initial playhead with ledger playbackStart.","Each pin replays complete context before its answer.","V7-NAV-01"),
("V7-I15","Audio says Flood but writes Desserts","cueIndex, playhead, done and destination were saved/restored independently.","A cue transaction needs one invariant, not four loosely related variables.","Version state; validate cue ID, interval, playhead, destination and text together; repair or reset.","Log cue ID, playhead, source span, destination and text at every boundary.","Flood can write only to William video; Desserts can write only to food kinds.","V7-CUE-02"),
("V7-I16","Reload in Cue 2 returns to Cue 1 and erases Cue 1","meeting.js fallback called listen(0) before V7 restored; lesson pause listener persisted the wrong tuple.","Bootstrap order is part of correctness.","Remove fallback and pause writer; restore once after V7 owns all handlers.","Reload mid-Cue 2 and compare cue, playhead, completedThrough and note text.","Cue 2 resumes at the same playhead and 10 episodes remains.","V7-STATE-02"),
("V7-I17","Leaving and returning resets the cue","Stage restoration called listen(savedCue,false), which also rewound completion and notes.","Navigation restoration must not masquerade as replay.","Stage return invokes controller activation without changing valid state.","Switch Podcast -> Categorize -> Podcast mid-cue.","Same cue/playhead and completed notes return unchanged.","V7-STATE-02"),
("V7-I18","Generated note duplicates or overwrites learner text","Several render/remount paths rebuilt fields from different generated snapshots.","Generated and learner-authored lines lacked separate ownership.","Filter known generated lines, preserve authored lines and project one canonical completed set.","Add learner text, remount three times and replay cues.","Generated lines are unique; learner text remains exact.","V7-NOTE-02"),
("V7-I19","Synthetic worksheet invents Staff training and merges headings","Legacy code modelled discussion topics rather than the printed note sheet.","Source fidelity requires authentic structure even when the audio mentions other topics.","Delete #notes23 path; map cues to six stable authentic textarea IDs.","Assert heading/field IDs and prohibit Staff training.","Six printed headings remain unchanged and each cue writes to an audited field.","V7-NOTE-01"),
("V7-I20","Progress shows 1/166","17 audio cues and about 149 review sentences were added into one total.","Different learner activities need hierarchical progress.","Primary listening counter is 1/17; review has its own labelled counter.","Inspect all Stage 3 counters before and after review begins.","No screen implies 166 audio stops.","V7-PROG-01"),
("V7-I21","Type 5 and Type 6 are combined on one sentence","A historical manual label spanning two sentences was reused as runtime type.","Provenance may be multi-sentence; runtime pedagogy may not.","Split runtime records: contact sentence Type 5, separate rumour sentence Type 6.","Inspect exact sentence records and UI labels.","Every sentence exposes one primary type without contradiction.","V7-TYPE-01"),
("V7-I22","Blue task colour hides purple syntax or vice versa","Two meanings competed for one background property.","Task ownership and grammar are independent semantic layers.","Use an outer task-colour sentence and inner purple syntax span.","Compare both computed backgrounds on 'William did flood...'.","Whole sentence remains blue; 'did flood' remains purple.","V7-VIS-01"),
("V7-I23","Modern class names exist but player is still legacy","Adapters decorated legacy DOM instead of replacing its lifecycle.","Visual selectors are not architectural evidence.","V7 rebuilds player/transcript DOM and owns every handler; validator rejects loaded V6 runtime.","Inspect hierarchy, owner handshake, global duplicates and forbidden patterns.","Runtime handshake is V7 continuous-single-owner and no competing layer remains.","V7-ARCH-01"),
("V7-I24","Old 30 ms boundary timer remains active","V6 cleared a timer only if the lexical constant was accessible; the old constructor still existed.","A dormant-looking timer can still race the canonical handler.","Delete the timer constructor and reject it statically.","Search production sources and observe one transaction per cue.","No polling timer exists; timeupdate produces one atomic transaction.","V7-ARCH-02"),
("V7-I25","Multiple render wrappers rewrite podcast DOM","Incremental compatibility patches wrapped render/update/nativePage repeatedly.","Stateful UI cannot have several uncoordinated owners.","V7 is the last and only podcast state owner; helpers may remount source content but not media state.","Static ownership scan plus repeated remount test.","Remount changes neither media state nor player/transcript count.","V7-REMOUNT-01"),
("V7-I26","Firefox startup shows a different transcript position","Restoration/follow timing depended on browser event order.","Cross-browser lifecycle timing is a requirement, not a variance.","Install V7 after helpers, activate deterministically and explicitly follow current turn.","Fresh Firefox run plus first real cue and screenshot.","Firefox begins at 0:00 and follows the same active sentence as Chromium.","V7-TEST-02"),
("V7-I27","CSS exists but animations/states do not occur","HTML/JS never attached the required classes to authentic elements or attached them too early.","A stylesheet definition is inert without lifecycle wiring.","Every motion class is assigned by the canonical state transition; reduced motion preserves final meaning.","Exercise reveal, strike, focus, route and typewriter in normal/reduced modes.","Animations are smooth and deterministic; reduced mode reaches the same final state.","V7-MOTION-01"),
("V7-I28","Keywords/routes were omitted from Boss Letter","The first pass summarised task meaning instead of auditing every authored phrase and source direction.","Curation must preserve exact task constraints before adding explanation.","Keep line-by-line marks for Teen NetChef TV, William Puddle, Dante email, three-course description, Viewer’s Choice and storyboard route.","Static source/row audit plus visible progression.","All specified keywords and source directions reveal in authored order.","V7-BOSS-01"),
("V7-I29","Verbatim manual content is skipped or invented","Manual explanations were paraphrased into a smaller custom dataset without a complete provenance ledger.","Additional teaching may be added, but authored text cannot silently change.","Validate 49/49 authored units; label additions and preserve source/manual page references.","Run verbatim/provenance validator and inspect search/source preview.","All authored units are exact; additions are distinguishable and traceable.","V7-SRC-01"),
("V7-I30","Browser test passes while live duplicate pins fail","The test replaced lesson.js and counted pins only inside the preferred timeline.","A test that changes production behaviour cannot certify production.","Load unmodified production scripts and count all global orphan layers.","Static integrity scan plus browser global DOM audit.","The exact production bundle is tested and duplicate layers fail CI.","V7-TEST-01"),
("V7-I31","Cue test passes while natural playback is wrong","The test jumped to end-.12 and called note helpers directly.","Lookup-table correctness is not playback correctness.","Play every complete interval against the real MP3 at accelerated rate and wait for real boundary events.","Archive all 17 transactions and compare start/end/destination/text.","All real audio intervals stop and write exactly once to audited fields.","V7-CUE-03"),
("V7-I32","Workflow syntax-checks a test without executing it","node --check was mistaken for a behavioural gate.","Valid JavaScript may still implement the wrong experience.","Run the focused Playwright suite in Chromium and Firefox before artifact upload.","Workflow log must show test execution and evidence files.","Deployment cannot start if browser/audio assertions fail.","V7-CI-01"),
("V7-I33","GitHub deployment succeeds but site is non-conforming","Pages success proved artifact publication, not behaviour.","Transport success and product conformance are distinct states.","Keep candidate/tested/deployed/verified-live/conforming states and block the final claim without evidence.","Compare workflow, public release.json, runtime handshake and smoke result for one SHA.","A release is called conforming only when all evidence matches the deployed SHA.","V7-GOV-02"),
("V7-I34","Old tab continues running stale code","release.json cannot replace JavaScript already loaded into memory.","Cache/version lifecycle must be visible and testable.","Expose runtime architecture/SHA, use cache-busted verification and prompt controlled reload on mismatch.","Compare public release.json, URL release parameter and runtime handshake.","The user can identify and recover from an obsolete runtime without clearing all browser data.","V7-LIVE-01"),
("V7-I35","Manual says 'fully covered' while implementation violates it","Requirements were written but not bound to an owner, executable gate or evidence.","Documentation is not enforcement.","Every requirement maps to code owner, test, CI gate and archived evidence.","Validate the machine-readable manifest and require evidence artifact.","No normative claim exists without an enforceable proof path.","V7-GOV-01"),
("V7-I36","Manual versions accumulate conflicts and reactive patches","Each edition appended fixes while preserving contradictory older wording.","A golden standard must be consolidated and precedence must be explicit.","V7 appendix overrides V6 for every listed area; V6 is historical annex only.","Search for conflict and apply V7 authority rule.","Implementers use one current rule set; history remains available but non-normative.","V7-GOV-01"),
("V7-I37","Evidence panel does not follow the current cue","Panels were independent disclosure widgets with no boundary connection.","The learner should see why and where a note is written.","Open the current field's panel and focus its source range at the boundary.","For every cue assert the correct panel is open.","Current recording evidence and destination stay visibly paired.","V7-ROUTE-01"),
("V7-I38","Transcript window overlaps/clips and reset does not recover","Legacy fixed geometry and later drag/resize styles disagreed.","User-controlled geometry needs one bounded coordinate system and recovery action.","V7 owns drag/resize constraints and Fit resets beside the player.","Drag/resize to extremes, invoke Fit and measure viewport bounds.","Window remains readable/in viewport and Fit restores a usable layout.","V7-TRANS-04"),
("V7-I39","No cue timestamp/source quote makes errors hard to diagnose","Generated notes stored only answer text.","Runtime observability was insufficient for alignment failures.","Log cue ID, playback start, source span, endpoint, destination, text, architecture and SHA.","Inspect archived ledger for every stop.","A wrong insertion can be traced to one measured transaction.","V7-TROUBLE-01"),
("V7-I40","Listening-only is confused with useless noise","One visual rejection treatment was interpreted as 'do not listen'.","Essay usefulness and note-taking obligation are separate axes.","Explain strikes on screen and keep listening answers active under struck headings.","Verify classification copy plus completed fields.","Learner understands why a struck heading still receives notes.","V7-CLASS-01")
]

def incident_block(item,styles):
    iid,symptom,cause,rationale,fix,trouble,expected,test=item
    body=(f"<b>{esc(iid)} - {esc(symptom)}</b><br/>"
          f"<b>Root cause:</b> {esc(cause)}<br/>"
          f"<b>Rationale:</b> {esc(rationale)}<br/>"
          f"<b>Required correction:</b> {esc(fix)}<br/>"
          f"<b>Troubleshooting:</b> {esc(trouble)}<br/>"
          f"<b>Expected result:</b> {esc(expected)}<br/>"
          f"<b>Regression requirement:</b> {esc(test)}")
    return P(body,styles["incident"])

def build_appendix(path,manifest):
    styles=get_styles()
    doc=BaseDocTemplate(str(path),pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=21*mm,bottomMargin=20*mm,
      title="Paper 3 Super Curation Golden Manual 2025 B2 V7.0",
      author="Edmund Education",subject="V7 corrective appendix, implementation and conformance standard")
    frame=Frame(doc.leftMargin,doc.bottomMargin,doc.width,doc.height,id="body")
    doc.addPageTemplates(PageTemplate(id="v7",frames=[frame],onPage=chrome))
    story=[Spacer(1,28*mm),P("PAPER 3 SUPER CURATION",styles["title"]),P("Golden Manual - 2025 B2 - V7.0",styles["sub"]),
           Spacer(1,6*mm),P("CORRECTIVE APPENDIX AND ENFORCEABLE IMPLEMENTATION STANDARD",styles["call"]),
           P("Release date: 4 November 2026<br/>Scope: 2025 B2 design system and the 2023 B2 live implementation<br/>Status: normative candidate; the exact deployed SHA becomes conforming only after all V7 gates pass.",styles["body"]),
           Spacer(1,7*mm),P("V7 explicitly corrects V6's central specification error: V6 modelled each stop as an isolated answer-bearing excerpt. V7 requires continuous listening from 0:00, with playbackStart separated from sourceStart/sourceEnd.",styles["warn"]),
           Spacer(1,12*mm),P("This appendix records every known failure, root cause, rationale, correction, diagnostic procedure, expected result and release-blocking regression test. V6 is retained after the divider as historical evidence only.",styles["call"]),PageBreak()]

    section(story,"1. Authority and correction notice",styles,[
      "V7 is the only normative authority for the areas covered here. When V6 or an earlier edition conflicts with V7, V7 wins. A successful PDF generation, git push or GitHub Pages deployment is not proof of conformance.",
      "The current implementation profile is podcast-v7.js with runtime handshake 7-continuous-single-owner. V7 remains a candidate until the exact live SHA passes static, Chromium, Firefox, real-audio, artifact and live verification gates."
    ],[
      "MUST means release-blocking.",
      "Older manuals are historical evidence, not supplementary requirements.",
      "No approved variance may weaken source fidelity, continuous audio, single ownership, learner-note preservation or live-SHA verification.",
      "All test evidence is tied to one commit SHA and cache-busted public URL."
    ])
    story.append(P("Requirement -> code owner -> executable test -> mandatory CI gate -> retained evidence -> public SHA",styles["mono"]))
    story.append(PageBreak())

    section(story,"2. What V6 got wrong and what V7 changes",styles)
    story.append(table([
      ["Area","V6 failure","V7 correction","Expected result"],
      ["Cue interval","start = answer utterance start","playbackStart = previous endpoint; sourceStart/sourceEnd retained separately","100% of 6:52.790 segment is heard"],
      ["Fresh entry","Could restore or seek to 0:46","Always Cue 1/17 at display 0:00 for fresh state","No answers, strikes or generated notes visible"],
      ["Ownership","Legacy constructors/writers remained","V7 is sole active owner; forbidden patterns fail static gate","No timer, pause writer, fallback or alternate runtime"],
      ["Restore","Independent cue/time/done tuple","Versioned invariant with completedThrough","Reload and chapter return preserve cue, playhead and notes"],
      ["Testing","Endpoint jumps and class presence","Complete real-audio intervals plus lifecycle journeys","Misalignment and architecture defects fail before deployment"],
      ["Certification","Requirements treated as proof","Exact-SHA evidence is required","Only verified live release may be called conforming"]
    ],[28*mm,43*mm,57*mm,39*mm],styles))
    story.append(P("V6 pages are appended only to preserve audit history. Do not implement their isolated cue ledger.",styles["warn"]))
    story.append(PageBreak())

    section(story,"3. Non-negotiable runtime invariants",styles,bullets=[
      "One active owner: podcast-v7.js controls audio handlers, cue state, boundaries, transcript projection, note transactions and podcast persistence.",
      "Authentic source: six printed page-3 textareas are the only note surface.",
      "Continuous coverage: Cue 1 playbackStart = 426.000; Cue N playbackStart = Cue N-1 sourceEnd.",
      "Fresh state: display 0:00, Cue 1/17, completedThrough = -1, zero transcript reveals, zero generated note lines.",
      "Atomic boundary: sourceEnd reached, audio paused, cue logged, source connected, exact destination focused, one answer written.",
      "Single visual structure: one player, one transcript, one timeline, one pin layer, 17 pins, 76 structured transcript rows.",
      "Deterministic state: cue ID, playhead, done, completedThrough, destination and text agree or state is repaired/reset.",
      "Proof: complete real MP3 playback is mandatory; direct note calls and endpoint-only jumps cannot certify alignment."
    ])
    story.append(P("Invariant: union([playbackStart, sourceEnd] for cues 1..17) = [426.000, 838.790], with adjacent boundaries equal and no gaps or overlaps.",styles["mono"]))

    section(story,"4. Required code actions and ownership",styles)
    story.append(table([
      ["Component","Permitted responsibility","Required action","Prohibited action"],
      ["meeting.js","Audited cue data, Audio primitive, host primitives","No bootstrap fallback and no timer","No active boundary, navigation or restore ownership"],
      ["lesson.js","General lesson rows and non-podcast persistence","Delegate podcast persistence to controller","No listen wrapper or pause-state writer"],
      ["podcast-v4.js","Authentic sheet IDs, classification, evidence panels, note merge helper","Remain a content/view helper","No player, boundary or persisted cue owner"],
      ["podcast-v7.js","All Stage 3 runtime state and UI","Own player, transcript, cues, restore, follow and note transactions","No legacy fallback"],
      ["interactions.js","Curation shell and later sentence-review sub-stage","Delegate listening controls to V7","No transcript flattening or media reset"],
      ["build script","Deterministic embedding","Load V7 and remove V5/V6 tags","No stale runtime in generated HTML"],
      ["CI","Static, browsers, real audio, evidence, live SHA","Run production bundle unmodified","No syntax-only or class-only certification"]
    ],[28*mm,42*mm,55*mm,42*mm],styles))
    story.append(PageBreak())

    section(story,"5. Canonical continuous 17-cue ledger",styles,[
      "Absolute media origin is 426.000. Displayed time subtracts 426.000. playbackStart controls navigation; sourceStart/sourceEnd identify the answer-bearing utterance. The gap between playbackStart and sourceStart is required context, not dead space."
    ])
    source=[
      (472.86,477.00,"Live, Study, Cook","10 episodes","Listening-only"),(480.18,490.26,"Filming schedule","Filming postponed until October","Listening-only"),
      (505.08,514.50,"Kinds of food","Main dishes","Listening-only"),(520.74,529.14,"Kinds of food","Desserts","Listening-only"),
      (548.40,553.22,"William video","Flood in the test kitchen","Task A"),(556.20,564.76,"William video","Food safety allegations may be misunderstandings","Task A"),
      (581.69,589.45,"William video","Watering eyes from chopping onions","Task A"),(600.03,608.80,"William video","Social media training for staff","Task B"),
      (612.86,626.56,"William video","Communicate clearly and avoid offence","Task B"),(663.39,674.05,"William video","First ten to finish all three courses earn an extra day off","Task B"),
      (707.84,713.80,"Golden Sun","Burnt toast","Listening-only"),(734.37,739.05,"Golden Sun","Fire safety training","Task B"),
      (762.87,772.78,"Golden Sun","Offer $5,000 for the private kitchen","Listening-only"),(777.96,789.93,"Viewer's Choice","New show: Viewer's Choice","Task C"),
      (792.83,806.55,"Viewer's Choice","Interactive: viewers choose the ingredients","Task C"),(819.73,825.63,"Viewer's Choice","Fully live","Task C"),
      (833.35,838.79,"Viewer's Choice","End of meeting; no generated answer","Listening-only")
    ]
    cue_rows=[["ID","Playback (display)","Source (display)","Destination","Generated note","Use"]]
    previous=426.0
    for index,(start,end,destination,note,use) in enumerate(source,1):
        cue_rows.append([f"{index:02d}",f"{tc(previous-426)}-{tc(end-426)}",f"{tc(start-426)}-{tc(end-426)}",destination,note,use]); previous=end
    story.append(table(cue_rows,[10*mm,31*mm,31*mm,28*mm,48*mm,19*mm],styles))
    story.append(P("Coverage check: first playbackStart 0:00.00; last endpoint 6:52.79; summed continuous intervals 6:52.79; uncovered time 0.00 seconds.",styles["call"]))
    story.append(PageBreak())

    section(story,"6. State machine, restore order and expected states",styles)
    story.append(table([
      ["State","Entry invariant","Allowed action","Exit/expected result"],
      ["Fresh","cue 1; time 426; done false; completedThrough -1","Play, seek, pin replay","No premature transcript/note marks"],
      ["Playing","playhead inside current continuous interval","Pause; user scroll disables follow","Active transcript row follows time"],
      ["Boundary lock","playhead = sourceEnd; transaction locked","No second boundary/write","One logged transaction; destination focused"],
      ["Completed cue","done true; completedThrough = cue index","Next or replay","Next starts at same endpoint; replay starts playbackStart"],
      ["Restored","V7 tuple validated before projection","Resume or navigate","Same cue/playhead/notes; invalid tuples reset"],
      ["Review sub-stage","All 17 cue transactions completed","Review sentences separately","Review counter never changes audio denominator"]
    ],[28*mm,52*mm,43*mm,44*mm],styles))
    story.append(P("Bootstrap order: create primitives -> load audited content/helpers -> install V7 handlers and DOM -> validate V7 state once -> project transcript/notes once -> enable controls.",styles["mono"]))
    story.append(PageBreak())

    section(story,"7. Complete incident registry",styles,[
      f"The registry contains {len(INCIDENTS)} known failure classes. Each is release-blocking when applicable. A visual symptom is never closed until the root cause, expected state and regression evidence all agree."
    ])
    for index,item in enumerate(INCIDENTS):
        story.append(incident_block(item,styles))
        if index and index%4==3: story.append(PageBreak())

    section(story,"8. Troubleshooting decision procedures",styles)
    story.append(table([
      ["Symptom","Measure first","Likely cause","Required diagnostic/fix","Expected result"],
      ["Starts after 0:00","architecture, cue ID, media time, playbackStart","stale runtime or sourceStart used as playback start","Verify V7 handshake; inspect cue ledger; reset invalid pre-V7 state","Cue 1 at 426/display 0:00"],
      ["Wrong answer writes","cue ID, playhead, source span, destination, completedThrough","invalid tuple or competing boundary","Inspect transaction log and owner scan; reject mismatch","Exact cue writes exact audited field"],
      ["Reload loses note","saved V7 tuple before/after pagehide","fallback/anonymous pause writer","Scan meeting/lesson; require one restore","Same cue/playhead/note after reload"],
      ["Transcript not following","follow aria state, current turn, scroll event source","programmatic scroll treated as user intent","Use wheel/touch to disable; guard programmatic scroll","Current row visible, follow stays on"],
      ["Narrow transcript","speech children and copy width","flattened DOM under grid CSS","Rebuild 76 structured rows; reject rewriter","Copy width above minimum"],
      ["Duplicate pins","global timeline/pin/orphan counts","legacy marker constructor remains","Static scan and global DOM count","One timeline; 17 pins"],
      ["Premature colours","reveal classes and computed styles at fresh entry","decorator bypasses semantic state","Trace class writer; remove unconditional rule","Zero initial answer/rejection marks"],
      ["Live differs from test","release.json, query SHA, runtime handshake","stale tab/artifact or test modified bundle","Cache-busted live test; compare exact SHA","Live runtime and evidence share SHA"]
    ],[30*mm,37*mm,35*mm,43*mm,22*mm],styles))
    story.append(PageBreak())

    section(story,"9. Mandatory acceptance journeys and exact expected results",styles,bullets=[
      "Fresh Chromium and Firefox: V7 handshake, 0:00 / 6:52, Cue 1/17, no transcript reveals/strikes, six empty generated fields, one current turn.",
      "Cue 1 natural journey: play the full 0:00-0:51 interval; transcript follows; stop at audited endpoint; write only '10 episodes' to Live, Study, Cook.",
      "Next: Cue 2 begins at Cue 1 endpoint, not at Cue 2 sourceStart.",
      "Reload mid-Cue 2: restore cue, playhead, completedThrough 0 and Cue 1 note.",
      "Chapter return mid-Cue 2: identical restore without note loss.",
      "All-cue journey: play all 17 complete intervals against meeting.mp3; every transaction matches start/end/destination/text; no duplicate writes.",
      "Transcript: 76 structured rows; source/current states visible; rejection line only on copy; programmatic follow stays enabled.",
      "Visual structure: one player/transcript/timeline, 17 pins, zero orphan layers or synthetic note sheets.",
      "Content: six authentic headings; Task A + Task B badges; Type 5 contact and separate Type 6 rumour; nested blue plus purple model colour.",
      "Live: release.json SHA, cache-busted URL SHA and V7 runtime handshake agree."
    ])
    story.append(P("Any failed expected result blocks the conforming claim and deployment unless the release is rolled back or an explicitly non-waivable defect is corrected.",styles["warn"]))

    section(story,"10. Release gate and evidence packet",styles)
    story.append(table([
      ["Gate","Command/operation","Required evidence","Blocks"],
      ["Static","validate verbatim + validate-v7-requirements + syntax","49/49 provenance and 41/41 traceability","Build"],
      ["Browser/audio","check-2023-b2-v7.cjs in Chromium and Firefox","screenshots + 17-cue JSON ledger + zero page errors","Artifact upload"],
      ["Artifact","protected-content and deterministic-build checks","artifact ID and source SHA","Deploy"],
      ["Deployment","GitHub Pages publication","workflow/job URLs","Live verification"],
      ["Live","release.json + cache-busted public runtime + functional smoke","public SHA, V7 handshake and smoke result","Conforming status"]
    ],[25*mm,58*mm,54*mm,30*mm],styles))
    story.append(P("Required archive: commit SHA; public URL with release query; workflow URL; Chromium screenshot; Firefox screenshot; 17-cue transaction ledger; static reports; browser output; release.json; runtime handshake; approved variances; rollback target.",styles["call"]))
    story.append(PageBreak())

    section(story,"11. Machine-readable traceability manifest",styles,[
      "The table below is generated from tools/paper3/v7-requirements.json. Empty owner, test, gate or evidence fields are invalid. The manifest is a gate input, not a ceremonial appendix."
    ])
    rows=[["ID","Rule","Owner","Gate / evidence"]]
    for requirement in manifest["requirements"]:
        rows.append([requirement["id"],requirement["rule"],requirement["owner"],requirement["gate"]+" / "+requirement["evidence"]])
    story.append(table(rows,[24*mm,79*mm,31*mm,33*mm],styles))
    story.append(PageBreak())

    section(story,"12. Definition of done and change control",styles,bullets=[
      "No known incident in Section 7 is reproducible on the candidate SHA.",
      "Static validator reports all V7 requirements mapped and no prohibited owner remains.",
      "Chromium and Firefox gates pass against the production bundle.",
      "All 17 complete intervals pass against the real MP3 and the ledger is archived.",
      "Reload, chapter return, remount and learner-note preservation pass.",
      "Live release.json and V7 handshake match the intended SHA.",
      "Screenshots and logs are reviewed, not merely generated.",
      "The release report names zero unresolved mandatory variances."
    ])
    story.append(P("Future changes to cue timing, ownership, persistence or transcript structure require a V7 manifest/test update in the same commit. No appendix may declare an incident closed before the exact-SHA evidence exists.",styles["warn"]))
    story.append(Spacer(1,12*mm))
    story.append(P("END OF V7 NORMATIVE CORRECTIVE APPENDIX",styles["call"]))
    doc.build(story)

def divider(path):
    styles=get_styles()
    doc=BaseDocTemplate(str(path),pagesize=A4,leftMargin=22*mm,rightMargin=22*mm,topMargin=22*mm,bottomMargin=22*mm,
      title="V6 historical annex divider")
    frame=Frame(doc.leftMargin,doc.bottomMargin,doc.width,doc.height,id="divider")
    doc.addPageTemplates(PageTemplate(id="divider",frames=[frame],onPage=chrome))
    doc.build([Spacer(1,50*mm),P("HISTORICAL ANNEX",styles["title"]),P("Complete V6 manual - retained for audit history only",styles["sub"]),
               Spacer(1,12*mm),P("The pages after this divider are non-normative. Where they conflict with V7—especially isolated cue intervals, ownership, restore order, testing or certification—V7 controls.",styles["warn"])])

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--manifest",required=True,type=Path)
    parser.add_argument("--previous",required=True,type=Path)
    parser.add_argument("--output",required=True,type=Path)
    args=parser.parse_args()
    manifest=json.loads(args.manifest.read_text())
    args.output.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory() as temp:
        temp=Path(temp); appendix=temp/"v7-appendix.pdf"; divide=temp/"divider.pdf"
        build_appendix(appendix,manifest); divider(divide)
        writer=PdfWriter()
        for source in (appendix,divide,args.previous):
            for page in PdfReader(str(source)).pages: writer.add_page(page)
        writer.add_metadata({
          "/Title":"Paper 3 Super Curation Golden Manual 2025 B2 V7.0",
          "/Author":"Edmund Education",
          "/Subject":"V7 corrective appendix, complete incident registry, troubleshooting and enforceable release standard",
          "/Keywords":"Paper 3, Super Curation, Golden Manual, V7, continuous audio, conformance"
        })
        with args.output.open("wb") as handle: writer.write(handle)
    print(f"Wrote {args.output} ({len(PdfReader(str(args.output)).pages)} pages)")

if __name__=="__main__": main()
