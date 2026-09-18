"""Generate each module’s examples with the established four voices, in manual order.
Credentials stay in memory. Cache immutable source hashes; pad starts for mobile playback.
"""
import argparse,json,hashlib,subprocess,tempfile,urllib.request,urllib.error,time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--model',required=True);p.add_argument('--voices',required=True);p.add_argument('--sentences',required=True);p.add_argument('--output-prefix',default='audio');p.add_argument('--kind',choices=['local','cloud'],required=True);a=p.parse_args()
root=Path(__file__).resolve().parent.parent;out=root/'polysemy-lab/audio';out.mkdir(exist_ok=True)
recipes=json.loads((root/'professional-english/dialogues.json').read_text())['voiceRecipes'];cycle=['american-female','american-male','british-male','british-female'];rows=json.loads(Path(a.sentences).read_text());manifest={}
if a.kind=='local':
 import onnxruntime as ort,soundfile as sf
 from kokoro_onnx import Kokoro
 for path,expected in [(a.model,'7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5'),(a.voices,'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d')]:
  assert hashlib.sha256(Path(path).read_bytes()).hexdigest()==expected
 opt=ort.SessionOptions();opt.intra_op_num_threads=2;opt.inter_op_num_threads=1
 kokoro=Kokoro.from_session(ort.InferenceSession(a.model,sess_options=opt,providers=['CPUExecutionProvider']),a.voices)
else:
 token=json.loads(subprocess.check_output(['node',str(root/'workers/speaking-system/node_modules/wrangler/bin/wrangler.js'),'auth','token','--json'],text=True))['token']
 def request(model,payload):
  req=urllib.request.Request('https://api.cloudflare.com/client/v4/accounts/bb52550c9a10ce282a09d742d800c06e/ai/run/'+model,data=json.dumps(payload).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
  for attempt in range(10):
   try:
    with urllib.request.urlopen(req,timeout=120) as r: return r.read()
   except urllib.error.HTTPError as error:
    body=error.read().decode();print('Service response:',model,error.code,body[:1000],flush=True)
    if 'daily free allocation' in body: raise RuntimeError('Cloudflare daily audio allowance exhausted; resume after reset') from error
    if error.code not in (429,500,502,503,504) or attempt==9: raise
    delay=min(300,30*(2**attempt));print('Service busy; retry in',delay,'seconds',flush=True);time.sleep(delay)
for index,row in enumerate(rows):
 index=row.get('index',index);voice=row.get('voice',cycle[index%4]);recipe=dict(recipes[voice])
 # Sentence-specific pacing correction: bm_fable at 0.98 blurred 'need' into 'night'.
 if row['id']=='immediate-13-1':recipe['speed']=1.02
 if (voice=='american-male')!=(a.kind=='cloud'):continue
 digest=hashlib.sha256(json.dumps({'text':row['en'],'recipe':recipe,'version':1},sort_keys=True).encode()).hexdigest();dest=out/(digest[:24]+'.mp3')
 if not dest.exists():
  with tempfile.TemporaryDirectory(prefix='polysemy-voice-') as temp:
   raw=Path(temp)/'raw.wav';trim=0
   if a.kind=='local':
    samples,rate=kokoro.create(row['en'],voice=recipe['voice'],speed=recipe['speed'],lang=recipe['lang']);sf.write(raw,samples,rate)
   else:
    import base64
    raw=Path(temp)/'raw.mp3';raw.write_bytes(request('@cf/deepgram/aura-2-en',{'text':'Hello. '+row['en'].replace('8 p.m.', 'eight P M'),'speaker':'aries','encoding':'mp3'}))
    result=json.loads(request('@cf/openai/whisper-large-v3-turbo',{'audio':base64.b64encode(raw.read_bytes()).decode(),'language':'en'}))['result']
    words=[w for s in result.get('segments',[]) for w in s.get('words',[])]
    if len(words)<2 or 'hello' not in words[0]['word'].lower():
     debug=Path(tempfile.gettempdir())/('polysemy-prefix-'+row['id']);debug.with_suffix('.mp3').write_bytes(raw.read_bytes());debug.with_suffix('.json').write_text(json.dumps(result));raise RuntimeError('Cannot safely remove generation prefix '+row['id'])
    trim=(words[0]['end']+words[1]['start'])/2
   subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(raw),'-af',f'atrim=start={trim},adelay=300:all=1,apad=pad_dur=0.2,asetpts=N/SR/TB','-codec:a','libmp3lame','-b:a','96k','-y',str(dest)],check=True)
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(dest)],text=True))
 manifest[row['id']]={'path':'audio/'+dest.name,'voice':voice,'index':index,'text':row['en'],'duration':round(duration,3),'speed':recipe['speed'],'sourceSha256':hashlib.sha256(row['en'].encode()).hexdigest()};print(row['id'],voice,round(duration,2),flush=True)
 (root/f'polysemy-lab/{a.output_prefix}-{a.kind}.json').write_text(json.dumps(manifest,indent=2)+'\n')
