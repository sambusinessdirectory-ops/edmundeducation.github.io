#!/usr/bin/env python3
"""Check decoded speech files for corruption/silence, without claiming listening review."""
import argparse
import array
import concurrent.futures
import hashlib
import json
import math
import subprocess
import sys
from pathlib import Path

def analyse(samples):
    if not samples or any(not math.isfinite(x) for x in samples):
        raise ValueError('Empty or non-finite decoded audio.')
    rms=math.sqrt(sum(x*x for x in samples)/len(samples))
    active=sum(abs(x)>.01 for x in samples)/len(samples)
    if rms<10**(-45/20) or active<.02:
        raise ValueError('Audio is silent or has insufficient audible signal.')
    return {'decodedSeconds':round(len(samples)/16000,3),'rmsDbfs':round(20*math.log10(rms),2),'peak':round(max(abs(x) for x in samples),5),'audibleFraction':round(active,4)}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audio-dir',required=True,type=Path)
    parser.add_argument('--state-dir',required=True,type=Path)
    parser.add_argument('--output',required=True,type=Path)
    parser.add_argument('--jobs',type=int,default=4)
    args=parser.parse_args()
    if not 1<=args.jobs<=8:parser.error('Use1–8workers.')
    metadata=json.loads((args.state_dir/'metadata.json').read_text())
    rows={row['synthesisKey']:row for entries in metadata.values() for row in entries}
    def check(item):
        key,row=item;filename=args.audio_dir/(key+'.mp3')
        try:
            if hashlib.sha256(filename.read_bytes()).hexdigest()!=row['sha256']:raise ValueError('Checksum differs from production record.')
            result=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(filename),'-ac','1','-ar','16000','-f','f32le','pipe:1'],capture_output=True,check=True,timeout=30)
            samples=array.array('f');samples.frombytes(result.stdout)
            if sys.byteorder!='little':samples.byteswap()
            return {'synthesisKey':key,'moduleId':row['moduleId'],'role':row['role'],'status':'passed',**analyse(samples)}
        except Exception as error:return {'synthesisKey':key,'moduleId':row['moduleId'],'role':row['role'],'status':'failed','error':str(error)}
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:results=list(pool.map(check,rows.items()))
    failures=[r for r in results if r['status']!='passed']
    report={'checked':len(results),'failed':len(failures),'method':'Exact file hash, full MP3 decode and audible-signal statistics','pronunciationOrAccentReviewClaimed':False,'humanListeningReviewClaimed':False,'files':results}
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'checked':len(results),'failed':len(failures),'failures':failures}));return bool(failures)

if __name__=='__main__':sys.exit(main())
