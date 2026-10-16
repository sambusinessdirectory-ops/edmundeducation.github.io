"""Identity/cache/phoneme-flow checks; actual G2P is opt-in, never a hearing claim."""
import importlib.util
import json
import os
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('bulk_audio', HERE / 'audio.py')
audio = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audio)
BAD = 'kˈɜːvɪbˌɔːl'

def clip(text='A curveball.', role='speaking'):
    voice, lang, speed = audio.SETTINGS[role]
    return {'moduleId': 'test', 'role': role, 'text': text, 'voice': voice,
            'lang': lang, 'speed': speed,
            **({'pronunciationOverrideVersion': audio.pronunciation_version(text)}
               if audio.pronunciation_version(text) else {})}

class FakeSynth:
    def __init__(self, phonemes):
        self.phonemes, self.phonemizer_calls, self.create_calls = phonemes, [], []
        self.tokenizer = self

    def phonemize(self, text, lang):
        self.phonemizer_calls.append((text, lang))
        return self.phonemes

    def create(self, text, **kwargs):
        self.create_calls.append((text, kwargs))
        return b'fake-samples', 24000

class PronunciationTests(unittest.TestCase):
    def test_model_configuration_is_explicit_and_deferred(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(ValueError, '--model or set ADVANCED_NATIVE_KOKORO_MODEL'):
                audio.resolve_synth_paths()
            model = Path('approved-models/kokoro-v1.0.onnx')
            self.assertEqual(audio.resolve_synth_paths(model),
                             (model, model.with_name('voices-v1.0.bin')))
            with self.assertRaisesRegex(ValueError, 'Pinned Kokoro file not found'):
                audio.create_synth(Path('missing-model-directory/kokoro-v1.0.onnx'))
        with patch.dict(os.environ, {'ADVANCED_NATIVE_KOKORO_MODEL': 'environment/model.onnx',
                                    'ADVANCED_NATIVE_KOKORO_VOICES': 'environment/voices.bin'}):
            self.assertEqual(audio.resolve_synth_paths(),
                             (Path('environment/model.onnx'), Path('environment/voices.bin')))
            self.assertEqual(audio.resolve_synth_paths('explicit/model.onnx', 'explicit/voices.bin'),
                             (Path('explicit/model.onnx'), Path('explicit/voices.bin')))

    def test_pinned_roles_and_hashes(self):
        self.assertEqual(audio.SETTINGS, {'listening': ('af_heart', 'en-us', .96),
            'speaking': ('bm_fable', 'en-gb', .98), 'takeaway-1': ('bm_fable', 'en-gb', .98),
            'takeaway-2': ('bf_isabella', 'en-gb', 1.05)})
        self.assertEqual(audio.EXPECTED_MODEL, '7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5')
        self.assertEqual(audio.EXPECTED_VOICES, 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d')

    def test_exact_lexemes_and_boundaries(self):
        for text in ('curveball', 'CURVEBALLS', 'a curveball-like surprise', 'écurveball'):
            self.assertEqual(audio.pronunciation_version(text), 'curveball-lexeme-v1')
        for text in ('curve ball', 'curvable', 'curveballish', 'precurveballs', 'ordinary text'):
            self.assertIsNone(audio.pronunciation_version(text))
        before = 'ɐ ' + BAD + ' and tˈuː ' + BAD + 'z.'
        for lang in ('en-us', 'en-gb'):
            after, record = audio.correct_pronunciation('A curveball and two CURVEBALLS.', lang, before)
            rules = audio.PRONUNCIATION_CONFIG['languages'][lang]
            self.assertEqual(after, 'ɐ ' + rules['curveball']['after'] + ' and tˈuː ' + rules['curveballs']['after'] + '.')
            self.assertEqual(record['phonemesBefore'], before)
            self.assertEqual(sum(r['count'] for r in record['replacements']), 2)

    def test_fail_closed_on_changed_or_ambiguous_g2p(self):
        for text, phonemes in [('curveball', 'kˈɜːvbˌɔːl'),
                               ('curveball curveball', BAD),
                               ('curveball', BAD + ' ' + BAD),
                               ('curveballs', BAD),
                               ('curveball', 'x' + BAD)]:
            with self.subTest(text=text, phonemes=phonemes), self.assertRaisesRegex(ValueError, 'count mismatch'):
                audio.correct_pronunciation(text, 'en-gb', phonemes)

    def test_fake_synth_uses_full_tokenizer_then_explicit_phonemes(self):
        for role in audio.SETTINGS:
            request = clip('A curveball.', role)
            fake = FakeSynth('ɐ ' + BAD + '.')
            samples, rate, record = audio.synthesize_clip(fake, request)
            self.assertEqual((samples, rate), (b'fake-samples', 24000))
            self.assertEqual(fake.phonemizer_calls, [(request['text'], request['lang'])])
            kwargs = fake.create_calls[0][1]
            self.assertEqual(kwargs, {k: request[k] for k in ('voice', 'lang', 'speed')} | {'is_phonemes': True})
            self.assertEqual(fake.create_calls[0][0], record['pronunciation']['phonemesAfter'])
            audio.validate_pronunciation_record(request, {**request, **record})
            with self.assertRaisesRegex(ValueError, 'voice pins'):
                audio.validate_pronunciation_record(request, {**request, **record, 'voice': 'am_adam'})
            with self.assertRaises(ValueError):
                audio.validate_pronunciation_record(request, {**request})
        ordinary = clip('An ordinary sentence.')
        fake = FakeSynth('unused')
        _, _, record = audio.synthesize_clip(fake, ordinary)
        self.assertEqual(fake.phonemizer_calls, [])
        self.assertEqual(fake.create_calls, [(ordinary['text'], {k: ordinary[k] for k in ('voice', 'speed', 'lang')})])
        self.assertEqual(record, {})

    def test_queue_version_is_mandatory_and_legacy_cannot_rekey(self):
        request = clip()
        audio.validate_clip({**request, 'synthesisKey': audio.identity(request)})
        del request['pronunciationOverrideVersion']
        with self.assertRaisesRegex(ValueError, 'pronunciation version mismatch'):
            audio.validate_clip(request)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'old.mp3'
            source.write_bytes(b'old-unfixed-audio')
            ordinary = root / 'ordinary.mp3'
            ordinary.write_bytes(b'ordinary-legacy-audio')
            metadata = root / 'natural-english/audio/advanced-metadata.json'
            metadata.parent.mkdir(parents=True)
            metadata.write_text(json.dumps({'test': [{'text': 'A curveball.', 'voice': 'af_heart',
                'path': 'old.mp3', 'sha256': audio.digest_file(source)}],
                'ordinary': [{'text': 'An ordinary sentence.', 'voice': 'af_heart',
                    'path': 'ordinary.mp3', 'sha256': audio.digest_file(ordinary)}]}))
            original = audio.REPO
            try:
                audio.REPO = root
                expected = audio.identity(clip('An ordinary sentence.', 'listening'))
                self.assertEqual(audio.legacy_cache(), {expected: ordinary})
            finally:
                audio.REPO = original

    @unittest.skipUnless(os.getenv('ADVANCED_TEST_ACTUAL_G2P') == '1', 'Enable the pinned tokenizer integration explicitly.')
    def test_actual_pinned_g2p_all_four_roles(self):
        from kokoro_onnx.tokenizer import Tokenizer
        tokenizer = Tokenizer()
        texts = [
            'The archive project threw us two curveballs: the reader we had booked was suddenly unavailable, and a box arrived with letters we had not known existed; we paused the programme to agree what needed a new decision.',
            'Life threw us a curveball, so we checked what had changed before deciding which part of the plan to revise.',
            'The unexpected question threw the panel a curveball, and they asked for a moment to check the figures.',
            'The missing translation threw us a curveball, but we agreed which sections could wait while we contacted the translator.'
        ]
        evidence = []
        for role, text in zip(audio.SETTINGS, texts):
            request = clip(text, role)
            before = tokenizer.phonemize(text, request['lang'])
            after, trace = audio.correct_pronunciation(text, request['lang'], before)
            fake = FakeSynth(before)
            audio.synthesize_clip(fake, request)
            self.assertEqual(fake.create_calls[0][0], after)
            self.assertNotIn(BAD, after)
            evidence.append({'role': role, 'lang': request['lang'], 'text': text, **trace})
        if os.getenv('ADVANCED_G2P_TEST_REPORT'):
            Path(os.environ['ADVANCED_G2P_TEST_REPORT']).write_text(json.dumps({
                'scope': 'Actual pinned tokenizer + fake synthesis flow only; no real audio or hearing approval.',
                'roles': evidence}, ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    unittest.main()
