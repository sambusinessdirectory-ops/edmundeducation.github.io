#!/usr/bin/env python3
"""Build source-bound IELTS curation ledgers from authored explanations and real row timings.
Practice 2 retains its manually curated pilot ledger. Reviewed exceptions are explicit data.
No synthetic timings or model-generated answers are used.
"""
import json,re,hashlib,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'ielts-curation-data'
CONFIG=Path(__file__).with_name('super-curation-overrides.json')

def read_practice(n):
 if n!=1:return json.loads((ROOT/f'assets/listening/practices/practice-{n}.json').read_text())
 code="""const fs=require('node:fs'),vm=require('node:vm'),s={window:{}};for(const name of ['data','analysis','transcript','timings'])vm.runInNewContext(fs.readFileSync(`listening-practice-1-${name}.js`,'utf8'),s);const w=s.window;console.log(JSON.stringify({...w.EDMUND_IELTS_LISTENING_PRACTICE_1,practice:1,schemaVersion:1,analysis:w.EDMUND_IELTS_LISTENING_PRACTICE_1_ANALYSIS,transcript:w.EDMUND_IELTS_LISTENING_PRACTICE_1_TRANSCRIPT,timings:w.EDMUND_IELTS_LISTENING_PRACTICE_1_TIMINGS}));"""
 return json.loads(subprocess.check_output(['node','-e',code],cwd=ROOT))

def tokens(s):return [(m.group().lower().replace('’',"'"),m.start(),m.end()) for m in re.finditer(r"[a-zA-Z0-9]+(?:['’][a-zA-Z]+)?",s)]
def spans(quote,text):
 q=[t[0] for t in tokens(quote)];t=tokens(text)
 if len(q)<2 or '_' in quote:return []
 return [text[t[i][1]:t[i+len(q)-1][2]] for i in range(len(t)-len(q)+1) if [w[0] for w in t[i:i+len(q)]]==q]
def quotes(s):
 return [(piece,m.start()) for m in re.finditer(r'[“"]([^”"\n]+)[”"]',s) for piece in re.split(r'…|\.\.\.|(?<=[.!?])\s+',m.group(1)) if len(tokens(piece))>=2 and '_' not in piece]
def title_for(p):
 for b in p.get('sourceBlocks',[]):
  for line in b.get('text','').splitlines():
   line=line.strip(' =•●–')
   if len(line)<5 or len(line)>85 or '_' in line or re.match(r'(?:Part|Questions?|Write|Choose|Complete|Label|Match|You |NB|A |B |C |D |E |F |G )',line,re.I):continue
   if re.match(r'\d',line):continue
   return line
 return {1:'Restaurant recommendations',2:'Pottery workshop',3:'Loneliness',4:'Urban rivers'}[p['part']]

def build(data,config):
 n=data['practice'];ledger={'version':'2026-10-26.1','practice':n,'sourceSha256':data.get('source',{}).get('sha256'), 'timingBasis':'Existing recording-aligned transcript timestamps; explanation quotations matched to exact source spans, with explicit editorial endpoint reviews.','parts':[]}
 review=[]
 for p in data['parts']:
  part=p['part'];rows=data['transcript'][str(part)];timing=data['timings']['parts'][str(part)];ranges=timing['lines'];qs=p['questions']
  partKey=f'{n}.{part}';media=config.get('media',{}).get(partKey,{})
  instructions=' · '.join(dict.fromkeys(re.findall(r'(?:Write|Choose) [^\n]+', '\n'.join(b.get('text','') for b in p.get('sourceBlocks',[]))))) or p['instruction']
  lp={'part':part,'title':config.get('titles',{}).get(partKey,title_for(p)),'subtitle':p['instructionZh'],'instructions':instructions,'audioSha256':timing.get('audioSha256',media.get('audioSha256')),'transcriptSha256':hashlib.sha256(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),'audioUrl':timing.get('audioUrl',media.get('audioUrl')),'duration':media.get('duration',timing['duration']),'cues':[],'annotations':[]}
  anchors=[min(data['timings']['questions'][str(num)]['line'] for num in q.get('numbers',[q.get('number')])) for q in qs]
  lastEnd=-1
  for qi,q in enumerate(qs):
   numbers=q.get('numbers',[q.get('number')]);groupQuotes=[];trapQuotes=[];anchor=anchors[qi]
   # Stay in this question's discussion. Adjacent answers may share one source row.
   left=max(lastEnd,0);right=anchors[qi+1] if qi+1<len(qs) else len(rows)-1
   if right<anchor:right=anchor
   for num in numbers:
    explanation=data['analysis'][str(num)]['explanation']
    trapAt=explanation.find('中伏位')
    for quote,offset in quotes(explanation):
     matches=[]
     for i in range(left,min(len(rows),right+1)):
      for exact in spans(quote,rows[i]['en']):matches.append({'line':i,'quote':exact,'question':num})
     if not matches:continue
     # A short confirmation such as "It was" can recur in the next topic.
     # Resolve repeats to the nearest existing source anchor, not every occurrence.
     match=min(matches,key=lambda m:(abs(m['line']-anchor),m['line']))
     if trapAt>=0 and offset>trapAt:trapQuotes.append({**match,'why':explanation[trapAt:]})
     else:groupQuotes.append(match)
   # Primary anchor must be included even when the explanation paraphrases the audio.
   evidence=sorted({(m['line'],m['quote']) for m in groupQuotes if m['line']<=right},key=lambda v:(v[0],len(v[1]),v[1]))
   groupAnchors=[data['timings']['questions'][str(num)]['line'] for num in numbers]
   endpoint=max(groupAnchors+[i for i,_ in evidence]+[m['line'] for m in trapQuotes])
   if endpoint+1<right and re.match(r"^(?:[A-Z ]+:\s*)?(?:Yes|Yeah|True|Exactly|Certainly|Absolutely|Right|Indeed|Unquestionably|That's true|I agree|I think you're right|Me too|Me neither)[.! ,–]",rows[endpoint+1]['en']):endpoint+=1
   override=config.get('questions',{}).get(f'{n}.{numbers[0]}',{})
   endpoint=override.get('endLine',endpoint)
   startLine=override.get('startLine',min([anchor]+[i for i,_ in evidence]+[m['line'] for m in trapQuotes]))
   evidence=[(i,s) for i,s in evidence if startLine<=i<=endpoint]
   if 'evidence' in override:evidence=[(e['line'],e['quote']) for e in override['evidence']]
   fallback=False
   if not evidence:
    fallback=True;evidence=[(anchor,rows[anchor]['en'])]
   if endpoint<lastEnd:review.append({'practice':n,'questions':numbers,'issue':'nonmonotonic','anchor':anchor,'endLine':endpoint,'previous':lastEnd})
   lastEnd=endpoint
   # Deduplicate contained quotations to avoid layering the same highlight.
   evidence=[(i,s) for i,s in evidence if not any(i==j and s!=t and s in t for j,t in evidence)]
   distractors=[{'line':m['line'],'quote':m['quote'],'candidateAt':ranges[m['line']]['end'],'rejectAt':ranges[endpoint]['end'],'why':m['why']} for m in trapQuotes if startLine<=m['line']<=endpoint and not any(m['line']==i and (m['quote'] in text or text in m['quote']) for i,text in evidence)]
   distractors=list({(d['line'],d['quote']):d for d in distractors}.values())
   for offset,num in enumerate(numbers):
    answer=q['answers'][offset] if 'answers' in q else q['answer']
    cq={'id':f'p{part}-q{num}','question':num,'start':ranges[startLine]['start'],'end':ranges[endpoint]['end'],'endLine':endpoint,'answer':answer,'accepted':[answer,*q.get('alternatives',[])],'hint':('同組題目需選 '+str(len(numbers))+' 個答案，次序不限；先聽完整段討論再決定。' if len(numbers)>1 else '先讀原題及字數限制，留意空格前後的字。' if q['type']=='gap' else '先比較選項，聽清轉折、否定及說話者最後的決定。'),'paraphrase':'錄音：'+' / '.join(s for _,s in evidence[:2]),'evidence':[{'lineId':f'p{part}-line-{i}','line':i,'quote':s,'revealAt':ranges[i]['end']} for i,s in evidence],'distractors':override.get('distractors',distractors),'questionText':q['prompt']}
    if len(numbers)>1:cq['groupQuestions']=numbers
    lp['cues'].append(cq)
   review.append({'practice':n,'part':part,'questions':numbers,'anchor':anchor,'startLine':startLine,'endLine':endpoint,'fallback':fallback,'explanation':data['analysis'][str(numbers[0])]['explanation'],'evidence':evidence,'endText':rows[endpoint]['en'],'nextText':rows[endpoint+1]['en'] if endpoint+1<len(rows) else ''})
  for i,row in enumerate(rows):
   text=row['en'];role='context'
   if re.search(r'(?i)(?:you now have|you have (?:half a minute|\w+ seconds)|now,? (?:listen|turn)|first.*look at questions|that is the end of|you will hear|check your answers)',text):role='instruction'
   elif re.fullmatch(r"(?i)(?:[A-Z ]+:\s*)?(?:hello[.!]?|hi[.!]?|good (?:morning|afternoon)[.!]?|thanks[.!]?|thank you[.!]?|bye[.!]?)",text.strip()):role='noise'
   if any(e['line']==i for c in lp['cues'] for e in c['evidence']):role='evidence'
   lp['annotations'].append({'line':i,'role':role})
  ledger['parts'].append(lp)
 return ledger,review

if __name__=='__main__':
 config=json.loads(CONFIG.read_text());OUT.mkdir(parents=True,exist_ok=True);audit=[]
 for n in range(1,21):
  if n==2:continue
  ledger,review=build(read_practice(n),config);audit+=review
  if any(x.get('fallback') or x.get('issue') for x in review):raise RuntimeError(f'Practice {n} needs an explicit editorial review before publishing')
  (OUT/f'practice-{n}.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n')
 Path('/tmp/ielts-curation-review.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
 print('Built 19 ledgers; question groups:',len(audit),'fallback:',sum(x.get('fallback',False) for x in audit),'nonmonotonic:',sum(x.get('issue')=='nonmonotonic' for x in audit))
