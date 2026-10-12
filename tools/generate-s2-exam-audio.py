#!/usr/bin/env python3
"""Render each S2 question with alternating Kokoro voices, without speaking the answer."""
from hashlib import sha256
from pathlib import Path
import json
import subprocess
import tempfile
import sys

ROOT = Path(__file__).resolve().parents[1]
MODEL = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/kokoro-v1.0.onnx")
VOICES = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/voices-v1.0.bin")
EXPECTED = ('7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5', 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d')
VOICES_CYCLE = [('British female', 'bf_isabella', 'en-gb', 1.02), ('British male', 'bm_fable', 'en-gb', 0.98), ('American female', 'af_heart', 'en-us', 0.96)]
DATA = ROOT / 'junior-exam-prep' / 's2-oct-2026-questions.json'
OUT = ROOT / 'junior-exam-prep' / 'audio'

import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

for file, digest in zip((MODEL, VOICES), EXPECTED):
    if sha256(file.read_bytes()).hexdigest() != digest:
        raise SystemExit(f'Unapproved Kokoro model or voice file: {file}')

questions = json.loads(DATA.read_text())['questions']
if len(questions) != 470:
    raise SystemExit('Question count changed')
OUT.mkdir(parents=True, exist_ok=True)
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
synth = Kokoro.from_session(ort.InferenceSession(str(MODEL), sess_options=options, providers=['CPUExecutionProvider']), str(VOICES))
manifest = {}
for question in questions:
    number = question['number']
    label, voice, language, speed = VOICES_CYCLE[(number - 1) % 3]
    speech = question['sentence'].replace('_____', '...')
    if '_____' in speech or not speech.strip():
        raise ValueError(f'Bad audio prompt for {number}')
    path = OUT / f'q{number:03d}.mp3'
    if not path.exists():
        samples, rate = synth.create(speech, voice=voice, lang=language, speed=speed)
        with tempfile.TemporaryDirectory(prefix='s2-exam-audio-') as directory:
            wav = Path(directory) / 'speech.wav'
            sf.write(wav, samples, rate)
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(wav), '-codec:a', 'libmp3lame', '-b:a', '64k', '-y', str(path)], check=True)
    if path.stat().st_size < 1500:
        raise ValueError(f'Audio is empty for question {number}')
    manifest[f'{number:03d}'] = {'path': f'junior-exam-prep/audio/{path.name}', 'voice': label}
    if number % 25 == 0:
        print(f'{number}/470 rendered', flush=True)
(ROOT / 'junior-exam-prep' / 'audio-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n')
print('Rendered all 470 Kokoro clips', flush=True)
