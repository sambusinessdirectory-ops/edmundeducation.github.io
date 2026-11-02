#!/usr/bin/env python3
"""Regenerate one changed writing essay with the established Edmund Neural voice.

Useful when the global corpus contains unrelated missing recordings. Keeps all
other manifest entries and audio files untouched; then validates exact words.
"""
from __future__ import annotations
import argparse
import hashlib
import importlib.util
import os
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT=Path(__file__).resolve().parent.parent
SPEC=importlib.util.spec_from_file_location('writing_audio_generator',ROOT/'tools/generate-writing-audio.py')
assert SPEC and SPEC.loader
G=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(G)


def main()->None:
    parser=argparse.ArgumentParser()
    parser.add_argument('essay_id')
    parser.add_argument('--model',type=Path,required=True)
    parser.add_argument('--voices',type=Path,required=True)
    args=parser.parse_args()
    essays=G.extract_essays(ROOT)
    if args.essay_id not in essays:raise SystemExit(f'Unknown essay: {args.essay_id}')
    essay=essays[args.essay_id]
    manifest=ROOT/'writing-audio-manifest.js'
    entries=G.load_manifest_entries(manifest)
    relative=G.audio_relative_path(args.essay_id,str(essay['text']))
    destination=ROOT/relative
    if G.valid_existing_audio(destination) and G.entry_matches_essay(entries.get(args.essay_id),args.essay_id,essay):
        print(f'Already current: {args.essay_id}')
        return
    synth=G.Kokoro(str(args.model.resolve()),str(args.voices.resolve()))
    aligner=G.WhisperModel(G.DEFAULT_ALIGNMENT_MODEL,device='cpu',compute_type='int8')
    chunks=[];words=[];sample_rate=0;elapsed=0
    for pi,sentences in enumerate(essay['sentences']):
        for si,sentence in enumerate(sentences):
            audio,rate=synth.create(G.spoken_text(str(sentence)),voice=G.DEFAULT_VOICE,speed=G.DEFAULT_SPEED,lang=G.DEFAULT_LANGUAGE)
            if sample_rate and rate!=sample_rate:raise RuntimeError('Sample rate changed')
            sample_rate=rate
            chunk=np.asarray(audio,dtype=np.float32)
            words.extend(G.align_sentence_words(str(sentence),chunk,rate,elapsed/rate,aligner))
            chunks.append(chunk);elapsed+=len(chunk)
            if si<len(sentences)-1:
                pause=np.zeros(round(rate*G.SENTENCE_PAUSE_SECONDS),dtype=np.float32)
                chunks.append(pause);elapsed+=len(pause)
        if pi<len(essay['sentences'])-1:
            pause=np.zeros(round(sample_rate*G.PARAGRAPH_PAUSE_SECONDS),dtype=np.float32)
            chunks.append(pause);elapsed+=len(pause)
    destination.parent.mkdir(parents=True,exist_ok=True)
    temp=destination.with_name(f'.{destination.stem}.{os.getpid()}.tmp')
    sf.write(temp,np.concatenate(chunks),sample_rate,format='MP3',subtype='MPEG_LAYER_III',compression_level=0.55,bitrate_mode='VARIABLE')
    temp.replace(destination)
    text=str(essay['text'])
    entries[args.essay_id]={
        'path':relative,'sourceSha256':hashlib.sha256(text.encode()).hexdigest(),
        'wordCount':len(words),'duration':round(elapsed/sample_rate,3),'words':words,
    }
    G.write_manifest(manifest,essays,entries,voice=G.DEFAULT_VOICE,language=G.DEFAULT_LANGUAGE,speed=G.DEFAULT_SPEED)
    if not G.valid_existing_audio(destination) or not G.entry_matches_essay(entries[args.essay_id],args.essay_id,essay):
        raise RuntimeError('Regenerated audio or word alignment failed validation')
    print(f'Regenerated {args.essay_id}: {len(words)} words, {elapsed/sample_rate:.3f}s, {relative}')

if __name__=='__main__':main()
