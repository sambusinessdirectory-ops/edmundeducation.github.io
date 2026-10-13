#!/usr/bin/env python3
"""Generate Jayden's sentence dictation and continuous narration with Kokoro bf_isabella."""
from hashlib import sha256
from pathlib import Path
import json
import subprocess
import tempfile

import numpy as np
import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
MODEL = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/kokoro-v1.0.onnx")
VOICES = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/voices-v1.0.bin")
EXPECTED = ('7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5', 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d')
DATA = ROOT / 'junior-quiz-review' / 'the-last-train.json'
OUT = ROOT / 'junior-quiz-review' / 'audio'

for file, digest in zip((MODEL, VOICES), EXPECTED):
    if sha256(file.read_bytes()).hexdigest() != digest:
        raise SystemExit(f'Unapproved Kokoro model or voice file: {file}')

data = json.loads(DATA.read_text())
sentences = [sentence for paragraph in data['paragraphs'] for sentence in paragraph['sentences']]
OUT.mkdir(parents=True, exist_ok=True)
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
synth = Kokoro.from_session(ort.InferenceSession(str(MODEL), sess_options=options, providers=['CPUExecutionProvider']), str(VOICES))
manifest = {'voice': 'bf_isabella', 'locale': 'en-gb', 'sentences': []}
full = []
rate = None
for number, sentence in enumerate(sentences, 1):
    target = OUT / f's{number:02d}.mp3'
    # Rebuild the continuous track from the same clips, so the narration and dictation agree exactly.
    wav_cache = OUT / f's{number:02d}.wav'
    if not wav_cache.exists():
        samples, sample_rate = synth.create(sentence, voice='bf_isabella', lang='en-gb', speed=1.0)
        sf.write(wav_cache, samples, sample_rate)
    samples, sample_rate = sf.read(wav_cache, dtype='float32')
    if rate is not None and sample_rate != rate:
        raise ValueError('Unexpected Kokoro sample-rate change')
    rate = sample_rate
    if not target.exists():
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(wav_cache), '-codec:a', 'libmp3lame', '-b:a', '80k', '-y', str(target)], check=True)
    if target.stat().st_size < 1500:
        raise ValueError(f'Empty sentence clip {number}')
    manifest['sentences'].append(f'junior-quiz-review/audio/{target.name}')
    full.append(samples)
    full.append(np.zeros(int(sample_rate * (0.65 if sentence.endswith(('.’', '.”')) else 0.34)), dtype=np.float32))
    print(f'{number}/{len(sentences)}', flush=True)

with tempfile.TemporaryDirectory(prefix='last-train-') as temporary:
    wav = Path(temporary) / 'full.wav'
    sf.write(wav, np.concatenate(full), rate)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(wav), '-codec:a', 'libmp3lame', '-b:a', '96k', '-y', str(OUT / 'the-last-train-full.mp3')], check=True)
manifest['full'] = 'junior-quiz-review/audio/the-last-train-full.mp3'
(ROOT / 'junior-quiz-review' / 'audio-manifest.json').write_text(json.dumps(manifest, separators=(',', ':')) + '\n')
for cached in OUT.glob('s*.wav'):
    cached.unlink()
print('Full narration and 39 Kokoro dictation clips ready', flush=True)
