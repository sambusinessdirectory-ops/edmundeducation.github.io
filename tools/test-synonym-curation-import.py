#!/usr/bin/env python3
"""Regression checks for previously mis-imported synonym exercises."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def lesson(name):
    return json.loads((ROOT / 'synonyms/lessons' / (name + '.json')).read_text())


def exercise(data, word_order, number):
    word = next(word for word in data['words'] if word['order'] == word_order)
    return next(ex for ex in word['exercises'] if ex['number'] == number)


rather = lesson('lesson-src-bf621c2774a57c')
assert sum(len(word['exercises']) for word in rather['words']) == 21
assert not rather.get('reviewExercises')
last = exercise(rather, 7, 3)
assert last['answer'] == 'prefers reading the full report to relying only on the summary'
assert last['upgrade'].startswith('She prefers reading')

cases = lesson('lesson-src-abf30438c1d320')
assert not any('這句的決定性線索是' in option['explanation']
               for word in cases['words'] for ex in word['exercises']
               for option in ex['options'])
common = exercise(cases, 6, 1)
assert 'widespread prevalence is central' not in next(
    option['explanation'] for option in common['options'] if option['text'] == 'Commonly')
majority = exercise(cases, 8, 1)
assert '70%' in majority['original'] and '七成' in next(
    option['explanation'] for option in majority['options']
    if option['text'] == 'More often than not')

because = lesson('lesson-src-9d3d17db5e371c')
considering = exercise(because, 6, 1)
assert considering['upgrade'].startswith('The result was impressive considering that')
assert all('原始教材未提供' not in option['explanation']
           and option['explanation'] not in ('', '---', '語域：neutral / common')
           for option in considering['options'])

print('synonym curation import checks passed')
