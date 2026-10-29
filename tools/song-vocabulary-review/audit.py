"""Release audit: compare vocabulary with the archived pre-edit baseline."""
import json, pathlib, csv, collections, re, hashlib, subprocess
root=pathlib.Path(__file__).resolve().parents[2]
baseline='94e979713'
rows=[];seen=set();counts=collections.Counter();themes=collections.defaultdict(set)
for filename in ['edits.tsv','final-corrections.tsv']:
 for row in csv.reader(open(root/'tools/song-vocabulary-review'/filename),delimiter='\t'):
  themes[(row[0],int(row[1]))].add(row[5])
motif=re.compile(r'\b(?:dogs?|cats?|shoes?|homework|sandwich\w*|pizza\w*|soup|breakfast|cake\w*)\b',re.I)
all_options=collections.defaultdict(list)
for f in sorted((root/'tools/song-content').glob('*.json')):
 d=json.loads(f.read_text());old=json.loads(subprocess.check_output(['git','show',baseline+':'+str(f.relative_to(root))],cwd=root))
 assert {k:v for k,v in d.items() if k!='vocabulary'}=={k:v for k,v in old.items() if k!='vocabulary'},f
 assert len(d['vocabulary'])==10
 for q,b in zip(d['vocabulary'],old['vocabulary']):
  identity=(d['slug'],q['number']);assert identity not in seen;seen.add(identity)
  for key in ['number','word','answer','meaning','prompt']:assert q[key]==b[key],(identity,key)
  assert q['usage']==b['usage'] or identity==('somebody-that-i-used-to-know',1)
  assert len(q['options'])==len(q['optionExplanations'])==4
  assert len(set(q['options']))==4
  if q['options'][q['answer']]!=b['options'][b['answer']]: assert q['explanation']==q['optionExplanations'][q['answer']]
  assert all(re.search(r'[\u4e00-\u9fff]',x) for x in q['optionExplanations'])
  assert not re.search('不是.{0,100}而是',json.dumps(q,ensure_ascii=False))
  for i,option in enumerate(q['options']):all_options[option].append([*identity,i])
  changed=[i for i in range(4) if q['options'][i]!=b['options'][i]]
  counts['questions']+=1;counts['changedQuestions']+=bool(changed);counts['changedOptions']+=len(changed)
  counts['beforeMotifOptions']+=sum(bool(motif.search(x)) for x in b['options'])
  counts['afterMotifOptions']+=sum(bool(motif.search(x)) for x in q['options'])
  for key,value in [('before',b),('after',q)]:
   lens=[len(x.split()) for x in value['options']];a=value['answer']
   counts[key+'UniqueLongestKey']+=lens[a]>max(lens[:a]+lens[a+1:])
  rows.append({'slug':d['slug'],'number':q['number'],'word':q['word'],'answer':q['answer'],'changedOptions':changed,'editedThemes':sorted(themes[identity]),'identityPreserved':True,'fourOptionsAndReasons':True})
assert len(seen)==490
duplicates={k:v for k,v in all_options.items() if len(v)>1}
assert not duplicates,duplicates
report={'baseline':baseline,'scope':'49 songs / all 490 vocabulary items; thematic and wording editorial review','counts':dict(counts),'checks':'Automated checks establish structure and preservation, not CEFR certification or semantic uniqueness. Editorial reading supplies the latter judgement. Target song expressions are retained even when above A2; surrounding language aims at A2.','items':rows}
(root/'tools/song-vocabulary-review/audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report['counts']))
