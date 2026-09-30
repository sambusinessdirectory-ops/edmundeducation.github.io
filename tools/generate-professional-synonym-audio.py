"""Generate American female audio for every Lesson 5 synonym question sentence."""
import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent / 'professional-english'
parser = argparse.ArgumentParser()
parser.add_argument('--model', type=Path, required=True)
parser.add_argument('--voices', type=Path, required=True)
args = parser.parse_args()
MODEL = args.model
VOICES = args.voices
EXPECTED = {
    MODEL: '7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5',
    VOICES: 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d',
}
for path, expected in EXPECTED.items():
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise RuntimeError(f'Voice model does not match the established site recipe: {path}')
source = json.loads((ROOT / 'content/lesson-5-synonyms.json').read_text())
output = ROOT / 'audio/synonyms-v1'
output.mkdir(parents=True, exist_ok=True)
manifest_path = ROOT / 'content/lesson-5-synonym-audio.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
kokoro = Kokoro.from_session(ort.InferenceSession(str(MODEL), sess_options=options, providers=['CPUExecutionProvider']), str(VOICES))
recipe = {'engine': 'kokoro-onnx', 'voice': 'af_heart', 'lang': 'en-us', 'speed': .96}
for module in source['modules']:
    for question in module['questions']:
        key = f"{module['id']}:{question['id']}"
        sentence = question['original'].strip()
        digest = hashlib.sha256(json.dumps({'recipe': recipe, 'text': sentence}, sort_keys=True).encode()).hexdigest()
        path = output / f'{digest[:24]}.mp3'
        if not path.exists():
            samples, rate = kokoro.create(sentence, voice='af_heart', speed=.96, lang='en-us')
            with tempfile.TemporaryDirectory(prefix='synonym-voice-') as temp:
                wav = Path(temp) / 'sentence.wav'
                sf.write(wav, samples, rate)
                subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(wav), '-codec:a', 'libmp3lame', '-b:a', '112k', '-y', str(path)], check=True)
        duration = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(path)], text=True))
        manifest[key] = {'path': str(path.relative_to(ROOT)), 'voice': 'american-female', 'sourceSha256': hashlib.sha256(sentence.encode()).hexdigest(), 'recipeSha256': digest, 'duration': round(duration, 3)}
        print(f'{key} ready ({duration:.1f}s)', flush=True)
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Completed {len(manifest)} synonym question clips', flush=True)
