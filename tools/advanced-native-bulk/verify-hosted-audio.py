#!/usr/bin/env python3
"""Verify exact public audio bytes and serving headers, recording every failure."""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

HOST='https://edmund-neural-audio.edmundeducation.workers.dev/assets/natural-english/audio/advanced-native/v1/'

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state-dir',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--jobs',type=int,default=4)
    args=parser.parse_args()
    manifest=json.loads((args.state_dir/'public-manifest.json').read_text())
    metadata=json.loads((args.state_dir/'metadata.json').read_text())
    rows=[(module,row) for module,entries in metadata.items() for row in entries]
    def check(item):
        module,row=item;url=manifest.get(module,{}).get(row['text'],'')
        result={'moduleId':module,'role':row['role'],'url':url,'voice':row['voice'],'expectedSha256':row['sha256']}
        try:
            if not url.startswith(HOST):raise ValueError('Unexpected asset origin or prefix.')
            with tempfile.TemporaryDirectory(prefix='advanced-native-host-check-') as directory:
                headers=Path(directory)/'headers.txt';body=Path(directory)/'body.mp3'
                request=subprocess.run(['curl','--fail','--silent','--show-error','--retry','2','--max-time','35','--dump-header',str(headers),'--output',str(body),url],capture_output=True,text=True,timeout=115)
                if request.returncode:raise ValueError('Public GET failed: '+request.stderr[-250:])
                data=body.read_bytes();headerText=headers.read_text().lower()
                if hashlib.sha256(data).hexdigest()!=row['sha256']:raise ValueError('Public bytes do not match approved file.')
                for required in ['content-type: audio/mpeg','access-control-allow-origin: *','accept-ranges: bytes','immutable']:
                    if required not in headerText:raise ValueError('Missing required header: '+required)
                result.update(fileIdentity='passed',headers='passed',bytes=len(data),listeningReview='pending')
        except Exception as error:result.update(fileIdentity='failed',error=str(error))
        return result
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:results=list(pool.map(check,rows))
    failures=[row for row in results if row['fileIdentity']!='passed']
    args.output.parent.mkdir(parents=True,exist_ok=True)
    report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'assets':results,'checked':len(results),'failed':len(failures),'allPublicBytesMatched':not failures,'humanListeningClaimed':False}
    args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'checked':len(results),'failed':len(failures),'failures':failures},ensure_ascii=False))
    if failures:raise SystemExit(1)

if __name__=='__main__':main()
