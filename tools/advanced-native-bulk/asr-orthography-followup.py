"""Bounded follow-up comparison only; original ASR reports stay unchanged."""
import importlib.util
import re
from pathlib import Path

spec = importlib.util.spec_from_file_location('original_asr', Path(__file__).with_name('verify-audio-transcript.py'))
original = importlib.util.module_from_spec(spec)
spec.loader.exec_module(original)


def words(text):
    # Explicit compound/number representations only. Never collapse tense,
    # negation, names, or homophones to make a recording look correct.
    for pattern, replacement in [
        (r'\bback-breaking\b', 'backbreaking'),
        (r'\btech-minded\b', 'techminded'),
        (r'\bhead[ -]first\b', 'headfirst'),
        (r'\b(?:fifty-fifty|50-50)\b', 'fiftyfifty'),
    ]:
        text = re.sub(pattern, replacement, text, flags=re.I)
    return original.words(text)


def compare(expected, actual, targets=()):
    left, right = words(expected), words(actual)
    edits = original.distance(left, right)
    missing = []
    for target in targets:
        tokens = words(target)
        if tokens and not any(right[i:i + len(tokens)] == tokens for i in range(len(right) - len(tokens) + 1)):
            missing.append(target)
    return {'expectedWords': len(left), 'wordEdits': edits,
            'wordErrorRate': round(edits / max(1, len(left)), 4),
            'targetPhrasesNotRecognised': missing,
            'reviewFlag': bool(missing) or edits / max(1, len(left)) > .15,
            'remainingLexicalDifference': edits > 0}
