#!/usr/bin/env python3
"""Repair provably mismatched Polysemy MCQ keys from the original PDF sections.

Only source sections with one explicit Chinese ``form = definition`` line are
changed automatically.  The audit JSON is produced by the companion audit
pass; ambiguous source sections are deliberately left for editorial review.
"""
import argparse
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_module(path):
    raw = path.read_text()
    return json.loads(raw.removeprefix('export default ').removesuffix(';\n'))


def save_module(path, module):
    path.write_text('export default ' + json.dumps(module, ensure_ascii=False, indent=2) + ';\n')


def repair(audit_path, write=False):
    audit = json.loads(audit_path.read_text())
    patches = []
    summary = {'scannedModules': 0, 'scannedQuestions': 0, 'changedModules': 0,
               'changedQuestions': 0, 'newMeanings': 0,
               'ambiguousCandidates': 0, 'missingSourceSentence': 0}
    for row in audit['modules']:
        summary['scannedModules'] += 1
        summary['scannedQuestions'] += row['questions']
        issues = [i for i in row['issues'] if i['reason'] == 'answer_mismatch']
        summary['ambiguousCandidates'] += sum(len(i['definitions']) != 1 for i in issues)
        summary['missingSourceSentence'] += sum(i['reason'] != 'answer_mismatch' for i in row['issues'])
        certain = [i for i in issues if len(i['definitions']) == 1]
        if not certain:
            continue
        path = ROOT / 'polysemy-lab/content' / (row['id'] + '.mjs')
        module = load_module(path)
        if module.get('number', 0) < 8:
            # The seven hand-authored lessons use their original answer
            # structure and require separate editorial review.
            summary['ambiguousCandidates'] += len(certain)
            continue
        questions = {q['id']: q for q in module['questions']}
        current_senses = {s['id']: s for s in module['senses']}
        new_senses = {}
        changes = []
        for issue in certain:
            q = questions.get(issue['id'])
            if q is None:
                raise ValueError(f"Missing question {issue['id']}")
            old_id = q['correctOption']
            if old_id != issue['current_sense'] or old_id not in current_senses:
                raise ValueError(f"Stale answer {issue['id']}")
            meaning = issue['definitions'][0].strip('；。 |')
            section = issue['number']
            key = (section, issue['heading'], meaning)
            if key not in new_senses:
                sense_id = f"{module['id']}-pdf-{len(new_senses)+1:03d}"
                if sense_id in current_senses:
                    raise ValueError(f"Duplicate sense {sense_id}")
                new_senses[key] = {
                    'id': sense_id,
                    'title': meaning,
                    'form': issue['heading'],
                    'en': issue['heading'],
                    'zh': meaning,
                    'note': f'原始 PDF 第 {section} 節：{meaning}',
                    'examples': [],
                    'options': [],
                    'excludedOverlaps': []
                }
            new = new_senses[key]
            new_id = new['id']
            if old_id not in q['options']:
                raise ValueError(f"Old answer not in options {issue['id']}")
            old_options = list(q['options'])
            old_examples = current_senses[old_id].get('examples', [])
            current_senses[old_id]['examples'] = [
                example for example in old_examples
                if not (example and example[0] == q['en'] and len(example) > 1 and example[1] == q['zh'])
            ]
            q['options'] = [new_id if opt == old_id else opt for opt in old_options]
            q['sense'] = new_id
            q['correctOption'] = new_id
            target = q['targets'][0] if q.get('targets') else module['word']
            q['explanation'] = f'本句的「{target}」指「{meaning}」。'
            q['optionReasons'] = {
                (new_id if sid == old_id else sid):
                (f'本句指「{meaning}」。' if sid == old_id else reason)
                for sid, reason in q['optionReasons'].items()
            }
            new['examples'].append([q['en'], q['zh'], meaning])
            changes.append({'question': q['id'], 'sourceSection': section,
                            'sourceMeaning': meaning, 'oldSense': old_id,
                            'newSense': new_id, 'oldOptions': old_options,
                            'newOptions': list(q['options'])})
        module['senses'].extend(new_senses.values())
        if write:
            save_module(path, module)
        summary['changedModules'] += 1
        summary['changedQuestions'] += len(changes)
        summary['newMeanings'] += len(new_senses)
        patches.append({'module': module['id'], 'number': module['number'],
                        'oldSenseCount': len(module['senses'])-len(new_senses),
                        'newSenses': list(new_senses.values()), 'changes': changes})
    if write:
        index = []
        for path in (ROOT/'polysemy-lab/content').glob('*.mjs'):
            m = load_module(path)
            if not m.get('mass'):
                continue
            index.append({'id': m['id'], 'word': m['word'], 'number': m['number'], 'mass': True,
                          'senses': [{'id': s['id']} for s in m['senses']],
                          'questions': [{'id': q['id'], 'sense': q['sense'],
                                         'correctOption': q.get('correctOption'), 'en': q['en']}
                                        for q in m['questions']]})
        index.sort(key=lambda m: (m['number'], m['id']))
        (ROOT/'polysemy-lab/mass-index.mjs').write_text(
            'export default ' + json.dumps(index, ensure_ascii=False, separators=(',', ':')) + ';\n')
    report = {'summary': summary, 'patches': patches}
    (ROOT/'polysemy-lab/PDF-ANSWER-AUDIT.json').write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--audit', type=Path,
                        default=Path('/private/tmp/polysemy-source-audit.json'))
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    repair(args.audit, args.write)
