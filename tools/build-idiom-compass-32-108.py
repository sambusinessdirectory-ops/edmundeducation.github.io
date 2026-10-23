"""Build source-preserving Compass guides and deterministic four-choice practice.
Human review: none, per explicit owner instruction. Generated contrasts are
traceable edits, with editorial exceptions retained in the release report.
"""
from pathlib import Path
import json,re,hashlib,collections
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'content/idiom-compass-32-108'
def norm(s):return re.sub(r'\s+',' ',s).strip().replace('’',"'").lower()
def caps(s,old):return s[:1].upper()+s[1:] if old[:1].isupper() else s
lessons={}
for n in range(32,109):
 lessons[n]=json.loads(next((ROOT/'tools/idiom-lessons').glob(f'lesson-{n:03}-*.json')).read_text())['lesson']
authored={};current=None
for line in (OUT/'extensions.txt').read_text().splitlines():
 if not line.strip():continue
 if line.startswith('@'):
  n,ben,bzh,f1,r1,f2,r2=line[1:].split('|');current=int(n)
  authored[current]={'boundaryEn':ben,'boundary':bzh,'false':[(f1,r1),(f2,r2)],'bonus':[]}
 else:
  theme,text,zh=line.split('|');m=re.search(r'\[([^\[\]]+)=>([^\[\]]+)\]',text)
  assert m,(current,text)
  answer=text[:m.start()]+m[1]+text[m.end():];prompt=text[:m.start()]+m[2]+text[m.end():]
  number=51+len(authored[current]['bonus']);lid=lessons[current]['id']
  authored[current]['bonus'].append({'id':f'{lid}-q{number}','number':number,'theme':theme,'prompt':prompt,'promptZh':zh,'answer':answer,'answerZh':zh,'highlight':m[1],'bonus':True})
assert set(authored)==set(range(32,109))
# Each contrast changes a stated fact, outside the target phrase. Reasons name
# the actual changed words and explain the type of semantic change in Chinese.
PAIRS=[
 ('before','after','時間先後'),('after','before','時間先後'),('until','after','時間界線'),
 ('without','with','有無該條件'),('with','without','有無該條件'),
 ('always','never','發生頻率'),('never','always','發生頻率'),('every','no','發生頻率'),('often','never','發生頻率'),('sometimes','always','發生頻率'),
 ('repeatedly','once','重複次數'),('constantly','occasionally','發生頻率'),('usually','rarely','發生頻率'),('rarely','usually','發生頻率'),
 ('first','last','先後次序'),('last','first','先後次序'),('early','late','時間早晚'),('late','early','時間早晚'),
 ('yesterday','tomorrow','日期'),('tomorrow','yesterday','日期'),('today','yesterday','日期'),('tonight','last night','日期'),
 ('morning','evening','時段'),('evening','morning','時段'),('night','afternoon','時段'),('afternoon','morning','時段'),
 ('Monday','Friday','星期'),('Tuesday','Saturday','星期'),('Wednesday','Sunday','星期'),('Thursday','Monday','星期'),('Friday','Monday','星期'),('Saturday','Tuesday','星期'),('Sunday','Wednesday','星期'),
 ('two','three','數量'),('three','five','數量'),('four','six','數量'),('five','ten','數量'),('six','two','數量'),('ten','twenty','數量'),
 ('months','days','時間長短'),('weeks','years','時間長短'),('years','weeks','時間長短'),('hours','minutes','時間長短'),('minutes','hours','時間長短'),
 ('winning','losing','結果'),('losing','winning','結果'),('won','lost','結果'),('lost','won','結果'),('success','failure','結果'),('failure','success','結果'),
 ('refused','agreed','取態'),('agreed','refused','取態'),('accepted','rejected','取態'),('rejected','accepted','取態'),
 ('increased','decreased','變化方向'),('decreased','increased','變化方向'),('rising','falling','變化方向'),('falling','rising','變化方向'),
 ('cheaper','more expensive','價格'),('expensive','cheap','價格'),('high','low','程度'),('low','high','程度'),('higher','lower','程度'),('lower','higher','程度'),
 ('dangerous','safe','安全條件'),('safe','dangerous','安全條件'),('unsafe','safe','安全條件'),('unfair','fair','公平與否'),('fair','unfair','公平與否'),
 ('dishonest','honest','誠實與否'),('honest','dishonest','誠實與否'),('false','true','真假'),('true','false','真假'),
 ('quiet','noisy','環境情況'),('noisy','quiet','環境情況'),('angry','calm','情緒'),('calm','angry','情緒'),('nervous','relaxed','情緒'),
 ('public','private','公開程度'),('private','public','公開程度'),('alone','together','參與方式'),('together','alone','參與方式'),
 ('old','new','新舊'),('new','old','新舊'),('younger','older','年齡關係'),('older','younger','年齡關係'),
 ('deadline','budget','關注事項'),('prices','opening hours','競爭條件'),('price','delivery date','關注事項'),('noise','parking','爭議事項'),
 ('money','equipment','涉及事物'),('budget','timetable','涉及事項'),('timetable','budget','涉及事項'),('heating','lighting','設備'),
 ('door','window','涉及物件'),('window','door','涉及物件'),('roof','floor','位置'),('floor','roof','位置'),
 ('report','invoice','文件種類'),('contract','receipt','文件種類'),('receipt','ticket','文件種類'),('ticket','receipt','文件種類'),
 ('laptop','printer','設備'),('printer','camera','設備'),('camera','radio','設備'),('radio','computer','設備'),('phone','tablet','設備'),
 ('exam','interview','考核活動'),('interview','rehearsal','活動'),('rehearsal','audition','活動'),('meeting','training session','活動'),
 ('homework','lunch','涉及事項'),('training','advertising','活動'),('cleaning','decorating','工作內容'),('reading','writing','活動'),
 ('birthday','retirement','場合'),('rent','wages','款項種類'),('wages','rent','款項種類'),('water','electricity','資源'),
 ('notebook','wallet','涉及物件'),('keys','coins','涉及物件'),('cake','bread','食物'),('soup','salad','食物'),
 ('bus','train','交通工具'),('train','ferry','交通工具'),('ferry','coach','交通工具'),('flight','coach journey','交通方式'),
 ('school','office','場所'),('office','school','場所'),('kitchen','garden','場所'),('garden','kitchen','場所'),('hall','library','場所'),('library','hall','場所'),
 ('river','canal','場所'),('road','path','場所'),('park','beach','場所'),('beach','park','場所'),('shop','warehouse','場所')]
# Avoid changing an actor merely to make the option obviously irrelevant.
ACTORS={'school','office','shop','kitchen','garden','hall','library','café','restaurant','team','company'}
# Editorial exceptions preserve canonical answer text and stable IDs.
overrides=json.loads((OUT/'overrides.json').read_text())

def detail_foils(q):
 answer=q['answer'];lo=answer.lower();hi=lo.find(q['highlight'].lower());end=hi+len(q['highlight']);out=[]
 for old,new,axis in PAIRS:
  for m in re.finditer(r'(?<!\w)'+re.escape(old)+r'(?!\w)',answer,re.I):
   if m.start()<end and m.end()>hi:continue
   if not re.search(r'(?<!\w)'+re.escape(old)+r'(?!\w)',q['prompt'],re.I):continue
   # Don't swap nouns in the subject. Local factual objects/settings may change.
   if old in ACTORS or old in ['every','alone','together','water','won','lost','refused','agreed','today','tonight','yesterday','tomorrow','prices','report','private','public','night','with','without','first','last']:continue
   if old in ['door','window'] and re.search(r'next\s+$',answer[:m.start()],re.I):continue
   # preposition replacement can break the argument structure or change negation twice
   if old in ['with','without'] and (m.start()<hi or q['answer'][max(0,m.start()-8):m.start()].endswith('together ')):continue
   if old in ['before','after','until'] and not re.match(r'\s+[A-Za-z]',answer[m.end():]):continue
   replacement=caps(new,m[0]);text=answer[:m.start()]+replacement+answer[m.end():]
   text=re.sub(r'\ba old\b','an old',text);text=re.sub(r'\ban new\b','a new',text)
   reason=f'這句把「{m[0]}」改成「{replacement}」，改變了原題的{axis}，未保留題目所述情況。'
   out.append((text,reason,axis,m[0],replacement));break
 return out

grammar=json.loads((OUT/'grammar-contrasts.json').read_text())
# Use the parser's clause-aligned edits; keep the rule fallback only for the
# rare cases whose ordinary finite verb was mis-tagged as a noun.
def polarity_foils(q):
 entry=grammar.get(q['id'],{})
 assert entry.get('answerHash')==hashlib.sha256(q['answer'].encode()).hexdigest(),q['id']
 valid=[x for x in entry.get('candidates',[]) if x[2]=='polarity']
 return valid

def time_foil(q):
 entry=grammar.get(q['id'],{})
 assert entry.get('answerHash')==hashlib.sha256(q['answer'].encode()).hexdigest(),q['id']
 valid=[x for x in entry.get('candidates',[]) if x[2]=='certainty']
 return valid[0] if valid else None

# The source prompt is the verified idiom-free formulation. Do not transplant
# a context-specific paraphrase from another example into this sentence.
compact={norm(k):v for k,v in (line.split('|') for line in (OUT/'compact-paraphrases.txt').read_text().splitlines() if line)}
def plain_answer(q,l):
 if q.get('bonus'):return q['prompt']
 h=q['highlight'];plain=compact.get(norm(h))
 if plain and not (norm(h)=='turned over a new leaf' and 'I have' not in q['answer']):
  if h[0].isupper():plain=plain[0].upper()+plain[1:]
  i=q['answer'].lower().find(h.lower())
  return q['answer'][:i]+plain+q['answer'][i+len(h):]
 for target,plain in sorted(compact.items(),key=lambda p:len(p[0]),reverse=True):
  m=re.search(r'(?<!\w)'+re.escape(target).replace("'", "['’]")+r'(?!\w)',q['answer'],re.I)
  if m:
   if m[0][0].isupper():plain=plain[0].upper()+plain[1:]
   if 'my behaviour' in plain:continue
   return q['answer'][:m.start()]+plain+q['answer'][m.end():]
 return q['prompt']

stats=collections.Counter();exceptions=[];allitems={};guides={};ledger=[]
def item(q,l):
 if q['id'] in overrides:
  o=overrides[q['id']];foils=[(x['text'],x['reason'],x.get('kind','editorial'),'','') for x in o['foils']];correct=o.get('correctText',q['answer'])
 else:
  correct=q['answer'];ds=detail_foils(q);pol=polarity_foils(q);foils=[]
  # Prefer three contextual contrasts retaining the idiom. Use a source
  # paraphrase only when no third grammatical contextual contrast is available.
  if ds:foils.append(ds[0])
  if pol:foils.extend(x for x in pol if x[0] not in [z[0] for z in foils])
  if len(foils)<2 and len(ds)>1:foils.append(ds[1])
  if len(foils)<2:
   tf=time_foil(q)
   if tf and tf[0] not in [x[0] for x in foils]:foils.append(tf)
  if len(foils)<2 and len(ds)>1:foils.append(next(x for x in ds if x[0]!=foils[0][0]))
  if len(foils)<2:
   exceptions.append({'id':q['id'],'prompt':q['prompt'],'answer':correct,'highlight':q['highlight'],'foils':foils});return None
  paraphrase=plain_answer(q,l)
  # Canonical prompt must not already contain an accepted target surface form.
  tf=time_foil(q)
  if any(x[0] not in [v[0] for v in foils] for x in ds) or (tf and tf[0] not in [v[0] for v in foils]) or norm(q['highlight']) in norm(paraphrase) or len(paraphrase.split())>max(24,len(correct.split())*1.5):
   others=[x for x in ds if x[0] not in [v[0] for v in foils]]
   if others:foils.append(others[0])
   else:
    tf=time_foil(q)
    if tf and tf[0] not in [x[0] for x in foils]:foils.append(tf)
    else:
     foils.append((paraphrase,f'這句沒有使用指定慣用語「{q["highlight"]}」；本題要求保留原意並用上指定表達。','target-omission','',''))
  else:foils.append((paraphrase,f'這句說明「{q["promptZh"]}」，但沒有使用本課要求的「{q["highlight"]}」；題目要求保留意思並用上指定慣用語。','target-omission','',''))
  foils=foils[:3]
 if len(foils)!=3 or len(set(norm(x[0]) for x in foils+[ (correct,'','','','') ]))!=4:
  exceptions.append({'id':q['id'],'prompt':q['prompt'],'answer':correct,'highlight':q['highlight'],'foils':foils});return None
 correctReason=(overrides.get(q['id'],{}).get('correctReason') or f'「{q["highlight"]}」在這裏表達本課意思；整句保留「{q["answerZh"]}」的情境。')
 entries=[{'text':correct,'reason':correctReason,'id':q['id']+'-key','kind':'correct'}]+[{'text':x[0],'reason':x[1],'id':q['id']+f'-foil-{i+1}','kind':x[2]} for i,x in enumerate(foils)]
 entries.sort(key=lambda x:hashlib.sha256(('compass32-108-v1:'+x['id']).encode()).digest())
 correctAt=next(i for i,x in enumerate(entries) if x['kind']=='correct')
 for x in entries:stats[x['kind']]+=1
 wc=[len(x['text'].split()) for x in entries]
 if max(wc)>min(wc)*1.5:stats['length-flag']+=1
 ledger.append({'id':q['id'],'source':'authored-extension' if q.get('bonus') else l['source']['file'],'sourcePage':q.get('sourcePage'),'correctAt':correctAt,'optionIds':[x['id'] for x in entries],'contrasts':[x['kind'] for x in entries],'wordCounts':wc,'humanReview':False})
 return {'correctAt':correctAt,'options':[x['text'] for x in entries],'rationales':[x['reason'] for x in entries],'optionIds':[x['id'] for x in entries],'version':'20261023-compass32-108-v1'}

for n,l in lessons.items():
 a=authored[n];assert len(a['bonus'])==10
 for q in l['questions']+a['bonus']:
  built=item(q,l)
  if built:allitems[q['id']]=built
# Write gaps before guide construction, so unresolved items are never silently released.
(OUT/'build-gaps.json').write_text(json.dumps(exceptions,ensure_ascii=False,indent=2)+'\n')
print('Prepared items',len(allitems),'Gaps',len(exceptions),'Categories',dict(stats))
if exceptions:raise SystemExit('Resolve build-gaps.json before publication')

def choice(prompt,pzh,opts,reasons,feedback,fzh):
 return {'promptEn':prompt,'promptZh':pzh,'optionsEn':opts,'options':reasons,'correct':0,'feedbackEn':feedback,'feedback':fzh}
situations={}
for line in (OUT/'situation-decisions.txt').read_text().splitlines():
 parts=line.split('|');situations[int(parts[0])]=parts[1:]
assert set(situations)==set(lessons)
dossiers={d['order']:d for d in json.loads((ROOT/'content/idiom-super-curation-dossiers-31-108.json').read_text())['dossiers']}
for n,l in lessons.items():
 a=authored[n];q=l['questions'];register=l['register'];fixed=l['fixedVariable'];model=q[0];oral=q[35]
 # Use distinct examples for meaning, scene, response and oral transfer.
 scene=q[7];response=q[18];ci=allitems[response['id']];right=ci['correctAt'];wrong=[i for i in range(4) if i!=right and response['highlight'].lower() in ci['options'][i].lower()][:2]
 if len(wrong)<2:wrong=[i for i in range(4) if i!=right][:2]
 sc=allitems[scene['id']];scene_indices=[sc['correctAt']]+[i for i in range(4) if i!=sc['correctAt'] and scene['highlight'].lower() in sc['options'][i].lower()][:2]
 if len(scene_indices)<3:scene_indices=[sc['correctAt']]+[i for i in range(4) if i!=sc['correctAt']][:2]
 toneEn=register['labelEn'];toneZh=register['labelZh']
 if n in [43,69]:toneEn='Informal';toneZh='非正式'
 if n in [65,97]:toneEn='Conversational to neutral';toneZh='口語至中性'
 if n in [34,68,93,96,104]:
  social='It can sound judgemental; a neutral description may be more respectful.';socialzh='這個說法可能帶評價意味；中性地描述情況往往更尊重對方。'
 elif n in [75,80]:
  social='It is a literary or marked expression; plain wording may be clearer in everyday instructions.';socialzh='這個說法帶文學或較鮮明色彩；日常指示用直接措辭可能更清楚。'
 elif n==76:
  social='It expresses strong disbelief and can sound sarcastic rather than reassuring.';socialzh='它表達強烈不信，可能帶諷刺，並非安慰語氣。'
 else:
  social=f'The register here is {toneEn.lower()}; the idiom adds a vivid interpretation.';socialzh=f'本課標示的語域是「{toneZh}」；慣用語為情況加上鮮明表達。'
 # Social claims concern register, not a second recycled meaning-choice trio.
 socialBad1='Its figurative wording makes it suitable only for highly ceremonial speeches.'
 socialBad2='Its use here is necessarily a personal insult, whatever the relationship.'
 if n in [34,68,93,96,104,62,72]:
  socialBad1='It offers straightforward praise without judging anyone or anything.'
  socialBad2='It is a neutral description with no implication for how the subject is viewed.'
 if n in [75,80]:
  socialBad1='It is the plainest and most direct wording for a practical instruction.'
  socialBad2='It is modern technical terminology with a precise specialist definition.'
 if n==76:
  socialBad1='It sincerely reassures the listener that the predicted event will happen.'
  socialBad2='It cautiously asks for evidence without expressing disbelief.'
 guide={'meaningEn':dossiers[n]['meaningEn'],'meaningZh':dossiers[n]['meaningZh'],'modelEn':model['answer'],'modelZh':model['answerZh'],
 'pictureEn':l.get('origin',{}).get('memoryEn') or a['boundaryEn'],'picture':l.get('origin',{}).get('memoryZh') or a['boundary'],
 'boundaryEn':a['boundaryEn'],'boundary':a['boundary'],
 'whereEn':social,'where':socialzh,'toneEn':toneEn,'tone':toneZh,
 'formalEn':register.get('formalEn') or social,'formal':register.get('formalZh') or socialzh,
 'fixed':fixed['fixed'],'movingEn':fixed.get('variableEn') or 'Keep the idiom intact; match tense and person to the situation.',
 'moving':fixed.get('variableZh') or '保留慣用語的固定部分，按情況配合時態及主語。',
 'forms':list(dict.fromkeys(x.get('form','') for x in fixed.get('forms',[]) if x.get('form')))[:4],
 'checksEn':['Does the situation really support this meaning?',a['boundaryEn'],'Have I kept the original facts, tense and intended tone?'],
 'checks':['情境是否真的符合這個意思？',a['boundary'],'有否保留原有事實、時態及合適語氣？'],
 'readAloudEn':oral['answer'],'readAloudZh':oral['answerZh'],'bonusPractice':a['bonus'],
 'choices':{
  '2':choice(f'Which situation best fits the figurative meaning of “{l["titleEn"]}”?','哪個情境最符合本課慣用語的比喻意思？',
 situations[n][::2],[text+(' 這符合本課意思：' if i==0 else ' 這未能符合本課的關鍵條件：')+dossiers[n]['meaningZh'] for i,text in enumerate(situations[n][1::2])],dossiers[n]['meaningEn'],dossiers[n]['meaningZh']),
 '3':choice(f'{q[12]["answer"]} How should you assess the expression’s tone?',f'{q[12]["answerZh"]} 應怎樣判斷這個表達的語氣？',
 [social,socialBad1,socialBad2],[socialzh,'這個描述誤判了本句的語域或態度。'+socialzh,'這個描述未能配合本句的語氣。'+socialzh],social,socialzh),
 '5':choice(response['prompt']+' Which line would you use with the idiom?',response['promptZh']+' 哪句自然用上本課慣用語？',
 [ci['options'][right]]+[ci['options'][i] for i in wrong], [ci['rationales'][right]]+[ci['rationales'][i] for i in wrong],
 'The response keeps the meaning and uses the target expression.',response['answerZh']),
 '6':choice('Which claim stays within what this expression can establish?','哪個說法沒有超出這個表達能夠說明的範圍？',
 [a['boundaryEn'],a['false'][0][0],a['false'][1][0]],
 [a['boundary'],a['false'][0][1],a['false'][1][1]],a['boundaryEn'],a['boundary'])}}
 if not guide['forms']:guide['forms']=[l['titleEn']]
 assert len(set(x for c in guide['choices'].values() for x in c['optionsEn']))==12,l['id']
 guides[l['id']]=guide
payload='/* Source-linked Compass rollout, lessons 32–108; AI review, no human review. */\n(function registerCompass32To108(){\n'
payload+='const guides='+json.dumps(guides,ensure_ascii=False,separators=(',',':'))+';\n'
payload+='const items='+json.dumps(allitems,ensure_ascii=False,separators=(',',':'))+';\n'
payload+='window.EDMUND_IDIOM_COMPASS=Object.freeze({...window.EDMUND_IDIOM_COMPASS,...guides});\nwindow.EDMUND_IDIOM_COMPASS_ITEMS=Object.freeze({...window.EDMUND_IDIOM_COMPASS_ITEMS,...items});\n})();\n'
(ROOT/'idiom-compass-32-108-curation.js').write_text(payload)
(OUT/'item-ledger.json').write_text(json.dumps(ledger,ensure_ascii=False,separators=(',',':'))+'\n')
(OUT/'build-report.json').write_text(json.dumps({'lessons':77,'originalQuestions':3850,'extensions':770,'items':len(allitems),'choices':4*len(allitems),'guidedDecisions':308,'humanReviewedItems':0,'categories':dict(stats),'sourceIdsPreserved':True,'reviewMethod':'AI authored extension pairs and boundaries; deterministic source-preserving contrast assembly, automated checks and AI exception review. No independent human review.'},ensure_ascii=False,indent=2)+'\n')
print('Built',len(guides),'guides,',len(allitems),'items,',len(payload.encode()),'bytes')
