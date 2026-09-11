"""Build immutable role-specific dialogue clips from the site's established voices.
Local voices use the same Kokoro model as the reading/writing/speaking generators.
Aries uses the owner's existing Workers AI account. Credentials stay in memory.
"""
import argparse,hashlib,json,subprocess,tempfile,time,urllib.request,urllib.error
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--model',type=Path,required=True);parser.add_argument('--voices',type=Path,required=True);parser.add_argument('--wrangler',type=Path,required=True);parser.add_argument('--account',required=True);parser.add_argument('--kind',choices=['local','cloud'],required=True)
args=parser.parse_args();root=Path(__file__).resolve().parent.parent
source=json.loads((root/'professional-english/dialogues.json').read_text());out=root/'professional-english/audio/dialogues-v1';out.mkdir(parents=True,exist_ok=True)
rows={};kokoro=None;token=None
if args.kind=='local':
 for path,expected in [(args.model,'7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5'),(args.voices,'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d')]:
  if hashlib.sha256(path.read_bytes()).hexdigest()!=expected:raise RuntimeError('The voice model does not match the established site voice recipe')
 import onnxruntime as ort
 from kokoro_onnx import Kokoro
 import soundfile as sf
 options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
 kokoro=Kokoro.from_session(ort.InferenceSession(str(args.model),sess_options=options,providers=['CPUExecutionProvider']),str(args.voices))
else:
 auth=subprocess.run(['node',str(args.wrangler),'auth','token','--json'],capture_output=True,text=True,check=True)
 token=json.loads(auth.stdout)['token']
for dialogue in source['dialogues']:
 for index,line in enumerate(dialogue['lines']):
  recipe=source['voiceRecipes'][line['voice']]
  if (recipe['engine']=='kokoro-onnx') != (args.kind=='local'):continue
  speech=line['en'].replace('G/F','ground floor').replace('CS counter','Customer Services Counter').replace('QR','Q R')
  digest=hashlib.sha256(json.dumps({'recipe':recipe,'text':speech},sort_keys=True).encode()).hexdigest()
  path=out/f'{digest[:24]}.mp3';key=f'{dialogue["id"]}:{index}'
  if not path.exists():
   if kokoro:
    samples,rate=kokoro.create(speech,voice=recipe['voice'],speed=recipe['speed'],lang=recipe['lang'])
    with tempfile.TemporaryDirectory(prefix='professional-dialogue-') as temp:
     wav=Path(temp)/'clip.wav';sf.write(wav,samples,rate)
     subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(wav),'-codec:a','libmp3lame','-b:a','128k','-y',str(path)],check=True)
   else:
    request=urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{args.account}/ai/run/@cf/deepgram/aura-2-en',data=json.dumps({'text':speech,'speaker':'aries','encoding':'mp3'}).encode(),headers={'Authorization':f'Bearer {token}','Content-Type':'application/json'})
    for attempt in range(4):
     try:
      with urllib.request.urlopen(request,timeout=90) as response: data=response.read();content_type=response.headers.get('Content-Type','')
      if 'json' in content_type:raise RuntimeError('Voice service returned JSON instead of audio')
      if len(data)<256 or not (data[:3]==b'ID3' or data[0]==255):raise RuntimeError('Voice service returned invalid MP3')
      path.write_bytes(data);break
     except Exception as error:
      if isinstance(error,urllib.error.HTTPError) and error.code==429:
       raise RuntimeError('The voice provider allowance is unavailable; retry after reset or an authorized plan change') from None
      if attempt==3:raise RuntimeError(f'Aries generation failed for {key}: {type(error).__name__}') from None
      time.sleep(2**attempt)
  duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(path)],text=True))
  rows[key]={'path':str(path.relative_to(root/'professional-english')),'voice':line['voice'],'sourceSha256':hashlib.sha256(line['en'].encode()).hexdigest(),'recipeSha256':digest,'duration':round(duration,3)}
  print(f'{args.kind} {key} ready ({duration:.1f}s)',flush=True)
manifest_path=root/'professional-english/dialogue-audio.json'
manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
manifest.update(rows)
manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Completed {len(rows)} {args.kind} dialogue lines',flush=True)
