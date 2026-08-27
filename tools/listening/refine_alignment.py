#!/usr/bin/env python3
"""Re-recognize low-confidence rows in short audio windows, without interpolation."""
import argparse
import concurrent.futures
import hashlib
import json
from pathlib import Path

from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio
from align_transcripts import align, normalize

ROOT = Path(__file__).resolve().parents[2]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audio-cache', type=Path, required=True)
    parser.add_argument('--model', required=True)
    args = parser.parse_args()
    model = WhisperModel(args.model,device='cpu',compute_type='int8',cpu_threads=2,num_workers=2,local_files_only=True)

    def process(path):
        recording = json.loads(path.read_text()); practice,part=recording['practice'],recording['part']
        data=json.loads((ROOT/f'assets/listening/practices/practice-{practice}.json').read_text())
        rows=data['transcript'][str(part)]
        fingerprint=hashlib.sha256(json.dumps(rows,ensure_ascii=False).encode()).hexdigest()
        output=path.with_suffix('.refinements.json')
        cached=json.loads(output.read_text()) if output.exists() else {}
        if cached.get('transcriptSha256')==fingerprint and cached.get('version')==2: return
        initial,warnings=align(rows,recording)
        waveform=decode_audio(str(path.with_suffix('.mp3')))
        ranges=initial['lines']; replacements={}; details=[]
        previous=[cached.get('rows',{}).get(str(i),row) for i,row in enumerate(ranges)] if cached.get('transcriptSha256')==fingerprint else ranges
        overlaps={i for i in range(1,len(previous)) if previous[i]['start'] is not None and previous[i-1]['end'] is not None
                  and previous[i]['start']<previous[i-1]['end']-.05}
        targets=sorted({warning['row'] for warning in warnings}|overlaps|{i-1 for i in overlaps})
        for index in targets:
            # Include neighbouring speech to avoid hallucinating a short word
            # from silence. Bounds always come from recognized recording words.
            left=index-1
            while left>=0 and ranges[left]['coverage']<.8:left-=1
            right=index+1
            while right<len(rows) and ranges[right]['coverage']<.8:right+=1
            start=max(0,(ranges[left]['start'] if left>=0 else 0)-.4)
            end=min(recording['duration'],(ranges[right]['end'] if right<len(rows) else recording['duration'])+.4)
            if end-start>100: continue
            subset=rows[max(0,left):min(len(rows),right+1)]
            local_index=index-max(0,left)
            best=replacements.get(str(index),ranges[index]); evidence=[]; best_subset=None
            for prompt in [None, ' '.join(row['en'] for row in subset)]:
                segments,_=model.transcribe(waveform[round(start*16000):round(end*16000)], language='en',
                    beam_size=5,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=prompt)
                words=[{'text':word.word,'start':round(start+word.start,3),'end':round(start+word.end,3)}
                       for segment in segments for word in segment.words or []]
                candidate_alignment,_=align(subset,{**recording,'words':words})
                candidate=candidate_alignment['lines'][local_index]
                evidence.append({'prompted':bool(prompt),'words':words,'candidate':candidate})
                if candidate['coverage']>=best['coverage'] and candidate['end'] is not None and candidate['end']>candidate['start']:
                    best=candidate
                    best_subset=candidate_alignment['lines']
                if best['coverage']>=.94:break
            if best!=ranges[index]:replacements[str(index)]={**best,'refined':True}
            if best_subset and best['coverage']>=.8:
                for offset,value in enumerate(best_subset):
                    original_index=max(0,left)+offset
                    if value['coverage']>=.94 and value['end'] is not None and value['end']>value['start']:
                        replacements[str(original_index)]={**value,'refined':True}
            details.append({'row':index,'text':rows[index]['en'],'initial':ranges[index],'best':best,'attempts':evidence})
        output.write_text(json.dumps({'version':2,'transcriptSha256':fingerprint,'rows':replacements,'details':details},ensure_ascii=False,indent=2))
        remaining=sum(item['best']['coverage']<.8 for item in details)
        print(f'P{practice}.{part}: refined {len(replacements)}/{len(targets)}; {remaining} still below 80%',flush=True)

    paths=[path for path in args.audio_cache.glob('practice-*-part-*.json') if '.refinements.' not in path.name]
    with concurrent.futures.ThreadPoolExecutor(2) as pool:
        for result in pool.map(process,paths):pass


if __name__=='__main__':main()
