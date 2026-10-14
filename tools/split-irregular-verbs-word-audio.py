#!/usr/bin/env python3
"""Extract the three Kokoro-spoken forms from each existing table clip."""
from pathlib import Path
import subprocess

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / 'irregular-verbs' / 'audio'
RATE = 24000
FRAME = 240  # 10 ms

for id in range(1, 221):
    source = AUDIO / f'v{id:03d}.mp3'
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(source),
                                   '-f', 'f32le', '-ac', '1', '-ar', str(RATE), '-'])
    samples = np.frombuffer(raw, dtype=np.float32)
    levels = np.array([np.max(np.abs(samples[i:i + FRAME]))
                       for i in range(0, len(samples), FRAME)])
    runs = []
    start = None
    for index, silent in enumerate(levels < .002):
        if silent and start is None:
            start = index
        elif not silent and start is not None:
            runs.append((start, index))
            start = None
    if start is not None:
        runs.append((start, len(levels)))
    # The source generator inserted two 0.42-second silent joins. Encoder
    # padding makes each decoded join about 0.5 seconds; use the two longest.
    joins = sorted((run for run in runs if run[1] - run[0] >= 42 and
                    run[0] > 15 and run[1] < len(levels) - 15),
                   key=lambda run: run[1] - run[0], reverse=True)[:2]
    if len(joins) != 2:
        raise RuntimeError(f'Expected two table-audio joins in {source.name}')
    joins.sort()
    cuts = [0, *[round((a + b) * FRAME / 2) for a, b in joins], len(samples)]
    for form in range(1, 4):
        target = AUDIO / f'w{id:03d}-{form}.mp3'
        wav = target.with_suffix('.tmp.wav')
        sf.write(wav, samples[cuts[form - 1]:cuts[form]], RATE)
        try:
            subprocess.run(['ffmpeg', '-v', 'error', '-i', str(wav), '-codec:a',
                            'libmp3lame', '-b:a', '64k', '-ac', '1', '-y', str(target)],
                           check=True)
        finally:
            wav.unlink(missing_ok=True)
        if target.stat().st_size < 1000:
            raise RuntimeError(f'Empty word clip: {target}')
print('660 isolated Kokoro form clips generated from 220 table clips')
