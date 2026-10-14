#!/usr/bin/env python3
"""Build the Advanced Native lesson audio with the site's approved Kokoro model."""
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
MODEL=Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/kokoro-v1.0.onnx")
VOICES=MODEL.with_name('voices-v1.0.bin')
EXPECTED_MODEL='7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5'
EXPECTED_VOICES='bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d'
# The second clip in every lesson is the listen-then-speak model. Keep that
# model in the British male voice used for Native English speaking practice.
CYCLE=[('af_heart','en-us',.96),('bm_fable','en-gb',.98),('bm_fable','en-gb',.98),('bf_isabella','en-gb',1.05)]

def main():
    import onnxruntime as ort
    import soundfile as sf
    from kokoro_onnx import Kokoro
    for path,expected in ((MODEL,EXPECTED_MODEL),(VOICES,EXPECTED_VOICES)):
        if hashlib.sha256(path.read_bytes()).hexdigest()!=expected:
            raise SystemExit(f'Unexpected model checksum: {path}')
    lessons=json.loads(subprocess.check_output(['node','--input-type=module','-e',
        "import lessons from './natural-english/advanced-expressions.mjs';console.log(JSON.stringify(lessons))"],cwd=ROOT,text=True))
    options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
    synth=Kokoro.from_session(ort.InferenceSession(str(MODEL),sess_options=options,providers=['CPUExecutionProvider']),str(VOICES))
    output=ROOT/'natural-english/audio/advanced';output.mkdir(parents=True,exist_ok=True)
    manifest={};metadata={}
    for lesson in lessons:
        texts=list(dict.fromkeys([step['model'] for step in lesson['steps'] if step.get('model')]+lesson['takeaways']))
        mapping={};rows=[]
        for index,text in enumerate(texts):
            if not text.strip() or len(text)>240 or '_' in text:raise ValueError(f'Invalid audio text: {text!r}')
            voice,lang,speed=CYCLE[index%len(CYCLE)]
            digest=hashlib.sha256(json.dumps({'text':text,'voice':voice,'lang':lang,'speed':speed,'v':1},ensure_ascii=False,sort_keys=True).encode()).hexdigest()[:16]
            name=f"{lesson['id']}-{index+1:02}-{digest}.mp3";dest=output/name
            if not dest.exists():
                with tempfile.TemporaryDirectory(prefix='advanced-native-audio-') as directory:
                    raw=Path(directory)/'speech.wav'
                    samples,rate=synth.create(text,voice=voice,speed=speed,lang=lang)
                    sf.write(raw,samples,rate)
                    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(raw),'-af','adelay=180:all=1,apad=pad_dur=0.16','-codec:a','libmp3lame','-b:a','64k','-y',str(dest)],check=True)
            duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(dest)],text=True))
            if duration<.35 or dest.stat().st_size<1800:raise ValueError(f'Empty audio: {dest}')
            mapping[text]=f'natural-english/audio/advanced/{name}'
            rows.append({'text':text,'voice':voice,'duration':round(duration,3),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'path':mapping[text]})
        manifest[lesson['id']]=mapping;metadata[lesson['id']]=rows
        print('rendered',lesson['id'],len(rows),'clips',flush=True)
    (ROOT/'natural-english/audio/advanced-manifest.mjs').write_text('export default '+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
    (ROOT/'natural-english/audio/advanced-metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,separators=(',',':'))+'\n')

if __name__=='__main__':main()
