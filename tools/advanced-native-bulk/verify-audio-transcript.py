#!/usr/bin/env python3
"""Cache local ASR comparisons; flags require review and never certify accent."""
import argparse
import concurrent.futures
import hashlib
import json
import re
import time
from pathlib import Path


def words(text):
    text=text.lower().replace('’', "'")
    contractions={"we've":"we have","i've":"i have","they've":"they have","you've":"you have",
        "we're":"we are","they're":"they are","you're":"you are","i'm":"i am",
        "isn't":"is not","aren't":"are not","wasn't":"was not","weren't":"were not",
        "don't":"do not","doesn't":"does not","didn't":"did not","can't":"cannot",
        "couldn't":"could not","wouldn't":"would not","shouldn't":"should not",
        "won't":"will not","let's":"let us","it's":"it is","that's":"that is",
        "i'll":"i will","we'll":"we will","they'll":"they will","you'll":"you will"}
    for before,after in contractions.items():text=re.sub(r'\b'+re.escape(before)+r'\b',after,text)
    # ASR orthography does not identify a speaker's accent. Keep the source
    # spelling in the report while comparing routine UK/US spellings alike.
    spellings={'realise':'realize','realised':'realized','realises':'realizes',
        'colour':'color','colours':'colors','coloured':'colored','colourful':'colorful',
        'behaviour':'behavior','behaviours':'behaviors','mould':'mold','moulds':'molds',
        'centre':'center','centres':'centers','armour':'armor','neighbour':'neighbor',
        'neighbours':'neighbors','neighbourhood':'neighborhood','favourite':'favorite',
        'favourites':'favorites','flavour':'flavor','flavours':'flavors',
        'organise':'organize','organised':'organized','organising':'organizing',
        'recognise':'recognize','recognised':'recognized','recognising':'recognizing',
        'travelled':'traveled','travelling':'traveling','traveller':'traveler',
        'offence':'offense','offences':'offenses',
        'honour':'honor','honours':'honors','honoured':'honored',
        'savour':'savor','savours':'savors','savoured':'savored','savouring':'savoring',
        'liveable':'livable','grey':'gray','programme':'program','programmes':'programs',
        'judgment':'judgement','judgments':'judgements',
        'manoeuvre':'maneuver','manoeuvres':'maneuvers',
        'manoeuvred':'maneuvered','manoeuvring':'maneuvering'}
    # Only the noun phrase is a compound-spacing variant. Keep standalone
    # every day/everyday distinct so a genuine grammatical change stays visible.
    text=re.sub(r'\bevery day life\b','everyday life',text)
    for split,joined in [('mole hill','molehill'),('rule book','rulebook'),('straight jacket','straitjacket'),
                         ('mood-lifter','moodlifter'),('mood lifter','moodlifter'),
                         ('check-ups','checkups'),('check ups','checkups'),
                         ('quick-help','quickhelp'),('hard-wired','hardwired'),
                         ('rear-view','rearview'),('rear view','rearview'),
                         ('curve balls','curveballs'),('curve ball','curveball')]:
        text=re.sub(r'\b'+split+r'\b',joined,text)
    numbers=dict(zip('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'.split(),map(str,range(21))))
    return [numbers.get(token,spellings.get(token,token)) for token in re.findall(r"[a-z0-9]+(?:'[a-z]+)?",text)]


def distance(a,b):
    previous=list(range(len(b)+1))
    for i,left in enumerate(a,1):
        current=[i]
        for j,right in enumerate(b,1):current.append(min(current[-1]+1,previous[j]+1,previous[j-1]+(left!=right)))
        previous=current
    return previous[-1]


def compare(expected,actual,targets=()):
    a,b=words(expected),words(actual)
    errors=distance(a,b)
    missing=[]
    for target in targets:
        tokens=words(target)
        if tokens and not any(b[i:i+len(tokens)]==tokens for i in range(len(b)-len(tokens)+1)):missing.append(target)
    return {'expectedWords':len(a),'wordEdits':errors,'wordErrorRate':round(errors/max(1,len(a)),4),
        'targetPhrasesNotRecognised':missing,'reviewFlag':bool(missing) or errors/max(1,len(a))>.15}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audio-dir',required=True,type=Path)
    parser.add_argument('--state-dir',required=True,type=Path)
    parser.add_argument('--canonical-snapshot',required=True,type=Path)
    parser.add_argument('--cache-dir',required=True,type=Path)
    parser.add_argument('--output',required=True,type=Path)
    parser.add_argument('--model',required=True,type=Path)
    parser.add_argument('--jobs',type=int,default=2)
    parser.add_argument('--limit',type=int,default=0,help='Zero processes the full metadata snapshot.')
    parser.add_argument('--only-flags-from',type=Path,help='Run a second ASR model only on flags from an earlier completed report.')
    args=parser.parse_args()
    if not 1<=args.jobs<=4:parser.error('Use1–4workers.')
    from faster_whisper import WhisperModel
    metadata=json.loads((args.state_dir/'metadata.json').read_text())
    canonical=json.loads(args.canonical_snapshot.read_text())
    lessons={r['id']:r for r in canonical['lessons']}
    rows={r['synthesisKey']:r for entries in metadata.values() for r in entries}
    role_order={'speaking':0,'takeaway-1':1,'listening':2,'takeaway-2':3}
    items=sorted(rows.items(),key=lambda item:(role_order.get(item[1]['role'],4),item[1]['moduleId']))
    if args.only_flags_from:
        flagged={r['synthesisKey'] for r in json.loads(args.only_flags_from.read_text())['files'] if r['reviewFlag']}
        items=[item for item in items if item[0] in flagged]
    if args.limit:items=items[:args.limit]
    model_hash=hashlib.sha256((args.model/'model.bin').read_bytes()).hexdigest()
    model=WhisperModel(str(args.model),device='cpu',compute_type='int8',cpu_threads=3,
        num_workers=args.jobs,local_files_only=True)
    args.cache_dir.mkdir(parents=True,exist_ok=True)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    started=time.monotonic()
    def check(item):
        key,row=item;audio=args.audio_dir/(key+'.mp3');cache=args.cache_dir/(key+'.json')
        if hashlib.sha256(audio.read_bytes()).hexdigest()!=row['sha256']:raise ValueError('Audio hash mismatch: '+key)
        saved=json.loads(cache.read_text()) if cache.exists() else None
        if not saved or saved.get('audioSha256')!=row['sha256'] or saved.get('asrModelSha256')!=model_hash:
            segments,info=model.transcribe(str(audio),language='en',beam_size=5,vad_filter=False,
                condition_on_previous_text=False,word_timestamps=False)
            utterances=[{'start':s.start,'end':s.end,'text':s.text} for s in segments]
            saved={'audioSha256':row['sha256'],'asrModelSha256':model_hash,'transcript':' '.join(s['text'].strip() for s in utterances),
                'segments':utterances,'duration':info.duration,'method':'local faster-whisper CPU int8','modelDirectory':args.model.parent.parent.name}
            temporary=cache.with_suffix('.json.tmp');temporary.write_text(json.dumps(saved,ensure_ascii=False,indent=2)+'\n');temporary.replace(cache)
        lesson=lessons.get(row['moduleId']);targets=[]
        if lesson:
            targets=[m.group(0) for m in re.finditer(lesson['target']['pattern'],row['text'],re.I)]
        return {'synthesisKey':key,'moduleId':row['moduleId'],'role':row['role'],'voice':row['voice'],
            'expected':row['text'],'recognised':saved['transcript'],**compare(row['text'],saved['transcript'],targets)}
    results=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        for result in pool.map(check,items):
            results.append(result)
            print(json.dumps({'checked':len(results),'total':len(items),'moduleId':result['moduleId'],'role':result['role'],'reviewFlag':result['reviewFlag'],'wordErrorRate':result['wordErrorRate']},ensure_ascii=False),flush=True)
    report={'checked':len(results),'reviewFlags':sum(r['reviewFlag'] for r in results),'elapsedSeconds':round(time.monotonic()-started,2),
        'method':'Local cached speech recognition; normalised word edit distance and exact target-token presence',
        'limitations':'ASR can misrecognise valid speech. A flag is not proof of a synthesis defect; absence of a flag does not certify pronunciation or accent.',
        'humanListeningReviewClaimed':False,'accentReviewClaimed':False,'files':results}
    args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='files'}),flush=True)


if __name__=='__main__':main()
