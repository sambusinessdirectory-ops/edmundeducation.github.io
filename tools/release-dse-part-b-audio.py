#!/usr/bin/env python3
"""Package/upload the verified Kokoro DSE correction and publish its manifests.

`upload-essays` can run alongside generation. `release` requires both completed
build stages, verifies every recording, uploads immutable packs, and finally
writes the supplemental site manifests. It never replaces the old R2 objects.
"""
from __future__ import annotations
import argparse, concurrent.futures, hashlib, json, subprocess, time
from pathlib import Path
import soundfile as sf

RELEASE='dse-part-b-kokoro-20260911'
CLOUD='https://edmund-neural-audio.edmundeducation.workers.dev'
FLASH_PREFIX=f'assets/flashcards/audio/edmund-neural/{RELEASE}/'
ESSAY_PREFIX=f'assets/writing-practice/audio/edmund-neural/{RELEASE}/'
INDEX='workers/edmund-audio/src/flashcard-pack-index-dse-writing-part-b-kokoro.json'
def sha(data):return hashlib.sha256(data).hexdigest()
def write(path,value):
    temp=path.with_name(path.name+'.tmp');temp.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n');temp.replace(path)
def essay_key(eid,meta):return ESSAY_PREFIX+eid+'-'+meta['sourceSha256'][:16]+'.mp3'
def validate(path):
    info=sf.info(path)
    assert info.format=='MP3' and info.samplerate==24000 and info.channels==1 and info.duration>.05, str(path)
    assert path.stat().st_size>1000,str(path)

def write_writing_manifest(root,out,corpus,recipe):
    assert (out/'alignment-complete.json').exists()
    assert not json.loads((out/'alignment-failures.json').read_text())
    essay_uploads=json.loads((out/'essay-uploads.json').read_text());entries={}
    for eid,essay in corpus['essays'].items():
        meta=json.loads((out/'essays'/(eid+'.json')).read_text());key=essay_key(eid,meta)
        assert essay_uploads.get(key)==meta['audioSha256'];assert meta['sourceSha256']==sha(essay['text'].encode())
        entries[eid]={**meta,'buildVersion':'v5','path':CLOUD+'/'+key}
    (root/'writing-audio-dse-part-b-manifest.js').write_text('/* Kokoro af_heart with word timings measured from the generated speech. */\nwindow.EDMUND_WRITING_AUDIO = Object.freeze({...window.EDMUND_WRITING_AUDIO,...'+json.dumps(entries,ensure_ascii=False,separators=(',',':'))+'});\nwindow.EDMUND_DSE_WRITING_PART_B_WRITING_AUDIO_META = Object.freeze('+json.dumps({**recipe,'buildVersion':'v5','release':RELEASE,'count':len(entries),'complete':True},separators=(',',':'))+');\n')
    return entries

def main():
    ap=argparse.ArgumentParser();ap.add_argument('stage',choices=['upload-essays','writing-manifest','release']);ap.add_argument('--source-root',type=Path,required=True);ap.add_argument('--output-root',type=Path,required=True);ap.add_argument('--wrangler',type=Path,required=True);args=ap.parse_args()
    root=args.source_root.resolve();out=args.output_root.resolve()
    corpus=json.loads((out/'corpus.json').read_text());recipe=json.loads((out/'recipe.json').read_text())
    assert recipe['engine']=='Kokoro-82M' and recipe['voice']=='af_heart' and recipe['speed']==.96
    if args.stage=='writing-manifest':
        entries=write_writing_manifest(root,out,corpus,recipe)
        print('Writing manifest ready for validation:',len(entries),flush=True);return
    checkpoint=out/('essay-uploads.json' if args.stage=='upload-essays' else 'pack-uploads.json')
    done=json.loads(checkpoint.read_text()) if checkpoint.exists() else {}
    def upload(item):
        key,path,mime=item;digest=sha(path.read_bytes())
        if done.get(key)==digest:return key,digest
        if key in done:raise ValueError('Refusing to overwrite an uploaded immutable object: '+key)
        for attempt in range(3):
            result=subprocess.run(['node',str(args.wrangler),'r2','object','put','edmund-assets/'+key,'--file',str(path),'--content-type',mime,'--cache-control','public, max-age=31536000, immutable','--remote'],capture_output=True,text=True)
            if result.returncode==0:return key,digest
            if attempt<2:time.sleep(2**attempt)
        raise RuntimeError(result.stderr[-1500:])
    def batch(items):
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            for key,digest in pool.map(upload,items):
                if done.get(key)!=digest:
                    done[key]=digest;write(checkpoint,done);print('UPLOADED',len(done),key,flush=True)
    if args.stage=='upload-essays':
        while True:
            ready=[]
            for eid in corpus['essays']:
                meta_path=out/'essays'/(eid+'.json');mp3=meta_path.with_suffix('.mp3')
                if not meta_path.exists() or not mp3.exists():continue
                meta=json.loads(meta_path.read_text());assert meta['audioSha256']==sha(mp3.read_bytes());validate(mp3)
                assert meta['sourceSha256']==sha(corpus['essays'][eid]['text'].encode())
                ready.append((essay_key(eid,meta),mp3,'audio/mpeg'))
            batch(ready)
            if len(ready)==len(corpus['essays']):break
            time.sleep(10)
        print('ALL ESSAYS UPLOADED',len(ready),flush=True);return
    assert (out/'tts-complete.json').exists() and (out/'alignment-complete.json').exists()
    assert not json.loads((out/'tts-failures.json').read_text())
    assert not json.loads((out/'alignment-failures.json').read_text())
    texts=corpus['flashcards'];expected={sha(t.encode())[:24]:t for t in texts};assert len(expected)==len(texts)
    index={'schemaVersion':1,'audioPathPrefix':FLASH_PREFIX,'cloudBaseUrl':CLOUD,'packKeyPrefix':FLASH_PREFIX,'entries':{},'packs':{},'meta':{**recipe,'buildVersion':'v1','release':RELEASE,'entryCount':len(texts),'sourceDeckCount':corpus['sourceDeckCount'],'sourceCardCount':corpus['sourceCardCount'],'corpusSha256':sha('\n'.join(texts).encode()),'r2UploadComplete':False}}
    packs=out/'packs';packs.mkdir(exist_ok=True);uploads=[];inventory={}
    for first in '0123456789abcdef':
        blob=bytearray();prefixes=set()
        for digest in sorted(h for h in expected if h.startswith(first)):
            path=out/'flashcards'/(digest+'.mp3');validate(path);data=path.read_bytes();inventory[digest]=sha(data)
            prefix=digest[:2];index['entries'].setdefault(prefix,{})[digest[2:]]=[len(blob),len(data)];blob.extend(data);prefixes.add(prefix)
        path=packs/f'shard-{first}.bin';path.write_bytes(blob);key=FLASH_PREFIX+path.name
        pack={'key':key,'sha256':sha(blob),'size':len(blob)}
        for prefix in prefixes:index['packs'][prefix]=pack
        uploads.append((key,path,'application/octet-stream'))
    index['meta'].update({'packCount':len(index['packs']),'physicalPackCount':len(uploads),'totalBytes':sum(p.stat().st_size for _,p,_ in uploads),'audioInventorySha256':sha(json.dumps(inventory,sort_keys=True,separators=(',',':')).encode())})
    write(out/'flashcard-audio-sha256.json',inventory);batch(uploads);index['meta']['r2UploadComplete']=True
    entries=write_writing_manifest(root,out,corpus,recipe)
    mappings=dict(corpus['aliases'])
    for digest,text in expected.items():mappings[text]=CLOUD+'/'+FLASH_PREFIX+digest[:2]+'/'+digest+'.mp3'
    write(root/INDEX,index)
    flash_meta={**recipe,'buildVersion':'v1','release':RELEASE,'recordingCount':len(texts),'mappingCount':len(mappings),'complete':True}
    (root/'flashcards-dse-writing-part-b-audio.js').write_text('/* Kokoro af_heart; preserves all established Edmund Neural mappings. */\nwindow.EDMUND_FLASHCARD_AUDIO = Object.freeze({...window.EDMUND_FLASHCARD_AUDIO,...'+json.dumps(mappings,ensure_ascii=False,separators=(',',':'))+'});\nwindow.EDMUND_DSE_WRITING_PART_B_FLASHCARD_AUDIO_META = Object.freeze('+json.dumps(flash_meta,separators=(',',':'))+');\n')
    print('KOKORO RELEASE READY',len(texts),'flashcard recordings;',len(entries),'essays;',len(uploads),'packs',flush=True)

if __name__=='__main__':main()
