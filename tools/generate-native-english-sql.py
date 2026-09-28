#!/usr/bin/env python3
"""Generate the server-side answer catalogue for approved Native English PDFs."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'natural-english' / 'imported-lessons.json'
OUTPUT = ROOT / 'supabase' / 'migrations' / '20260928160000_natural_english_imported_lessons.sql'

def quote(value):
    return "'" + value.replace("'", "''") + "'"

def main():
    lessons = json.loads(DATA.read_text(encoding='utf-8'))
    values = []
    for lesson in lessons:
        questions = {question['id']: {
            'type': question['type'],
            'answers': question['answers'],
            'options': question.get('options', []),
        } for question in lesson['questions']}
        values.append('(' + ','.join((quote(lesson['id']),
            quote('["phrase","dialogue"]') + '::jsonb',
            quote(json.dumps(questions, ensure_ascii=False, separators=(',', ':'))) + '::jsonb')) + ')')
    previous=(ROOT/'supabase/migrations/20260918173500_natural_english_modules_2_6.sql').read_text()
    start=previous.index('create function natural_english_private.sync_modules')
    end=previous.index('\nrevoke all on function natural_english_private.sync_modules',start)
    sync_function=previous[start:end].replace('create function','create or replace function',1)
    old="lower(regexp_replace(trim(translate(e->>'choice','’','''')),'\\s+',' ','g'))=lower(translate(a,'’',''''))"
    new="natural_english_private.normalise_answer(e->>'choice')=natural_english_private.normalise_answer(a)"
    assert old in sync_function
    sync_function=sync_function.replace(old,new)
    OUTPUT.write_text('-- Source PDFs checked against natural-english/IMPORT-REVIEW.md.\n'
        "create function natural_english_private.normalise_answer(value text) returns text language sql immutable set search_path='' as $$select lower(regexp_replace(trim(regexp_replace(trim(translate(value,'’','''')),'[.!?]+$','')),'\\s+',' ','g'))$$;\n"
        +sync_function+'\n'
        'insert into natural_english_private.catalogue(module,senses,questions) values\n'
        + ',\n'.join(values) + '\n'
        'on conflict (module) do update set senses=excluded.senses,questions=excluded.questions;\n',encoding='utf-8')
    print(len(values), 'server modules written to', OUTPUT)

if __name__ == '__main__':
    main()
