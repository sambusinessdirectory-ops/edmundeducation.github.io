# Usage: python align.py STAGING_DIRECTORY
import sys,json,re,hashlib
from pathlib import Path
from rapidfuzz.distance import Levenshtein
O=Path(sys.argv[1])
def norm(s):return re.sub('[^a-z0-9]','',s.lower())
report=[]
for spec in json.loads((O/'manifest.json').read_text()):
 if not (O/(spec['slug']+'.asr.json')).exists():continue
 d=json.loads((O/(spec['slug']+'.parsed.json')).read_text());a=json.loads((O/(spec['slug']+'.asr.json')).read_text());expected=''.join(norm(r['english']) for r in d['translations']);observed='';charwords=[]
 for i,w in enumerate(a['words']):t=norm(w['text']);observed+=t;charwords.extend([i]*len(t))
 mapping={}
 for tag,i,j,k,l in Levenshtein.opcodes(expected,observed):
  if tag=='equal':
   for off in range(j-i):mapping[i+off]=charwords[k+off]
 lines=[];cursor=0
 for r in d['translations']:
  token=norm(r['english']);matches=[mapping[p] for p in range(cursor,cursor+len(token)) if p in mapping];cursor+=len(token)
  lines.append(dict(start=a['words'][min(matches)]['start'] if matches else None,end=a['words'][max(matches)]['end'] if matches else None,coverage=round(len(matches)/max(1,len(token)),3)))
 result=dict(duration=a['duration'],audioSha256=a['audioSha256'],method='faster-whisper-small.en-global-edit-word-alignment',coverage=len(mapping)/len(expected),lines=lines)
 (O/(spec['slug']+'.optimal.json')).write_text(json.dumps(result,indent=2));print(spec['slug'],round(result['coverage'],3),sum(x['coverage']<.5 for x in lines))
