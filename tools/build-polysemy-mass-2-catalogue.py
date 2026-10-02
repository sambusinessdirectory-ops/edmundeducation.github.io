#!/usr/bin/env python3
"""Build idempotent server catalogue data for Polysemy Mass Export 2."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'polysemy-lab/import-report-2.json'


def quote(value):
    return "'" + value.replace("'", "''") + "'"


def row(item):
    path = ROOT / 'polysemy-lab/content' / (item['word'] + '.mjs')
    module = json.loads(path.read_text().removeprefix('export default ').removesuffix(';\n'))
    senses = [sense['id'] for sense in module['senses']]
    questions = {q['id']: {'answer': q['correctOption'], 'options': q['options']}
                 for q in module['questions']}
    assert len(questions) == len(module['questions'])
    assert all(value['answer'] in senses and all(option in senses for option in value['options'])
               for value in questions.values())
    values = (module['id'],
              json.dumps(senses, ensure_ascii=False, separators=(',', ':')),
              json.dumps(questions, ensure_ascii=False, separators=(',', ':')))
    return '(' + ','.join(quote(value) + ('::jsonb' if i else '')
                        for i, value in enumerate(values)) + ')'


def sql(items):
    if not items:
        return 'select 0 as imported;'
    return ('insert into polysemy_private.catalogue(module,senses,questions) values\n' +
            ',\n'.join(row(item) for item in items) +
            '\non conflict (module) do update set senses=excluded.senses, questions=excluded.questions;')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--batch-start', type=int)
    parser.add_argument('--batch-size', type=int, default=20)
    parser.add_argument('--write-migration', action='store_true')
    args = parser.parse_args()
    items = json.loads(REPORT.read_text())['imported']
    if args.write_migration:
        path = ROOT / 'supabase/migrations/20261003010000_polysemy_mass_2_catalogue.sql'
        path.write_text('-- Polysemy Mass Export 2; each option comes from the PDF master table.\n' +
                        '\n'.join(sql(items[i:i + args.batch_size])
                                  for i in range(0, len(items), args.batch_size)) + '\n')
        print(path)
    elif args.batch_start is not None:
        print(sql(items[args.batch_start:args.batch_start + args.batch_size]))
    else:
        print(f'{len(items)} modules')


if __name__ == '__main__':
    main()
