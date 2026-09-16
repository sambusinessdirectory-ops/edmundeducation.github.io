"""Render Lesson 2 using the existing verified Kokoro voices (no cloud credentials)."""
import argparse,hashlib,json,re,subprocess,tempfile
from pathlib import Path
import onnxruntime as ort
from kokoro_onnx import Kokoro
import soundfile as sf
p=argparse.ArgumentParser();p.add_argument('--model',type=Path,required=True);p.add_argument('--voices',type=Path,required=True);a=p.parse_args()
for path,digest in [(a.model,'7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5'),(a.voices,'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d')]:
 assert hashlib.sha256(path.read_bytes()).hexdigest()==digest,'Unexpected voice model'
root=Path(__file__).resolve().parents[1]/'professional-english';options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
k=Kokoro.from_session(ort.InferenceSession(str(a.model),sess_options=options,providers=['CPUExecutionProvider']),str(a.voices))
def render(text,recipe,path):
 if not path.exists():
  path.parent.mkdir(parents=True,exist_ok=True)
  samples,rate=k.create(text,voice=recipe['voice'],lang=recipe['lang'],speed=recipe['speed'])
  with tempfile.TemporaryDirectory(prefix='lesson3-voice-') as temp:
   wav=Path(temp)/'clip.wav';sf.write(wav,samples,rate)
   subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-ac','1','-ar','24000','-q:a','3',str(path)],check=True)
 return round(float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(path)],text=True)),3)
source=json.loads((root/'dialogues.json').read_text())
cards=json.loads((root/'content/lesson-2-flashcards.json').read_text());clips={};recipe=source['voiceRecipes']['american-female']
for i,c in enumerate(cards):
 path=root/c['audio'].lstrip('/');duration=render(c['front'].replace('G/F','ground floor').replace('QR','Q R').replace('CS','Customer Services'),recipe,path)
 clips[c['id']]={'path':str(path.relative_to(root)),'sourceSha256':hashlib.sha256(c['front'].encode()).hexdigest(),'duration':duration}
 print('flashcard',i+1,len(cards),c['front'],duration,flush=True)
(root/'content/lesson-2-audio.json').write_text(json.dumps({'recipe':recipe,'modelSha256':hashlib.sha256(a.model.read_bytes()).hexdigest(),'voicesSha256':hashlib.sha256(a.voices.read_bytes()).hexdigest(),'clips':clips},ensure_ascii=False,indent=2)+'\n')
