#!/usr/bin/env python3
"""Generate Italian Kokoro recordings and audio-derived word timing.
Requires kokoro-onnx, faster-whisper, soundfile, numpy and ffmpeg.
Set KOKORO_MODEL / KOKORO_VOICES to the official v1.0 ONNX model files.
"""
import os
os.environ['OMP_NUM_THREADS']='1';os.environ['OPENBLAS_NUM_THREADS']='1'
import json,re,sys,importlib.util,hashlib,subprocess
from pathlib import Path
import numpy as np,soundfile as sf,onnxruntime as ort
from kokoro_onnx import Kokoro
from faster_whisper import WhisperModel
root=Path(__file__).resolve().parents[1];data=json.loads((root/'italian-1-burro-montato-data.js').read_text().split('=',1)[1].strip().rstrip(';'))
spec=importlib.util.spec_from_file_location('gen',root/'tools/generate-writing-audio.py');gen=importlib.util.module_from_spec(spec);spec.loader.exec_module(gen);gen.spoken_text=lambda s:s
options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
k=Kokoro.from_session(ort.InferenceSession(os.environ.get('KOKORO_MODEL','/private/tmp/sunny-s3-models/kokoro-v1.0.onnx'),sess_options=options,providers=['CPUExecutionProvider']),os.environ.get('KOKORO_VOICES','/private/tmp/sunny-s3-models/voices-v1.0.bin'))
out=root/'language-audio/it';out.mkdir(parents=True,exist_ok=True)
def save(path,a,sr):
 sf.write('/tmp/italian-lesson/current.wav',a,sr)
 subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/italian-lesson/current.wav','-codec:a','libmp3lame','-q:a','4',str(path)],check=True)
manifest={'flashcards':{},'writing':{}}
for i,c in enumerate(data['cards']):
 text=c['front'];name=hashlib.sha256(text.encode()).hexdigest()[:16]+'.mp3';path=out/name
 if not path.exists():
  a,sr=k.create(text,voice='im_nicola',lang='it',speed=1.02);save(path,a,sr)
 manifest['flashcards'][text.replace('’',"'").replace('‘',"'")]=str(path.relative_to(root))
 print('card',i+1,flush=True)
model=WhisperModel('base',device='cpu',compute_type='int8',cpu_threads=2,download_root='/private/tmp/italian-whisper')
class ItalianAligner:
 def transcribe(self,a,**kw):
  kw['language']='it';return model.transcribe(a,**kw)
aligner=ItalianAligner();essay=gen.essay_from_json(data['exercise']['id'],data['exercise']);audio=[];words=[];offset=0
for i,para in enumerate(essay['paragraphs']):
 cache=Path('/tmp/italian-lesson')/f'writing-{i}.wav'
 if cache.exists():a,sr=sf.read(cache,dtype='float32')
 else:a,sr=k.create(para,voice='if_sara',lang='it',speed=1.02);sf.write(cache,a,sr)
 timing=cache.with_suffix('.json')
 if timing.exists():w=json.loads(timing.read_text())
 else:w=gen.align_sentence_words(para,a,sr,0,aligner);timing.write_text(json.dumps(w))
 words.extend([[x,round(s+offset,3),round(e+offset,3)] for x,s,e in w]);audio.extend([a,np.zeros(int(sr*.72),dtype=np.float32)]);offset+=(len(a)+int(sr*.72))/sr
 print('paragraph',i+1,len(essay['paragraphs']),flush=True)
path=out/'burro-montato-writing.mp3';save(path,np.concatenate(audio),sr)
manifest['writing'][data['exercise']['id']]={'path':str(path.relative_to(root)),'duration':round(offset,3),'words':words,'wordCount':len(words),'voice':'if_sara','language':'it','wordTimingVersion':'faster-whisper-base-it-audio-v1'}
(root/'italian-1-audio.js').write_text('/* Italian voices: Kokoro im_nicola (cards), if_sara (writing). */\nwindow.EDMUND_ITALIAN_AUDIO='+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
