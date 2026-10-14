#!/usr/bin/env python3
"""Generate British-male Kokoro table and unanswered exercise clips."""
from hashlib import sha256
from pathlib import Path
import json
import subprocess
import sys
import tempfile

import numpy as np
import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'irregular-verbs' / 'data.json'
OUT = ROOT / 'irregular-verbs' / 'audio'
MODEL = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/kokoro-v1.0.onnx")
VOICES = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models/voices-v1.0.bin")
EXPECTED = ('7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5',
            'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d')
for file, digest in zip((MODEL, VOICES), EXPECTED):
    if sha256(file.read_bytes()).hexdigest() != digest:
        raise SystemExit(f'Unexpected Kokoro asset: {file}')

data = json.loads(DATA.read_text())
OUT.mkdir(exist_ok=True)
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
synth = Kokoro.from_session(ort.InferenceSession(str(MODEL), sess_options=options,
                                                providers=['CPUExecutionProvider']), str(VOICES))

refresh_table = '--refresh-table' in sys.argv

def make_clip(name, script, force=False):
    path = OUT / name
    if not force and path.exists() and path.stat().st_size > 1000:
        return
    if isinstance(script, list):
        pieces = [synth.create(form + '.', voice='bm_fable', lang='en-gb', speed=0.96) for form in script]
        rates = {rate for _, rate in pieces}
        if len(rates) != 1:
            raise ValueError('Unexpected Kokoro sample-rate change')
        rate = rates.pop()
        pause = np.zeros(int(rate * 0.42), dtype=np.float32)
        samples = np.concatenate([pieces[0][0], pause, pieces[1][0], pause, pieces[2][0]])
    else:
        samples, rate = synth.create(script, voice='bm_fable', lang='en-gb', speed=0.96)
    with tempfile.TemporaryDirectory(prefix='irregular-voice-') as temporary:
        wav = Path(temporary) / 'voice.wav'
        sf.write(wav, samples, rate)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(wav),
                        '-codec:a', 'libmp3lame', '-b:a', '64k', '-ac', '1', '-y', str(path)], check=True)
    if path.stat().st_size < 1000:
        raise ValueError(f'Empty audio clip: {name}')

for index, entry in enumerate(data['entries'], 1):
    forms = [form.replace(',', ' or').replace(' (recline)', '') for form in entry['forms']]
    make_clip(f'v{index:03d}.mp3', forms, force=refresh_table)
    for sample in entry['sentences']:
        # The spoken prompt includes a pause at each blank, never the answer or hint.
        script = ' ... '.join(sample['parts'])
        make_clip(f'q{index:03d}-{sample["form"]}.mp3', script)
    print(f'{index}/220 entries complete', flush=True)
print('880 Kokoro clips generated', flush=True)
