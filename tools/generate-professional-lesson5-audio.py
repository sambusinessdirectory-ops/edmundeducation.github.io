"""Generate Lesson 5 flashcard pronunciations with the established female Kokoro voice."""
import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

parser = argparse.ArgumentParser()
parser.add_argument('--model', type=Path, required=True)
parser.add_argument('--voices', type=Path, required=True)
args = parser.parse_args()
for path, expected in [
    (args.model, '7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5'),
    (args.voices, 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d'),
]:
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise ValueError(f'Unexpected voice model: {path}')

root = Path(__file__).resolve().parents[1] / 'professional-english'
cards = json.loads((root / 'content/lesson-5-flashcards.json').read_text())
recipe = json.loads((root / 'dialogues.json').read_text())['voiceRecipes']['american-female']
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
session = ort.InferenceSession(str(args.model), sess_options=options, providers=['CPUExecutionProvider'])
speaker = Kokoro.from_session(session, str(args.voices))
clips = {}
for index, card in enumerate(cards, 1):
    path = root / card['audio'].lstrip('/')
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        samples, rate = speaker.create(card['front'], voice=recipe['voice'], lang=recipe['lang'], speed=recipe['speed'])
        with tempfile.TemporaryDirectory(prefix='lesson5-voice-') as folder:
            wav = Path(folder) / 'clip.wav'
            sf.write(wav, samples, rate)
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-ac','1','-ar','24000','-q:a','3',str(path)], check=True)
    duration = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(path)], text=True))
    clips[card['id']] = {'path': card['audio'].lstrip('/'), 'sourceSha256': hashlib.sha256(card['front'].encode()).hexdigest(), 'duration': round(duration, 3)}
    if index % 10 == 0 or index == len(cards):
        print(f'flashcards {index}/{len(cards)}', flush=True)
(root / 'content/lesson-5-audio.json').write_text(json.dumps({'recipe':recipe,'modelSha256':hashlib.sha256(args.model.read_bytes()).hexdigest(),'voicesSha256':hashlib.sha256(args.voices.read_bytes()).hexdigest(),'clips':clips}, ensure_ascii=False, indent=2)+'\n')
