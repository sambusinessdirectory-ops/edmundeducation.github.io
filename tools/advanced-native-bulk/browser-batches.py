#!/usr/bin/env python3
"""Run bounded browser QA; retain failures and never silently skip a lesson."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--ids-file',required=True,type=Path)
parser.add_argument('--output-dir',required=True,type=Path)
parser.add_argument('--engine',required=True,choices=['chromium','webkit'])
parser.add_argument('--origin',default='http://127.0.0.1:8768')
parser.add_argument('--batch-size',type=int,default=100)
args=parser.parse_args()
if not 1<=args.batch_size<=100:parser.error('Use1–100 lessons per browser process.')
ids=args.ids_file.read_text().strip().replace('\n',',').split(',')
if not ids or any(not value for value in ids) or len(ids)!=len(set(ids)):parser.error('Provide nonempty unique comma/newline-separated IDs.')
root=Path(__file__).resolve().parents[2]
watched=['natural-english/advanced-imported.generated.mjs','natural-english/app.mjs',
         'natural-english/catalogue.mjs','natural-english/advanced-display.mjs',
         'natural-english/advanced-targets.generated.mjs','advanced-native/style.css']
def fingerprint():return {f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in watched}
start=fingerprint()
args.output_dir.mkdir(parents=True,exist_ok=True)
if (args.output_dir/'batches.json').exists():parser.error('Use a fresh output directory; do not overwrite earlier evidence.')
rows=[]
for index,offset in enumerate(range(0,len(ids),args.batch_size),1):
    if fingerprint()!=start:raise SystemExit('Staged content/runtime changed during QA; preserve evidence and rerun affected IDs.')
    selected=ids[offset:offset+args.batch_size]
    out=args.output_dir/f'batch-{index:03}'
    out.mkdir()
    env=dict(os.environ,ADVANCED_NATIVE_QA_BROWSER=args.engine,ADVANCED_NATIVE_QA_IDS=','.join(selected))
    with (out/'run.log').open('w') as log:
        result=subprocess.run(['node','tools/advanced-native-bulk/browser-course-qa.mjs',args.origin,str(out.resolve())],cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
    row={'batch':index,'engine':args.engine,'requestedIds':selected,'exitCode':result.returncode,'directory':str(out.resolve()),'status':'failed-requires-inspection'}
    if result.returncode==0:
        checked=json.loads((out/'checkpoint.json').read_text())
        assert set(checked['completedLessons'])==set(selected)
        assert not checked['pageErrors'] and not json.loads((out/'wrap-audit.json').read_text())
        assert fingerprint()==start,'Staged files changed during batch; do not reuse stale QA.'
        row['status']='passed'
    rows.append(row)
    report={'engine':args.engine,'origin':args.origin,'requestedIds':ids,'runtimeSha256':start,'batches':rows,'completed':all(r['status']=='passed'for r in rows) and sum(len(r['requestedIds'])for r in rows)==len(ids),'syntheticAccount':True,'physicalDeviceReviewClaimed':False}
    (args.output_dir/'batches.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in row.items()if k not in ['requestedIds','directory']}),flush=True)
    if result.returncode:sys.exit(result.returncode)
