import importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('audio_transcript',Path(__file__).with_name('verify-audio-transcript.py'))
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
assert module.words('a badge of honour')==module.words('a badge of honor')
assert module.words('savoured the essay')==module.words('savored the essay')
assert module.words('a liveable space')==module.words('a livable space')
assert module.words('hard-wired preferences')==module.words('hardwired preferences')
assert module.words('an instant mood-lifter')==module.words('an instant mood lifter')
assert module.words('regular check-ups')==module.words('regular checkups')
assert module.words('a rear-view mirror')==module.words('a rearview mirror')
assert module.words('grey around the edges')==module.words('gray around the edges')
assert module.words('a fixed annual programme')==module.words('a fixed annual program')
assert module.words('a snap judgment')==module.words('a snap judgement')
assert module.words('the least room to manoeuvre')==module.words('the least room to maneuver')
assert module.words('everyday life became harder')==module.words('every day life became harder')
assert module.words('every day')!=module.words('everyday')
assert module.words('a curveball and two curveballs')==module.words('a curve ball and two curve balls')
for left,right in [('peace','piece'),('root','route'),('won','one'),('dropped','drop'),('needs','nades'),('breathed','breezed'),('hard-won','hard one')]:
    assert module.words(left)!=module.words(right), (left,right)
assert module.compare('We kept the peace.','We kept the piece.',['kept the peace'])['reviewFlag']
assert not module.compare('a badge of honour','a badge of honor',['a badge of honour'])['reviewFlag']
print('PASS ASR orthography comparison preserves homophone and tense review flags; no accent approval.')
