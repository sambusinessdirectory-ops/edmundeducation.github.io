import importlib.util
import math
from pathlib import Path
spec=importlib.util.spec_from_file_location('signal_audit',Path(__file__).with_name('verify-audio-signal.py'))
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
for samples in ([],[0.]*16000,[float('nan')]*16,[1e-6]*16000):
    try:module.analyse(samples)
    except ValueError:pass
    else:raise AssertionError('Invalid/silent samples accepted.')
metrics=module.analyse([.1*math.sin(2*math.pi*220*i/16000) for i in range(16000)])
assert metrics['decodedSeconds']==1
assert -24<metrics['rmsDbfs']<-22
assert metrics['audibleFraction']>.9
print('Audible-signal checks reject silence/non-finite output without claiming language review.')
