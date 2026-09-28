#!/usr/bin/env python3
"""Render the imported lesson models to small, locally hosted MP3s."""
import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
EXPECTED_MODEL='7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5'
EXPECTED_VOICES='bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d'
CYCLE=[
    ('american-female','af_heart','en-us',0.96),
    ('american-male','am_adam','en-us',1.0),
    ('british-male','bm_fable','en-gb',0.98),
    ('british-female','bf_isabella','en-gb',1.05),
]

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--model',type=Path,required=True)
    parser.add_argument('--voices',type=Path,required=True)
    parser.add_argument('--limit',type=int,default=0,help='Render only the first N lessons for a smoke test')
    args=parser.parse_args()
    import onnxruntime as ort
    import soundfile as sf
    from kokoro_onnx import Kokoro
    for path,expected in ((args.model,EXPECTED_MODEL),(args.voices,EXPECTED_VOICES)):
        actual=hashlib.sha256(path.read_bytes()).hexdigest()
        if actual!=expected:raise SystemExit(f'Unapproved audio model checksum: {path}')
    options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
    synth=Kokoro.from_session(ort.InferenceSession(str(args.model),sess_options=options,providers=['CPUExecutionProvider']),str(args.voices))
    lessons=json.loads((ROOT/'natural-english/imported-lessons.json').read_text())
    if args.limit:lessons=lessons[:args.limit]
    output=ROOT/'natural-english/audio/imported';output.mkdir(parents=True,exist_ok=True)
    manifest={};metadata={};count=0
    for lesson in lessons:
        texts=list(dict.fromkeys([step['model'] for step in lesson['steps'] if step.get('model')]+lesson['takeaways']))
        mapping={};rows=[]
        for index,text in enumerate(texts):
            if not text.strip() or '_' in text or len(text)>240 or ':chatgpt' in text.lower():
                raise ValueError(f'Unusable audio model in {lesson["id"]}: {text!r}')
            label,voice,lang,speed=CYCLE[index%4]
            digest=hashlib.sha256(json.dumps({'text':text,'voice':voice,'lang':lang,'speed':speed,'v':1},ensure_ascii=False,sort_keys=True).encode()).hexdigest()
            name=f'{lesson["id"]}-{index+1:02}-{digest[:16]}.mp3';dest=output/name
            if not dest.exists():
                with tempfile.TemporaryDirectory(prefix='native-english-audio-') as directory:
                    raw=Path(directory)/'speech.wav'
                    samples,rate=synth.create(text,voice=voice,speed=speed,lang=lang)
                    sf.write(raw,samples,rate)
                    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(raw),
                        '-af','adelay=180:all=1,apad=pad_dur=0.16','-codec:a','libmp3lame','-b:a','64k','-y',str(dest)],check=True)
            duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(dest)],text=True))
            if duration<0.35 or dest.stat().st_size<1800:raise ValueError(f'Empty audio: {dest}')
            mapping[text]='natural-english/audio/imported/'+name
            rows.append({'index':index,'voice':label,'text':text,'path':mapping[text],
                         'duration':round(duration,3),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
            count+=1
        manifest[lesson['id']]=mapping;metadata[lesson['id']]=rows
        if len(manifest)%25==0:print('rendered',len(manifest),'lessons,',count,'clips',flush=True)
    (ROOT/'natural-english/audio/imported-manifest.mjs').write_text('export default '+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
    (ROOT/'natural-english/audio/imported-metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,separators=(',',':'))+'\n')
    print('complete',len(manifest),'lessons,',count,'clips')

if __name__=='__main__':main()
