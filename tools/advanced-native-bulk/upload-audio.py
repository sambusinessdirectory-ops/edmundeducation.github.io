#!/usr/bin/env python3
"""Upload only hash-verified generated clips, with resumable R2 checkpoints."""
import argparse
import concurrent.futures
import hashlib
import json
import re
import shutil
import subprocess
import time
from pathlib import Path

PREFIX='assets/natural-english/audio/advanced-native/v1/'
HOST='https://edmund-neural-audio.edmundeducation.workers.dev/'
ROOT=Path(__file__).resolve().parents[2]

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audio-dir',required=True,type=Path)
    parser.add_argument('--state-dir',required=True,type=Path)
    parser.add_argument('--jobs',type=int,default=4)
    parser.add_argument('--check',action='store_true')
    parser.add_argument('--allow-partial',action='store_true',help='Upload the verified, completed subset while later audio requests remain pending; does not approve a course release.')
    args=parser.parse_args()
    if not 1<=args.jobs<=8: parser.error('Use 1–8 upload jobs.')
    summary=json.loads((args.state_dir/'summary.json').read_text())
    if (summary['failed'] or summary['pending']) and not args.allow_partial: raise SystemExit('Queue contains failed or pending clips; finish generation first or explicitly upload only the completed subset with --allow-partial.')
    metadata=json.loads((args.state_dir/'metadata.json').read_text())
    # Capture the same generation's mapping before network work begins. A later
    # synthesis run must not make this upload publish its unuploaded URLs.
    manifest=json.loads((args.state_dir/'manifest.json').read_text())
    active={row['synthesisKey'] for entries in metadata.values() for row in entries}
    rows=[]
    for file in sorted(args.state_dir.glob('*.json')):
        if not re.fullmatch(r'[a-f0-9]{64}\.json',file.name):continue
        if file.stem not in active:continue
        row=json.loads(file.read_text());audio=args.audio_dir/(file.stem+'.mp3')
        if not audio.is_file() or hashlib.sha256(audio.read_bytes()).hexdigest()!=row['sha256']:raise SystemExit(f'Audio identity mismatch: {audio.name}')
        rows.append((file.stem,row,audio))
    if not rows:raise SystemExit('No generated clips found.')
    checkpoint=args.state_dir/'r2-uploaded.json'
    uploaded=json.loads(checkpoint.read_text()) if checkpoint.exists() else {}
    todo=[r for r in rows if uploaded.get(PREFIX+r[2].name)!=r[1]['sha256']]
    if args.check:
        print(json.dumps({'verifiedLocalFiles':len(rows),'remainingUploads':len(todo),'bytes':sum(r[2].stat().st_size for r in rows)}));return
    candidates=[ROOT/'workers/schedule-system/node_modules/.bin/wrangler',ROOT/'workers/speaking-system/node_modules/.bin/wrangler',ROOT/'node_modules/.bin/wrangler']
    wrangler=next((str(file) for file in candidates if file.is_file()),shutil.which('wrangler'))
    if not wrangler:raise SystemExit('Wrangler is missing; install the pinned repository version before uploading.')
    def upload(item):
        key,row,audio=item;object_key=PREFIX+audio.name
        for attempt in range(3):
            try:
                result=subprocess.run([str(wrangler),'r2','object','put','edmund-assets/'+object_key,'--file',str(audio),'--remote','--force','--content-type','audio/mpeg','--cache-control','public, max-age=31536000, immutable'],cwd=ROOT,capture_output=True,text=True,timeout=180)
                if result.returncode==0:return object_key,row['sha256']
            except subprocess.TimeoutExpired:pass
            if attempt<2:time.sleep(2**(attempt+1))
        raise RuntimeError(f'Upload failed after three attempts: {audio.name}; inspect local Wrangler logs.')
    failures=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures={pool.submit(upload,row):row[0] for row in todo}
        for future in concurrent.futures.as_completed(futures):
            try:key,digest=future.result()
            except Exception as error:
                failures.append({'synthesisKey':futures[future],'error':str(error)});continue
            uploaded[key]=digest
            temporary=checkpoint.with_suffix('.tmp');temporary.write_text(json.dumps(uploaded,indent=2)+'\n');temporary.replace(checkpoint)
            print(json.dumps({'uploaded':key,'completed':len(uploaded)}),flush=True)
    (args.state_dir/'r2-upload-failures.json').write_text(json.dumps(failures,indent=2)+'\n')
    if failures:raise SystemExit(f'{len(failures)} uploads remain; rerun to resume. All successful uploads are checkpointed.')
    public={module:{text:HOST+PREFIX+Path(value).name for text,value in mapping.items()} for module,mapping in manifest.items()}
    destination=args.state_dir/'public-manifest.json';temporary=destination.with_suffix('.tmp')
    temporary.write_text(json.dumps(public,ensure_ascii=False,indent=2)+'\n');temporary.replace(destination)
    print(json.dumps({'uploadedObjects':len(uploaded),'requests':summary['requests'],'pendingAudioRequests':summary['pending'],'failedAudioRequests':summary['failed'],'partialProduction':bool(summary['pending'] or summary['failed']),'publicAssetChecks':'pending'}))

if __name__=='__main__':main()
