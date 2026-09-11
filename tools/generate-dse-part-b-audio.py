#!/usr/bin/env python3
"""Resume the DSE Part B Kokoro correction without modifying older recordings.

Run `tts`, then `align` (alignment may run while TTS is still in progress).
All build output belongs outside the website repository. Published manifests
are written only by the separate release step after complete verification.
"""
from __future__ import annotations
import os
os.environ.setdefault('OMP_NUM_THREADS', '1')
os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
os.environ.setdefault('HF_HUB_OFFLINE', '1')
import argparse, concurrent.futures, hashlib, importlib.util, json, re, subprocess, time
from types import SimpleNamespace
from pathlib import Path
import numpy as np
import soundfile as sf

RECIPE = {
    'engine': 'Kokoro-82M', 'modelVersion': 'v1.0', 'voice': 'af_heart',
    'language': 'en-us', 'speed': 0.96, 'sampleRate': 24000,
    'format': 'audio/mpeg', 'compressionLevel': 0.55, 'bitrateMode': 'VARIABLE',
    'sentencePause': 0.45, 'paragraphPause': 0.72,
    'wordTimingMethod': 'faster-whisper-base.en-audio-v1',
    'modelSha256': '7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5',
    'voicesSha256': 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d',
}

def sha(data): return hashlib.sha256(data).hexdigest()
def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + f'.{os.getpid()}.tmp')
    temp.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n')
    temp.replace(path)

def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    obj = importlib.util.module_from_spec(spec); spec.loader.exec_module(obj)
    return obj

def configure_writing_pronunciation(writing):
    canonical=writing.spoken_text
    def spoken(value):
        # Musical solfege in the supplied magazine name. eSpeak otherwise
        # renders the final syllable as "my". Displayed text stays unchanged.
        return canonical(value).replace('Do-Re-Mi','doh ray mee')
    writing.spoken_text=spoken
    return writing

def load_sources(root):
    flash = module('flash_recipe', root / 'tools/generate-flashcard-audio.py')
    writing = configure_writing_pronunciation(module('writing_recipe', root / 'tools/generate-writing-audio.py'))
    source = (root / 'writing-practice-dse-part-b-library-data.js').read_text()
    raw = json.loads(re.search(r'window\.[A-Z0-9_]+\s*=\s*(\{.*\});\s*$', source, re.S)[1])
    essays = {eid: writing.essay_from_json(eid, e) for eid, e in raw.items()}
    script = r'''
const fs=require('fs'),vm=require('vm');let c={window:{}};
vm.runInNewContext(fs.readFileSync('flashcards-audio-manifest.js','utf8'),c);
for(const f of fs.readdirSync('.').filter(f=>/^flashcards-dse-writing-part-b-\d{4}-data.js$/.test(f)))vm.runInNewContext(fs.readFileSync(f,'utf8'),c);
process.stdout.write(JSON.stringify({fronts:Object.values(c.window.EDMUND_FLASHCARD_SEED).flat().map(c=>c.front),baseline:c.window.EDMUND_FLASHCARD_AUDIO,deckCount:Object.keys(c.window.EDMUND_FLASHCARD_SEED).length}));
'''
    data = json.loads(subprocess.check_output(['node', '-e', script], cwd=root))
    aliases, pending = {}, []
    import unicodedata
    for text in sorted({flash.normalize_card_text(t) for t in data['fronts']}):
        if text in data['baseline']: continue
        alias = unicodedata.normalize('NFKC', text).replace('“', '"').replace('”', '"')
        if alias in data['baseline']: aliases[text] = data['baseline'][alias]
        else: pending.append(text)
    return flash, writing, essays, pending, aliases, {'sourceDeckCount':data['deckCount'],'sourceCardCount':len(data['fronts'])}

def init_tts(model, voices):
    global kokoro
    import onnxruntime as ort
    from kokoro_onnx import Kokoro
    opt = ort.SessionOptions(); opt.intra_op_num_threads=1; opt.inter_op_num_threads=1
    opt.add_session_config_entry('session.intra_op.allow_spinning', '0')
    session = ort.InferenceSession(model, sess_options=opt, providers=['CPUExecutionProvider'])
    kokoro = Kokoro.from_session(session, voices)

def render(task):
    kind, text, output = task; output = Path(output)
    try:
        if output.exists():
            info = sf.info(output)
            if info.samplerate == 24000 and info.channels == 1 and info.duration > 0.05:
                return kind, str(output), None
        samples, rate = kokoro.create(text, voice='af_heart', lang='en-us', speed=.96)
        samples = np.asarray(samples, dtype=np.float32)
        assert rate == 24000 and len(samples) > 1200 and np.isfinite(samples).all()
        assert np.max(np.abs(samples)) > .005
        output.parent.mkdir(parents=True, exist_ok=True)
        temp = output.with_name(output.name + f'.{os.getpid()}.tmp')
        if kind == 'flashcard':
            sf.write(temp, samples, rate, format='MP3', subtype='MPEG_LAYER_III', compression_level=.55, bitrate_mode='VARIABLE')
        else: sf.write(temp, samples, rate, format='WAV', subtype='FLOAT')
        temp.replace(output)
        return kind, str(output), None
    except Exception as e: return kind, str(output), repr(e)

def sentence_path(out, spoken): return out / 'sentences' / (sha(spoken.encode()) + '.wav')

def init_alignment(root):
    global writing, aligner
    from faster_whisper import WhisperModel
    writing = configure_writing_pronunciation(module('writing_recipe', Path(root) / 'tools/generate-writing-audio.py'))
    aligner = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=1, local_files_only=True)

class SentenceRecognition:
    """Reuse an essay recognition pass, retaining the canonical retry/quality gate.

    Whisper pads even a short input to a 30-second encoder window. Recognizing
    the essay once avoids encoding mostly silence thousands of times. Each
    sentence still passes the canonical 82% character-match threshold; any
    failed match retries directly against its individual sentence waveform.
    """
    def __init__(self, recognized, start, end, sentence):
        self.first=True
        self.sentence=sentence
        self.words=[SimpleNamespace(word=w,start=max(0,a-start),end=min(end-start,b-start))
                    for w,a,b in recognized if start <= (a+b)/2 < end]
    def transcribe(self, samples, **options):
        if self.first:
            self.first=False
            segments,info=iter([SimpleNamespace(words=self.words)]),None
        else:segments,info=aligner.transcribe(samples,**options)
        def normalized():
            for segment in segments:
                for word in segment.words or []:
                    word.word=normalize_recognized_token(word.word,self.sentence)
                yield segment
        return normalized(),info

def normalize_recognized_number(token, sentence):
    """Match a spoken age/count written as digits by ASR to its source spelling.

    Only substitute when the equivalent English number is present in the
    displayed sentence. The measured start/end times remain untouched.
    """
    digits=token.strip().strip('.,!?;:')
    if not digits.isdigit() or not 0<=int(digits)<100:return token
    if re.search(r'(?<!\w)'+re.escape(digits)+r'(?!\w)',sentence):return token
    n=int(digits)
    small=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
    tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']
    spoken=small[n] if n<20 else tens[n//10]+(' '+small[n%10] if n%10 else '')
    pattern=r'\b'+r'[\s-]+'.join(spoken.split())+r'\b'
    match=re.search(pattern,sentence,re.I)
    return match[0] if match else token

def normalize_recognized_token(token, sentence):
    token=normalize_recognized_number(token,sentence)
    bare=token.strip().strip('.,!?;:')
    # Reviewed name/heading recognition substitutions in the supplied texts.
    # These repair ASR
    # spelling only; no synthesis text, waveform or timestamp is changed.
    if bare.casefold() in {'2','two'} and re.match(r'^To\s*:',sentence,re.I):
        return 'To'
    for variant,spelling in {'jacky':'Jackie','keto':'Kito','calvin':'Kelvin'}.items():
        if bare.casefold()==variant and not re.search(r'\b'+variant+r'\b',sentence,re.I):
            match=re.search(r'\b'+spelling+r'\b',sentence,re.I)
            if match:return match[0]
    return token

def align_essay(task):
    eid, essay, output = task; out = Path(output)
    meta_path = out / 'essays' / (eid + '.json')
    mp3 = out / 'essays' / (eid + '.mp3')
    source_sha = sha(essay['text'].encode())
    if meta_path.exists() and mp3.exists():
        old=json.loads(meta_path.read_text())
        if old.get('sourceSha256')==source_sha and old.get('audioSha256')==sha(mp3.read_bytes()): return eid, None
    # One efficient recognition pass supplies candidates for each sentence.
    recognition_path=out/'recognition'/(source_sha+'.json')
    if recognition_path.exists():recognized=json.loads(recognition_path.read_text())
    else:
        audio_chunks=[]
        for pi,group in enumerate(essay['sentences']):
            for si,sentence in enumerate(group):
                wav=sentence_path(out,writing.spoken_text(sentence))
                if not wav.exists():return eid,'pending'
                audio_chunks.append(sf.read(wav,dtype='float32')[0])
                pause=.45 if si<len(group)-1 else .72 if pi<len(essay['sentences'])-1 else 0
                if pause:audio_chunks.append(np.zeros(round(24000*pause),dtype=np.float32))
        segments,_=aligner.transcribe(writing.resample_for_alignment(np.concatenate(audio_chunks),24000),language='en',task='transcribe',beam_size=5,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=writing.spoken_text(essay['text']))
        recognized=[[word.word,float(word.start),float(word.end)] for segment in segments for word in segment.words or [] if word.start is not None and word.end is not None]
        dump(recognition_path,recognized)
    chunks, words, times, failures = [], [], [], []
    elapsed = 0; previous = None
    for pi, group in enumerate(essay['sentences']):
        for si, sentence in enumerate(group):
            wav=sentence_path(out, writing.spoken_text(sentence))
            if not wav.exists(): return eid, 'pending'
            samples, rate = sf.read(wav, dtype='float32'); assert rate == 24000
            cache=out / 'alignments' / (sha(sentence.encode()) + '.json')
            try:
                if cache.exists(): row=json.loads(cache.read_text())
                else:
                    candidates=SentenceRecognition(recognized,elapsed/rate,(elapsed+len(samples))/rate,sentence)
                    row=writing.align_sentence_words(sentence, samples, rate, 0, candidates, context_audio=previous)
                    dump(cache, row)
                words.extend([[w,round(a+elapsed/rate,3),round(b+elapsed/rate,3)] for w,a,b in row])
            except Exception as e: failures.append({'paragraph':pi,'sentence':si,'text':sentence,'error':repr(e)})
            times.append({'paragraph':pi,'sentence':si,'start':round(elapsed/rate,3),'end':round((elapsed+len(samples))/rate,3)})
            chunks.append(samples); elapsed+=len(samples); previous=samples
            pause = .45 if si < len(group)-1 else .72 if pi < len(essay['sentences'])-1 else 0
            if pause:
                silence=np.zeros(round(rate*pause),dtype=np.float32);chunks.append(silence);elapsed+=len(silence)
    if failures:
        dump(out / 'failures' / (eid+'.json'), failures)
        return eid, f'{len(failures)} sentence alignment failures'
    assert [w[0] for w in words] == [w for w,_ in writing.display_words(essay['text'])]
    mp3.parent.mkdir(parents=True, exist_ok=True)
    temp=mp3.with_name(mp3.name+f'.{os.getpid()}.tmp')
    sf.write(temp,np.concatenate(chunks),24000,format='MP3',subtype='MPEG_LAYER_III',compression_level=.55,bitrate_mode='VARIABLE');temp.replace(mp3)
    entry={**RECIPE,'sourceSha256':source_sha,'audioSha256':sha(mp3.read_bytes()),'duration':round(elapsed/24000,3),'wordCount':len(words),'words':words,'sentenceTimings':times,'voiceDescription':'American English female'}
    dump(meta_path,entry)
    failure_file=out/'failures'/(eid+'.json')
    if failure_file.exists(): failure_file.unlink()
    return eid,None

def main():
    ap=argparse.ArgumentParser();ap.add_argument('stage',choices=['tts','align']);ap.add_argument('--source-root',type=Path,required=True);ap.add_argument('--output-root',type=Path,required=True);ap.add_argument('--model',type=Path);ap.add_argument('--voices',type=Path);ap.add_argument('--workers',type=int,default=6);args=ap.parse_args()
    root=args.source_root.resolve();out=args.output_root.resolve();out.mkdir(parents=True,exist_ok=True)
    flash,w,essays,texts,aliases,counts=load_sources(root)
    recipe={**RECIPE,'flashGeneratorSha256':sha((root/'tools/generate-flashcard-audio.py').read_bytes()),'writingGeneratorSha256':sha((root/'tools/generate-writing-audio.py').read_bytes())}
    rp=out/'recipe.json'
    if rp.exists(): assert json.loads(rp.read_text())==recipe,'Refusing to mix voice recipes'
    else:dump(rp,recipe)
    dump(out/'corpus.json',{'flashcards':texts,'aliases':aliases,'essays':essays,**counts})
    if args.stage=='tts':
        assert args.model and sha(args.model.read_bytes())==RECIPE['modelSha256']
        assert args.voices and sha(args.voices.read_bytes())==RECIPE['voicesSha256']
        sentences={w.spoken_text(s) for e in essays.values() for g in e['sentences'] for s in g}
        # Group essays first so the independent alignment stage can start early.
        tasks=[];seen=set()
        for e in essays.values():
            for g in e['sentences']:
                for s in g:
                    spoken=w.spoken_text(s)
                    if spoken not in seen:tasks.append(('sentence',spoken,str(sentence_path(out,spoken))));seen.add(spoken)
        tasks.extend(('flashcard',flash.spoken_text(t),str(out/'flashcards'/(sha(t.encode())[:24]+'.mp3'))) for t in texts)
        started=time.monotonic();failures=[]
        print(f'TTS: {len(texts)} flashcard recordings, {len(sentences)} unique sentences; {args.workers} workers',flush=True)
        with concurrent.futures.ProcessPoolExecutor(max_workers=args.workers,initializer=init_tts,initargs=(str(args.model),str(args.voices))) as pool:
            for i,(kind,path,error) in enumerate(pool.map(render,tasks,chunksize=1),1):
                if error:failures.append({'path':path,'error':error});print('ERROR',path,error,flush=True)
                if i%50==0 or i==len(tasks):print(f'TTS {i}/{len(tasks)} ({kind}); elapsed {(time.monotonic()-started)/60:.1f} min',flush=True)
        dump(out/'tts-failures.json',failures)
        if failures:raise SystemExit(1)
        dump(out/'tts-complete.json',{'flashcards':len(texts),'sentences':len(sentences),'recipe':recipe})
    else:
        remaining=dict(essays); failed={};started=time.monotonic()
        with concurrent.futures.ProcessPoolExecutor(max_workers=args.workers,initializer=init_alignment,initargs=(str(root),)) as pool:
            while remaining:
                ready=[(eid,e,str(out)) for eid,e in remaining.items() if all(sentence_path(out,w.spoken_text(s)).exists() for g in e['sentences'] for s in g)]
                if not ready:
                    if (out/'tts-complete.json').exists():raise RuntimeError('Missing sentence recordings')
                    time.sleep(5);continue
                for eid,error in pool.map(align_essay,ready):
                    if error!='pending':
                        remaining.pop(eid)
                        if error:failed[eid]=error
                        print(f'ALIGN {len(essays)-len(remaining)}/{len(essays)} {eid}: {error or "OK"}; elapsed {(time.monotonic()-started)/60:.1f} min',flush=True)
        dump(out/'alignment-failures.json',failed)
        if failed:raise SystemExit(1)
        dump(out/'alignment-complete.json',{'essays':len(essays),'recipe':recipe})

if __name__=='__main__':main()
