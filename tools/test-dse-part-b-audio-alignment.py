"""Regression for ASR numeral formatting; run in the TTS build environment."""
import importlib.util
import math
from pathlib import Path
from types import SimpleNamespace

spec=importlib.util.spec_from_file_location('dse_audio',Path(__file__).with_name('generate-dse-part-b-audio.py'))
audio=importlib.util.module_from_spec(spec);spec.loader.exec_module(audio)
normalize=audio.normalize_recognized_number
assert normalize(' 16.','Mary is only sixteen.')=='sixteen'
assert normalize('16','Mary is only 16.')=='16'
assert normalize('25','She is twenty-five years old.')=='twenty-five'
assert normalize('25','There are twenty five students.')=='twenty five'
assert normalize('20','There are twelve students.')=='20'
assert normalize('2','There are 2 players among two hundred people.')=='2'
assert normalize('16th','He came sixteenth.')=='16th'
assert normalize('2014','The event was held in 2014.')=='2014'
assert audio.normalize_recognized_token('2.','To: Jackie Lee')=='To'
assert audio.normalize_recognized_token('Jacky','To: Jackie Lee')=='Jackie'
assert audio.normalize_recognized_token('Jacky','Jacky and Jackie work together.')=='Jacky'
assert audio.normalize_recognized_token('Keto.','Kito.')=='Kito'
assert audio.normalize_recognized_token('Keto','Keto diets are popular.')=='Keto'
assert audio.normalize_recognized_token('Calvin.','It was Kelvin.')=='Kelvin'
assert audio.normalize_recognized_token('Calvin','Calvin and Kelvin arrived.')=='Calvin'
candidate=audio.SentenceRecognition([['16',1.5,1.9]],1,2,'sixteen')
segments,_=candidate.transcribe(None)
word=list(segments)[0].words[0]
assert word.word=='sixteen' and math.isclose(word.start,.5) and math.isclose(word.end,.9)
writer=audio.configure_writing_pronunciation(SimpleNamespace(spoken_text=lambda text:text))
assert writer.spoken_text('By Do-Re-Mi Magazine')=='By doh ray mee Magazine'
assert writer.spoken_text('Mary is only sixteen.')=='Mary is only sixteen.'
print('ASR number and name normalization preserves the displayed words and measured timestamps.')
