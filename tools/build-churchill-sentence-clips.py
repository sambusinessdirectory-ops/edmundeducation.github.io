#!/usr/bin/env python3
"""Cut independently playable sentence clips from the validated 24 kHz v2 master WAV."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, required=True, help='Exact v2 master WAV')
parser.add_argument('--timing', type=Path, required=True, help='221-line timing map')
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
master, rate = sf.read(args.source, dtype='float32')
assert rate == 24000 and master.ndim == 1
map_data = json.loads(args.timing.read_text())
assert len(map_data['lines']) == 221 and abs(len(master) / rate - map_data['duration']) < .1
args.output.mkdir(parents=True, exist_ok=True)
records = []
for cue in map_data['lines']:
    line = cue['line']
    start = max(0.0, cue['start'] - .02)
    end = min(cue['end'] - .012, max(cue['start'] + .26, cue['spoken_end'] + .3))
    assert end > start + .1, (line, start, end)
    audio = master[round(start * rate):round(end * rate)].copy()
    fade_in = min(len(audio) // 4, round(.008 * rate))
    fade_out = min(len(audio) // 4, round((.055 if end - cue['spoken_end'] > .08 else .025) * rate))
    audio[:fade_in] *= np.linspace(0, 1, fade_in, dtype=np.float32)
    audio[-fade_out:] *= np.linspace(1, 0, fade_out, dtype=np.float32)
    name = f'{line:03d}.mp3'
    destination = args.output / name
    subprocess.run([
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
        '-f', 'f32le', '-ar', str(rate), '-ac', '1', '-i', 'pipe:0',
        '-codec:a', 'libmp3lame', '-b:a', '128k',
        '-metadata', f'title=The Council of Europe, 1949 - AI sentence {line:03d}',
        '-metadata', 'comment=AI-generated reconstruction; not an authentic 1949 recording',
        str(destination)
    ], input=audio.astype('<f4').tobytes(), check=True)
    records.append({'line': line, 'file': name, 'source_start': round(start, 3), 'source_end': round(end, 3),
                    'duration': round(len(audio) / rate, 3), 'bytes': destination.stat().st_size,
                    'sha256': hashlib.sha256(destination.read_bytes()).hexdigest()})
manifest = {'version': map_data['version'], 'source_audio_sha256': map_data['audio_sha256'],
            'source_master_wav_sha256': hashlib.sha256(args.source.read_bytes()).hexdigest(),
            'clips': records}
(args.output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n')
print(f'Built {len(records)} sentence clips, {sum(row["bytes"] for row in records):,} MP3 bytes')
