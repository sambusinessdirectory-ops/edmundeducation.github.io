#!/usr/bin/env python3
"""Replace locally rendered American male clips with the approved Aries voice."""
import argparse
import base64
import hashlib
import json
import re
import subprocess
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
ACCOUNT='bb52550c9a10ce282a09d742d800c06e'
BASE=f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/ai/run/'

def words(value):
    return re.findall(r'[a-z0-9]+',value.lower())

def request(token,model,payload):
    req=urllib.request.Request(BASE+model,data=json.dumps(payload).encode(),headers={
        'Authorization':'Bearer '+token,'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=120) as response:return response.read()

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--limit',type=int,default=0);args=parser.parse_args()
    metadata_path=ROOT/'natural-english/audio/imported-metadata.json'
    manifest_path=ROOT/'natural-english/audio/imported-manifest.mjs'
    metadata=json.loads(metadata_path.read_text())
    manifest=json.loads(manifest_path.read_text().removeprefix('export default ').removesuffix(';\n'))
    token=json.loads(subprocess.check_output(['node',str(ROOT/'workers/speaking-system/node_modules/wrangler/bin/wrangler.js'),'auth','token','--json'],text=True))['token']
    destdir=ROOT/'natural-english/audio/imported';done=0
    for module,rows in metadata.items():
        for row in rows:
            if row['voice']!='american-male':continue
            text=row['text'];digest=hashlib.sha256(('aries-v1:'+text).encode()).hexdigest()[:16]
            name=f'{module}-{row["index"]+1:02}-aries-{digest}.mp3';dest=destdir/name
            if not dest.exists():
                with tempfile.TemporaryDirectory(prefix='native-aries-') as directory:
                    raw=Path(directory)/'raw.mp3'
                    raw.write_bytes(request(token,'@cf/deepgram/aura-2-en',{'text':'Hello. '+text,'speaker':'aries','encoding':'mp3'}))
                    transcription=json.loads(request(token,'@cf/openai/whisper-large-v3-turbo',{
                        'audio':base64.b64encode(raw.read_bytes()).decode(),'language':'en'}))['result']
                    spoken=[w for segment in transcription.get('segments',[]) for w in segment.get('words',[])]
                    expected=words(text)
                    remainder=words(' '.join(w['word'] for w in spoken[1:]))
                    heard=words(' '.join(w['word'] for w in spoken))
                    prefix_length=min(3,len(expected))
                    if len(spoken)>1 and (words(spoken[0]['word'])==['hello'] or remainder==expected
                          or remainder[:prefix_length]==expected[:prefix_length]):
                        trim=(spoken[0]['end']+spoken[1]['start'])/2
                    elif spoken and heard==expected:
                        trim=max(0,spoken[0]['start']-0.1)
                    else:
                        raise ValueError(f'Aries transcript mismatch for {module}: {heard} vs {expected}')
                    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(raw),
                        '-af',f'atrim=start={trim},adelay=180:all=1,apad=pad_dur=0.16,asetpts=N/SR/TB',
                        '-codec:a','libmp3lame','-b:a','64k','-y',str(dest)],check=True)
            duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration',
                '-of','default=noprint_wrappers=1:nokey=1',str(dest)],text=True))
            if duration<0.35 or dest.stat().st_size<1800:raise ValueError(f'Empty Aries clip: {dest}')
            row.update(path='natural-english/audio/imported/'+name,duration=round(duration,3),
                       sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),model='Aura 2 Aries')
            manifest[module][text]=row['path'];done+=1
            if done%25==0:print('Aries clips',done,flush=True)
            if args.limit and done>=args.limit:break
        if args.limit and done>=args.limit:break
    metadata_path.write_text(json.dumps(metadata,ensure_ascii=False,separators=(',',':'))+'\n')
    manifest_path.write_text('export default '+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
    print('Aries complete',done)

if __name__=='__main__':main()
