#!/usr/bin/env python3
"""Restore Chinese answer labels from manuals 33–55 without changing saved IDs."""

import importlib.util
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('polysemy_import', Path(__file__).with_name('import-polysemy-selected.py'))
parser = importlib.util.module_from_spec(spec)
spec.loader.exec_module(parser)
WORDS = ['final', 'problem', 'place', 'challenge', 'office', 'travel', 'focus',
         'overall', 'company', 'spend', 'real', 'attract', 'reason', 'escape',
         'quality', 'effective', 'make', 'hard', 'feel', 'noise', 'soon', 'seem', 'stay']
TRANSLATIONS = {
    'office-12-0': '我們在售票處買了門票。',
    'office-12-1': '這部電影的票房表現很好。',
}


def main():
    updated = 0
    for word in WORDS:
        path = ROOT / 'polysemy-lab/content' / f'{word}.mjs'
        raw = path.read_text()
        module = json.loads(raw[len('export default '):].rstrip(' ;\n'))
        pdf = ROOT / 'polysemy-lab/manuals' / f'{word}.pdf'
        text = subprocess.check_output([parser.PDTOTEXT, '-raw', pdf, '-'], text=True).replace('\f', '\n')
        lines = [line.strip() for line in text.splitlines()]
        headings = parser.sections(lines)
        sections = []
        for index, (start, body_start, form, title) in enumerate(headings):
            end = headings[index + 1][0] if index + 1 < len(headings) else len(lines)
            sections.append((form, title, parser.clean(' '.join(lines[body_start:end]))))
        for sense in module['senses']:
            first = sense['examples'][0][0] if sense['examples'] else ''
            matches = [(form, title) for form, title, body in sections if first and first in body]
            if not matches:
                raise ValueError(f'Cannot match {sense["id"]} to PDF heading')
            form, title = matches[0]
            sense.update(title=title, form=form, zh=title,
                         note=f'留意語境：{form}。這裡指「{title}」。')
            sense['examples'] = [[en, parser.clean(zh), title] for en, zh, *_ in sense['examples']]
            updated += 1
        by_id = {sense['id']: sense for sense in module['senses']}
        # An exercise can use two source meanings with the same brief Chinese
        # label. Add a clear, stable use number so buttons remain distinct.
        labels = [sense['title'] for sense in module['senses']]
        for index, sense in enumerate(module['senses']):
            if labels.count(sense['title']) > 1:
                sense['title'] += f'（用法 {index + 1}）'
        for question in module['questions']:
            question['zh'] = TRANSLATIONS.get(question['id'], parser.clean(question['zh']))
            if not parser.CHINESE.search(question['zh']):
                raise ValueError(f'Missing Chinese translation: {question["id"]}')
            question['explanation'] = by_id[question['sense']]['note']
            question['optionReasons'] = {
                oid: (f'本句的意思是「{by_id[oid]["title"]}」。' if oid == question['sense']
                      else f'「{by_id[oid]["title"]}」與本句語境不同。')
                for oid in question['options']
            }
        path.write_text('export default ' + json.dumps(module, ensure_ascii=False, indent=2) + ';\n')
    print(f'Restored Chinese labels for {updated} meanings across {len(WORDS)} modules.')


if __name__ == '__main__':
    main()
