#!/usr/bin/env python3
"""Resumable pinned-Kokoro production. Does not certify listening review or upload assets."""
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
EXPECTED_MODEL = '7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5'
EXPECTED_VOICES = 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d'
SETTINGS = {
 'listening': ('af_heart', 'en-us', .96),
 'speaking': ('bm_fable', 'en-gb', .98),
 'takeaway-1': ('bm_fable', 'en-gb', .98),
 'takeaway-2': ('bf_isabella', 'en-gb', 1.05),
}
PRONUNCIATION_CONFIG = json.loads(Path(__file__).with_name('pronunciation-overrides.json').read_text())
# ASCII word boundaries intentionally match JavaScript /\bcurveballs?\b/i.
PRONUNCIATION_PATTERN = re.compile(PRONUNCIATION_CONFIG['textPattern'], re.IGNORECASE | re.ASCII)

def pronunciation_version(text):
    return PRONUNCIATION_CONFIG['version'] if PRONUNCIATION_PATTERN.search(text) else None

def correct_pronunciation(text, lang, phonemes):
    """Correct exact G2P lexemes; refuse missing/extra matches instead of guessing."""
    version = pronunciation_version(text)
    if not version:
        return phonemes, None
    rules = PRONUNCIATION_CONFIG['languages'].get(lang)
    if not rules:
        raise ValueError(f'No pronunciation override for {lang}')
    counts = {}
    for match in PRONUNCIATION_PATTERN.finditer(text):
        word = match.group().lower()
        counts[word] = counts.get(word, 0) + 1
    before, replacements = phonemes, []
    # Match complete phoneme tokens, not a substring of another word. Punctuation
    # remains in the full sentence supplied to the pinned tokenizer.
    separators = re.escape(PRONUNCIATION_CONFIG['phonemeSeparators'])
    for word, count in sorted(counts.items()):
        rule = rules[word]
        pattern = re.compile(r'(?<![^' + separators + '])' + re.escape(rule['before']) + r'(?=$|[' + separators + '])')
        found = len(pattern.findall(phonemes))
        if found != count:
            raise ValueError(f'Pronunciation override count mismatch for {word}: expected {count}, found {found}')
        phonemes = pattern.sub(lambda _: rule['after'], phonemes)
        replacements.append({'lexeme': word, 'count': count, **rule})
    return phonemes, {'version': version, 'phonemesBefore': before,
                      'phonemesAfter': phonemes, 'replacements': replacements}

def synthesize_clip(synth, clip):
    """Only affected clips use explicit phonemes; all other synthesis stays exact."""
    settings = {name: clip[name] for name in ('voice', 'speed', 'lang')}
    version = pronunciation_version(clip['text'])
    if not version:
        samples, rate = synth.create(clip['text'], **settings)
        return samples, rate, {}
    before = synth.tokenizer.phonemize(clip['text'], clip['lang'])
    after, evidence = correct_pronunciation(clip['text'], clip['lang'], before)
    samples, rate = synth.create(after, is_phonemes=True, **settings)
    return samples, rate, {'pronunciationOverrideVersion': version, 'pronunciation': evidence}

def validate_pronunciation_record(clip, record):
    version = pronunciation_version(clip['text'])
    if not version:
        return
    if any(record.get(name) != clip[name] for name in ('text', 'voice', 'lang', 'speed')):
        raise ValueError('Saved pronunciation record does not match the requested text and voice pins.')
    evidence = record.get('pronunciation', {})
    if record.get('pronunciationOverrideVersion') != version or evidence.get('version') != version:
        raise ValueError('Required pronunciation version is absent from the saved production record.')
    before = evidence.get('phonemesBefore')
    if not isinstance(before, str):
        raise ValueError('Saved pronunciation evidence is missing the original phonemes.')
    after, expected = correct_pronunciation(clip['text'], clip['lang'], before)
    if evidence != expected or after == before:
        raise ValueError('Saved pronunciation evidence differs from the required exact lexeme correction.')

def digest_file(filename):
    result = hashlib.sha256()
    with open(filename, 'rb') as stream:
        for chunk in iter(lambda: stream.read(1024*1024), b''):
            result.update(chunk)
    return result.hexdigest()

def identity(clip):
    key = {name: clip[name] for name in ('text', 'voice', 'lang', 'speed')}
    key['v'] = 1
    version = pronunciation_version(clip['text'])
    if version:
        key['pronunciationOverrideVersion'] = version
    return hashlib.sha256(json.dumps(key, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

def atomic_json(filename, data):
    filename.parent.mkdir(parents=True, exist_ok=True)
    temporary = filename.with_suffix(filename.suffix + '.tmp')
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, filename)

def probe(filename):
    duration = float(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', str(filename)], text=True))
    size = filename.stat().st_size
    if duration < .35 or size < 1800:
        raise ValueError(f'Invalid audio duration/size: {filename}')
    return {'duration': round(duration, 3), 'bytes': size, 'sha256': digest_file(filename)}

def validate_clip(clip):
    if not isinstance(clip.get('text'), str) or not clip['text'].strip() or len(clip['text']) > 240 or '_' in clip['text'] or '<' in clip['text']:
        raise ValueError(f'Invalid audio text for {clip.get("moduleId")}')
    if (clip.get('voice'), clip.get('lang'), clip.get('speed')) != SETTINGS.get(clip.get('role')):
        raise ValueError(f'Unapproved voice settings: {clip.get("moduleId")} {clip.get("role")}')
    if clip.get('pronunciationOverrideVersion') != pronunciation_version(clip['text']):
        raise ValueError(f'Audio queue pronunciation version mismatch: {clip.get("moduleId")} {clip.get("role")}')
    calculated = identity(clip)
    if clip.get('synthesisKey') and clip['synthesisKey'] != calculated:
        raise ValueError(f'Audio queue identity mismatch: {clip.get("moduleId")} {clip.get("role")}')
    return calculated

def legacy_cache():
    metadata_path = REPO / 'natural-english/audio/advanced-metadata.json'
    if not metadata_path.exists():
        return {}
    result = {}
    for module, rows in json.loads(metadata_path.read_text()).items():
        for index, row in enumerate(rows):
            role = list(SETTINGS)[index % 4]
            voice, lang, speed = SETTINGS[role]
            if row.get('voice') != voice:
                continue
            # Old metadata never proves this lexeme was corrected. Do not map an
            # unfixed legacy file into the new versioned synthesis identity.
            if pronunciation_version(row['text']):
                continue
            source = REPO / row['path']
            if source.is_file() and digest_file(source) == row.get('sha256'):
                result[identity({'text': row['text'], 'voice': voice, 'lang': lang, 'speed': speed})] = source
    return result

def resolve_synth_paths(model=None, voices=None):
    """Resolve configuration lazily so verification/cache-only runs need no model."""
    model = model or os.environ.get('ADVANCED_NATIVE_KOKORO_MODEL')
    if not model:
        raise ValueError('Kokoro model is not configured. Pass --model or set '
                         'ADVANCED_NATIVE_KOKORO_MODEL to the approved kokoro-v1.0.onnx file. '
                         'Verification and exact-cache reuse do not require a model.')
    model = Path(model).expanduser()
    voices = voices or os.environ.get('ADVANCED_NATIVE_KOKORO_VOICES')
    return model, Path(voices).expanduser() if voices else model.with_name('voices-v1.0.bin')

def create_synth(model=None, voices=None):
    model, voices = resolve_synth_paths(model, voices)
    for filename, expected in ((model, EXPECTED_MODEL), (voices, EXPECTED_VOICES)):
        if not filename.is_file():
            raise ValueError(f'Pinned Kokoro file not found: {filename}. '
                             'Check --model/--voices or ADVANCED_NATIVE_KOKORO_MODEL/'
                             'ADVANCED_NATIVE_KOKORO_VOICES.')
        if digest_file(filename) != expected:
            raise ValueError(f'Pinned model checksum mismatch: {filename}')
    import onnxruntime as ort
    from kokoro_onnx import Kokoro
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    return Kokoro.from_session(ort.InferenceSession(str(model), sess_options=options,
                              providers=['CPUExecutionProvider']), str(voices))

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('queue', type=Path)
    parser.add_argument('--audio-dir', required=True, type=Path)
    parser.add_argument('--state-dir', required=True, type=Path)
    parser.add_argument('--asset-prefix', default='natural-english/audio/advanced-bulk/')
    parser.add_argument('--model', type=Path,
                        help='Pinned Kokoro model; defaults to ADVANCED_NATIVE_KOKORO_MODEL.')
    parser.add_argument('--voices', type=Path,
                        help='Pinned voices file; defaults to ADVANCED_NATIVE_KOKORO_VOICES '
                             'or voices-v1.0.bin beside the configured model.')
    parser.add_argument('--limit', type=int, help='Maximum missing clips synthesized on this invocation.')
    parser.add_argument('--verify-only', action='store_true')
    args = parser.parse_args()
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        raise SystemExit('ffmpeg and ffprobe are required.')
    queue = json.loads(args.queue.read_text())
    identities = [validate_clip(clip) for clip in queue]
    args.audio_dir.mkdir(parents=True, exist_ok=True)
    args.state_dir.mkdir(parents=True, exist_ok=True)
    cache = legacy_cache()
    synth = None
    produced = 0
    outcomes = {}
    for clip, key in zip(queue, identities):
        if key in outcomes:
            continue
        destination = args.audio_dir / (key + '.mp3')
        record_path = args.state_dir / (key + '.json')
        try:
            record = json.loads(record_path.read_text()) if record_path.exists() else None
            if destination.exists():
                verified = probe(destination)
                if record and record.get('sha256') != verified['sha256']:
                    raise ValueError('Audio file checksum differs from its saved production record.')
                if not record:
                    raise ValueError('Untracked existing audio file requires recovery/review before reuse.')
                validate_pronunciation_record(clip, record)
            elif args.verify_only:
                outcomes[key] = {'status': 'missing', 'text': clip['text']}
                continue
            elif key in cache:
                shutil.copy2(cache[key], destination)
                verified = probe(destination)
                record = {**clip, **verified, 'status': 'produced', 'method': 'legacy-exact-cache',
                          'listeningReview': 'not-newly-reviewed'}
                atomic_json(record_path, record)
            else:
                if args.limit is not None and produced >= args.limit:
                    outcomes[key] = {'status': 'pending', 'text': clip['text']}
                    continue
                if synth is None:
                    synth = create_synth(args.model, args.voices)
                import soundfile as sf
                with tempfile.TemporaryDirectory(prefix='advanced-native-audio-') as directory:
                    wav = Path(directory) / 'speech.wav'
                    encoded = Path(directory) / 'speech.mp3'
                    samples, rate, pronunciation = synthesize_clip(synth, clip)
                    sf.write(wav, samples, rate)
                    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(wav),
                                    '-af', 'adelay=180:all=1,apad=pad_dur=0.16', '-codec:a', 'libmp3lame',
                                    '-b:a', '64k', '-y', str(encoded)], check=True)
                    verified = probe(encoded)
                    shutil.copy2(encoded, destination)
                record = {**clip, **verified, 'status': 'produced', 'method': 'pinned-kokoro',
                          **pronunciation,
                          'modelSha256': EXPECTED_MODEL, 'voicesSha256': EXPECTED_VOICES,
                          'listeningReview': 'pending'}
                atomic_json(record_path, record)
                produced += 1
            outcomes[key] = {**record, 'status': 'verified-file', 'path': args.asset_prefix.rstrip('/') + '/' + destination.name}
            print(json.dumps({'key': key, 'moduleId': clip['moduleId'], 'role': clip['role'], 'status': 'verified-file'}, ensure_ascii=False), flush=True)
        except Exception as error:
            outcomes[key] = {'status': 'failed', 'error': str(error), 'moduleId': clip['moduleId'], 'role': clip['role']}
            atomic_json(args.state_dir / (key + '.error.json'), outcomes[key])
            print(json.dumps(outcomes[key], ensure_ascii=False), flush=True)
    manifest, metadata = {}, {}
    for clip, key in zip(queue, identities):
        result = outcomes[key]
        if result['status'] == 'verified-file':
            manifest.setdefault(clip['moduleId'], {})[clip['text']] = result['path']
            metadata.setdefault(clip['moduleId'], []).append({**result, 'role': clip['role']})
    summary = {'requests': len(queue), 'uniqueClips': len(outcomes), 'synthesizedThisRun': produced,
               'verified': sum(row['status'] == 'verified-file' for row in outcomes.values()),
               'failed': sum(row['status'] == 'failed' for row in outcomes.values()),
               'pending': sum(row['status'] in ('pending', 'missing') for row in outcomes.values()),
               'listeningReviewClaimed': False}
    atomic_json(args.state_dir / 'summary.json', summary)
    atomic_json(args.state_dir / 'manifest.json', manifest)
    atomic_json(args.state_dir / 'metadata.json', metadata)
    print(json.dumps(summary), flush=True)
    if summary['failed'] or (args.verify_only and summary['pending']):
        raise SystemExit(1)

if __name__ == '__main__':
    main()
