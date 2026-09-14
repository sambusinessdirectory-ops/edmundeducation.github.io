"""Generate all French audio locally: Piper Tom (male), Kokoro Siwis (female).
No lesson text is sent to a speech service. See language-edition notes for models.
"""
import os
os.environ['OMP_NUM_THREADS']='2';os.environ['OPENBLAS_NUM_THREADS']='1'
import json,hashlib,subprocess,importlib.util
from pathlib import Path
import numpy as np,soundfile as sf,onnxruntime as ort
from piper import PiperVoice,SynthesisConfig
from kokoro_onnx import Kokoro
from faster_whisper import WhisperModel
ROOT=Path(__file__).resolve().parents[1];CACHE=Path('/tmp/french-lesson');OUT=ROOT/'language-audio/fr';OUT.mkdir(parents=True,exist_ok=True)
data=json.loads((ROOT/'french-1-fondant-data.js').read_text().split('=',1)[1].strip().rstrip(';'))
spec=importlib.util.spec_from_file_location('audio_builder',ROOT/'tools/generate-writing-audio.py');gen=importlib.util.module_from_spec(spec);spec.loader.exec_module(gen);gen.spoken_text=lambda s:s
manifest={'flashcards':{},'writing':{}}
def save(path,a,sr):
 temp=CACHE/'current.wav';sf.write(temp,a,sr)
 subprocess.run(['/opt/homebrew/bin/ffmpeg','-v','error','-y','-i',str(temp),'-codec:a','libmp3lame','-q:a','4',str(path)],check=True)
male=PiperVoice.load(CACHE/'models/fr_FR-tom-medium.onnx')
for i,c in enumerate(data['cards']):
 text=c['front'];path=OUT/(hashlib.sha256(text.encode()).hexdigest()[:16]+'.mp3')
 if not path.exists():
  chunks=list(male.synthesize(text,SynthesisConfig(length_scale=.96,noise_scale=.667,noise_w_scale=.8)))
  save(path,np.concatenate([x.audio_float_array for x in chunks]),chunks[0].sample_rate)
 manifest['flashcards'][text.replace('’',"'").replace('‘',"'")]=str(path.relative_to(ROOT))
 print('Card',i+1,flush=True)
options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
female=Kokoro.from_session(ort.InferenceSession('/private/tmp/sunny-s3-models/kokoro-v1.0.onnx',sess_options=options,providers=['CPUExecutionProvider']),'/private/tmp/sunny-s3-models/voices-v1.0.bin')
model=WhisperModel('base',device='cpu',compute_type='int8',cpu_threads=2,download_root='/private/tmp/italian-whisper')
class Aligner:
 def transcribe(self,a,**kw):kw['language']='fr';return model.transcribe(a,**kw)
essay=gen.essay_from_json(data['exercise']['id'],data['exercise']);audio=[];words=[];offset=0
for i,para in enumerate(essay['paragraphs']):
 cache=CACHE/f'writing-{i}.wav';timing=cache.with_suffix('.json')
 if cache.exists():a,sr=sf.read(cache,dtype='float32')
 else:a,sr=female.create(para,voice='ff_siwis',lang='fr-fr',speed=1.04);sf.write(cache,a,sr)
 if timing.exists():w=json.loads(timing.read_text())
 else:w=gen.align_sentence_words(para,a,sr,0,Aligner());timing.write_text(json.dumps(w,ensure_ascii=False))
 words.extend([[x,round(s+offset,3),round(e+offset,3)] for x,s,e in w]);audio.extend([a,np.zeros(int(sr*.72),dtype=np.float32)]);offset+=(len(a)+int(sr*.72))/sr
 print('Paragraph',i+1,'/',len(essay['paragraphs']),flush=True)
path=OUT/'fondant-au-chocolat-writing.mp3';save(path,np.concatenate(audio),sr)
manifest['writing'][data['exercise']['id']]={'path':str(path.relative_to(ROOT)),'duration':round(offset,3),'words':words,'wordCount':len(words),'voice':'ff_siwis','language':'fr','wordTimingVersion':'faster-whisper-base-fr-audio-v1'}
(ROOT/'french-1-audio.js').write_text('/* Local French voices: Piper Tom (male cards), Kokoro Siwis (female writing). */\nwindow.EDMUND_FRENCH_AUDIO='+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
print('Audio complete',len(manifest['flashcards']),len(words),flush=True)
