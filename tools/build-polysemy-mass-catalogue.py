#!/usr/bin/env python3
"""Build idempotent server catalogue rows for the audited mass import."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = json.loads((ROOT / 'polysemy-lab/import-report.json').read_text())


def quote(value):
    return "'" + value.replace("'", "''") + "'"


def row(item):
    path = ROOT / 'polysemy-lab/content' / (item['word'] + '.mjs')
    module = json.loads(path.read_text().removeprefix('export default ').removesuffix(';\n'))
    senses = [sense['id'] for sense in module['senses']]
    questions = {q['id']: {'answer': q['sense'], 'options': q['options']}
                 for q in module['questions']}
    assert len(questions) == len(module['questions'])
    assert all(value['answer'] in senses and all(option in senses for option in value['options'])
               for value in questions.values())
    return '(' + ','.join((quote(module['id']),
                         quote(json.dumps(senses, ensure_ascii=False, separators=(',', ':'))) + '::jsonb',
                         quote(json.dumps(questions, ensure_ascii=False, separators=(',', ':'))) + '::jsonb')) + ')'


def sql(items):
    if not items:
        return 'select 0 as imported;'
    return ('insert into polysemy_private.catalogue(module,senses,questions) values\n' +
            ',\n'.join(row(item) for item in items) +
            '\non conflict (module) do update set senses=excluded.senses, questions=excluded.questions;')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--batch-start', type=int)
    parser.add_argument('--batch-size', type=int, default=10)
    parser.add_argument('--write-migration', action='store_true')
    args = parser.parse_args()
    items = REPORT['imported']
    if args.write_migration:
        target = ROOT / 'supabase/migrations/20260929090000_polysemy_mass_catalogue.sql'
        target.write_text('-- Audited Polysemy PDF import. Safe to rerun.\n' +
                          '\n'.join(sql(items[start:start+args.batch_size])
                                    for start in range(0, len(items), args.batch_size)) + '\n')
        print(target)
    elif args.batch_start is not None:
        print(sql(items[args.batch_start:args.batch_start+args.batch_size]))
    else:
        print(f'{len(items)} modules')


if __name__ == '__main__':
    main()
