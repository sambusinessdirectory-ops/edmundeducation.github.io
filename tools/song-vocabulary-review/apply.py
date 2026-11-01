"""Apply individually edited options; retain stable question/answer identities."""
import csv,json,pathlib
root=pathlib.Path(__file__).resolve().parents[2]
files={}
for f in (root/'tools/song-content').glob('*.json'):
 d=json.loads(f.read_text());files[d['slug']]=(f,d)
seen=set()
for slug,num,index,english,reason,theme in csv.reader(open(root/'tools/song-vocabulary-review/edits.tsv'),delimiter='\t'):
 key=(slug,int(num),int(index));assert key not in seen,key;seen.add(key)
 q=next(q for q in files[slug][1]['vocabulary'] if q['number']==int(num))
 q['options'][int(index)]=english;q['optionExplanations'][int(index)]=reason
 if q['answer']==int(index):q['explanation']=reason
for slug,num,english,reason in csv.reader(open(root/'tools/song-vocabulary-review/key-polish.tsv'),delimiter='\t'):
 q=next(q for q in files[slug][1]['vocabulary'] if q['number']==int(num))
 q['options'][q['answer']]=english;q['optionExplanations'][q['answer']]=reason;q['explanation']=reason
for slug,num,index,english,reason,theme in csv.reader(open(root/'tools/song-vocabulary-review/final-corrections.tsv'),delimiter='\t'):
 q=next(q for q in files[slug][1]['vocabulary'] if q['number']==int(num))
 q['options'][int(index)]=english;q['optionExplanations'][int(index)]=reason
 if q['answer']==int(index):q['explanation']=reason
files['somebody-that-i-used-to-know'][1]['vocabulary'][0]['usage']='談到偶爾會做或間中發生的事。'
for f,d in files.values():f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(f'Applied {len(seen)} option edits across {len(files)} songs.')
