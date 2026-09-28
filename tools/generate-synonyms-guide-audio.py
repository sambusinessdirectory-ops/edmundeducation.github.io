"""Generate the Important guide's word and sentence clips with the site's Kokoro voice."""
import hashlib,json,subprocess,tempfile
from pathlib import Path
import onnxruntime as ort
from kokoro_onnx import Kokoro
import soundfile as sf
root=Path(__file__).resolve().parents[1]
model=Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/kokoro-v1.0.onnx")
voices=Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/voices-v1.0.bin")
raw=subprocess.check_output(['node','--input-type=module','-e',"import {importantModule} from './synonyms/important-data.mjs'; console.log(JSON.stringify(importantModule.words.map(w=>({word:w.word,sentence:w.exercises[0].upgrade.replace('______',w.word)}))))"],cwd=root,text=True)
items=json.loads(raw)
options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
voice=Kokoro.from_session(ort.InferenceSession(str(model),sess_options=options,providers=['CPUExecutionProvider']),str(voices))
manifest={}
for index,item in enumerate(items,1):
  clips={}
  for kind,text in [('word',item['word']),('sentence',item['sentence'])]:
    digest=hashlib.sha256(('af_heart|en-us|0.96|'+text).encode()).hexdigest()[:24]
    path=root/'synonyms/audio'/f'{digest}.mp3'
    if not path.exists():
      samples,rate=voice.create(text,voice='af_heart',lang='en-us',speed=0.96)
      with tempfile.TemporaryDirectory(prefix='synonyms-voice-') as temp:
        wav=Path(temp)/'clip.wav';sf.write(wav,samples,rate)
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-ac','1','-ar','24000','-q:a','3',str(path)],check=True)
    clips[kind]='audio/'+path.name
    print(index,kind,path.name,flush=True)
  manifest[str(index)]=clips
(root/'synonyms/guide-audio.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
