"""Optional cache regeneration: spaCy 3.8, en_core_web_sm 3.8, lemminflect.
Normal content builds use the committed, answer-hashed contrast cache.
"""
import spacy,json,re,hashlib
from lemminflect import getInflection, getLemma
from pathlib import Path
root=Path(__file__).resolve().parents[1]
ns={'__file__':str(root/'tools/build-idiom-compass-109-138.py')}
exec((root/'tools/build-idiom-compass-109-138.py').read_text().split('stats=collections.Counter()')[0],ns)
qs=[q for n,l in ns['lessons'].items() for q in l['questions']+ns['authored'][n]['bonus']]
nlp=spacy.load('en_core_web_sm',disable=['ner'])
def swap(text,start,end,new):return text[:start]+new+text[end:]
def cap(new,old):return new[0].upper()+new[1:] if old[:1].isupper() else new
cache={};fail=[]
FORCED={'bit':('VBD','bite'),'rang':('VBD','ring'),'burst':('VBD','burst'),'melted':('VBD','melt'),'peaks':('VBZ','peak'),'sold':('VBD','sell'),'called':('VBD','call'),'fought':('VBD','fight'),'point':('VBP','point'),'made':('VBD','make'),'work':('VBP','work'),'worked':('VBD','work'),'cared':('VBD','care'),'left':('VBD','leave'),'requires':('VBZ','require'),'supplies':('VBZ','supply'),'surprised':('VBD','surprise'),'meant':('VBD','mean'),'mixed':('VBD','mix'),'offered':('VBD','offer'),'developed':('VBD','develop'),'noticed':('VBD','notice'),'hopes':('VBZ','hope'),'uses':('VBZ','use'),'loses':('VBZ','lose'),'lets':('VBZ','let')}
PART={'go':'gone','give':'given','take':'taken','make':'made','have':'had','feel':'felt','know':'known','find':'found','keep':'kept','leave':'left','lose':'lost','win':'won','see':'seen','say':'said','tell':'told','think':'thought','buy':'bought','bring':'brought','become':'become','begin':'begun','bite':'bitten','stand':'stood','spend':'spent','pay':'paid','hear':'heard','choose':'chosen','catch':'caught','put':'put','read':'read','mean':'meant','build':'built','send':'sent','sit':'sat','run':'run','write':'written','hold':'held','let':'let','set':'set','cut':'cut','eat':'eaten','fight':'fought','sell':'sold','ring':'rung','burst':'burst','fly':'flown','come':'come','rise':'risen','fall':'fallen','hide':'hidden','speak':'spoken','meet':'met','understand':'understood'}

for q,doc in zip(qs,nlp.pipe([q['answer'].replace('’',"'") for q in qs],batch_size=128)):
 text=q['answer'];hi=text.lower().find(q['highlight'].lower());sent=next((s for s in doc.sents if s.start_char<=hi<s.end_char),list(doc.sents)[0]);v=sent.root
 if v.pos_ not in ['VERB','AUX']:
  heads=[t for t in sent if t.pos_ in ['VERB','AUX'] and t.dep_ in ['ROOT','conj','ccomp']]
  if heads:v=heads[0]
 auxiliaries=[t for t in v.children if t.dep_ in ['aux','auxpass']]
 finite=[t for t in auxiliaries if t.tag_ in ['MD','VBD','VBP','VBZ']]
 f=finite[0] if finite else v
 # Model errors on short familiar idiom clauses are repaired using explicit
 # finite-verb anchors. These are lexical fixes, not guessed answer keys.
 if f.tag_ not in ['MD','VBD','VBP','VBZ','VB']:
  anchors={'bit':'bite','rang':'ring','burst':'burst','melted':'melt','peaks':'peak','sold':'sell','called':'call','fought':'fight','point':'point','made':'make','is':'be','work':'work','worked':'work','cared':'care','left':'leave','requires':'require','supplies':'supply','surprised':'surprise','meant':'mean','mixed':'mix','offered':'offer','developed':'develop','noticed':'notice'}
  possible=[t for t in sent if t.text.lower() in anchors]
  if possible:
   f=next((t for t in possible if t.idx>=hi and t.idx<hi+len(q['highlight'])),possible[-1])
   v=f;finite=[]
 # Prefer the auxiliary directly inside an idiom over an unrelated second
 # clause, e.g. 'I am all ears; tell me ...'.
 if re.search(r"\b(?:I|We|You|They|He|She)[’'](?:m|re|s)\b",q['highlight'],re.I):
  choices=[t for t in sent if hi<=t.idx<hi+len(q['highlight']) and t.lemma_=='be']
  if choices:f=v=choices[0];finite=[]
 forced=globals().get('FORCED',{}).get(f.text.lower())

 neg=[t for t in v.children if t.dep_=='neg'] or [t for t in f.children if t.dep_=='neg']
 # Never borrow a negative from a different clause.
 neg=[t for t in neg if t.idx>=f.idx]
 inversion=any(t.dep_ in ['nsubj','nsubjpass'] and t.idx>f.idx for t in v.children)
 tag,lemma=forced if forced else (f.tag_,f.lemma_)
 if f.pos_!='AUX' and tag!='MD':
  dictionary=getLemma(f.text.lower(),upos='VERB')
  if dictionary and lemma==f.text.lower():lemma=dictionary[0]
  if f.text.lower()!=lemma and f.text.lower() in getInflection(lemma,tag='VBD'):tag='VBD'
  elif f.text.lower()!=lemma and f.text.lower() in getInflection(lemma,tag='VBZ'):tag='VBZ'
 candidates=[]
 if neg:
  t=neg[0]
  if t.text.lower()=='never':new='always';out=swap(text,t.idx,t.idx+len(t),new)
  elif t.text.lower() in ["n't","n’t"]:
   new={'ca':'can','wo':'will','sha':'shall'}.get(f.text.lower(),f.text);out=swap(text,f.idx,t.idx+len(t),cap(new,f.text))
  else:
   end=t.idx+len(t)
   if end<len(text) and text[end]==' ':end+=1
   out=swap(text,t.idx,end,'');new='（移除否定）'
  changed=t.text
 elif f.pos_=='AUX' or f.tag_=='MD':
  if f.text.lower() in ["'m","’m","'re","’re","'s","’s","'ve","’ve","'d","’d","'ll","’ll"]:
   word={"'m":' am',"'re":' are',"'s":' is' if f.lemma_=='be' else ' has',"'ve":' have',"'d":' would' if f.tag_=='MD' else ' had',"'ll":' will'}[f.text.replace('’',"'").lower()]
   new=word+' not';out=swap(text,f.idx,f.idx+len(f),new)
  else:
   m=re.match(r'\s+no\s+good\b',text[f.idx+len(f):])
   if m:new=f.text+' useful';out=swap(text,f.idx,f.idx+len(f)+m.end(),new)
   else:new=f.text+' not';out=swap(text,f.idx,f.idx+len(f),new)
  changed=f.text
 elif tag in ['VBD','VBP','VBZ','VB'] and lemma:
  helper='did' if tag=='VBD' else 'does' if tag=='VBZ' else 'do';new=cap(helper+' not '+lemma,f.text);out=swap(text,f.idx,f.idx+len(f),new);changed=f.text
 else:out=None;new='';changed=''
 if out and out!=text:candidates.append([out,f'「{changed}」在這句被改為「{new.strip()}」，反轉了原題的肯定或否定意思；這不是保留原意的改寫。','polarity',changed,new.strip()])
 temporal=None;w=f.text.lower().replace('’',"'")
 if w in ['is','am','are',"'m","'s","'re"] and lemma=='be':temporal='might be'
 elif w in ['was','were']:temporal='might have been'
 elif w in ['has','have',"'ve","'s"] and finite:temporal='might have'
 elif w=='had' and finite:temporal='might have'
 elif w in ['will','would','can','could','should','may','might','must',"'ll","'d"]:temporal={'will':'might','would':'might','can':'must','could':'must','should':'must','may':'must','might':'must','must':'might',"'ll":'might',"'d":'might'}[w]
 elif tag in ['VBD','VBP','VBZ'] and lemma!='be':
  part=(getInflection(lemma,tag='VBN') or (PART.get(lemma,f.text.lower()),))[0]
  temporal=('might have '+part) if tag=='VBD' else ('might '+lemma)
 if temporal:
  temporal=cap(temporal,f.text)
  if f.text.startswith(("'",'’')):temporal=' '+temporal
  out=swap(text,f.idx,f.idx+len(f),temporal)
  if f.lemma_=='do' and f!=v:
   vpart=(getInflection(v.lemma_,tag='VBN') or (v.text,))[0]
   newverb=('have '+vpart) if f.tag_=='VBD' else v.lemma_
   edits=[(f.idx,f.idx+len(f),cap('might',f.text)),(v.idx,v.idx+len(v),newverb)]
   for t in neg:
    if t.text.lower() in ["n't",'n’t']:edits.append((t.idx,t.idx+len(t),' not'))
   out=text
   for start,end,repl in sorted(edits,reverse=True):out=swap(out,start,end,repl)
   temporal='might '+newverb
  elif inversion and ' ' in temporal:
   subject=next(t for t in v.children if t.dep_ in ['nsubj','nsubjpass'] and t.idx>f.idx)
   tail=max(t.idx+len(t) for t in subject.subtree)
   modal,rest=temporal.split(' ',1)
   out=text[:tail]+' '+rest+text[tail:]
   out=swap(out,f.idx,f.idx+len(f),modal)
  # Contracted negatives need to move after the modal rather than attach to
  # 'have' or a participle. The resulting contrast changes certainty only.
  out=re.sub(r"(might|must) (have been|have|be)(?:n['’]t)",r"\1 not \2",out)
  candidates.append([out,f'「{f.text}」被改為「{temporal.strip()}」，把原來的事實、可能性或要求換成另一個確定程度；未保留原題語氣。','certainty',f.text,temporal.strip()])
 # Basic punctuation and coordination repair after do-support.
 repaired=[]
 for c in candidates:
  line=c[0]
  line=re.sub(r'\bcan not\b','cannot',line)
  if c[2]=='polarity' and inversion and not neg:
   for aux,contracted in [('is',"isn't"),('are',"aren't"),('was',"wasn't"),('were',"weren't"),('do',"don't"),('does',"doesn't"),('did',"didn't"),('can',"can't"),('could',"couldn't"),('will',"won't"),('would',"wouldn't"),('should',"shouldn't"),('has',"hasn't"),('have',"haven't"),('had',"hadn't")]:
    line=re.sub(r'(?i)\b'+aux+r' not\b',lambda m:cap(contracted,m[0]),line)
  line=line.replace('hardly do not notice','do not notice')
  line=re.sub(r'\b(Could|Would|Should|Will|Can|Must|Did|Does|Do) not (?=[A-Za-z])',lambda m:{'Could':"Couldn't",'Would':"Wouldn't",'Should':"Shouldn't",'Will':"Won't",'Can':"Can't",'Must':"Mustn't",'Did':"Didn't",'Does':"Doesn't",'Do':"Don't"}[m[1]]+' ',line) if text.endswith('?') else line
  if c[2]=='polarity' and not neg and tag=='VBD' and f.pos_!='AUX':
   # Keep a following coordinated past action grammatical after negating only
   # the first action: 'did not know but turned', not 'did not know and turned'.
   line=re.sub(r'\band (?=[a-z]+(?:ed|ew|pt|ght)\b)', 'but ',line)
   line=line.replace('and checked','but checked').replace('and found','but found').replace('and took','but took')
  line=re.sub(r'\b(is|are|was|were) not probably\b',r'\1 probably not',line)
  line=line.replace('Do not let’s','Let’s not').replace("Do not let's","Let's not").replace('do not let’s','let’s not').replace("do not let's","let's not")
  if not re.search(r"\b(?:used to do|might don|might didn|might hasn|might haven|might hadn)|Why do not fight",line):
   c[0]=line;repaired.append(c)
 candidates=repaired
 cache[q['id']]={'answerHash':hashlib.sha256(text.encode()).hexdigest(),'candidates':candidates,'parse':f'{v.text}/{v.tag_} -> {f.text}/{f.tag_}'}
 if not candidates:fail.append([q['id'],text,cache[q['id']]['parse']])
(root/'content/idiom-compass-109-138/grammar-contrasts.json').write_text(json.dumps(cache,ensure_ascii=False,separators=(',',':'))+'\n')
print('Cached',len(cache),'No candidates',len(fail));print(json.dumps(fail[:40],ensure_ascii=False,indent=2))
