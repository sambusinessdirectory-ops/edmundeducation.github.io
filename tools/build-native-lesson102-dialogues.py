#!/usr/bin/env python3
"""Render lesson 102's two dialogues with alternating established site voices."""

import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro


ROOT = Path(__file__).resolve().parents[1]
MODEL_HASH = '7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5'
VOICES_HASH = 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d'
SPEAKERS = {
    'A': ('af_heart', 0.96, 'en-us'),
    'B': ('bm_fable', 0.98, 'en-gb'),
}
DIALOGUES = [
    ('How have you been? Can’t complain. How about you? Pretty good.', [
        ('A', 'How have you been?'),
        ('B', "Can't complain. How about you?"),
        ('A', 'Pretty good.'),
    ]),
    ('Hey! How have you been? Can’t complain. How about you? Pretty good. Just busy with work.', [
        ('A', 'Hey! How have you been?'),
        ('B', "Can't complain. How about you?"),
        ('A', 'Pretty good. Just busy with work.'),
    ]),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=Path, required=True)
    parser.add_argument('--voices', type=Path, required=True)
    args = parser.parse_args()
    for path, expected in ((args.model, MODEL_HASH), (args.voices, VOICES_HASH)):
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise RuntimeError(f'Voice asset does not match the established site recipe: {path}')

    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    model = Kokoro.from_session(
        ort.InferenceSession(str(args.model), sess_options=options, providers=['CPUExecutionProvider']),
        str(args.voices),
    )
    output_dir = ROOT / 'natural-english/audio/imported'
    metadata_path = ROOT / 'natural-english/audio/imported-metadata.json'
    manifest_path = ROOT / 'natural-english/audio/imported-manifest.mjs'
    metadata = json.loads(metadata_path.read_text())
    manifest = json.loads(manifest_path.read_text().removeprefix('export default ').removesuffix(';\n'))

    for row_index, (transcript, turns) in zip((1, 3), DIALOGUES):
        row = metadata['native-102'][row_index]
        if row['text'] != transcript:
            raise RuntimeError(f'Lesson 102 transcript changed for row {row_index}')
        recipe = json.dumps({'turns': turns, 'speakers': SPEAKERS, 'pause': 0.27}, sort_keys=True)
        digest = hashlib.sha256(recipe.encode()).hexdigest()[:16]
        destination = output_dir / f'native-102-{row_index + 1:02}-two-voices-{digest}.mp3'
        if not destination.exists():
            clips = []
            rate = None
            for speaker, line in turns:
                voice, speed, lang = SPEAKERS[speaker]
                samples, clip_rate = model.create(line, voice=voice, speed=speed, lang=lang)
                if rate is not None and clip_rate != rate:
                    raise RuntimeError('Dialogue voices produced different sample rates')
                rate = clip_rate
                clips.append(np.asarray(samples, dtype=np.float32))
                clips.append(np.zeros(round(rate * 0.27), dtype=np.float32))
            with tempfile.TemporaryDirectory(prefix='native-102-dialogue-') as temp:
                wav = Path(temp) / 'dialogue.wav'
                sf.write(wav, np.concatenate(clips[:-1]), rate)
                subprocess.run([
                    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(wav),
                    '-codec:a', 'libmp3lame', '-b:a', '96k', '-y', str(destination),
                ], check=True)
        duration = float(subprocess.check_output([
            'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1', str(destination),
        ], text=True))
        if duration < 3 or destination.stat().st_size < 3000:
            raise RuntimeError(f'Two-speaker dialogue is unexpectedly short: {destination}')
        row.update(
            path=str(destination.relative_to(ROOT)),
            duration=round(duration, 3),
            sha256=hashlib.sha256(destination.read_bytes()).hexdigest(),
            voice='american-female+british-male',
            model='Kokoro alternating speakers',
        )
        manifest['native-102'][transcript] = row['path']
        print(f'{destination.name}: {duration:.2f}s')

    metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, separators=(',', ':')) + '\n')
    manifest_path.write_text('export default ' + json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + ';\n')


if __name__ == '__main__':
    main()
