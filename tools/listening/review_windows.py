#!/usr/bin/env python3
"""Recognize an explicitly selected audio window for boundary/source review."""
import argparse,json
from pathlib import Path
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--model',required=True)
p.add_argument('--audio-cache',type=Path,required=True)
p.add_argument('--windows',type=Path,required=True)
p.add_argument('--output',type=Path,required=True)
args=p.parse_args()
model=WhisperModel(args.model,device='cpu',compute_type='int8',cpu_threads=3,local_files_only=True)
results=[]
for item in json.loads(args.windows.read_text()):
    waveform=decode_audio(str(args.audio_cache/f"practice-{item['practice']}-part-{item['part']}.mp3"))
    start,end=item['start'],item['end']
    segments,_=model.transcribe(waveform[round(start*16000):round(end*16000)],language='en',beam_size=5,
                               word_timestamps=True,condition_on_previous_text=False,vad_filter=False)
    words=[{'text':w.word,'start':round(start+w.start,3),'end':round(start+w.end,3)} for s in segments for w in s.words or []]
    result={**item,'words':words};results.append(result)
    print(json.dumps(result,ensure_ascii=False),flush=True)
args.output.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
